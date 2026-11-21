// Mindloop Investigação — modelo do caso (funções puras, sem React).
//
// Toda investigação é um CENÁRIO em grade com personagens e objetos. A resposta tem duas partes:
//   • ONDE cada personagem estava (uma casa livre do tabuleiro);
//   • QUE OBJETO cada personagem tinha (um objeto diferente para cada um).
// A resposta é guardada como a = [casa do 1º, casa do 2º, …, objeto do 1º, objeto do 2º, …] (-1 = vazio).
//
// Cada jogo dá ao cenário a SUA regra (a mesma lógica do jogo, levada para um lugar):
//   regioes    (Mini Sudoku) — uma pessoa por linha, por coluna e por cômodo 2×2;
//   equilibrio (Tango)       — dois lados (Cristal em cima, Orbe embaixo), uma pessoa por coluna, metade de cada lado;
//   trilha     (Zip)         — uma trilha numerada atravessa o lugar; cada pessoa numa parada diferente;
//   comodos    (Patches)     — exatamente uma pessoa em cada cômodo (só importa o cômodo, não a casa);
//   ceu        (Astros)      — uma pessoa por linha, coluna e região, sem ninguém se encostar.
//
// As pistas são DIRETAS: cada uma vira marcações (✓ ou ✗) numa grade do quadro de decisões (grids.ts). Relações
// entre duas pessoas só existem no Zip ("logo depois de") e no Tango (= e ×), e só depois que a outra pessoa já foi
// descoberta — então elas também viram marcações simples. A dedução passo a passo fica em logic.ts.

export type Rule = "regioes" | "equilibrio" | "trilha" | "comodos" | "ceu";
/** Nome antigo, mantido para quem só precisa do "tipo" do caso. */
export type CaseKind = Rule;

/** Uma entidade com nome. g = gênero gramatical ("o/a", "do/da"). */
export interface Ent { label: string; g?: "m" | "f"; icon?: string; pl?: string; /** Nome curto para o cabeçalho da grade. */ short?: string }

/** Móvel (bloqueia a casa: ninguém fica ali). Assentos antigos (block: false) não são mais gerados. */
export interface Prop { cell: number; label: string; g?: "m" | "f"; icon: string; block: boolean }
export interface Scene {
  /** Cômodo de cada casa (índice em `rooms`). No Tango, os "cômodos" 0 e 1 são os lados (Cristal e Orbe). */
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

/** Pistas de lugar (s = pessoa). Todas viram marcações diretas numa grade do quadro. */
export type PosClue =
  | { k: "row" | "notRow"; s: number; r: number }
  | { k: "col" | "notCol"; s: number; c: number }
  /** Cômodo (Sudoku, Patches), região (Astros) ou trecho da trilha (Zip). */
  | { k: "room" | "notRoom"; s: number; r: number }
  /** Tango: lado 0 = Cristal (linha de cima), 1 = Orbe (linha de baixo). */
  | { k: "side"; s: number; r: number }
  /** Zip: parada n (0 = primeira); depois/antes da parada n (sem contar ela). */
  | { k: "stop" | "notStop" | "stopAfter" | "stopBefore"; s: number; n: number }
  /** Patches: cômodo com n casas. */
  | { k: "size"; s: number; n: number }
  /** Zip: b passou logo depois de a. Tango: a e b do mesmo lado (=) ou em lados opostos (×). a já está descoberto. */
  | { k: "next" | "sameSide" | "oppSide"; a: number; b: number };

export type Clue =
  | PosClue
  | { k: "has" | "hasNot"; s: number; o: number }
  /** A regra do lugar (cada jogo tem a sua). */
  | { k: "rule" };

export type ClueKind = Clue["k"];
export const isRule = (c: Clue) => c.k === "rule";
/** Pistas que falam de duas pessoas (só valem quando a primeira já foi descoberta). */
export const isRelational = (c: Clue): c is Extract<PosClue, { a: number }> => c.k === "next" || c.k === "sameSide" || c.k === "oppSide";
/** Pistas que dizem o que NÃO era. */
/** "Depois/antes da parada N" e "lados opostos (×)" são pistas de ordem e de símbolo (a mecânica do Zip e do Tango), não negações. */
export const isNegative = (c: Clue) => ["notRow", "notCol", "notRoom", "notStop", "hasNot"].includes(c.k);

// ---------------------------------------------------------------- geometria do cenário

export const rcOf = (m: Model, v: number): [number, number] => [Math.floor(v / m.cols), v % m.cols];
export const COLS = "ABCDEF";
export const cellName = (m: Model, v: number) => { const [r, c] = rcOf(m, v); return `${COLS[c]}${r + 1}`; };
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
/** Casas de cada cômodo e o tamanho dele (Patches: o número da etiqueta). */
export const roomCells = (m: Model, r: number) => m.scene.room.flatMap((x, v) => (x === r ? [v] : []));
export const roomSize = (m: Model, r: number) => roomCells(m, r).length;

/**
 * Unidades de lugar: o que a resposta precisa acertar. Na maioria dos jogos, a casa; no Patches, só o cômodo
 * (qualquer casa livre dele vale). Cada unidade é representada por uma casa (a primeira livre do cômodo).
 */
export function units(m: Model): number[] {
  const cells = allowedCells(m);
  if (m.rule !== "comodos") return cells;
  return m.scene.rooms.map((_, r) => cells.find((v) => roomOf(m, v) === r)!).filter((v) => v !== undefined);
}
/** A unidade de uma casa (no Patches, a casa representante do cômodo; nos outros, a própria casa). */
export const unitOf = (m: Model, v: number) => (m.rule === "comodos" && v >= 0 ? units(m)[roomOf(m, v)] : v);

// ---------------------------------------------------------------- conferência

const N = (m: Model) => m.people.length;

/** Confere uma pista de lugar, dadas as casas (pos[i]). */
function posOk(m: Model, c: PosClue, pos: (i: number) => number): boolean {
  if ("s" in c) {
    const v = pos(c.s);
    const [r, col] = rcOf(m, v);
    switch (c.k) {
      case "row": return r === c.r;
      case "notRow": return r !== c.r;
      case "col": return col === c.c;
      case "notCol": return col !== c.c;
      case "room": return roomOf(m, v) === c.r;
      case "notRoom": return roomOf(m, v) !== c.r;
      case "side": return r === c.r;
      case "stop": return stopOf(m, v) === c.n;
      case "notStop": return stopOf(m, v) !== c.n;
      case "stopAfter": return stopOf(m, v) > c.n;
      case "stopBefore": return stopOf(m, v) < c.n;
      case "size": return roomSize(m, roomOf(m, v)) === c.n;
    }
  }
  const x = pos(c.a), y = pos(c.b);
  switch (c.k) {
    case "next": return stopOf(m, y) === stopOf(m, x) + 1;
    case "sameSide": return rcOf(m, x)[0] === rcOf(m, y)[0];
    case "oppSide": return rcOf(m, x)[0] !== rcOf(m, y)[0];
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
    case "ceu": return uniq(rows) && uniq(cols) && uniq(rooms) && rooms.length === m.scene.rooms.length && cells.every((v, i) => cells.every((w, j) => j <= i || kingDist(m, v, w) > 1));
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
    default: return posOk(m, c, (i) => a[i]);
  }
}

/** Personagens citados por uma pista (para destacar ligações). */
export function peopleOf(m: Model, c: Clue): number[] {
  if (c.k === "rule") return m.people.map((_, i) => i);
  return "s" in c ? [c.s] : [c.a, c.b];
}
export const objectsOf = (c: Clue): number[] => (c.k === "has" || c.k === "hasNot" ? [c.o] : []);

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
    if ((m.rule === "regioes" || m.rule === "comodos" || m.rule === "ceu") && dup(rooms)) return false;
    if (m.rule === "equilibrio" && (dup(cols) || rows.filter((r) => r === 0).length > n / 2 || rows.filter((r) => r === 1).length > n / 2)) return false;
    return a.slice(0, n).includes(-1) ? null : ruleOk(m, a.slice(0, n));
  }
  if (c.k === "has" || c.k === "hasNot") return a[n + c.s] < 0 ? null : evalClue(m, c, a);
  return peopleOf(m, c).some((i) => a[i] < 0) ? null : evalClue(m, c, a);
}

// ---------------------------------------------------------------- todas as possibilidades

/** Todas as formas de colocar as pessoas no cenário respeitando a regra do lugar (uma casa por unidade). */
export function posList(m: Model): number[][] {
  const n = N(m);
  const cells = units(m);
  const out: number[][] = [];
  const cur: number[] = [];
  const usedR = new Set<number>(), usedC = new Set<number>(), usedRoom = new Set<number>(), usedCell = new Set<number>();
  const uniqRow = m.rule === "regioes" || m.rule === "ceu";
  const uniqCol = uniqRow || m.rule === "equilibrio";
  const uniqRoom = m.rule === "regioes" || m.rule === "comodos" || m.rule === "ceu";
  const noTouch = m.rule === "ceu";
  const rec = (i: number) => {
    if (i === n) { if (ruleOk(m, cur)) out.push(cur.slice()); return; }
    for (const v of cells) {
      const [r, c] = rcOf(m, v), room = roomOf(m, v);
      if (usedCell.has(v) || (uniqRow && usedR.has(r)) || (uniqCol && usedC.has(c)) || (uniqRoom && usedRoom.has(room))) continue;
      if (noTouch && cur.slice(0, i).some((w) => kingDist(m, v, w) === 1)) continue;
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
// ---------------------------------------------------------------- texto
// Todas as frases das pistas saem daqui (o "quem conta" de cada pista vem de witness.ts).

export const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const art = (e: Ent) => (e.g === "f" ? "a" : "o");
export const the = (e: Ent) => `${art(e)} ${e.label}`;
export const de = (e: Ent) => `${e.g === "f" ? "da" : "do"} ${e.label}`;
export const em = (e: Ent) => `${e.g === "f" ? "na" : "no"} ${e.label}`;
const ord = (k: number) => `${k}ª`;
/** Nome dos lados do Tango (o símbolo do jogo) e o lugar da história que cada lado representa. */
export const SIDE_NAMES = ["Cristal", "Orbe"] as const;
export const sideText = (m: Model, r: number) => `no lado do ${SIDE_NAMES[r]} (${m.scene.rooms[r].label})`;

/** Nome de uma casa para o texto: "a casa B2 (Cozinha)". */
export const cellText = (m: Model, v: number) => `a casa ${cellName(m, v)} (${m.scene.rooms[roomOf(m, v)].label})`;

/** A frase da pista, sem quem conta (minúscula no começo, sem ponto final): "a Mel estava na coluna A". */
export function clueClause(m: Model, c: Clue): string {
  if (c.k === "rule") return RULE_TEXT[m.rule](m);
  if (c.k === "has") return `${the(m.people[c.s])} segurava ${the(m.objects[c.o])}`;
  if (c.k === "hasNot") return `${the(m.people[c.s])} não segurava ${the(m.objects[c.o])}`;
  if ("a" in c) {
    const A = m.people[c.a], B = m.people[c.b];
    switch (c.k) {
      case "next": return `${the(B)} passou logo depois ${de(A)} na trilha`;
      case "sameSide": return `${the(B)} estava do mesmo lado ${de(A)} (=)`;
      case "oppSide": return `${the(B)} estava no lado oposto ao ${de(A)} (×)`;
    }
  }
  const S = the(m.people[(c as { s: number }).s]);
  const place = (r: number) => em(m.scene.rooms[r]);
  switch (c.k) {
    case "row": return `${S} estava na linha ${c.r + 1}`;
    case "notRow": return `${S} não estava na linha ${c.r + 1}`;
    case "col": return `${S} estava na coluna ${COLS[c.c]}`;
    case "notCol": return `${S} não estava na coluna ${COLS[c.c]}`;
    case "room": return `${S} estava ${place(c.r)}`;
    case "notRoom": return `${S} não estava ${place(c.r)}`;
    case "side": return `${S} estava ${sideText(m, c.r)}`;
    case "stop": return `${S} estava na ${ord(c.n + 1)} parada da trilha`;
    case "notStop": return `${S} não estava na ${ord(c.n + 1)} parada da trilha`;
    case "stopAfter": return `${S} estava depois da ${ord(c.n + 1)} parada`;
    case "stopBefore": return `${S} estava antes da ${ord(c.n + 1)} parada`;
    case "size": return `${S} estava no cômodo de ${c.n} casas`;
  }
  return "";
}

/** Texto da pista (frase completa, com ponto final). voice = quem conta ("O vigia jura que"). */
export function clueText(m: Model, c: Clue, voice?: string): string {
  const body = clueClause(m, c);
  if (c.k === "rule") return body;
  return voice ? `${voice} ${body}.` : `${cap(body)}.`;
}

/** A regra do lugar, em palavras (uma por jogo). */
export const RULE_TEXT: Record<Rule, (m: Model) => string> = {
  regioes: () => "Como no Mini Sudoku: havia exatamente uma pessoa em cada linha, em cada coluna e em cada cômodo (os quatro quadrados 2×2).",
  equilibrio: (m) => `Como no Tango, tudo em equilíbrio: uma pessoa em cada coluna, metade delas no lado do Cristal (${m.scene.rooms[0].label}) e metade no lado do Orbe (${m.scene.rooms[1].label}).`,
  trilha: () => "Como no Zip: a trilha numerada passa por todas as casas livres, uma vez cada, e cada pessoa estava numa parada diferente.",
  comodos: () => "Como as peças do Patches: cada cômodo é um retângulo com o tamanho escrito no canto, e havia exatamente uma pessoa em cada cômodo.",
  ceu: () => "Como os astros: havia exatamente uma pessoa em cada linha, em cada coluna e em cada região, e ninguém encostava em ninguém.",
};
/** Lembretes que valem para todo caso (★). */
export function ruleNotes(m: Model): string[] {
  const out = ["Cada pessoa estava numa casa livre (ninguém fica em cima de um móvel) e segurava um objeto diferente."];
  if (m.rule === "comodos") out.push("Aqui só importa o cômodo: qualquer casa livre dele vale como resposta.");
  return out;
}

/** "a Ana estava na casa B2 (Cozinha)" / "a Ana segurava a Lupa". */
