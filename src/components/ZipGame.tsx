"use client";
import Gem from "./Gem";
import { useMemo, useRef, useState } from "react";
import {
  type Pos, type ZipPuzzle, canStep, indexInPath, isAdjacent, isZipSolved, nextTarget, parseZip, samePos, visitedNumbers,
} from "../lib/zip";

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };

interface Props { puzzle: ZipPuzzle; onMenu: () => void; onNext: () => void; onRules: () => void }

export default function ZipGame({ puzzle, onMenu, onNext, onRules }: Props) {
  const z = useMemo(() => parseZip(puzzle.rows), [puzzle]);
  const [path, setPath] = useState<Pos[]>([z.start]);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [tip, setTip] = useState<Pos | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: "Vamos descobrir o próximo caminho? Arraste a partir do 1 ou toque nas casas vizinhas." });
  const drag = useRef(false);
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
    setPath(next); setTip(null); setMoves((m) => m + 1);
    const n = z.nums[p.r][p.c];
    if (isZipSolved(next, z)) { setWon(true); return; }
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
  function restart() { setPath([z.start]); setTip(null); setMoves(0); setConfirm(false); say("info", "Caminho reiniciado. Vamos de novo?"); }
  function hint() {
    const t = nextTarget(path, z);
    if (!t) return say("hint", "Todos os números já foram alcançados. Falta preencher as casas restantes e terminar no maior número.");
    setTip(t.pos);
    say("hint", `Procure o número ${t.n}: ele está na linha ${t.pos.r + 1}, coluna ${t.pos.c + 1}. Como chegar lá sem bloquear outras casas?`);
  }

  const pts = path.map((p) => `${p.c + 0.5},${p.r + 0.5}`).join(" ");
  const total = z.size * z.size;
  const reached = visitedNumbers(path, z);

  return (
    <div className="wrap">
      <div className="title"><Gem kind="zip" size={48} /><div><h1>{puzzle.name}</h1><p className="muted">Zip · {puzzle.level}</p></div></div>
      <div>
        <div className="progress" role="progressbar" aria-label="Casas no caminho" aria-valuemin={0} aria-valuemax={total} aria-valuenow={path.length}>
          <i style={{ width: `${(path.length / total) * 100}%` }} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{path.length} de {total} casas · números alcançados: {reached} de {z.max}</p>
      </div>

      {won ? (
        <section className="celebrate" aria-labelledby="zwin">
          <h2 id="zwin">Caminho completo! ✓</h2>
          <p>Você ligou todos os números em ordem e passou por cada casa. Resumo: {moves} passos neste puzzle.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn cta" onClick={onNext}>Jogar novamente</button>
            <button className="btn sec" onClick={onMenu}>Voltar ao menu</button>
          </div>
        </section>
      ) : (
        <div className="zboard-wrap">
          <div className="zboard" style={{ gridTemplateColumns: `repeat(${z.size}, 1fr)` }} role="grid" tabIndex={0}
            aria-label={`Grade do Zip ${z.size} por ${z.size}. Use as setas para estender o caminho e Backspace para voltar.`}
            onKeyDown={onKey}
            onPointerDown={(e) => { const p = cellFrom(e); if (!p) return; drag.current = true; last.current = `${p.r}-${p.c}`; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); step(p, false); }}
            onPointerMove={(e) => { if (!drag.current) return; const p = cellFrom(e); if (!p) return; const k = `${p.r}-${p.c}`; if (k === last.current) return; last.current = k; step(p, true); }}
            onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}>
            <svg className="zline" viewBox={`0 0 ${z.size} ${z.size}`} aria-hidden="true">
              <polyline points={pts} fill="none" stroke="#762CEB" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {z.nums.map((row, r) => row.map((n, c) => {
              const p = { r, c };
              const inPath = indexInPath(path, p) >= 0;
              const isHead = samePos(p, head);
              const label = `Linha ${r + 1}, coluna ${c + 1}${n ? `, número ${n}` : ""}${inPath ? ", no caminho" : ", livre"}${isHead ? ", ponta do caminho" : ""}`;
              return (
                <div key={`${r}-${c}`} data-rc={`${r}-${c}`} role="gridcell" aria-label={label}
                  className={["zcell", isHead && "head", tip && samePos(tip, p) && "tip"].filter(Boolean).join(" ")}>
                  {n > 0 && <span className={`zdot ${inPath ? "done" : ""}`}>{n}</span>}
                </div>
              );
            }))}
          </div>
        </div>
      )}

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
        <div className="row">
          <button className="btn sec" onClick={undo} disabled={path.length < 2}>Desfazer</button>
          <button className="btn sec" onClick={hint}>Dica</button>
          <button className="btn sec" onClick={() => (path.length > 1 ? setConfirm(true) : restart())}>Reiniciar</button>
          <button className="btn sec" onClick={onRules}>Regras</button>
          <button className="btn sec" onClick={onMenu}>Menu</button>
        </div>
      )}
    </div>
  );
}
