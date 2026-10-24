import { describe, expect, it } from "vitest";
import { ZIP_PUZZLES, canStep, countZipSolutions, isZipSolved, parseZip, nextTarget } from "./zip";

describe("zip", () => {
  it.each(ZIP_PUZZLES)("$name tem solução única", (p) => {
    expect(countZipSolutions(parseZip(p.rows), 2)).toBe(1);
  });
  const z = parseZip(ZIP_PUZZLES[0].rows); // 1 em (3,1)
  it("bloqueia número fora de ordem", () => {
    const path = [z.start];
    // vizinho do 1 com número 4 (3,2) deve ser recusado: esperado é 2
    expect(canStep(path, z, { r: 3, c: 2 })).toEqual({ ok: false, reason: "ordem", expected: 2 });
  });
  it("aceita casa vazia vizinha e recusa não vizinha/ocupada", () => {
    const path = [z.start];
    expect(canStep(path, z, { r: 2, c: 1 }).ok).toBe(true);
    expect(canStep(path, z, { r: 0, c: 0 })).toMatchObject({ reason: "longe" });
    expect(canStep(path, z, z.start)).toMatchObject({ reason: "ocupada" });
  });
  it("não está resolvido com caminho incompleto e indica o próximo número", () => {
    expect(isZipSolved([z.start], z)).toBe(false);
    expect(nextTarget([z.start], z)?.n).toBe(2);
  });
});
