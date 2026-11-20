// A reescrita narrativa não pode mudar a lógica: mesmas pistas, mesma solução, mesmo quadro de decisões.
// E cada texto de pista precisa carregar, com clareza, a informação lógica da pista.
import { describe, expect, it } from "vitest";
import { allCases } from "./catalog";
import { CASES_DATA } from "./data";
import { itemArt } from "../cast";
import { logicFingerprint } from "./narrative";
import { NARRATIVES } from "./narrativas";
import { clueProblems, endingProblems, sentences } from "./narrative-check";
import snapshot from "./logic-snapshot.json";

describe("narrativas das investigações", () => {
  it("a lógica de todos os casos é a mesma da fotografia (pistas, solução, tabuleiro e marcações)", () => {
    const snap = snapshot as Record<string, string>;
    expect(CASES_DATA.length).toBe(Object.keys(snap).length);
    for (const c of CASES_DATA) expect(logicFingerprint(c), c.id).toBe(snap[c.id]);
  });

  it("todo caso tem narrativa completa, com fichas que batem com o caso", () => {
    for (const c of allCases()) {
      const n = NARRATIVES[c.id];
      expect(n, c.id).toBeTruthy();
      expect(Object.keys(n.people).sort(), c.id).toEqual(c.model.people.map((p) => p.label).sort());
      expect(n.objects.length, c.id).toBe(c.model.objects.length);
      expect(n.clues.length, c.id).toBe(c.clues.length);
      expect(c.clueTexts, c.id).toEqual(n.clues);
      expect(sentences(n.scene).length, `${c.id} ambientação`).toBe(1);
      const si = sentences(n.intro).length, se = sentences(n.ending).length;
      expect(si >= 2 && si <= 4, `${c.id} introdução tem ${si} frases`).toBe(true);
      expect(se >= 3 && se <= 5, `${c.id} desfecho tem ${se} frases`).toBe(true);
      for (const p of Object.values(n.people)) expect(p.why && p.link, c.id).toBeTruthy();
      for (const o of n.objects) expect(o.desc && o.place, `${c.id} ${o.label}`).toBeTruthy();
    }
  });

  it("nenhum objeto perde a ilustração com o nome novo", () => {
    for (const c of CASES_DATA) c.model.objects.forEach((o, i) => {
      if (itemArt(o.label)) expect(itemArt(NARRATIVES[c.id].objects[i].label), `${c.id}: ${o.label} → ${NARRATIVES[c.id].objects[i].label}`).toBe(itemArt(o.label));
    });
  });

  it("o nome curto da grade é parte do nome do objeto e não confunde dois objetos do mesmo caso", () => {
    for (const c of allCases()) {
      const shorts = c.model.objects.map((o) => o.short ?? o.label);
      expect(new Set(shorts).size, c.id).toBe(shorts.length);
      c.model.objects.forEach((o, i) => expect(o.label.startsWith(shorts[i]), `${c.id}: ${o.label}`).toBe(true));
    }
  });

  it("nenhum objeto se repete entre investigações", () => {
    const seen = new Map<string, string>();
    for (const [id, n] of Object.entries(NARRATIVES)) for (const o of n.objects) {
      const k = o.label.toLowerCase();
      expect(seen.get(k), `"${o.label}" em ${id} e ${seen.get(k)}`).toBeUndefined();
      seen.set(k, id);
    }
  });

  it("cada pista cita claramente a pessoa, o lugar/valor e o objeto — e só eles", () => {
    expect(clueProblems(allCases())).toEqual([]);
  });

  it("o desfecho conta a solução: cita todos, e cada frase com uma pessoa e um objeto (ou lugar) bate com a resposta", () => {
    expect(endingProblems(allCases())).toEqual([]);
  });
});
