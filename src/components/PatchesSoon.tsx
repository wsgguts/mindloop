"use client";
import Gem from "./Gem";
import { PATCHES_META } from "../lib/games";

// Tabuleiro ilustrativo do Patches (5×5): peças retangulares que se encaixam cobrindo a grade.
// Cada peça mostra quantas casas ocupa. Algumas já estão no lugar; as outras aparecem só como contorno,
// e uma delas "encaixa" em loop — dando a ideia do jogo sem permitir uma partida.
type Piece = { r: number; c: number; h: number; w: number; color: string; placed: boolean; clue: [number, number]; moving?: boolean };
const PIECES: Piece[] = [
  { r: 0, c: 0, h: 2, w: 2, color: "#F05BC8", placed: true, clue: [0, 0] },
  { r: 0, c: 2, h: 1, w: 3, color: "#12CFE0", placed: true, clue: [0, 3] },
  { r: 1, c: 2, h: 1, w: 1, color: "#FFD23F", placed: false, clue: [1, 2] },
  { r: 1, c: 3, h: 2, w: 2, color: "#9A6BFF", placed: true, clue: [2, 4] },
  { r: 2, c: 0, h: 3, w: 1, color: "#4FD6B1", placed: true, clue: [3, 0] },
  { r: 2, c: 1, h: 2, w: 2, color: "#FFB020", placed: false, clue: [2, 2], moving: true },
  { r: 3, c: 3, h: 2, w: 2, color: "#F05BC8", placed: false, clue: [4, 4] },
  { r: 4, c: 1, h: 1, w: 2, color: "#12CFE0", placed: true, clue: [4, 1] },
];
const N = 5;

function PatchesBoard() {
  return (
    <div className="pboard" aria-hidden="true">
      {Array.from({ length: N * N }, (_, i) => <span key={i} className="pcell" style={{ gridRow: Math.floor(i / N) + 1, gridColumn: (i % N) + 1 }} />)}
      {PIECES.map((p, i) => (
        <span key={i} className={`ppiece${p.placed ? " placed" : ""}${p.moving ? " moving" : ""}`}
          style={{ "--pc": p.color, "--ph": p.h, "--pw": p.w, gridRow: `${p.r + 1} / span ${p.h}`, gridColumn: `${p.c + 1} / span ${p.w}` } as React.CSSProperties}>
          <b style={{ gridRow: p.clue[0] - p.r + 1, gridColumn: p.clue[1] - p.c + 1 }}>{p.h * p.w}</b>
        </span>
      ))}
    </div>
  );
}

export default function PatchesSoon({ onBack }: { onBack: () => void }) {
  return (
    <div className="patches" style={{ "--gc": PATCHES_META.color } as React.CSSProperties}>
      <button className="back" onClick={onBack}>‹ Início</button>
      <section className="psoon" aria-labelledby="patches-title">
        <div className="psoon-hero">
          <div className="psoon-gem"><Gem kind="patches" size={120} /></div>
          <span className="pstatus"><span className="pdot" aria-hidden="true" />Em desenvolvimento</span>
          <h1 id="patches-title">Patches</h1>
          <p className="psoon-tag">{PATCHES_META.text}</p>
        </div>

        <PatchesBoard />

        <div className="psoon-body">
          <p className="psoon-big">Em breve</p>
          <p>O Patches já faz parte do MindLoop e está sendo preparado com o mesmo cuidado do Mini Sudoku, do Zip e do Tango.
            A ideia: encaixar peças retangulares até cobrir toda a grade, usando os números como pistas do tamanho de cada peça.</p>
          <p className="psoon-sub">O que estamos preparando:</p>
          <ul className="psoon-list">
            <li>Uma jornada própria, com capítulos e níveis</li>
            <li>Regras explicadas passo a passo e dicas que ensinam</li>
            <li>Cronômetro e tela de conquista, como nos outros jogos</li>
          </ul>
          <button className="btn psoon-btn" disabled aria-describedby="patches-title">Jogar — em breve</button>
          <p className="psoon-hint">Enquanto isso, que tal uma partida de Mini Sudoku, Zip ou Tango?</p>
          <button className="btn cta" onClick={onBack}>Ver os jogos disponíveis</button>
        </div>
      </section>
    </div>
  );
}
