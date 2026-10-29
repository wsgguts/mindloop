import { describe, expect, it } from "vitest";
import { PUZZLES } from "./puzzles";
import { CHAPTERS, chapterDone, chapterOf, currentLevel, doneCount, emptyProgress, isUnlocked, markDone, parseProgress } from "./journey";
import { countSolutions } from "./sudoku";
import { puzzleGrid } from "./puzzles";

describe("jornada", () => {
  it("tem 10 capítulos por jogo cobrindo exatamente os níveis 1–100", () => {
    for (const g of ["sudoku", "zip"] as const) {
      expect(CHAPTERS[g]).toHaveLength(10);
      expect(CHAPTERS[g][0].from).toBe(1);
      expect(CHAPTERS[g][9].to).toBe(100);
      expect(chapterOf(g, 37).id).toBe(4);
    }
  });
  it("libera os níveis em sequência", () => {
    let p = emptyProgress();
    expect(isUnlocked(p, 1)).toBe(true);
    expect(isUnlocked(p, 2)).toBe(false);
    p = markDone(p, 1);
    expect(isUnlocked(p, 2)).toBe(true);
    expect(currentLevel(p)).toBe(2);
    expect(doneCount(p)).toBe(1);
    expect(chapterDone(p, CHAPTERS.sudoku[0])).toBe(1);
  });
  it("ignora progresso salvo inválido", () => {
    expect(parseProgress("lixo")).toBe(emptyProgress());
    expect(parseProgress(null)).toBe(emptyProgress());
    expect(currentLevel("1".repeat(100))).toBe(100);
  });
});

describe("mini sudoku: níveis", () => {
  it("existem 100 níveis distintos, todos com solução única", () => {
    expect(PUZZLES).toHaveLength(100);
    expect(new Set(PUZZLES.map((p) => p.rows.join("/"))).size).toBe(100);
    PUZZLES.forEach((p) => expect(countSolutions(puzzleGrid(p), 2), p.name).toBe(1));
  }, 120000);
  it("níveis 1–20 são 4×4 e 21–100 são 6×6, com pistas decrescentes dentro de cada tamanho", () => {
    const clues = PUZZLES.map((p) => p.rows.join("").replace(/\./g, "").length);
    PUZZLES.forEach((p, i) => expect(p.rows.length).toBe(i < 20 ? 4 : 6));
    for (let i = 1; i < 100; i++) if (i !== 20) expect(clues[i]).toBeLessThanOrEqual(clues[i - 1]);
  });
});
