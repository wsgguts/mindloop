// Detecta conquistas parciais (linha, coluna ou bloco fechados) só para escolher o som certo.
// Nada aqui altera regras ou validação: apenas lê a grade com as funções que os jogos já usam.

import { boxDims, conflictsAt, type Grid } from "../sudoku";
import { findProblems, type Sign, type TGrid } from "../tangoLogic";

type Cell = [number, number];

/** Quantas regiões (linha, coluna, bloco) da casa (r, c) ficaram completas e sem repetição com esta jogada. */
export function sudokuUnitsDone(grid: Grid, r: number, c: number): number {
  const n = grid.length;
  if (!grid[r][c]) return 0;
  const [bh, bw] = boxDims(n);
  const r0 = Math.floor(r / bh) * bh, c0 = Math.floor(c / bw) * bw;
  const units: Cell[][] = [
    Array.from({ length: n }, (_, k): Cell => [r, k]),
    Array.from({ length: n }, (_, k): Cell => [k, c]),
    Array.from({ length: n }, (_, k): Cell => [r0 + Math.floor(k / bw), c0 + (k % bw)]),
  ];
  const ok = (u: Cell[]) => u.every(([y, x]) => grid[y][x] !== 0 && conflictsAt(grid, y, x).length === 0);
  return units.filter(ok).length;
}

/** Quantas linhas/colunas da casa (r, c) ficaram cheias e sem nenhum erro com esta jogada. */
export function tangoLinesDone(grid: TGrid, signs: Sign[], r: number, c: number): number {
  const n = grid.length;
  if (!grid[r][c]) return 0;
  const bad = new Set(findProblems(grid, signs).flatMap((p) => p.cells.map(([y, x]) => `${y}-${x}`)));
  const row = Array.from({ length: n }, (_, k): Cell => [r, k]);
  const col = Array.from({ length: n }, (_, k): Cell => [k, c]);
  const ok = (u: Cell[]) => u.every(([y, x]) => grid[y][x] !== 0 && !bad.has(`${y}-${x}`));
  return [row, col].filter(ok).length;
}
