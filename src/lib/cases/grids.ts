// Mindloop Investigação — as GRADES do quadro de decisões (estilo "enigma de Einstein").
// Cada grade cruza os personagens (fileiras) com um tipo de informação (colunas). Toda pista afeta UMA grade e vira
// marcações diretas nela (✓ ou ✗). Cada jogo tem as grades da sua mecânica:
//   Mini Sudoku → Linha, Coluna, Cômodo, Objeto      (uma pessoa por linha, coluna e cômodo)
//   Astros      → Linha, Coluna, Região, Objeto      (uma pessoa por linha, coluna e região)
//   Tango       → Lado (Cristal/Orbe), Coluna, Objeto (metade de cada lado, uma por coluna)
//   Zip         → Parada, Objeto                      (cada um numa parada da trilha)
//   Patches     → Cômodo (com o tamanho), Objeto      (uma pessoa por cômodo)

import { type Clue, type Model, COLS, SIDE_NAMES, rcOf, roomOf, roomSize, stopOf } from "./model";

export type DimId = "row" | "col" | "room" | "side" | "stop" | "obj";
export interface DimValue { label: string; short: string }
export interface Dim {
  id: DimId;
  /** Nome da grade (aba) e ícone da etiqueta das pistas. */
  title: string;
  icon: string;
  values: DimValue[];
  /** Valor de uma casa nesta grade (não existe na grade de objetos). */
  of?: (v: number) => number;
  /** Quantas pessoas cabem em cada valor (1 na maioria; no Tango, metade das pessoas em cada lado). */
  cap: number;
  /** Cada valor é usado exatamente `cap` vezes (então "só sobrou uma pessoa para este valor" vale). */
  exact: boolean;
}

export function gridsOf(m: Model): Dim[] {
  const n = m.people.length;
  const row: Dim = { id: "row", title: "Linha", icon: "↔️", values: Array.from({ length: m.rows }, (_, r) => ({ label: `Linha ${r + 1}`, short: String(r + 1) })), of: (v) => rcOf(m, v)[0], cap: 1, exact: m.rows === n };
  const col: Dim = { id: "col", title: "Coluna", icon: "↕️", values: Array.from({ length: m.cols }, (_, c) => ({ label: `Coluna ${COLS[c]}`, short: COLS[c] })), of: (v) => rcOf(m, v)[1], cap: 1, exact: m.cols === n };
  const rooms = (title: string, sized: boolean): Dim => ({
    id: "room", title, icon: m.rule === "ceu" ? "✨" : "🏛️",
    values: m.scene.rooms.map((r, k) => ({ label: sized ? `${r.label} (${roomSize(m, k)} casas)` : r.label, short: r.label })),
    of: (v) => roomOf(m, v), cap: 1, exact: m.scene.rooms.length === n,
  });
  const obj: Dim = { id: "obj", title: "Objeto", icon: "🎁", values: m.objects.map((o) => ({ label: o.label, short: o.short ?? o.label })), cap: 1, exact: true };
  switch (m.rule) {
    case "regioes": return [row, col, rooms("Cômodo", false), obj];
    case "ceu": return [row, col, rooms("Região", false), obj];
    case "comodos": return [rooms("Cômodo", true), obj];
    case "equilibrio": return [
      { id: "side", title: "Lado", icon: "💠", values: SIDE_NAMES.map((s) => ({ label: `Lado do ${s}`, short: s })), of: (v) => rcOf(m, v)[0], cap: n / 2, exact: true },
      col, obj,
    ];
    case "trilha": return [
      { id: "stop", title: "Parada", icon: "🔢", values: m.trail!.map((_, k) => ({ label: `Parada ${k + 1}`, short: String(k + 1) })), of: (v) => stopOf(m, v), cap: 1, exact: m.trail!.length === n },
      obj,
    ];
  }
}

/** A grade que uma pista afeta (índice em gridsOf). */
export function clueDim(m: Model, c: Clue, dims = gridsOf(m)): number {
  const id: DimId = c.k === "has" || c.k === "hasNot" ? "obj"
    : c.k === "row" || c.k === "notRow" ? "row"
    : c.k === "col" || c.k === "notCol" ? "col"
    : c.k === "side" || c.k === "sameSide" || c.k === "oppSide" ? "side"
    : c.k === "stop" || c.k === "notStop" || c.k === "stopAfter" || c.k === "stopBefore" || c.k === "next" ? "stop"
    : m.rule === "trilha" ? "stop" // no Zip, "estava no Patamar X" marca as paradas daquele trecho
    : "room";
  return dims.findIndex((d) => d.id === id);
}
