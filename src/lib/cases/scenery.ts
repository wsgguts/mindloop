// Mindloop Investigação — montagem do cenário de cada caso (usada pelo gerador, nunca no navegador).
// O vocabulário (nomes dos cômodos, móveis e assentos) vem da própria história; aqui só se decide ONDE cada coisa
// fica, de forma determinística (semente do gerador):
// Cada jogo segue as regras do jogo de verdade:
//   • Mini Sudoku: os cômodos são os quadrados 2×2 (como as regiões do Mini Sudoku);
//   • Patches: os cômodos são retângulos de tamanhos variados que cobrem o lugar inteiro (como as peças do Patches);
//   • Astros: cômodos de formato livre, cada um uma peça só (como as constelações);
//   • Zip: uma trilha numerada que passa por TODAS as casas livres, uma vez cada (como o caminho do Zip);
//     os móveis são os obstáculos;
//   • Tango: dois lados — a linha de cima é um cômodo, a de baixo é o outro.
// Móveis bloqueiam a casa (ninguém fica ali) e nunca encostam um no outro; assentos são casas que podem ser
// ocupadas e que as pistas podem citar.

import type { Model, Prop, Rule, Scene } from "./model";
import type { Story } from "./story";

type Rng = () => number;
const shuffle = <T,>(r: Rng, xs: T[]) => { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Tamanho do cenário e quantas coisas ele tem. */
export interface Layout { rows: number; cols: number; rooms: number; blocks: number; seats: number }

function neighbors(rows: number, cols: number, v: number): number[] {
  const r = Math.floor(v / cols), c = v % cols;
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < rows && x >= 0 && x < cols).map(([y, x]) => y * cols + x);
}

/** Cômodos contíguos, em ordem de leitura (o cômodo 0 é o do canto de cima à esquerda). */
function growRooms(r: Rng, rows: number, cols: number, k: number): number[] | null {
  const n = rows * cols;
  const room = new Array(n).fill(-1);
  shuffle(r, [...Array(n).keys()]).slice(0, k).forEach((v, i) => { room[v] = i; });
  for (let guard = 0; room.includes(-1) && guard < 10 * n; guard++) {
    for (const i of shuffle(r, [...Array(k).keys()])) {
      const front = [...Array(n).keys()].filter((v) => room[v] === -1 && neighbors(rows, cols, v).some((w) => room[w] === i));
      if (front.length) room[front[Math.floor(r() * front.length)]] = i;
    }
  }
  if (room.includes(-1)) return null;
  const order: number[] = [];
  room.forEach((i) => { if (!order.includes(i)) order.push(i); });
  return room.map((i) => order.indexOf(i));
}

/** Mini Sudoku: quadrados 2×2, em ordem de leitura. */
function boxRooms(rows: number, cols: number): number[] {
  const per = cols / 2;
  return Array.from({ length: rows * cols }, (_, v) => Math.floor(Math.floor(v / cols) / 2) * per + Math.floor((v % cols) / 2));
}

/** Patches: o lugar inteiro cortado em k retângulos (cortes retos sucessivos), em ordem de leitura. */
function rectRooms(r: Rng, rows: number, cols: number, k: number): number[] | null {
  type Rect = { y: number; x: number; h: number; w: number };
  let rects: Rect[] = [{ y: 0, x: 0, h: rows, w: cols }];
  for (let guard = 0; rects.length < k && guard < 200; guard++) {
    const i = Math.floor(r() * rects.length), t = rects[i];
    const cuts: Rect[][] = [];
    for (let a = 1; a < t.h; a++) cuts.push([{ ...t, h: a }, { ...t, y: t.y + a, h: t.h - a }]);
    for (let a = 1; a < t.w; a++) cuts.push([{ ...t, w: a }, { ...t, x: t.x + a, w: t.w - a }]);
    const ok = cuts.filter((c) => c.every((q) => q.h * q.w >= 2));
    if (!ok.length) continue;
    rects = [...rects.slice(0, i), ...ok[Math.floor(r() * ok.length)], ...rects.slice(i + 1)];
  }
  if (rects.length !== k) return null;
  // Tamanhos variados, como as peças do Patches: nunca todos iguais (3 cômodos: os 3 diferentes; 4: pelo menos 3 tamanhos).
  if (new Set(rects.map((q) => q.h * q.w)).size < Math.min(k, 3)) return null;
  const room = new Array(rows * cols).fill(-1);
  rects.forEach((q, i) => { for (let y = q.y; y < q.y + q.h; y++) for (let x = q.x; x < q.x + q.w; x++) room[y * cols + x] = i; });
  const order: number[] = [];
  room.forEach((i) => { if (!order.includes(i)) order.push(i); });
  return room.map((i) => order.indexOf(i));
}

/** Zip: caminho de casas vizinhas que passa por TODAS as casas livres, uma vez cada (ou null se não houver). */
function fullTrail(r: Rng, rows: number, cols: number, blocked: Set<number>): number[] | null {
  const free = [...Array(rows * cols).keys()].filter((v) => !blocked.has(v));
  for (const start of shuffle(r, free)) {
    const path = [start];
    let steps = 0;
    const go = (): boolean => {
      if (path.length === free.length) return true;
      if (++steps > 20000) return false;
      for (const w of shuffle(r, neighbors(rows, cols, path[path.length - 1]))) {
        if (blocked.has(w) || path.includes(w)) continue;
        path.push(w);
        if (go()) return true;
        path.pop();
      }
      return false;
    };
    if (go()) return path;
  }
  return null;
}

/**
 * Monta o cenário de um caso. Devolve null se o sorteio não serviu (o gerador tenta de novo com outra semente).
 */
export function buildScene(r: Rng, story: Story, rule: Rule, L: Layout): Pick<Model, "rows" | "cols" | "scene" | "trail"> | null {
  const { rows, cols } = L;
  const N = rows * cols;
  let room: number[] | null;
  let trail: number[] | undefined;
  if (rule === "equilibrio") room = Array.from({ length: N }, (_, v) => (Math.floor(v / cols) === 0 ? 0 : 1));
  else if (rule === "regioes") room = boxRooms(rows, cols);
  else if (rule === "comodos") room = rectRooms(r, rows, cols, L.rooms);
  else room = growRooms(r, rows, cols, L.rooms);
  if (!room) return null;
  const props: Prop[] = [];
  // Móveis: sem encostar em outro móvel.
  for (const b of shuffle(r, story.blocks).slice(0, L.blocks)) {
    const v = shuffle(r, [...Array(N).keys()]).find((x) => !props.some((p) => p.cell === x || neighbors(rows, cols, x).includes(p.cell)));
    if (v === undefined) return null;
    props.push({ cell: v, label: b.label, g: b.g, icon: b.icon ?? "⬛", block: true });
  }
  if (rule === "trilha") {
    // A trilha passa por todas as casas livres (os móveis são os obstáculos do caminho).
    trail = fullTrail(r, rows, cols, new Set(props.map((p) => p.cell))) ?? undefined;
    if (!trail) return null;
    if (new Set(trail.map((v) => room![v])).size < 2) return null;
  }
  const onTrail = (v: number) => !!trail?.includes(v);
  // Cada cômodo precisa de pelo menos uma casa livre.
  const rooms = rule === "equilibrio" ? 2 : L.rooms;
  for (let k = 0; k < rooms; k++) if (![...Array(N).keys()].some((v) => room![v] === k && !props.some((p) => p.cell === v))) return null;
  // Assentos: casas livres (no Zip, na trilha — é onde as pessoas podem estar).
  for (const s of shuffle(r, story.seats).slice(0, L.seats)) {
    const v = shuffle(r, [...Array(N).keys()]).find((x) => !props.some((p) => p.cell === x) && (!trail || onTrail(x)));
    if (v === undefined) return null;
    props.push({ cell: v, label: s.label, g: s.g, icon: s.icon ?? "⬜", block: false });
  }
  const names = rule === "equilibrio" ? story.rooms.slice(0, 2) : shuffle(r, story.rooms).slice(0, rooms);
  const scene: Scene = { room, rooms: names.map((x) => ({ label: x.label, g: x.g })), props };
  return { rows, cols, scene, ...(trail ? { trail } : {}) };
}
