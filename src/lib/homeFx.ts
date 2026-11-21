// Efeitos de ambiente da arte do Início: onde ficam (em % da largura e da altura de cada arte).
// Para ajustar um ponto, mude o número aqui; o desenho e a animação ficam em HomeFx.tsx e globals.css ("Efeitos do Início").
//  • hex:   hexágonos com o símbolo da FAETERJ espalhados no céu — acendem e apagam, cada um no seu ritmo;
//  • gems:  os cinco cristais — brilho que "respira" devagar, na cor de cada jogo;
//  • stars: brilhos de estrela no céu que piscam (posições escolhidas longe dos textos e do botão);
//  • flies: área (em %) onde nascem os vaga-lumes que sobem devagar (grama e ilhas, como nas jornadas);
//  • mist:  altura (em %) da faixa de névoa que passa sobre as nuvens de baixo.

import type { JourneyGame } from "./journey";

export interface FxPoint { x: number; y: number }
export interface FxLayout { hex: FxPoint[]; gems: (FxPoint & { id: JourneyGame })[]; stars: FxPoint[]; flies: { x0: number; x1: number; y0: number; y1: number }; mist: number }

const pts = (list: [number, number][]): FxPoint[] => list.map(([x, y]) => ({ x, y }));

/** Arte do celular (944 × 1680). */
export const FX_MOBILE: FxLayout = {
  hex: pts([[10.1, 2.4], [40.8, 15.4], [7.6, 27.1], [89.3, 25.7], [24.8, 46], [74.2, 44.4], [80.2, 49.2]]),
  gems: [
    { id: "sudoku", x: 25.4, y: 18.5 }, { id: "zip", x: 72, y: 17.3 }, { id: "tango", x: 16.4, y: 34.2 },
    { id: "patches", x: 82.1, y: 34.5 }, { id: "astros", x: 48.9, y: 45.7 },
  ],
  stars: pts([[4, 10], [22, 12.5], [56, 13], [93, 15], [30, 27], [62, 25.5], [5, 40], [95, 41], [38, 51], [67, 53], [12, 52], [88, 58]]),
  flies: { x0: 2, x1: 98, y0: 55, y1: 95 },
  mist: 72,
};

/** Arte do computador (1776 × 896). */
export const FX_DESKTOP: FxLayout = {
  hex: pts([[45.3, 16.4], [30.4, 32.9], [17.3, 39.1], [67.2, 30.9], [80.2, 29.4], [71.6, 49.8], [89.3, 52.5], [38, 60.3], [60.4, 58], [27.5, 58], [45.8, 69.8]]),
  gems: [
    { id: "sudoku", x: 38.3, y: 21.2 }, { id: "zip", x: 59.1, y: 19.5 }, { id: "tango", x: 33.2, y: 43 },
    { id: "patches", x: 64.2, y: 43.5 }, { id: "astros", x: 48.9, y: 60.3 },
  ],
  stars: pts([[12, 6], [26, 14], [34, 4], [52, 9], [70, 6], [76, 18], [58, 34], [22, 24], [86, 40], [53, 47], [40, 48], [95, 22]]),
  flies: { x0: 1, x1: 99, y0: 62, y1: 98 },
  mist: 78,
};
