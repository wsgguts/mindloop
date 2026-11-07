"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Celebration from "./Celebration";
import Gem from "./Gem";
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

interface Props {
  result: LevelResult;
  /** Chamado com a tela totalmente coberta: hora de trocar para a jornada por baixo. */
  onSwitch: () => void;
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
// Fica alguns segundos (ou até tocar em Continuar) e então cobre a tela, troca para a jornada e se desfaz suavemente.
export default function LevelComplete({ result, onSwitch, onClose }: Props) {
  const r = result;
  const meta = GAME_META[r.game];
  const [phase, setPhase] = useState<"show" | "cover" | "reveal">("show");
  const [filled, setFilled] = useState(doneCount(r.before)); // a barra anda do valor antigo para o novo
  const leaving = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);
  const cb = useRef({ onSwitch, onClose });
  cb.current = { onSwitch, onClose };

  function leave() {
    if (leaving.current) return;
    leaving.current = true;
    setPhase("cover");
  }

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    const grow = window.setTimeout(() => setFilled(doneCount(r.after)), 450);
    const auto = window.setTimeout(leave, AUTO_CONTINUE_MS);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave(); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(grow); clearTimeout(auto); document.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "cover") {
      const t = window.setTimeout(() => { cb.current.onSwitch(); setPhase("reveal"); }, COVER_MS);
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
      {phase === "show" && <Celebration accent={meta.color} />}
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

          <button ref={btn} className="btn cta lc-go" onClick={leave}>Continuar</button>
          <div className="lc-auto" aria-hidden="true"><i style={{ animationDuration: `${AUTO_CONTINUE_MS}ms` }} /></div>
          <p className="lc-hint">Voltando para a jornada…</p>
          </div>
        </section>
      )}
    </div>,
    document.body
  );
}
