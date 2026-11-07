import { PATCHES_RAW } from "./data/patchesLevels";
import { chapterOf } from "./journey";

export * from "./patchesLogic";

export interface PatchesPuzzle { id: string; name: string; level: string; raw: string }

// 100 níveis do Patches (gerados por scripts/gen_patches.mjs): 5×5 até 9×9.
export const PATCHES_PUZZLES: PatchesPuzzle[] = PATCHES_RAW.map((raw, i) => ({
  id: `p${i + 1}`,
  name: `Nível ${i + 1}`,
  level: chapterOf("patches", i + 1).title,
  raw,
}));

// Exemplo 3×4 mostrado nas regras: números [linha, coluna, valor] e a solução [linha, coluna, altura, largura, cor].
// (patches.test.ts confere que a solução é a única.)
export const PATCHES_EXAMPLE = {
  clues: [[0, 1, 3], [1, 3, 3], [1, 2, 2], [2, 0, 4]] as [number, number, number][],
  pieces: [[0, 0, 1, 3, "#F05BC8"], [0, 3, 3, 1, "#12CFE0"], [1, 2, 2, 1, "#FFD23F"], [1, 0, 2, 2, "#4FD6B1"]] as [number, number, number, number, string][],
};
