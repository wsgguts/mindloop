// Registro central das partidas concluídas (fonte única para estatísticas, conquistas e ranking).
// Cada vitória vira UM registro com identificador próprio — gravado uma única vez no instante da vitória,
// então recarregar a página ou voltar a uma tela nunca duplica partidas.
// Funções puras; quem lê e grava no aparelho é o App (chave mindloop:history).

import { ALL_GAMES } from "./games";
import { LEVELS_PER_GAME, type JourneyGame } from "./journey";
import type { Times } from "./records";

export interface Match {
  id: string;
  game: JourneyGame;
  level: number;
  ms: number;
  /** Momento da vitória (ms desde 1970). null = tempo importado de antes do histórico existir. */
  at: number | null;
  /** Dicas pedidas na partida (null = desconhecido). */
  hints: number | null;
  /** Primeira vez que o nível foi concluído. */
  first: boolean;
  /** Bateu o recorde pessoal do nível. */
  record: boolean;
}

export interface PlayerLog {
  v: 1;
  matches: Match[];
  /** Vitórias seguidas sem abandonar uma partida no meio. */
  streak: number;
  bestStreak: number;
  /** Partidas iniciadas por jogo (desde que o histórico existe) — base da média de tentativas. */
  starts: Record<JourneyGame, number>;
}

export const HISTORY_KEY = "mindloop:history";
const MAX_MATCHES = 3000;

const zeroStarts = (): Record<JourneyGame, number> => ({ sudoku: 0, zip: 0, tango: 0, patches: 0 });
export const emptyLog = (): PlayerLog => ({ v: 1, matches: [], streak: 0, bestStreak: 0, starts: zeroStarts() });

const isGame = (g: unknown): g is JourneyGame => typeof g === "string" && (ALL_GAMES as string[]).includes(g);
const posInt = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

function validMatch(m: unknown): m is Match {
  if (!m || typeof m !== "object") return false;
  const x = m as Record<string, unknown>;
  return typeof x.id === "string" && isGame(x.game) && posInt(x.level) && x.level >= 1 && x.level <= LEVELS_PER_GAME
    && typeof x.ms === "number" && Number.isFinite(x.ms) && x.ms > 0
    && (x.at === null || (typeof x.at === "number" && Number.isFinite(x.at)))
    && (x.hints === null || posInt(x.hints)) && typeof x.first === "boolean" && typeof x.record === "boolean";
}

/** Lê o histórico salvo; descarta registros inválidos e repetidos. */
export function parseLog(raw: string | null): PlayerLog | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<PlayerLog>;
    if (!o || o.v !== 1 || !Array.isArray(o.matches)) return null;
    const seen = new Set<string>();
    const matches = o.matches.filter((m) => validMatch(m) && !seen.has(m.id) && !!seen.add(m.id));
    const starts = zeroStarts();
    for (const g of ALL_GAMES) if (posInt(o.starts?.[g])) starts[g] = o.starts![g];
    return { v: 1, matches, streak: posInt(o.streak) ? o.streak : 0, bestStreak: posInt(o.bestStreak) ? o.bestStreak : 0, starts };
  } catch { return null; }
}

/**
 * Primeira abertura depois desta versão: os melhores tempos que já estavam salvos viram registros
 * "importados" (at = null). Assim quem já jogava não perde nada — eles contam para médias, recordes e
 * conquistas de quantidade, mas não para dias jogados nem sessões (não sabemos quando aconteceram).
 */
export function importLegacy(times: Record<JourneyGame, Times>): PlayerLog {
  const log = emptyLog();
  for (const g of ALL_GAMES) {
    for (const [k, ms] of Object.entries(times[g])) {
      const level = Number(k);
      log.matches.push({ id: `legacy-${g}-${level}`, game: g, level, ms, at: null, hints: null, first: true, record: false });
    }
  }
  return log;
}

/** Acrescenta uma vitória. Registro com o mesmo id é ignorado (nunca duplica). */
export function addMatch(log: PlayerLog, m: Match): PlayerLog {
  if (log.matches.some((x) => x.id === m.id)) return log;
  const matches = [...log.matches, m];
  const streak = log.streak + 1;
  return { ...log, matches: matches.length > MAX_MATCHES ? matches.slice(-MAX_MATCHES) : matches, streak, bestStreak: Math.max(log.bestStreak, streak) };
}

/** Nova partida iniciada. `abandoned`: a anterior foi deixada sem terminar (zera a sequência de vitórias). */
export function startMatch(log: PlayerLog, game: JourneyGame, abandoned: boolean): PlayerLog {
  return { ...log, streak: abandoned ? 0 : log.streak, starts: { ...log.starts, [game]: log.starts[game] + 1 } };
}

export const matchId = (game: JourneyGame, level: number, at: number) => `${game}-${level}-${at}`;

/** Data local "AAAA-MM-DD" (dias jogados contam pelo calendário do aparelho). */
export function dayKey(at: number): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Intervalo máximo entre duas vitórias da mesma sessão de jogo. */
export const SESSION_GAP_MS = 30 * 60 * 1000;

/** Maior número de fases concluídas numa mesma sessão (vitórias com no máximo 30 min entre uma e outra). */
export function bestSession(matches: Match[]): number {
  const ts = matches.map((m) => m.at).filter((a): a is number => a !== null).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -Infinity;
  for (const t of ts) { run = t - prev <= SESSION_GAP_MS ? run + 1 : 1; best = Math.max(best, run); prev = t; }
  return best;
}

export const distinctDays = (matches: Match[]): number => new Set(matches.filter((m) => m.at !== null).map((m) => dayKey(m.at!))).size;
