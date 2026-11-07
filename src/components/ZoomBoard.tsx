"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Zoom único para todos os tabuleiros.
// - Pinça (dois dedos): amplia/reduz em volta do ponto entre os dedos e arrasta o tabuleiro.
// - Um dedo: nos jogos de tocar (Sudoku, Tango), arrastar move o tabuleiro ampliado; sem zoom, rola a página.
//   No Zip um dedo continua traçando o caminho (a movimentação é feita com dois dedos).
// - Computador: Ctrl + roda do mouse (ou pinça do touchpad) e os botões − / + abaixo do tabuleiro.
// O tabuleiro só é movido com CSS transform, então toques e cliques continuam caindo na casa certa.

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const STEP = 0.5;
const DRAG_PX = 8; // quanto o dedo precisa andar para virar "arrastar" (e não "tocar")

type T = { s: number; x: number; y: number };
type Pt = { x: number; y: number };

const clampS = (s: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

interface Props {
  children: React.ReactNode;
  /** Largura máxima do tabuleiro em px. */
  maxWidth?: number;
  /** Arrastar com um dedo move o tabuleiro ampliado (desligado no Zip, onde um dedo traça o caminho). */
  panWithOneFinger?: boolean;
  /** Trava e volta ao tamanho normal (ex.: durante a animação de conclusão). */
  locked?: boolean;
  /** Avisa que começou uma pinça, para o jogo desfazer o que o primeiro dedo iniciou. */
  onGestureStart?: () => void;
  label?: string;
}

export default function ZoomBoard({ children, maxWidth = 360, panWithOneFinger = true, locked = false, onGestureStart, label = "tabuleiro" }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const t = useRef<T>({ s: 1, x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const pts = useRef(new Map<number, Pt>());
  const g = useRef<{ mode: "idle" | "tap" | "pinch" | "pan" | "scroll" | "ended"; start: Pt; last: Pt; t0: T; d0: number; m0: Pt }>({
    mode: "idle", start: { x: 0, y: 0 }, last: { x: 0, y: 0 }, t0: { s: 1, x: 0, y: 0 }, d0: 1, m0: { x: 0, y: 0 },
  });
  const swallowClick = useRef(false);
  const raf = useRef(0);
  const gestureCb = useRef(onGestureStart);
  gestureCb.current = onGestureStart;

  /** Mantém o tabuleiro cobrindo a área visível (nunca sobra espaço vazio ao arrastar). */
  const clamp = useCallback((n: T): T => {
    const el = box.current;
    if (!el) return n;
    const w = el.clientWidth, h = el.clientHeight;
    return { s: n.s, x: Math.min(0, Math.max(w - w * n.s, n.x)), y: Math.min(0, Math.max(h - h * n.s, n.y)) };
  }, []);

  const apply = useCallback((n: T, animate = false) => {
    const c = clamp({ ...n, s: clampS(n.s) });
    t.current = c;
    const el = layer.current;
    if (el) {
      el.classList.toggle("anim", animate);
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => { el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`; });
    }
    setScale((prev) => (Math.abs(prev - c.s) > 0.001 ? c.s : prev));
  }, [clamp]);

  /** Zoom em volta de um ponto (coordenadas relativas à caixa do tabuleiro). */
  const zoomAt = useCallback((s: number, at: Pt, animate: boolean) => {
    const cur = t.current, ns = clampS(s);
    const cx = (at.x - cur.x) / cur.s, cy = (at.y - cur.y) / cur.s; // ponto do tabuleiro sob `at`
    apply({ s: ns, x: at.x - cx * ns, y: at.y - cy * ns }, animate);
  }, [apply]);

  const center = (): Pt => ({ x: (box.current?.clientWidth ?? 0) / 2, y: (box.current?.clientHeight ?? 0) / 2 });
  const reset = useCallback(() => apply({ s: 1, x: 0, y: 0 }, true), [apply]);

  // Ao travar (fim da partida), volta ao tamanho normal para mostrar o tabuleiro inteiro.
  useEffect(() => { if (locked) { pts.current.clear(); g.current.mode = "idle"; reset(); } }, [locked, reset]);

  // Girar a tela ou redimensionar a janela: reajusta os limites.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => apply(t.current));
    ro.observe(el);
    return () => ro.disconnect();
  }, [apply]);

  // Listeners nativos (não passivos) para poder impedir o zoom da página inteira.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (locked) return;
      if (e.ctrlKey) {
        e.preventDefault();
        const r = el.getBoundingClientRect();
        zoomAt(t.current.s * Math.exp(-e.deltaY * 0.01), { x: e.clientX - r.left, y: e.clientY - r.top }, false);
        return;
      }
      // Com zoom, a roda move o tabuleiro; quando ele chega na borda, a página volta a rolar normalmente.
      if (t.current.s <= 1.001) return;
      const cur = t.current, next = clamp({ ...cur, x: cur.x - e.deltaX, y: cur.y - e.deltaY });
      if (next.x === cur.x && next.y === cur.y) return;
      e.preventDefault();
      apply(next);
    };
    const stop = (e: Event) => e.preventDefault(); // Safari (iOS) dispara gesture* para o zoom da página
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", stop);
    el.addEventListener("gesturechange", stop);
    return () => { el.removeEventListener("wheel", onWheel); el.removeEventListener("gesturestart", stop); el.removeEventListener("gesturechange", stop); };
  }, [zoomAt, apply, clamp, locked]);

  const rel = (e: React.PointerEvent): Pt => {
    const r = box.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function down(e: React.PointerEvent) {
    if (locked || (e.pointerType === "mouse" && e.button !== 0)) return;
    const p = rel(e);
    pts.current.set(e.pointerId, p);
    if (pts.current.size === 1) {
      swallowClick.current = false;
      g.current = { ...g.current, mode: "tap", start: p, last: p, t0: { ...t.current } };
    } else if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      g.current = { ...g.current, mode: "pinch", t0: { ...t.current }, d0: Math.max(1, dist(a, b)), m0: mid(a, b) };
      swallowClick.current = true;
      e.stopPropagation(); // o segundo dedo não conta como jogada
      gestureCb.current?.();
    } else e.stopPropagation();
  }

  function move(e: React.PointerEvent) {
    if (locked || !pts.current.has(e.pointerId)) return;
    const p = rel(e);
    pts.current.set(e.pointerId, p);
    const st = g.current;
    if (st.mode === "pinch" && pts.current.size >= 2) {
      e.stopPropagation();
      const [a, b] = [...pts.current.values()];
      const m = mid(a, b);
      const s = clampS(st.t0.s * (dist(a, b) / st.d0));
      const cx = (st.m0.x - st.t0.x) / st.t0.s, cy = (st.m0.y - st.t0.y) / st.t0.s;
      apply({ s, x: m.x - cx * s, y: m.y - cy * s });
      return;
    }
    if (st.mode === "pan" || st.mode === "scroll") {
      e.stopPropagation();
      if (st.mode === "pan") apply({ ...t.current, x: st.t0.x + p.x - st.start.x, y: st.t0.y + p.y - st.start.y });
      else window.scrollBy(0, st.last.y - p.y);
      st.last = p;
      return;
    }
    if (st.mode === "tap" && panWithOneFinger && dist(p, st.start) > DRAG_PX) {
      const zoomed = t.current.s > 1.001;
      if (zoomed) st.mode = "pan";
      else if (e.pointerType === "touch") st.mode = "scroll"; // sem zoom: arrastar no tabuleiro rola a página
      else return;
      swallowClick.current = true;
      st.last = p;
      e.stopPropagation();
    }
  }

  function up(e: React.PointerEvent) {
    if (!pts.current.delete(e.pointerId)) return;
    const st = g.current;
    if (st.mode === "pinch") {
      e.stopPropagation();
      st.mode = pts.current.size ? "ended" : "idle"; // o dedo que sobrou não faz nada até soltar
      if (t.current.s < 1.05) reset(); // soltou quase sem zoom: encaixa no tamanho normal
    } else if (!pts.current.size) st.mode = "idle";
  }

  // Um toque que virou pinça/arrasto não deve virar jogada.
  function click(e: React.MouseEvent) {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  // Navegação por teclado com zoom: traz a casa focada para dentro da área visível.
  function focusIn(e: React.FocusEvent) {
    const cur = t.current;
    if (cur.s <= 1.001 || !box.current) return;
    const b = box.current.getBoundingClientRect(), r = (e.target as HTMLElement).getBoundingClientRect();
    let { x, y } = cur;
    if (r.left < b.left) x += b.left - r.left; else if (r.right > b.right) x -= r.right - b.right;
    if (r.top < b.top) y += b.top - r.top; else if (r.bottom > b.bottom) y -= r.bottom - b.bottom;
    if (x !== cur.x || y !== cur.y) apply({ ...cur, x, y }, true);
  }

  const pct = Math.round(scale * 100);
  return (
    <div className="zoom-area" style={{ "--zw": `${maxWidth}px` } as React.CSSProperties}>
      <div ref={box} className={`zoom${scale > 1.001 ? " zoomed" : ""}`}
        onPointerDownCapture={down} onPointerMoveCapture={move} onPointerUpCapture={up} onPointerCancelCapture={up}
        onClickCapture={click} onFocusCapture={focusIn}>
        <div ref={layer} className="zoom-layer">{children}</div>
      </div>
      <div className="zoom-bar" role="group" aria-label={`Zoom do ${label}`}>
        <span className="zoom-hint" aria-hidden="true">{scale > 1.001 ? (panWithOneFinger ? "Arraste para mover" : "Dois dedos para mover") : "Pinça para ampliar"}</span>
        <button type="button" onClick={() => zoomAt(t.current.s - STEP, center(), true)} disabled={locked || scale <= MIN_ZOOM + 0.001} aria-label="Diminuir zoom">−</button>
        <button type="button" className="zoom-pct" onClick={reset} disabled={locked || scale <= MIN_ZOOM + 0.001} aria-label={`Zoom em ${pct}%. Voltar ao tamanho normal`}>{pct}%</button>
        <button type="button" onClick={() => zoomAt(t.current.s + STEP, center(), true)} disabled={locked || scale >= MAX_ZOOM - 0.001} aria-label="Aumentar zoom">+</button>
      </div>
    </div>
  );
}
