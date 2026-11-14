import type { JourneyGame } from "../../lib/journey";
import type { TutorialStep } from "./Tutorial";
import { PATCHES_STEPS } from "./patchesSteps";
import { SUDOKU_STEPS } from "./sudokuSteps";
import { TANGO_STEPS } from "./tangoSteps";
import { ZIP_STEPS } from "./zipSteps";
import { ASTROS_STEPS } from "./astrosSteps";

// Registro dos tutoriais: para um jogo novo, basta criar os passos dele e incluí-los aqui.
export const TUTORIALS: Record<JourneyGame, TutorialStep[]> = {
  sudoku: SUDOKU_STEPS,
  zip: ZIP_STEPS,
  tango: TANGO_STEPS,
  patches: PATCHES_STEPS,
  astros: ASTROS_STEPS,
};
export { default as Tutorial } from "./Tutorial";
