import { describe, expect, it, vi } from "vitest";
import { COMMENT_MAX, FORM_NAME, FORM_PATH, encodeFeedback, submitFeedback, validateFeedback } from "./feedback";

describe("opinião: validação", () => {
  it("exige nota ou comentário", () => {
    expect(validateFeedback({ rating: null, comment: "   " })).not.toBeNull();
    expect(validateFeedback({ rating: 4, comment: "" })).toBeNull();
    expect(validateFeedback({ rating: null, comment: "Gostei!" })).toBeNull();
  });
  it("recusa nota fora de 1–5 e comentário longo demais", () => {
    expect(validateFeedback({ rating: 6, comment: "" })).not.toBeNull();
    expect(validateFeedback({ rating: 0, comment: "" })).not.toBeNull();
    expect(validateFeedback({ rating: 3, comment: "a".repeat(COMMENT_MAX + 1) })).not.toBeNull();
  });
});

describe("opinião: envio", () => {
  it("monta o corpo para a Netlify sem nenhum dado pessoal", () => {
    const p = new URLSearchParams(encodeFeedback({ rating: 5, comment: "  Muito bom  " }));
    expect([...p.keys()].sort()).toEqual(["bot-field", "comment", "form-name", "rating"]);
    expect(p.get("form-name")).toBe(FORM_NAME);
    expect(p.get("rating")).toBe("5");
    expect(p.get("comment")).toBe("Muito bom");
  });
  it("faz POST no caminho do formulário e aceita resposta ok", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await submitFeedback({ rating: 4, comment: "ok" }, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe(FORM_PATH);
    expect(f.mock.calls[0][1].method).toBe("POST");
  });
  it("lança erro quando o servidor recusa", async () => {
    const f = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(submitFeedback({ rating: 4, comment: "ok" }, f as unknown as typeof fetch)).rejects.toThrow();
  });
  it("não envia nada quando o campo-armadilha está preenchido", async () => {
    const f = vi.fn();
    await submitFeedback({ rating: 4, comment: "spam", honeypot: "x" }, f as unknown as typeof fetch);
    expect(f).not.toHaveBeenCalled();
  });
});
