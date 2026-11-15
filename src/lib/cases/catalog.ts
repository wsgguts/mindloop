// Mindloop Investigação — catálogo: transforma cada registro do banco (data.ts) num mistério completo, com
// título, história (contada pelo narrador do jogo), cenário, pistas em texto, resposta, explicação passo a passo,
// 3 dicas progressivas, estrutura investigativa, desfecho, dificuldade, recompensa e tempo estimado.
// Para acrescentar mistérios basta escrever as histórias (stories/*.ts) e gerar o banco de novo
// (scripts/gen_cases.ts): nada aqui precisa mudar.

import type { JourneyGame } from "../journey";
import { sceneArt, sceneOf } from "../scenes";
import { BASE_XP, DIFFICULTY_LABEL, type Difficulty, ESTIMATE } from "./config";
import { CASES_DATA } from "./data";
import type { CaseData } from "./generate";
import { type CaseKind, type Clue, type Model, type Step, clueText, deduce, evalClue, isRule, peopleOf, ruleNotes, stepText, the } from "./model";
import { STRUCTURES, type StructureId } from "./structures";
import { GENERAL_HINT, NARRATOR, RULE_OF, storyByKey } from "./themes";

export interface Case {
  id: string;
  game: JourneyGame;
  /** A regra do cenário (cada jogo tem a sua). */
  kind: CaseKind;
  /** Jornada (capítulo) e fase de referência: o convite aparece ao continuar depois desta fase. */
  chapter: number;
  level: number;
  title: string;
  /** Chamada curta do convite. */
  description: string;
  story: string;
  goal: string;
  /** Desfecho da história, mostrado ao resolver. */
  ending: string;
  /** Chave da história (stories/*.ts): identifica o conteúdo do caso (rascunhos salvos usam). */
  storyKey: string;
  structure: StructureId;
  structureName: string;
  /** Cenário: o mundo do capítulo (nome e pintura). */
  world: string;
  art: string;
  narrator: { name: string; icon: string; img: string };
  model: Model;
  /** A regra do lugar (sem número). */
  rules: Clue[];
  /** Pistas numeradas, na ordem em que aparecem. */
  clues: Clue[];
  ruleTexts: string[];
  /** Lembretes fixos (★): casas livres, um objeto por pessoa, o que é encostar. */
  notes: string[];
  clueTexts: string[];
  /** Resposta: casa de cada pessoa, depois o objeto de cada pessoa. */
  answer: number[];
  explanation: string[];
  hints: [string, string, string];
  difficulty: Difficulty;
  difficultyLabel: string;
  estimate: [number, number];
  xp: number;
}

/** Chamada do convite: cada regra tem a sua, e a estrutura dá o "tempero". */
const TEASER: Record<CaseKind, string> = {
  regioes: "Cada linha, coluna e cômodo esconde uma pessoa.",
  equilibrio: "Dois lados, um equilíbrio perfeito.",
  trilha: "Uma trilha guarda a ordem dos acontecimentos.",
  comodos: "Um cômodo para cada um — mas qual?",
  ceu: "Ninguém se encosta. A quantos passos cada um estava do outro?",
};
const STRUCTURE_TEASER: Record<StructureId, string> = {
  progressiva: "Uma pista firme abre caminho para as outras.",
  exclusao: "Nada é dito às claras: descubra o que não pode ser.",
  cruzamento: "Lugares e objetos se entrelaçam.",
  cenario: "O próprio lugar guarda as pistas.",
  objetos: "Siga o rastro dos objetos.",
  contradicao: "Uma das possibilidades esconde uma contradição.",
  regioes: "Linhas, colunas e cômodos se fecham um a um.",
  equilibrio: "Os dois lados precisam se equilibrar.",
  sequencia: "Reconstrua o percurso, parada por parada.",
  vizinhanca: "Quem está ao lado de quem?",
  proximidade: "Tudo depende de quem está perto de quem.",
};

/** A dedução que as dicas 2 e 3 vão revelar: a primeira que usa uma pista cruzada ou relação (não uma direta). */
function keyStep(d: CaseData, steps: Step[]): Step | undefined {
  const rich = (st: Step) => typeof st.by === "number" && (d.clues[st.by].k === "via" || peopleOf(d.model, d.clues[st.by]).length > 1);
  return steps.find(rich) ?? steps.find((st) => typeof st.by === "number" && d.clues[st.by].k !== "at" && d.clues[st.by].k !== "has") ?? steps[0];
}

/** Desfecho: {com:Objeto} vira quem tinha aquele objeto ("a Ana"). */
function endingOf(text: string, m: Model, sol: number[]): string {
  const n = m.people.length;
  const t = text.replace(/\{com:([^}]+)\}/g, (_, label: string) => {
    const o = m.objects.findIndex((x) => x.label === label);
    const s = o < 0 ? -1 : sol.slice(n).indexOf(o);
    return s < 0 ? `quem tinha ${label.toLowerCase()}` : the(m.people[s]);
  });
  return t.replace(/(^|[.!?] +)([a-zà-öø-ÿ])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

export function buildCase(d: CaseData): Case {
  const story = storyByKey(d.story);
  if (!story) throw new Error(`História ${d.story} não encontrada (${d.id})`);
  const model = d.model;
  const kind = RULE_OF[d.game];
  const st = STRUCTURES[d.structure];
  const scene = sceneOf(d.chapter);
  // Numeração mostrada ao jogador: só as pistas (a regra fica à parte, sem número).
  const numbered = d.clues.map((c, i) => ({ c, i })).filter((x) => !isRule(x.c));
  const label = (i: number) => (isRule(d.clues[i]) ? "regra do lugar" : `pista ${numbered.findIndex((x) => x.i === i) + 1}`);
  const ded = deduce(model, d.clues);
  const key = keyStep(d, ded.steps);
  const keyClues = key ? [...new Set([...(key.uses ?? []), ...(typeof key.by === "number" ? [key.by] : [])])].filter((i) => !isRule(d.clues[i])) : [];
  const who = key ? the(model.people[key.s]) : "";
  const what = key?.cat === "o" ? `o objeto ${key.s >= 0 ? `que ${who} tinha` : ""}` : `onde ${who} estava`;
  const hint2 = !key ? GENERAL_HINT[kind]
    : keyClues.length >= 2 ? `Compare a ${label(keyClues[0])} com a ${label(keyClues[1])}: juntas, elas revelam ${what}.`
    : keyClues.length === 1 ? `A ${label(keyClues[0])}, junto com a regra do lugar, é a chave para descobrir ${what}.`
    : `Olhe a regra do lugar com atenção: sozinha, ela já diz ${what}.`;
  return {
    id: d.id, game: d.game, kind, chapter: d.chapter, level: d.level,
    title: story.title,
    description: `${TEASER[kind]} ${STRUCTURE_TEASER[d.structure]}`,
    story: story.intro,
    goal: story.goal,
    ending: endingOf(story.ending, model, d.sol),
    storyKey: d.story, structure: d.structure, structureName: st.name,
    world: scene.name, art: sceneArt(scene), narrator: NARRATOR[d.game],
    model,
    rules: d.clues.filter(isRule),
    clues: numbered.map((x) => x.c),
    ruleTexts: d.clues.filter(isRule).map((c) => clueText(model, c)),
    notes: ruleNotes(model),
    clueTexts: numbered.map((x) => clueText(model, x.c)),
    answer: d.sol,
    explanation: ded.steps.map((s) => stepText(model, s, label)),
    hints: [st.hint, hint2, key ? stepText(model, key, label) : GENERAL_HINT[kind]],
    difficulty: d.difficulty,
    difficultyLabel: DIFFICULTY_LABEL[d.difficulty],
    estimate: ESTIMATE[d.difficulty],
    xp: BASE_XP[d.difficulty],
  };
}

// Montados uma vez, sob demanda (o banco é pequeno: 100 mistérios).
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

/** A resposta está completa e bem formada (cada pessoa com uma casa e um objeto, sem repetir)? */
export function isComplete(c: Case, a: number[]): boolean {
  const n = c.model.people.length;
  if (a.length !== 2 * n) return false;
  const pos = a.slice(0, n), obj = a.slice(n);
  return pos.every((v) => v >= 0) && obj.every((v) => v >= 0) && new Set(pos).size === n && new Set(obj).size === n;
}

/**
 * A resposta está certa? Confere contra a regra do lugar e TODAS as pistas — e, como os testes provam que só
 * existe uma resposta assim para cada mistério, ela é exatamente a solução guardada.
 */
export function isCorrect(c: Case, a: number[]): boolean {
  return isComplete(c, a) && [...c.rules, ...c.clues].every((k) => evalClue(c.model, k, a));
}

/** Primeira pista (índice em c.clues) ou regra (-1) que a resposta contraria; null se nenhuma. */
export function firstBroken(c: Case, a: number[]): number | null {
  if (c.rules.some((k) => !evalClue(c.model, k, a))) return -1;
  const i = c.clues.findIndex((k) => !evalClue(c.model, k, a));
  return i >= 0 ? i : null;
}
