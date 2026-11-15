import { describe, expect, it } from "vitest";
import { EVERY_GAME } from "../games";
import { emptyProgress } from "../journey";
import { ACHIEVEMENTS, evaluate } from "../achievements";
import { emptyLog } from "../history";
import { allCases, caseAfter, casesOf, firstBroken, isComplete, isCorrect } from "./catalog";
import { caseLevels, difficultyOf, xpFor } from "./config";
import { CASES_DATA } from "./data";
import { generateGame } from "./generate";
import { allAnswers, clueState, deduce, evalClue, posList, ruleOk } from "./model";
import { emptyCaseLog, parseCaseLog, recordSkip, recordSolve, saveDraft, shouldOffer, solvedCount, xpTotal } from "./progress";
import { RULE_OF } from "./themes";

const progress = Object.fromEntries(EVERY_GAME.map((g) => [g, emptyProgress()])) as Record<(typeof EVERY_GAME)[number], string>;

describe("banco de mistérios", () => {
  it("duas investigações por capítulo em cada jogo (20 por jogo, 100 no total), na fase da agenda", () => {
    expect(CASES_DATA).toHaveLength(100);
    for (const g of EVERY_GAME) {
      const levels = caseLevels(g);
      expect(levels).toHaveLength(20);
      levels.forEach((l, i) => expect(Math.ceil(l / 10), `${g}`).toBe(Math.floor(i / 2) + 1));
      expect(CASES_DATA.filter((c) => c.game === g).map((c) => c.level)).toEqual(levels);
    }
  });

  it("ids únicos, e cada jogo só tem os próprios mistérios", () => {
    expect(new Set(CASES_DATA.map((c) => c.id)).size).toBe(CASES_DATA.length);
    for (const g of EVERY_GAME) expect(casesOf(g).every((c) => c.game === g && c.id.startsWith(`${g}-`))).toBe(true);
  });

  it("cada jogo usa a regra de cenário dele", () => {
    for (const c of CASES_DATA) expect(c.model.rule, c.id).toBe(RULE_OF[c.game]);
  });

  it("todo mistério tem UMA única solução (lugar + objeto de cada um), que é a resposta guardada", () => {
    for (const c of CASES_DATA) {
      const sols = allAnswers(c.model).filter((a) => c.clues.every((k) => evalClue(c.model, k, a)));
      expect(sols, c.id).toHaveLength(1);
      expect(sols[0], c.id).toEqual(c.sol);
    }
  });

  it("todo mistério se resolve só com dedução (sem tentativa e erro)", () => {
    for (const c of CASES_DATA) {
      const d = deduce(c.model, c.clues);
      expect(d.solved, c.id).toBe(true);
    }
  });

  it("nenhuma pista é dispensável (cada uma é necessária para a solução ser única)", () => {
    for (const c of CASES_DATA) {
      const all = allAnswers(c.model);
      c.clues.forEach((k, i) => {
        if (k.k === "rule") return; // a regra do lugar já está embutida nas possibilidades
        const without = c.clues.filter((_, j) => j !== i);
        expect(all.filter((a) => without.every((x) => evalClue(c.model, x, a))).length, `${c.id} pista ${i}`).toBeGreaterThan(1);
      });
    }
  });

  it("a regra do lugar deixa dúvida: sem as pistas, há várias posições possíveis", () => {
    for (const c of CASES_DATA) expect(posList(c.model).length, c.id).toBeGreaterThanOrEqual(4);
  });

  it("o banco é reproduzível: gerar de novo dá o mesmo resultado (data.ts está atualizado)", () => {
    for (const g of EVERY_GAME) expect(generateGame(g)).toEqual(CASES_DATA.filter((c) => c.game === g));
  });

  it("a dificuldade cresce: mais pessoas, mais pistas e pistas cruzadas nos capítulos finais", () => {
    for (const g of EVERY_GAME) {
      const cs = CASES_DATA.filter((c) => c.game === g);
      cs.forEach((c) => expect(c.difficulty, c.id).toBe(difficultyOf(c.chapter)));
      const via = (c: (typeof cs)[number]) => c.clues.filter((k) => k.k === "via").length;
      const late = cs.filter((c) => c.difficulty >= 3), early = cs.filter((c) => c.difficulty === 1);
      expect(late.every((c) => c.model.people.length === 4), g).toBe(true);
      expect(late.every((c) => via(c) >= 2), g).toBe(true);
      expect(Math.min(...late.map((c) => c.model.rows * c.model.cols)), g).toBeGreaterThanOrEqual(Math.min(...early.map((c) => c.model.rows * c.model.cols)));
    }
  });
});

describe("catálogo (textos, dicas e explicação)", () => {
  it("cada mistério tem todos os campos preenchidos", () => {
    for (const c of allCases()) {
      expect(c.title.length, c.id).toBeGreaterThan(5);
      expect(c.story.length, c.id).toBeGreaterThan(40);
      expect(c.goal.length, c.id).toBeGreaterThan(10);
      expect(c.ending.length, c.id).toBeGreaterThan(20);
      expect(c.ending, c.id).not.toMatch(/\{com:/);
      expect(c.ruleTexts).toHaveLength(1);
      expect(c.clueTexts.length, c.id).toBe(c.clues.length);
      for (const t of c.clueTexts) expect(t, c.id).toMatch(/^[A-ZÀ-Ú].+\.$/);
      expect(c.hints).toHaveLength(3);
      expect(c.explanation.length, c.id).toBeGreaterThanOrEqual(c.model.people.length);
      expect(c.narrator.name.length).toBeGreaterThan(2);
    }
  });

  it("os textos nunca citam pessoas, objetos ou cômodos que não existem no caso", () => {
    for (const c of allCases()) for (const t of c.clueTexts) {
      expect(t, c.id).not.toContain("undefined");
      expect(t, c.id).not.toMatch(/\bnull\b/);
    }
  });
});

describe("verificação da resposta", () => {
  it("aceita só a solução; qualquer resposta errada aponta uma inconsistência", () => {
    for (const c of allCases()) {
      expect(isCorrect(c, c.answer), c.id).toBe(true);
      const n = c.model.people.length;
      const wrong = c.answer.slice();
      [wrong[n], wrong[n + 1]] = [wrong[n + 1], wrong[n]]; // troca dois objetos
      expect(isCorrect(c, wrong), c.id).toBe(false);
      expect(firstBroken(c, wrong), c.id).not.toBeNull();
    }
  });

  it("recusa respostas incompletas ou com lugar/objeto repetido", () => {
    const c = allCases()[0];
    const n = c.model.people.length;
    expect(isComplete(c, c.answer.map((v, i) => (i === 0 ? -1 : v)))).toBe(false);
    const dup = c.answer.slice(); dup[1] = dup[0];
    expect(isComplete(c, dup)).toBe(false);
    const dupO = c.answer.slice(); dupO[n + 1] = dupO[n];
    expect(isCorrect(c, dupO)).toBe(false);
  });

  it("estado das pistas só confere o que foi preenchido (nunca revela a solução)", () => {
    for (const c of allCases().slice(0, 20)) {
      const empty = new Array(c.answer.length).fill(-1);
      for (const k of c.clues) expect(clueState(c.model, k, empty), c.id).toBeNull();
      for (const k of c.clues) expect(clueState(c.model, k, c.answer), c.id).toBe(true);
      expect(ruleOk(c.model, c.answer.slice(0, c.model.people.length)), c.id).toBe(true);
    }
  });

  it("caseAfter encontra o mistério de cada fase agendada e nada nas outras", () => {
    for (const g of EVERY_GAME) {
      for (const l of caseLevels(g)) expect(caseAfter(g, l)?.level).toBe(l);
      expect(caseAfter(g, 1)).toBeUndefined();
    }
  });
});

describe("progresso das investigações", () => {
  const c = allCases()[0];
  const id = c.id;
  it("convite: aparece até resolver ou pular; pular nunca tira nada", () => {
    let log = emptyCaseLog();
    expect(shouldOffer(log, id)).toBe(true);
    log = recordSkip(log, id, 1);
    expect(shouldOffer(log, id)).toBe(false);
    expect(xpTotal(log)).toBe(0);
  });

  it("XP só na primeira solução; dicas reduzem o XP", () => {
    const r1 = recordSolve(emptyCaseLog(), c, 90_000, 0, 1);
    expect(r1.solve.xp).toBe(xpFor(c.difficulty, 0));
    const r2 = recordSolve(r1.log, c, 80_000, 2, 2);
    expect(r2.solve.first).toBe(false);
    expect(xpTotal(r2.log)).toBe(xpFor(c.difficulty, 0));
    expect(solvedCount(r2.log)).toBe(1);
  });

  it("o rascunho (respostas e X) sobrevive a recarregar a página", () => {
    const log = saveDraft(emptyCaseLog(), id, { a: c.answer.map(() => -1), hints: 1, ms: 5000, k: c.storyKey, x: [3, 100002] });
    const back = parseCaseLog(JSON.stringify(log));
    expect(back.records[id].draft).toEqual({ a: c.answer.map(() => -1), hints: 1, ms: 5000, k: c.storyKey, x: [3, 100002] });
  });

  it("conquistas de investigação usam o mesmo sistema de medalhas", () => {
    expect(ACHIEVEMENTS.filter((x) => x.category === "investigacao").length).toBeGreaterThanOrEqual(10);
    const r = recordSolve(emptyCaseLog(), c, 50_000, 0, 1);
    const ev = evaluate({ log: emptyLog(), progress, cases: r.log }, {}, 1);
    expect(ev.fresh.map((x) => x.id)).toContain("inv-primeira-pista");
  });
});
