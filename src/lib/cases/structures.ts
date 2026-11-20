// Mindloop Investigação — estruturas investigativas: a FORMA do raciocínio de cada caso.
// A história diz "o quê"; a estrutura diz "como se pensa". Cada estrutura dá mais peso a certos tipos de pista no
// sorteio e traz um teste (need), conferido no passo a passo real do caso (logic.ts). Quatro valem para todos os
// jogos; cada jogo tem mais uma, ligada à mecânica dele.

import type { JourneyGame } from "../journey";
import type { Difficulty } from "./config";
import type { LogicStep } from "./logic";
import { type Clue, type ClueKind, type Model, type Rule, isNegative, isRule } from "./model";
import { gridsOf } from "./grids";

export type StructureId =
  | "progressiva" | "exclusao" | "cenario" | "objetos"
  | "regioes" | "equilibrio" | "sequencia" | "formas" | "mapa";

export interface Structure {
  id: StructureId;
  /** Nome curto mostrado ao jogador. */
  name: string;
  /** Peso extra no sorteio das pistas que dão o "sabor" da estrutura. */
  favor: Partial<Record<ClueKind, number>>;
  need: (x: Shape) => boolean;
}

/** O que se sabe de um caso pronto para conferir a estrutura. */
export interface Shape { m: Model; clues: Clue[]; steps: LogicStep[]; difficulty: Difficulty }

const own = (x: Shape) => x.clues.filter((c) => !isRule(c));
const count = (x: Shape, ...ks: ClueKind[]) => own(x).filter((c) => ks.includes(c.k)).length;
/** ✓ que vieram do raciocínio (última opção ou tabuleiro), não direto de uma pista. */
const derived = (x: Shape, ...why: string[]) => x.steps.flatMap((s) => s.concl).filter((c) => (why.length ? why : ["lugar", "pessoa", "valor"]).includes(c.why));
const inDims = (x: Shape, ...ids: string[]) => { const dims = gridsOf(x.m); return derived(x, "pessoa", "valor").filter((c) => ids.includes(dims[c.d].id)).length; };

export const STRUCTURES: Record<StructureId, Structure> = {
  progressiva: {
    id: "progressiva", name: "Descoberta progressiva", favor: { row: 1.4, col: 1.4, room: 1.4, side: 1.4, stop: 1.4, has: 1.3 },
    need: (x) => x.steps.filter((s) => s.concl.some((c) => c.why !== "pista")).length >= x.m.people.length - 1,
  },
  exclusao: {
    id: "exclusao", name: "Por exclusão", favor: { notRow: 3, notCol: 3, notRoom: 3, notStop: 3, hasNot: 3, stopAfter: 2, stopBefore: 2 },
    need: (x) => own(x).filter(isNegative).length >= 2 && x.steps.some((s) => isNegative(x.clues[s.clue]) && s.concl.length > 0),
  },
  cenario: {
    id: "cenario", name: "Leitura do cenário", favor: { room: 2.5, notRoom: 2 },
    need: (x) => derived(x, "lugar").length >= 3,
  },
  objetos: {
    id: "objetos", name: "Rastro dos objetos", favor: { has: 1.5, hasNot: 3 },
    need: (x) => count(x, "has", "hasNot") >= x.m.people.length - 1 && count(x, "hasNot") >= 1,
  },
  // ---- Estruturas próprias de cada jogo (a mecânica do jogo trabalhando) ----
  regioes: {
    id: "regioes", name: "Linhas, colunas e cômodos", favor: { row: 2, col: 2, room: 2, notRow: 1.5, notCol: 1.5 },
    need: (x) => inDims(x, "row", "col", "room") >= 3,
  },
  equilibrio: {
    id: "equilibrio", name: "Equilíbrio do Cristal e do Orbe", favor: { side: 2, sameSide: 5, oppSide: 5 },
    need: (x) => count(x, "sameSide", "oppSide") >= 1,
  },
  sequencia: {
    id: "sequencia", name: "Reconstrução do percurso", favor: { next: 5, stopAfter: 4, stopBefore: 4 },
    need: (x) => count(x, "next", "stopAfter", "stopBefore") >= 2,
  },
  formas: {
    id: "formas", name: "Tamanho dos cômodos", favor: { size: 6 },
    need: (x) => count(x, "size") >= 1,
  },
  mapa: {
    id: "mapa", name: "Mapa do céu", favor: { room: 3, notRoom: 2 },
    need: (x) => count(x, "room", "notRoom") >= 2 && inDims(x, "row", "col") >= 2,
  },
};

/** A estrutura própria de cada regra de cenário. */
export const SPECIAL: Record<Rule, StructureId> = { regioes: "regioes", equilibrio: "equilibrio", trilha: "sequencia", comodos: "formas", ceu: "mapa" };

/** Estruturas possíveis em cada dificuldade (as primeiras ensinam; as últimas exigem mais). */
export function poolOf(rule: Rule, d: Difficulty): StructureId[] {
  const sp = SPECIAL[rule];
  return ({
    1: [sp, "progressiva", "objetos"],
    2: [sp, "cenario", "progressiva", "objetos", "exclusao"],
    3: [sp, "cenario", "exclusao", "objetos", "progressiva"],
    4: [sp, "exclusao", "cenario", "objetos", "progressiva"],
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
