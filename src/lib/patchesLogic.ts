// Lógica pura do Patches (sem imports: usada pelo jogo, pelos testes e por scripts/gen_patches.mjs).
// Quebra-cabeça de encaixe: cobrir toda a grade com peças retangulares (quadrados também valem).
// Regras: (1) toda casa fica coberta por exatamente uma peça; (2) cada peça contém exatamente um número;
// (3) o número diz quantas casas a peça ocupa.

export type Cell = [number, number];
export interface Clue { r: number; c: number; v: number }
/** Peça: canto de cima à esquerda (r, c), altura h e largura w, em casas. */
export interface Rect { r: number; c: number; h: number; w: number }
export interface PatchesBoard { n: number; clues: Clue[] }

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Formato: "6|<n·n casas: '.' vazia; 1–9 e a–z (10–35) são os números>" */
export function parsePatches(raw: string): PatchesBoard {
  const [ns, cells = ""] = raw.split("|");
  const n = Number(ns);
  if (!Number.isInteger(n) || n < 2 || cells.length !== n * n) throw new Error(`Nível inválido: ${raw}`);
  const clues: Clue[] = [];
  for (let i = 0; i < n * n; i++) {
    const ch = cells[i];
    if (ch === ".") continue;
    const v = DIGITS.indexOf(ch);
    if (v < 1) throw new Error(`Número inválido "${ch}" em ${raw}`);
    clues.push({ r: Math.floor(i / n), c: i % n, v });
  }
  return { n, clues };
}
export function encodePatches(b: PatchesBoard): string {
  const cells = Array<string>(b.n * b.n).fill(".");
  for (const k of b.clues) cells[k.r * b.n + k.c] = DIGITS[k.v];
  return `${b.n}|${cells.join("")}`;
}

// ---------- Geometria ----------
export const area = (q: Rect) => q.h * q.w;
export const inRect = (q: Rect, r: number, c: number) => r >= q.r && r < q.r + q.h && c >= q.c && c < q.c + q.w;
export const overlaps = (a: Rect, b: Rect) => a.r < b.r + b.h && b.r < a.r + a.h && a.c < b.c + b.w && b.c < a.c + a.w;
export const sameRect = (a: Rect, b: Rect) => a.r === b.r && a.c === b.c && a.h === b.h && a.w === b.w;
/** Retângulo entre duas casas quaisquer (cantos opostos). */
export function rectFrom(a: Cell, b: Cell): Rect {
  return { r: Math.min(a[0], b[0]), c: Math.min(a[1], b[1]), h: Math.abs(a[0] - b[0]) + 1, w: Math.abs(a[1] - b[1]) + 1 };
}
export function rectCells(q: Rect): Cell[] {
  const out: Cell[] = [];
  for (let r = q.r; r < q.r + q.h; r++) for (let c = q.c; c < q.c + q.w; c++) out.push([r, c]);
  return out;
}
export const cluesIn = (b: PatchesBoard, q: Rect) => b.clues.filter((k) => inRect(q, k.r, k.c));
export const pieceAt = (pieces: Rect[], r: number, c: number) => pieces.find((q) => inRect(q, r, c));

// ---------- Validação ----------
export type ProblemKind = "vazia" | "varios" | "tamanho";
export interface Problem { kind: ProblemKind; piece: Rect; clues: Clue[] }

/** O que está errado numa peça sozinha (ou null se ela está de acordo com as regras). */
export function pieceProblem(b: PatchesBoard, q: Rect): Problem | null {
  const ks = cluesIn(b, q);
  if (!ks.length) return { kind: "vazia", piece: q, clues: ks };
  if (ks.length > 1) return { kind: "varios", piece: q, clues: ks };
  if (ks[0].v !== area(q)) return { kind: "tamanho", piece: q, clues: ks };
  return null;
}
export const findProblems = (b: PatchesBoard, pieces: Rect[]): Problem[] =>
  pieces.map((q) => pieceProblem(b, q)).filter((p): p is Problem => p !== null);
/** Casas cobertas (as peças nunca se sobrepõem: colocar uma peça tira as que ela cobre). */
export const coveredCount = (pieces: Rect[]) => pieces.reduce((s, q) => s + area(q), 0);
export const isPatchesSolved = (b: PatchesBoard, pieces: Rect[]) =>
  coveredCount(pieces) === b.n * b.n && findProblems(b, pieces).length === 0;

// ---------- Peças possíveis ----------
/** Todos os encaixes de um número: área certa, dentro da grade e sem nenhum outro número dentro. */
export function shapesOf(b: PatchesBoard, k: Clue): Rect[] {
  const out: Rect[] = [];
  for (let h = 1; h <= k.v; h++) {
    if (k.v % h) continue;
    const w = k.v / h;
    if (h > b.n || w > b.n) continue;
    for (let r = k.r - h + 1; r <= k.r; r++) for (let c = k.c - w + 1; c <= k.c; c++) {
      if (r < 0 || c < 0 || r + h > b.n || c + w > b.n) continue;
      const q = { r, c, h, w };
      if (b.clues.some((o) => o !== k && inRect(q, o.r, o.c))) continue;
      out.push(q);
    }
  }
  return out;
}

// ---------- Solucionador lógico (o mesmo raciocínio das dicas) ----------
// "unico":   o número só tem um encaixe possível.
// "casa":    uma casa só pode ser coberta por um número — então a peça dele precisa passar por ali.
// "reserva": todos os encaixes de um número vizinho usam certas casas; elas ficam reservadas para ele.
export type Reason = "unico" | "casa" | "reserva";
export interface Deduction { clue: number; rect: Rect; reason: Reason; cell?: Cell; other?: number }
export interface LogicResult { pieces: Rect[] | null; steps: Deduction[]; placed: number; reserve: number }

/**
 * Resolve só com lógica, a partir das peças já fixadas (`fixed[i]` = peça do número i, ou null).
 * `allowReserve` libera o raciocínio mais difícil ("reserva"). Devolve as peças (ou null, se travar)
 * e os passos na ordem em que cada número foi descoberto.
 */
export function solveLogically(b: PatchesBoard, fixed: (Rect | null)[] = [], allowReserve = true): LogicResult {
  const K = b.clues.length, n = b.n;
  let cand: Rect[][] = b.clues.map((k, i) => (fixed[i] ? [fixed[i]!] : shapesOf(b, k)));
  const done: boolean[] = b.clues.map((_, i) => !!fixed[i]);
  const why: { reason: Reason; cell?: Cell; other?: number }[] = b.clues.map(() => ({ reason: "unico" }));
  const steps: Deduction[] = [];
  let reserve = 0;
  const fail = (): LogicResult => ({ pieces: null, steps, placed: done.filter(Boolean).length, reserve });

  const clearAround = (i: number) => {
    const q = cand[i][0];
    for (let j = 0; j < K; j++) if (j !== i) cand[j] = cand[j].filter((x) => !overlaps(x, q));
  };
  for (let i = 0; i < K; i++) if (done[i]) clearAround(i);

  for (;;) {
    if (cand.some((cs) => !cs.length)) return fail();
    // 1) Números com um só encaixe.
    let placedNow = false;
    for (let i = 0; i < K; i++) {
      if (done[i] || cand[i].length !== 1) continue;
      done[i] = true; placedNow = true;
      steps.push({ clue: i, rect: cand[i][0], ...why[i] });
      clearAround(i);
      if (cand.some((cs) => !cs.length)) return fail();
    }
    if (done.every(Boolean)) break;
    if (placedNow) continue;

    // 2) Casas que só um número alcança.
    let changed = false;
    const covered: boolean[] = Array(n * n).fill(false);
    for (let i = 0; i < K; i++) if (done[i]) for (const [r, c] of rectCells(cand[i][0])) covered[r * n + c] = true;
    for (let r = 0; r < n && !changed; r++) for (let c = 0; c < n && !changed; c++) {
      if (covered[r * n + c]) continue;
      const owners: number[] = [];
      for (let i = 0; i < K; i++) if (!done[i] && cand[i].some((q) => inRect(q, r, c))) owners.push(i);
      if (!owners.length) return fail();
      if (owners.length === 1) {
        const i = owners[0];
        const keep = cand[i].filter((q) => inRect(q, r, c));
        if (keep.length < cand[i].length) { cand[i] = keep; why[i] = { reason: "casa", cell: [r, c] }; changed = true; }
      }
    }
    if (changed) continue;

    // 3) Casas reservadas: todo encaixe de um número usa essas casas, então os outros não podem usá-las.
    if (allowReserve) {
      for (let i = 0; i < K && !changed; i++) {
        if (done[i]) continue;
        const common = rectCells(cand[i][0]).filter(([r, c]) => cand[i].every((q) => inRect(q, r, c)));
        if (!common.length) continue;
        for (let j = 0; j < K; j++) {
          if (j === i || done[j]) continue;
          const keep = cand[j].filter((q) => !common.some(([r, c]) => inRect(q, r, c)));
          if (keep.length < cand[j].length) { cand[j] = keep; why[j] = { reason: "reserva", other: i }; changed = true; }
        }
        if (changed) reserve++;
      }
    }
    if (!changed) return fail();
  }
  cand = cand.map((cs) => [cs[0]]);
  return { pieces: cand.map((cs) => cs[0]), steps, placed: K, reserve };
}

/** Próximo passo lógico a partir das peças certas já colocadas (ou null se não houver). */
export function nextDeduction(b: PatchesBoard, fixed: (Rect | null)[]): Deduction | null {
  const res = solveLogically(b, fixed, true);
  return res.steps.find((s) => !fixed[s.clue]) ?? null;
}

/** Conta soluções (até `limit`) por busca exaustiva: garante que cada nível tem uma única resposta. */
export function countPatchesSolutions(b: PatchesBoard, limit = 2): number {
  const n = b.n;
  const shapes = b.clues.map((k) => shapesOf(b, k));
  const owner = new Int16Array(n * n).fill(-1);
  const used: boolean[] = b.clues.map(() => false);
  // Para cada casa, os encaixes (de qualquer número) que a cobrem.
  const byCell: { i: number; q: Rect }[][] = Array.from({ length: n * n }, () => []);
  shapes.forEach((qs, i) => qs.forEach((q) => rectCells(q).forEach(([r, c]) => byCell[r * n + c].push({ i, q }))));
  let found = 0;
  const free = (q: Rect) => rectCells(q).every(([r, c]) => owner[r * n + c] === -1);
  const set = (q: Rect, v: number) => rectCells(q).forEach(([r, c]) => { owner[r * n + c] = v; });
  const go = (from: number) => {
    if (found >= limit) return;
    let cell = from;
    while (cell < n * n && owner[cell] !== -1) cell++;
    if (cell === n * n) { found++; return; }
    for (const { i, q } of byCell[cell]) {
      if (used[i] || !free(q)) continue;
      used[i] = true; set(q, i);
      go(cell + 1);
      used[i] = false; set(q, -1);
      if (found >= limit) return;
    }
  };
  go(0);
  return found;
}
