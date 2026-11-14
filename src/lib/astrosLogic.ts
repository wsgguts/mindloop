// Astros — regras, conferência, resolução e dedução lógica (funções puras, usadas pelo jogo, pelo gerador de
// níveis e pelos testes).
//
// O céu é uma grade n×n dividida em n CONSTELAÇÕES (regiões coloridas). O objetivo é colocar n astros:
//   • exatamente um em cada linha;
//   • exatamente um em cada coluna;
//   • exatamente um em cada constelação;
//   • e dois astros nunca se encostam — nem de lado, nem na diagonal.
// Cada casa pode estar vazia, marcada com × (anotação da pessoa: "aqui não tem astro") ou com um astro.
//
// O motor de dedução (logicSteps) resolve como uma pessoa resolveria, do raciocínio mais simples ao mais
// elaborado. O nível mais alto que um céu exige define a dificuldade dele, e a Dica mostra o próximo passo.

export const EMPTY = 0, MARK = 1, STAR = 2;
export type AGrid = number[][];
export type Cell = [number, number];

export interface AstrosBoard {
  n: number;
  /** Constelação (0..n−1) de cada casa. */
  regions: number[][];
}

/** "5|aabbc…": tamanho e a constelação de cada casa, linha a linha (a = 0, b = 1, …). */
export function parseAstros(raw: string): AstrosBoard {
  const [size, cells] = raw.split("|");
  const n = Number(size);
  const regions = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => cells.charCodeAt(r * n + c) - 97));
  return { n, regions };
}
export const encodeAstros = (b: AstrosBoard): string => `${b.n}|${b.regions.flat().map((v) => String.fromCharCode(97 + v)).join("")}`;

export const emptyGrid = (n: number): AGrid => Array.from({ length: n }, () => Array<number>(n).fill(EMPTY));
export const cloneA = (g: AGrid): AGrid => g.map((row) => row.slice());
export const starsOf = (g: AGrid): Cell[] => g.flatMap((row, r) => row.flatMap((v, c) => (v === STAR ? [[r, c] as Cell] : [])));
export const touching = ([a, b]: Cell, [c, d]: Cell): boolean => !(a === c && b === d) && Math.abs(a - c) <= 1 && Math.abs(b - d) <= 1;

// ---------------------------------------------------------------- conferência

export type ProblemKind = "linha" | "coluna" | "constelacao" | "vizinhos";
export interface Problem { kind: ProblemKind; cells: Cell[]; /** Linha, coluna ou constelação em conflito. */ i?: number }

/** Regras quebradas pelos astros colocados (as marcas × nunca são erro). */
export function findProblems(g: AGrid, b: AstrosBoard): Problem[] {
  const stars = starsOf(g);
  const out: Problem[] = [];
  const group = (kind: ProblemKind, key: (s: Cell) => number) => {
    const m = new Map<number, Cell[]>();
    for (const s of stars) m.set(key(s), [...(m.get(key(s)) ?? []), s]);
    for (const [i, cells] of m) if (cells.length > 1) out.push({ kind, cells, i });
  };
  group("linha", ([r]) => r);
  group("coluna", ([, c]) => c);
  group("constelacao", ([r, c]) => b.regions[r][c]);
  for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
    if (touching(stars[i], stars[j])) out.push({ kind: "vizinhos", cells: [stars[i], stars[j]] });
  }
  return out;
}

export function isAstrosSolved(g: AGrid, b: AstrosBoard): boolean {
  return starsOf(g).length === b.n && findProblems(g, b).length === 0;
}

// ---------------------------------------------------------------- resolução (força bruta, para unicidade)

/** Coluna do astro de cada linha em cada solução (para no `limit`). */
export function solveAll(b: AstrosBoard, limit = 2): number[][] {
  const { n, regions } = b;
  const out: number[][] = [];
  const col = Array<number>(n).fill(-1);
  const usedC = Array<boolean>(n).fill(false), usedR = Array<boolean>(n).fill(false);
  const go = (r: number) => {
    if (out.length >= limit) return;
    if (r === n) { out.push(col.slice()); return; }
    for (let c = 0; c < n; c++) {
      if (usedC[c] || usedR[regions[r][c]]) continue;
      if (r > 0 && Math.abs(col[r - 1] - c) <= 1) continue;
      usedC[c] = usedR[regions[r][c]] = true; col[r] = c;
      go(r + 1);
      usedC[c] = usedR[regions[r][c]] = false;
    }
  };
  go(0);
  return out;
}
export const countSolutions = (b: AstrosBoard, limit = 2): number => solveAll(b, limit).length;
/** A solução (se for única) como grade com astros. */
export function solutionGrid(b: AstrosBoard): AGrid | null {
  const s = solveAll(b, 2);
  if (s.length !== 1) return null;
  const g = emptyGrid(b.n);
  s[0].forEach((c, r) => { g[r][c] = STAR; });
  return g;
}

// ---------------------------------------------------------------- dedução lógica

/**
 * Motivos de cada passo (do mais simples ao mais elaborado):
 *  única-*    : a linha / coluna / constelação só tem uma casa possível → astro ali.
 *  faixa-*    : as casas possíveis de uma constelação ficam todas numa linha (ou coluna) → o resto daquela
 *               linha não pode ter astro.
 *  presa-*    : as casas possíveis de uma linha (ou coluna) ficam todas numa constelação → o resto da
 *               constelação não pode ter astro.
 *  bloqueio   : um astro nesta casa apagaria todas as casas possíveis de outra linha, coluna ou constelação.
 *  faixas-*   : k constelações cabem, juntas, em k linhas (ou colunas) → essas linhas são delas.
 */
export type Reason =
  | "unica-constelacao" | "unica-linha" | "unica-coluna"
  | "faixa-linha" | "faixa-coluna" | "presa-linha" | "presa-coluna"
  | "bloqueio" | "faixas-linhas" | "faixas-colunas";

/** Nível de raciocínio de cada motivo (define a dificuldade de um céu). */
export const TIER: Record<Reason, number> = {
  "unica-constelacao": 1, "unica-linha": 1, "unica-coluna": 1,
  "faixa-linha": 2, "faixa-coluna": 2, "presa-linha": 2, "presa-coluna": 2,
  bloqueio: 3, "faixas-linhas": 4, "faixas-colunas": 4,
};

export type UnitKind = "linha" | "coluna" | "constelacao";
export interface Step {
  kind: "star" | "elim";
  reason: Reason;
  /** Casas que recebem o astro (1) ou que ficam sem astro (×). */
  cells: Cell[];
  /** Unidade que justifica o passo (a constelação presa, a linha com uma casa só, a unidade bloqueada…). */
  unit?: { kind: UnitKind; i: number };
  /** Grupo de unidades (faixas-*): as constelações e as linhas/colunas envolvidas. */
  regions?: number[];
  lines?: number[];
}

interface State { n: number; regions: number[][]; cand: boolean[]; star: boolean[] }

const unitCells = (s: State, kind: UnitKind, i: number): number[] => {
  const { n } = s;
  const out: number[] = [];
  for (let k = 0; k < n * n; k++) {
    const r = Math.floor(k / n), c = k % n;
    if (kind === "linha" ? r === i : kind === "coluna" ? c === i : s.regions[r][c] === i) out.push(k);
  }
  return out;
};

/** Casas que um astro em `k` apaga (mesma linha, coluna, constelação e as 8 vizinhas). */
function shadow(s: State, k: number): number[] {
  const { n } = s;
  const r = Math.floor(k / n), c = k % n, reg = s.regions[r][c];
  const out: number[] = [];
  for (let j = 0; j < n * n; j++) {
    if (j === k) continue;
    const y = Math.floor(j / n), x = j % n;
    if (y === r || x === c || s.regions[y][x] === reg || (Math.abs(y - r) <= 1 && Math.abs(x - c) <= 1)) out.push(j);
  }
  return out;
}

function place(s: State, k: number) {
  s.star[k] = true; s.cand[k] = false;
  for (const j of shadow(s, k)) s.cand[j] = false;
}

const KINDS: UnitKind[] = ["constelacao", "linha", "coluna"];
const toCell = (n: number, k: number): Cell => [Math.floor(k / n), k % n];

function combos(xs: number[], k: number): number[][] {
  if (k === 0) return [[]];
  const out: number[][] = [];
  xs.forEach((x, i) => { for (const rest of combos(xs.slice(i + 1), k - 1)) out.push([x, ...rest]); });
  return out;
}

/** Próximo passo lógico a partir do estado (ou null se nenhum raciocínio conhecido avança). */
function findStep(s: State): Step | null {
  const { n } = s;
  const open = (kind: UnitKind, i: number) => !unitCells(s, kind, i).some((k) => s.star[k]);
  const candsOf = (kind: UnitKind, i: number) => unitCells(s, kind, i).filter((k) => s.cand[k]);
  const rowOf = (k: number) => Math.floor(k / n), colOf = (k: number) => k % n;
  const regOf = (k: number) => s.regions[rowOf(k)][colOf(k)];

  // 1) Uma casa só.
  for (const kind of KINDS) for (let i = 0; i < n; i++) {
    if (!open(kind, i)) continue;
    const cs = candsOf(kind, i);
    if (cs.length === 1) return { kind: "star", reason: kind === "constelacao" ? "unica-constelacao" : kind === "linha" ? "unica-linha" : "unica-coluna", cells: [toCell(n, cs[0])], unit: { kind, i } };
  }
  // 2) Constelação presa numa linha/coluna, e linha/coluna presa numa constelação.
  for (let i = 0; i < n; i++) {
    if (!open("constelacao", i)) continue;
    const cs = candsOf("constelacao", i);
    if (!cs.length) continue;
    for (const [axis, of] of [["linha", rowOf], ["coluna", colOf]] as const) {
      if (new Set(cs.map(of)).size !== 1) continue;
      const line = of(cs[0]);
      const elim = candsOf(axis, line).filter((k) => regOf(k) !== i);
      if (elim.length) return { kind: "elim", reason: axis === "linha" ? "faixa-linha" : "faixa-coluna", cells: elim.map((k) => toCell(n, k)), unit: { kind: "constelacao", i }, lines: [line] };
    }
  }
  for (const axis of ["linha", "coluna"] as const) for (let i = 0; i < n; i++) {
    if (!open(axis, i)) continue;
    const cs = candsOf(axis, i);
    if (!cs.length || new Set(cs.map(regOf)).size !== 1) continue;
    const reg = regOf(cs[0]);
    const elim = candsOf("constelacao", reg).filter((k) => (axis === "linha" ? rowOf(k) : colOf(k)) !== i);
    if (elim.length) return { kind: "elim", reason: axis === "linha" ? "presa-linha" : "presa-coluna", cells: elim.map((k) => toCell(n, k)), unit: { kind: axis, i }, regions: [reg] };
  }
  // 3) Bloqueio: um astro aqui deixaria outra unidade sem nenhuma casa possível.
  for (let k = 0; k < n * n; k++) {
    if (!s.cand[k]) continue;
    const gone = new Set(shadow(s, k));
    gone.add(k);
    for (const kind of KINDS) for (let i = 0; i < n; i++) {
      if (!open(kind, i)) continue;
      const cs = candsOf(kind, i);
      if (cs.includes(k)) continue;
      if (cs.length && cs.every((j) => gone.has(j))) return { kind: "elim", reason: "bloqueio", cells: [toCell(n, k)], unit: { kind, i } };
    }
  }
  // 4) Faixas: k constelações que cabem, juntas, em k linhas (ou colunas).
  const openRegs = Array.from({ length: n }, (_, i) => i).filter((i) => open("constelacao", i));
  for (let size = 2; size <= 3; size++) for (const regs of combos(openRegs, size)) {
    const cs = regs.flatMap((i) => candsOf("constelacao", i));
    for (const [axis, of] of [["linha", rowOf], ["coluna", colOf]] as const) {
      const lines = [...new Set(cs.map(of))];
      if (lines.length !== size) continue;
      const elim = lines.flatMap((l) => candsOf(axis, l)).filter((k) => !regs.includes(regOf(k)));
      if (elim.length) return { kind: "elim", reason: axis === "linha" ? "faixas-linhas" : "faixas-colunas", cells: elim.map((j) => toCell(n, j)), regions: regs, lines: lines.sort((a, b) => a - b) };
    }
  }
  return null;
}

function apply(s: State, st: Step) {
  const k = ([r, c]: Cell) => r * s.n + c;
  if (st.kind === "star") place(s, k(st.cells[0]));
  else for (const c of st.cells) s.cand[k(c)] = false;
}

function initState(b: AstrosBoard, stars: Cell[] = []): State {
  const s: State = { n: b.n, regions: b.regions, cand: Array<boolean>(b.n * b.n).fill(true), star: Array<boolean>(b.n * b.n).fill(false) };
  for (const [r, c] of stars) place(s, r * b.n + c);
  return s;
}

/** Resolve só com lógica, passo a passo. `tier` = raciocínio mais elaborado que foi preciso. */
export function logicSteps(b: AstrosBoard, stars: Cell[] = []): { steps: Step[]; solved: boolean; tier: number } {
  const s = initState(b, stars);
  const steps: Step[] = [];
  let tier = 0;
  for (let guard = 0; guard < 4 * b.n * b.n; guard++) {
    if (s.star.filter(Boolean).length === b.n) break;
    const st = findStep(s);
    if (!st) break;
    steps.push(st);
    tier = Math.max(tier, TIER[st.reason]);
    apply(s, st);
  }
  return { steps, solved: s.star.filter(Boolean).length === b.n, tier };
}

/**
 * Dica: o próximo passo que a grade da pessoa ainda não mostra. Parte dos astros que ela já colocou (todos
 * certos — os errados são tratados antes, no jogo). Eliminações que a pessoa já marcou com × são puladas.
 */
export function nextHint(b: AstrosBoard, g: AGrid): Step | null {
  const s = initState(b, starsOf(g));
  for (let guard = 0; guard < 4 * b.n * b.n; guard++) {
    const st = findStep(s);
    if (!st) return null;
    if (st.kind === "star") {
      const [r, c] = st.cells[0];
      if (g[r][c] !== STAR) return st;
    } else {
      const fresh = st.cells.filter(([r, c]) => g[r][c] !== MARK);
      if (fresh.length) return { ...st, cells: fresh };
    }
    apply(s, st);
  }
  return null;
}
