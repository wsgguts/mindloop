import { describe, expect, it } from "vitest";
import {
  C, O, PATCHES_TUT, SUDOKU_DEDUCTION, SUDOKU_MISTAKES, SUDOKU_PUZZLE, SUDOKU_SOLUTION, TANGO_GIVENS, TANGO_LINES, TANGO_SIGNS,
  TANGO_SOLUTION, ZIP_NUMS, ZIP_PATH, ZIP_TRAP, ZIP_WRONG_ORDER,
} from "./tutorialData";
import { candidates, conflictsAt, countSolutions, isSolved, type Grid } from "./sudoku";
import { findProblems, isTangoSolved, countTangoSolutions } from "./tangoLogic";
import { canStep, isZipSolved, parseZip, countZipSolutions } from "./zip";
import { countPatchesSolutions, isPatchesSolved, pieceProblem, shapesOf, type PatchesBoard } from "./patchesLogic";

const empty = (n: number): Grid => Array.from({ length: n }, () => Array(n).fill(0));
const withGivens = (gs: [number, number, number][]) => { const g = empty(4); gs.forEach(([r, c, v]) => (g[r][c] = v)); return g; };

describe("tutorial do Mini Sudoku segue as regras reais", () => {
  it("a solução é válida e o puzzle-exemplo tem só ela como resposta", () => {
    expect(isSolved(SUDOKU_SOLUTION)).toBe(true);
    expect(countSolutions(SUDOKU_PUZZLE.map((r) => [...r]))).toBe(1);
    SUDOKU_PUZZLE.forEach((row, r) => row.forEach((v, c) => { if (v) expect(v).toBe(SUDOKU_SOLUTION[r][c]); }));
  });
  it("cada jogada errada é acusada exatamente pela regra que o passo ensina; a certa não", () => {
    for (const [kind, m] of Object.entries(SUDOKU_MISTAKES)) {
      const g = withGivens(m.givens);
      g[m.cell[0]][m.cell[1]] = m.wrong;
      expect(conflictsAt(g, m.cell[0], m.cell[1]), kind).toEqual([kind]);
      expect(g[m.clash[0]][m.clash[1]]).toBe(m.wrong);
      g[m.cell[0]][m.cell[1]] = m.right;
      expect(conflictsAt(g, m.cell[0], m.cell[1]), kind).toEqual([]);
      expect(m.right).toBe(SUDOKU_SOLUTION[m.cell[0]][m.cell[1]]);
    }
  });
  it("a dedução mostrada é a do jogo: só um número cabe na casa", () => {
    const d = SUDOKU_DEDUCTION, g = withGivens(d.givens);
    expect(candidates(g, d.cell[0], d.cell[1])).toEqual([d.answer]);
    expect(new Set([...d.byRow, ...d.byCol, d.answer])).toEqual(new Set([1, 2, 3, 4]));
    expect(d.answer).toBe(SUDOKU_SOLUTION[d.cell[0]][d.cell[1]]);
  });
});

describe("tutorial do Tango segue as regras reais", () => {
  it("solução válida; as pistas-exemplo levam só a ela", () => {
    expect(isTangoSolved(TANGO_SOLUTION, [])).toBe(true);
    expect(countTangoSolutions(TANGO_GIVENS, [], 2)).toBe(1);
    TANGO_GIVENS.forEach((row, r) => row.forEach((v, c) => { if (v) expect(v).toBe(TANGO_SOLUTION[r][c]); }));
  });
  it("par, sanduíche e contagem: o errado quebra a regra explicada, o certo não", () => {
    const rowGrid = (row: number[]) => [row, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    const kinds = { par: "trio", sanduiche: "trio", contagem: "excesso" } as const;
    for (const [k, ex] of Object.entries(TANGO_LINES)) {
      const g = rowGrid([...ex.row]);
      g[0][ex.cell] = ex.wrong;
      expect(findProblems(g, []).map((p) => p.kind), k).toContain(kinds[k as keyof typeof kinds]);
      g[0][ex.cell] = ex.right;
      expect(findProblems(g, []), k).toEqual([]);
    }
  });
  it("sinais = e ×: a resposta mostrada respeita o sinal; a outra quebra", () => {
    for (const ex of Object.values(TANGO_SIGNS)) {
      const g = [[...ex.row], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      const sign = [{ r: 0, c: 0, dir: "h" as const, same: ex.same }];
      g[0][1] = ex.right;
      expect(findProblems(g, sign)).toEqual([]);
      g[0][1] = ex.right === C ? O : C;
      expect(findProblems(g, sign).map((p) => p.kind)).toEqual(["sinal"]);
    }
  });
});

describe("tutorial do Zip segue as regras reais", () => {
  const z = parseZip(ZIP_NUMS.map((r) => r.join(",")));
  const P = (p: [number, number]) => ({ r: p[0], c: p[1] });
  it("o caminho demonstrado é aceito passo a passo e resolve o tabuleiro (solução única)", () => {
    const path = [P(ZIP_PATH[0])];
    for (const p of ZIP_PATH.slice(1)) { expect(canStep(path, z, P(p))).toEqual({ ok: true }); path.push(P(p)); }
    expect(isZipSolved(path, z)).toBe(true);
    expect(countZipSolutions(z, 2)).toBe(1);
  });
  it("ir ao 3 antes do 2 é recusado por ordem; diagonal é recusada; voltar a uma casa do caminho também", () => {
    expect(canStep([P(ZIP_WRONG_ORDER[0])], z, P(ZIP_WRONG_ORDER[1]))).toEqual({ ok: false, reason: "ordem", expected: 2 });
    expect(canStep([P([0, 0])], z, P([1, 1]))).toEqual({ ok: false, reason: "longe" });
    expect(canStep([P([0, 0]), P([0, 1])], z, P([0, 0]))).toEqual({ ok: false, reason: "ocupada" });
  });
  it("o caminho “preso” é válido até o 5, mas não conclui: sobram casas", () => {
    const path = [P(ZIP_TRAP[0])];
    for (const p of ZIP_TRAP.slice(1)) { expect(canStep(path, z, P(p))).toEqual({ ok: true }); path.push(P(p)); }
    expect(path.length).toBeLessThan(16);
    expect(isZipSolved(path, z)).toBe(false);
  });
});

describe("tutorial do Patches segue as regras reais", () => {
  const b: PatchesBoard = { n: PATCHES_TUT.n, clues: PATCHES_TUT.clues.map(([r, c, v, kind]) => ({ r, c, v, kind })) };
  const pieces = PATCHES_TUT.pieces.map(([r, c, h, w]) => ({ r, c, h, w }));
  it("a solução mostrada é válida e é a única", () => {
    expect(isPatchesSolved(b, pieces)).toBe(true);
    expect(countPatchesSolutions(b, 2)).toBe(1);
  });
  it("o 2 deitado (canto) e o 3 em pé (borda) só cabem de um jeito, como o passo “Encontrando o encaixe certo” afirma", () => {
    expect(shapesOf(b, b.clues[0])).toEqual([pieces[0]]);
    expect(shapesOf(b, b.clues[3])).toEqual([pieces[3]]);
  });
  it("a peça errada do exemplo é acusada por tamanho", () => {
    const [r, c, h, w] = PATCHES_TUT.wrong;
    expect(pieceProblem(b, { r, c, h, w })?.kind).toBe("tamanho");
  });
  it("cada peça da solução contém o número correspondente (mesma ordem, para as cores)", () => {
    pieces.forEach((q, i) => { const [r, c] = PATCHES_TUT.clues[i]; expect(r >= q.r && r < q.r + q.h && c >= q.c && c < q.c + q.w).toBe(true); });
  });
});
