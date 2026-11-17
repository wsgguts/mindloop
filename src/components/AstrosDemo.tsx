"use client";
// Prévia do Astros (jogo bônus ainda bloqueado): uma partida de verdade, com o mesmo componente, as mesmas regras,
// a mesma Dica e a mesma animação do jogo — num céu 5×5 exclusivo (ASTROS_DEMO), fora dos 100 níveis oficiais.
//
// A prévia NÃO registra nada: não chama winLevel (progresso, tempo, histórico, conquistas), não envia ao ranking,
// não marca o tutorial como visto e não muda o desbloqueio, que continua sendo só bonusUnlocked (games.ts).
// Etapas: apresentação → partida → convite para liberar o jogo completo (com o que falta em cada jornada).
import AstrosGame from "./AstrosGame";
import AstroSymbol, { MarkSymbol } from "./AstroSymbol";
import Gem from "./Gem";
import { ASTROS_DEMO } from "../lib/astros";
import { ALL_GAMES, BONUS_GAME, GAME_META } from "../lib/games";
import { type JourneyGame, LEVELS_PER_GAME, doneCount } from "../lib/journey";

export type DemoStage = "intro" | "play" | "end";

interface Props {
  stage: DemoStage;
  /** Muda a cada "Jogar de novo" (recomeça a partida do zero). */
  round: number;
  /** A partida está visível e sem nada por cima (tutorial, opinião…). */
  active: boolean;
  progress: Record<JourneyGame, string>;
  onStage: (s: DemoStage) => void;
  onClose: () => void;
  onRules: () => void;
  onFeedback: () => void;
}

const nothing = () => {};

export default function AstrosDemo({ stage, round, active, progress, onStage, onClose, onRules, onFeedback }: Props) {
  const meta = GAME_META[BONUS_GAME];
  const style = { "--gc": meta.color } as React.CSSProperties;

  if (stage === "play") {
    return (
      <div className="ademo-play" style={style}>
        <p className="ademo-ribbon" role="note"><b>Prévia</b><span>não conta progresso nem pontos</span></p>
        <AstrosGame key={`demo-${round}`} puzzle={ASTROS_DEMO} active={active}
          onMenu={onClose} onRules={onRules} onFeedback={onFeedback}
          onWin={nothing} onCelebrated={() => onStage("end")} />
      </div>
    );
  }

  const left = ALL_GAMES.filter((g) => doneCount(progress[g]) < LEVELS_PER_GAME);
  return (
    <div className="ademo" style={style}>
      <div className="ademo-card" role="dialog" aria-labelledby="ademo-title">
        {stage === "intro" ? (
          <>
            <Gem kind={BONUS_GAME} size={96} />
            <span className="badge bonus">Prévia · jogo bônus</span>
            <h1 id="ademo-title">{meta.name}</h1>
            <ul className="ademo-rules" aria-label="Regras">
              <li><AstroSymbol size={22} /><span>Um astro em cada <b>linha</b>, <b>coluna</b> e <b>constelação</b> (área colorida).</span></li>
              <li><span className="ademo-touch" aria-hidden="true"><AstroSymbol size={14} /><AstroSymbol size={14} /></span><span>Dois astros <b>nunca se encostam</b> — nem na diagonal.</span></li>
              <li><MarkSymbol size={18} /><span>Toque numa casa para marcar <b>×</b>; toque de novo para pôr o astro.</span></li>
            </ul>
            <div className="ademo-actions">
              <button className="btn cta" onClick={() => onStage("play")} autoFocus>Jogar a prévia</button>
              <button className="btn sec" onClick={onClose}>Voltar</button>
            </div>
          </>
        ) : (
          <>
            <span className="ademo-star" aria-hidden="true"><AstroSymbol size={72} /></span>
            <span className="badge bonus">Prévia concluída</span>
            <h1 id="ademo-title">Céu completo!</h1>
            <p className="ademo-lead">No jogo completo são <b>100 céus</b> (até 9×9), <b>20 investigações</b> — descubra onde cada personagem estava, pista por pista — e um <b>ranking</b> próprio.</p>
            <div className="ademo-unlock">
              <b>{left.length ? "Para liberar, complete as 4 jornadas" : "Tudo pronto para liberar!"}</b>
              <ul className="bonus-req" aria-label="Jornadas principais">
                {ALL_GAMES.map((g) => {
                  const n = doneCount(progress[g]);
                  return <li key={g} className={n === LEVELS_PER_GAME ? "ok" : ""}><span>{GAME_META[g].name}</span><b>{n === LEVELS_PER_GAME ? "✓ completa" : `${n}/${LEVELS_PER_GAME}`}</b></li>;
                })}
              </ul>
            </div>
            <div className="ademo-actions">
              <button className="btn cta" onClick={onClose} autoFocus>Continuar as jornadas</button>
              <button className="btn sec" onClick={() => onStage("play")}>Jogar de novo</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
