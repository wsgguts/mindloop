"use client";
import Gem, { type GemKind } from "./Gem";
import { formatTime, spokenTime } from "../lib/records";

interface Props { kind: GemKind; title: string; subtitle: string; ms: number; done: boolean; children?: React.ReactNode; /** Abre o tutorial ("Como jogar"). */ onHelp?: () => void; /** Volta à jornada do jogo. */ onBack?: () => void }

// Cabeçalho comum das partidas: cristal + nome do nível + cronômetro.
// O cronômetro "gruda" no topo da tela ao rolar, então fica visível durante toda a partida.
// `children` (barra de progresso) entra no mesmo bloco: no celular deitado ele vira a coluna ao lado do tabuleiro.
export default function GameHeader({ kind, title, subtitle, ms, done, children, onHelp, onBack }: Props) {
  return (
    <>
      <div className="gtimer-slot">
        <span className={`gtimer${done ? " done" : ""}`} role="timer" aria-live="off"
          aria-label={done ? `Tempo final: ${spokenTime(ms)}` : `Tempo de jogo: ${spokenTime(ms)}`}>
          {done ? (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17 19 7" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9.5 2.5h5" /></svg>
          )}
          <time aria-hidden="true">{formatTime(ms)}</time>
        </span>
      </div>
      <div className="ghead">
      <div className="title game-title">{onBack && <button type="button" className="gback" onClick={onBack} aria-label="Voltar aos níveis da jornada" title="Níveis"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>}<Gem kind={kind} size={48} /><div>
        <h1>{title}{onHelp && <button type="button" className="ghelp" onClick={onHelp} aria-label="Como jogar: abrir o tutorial" title="Como jogar"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><path d="M12 17.6h.01" /></svg></button>}</h1>
        <p className="muted">{subtitle}</p>
      </div></div>
      {children && <div className="gprogress">{children}</div>}
      </div>
    </>
  );
}
