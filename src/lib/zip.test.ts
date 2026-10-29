import { describe, expect, it } from "vitest";
import { ZIP_PUZZLES, canStep, countZipSolutions, isZipSolved, nextTarget, parseZip } from "./zip";

describe("zip: níveis", () => {
  it("existem 100 níveis, todos com solução única", () => {
    expect(ZIP_PUZZLES).toHaveLength(100);
    ZIP_PUZZLES.forEach((p) => expect(countZipSolutions(parseZip(p.rows), 2), p.name).toBe(1));
  }, 120000);
  it("a dificuldade não diminui: grade e/ou menos pontos", () => {
    const info = ZIP_PUZZLES.map((p) => { const z = parseZip(p.rows); return { n: z.size, k: z.max }; });
    for (let i = 1; i < info.length; i++) {
      expect(info[i].n).toBeGreaterThanOrEqual(info[i - 1].n);
      if (info[i].n === info[i - 1].n) expect(info[i].k).toBeLessThanOrEqual(info[i - 1].k);
    }
  });
});

describe("zip: regras", () => {
  const z = parseZip(["0,1,6,0", "0,0,0,7", "0,5,4,0", "0,2,0,3"]); // 1 em (0,1)
  it("bloqueia número fora de ordem", () => {
    expect(canStep([z.start], z, { r: 0, c: 2 })).toEqual({ ok: false, reason: "ordem", expected: 2 });
  });
  it("aceita casa livre vizinha e recusa não vizinha/ocupada", () => {
    expect(canStep([z.start], z, { r: 1, c: 1 }).ok).toBe(true);
    expect(canStep([z.start], z, { r: 3, c: 3 })).toMatchObject({ reason: "longe" });
    expect(canStep([z.start], z, z.start)).toMatchObject({ reason: "ocupada" });
  });
  it("caminho incompleto não está resolvido e o próximo alvo é o 2", () => {
    expect(isZipSolved([z.start], z)).toBe(false);
    expect(nextTarget([z.start], z)?.n).toBe(2);
  });
});
