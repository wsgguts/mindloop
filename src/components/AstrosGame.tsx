"use client";
import { useMemo, useRef, useState } from "react";
import GameHeader from "./GameHeader";
import ZoomBoard from "./ZoomBoard";
import GameToolbar from "./GameToolbar";
import AstroSymbol, { MarkSymbol } from "./AstroSymbol";
import { useHintNudge, useLevelPlay } from "./useLevelPlay";
import { useSfx } from "./useSound";
import { useRevealedErrors } from "./useRevealedErrors";
import {
  EMPTY, MARK, STAR, SKY_COLORS, SKY_NAMES, type AGrid, type AstrosPuzzle, type Cell, type Problem, type Step,
  cloneA, emptyGrid, findProblems, isAstrosSolved, nextHint, parseAstros, solutionGrid, starsOf,
} from "../lib/astros";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };
type Move = { r: number; c: number; prev: number };

interface Props { puzzle: AstrosPuzzle; active: boolean; onMenu: () => void; onRules: () => void; onFeedback: () => void; onWin: (ms: number) => void; onCelebrated: () => void; onHint?: () => void }

// Animação de conclusão: os astros acendem em onda e cada constelação ganha brilho.
const FX_MS = 2800;

const at = ([r, c]: Cell) => `linha ${r + 1}, coluna ${c + 1}`;
const sky = (i: number) => `constelação ${SKY_NAMES[i % SKY_NAMES.length]}`;
const unitName = (u: Step["unit"]) => (!u ? "" : u.kind === "constelacao" ? sky(u.i) : `${u.kind} ${u.i + 1}`);
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}` : xs[0] ?? "");

/** Explica o erro em linguagem simples. */
function problemText(p: Problem): string {
  switch (p.kind) {
    case "linha": return `A linha ${p.i! + 1} tem mais de um astro. Cada linha recebe exatamente um.`;
    case "coluna": return `A coluna ${p.i! + 1} tem mais de um astro. Cada coluna recebe exatamente um.`;
    case "constelacao": return `A ${sky(p.i!)} tem mais de um astro. Cada constelação recebe exatamente um.`;
    case "vizinhos": return "Dois astros estão se encostando. Eles não podem ficar lado a lado, nem na diagonal.";
  }
}

/** Explica o porquê de cada passo lógico (é isso que ensina a jogar). */
function hintText(s: Step): string {
  const cells = s.cells.length === 1 ? `a casa marcada (${at(s.cells[0])})` : `as ${s.cells.length} casas marcadas`;
  switch (s.reason) {
    case "unica-constelacao":
    case "unica-linha":
    case "unica-coluna":
      return `Na ${unitName(s.unit)} sobrou um único lugar possível: as outras casas estão na linha, na coluna ou encostadas num astro que já existe. O astro vai na casa marcada.`;
    case "faixa-linha":
    case "faixa-coluna": {
      const axis = s.reason === "faixa-linha" ? "linha" : "coluna";
      return `Todas as casas livres da ${unitName(s.unit)} ficam na ${axis} ${s.lines![0] + 1}. Então o astro dessa ${axis} será o da constelação — ${cells} podem receber um ×.`;
    }
    case "presa-linha":
    case "presa-coluna":
      return `As casas livres da ${unitName(s.unit)} ficam todas na ${sky(s.regions![0])}. O astro dessa constelação vai estar ali, então ${cells}, fora da ${s.unit!.kind}, podem receber um ×.`;
    case "bloqueio":
      return `Teste a casa marcada: um astro ali apagaria todas as casas livres da ${unitName(s.unit)} (mesma linha, coluna ou vizinhas). Então ela não pode ter astro — marque um ×.`;
    case "faixas-linhas":
    case "faixas-colunas": {
      const axis = s.reason === "faixas-linhas" ? "linhas" : "colunas";
      return `As constelações ${list(s.regions!.map((i) => SKY_NAMES[i % SKY_NAMES.length]))} só cabem nas ${axis} ${list(s.lines!.map((l) => String(l + 1)))}. Essas ${axis} ficam com os astros delas, então ${cells} podem receber um ×.`;
    }
  }
}

export default function AstrosGame({ puzzle, active, onMenu, onRules, onFeedback, onWin, onCelebrated, onHint }: Props) {
  const board = useMemo(() => parseAstros(puzzle.raw), [puzzle]);
  const { n, regions } = board;
  const solution = useMemo(() => solutionGrid(board), [board]);
  const [grid, setGrid] = useState<AGrid>(() => emptyGrid(n));
  const [history, setHistory] = useState<Move[][]>([]);
  const [sel, setSel] = useState<Cell | null>(null);
  const [tip, setTip] = useState<{ cells: Cell[]; from: Cell[] } | null>(null);
  const nudge = useHintNudge();
  const sfx = useSfx("astros", nudge.miss);
  const play = useLevelPlay({ active, onWin, onCelebrated, fxMs: FX_MS, onWinFx: () => sfx("win", { count: n }) });
  const won = play.won;
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Toque numa casa para marcar um ×; toque de novo para colocar um astro." });
  const boardRef = useRef<HTMLDivElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });

  const problems = useMemo(() => findProblems(grid, board), [grid, board]);
  const problemKeys = useMemo(() => [...new Set(problems.flatMap((p) => p.cells.map(([r, c]) => `${r}-${c}`)))], [problems]);
  const errs = useRevealedErrors(problemKeys, grid, (fresh) => {
    if (won) return;
    sfx("error");
    const p = problems.find((x) => x.cells.some(([r, c]) => fresh.includes(`${r}-${c}`))) ?? problems[0];
    say("warn", `${problemText(p)} Toque no astro para tirá-lo.`);
  });

  // Bordas grossas entre constelações diferentes.
  // (só por dentro: a moldura do céu já desenha a borda de fora)
  const edges = useMemo(() => regions.map((row, r) => row.map((k, c) => [
    r > 0 && regions[r - 1][c] !== k, c < n - 1 && regions[r][c + 1] !== k,
    r < n - 1 && regions[r + 1][c] !== k, c > 0 && regions[r][c - 1] !== k,
  ])), [regions, n]);

  function commit(changes: Move[], next: AGrid, focus: Cell) {
    setHistory((h) => [...h, changes]);
    setGrid(next); setTip(null);
    if (isAstrosSolved(next, board)) { setSel(null); play.win(); say("ok", "Céu completo! Um astro em cada linha, coluna e constelação."); return; }
    const [r, c] = focus;
    const v = next[r][c];
    const stars = starsOf(next).length;
    if (v === STAR) {
      const k = regions[r][c];
      const okSoFar = !findProblems(next, board).length;
      sfx("place", { v: 2, count: stars });
      say("info", `${stars} de ${n} astros no céu.${okSoFar ? ` A ${sky(k)} já tem o seu.` : ""}`);
    } else if (v === MARK) { sfx("select"); say("info", "Casa marcada com ×: aqui não vai astro. Toque de novo para colocar um astro."); }
    else { sfx("erase"); say("info", "Casa limpa."); }
  }

  function setCell(r: number, c: number, v: number) {
    if (won || grid[r][c] === v) return;
    const next = cloneA(grid);
    next[r][c] = v;
    commit([{ r, c, prev: grid[r][c] }], next, [r, c]);
  }

  function tap(r: number, c: number) {
    if (won) return;
    setSel([r, c]);
    const v = grid[r][c];
    setCell(r, c, v === EMPTY ? MARK : v === MARK ? STAR : EMPTY); // vazia → × → astro → vazia
  }

  function enter(v: number) {
    if (won) return;
    if (!sel) { sfx("block"); return say("info", "Escolha uma casa primeiro: toque numa casa da grade."); }
    setCell(sel[0], sel[1], v);
  }

  /** Marca × em todas as casas que os astros já colocados apagam (mesma linha, coluna, constelação e vizinhas). */
  function markAround() {
    if (won) return;
    const stars = starsOf(grid);
    if (!stars.length) { sfx("block"); return say("info", "Coloque um astro primeiro: este botão marca × em volta dos astros."); }
    const next = cloneA(grid);
    const changes: Move[] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (next[r][c] !== EMPTY) continue;
      if (stars.some(([y, x]) => y === r || x === c || regions[y][x] === regions[r][c] || (Math.abs(y - r) <= 1 && Math.abs(x - c) <= 1))) {
        changes.push({ r, c, prev: EMPTY }); next[r][c] = MARK;
      }
    }
    if (!changes.length) { sfx("block"); return say("info", "As casas em volta dos astros já estão marcadas."); }
    sfx("complete", { count: changes.length });
    setHistory((h) => [...h, changes]); setGrid(next); setTip(null);
    say("info", `${changes.length} casas marcadas com ×: nenhuma delas pode ter astro.`);
  }

  function undo() {
    if (!history.length || won) { sfx("block"); return say("info", "Ainda não há nada para desfazer."); }
    const last = history[history.length - 1];
    sfx("undo");
    const next = cloneA(grid);
    for (const m of last) next[m.r][m.c] = m.prev;
    setHistory(history.slice(0, -1)); setGrid(next); setTip(null); setSel([last[0].r, last[0].c]);
    say("info", "Última jogada desfeita.");
  }

  function restart() {
    sfx("undo");
    setGrid(emptyGrid(n)); setHistory([]); setSel(null); setTip(null); setConfirm(false);
    say("info", "Céu limpo. Vamos de novo?");
  }

  function hint() {
    if (won) return;
    sfx("hint");
    nudge.used(play.read());
    onHint?.();
    errs.revealNow();
    if (problems.length) {
      const p = problems[0];
      setTip({ cells: [p.cells[0]], from: p.cells.slice(1) });
      return say("hint", `Primeiro, corrija as casas marcadas com “!”. ${problemText(p)}`);
    }
    if (solution) {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (grid[r][c] === STAR && solution[r][c] !== STAR) {
          setTip({ cells: [[r, c]], from: [] }); setSel([r, c]);
          return say("hint", `O astro da ${at([r, c])} não combina com o resto do céu, mesmo sem quebrar regra ainda. Que tal tirá-lo?`);
        }
        if (grid[r][c] === MARK && solution[r][c] === STAR) {
          setTip({ cells: [[r, c]], from: [] }); setSel([r, c]);
          return say("hint", `A casa da ${at([r, c])} foi marcada com ×, mas é justamente ali que vai um astro. Toque nela para trocar.`);
        }
      }
    }
    const s = nextHint(board, grid);
    if (s) {
      setTip({ cells: s.cells, from: [] }); setSel(s.cells[0]);
      return say("hint", hintText(s));
    }
    // Sem raciocínio novo a mostrar (todas as eliminações já marcadas): revela um astro da solução.
    if (solution) {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (solution[r][c] === STAR && grid[r][c] !== STAR) {
        setTip({ cells: [[r, c]], from: [] }); setSel([r, c]);
        return say("hint", `Um astro vai na ${at([r, c])}.`);
      }
    }
    say("hint", "Observe as constelações pequenas e as que cabem numa só linha ou coluna.");
  }

  function onKey(e: React.KeyboardEvent) {
    const move: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const from = sel ?? [0, 0];
    if (move[e.key]) {
      e.preventDefault();
      const [dr, dc] = move[e.key];
      const next: Cell = [Math.min(n - 1, Math.max(0, from[0] + dr)), Math.min(n - 1, Math.max(0, from[1] + dc))];
      sfx(sel && next[0] === from[0] && next[1] === from[1] ? "block" : "select");
      setSel(next);
      boardRef.current?.querySelector<HTMLButtonElement>(`[data-rc="${next[0]}-${next[1]}"]`)?.focus();
    } else if (e.key === "1" || e.key.toLowerCase() === "a") enter(STAR);
    else if (e.key === "2" || e.key.toLowerCase() === "x") enter(MARK);
    else if (["Backspace", "Delete", "0"].includes(e.key)) enter(EMPTY);
  }

  const stars = starsOf(grid).length;
  const bad = errs.visible;
  const isTip = (r: number, c: number) => !!tip?.cells.some(([y, x]) => y === r && x === c);
  const isSrc = (r: number, c: number) => !!tip?.from.some(([y, x]) => y === r && x === c);

  return (
    <div className="wrap play">
      <GameHeader kind="astros" title={puzzle.name} subtitle={`Astros · ${puzzle.level}`} ms={play.ms} done={won} onHelp={onRules} onBack={onMenu}>
        <div className="progress" role="progressbar" aria-label="Astros colocados" aria-valuemin={0} aria-valuemax={n} aria-valuenow={stars}>
          <i style={{ width: `${(Math.min(stars, n) / n) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{stars}/{n} astros</p>
      </GameHeader>

      <ZoomBoard locked={won} maxWidth={n >= 8 ? 400 : 360} label="céu do Astros">
        <div ref={boardRef} className={`aboard n${n}${won ? " win" : ""}`} role="grid"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)` } as React.CSSProperties}
          aria-label={won ? `Céu do Astros ${n} por ${n}, resolvido.` : `Céu do Astros ${n} por ${n}, com ${n} constelações. Toque numa casa para alternar entre vazia, marcada com × e astro.`} onKeyDown={onKey}>
          {grid.map((row, r) => row.map((v, c) => {
            const k = regions[r][c];
            const isSel = sel?.[0] === r && sel?.[1] === c;
            const isBad = bad.has(`${r}-${c}`);
            const [t, ri, b, l] = edges[r][c];
            const cls = ["acell", t && "et", ri && "er", b && "eb", l && "el", isSel && "sel", isBad && "bad", isTip(r, c) && "tip", isSrc(r, c) && "src", v === STAR && "star"].filter(Boolean).join(" ");
            const label = `Linha ${r + 1}, coluna ${c + 1}, ${sky(k)}, ${v === STAR ? "astro" : v === MARK ? "marcada com ×" : "vazia"}${isBad ? ", com erro" : ""}`;
            return (
              <button key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" className={cls} aria-label={label}
                style={{ "--sky": SKY_COLORS[k % SKY_COLORS.length], "--r": r, "--c": c } as React.CSSProperties}
                aria-pressed={isSel} tabIndex={isSel || (!sel && r === 0 && c === 0) ? 0 : -1} onClick={() => tap(r, c)}>
                {v === STAR ? <AstroSymbol size="70%" /> : v === MARK ? <MarkSymbol size="34%" /> : null}
              </button>
            );
          }))}
        </div>
      </ZoomBoard>

      <div className="gctrl">
        <div className={`tpad${won ? " off" : ""}`} role="group" aria-label="Escolher o que colocar na casa selecionada">
          <button className="btn sec" onClick={() => enter(STAR)} disabled={won}><AstroSymbol size={24} />Astro</button>
          <button className="btn sec" onClick={() => enter(MARK)} disabled={won}><MarkSymbol size={16} />Marcar</button>
          <button className="btn sec" onClick={() => enter(EMPTY)} disabled={won}>Apagar</button>
        </div>
        <button className="btn sec sm amark-all" onClick={markAround} disabled={won}>Marcar × em volta dos astros</button>

        <div className={`note ${msg.tone}`} role="status" aria-live="polite"><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></div>

        {confirm && (
          <div className="note warn gconfirm" role="alertdialog" aria-label="Confirmação">
            <div style={{ display: "grid", gap: 8 }}>
              <span>Reiniciar apaga os astros e as marcas que você colocou. Continuar?</span>
              <div className="row"><button className="btn" onClick={restart}>Sim, reiniciar</button><button className="btn sec" onClick={() => setConfirm(false)}>Cancelar</button></div>
            </div>
          </div>
        )}

        {!won && (
          <GameToolbar
            main={[
              { label: "Desfazer", icon: "undo", onClick: undo, disabled: !history.length },
              { label: "Dica", icon: "hint", onClick: hint, nudge: !won && nudge.show(play.ms) ? "Precisa de ajuda?" : undefined },
              { label: "Reiniciar", icon: "restart", onClick: () => { if (history.length) { sfx("ui"); setConfirm(true); } else restart(); } },
              { label: "Ajuda", ariaLabel: "Como jogar", icon: "help", onClick: onRules },
            ]}
            more={[
              { label: "Níveis", icon: "levels", onClick: onMenu },
              { label: "Dar opinião", icon: "feedback", onClick: onFeedback },
            ]}
            game="astros"
          />
        )}
      </div>
    </div>
  );
}
