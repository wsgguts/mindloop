"use client";
// Tela da investigação. Três etapas: a história (contada pelo narrador do jogo), a investigação e o caso resolvido.
// A investigação (a história fica na etapa anterior e no botão 📖):
//   Tabuleiro          — o cenário, onde os personagens são encaixados (fileira de personagens embaixo);
//   Quadro de decisões — anotações: "Onde?" (um mapa só; vazio → ✕ → personagem) e "O quê?" (personagens × objetos;
//                        vazio → ✕ → ✓); com Desfazer e Limpar quadro;
//   Pistas e Sua resposta (local + objeto) com Verificar.
// Computador: tabuleiro e quadro à esquerda, pistas e resposta à direita. Celular em pé: uma coluna, nessa ordem.
import { useEffect, useMemo, useRef, useState } from "react";
import Celebration from "../Celebration";
import Gem from "../Gem";
import Medal from "../Medal";
import { useStopwatch } from "../useLevelPlay";
import { useRevealedErrors, useSettled } from "../useRevealedErrors";
import { useSfx } from "../useSound";
import { RARITY_LABEL, type Achievement } from "../../lib/achievements";
import { type Case, firstBroken, isComplete, isCorrect } from "../../lib/cases/catalog";
import { MAX_HINTS, MEDAL_LABEL, medalFor, xpFor } from "../../lib/cases/config";
import { allowedCells, clueState } from "../../lib/cases/model";
import type { CaseRecord, Draft, Solve } from "../../lib/cases/progress";
import { type Notes, type Pick, cellNote, focusOf, gridKey, gridNote, nextGrid, nextNote, readNote, validMark } from "../../lib/cases/relations";
import { KIND_NAME } from "../../lib/cases/themes";
import { GAME_META } from "../../lib/games";
import { formatTime } from "../../lib/records";
import { GAME_LOOK } from "../../lib/scenes";
import { CaseMedalIcon, CaseScene } from "./CaseArt";
import CaseBoard from "./CaseBoard";
import { AnswerPanel, CluesPanel, DecisionBoard } from "./CasePanels";
import Art from "../Art";

/** Uma jogada que pode ser desfeita (respostas + marcações). */
type Snap = { a: number[]; x: number[] };

export interface SolveResult { solve: Solve; medals: Achievement[]; bestMs: number }

interface Props {
  c: Case;
  record: CaseRecord;
  /** A investigação está na tela, sem nada por cima (o cronômetro só conta assim). */
  active: boolean;
  /** Botão principal da tela de conclusão ("Continuar para o nível 6" ou "Voltar às investigações"). */
  continueLabel: string;
  onContinue: () => void;
  /** Sair no meio: o andamento fica guardado para continuar depois. */
  exitLabel: string;
  onExit: () => void;
  onDraft: (d: Draft | null) => void;
  /** Registra a solução (progresso, XP, conquistas) — uma vez por mistério resolvido. */
  onSolve: (ms: number, hints: number) => SolveResult;
}

type Tone = "info" | "ok" | "warn" | "hint";
const ICON: Record<Tone, string> = { info: "ℹ", ok: "✓", warn: "!", hint: "?" };

export default function CaseScreen({ c, record, active, continueLabel, onContinue, exitLabel, onExit, onDraft, onSolve }: Props) {
  const m = c.model;
  const n = m.people.length;
  const look = GAME_LOOK[c.game];
  // Rascunho só vale para o MESMO caso (se o mistério foi reescrito, começa do zero).
  const draft = record.draft && record.draft.k === c.storyKey && record.draft.a.length === 2 * n ? record.draft : null;
  const [a, setA] = useState<number[]>(() => {
    const ok = new Set(allowedCells(m));
    return draft ? draft.a.map((v, i) => (i < n ? (ok.has(v) ? v : -1) : v < n ? v : -1)) : new Array(2 * n).fill(-1);
  });
  const [hints, setHints] = useState(draft?.hints ?? 0);
  const [sel, setSel] = useState<number | null>(null);
  const [crossed, setCrossed] = useState<Set<number>>(new Set());
  const [fresh, setFresh] = useState<Set<number>>(new Set()); // pistas que acabaram de se confirmar (brilho)
  const [broken, setBroken] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: draft ? "Investigação retomada de onde você parou." : "" });
  const [result, setResult] = useState<SolveResult | null>(null);
  const [stage, setStage] = useState<"story" | "play">(draft ? "play" : "story");
  const [showWhy, setShowWhy] = useState(false);
  const clock = useStopwatch(active && !result && stage === "play", draft?.ms ?? 0);
  const sfx = useSfx(c.game);
  const doneRef = useRef<HTMLButtonElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  // Quadro de decisões (anotações de casa e de objeto), seleção que acende as ligações e desfazer.
  const notesOf = (keys: number[], t: "cell" | "grid"): Notes => {
    const out: Notes = new Map();
    for (const k of keys) {
      if (!validMark(m, k)) continue;
      const x = readNote(k)!;
      if (x.t === "cell" && t === "cell") out.set(x.i, x.who); else if (x.t === "grid" && t === "grid") out.set(x.i, x.state);
    }
    return out;
  };
  const [cellNotes, setCellNotes] = useState<Notes>(() => notesOf(draft?.x ?? [], "cell"));
  const [gridNotes, setGridNotes] = useState<Notes>(() => notesOf(draft?.x ?? [], "grid"));
  const xKeys = () => [...[...cellNotes].map(([v, w]) => cellNote(v, w)), ...[...gridNotes].map(([k, st]) => gridNote(Math.floor(k / 16), k % 16, st))];
  const noteCount = cellNotes.size + gridNotes.size;
  const [pick, setPick] = useState<Pick>(null);
  const [undoStack, setUndoStack] = useState<Snap[]>([]);
  const [askClear, setAskClear] = useState(false);
  const focus = useMemo(() => focusOf(m, c.clues, pick), [m, c.clues, pick]);
  const remember = () => setUndoStack((u) => [...u.slice(-59), { a: a.slice(), x: xKeys() }]);

  function choosePick(p: Pick) {
    setPick(p);
    if (p?.t === "person") setSel(p.i);
    if (p) sfx("select");
  }

  // Estado de cada pista com o que já foi preenchido. Nada é confirmado a cada toque: ✓ e ✗ só aparecem depois
  // que a pessoa para por um instante (o mesmo intervalo dos jogos), para a investigação não virar tentativa e erro.
  const liveRule = useMemo(() => clueState(m, c.rules[0], a), [a, c, m]);
  const liveStates = useMemo(() => c.clues.map((k) => clueState(m, k, a)), [a, c, m]);
  const settledA = useSettled(a);
  const settledOk = useMemo(() => c.clues.map((k) => clueState(m, k, settledA) === true), [settledA, c, m]);
  const settledRuleOk = useMemo(() => clueState(m, c.rules[0], settledA) === true, [settledA, c, m]);
  const errKeys = useMemo(() => [
    ...(liveRule === false ? ["r"] : []),
    ...liveStates.flatMap((s, i) => (s === false ? [`c${i}:${a.join(".")}`] : [])),
  ], [liveRule, liveStates, a]);
  const errs = useRevealedErrors(errKeys, a, () => { if (!result) sfx("error"); });
  const shownKeys = useMemo(() => new Set([...errs.visible].map((k) => k.split(":")[0])), [errs.visible]);
  const shown = (live: boolean | null, ok: boolean, key: string): boolean | null =>
    live === false ? (shownKeys.has(key) ? false : null) : live === true && ok ? true : null;
  const ruleState = shown(liveRule, settledRuleOk, "r");
  const states = liveStates.map((s, i) => shown(s, settledOk[i], `c${i}`));
  const prev = useRef(states);
  useEffect(() => {
    const now = new Set<number>();
    states.forEach((s, i) => { if (s === true && prev.current[i] !== true) now.add(i); });
    prev.current = states;
    if (!now.size) return;
    setFresh(now);
    sfx("progress");
    const t = window.setTimeout(() => setFresh(new Set()), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states.join()]);

  // Andamento salvo a cada mudança (sobrevive a recarregar a página ou fechar o app).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!result) onDraft({ a, hints, ms: Math.round(clock.read()), k: c.storyKey, x: xKeys() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, hints, cellNotes, gridNotes]);

  const touched = () => { setBroken(null); if (msg.tone !== "hint") setMsg({ tone: "info", text: "" }); };
  /** Coloca a pessoa s na casa v (-1 = tira). Quem estava naquela casa sai dela. */
  function place(s: number, v: number) {
    if (result) return;
    remember(); touched();
    setA((cur) => { const next = cur.slice(); if (v >= 0) { const o = next.slice(0, n).indexOf(v); if (o >= 0 && o !== s) next[o] = -1; } next[s] = v; return next; });
    sfx(v < 0 ? "erase" : "place", { v: 1, pos: 0.5 });
  }
  /** Dá o objeto o à pessoa s (-1 = tira). Quem tinha esse objeto fica sem. */
  function give(s: number, o: number) {
    if (result) return;
    remember(); touched();
    setA((cur) => { const next = cur.slice(); if (o >= 0) { const t = next.slice(n).indexOf(o); if (t >= 0 && t !== s) next[n + t] = -1; } next[n + s] = o; return next; });
    sfx(o < 0 ? "erase" : "place", { v: 2, pos: 0.7 });
  }
  function select(s: number | null) { if (!result) { if (s !== null) sfx("select"); setSel(s); } }

  /** "Onde?": a casa alterna vazio → ✕ → cada personagem (que ainda não está anotado em outra casa) → vazio. */
  function cycleCell(v: number) {
    if (result) return;
    const nx = nextNote(cellNotes, v, n);
    remember();
    const next = new Map(cellNotes);
    if (nx === undefined) next.delete(v); else next.set(v, nx);
    setCellNotes(next);
    sfx(nx === undefined ? "erase" : "select");
  }
  /** "O quê?": a casa (personagem, objeto) alterna vazio → ✕ → ✓ → vazio. */
  function cycleGrid(sIdx: number, o: number) {
    if (result) return;
    const k = gridKey(sIdx, o), nx = nextGrid(gridNotes.get(k));
    remember();
    const next = new Map(gridNotes);
    if (nx === undefined) next.delete(k); else next.set(k, nx);
    setGridNotes(next);
    sfx(nx === undefined ? "erase" : "select");
  }
  function clearMarks() {
    if (result || !noteCount) return;
    remember(); sfx("undo");
    setCellNotes(new Map()); setGridNotes(new Map()); setAskClear(false);
    say("info", "Quadro de decisões apagado. Os personagens no tabuleiro e a resposta continuam como estavam.");
  }
  function undo() {
    if (result || !undoStack.length) { sfx("block"); return; }
    const last = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setA(last.a); setCellNotes(notesOf(last.x, "cell")); setGridNotes(notesOf(last.x, "grid")); setBroken(null);
    sfx("undo");
    say("info", "Última ação desfeita.");
  }
  function hint() {
    if (result || hints >= MAX_HINTS) return;
    sfx("hint");
    setHints((h) => h + 1);
    say("hint", `Dica ${hints + 1} de ${MAX_HINTS} revelada abaixo das pistas.`);
  }
  function clear() {
    if (result || a.every((v) => v < 0)) return;
    remember(); sfx("undo");
    setA(new Array(2 * n).fill(-1)); setSel(null); setBroken(null);
    say("info", "Respostas apagadas. O quadro de decisões, as pistas riscadas e as dicas continuam como estavam.");
  }
  function verify() {
    if (result) return;
    if (!isComplete(c, a)) { sfx("block"); return say("info", "Escolha o local e o objeto de todos antes de verificar."); }
    if (isCorrect(c, a)) {
      const ms = Math.round(clock.read());
      const r = onSolve(ms, hints);
      setResult(r);
      sfx("win");
      window.setTimeout(() => sfx("celebrate"), 700);
      return;
    }
    // Errou: não revela a solução — só aponta que algo não fecha (e qual pista conferir).
    const b = firstBroken(c, a);
    sfx("error");
    setBroken(b);
    say("warn", b === null ? "Algo não fecha. Revise suas deduções." : b < 0 ? "Sua resposta contraria a regra do lugar (marcada em vermelho). Revise as posições." : `Existe uma inconsistência: a pista ${b + 1} não confere com sua resposta. O resto pode estar certo — continue investigando!`);
  }

  useEffect(() => { if (result) doneRef.current?.focus({ preventScroll: true }); }, [result]);
  useEffect(() => { window.scrollTo(0, 0); }, [result, stage]);

  const placed = a.slice(0, n).filter((v) => v >= 0).length;
  const given = a.slice(n).filter((v) => v >= 0).length;
  const filled = Math.min(placed, given);
  const done = a.slice(0, n).filter((v, i) => v >= 0 && a[n + i] >= 0).length;
  const okClues = states.filter((s) => s === true).length;
  const style = { "--gc": GAME_META[c.game].color, "--gl": look.light, "--gd": look.deep } as React.CSSProperties;
  const narrator = (
    <aside className="cx-narrator" aria-label={`História, contada por ${c.narrator.name}`}>
      <span className="cx-narrator-pic" aria-hidden="true"><img className="art is-cast fill" src={c.narrator.img} alt="" width={96} height={96} /></span>
      <div className="cx-bubble">
        <p>{c.story}</p>
        <p className="cx-bubble-goal"><b>🔍 {c.goal}</b></p>
        <small>— {c.narrator.name}</small>
      </div>
    </aside>
  );

  if (result) {
    const medal = medalFor(hints);
    const s = result.solve;
    return (
      <div className="wrap cx-done" data-game={c.game} style={style}>
        <Celebration accent={GAME_META[c.game].color} onBurst={() => sfx("burst")} />
        <div className="cx-stamp" aria-hidden="true">CASO RESOLVIDO</div>
        <div className="cx-done-hero">
          <CaseMedalIcon medal={medal} size={84} />
          <div>
            <p className="cx-eyebrow">{GAME_META[c.game].name} · Investigação</p>
            <h1>{c.title}</h1>
            <p><b>{MEDAL_LABEL[medal]}</b> — {hints === 0 ? "sem nenhuma dica. Dedução pura!" : `com ${hints} dica${hints > 1 ? "s" : ""}.`}</p>
          </div>
        </div>
        <div className="cx-narrator done">
          <span className="cx-narrator-pic" aria-hidden="true"><img className="art is-cast fill" src={c.narrator.img} alt="" width={96} height={96} /></span>
          <div className="cx-bubble"><p className="cx-ending">{c.ending}</p><small>— {c.narrator.name}</small></div>
        </div>
        <ul className="cx-solution" aria-label="Solução">
          {m.people.map((p, i) => (
            <li key={i}><span aria-hidden="true"><Art e={p} /></span><b>{p.label}</b><span>{m.scene.rooms[m.scene.room[a[i]]].label}</span><span aria-hidden="true"><Art e={m.objects[a[n + i]]} /></span><span>{m.objects[a[n + i]].label}</span></li>
          ))}
        </ul>
        <dl className="cx-kpis">
          <div><dt>Tempo</dt><dd>{formatTime(s.ms)}</dd></div>
          <div className={s.record ? "hl" : ""}><dt>{s.record ? "Novo recorde!" : "Melhor tempo"}</dt><dd>{formatTime(result.bestMs)}</dd></div>
          <div className="xp"><dt>Experiência</dt><dd>{s.first ? `+${s.xp} XP` : "—"}</dd></div>
          <div><dt>Dicas</dt><dd>{hints}/{MAX_HINTS}</dd></div>
        </dl>
        {!s.first && <p className="muted small">Caso revisto: o XP é ganho só na primeira solução, mas tempo e medalha podem melhorar.</p>}
        {result.medals.length > 0 && (
          <div className="lc-medals cx-ach" role="status">
            <p className="lc-medals-t">{result.medals.length > 1 ? `${result.medals.length} conquistas desbloqueadas!` : "Conquista desbloqueada!"}</p>
            <ul>{result.medals.map((x) => <li key={x.id}><Medal a={x} size={34} /><span><b>{x.title}</b><small>{RARITY_LABEL[x.rarity]}</small></span></li>)}</ul>
          </div>
        )}
        <section className="cx-why">
          <button className="cx-why-t" aria-expanded={showWhy} onClick={() => setShowWhy((v) => !v)}>{showWhy ? "▾" : "▸"} Como desvendar o caso (explicação)</button>
          {showWhy && <ol>{c.explanation.map((t, i) => <li key={i}>{t}</li>)}</ol>}
        </section>
        <div className="cx-done-actions">
          <button ref={doneRef} className="btn cta" onClick={() => { sfx("ui"); onContinue(); }}>{continueLabel}</button>
          <button className="btn sec" onClick={() => { sfx("ui"); onExit(); }}>{exitLabel}</button>
        </div>
      </div>
    );
  }

  const started = a.some((v) => v >= 0) || hints > 0 || clock.ms > 0;
  if (stage === "story") {
    return (
      <div className="wrap cx-story-stage" data-game={c.game} style={style}>
        <button className="cx-back" onClick={() => (started ? setStage("play") : onExit())}>‹ {started ? "Voltar à investigação" : exitLabel}</button>
        <div className="cx-story-art" aria-hidden="true">
          <img src={c.art} alt="" decoding="async" />
          <CaseScene kind={c.kind} look={look} className="cx-scene-art" />
        </div>
        <p className="cx-eyebrow"><Gem kind={c.game} size={18} />{KIND_NAME[c.kind]} · {c.world} · {c.difficultyLabel}</p>
        <h1 id="cx-title">{c.title}</h1>
        {narrator}
        <ul className="cx-facts" aria-label="Sobre o caso">
          <li>⏱ {c.estimate[0]}–{c.estimate[1]} min</li>
          <li>🧩 {c.structureName}</li>
          <li>👥 {n} personagens · {n} objetos</li>
          <li>{c.clues.length} pistas</li>
          <li>{record.solvedAt !== null ? "Revisão (XP já ganho)" : `${xpFor(c.difficulty, hints)} XP`}</li>
        </ul>
        <div className="cx-sticky">
          <button className="btn cta" autoFocus onClick={() => { sfx("ui"); setStage("play"); }}>{started ? "Continuar investigação" : "Começar investigação"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap cx-play" data-game={c.game} style={style}>
      <header className="cx-head">
        <button className="cx-back icon" onClick={() => { onDraft({ a, hints, ms: Math.round(clock.read()), k: c.storyKey, x: xKeys() }); onExit(); }} aria-label={exitLabel} title={exitLabel}>‹</button>
        <div className="cx-head-t"><b id="cx-title"><Gem kind={c.game} size={20} /> {c.title}</b><small>{KIND_NAME[c.kind]} · {c.world}</small></div>
        <button className="cx-back icon" onClick={() => setStage("story")} aria-label="Reler a história" title="Reler a história">📖</button>
        <span className="cx-timer" aria-label={`Tempo: ${formatTime(clock.ms)}`}>{formatTime(clock.ms)}</span>
      </header>

      <div className="cx-desk">
        <div className="cx-main">
          <section className="cx-panel cx-panel-board" aria-labelledby="cx-p-board">
            <h2 className="cx-panel-t" id="cx-p-board">Tabuleiro<small>{placed}/{n} no lugar</small></h2>
            <CaseBoard model={m} a={a} sel={sel} done={!!result} showErrors={ruleState === false} focus={focus} onSelect={select} onPlace={place} />
          </section>

          <section className="cx-panel cx-panel-decide" aria-labelledby="cx-p-ded">
            <h2 className="cx-panel-t" id="cx-p-ded">Quadro de decisões<small>{noteCount} anotações</small></h2>
            <DecisionBoard m={m} cells={cellNotes} grid={gridNotes} focus={focus} done={!!result} onCell={cycleCell} onGrid={cycleGrid} />
            <div className="cx-tools">
              <button className="btn sec sm" onClick={undo} disabled={!undoStack.length}>↶ Desfazer</button>
              {askClear ? (
                <span className="cx-ask" role="alertdialog" aria-label="Confirmar limpeza">Apagar o quadro todo?
                  <button className="btn danger sm" onClick={clearMarks}>Apagar</button>
                  <button className="btn sec sm" onClick={() => setAskClear(false)}>Cancelar</button>
                </span>
              ) : <button className="btn sec sm" onClick={() => setAskClear(true)} disabled={!noteCount}>Limpar quadro…</button>}
            </div>
          </section>
        </div>

        <div className="cx-side">
          <section className="cx-panel" aria-labelledby="cx-p-clues">
            <h2 className="cx-panel-t" id="cx-p-clues">Pistas<small>{okClues}/{c.clues.length} ✓</small></h2>
            <CluesPanel c={c} states={states} ruleState={ruleState} crossed={crossed} fresh={fresh} broken={broken} hints={hints} focus={focus} pick={pick} onPick={choosePick}
              onCross={(i) => setCrossed((cur) => { const x = new Set(cur); if (x.has(i)) x.delete(i); else x.add(i); return x; })} />
          </section>

          <section className="cx-panel cx-panel-answer" aria-labelledby="cx-p-ans">
            <h2 className="cx-panel-t" id="cx-p-ans">Sua resposta<small>{done}/{n}</small></h2>
            <AnswerPanel m={m} a={a} done={!!result} onPlace={place} onGive={give} />
            <div className={msg.text ? `note ${msg.tone}` : "sr"} role="status" aria-live="polite">{msg.text && <><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></>}</div>
            <button className="btn cta cx-verify" onClick={verify} disabled={filled < n}>🔍 Verificar</button>
            <div className="cx-actions-bar">
              <button className="btn sec" onClick={hint} disabled={hints >= MAX_HINTS}
                title={record.solvedAt !== null ? undefined : `Cada dica reduz o XP: ${xpFor(c.difficulty, hints)} → ${xpFor(c.difficulty, hints + 1)}`}>
                {hints >= MAX_HINTS ? "Sem dicas" : <>💡 Dica <small>{hints + 1}/{MAX_HINTS}</small></>}
              </button>
              <button className="btn sec" onClick={clear} disabled={!a.some((v) => v >= 0)}>Limpar resposta</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
