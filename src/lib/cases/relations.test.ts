import { describe, expect, it } from "vitest";
import { allCases } from "./catalog";
import { CASES_DATA } from "./data";
import { allowedCells, blockedCells, objectsOf, peopleOf, rcOf, sideNeighbors } from "./model";
import { GRID_NO, GRID_YES, cellNote, cellsOfClue, focusOf, gridNote, nextGrid, nextNote, readNote, validMark } from "./relations";

describe("investigação: ligações entre pistas, personagens, objetos e casas", () => {
  it("toda pista cita alguém ou algum objeto, e selecionar a pista acende exatamente isso", () => {
    for (const c of allCases()) c.clues.forEach((k, i) => {
      const ps = peopleOf(c.model, k), os = objectsOf(k);
      expect(ps.length + os.length, `${c.id} pista ${i + 1}`).toBeGreaterThan(0);
      const f = focusOf(c.model, c.clues, { t: "clue", i });
      expect([...f.people].sort(), c.id).toEqual([...new Set(ps)].sort());
      expect([...f.objects].sort(), c.id).toEqual([...new Set(os)].sort());
      expect([...f.cells].sort(), c.id).toEqual([...new Set(cellsOfClue(c.model, k))].sort());
    });
  });

  it("selecionar um personagem ou objeto acende todas as pistas que falam dele", () => {
    for (const c of allCases().slice(0, 15)) {
      c.model.people.forEach((_, i) => {
        const f = focusOf(c.model, c.clues, { t: "person", i });
        c.clues.forEach((k, j) => expect(f.clues.has(j), c.id).toBe(peopleOf(c.model, k).includes(i)));
      });
      c.model.objects.forEach((_, o) => {
        const f = focusOf(c.model, c.clues, { t: "object", i: o });
        c.clues.forEach((k, j) => expect(f.clues.has(j), c.id).toBe(objectsOf(k).includes(o)));
      });
    }
  });

  it("quadro de decisões: anotações de casa (✕ ou personagem) e da tabela (✕ ou ✓); versões antigas são descartadas", () => {
    for (const c of allCases()) {
      const m = c.model, n = m.people.length, V = m.rows * m.cols;
      for (const who of [-1, 0, n - 1]) {
        expect(readNote(cellNote(V - 1, who))).toEqual({ t: "cell", i: V - 1, who });
        expect(validMark(m, cellNote(V - 1, who))).toBe(true);
      }
      for (const st of [GRID_NO, GRID_YES]) {
        expect(readNote(gridNote(n - 1, n - 1, st))).toMatchObject({ t: "grid", s: n - 1, o: n - 1, state: st });
        expect(validMark(m, gridNote(n - 1, n - 1, st))).toBe(true);
      }
      expect(validMark(m, cellNote(V, 0))).toBe(false);
      expect(validMark(m, cellNote(0, n))).toBe(false);
      expect(validMark(m, gridNote(n, 0, GRID_NO))).toBe(false);
      expect(validMark(m, gridNote(0, n, GRID_YES))).toBe(false);
      for (const old of [0, 5, 100000, 100003, 200000, 200007, 500001, 500017]) expect(validMark(m, old)).toBe(false);
    }
  });

  it("tabela O quê?: cada toque alterna vazio → ✕ → ✓ → vazio", () => {
    expect([nextGrid(undefined), nextGrid(GRID_NO), nextGrid(GRID_YES)]).toEqual([GRID_NO, GRID_YES, undefined]);
  });

  it("cada toque: vazio → ✕ → personagens (pulando quem já está anotado em outro espaço) → vazio", () => {
    const notes = new Map<number, number>([[7, 1]]);
    const seq: (number | undefined)[] = [];
    let cur: number | undefined;
    for (let i = 0; i < 5; i++) { const nx = nextNote(cur === undefined ? new Map([...notes]) : new Map([...notes, [3, cur]]), 3, 3); seq.push(nx); cur = nx; if (nx === undefined) break; }
    expect(seq).toEqual([-1, 0, 2, undefined]);
  });
});

describe("cenários: o lugar de cada caso é coerente", () => {
  it("cômodos contínuos, cada um com casa livre; móveis nunca encostam um no outro", () => {
    for (const c of CASES_DATA) {
      const m = c.model, bl = blockedCells(m);
      for (let k = 0; k < m.scene.rooms.length; k++) {
        const cells = m.scene.room.flatMap((r, v) => (r === k ? [v] : []));
        expect(cells.some((v) => !bl.has(v)), `${c.id}: ${m.scene.rooms[k].label} tem casa livre`).toBe(true);
        const seen = new Set([cells[0]]); const stack = [cells[0]];
        while (stack.length) for (const w of sideNeighbors(m, stack.pop()!)) if (m.scene.room[w] === k && !seen.has(w)) { seen.add(w); stack.push(w); }
        expect(seen.size, `${c.id}: ${m.scene.rooms[k].label} contínuo`).toBe(cells.length);
      }
      for (const v of bl) expect(sideNeighbors(m, v).some((w) => bl.has(w)), `${c.id}: móveis encostados`).toBe(false);
    }
  });

  it("a solução nunca fica num móvel nem fora da trilha; cada pessoa tem um objeto diferente", () => {
    for (const c of CASES_DATA) {
      const n = c.model.people.length, ok = new Set(allowedCells(c.model));
      c.sol.slice(0, n).forEach((v) => expect(ok.has(v), c.id).toBe(true));
      expect(new Set(c.sol.slice(n)).size, c.id).toBe(n);
    }
  });

  it("Zip: a trilha é um caminho contínuo de casas vizinhas, sem repetir casa", () => {
    for (const c of CASES_DATA.filter((x) => x.model.rule === "trilha")) {
      const t = c.model.trail!;
      expect(new Set(t).size, c.id).toBe(t.length);
      for (let i = 1; i < t.length; i++) expect(sideNeighbors(c.model, t[i - 1]), c.id).toContain(t[i]);
      expect(t.length, c.id).toBeGreaterThan(c.model.people.length);
    }
  });

  it("Tango: dois lados (as duas linhas), uma pessoa por coluna e metade de cada lado", () => {
    for (const c of CASES_DATA.filter((x) => x.model.rule === "equilibrio")) {
      const m = c.model, n = m.people.length;
      expect(m.rows).toBe(2);
      const pos = c.sol.slice(0, n).map((v) => rcOf(m, v));
      expect(new Set(pos.map(([, col]) => col)).size).toBe(n);
      expect(pos.filter(([r]) => r === 0).length).toBe(n / 2);
    }
  });

  it("Sudoku: uma pessoa por linha, por coluna e por cômodo; Patches: uma por cômodo", () => {
    for (const c of CASES_DATA.filter((x) => x.model.rule === "regioes" || x.model.rule === "comodos")) {
      const m = c.model, n = m.people.length, pos = c.sol.slice(0, n);
      expect(new Set(pos.map((v) => m.scene.room[v])).size, c.id).toBe(m.scene.rooms.length);
      if (m.rule === "regioes") {
        expect(new Set(pos.map((v) => rcOf(m, v)[0])).size, c.id).toBe(n);
        expect(new Set(pos.map((v) => rcOf(m, v)[1])).size, c.id).toBe(n);
      }
    }
  });

  it("cada jogo raciocina diferente: proximidade só no Astros, trilha só no Zip, lados só no Tango", () => {
    const kinds = (rule: string) => new Set(CASES_DATA.filter((c) => c.model.rule === rule).flatMap((c) => c.clues.map((k) => (k.k === "via" ? k.c.k : k.k))));
    for (const r of ["regioes", "equilibrio", "trilha", "comodos"]) for (const k of ["near", "far", "alone", "nearN"]) expect(kinds(r).has(k as never), `${r}: ${k}`).toBe(false);
    for (const r of ["regioes", "equilibrio", "comodos", "ceu"]) for (const k of ["before", "next", "stop", "notStop"]) expect(kinds(r).has(k as never), `${r}: ${k}`).toBe(false);
    for (const r of ["regioes", "trilha", "comodos", "ceu"]) for (const k of ["side", "sameSide", "oppSide"]) expect(kinds(r).has(k as never), `${r}: ${k}`).toBe(false);
    expect(["near", "far", "alone", "nearN"].some((k) => kinds("ceu").has(k as never))).toBe(true);
    expect(["before", "next"].some((k) => kinds("trilha").has(k as never))).toBe(true);
    expect(["side", "sameSide", "oppSide"].some((k) => kinds("equilibrio").has(k as never))).toBe(true);
  });

  it("as pistas cruzadas (“quem tinha o X…”) estão em todos os jogos", () => {
    for (const rule of ["regioes", "equilibrio", "trilha", "comodos", "ceu"]) {
      const cs = CASES_DATA.filter((c) => c.model.rule === rule);
      expect(cs.filter((c) => c.clues.some((k) => k.k === "via")).length, rule).toBeGreaterThanOrEqual(8);
    }
  });
});
