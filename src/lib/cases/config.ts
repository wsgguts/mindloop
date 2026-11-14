// Mindloop Investigação — configuração (frequência, dificuldade e recompensas). Ajuste aqui.
// Depois de mudar CASE_PATTERNS ou TIERS, gere o banco de novo:  npx vite-node scripts/gen_cases.ts
// (os testes conferem que o banco segue esta agenda.)

import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, type JourneyGame } from "../journey";

/**
 * Depois de quais fases de cada capítulo (1–10) aparece o convite para investigar.
 * Os padrões se alternam entre capítulos e entre jogos, então o ritmo varia (a cada 2 ou 3 fases, às vezes 4)
 * sem ficar previsível. Nunca há duas investigações seguidas: sempre existe ao menos uma fase entre elas.
 */
export const CASE_PATTERNS: number[][] = [
  [2, 5, 8],
  [3, 6, 9],
  [2, 4, 7, 10],
  [3, 5, 8],
  [2, 5, 7, 9],
];
const GAME_SHIFT: Record<JourneyGame, number> = { sudoku: 0, tango: 1, zip: 2, patches: 3, astros: 4 };

/** Fases (1–99) após as quais o jogo oferece uma investigação. A fase 100 não tem "próxima": nunca oferece. */
export function caseLevels(game: JourneyGame): number[] {
  const out: number[] = [];
  const chapters = LEVELS_PER_GAME / LEVELS_PER_CHAPTER;
  for (let ch = 0; ch < chapters; ch++) {
    const p = CASE_PATTERNS[(ch + GAME_SHIFT[game]) % CASE_PATTERNS.length];
    for (const k of p) { const level = ch * LEVELS_PER_CHAPTER + k; if (level < LEVELS_PER_GAME) out.push(level); }
  }
  return out;
}

/** Dificuldade 1–4 pelo capítulo: os mistérios crescem junto com a jornada. */
export type Difficulty = 1 | 2 | 3 | 4;
export const difficultyOf = (chapter: number): Difficulty => (chapter <= 2 ? 1 : chapter <= 5 ? 2 : chapter <= 8 ? 3 : 4);
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado", 4: "Mestre" };
/** Tempo estimado (minutos) mostrado no convite. Os mistérios são curtos de propósito: uma pausa, não uma tarefa. */
export const ESTIMATE: Record<Difficulty, [number, number]> = { 1: [2, 3], 2: [3, 4], 3: [3, 5], 4: [4, 6] };

// ---- Recompensas ----
/** Pontos de experiência (XP) pela primeira solução de cada mistério. */
export const BASE_XP: Record<Difficulty, number> = { 1: 50, 2: 75, 3: 100, 4: 150 };
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
