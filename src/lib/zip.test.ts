import { describe, expect, it } from "vitest";
import { ZIP_PUZZLES, canStep, countZipSolutions, isZipSolved, nextTarget, parseZip } from "./zip";
import { solveZipLogically } from "./zipLogic";
import { ZIP_CAP } from "./difficulty";

describe("zip: níveis", () => {
  it("existem 100 níveis, todos com solução única", () => {
    expect(ZIP_PUZZLES).toHaveLength(100);
    ZIP_PUZZLES.forEach((p) => expect(countZipSolutions(parseZip(p.rows), 2), p.name).toBe(1));
  }, 120000);
  it("a grade nunca diminui ao longo da jornada (4×4 → 7×7)", () => {
    const sizes = ZIP_PUZZLES.map((p) => parseZip(p.rows).size);
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
  });
  it("todos se resolvem por dedução (regras diretas + “E se…?” de um passo), sem chute", () => {
    ZIP_PUZZLES.forEach((p) => expect(solveZipLogically(parseZip(p.rows)).solved, p.name).toBe(true));
  });
  it("esforço dentro do teto de cada capítulo, crescendo dentro do capítulo e de um capítulo para o outro", () => {
    const effort = ZIP_PUZZLES.map((p) => solveZipLogically(parseZip(p.rows)).hypotheses);
    for (let ch = 0; ch < 10; ch++) {
      const part = effort.slice(ch * 10, ch * 10 + 10);
      part.forEach((e, j) => expect(e, `nível ${ch * 10 + j + 1}`).toBeLessThanOrEqual(ZIP_CAP[ch]));
      for (let j = 1; j < 10; j++) expect(part[j], `nível ${ch * 10 + j + 1}`).toBeGreaterThanOrEqual(part[j - 1]);
      if (ch) expect(Math.max(...part)).toBeGreaterThanOrEqual(Math.max(...effort.slice(ch * 10 - 10, ch * 10)));
    }
  });
  it("o solucionador por dedução não aceita um caminho impossível", () => {
    // 3×3 com o 2 colado no 1, no meio da borda: nenhum caminho cobre as 9 casas terminando ali.
    expect(solveZipLogically(parseZip(["1,2,0", "0,0,0", "0,0,0"])).solved).toBe(false);
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
