// Mindloop Investigação — catálogo: transforma cada registro do banco (data.ts) num mistério completo, com
// título, história, cenário, pistas em texto, resposta, explicação passo a passo, 3 dicas progressivas,
// dificuldade, recompensa e tempo estimado. Para acrescentar mistérios basta gerar o banco de novo
// (scripts/gen_cases.ts): nada aqui precisa mudar.

import type { JourneyGame } from "../journey";
import { sceneArt, sceneOf } from "../scenes";
import { BASE_XP, DIFFICULTY_LABEL, type Difficulty, ESTIMATE } from "./config";
import { CASES_DATA } from "./data";
import type { CaseData } from "./generate";
import { type CaseKind, type Clue, type Model, type Step, clueText, deduce, evalClue, involved, isRule, stepText, the } from "./model";
import { GENERAL_HINT, KIND_OF, THEMES, WORLD_IN } from "./themes";

export interface Case {
  id: string;
  game: JourneyGame;
  kind: CaseKind;
  /** Jornada (capítulo) e fase de referência: o convite aparece ao continuar depois desta fase. */
  chapter: number;
  level: number;
  title: string;
  /** Chamada curta do convite. */
  description: string;
  story: string;
  goal: string;
  /** Cenário: o mundo do capítulo (nome e pintura). */
  world: string;
  art: string;
  model: Model;
  /** Regras fixas do tipo de caso (Tango: equilíbrio; Zip: estradas). */
  rules: Clue[];
  /** Pistas numeradas, na ordem em que aparecem. */
  clues: Clue[];
  ruleTexts: string[];
  clueTexts: string[];
  answer: number[];
  /** Explicação lógica da solução, passo a passo. */
  explanation: string[];
  hints: [string, string, string];
  difficulty: Difficulty;
  difficultyLabel: string;
  /** Minutos estimados [mín, máx]. */
  estimate: [number, number];
  /** XP pela primeira solução sem dicas (dicas reduzem; veja config.ts). */
  xp: number;
}

const TEASER: Record<CaseKind, string> = {
  code: "Um segredo numérico precisa ser desvendado. Analise as pistas, use sua lógica e descubra a combinação.",
  pattern: "Algo quebrou o equilíbrio da fila. Analise as pistas, use sua lógica e devolva cada símbolo ao seu lugar.",
  route: "Um caminho misterioso foi percorrido. Analise as pistas, use sua lógica e reconstrua a rota.",
  layout: "Tudo saiu do lugar. Analise as pistas, use sua lógica e descubra onde cada peça fica.",
};

/** Escolhe a dedução que as dicas 2 e 3 vão revelar: a primeira que usa uma relação entre pistas (não uma pista direta). */
function keyStep(d: CaseData, steps: Step[]): Step | undefined {
  const rel = (st: Step) => typeof st.by === "number" && !isRule(d.clues[st.by]) && involved(d.model, d.clues[st.by]).length > 1;
  return steps.find(rel) ?? steps.find((st) => typeof st.by === "number" && d.clues[st.by].k !== "is") ?? steps[0];
}

export function buildCase(d: CaseData): Case {
  const kind = KIND_OF[d.game];
  const theme = THEMES[kind][d.theme];
  const scene = sceneOf(d.chapter);
  const n = d.model.slots.length;
  // Numeração mostrada ao jogador: só as pistas (as regras ficam à parte, sem número).
  const numbered = d.clues.map((c, i) => ({ c, i })).filter((x) => !isRule(x.c));
  const label = (i: number) => (isRule(d.clues[i]) ? "regra do caso" : `pista ${numbered.findIndex((x) => x.i === i) + 1}`);
  const ded = deduce(d.model, d.clues);
  const key = keyStep(d, ded.steps);
  const keyClues = key ? [...new Set([...(key.uses ?? []), ...(typeof key.by === "number" ? [key.by] : [])])].filter((i) => !isRule(d.clues[i])) : [];
  const slot = key ? the(d.model.slots[key.s]) : "";
  const hint2 = !key ? GENERAL_HINT[kind]
    : keyClues.length >= 2 ? `Compare a ${label(keyClues[0])} com a ${label(keyClues[1])}: juntas, elas revelam algo importante sobre ${slot}.`
    : keyClues.length === 1 ? `A ${label(keyClues[0])} é a chave para descobrir ${slot}. Veja quais opções ela deixa de fora${d.clues.some(isRule) ? ", junto com as regras do caso" : ""}.`
    : `Observe as regras do caso com atenção: sozinhas, elas já dizem algo sobre ${slot}.`;
  return {
    id: d.id, game: d.game, kind, chapter: d.chapter, level: d.level,
    title: theme.title,
    description: TEASER[kind],
    story: theme.intro(WORLD_IN[d.chapter - 1], n),
    goal: theme.goal,
    world: scene.name, art: sceneArt(scene),
    model: d.model,
    rules: d.clues.filter(isRule),
    clues: numbered.map((x) => x.c),
    ruleTexts: d.clues.filter(isRule).map((c) => clueText(d.model, c)),
    clueTexts: numbered.map((x) => clueText(d.model, x.c)),
    answer: d.sol,
    explanation: ded.steps.map((st) => stepText(d.model, st, label)),
    hints: [GENERAL_HINT[kind], hint2, key ? stepText(d.model, key, label) : GENERAL_HINT[kind]],
    difficulty: d.difficulty,
    difficultyLabel: DIFFICULTY_LABEL[d.difficulty],
    estimate: ESTIMATE[d.difficulty],
    xp: BASE_XP[d.difficulty],
  };
}

// Montados uma vez, sob demanda (o banco é pequeno: ~135 mistérios).
let cache: Case[] | null = null;
export function allCases(): Case[] { return (cache ??= CASES_DATA.map(buildCase)); }
export const caseById = (id: string): Case | undefined => allCases().find((c) => c.id === id);
/** Mistérios de um jogo, na ordem da jornada (cada jogo só mostra os seus). */
export const casesOf = (game: JourneyGame): Case[] => allCases().filter((c) => c.game === game);
/** Mistério oferecido ao continuar depois desta fase (ou nenhum). */
export const caseAfter = (game: JourneyGame, level: number): Case | undefined => allCases().find((c) => c.game === game && c.level === level);

/**
 * O que o "Continuar" da tela de parabéns abre depois da fase `level`:
 * o convite de investigação (fase agendada, mistério nem resolvido nem pulado) ou direto a próxima fase.
 * A próxima fase é SEMPRE a mesma (nextIdx = level): investigar ou pular nunca muda a jornada.
 */
export function afterContinue(game: JourneyGame, level: number, offer: (id: string) => boolean): { nextIdx: number; case?: Case } {
  const c = caseAfter(game, level);
  return c && offer(c.id) ? { nextIdx: level, case: c } : { nextIdx: level };
}

/**
 * A resposta está certa? Confere a resposta contra TODAS as regras e pistas (e "sem repetir") — e, como os testes
 * provam que só existe uma resposta assim para cada mistério, ela é exatamente a solução guardada.
 */
export function isCorrect(c: Case, a: number[]): boolean {
  const m = c.model;
  if (a.length !== m.slots.length || a.some((v) => !Number.isInteger(v) || v < 0 || v >= m.values.length)) return false;
  if (m.distinct && new Set(a).size !== a.length) return false;
  return [...c.rules, ...c.clues].every((k) => evalClue(m, k, a));
}

/** Primeira pista (índice em c.clues) ou regra (-1 − índice) que a resposta contraria; null se nenhuma. */
export function firstBroken(c: Case, a: number[]): number | null {
  const r = c.rules.findIndex((k) => !evalClue(c.model, k, a));
  if (r >= 0) return -1 - r;
  const i = c.clues.findIndex((k) => !evalClue(c.model, k, a));
  return i >= 0 ? i : null;
}
