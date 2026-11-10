"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Gem from "./Gem";
import { ALL_GAMES, GAME_META } from "../lib/games";
import type { JourneyGame } from "../lib/journey";
import { validateNick } from "../lib/nick";
import type { Times } from "../lib/records";
import { type RankIdentity, type RankRow, RankError, fetchRanking, leaveRanking, rankingConfig, registerPlayer, renamePlayer, syncGame } from "../lib/ranking";
import { BANDS, type Band, gameScore, overallScore } from "../lib/scoring";

interface Props {
  nick: string;
  times: Record<JourneyGame, Times>;
  me: RankIdentity | null;
  onIdentity: (id: RankIdentity | null) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function Ranking({ nick, times, me, onIdentity }: Props) {
  const online = !!rankingConfig();
  const [game, setGame] = useState<JourneyGame | null>(null);
  const [band, setBand] = useState<Band>("all");
  const [rows, setRows] = useState<RankRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [nickForm, setNickForm] = useState<null | "join" | "rename">(null);
  const [draft, setDraft] = useState(nick);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const synced = useRef(false);
  const req = useRef(0);

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
      if (e instanceof RankError && e.code === "AUTH") { onIdentity(null); setError(e.message); }
      else setError(e instanceof RankError ? e.message : "Não foi possível carregar o ranking agora.");
    } finally { if (n === req.current) setLoading(false); }
  }, [online, me, game, band, times, onIdentity]);

  useEffect(() => { load(); }, [load]);

  async function submitNick(e: React.FormEvent) {
    e.preventDefault();
    const err = validateNick(draft);
    if (err) return setFormErr(err);
    setBusy(true); setFormErr(null);
    try {
      const v = draft.trim();
      const id = nickForm === "rename" && me ? await renamePlayer(me, v) : await registerPlayer(v);
      synced.current = false;
      onIdentity(id);
      setNickForm(null);
    } catch (e2) {
      setFormErr(e2 instanceof RankError ? e2.message : "Não foi possível salvar agora.");
    } finally { setBusy(false); }
  }

  async function leave() {
    if (!me) return;
    setBusy(true);
    try { await leaveRanking(me); onIdentity(null); setConfirmLeave(false); setRows(null); }
    catch (e) { setError(e instanceof RankError ? e.message : "Não foi possível sair agora."); }
    finally { setBusy(false); }
  }

  const podium = rows?.filter((r) => r.pos <= 3).slice(0, 3) ?? [];
  const rest = rows?.filter((r) => !podium.includes(r)) ?? [];
  const mine = rows?.find((r) => r.is_me);
  const title = game ? `Ranking ${GAME_META[game].name}` : "Ranking geral";

  return (
    <div className="wrap rank-page">
      <h1>Ranking</h1>

      <div className="chips" role="group" aria-label="Modalidade do ranking">
        <button className={game === null ? "on" : ""} aria-pressed={game === null} onClick={() => setGame(null)}>Geral</button>
        {ALL_GAMES.map((g) => (
          <button key={g} className={game === g ? "on" : ""} aria-pressed={game === g} onClick={() => setGame(g)}>
            <Gem kind={g} size={20} />{GAME_META[g].name}
          </button>
        ))}
      </div>
      {game && (
        <div>
          <label htmlFor="band">Dificuldade</label>
          <select id="band" className="select" value={band} onChange={(e) => setBand(e.target.value as Band)}>
            {BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
      )}

      <div className="my-score">
        <div>
          <span>Sua pontuação {game ? `no ${GAME_META[game].name}` : "geral"}</span>
          <b>{fmt(game ? local.find((x) => x.g === game)!.score : localTotal)}</b>
          <small>{game ? `${local.find((x) => x.g === game)!.levels} níveis concluídos` : `${local.reduce((a, x) => a + x.levels, 0)} fases concluídas`}{mine ? ` · ${mine.pos}º lugar` : ""}</small>
        </div>
        {me && <span className="chip-me">Você: {me.nick}</span>}
      </div>

      {!online ? (
        <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
          <span>O ranking online ainda não foi ativado neste site, por isso não há outros jogadores para comparar. Sua pontuação acima é real e já fica guardada: assim que o ranking for ligado, ela entra na classificação.</span></div>
      ) : !me ? (
        nickForm ? null : (
          <div className="card rank-join">
            <h2>Participe do ranking</h2>
            <p>Sem cadastro, e-mail ou senha. Só enviamos seu <b>apelido</b> e os <b>tempos</b> das fases concluídas. Você pode sair quando quiser e seus dados do ranking são apagados.</p>
            <button className="btn cta" onClick={() => { setDraft(nick); setFormErr(null); setNickForm("join"); }}>Entrar no ranking</button>
          </div>
        )
      ) : null}

      {nickForm && (
        <form className="card stack" onSubmit={submitNick} noValidate>
          <label htmlFor="rnick">{nickForm === "join" ? "Seu apelido no ranking" : "Novo apelido no ranking"}</label>
          <input id="rnick" value={draft} maxLength={20} autoComplete="off" aria-invalid={!!formErr} aria-describedby={formErr ? "rnick-err" : undefined}
            onChange={(e) => { setDraft(e.target.value); setFormErr(null); }} />
          {formErr && <p id="rnick-err" className="err" role="alert"><b aria-hidden="true">! </b>{formErr}</p>}
          <p className="muted small">Ele aparece para todos. Não use seu nome completo nem dados pessoais.</p>
          <div className="row">
            <button className="btn cta" type="submit" disabled={busy}>{busy ? "Salvando…" : "Confirmar"}</button>
            <button className="btn sec" type="button" onClick={() => setNickForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {online && (
        <section aria-labelledby="rk-title" aria-busy={loading}>
          <div className="rank-head">
            <h2 id="rk-title">{title}</h2>
            <button className="btn sec sm" onClick={() => load()} disabled={loading}>{loading ? "Atualizando…" : "Atualizar"}</button>
          </div>
          {error && <div className="note warn" role="alert"><b aria-hidden="true">!</b><span>{error}</span></div>}
          {rows && rows.length === 0 && !loading && <p className="muted">Ninguém pontuou aqui ainda. Que tal ser a primeira pessoa do ranking?</p>}
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
          {me && rows && !mine && !loading && rows.length > 0 && <p className="muted small">Você ainda não tem pontos nesta classificação.</p>}
        </section>
      )}

      {online && me && (
        <div className="row">
          <button className="btn sec" onClick={() => { setDraft(me.nick); setFormErr(null); setNickForm("rename"); }}>Alterar apelido no ranking</button>
          {confirmLeave ? (
            <>
              <button className="btn" onClick={leave} disabled={busy}>Sim, sair e apagar</button>
              <button className="btn sec" onClick={() => setConfirmLeave(false)}>Cancelar</button>
            </>
          ) : <button className="btn sec" onClick={() => setConfirmLeave(true)}>Sair do ranking</button>}
        </div>
      )}

      <details className="card how">
        <summary>Como a pontuação é calculada</summary>
        <ul className="list">
          <li>Cada nível tem um <b>tempo de referência</b>, conforme o jogo, o tamanho da grade e a dificuldade.</li>
          <li>Pontos do nível = <b>peso × (100 + 100 × ritmo)</b>. O peso vai de 1 (nível 1) a 3 (nível 100); o ritmo é a referência ÷ seu tempo, no máximo 1.</li>
          <li>Vale o <b>melhor tempo</b> de cada nível: repetir um nível só melhora a pontuação se você for mais rápido.</li>
          <li>No <b>ranking geral</b>, os quatro jogos valem o mesmo máximo (40.000) e há bônus de <b>5% por jogo extra</b> jogado (consistência).</li>
          <li>Os pontos são calculados pelo servidor, que recusa tempos impossíveis e níveis pulados.</li>
        </ul>
      </details>
    </div>
  );
}
