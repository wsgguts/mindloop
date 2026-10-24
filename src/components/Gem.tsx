export type GemKind = "sudoku" | "zip" | "tango" | "patches";

// Ícones originais dos jogos, recortados da arte da marca (public/gem-*.png).
export default function Gem({ kind, size = 64 }: { kind: GemKind; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/gem-${kind}.png`} width={size} height={size} alt="" aria-hidden="true" style={{ flex: "none", display: "block" }} />;
}
