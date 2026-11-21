"use client";
// Tela da investigação. Três etapas: a história (contada pelo narrador do jogo), a investigação e o caso resolvido.
// A investigação (a história fica na etapa anterior e no botão 📖):
//   Tabuleiro          — o cenário, onde os personagens são encaixados (fileira de personagens embaixo);
//   Quadro de decisões — uma grade por tipo de informação (Linha, Coluna, Cômodo, Objeto…; cada jogo tem as suas),
//                        em abas; cada célula: vazio → ✕ → ✓; "Ajuda automática" preenche os ✕ óbvios de cada ✓;
//                        com Desfazer e Limpar quadro;
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
import { type Case, firstBroken, hintFor, isComplete, isCorrect } from "../../lib/cases/catalog";
import { MAX_HINTS, MEDAL_LABEL, medalFor, xpFor } from "../../lib/cases/config";
import { allowedCells, cellName, clueState, unitOf } from "../../lib/cases/model";
import type { CaseRecord, Draft, Solve } from "../../lib/cases/progress";
import { type Marks, type Pick, MARK_YES, autoMarks, focusOf, markKey, marksFrom, marksTo, nextMark, suggestions } from "../../lib/cases/relations";
import { KIND_NAME } from "../../lib/cases/themes";
import { GAME_META } from "../../lib/games";
import { formatTime } from "../../lib/records";
import { GAME_LOOK } from "../../lib/scenes";
import { CaseMedalIcon } from "./CaseArt";
import CaseBoard from "./CaseBoard";
import { AnswerPanel, CluesPanel, DecisionGrids } from "./CasePanels";
import CaseIntro from "./CaseIntro";
import { SheetsModal } from "./CaseSheets";
import Art from "../Art";

/** Uma jogada que pode ser desfeita (respostas + marcações). */
type Snap = { a: number[]; x: number[] };
/** Preferência da "Ajuda automática" (guardada no aparelho quando a pessoa mexe nela). */
const AUTO_KEY = "mindloop:cx-autohelp";

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
  const draftKey = `${c.storyKey}@grades`;
  const draft = record.draft && record.draft.k === draftKey && record.draft.a.length === 2 * n ? record.draft : null;
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
  // Fichas abertas: "all" (todas) ou o índice do objeto tocado.
  const [sheet, setSheet] = useState<number | "all" | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const clock = useStopwatch(active && !result && stage === "play", draft?.ms ?? 0);
  const sfx = useSfx(c.game);
  const doneRef = useRef<HTMLButtonElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });
  // Quadro de decisões (uma grade por tipo de informação), seleção que acende as ligações e desfazer.
  const [marks, setMarks] = useState<Marks>(() => marksFrom(m, c.dims, draft?.x ?? []));
  const xKeys = () => marksTo(marks);
  const noteCount = marks.size;
  const [tab, setTab] = useState(0);
  const [autoOn, setAutoOn] = useState<boolean>(() => {
    try { const v = window.localStorage.getItem(AUTO_KEY); if (v === "1" || v === "0") return v === "1"; } catch { /* sem armazenamento */ }
    return c.difficulty <= 2; // ligada por padrão nos níveis iniciais
  });
  const auto = useMemo(() => autoMarks(c.dims, marks, n), [c.dims, marks, n]);
  const suggest = useMemo(() => suggestions(m, c.dims, marks), [m, c.dims, marks]);
  /** Dica em andamento: qual conclusão (chave) e quantos níveis já foram revelados (1 a 3). */
  const [hintAt, setHintAt] = useState<{ key: string; level: number } | null>(null);
  const [pick, setPick] = useState<Pick>(null);
  const [undoStack, setUndoStack] = useState<Snap[]>([]);
  const [askClear, setAskClear] = useState(false);
  const focus = useMemo(() => focusOf(m, c.clues, pick, c.dims), [m, c.clues, pick, c.dims]);
  const remember = () => setUndoStack((u) => [...u.slice(-59), { a: a.slice(), x: xKeys() }]);
  /** O que a pessoa já sabe: um ✓ no quadro ou a própria resposta preenchida. */
  const known = (d: number, s: number, v: number) => {
    if (marks.get(markKey(d, s, v)) === MARK_YES) return true;
    const dim = c.dims[d];
    if (dim.id === "obj") return a[n + s] === v;
    return a[s] >= 0 && dim.of!(unitOf(m, a[s])) === v;
  };
  const hintInfo = useMemo(() => hintFor(c, known), [c, marks, a]); // eslint-disable-line react-hooks/exhaustive-deps
  const hintKey = hintInfo ? `${hintInfo.clue}|${hintInfo.concl.d}|${hintInfo.concl.s}|${hintInfo.concl.v}` : null;
  const shownHint = hintInfo && hintAt && hintAt.key === hintKey ? { info: hintInfo, level: hintAt.level } : null;

  function choosePick(p: Pick) {
    setPick(p);
    if (p?.t === "person") setSel(p.i);
    if (p?.t === "clue") setTab(c.clueDims[p.i]); // a grade da pista abre sozinha
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
    if (!result) onDraft({ a, hints, ms: Math.round(clock.read()), k: draftKey, x: xKeys() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, hints, marks]);

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

  /** Célula da grade: vazio → ✕ → ✓ → vazio (um ✕ automático conta como vazio). */
  function cycle(d: number, s: number, v: number) {
    if (result) return;
    const k = markKey(d, s, v), nx = nextMark(marks.get(k));
    remember();
    const next = new Map(marks);
    if (nx === undefined) next.delete(k); else next.set(k, nx);
    setMarks(next);
    sfx(nx === undefined ? "erase" : nx === MARK_YES ? "place" : "select");
  }
  function toggleAuto(on: boolean) {
    setAutoOn(on);
    try { window.localStorage.setItem(AUTO_KEY, on ? "1" : "0"); } catch { /* sem armazenamento */ }
  }
  function clearMarks() {
    if (result || !noteCount) return;
    remember(); sfx("undo");
    setMarks(new Map()); setAskClear(false);
    say("info", "Quadro de decisões apagado. Os personagens no tabuleiro e a resposta continuam como estavam.");
  }
  function undo() {
    if (result || !undoStack.length) { sfx("block"); return; }
    const last = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setA(last.a); setMarks(marksFrom(m, c.dims, last.x)); setBroken(null);
    sfx("undo");
    say("info", "Última ação desfeita.");
  }
  /**
   * Dicas em 3 níveis para o próximo passo que a pessoa ainda não marcou: 1) qual pista usar; 2) qual grade e
   * fileira (a célula pisca); 3) a conclusão daquele passo. Nunca a solução inteira. Cada nível gasta uma dica.
   */
  function hint() {
    if (result || hints >= MAX_HINTS) return;
    if (!hintInfo || !hintKey) { sfx("block"); return say("info", "Seu quadro já tem todas as conclusões. Preencha a resposta e toque em Verificar!"); }
    const level = hintAt && hintAt.key === hintKey ? Math.min(3, hintAt.level + 1) : 1;
    if (hintAt && hintAt.key === hintKey && hintAt.level >= 3) return say("hint", "Esta dica já está completa abaixo das pistas. Marque a conclusão no quadro para seguir.");
    sfx("hint");
    setHints((h) => h + 1);
    setHintAt({ key: hintKey, level });
    if (level === 1) setPick({ t: "clue", i: hintInfo.clue });
    if (level >= 2) setTab(hintInfo.concl.d);
    say("hint", `Dica ${level} revelada abaixo das pistas.`);
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
      sfx("win"); // a comemoração toca logo depois (efeito abaixo, cancelado se a pessoa sair antes)
      return;
    }
    // Errou: não revela a solução — só aponta que algo não fecha (e qual pista conferir).
    const b = firstBroken(c, a);
    sfx("error");
    setBroken(b);
    say("warn", b === null ? "Algo não fecha. Revise suas deduções." : b < 0 ? "Sua resposta contraria a regra do lugar (marcada em vermelho). Revise as posições." : `Existe uma inconsistência: a pista ${b + 1} não confere com sua resposta. O resto pode estar certo — continue investigando!`);
  }

  useEffect(() => { if (result) doneRef.current?.focus({ preventScroll: true }); }, [result]);
  useEffect(() => {
    if (!result) return;
    const t = window.setTimeout(() => sfx("celebrate"), 700);
    return () => window.clearTimeout(t);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.scrollTo(0, 0); }, [result, stage]);

  const placed = a.slice(0, n).filter((v) => v >= 0).length;
  const given = a.slice(n).filter((v) => v >= 0).length;
  const filled = Math.min(placed, given);
  const done = a.slice(0, n).filter((v, i) => v >= 0 && a[n + i] >= 0).length;
  const okClues = states.filter((s) => s === true).length;
  const style = { "--gc": GAME_META[c.game].color, "--gl": look.light, "--gd": look.deep } as React.CSSProperties;

  const openSheet = (o: number | "all") => { sfx("ui"); setSheet(o); };
  const sheets = sheet !== null && <SheetsModal c={c} focus={sheet === "all" ? undefined : sheet} onClose={() => setSheet(null)} />;

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
            <li key={i}><span aria-hidden="true"><Art e={p} /></span><b>{p.label}</b><span>{m.rule === "comodos" ? "" : `${m.trail ? `parada ${m.trail.indexOf(a[i]) + 1}` : cellName(m, a[i])} · `}{m.scene.rooms[m.scene.room[a[i]]].label}</span><span aria-hidden="true"><Art e={m.objects[a[n + i]]} /></span><span>{m.objects[a[n + i]].label}</span></li>
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
          {/* Aberto pelo caderno, "sair" e "continuar" levam ao mesmo lugar: um botão só. */}
          {exitLabel !== continueLabel && <button className="btn sec" onClick={() => { sfx("ui"); onExit(); }}>{exitLabel}</button>}
        </div>
      </div>
    );
  }

  const started = a.some((v) => v >= 0) || hints > 0 || clock.ms > 0;
  if (stage === "story") {
    // Cada item inteiro numa linha (espaço que não quebra): "⏱ 3–5 min" nunca se separa.
    const meta = [c.world, c.difficultyLabel, `⏱ ${c.estimate[0]}–${c.estimate[1]} min`, record.solvedAt !== null ? "Revisão" : `${xpFor(c.difficulty, hints)} XP`]
      .map((x) => x.replace(/ /g, "\u00a0")).join(" · ");
    return (
      <CaseIntro c={c} style={style} meta={meta} started={started} exitLabel={exitLabel}
        onBack={() => (started ? setStage("play") : onExit())} onStart={() => { sfx("ui"); setStage("play"); }} onTick={() => sfx("select")} />
    );
  }

  return (
    <div className="wrap cx-play" data-game={c.game} style={style}>
      {sheets}
      <header className="cx-head">
        <button className="cx-back icon" onClick={() => { onDraft({ a, hints, ms: Math.round(clock.read()), k: draftKey, x: xKeys() }); onExit(); }} aria-label={exitLabel} title={exitLabel}>‹</button>
        <div className="cx-head-t"><b id="cx-title"><Gem kind={c.game} size={20} /> {c.title}</b><small>{KIND_NAME[c.kind]} · {c.world}</small></div>
        <button className="cx-back icon" onClick={() => setStage("story")} aria-label="Reler a história" title="Reler a história">📖</button>
        <span className="cx-timer" aria-label={`Tempo: ${formatTime(clock.ms)}`}>{formatTime(clock.ms)}</span>
      </header>

      <div className="cx-desk">
        <div className="cx-main">
          <section className="cx-panel cx-panel-board" aria-labelledby="cx-p-board">
            <h2 className="cx-panel-t" id="cx-p-board">Tabuleiro<small>{placed}/{n} no lugar</small></h2>
            <CaseBoard model={m} a={a} sel={sel} done={!!result} showErrors={ruleState === false} focus={focus} suggest={suggest} onSelect={select} onPlace={place} />
          </section>

          <section className="cx-panel cx-panel-decide" aria-labelledby="cx-p-ded">
            <h2 className="cx-panel-t" id="cx-p-ded">Quadro de decisões<small>{noteCount} anotações</small></h2>
            <DecisionGrids c={c} marks={marks} auto={auto} autoOn={autoOn} tab={tab} focus={focus} done={!!result}
              hintCell={shownHint && shownHint.level >= 2 ? shownHint.info.concl : null} onTab={setTab} onCycle={cycle} onAuto={toggleAuto}
              onObject={c.objectCards.length ? openSheet : undefined} />
            <div className="cx-tools">
              {c.objectCards.length > 0 && <button className="btn sec sm" onClick={() => openSheet("all")} aria-label="Fichas dos personagens e objetos">🗂️ Fichas</button>}
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
            <CluesPanel c={c} states={states} ruleState={ruleState} crossed={crossed} fresh={fresh} broken={broken} hint={shownHint} focus={focus} pick={pick} onPick={choosePick}
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
