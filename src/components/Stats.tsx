"use client";
import { useState } from "react";
import Gem from "./Gem";
import { ALL_GAMES, GAME_META } from "../lib/games";
import type { PlayerLog } from "../lib/history";
import { LEVELS_PER_GAME, type JourneyGame } from "../lib/journey";
import { formatTime } from "../lib/records";
import { MIN_MATCHES, gameStats, overallStats, pct } from "../lib/stats";

const fmtDay = (t: number | null) => (t === null ? "antes do histórico" : new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));

function Trend({ v }: { v: number | null }) {
  if (v === null) return <span className="trend none">Jogue mais partidas para ver sua evolução</span>;
  const d = Math.round(v * 100);
  if (Math.abs(d) < 3) return <span className="trend flat">→ Ritmo estável nas últimas partidas</span>;
  return d > 0
    ? <span className="trend up">▲ {d} pontos de ritmo melhor que nas 5 partidas anteriores</span>
    : <span className="trend down">▼ {-d} pontos de ritmo abaixo das 5 partidas anteriores</span>;
}

export default function Stats({ log, progress }: { log: PlayerLog; progress: Record<JourneyGame, string> }) {
  const [game, setGame] = useState<JourneyGame>("sudoku");
  const o = overallStats(log, progress);
  const per = ALL_GAMES.map((g) => gameStats(g, log, progress[g]));
  const gs = per.find((s) => s.game === game)!;
  const maxDay = Math.max(1, ...o.activity.map((a) => a.count));
  const enough = o.matches >= MIN_MATCHES;
  const recentMax = Math.max(1.5, ...gs.recent.map((r) => r.speed));
  const history = log.matches.filter((m) => m.game === game).slice(-6).reverse();

  return (
    <section className="stats" aria-labelledby="st-title">
      <h2 id="st-title">Meu desempenho</h2>
      {!enough && (
        <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
          <span>{o.matches === 0 ? "Você ainda não concluiu nenhuma partida." : `Você concluiu ${o.matches} partida${o.matches > 1 ? "s" : ""}.`} As médias aparecem a partir de {MIN_MATCHES} partidas concluídas — jogue mais um pouco para gerá-las!</span></div>
      )}

      <dl className="kpis">
        <div><dt>Partidas concluídas</dt><dd>{o.matches}</dd></div>
        <div><dt>Fases concluídas</dt><dd>{o.levelsDone}<small>/{o.totalLevels}</small></dd></div>
        <div><dt>Aproveitamento geral</dt><dd>{pct(o.completion)}</dd></div>
        <div><dt>Jornadas concluídas</dt><dd>{o.journeysDone}<small>/4</small></dd></div>
        <div title="Tempo de referência ÷ seu tempo. 100% = no tempo de referência; acima de 100% = mais rápido.">
          <dt>Ritmo médio</dt><dd>{o.avgSpeed === null ? "—" : pct(o.avgSpeed)}</dd></div>
        <div className={o.records ? "hl" : ""}><dt>Recordes pessoais</dt><dd>{o.records}</dd></div>
      </dl>
      <p className="muted small">
        <b>Ritmo</b> compara jogos diferentes de forma justa: cada nível tem um tempo de referência (pelo tamanho da grade e pela dificuldade). 100% = terminou exatamente nele; 150% = 1,5× mais rápido.
      </p>
      <Trend v={o.trend} />

      <div className="chart-panel">
        <h3>Partidas nos últimos 14 dias</h3>
        <div className="vbars" role="img" aria-label={`Partidas por dia nos últimos 14 dias: ${o.activity.map((a) => `${a.label}: ${a.count}`).join(", ")}`}>
          {o.activity.map((a, i) => (
            <div key={a.day} className="vbar" title={`${a.label}: ${a.count} partida${a.count === 1 ? "" : "s"}`}>
              <span className="vbar-v">{a.count || ""}</span>
              <i style={{ height: `${(a.count / maxDay) * 100}%` }} />
              <span className="vbar-l">{i % 2 === 1 || i === 13 ? a.label : ""}</span>
            </div>
          ))}
        </div>
        <p className="chart-note">Dias jogados no total: <b>{o.days}</b> · melhor sequência de vitórias: <b>{o.bestStreak}</b></p>
      </div>

      <div className="chart-panel">
        <h3>Comparação entre jogos</h3>
        <ul className="hbars">
          {per.map((s) => (
            <li key={s.game} title={`${GAME_META[s.game].name}: ${s.levelsDone} de ${LEVELS_PER_GAME} níveis`}>
              <span className="hb-name"><Gem kind={s.game} size={22} />{GAME_META[s.game].name}</span>
              <span className="hb-track"><i style={{ width: `${s.levelsDone}%`, background: GAME_META[s.game].color }} /></span>
              <span className="hb-val">{s.levelsDone}/{LEVELS_PER_GAME}</span>
              <span className="hb-sub">{s.matches} partida{s.matches === 1 ? "" : "s"} · ritmo {s.avgSpeed === null ? "—" : pct(s.avgSpeed)}</span>
            </li>
          ))}
        </ul>
      </div>

      <h3>Desempenho por jogo</h3>
      <div className="seg" role="group" aria-label="Escolher jogo">
        {ALL_GAMES.map((g) => (
          <button key={g} className={game === g ? "on" : ""} aria-pressed={game === g} onClick={() => setGame(g)}>
            <Gem kind={g} size={28} />{GAME_META[g].name}
          </button>
        ))}
      </div>
      <div className="card gstats" style={{ "--gc": GAME_META[game].color } as React.CSSProperties}>
        {gs.matches === 0 ? (
          <p>Você ainda não concluiu partidas de {GAME_META[game].name}. Abra a jornada no Início e comece pelo nível 1!</p>
        ) : (
          <>
            <dl className="kpis sm">
              <div><dt>Partidas</dt><dd>{gs.matches}</dd></div>
              <div><dt>Níveis</dt><dd>{gs.levelsDone}<small>/{LEVELS_PER_GAME}</small></dd></div>
              <div><dt>Tempo médio por fase</dt><dd>{gs.avgMs === null ? "—" : formatTime(gs.avgMs)}</dd></div>
              <div className="hl"><dt>Melhor tempo</dt><dd>{gs.bestMs === null ? "—" : formatTime(gs.bestMs)}{gs.bestLevel && <small> nível {gs.bestLevel}</small>}</dd></div>
              <div><dt>Ritmo médio</dt><dd>{gs.avgSpeed === null ? "—" : pct(gs.avgSpeed)}</dd></div>
              <div><dt>Tentativas por vitória</dt><dd>{gs.attemptsPerWin === null ? "—" : gs.attemptsPerWin.toFixed(1).replace(".", ",")}</dd></div>
            </dl>
            {gs.avgMs === null && <p className="muted small">As médias deste jogo aparecem a partir de {MIN_MATCHES} partidas concluídas.</p>}
            <Trend v={gs.trend} />
            <div className="chart-panel">
              <h3>Evolução do ritmo (últimas {gs.recent.length} vitórias)</h3>
              <div className="vbars evo" role="img" aria-label={`Ritmo das últimas vitórias: ${gs.recent.map((r) => `nível ${r.level}, ${pct(r.speed)}`).join("; ")}`}>
                <span className="ref-line" style={{ bottom: `${(1 / recentMax) * 100}%` }}><em>100%</em></span>
                {gs.recent.map((r, i) => (
                  <div key={i} className="vbar" title={`Nível ${r.level}: ${formatTime(r.ms)} · ritmo ${pct(r.speed)}`}>
                    <i style={{ height: `${Math.min(100, (r.speed / recentMax) * 100)}%`, background: GAME_META[game].color }} />
                    <span className="vbar-l">{r.level}</span>
                  </div>
                ))}
              </div>
              <p className="chart-note">Barra = ritmo de cada vitória (número embaixo = nível). Acima da linha: mais rápido que a referência.</p>
            </div>
            <h3>Histórico recente</h3>
            <table className="hist">
              <thead><tr><th scope="col">Nível</th><th scope="col">Tempo</th><th scope="col">Dia</th><th scope="col"><span className="sr">Destaque</span></th></tr></thead>
              <tbody>
                {history.map((m) => (
                  <tr key={m.id}><td>{m.level}</td><td>{formatTime(m.ms)}</td><td>{fmtDay(m.at)}</td><td>{m.record ? "★ recorde" : m.first ? "1ª vez" : ""}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
