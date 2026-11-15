import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { avatarStats, currentAvatar, newAvatars } from "../components/account/Avatars";
import { AVATAR_KEY, CAST, DEFAULT_AVATAR, ITEM_ART, SUSPECTS, artOf, castFor, isUnlocked, itemArt, narratorOf, parseSeen, unlockProgress } from "./cast";
import { emptyCaseLog } from "./cases/progress";
import { readSnapshot } from "./cloud";
import { EVERY_GAME } from "./games";
import type { JourneyGame } from "./journey";

const pub = (p: string) => join(process.cwd(), "public", p);
const prog = (n: Partial<Record<JourneyGame, number>>) =>
  Object.fromEntries(EVERY_GAME.map((g) => [g, "1".repeat(n[g] ?? 0).padEnd(100, "0")])) as Record<JourneyGame, string>;

describe("elenco do MindLoop", () => {
  it("ids, nomes e retratos únicos, e cada retrato existe em /public/cast", () => {
    expect(new Set(CAST.map((m) => m.id)).size).toBe(CAST.length);
    expect(new Set(CAST.map((m) => m.name)).size).toBe(CAST.length);
    expect(new Set(CAST.map((m) => m.tile)).size).toBe(CAST.length);
    for (const m of CAST) expect(existsSync(pub(`cast/${m.id}.webp`)), m.id).toBe(true);
    for (const a of ITEM_ART) expect(existsSync(pub(`items/${a.id}.webp`)), a.id).toBe(true);
  });

  it("nomes curtos (até 11 letras) e cada jogo tem o seu narrador", () => {
    for (const m of CAST) expect(m.name.length, m.name).toBeLessThanOrEqual(11);
    for (const g of EVERY_GAME) expect(narratorOf(g).narrator).toBe(g);
    expect(SUSPECTS.some((m) => m.narrator)).toBe(false);
  });

  it("castFor: 4 personagens diferentes, e os dois mistérios do capítulo não repetem ninguém", () => {
    for (const g of EVERY_GAME) for (let i = 0; i < 20; i++) {
      const ids = castFor(g, i).map((m) => m.id);
      expect(new Set(ids).size).toBe(4);
      if (i % 2) expect(ids.filter((id) => castFor(g, i - 1).some((m) => m.id === id))).toEqual([]);
    }
  });

  it("ilustração de objetos só pelo nome exato (nada de desenho de outro objeto)", () => {
    for (const wrong of ["Pote de Vidro", "Pote de Biscoitos", "Cesto de Roupa", "Bolo de Chocolate", "Chave de Ignição", "Sino de Cabra", "Lanterna de Papel", "Flauta de Galho", "Incenso"]) expect(itemArt(wrong), wrong).toBeNull();
    expect(itemArt("Sino de Prata")).toBe("/items/sino.webp");
    expect(itemArt("Lampião")).toBe("/items/lanterna.webp");
    expect(itemArt("Lupa Dourada")).toBe("/items/lupa.webp");
    expect(itemArt("Pote de Mel")).toBe("/items/mel.webp");
    expect(itemArt("Pão de Mel")).toBeNull();
    expect(itemArt("Régua de Nível")).toBe("/items/regua.webp");
    expect(itemArt("Tubo de Ensaio")).toBe("/items/tubo.webp");
    expect(artOf("Kai")).toBe("/cast/kai.webp");
    expect(artOf("Saco de Farinha")).toBeNull();
  });
});

describe("avatares", () => {
  it("8 liberados desde o começo; o resto chega jogando", () => {
    const zero = avatarStats(prog({}), emptyCaseLog());
    const open = CAST.filter((m) => isUnlocked(m, zero));
    expect(open).toHaveLength(8);
    expect(open.map((m) => m.id)).toContain(DEFAULT_AVATAR);
    expect(newAvatars(zero, new Set())).toEqual([]);
  });

  it("fases somadas, jornada completa e progresso rumo ao desbloqueio", () => {
    const s = avatarStats(prog({ sudoku: 100, tango: 20 }), emptyCaseLog());
    const ids = new Set(CAST.filter((m) => isUnlocked(m, s)).map((m) => m.id));
    expect(ids.has("faisca")).toBe(true);   // 5 fases
    expect(ids.has("musgo")).toBe(true);    // 100 fases
    expect(ids.has("jade")).toBe(true);     // 120 fases
    expect(ids.has("theo")).toBe(false);    // 140 fases
    expect(ids.has("quartzo")).toBe(true);  // Mini Sudoku completo
    expect(ids.has("marina")).toBe(false);  // Tango incompleto
    expect(unlockProgress(CAST.find((m) => m.id === "theo")!, s)).toEqual([120, 140]);
    expect(newAvatars(s, new Set(["faisca"])).map((m) => m.id)).not.toContain("faisca");
  });

  it("avatar escolhido e ainda bloqueado (ex.: depois de reiniciar) volta ao padrão", () => {
    const zero = avatarStats(prog({}), emptyCaseLog());
    expect(currentAvatar("umbra", zero).id).toBe(DEFAULT_AVATAR);
    expect(currentAvatar("nox", zero).id).toBe("nox");
    expect(currentAvatar("inexistente", zero).id).toBe(DEFAULT_AVATAR);
  });

  it("a escolha viaja com a conta (preferências do snapshot) e dados estranhos não quebram", () => {
    const snap = readSnapshot((k) => (k === AVATAR_KEY ? "lyra" : k === "mindloop:avatars-seen" ? "[\"faisca\"]" : null));
    expect(snap.prefs[AVATAR_KEY]).toBe("lyra");
    expect([...parseSeen(snap.prefs["mindloop:avatars-seen"])]).toEqual(["faisca"]);
    expect(parseSeen("{bad")).toEqual(new Set());
    expect(parseSeen("[1, \"x\"]")).toEqual(new Set(["x"]));
  });
});
