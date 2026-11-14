// Astros (jogo bônus): a partida, o tutorial, as regras e a jornada renderizam sem quebrar.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ASTROS_PUZZLES } from "../lib/astros";
import { emptyProgress } from "../lib/journey";
import AstrosGame from "./AstrosGame";
import Journey from "./Journey";
import { RulesContent } from "./Rules";
import { TUTORIALS } from "./tutorial";

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const props = { active: false, onMenu: noop, onRules: noop, onFeedback: noop, onWin: noop, onCelebrated: noop };

describe("Astros: telas", () => {
  for (const i of [0, 39, 99]) it(`partida do nível ${i + 1}: céu ${ASTROS_PUZZLES[i].raw.split("|")[0]}×${ASTROS_PUZZLES[i].raw.split("|")[0]} com botões e mensagem inicial`, () => {
    const p = ASTROS_PUZZLES[i];
    const n = Number(p.raw.split("|")[0]);
    const html = renderToString(h(AstrosGame, { ...props, puzzle: p }));
    expect((html.match(/class="acell/g) ?? []).length).toBe(n * n);
    const t = text(html);
    expect(t).toContain("Astro");
    expect(t).toContain("Marcar");
    expect(t).toMatch(new RegExp(`0 ?/ ?${n} astros`));
    expect(t).toContain("Dica");
  });

  it("tutorial: todos os passos e todos os quadros das demonstrações renderizam", () => {
    const steps = TUTORIALS.astros;
    expect(steps.length).toBeGreaterThanOrEqual(5);
    for (const s of steps) {
      for (let b = 0; b < s.demo.beats.length; b++) {
        const html = renderToString(h("div", null, s.demo.render(b)));
        expect(html, s.title).toContain("acell");
      }
    }
  });

  it("regras explicam as 4 regras e que é um jogo bônus", () => {
    const t = text(renderToString(h(RulesContent, { game: "astros" })));
    expect(t).toContain("Jogo bônus");
    expect(t).toContain("Um por linha");
    expect(t).toContain("Ninguém se encosta");
  });

  it("jornada: no modo administrador todos os níveis aparecem liberados (sem cadeado)", () => {
    const base = { game: "astros" as const, done: emptyProgress(), focus: 1, onPlay: noop, onBack: noop, onHelp: noop, onFeedback: noop, start: "map" as const };
    const locked = renderToString(h(Journey, base));
    const admin = renderToString(h(Journey, { ...base, admin: true }));
    expect((locked.match(/tbdg lock/g) ?? []).length).toBe(9);
    expect((admin.match(/tbdg lock/g) ?? []).length).toBe(0);
  });
});
