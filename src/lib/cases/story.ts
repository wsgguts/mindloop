// Mindloop Investigação — formato de uma história.
// Cada jogo tem 10 investigações, uma por capítulo, e cada uma acontece no MUNDO daquele capítulo (capítulo 1 =
// Reino Celestial, 2 = Floresta dos Cristais… 10 = Trono do Infinito). A história traz o seu próprio lugar:
// os cômodos, os móveis (que bloqueiam casas) e os assentos (casas que podem ser ocupadas e citadas nas pistas).
// O que se descobre é sempre o mesmo par: ONDE cada personagem estava e QUE OBJETO tinha nas mãos.
// A história não repete as regras do jogo (elas aparecem à parte, na tela da investigação).

import type { Ent } from "./model";

/** Universo narrativo (usado para garantir variedade entre casos vizinhos). */
export type Universe =
  | "arqueologia" | "laboratorio" | "museu" | "competicao" | "vilarejo" | "oficina" | "exploracao" | "natureza"
  | "cotidiano" | "casa" | "historia" | "tesouro" | "astronomia" | "musica" | "culinaria" | "mar" | "jardim"
  | "teatro" | "transporte" | "biblioteca" | "festa" | "clima" | "esporte" | "circo" | "correio" | "fazenda"
  | "magia" | "escola" | "aventura" | "arte" | "construcao";

/** Tom da história. */
export type Tone = "misterio" | "aventura" | "humor" | "curiosidade" | "encanto" | "suspense";

export interface Story {
  /** Identificador estável (gravado no banco). */
  key: string;
  title: string;
  universe: Universe;
  tone: Tone;
  /** Contexto: 2–3 frases curtas, sem regras do jogo (contado pelo narrador do jogo). */
  intro: string;
  /** A pergunta do caso. */
  goal: string;
  /** Desfecho mostrado ao resolver. Pode citar quem tinha cada objeto: {com:Nome do Objeto} → "a Ana". */
  ending: string;
  /** Objetos (4; um por personagem). */
  objects: Ent[];
  /** O lugar: cômodos (4), móveis que bloqueiam (3) e assentos (2). No Tango, os 2 primeiros cômodos são os lados. */
  rooms: Ent[];
  blocks: Ent[];
  seats: Ent[];
}
