// Mindloop Investigação — gerador do banco de mistérios (usado por scripts/gen_cases.ts, nunca no navegador).
// Cada caso nasce de quatro ingredientes:
//   • a HISTÓRIA (stories/*.ts): personagens, objetos e o vocabulário do lugar (cômodos e móveis);
//   • a REGRA do cenário, que vem do jogo (regiões, equilíbrio, trilha, cômodos, céu);
//   • a ESTRUTURA investigativa (structures.ts): a forma do raciocínio;
//   • a DIFICULDADE do capítulo.
// Para cada caso: monta o cenário, sorteia uma solução e escolhe as pistas UMA A UMA, na ordem em que vão aparecer.
// Cada pista nova precisa (1) ser verdadeira, (2) virar marcações diretas no quadro e (3) gerar pelo menos uma
// conclusão nova (um ✓) — sozinha ou com a "última opção". Para quando tudo está descoberto. O caso só é aceito se
// tem de 5 a 7 pistas, todas necessárias (sem cada uma, a solução deixa de ser única), cita todo mundo, tem a forma
// da estrutura e não repete o caso anterior do mesmo jogo.
// Casos escritos à mão (authored.ts) entram no lugar do gerado, com as mesmas conferências nos testes.
// Tudo é determinístico (semente pelo id), então rodar de novo gera o mesmo banco.

import { LEVELS_PER_CHAPTER, type JourneyGame } from "../journey";
import { AUTHORED } from "./authored";
import { type Difficulty, caseLevels, difficultyOf } from "./config";
import { type Solver as SolverT, Solver, runLogic, stepOf } from "./logic";
import { type Clue, type ClueKind, type Ent, type Model, type Rule, allAnswers, evalClue, isNegative, isRelational, isRule, perms, posList, rcOf, roomOf, roomSize, stopOf } from "./model";
import { gridsOf } from "./grids";
import { type Layout, buildScene } from "./scenery";
import { STRUCTURES, type StructureId, poolOf, structurePlan } from "./structures";
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
  /** A regra do lugar ({k:"rule"}) e as pistas, na ordem em que aparecem. */
  clues: Clue[];
  /** Resposta: casa de cada pessoa, depois o objeto de cada pessoa. */
  sol: number[];
  /** Casos escritos à mão: o texto de cada pista (sem a regra), no lugar do texto automático. */
  texts?: string[];
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

// ---------------------------------------------------------------- tamanho e pistas de cada regra

/** Quantas pessoas e como é o lugar, pela regra e pela dificuldade (sem assentos: nada decorativo vira pista). */
export function layoutOf(rule: Rule, d: Difficulty): { n: number; L: Layout } {
  // Sempre 4 personagens e 4 objetos: com 3, o caso fecharia em 4 pistas (abaixo das 5 a 7 de toda investigação).
  const n = 4;
  switch (rule) {
    case "regioes": return { n, L: { rows: 4, cols: 4, rooms: 4, blocks: d === 1 ? 1 : 2, seats: 0 } };
    case "ceu": return { n, L: { rows: 4, cols: 4, rooms: 4, blocks: d <= 2 ? 1 : 2, seats: 0 } };
    case "comodos": return { n, L: d <= 2 ? { rows: 3, cols: 4, rooms: 4, blocks: 2, seats: 0 } : { rows: 4, cols: 4, rooms: 4, blocks: 3, seats: 0 } };
    // A trilha passa por todas as casas livres: 7 paradas (3×3 com 2 obstáculos) ou 8 (3×3 com 1).
    case "trilha": return { n, L: d <= 2 ? { rows: 3, cols: 3, rooms: 2, blocks: 2, seats: 0 } : { rows: 3, cols: 3, rooms: 3, blocks: 1, seats: 0 } };
    // Tango: um móvel numa coluna fixa o lado de quem está nela (como as casas já preenchidas do jogo).
    case "equilibrio": return { n, L: { rows: 2, cols: 4, rooms: 2, blocks: d <= 2 ? 1 : 2, seats: 0 } };
  }
}

/** Todas as pistas verdadeiras para a solução, no vocabulário de cada jogo. */
function candidates(m: Model, sol: number[]): Clue[] {
  const n = m.people.length, pos = sol.slice(0, n), obj = sol.slice(n);
  const out: Clue[] = [];
  for (let s = 0; s < n; s++) {
    const v = pos[s], [r, c] = rcOf(m, v), room = roomOf(m, v);
    const rooms = m.scene.rooms.map((_, k) => k);
    if (m.rule === "regioes" || m.rule === "ceu") {
      out.push({ k: "row", s, r }, { k: "col", s, c });
      for (let x = 0; x < m.rows; x++) if (x !== r) out.push({ k: "notRow", s, r: x });
      for (let x = 0; x < m.cols; x++) if (x !== c) out.push({ k: "notCol", s, c: x });
    }
    if (m.rule === "regioes" || m.rule === "ceu" || m.rule === "comodos" || m.rule === "trilha") {
      out.push({ k: "room", s, r: room });
      for (const k of rooms) if (k !== room) out.push({ k: "notRoom", s, r: k });
    }
    if (m.rule === "comodos") out.push({ k: "size", s, n: roomSize(m, room) });
    if (m.rule === "equilibrio") {
      out.push({ k: "side", s, r }, { k: "col", s, c });
      for (let x = 0; x < m.cols; x++) if (x !== c) out.push({ k: "notCol", s, c: x });
    }
    if (m.rule === "trilha") {
      const st = stopOf(m, v), L = m.trail!.length;
      out.push({ k: "stop", s, n: st });
      for (let x = 0; x < L; x++) if (x !== st) out.push({ k: "notStop", s, n: x });
      for (let x = 0; x < st; x++) out.push({ k: "stopAfter", s, n: x });
      for (let x = st + 1; x < L; x++) out.push({ k: "stopBefore", s, n: x });
    }
    out.push({ k: "has", s, o: obj[s] });
    for (let o = 0; o < n; o++) if (o !== obj[s]) out.push({ k: "hasNot", s, o });
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    if (a === b) continue;
    if (m.rule === "trilha" && stopOf(m, pos[b]) === stopOf(m, pos[a]) + 1) out.push({ k: "next", a, b });
    if (m.rule === "equilibrio") out.push(rcOf(m, pos[a])[0] === rcOf(m, pos[b])[0] ? { k: "sameSide", a, b } : { k: "oppSide", a, b });
  }
  return out.filter((c) => evalClue(m, c, sol));
}

/** Peso de cada tipo de pista no sorteio. Afirmações diretas pesam menos nos capítulos difíceis. */
const BASE: Partial<Record<ClueKind, number>> = { stop: 0.7, stopAfter: 1.2, stopBefore: 1.2, size: 1.2, next: 1.5, sameSide: 1.5, oppSide: 1.5 };
/** O que cada dificuldade pede do caso (contado no passo a passo real). */
interface Tier { negatives: [number, number]; derived: number; relational: boolean }
const TIERS: Record<Difficulty, Tier> = {
  1: { negatives: [0, 1], derived: 1, relational: true },
  2: { negatives: [1, 2], derived: 3, relational: true },
  3: { negatives: [2, 3], derived: 5, relational: true },
  4: { negatives: [2, 4], derived: 6, relational: true },
};
export const MIN_CLUES = 5, MAX_CLUES = 7;
/**
 * No Zip a trilha tem mais paradas do que pessoas, então "não estava na parada 3" quase nunca fecha nada: a
 * dificuldade vem das pistas de ORDEM ("depois da 4ª parada", "logo depois de…"), não das negações.
 */
const tierOf = (m: Model, d: Difficulty): Tier => {
  const t = TIERS[d];
  // As conclusões pedidas são proporcionais ao tamanho do quadro (Sudoku e Astros têm 4 grades; Patches e Zip, 2).
  const derived = Math.ceil((t.derived * gridsOf(m).length) / 4);
  return m.rule === "trilha" ? { ...t, negatives: [Math.min(t.negatives[0], 1), t.negatives[1]], derived: Math.min(derived, 3) } : { ...t, derived };
};

/** Assinatura do caso (tipos das pistas): dois casos vizinhos não podem raciocinar igual. */
export const signature = (clues: Clue[]) => clues.filter((c) => !isRule(c)).map((c) => c.k).sort().join(",");
export const clueCount = (clues: Clue[]) => clues.filter((c) => !isRule(c)).length;

/**
 * Escolhe as pistas uma a uma, na ordem em que vão aparecer: cada uma precisa render pelo menos um ✓ novo.
 * Devolve null se não chegou à solução dentro do limite de pistas.
 */
function chooseClues(r: Rng, m: Model, sol: number[], favor: Partial<Record<ClueKind, number>>, d: Difficulty): Clue[] | null {
  const t = tierOf(m, d);
  const pool = candidates(m, sol).filter((c) => t.relational || !isRelational(c));
  let sv: SolverT = new Solver(m);
  const chosen: Clue[] = [];
  let negatives = 0;
  while (!sv.solved()) {
    if (chosen.length >= MAX_CLUES) return null;
    const left = MAX_CLUES - chosen.length;
    const options: { c: Clue; w: number; next: SolverT }[] = [];
    for (const c of pool) {
      if (chosen.includes(c)) continue;
      const neg = isNegative(c);
      if (neg && negatives >= t.negatives[1]) continue;
      const trial = sv.clone();
      const st = stepOf(trial, c, chosen.length);
      if (!st || !st.concl.length || trial.broken()) continue; // precisa abrir pelo menos um ✓ novo
      // Com poucas pistas sobrando, só vale o que ainda deixa chance de fechar o caso.
      const gain = st.concl.length;
      let w = (BASE[c.k] ?? 1) * (favor[c.k] ?? 1);
      if (!neg && d >= 3) w *= 0.6;
      if (neg && negatives < t.negatives[0]) w *= 2.5;
      // Dificuldades altas preferem pistas que desencadeiam mais conclusões pelo raciocínio.
      const chain = st.concl.filter((x) => x.why !== "pista").length;
      // Pistas que destravam mais conclusões fecham o caso em menos pistas (5 a 7, nunca uma lista de respostas).
      w *= (1 + gain) * (d >= 3 ? 1 + chain * 0.4 : 1);
      if (left <= 3) w *= 1 + gain;
      options.push({ c, w, next: trial });
    }
    if (!options.length) return null;
    const total = options.reduce((a, x) => a + x.w, 0);
    let x = r() * total;
    const choice = options.find((o) => (x -= o.w) <= 0) ?? options[options.length - 1];
    chosen.push(choice.c);
    if (isNegative(choice.c)) negatives++;
    sv = choice.next;
  }
  return chosen;
}

// ---------------------------------------------------------------- geração

export const REJECTS: Record<string, number> = {};
const rej = (k: string) => { REJECTS[k] = (REJECTS[k] ?? 0) + 1; };
const strip = (e: Ent): Ent => ({ label: e.label, ...(e.g ? { g: e.g } : {}), ...(e.icon ? { icon: e.icon } : {}) });

/** Confere um caso pronto: tudo o que o banco promete (usado pelo gerador e pelos testes). */
export function checkCase(d: Pick<CaseData, "model" | "clues" | "sol" | "difficulty">): string | null {
  const m = d.model, own = d.clues.filter((c) => !isRule(c)), n = m.people.length;
  if (own.length < MIN_CLUES || own.length > MAX_CLUES) return "quantidade";
  const res = runLogic(m, d.clues);
  if (!res.solved) return "chute";
  if (res.steps.some((s) => !s.concl.length)) return "passo-sem-conclusao"; // toda pista gera um ✓ novo
  if (res.place.some((v, i) => v !== d.sol[i]) || res.obj.some((o, i) => o !== d.sol[n + i])) return "resposta";
  const all = allAnswers(m);
  const ok = (cs: Clue[]) => all.filter((a) => cs.every((c) => evalClue(m, c, a))).length;
  if (ok(d.clues) !== 1) return "unica";
  for (let i = 0; i < d.clues.length; i++) if (!isRule(d.clues[i]) && ok(d.clues.filter((_, j) => j !== i)) === 1) return "dispensavel";
  // Todo personagem aparece em pelo menos uma pista (objetos podem sair pela última opção, à vista no quadro).
  const cited = new Set(own.flatMap((c) => ("s" in c ? [c.s] : "a" in c ? [c.a, c.b] : [])));
  if (cited.size < n) return "personagem-sem-pista";
  return null;
}

function attemptCase(game: JourneyGame, level: number, index: number, structure: StructureId, prev: CaseData | undefined, tries: number, next?: CaseData): CaseData | null {
  const rule = RULE_OF[game];
  const chapter = Math.ceil(level / LEVELS_PER_CHAPTER);
  const difficulty = difficultyOf(chapter);
  const st = STRUCTURES[structure];
  const story = STORIES[game][index];
  const { n, L } = layoutOf(rule, difficulty);
  const id = `${game}-${String(level).padStart(2, "0")}`;
  for (let attempt = 0; attempt < tries; attempt++) {
    const r = rngOf(`${id}#${structure}#${attempt}`);
    const place = buildScene(r, story, rule, L);
    if (!place) { rej("cenario"); continue; }
    const model: Model = { rule, people: castFor(game, index).slice(0, n).map((c) => ({ label: c.name, g: c.g })), objects: story.objects.slice(0, n).map(strip), ...place };
    const t = tierOf(model, difficulty);
    const P = posList(model);
    // O lugar precisa deixar dúvida (senão a regra sozinha resolve as posições), mas não demais.
    if (P.length < (n === 3 ? 4 : 6) || P.length * (n === 3 ? 6 : 24) > 42000) { rej("posicoes"); continue; }
    const sol = [...pick(r, P), ...pick(r, perms(n))];
    const picked = chooseClues(r, model, sol, st.favor, difficulty);
    if (!picked) { rej("pistas"); continue; }
    const clues: Clue[] = [{ k: "rule" }, ...picked];
    // Primeiro as conferências rápidas (forma e dificuldade); a prova por força bruta (checkCase) fica por último.
    if (picked.length < MIN_CLUES) { rej("quantidade"); continue; }
    const steps = runLogic(model, clues).steps;
    const negs = picked.filter(isNegative).length;
    if (negs < t.negatives[0]) { rej("poucas-negativas"); continue; }
    if (steps.flatMap((s) => s.concl).filter((c) => c.why !== "pista").length < t.derived) { rej("raso"); continue; }
    if (!st.need({ m: model, clues, steps, difficulty })) { rej(`forma:${structure}`); continue; }
    if (prev && (prev.structure === structure || signature(prev.clues) === signature(clues))) { rej("igual-anterior"); continue; }
    if (next && signature(next.clues) === signature(clues)) { rej("igual-seguinte"); continue; }
    const why = checkCase({ model, clues, sol, difficulty });
    if (why) { rej(why); continue; }
    return { id, game, level, chapter, difficulty, story: story.key, structure, model, clues, sol };
  }
  return null;
}

/** Gera um caso: tenta a estrutura da agenda e, se não couber, as outras da mesma dificuldade. */
export function generateCase(game: JourneyGame, level: number, index: number, prev?: CaseData): CaseData {
  const levels = caseLevels(game);
  // O caso seguinte escrito à mão (se houver) também não pode ter a mesma forma.
  const nextLevel = levels[index + 1];
  const next = nextLevel ? AUTHORED[`${game}-${String(nextLevel).padStart(2, "0")}`] : undefined;
  if (!STORIES[game][index]) throw new Error(`Falta a história ${index + 1} de ${game}`);
  const id = `${game}-${String(level).padStart(2, "0")}`;
  const authored = AUTHORED[id];
  if (authored) return authored;
  const rule = RULE_OF[game];
  const plan = structurePlan(game, rule, levels.map((l) => difficultyOf(Math.ceil(l / LEVELS_PER_CHAPTER))));
  const d = difficultyOf(Math.ceil(level / LEVELS_PER_CHAPTER));
  const order = [plan[index], ...poolOf(rule, d).filter((s) => s !== plan[index])].filter((s) => s !== prev?.structure && s !== next?.structure);
  for (const tries of [300, 2000]) for (const s of order) {
    const c = attemptCase(game, level, index, s, prev, tries, next);
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
