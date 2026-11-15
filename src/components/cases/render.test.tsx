// Renderiza (no servidor, como o Next faz na primeira carga) as telas de TODOS os mistérios: convite, história,
// investigação, tabuleiro e caderno. Pega erros de execução nos componentes e confere que a história, o narrador,
// a regra do lugar, as pistas, os personagens, os objetos e as quatro áreas chegam à tela.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allCases } from "../../lib/cases/catalog";
import { allowedCells } from "../../lib/cases/model";
import { emptyCaseLog, recordOf } from "../../lib/cases/progress";
import { markKey, objMarkKey } from "../../lib/cases/relations";
import { EVERY_GAME } from "../../lib/games";
import { emptyProgress } from "../../lib/journey";
import CaseBoard from "./CaseBoard";
import CaseBook from "./CaseBook";
import CaseOffer from "./CaseOffer";
import CaseScreen from "./CaseScreen";

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const screen = (c: ReturnType<typeof allCases>[number], record: ReturnType<typeof recordOf>) => renderToString(h(CaseScreen, {
  c, record, active: false, continueLabel: "Continuar", onContinue: noop, exitLabel: "Voltar", onExit: noop, onDraft: noop,
  onSolve: () => { throw new Error("não deveria resolver"); },
}));

describe("telas das investigações (50 mistérios)", () => {
  it("convite e história: título, estrutura, narrador e contexto", () => {
    for (const c of allCases()) {
      const offer = text(renderToString(h(CaseOffer, { c, nextLevel: c.level + 1, onInvestigate: noop, onSkip: noop })));
      expect(offer, c.id).toContain(c.title);
      expect(offer, c.id).toContain(c.structureName);
      const story = text(screen(c, recordOf(emptyCaseLog(), c.id)));
      for (const t of [c.story, c.goal, c.structureName, c.narrator.name]) expect(story, `${c.id}: ${t}`).toContain(t);
    }
  });

  it("investigação: personagens, objetos, cenário, pistas, dedução (onde e o quê) e sua resposta", () => {
    for (const c of allCases()) {
      const m = c.model;
      const free = allowedCells(m)[0];
      const x = [markKey(m, 0, free), objMarkKey(m, 1, 0)];
      const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer.map(() => -1), hints: 0, ms: 0, k: c.storyKey, x } };
      const html = screen(c, record);
      const t = text(html);
      for (const w of ["Personagens", "Objetos", "Cenário", "Pistas", "Dedução", "Onde?", "O quê?", "Sua resposta", "Verificar", "Limpar X"]) expect(t, `${c.id}: ${w}`).toContain(w);
      for (const s of [...c.ruleTexts, ...c.notes, ...c.clueTexts, c.story]) expect(t, `${c.id}: ${s}`).toContain(s);
      for (const p of m.people) expect(t, c.id).toContain(p.label);
      for (const o of m.objects) expect(t, c.id).toContain(o.label);
      // Os dois X do rascunho voltam; nenhum outro aparece sozinho.
      expect((html.match(/class="no[" ]/g) ?? []).length, `${c.id}: X do rascunho`).toBe(2);
      // Cada pista aparece uma única vez.
      for (const ct of c.clueTexts) expect(t.split(ct).length - 1, `${c.id}: ${ct}`).toBe(1);
    }
  });

  it("um rascunho de uma versão antiga do caso (outra história) é ignorado", () => {
    const c = allCases()[0];
    const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer, hints: 2, ms: 5000, k: "historia-antiga" } };
    expect(text(screen(c, record))).toContain("Começar investigação"); // começa pela história, sem retomar o rascunho
  });

  it("o cenário de cada mistério renderiza com a resposta: pessoas, objetos, cômodos e (no Zip) as paradas", () => {
    for (const c of allCases()) {
      const m = c.model;
      const html = renderToString(h(CaseBoard, { model: m, a: c.answer, sel: null, done: true, onSelect: noop, onPlace: noop }));
      const t = text(html);
      for (const p of m.people) expect(t, `${c.id}: ${p.label}`).toContain(p.label);
      for (const o of m.objects) expect(html, `${c.id}: ${o.label}`).toContain(o.icon!);
      for (const r of m.scene.rooms) expect(t, `${c.id}: ${r.label}`).toContain(r.label);
      expect((html.match(/class="cx-sc /g) ?? []).length, c.id).toBe(m.rows * m.cols);
      if (m.trail) expect((html.match(/class="cx-stop"/g) ?? []).length, c.id).toBe(m.trail.length);
    }
  });

  it("caderno: a visão geral mostra os 10 capítulos, e cada capítulo lista o seu mistério", () => {
    const progress = Object.fromEntries(EVERY_GAME.map((g) => [g, emptyProgress()])) as Record<(typeof EVERY_GAME)[number], string>;
    for (const g of EVERY_GAME) {
      const ov = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: null, onChapter: noop })));
      expect(ov).toContain("Mistérios por capítulo");
      for (let ch = 1; ch <= 10; ch++) {
        const list = allCases().filter((x) => x.game === g && x.chapter === ch);
        expect(list, `${g} cap. ${ch}`).toHaveLength(1);
        const html = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: ch, onChapter: noop })));
        for (const c of list) expect(html, c.id).toContain(c.title);
      }
    }
  });
});
