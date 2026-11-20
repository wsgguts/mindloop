// O cristal extra nunca encosta num cristal de nível e nunca sai da imagem do mapa — em todos os 10 mundos,
// no celular (~380 px) e no desktop.
import { describe, expect, it } from "vitest";
import { GAP, clearance, placeExtra, type Circle } from "./extraPlacement";
import { sceneOf, scenePoints } from "./scenes";

const nodeR = (w: number, k: number, boss: boolean) => (boss ? Math.min(86, Math.max(56, 0.16 * w * k)) : Math.min(72, Math.max(44, 0.125 * w * k))) / 2;

describe("posição do cristal da fase extra", () => {
  for (const w of [348, 380, 600]) it(`largura ${w}px: folga mínima de ${GAP}px e dentro da imagem, em todos os mundos`, () => {
    const h = w * 1.6;
    for (let ch = 1; ch <= 10; ch++) {
      const pts = scenePoints(sceneOf(ch));
      const nodes: Circle[] = pts.map((p, j) => ({ x: (p.x / 100) * w, y: (p.y / 100) * h, r: nodeR(w, p.k ?? 1, j === pts.length - 1) }));
      for (let j = 0; j < nodes.length; j++) {
        const r = nodes[j].r * 0.72;
        const p = placeExtra(nodes[j], nodes[j + 1] ?? null, nodes, r, { w, h });
        expect(clearance(p, r, nodes), `mundo ${ch}, nível ${j + 1}`).toBeGreaterThanOrEqual(GAP);
        expect(p.x - r).toBeGreaterThanOrEqual(0); expect(p.x + r).toBeLessThanOrEqual(w);
        expect(p.y - r).toBeGreaterThanOrEqual(0); expect(p.y + r).toBeLessThanOrEqual(h);
      }
    }
  });
});
