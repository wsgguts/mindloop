"use client";
// Tabuleiro da investigação: o CENÁRIO do caso, onde a pessoa encaixa os personagens (a resposta de "onde").
// Tocar num personagem da fileira de baixo e depois na casa; tocar em quem já está no tabuleiro o seleciona para
// mudar de lugar. (As anotações — ✕ e palpites — ficam no quadro de decisões, ao lado.)
// Cômodos coloridos (com o nome no primeiro canto e paredes entre eles), móveis que bloqueiam a casa, assentos
// que podem ser ocupados e os personagens posicionados (com o objeto que a pessoa escolheu para cada um).
// A regra de cada jogo aparece por cima:
//   Zip — a trilha numerada (as outras casas ficam fora do caminho);
//   Tango — os dois lados nomeados à esquerda;
//   Astros — com alguém selecionado, as linhas/colunas ocupadas apagam e as 8 casas em volta acendem;
//   Sudoku — linhas, colunas e cômodos já ocupados apagam para quem está selecionado;
//   Patches — cada cômodo é uma peça colorida com a etiqueta do tamanho (como no jogo).
import { useEffect, useRef, useState } from "react";
import { type Model, allowedCells, cellName, propAt, rcOf, roomOf, stopOf } from "../../lib/cases/model";
import type { Focus } from "../../lib/cases/relations";
import Art from "../Art";
import PatchesTag from "../PatchesTag";
import TangoSymbol from "../TangoSymbol";

/** Cores de piso de cada cômodo (claras, para os ícones contrastarem). */
export const ROOM_TINTS = ["#EDE2FB", "#D8F3F7", "#FDEBC8", "#DDF4E4", "#FFE0EC"];
/** Patches: cada cômodo é uma peça com a cor do jogo (as mesmas cores das peças do Patches). */
export const PATCH_COLORS = ["#F05BC8", "#12CFE0", "#FFD23F", "#9A6BFF", "#4FD6B1", "#FFB020"];
/** Piso de uma casa: no Patches, um tom claro da cor da peça; nos outros jogos, os tons pastel de sempre. */
export function floorOf(m: Model, v: number): string {
  const k = roomOf(m, v);
  return m.rule === "comodos" ? `color-mix(in srgb, ${PATCH_COLORS[k % PATCH_COLORS.length]} 34%, #fff)` : ROOM_TINTS[k % ROOM_TINTS.length];
}
/** Patches: tamanho (casas) e formato do cômodo k, para a etiqueta igual à do jogo. */
export function roomShape(m: Model, k: number): { size: number; kind: "q" | "v" | "h" } {
  const cells = m.scene.room.flatMap((r, v) => (r === k ? [v] : []));
  const rs = cells.map((v) => rcOf(m, v)[0]), cs = cells.map((v) => rcOf(m, v)[1]);
  const h = Math.max(...rs) - Math.min(...rs) + 1, w = Math.max(...cs) - Math.min(...cs) + 1;
  return { size: cells.length, kind: h === w ? "q" : h > w ? "v" : "h" };
}

/** Quantas casas seguidas, a partir de v e para a direita, são do mesmo cômodo (a etiqueta do nome pode usar todas). */
export function roomRun(m: Model, v: number): number {
  const [, c] = rcOf(m, v);
  let span = 1;
  while (c + span < m.cols && m.scene.room[v + span] === m.scene.room[v]) span++;
  return span;
}

export interface BoardProps {
  model: Model;
  /** Resposta atual: casa de cada pessoa, depois objeto de cada pessoa (-1 = vazio). */
  a: number[];
  /** Pessoa selecionada na fileira (o próximo toque numa casa a coloca ali). */
  sel: number | null;
  done: boolean;
  /** Marcas de erro da regra do lugar (só depois de reveladas, como no resto do jogo). */
  showErrors?: boolean;
  focus?: Focus;
  /** Sugestões do quadro: casa → personagem cujos ✓ de lugar apontam só essa casa (não preenche a resposta). */
  suggest?: Map<number, number>;
  onSelect: (s: number | null) => void;
  /** Coloca a pessoa s na casa v (-1 = tira do tabuleiro). */
  onPlace: (s: number, v: number) => void;
}

export default function CaseBoard({ model: m, a, sel, done, showErrors, focus, suggest, onSelect, onPlace }: BoardProps) {
  const n = m.people.length;
  const { rows, cols } = m;
  const pos = a.slice(0, n), obj = a.slice(n);
  const allowed = new Set(allowedCells(m));
  const ownerOf = (v: number) => pos.indexOf(v);
  const firstOfRoom = (v: number) => m.scene.room.indexOf(m.scene.room[v]) === v;
  // Nomes dos cômodos (etiqueta no canto da 1ª casa; no Tango, os lados à esquerda). Se um nome não cabe, a fonte da
  // etiqueta diminui um pouco; se ainda assim não couber, a legenda "Locais" abaixo do tabuleiro mostra todos por extenso.
  const boardRef = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const box = boardRef.current?.closest<HTMLElement>(".cx-sceneframe");
    if (!box) return;
    const over = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    const check = () => {
      const els = [...box.querySelectorAll<HTMLElement>(".cx-room, .cx-sides span")];
      for (const el of els) {
        el.style.fontSize = "";
        let fs = parseFloat(getComputedStyle(el).fontSize);
        const floor = Math.max(8.5, fs - 2); // reduz no máximo 2px (nunca abaixo de 8,5px): continua legível
        while (over(el) && fs > floor) { fs -= 0.5; el.style.fontSize = `${fs}px`; }
      }
      setCut(els.some(over));
    };
    check();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(box);
    document.fonts?.ready.then(check).catch(() => {});
    return () => ro?.disconnect();
  }, [m]);
  // Para quem está selecionado: casas que a regra do lugar já fecha (linha, coluna, cômodo ou lado ocupados).
  const closed = (v: number) => {
    if (sel === null) return false;
    const [r, c] = rcOf(m, v);
    return pos.some((w, t) => {
      if (t === sel || w < 0) return false;
      const [r2, c2] = rcOf(m, w);
      if ((m.rule === "regioes" || m.rule === "ceu") && (r === r2 || c === c2)) return true;
      if ((m.rule === "regioes" || m.rule === "comodos" || m.rule === "ceu") && roomOf(m, v) === roomOf(m, w)) return true;
      if (m.rule === "ceu" && Math.max(Math.abs(r - r2), Math.abs(c - c2)) === 1) return true; // encostaria
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
      return ((m.rule === "regioes" || m.rule === "ceu") && (r === r2 || c === c2)) || ((m.rule === "regioes" || m.rule === "comodos" || m.rule === "ceu") && roomOf(m, v) === roomOf(m, w))
        || (m.rule === "ceu" && Math.max(Math.abs(r - r2), Math.abs(c - c2)) === 1) || (m.rule === "equilibrio" && c === c2);
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
  // Trilha do Zip: linha que liga o centro das casas, em ordem.
  const center = (v: number) => { const [r, c] = rcOf(m, v); return [((c + 0.5) / cols) * 100, ((r + 0.5) / rows) * 100]; };

  return (
    <div className="cx-scenebox">
      <div className={`cx-sceneframe rule-${m.rule}`} style={{ "--cols": cols } as React.CSSProperties}>
        {m.rule === "equilibrio" && (
          <div className="cx-sides" aria-hidden="true">{m.scene.rooms.slice(0, 2).map((r, k) => (
            <span key={k} style={{ background: ROOM_TINTS[k] }} title={`Lado do ${k === 0 ? "Cristal" : "Orbe"}: ${r.label}`}><TangoSymbol v={k === 0 ? 1 : 2} size={20} /><b>{k === 0 ? "Cristal" : "Orbe"}</b></span>
          ))}</div>
        )}
        <div className="cx-sceneboard" ref={boardRef} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }} role="grid"
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
            const ghost = o < 0 && !blocked && !offTrail ? suggest?.get(v) : undefined;
            const cls = ["cx-sc", ghost !== undefined && "sugg", blocked ? "block" : offTrail ? "offtrail" : o >= 0 ? "full" : "free", o >= 0 && o === sel && "sel",
              sel !== null && o < 0 && allowed.has(v) && !shut && "target", shut && "off", inRay(v) && "ray", clash(v) && "bad",
              focus?.cells.has(v) && "rel", o >= 0 && focus?.people.has(o) && "relp",
              edge(v, -1, 0) && "bt", edge(v, 0, 1) && "br", edge(v, 1, 0) && "bb", edge(v, 0, -1) && "bl"].filter(Boolean).join(" ");
            const label = `Casa ${cellName(m, v)}, ${room.label}${m.rule === "comodos" ? ` (${roomShape(m, roomOf(m, v)).size} casas)` : ""}: ${blocked ? `${p!.label} (bloqueada)` : offTrail ? "fora da trilha" : o >= 0 ? `${m.people[o].label}${obj[o] >= 0 ? ` com ${m.objects[obj[o]].label}` : ""}` : shut ? "fechada pela regra do lugar" : p ? `${p.label}, livre` : "livre"}${m.trail && !offTrail ? `, parada ${stopOf(m, v) + 1}` : ""}${sel !== null ? `. Toque para colocar ${m.people[sel].label} aqui.` : ""}`;
            return (
              <button key={v} role="gridcell" className={cls} disabled={done || blocked || offTrail} aria-label={label} onClick={() => tapCell(v)}
                style={{ "--floor": floorOf(m, v), ...(m.rule === "comodos" ? { "--piece": PATCH_COLORS[roomOf(m, v) % PATCH_COLORS.length] } : {}) } as React.CSSProperties}>
                {firstOfRoom(v) && m.rule !== "equilibrio" && <span className="cx-room" aria-hidden="true" style={{ "--span": roomRun(m, v) } as React.CSSProperties}>{room.label}</span>}
                {firstOfRoom(v) && m.rule === "comodos" && (() => { const sh = roomShape(m, roomOf(m, v)); return <span className="cx-ptag ptclue" aria-hidden="true"><PatchesTag v={sh.size} kind={sh.kind} color={PATCH_COLORS[roomOf(m, v) % PATCH_COLORS.length]} /></span>; })()}
                {m.trail && !offTrail && <span className="cx-stop" aria-hidden="true">{stopOf(m, v) + 1}</span>}
                {blocked ? <span className="cx-prop" aria-hidden="true"><Art e={p!} className="fill" /></span>
                  : o >= 0 ? <>
                    <span className="cx-who" aria-hidden="true"><Art e={m.people[o]} className="fill" /></span>
                    {obj[o] >= 0 && <span className="cx-hold" aria-hidden="true"><Art e={m.objects[obj[o]]} className="fill" /></span>}
                    <small>{m.people[o].label}</small>
                  </>
                  : ghost !== undefined ? <><span className="cx-ghost" aria-hidden="true"><Art e={m.people[ghost]} className="fill" /></span><small className="cx-cell">{cellName(m, v)}</small></>
                  : <>{p && <span className="cx-seat" aria-hidden="true"><Art e={p} className="fill" /></span>}{!offTrail && <small className="cx-cell">{cellName(m, v)}</small>}</>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Legenda dos móveis: ninguém fica numa casa bloqueada (nada pequeno ou só desenhado decide o caso). */}
      {m.scene.props.some((p) => p.block) && (
        <ul className="cx-blocks" aria-label="Casas bloqueadas">
          {m.scene.props.filter((p) => p.block).map((p) => <li key={p.cell}><span className="cx-blocks-pic" aria-hidden="true"><Art e={p} className="fill" /></span><b>{cellName(m, p.cell)}</b> {p.label}</li>)}
          <li className="cx-blocks-note">casas bloqueadas: ninguém fica ali</li>
        </ul>
      )}
      {cut && (
        <ul className="cx-roomkey" aria-label="Locais: nomes completos">
          <li className="cx-roomkey-t">Locais</li>
          {m.scene.rooms.map((r, k) => { const v = m.scene.room.indexOf(k); return v < 0 ? null : <li key={k}><i style={{ background: floorOf(m, v) }} aria-hidden="true" />{r.label}</li>; })}
        </ul>
      )}
      <div className="cx-tray" role="group" aria-label="Personagens: toque num deles e depois na casa">
        {m.people.map((p, i) => (
          <button key={i} className={`cx-piece${sel === i ? " sel" : ""}${focus?.people.has(i) ? " rel" : ""}${pos[i] >= 0 ? " placed" : ""}`} disabled={done} aria-pressed={sel === i}
            aria-label={`${p.label}: ${pos[i] >= 0 ? `na casa ${cellName(m, pos[i])}` : "sem lugar"}${obj[i] >= 0 ? `, com ${m.objects[obj[i]].label}` : ""}`}
            onClick={() => onSelect(sel === i ? null : i)}>
            <span className="cx-obj"><Art e={p} /></span><span className="cx-piece-name">{p.label}</span>
            <small className="cx-piece-at">{pos[i] >= 0 ? (m.trail ? stopOf(m, pos[i]) + 1 : cellName(m, pos[i])) : "—"}</small>
          </button>
        ))}
      </div>
      {sel !== null && pos[sel] >= 0 && !done && (
        <button className="cx-piece out" onClick={() => { onPlace(sel, -1); onSelect(null); }}>↩ Tirar {m.people[sel].label} do tabuleiro</button>
      )}
      <p className="cx-help">{sel === null
        ? <>Toque num <b>personagem</b> acima e depois na <b>casa</b> onde ele estava. Casas com móvel estão bloqueadas.</>
        : <>Onde estava <b>{m.people[sel].label}</b>? {m.rule === "ceu" ? "Casas apagadas já estão fechadas (mesma linha, coluna ou região de alguém, ou encostadas em alguém)." : m.rule === "trilha" ? "Só as paradas numeradas da trilha servem." : "Casas apagadas já estão fechadas pela regra do lugar."}</>}</p>
    </div>
  );
}
