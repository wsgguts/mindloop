// Mindloop Investigação — configuração (frequência, dificuldade e recompensas). Ajuste aqui.
// Depois de mudar CASE_PATTERNS ou TIERS, gere o banco de novo:  npx vite-node scripts/gen_cases.ts
// (os testes conferem que o banco segue esta agenda.)

import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, type JourneyGame } from "../journey";

/**
 * Duas investigações por capítulo, no mundo daquele capítulo (20 por jogo): uma no começo e outra no fim do capítulo.
 * Em que fases os convites aparecem varia entre capítulos e entre jogos, para o ritmo não ficar previsível.
 */
export const CASE_OFFSETS: [number, number][] = [[3, 7], [2, 6], [4, 8], [3, 7], [2, 8], [4, 7], [3, 6], [2, 7], [4, 8], [3, 8]];
const GAME_SHIFT: Record<JourneyGame, number> = { sudoku: 0, tango: 1, zip: 2, patches: 3, astros: 4 };

/** Fases (1–99) após as quais o jogo oferece uma investigação. A fase 100 não tem "próxima": nunca oferece. */
export function caseLevels(game: JourneyGame): number[] {
  const chapters = LEVELS_PER_GAME / LEVELS_PER_CHAPTER;
  return Array.from({ length: chapters }, (_, ch) => CASE_OFFSETS[(ch + GAME_SHIFT[game]) % CASE_OFFSETS.length].map((o) => ch * LEVELS_PER_CHAPTER + o)).flat();
}

/** Dificuldade 1–4 pelo capítulo: os mistérios crescem junto com a jornada. */
export type Difficulty = 1 | 2 | 3 | 4;
export const difficultyOf = (chapter: number): Difficulty => (chapter <= 2 ? 1 : chapter <= 5 ? 2 : chapter <= 8 ? 3 : 4);
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado", 4: "Mestre" };
/** Tempo estimado (minutos) mostrado no convite. Os mistérios são curtos de propósito: uma pausa, não uma tarefa. */
export const ESTIMATE: Record<Difficulty, [number, number]> = { 1: [3, 5], 2: [4, 7], 3: [6, 9], 4: [7, 12] };

// ---- Recompensas ----
/** Pontos de experiência (XP) pela primeira solução de cada mistério. */
export const BASE_XP: Record<Difficulty, number> = { 1: 80, 2: 120, 3: 160, 4: 220 };
/** Cada dica usada tira 20% do XP (no mínimo 40% do valor ficam). Pular nunca tira nada. */
export const HINT_PENALTY = 0.2;
export const MIN_XP_SHARE = 0.4;
export const MAX_HINTS = 3;

export function xpFor(d: Difficulty, hints: number): number {
  return Math.round(BASE_XP[d] * Math.max(MIN_XP_SHARE, 1 - HINT_PENALTY * Math.min(hints, MAX_HINTS)));
}

/** Medalha do mistério pelas dicas usadas: ouro sem nenhuma, prata com 1, bronze com 2 ou 3. */
export type CaseMedal = "ouro" | "prata" | "bronze";
export const medalFor = (hints: number): CaseMedal => (hints === 0 ? "ouro" : hints === 1 ? "prata" : "bronze");
export const MEDAL_LABEL: Record<CaseMedal, string> = { ouro: "Lupa de Ouro", prata: "Lupa de Prata", bronze: "Lupa de Bronze" };
