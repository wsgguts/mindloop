// Regras do Mini Sudoku (HIPÓTESE a confirmar): Sudoku 4x4 convencional,
// dígitos 1–4, sem repetição em linha, coluna e subgrade 2x2.
// Esta lógica é independente da interface e pode ser substituída.

export type Grid = number[][];
export type ConflictKind = "linha" | "coluna" | "subgrade";

export const SIZE = 4;
export const BOX = 2;
export const DIGITS = [1, 2, 3, 4] as const;

export const cloneGrid = (g: Grid): Grid => g.map((row) => [...row]);

/** Converte ["1..4", ...] em grade numérica (0 = vazio). */
export function parsePuzzle(rows: string[]): Grid {
  return rows.map((row) => [...row].map((ch) => (ch === "." ? 0 : Number(ch))));
}

export function conflictsAt(grid: Grid, r: number, c: number): ConflictKind[] {
  const d = grid[r][c];
  if (!d) return [];
  const kinds: ConflictKind[] = [];
  for (let i = 0; i < SIZE; i++) {
    if (i !== c && grid[r][i] === d) { kinds.push("linha"); break; }
  }
  for (let i = 0; i < SIZE; i++) {
    if (i !== r && grid[i][c] === d) { kinds.push("coluna"); break; }
  }
  const br = r - (r % BOX);
  const bc = c - (c % BOX);
  outer: for (let i = br; i < br + BOX; i++) {
    for (let j = bc; j < bc + BOX; j++) {
      if ((i !== r || j !== c) && grid[i][j] === d) { kinds.push("subgrade"); break outer; }
    }
  }
  return kinds;
}

export function hasAnyConflict(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (conflictsAt(grid, r, c).length) return true;
  return false;
}

export const filledCount = (grid: Grid): number =>
  grid.reduce((n, row) => n + row.filter(Boolean).length, 0);

export const isFull = (grid: Grid): boolean => filledCount(grid) === SIZE * SIZE;

/** Solução correta = grade cheia e sem nenhum conflito. */
export const isSolved = (grid: Grid): boolean => isFull(grid) && !hasAnyConflict(grid);

/** Dígitos que cabem numa casa vazia sem gerar conflito imediato. */
export function candidates(grid: Grid, r: number, c: number): number[] {
  if (grid[r][c]) return [];
  return DIGITS.filter((d) => {
    const g = cloneGrid(grid);
    g[r][c] = d;
    return conflictsAt(g, r, c).length === 0;
  });
}

/** Conta soluções (até `limit`) — usado para verificar puzzles. */
export function countSolutions(grid: Grid, limit = 2): number {
  const g = cloneGrid(grid);
  if (hasAnyConflict(g)) return 0;
  const solve = (): number => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
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
  let best: { r: number; c: number; options: number } | null = null;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
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
