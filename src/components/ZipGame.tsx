"use client";
import GameHeader from "./GameHeader";
import ZoomBoard from "./ZoomBoard";
import GameToolbar from "./GameToolbar";
import { useLevelPlay } from "./useLevelPlay";
import { useMemo, useRef, useState } from "react";
import {
  type Pos, type ZipPuzzle, canStep, indexInPath, isAdjacent, isZipSolved, nextTarget, parseZip, samePos, visitedNumbers,
} from "../lib/zip";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };

interface Props { puzzle: ZipPuzzle; active: boolean; onMenu: () => void; onRules: () => void; onFeedback: () => void; onWin: (ms: number) => void; onCelebrated: () => void }

// Animação de conclusão: um cometa percorre o caminho do 1 ao último número, acendendo as casas na ordem.
const DRAW_MS = 1700;
const FX_MS = 2900;

export default function ZipGame({ puzzle, active, onMenu, onRules, onFeedback, onWin, onCelebrated }: Props) {
  const z = useMemo(() => parseZip(puzzle.rows), [puzzle]);
  const [path, setPath] = useState<Pos[]>([z.start]);
  const play = useLevelPlay({ active, onWin, onCelebrated, fxMs: FX_MS });
  const won = play.won;
  const [tip, setTip] = useState<Pos | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Vamos descobrir o próximo caminho? Arraste a partir do 1 ou toque nas casas vizinhas." });
  const drag = useRef(false);
  const dragFrom = useRef<Pos[] | null>(null); // caminho antes do arrasto (para desfazer se virar pinça)
  const last = useRef<string>("");
  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  const head = path[path.length - 1];

  function step(p: Pos, fromDrag: boolean) {
    if (won) return;
    const i = indexInPath(path, p);
    if (i >= 0) {
      if (i === path.length - 1) return;
      if (i === path.length - 2 || !fromDrag) { setPath(path.slice(0, i + 1)); setTip(null); say("info", "Voltamos um trecho. Experimente outra rota."); }
      return;
    }
    const res = canStep(path, z, p);
    if (!res.ok) {
      if (fromDrag && res.reason === "longe") return;
      if (res.reason === "ordem") say("warn", `Calma! Ainda falta passar pelo número ${res.expected} antes deste. Quer tentar outra rota?`);
      else if (res.reason === "longe") say("info", "Escolha uma casa vizinha à ponta do caminho (sem diagonais).");
      return;
    }
    const next = [...path, p];
    setPath(next); setTip(null);
    const n = z.nums[p.r][p.c];
    if (isZipSolved(next, z)) { play.win(); say("ok", `Caminho completo! Do 1 ao ${z.max}, passando por todas as casas.`); return; }
    if (next.length === z.size * z.size) say("warn", "Todas as casas foram usadas, mas o caminho precisa terminar no maior número. Que tal voltar e tentar outra rota?");
    else if (n > 0) say("ok", `Boa! Você alcançou o ${n}.${n === z.max ? " Agora preencha as casas que faltam." : ""}`);
    else say("info", `${next.length} de ${z.size * z.size} casas no caminho.`);
  }

  const cellFrom = (e: React.PointerEvent): Pos | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-rc]");
    if (!el) return null;
    const [r, c] = el.dataset.rc!.split("-").map(Number);
    return { r, c };
  };

  function onKey(e: React.KeyboardEvent) {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (d[e.key]) {
      e.preventDefault();
      const p = { r: head.r + d[e.key][0], c: head.c + d[e.key][1] };
      if (p.r >= 0 && p.c >= 0 && p.r < z.size && p.c < z.size) step(p, false);
    } else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); undo(); }
  }

  function undo() {
    if (path.length < 2 || won) return say("info", "Ainda não há nada para desfazer.");
    setPath(path.slice(0, -1)); setTip(null); say("info", "Último passo desfeito.");
  }
  function restart() { setPath([z.start]); setTip(null); setConfirm(false); say("info", "Caminho reiniciado. Vamos de novo?"); }
  function hint() {
    const t = nextTarget(path, z);
    if (!t) return say("hint", "Todos os números já foram alcançados. Falta preencher as casas restantes e terminar no maior número.");
    setTip(t.pos);
    say("hint", `Procure o número ${t.n}: ele está na linha ${t.pos.r + 1}, coluna ${t.pos.c + 1}. Como chegar lá sem bloquear outras casas?`);
  }

  const pts = path.map((p) => `${p.c + 0.5},${p.r + 0.5}`).join(" ");
  const order = useMemo(() => new Map(path.map((p, i) => [`${p.r}-${p.c}`, i])), [path]);
  const total = z.size * z.size;
  const reached = visitedNumbers(path, z);

  return (
    <div className="wrap play">
      <GameHeader kind="zip" title={puzzle.name} subtitle={`Zip · ${puzzle.level}`} ms={play.ms} done={won} onHelp={onRules} onBack={onMenu}>
        <div className="progress" role="progressbar" aria-label="Casas no caminho" aria-valuemin={0} aria-valuemax={total} aria-valuenow={path.length}>
          <i style={{ width: `${(path.length / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{path.length} de {total} casas · números alcançados: {reached} de {z.max}</p>
      </GameHeader>

      <ZoomBoard locked={won} panWithOneFinger={false} label="tabuleiro do Zip"
        onGestureStart={() => { if (drag.current && dragFrom.current) setPath(dragFrom.current); drag.current = false; }}>
          <div className={`zboard n${z.size}${won ? " win" : ""}`} role="grid" tabIndex={0}
            style={{ gridTemplateColumns: `repeat(${z.size}, 1fr)`, "--zstep": `${DRAW_MS / total}ms` } as React.CSSProperties}
            aria-label={won ? `Grade do Zip ${z.size} por ${z.size}, resolvida.` : `Grade do Zip ${z.size} por ${z.size}. Use as setas para estender o caminho e Backspace para voltar.`}
            onKeyDown={onKey}
            onPointerDown={(e) => { if (won) return; const p = cellFrom(e); if (!p) return; drag.current = true; dragFrom.current = path; last.current = `${p.r}-${p.c}`; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); step(p, false); }}
            onPointerMove={(e) => { if (!drag.current) return; const p = cellFrom(e); if (!p) return; const k = `${p.r}-${p.c}`; if (k === last.current) return; last.current = k; step(p, true); }}
            onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}>
            <svg className="zline" viewBox={`0 0 ${z.size} ${z.size}`} aria-hidden="true">
              <polyline points={pts} fill="none" stroke="#762CEB" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {won && (
              <svg className="zwin" viewBox={`0 0 ${z.size} ${z.size}`} aria-hidden="true">
                <defs>
                  <linearGradient id={`zg-${puzzle.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#12CFE0" /><stop offset=".5" stopColor="#F05BC8" /><stop offset="1" stopColor="#FFD23F" />
                  </linearGradient>
                </defs>
                <polyline className="zwin-glow" points={pts} pathLength={1} style={{ animationDuration: `${DRAW_MS}ms` }} />
                <polyline className="zwin-line" points={pts} pathLength={1} stroke={`url(#zg-${puzzle.id})`} style={{ animationDuration: `${DRAW_MS}ms` }} />
                <circle className="zwin-comet" r="0.2">
                  <animateMotion dur={`${DRAW_MS}ms`} fill="freeze" path={`M${pts.replace(/ /g, " L")}`} />
                </circle>
              </svg>
            )}
            {z.nums.map((row, r) => row.map((n, c) => {
              const p = { r, c };
              const inPath = indexInPath(path, p) >= 0;
              const isHead = samePos(p, head);
              const label = `Linha ${r + 1}, coluna ${c + 1}${n ? `, número ${n}` : ""}${inPath ? ", no caminho" : ", livre"}${isHead ? ", ponta do caminho" : ""}`;
              return (
                <div key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" aria-label={label} style={{ "--o": order.get(`${r}-${c}`) ?? 0 } as React.CSSProperties}
                  className={["zcell", isHead && !won && "head", tip && samePos(tip, p) && "tip", won && n === z.max && "end"].filter(Boolean).join(" ")}>
                  {n > 0 && <span className={`zdot${inPath ? " done" : ""}${n > 9 ? " two" : ""}`}>{n}</span>}
                </div>
              );
            }))}
          </div>
      </ZoomBoard>

      <div className="gctrl">
      <div className={`note ${msg.tone}`} role="status" aria-live="polite"><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></div>

      {confirm && (
        <div className="note warn" role="alertdialog" aria-label="Confirmação">
          <div style={{ display: "grid", gap: 8 }}>
            <span>Reiniciar apaga o caminho que você traçou. Continuar?</span>
            <div className="row"><button className="btn" onClick={restart}>Sim, reiniciar</button><button className="btn sec" onClick={() => setConfirm(false)}>Cancelar</button></div>
          </div>
        </div>
      )}

      {!won && (
        <GameToolbar
          main={[
          { label: "Desfazer", icon: "undo", onClick: undo, disabled: path.length < 2 },
          { label: "Dica", icon: "hint", onClick: hint },
          { label: "Reiniciar", icon: "restart", onClick: () => (path.length > 1 ? setConfirm(true) : restart()) },
          { label: "Ajuda", ariaLabel: "Como jogar", icon: "help", onClick: onRules },
          ]}
          more={[
          { label: "Níveis", icon: "levels", onClick: onMenu },
          { label: "Dar opinião", icon: "feedback", onClick: onFeedback },
          ]}
        />
      )}
      </div>
    </div>
  );
}
