// As investigações seguem as regras dos jogos de verdade (escritas aqui de novo, sem usar o motor):
//   Mini Sudoku: 4×4, regiões = quadrados 2×2, uma pessoa por linha, coluna e região;
//   Tango: 2 lados × 4 colunas, uma por coluna e metade de cada lado (equilíbrio, nunca três iguais seguidos);
//   Zip: uma trilha que passa por TODAS as casas livres, uma vez cada, andando de casa vizinha em casa vizinha;
//   Patches: o lugar é coberto por retângulos, uma pessoa em cada um;
//   Astros: uma pessoa por linha, coluna e região, e ninguém encosta em ninguém (nem na diagonal).
// Além de conferir a solução de cada mistério, confere que o motor aceita EXATAMENTE as posições que as regras
// permitem (nem mais, nem menos) — então a tela nunca dá como certa uma posição que quebra a regra do jogo.
import { describe, expect, it } from "vitest";
import { allCases } from "./catalog";
import { CASES_DATA } from "./data";
import { type Model, posList } from "./model";

const rc = (m: Model, v: number) => [Math.floor(v / m.cols), v % m.cols] as const;
const blocked = (m: Model) => new Set(m.scene.props.filter((p) => p.block).map((p) => p.cell));
const uniq = (xs: number[]) => new Set(xs).size === xs.length;
const touch = (m: Model, v: number, w: number) => { const [a, b] = rc(m, v), [c, d] = rc(m, w); return Math.max(Math.abs(a - c), Math.abs(b - d)) <= 1; };

function contiguous(m: Model, cells: number[]): boolean {
  const set = new Set(cells), seen = new Set([cells[0]]), todo = [cells[0]];
  while (todo.length) {
    const v = todo.pop()!, [r, c] = rc(m, v);
    for (const [y, x] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      const w = y * m.cols + x;
      if (y >= 0 && y < m.rows && x >= 0 && x < m.cols && set.has(w) && !seen.has(w)) { seen.add(w); todo.push(w); }
    }
  }
  return seen.size === cells.length;
}
const isRect = (m: Model, cells: number[]) => {
  const rs = cells.map((v) => rc(m, v)[0]), cs = cells.map((v) => rc(m, v)[1]);
  return (Math.max(...rs) - Math.min(...rs) + 1) * (Math.max(...cs) - Math.min(...cs) + 1) === cells.length;
};
const cellsOf = (m: Model, k: number) => m.scene.room.flatMap((r, v) => (r === k ? [v] : []));

/** O lugar está montado como no jogo? (texto do problema, ou null) */
function placeProblem(m: Model, n: number): string | null {
  const K = m.scene.rooms.length;
  for (let k = 0; k < K; k++) if (!cellsOf(m, k).length || !contiguous(m, cellsOf(m, k))) return `cômodo ${k} vazio ou partido`;
  switch (m.rule) {
    case "regioes":
      if (m.rows !== 4 || m.cols !== 4 || n !== 4) return "Mini Sudoku: precisa ser 4×4 com 4 pessoas";
      return m.scene.room.every((k, v) => k === Math.floor(rc(m, v)[0] / 2) * 2 + Math.floor(rc(m, v)[1] / 2)) ? null : "Mini Sudoku: regiões não são os quadrados 2×2";
    case "equilibrio":
      if (m.rows !== 2 || m.cols !== n) return "Tango: 2 lados com uma coluna por pessoa";
      return m.scene.room.every((k, v) => k === rc(m, v)[0]) ? null : "Tango: cada lado é uma linha";
    case "trilha": {
      const t = m.trail ?? [], b = blocked(m);
      const free = [...Array(m.rows * m.cols).keys()].filter((v) => !b.has(v));
      if (!uniq(t) || t.length !== free.length || !free.every((v) => t.includes(v))) return "Zip: a trilha precisa passar por todas as casas livres, uma vez cada";
      for (let i = 1; i < t.length; i++) { const [a, c] = rc(m, t[i - 1]), [d, e] = rc(m, t[i]); if (Math.abs(a - d) + Math.abs(c - e) !== 1) return "Zip: trilha pulou casa"; }
      return null;
    }
    case "comodos":
      if (K !== n) return "Patches: um cômodo por pessoa";
      for (let k = 0; k < K; k++) if (!isRect(m, cellsOf(m, k))) return `Patches: cômodo ${k} não é retângulo`;
      if (new Set([...Array(K).keys()].map((k) => cellsOf(m, k).length)).size < Math.min(K, 3)) return "Patches: peças de tamanhos variados (nunca todas iguais)";
      return null;
    case "ceu":
      return m.rows === n && m.cols === n && K === n ? null : "Astros: N×N com N pessoas e N regiões";
  }
}

/** As posições (uma casa por pessoa) seguem a regra do jogo? */
function placementOk(m: Model, pos: number[]): boolean {
  const b = blocked(m);
  if (!uniq(pos) || pos.some((v) => b.has(v))) return false;
  const rows = pos.map((v) => rc(m, v)[0]), cols = pos.map((v) => rc(m, v)[1]), rooms = pos.map((v) => m.scene.room[v]);
  switch (m.rule) {
    case "regioes": return uniq(rows) && uniq(cols) && uniq(rooms);
    case "equilibrio": return uniq(cols) && rows.filter((r) => r === 0).length * 2 === pos.length;
    case "trilha": return pos.every((v) => m.trail!.includes(v));
    case "comodos": return uniq(rooms) && rooms.length === m.scene.rooms.length;
    case "ceu": return uniq(rows) && uniq(cols) && uniq(rooms) && pos.every((v, i) => pos.every((w, j) => j <= i || !touch(m, v, w)));
  }
}

function brute(m: Model, n: number): string[] {
  const out: string[] = [], cur: number[] = [], V = m.rows * m.cols;
  const rec = () => {
    if (cur.length === n) { if (placementOk(m, cur)) out.push(cur.join(",")); return; }
    for (let v = 0; v < V; v++) if (!cur.includes(v)) { cur.push(v); rec(); cur.pop(); }
  };
  rec();
  return out.sort();
}

describe("as investigações seguem as regras de cada jogo", () => {
  it("o lugar de cada mistério está montado como no jogo", () => {
    for (const c of CASES_DATA) expect(placeProblem(c.model, c.model.people.length), c.id).toBeNull();
  });

  it("a solução de cada mistério cumpre a regra do jogo (ninguém em móvel, um objeto por pessoa)", () => {
    for (const c of CASES_DATA) {
      const n = c.model.people.length;
      expect(placementOk(c.model, c.sol.slice(0, n)), c.id).toBe(true);
      expect([...c.sol.slice(n)].sort(), c.id).toEqual([...Array(n).keys()]);
    }
  });

  it("o motor aceita exatamente as posições que a regra do jogo permite", () => {
    for (const c of CASES_DATA) {
      const n = c.model.people.length;
      const engine = posList(c.model).map((p) => p.join(",")).sort();
      expect(engine, c.id).toEqual(brute(c.model, n));
    }
  });

  it("Astros: nenhuma pista fala em encostar (é proibido); as distâncias são em passos", () => {
    for (const c of allCases().filter((x) => x.model.rule === "ceu")) {
      for (const t of c.clueTexts) expect(t, c.id).not.toMatch(/encost/i);
      expect(c.ruleTexts[0], c.id).toMatch(/ninguém encostava/);
    }
  });
});
