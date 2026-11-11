import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_GAMES, GAME_META } from "./games";
import { CHAPTERS, LEVELS_PER_CHAPTER } from "./journey";
import { DECOR_BOX, GAME_LOOK, SCENES, decorBox, nodeZone, sceneArt, sceneOf, scenePoints } from "./scenes";
import { TRAIL_IMAGE } from "./trail";

const hit = (a: { x0: number; x1: number; y0: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const PUBLIC = join(__dirname, "../../public");

describe("mundos das jornadas", () => {
  it("são 10 mundos, um por capítulo, com nomes únicos — os mesmos para os 4 jogos", () => {
    expect(SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(SCENES.map((s) => s.name)).size).toBe(10);
    for (const g of ALL_GAMES) {
      expect(CHAPTERS[g]).toHaveLength(10);
      CHAPTERS[g].forEach((c, i) => {
        expect(sceneOf(c.id)).toBe(SCENES[i]);
        expect([c.from, c.to]).toEqual([i * 10 + 1, i * 10 + 10]);
      });
    }
  });
  it("cada mundo tem a própria pintura, e o arquivo existe", () => {
    expect(new Set(SCENES.map(sceneArt)).size).toBe(10);
    for (const s of SCENES) expect(existsSync(join(PUBLIC, sceneArt(s))), sceneArt(s)).toBe(true);
  });
  it("cada mundo tem 10 posições de fase dentro da arte, subindo pela trilha", () => {
    for (const s of SCENES) {
      const pts = scenePoints(s);
      expect(pts).toHaveLength(LEVELS_PER_CHAPTER);
      for (const p of pts) { expect(p.x).toBeGreaterThan(10); expect(p.x).toBeLessThan(90); expect(p.y).toBeGreaterThan(10); expect(p.y).toBeLessThan(98); }
      for (let i = 1; i < pts.length; i++) expect(pts[i].y, `${s.name}: fase ${i + 1}`).toBeLessThan(pts[i - 1].y);
    }
  });
  it("as fases de cada mundo não se sobrepõem nem no celular mais estreito (320px)", () => {
    const w = 320, h = (w * TRAIL_IMAGE.height) / TRAIL_IMAGE.width;
    for (const s of SCENES) {
      const pts = scenePoints(s);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const d = Math.hypot(((a.x - b.x) / 100) * w, ((a.y - b.y) / 100) * h);
        expect(d, `${s.name}: fases ${i} e ${i + 1}`).toBeGreaterThanOrEqual(i === pts.length - 1 ? 50 : 44);
      }
    }
  });
  it("cristais e elementos do cenário ficam dentro da arte; nenhum elemento sólido cobre uma fase", () => {
    const bad: string[] = [];
    for (const s of SCENES) {
      for (const [x, y, r] of s.crystals) { expect(x).toBeLessThan(TRAIL_IMAGE.width); expect(y).toBeLessThan(TRAIL_IMAGE.height); expect(r).toBeGreaterThan(0); }
      for (const d of s.decor ?? []) {
        expect(DECOR_BOX[d.k]).toBeDefined();
        const b = decorBox(d);
        if (b.soft) continue; // luz, névoa, aurora: translúcidos e sempre por baixo dos botões
        for (const [i, p] of scenePoints(s).entries()) if (hit(b, nodeZone(p))) bad.push(`${s.name}: ${d.k} (${d.x},${d.y}) sobre a fase ${i + 1}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it("nenhum mundo fica sem efeito de ambiente: cristais na cor do jogo ou efeitos sobre a pintura, além das partículas", () => {
    const fraco = SCENES.filter((s) => s.crystals.length + (s.fx?.length ?? 0) < 4).map((s) => s.name);
    expect(fraco).toEqual([]);
    for (const s of SCENES) for (const [k, x, y, w, h] of s.fx ?? []) {
      expect(["falls", "lava", "fire", "portal", "mist", "glow"]).toContain(k);
      expect(x - w / 2, `${s.name}: ${k}`).toBeGreaterThanOrEqual(0); expect(x + w / 2).toBeLessThanOrEqual(TRAIL_IMAGE.width);
      expect(y - h / 2, `${s.name}: ${k}`).toBeGreaterThanOrEqual(0); expect(y + h / 2).toBeLessThanOrEqual(TRAIL_IMAGE.height);
    }
  });
  it("cada mundo tem tom e partículas próprios", () => {
    for (const s of SCENES) { expect(s.tone).toMatch(/^#[0-9A-F]{6}$/i); expect(s.particles.n).toBeGreaterThan(0); }
  });
});

describe("identidade de cada jogo", () => {
  it("usa a cor principal já definida para o jogo e paletas diferentes entre os jogos", () => {
    for (const g of ALL_GAMES) {
      expect(GAME_LOOK[g].main).toBe(GAME_META[g].color);
      for (const c of [GAME_LOOK[g].light, GAME_LOOK[g].deep, ...GAME_LOOK[g].particles]) expect(c).toMatch(/^#[0-9A-F]{6}$/i);
    }
    expect(new Set(ALL_GAMES.map((g) => GAME_LOOK[g].main)).size).toBe(4);
  });
});
