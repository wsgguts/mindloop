"use client";
import { useEffect, useRef, useState } from "react";

// Barra de ferramentas única das partidas (os 4 jogos usam a mesma).
// As ações principais ficam sempre à vista, com ícone + rótulo curto e área de toque grande;
// as demais (como jogar, níveis, opinião, encerrar…) ficam no menu "Mais", que abre para cima.
// Assim nada flutua sobre o tabuleiro ou sobre os botões do jogo.

export type ToolIcon = "undo" | "hint" | "restart" | "pause" | "play" | "help" | "levels" | "feedback" | "end" | "more";
export interface ToolAction { label: string; icon: ToolIcon; onClick: () => void; disabled?: boolean; ariaLabel?: string }

const PATHS: Record<ToolIcon, React.ReactNode> = {
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  hint: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" /></>,
  restart: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  pause: <><path d="M9 5v14M15 5v14" /></>,
  play: <path d="M7 5v14l11-7z" />,
  help: <><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><path d="M12 17.6h.01" /></>,
  levels: <><path d="M4 19c3-1 4-4 8-4s5 3 8 2" /><circle cx="6" cy="9" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="18" cy="10" r="2" /></>,
  feedback: <><path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z" /></>,
  end: <><path d="M5 21V4h11l-2 4 2 4H5" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
};
export const Icon = ({ name, size = 22 }: { name: ToolIcon; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</svg>
);

export default function GameToolbar({ main, more }: { main: ToolAction[]; more: ToolAction[] }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    box.current?.querySelector<HTMLButtonElement>(".gmenu button")?.focus();
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <div className="gtools" role="toolbar" aria-label="Ações da partida" ref={box}>
      {main.map((a) => (
        <button key={a.label} type="button" className="gtool" onClick={a.onClick} disabled={a.disabled} aria-label={a.ariaLabel}>
          <Icon name={a.icon} /><span>{a.label}</span>
        </button>
      ))}
      <button type="button" className={`gtool${open ? " on" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Mais opções">
        <Icon name="more" /><span>Mais</span>
      </button>
      {open && (
        <div className="gmenu" role="menu">
          {more.map((a) => (
            <button key={a.label} type="button" role="menuitem" disabled={a.disabled} onClick={() => { setOpen(false); a.onClick(); }}>
              <Icon name={a.icon} size={20} /><span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
