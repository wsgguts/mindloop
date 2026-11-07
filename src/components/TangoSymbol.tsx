import { useId } from "react";
import { CRISTAL } from "../lib/tango";

export const SYMBOL_NAME = (v: number) => (v === CRISTAL ? "Cristal" : "Orbe");
export const SYMBOL_PLURAL = (v: number) => (v === CRISTAL ? "Cristais" : "Orbes");

// Os dois símbolos do Tango: Cristal âmbar (hexágono) e Orbe violeta (círculo).
// Formas diferentes, não só cores, para quem não distingue bem as cores.
export default function TangoSymbol({ v, size = 24 }: { v: number; size?: number | string }) {
  const id = useId().replace(/:/g, "");
  return v === CRISTAL ? (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="tsym is-c">
      <defs><linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE08A" /><stop offset=".55" stopColor="#FFB020" /><stop offset="1" stopColor="#D9780A" /></linearGradient></defs>
      <polygon points="12,1.5 21.5,7 21.5,17 12,22.5 2.5,17 2.5,7" fill={`url(#c${id})`} stroke="#A2560A" strokeWidth="1.3" strokeLinejoin="round" />
      <polygon points="12,1.5 21.5,7 12,10 2.5,7" fill="#FFF3C9" opacity=".75" />
      <polyline points="12,10 12,22.5" stroke="#A2560A" strokeWidth=".8" opacity=".5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="tsym is-o">
      <defs><radialGradient id={`o${id}`} cx=".38" cy=".34" r=".7"><stop offset="0" stopColor="#D9C2FF" /><stop offset=".45" stopColor="#8E52F5" /><stop offset="1" stopColor="#4A16A8" /></radialGradient></defs>
      <circle cx="12" cy="12" r="10" fill={`url(#o${id})`} stroke="#33107A" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="5.2" fill="none" stroke="#F3EAFF" strokeWidth="1.2" opacity=".55" />
      <circle cx="8.6" cy="8.2" r="2" fill="#fff" opacity=".7" />
    </svg>
  );
}
