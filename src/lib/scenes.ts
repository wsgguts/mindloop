// Os 10 mundos das jornadas — COMPARTILHADOS pelos quatro jogos.
// Capítulo N (níveis 10N−9 a 10N) acontece sempre no mundo N, em qualquer jogo.
//
// Cada mundo tem a PRÓPRIA PINTURA (public/journeys/, 900 × 1600; originais em art/journeys/), com a trilha de
// pedras subindo até o castelo, e as 10 posições das fases medidas sobre o caminho dessa pintura.
// Como um mundo é montado (de baixo para cima, componente JourneyScene):
//   1. a pintura do mundo — a mesma nos 4 jogos;
//   2. a IDENTIDADE DO JOGO: os cristais pintados recebem a cor do jogo, a luz do céu/castelo ganha o tom do jogo
//      e as partículas do mundo (vagalumes, neve, brasas, areia…) vêm na paleta do jogo (GAME_LOOK);
//   3. os botões das fases (Journey), nas posições medidas.
// Assim o mesmo mundo é reconhecível nos 4 jogos; só as cores de luz, cristais e partículas mudam.
//
// Sem pintura própria (`art`), um mundo é desenhado sobre a trilha original com gradação de cor e um cenário
// vetorial (`decor`) — recurso mantido para mundos futuros. Coordenadas sempre em px da pintura (900 × 1600).

import type { JourneyGame } from "./journey";
import { TRAIL, TRAIL_IMAGE, type TrailPoint } from "./trail";

// ---------- Identidade visual de cada jogo (tirada do próprio projeto) ----------
// main: cor do jogo (GAME_META); light/deep e partículas: cores que o jogo já usa no tabuleiro.
//  - Mini Sudoku: magenta do cristal do jogo, com o dourado dos destaques.
//  - Zip: ciano do cristal; o caminho desenhado é violeta e a vitória faz ciano → magenta → dourado.
//  - Tango: âmbar do Cristal e violeta do Orbe (os dois símbolos do jogo).
//  - Patches: violeta do jogo e as cores das peças (paleta multicolorida do tabuleiro).
export interface GameLook { main: string; light: string; deep: string; particles: string[] }
export const GAME_LOOK: Record<JourneyGame, GameLook> = {
  sudoku: { main: "#F05BC8", light: "#FFB3EA", deep: "#8E1A6E", particles: ["#F05BC8", "#FFB3EA", "#FFD23F"] },
  zip: { main: "#12CFE0", light: "#A6F6FF", deep: "#762CEB", particles: ["#12CFE0", "#A6F6FF", "#F05BC8"] },
  tango: { main: "#FFB020", light: "#FFE08A", deep: "#8E52F5", particles: ["#FFB020", "#FFE08A", "#8E52F5"] },
  patches: { main: "#9A6BFF", light: "#C9B8EC", deep: "#4A16A8", particles: ["#F05BC8", "#12CFE0", "#FFD23F", "#4FD6B1", "#9A6BFF"] },
};

/** Cristais da pintura da trilha: recebem a cor do jogo (mesma composição, brilho do jogo). */
export const PAINTED_CRYSTALS: [number, number, number][] = [
  // x, y, raio (px da pintura)
  [290, 1290, 70], [270, 715, 45], [425, 900, 45], [735, 885, 40], [805, 1060, 40],
  [825, 735, 40], [745, 1395, 40], [850, 180, 22], [172, 362, 26], [732, 212, 22],
];

// ---------- Elementos do cenário ----------
export type DecorKind =
  | "tree" | "vines" | "mushroom" | "falls" | "mist" | "ripple"
  | "constellation" | "planet" | "dome" | "pyramid" | "sun" | "obelisk" | "dunes"
  | "peaks" | "volcano" | "dragon" | "aurora" | "icicles" | "spire"
  | "column" | "glyph" | "clock" | "gear" | "hourglass" | "halo" | "rays" | "infinity" | "moon" | "island";

/** Tamanho de cada elemento em escala 1 (px da pintura) e se é translúcido ("soft": luz, névoa, aurora). */
export const DECOR_BOX: Record<DecorKind, { w: number; h: number; soft?: boolean }> = {
  tree: { w: 230, h: 560 }, vines: { w: 170, h: 280 }, mushroom: { w: 90, h: 80 }, falls: { w: 70, h: 420 },
  mist: { w: 900, h: 170, soft: true }, ripple: { w: 170, h: 50, soft: true },
  constellation: { w: 300, h: 190, soft: true }, planet: { w: 160, h: 110 }, dome: { w: 170, h: 170 },
  pyramid: { w: 220, h: 150 }, sun: { w: 170, h: 170, soft: true }, obelisk: { w: 60, h: 320 }, dunes: { w: 900, h: 150, soft: true },
  peaks: { w: 900, h: 260, soft: true }, volcano: { w: 240, h: 250 }, dragon: { w: 250, h: 120 },
  aurora: { w: 900, h: 380, soft: true }, icicles: { w: 900, h: 80 }, spire: { w: 80, h: 280 },
  column: { w: 70, h: 300 }, glyph: { w: 170, h: 170, soft: true }, clock: { w: 360, h: 360, soft: true },
  gear: { w: 130, h: 130 }, hourglass: { w: 80, h: 130 }, halo: { w: 440, h: 440, soft: true },
  rays: { w: 900, h: 760, soft: true }, infinity: { w: 180, h: 80, soft: true }, moon: { w: 120, h: 120, soft: true },
  island: { w: 150, h: 120 },
};

/** Um elemento: tipo, centro (x, y) em px da pintura, escala e espelhamento opcional. */
export interface Decor { k: DecorKind; x: number; y: number; s?: number; flip?: boolean }

export type ParticleKind = "sparkle" | "firefly" | "drop" | "star" | "sand" | "ember" | "snow" | "petal" | "dust";

export type Crystal = [number, number, number]; // x, y, raio (px da pintura)

/**
 * Efeito de ambiente sobre um elemento da PRÓPRIA pintura (cachoeira correndo, tocha tremulando, portal pulsando…).
 * Dá vida aos mundos que têm pouco ou nenhum cristal para receber a cor do jogo.
 *  - falls: água descendo · lava: lava descendo · fire: chama tremulando · portal: portal/relógio pulsando na cor do jogo
 *  - mist: faixa de névoa passando · glow: brilho suave respirando (água, lava no chão, lanternas) na cor do mundo
 */
export type FxKind = "falls" | "lava" | "fire" | "portal" | "mist" | "glow";
/** Tipo, centro (x, y) e tamanho (w, h), em px da pintura. */
export type Fx = [FxKind, number, number, number, number];

export interface Scene {
  id: number;
  name: string;
  tagline: string;
  /** Pintura do mundo (public/). Sem ela, usa a trilha original com `grade`, `wash` e `decor`. */
  art?: string;
  /** Posições das 10 fases sobre o caminho da pintura (de baixo para cima). Sem elas, as da trilha original. */
  points?: TrailPoint[];
  /** Cristais da pintura que recebem a cor do jogo. */
  crystals: Crystal[];
  /** Cor de apoio do mundo (luz ambiente, água, lava, areia…). */
  tone: string;
  particles: { kind: ParticleKind; n: number };
  /** Efeitos de ambiente sobre elementos da pintura. */
  fx?: Fx[];
  // Só para mundos sem pintura própria:
  grade?: string;
  wash?: [string, string];
  blend?: "soft-light" | "overlay" | "color" | "multiply";
  ink?: string;
  decor?: Decor[];
}

/** Perspectiva de cada posição (as de baixo, mais perto, maiores) — a mesma da trilha original. */
const DEPTH = TRAIL.map((p) => p.k);
/** Posições medidas em px da pintura → % (como em lib/trail.ts). */
const at = (px: [number, number][]): TrailPoint[] =>
  px.map(([x, y], i) => ({ x: +((x / TRAIL_IMAGE.width) * 100).toFixed(2), y: +((y / TRAIL_IMAGE.height) * 100).toFixed(2), k: DEPTH[i] }));
/** Traçado da trilha original, em px — várias pinturas seguem o mesmo caminho. */
const BASE: [number, number][] = [[585, 1535], [455, 1385], [640, 1225], [480, 1068], [565, 915], [470, 790], [520, 572], [300, 500], [585, 402], [432, 305]];
/** Igual à trilha original, trocando só algumas posições: { índice (0 = fase 1): [x, y] }. */
const tweak = (t: Record<number, [number, number]>) => at(BASE.map((p, i) => t[i] ?? p));

export const SCENES: Scene[] = [
  {
    id: 1, name: "Reino Celestial", tagline: "Castelos suspensos entre nuvens e cristais.",
    art: TRAIL_IMAGE.src, crystals: PAINTED_CRYSTALS, tone: "#C9B8FF", particles: { kind: "sparkle", n: 26 },
  },
  {
    id: 2, name: "Floresta dos Cristais", tagline: "Árvores antigas, cogumelos e cristais que brilham na mata.",
    art: "/journeys/02-floresta-dos-cristais.webp", tone: "#C79BFF", particles: { kind: "firefly", n: 30 },
    crystals: [[280, 715, 45], [222, 950, 40], [305, 1270, 62], [430, 900, 34], [735, 880, 32], [810, 1060, 40], [825, 735, 34], [775, 1385, 60], [100, 335, 34], [170, 362, 22]],
  },
  {
    id: 3, name: "Vale das Águas", tagline: "Cachoeiras, lagos e pontes de pedra sobre a névoa.",
    art: "/journeys/03-vale-das-aguas.webp", tone: "#9FE6FF", particles: { kind: "drop", n: 30 }, crystals: [],
    fx: [["mist", 450, 400, 900, 170], ["mist", 450, 820, 900, 150], ["falls", 570, 300, 56, 140], ["falls", 462, 312, 36, 90], ["falls", 530, 520, 34, 70],
      ["falls", 730, 720, 64, 170], ["falls", 842, 1035, 76, 190], ["portal", 772, 545, 56, 86], ["glow", 360, 1245, 150, 60], ["glow", 340, 880, 100, 40]],
    points: tweak({ 5: [470, 800], 6: [490, 605], 7: [300, 540], 8: [390, 430], 9: [450, 255] }),
  },
  {
    id: 4, name: "Templo das Estrelas", tagline: "Observatórios antigos sob um céu de constelações.",
    art: "/journeys/04-templo-das-estrelas.webp", tone: "#B9A8FF", particles: { kind: "star", n: 40 },
    crystals: [[275, 700, 48], [430, 885, 30], [300, 1270, 58], [800, 1100, 48], [735, 878, 28], [825, 735, 26]],
  },
  {
    id: 5, name: "Deserto dos Segredos", tagline: "Templos ancestrais e cristais dourados entre as dunas.",
    art: "/journeys/05-deserto-dos-segredos.webp", tone: "#FFC870", particles: { kind: "sand", n: 34 },
    crystals: [[275, 720, 45], [430, 900, 30], [735, 890, 30], [815, 1065, 45], [300, 1285, 62], [45, 1445, 50], [765, 1440, 40], [170, 375, 22]],
  },
  {
    id: 6, name: "Montanhas do Dragão", tagline: "Fortalezas sobre picos monumentais e rios de lava.",
    art: "/journeys/06-montanhas-do-dragao.webp", tone: "#FF8A3D", particles: { kind: "ember", n: 34 }, crystals: [],
    fx: [["fire", 244, 968, 70, 80], ["fire", 296, 1330, 80, 90], ["fire", 760, 1140, 56, 66], ["fire", 772, 1484, 66, 76], ["fire", 760, 540, 90, 90],
      ["lava", 740, 710, 52, 180], ["lava", 534, 1040, 30, 80], ["lava", 570, 320, 22, 150], ["lava", 520, 712, 22, 150], ["glow", 560, 1440, 420, 150]],
    points: tweak({ 7: [345, 535] }),
  },
  {
    id: 7, name: "Reino das Auroras", tagline: "Terras geladas, cristais de gelo e luzes dançando no céu.",
    art: "/journeys/07-reino-das-auroras.webp", tone: "#BFF5FF", particles: { kind: "snow", n: 46 },
    crystals: [[275, 700, 40], [430, 890, 30], [225, 960, 30], [300, 1272, 50], [810, 1060, 35], [825, 735, 30], [775, 1400, 58], [755, 880, 28]],
  },
  {
    id: 8, name: "Cidade Perdida", tagline: "Uma cidade de mármore esquecida entre jardins e nuvens.",
    art: "/journeys/08-cidade-perdida.webp", tone: "#FFE9B0", particles: { kind: "petal", n: 28 },
    crystals: [[290, 712, 50], [820, 1080, 30], [840, 760, 26], [310, 1290, 50], [850, 1440, 44], [810, 850, 28]],
    points: tweak({ 7: [350, 495] }),
  },
  {
    id: 9, name: "Dimensão do Tempo", tagline: "Relógios monumentais e portais entre as eras.",
    art: "/journeys/09-dimensao-do-tempo.webp", tone: "#FFD27A", particles: { kind: "dust", n: 34 },
    fx: [["portal", 326, 400, 52, 72], ["portal", 780, 500, 96, 116], ["portal", 280, 690, 52, 72], ["portal", 480, 170, 96, 96], ["portal", 790, 90, 130, 110],
      ["glow", 844, 760, 44, 76], ["falls", 716, 710, 50, 180]],
    crystals: [[430, 890, 30], [735, 875, 30], [290, 1270, 40], [745, 1430, 35]],
  },
  {
    id: 10, name: "Trono do Infinito", tagline: "O desafio final: o trono dourado além das estrelas.",
    art: "/journeys/10-trono-do-infinito.webp", tone: "#FFE08A", particles: { kind: "sparkle", n: 40 },
    crystals: [[300, 680, 55], [430, 890, 30], [735, 875, 30], [810, 1060, 40], [830, 720, 25], [305, 1310, 60], [740, 1420, 30]],
    points: tweak({ 7: [430, 480] }),
  },
];

export const sceneOf = (chapter: number): Scene => SCENES[Math.min(SCENES.length, Math.max(1, chapter)) - 1];
export const sceneArt = (s: Scene) => s.art ?? TRAIL_IMAGE.src;
/** Mundo com pintura própria (sem gradação nem cenário vetorial por cima). */
export const isPainted = (s: Scene) => !!s.art;
export const scenePoints = (s: Scene) => s.points ?? TRAIL;

/** Caixa (px da pintura) ocupada por um elemento do cenário. */
export function decorBox(d: Decor) {
  const b = DECOR_BOX[d.k], s = d.s ?? 1;
  return { x0: d.x - (b.w * s) / 2, x1: d.x + (b.w * s) / 2, y0: d.y - (b.h * s) / 2, y1: d.y + (b.h * s) / 2, soft: !!b.soft };
}

/** Área reservada a cada botão de fase (o botão, o selo e o balão "JOGAR" acima dele), em px da pintura. */
export function nodeZone(p: TrailPoint) {
  const x = (p.x / 100) * TRAIL_IMAGE.width, y = (p.y / 100) * TRAIL_IMAGE.height;
  return { x0: x - 85, x1: x + 85, y0: y - 150, y1: y + 80 };
}

/** Partículas em posições fixas (mesmas em todo carregamento e nos 4 jogos), com sorteio determinístico. */
export function particlesOf(s: Scene) {
  let seed = s.id * 9973;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: s.particles.n }, (_, i) => ({ x: rnd() * 100, y: rnd() * 100, d: 4 + rnd() * 6, delay: -rnd() * 10, size: .6 + rnd() * .9, c: i }));
}
