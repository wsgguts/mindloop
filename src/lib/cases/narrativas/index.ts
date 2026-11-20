// As narrativas de todas as investigações (uma por caso, pelo id). Formato e regras em ../narrative.ts.
import type { Narrative } from "../narrative";
import { ASTROS_NARRATIVES } from "./astros";
import { PATCHES_NARRATIVES } from "./patches";
import { SUDOKU_NARRATIVES } from "./sudoku";
import { TANGO_NARRATIVES } from "./tango";
import { ZIP_NARRATIVES } from "./zip";

export const NARRATIVES: Record<string, Narrative> = { ...SUDOKU_NARRATIVES, ...TANGO_NARRATIVES, ...ZIP_NARRATIVES, ...PATCHES_NARRATIVES, ...ASTROS_NARRATIVES };
