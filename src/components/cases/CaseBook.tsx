"use client";
import { useRef, useState } from "react";
import Gem from "../Gem";
import { useFitHeight } from "../useFitHeight";
import { useSfx } from "../useSound";
import { type Case, casesOf } from "../../lib/cases/catalog";
import { MEDAL_LABEL, medalFor } from "../../lib/cases/config";
import { type CaseLog, goldCount, recordOf, solvedCount, xpTotal } from "../../lib/cases/progress";
import { ALL_GAMES, GAME_META } from "../../lib/games";
import { CHAPTERS, isDone, type JourneyGame } from "../../lib/journey";
import { formatTime } from "../../lib/records";
import { sceneArt, sceneOf } from "../../lib/scenes";
import { CaseMedalIcon } from "./CaseArt";

interface Props {
  game: JourneyGame;
  log: CaseLog;
  progress: Record<JourneyGame, string>;
  onGame: (g: JourneyGame) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  /** Capítulo aberto (null = visão geral). Fica no App para voltar ao mesmo capítulo depois de um mistério. */
  chapter?: number | null;
  onChapter?: (ch: number | null) => void;
  /** Modo Administrador (testes): todos os mistérios liberados. */
  admin?: boolean;
  /** Jogos que aparecem na troca de jogo (o bônus só depois de liberado). */
  games?: JourneyGame[];
}

const fmtDate = (t: number) => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Caderno de investigações — o mesmo desenho da jornada:
 *  • visão geral: os 4 jogos, resumo, "Próximo mistério" e os capítulos em cartões (pintura de cada mundo,
 *    mistérios resolvidos, novos disponíveis), cabendo na tela do celular sem rolar;
 *  • capítulo: barra compacta (‹ Capítulos, mundo, anterior/seguinte) e os mistérios daquele capítulo;
 *  • histórico: as últimas soluções.
 * Liberado = a fase de referência já foi concluída. Dá para investigar um caso pulado, continuar um começado ou
 * rever um resolvido (modo revisão, sem XP repetido).
 */
export default function CaseBook({ game, log, progress, onGame, onOpen, onBack, chapter = null, onChapter, admin = false, games = ALL_GAMES }: Props) {
  const sfx = useSfx(game);
  const [localCh, setLocalCh] = useState<number | null>(chapter);
  const ch = onChapter ? chapter : localCh;
  const setCh = (c: number | null) => { sfx("ui"); if (onChapter) onChapter(c); else setLocalCh(c); window.scrollTo(0, 0); };
  const [history, setHistory] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useFitHeight(rootRef, [ch, history, game]);

  const cases = casesOf(game);
  const open = (c: Case) => admin || isDone(progress[game], c.level);
  const solved = (c: Case) => recordOf(log, c.id).solvedAt !== null;
  const style = { "--gc": GAME_META[game].color } as React.CSSProperties;

  // ---------------------------------------------------------------- histórico
  if (history) {
    const recent = log.history.filter((s) => s.game === game).slice(-12).reverse();
    const titleOf = (id: string) => cases.find((c) => c.id === id)?.title ?? id;
    return (
      <div ref={rootRef} className="journey jmap cxbook" style={style}>
        <header className="jmapbar">
          <button className="back" onClick={() => { sfx("ui"); setHistory(false); }}>‹ Voltar</button>
          <div className="jmap-t"><b>Histórico</b><small>{GAME_META[game].name} · últimas soluções</small></div>
          <span />
        </header>
        {recent.length === 0 ? <p className="jmap-tip">Nenhum mistério de {GAME_META[game].name} resolvido ainda.</p> : (
          <div className="card cx-hist-card">
            <table className="hist">
              <thead><tr><th scope="col">Caso</th><th scope="col">Tempo</th><th scope="col">Dicas</th><th scope="col">Dia</th></tr></thead>
              <tbody>{recent.map((s) => <tr key={`${s.id}-${s.at}`}><td>{titleOf(s.id)}{s.record ? " ★" : ""}</td><td>{formatTime(s.ms)}</td><td>{s.hints}</td><td>{fmtDate(s.at)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------- capítulo
  if (ch !== null) {
    const chs = CHAPTERS[game];
    const world = sceneOf(ch);
    const list = cases.filter((c) => c.chapter === ch);
    return (
      <div ref={rootRef} className="journey jmap cxbook" style={style}>
        <header className="jmapbar">
          <button className="back" onClick={() => setCh(null)} aria-label="Voltar aos capítulos do caderno">‹ Capítulos</button>
          <div className="jmap-t">
            <b>{world.name}</b>
            <small>Cap. {ch} · {list.filter(solved).length}/{list.length} mistérios resolvidos</small>
          </div>
          <span className="jmap-nav">
            <button onClick={() => setCh(ch - 1)} disabled={ch === 1} aria-label="Capítulo anterior">‹</button>
            <button onClick={() => setCh(ch + 1)} disabled={ch === chs.length} aria-label="Próximo capítulo">›</button>
          </span>
        </header>
        <div className="cx-chart" aria-hidden="true"><img src={sceneArt(world)} alt="" decoding="async" /></div>
        <ul className="cx-cards">
          {list.map((c) => {
            const r = recordOf(log, c.id);
            const isOpen = open(c);
            const done = r.solvedAt !== null;
            const going = !done && !!r.draft;
            const status = !isOpen ? `Libera ao concluir o nível ${c.level}` : done ? `${MEDAL_LABEL[medalFor(r.bestHints ?? 3)]} · melhor tempo ${formatTime(r.bestMs ?? 0)}`
              : going ? "Em andamento" : r.skippedAt ? "Pulado — disponível quando quiser" : "Novo mistério disponível";
            return (
              <li key={c.id} className={`cx-card${isOpen ? "" : " locked"}${done ? " solved" : ""}`}>
                <div className="cx-card-ic" aria-hidden="true">{done ? <CaseMedalIcon medal={medalFor(r.bestHints ?? 3)} size={40} /> : isOpen ? "🔍" : "🔒"}</div>
                <div className="cx-card-b">
                  <b>{c.title}</b>
                  <span>Após o nível {c.level} · {c.structureName} · {c.difficultyLabel}</span>
                  <small>{status}</small>
                </div>
                {isOpen && (
                  <button className={`btn sm ${done ? "sec" : "cta"}`} onClick={() => { sfx("ui"); onOpen(c.id); }} aria-label={`${done ? "Rever" : going ? "Continuar" : "Investigar"}: ${c.title}, após o nível ${c.level}`}>
                    {done ? "Rever" : going ? "Continuar" : "Investigar"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // ---------------------------------------------------------------- visão geral
  const next = cases.find((c) => open(c) && !solved(c));
  const lockedNext = cases.find((c) => !open(c));
  return (
    <div ref={rootRef} className="journey jov fit cxbook" style={style}>
      <header className="jhead">
        <div className="jtop">
          <button className="back" onClick={onBack}>‹ Jornada</button>
          <button className="back jhelp" onClick={() => { sfx("ui"); setHistory(true); }}>🕘 Histórico</button>
        </div>
        <div className="title">
          <span className="cxbook-ic" aria-hidden="true">🔍</span>
          <div><h1>Investigações</h1><p>{solvedCount(log, game)}/{cases.length} resolvidos · {goldCount(log, game)} lupas de ouro · {xpTotal(log)} XP</p></div>
        </div>
      </header>

      <div className="cx-games" role="group" aria-label="Escolher jogo">
        {games.map((g) => (
          <button key={g} className={game === g ? "on" : ""} aria-pressed={game === g} onClick={() => { sfx("ui"); onGame(g); }}>
            <Gem kind={g} size={26} /><span>{GAME_META[g].name}</span>
          </button>
        ))}
      </div>

      <div className="jov-actions one">
        {next ? (
          <button className="jcontinue" onClick={() => { sfx("ui"); onOpen(next.id); }} aria-label={`Próximo mistério: ${next.title}`}>
            <span>{recordOf(log, next.id).draft ? "Continuar mistério" : "Próximo mistério"}</span>
            <b>{next.title} ›</b>
          </button>
        ) : (
          <p className="jcontinue off" role="note">
            <span>{lockedNext ? "Nenhum mistério novo por enquanto" : "Caderno completo!"}</span>
            <b>{lockedNext ? `O próximo libera no nível ${lockedNext.level}` : "Todos os mistérios resolvidos ★"}</b>
          </p>
        )}
      </div>

      <section className="jov-sec" aria-labelledby={`cxov-${game}`}>
        <h2 id={`cxov-${game}`}>Mistérios por capítulo</h2>
        <ol className="jgrid">
          {CHAPTERS[game].map((c) => {
            const list = cases.filter((x) => x.chapter === c.id);
            const n = list.filter(solved).length;
            const avail = list.filter((x) => open(x) && !solved(x)).length;
            const anyOpen = list.some(open);
            const full = list.length > 0 && n === list.length;
            const w = sceneOf(c.id);
            return (
              <li key={c.id}>
                <button className={`jcard${full ? " full" : ""}${anyOpen ? "" : " shut"}${avail ? " here" : ""}`} onClick={() => setCh(c.id)}
                  aria-label={`Capítulo ${c.id}: ${w.name}, ${n} de ${list.length} mistérios resolvidos${avail ? `, ${avail} disponíve${avail > 1 ? "is" : "l"}` : ""}${anyOpen ? "" : ", bloqueado"}`}>
                  <img src={sceneArt(w)} alt="" loading="lazy" decoding="async" />
                  <span className="jcard-tag" aria-hidden="true">{full ? "✓" : anyOpen ? c.id : "🔒"}</span>
                  <span className="jcard-b">
                    <b>{w.name}</b>
                    <small>🔍 {n}/{list.length}{avail > 0 ? <> · <em className="jcard-now">{avail} {avail > 1 ? "novos" : "novo"}</em></> : " resolvidos"}</small>
                    <i className="jcard-bar" aria-hidden="true"><i style={{ width: `${list.length ? (n / list.length) * 100 : 0}%` }} /></i>
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
