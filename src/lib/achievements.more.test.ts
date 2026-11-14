// Conquistas de esforço maior, alto desempenho, jornadas completas e investigação (estruturas, XP, elite).
import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, ACH_BY_ID, CATEGORIES, evaluate } from "./achievements";
import { CASES_DATA } from "./cases/data";
import { emptyCaseLog, recordSolve } from "./cases/progress";
import { ALL_GAMES } from "./games";
import { addMatch, emptyLog, type PlayerLog } from "./history";
import { mk } from "./history.test";
import { emptyProgress, markDone } from "./journey";

const prog = (n: number) => { let p = emptyProgress(); for (let i = 1; i <= n; i++) p = markDone(p, i); return p; };
const P = (s = 0, z = 0, t = 0, p = 0, a = 0) => ({ sudoku: prog(s), zip: prog(z), tango: prog(t), patches: prog(p), astros: prog(a) });
const fresh = (ctx: Parameters<typeof evaluate>[0]) => evaluate(ctx, {}, 1).fresh.map((a) => a.id);

describe("cobertura das conquistas", () => {
  it("todas as categorias têm conquistas de várias raridades, incluindo diamante para esforço maior", () => {
    for (const cat of CATEGORIES) {
      const xs = ACHIEVEMENTS.filter((a) => a.category === cat);
      expect(xs.length, cat).toBeGreaterThanOrEqual(5);
      expect(new Set(xs.map((a) => a.rarity)).size, cat).toBeGreaterThanOrEqual(3);
    }
    for (const cat of ["tempo", "jornada", "constancia", "investigacao", "especial"] as const)
      expect(ACHIEVEMENTS.some((a) => a.category === cat && a.rarity === "diamante"), cat).toBe(true);
  });

  it("os ids antigos continuam existindo (conquistas já salvas no aparelho não se perdem)", () => {
    for (const id of ["primeiro-cronometro", "mestre-velocidade", "lenda-mindloop", "jornada-completa", "inv-primeira-pista", "inv-mestre", "inv-sudoku", "colecionador", "galeria-lendaria", "sem-dicas", "maratona-mental"])
      expect(ACH_BY_ID.has(id), id).toBe(true);
  });

  it("nenhuma conquista nova sai sem jogar", () => {
    expect(evaluate({ log: emptyLog(), progress: P(), cases: emptyCaseLog() }, {}, 1).fresh).toHaveLength(0);
  });
});

describe("jornadas e esforço maior", () => {
  it("Explorador Versátil pede o 1º capítulo das 4 jornadas; Senhor dos Quatro Mundos pede tudo", () => {
    expect(fresh({ log: emptyLog(), progress: P(10, 10, 10, 9) })).not.toContain("explorador-versatil");
    expect(fresh({ log: emptyLog(), progress: P(10, 10, 10, 10) })).toContain("explorador-versatil");
    expect(fresh({ log: emptyLog(), progress: P(50, 50, 50, 50) })).toContain("meio-caminho");
    const almost = fresh({ log: emptyLog(), progress: P(100, 100, 100, 99) });
    expect(almost).toContain("jornada-completa");
    expect(almost).not.toContain("quatro-jornadas");
    expect(fresh({ log: emptyLog(), progress: P(100, 100, 100, 100) })).toContain("quatro-jornadas");
  });

  it("Inabalável (20 seguidas) e Hábito de Mestre (30 dias)", () => {
    let log: PlayerLog = emptyLog();
    for (let d = 0; d < 30; d++) log = addMatch(log, mk({ id: `d${d}`, at: Date.UTC(2026, 0, 1 + d, 12), level: 1 + d }));
    const ids = fresh({ log, progress: P() });
    expect(ids).toContain("habito-de-mestre");
    expect(ids).toContain("inabalavel");
    expect(fresh({ log: { ...log, bestStreak: 19 }, progress: P() })).not.toContain("inabalavel");
  });
});

describe("alto desempenho", () => {
  it("Mente Independente: 25 fases DIFERENTES do nível 21 em diante, sem dicas (repetir a mesma não vale)", () => {
    let same: PlayerLog = emptyLog();
    for (let i = 0; i < 30; i++) same = addMatch(same, mk({ id: `s${i}`, level: 30, hints: 0, at: i * 1000 }));
    expect(fresh({ log: same, progress: P() })).not.toContain("mente-independente");
    let many: PlayerLog = emptyLog();
    for (let i = 0; i < 25; i++) many = addMatch(many, mk({ id: `m${i}`, level: 21 + i, hints: 0, at: i * 1000 }));
    expect(fresh({ log: many, progress: P() })).toContain("mente-independente");
    let easy: PlayerLog = emptyLog();
    for (let i = 0; i < 25; i++) easy = addMatch(easy, mk({ id: `e${i}`, level: 1 + (i % 20), game: ALL_GAMES[i % 4], hints: 0, at: i * 1000 }));
    expect(fresh({ log: easy, progress: P() })).not.toContain("mente-independente");
  });

  it("Desafio Final: nível 91+ dentro do tempo de referência", () => {
    const fast = addMatch(emptyLog(), mk({ level: 95, ms: 1000 }));
    const slow = addMatch(emptyLog(), mk({ level: 95, ms: 60 * 60_000 }));
    const early = addMatch(emptyLog(), mk({ level: 80, ms: 1000 }));
    expect(fresh({ log: fast, progress: P() })).toContain("desafio-final");
    expect(fresh({ log: slow, progress: P() })).not.toContain("desafio-final");
    expect(fresh({ log: early, progress: P() })).not.toContain("desafio-final");
  });
});

describe("investigação", () => {
  const solveAll = (ids: string[], hints = 0, ms = 90_000) => {
    let log = emptyCaseLog();
    ids.forEach((id, i) => { const d = CASES_DATA.find((c) => c.id === id)!; log = recordSolve(log, d, ms, hints, 1000 + i).log; });
    return log;
  };

  it("Raciocínio Versátil: 8 estruturas diferentes (8 casos da mesma estrutura não bastam)", () => {
    const byStructure = new Map<string, string>();
    for (const c of CASES_DATA) if (!byStructure.has(c.structure)) byStructure.set(c.structure, c.id);
    const eight = [...byStructure.values()].slice(0, 8);
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(eight) })).toContain("inv-raciocinio-versatil");
    const s0 = CASES_DATA[0].structure;
    const same = CASES_DATA.filter((c) => c.structure === s0).slice(0, 8).map((c) => c.id);
    expect(same.length).toBe(8);
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(same) })).not.toContain("inv-raciocinio-versatil");
  });

  it("Detetive de Elite: 5 mistérios Mestre sem dica; com dica não conta", () => {
    const mestre = CASES_DATA.filter((c) => c.difficulty === 4).slice(0, 5).map((c) => c.id);
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(mestre, 0) })).toContain("inv-elite");
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(mestre, 1) })).not.toContain("inv-elite");
    const easy = CASES_DATA.filter((c) => c.difficulty === 1).slice(0, 5).map((c) => c.id);
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(easy, 0) })).not.toContain("inv-elite");
  });

  it("Lupa Relâmpago só vale para mistérios Avançado/Mestre", () => {
    const hard = CASES_DATA.find((c) => c.difficulty === 3)!.id, easy = CASES_DATA.find((c) => c.difficulty === 1)!.id;
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll([hard], 0, 100_000) })).toContain("inv-lupa-relampago");
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll([easy], 0, 30_000) })).not.toContain("inv-lupa-relampago");
  });

  it("Detetive Completo, XP, Caderno Completo e Nenhum Mistério Sem Solução", () => {
    const oneEach = ALL_GAMES.map((g) => CASES_DATA.find((c) => c.game === g)!.id);
    expect(fresh({ log: emptyLog(), progress: P(), cases: solveAll(oneEach) })).toContain("inv-quatro-jogos");
    const sudoku = CASES_DATA.filter((c) => c.game === "sudoku").map((c) => c.id);
    const book = fresh({ log: emptyLog(), progress: P(), cases: solveAll(sudoku) });
    expect(book).toContain("inv-caderno-completo");
    expect(book).toContain("inv-xp-1000");
    expect(book).not.toContain("inv-todos");
    const all = fresh({ log: emptyLog(), progress: P(), cases: solveAll(CASES_DATA.map((c) => c.id)) });
    expect(all).toContain("inv-todos");
    expect(all).toContain("inv-xp-5000");
  });
});
