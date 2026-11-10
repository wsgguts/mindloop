import { describe, expect, it } from "vitest";
import { validateNick } from "./nick";

describe("apelido", () => {
  it("recusa vazio, curto, longo e símbolos", () => {
    expect(validateNick("   ")).not.toBeNull();
    expect(validateNick("a")).not.toBeNull();
    expect(validateNick("a".repeat(21))).not.toBeNull();
    expect(validateNick("lia<3*")).not.toBeNull();
  });
  it("recusa palavrões, inclusive disfarçados", () => {
    expect(validateNick("porra")).not.toBeNull();
    expect(validateNick("C4R4LH0")).not.toBeNull();
    expect(validateNick("a puta")).not.toBeNull();
    expect(validateNick("Cunha")).toBeNull(); // "cu" só como palavra inteira
    expect(validateNick("Escudo")).toBeNull();
  });
  it("aceita apelidos válidos, inclusive com acento", () => {
    expect(validateNick("Lia")).toBeNull();
    expect(validateNick("João_10")).toBeNull();
    expect(validateNick("  Ana Paula ")).toBeNull();
  });
});
