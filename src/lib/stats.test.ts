import { describe, expect, it } from "vitest";
import { addMatch, emptyLog, startMatch, type PlayerLog } from "./history";
import { mk } from "./history.test";
import { emptyProgress, markDone } from "./journey";
import { refMs } from "./scoring";
import { MIN_MATCHES, gameStats, overallStats } from "./stats";

const prog = (n: number) => { let p = emptyProgress(); for (let i = 1; i <= n; i++) p = markDone(p, i); return p; };
const empty = { sudoku: emptyProgress(), zip: emptyProgress(), tango: emptyProgress(), patches: emptyProgress(), astros: emptyProgress() };

describe("médias de desempenho", () => {
  it("histórico vazio: zeros e nenhuma média inventada", () => {
    const o = overallStats(emptyLog(), empty);
    expect(o.matches).toBe(0);
    expect(o.avgSpeed).toBeNull();
    expect(o.trend).toBeNull();
    expect(o.activity).toHaveLength(14);
    const g = gameStats("zip", emptyLog(), emptyProgress());
    expect(g.avgMs).toBeNull();
    expect(g.bestMs).toBeNull();
  });
  it(`só calcula médias a partir de ${MIN_MATCHES} partidas`, () => {
    let l = emptyLog();
    l = addMatch(l, mk({ id: "1", ms: 30_000 }));
    l = addMatch(l, mk({ id: "2", ms: 60_000 }));
    expect(gameStats("sudoku", l, prog(2)).avgMs).toBeNull();
    l = addMatch(l, mk({ id: "3", ms: 90_000 }));
    const g = gameStats("sudoku", l, prog(3));
    expect(g.avgMs).toBe(60_000);
    expect(g.bestMs).toBe(30_000);
    expect(g.matches).toBe(3);
  });
  it("não mistura tempos de jogos diferentes", () => {
    let l: PlayerLog = emptyLog();
    for (let i = 0; i < 3; i++) l = addMatch(l, mk({ id: `s${i}`, game: "sudoku", ms: 10_000 }));
    for (let i = 0; i < 3; i++) l = addMatch(l, mk({ id: `t${i}`, game: "tango", ms: 500_000 }));
    expect(gameStats("sudoku", l, prog(1)).avgMs).toBe(10_000);
    expect(gameStats("tango", l, prog(1)).avgMs).toBe(500_000);
  });
  it("ritmo = referência ÷ tempo; aproveitamento e jornadas a partir do progresso real", () => {
    let l = emptyLog();
    for (let i = 0; i < 3; i++) l = addMatch(l, mk({ id: String(i), level: 1, ms: refMs("sudoku", 1) }));
    const o = overallStats(l, { ...empty, sudoku: prog(100), zip: prog(50) });
    expect(o.avgSpeed).toBeCloseTo(1);
    expect(o.levelsDone).toBe(150);
    expect(o.journeysDone).toBe(1);
    expect(o.completion).toBeCloseTo(150 / 400);
  });
  it("evolução: compara as 5 últimas vitórias com as 5 anteriores", () => {
    let l = emptyLog();
    const ref = refMs("sudoku", 1);
    for (let i = 0; i < 5; i++) l = addMatch(l, mk({ id: `a${i}`, at: 1000 + i, ms: ref * 2 }));
    for (let i = 0; i < 5; i++) l = addMatch(l, mk({ id: `b${i}`, at: 2000 + i, ms: ref }));
    expect(overallStats(l, empty).trend).toBeCloseTo(0.5);
  });
  it("tentativas por vitória usa partidas iniciadas ÷ vitórias registradas", () => {
    let l = emptyLog();
    for (let i = 0; i < 6; i++) l = startMatch(l, "zip", false);
    for (let i = 0; i < 3; i++) l = addMatch(l, mk({ id: String(i), game: "zip" }));
    expect(gameStats("zip", l, prog(3)).attemptsPerWin).toBe(2);
  });
});
