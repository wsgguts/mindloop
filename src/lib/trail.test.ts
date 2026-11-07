import { describe, expect, it } from "vitest";
import { TRAIL, TRAIL_IMAGE } from "./trail";
import { LEVELS_PER_CHAPTER } from "./journey";

describe("trilha ilustrada", () => {
  it("tem um ponto para cada nível do capítulo, dentro da arte", () => {
    expect(TRAIL).toHaveLength(LEVELS_PER_CHAPTER);
    for (const p of TRAIL) {
      expect(p.x).toBeGreaterThan(10); expect(p.x).toBeLessThan(90);
      expect(p.y).toBeGreaterThan(10); expect(p.y).toBeLessThan(98);
    }
  });
  it("sobe do primeiro plano em direção ao castelo", () => {
    for (let i = 1; i < TRAIL.length; i++) expect(TRAIL[i].y).toBeLessThan(TRAIL[i - 1].y);
  });
  it("mantém os cristais sem se sobrepor mesmo no celular mais estreito (320px)", () => {
    const w = 320, h = (w * TRAIL_IMAGE.height) / TRAIL_IMAGE.width;
    for (let i = 1; i < TRAIL.length; i++) {
      const a = TRAIL[i - 1], b = TRAIL[i];
      const d = Math.hypot(((a.x - b.x) / 100) * w, ((a.y - b.y) / 100) * h);
      expect(d).toBeGreaterThanOrEqual(i === TRAIL.length - 1 ? 50 : 44);
    }
  });
});
