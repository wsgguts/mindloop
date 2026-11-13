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
  /** pattern: verbo no singular e no plural ("carrega", "carregam"). */
  verb?: [string, string];
}

export type Clue =
  | { k: "is" | "not"; s: number; v: number }
  | { k: "either"; s: number; v: [number, number] }
  | { k: "lt" | "next" | "same" | "opp" | "left" | "above" | "touch" | "apart"; a: number; b: number }
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
    case "sum": return c.ss;
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
    case "sum": return c.ss.reduce((t, s) => t + n(s), 0) === c.t;
    case "parity": return (n(c.s) % 2 === 0) === c.even;
    case "same": return a[c.a] === a[c.b];
    case "opp": return a[c.a] !== a[c.b];
    case "row": return rc(m, a[c.s])[0] === c.r;
    case "col": return rc(m, a[c.s])[1] === c.c;
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

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const art = (e: Ent) => (e.g === "f" ? "a" : "o");
/** "o Vaso", "a Lia". Nomes de pessoas também levam artigo (uso comum no português do Brasil). */
export const the = (e: Ent) => `${art(e)} ${e.label}`;
const de = (e: Ent) => `${e.g === "f" ? "da" : "do"} ${e.label}`;
const ord = (n: number, g: "m" | "f" = "f") => `${n}${g === "f" ? "ª" : "º"}`;

const ROW_NAMES: Record<number, string[]> = { 1: ["única"], 2: ["de cima", "de baixo"], 3: ["de cima", "do meio", "de baixo"] };
const COL_NAMES: Record<number, string[]> = { 1: ["única"], 2: ["da esquerda", "da direita"], 3: ["da esquerda", "do meio", "da direita"] };
export const cellName = (m: Model, v: number) => { const [r, c] = rc(m, v); return `${"ABCDE"[c]}${r + 1}`; };

/** Nome curto do valor: "5", "3ª parada", "Cristal", "B2". */
export function valueText(m: Model, v: number): string {
  switch (m.kind) {
    case "code": return String(num(m, v));
    case "route": return v === m.values.length - 1 ? "última parada" : `${ord(v + 1)} parada`;
    case "pattern": return m.values[v].label;
    case "layout": return `casa ${cellName(m, v)}`;
  }
}

/** Frase "slot tem valor": "o 2º disco é 5", "a Biblioteca foi a 3ª parada"… */
export function assignText(m: Model, s: number, v: number): string {
  const e = m.slots[s];
  switch (m.kind) {
    case "code": return `${the(e)} é ${num(m, v)}`;
    case "route": return `${the(e)} foi a ${valueText(m, v)}`;
    case "pattern": return `${the(e)} ${m.verb?.[0] ?? "tem"} um ${m.values[v].label}`;
    case "layout": return `${the(e)} está na ${valueText(m, v)}`;
  }
}

/** Concordância de dois nomes: só fica no feminino se os dois forem femininos. */
const fem = (x: Ent, y: Ent) => x.g === "f" && y.g === "f";
const viz = (x: Ent, y: Ent) => (fem(x, y) ? "vizinhas" : "vizinhos");
const um = (x: Ent, y: Ent) => (fem(x, y) ? "uma" : "um");
const dout = (x: Ent, y: Ent) => (fem(x, y) ? "da outra" : "do outro");
const plural = (e: Ent) => e.pl ?? `${e.label}s`;
const list = (es: Ent[]) => es.length === 1 ? the(es[0]) : `${es.slice(0, -1).map(the).join(", ")} e ${the(es[es.length - 1])}`;

/** Texto da pista (frase completa, com ponto final). */
export function clueText(m: Model, c: Clue): string {
  const S = m.slots;
  const t = (() => {
    switch (c.k) {
      case "is": return assignText(m, c.s, c.v);
      case "not":
        return m.kind === "code" ? `${the(S[c.s])} não é ${num(m, c.v)}`
          : m.kind === "route" ? `${the(S[c.s])} não foi a ${valueText(m, c.v)}`
          : `${the(S[c.s])} não está na ${valueText(m, c.v)}`;
      case "either": {
        const [x, y] = [...c.v].sort((p, q) => p - q);
        return m.kind === "code" ? `${the(S[c.s])} é ${num(m, x)} ou ${num(m, y)}`
          : m.kind === "route" ? `${the(S[c.s])} foi a ${valueText(m, x)} ou a ${valueText(m, y)}`
          : `${the(S[c.s])} está na casa ${cellName(m, x)} ou na ${cellName(m, y)}`;
      }
      case "lt": return m.kind === "route" ? `${the(S[c.a])} veio antes ${de(S[c.b])} no caminho` : `${the(S[c.a])} é menor que ${the(S[c.b])}`;
      case "next": return m.kind === "route" ? `${the(S[c.b])} veio logo depois ${de(S[c.a])}` : `${the(S[c.b])} é exatamente 1 a mais que ${the(S[c.a])}`;
      case "diff":
        if (m.kind === "route") return c.d === 1 ? `${the(S[c.a])} e ${the(S[c.b])} foram paradas seguidas (uma logo após a outra, em alguma ordem)`
          : `Entre ${the(S[c.a])} e ${the(S[c.b])} houve exatamente ${c.d - 1} ${c.d - 1 === 1 ? "outra parada" : "outras paradas"}`;
        return `A diferença entre ${the(S[c.a])} e ${the(S[c.b])} é ${c.d}`;
      case "sum": return `${list(c.ss.map((s) => S[s]))} somam ${c.t}`;
      case "parity": return `${the(S[c.s])} é um número ${c.even ? "par" : "ímpar"}`;
      case "same": return m.kind === "pattern" ? `${the(S[c.a])} e ${the(S[c.b])} ${m.verb?.[1] ?? "têm"} o mesmo símbolo` : `${the(S[c.a])} e ${the(S[c.b])} são iguais`;
      case "opp": return m.kind === "pattern" ? `${the(S[c.a])} e ${the(S[c.b])} ${m.verb?.[1] ?? "têm"} símbolos diferentes` : `${the(S[c.a])} e ${the(S[c.b])} são diferentes`;
      case "row": return `${the(S[c.s])} está na linha ${ROW_NAMES[m.grid![0]][c.r]}`;
      case "col": return `${the(S[c.s])} está na coluna ${COL_NAMES[m.grid![1]][c.c]}`;
      case "left": return `${the(S[c.a])} fica numa coluna à esquerda ${de(S[c.b])}`;
      case "above": return `${the(S[c.a])} fica numa linha acima ${de(S[c.b])}`;
      case "touch": return `${the(S[c.a])} e ${the(S[c.b])} são ${viz(S[c.a], S[c.b])} (lado a lado ou ${um(S[c.a], S[c.b])} em cima ${dout(S[c.a], S[c.b])})`;
      case "apart": return `${the(S[c.a])} e ${the(S[c.b])} não são ${viz(S[c.a], S[c.b])} (nem lado a lado, nem ${um(S[c.a], S[c.b])} em cima ${dout(S[c.a], S[c.b])})`;
      case "count": return `Há a mesma quantidade de ${plural(m.values[0])} e de ${plural(m.values[1])} (${m.slots.length / 2} de cada)`;
      case "noTriple": return `Nunca há três símbolos iguais seguidos na fila`;
      case "roads": return `O caminho passa uma única vez por cada lugar e só segue pelas estradas do mapa`;
    }
  })();
  return `${cap(t)}.`;
}

/** Explica uma dedução: "Pela pista 3, o 2º disco é 5." */
export function stepText(m: Model, st: Step, label: (i: number) => string = (i) => `pista ${i + 1}`): string {
  const what = assignText(m, st.s, st.v);
  if (st.by === "distinct") return `Como nenhum valor se repete, só sobra uma opção: ${what}.`;
  if (st.by === "only") return `${cap(valueText(m, st.v))} só cabe num lugar: ${what}.`;
  const others = st.uses.filter((u) => u !== st.by);
  const by = others.length ? `Juntando a ${label(others[0])} com a ${label(st.by as number)}` : `Pela ${label(st.by as number)}`;
  return `${by}, ${what}.`;
}
