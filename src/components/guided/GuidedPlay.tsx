"use client";
// Partida guiada. Substitui o tutorial passo a passo, em que os alunos tentavam jogar e travavam. Aqui o personagem
// do jogo conduz uma partida DE VERDADE num tabuleiro pequeno e fácil, com a MESMA mecânica da partida:
//  • Tango: cada toque na casa troca vazia → Cristal → Orbe → vazia; Astros: vazia → × → astro → vazia (e "Em volta");
//  • Zip: arrastar o dedo pela trilha (ou tocar casa por casa); Patches: arrastar de um canto ao outro (ou tocar
//    nos dois cantos); Mini Sudoku: tocar na casa e no número — os números já usados em todas as linhas apagam.
// Como funciona:
//  1. o personagem fala uma coisa por vez (balão curto) e mostra as partes do tabuleiro (linhas, colunas, blocos);
//  2. mostra um exemplo ERRADO (vermelho), explica e desfaz;
//  3. guia o lance certo, iluminando só o que tocar (o resto escurece e não responde); errou? dica gentil;
//  4. nas últimas casas solta o jogador ("Agora é com você!") e só ajuda se ele errar ou demorar.
// O roteiro de cada jogo (e a mecânica dele, em `act`) fica em scripts.tsx; este arquivo é o "motor".
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSfx } from "../useSound";
import { castImg, narratorOf } from "../../lib/cast";
import { GAME_META } from "../../lib/games";
import type { JourneyGame } from "../../lib/journey";

/** Um lance guiado: os toques esperados, em ordem (ex.: ["c-2-1", "c-2-1"] = tocar duas vezes na mesma casa). */
export interface Move { taps: string[]; hint: string }
/** Um momento da partida guiada. */
export type GStep<P> =
  | { k: "say"; text: string; show?: (p: P) => P } // fala (e, se quiser, mostra algo no tabuleiro)
  | { k: "wrong"; text: string; show: (p: P) => P } // exemplo errado: mostra, explica e depois desfaz
  | { k: "do"; move: Move; say: string[] } // lance guiado: uma fala para cada toque
  | { k: "free"; text: string; hint: string; moves: Move[] }; // "Agora é com você!" (moves = um jeito de resolver)
/** Como o tabuleiro está: resolvido? há algo errado (e onde)? qual o próximo toque útil (para a ajuda)? */
export interface Check { solved: boolean; wrong?: string; next?: string }
export interface Script<P extends object = object> {
  /** Mini tabuleiro (sem ele, só o personagem fala — versões curtas de mudança de tamanho). */
  Mini?: React.ComponentType<P>;
  start?: P;
  steps: GStep<P>[];
  /** A mecânica do jogo: o que um toque faz no tabuleiro (igual à partida). */
  act?: (p: P, tap: string) => P;
  /** Toque que o jogo recusa (ex.: número já usado em todas as linhas): a mensagem gentil. */
  reject?: (p: P, tap: string) => string | null;
  /** Parte livre: o personagem confere o tabuleiro depois de cada toque. */
  check?: (p: P) => Check;
  /** Arrastar o dedo: "path" (cada casa por onde passa conta como um toque — Zip) ou "rect" (canto → canto — Patches). */
  drag?: "path" | "rect";
  /** Tabuleiro concluído (comemoração). */
  win?: (p: P) => P;
}

export type GuidedEnd = "complete" | "skipped";

interface Props {
  game: JourneyGame;
  script: Script<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Título curto (ex.: "Partida guiada" ou "Novidade no capítulo 3"). */
  title: string;
  /** Texto do botão final. */
  finish: string;
  onEnd: (how: GuidedEnd) => void;
}

const IDLE_HELP_MS = 12000; // na parte livre, se a pessoa demorar, o personagem ajuda
const kind = (t: string) => t.split("-")[0]; // "c" (casa) ou "pad" (botão)
const cellAt = (x: number, y: number) => { const t = document.elementFromPoint(x, y)?.closest("[data-t]")?.getAttribute("data-t"); return t && t.startsWith("c-") ? t : null; };

export default function GuidedPlay({ game, script, title, finish, onEnd }: Props) {
  const who = narratorOf(game);
  const sfx = useSfx(game);
  const { Mini, steps } = script;
  // Estado guardado em ref (vários toques podem chegar no mesmo arrasto, antes de a tela redesenhar) e espelhado
  // na tela por `redraw`.
  const st = useRef({ i: 0, p: script.start as object, tap: 0, hint: null as string | null, help: false });
  const [, setView] = useState(0);
  const redraw = () => setView((v) => v + 1);
  const [bump, setBump] = useState(0); // reinicia o relógio de "demorou"
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: string; last: string; moved: boolean } | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [bottom, setBottom] = useState(0);

  const { i, p, tap, hint, help } = st.current;
  const step = steps[i] as GStep<any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  const finished = i >= steps.length;
  const check = step?.k === "free" && script.check ? script.check(p) : null;
  /** Próximo toque (para iluminar): no lance guiado, sempre; na parte livre, só quando o personagem está ajudando. */
  const expected: string | null = !step ? null : step.k === "do" ? step.move.taps[tap] : step.k === "free" && help && check ? (check.wrong ?? check.next ?? null) : null;
  const shown = finished && script.win ? script.win(p) : step && (step.k === "wrong" || step.k === "say") && step.show ? step.show(p) : p;
  const text = hint ?? (finished ? "Mandou bem! Partida completa! 🎉" : !step ? "" : step.k === "do" ? step.say[Math.min(tap, step.say.length - 1)] : step.text);

  // O menu inferior continua visível e clicável: a partida guiada termina logo acima dele.
  useLayoutEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".bnav")?.getBoundingClientRect();
      setBottom(nav && nav.top > window.innerHeight / 2 ? Math.max(0, window.innerHeight - nav.top) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Holofote: um recorte em volta da casa/botão esperado; todo o resto escurece.
  useLayoutEffect(() => {
    const place = () => {
      const el = expected ? boardRef.current?.querySelector(`[data-t="${expected}"]`) : null;
      const root = rootRef.current?.getBoundingClientRect();
      if (!el || !root) return setSpot((s) => (s ? null : s));
      const r = el.getBoundingClientRect();
      const n = { x: Math.round(r.left - root.left - 4), y: Math.round(r.top - root.top - 4), w: Math.round(r.width + 8), h: Math.round(r.height + 8) };
      setSpot((s) => (s && s.x === n.x && s.y === n.y && s.w === n.w && s.h === n.h ? s : n)); // só atualiza se mudou
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [expected, i, tap, bottom]);

  // Parte livre: se a pessoa demorar, o personagem ajuda (dica + holofote).
  useEffect(() => {
    if (step?.k !== "free" || help) return;
    const t = window.setTimeout(() => { st.current.help = true; st.current.hint = step.hint; redraw(); }, IDLE_HELP_MS);
    return () => window.clearTimeout(t);
  }, [step, help, bump]);

  function next() { Object.assign(st.current, { i: st.current.i + 1, tap: 0, hint: null, help: false }); }
  function gentle(h: string) { sfx("block"); st.current.hint = h; }

  /** Um toque (ou uma casa por onde o dedo passou). */
  function onTap(t: string) {
    const s = st.current;
    const stp = steps[s.i] as GStep<any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!stp || stp.k === "say" || stp.k === "wrong") return;
    setBump((b) => b + 1);
    if (stp.k === "do") {
      const exp = stp.move.taps[s.tap];
      if (t !== exp) { if (kind(t) === kind(exp)) gentle(stp.move.hint); redraw(); return; }
      s.p = script.act ? script.act(s.p, t) : s.p;
      s.hint = null; sfx("select");
      if (s.tap < stp.move.taps.length - 1) s.tap += 1;
      else { sfx("advance"); next(); }
      return redraw();
    }
    // Parte livre: joga de verdade; o personagem confere e só ajuda se algo estiver errado.
    const no = script.reject?.(s.p, t);
    if (no) { gentle(no); return redraw(); }
    s.p = script.act ? script.act(s.p, t) : s.p;
    const c = script.check?.(s.p);
    if (c?.solved) { sfx("advance"); next(); }
    else if (c?.wrong) { gentle(stp.hint); s.help = true; }
    else { sfx("select"); s.hint = null; }
    redraw();
  }

  // Toques nos botões (teclado de números/símbolos): clique. Toques nas casas: pelo ponteiro (tocar ou arrastar).
  function onClick(e: React.MouseEvent) {
    const t = (e.target as Element).closest("[data-t]")?.getAttribute("data-t");
    if (t && !t.startsWith("c-") && !finished) onTap(t);
  }
  function onPointerDown(e: React.PointerEvent) {
    const t = (e.target as Element).closest("[data-t]")?.getAttribute("data-t");
    if (!t || !t.startsWith("c-") || finished) return;
    drag.current = { start: t, last: t, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const t = cellAt(e.clientX, e.clientY);
    if (!t || t === d.last) return;
    d.last = t; d.moved = true;
    if (script.drag === "path") onTap(t); // Zip: cada casa por onde o dedo passa
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) onTap(d.start); // foi só um toque
    else if (script.drag === "rect") { onTap(d.start); onTap(d.last); } // Patches: canto → canto
  }

  // Fim: comemora no tabuleiro.
  useEffect(() => { if (finished) sfx("celebrate"); }, [finished, sfx]);

  const canContinue = !!step && (step.k === "say" || step.k === "wrong");
  const style = { "--gc": GAME_META[game].color, bottom } as React.CSSProperties;
  return (
    <div className="gp" role="dialog" aria-modal="false" aria-labelledby="gp-title" ref={rootRef} style={style} data-expect={expected ?? ""}>
      <header className="gp-head">
        <p id="gp-title"><b>{title}</b><span>{GAME_META[game].name}</span></p>
        <button type="button" className="gp-skip" onClick={() => onEnd("skipped")}>Pular ›</button>
      </header>
      {Mini && shown && (
        <div className="gp-board" ref={boardRef} onClick={onClick} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onPointerCancel={() => { drag.current = null; }} style={{ touchAction: script.drag ? "none" : undefined }}>
          <Mini {...shown} />
        </div>
      )}
      {spot && <div className="gp-spot" aria-hidden="true" style={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h }} />}
      <div className={`gp-talk${Mini ? "" : " solo"}`}>
        <img className="gp-who" src={castImg(who)} alt="" width={72} height={72} />
        <div className={`gp-bubble${hint ? " hint" : ""}`}>
          <p aria-live="polite"><b className="sr">{who.name}: </b>{text}</p>
          {canContinue && <button type="button" className="btn cta sm" autoFocus onClick={() => { sfx("ui"); next(); redraw(); }}>{step!.k === "wrong" ? "Entendi, desfaz" : "Continuar"}</button>}
          {finished && <button type="button" className="btn cta" autoFocus onClick={() => onEnd("complete")}>{finish}</button>}
        </div>
      </div>
    </div>
  );
}
