"use client";
import { useEffect, useRef, useState } from "react";
import BottomNav, { type Tab } from "./BottomNav";
import Game from "./Game";
import Gem, { type GemKind } from "./Gem";
import Journey from "./Journey";
import LevelComplete, { type LevelResult } from "./LevelComplete";
import Modal from "./Modal";
import { RulesContent, type RulesGame } from "./Rules";
import PatchesGame from "./PatchesGame";
import TangoGame from "./TangoGame";
import ZipGame from "./ZipGame";
import { COMMENT_MAX, submitFeedback, validateFeedback } from "../lib/feedback";
import { ALL_GAMES, GAME_META } from "../lib/games";
import { LEVELS_PER_GAME, doneCount, emptyProgress, focusLevel, isComplete, isDone, markDone, parseLevel, parseProgress } from "../lib/journey";
import { PUZZLES, puzzleGrid } from "../lib/puzzles";
import { type Times, parseTimes, recordTime } from "../lib/records";
import type { Grid } from "../lib/sudoku";
import { validateNick } from "../lib/nick";
import { KEYS, readStore, writeStore } from "../lib/storage";
import { PATCHES_PUZZLES } from "../lib/patches";
import { TANGO_PUZZLES } from "../lib/tango";
import { ZIP_PUZZLES } from "../lib/zip";

type View = "home" | "journey" | "game" | "rules" | "profile" | "feedback";
type Save = { id: string; grid: Grid; ms?: number };
type Session = { game: RulesGame; idx: number; round: number };
/** Volta à trilha logo após uma vitória: qual nível animar como concluído e qual como recém-liberado. */
type Arrival = { game: RulesGame; justDone: number; justUnlocked?: number };
type PerGame<T> = Record<RulesGame, T>;

const TAB_OF: Record<View, Tab> = { home: "home", journey: "home", game: "home", rules: "rules", profile: "profile", feedback: "profile" };
// Chave de "já viu as regras" de cada jogo (a do Sudoku é a original, mantida por compatibilidade).
const RULES_KEY: PerGame<string> = { sudoku: KEYS.rules, zip: "mindloop:rules-zip", tango: "mindloop:rules-tango", patches: "mindloop:rules-patches" };
// Progresso salvo no aparelho, por jogo.
const PROGRESS_KEY = (g: RulesGame) => `mindloop:progress:${g}`;
const TIMES_KEY = (g: RulesGame) => `mindloop:times:${g}`; // melhor tempo de cada nível
const LAST_KEY = (g: RulesGame) => `mindloop:last:${g}`; // último nível jogado (referência de retorno)
const perGame = <T,>(f: (g: RulesGame) => T): PerGame<T> => ({ sudoku: f("sudoku"), zip: f("zip"), tango: f("tango"), patches: f("patches") });

// Áreas clicáveis sobre os cristais da arte do Início (em % da imagem home-art.webp; original em home-art.jpg).
const ART_SPOTS: { id: RulesGame; left: number; top: number; width: number; height: number }[] = [
  { id: "sudoku", left: 3, top: 38, width: 23, height: 19 },
  { id: "zip", left: 74, top: 38, width: 24, height: 19 },
  { id: "tango", left: 7, top: 57.5, width: 22, height: 19 },
  { id: "patches", left: 66, top: 58.5, width: 27, height: 19 },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("home");
  const [nick, setNick] = useState("");
  const [nickModal, setNickModal] = useState<null | { then: () => void }>(null); // o que fazer depois de salvar
  const [draft, setDraft] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [seen, setSeen] = useState<PerGame<boolean>>(() => perGame(() => false));
  const [rulesModal, setRulesModal] = useState<RulesGame | null>(null);
  const [rulesTab, setRulesTab] = useState<RulesGame>("sudoku");
  const [save, setSave] = useState<Save | null>(null);
  const [journeyGame, setJourneyGame] = useState<RulesGame>("sudoku");
  const [progress, setProgress] = useState<PerGame<string>>(() => perGame(emptyProgress));
  const [times, setTimes] = useState<PerGame<Times>>(() => perGame(() => ({})));
  const [lastPlayed, setLastPlayed] = useState<PerGame<number | null>>(() => perGame(() => null));
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<LevelResult | null>(null); // vitória recém-conquistada
  const [showComplete, setShowComplete] = useState(false); // tela de parabéns aberta
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [fbStatus, setFbStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [fbError, setFbError] = useState<string | null>(null);
  const [bot, setBot] = useState(""); // campo-armadilha contra robôs
  const viewRef = useRef(view);
  viewRef.current = view;
  const toCards = useRef(false); // ao voltar para o Início, rolar até os cards dos jogos

  useEffect(() => {
    const n = readStore(KEYS.nick) ?? "";
    if (n && !validateNick(n)) setNick(n);
    setSeen(perGame((g) => readStore(RULES_KEY[g]) === "1"));
    setProgress(perGame((g) => parseProgress(readStore(PROGRESS_KEY(g)))));
    setTimes(perGame((g) => parseTimes(readStore(TIMES_KEY(g)))));
    setLastPlayed(perGame((g) => parseLevel(readStore(LAST_KEY(g)))));
    try { const s = readStore(KEYS.save); if (s) setSave(JSON.parse(s) as Save); } catch { /* ignora */ }
    setReady(true);
  }, []);

  // Cada tela começa do topo; a jornada cuida da própria rolagem (centraliza o nível destacado).
  useEffect(() => {
    if (view === "journey") return;
    if (view === "home" && toCards.current) {
      toCards.current = false;
      document.getElementById("jogos")?.scrollIntoView({ block: "start" });
    } else window.scrollTo(0, 0);
    setArrival(null); // a animação de chegada vale só para a volta imediata à trilha
  }, [view]);

  const persist = (s: Save | null) => { setSave(s); writeStore(KEYS.save, s ? JSON.stringify(s) : null); };

  function openNick(then: () => void) { setDraft(nick); setNickError(null); setNickModal({ then }); }
  function confirmNick(e: React.FormEvent) {
    e.preventDefault();
    const err = validateNick(draft);
    if (err) return setNickError(err);
    const v = draft.trim();
    setNick(v); writeStore(KEYS.nick, v);
    const then = nickModal?.then;
    setNickModal(null);
    then?.();
  }
  function onTab(t: Tab) { setView(t); }
  function goHome(cards = false) { toCards.current = cards; setView("home"); if (cards && view === "home") document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  /** Card, nome, arte ou "Jogar agora" de um jogo: abre a jornada dele (pedindo o apelido na primeira vez). */
  function openGame(id: RulesGame) {
    if (nick) openJourney(id);
    else openNick(() => openJourney(id));
  }
  function openJourney(game: RulesGame) { setJourneyGame(game); setArrival(null); setView("journey"); }

  function startGame(game: RulesGame, idx: number) {
    setSession((s) => ({ game, idx, round: (s?.round ?? 0) + 1 }));
    setLastPlayed((l) => ({ ...l, [game]: idx + 1 }));
    writeStore(LAST_KEY(game), String(idx + 1));
    setResult(null); setShowComplete(false);
    setView("game");
    if (!seen[game]) { openRules(game); }
  }

  /** Nível resolvido: salva na hora o progresso e o tempo (mesmo que a pessoa feche o app durante a animação). */
  function winLevel(game: RulesGame, level: number, ms: number) {
    const before = progress[game];
    const after = markDone(before, level); // repetir um nível não altera nada do histórico
    const t = recordTime(times[game], level, ms);
    setProgress((p) => ({ ...p, [game]: after }));
    writeStore(PROGRESS_KEY(game), after);
    setTimes((all) => ({ ...all, [game]: t.times }));
    writeStore(TIMES_KEY(game), JSON.stringify(t.times));
    setLastPlayed((l) => ({ ...l, [game]: level }));
    writeStore(LAST_KEY(game), String(level));
    setResult({ game, level, ms, best: t.best, previous: t.previous, isRecord: t.isRecord, before, after });
  }
  /** A animação no tabuleiro terminou: mostra a tela de parabéns (se a pessoa ainda está na partida). */
  function celebrated() {
    if (viewRef.current === "game") setShowComplete(true);
    else setResult(null);
  }
  /** Com a tela de parabéns cobrindo tudo, troca para a jornada do jogo, já no nível certo. */
  function arriveAtJourney() {
    if (!result) return;
    const { game, level, before } = result;
    const firstTime = !isDone(before, level);
    setJourneyGame(game);
    setView("journey");
    setArrival({ game, justDone: level, justUnlocked: firstTime && level < LEVELS_PER_GAME ? level + 1 : undefined });
  }

  async function sendFeedback(e: React.FormEvent) {
    e.preventDefault();
    const erro = validateFeedback({ rating, comment });
    if (erro) { setFbError(erro); return; }
    setFbError(null); setFbStatus("sending");
    try {
      await submitFeedback({ rating, comment, honeypot: bot });
      setFbStatus("ok"); setRating(null); setComment("");
    } catch {
      setFbStatus("error");
      setFbError("Não conseguimos enviar agora. Confira a internet e tente de novo — seu texto foi mantido.");
    }
  }

  function openRules(game: RulesGame) {
    setRulesModal(game);
    if (!seen[game]) {
      setSeen((s) => ({ ...s, [game]: true }));
      writeStore(RULES_KEY[game], "1");
    }
  }

  const CARDS: { id: RulesGame; name: string; text: string; kind: GemKind; color: string }[] = ALL_GAMES.map((g) => ({ id: g, kind: g, ...GAME_META[g] }));

  const inGame = !!session && view === "game";
  // O cronômetro só corre com a partida na tela e nada por cima.
  const playing = inGame && !rulesModal && !nickModal && !showComplete;
  const activeSession = session;
  const sessionProps = (game: RulesGame, idx: number) => ({
    active: playing,
    onMenu: () => openJourney(game),
    onRules: () => openRules(game),
    onWin: (ms: number) => winLevel(game, idx + 1, ms),
    onCelebrated: celebrated,
  });

  return (
    <>
      {view !== "home" && (
        <header className={`top${view === "game" ? " in-game" : ""}`}>
          <span className="brand"><img src="/cube.png" alt="" width={36} height={34} /><span className="wordmark">MindLoop</span></span>
          {nick && <span className="chip" aria-label={`Apelido: ${nick}`}>{nick}</span>}
        </header>
      )}

      <main id="main" className={view === "home" ? "home-main" : "page"}>
        {!ready ? (
          <div className="wrap"><p role="status">Carregando…</p></div>
        ) : view === "home" ? (
          <>
            <section className="home" aria-label="Início">
              <div className="fill sky" aria-hidden="true" />
              <div className="art">
                <img src="/home-art.webp" width={1080} height={1244} decoding="async" alt="MindLoop — Desafie sua mente. Um cubo mágico de quebra-cabeça sobre ilhas flutuantes, com os cristais dos jogos Mini Sudoku, Zip, Tango e Patches." fetchPriority="high" />
                {ART_SPOTS.map((s) => (
                  <button key={s.id} className="gspot" onClick={() => openGame(s.id)}
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
                    aria-label={`Jogar ${GAME_META[s.id].name}`} />
                ))}
                <button className="hotspot" onClick={() => document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="Jogar agora: ver os jogos">
                  <span aria-hidden="true">Jogar agora</span>
                </button>
              </div>
              <div className="fill ground" aria-hidden="true" />
            </section>

            <section id="jogos" className="screen games-home" aria-labelledby="jogos-title">
              <h1 id="jogos-title">Escolha um jogo</h1>
              <p className="lead">{nick ? `Boa, ${nick}! ` : ""}Toque em um jogo para abrir a jornada dele.</p>
              <div className="ggrid">
                {CARDS.map((g) => {
                  const p = progress[g.id];
                  const count = doneCount(p);
                  const full = isComplete(p);
                  return (
                    // O card inteiro é clicável (mouse/toque); o botão é o alvo do teclado e leitores de tela.
                    <article key={g.id} className="gcard" style={{ "--gc": g.color } as React.CSSProperties} onClick={() => openGame(g.id)}>
                      <Gem kind={g.kind} size={88} />
                      <span className={`badge${full ? " full" : ""}`}>{full ? "★ Jornada completa" : "Disponível"}</span>
                      <h2 className="gname">{g.name}</h2>
                      <p className="gtext">{g.text}</p>
                      <div className="gprog" aria-hidden="true"><i style={{ width: `${count}%` }} /></div>
                      <span className="gcount">{count}/{LEVELS_PER_GAME} níveis</span>
                      <button className="btn cta gplay" onClick={(e) => { e.stopPropagation(); openGame(g.id); }}
                        aria-label={`Jogar ${g.name} agora — ${count} de ${LEVELS_PER_GAME} níveis concluídos`}>
                        Jogar agora
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : view === "journey" ? (
          <Journey key={journeyGame} game={journeyGame} done={progress[journeyGame]}
            focus={focusLevel(progress[journeyGame], lastPlayed[journeyGame])}
            justDone={arrival?.game === journeyGame ? arrival.justDone : undefined}
            justUnlocked={arrival?.game === journeyGame ? arrival.justUnlocked : undefined}
            onBack={() => goHome(true)} onPlay={(n) => startGame(journeyGame, n - 1)} />
        ) : view === "rules" ? (
          <div className="wrap">
            <h1>Regras</h1>
            <div className="seg" role="group" aria-label="Escolher jogo">
              {ALL_GAMES.map((g) => (
                <button key={g} className={rulesTab === g ? "on" : ""} aria-pressed={rulesTab === g} onClick={() => setRulesTab(g)}>
                  <Gem kind={g} size={28} />{GAME_META[g].name}
                </button>
              ))}
            </div>
            <h2>Como jogar o {GAME_META[rulesTab].name}</h2>
            <RulesContent game={rulesTab} />
          </div>
        ) : view === "profile" ? (
          <div className="wrap">
            <h1>Perfil</h1>
            {nick ? (
              <div className="card"><span className="muted">Seu apelido</span><h2>{nick}</h2>
                <button className="btn sec" onClick={() => openNick(() => setView("profile"))}>Alterar apelido</button></div>
            ) : (
              <div className="card"><p>Você ainda não escolheu um apelido.</p><button className="btn cta" onClick={() => openNick(() => setView("profile"))}>Escolher apelido</button></div>
            )}
            <p className="muted">O apelido fica salvo só neste aparelho. Não pedimos cadastro nem outros dados.</p>
            <button className="btn sec" onClick={() => { setRating(null); setComment(""); setFbStatus("idle"); setFbError(null); setView("feedback"); }}>Dar opinião</button>
          </div>
        ) : view === "feedback" ? (
          <form className="wrap" onSubmit={sendFeedback} noValidate>
            <h1>Sua opinião</h1>
            {fbStatus === "ok" ? (
              <>
                <div className="note ok" role="status"><b aria-hidden="true">✓</b><span>Obrigado! Sua opinião foi enviada e vai ajudar a melhorar o MindLoop.</span></div>
                <div className="row">
                  <button type="button" className="btn cta" onClick={() => setFbStatus("idle")}>Enviar outra opinião</button>
                  <button type="button" className="btn sec" onClick={() => setView("profile")}>Voltar ao perfil</button>
                </div>
              </>
            ) : (
              <>
                <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
                  <span>Sua opinião é anônima: não enviamos seu apelido nem pedimos contato. Não escreva dados pessoais (nome, telefone, endereço) no comentário.</span></div>
                <fieldset className="rating-box">
                  <legend>Como foi sua experiência? (opcional)</legend>
                  <div className="rating" role="radiogroup" aria-label="Nota de 1 a 5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n}><input type="radio" name="rating" value={n} checked={rating === n} onChange={() => { setRating(n); setFbError(null); }} /><span aria-label={`Nota ${n}`}>{n}</span></label>
                    ))}
                  </div>
                  <p className="muted">1 = não gostei · 5 = gostei muito</p>
                </fieldset>
                <div>
                  <label htmlFor="cm">Comentário (opcional)</label>
                  <textarea id="cm" rows={4} maxLength={COMMENT_MAX} value={comment} onChange={(e) => { setComment(e.target.value); setFbError(null); }} />
                  <p className="muted" aria-live="off">{comment.length}/{COMMENT_MAX}</p>
                </div>
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label>Não preencha este campo<input tabIndex={-1} autoComplete="off" name="bot-field" value={bot} onChange={(e) => setBot(e.target.value)} /></label>
                </div>
                {fbError && <div className="note warn" role="alert"><b aria-hidden="true">!</b><span>{fbError}</span></div>}
                <div className="row">
                  <button className="btn cta" type="submit" disabled={fbStatus === "sending"}>{fbStatus === "sending" ? "Enviando…" : "Enviar opinião"}</button>
                  <button type="button" className="btn sec" onClick={() => setView("profile")}>Voltar ao perfil</button>
                </div>
              </>
            )}
          </form>
        ) : null}

        {/* Partidas ficam montadas enquanto a pessoa navega, para não perder o progresso. */}
        {activeSession?.game === "sudoku" && (() => {
          const pz = PUZZLES[activeSession.idx];
          const resume = save && save.id === pz.id && save.grid.length === pz.rows.length ? save : null;
          return (
            <div hidden={!inGame}>
              <Game key={`s-${activeSession.idx}-${activeSession.round}`} puzzle={pz}
                initialGrid={resume ? resume.grid : puzzleGrid(pz)} initialMs={resume?.ms ?? 0}
                onSave={(g, ms) => persist(g ? { id: pz.id, grid: g, ms } : null)}
                {...sessionProps("sudoku", activeSession.idx)} />
            </div>
          );
        })()}
        {activeSession?.game === "zip" && (
          <div hidden={!inGame}>
            <ZipGame key={`z-${activeSession.idx}-${activeSession.round}`} puzzle={ZIP_PUZZLES[activeSession.idx]} {...sessionProps("zip", activeSession.idx)} />
          </div>
        )}
        {activeSession?.game === "tango" && (
          <div hidden={!inGame}>
            <TangoGame key={`t-${activeSession.idx}-${activeSession.round}`} puzzle={TANGO_PUZZLES[activeSession.idx]} {...sessionProps("tango", activeSession.idx)} />
          </div>
        )}
        {activeSession?.game === "patches" && (
          <div hidden={!inGame}>
            <PatchesGame key={`p-${activeSession.idx}-${activeSession.round}`} puzzle={PATCHES_PUZZLES[activeSession.idx]} {...sessionProps("patches", activeSession.idx)} />
          </div>
        )}
      </main>

      {result && showComplete && (
        <LevelComplete result={result} onSwitch={arriveAtJourney} onClose={() => { setShowComplete(false); setResult(null); }} />
      )}

      {rulesModal && (
        <Modal title={`Como jogar o ${GAME_META[rulesModal].name}`} onClose={() => setRulesModal(null)} closeLabel="Fechar regras">
          <RulesContent game={rulesModal} />
          <button className="btn cta" onClick={() => setRulesModal(null)} style={{ marginTop: 16 }}>Entendi, continuar jogando</button>
        </Modal>
      )}

      {nickModal && (
        <Modal title="Como podemos te chamar?" onClose={() => setNickModal(null)} closeLabel="Fechar">
          <form className="stack" onSubmit={confirmNick} noValidate>
            <p className="muted">Seu apelido identifica você nas partidas neste aparelho. Ele fica salvo só aqui — não é um cadastro.</p>
            <div>
              <label htmlFor="nick">Apelido</label>
              <input id="nick" value={draft} maxLength={20} autoComplete="off" autoFocus placeholder="Ex.: Lia"
                aria-invalid={!!nickError} aria-describedby={nickError ? "nick-err" : undefined}
                onChange={(e) => { setDraft(e.target.value); setNickError(null); }} />
              {nickError && <p id="nick-err" className="err" role="alert"><b aria-hidden="true">! </b>{nickError}</p>}
            </div>
            <button className="btn cta" type="submit">Continuar</button>
          </form>
        </Modal>
      )}

      <BottomNav active={TAB_OF[view]} onChange={onTab} />
    </>
  );
}
