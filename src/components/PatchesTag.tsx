import type { Kind } from "../lib/patches";

// Etiqueta do número no Patches: o FORMATO da etiqueta mostra o formato da peça.
//   quadrada → peça quadrada · alta → peça em pé · larga → peça deitada ·
//   quadrado com uma faixa deitada e uma em pé cruzando atrás → qualquer formato (livre).
// A cor é a mesma da peça daquele número.

export const KIND_NAME: Record<Kind, string> = { q: "quadrada", v: "em pé", h: "deitada", a: "de qualquer formato" };
export const KIND_HELP: Record<Kind, string> = {
  q: "a peça é um quadrado",
  v: "a peça é mais alta que larga",
  h: "a peça é mais larga que alta",
  a: "a peça pode ter qualquer formato: deitada, em pé ou quadrada",
};

const INK = "#26104D";
const lum = (hex: string) => {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
/** Texto escuro ou branco: o que tiver mais contraste com a cor da etiqueta. */
export const textOn = (hex: string) => (contrast(lum(hex), lum(INK)) >= contrast(lum(hex), 1) ? INK : "#FFFFFF");

interface Props { v: number | string; kind: Kind; color: string }

export default function PatchesTag({ v, kind, color }: Props) {
  return (
    <span className={`ptag k-${kind}`} style={{ "--tc": color, "--tt": textOn(color) } as React.CSSProperties}>
      <b>{v}</b>
    </span>
  );
}
