"use client";
// Tela de história do caso: o narrador do jogo conta o que aconteceu, fala por fala (c.narracao).
// Uma função só — o jogador sai sabendo o que aconteceu, quem está envolvido e qual é a pergunta.
// Nada de quebra-cabeça aqui (regras, pistas, cofre): isso fica na tela de investigação.
//   • Texto em máquina de escrever; um toque completa a fala, outro avança. "Pular" vai direto à pergunta.
//   • Nomes destacados com o desenho do personagem/objeto; tocar no nome mostra uma linha sobre ele.
//   • O narrador muda de expressão a cada fala (feliz, assustado, desconfiado, pensativo).
import { useEffect, useRef, useState } from "react";
import Art from "../Art";
import type { Case } from "../../lib/cases/catalog";
import type { Expressao } from "../../lib/cases/narracao";
import { textoPuro } from "../../lib/cases/narracao";

const ROSTO: Record<Expressao, string> = { feliz: "😄", assustado: "😱", desconfiado: "🤨", pensativo: "🤔" };
const VELOCIDADE_MS = 24;

interface Props {
  c: Case; style: React.CSSProperties; meta: string; started: boolean; exitLabel: string;
  onBack: () => void; onStart: () => void; onTick?: () => void;
}

export default function CaseIntro({ c, style, meta, started, exitLabel, onBack, onStart, onTick }: Props) {
  const falas = c.narracao, last = falas.length - 1;
  const [i, setI] = useState(0);
  const [chars, setChars] = useState(0);
  const [tip, setTip] = useState<string | null>(null);
  const reduce = useRef(false);
  const instant = useRef(false); // "Pular": a última fala aparece inteira, sem digitar

  const fala = falas[i];
  const total = fala ? textoPuro(fala.texto).length : 0;
  const typing = chars < total;
  const end = i === last && !typing;

  useEffect(() => { reduce.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false; }, []);
  // Máquina de escrever (sem animação para quem pediu menos movimento).
  useEffect(() => {
    setTip(null);
    if (reduce.current || instant.current) { instant.current = false; setChars(total); return; }
    setChars(0);
    const t = window.setInterval(() => setChars((n) => { if (n + 1 >= total) window.clearInterval(t); return Math.min(total, n + 1); }), VELOCIDADE_MS);
    return () => window.clearInterval(t);
  }, [i, total]);

  const advance = () => {
    if (typing) { setChars(total); return; }
    if (i < last) { onTick?.(); setI(i + 1); }
  };
  const skip = () => { instant.current = true; if (i === last) setChars(total); else setI(last); };

  const entity = (name: string) => c.model.people.find((p) => p.label === name) ?? c.model.objects.find((o) => o.label === name);
  const tipText = (name: string) => {
    const p = c.cast.find((x) => x.name === name);
    if (p) return p.bio;
    return c.objectCards.find((o) => o.label === name)?.desc ?? "";
  };

  // O texto até onde a máquina de escrever chegou, com os nomes destacados.
  const render = () => {
    let left = chars;
    return fala.texto.split(/(\*\*.+?\*\*)/).filter(Boolean).map((seg, k) => {
      if (left <= 0) return null;
      const name = seg.startsWith("**") ? seg.slice(2, -2) : null;
      const s = (name ?? seg).slice(0, left);
      left -= (name ?? seg).length;
      if (!name) return <span key={k}>{s}</span>;
      const e = entity(name);
      return (
        <button key={k} type="button" className={`cx-intro-name${tip === name ? " on" : ""}`} aria-expanded={tip === name}
          onClick={(ev) => { ev.stopPropagation(); setTip(tip === name ? null : name); }}>
          {e && <span className="cx-intro-ico" aria-hidden="true"><Art e={e} className="fill" /></span>}<b>{s}</b>
        </button>
      );
    });
  };

  return (
    <div className="wrap cx-intro" data-game={c.game} style={style}>
      <header className="cx-intro-bar">
        <button className="cx-intro-link" onClick={onBack} aria-label={started ? "Voltar à investigação" : exitLabel}>‹ Voltar</button>
        <p className="cx-intro-meta">{meta}</p>
        {i < last || typing
          ? <button className="cx-intro-link" onClick={skip}>Pular ›</button>
          : <span className="cx-intro-link ghost" aria-hidden="true">Pular ›</span>}
      </header>

      <div className="cx-intro-art">
        <img src={c.art} alt="" decoding="async" />
        <h1 id="cx-title">{c.title}</h1>
      </div>

      <section className="cx-intro-talk" onClick={advance} aria-label={`História, contada por ${c.narrator.name}`}>
        <div className={`cx-intro-who ex-${fala.expressao}`} key={i}>
          <img className="art is-cast fill" src={c.narrator.img} alt="" width={120} height={120} />
          <span className="cx-intro-face" aria-hidden="true">{ROSTO[fala.expressao]}</span>
          <small>{c.narrator.name}</small>
        </div>
        <div className="cx-intro-bubble">
          <p className="cx-intro-text" aria-hidden="true">{render()}{typing && <span className="cx-intro-caret" />}</p>
          <p className="sr" aria-live="polite">{textoPuro(fala.texto)}</p>
          {tip && <p className="cx-intro-tip" role="note"><b>{tip}:</b> {tipText(tip)}</p>}
          <ol className="cx-intro-dots" aria-label={`Fala ${i + 1} de ${falas.length}`}>
            {falas.map((_, k) => <li key={k} className={k <= i ? "on" : ""} />)}
          </ol>
        </div>
      </section>

      <div className="cx-intro-foot">
        {end ? (
          <div className="cx-intro-end">
            <p className="cx-intro-q"><span aria-hidden="true">🔍</span> {c.pergunta}</p>
            <button className="btn cta" autoFocus onClick={onStart}>{started ? "Continuar investigação" : "Começar investigação"}</button>
          </div>
        ) : (
          <button className="cx-intro-next" onClick={advance}>{typing ? "Toque para ver tudo" : "Toque para continuar"} <span aria-hidden="true">›</span></button>
        )}
      </div>
    </div>
  );
}
