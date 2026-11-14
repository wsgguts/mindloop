// Mindloop Investigação — gerador do banco de mistérios (usado por scripts/gen_cases.ts, nunca no navegador).
// Cada caso nasce de três ingredientes:
//   • a HISTÓRIA (stories/*.ts): única para aquele caso, com personagens, cenário, voz e desfecho próprios;
//   • a ESTRUTURA investigativa (structures.ts): a forma do raciocínio (exclusão, cruzamento, sequência…);
//   • a DIFICULDADE do capítulo (tamanho do problema, tipos de pista liberados, profundidade da dedução).
// Para cada caso: monta o cenário, sorteia uma solução, escolhe pistas verdadeiras até restar UMA solução, tira as
// que sobram e só aceita o caso se ele (1) se resolve inteiro por dedução, (2) tem de fato a forma da estrutura e
// (3) não repete o caso anterior do mesmo jogo (estrutura, quantidade de pistas, combinação de tipos e resposta).
// Tudo é determinístico (semente pelo id), então rodar de novo gera o mesmo banco.

import { LEVELS_PER_CHAPTER, type JourneyGame } from "../journey";
import { type Difficulty, caseLevels, difficultyOf } from "./config";
import { type CaseKind, type Clue, type ClueKind, type Ent, type Model, allAssignments, deduce, evalClue, involved, isRule, num } from "./model";
import { POOLS, STRUCTURES, type StructureId, structurePlan } from "./structures";
import { KIND_OF, STORIES } from "./themes";

/** Registro guardado no banco (src/lib/cases/data.ts). Os textos são montados a partir dele em catalog.ts. */
export interface CaseData {
  id: string;
  game: JourneyGame;
  /** Oferecido depois desta fase da jornada. */
  level: number;
  chapter: number;
  difficulty: Difficulty;
  /** Chave da história (stories/*.ts). */
  story: string;
  /** Estrutura investigativa (forma do raciocínio). */
  structure: StructureId;
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

// ---------------------------------------------------------------- dificuldade por tipo

interface Tier {
  /** Tipos de pista liberados nesta dificuldade (a estrutura escolhe dentre eles). */
  gate: ClueKind[];
  /** Quantidade de pistas (sem contar as regras). */
  clues: [number, number];
  /** Mínimo de pistas que relacionam dois ou mais elementos (o coração da dedução). */
  minRel: number;
  /** Rodadas de dedução: mínimo e máximo (encadeamento das descobertas). */
  rounds: [number, number];
}

/** Limite de pistas de cada tipo (evita casos resolvidos por eliminação óbvia). */
const CAP: Partial<Record<ClueKind, number>> = { not: 2, either: 2, parity: 2, row: 2, col: 2, countIn: 2, sum: 2, twice: 1, between: 2, sameRow: 2, sameCol: 2 };

const ALL_CODE: ClueKind[] = ["is", "not", "either", "lt", "next", "parity", "between", "sum", "diff", "twice"];
const ALL_LAYOUT: ClueKind[] = ["is", "row", "col", "left", "above", "touch", "not", "sameRow", "sameCol", "apart", "either"];

export function tierOf(kind: CaseKind, d: Difficulty): Tier {
  const no = (xs: ClueKind[], ...out: ClueKind[]) => xs.filter((k) => !out.includes(k));
  switch (kind) {
    case "code": return [
      { gate: no(ALL_CODE, "sum", "diff", "twice"), clues: [3, 5], minRel: 1, rounds: [1, 3] },
      { gate: no(ALL_CODE, "twice"), clues: [4, 6], minRel: 2, rounds: [2, 4] },
      { gate: no(ALL_CODE, "is"), clues: [4, 7], minRel: 3, rounds: [2, 6] },
      { gate: no(ALL_CODE, "is"), clues: [5, 8], minRel: 3, rounds: [3, 8] },
    ][d - 1] as Tier;
    case "pattern": return [
      { gate: ["is", "same", "opp", "countIn"], clues: [2, 4], minRel: 1, rounds: [1, 3] },
      { gate: ["is", "same", "opp", "countIn"], clues: [2, 5], minRel: 2, rounds: [2, 4] },
      { gate: ["is", "same", "opp", "countIn"], clues: [3, 6], minRel: 3, rounds: [2, 6] },
      { gate: ["is", "same", "opp", "countIn"], clues: [4, 7], minRel: 4, rounds: [3, 8] },
    ][d - 1] as Tier;
    case "route": return [
      { gate: ["is", "not", "lt", "next", "between", "either"], clues: [1, 3], minRel: 0, rounds: [1, 4] },
      { gate: ["is", "not", "lt", "next", "between", "either", "diff"], clues: [1, 4], minRel: 1, rounds: [2, 5] },
      { gate: ["not", "lt", "next", "between", "either", "diff"], clues: [2, 5], minRel: 1, rounds: [2, 6] },
      { gate: ["not", "lt", "next", "between", "either", "diff"], clues: [3, 6], minRel: 2, rounds: [2, 8] },
    ][d - 1] as Tier;
    case "layout": return [
      { gate: no(ALL_LAYOUT, "apart", "either"), clues: [3, 5], minRel: 1, rounds: [1, 3] },
      { gate: ALL_LAYOUT, clues: [4, 6], minRel: 2, rounds: [2, 4] },
      { gate: no(ALL_LAYOUT, "is"), clues: [4, 7], minRel: 3, rounds: [2, 6] },
      { gate: no(ALL_LAYOUT, "is"), clues: [5, 8], minRel: 3, rounds: [3, 8] },
    ][d - 1] as Tier;
  }
}
/** Pistas "fortes" (dão uma casa de cara) pesam menos no sorteio: preferimos relações. */
const WEIGHT: Partial<Record<ClueKind, number>> = { is: 0.4, not: 0.6, either: 0.6, parity: 0.8, row: 1, col: 1 };

// ---------------------------------------------------------------- cenários (a partir da história)

/** Tamanho do problema pelo capítulo (cresce ao longo da jornada). */
export function sizeOf(kind: CaseKind, chapter: number): { n: number; V?: number; grid?: [number, number] } {
  const d = difficultyOf(chapter);
  switch (kind) {
    case "code": { const n = chapter <= 2 ? 3 : chapter <= 6 ? 4 : 5; return { n, V: Math.min(7, n + (d === 1 ? 1 : 2)) }; }
    case "pattern": return { n: chapter <= 2 ? 4 : chapter <= 7 ? 6 : 8 };
    case "route": return { n: chapter <= 3 ? 4 : chapter <= 6 ? 5 : 6 };
    case "layout": { const [r, c, n] = chapter <= 2 ? [2, 2, 3] : chapter <= 5 ? [2, 3, 4] : chapter <= 8 ? [3, 3, 4] : [3, 3, 5]; return { n, grid: [r, c] }; }
  }
}

const strip = (e: Ent): Ent => ({ label: e.label, ...(e.g ? { g: e.g } : {}), ...(e.icon ? { icon: e.icon } : {}), ...(e.pl ? { pl: e.pl } : {}) });

function baseModel(kind: CaseKind, chapter: number, slots: Ent[], values?: Ent[]): Model {
  const sz = sizeOf(kind, chapter);
  const S = slots.slice(0, sz.n).map(strip);
  if (kind === "code") return { kind, distinct: true, slots: S, values: Array.from({ length: sz.V! }, (_, i) => ({ label: String(i + 1) })) };
  if (kind === "pattern") return { kind, distinct: false, slots: S, values: values!.map(strip) };
  const [rows, cols] = sz.grid!;
  return { kind, distinct: true, grid: [rows, cols], slots: S, values: Array.from({ length: rows * cols }, (_, v) => ({ label: `${"ABC"[v % cols]}${Math.floor(v / cols) + 1}` })) };
}

/** Mapa: lugares em pontos de uma grade, caminho-solução por vizinhos ortogonais (estradas nunca se cruzam). */
function routeModel(r: Rng, chapter: number, places0: Ent[]): { model: Model; sol: number[] } | null {
  const n = sizeOf("route", chapter).n;
  const d = difficultyOf(chapter);
  // 4 e 5 lugares numa grade 2×3 (mapa mais ligado, mais caminhos possíveis); 6 lugares numa 3×3.
  const [R, C] = n <= 5 ? [2, 3] : [3, 3];
  const key = (y: number, x: number) => y * C + x;
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
  const places = places0.slice(0, n).map(strip);
  const order = shuffle(r, cells.map((_, i) => i)); // slot i = lugar i; order[i] = passo do lugar i
  const cellOf = (slot: number) => cells[order[slot]];
  const slotAt = (step: number) => order.indexOf(step);
  const edges: [number, number][] = [];
  for (let k = 1; k < n; k++) edges.push([slotAt(k - 1), slotAt(k)]);
  // Estradas extras entre lugares vizinhos — também na diagonal, desde que duas diagonais nunca se cruzem
  // (mais estradas = mais caminhos possíveis = mais raciocínio e mais pistas necessárias).
  const extra: [number, number][] = [];
  const dyx = (a: number, b: number) => [Math.abs(Math.floor(cellOf(a) / C) - Math.floor(cellOf(b) / C)), Math.abs((cellOf(a) % C) - (cellOf(b) % C))];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const [dy, dx] = dyx(a, b);
    if ((dy + dx === 1 || (dy === 1 && dx === 1)) && Math.abs(order[a] - order[b]) !== 1) extra.push([a, b]);
  }
  /** Duas diagonais do mesmo quadradinho se cruzam. */
  const crosses = ([a, b]: [number, number], [p, q]: [number, number]) => {
    const [dy1, dx1] = dyx(a, b), [dy2, dx2] = dyx(p, q);
    if (dy1 !== 1 || dx1 !== 1 || dy2 !== 1 || dx2 !== 1) return false;
    const box = (u: number, v: number) => [Math.min(Math.floor(cellOf(u) / C), Math.floor(cellOf(v) / C)), Math.min(cellOf(u) % C, cellOf(v) % C)].join();
    return box(a, b) === box(p, q);
  };
  const want = d + 1 + (n >= 5 ? 1 : 0);
  for (const e of shuffle(r, extra)) {
    if (edges.length - (n - 1) >= want) break;
    if (!edges.some((f) => crosses(e, f))) edges.push(e);
  }
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
    if (has("twice") && n(a) === 2 * n(b)) out.push({ k: "twice", a, b });
    if (has("between")) for (let s = 0; s < S; s++) if (s !== a && s !== b && n(a) < n(s) && n(s) < n(b)) out.push({ k: "between", s, a, b });
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
      if (has("sameRow") && r1 === r2) out.push({ k: "sameRow", a, b });
      if (has("sameCol") && c1 === c2) out.push({ k: "sameCol", a, b });
    }
  }
  if (m.grid) for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) {
    if (a === b) continue;
    const [r1, c1] = rcOf(a), [r2, c2] = rcOf(b);
    if (has("left") && c1 < c2) out.push({ k: "left", a, b });
    if (has("above") && r1 < r2) out.push({ k: "above", a, b });
  }
  // Grupos de três: somas (Mini Sudoku) e contagens (Tango).
  for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let c = b + 1; c < S; c++) {
    const ss = [a, b, c];
    if (has("sum") && S >= 4) out.push({ k: "sum", ss, t: n(a) + n(b) + n(c) });
    if (has("countIn")) for (const v of [0, 1]) {
      const k = ss.filter((s) => sol[s] === v).length;
      if (k === 3 || k === 1) out.push({ k: "countIn", ss, v, n: k });
      if (k === 0) out.push({ k: "countIn", ss, v, n: 0 });
    }
  }
  return out.filter((c) => evalClue(m, c, sol));
}

/** Escolhe pistas até a solução ser única; depois remove as dispensáveis. null se o caso não fica bom. */
function chooseClues(r: Rng, m: Model, sol: number[], rules: Clue[], kinds: ClueKind[], maxIs: number, favor: Partial<Record<ClueKind, number>>, range: [number, number], minRel: number): Clue[] | null {
  const base = allAssignments(m).filter((a) => rules.every((c) => evalClue(m, c, a)));
  const cands = candidates(m, sol, kinds)
    .map((c) => ({ c, key: r() ** (1 / ((WEIGHT[c.k] ?? 2) * (favor[c.k] ?? 1))) }))
    .sort((x, y) => y.key - x.key).map((x) => x.c);
  let rem = base;
  const chosen: Clue[] = [];
  const used: Partial<Record<ClueKind, number>> = {};
  for (const c of cands) {
    if (rem.length === 1) break;
    if ((used[c.k] ?? 0) >= (c.k === "is" ? maxIs : CAP[c.k] ?? Infinity)) continue;
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
  if (kept.length < range[0] || kept.length > range[1]) return null;
  if (kept.filter((c) => involved(m, c).length > 1).length < minRel) return null;
  // Duas pistas sobre o mesmo slot que juntas viram uma resposta direta ("é 3 ou 4" + "não é 3") ficam de fora.
  for (const x of kept) for (const y of kept) if (x !== y && involved(m, x).length === 1 && involved(m, y).length === 1 && involved(m, x)[0] === involved(m, y)[0]) return null;
  return shuffle(r, kept);
}

// ---------------------------------------------------------------- impressão digital (para comparar casos)

/** Combinação de tipos de pista (ignora nomes e números): dois casos com a mesma assinatura raciocinam parecido. */
export const signature = (clues: Clue[]) => clues.filter((c) => !isRule(c)).map((c) => c.k).sort().join(",");
export const clueCount = (clues: Clue[]) => clues.filter((c) => !isRule(c)).length;

/**
 * O caso novo é diferente o bastante dos anteriores do mesmo jogo? Sempre: outra estrutura, outra combinação de
 * tipos de pista e outra resposta. Quantidade de pistas, do mais exigente ao mais tolerante:
 *   2 → diferente das DUAS anteriores (quebra o vaivém 4, 5, 4, 5…);  1 → diferente da anterior;
 *   0 → pode repetir a anterior, mas nunca três casos seguidos com a mesma quantidade.
 */
type Strict = 0 | 1 | 2;
function variesFrom(prev: CaseData | undefined, prev2: CaseData | undefined, structure: StructureId, clues: Clue[], sol: number[], strict: Strict): boolean {
  if (!prev) return true;
  const n = clueCount(clues), p1 = clueCount(prev.clues), p2 = prev2 ? clueCount(prev2.clues) : -1;
  const countOk = strict === 2 ? n !== p1 && n !== p2 : strict === 1 ? n !== p1 : n !== p1 || n !== p2;
  return prev.structure !== structure && countOk && signature(prev.clues) !== signature(clues) && prev.sol.join() !== sol.join();
}

// ---------------------------------------------------------------- geração

/** Motivos de descarte (diagnóstico do gerador; não afeta o resultado). */
export const REJECTS: Record<string, number> = {};
const rej = (k: string) => { REJECTS[k] = (REJECTS[k] ?? 0) + 1; };

/** Diagnóstico: o caso sai com esta estrutura (sem vizinhos)? */
export function tryStructure(game: JourneyGame, level: number, index: number, structure: StructureId) { return attemptCase(game, level, index, structure, [], 1, 4000); }

/** Tenta gerar o caso com uma estrutura. */
function attemptCase(game: JourneyGame, level: number, index: number, structure: StructureId, before: CaseData[], strict: Strict, tries: number): CaseData | null {
  const [prev, prev2] = before;
  const kind = KIND_OF[game];
  const chapter = Math.ceil(level / LEVELS_PER_CHAPTER);
  const difficulty = difficultyOf(chapter);
  const tier = tierOf(kind, difficulty);
  const st = STRUCTURES[structure];
  const story = STORIES[game][index];
  const kinds = (st.kinds[kind] ?? []).filter((k) => tier.gate.includes(k));
  const range: [number, number] = structure === "percurso" ? [1, 2] : tier.clues;
  const minRel = structure === "percurso" ? 0 : tier.minRel;
  const id = `${game}-${String(level).padStart(2, "0")}`;
  for (let attempt = 0; attempt < tries; attempt++) {
    const r = rngOf(`${id}#${structure}#${attempt}`);
    let model: Model, sol: number[];
    if (kind === "route") {
      const g = routeModel(r, chapter, story.slots);
      if (!g) { rej("mapa"); continue; }
      ({ model, sol } = g);
    } else {
      model = baseModel(kind, chapter, story.slots, story.values);
      const rules0: Clue[] = kind === "pattern" ? [{ k: "count" }, { k: "noTriple" }] : [];
      sol = pick(r, allAssignments(model).filter((a) => rules0.every((c) => evalClue(model, c, a))));
    }
    if (prev && prev.sol.join() === sol.join()) { rej("sol=anterior"); continue; }
    const rules: Clue[] = kind === "pattern" ? [{ k: "count" }, { k: "noTriple" }] : kind === "route" ? [{ k: "roads" }] : [];
    const clues = chooseClues(r, model, sol, rules, kinds, st.maxIsBy?.[kind] ?? st.maxIs, st.favor ?? {}, range, minRel);
    if (!clues) { rej("pistas"); continue; }
    const all = [...rules, ...clues];
    const ded = deduce(model, all);
    if (!ded.solved) { rej("chute"); continue; }
    if (ded.rounds < tier.rounds[0] || ded.rounds > tier.rounds[1]) { rej("rodadas"); continue; }
    if (!st.need({ m: model, clues: all, ded, difficulty })) { rej(`forma:${structure}`); continue; }
    if (!variesFrom(prev, prev2, structure, all, sol, strict)) { rej("igual-anterior"); continue; }
    return { id, game, level, chapter, difficulty, story: story.key, structure, model, clues: all, sol };
  }
  return null;
}

/**
 * Gera um caso completo. Usa a estrutura da agenda; se ela não couber no tamanho do problema, tenta as outras
 * estruturas da mesma dificuldade (nunca a do caso anterior; a do penúltimo fica por último).
 * `prev` e `prev2` = os dois casos anteriores do mesmo jogo.
 */
export function generateCase(game: JourneyGame, level: number, index: number, prev?: CaseData, prev2?: CaseData): CaseData {
  const kind = KIND_OF[game];
  if (!STORIES[game][index]) throw new Error(`Falta a história ${index + 1} de ${game}`);
  const levels = caseLevels(game);
  const plan = structurePlan(game, kind, levels.map((l) => difficultyOf(Math.ceil(l / LEVELS_PER_CHAPTER))));
  const d = difficultyOf(Math.ceil(level / LEVELS_PER_CHAPTER));
  const rest = POOLS[kind][d].filter((s) => s !== plan[index]);
  const order = [plan[index], ...rest.filter((s) => s !== prev2?.structure), ...rest.filter((s) => s === prev2?.structure)].filter((s) => s !== prev?.structure);
  const before = [prev, prev2].filter((x): x is CaseData => !!x);
  // Em metade dos casos (sorteio fixo pelo id), tenta primeiro uma quantidade de pistas nova em relação às duas anteriores.
  const phases: Strict[] = rngOf(`${game}-${level}#variar`)() < 0.5 ? [2, 1, 0] : [1, 0];
  for (const strict of phases) for (const s of order) {
    const c = attemptCase(game, level, index, s, before, strict, strict === 2 ? 250 : 3000);
    if (c) return c;
  }
  throw new Error(`Não foi possível gerar o caso ${game}-${level}`);
}

/** Todos os casos de um jogo, em ordem (cada um conhece o anterior para não repeti-lo). */
export function generateGame(game: JourneyGame): CaseData[] {
  const out: CaseData[] = [];
  const levels = caseLevels(game);
  if (STORIES[game].length !== levels.length) throw new Error(`${game}: ${STORIES[game].length} histórias para ${levels.length} casos`);
  levels.forEach((level, i) => out.push(generateCase(game, level, i, out[i - 1], out[i - 2])));
  return out;
}

/** O banco inteiro: um caso para cada fase da agenda (config.ts), em todos os jogos. */
export function generateAll(games: JourneyGame[]): CaseData[] {
  return games.flatMap(generateGame);
}

export { isRule };
