// Mindloop Investigação — formato de uma história. Cada caso do banco tem a SUA história (stories/*.ts), na ordem
// da jornada: título, cenário, personagens/objetos, as palavras das pistas (voz) e o desfecho.
// A história não repete as regras do jogo (elas aparecem à parte, na tela da investigação).

import type { Ent } from "./model";
import type { Voice } from "./voice";

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
  /** Contexto: 2–3 frases curtas, sem regras do jogo. */
  intro: string;
  /** A pergunta do caso. */
  goal: string;
  /** Desfecho mostrado ao resolver (a conclusão da história). */
  ending: string;
  /** Personagens, objetos ou lugares (na ordem: posição na fila/cofre; no mapa e na grade a ordem não importa). */
  slots: Ent[];
  /** Tango: os dois valores possíveis (com ícone). */
  values?: [Ent, Ent];
  voice: Voice;
  /** Mini Sudoku: regra fixa com as palavras da história (substitui a regra da voz). */
  rule?: string;
}
