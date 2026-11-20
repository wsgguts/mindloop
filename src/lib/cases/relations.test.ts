import { describe, expect, it } from "vitest";
import { allCases } from "./catalog";
import { CASES_DATA } from "./data";
import { allowedCells, blockedCells, objectsOf, peopleOf, rcOf, sideNeighbors } from "./model";
import { roomRun } from "../../components/cases/CaseBoard";
import { MARK_NO, MARK_YES, autoMarks, cellsOfClue, clueTarget, decodeMark, encodeMark, focusOf, markKey, marksFrom, marksTo, nextMark, suggestions, validMark } from "./relations";

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

  it("tocar numa pista acende a grade que ela afeta, na fileira de quem ela fala", () => {
    for (const c of allCases()) c.clues.forEach((k, i) => {
      const t = clueTarget(c.model, c.dims, k)!;
      expect(t.d, `${c.id} pista ${i + 1}`).toBe(c.clueDims[i]);
      expect(peopleOf(c.model, k), c.id).toContain(t.s);
      expect(focusOf(c.model, c.clues, { t: "clue", i }, c.dims).grid, c.id).toEqual(t);
      if (!("a" in k)) expect(t.vs.length, `${c.id} pista ${i + 1}: valores citados`).toBeGreaterThan(0);
    });
  });

  it("quadro de decisões: anotações por grade (✕ ou ✓) vão e voltam do rascunho; versões antigas são descartadas", () => {
    for (const c of allCases()) {
      const m = c.model, n = m.people.length;
      c.dims.forEach((dim, d) => {
        const v = dim.values.length - 1;
        for (const st of [MARK_NO, MARK_YES]) {
          expect(decodeMark(encodeMark(d, n - 1, v, st))).toEqual({ d, s: n - 1, v, state: st });
          expect(validMark(m, c.dims, encodeMark(d, n - 1, v, st))).toBe(true);
        }
        expect(validMark(m, c.dims, encodeMark(d, n, 0, MARK_NO))).toBe(false);
        expect(validMark(m, c.dims, encodeMark(d, 0, dim.values.length, MARK_NO))).toBe(false);
      });
      expect(validMark(m, c.dims, encodeMark(c.dims.length, 0, 0, MARK_YES))).toBe(false);
      for (const old of [0, 5, 100000, 400017, 600009, 500017]) expect(validMark(m, c.dims, old)).toBe(false);
      const marks = new Map([[markKey(0, 0, 0), MARK_YES], [markKey(c.dims.length - 1, n - 1, 1), MARK_NO]]);
      expect(marksFrom(m, c.dims, marksTo(marks))).toEqual(marks);
    }
  });

  it("cada toque numa célula: vazio → ✕ → ✓ → vazio", () => {
    expect([nextMark(undefined), nextMark(MARK_NO), nextMark(MARK_YES)]).toEqual([MARK_NO, MARK_YES, undefined]);
  });

  it("ajuda automática: um ✓ risca o resto da fileira e (valor de uma pessoa só) o resto da coluna", () => {
    const c = allCases().find((x) => x.id === "sudoku-33")!;
    const marks = new Map([[markKey(0, 2, 0), MARK_YES]]); // Neve ✓ linha 1
    const auto = autoMarks(c.dims, marks, 4);
    expect([...auto].sort()).toEqual([markKey(0, 0, 0), markKey(0, 1, 0), markKey(0, 2, 1), markKey(0, 2, 2), markKey(0, 2, 3), markKey(0, 3, 0)].sort());
    // Tango: lado com as 2 pessoas que cabem nele fecha o lado para os outros.
    const t = allCases().find((x) => x.model.rule === "equilibrio")!;
    const side = t.dims.findIndex((d) => d.id === "side");
    const a2 = autoMarks(t.dims, new Map([[markKey(side, 0, 0), MARK_YES], [markKey(side, 1, 0), MARK_YES]]), 4);
    expect(a2.has(markKey(side, 2, 0)) && a2.has(markKey(side, 3, 0))).toBe(true);
  });

  it("linha + coluna com ✓ sugerem a casa no tabuleiro (sem preencher a resposta)", () => {
    const c = allCases().find((x) => x.id === "sudoku-33")!;
    // Neve: linha 1 e coluna C → casa C1 (2).
    expect(suggestions(c.model, c.dims, new Map([[markKey(0, 2, 0), MARK_YES], [markKey(1, 2, 2), MARK_YES]]))).toEqual(new Map([[2, 2]]));
    expect(suggestions(c.model, c.dims, new Map([[markKey(0, 2, 0), MARK_YES]])).size).toBe(0);
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

  it("cada jogo raciocina com a sua mecânica: ordem só no Zip, Cristal/Orbe só no Tango, tamanho só no Patches", () => {
    const kinds = (rule: string) => new Set(CASES_DATA.filter((c) => c.model.rule === rule).flatMap((c) => c.clues.map((k) => k.k)));
    for (const r of ["regioes", "equilibrio", "comodos", "ceu"]) for (const k of ["next", "stop", "notStop", "stopAfter", "stopBefore"]) expect(kinds(r).has(k as never), `${r}: ${k}`).toBe(false);
    for (const r of ["regioes", "trilha", "comodos", "ceu"]) for (const k of ["side", "sameSide", "oppSide"]) expect(kinds(r).has(k as never), `${r}: ${k}`).toBe(false);
    for (const r of ["regioes", "equilibrio", "trilha", "ceu"]) expect(kinds(r).has("size"), `${r}: size`).toBe(false);
    expect(["next", "stopAfter", "stopBefore"].some((k) => kinds("trilha").has(k as never))).toBe(true);
    expect(["sameSide", "oppSide"].some((k) => kinds("equilibrio").has(k as never))).toBe(true);
    expect(kinds("comodos").has("size")).toBe(true);
  });

  it("relações entre duas pessoas só aparecem depois que a primeira já foi descoberta", () => {
    for (const c of allCases()) c.clues.forEach((k, i) => {
      if (!("a" in k)) return;
      const before = c.trace.filter((st) => st.clue < i).flatMap((st) => st.concl);
      expect(before.some((x) => x.s === k.a && x.d === c.clueDims[i]), `${c.id} pista ${i + 1}`).toBe(true);
    });
  });
  it("o nome do cômodo só se estende sobre casas seguidas do MESMO cômodo, na mesma linha", () => {
    for (const c of CASES_DATA) {
      const m = c.model;
      m.scene.rooms.forEach((_, k) => {
        const v = m.scene.room.indexOf(k), span = roomRun(m, v), [r, col] = rcOf(m, v);
        expect(col + span, c.id).toBeLessThanOrEqual(m.cols);
        for (let i = 0; i < span; i++) { expect(m.scene.room[v + i], c.id).toBe(k); expect(rcOf(m, v + i)[0], c.id).toBe(r); }
        if (col + span < m.cols) expect(m.scene.room[v + span], c.id).not.toBe(k);
      });
    }
  });
});
