import { describe, expect, it } from "vitest";
import {
  ASTROS_PUZZLES, EMPTY, MARK, STAR, cloneA, countSolutions, emptyGrid, findProblems, isAstrosSolved, logicSteps,
  nextHint, parseAstros, solutionGrid, starsOf, type AGrid,
} from "./astros";
import { ALL_GAMES, BONUS_GAME, EVERY_GAME, bonusUnlocked, visibleGames } from "./games";
import { LEVELS_PER_GAME, emptyProgress, type JourneyGame } from "./journey";
import { refMs } from "./scoring";
import { ACHIEVEMENTS, evaluate } from "./achievements";
import { emptyLog } from "./history";

const boards = ASTROS_PUZZLES.map((p) => parseAstros(p.raw));

describe("Astros: os 100 céus", () => {
  it("são 100, com tamanhos 5×5 a 9×9 (20 de cada, crescendo pelos capítulos)", () => {
    expect(ASTROS_PUZZLES).toHaveLength(LEVELS_PER_GAME);
    boards.forEach((b, i) => expect(b.n, `nível ${i + 1}`).toBe(5 + Math.floor(i / 20)));
  });

  it("cada céu tem n constelações, todas conectadas", () => {
    for (const [i, b] of boards.entries()) {
      const ids = new Set(b.regions.flat());
      expect(ids.size, `nível ${i + 1}`).toBe(b.n);
      for (const k of ids) {
        const cells = b.regions.flatMap((row, r) => row.flatMap((v, c) => (v === k ? [[r, c]] : [])));
        const seen = new Set([cells[0].join()]);
        const stack = [cells[0]];
        while (stack.length) {
          const [r, c] = stack.pop()!;
          for (const [y, x] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
            if (b.regions[y]?.[x] === k && !seen.has(`${y},${x}`)) { seen.add(`${y},${x}`); stack.push([y, x]); }
          }
        }
        expect(seen.size, `nível ${i + 1}, constelação ${k}`).toBe(cells.length);
      }
    }
  });

  it("todos têm solução única e se resolvem só com lógica (sem chute)", () => {
    for (const [i, b] of boards.entries()) {
      expect(countSolutions(b), `nível ${i + 1}`).toBe(1);
      const L = logicSteps(b);
      expect(L.solved, `nível ${i + 1}`).toBe(true);
    }
  });

  it("a dificuldade cresce: os últimos níveis de cada tamanho pedem raciocínio mais elaborado que os primeiros", () => {
    for (let s = 0; s < 5; s++) {
      const first = logicSteps(boards[s * 20]).tier, last = logicSteps(boards[s * 20 + 19]).tier;
      expect(last, `tamanho ${5 + s}`).toBeGreaterThan(first);
    }
    expect(logicSteps(boards[0]).tier).toBe(1); // o nível 1 só pede "casa única"
  });

  it("não há céus repetidos", () => {
    expect(new Set(ASTROS_PUZZLES.map((p) => p.raw)).size).toBe(100);
  });

  it("tempo de referência cresce com a grade", () => {
    expect(refMs("astros", 100)).toBeGreaterThan(refMs("astros", 1));
  });
});

describe("Astros: regras", () => {
  const b = boards[0];
  const sol = solutionGrid(b)!;

  it("a solução completa é aceita", () => {
    expect(isAstrosSolved(sol, b)).toBe(true);
    expect(findProblems(sol, b)).toEqual([]);
  });

  it("marcas × nunca são erro, e a grade só vence com os n astros", () => {
    const g = sol.map((row) => row.map((v) => (v === STAR ? EMPTY : MARK)));
    expect(findProblems(g, b)).toEqual([]);
    expect(isAstrosSolved(g, b)).toBe(false);
  });

  it("aponta astros na mesma linha, coluna, constelação e encostados", () => {
    const g = emptyGrid(5);
    g[0][0] = STAR; g[0][3] = STAR;
    expect(findProblems(g, b).map((p) => p.kind)).toContain("linha");
    const h = emptyGrid(5);
    h[0][0] = STAR; h[3][0] = STAR;
    expect(findProblems(h, b).map((p) => p.kind)).toContain("coluna");
    const d = emptyGrid(5);
    d[1][1] = STAR; d[2][2] = STAR;
    expect(findProblems(d, b).map((p) => p.kind)).toContain("vizinhos");
    const k = b.regions[0][0];
    const other = b.regions.flatMap((row, r) => row.flatMap((v, c) => (v === k && (r > 1 || c > 1) ? [[r, c]] : [])))[0];
    if (other) {
      const e = emptyGrid(5);
      e[0][0] = STAR; e[other[0]][other[1]] = STAR;
      expect(findProblems(e, b).map((p) => p.kind)).toContain("constelacao");
    }
  });
});

describe("Astros: a Dica sempre leva à solução", () => {
  it("seguindo só as dicas, cada céu se completa (sem passo errado)", () => {
    for (const [i, b] of boards.entries()) {
      const sol = solutionGrid(b)!;
      let g: AGrid = emptyGrid(b.n);
      for (let k = 0; k < 4 * b.n * b.n && !isAstrosSolved(g, b); k++) {
        const s = nextHint(b, g);
        expect(s, `nível ${i + 1}: a dica travou`).not.toBeNull();
        g = cloneA(g);
        for (const [r, c] of s!.cells) {
          if (s!.kind === "star") { expect(sol[r][c], `nível ${i + 1}: dica de astro errada`).toBe(STAR); g[r][c] = STAR; }
          else { expect(sol[r][c], `nível ${i + 1}: dica de × num astro`).not.toBe(STAR); g[r][c] = MARK; }
        }
      }
      expect(isAstrosSolved(g, b), `nível ${i + 1}`).toBe(true);
      expect(starsOf(g)).toHaveLength(b.n);
    }
  });
});

describe("jogo bônus", () => {
  const prog = (n: number) => "1".repeat(n) + "0".repeat(LEVELS_PER_GAME - n);
  const P = (main: number, bonus = 0) => Object.fromEntries(EVERY_GAME.map((g) => [g, g === BONUS_GAME ? prog(bonus) : prog(main)])) as Record<JourneyGame, string>;

  it("o Astros fica fora da lista dos 4 jogos principais", () => {
    expect(ALL_GAMES).not.toContain(BONUS_GAME);
    expect(EVERY_GAME).toEqual([...ALL_GAMES, BONUS_GAME]);
  });

  it("só libera com as 4 jornadas principais completas", () => {
    expect(bonusUnlocked(P(0))).toBe(false);
    expect(bonusUnlocked(P(99))).toBe(false);
    const almost = { ...P(100), patches: prog(99) };
    expect(bonusUnlocked(almost)).toBe(false);
    expect(bonusUnlocked(P(100))).toBe(true);
    expect(visibleGames(false)).toEqual(ALL_GAMES);
    expect(visibleGames(true)).toContain(BONUS_GAME);
  });

  it("conquistas do bônus: por jogo, investigação e as exclusivas", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    for (const id of ["astros-primeiro", "astros-mestre", "inv-astros", "astros-ceu-nove", "astros-completo", "lenda-absoluta"]) expect(ids).toContain(id);
    const ev = evaluate({ log: emptyLog(), progress: P(100, 100) }, {}, 1);
    const got = ev.fresh.map((a) => a.id);
    expect(got).toContain("quatro-jornadas");
    expect(got).toContain("astros-completo");
    expect(got).toContain("lenda-absoluta");
    // Sem o bônus, as 4 jornadas completas não dão as medalhas do Astros.
    const only = evaluate({ log: emptyLog(), progress: P(100, 0) }, {}, 1).fresh.map((a) => a.id);
    expect(only).toContain("quatro-jornadas");
    expect(only).not.toContain("astros-completo");
    expect(only).not.toContain("lenda-absoluta");
  });

  it("o progresso vazio do bônus é um progresso normal de 100 níveis", () => {
    expect(emptyProgress()).toHaveLength(LEVELS_PER_GAME);
  });
});
