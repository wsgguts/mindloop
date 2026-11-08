"use client";
import GameHeader from "./GameHeader";
import ZoomBoard from "./ZoomBoard";
import { useLevelPlay } from "./useLevelPlay";
import PatchesTag, { KIND_HELP, KIND_NAME } from "./PatchesTag";
import { useMemo, useRef, useState } from "react";
import {
  type Cell, type Clue, type Deduction, type PatchesPuzzle, type Problem, type Rect,
  area, cluesIn, coveredCount, kindOf, findProblems, isPatchesSolved, nextDeduction, overlaps, parsePatches, pieceAt,
  pieceProblem, rectFrom, sameRect, solveLogically,
} from "../lib/patches";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };

interface Props { puzzle: PatchesPuzzle; active: boolean; onMenu: () => void; onRules: () => void; onWin: (ms: number) => void; onCelebrated: () => void }

// Animação de conclusão: as peças "encaixam" em onda, os números brilham e a moldura acende.
const FX_MS = 3000;
const WAVE_MS = 1400;

// Cor de cada peça: a do número que ela contém (assim a cor acompanha o número ao refazer a peça).
const PALETTE = ["#F05BC8", "#12CFE0", "#FFD23F", "#9A6BFF", "#4FD6B1", "#FFB020", "#FF8FA3", "#7FB2FF"];
const NEUTRAL = "#C9B8EC";

const at = ([r, c]: Cell) => `linha ${r + 1}, coluna ${c + 1}`;
/** "6 (peça em pé) da linha 2, coluna 3" — o formato só aparece quando o número pede um. */
const clueAt = (k: Clue) => `${k.v}${k.kind === "a" ? "" : ` (peça ${KIND_NAME[k.kind]})`} da ${at([k.r, k.c])}`;
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const shape = (q: Rect) => `${plural(q.h, "linha", "linhas")} × ${plural(q.w, "coluna", "colunas")}`;
const sameCell = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];

/** Explica o erro de uma peça em linguagem simples. */
function problemText(p: Problem): string {
  const a = area(p.piece);
  if (p.kind === "vazia") return `Essa peça de ${a} casas não tem nenhum número. Cada peça precisa conter exatamente um número.`;
  if (p.kind === "varios") return `Essa peça cobre ${p.clues.length} números (${p.clues.map((k) => k.v).join(" e ")}). Cada peça pode ter só um.`;
  if (p.kind === "formato") {
    const k = p.clues[0];
    return `O ${k.v} pede uma peça ${KIND_NAME[k.kind]} (${KIND_HELP[k.kind]}), mas essa ficou ${KIND_NAME[kindOf(p.piece)]}. Veja o formato da etiqueta do número.`;
  }
  return `Essa peça tem ${a} casas, mas o número dentro dela é ${p.clues[0].v}. O número diz quantas casas a peça ocupa.`;
}

/** Explica o porquê de cada passo lógico (é isso que ensina a jogar). */
function hintText(d: Deduction, clues: Clue[]): string {
  const k = clues[d.clue];
  switch (d.reason) {
    case "unico":
      return `O ${clueAt(k)} só cabe de um jeito: uma peça de ${shape(d.rect)}, sem cobrir outro número nem sair da grade. O encaixe está destacado — desenhe-o.`;
    case "casa":
      return `A casa marcada (${at(d.cell!)}) só pode ser coberta pelo ${clueAt(k)}: nenhum outro número alcança essa casa. Passando por ela, a peça do ${k.v} só tem um formato: ${shape(d.rect)}.`;
    case "reserva": {
      const o = clues[d.other!];
      return `Todo encaixe possível do ${clueAt(o)} usa algumas casas em comum — elas ficam reservadas para ele. Sem essas casas, o ${clueAt(k)} só tem um encaixe: ${shape(d.rect)}.`;
    }
  }
}

export default function PatchesGame({ puzzle, active, onMenu, onRules, onWin, onCelebrated }: Props) {
  const board = useMemo(() => parsePatches(puzzle.raw), [puzzle]);
  const { n, clues } = board;
  const total = n * n;
  const solution = useMemo(() => solveLogically(board).pieces, [board]);
  const [pieces, setPieces] = useState<Rect[]>([]);
  const [history, setHistory] = useState<Rect[][]>([]);
  const [anchor, setAnchor] = useState<Cell | null>(null); // 1º canto marcado com um toque
  const [preview, setPreview] = useState<Rect | null>(null); // peça sendo arrastada
  const [cursor, setCursor] = useState<Cell | null>(null); // casa do teclado
  const [tip, setTip] = useState<{ rect?: Rect; cell?: Cell; clue?: number; wrong?: boolean } | null>(null);
  const play = useLevelPlay({ active, onWin, onCelebrated, fxMs: FX_MS });
  const won = play.won;
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Arraste de um canto ao canto oposto para desenhar uma peça — ou toque num canto e depois no outro." });
  const drag = useRef<{ start: Cell; cur: Cell } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });

  const problems = useMemo(() => findProblems(board, pieces), [board, pieces]);
  const badSet = useMemo(() => new Set(problems.map((p) => p.piece)), [problems]);
  const clueIndex = (q: Rect) => { const ks = cluesIn(board, q); return ks.length === 1 ? clues.indexOf(ks[0]) : -1; };
  const covered = coveredCount(pieces);
  // Legenda: só os formatos que aparecem neste nível, sempre na mesma ordem.
  const kindsUsed = (["q", "v", "h", "a"] as const).filter((kd) => clues.some((k) => k.kind === kd));
  const placedOk = pieces.length - problems.length;

  function commit(next: Rect[]) {
    setHistory((h) => [...h, pieces]);
    setPieces(next);
    setTip(null);
  }

  /** Coloca uma peça; as que estiverem embaixo dela saem (dá para corrigir desenhando por cima). */
  function place(q: Rect) {
    if (won) return;
    const kept = pieces.filter((p) => !overlaps(p, q));
    const replaced = pieces.length - kept.length;
    const next = [...kept, q];
    commit(next);
    if (isPatchesSolved(board, next)) { setAnchor(null); setCursor(null); play.win(); say("ok", "Grade completa! Cada peça tem um número, o tamanho e o formato certos."); return; }
    const prob = pieceProblem(board, q);
    const out = replaced ? ` (${replaced === 1 ? "a peça que estava ali saiu" : `${replaced} peças que estavam ali saíram`})` : "";
    if (prob) return say("warn", `${problemText(prob)} Toque na peça para tirá-la ou desenhe outra por cima.`);
    const c = coveredCount(next);
    if (c === total) return say("warn", "Toda a grade está coberta, mas ainda há peças com “!”. Toque nelas para ver o que corrigir.");
    say("ok", `Boa! Peça de ${area(q)} casas encaixada${out}. ${c} de ${total} casas cobertas.`);
  }

  function remove(q: Rect) {
    if (won) return;
    commit(pieces.filter((p) => p !== q));
    say("info", `Peça de ${area(q)} casas retirada. Desenhe outra no lugar.`);
  }

  /** Toque numa casa: marca o 1º canto, fecha a peça no 2º canto, ou tira a peça tocada. */
  function tapCell(p: Cell) {
    if (won) return;
    if (anchor) {
      setAnchor(null);
      if (sameCell(anchor, p)) return say("info", "Canto desmarcado.");
      return place(rectFrom(anchor, p));
    }
    const q = pieceAt(pieces, p[0], p[1]);
    if (q) return remove(q);
    setAnchor(p); setTip(null);
    say("info", `Canto marcado na ${at(p)}. Agora toque no canto oposto da peça (toque de novo no mesmo canto para desmarcar).`);
  }

  const cellFrom = (e: React.PointerEvent): Cell | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-rc]");
    if (!el || !boardRef.current?.contains(el)) return null;
    const [r, c] = el.dataset.rc!.split("-").map(Number);
    return [r, c];
  };

  function onPointerDown(e: React.PointerEvent) {
    if (won || (e.pointerType === "mouse" && e.button !== 0)) return;
    const p = cellFrom(e);
    if (!p) return;
    drag.current = { start: p, cur: p };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = cellFrom(e);
    if (!p || sameCell(p, d.cur)) return;
    d.cur = p;
    setPreview(sameCell(p, d.start) ? null : rectFrom(d.start, p));
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setPreview(null);
    if (!d) return;
    if (!sameCell(d.start, d.cur)) { setAnchor(null); place(rectFrom(d.start, d.cur)); }
    else tapCell(d.start);
  }
  function cancelDrag() { drag.current = null; setPreview(null); }

  function onKey(e: React.KeyboardEvent) {
    const move: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const from = cursor ?? [0, 0];
    if (move[e.key]) {
      e.preventDefault();
      const [dr, dc] = move[e.key];
      setCursor([Math.min(n - 1, Math.max(0, from[0] + dr)), Math.min(n - 1, Math.max(0, from[1] + dc))]);
    } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tapCell(from); setCursor(from); }
    else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const q = pieceAt(pieces, from[0], from[1]);
      if (q) remove(q); else say("info", "Não há peça nessa casa.");
    } else if (e.key === "Escape" && anchor) { setAnchor(null); say("info", "Canto desmarcado."); }
  }

  function undo() {
    if (!history.length || won) return say("info", "Ainda não há nada para desfazer.");
    setPieces(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setTip(null); setAnchor(null);
    say("info", "Última jogada desfeita.");
  }

  function restart() {
    setPieces([]); setHistory([]); setAnchor(null); setTip(null); setConfirm(false);
    say("info", "Grade limpa. Vamos de novo?");
  }

  function hint() {
    if (won) return;
    setAnchor(null);
    if (problems.length) {
      const p = problems[0];
      setTip({ rect: p.piece, wrong: true });
      return say("hint", `Primeiro, corrija a peça marcada com “!”. ${problemText(p)}`);
    }
    // Uma peça pode seguir as regras sozinha e ainda assim não combinar com o resto da grade.
    if (solution) {
      const wrong = pieces.find((q) => !solution.some((s) => sameRect(s, q)));
      if (wrong) {
        setTip({ rect: wrong, wrong: true });
        return say("hint", "A peça destacada segue as regras sozinha, mas não combina com o resto da grade. Que tal tirá-la (toque nela) e tentar outro formato?");
      }
    }
    const fixed = clues.map((k) => pieceAt(pieces, k.r, k.c) ?? null);
    const d = nextDeduction(board, fixed);
    if (d) {
      setTip({ rect: d.rect, cell: d.cell, clue: d.clue });
      return say("hint", hintText(d, clues));
    }
    say("hint", "Procure números que só cabem de um jeito, perto dos cantos e das bordas, e casas que só um número alcança.");
  }

  // Ordem das peças na animação de vitória: de cima para baixo, da esquerda para a direita.
  const order = useMemo(() => {
    const sorted = [...pieces].sort((a, b) => a.r - b.r || a.c - b.c);
    return new Map(sorted.map((q, i) => [q, i]));
  }, [pieces]);
  const span = (q: Rect): React.CSSProperties => ({ gridRow: `${q.r + 1} / span ${q.h}`, gridColumn: `${q.c + 1} / span ${q.w}` });
  // Com o teclado, o canto marcado + a casa atual mostram a peça antes de confirmar.
  const shown = preview ?? (anchor && cursor && !sameCell(anchor, cursor) ? rectFrom(anchor, cursor) : null);
  const shownOk = shown ? !pieceProblem(board, shown) : false;

  return (
    <div className="wrap play">
      <GameHeader kind="patches" title={puzzle.name} subtitle={`Patches · ${puzzle.level}`} ms={play.ms} done={won} onHelp={onRules}>
        <div className="progress" role="progressbar" aria-label="Casas cobertas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={covered}>
          <i style={{ width: `${(covered / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{covered} de {total} casas cobertas · {placedOk} de {clues.length} peças encaixadas</p>
      </GameHeader>

      <ZoomBoard locked={won} panWithOneFinger={false} maxWidth={n >= 8 ? 400 : 360} label="tabuleiro do Patches" onGestureStart={cancelDrag}>
        <div ref={boardRef} className={`ptboard n${n}${won ? " win" : ""}${anchor ? " picking" : ""}`} role="grid" tabIndex={0}
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`, "--n": n, "--pstep": `${Math.round(WAVE_MS / Math.max(1, pieces.length))}ms` } as React.CSSProperties}
          aria-label={won ? `Grade do Patches ${n} por ${n}, resolvida.` : `Grade do Patches ${n} por ${n}. Use as setas para escolher uma casa, Enter para marcar os cantos de uma peça e Delete para tirar uma peça.`}
          onKeyDown={onKey} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={cancelDrag}
          onBlur={() => setCursor(null)}>
          {Array.from({ length: total }, (_, i) => {
            const r = Math.floor(i / n), c = i % n;
            const k = clues.find((x) => x.r === r && x.c === c);
            const q = pieceAt(pieces, r, c);
            const isAnchor = !!anchor && sameCell(anchor, [r, c]);
            const isCur = !!cursor && sameCell(cursor, [r, c]);
            const label = `Linha ${r + 1}, coluna ${c + 1}${k ? `, número ${k.v}, peça ${KIND_NAME[k.kind]}` : ""}${q ? `, coberta por peça de ${area(q)} casas${badSet.has(q) ? ", com erro" : ""}` : ", livre"}${isAnchor ? ", canto marcado" : ""}`;
            return (
              <div key={i} data-rc={`${r}-${c}`} role="gridcell" aria-label={label} aria-selected={isCur || undefined}
                className={["ptcell", c === n - 1 && "edge-c", r === n - 1 && "edge-r", isAnchor && "anchor", isCur && "cur", tip?.cell && sameCell(tip.cell, [r, c]) && "tip"].filter(Boolean).join(" ")}
                style={{ gridRow: r + 1, gridColumn: c + 1 }} />
            );
          })}
          {pieces.map((q) => {
            const ki = clueIndex(q);
            const bad = badSet.has(q);
            return <span key={`${q.r}-${q.c}-${q.h}-${q.w}`} className={`ptpiece${bad ? " bad" : ""}`} aria-hidden="true"
              style={{ ...span(q), "--pc": ki >= 0 ? PALETTE[ki % PALETTE.length] : NEUTRAL, "--i": order.get(q) ?? 0 } as React.CSSProperties} />;
          })}
          {tip?.rect && <span className={`ptghost${tip.wrong ? " wrong" : ""}`} style={span(tip.rect)} aria-hidden="true" />}
          {shown && (
            <span className={`ptprev${shownOk ? " ok" : ""}`} style={span(shown)} aria-hidden="true">
              <b>{shown.h}×{shown.w} = {area(shown)}</b>
            </span>
          )}
          {clues.map((k, i) => {
            const q = pieceAt(pieces, k.r, k.c);
            const ok = !!q && !badSet.has(q);
            return (
              <span key={i} className={["ptclue", ok && "ok", k.v > 9 && "two", tip?.clue === i && "tip"].filter(Boolean).join(" ")}
                style={{ gridRow: k.r + 1, gridColumn: k.c + 1, "--i": q ? order.get(q) ?? 0 : 0 } as React.CSSProperties} aria-hidden="true">
                <PatchesTag v={k.v} kind={k.kind} color={PALETTE[i % PALETTE.length]} />
              </span>
            );
          })}
        </div>
      </ZoomBoard>

      <div className="gctrl">
        {kindsUsed.length > 0 && (
          <ul className="ptlegend" aria-label="Formato das peças">
            {kindsUsed.map((kd) => (
              <li key={kd}><span className="ptl-tag" aria-hidden="true"><PatchesTag v="" kind={kd} color="#9A6BFF" /></span>{kd === "a" ? "livre" : KIND_NAME[kd]}</li>
            ))}
          </ul>
        )}
        <div className={`note ${msg.tone}`} role="status" aria-live="polite"><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></div>

        {confirm && (
          <div className="note warn" role="alertdialog" aria-label="Confirmação">
            <div style={{ display: "grid", gap: 8 }}>
              <span>Reiniciar tira todas as peças que você colocou. Continuar?</span>
              <div className="row"><button className="btn" onClick={restart}>Sim, reiniciar</button><button className="btn sec" onClick={() => setConfirm(false)}>Cancelar</button></div>
            </div>
          </div>
        )}

        {!won && (
          <div className="row">
            <button className="btn sec" onClick={undo} disabled={!history.length}>Desfazer</button>
            <button className="btn sec" onClick={hint}>Dica</button>
            <button className="btn sec" onClick={() => (pieces.length ? setConfirm(true) : restart())}>Reiniciar</button>
            <button className="btn sec" onClick={onRules}>Como jogar</button>
            <button className="btn sec" onClick={onMenu}>Níveis</button>
          </div>
        )}
      </div>
    </div>
  );
}
