import { MiniAstros, type AstrosP, type RC } from "./minis";
import { seq, type Frame, type TutorialStep } from "./Tutorial";
import AstroSymbol, { MarkSymbol } from "../AstroSymbol";
import { ASTROS_PUZZLES, MARK, STAR, emptyGrid, logicSteps, parseAstros, solutionGrid, type AGrid, type Step } from "../../lib/astros";

// Tutorial do Astros — regras de src/lib/astrosLogic.ts: um astro por linha, por coluna e por constelação, e
// nenhum astro encostado em outro (nem na diagonal). Tocar numa casa: vazia → × → astro → vazia.
// As demonstrações usam o céu do nível 1 e as deduções reais do motor (as mesmas da Dica).

const BOARD = parseAstros(ASTROS_PUZZLES[0].raw);
const R = BOARD.regions;
const N = BOARD.n;
const SOL = solutionGrid(BOARD)!;
const SOL_STARS: RC[] = SOL.flatMap((row, r) => row.flatMap((v, c) => (v === STAR ? [[r, c] as RC] : [])));
const EMPTY_G = emptyGrid(N);

const F = (ms: number, p: Omit<AstrosP, "regions">, say?: string, finger?: string | null, press?: boolean): Frame<AstrosP> => ({ ms, p: { regions: R, ...p }, say, finger, press });
const key = ([r, c]: RC) => `c-${r}-${c}`;
const put = (g: AGrid, cells: RC[], v: number): AGrid => g.map((row, r) => row.map((x, c) => (cells.some(([y, z]) => y === r && z === c) ? v : x)));
const cellsOf = (pred: (r: number, c: number) => boolean): RC[] => R.flatMap((row, r) => row.flatMap((_, c) => (pred(r, c) ? [[r, c] as RC] : [])));

const WHY: Record<string, string> = {
  "unica-constelacao": "Só sobrou uma casa nesta constelação → astro.",
  "unica-linha": "Só sobrou uma casa nesta linha → astro.",
  "unica-coluna": "Só sobrou uma casa nesta coluna → astro.",
  "faixa-linha": "A constelação cabe numa só linha → o resto da linha recebe ×.",
  "faixa-coluna": "A constelação cabe numa só coluna → o resto da coluna recebe ×.",
  "presa-linha": "A linha só tem casas desta constelação → o resto dela recebe ×.",
  "presa-coluna": "A coluna só tem casas desta constelação → o resto dela recebe ×.",
  bloqueio: "Um astro aqui apagaria uma constelação inteira → ×.",
  "faixas-linhas": "Duas constelações presas em duas linhas → o resto delas recebe ×.",
  "faixas-colunas": "Duas constelações presas em duas colunas → o resto delas recebe ×.",
};

/** Casas que um astro apaga: mesma linha, coluna, constelação e vizinhas. */
const shadowOf = ([r, c]: RC): RC[] => cellsOf((y, x) => !(y === r && x === c) && (y === r || x === c || R[y][x] === R[r][c] || (Math.abs(y - r) <= 1 && Math.abs(x - c) <= 1)));

/** Primeiros passos reais do motor de dedução, com o × aparecendo em volta de cada astro. */
function solvingFrames(max: number): Frame<AstrosP>[] {
  const steps: Step[] = logicSteps(BOARD).steps.slice(0, max);
  let g = EMPTY_G;
  const frames: Frame<AstrosP>[] = [F(1300, { grid: g }, "Vamos resolver como no jogo.")];
  for (const s of steps) {
    const cells = s.cells as RC[];
    frames.push(F(1700, { grid: g, hl: cells }, WHY[s.reason], s.kind === "star" ? key(cells[0]) : null));
    if (s.kind === "star") {
      g = put(g, cells, STAR);
      frames.push(F(1100, { grid: g, ok: cells }, WHY[s.reason], key(cells[0]), true));
      g = put(g, shadowOf(cells[0]).filter(([y, x]) => g[y][x] === 0), MARK);
      frames.push(F(1300, { grid: g, ok: cells }, "Em volta dele, ninguém mais: ×.", null));
    } else {
      g = put(g, cells.filter(([y, x]) => g[y][x] === 0), MARK);
      frames.push(F(1300, { grid: g }, WHY[s.reason], null));
    }
  }
  frames.push(F(1800, { grid: g }, "E assim por diante, até completar.", null));
  return frames;
}

const S = () => <AstroSymbol size={18} />;
const X = () => <MarkSymbol size={12} />;

export const ASTROS_STEPS: TutorialStep[] = [
  {
    title: "O objetivo",
    text: <p>O céu está dividido em <b>constelações</b> (áreas coloridas). Coloque <b>astros</b> <S /> de modo que cada <b>linha</b>, cada <b>coluna</b> e cada <b>constelação</b> tenha <b>exatamente um</b>. Cada céu tem uma única solução e se resolve só com lógica.</p>,
    look: "um astro em cada linha, coluna e cor.",
    demo: (() => {
      const frames: Frame<AstrosP>[] = [F(1500, { grid: EMPTY_G }, `Um céu ${N}×${N} com ${N} constelações.`)];
      let g = EMPTY_G;
      SOL_STARS.forEach((s) => { g = put(g, [s], STAR); frames.push(F(750, { grid: g, ok: [s] }, "Um astro por constelação…")); });
      frames.push(F(3000, { grid: SOL, win: true }, "Céu completo!"));
      return seq(MiniAstros, frames);
    })(),
  },
  {
    title: "Ninguém se encosta",
    text: <p>Dois astros <b>nunca podem se encostar</b>: nem lado a lado, nem em cima, nem na <b>diagonal</b>. Se isso acontecer, as casas ganham um <b>“!”</b>.</p>,
    look: "as 8 casas em volta de um astro.",
    demo: (() => {
      const a = SOL_STARS[0];
      const diag: RC = [a[0] + 1, a[1] + 1 < N ? a[1] + 1 : a[1] - 1];
      const ring = cellsOf((y, x) => !(y === a[0] && x === a[1]) && Math.abs(y - a[0]) <= 1 && Math.abs(x - a[1]) <= 1);
      const g1 = put(EMPTY_G, [a], STAR);
      return seq(MiniAstros, [
        F(1500, { grid: g1, ok: [a] }, "Um astro aqui…"),
        F(1800, { grid: g1, hl: ring }, "Estas casas encostam nele."),
        F(1100, { grid: g1, sel: diag }, "E se outro astro ficasse na diagonal?", key(diag), true),
        F(2200, { grid: put(g1, [diag], STAR), bad: [a, diag] }, "Encostaram: “!” — não pode.", null),
        F(2200, { grid: put(g1, ring, MARK) }, "Então todas elas ficam sem astro: ×."),
      ]);
    })(),
  },
  {
    title: "Como jogar",
    text: <p><b>Toque numa casa</b> para trocar: vazia → <b>×</b> <X /> → <b>astro</b> <S /> → vazia. O × é só uma anotação sua (“aqui não vai astro”). Ou selecione a casa e use os botões <b>Astro</b>, <b>Marcar</b> e <b>Apagar</b>. O botão <b>Marcar × em volta dos astros</b> faz as marcações óbvias de uma vez.</p>,
    look: "cada toque troca o que está na mesma casa.",
    demo: (() => {
      const cell = SOL_STARS[1];
      return seq(MiniAstros, [
        F(1100, { grid: EMPTY_G, pad: true }, "Toque numa casa…", key(cell)),
        F(1300, { grid: put(EMPTY_G, [cell], MARK), sel: cell, pad: true }, "1 toque: ×.", key(cell), true),
        F(1300, { grid: put(EMPTY_G, [cell], STAR), sel: cell, pad: true }, "2 toques: astro.", key(cell), true),
        F(1300, { grid: EMPTY_G, sel: cell, pad: true }, "3 toques: vazia de novo.", key(cell), true),
        F(1000, { grid: EMPTY_G, sel: cell, pad: true, press: "a" }, "Ou use os botões abaixo.", "pad-a", true),
        F(1800, { grid: put(EMPTY_G, [cell], STAR), sel: cell, pad: true }, "Ou use os botões abaixo.", null),
      ]);
    })(),
  },
  {
    title: "Constelação presa",
    text: <p>Quando todas as casas livres de uma constelação ficam <b>numa só linha</b> (ou coluna), o astro daquela linha <b>tem que ser</b> o dessa constelação. Então o resto da linha recebe <b>×</b>. Constelações pequenas costumam ser o melhor ponto de partida.</p>,
    look: "a constelação que cabe numa linha.",
    demo: (() => {
      // A menor constelação do céu e a linha (ou coluna) onde ela está.
      const sizes = Array.from({ length: N }, (_, k) => cellsOf((r, c) => R[r][c] === k));
      const small = sizes.reduce((a, b) => (b.length < a.length ? b : a));
      const row = small[0][0], sameRow = small.every(([r]) => r === row);
      const line = sameRow ? cellsOf((r, c) => r === row && R[r][c] !== R[small[0][0]][small[0][1]]) : [];
      return seq(MiniAstros, [
        F(1800, { grid: EMPTY_G, hl: small }, "Esta constelação é pequena."),
        ...(sameRow && line.length
          ? [F(1800, { grid: EMPTY_G, hl: small }, "Ela cabe inteira nesta linha…"), F(2400, { grid: put(EMPTY_G, line, MARK), ok: small }, "…então o resto da linha recebe ×.")]
          : [F(2400, { grid: EMPTY_G, ok: small }, "Poucas casas: o astro dela está bem ali.")]),
      ]);
    })(),
  },
  {
    title: "Deduzindo passo a passo",
    text: <p>Junte as regras: procure a <b>única casa possível</b> de uma linha, coluna ou constelação, constelações <b>presas</b> numa linha e casas que <b>bloqueariam</b> uma constelação inteira. Cada descoberta abre a próxima. A <b>Dica</b> mostra o próximo passo e explica o porquê.</p>,
    look: "as casas destacadas em cada jogada.",
    demo: seq(MiniAstros, solvingFrames(4)),
  },
  {
    title: "Concluindo o desafio",
    text: <p>Com um astro em cada linha, coluna e constelação, sem nenhum encostado, o céu se completa e os astros acendem. Se algo quebrar uma regra, a casa ganha um <b>“!”</b> e a mensagem explica o motivo.</p>,
    look: "os astros acendendo quando tudo fecha.",
    demo: (() => {
      const last = SOL_STARS[SOL_STARS.length - 1];
      const almost = put(SOL, [last], 0);
      return seq(MiniAstros, [
        F(1300, { grid: almost }, "Falta um astro…", key(last)),
        F(1100, { grid: almost, sel: last }, "Na última constelação livre.", key(last), true),
        F(3300, { grid: SOL, win: true }, "Céu completo! Nível concluído.", null),
      ]);
    })(),
  },
];
