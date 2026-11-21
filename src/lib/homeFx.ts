// Efeitos de ambiente da arte do Início: onde ficam (em % da largura e da altura de cada arte).
// Para ajustar um ponto, mude o número aqui; o desenho e a animação ficam em HomeFx.tsx e globals.css ("Efeitos do Início").
//  • hex:   hexágonos com o símbolo da FAETERJ espalhados no céu — acendem e apagam, cada um no seu ritmo;
//  • gems:  os quatro cristais — brilho que "respira" devagar, na cor de cada jogo;
//  • stars: brilhos de estrela no céu que piscam (posições escolhidas longe dos textos e do botão);
//  • flies: área (em %) onde nascem os vaga-lumes que sobem devagar (grama e ilhas, como nas jornadas);
//  • mist:  altura (em %) da faixa de névoa que passa sobre as nuvens de baixo.

import type { JourneyGame } from "./journey";

export interface FxPoint { x: number; y: number }
export interface FxLayout { hex: FxPoint[]; gems: (FxPoint & { id: JourneyGame })[]; stars: FxPoint[]; flies: { x0: number; x1: number; y0: number; y1: number }; mist: number }

const pts = (list: [number, number][]): FxPoint[] => list.map(([x, y]) => ({ x, y }));

/** Arte do celular (944 × 1680). */
export const FX_MOBILE: FxLayout = {
  hex: pts([[24.2, 3], [57.3, 5.1], [65.7, 2.2], [50, 10.4], [78.6, 10.9], [16.7, 12.2], [93, 12.2], [33.5, 16], [98, 16.7], [2.3, 26], [95, 30], [6.4, 54.6], [95.9, 54.6], [41.4, 58.2]]),
  gems: [
    { id: "sudoku", x: 26, y: 21 }, { id: "zip", x: 71.5, y: 20.5 },
    { id: "tango", x: 17.5, y: 47 }, { id: "patches", x: 79.5, y: 48 },
  ],
  stars: pts([[3, 9], [36, 4], [44, 13], [70, 14], [97, 7], [4, 31], [97, 37], [2, 47], [55, 26], [93, 64], [30, 57], [70, 59]]),
  flies: { x0: 2, x1: 98, y0: 60, y1: 95 },
  mist: 66,
};

/** Arte do computador (2196 × 1236). */
export const FX_DESKTOP: FxLayout = {
  hex: pts([[21.8, 5.6], [41.1, 6.9], [61.5, 4.9], [76.5, 8.4], [3.6, 31.6], [23.6, 38], [74.6, 31.1], [97.7, 31.6]]),
  gems: [
    { id: "sudoku", x: 36.5, y: 15.5 }, { id: "zip", x: 62, y: 14.5 },
    { id: "tango", x: 33, y: 59.5 }, { id: "patches", x: 66, y: 61.5 },
  ],
  stars: pts([[15, 3], [17, 22], [33, 30], [47, 5], [53, 24], [76, 18], [86, 4], [66, 30], [82, 38], [97, 45], [42, 72], [57, 73]]),
  flies: { x0: 1, x1: 99, y0: 68, y1: 98 },
  mist: 68,
};
