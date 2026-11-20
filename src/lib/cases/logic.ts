// Mindloop Investigação — o raciocínio de uma pessoa, passo a passo, no quadro de decisões (funções puras).
//
// Cada personagem tem um conjunto de lugares possíveis (casas; no Patches, cômodos) e de objetos possíveis.
// As grades (grids.ts) são "vistas" desses conjuntos: na grade Linha, a fileira da Mel mostra ✓ na linha 3 quando
// todos os lugares que sobram para ela estão na linha 3, e ✗ nas linhas onde não sobra nenhum.
//
// Só três movimentos são usados — os mesmos que se faz no papel, sem guardar hipóteses na cabeça:
//   1. PISTA:   aplicar a pista na ordem em que aparece (vira ✓ ou ✗ numa grade);
//   2. LUGAR:   o tabuleiro liga as grades (o cômodo fica em certas linhas e colunas; casa bloqueada não conta);
//   3. ÚLTIMA OPÇÃO: numa fileira só sobrou um valor ("pessoa"), ou um valor só cabe numa pessoa ("valor");
//               e um ✓ fecha aquele valor para os outros (o ✗ automático da mesma coluna da grade).
// Pistas que falam de duas pessoas (Zip: "logo depois de"; Tango: = e ×) só podem ser usadas quando a primeira
// pessoa já está descoberta — então também viram marcações diretas.

import { type Clue, type Model, isNegative, isRelational, units } from "./model";
import { type Dim, clueDim, gridsOf } from "./grids";
import { evalClue } from "./model";

/** Uma marcação numa grade: grade d, personagem s, valor v; ✓ (yes) ou ✗. */
export interface Mark { d: number; s: number; v: number; yes: boolean }
/** Por que um ✓ apareceu: a própria pista, o tabuleiro ligando grades, ou a última opção (da fileira ou do valor). */
export type Why = "pista" | "lugar" | "pessoa" | "valor";
export interface Conclusion { d: number; s: number; v: number; why: Why }
/** Um passo: a pista usada, as marcações que ela gera na grade dela e os ✓ que aparecem em seguida. */
export interface LogicStep { clue: number; marks: Mark[]; concl: Conclusion[] }
export interface LogicResult { solved: boolean; steps: LogicStep[]; stuck: number | null; place: number[]; obj: number[] }

export const keyOf = (d: number, s: number, v: number) => `${d}|${s}|${v}`;

export class Solver {
  readonly dims: Dim[];
  U: number[][];
  O: number[][];
  /** Valor de cada casa em cada grade (tabela pronta: o gerador consulta isto milhares de vezes). */
  private readonly tab: number[][];
  constructor(readonly m: Model, dims?: Dim[], init?: { U: number[][]; O: number[][] }, tab?: number[][]) {
    this.dims = dims ?? gridsOf(m);
    this.tab = tab ?? this.dims.map((d) => (d.of ? Array.from({ length: m.rows * m.cols }, (_, v) => d.of!(v)) : []));
    const n = m.people.length;
    this.U = init ? init.U.map((x) => x.slice()) : Array.from({ length: n }, () => units(m));
    this.O = init ? init.O.map((x) => x.slice()) : Array.from({ length: n }, () => m.objects.map((_, i) => i));
  }
  clone() { return new Solver(this.m, this.dims, { U: this.U, O: this.O }, this.tab); }
  private isObj(d: number) { return this.dims[d].id === "obj"; }
  /** Valores ainda possíveis para a pessoa s na grade d. */
  values(s: number, d: number): number[] {
    if (this.isObj(d)) return this.O[s].slice().sort((a, b) => a - b);
    const t = this.tab[d], seen: boolean[] = [];
    for (const u of this.U[s]) seen[t[u]] = true;
    const out: number[] = [];
    seen.forEach((x, v) => { if (x) out.push(v); });
    return out;
  }
  /** O ✓ da pessoa s na grade d (valor único que sobrou), ou null. */
  yes(s: number, d: number): number | null {
    if (this.isObj(d)) return this.O[s].length === 1 ? this.O[s][0] : null;
    const t = this.tab[d], U = this.U[s];
    if (!U.length) return null;
    const v = t[U[0]];
    for (let i = 1; i < U.length; i++) if (t[U[i]] !== v) return null;
    return v;
  }
  yesKeys(): Set<string> {
    const out = new Set<string>();
    for (let s = 0; s < this.U.length; s++) for (let d = 0; d < this.dims.length; d++) { const v = this.yes(s, d); if (v !== null) out.add(keyOf(d, s, v)); }
    return out;
  }
  /** Tira o valor v da pessoa t na grade d. true se mudou algo. */
  remove(t: number, d: number, v: number): boolean {
    if (this.isObj(d)) { const b = this.O[t].length; this.O[t] = this.O[t].filter((x) => x !== v); return this.O[t].length < b; }
    const tb = this.tab[d], b = this.U[t].length;
    this.U[t] = this.U[t].filter((u) => tb[u] !== v);
    return this.U[t].length < b;
  }
  /** Fica só com o valor v para a pessoa s na grade d. */
  keep(s: number, d: number, v: number): boolean {
    if (this.isObj(d)) { const b = this.O[s].length; this.O[s] = this.O[s].filter((x) => x === v); return this.O[s].length < b; }
    const tb = this.tab[d], b = this.U[s].length;
    this.U[s] = this.U[s].filter((u) => tb[u] === v);
    return this.U[s].length < b;
  }
  /** Algum personagem ficou sem nenhuma opção (pista falsa ou contradição)? */
  broken() { return this.U.some((x) => !x.length) || this.O.some((x) => !x.length); }
  solved() { return this.U.every((x) => x.length === 1) && this.O.every((x) => x.length === 1); }

  /**
   * Aplica uma pista (só restringe quem ela cita). Pistas de duas pessoas precisam da primeira já descoberta na
   * grade da pista; senão devolve false (ainda não dá para usar).
   */
  apply(c: Clue): boolean {
    const m = this.m;
    if (c.k === "rule") return true;
    if (c.k === "has") { this.O[c.s] = this.O[c.s].filter((x) => x === c.o); return true; }
    if (c.k === "hasNot") { this.O[c.s] = this.O[c.s].filter((x) => x !== c.o); return true; }
    if (isRelational(c)) {
      const d = clueDim(m, c, this.dims);
      const known = this.yes(c.a, d);
      if (known === null || (c.k === "next" && this.U[c.a].length !== 1)) return false;
      const a0 = this.U[c.a][0];
      // Confere como numa resposta: a pessoa a fica onde já se sabe; b passa pelas casas que restam.
      this.U[c.b] = this.U[c.b].filter((u) => {
        const ans = new Array(2 * m.people.length).fill(-1);
        ans[c.a] = a0; ans[c.b] = u;
        return evalClue(m, c, ans);
      });
      return true;
    }
    const s = (c as { s: number }).s;
    this.U[s] = this.U[s].filter((u) => { const ans = new Array(2 * m.people.length).fill(-1); ans[s] = u; return evalClue(m, c, ans); });
    return true;
  }

  /**
   * "Última opção" até nada mais mudar. Devolve os ✓ que aparecem, em ordem, com o motivo.
   * Um ✓ fecha aquele valor para os outros (o mesmo ✗ automático que o quadro desenha).
   */
  closure(): Conclusion[] {
    const out: Conclusion[] = [];
    const record = (before: Set<string>, why: Why) => {
      for (const k of this.yesKeys()) if (!before.has(k)) { const [d, s, v] = k.split("|").map(Number); out.push({ d, s, v, why }); }
    };
    for (let guard = 0; guard < 200; guard++) {
      let changed = false;
      let before = this.yesKeys();
      // ✓ fecha o valor para os outros.
      this.dims.forEach((dim, d) => {
        for (let v = 0; v < dim.values.length; v++) {
          const owners = this.U.map((_, s) => s).filter((s) => this.yes(s, d) === v);
          if (owners.length >= dim.cap) for (let t = 0; t < this.U.length; t++) if (!owners.includes(t) && this.remove(t, d, v)) changed = true;
        }
      });
      record(before, "pessoa");
      if (changed) continue;
      before = this.yesKeys();
      // Um valor que só cabe em `cap` pessoas é delas.
      this.dims.forEach((dim, d) => {
        if (!dim.exact) return;
        for (let v = 0; v < dim.values.length; v++) {
          const who = this.U.map((_, s) => s).filter((s) => this.values(s, d).includes(v));
          if (who.length === dim.cap) for (const s of who) if (this.yes(s, d) !== v && this.keep(s, d, v)) changed = true;
        }
      });
      record(before, "valor");
      if (!changed) break;
    }
    return out;
  }
}

/**
 * Resolve aplicando as pistas na ordem, cada uma seguida da "última opção". stuck = primeira pista que ainda não
 * podia ser usada (relação com alguém não descoberto). solved = tudo descoberto só assim.
 */
export function runLogic(m: Model, clues: Clue[]): LogicResult {
  const sv = new Solver(m);
  const steps: LogicStep[] = [];
  let stuck: number | null = null;
  clues.forEach((c, i) => {
    if (c.k === "rule" || stuck !== null) return;
    const st = stepOf(sv, c, i);
    if (!st) { stuck = i; return; }
    steps.push(st);
  });
  return { solved: stuck === null && sv.solved() && !sv.broken(), steps, stuck, place: sv.U.map((x) => (x.length === 1 ? x[0] : -1)), obj: sv.O.map((x) => (x.length === 1 ? x[0] : -1)) };
}

/** Aplica uma pista ao estado (mudando-o) e descreve o passo; null se a pista ainda não podia ser usada. */
export function stepOf(sv: Solver, c: Clue, i: number): LogicStep | null {
  const d = clueDim(sv.m, c, sv.dims);
  const who = "s" in c ? c.s : (c as { b: number }).b;
  const beforeVals = sv.values(who, d);
  const beforeYes = sv.yesKeys();
  if (!sv.apply(c)) return null;
  const afterVals = sv.values(who, d);
  // Pista que afirma ("estava na coluna A") marca ✓; pista que nega ("não estava…") marca só ✗ — o ✓ que vier
  // depois é "a única opção que sobrou".
  const positive = !isNegative(c);
  const marks: Mark[] = beforeVals.filter((v) => !afterVals.includes(v)).map((v) => ({ d, s: who, v, yes: false }));
  if (positive && afterVals.length === 1 && beforeVals.length > 1) marks.push({ d, s: who, v: afterVals[0], yes: true });
  const concl: Conclusion[] = [];
  for (const k of sv.yesKeys()) if (!beforeYes.has(k)) {
    const [dd, s, v] = k.split("|").map(Number);
    concl.push({ d: dd, s, v, why: dd === d && s === who ? (positive ? "pista" : "pessoa") : "lugar" });
  }
  // Primeiro o que a pista diz, depois o que o tabuleiro liga e só então a "última opção".
  concl.sort((x, y) => (x.why === "pista" ? 0 : 1) - (y.why === "pista" ? 0 : 1));
  concl.push(...sv.closure());
  return { clue: i, marks, concl };
}
