import { useId } from "react";

// Astro: estrela dourada de quatro pontas com brilho (desenho próprio do MindLoop).
// A marca × é uma anotação discreta, nunca confundida com o astro (forma e cor diferentes).
export default function AstroSymbol({ size = 24 }: { size?: number | string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="asym">
      <defs>
        <radialGradient id={`a${id}`} cx=".42" cy=".38" r=".7"><stop offset="0" stopColor="#FFF8D6" /><stop offset=".45" stopColor="#FFC93C" /><stop offset="1" stopColor="#E08A00" /></radialGradient>
      </defs>
      <path d="M12 1.5c.9 5 2.6 7.6 9.5 9.3v2.4c-6.9 1.7-8.6 4.3-9.5 9.3h-.1C11 17.5 9.3 14.9 2.5 13.2v-2.4C9.3 9.1 11 6.5 11.9 1.5z"
        fill={`url(#a${id})`} stroke="#9A5A00" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" fill="#FFFDF2" opacity=".9" />
      <circle cx="18.6" cy="4.8" r="1.2" fill="#FFE58A" />
      <circle cx="5.2" cy="19.4" r=".9" fill="#FFE58A" opacity=".8" />
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

/** Cristal do jogo (ícone usado no Início, na jornada e no cabeçalho), desenhado em vetor. */
export function AstrosGem({ size = 64 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ flex: "none", display: "block" }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4B2A96" /><stop offset="1" stopColor="#1B0B3D" /></linearGradient>
        <radialGradient id={`s${id}`} cx=".45" cy=".4" r=".7"><stop offset="0" stopColor="#FFF8D6" /><stop offset=".5" stopColor="#FFC93C" /><stop offset="1" stopColor="#E08A00" /></radialGradient>
      </defs>
      <path d="M32 3 57 17v30L32 61 7 47V17z" fill={`url(#g${id})`} stroke="#FFC93C" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 3 57 17 32 31 7 17z" fill="#fff" opacity=".1" />
      <path d="M32 14c1.4 7.8 4 11.8 14.8 14.5v3.9C36 35.1 33.4 39.1 32 47h-.1c-1.4-7.9-4-11.9-14.7-14.6v-3.9C28 25.8 30.6 21.8 31.9 14z" fill={`url(#s${id})`} stroke="#9A5A00" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="46" cy="15" r="2" fill="#FFE58A" />
      <circle cx="17" cy="44" r="1.5" fill="#F05BC8" />
      <circle cx="47" cy="45" r="1.3" fill="#12CFE0" />
    </svg>
  );
}
