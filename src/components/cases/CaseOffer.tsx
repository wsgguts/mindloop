"use client";
import { useEffect, useRef } from "react";
import Gem from "../Gem";
import { useSfx } from "../useSound";
import type { Case } from "../../lib/cases/catalog";
import { KIND_NAME } from "../../lib/cases/themes";
import { GAME_META } from "../../lib/games";
import { GAME_LOOK } from "../../lib/scenes";
import { CaseScene, Magnifier } from "./CaseArt";

interface Props {
  c: Case;
  /** Próxima fase tradicional (para onde "Pular" leva). */
  nextLevel: number;
  onInvestigate: () => void;
  onSkip: () => void;
}

/**
 * Convite para a investigação, mostrado depois do "Continuar" da tela de parabéns.
 * Opcional de verdade: "Pular" vai direto para a próxima fase, sem perder nada.
 */
export default function CaseOffer({ c, nextLevel, onInvestigate, onSkip }: Props) {
  const look = GAME_LOOK[c.game];
  const sfx = useSfx(c.game);
  const go = useRef<HTMLButtonElement>(null);
  useEffect(() => { go.current?.focus({ preventScroll: true }); sfx("hint"); /* "descoberta": brilho sonoro discreto */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [a, b] = c.estimate;

  return (
    <div className="cx-offer-wrap" style={{ "--gc": GAME_META[c.game].color, "--gl": look.light, "--gd": look.deep } as React.CSSProperties}>
      <section className="cx-offer" aria-labelledby="cx-offer-title" aria-describedby="cx-offer-desc">
        <div className="cx-hero" aria-hidden="true">
          <img className="cx-hero-bg" src={c.art} alt="" decoding="async" />
          <div className="cx-photo p1"><img src={c.art} alt="" decoding="async" /></div>
          <div className="cx-photo p2"><CaseScene kind={c.kind} look={look} /></div>
          <div className="cx-note">
            <b>CASO</b>
            <span>{c.title}</span>
          </div>
          <Magnifier size={112} className="cx-lens" />
          <span className="cx-spark s1">✦</span><span className="cx-spark s2">✦</span>
          <span className="cx-world"><Gem kind={c.game} size={20} />{c.world}</span>
        </div>
        <div className="cx-body">
          <span className="cx-pill">Desafio especial</span>
          <h1 id="cx-offer-title">Um novo mistério surgiu!</h1>
          <p id="cx-offer-desc">{c.description}</p>
          <p className="cx-meta"><b>{c.title}</b> · {KIND_NAME[c.kind]} · {c.difficultyLabel}</p>
          <div className="cx-actions">
            <button ref={go} className="cx-go" onClick={() => { sfx("ui"); onInvestigate(); }}>Investigar agora</button>
            <button className="cx-skip" onClick={() => { sfx("ui"); onSkip(); }} aria-label={`Pular investigação e ir para o nível ${nextLevel}`}>Pular</button>
          </div>
          <p className="cx-foot">Desafio opcional • Aproximadamente {a} a {b} minutos</p>
          <p className="cx-foot small">Pular não tira pontos nem bloqueia nada: o mistério fica guardado no caderno de investigações.</p>
        </div>
      </section>
    </div>
  );
}
