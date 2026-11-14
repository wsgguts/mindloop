// Fluxo de integração das investigações com as jornadas, simulando o mesmo caminho do App:
// vitória (markDone) → tela de parabéns → Continuar → convite (afterContinue) → investigar ou pular → próxima fase.
import { describe, expect, it } from "vitest";
import { evaluate } from "../achievements";
import { EVERY_GAME } from "../games";
import { emptyLog } from "../history";
import { LEVELS_PER_GAME, type JourneyGame, doneCount, emptyProgress, isUnlocked, markDone } from "../journey";
import { afterContinue, casesOf, isCorrect } from "./catalog";
import { caseLevels } from "./config";
import { type CaseLog, emptyCaseLog, parseCaseLog, recordSkip, recordSolve, shouldOffer, solvedCount, xpTotal } from "./progress";

/** Joga a jornada inteira de um jogo; `choose` decide investigar (true) ou pular (false) cada convite. */
function playJourney(game: JourneyGame, choose: (caseIdx: number) => boolean, start: CaseLog = emptyCaseLog()) {
  let progress = emptyProgress();
  let log = start;
  const offered: string[] = [];
  let level = 1, k = 0, t = 1;
  while (level <= LEVELS_PER_GAME) {
    expect(isUnlocked(progress, level)).toBe(true); // a fase nunca fica bloqueada pela investigação
    progress = markDone(progress, level);
    if (level === LEVELS_PER_GAME) break; // fase 100: sem "Continuar" para uma próxima fase
    const go = afterContinue(game, level, (id) => shouldOffer(log, id));
    expect(go.nextIdx).toBe(level); // a próxima fase é sempre a mesma, investigando ou não
    if (go.case) {
      expect(go.case.game).toBe(game); // cada jogo só apresenta os próprios mistérios
      offered.push(go.case.id);
      log = choose(k++) ? recordSolve(log, go.case, 120_000, 0, t++).log : recordSkip(log, go.case.id, t++);
      // salvar e recarregar a página no meio do caminho não muda nada
      log = parseCaseLog(JSON.stringify(log));
    }
    level = go.nextIdx + 1;
  }
  return { progress, log, offered };
}

describe("investigações dentro das jornadas (4 jogos)", () => {
  for (const game of EVERY_GAME) {
    it(`${game}: convites nas fases agendadas, nunca seguidos, sem bloquear a jornada`, () => {
      const { progress, log, offered } = playJourney(game, (i) => i % 2 === 0);
      expect(doneCount(progress)).toBe(LEVELS_PER_GAME); // as 100 fases continuam todas jogáveis
      expect(offered).toEqual(casesOf(game).map((c) => c.id));
      expect(offered.map((id) => Number(id.split("-")[1]))).toEqual(caseLevels(game));
      expect(solvedCount(log, game)).toBe(Math.ceil(offered.length / 2));
    });
  }

  it("pular tudo: a jornada termina igual e nada é perdido ou cobrado", () => {
    const skipAll = playJourney("tango", () => false);
    const solveAll = playJourney("tango", () => true);
    expect(skipAll.progress).toBe(solveAll.progress);
    expect(xpTotal(skipAll.log)).toBe(0);
    expect(solvedCount(skipAll.log)).toBe(0);
    expect(xpTotal(solveAll.log)).toBeGreaterThan(0);
  });

  it("repetir a jornada não oferece de novo mistérios já resolvidos ou pulados", () => {
    const first = playJourney("zip", (i) => i % 3 === 0);
    const again = playJourney("zip", () => true, first.log);
    expect(again.offered).toEqual([]);
  });

  it("um mistério pulado pode ser resolvido depois (caderno) e conta para conquistas", () => {
    const { log } = playJourney("patches", () => false);
    const c = casesOf("patches")[0];
    expect(isCorrect(c, c.answer)).toBe(true);
    const after = recordSolve(log, c, 30_000, 0, 999).log;
    const ev = evaluate({ log: emptyLog(), progress: { sudoku: emptyProgress(), zip: emptyProgress(), tango: emptyProgress(), patches: emptyProgress(), astros: emptyProgress() }, cases: after }, {}, 1);
    expect(ev.fresh.map((a) => a.id)).toContain("inv-primeira-pista");
  });

  it("fases sem agenda seguem direto para a próxima, sem convite", () => {
    for (const g of EVERY_GAME) {
      const scheduled = new Set(caseLevels(g));
      for (let l = 1; l < LEVELS_PER_GAME; l++) if (!scheduled.has(l)) expect(afterContinue(g, l, () => true).case).toBeUndefined();
    }
  });
});
