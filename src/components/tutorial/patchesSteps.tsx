import { MiniPatches, type PatchesP, type RC } from "./minis";
import { seq, type Frame, type TutorialStep } from "./Tutorial";
import PatchesTag, { KIND_HELP } from "../PatchesTag";
import { PATCHES_TUT } from "../../lib/tutorialData";
import type { Rect } from "../../lib/patchesLogic";

// Tutorial do Patches — regras de src/lib/patchesLogic.ts: cobrir toda a grade com retângulos; cada peça
// tem exatamente um número; o número é a quantidade de casas; a etiqueta mostra o formato
// (quadrada, em pé, deitada ou livre). Arrastar de um canto ao oposto, ou tocar nos dois cantos; tocar tira a peça.

const T = PATCHES_TUT;
const base = { n: T.n, clues: T.clues, colors: T.colors };
const R = ([r, c, h, w]: [number, number, number, number]): Rect => ({ r, c, h, w });
const SOL = T.pieces.map(R);
const piece = (k: number) => ({ q: SOL[k], k });
const F = (ms: number, p: Partial<PatchesP>, say?: string, finger?: string | null, press?: boolean): Frame<PatchesP> =>
  ({ ms, p: { ...base, pieces: [], ...p }, say, finger, press });
const key = ([r, c]: RC) => `c-${r}-${c}`;
const corner2 = (q: Rect): RC => [q.r + q.h - 1, q.c + q.w - 1];
const Tag = ({ v, k }: { v: number; k: "q" | "v" | "h" | "a" }) => (
  <span className="tut-tag"><PatchesTag v={v} kind={k} color="#9A6BFF" /></span>
);

export const PATCHES_STEPS: TutorialStep[] = [
  {
    title: "O objetivo",
    text: <p>Cubra <b>toda a grade</b> com <b>peças retangulares</b> (quadrados também valem), sem deixar casa vazia e sem sobrepor peças.</p>,
    look: "as peças se encaixam até não sobrar nenhuma casa.",
    demo: seq(MiniPatches, [
      F(1400, {}, "Uma grade 4×4 com 5 números."),
      ...SOL.map((_, k) => F(900, { pieces: SOL.slice(0, k + 1).map((__, j) => piece(j)), okClues: SOL.slice(0, k + 1).map((__, j) => j) }, "Encaixando as peças…")),
      F(3000, { pieces: SOL.map((_, j) => piece(j)), okClues: [0, 1, 2, 3, 4], win: true }, "Grade toda coberta!"),
    ]),
  },
  {
    title: "O número é o tamanho",
    text: <p>Cada peça tem <b>exatamente um número</b>, e ele diz <b>quantas casas</b> a peça ocupa. Um 4 pode ser 2×2, 1×4 ou 4×1; um 3 só pode ser uma faixa de 3.</p>,
    look: "conte as casas de cada peça.",
    demo: seq(MiniPatches, [
      F(1600, { tipClue: 0 }, "Este 2 vai ocupar 2 casas."),
      F(1800, { pieces: [piece(0)], okClues: [0] }, "2 casas ✓"),
      F(1600, { pieces: [piece(0)], okClues: [0], tipClue: 1 }, "Este 4 vai ocupar 4 casas."),
      F(2000, { pieces: [piece(0), piece(1)], okClues: [0, 1] }, "4 casas ✓"),
    ]),
  },
  {
    title: "A etiqueta é o formato",
    text: (
      <ul className="tut-kinds">
        <li><Tag v={4} k="q" /> <span><b>Quadrada:</b> {KIND_HELP.q}.</span></li>
        <li><Tag v={3} k="v" /> <span><b>Em pé:</b> {KIND_HELP.v}.</span></li>
        <li><Tag v={2} k="h" /> <span><b>Deitada:</b> {KIND_HELP.h}.</span></li>
        <li><Tag v={4} k="a" /> <span><b>Livre:</b> {KIND_HELP.a}.</span></li>
      </ul>
    ),
    look: "o desenho da etiqueta de cada número.",
    demo: seq(MiniPatches, [
      F(1900, { tipClue: 0, pieces: [piece(0)] }, "2 deitado: mais largo que alto."),
      F(1900, { tipClue: 2, pieces: [piece(2)] }, "3 em pé: mais alto que largo."),
      F(1900, { tipClue: 1, pieces: [piece(1)] }, "4 quadrado: 2×2."),
      F(2100, { tipClue: 4, pieces: [piece(4)] }, "4 livre: qualquer formato serve."),
    ]),
  },
  {
    title: "Desenhando uma peça",
    text: <p><b>Arraste</b> de um canto da peça até o <b>canto oposto</b>. Enquanto arrasta, o tamanho aparece (ex.: 2×2 = 4) e a moldura fica <b>roxa</b> quando o tamanho e o formato estão certos. Prefere tocar? Toque num canto e depois no canto oposto.</p>,
    look: "a moldura muda de vermelha para roxa.",
    demo: (() => {
      const q = SOL[1], a: RC = [q.r, q.c];
      return seq(MiniPatches, [
        F(1100, {}, "Ponha o dedo num canto…", key(a)),
        F(1000, { preview: { q: { r: q.r, c: q.c, h: 1, w: 2 }, ok: false } }, "…arraste…", key([q.r, q.c + 1]), true),
        F(1300, { preview: { q, ok: true } }, "…até o canto oposto: 2×2 = 4 ✓", key(corner2(q)), true),
        F(1600, { pieces: [piece(1)], okClues: [1] }, "Soltou: peça encaixada!", null),
        F(1100, { pieces: [piece(1)], okClues: [1], anchor: [SOL[3].r, SOL[3].c] }, "Ou toque num canto…", key([SOL[3].r, SOL[3].c]), true),
        F(1000, { pieces: [piece(1)], okClues: [1], anchor: [SOL[3].r, SOL[3].c] }, "…e depois no outro.", key(corner2(SOL[3])), true),
        F(2000, { pieces: [piece(1), piece(3)], okClues: [1, 3] }, "Peça encaixada! ✓", null),
      ]);
    })(),
  },
  {
    title: "Quando a peça está errada",
    text: <p>Se a peça fica <b>sem número</b>, com <b>dois números</b>, com o <b>tamanho errado</b> ou com o <b>formato errado</b>, ela aparece listrada com um <b>“!”</b> e a mensagem explica o motivo. <b>Toque na peça</b> para tirá-la — ou desenhe outra por cima.</p>,
    look: "o “!” e as listras vermelhas.",
    demo: (() => {
      const w = R(T.wrong);
      return seq(MiniPatches, [
        F(1000, {}, "Desenhando a partir do 2…", key([w.r, w.c])),
        F(1300, { preview: { q: w, ok: false } }, "3 casas? O número pede 2…", key(corner2(w)), true),
        F(2100, { pieces: [{ q: w, k: 0, bad: true }] }, "“!” — 3 casas, mas o número é 2.", null),
        F(1100, { pieces: [{ q: w, k: 0, bad: true }] }, "Toque na peça para tirá-la.", key([w.r, w.c + 1]), true),
        F(900, {}, "Toque na peça para tirá-la.", null),
        F(1100, { preview: { q: SOL[0], ok: true } }, "Agora 1×2 = 2, deitado ✓", key(corner2(SOL[0])), true),
        F(2000, { pieces: [piece(0)], okClues: [0] }, "Certo! ✓", null),
      ]);
    })(),
  },
  {
    title: "Encontrando o encaixe certo",
    text: <p>Comece pelos números com <b>poucas opções</b>: perto de cantos e bordas, ou com etiqueta de formato. Se um número <b>só cabe de um jeito</b> (sem sair da grade e sem cobrir outro número), a peça dele está decidida. Cada peça colocada limita as vizinhas. A <b>Dica</b> mostra o próximo encaixe e explica o porquê.</p>,
    look: "a moldura amarela: o único encaixe possível.",
    demo: seq(MiniPatches, [
      F(1600, { tipClue: 0 }, "O 2 deitado está no canto…"),
      F(2000, { tipClue: 0, ghost: SOL[0] }, "Só cabe de um jeito: (1×2) para a direita."),
      F(1300, { pieces: [piece(0)], okClues: [0] }, "Decidido! ✓"),
      F(1700, { pieces: [piece(0)], okClues: [0], tipClue: 3 }, "O 3 em pé, na borda esquerda…"),
      F(2000, { pieces: [piece(0)], okClues: [0], tipClue: 3, ghost: SOL[3] }, "Para cima esbarra no 2: só pode descer."),
      F(1800, { pieces: [piece(0), piece(3)], okClues: [0, 3] }, "Decidido! ✓"),
    ]),
  },
  {
    title: "Concluindo o desafio",
    text: <p>Quando todas as casas estiverem cobertas e <b>cada peça tiver um número, o tamanho e o formato certos</b>, as peças encaixam em onda e o nível é concluído. As peças certas ganham um <b>✓</b> na etiqueta.</p>,
    look: "o ✓ nas etiquetas e o brilho final.",
    demo: seq(MiniPatches, [
      F(1400, { pieces: SOL.slice(0, 4).map((_, j) => piece(j)), okClues: [0, 1, 2, 3] }, "Falta uma peça…", key([SOL[4].r, SOL[4].c])),
      F(1100, { pieces: SOL.slice(0, 4).map((_, j) => piece(j)), okClues: [0, 1, 2, 3], preview: { q: SOL[4], ok: true } }, "2×2 = 4 ✓", key(corner2(SOL[4])), true),
      F(3300, { pieces: SOL.map((_, j) => piece(j)), okClues: [0, 1, 2, 3, 4], win: true }, "Grade completa! Nível concluído.", null),
    ]),
  },
];
