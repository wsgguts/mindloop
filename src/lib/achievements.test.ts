import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, ACH_BY_ID, evaluate, parseUnlocked, progressOf } from "./achievements";
import { addMatch, emptyLog, type PlayerLog } from "./history";
import { mk } from "./history.test";
import { emptyProgress, markDone } from "./journey";

const prog = (n: number) => { let p = emptyProgress(); for (let i = 1; i <= n; i++) p = markDone(p, i); return p; };
const P = (s = 0, z = 0, t = 0, p = 0) => ({ sudoku: prog(s), zip: prog(z), tango: prog(t), patches: prog(p) });

describe("conquistas", () => {
  it("ids únicos e todas as categorias/raridades preenchidas", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
  });
  it("nada é desbloqueado sem jogar", () => {
    expect(evaluate({ log: emptyLog(), progress: P() }, {}, 1).fresh).toHaveLength(0);
  });
  it("primeira vitória desbloqueia as conquistas iniciais", () => {
    const log = addMatch(emptyLog(), mk({ id: "1", ms: 50_000, hints: 0 }));
    const ids = evaluate({ log, progress: P(1) }, {}, 5).fresh.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(["primeiro-cronometro", "primeiros-passos", "velocidade-mental", "sudoku-primeiro", "sem-dicas"]));
    expect(ids).not.toContain("mente-relampago"); // nível 1 não vale para Mente Relâmpago
  });
  it("sem duplicidade: avaliar de novo não desbloqueia outra vez e mantém a data", () => {
    const log = addMatch(emptyLog(), mk({ id: "1" }));
    const a = evaluate({ log, progress: P(1) }, {}, 100);
    const b = evaluate({ log, progress: P(1) }, a.unlocked, 200);
    expect(b.fresh).toHaveLength(0);
    expect(b.unlocked["primeiro-cronometro"]).toBe(100);
  });
  it("progresso parcial: Mestre das Jornadas 32/50", () => {
    const a = ACH_BY_ID.get("mestre-jornadas")!;
    expect(progressOf(a, { log: emptyLog(), progress: P(20, 12) }, {})).toEqual({ value: 32, frac: 32 / 50 });
  });
  it("medalhas de coleção contam as outras medalhas (sem contar a si mesmas)", () => {
    let log: PlayerLog = emptyLog();
    for (let i = 1; i <= 30; i++) log = addMatch(log, mk({ id: String(i), game: (["sudoku", "zip", "tango", "patches"] as const)[i % 4], level: i, ms: 20_000, record: true, at: i * 1000 }));
    const r = evaluate({ log, progress: P(30, 30, 30, 30) }, {}, 1);
    const normal = r.fresh.filter((a) => !a.meta).length;
    expect(normal).toBeGreaterThanOrEqual(10);
    expect(r.unlocked["colecionador"]).toBe(1);
  });
  it("lê conquistas salvas ignorando ids desconhecidos", () => {
    expect(parseUnlocked(JSON.stringify({ "primeiro-cronometro": 5, inventada: 3 }))).toEqual({ "primeiro-cronometro": 5 });
    expect(parseUnlocked("x")).toBeNull();
  });
});
