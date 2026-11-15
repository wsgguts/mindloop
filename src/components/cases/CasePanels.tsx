"use client";
// Painéis da investigação (os mesmos para os 5 jogos), ao lado do tabuleiro do cenário:
//   Quadro de decisões — anotações da pessoa: "Onde?" (um mapa só; cada casa: vazio → ✕ → personagem) e "O quê?"
//                        (personagens × objetos; cada casa: vazio → ✕ → ✓). Nada aqui é preenchido sozinho nem conta
//                        como resposta;
//   Pistas             — a regra do lugar, lembretes e as pistas numeradas (tocar acende quem e o que a pista cita);
//   Sua resposta       — para cada pessoa, o local e o objeto escolhidos (seletores), e o Verificar.
import type { Case } from "../../lib/cases/catalog";
import { type Model, allowedCells, blockedCells, cellName, objectsOf, peopleOf, propAt, roomOf, stopOf } from "../../lib/cases/model";
import { type Focus, type Notes, type Pick, GRID_NO, GRID_YES, gridKey } from "../../lib/cases/relations";
import Art from "../Art";
import { floorOf } from "./CaseBoard";

/** Nome de uma casa na resposta: "B2 · Cozinha" (no Zip, com a parada). */
export function placeName(m: Model, v: number): string {
  const room = m.scene.rooms[roomOf(m, v)].label;
  return m.trail ? `Parada ${stopOf(m, v) + 1} · ${room}` : `${cellName(m, v)} · ${room}`;
}

// ---------------------------------------------------------------- Pistas

interface CluesProps {
  c: Case; states: (boolean | null)[]; ruleState: boolean | null; crossed: Set<number>; fresh: Set<number>; broken: number | null;
  hints: number; focus: Focus; pick: Pick; onPick: (p: Pick) => void; onCross: (i: number) => void;
}
export function CluesPanel({ c, states, ruleState, crossed, fresh, broken, hints, focus, pick, onPick, onCross }: CluesProps) {
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
          const cls = [crossed.has(k) && "x", st === true && "ok", (st === false || broken === k) && "bad", fresh.has(k) && "fresh", isP && "pick", !isP && focus.clues.has(k) && "lit"].filter(Boolean).join(" ");
          const icons = [...peopleOf(c.model, c.clues[k]).map((i) => c.model.people[i]), ...objectsOf(c.clues[k]).map((o) => c.model.objects[o])];
          return (
            <li key={k} className={cls}>
              <button className="cx-say" onClick={() => onPick(isP ? null : { t: "clue", i: k })} aria-pressed={isP}
                aria-label={`Pista ${k + 1}: ${t}${st === true ? " — confere com sua resposta" : st === false ? " — contrariada" : ""}. Toque para destacar quem e o que ela cita.`}>
                <b className="cx-n">{k + 1}</b>
                <span className="cx-t">{t}<span className="cx-icons" aria-hidden="true">{icons.map((e, j) => <Art key={j} e={e} />)}</span></span>
                <span className="cx-st" aria-hidden="true">{st === true ? "✓" : st === false ? "✗" : ""}</span>
              </button>
              <button className="cx-cross" onClick={() => onCross(k)} aria-pressed={crossed.has(k)} aria-label={crossed.has(k) ? `Desmarcar a pista ${k + 1}` : `Riscar a pista ${k + 1} (já usei)`} title={crossed.has(k) ? "Desmarcar" : "Já usei"}>{crossed.has(k) ? "↺" : "✓"}</button>
            </li>
          );
        })}
      </ol>
      {hints > 0 && (
        <ol className="cx-hints" aria-label="Dicas reveladas">
          {c.hints.slice(0, hints).map((h, i) => <li key={i}><b>Dica {i + 1}</b>{h}</li>)}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Quadro de decisões

interface DecideProps {
  m: Model; cells: Notes; grid: Notes; focus: Focus; done: boolean;
  onCell: (v: number) => void; onGrid: (s: number, o: number) => void;
}
const noteText = (m: Model, w: number | undefined) => (w === undefined ? "vazio" : w < 0 ? "X" : m.people[w].label);

/** "Onde?": um mapa só (cada casa: vazio → ✕ → personagem). "O quê?": personagens × objetos (vazio → ✕ → ✓). */
export function DecisionBoard({ m, cells, grid, focus, done, onCell, onGrid }: DecideProps) {
  const blocked = blockedCells(m);
  const allowed = new Set(allowedCells(m));
  return (
    <div className="dx">
      <p className="cx-area-lead">Anote o que você já descobriu. Nada aqui é preenchido sozinho nem conta como resposta.</p>
      <h3 className="cx-sub">Onde? <small>cada toque: vazio → ✕ → personagem</small></h3>
      <div className="dx-map" style={{ gridTemplateColumns: `repeat(${m.cols}, 1fr)`, "--cols": m.cols } as React.CSSProperties} role="group" aria-label="Onde: anotações em cada casa do lugar">
        {Array.from({ length: m.rows * m.cols }, (_, v) => {
          const bl = blocked.has(v), off = !allowed.has(v) && !bl, w = cells.get(v), prop = propAt(m, v);
          return (
            <button key={v} disabled={done || bl || off} onClick={() => onCell(v)}
              className={`dx-c${bl ? " block" : off ? " offtrail" : w === undefined ? "" : w < 0 ? " no" : " who"}${focus.cells.has(v) ? " lit" : ""}`}
              style={{ "--floor": floorOf(m, v) } as React.CSSProperties}
              aria-label={`Casa ${cellName(m, v)}: ${bl ? `bloqueada (${prop?.label})` : off ? "fora da trilha" : `${noteText(m, w)}. Toque para trocar.`}`}>
              {bl ? <span className="dx-prop" aria-hidden="true">{prop && <Art e={prop} className="fill" />}</span>
                : w === undefined ? <small aria-hidden="true">{m.trail ? stopOf(m, v) + 1 : cellName(m, v)}</small>
                : w < 0 ? <span className="dx-x" aria-hidden="true">✕</span>
                : <span className="dx-face" aria-hidden="true"><Art e={m.people[w]} className="fill" /></span>}
            </button>
          );
        })}
      </div>
      <h3 className="cx-sub">O quê? <small>cada toque: vazio → ✕ (não tinha) → ✓ (tinha)</small></h3>
      <div className="dx-grid-wrap">
        <table className="dx-grid" aria-label="Quem tinha o quê: personagens nas linhas, objetos nas colunas. Toque para alternar entre vazio, X e ✓.">
          <thead>
            <tr>
              <th scope="col"><span className="sr">Personagem</span></th>
              {m.objects.map((o, i) => (
                <th key={i} scope="col" className={focus.objects.has(i) ? "lit" : ""}>
                  <span className="dx-th-pic" aria-hidden="true"><Art e={o} className="fill" /></span>
                  <span className="dx-th-name">{o.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.people.map((p, sIdx) => (
              <tr key={sIdx} className={focus.people.has(sIdx) ? "lit" : ""}>
                <th scope="row"><span className="dx-row"><span className="dx-row-pic" aria-hidden="true"><Art e={p} className="fill" /></span><span className="dx-row-name">{p.label}</span></span></th>
                {m.objects.map((o, i) => {
                  const st = grid.get(gridKey(sIdx, i));
                  return (
                    <td key={i} className={`${st === GRID_NO ? "no" : st === GRID_YES ? "yes" : ""}${focus.objects.has(i) && focus.people.has(sIdx) ? " both" : ""}`}>
                      <button disabled={done} onClick={() => onGrid(sIdx, i)}
                        aria-label={`${p.label} — ${o.label}: ${st === GRID_NO ? "não tinha (X)" : st === GRID_YES ? "tinha (✓)" : "vazio"}. Toque para trocar.`}>
                        {st === GRID_NO ? <span className="dx-x" aria-hidden="true">✕</span> : st === GRID_YES ? <span className="dx-ok" aria-hidden="true">✓</span> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
  const cells = allowedCells(m);
  return (
    <ul className="cx-answers">
      {m.people.map((p, s) => (
        <li key={s} className={a[s] >= 0 && a[n + s] >= 0 ? "set" : ""}>
          <span className="cx-ans-who"><span aria-hidden="true"><Art e={p} /></span>{p.label}</span>
          <label className="cx-ans-field">
            <span>Local</span>
            <select value={a[s]} disabled={done} onChange={(e) => onPlace(s, Number(e.target.value))} aria-label={`Local de ${p.label}`}>
              <option value={-1}>Selecione…</option>
              {cells.map((v) => <option key={v} value={v}>{placeName(m, v)}{a.slice(0, n).indexOf(v) >= 0 && a[s] !== v ? ` (com ${m.people[a.indexOf(v)].label})` : ""}</option>)}
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
