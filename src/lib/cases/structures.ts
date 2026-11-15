// Mindloop Investigação — estruturas investigativas: a FORMA do raciocínio de cada caso.
// A história diz "o quê"; a estrutura diz "como se pensa". Cada estrutura escolhe que tipos de pista entram no
// sorteio e traz um teste (need) conferido na dedução real do caso. Seis estruturas valem para todos os jogos e
// cada jogo tem uma estrutura própria, ligada à regra do seu cenário.

import type { JourneyGame } from "../journey";
import type { Difficulty } from "./config";
import { type Clue, type ClueKind, type Deduction, type Model, type Rule, isRule } from "./model";

export type StructureId =
  | "progressiva" | "exclusao" | "cruzamento" | "cenario" | "objetos" | "contradicao"
  | "regioes" | "equilibrio" | "sequencia" | "vizinhanca" | "proximidade";

export interface Structure {
  id: StructureId;
  /** Nome curto mostrado ao jogador. */
  name: string;
  /** Peso extra no sorteio (pistas que dão o "sabor" da estrutura). */
  favor: Partial<Record<ClueKind | `via:${string}`, number>>;
  /** Pistas diretas ("estava na casa B2", "tinha a Lupa") permitidas. */
  maxDirect: number;
  /** Primeira dica: ensina o jeito de pensar desta estrutura. */
  hint: string;
  need: (x: Shape) => boolean;
}

/** O que se sabe de um caso pronto para conferir a estrutura. */
export interface Shape { m: Model; clues: Clue[]; ded: Deduction; difficulty: Difficulty }

const own = (x: Shape) => x.clues.filter((c) => !isRule(c));
const count = (x: Shape, ...ks: ClueKind[]) => own(x).filter((c) => ks.includes(c.k)).length;
/** Pistas cruzadas cujo miolo é de um dos tipos. */
const viaOf = (x: Shape, ...ks: ClueKind[]) => own(x).filter((c) => c.k === "via" && (!ks.length || ks.includes(c.c.k))).length;
export const directCount = (clues: Clue[]) => clues.filter((c) => c.k === "at" || c.k === "has").length;
const negatives = (x: Shape) => count(x, "notRoom", "hasNot", "notStop", "notAt", "far", "apart", "oppSide") + own(x).filter((c) => c.k === "via" && ["notRoom", "notStop", "far", "apart", "oppSide"].includes(c.c.k)).length;
/** Alguma descoberta usou duas pistas diferentes juntas. */
const combined = (x: Shape) => x.ded.steps.some((s) => typeof s.by === "number" && s.uses.some((u) => u !== s.by));
const ruleSteps = (x: Shape) => x.ded.steps.filter((s) => s.by === "rule").length;
const SCENE: ClueKind[] = ["room", "notRoom", "eitherRoom", "seat", "by"];

export const STRUCTURES: Record<StructureId, Structure> = {
  progressiva: {
    id: "progressiva", name: "Descoberta progressiva", maxDirect: 1, favor: { has: 1.5, at: 1.5 },
    hint: "Este caso tem um ponto de partida firme: uma pista diz exatamente onde alguém estava ou o que tinha. Comece por ela — cada descoberta destrava a pista seguinte.",
    need: (x) => directCount(own(x)) === 1 && x.ded.rounds >= 2,
  },
  exclusao: {
    id: "exclusao", name: "Por exclusão", maxDirect: 0, favor: { notRoom: 3, hasNot: 3, notStop: 3, far: 2, apart: 2, oppSide: 2 },
    hint: "Nenhuma pista aponta a resposta diretamente. Use o quadro de dedução: marque X no que NÃO pode ser. Quando só sobrar uma possibilidade, ela é a certa.",
    need: (x) => directCount(own(x)) === 0 && negatives(x) >= 2,
  },
  cruzamento: {
    id: "cruzamento", name: "Cruzamento de informações", maxDirect: 0, favor: { via: 4 },
    hint: "As pistas misturam lugar e objeto (“quem tinha a lupa estava…”). Descubra primeiro o dono de um objeto e use o que a pista diz sobre o lugar dele — ou o contrário.",
    need: (x) => viaOf(x) >= 2 && combined(x),
  },
  cenario: {
    id: "cenario", name: "Leitura do cenário", maxDirect: 1, favor: { room: 3, notRoom: 3, eitherRoom: 2, seat: 4, by: 4 },
    hint: "Olhe primeiro para o lugar: em que cômodo fica cada casa, onde estão os móveis (ninguém fica em cima deles) e quais casas têm assento. Pistas de cômodo e de móvel deixam só um punhado de casas possíveis.",
    need: (x) => count(x, ...SCENE) + viaOf(x, ...SCENE) >= 2,
  },
  objetos: {
    id: "objetos", name: "Rastro dos objetos", maxDirect: 1, favor: { has: 2, hasNot: 3, via: 2 },
    hint: "Comece pelos objetos: monte o quadro “quem tinha o quê” com as pistas que falam deles. Cada objeto é de uma pessoa só — quando um dono aparece, os outros objetos ficam mais fáceis.",
    need: (x) => count(x, "has", "hasNot") + viaOf(x) >= 3 && count(x, "hasNot") + viaOf(x) >= 2,
  },
  contradicao: {
    id: "contradicao", name: "Contradição reveladora", maxDirect: 0, favor: { eitherRoom: 5 },
    hint: "Uma pista oferece duas possibilidades e as duas parecem boas. Suponha cada uma e veja qual delas bate de frente com outra pista ou com a regra do lugar — a que gera contradição cai.",
    need: (x) => x.clues.some((c, i) => c.k === "eitherRoom" && x.ded.steps.some((s) => s.cat === "p" && s.s === c.s && (s.uses.some((u) => u !== i) || s.by !== i))),
  },
  // ---- Estruturas próprias de cada jogo (a regra do cenário trabalhando) ----
  regioes: {
    id: "regioes", name: "Regiões ocupadas", maxDirect: 1, favor: { row: 2, col: 2, room: 2, left: 2, above: 2 },
    hint: "Como no Sudoku: cada linha, cada coluna e cada cômodo tem exatamente uma pessoa. Quando alguém ocupa uma linha, ela fica “fechada” para todos os outros — risque essas casas.",
    need: (x) => ruleSteps(x) >= 1 && count(x, "row", "col", "left", "above", "room") + viaOf(x, "row", "col", "room") >= 2,
  },
  equilibrio: {
    id: "equilibrio", name: "Equilíbrio dos lados", maxDirect: 1, favor: { side: 3, sameSide: 4, oppSide: 4, beside: 2 },
    hint: "Como no Tango: metade das pessoas fica de cada lado e há uma por coluna. Se um lado já está cheio, todos os outros estão do lado oposto.",
    need: (x) => count(x, "side", "sameSide", "oppSide") + viaOf(x, "side", "sameSide", "oppSide") >= 2,
  },
  sequencia: {
    id: "sequencia", name: "Reconstrução do percurso", maxDirect: 1, favor: { before: 4, next: 4, stop: 2, notStop: 2 },
    hint: "Como no Zip: a trilha tem uma ordem. Organize as pessoas da primeira à última parada — as pistas de “antes” e “logo depois” encaixam umas nas outras.",
    need: (x) => count(x, "before", "next") + viaOf(x, "before", "next") >= 2,
  },
  vizinhanca: {
    id: "vizinhanca", name: "Vizinhança dos cômodos", maxDirect: 1, favor: { touch: 4, apart: 3, by: 3, left: 2, above: 2 },
    hint: "Como no Patches: cada cômodo é um retalho com uma pessoa só. Quem é vizinho de quem, e quem fica junto de qual móvel, decide em que pedaço de cada cômodo a pessoa estava.",
    need: (x) => count(x, "touch", "apart", "by") + viaOf(x, "touch", "apart", "by") >= 2,
  },
  proximidade: {
    id: "proximidade", name: "Mapa de proximidade", maxDirect: 1, favor: { near: 4, far: 3, alone: 4, nearN: 4, diag: 2 },
    hint: "Como no Astros: o que importa é quem encosta em quem (as 8 casas em volta, inclusive na diagonal). Quem não encosta em ninguém precisa de espaço; quem encosta só cabe perto.",
    need: (x) => count(x, "near", "far", "alone", "nearN") + viaOf(x, "near", "far", "alone", "nearN") >= 2,
  },
};

/** A estrutura própria de cada regra de cenário. */
export const SPECIAL: Record<Rule, StructureId> = { regioes: "regioes", equilibrio: "equilibrio", trilha: "sequencia", comodos: "vizinhanca", ceu: "proximidade" };

/** Estruturas possíveis em cada dificuldade (as primeiras ensinam; as últimas exigem mais). */
export function poolOf(rule: Rule, d: Difficulty): StructureId[] {
  const sp = SPECIAL[rule];
  return ({
    1: [sp, "progressiva", "objetos"],
    2: [sp, "cenario", "progressiva", "objetos", "exclusao"],
    3: ["cruzamento", sp, "cenario", "exclusao", "contradicao"],
    4: ["cruzamento", sp, "contradicao", "exclusao", "objetos"],
  } as Record<Difficulty, StructureId[]>)[d];
}

/** Agenda determinística: uma estrutura por caso, sem repetir a anterior, preferindo as menos usadas. */
export function structurePlan(game: JourneyGame, rule: Rule, difficulties: Difficulty[]): StructureId[] {
  let seed = [...game].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const out: StructureId[] = [];
  const used = new Map<StructureId, number>();
  for (const d of difficulties) {
    const pool = poolOf(rule, d);
    let options = pool.filter((x) => x !== out[out.length - 1]);
    if (!options.length) options = pool;
    const min = Math.min(...options.map((x) => used.get(x) ?? 0));
    const least = options.filter((x) => (used.get(x) ?? 0) <= min);
    const pick = least[Math.floor(rnd() * least.length)];
    out.push(pick);
    used.set(pick, (used.get(pick) ?? 0) + 1);
  }
  return out;
}

