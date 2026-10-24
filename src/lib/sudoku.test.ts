import { describe, expect, it } from "vitest";
import { PUZZLES, puzzleGrid } from "./puzzles";
import {
  candidates, conflictsAt, countSolutions, findHintCell, isFull, isSolved, parsePuzzle, setCell,
} from "./sudoku";

describe("puzzles", () => {
  it.each(PUZZLES)("$name tem solução única", (p) => {
    expect(countSolutions(puzzleGrid(p), 2)).toBe(1);
  });
});

describe("conflitos", () => {
  const g = parsePuzzle(["1...", "....", "....", "...."]);
  it("detecta linha, coluna e subgrade", () => {
    expect(conflictsAt(setCell(g, 0, 3, 1), 0, 3)).toContain("linha");
    expect(conflictsAt(setCell(g, 3, 0, 1), 3, 0)).toContain("coluna");
    expect(conflictsAt(setCell(g, 1, 1, 1), 1, 1)).toContain("subgrade");
  });
  it("não acusa dígito sem repetição", () => {
    expect(conflictsAt(setCell(g, 1, 2, 1), 1, 2)).toEqual([]);
  });
});

describe("conclusão", () => {
  const solved = parsePuzzle(["1234", "3412", "2143", "4321"]);
  it("reconhece solução correta", () => {
    expect(isSolved(solved)).toBe(true);
  });
  it("grade cheia com repetição não é solução", () => {
    const bad = setCell(solved, 0, 0, 2);
    expect(isFull(bad)).toBe(true);
    expect(isSolved(bad)).toBe(false);
  });
  it("grade incompleta não é solução", () => {
    expect(isSolved(setCell(solved, 0, 0, 0))).toBe(false);
  });
});

describe("desfazer/reiniciar (imutabilidade)", () => {
  it("setCell não altera a grade original", () => {
    const base = puzzleGrid(PUZZLES[0]);
    const changed = setCell(base, 0, 2, 3);
    expect(base[0][2]).toBe(0);
    expect(changed[0][2]).toBe(3);
    expect(puzzleGrid(PUZZLES[0])).toEqual(base);
  });
});

describe("dicas", () => {
  it("indica uma casa sem revelar a solução inteira", () => {
    const hint = findHintCell(puzzleGrid(PUZZLES[0]));
    expect(hint).not.toBeNull();
    expect(candidates(puzzleGrid(PUZZLES[0]), hint!.r, hint!.c).length).toBeGreaterThan(0);
  });
});
