"use client";
// Fichas do caso (narrativas/<jogo>.ts): personagens — personalidade, por que estão ali e a ligação com um objeto ou
// outro personagem — e objetos — descrição, papel na história e por que existem naquele lugar.
// Só texto: nada aqui muda a lógica do caso.
import { useState } from "react";
import Art from "../Art";
import Modal from "../Modal";
import type { Case } from "../../lib/cases/catalog";

/** A ficha de um objeto. */
function ObjectSheet({ c, i, on }: { c: Case; i: number; on?: boolean }) {
  const o = c.objectCards[i];
  return (
    <li className={on ? "on" : undefined}>
      <span className="cx-sheet-pic" aria-hidden="true"><Art e={c.model.objects[i]} className="fill" /></span>
      <div>
        <b>{o.label}</b> <span className="cx-role">{o.role}</span>
        <p>{o.desc}</p>
        <p className="cx-sheet-place"><span className="cx-sheet-k">Onde fica:</span> {o.place}</p>
      </div>
    </li>
  );
}

/** As duas fichas completas: personagens e objetos. */
export function CaseSheets({ c }: { c: Case }) {
  const m = c.model;
  return (
    <div className="cx-sheets">
      {c.sceneLine && <p className="cx-scene-line">{c.sceneLine}</p>}
      <h3 className="cx-sheet-t">Personagens</h3>
      <ul className="cx-sheet-list" aria-label="Fichas dos personagens">
        {c.cast.map((p, i) => (
          <li key={i}>
            <span className="cx-sheet-pic round" aria-hidden="true"><Art e={m.people[i]} className="fill" /></span>
            <div>
              <b>{p.name}</b>
              {p.bio && <small className="cx-sheet-bio">{p.bio}</small>}
              {p.why && <p><span className="cx-sheet-k">Por que está aqui:</span> {p.why}</p>}
              {p.link && <p><span className="cx-sheet-k">Ligação:</span> {p.link}</p>}
            </div>
          </li>
        ))}
      </ul>
      {c.objectCards.length > 0 && <>
        <h3 className="cx-sheet-t">Objetos</h3>
        <ul className="cx-sheet-list" aria-label="Fichas dos objetos">
          {c.objectCards.map((_, i) => <ObjectSheet key={i} c={c} i={i} />)}
        </ul>
      </>}
    </div>
  );
}

/** As fichas numa janela sobre a tela (o jogo continua por baixo). Com `focus`, abre só a ficha daquele objeto
 *  (quem tocou no desenho dele), com um botão para ver todas. */
export function SheetsModal({ c, focus, onClose }: { c: Case; focus?: number; onClose: () => void }) {
  const [all, setAll] = useState(focus === undefined);
  if (all || focus === undefined) return <Modal title="Fichas do caso" onClose={onClose}><CaseSheets c={c} /></Modal>;
  return (
    <Modal title="Ficha do objeto" onClose={onClose}>
      <div className="cx-sheets">
        <ul className="cx-sheet-list"><ObjectSheet c={c} i={focus} on /></ul>
        <button type="button" className="btn sec sm" onClick={() => setAll(true)}>🗂️ Ver todas as fichas</button>
      </div>
    </Modal>
  );
}

