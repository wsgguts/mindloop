import { useId } from "react";

// Astro: estrela de oito pontas verde-esmeralda com o centro aceso em amarelo-claro — a mesma estrela que brilha
// dentro do cristal do jogo (public/gem-astros.webp). Desenho próprio do MindLoop.
// A marca × é uma anotação discreta, nunca confundida com o astro (forma e cor diferentes).
export default function AstroSymbol({ size = 24 }: { size?: number | string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="asym">
      <defs>
        <radialGradient id={`a${id}`} cx=".5" cy=".5" r=".55"><stop offset="0" stopColor="#FFFBD6" /><stop offset=".3" stopColor="#D9FF7A" /><stop offset=".72" stopColor="#3DDC5A" /><stop offset="1" stopColor="#139A44" /></radialGradient>
      </defs>
      {/* Raios diagonais curtos (atrás) e a estrela de quatro pontas longas (na frente). */}
      <path d="M12 12 5.2 5.2 12 9.6 18.8 5.2 14.4 12 18.8 18.8 12 14.4 5.2 18.8 9.6 12z" fill="#7CEB6A" stroke="#0B5A33" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M12 1.2 13.9 10.1 22.8 12 13.9 13.9 12 22.8 10.1 13.9 1.2 12 10.1 10.1z"
        fill={`url(#a${id})`} stroke="#0B5A33" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#FFFDF0" opacity=".95" />
    </svg>
  );
}

export function MarkSymbol({ size = 14 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="amark">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
