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
import { castByName, castImg } from "../cast";
import { type Dim, clueDim, gridsOf } from "./grids";
import { type Conclusion, type LogicStep, runLogic } from "./logic";
import { type CaseKind, type Clue, type Model, COLS, cap, clueText, em, evalClue, isRule, ruleNotes, sideText, the } from "./model";
import { STRUCTURES, type StructureId } from "./structures";
import { GENERAL_HINT, NARRATOR, RULE_OF, storyByKey } from "./themes";
import { voicesFor } from "./witness";
import { ROLE_LABEL, shortLabel } from "./narrative";
import { NARRATIVES } from "./narrativas";
import { type Fala, narracaoDe } from "./narracao";
import { ROTEIROS } from "./roteiros";

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
  /** As grades do quadro de decisões e a grade que cada pista afeta (índice em dims). */
  dims: Dim[];
  clueDims: number[];
  /** O passo a passo da solução (pista k = índice em clues), usado na explicação e nas dicas. */
  trace: LogicStep[];
  /** Personagens com uma linha de personalidade (do elenco do MindLoop). */
  cast: { name: string; bio: string; img: string | null; why: string; link: string }[];
  /** Ambientação (1 frase) e ficha dos objetos (narrativas/<jogo>.ts). */
  sceneLine: string;
  objectCards: { label: string; desc: string; role: string; place: string }[];
  /** A história contada pelo narrador, fala por fala (narracao.ts + roteiros.ts), e a pergunta do caso. */
  narracao: Fala[];
  pergunta: string;
  ruleTexts: string[];
  /** Lembretes fixos (★): casas livres, um objeto por pessoa, o que é encostar. */
  notes: string[];
  clueTexts: string[];
  /** Resposta: casa de cada pessoa, depois o objeto de cada pessoa. */
  answer: number[];
  explanation: string[];
  /** As 3 dicas do primeiro passo (as dicas na tela acompanham o que a pessoa já marcou: hintFor). */
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
  ceu: "Cada linha, coluna e região do céu esconde uma pessoa."
};
const STRUCTURE_TEASER: Record<StructureId, string> = {
  progressiva: "Cada descoberta destrava a próxima.",
  exclusao: "Descubra primeiro o que não pode ser.",
  cenario: "O próprio lugar guarda as pistas.",
  objetos: "Siga o rastro dos objetos.",
  regioes: "Linhas, colunas e cômodos se fecham um a um.",
  equilibrio: "O Cristal e o Orbe precisam se equilibrar.",
  sequencia: "Reconstrua o percurso, parada por parada.",
  formas: "O tamanho de cada cômodo entrega quem estava ali.",
  mapa: "Cada região do céu esconde uma pessoa.",
};

// ---------------------------------------------------------------- frases do passo a passo e das dicas

const ele = (m: Model, s: number) => (m.people[s].g === "f" ? "ela" : "ele");
const daPessoa = (m: Model, s: number) => `${m.people[s].g === "f" ? "da" : "do"} ${m.people[s].label}`;
/** "estava na linha 2", "estava no Claustro", "segurava o Cajado"… */
export function valuePhrase(m: Model, dim: Dim, v: number): string {
  switch (dim.id) {
    case "row": return `estava na linha ${v + 1}`;
    case "col": return `estava na coluna ${COLS[v]}`;
    case "room": return `estava ${em(m.scene.rooms[v])}`;
    case "side": return `estava ${sideText(m, v)}`;
    case "stop": return `estava na ${v + 1}ª parada`;
    case "obj": return `segurava ${the(m.objects[v])}`;
  }
}
/** Uma conclusão em palavras, com o porquê. */
export function conclText(m: Model, dims: Dim[], x: Conclusion): string {
  const base = `${cap(the(m.people[x.s]))} ${valuePhrase(m, dims[x.d], x.v)}`;
  const g = dims[x.d].title;
  if (x.why === "pessoa") return `${base}: na grade ${g}, era a única opção que sobrava para ${ele(m, x.s)}.`;
  if (x.why === "valor") return `${base}: na grade ${g}, só ${ele(m, x.s)} ainda podia ficar com isso.`;
  if (x.why === "lugar") return `${base}: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas).`;
  return `${base}.`;
}

/** Dica para o estado atual: a primeira conclusão do passo a passo que a pessoa ainda não marcou. */
export interface HintInfo { clue: number; concl: Conclusion; texts: [string, string, string] }
export function hintFor(c: Case, known: (d: number, s: number, v: number) => boolean): HintInfo | null {
  for (const st of c.trace) for (const x of st.concl) {
    if (known(x.d, x.s, x.v)) continue;
    return { clue: st.clue, concl: x, texts: hintTexts(c.model, c.dims, c.clueDims, st.clue, x) };
  }
  return null;
}
function hintTexts(m: Model, dims: Dim[], clueDims: number[], clue: number, x: Conclusion): [string, string, string] {
  const dimC = dims[clueDims[clue]], dimX = dims[x.d];
  const first = x.why === "pista" || x.why === "lugar"
    ? `Use a pista ${clue + 1} — ela vai para a grade ${dimC.icon} ${dimC.title}.`
    : `Depois da pista ${clue + 1}, olhe a grade ${dimX.icon} ${dimX.title}: ali já dá para concluir algo.`;
  return [first, `Olhe a fileira ${daPessoa(m, x.s)} na grade ${dimX.icon} ${dimX.title}.`, conclText(m, dims, x)];
}

/** Vozes das pistas (depoimentos), sem repetir no mesmo caso; determinístico pelo id. */
function voicesOf(id: string, clues: Clue[]): string[] {
  let h = [...id].reduce((a, ch) => (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0, 17);
  const used = new Set<string>();
  return clues.map((c) => {
    const pool = voicesFor(c.k);
    for (let t = 0; t < pool.length * 2; t++) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      const v = pool[(h >>> 8) % pool.length];
      if (!used.has(v)) { used.add(v); return v; }
    }
    return pool[0];
  });
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
  // Narrativa (narrativas/<jogo>.ts): textos e nomes dos objetos. A lógica (posições dos objetos, pistas, solução)
  // é a mesma do banco — só os rótulos mudam.
  const nar = NARRATIVES[d.id];
  const model = nar ? { ...d.model, objects: d.model.objects.map((o, i) => ({ ...o, label: nar.objects[i].label, icon: nar.objects[i].icon ?? o.icon, short: shortLabel(nar.objects.map((x) => x.label), i) })) } : d.model;
  const kind = RULE_OF[d.game];
  const st = STRUCTURES[d.structure];
  const scene = sceneOf(d.chapter);
  // Numeração mostrada ao jogador: só as pistas (a regra fica à parte, sem número).
  const numbered = d.clues.map((c, i) => ({ c, i })).filter((x) => !isRule(x.c));
  const own = numbered.map((x) => x.c);
  const dims = gridsOf(model);
  const res = runLogic(model, d.clues);
  // Passos com o índice da pista NUMERADA (0 = pista 1).
  const trace = res.steps.map((st) => ({ ...st, clue: numbered.findIndex((x) => x.i === st.clue) }));
  const clueDims = own.map((c) => clueDim(model, c, dims));
  const voices = voicesOf(d.id, own);
  const clueTexts = own.map((c, k) => nar?.clues[k] ?? d.texts?.[k] ?? clueText(model, c, voices[k]));
  const explanation = trace.map((st) => `Pista ${st.clue + 1} (${dims[clueDims[st.clue]].title}): ${st.concl.map((x) => conclText(model, dims, x)).join(" ")}`);
  const first = trace[0]?.concl[0];
  return {
    id: d.id, game: d.game, kind, chapter: d.chapter, level: d.level,
    title: nar?.title ?? story.title,
    description: `${TEASER[kind]} ${STRUCTURE_TEASER[d.structure]}`,
    story: nar?.intro ?? story.intro,
    goal: nar?.goal ?? story.goal,
    ending: nar?.ending ?? endingOf(story.ending, model, d.sol),
    sceneLine: nar?.scene ?? "",
    narracao: ROTEIROS[d.id] ? narracaoDe(ROTEIROS[d.id], model.people.map((p) => p.label), model.objects.map((o) => o.label), Number(d.id.split("-")[1])) : [],
    pergunta: nar?.goal ?? story.goal,
    objectCards: nar ? nar.objects.map((o) => ({ label: o.label, desc: o.desc, role: ROLE_LABEL[o.role], place: o.place })) : [],
    storyKey: d.story, structure: d.structure, structureName: st.name,
    world: scene.name, art: sceneArt(scene), narrator: NARRATOR[d.game],
    model,
    rules: d.clues.filter(isRule),
    clues: own, dims, clueDims, trace,
    cast: model.people.map((p) => { const cm = castByName(p.label); return { name: p.label, bio: cm?.bio ?? "", img: cm ? castImg(cm) : null, why: nar?.people[p.label]?.why ?? "", link: nar?.people[p.label]?.link ?? "" }; }),
    ruleTexts: d.clues.filter(isRule).map((c) => clueText(model, c)),
    notes: ruleNotes(model),
    clueTexts,
    answer: d.sol,
    explanation,
    hints: first ? hintTexts(model, dims, clueDims, trace[0].clue, first) : [GENERAL_HINT[kind], GENERAL_HINT[kind], GENERAL_HINT[kind]],
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
