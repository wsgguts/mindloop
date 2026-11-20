// A narração da tela de história: 5 a 7 falas curtas por caso, nomes destacados que existem no caso, nenhuma
// regra do jogo e nenhuma fala que entregue a solução (pessoa + objeto dela, ou pessoa + lugar dela).
import { describe, expect, it } from "vitest";
import { allCases } from "./catalog";
import { textoPuro } from "./narracao";

const has = (t: string, w: string) => new RegExp(`(?<![\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "u").test(t);

describe("narração das investigações", () => {
  it("todo caso tem de 5 a 7 falas curtas e uma pergunta", () => {
    for (const c of allCases()) {
      expect(c.narracao.length, c.id).toBeGreaterThanOrEqual(5);
      expect(c.narracao.length, c.id).toBeLessThanOrEqual(7);
      for (const f of c.narracao) expect(textoPuro(f.texto).length, `${c.id}: ${f.texto}`).toBeLessThanOrEqual(150);
      expect(c.pergunta, c.id).toMatch(/\?$/);
    }
  });

  it("todo nome destacado é um personagem ou objeto do caso, e todos aparecem na narração", () => {
    for (const c of allCases()) {
      const names = new Set([...c.model.people, ...c.model.objects].map((e) => e.label));
      const seen = new Set(c.narracao.flatMap((f) => f.destaques));
      for (const d of seen) expect(names.has(d), `${c.id}: ${d}`).toBe(true);
      for (const n of names) expect(seen.has(n), `${c.id}: falta ${n}`).toBe(true);
    }
  });

  it("nenhuma fala entrega a solução nem fala de regras do tabuleiro", () => {
    for (const c of allCases()) {
      const m = c.model, n = m.people.length;
      for (const f of c.narracao) {
        const t = textoPuro(f.texto);
        expect(t, `${c.id}: ${t}`).not.toMatch(/\b(linha \d|coluna [A-F]|\d+ pistas|\d+ casas|\d+ª parada)\b/i);
        m.people.forEach((p, i) => {
          if (!has(t, p.label)) return;
          expect(t.includes(m.objects[c.answer[n + i]].label) && m.objects.filter((o) => t.includes(o.label)).length === 1, `${c.id}: ${t}`).toBe(false);
          expect(m.scene.rooms.some((r) => t.includes(r.label)), `${c.id}: ${t}`).toBe(false);
        });
      }
    }
  });
});
