"use client";
import GameHeader from "./GameHeader";
import ZoomBoard from "./ZoomBoard";
import GameToolbar from "./GameToolbar";
import { useHintNudge, useLevelPlay } from "./useLevelPlay";
import { useSfx } from "./useSound";
import { tangoLinesDone } from "../lib/sound/progress";
import TangoSymbol, { SYMBOL_NAME, SYMBOL_PLURAL } from "./TangoSymbol";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CRISTAL, ORBE, type Cell, type Deduction, type Problem, type TGrid, type TangoPuzzle,
  cloneT, filledT, findProblems, isTangoSolved, nextDeduction, other, parseTango, signCells, solveLogically,
} from "../lib/tango";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };
type Move = { r: number; c: number; prev: number };

interface Props { puzzle: TangoPuzzle; active: boolean; onMenu: () => void; onRules: () => void; onFeedback: () => void; onWin: (ms: number) => void; onCelebrated: () => void; onHint?: () => void }

// Tocar numa casa passa por vazia → Cristal → Orbe. Quem quer um Orbe passa pelo Cristal no caminho,
// então o erro causado por um toque só aparece se a casa ficar assim por um instante.
export const ERROR_DELAY_MS = 900;

// Animação de conclusão: os símbolos "dançam" em onda, cada sinal = / × se confirma e as linhas equilibradas acendem.
const FX_MS = 3200;

const where = (k: "linha" | "coluna", i: number) => `${k} ${i + 1}`;
const at = ([r, c]: Cell) => `linha ${r + 1}, coluna ${c + 1}`;

/** Explica o erro em linguagem simples. */
function problemText(p: Problem, half: number): string {
  if (p.kind === "trio") return `Três ${SYMBOL_PLURAL(p.v!)} seguidos na ${where(p.line!.kind, p.line!.i)}. No máximo dois iguais podem ficar lado a lado.`;
  if (p.kind === "excesso") return `A ${where(p.line!.kind, p.line!.i)} já passou de ${half} ${SYMBOL_PLURAL(p.v!)}. Cada linha e coluna precisa de ${half} de cada símbolo.`;
  return p.same ? "O sinal “=” pede símbolos iguais nessas duas casas." : "O sinal “×” pede símbolos diferentes nessas duas casas.";
}

/** Explica o porquê de cada passo lógico (é isso que ensina a jogar). */
function hintText(d: Deduction, half: number): string {
  const v = SYMBOL_NAME(d.v);
  switch (d.reason) {
    case "sinal": return `Veja o sinal “${d.same ? "=" : "×"}” ligando a casa marcada à ${at(d.from[0])}. Elas precisam ser ${d.same ? "iguais" : "diferentes"}, então a casa marcada é ${v}.`;
    case "par": return `Na ${where(d.line!.kind, d.line!.i)} há dois ${SYMBOL_PLURAL(other(d.v))} lado a lado. Para não formar três iguais, a casa marcada (na ponta do par) é ${v}.`;
    case "sanduiche": return `Na ${where(d.line!.kind, d.line!.i)}, a casa marcada fica entre dois ${SYMBOL_PLURAL(other(d.v))}. Se fosse igual a eles, seriam três seguidos — então é ${v}.`;
    case "contagem": return `A ${where(d.line!.kind, d.line!.i)} já tem ${half} ${SYMBOL_PLURAL(other(d.v))}, o máximo. As casas vazias dela só podem ser ${SYMBOL_PLURAL(d.v)} — comece pela marcada.`;
    case "hipotese": return `Teste uma hipótese: se a casa marcada fosse ${SYMBOL_NAME(d.tried!)}, seguindo as regras você chegaria a uma contradição (três iguais ou contagem errada). Então ela é ${v}.`;
  }
}

export default function TangoGame({ puzzle, active, onMenu, onRules, onFeedback, onWin, onCelebrated, onHint }: Props) {
  const board = useMemo(() => parseTango(puzzle.raw), [puzzle]);
  const { n, givens, signs } = board;
  const half = n / 2;
  const solution = useMemo(() => solveLogically(givens, signs, true), [givens, signs]);
  const [grid, setGrid] = useState<TGrid>(() => cloneT(givens));
  const [history, setHistory] = useState<Move[]>([]);
  const [sel, setSel] = useState<Cell | null>(null);
  const [tip, setTip] = useState<{ cell: Cell; from: Cell[] } | null>(null);
  const nudge = useHintNudge(); // convite à dica: erros repetidos ou tempo demais
  const sfx = useSfx("tango", nudge.miss);
  const play = useLevelPlay({ active, onWin, onCelebrated, fxMs: FX_MS, onWinFx: () => sfx("win") });
  const won = play.won;
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Toque numa casa vazia para colocar um Cristal; toque de novo para trocar por um Orbe." });
  const boardRef = useRef<HTMLDivElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  const isGiven = (r: number, c: number) => givens[r][c] !== 0;

  const problems = useMemo(() => findProblems(grid, signs), [grid, signs]);
  // Casa recém-tocada cujo erro ainda está "em espera" (a pessoa pode tocar de novo para trocar o símbolo).
  const [pending, setPending] = useState<string | null>(null);
  const pendingTimer = useRef<number | undefined>(undefined);
  const gridRef = useRef(grid);
  gridRef.current = grid;
  useEffect(() => () => window.clearTimeout(pendingTimer.current), []);
  const touches = (p: Problem, key: string) => p.cells.some(([r, c]) => `${r}-${c}` === key);
  const shown = useMemo(() => (pending ? problems.filter((p) => !touches(p, pending)) : problems), [problems, pending]);
  const bad = useMemo(() => new Set(shown.flatMap((p) => p.cells.map(([r, c]) => `${r}-${c}`))), [shown]);
  function clearPending() { window.clearTimeout(pendingTimer.current); setPending(null); }

  // Sinais tocando cada casa, para descrever a grade a leitores de tela.
  const signNotes = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of signs) {
      const [a, b] = signCells(s);
      const t = s.same ? "igual" : "diferente";
      const add = (k: Cell, txt: string) => { const key = `${k[0]}-${k[1]}`; m.set(key, [...(m.get(key) ?? []), txt]); };
      add(a, `${t} à casa ${s.dir === "h" ? "da direita" : "de baixo"}`);
      add(b, `${t} à casa ${s.dir === "h" ? "da esquerda" : "de cima"}`);
    }
    return m;
  }, [signs]);

  /** delayErrors: jogada feita tocando na casa (ciclo de símbolos) — o erro espera um instante antes de aparecer. */
  function put(r: number, c: number, v: number, delayErrors = false) {
    if (won) return;
    if (isGiven(r, c)) { sfx("block"); return say("info", "Essa é uma pista fixa. Use-a para descobrir as casas vizinhas."); }
    if (grid[r][c] === v) return;
    clearPending();
    const next = cloneT(grid);
    next[r][c] = v;
    setHistory((h) => [...h, { r, c, prev: grid[r][c] }]);
    setGrid(next); setTip(null);
    if (isTangoSolved(next, signs)) { setSel(null); play.win(); say("ok", "Grade equilibrada! Todas as linhas, colunas e sinais estão certos."); return; }
    const probs = findProblems(next, signs);
    const mine = probs.find((p) => p.cells.some(([pr, pc]) => pr === r && pc === c));
    // Um som por jogada. Tocando na casa (ciclo de símbolos), o erro só soa se a casa ficar errada por um instante.
    const lines = v && !probs.length ? tangoLinesDone(next, signs, r, c) : 0;
    sfx(!v ? "erase" : mine && !delayErrors ? "error" : !mine && filledT(next) === n * n ? "error" : lines ? "complete" : "place", { v, count: lines });
    if (mine && delayErrors) {
      const key = `${r}-${c}`;
      setPending(key);
      say("info", v === CRISTAL ? "Cristal colocado. Toque de novo para trocar por um Orbe." : "Orbe colocado. Toque de novo para deixar a casa vazia.");
      pendingTimer.current = window.setTimeout(() => {
        setPending(null);
        const now = findProblems(gridRef.current, signs).find((p) => touches(p, key));
        if (now) { sfx("error"); say("warn", `${problemText(now, half)} Quer tentar outro símbolo?`); }
      }, ERROR_DELAY_MS);
      return;
    }
    if (mine) say("warn", `${problemText(mine, half)} Quer tentar outro símbolo?`);
    else if (probs.length) say("warn", "Ainda há casas marcadas com “!”. Toque nelas para ver o que corrigir.");
    else if (!v) say("info", "Casa limpa.");
    else if (filledT(next) === n * n) say("warn", "A grade está cheia, mas algo não fecha. Peça uma dica para encontrar a casa a trocar.");
    else say("ok", `Boa! ${filledT(next)} de ${n * n} casas preenchidas.`);
  }

  function tap(r: number, c: number) {
    if (won) return;
    setSel([r, c]);
    if (isGiven(r, c)) { sfx("block"); return say("info", "Essa é uma pista fixa. Use-a para descobrir as casas vizinhas."); }
    const v = grid[r][c];
    put(r, c, v === 0 ? CRISTAL : v === CRISTAL ? ORBE : 0, true); // vazia → Cristal → Orbe → vazia
  }

  function enter(v: number) {
    if (won) return;
    if (!sel) { sfx("block"); return say("info", "Escolha uma casa primeiro: toque numa casa vazia da grade."); }
    put(sel[0], sel[1], v);
  }

  function undo() {
    if (!history.length || won) { sfx("block"); return say("info", "Ainda não há nada para desfazer."); }
    const last = history[history.length - 1];
    sfx("undo");
    const next = cloneT(grid);
    next[last.r][last.c] = last.prev;
    clearPending();
    setHistory(history.slice(0, -1)); setGrid(next); setTip(null); setSel([last.r, last.c]);
    say("info", "Última jogada desfeita.");
  }

  function restart() {
    clearPending();
    sfx("undo");
    setGrid(cloneT(givens)); setHistory([]); setSel(null); setTip(null); setConfirm(false);
    say("info", "Grade restaurada ao início. Vamos de novo?");
  }

  function hint() {
    if (won) return;
    sfx("hint");
    nudge.used(play.read());
    onHint?.();
    clearPending(); // pediu ajuda: mostra tudo o que está errado agora
    if (problems.length) {
      const p = problems[0];
      setTip({ cell: p.cells[0], from: p.cells.slice(1) });
      return say("hint", `Primeiro, corrija as casas marcadas com “!”. ${problemText(p, half)}`);
    }
    // Um símbolo pode não quebrar nenhuma regra agora e ainda assim levar a um beco sem saída.
    if (solution) {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (grid[r][c] && grid[r][c] !== solution[r][c]) {
          setTip({ cell: [r, c], from: [] }); setSel([r, c]);
          return say("hint", `A casa da ${at([r, c])} não combina com o resto da grade, mesmo sem quebrar regra ainda. Que tal trocar o símbolo dela?`);
        }
      }
    }
    const d = nextDeduction(grid, signs, true);
    if (d) {
      setTip({ cell: [d.r, d.c], from: d.from }); setSel([d.r, d.c]);
      return say("hint", hintText(d, half));
    }
    say("hint", "Continue observando pares, sanduíches, a contagem de cada linha e os sinais.");
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
    } else if (e.key === "1") enter(CRISTAL);
    else if (e.key === "2") enter(ORBE);
    else if (["Backspace", "Delete", "0"].includes(e.key)) enter(0);
  }

  const filled = filledT(grid);
  const total = n * n;
  const isTip = (r: number, c: number) => tip?.cell[0] === r && tip.cell[1] === c;
  const isSrc = (r: number, c: number) => !!tip?.from.some(([fr, fc]) => fr === r && fc === c);

  return (
    <div className="wrap play">
      <GameHeader kind="tango" title={puzzle.name} subtitle={`Tango · ${puzzle.level}`} ms={play.ms} done={won} onHelp={onRules} onBack={onMenu}>
        <div className="progress" role="progressbar" aria-label="Casas preenchidas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={filled}>
          <i style={{ width: `${(filled / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{filled}/{total} casas · {half} de cada símbolo por linha e coluna</p>
      </GameHeader>

      <>
          <ZoomBoard locked={won} maxWidth={n === 8 ? 400 : 360} label="tabuleiro do Tango">
          <div ref={boardRef} className={`tboard n${n}${won ? " win" : ""}`} role="grid"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, "--sstep": `${Math.min(90, 900 / Math.max(1, signs.length))}ms` } as React.CSSProperties}
            aria-label={won ? `Grade do Tango ${n} por ${n}, resolvida.` : `Grade do Tango ${n} por ${n}. Toque numa casa para alternar entre Cristal, Orbe e vazia.`} onKeyDown={onKey}>
            {grid.map((row, r) => row.map((v, c) => {
              const g = isGiven(r, c);
              const isSel = sel?.[0] === r && sel?.[1] === c;
              const isBad = bad.has(`${r}-${c}`);
              const notes = signNotes.get(`${r}-${c}`);
              const cls = ["tcell", g && "given", isSel && "sel", isBad && "bad", isTip(r, c) && "tip", isSrc(r, c) && "src"].filter(Boolean).join(" ");
              const label = `Linha ${r + 1}, coluna ${c + 1}, ${v ? SYMBOL_NAME(v) : "vazia"}${g ? ", pista fixa" : ""}${isBad ? ", com erro" : ""}${notes ? `, ${notes.join(", ")}` : ""}`;
              return (
                <button key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" className={cls} aria-label={label}
                  style={{ "--r": r, "--c": c } as React.CSSProperties}
                  aria-pressed={isSel} tabIndex={isSel || (!sel && r === 0 && c === 0) ? 0 : -1} onClick={() => tap(r, c)}>
                  {v ? <TangoSymbol v={v} size="68%" /> : null}
                </button>
              );
            }))}
            {signs.map((s, i) => {
              const left = s.dir === "h" ? ((s.c + 1) / n) * 100 : ((s.c + 0.5) / n) * 100;
              const top = s.dir === "h" ? ((s.r + 0.5) / n) * 100 : ((s.r + 1) / n) * 100;
              return <span key={`${s.dir}${s.r}-${s.c}`} className={`tsign${s.same ? " eq" : " ne"}`} style={{ left: `${left}%`, top: `${top}%`, "--i": i } as React.CSSProperties} aria-hidden="true">{s.same ? "=" : "×"}</span>;
            })}
          </div>
          </ZoomBoard>
      </>

      <div className="gctrl">
          <div className={`tpad${won ? " off" : ""}`} role="group" aria-label="Escolher símbolo para a casa selecionada">
            <button className="btn sec" onClick={() => enter(CRISTAL)} disabled={won}><TangoSymbol v={CRISTAL} size={26} />Cristal</button>
            <button className="btn sec" onClick={() => enter(ORBE)} disabled={won}><TangoSymbol v={ORBE} size={26} />Orbe</button>
            <button className="btn sec" onClick={() => enter(0)} disabled={won}>Apagar</button>
          </div>

      <div className={`note ${msg.tone}`} role="status" aria-live="polite"><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></div>

      {confirm && (
        <div className="note warn" role="alertdialog" aria-label="Confirmação">
          <div style={{ display: "grid", gap: 8 }}>
            <span>Reiniciar apaga os símbolos que você colocou. Continuar?</span>
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
          game="tango"
        />
      )}
      </div>
    </div>
  );
}
