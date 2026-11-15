// Mindloop Investigação — relações entre pistas, personagens, objetos e casas do cenário.
// Usado pela tela da investigação para destacar o que está ligado ao que a pessoa selecionou (um personagem acende
// as pistas que falam dele; uma pista acende as pessoas, objetos e casas que ela cita). Tudo sai das pistas
// estruturadas (nunca do texto), então o destaque nunca mente. Funções puras.

import { type Clue, type Model, type PosClue, objectsOf, peopleOf, propAt, rcOf, roomOf, sideNeighbors, stopOf } from "./model";

/** Casas do cenário que uma pista cita: o cômodo, a linha, a parada, o assento, as casas junto de um móvel… */
export function cellsOfClue(m: Model, c: Clue): number[] {
  const p: PosClue | null = c.k === "via" ? c.c : c.k === "has" || c.k === "hasNot" || c.k === "rule" ? null : (c as PosClue);
  if (!p) return [];
  const all = Array.from({ length: m.rows * m.cols }, (_, v) => v);
  switch (p.k) {
    case "at": case "notAt": return [p.v];
    case "room": case "notRoom": return all.filter((v) => roomOf(m, v) === p.r);
    case "eitherRoom": return all.filter((v) => p.r.includes(roomOf(m, v)));
    case "seat": return all.filter((v) => { const x = propAt(m, v); return !!x && !x.block && x.label === p.p; });
    case "by": return all.filter((v) => sideNeighbors(m, v).some((w) => { const x = propAt(m, w); return !!x && x.block && x.label === p.p; }));
    case "row": case "side": return all.filter((v) => rcOf(m, v)[0] === p.r);
    case "col": return all.filter((v) => rcOf(m, v)[1] === p.c);
    case "corner": return all.filter((v) => [0, m.rows - 1].includes(rcOf(m, v)[0]) && [0, m.cols - 1].includes(rcOf(m, v)[1]));
    case "stop": case "notStop": return all.filter((v) => stopOf(m, v) === p.n);
    default: return [];
  }
}

/** O que acender na tela para a seleção atual. */
export interface Focus { people: Set<number>; objects: Set<number>; cells: Set<number>; clues: Set<number> }
export type Pick = { t: "person"; i: number } | { t: "object"; i: number } | { t: "clue"; i: number } | null;

export function focusOf(m: Model, clues: Clue[], pick: Pick): Focus {
  const f: Focus = { people: new Set(), objects: new Set(), cells: new Set(), clues: new Set() };
  if (!pick) return f;
  const add = (k: number) => { f.clues.add(k); peopleOf(m, clues[k]).forEach((x) => f.people.add(x)); objectsOf(clues[k]).forEach((x) => f.objects.add(x)); cellsOfClue(m, clues[k]).forEach((x) => f.cells.add(x)); };
  if (pick.t === "clue") { add(pick.i); return f; }
  clues.forEach((c, k) => {
    const hit = pick.t === "person" ? peopleOf(m, c).includes(pick.i) : objectsOf(c).includes(pick.i);
    if (hit) add(k);
  });
  if (pick.t === "person") f.people.add(pick.i); else f.objects.add(pick.i);
  return f;
}

// ---------------------------------------------------------------- quadro de decisões (anotações)

/**
 * O quadro de decisões tem duas partes (anotações da pessoa; não contam como resposta):
 *   "Onde?"  — um mapa do lugar; cada casa alterna vazio → ✕ (ninguém aqui) → cada personagem → vazio;
 *   "O quê?" — tabela personagens × objetos; cada casa alterna vazio → ✕ (não tinha) → ✓ (tinha) → vazio.
 * Guardadas no rascunho como números:
 *   NOTE_CELL + casa × 16 + (personagem + 1)            (personagem -1 = ✕)
 *   NOTE_GRID + (personagem × 16 + objeto) × 4 + estado  (1 = ✕, 2 = ✓)
 * Números de versões antigas ficam fora dessas faixas e são descartados ao abrir o rascunho.
 */
export const NOTE_CELL = 400000;
export const NOTE_GRID = 600000;
export const GRID_NO = 1, GRID_YES = 2;
export type Notes = Map<number, number>;
export const cellNote = (v: number, who: number) => NOTE_CELL + v * 16 + who + 1;
/** Chave da casa (personagem s, objeto o) na tabela "O quê?". */
export const gridKey = (s: number, o: number) => s * 16 + o;
export const gridNote = (s: number, o: number, state: number) => NOTE_GRID + gridKey(s, o) * 4 + state;
export function readNote(k: number): { t: "cell"; i: number; who: number } | { t: "grid"; i: number; s: number; o: number; state: number } | null {
  if (k >= NOTE_CELL && k < NOTE_CELL + 100000) { const r = k - NOTE_CELL; return { t: "cell", i: Math.floor(r / 16), who: (r % 16) - 1 }; }
  if (k >= NOTE_GRID && k < NOTE_GRID + 100000) { const r = k - NOTE_GRID, i = Math.floor(r / 4); return { t: "grid", i, s: Math.floor(i / 16), o: i % 16, state: r % 4 }; }
  return null;
}
/** Uma anotação guardada ainda faz sentido neste caso? */
export function validMark(m: Model, k: number): boolean {
  const x = readNote(k), n = m.people.length;
  if (!x) return false;
  if (x.t === "cell") return x.who >= -1 && x.who < n && x.i < m.rows * m.cols;
  return x.s < n && x.o < m.objects.length && (x.state === GRID_NO || x.state === GRID_YES);
}
/** "Onde?": próximo estado da casa — vazio → ✕ → cada personagem que ainda não está anotado em outra casa → vazio. */
export function nextNote(notes: Notes, key: number, n: number): number | undefined {
  const cur = notes.get(key);
  if (cur === undefined) return -1;
  const used = new Set([...notes].filter(([k, w]) => k !== key && w >= 0).map(([, w]) => w));
  for (let p = cur + 1; p < n; p++) if (!used.has(p)) return p;
  return undefined;
}
/** "O quê?": próximo estado — vazio → ✕ → ✓ → vazio. */
export const nextGrid = (cur: number | undefined): number | undefined => (cur === undefined ? GRID_NO : cur === GRID_NO ? GRID_YES : undefined);
