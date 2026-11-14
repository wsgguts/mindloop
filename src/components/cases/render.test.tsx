// Renderiza (no servidor, como o Next faz na primeira carga) as telas de TODOS os mistérios: convite, história,
// investigação e caderno. Pega erros de execução nos componentes e confere que a história, a estrutura, as regras e
// as pistas na voz de cada caso chegam à tela.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allCases } from "../../lib/cases/catalog";
import { emptyCaseLog, recordOf } from "../../lib/cases/progress";
import { emptyProgress } from "../../lib/journey";
import CaseBoard from "./CaseBoard";
import CaseBook from "./CaseBook";
import CaseOffer from "./CaseOffer";
import CaseScreen from "./CaseScreen";

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("telas das investigações (135 mistérios)", () => {
  it("convite e história de cada mistério mostram título, estrutura e contexto", () => {
    for (const c of allCases()) {
      const offer = text(renderToString(h(CaseOffer, { c, nextLevel: c.level + 1, onInvestigate: noop, onSkip: noop })));
      expect(offer, c.id).toContain(c.title);
      expect(offer, c.id).toContain(c.structureName);
      const story = text(renderToString(h(CaseScreen, {
        c, record: recordOf(emptyCaseLog(), c.id), active: false, continueLabel: "Continuar", onContinue: noop,
        exitLabel: "Voltar", onExit: noop, onDraft: noop, onSolve: () => { throw new Error("não deveria resolver"); },
      })));
      expect(story, c.id).toContain(c.story);
      expect(story, c.id).toContain(c.goal);
      expect(story, c.id).toContain(c.structureName);
    }
  });

  it("a investigação (rascunho retomado) mostra regras fixas e todas as pistas", () => {
    for (const c of allCases()) {
      const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer.map(() => -1), hints: 0, ms: 0, k: c.storyKey } };
      const play = text(renderToString(h(CaseScreen, {
        c, record, active: false, continueLabel: "Continuar", onContinue: noop,
        exitLabel: "Voltar", onExit: noop, onDraft: noop, onSolve: () => { throw new Error("não deveria resolver"); },
      })));
      for (const t of [...c.notes, ...c.ruleTexts, ...c.clueTexts]) expect(play, `${c.id}: ${t}`).toContain(t);
    }
  });

  it("um rascunho de uma versão antiga do caso (outra história) é ignorado", () => {
    const c = allCases()[0];
    const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer, hints: 2, ms: 5000, k: "historia-antiga" } };
    const html = text(renderToString(h(CaseScreen, {
      c, record, active: false, continueLabel: "Continuar", onContinue: noop, exitLabel: "Voltar", onExit: noop, onDraft: noop, onSolve: () => { throw new Error(); },
    })));
    expect(html).toContain(c.story); // começa pela história, sem retomar o rascunho
  });

  it("o tabuleiro de cada mistério renderiza com a resposta preenchida (ícones e nomes da história)", () => {
    for (const c of allCases()) {
      const html = text(renderToString(h(CaseBoard, { model: c.model, a: c.answer, sel: null, done: true, onSelect: noop, onAssign: noop })));
      for (const s of c.model.slots) expect(html, `${c.id}: ${s.label}`).toContain(s.label);
      if (c.kind === "pattern") for (const v of c.model.values) if (v.icon) expect(html, c.id).toContain(v.icon);
    }
  });

  it("caderno: a visão geral mostra os 10 capítulos, e cada capítulo lista os seus mistérios", () => {
    const progress = { sudoku: emptyProgress(), zip: emptyProgress(), tango: emptyProgress(), patches: emptyProgress() };
    for (const g of ["sudoku", "zip", "tango", "patches"] as const) {
      const ov = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: null, onChapter: noop })));
      expect(ov).toContain("Mistérios por capítulo");
      expect(ov).toContain("‹ Jornada");
      expect((ov.match(/‹ Jornada/g) ?? []).length).toBe(1); // um único "voltar"
      for (let ch = 1; ch <= 10; ch++) {
        const list = allCases().filter((x) => x.game === g && x.chapter === ch);
        const html = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: ch, onChapter: noop })));
        expect(html).toContain("‹ Capítulos");
        for (const c of list) expect(html, c.id).toContain(c.title);
      }
    }
  });
});
