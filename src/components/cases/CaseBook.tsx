"use client";
import Gem from "../Gem";
import { useSfx } from "../useSound";
import { casesOf } from "../../lib/cases/catalog";
import { MEDAL_LABEL, medalFor } from "../../lib/cases/config";
import { type CaseLog, goldCount, recordOf, solvedCount, xpTotal } from "../../lib/cases/progress";
import { KIND_NAME, KIND_OF } from "../../lib/cases/themes";
import { ALL_GAMES, GAME_META } from "../../lib/games";
import { CHAPTERS, isDone, type JourneyGame } from "../../lib/journey";
import { formatTime } from "../../lib/records";
import { sceneOf } from "../../lib/scenes";
import { CaseMedalIcon } from "./CaseArt";

interface Props {
  game: JourneyGame;
  log: CaseLog;
  progress: Record<JourneyGame, string>;
  onGame: (g: JourneyGame) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
}

const fmtDate = (t: number) => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Caderno de investigações de um jogo: todos os mistérios da jornada, por capítulo.
 * Liberados = a fase de referência já foi concluída. Daqui dá para investigar um caso pulado,
 * continuar um caso começado ou rever um caso resolvido (modo revisão, sem XP repetido).
 */
export default function CaseBook({ game, log, progress, onGame, onOpen, onBack }: Props) {
  const sfx = useSfx(game);
  const cases = casesOf(game);
  const solved = solvedCount(log, game);
  const recent = log.history.filter((s) => s.game === game).slice(-6).reverse();
  const titleOf = (id: string) => cases.find((c) => c.id === id)?.title ?? id;

  return (
    <div className="wrap cx-book" style={{ "--gc": GAME_META[game].color } as React.CSSProperties}>
      <button className="cx-back dark" onClick={onBack}>‹ Voltar à jornada</button>
      <h1>Investigações</h1>
      <p className="muted">Mistérios opcionais entre as fases. Resolva para ganhar XP e lupas — ou pule sem perder nada.</p>
      <div className="seg" role="group" aria-label="Escolher jogo">
        {ALL_GAMES.map((g) => (
          <button key={g} className={game === g ? "on" : ""} aria-pressed={game === g} onClick={() => onGame(g)}><Gem kind={g} size={28} />{GAME_META[g].name}</button>
        ))}
      </div>

      <dl className="kpis cx-sum">
        <div><dt>Resolvidos ({GAME_META[game].name})</dt><dd>{solved}<small>/{cases.length}</small></dd></div>
        <div><dt>Lupas de ouro</dt><dd>{goldCount(log, game)}</dd></div>
        <div className="hl"><dt>XP total (todos os jogos)</dt><dd>{xpTotal(log)}</dd></div>
      </dl>
      <p className="muted small">{KIND_NAME[KIND_OF[game]]}: cada mistério libera quando você conclui a fase indicada.</p>

      {CHAPTERS[game].map((ch) => {
        const list = cases.filter((c) => c.chapter === ch.id);
        if (!list.length) return null;
        return (
          <section key={ch.id} className="cx-ch" aria-labelledby={`cxch-${ch.id}`}>
            <h2 id={`cxch-${ch.id}`}>Capítulo {ch.id} · {sceneOf(ch.id).name}</h2>
            <ul className="cx-cards">
              {list.map((c) => {
                const r = recordOf(log, c.id);
                const open = isDone(progress[game], c.level);
                const done = r.solvedAt !== null;
                const going = !done && !!r.draft;
                const status = !open ? `Libera ao concluir o nível ${c.level}` : done ? `${MEDAL_LABEL[medalFor(r.bestHints ?? 3)]} · melhor tempo ${formatTime(r.bestMs ?? 0)}`
                  : going ? "Em andamento" : r.skippedAt ? "Pulado — disponível quando quiser" : "Novo mistério disponível";
                return (
                  <li key={c.id} className={`cx-card${open ? "" : " locked"}${done ? " solved" : ""}`}>
                    <div className="cx-card-ic" aria-hidden="true">{done ? <CaseMedalIcon medal={medalFor(r.bestHints ?? 3)} size={40} /> : open ? "🔍" : "🔒"}</div>
                    <div className="cx-card-b">
                      <b>{c.title}</b>
                      <span>Após o nível {c.level} · {c.difficultyLabel} · {c.estimate[0]}–{c.estimate[1]} min</span>
                      <small>{status}</small>
                    </div>
                    {open && (
                      <button className={`btn sm ${done ? "sec" : "cta"}`} onClick={() => { sfx("ui"); onOpen(c.id); }} aria-label={`${done ? "Rever" : going ? "Continuar" : "Investigar"}: ${c.title}, após o nível ${c.level}`}>
                        {done ? "Rever" : going ? "Continuar" : "Investigar"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="cx-ch" aria-labelledby="cx-hist">
        <h2 id="cx-hist">Histórico de investigações</h2>
        {recent.length === 0 ? <p className="muted">Nenhum mistério de {GAME_META[game].name} resolvido ainda.</p> : (
          <table className="hist">
            <thead><tr><th scope="col">Caso</th><th scope="col">Tempo</th><th scope="col">Dicas</th><th scope="col">Dia</th></tr></thead>
            <tbody>{recent.map((s) => <tr key={`${s.id}-${s.at}`}><td>{titleOf(s.id)}{s.record ? " ★" : ""}</td><td>{formatTime(s.ms)}</td><td>{s.hints}</td><td>{fmtDate(s.at)}</td></tr>)}</tbody>
          </table>
        )}
      </section>
    </div>
  );
}

/** Resumo no Perfil. */
export function CaseSummary({ log, onOpen }: { log: CaseLog; onOpen: () => void }) {
  const total = ALL_GAMES.reduce((t, g) => t + casesOf(g).length, 0);
  const best = log.history.length ? Math.min(...log.history.map((s) => s.ms)) : null;
  return (
    <section className="card cx-profile" aria-labelledby="cx-prof-t">
      <h2 id="cx-prof-t">🔍 Investigações</h2>
      <dl className="kpis sm">
        <div><dt>Mistérios resolvidos</dt><dd>{solvedCount(log)}<small>/{total}</small></dd></div>
        <div className="hl"><dt>Experiência</dt><dd>{xpTotal(log)} XP</dd></div>
        <div><dt>Lupas de ouro</dt><dd>{goldCount(log)}</dd></div>
        <div><dt>Mais rápido</dt><dd>{best === null ? "—" : formatTime(best)}</dd></div>
      </dl>
      <button className="btn sec" onClick={onOpen}>Abrir caderno de investigações</button>
    </section>
  );
}
