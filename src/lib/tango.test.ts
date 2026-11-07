import { describe, expect, it } from "vitest";
import {
  CRISTAL as C, ORBE as O, TANGO_PUZZLES, basicDeduction, countTangoSolutions, encodeTango, findProblems,
  isTangoSolved, nextDeduction, parseTango, solveLogically, type Sign, type TGrid,
} from "./tango";

const boards = TANGO_PUZZLES.map((p) => parseTango(p.raw));

describe("tango: níveis", () => {
  it("existem 100 níveis, todos com solução única", () => {
    expect(TANGO_PUZZLES).toHaveLength(100);
    boards.forEach((b, i) => expect(countTangoSolutions(b.givens, b.signs, 2), `nível ${i + 1}`).toBe(1));
  }, 120000);
  it("todos se resolvem só com lógica (o mesmo raciocínio das dicas)", () => {
    boards.forEach((b, i) => {
      const sol = solveLogically(b.givens, b.signs, true);
      expect(sol, `nível ${i + 1}`).not.toBeNull();
      expect(isTangoSolved(sol!, b.signs)).toBe(true);
    });
  });
  it("capítulos 1–6, 8 e 9 dispensam hipóteses; 7 e 10 trazem níveis que pedem o “E se…?”", () => {
    const needsHypothesis = (i: number) => solveLogically(boards[i].givens, boards[i].signs, false) === null;
    for (let i = 0; i < 100; i++) {
      const ch = Math.floor(i / 10) + 1;
      if (ch !== 7 && ch !== 10) expect(needsHypothesis(i), `nível ${i + 1}`).toBe(false);
    }
    for (const ch of [7, 10]) expect(Array.from({ length: 10 }, (_, k) => needsHypothesis((ch - 1) * 10 + k)).some(Boolean)).toBe(true);
  });
  it("a grade nunca diminui ao longo da jornada (4×4 → 6×6 → 8×8)", () => {
    for (let i = 1; i < boards.length; i++) expect(boards[i].n).toBeGreaterThanOrEqual(boards[i - 1].n);
    expect(boards[0].n).toBe(4);
    expect(boards[99].n).toBe(8);
  });
  it("o formato dos níveis é lido e regravado sem perda", () => {
    TANGO_PUZZLES.forEach((p, i) => expect(encodeTango(boards[i])).toBe(p.raw));
  });
});

describe("tango: regras", () => {
  const empty = (n: number): TGrid => Array.from({ length: n }, () => Array(n).fill(0));
  it("acusa três iguais seguidos", () => {
    const g = empty(4); g[0] = [C, C, C, 0];
    expect(findProblems(g, []).map((p) => p.kind)).toContain("trio");
  });
  it("acusa excesso de um símbolo na linha", () => {
    const g = empty(4); g[0] = [O, C, O, O];
    expect(findProblems(g, []).map((p) => p.kind)).toEqual(["excesso"]);
  });
  it("respeita os sinais = e ×", () => {
    const eq: Sign = { r: 0, c: 0, dir: "h", same: true };
    const ne: Sign = { r: 0, c: 0, dir: "v", same: false };
    const g = empty(4); g[0][0] = C; g[0][1] = O; g[1][0] = C;
    expect(findProblems(g, [eq, ne]).map((p) => p.kind)).toEqual(["sinal", "sinal"]);
  });
  it("aceita uma grade completa e correta", () => {
    const g = [[C, O, C, O], [O, C, O, C], [C, C, O, O], [O, O, C, C]];
    expect(isTangoSolved(g, [])).toBe(true);
  });
});

describe("tango: dicas", () => {
  const empty = (): TGrid => Array.from({ length: 4 }, () => Array(4).fill(0));
  it("par: dois iguais lado a lado empurram o outro símbolo para a ponta", () => {
    const g = empty(); g[0][0] = C; g[0][1] = C;
    expect(basicDeduction(g, [])).toMatchObject({ r: 0, c: 2, v: O, reason: "par" });
  });
  it("sanduíche: casa entre dois iguais é do outro símbolo", () => {
    const g = empty(); g[1][0] = O; g[1][2] = O;
    expect(basicDeduction(g, [])).toMatchObject({ r: 1, c: 1, v: C, reason: "sanduiche" });
  });
  it("contagem: linha com metade de um símbolo completa com o outro", () => {
    const g = empty(); g[2][0] = C; g[2][3] = C;
    expect(basicDeduction(g, [])).toMatchObject({ r: 2, c: 1, v: O, reason: "contagem" });
  });
  it("sinal: = copia o símbolo vizinho e × inverte", () => {
    const g = empty(); g[3][3] = O;
    expect(basicDeduction(g, [{ r: 3, c: 2, dir: "h", same: true }])).toMatchObject({ r: 3, c: 2, v: O, reason: "sinal" });
    expect(basicDeduction(g, [{ r: 2, c: 3, dir: "v", same: false }])).toMatchObject({ r: 2, c: 3, v: C, reason: "sinal" });
  });
  it("sempre há um próximo passo lógico até o fim de cada nível", () => {
    for (const b of boards.slice(0, 30)) {
      const g = b.givens.map((r) => [...r]);
      let d;
      while ((d = nextDeduction(g, b.signs, true))) g[d.r][d.c] = d.v;
      expect(isTangoSolved(g, b.signs)).toBe(true);
    }
  });
});
