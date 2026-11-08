"use client";

// Botão flutuante de opinião, presente em todas as telas.
// `compact`: só o ícone (na partida e na jornada, para não cobrir o tabuleiro nem o "Ir para o nível").
export default function FeedbackFab({ onOpen, compact = false }: { onOpen: () => void; compact?: boolean }) {
  return (
    <button type="button" className={`fab${compact ? " compact" : ""}`} onClick={onOpen} aria-label="Dar opinião sobre o MindLoop" title="Dar opinião">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z" />
        <path className="fab-star" d="m12 7.9 1.05 2.13 2.35.34-1.7 1.66.4 2.34L12 13.26l-2.1 1.11.4-2.34-1.7-1.66 2.35-.34z" />
      </svg>
      <span className="fab-txt">Opinião</span>
    </button>
  );
}
