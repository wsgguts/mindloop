"use client";
// Painéis da investigação (os mesmos para os 5 jogos):
//   Personagens · Objetos (à esquerda) — retratos e ícones; tocar acende as pistas e casas ligadas;
//   Pistas (sob o cenário)           — a regra do lugar, lembretes e as pistas numeradas;
//   Dedução (à direita)              — dois quadros só de X: "Onde?" (mini-mapa por pessoa) e "O quê?" (objetos);
//   Sua resposta (à direita)         — para cada pessoa, o local e o objeto escolhidos (seletores), e o Verificar.
// Nada no quadro de dedução é marcado sozinho: é a ferramenta de raciocínio da pessoa.
import type { Case } from "../../lib/cases/catalog";
import { type Model, allowedCells, blockedCells, cellName, objectsOf, peopleOf, propAt, roomOf, stopOf } from "../../lib/cases/model";
import { type Focus, type Pick, markKey, objMarkKey } from "../../lib/cases/relations";
import { ROOM_TINTS } from "./CaseBoard";

const TINTS = ["#F05BC8", "#12CFE0", "#FFB020", "#9A6BFF", "#4FD6B1", "#FF7A59"];

/** Nome de uma casa na resposta: "B2 · Cozinha" (no Zip, com a parada). */
export function placeName(m: Model, v: number): string {
  const room = m.scene.rooms[roomOf(m, v)].label;
  return m.trail ? `Parada ${stopOf(m, v) + 1} · ${room}` : `${cellName(m, v)} · ${room}`;
}

// ---------------------------------------------------------------- Personagens e objetos

interface CastProps { m: Model; a: number[]; focus: Focus; pick: Pick; sel: number | null; onPick: (p: Pick) => void }
export function PeoplePanel({ m, a, focus, pick, sel, onPick }: CastProps) {
  const n = m.people.length;
  return (
    <ul className="cx-portraits" aria-label="Personagens">
      {m.people.map((p, i) => {
        const isPick = pick?.t === "person" && pick.i === i;
        const where = a[i] >= 0 ? cellName(m, a[i]) : "?";
        const what = a[n + i] >= 0 ? m.objects[a[n + i]].icon : "";
        return (
          <li key={i}>
            <button className={`cx-face${isPick || sel === i ? " pick" : ""}${!isPick && focus.people.has(i) ? " lit" : ""}${a[i] >= 0 ? " placed" : ""}`}
              style={{ "--tint": TINTS[i % TINTS.length] } as React.CSSProperties} aria-pressed={isPick}
              onClick={() => onPick(isPick ? null : { t: "person", i })}
              aria-label={`${p.label}: ${a[i] >= 0 ? `em ${placeName(m, a[i])}` : "sem lugar"}${a[n + i] >= 0 ? `, com ${m.objects[a[n + i]].label}` : ""}. Toque para destacar as pistas e escolher a casa.`}>
              <span className="cx-face-pic" aria-hidden="true">{p.icon ?? "🙂"}</span>
              <span className="cx-face-name">{p.label}</span>
              <span className="cx-face-ans" aria-hidden="true">{where}{what && <i>{what}</i>}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ObjectsPanel({ m, a, focus, pick, onPick }: Omit<CastProps, "sel">) {
  const n = m.people.length;
  return (
    <ul className="cx-items" aria-label="Objetos">
      {m.objects.map((o, i) => {
        const isPick = pick?.t === "object" && pick.i === i;
        const owner = a.slice(n).indexOf(i);
        return (
          <li key={i}>
            <button className={`cx-item${isPick ? " pick" : ""}${!isPick && focus.objects.has(i) ? " lit" : ""}${owner >= 0 ? " owned" : ""}`} aria-pressed={isPick}
              onClick={() => onPick(isPick ? null : { t: "object", i })}
              aria-label={`${o.label}${owner >= 0 ? `, com ${m.people[owner].label} na sua resposta` : ""}. Toque para destacar as pistas que falam dele.`}>
              <span className="cx-item-pic" aria-hidden="true">{o.icon}</span>
              <span className="cx-item-name">{o.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
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
          const icons = [...peopleOf(c.model, c.clues[k]).map((i) => c.model.people[i].icon), ...objectsOf(c.clues[k]).map((o) => c.model.objects[o].icon)];
          return (
            <li key={k} className={cls}>
              <button className="cx-say" onClick={() => onPick(isP ? null : { t: "clue", i: k })} aria-pressed={isP}
                aria-label={`Pista ${k + 1}: ${t}${st === true ? " — confere com sua resposta" : st === false ? " — contrariada" : ""}. Toque para destacar quem e o que ela cita.`}>
                <b className="cx-n">{k + 1}</b>
                <span className="cx-t">{t}<span className="cx-icons" aria-hidden="true">{icons.join(" ")}</span></span>
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

// ---------------------------------------------------------------- Dedução (só X)

interface DedProps { m: Model; marks: Set<number>; focus: Focus; done: boolean; onToggle: (key: number) => void }

/** "Onde?": um mini-mapa do cenário por personagem; X nas casas descartadas. */
export function WhereGrid({ m, marks, focus, done, onToggle }: DedProps) {
  const blocked = blockedCells(m);
  const allowed = new Set(allowedCells(m));
  return (
    <ul className="cx-minimaps">
      {m.people.map((p, s) => {
        const left = [...allowed].filter((v) => !marks.has(markKey(m, s, v))).length;
        return (
          <li key={s} className={focus.people.has(s) ? "lit" : ""}>
            <p className="cx-mm-name"><span aria-hidden="true">{p.icon}</span><b>{p.label}</b><small className={left === 1 ? "one" : ""}>{left}</small></p>
            <div className="cx-mm" style={{ gridTemplateColumns: `repeat(${m.cols}, 1fr)` }} role="group" aria-label={`Onde pode estar ${p.label}. Toque para marcar ou tirar um X.`}>
              {Array.from({ length: m.rows * m.cols }, (_, v) => {
                const no = marks.has(markKey(m, s, v));
                const bl = blocked.has(v), off = !allowed.has(v) && !bl;
                const prop = propAt(m, v);
                return (
                  <button key={v} disabled={done || bl || off} onClick={() => onToggle(markKey(m, s, v))} aria-pressed={no}
                    className={`${bl ? "block" : off ? "offtrail" : no ? "no" : ""}${focus.cells.has(v) ? " lit" : ""}`}
                    style={{ "--floor": ROOM_TINTS[roomOf(m, v) % ROOM_TINTS.length] } as React.CSSProperties}
                    aria-label={`${p.label} em ${cellName(m, v)}: ${bl ? `bloqueada (${prop?.label})` : off ? "fora da trilha" : no ? "descartada" : "possível"}`}>
                    {bl ? <span aria-hidden="true">{prop?.icon}</span> : no ? "✕" : null}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** "O quê?": tabela personagens × objetos; X nas combinações descartadas. */
export function WhatGrid({ m, marks, focus, done, onToggle }: DedProps) {
  return (
    <div className="cx-dgrid-wrap">
      <table className="cx-dgrid" aria-label="Quem tinha o quê: personagens nas linhas, objetos nas colunas. Toque para marcar ou tirar um X.">
        <thead>
          <tr>
            <th scope="col"><span className="sr">Personagem</span></th>
            {m.objects.map((o, i) => <th key={i} scope="col" className={focus.objects.has(i) ? "lit" : ""} title={o.label}><span aria-hidden="true">{o.icon}</span><span className="sr">{o.label}</span></th>)}
          </tr>
        </thead>
        <tbody>
          {m.people.map((p, s) => (
            <tr key={s} className={focus.people.has(s) ? "lit" : ""}>
              <th scope="row"><span aria-hidden="true">{p.icon}</span> {p.label}</th>
              {m.objects.map((o, i) => {
                const no = marks.has(objMarkKey(m, s, i));
                return (
                  <td key={i} className={`${no ? "no" : ""}${focus.objects.has(i) && focus.people.has(s) ? " both" : ""}`}>
                    <button disabled={done} onClick={() => onToggle(objMarkKey(m, s, i))} aria-pressed={no}
                      aria-label={`${p.label} — ${o.label}: ${no ? "descartado (toque para tirar o X)" : "possível (toque para marcar X)"}`}>{no ? "✕" : ""}</button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
          <span className="cx-ans-who"><span aria-hidden="true">{p.icon}</span>{p.label}</span>
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
