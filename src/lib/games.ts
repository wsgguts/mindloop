import type { JourneyGame } from "./journey";

// Dados de apresentação de cada jogo, num lugar só (Início, jornada, partida e tela de parabéns).
// color: cor do jogo (cristais concluídos); cur: cristal do nível atual na trilha (precisa contrastar com color).
export interface GameMeta { name: string; text: string; color: string; cur?: string }

export const GAME_META: Record<JourneyGame, GameMeta> = {
  sudoku: { name: "Mini Sudoku", text: "Complete a grade sem repetir números.", color: "#F05BC8" },
  zip: { name: "Zip", text: "Ligue os números em ordem, passando por todas as casas.", color: "#12CFE0" },
  tango: { name: "Tango", text: "Equilibre Cristais e Orbes em cada linha e coluna.", color: "#FFB020", cur: "#8CF0FF" },
  patches: { name: "Patches", text: "Encaixe peças retangulares até cobrir toda a grade.", color: "#9A6BFF" },
};

export const ALL_GAMES: JourneyGame[] = ["sudoku", "zip", "tango", "patches"];
