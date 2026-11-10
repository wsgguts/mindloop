// Estatísticas e médias de desempenho (funções puras sobre o histórico e o progresso).
// Regras:
// - Só vitórias entram no histórico: partidas abandonadas ou inválidas nunca contam como concluídas.
// - Tempos de jogos diferentes nunca são somados entre si: cada jogo tem as próprias médias em tempo.
//   O que dá para comparar entre jogos é o RITMO (tempo de referência do nível ÷ tempo gasto):
//   100% = terminou exatamente no tempo de referência; 150% = 1,5× mais rápido que ela.
// - Médias só aparecem a partir de MIN_MATCHES partidas (antes disso a tela explica que falta jogar).

import { ALL_GAMES } from "./games";
import { type Match, type PlayerLog, dayKey, distinctDays } from "./history";
import { LEVELS_PER_GAME, doneCount, isComplete, type JourneyGame } from "./journey";
import { refMs } from "./scoring";

export const MIN_MATCHES = 3;

/** Ritmo sem teto (para médias e evolução): referência ÷ tempo. */
export const speedOf = (m: Pick<Match, "game" | "level" | "ms">): number => refMs(m.game, m.level) / m.ms;

const mean = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Ordem cronológica: importados primeiro (sem data), depois por data. */
const chrono = (ms: Match[]): Match[] => [...ms].sort((a, b) => (a.at ?? -1) - (b.at ?? -1));

/** Evolução: ritmo médio das 5 vitórias mais recentes menos o das 5 anteriores (precisa de 6+ partidas). */
export function trendOf(matches: Match[]): number | null {
  const s = chrono(matches).map(speedOf);
  if (s.length < 6) return null;
  const last = s.slice(-5), prev = s.slice(-10, -5);
  return mean(last)! - mean(prev)!;
}

export interface GameStats {
  game: JourneyGame;
  matches: number;
  levelsDone: number;
  complete: boolean;
  avgMs: number | null;
  bestMs: number | null;
  bestLevel: number | null; // nível do melhor tempo
  avgSpeed: number | null;
  records: number;
  trend: number | null;
  /** Últimas 12 vitórias (para o gráfico de evolução). */
  recent: { level: number; ms: number; speed: number; at: number | null }[];
  /** Partidas iniciadas por vitória (desde que o histórico existe); null sem dados suficientes. */
  attemptsPerWin: number | null;
}

export function gameStats(game: JourneyGame, log: PlayerLog, progress: string): GameStats {
  const ms = log.matches.filter((m) => m.game === game);
  const enough = ms.length >= MIN_MATCHES;
  let best: Match | null = null;
  for (const m of ms) if (!best || m.ms < best.ms) best = m;
  const tracked = ms.filter((m) => m.at !== null).length; // vitórias desde que as partidas iniciadas são contadas
  return {
    game,
    matches: ms.length,
    levelsDone: doneCount(progress),
    complete: isComplete(progress),
    avgMs: enough ? mean(ms.map((m) => m.ms)) : null,
    bestMs: best?.ms ?? null,
    bestLevel: best?.level ?? null,
    avgSpeed: enough ? mean(ms.map(speedOf)) : null,
    records: ms.filter((m) => m.record).length,
    trend: trendOf(ms),
    recent: chrono(ms).slice(-12).map((m) => ({ level: m.level, ms: m.ms, speed: speedOf(m), at: m.at })),
    attemptsPerWin: tracked >= MIN_MATCHES && log.starts[game] >= tracked ? log.starts[game] / tracked : null,
  };
}

export interface OverallStats {
  matches: number;
  levelsDone: number;
  totalLevels: number;
  completion: number; // 0..1 das 4 jornadas
  journeysDone: number;
  avgSpeed: number | null;
  records: number;
  days: number;
  trend: number | null;
  bestStreak: number;
  /** Vitórias por dia nos últimos 14 dias (do mais antigo para hoje). */
  activity: { day: string; label: string; count: number }[];
}

export function overallStats(log: PlayerLog, progress: Record<JourneyGame, string>, now = Date.now()): OverallStats {
  const levelsDone = ALL_GAMES.reduce((a, g) => a + doneCount(progress[g]), 0);
  const totalLevels = ALL_GAMES.length * LEVELS_PER_GAME;
  const perDay = new Map<string, number>();
  for (const m of log.matches) if (m.at !== null) perDay.set(dayKey(m.at), (perDay.get(dayKey(m.at)) ?? 0) + 1);
  const activity = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (13 - i));
    const key = dayKey(d.getTime());
    return { day: key, label: `${d.getDate()}/${d.getMonth() + 1}`, count: perDay.get(key) ?? 0 };
  });
  return {
    matches: log.matches.length,
    levelsDone,
    totalLevels,
    completion: levelsDone / totalLevels,
    journeysDone: ALL_GAMES.filter((g) => isComplete(progress[g])).length,
    avgSpeed: log.matches.length >= MIN_MATCHES ? mean(log.matches.map(speedOf)) : null,
    records: log.matches.filter((m) => m.record).length,
    days: distinctDays(log.matches),
    trend: trendOf(log.matches),
    bestStreak: log.bestStreak,
    activity,
  };
}

/** 1.234 → "123%" (ritmo em porcentagem do tempo de referência). */
export const pct = (x: number): string => `${Math.round(x * 100)}%`;
