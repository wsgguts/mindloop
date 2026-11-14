// Progresso no servidor (identidade anônima, sem login).
//
// O aparelho continua funcionando sozinho (sem internet ou sem servidor configurado). Com uma identidade,
// o progresso inteiro também fica no banco e é a fonte para recuperar tudo num aparelho novo ou depois de
// limpar os dados do navegador (com o código de recuperação).
//
// Funções puras (snapshot ↔ armazenamento e mesclagem) + chamadas ao servidor. Regras de mesclagem: nada que
// foi conquistado se perde — fases concluídas se somam, o melhor tempo vence, conquistas e partidas se unem
// pelo id (nada duplica). A mesclagem só junta dados DO MESMO jogador: recuperar uma identidade em um aparelho
// com progresso de outra pessoa SUBSTITUI os dados do aparelho (nunca mistura históricos).

import { ACH_KEY, type Unlocked, parseUnlocked } from "./achievements";
import { CASES_KEY, type CaseLog, type CaseRecord, emptyCaseLog, parseCaseLog } from "./cases/progress";
import { EVERY_GAME } from "./games";
import { HISTORY_KEY, type PlayerLog, emptyLog, parseLog } from "./history";
import { type JourneyGame, emptyProgress, parseLevel, parseProgress } from "./journey";
import { type Times, parseTimes } from "./records";
import { RankError, type RankIdentity, rpc } from "./ranking";

type PerGame<T> = Record<JourneyGame, T>;
const perGame = <T,>(f: (g: JourneyGame) => T): PerGame<T> => ({ sudoku: f("sudoku"), zip: f("zip"), tango: f("tango"), patches: f("patches"), astros: f("astros") });

export const PROGRESS_KEY = (g: JourneyGame) => `mindloop:progress:${g}`;
export const TIMES_KEY = (g: JourneyGame) => `mindloop:times:${g}`;
export const LAST_KEY = (g: JourneyGame) => `mindloop:last:${g}`;
export const TUTORIAL_KEY = (g: JourneyGame) => `mindloop:tutorial:${g}`;
const PREF_KEYS = ["mindloop:sound", "mindloop:tutorial-speed"];
/** Prefixo de TODOS os dados do MindLoop no aparelho (o reinício apaga tudo o que começa assim). */
export const STORE_PREFIX = "mindloop:";

export interface Snapshot {
  v: 1;
  progress: PerGame<string>;
  times: PerGame<Times>;
  last: PerGame<number | null>;
  tutorial: PerGame<string | null>;
  history: PlayerLog;
  achievements: Unlocked;
  cases: CaseLog;
  prefs: Record<string, string>;
}

export const emptySnapshot = (): Snapshot => ({
  v: 1, progress: perGame(emptyProgress), times: perGame(() => ({})), last: perGame(() => null), tutorial: perGame(() => null),
  history: emptyLog(), achievements: {}, cases: emptyCaseLog(), prefs: {},
});

type Read = (k: string) => string | null;
type Write = (k: string, v: string | null) => void;

/** Lê tudo o que importa do aparelho. */
export function readSnapshot(read: Read): Snapshot {
  const prefs: Record<string, string> = {};
  for (const k of PREF_KEYS) { const v = read(k); if (v !== null) prefs[k] = v; }
  return {
    v: 1,
    progress: perGame((g) => parseProgress(read(PROGRESS_KEY(g)))),
    times: perGame((g) => parseTimes(read(TIMES_KEY(g)))),
    last: perGame((g) => parseLevel(read(LAST_KEY(g)))),
    tutorial: perGame((g) => { const t = read(TUTORIAL_KEY(g)); return t === "done" || t === "skipped" ? t : null; }),
    history: parseLog(read(HISTORY_KEY)) ?? emptyLog(),
    achievements: parseUnlocked(read(ACH_KEY)) ?? {},
    cases: parseCaseLog(read(CASES_KEY)),
    prefs,
  };
}

/** Grava um snapshot no aparelho (substitui os mesmos campos; não mexe no apelido nem na identidade). */
export function writeSnapshot(s: Snapshot, write: Write): void {
  for (const g of EVERY_GAME) {
    write(PROGRESS_KEY(g), s.progress[g]);
    write(TIMES_KEY(g), JSON.stringify(s.times[g]));
    write(LAST_KEY(g), s.last[g] === null ? null : String(s.last[g]));
    write(TUTORIAL_KEY(g), s.tutorial[g]);
  }
  write(HISTORY_KEY, JSON.stringify(s.history));
  write(ACH_KEY, JSON.stringify(s.achievements));
  write(CASES_KEY, JSON.stringify(s.cases));
  for (const k of PREF_KEYS) if (s.prefs[k] !== undefined) write(k, s.prefs[k]);
}

/** Valida o que veio do servidor com os mesmos leitores do aparelho (dados estranhos viram vazios). */
export function parseSnapshot(raw: unknown): Snapshot | null {
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== 1) return null;
  const o = raw as Partial<Record<keyof Snapshot, unknown>>;
  const g = <T,>(x: unknown, k: JourneyGame): T | undefined => (x && typeof x === "object" ? (x as Record<string, T>)[k] : undefined);
  const str = (x: unknown) => (x === undefined || x === null ? null : typeof x === "string" ? x : JSON.stringify(x));
  return readSnapshot((key) => {
    for (const k of EVERY_GAME) {
      if (key === PROGRESS_KEY(k)) return str(g(o.progress, k));
      if (key === TIMES_KEY(k)) return str(g(o.times, k));
      if (key === LAST_KEY(k)) return str(g(o.last, k));
      if (key === TUTORIAL_KEY(k)) return str(g(o.tutorial, k));
    }
    if (key === HISTORY_KEY) return str(o.history);
    if (key === ACH_KEY) return str(o.achievements);
    if (key === CASES_KEY) return str(o.cases);
    const p = o.prefs as Record<string, unknown> | undefined;
    return p && typeof p[key] === "string" ? (p[key] as string) : null;
  });
}

// ---------------------------------------------------------------- mesclagem (mesmo jogador, dois aparelhos)

const minNum = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.min(a, b));

function mergeCaseRecord(a: CaseRecord | undefined, b: CaseRecord | undefined): CaseRecord {
  if (!a) return b!;
  if (!b) return a;
  const r: CaseRecord = {
    solvedAt: minNum(a.solvedAt, b.solvedAt), bestMs: minNum(a.bestMs, b.bestMs), bestHints: minNum(a.bestHints, b.bestHints),
    xp: Math.max(a.xp, b.xp), skippedAt: minNum(a.skippedAt, b.skippedAt),
  };
  const draft = a.draft ?? b.draft;
  if (draft && r.solvedAt === null) r.draft = draft;
  return r;
}

/** Junta dois snapshots do MESMO jogador. `a` (o aparelho) vence nas preferências e no último nível jogado. */
export function mergeSnapshots(a: Snapshot, b: Snapshot): Snapshot {
  const progress = perGame((g) => [...a.progress[g]].map((ch, i) => (ch === "1" || b.progress[g][i] === "1" ? "1" : "0")).join(""));
  const times = perGame((g) => {
    const t: Times = { ...b.times[g] };
    for (const [k, ms] of Object.entries(a.times[g])) t[Number(k)] = t[Number(k)] === undefined ? ms : Math.min(t[Number(k)], ms);
    return t;
  });
  const rankT = (x: string | null) => (x === "done" ? 2 : x === "skipped" ? 1 : 0);
  const seen = new Set<string>();
  const matches = [...a.history.matches, ...b.history.matches].filter((m) => !seen.has(m.id) && !!seen.add(m.id))
    .sort((x, y) => (x.at ?? -1) - (y.at ?? -1)).slice(-3000);
  const achievements: Unlocked = { ...b.achievements };
  for (const [k, at] of Object.entries(a.achievements)) achievements[k] = achievements[k] === undefined ? at : Math.min(achievements[k], at);
  const ids = new Set([...Object.keys(a.cases.records), ...Object.keys(b.cases.records)]);
  const records: Record<string, CaseRecord> = {};
  for (const id of ids) records[id] = mergeCaseRecord(a.cases.records[id], b.cases.records[id]);
  const cseen = new Set<string>();
  const chist = [...a.cases.history, ...b.cases.history].filter((s) => !cseen.has(`${s.id}@${s.at}`) && !!cseen.add(`${s.id}@${s.at}`)).sort((x, y) => x.at - y.at);
  return {
    v: 1, progress, times,
    last: perGame((g) => a.last[g] ?? b.last[g]),
    tutorial: perGame((g) => (rankT(a.tutorial[g]) >= rankT(b.tutorial[g]) ? a.tutorial[g] : b.tutorial[g])),
    history: {
      v: 1, matches, streak: Math.max(a.history.streak, b.history.streak),
      bestStreak: Math.max(a.history.bestStreak, b.history.bestStreak),
      starts: perGame((g) => Math.max(a.history.starts[g], b.history.starts[g])),
    },
    achievements,
    cases: { v: 1, records, history: chist },
    prefs: { ...b.prefs, ...a.prefs },
  };
}

/** Comparação estável (a ordem das chaves não importa). */
export function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  const norm = (x: unknown): unknown => Array.isArray(x) ? x.map(norm) : x && typeof x === "object"
    ? Object.fromEntries(Object.keys(x as object).sort().map((k) => [k, norm((x as Record<string, unknown>)[k])])) : x;
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/** Tem algum progresso? (para avisar antes de substituir os dados do aparelho). */
export const hasProgress = (s: Snapshot) =>
  EVERY_GAME.some((g) => s.progress[g].includes("1")) || s.history.matches.length > 0 || Object.keys(s.cases.records).length > 0;

// ---------------------------------------------------------------- servidor

export interface Identity extends RankIdentity {
  /** Código de recuperação (só fica com a pessoa e neste aparelho; o servidor guarda o hash). */
  recovery?: string;
  /** Aparece no ranking. */
  listed?: boolean;
  /** Revisão do progresso no servidor que este aparelho conhece. */
  rev?: number;
}

export function parseIdentityFull(raw: string | null): Identity | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<Identity>;
    if (typeof o.id !== "string" || typeof o.token !== "string" || typeof o.nick !== "string") return null;
    return { id: o.id, token: o.token, nick: o.nick, recovery: typeof o.recovery === "string" ? o.recovery : undefined,
      listed: typeof o.listed === "boolean" ? o.listed : undefined, rev: typeof o.rev === "number" ? o.rev : undefined };
  } catch { return null; }
}

/** Normaliza o código digitado: "abcd efgh-jkmn pqrs" → "ABCD-EFGH-JKMN-PQRS" (ou null se não tem 16 caracteres). */
export function normalizeCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 16 ? `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12)}` : null;
}

export async function createPlayer(nick: string, listed: boolean): Promise<Identity> {
  const r = await rpc<{ id: string; token: string; recovery: string }>("create_player", { p_nick: nick, p_listed: listed });
  return { id: r.id, token: r.token, nick, recovery: r.recovery, listed, rev: 0 };
}

export async function recoverPlayer(code: string): Promise<Identity> {
  const r = await rpc<{ id: string; token: string; nick: string; listed: boolean }>("recover_player", { p_code: code });
  return { id: r.id, token: r.token, nick: r.nick, listed: r.listed, recovery: normalizeCode(code) ?? undefined, rev: 0 };
}

export const issueRecovery = (me: Identity) => rpc<string>("issue_recovery", { p_id: me.id, p_token: me.token });
export const setListed = (me: Identity, listed: boolean) => rpc<null>("set_listed", { p_id: me.id, p_token: me.token, p_listed: listed });
export const resetPlayer = (me: Identity) => rpc<null>("reset_player", { p_id: me.id, p_token: me.token });

export interface Remote { data: Snapshot | null; rev: number; nick: string; listed: boolean }
export async function loadRemote(me: Identity): Promise<Remote> {
  const r = await rpc<{ data: unknown; rev: number; nick: string; listed: boolean }>("load_state", { p_id: me.id, p_token: me.token });
  return { data: parseSnapshot(r.data), rev: r.rev ?? 0, nick: r.nick, listed: r.listed };
}
export const saveRemote = (me: Identity, s: Snapshot, rev: number) => rpc<number>("save_state", { p_id: me.id, p_token: me.token, p_data: s, p_rev: rev });

/**
 * Sincroniza: baixa o que está no servidor, mescla com o aparelho e envia o resultado se mudou.
 * Se outro aparelho salvou no meio do caminho (STALE), baixa de novo e repete (no máximo 3 vezes).
 * Devolve o snapshot mesclado (para gravar no aparelho) e a revisão nova.
 */
export async function syncSnapshot(me: Identity, local: Snapshot): Promise<{ merged: Snapshot; rev: number; nick: string; listed: boolean }> {
  for (let attempt = 0; ; attempt++) {
    const remote = await loadRemote(me);
    const merged = remote.data ? mergeSnapshots(local, remote.data) : local;
    if (remote.data && sameSnapshot(merged, remote.data)) return { merged, rev: remote.rev, nick: remote.nick, listed: remote.listed };
    try {
      const rev = await saveRemote(me, merged, remote.rev);
      return { merged, rev, nick: remote.nick, listed: remote.listed };
    } catch (e) {
      if (e instanceof RankError && e.code === "STALE" && attempt < 2) continue;
      throw e;
    }
  }
}
