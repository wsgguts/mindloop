"use client";
// Painéis da investigação (os mesmos para os 5 jogos), ao lado do tabuleiro do cenário:
//   Pistas             — a regra do lugar, lembretes e as pistas numeradas. Cada pista mostra a grade que ela afeta
//                        (📍 Linha, 🏛️ Cômodo, 🎁 Objeto…); tocar nela acende quem e o que ela cita e as células da grade;
//   Quadro de decisões — uma grade por tipo de informação (personagens × linha, coluna, cômodo, objeto…), em abas;
//                        cada célula: vazio → ✗ → ✓. Com a "Ajuda automática", cada ✓ preenche os ✗ óbvios (mais claros);
//   Sua resposta       — para cada pessoa, o local e o objeto escolhidos (seletores), e o Verificar.
import type { Case, HintInfo } from "../../lib/cases/catalog";
import type { Dim } from "../../lib/cases/grids";
import { type Model, cellName, objectsOf, peopleOf, roomOf, stopOf, unitOf, units } from "../../lib/cases/model";
import { type Focus, type Marks, type Pick, MARK_NO, MARK_YES, markKey } from "../../lib/cases/relations";
import Art from "../Art";
import TangoSymbol from "../TangoSymbol";

/** Nome de um lugar na resposta: "B2 · Cozinha" (no Zip, com a parada; no Patches, só o cômodo). */
export function placeName(m: Model, v: number): string {
  const room = m.scene.rooms[roomOf(m, v)].label;
  if (m.rule === "comodos") return room;
  return m.trail ? `Parada ${stopOf(m, v) + 1} · ${room}` : `${cellName(m, v)} · ${room}`;
}

// ---------------------------------------------------------------- Pistas

interface CluesProps {
  c: Case; states: (boolean | null)[]; ruleState: boolean | null; crossed: Set<number>; fresh: Set<number>; broken: number | null;
  /** Dica atual (nível 1 a 3 revelado) — ou null. */
  hint: { info: HintInfo; level: number } | null;
  focus: Focus; pick: Pick; onPick: (p: Pick) => void; onCross: (i: number) => void;
}
export function CluesPanel({ c, states, ruleState, crossed, fresh, broken, hint, focus, pick, onPick, onCross }: CluesProps) {
  return (
    <div className="cx-cluebox">
      <ul className="cx-rules" aria-label="Regra do lugar">
        {c.ruleTexts.map((t, i) => (
          <li key={i} className={ruleState === false || broken === -1 ? "bad" : ruleState ? "ok" : ""}><span className="cx-st" aria-hidden="true">{ruleState === false ? "✗" : ruleState ? "✓" : "★"}</span>{t}</li>
        ))}
        {c.notes.map((t, i) => <li key={`n${i}`} className="note"><span className="cx-st" aria-hidden="true">★</span>{t}</li>)}
      </ul>
      <ol className="cx-says">
        {c.clueTexts.map((t, k) => {
          const st = states[k];
          const isP = pick?.t === "clue" && pick.i === k;
          const dim = c.dims[c.clueDims[k]];
          const hinted = !!hint && hint.info.clue === k;
          const cls = [crossed.has(k) && "x", st === true && "ok", (st === false || broken === k) && "bad", fresh.has(k) && "fresh", isP && "pick", !isP && focus.clues.has(k) && "lit", hinted && "hinted"].filter(Boolean).join(" ");
          const icons = [...peopleOf(c.model, c.clues[k]).map((i) => c.model.people[i]), ...objectsOf(c.clues[k]).map((o) => c.model.objects[o])];
          return (
            <li key={k} className={cls}>
              <button className="cx-say" onClick={() => onPick(isP ? null : { t: "clue", i: k })} aria-pressed={isP}
                aria-label={`Pista ${k + 1}, grade ${dim.title}: ${t}${st === true ? " — confere com sua resposta" : st === false ? " — contrariada" : ""}. Toque para destacar no quadro.`}>
                <b className="cx-n">{k + 1}</b>
                <span className="cx-t">
                  <span className="cx-tag" aria-hidden="true">{dim.icon} {dim.title}</span>
                  {t}<span className="cx-icons" aria-hidden="true">{icons.map((e, j) => <Art key={j} e={e} />)}</span>
                </span>
                <span className="cx-st" aria-hidden="true">{st === true ? "✓" : st === false ? "✗" : ""}</span>
              </button>
              <button className="cx-cross" onClick={() => onCross(k)} aria-pressed={crossed.has(k)} aria-label={crossed.has(k) ? `Desmarcar a pista ${k + 1}` : `Riscar a pista ${k + 1} (já usei)`} title={crossed.has(k) ? "Desmarcar" : "Já usei"}>{crossed.has(k) ? "↺" : "✓"}</button>
            </li>
          );
        })}
      </ol>
      {hint && (
        <ol className="cx-hints" aria-label="Dica" aria-live="polite">
          {hint.info.texts.slice(0, hint.level).map((h, i) => <li key={i}><b>Dica {i + 1}</b>{h}</li>)}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Quadro de decisões

interface GridsProps {
  c: Case; marks: Marks; auto: Set<string>; autoOn: boolean; tab: number; focus: Focus; done: boolean;
  /** Célula apontada pela dica (nível 2+). */
  hintCell: { d: number; s: number; v: number } | null;
  onTab: (d: number) => void; onCycle: (d: number, s: number, v: number) => void; onAuto: (on: boolean) => void;
  /** Tocar no desenho de um objeto abre a ficha dele. */
  onObject?: (o: number) => void;
}

/** Cabeçalho de uma coluna da grade: objeto com desenho, lado do Tango com o símbolo, o resto em texto. */
function ValueHead({ c, dim, v, onObject }: { c: Case; dim: Dim; v: number; onObject?: (o: number) => void }) {
  if (dim.id === "obj") {
    const pic = <span className="dg-pic" aria-hidden="true"><Art e={c.model.objects[v]} className="fill" /></span>;
    // Palavra comprida ("Pergaminho", "Termômetro"): letra um pouco menor, para caber inteira na coluna estreita.
    const long = Math.max(...dim.values[v].short.split(/[ -]/).map((w) => w.length)) > 9;
    return <>{onObject ? <button type="button" className="dg-objbtn" onClick={() => onObject(v)} aria-label={`Ficha do objeto: ${c.model.objects[v].label}`}>{pic}</button> : pic}<span className={`dg-vname${long ? " long" : ""}`}>{dim.values[v].short}</span></>;
  }
  if (dim.id === "side") return <><span className="dg-sym" aria-hidden="true"><TangoSymbol v={v === 0 ? 1 : 2} size={22} /></span><span className="dg-vname">{dim.values[v].short}</span></>;
  return <span className={`dg-vname${dim.values[v].short.length <= 2 ? " big" : ""}`}>{dim.values[v].short}</span>;
}

export function DecisionGrids({ c, marks, auto, autoOn, tab, focus, done, hintCell, onTab, onCycle, onAuto, onObject }: GridsProps) {
  const m = c.model, n = m.people.length;
  const dim = c.dims[tab];
  const yesIn = (d: number) => Array.from({ length: n }, (_, s) => s).filter((s) => c.dims[d].values.some((_, v) => marks.get(markKey(d, s, v)) === MARK_YES)).length;
  const lit = focus.grid && focus.grid.d === tab ? focus.grid : null;
  const tr = dim.values.length > 5;
  const cell = (s: number, v: number, who: string, what: string) => {
    const k = markKey(tab, s, v), st = marks.get(k), isAuto = st === undefined && autoOn && auto.has(k);
    const hl = lit && lit.s === s && lit.vs.includes(v), hint = hintCell && hintCell.d === tab && hintCell.s === s && hintCell.v === v;
    return (
      <td key={tr ? s : v} className={[st === MARK_NO && "no", st === MARK_YES && "yes", isAuto && "auto", hl && "lit", hint && "hinted"].filter(Boolean).join(" ")}>
        <button disabled={done} onClick={() => onCycle(tab, s, v)}
          aria-label={`${who} — ${what}: ${st === MARK_YES ? "✓ sim" : st === MARK_NO ? "✗ não" : isAuto ? "✗ automático" : "vazio"}. Toque para trocar.`}>
          {st === MARK_YES ? <span aria-hidden="true">✓</span> : st === MARK_NO || isAuto ? <span aria-hidden="true">✕</span> : null}
        </button>
      </td>
    );
  };
  return (
    <div className="dg">
      <div className="dg-tabs" role="tablist" aria-label="Grades do quadro">
        {c.dims.map((d, i) => (
          <button key={i} role="tab" aria-selected={i === tab} className={`dg-tab${i === tab ? " on" : ""}${focus.grid?.d === i ? " lit" : ""}${hintCell?.d === i ? " hinted" : ""}`} onClick={() => onTab(i)}>
            <span aria-hidden="true">{d.icon}</span> {d.title}<small>{yesIn(i)}/{n}</small>
          </button>
        ))}
      </div>
      <div className="dg-wrap" role="tabpanel">
        {/* Grade larga (o Zip tem até 8 paradas): invertida — valores nas fileiras e personagens nas colunas, para os
            nomes caberem inteiros no celular. A célula e o que ela significa são os mesmos. */}
        <table className={`dg-grid cols-${tr ? n : dim.values.length}${tr ? " tr" : ""}`} aria-label={`Grade ${dim.title}: ${tr ? `${dim.title.toLowerCase()} nas fileiras, personagens nas colunas` : `personagens nas fileiras, ${dim.title.toLowerCase()} nas colunas`}. Cada toque: vazio, ✗, ✓.`}>
          <thead>
            <tr>
              <th scope="col"><span className="sr">{tr ? dim.title : "Personagem"}</span></th>
              {tr
                ? m.people.map((p, s) => <th key={s} scope="col" className={focus.people.has(s) || lit?.s === s ? "lit" : ""}><span className="dg-pic dg-ppic" aria-hidden="true"><Art e={p} className="fill" /></span><span className="dg-vname">{p.label}</span></th>)
                : dim.values.map((x, v) => <th key={v} scope="col" className={lit?.vs.includes(v) ? "lit" : ""} title={x.label}><ValueHead c={c} dim={dim} v={v} onObject={onObject} /></th>)}
            </tr>
          </thead>
          <tbody>
            {tr
              ? dim.values.map((x, v) => (
                <tr key={v} className={lit?.vs.includes(v) ? "lit" : ""}>
                  <th scope="row"><span className="dg-row"><span className="dg-rname dg-vlabel">{x.label}</span></span></th>
                  {m.people.map((p, s) => cell(s, v, p.label, x.label))}
                </tr>
              ))
              : m.people.map((p, s) => (
                <tr key={s} className={focus.people.has(s) || lit?.s === s ? "lit" : ""}>
                  <th scope="row"><span className="dg-row"><span className="dg-rpic" aria-hidden="true"><Art e={p} className="fill" /></span><span className="dg-rname">{p.label}</span></span></th>
                  {dim.values.map((x, v) => cell(s, v, p.label, x.label))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="dg-foot">
        <small>Toque: vazio → ✕ → ✓</small>
        <label className="dg-auto"><input type="checkbox" checked={autoOn} disabled={done} onChange={(e) => onAuto(e.target.checked)} /> Ajuda automática</label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Sua resposta

interface AnswerProps {
  m: Model; a: number[]; done: boolean;
  onPlace: (s: number, v: number) => void;
  onGive: (s: number, o: number) => void;
}
export function AnswerPanel({ m, a, done, onPlace, onGive }: AnswerProps) {
  const n = m.people.length;
  // No Patches a resposta é o cômodo: uma opção por cômodo (vale qualquer casa livre dele).
  const places = units(m);
  const at = (s: number) => unitOf(m, a[s]);
  const owner = (u: number) => a.slice(0, n).findIndex((w) => w >= 0 && unitOf(m, w) === u);
  return (
    <ul className="cx-answers">
      {m.people.map((p, s) => (
        <li key={s} className={a[s] >= 0 && a[n + s] >= 0 ? "set" : ""}>
          <span className="cx-ans-who"><span aria-hidden="true"><Art e={p} /></span>{p.label}</span>
          <label className="cx-ans-field">
            <span>Local</span>
            <select value={at(s)} disabled={done} onChange={(e) => onPlace(s, Number(e.target.value))} aria-label={`Local de ${p.label}`}>
              <option value={-1}>Selecione…</option>
              {places.map((v) => { const o = owner(v); return <option key={v} value={v}>{placeName(m, v)}{o >= 0 && o !== s ? ` (com ${m.people[o].label})` : ""}</option>; })}
            </select>
          </label>
          <label className="cx-ans-field">
            <span>Objeto</span>
            <select value={a[n + s]} disabled={done} onChange={(e) => onGive(s, Number(e.target.value))} aria-label={`Objeto de ${p.label}`}>
              <option value={-1}>Selecione…</option>
              {m.objects.map((o, i) => <option key={i} value={i}>{o.icon} {o.label}{a.slice(n).indexOf(i) >= 0 && a[n + s] !== i ? ` (com ${m.people[a.slice(n).indexOf(i)].label})` : ""}</option>)}
            </select>
          </label>
        </li>
      ))}
    </ul>
  );
}

export { MARK_NO, MARK_YES };
