"use client";
import { useEffect, useRef, useState } from "react";
import Gem from "./Gem";
import { CHAPTERS, LEVELS_PER_GAME, LEVELS_PER_CHAPTER, chapterDone, currentLevel, doneCount, isDone, isUnlocked, type JourneyGame } from "../lib/journey";

const META: Record<JourneyGame, { name: string; color: string }> = {
  sudoku: { name: "Mini Sudoku", color: "#F05BC8" },
  zip: { name: "Zip", color: "#12CFE0" },
};
// Deslocamento horizontal de cada nível do capítulo: desenha o caminho em "S", como numa trilha.
const DX = [0, 44, 68, 44, 0, -44, -68, -44, 0, 0];

interface Props { game: JourneyGame; done: string; onPlay: (level: number) => void; onBack: () => void }

export default function Journey({ game, done, onPlay, onBack }: Props) {
  const { name, color } = META[game];
  const cur = currentLevel(done);
  const count = doneCount(done);
  const curRef = useRef<HTMLLIElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  const [toast, setToast] = useState("");

  // Ao abrir, leva a pessoa direto ao nível em que parou.
  useEffect(() => { curRef.current?.scrollIntoView({ block: "center" }); }, [game]);
  useEffect(() => {
    const el = curRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [game, cur]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  function tap(n: number) {
    if (isUnlocked(done, n)) onPlay(n);
    else setToast(`Conclua o nível ${n - 1} para desbloquear o nível ${n}.`);
  }

  return (
    <div className="journey" style={{ "--gc": color } as React.CSSProperties}>
      <header className="jhead">
        <button className="back" onClick={onBack}>‹ Jogos</button>
        <div className="title">
          <Gem kind={game} size={52} />
          <div><h1>{name}</h1><p>{count} de {LEVELS_PER_GAME} níveis concluídos</p></div>
        </div>
        <div className="progress" role="progressbar" aria-label="Progresso na jornada" aria-valuemin={0} aria-valuemax={LEVELS_PER_GAME} aria-valuenow={count}>
          <i style={{ width: `${count}%` }} />
        </div>
      </header>

      {CHAPTERS[game].map((ch) => (
        <section key={ch.id} className="jch" aria-labelledby={`ch-${game}-${ch.id}`}>
          <div className="jbanner">
            <img src={ch.id % 2 ? "/avatar-cat.png" : "/avatar-kid.png"} alt="" width={64} height={64} />
            <div>
              <span className="cap">CAPÍTULO {ch.id}</span>
              <h2 id={`ch-${game}-${ch.id}`}>{ch.title}</h2>
              <p>{ch.text}</p>
              <span className="cnt">{chapterDone(done, ch)} de {LEVELS_PER_CHAPTER} concluídos</span>
            </div>
          </div>
          <ol className="jpath">
            {Array.from({ length: LEVELS_PER_CHAPTER }, (_, j) => ch.from + j).map((n, j) => {
              const boss = n % LEVELS_PER_CHAPTER === 0;
              const state = isDone(done, n) ? "done" : n === cur ? "current" : "locked";
              const label = `Nível ${n}, ${state === "done" ? "concluído" : state === "current" ? "disponível para jogar" : "bloqueado"}${boss ? ", desafio do capítulo" : ""}`;
              return (
                <li key={n} ref={n === cur ? curRef : undefined} style={{ "--dx": `${DX[j]}px` } as React.CSSProperties}>
                  {state === "current" && <span className="bubble" aria-hidden="true">COMEÇAR</span>}
                  {state === "current" && <img className={`me ${DX[j] > 0 ? "me-l" : "me-r"}`} src="/avatar-kid.png" alt="" width={56} height={56} />}
                  <button className={`node ${state}${boss ? " boss" : ""}`} aria-label={label} aria-disabled={state === "locked"} onClick={() => tap(n)}>
                    {boss ? <><Gem kind={game} size={58} /><span className="bnum">{n}</span></> : <span>{n}</span>}
                    {state === "done" && <span className="bdg ok" aria-hidden="true">✓</span>}
                    {state === "locked" && (
                      <span className="bdg lock" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {offscreen && (
        <button className="jump" onClick={() => curRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })}>Ir para o nível {cur}</button>
      )}
      {toast && <div className="toast note info" role="status"><b aria-hidden="true">ℹ</b><span>{toast}</span></div>}
    </div>
  );
}
