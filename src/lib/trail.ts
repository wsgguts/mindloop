// Trilha ilustrada (public/journey-trail.webp, 900×1600; original em journey-trail.jpg): pontos sobre o caminho de pedras.
// Cada capítulo tem 10 níveis; o nível 1 fica no primeiro plano e o 10 (desafio) perto do castelo.
// Coordenadas em porcentagem da imagem — assim acompanham a arte em qualquer tamanho de tela.

export const TRAIL_IMAGE = { src: "/journey-trail.webp", width: 900, height: 1600 };

export interface TrailPoint { x: number; y: number; k: number } // x/y em %, k = escala de perspectiva

// Medidos na própria ilustração (pixels da imagem original), seguindo o centro do caminho.
const PX: [number, number, number][] = [
  [585, 1535, 1.15], // primeiro plano, pedras largas
  [455, 1385, 1.1],
  [640, 1225, 1.05], // curva à direita
  [480, 1068, 1.0],
  [565, 915, 0.95],
  [470, 790, 0.9], // passarela das ilhas do meio
  [520, 572, 0.9], // ilha da cascata
  [300, 500, 0.88], // curva junto às ruínas
  [585, 402, 0.85], // curva à direita, perto do cristal rosa
  [432, 305, 1.0], // desafio: último trecho antes do castelo
];

export const TRAIL: TrailPoint[] = PX.map(([x, y, k]) => ({
  x: +((x / TRAIL_IMAGE.width) * 100).toFixed(2),
  y: +((y / TRAIL_IMAGE.height) * 100).toFixed(2),
  k,
}));
