"use client";
import Gem from "./Gem";
import { useMemo, useRef, useState } from "react";
import type { Puzzle } from "../lib/puzzles";
import { puzzleGrid } from "../lib/puzzles";
import {
  BOX, DIGITS, SIZE, type ConflictKind, type Grid,
  cloneGrid, conflictsAt, filledCount, findHintCell, isFull, isSolved, setCell,
} from "../lib/sudoku";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };
const WHERE: Record<ConflictKind, string> = { linha: "nesta linha", coluna: "nesta coluna", subgrade: "neste bloco 2×2" };
type Cell = { r: number; c: number };
type Move = { r: number; c: number; prev: number };

interface Props {
  puzzle: Puzzle;
  initialGrid: Grid;
  onSave: (grid: Grid | null) => void;
  onMenu: () => void;
  onNext: () => void;
  onRules: () => void;
}

export default function Game({ puzzle, initialGrid, onSave, onMenu, onNext, onRules }: Props) {
  const givens = useMemo(() => puzzleGrid(puzzle), [puzzle]);
  const [grid, setGrid] = useState<Grid>(() => cloneGrid(initialGrid));
  const [history, setHistory] = useState<Move[]>([]);
  const [sel, setSel] = useState<Cell | null>(null);
  const [tip, setTip] = useState<Cell | null>(null);
  const [paused, setPaused] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [confirm, setConfirm] = useState<null | "restart" | "end">(null);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Vamos descobrir o próximo passo? Toque numa casa vazia." });
  const boardRef = useRef<HTMLDivElement>(null);

  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  const isGiven = (r: number, c: number) => givens[r][c] !== 0;

  function commit(next: Grid, r: number, c: number, prev: number) {
    setHistory((h) => [...h, { r, c, prev }]);
    setGrid(next);
    setTip(null);
    setMoves((m) => m + 1);
    if (isSolved(next)) { setWon(true); onSave(null); return; }
    onSave(next);
    const kinds = conflictsAt(next, r, c);
    if (next[r][c] === 0) say("info", "Casa limpa. Observe as pistas e tente outra opção.");
    else if (kinds.length) say("warn", `Esse número já aparece ${WHERE[kinds[0]]}. Quer tentar outra opção?`);
    else if (isFull(next)) say("warn", "A grade está cheia, mas ainda há números repetidos. Observe as casas marcadas com “!”.");
    else say("ok", "Boa! Esse número cabe aqui por enquanto.");
  }

  function enter(v: number) {
    if (paused || won) return;
    if (!sel) return say("info", "Escolha uma casa primeiro. Toque numa casa vazia da grade.");
    const { r, c } = sel;
    if (isGiven(r, c)) return say("info", "Essa é uma pista fixa e não pode ser alterada. Experimente uma casa vazia.");
    if (grid[r][c] === v) return;
    commit(setCell(grid, r, c, v), r, c, grid[r][c]);
  }

  function undo() {
    if (!history.length || paused || won) return say("info", "Ainda não há nada para desfazer.");
    const last = history[history.length - 1];
    const next = setCell(grid, last.r, last.c, last.prev);
    setHistory(history.slice(0, -1));
    setGrid(next); setTip(null); setSel({ r: last.r, c: last.c }); onSave(next);
    say("info", "Última jogada desfeita.");
  }

  function restart() {
    const fresh = cloneGrid(givens);
    setGrid(fresh); setHistory([]); setSel(null); setTip(null); setMoves(0); setConfirm(null); setPaused(false);
    onSave(fresh);
    say("info", "Puzzle restaurado ao início. Vamos de novo?");
  }

  function hint() {
    if (paused || won) return;
    const h = findHintCell(grid);
    if (!h) return;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++)
      if (conflictsAt(grid, r, c).length) { setTip(null); return say("hint", "Há números repetidos marcados com “!”. Que tal resolver isso primeiro?"); }
    setTip({ r: h.r, c: h.c }); setSel({ r: h.r, c: h.c });
    say("hint", h.options === 0
      ? `Linha ${h.r + 1}, coluna ${h.c + 1}: nenhum número cabe aqui. Revise as casas ao redor.`
      : h.options === 1
        ? `Observe a linha ${h.r + 1}, coluna ${h.c + 1}: só um número cabe aí. Qual será?`
        : `Comece pela linha ${h.r + 1}, coluna ${h.c + 1}: ela tem poucas opções. Veja o que já aparece na linha, coluna e bloco.`);
  }

  function onKey(e: React.KeyboardEvent) {
    const move: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (move[e.key]) {
      e.preventDefault();
      const [dr, dc] = move[e.key];
      const from = sel ?? { r: 0, c: 0 };
      const next = { r: Math.min(SIZE - 1, Math.max(0, from.r + dr)), c: Math.min(SIZE - 1, Math.max(0, from.c + dc)) };
      setSel(next);
      boardRef.current?.querySelector<HTMLButtonElement>(`[data-rc="${next.r}-${next.c}"]`)?.focus();
    } else if (/^[1-4]$/.test(e.key)) enter(Number(e.key));
    else if (["Backspace", "Delete", "0"].includes(e.key)) enter(0);
  }

  const total = SIZE * SIZE;
  const filled = filledCount(grid);
  const related = (r: number, c: number) =>
    !!sel && (sel.r === r || sel.c === c || (Math.floor(sel.r / BOX) === Math.floor(r / BOX) && Math.floor(sel.c / BOX) === Math.floor(c / BOX)));

  return (
    <div className="wrap">
      <div className="title"><Gem kind="sudoku" size={48} /><div>
        <h1>{puzzle.name}</h1>
        <p className="muted">Mini Sudoku · {puzzle.level}</p>
      </div></div>

      <div>
        <div className="progress" role="progressbar" aria-label="Casas preenchidas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={filled}>
          <i style={{ width: `${(filled / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{filled} de {total} casas preenchidas</p>
      </div>

      {won ? (
        <section className="celebrate" aria-labelledby="win">
          <h2 id="win">Você completou a grade! ✓</h2>
          <p>Cada número está no lugar certo, sem repetir em linha, coluna ou bloco. Resumo: {moves} jogadas neste puzzle.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn cta" onClick={onNext}>Jogar novamente</button>
            <button className="btn sec" onClick={onMenu}>Voltar ao menu</button>
          </div>
        </section>
      ) : paused ? (
        <div className="paused">
          <h2>Jogo pausado</h2>
          <p className="muted">A grade fica escondida até você voltar.</p>
          <button className="btn" onClick={() => setPaused(false)}>Retomar</button>
        </div>
      ) : (
        <>
          <div ref={boardRef} className="board" role="grid" aria-label="Grade do Mini Sudoku 4 por 4" onKeyDown={onKey}>
            {grid.map((row, r) => row.map((v, c) => {
              const bad = conflictsAt(grid, r, c).length > 0;
              const g = isGiven(r, c);
              const isSel = sel?.r === r && sel?.c === c;
              const cls = ["cell", g && "given", related(r, c) && "rel", isSel && "sel", bad && "bad",
                tip?.r === r && tip?.c === c && "tip", c === 1 && "bx-r", r === 1 && "bx-b"].filter(Boolean).join(" ");
              const label = `Linha ${r + 1}, coluna ${c + 1}, ${g ? `pista ${v}` : v ? `número ${v}` : "vazia"}${bad ? ", conflito" : ""}${isSel ? ", selecionada" : ""}`;
              return (
                <button key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" className={cls} aria-label={label}
                  aria-pressed={isSel} tabIndex={isSel || (!sel && r === 0 && c === 0) ? 0 : -1}
                  onClick={() => { setSel({ r, c }); if (g) say("info", "Essa é uma pista fixa. Use as pistas para descobrir as casas vazias."); }}>
                  {v || ""}
                </button>
              );
            }))}
          </div>

          <div className="pad" role="group" aria-label="Escolher número">
            {DIGITS.map((d) => <button key={d} className="btn" onClick={() => enter(d)} aria-label={`Número ${d}`}>{d}</button>)}
            <button className="btn sec erase" onClick={() => enter(0)} aria-label="Apagar número">Apagar</button>
          </div>
        </>
      )}

      <div className={`note ${msg.tone}`} role="status" aria-live="polite">
        <b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span>
      </div>

      {confirm && (
        <div className="note warn" role="alertdialog" aria-label="Confirmação">
          <div style={{ display: "grid", gap: 8 }}>
            <span>{confirm === "restart" ? "Reiniciar volta o puzzle ao começo e apaga suas jogadas. Continuar?" : "Encerrar descarta o progresso desta partida. Continuar?"}</span>
            <div className="row">
              <button className="btn" onClick={() => { if (confirm === "restart") restart(); else { onSave(null); onMenu(); } }}>Sim, continuar</button>
              <button className="btn sec" onClick={() => setConfirm(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {!won && (
        <div className="row">
          <button className="btn sec" onClick={undo} disabled={!history.length || paused}>Desfazer</button>
          <button className="btn sec" onClick={hint} disabled={paused}>Dica</button>
          <button className="btn sec" onClick={() => setPaused((p) => !p)}>{paused ? "Retomar" : "Pausar"}</button>
          <button className="btn sec" onClick={() => setConfirm("restart")}>Reiniciar</button>
          <button className="btn sec" onClick={onRules}>Regras</button>
          <button className="btn sec" onClick={onMenu}>Menu (guardar)</button>
          <button className="btn sec" onClick={() => setConfirm("end")}>Encerrar</button>
        </div>
      )}
    </div>
  );
}
