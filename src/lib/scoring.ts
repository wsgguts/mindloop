// Pontuação normalizada do MindLoop (ranking e estatísticas).
// Cada jogo tem regras e tamanhos de grade diferentes, então o tempo bruto nunca é comparado entre jogos:
// cada nível tem um TEMPO DE REFERÊNCIA próprio e os pontos dependem da dificuldade do nível e de quão
// perto (ou abaixo) desse tempo a pessoa chegou. O servidor do ranking (supabase/migrations) usa a MESMA
// tabela e a MESMA fórmula; o teste scoring.test.ts confere que as duas não se separam.
//
//   peso(nível)      = 1 + 2 × (nível − 1) / 99                      → 1,00 (nível 1) … 3,00 (nível 100)
//   ritmo            = min(1, referência / tempo)                    → 1 quando terminou dentro da referência
//   pontos(nível)    = round(peso × (100 + 100 × ritmo))             → 100×peso a 200×peso (100 a 600 por nível)
//   pontos do jogo   = soma dos pontos dos níveis concluídos (melhor tempo de cada nível; repetir não soma de novo)
//   ranking geral    = soma dos jogos × (1 + 0,05 × (jogos com pelo menos 1 nível − 1))   (bônus de consistência)
//
// Máximo por jogo: 40 000 pontos (200 × soma dos pesos, que é 200) — igual para os quatro jogos, o que torna o ranking geral justo.

import { SUDOKU_RAW } from "./data/sudokuLevels";
import { ZIP_RAW } from "./data/zipLevels";
import { TANGO_RAW } from "./data/tangoLevels";
import { PATCHES_RAW } from "./data/patchesLevels";
import { ASTROS_RAW } from "./data/astrosLevels";
import type { JourneyGame } from "./journey";

/** Lado da grade de cada nível, lido dos próprios dados dos níveis. */
const SIDE: Record<JourneyGame, number[]> = {
  sudoku: SUDOKU_RAW.map((r) => r.split("/").length),
  zip: ZIP_RAW.map((r) => r.split("/").length),
  tango: TANGO_RAW.map((r) => Number(r.split("|")[0])),
  patches: PATCHES_RAW.map((r) => Number(r.split("|")[0])),
  astros: ASTROS_RAW.map((r) => Number(r.split("|")[0])),
};

/** Segundos de referência por casa da grade, conforme a natureza de cada jogo. */
export const SECONDS_PER_CELL: Record<JourneyGame, number> = { sudoku: 3, zip: 2, tango: 2.5, patches: 2, astros: 2 };

export const cellsOf = (game: JourneyGame, level: number): number => SIDE[game][level - 1] ** 2;

/** Tempo de referência (ms): casas × segundos por casa × (1 + nível/100), arredondado a 5 s. */
export function refMs(game: JourneyGame, level: number): number {
  const s = cellsOf(game, level) * SECONDS_PER_CELL[game] * (1 + level / 100);
  return Math.round(s / 5) * 5 * 1000;
}

/** Menor tempo aceito pelo ranking (abaixo disso o resultado é tratado como inválido). */
export function minMs(game: JourneyGame, level: number): number {
  return Math.max(2500, cellsOf(game, level) * 150);
}

export const levelWeight = (level: number): number => 1 + (2 * (level - 1)) / 99;

/** Ritmo: 1 = dentro do tempo de referência; 0,5 = levou o dobro. */
export const pace = (game: JourneyGame, level: number, ms: number): number => Math.min(1, refMs(game, level) / Math.max(1, ms));

export function levelScore(game: JourneyGame, level: number, ms: number): number {
  return Math.round(levelWeight(level) * (100 + 100 * pace(game, level, ms)));
}

/** Pontos de um jogo a partir dos melhores tempos por nível. */
export function gameScore(game: JourneyGame, times: Record<number, number>): number {
  let total = 0;
  for (const [k, ms] of Object.entries(times)) total += levelScore(game, Number(k), ms);
  return total;
}

export const CONSISTENCY_BONUS = 0.05;

/** Ranking geral: soma dos jogos com bônus de 5% por jogo extra jogado. */
export function overallScore(perGame: number[]): number {
  const played = perGame.filter((s) => s > 0).length;
  const sum = perGame.reduce((a, b) => a + b, 0);
  return Math.round(sum * (1 + CONSISTENCY_BONUS * Math.max(0, played - 1)));
}

/** Faixas de dificuldade usadas no ranking por jogo. */
export type Band = "all" | "easy" | "mid" | "hard";
export const BANDS: { id: Band; label: string; from: number; to: number }[] = [
  { id: "all", label: "Todos os níveis", from: 1, to: 100 },
  { id: "easy", label: "Iniciante (1–30)", from: 1, to: 30 },
  { id: "mid", label: "Intermediário (31–70)", from: 31, to: 70 },
  { id: "hard", label: "Avançado (71–100)", from: 71, to: 100 },
];
