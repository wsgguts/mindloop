"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Celebration from "./Celebration";
import Gem from "./Gem";
import Medal from "./Medal";
import { useSfx } from "./useSound";
import { RARITY_LABEL, type Achievement } from "../lib/achievements";
import { GAME_META } from "../lib/games";
import { LEVELS_PER_CHAPTER, LEVELS_PER_GAME, chapterOf, doneCount, isComplete, isDone, type JourneyGame } from "../lib/journey";
import { formatTime, spokenTime } from "../lib/records";

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
export type LeaveTo = "next" | "journey" | "achievements" | "home";

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
}

export const AUTO_CONTINUE_MS = 6500;
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
export default function LevelComplete({ result, medals = [], hasNext, onSwitch, onClose }: Props) {
  const r = result;
  const meta = GAME_META[r.game];
  const [phase, setPhase] = useState<"show" | "cover" | "reveal">("show");
  const [filled, setFilled] = useState(doneCount(r.before)); // a barra anda do valor antigo para o novo
  const leaving = useRef<LeaveTo | null>(null); // o primeiro evento vence; os demais são ignorados
  const autoRef = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    sfx("celebrate"); // fanfarra ao abrir a tela de parabéns (uma vez)
    const grow = window.setTimeout(() => setFilled(doneCount(r.after)), 450);
    autoRef.current = window.setTimeout(() => leave("journey"), AUTO_CONTINUE_MS);
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

  const note = noteOf(r);
  const firstTime = r.previous === null;
  const total = doneCount(r.after);
  const ch = chapterOf(r.game, r.level);

  return createPortal(
    <div className={`lc-scrim lc-${phase}`} style={{ "--gc": meta.color } as React.CSSProperties}>
      {phase === "show" && <Celebration accent={meta.color} onBurst={() => sfx("burst")} />}
      {phase !== "reveal" && (
        <section className="lc" role="dialog" aria-modal="true" aria-labelledby="lc-title" aria-describedby="lc-desc">
          {/* Em pé: tudo numa coluna. Celular deitado: herói à esquerda, números à direita. */}
          <div className="lc-hero">
          <div className="lc-gem" aria-hidden="true">
            <span className="lc-rays" />
            <Gem kind={r.game} size={96} />
            <span className="lc-star s1">★</span><span className="lc-star s2">★</span><span className="lc-star s3">✦</span>
          </div>
          <p className="lc-eyebrow">{meta.name} · Nível {r.level}</p>
          <h2 id="lc-title">Parabéns!</h2>
          <p className="lc-sub" id="lc-desc">Nível {r.level} concluído em {spokenTime(r.ms)}.</p>
          </div>

          <div className="lc-info">

          <dl className="lc-stats">
            <div className="lc-stat">
              <dt>Tempo</dt>
              <dd><time>{formatTime(r.ms)}</time></dd>
            </div>
            <div className={`lc-stat${r.isRecord ? " record" : ""}`}>
              <dt>{r.isRecord ? "Novo recorde!" : "Melhor tempo"}</dt>
              <dd><time>{formatTime(r.best)}</time>{r.isRecord && r.previous !== null && <small> antes {formatTime(r.previous)}</small>}</dd>
            </div>
          </dl>
          {firstTime && <p className="lc-first">Primeiro tempo registrado neste nível. Jogue de novo para tentar bater!</p>}

          <div className="lc-journey">
            <div className="lc-jrow"><span>Jornada {meta.name}</span><b>{total} de {LEVELS_PER_GAME}</b></div>
            <div className="lc-bar" role="progressbar" aria-label={`Progresso na jornada de ${meta.name}`} aria-valuemin={0} aria-valuemax={LEVELS_PER_GAME} aria-valuenow={total}>
              <i style={{ width: `${filled}%` }} />
            </div>
            <p className="lc-ch">Capítulo {ch.id}: {ch.title}</p>
          </div>
          {note && <p className="lc-note">{note}</p>}
          {medals.length > 0 && (
            <div className="lc-medals" role="status">
              <p className="lc-medals-t">{medals.length > 1 ? `${medals.length} conquistas desbloqueadas!` : "Conquista desbloqueada!"}</p>
              <ul>
                {medals.map((a, i) => (
                  <li key={a.id} style={{ animationDelay: `${0.9 + i * 0.25}s` }}>
                    <Medal a={a} size={34} /><span><b>{a.title}</b><small>{RARITY_LABEL[a.rarity]}</small></span>
                  </li>
                ))}
              </ul>
              <button type="button" className="lc-medals-go" onClick={() => leave("achievements")}>Ver todas as conquistas ›</button>
            </div>
          )}

          <button ref={btn} className="btn cta lc-go" onClick={() => leave(hasNext ? "next" : "journey")}
            aria-describedby="lc-next">{hasNext ? "Continuar" : "Ver jornada"}</button>
          <p className="lc-next" id="lc-next">{hasNext ? `Próximo: Nível ${r.level + 1}` : "Este é o último nível da jornada."}</p>
          <button type="button" className="lc-home" onClick={() => leave("home")}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 4l9 7" /><path d="M5.5 9.5V20h4.5v-6h4v6h4.5V9.5" /></svg>
            <span>Voltar para a tela inicial</span>
          </button>
          <div className="lc-auto" aria-hidden="true"><i style={{ animationDuration: `${AUTO_CONTINUE_MS}ms` }} /></div>
          <p className="lc-hint">Sem tocar, voltando para a jornada…</p>
          </div>
        </section>
      )}
    </div>,
    document.body
  );
}
