// Onde desenhar o cristal de uma fase extra (investigação) no mapa do capítulo. Sem React: só geometria.
//
// Regra: o cristal extra fica AO LADO do caminho, na altura entre o nível de origem e o seguinte, deslocado para
// fora da trilha (na direção perpendicular ao trecho entre os dois níveis). Ele nunca pode encostar em um cristal
// de nível: entre as bordas fica uma folga mínima (GAP). Se um lado não tiver espaço, tenta o outro lado; se nenhum
// tiver, afasta um pouco mais. E nunca sai da área da imagem do mapa.

export interface Circle { x: number; y: number; r: number } // centro e raio, em px
export interface Box { w: number; h: number }

export const GAP = 12; // folga mínima entre as bordas (px)

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

/** Menor folga entre a borda do cristal extra (em p, raio r) e a borda de qualquer cristal de nível. */
export function clearance(p: { x: number; y: number }, r: number, nodes: Circle[]): number {
  return Math.min(...nodes.map((n) => dist(p, n) - n.r - r));
}

/**
 * Posição do cristal extra.
 * @param from  cristal do nível que libera a investigação
 * @param next  cristal do nível seguinte (ou null no último nível do capítulo)
 * @param nodes todos os cristais de nível do capítulo
 * @param r     raio do cristal extra
 * @param box   tamanho da imagem do mapa
 */
export function placeExtra(from: Circle, next: Circle | null, nodes: Circle[], r: number, box: Box): { x: number; y: number } {
  // Ponto de partida: no meio do trecho entre os dois níveis (ou o próprio nível, se for o último).
  const mid = next ? { x: (from.x + next.x) / 2, y: (from.y + next.y) / 2 } : { x: from.x, y: from.y };
  // Direção do trecho e a perpendicular a ele ("para fora da trilha").
  const dx = next ? next.x - from.x : 0, dy = next ? next.y - from.y : -1;
  const len = Math.hypot(dx, dy) || 1;
  const perp = { x: -dy / len, y: dx / len };
  const margin = r + 4; // não encosta na borda da imagem
  const clamp = (p: { x: number; y: number }) => ({ x: Math.min(box.w - margin, Math.max(margin, p.x)), y: Math.min(box.h - margin, Math.max(margin, p.y)) });

  let best = clamp(mid), bestGap = -Infinity;
  // Começa logo ao lado do nível de origem e vai se afastando até achar espaço.
  for (let d = from.r + r + GAP; d <= from.r * 4 + r * 3; d += 4) {
    const sides = [1, -1].map((s) => clamp({ x: mid.x + perp.x * d * s, y: mid.y + perp.y * d * s }));
    // Entre os dois lados, prefere o que tem mais folga (o "espelho" quando um lado colide).
    sides.sort((a, b) => clearance(b, r, nodes) - clearance(a, r, nodes));
    const g = clearance(sides[0], r, nodes);
    if (g > bestGap) { best = sides[0]; bestGap = g; }
    if (g >= GAP) return sides[0];
  }
  return best; // tela pequena demais: o lugar com mais folga possível
}
