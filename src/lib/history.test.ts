import { describe, expect, it } from "vitest";
import { type Match, SESSION_GAP_MS, addMatch, bestSession, distinctDays, emptyLog, importLegacy, matchId, parseLog, startMatch } from "./history";

const T0 = new Date(2026, 10, 9, 10, 0).getTime();
export const mk = (p: Partial<Match> & { at?: number | null } = {}): Match => {
  const at = p.at === undefined ? T0 : p.at;
  const game = p.game ?? "sudoku", level = p.level ?? 1;
  return { id: p.id ?? matchId(game, level, at ?? 0) + Math.random(), game, level, ms: p.ms ?? 60_000, at, hints: p.hints ?? 0, first: p.first ?? true, record: p.record ?? false };
};

describe("histórico de partidas", () => {
  it("registra cada vitória uma única vez (mesmo id não duplica)", () => {
    const m = mk({ id: "x" });
    const a = addMatch(emptyLog(), m);
    const b = addMatch(a, m);
    expect(b.matches).toHaveLength(1);
    expect(b).toBe(a);
  });
  it("sequência de vitórias: abandonar uma partida zera, vencer soma", () => {
    let l = emptyLog();
    l = startMatch(l, "zip", false); l = addMatch(l, mk({ id: "1" }));
    l = startMatch(l, "zip", false); l = addMatch(l, mk({ id: "2" }));
    expect(l.streak).toBe(2);
    l = startMatch(l, "zip", true); // a anterior foi deixada no meio
    expect(l.streak).toBe(0);
    expect(l.bestStreak).toBe(2);
    expect(l.starts.zip).toBe(3);
  });
  it("importa os recordes antigos sem perder nada e sem data", () => {
    const l = importLegacy({ sudoku: { 1: 40000, 2: 50000 }, zip: {}, tango: { 7: 90000 }, patches: {}, astros: {} });
    expect(l.matches).toHaveLength(3);
    expect(l.matches.every((m) => m.at === null)).toBe(true);
    expect(distinctDays(l.matches)).toBe(0);
  });
  it("lê com segurança: lixo vira null e registros inválidos/repetidos são descartados", () => {
    expect(parseLog("{")).toBeNull();
    expect(parseLog(JSON.stringify({ v: 2 }))).toBeNull();
    const ok = mk({ id: "a" });
    const raw = JSON.stringify({ v: 1, matches: [ok, ok, { ...ok, id: "b", level: 500 }, { id: "c" }], streak: 3, bestStreak: 4, starts: { sudoku: 2 } });
    const l = parseLog(raw)!;
    expect(l.matches.map((m) => m.id)).toEqual(["a"]);
    expect(l.starts).toEqual({ sudoku: 2, zip: 0, tango: 0, patches: 0, astros: 0 });
  });
  it("sessão: vitórias com até 30 min entre si; dias distintos pelo calendário", () => {
    const ms = [0, 10, 20, 100, 110].map((min, i) => mk({ id: String(i), at: T0 + min * 60_000 }));
    expect(bestSession(ms)).toBe(3);
    expect(bestSession([mk({ at: T0 }), mk({ at: T0 + SESSION_GAP_MS })])).toBe(2);
    expect(distinctDays([mk({ at: T0 }), mk({ at: T0 + 3600_000 }), mk({ at: T0 + 86400_000 })])).toBe(2);
  });
});
