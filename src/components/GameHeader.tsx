"use client";
import Gem, { type GemKind } from "./Gem";
import { formatTime, spokenTime } from "../lib/records";

interface Props { kind: GemKind; title: string; subtitle: string; ms: number; done: boolean }

// Cabeçalho comum das partidas: cristal + nome do nível + cronômetro.
// O cronômetro "gruda" no topo da tela ao rolar, então fica visível durante toda a partida.
export default function GameHeader({ kind, title, subtitle, ms, done }: Props) {
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
      <div className="title game-title"><Gem kind={kind} size={48} /><div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div></div>
    </>
  );
}
