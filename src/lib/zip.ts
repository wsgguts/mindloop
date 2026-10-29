// Regras do Zip (HIPÓTESE a confirmar): o manual descreve o jogo apenas como
// "caminhos e conexões sequenciais". Versão provisória: ligar os pontos numerados em ordem
// (1, 2, 3…) com um único caminho contínuo por casas vizinhas (sem diagonais),
// passando por TODAS as casas exatamente uma vez e terminando no maior número.

import { ZIP_RAW } from "./data/zipLevels";
import { chapterOf } from "./journey";

export interface Pos { r: number; c: number }
export interface ZipPuzzle { id: string; name: string; level: string; rows: string[] }
export interface ParsedZip { size: number; nums: number[][]; max: number; start: Pos; maxPos: Pos }

// 100 níveis do Zip (gerados por scripts/gen_zip.py): grades de 4×4 a 7×7.
export const ZIP_PUZZLES: ZipPuzzle[] = ZIP_RAW.map((raw, i) => ({
  id: `z${i + 1}`,
  name: `Nível ${i + 1}`,
  level: chapterOf("zip", i + 1).title,
  rows: raw.split("/"), // cada linha: "0,1,6,0" (0 = casa livre)
}));

export function parseZip(rows: string[]): ParsedZip {
  const size = rows.length;
  const nums = rows.map((row) => row.split(",").map(Number));
  let max = 0, start: Pos = { r: 0, c: 0 }, maxPos: Pos = { r: 0, c: 0 };
  nums.forEach((row, r) => row.forEach((v, c) => {
    if (v === 1) start = { r, c };
    if (v > max) { max = v; maxPos = { r, c }; }
  }));
  return { size, nums, max, start, maxPos };
}

export const samePos = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c;
export const isAdjacent = (a: Pos, b: Pos) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
export const indexInPath = (path: Pos[], p: Pos) => path.findIndex((q) => samePos(q, p));

/** Quantos números já foram visitados (o próximo esperado é este + 1). */
export function visitedNumbers(path: Pos[], z: ParsedZip): number {
  return path.filter((p) => z.nums[p.r][p.c] > 0).length;
}

export type StepResult =
  | { ok: true }
  | { ok: false; reason: "ocupada" | "longe" | "ordem"; expected?: number };

/** Verifica se o caminho pode avançar para `p`. */
export function canStep(path: Pos[], z: ParsedZip, p: Pos): StepResult {
  const head = path[path.length - 1];
  if (indexInPath(path, p) >= 0) return { ok: false, reason: "ocupada" };
  if (!isAdjacent(head, p)) return { ok: false, reason: "longe" };
  const n = z.nums[p.r][p.c];
  const expected = visitedNumbers(path, z) + 1;
  if (n > 0 && n !== expected) return { ok: false, reason: "ordem", expected };
  return { ok: true };
}

export const isZipSolved = (path: Pos[], z: ParsedZip): boolean =>
  path.length === z.size * z.size && samePos(path[path.length - 1], z.maxPos);

/** Posição do próximo número a alcançar (para dicas). */
export function nextTarget(path: Pos[], z: ParsedZip): { n: number; pos: Pos } | null {
  const n = visitedNumbers(path, z) + 1;
  if (n > z.max) return null;
  for (let r = 0; r < z.size; r++) for (let c = 0; c < z.size; c++) if (z.nums[r][c] === n) return { n, pos: { r, c } };
  return null;
}

/** Conta soluções (até `limit`) — verifica puzzles. Busca com poda: casas livres precisam continuar
 *  conectadas e sem becos (exceto a casa final), e o próximo número precisa estar ao alcance. */
export function countZipSolutions(z: ParsedZip, limit = 2): number {
  const n = z.size, total = n * n;
  const idx = (p: Pos) => p.r * n + p.c;
  const nb: number[][] = Array.from({ length: total }, (_, i) => {
    const r = Math.floor(i / n), c = i % n, out: number[] = [];
    if (r > 0) out.push(i - n); if (r < n - 1) out.push(i + n); if (c > 0) out.push(i - 1); if (c < n - 1) out.push(i + 1);
    return out;
  });
  const num = (i: number) => z.nums[Math.floor(i / n)][i % n];
  const where: Record<number, number> = {};
  for (let i = 0; i < total; i++) if (num(i) > 0) where[num(i)] = i;
  const end = idx(z.maxPos);
  const seen = new Uint8Array(total);
  let seenCount = 1, found = 0;
  seen[idx(z.start)] = 1;

  const feasible = (head: number, visited: number): boolean => {
    const free = total - seenCount;
    if (free === 0) return true;
    const reach = new Uint8Array(total);
    const stack: number[] = [];
    for (const q of nb[head]) if (!seen[q]) { reach[q] = 1; stack.push(q); }
    let reached = stack.length;
    while (stack.length) {
      const x = stack.pop()!;
      for (const y of nb[x]) if (!seen[y] && !reach[y]) { reach[y] = 1; reached++; stack.push(y); }
    }
    if (reached !== free) return false;
    for (let p = 0; p < total; p++) {
      if (seen[p]) continue;
      let d = 0;
      for (const q of nb[p]) if (!seen[q] || q === head) d++;
      if (d <= 1 && p !== end) return false;
    }
    const nxt = where[visited + 1];
    if (nxt !== undefined && !seen[nxt]) {
      const dist = Math.abs(Math.floor(nxt / n) - Math.floor(head / n)) + Math.abs((nxt % n) - (head % n));
      if (dist > free) return false;
    }
    return true;
  };

  const dfs = (p: number, visited: number) => {
    if (found >= limit) return;
    if (seenCount === total) { if (p === end) found++; return; }
    for (const q of nb[p]) {
      if (seen[q]) continue;
      const v = num(q);
      if (v > 0 && v !== visited + 1) continue;
      if (q === end && seenCount !== total - 1) continue;
      seen[q] = 1; seenCount++;
      const nv = visited + (v > 0 ? 1 : 0);
      if (feasible(q, nv)) dfs(q, nv);
      seen[q] = 0; seenCount--;
    }
  };
  dfs(idx(z.start), 1);
  return found;
}
