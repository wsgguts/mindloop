// Regras do Zip (HIPÓTESE a confirmar): o manual descreve o jogo apenas como
// "caminhos e conexões sequenciais". Versão provisória: ligar os pontos numerados em ordem
// (1, 2, 3…) com um único caminho contínuo por casas vizinhas (sem diagonais),
// passando por TODAS as casas exatamente uma vez e terminando no maior número.

export interface Pos { r: number; c: number }
export interface ZipPuzzle { id: string; name: string; level: string; rows: string[] }
export interface ParsedZip { size: number; nums: number[][]; max: number; start: Pos; maxPos: Pos }

export const ZIP_PUZZLES: ZipPuzzle[] = [
  { id: "z1", name: "Primeira trilha", level: "Introdutório", rows: [".3..", "..2.", "....", ".14."] },
  { id: "z2", name: "Rota das estrelas", level: "Introdutório", rows: [".....", ".45..", "..1..", "276.3", "....."] },
  { id: "z3", name: "Caminho em zigue-zague", level: "Intermediário", rows: ["....5", "..23.", "..4..", ".....", "6.1.."] },
];

export function parseZip(rows: string[]): ParsedZip {
  const size = rows.length;
  const nums = rows.map((row) => [...row].map((ch) => (ch === "." ? 0 : Number(ch))));
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

/** Conta soluções (até `limit`) — verifica puzzles. */
export function countZipSolutions(z: ParsedZip, limit = 2): number {
  const seen = new Set<string>([`${z.start.r},${z.start.c}`]);
  let total = 0;
  const dfs = (p: Pos, visited: number) => {
    if (total >= limit) return;
    if (seen.size === z.size * z.size) { if (samePos(p, z.maxPos)) total++; return; }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = { r: p.r + dr, c: p.c + dc };
      if (q.r < 0 || q.c < 0 || q.r >= z.size || q.c >= z.size || seen.has(`${q.r},${q.c}`)) continue;
      const n = z.nums[q.r][q.c];
      if (n > 0 && n !== visited + 1) continue;
      seen.add(`${q.r},${q.c}`);
      dfs(q, visited + (n > 0 ? 1 : 0));
      seen.delete(`${q.r},${q.c}`);
    }
  };
  dfs(z.start, 1);
  return total;
}
