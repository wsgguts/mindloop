// ===================== Identidade sonora de cada jogo =====================
// Cada tema traduz os eventos do jogo em sons curtos (a maioria com 50–300 ms), discretos e afinados:
// • Base (interface e jornada): toques limpos de vidro, neutros.
// • Mini Sudoku: celesta/vidro, escala pentatônica de Dó — precisa, delicada, organizada.
// • Tango: duas "vozes" quentes (Cristal agudo, Orbe grave, a uma quinta de distância) que formam acordes.
// • Zip: synth moderno em pluck; a nota sobe conforme o caminho avança, como quem percorre uma linha.
// • Patches: encaixes de madeira (clique + corpo), mais graves para peças maiores, e um "clic" de peça certa.
// • Astros (bônus): sinos celestes; cada astro novo soa um degrau acima, e a marca × é um toque seco.
// Erros são sempre graves, baixos e curtos: avisam sem constranger.

import type { Synth, Theme } from "./engine";

export type SoundGame = "sudoku" | "tango" | "zip" | "patches" | "astros";

const PENTA = [0, 2, 4, 7, 9]; // pentatônica maior
const scale = (root: number, i: number, steps = PENTA) => root + 12 * Math.floor(i / steps.length) + steps[((i % steps.length) + steps.length) % steps.length];

// ---------------------------------------------------------------- blocos de timbre

/** Vidro/celesta: fundamental + parciais curtas. */
function glass(s: Synth, m: number, t: number, g: number, dur = 0.35, send = 0.18) {
  const f = s.hz(m);
  s.tone({ f, t, dur, g, send });
  s.tone({ f: f * 2, t, dur: dur * 0.55, g: g * 0.28, send });
  s.tone({ f: f * 3.01, t, dur: dur * 0.25, g: g * 0.08, type: "triangle", send });
}
/** Madeira: clique de ataque + corpo com leve queda de afinação. */
function wood(s: Synth, m: number, t: number, g: number, dur = 0.12) {
  const f = s.hz(m);
  s.noise({ t, dur: 0.018, g: g * 0.55, bp: 2400, q: 1.6 });
  s.tone({ f: f * 1.35, f2: f, t, dur, g, type: "triangle", lp: 3200, lp2: 900, send: 0.06 });
  s.tone({ f: f / 2, t, dur: dur * 0.7, g: g * 0.35, send: 0.02 });
}
/** Pluck de synth (Zip): serra com filtro que fecha rápido + sub senoidal. */
function pluck(s: Synth, m: number, t: number, g: number, dur = 0.11, bright = 3400) {
  const f = s.hz(m);
  s.tone({ f, t, dur, g, type: "sawtooth", lp: bright, lp2: 500, spread: 9, send: 0.12 });
  s.tone({ f: f / 2, t, dur: dur * 0.8, g: g * 0.5, send: 0.02 });
}
/** Nota quente (Tango): triângulo filtrado com ataque macio. */
function warm(s: Synth, m: number, t: number, g: number, dur = 0.32, lp = 1800) {
  const f = s.hz(m);
  s.tone({ f, t, dur, g, type: "triangle", a: 0.012, lp, send: 0.22 });
  s.tone({ f: f * 2, t, dur: dur * 0.5, g: g * 0.12, a: 0.01, send: 0.22 });
}
/** Erro discreto: dois toques graves e abafados, descendo meio-tom. */
function softNo(s: Synth, a: number, b: number, g = 0.075, type: OscillatorType = "triangle", lp = 900) {
  s.tone({ f: s.hz(a), t: 0, dur: 0.14, g, type, lp, a: 0.008, send: 0.05 });
  s.tone({ f: s.hz(b), t: 0.1, dur: 0.2, g: g * 0.9, type, lp, a: 0.008, send: 0.05 });
}

// ---------------------------------------------------------------- base (interface e eventos comuns)

export const BASE: Theme = {
  select: (s) => { s.tone({ f: s.hz(93), dur: 0.045, g: 0.035 }); s.noise({ dur: 0.015, g: 0.02, bp: 4000 }); },
  place: (s) => glass(s, 79, 0, 0.1, 0.22),
  erase: (s) => s.tone({ f: s.hz(76), f2: s.hz(71), dur: 0.11, g: 0.05, send: 0.05 }),
  progress: (s) => { glass(s, 84, 0, 0.08, 0.25); glass(s, 88, 0.07, 0.07, 0.3); },
  complete: (s) => [79, 84, 88].forEach((m, i) => glass(s, m, i * 0.07, 0.09, 0.4)),
  error: (s) => softNo(s, 64, 63),
  undo: (s) => { s.tone({ f: s.hz(81), f2: s.hz(74), dur: 0.13, g: 0.055, send: 0.08 }); s.noise({ dur: 0.05, g: 0.012, bp: 1800, q: 0.8 }); },
  hint: (s) => { glass(s, 91, 0, 0.05, 0.45, 0.4); glass(s, 96, 0.09, 0.045, 0.55, 0.45); },
  ui: (s) => { s.noise({ dur: 0.035, g: 0.025, bp: 1700, q: 0.9 }); s.tone({ f: s.hz(84), dur: 0.07, g: 0.035, send: 0.1 }); },
  block: (s) => s.tone({ f: s.hz(55), dur: 0.1, g: 0.08, type: "triangle", lp: 650, send: 0.02 }),
  advance: (s) => {
    [76, 79, 84, 88].forEach((m, i) => glass(s, m, i * 0.09, 0.08, 0.5, 0.25));
    s.tone({ f: s.hz(96), t: 0.36, dur: 0.9, g: 0.025, send: 0.5 });
  },
  celebrate: (s) => {
    // Fanfarra curta e brilhante: chamada ascendente (sol–dó–mi) e acorde de Dó maior que se abre.
    const brass = (m: number, t: number, dur: number, g: number) => {
      const f = s.hz(m);
      s.tone({ f, t, dur, g, type: "sawtooth", a: 0.025, lp: 2600, lp2: 900, spread: 10, send: 0.3 });
      s.tone({ f, t, dur, g: g * 0.6, type: "triangle", a: 0.02, send: 0.3 });
    };
    brass(67, 0, 0.16, 0.06); brass(72, 0.14, 0.16, 0.065); brass(76, 0.28, 0.16, 0.07);
    [60, 67, 72, 76, 79].forEach((m, i) => brass(m, 0.46 + i * 0.012, 1.5, i === 0 ? 0.04 : 0.05));
    [84, 88, 91, 96].forEach((m, i) => glass(s, m, 0.5 + i * 0.08, 0.045, 0.9, 0.5));
    s.noise({ t: 0.46, dur: 1.2, g: 0.012, hp: 7000, send: 0.5 });
  },
  burst: (s) => {
    // Fogo de artifício distante: estouro grave e abafado + estalinhos que se espalham.
    s.noise({ dur: 0.22, g: 0.08, bp: 240, q: 0.8, send: 0.35 });
    s.tone({ f: 110, f2: 55, dur: 0.18, g: 0.06, send: 0.2 });
    for (let i = 0; i < 6; i++) s.noise({ t: 0.08 + Math.random() * 0.45, dur: 0.02, g: 0.012 + Math.random() * 0.012, hp: 4500, send: 0.4 });
  },
  win: (s) => {
    [72, 76, 79, 84, 88].forEach((m, i) => glass(s, m, i * 0.09, 0.1, 0.5, 0.25));
    [72, 79, 84, 88].forEach((m) => s.tone({ f: s.hz(m), t: 0.5, dur: 1.6, g: 0.035, a: 0.04, send: 0.4 }));
  },
};

// ---------------------------------------------------------------- Mini Sudoku: vidro preciso, pentatônica de Dó

const sudokuNote = (v = 1) => scale(72, v - 1); // cada número tem sua nota (1 = Dó5)

const SUDOKU: Theme = {
  select: (s) => { s.tone({ f: s.hz(96), dur: 0.04, g: 0.03 }); s.noise({ dur: 0.012, g: 0.018, bp: 5200 }); },
  place: (s, o) => glass(s, sudokuNote(o.v), 0, 0.11, 0.26),
  complete: (s, o) => {
    // Uma região: arpejo de três notas. Duas ou três de uma vez: o arpejo sobe mais.
    const notes = (o.count ?? 1) > 1 ? [79, 84, 88, 91] : [79, 84, 88];
    notes.forEach((m, i) => glass(s, m, i * 0.065, 0.085, 0.42, 0.22));
  },
  error: (s) => softNo(s, 67, 66, 0.07, "sine", 1200),
  hint: (s) => { glass(s, 91, 0, 0.05, 0.5, 0.4); glass(s, 98, 0.1, 0.04, 0.6, 0.45); },
  win: (s) => {
    // Linhas → colunas → blocos acendem (≈3 s): escala sobe e repousa num acorde de vidro.
    [72, 74, 76, 79, 81, 84, 86, 88].forEach((m, i) => glass(s, m, i * 0.1, 0.085, 0.45, 0.22));
    [72, 76, 79, 84, 88].forEach((m, i) => s.tone({ f: s.hz(m), t: 0.85 + i * 0.02, dur: 1.9, g: 0.032, a: 0.05, send: 0.42 }));
    glass(s, 96, 1.0, 0.05, 1.2, 0.55);
  },
};

// ---------------------------------------------------------------- Tango: duas vozes quentes, Ré maior

const CRISTAL_NOTE = 81; // Lá5 — agudo, brilhante
const ORBE_NOTE = 74; // Ré5 — redondo (uma quinta abaixo: os dois juntos sempre soam em harmonia)

const TANGO: Theme = {
  select: (s) => s.tone({ f: s.hz(86), dur: 0.05, g: 0.035, type: "triangle", lp: 2600, send: 0.1 }),
  place: (s, o) => o.v === 2 ? warm(s, ORBE_NOTE, 0, 0.13, 0.3, 1400) : warm(s, CRISTAL_NOTE, 0, 0.11, 0.26, 2600),
  erase: (s) => s.tone({ f: s.hz(78), f2: s.hz(74), dur: 0.12, g: 0.05, type: "triangle", lp: 1600, send: 0.1 }),
  complete: (s, o) => {
    // Linha/coluna equilibrada: acorde de Ré arpejado rápido (as duas vozes se encontram).
    const notes = (o.count ?? 1) > 1 ? [74, 78, 81, 86] : [74, 78, 81];
    notes.forEach((m, i) => warm(s, m, i * 0.05, 0.075, 0.55, 2200));
  },
  error: (s) => softNo(s, 62, 61, 0.075, "triangle", 800),
  undo: (s) => s.tone({ f: s.hz(79), f2: s.hz(72), dur: 0.15, g: 0.05, type: "triangle", lp: 1800, send: 0.12 }),
  hint: (s) => { warm(s, 86, 0, 0.045, 0.5, 3000); warm(s, 90, 0.1, 0.04, 0.6, 3000); },
  ui: (s) => s.tone({ f: s.hz(81), dur: 0.08, g: 0.035, type: "triangle", lp: 2400, send: 0.15 }),
  win: (s) => {
    // Os símbolos "dançam" (≈3 s): Ré → Sol → Ré, acordes dedilhados que se resolvem.
    const chords = [[62, 66, 69, 74], [67, 71, 74, 79], [69, 73, 76, 81], [74, 78, 81, 86]];
    chords.forEach((ch, k) => ch.forEach((m, i) => warm(s, m, k * 0.36 + i * 0.035, k === 3 ? 0.06 : 0.05, k === 3 ? 1.8 : 0.5, 2400)));
  },
};

// ---------------------------------------------------------------- Zip: synth em movimento, Lá menor pentatônica

const MINOR_PENTA = [0, 3, 5, 7, 10];
const zipNote = (pos = 0) => scale(57, Math.round(Math.min(1, Math.max(0, pos)) * 13), MINOR_PENTA); // sobe junto com o caminho

const ZIP: Theme = {
  select: (s) => { s.tone({ f: s.hz(88), dur: 0.04, g: 0.035, type: "square", lp: 3000, send: 0.05 }); },
  place: (s, o) => pluck(s, zipNote(o.pos), 0, 0.06, 0.09),
  progress: (s, o) => {
    // Número alcançado: "blip" que desliza uma quinta acima, com um brilho.
    const m = zipNote(o.pos) + 12;
    const f = s.hz(m);
    s.tone({ f, f2: f * 1.5, dur: 0.14, g: 0.07, type: "square", lp: 2800, lp2: 1200, send: 0.18 });
    s.tone({ f: f * 2, t: 0.05, dur: 0.18, g: 0.03, send: 0.3 });
    s.noise({ dur: 0.05, g: 0.015, hp: 6000 });
  },
  undo: (s, o) => { const f = s.hz(zipNote(o.pos) + 5); s.tone({ f, f2: f * 0.7, dur: 0.08, g: 0.045, type: "sawtooth", lp: 1600, lp2: 400, send: 0.05 }); },
  error: (s) => softNo(s, 57, 56, 0.06, "square", 700),
  block: (s) => s.tone({ f: s.hz(52), dur: 0.08, g: 0.07, type: "square", lp: 500, send: 0.02 }),
  hint: (s) => { const f = s.hz(84); s.tone({ f, f2: f * 1.5, dur: 0.35, g: 0.04, send: 0.45 }); s.tone({ f: f * 2, t: 0.12, dur: 0.4, g: 0.025, send: 0.5 }); },
  ui: (s) => { s.tone({ f: s.hz(76), f2: s.hz(83), dur: 0.07, g: 0.035, type: "triangle", send: 0.12 }); },
  win: (s, o) => {
    // O cometa percorre o caminho (o.span ms): notas sobem acompanhando-o e terminam num acorde aberto.
    const span = (o.span ?? 1700) / 1000, n = 14;
    for (let i = 0; i < n; i++) pluck(s, scale(57, i, MINOR_PENTA), (i / n) * span, 0.05 + (i / n) * 0.03, 0.12, 2800 + i * 120);
    [69, 76, 81, 84, 88].forEach((m, i) => s.tone({ f: s.hz(m), t: span + i * 0.015, dur: 1.5, g: 0.04, type: "triangle", a: 0.02, send: 0.45 }));
    s.noise({ t: span, dur: 0.4, g: 0.02, hp: 5000, send: 0.4 });
  },
};

// ---------------------------------------------------------------- Patches: encaixes de madeira

/** Peças maiores soam mais graves (como blocos mais pesados). */
const patchNote = (count = 4) => 84 - Math.min(14, Math.round(Math.log2(Math.max(1, count)) * 4));

const PATCHES: Theme = {
  select: (s) => wood(s, 91, 0, 0.05, 0.05),
  place: (s, o) => wood(s, patchNote(o.count), 0, 0.1, 0.12),
  erase: (s) => wood(s, 84, 0, 0.035, 0.06),
  complete: (s, o) => {
    // Peça certa: "clac" de encaixe + duas notas de confirmação.
    const m = patchNote(o.count);
    wood(s, m, 0, 0.12, 0.13);
    glass(s, m + 12, 0.06, 0.05, 0.3, 0.2);
    glass(s, m + 19, 0.12, 0.04, 0.35, 0.22);
  },
  error: (s, o) => {
    // Peça que não serve: encaixe abafado + aviso grave.
    wood(s, patchNote(o.count) - 5, 0, 0.07, 0.1);
    softNo(s, 60, 59, 0.055, "triangle", 700);
  },
  undo: (s) => { s.noise({ dur: 0.02, g: 0.03, bp: 1600 }); s.tone({ f: s.hz(79), f2: s.hz(70), dur: 0.12, g: 0.06, type: "triangle", lp: 2000, send: 0.06 }); },
  block: (s) => wood(s, 55, 0, 0.06, 0.08),
  win: (s, o) => {
    // As peças "encaixam" em onda (o.span ms): um clac por peça e, no fim, um acorde.
    const k = Math.max(1, Math.min(16, o.count ?? 6)), span = (o.span ?? 1400) / 1000;
    for (let i = 0; i < k; i++) wood(s, scale(72, i % 8), (i / k) * span, 0.07, 0.1);
    [72, 79, 84, 88].forEach((m, i) => glass(s, m, span + 0.05 + i * 0.05, 0.06, 1.3, 0.35));
  },
};

// ---------------------------------------------------------------- Astros: sinos celestes, Mi maior com brilho

/** Cada astro novo soa um degrau acima (o céu vai se completando); a marca × é um toque seco e baixo. */
const astroNote = (count = 1) => scale(76, Math.max(0, count - 1));
/** Sino: fundamental longa + parcial inarmônica curta (timbre de sininho de vidro). */
function bell(s: Synth, m: number, t: number, g: number, dur = 0.7, send = 0.35) {
  const f = s.hz(m);
  s.tone({ f, t, dur, g, send });
  s.tone({ f: f * 2.76, t, dur: dur * 0.35, g: g * 0.22, send });
  s.tone({ f: f * 5.4, t, dur: dur * 0.12, g: g * 0.06, type: "triangle", send });
}

const ASTROS: Theme = {
  select: (s) => s.tone({ f: s.hz(64), dur: 0.05, g: 0.04, type: "triangle", lp: 1200, send: 0.03 }), // marca × (anotação)
  place: (s, o) => bell(s, astroNote(o.count), 0, 0.1, 0.6),
  erase: (s) => s.tone({ f: s.hz(83), f2: s.hz(76), dur: 0.12, g: 0.045, send: 0.15 }),
  complete: (s, o) => {
    // Várias casas marcadas de uma vez: cascata curta e descendente, como poeira de estrelas.
    const k = Math.max(2, Math.min(6, Math.round((o.count ?? 3) / 3)));
    for (let i = 0; i < k; i++) bell(s, 100 - i * 3, i * 0.04, 0.025, 0.25, 0.45);
  },
  error: (s) => softNo(s, 64, 63, 0.065, "sine", 1000),
  hint: (s) => { bell(s, 88, 0, 0.045, 0.7, 0.5); bell(s, 95, 0.12, 0.04, 0.8, 0.55); },
  ui: (s) => bell(s, 88, 0, 0.03, 0.25, 0.25),
  win: (s, o) => {
    // Os astros acendem em onda: um sino por astro subindo a escala e um acorde aberto de Mi maior.
    const k = Math.max(5, Math.min(9, o.count ?? 7));
    for (let i = 0; i < k; i++) bell(s, scale(76, i), 0.5 + i * 0.12, 0.07, 0.9, 0.4);
    [64, 71, 76, 80, 83, 88].forEach((m, i) => s.tone({ f: s.hz(m), t: 0.5 + k * 0.12 + i * 0.02, dur: 2, g: 0.03, a: 0.05, send: 0.5 }));
  },
};

export const THEMES: Record<SoundGame, Theme> = { sudoku: SUDOKU, tango: TANGO, zip: ZIP, patches: PATCHES, astros: ASTROS };

/** Tema de um jogo (eventos que ele não define caem na base). Sem jogo: só a base (interface). */
export const themeFor = (g?: SoundGame): Theme => (g ? THEMES[g] : BASE);
