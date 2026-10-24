"use client";
import { useEffect, useState } from "react";
import BottomNav, { type Tab } from "./BottomNav";
import Game from "./Game";
import Gem, { type GemKind } from "./Gem";
import Modal from "./Modal";
import { RulesContent, type RulesGame } from "./Rules";
import ZipGame from "./ZipGame";
import { FEEDBACK_CONFIGURED } from "../lib/feedback";
import { PUZZLES, puzzleGrid } from "../lib/puzzles";
import type { Grid } from "../lib/sudoku";
import { validateNick } from "../lib/nick";
import { KEYS, readStore, writeStore } from "../lib/storage";
import { ZIP_PUZZLES } from "../lib/zip";

type View = "home" | "games" | "select" | "zselect" | "game" | "rules" | "profile" | "feedback";
type Save = { id: string; grid: Grid };
type Session = { game: RulesGame; idx: number; round: number };

const TAB_OF: Record<View, Tab> = { home: "home", games: "games", select: "games", zselect: "games", game: "games", rules: "rules", profile: "profile", feedback: "profile" };
const NAME: Record<RulesGame, string> = { sudoku: "Mini Sudoku", zip: "Zip" };

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("home");
  const [nick, setNick] = useState("");
  const [nickModal, setNickModal] = useState<null | View>(null); // para onde ir depois de salvar
  const [draft, setDraft] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [seen, setSeen] = useState<Record<RulesGame, boolean>>({ sudoku: false, zip: false });
  const [rulesModal, setRulesModal] = useState<RulesGame | null>(null);
  const [rulesTab, setRulesTab] = useState<RulesGame>("sudoku");
  const [save, setSave] = useState<Save | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [demoMsg, setDemoMsg] = useState(false);

  useEffect(() => {
    const n = readStore(KEYS.nick) ?? "";
    if (n && !validateNick(n)) setNick(n);
    setSeen({ sudoku: readStore(KEYS.rules) === "1", zip: readStore("mindloop:rules-zip") === "1" });
    try { const s = readStore(KEYS.save); if (s) setSave(JSON.parse(s) as Save); } catch { /* ignora */ }
    setReady(true);
  }, []);

  const persist = (s: Save | null) => { setSave(s); writeStore(KEYS.save, s ? JSON.stringify(s) : null); };

  function openNick(next: View) { setDraft(nick); setNickError(null); setNickModal(next); }
  function onPlay() { if (nick) setView("games"); else openNick("games"); }
  function confirmNick(e: React.FormEvent) {
    e.preventDefault();
    const err = validateNick(draft);
    if (err) return setNickError(err);
    const v = draft.trim();
    setNick(v); writeStore(KEYS.nick, v);
    const next = nickModal ?? "games";
    setNickModal(null); setView(next);
  }
  function onTab(t: Tab) {
    if (t === "games" && !nick) return openNick("games");
    setView(t);
  }
  function startGame(game: RulesGame, idx: number) {
    setSession((s) => ({ game, idx, round: (s?.round ?? 0) + 1 }));
    setView("game");
    if (!seen[game]) { openRules(game); }
  }
  function openRules(game: RulesGame) {
    setRulesModal(game);
    if (!seen[game]) {
      setSeen((s) => ({ ...s, [game]: true }));
      writeStore(game === "zip" ? "mindloop:rules-zip" : KEYS.rules, "1");
    }
  }

  const GAMES: { id: string; name: string; text: string; kind: GemKind; color: string; open?: () => void }[] = [
    { id: "sudoku", name: "Mini Sudoku", text: "Complete a grade sem repetir números.", kind: "sudoku", color: "#F05BC8", open: () => setView("select") },
    { id: "zip", name: "Zip", text: "Ligue os números em ordem, passando por todas as casas.", kind: "zip", color: "#12CFE0", open: () => setView("zselect") },
    { id: "tango", name: "Tango", text: "Alternância e equilíbrio de estados binários.", kind: "tango", color: "#FFB020" },
    { id: "patches", name: "Patches", text: "Composição por encaixe modular.", kind: "patches", color: "#762CEB" },
  ];

  const inGame = session && view === "game";
  const activeSession = session;

  return (
    <>
      {view !== "home" && (
        <header className="top">
          <span className="brand"><img src="/cube.png" alt="" width={36} height={34} /><span className="wordmark">MindLoop</span></span>
          {nick && <span className="chip" aria-label={`Apelido: ${nick}`}>{nick}</span>}
        </header>
      )}

      <main id="main" className={view === "home" ? "home-main" : "page"}>
        {!ready ? (
          <div className="wrap"><p role="status">Carregando…</p></div>
        ) : view === "home" ? (
          <section className="home" aria-label="Início">
            <div className="fill" style={{ background: "rgb(15,9,56)" }} />
            <div className="art">
              <img src="/home-art.jpg" width={1080} height={1350} alt="MindLoop — Desafie sua mente. Um cubo mágico de quebra-cabeça sobre ilhas flutuantes, com os cristais dos jogos Mini Sudoku, Zip, Tango e Patches." fetchPriority="high" />
              <button className="hotspot" onClick={onPlay} aria-label="Jogar"><span aria-hidden="true">Jogar</span></button>
            </div>
            <div className="fill" style={{ background: "rgb(13,7,33)" }} />
          </section>
        ) : view === "games" ? (
          <div className="screen">
            <h1>Escolha um jogo</h1>
            <p className="lead">{nick ? `Boa, ${nick}! ` : ""}Toque num jogo para começar.</p>
            <div className="ggrid">
              {GAMES.map((g) => g.open ? (
                <button key={g.id} className="gcard" style={{ "--gc": g.color } as React.CSSProperties} onClick={g.open} aria-label={`Jogar ${g.name}`}>
                  <Gem kind={g.kind} size={88} />
                  <span className="badge">Disponível</span>
                  <span className="gname">{g.name}</span>
                  <span className="gtext">{g.text}</span>
                  <span className="go">Jogar ›</span>
                </button>
              ) : (
                <div key={g.id} className="gcard soon" style={{ "--gc": g.color } as React.CSSProperties} aria-disabled="true">
                  <Gem kind={g.kind} size={88} />
                  <span className="badge soon">Em breve</span>
                  <span className="gname">{g.name}</span>
                  <span className="gtext">{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : view === "select" ? (
          <div className="wrap">
            <h1>Mini Sudoku</h1>
            <p className="muted">Escolha um puzzle.</p>
            {PUZZLES.map((p, i) => (
              <section key={p.id} className="card">
                <h2>{p.name}</h2>
                <p className="muted">{p.level} · grade {p.rows.length}×{p.rows.length}{save?.id === p.id ? " · Em andamento" : ""}</p>
                <div className="row">
                  <button className="btn" onClick={() => startGame("sudoku", i)}>{save?.id === p.id ? "Continuar" : "Jogar"}</button>
                  {save?.id === p.id && <button className="btn sec" onClick={() => { persist(null); startGame("sudoku", i); }}>Começar do zero</button>}
                </div>
              </section>
            ))}
            <button className="btn sec" onClick={() => setView("games")}>Voltar aos jogos</button>
          </div>
        ) : view === "zselect" ? (
          <div className="wrap">
            <h1>Zip</h1>
            <p className="muted">Escolha um puzzle.</p>
            {ZIP_PUZZLES.map((p, i) => (
              <section key={p.id} className="card">
                <h2>{p.name}</h2>
                <p className="muted">{p.level} · grade {p.rows.length}×{p.rows.length}</p>
                <div className="row"><button className="btn" onClick={() => startGame("zip", i)}>Jogar</button></div>
              </section>
            ))}
            <button className="btn sec" onClick={() => setView("games")}>Voltar aos jogos</button>
          </div>
        ) : view === "rules" ? (
          <div className="wrap">
            <h1>Regras</h1>
            <div className="seg" role="group" aria-label="Escolher jogo">
              {(["sudoku", "zip"] as RulesGame[]).map((g) => (
                <button key={g} className={rulesTab === g ? "on" : ""} aria-pressed={rulesTab === g} onClick={() => setRulesTab(g)}>
                  <Gem kind={g} size={28} />{NAME[g]}
                </button>
              ))}
            </div>
            <h2>Como jogar o {NAME[rulesTab]}</h2>
            <RulesContent game={rulesTab} />
            <p className="muted">Tango e Patches ainda estão chegando — as regras aparecem aqui quando os jogos forem lançados.</p>
          </div>
        ) : view === "profile" ? (
          <div className="wrap">
            <h1>Perfil</h1>
            {nick ? (
              <div className="card"><span className="muted">Seu apelido</span><h2>{nick}</h2>
                <button className="btn sec" onClick={() => openNick("profile")}>Alterar apelido</button></div>
            ) : (
              <div className="card"><p>Você ainda não escolheu um apelido.</p><button className="btn cta" onClick={() => openNick("profile")}>Escolher apelido</button></div>
            )}
            <p className="muted">O apelido fica salvo só neste aparelho. Não pedimos cadastro nem outros dados.</p>
            <button className="btn sec" onClick={() => { setRating(null); setComment(""); setDemoMsg(false); setView("feedback"); }}>Dar opinião</button>
          </div>
        ) : view === "feedback" ? (
          <form className="wrap" onSubmit={(e) => { e.preventDefault(); setDemoMsg(true); }}>
            <h1>Sua opinião</h1>
            <div className="note warn" role="note"><b aria-hidden="true">!</b>
              <span>Esta tela é uma demonstração: {FEEDBACK_CONFIGURED ? "" : "ainda não existe um destino para as avaliações, então nada é enviado nem salvo."}</span></div>
            <fieldset className="rating" aria-label="Nota de 1 a 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n}><input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} /><span aria-label={`Nota ${n}`}>{n}</span></label>
              ))}
            </fieldset>
            <div><label htmlFor="cm">Comentário (opcional)</label><textarea id="cm" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} /></div>
            {demoMsg && <div className="note info" role="status"><b aria-hidden="true">ℹ</b><span>Obrigado por testar! Nesta versão a avaliação não foi enviada nem armazenada.</span></div>}
            <div className="row">
              <button className="btn" type="submit">Testar envio (demonstração)</button>
              <button type="button" className="btn sec" onClick={() => setView("profile")}>Voltar ao perfil</button>
            </div>
          </form>
        ) : null}

        {/* Partidas ficam montadas enquanto a pessoa navega, para não perder o progresso. */}
        {activeSession?.game === "sudoku" && (
          <div hidden={!inGame}>
            <Game key={`s-${activeSession.idx}-${activeSession.round}`} puzzle={PUZZLES[activeSession.idx]}
              initialGrid={save && save.id === PUZZLES[activeSession.idx].id && save.grid.length === PUZZLES[activeSession.idx].rows.length ? save.grid : puzzleGrid(PUZZLES[activeSession.idx])}
              onSave={(g) => persist(g ? { id: PUZZLES[activeSession.idx].id, grid: g } : null)}
              onMenu={() => setView("games")} onNext={() => startGame("sudoku", (activeSession.idx + 1) % PUZZLES.length)}
              onRules={() => openRules("sudoku")} />
          </div>
        )}
        {activeSession?.game === "zip" && (
          <div hidden={!inGame}>
            <ZipGame key={`z-${activeSession.idx}-${activeSession.round}`} puzzle={ZIP_PUZZLES[activeSession.idx]}
              onMenu={() => setView("games")} onNext={() => startGame("zip", (activeSession.idx + 1) % ZIP_PUZZLES.length)}
              onRules={() => openRules("zip")} />
          </div>
        )}
      </main>

      {rulesModal && (
        <Modal title={`Como jogar o ${NAME[rulesModal]}`} onClose={() => setRulesModal(null)} closeLabel="Fechar regras">
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
