"use client";
import { useEffect, useRef } from "react";

interface Props { title: string; onClose: () => void; children: React.ReactNode; closeLabel?: string }

// Painel sobre a tela atual: não troca de página, então o progresso do jogo é mantido.
export default function Modal({ title, onClose, children, closeLabel = "Fechar" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // evita reexecutar o efeito (e roubar o foco) a cada tecla digitada
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button, input, textarea, [href]");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, []);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) closeRef.current(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn sec close" onClick={onClose} aria-label={closeLabel}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
