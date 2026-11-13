// Mindloop Investigação — gerador do banco de mistérios (usado por scripts/gen_cases.ts, nunca no navegador).
// Para cada caso: monta o cenário (modelo), sorteia uma solução, escolhe pistas verdadeiras até restar UMA
// solução, tira as pistas que sobram e só aceita o caso se ele se resolve inteiro por dedução (sem chute).
// Tudo é determinístico (semente pelo id), então rodar de novo gera o mesmo banco.

import { LEVELS_PER_CHAPTER, type JourneyGame } from "../journey";
import { type Difficulty, caseLevels, difficultyOf } from "./config";
import { type CaseKind, type Clue, type ClueKind, type Ent, type Model, allAssignments, deduce, evalClue, involved, isRule, num } from "./model";
import { KIND_OF, OBJECTS, PEOPLE, PLACES, SYMBOLS, THEMES } from "./themes";

/** Registro guardado no banco (src/lib/cases/data.ts). Os textos são montados a partir dele em catalog.ts. */
export interface CaseData {
  id: string;
  game: JourneyGame;
  /** Oferecido depois desta fase da jornada. */
  level: number;
  chapter: number;
  difficulty: Difficulty;
  /** Índice do tema (história) em THEMES[tipo]. */
  theme: number;
  model: Model;
  clues: Clue[];
  /** Resposta: valor de cada slot. */
  sol: number[];
}

// ---------------------------------------------------------------- aleatório determinístico

export function rngOf(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
type Rng = () => number;
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const ord = (n: number, g: "m" | "f" = "m") => `${n}${g === "f" ? "ª" : "º"}`;

// ---------------------------------------------------------------- dificuldade por tipo

interface Tier {
  kinds: ClueKind[];
  maxIs: number;
  /** Quantidade de pistas (sem contar as regras). */
  clues: [number, number];
  /** Mínimo de pistas que relacionam dois elementos (o coração da dedução). */
  minRel: number;
}
/** No máximo 2 pistas de cada tipo "direto" (evita casos resolvidos por eliminação óbvia). */
const CAP: Partial<Record<ClueKind, number>> = { not: 2, either: 2, parity: 2, row: 2, col: 2 };

function tierOf(kind: CaseKind, d: Difficulty): Tier {
  switch (kind) {
    case "code": return [
      { kinds: ["is", "not", "lt", "parity", "either"], maxIs: 1, clues: [3, 6], minRel: 1 },
      { kinds: ["is", "not", "lt", "parity", "either", "sum", "next"], maxIs: 1, clues: [4, 7], minRel: 2 },
      { kinds: ["not", "lt", "parity", "either", "sum", "next", "diff"], maxIs: 0, clues: [4, 8], minRel: 3 },
      { kinds: ["not", "lt", "parity", "sum", "next", "diff"], maxIs: 0, clues: [5, 9], minRel: 4 },
    ][d - 1] as Tier;
    case "pattern": return [
      { kinds: ["is", "same", "opp"], maxIs: 2, clues: [2, 4], minRel: 1 },
      { kinds: ["is", "same", "opp"], maxIs: 2, clues: [3, 6], minRel: 2 },
      { kinds: ["is", "same", "opp"], maxIs: 2, clues: [3, 7], minRel: 3 },
      { kinds: ["is", "same", "opp"], maxIs: 1, clues: [3, 8], minRel: 4 },
    ][d - 1] as Tier;
    case "route": return [
      { kinds: ["is", "not", "lt", "next"], maxIs: 1, clues: [1, 4], minRel: 0 },
      { kinds: ["is", "not", "lt", "next", "diff", "either"], maxIs: 1, clues: [2, 5], minRel: 1 },
      { kinds: ["not", "lt", "next", "diff", "either"], maxIs: 0, clues: [2, 6], minRel: 1 },
      { kinds: ["not", "lt", "next", "diff", "either"], maxIs: 0, clues: [3, 7], minRel: 2 },
    ][d - 1] as Tier;
    case "layout": return [
      { kinds: ["is", "row", "col", "left", "above", "touch", "not"], maxIs: 1, clues: [3, 6], minRel: 1 },
      { kinds: ["is", "row", "col", "left", "above", "touch", "apart", "not", "either"], maxIs: 1, clues: [4, 7], minRel: 2 },
      { kinds: ["row", "col", "left", "above", "touch", "apart", "not", "either"], maxIs: 0, clues: [4, 8], minRel: 3 },
      { kinds: ["row", "col", "left", "above", "touch", "apart", "not"], maxIs: 0, clues: [5, 9], minRel: 3 },
    ][d - 1] as Tier;
  }
}
/** Pistas "fortes" (dão uma casa de cara) pesam menos no sorteio: preferimos relações. */
const WEIGHT: Partial<Record<ClueKind, number>> = { is: 0.4, not: 0.6, either: 0.6, parity: 0.8, row: 1, col: 1 };

// ---------------------------------------------------------------- cenários

function codeModel(r: Rng, chapter: number, theme: number): Model {
  const n = chapter <= 2 ? 3 : chapter <= 6 ? 4 : 5;
  const V = Math.min(7, n + (difficultyOf(chapter) === 1 ? 1 : 2));
  const noun = THEMES.code[theme].noun!;
  return {
    kind: "code", distinct: true,
    slots: Array.from({ length: n }, (_, i) => ({ label: `${ord(i + 1, noun.g)} ${noun.label}`, g: noun.g })),
    values: Array.from({ length: V }, (_, i) => ({ label: String(i + 1) })),
  };
}

function patternModel(r: Rng, chapter: number, theme: number): Model {
  const n = chapter <= 3 ? 4 : chapter <= 7 ? 6 : 8;
  return { kind: "pattern", distinct: false, slots: shuffle(r, PEOPLE).slice(0, n), values: SYMBOLS, verb: THEMES.pattern[theme].verb };
}

function layoutModel(r: Rng, chapter: number): Model {
  const [rows, cols, n] = chapter <= 2 ? [2, 2, 3] : chapter <= 5 ? [2, 3, 4] : chapter <= 8 ? [3, 3, 4] : [3, 3, 5];
  const values: Ent[] = Array.from({ length: rows * cols }, (_, v) => ({ label: `${"ABC"[v % cols]}${Math.floor(v / cols) + 1}` }));
  return { kind: "layout", distinct: true, grid: [rows, cols], slots: shuffle(r, OBJECTS).slice(0, n), values };
}

/** Mapa: lugares em pontos de uma grade, caminho-solução por vizinhos ortogonais (estradas nunca se cruzam). */
function routeModel(r: Rng, chapter: number): { model: Model; sol: number[] } | null {
  const n = chapter <= 3 ? 4 : chapter <= 6 ? 5 : 6;
  const d = difficultyOf(chapter);
  const [R, C] = n <= 4 ? [2, 3] : [3, 3];
  const key = (y: number, x: number) => y * C + x;
  // caminho aleatório que não se repete (busca com retrocesso)
  let path: number[] | null = null;
  const walk = (cur: number[]): boolean => {
    if (cur.length === n) { path = cur.slice(); return true; }
    const last = cur[cur.length - 1];
    const [y, x] = [Math.floor(last / C), last % C];
    for (const [dy, dx] of shuffle(r, [[1, 0], [-1, 0], [0, 1], [0, -1]])) {
      const ny = y + dy, nx = x + dx;
      if (ny < 0 || nx < 0 || ny >= R || nx >= C || cur.includes(key(ny, nx))) continue;
      cur.push(key(ny, nx));
      if (walk(cur)) return true;
      cur.pop();
    }
    return false;
  };
  walk([Math.floor(r() * R * C)]);
  if (!path) return null;
  const cells: number[] = path;
  const places = shuffle(r, PLACES).slice(0, n);
  const order = shuffle(r, cells.map((_, i) => i)); // slot i = lugar i; order[i] = passo do lugar i
  const cellOf = (slot: number) => cells[order[slot]];
  const slotAt = (step: number) => order.indexOf(step);
  const edges: [number, number][] = [];
  for (let k = 1; k < n; k++) edges.push([slotAt(k - 1), slotAt(k)]);
  // estradas extras entre lugares vizinhos (mais estradas = mais caminhos possíveis = caso mais difícil)
  const extra: [number, number][] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const p = cellOf(a), q = cellOf(b);
    const adj = Math.abs(Math.floor(p / C) - Math.floor(q / C)) + Math.abs((p % C) - (q % C)) === 1;
    if (adj && Math.abs(order[a] - order[b]) !== 1) extra.push([a, b]);
  }
  edges.push(...shuffle(r, extra).slice(0, d + 1));
  // Posições no mapa: a parte da grade realmente usada é esticada para ocupar o mapa inteiro (com leve variação).
  const xs = cells.map((c) => c % C), ys = cells.map((c) => Math.floor(c / C));
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pos: [number, number][] = places.map((_, s) => {
    const c = cellOf(s);
    const jx = (r() - 0.5) * 8, jy = (r() - 0.5) * 8;
    return [Math.round(16 + ((c % C) - x0) * (68 / Math.max(1, x1 - x0)) + jx), Math.round(20 + (Math.floor(c / C) - y0) * (62 / Math.max(1, y1 - y0)) + jy)];
  });
  return {
    model: { kind: "route", distinct: true, slots: places, values: places.map((_, i) => ({ label: String(i + 1) })), edges, pos },
    sol: order,
  };
}

// ---------------------------------------------------------------- pistas

function candidates(m: Model, sol: number[], kinds: ClueKind[]): Clue[] {
  const S = m.slots.length, V = m.values.length;
  const n = (s: number) => num(m, sol[s]);
  const rcOf = (s: number) => [Math.floor(sol[s] / m.grid![1]), sol[s] % m.grid![1]];
  const out: Clue[] = [];
  const has = (k: ClueKind) => kinds.includes(k);
  for (let s = 0; s < S; s++) {
    if (has("is")) out.push({ k: "is", s, v: sol[s] });
    for (let v = 0; v < V; v++) if (v !== sol[s]) {
      if (has("not")) out.push({ k: "not", s, v });
      if (has("either")) out.push({ k: "either", s, v: v < sol[s] ? [v, sol[s]] : [sol[s], v] });
    }
    if (has("parity")) out.push({ k: "parity", s, even: n(s) % 2 === 0 });
    if (has("row")) out.push({ k: "row", s, r: rcOf(s)[0] });
    if (has("col")) out.push({ k: "col", s, c: rcOf(s)[1] });
  }
  for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) {
    if (a === b) continue;
    if (has("lt") && n(a) < n(b)) out.push({ k: "lt", a, b });
    if (has("next") && n(b) === n(a) + 1) out.push({ k: "next", a, b });
    if (a > b) continue;
    if (has("diff") && n(a) !== n(b)) out.push({ k: "diff", a, b, d: Math.abs(n(a) - n(b)) });
    if (has("sum")) out.push({ k: "sum", ss: [a, b], t: n(a) + n(b) });
    if (has("same") && sol[a] === sol[b]) out.push({ k: "same", a, b });
    if (has("opp") && sol[a] !== sol[b]) out.push({ k: "opp", a, b });
    if (m.grid) {
      const [r1, c1] = rcOf(a), [r2, c2] = rcOf(b);
      const touch = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
      if (has("touch") && touch) out.push({ k: "touch", a, b });
      if (has("apart") && !touch) out.push({ k: "apart", a, b });
    }
  }
  if (m.grid) for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) {
    if (a === b) continue;
    const [r1, c1] = rcOf(a), [r2, c2] = rcOf(b);
    if (has("left") && c1 < c2) out.push({ k: "left", a, b });
    if (has("above") && r1 < r2) out.push({ k: "above", a, b });
  }
  return out.filter((c) => evalClue(m, c, sol));
}

/** Escolhe pistas até a solução ser única; depois remove as dispensáveis. null se o caso não fica bom. */
function chooseClues(r: Rng, m: Model, sol: number[], rules: Clue[], tier: Tier): Clue[] | null {
  const base = allAssignments(m).filter((a) => rules.every((c) => evalClue(m, c, a)));
  const cands = candidates(m, sol, tier.kinds)
    .map((c) => ({ c, key: r() ** (1 / (WEIGHT[c.k] ?? 2)) }))
    .sort((x, y) => y.key - x.key).map((x) => x.c);
  let rem = base;
  const chosen: Clue[] = [];
  const used: Partial<Record<ClueKind, number>> = {};
  for (const c of cands) {
    if (rem.length === 1) break;
    if ((used[c.k] ?? 0) >= (c.k === "is" ? tier.maxIs : CAP[c.k] ?? Infinity)) continue;
    const next = rem.filter((a) => evalClue(m, c, a));
    if (next.length < rem.length) { chosen.push(c); rem = next; used[c.k] = (used[c.k] ?? 0) + 1; }
  }
  if (rem.length !== 1) return null;
  // Minimiza: tira cada pista que não faz falta para a solução continuar única.
  let kept = chosen;
  for (const c of shuffle(r, chosen)) {
    const without = kept.filter((x) => x !== c);
    if (base.filter((a) => without.every((x) => evalClue(m, x, a))).length === 1) kept = without;
  }
  if (kept.length < tier.clues[0] || kept.length > tier.clues[1]) return null;
  if (kept.filter((c) => involved(m, c).length > 1).length < tier.minRel) return null;
  // Duas pistas sobre o mesmo slot que juntas viram uma resposta direta ("é 3 ou 4" + "não é 3") ficam de fora.
  for (const x of kept) for (const y of kept) if (x !== y && involved(m, x).length === 1 && involved(m, y).length === 1 && involved(m, x)[0] === involved(m, y)[0]) return null;
  return shuffle(r, kept);
}

/** Gera um caso completo (com várias tentativas até achar um bom). */
export function generateCase(game: JourneyGame, level: number, index: number): CaseData {
  const kind = KIND_OF[game];
  const chapter = Math.ceil(level / LEVELS_PER_CHAPTER);
  const difficulty = difficultyOf(chapter);
  const tier = tierOf(kind, difficulty);
  const theme = index % THEMES[kind].length;
  const id = `${game}-${String(level).padStart(2, "0")}`;
  for (let attempt = 0; attempt < 3000; attempt++) {
    const r = rngOf(`${id}#${attempt}`);
    let model: Model, sol: number[];
    if (kind === "route") {
      const g = routeModel(r, chapter);
      if (!g) continue;
      ({ model, sol } = g);
    } else {
      model = kind === "code" ? codeModel(r, chapter, theme) : kind === "pattern" ? patternModel(r, chapter, theme) : layoutModel(r, chapter);
      const all = allAssignments(model);
      const rules0: Clue[] = kind === "pattern" ? [{ k: "count" }, { k: "noTriple" }] : [];
      const valid = all.filter((a) => rules0.every((c) => evalClue(model, c, a)));
      sol = pick(r, valid);
    }
    const rules: Clue[] = kind === "pattern" ? [{ k: "count" }, { k: "noTriple" }] : kind === "route" ? [{ k: "roads" }] : [];
    const clues = chooseClues(r, model, sol, rules, tier);
    if (!clues) continue;
    const all = [...rules, ...clues];
    if (!deduce(model, all).solved) continue;
    return { id, game, level, chapter, difficulty, theme, model, clues: all, sol };
  }
  throw new Error(`Não foi possível gerar o caso ${id}`);
}

/** O banco inteiro: um caso para cada fase da agenda (config.ts), em todos os jogos. */
export function generateAll(games: JourneyGame[]): CaseData[] {
  const out: CaseData[] = [];
  for (const g of games) caseLevels(g).forEach((level, i) => out.push(generateCase(g, level, i)));
  return out;
}

export { isRule };
