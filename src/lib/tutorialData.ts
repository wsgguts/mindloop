// Dados dos exemplos usados nos tutoriais animados (puros, sem React).
// tutorialData.test.ts confere cada exemplo com a lógica REAL de cada jogo: o que o tutorial chama de
// jogada certa é aceita pelas regras, e o que ele chama de errada é marcada como erro pelo próprio jogo.

// ---------------- Mini Sudoku (4×4, blocos 2×2) ----------------
/** Solução usada em todos os exemplos do Sudoku. */
export const SUDOKU_SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];
/** Puzzle de demonstração (0 = casa vazia): pistas fixas da partida-exemplo. */
export const SUDOKU_PUZZLE = [
  [1, 0, 3, 4],
  [0, 4, 0, 2],
  [2, 0, 4, 0],
  [4, 3, 0, 1],
];
/** Exemplos de erro: em cada um, `wrong` repete um número só pela regra indicada; `right` é o número certo. */
export const SUDOKU_MISTAKES = {
  linha: { givens: [[0, 0, 1], [0, 2, 3], [0, 3, 4]] as [number, number, number][], cell: [0, 1] as [number, number], wrong: 3, right: 2, clash: [0, 2] as [number, number] },
  coluna: { givens: [[0, 2, 3], [2, 2, 4], [3, 2, 2]] as [number, number, number][], cell: [1, 2] as [number, number], wrong: 4, right: 1, clash: [2, 2] as [number, number] },
  subgrade: { givens: [[2, 0, 2], [3, 0, 4], [3, 1, 3]] as [number, number, number][], cell: [2, 1] as [number, number], wrong: 4, right: 1, clash: [3, 0] as [number, number] },
};
/** Dedução: a casa (1,0) só aceita o 3 — a linha tem 4 e 2, a coluna tem 1 e 2. */
export const SUDOKU_DEDUCTION = {
  givens: [[0, 0, 1], [1, 1, 4], [1, 3, 2], [2, 0, 2]] as [number, number, number][],
  cell: [1, 0] as [number, number],
  byRow: [4, 2], // eliminados olhando a linha
  byCol: [1], // eliminados olhando a coluna (o 2 já saiu pela linha)
  answer: 3,
};

// ---------------- Tango (4×4: 2 Cristais e 2 Orbes por linha/coluna) ----------------
export const C = 1, O = 2; // Cristal, Orbe (mesmos valores do jogo)
export const TANGO_SOLUTION = [
  [C, C, O, O],
  [O, O, C, C],
  [C, O, C, O],
  [O, C, O, C],
];
/** Pistas fixas da partida-exemplo do Tango. */
export const TANGO_GIVENS = [
  [C, 0, 0, O],
  [O, O, 0, 0],
  [0, 0, C, 0],
  [O, 0, 0, C],
];
/** Exemplos de uma linha (4 casas): situação, casa a descobrir, símbolo errado e certo. */
export const TANGO_LINES = {
  par: { row: [C, C, 0, 0], cell: 2, wrong: C, right: O }, // dois iguais lado a lado → a ponta é o outro
  sanduiche: { row: [O, 0, O, 0], cell: 1, wrong: O, right: C }, // vazia entre dois iguais → o outro
  contagem: { row: [C, O, C, 0], cell: 3, wrong: C, right: O }, // já tem 2 Cristais → falta Orbe
};
/** Sinais: "=" iguais, "×" diferentes (entre a casa 0 e a 1 de uma linha de 4). */
export const TANGO_SIGNS = {
  igual: { row: [C, 0, 0, 0], same: true, right: C },
  diferente: { row: [O, 0, 0, 0], same: false, right: C },
};

// ---------------- Zip (4×4) ----------------
/** Números do tabuleiro-exemplo (0 = casa livre). */
export const ZIP_NUMS = [
  [1, 0, 0, 2],
  [3, 0, 0, 0],
  [0, 0, 4, 5],
  [0, 0, 0, 0],
];
/** Caminho completo (solução): do 1 ao 5, passando por todas as 16 casas. */
export const ZIP_PATH: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [1, 1], [1, 0],
  [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [3, 2], [3, 3], [2, 3],
];
/** Tentativa fora de ordem: do 1, indo para baixo, o caminho chega ao 3 antes do 2. */
export const ZIP_WRONG_ORDER: [number, number][] = [[0, 0], [1, 0]];
/** Caminho que se prende: chega ao 5 cedo demais e deixa casas para trás. */
export const ZIP_TRAP: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [2, 3],
];

// ---------------- Patches (4×4) ----------------
export type TutKind = "q" | "v" | "h" | "a";
/** Números [linha, coluna, valor, formato] e a solução [linha, coluna, altura, largura]. */
export const PATCHES_TUT = {
  n: 4,
  clues: [[0, 0, 2, "h"], [1, 3, 4, "q"], [1, 1, 3, "v"], [2, 0, 3, "v"], [3, 3, 4, "a"]] as [number, number, number, TutKind][],
  pieces: [[0, 0, 1, 2], [0, 2, 2, 2], [1, 1, 3, 1], [1, 0, 3, 1], [2, 2, 2, 2]] as [number, number, number, number][],
  colors: ["#F05BC8", "#12CFE0", "#FFD23F", "#9A6BFF", "#4FD6B1"],
  /** Peça errada do exemplo: 1×3 deitada a partir do 2 — tem 3 casas, mas o número pede 2 (erro de tamanho). */
  wrong: [0, 0, 1, 3] as [number, number, number, number],
};
