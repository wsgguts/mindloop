"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Gem from "../Gem";
import { useSfx } from "../useSound";
import { GAME_META } from "../../lib/games";
import type { JourneyGame } from "../../lib/journey";

// ===================== Sistema de tutoriais (reutilizável) =====================
// Cada jogo fornece uma lista de passos; cada passo tem título, explicação, orientação ("Observe") e uma
// demonstração animada. A demonstração é uma sequência de "quadros" com duração própria: o motor avança
// quadro a quadro, repete sozinho depois de uma pausa e pode ser reiniciada pelo botão "Repetir animação".

export interface Demo {
  /** Duração de cada quadro, em ms. Depois do último, a demonstração recomeça. */
  beats: number[];
  /** Desenha o quadro `beat`. */
  render: (beat: number) => React.ReactNode;
  /** Narração de cada quadro (lida também por leitores de tela). */
  say: (string | undefined)[];
}
export interface TutorialStep { title: string; text: React.ReactNode; look: string; demo: Demo }

/** Um quadro da demonstração: as props do mini tabuleiro + narração + dedo (alvo `data-t` e se está tocando). */
export interface Frame<P> { ms: number; p: P; say?: string; finger?: string | null; press?: boolean }

/** Monta uma demonstração a partir de um mini tabuleiro e de uma lista de quadros. */
export function seq<P extends object>(Mini: React.ComponentType<P>, frames: Frame<P>[]): Demo {
  let last: string | undefined;
  const say = frames.map((f) => (last = f.say ?? last));
  return {
    beats: frames.map((f) => f.ms),
    say,
    render: (b) => {
      const f = frames[Math.min(b, frames.length - 1)];
      return (
        <>
          <Mini {...f.p} />
          <Finger target={f.finger ?? null} press={!!f.press} />
        </>
      );
    },
  };
}

// Velocidade das demonstrações (multiplica a velocidade; 0,75× = cada quadro dura 1/0,75 do tempo).
// Começa um pouco mais lenta que o normal; a escolha fica salva no aparelho e vale para todos os jogos.
export const SPEEDS = [0.5, 0.75, 1, 1.5] as const;
export const DEFAULT_SPEED = 0.75;
const SPEED_KEY = "mindloop:tutorial-speed";
function readSpeed(): number {
  try { const v = Number(window.localStorage.getItem(SPEED_KEY)); return (SPEEDS as readonly number[]).includes(v) ? v : DEFAULT_SPEED; } catch { return DEFAULT_SPEED; }
}
const fmtSpeed = (v: number) => `${String(v).replace(".", ",")}×`;

/** Avança os quadros; `key` diferente recomeça do zero (trocar de passo ou "Repetir animação"). */
export function useBeats(beats: number[], key: string, speed = 1): number {
  const [s, setS] = useState({ i: 0, k: key });
  const i = s.k === key ? s.i : 0;
  useEffect(() => {
    const t = window.setTimeout(() => setS({ i: (i + 1) % beats.length, k: key }), (beats[i] ?? 1000) / speed);
    return () => window.clearTimeout(t);
  }, [i, key, beats, speed]);
  return i;
}

/** Dedo que aponta e "toca" um elemento da demonstração (qualquer elemento com data-t="..."). */
export function Finger({ target, press }: { target: string | null; press: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const place = useCallback(() => {
    const el = ref.current, box = el?.parentElement;
    if (!el || !box || !target) return setPos(null);
    const t = box.querySelector<HTMLElement>(`[data-t="${target}"]`);
    if (!t) return setPos(null);
    const a = box.getBoundingClientRect(), r = t.getBoundingClientRect();
    setPos({ x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 });
  }, [target]);
  useLayoutEffect(place, [place]);
  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);
  return (
    <span ref={ref} className={`tut-finger${press ? " press" : ""}${pos ? "" : " off"}`} aria-hidden="true"
      style={pos ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : undefined}>
      <svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.6L4.2 14a1.5 1.5 0 0 1 2.4-1.8L9 15" fill="#fff" stroke="#26104D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);

interface Props {
  game: JourneyGame;
  steps: TutorialStep[];
  /** Primeiro acesso: mostra "Pular tutorial" e termina em "Começar a jogar". */
  first: boolean;
  /** Texto do botão final quando aberto pela pessoa (ex.: "Continuar jogando"). */
  finishLabel?: string;
  /** done = chegou ao fim; skipped = pulou; closed = fechou (aberto manualmente). */
  onDone: (how: "done" | "skipped" | "closed") => void;
}

export default function Tutorial({ game, steps, first, finishLabel = "Concluir", onDone }: Props) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(0); // "Repetir animação" recomeça a demonstração
  const [speed, setSpeed] = useState(readSpeed);
  function chooseSpeed(v: number) {
    setSpeed(v);
    try { window.localStorage.setItem(SPEED_KEY, String(v)); } catch { /* segue sem salvar */ }
  }
  const step = steps[i];
  const last = i === steps.length - 1;
  const beat = useBeats(step.demo.beats, `${i}:${play}`, speed);
  const box = useRef<HTMLElement>(null);
  // Largura da demonstração: ajustada à altura real da tela para o passo inteiro caber sem rolar
  // (celular em pé; no celular deitado o CSS cuida da coluna da demonstração).
  const [demoW, setDemoW] = useState(256);
  const fit = useCallback(() => {
    const tut = box.current;
    const main = tut?.querySelector<HTMLElement>(".tut-main"), board = tut?.querySelector<HTMLElement>(".tut-board"), stage = tut?.querySelector<HTMLElement>(".tut-stage");
    if (!tut || !main || !board || !stage) return;
    if (window.matchMedia("(orientation: landscape) and (max-height: 540px)").matches) return;
    const pad = parseFloat(getComputedStyle(tut.parentElement!).paddingTop) || 0;
    // tamanhos de layout (offset*), que não sofrem a animação de entrada (escala) do painel
    const spare = window.innerHeight - 2 * pad - tut.offsetHeight; // sobra abaixo do painel
    const over = main.scrollHeight - main.clientHeight; // o que não coube
    // só o tabuleiro encolhe/cresce (teclados e contagens da demonstração mantêm a largura cheia)
    const d = { width: board.offsetWidth, height: board.offsetHeight };
    if (!d.width || !d.height) return;
    const maxW = Math.min(256, stage.clientWidth - 16);
    const next = Math.round(Math.max(110, Math.min(maxW, d.width + ((spare - over) * d.width) / d.height)));
    setDemoW((w) => (Math.abs(w - next) > 2 ? next : w));
  }, []);
  const done = useRef(onDone);
  done.current = onDone;
  const { name, color } = GAME_META[game];

  const sfx = useSfx(game);
  const go = (k: number) => { if (k !== i) sfx("ui"); setI(Math.max(0, Math.min(steps.length - 1, k))); setPlay((p) => p + 1); };
  const finish = () => done.current("done");
  const leave = () => done.current(first ? "skipped" : "closed");

  // Foco no painel, teclado (← → navegam, Esc sai) e foco preso dentro do tutorial.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus({ preventScroll: true });
    sfx("ui"); // tutorial abriu
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); leave(); }
      if (e.key === "Tab" && box.current) {
        const f = box.current.querySelectorAll<HTMLElement>("button:not(:disabled)");
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(fit, [i, demoW, beat, fit]);
  useEffect(() => {
    // reajusta quando a janela muda ou quando o texto muda de altura (ex.: as fontes terminam de carregar)
    window.addEventListener("resize", fit);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => fit()) : null;
    const txt = box.current?.querySelector(".tut-text"), look = box.current?.querySelector(".tut-look");
    if (txt) ro?.observe(txt);
    if (look) ro?.observe(look);
    return () => { window.removeEventListener("resize", fit); ro?.disconnect(); };
  }, [fit, i]);

  function onKeyNav(e: React.KeyboardEvent) {
    if ((e.target as HTMLElement).closest(".tut-dots")) return;
    if (e.key === "ArrowRight" && !last) go(i + 1);
    if (e.key === "ArrowLeft" && i > 0) go(i - 1);
  }

  return (
    <div className="scrim tut-scrim">
      <section ref={box} className="tut" role="dialog" aria-modal="true" aria-labelledby="tut-title" tabIndex={-1} onKeyDown={onKeyNav}
        style={{ "--gc": color, "--tut-k": 1 / speed, "--demo-w": `${demoW}px` } as React.CSSProperties}>
        <header className="tut-head">
          <Gem kind={game} size={40} />
          <div className="tut-name">
            <span className="tut-kicker">{first ? "Antes de começar" : "Como jogar"}</span>
            <h2 id="tut-title">{name}</h2>
          </div>
          {first ? (
            <button type="button" className="tut-skip" onClick={leave}>Pular tutorial</button>
          ) : (
            <button type="button" className="btn sec close tut-close" onClick={leave} aria-label="Fechar tutorial">✕</button>
          )}
        </header>

        <div className="tut-prog">
          <ol className="tut-dots" aria-label="Passos do tutorial">
            {steps.map((s, k) => (
              <li key={k}>
                <button type="button" className={k < i ? "done" : k === i ? "on" : ""} aria-current={k === i ? "step" : undefined}
                  aria-label={`Passo ${k + 1}: ${s.title}${k < i ? " (visto)" : ""}`} onClick={() => go(k)} />
              </li>
            ))}
          </ol>
          <p className="tut-count" aria-live="polite">Passo {i + 1} de {steps.length} — {step.title}</p>
        </div>

        <div className="tut-main">
          <div className="tut-text">
            <h3>{step.title}</h3>
            <div className="tut-expl">{step.text}</div>
          </div>
          <div className="tut-stage">
            <div className="tut-demo" key={`${i}:${play}`} aria-hidden="true">{step.demo.render(beat)}</div>
            <p className="tut-say" aria-live="polite">{step.demo.say[beat] ?? ""}</p>
            <div className="tut-ctl">
            <button type="button" className="tut-replay" onClick={() => setPlay((p) => p + 1)} aria-label="Repetir animação">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
              <span>Repetir</span>
            </button>
            <div className="tut-speed" role="group" aria-label="Velocidade da animação">
              <span className="tut-speed-label" aria-hidden="true" title="Velocidade"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-6" /></svg></span>
              {SPEEDS.map((v) => (
                <button key={v} type="button" className={v === speed ? "on" : ""} aria-pressed={v === speed} onClick={() => chooseSpeed(v)}
                  aria-label={`Velocidade ${fmtSpeed(v)}${v === DEFAULT_SPEED ? " (padrão, um pouco mais lenta)" : v < 1 ? " (mais lenta)" : v > 1 ? " (mais rápida)" : " (normal)"}`}>
                  {fmtSpeed(v)}
                </button>
              ))}
            </div>
            </div>
          </div>
          <p className="tut-look"><EyeIcon /><span><b>Observe:</b> {step.look}</span></p>
        </div>

        <nav className="tut-nav" aria-label="Navegação do tutorial">
          <button type="button" className="btn sec" onClick={() => go(i - 1)} disabled={i === 0}>‹ Voltar</button>
          {!first && i > 0 && <button type="button" className="tut-restart" onClick={() => go(0)} aria-label="Recomeçar do primeiro passo">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
            <span>Recomeçar</span>
          </button>}
          {last ? (
            <button type="button" className="btn cta tut-go" onClick={finish}>{first ? "Começar a jogar" : finishLabel}</button>
          ) : (
            <button type="button" className="btn tut-go" onClick={() => go(i + 1)}>Próximo ›</button>
          )}
        </nav>
      </section>
    </div>
  );
}
