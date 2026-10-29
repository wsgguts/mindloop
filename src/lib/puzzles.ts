import { SUDOKU_RAW } from "./data/sudokuLevels";
import { chapterOf } from "./journey";
import { parsePuzzle, type Grid } from "./sudoku";

export interface Puzzle {
  id: string;
  name: string;
  level: string; // título do capítulo
  rows: string[]; // "." = casa vazia
}

// 100 níveis do Mini Sudoku (gerados por scripts/gen_sudoku.py): 1–20 em 4×4 e 21–100 em 6×6.
export const PUZZLES: Puzzle[] = SUDOKU_RAW.map((raw, i) => ({
  id: `s${i + 1}`,
  name: `Nível ${i + 1}`,
  level: chapterOf("sudoku", i + 1).title,
  rows: raw.split("/"),
}));

export const puzzleGrid = (p: Puzzle): Grid => parsePuzzle(p.rows);
