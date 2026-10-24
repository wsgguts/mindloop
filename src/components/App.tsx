"use client";
import { useEffect, useState } from "react";
import Game from "./Game";
import ZipGame from "./ZipGame";
import { ZIP_PUZZLES } from "../lib/zip";
import { PUZZLES, puzzleGrid } from "../lib/puzzles";
import type { Grid } from "../lib/sudoku";
import { FEEDBACK_CONFIGURED } from "../lib/feedback";
import { KEYS, readStore, writeStore } from "../lib/storage";

type Screen = "entry" | "menu" | "rules" | "select" | "game" | "zselect" | "zgame" | "feedback";
type Save = { id: string; grid: Grid };

const SOON = [
  { name: "Tango", text: "Alternância e equilíbrio de estados binários." },
  { name: "Patches", text: "Composição por encaixe modular." },
];

function Hero() {
  return (
    <div className="hero">
      <img src="/logo.jpg" alt="MindLoop — Desafie sua mente" width={320} height={320} />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("entry");
  const [after, setAfter] = useState<Screen>("menu"); // para onde voltar das regras
  const [rulesFor, setRulesFor] = useState<"sudoku" | "zip">("sudoku");
  const [zipSeen, setZipSeen] = useState(false);
  const [zidx, setZidx] = useState(0);
  const [zround, setZround] = useState(0);
  const [nick, setNick] = useState("");
  const [draft, setDraft] = useState("");
  const [rulesSeen, setRulesSeen] = useState(false);
  const [save, setSave] = useState<Save | null>(null);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [demoMsg, setDemoMsg] = useState(false);

  useEffect(() => {
    const n = readStore(KEYS.nick) ?? "";
    setNick(n); setDraft(n);
    setRulesSeen(readStore(KEYS.rules) === "1");
    setZipSeen(readStore("mindloop:rules-zip") === "1");
    try { const s = readStore(KEYS.save); if (s) setSave(JSON.parse(s) as Save); } catch { /* ignora */ }
    setScreen(readStore(KEYS.entered) === "1" ? "menu" : "entry");
    setReady(true);
  }, []);

  const persist = (s: Save | null) => { setSave(s); writeStore(KEYS.save, s ? JSON.stringify(s) : null); };

  function enterApp(e?: React.FormEvent) {
    e?.preventDefault();
    const n = draft.trim().slice(0, 20);
    setNick(n); writeStore(KEYS.nick, n || null); writeStore(KEYS.entered, "1");
    setScreen("menu");
  }
  function goRules(next: Screen, game: "sudoku" | "zip" = "sudoku") { setAfter(next); setRulesFor(game); setScreen("rules"); }
  function playZip() { if (zipSeen) setScreen("zselect"); else goRules("zselect", "zip"); }
  function startZip(i: number) { setZidx(i); setZround((r) => r + 1); setScreen("zgame"); }
  function playMini() { if (rulesSeen) setScreen("select"); else goRules("select"); }
  function start(i: number) { setIdx(i); setRound((r) => r + 1); setScreen("game"); }
  function closeRules() {
    if (rulesFor === "zip") { writeStore("mindloop:rules-zip", "1"); setZipSeen(true); } else { writeStore(KEYS.rules, "1"); setRulesSeen(true); }
    setScreen(after);
  }

  const puzzle = PUZZLES[idx];
  const initial: Grid = save && save.id === puzzle.id ? save.grid : puzzleGrid(puzzle);

  return (
    <>
      <header className="top">
        <span className="brand"><img src="/cube.png" alt="" width={36} height={40} /><span className="wordmark">MindLoop</span></span>
        <span className="tagline">Lógica sem mistério</span>
      </header>
      <main className="stage">
        {!ready ? (
          <div className="wrap"><p role="status">Carregando…</p></div>
        ) : screen === "entry" ? (
          <><Hero /><form className="wrap" onSubmit={enterApp}>
            <h1>Oi! Qual apelido você quer usar?</h1>
            <p className="muted">É opcional. O apelido fica só neste aparelho — não é um cadastro e não pedimos nenhum outro dado.</p>
            <div>
              <label htmlFor="nick">Apelido</label>
              <input id="nick" value={draft} maxLength={20} autoComplete="off" onChange={(e) => setDraft(e.target.value)} placeholder="Ex.: Lia" />
            </div>
            <div className="row">
              <button className="btn cta" type="submit">{draft.trim() ? "Começar" : "Entrar sem apelido"}</button>
              {nick && <button type="button" className="btn sec" onClick={() => setScreen("menu")}>Cancelar</button>}
            </div>
          </form></>
        ) : screen === "menu" ? (
          <><Hero /><div className="wrap">
            <div>
              <h1>{nick ? `Olá, ${nick}!` : "Olá!"}</h1>
              <p className="muted">Pensar, testar, aprender e tentar de novo. Escolha um jogo.</p>
            </div>
            <div className="menu-grid">
              <section className="card" aria-labelledby="g-mini">
                <span className="badge">Disponível</span>
                <h2 id="g-mini">Mini Sudoku</h2>
                <p>Complete a grade sem repetir números em linha, coluna ou bloco.</p>
                <button className="btn cta" onClick={playMini}>Jogar</button>
              </section>
              <section className="card" aria-labelledby="g-zip">
                <span className="badge">Disponível</span>
                <h2 id="g-zip">Zip</h2>
                <p>Ligue os números em ordem com um caminho que passa por todas as casas.</p>
                <button className="btn cta" onClick={playZip}>Jogar</button>
              </section>
              {SOON.map((g) => (
                <section key={g.name} className="card soon" aria-labelledby={`g-${g.name}`}>
                  <span className="badge soon">Em breve</span>
                  <h2 id={`g-${g.name}`}>{g.name}</h2>
                  <p className="muted">{g.text}</p>
                </section>
              ))}
            </div>
            <div className="row">
              <button className="btn sec" onClick={() => goRules("menu")}>Regras do Mini Sudoku</button>
              <button className="btn sec" onClick={() => goRules("menu", "zip")}>Regras do Zip</button>
              <button className="btn sec" onClick={() => { setRating(null); setComment(""); setDemoMsg(false); setScreen("feedback"); }}>Dar opinião</button>
              <button className="btn sec" onClick={() => { setDraft(nick); setScreen("entry"); }}>Alterar apelido</button>
            </div>
          </div></>
        ) : screen === "rules" ? (
          rulesFor === "zip" ? (
          <div className="wrap">
            <h1>Como jogar o Zip</h1>
            <p><b>Objetivo:</b> traçar um único caminho que liga os números em ordem (1, 2, 3…), passa por todas as casas uma só vez e termina no maior número.</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
              <li>O caminho começa no 1. Arraste o dedo ou toque nas casas vizinhas (sem diagonais).</li>
              <li>Você só pode entrar num número depois de passar pelo anterior.</li>
              <li>Toque numa casa do caminho, ou use Desfazer, para voltar e tentar outra rota.</li>
              <li>No teclado: setas estendem o caminho e Backspace volta um passo.</li>
            </ul>
            <div className="note info"><b aria-hidden="true">ℹ</b><span>Estas regras do Zip são uma versão provisória do MVP, ainda a confirmar com a equipe MindLoop.</span></div>
            <button className="btn cta" onClick={closeRules}>{after === "zselect" ? "Entendi, vamos lá" : "Voltar"}</button>
          </div>
          ) : (
          <div className="wrap">
            <h1>Como jogar o Mini Sudoku</h1>
            <p><b>Objetivo:</b> preencher a grade 4×4 com os números 1 a 4, sem repetir nenhum em cada linha, coluna ou bloco de 2×2.</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
              <li>Toque numa casa vazia e escolha um número.</li>
              <li>Casas roxas claras são pistas fixas.</li>
              <li>Se um número repetir, a casa ganha um “!” e uma mensagem explica onde.</li>
              <li>Pode desfazer, pedir uma dica ou reiniciar quando quiser.</li>
            </ul>
            <div className="note info"><b aria-hidden="true">ℹ</b><span>Estas regras 4×4 são uma versão provisória do MVP, ainda a confirmar com a equipe MindLoop.</span></div>
            <button className="btn cta" onClick={closeRules}>{after === "select" ? "Entendi, vamos lá" : "Voltar"}</button>
          </div>
          )
        ) : screen === "select" ? (
          <div className="wrap">
            <h1>Escolha um puzzle</h1>
            {PUZZLES.map((p, i) => (
              <section key={p.id} className="card">
                <h2>{p.name}</h2>
                <p className="muted">{p.level}{save?.id === p.id ? " · Em andamento" : ""}</p>
                <div className="row">
                  <button className="btn" onClick={() => start(i)}>{save?.id === p.id ? "Continuar" : "Jogar"}</button>
                  {save?.id === p.id && <button className="btn sec" onClick={() => { persist(null); start(i); }}>Começar do zero</button>}
                </div>
              </section>
            ))}
            <button className="btn sec" onClick={() => setScreen("menu")}>Voltar ao menu</button>
          </div>
        ) : screen === "game" ? (
          <Game key={`${puzzle.id}-${round}`} puzzle={puzzle} initialGrid={initial}
            onSave={(g) => persist(g ? { id: puzzle.id, grid: g } : null)}
            onMenu={() => setScreen("menu")}
            onNext={() => start((idx + 1) % PUZZLES.length)}
            onRules={() => goRules("game")} />
        ) : screen === "zselect" ? (
          <div className="wrap">
            <h1>Escolha um puzzle do Zip</h1>
            {ZIP_PUZZLES.map((p, i) => (
              <section key={p.id} className="card">
                <h2>{p.name}</h2>
                <p className="muted">{p.level} · grade {p.rows.length}×{p.rows.length}</p>
                <div className="row"><button className="btn" onClick={() => startZip(i)}>Jogar</button></div>
              </section>
            ))}
            <button className="btn sec" onClick={() => setScreen("menu")}>Voltar ao menu</button>
          </div>
        ) : screen === "zgame" ? null : (
          <form className="wrap" onSubmit={(e) => { e.preventDefault(); setDemoMsg(true); }}>
            <h1>Sua opinião</h1>
            <div className="note warn" role="note"><b aria-hidden="true">!</b>
              <span>Esta tela é uma demonstração: {FEEDBACK_CONFIGURED ? "" : "ainda não existe um destino para as avaliações, então nada é enviado nem salvo."}</span></div>
            <fieldset className="rating" aria-label="Nota de 1 a 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n}><input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} /><span aria-label={`Nota ${n}`}>{n}</span></label>
              ))}
            </fieldset>
            <div>
              <label htmlFor="cm">Comentário (opcional)</label>
              <textarea id="cm" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            {demoMsg && <div className="note info" role="status"><b aria-hidden="true">ℹ</b><span>Obrigado por testar! Nesta versão a avaliação não foi enviada nem armazenada.</span></div>}
            <div className="row">
              <button className="btn" type="submit">Testar envio (demonstração)</button>
              <button type="button" className="btn sec" onClick={() => setScreen("menu")}>Voltar ao menu</button>
            </div>
          </form>
        )}
        {(screen === "zgame" || (screen === "rules" && after === "zgame")) && (
          <div hidden={screen !== "zgame"}>
            <ZipGame key={`${ZIP_PUZZLES[zidx].id}-${zround}`} puzzle={ZIP_PUZZLES[zidx]}
              onMenu={() => setScreen("menu")} onNext={() => startZip((zidx + 1) % ZIP_PUZZLES.length)}
              onRules={() => goRules("zgame", "zip")} />
          </div>
        )}
      </main>
    </>
  );
}
