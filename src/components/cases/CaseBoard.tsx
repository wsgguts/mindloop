"use client";
// Tabuleiro da investigação: o CENÁRIO do caso (o mesmo componente para os 5 jogos).
// Cômodos coloridos (com o nome no primeiro canto e paredes entre eles), móveis que bloqueiam a casa, assentos
// que podem ser ocupados e os personagens posicionados (com o objeto que a pessoa escolheu para cada um).
// A regra de cada jogo aparece por cima:
//   Zip — a trilha numerada (as outras casas ficam fora do caminho);
//   Tango — os dois lados nomeados à esquerda;
//   Astros — com alguém selecionado, as linhas/colunas ocupadas apagam e as 8 casas em volta acendem;
//   Sudoku — linhas, colunas e cômodos já ocupados apagam para quem está selecionado.
import { type Model, allowedCells, cellName, propAt, rcOf, roomOf, stopOf } from "../../lib/cases/model";
import type { Focus } from "../../lib/cases/relations";

/** Cores de piso de cada cômodo (claras, para os ícones contrastarem). */
export const ROOM_TINTS = ["#EDE2FB", "#D8F3F7", "#FDEBC8", "#DDF4E4", "#FFE0EC"];

export interface BoardProps {
  model: Model;
  /** Resposta atual: casa de cada pessoa, depois objeto de cada pessoa (-1 = vazio). */
  a: number[];
  /** Pessoa selecionada (para posicionar). */
  sel: number | null;
  done: boolean;
  /** Marcas de erro da regra do lugar (só depois de reveladas, como no resto do jogo). */
  showErrors?: boolean;
  focus?: Focus;
  onSelect: (s: number | null) => void;
  /** Coloca a pessoa s na casa v (-1 = tira do tabuleiro). */
  onPlace: (s: number, v: number) => void;
}

export default function CaseBoard({ model: m, a, sel, done, showErrors, focus, onSelect, onPlace }: BoardProps) {
  const n = m.people.length;
  const { rows, cols } = m;
  const pos = a.slice(0, n), obj = a.slice(n);
  const allowed = new Set(allowedCells(m));
  const ownerOf = (v: number) => pos.indexOf(v);
  const firstOfRoom = (v: number) => m.scene.room.indexOf(m.scene.room[v]) === v;
  // Para quem está selecionado: casas que a regra do lugar já fecha (linha, coluna, cômodo ou lado ocupados).
  const closed = (v: number) => {
    if (sel === null) return false;
    const [r, c] = rcOf(m, v);
    return pos.some((w, t) => {
      if (t === sel || w < 0) return false;
      const [r2, c2] = rcOf(m, w);
      if ((m.rule === "regioes" || m.rule === "ceu") && (r === r2 || c === c2)) return true;
      if ((m.rule === "regioes" || m.rule === "comodos") && roomOf(m, v) === roomOf(m, w)) return true;
      if (m.rule === "equilibrio" && c === c2) return true;
      return false;
    });
  };
  const rays = m.rule === "ceu" ? pos.flatMap((v, s) => (v >= 0 && (s === sel || focus?.people.has(s)) ? [v] : [])) : [];
  const inRay = (v: number) => rays.some((w) => w !== v && Math.max(Math.abs(rcOf(m, v)[0] - rcOf(m, w)[0]), Math.abs(rcOf(m, v)[1] - rcOf(m, w)[1])) === 1);
  const clash = (v: number) => {
    const o = ownerOf(v);
    if (!showErrors || o < 0) return false;
    const [r, c] = rcOf(m, v);
    return pos.some((w, t) => {
      if (t === o || w < 0) return false;
      const [r2, c2] = rcOf(m, w);
      return ((m.rule === "regioes" || m.rule === "ceu") && (r === r2 || c === c2)) || ((m.rule === "regioes" || m.rule === "comodos") && roomOf(m, v) === roomOf(m, w)) || (m.rule === "equilibrio" && c === c2);
    });
  };
  const edge = (v: number, dr: number, dc: number) => {
    const [r, c] = rcOf(m, v), y = r + dr, x = c + dc;
    return y >= 0 && y < rows && x >= 0 && x < cols && roomOf(m, y * cols + x) !== roomOf(m, v);
  };
  function tapCell(v: number) {
    if (done || !allowed.has(v)) return;
    const o = ownerOf(v);
    if (sel !== null) { if (o === sel) onSelect(null); else { onPlace(sel, v); onSelect(null); } }
    else if (o >= 0) onSelect(o);
  }
  const tray = m.people.map((_, i) => i).filter((i) => pos[i] < 0);
  // Trilha do Zip: linha que liga o centro das casas, em ordem.
  const center = (v: number) => { const [r, c] = rcOf(m, v); return [((c + 0.5) / cols) * 100, ((r + 0.5) / rows) * 100]; };

  return (
    <div className="cx-scenebox">
      <div className={`cx-sceneframe rule-${m.rule}`}>
        {m.rule === "equilibrio" && (
          <div className="cx-sides" aria-hidden="true">{m.scene.rooms.slice(0, 2).map((r, k) => <span key={k} style={{ background: ROOM_TINTS[k] }}>{r.label}</span>)}</div>
        )}
        <div className="cx-sceneboard" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }} role="grid"
          aria-label={`Cenário ${rows} por ${cols} com ${m.scene.rooms.length} ${m.rule === "equilibrio" ? "lados" : "cômodos"}`}>
          {m.trail && (
            <svg className="cx-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={m.trail.map((v) => center(v).join(",")).join(" ")} vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          {Array.from({ length: rows * cols }, (_, v) => {
            const o = ownerOf(v), p = propAt(m, v);
            const blocked = !!p?.block;
            const offTrail = !!m.trail && !m.trail.includes(v);
            const shut = !blocked && !offTrail && o < 0 && closed(v);
            const room = m.scene.rooms[roomOf(m, v)];
            const cls = ["cx-sc", blocked ? "block" : offTrail ? "offtrail" : o >= 0 ? "full" : "free", o >= 0 && o === sel && "sel",
              sel !== null && o < 0 && allowed.has(v) && !shut && "target", shut && "off", inRay(v) && "ray", clash(v) && "bad",
              focus?.cells.has(v) && "rel", o >= 0 && focus?.people.has(o) && "relp",
              edge(v, -1, 0) && "bt", edge(v, 0, 1) && "br", edge(v, 1, 0) && "bb", edge(v, 0, -1) && "bl"].filter(Boolean).join(" ");
            const label = `Casa ${cellName(m, v)}, ${room.label}: ${blocked ? `${p!.label} (bloqueada)` : offTrail ? "fora da trilha" : o >= 0 ? `${m.people[o].label}${obj[o] >= 0 ? ` com ${m.objects[obj[o]].label}` : ""}` : shut ? "fechada pela regra do lugar" : p ? `${p.label}, livre` : "livre"}${m.trail && !offTrail ? `, parada ${stopOf(m, v) + 1}` : ""}`;
            return (
              <button key={v} role="gridcell" className={cls} disabled={done || blocked || offTrail} aria-label={label} onClick={() => tapCell(v)}
                style={{ "--floor": ROOM_TINTS[roomOf(m, v) % ROOM_TINTS.length] } as React.CSSProperties}>
                {firstOfRoom(v) && m.rule !== "equilibrio" && <span className="cx-room" aria-hidden="true">{room.label}</span>}
                {m.trail && !offTrail && <span className="cx-stop" aria-hidden="true">{stopOf(m, v) + 1}</span>}
                {blocked ? <span className="cx-prop" aria-hidden="true">{p!.icon}</span>
                  : o >= 0 ? <>
                    <span className="cx-who" aria-hidden="true">{m.people[o].icon}</span>
                    {obj[o] >= 0 && <span className="cx-hold" aria-hidden="true">{m.objects[obj[o]].icon}</span>}
                    <small>{m.people[o].label}</small>
                  </>
                  : <>{p && <span className="cx-seat" aria-hidden="true">{p.icon}</span>}{!offTrail && <small className="cx-cell">{cellName(m, v)}</small>}</>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="cx-tray" role="group" aria-label="Personagens ainda sem lugar">
        {tray.length === 0 ? <span className="cx-help">Todos estão no cenário. Toque num deles para mudar de lugar.</span> : tray.map((i) => (
          <button key={i} className={`cx-piece${sel === i ? " sel" : ""}${focus?.people.has(i) ? " rel" : ""}`} disabled={done} aria-pressed={sel === i} onClick={() => onSelect(sel === i ? null : i)}>
            <span className="cx-obj">{m.people[i].icon}</span>{m.people[i].label}
          </button>
        ))}
        {sel !== null && pos[sel] >= 0 && !done && (
          <button className="cx-piece out" onClick={() => { onPlace(sel, -1); onSelect(null); }}>↩ Tirar {m.people[sel].label} do cenário</button>
        )}
      </div>
      <p className="cx-help">{sel === null
        ? "Escolha um personagem e depois a casa onde ele estava. Casas com móvel estão bloqueadas."
        : `Onde estava ${m.people[sel].label}? ${m.rule === "ceu" ? "Casas apagadas já têm alguém na linha ou coluna; as douradas encostam nele." : m.rule === "trilha" ? "Só as paradas numeradas da trilha servem." : "Casas apagadas já estão fechadas pela regra do lugar."}`}</p>
    </div>
  );
}
