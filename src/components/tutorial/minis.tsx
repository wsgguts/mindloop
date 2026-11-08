"use client";
// Mini tabuleiros das demonstrações. Usam as MESMAS classes visuais das partidas (board/cell, tboard/tcell,
// zboard/zcell, ptboard/ptpiece…), então o tutorial mostra exatamente o que a pessoa vai ver ao jogar.
// Não são interativos: cada elemento tem data-t="..." para o dedo da demonstração apontar.

import TangoSymbol from "../TangoSymbol";
import PatchesTag from "../PatchesTag";
import { area, type Kind, type Rect } from "../../lib/patchesLogic";

export type RC = [number, number];
const has = (list: RC[] | undefined, r: number, c: number) => !!list?.some(([a, b]) => a === r && b === c);
const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

// ---------------- Mini Sudoku ----------------
export interface SudokuP {
  vals: number[][];
  given: boolean[][];
  sel?: RC; bad?: RC[]; hl?: RC[]; ok?: RC[]; pop?: RC;
  win?: boolean;
  /** Teclado de números abaixo da grade (e qual tecla está sendo tocada). */
  pad?: boolean; press?: number;
  /** Possibilidades de uma casa (números riscados = eliminados). */
  cands?: { out: number[]; keep?: number };
}
export function MiniSudoku({ vals, given, sel, bad, hl, ok, pop, win, pad, press, cands }: SudokuP) {
  const n = vals.length, bh = 2, bw = n === 4 ? 2 : 3;
  return (
    <div className="tut-col">
      <div className={cls("board", `n${n}`, win && "win", "tut-board")} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {vals.map((row, r) => row.map((v, c) => (
          <div key={`${r}-${c}`} data-t={`c-${r}-${c}`} style={{ "--r": r, "--c": c, "--b": Math.floor(r / bh) * (n / bw) + Math.floor(c / bw) } as React.CSSProperties}
            className={cls("cell", given[r][c] && "given", has([sel!].filter(Boolean) as RC[], r, c) && "sel", has(bad, r, c) && "bad",
              has(hl, r, c) && "tut-hl", has(ok, r, c) && "tut-ok", has([pop!].filter(Boolean) as RC[], r, c) && "tut-pop",
              (c + 1) % bw === 0 && c < n - 1 && "bx-r", (r + 1) % bh === 0 && r < n - 1 && "bx-b")}>
            {v || ""}
          </div>
        )))}
      </div>
      {cands && (
        <div className="tut-cands">
          {Array.from({ length: n }, (_, k) => k + 1).map((d) => (
            <span key={d} className={cls(cands.out.includes(d) && "out", cands.keep === d && "keep")}>{d}</span>
          ))}
        </div>
      )}
      {pad && (
        <div className={`pad n${n} tut-pad`} style={{ gridTemplateColumns: `repeat(${n + 1}, 1fr)` }}>
          {Array.from({ length: n }, (_, k) => k + 1).map((d) => <span key={d} data-t={`pad-${d}`} className={cls("btn", press === d && "tut-press")}>{d}</span>)}
          <span data-t="pad-0" className={cls("btn sec erase", press === 0 && "tut-press")}>Apagar</span>
        </div>
      )}
    </div>
  );
}

// ---------------- Mini Tango ----------------
export interface TangoSign { r: number; c: number; dir: "h" | "v"; same: boolean }
export interface TangoP {
  grid: number[][];
  given?: boolean[][];
  signs?: TangoSign[];
  sel?: RC; bad?: RC[]; hl?: RC[]; ok?: RC[];
  win?: boolean;
  pad?: boolean; press?: "c" | "o" | "x";
  /** Contagem da linha 0 (exemplo do equilíbrio). */
  count?: boolean;
}
export function MiniTango({ grid, given, signs = [], sel, bad, hl, ok, win, pad, press, count }: TangoP) {
  const rows = grid.length, cols = grid[0].length;
  const nC = grid[0].filter((v) => v === 1).length, nO = grid[0].filter((v) => v === 2).length;
  return (
    <div className="tut-col">
      <div className={cls("tboard", win && "win", "tut-board")} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: `min(100%, ${cols * 64}px)` }}>
        {grid.map((row, r) => row.map((v, c) => (
          <div key={`${r}-${c}`} data-t={`c-${r}-${c}`} style={{ "--r": r, "--c": c } as React.CSSProperties}
            className={cls("tcell", given?.[r][c] && "given", sel && sel[0] === r && sel[1] === c && "sel", has(bad, r, c) && "bad", has(hl, r, c) && "tut-hl", has(ok, r, c) && "tut-ok")}>
            {v ? <TangoSymbol v={v} size="68%" /> : null}
          </div>
        )))}
        {signs.map((s, i) => (
          <span key={i} className={cls("tsign", s.same ? "eq" : "ne")} style={{
            left: `${(s.dir === "h" ? (s.c + 1) / cols : (s.c + 0.5) / cols) * 100}%`,
            top: `${(s.dir === "h" ? (s.r + 0.5) / rows : (s.r + 1) / rows) * 100}%`,
          }}>{s.same ? "=" : "×"}</span>
        ))}
      </div>
      {count && (
        <div className="tut-count-row">
          <span className={nC > cols / 2 ? "over" : nC === cols / 2 ? "full" : ""}><TangoSymbol v={1} size={18} /> {nC} de {cols / 2}</span>
          <span className={nO > cols / 2 ? "over" : nO === cols / 2 ? "full" : ""}><TangoSymbol v={2} size={18} /> {nO} de {cols / 2}</span>
        </div>
      )}
      {pad && (
        <div className="tpad tut-pad">
          <span data-t="pad-c" className={cls("btn sec", press === "c" && "tut-press")}><TangoSymbol v={1} size={22} />Cristal</span>
          <span data-t="pad-o" className={cls("btn sec", press === "o" && "tut-press")}><TangoSymbol v={2} size={22} />Orbe</span>
          <span data-t="pad-x" className={cls("btn sec", press === "x" && "tut-press")}>Apagar</span>
        </div>
      )}
    </div>
  );
}

// ---------------- Mini Zip ----------------
export interface ZipP {
  nums: number[][];
  path: RC[];
  /** Casa recusada (pisca em vermelho). */
  bad?: RC;
  /** Casas que sobraram (destaque de erro). */
  left?: RC[];
  hl?: RC[];
  win?: boolean;
}
export function MiniZip({ nums, path, bad, left, hl, win }: ZipP) {
  const n = nums.length;
  const order = new Map(path.map(([r, c], i) => [`${r}-${c}`, i]));
  const head = path[path.length - 1];
  const reached = new Set(path.map(([r, c]) => `${r}-${c}`));
  const pts = path.map(([r, c]) => `${c + 0.5},${r + 0.5}`).join(" ");
  return (
    <div className={cls("zboard", win && "win", "tut-board")} style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, "--zstep": `${1400 / (n * n)}ms` } as React.CSSProperties}>
      <svg className="zline" viewBox={`0 0 ${n} ${n}`}>
        <polyline points={pts} fill="none" stroke="#762CEB" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {nums.map((row, r) => row.map((v, c) => (
        <div key={`${r}-${c}`} data-t={`c-${r}-${c}`} style={{ "--o": order.get(`${r}-${c}`) ?? 0 } as React.CSSProperties}
          className={cls("zcell", !win && head && head[0] === r && head[1] === c && "head", bad && bad[0] === r && bad[1] === c && "tut-no",
            has(left, r, c) && "tut-left", has(hl, r, c) && "tut-hl", win && v === Math.max(...nums.flat()) && "end")}>
          {v > 0 && <span className={cls("zdot", reached.has(`${r}-${c}`) && "done")}>{v}</span>}
        </div>
      )))}
    </div>
  );
}

// ---------------- Mini Patches ----------------
export interface PatchesP {
  n: number;
  clues: [number, number, number, Kind][];
  colors: string[];
  /** Peças: retângulo + índice do número (cor) ou -1; bad = com erro. */
  pieces: { q: Rect; k: number; bad?: boolean }[];
  preview?: { q: Rect; ok: boolean };
  ghost?: Rect;
  anchor?: RC;
  hl?: RC[];
  okClues?: number[];
  tipClue?: number;
  win?: boolean;
}
export function MiniPatches({ n, clues, colors, pieces, preview, ghost, anchor, hl, okClues = [], tipClue, win }: PatchesP) {
  const span = (q: Rect): React.CSSProperties => ({ gridRow: `${q.r + 1} / span ${q.h}`, gridColumn: `${q.c + 1} / span ${q.w}` });
  return (
    <div className={cls("ptboard", `n${n}`, win && "win", "tut-board")}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`, "--n": n, "--pstep": "160ms" } as React.CSSProperties}>
      {Array.from({ length: n * n }, (_, i) => {
        const r = Math.floor(i / n), c = i % n;
        return <div key={i} data-t={`c-${r}-${c}`} style={{ gridRow: r + 1, gridColumn: c + 1 }}
          className={cls("ptcell", c === n - 1 && "edge-c", r === n - 1 && "edge-r", anchor && anchor[0] === r && anchor[1] === c && "anchor", has(hl, r, c) && "tip")} />;
      })}
      {pieces.map(({ q, k, bad }, i) => (
        <span key={i} className={cls("ptpiece", bad && "bad")} style={{ ...span(q), "--pc": k >= 0 ? colors[k] : "#C9B8EC", "--i": i } as React.CSSProperties} />
      ))}
      {ghost && <span className="ptghost" style={span(ghost)} />}
      {preview && <span className={cls("ptprev", preview.ok && "ok")} style={span(preview.q)}><b>{preview.q.h}×{preview.q.w} = {area(preview.q)}</b></span>}
      {clues.map(([r, c, v, kind], i) => (
        <span key={i} className={cls("ptclue", okClues.includes(i) && "ok", tipClue === i && "tip")} style={{ gridRow: r + 1, gridColumn: c + 1, "--i": i } as React.CSSProperties}>
          <PatchesTag v={v} kind={kind} color={colors[i]} />
        </span>
      ))}
    </div>
  );
}
