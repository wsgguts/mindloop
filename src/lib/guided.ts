// Partida guiada (item 3 do teste com alunos) — o que já foi visto e quando mostrar. Sem React.
//
// Antes havia um tutorial passo a passo ("Passo 1 de 9") e os alunos tentavam jogar dentro dele. Agora o
// personagem do jogo conduz uma partida de verdade num tabuleiro pequeno (components/guided).
//  • "base": a partida guiada completa — na primeira vez que a pessoa abre o jogo.
//  • "c3", "c8"…: versão curta quando a jornada chega a um capítulo que muda o tamanho ou a regra.
// Fica salvo no aparelho, por jogo: mindloop:guided:<jogo> = {"base":1,"c3":1,...}.

import { type JourneyGame, LEVELS_PER_CHAPTER } from "./journey";

export const GUIDED_KEY = (g: JourneyGame) => `mindloop:guided:${g}`;
/** Chave do tutorial antigo (mantida): quem já viu ou pulou o tutorial não é obrigado a ver a partida guiada. */
export const LEGACY_TUTORIAL_KEY = (g: JourneyGame) => `mindloop:tutorial:${g}`;

export type GuidedPart = "base" | `c${number}`;

/** Capítulos em que algo muda (tamanho ou regra) e ganham a versão curta. */
export const CHANGES: Record<JourneyGame, number[]> = {
  sudoku: [3], // 6×6 com blocos 2×3
  tango: [2, 3, 8], // sinais = e ×; 6×6 (nunca 3 iguais seguidos); 8×8
  zip: [2, 4, 7], // 5×5, 6×6, 7×7
  patches: [3, 5, 7, 9], // 6×6, 7×7, 8×8, 9×9
  astros: [3, 5, 7, 9], // 6×6, 7×7, 8×8, 9×9
};

/** Lê o que já foi visto. O tutorial antigo concluído ou pulado conta como a partida guiada completa. */
export function parseGuided(raw: string | null, legacy: string | null): Set<GuidedPart> {
  const seen = new Set<GuidedPart>();
  try {
    const o = raw ? JSON.parse(raw) : null;
    if (o && typeof o === "object") for (const k of Object.keys(o)) if (k === "base" || /^c\d+$/.test(k)) seen.add(k as GuidedPart);
  } catch { /* valor estragado: começa vazio */ }
  if (legacy) seen.add("base");
  return seen;
}
export const serializeGuided = (s: Set<GuidedPart>) => JSON.stringify(Object.fromEntries([...s].map((k) => [k, 1])));

/**
 * Qual partida guiada mostrar ao começar um nível (ou null):
 *  • a completa, se a pessoa nunca viu nenhuma deste jogo;
 *  • a curta, no PRIMEIRO nível de um capítulo que muda algo, se ainda não viu essa e o nível ainda não foi
 *    concluído (quem já passou dali antes desta versão não é interrompido).
 */
export function guidedFor(game: JourneyGame, level: number, seen: Set<GuidedPart>, levelDone: boolean): GuidedPart | null {
  if (!seen.has("base")) return "base";
  const ch = Math.ceil(level / LEVELS_PER_CHAPTER);
  const part = `c${ch}` as GuidedPart;
  if (!levelDone && level === (ch - 1) * LEVELS_PER_CHAPTER + 1 && CHANGES[game].includes(ch) && !seen.has(part)) return part;
  return null;
}
