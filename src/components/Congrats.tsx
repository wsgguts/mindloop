"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Gem, { type GemKind } from "./Gem";

interface Props { kind: GemKind; levelName: string; note?: string; onDone: () => void }

const AUTO_BACK_MS = 3500;

// Tela rápida de parabéns ao concluir um nível: volta sozinha para a trilha (ou ao tocar em Continuar).
export default function Congrats({ kind, levelName, note, onDone }: Props) {
  const [open, setOpen] = useState(true);
  const finished = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);
  const finish = () => { if (finished.current) return; finished.current = true; setOpen(false); onDone(); };

  useEffect(() => {
    btn.current?.focus();
    const t = setTimeout(finish, AUTO_BACK_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Desenhada direto no <body> para não ser cortada pelo painel da página (que tem cantos recortados).
  if (!open) return null;
  return createPortal(
    <div className="scrim congrats-scrim">
      <section className="congrats" role="status" aria-live="polite">
        <Gem kind={kind} size={96} />
        <h2>Parabéns!</h2>
        <p className="congrats-level">Você concluiu o {levelName.toLowerCase()}.</p>
        {note && <p className="congrats-note">{note}</p>}
        <button ref={btn} className="btn cta" onClick={finish}>Continuar</button>
        <p className="muted congrats-hint">Voltando para os níveis…</p>
      </section>
    </div>,
    document.body
  );
}
