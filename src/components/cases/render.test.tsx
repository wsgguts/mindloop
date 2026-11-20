// Renderiza (no servidor, como o Next faz na primeira carga) as telas de TODOS os mistérios: convite, história,
// investigação, tabuleiro e caderno. Pega erros de execução nos componentes e confere que a história, o narrador,
// a regra do lugar, as pistas, os personagens, os objetos e as quatro áreas chegam à tela.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allCases } from "../../lib/cases/catalog";
import { emptyCaseLog, recordOf } from "../../lib/cases/progress";
import { MARK_NO, MARK_YES, encodeMark } from "../../lib/cases/relations";
import { EVERY_GAME } from "../../lib/games";
import { emptyProgress } from "../../lib/journey";
import CaseBoard from "./CaseBoard";
import CaseBook from "./CaseBook";
import CaseOffer from "./CaseOffer";
import CaseScreen from "./CaseScreen";
import { CaseSheets } from "./CaseSheets";
import { artOf } from "../../lib/cast";
import { textoPuro } from "../../lib/cases/narracao";

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const screen = (c: ReturnType<typeof allCases>[number], record: ReturnType<typeof recordOf>) => renderToString(h(CaseScreen, {
  c, record, active: false, continueLabel: "Continuar", onContinue: noop, exitLabel: "Voltar", onExit: noop, onDraft: noop,
  onSolve: () => { throw new Error("não deveria resolver"); },
}));

describe("telas das investigações (100 mistérios)", () => {
  it("convite e história: o narrador conta o caso; nada de quebra-cabeça na tela de história", () => {
    for (const c of allCases()) {
      const offer = text(renderToString(h(CaseOffer, { c, nextLevel: c.level + 1, onInvestigate: noop, onSkip: noop })));
      expect(offer, c.id).toContain(c.title);
      expect(offer, c.id).toContain(c.structureName);
      const html = screen(c, recordOf(emptyCaseLog(), c.id));
      const story = text(html);
      // Título, narrador, a primeira fala (para leitores de tela, enquanto a máquina de escrever digita) e o "Pular".
      for (const t of [c.title, c.narrator.name, textoPuro(c.narracao[0].texto), "Pular", "Toque para"]) expect(story, `${c.id}: ${t}`).toContain(t);
      // Fora desta tela: cofre do quebra-cabeça, estrutura, contagem de pistas, regras, cartões e fichas.
      expect(html, c.id).not.toContain("cx-scene-art");
      for (const t of [c.structureName, `${c.clues.length} pistas`, "Fichas", ...c.ruleTexts]) expect(story, `${c.id}: ${t}`).not.toContain(t);
      // A pergunta e o botão só aparecem na última fala.
      expect(story, c.id).not.toContain("Começar investigação");
    }
  });

  it("fichas: cada personagem com por que está ali e a ligação; cada objeto com descrição, papel e lugar", () => {
    for (const c of allCases()) {
      const t = text(renderToString(h(CaseSheets, { c })));
      for (const p of c.cast) for (const w of [p.name, p.why, p.link]) expect(t, `${c.id}: ${w}`).toContain(w);
      for (const o of c.objectCards) for (const w of [o.label, o.desc, o.role, o.place]) expect(t, `${c.id}: ${w}`).toContain(w);
    }
  });

  it("investigação: tabuleiro, quadro de decisões em grades, pistas com a grade que afetam e sua resposta", () => {
    for (const c of allCases()) {
      const m = c.model;
      const x = [encodeMark(0, 0, 0, MARK_YES), encodeMark(0, 1, 1, MARK_NO), 3, 100002, 400017, 600009]; // as quatro últimas são de versões antigas: descartadas
      const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer.map(() => -1), hints: 0, ms: 0, k: `${c.storyKey}@grades`, x } };
      const html = screen(c, record);
      const t = text(html);
      for (const w of ["Tabuleiro", "Quadro de decisões", "Ajuda automática", "Pistas", "Sua resposta", "Verificar", "Limpar quadro", "Desfazer"]) expect(t, `${c.id}: ${w}`).toContain(w);
      for (const d of c.dims) expect(t, `${c.id}: aba ${d.title}`).toContain(d.title);
      for (const s2 of [...c.ruleTexts, ...c.notes, ...c.clueTexts]) expect(t, `${c.id}: ${s2}`).toContain(s2);
      for (const p of m.people) expect(t, c.id).toContain(p.label);
      for (const o of m.objects) expect(t, c.id).toContain(o.label);
      // As anotações do rascunho voltam na primeira grade (um ✓ e um ✕) — o resto é vazio ou ✕ automático.
      expect((html.match(/<td class="yes/g) ?? []).length, `${c.id}: ✓ do rascunho`).toBe(1);
      expect((html.match(/<td class="no/g) ?? []).length, `${c.id}: ✕ do rascunho`).toBe(1);
      // Cada pista aparece uma única vez e mostra a etiqueta da grade.
      for (const ct of c.clueTexts) expect(t.split(ct).length - 1, `${c.id}: ${ct}`).toBe(1);
      expect((html.match(/class="cx-tag"/g) ?? []).length, c.id).toBe(c.clues.length);
      // Personagens com a linha de personalidade ficam na história (etapa anterior), não aqui.
      expect(t, c.id).not.toContain(c.story);
    }
  });

  it("um rascunho de uma versão antiga do caso (outra história) é ignorado", () => {
    const c = allCases()[0];
    const record = { ...recordOf(emptyCaseLog(), c.id), draft: { a: c.answer, hints: 2, ms: 5000, k: "historia-antiga" } };
    expect(text(screen(c, record))).toContain("Pular"); // começa pela história, sem retomar o rascunho
  });

  it("o cenário de cada mistério renderiza com a resposta: pessoas, objetos, cômodos e (no Zip) as paradas", () => {
    for (const c of allCases()) {
      const m = c.model;
      const html = renderToString(h(CaseBoard, { model: m, a: c.answer, sel: null, done: true, onSelect: noop, onPlace: noop }));
      const t = text(html);
      for (const p of m.people) expect(t, `${c.id}: ${p.label}`).toContain(p.label);
      // Objeto com ilustração aparece como imagem; sem ilustração, pelo emoji. Personagens sempre com retrato do elenco.
      for (const o of m.objects) expect(html, `${c.id}: ${o.label}`).toContain(artOf(o.label) ?? o.icon!);
      for (const p of m.people) expect(html, `${c.id}: retrato de ${p.label}`).toContain(artOf(p.label)!);
      // Tango: os lados aparecem com o símbolo do jogo (Cristal e Orbe); o nome do lugar fica na regra e na legenda.
      if (m.rule === "equilibrio") for (const w of ["Cristal", "Orbe"]) expect(t, `${c.id}: ${w}`).toContain(w);
      else for (const r of m.scene.rooms) expect(t, `${c.id}: ${r.label}`).toContain(r.label);
      expect((html.match(/class="cx-sc /g) ?? []).length, c.id).toBe(m.rows * m.cols);
      if (m.trail) expect((html.match(/class="cx-stop"/g) ?? []).length, c.id).toBe(m.trail.length);
    }
  });

  it("caderno: a visão geral mostra os 10 capítulos, e cada capítulo lista os seus dois mistérios", () => {
    const progress = Object.fromEntries(EVERY_GAME.map((g) => [g, emptyProgress()])) as Record<(typeof EVERY_GAME)[number], string>;
    for (const g of EVERY_GAME) {
      const ov = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: null, onChapter: noop })));
      expect(ov).toContain("Mistérios por capítulo");
      for (let ch = 1; ch <= 10; ch++) {
        const list = allCases().filter((x) => x.game === g && x.chapter === ch);
        expect(list, `${g} cap. ${ch}`).toHaveLength(2);
        const html = text(renderToString(h(CaseBook, { game: g, log: emptyCaseLog(), progress, onGame: noop, onOpen: noop, onBack: noop, chapter: ch, onChapter: noop })));
        for (const c of list) expect(html, c.id).toContain(c.title);
      }
    }
  });
});
