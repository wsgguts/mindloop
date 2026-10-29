// Jornada de níveis: 100 níveis por jogo, em 10 capítulos de 10 níveis.
// Funções simples e puras (fáceis de testar). O progresso é uma string de 100 caracteres ("0" ou "1").

export type JourneyGame = "sudoku" | "zip";
export const LEVELS_PER_GAME = 100;
export const LEVELS_PER_CHAPTER = 10;

export interface Chapter { id: number; title: string; text: string; from: number; to: number }

const make = (list: [string, string][]): Chapter[] =>
  list.map(([title, text], i) => ({ id: i + 1, title, text, from: i * 10 + 1, to: i * 10 + 10 }));

export const CHAPTERS: Record<JourneyGame, Chapter[]> = {
  sudoku: make([
    ["Primeiros passos", "Grade 4×4 com muitas pistas: aprenda a regra jogando."],
    ["Aquecimento", "Ainda 4×4, mas com menos pistas para te ajudar."],
    ["Novo tabuleiro", "Chega a grade 6×6, com blocos de 2 linhas × 3 colunas."],
    ["Olhar nos blocos", "Linha, coluna e bloco ao mesmo tempo."],
    ["Olhar atento", "Menos pistas: procure o número que só cabe num lugar."],
    ["Pistas escondidas", "Algumas casas só se resolvem depois de outras."],
    ["Menos é mais", "Poucas pistas e muito raciocínio."],
    ["Raciocínio fino", "Cada jogada precisa de planejamento."],
    ["Quase mestre", "Desafios longos, com muita atenção aos detalhes."],
    ["Mestre da lógica", "Os tabuleiros mais difíceis da jornada."],
  ]),
  zip: make([
    ["Primeira trilha", "Grade 4×4 com muitos pontos numerados."],
    ["Cinco por cinco", "A grade cresce: mais casas para percorrer."],
    ["Rotas abertas", "Menos pontos: você decide mais do caminho."],
    ["Mapa maior", "Grade 6×6, com bastante apoio dos pontos."],
    ["Curvas e voltas", "Planeje as curvas para não se prender."],
    ["Caminhos livres", "Poucos pontos e muitas escolhas."],
    ["Grade 7×7", "O maior tabuleiro da jornada."],
    ["Planejando à frente", "Pense várias casas adiante."],
    ["Poucos pontos", "Quase nenhuma pista: confie no raciocínio."],
    ["Mestre dos caminhos", "Os percursos mais difíceis."],
  ]),
};

export const chapterOf = (game: JourneyGame, level: number): Chapter =>
  CHAPTERS[game][Math.min(CHAPTERS[game].length, Math.ceil(level / LEVELS_PER_CHAPTER)) - 1];

// ---- Progresso ----
export const emptyProgress = (): string => "0".repeat(LEVELS_PER_GAME);

/** Lê o progresso salvo; se estiver ausente ou corrompido, volta ao início. */
export function parseProgress(raw: string | null): string {
  return raw && /^[01]{100}$/.test(raw) ? raw : emptyProgress();
}
export const isDone = (p: string, level: number): boolean => p[level - 1] === "1";
/** O nível 1 está sempre liberado; os demais, só depois de concluir o anterior. */
export const isUnlocked = (p: string, level: number): boolean => level === 1 || isDone(p, level - 1);
export const doneCount = (p: string): number => [...p].filter((c) => c === "1").length;
/** Próximo nível a jogar: o primeiro não concluído (ou o último, se tudo foi concluído). */
export function currentLevel(p: string): number {
  const i = p.indexOf("0");
  return i === -1 ? LEVELS_PER_GAME : i + 1;
}
export function markDone(p: string, level: number): string {
  return p.slice(0, level - 1) + "1" + p.slice(level);
}
export const chapterDone = (p: string, ch: Chapter): number =>
  [...p.slice(ch.from - 1, ch.to)].filter((c) => c === "1").length;
