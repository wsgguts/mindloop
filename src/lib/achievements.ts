// Conquistas e medalhas. Cada conquista é uma linha declarativa: um valor calculado a partir dos dados reais
// (histórico de partidas + progresso das jornadas) e uma meta. Desbloqueia quando valor ≥ meta.
// Para criar uma conquista nova basta acrescentar um item em ACHIEVEMENTS (o id nunca deve mudar depois de
// publicado, pois é ele que fica salvo no aparelho com a data de obtenção).

import { ALL_GAMES, GAME_META } from "./games";
import { type Match, type PlayerLog, bestSession, distinctDays } from "./history";
import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, doneCount, type JourneyGame } from "./journey";
import { refMs } from "./scoring";
import { type CaseLog, goldCount, solvedCount, xpTotal } from "./cases/progress";
import { CASES_DATA } from "./cases/data";

export type Rarity = "bronze" | "prata" | "ouro" | "diamante";
export type Category = "tempo" | "jornada" | "jogo" | "constancia" | "investigacao" | "especial";

export const RARITY_LABEL: Record<Rarity, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro", diamante: "Diamante" };
export const CATEGORY_LABEL: Record<Category, string> = {
  tempo: "Tempo", jornada: "Jornadas", jogo: "Por jogo", constancia: "Constância", investigacao: "Investigação", especial: "Especiais",
};
export const CATEGORIES: Category[] = ["tempo", "jornada", "jogo", "constancia", "investigacao", "especial"];

export interface AchCtx {
  log: PlayerLog;
  progress: Record<JourneyGame, string>;
  /** Mistérios do Mindloop Investigação (opcional: sem ele, as conquistas de investigação ficam em 0). */
  cases?: CaseLog;
  /** Medalhas já obtidas, sem contar as de "colecionar medalhas" (evita contagem circular). */
  medals: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category: Category;
  rarity: Rarity;
  game?: JourneyGame;
  target: number;
  /** Unidade do progresso ("fases", "dias"…), para "32/50 fases". */
  unit: string;
  value: (c: AchCtx) => number;
  /** Conta medalhas: avaliada depois das demais. */
  meta?: boolean;
}

// ---- Medidas (pequenas e reutilizáveis) ----
export const SPEED_MENTAL_MS = 3 * 60_000;
export const LIGHTNING_MS = 60_000;
/** "Mente Relâmpago" só vale a partir deste nível: nas grades 4×4 iniciais, 1 minuto é fácil demais. */
export const LIGHTNING_FROM_LEVEL = 21;
export const NO_HINT_FROM_LEVEL = 1;

const totalDone = (c: AchCtx) => ALL_GAMES.reduce((a, g) => a + doneCount(c.progress[g]), 0);
const wins = (c: AchCtx, g?: JourneyGame) => (g ? c.log.matches.filter((m) => m.game === g).length : c.log.matches.length);
const any = (c: AchCtx, f: (m: Match) => boolean) => (c.log.matches.some(f) ? 1 : 0);
const records = (c: AchCtx) => c.log.matches.filter((m) => m.record).length;
/** Níveis diferentes (jogo + nível) concluídos dentro do tempo de referência. */
const underRef = (c: AchCtx) => new Set(c.log.matches.filter((m) => m.ms <= refMs(m.game, m.level)).map((m) => `${m.game}-${m.level}`)).size;
const cases = (c: AchCtx, g?: JourneyGame) => (c.cases ? solvedCount(c.cases, g) : 0);
const golds = (c: AchCtx) => (c.cases ? goldCount(c.cases) : 0);
const quickCase = (c: AchCtx) => (c.cases?.history.some((s) => s.ms <= QUICK_CASE_MS) ? 1 : 0);
export const QUICK_CASE_MS = 60_000;
const maxDone = (c: AchCtx) => Math.max(...ALL_GAMES.map((g) => doneCount(c.progress[g])));

// ---- Alto desempenho e esforço maior ----
/** "Mente Independente" e "Desafio Final" contam a partir destes níveis (as fases iniciais são fáceis demais). */
export const INDEPENDENT_FROM_LEVEL = 21;
export const FINAL_FROM_LEVEL = 91;
/** "Lupa Relâmpago": mistério Avançado ou Mestre resolvido sem dicas neste tempo. */
export const QUICK_HARD_CASE_MS = 120_000;
/** Fases diferentes (jogo + nível) concluídas sem nenhuma dica, a partir de um nível. */
const noHintLevels = (c: AchCtx, from: number) => new Set(c.log.matches.filter((m) => m.hints === 0 && m.level >= from).map((m) => `${m.game}-${m.level}`)).size;
const journeysWith = (c: AchCtx, n: number) => ALL_GAMES.filter((g) => doneCount(c.progress[g]) >= n).length;
// Investigação: metadados de cada mistério (estrutura de raciocínio e dificuldade) vêm do banco.
const CASE_META = new Map(CASES_DATA.map((d) => [d.id, d]));
const solvedRecs = (c: AchCtx) => Object.entries(c.cases?.records ?? {}).filter(([id, r]) => r.solvedAt !== null && CASE_META.has(id));
const structuresSolved = (c: AchCtx) => new Set(solvedRecs(c).map(([id]) => CASE_META.get(id)!.structure)).size;
const eliteGolds = (c: AchCtx) => solvedRecs(c).filter(([id, r]) => r.bestHints === 0 && CASE_META.get(id)!.difficulty === 4).length;
const gamesWithCase = (c: AchCtx) => ALL_GAMES.filter((g) => cases(c, g) > 0).length;
const fullBooks = (c: AchCtx) => ALL_GAMES.filter((g) => cases(c, g) >= CASES_DATA.filter((d) => d.game === g).length).length;
const quickHardCase = (c: AchCtx) => (c.cases?.history.some((s) => s.hints === 0 && s.ms <= QUICK_HARD_CASE_MS && (CASE_META.get(s.id)?.difficulty ?? 0) >= 3) ? 1 : 0);
const caseXp = (c: AchCtx) => (c.cases ? xpTotal(c.cases) : 0);

const perGame: Achievement[] = ALL_GAMES.flatMap((g): Achievement[] => {
  const n = GAME_META[g].name;
  return [
    { id: `${g}-primeiro`, title: "Primeiro Desafio", desc: `Conclua sua primeira partida de ${n}.`, category: "jogo", rarity: "bronze", game: g, target: 1, unit: "partida", value: (c) => wins(c, g) },
    { id: `${g}-especialista`, title: "Especialista", desc: `Conclua 10 partidas de ${n}.`, category: "jogo", rarity: "prata", game: g, target: 10, unit: "partidas", value: (c) => wins(c, g) },
    { id: `${g}-persistencia`, title: "Persistência", desc: `Conclua 25 partidas de ${n}.`, category: "jogo", rarity: "prata", game: g, target: 25, unit: "partidas", value: (c) => wins(c, g) },
    { id: `${g}-mestre`, title: "Mestre do Jogo", desc: `Chegue à metade da jornada de ${n}: 50 níveis concluídos.`, category: "jogo", rarity: "ouro", game: g, target: 50, unit: "níveis", value: (c) => doneCount(c.progress[g]) },
  ];
});

export const ACHIEVEMENTS: Achievement[] = [
  // A) Tempo
  { id: "primeiro-cronometro", title: "Primeiro Cronômetro", desc: "Conclua sua primeira fase.", category: "tempo", rarity: "bronze", target: 1, unit: "fase", value: (c) => wins(c) },
  { id: "velocidade-mental", title: "Velocidade Mental", desc: "Conclua uma fase em até 3 minutos.", category: "tempo", rarity: "bronze", target: 1, unit: "fase", value: (c) => any(c, (m) => m.ms <= SPEED_MENTAL_MS) },
  { id: "mente-relampago", title: "Mente Relâmpago", desc: `Conclua uma fase a partir do nível ${LIGHTNING_FROM_LEVEL} em até 1 minuto.`, category: "tempo", rarity: "prata", target: 1, unit: "fase", value: (c) => any(c, (m) => m.level >= LIGHTNING_FROM_LEVEL && m.ms <= LIGHTNING_MS) },
  { id: "contra-o-relogio", title: "Contra o Relógio", desc: "Bata um recorde pessoal: jogue de novo um nível e termine mais rápido.", category: "tempo", rarity: "bronze", target: 1, unit: "recorde", value: records },
  { id: "mestre-velocidade", title: "Mestre da Velocidade", desc: "Conclua 10 fases diferentes dentro do tempo de referência delas.", category: "tempo", rarity: "ouro", target: 10, unit: "fases", value: underRef },
  { id: "desafio-final", title: "Desafio Final", desc: `Conclua uma fase a partir do nível ${FINAL_FROM_LEVEL} dentro do tempo de referência dela.`, category: "tempo", rarity: "ouro", target: 1, unit: "fase", value: (c) => any(c, (m) => m.level >= FINAL_FROM_LEVEL && m.ms <= refMs(m.game, m.level)) },
  { id: "mente-afiada", title: "Mente Afiada", desc: "Conclua 30 fases diferentes dentro do tempo de referência delas.", category: "tempo", rarity: "diamante", target: 30, unit: "fases", value: underRef },
  // B) Jornadas
  { id: "primeiros-passos", title: "Primeiros Passos", desc: "Conclua a primeira fase de uma jornada.", category: "jornada", rarity: "bronze", target: 1, unit: "fase", value: totalDone },
  { id: "explorador", title: "Explorador", desc: `Desbloqueie um novo capítulo: conclua os ${LEVELS_PER_CHAPTER} primeiros níveis de uma jornada.`, category: "jornada", rarity: "bronze", target: LEVELS_PER_CHAPTER, unit: "níveis", value: maxDone },
  { id: "caminho-percorrido", title: "Caminho Percorrido", desc: "Conclua 10 fases (somando todas as jornadas).", category: "jornada", rarity: "bronze", target: 10, unit: "fases", value: totalDone },
  { id: "grande-jornada", title: "Grande Jornada", desc: "Conclua 25 fases.", category: "jornada", rarity: "prata", target: 25, unit: "fases", value: totalDone },
  { id: "mestre-jornadas", title: "Mestre das Jornadas", desc: "Conclua 50 fases.", category: "jornada", rarity: "ouro", target: 50, unit: "fases", value: totalDone },
  { id: "lenda-mindloop", title: "Lenda MindLoop", desc: "Conclua 100 fases.", category: "jornada", rarity: "diamante", target: 100, unit: "fases", value: totalDone },
  { id: "explorador-versatil", title: "Explorador Versátil", desc: `Conclua o primeiro capítulo (${LEVELS_PER_CHAPTER} níveis) das 4 jornadas.`, category: "jornada", rarity: "prata", target: ALL_GAMES.length, unit: "jornadas", value: (c) => journeysWith(c, LEVELS_PER_CHAPTER) },
  { id: "meio-caminho", title: "Meio Caminho em Tudo", desc: "Chegue à metade das 4 jornadas: 50 níveis em cada uma.", category: "jornada", rarity: "ouro", target: ALL_GAMES.length, unit: "jornadas", value: (c) => journeysWith(c, LEVELS_PER_GAME / 2) },
  { id: "quatro-jornadas", title: "Senhor dos Quatro Mundos", desc: `Conclua as 4 jornadas inteiras: todos os ${LEVELS_PER_GAME * ALL_GAMES.length} níveis.`, category: "jornada", rarity: "diamante", target: LEVELS_PER_GAME * ALL_GAMES.length, unit: "níveis", value: totalDone },
  // C) Por jogo (4 por jogo)
  ...perGame,
  // D) Constância
  { id: "constancia", title: "Constância", desc: "Jogue em 3 dias diferentes.", category: "constancia", rarity: "bronze", target: 3, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "dedicacao", title: "Dedicação", desc: "Jogue em 7 dias diferentes.", category: "constancia", rarity: "prata", target: 7, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "comprometimento", title: "Comprometimento", desc: "Jogue em 15 dias diferentes.", category: "constancia", rarity: "ouro", target: 15, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "sem-desistir", title: "Sem Desistir", desc: "Conclua 5 partidas seguidas, sem abandonar nenhuma no meio.", category: "constancia", rarity: "prata", target: 5, unit: "seguidas", value: (c) => c.log.bestStreak },
  { id: "habito-de-mestre", title: "Hábito de Mestre", desc: "Jogue em 30 dias diferentes.", category: "constancia", rarity: "diamante", target: 30, unit: "dias", value: (c) => distinctDays(c.log.matches) },
  { id: "inabalavel", title: "Inabalável", desc: "Conclua 20 partidas seguidas, sem abandonar nenhuma no meio.", category: "constancia", rarity: "ouro", target: 20, unit: "seguidas", value: (c) => c.log.bestStreak },
  { id: "maratona-mental", title: "Maratona Mental", desc: "Conclua 10 fases numa mesma sessão (até 30 min entre uma vitória e outra).", category: "constancia", rarity: "ouro", target: 10, unit: "fases", value: (c) => bestSession(c.log.matches) },
  // E) Investigação (mistérios opcionais entre as fases)
  { id: "inv-primeira-pista", title: "Primeira Pista", desc: "Resolva seu primeiro mistério do Mindloop Investigação.", category: "investigacao", rarity: "bronze", target: 1, unit: "mistério", value: (c) => cases(c) },
  { id: "inv-olho-rapido", title: "Olho Rápido", desc: "Resolva um mistério em até 1 minuto.", category: "investigacao", rarity: "bronze", target: 1, unit: "mistério", value: quickCase },
  { id: "inv-detetive", title: "Detetive", desc: "Resolva 10 mistérios.", category: "investigacao", rarity: "prata", target: 10, unit: "mistérios", value: (c) => cases(c) },
  { id: "inv-deducao-pura", title: "Dedução Pura", desc: "Resolva 5 mistérios diferentes sem pedir nenhuma dica.", category: "investigacao", rarity: "prata", target: 5, unit: "mistérios", value: golds },
  { id: "inv-detetive-experiente", title: "Detetive Experiente", desc: "Resolva 30 mistérios.", category: "investigacao", rarity: "ouro", target: 30, unit: "mistérios", value: (c) => cases(c) },
  { id: "inv-lupa-de-ouro", title: "Coleção de Lupas", desc: "Resolva 20 mistérios diferentes sem pedir nenhuma dica.", category: "investigacao", rarity: "ouro", target: 20, unit: "mistérios", value: golds },
  { id: "inv-mestre", title: "Mestre Investigador", desc: "Resolva 80 mistérios.", category: "investigacao", rarity: "diamante", target: 80, unit: "mistérios", value: (c) => cases(c) },
  { id: "inv-quatro-jogos", title: "Detetive Completo", desc: "Resolva pelo menos um mistério em cada um dos 4 jogos.", category: "investigacao", rarity: "prata", target: ALL_GAMES.length, unit: "jogos", value: gamesWithCase },
  { id: "inv-xp-1000", title: "Mil Pistas", desc: "Acumule 1.000 XP em investigações.", category: "investigacao", rarity: "prata", target: 1000, unit: "XP", value: caseXp },
  { id: "inv-raciocinio-versatil", title: "Raciocínio Versátil", desc: "Resolva mistérios de 8 estruturas de raciocínio diferentes (exclusão, cruzamento, contradição…).", category: "investigacao", rarity: "ouro", target: 8, unit: "estruturas", value: structuresSolved },
  { id: "inv-lupa-relampago", title: "Lupa Relâmpago", desc: "Resolva um mistério Avançado ou Mestre em até 2 minutos, sem pedir dicas.", category: "investigacao", rarity: "ouro", target: 1, unit: "mistério", value: quickHardCase },
  { id: "inv-xp-5000", title: "Arquivo Vivo", desc: "Acumule 5.000 XP em investigações.", category: "investigacao", rarity: "ouro", target: 5000, unit: "XP", value: caseXp },
  { id: "inv-caderno-completo", title: "Caderno Completo", desc: "Resolva todos os mistérios de um dos jogos.", category: "investigacao", rarity: "ouro", target: 1, unit: "caderno", value: fullBooks },
  { id: "inv-elite", title: "Detetive de Elite", desc: "Resolva 5 mistérios de dificuldade Mestre sem pedir nenhuma dica.", category: "investigacao", rarity: "diamante", target: 5, unit: "mistérios", value: eliteGolds },
  { id: "inv-todos", title: "Nenhum Mistério Sem Solução", desc: `Resolva todos os ${CASES_DATA.length} mistérios do Mindloop Investigação.`, category: "investigacao", rarity: "diamante", target: CASES_DATA.length, unit: "mistérios", value: (c) => cases(c) },
  ...ALL_GAMES.map((g): Achievement => ({ id: `inv-${g}`, title: "Caso Encerrado", desc: `Resolva 5 mistérios de ${GAME_META[g].name}.`, category: "investigacao", rarity: "prata", game: g, target: 5, unit: "mistérios", value: (c) => cases(c, g) })),
  // F) Especiais
  { id: "sem-dicas", title: "Por Conta Própria", desc: "Conclua uma fase sem pedir nenhuma dica.", category: "especial", rarity: "bronze", target: 1, unit: "fase", value: (c) => any(c, (m) => m.hints === 0 && m.level >= NO_HINT_FROM_LEVEL) },
  { id: "mente-independente", title: "Mente Independente", desc: `Conclua 25 fases diferentes a partir do nível ${INDEPENDENT_FROM_LEVEL} sem pedir nenhuma dica.`, category: "especial", rarity: "ouro", target: 25, unit: "fases", value: (c) => noHintLevels(c, INDEPENDENT_FROM_LEVEL) },
  { id: "todos-os-jogos", title: "Mente Versátil", desc: "Conclua pelo menos uma partida de cada um dos 4 jogos.", category: "especial", rarity: "prata", target: ALL_GAMES.length, unit: "jogos", value: (c) => ALL_GAMES.filter((g) => wins(c, g) > 0).length },
  { id: "cacador-recordes", title: "Caçador de Recordes", desc: "Bata 10 recordes pessoais.", category: "especial", rarity: "ouro", target: 10, unit: "recordes", value: records },
  { id: "jornada-completa", title: "Jornada Completa", desc: `Conclua todos os ${LEVELS_PER_GAME} níveis de uma jornada.`, category: "especial", rarity: "diamante", target: LEVELS_PER_GAME, unit: "níveis", value: maxDone },
  { id: "colecionador", title: "Colecionador", desc: "Conquiste 10 medalhas.", category: "especial", rarity: "ouro", target: 10, unit: "medalhas", value: (c) => c.medals, meta: true },
  { id: "galeria-lendaria", title: "Galeria Lendária", desc: "Conquiste 25 medalhas.", category: "especial", rarity: "diamante", target: 25, unit: "medalhas", value: (c) => c.medals, meta: true },
  { id: "lenda-das-medalhas", title: "Lenda das Medalhas", desc: "Conquiste 50 medalhas.", category: "especial", rarity: "diamante", target: 50, unit: "medalhas", value: (c) => c.medals, meta: true },
];

export const ACH_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Conquistas obtidas: id → data (ms) da obtenção. */
export type Unlocked = Record<string, number>;
export const ACH_KEY = "mindloop:achievements";

export function parseUnlocked(raw: string | null): Unlocked | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const out: Unlocked = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) if (ACH_BY_ID.has(k) && typeof v === "number" && Number.isFinite(v)) out[k] = v;
    return out;
  } catch { return null; }
}

const countMedals = (u: Unlocked) => Object.keys(u).filter((id) => !ACH_BY_ID.get(id)?.meta).length;

/**
 * Confere todas as conquistas. Devolve o mapa atualizado e as recém-obtidas (na ordem da lista).
 * Conquista já obtida nunca é perdida nem obtida de novo (sem duplicidade).
 */
export function evaluate(ctx: Omit<AchCtx, "medals">, unlocked: Unlocked, now: number): { unlocked: Unlocked; fresh: Achievement[] } {
  const next: Unlocked = { ...unlocked };
  const fresh: Achievement[] = [];
  const pass = (meta: boolean) => {
    const c: AchCtx = { ...ctx, medals: countMedals(next) };
    for (const a of ACHIEVEMENTS) {
      if (!!a.meta !== meta || next[a.id] !== undefined) continue;
      if (a.value(c) >= a.target) { next[a.id] = now; fresh.push(a); }
    }
  };
  pass(false);
  pass(true);
  return { unlocked: next, fresh };
}

/** Progresso para a tela: valor atual (limitado à meta) e fração 0..1. */
export function progressOf(a: Achievement, ctx: Omit<AchCtx, "medals">, unlocked: Unlocked): { value: number; frac: number } {
  const v = Math.min(a.target, a.value({ ...ctx, medals: countMedals(unlocked) }));
  return { value: v, frac: v / a.target };
}
