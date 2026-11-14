// Jornada em duas etapas: a visão geral mostra cabeçalho, Investigações e os 10 capítulos; o mapa mostra só a barra
// compacta e a trilha (sem o cabeçalho grande, que antes empurrava o mapa para baixo).
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ALL_GAMES } from "../lib/games";
import { emptyProgress, markDone } from "../lib/journey";
import { sceneOf } from "../lib/scenes";
import Journey from "./Journey";

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
let done = emptyProgress();
for (let i = 1; i <= 44; i++) done = markDone(done, i);
const base = { done, focus: 45, onPlay: noop, onBack: noop, onHelp: noop, onFeedback: noop, cases: { solved: 0, total: 34 }, onCases: noop };

describe("jornada: visão geral → mapa", () => {
  for (const game of ALL_GAMES) it(`${game}: visão geral com os 10 capítulos, Investigações e "Continuar"`, () => {
    const t = text(renderToString(h(Journey, { ...base, game, start: "overview" })));
    expect(t).toContain("Investigações");
    expect(t).toContain("Continuar");
    expect(t).toContain("Nível 45");
    for (let c = 1; c <= 10; c++) expect(t).toContain(sceneOf(c).name);
    expect(t).not.toContain("Capítulos ‹"); // o mapa não aparece junto
  });

  it("mapa: barra compacta com o mundo do capítulo atual e os 10 níveis, sem o cabeçalho grande", () => {
    const html = renderToString(h(Journey, { ...base, game: "sudoku", start: "map" }));
    const t = text(html);
    expect(t).toContain("‹ Capítulos");
    expect(t).toContain(sceneOf(5).name);
    expect(t).not.toContain("Investigações");
    expect(t).not.toContain("níveis concluídos");
    expect((html.match(/class="tnode/g) ?? []).length).toBe(10);
  });

  it("voltando de uma vitória a jornada abre direto no mapa", () => {
    const t = text(renderToString(h(Journey, { ...base, game: "zip", start: "overview", justDone: 44 })));
    expect(t).toContain("‹ Capítulos");
  });
});
