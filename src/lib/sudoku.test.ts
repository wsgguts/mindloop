import { describe, expect, it } from "vitest";
import { PUZZLES, puzzleGrid } from "./puzzles";
import {
  boxDims, candidates, conflictsAt, countSolutions, findHintCell, isFull, isSolved, parsePuzzle, setCell,
} from "./sudoku";


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
    const base = parsePuzzle(["12.4", "3.12", "21.3", "4.21"]);
    const changed = setCell(base, 0, 2, 3);
    expect(base[0][2]).toBe(0);
    expect(changed[0][2]).toBe(3);
    expect(base).toEqual(parsePuzzle(["12.4", "3.12", "21.3", "4.21"]));
  });
});

describe("dicas", () => {
  it("indica uma casa sem revelar a solução inteira", () => {
    const hint = findHintCell(puzzleGrid(PUZZLES[0]));
    expect(hint).not.toBeNull();
    expect(candidates(puzzleGrid(PUZZLES[0]), hint!.r, hint!.c).length).toBeGreaterThan(0);
  });
});

describe("grade 6×6 (blocos 2×3)", () => {
  it("deriva o tamanho do bloco", () => {
    expect(boxDims(4)).toEqual([2, 2]);
    expect(boxDims(6)).toEqual([2, 3]);
  });
  const empty = parsePuzzle(["1.....", "......", "......", "......", "......", "......"]);
  it("detecta conflito no bloco 2×3, mas não fora dele", () => {
    expect(conflictsAt(setCell(empty, 1, 2, 1), 1, 2)).toContain("subgrade");
    expect(conflictsAt(setCell(empty, 2, 0, 1), 2, 0)).toEqual(["coluna"]);
    expect(conflictsAt(setCell(empty, 1, 3, 1), 1, 3)).toEqual([]);
  });
  it("reconhece solução correta 6×6", () => {
    const sol = parsePuzzle(["256413", "413625", "532146", "641532", "364251", "125364"]);
    expect(isSolved(sol)).toBe(true);
    expect(isSolved(setCell(sol, 0, 0, 3))).toBe(false);
  });
});
