// Lógica pura do Tango (sem imports: usada pelo jogo, pelos testes e por scripts/gen_tango.mjs).
// Quebra-cabeça binário: cada casa recebe um de dois símbolos — 1 = Cristal (âmbar), 2 = Orbe (violeta).
// Regras: (1) nunca três símbolos iguais seguidos numa linha ou coluna; (2) cada linha e coluna tem
// a mesma quantidade de cada símbolo; (3) "=" entre duas casas: símbolos iguais; "×": diferentes.

export type TGrid = number[][];
export type Cell = [number, number];
export interface Sign { r: number; c: number; dir: "h" | "v"; same: boolean } // h: (r,c)–(r,c+1); v: (r,c)–(r+1,c)
export interface TangoBoard { n: number; givens: TGrid; signs: Sign[] }
export interface Line { kind: "linha" | "coluna"; i: number; cells: Cell[] }

export const CRISTAL = 1, ORBE = 2;
export const other = (v: number) => (v === CRISTAL ? ORBE : CRISTAL);
export const cloneT = (g: TGrid): TGrid => g.map((row) => [...row]);

/** Formato: "6|<n·n casas: . 1 2>|h0,1=;v2,3x" */
export function parseTango(raw: string): TangoBoard {
  const [ns, cells, sg = ""] = raw.split("|");
  const n = Number(ns);
  const givens = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
    const ch = cells[r * n + c];
    return ch === "1" ? CRISTAL : ch === "2" ? ORBE : 0;
  }));
  const signs = sg ? sg.split(";").map((s): Sign => {
    const m = /^([hv])(\d+),(\d+)([=x])$/.exec(s);
    if (!m) throw new Error(`Sinal inválido: ${s}`);
    return { dir: m[1] as "h" | "v", r: +m[2], c: +m[3], same: m[4] === "=" };
  }) : [];
  return { n, givens, signs };
}
export function encodeTango(b: TangoBoard): string {
  const cells = b.givens.map((row) => row.map((v) => (v ? String(v) : ".")).join("")).join("");
  return `${b.n}|${cells}|${b.signs.map((s) => `${s.dir}${s.r},${s.c}${s.same ? "=" : "x"}`).join(";")}`;
}

export const signCells = (s: Sign): [Cell, Cell] => [[s.r, s.c], s.dir === "h" ? [s.r, s.c + 1] : [s.r + 1, s.c]];

const lineCache = new Map<number, Line[]>();
export function linesOf(n: number): Line[] {
  let ls = lineCache.get(n);
  if (!ls) {
    ls = [];
    for (let i = 0; i < n; i++) ls.push({ kind: "linha", i, cells: Array.from({ length: n }, (_, k): Cell => [i, k]) });
    for (let i = 0; i < n; i++) ls.push({ kind: "coluna", i, cells: Array.from({ length: n }, (_, k): Cell => [k, i]) });
    lineCache.set(n, ls);
  }
  return ls;
}

// ---------- Validação ----------
export type ProblemKind = "trio" | "excesso" | "sinal";
export interface Problem { kind: ProblemKind; cells: Cell[]; line?: Line; v?: number; same?: boolean }

/** Tudo o que quebra as regras na grade atual (casas vazias não contam como erro). */
export function findProblems(g: TGrid, signs: Sign[]): Problem[] {
  const n = g.length, half = n / 2, out: Problem[] = [];
  for (const line of linesOf(n)) {
    const vals = line.cells.map(([r, c]) => g[r][c]);
    for (const v of [CRISTAL, ORBE]) {
      if (vals.filter((x) => x === v).length > half) out.push({ kind: "excesso", line, v, cells: line.cells.filter(([r, c]) => g[r][c] === v) });
    }
    for (let k = 0; k + 2 < n; k++) {
      if (vals[k] && vals[k] === vals[k + 1] && vals[k] === vals[k + 2]) out.push({ kind: "trio", line, v: vals[k], cells: line.cells.slice(k, k + 3) });
    }
  }
  for (const s of signs) {
    const [[ar, ac], [br, bc]] = signCells(s);
    const a = g[ar][ac], b = g[br][bc];
    if (a && b && (a === b) !== s.same) out.push({ kind: "sinal", same: s.same, cells: [[ar, ac], [br, bc]] });
  }
  return out;
}

export const isFullT = (g: TGrid) => g.every((row) => row.every((v) => v !== 0));
export const isTangoSolved = (g: TGrid, signs: Sign[]) => isFullT(g) && findProblems(g, signs).length === 0;
export const filledT = (g: TGrid) => g.reduce((s, row) => s + row.filter((v) => v).length, 0);

// ---------- Deduções (usadas nas dicas e no solucionador lógico) ----------
export type Reason = "sinal" | "par" | "sanduiche" | "contagem" | "hipotese";
export interface Deduction { r: number; c: number; v: number; reason: Reason; from: Cell[]; line?: Line; same?: boolean; tried?: number }

/** Primeira dedução direta encontrada (sinais, pares, sanduíches e contagem). */
export function basicDeduction(g: TGrid, signs: Sign[]): Deduction | null {
  const n = g.length, half = n / 2;
  for (const s of signs) {
    const [a, b] = signCells(s);
    const va = g[a[0]][a[1]], vb = g[b[0]][b[1]];
    if (va && !vb) return { r: b[0], c: b[1], v: s.same ? va : other(va), reason: "sinal", from: [a], same: s.same };
    if (vb && !va) return { r: a[0], c: a[1], v: s.same ? vb : other(vb), reason: "sinal", from: [b], same: s.same };
  }
  const lines = linesOf(n);
  for (const line of lines) {
    const L = line.cells, val = (k: number) => g[L[k][0]][L[k][1]];
    for (let k = 0; k + 1 < n; k++) {
      const x = val(k);
      if (!x || x !== val(k + 1)) continue;
      for (const e of [k - 1, k + 2]) {
        if (e >= 0 && e < n && !val(e)) return { r: L[e][0], c: L[e][1], v: other(x), reason: "par", from: [L[k], L[k + 1]], line };
      }
    }
    for (let k = 0; k + 2 < n; k++) {
      const x = val(k);
      if (x && x === val(k + 2) && !val(k + 1)) return { r: L[k + 1][0], c: L[k + 1][1], v: other(x), reason: "sanduiche", from: [L[k], L[k + 2]], line };
    }
  }
  for (const line of lines) {
    const vals = line.cells.map(([r, c]) => g[r][c]);
    const empty = vals.indexOf(0);
    if (empty < 0) continue;
    for (const v of [CRISTAL, ORBE]) {
      if (vals.filter((x) => x === v).length === half) {
        const [r, c] = line.cells[empty];
        return { r, c, v: other(v), reason: "contagem", from: line.cells.filter(([rr, cc]) => g[rr][cc] === v), line };
      }
    }
  }
  return null;
}

/** Aplica deduções diretas até travar. ok = false se surgir uma contradição. */
export function propagate(start: TGrid, signs: Sign[]): { grid: TGrid; ok: boolean } {
  const g = cloneT(start);
  for (;;) {
    if (findProblems(g, signs).length) return { grid: g, ok: false };
    const d = basicDeduction(g, signs);
    if (!d) return { grid: g, ok: true };
    g[d.r][d.c] = d.v;
  }
}

/** Próximo passo lógico. Se nenhuma dedução direta servir, testa hipóteses: se um símbolo
 *  leva a uma contradição, a casa só pode ter o outro. */
export function nextDeduction(g: TGrid, signs: Sign[], advanced = true): Deduction | null {
  const d = basicDeduction(g, signs);
  if (d || !advanced) return d;
  const n = g.length;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (g[r][c]) continue;
    for (const v of [CRISTAL, ORBE]) {
      const t = cloneT(g); t[r][c] = v;
      if (!propagate(t, signs).ok) return { r, c, v: other(v), reason: "hipotese", from: [], tried: v };
    }
  }
  return null;
}

/** Resolve só com lógica (sem chutes). Devolve null se travar ou se a grade for inválida. */
export function solveLogically(givens: TGrid, signs: Sign[], advanced = true): TGrid | null {
  const g = cloneT(givens);
  for (;;) {
    if (findProblems(g, signs).length) return null;
    if (isFullT(g)) return g;
    const d = nextDeduction(g, signs, advanced);
    if (!d) return null;
    g[d.r][d.c] = d.v;
  }
}

/** Conta soluções por tentativa e erro (até `limit`) — prova que cada nível tem resposta única. */
export function countTangoSolutions(givens: TGrid, signs: Sign[], limit = 2): number {
  const n = givens.length, half = n / 2, g = cloneT(givens);
  if (findProblems(g, signs).length) return 0;
  const touching: Sign[][] = Array.from({ length: n * n }, () => []);
  for (const s of signs) for (const [r, c] of signCells(s)) touching[r * n + c].push(s);
  const okAt = (r: number, c: number): boolean => {
    let row1 = 0, row2 = 0, col1 = 0, col2 = 0;
    for (let k = 0; k < n; k++) {
      if (g[r][k] === 1) row1++; else if (g[r][k] === 2) row2++;
      if (g[k][c] === 1) col1++; else if (g[k][c] === 2) col2++;
    }
    if (row1 > half || row2 > half || col1 > half || col2 > half) return false;
    const v = g[r][c];
    for (let k = Math.max(0, c - 2); k <= Math.min(n - 3, c); k++) if (g[r][k] === v && g[r][k + 1] === v && g[r][k + 2] === v) return false;
    for (let k = Math.max(0, r - 2); k <= Math.min(n - 3, r); k++) if (g[k][c] === v && g[k + 1][c] === v && g[k + 2][c] === v) return false;
    for (const s of touching[r * n + c]) {
      const [[ar, ac], [br, bc]] = signCells(s);
      const a = g[ar][ac], b = g[br][bc];
      if (a && b && (a === b) !== s.same) return false;
    }
    return true;
  };
  let found = 0;
  const dfs = (i: number) => {
    if (found >= limit) return;
    if (i === n * n) { found++; return; }
    const r = Math.floor(i / n), c = i % n;
    if (g[r][c]) return dfs(i + 1);
    for (const v of [CRISTAL, ORBE]) {
      g[r][c] = v;
      if (okAt(r, c)) dfs(i + 1);
      g[r][c] = 0;
    }
  };
  dfs(0);
  return found;
}
