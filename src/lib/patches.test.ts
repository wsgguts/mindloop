import { describe, expect, it } from "vitest";
import {
  PATCHES_EXAMPLE, PATCHES_PUZZLES, countPatchesSolutions, encodePatches, findProblems, isPatchesSolved, nextDeduction,
  fitsKind, kindOf, parsePatches, pieceProblem, rectFrom, shapesOf, solveLogically, type PatchesBoard, type Rect,
} from "./patches";

const boards = PATCHES_PUZZLES.map((p) => parsePatches(p.raw));

describe("patches: níveis", () => {
  it("existem 100 níveis, todos com solução única", () => {
    expect(PATCHES_PUZZLES).toHaveLength(100);
    boards.forEach((b, i) => expect(countPatchesSolutions(b, 2), `nível ${i + 1}`).toBe(1));
  }, 120000);
  it("todos se resolvem só com lógica (o mesmo raciocínio das dicas)", () => {
    boards.forEach((b, i) => {
      const res = solveLogically(b);
      expect(res.pieces, `nível ${i + 1}`).not.toBeNull();
      expect(isPatchesSolved(b, res.pieces!), `nível ${i + 1}`).toBe(true);
    });
  });
  it("os números somam exatamente o tamanho da grade", () => {
    boards.forEach((b, i) => expect(b.clues.reduce((s, k) => s + k.v, 0), `nível ${i + 1}`).toBe(b.n * b.n));
  });
  it("só os capítulos 8 e 10 trazem níveis que pedem “casas reservadas”", () => {
    const needsReserve = (i: number) => solveLogically(boards[i], [], false).pieces === null;
    for (let i = 0; i < 100; i++) {
      const ch = Math.floor(i / 10) + 1;
      if (ch !== 8 && ch !== 10) expect(needsReserve(i), `nível ${i + 1}`).toBe(false);
    }
    for (const ch of [8, 10]) expect(Array.from({ length: 10 }, (_, k) => needsReserve((ch - 1) * 10 + k)).filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });
  it("a grade nunca diminui ao longo da jornada (5×5 → 9×9)", () => {
    for (let i = 1; i < boards.length; i++) expect(boards[i].n).toBeGreaterThanOrEqual(boards[i - 1].n);
    expect(boards[0].n).toBe(5);
    expect(boards[99].n).toBe(9);
  });
  it("o formato dos níveis é lido e regravado sem perda", () => {
    PATCHES_PUZZLES.forEach((p, i) => expect(encodePatches(boards[i])).toBe(p.raw));
  });
  it("o exemplo das regras tem solução única e é a mostrada", () => {
    const b: PatchesBoard = { n: 4, clues: PATCHES_EXAMPLE.clues.map(([r, c, v, kind]) => ({ r, c, v, kind })) };
    // A grade do exemplo tem 3 linhas × 4 colunas: completa a 4ª linha com uma peça fixa de 4 casas para usar o solucionador quadrado.
    b.clues.push({ r: 3, c: 0, v: 4, kind: "h" });
    expect(countPatchesSolutions(b, 2)).toBe(1);
    const pieces: Rect[] = [...PATCHES_EXAMPLE.pieces.map(([r, c, h, w]) => ({ r, c, h, w })), { r: 3, c: 0, h: 1, w: 4 }];
    expect(isPatchesSolved(b, pieces)).toBe(true);
  });
});

describe("patches: regras", () => {
  const b = parsePatches("3|2....34..");
  // 2 . .
  // . . 3
  // 4 . .
  it("acusa peça sem número, com dois números ou com tamanho errado", () => {
    expect(pieceProblem(b, rectFrom([1, 0], [1, 1]))?.kind).toBe("vazia");
    expect(pieceProblem(b, rectFrom([0, 0], [1, 2]))?.kind).toBe("varios");
    expect(pieceProblem(b, rectFrom([1, 2], [2, 2]))?.kind).toBe("tamanho");
    expect(pieceProblem(b, rectFrom([0, 0], [0, 1]))).toBeNull();
  });
  it("só vence com a grade toda coberta e todas as peças certas", () => {
    const sol = solveLogically(b).pieces!;
    expect(isPatchesSolved(b, sol)).toBe(true);
    expect(isPatchesSolved(b, sol.slice(1))).toBe(false);
    expect(findProblems(b, sol)).toEqual([]);
  });
  it("lista só encaixes com área certa, dentro da grade e sem outro número", () => {
    const k = b.clues.find((x) => x.v === 3)!;
    for (const q of shapesOf(b, k)) {
      expect(q.h * q.w).toBe(3);
      expect(q.r >= 0 && q.c >= 0 && q.r + q.h <= 3 && q.c + q.w <= 3).toBe(true);
    }
  });
});

describe("patches: formato das peças (etiqueta do número)", () => {
  it("a etiqueta de cada número combina com a peça da solução", () => {
    boards.forEach((b, i) => {
      const sol = solveLogically(b).pieces!;
      b.clues.forEach((k, j) => expect(fitsKind(k.kind, sol[j]), `nível ${i + 1}, número ${j + 1}`).toBe(true));
    });
  });
  it("capítulos 1 e 2 mostram o formato de todos os números; os últimos escondem a maioria", () => {
    const shown = (ch: number) => {
      const bs = boards.slice((ch - 1) * 10, ch * 10);
      return bs.reduce((s, b) => s + b.clues.filter((k) => k.kind !== "a").length, 0) / bs.reduce((s, b) => s + b.clues.length, 0);
    };
    expect(shown(1)).toBe(1);
    expect(shown(2)).toBe(1);
    expect(shown(10)).toBeLessThan(shown(3));
    expect(shown(10)).toBeLessThanOrEqual(0.5);
  });
  it("classifica quadrada, em pé e deitada", () => {
    expect(kindOf({ r: 0, c: 0, h: 2, w: 2 })).toBe("q");
    expect(kindOf({ r: 0, c: 0, h: 3, w: 1 })).toBe("v");
    expect(kindOf({ r: 0, c: 0, h: 2, w: 3 })).toBe("h");
    expect(fitsKind("a", { r: 0, c: 0, h: 1, w: 5 })).toBe(true);
  });
  it("acusa peça com o formato errado e só lista encaixes do formato pedido", () => {
    const b = parsePatches("3|2....34..|hva");
    // 2 (deitada) . .  /  . . 3 (em pé)  /  4 (qualquer) . .
    expect(pieceProblem(b, rectFrom([0, 0], [1, 0]))?.kind).toBe("formato");
    expect(pieceProblem(b, rectFrom([0, 0], [0, 1]))).toBeNull();
    expect(shapesOf(b, b.clues[1]).every((q) => q.h > q.w)).toBe(true);
  });
});

describe("patches: dicas", () => {
  it("a dica sempre aponta um encaixe da solução, e seguir as dicas resolve o nível", () => {
    for (const i of [0, 25, 55, 79, 99]) {
      const board = boards[i];
      const sol = solveLogically(board).pieces!;
      const fixed: (Rect | null)[] = board.clues.map(() => null);
      for (let step = 0; step < board.clues.length; step++) {
        const d = nextDeduction(board, fixed);
        expect(d, `nível ${i + 1}, passo ${step + 1}`).not.toBeNull();
        expect(sol[d!.clue]).toEqual(d!.rect);
        fixed[d!.clue] = d!.rect;
      }
      expect(nextDeduction(board, fixed)).toBeNull();
    }
  });
  it("explica a dica com o motivo certo (casa usada só por um número)", () => {
    const reasons = new Set(boards.flatMap((b) => solveLogically(b).steps.map((s) => s.reason)));
    expect(reasons).toEqual(new Set(["unico", "casa", "reserva"]));
  });
});
