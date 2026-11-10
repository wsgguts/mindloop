"use client";
import { useEffect, useRef, useState } from "react";
import Medal from "./Medal";
import { useSfx } from "./useSound";
import { RARITY_LABEL, type Achievement } from "../lib/achievements";

export const TOAST_MS = 4200;

/**
 * Aviso de medalha nova. Mostra UMA conquista por vez (a fila nunca se sobrepõe), some sozinho em
 * poucos segundos e não bloqueia a tela: só o próprio cartão recebe toques.
 */
export default function AchievementToast({ a, left, onDone, onOpen }: { a: Achievement; left: number; onDone: () => void; onOpen: () => void }) {
  const [out, setOut] = useState(false);
  const sfx = useSfx();
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    sfx("advance");
    const t1 = window.setTimeout(() => setOut(true), TOAST_MS);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.id]);
  useEffect(() => {
    if (!out) return;
    const t = window.setTimeout(() => done.current(), 260);
    return () => clearTimeout(t);
  }, [out]);

  return (
    <div className={`ach-toast r-${a.rarity}${out ? " out" : ""}`} role="status" aria-live="polite">
      <span className="ach-toast-medal"><Medal a={a} size={48} /></span>
      <div className="ach-toast-txt">
        <small>Conquista desbloqueada · {RARITY_LABEL[a.rarity]}</small>
        <b>{a.title}</b>
        <span>{a.desc}</span>
      </div>
      <div className="ach-toast-act">
        <button className="btn cta" onClick={() => { setOut(true); onOpen(); }}>Ver todas</button>
        <button className="ach-x" aria-label="Fechar aviso" onClick={() => setOut(true)}>✕</button>
      </div>
      {left > 0 && <span className="ach-more" aria-label={`Mais ${left} conquista${left > 1 ? "s" : ""} na fila`}>+{left}</span>}
    </div>
  );
}
