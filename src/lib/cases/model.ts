// Mindloop Investigação — motor lógico dos mistérios.
//
// Todo mistério é um problema de ATRIBUIÇÃO: cada "slot" (um disco do cofre, um lugar do mapa, uma pessoa da
// fila, um objeto da vitrine) recebe exatamente um "valor" (um número, uma ordem de parada, um símbolo, uma casa).
// As pistas são dados estruturados (não texto solto): o mesmo objeto é usado para
//   • conferir a resposta (evalClue),
//   • provar que a solução é única (solveAll),
//   • provar que o caso se resolve SÓ com dedução, sem chute (deduce),
//   • escrever o texto da pista, das dicas e da explicação (clueText / assignText).
// Assim o texto nunca diverge da lógica. Funções puras, sem React.

import { type CodeVoice, type LayoutVoice, type PatternVoice, type RouteVoice, type Voice, fill, numero } from "./voice";

export type CaseKind = "code" | "pattern" | "route" | "layout";

/** Uma entidade com nome (slot ou valor). g = gênero gramatical (artigos "o/a", "do/da"). */
export interface Ent { label: string; g?: "m" | "f"; icon?: string; /** plural, quando não é só acrescentar "s" */ pl?: string }

export interface Model {
  kind: CaseKind;
  slots: Ent[];
  values: Ent[];
  /** Cada valor é usado no máximo uma vez. */
  distinct: boolean;
  /** layout: [linhas, colunas]; o valor v é a casa (v / colunas, v % colunas). */
  grid?: [number, number];
  /** route: estradas do mapa entre lugares (índices de slots). */
  edges?: [number, number][];
  /** route: posição de cada lugar no mapa (0–100). */
  pos?: [number, number][];
  /** pattern: verbo no singular e no plural ("carrega", "carregam"). (Casos antigos; hoje vem da voz.) */
  verb?: [string, string];
  /** Palavras da história usadas nos textos (posta pelo catálogo; não fica gravada no banco). */
  voice?: Voice;
}

export type Clue =
  | { k: "is" | "not"; s: number; v: number }
  | { k: "either"; s: number; v: [number, number] }
  | { k: "lt" | "next" | "twice" | "same" | "opp" | "left" | "above" | "touch" | "apart" | "sameRow" | "sameCol"; a: number; b: number }
  /** O valor de s fica estritamente entre o de a (menor) e o de b (maior). */
  | { k: "between"; s: number; a: number; b: number }
  /** Exatamente n dos slots ss têm o valor v. */
  | { k: "countIn"; ss: number[]; v: number; n: number }
  | { k: "diff"; a: number; b: number; d: number }
  | { k: "sum"; ss: number[]; t: number }
  | { k: "parity"; s: number; even: boolean }
  | { k: "row"; s: number; r: number }
  | { k: "col"; s: number; c: number }
  | { k: "count" } | { k: "noTriple" } | { k: "roads" };

export type ClueKind = Clue["k"];
/** Regras fixas do tipo de caso (mostradas à parte das pistas). */
export const isRule = (c: Clue) => c.k === "count" || c.k === "noTriple" || c.k === "roads";

/** Valor numérico: dígito do cofre (1…), número da parada (1…) ou símbolo (0/1). */
export const num = (m: Model, v: number) => (m.kind === "pattern" ? v : v + 1);
const rc = (m: Model, v: number): [number, number] => [Math.floor(v / m.grid![1]), v % m.grid![1]];

/** Slots que a pista envolve. */
export function involved(m: Model, c: Clue): number[] {
  switch (c.k) {
    case "is": case "not": case "either": case "parity": case "row": case "col": return [c.s];
    case "sum": case "countIn": return c.ss;
    case "between": return [c.s, c.a, c.b];
    case "count": case "noTriple": case "roads": return m.slots.map((_, i) => i);
    default: return [c.a, c.b];
  }
}

/** Confere uma pista numa atribuição completa (a[slot] = valor). */
export function evalClue(m: Model, c: Clue, a: number[]): boolean {
  const n = (s: number) => num(m, a[s]);
  switch (c.k) {
    case "is": return a[c.s] === c.v;
    case "not": return a[c.s] !== c.v;
    case "either": return a[c.s] === c.v[0] || a[c.s] === c.v[1];
    case "lt": return n(c.a) < n(c.b);
    case "next": return n(c.b) === n(c.a) + 1;
    case "diff": return Math.abs(n(c.a) - n(c.b)) === c.d;
    case "twice": return n(c.a) === 2 * n(c.b);
    case "between": return n(c.a) < n(c.s) && n(c.s) < n(c.b);
    case "countIn": return c.ss.filter((s) => a[s] === c.v).length === c.n;
    case "sum": return c.ss.reduce((t, s) => t + n(s), 0) === c.t;
    case "parity": return (n(c.s) % 2 === 0) === c.even;
    case "same": return a[c.a] === a[c.b];
    case "opp": return a[c.a] !== a[c.b];
    case "row": return rc(m, a[c.s])[0] === c.r;
    case "col": return rc(m, a[c.s])[1] === c.c;
    case "sameRow": return rc(m, a[c.a])[0] === rc(m, a[c.b])[0];
    case "sameCol": return rc(m, a[c.a])[1] === rc(m, a[c.b])[1];
    case "left": return rc(m, a[c.a])[1] < rc(m, a[c.b])[1];
    case "above": return rc(m, a[c.a])[0] < rc(m, a[c.b])[0];
    case "touch": case "apart": {
      const [r1, c1] = rc(m, a[c.a]), [r2, c2] = rc(m, a[c.b]);
      const t = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
      return c.k === "touch" ? t : !t;
    }
    case "count": {
      const half = m.slots.length / 2;
      return a.filter((v) => v === 0).length === half;
    }
    case "noTriple":
      for (let i = 2; i < a.length; i++) if (a[i] === a[i - 1] && a[i] === a[i - 2]) return false;
      return true;
    case "roads": {
      const at: number[] = [];
      a.forEach((v, s) => { at[v] = s; });
      for (let i = 1; i < at.length; i++) if (!hasEdge(m, at[i - 1], at[i])) return false;
      return true;
    }
  }
}

export const hasEdge = (m: Model, p: number, q: number) => !!m.edges?.some(([x, y]) => (x === p && y === q) || (x === q && y === p));

/**
 * Estado de uma pista com a resposta parcial do jogador (-1 = vazio):
 * true = cumprida, false = já contrariada, null = ainda em aberto.
 * Nunca revela a solução: só confere a pista com o que já foi preenchido.
 */
export function clueState(m: Model, c: Clue, a: number[]): boolean | null {
  if (c.k === "count") {
    const half = m.slots.length / 2;
    if (a.filter((v) => v === 0).length > half || a.filter((v) => v === 1).length > half) return false;
    return a.includes(-1) ? null : true;
  }
  if (c.k === "noTriple") {
    for (let i = 2; i < a.length; i++) if (a[i] !== -1 && a[i] === a[i - 1] && a[i] === a[i - 2]) return false;
    return a.includes(-1) ? null : true;
  }
  if (c.k === "roads") {
    const at: number[] = [];
    a.forEach((v, s) => { if (v >= 0) at[v] = s; });
    for (let i = 1; i < at.length; i++) if (at[i] !== undefined && at[i - 1] !== undefined && !hasEdge(m, at[i - 1], at[i])) return false;
    return a.includes(-1) ? null : true;
  }
  const inv = involved(m, c);
  return inv.some((s) => a[s] < 0) ? null : evalClue(m, c, a);
}

// ---------------------------------------------------------------- solução

/** Todas as atribuições possíveis do modelo (respeitando "sem repetir"). */
export function allAssignments(m: Model): number[][] {
  const out: number[][] = [];
  const S = m.slots.length, V = m.values.length;
  const cur: number[] = [];
  const used = new Array(V).fill(false);
  const rec = (i: number) => {
    if (i === S) { out.push(cur.slice()); return; }
    for (let v = 0; v < V; v++) {
      if (m.distinct && used[v]) continue;
      used[v] = true; cur[i] = v;
      rec(i + 1);
      used[v] = false;
    }
  };
  rec(0);
  return out;
}

/** Todas as soluções (até `limit`). */
export function solveAll(m: Model, clues: Clue[], limit = Infinity): number[][] {
  const sols: number[][] = [];
  for (const a of allAssignments(m)) {
    if (clues.every((c) => evalClue(m, c, a))) { sols.push(a); if (sols.length >= limit) break; }
  }
  return sols;
}

// ---------------------------------------------------------------- dedução (sem chute)

export type Reason = number | "distinct" | "only";
/** Uma casa descoberta: o slot s só pode ter o valor v, por causa da pista `by` (índice) ou da regra de não repetir. */
export interface Step { s: number; v: number; by: Reason; uses: number[] }
export interface Deduction { solved: boolean; steps: Step[]; rounds: number; domains: boolean[][] }

/**
 * Raciocínio humano simulado: cada pista, sozinha, elimina os valores de cada slot que ela torna impossíveis
 * (dado o que já se sabe); "sem repetir" elimina valores já usados e fixa valores que só cabem num lugar.
 * Repete até nada mudar. Se termina com um único valor em cada slot, o caso é resolvível só por dedução.
 */
export function deduce(m: Model, clues: Clue[]): Deduction {
  const S = m.slots.length, V = m.values.length;
  const D = Array.from({ length: S }, () => new Array(V).fill(true));
  const uses: Set<number>[] = Array.from({ length: S }, () => new Set<number>()); // pistas que já cortaram valores do slot
  const steps: Step[] = [];
  const fixed = new Array(S).fill(false);
  const size = (s: number) => D[s].filter(Boolean).length;
  const markFixed = (by: Reason) => {
    for (let s = 0; s < S; s++) if (!fixed[s] && size(s) === 1) {
      fixed[s] = true;
      steps.push({ s, v: D[s].indexOf(true), by, uses: [...uses[s]] });
    }
  };
  // Pistas de um só slot primeiro (como uma pessoa faria), depois as de dois, depois as regras gerais.
  const order = clues.map((c, i) => i).sort((i, j) => involved(m, clues[i]).length - involved(m, clues[j]).length);
  let rounds = 0;
  for (let changed = true; changed && rounds < 50;) {
    changed = false; rounds++;
    for (const i of order) {
      const c = clues[i];
      const inv = involved(m, c);
      const ok = inv.map(() => new Array(V).fill(false));
      const a = new Array(S).fill(-1);
      const used = new Array(V).fill(false);
      const rec = (j: number) => {
        if (j === inv.length) {
          if (evalClue(m, c, a)) inv.forEach((s, k) => { ok[k][a[s]] = true; });
          return;
        }
        const s = inv[j];
        for (let v = 0; v < V; v++) {
          if (!D[s][v] || (m.distinct && used[v])) continue;
          used[v] = true; a[s] = v; rec(j + 1); used[v] = false;
        }
        a[s] = -1;
      };
      rec(0);
      inv.forEach((s, k) => {
        for (let v = 0; v < V; v++) if (D[s][v] && !ok[k][v]) { D[s][v] = false; uses[s].add(i); changed = true; }
      });
      markFixed(i);
    }
    if (m.distinct) {
      // Valor já confirmado num slot não serve para nenhum outro.
      for (let s = 0; s < S; s++) if (size(s) === 1) {
        const v = D[s].indexOf(true);
        for (let t = 0; t < S; t++) if (t !== s && D[t][v]) { D[t][v] = false; changed = true; }
      }
      markFixed("distinct");
      // Quando há tantos valores quanto slots, um valor que só cabe num slot é desse slot.
      if (V === S) for (let v = 0; v < V; v++) {
        const can = [];
        for (let s = 0; s < S; s++) if (D[s][v]) can.push(s);
        if (can.length === 1 && size(can[0]) > 1) { D[can[0]].fill(false); D[can[0]][v] = true; changed = true; }
      }
      markFixed("only");
    }
  }
  const solved = D.every((d) => d.filter(Boolean).length === 1);
  return { solved, steps, rounds, domains: D };
}


// ---------------------------------------------------------------- texto
// Todas as frases saem daqui, usando a "voz" da história (voice.ts). Sem voz, valem palavras neutras.

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const art = (e: Ent) => (e.g === "f" ? "a" : "o");
/** "o Vaso", "a Lia". Nomes de pessoas também levam artigo (uso comum no português do Brasil). */
export const the = (e: Ent) => `${art(e)} ${e.label}`;
const de = (e: Ent) => `${e.g === "f" ? "da" : "do"} ${e.label}`;
const em = (e: Ent) => `${e.g === "f" ? "na" : "no"} ${e.label}`;
const indef = (e: Ent) => `${e.g === "f" ? "uma" : "um"} ${e.label}`;
const ord = (n: number, g: "m" | "f" = "f") => `${n}${g === "f" ? "ª" : "º"}`;
const plural = (e: Ent) => e.pl ?? `${e.label}s`;
const allFem = (es: Ent[]) => es.every((e) => e.g === "f");
const join = (xs: string[]) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

const DEFAULT_CODE: CodeVoice = numero("é", "número");
const DEFAULT_PATTERN: PatternVoice = { verb: ["tem", "têm"], kind: { label: "símbolo", g: "m", pl: "símbolos" }, line: { label: "fila", g: "f" } };
const DEFAULT_ROUTE: RouteVoice = { stop: { label: "parada", g: "f" }, road: { label: "estrada", g: "f" }, actor: "O caminho", path: "no caminho" };
const DEFAULT_LAYOUT: LayoutVoice = { cell: { label: "casa", g: "f" }, rule: "Cada casa guarda no máximo uma peça." };
export const codeVoice = (m: Model) => (m.kind === "code" && m.voice ? (m.voice as CodeVoice) : DEFAULT_CODE);
export const patternVoice = (m: Model): PatternVoice => (m.kind === "pattern" && m.voice ? (m.voice as PatternVoice) : { ...DEFAULT_PATTERN, verb: m.verb ?? DEFAULT_PATTERN.verb });
export const routeVoice = (m: Model) => (m.kind === "route" && m.voice ? (m.voice as RouteVoice) : DEFAULT_ROUTE);
export const layoutVoice = (m: Model) => (m.kind === "layout" && m.voice ? (m.voice as LayoutVoice) : DEFAULT_LAYOUT);

const ROW_NAMES: Record<number, string[]> = { 1: ["única"], 2: ["de cima", "de baixo"], 3: ["de cima", "do meio", "de baixo"] };
const COL_NAMES: Record<number, string[]> = { 1: ["única"], 2: ["da esquerda", "da direita"], 3: ["da esquerda", "do meio", "da direita"] };
export const cellName = (m: Model, v: number) => { const [r, c] = rc(m, v); return `${"ABCDE"[c]}${r + 1}`; };

/** Ordinal da parada no gênero da voz: "3ª", "3º". */
export const stopOrd = (m: Model, v: number) => ord(v + 1, routeVoice(m).stop.g);

/** Nome curto do valor: "5", "3ª parada", "Cristal", "canteiro B2". */
export function valueText(m: Model, v: number): string {
  switch (m.kind) {
    case "code": return String(num(m, v));
    case "route": { const st = routeVoice(m).stop; return v === m.values.length - 1 ? `últim${st.g === "f" ? "a" : "o"} ${st.label}` : `${stopOrd(m, v)} ${st.label}`; }
    case "pattern": return m.values[v].label;
    case "layout": return `${layoutVoice(m).cell.label} ${cellName(m, v)}`;
  }
}

/** Variáveis comuns dos modelos de texto do Mini Sudoku. */
function codeVars(m: Model, x: Record<string, number | undefined>): Record<string, string | number> {
  const out: Record<string, string | number> = { V: m.values.length };
  for (const k of ["a", "b", "s"]) { const i = x[k]; if (i !== undefined) { out[k] = the(m.slots[i]); out[`de_${k}`] = de(m.slots[i]); } }
  for (const k of ["n", "x", "y", "d", "t"]) if (x[k] !== undefined) out[k] = x[k]!;
  return out;
}

/** Frase "slot tem valor": "a Lia mora no 3º andar", "a Biblioteca foi a 3ª parada"… */
export function assignText(m: Model, s: number, v: number): string {
  const e = m.slots[s];
  switch (m.kind) {
    case "code": return fill(codeVoice(m).is, codeVars(m, { a: s, n: num(m, v) }));
    case "route": return `${the(e)} foi ${art(routeVoice(m).stop)} ${valueText(m, v)}`;
    case "pattern": { const P = patternVoice(m); return `${the(e)} ${P.verb[0]} ${P.bare ? m.values[v].label : indef(m.values[v])}`; }
    case "layout": return `${the(e)} está ${em(layoutVoice(m).cell)} ${cellName(m, v)}`;
  }
}

/** Regras fixas que não são pistas (mostradas com ★): o que os números significam, quantas peças por casa… */
export function ruleNotes(m: Model): string[] {
  if (m.kind === "code") return [fill(codeVoice(m).rule, { V: m.values.length })];
  if (m.kind === "layout") return [layoutVoice(m).rule];
  return [];
}

function codeClue(m: Model, c: Clue): string | null {
  const V = codeVoice(m);
  switch (c.k) {
    case "is": return fill(V.is, codeVars(m, { a: c.s, n: num(m, c.v) }));
    case "not": return fill(V.not, codeVars(m, { a: c.s, n: num(m, c.v) }));
    case "either": { const [x, y] = [...c.v].sort((p, q) => p - q); return fill(V.either, codeVars(m, { a: c.s, x: x + 1, y: y + 1 })); }
    case "lt": return fill(V.lt, codeVars(m, { a: c.a, b: c.b }));
    case "next": return fill(V.next, codeVars(m, { a: c.a, b: c.b }));
    case "diff": return fill(V.diff, codeVars(m, { a: c.a, b: c.b, d: c.d }));
    case "twice": return fill(V.twice, codeVars(m, { a: c.a, b: c.b }));
    case "between": return fill(V.between, codeVars(m, { s: c.s, a: c.a, b: c.b }));
    case "parity": return fill(V.parity, { ...codeVars(m, { a: c.s }), par: c.even ? "par" : "ímpar" });
    case "sum": return fill(V.sum, { ...codeVars(m, { t: c.t }), list: join(c.ss.map((s) => the(m.slots[s]))), de_list: join(c.ss.map((s) => de(m.slots[s]))) });
    default: return null;
  }
}

/** Concordância de dois nomes: só fica no feminino se os dois forem femininos. */
const fem = (x: Ent, y: Ent) => x.g === "f" && y.g === "f";
const viz = (x: Ent, y: Ent) => (fem(x, y) ? "vizinhas" : "vizinhos");
const um = (x: Ent, y: Ent) => (fem(x, y) ? "uma" : "um");
const dout = (x: Ent, y: Ent) => (fem(x, y) ? "da outra" : "do outro");
const list = (es: Ent[]) => join(es.map(the));

function patternClue(m: Model, c: Clue): string | null {
  const S = m.slots, P = patternVoice(m), k = P.kind, kf = k.g === "f";
  const val = (v: number) => (P.bare ? m.values[v].label : indef(m.values[v]));
  switch (c.k) {
    case "is": return assignText(m, c.s, c.v);
    case "same": return P.same ? fill(P.same, { a: the(S[c.a]), b: the(S[c.b]) }) : `${the(S[c.a])} e ${the(S[c.b])} ${P.verb[1]} ${kf ? "a mesma" : "o mesmo"} ${k.label}`;
    case "opp": return P.opp ? fill(P.opp, { a: the(S[c.a]), b: the(S[c.b]) }) : `${the(S[c.a])} e ${the(S[c.b])} ${P.verb[1]} ${plural(k)} diferentes`;
    case "countIn": {
      const es = c.ss.map((s) => S[s]), f = allFem(es);
      if (c.n === 0) return `${es.map((e, i) => `${i ? "nem" : "Nem"} ${the(e)}`).join(", ")} ${P.verb[1]} ${P.bare ? plural(m.values[c.v]) : indef(m.values[c.v])}`;
      if (c.n === es.length) return `${list(es)} ${P.verb[1]} ${plural(m.values[c.v])}`;
      if (c.n === 1) return `Dentre ${list(es)}, só ${f ? "uma" : "um"} ${P.verb[0]} ${val(c.v)}`;
      return `Dentre ${list(es)}, exatamente ${c.n === 2 ? (f ? "duas" : "dois") : c.n} ${P.verb[1]} ${plural(m.values[c.v])}`;
    }
    case "count": return P.count ? fill(P.count, { h: S.length / 2 }) : `Há ${S.length / 2} ${plural(m.values[0])} e ${S.length / 2} ${plural(m.values[1])} ${em(P.line)}`;
    case "noTriple": return P.triple ?? `Nunca há três ${plural(k)} iguais seguid${kf ? "as" : "os"} ${em(P.line)}`;
    default: return null;
  }
}

function routeClue(m: Model, c: Clue): string | null {
  const S = m.slots, R = routeVoice(m), st = R.stop, stf = st.g === "f";
  switch (c.k) {
    case "is": return assignText(m, c.s, c.v);
    case "not": return `${the(S[c.s])} não foi ${art(st)} ${valueText(m, c.v)}`;
    case "either": { const [x, y] = [...c.v].sort((p, q) => p - q); return `${the(S[c.s])} foi ${art(st)} ${valueText(m, x)} ou ${art(st)} ${valueText(m, y)}`; }
    case "lt": return `${the(S[c.a])} veio antes ${de(S[c.b])} ${R.path}`;
    case "next": return `${the(S[c.b])} veio logo depois ${de(S[c.a])}`;
    case "between": return `${the(S[c.s])} veio depois ${de(S[c.a])} e antes ${de(S[c.b])}`;
    case "diff": return c.d === 1
      ? `${the(S[c.a])} e ${the(S[c.b])} foram ${plural(st)} seguid${stf ? "as" : "os"} (${stf ? "uma logo após a outra" : "um logo após o outro"}, em alguma ordem)`
      : `Entre ${the(S[c.a])} e ${the(S[c.b])} houve exatamente ${c.d - 1} ${c.d - 1 === 1 ? `${stf ? "outra" : "outro"} ${st.label}` : `${stf ? "outras" : "outros"} ${plural(st)}`}`;
    case "roads": return `${R.actor} passa uma única vez por cada lugar e só segue ${R.road.g === "f" ? "pelas" : "pelos"} ${plural(R.road)} do mapa`;
    default: return null;
  }
}

/** Texto da pista (frase completa, com ponto final). */
export function clueText(m: Model, c: Clue): string {
  const S = m.slots;
  const own = m.kind === "code" ? codeClue(m, c) : m.kind === "pattern" ? patternClue(m, c) : m.kind === "route" ? routeClue(m, c) : null;
  const t = own ?? (() => {
    switch (c.k) {
      case "is": return assignText(m, c.s, c.v);
      case "not": return `${the(S[c.s])} não está ${em(layoutVoice(m).cell)} ${cellName(m, c.v)}`;
      case "either": { const [x, y] = [...c.v].sort((p, q) => p - q); const cell = layoutVoice(m).cell; return `${the(S[c.s])} está ${em(cell)} ${cellName(m, x)} ou ${em(cell)} ${cellName(m, y)}`; }
      case "row": return `${the(S[c.s])} está na linha ${ROW_NAMES[m.grid![0]][c.r]}`;
      case "col": return `${the(S[c.s])} está na coluna ${COL_NAMES[m.grid![1]][c.c]}`;
      case "sameRow": return `${the(S[c.a])} e ${the(S[c.b])} estão na mesma linha`;
      case "sameCol": return `${the(S[c.a])} e ${the(S[c.b])} estão na mesma coluna`;
      case "left": return `${the(S[c.a])} fica numa coluna à esquerda ${de(S[c.b])}`;
      case "above": return `${the(S[c.a])} fica numa linha acima ${de(S[c.b])}`;
      case "touch": return `${the(S[c.a])} e ${the(S[c.b])} são ${viz(S[c.a], S[c.b])} (lado a lado ou ${um(S[c.a], S[c.b])} em cima ${dout(S[c.a], S[c.b])})`;
      case "apart": return `${the(S[c.a])} e ${the(S[c.b])} não são ${viz(S[c.a], S[c.b])} (nem lado a lado, nem ${um(S[c.a], S[c.b])} em cima ${dout(S[c.a], S[c.b])})`;
      default: return `${list(involved(m, c).map((s) => S[s]))} seguem uma regra especial`;
    }
  })();
  return `${cap(t)}.`;
}

/** Explica uma dedução: "Pela pista 3, a Lia mora no 2º andar." */
export function stepText(m: Model, st: Step, label: (i: number) => string = (i) => `pista ${i + 1}`): string {
  const what = assignText(m, st.s, st.v);
  if (st.by === "distinct") return `Como nenhum valor se repete, só sobra uma opção: ${what}.`;
  if (st.by === "only") return `Só há uma possibilidade para ${m.kind === "code" ? "o " : ""}${valueText(m, st.v)}: ${what}.`;
  const others = st.uses.filter((u) => u !== st.by);
  const by = others.length ? `Juntando a ${label(others[0])} com a ${label(st.by as number)}` : `Pela ${label(st.by as number)}`;
  return `${by}, ${what}.`;
}
