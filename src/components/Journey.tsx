"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSfx } from "./useSound";
import { useFitHeight } from "./useFitHeight";
import Gem from "./Gem";
import { CHAPTERS, LEVELS_PER_GAME, LEVELS_PER_CHAPTER, chapterDone, chapterOf, currentLevel, doneCount, isComplete, isDone, isUnlocked, type JourneyGame } from "../lib/journey";
import { GAME_META } from "../lib/games";
import JourneyScene from "./JourneyScene";
import { sceneArt, sceneOf, scenePoints } from "../lib/scenes";

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
  /** Mindloop Investigação: mistérios resolvidos deste jogo e acesso ao caderno. */
  cases?: { solved: number; total: number };
  onCases?: () => void;
  /** Por onde a jornada abre: a visão geral (capítulos) ou direto no mapa do capítulo do nível destacado. */
  start?: "overview" | "map";
}

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><path d="M12 17.6h.01" /></svg>
);

/**
 * Jornada em duas etapas:
 *  • visão geral — título, progresso, Investigações e os 10 capítulos em cartões (com a pintura de cada mundo);
 *  • mapa — só uma barra compacta (voltar aos capítulos, mundo, capítulo anterior/seguinte) e a trilha inteira.
 * Ao voltar de uma partida, a jornada abre direto no mapa (com a animação de chegada).
 */
export default function Journey({ game, done, focus, justDone, justUnlocked, onPlay, onBack, onHelp, cases, onCases, start = "overview" }: Props) {
  const { name, color, cur: curColor } = GAME_META[game];
  const next = currentLevel(done); // primeiro nível ainda não concluído
  const cur = focus; // nível destacado ("JOGAR")
  const complete = isComplete(done);
  const count = doneCount(done);
  const curChapter = chapterOf(game, cur).id;
  const [chapterId, setChapterId] = useState(curChapter);
  const [stage, setStage] = useState<"overview" | "map">(justDone !== undefined ? "map" : start);
  const ch = CHAPTERS[game][chapterId - 1];
  const world = sceneOf(ch.id); // o capítulo N acontece no mundo N, em qualquer um dos 4 jogos
  const points = scenePoints(world);
  const curRef = useRef<HTMLLIElement>(null);
  const scrollToCur = useRef<ScrollBehavior | null>("auto"); // ao abrir o mapa, leva a pessoa direto ao nível em que parou
  const [offscreen, setOffscreen] = useState(false);
  const sfx = useSfx(game);
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
    if (!root || stage !== "map") return;
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
  }, [chapterId, stage, centerOnCur]);

  const [toast, setToast] = useState("");

  useEffect(() => {
    if (stage === "overview") { window.scrollTo(0, 0); return; }
    const how = scrollToCur.current;
    if (!how) return;
    scrollToCur.current = null;
    if (curRef.current) centerOnCur(how);
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: how }); // outro capítulo: abre no pé da trilha (nível 1)
  }, [chapterId, stage, centerOnCur]);
  useEffect(() => {
    const el = curRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOffscreen(false); return; }
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [chapterId, cur, stage]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  // Ao voltar de uma vitória, o nível seguinte "abre" com uma animação (só quando ele acabou de ser liberado).
  const unlockedNow = justUnlocked !== undefined && !isDone(done, justUnlocked) ? justUnlocked : undefined;
  // Som de progressão junto com a animação do nível recém-liberado (que começa 1 s depois de chegar).
  useEffect(() => {
    if (unlockedNow === undefined) return;
    const t = window.setTimeout(() => sfx("advance"), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap(n: number) {
    if (isUnlocked(done, n)) { sfx("ui"); onPlay(n); }
    else { sfx("block"); setToast(`Conclua o nível ${n - 1} para desbloquear o nível ${n}.`); }
  }
  function jump() {
    if (chapterId === curChapter) centerOnCur("smooth");
    else { scrollToCur.current = "smooth"; setChapterId(curChapter); }
  }
  /** Abre o mapa de um capítulo: o do nível destacado vai centralizado nele; os outros abrem no pé da trilha. */
  function openMap(id: number) { sfx("ui"); scrollToCur.current = "auto"; setChapterId(id); setStage("map"); }
  function step(d: number) {
    const id = chapterId + d;
    if (id < 1 || id > CHAPTERS[game].length) return;
    sfx("ui"); scrollToCur.current = "auto"; setChapterId(id);
  }

  useFitHeight(rootRef, [stage]); // visão geral: cabe inteira na tela do celular, sem rolar
  const style = { "--gc": color, ...(curColor && { "--cur": curColor }) } as React.CSSProperties;

  if (stage === "overview") {
    return (
      <div ref={rootRef} className="journey jov fit" style={style}>
        <header className="jhead">
          <div className="jtop">
            <button className="back" onClick={onBack}>‹ Início</button>
            <button className="back jhelp" onClick={onHelp}><HelpIcon />Como jogar</button>
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

        <div className="jov-actions">
          <button className="jcontinue" onClick={() => openMap(curChapter)} aria-label={`${complete ? "Rever a jornada" : count ? "Continuar a jornada" : "Começar a jornada"}: nível ${cur}, ${sceneOf(curChapter).name}`}>
            <span>{complete ? "Rever a jornada" : count ? "Continuar" : "Começar"}</span>
            <b>Nível {cur} ›</b>
          </button>
          {cases && onCases && (
            <button className="jcases jcases-tile" onClick={() => { sfx("ui"); onCases(); }} aria-label={`Investigações: ${cases.solved} de ${cases.total} mistérios resolvidos. Abrir caderno.`}>
              <span><span aria-hidden="true">🔍 </span>Investigações</span>
              <b>{cases.solved}/{cases.total} ›</b>
            </button>
          )}
        </div>

        <section className="jov-sec" aria-labelledby={`jov-${game}`}>
          <h2 id={`jov-${game}`}>Capítulos</h2>
          <ol className="jgrid">
            {CHAPTERS[game].map((c) => {
              const n = chapterDone(done, c);
              const full = n === LEVELS_PER_CHAPTER;
              const open = isUnlocked(done, c.from);
              const here = c.id === curChapter && !complete;
              const w = sceneOf(c.id);
              return (
                <li key={c.id}>
                  <button className={`jcard${full ? " full" : ""}${open ? "" : " shut"}${here ? " here" : ""}`} onClick={() => openMap(c.id)}
                    aria-label={`Capítulo ${c.id}: ${w.name}, níveis ${c.from} a ${c.to}, ${n} de ${LEVELS_PER_CHAPTER} concluídos${full ? ", completo" : open ? "" : ", bloqueado"}${here ? ", você está aqui" : ""}`}>
                    <img src={sceneArt(w)} alt="" loading="lazy" decoding="async" />
                    <span className="jcard-tag" aria-hidden="true">{full ? "✓" : open ? c.id : "🔒"}</span>
                    <span className="jcard-b">
                      <b>{w.name}</b>
                      <small>{here ? <em className="jcard-now">Você está aqui</em> : <><span className="jcard-word">Níveis </span>{c.from}–{c.to}</>} · {n}/{LEVELS_PER_CHAPTER}</small>
                      <i className="jcard-bar" aria-hidden="true"><i style={{ width: `${n * 10}%` }} /></i>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`journey jmap${justDone !== undefined ? " enter" : ""}`} style={style}>
      <header className="jmapbar">
        <button className="back" onClick={() => { sfx("ui"); setStage("overview"); }} aria-label="Voltar aos capítulos da jornada">‹ Capítulos</button>
        <div className="jmap-t">
          <b>{world.name}</b>
          <small>Cap. {ch.id} · níveis {ch.from}–{ch.to} · {chapterDone(done, ch)}/{LEVELS_PER_CHAPTER}</small>
        </div>
        <span className="jmap-nav">
          <button onClick={() => step(-1)} disabled={chapterId === 1} aria-label="Capítulo anterior">‹</button>
          <button onClick={() => step(1)} disabled={chapterId === CHAPTERS[game].length} aria-label="Próximo capítulo">›</button>
        </span>
      </header>

      <section className="jch" aria-label={`Capítulo ${ch.id}: ${world.name}`}>
        <p className="jmap-tip"><b>{ch.title}:</b> {ch.text}</p>
        {/* O mundo e os níveis formam um único bloco: os pontos usam % da arte e rolam junto com ela.
            O mundo (cenário) é o mesmo nos 4 jogos; o jogo só muda a luz, os cristais e as partículas. */}
        <div className="trail">
          <JourneyScene key={world.id} scene={world} game={game} />
          <ol className="tlevels">
            {points.map((p, j) => {
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
