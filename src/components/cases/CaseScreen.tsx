"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Celebration from "../Celebration";
import Gem from "../Gem";
import Medal from "../Medal";
import { useStopwatch } from "../useLevelPlay";
import { useRevealedErrors, useSettled } from "../useRevealedErrors";
import { useSfx } from "../useSound";
import { RARITY_LABEL, type Achievement } from "../../lib/achievements";
import { type Case, firstBroken, isCorrect } from "../../lib/cases/catalog";
import { MAX_HINTS, MEDAL_LABEL, medalFor, xpFor } from "../../lib/cases/config";
import { clueState, involved } from "../../lib/cases/model";
import type { CaseRecord, Draft, Solve } from "../../lib/cases/progress";
import { KIND_NAME } from "../../lib/cases/themes";
import { GAME_META } from "../../lib/games";
import { formatTime } from "../../lib/records";
import { GAME_LOOK } from "../../lib/scenes";
import { CaseMedalIcon, CaseScene } from "./CaseArt";
import CaseBoard from "./CaseBoard";

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
  const look = GAME_LOOK[c.game];
  const draft = record.draft && record.draft.a.length === m.slots.length ? record.draft : null;
  const [a, setA] = useState<number[]>(() => draft?.a.map((v) => (v < m.values.length ? v : -1)) ?? m.slots.map(() => -1));
  const [hints, setHints] = useState(draft?.hints ?? 0);
  const [sel, setSel] = useState<number | null>(null);
  const [crossed, setCrossed] = useState<Set<number>>(new Set());
  const [fresh, setFresh] = useState<Set<number>>(new Set()); // pistas que acabaram de se confirmar (brilho)
  const [broken, setBroken] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: "info", text: draft ? "Investigação retomada de onde você parou." : "" });
  const [result, setResult] = useState<SolveResult | null>(null);
  // Etapas: primeiro a história (texto integral), depois a investigação. Quem retoma um caso vai direto à investigação.
  const [stage, setStage] = useState<"story" | "play">(draft ? "play" : "story");
  const [showWhy, setShowWhy] = useState(false);
  const clock = useStopwatch(active && !result && stage === "play", draft?.ms ?? 0);
  const sfx = useSfx(c.game);
  const doneRef = useRef<HTMLButtonElement>(null);
  const say = (tone: Tone, text: string) => setMsg({ tone, text });

  // Estado de cada pista com o que já foi preenchido (✓ cumprida, ✗ contrariada, • em aberto).
  // Nada é confirmado a cada toque: ✓ e ✗ só aparecem depois que a pessoa para por um instante
  // (mesmo intervalo dos 4 jogos), para a investigação não virar tentativa e erro.
  const liveRules = useMemo(() => c.rules.map((k) => clueState(m, k, a)), [a, c, m]);
  const liveStates = useMemo(() => c.clues.map((k) => clueState(m, k, a)), [a, c, m]);
  const settledA = useSettled(a);
  const settledOk = useMemo(() => c.clues.map((k) => clueState(m, k, settledA) === true), [settledA, c, m]);
  const settledRuleOk = useMemo(() => c.rules.map((k) => clueState(m, k, settledA) === true), [settledA, c, m]);
  const errKeys = useMemo(() => [
    ...liveRules.flatMap((s, i) => (s === false ? [`r${i}`] : [])),
    ...liveStates.flatMap((s, i) => (s === false ? [`c${i}:${involved(m, c.clues[i]).map((x) => a[x]).join(".")}`] : [])),
  ], [liveRules, liveStates, a, c, m]);
  const errs = useRevealedErrors(errKeys, a, () => { if (!result) sfx("error"); });
  const shownKeys = useMemo(() => new Set([...errs.visible].map((k) => k.split(":")[0])), [errs.visible]);
  const shownState = (live: boolean | null, ok: boolean, key: string): boolean | null =>
    live === false ? (shownKeys.has(key) ? false : null) : live === true && ok ? true : null;
  const ruleStates = liveRules.map((s, i) => shownState(s, settledRuleOk[i], `r${i}`));
  const states = liveStates.map((s, i) => shownState(s, settledOk[i], `c${i}`));
  const boardErrors = ruleStates.some((s) => s === false);
  const prev = useRef(states);
  useEffect(() => {
    const now = new Set<number>();
    states.forEach((s, i) => { if (s === true && prev.current[i] !== true) now.add(i); });
    prev.current = states;
    if (!now.size) return;
    setFresh(now);
    sfx("progress"); // dedução confirmada: brilho sonoro curto
    const t = window.setTimeout(() => setFresh(new Set()), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states.join()]);

  // Andamento salvo a cada mudança (sobrevive a recarregar a página ou fechar o app).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!result) onDraft({ a, hints, ms: Math.round(clock.read()) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, hints]);

  function assign(s: number, v: number) {
    if (result) return;
    setBroken(null);
    if (msg.tone !== "hint") setMsg({ tone: "info", text: "" });
    setA((cur) => {
      const next = cur.slice();
      if (v >= 0 && m.distinct) { const o = next.indexOf(v); if (o >= 0 && o !== s) next[o] = -1; }
      next[s] = v;
      return next;
    });
    sfx(v < 0 ? "erase" : "place", { v: v + 1, pos: m.values.length > 1 ? Math.max(0, v) / (m.values.length - 1) : 0 });
    if (m.kind === "code") { // no cofre, o próximo disco vazio fica selecionado (mais rápido no celular)
      const nextEmpty = a.findIndex((x, i) => i > s && x < 0);
      if (v >= 0 && nextEmpty >= 0) setSel(nextEmpty);
    }
  }

  function select(s: number | null) { if (!result) { if (s !== null) sfx("select"); setSel(s); } }

  function hint() {
    if (result || hints >= MAX_HINTS) return;
    sfx("hint");
    setHints((h) => h + 1);
    say("hint", `Dica ${hints + 1} de ${MAX_HINTS} revelada abaixo das pistas.`);
  }

  function clear() {
    if (result || a.every((v) => v < 0)) return;
    sfx("undo");
    setA(m.slots.map(() => -1)); setSel(null); setBroken(null);
    say("info", "Deduções apagadas. As pistas riscadas e as dicas continuam como estavam.");
  }

  function confirm() {
    if (result) return;
    if (a.some((v) => v < 0)) { sfx("block"); return say("info", "Complete todas as respostas antes de confirmar."); }
    if (isCorrect(c, a)) {
      const ms = Math.round(clock.read());
      const r = onSolve(ms, hints);
      setResult(r);
      sfx("win");
      window.setTimeout(() => sfx("celebrate"), 700);
      return;
    }
    const b = firstBroken(c, a);
    sfx("error");
    setBroken(b);
    say("warn", b === null ? "Algo não fecha. Revise suas deduções." : b < 0 ? "Sua resposta contraria uma regra do caso (marcada em vermelho). Revise essa parte." : `A pista ${b + 1} não confere com a sua resposta. Revise essa parte — o resto pode estar certo!`);
  }

  useEffect(() => { if (result) doneRef.current?.focus({ preventScroll: true }); }, [result]);
  useEffect(() => { window.scrollTo(0, 0); }, [result, stage]);

  const filled = a.filter((v) => v >= 0).length;
  const style = { "--gc": GAME_META[c.game].color, "--gl": look.light, "--gd": look.deep } as React.CSSProperties;

  if (result) {
    const medal = medalFor(hints);
    const s = result.solve;
    return (
      <div className="wrap cx-done" style={style}>
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

  const started = filled > 0 || hints > 0 || clock.ms > 0;
  if (stage === "story") {
    return (
      <div className="wrap cx-story-stage" style={style}>
        <button className="cx-back" onClick={() => (started ? setStage("play") : onExit())}>‹ {started ? "Voltar à investigação" : exitLabel}</button>
        <div className="cx-story-art" aria-hidden="true">
          <img src={c.art} alt="" decoding="async" />
          <CaseScene kind={c.kind} look={look} className="cx-scene-art" />
        </div>
        <p className="cx-eyebrow"><Gem kind={c.game} size={18} />{KIND_NAME[c.kind]} · {c.difficultyLabel}</p>
        <h1 id="cx-title">{c.title}</h1>
        <p className="cx-story">{c.story}</p>
        <p className="cx-goal"><b>🔍 {c.goal}</b></p>
        <ul className="cx-facts" aria-label="Sobre o caso">
          <li>⏱ {c.estimate[0]}–{c.estimate[1]} min</li>
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
    <div className="wrap cx-play" style={style}>
      <header className="cx-head">
        <button className="cx-back icon" onClick={() => { onDraft({ a, hints, ms: Math.round(clock.read()) }); onExit(); }} aria-label={exitLabel} title={exitLabel}>‹</button>
        <div className="cx-head-t"><b id="cx-title">{c.title}</b><small>{c.goal}</small></div>
        <button className="cx-back icon" onClick={() => setStage("story")} aria-label="Reler a história" title="Reler a história">📖</button>
        <span className="cx-timer" aria-label={`Tempo: ${formatTime(clock.ms)}`}>{formatTime(clock.ms)}</span>
      </header>

      <div className="cx-grid">
        <section className="cx-board" aria-label="Área de dedução">
          <CaseBoard model={m} a={a} sel={sel} done={!!result} showErrors={boardErrors} onSelect={select} onAssign={assign} />
          <div className={msg.text ? `note ${msg.tone}` : "sr"} role="status" aria-live="polite">{msg.text && <><b aria-hidden="true">{ICON[msg.tone]}</b><span>{msg.text}</span></>}</div>
          <div className="cx-actions-bar">
            <button className="btn sec" onClick={hint} disabled={hints >= MAX_HINTS}
              title={record.solvedAt !== null ? undefined : `Cada dica reduz o XP: ${xpFor(c.difficulty, hints)} → ${xpFor(c.difficulty, hints + 1)}`}>
              {hints >= MAX_HINTS ? "Sem dicas" : <>💡 Dica <small>{hints + 1}/{MAX_HINTS}</small></>}
            </button>
            <button className="btn sec" onClick={clear} disabled={filled === 0}>Limpar</button>
            <button className="btn cta cx-confirm" onClick={confirm} disabled={filled < m.slots.length}>Confirmar ({filled}/{m.slots.length})</button>
          </div>
        </section>

        <section className="cx-clues" aria-labelledby="cx-clues-t">
          <h2 id="cx-clues-t">Pistas <small>toque para riscar</small></h2>
          {hints > 0 && (
            <ol className="cx-hints" aria-label="Dicas reveladas">
              {c.hints.slice(0, hints).map((h, i) => <li key={i}><b>Dica {i + 1}</b>{h}</li>)}
            </ol>
          )}
          {c.ruleTexts.length > 0 && (
            <ul className="cx-rules" aria-label="Regras do caso">
              {c.ruleTexts.map((t, i) => (
                <li key={i} className={ruleStates[i] === false || broken === -1 - i ? "bad" : ruleStates[i] ? "ok" : ""}><span className="cx-st" aria-hidden="true">{ruleStates[i] === false ? "✗" : ruleStates[i] ? "✓" : "★"}</span>{t}</li>
              ))}
            </ul>
          )}
          <ol className="cx-list">
            {c.clueTexts.map((t, i) => {
              const st = states[i];
              const cls = [crossed.has(i) && "x", st === true && "ok", (st === false || broken === i) && "bad", fresh.has(i) && "fresh"].filter(Boolean).join(" ");
              return (
                <li key={i} className={cls}>
                  <button onClick={() => setCrossed((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    aria-pressed={crossed.has(i)} aria-label={`Pista ${i + 1}: ${t}${st === true ? " — confere com sua resposta" : st === false ? " — contrariada" : ""}. Toque para ${crossed.has(i) ? "desmarcar" : "riscar"}.`}>
                    <span className="cx-n">{i + 1}</span>
                    <span className="cx-t">{t}</span>
                    <span className="cx-st" aria-hidden="true">{st === true ? "✓" : st === false ? "✗" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
