// Mindloop Investigação — "quem conta" cada pista (fácil de editar).
// As pistas são escritas como depoimentos ou achados: "O vigia jura que a Mel estava na coluna A."
// Toda pista é VERDADE: use só fontes firmes (nada de "ouvi dizer" ou "talvez"), para ninguém duvidar dela.
// Cada caso sorteia vozes diferentes para as suas pistas (sem repetir), de forma determinística pelo id do caso.
// Casos escritos à mão (authored.ts) trazem o texto pronto e não usam esta lista.

import type { ClueKind } from "./model";

/** Depoimentos e achados sobre ONDE alguém estava (ou não estava). */
export const PLACE_VOICES = [
  "Uma testemunha jura que",
  "Pegadas no chão mostram que",
  "Um bilhete encontrado diz que",
  "O guarda da noite garante que",
  "Uma foto tirada na hora mostra que",
  "O caderno de anotações registra que",
  "Um vizinho curioso conta que",
  "A câmera da entrada flagrou que",
  "Um recado deixado na porta avisa que",
  "Quem passava por ali viu que",
];

/** Depoimentos e achados sobre O QUE alguém segurava (ou não). */
export const OBJECT_VOICES = [
  "Uma testemunha viu que",
  "Marcas nas mãos revelam que",
  "Um desenho feito na hora mostra que",
  "O inventário do lugar registra que",
  "Uma testemunha confirma que",
  "Uma foto da noite mostra que",
];

/** Pistas de ordem (Zip) e de símbolo (Tango). */
export const ORDER_VOICES = [
  "O registro da trilha mostra que",
  "As marcas do caminho mostram que",
  "Quem contou as passadas garante que",
];
export const SIDE_VOICES = [
  "O placar do equilíbrio mostra que",
  "Quem anotou os símbolos garante que",
  "A pedra dos símbolos brilha mostrando que",
];

export function voicesFor(k: ClueKind): string[] {
  if (k === "has" || k === "hasNot") return OBJECT_VOICES;
  if (k === "next" || k === "stopAfter" || k === "stopBefore") return ORDER_VOICES;
  if (k === "sameSide" || k === "oppSide" || k === "side") return SIDE_VOICES;
  return PLACE_VOICES;
}
