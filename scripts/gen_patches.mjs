#!/usr/bin/env node
// Gera os 100 níveis do Patches em src/lib/data/patchesLevels.ts.
// Cada nível tem SOLUÇÃO ÚNICA (conferida por busca exaustiva) e se resolve SÓ COM LÓGICA
// (as mesmas deduções usadas nas dicas do jogo). A dificuldade cresce com o tamanho da grade,
// com peças maiores, com MENOS etiquetas de formato (quadrada / em pé / deitada) e, nos capítulos 8 e 10,
// com passos que exigem o raciocínio de "casas reservadas".
// Uso (Node 22.6+ com suporte a TypeScript): node scripts/gen_patches.mjs
import { writeFileSync } from "node:fs";
import { countPatchesSolutions, encodePatches, kindOf, solveLogically } from "../src/lib/patchesLogic.ts";

// Capítulo → tamanho, maior peça, fração de números que mostram o formato da peça,
// se exige "reserva" (true = pelo menos metade dos níveis precisa dela).
const SPEC = [
  { n: 5, max: 6, shown: 1, reserve: false }, // 1 Primeiras peças: todo número mostra o formato
  { n: 5, max: 8, shown: 1, reserve: false }, // 2 Encaixe certo
  { n: 6, max: 8, shown: 0.8, reserve: false }, // 3 Grade 6×6
  { n: 6, max: 10, shown: 0.7, reserve: false }, // 4 Peças maiores
  { n: 7, max: 10, shown: 0.6, reserve: false }, // 5 Cantos e bordas
  { n: 7, max: 12, shown: 0.5, reserve: false }, // 6 Só um lugar
  { n: 8, max: 12, shown: 0.5, reserve: false }, // 7 Grade 8×8
  { n: 8, max: 14, shown: 0.4, reserve: true }, // 8 Casas reservadas
  { n: 9, max: 14, shown: 0.3, reserve: false }, // 9 Grade 9×9
  { n: 9, max: 16, shown: 0.2, reserve: true }, // 10 Mestre do encaixe (o mínimo de formatos)
];

// Gerador pseudoaleatório com semente: os níveis saem sempre iguais.
let seed = 20261108;
const rand = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rand() * a.length)];

/** Divide a grade em retângulos (lendo da esquerda para a direita, de cima para baixo). */
function randomPartition(n, max) {
  const own = Array(n * n).fill(false);
  const rects = [];
  for (let i = 0; i < n * n; i++) {
    if (own[i]) continue;
    const r = Math.floor(i / n), c = i % n;
    const byArea = new Map();
    for (let h = 1; r + h <= n; h++) for (let w = 1; c + w <= n; w++) {
      const a = h * w;
      if (a > max) break;
      let ok = true;
      for (let y = r; y < r + h && ok; y++) for (let x = c; x < c + w && ok; x++) if (own[y * n + x]) ok = false;
      if (!ok) break;
      if (a >= 2) byArea.set(a, [...(byArea.get(a) ?? []), { r, c, h, w }]);
    }
    if (!byArea.size) return null; // sobrou uma casa isolada: tenta outra divisão
    // Sorteia primeiro o tamanho (todos igualmente prováveis) e depois o formato.
    const q = pick(pick([...byArea.values()]));
    for (let y = q.r; y < q.r + q.h; y++) for (let x = q.c; x < q.c + q.w; x++) own[y * n + x] = true;
    rects.push(q);
  }
  return rects;
}

const cellsOf = (q) => { const out = []; for (let y = q.r; y < q.r + q.h; y++) for (let x = q.c; x < q.c + q.w; x++) out.push([y, x]); return out; };

/** Uma divisão + a casa do número de cada peça, ajustada até o nível se resolver só com lógica. */
function makeLevel({ n, max, shown, reserve }) {
  for (;;) {
    const rects = randomPartition(n, max);
    if (!rects) continue;
    const spots = rects.map((q) => pick(cellsOf(q)));
    const kinds = rects.map(kindOf); // começa mostrando o formato de todas as peças
    const board = () => ({ n, clues: rects.map((q, i) => ({ r: spots[i][0], c: spots[i][1], v: q.h * q.w, kind: kinds[i] })) });
    let best = solveLogically(board(), [], true).placed;
    // Subida de encosta: move números dentro da própria peça enquanto isso ajudar a lógica a avançar.
    for (let tries = 0; tries < 200 && best < rects.length; tries++) {
      const k = Math.floor(rand() * rects.length);
      const old = spots[k];
      spots[k] = pick(cellsOf(rects[k]));
      const now = solveLogically(board(), [], true).placed;
      if (now >= best) best = now; else spots[k] = old;
    }
    if (!solveLogically(board(), [], true).pieces || countPatchesSolutions(board(), 2) !== 1) continue;
    // Esconde formatos (vira "qualquer formato") enquanto o nível continuar com solução única e lógica.
    const target = Math.ceil(shown * rects.length);
    let visible = rects.length;
    for (const i of [...rects.keys()].sort(() => rand() - 0.5)) {
      if (visible <= target) break;
      const old = kinds[i];
      kinds[i] = "a";
      const t = board();
      const ok = solveLogically(t, [], reserve).pieces && countPatchesSolutions(t, 2) === 1;
      if (ok) visible--; else kinds[i] = old;
    }
    const b = board();
    const full = solveLogically(b, [], true);
    if (!full.pieces) continue;
    if (countPatchesSolutions(b, 2) !== 1) continue;
    const easy = solveLogically(b, [], false).pieces !== null;
    return { board: b, needsReserve: !easy, steps: full.reserve, pieces: rects.length, big: Math.max(...rects.map((q) => q.h * q.w)), visible };
  }
}

const out = [];
const seen = new Set();
SPEC.forEach((spec, ch) => {
  const levels = [];
  let hard = 0;
  while (levels.length < 10) {
    const l = makeLevel(spec);
    const raw = encodePatches(l.board);
    if (seen.has(raw)) continue;
    // Capítulos sem "reserva": só níveis que dispensam esse raciocínio.
    if (!spec.reserve && l.needsReserve) continue;
    // Capítulos com "reserva": pelo menos 5 dos 10 níveis precisam dele.
    if (spec.reserve && !l.needsReserve && levels.length - hard >= 5) continue;
    seen.add(raw);
    if (l.needsReserve) hard++;
    levels.push({ raw, score: l.needsReserve * 100 + l.steps * 10 - l.pieces + l.big - l.visible * 3 });
  }
  // Dentro do capítulo, do mais fácil para o mais difícil.
  levels.sort((a, b) => a.score - b.score);
  out.push(...levels.map((l) => l.raw));
  console.log(`Capítulo ${ch + 1}: ${spec.n}×${spec.n}, peças até ${spec.max}, formatos visíveis ~${Math.round(spec.shown * 100)}%, ${hard} com casas reservadas`);
});

writeFileSync(new URL("../src/lib/data/patchesLevels.ts", import.meta.url),
  `// GERADO por scripts/gen_patches.mjs — não edite à mão.
// Cada nível: "tamanho|casas|formatos". Casas: "." vazia; 1–9 e a–z (10–35) são os números das peças.
// Formatos (um por número, na ordem de leitura): q quadrada, v em pé, h deitada, a qualquer formato.
export const PATCHES_RAW: string[] = [
${out.map((s) => ` "${s}",`).join("\n")}
];
`);
console.log(`${out.length} níveis gravados.`);
