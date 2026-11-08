import { MiniTango, type RC, type TangoP } from "./minis";
import { seq, type Frame, type TutorialStep } from "./Tutorial";
import TangoSymbol from "../TangoSymbol";
import { C, O, TANGO_GIVENS, TANGO_LINES, TANGO_SIGNS, TANGO_SOLUTION } from "../../lib/tutorialData";
import { cloneT, nextDeduction, type Deduction } from "../../lib/tangoLogic";

// Tutorial do Tango — regras de src/lib/tangoLogic.ts: nunca três iguais seguidos; cada linha e coluna com
// metade de cada símbolo; "=" iguais e "×" diferentes. Tocar numa casa: vazia → Cristal → Orbe → vazia.

const F = (ms: number, p: TangoP, say?: string, finger?: string | null, press?: boolean): Frame<TangoP> => ({ ms, p, say, finger, press });
const givenOf = (g: number[][]) => g.map((row) => row.map((v) => v !== 0));
const put = (g: number[][], [r, c]: RC, v: number) => g.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x)));
const key = ([r, c]: RC) => `c-${r}-${c}`;
const NAME = (v: number) => (v === C ? "Cristal" : "Orbe");
const PLURAL = (v: number) => (v === C ? "Cristais" : "Orbes");
const S = ({ v }: { v: number }) => <TangoSymbol v={v} size={18} />;

/** Exemplo de uma linha: tenta o símbolo errado (erro “!”) e depois o certo. */
function lineDemo(ex: { row: number[]; cell: number; wrong: number; right: number }, look: RC[], why: string, wrongSay: string, extra?: Partial<TangoP>) {
  const g = [ex.row], cell: RC = [0, ex.cell];
  const wrong = put(g, cell, ex.wrong), right = put(g, cell, ex.right);
  const badCells: RC[] = ex.row.map((v, c) => [0, c] as RC).filter(([, c]) => (c === ex.cell ? ex.wrong : ex.row[c]) === ex.wrong);
  return seq(MiniTango, [
    F(1600, { grid: g, hl: look, ...extra }, why),
    F(1100, { grid: g, sel: cell, ...extra }, `E se fosse ${NAME(ex.wrong)}?`, key(cell), true),
    F(2300, { grid: wrong, sel: cell, bad: extra?.count ? badCells : badCells.filter(([, c]) => Math.abs(c - ex.cell) <= 2), ...extra }, wrongSay, null),
    F(1000, { grid: wrong, sel: cell, ...extra }, `Então é ${NAME(ex.right)}!`, key(cell), true),
    F(2300, { grid: right, ok: [cell], ...extra }, `${NAME(ex.right)} ✓ — sem quebrar regra.`, null),
  ]);
}

/** Primeiras deduções reais do motor do jogo (as mesmas usadas pela Dica). */
function deductions(max: number): { d: Deduction; before: number[][] }[] {
  let g = cloneT(TANGO_GIVENS);
  const out: { d: Deduction; before: number[][] }[] = [];
  for (let k = 0; k < max; k++) {
    const d = nextDeduction(g, [], false);
    if (!d) break;
    out.push({ d, before: g });
    g = put(g, [d.r, d.c], d.v);
  }
  return out;
}
const WHY: Record<string, (d: Deduction) => string> = {
  par: (d) => `Par de ${PLURAL(d.v === C ? O : C)} ao lado → a ponta é ${NAME(d.v)}.`,
  sanduiche: (d) => `Entre dois ${PLURAL(d.v === C ? O : C)} → ${NAME(d.v)}.`,
  contagem: (d) => `A ${d.line?.kind} já tem 2 ${PLURAL(d.v === C ? O : C)} → ${NAME(d.v)}.`,
  sinal: (d) => `O sinal decide → ${NAME(d.v)}.`,
  hipotese: (d) => `Testando hipóteses → ${NAME(d.v)}.`,
};

const givens = givenOf(TANGO_GIVENS);

export const TANGO_STEPS: TutorialStep[] = [
  {
    title: "O objetivo",
    text: <p>Preencha todas as casas com <b>Cristais</b> <S v={C} /> e <b>Orbes</b> <S v={O} /> seguindo três regras simples. Cada nível tem uma única solução e se resolve só com lógica, sem chute.</p>,
    look: "como a grade fica equilibrada no final.",
    demo: (() => {
      const frames: Frame<TangoP>[] = [F(1400, { grid: TANGO_GIVENS, given: givens }, "Uma grade 4×4 com algumas pistas.")];
      let g = TANGO_GIVENS;
      TANGO_SOLUTION.forEach((row, r) => row.forEach((v, c) => {
        if (TANGO_GIVENS[r][c]) return;
        g = put(g, [r, c], v);
        frames.push(F(650, { grid: g, given: givens }, "Completando…"));
      }));
      frames.push(F(3000, { grid: g, given: givens, win: true }, "Grade equilibrada!"));
      return seq(MiniTango, frames);
    })(),
  },
  {
    title: "Símbolos e pistas",
    text: <p>Existem dois símbolos: o <b>Cristal</b> <S v={C} /> (âmbar) e o <b>Orbe</b> <S v={O} /> (violeta). As casas de <b>fundo mais escuro</b> são <b>pistas fixas</b> e não mudam.</p>,
    look: "as casas escuras já vêm resolvidas.",
    demo: seq(MiniTango, [
      F(1600, { grid: TANGO_SOLUTION, hl: [[0, 0], [0, 1]] }, "Estes são Cristais."),
      F(1600, { grid: TANGO_SOLUTION, hl: [[0, 2], [0, 3]] }, "Estes são Orbes."),
      F(1900, { grid: TANGO_GIVENS, given: givens, hl: givens.flatMap((row, r) => row.map((g, c) => (g ? [r, c] as RC : null))).filter(Boolean) as RC[] }, "Pistas fixas: o ponto de partida."),
    ]),
  },
  {
    title: "Como preencher",
    text: <p><b>Toque numa casa</b> para trocar: vazia → <b>Cristal</b> → <b>Orbe</b> → vazia. Ou selecione a casa e use os botões <b>Cristal</b>, <b>Orbe</b> e <b>Apagar</b>. No teclado: 1 = Cristal, 2 = Orbe.</p>,
    look: "cada toque troca o símbolo da mesma casa.",
    demo: (() => {
      const cell: RC = [0, 1];
      return seq(MiniTango, [
        F(1100, { grid: TANGO_GIVENS, given: givens, pad: true }, "Toque numa casa vazia…", key(cell)),
        F(1300, { grid: put(TANGO_GIVENS, cell, C), given: givens, sel: cell, pad: true }, "1 toque: Cristal.", key(cell), true),
        F(1300, { grid: put(TANGO_GIVENS, cell, O), given: givens, sel: cell, pad: true }, "2 toques: Orbe.", key(cell), true),
        F(1300, { grid: TANGO_GIVENS, given: givens, sel: cell, pad: true }, "3 toques: vazia de novo.", key(cell), true),
        F(1000, { grid: TANGO_GIVENS, given: givens, sel: cell, pad: true, press: "c" }, "Ou use os botões abaixo.", "pad-c", true),
        F(1800, { grid: put(TANGO_GIVENS, cell, C), given: givens, sel: cell, pad: true }, "Ou use os botões abaixo.", null),
      ]);
    })(),
  },
  {
    title: "Nada de três iguais",
    text: <p>Numa linha ou coluna, <b>no máximo dois símbolos iguais</b> podem ficar lado a lado. Por isso, quando há um <b>par</b>, as casas nas pontas dele são do <b>outro símbolo</b>.</p>,
    look: "o par de Cristais e a casa logo depois dele.",
    demo: lineDemo(TANGO_LINES.par, [[0, 0], [0, 1]], "Dois Cristais lado a lado…", "Três Cristais seguidos: “!” — não pode."),
  },
  {
    title: "O sanduíche",
    text: <p>Uma casa vazia <b>entre dois símbolos iguais</b> tem que ser do <b>outro</b> — senão seriam três iguais seguidos.</p>,
    look: "a casa no meio dos dois Orbes.",
    demo: lineDemo(TANGO_LINES.sanduiche, [[0, 0], [0, 2]], "Um Orbe, uma vazia, outro Orbe…", "Três Orbes seguidos: “!”."),
  },
  {
    title: "Equilíbrio",
    text: <p>Cada linha e cada coluna tem a <b>mesma quantidade</b> de cada símbolo: <b>2 e 2</b> na grade 4×4, 3 e 3 na 6×6 e 4 e 4 na 8×8. Se uma linha já tem a metade de um símbolo, <b>todas as vazias</b> dela são do outro.</p>,
    look: "a contagem embaixo da linha.",
    demo: lineDemo(TANGO_LINES.contagem, [[0, 0], [0, 2]], "Esta linha já tem 2 Cristais…", "3 Cristais: passou de 2 — “!”.", { count: true }),
  },
  {
    title: "Sinais = e ×",
    text: <p>Alguns pares de casas vizinhas têm um sinal entre elas: <b>“=”</b> quer dizer <b>símbolos iguais</b>; <b>“×”</b> quer dizer <b>símbolos diferentes</b>.</p>,
    look: "o sinal entre as duas casas.",
    demo: (() => {
      const g = [[...TANGO_SIGNS.igual.row], [...TANGO_SIGNS.diferente.row]];
      const signs = [{ r: 0, c: 0, dir: "h" as const, same: true }, { r: 1, c: 0, dir: "h" as const, same: false }];
      const g1 = put(g, [0, 1], TANGO_SIGNS.igual.right), g2 = put(g1, [1, 1], TANGO_SIGNS.diferente.right);
      return seq(MiniTango, [
        F(1700, { grid: g, signs, hl: [[0, 0], [0, 1]] }, "“=”: as duas casas são iguais."),
        F(2000, { grid: g1, signs, ok: [[0, 1]] }, "Cristal = Cristal ✓", key([0, 1]), true),
        F(1700, { grid: g1, signs, hl: [[1, 0], [1, 1]] }, "“×”: as duas casas são diferentes.", null),
        F(2300, { grid: g2, signs, ok: [[1, 1]] }, "Orbe × Cristal ✓", key([1, 1]), true),
      ]);
    })(),
  },
  {
    title: "Deduzindo passo a passo",
    text: <p>Junte as regras: procure <b>pares</b>, <b>sanduíches</b>, <b>linhas com metade completa</b> e <b>sinais</b>. Cada descoberta abre a próxima. Travou de verdade? Imagine um símbolo numa casa: se ele levar a três iguais ou a uma contagem estourada, a casa é do outro (“E se…?”). A <b>Dica</b> mostra o próximo passo e explica o porquê.</p>,
    look: "as casas que justificam cada jogada (em destaque).",
    demo: (() => {
      const ds = deductions(4);
      const frames: Frame<TangoP>[] = [F(1300, { grid: TANGO_GIVENS, given: givens }, "Vamos resolver como no jogo.")];
      for (const { d, before } of ds) {
        frames.push(F(1700, { grid: before, given: givens, hl: [...d.from, ...(d.line ? d.line.cells : [])] as RC[], sel: [d.r, d.c] }, WHY[d.reason](d)));
        frames.push(F(1300, { grid: put(before, [d.r, d.c], d.v), given: givens, ok: [[d.r, d.c]] }, WHY[d.reason](d), key([d.r, d.c]), true));
      }
      frames.push(F(1800, { grid: frames[frames.length - 1].p.grid, given: givens }, "E assim por diante, até completar.", null));
      return seq(MiniTango, frames);
    })(),
  },
  {
    title: "Concluindo o desafio",
    text: <p>Quando a grade estiver cheia, com todas as linhas e colunas equilibradas, nenhum trio e todos os sinais respeitados, o nível é concluído. Se algo quebrar uma regra, a casa ganha um <b>“!”</b> e a mensagem explica o motivo.</p>,
    look: "as linhas acendendo quando tudo fecha.",
    demo: (() => {
      const cell: RC = [2, 1], almost = put(TANGO_SOLUTION, cell, 0);
      return seq(MiniTango, [
        F(1300, { grid: almost, given: givens }, "Falta uma casa…", key(cell)),
        F(1600, { grid: put(almost, cell, C), given: givens, sel: cell, bad: [[0, 1], [2, 1], [3, 1]] }, "Cristal? A coluna ficaria com 3 — “!”.", key(cell), true),
        F(1100, { grid: put(almost, cell, O), given: givens, sel: cell }, "Orbe!", key(cell), true),
        F(3300, { grid: TANGO_SOLUTION, given: givens, win: true }, "Grade equilibrada! Nível concluído.", null),
      ]);
    })(),
  },
];
