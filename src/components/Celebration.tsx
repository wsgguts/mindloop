"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./useLevelPlay";

// Fogos de artifício + confetes desenhados num <canvas> (leve, sem bibliotecas).
// Nas cores do MindLoop. Com "reduzir movimento" ligado no aparelho, não desenha nada.

const COLORS = ["#F05BC8", "#12CFE0", "#FFD23F", "#762CEB", "#4FD6B1", "#FFFFFF", "#FFB020"];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Rocket = { x: number; y: number; vx: number; vy: number; ty: number; color: string };
type Confetto = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; wob: number };

/** onBurst: chamado a cada fogo que estoura (para o som acompanhar a imagem). */
export default function Celebration({ accent, onBurst }: { accent?: string; onBurst?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(onBurst);
  burstRef.current = onBurst;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || prefersReducedMotion()) return;
    const colors = accent ? [...COLORS, accent, accent] : COLORS;
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const sparks: Spark[] = [], rockets: Rocket[] = [], confetti: Confetto[] = [];
    const small = w < 520;
    const burst = (x: number, y: number, color: string) => {
      burstRef.current?.();
      const n = small ? 46 : 70;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.2, sp = 1.6 + Math.random() * (small ? 3.2 : 4.2);
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 50 + Math.random() * 30, color: Math.random() < 0.75 ? color : pick(colors), size: 1.6 + Math.random() * 1.6 });
      }
    };
    const launch = () => {
      const x = w * (0.15 + Math.random() * 0.7);
      rockets.push({ x, y: h + 10, vx: (Math.random() - 0.5) * 1.2, vy: -(9 + Math.random() * 3.5) * (h / 800 + 0.35), ty: h * (0.12 + Math.random() * 0.3), color: pick(colors) });
    };
    const rain = (count: number) => {
      for (let i = 0; i < count; i++) confetti.push({
        x: Math.random() * w, y: -20 - Math.random() * h * 0.6, vx: (Math.random() - 0.5) * 1.5, vy: 1.6 + Math.random() * 2.4,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, color: pick(colors), wob: Math.random() * 10,
      });
    };
    // Canhões de confete saindo dos dois cantos de baixo.
    const cannons = () => {
      for (const side of [0, 1]) for (let i = 0; i < (small ? 40 : 60); i++) {
        const a = (side ? -Math.PI * 0.62 : -Math.PI * 0.38) + (Math.random() - 0.5) * 0.5, sp = 9 + Math.random() * 9;
        confetti.push({ x: side ? w + 5 : -5, y: h * 0.85, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 5, h: 8 + Math.random() * 7, color: pick(colors), wob: Math.random() * 10 });
      }
    };

    cannons();
    rain(small ? 50 : 90);
    const timers = [0, 350, 800, 1300, 1800, 2400, 3000].map((d) => window.setTimeout(launch, d));
    timers.push(window.setTimeout(() => rain(small ? 40 : 70), 1500));

    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      const k = Math.min(2.5, (now - last) / 16.67); // mantém a velocidade igual em telas de 60 ou 120 Hz
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx * k; r.y += r.vy * k; r.vy += 0.12 * k;
        ctx.fillStyle = r.color;
        ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(r.x - r.vx * 2, r.y - r.vy * 2, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        if (r.y <= r.ty || r.vy >= 0) { burst(r.x, r.y, r.color); rockets.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += k; s.x += s.vx * k; s.y += s.vy * k; s.vx *= Math.pow(0.97, k); s.vy = s.vy * Math.pow(0.97, k) + 0.05 * k;
        const a = 1 - s.life / s.max;
        if (a <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = a; ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.6 + a * 0.4), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.vx *= Math.pow(0.985, k); c.vy = Math.min(3.2, c.vy + 0.18 * k); c.wob += 0.1 * k;
        c.x += (c.vx + Math.sin(c.wob) * 0.6) * k; c.y += c.vy * k; c.rot += c.vr * k;
        if (c.y > h + 30) { confetti.splice(i, 1); continue; }
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.fillStyle = c.color; ctx.fillRect(-c.w / 2, (-c.h / 2) * Math.abs(Math.cos(c.wob)), c.w, c.h * Math.abs(Math.cos(c.wob)) + 1);
        ctx.restore();
      }
      if (rockets.length || sparks.length || confetti.length || now - start < 3200) raf = requestAnimationFrame(frame);
    };
    const start = performance.now();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener("resize", resize); };
  }, [accent]);

  return <canvas ref={ref} className="celebration" aria-hidden="true" />;
}
