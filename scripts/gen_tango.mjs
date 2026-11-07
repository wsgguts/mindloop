#!/usr/bin/env node
// Gera os 100 níveis do Tango em src/lib/data/tangoLevels.ts.
// Cada nível é resolvível SÓ COM LÓGICA (as mesmas deduções usadas nas dicas do jogo) — o que também
// garante solução única. A dificuldade cresce com o tamanho da grade, com menos pistas e,
// nos capítulos 7 e 10, com passos que exigem testar hipóteses.
// Uso (Node 22.6+ com suporte a TypeScript): node scripts/gen_tango.mjs
import { writeFileSync } from "node:fs";
import { encodeTango, findProblems, solveLogically, CRISTAL, ORBE } from "../src/lib/tangoLogic.ts";

// Capítulo → tamanho, pistas mantidas (0 = o mínimo possível), quantidade de sinais, se aceita hipóteses.
const SPEC = [
  { n: 4, keep: 8, signs: 0, adv: false }, // 1 Primeiros símbolos
  { n: 4, keep: 0, signs: 2, adv: false }, // 2 Sinais no caminho
  { n: 6, keep: 17, signs: 2, adv: false }, // 3 Grade maior
  { n: 6, keep: 13, signs: 3, adv: false }, // 4
  { n: 6, keep: 10, signs: 5, adv: false }, // 5
  { n: 6, keep: 0, signs: 5, adv: false }, // 6
  { n: 6, keep: 0, signs: 4, adv: true }, // 7
  { n: 8, keep: 28, signs: 4, adv: false }, // 8
  { n: 8, keep: 0, signs: 6, adv: false }, // 9
  { n: 8, keep: 0, signs: 6, adv: true }, // 10
];

// Gerador pseudoaleatório com semente: os níveis saem sempre iguais.
let seed = 20261107;
const rand = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function randomSolution(n) {
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  const fill = (i) => {
    if (i === n * n) return true;
    const r = Math.floor(i / n), c = i % n;
    for (const v of shuffle([CRISTAL, ORBE])) {
      g[r][c] = v;
      if (!findProblems(g, []).length && fill(i + 1)) return true;
    }
    g[r][c] = 0;
    return false;
  };
  fill(0);
  return g;
}

function makeLevel({ n, keep, signs: nSigns, adv }) {
  const sol = randomSolution(n);
  const pairs = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (c + 1 < n) pairs.push({ r, c, dir: "h" });
    if (r + 1 < n) pairs.push({ r, c, dir: "v" });
  }
  const signs = shuffle(pairs).slice(0, nSigns).map((p) => {
    const b = p.dir === "h" ? sol[p.r][p.c + 1] : sol[p.r + 1][p.c];
    return { ...p, same: sol[p.r][p.c] === b };
  });
  const givens = sol.map((row) => [...row]);
  let count = n * n;
  for (const i of shuffle([...Array(n * n).keys()])) {
    if (keep && count <= keep) break;
    const r = Math.floor(i / n), c = i % n, v = givens[r][c];
    givens[r][c] = 0;
    if (solveLogically(givens, signs, adv)) count--;
    else givens[r][c] = v;
  }
  return { board: { n, givens, signs }, count };
}

const out = [];
const seen = new Set();
SPEC.forEach((spec, ch) => {
  const levels = [];
  while (levels.length < 10) {
    const { board, count } = makeLevel(spec);
    const raw = encodeTango(board);
    if (seen.has(raw)) continue;
    seen.add(raw);
    levels.push({ raw, count, signs: board.signs.length });
  }
  // Dentro do capítulo, do mais fácil (mais pistas) para o mais difícil.
  levels.sort((a, b) => b.count + b.signs - (a.count + a.signs));
  out.push(...levels.map((l) => l.raw));
  console.log(`Capítulo ${ch + 1}: ${spec.n}×${spec.n}, pistas ${levels.map((l) => l.count).join(" ")}`);
});

writeFileSync(new URL("../src/lib/data/tangoLevels.ts", import.meta.url),
  `// GERADO por scripts/gen_tango.mjs — não edite à mão.
// Cada nível: "tamanho|casas|sinais". Casas: "." vazia, "1" Cristal, "2" Orbe.
// Sinais separados por ";": h = entre (linha,coluna) e a casa à direita; v = e a casa abaixo; "=" iguais, "x" diferentes.
export const TANGO_RAW: string[] = [
${out.map((s) => ` "${s}",`).join("\n")}
];
`);
console.log(`${out.length} níveis gravados.`);
