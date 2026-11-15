// Mindloop Investigação — motor lógico (funções puras, sem React).
//
// Toda investigação é um CENÁRIO em grade com personagens e objetos. A resposta tem duas partes:
//   • ONDE cada personagem estava (uma casa livre do tabuleiro);
//   • QUE OBJETO cada personagem tinha (um objeto diferente para cada um).
// A resposta é guardada como a = [casa do 1º, casa do 2º, …, objeto do 1º, objeto do 2º, …] (-1 = vazio).
//
// Cada jogo dá ao cenário a SUA regra (a mesma lógica do jogo, levada para um lugar):
//   regioes    (Mini Sudoku) — uma pessoa por linha, por coluna e por cômodo;
//   equilibrio (Tango)       — dois lados (linhas), uma pessoa por coluna e metade de cada lado;
//   trilha     (Zip)         — uma trilha numerada atravessa o lugar; cada pessoa numa parada diferente;
//   comodos    (Patches)     — exatamente uma pessoa em cada cômodo;
//   ceu        (Astros)      — uma pessoa por linha e por coluna, com pistas de proximidade.
//
// As pistas são dados estruturados: o mesmo objeto confere a resposta, prova que a solução é única, simula a
// dedução sem chute e escreve o texto. Assim o texto nunca diverge da lógica.

export type Rule = "regioes" | "equilibrio" | "trilha" | "comodos" | "ceu";
/** Nome antigo, mantido para quem só precisa do "tipo" do caso. */
export type CaseKind = Rule;

/** Uma entidade com nome. g = gênero gramatical ("o/a", "do/da"). */
export interface Ent { label: string; g?: "m" | "f"; icon?: string; pl?: string }

/** Móvel (bloqueia a casa: ninguém fica ali) ou assento (a casa pode ser ocupada e as pistas podem citá-lo). */
export interface Prop { cell: number; label: string; g?: "m" | "f"; icon: string; block: boolean }
export interface Scene {
  /** Cômodo de cada casa (índice em `rooms`). */
  room: number[];
  rooms: Ent[];
  props: Prop[];
}

export interface Model {
  rule: Rule;
  rows: number;
  cols: number;
  people: Ent[];
  objects: Ent[];
  scene: Scene;
  /** Zip: as casas da trilha, em ordem (parada 1, 2, …). */
  trail?: number[];
}

/** Pistas de posição. Pessoa -1 = "quem tinha o objeto" (usado dentro de uma pista cruzada `via`). */
export type PosClue =
  | { k: "at" | "notAt"; s: number; v: number }
  | { k: "room" | "notRoom"; s: number; r: number }
  | { k: "eitherRoom"; s: number; r: [number, number] }
  | { k: "seat" | "by"; s: number; p: string }
  | { k: "row"; s: number; r: number }
  | { k: "col"; s: number; c: number }
  | { k: "corner" | "alone"; s: number }
  | { k: "nearN"; s: number; n: number }
  | { k: "stop" | "notStop"; s: number; n: number }
  | { k: "side"; s: number; r: number }
  | { k: "left" | "above" | "near" | "far" | "diag" | "touch" | "apart" | "before" | "next" | "sameSide" | "oppSide" | "beside"; a: number; b: number };

export type Clue =
  | PosClue
  | { k: "has" | "hasNot"; s: number; o: number }
  /** Pista cruzada: "quem tinha o objeto o" satisfaz a pista de posição c (pessoa -1 = quem tinha). */
  | { k: "via"; o: number; c: PosClue }
  /** A regra do lugar (cada jogo tem a sua). */
  | { k: "rule" };

export type ClueKind = Clue["k"];
export const isRule = (c: Clue) => c.k === "rule";
export const isPos = (c: Clue): c is PosClue => c.k !== "has" && c.k !== "hasNot" && c.k !== "via" && c.k !== "rule";

// ---------------------------------------------------------------- geometria do cenário

export const rcOf = (m: Model, v: number): [number, number] => [Math.floor(v / m.cols), v % m.cols];
export const cellName = (m: Model, v: number) => { const [r, c] = rcOf(m, v); return `${"ABCDEF"[c]}${r + 1}`; };
export const blockedCells = (m: Model): Set<number> => new Set(m.scene.props.filter((p) => p.block).map((p) => p.cell));
export const propAt = (m: Model, v: number) => m.scene.props.find((p) => p.cell === v);
export const roomOf = (m: Model, v: number) => m.scene.room[v];
export const kingDist = (m: Model, v: number, w: number) => { const [r1, c1] = rcOf(m, v), [r2, c2] = rcOf(m, w); return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2)); };
export const sideNeighbors = (m: Model, v: number): number[] => {
  const [r, c] = rcOf(m, v);
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < m.rows && x >= 0 && x < m.cols).map(([y, x]) => y * m.cols + x);
};
/** Casas onde alguém pode estar: livres de móveis (e, no Zip, só as da trilha). */
export function allowedCells(m: Model): number[] {
  const bl = blockedCells(m);
  const base = m.trail ?? Array.from({ length: m.rows * m.cols }, (_, v) => v);
  return base.filter((v) => !bl.has(v));
}
export const stopOf = (m: Model, v: number) => (m.trail ? m.trail.indexOf(v) : -1);

// ---------------------------------------------------------------- conferência

const N = (m: Model) => m.people.length;
/** Quem tinha o objeto o (ou -1 se ninguém ainda). */
const holderOf = (m: Model, a: number[], o: number) => { for (let i = 0; i < N(m); i++) if (a[N(m) + i] === o) return i; return -1; };

/** Confere uma pista de posição, dadas as casas (pos[i]) e quem é a pessoa -1. */
function posOk(m: Model, c: PosClue, pos: (i: number) => number): boolean {
  if ("s" in c) {
    const v = pos(c.s);
    switch (c.k) {
      case "at": return v === c.v;
      case "notAt": return v !== c.v;
      case "room": return roomOf(m, v) === c.r;
      case "notRoom": return roomOf(m, v) !== c.r;
      case "eitherRoom": return c.r.includes(roomOf(m, v));
      case "seat": { const p = propAt(m, v); return !!p && !p.block && p.label === c.p; }
      case "by": return sideNeighbors(m, v).some((w) => { const p = propAt(m, w); return !!p && p.block && p.label === c.p; });
      case "row": return rcOf(m, v)[0] === c.r;
      case "col": return rcOf(m, v)[1] === c.c;
      case "corner": { const [r, col] = rcOf(m, v); return (r === 0 || r === m.rows - 1) && (col === 0 || col === m.cols - 1); }
      case "side": return rcOf(m, v)[0] === c.r;
      case "stop": return stopOf(m, v) === c.n;
      case "notStop": return stopOf(m, v) !== c.n;
      case "alone": case "nearN": {
        let k = 0;
        for (let j = 0; j < N(m); j++) { const w = pos(j); if (w !== v && w >= 0 && kingDist(m, v, w) === 1) k++; }
        return c.k === "alone" ? k === 0 : k === (c as { n: number }).n;
      }
    }
  }
  const x = pos(c.a), y = pos(c.b);
  const [r1, c1] = rcOf(m, x), [r2, c2] = rcOf(m, y);
  switch (c.k) {
    case "left": return c1 < c2;
    case "above": return r1 < r2;
    case "near": return kingDist(m, x, y) === 1;
    case "far": return kingDist(m, x, y) > 1;
    case "diag": return Math.abs(r1 - r2) === Math.abs(c1 - c2);
    case "touch": return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    case "apart": return Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1;
    case "before": return stopOf(m, x) < stopOf(m, y);
    case "next": return stopOf(m, y) === stopOf(m, x) + 1;
    case "sameSide": return r1 === r2;
    case "oppSide": return r1 !== r2;
    case "beside": return Math.abs(c1 - c2) === 1;
  }
  return false;
}

/** As casas respeitam a regra do lugar? (casas distintas, livres e a regra de cada jogo) */
export function ruleOk(m: Model, cells: number[]): boolean {
  const allowed = new Set(allowedCells(m));
  if (cells.some((v) => !allowed.has(v)) || new Set(cells).size !== cells.length) return false;
  const rows = cells.map((v) => rcOf(m, v)[0]), cols = cells.map((v) => rcOf(m, v)[1]), rooms = cells.map((v) => roomOf(m, v));
  const uniq = (xs: number[]) => new Set(xs).size === xs.length;
  switch (m.rule) {
    case "regioes": return uniq(rows) && uniq(cols) && uniq(rooms);
    case "ceu": return uniq(rows) && uniq(cols);
    case "comodos": return uniq(rooms) && rooms.length === m.scene.rooms.length;
    case "trilha": return true;
    case "equilibrio": return uniq(cols) && rows.filter((r) => r === 0).length === cells.length / 2;
  }
}

/** Confere uma pista numa resposta completa. */
export function evalClue(m: Model, c: Clue, a: number[]): boolean {
  const n = N(m);
  switch (c.k) {
    case "rule": return ruleOk(m, a.slice(0, n));
    case "has": return a[n + c.s] === c.o;
    case "hasNot": return a[n + c.s] !== c.o;
    case "via": { const h = holderOf(m, a, c.o); return h >= 0 && posOk(m, c.c, (i) => a[i === -1 ? h : i]); }
    default: return posOk(m, c, (i) => a[i]);
  }
}

/** Personagens e objetos citados por uma pista (para destacar ligações e numerar depoimentos). */
export function peopleOf(m: Model, c: Clue): number[] {
  if (c.k === "rule") return m.people.map((_, i) => i);
  if (c.k === "has" || c.k === "hasNot") return [c.s];
  const p = c.k === "via" ? c.c : c;
  const xs = "s" in p ? [p.s] : [p.a, p.b];
  return xs.filter((i) => i >= 0);
}
export const objectsOf = (c: Clue): number[] => (c.k === "has" || c.k === "hasNot" || c.k === "via" ? [c.o] : []);
/** Compatível com o código antigo: pessoas envolvidas. */
export const involved = peopleOf;

/**
 * Estado de uma pista com a resposta parcial da pessoa (-1 = vazio): true = cumprida, false = já contrariada,
 * null = ainda em aberto. Nunca revela a solução: só confere a pista com o que já foi preenchido.
 */
export function clueState(m: Model, c: Clue, a: number[]): boolean | null {
  const n = N(m);
  if (c.k === "rule") {
    const placed = a.slice(0, n).filter((v) => v >= 0);
    if (new Set(placed).size < placed.length) return false;
    const rows = placed.map((v) => rcOf(m, v)[0]), cols = placed.map((v) => rcOf(m, v)[1]), rooms = placed.map((v) => roomOf(m, v));
    const dup = (xs: number[]) => new Set(xs).size < xs.length;
    if ((m.rule === "regioes" || m.rule === "ceu") && (dup(rows) || dup(cols))) return false;
    if ((m.rule === "regioes" || m.rule === "comodos") && dup(rooms)) return false;
    if (m.rule === "equilibrio" && (dup(cols) || rows.filter((r) => r === 0).length > n / 2 || rows.filter((r) => r === 1).length > n / 2)) return false;
    return a.slice(0, n).includes(-1) ? null : ruleOk(m, a.slice(0, n));
  }
  if (c.k === "has" || c.k === "hasNot") return a[n + c.s] < 0 ? null : evalClue(m, c, a);
  if (c.k === "via") {
    const h = holderOf(m, a, c.o);
    if (h < 0) return null;
    const inner = c.c;
    const need = [h, ...peopleOf(m, inner)];
    if (inner.k === "alone" || inner.k === "nearN") return a.slice(0, n).includes(-1) ? null : evalClue(m, c, a);
    return need.some((i) => a[i] < 0) ? null : evalClue(m, c, a);
  }
  if (c.k === "alone" || c.k === "nearN") return a.slice(0, n).includes(-1) ? null : evalClue(m, c, a);
  return peopleOf(m, c).some((i) => a[i] < 0) ? null : evalClue(m, c, a);
}

// ---------------------------------------------------------------- todas as possibilidades

/** Todas as formas de colocar as pessoas no cenário respeitando a regra do lugar. */
export function posList(m: Model): number[][] {
  const n = N(m);
  const cells = allowedCells(m);
  const out: number[][] = [];
  const cur: number[] = [];
  const usedR = new Set<number>(), usedC = new Set<number>(), usedRoom = new Set<number>(), usedCell = new Set<number>();
  const uniqRow = m.rule === "regioes" || m.rule === "ceu";
  const uniqCol = uniqRow || m.rule === "equilibrio";
  const uniqRoom = m.rule === "regioes" || m.rule === "comodos";
  const rec = (i: number) => {
    if (i === n) { if (ruleOk(m, cur)) out.push(cur.slice()); return; }
    for (const v of cells) {
      const [r, c] = rcOf(m, v), room = roomOf(m, v);
      if (usedCell.has(v) || (uniqRow && usedR.has(r)) || (uniqCol && usedC.has(c)) || (uniqRoom && usedRoom.has(room))) continue;
      cur[i] = v;
      usedCell.add(v); if (uniqRow) usedR.add(r); if (uniqCol) usedC.add(c); if (uniqRoom) usedRoom.add(room);
      rec(i + 1);
      usedCell.delete(v); if (uniqRow) usedR.delete(r); if (uniqCol) usedC.delete(c); if (uniqRoom) usedRoom.delete(room);
    }
  };
  rec(0);
  return out;
}

/** Todas as ordens de 0…n−1 (os jeitos de distribuir n objetos entre n pessoas). */
export function perms(n: number): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const rec = () => {
    if (cur.length === n) { out.push(cur.slice()); return; }
    for (let x = 0; x < n; x++) if (!cur.includes(x)) { cur.push(x); rec(); cur.pop(); }
  };
  rec();
  return out;
}

/** Todas as respostas completas possíveis (regra do lugar já aplicada). */
export function allAnswers(m: Model): number[][] {
  const P = perms(N(m));
  return posList(m).flatMap((pos) => P.map((o) => [...pos, ...o]));
}

/** Todas as soluções (até `limit`). */
export function solveAll(m: Model, clues: Clue[], limit = Infinity): number[][] {
  const sols: number[][] = [];
  for (const a of allAnswers(m)) {
    if (clues.every((c) => evalClue(m, c, a))) { sols.push(a); if (sols.length >= limit) break; }
  }
  return sols;
}

// ---------------------------------------------------------------- dedução (sem chute)

/** Motivo de uma descoberta: a pista (índice), a regra do lugar ou "objetos": cada objeto é de uma pessoa só. */
export type Reason = number | "rule" | "objetos";
/** Uma descoberta: a pessoa s estava na casa v (cat "p") ou tinha o objeto v (cat "o"). */
export interface Step { cat: "p" | "o"; s: number; v: number; by: Reason; uses: number[] }
export interface Deduction { solved: boolean; steps: Step[]; rounds: number; P: boolean[][]; O: boolean[][] }

/**
 * Raciocínio de uma pessoa, simulado: cada pista, junto com a regra do lugar, elimina casas e objetos que ela torna
 * impossíveis; cada objeto é de uma pessoa só (quem já tem objeto libera os outros; o objeto que só cabe numa
 * pessoa é dela). Repete até nada mudar. Se termina com uma única possibilidade para tudo, o caso se resolve só
 * por dedução.
 */
export function deduce(m: Model, clues: Clue[]): Deduction {
  const n = N(m), V = m.rows * m.cols;
  const allowed = new Set(allowedCells(m));
  const P = Array.from({ length: n }, () => Array.from({ length: V }, (_, v) => allowed.has(v)));
  const O = Array.from({ length: n }, () => new Array(n).fill(true));
  const L = posList(m);
  const usesP: Set<number>[] = Array.from({ length: n }, () => new Set());
  const usesO: Set<number>[] = Array.from({ length: n }, () => new Set());
  const fixedP = new Array(n).fill(false), fixedO = new Array(n).fill(false);
  const steps: Step[] = [];
  const size = (row: boolean[]) => row.filter(Boolean).length;
  const mark = (by: Reason) => {
    for (let s = 0; s < n; s++) {
      if (!fixedP[s] && size(P[s]) === 1) { fixedP[s] = true; steps.push({ cat: "p", s, v: P[s].indexOf(true), by, uses: [...usesP[s]] }); }
      if (!fixedO[s] && size(O[s]) === 1) { fixedO[s] = true; steps.push({ cat: "o", s, v: O[s].indexOf(true), by, uses: [...usesO[s]] }); }
    }
  };
  const live = () => L.filter((pos) => pos.every((v, i) => P[i][v]));
  /** Mantém só as casas que aparecem em alguma posição válida que cumpre `ok`. */
  const prune = (ok: (pos: number[]) => boolean, by: number | "rule"): boolean => {
    const keep = Array.from({ length: n }, () => new Array(V).fill(false));
    for (const pos of live()) if (ok(pos)) pos.forEach((v, i) => { keep[i][v] = true; });
    let ch = false;
    for (let i = 0; i < n; i++) for (let v = 0; v < V; v++) if (P[i][v] && !keep[i][v]) { P[i][v] = false; ch = true; if (by !== "rule") usesP[i].add(by); }
    return ch;
  };
  const order = clues.map((_, i) => i).filter((i) => !isRule(clues[i])).sort((i, j) => peopleOf(m, clues[i]).length - peopleOf(m, clues[j]).length);
  let rounds = 0;
  for (let changed = true; changed && rounds < 60;) {
    changed = false; rounds++;
    for (const i of order) {
      const c = clues[i];
      if (c.k === "has") {
        for (let o = 0; o < n; o++) if (o !== c.o && O[c.s][o]) { O[c.s][o] = false; usesO[c.s].add(i); changed = true; }
      } else if (c.k === "hasNot") {
        if (O[c.s][c.o]) { O[c.s][c.o] = false; usesO[c.s].add(i); changed = true; }
      } else if (c.k === "via") {
        // Quem não pode estar onde a pista diz não pode ter o objeto.
        const can = (h: number) => O[h][c.o] && live().some((pos) => posOk(m, c.c, (j) => pos[j === -1 ? h : j]));
        for (let h = 0; h < n; h++) if (O[h][c.o] && !can(h)) { O[h][c.o] = false; usesO[h].add(i); changed = true; }
        // As posições precisam cumprir a pista para pelo menos um dos possíveis donos do objeto.
        const H = Array.from({ length: n }, (_, h) => h).filter((h) => O[h][c.o]);
        if (H.length && prune((pos) => H.some((h) => posOk(m, c.c, (j) => pos[j === -1 ? h : j])), i)) changed = true;
      } else if (isPos(c)) {
        if (prune((pos) => posOk(m, c, (j) => pos[j]), i)) changed = true;
      }
      mark(i);
    }
    // A regra do lugar sozinha (linhas, colunas, cômodos, lados ocupados…).
    if (prune(() => true, "rule")) changed = true;
    mark("rule");
    // Cada objeto é de uma pessoa só.
    for (let s = 0; s < n; s++) if (size(O[s]) === 1) {
      const o = O[s].indexOf(true);
      for (let t = 0; t < n; t++) if (t !== s && O[t][o]) { O[t][o] = false; changed = true; }
    }
    for (let o = 0; o < n; o++) {
      const who = Array.from({ length: n }, (_, s) => s).filter((s) => O[s][o]);
      if (who.length === 1 && size(O[who[0]]) > 1) { O[who[0]].fill(false); O[who[0]][o] = true; changed = true; }
    }
    mark("objetos");
    // Travou? Junta duas pistas: só fica o que as DUAS permitem ao mesmo tempo (como quem lê uma pista à luz da outra).
    if (!changed) {
      const OP = perms(n);
      const answers = () => live().flatMap((pos) => OP.filter((o) => o.every((x, s) => O[s][x])).map((o) => [...pos, ...o]));
      outer: for (let x = 0; x < order.length; x++) for (let y = x + 1; y < order.length; y++) {
        const ci = clues[order[x]], cj = clues[order[y]];
        const ok = answers().filter((a) => evalClue(m, ci, a) && evalClue(m, cj, a));
        const keepP = Array.from({ length: n }, () => new Array(V).fill(false));
        const keepO = Array.from({ length: n }, () => new Array(n).fill(false));
        for (const a of ok) for (let s = 0; s < n; s++) { keepP[s][a[s]] = true; keepO[s][a[n + s]] = true; }
        for (let s = 0; s < n; s++) {
          for (let v = 0; v < V; v++) if (P[s][v] && !keepP[s][v]) { P[s][v] = false; usesP[s].add(order[x]); usesP[s].add(order[y]); changed = true; }
          for (let o = 0; o < n; o++) if (O[s][o] && !keepO[s][o]) { O[s][o] = false; usesO[s].add(order[x]); usesO[s].add(order[y]); changed = true; }
        }
        if (changed) { mark(order[y]); break outer; }
      }
    }
  }
  const solved = P.every((r) => size(r) === 1) && O.every((r) => size(r) === 1);
  return { solved, steps, rounds, P, O };
}

// ---------------------------------------------------------------- texto
// Todas as frases saem daqui.

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const art = (e: Ent) => (e.g === "f" ? "a" : "o");
export const the = (e: Ent) => `${art(e)} ${e.label}`;
const de = (e: Ent) => `${e.g === "f" ? "da" : "do"} ${e.label}`;
const em = (e: Ent) => `${e.g === "f" ? "na" : "no"} ${e.label}`;
const um = (e: { g?: "m" | "f" }) => (e.g === "f" ? "uma" : "um");
const ord = (k: number) => `${k}ª`;

/** "a Ana", ou "quem tinha a Lupa" (pessoa -1 numa pista cruzada). */
const who = (m: Model, i: number, o?: number) => (i === -1 ? `quem tinha ${the(m.objects[o!])}` : the(m.people[i]));
const whoDe = (m: Model, i: number, o?: number) => (i === -1 ? `de quem tinha ${the(m.objects[o!])}` : de(m.people[i]));
const whoEm = (m: Model, i: number, o?: number) => (i === -1 ? `em quem tinha ${the(m.objects[o!])}` : em(m.people[i]));

/** Nome de uma casa para o texto: "a casa B2 (Cozinha)". */
export const cellText = (m: Model, v: number) => `a casa ${cellName(m, v)} (${m.scene.rooms[roomOf(m, v)].label})`;

function posText(m: Model, c: PosClue, o?: number): string {
  const S = (i: number) => who(m, i, o);
  const prop = (label: string) => m.scene.props.find((p) => p.label === label)!;
  switch (c.k) {
    case "at": return `${S(c.s)} estava ${cellText(m, c.v).replace(/^a /, "na ")}`;
    case "notAt": return `${S(c.s)} não estava ${cellText(m, c.v).replace(/^a /, "na ")}`;
    case "room": return `${S(c.s)} estava ${em(m.scene.rooms[c.r])}`;
    case "notRoom": return `${S(c.s)} não estava ${em(m.scene.rooms[c.r])}`;
    case "eitherRoom": return `${S(c.s)} estava ${em(m.scene.rooms[c.r[0]])} ou ${em(m.scene.rooms[c.r[1]])}`;
    case "seat": { const p = prop(c.p); return `${S(c.s)} estava ${p.g === "f" ? "numa" : "num"} ${p.label}`; }
    case "by": { const p = prop(c.p); return `${S(c.s)} estava ao lado ${p.g === "f" ? "de uma" : "de um"} ${p.label}`; }
    case "row": return `${S(c.s)} estava na linha ${c.r + 1}`;
    case "col": return `${S(c.s)} estava na coluna ${"ABCDEF"[c.c]}`;
    case "corner": return `${S(c.s)} estava num dos cantos`;
    case "alone": return `ninguém encostava ${whoEm(m, c.s, o)}`;
    case "nearN": return `${S(c.s)} encostava em exatamente ${c.n === 1 ? "uma pessoa" : `${c.n === 2 ? "duas" : c.n} pessoas`}`;
    case "stop": return `${S(c.s)} estava na ${ord(c.n + 1)} parada da trilha`;
    case "notStop": return `${S(c.s)} não estava na ${ord(c.n + 1)} parada da trilha`;
    case "side": return `${S(c.s)} estava ${em(m.scene.rooms[c.r])}`;
    case "left": return `${S(c.a)} estava numa coluna à esquerda ${whoDe(m, c.b, o)}`;
    case "above": return `${S(c.a)} estava numa linha acima ${whoDe(m, c.b, o)}`;
    case "near": return `${S(c.a)} encostava ${whoEm(m, c.b, o)}`;
    case "far": return `${S(c.a)} e ${S(c.b)} não se encostavam`;
    case "diag": return `${S(c.a)} e ${S(c.b)} estavam na mesma diagonal`;
    case "touch": return `${S(c.a)} e ${S(c.b)} estavam em casas vizinhas (lado a lado ou uma em cima da outra)`;
    case "apart": return `${S(c.a)} e ${S(c.b)} não estavam em casas vizinhas`;
    case "before": return `${S(c.a)} estava antes ${whoDe(m, c.b, o)} na trilha`;
    case "next": return `${S(c.b)} estava logo depois ${whoDe(m, c.a, o)} na trilha`;
    case "sameSide": return `${S(c.a)} e ${S(c.b)} estavam do mesmo lado`;
    case "oppSide": return `${S(c.a)} e ${S(c.b)} estavam em lados opostos`;
    case "beside": return `${S(c.a)} e ${S(c.b)} estavam em colunas vizinhas`;
  }
}

/** Texto da pista (frase completa, com ponto final). */
export function clueText(m: Model, c: Clue): string {
  switch (c.k) {
    case "rule": return RULE_TEXT[m.rule](m);
    case "has": return `${cap(the(m.people[c.s]))} tinha ${the(m.objects[c.o])}.`;
    case "hasNot": return `${cap(the(m.people[c.s]))} não tinha ${the(m.objects[c.o])}.`;
    case "via": return `${cap(posText(m, c.c, c.o))}.`;
    default: return `${cap(posText(m, c))}.`;
  }
}

/** A regra do lugar, em palavras (uma por jogo). */
export const RULE_TEXT: Record<Rule, (m: Model) => string> = {
  regioes: () => "Havia exatamente uma pessoa em cada linha, em cada coluna e em cada cômodo.",
  equilibrio: (m) => `Havia uma pessoa em cada coluna, e metade delas ${em(m.scene.rooms[0])}, a outra metade ${em(m.scene.rooms[1])}.`,
  trilha: () => "Cada pessoa estava numa parada diferente da trilha numerada.",
  comodos: () => "Havia exatamente uma pessoa em cada cômodo.",
  ceu: () => "Havia exatamente uma pessoa em cada linha e em cada coluna.",
};
/** Lembretes que valem para todo caso (★). */
export function ruleNotes(m: Model): string[] {
  const out = ["Cada pessoa estava numa casa livre (ninguém fica em cima de um móvel) e tinha um objeto diferente."];
  if (m.rule === "ceu") out.push("Encostar = estar numa das 8 casas em volta: ao lado, em cima, embaixo ou na diagonal.");
  return out;
}

/** "a Ana estava na casa B2 (Cozinha)" / "a Ana tinha a Lupa". */
export function assignText(m: Model, st: { cat: "p" | "o"; s: number; v: number }): string {
  return st.cat === "p" ? `${the(m.people[st.s])} estava ${cellText(m, st.v).replace(/^a /, "na ")}` : `${the(m.people[st.s])} tinha ${the(m.objects[st.v])}`;
}

/** Explica uma dedução: "Pela pista 3, a Ana tinha a Lupa." */
export function stepText(m: Model, st: Step, label: (i: number) => string = (i) => `pista ${i + 1}`): string {
  const what = assignText(m, st);
  if (st.by === "rule") return `Pela regra do lugar, só sobra uma casa: ${what}.`;
  if (st.by === "objetos") return `Como cada objeto é de uma pessoa só, sobra uma opção: ${what}.`;
  const others = st.uses.filter((u) => u !== st.by);
  const by = others.length ? `Juntando a ${label(others[0])} com a ${label(st.by)}` : `Pela ${label(st.by)}`;
  return `${by}, ${what}.`;
}
