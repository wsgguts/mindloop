"use client";
import GameHeader from "./GameHeader";
import ZoomBoard from "./ZoomBoard";
import GameToolbar from "./GameToolbar";
import { useHintNudge, useLevelPlay } from "./useLevelPlay";
import { useSfx } from "./useSound";
import { useRevealedErrors } from "./useRevealedErrors";
import { sudokuUnitsDone } from "../lib/sound/progress";
import { useMemo, useRef, useState } from "react";
import type { Puzzle } from "../lib/puzzles";
import { puzzleGrid } from "../lib/puzzles";
import {
  boxDims, digitsFor, type ConflictKind, type Grid,
  cloneGrid, conflictsAt, filledCount, findHintCell, isFull, isSolved, setCell, usedUpDigits,
} from "../lib/sudoku";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };
const WHERE: Record<ConflictKind, string> = { linha: "nesta linha", coluna: "nesta coluna", subgrade: "neste bloco" };
type Cell = { r: number; c: number };
type Move = { r: number; c: number; prev: number };

interface Props {
  puzzle: Puzzle;
  initialGrid: Grid;
  /** Tempo já jogado, quando a partida foi guardada e retomada. */
  initialMs?: number;
  /** A partida está na tela, sem nada por cima (o cronômetro só conta assim). */
  active: boolean;
  onSave: (grid: Grid | null, ms?: number) => void;
  onMenu: () => void;
  onRules: () => void; onFeedback: () => void;
  onWin: (ms: number) => void;
  onCelebrated: () => void;
  /** Avisado a cada dica pedida (estatísticas e conquistas). */
  onHint?: () => void;
}

// Duração da animação de conclusão: linhas → colunas → blocos → brilho geral.
const FX_MS = 3100;

export default function Game({ puzzle, initialGrid, initialMs = 0, active, onSave, onMenu, onRules, onFeedback, onWin, onCelebrated, onHint }: Props) {
  const givens = useMemo(() => puzzleGrid(puzzle), [puzzle]);
  const N = givens.length;
  const [bh, bw] = boxDims(N);
  const digits = digitsFor(N);
  const [grid, setGrid] = useState<Grid>(() => cloneGrid(initialGrid));
  const [history, setHistory] = useState<Move[]>([]);
  const [sel, setSel] = useState<Cell | null>(null);
  const [tip, setTip] = useState<Cell | null>(null);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<null | "restart" | "end">(null);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Toque numa casa vazia e escolha um número." });
  const boardRef = useRef<HTMLDivElement>(null);
  const nudge = useHintNudge(initialMs); // convite à dica: erros repetidos ou tempo demais
  const sfx = useSfx("sudoku", nudge.miss);
  const play = useLevelPlay({ active: active && !paused, onWin, onCelebrated, fxMs: FX_MS, initialMs, onWinFx: () => sfx("win") });
  const won = play.won;

  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  // Conflitos (número repetido) só aparecem depois que a pessoa para de jogar por um instante (useRevealedErrors).
  const conflictKeys = useMemo(() => {
    const out: string[] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (conflictsAt(grid, r, c).length) out.push(`${r}-${c}:${grid[r][c]}`); // o valor faz parte da chave: trocar o número reinicia a espera
    return out;
  }, [grid, N]);
  const errs = useRevealedErrors(conflictKeys, grid, (fresh) => {
    if (won) return;
    sfx("error");
    const [r, c] = fresh[0].split(":")[0].split("-").map(Number);
    const kinds = conflictsAt(grid, r, c);
    say("warn", isFull(grid) ? "A grade está cheia, mas há números repetidos (marcados com “!”)." : `Número repetido ${WHERE[kinds[0]] ?? "na grade"} (marcado com “!”).`);
  });
  const isGiven = (r: number, c: number) => givens[r][c] !== 0;

  function commit(next: Grid, r: number, c: number, prev: number) {
    setHistory((h) => [...h, { r, c, prev }]);
    setGrid(next);
    setTip(null);
    if (isSolved(next)) { onSave(null); play.win(); say("ok", "Grade completa! Todas as linhas, colunas e blocos fecharam."); return; }
    onSave(next, play.read());
    const kinds = conflictsAt(next, r, c);
    // Um som por jogada (limpar, região fechada ou número colocado). Erros não soam aqui: só quando revelados.
    const units = next[r][c] && !kinds.length ? sudokuUnitsDone(next, r, c) : 0;
    sfx(next[r][c] === 0 ? "erase" : units ? "complete" : "place", { v: next[r][c], count: units });
    say("info", next[r][c] === 0 ? "Casa limpa." : `${filledCount(next)} de ${N * N} casas preenchidas.`);
  }

  function enter(v: number) {
    if (paused || won) return;
    if (!sel) { sfx("block"); return say("info", "Escolha uma casa primeiro. Toque numa casa vazia da grade."); }
    const { r, c } = sel;
    if (isGiven(r, c)) { sfx("block"); return say("info", "Essa é uma pista fixa e não pode ser alterada. Experimente uma casa vazia."); }
    if (grid[r][c] === v) return;
    if (v && usedUp.has(v)) { sfx("block"); return say("info", `O ${v} já aparece ${N} vezes na grade (uma por linha). Para usá-lo aqui, apague um deles primeiro.`); }
    commit(setCell(grid, r, c, v), r, c, grid[r][c]);
  }

  function undo() {
    if (!history.length || paused || won) { sfx("block"); return say("info", "Ainda não há nada para desfazer."); }
    const last = history[history.length - 1];
    sfx("undo");
    const next = setCell(grid, last.r, last.c, last.prev);
    setHistory(history.slice(0, -1));
    setGrid(next); setTip(null); setSel({ r: last.r, c: last.c }); onSave(next, play.read());
    say("info", "Última jogada desfeita.");
  }

  function restart() {
    const fresh = cloneGrid(givens);
    sfx("undo");
    setGrid(fresh); setHistory([]); setSel(null); setTip(null); setConfirm(null); setPaused(false);
    onSave(fresh, play.read());
    say("info", "Puzzle restaurado ao início. Vamos de novo?");
  }

  function hint() {
    if (paused || won) return;
    const h = findHintCell(grid);
    if (!h) return;
    sfx("hint");
    nudge.used(play.read());
    onHint?.();
    if (conflictKeys.length) { errs.revealNow(); setTip(null); return say("hint", "Há números repetidos, marcados com “!”. Resolva isso primeiro."); }
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
      const next = { r: Math.min(N - 1, Math.max(0, from.r + dr)), c: Math.min(N - 1, Math.max(0, from.c + dc)) };
      sfx(next.r === from.r && next.c === from.c && sel ? "block" : "select");
      setSel(next);
      boardRef.current?.querySelector<HTMLButtonElement>(`[data-rc="${next.r}-${next.c}"]`)?.focus();
    } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= N) enter(Number(e.key));
    else if (["Backspace", "Delete", "0"].includes(e.key)) enter(0);
  }

  const total = N * N;
  // Números que já aparecem N vezes não cabem em mais nenhuma casa: ficam inativos no teclado (voltam ao apagar um).
  const usedUp = useMemo(() => usedUpDigits(grid), [grid]);
  const filled = filledCount(grid);
  const related = (r: number, c: number) =>
    !!sel && (sel.r === r || sel.c === c || (Math.floor(sel.r / bh) === Math.floor(r / bh) && Math.floor(sel.c / bw) === Math.floor(c / bw)));

  return (
    <div className="wrap play">
      <GameHeader kind="sudoku" title={puzzle.name} subtitle={`Mini Sudoku · ${puzzle.level}`} ms={play.ms} done={won} onHelp={onRules} onBack={onMenu}>
        <div className="progress" role="progressbar" aria-label="Casas preenchidas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={filled}>
          <i style={{ width: `${(filled / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{filled} de {total} casas preenchidas</p>
      </GameHeader>

      {paused ? (
        <div className="paused">
          <h2>Jogo pausado</h2>
          <p className="muted">A grade fica escondida até você voltar.</p>
          <button className="btn" onClick={() => { sfx("ui"); setPaused(false); }}>Retomar</button>
        </div>
      ) : (
        <>
          <ZoomBoard locked={won} label="tabuleiro do Mini Sudoku">
          <div ref={boardRef} className={`board n${N}${won ? " win" : ""}`} style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }} role="grid"
            aria-label={`Grade do Mini Sudoku ${N} por ${N}${won ? ", resolvida" : ""}`} onKeyDown={onKey}>
            {grid.map((row, r) => row.map((v, c) => {
              const bad = errs.visible.has(`${r}-${c}:${v}`);
              const g = isGiven(r, c);
              const isSel = !won && sel?.r === r && sel?.c === c;
              const cls = ["cell", g && "given", related(r, c) && "rel", isSel && "sel", bad && "bad",
                tip?.r === r && tip?.c === c && "tip", (c + 1) % bw === 0 && c < N - 1 && "bx-r", (r + 1) % bh === 0 && r < N - 1 && "bx-b"].filter(Boolean).join(" ");
              const label = `Linha ${r + 1}, coluna ${c + 1}, ${g ? `pista ${v}` : v ? `número ${v}` : "vazia"}${bad ? ", conflito" : ""}${isSel ? ", selecionada" : ""}`;
              return (
                <button key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" className={cls} aria-label={label}
                  style={{ "--r": r, "--c": c, "--b": Math.floor(r / bh) * (N / bw) + Math.floor(c / bw) } as React.CSSProperties}
                  aria-pressed={isSel} tabIndex={isSel || (!sel && r === 0 && c === 0) ? 0 : -1}
                  onClick={() => { if (!won) sfx("select"); setSel({ r, c }); if (g) say("info", "Essa é uma pista fixa. Use as pistas para descobrir as casas vazias."); }}>
                  {v || ""}
                </button>
              );
            }))}
          </div>
          </ZoomBoard>
        </>
      )}

      <div className="gctrl">
      {!paused && (
          <div className={`pad n${N}${won ? " off" : ""}`} style={{ gridTemplateColumns: `repeat(${N + 1}, 1fr)` }} role="group" aria-label="Escolher número">
            {digits.map((d) => <button key={d} className={`btn${usedUp.has(d) ? " used" : ""}`} onClick={() => enter(d)} disabled={won || usedUp.has(d)}
              aria-label={`Número ${d}${usedUp.has(d) ? " — todos já estão na grade" : ""}`}>{d}</button>)}
            <button className="btn sec erase" onClick={() => enter(0)} disabled={won} aria-label="Apagar número">{N > 4 ? "⌫" : "Apagar"}</button>
          </div>
      )}

      <div className={`note ${msg.tone}`} role="status" aria-live="polite">
        <b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span>
      </div>

      {confirm && (
        <div className="note warn gconfirm" role="alertdialog" aria-label="Confirmação">
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
        <GameToolbar
          main={[
          { label: "Desfazer", icon: "undo", onClick: undo, disabled: !history.length || paused },
          { label: "Dica", icon: "hint", onClick: hint, disabled: paused, nudge: !won && nudge.show(play.ms) ? "Precisa de ajuda?" : undefined },
          { label: paused ? "Retomar" : "Pausar", icon: paused ? "play" : "pause", onClick: () => { sfx("ui"); setPaused((p) => !p); } },
          { label: "Reiniciar", icon: "restart", onClick: () => { sfx("ui"); setConfirm("restart"); } },
          ]}
          more={[
          { label: "Como jogar", icon: "help", onClick: onRules },
          { label: "Níveis (guardar)", icon: "levels", onClick: onMenu },
          { label: "Dar opinião", icon: "feedback", onClick: onFeedback },
          { label: "Encerrar", icon: "end", onClick: () => setConfirm("end") },
          ]}
          game="sudoku"
        />
      )}
      </div>
    </div>
  );
}
