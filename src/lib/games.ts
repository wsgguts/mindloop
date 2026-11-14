import { isComplete, type JourneyGame } from "./journey";

// Dados de apresentação de cada jogo, num lugar só (Início, jornada, partida e tela de parabéns).
// color: cor do jogo (cristais concluídos); cur: cristal do nível atual na trilha (precisa contrastar com color).
export interface GameMeta { name: string; text: string; color: string; cur?: string }

export const GAME_META: Record<JourneyGame, GameMeta> = {
  sudoku: { name: "Mini Sudoku", text: "Complete a grade sem repetir números.", color: "#F05BC8" },
  zip: { name: "Zip", text: "Ligue os números em ordem, passando por todas as casas.", color: "#12CFE0" },
  tango: { name: "Tango", text: "Equilibre Cristais e Orbes em cada linha e coluna.", color: "#FFB020", cur: "#8CF0FF" },
  patches: { name: "Patches", text: "Encaixe peças retangulares até cobrir toda a grade.", color: "#9A6BFF" },
  astros: { name: "Astros", text: "Um astro por linha, coluna e constelação — sem nenhum se encostar.", color: "#FFC93C", cur: "#F05BC8" },
};

/** Os 4 jogos principais (ranking e as conquistas "dos 4 jogos"). */
export const ALL_GAMES: JourneyGame[] = ["sudoku", "zip", "tango", "patches"];
/** Jogo bônus: liberado só depois de completar as 4 jornadas principais (ou no Modo Administrador). */
export const BONUS_GAME = "astros" as const satisfies JourneyGame;
/** Todos os jogos, incluindo o bônus (progresso, histórico, investigações, sincronização). */
export const EVERY_GAME: JourneyGame[] = [...ALL_GAMES, BONUS_GAME];
export const isMainGame = (g: JourneyGame): boolean => g !== BONUS_GAME;

/** O jogo bônus abre quando as 4 jornadas principais estão completas (100 níveis cada). */
export const bonusUnlocked = (progress: Record<JourneyGame, string>): boolean => ALL_GAMES.every((g) => isComplete(progress[g]));
/** Jogos visíveis agora (o bônus aparece quando liberado ou no Modo Administrador). */
export const visibleGames = (open: boolean): JourneyGame[] => (open ? EVERY_GAME : ALL_GAMES);
