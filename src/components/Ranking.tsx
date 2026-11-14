"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Gem from "./Gem";
import type { Identity } from "../lib/cloud";
import { ALL_GAMES, GAME_META } from "../lib/games";
import type { JourneyGame } from "../lib/journey";
import type { Times } from "../lib/records";
import { type RankRow, RankError, fetchRanking, rankingConfig, syncGame } from "../lib/ranking";
import { BANDS, type Band, gameScore, overallScore } from "../lib/scoring";

interface Props {
  times: Record<JourneyGame, Times>;
  /** Identidade anônima do jogador (a mesma do progresso salvo no servidor). */
  me: Identity | null;
  /** Entrar ou sair do ranking (nada é apagado ao sair). */
  onListed: (listed: boolean) => Promise<void>;
  /** Sem identidade ainda (sem internet na hora de criar, ou apelido em conflito): leva aos Ajustes. */
  onFixIdentity: () => void;
  /** O servidor não reconhece mais esta identidade. */
  onAuthLost: () => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function Ranking({ times, me, onListed, onFixIdentity, onAuthLost }: Props) {
  const online = !!rankingConfig();
  const [game, setGame] = useState<JourneyGame | null>(null);
  const [band, setBand] = useState<Band>("all");
  const [rows, setRows] = useState<RankRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const synced = useRef(false);
  const req = useRef(0);
  const listed = me?.listed === true;

  const local = ALL_GAMES.map((g) => ({ g, score: gameScore(g, times[g]), levels: Object.keys(times[g]).length }));
  const localTotal = overallScore(local.map((x) => x.score));

  const load = useCallback(async () => {
    if (!online) return;
    const n = ++req.current; // ignora respostas antigas se a pessoa trocar de filtro rápido
    setLoading(true); setError(null);
    try {
      if (me && !synced.current) {
        synced.current = true;
        for (const g of ALL_GAMES) await syncGame(me, g, times[g]);
      }
      const r = await fetchRanking(game, game ? band : "all", me?.id ?? null);
      if (n === req.current) setRows(r);
    } catch (e) {
      if (n !== req.current) return;
      if (e instanceof RankError && e.code === "AUTH") onAuthLost();
      setError(e instanceof RankError ? e.message : "Não foi possível carregar o ranking agora.");
    } finally { if (n === req.current) setLoading(false); }
  }, [online, me, game, band, times, onAuthLost]);

  useEffect(() => { load(); }, [load]);

  async function toggle(next: boolean) {
    setBusy(true); setError(null);
    try { await onListed(next); setConfirmLeave(false); synced.current = false; }
    catch (e) { setError(e instanceof RankError ? e.message : "Não foi possível agora. Tente de novo."); }
    finally { setBusy(false); }
  }

  const podium = rows?.filter((r) => r.pos <= 3).slice(0, 3) ?? [];
  const rest = rows?.filter((r) => !podium.includes(r)) ?? [];
  const mine = rows?.find((r) => r.is_me);
  const myScore = game ? local.find((x) => x.g === game)!.score : localTotal;
  const myLevels = game ? local.find((x) => x.g === game)!.levels : local.reduce((a, x) => a + x.levels, 0);

  return (
    <div className="wrap rank-page">
      <div className="page-head">
        <h1>Ranking</h1>
        {online && <button className="btn sec sm" onClick={() => load()} disabled={loading} aria-label="Atualizar ranking">{loading ? "…" : "↻ Atualizar"}</button>}
      </div>

      <div className="chips" role="group" aria-label="Modalidade do ranking">
        <button className={game === null ? "on" : ""} aria-pressed={game === null} onClick={() => setGame(null)}>Geral</button>
        {ALL_GAMES.map((g) => (
          <button key={g} className={game === g ? "on" : ""} aria-pressed={game === g} onClick={() => setGame(g)}>
            <Gem kind={g} size={20} />{GAME_META[g].name}
          </button>
        ))}
      </div>
      {game && (
        <div className="chips small" role="group" aria-label="Dificuldade">
          {BANDS.map((b) => <button key={b.id} className={band === b.id ? "on" : ""} aria-pressed={band === b.id} onClick={() => setBand(b.id)}>{b.label}</button>)}
        </div>
      )}

      <div className="my-score">
        <div>
          <span>Você{me ? ` · ${me.nick}` : ""}</span>
          <b>{fmt(myScore)} <small>pts</small></b>
          <small>{myLevels} {game ? "níveis" : "fases"}{mine ? ` · ${mine.pos}º lugar` : ""}</small>
        </div>
        {online && me && (
          listed ? (
            confirmLeave ? (
              <div className="my-actions">
                <button className="btn sm" onClick={() => toggle(false)} disabled={busy}>Sair</button>
                <button className="btn sec sm" onClick={() => setConfirmLeave(false)}>Cancelar</button>
              </div>
            ) : <button className="btn sec sm my-leave" onClick={() => setConfirmLeave(true)}>Sair do ranking</button>
          ) : <button className="btn cta sm" onClick={() => toggle(true)} disabled={busy}>{busy ? "…" : "Participar"}</button>
        )}
      </div>
      {confirmLeave && <p className="muted small">Seu apelido some da lista, mas seus pontos e seu progresso continuam guardados. Você pode voltar quando quiser.</p>}
      {online && me && !listed && <p className="muted small">Participar mostra só seu <b>apelido</b> e seus <b>pontos</b> para os outros jogadores.</p>}

      {!online ? (
        <div className="note info" role="note"><b aria-hidden="true">ℹ</b><span>O ranking online não está ativado neste site. Sua pontuação acima é real e fica guardada.</span></div>
      ) : !me ? (
        <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
          <span>Seu perfil ainda não está conectado ao servidor. <button className="linkish" onClick={onFixIdentity}>Resolver em Ajustes</button></span></div>
      ) : null}

      {online && (
        <section aria-labelledby="rk-title" aria-busy={loading}>
          <h2 id="rk-title" className="sr">{game ? `Ranking ${GAME_META[game].name}` : "Ranking geral"}</h2>
          {error && <div className="note warn" role="alert"><b aria-hidden="true">!</b><span>{error}</span></div>}
          {!rows && loading && <div className="skeleton-list" aria-label="Carregando"><i /><i /><i /></div>}
          {rows && rows.length === 0 && !loading && <p className="muted">Ninguém pontuou aqui ainda.</p>}
          {podium.length > 0 && (
            <ol className="podium" aria-label="Pódio">
              {[podium[1], podium[0], podium[2]].map((r, i) => r && (
                <li key={`${r.pos}-${r.nick}`} className={`pod p${r.pos}${r.is_me ? " me" : ""}`} style={{ order: i }}>
                  <span className="pod-medal" aria-hidden="true">{r.pos === 1 ? "🥇" : r.pos === 2 ? "🥈" : "🥉"}</span>
                  <b className="pod-nick">{r.nick}{r.is_me && <em> (você)</em>}</b>
                  <span className="pod-score">{fmt(r.score)} pts</span>
                  <span className="pod-step"><span className="sr">{r.pos}º lugar</span><span aria-hidden="true">{r.pos}</span></span>
                </li>
              ))}
            </ol>
          )}
          {rest.length > 0 && (
            <table className="rank-table">
              <thead><tr><th scope="col">#</th><th scope="col">Jogador</th><th scope="col">Pontos</th><th scope="col">Fases</th><th scope="col" title="Nível mais alto concluído">Maior nível</th></tr></thead>
              <tbody>
                {rest.map((r) => (
                  <tr key={`${r.pos}-${r.nick}`} className={r.is_me ? "me" : ""} aria-current={r.is_me ? "true" : undefined}>
                    <td>{r.pos}º</td><td className="rk-nick">{r.nick}{r.is_me && <em> você</em>}</td><td>{fmt(r.score)}</td><td>{r.levels}</td><td>{r.best_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <details className="card how">
        <summary>Como a pontuação é calculada</summary>
        <ul className="list">
          <li>Cada nível tem um <b>tempo de referência</b>, conforme o jogo, o tamanho da grade e a dificuldade.</li>
          <li>Pontos do nível = <b>peso × (100 + 100 × ritmo)</b>. O peso vai de 1 (nível 1) a 3 (nível 100); o ritmo é a referência ÷ seu tempo, no máximo 1.</li>
          <li>Vale o <b>melhor tempo</b> de cada nível: repetir um nível só melhora a pontuação se você for mais rápido.</li>
          <li>No <b>ranking geral</b>, os quatro jogos valem o mesmo máximo (40.000) e há bônus de <b>5% por jogo extra</b> jogado.</li>
          <li>Os pontos são calculados pelo servidor, que recusa tempos impossíveis e níveis pulados.</li>
        </ul>
      </details>
    </div>
  );
}
