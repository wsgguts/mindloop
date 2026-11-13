"use client";
import TangoSymbol from "../TangoSymbol";
import { CRISTAL, ORBE } from "../../lib/tangoLogic";
import { type Model, cellName, hasEdge, the } from "../../lib/cases/model";

// Área interativa de dedução de cada tipo de mistério. Todas seguem o mesmo gesto:
// escolha um item (disco, pessoa, lugar, objeto) e depois o valor (número, símbolo, parada, casa).
// Valores nunca se repetem quando o caso pede isso: escolher um valor já usado o tira do outro item.

export interface BoardProps {
  model: Model;
  a: number[];
  sel: number | null;
  done: boolean;
  onSelect: (s: number | null) => void;
  onAssign: (s: number, v: number) => void;
}

const symOf = (v: number) => (v === 0 ? CRISTAL : ORBE);

export default function CaseBoard(p: BoardProps) {
  switch (p.model.kind) {
    case "code": return <CodeBoard {...p} />;
    case "pattern": return <PatternBoard {...p} />;
    case "route": return <RouteBoard {...p} />;
    case "layout": return <LayoutBoard {...p} />;
  }
}

/** Teclado de valores (números do cofre ou paradas da rota). */
function Pad({ model, a, sel, done, onAssign, label }: BoardProps & { label: (v: number) => string }) {
  return (
    <div className="cx-pad" role="group" aria-label={sel === null ? "Escolha um item primeiro" : `Valor para ${model.slots[sel].label}`}>
      {model.values.map((_, v) => {
        const owner = a.indexOf(v);
        return (
          <button key={v} className={`${owner >= 0 ? "used" : ""}${sel !== null && a[sel] === v ? " on" : ""}`} disabled={done || sel === null}
            onClick={() => sel !== null && onAssign(sel, v)} aria-label={`${label(v)}${owner >= 0 ? ` (agora com ${model.slots[owner].label})` : ""}`}>
            {label(v)}
          </button>
        );
      })}
      <button className="erase" disabled={done || sel === null || a[sel] < 0} onClick={() => sel !== null && onAssign(sel, -1)} aria-label="Apagar">⌫</button>
    </div>
  );
}

// ---------------------------------------------------------------- Mini Sudoku: cofre de discos

function CodeBoard(p: BoardProps) {
  const { model, a, sel, done, onSelect } = p;
  return (
    <div className="cx-code">
      <div className="cx-safe" role="group" aria-label="Posições do segredo" style={{ "--n": model.slots.length } as React.CSSProperties}>
        {model.slots.map((s, i) => (
          <button key={i} className={`cx-dial${sel === i ? " sel" : ""}${a[i] >= 0 ? " set" : ""}`} disabled={done}
            aria-pressed={sel === i} aria-label={`${s.label}: ${a[i] >= 0 ? a[i] + 1 : "vazio"}`} onClick={() => onSelect(sel === i ? null : i)}>
            <span className="cx-dial-face">{a[i] >= 0 ? a[i] + 1 : "?"}</span>
            <small>{s.label.split(" ")[0]}</small>
          </button>
        ))}
      </div>
      <Pad {...p} label={(v) => String(v + 1)} />
    </div>
  );
}

// ---------------------------------------------------------------- Tango: fila de Cristais e Orbes

function PatternBoard({ model, a, done, onAssign }: BoardProps) {
  // Toque alterna: vazio → Cristal → Orbe → vazio (como no Tango).
  const cycle = (s: number) => onAssign(s, a[s] === -1 ? 0 : a[s] === 0 ? 1 : -1);
  const triple = (i: number) => a[i] >= 0 && [[i - 2, i - 1], [i - 1, i + 1], [i + 1, i + 2]].some(([x, y]) => a[x] === a[i] && a[y] === a[i]);
  const half = model.slots.length / 2;
  const count = (v: number) => a.filter((x) => x === v).length;
  return (
    <div className="cx-pattern">
      <p className="cx-dir" aria-hidden="true"><span className="h">← início da fila · fim da fila →</span><span className="v">↓ do início ao fim da fila</span></p>
      <ol className={`cx-line${model.slots.length >= 6 ? " long" : ""}`} style={{ "--n": model.slots.length } as React.CSSProperties}>
        {model.slots.map((s, i) => (
          <li key={i}>
            <button className={`cx-person${a[i] >= 0 ? " set" : ""}${triple(i) ? " bad" : ""}`} disabled={done} onClick={() => cycle(i)}
              aria-label={`${s.label}, posição ${i + 1}: ${a[i] === 0 ? "Cristal" : a[i] === 1 ? "Orbe" : "vazio"}. Toque para trocar.`}>
              <span className="cx-sym">{a[i] >= 0 ? <TangoSymbol v={symOf(a[i])} size="100%" /> : <i />}</span>
              <span className="cx-pos" aria-hidden="true">{i + 1}</span><span className="cx-name">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="cx-count" aria-live="polite">
        <span className={count(0) > half ? "over" : ""}><TangoSymbol v={CRISTAL} size={18} /> {count(0)}/{half}</span>
        <span className={count(1) > half ? "over" : ""}><TangoSymbol v={ORBE} size={18} /> {count(1)}/{half}</span>
        <small>Toque numa pessoa para trocar o símbolo.</small>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- Zip: mapa de lugares e estradas

function RouteBoard(p: BoardProps) {
  const { model, a, sel, done, onSelect } = p;
  const pos = model.pos!;
  const at: number[] = [];
  a.forEach((v, s) => { if (v >= 0) at[v] = s; });
  const legs: [number, number][] = [];
  for (let k = 1; k < model.slots.length; k++) if (at[k - 1] !== undefined && at[k] !== undefined) legs.push([at[k - 1], at[k]]);
  return (
    <div className="cx-route">
      <div className="cx-map" role="group" aria-label="Mapa com os lugares">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {model.edges!.map(([x, y], i) => (
            <line key={i} x1={pos[x][0]} y1={pos[x][1]} x2={pos[y][0]} y2={pos[y][1]} className="road" vectorEffect="non-scaling-stroke" />
          ))}
          {legs.map(([x, y], i) => (
            <line key={`l${i}`} x1={pos[x][0]} y1={pos[x][1]} x2={pos[y][0]} y2={pos[y][1]} className={`leg${hasEdge(model, x, y) ? "" : " bad"}`} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {model.slots.map((s, i) => (
          <button key={i} className={`cx-place${sel === i ? " sel" : ""}${a[i] >= 0 ? " set" : ""}`} style={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%` }}
            disabled={done} aria-pressed={sel === i} aria-label={`${s.label}: ${a[i] >= 0 ? `${a[i] + 1}ª parada` : "sem ordem"}`} onClick={() => onSelect(sel === i ? null : i)}>
            <span className="cx-pin">{s.icon}</span>
            <span className="cx-pname">{s.label}</span>
            {a[i] >= 0 && <b className="cx-step">{a[i] + 1}</b>}
          </button>
        ))}
      </div>
      <p className="cx-help">{sel === null ? "Toque num lugar e depois escolha em que parada ele foi visitado." : `Em que parada ${the(model.slots[sel])} foi visitad${model.slots[sel].g === "f" ? "a" : "o"}?`}</p>
      <Pad {...p} label={(v) => `${v + 1}ª`} />
    </div>
  );
}

// ---------------------------------------------------------------- Patches: vitrine em grade

function LayoutBoard({ model, a, sel, done, onSelect, onAssign }: BoardProps) {
  const [rows, cols] = model.grid!;
  const ownerOf = (v: number) => a.indexOf(v);
  function tapCell(v: number) {
    if (done) return;
    const o = ownerOf(v);
    if (sel !== null) { if (o === sel) onSelect(null); else { onAssign(sel, v); onSelect(null); } }
    else if (o >= 0) onSelect(o);
  }
  const tray = model.slots.map((_, i) => i).filter((i) => a[i] < 0);
  return (
    <div className="cx-layout">
      <div className="cx-shelf" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }} role="grid" aria-label={`Grade ${rows} por ${cols}`}>
        <span />
        {Array.from({ length: cols }, (_, c) => <span key={c} className="cx-axis">{"ABC"[c]}</span>)}
        {Array.from({ length: rows }, (_, r) => [
          <span key={`r${r}`} className="cx-axis">{r + 1}</span>,
          ...Array.from({ length: cols }, (_, c) => {
            const v = r * cols + c, o = ownerOf(v);
            return (
              <button key={v} role="gridcell" className={`cx-niche${o >= 0 ? " full" : ""}${o >= 0 && o === sel ? " sel" : ""}${sel !== null && o < 0 ? " target" : ""}`} disabled={done}
                aria-label={`Casa ${cellName(model, v)}: ${o >= 0 ? model.slots[o].label : "vazia"}`} onClick={() => tapCell(v)}>
                {o >= 0 ? <><span className="cx-obj">{model.slots[o].icon}</span><small>{model.slots[o].label}</small></> : <small className="cx-cell">{cellName(model, v)}</small>}
              </button>
            );
          }),
        ])}
      </div>
      <div className="cx-tray" role="group" aria-label="Peças fora da grade">
        {tray.length === 0 ? <span className="cx-help">Todas as peças estão na grade. Toque numa peça para movê-la.</span> : tray.map((i) => (
          <button key={i} className={`cx-piece${sel === i ? " sel" : ""}`} disabled={done} aria-pressed={sel === i} onClick={() => onSelect(sel === i ? null : i)}>
            <span className="cx-obj">{model.slots[i].icon}</span>{model.slots[i].label}
          </button>
        ))}
        {sel !== null && a[sel] >= 0 && !done && (
          <button className="cx-piece out" onClick={() => { onAssign(sel, -1); onSelect(null); }}>↩ Tirar {model.slots[sel].label} da grade</button>
        )}
      </div>
      <p className="cx-help">{sel === null ? "Escolha uma peça e depois a casa onde ela fica." : `Onde fica ${the(model.slots[sel])}? Toque numa casa.`}</p>
    </div>
  );
}
