import { MiniSudoku, type RC, type SudokuP } from "./minis";
import { seq, type Frame, type TutorialStep } from "./Tutorial";
import { SUDOKU_DEDUCTION, SUDOKU_MISTAKES, SUDOKU_PUZZLE, SUDOKU_SOLUTION } from "../../lib/tutorialData";

// Tutorial do Mini Sudoku — regras de src/lib/sudoku.ts: números de 1 a N sem repetir na linha, na coluna
// e no bloco; pistas fixas não mudam; conflitos ganham "!".

const N = 4;
const all = (f: (r: number, c: number) => boolean): RC[] => {
  const out: RC[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (f(r, c)) out.push([r, c]);
  return out;
};
const rowCells = (r: number) => all((a) => a === r);
const colCells = (c: number) => all((_, b) => b === c);
const boxCells = (r: number, c: number) => all((a, b) => Math.floor(a / 2) === Math.floor(r / 2) && Math.floor(b / 2) === Math.floor(c / 2));
const grid = (gs: [number, number, number][]) => { const g = Array.from({ length: N }, () => Array(N).fill(0)); gs.forEach(([r, c, v]) => (g[r][c] = v)); return g; };
const givenOf = (g: number[][]) => g.map((row) => row.map((v) => v !== 0));
const put = (g: number[][], [r, c]: RC, v: number) => g.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x)));
const key = ([r, c]: RC) => `c-${r}-${c}`;
const F = (ms: number, p: SudokuP, say?: string, finger?: string | null, press?: boolean): Frame<SudokuP> => ({ ms, p, say, finger, press });

const puzzleGiven = givenOf(SUDOKU_PUZZLE);
const empties = all((r, c) => SUDOKU_PUZZLE[r][c] === 0);

/** Demonstração de um erro (linha / coluna / bloco) seguida da jogada certa. */
function mistake(kind: keyof typeof SUDOKU_MISTAKES, where: RC[], label: string) {
  const m = SUDOKU_MISTAKES[kind];
  const base = grid(m.givens), given = givenOf(base);
  const wrong = put(base, m.cell, m.wrong), right = put(base, m.cell, m.right);
  return seq(MiniSudoku, [
    F(1300, { vals: base, given, hl: where, pad: true }, `Olhe ${label} destacad${kind === "linha" || kind === "coluna" ? "a" : "o"}.`),
    F(1000, { vals: base, given, hl: where, sel: m.cell, pad: true }, "Escolhemos a casa vazia…", key(m.cell), true),
    F(1000, { vals: base, given, hl: where, sel: m.cell, pad: true, press: m.wrong }, `…e tentamos o ${m.wrong}.`, `pad-${m.wrong}`, true),
    F(2200, { vals: wrong, given, sel: m.cell, bad: [m.cell, m.clash], pad: true }, `“!” — o ${m.wrong} já aparece ${kind === "subgrade" ? "neste bloco" : `nesta ${kind}`}.`, null),
    F(1000, { vals: wrong, given, sel: m.cell, bad: [m.cell, m.clash], pad: true, press: m.right }, `Trocamos pelo ${m.right}…`, `pad-${m.right}`, true),
    F(2200, { vals: right, given, ok: [m.cell], pad: true }, `…e agora não repete nada. ✓`, null),
  ]);
}

export const SUDOKU_STEPS: TutorialStep[] = [
  {
    title: "O objetivo",
    text: <p>Preencha a grade inteira com números de <b>1 a 4</b>, sem repetir nenhum na mesma <b>linha</b>, <b>coluna</b> ou <b>bloco</b>.</p>,
    look: "no fim, cada linha, coluna e bloco tem 1, 2, 3 e 4 — uma vez só.",
    demo: (() => {
      const frames: Frame<SudokuP>[] = [F(1400, { vals: SUDOKU_PUZZLE, given: puzzleGiven }, "Uma grade 4×4 com algumas casas vazias.")];
      let g = SUDOKU_PUZZLE;
      for (const cell of empties) {
        g = put(g, cell, SUDOKU_SOLUTION[cell[0]][cell[1]]);
        frames.push(F(800, { vals: g, given: puzzleGiven, pop: cell }, "Completando as casas vazias…"));
      }
      frames.push(F(3200, { vals: g, given: puzzleGiven, win: true }, "Grade completa: nada se repete!"));
      return seq(MiniSudoku, frames);
    })(),
  },
  {
    title: "O tabuleiro",
    text: <p>A grade 4×4 tem <b>4 linhas</b>, <b>4 colunas</b> e <b>4 blocos</b> de 2×2, separados pelas linhas mais grossas. Mais adiante na jornada vem a grade 6×6: números de 1 a 6 e blocos de 2 linhas × 3 colunas.</p>,
    look: "as linhas grossas que separam os blocos.",
    demo: seq(MiniSudoku, [
      F(1600, { vals: SUDOKU_SOLUTION, given: givenOf(SUDOKU_SOLUTION), hl: rowCells(0) }, "Isto é uma linha (deitada)."),
      F(1600, { vals: SUDOKU_SOLUTION, given: givenOf(SUDOKU_SOLUTION), hl: colCells(0) }, "Isto é uma coluna (em pé)."),
      F(1600, { vals: SUDOKU_SOLUTION, given: givenOf(SUDOKU_SOLUTION), hl: boxCells(0, 0) }, "Isto é um bloco 2×2."),
      F(1600, { vals: SUDOKU_SOLUTION, given: givenOf(SUDOKU_SOLUTION), hl: boxCells(3, 3) }, "São 4 blocos ao todo."),
    ]),
  },
  {
    title: "Pistas e casas vazias",
    text: <p>As casas <b>roxas claras</b> são <b>pistas fixas</b>: já vêm preenchidas e não mudam. As casas <b>brancas</b> são as que você preenche.</p>,
    look: "use as pistas para descobrir os números que faltam.",
    demo: seq(MiniSudoku, [
      F(1800, { vals: SUDOKU_PUZZLE, given: puzzleGiven, hl: all((r, c) => SUDOKU_PUZZLE[r][c] > 0) }, "Pistas fixas: não dá para mudar."),
      F(1800, { vals: SUDOKU_PUZZLE, given: puzzleGiven, hl: empties }, "Casas vazias: é aqui que você joga."),
    ]),
  },
  {
    title: "Como preencher uma casa",
    text: <p><b>1.</b> Toque numa casa vazia (ela fica destacada). <b>2.</b> Toque no número nos botões abaixo da grade. Errou? <b>Apagar</b> limpa a casa, e <b>Desfazer</b> volta a última jogada. No teclado: setas e números.</p>,
    look: "a casa escolhida fica com borda azul.",
    demo: (() => {
      const cell: RC = [0, 1], g2 = put(SUDOKU_PUZZLE, cell, 2);
      return seq(MiniSudoku, [
        F(1200, { vals: SUDOKU_PUZZLE, given: puzzleGiven, pad: true }, "1. Toque numa casa vazia…", key(cell)),
        F(900, { vals: SUDOKU_PUZZLE, given: puzzleGiven, sel: cell, pad: true }, "1. Toque numa casa vazia…", key(cell), true),
        F(1100, { vals: SUDOKU_PUZZLE, given: puzzleGiven, sel: cell, pad: true }, "2. …e escolha o número.", "pad-2"),
        F(700, { vals: SUDOKU_PUZZLE, given: puzzleGiven, sel: cell, pad: true, press: 2 }, "2. …e escolha o número.", "pad-2", true),
        F(1800, { vals: g2, given: puzzleGiven, sel: cell, pop: cell, pad: true }, "O 2 entrou na casa!", null),
        F(900, { vals: g2, given: puzzleGiven, sel: cell, pad: true, press: 0 }, "Apagar limpa a casa selecionada.", "pad-0", true),
        F(1600, { vals: SUDOKU_PUZZLE, given: puzzleGiven, sel: cell, pad: true }, "Apagar limpa a casa selecionada.", null),
      ]);
    })(),
  },
  {
    title: "Não repita na linha",
    text: <p>Cada número aparece <b>uma vez só em cada linha</b>. Se repetir, as casas envolvidas ganham um <b>“!”</b> e uma mensagem explica onde está o problema.</p>,
    look: "o “!” aparece nas duas casas com o mesmo número.",
    demo: mistake("linha", rowCells(SUDOKU_MISTAKES.linha.cell[0]), "a linha"),
  },
  {
    title: "Não repita na coluna",
    text: <p>A mesma regra vale <b>de cima a baixo</b>: cada número aparece <b>uma vez só em cada coluna</b>.</p>,
    look: "o número repetido está na mesma coluna, mesmo longe.",
    demo: mistake("coluna", colCells(SUDOKU_MISTAKES.coluna.cell[1]), "a coluna"),
  },
  {
    title: "Não repita no bloco",
    text: <p>E também dentro de cada <b>bloco</b> (as áreas separadas pelas linhas grossas): cada número <b>uma vez só</b>.</p>,
    look: "o bloco inteiro, não só a linha e a coluna.",
    demo: mistake("subgrade", boxCells(...SUDOKU_MISTAKES.subgrade.cell), "o bloco"),
  },
  {
    title: "Descubra pela lógica",
    text: <p>Para uma casa vazia, pense nos números de 1 a 4 e <b>risque</b> os que já aparecem na linha, na coluna e no bloco dela. <b>Se sobrar um só, é ele!</b> A <b>Dica</b> do jogo aponta casas assim.</p>,
    look: "quais números vão sendo riscados.",
    demo: (() => {
      const d = SUDOKU_DEDUCTION, base = grid(d.givens), given = givenOf(base);
      return seq(MiniSudoku, [
        F(1500, { vals: base, given, sel: d.cell, cands: { out: [] } }, "Que número cabe nesta casa?"),
        F(1900, { vals: base, given, sel: d.cell, hl: rowCells(d.cell[0]), cands: { out: d.byRow } }, `Na linha já tem ${d.byRow.join(" e ")}: risca.`),
        F(1900, { vals: base, given, sel: d.cell, hl: colCells(d.cell[1]), cands: { out: [...d.byRow, ...d.byCol] } }, `Na coluna tem o ${d.byCol.join(" e ")}: risca.`),
        F(1400, { vals: base, given, sel: d.cell, cands: { out: [...d.byRow, ...d.byCol], keep: d.answer } }, `Só sobrou o ${d.answer}!`),
        F(2400, { vals: put(base, d.cell, d.answer), given, ok: [d.cell], pop: d.cell, cands: { out: [...d.byRow, ...d.byCol], keep: d.answer } }, `O ${d.answer} é a única opção. ✓`),
      ]);
    })(),
  },
  {
    title: "Concluindo o desafio",
    text: <p>Quando todas as casas estiverem preenchidas <b>sem nenhum “!”</b>, a grade brilha e o nível é concluído. Seu tempo é salvo e o próximo nível da jornada é liberado. Travou? Use <b>Dica</b>, <b>Desfazer</b> ou <b>Pausar</b>.</p>,
    look: "a grade acende linha por linha, coluna por coluna e bloco por bloco.",
    demo: (() => {
      const cell: RC = [3, 2], almost = put(SUDOKU_SOLUTION, cell, 0);
      return seq(MiniSudoku, [
        F(1300, { vals: almost, given: puzzleGiven, sel: cell, pad: true }, "Falta só uma casa…", key(cell)),
        F(900, { vals: almost, given: puzzleGiven, sel: cell, pad: true, press: 2 }, "Falta só uma casa…", "pad-2", true),
        F(3400, { vals: SUDOKU_SOLUTION, given: puzzleGiven, win: true, pad: true }, "Grade completa! Nível concluído.", null),
      ]);
    })(),
  },
];
