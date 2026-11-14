import { AstrosGem } from "./AstroSymbol";

export type GemKind = "sudoku" | "zip" | "tango" | "patches" | "astros";

// Ícones originais dos jogos, recortados da arte da marca (public/gem-*.webp; originais em gem-*.png).
// O Astros (jogo bônus) tem o cristal desenhado em vetor.
export default function Gem({ kind, size = 64 }: { kind: GemKind; size?: number }) {
  if (kind === "astros") return <AstrosGem size={size} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/gem-${kind}.webp`} width={size} height={size} alt="" aria-hidden="true" style={{ flex: "none", display: "block" }} />;
}
