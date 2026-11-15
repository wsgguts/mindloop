// Zip — solucionador por DEDUÇÃO (o raciocínio de uma pessoa, sem tentativa e erro às cegas).
// Usado pelos testes de dificuldade: confere que cada nível pode ser resolvido pensando, e mede quanto
// raciocínio "E se…?" (hipótese de um passo) os níveis finais exigem.
//
// O caminho é visto como um conjunto de LIGAÇÕES entre casas vizinhas. Cada casa tem exatamente 2 ligações
// (o 1 e o último número têm 1). Regras diretas (as que se aprende jogando):
//   • casa já com as ligações completas → as outras saídas dela ficam fechadas;
//   • casa que só tem as saídas de que precisa → todas elas fazem parte do caminho;
//   • uma ligação que fecharia um laço (caminho voltando para si mesmo) é proibida;
//   • um trecho do caminho não pode juntar números fora de ordem (ex.: o 3 ligado direto ao 5).
// Hipótese ("E se…?"): supor uma ligação e, se as regras diretas levarem a uma contradição, ela é proibida.

import type { ParsedZip } from "./zip";

const UNK = 0, IN = 1, OUT = 2;

interface ZState { e: Uint8Array }

function build(z: ParsedZip) {
  const n = z.size, N = n * n;
  const edges: [number, number][] = [];
  const at: number[][] = Array.from({ length: N }, () => []);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c;
    if (c + 1 < n) { at[i].push(edges.length); at[i + 1].push(edges.length); edges.push([i, i + 1]); }
    if (r + 1 < n) { at[i].push(edges.length); at[i + n].push(edges.length); edges.push([i, i + n]); }
  }
  const num = (i: number) => z.nums[Math.floor(i / n)][i % n];
  const deg = (i: number) => (num(i) === 1 || num(i) === z.max ? 1 : 2);
  return { N, edges, at, num, deg };
}

type G = ReturnType<typeof build>;

/** Trechos já ligados: o número do trecho de cada casa. */
function chains(g: G, s: ZState): Int32Array {
  const comp = new Int32Array(g.N).fill(-1);
  let k = 0;
  for (let i = 0; i < g.N; i++) {
    if (comp[i] >= 0) continue;
    const stack = [i]; comp[i] = k;
    while (stack.length) {
      const x = stack.pop()!;
      for (const ei of g.at[x]) if (s.e[ei] === IN) {
        const [a, b] = g.edges[ei]; const y = a === x ? b : a;
        if (comp[y] < 0) { comp[y] = k; stack.push(y); }
      }
    }
    k++;
  }
  return comp;
}

/** Ordem dos números ao longo do trecho que contém a casa `start` (andando pelas ligações IN). */
function walk(g: G, s: ZState, start: number, block?: number): number[] {
  const out: number[] = [];
  let prev = block ?? -1, cur = start;
  for (let guard = 0; guard <= g.N; guard++) {
    if (g.num(cur)) out.push(g.num(cur));
    let next = -1;
    for (const ei of g.at[cur]) if (s.e[ei] === IN) {
      const [a, b] = g.edges[ei]; const y = a === cur ? b : a;
      if (y !== prev) { next = y; break; }
    }
    if (next < 0) break;
    prev = cur; cur = next;
  }
  return out;
}

const inCount = (g: G, s: ZState, i: number) => g.at[i].reduce((t, ei) => t + (s.e[ei] === IN ? 1 : 0), 0);
const unkCount = (g: G, s: ZState, i: number) => g.at[i].reduce((t, ei) => t + (s.e[ei] === UNK ? 1 : 0), 0);

/** Os números de um trecho precisam ser consecutivos (em ordem crescente ou decrescente). */
function orderOk(nums: number[]): boolean {
  if (nums.length < 2) return true;
  const d = nums[1] - nums[0];
  if (d !== 1 && d !== -1) return false;
  for (let k = 2; k < nums.length; k++) if (nums[k] - nums[k - 1] !== d) return false;
  return true;
}

/** Aplica as regras diretas até travar. false = contradição. */
function propagate(g: G, s: ZState): boolean {
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < g.N; i++) {
      const inn = inCount(g, s, i), unk = unkCount(g, s, i), d = g.deg(i);
      if (inn > d || inn + unk < d) return false;
      if (unk && inn === d) { for (const ei of g.at[i]) if (s.e[ei] === UNK) s.e[ei] = OUT; changed = true; }
      else if (unk && inn + unk === d) { for (const ei of g.at[i]) if (s.e[ei] === UNK) s.e[ei] = IN; changed = true; }
    }
    if (changed) continue;
    // Laços e ordem dos números.
    const comp = chains(g, s);
    for (let ei = 0; ei < g.edges.length; ei++) {
      if (s.e[ei] !== UNK) continue;
      const [a, b] = g.edges[ei];
      if (comp[a] === comp[b]) { s.e[ei] = OUT; changed = true; continue; } // fecharia um laço
      // Juntar os dois trechos: números de a (vindo da outra ponta até a) + números de b (de b até a outra ponta).
      const na = walk(g, s, a).reverse(), nb = walk(g, s, b);
      if (!orderOk([...na, ...nb])) { s.e[ei] = OUT; changed = true; }
    }
  }
  // Contradição: um trecho com números fora de ordem.
  for (let i = 0; i < g.N; i++) {
    if (inCount(g, s, i) === 1 || (inCount(g, s, i) === 0 && g.deg(i) === 1)) {
      if (!orderOk(walk(g, s, i))) return false;
    }
  }
  // Conectividade: casas ainda não ligadas precisam conseguir se juntar (ligações IN + UNK formam um grafo conexo).
  const seen = new Uint8Array(g.N); const st = [0]; seen[0] = 1; let cnt = 1;
  while (st.length) {
    const x = st.pop()!;
    for (const ei of g.at[x]) if (s.e[ei] !== OUT) {
      const [a, b] = g.edges[ei]; const y = a === x ? b : a;
      if (!seen[y]) { seen[y] = 1; cnt++; st.push(y); }
    }
  }
  // (Também pega o trecho que liga o 1 ao último número cedo demais, deixando casas de fora.)
  return cnt === g.N;
}

const solved = (g: G, s: ZState) => {
  let k = 0; for (let ei = 0; ei < g.edges.length; ei++) if (s.e[ei] === IN) k++;
  return k === g.N - 1;
};

export interface ZipLogic { solved: boolean; hypotheses: number; rounds: number }

/**
 * Resolve com as regras diretas e, quando travar, com hipóteses de um passo ("E se esta ligação existisse?").
 * hypotheses = quantas vezes foi preciso o "E se…?" (0 = só regras diretas).
 */
export function solveZipLogically(z: ParsedZip, allowHypothesis = true): ZipLogic {
  const g = build(z);
  const s: ZState = { e: new Uint8Array(g.edges.length) };
  let hypotheses = 0, rounds = 0;
  if (!propagate(g, s)) return { solved: false, hypotheses, rounds };
  while (!solved(g, s)) {
    rounds++;
    if (!allowHypothesis) return { solved: false, hypotheses, rounds };
    let progress = false;
    for (let ei = 0; ei < g.edges.length && !progress; ei++) {
      if (s.e[ei] !== UNK) continue;
      for (const v of [IN, OUT]) {
        const t: ZState = { e: s.e.slice() }; t.e[ei] = v;
        if (!propagate(g, t)) { s.e[ei] = v === IN ? OUT : IN; progress = true; hypotheses++; break; }
      }
    }
    if (!progress || !propagate(g, s)) return { solved: false, hypotheses, rounds };
  }
  return { solved: true, hypotheses, rounds };
}
