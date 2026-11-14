import { describe, expect, it } from "vitest";
import { EVERY_GAME } from "../games";
import { ACHIEVEMENTS, evaluate } from "../achievements";
import { emptyLog } from "../history";
import { emptyProgress } from "../journey";
import { CASE_PATTERNS, caseLevels, xpFor, medalFor } from "./config";
import { CASES_DATA } from "./data";
import { allCases, caseAfter, caseById, casesOf, firstBroken, isCorrect } from "./catalog";
import { generateGame } from "./generate";
import { type Model, allAssignments, clueState, clueText, deduce, evalClue, solveAll } from "./model";
import { emptyCaseLog, goldCount, parseCaseLog, recordSkip, recordSolve, saveDraft, shouldOffer, solvedCount, xpTotal } from "./progress";

const progress = { sudoku: emptyProgress(), zip: emptyProgress(), tango: emptyProgress(), patches: emptyProgress(), astros: emptyProgress() };

describe("banco de mistérios", () => {
  it("segue a agenda de config.ts: um mistério por fase agendada, em todos os jogos", () => {
    for (const g of EVERY_GAME) {
      const levels = caseLevels(g);
      expect(CASES_DATA.filter((c) => c.game === g).map((c) => c.level)).toEqual(levels);
      expect(levels.length).toBeGreaterThanOrEqual(30);
      // nunca depois da fase 100 e nunca em fases seguidas (sempre há uma fase tradicional entre dois mistérios)
      expect(levels.every((l) => l >= 1 && l < 100)).toBe(true);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeGreaterThanOrEqual(2);
    }
  });

  it("frequência: em média uma investigação a cada 2 a 4 fases, com padrões variados", () => {
    const sizes = CASE_PATTERNS.map((p) => p.length);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(4);
    expect(new Set(CASE_PATTERNS.map((p) => p.join())).size).toBe(CASE_PATTERNS.length);
  });

  it("ids únicos, e cada jogo só tem os próprios mistérios", () => {
    expect(new Set(CASES_DATA.map((c) => c.id)).size).toBe(CASES_DATA.length);
    for (const g of EVERY_GAME) expect(casesOf(g).every((c) => c.game === g && c.id.startsWith(`${g}-`))).toBe(true);
  });

  it("todo mistério tem UMA única solução, que é a resposta guardada", () => {
    for (const c of CASES_DATA) {
      const sols = solveAll(c.model, c.clues, 2);
      expect(sols, c.id).toHaveLength(1);
      expect(sols[0], c.id).toEqual(c.sol);
    }
  });

  it("todo mistério se resolve só com dedução (sem tentativa e erro)", () => {
    for (const c of CASES_DATA) {
      const d = deduce(c.model, c.clues);
      expect(d.solved, c.id).toBe(true);
      expect(d.domains.map((x) => x.indexOf(true)), c.id).toEqual(c.sol);
    }
  });

  it("nenhuma pista é dispensável (cada uma é necessária para a solução ser única)", () => {
    for (const c of CASES_DATA) {
      const all = allAssignments(c.model);
      c.clues.forEach((k, i) => {
        if (k.k === "count" || k.k === "noTriple" || k.k === "roads") return;
        const without = c.clues.filter((_, j) => j !== i);
        expect(all.filter((a) => without.every((x) => evalClue(c.model, x, a))).length, `${c.id} pista ${i}`).toBeGreaterThan(1);
      });
    }
  });

  it("o banco é reproduzível: gerar de novo dá o mesmo resultado (data.ts está atualizado)", () => {
    for (const g of EVERY_GAME) expect(generateGame(g)).toEqual(CASES_DATA.filter((c) => c.game === g));
  }, 120_000);

  it("dificuldade cresce ao longo da jornada", () => {
    for (const g of EVERY_GAME) {
      const cs = casesOf(g);
      for (let i = 1; i < cs.length; i++) expect(cs[i].difficulty).toBeGreaterThanOrEqual(cs[i - 1].difficulty);
      const size = (m: Model) => m.slots.length * m.values.length;
      expect(size(cs[cs.length - 1].model)).toBeGreaterThan(size(cs[0].model));
    }
  });
});

describe("catálogo (textos, dicas e explicação)", () => {
  it("cada mistério tem todos os campos do banco preenchidos", () => {
    for (const c of allCases()) {
      expect(c.title.length, c.id).toBeGreaterThan(5);
      expect(c.story.length, c.id).toBeGreaterThan(40);
      expect(c.description.length).toBeGreaterThan(20);
      expect(c.goal.endsWith("?")).toBe(true);
      expect(c.art.startsWith("/")).toBe(true);
      expect(c.clueTexts.length).toBeGreaterThan(0);
      expect(c.clueTexts.every((t) => /^[A-ZÀ-Ú]/.test(t) && t.endsWith(".") && !t.includes("undefined") && !t.includes("{"))).toBe(true);
      expect([...c.notes, ...c.ruleTexts, c.ending, ...c.explanation].every((t) => !t.includes("undefined") && !t.includes("{")), c.id).toBe(true);
      expect(c.ending.length, c.id).toBeGreaterThan(30);
      expect(c.structureName.length, c.id).toBeGreaterThan(5);
      expect(c.hints).toHaveLength(3);
      expect(c.hints.every((h) => h.length > 20 && !h.includes("undefined"))).toBe(true);
      expect(c.explanation.length).toBeGreaterThanOrEqual(c.model.slots.length - 1);
      expect(c.estimate[0]).toBeLessThanOrEqual(c.estimate[1]);
      expect(c.xp).toBeGreaterThan(0);
    }
  });

  it("a dica 3 explica uma dedução, sem entregar a resposta inteira", () => {
    for (const c of allCases()) {
      const named = c.model.slots.filter((s) => c.hints[2].includes(s.label)).length;
      expect(named, c.id).toBeLessThan(c.model.slots.length);
    }
  });

  it("concordância: duas coisas femininas viram 'vizinhas'", () => {
    const m: Model = { kind: "layout", distinct: true, grid: [2, 2], slots: [{ label: "Coroa", g: "f" }, { label: "Chave", g: "f" }, { label: "Vaso", g: "m" }], values: [{ label: "A1" }, { label: "B1" }, { label: "A2" }, { label: "B2" }] };
    expect(clueText(m, { k: "touch", a: 0, b: 1 })).toBe("A Coroa e a Chave são vizinhas (lado a lado ou uma em cima da outra).");
    expect(clueText(m, { k: "apart", a: 0, b: 2 })).toContain("não são vizinhos");
  });
});

describe("verificação da resposta", () => {
  it("aceita só a solução; qualquer resposta errada aponta uma pista contrariada", () => {
    for (const c of allCases().filter((_, i) => i % 4 === 0)) {
      expect(isCorrect(c, c.answer)).toBe(true);
      expect(firstBroken(c, c.answer)).toBeNull();
      for (const a of allAssignments(c.model).slice(0, 300)) {
        const same = a.every((v, i) => v === c.answer[i]);
        expect(isCorrect(c, a)).toBe(same);
        if (!same) expect(firstBroken(c, a)).not.toBeNull();
      }
    }
  });

  it("recusa respostas incompletas ou com valores repetidos", () => {
    const c = casesOf("sudoku")[0];
    expect(isCorrect(c, c.answer.map(() => -1))).toBe(false);
    expect(isCorrect(c, c.answer.map(() => c.answer[0]))).toBe(false);
    expect(isCorrect(c, c.answer.slice(1))).toBe(false);
  });

  it("estado das pistas só confere o que foi preenchido (nunca revela a solução)", () => {
    const c = casesOf("tango")[0];
    const empty = c.answer.map(() => -1);
    for (const k of [...c.rules, ...c.clues]) expect(clueState(c.model, k, empty)).toBeNull();
    for (const k of [...c.rules, ...c.clues]) expect(clueState(c.model, k, c.answer)).toBe(true);
    // três iguais seguidos quebram a regra mesmo com a fila incompleta
    const bad = empty.slice(); bad[0] = bad[1] = bad[2] = 0;
    expect(clueState(c.model, { k: "noTriple" }, bad)).toBe(false);
  });

  it("caseAfter encontra o mistério de cada fase agendada e nada nas outras", () => {
    for (const g of EVERY_GAME) {
      const levels = new Set(caseLevels(g));
      for (let l = 1; l <= 100; l++) expect(!!caseAfter(g, l)).toBe(levels.has(l));
    }
    expect(caseById("sudoku-02")?.game).toBe("sudoku");
  });
});

describe("progresso das investigações", () => {
  const c = casesOf("zip")[0];

  it("convite: aparece até resolver ou pular; pular nunca tira nada", () => {
    let log = emptyCaseLog();
    expect(shouldOffer(log, c.id)).toBe(true);
    log = recordSkip(log, c.id, 1000);
    expect(shouldOffer(log, c.id)).toBe(false);
    expect(xpTotal(log)).toBe(0);
    expect(solvedCount(log)).toBe(0);
    // um caso pulado ainda pode ser resolvido depois (caderno de investigações)
    log = recordSolve(log, c, 90_000, 0, 2000).log;
    expect(solvedCount(log)).toBe(1);
  });

  it("XP só na primeira solução; dicas reduzem o XP e a medalha", () => {
    let log = emptyCaseLog();
    const r1 = recordSolve(log, c, 120_000, 2, 1000);
    expect(r1.solve.first).toBe(true);
    expect(r1.solve.xp).toBe(xpFor(c.difficulty, 2));
    expect(r1.solve.xp).toBeLessThan(xpFor(c.difficulty, 0));
    log = r1.log;
    const r2 = recordSolve(log, c, 60_000, 0, 2000);
    expect(r2.solve.xp).toBe(0);
    expect(r2.solve.record).toBe(true);
    log = r2.log;
    expect(xpTotal(log)).toBe(xpFor(c.difficulty, 2));
    expect(log.records[c.id].bestMs).toBe(60_000);
    expect(log.records[c.id].bestHints).toBe(0);
    expect(goldCount(log)).toBe(1);
    expect(log.history).toHaveLength(2);
    expect(shouldOffer(log, c.id)).toBe(false);
    expect(medalFor(0)).toBe("ouro"); expect(medalFor(1)).toBe("prata"); expect(medalFor(3)).toBe("bronze");
  });

  it("o mesmo evento de solução não é contado duas vezes", () => {
    const a = recordSolve(emptyCaseLog(), c, 50_000, 0, 1234).log;
    const b = recordSolve(a, c, 50_000, 0, 1234).log;
    expect(b.history).toHaveLength(1);
  });

  it("sobrevive a recarregar a página (salvar → ler) e ignora dados corrompidos", () => {
    let log = recordSolve(emptyCaseLog(), c, 70_000, 1, 5000).log;
    log = saveDraft(log, "tango-03", { a: [0, -1, 1, -1], hints: 1, ms: 12_000 });
    log = recordSkip(log, "patches-05", 6000);
    const back = parseCaseLog(JSON.stringify(log));
    expect(back).toEqual(log);
    expect(parseCaseLog("{lixo")).toEqual(emptyCaseLog());
    expect(parseCaseLog(JSON.stringify({ v: 2 }))).toEqual(emptyCaseLog());
    expect(saveDraft(log, "tango-03", null).records["tango-03"].draft).toBeUndefined();
  });

  it("conquistas de investigação usam o mesmo sistema de medalhas", () => {
    expect(ACHIEVEMENTS.filter((a) => a.category === "investigacao").length).toBeGreaterThanOrEqual(10);
    let log = emptyCaseLog();
    const none = evaluate({ log: emptyLog(), progress }, {}, 1);
    expect(none.fresh.some((a) => a.category === "investigacao")).toBe(false);
    log = recordSolve(log, c, 45_000, 0, 10).log;
    const ev = evaluate({ log: emptyLog(), progress, cases: log }, {}, 1);
    const ids = ev.fresh.map((a) => a.id);
    expect(ids).toContain("inv-primeira-pista");
    expect(ids).toContain("inv-olho-rapido");
    expect(ids).not.toContain("inv-detetive");
  });
});
