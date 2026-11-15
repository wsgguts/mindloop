// Mindloop Investigação — gerador do banco de mistérios (usado por scripts/gen_cases.ts, nunca no navegador).
// Cada caso nasce de quatro ingredientes:
//   • a HISTÓRIA (stories/*.ts): personagens, objetos e o vocabulário do lugar (cômodos, móveis, assentos);
//   • a REGRA do cenário, que vem do jogo (regiões, equilíbrio, trilha, cômodos, céu);
//   • a ESTRUTURA investigativa (structures.ts): a forma do raciocínio;
//   • a DIFICULDADE do capítulo (tamanho, tipos de pista, profundidade da dedução).
// Para cada caso: monta o cenário, sorteia uma solução (lugar + objeto de cada pessoa), escolhe pistas verdadeiras
// até restar UMA solução, tira as que sobram e só aceita o caso se ele (1) se resolve inteiro por dedução, (2) tem
// de fato a forma da estrutura e (3) não repete o caso anterior do mesmo jogo.
// Tudo é determinístico (semente pelo id), então rodar de novo gera o mesmo banco.

import { LEVELS_PER_CHAPTER, type JourneyGame } from "../journey";
import { type Difficulty, caseLevels, difficultyOf } from "./config";
import { type Clue, type ClueKind, type Ent, type Model, type PosClue, type Rule, allAnswers, deduce, evalClue, isRule, kingDist, NEAR_STEPS, posList, propAt, rcOf, roomOf, sideNeighbors, stopOf } from "./model";
import { type Layout, buildScene } from "./scenery";
import { STRUCTURES, type StructureId, directCount, poolOf, structurePlan } from "./structures";
import { RULE_OF, STORIES } from "./themes";
import { castFor } from "../cast";

/** Registro guardado no banco (src/lib/cases/data.ts). Os textos são montados a partir dele em catalog.ts. */
export interface CaseData {
  id: string;
  game: JourneyGame;
  /** Oferecido depois desta fase da jornada. */
  level: number;
  chapter: number;
  difficulty: Difficulty;
  /** Chave da história (stories/*.ts). */
  story: string;
  structure: StructureId;
  model: Model;
  /** A regra do lugar ({k:"rule"}) e as pistas. */
  clues: Clue[];
  /** Resposta: casa de cada pessoa, depois o objeto de cada pessoa. */
  sol: number[];
}

// ---------------------------------------------------------------- aleatório determinístico

export function rngOf(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
type Rng = () => number;
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------------------------------------------------------------- tamanho e pistas de cada regra

/** Quantas pessoas e como é o lugar, pela regra e pela dificuldade. */
export function layoutOf(rule: Rule, d: Difficulty): { n: number; L: Layout } {
  // Mini Sudoku, Tango e Astros sempre com 4 (4×4 com quadrados 2×2; 2×4; 4×4 sem ninguém se encostar). Zip e Patches
  // começam com 3 pessoas.
  const n = rule === "trilha" || rule === "comodos" ? (d === 1 ? 3 : 4) : 4;
  switch (rule) {
    case "regioes": return { n, L: { rows: 4, cols: 4, rooms: 4, blocks: d === 1 ? 1 : 2, seats: d === 1 ? 1 : 2 } };
    case "ceu": return { n, L: { rows: 4, cols: 4, rooms: 4, blocks: d <= 2 ? 1 : 2, seats: 2 } };
    case "comodos": return { n, L: n === 3 ? { rows: 3, cols: 3, rooms: 3, blocks: 2, seats: 1 } : d === 2 ? { rows: 3, cols: 4, rooms: 4, blocks: 2, seats: 2 } : { rows: 4, cols: 4, rooms: 4, blocks: 3, seats: 2 } };
    // A trilha passa por todas as casas livres: 7 paradas (3×3 com 2 obstáculos) ou 8 (3×3 com 1).
    case "trilha": return { n, L: d <= 2 ? { rows: 3, cols: 3, rooms: 2, blocks: 2, seats: d } : { rows: 3, cols: 3, rooms: 3, blocks: 1, seats: 2 } };
    case "equilibrio": return { n, L: { rows: 2, cols: 4, rooms: 2, blocks: d >= 3 ? 1 : 0, seats: 2 } };
  }
}

/** Pistas de posição de cada regra. */
const POS: Record<Rule, ClueKind[]> = {
  regioes: ["at", "room", "notRoom", "eitherRoom", "row", "col", "left", "above", "seat", "by"],
  ceu: ["at", "near", "far", "alone", "nearN", "corner", "diag", "row", "col", "room", "notRoom", "seat", "by"],
  comodos: ["at", "room", "notRoom", "eitherRoom", "seat", "by", "touch", "apart", "left", "above"],
  trilha: ["at", "stop", "notStop", "before", "next", "room", "notRoom", "eitherRoom", "seat", "by"],
  equilibrio: ["at", "side", "sameSide", "oppSide", "beside", "left", "col", "seat", "by"],
};
/** O que pode vir dentro de uma pista cruzada ("quem tinha o X …"), por regra. */
const VIA: Record<Rule, ClueKind[]> = {
  regioes: ["room", "notRoom", "row", "col", "seat", "by", "left", "above"],
  ceu: ["room", "near", "far", "corner", "alone", "row", "col"],
  comodos: ["room", "notRoom", "seat", "by", "touch", "apart"],
  trilha: ["stop", "notStop", "before", "next", "room", "seat"],
  equilibrio: ["side", "sameSide", "oppSide", "beside", "col", "seat"],
};

/**
 * pairs: máximo de vezes que a dedução precisa ler duas pistas juntas (o passo mais difícil) — limita saltos.
 * deep: o caso precisa ser construído em etapas (pelo menos 4 rodadas de dedução ou um cruzamento de duas pistas),
 * para os mistérios finais pedirem mais do que aplicar pistas uma a uma.
 */
interface Tier { clues: [number, number]; minVia: number; rounds: [number, number]; at: boolean; pairs: number; deep?: boolean }
const TIERS: Record<Difficulty, Tier> = {
  1: { clues: [3, 6], minVia: 1, rounds: [1, 6], at: true, pairs: 0 },
  2: { clues: [4, 7], minVia: 1, rounds: [2, 7], at: true, pairs: 1 },
  3: { clues: [4, 8], minVia: 2, rounds: [2, 9], at: false, pairs: 2 },
  4: { clues: [5, 9], minVia: 2, rounds: [3, 12], at: false, pairs: 3, deep: true },
};
/** Limite de pistas de cada tipo (evita casos resolvidos por uma lista de respostas diretas). */
const CAP: Partial<Record<string, number>> = {
  at: 1, has: 2, row: 2, col: 2, room: 2, notRoom: 2, eitherRoom: 1, seat: 1, by: 2, corner: 1, alone: 1, nearN: 1,
  stop: 1, notStop: 2, side: 2, hasNot: 3, via: 4, left: 2, above: 2,
};
/** Pistas que entregam muito de cara pesam menos no sorteio: preferimos relações e pistas cruzadas. */
const WEIGHT: Partial<Record<ClueKind, number>> = { at: 0.3, has: 0.5, room: 0.8, stop: 0.6, side: 0.8, row: 0.8, col: 0.8, via: 1.6 };
const SYMMETRIC = ["near", "far", "diag", "touch", "apart", "sameSide", "oppSide", "beside"];

/** Todas as pistas verdadeiras para a solução (de posição, de objeto e cruzadas). */
function candidates(m: Model, sol: number[], kinds: ClueKind[], viaKinds: ClueKind[]): Clue[] {
  const n = m.people.length;
  const pos = sol.slice(0, n), obj = sol.slice(n);
  const has = (k: ClueKind) => kinds.includes(k);
  const rooms = m.scene.rooms.length;
  /** Pistas de posição sobre a pessoa s (s pode ser -1 = quem tinha um objeto). */
  const single = (s: number, v: number, allow: (k: ClueKind) => boolean): PosClue[] => {
    const out: PosClue[] = [];
    const [r, c] = rcOf(m, v), room = roomOf(m, v);
    if (allow("at")) out.push({ k: "at", s, v });
    if (allow("room")) out.push({ k: "room", s, r: room });
    if (allow("notRoom")) for (let k = 0; k < rooms; k++) if (k !== room) out.push({ k: "notRoom", s, r: k });
    if (allow("eitherRoom")) for (let k = 0; k < rooms; k++) if (k !== room) out.push({ k: "eitherRoom", s, r: room < k ? [room, k] : [k, room] });
    const seat = propAt(m, v);
    if (allow("seat") && seat && !seat.block) out.push({ k: "seat", s, p: seat.label });
    if (allow("by")) for (const w of sideNeighbors(m, v)) { const p = propAt(m, w); if (p?.block) out.push({ k: "by", s, p: p.label }); }
    if (allow("row")) out.push({ k: "row", s, r });
    if (allow("col")) out.push({ k: "col", s, c });
    if (allow("corner") && (r === 0 || r === m.rows - 1) && (c === 0 || c === m.cols - 1)) out.push({ k: "corner", s });
    const close = pos.filter((w) => w !== v && kingDist(m, v, w) === NEAR_STEPS).length;
    if (allow("alone") && close === 0) out.push({ k: "alone", s });
    if (allow("nearN") && close > 0) out.push({ k: "nearN", s, n: close });
    if (allow("stop") && m.trail) out.push({ k: "stop", s, n: stopOf(m, v) });
    if (allow("notStop") && m.trail) for (let k = 0; k < m.trail.length; k++) if (k !== stopOf(m, v)) out.push({ k: "notStop", s, n: k });
    if (allow("side")) out.push({ k: "side", s, r });
    return out;
  };
  const pair = (a: number, b: number, va: number, vb: number, allow: (k: ClueKind) => boolean): PosClue[] => {
    const out: PosClue[] = [];
    const [r1, c1] = rcOf(m, va), [r2, c2] = rcOf(m, vb);
    const king = kingDist(m, va, vb), manh = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (allow("left") && c1 < c2) out.push({ k: "left", a, b });
    if (allow("above") && r1 < r2) out.push({ k: "above", a, b });
    if (allow("near") && king === NEAR_STEPS) out.push({ k: "near", a, b });
    if (allow("far") && king > NEAR_STEPS) out.push({ k: "far", a, b });
    if (allow("diag") && Math.abs(r1 - r2) === Math.abs(c1 - c2)) out.push({ k: "diag", a, b });
    if (allow("touch") && manh === 1) out.push({ k: "touch", a, b });
    if (allow("apart") && manh !== 1) out.push({ k: "apart", a, b });
    if (allow("before") && m.trail && stopOf(m, va) < stopOf(m, vb)) out.push({ k: "before", a, b });
    if (allow("next") && m.trail && stopOf(m, vb) === stopOf(m, va) + 1) out.push({ k: "next", a, b });
    if (allow("sameSide") && r1 === r2) out.push({ k: "sameSide", a, b });
    if (allow("oppSide") && r1 !== r2) out.push({ k: "oppSide", a, b });
    if (allow("beside") && Math.abs(c1 - c2) === 1) out.push({ k: "beside", a, b });
    return out;
  };
  const out: Clue[] = [];
  for (let s = 0; s < n; s++) {
    out.push(...single(s, pos[s], has));
    if (has("has")) out.push({ k: "has", s, o: obj[s] });
    if (has("hasNot")) for (let o = 0; o < n; o++) if (o !== obj[s]) out.push({ k: "hasNot", s, o });
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b) out.push(...pair(a, b, pos[a], pos[b], has));
  if (has("via")) for (let o = 0; o < n; o++) {
    const h = obj.indexOf(o);
    const allow = (k: ClueKind) => viaKinds.includes(k);
    for (const c of single(-1, pos[h], allow)) out.push({ k: "via", o, c });
    for (let b = 0; b < n; b++) if (b !== h) {
      for (const c of pair(-1, b, pos[h], pos[b], allow)) out.push({ k: "via", o, c });
      // Ordem invertida ("a Ana estava antes de quem tinha…") só para relações que não são simétricas.
      for (const c of pair(b, -1, pos[b], pos[h], allow)) if (!SYMMETRIC.includes(c.k)) out.push({ k: "via", o, c });
    }
  }
  // Pistas simétricas aparecem uma vez só (a–b e b–a dizem o mesmo).
  const seen = new Set<string>();
  return out.filter((c) => {
    const key = c.k !== "via" && "a" in c && SYMMETRIC.includes(c.k) ? JSON.stringify({ k: c.k, x: [c.a, c.b].sort() }) : JSON.stringify(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return evalClue(m, c, sol);
  });
}

const kindKey = (c: Clue) => c.k;

/** Escolhe pistas até a solução ser única; depois remove as dispensáveis. null se o caso não fica bom. */
function chooseClues(r: Rng, m: Model, base: number[][], cands: Clue[], favor: Partial<Record<string, number>>, maxDirect: number, t: Tier): Clue[] | null {
  const order = cands
    .map((c) => ({ c, key: r() ** (1 / ((WEIGHT[c.k] ?? 1) * (favor[c.k] ?? 1) * (c.k === "via" ? favor[c.c.k] ?? 1 : 1))) }))
    .sort((x, y) => y.key - x.key).map((x) => x.c);
  let rem = base;
  const chosen: Clue[] = [];
  const used: Partial<Record<string, number>> = {};
  for (const c of order) {
    if (rem.length === 1) break;
    if ((used[kindKey(c)] ?? 0) >= (CAP[c.k] ?? 3)) continue;
    if ((c.k === "at" || c.k === "has") && directCount(chosen) >= maxDirect) continue;
    const next = rem.filter((a) => evalClue(m, c, a));
    if (next.length < rem.length && next.length > 0) { chosen.push(c); rem = next; used[kindKey(c)] = (used[kindKey(c)] ?? 0) + 1; }
  }
  if (rem.length !== 1) return null;
  // Minimiza: tira cada pista que não faz falta para a solução continuar única.
  let kept = chosen;
  for (const c of shuffle(r, chosen)) {
    const without = kept.filter((x) => x !== c);
    if (base.filter((a) => without.every((x) => evalClue(m, x, a))).length === 1) kept = without;
  }
  if (kept.length < t.clues[0] || kept.length > t.clues[1]) return null;
  if (kept.filter((c) => c.k === "via").length < t.minVia) return null;
  return shuffle(r, kept);
}

/** Combinação de tipos de pista (ignora nomes): dois casos com a mesma assinatura raciocinam parecido. */
export const signature = (clues: Clue[]) => clues.filter((c) => !isRule(c)).map((c) => (c.k === "via" ? `via:${c.c.k}` : c.k)).sort().join(",");
export const clueCount = (clues: Clue[]) => clues.filter((c) => !isRule(c)).length;

// ---------------------------------------------------------------- geração

export const REJECTS: Record<string, number> = {};
const rej = (k: string) => { REJECTS[k] = (REJECTS[k] ?? 0) + 1; };
const strip = (e: Ent): Ent => ({ label: e.label, ...(e.g ? { g: e.g } : {}), ...(e.icon ? { icon: e.icon } : {}) });

function attemptCase(game: JourneyGame, level: number, index: number, structure: StructureId, prev: CaseData | undefined, tries: number): CaseData | null {
  const rule = RULE_OF[game];
  const chapter = Math.ceil(level / LEVELS_PER_CHAPTER);
  const difficulty = difficultyOf(chapter);
  const t = TIERS[difficulty];
  const st = STRUCTURES[structure];
  const story = STORIES[game][index];
  const { n, L } = layoutOf(rule, difficulty);
  const kinds = [...POS[rule].filter((k) => k !== "at" || t.at), "has", "hasNot", "via"] as ClueKind[];
  const id = `${game}-${String(level).padStart(2, "0")}`;
  for (let attempt = 0; attempt < tries; attempt++) {
    const r = rngOf(`${id}#${structure}#${attempt}`);
    const place = buildScene(r, story, rule, L);
    if (!place) { rej("cenario"); continue; }
    const model: Model = { rule, people: castFor(game, index).slice(0, n).map((c) => ({ label: c.name, g: c.g })), objects: story.objects.slice(0, n).map(strip), ...place };
    const P = posList(model);
    // O lugar precisa deixar dúvida (senão a regra sozinha resolve as posições), mas não demais.
    if (P.length < (n === 3 ? 4 : 6) || P.length * (n === 3 ? 6 : 24) > 42000) { rej("posicoes"); continue; }
    const base = allAnswers(model);
    const sol = pick(r, base);
    const cands = candidates(model, sol, kinds, VIA[rule]);
    const clues = chooseClues(r, model, base, cands, st.favor, st.maxDirect, t);
    if (!clues) { rej("pistas"); continue; }
    const all: Clue[] = [{ k: "rule" }, ...clues];
    const ded = deduce(model, all);
    if (!ded.solved) { rej("chute"); continue; }
    if (ded.pairs > t.pairs) { rej("dificil"); continue; }
    if (ded.rounds < t.rounds[0] || ded.rounds > t.rounds[1]) { rej("rodadas"); continue; }
    if (t.deep && ded.rounds < 4 && ded.pairs < 1) { rej("raso"); continue; }
    if (!st.need({ m: model, clues: all, ded, difficulty })) { rej(`forma:${structure}`); continue; }
    if (prev && (prev.structure === structure || signature(prev.clues) === signature(all))) { rej("igual-anterior"); continue; }
    return { id, game, level, chapter, difficulty, story: story.key, structure, model, clues: all, sol };
  }
  return null;
}

/** Gera um caso: tenta a estrutura da agenda e, se não couber, as outras da mesma dificuldade. */
export function generateCase(game: JourneyGame, level: number, index: number, prev?: CaseData): CaseData {
  if (!STORIES[game][index]) throw new Error(`Falta a história ${index + 1} de ${game}`);
  const rule = RULE_OF[game];
  const levels = caseLevels(game);
  const plan = structurePlan(game, rule, levels.map((l) => difficultyOf(Math.ceil(l / LEVELS_PER_CHAPTER))));
  const d = difficultyOf(Math.ceil(level / LEVELS_PER_CHAPTER));
  const order = [plan[index], ...poolOf(rule, d).filter((s) => s !== plan[index])].filter((s) => s !== prev?.structure);
  for (const tries of [400, 2500]) for (const s of order) {
    const c = attemptCase(game, level, index, s, prev, tries);
    if (c) return c;
  }
  throw new Error(`Não foi possível gerar o caso ${game}-${level}`);
}

/** Todos os casos de um jogo, em ordem (cada um conhece o anterior para não repeti-lo). */
export function generateGame(game: JourneyGame): CaseData[] {
  const out: CaseData[] = [];
  const levels = caseLevels(game);
  if (STORIES[game].length !== levels.length) throw new Error(`${game}: ${STORIES[game].length} histórias para ${levels.length} casos`);
  levels.forEach((level, i) => out.push(generateCase(game, level, i, out[i - 1])));
  return out;
}

export function generateAll(games: JourneyGame[]): CaseData[] {
  return games.flatMap(generateGame);
}

export { isRule };
