import { ASTROS_RAW } from "./data/astrosLevels";
import { chapterOf } from "./journey";

export * from "./astrosLogic";

export interface AstrosPuzzle { id: string; name: string; level: string; raw: string }

// 100 céus do Astros (gerados por scripts/gen_astros.ts): 5×5, 6×6, 7×7, 8×8 e 9×9 (20 de cada).
export const ASTROS_PUZZLES: AstrosPuzzle[] = ASTROS_RAW.map((raw, i) => ({
  id: `a${i + 1}`,
  name: `Nível ${i + 1}`,
  level: chapterOf("astros", i + 1).title,
  raw,
}));

/** Cores das constelações (claras, para o astro dourado contrastar; a borda grossa separa as regiões). */
export const SKY_COLORS = ["#FFD9F2", "#C9F4FA", "#FFE9B8", "#E2D6FF", "#CFF5E4", "#FFD6CC", "#D7E6FF", "#F4F0C2", "#F0D3FF"];
/** Nome de cada constelação (para leitores de tela e mensagens). */
export const SKY_NAMES = ["Rosa", "Turquesa", "Âmbar", "Lilás", "Menta", "Coral", "Celeste", "Areia", "Orquídea"];
