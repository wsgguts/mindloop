import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_GAMES } from "./games";
import { BLOCK_PARTS, BLOCK_WORDS } from "./nick";
import { gameScore, levelScore, minMs, overallScore, refMs } from "./scoring";

const MIG = join(__dirname, "../../supabase/migrations");
const sql = readdirSync(MIG).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(join(MIG, f), "utf8")).join("\n");

describe("pontuação normalizada", () => {
  it("o banco usa exatamente os tempos de referência e mínimos do app (500 níveis: 4 principais + Astros)", () => {
    const rows = [...sql.matchAll(/\('(\w+)',(\d+),(\d+),(\d+)\)/g)];
    expect(rows).toHaveLength(500);
    expect(rows.filter((r) => r[1] === "astros")).toHaveLength(100);
    for (const [, g, l, ref, min] of rows) {
      expect(Number(ref), `${g} ${l}`).toBe(refMs(g as never, Number(l)));
      expect(Number(min), `${g} ${l}`).toBe(minMs(g as never, Number(l)));
    }
  });
  it("o banco usa a mesma lista de palavras bloqueadas no apelido", () => {
    for (const w of [...BLOCK_PARTS, ...BLOCK_WORDS]) expect(sql).toContain(`'${w}'`);
  });
  it("pontos: 100×peso a 200×peso por nível, crescem com a dificuldade e com a velocidade, com teto na referência", () => {
    expect(levelScore("sudoku", 1, refMs("sudoku", 1))).toBe(200);
    expect(levelScore("sudoku", 1, refMs("sudoku", 1) * 2)).toBe(150);
    expect(levelScore("sudoku", 1, 1000)).toBe(200); // mais rápido que a referência não passa do teto
    expect(levelScore("zip", 100, refMs("zip", 100))).toBe(600);
    expect(levelScore("tango", 50, 10 ** 9)).toBeGreaterThanOrEqual(100 * (1 + 2 * 49 / 99) - 1);
  });
  it("todos os jogos têm o mesmo máximo (ranking geral justo)", () => {
    const max = ALL_GAMES.map((g) => gameScore(g, Object.fromEntries(Array.from({ length: 100 }, (_, i) => [i + 1, 1]))));
    expect(new Set(max).size).toBe(1);
    expect(max[0]).toBe(40000);
  });
  it("Astros no ranking: o banco aceita o jogo, só de quem completou as 4 jornadas, sem mudar os outros jogos", () => {
    const mig = readFileSync(join(MIG, "20261116000100_astros_ranking.sql"), "utf8");
    expect(mig).toContain("check (game in ('sudoku', 'zip', 'tango', 'patches', 'astros'))");
    expect(mig).toContain("if p_game not in ('sudoku', 'zip', 'tango', 'patches', 'astros') then raise exception 'BAD_GAME'");
    expect(mig).toMatch(/p_game = 'astros' and \(select count\(distinct game\) from public\.results\s+where player_id = p_id and level = 100 and game in \('sudoku', 'zip', 'tango', 'patches'\)\) < 4/);
    expect(mig).not.toMatch(/(drop table|delete from|truncate|drop policy|create policy)/i); // só acrescenta
    // Mesmo teto de pontos que os outros jogos (ranking geral justo).
    const max = (g: "astros" | "sudoku") => gameScore(g, Object.fromEntries(Array.from({ length: 100 }, (_, i) => [i + 1, 1])));
    expect(max("astros")).toBe(max("sudoku"));
  });
  it("tempo de referência maior para grades maiores e níveis mais difíceis", () => {
    for (const g of ALL_GAMES) expect(refMs(g, 100)).toBeGreaterThan(refMs(g, 1));
  });
  it("ranking geral: soma com bônus de 5% por jogo extra", () => {
    expect(overallScore([1000, 0, 0, 0])).toBe(1000);
    expect(overallScore([1000, 1000, 0, 0])).toBe(2100);
    expect(overallScore([1000, 1000, 1000, 1000])).toBe(4600);
    expect(overallScore([0, 0, 0, 0])).toBe(0);
  });
});
