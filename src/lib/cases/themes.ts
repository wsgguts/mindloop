// Mindloop Investigação — a regra de cenário de cada jogo, o narrador e o registro das histórias.
// Toda investigação pergunta a mesma coisa (onde cada um estava e o que tinha nas mãos), mas cada jogo leva a
// sua lógica para o lugar:
//   Mini Sudoku → "regioes"    : uma pessoa por linha, por coluna e por cômodo;
//   Tango       → "equilibrio" : dois lados, uma pessoa por coluna, metade de cada lado;
//   Zip         → "trilha"     : uma trilha numerada; cada pessoa numa parada (antes, depois, logo depois);
//   Patches     → "comodos"    : exatamente uma pessoa em cada cômodo;
//   Astros      → "ceu"        : uma pessoa por linha, coluna e região, sem ninguém se encostar (como os astros).

import type { JourneyGame } from "../journey";
import type { Rule } from "./model";
import type { Story } from "./story";
import { ASTROS_STORIES } from "./stories/astros";
import { PATCHES_STORIES } from "./stories/patches";
import { SUDOKU_STORIES } from "./stories/sudoku";
import { TANGO_STORIES } from "./stories/tango";
import { ZIP_STORIES } from "./stories/zip";

export const RULE_OF: Record<JourneyGame, Rule> = { sudoku: "regioes", tango: "equilibrio", zip: "trilha", patches: "comodos", astros: "ceu" };
export const KIND_NAME: Record<Rule, string> = {
  regioes: "Investigação de regiões", equilibrio: "Investigação de equilíbrio", trilha: "Investigação de trilha",
  comodos: "Investigação de cômodos", ceu: "Investigação do céu",
};

/** O narrador de cada jogo (conta a história no balão). */
/** Narrador de cada jogo (também é um avatar do elenco: img é o retrato). */
export const NARRATOR: Record<JourneyGame, { name: string; icon: string; img: string }> = {
  sudoku: { name: "Bit, o robô arquivista", icon: "🤖", img: "/cast/bit.webp" },
  tango: { name: "Dona Coruja", icon: "🦉", img: "/cast/coruja.webp" },
  zip: { name: "Guaxi, o guaxinim batedor", icon: "🦝", img: "/cast/guaxi.webp" },
  patches: { name: "Raposa Remendo", icon: "🦊", img: "/cast/remendo.webp" },
  astros: { name: "Lumen, a estrela-guia", icon: "✨", img: "/cast/lumen.webp" },
};

/** Histórias de cada jogo, na ordem da jornada (a história i é a do capítulo i + 1). */
export const STORIES: Record<JourneyGame, Story[]> = { sudoku: SUDOKU_STORIES, tango: TANGO_STORIES, zip: ZIP_STORIES, patches: PATCHES_STORIES, astros: ASTROS_STORIES };
const BY_KEY = new Map(Object.values(STORIES).flat().map((s) => [s.key, s]));
export const storyByKey = (key: string): Story | undefined => BY_KEY.get(key);

/** Lembrete do jeito de pensar de cada regra (quando a estrutura do caso não traz uma dica própria). */
export const GENERAL_HINT: Record<Rule, string> = {
  regioes: "Cada linha, cada coluna e cada cômodo tem uma pessoa só. Marque ✓ no quadro e risque o resto da fileira e da coluna da grade.",
  equilibrio: "Uma pessoa por coluna e metade de cada lado (Cristal e Orbe). Quando um lado enche, todos os que faltam estão do outro.",
  trilha: "Cada pessoa está numa parada diferente da trilha. Marque na grade Parada o que cada pista diz — “depois da 4ª parada” risca da 1ª à 4ª.",
  comodos: "Cada cômodo tem uma pessoa só. O número no canto é o tamanho do cômodo: pistas de tamanho apontam os cômodos daquele tamanho.",
  ceu: "Uma pessoa por linha, coluna e região. Marque ✓ no quadro e risque o resto da fileira e da coluna da grade.",
};
