// Mindloop Investigação — montagem do cenário de cada caso (usada pelo gerador, nunca no navegador).
// O vocabulário (nomes dos cômodos, móveis e assentos) vem da própria história; aqui só se decide ONDE cada coisa
// fica, de forma determinística (semente do gerador):
//   • cômodos: crescem a partir de sementes, cada um é uma peça só;
//   • móveis: bloqueiam a casa (ninguém fica ali) e nunca encostam um no outro;
//   • assentos: casas que podem ser ocupadas e que as pistas podem citar;
//   • Zip: uma trilha (caminho de casas vizinhas) numerada, que atravessa os cômodos;
//   • Tango: dois lados — a linha de cima é um cômodo, a de baixo é o outro.

import type { Model, Prop, Rule, Scene } from "./model";
import type { Story } from "./story";

type Rng = () => number;
const shuffle = <T,>(r: Rng, xs: T[]) => { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Tamanho do cenário e quantas coisas ele tem. */
export interface Layout { rows: number; cols: number; rooms: number; blocks: number; seats: number; trail?: number }

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

/** Trilha: caminho de casas vizinhas, sem repetir casa, com `len` paradas. */
function walkTrail(r: Rng, rows: number, cols: number, len: number): number[] | null {
  const start = Math.floor(r() * rows * cols);
  const path = [start];
  const go = (): boolean => {
    if (path.length === len) return true;
    for (const w of shuffle(r, neighbors(rows, cols, path[path.length - 1]))) {
      if (path.includes(w)) continue;
      path.push(w);
      if (go()) return true;
      path.pop();
    }
    return false;
  };
  return go() ? path : null;
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
  else room = growRooms(r, rows, cols, L.rooms);
  if (!room) return null;
  if (rule === "trilha") {
    trail = walkTrail(r, rows, cols, L.trail!) ?? undefined;
    if (!trail) return null;
    // A trilha precisa atravessar pelo menos dois cômodos (senão as pistas de cômodo não dizem nada).
    if (new Set(trail.map((v) => room![v])).size < 2) return null;
  }
  const props: Prop[] = [];
  const onTrail = (v: number) => !!trail?.includes(v);
  // Móveis: fora da trilha, sem encostar em outro móvel.
  for (const b of shuffle(r, story.blocks).slice(0, L.blocks)) {
    const v = shuffle(r, [...Array(N).keys()]).find((x) => !onTrail(x) && !props.some((p) => p.cell === x || neighbors(rows, cols, x).includes(p.cell)));
    if (v === undefined) return null;
    props.push({ cell: v, label: b.label, g: b.g, icon: b.icon ?? "⬛", block: true });
  }
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
