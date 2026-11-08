"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Gem from "./Gem";
import { CHAPTERS, LEVELS_PER_GAME, LEVELS_PER_CHAPTER, chapterDone, chapterOf, currentLevel, doneCount, isComplete, isDone, isUnlocked, type JourneyGame } from "../lib/journey";
import { GAME_META } from "../lib/games";
import { TRAIL, TRAIL_IMAGE } from "../lib/trail";

interface Props {
  game: JourneyGame;
  done: string;
  /** Nível destacado e centralizado na tela (ver focusLevel em lib/journey). */
  focus: number;
  /** Nível que acabou de ser concluído: ganha uma animação ao voltar para a trilha. */
  justDone?: number;
  /** Nível que acabou de ser liberado por essa vitória (só na primeira conclusão do anterior). */
  justUnlocked?: number;
  onPlay: (level: number) => void;
  onBack: () => void;
  /** Abre o tutorial animado do jogo. */
  onHelp: () => void;
  /** Abre a tela de opinião. */
  onFeedback: () => void;
}

export default function Journey({ game, done, focus, justDone, justUnlocked, onPlay, onBack, onHelp, onFeedback }: Props) {
  const { name, color, cur: curColor } = GAME_META[game];
  const next = currentLevel(done); // primeiro nível ainda não concluído
  const cur = focus; // nível destacado ("JOGAR")
  const complete = isComplete(done);
  const count = doneCount(done);
  const curChapter = chapterOf(game, cur).id;
  const [chapterId, setChapterId] = useState(curChapter);
  const ch = CHAPTERS[game][chapterId - 1];
  const curRef = useRef<HTMLLIElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const scrollToCur = useRef<ScrollBehavior | null>("auto"); // ao abrir, leva a pessoa direto ao nível em que parou
  const [offscreen, setOffscreen] = useState(false);
  /** Rola a página até o nível destacado ficar no centro da área visível (acima da barra de navegação).
   *  Nos primeiros níveis de cada capítulo (no pé da trilha) a página para no fim da trilha: o nível fica
   *  embaixo, mas visível, e a arte continua preenchendo a tela (sem faixa vazia). */
  const centerOnCur = useCallback((behavior: ScrollBehavior) => {
    const el = curRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nav = document.querySelector(".bnav")?.getBoundingClientRect();
    const bottom = nav && nav.top > window.innerHeight / 2 ? nav.top : window.innerHeight; // no celular deitado o menu é lateral
    const target = window.scrollY + r.top + r.height / 2 - bottom / 2;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, Math.min(max, target)), behavior });
  }, []);
  // No celular real a altura ainda muda logo depois de abrir (fontes trocando, imagens decodificando, barra de
  // endereço recolhendo). Enquanto a pessoa não mexer na tela, a trilha volta a centralizar o nível destacado.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let touched = false;
    const stop = () => { touched = true; };
    const evs = ["touchstart", "wheel", "keydown", "pointerdown"] as const;
    evs.forEach((e) => window.addEventListener(e, stop, { passive: true }));
    const again = () => { if (!touched) centerOnCur("auto"); };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(again) : null;
    ro?.observe(root);
    window.addEventListener("resize", again);
    document.fonts?.ready.then(again).catch(() => {});
    const end = window.setTimeout(() => { touched = true; }, 2500);
    return () => { ro?.disconnect(); window.removeEventListener("resize", again); evs.forEach((e) => window.removeEventListener(e, stop)); window.clearTimeout(end); };
  }, [chapterId, centerOnCur]);

  const [toast, setToast] = useState("");

  useEffect(() => {
    if (scrollToCur.current && curRef.current) {
      centerOnCur(scrollToCur.current);
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

  // Ao voltar de uma vitória, o nível seguinte "abre" com uma animação (só quando ele acabou de ser liberado).
  const unlockedNow = justUnlocked !== undefined && !isDone(done, justUnlocked) ? justUnlocked : undefined;

  function tap(n: number) {
    if (isUnlocked(done, n)) onPlay(n);
    else setToast(`Conclua o nível ${n - 1} para desbloquear o nível ${n}.`);
  }
  function jump() {
    if (chapterId === curChapter) centerOnCur("smooth");
    else { scrollToCur.current = "smooth"; setChapterId(curChapter); }
  }

  return (
    <div ref={rootRef} className={`journey${justDone !== undefined ? " enter" : ""}`} style={{ "--gc": color, ...(curColor && { "--cur": curColor }) } as React.CSSProperties}>
      <header className="jhead">
        <div className="jtop">
          <button className="back" onClick={onBack}>‹ Início</button>
          <button className="back jhelp" onClick={onHelp}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><path d="M12 17.6h.01" /></svg>Como jogar</button>
          <button className="back jfb" onClick={onFeedback} aria-label="Dar opinião sobre o MindLoop" title="Dar opinião"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z" /></svg></button>
        </div>
        <div className="title">
          <Gem kind={game} size={52} />
          <div><h1>{name}</h1><p>{count} de {LEVELS_PER_GAME} níveis concluídos</p></div>
        </div>
        {complete && (
          <p className="jdone" role="note"><b aria-hidden="true">★</b> Jornada completa! Todos os níveis estão liberados — escolha qualquer um para jogar de novo.</p>
        )}
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
          <img src={ch.id % 2 ? "/avatar-cat.webp" : "/avatar-kid.webp"} alt="" width={64} height={64} decoding="async" />
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
              const state = isDone(done, n) ? "done" : n === next ? "current" : "locked";
              const sel = n === cur;
              const label = `Nível ${n}, ${state === "done" ? "concluído" : state === "current" ? "disponível para jogar" : "bloqueado"}${boss ? ", desafio do capítulo" : ""}${sel ? ", selecionado" : ""}${n === justDone ? ", acabou de ser concluído" : ""}`;
              const cls = ["tnode", state, boss && "boss", sel && "sel", n === justDone && "just", n === unlockedNow && "fresh"].filter(Boolean).join(" ");
              return (
                <li key={n} ref={sel ? curRef : undefined} style={{ left: `${p.x}%`, top: `${p.y}%`, "--k": p.k } as React.CSSProperties}>
                  {sel && <span className="bubble" aria-hidden="true">{state === "done" ? "JOGAR DE NOVO" : "JOGAR"}</span>}
                  <button className={cls} aria-label={label} aria-current={sel ? "step" : undefined} aria-disabled={state === "locked"} onClick={() => tap(n)}>
                    {boss ? <Gem kind={game} size={64} /> : <span className="tgem" aria-hidden="true" />}
                    <span className="tnum">{n}</span>
                    {state === "done" && <span className="tbdg ok" aria-hidden="true">✓</span>}
                    {n === unlockedNow && <span className="tburst" aria-hidden="true" />}
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
