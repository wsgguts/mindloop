"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSfx } from "./useSound";
import { useFitHeight } from "./useFitHeight";
import Gem from "./Gem";
import { CHAPTERS, LEVELS_PER_CHAPTER, chapterDone, chapterOf, currentLevel, isDone, isUnlocked, type JourneyGame } from "../lib/journey";
import { GAME_META } from "../lib/games";
import JourneyScene from "./JourneyScene";
import { sceneOf, scenePoints } from "../lib/scenes";
import { placeExtra, type Circle } from "../lib/extraPlacement";

/** Investigação ligada a um nível: aparece como cristal "Extra" ao lado dele, quando o nível é concluído. */
export interface ExtraCase { id: string; solved: boolean }

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
  /** "?": rever a partida guiada do jogo. */
  onHelp: () => void;
  /** Abre a tela de opinião. */
  onFeedback: () => void;
  /** Mindloop Investigação: mistérios resolvidos deste jogo e acesso ao caderno. */
  cases?: { solved: number; total: number };
  onCases?: () => void;
  /** Investigação de cada nível (pelo número do nível) e o que fazer ao tocar no cristal Extra. */
  caseAt?: Record<number, ExtraCase>;
  onCase?: (id: string) => void;
  /** Modo Administrador (testes): todos os níveis e capítulos liberados. */
  admin?: boolean;
}

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><path d="M12 17.6h.01" /></svg>
);

/**
 * Jornada (item 2 do teste com alunos): ao abrir um jogo, a pessoa cai DIRETO no mapa do capítulo em que está,
 * com o próximo nível destacado ("JOGAR"). Antes havia uma tela de capítulos no meio do caminho, que confundia.
 *  • Cabeçalho: ‹ Início · nome do capítulo (toque = lista de capítulos) · caderno de investigações · ? · ‹ ›
 *  • Cristal "Extra" (dourado, com lupa): a investigação opcional liberada por um nível. Não bloqueia nada.
 */
export default function Journey({ game, done, focus, justDone, justUnlocked, onPlay, onBack, onHelp, cases, onCases, caseAt = {}, onCase, admin = false }: Props) {
  const canPlay = (n: number) => admin || isUnlocked(done, n);
  const { color, cur: curColor } = GAME_META[game];
  const next = currentLevel(done); // primeiro nível ainda não concluído
  const cur = focus; // nível destacado ("JOGAR")
  const curChapter = chapterOf(game, cur).id;
  const [chapterId, setChapterId] = useState(curChapter);
  const [picking, setPicking] = useState(false); // lista de capítulos aberta
  const ch = CHAPTERS[game][chapterId - 1];
  const world = sceneOf(ch.id); // o capítulo N acontece no mundo N, em qualquer um dos jogos
  const points = scenePoints(world);
  const curRef = useRef<HTMLLIElement>(null);
  const scrollToCur = useRef<ScrollBehavior | null>("auto"); // ao abrir o mapa, leva a pessoa direto ao nível em que parou
  const [offscreen, setOffscreen] = useState(false);
  const sfx = useSfx(game);
  /** Rola a página até o nível destacado ficar no centro da área visível (acima da barra de navegação). */
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
  // No celular real a altura ainda muda logo depois de abrir (fontes, imagens, barra de endereço). Enquanto a pessoa
  // não mexer na tela, a trilha volta a centralizar o nível destacado.
  const rootRef = useRef<HTMLDivElement>(null);
  // Tamanho da pintura do mapa (px): usado para posicionar os cristais extras sem encostar nos níveis.
  // Antes de medir (primeira renderização), usa um tamanho típico de celular.
  const trailRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 380, h: 608 });
  const [radii, setRadii] = useState<number[]>([]); // raio real de cada cristal de nível na tela (px)
  useEffect(() => {
    const el = trailRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setBox((b) => (Math.round(r.width) === b.w && Math.round(r.height) === b.h ? b : { w: Math.round(r.width), h: Math.round(r.height) }));
      const rs = [...el.querySelectorAll(".tnode")].map((n) => Math.round(n.getBoundingClientRect().width / 2));
      setRadii((old) => (rs.length && rs.join() !== old.join() ? rs : old));
    };
    measure();
    // Os cristais só assumem o tamanho final depois que a pintura e as fontes carregam: mede de novo logo depois.
    const again = window.setTimeout(measure, 400);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => { ro?.disconnect(); window.clearTimeout(again); };
  }, [chapterId]);
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
    const how = scrollToCur.current;
    if (!how) return;
    scrollToCur.current = null;
    if (curRef.current) centerOnCur(how);
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: how }); // outro capítulo: abre no pé da trilha (nível 1)
  }, [chapterId, centerOnCur]);
  useEffect(() => {
    const el = curRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOffscreen(false); return; }
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [chapterId, cur]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);
  // Lista de capítulos: fecha com Esc.
  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPicking(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [picking]);

  // Ao voltar de uma vitória, o nível seguinte "abre" com uma animação (só quando ele acabou de ser liberado).
  const unlockedNow = justUnlocked !== undefined && !isDone(done, justUnlocked) ? justUnlocked : undefined;
  useEffect(() => {
    if (unlockedNow === undefined) return;
    const t = window.setTimeout(() => sfx("advance"), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap(n: number) {
    if (canPlay(n)) { sfx("ui"); onPlay(n); }
    else { sfx("block"); setToast(`Conclua o nível ${n - 1} para desbloquear o nível ${n}.`); }
  }
  function jump() {
    if (chapterId === curChapter) centerOnCur("smooth");
    else { scrollToCur.current = "smooth"; setChapterId(curChapter); }
  }
  function goChapter(id: number) {
    if (id < 1 || id > CHAPTERS[game].length) return;
    sfx("ui"); setPicking(false); scrollToCur.current = "auto"; setChapterId(id);
  }

  useFitHeight(rootRef, []); // o mapa do capítulo cabe inteiro na tela do celular, sem rolar
  const style = { "--gc": color, ...(curColor && { "--cur": curColor }) } as React.CSSProperties;

  return (
    <div ref={rootRef} className={`journey jmap fitmap${justDone !== undefined ? " enter" : ""}`} style={style}>
      <header className="jmapbar">
        <button className="back" onClick={onBack} aria-label="Voltar ao início">‹ Início</button>
        <button className="jmap-t" onClick={() => { sfx("ui"); setPicking((v) => !v); }} aria-expanded={picking} aria-haspopup="dialog"
          aria-label={`Capítulo ${ch.id}: ${world.name}, ${chapterDone(done, ch)} de ${LEVELS_PER_CHAPTER} níveis. Trocar de capítulo`}>
          <b>{world.name} <span aria-hidden="true">▾</span></b>
          <small>Cap. {ch.id} · {chapterDone(done, ch)}/{LEVELS_PER_CHAPTER}</small>
        </button>
        <span className="jmap-nav">
          {cases && onCases && (
            <button className="jmap-book" onClick={() => { sfx("ui"); onCases(); }} aria-label={`Caderno de investigações: ${cases.solved} de ${cases.total} resolvidas`}>
              <span aria-hidden="true">🔍</span><small>{cases.solved}/{cases.total}</small>
            </button>
          )}
          <button onClick={onHelp} aria-label="Tutorial: rever a partida guiada" title="Tutorial"><HelpIcon /></button>
          <button onClick={() => goChapter(chapterId - 1)} disabled={chapterId === 1} aria-label="Capítulo anterior">‹</button>
          <button onClick={() => goChapter(chapterId + 1)} disabled={chapterId === CHAPTERS[game].length} aria-label="Próximo capítulo">›</button>
        </span>
        {picking && (
          <div className="jpick" role="dialog" aria-label="Escolher capítulo">
            <ol>
              {CHAPTERS[game].map((c) => {
                const n = chapterDone(done, c);
                const open = canPlay(c.from);
                return (
                  <li key={c.id}>
                    <button className={`${c.id === chapterId ? "on" : ""}${open ? "" : " shut"}`} onClick={() => goChapter(c.id)} aria-current={c.id === chapterId ? "true" : undefined}>
                      <span className="jpick-n" aria-hidden="true">{n === LEVELS_PER_CHAPTER ? "✓" : open ? c.id : "🔒"}</span>
                      <span><b>{sceneOf(c.id).name}</b><small>{c.id === curChapter ? "Você está aqui · " : ""}{n}/{LEVELS_PER_CHAPTER}</small></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </header>
      {picking && <button className="jpick-scrim" aria-label="Fechar a lista de capítulos" onClick={() => setPicking(false)} />}

      <section className="jch" aria-label={`Capítulo ${ch.id}: ${world.name}`}>
        <div className="trail-fit">
        <div className="trail" ref={trailRef}>
          <JourneyScene key={world.id} scene={world} game={game} />
          <ol className="tlevels">
            {points.map((p, j) => {
              const n = ch.from + j;
              const boss = j === LEVELS_PER_CHAPTER - 1;
              const state = isDone(done, n) ? "done" : n === next ? "current" : admin ? "open" : "locked";
              const sel = n === cur;
              const label = `Nível ${n}, ${state === "done" ? "concluído" : state === "current" ? "disponível para jogar" : state === "open" ? "liberado pelo modo administrador" : "bloqueado"}${boss ? ", desafio do capítulo" : ""}${sel ? ", selecionado" : ""}${n === justDone ? ", acabou de ser concluído" : ""}`;
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
          {/* Fases extras (investigações): cristal âmbar, menor que o do nível, AO LADO do caminho, entre o nível que
              a libera e o seguinte, ligado a ele por uma linha pontilhada. É opcional: não bloqueia nada. */}
          {onCase && (() => {
            const size = (k: number, boss: boolean) => (boss ? Math.min(86, Math.max(56, 0.16 * box.w * k)) : Math.min(72, Math.max(44, 0.125 * box.w * k)));
            // Raio de cada cristal de nível: o medido na tela (ou, antes de medir, uma estimativa).
            const nodes: Circle[] = points.map((p, j) => ({ x: (p.x / 100) * box.w, y: (p.y / 100) * box.h, r: radii[j] ?? size(p.k ?? 1, j === points.length - 1) / 2 }));
            const items = points.flatMap((_, j) => {
              const n = ch.from + j, extra = caseAt[n];
              if (!extra) return [];
              const r = nodes[j].r * 0.72; // uns 72% do cristal do nível
              const at = placeExtra(nodes[j], nodes[j + 1] ?? null, nodes, r, box);
              const open = isDone(done, n) || admin;
              const state = extra.solved ? "solved" : open ? "open" : "locked";
              return [{ n, extra, r, at, from: nodes[j], state }];
            });
            return (
              <ul className="textras" aria-label="Investigações extras deste capítulo">
                {items.map(({ n, extra, r, at, from, state }) => {
                  // Linha pontilhada do nível de origem até a borda do cristal extra.
                  const len = Math.max(0, Math.hypot(at.x - from.x, at.y - from.y) - from.r - r);
                  const ang = Math.atan2(at.y - from.y, at.x - from.x);
                  const start = { x: from.x + Math.cos(ang) * from.r, y: from.y + Math.sin(ang) * from.r };
                  const label = `Investigação extra do nível ${n}: ${state === "solved" ? "resolvida" : state === "open" ? "disponível (opcional)" : `bloqueada — conclua o nível ${n}`}`;
                  return (
                    <li key={n} style={{ "--xs": `${Math.round(r * 2)}px` } as React.CSSProperties}>
                      <i className={`textra-link ${state}`} aria-hidden="true"
                        style={{ left: `${(start.x / box.w) * 100}%`, top: `${(start.y / box.h) * 100}%`, width: len, transform: `rotate(${ang}rad)` }} />
                      <button className={`textra ${state}`} title="Investigação extra" aria-label={label}
                        style={{ left: `${(at.x / box.w) * 100}%`, top: `${(at.y / box.h) * 100}%` }}
                        onClick={() => {
                          if (state === "locked") { sfx("block"); setToast(`Conclua o nível ${n} para liberar esta investigação extra.`); return; }
                          sfx("ui"); onCase(extra.id);
                        }}>
                        <span className="tgem" aria-hidden="true" />
                        <svg className="textra-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
                        {state === "solved" && <span className="tbdg ok" aria-hidden="true">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </div>
        {(offscreen || chapterId !== curChapter) && (
          <button className="jump" onClick={jump}>Ir para o nível {cur}</button>
        )}
        </div>
      </section>
      {toast && <div className="toast note info" role="status"><b aria-hidden="true">ℹ</b><span>{toast}</span></div>}
    </div>
  );
}
