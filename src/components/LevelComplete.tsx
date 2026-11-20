"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Celebration from "./Celebration";
import Gem from "./Gem";
import Medal from "./Medal";
import { useSfx } from "./useSound";
import { RARITY_LABEL, type Achievement } from "../lib/achievements";
import { GAME_META } from "../lib/games";
import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, chapterOf, doneCount, isComplete, isDone, type JourneyGame } from "../lib/journey";
import { formatTime, spokenTime } from "../lib/records";
import { castImg, narratorOf } from "../lib/cast";

export interface LevelResult {
  game: JourneyGame;
  level: number;
  ms: number;
  best: number;
  previous: number | null;
  isRecord: boolean;
  before: string; // progresso antes da partida
  after: string; // progresso depois (já salvo)
}

/** Para onde a tela de parabéns leva: o próximo nível (Continuar), a jornada (tempo esgotado) ou as conquistas. */
export type LeaveTo = "next" | "journey" | "achievements" | "home" | "feedback";

interface Props {
  result: LevelResult;
  /** Medalhas desbloqueadas por esta vitória (mostradas aqui mesmo, sem avisos por cima da partida). */
  medals?: Achievement[];
  /** Existe um próximo nível para o botão Continuar abrir (falso no último nível da jornada). */
  hasNext: boolean;
  /**
   * Chamado UMA única vez, com a tela totalmente coberta: hora de trocar o que está por baixo.
   * "next" = a pessoa tocou em Continuar; "journey" = o temporizador terminou (ou Esc).
   */
  onSwitch: (to: LeaveTo) => void;
  /** Fim da transição: a tela de parabéns pode sair de cena. */
  onClose: () => void;
  /** Item 4: o personagem do jogo pede a opinião (regra de frequência em lib/feedback.ts → countWin). */
  askOpinion?: boolean;
  /** A pessoa tocou em "Agora não". */
  onDecline?: () => void;
  /** Fim da partida guiada: sem tempos nem jornada; o botão principal leva ao nível (ex.: "Jogar o nível 1"). */
  guided?: { label: string };
}

export const AUTO_CONTINUE_MS = 6500;
/** Quanto tempo o aviso de conquista fica no topo (entra depois de ~0,8 s). */
const MEDAL_TOAST_MS = 3800;
const COVER_MS = 420;
const REVEAL_MS = 480;

/** Mensagem extra: jornada concluída, capítulo concluído ou nível repetido. */
function noteOf(r: LevelResult): string | null {
  const first = !isDone(r.before, r.level);
  if (isComplete(r.after) && !isComplete(r.before)) return "Você concluiu toda a jornada! Agora os 100 níveis estão livres para jogar de novo quando quiser.";
  if (first && r.level % LEVELS_PER_CHAPTER === 0) return `Capítulo “${chapterOf(r.game, r.level).title}” concluído!`;
  if (!first) return "Nível jogado de novo — seu progresso continua todo salvo.";
  return null;
}

// Tela especial de conclusão: fogos, confetes, tempo e progresso da jornada.
// Continuar → cobre a tela, abre o PRÓXIMO nível e se desfaz suavemente.
// Sem toque, ao fim do temporizador → cobre a tela, troca para a JORNADA (progresso já salvo) e se desfaz.
export default function LevelComplete({ result, medals = [], hasNext, onSwitch, onClose, askOpinion, onDecline, guided }: Props) {
  const r = result;
  const meta = GAME_META[r.game];
  const [phase, setPhase] = useState<"show" | "cover" | "reveal">("show");
  const [filled, setFilled] = useState(doneCount(r.before)); // a barra anda do valor antigo para o novo
  const leaving = useRef<LeaveTo | null>(null); // o primeiro evento vence; os demais são ignorados
  const autoRef = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);
  // Com o pedido de opinião na tela, a comemoração NÃO volta sozinha para a jornada (item 5: alunos viam os botões
  // sumirem enquanto liam). Sem o pedido, continua voltando depois de alguns segundos, como antes.
  const [asking, setAsking] = useState(!!askOpinion);
  const [paused, setPaused] = useState(!!askOpinion || !!guided);
  const sfx = useSfx(r.game);
  const cb = useRef({ onSwitch, onClose });
  cb.current = { onSwitch, onClose };

  /** Botão e temporizador chamam com destinos diferentes; só o primeiro conta (sem navegação dupla). */
  function leave(to: LeaveTo) {
    if (leaving.current) return;
    leaving.current = to;
    window.clearTimeout(autoRef.current); // tocou em Continuar: o temporizador para na hora
    setPhase("cover");
  }

  function notNow() { setAsking(false); onDecline?.(); }

  // Conquista nova: aviso por cima, no topo da tela, que NÃO empurra o card e some sozinho (antes era um card grande
  // no fim da comemoração, que crescia ao entrar e ficava cortado atrás do menu).
  const [medalToast, setMedalToast] = useState(medals.length > 0);
  useEffect(() => {
    if (!medals.length) return;
    const t = window.setTimeout(() => setMedalToast(false), MEDAL_TOAST_MS);
    return () => window.clearTimeout(t);
  }, [medals.length]);

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    sfx("celebrate"); // fanfarra ao abrir a tela de parabéns (uma vez)
    const grow = window.setTimeout(() => setFilled(doneCount(r.after)), 450);
    if (!askOpinion && !guided) autoRef.current = window.setTimeout(() => leave("journey"), AUTO_CONTINUE_MS);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave("journey"); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(grow); clearTimeout(autoRef.current); document.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "cover") {
      const t = window.setTimeout(() => { cb.current.onSwitch(leaving.current ?? "journey"); setPhase("reveal"); }, COVER_MS);
      return () => clearTimeout(t);
    }
    if (phase === "reveal") {
      const t = window.setTimeout(() => cb.current.onClose(), REVEAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Item 5: a comemoração termina ACIMA do menu inferior (ou ao lado do trilho, no celular deitado), para o menu
  // continuar visível e clicável. Antes ela cobria a tela inteira, e alunos achavam que o menu tinha sumido.
  const [edge, setEdge] = useState({ bottom: 0, left: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".bnav")?.getBoundingClientRect();
      if (!nav || nav.width === 0) return setEdge({ bottom: 0, left: 0 });
      const rail = nav.height > window.innerHeight / 2; // celular deitado: trilho na lateral
      setEdge({ bottom: rail ? 0 : Math.max(0, window.innerHeight - nav.top), left: rail ? nav.right : 0 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const note = noteOf(r);
  const firstTime = r.previous === null;
  const total = doneCount(r.after);

  return createPortal(
    <div className={`lc-scrim lc-${phase}`} style={{ "--gc": meta.color, bottom: edge.bottom, left: edge.left } as React.CSSProperties}>
      {phase === "show" && <Celebration accent={meta.color} onBurst={() => sfx("burst")} />}
      {/* Aviso de conquista: por cima de tudo, no topo, sem ocupar espaço no card. */}
      {medalToast && phase === "show" && (
        <div className="lc-toast" role="status">
          <Medal a={medals[0]} size={30} />
          <span><b>{medals.length > 1 ? `${medals.length} conquistas desbloqueadas!` : "Conquista desbloqueada!"}</b>
            <small>{medals[0].title}{medals.length > 1 ? ` e mais ${medals.length - 1}` : ""} · {RARITY_LABEL[medals[0].rarity]}</small></span>
          <button type="button" onClick={() => leave("achievements")}>Ver ›</button>
        </div>
      )}
      {phase !== "reveal" && (
        <section className="lc" role="dialog" aria-modal="true" aria-labelledby="lc-title" aria-describedby="lc-desc">
          {/* Parte de cima (nunca rola): cristal, selo, "Parabéns!", frase e o botão principal — sempre visível. */}
          <div className="lc-hero">
            <div className="lc-gem" aria-hidden="true">
              <span className="lc-rays" />
              <Gem kind={r.game} size={96} />
              <span className="lc-star s1">★</span><span className="lc-star s2">★</span><span className="lc-star s3">✦</span>
            </div>
            <p className="lc-eyebrow">{meta.name} · {guided ? "Partida guiada" : `Nível ${r.level}`}</p>
            <h2 id="lc-title">Parabéns!</h2>
            <p className="lc-sub" id="lc-desc">{guided ? "Você completou a partida guiada. Agora é pra valer!" : `Nível ${r.level} concluído em ${spokenTime(r.ms)}.`}</p>
            <button ref={btn} className="btn cta lc-go" onClick={() => leave(guided || hasNext ? "next" : "journey")}>
              {guided ? guided.label : hasNext ? "Próximo nível" : "Ver jornada"}</button>
          </div>

          {/* Miolo: se não couber (tela muito baixa ou fonte grande), só ele rola por dentro. */}
          <div className="lc-info">
            {asking && (
              <div className="lc-ask" role="group" aria-labelledby="lc-ask-t">
                <img src={castImg(narratorOf(r.game))} alt="" width={40} height={40} />
                <div>
                  <p id="lc-ask-t"><b className="sr">{narratorOf(r.game).name}: </b>Você mandou bem! Pode ajudar nossa equipe com sua opinião? É rapidinho, leva menos de 1 minuto 💜</p>
                  <span className="lc-ask-btns">
                    <button type="button" className="btn sec sm" onClick={() => leave("feedback")}>Dar opinião</button>
                    <button type="button" className="linkish" onClick={notNow}>Agora não</button>
                  </span>
                </div>
              </div>
            )}
            {!guided && <>
              {/* Tempos numa faixa só; etiqueta curta no lugar da frase "Primeiro tempo registrado…". */}
              <p className="lc-times">
                <span>⏱ <b><time>{formatTime(r.ms)}</time></b></span>
                <span>🏆 Melhor <b><time>{formatTime(r.best)}</time></b></span>
                {r.isRecord && r.previous !== null && <em className="lc-tag rec">Novo recorde!</em>}
                {firstTime && <em className="lc-tag">1º tempo</em>}
              </p>
              {/* Jornada numa linha: nome, barra fina e "2/100". */}
              <div className="lc-jline">
                <span>Jornada {meta.name}</span>
                <i className="lc-bar" role="progressbar" aria-label={`Progresso na jornada de ${meta.name}`} aria-valuemin={0} aria-valuemax={LEVELS_PER_GAME} aria-valuenow={total}>
                  <i style={{ width: `${filled}%` }} />
                </i>
                <b>{total}/{LEVELS_PER_GAME}</b>
              </div>
              {note && <p className="lc-note">{note}</p>}
            </>}
            <button type="button" className="lc-home" onClick={() => leave("home")}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 4l9 7" /><path d="M5.5 9.5V20h4.5v-6h4v6h4.5V9.5" /></svg>
              <span>Voltar para a tela inicial</span>
            </button>
            {!paused && <>
              <div className="lc-auto" aria-hidden="true"><i style={{ animationDuration: `${AUTO_CONTINUE_MS}ms` }} /></div>
              <p className="lc-hint">Sem tocar, voltando para a jornada…</p>
            </>}
          </div>
        </section>
      )}
    </div>,
    document.body
  );
}
