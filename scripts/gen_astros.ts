// Gera src/lib/data/astrosLevels.ts — os 100 céus do Astros (jogo bônus).
//   npx vite-node scripts/gen_astros.ts
// Capítulos 1–2: 5×5 · 3–4: 6×6 · 5–6: 7×7 · 7–8: 8×8 · 9–10: 9×9.
// Cada céu: solução única (conferida por força bruta) e resolvível só com lógica (motor de src/lib/astrosLogic.ts,
// o mesmo da Dica). Dentro de cada tamanho, a dificuldade cresce pelo raciocínio exigido e pela quantidade de
// passos. Determinístico (semente fixa): rodar de novo gera os mesmos céus.
import { writeFileSync } from "node:fs";
import { type AstrosBoard, countSolutions, encodeAstros, logicSteps, solveAll, TIER } from "../src/lib/astrosLogic";

function rngOf(seed: number) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
type Rng = () => number;
const shuffle = <T,>(r: Rng, xs: T[]) => { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Uma posição de astros válida: um por linha e coluna, sem vizinhos (coluna de cada linha). */
function randomSolution(r: Rng, n: number): number[] | null {
  const col: number[] = [];
  const used = new Set<number>();
  const go = (y: number): boolean => {
    if (y === n) return true;
    for (const c of shuffle(r, [...Array(n).keys()])) {
      if (used.has(c) || (y > 0 && Math.abs(col[y - 1] - c) <= 1)) continue;
      used.add(c); col[y] = c;
      if (go(y + 1)) return true;
      used.delete(c);
    }
    return false;
  };
  return go(0) ? col.slice() : null;
}

/** Constelações crescendo a partir de cada astro (crescimento aleatório, com regiões de tamanhos variados). */
function growRegions(r: Rng, n: number, sol: number[]): number[][] {
  const reg = Array.from({ length: n }, () => Array<number>(n).fill(-1));
  const weight = Array.from({ length: n }, () => 0.35 + r() * 1.3); // algumas constelações crescem mais
  sol.forEach((c, y) => { reg[y][c] = y; });
  let left = n * n - n;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (left > 0) {
    // escolhe uma constelação pelo peso e uma casa livre vizinha dela
    const total = weight.reduce((a, b) => a + b, 0);
    let x = r() * total, k = 0;
    while (x > weight[k]) { x -= weight[k]; k++; }
    const front: [number, number][] = [];
    for (let y = 0; y < n; y++) for (let c = 0; c < n; c++) {
      if (reg[y][c] !== k) continue;
      for (const [dy, dc] of dirs) { const yy = y + dy, cc = c + dc; if (yy >= 0 && yy < n && cc >= 0 && cc < n && reg[yy][cc] === -1) front.push([yy, cc]); }
    }
    if (!front.length) { weight[k] *= 0.2; if (weight.every((w) => w < 1e-6)) break; continue; }
    const [yy, cc] = front[Math.floor(r() * front.length)];
    reg[yy][cc] = k; left--;
  }
  return reg;
}

/** A constelação k continua sendo uma peça só (sem ilhas)? */
function connected(reg: number[][], k: number): boolean {
  const n = reg.length;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let c = 0; c < n; c++) if (reg[y][c] === k) cells.push([y, c]);
  if (!cells.length) return false;
  const seen = new Set([`${cells[0][0]},${cells[0][1]}`]);
  const stack = [cells[0]];
  while (stack.length) {
    const [y, c] = stack.pop()!;
    for (const [dy, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const yy = y + dy, cc = c + dc;
      if (yy < 0 || yy >= n || cc < 0 || cc >= n || reg[yy][cc] !== k || seen.has(`${yy},${cc}`)) continue;
      seen.add(`${yy},${cc}`); stack.push([yy, cc]);
    }
  }
  return seen.size === cells.length;
}

/**
 * Reparo de unicidade: enquanto houver uma segunda solução, uma casa onde ela põe um astro (e a solução
 * planejada não) passa para uma constelação vizinha — sem mexer nos astros planejados e sem partir regiões.
 */
function repair(r: Rng, b: AstrosBoard, sol: number[], rounds = 80): boolean {
  const { n, regions } = b;
  const isSol = (y: number, c: number) => sol[y] === c;
  for (let i = 0; i < rounds; i++) {
    const all = solveAll(b, 2);
    if (all.length === 1) return true;
    const other = all.find((s) => s.some((c, y) => c !== sol[y]))!;
    const spots = shuffle(r, other.map((c, y) => [y, c] as [number, number]).filter(([y, c]) => !isSol(y, c)));
    let moved = false;
    for (const [y, c] of spots) {
      const from = regions[y][c];
      const near = shuffle(r, [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dy, dc]) => [y + dy, c + dc]).filter(([yy, cc]) => yy >= 0 && yy < n && cc >= 0 && cc < n).map(([yy, cc]) => regions[yy][cc]).filter((k) => k !== from));
      for (const to of near) {
        regions[y][c] = to;
        if (connected(regions, from)) { moved = true; break; }
        regions[y][c] = from;
      }
      if (moved) break;
    }
    if (!moved) return false;
  }
  return countSolutions(b, 2) === 1;
}

interface Cand { raw: string; tier: number; steps: number; score: number }

function poolFor(n: number, want: number, seed: number): Cand[] {
  const r = rngOf(seed);
  const out: Cand[] = [];
  const seen = new Set<string>();
  for (let tries = 0; out.length < want && tries < 400_000; tries++) {
    const sol = randomSolution(r, n);
    if (!sol) continue;
    const regions = growRegions(r, n, sol);
    if (regions.some((row) => row.includes(-1))) continue;
    const b: AstrosBoard = { n, regions };
    if (!repair(r, b, sol)) continue;
    const L = logicSteps(b);
    if (!L.solved) continue;
    const raw = encodeAstros(b);
    if (seen.has(raw)) continue;
    seen.add(raw);
    const hard = L.steps.filter((s) => TIER[s.reason] >= 2).length;
    out.push({ raw, tier: L.tier, steps: L.steps.length, score: L.tier * 100 + hard * 6 + L.steps.length });
  }
  return out;
}

const SIZES = [5, 6, 7, 8, 9];
const raws: string[] = [];
const report: string[] = [];
SIZES.forEach((n, si) => {
  const pool = poolFor(n, n <= 6 ? 160 : 120, 7919 * (si + 1)).sort((a, b) => a.score - b.score);
  if (pool.length < 20) throw new Error(`${n}×${n}: só ${pool.length} céus`);
  // 20 níveis espalhados do mais fácil ao mais difícil do conjunto (sem repetir).
  const picked: Cand[] = [];
  for (let i = 0; i < 20; i++) picked.push(pool[Math.round((i * (pool.length - 1)) / 19)]);
  raws.push(...picked.map((p) => p.raw));
  report.push(`${n}×${n}: ${pool.length} candidatos · níveis ${picked.map((p) => p.tier).join("")}`);
});

writeFileSync("src/lib/data/astrosLevels.ts",
  `// GERADO por scripts/gen_astros.ts — não edite à mão.\n// Cada nível: "tamanho|constelações". Constelações: uma letra por casa, linha a linha (a = 1ª constelação).\nexport const ASTROS_RAW: string[] = [\n${raws.map((x) => ` "${x}",`).join("\n")}\n];\n`);
console.log(report.join("\n"));
