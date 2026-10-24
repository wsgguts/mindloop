// Regras do Mini Sudoku (HIPÓTESE a confirmar): Sudoku convencional em grades pequenas.
// 4×4: dígitos 1–4, blocos 2×2. 6×6: dígitos 1–6, 6 blocos de 2 linhas × 3 colunas.
// Em todas: sem repetir dígito em linha, coluna e bloco. A lógica deriva o tamanho da própria grade.

export type Grid = number[][];
export type ConflictKind = "linha" | "coluna" | "subgrade";

/** Dimensões do bloco (linhas × colunas): 4 → 2×2, 6 → 2×3, 9 → 3×3. */
export function boxDims(n: number): [number, number] {
  let r = Math.floor(Math.sqrt(n));
  while (n % r !== 0) r--;
  return [r, n / r];
}
export const digitsFor = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

export const cloneGrid = (g: Grid): Grid => g.map((row) => [...row]);

/** Converte ["1..4", ...] em grade numérica (0 = vazio). */
export function parsePuzzle(rows: string[]): Grid {
  return rows.map((row) => [...row].map((ch) => (ch === "." ? 0 : Number(ch))));
}

export function conflictsAt(grid: Grid, r: number, c: number): ConflictKind[] {
  const d = grid[r][c];
  if (!d) return [];
  const n = grid.length;
  const [bh, bw] = boxDims(n);
  const kinds: ConflictKind[] = [];
  for (let i = 0; i < n; i++) {
    if (i !== c && grid[r][i] === d) { kinds.push("linha"); break; }
  }
  for (let i = 0; i < n; i++) {
    if (i !== r && grid[i][c] === d) { kinds.push("coluna"); break; }
  }
  const br = r - (r % bh);
  const bc = c - (c % bw);
  outer: for (let i = br; i < br + bh; i++) {
    for (let j = bc; j < bc + bw; j++) {
      if ((i !== r || j !== c) && grid[i][j] === d) { kinds.push("subgrade"); break outer; }
    }
  }
  return kinds;
}

export function hasAnyConflict(grid: Grid): boolean {
  const n = grid.length;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (conflictsAt(grid, r, c).length) return true;
  return false;
}

export const filledCount = (grid: Grid): number =>
  grid.reduce((n, row) => n + row.filter(Boolean).length, 0);

export const isFull = (grid: Grid): boolean => filledCount(grid) === grid.length * grid.length;

/** Solução correta = grade cheia e sem nenhum conflito. */
export const isSolved = (grid: Grid): boolean => isFull(grid) && !hasAnyConflict(grid);

/** Dígitos que cabem numa casa vazia sem gerar conflito imediato. */
export function candidates(grid: Grid, r: number, c: number): number[] {
  if (grid[r][c]) return [];
  return digitsFor(grid.length).filter((d) => {
    const g = cloneGrid(grid);
    g[r][c] = d;
    return conflictsAt(g, r, c).length === 0;
  });
}

/** Conta soluções (até `limit`) — usado para verificar puzzles. */
export function countSolutions(grid: Grid, limit = 2): number {
  const g = cloneGrid(grid);
  const n = g.length;
  if (hasAnyConflict(g)) return 0;
  const solve = (): number => {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c]) continue;
        let total = 0;
        for (const d of candidates(g, r, c)) {
          g[r][c] = d;
          total += solve();
          g[r][c] = 0;
          if (total >= limit) return total;
        }
        return total;
      }
    }
    return 1;
  };
  return solve();
}

/** Casa vazia com menos opções (dica sem revelar o dígito). */
export function findHintCell(grid: Grid): { r: number; c: number; options: number } | null {
  const n = grid.length;
  let best: { r: number; c: number; options: number } | null = null;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c]) continue;
      const options = candidates(grid, r, c).length;
      if (!best || options < best.options) best = { r, c, options };
    }
  return best;
}

export function setCell(grid: Grid, r: number, c: number, value: number): Grid {
  const next = cloneGrid(grid);
  next[r][c] = value;
  return next;
}
