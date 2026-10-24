import { parsePuzzle, type Grid } from "./sudoku";

export interface Puzzle {
  id: string;
  name: string;
  level: string;
  rows: string[]; // "." = casa vazia
}

// Puzzles introdutórios 4x4 (hipótese). Substitua por puzzles oficiais quando existirem.
export const PUZZLES: Puzzle[] = [
  { id: "p1", name: "Primeiros passos", level: "Introdutório", rows: ["12.4", "3.12", "21.3", "4.21"] },
  { id: "p2", name: "Pistas em cruz", level: "Introdutório", rows: ["123.", "..1.", "2.4.", "4..1"] },
  { id: "p3", name: "Quase lá", level: "Introdutório", rows: [".2.4", "..1.", "2...", ".321"] },
];

export const puzzleGrid = (p: Puzzle): Grid => parsePuzzle(p.rows);
