// Jornada (item 2 do teste com alunos): abre direto no mapa do capítulo atual, com o próximo nível em "JOGAR".
// Sem a tela de capítulos, sem barra de progresso vazia e sem o card "Começar Nível X". Investigações aparecem
// como cristal "Extra" ao lado do nível que as libera, e o caderno fica no cabeçalho com contador.
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
const base = { done, focus: 45, onPlay: noop, onBack: noop, onHelp: noop, onFeedback: noop, cases: { solved: 4, total: 20 }, onCases: noop };

describe("jornada: direto no mapa", () => {
  for (const game of ALL_GAMES) it(`${game}: mapa do capítulo do próximo nível, com "JOGAR" e o caderno 4/20`, () => {
    const html = renderToString(h(Journey, { ...base, game }));
    const t = text(html);
    expect(t).toContain(sceneOf(5).name);
    expect(t).toContain("JOGAR");
    expect(t).toMatch(/4 *\/ *20/); // o React separa os números com comentários na renderização do servidor
    expect((html.match(/class="tnode/g) ?? []).length).toBe(10);
    for (const w of ["Começar", "Continuar", "níveis concluídos", "Capítulos"]) expect(t).not.toContain(w); // telas/cards removidos
    expect(html).not.toContain('role="progressbar"');
  });

  it("fases extras: um cristal por investigação, com estado disponível, resolvida ou bloqueada", () => {
    const caseAt = { 42: { id: "a", solved: false }, 44: { id: "b", solved: true }, 47: { id: "c", solved: false } };
    const html = renderToString(h(Journey, { ...base, game: "sudoku", caseAt, onCase: noop }));
    expect((html.match(/class="textra open"/g) ?? []).length).toBe(1); // 42: nível concluído
    expect((html.match(/class="textra solved"/g) ?? []).length).toBe(1); // 44: investigação resolvida
    expect((html.match(/class="textra locked"/g) ?? []).length).toBe(1); // 47: nível ainda não concluído
    expect(html).toContain("Investigação extra do nível 47: bloqueada");
    expect(text(html)).not.toContain("EXTRA"); // sem a etiqueta preta antiga
  });
});
