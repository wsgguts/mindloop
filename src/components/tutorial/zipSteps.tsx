import { MiniZip, type RC, type ZipP } from "./minis";
import { seq, type Frame, type TutorialStep } from "./Tutorial";
import { ZIP_NUMS, ZIP_PATH, ZIP_TRAP, ZIP_WRONG_ORDER } from "../../lib/tutorialData";

// Tutorial do Zip — regras de src/lib/zip.ts: o caminho começa no 1, anda só para casas vizinhas
// (sem diagonais), não repete casa, passa pelos números em ordem e precisa cobrir TODAS as casas,
// terminando no maior número. Tocar numa casa do caminho volta até ela.

const F = (ms: number, p: ZipP, say?: string, finger?: string | null, press?: boolean): Frame<ZipP> => ({ ms, p, say, finger, press });
const key = ([r, c]: RC) => `c-${r}-${c}`;
const nums = ZIP_NUMS;
const numbered = (max: number) => {
  const out: RC[] = [];
  nums.forEach((row, r) => row.forEach((v, c) => { if (v > 0 && v <= max) out.push([r, c]); }));
  return out;
};
const posOf = (n: number): RC => numbered(99).find(([r, c]) => nums[r][c] === n)!;
const P = ZIP_PATH as RC[];

/** Desenha um caminho casa a casa, com o dedo acompanhando. */
function grow(path: RC[], from: number, ms: number, say: (k: number) => string | undefined, extra: Partial<ZipP> = {}): Frame<ZipP>[] {
  const out: Frame<ZipP>[] = [];
  for (let k = from; k <= path.length; k++) out.push(F(ms, { nums, path: path.slice(0, k), ...extra }, say(k), key(path[k - 1]), true));
  return out;
}

export const ZIP_STEPS: TutorialStep[] = [
  {
    title: "O objetivo",
    text: <p>Trace <b>um único caminho</b> que liga os números <b>em ordem</b> (1, 2, 3…), passa por <b>todas as casas</b> uma vez só e <b>termina no maior número</b>.</p>,
    look: "o caminho cobre a grade inteira e acaba no 5.",
    demo: seq(MiniZip, [
      F(1300, { nums, path: [P[0]] }, "O caminho começa no 1."),
      ...grow(P, 2, 420, (k) => (k === P.length ? undefined : "…passando por todas as casas…")).map((f) => ({ ...f, finger: null, press: false })),
      F(3000, { nums, path: P, win: true }, "Do 1 ao 5, sem deixar nenhuma casa!"),
    ]),
  },
  {
    title: "Números e pontos",
    text: <p>Os <b>círculos escuros</b> são pontos de passagem numerados. O caminho já começa no <b>1</b>. Cada número alcançado fica <b>azul com ✓</b>. O último (o maior) é onde o caminho termina.</p>,
    look: "a ordem dos números: 1, 2, 3, 4 e 5.",
    demo: seq(MiniZip, [1, 2, 3, 4, 5].map((n) =>
      F(1300, { nums, path: [P[0]], hl: [posOf(n)] }, n === 1 ? "Começo: o 1." : n === 5 ? "Fim: o 5, o maior." : `Depois, o ${n}.`))),
  },
  {
    title: "Como traçar",
    text: <p><b>Arraste o dedo</b> a partir da ponta do caminho, passando pelas casas. Prefere tocar? <b>Toque na casa vizinha</b> à ponta, uma de cada vez. No teclado: setas.</p>,
    look: "a ponta do caminho (borda azul) segue o dedo.",
    demo: seq(MiniZip, [
      F(1300, { nums, path: [P[0]] }, "Comece pela ponta: o 1.", key(P[0])),
      ...grow(P.slice(0, 4), 2, 900, (k) => (k === 4 ? "Chegou ao 2! ✓" : "Arrastando para a casa vizinha…")),
      F(1900, { nums, path: P.slice(0, 4) }, "Chegou ao 2! ✓", null),
    ]),
  },
  {
    title: "Regras do movimento",
    text: <p>O caminho anda só para <b>cima, baixo, esquerda ou direita</b> — <b>nada de diagonal</b>. E <b>cada casa entra uma vez só</b>: o caminho nunca se cruza.</p>,
    look: "a casa recusada pisca em vermelho.",
    demo: seq(MiniZip, [
      F(1300, { nums, path: P.slice(0, 2) }, "A ponta está aqui.", key(P[1])),
      F(1300, { nums, path: P.slice(0, 2) }, "Tentando a diagonal…", key([1, 2]), true),
      F(2000, { nums, path: P.slice(0, 2), bad: [1, 2] }, "Diagonal não vale!", key([1, 2])),
      F(1200, { nums, path: P.slice(0, 3) }, "Só casas vizinhas, lado a lado. ✓", key(P[2]), true),
      F(1800, { nums, path: P.slice(0, 3) }, "Só casas vizinhas, lado a lado. ✓", null),
    ]),
  },
  {
    title: "Números em ordem",
    text: <p>Você só pode entrar num número depois de passar pelo <b>anterior</b>. Se tentar pular, o jogo avisa: “Ainda falta passar pelo número…”.</p>,
    look: "o 3 está logo ali, mas ainda falta o 2.",
    demo: seq(MiniZip, [
      F(1300, { nums, path: [P[0]], hl: [posOf(3)] }, "Do 1, o 3 está colado…", key(ZIP_WRONG_ORDER[0] as RC)),
      F(1200, { nums, path: [P[0]] }, "Tentando ir ao 3…", key(ZIP_WRONG_ORDER[1] as RC), true),
      F(2200, { nums, path: [P[0]], bad: ZIP_WRONG_ORDER[1] as RC }, "Calma! Ainda falta passar pelo 2.", key(ZIP_WRONG_ORDER[1] as RC)),
      ...grow(P.slice(0, 4), 2, 700, (k) => (k === 4 ? "Primeiro o 2… ✓" : "Indo até o 2…")),
      F(1800, { nums, path: P.slice(0, 4) }, "Primeiro o 2… ✓", null),
    ]),
  },
  {
    title: "Voltando atrás",
    text: <p>Pegou um caminho ruim? <b>Toque numa casa do caminho</b> e ele volta até ela. Ou use <b>Desfazer</b> para voltar um passo. No teclado: Backspace.</p>,
    look: "o trecho depois da casa tocada some.",
    demo: seq(MiniZip, [
      F(1500, { nums, path: P.slice(0, 7) }, "Um caminho já andado…", key(P[3])),
      F(1100, { nums, path: P.slice(0, 7) }, "Toque numa casa do caminho…", key(P[3]), true),
      F(2200, { nums, path: P.slice(0, 4) }, "…e o caminho volta até ela.", null),
    ]),
  },
  {
    title: "Planeje para não se prender",
    text: <p>Chegar ao último número <b>não basta</b>: todas as casas precisam estar no caminho. Antes de seguir, veja se nenhuma casa vai ficar <b>isolada</b> para trás.</p>,
    look: "as casas que sobraram (em vermelho).",
    demo: seq(MiniZip, [
      ...grow(ZIP_TRAP as RC[], 8, 450, (k) => (k === ZIP_TRAP.length ? "Chegou ao 5…" : "Seguindo para o 4 e o 5…")),
      F(2600, { nums, path: ZIP_TRAP as RC[], left: P.filter(([r, c]) => !ZIP_TRAP.some(([a, b]) => a === r && b === c)) }, "…mas sobraram casas. Não vale!", null),
      F(900, { nums, path: P.slice(0, 11) }, "Outra rota, passando por elas:"),
      ...grow(P, 12, 650, () => "Outra rota, passando por elas:").map((f) => ({ ...f, finger: null, press: false })),
      F(2300, { nums, path: P, win: true }, "Agora sim: todas as casas! ✓"),
    ]),
  },
  {
    title: "Concluindo o desafio",
    text: <p>O nível termina quando o caminho passa por <b>todas as casas</b> e chega ao <b>maior número</b>. Um brilho percorre o caminho do 1 até o fim. Travou? A <b>Dica</b> mostra onde está o próximo número.</p>,
    look: "o caminho acende do começo ao fim.",
    demo: seq(MiniZip, [
      F(1200, { nums, path: P.slice(0, 15) }, "Falta uma casa: o 5.", key(P[15])),
      F(900, { nums, path: P }, "Falta uma casa: o 5.", key(P[15]), true),
      F(3200, { nums, path: P, win: true }, "Caminho completo! Nível concluído.", null),
    ]),
  },
];
