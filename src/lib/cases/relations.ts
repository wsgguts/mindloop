// Mindloop Investigação — ligações entre pistas, personagens, objetos, casas e o quadro de decisões (funções puras).
// Usado pela tela da investigação: tocar numa pista acende quem e o que ela cita, as casas do tabuleiro e as
// células da grade que ela afeta. Tudo sai das pistas estruturadas (nunca do texto), então o destaque nunca mente.

import type { Dim } from "./grids";
import { clueDim } from "./grids";
import { type Clue, type Model, objectsOf, peopleOf, rcOf, roomOf, roomSize, stopOf, units } from "./model";

/** Casas do cenário que uma pista cita: a linha, a coluna, o cômodo, o lado, as paradas… */
export function cellsOfClue(m: Model, c: Clue): number[] {
  const all = Array.from({ length: m.rows * m.cols }, (_, v) => v);
  switch (c.k) {
    case "row": case "notRow": case "side": return all.filter((v) => rcOf(m, v)[0] === c.r);
    case "col": case "notCol": return all.filter((v) => rcOf(m, v)[1] === c.c);
    case "room": case "notRoom": return all.filter((v) => roomOf(m, v) === c.r);
    case "stop": case "notStop": return all.filter((v) => stopOf(m, v) === c.n);
    case "stopAfter": return all.filter((v) => stopOf(m, v) > c.n);
    case "stopBefore": return all.filter((v) => stopOf(m, v) >= 0 && stopOf(m, v) < c.n);
    case "size": return all.filter((v) => roomSize(m, roomOf(m, v)) === c.n);
    default: return [];
  }
}

/** Onde a pista cai no quadro de decisões: a grade, a fileira (personagem) e as colunas (valores) citadas. */
export function clueTarget(m: Model, dims: Dim[], c: Clue): { d: number; s: number; vs: number[] } | null {
  if (c.k === "rule") return null;
  const d = clueDim(m, c, dims);
  const s = "s" in c ? c.s : c.b;
  const dim = dims[d];
  if (c.k === "has" || c.k === "hasNot") return { d, s, vs: [c.o] };
  if ("a" in c) return { d, s, vs: [] };
  if (dim.of) {
    // Os valores da grade que as casas citadas pela pista ocupam (ex.: no Zip, "no Patamar" → as paradas dele).
    const cells = new Set(cellsOfClue(m, c));
    const vs = [...new Set(units(m).filter((u) => cells.has(u) || (m.rule === "comodos" && cellsOfClue(m, c).some((w) => roomOf(m, w) === roomOf(m, u)))).map(dim.of))];
    return { d, s, vs: vs.sort((a, b) => a - b) };
  }
  return { d, s, vs: [] };
}

/** O que acender na tela para a seleção atual. */
export interface Focus { people: Set<number>; objects: Set<number>; cells: Set<number>; clues: Set<number>; grid: { d: number; s: number; vs: number[] } | null }
export type Pick = { t: "person"; i: number } | { t: "object"; i: number } | { t: "clue"; i: number } | null;

export function focusOf(m: Model, clues: Clue[], pick: Pick, dims?: Dim[]): Focus {
  const f: Focus = { people: new Set(), objects: new Set(), cells: new Set(), clues: new Set(), grid: null };
  if (!pick) return f;
  const add = (k: number) => { f.clues.add(k); peopleOf(m, clues[k]).forEach((x) => f.people.add(x)); objectsOf(clues[k]).forEach((x) => f.objects.add(x)); cellsOfClue(m, clues[k]).forEach((x) => f.cells.add(x)); };
  if (pick.t === "clue") { add(pick.i); if (dims) f.grid = clueTarget(m, dims, clues[pick.i]); return f; }
  clues.forEach((c, k) => {
    const hit = pick.t === "person" ? peopleOf(m, c).includes(pick.i) : objectsOf(c).includes(pick.i);
    if (hit) add(k);
  });
  if (pick.t === "person") f.people.add(pick.i); else f.objects.add(pick.i);
  return f;
}

// ---------------------------------------------------------------- quadro de decisões (anotações)

/**
 * O quadro de decisões tem uma grade por tipo de informação (grids.ts): personagens nas fileiras, valores nas colunas.
 * Cada célula alterna vazio → ✗ → ✓ → vazio. Anotações da pessoa: nunca contam como resposta.
 * Guardadas no rascunho como números: NOTE_DIM + ((grade × 8 + personagem) × 32 + valor) × 4 + estado (1 = ✗, 2 = ✓).
 * Números de versões antigas (o mapa "Onde?" e a tabela "O quê?") ficam fora dessa faixa e são descartados.
 */
export const NOTE_DIM = 800000;
export const MARK_NO = 1, MARK_YES = 2;
/** Anotações: chave "grade|personagem|valor" → ✗ (1) ou ✓ (2). */
export type Marks = Map<string, number>;
export const markKey = (d: number, s: number, v: number) => `${d}|${s}|${v}`;
export const parseKey = (k: string) => k.split("|").map(Number) as [number, number, number];
export const encodeMark = (d: number, s: number, v: number, state: number) => NOTE_DIM + ((d * 8 + s) * 32 + v) * 4 + state;
export function decodeMark(k: number): { d: number; s: number; v: number; state: number } | null {
  if (k < NOTE_DIM || k >= NOTE_DIM + 8 * 8 * 32 * 4) return null;
  const r = k - NOTE_DIM, state = r % 4, i = Math.floor(r / 4);
  return { d: Math.floor(i / 256), s: Math.floor(i / 32) % 8, v: i % 32, state };
}
/** Uma anotação guardada ainda faz sentido neste caso? */
export function validMark(m: Model, dims: Dim[], k: number): boolean {
  const x = decodeMark(k);
  return !!x && x.d < dims.length && x.s < m.people.length && x.v < dims[x.d].values.length && (x.state === MARK_NO || x.state === MARK_YES);
}
export function marksFrom(m: Model, dims: Dim[], keys: number[]): Marks {
  const out: Marks = new Map();
  for (const k of keys) if (validMark(m, dims, k)) { const x = decodeMark(k)!; out.set(markKey(x.d, x.s, x.v), x.state); }
  return out;
}
export const marksTo = (marks: Marks): number[] => [...marks].map(([k, st]) => { const [d, s, v] = parseKey(k); return encodeMark(d, s, v, st); });
/** Próximo estado de uma célula: vazio → ✗ → ✓ → vazio. */
export const nextMark = (cur: number | undefined): number | undefined => (cur === undefined ? MARK_NO : cur === MARK_NO ? MARK_YES : undefined);

/**
 * "Ajuda automática": os ✗ óbvios que cada ✓ da pessoa já garante na MESMA grade — o resto da fileira daquele
 * personagem e, quando o valor é de uma pessoa só, o resto da coluna. No Tango, um lado com as pessoas que cabem
 * nele já marcadas fecha o lado para os outros. Desenhados em cor mais clara (não são marcações da pessoa).
 */
export function autoMarks(dims: Dim[], marks: Marks, n: number): Set<string> {
  const out = new Set<string>();
  dims.forEach((dim, d) => {
    for (let s = 0; s < n; s++) for (let v = 0; v < dim.values.length; v++) {
      if (marks.get(markKey(d, s, v)) !== MARK_YES) continue;
      for (let w = 0; w < dim.values.length; w++) if (w !== v) out.add(markKey(d, s, w));
      if (dim.cap === 1) for (let t = 0; t < n; t++) if (t !== s) out.add(markKey(d, t, v));
    }
    if (dim.cap > 1) for (let v = 0; v < dim.values.length; v++) {
      const yes = Array.from({ length: n }, (_, s) => s).filter((s) => marks.get(markKey(d, s, v)) === MARK_YES);
      if (yes.length >= dim.cap) for (let t = 0; t < n; t++) if (!yes.includes(t)) out.add(markKey(d, t, v));
    }
  });
  for (const k of [...out]) if (marks.has(k)) out.delete(k); // o que a pessoa marcou vale mais
  return out;
}

/**
 * Sugestão no tabuleiro: quando os ✓ de lugar de alguém (linha + coluna, lado + coluna, parada, cômodo…) apontam
 * uma única casa, ela é destacada — sem preencher a resposta.
 */
export function suggestions(m: Model, dims: Dim[], marks: Marks): Map<number, number> {
  const out = new Map<number, number>();
  const n = m.people.length;
  for (let s = 0; s < n; s++) {
    let cands = units(m), any = false;
    dims.forEach((dim, d) => {
      if (!dim.of) return;
      const v = dim.values.findIndex((_, w) => marks.get(markKey(d, s, w)) === MARK_YES);
      if (v >= 0) { any = true; cands = cands.filter((u) => dim.of!(u) === v); }
    });
    if (any && cands.length === 1) out.set(cands[0], s);
  }
  return out;
}
