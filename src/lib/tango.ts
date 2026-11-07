import { TANGO_RAW } from "./data/tangoLevels";
import { chapterOf } from "./journey";

export * from "./tangoLogic";

export interface TangoPuzzle { id: string; name: string; level: string; raw: string }

// 100 níveis do Tango (gerados por scripts/gen_tango.mjs): 4×4, 6×6 e 8×8.
export const TANGO_PUZZLES: TangoPuzzle[] = TANGO_RAW.map((raw, i) => ({
  id: `t${i + 1}`,
  name: `Nível ${i + 1}`,
  level: chapterOf("tango", i + 1).title,
  raw,
}));
