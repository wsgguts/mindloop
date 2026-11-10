// ===================== Motor de áudio do MindLoop =====================
// Os efeitos são sintetizados na hora com a Web Audio API (osciladores, filtros e ruído), em vez de
// arquivos MP3/OGG: nada a baixar, nenhum atraso de carregamento na primeira jogada, ~0 KB no app e
// pequenas variações a cada toque (o som nunca fica idêntico, sem soar mecânico).
//
// Regras de comportamento:
// • Nada toca antes do primeiro toque/clique/tecla da pessoa (política de autoplay dos navegadores).
// • Com o som desligado, nenhum nó de áudio é criado (custo zero).
// • Cada evento tem um intervalo mínimo entre repetições e há um limite de vozes simultâneas;
//   sons importantes (vitória) abaixam suavemente os que ainda estão soando.
// • Com o app em segundo plano o contexto é suspenso; volta ao primeiro gesto (iOS/Android).

import { readStore, writeStore } from "../storage";
import { DEFAULT_SOUND, SOUND_KEY, type SoundSettings, gainFor, mergeSound, parseSound, serializeSound } from "./settings";

export type SfxEvent =
  | "select" // tocar/selecionar uma casa ou elemento
  | "place" // jogada válida
  | "erase" // limpar uma casa
  | "progress" // pequena conquista (número alcançado, sequência certa)
  | "complete" // linha, coluna, bloco ou peça concluída
  | "error" // jogada incorreta (discreto)
  | "undo" // desfazer / voltar um trecho
  | "hint" // dica
  | "win" // partida concluída
  | "celebrate" // tela de parabéns (fanfarra)
  | "burst" // cada fogo de artifício que estoura na tela de parabéns
  | "advance" // novo nível liberado na jornada
  | "ui" // abrir menus, tutoriais, avançar passos
  | "block"; // ação bloqueada ou limite atingido

export interface SfxOpts {
  /** 0–1: posição/progresso (ex.: quanto do caminho do Zip já foi feito). */
  pos?: number;
  /** Variante do som (ex.: símbolo do Tango, número do Sudoku). */
  v?: number;
  /** Quantidade (regiões fechadas de uma vez, peças na grade...). */
  count?: number;
  /** Duração da animação que o som acompanha (ms). */
  span?: number;
}

/** Ferramentas de síntese entregues aos temas (tudo já ligado à saída com volume, reverb e limites). */
export interface Synth {
  /** Tempo atual do relógio de áudio (s). */
  now: number;
  /** Nota MIDI → Hz, com uma variação mínima de afinação a cada som. */
  hz: (midi: number) => number;
  tone: (o: ToneOpts) => void;
  noise: (o: NoiseOpts) => void;
}
export interface ToneOpts {
  f: number; t?: number; dur: number; g: number;
  type?: OscillatorType;
  /** Ataque (s). */
  a?: number;
  /** Frequência final (deslize). */
  f2?: number;
  /** Filtro passa-baixa (Hz) e, opcionalmente, para onde ele fecha. */
  lp?: number; lp2?: number;
  /** Quanto vai para a reverberação (0–1). */
  send?: number;
  /** Desafinação estéreo leve entre 2 osciladores (cents) — engorda timbres de synth. */
  spread?: number;
}
export interface NoiseOpts { t?: number; dur: number; g: number; bp?: number; q?: number; hp?: number; send?: number }

export type Theme = Partial<Record<SfxEvent, (s: Synth, o: SfxOpts) => number | void>>;

// Intervalo mínimo entre dois sons do mesmo evento (ms): evita metralhadora ao arrastar ou repetir toques.
const MIN_GAP: Record<SfxEvent, number> = {
  select: 45, place: 40, erase: 60, progress: 90, complete: 140, error: 280, undo: 60, hint: 250, win: 1500, celebrate: 3000, burst: 140, advance: 800, ui: 90, block: 220,
};
// Prioridade: um som de prioridade alta abaixa os que estão tocando (não se acumulam por cima da vitória).
const PRIORITY: Partial<Record<SfxEvent, number>> = { win: 3, celebrate: 2, advance: 2, complete: 1 };
const MAX_VOICES = 6;

interface Voice { out: GainNode; end: number; prio: number }

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null; // entrada da cadeia: vozes → bus → compressor → master
let verbIn: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let gestured = false; // a pessoa já interagiu (pode tocar)
let installed = false;
let settings: SoundSettings = { ...DEFAULT_SOUND };
let loaded = false;
const voices: Voice[] = [];
const lastAt = new Map<string, number>();
const listeners = new Set<() => void>();

// ---------------------------------------------------------------- preferências

export function getSound(): SoundSettings {
  if (!loaded && typeof window !== "undefined") { settings = parseSound(readStore(SOUND_KEY)); loaded = true; }
  return settings;
}

export function setSound(patch: Partial<SoundSettings>): void {
  settings = mergeSound(getSound(), patch);
  writeStore(SOUND_KEY, serializeSound(settings));
  applyMaster();
  if (!settings.on) silenceAll();
  listeners.forEach((f) => f());
}

export function subscribeSound(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

function applyMaster() {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(gainFor(getSound()), ctx.currentTime, 0.03);
}

// ---------------------------------------------------------------- contexto e desbloqueio

function AudioCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

/** Resposta de sala curta e suave (gerada, sem arquivo): dá "ar" aos sons sem eco perceptível. */
function makeImpulse(c: AudioContext): AudioBuffer {
  const len = Math.floor(c.sampleRate * 1.1);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return buf;
}

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const C = AudioCtor();
  if (!C) return null;
  try {
    ctx = new C({ latencyHint: "interactive" });
  } catch {
    try { ctx = new C(); } catch { return null; }
  }
  const c = ctx;
  master = c.createGain();
  master.gain.value = gainFor(getSound());
  // Compressor suave: segura picos quando dois sons coincidem (nada estoura no alto-falante do celular).
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.18;
  bus = c.createGain();
  bus.connect(comp); comp.connect(master); master.connect(c.destination);
  const verb = c.createConvolver();
  verb.buffer = makeImpulse(c);
  verbIn = c.createGain();
  verbIn.gain.value = 0.55;
  verbIn.connect(verb); verb.connect(bus);
  noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.5), c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  return c;
}

/** Chamado dentro de um gesto da pessoa: cria/retoma o contexto (exigência do iOS e do Chrome). */
function onGesture() {
  gestured = true;
  if (!getSound().on) return; // som desligado: nem cria o contexto
  const c = ensureCtx();
  if (!c) return;
  if (c.state !== "running") c.resume().catch(() => {});
  // iOS antigo só libera o áudio depois de tocar algo dentro do gesto: um buffer mudo de 1 amostra.
  try {
    const s = c.createBufferSource();
    s.buffer = c.createBuffer(1, 1, c.sampleRate);
    s.connect(c.destination); s.start(0);
  } catch { /* ignora */ }
}

/** Instala (uma vez) os ouvintes de gesto e de visibilidade. Seguro de chamar várias vezes. */
export function initSound(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  getSound();
  const opts = { capture: true, passive: true } as const;
  // Captura: roda antes do clique do jogo, então o contexto já existe quando a jogada pede o som.
  for (const ev of ["pointerdown", "touchend", "keydown", "click"]) window.addEventListener(ev, onGesture, opts);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.visibilityState === "hidden") { silenceAll(); ctx.suspend().catch(() => {}); }
    else if (gestured && getSound().on) ctx.resume().catch(() => {});
  });
  window.addEventListener("storage", (e) => { // outra aba mudou a preferência
    if (e.key !== SOUND_KEY) return;
    settings = parseSound(e.newValue); applyMaster(); listeners.forEach((f) => f());
  });
}

// ---------------------------------------------------------------- vozes

function prune(now: number) {
  for (let i = voices.length - 1; i >= 0; i--) if (voices[i].end < now) voices.splice(i, 1);
}
function fade(v: Voice, now: number, tc = 0.03) {
  try { v.out.gain.cancelScheduledValues(now); v.out.gain.setTargetAtTime(0, now, tc); } catch { /* ignora */ }
  v.end = Math.min(v.end, now + tc * 6);
}
function silenceAll() {
  if (!ctx) return;
  const now = ctx.currentTime;
  voices.forEach((v) => fade(v, now, 0.02));
}

function makeSynth(c: AudioContext, out: GainNode, ends: { t: number }): Synth {
  const cents = (Math.random() - 0.5) * 14; // variação sutil de afinação por som (±7 cents)
  const now = c.currentTime + 0.005;
  const sendTo = (node: AudioNode, amt?: number) => {
    node.connect(out);
    if (amt && verbIn) { const s = c.createGain(); s.gain.value = amt; node.connect(s); s.connect(verbIn); }
  };
  return {
    now,
    hz: (m) => 440 * Math.pow(2, (m - 69) / 12 + cents / 1200),
    tone: ({ f, t = 0, dur, g, type = "sine", a = 0.004, f2, lp, lp2, send = 0.12, spread }) => {
      const t0 = now + t, t1 = t0 + dur;
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.linearRampToValueAtTime(g, t0 + a);
      env.gain.exponentialRampToValueAtTime(0.0001, t1);
      let head: AudioNode = env;
      if (lp) {
        const fl = c.createBiquadFilter();
        fl.type = "lowpass"; fl.Q.value = 0.7;
        fl.frequency.setValueAtTime(lp, t0);
        if (lp2) fl.frequency.exponentialRampToValueAtTime(lp2, t1);
        env.connect(fl); head = fl;
      }
      sendTo(head, send);
      const oscs = spread ? [-spread / 2, spread / 2] : [0];
      for (const det of oscs) {
        const o = c.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(f, t0);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + Math.max(0.02, dur * 0.7));
        if (det) o.detune.value = det;
        const g2 = c.createGain(); g2.gain.value = 1 / oscs.length;
        o.connect(g2); g2.connect(env);
        o.start(t0); o.stop(t1 + 0.03);
      }
      ends.t = Math.max(ends.t, t1 + 0.05);
    },
    noise: ({ t = 0, dur, g, bp, q = 1.2, hp, send = 0.05 }) => {
      if (!noiseBuf) return;
      const t0 = now + t, t1 = t0 + dur;
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.linearRampToValueAtTime(g, t0 + 0.002);
      env.gain.exponentialRampToValueAtTime(0.0001, t1);
      let node: AudioNode = src;
      if (bp) { const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = bp; f.Q.value = q; node.connect(f); node = f; }
      if (hp) { const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; node.connect(f); node = f; }
      node.connect(env);
      sendTo(env, send);
      src.start(t0, Math.random() * 0.3); src.stop(t1 + 0.02);
      ends.t = Math.max(ends.t, t1 + 0.03);
    },
  };
}

/**
 * Toca um efeito do tema. Retorna sem fazer nada (e sem custo) se o som estiver desligado,
 * se a pessoa ainda não interagiu, ou se o mesmo efeito acabou de tocar.
 */
export function playWith(theme: Theme, fallback: Theme, ev: SfxEvent, opts: SfxOpts = {}, key = ""): void {
  if (!gestured || !getSound().on) return;
  const c = ensureCtx();
  if (!c || !bus) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const nowMs = performance.now();
  const k = `${key}:${ev}`;
  if (nowMs - (lastAt.get(k) ?? -1e9) < MIN_GAP[ev]) return;
  lastAt.set(k, nowMs);
  const recipe = theme[ev] ?? fallback[ev];
  if (!recipe) return;
  // Só em desenvolvimento: registro dos sons tocados, para testes automatizados no navegador.
  if (process.env.NODE_ENV === "development") ((window as unknown as { __sfx?: string[] }).__sfx ??= []).push(`${key}:${ev}`);

  const now = c.currentTime;
  prune(now);
  const prio = PRIORITY[ev] ?? 0;
  if (prio >= 2) voices.forEach((v) => fade(v, now, 0.05)); // a vitória fica sozinha
  else if (voices.length >= MAX_VOICES) fade(voices[0], now, 0.015);

  const out = c.createGain();
  out.gain.value = 0.92 + Math.random() * 0.16; // variação sutil de intensidade
  out.connect(bus);
  const ends = { t: now };
  try { recipe(makeSynth(c, out, ends), opts); } catch { /* um som com problema nunca atrapalha a jogada */ }
  const v: Voice = { out, end: ends.t, prio };
  voices.push(v);
  // Solta os nós quando o som termina (o navegador recolhe o resto).
  window.setTimeout(() => { try { out.disconnect(); } catch { /* ignora */ } }, Math.max(0, (ends.t - now) * 1000) + 250);
}
