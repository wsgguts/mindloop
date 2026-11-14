// Mindloop Investigação — tipo de mistério de cada jogo e o registro das histórias.
// Cada jogo tem o próprio tipo de mistério, ligado à sua mecânica:
//   Mini Sudoku → "code"    : cada personagem/objeto recebe um número diferente (andar, dia, gotas, vagão…).
//   Tango       → "pattern" : uma fileira em equilíbrio entre dois valores (metade de cada, nunca três iguais seguidos).
//   Zip         → "route"   : a ordem de um percurso que passa uma vez por cada lugar, seguindo as ligações do mapa.
//   Patches     → "layout"  : onde cada elemento fica numa grade.
//   Astros      → "layout"  : também espacial (jogo bônus), com histórias próprias.
// As histórias (uma por caso, todas diferentes) ficam em stories/*.ts.

import type { JourneyGame } from "../journey";
import type { CaseKind } from "./model";
import type { Story } from "./story";
import { PATCHES_STORIES } from "./stories/patches";
import { SUDOKU_STORIES } from "./stories/sudoku";
import { TANGO_STORIES } from "./stories/tango";
import { ZIP_STORIES } from "./stories/zip";
import { ASTROS_STORIES } from "./stories/astros";

export const KIND_OF: Record<JourneyGame, CaseKind> = { sudoku: "code", tango: "pattern", zip: "route", patches: "layout", astros: "layout" };
export const KIND_NAME: Record<CaseKind, string> = {
  code: "Investigação numérica", pattern: "Investigação de padrões", route: "Investigação de caminhos", layout: "Investigação espacial",
};

/** Histórias de cada jogo, na ordem da jornada (a história i é a do i-ésimo caso do jogo). */
export const STORIES: Record<JourneyGame, Story[]> = { sudoku: SUDOKU_STORIES, tango: TANGO_STORIES, zip: ZIP_STORIES, patches: PATCHES_STORIES, astros: ASTROS_STORIES };
const BY_KEY = new Map(Object.values(STORIES).flat().map((s) => [s.key, s]));
export const storyByKey = (key: string): Story | undefined => BY_KEY.get(key);

/** Lembrete das regras de cada tipo (usado quando a estrutura do caso não traz uma dica própria). */
export const GENERAL_HINT: Record<CaseKind, string> = {
  code: "Comece pelas pistas que falam de um só item: elas eliminam opções na hora. Depois, use as comparações (maior, menor, soma) para cortar o que sobrou. Lembre: nenhum número se repete.",
  pattern: "Lembre das duas regras: metade de cada valor e nunca três iguais seguidos. Comece por quem já tem valor definido e espalhe a informação pelas pistas de “igual” e “diferente”.",
  route: "O caminho só segue as ligações do mapa. Lugares com uma única ligação só podem estar no começo ou no fim. Use as pistas de “antes” e “logo depois” para ir encaixando a ordem.",
  layout: "Comece pelas pistas de linha e de coluna: elas reduzem muito as casas possíveis de cada elemento. Depois use “vizinhos”, “à esquerda” e “acima” — e lembre que cada casa guarda no máximo um.",
};
