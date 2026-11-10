import Gem from "./Gem";
import type { Achievement, Rarity } from "../lib/achievements";

// Medalha desenhada em SVG (leve, nítida em qualquer tamanho), nas cores de cada raridade.
// No centro: o cristal do jogo (conquistas por jogo) ou um símbolo da categoria.

const TONES: Record<Rarity, [string, string, string]> = {
  // [claro, escuro, fita]
  bronze: ["#F2B27A", "#A65A23", "#F05BC8"],
  prata: ["#F4F7FB", "#8E9BB0", "#12CFE0"],
  ouro: ["#FFE680", "#D19A00", "#762CEB"],
  diamante: ["#C9FBFF", "#4E6BFF", "#F05BC8"],
};

const GLYPH: Record<Achievement["category"], string> = {
  tempo: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  jornada: "M4 18c3-6 6 2 9-4s4-6 7-8M4 18h0M20 6h0",
  jogo: "",
  constancia: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5zM9 13l2 2 4-4",
  especial: "M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.4 6.6 19.4l1.3-6L3.4 9.3l6-.7z",
};

export default function Medal({ a, size = 64, locked = false }: { a: Achievement; size?: number; locked?: boolean }) {
  const [light, dark, ribbon] = TONES[a.rarity];
  const id = `md-${a.id}`;
  return (
    <span className={`medal${locked ? " locked" : ""} r-${a.rarity}`} style={{ width: size, height: size * 1.18 }} aria-hidden="true">
      <svg viewBox="0 0 64 76" width={size} height={size * 1.18}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
        </defs>
        <path d="M18 2h12l6 22H24zM46 2H34l-6 22h12z" fill={ribbon} opacity=".9" />
        <circle cx="32" cy="46" r="26" fill={`url(#${id})`} stroke="#26104D" strokeWidth="2.5" />
        <circle cx="32" cy="46" r="19" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray={a.rarity === "diamante" ? "3 3" : undefined} />
        {a.category !== "jogo" && (
          <g transform="translate(20 34)" fill="none" stroke="#26104D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={GLYPH[a.category]} />
          </g>
        )}
      </svg>
      {a.category === "jogo" && a.game && <span className="medal-gem"><Gem kind={a.game} size={Math.round(size * 0.5)} /></span>}
      {locked && <span className="medal-lock">🔒</span>}
    </span>
  );
}
