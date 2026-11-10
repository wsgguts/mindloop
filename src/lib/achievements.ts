// Conquistas e medalhas. Cada conquista é uma linha declarativa: um valor calculado a partir dos dados reais
// (histórico de partidas + progresso das jornadas) e uma meta. Desbloqueia quando valor ≥ meta.
// Para criar uma conquista nova basta acrescentar um item em ACHIEVEMENTS (o id nunca deve mudar depois de
// publicado, pois é ele que fica salvo no aparelho com a data de obtenção).

import { ALL_GAMES, GAME_META } from "./games";
import { type Match, type PlayerLog, bestSession, distinctDays } from "./history";
import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, doneCount, type JourneyGame } from "./journey";
import { refMs } from "./scoring";

export type Rarity = "bronze" | "prata" | "ouro" | "diamante";
export type Category = "tempo" | "jornada" | "jogo" | "constancia" | "especial";

export const RARITY_LABEL: Record<Rarity, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro", diamante: "Diamante" };
export const CATEGORY_LABEL: Record<Category, string> = {
  tempo: "Tempo", jornada: "Jornadas", jogo: "Por jogo", constancia: "Constância", especial: "Especiais",
};
export const CATEGORIES: Category[] = ["tempo", "jornada", "jogo", "constancia", "especial"];

export interface AchCtx {
  log: PlayerLog;
  progress: Record<JourneyGame, string>;
  /** Medalhas já obtidas, sem contar as de "colecionar medalhas" (evita contagem circular). */
  medals: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category: Category;
  rarity: Rarity;
  game?: JourneyGame;
  target: number;
  /** Unidade do progresso ("fases", "dias"…), para "32/50 fases". */
  unit: string;
  value: (c: AchCtx) => number;
  /** Conta medalhas: avaliada depois das demais. */
  meta?: boolean;
}

// ---- Medidas (pequenas e reutilizáveis) ----
export const SPEED_MENTAL_MS = 3 * 60_000;
export const LIGHTNING_MS = 60_000;
/** "Mente Relâmpago" só vale a partir deste nível: nas grades 4×4 iniciais, 1 minuto é fácil demais. */
export const LIGHTNING_FROM_LEVEL = 21;
export const NO_HINT_FROM_LEVEL = 1;

const totalDone = (c: AchCtx) => ALL_GAMES.reduce((a, g) => a + doneCount(c.progress[g]), 0);
const wins = (c: AchCtx, g?: JourneyGame) => (g ? c.log.matches.filter((m) => m.game === g).length : c.log.matches.length);
const any = (c: AchCtx, f: (m: Match) => boolean) => (c.log.matches.some(f) ? 1 : 0);
const records = (c: AchCtx) => c.log.matches.filter((m) => m.record).length;
/** Níveis diferentes (jogo + nível) concluídos dentro do tempo de referência. */
const underRef = (c: AchCtx) => new Set(c.log.matches.filter((m) => m.ms <= refMs(m.game, m.level)).map((m) => `${m.game}-${m.level}`)).size;
const maxDone = (c: AchCtx) => Math.max(...ALL_GAMES.map((g) => doneCount(c.progress[g])));

const perGame: Achievement[] = ALL_GAMES.flatMap((g): Achievement[] => {
  const n = GAME_META[g].name;
  return [
    { id: `${g}-primeiro`, title: "Primeiro Desafio", desc: `Conclua sua primeira partida de ${n}.`, category: "jogo", rarity: "bronze", game: g, target: 1, unit: "partida", value: (c) => wins(c, g) },
    { id: `${g}-especialista`, title: "Especialista", desc: `Conclua 10 partidas de ${n}.`, category: "jogo", rarity: "prata", game: g, target: 10, unit: "partidas", value: (c) => wins(c, g) },
    { id: `${g}-persistencia`, title: "Persistência", desc: `Conclua 25 partidas de ${n}.`, category: "jogo", rarity: "prata", game: g, target: 25, unit: "partidas", value: (c) => wins(c, g) },
    { id: `${g}-mestre`, title: "Mestre do Jogo", desc: `Chegue à metade da jornada de ${n}: 50 níveis concluídos.`, category: "jogo", rarity: "ouro", game: g, target: 50, unit: "níveis", value: (c) => doneCount(c.progress[g]) },
  ];
});

export const ACHIEVEMENTS: Achievement[] = [
  // A) Tempo
  { id: "primeiro-cronometro", title: "Primeiro Cronômetro", desc: "Conclua sua primeira fase.", category: "tempo", rarity: "bronze", target: 1, unit: "fase", value: (c) => wins(c) },
  { id: "velocidade-mental", title: "Velocidade Mental", desc: "Conclua uma fase em até 3 minutos.", category: "tempo", rarity: "bronze", target: 1, unit: "fase", value: (c) => any(c, (m) => m.ms <= SPEED_MENTAL_MS) },
  { id: "mente-relampago", title: "Mente Relâmpago", desc: `Conclua uma fase a partir do nível ${LIGHTNING_FROM_LEVEL} em até 1 minuto.`, category: "tempo", rarity: "prata", target: 1, unit: "fase", value: (c) => any(c, (m) => m.level >= LIGHTNING_FROM_LEVEL && m.ms <= LIGHTNING_MS) },
  { id: "contra-o-relogio", title: "Contra o Relógio", desc: "Bata um recorde pessoal: jogue de novo um nível e termine mais rápido.", category: "tempo", rarity: "bronze", target: 1, unit: "recorde", value: records },
  { id: "mestre-velocidade", title: "Mestre da Velocidade", desc: "Conclua 10 fases diferentes dentro do tempo de referência delas.", category: "tempo", rarity: "ouro", target: 10, unit: "fases", value: underRef },
  // B) Jornadas
  { id: "primeiros-passos", title: "Primeiros Passos", desc: "Conclua a primeira fase de uma jornada.", category: "jornada", rarity: "bronze", target: 1, unit: "fase", value: totalDone },
  { id: "explorador", title: "Explorador", desc: `Desbloqueie um novo capítulo: conclua os ${LEVELS_PER_CHAPTER} primeiros níveis de uma jornada.`, category: "jornada", rarity: "bronze", target: LEVELS_PER_CHAPTER, unit: "níveis", value: maxDone },
  { id: "caminho-percorrido", title: "Caminho Percorrido", desc: "Conclua 10 fases (somando todas as jornadas).", category: "jornada", rarity: "bronze", target: 10, unit: "fases", value: totalDone },
  { id: "grande-jornada", title: "Grande Jornada", desc: "Conclua 25 fases.", category: "jornada", rarity: "prata", target: 25, unit: "fases", value: totalDone },
  { id: "mestre-jornadas", title: "Mestre das Jornadas", desc: "Conclua 50 fases.", category: "jornada", rarity: "ouro", target: 50, unit: "fases", value: totalDone },
  { id: "lenda-mindloop", title: "Lenda MindLoop", desc: "Conclua 100 fases.", category: "jornada", rarity: "diamante", target: 100, unit: "fases", value: totalDone },
  // C) Por jogo (4 por jogo)
  ...perGame,
  // D) Constância
  { id: "constancia", title: "Constância", desc: "Jogue em 3 dias diferentes.", category: "constancia", rarity: "bronze", target: 3, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "dedicacao", title: "Dedicação", desc: "Jogue em 7 dias diferentes.", category: "constancia", rarity: "prata", target: 7, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "comprometimento", title: "Comprometimento", desc: "Jogue em 15 dias diferentes.", category: "constancia", rarity: "ouro", target: 15, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "sem-desistir", title: "Sem Desistir", desc: "Conclua 5 partidas seguidas, sem abandonar nenhuma no meio.", category: "constancia", rarity: "prata", target: 5, unit: "seguidas", value: (c) => c.log.bestStreak },
  { id: "maratona-mental", title: "Maratona Mental", desc: "Conclua 10 fases numa mesma sessão (até 30 min entre uma vitória e outra).", category: "constancia", rarity: "ouro", target: 10, unit: "fases", value: (c) => bestSession(c.log.matches) },
  // E) Especiais
  { id: "sem-dicas", title: "Por Conta Própria", desc: "Conclua uma fase sem pedir nenhuma dica.", category: "especial", rarity: "bronze", target: 1, unit: "fase", value: (c) => any(c, (m) => m.hints === 0 && m.level >= NO_HINT_FROM_LEVEL) },
  { id: "todos-os-jogos", title: "Mente Versátil", desc: "Conclua pelo menos uma partida de cada um dos 4 jogos.", category: "especial", rarity: "prata", target: ALL_GAMES.length, unit: "jogos", value: (c) => ALL_GAMES.filter((g) => wins(c, g) > 0).length },
  { id: "cacador-recordes", title: "Caçador de Recordes", desc: "Bata 10 recordes pessoais.", category: "especial", rarity: "ouro", target: 10, unit: "recordes", value: records },
  { id: "jornada-completa", title: "Jornada Completa", desc: `Conclua todos os ${LEVELS_PER_GAME} níveis de uma jornada.`, category: "especial", rarity: "diamante", target: LEVELS_PER_GAME, unit: "níveis", value: maxDone },
  { id: "colecionador", title: "Colecionador", desc: "Conquiste 10 medalhas.", category: "especial", rarity: "ouro", target: 10, unit: "medalhas", value: (c) => c.medals, meta: true },
  { id: "galeria-lendaria", title: "Galeria Lendária", desc: "Conquiste 25 medalhas.", category: "especial", rarity: "diamante", target: 25, unit: "medalhas", value: (c) => c.medals, meta: true },
];

export const ACH_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Conquistas obtidas: id → data (ms) da obtenção. */
export type Unlocked = Record<string, number>;
export const ACH_KEY = "mindloop:achievements";

export function parseUnlocked(raw: string | null): Unlocked | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const out: Unlocked = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) if (ACH_BY_ID.has(k) && typeof v === "number" && Number.isFinite(v)) out[k] = v;
    return out;
  } catch { return null; }
}

const countMedals = (u: Unlocked) => Object.keys(u).filter((id) => !ACH_BY_ID.get(id)?.meta).length;

/**
 * Confere todas as conquistas. Devolve o mapa atualizado e as recém-obtidas (na ordem da lista).
 * Conquista já obtida nunca é perdida nem obtida de novo (sem duplicidade).
 */
export function evaluate(ctx: Omit<AchCtx, "medals">, unlocked: Unlocked, now: number): { unlocked: Unlocked; fresh: Achievement[] } {
  const next: Unlocked = { ...unlocked };
  const fresh: Achievement[] = [];
  const pass = (meta: boolean) => {
    const c: AchCtx = { ...ctx, medals: countMedals(next) };
    for (const a of ACHIEVEMENTS) {
      if (!!a.meta !== meta || next[a.id] !== undefined) continue;
      if (a.value(c) >= a.target) { next[a.id] = now; fresh.push(a); }
    }
  };
  pass(false);
  pass(true);
  return { unlocked: next, fresh };
}

/** Progresso para a tela: valor atual (limitado à meta) e fração 0..1. */
export function progressOf(a: Achievement, ctx: Omit<AchCtx, "medals">, unlocked: Unlocked): { value: number; frac: number } {
  const v = Math.min(a.target, a.value({ ...ctx, medals: countMedals(unlocked) }));
  return { value: v, frac: v / a.target };
}
