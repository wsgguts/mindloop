// Partida guiada (item 3): cada roteiro é jogável do começo ao fim e termina na solução REAL do jogo.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { guidedScript } from "./scripts";
import type { GStep, Script } from "./GuidedPlay";
import { EVERY_GAME } from "../../lib/games";
import { CHANGES, guidedFor, parseGuided, serializeGuided, type GuidedPart } from "../../lib/guided";
import { PATCHES_TUT, SUDOKU_SOLUTION, TANGO_SOLUTION, ZIP_PATH, C, O } from "../../lib/tutorialData";
import { ASTROS_PUZZLES, parseAstros, solutionGrid } from "../../lib/astros";

type Any = Record<string, unknown>;
const targetsOf = (s: Script<Any>, p: Any) => new Set([...renderToString(h(s.Mini!, p)).matchAll(/data-t="([^"]+)"/g)].map((m) => m[1]));

/** Joga o roteiro inteiro com a mecânica real do jogo (`act`): confere que todo toque pedido existe na tela. */
function play(s: Script<Any>): Any | undefined {
  let p = s.start;
  for (const st of s.steps as GStep<Any>[]) {
    if (st.k === "say" || st.k === "wrong") { if (st.k === "wrong") expect(JSON.stringify(st.show(p!))).toContain('"bad"'); continue; }
    const moves = st.k === "do" ? [st.move] : st.moves;
    for (const m of moves) for (const t of m.taps) {
      expect(targetsOf(s, p!), `toque ${t}`).toContain(t);
      if (st.k === "free") expect(s.reject?.(p!, t) ?? null, `toque ${t} recusado`).toBeNull();
      p = s.act!(p!, t);
    }
    if (st.k === "free" && s.check) expect(s.check(p!).solved).toBe(true);
  }
  return p;
}

describe("partida guiada: os roteiros", () => {
  it("Mini Sudoku: termina na solução", () => {
    expect((play(guidedScript("sudoku", "base")) as { vals: number[][] }).vals).toEqual(SUDOKU_SOLUTION);
  });
  it("Tango: termina na solução", () => {
    expect((play(guidedScript("tango", "base")) as { grid: number[][] }).grid).toEqual(TANGO_SOLUTION);
  });
  it("Zip: a trilha passa por todas as casas, na ordem da solução", () => {
    expect((play(guidedScript("zip", "base")) as { path: number[][] }).path).toEqual(ZIP_PATH);
  });
  it("Patches: todas as peças da solução, cobrindo a grade", () => {
    const p = play(guidedScript("patches", "base")) as { pieces: { q: { r: number; c: number; h: number; w: number } }[] };
    expect(p.pieces.map(({ q }) => [q.r, q.c, q.h, q.w]).sort()).toEqual([...PATCHES_TUT.pieces].sort());
  });
  it("Astros: os astros da solução do nível 1", () => {
    const board = parseAstros(ASTROS_PUZZLES[0].raw);
    const only = (g: number[][]) => g.map((row) => row.map((v) => (v === 2 ? 2 : 0))); // as marcas × do "Em volta" não contam
    expect(only((play(guidedScript("astros", "base")) as { grid: number[][] }).grid)).toEqual(only(solutionGrid(board)!));
  });
  it("as versões curtas de cada capítulo novo existem e são jogáveis", () => {
    for (const g of EVERY_GAME) for (const ch of CHANGES[g]) {
      const s = guidedScript(g, `c${ch}` as GuidedPart);
      expect(s.steps.length, `${g} c${ch}`).toBeGreaterThan(0);
      if (s.Mini) play(s);
    }
  });
});

describe("partida guiada: a mecânica é a mesma da partida", () => {
  it("Tango: cada toque troca vazia → Cristal → Orbe → vazia", () => {
    const s = guidedScript("tango", "base"); let p = s.start as Any;
    const v = () => (p as { grid: number[][] }).grid[0][1];
    for (const want of [C, O, 0]) { p = s.act!(p, "c-0-1"); expect(v()).toBe(want); }
  });
  it("Astros: cada toque troca vazia → × → astro → vazia, e “Em volta” marca × em volta do astro", () => {
    const s = guidedScript("astros", "base"); let p = s.start as Any;
    const g = () => (p as { grid: number[][] }).grid;
    p = s.act!(p, "c-0-0"); expect(g()[0][0]).toBe(1); p = s.act!(p, "c-0-0"); expect(g()[0][0]).toBe(2);
    p = s.act!(p, "pad-v"); expect(g()[0][1]).toBe(1); expect(g()[1][1]).toBe(1);
  });
  it("Mini Sudoku: número já usado em todas as linhas fica apagado e é recusado", () => {
    const s = guidedScript("sudoku", "base"); let p = s.start as Any;
    for (const t of ["c-1-2", "pad-1", "c-2-1", "pad-1"]) p = s.act!(p, t);
    expect((p as { used: number[] }).used).toContain(1);
    p = s.act!(p, "c-1-0");
    expect(s.reject!(p, "pad-1")).toMatch(/apagou/);
  });
  it("Zip: voltar pela trilha desfaz; Patches: tocar numa peça a retira", () => {
    const z = guidedScript("zip", "base"); let p = z.start as Any;
    p = z.act!(p, "c-0-1"); p = z.act!(p, "c-0-0");
    expect((p as { path: number[][] }).path).toHaveLength(1);
    const pt = guidedScript("patches", "base"); let q = pt.start as Any;
    for (const t of ["c-0-0", "c-0-1", "c-0-0"]) q = pt.act!(q, t);
    expect((q as { pieces: unknown[] }).pieces).toHaveLength(0);
  });
});

describe("partida guiada: quando aparece", () => {
  const none = new Set<GuidedPart>();
  it("a completa na primeira vez em cada jogo", () => {
    for (const g of EVERY_GAME) expect(guidedFor(g, 1, none, false)).toBe("base");
  });
  it("quem já viu o tutorial antigo não é obrigado a ver de novo", () => {
    expect(guidedFor("sudoku", 1, parseGuided(null, "done"), false)).toBeNull();
    expect(guidedFor("sudoku", 1, parseGuided(null, "skipped"), false)).toBeNull();
  });
  it("a curta só no primeiro nível de um capítulo que muda algo, uma vez", () => {
    const base = new Set<GuidedPart>(["base"]);
    expect(guidedFor("sudoku", 21, base, false)).toBe("c3");
    expect(guidedFor("sudoku", 22, base, false)).toBeNull();
    expect(guidedFor("sudoku", 21, base, true)).toBeNull(); // já tinha passado dali
    expect(guidedFor("sudoku", 21, new Set<GuidedPart>(["base", "c3"]), false)).toBeNull();
    expect(guidedFor("sudoku", 31, base, false)).toBeNull(); // capítulo 4 não muda regra
  });
  it("o que foi visto volta igual do aparelho (e valor estragado não quebra)", () => {
    const s = new Set<GuidedPart>(["base", "c3"]);
    expect(parseGuided(serializeGuided(s), null)).toEqual(s);
    expect(parseGuided("{oops", null).size).toBe(0);
  });
});
