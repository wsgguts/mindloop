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

// ---------------------------------------------------------------- marcações X do quadro de dedução

/** Base das marcas de objeto (as de casa usam s × casas + v, sempre menores). */
export const OBJ_MARK = 100000;
/** X em "a pessoa s não estava na casa v". */
export const markKey = (m: Model, s: number, v: number) => s * m.rows * m.cols + v;
/** X em "a pessoa s não tinha o objeto o". */
export const objMarkKey = (m: Model, s: number, o: number) => OBJ_MARK + s * m.objects.length + o;
/** Uma marca guardada ainda faz sentido neste caso? (rascunhos de versões antigas são descartados). */
export const validMark = (m: Model, k: number) => (k >= OBJ_MARK ? k - OBJ_MARK < m.people.length * m.objects.length : k < m.people.length * m.rows * m.cols);
