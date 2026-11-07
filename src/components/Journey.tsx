"use client";
import { useEffect, useRef, useState } from "react";
import Gem from "./Gem";
import { CHAPTERS, LEVELS_PER_GAME, LEVELS_PER_CHAPTER, chapterDone, chapterOf, currentLevel, doneCount, isDone, isUnlocked, type JourneyGame } from "../lib/journey";
import { TRAIL, TRAIL_IMAGE } from "../lib/trail";

const META: Record<JourneyGame, { name: string; color: string }> = {
  sudoku: { name: "Mini Sudoku", color: "#F05BC8" },
  zip: { name: "Zip", color: "#12CFE0" },
};

interface Props { game: JourneyGame; done: string; onPlay: (level: number) => void; onBack: () => void }

export default function Journey({ game, done, onPlay, onBack }: Props) {
  const { name, color } = META[game];
  const cur = currentLevel(done);
  const count = doneCount(done);
  const curChapter = chapterOf(game, cur).id;
  const [chapterId, setChapterId] = useState(curChapter);
  const ch = CHAPTERS[game][chapterId - 1];
  const curRef = useRef<HTMLLIElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const scrollToCur = useRef<ScrollBehavior | null>("auto"); // ao abrir, leva a pessoa direto ao nível em que parou
  const [offscreen, setOffscreen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (scrollToCur.current && curRef.current) {
      curRef.current.scrollIntoView({ block: "center", behavior: scrollToCur.current });
      scrollToCur.current = null;
    }
    // Centraliza o capítulo escolhido na faixa de capítulos (só na horizontal, sem mexer na página).
    const row = chipsRef.current, chip = row?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (row && chip) row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
  }, [chapterId]);
  useEffect(() => {
    const el = curRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOffscreen(false); return; }
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [chapterId, cur]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  function tap(n: number) {
    if (isUnlocked(done, n)) onPlay(n);
    else setToast(`Conclua o nível ${n - 1} para desbloquear o nível ${n}.`);
  }
  function jump() {
    if (chapterId === curChapter) curRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    else { scrollToCur.current = "smooth"; setChapterId(curChapter); }
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

      <nav className="jchips" ref={chipsRef} aria-label="Capítulos da jornada">
        {CHAPTERS[game].map((c) => {
          const complete = chapterDone(done, c) === LEVELS_PER_CHAPTER;
          const open = isUnlocked(done, c.from);
          return (
            <button key={c.id} className={`jchip${complete ? " full" : ""}${open ? "" : " shut"}${c.id === curChapter ? " here" : ""}`}
              aria-pressed={c.id === chapterId} aria-label={`Capítulo ${c.id}: ${c.title}${complete ? ", concluído" : open ? "" : ", bloqueado"}`}
              onClick={() => setChapterId(c.id)}>
              {complete ? "✓" : c.id}
            </button>
          );
        })}
      </nav>

      <section className="jch" aria-labelledby={`ch-${game}-${ch.id}`}>
        <div className="jbanner">
          <img src={ch.id % 2 ? "/avatar-cat.png" : "/avatar-kid.png"} alt="" width={64} height={64} />
          <div>
            <span className="cap">CAPÍTULO {ch.id}</span>
            <h2 id={`ch-${game}-${ch.id}`}>{ch.title}</h2>
            <p>{ch.text}</p>
            <span className="cnt">{chapterDone(done, ch)} de {LEVELS_PER_CHAPTER} concluídos</span>
          </div>
        </div>

        {/* A arte e os níveis formam um único bloco: os pontos usam % da imagem e rolam junto com ela. */}
        <div className="trail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TRAIL_IMAGE.src} width={TRAIL_IMAGE.width} height={TRAIL_IMAGE.height} alt="" decoding="async" draggable={false} />
          <ol className="tlevels">
            {TRAIL.map((p, j) => {
              const n = ch.from + j;
              const boss = j === LEVELS_PER_CHAPTER - 1;
              const state = isDone(done, n) ? "done" : n === cur ? "current" : "locked";
              const label = `Nível ${n}, ${state === "done" ? "concluído" : state === "current" ? "disponível para jogar" : "bloqueado"}${boss ? ", desafio do capítulo" : ""}`;
              return (
                <li key={n} ref={n === cur ? curRef : undefined} style={{ left: `${p.x}%`, top: `${p.y}%`, "--k": p.k } as React.CSSProperties}>
                  {state === "current" && <span className="bubble" aria-hidden="true">JOGAR</span>}
                  <button className={`tnode ${state}${boss ? " boss" : ""}`} aria-label={label} aria-disabled={state === "locked"} onClick={() => tap(n)}>
                    {boss ? <Gem kind={game} size={64} /> : <span className="tgem" aria-hidden="true" />}
                    <span className="tnum">{n}</span>
                    {state === "done" && <span className="tbdg ok" aria-hidden="true">✓</span>}
                    {state === "locked" && (
                      <span className="tbdg lock" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {(offscreen || chapterId !== curChapter) && (
        <button className="jump" onClick={jump}>Ir para o nível {cur}</button>
      )}
      {toast && <div className="toast note info" role="status"><b aria-hidden="true">ℹ</b><span>{toast}</span></div>}
    </div>
  );
}
