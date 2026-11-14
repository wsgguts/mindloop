// Mindloop Investigação — progresso salvo no aparelho (chave mindloop:cases).
// Fica SEPARADO do progresso das jornadas de propósito: investigar ou pular nunca muda fases, pontos do ranking
// ou desbloqueios. Funções puras; quem lê e grava é o App.

import { EVERY_GAME } from "../games";
import type { JourneyGame } from "../journey";
import { type Difficulty, MAX_HINTS, xpFor } from "./config";

export const CASES_KEY = "mindloop:cases";
const MAX_HISTORY = 1000;

/** Investigação em andamento (para continuar depois de recarregar ou fechar o app). */
export interface Draft {
  a: number[]; hints: number; ms: number;
  /** História do caso quando o rascunho foi salvo: se o conteúdo do caso mudar, o rascunho antigo é ignorado. */
  k?: string;
}

export interface CaseRecord {
  /** Primeira solução (ms desde 1970). */
  solvedAt: number | null;
  bestMs: number | null;
  /** Menor número de dicas numa solução (define a medalha: 0 = ouro). */
  bestHints: number | null;
  /** XP ganho (só na primeira solução: rever um caso não soma de novo). */
  xp: number;
  /** A pessoa preferiu pular o convite. O caso continua disponível no caderno de investigações. */
  skippedAt: number | null;
  draft?: Draft;
}

/** Uma solução registrada (histórico de investigações concluídas). */
export interface Solve { id: string; game: JourneyGame; at: number; ms: number; hints: number; xp: number; first: boolean; record: boolean }

export interface CaseLog { v: 1; records: Record<string, CaseRecord>; history: Solve[] }

export const emptyCaseLog = (): CaseLog => ({ v: 1, records: {}, history: [] });
const blank = (): CaseRecord => ({ solvedAt: null, bestMs: null, bestHints: null, xp: 0, skippedAt: null });

const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0;
const numOrNull = (x: unknown) => (isNum(x) ? x : null);
const isGame = (g: unknown): g is JourneyGame => typeof g === "string" && (EVERY_GAME as string[]).includes(g);

/** Lê o progresso salvo; dados ausentes ou corrompidos viram um progresso vazio (o app segue funcionando). */
export function parseCaseLog(raw: string | null): CaseLog {
  if (!raw) return emptyCaseLog();
  try {
    const o = JSON.parse(raw) as Partial<CaseLog>;
    if (!o || o.v !== 1 || typeof o.records !== "object" || !o.records) return emptyCaseLog();
    const records: Record<string, CaseRecord> = {};
    for (const [id, r] of Object.entries(o.records as Record<string, Partial<CaseRecord>>)) {
      if (!r || typeof r !== "object") continue;
      const rec: CaseRecord = { solvedAt: numOrNull(r.solvedAt), bestMs: numOrNull(r.bestMs), bestHints: numOrNull(r.bestHints), xp: isNum(r.xp) ? r.xp : 0, skippedAt: numOrNull(r.skippedAt) };
      const d = r.draft;
      if (d && Array.isArray(d.a) && d.a.every((v) => Number.isInteger(v) && v >= -1) && isNum(d.hints) && isNum(d.ms)) rec.draft = { a: d.a, hints: Math.min(MAX_HINTS, d.hints), ms: d.ms, ...(typeof d.k === "string" ? { k: d.k } : {}) };
      records[id] = rec;
    }
    const seen = new Set<string>();
    const history = (Array.isArray(o.history) ? o.history : []).filter((s): s is Solve =>
      !!s && typeof s.id === "string" && isGame(s.game) && isNum(s.at) && isNum(s.ms) && isNum(s.hints) && isNum(s.xp)
      && typeof s.first === "boolean" && typeof s.record === "boolean" && !seen.has(`${s.id}@${s.at}`) && !!seen.add(`${s.id}@${s.at}`));
    return { v: 1, records, history };
  } catch { return emptyCaseLog(); }
}

export const recordOf = (log: CaseLog, id: string): CaseRecord => log.records[id] ?? blank();
export const isSolved = (log: CaseLog, id: string) => recordOf(log, id).solvedAt !== null;

/**
 * O convite aparece só para mistérios ainda não resolvidos e não pulados: nada se repete automaticamente.
 * (Rever ou retomar um caso pulado é sempre possível pelo caderno de investigações.)
 */
export const shouldOffer = (log: CaseLog, id: string): boolean => { const r = recordOf(log, id); return r.solvedAt === null && r.skippedAt === null; };

/** Pular: só registra a escolha. Nunca tira pontos nem bloqueia nada. */
export function recordSkip(log: CaseLog, id: string, at: number): CaseLog {
  const r = recordOf(log, id);
  if (r.solvedAt !== null || r.skippedAt !== null) return log;
  return { ...log, records: { ...log.records, [id]: { ...r, skippedAt: at } } };
}

export function saveDraft(log: CaseLog, id: string, draft: Draft | null): CaseLog {
  const r = { ...recordOf(log, id) };
  if (draft) r.draft = draft; else delete r.draft;
  return { ...log, records: { ...log.records, [id]: r } };
}

/** Mistério resolvido: atualiza recorde e medalha; XP só na primeira vez. Repetir o mesmo evento não duplica. */
export function recordSolve(log: CaseLog, c: { id: string; game: JourneyGame; difficulty: Difficulty }, ms: number, hints: number, at: number): { log: CaseLog; solve: Solve } {
  const r = recordOf(log, c.id);
  const dup = log.history.find((s) => s.id === c.id && s.at === at);
  if (dup) return { log, solve: dup };
  const first = r.solvedAt === null;
  const xp = first ? xpFor(c.difficulty, hints) : 0;
  const record = !first && r.bestMs !== null && ms < r.bestMs;
  const next: CaseRecord = {
    solvedAt: r.solvedAt ?? at,
    bestMs: r.bestMs === null ? ms : Math.min(r.bestMs, ms),
    bestHints: r.bestHints === null ? hints : Math.min(r.bestHints, hints),
    xp: r.xp + xp,
    skippedAt: r.skippedAt,
  };
  const solve: Solve = { id: c.id, game: c.game, at, ms, hints, xp, first, record };
  const history = [...log.history, solve];
  return { log: { v: 1, records: { ...log.records, [c.id]: next }, history: history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history }, solve };
}

// ---- Totais (Perfil, caderno de investigações e conquistas) ----
const solvedIds = (log: CaseLog, game?: JourneyGame) =>
  Object.entries(log.records).filter(([id, r]) => r.solvedAt !== null && (!game || id.startsWith(`${game}-`))).map(([id]) => id);
export const solvedCount = (log: CaseLog, game?: JourneyGame) => solvedIds(log, game).length;
export const xpTotal = (log: CaseLog) => Object.values(log.records).reduce((t, r) => t + r.xp, 0);
/** Mistérios diferentes resolvidos sem nenhuma dica (Lupa de Ouro). */
export const goldCount = (log: CaseLog, game?: JourneyGame) => solvedIds(log, game).filter((id) => log.records[id].bestHints === 0).length;
export const fastestMs = (log: CaseLog) => Math.min(Infinity, ...log.history.map((s) => s.ms));
