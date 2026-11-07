// Jornada de níveis: 100 níveis por jogo, em 10 capítulos de 10 níveis.
// Funções simples e puras (fáceis de testar). O progresso é uma string de 100 caracteres ("0" ou "1").

export type JourneyGame = "sudoku" | "zip" | "tango" | "patches";
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
  tango: make([
    ["Primeiros símbolos", "Grade 4×4 com metade das casas já preenchidas."],
    ["Sinais no caminho", "Ainda 4×4, agora com poucas pistas e os sinais = e ×."],
    ["Grade maior", "Chega a grade 6×6, com bastante apoio."],
    ["Pares e sanduíches", "Menos pistas: procure pares e casas entre iguais."],
    ["Contando símbolos", "Linhas pela metade revelam o resto."],
    ["Pistas raras", "O mínimo de pistas: cada sinal conta."],
    ["E se…?", "Teste hipóteses: um símbolo errado gera contradição."],
    ["Grade 8×8", "O maior tabuleiro da jornada, com bastante apoio."],
    ["Olhar de mestre", "8×8 com poucas pistas."],
    ["Mestre do equilíbrio", "Os desafios mais difíceis do Tango."],
  ]),
  patches: make([
    ["Primeiras peças", "Grade 5×5 com peças pequenas: aprenda o encaixe jogando."],
    ["Encaixe certo", "Ainda 5×5, agora com peças de até 8 casas."],
    ["Grade 6×6", "Mais espaço e mais formatos possíveis."],
    ["Peças maiores", "Números grandes pedem atenção aos formatos."],
    ["Cantos e bordas", "Grade 7×7: comece pelos cantos, onde há menos saídas."],
    ["Só um lugar", "Procure casas que só um número consegue alcançar."],
    ["Grade 8×8", "Tabuleiro grande, com peças de até 12 casas."],
    ["Casas reservadas", "Quando todo encaixe de um número usa a mesma casa, ela é dele."],
    ["Grade 9×9", "O maior tabuleiro da jornada."],
    ["Mestre do encaixe", "Os desafios mais difíceis do Patches."],
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
/** Marca o nível como concluído. Repetir um nível já concluído não muda nada (o histórico nunca se perde). */
export function markDone(p: string, level: number): string {
  return p.slice(0, level - 1) + "1" + p.slice(level);
}
/** Jornada inteira concluída: a partir daí todos os níveis ficam livres para repetir. */
export const isComplete = (p: string): boolean => !p.includes("0");

/**
 * Nível que a trilha deve destacar (e para onde ela rola) ao abrir a jornada.
 * - Jornada em andamento: o próximo nível a jogar (ex.: concluiu o 15 → destaca o 16).
 *   Repetir um nível antigo também devolve a pessoa ao ponto em que parou.
 * - Jornada completa: o último nível jogado (ex.: repetiu o 25 → volta ao 25, nunca salta para o 100).
 */
export function focusLevel(p: string, lastPlayed?: number | null): number {
  if (isComplete(p) && lastPlayed && Number.isInteger(lastPlayed) && lastPlayed >= 1 && lastPlayed <= LEVELS_PER_GAME) return lastPlayed;
  return currentLevel(p);
}
/** Lê o último nível jogado salvo (ou null). */
export function parseLevel(raw: string | null): number | null {
  const n = Number(raw);
  return raw && Number.isInteger(n) && n >= 1 && n <= LEVELS_PER_GAME ? n : null;
}
export const chapterDone = (p: string, ch: Chapter): number =>
  [...p.slice(ch.from - 1, ch.to)].filter((c) => c === "1").length;
