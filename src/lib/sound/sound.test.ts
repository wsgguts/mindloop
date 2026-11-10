import { describe, expect, it } from "vitest";
import { DEFAULT_SOUND, gainFor, mergeSound, parseSound, serializeSound } from "./settings";
import { sudokuUnitsDone, tangoLinesDone } from "./progress";
import { BASE, THEMES, type SoundGame } from "./themes";
import { playWith, type SfxEvent, type Synth, type ToneOpts, type NoiseOpts } from "./engine";
import { CRISTAL as C, ORBE as O, type Sign } from "../tangoLogic";

describe("preferências de som", () => {
  it("começa ligado com volume padrão quando não há nada salvo ou o valor é inválido", () => {
    expect(parseSound(null)).toEqual(DEFAULT_SOUND);
    expect(parseSound("{quebrado")).toEqual(DEFAULT_SOUND);
    expect(parseSound(JSON.stringify({ on: "sim", vol: "alto" }))).toEqual(DEFAULT_SOUND);
  });
  it("lê e grava ida e volta, limitando o volume entre 0 e 1", () => {
    expect(parseSound(serializeSound({ on: false, vol: 0.35 }))).toEqual({ on: false, vol: 0.35 });
    expect(parseSound(JSON.stringify({ on: true, vol: 7 })).vol).toBe(1);
    expect(mergeSound(DEFAULT_SOUND, { vol: -2 }).vol).toBe(0);
    expect(mergeSound({ on: true, vol: 0.5 }, { on: false })).toEqual({ on: false, vol: 0.5 });
  });
  it("desligado = ganho zero; volume cresce de forma suave e monótona", () => {
    expect(gainFor({ on: false, vol: 1 })).toBe(0);
    expect(gainFor({ on: true, vol: 0 })).toBe(0);
    expect(gainFor({ on: true, vol: 1 })).toBe(1);
    const a = gainFor({ on: true, vol: 0.3 }), b = gainFor({ on: true, vol: 0.6 });
    expect(a).toBeGreaterThan(0); expect(b).toBeGreaterThan(a); expect(b).toBeLessThan(0.6);
  });
});

describe("conquistas parciais (só escolhem o som)", () => {
  it("Sudoku: conta linha, coluna e bloco fechados sem repetição", () => {
    const g = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
    ];
    expect(sudokuUnitsDone(g, 0, 0)).toBe(3); // linha 1, coluna 1 e bloco 1 completos
    expect(sudokuUnitsDone(g, 1, 3)).toBe(2); // linha 2 e bloco 2 (coluna 4 incompleta)
    expect(sudokuUnitsDone(g, 2, 0)).toBe(1); // só a coluna 1
    expect(sudokuUnitsDone(g, 2, 1)).toBe(0); // casa vazia
    const bad = [[1, 2, 3, 3], [3, 4, 1, 2], [2, 0, 0, 0], [4, 0, 0, 0]];
    expect(sudokuUnitsDone(bad, 0, 0)).toBe(2); // linha com repetição (3 e 3) não conta; coluna 1 e bloco 1 contam
  });
  it("Tango: conta linha/coluna cheias e sem erro", () => {
    const signs: Sign[] = [];
    const g = [
      [C, O, C, O],
      [O, 0, 0, 0],
      [C, 0, 0, 0],
      [O, 0, 0, 0],
    ];
    expect(tangoLinesDone(g, signs, 0, 0)).toBe(2);
    expect(tangoLinesDone(g, signs, 0, 1)).toBe(1);
    const trio = [[C, C, C, O], [O, 0, 0, 0], [C, 0, 0, 0], [O, 0, 0, 0]];
    expect(tangoLinesDone(trio, signs, 0, 3)).toBe(0); // três Cristais seguidos: não está certa
    const sinal: Sign[] = [{ r: 0, c: 0, dir: "h", same: true }];
    expect(tangoLinesDone(g, sinal, 0, 3)).toBe(0); // o sinal “=” entre C e O quebra a linha
  });
});

// Sintetizador falso: registra cada nota para conferir duração e intensidade de todos os sons.
function fakeSynth() {
  const notes: { t: number; end: number; g: number }[] = [];
  const s: Synth = {
    now: 0,
    hz: (m) => 440 * Math.pow(2, (m - 69) / 12),
    tone: (o: ToneOpts) => {
      expect(Number.isFinite(o.f) && o.f > 20 && o.f < 20000).toBe(true);
      notes.push({ t: o.t ?? 0, end: (o.t ?? 0) + o.dur, g: o.g });
    },
    noise: (o: NoiseOpts) => { notes.push({ t: o.t ?? 0, end: (o.t ?? 0) + o.dur, g: o.g }); },
  };
  return { s, notes };
}

const EVENTS: SfxEvent[] = ["select", "place", "erase", "progress", "complete", "error", "undo", "hint", "win", "celebrate", "burst", "advance", "ui", "block"];
const GAMES: SoundGame[] = ["sudoku", "tango", "zip", "patches"];

describe("temas sonoros", () => {
  it("todo evento tem som em todos os jogos (no tema ou na base)", () => {
    for (const g of GAMES) for (const ev of EVENTS) expect(THEMES[g][ev] ?? BASE[ev], `${g}:${ev}`).toBeTypeOf("function");
  });

  it("cada jogo tem identidade própria (sons diferentes da base nos eventos de jogada)", () => {
    for (const g of GAMES) for (const ev of ["place", "error", "win"] as const) expect(THEMES[g][ev], `${g}:${ev}`).toBeDefined();
    const fp = (g: SoundGame) => { const { s, notes } = fakeSynth(); (THEMES[g].place ?? BASE.place)!(s, { v: 1, pos: 0.5, count: 4 }); return JSON.stringify(notes.map((n) => n.end)); };
    expect(new Set(GAMES.map(fp)).size).toBe(GAMES.length);
  });

  it("sons de jogada são curtos e discretos; erro é mais baixo que acerto; só vitória e progressão são longos", () => {
    for (const g of [undefined, ...GAMES]) {
      for (const ev of EVENTS) {
        const fn = (g ? THEMES[g][ev] : undefined) ?? BASE[ev]!;
        for (const opts of [{}, { v: 2, pos: 1, count: 3, span: 1700 }, { v: 1, pos: 0, count: 1 }]) {
          const { s, notes } = fakeSynth();
          fn(s, opts);
          expect(notes.length, `${g}:${ev}`).toBeGreaterThan(0);
          const end = Math.max(...notes.map((n) => n.end));
          const peak = Math.max(...notes.map((n) => n.g));
          const limit = ev === "win" ? 3.6 : ev === "celebrate" ? 2.2 : ev === "advance" ? 1.4 : ev === "hint" || ev === "complete" || ev === "progress" || ev === "burst" ? 0.8 : 0.45;
          expect(end, `${g}:${ev} duração`).toBeLessThanOrEqual(limit);
          expect(peak, `${g}:${ev} volume`).toBeLessThanOrEqual(0.15);
          if (ev === "error" || ev === "block") expect(peak, `${g}:${ev} discreto`).toBeLessThanOrEqual(0.09);
        }
      }
    }
  });

  it("nada toca sem interação da pessoa (e fora do navegador não quebra)", () => {
    expect(() => playWith(THEMES.sudoku, BASE, "win")).not.toThrow();
  });
});
