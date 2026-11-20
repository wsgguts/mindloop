// Roteiros da partida guiada, um por jogo (o motor está em GuidedPlay.tsx).
// Cada roteiro usa um tabuleiro pequeno e fácil (os mesmos exemplos do tutorial, conferidos com as regras reais
// em lib/tutorialData.ts e guided.test.tsx) e a MESMA mecânica da partida (`act`):
//  • Mini Sudoku: toque na casa e no número; números já usados em todas as linhas ficam apagados no teclado.
//  • Tango: cada toque troca vazia → Cristal → Orbe → vazia (também dá para usar os botões).
//  • Zip: arrastar o dedo pela trilha (ou tocar casa por casa); voltar pela trilha desfaz.
//  • Patches: arrastar de um canto ao outro da peça (ou tocar nos dois cantos); tocar numa peça a retira.
//  • Astros: cada toque troca vazia → × → astro → vazia; "Em volta" marca × em volta dos astros.
// Falas curtas (no máximo 2 linhas), na voz do personagem do jogo.
import { MiniAstros, MiniPatches, MiniSudoku, MiniTango, MiniZip, type AstrosP, type PatchesP, type RC, type SudokuP, type TangoP, type ZipP } from "../tutorial/minis";
import type { Check, Move, Script } from "./GuidedPlay";
import { PATCHES_TUT, SUDOKU_PUZZLE, SUDOKU_SOLUTION, TANGO_SOLUTION, ZIP_NUMS, ZIP_PATH, ZIP_WRONG_ORDER, C, O } from "../../lib/tutorialData";
import { PUZZLES } from "../../lib/puzzles";
import { ASTROS_PUZZLES, MARK, STAR, emptyGrid, parseAstros, solutionGrid } from "../../lib/astros";
import type { Rect } from "../../lib/patchesLogic";
import type { JourneyGame } from "../../lib/journey";
import type { GuidedPart } from "../../lib/guided";

const cell = ([r, c]: RC) => `c-${r}-${c}`;
const rcOf = (t: string): RC => { const [, r, c] = t.split("-"); return [Number(r), Number(c)]; };
const put = (g: number[][], [r, c]: RC, v: number) => g.map((row, y) => row.map((x, z) => (y === r && z === c ? v : x)));
const line = (r: number, n: number): RC[] => Array.from({ length: n }, (_, c) => [r, c] as RC);
const col = (c: number, n: number): RC[] => Array.from({ length: n }, (_, r) => [r, c] as RC);
const allCells = (n: number): RC[] => Array.from({ length: n * n }, (_, k) => [Math.floor(k / n), k % n] as RC);
/** Versão curta só com falas (mudança de tamanho): o personagem explica, sem tabuleiro. */
const talk = (...lines: string[]): Script => ({ steps: lines.map((text) => ({ k: "say" as const, text })) });

// ======================= Mini Sudoku (Bit) =======================
/** Números que já aparecem em todas as linhas: o botão apaga (igual à partida). */
const usedOf = (vals: number[][]) => Array.from({ length: vals.length }, (_, k) => k + 1).filter((d) => vals.flat().filter((v) => v === d).length >= vals.length);
/** A mecânica do Mini Sudoku: tocar numa casa a escolhe; tocar num número coloca nela (0 = apagar). */
const sudokuAct = (sol?: number[][]) => (p: SudokuP, t: string): SudokuP => {
  if (t.startsWith("c-")) return { ...p, sel: rcOf(t), pop: undefined };
  const d = Number(t.split("-")[1]);
  if (!p.sel || p.given[p.sel[0]][p.sel[1]] || (d && p.used?.includes(d))) return p;
  const vals = put(p.vals, p.sel, d);
  const bad = sol ? allCells(vals.length).filter(([r, c]) => vals[r][c] && !p.given[r][c] && vals[r][c] !== sol[r][c]) : undefined;
  return { ...p, vals, used: usedOf(vals), bad, pop: d ? p.sel : undefined };
};
const sudokuReject = (p: SudokuP, t: string): string | null => {
  if (!t.startsWith("pad-")) return null;
  const d = Number(t.split("-")[1]);
  if (!p.sel) return "Primeiro toque numa casa vazia, depois no número.";
  if (p.given[p.sel[0]][p.sel[1]]) return "Essa casa é uma pista fixa. Escolha uma casa vazia.";
  if (d && p.used?.includes(d)) return `O ${d} já está em todas as linhas — por isso o botão dele apagou.`;
  return null;
};
const sudokuCheck = (sol: number[][]) => (p: SudokuP): Check => {
  const n = sol.length, cells = allCells(n).filter(([r, c]) => !p.given[r][c]);
  const wrong = cells.find(([r, c]) => p.vals[r][c] && p.vals[r][c] !== sol[r][c]);
  const empty = cells.filter(([r, c]) => !p.vals[r][c]);
  const sel = p.sel && !p.given[p.sel[0]][p.sel[1]] && !p.vals[p.sel[0]][p.sel[1]] ? p.sel : null;
  return { solved: !wrong && !empty.length, wrong: wrong && cell(wrong), next: sel ? `pad-${sol[sel[0]][sel[1]]}` : empty[0] && cell(empty[0]) };
};
const sudokuMove = (sol: number[][], rc: RC, hint: string): Move => ({ taps: [cell(rc), `pad-${sol[rc[0]][rc[1]]}`], hint });

const sudokuBase = (): Script<SudokuP> => {
  const S = SUDOKU_SOLUTION, P0 = SUDOKU_PUZZLE;
  const wrong = (rc: RC, v: number, clash: RC) => (p: SudokuP) => ({ ...p, vals: put(p.vals, rc, v), bad: [rc, clash], sel: undefined });
  return {
    Mini: MiniSudoku, start: { vals: P0, given: P0.map((r) => r.map((v) => v > 0)), pad: true, used: usedOf(P0) },
    act: sudokuAct(S), reject: sudokuReject, check: sudokuCheck(S),
    win: (p) => ({ ...p, sel: undefined, pop: undefined, bad: undefined, win: true }),
    steps: [
      { k: "say", text: "Oi! Eu sou o Bit. Bora jogar juntos? Primeiro, vou te mostrar as partes do tabuleiro." },
      { k: "say", text: "Estas são as LINHAS: 4 faixas deitadas, de cima até embaixo. Cada cor é uma linha.", show: (p) => ({ ...p, bands: "row" }) },
      { k: "say", text: "Estas são as COLUNAS: 4 faixas em pé, da esquerda até a direita.", show: (p) => ({ ...p, bands: "col" }) },
      { k: "say", text: "E estes são os BLOCOS (quadrantes): 4 quadrados de 2×2, separados pela linha grossa.", show: (p) => ({ ...p, bands: "box" }) },
      { k: "say", text: "A regra: em cada linha, cada coluna e cada bloco, os números de 1 a 4 aparecem uma vez só." },
      { k: "wrong", text: "Olha: se eu puser 3 aqui, esta linha fica com dois 3. Vermelho quer dizer que não vale!", show: wrong([0, 1], 3, [0, 2]) },
      { k: "do", move: sudokuMove(S, [0, 1], "Quase! Esta linha já tem 1, 3 e 4. Qual número falta?"), say: ["Agora você: toque nesta casa para escolhê-la.", "Agora toque no 2: é o único que falta nesta linha."] },
      { k: "say", text: "Na coluna também não pode repetir. Veja esta coluna inteira:", show: (p) => ({ ...p, hl: col(2, 4) }) },
      { k: "wrong", text: "Se eu puser 4 aqui, esta coluna fica com dois 4. Não pode!", show: wrong([1, 2], 4, [2, 2]) },
      { k: "do", move: sudokuMove(S, [1, 2], "Quase! Olhe a linha e a coluna desta casa juntas."), say: ["Toque nesta casa.", "Toque no 1: a linha tem 4 e 2, e a coluna tem 3 e 4."] },
      { k: "say", text: "E no bloco também. Este é o bloco de baixo, à esquerda:", show: (p) => ({ ...p, hl: [[2, 0], [2, 1], [3, 0], [3, 1]] }) },
      { k: "wrong", text: "Se eu puser 4 aqui, este bloco fica com dois 4. Não vale!", show: wrong([2, 1], 4, [3, 0]) },
      { k: "do", move: sudokuMove(S, [2, 1], "Quase! O bloco já tem 2, 3 e 4."), say: ["Toque nesta casa.", "Toque no 1: é o que falta neste bloco."] },
      { k: "say", text: "Viu o 1 e o 4 apagados no teclado? Eles já estão em todas as linhas, então acabaram. Isso ajuda a pensar!" },
      { k: "free", text: "Agora é com você! Complete as últimas casas: toque na casa e depois no número.",
        hint: "Olhe a linha, a coluna e o bloco da casa iluminada: só um número cabe ali.", moves: [sudokuMove(S, [1, 0], ""), sudokuMove(S, [2, 3], ""), sudokuMove(S, [3, 2], "")] },
    ],
  };
};
/** Capítulo 3: chega a grade 6×6, com blocos de 2 linhas × 3 colunas. */
const sudoku6 = (): Script<SudokuP> => {
  const vals = PUZZLES[20].rows.map((r) => [...r].map((ch) => (ch === "." ? 0 : Number(ch))));
  const n = vals.length;
  // Uma casa com um único número possível (olhando linha, coluna e bloco 2×3).
  const options = (r: number, c: number) => Array.from({ length: n }, (_, k) => k + 1).filter((v) =>
    !vals[r].includes(v) && !vals.some((row) => row[c] === v) &&
    !vals.some((row, y) => Math.floor(y / 2) === Math.floor(r / 2) && row.some((x, z) => Math.floor(z / 3) === Math.floor(c / 3) && x === v)));
  let target: RC = [0, 0], value = 1;
  outer: for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!vals[r][c] && options(r, c).length === 1) { target = [r, c]; value = options(r, c)[0]; break outer; }
  return {
    Mini: MiniSudoku, start: { vals, given: vals.map((r) => r.map((v) => v > 0)), pad: true, used: usedOf(vals) },
    act: sudokuAct(), reject: sudokuReject,
    steps: [
      { k: "say", text: "Novidade! A grade agora é 6×6, com números de 1 a 6. Estas são as 6 linhas:", show: (p) => ({ ...p, bands: "row" }) },
      { k: "say", text: "As 6 colunas:", show: (p) => ({ ...p, bands: "col" }) },
      { k: "say", text: "E os 6 blocos, agora com 2 linhas e 3 colunas cada. As regras são as mesmas!", show: (p) => ({ ...p, bands: "box" }) },
      { k: "do", move: { taps: [cell(target), `pad-${value}`], hint: "Quase! Olhe a linha, a coluna e o bloco desta casa." },
        say: ["Vamos testar: toque nesta casa.", `Só o ${value} cabe aqui. Toque no ${value}!`] },
    ],
  };
};

// ======================= Tango (Dona Coruja) =======================
/** A mecânica do Tango: cada toque na casa troca vazia → Cristal → Orbe → vazia; os botões põem direto. */
const tangoAct = (p: TangoP, t: string): TangoP => {
  if (t.startsWith("c-")) {
    const [r, c] = rcOf(t);
    if (p.given?.[r][c]) return { ...p, sel: [r, c] };
    const v = p.grid[r][c];
    return { ...p, sel: [r, c], ok: undefined, bad: undefined, grid: put(p.grid, [r, c], v === 0 ? C : v === C ? O : 0) };
  }
  if (!p.sel || p.given?.[p.sel[0]][p.sel[1]]) return p;
  return { ...p, grid: put(p.grid, p.sel, t === "pad-c" ? C : t === "pad-o" ? O : 0) };
};
const tangoCheck = (sol: number[][]) => (p: TangoP): Check => {
  const cells = allCells(sol.length).filter(([r, c]) => r < sol.length && c < sol[0].length && !p.given?.[r][c]);
  const wrong = cells.find(([r, c]) => p.grid[r][c] && p.grid[r][c] !== sol[r][c]);
  const empty = cells.find(([r, c]) => !p.grid[r][c]);
  return { solved: !wrong && !empty, wrong: wrong && cell(wrong), next: empty && cell(empty) };
};
/** Os toques para chegar no símbolo certo: 1 toque = Cristal; 2 toques = Orbe. */
const tangoMove = (sol: number[][], rc: RC, hint: string): Move => ({ taps: sol[rc[0]][rc[1]] === C ? [cell(rc)] : [cell(rc), cell(rc)], hint });
const tangoStart = (sol: number[][], holes: RC[], extra: Partial<TangoP> = {}): TangoP => {
  const grid = holes.reduce((g, rc) => put(g, rc, 0), sol);
  return { grid, given: grid.map((r) => r.map((v) => v > 0)), pad: true, ...extra };
};
const tangoBase = (): Script<TangoP> => {
  const S = TANGO_SOLUTION;
  return {
    Mini: MiniTango, start: tangoStart(S, [[0, 1], [0, 2], [2, 1], [2, 3], [3, 2]]), act: tangoAct, check: tangoCheck(S),
    win: (p) => ({ ...p, sel: undefined, ok: undefined, win: true }),
    steps: [
      { k: "say", text: "Hu-hu! Eu sou a Dona Coruja. Estas são as LINHAS do tabuleiro: faixas deitadas.", show: (p) => ({ ...p, bands: "row" }) },
      { k: "say", text: "E estas são as COLUNAS: faixas em pé.", show: (p) => ({ ...p, bands: "col" }) },
      { k: "say", text: "A regra: cada linha e cada coluna tem 2 Cristais e 2 Orbes.", show: (p) => ({ ...p, hl: line(2, 4) }) },
      { k: "say", text: "Para jogar, toque na casa: 1 toque = Cristal, 2 toques = Orbe, 3 toques = apaga." },
      { k: "wrong", text: "Se esta casa fosse Cristal, a linha ficaria com 3 Cristais. Não vale!", show: (p) => ({ ...p, grid: put(p.grid, [2, 1], C), bad: [[2, 0], [2, 1], [2, 2]] }) },
      { k: "do", move: tangoMove(S, [2, 1], "Toque na casa iluminada."), say: ["Toque nesta casa uma vez: aparece um Cristal…", "…mas a linha já tem 2 Cristais! Toque de novo para virar Orbe."] },
      { k: "say", text: "Nas colunas é igual: 2 Cristais e 2 Orbes. Veja esta coluna:", show: (p) => ({ ...p, hl: col(2, 4) }) },
      { k: "wrong", text: "Cristal aqui deixaria a coluna com 3 Cristais. Não pode!", show: (p) => ({ ...p, grid: put(p.grid, [0, 2], C), bad: [[0, 2], [1, 2], [2, 2]] }) },
      { k: "do", move: tangoMove(S, [0, 2], "Toque na casa iluminada."), say: ["Toque nesta casa: Cristal…", "…toque de novo: Orbe! A coluna já tinha 2 Cristais."] },
      { k: "say", text: "Se preferir, toque na casa e depois nos botões Cristal ou Orbe, embaixo." },
      { k: "free", text: "Agora é com você! Complete as últimas casas.",
        hint: "Conte os Cristais e Orbes da linha e da coluna. Lembre: 1 toque = Cristal, 2 toques = Orbe.",
        moves: [tangoMove(S, [0, 1], ""), tangoMove(S, [2, 3], ""), tangoMove(S, [3, 2], "")] },
    ],
  };
};
/** Capítulo 2: chegam os sinais = (iguais) e × (diferentes). */
const tangoSigns = (): Script<TangoP> => {
  const S = TANGO_SOLUTION;
  return {
    Mini: MiniTango, start: tangoStart(S, [[0, 1], [2, 1]], { signs: [{ r: 0, c: 0, dir: "h", same: true }, { r: 2, c: 0, dir: "h", same: false }] }), act: tangoAct,
    steps: [
      { k: "say", text: "Hu-hu! Novidade: sinais entre as casas. = quer dizer iguais; × quer dizer diferentes." },
      { k: "do", move: tangoMove(S, [0, 1], "O = pede o mesmo símbolo da vizinha."), say: ["Este = pede igual à vizinha (Cristal). Toque uma vez: Cristal!"] },
      { k: "do", move: tangoMove(S, [2, 1], "O × pede o símbolo oposto ao da vizinha."), say: ["Este × pede o contrário da vizinha. Toque uma vez…", "…e mais uma: Orbe!"] },
    ],
  };
};
/** Uma linha só (6 ou 8 casas): tamanho novo e, no 6×6, "nunca 3 iguais seguidos". */
const tangoRow = (size: 6 | 8): Script<TangoP> => {
  const row = size === 6 ? [C, C, O, O, C, O] : [C, O, C, O, C, O, C, O];
  const holes: RC[] = size === 6 ? [[0, 2], [0, 4]] : [[0, 7]];
  const S = [row];
  return {
    Mini: MiniTango, start: tangoStart(S, holes), act: tangoAct,
    steps: size === 6 ? [
      { k: "say", text: "Hu-hu! Novidade: grade 6×6, com 3 Cristais e 3 Orbes em cada linha e coluna." },
      { k: "wrong", text: "E mais uma regra: nunca 3 iguais seguidos. Três Cristais juntos não vale!", show: (p) => ({ ...p, grid: put(p.grid, [0, 2], C), bad: [[0, 0], [0, 1], [0, 2]] }) },
      { k: "do", move: tangoMove(S, [0, 2], "Já tem 2 Cristais seguidos ao lado."), say: ["Toque nesta casa: Cristal…", "…toque de novo: Orbe, para não ficar 3 iguais."] },
      { k: "do", move: tangoMove(S, [0, 4], "A linha precisa de 3 Cristais."), say: ["Agora esta: a linha precisa de 3 Cristais. Um toque!"] },
    ] : [
      { k: "say", text: "Hu-hu! Novidade: grade 8×8, com 4 Cristais e 4 Orbes em cada linha e coluna." },
      { k: "do", move: tangoMove(S, [0, 7], "Conte os Cristais desta linha."), say: ["A linha já tem 4 Cristais. Toque na última casa…", "…e de novo: Orbe!"] },
    ],
  };
};

// ======================= Zip (Guaxi) =======================
/** A mecânica do Zip: a trilha anda para a casa vizinha certa; voltar para a casa anterior desfaz. */
const zipAct = (p: ZipP, t: string): ZipP => {
  const rc = rcOf(t), path = p.path, nextCell = ZIP_PATH[path.length], prev = path[path.length - 2];
  const same = (a?: RC | number[], b?: RC | number[]) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  if (same(rc, nextCell)) return { ...p, path: [...path, rc], bad: undefined };
  if (same(rc, prev)) return { ...p, path: path.slice(0, -1), bad: undefined }; // voltou pela trilha: desfaz
  if (same(rc, path[path.length - 1])) return p;
  return { ...p, bad: rc };
};
const zipBase = (): Script<ZipP> => {
  const step = (k: number): Move => ({ taps: [cell(ZIP_PATH[k])], hint: "Siga em linha reta até o 2, sem diagonal." });
  return {
    Mini: MiniZip, start: { nums: ZIP_NUMS, path: [ZIP_PATH[0]] }, act: zipAct, drag: "path",
    check: (p) => ({ solved: p.path.length === ZIP_PATH.length, wrong: p.bad && cell(ZIP_PATH[p.path.length]), next: p.path.length < ZIP_PATH.length ? cell(ZIP_PATH[p.path.length]) : undefined }),
    win: (p) => ({ ...p, bad: undefined, win: true }),
    steps: [
      { k: "say", text: "E aí! Eu sou o Guaxi. A trilha começa no 1 e visita os números em ordem: 1, 2, 3…", show: (p) => ({ ...p, hl: [[0, 0]] }) },
      { k: "wrong", text: "Se eu descer daqui, chego no 3 antes do 2. Fora de ordem não vale!", show: (p) => ({ ...p, path: ZIP_WRONG_ORDER, bad: ZIP_WRONG_ORDER[1] }) },
      { k: "do", move: { taps: [1, 2, 3].map((k) => step(k).taps[0]), hint: "Siga em linha reta até o 2, sem diagonal." },
        say: ["Arraste o dedo do 1 para o lado, até o 2 (ou toque casa por casa).", "Isso! Continue…", "…chegando no 2!"] },
      { k: "say", text: "Errou o caminho? É só voltar o dedo pela trilha: ela se desfaz." },
      { k: "say", text: "E a regra principal: a trilha passa por TODAS as casas, uma vez cada." },
      { k: "free", text: "Agora é com você! Arraste até o 5 sem deixar nenhuma casa para trás.",
        hint: "Vá para a casa iluminada: sem pular casas e rumo ao próximo número.", moves: ZIP_PATH.slice(4).map((_, k) => step(k + 4)) },
    ],
  };
};

// ======================= Patches (Remendo) =======================
const rectOf = ([r1, c1]: RC, [r2, c2]: RC): Rect => ({ r: Math.min(r1, r2), c: Math.min(c1, c2), h: Math.abs(r1 - r2) + 1, w: Math.abs(c1 - c2) + 1 });
const inRect = (q: Rect, r: number, c: number) => r >= q.r && r < q.r + q.h && c >= q.c && c < q.c + q.w;
const sameRect = (a: Rect, b: Rect) => a.r === b.r && a.c === b.c && a.h === b.h && a.w === b.w;
const patchesBase = (): Script<PatchesP> => {
  const T = PATCHES_TUT;
  const SOL: Rect[] = T.pieces.map(([r, c, h, w]) => ({ r, c, h, w }));
  const corners = (q: Rect) => [cell([q.r, q.c]), cell([q.r + q.h - 1, q.c + q.w - 1])];
  const piece = (k: number, hint = ""): Move => ({ taps: corners(SOL[k]), hint });
  /** A mecânica do Patches: 1º toque marca um canto; 2º toque fecha a peça; tocar numa peça a retira. */
  const act = (p: PatchesP, t: string): PatchesP => {
    const rc = rcOf(t);
    if (p.anchor) {
      if (p.anchor[0] === rc[0] && p.anchor[1] === rc[1]) return { ...p, anchor: undefined };
      const q = rectOf(p.anchor, rc);
      if (p.pieces.some(({ q: o }) => allCells(T.n).some(([r, c]) => inRect(o, r, c) && inRect(q, r, c)))) return { ...p, anchor: undefined }; // em cima de outra peça
      const inside = T.clues.map(([r, c], k) => (inRect(q, r, c) ? k : -1)).filter((k) => k >= 0);
      const k = inside.length === 1 ? inside[0] : -1;
      const ok = k >= 0 && SOL.some((s) => sameRect(s, q));
      return { ...p, anchor: undefined, pieces: [...p.pieces, { q, k, bad: !ok }], okClues: ok ? [...(p.okClues ?? []), k] : p.okClues, tipClue: undefined };
    }
    const hit = p.pieces.find(({ q }) => inRect(q, rc[0], rc[1]));
    if (hit) return { ...p, pieces: p.pieces.filter((x) => x !== hit), okClues: (p.okClues ?? []).filter((k) => k !== hit.k || hit.bad) };
    return { ...p, anchor: rc };
  };
  const check = (p: PatchesP): Check => {
    const bad = p.pieces.find((x) => x.bad);
    const missing = SOL.find((s) => !p.pieces.some((x) => !x.bad && sameRect(x.q, s)));
    const [a, b] = missing ? corners(missing) : [undefined, undefined];
    const next = !missing ? undefined : p.anchor ? (cell(p.anchor) === a ? b : cell(p.anchor) === b ? a : cell(p.anchor)) : a;
    return { solved: !missing && !bad, wrong: bad && cell([bad.q.r, bad.q.c]), next };
  };
  const [wr, wc, wh, ww] = T.wrong;
  return {
    Mini: MiniPatches, start: { n: T.n, clues: T.clues, colors: T.colors, pieces: [] }, act, check, drag: "rect",
    win: (p) => ({ ...p, win: true }),
    steps: [
      { k: "say", text: "Oi! Eu sou a Remendo. Vamos cobrir a grade toda com peças retangulares, como retalhos!" },
      { k: "say", text: "O número diz quantas casas a peça tem. A etiqueta mostra o formato: este 2 é deitado.", show: (p) => ({ ...p, tipClue: 0 }) },
      { k: "wrong", text: "Esta peça tem 3 casas, mas o número pede 2. Não serve!", show: (p) => ({ ...p, pieces: [{ q: { r: wr, c: wc, h: wh, w: ww }, k: 0, bad: true }] }) },
      { k: "do", move: piece(0, "Arraste de um canto ao outro da peça do 2: 2 casas, deitada."), say: ["Arraste o dedo de um canto ao outro da peça do 2 (ou toque nos dois cantos).", "Agora o outro canto: 2 casas, deitada."] },
      { k: "do", move: piece(1, "O 4 quadrado ocupa 2×2 casas."), say: ["Agora o 4 quadrado: arraste deste canto…", "…até o canto oposto: um quadrado 2×2!"] },
      { k: "say", text: "Errou uma peça? Toque nela para tirar." },
      { k: "free", text: "Agora é com você! Arraste de canto a canto as peças que faltam.",
        hint: "O número diz quantas casas a peça tem e a etiqueta, o formato. Peça errada? Toque nela para tirar.", moves: [piece(2), piece(3), piece(4)] },
    ],
  };
};

// ======================= Astros (Lumen) =======================
const astrosBase = (): Script<AstrosP> => {
  const board = parseAstros(ASTROS_PUZZLES[0].raw);
  const R = board.regions, n = board.n;
  const sol = solutionGrid(board)!;
  const stars: RC[] = sol.flatMap((row, r) => row.flatMap((v, c) => (v === STAR ? [[r, c] as RC] : [])));
  const [s0, s1] = stars;
  const sameRow: RC = [s0[0], [...Array(n).keys()].find((c) => Math.abs(c - s0[1]) >= 2)!];
  const diag: RC = [s0[0] + 1, s0[1] + 1 < n ? s0[1] + 1 : s0[1] - 1];
  /** A mecânica do Astros: toque troca vazia → × → astro → vazia; botões põem direto; "Em volta" marca × em volta. */
  const act = (p: AstrosP, t: string): AstrosP => {
    if (t.startsWith("c-")) {
      const [r, c] = rcOf(t), v = p.grid[r][c];
      return { ...p, sel: [r, c], ok: undefined, bad: undefined, grid: put(p.grid, [r, c], v === 0 ? MARK : v === MARK ? STAR : 0) };
    }
    if (t === "pad-v") {
      const st = allCells(n).filter(([r, c]) => p.grid[r][c] === STAR);
      return { ...p, grid: p.grid.map((row, r) => row.map((v, c) => (v === 0 && st.some(([y, x]) => y === r || x === c || R[y][x] === R[r][c] || (Math.abs(y - r) <= 1 && Math.abs(x - c) <= 1)) ? MARK : v))) };
    }
    if (!p.sel) return p;
    return { ...p, grid: put(p.grid, p.sel, t === "pad-a" ? STAR : t === "pad-m" ? MARK : 0) };
  };
  const check = (p: AstrosP): Check => {
    const wrong = allCells(n).find(([r, c]) => p.grid[r][c] === STAR && sol[r][c] !== STAR);
    const missing = stars.find(([r, c]) => p.grid[r][c] !== STAR);
    return { solved: !wrong && !missing, wrong: wrong && cell(wrong), next: missing && cell(missing) };
  };
  const star = (rc: RC, hint = ""): Move => ({ taps: [cell(rc), cell(rc)], hint });
  return {
    Mini: MiniAstros, start: { regions: R, grid: emptyGrid(n), pad: true }, act, check,
    win: (p) => ({ ...p, sel: undefined, ok: undefined, win: true }),
    steps: [
      { k: "say", text: "Olá! Eu sou o Lumen. Cada cor do céu é uma constelação." },
      { k: "say", text: "A regra: um astro em cada linha (deitada), em cada coluna (em pé) e em cada constelação.", show: (p) => ({ ...p, hl: [...line(s0[0], n), ...col(s0[1], n)] }) },
      { k: "say", text: "Para jogar, toque na casa: 1 toque marca ×, 2 toques acendem o astro, 3 toques apagam." },
      { k: "wrong", text: "Dois astros na mesma linha? Não pode! Cada linha tem só um.", show: (p) => ({ ...p, grid: put(put(p.grid, s0, STAR), sameRow, STAR), bad: [s0, sameRow] }) },
      { k: "do", move: star(s0, "Toque na casa iluminada."), say: ["Toque nesta casa uma vez: aparece um ×…", "…toque de novo: o astro acende!"] },
      { k: "say", text: "Mais uma regra: astros nunca se encostam, nem na diagonal." },
      { k: "wrong", text: "Este astro encostaria no outro, na diagonal. Não vale!", show: (p) => ({ ...p, grid: put(p.grid, diag, STAR), bad: [s0, diag] }) },
      { k: "do", move: { taps: ["pad-v"], hint: "Toque no botão “Em volta”." }, say: ["Atalho: toque em “Em volta”. Ele marca × em todas as casas que este astro apaga."] },
      { k: "do", move: star(s1, "Toque na casa iluminada."), say: ["Viu? Sobraram poucas casas. Toque nesta uma vez…", "…e de novo: astro!"] },
      { k: "free", text: "Agora é com você! Acenda os astros que faltam. Use “Em volta” sempre que quiser.",
        hint: "Procure a casa livre que sobrou na linha, na coluna e na constelação. 2 toques acendem o astro.", moves: stars.slice(2).map((rc) => star(rc)) },
    ],
  };
};

/** O roteiro de cada partida guiada: a completa ("base") e as curtas dos capítulos que mudam algo. */
export function guidedScript(game: JourneyGame, part: GuidedPart): Script<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (part === "base") return { sudoku: sudokuBase, tango: tangoBase, zip: zipBase, patches: patchesBase, astros: astrosBase }[game]();
  const ch = Number(part.slice(1));
  switch (game) {
    case "sudoku": return sudoku6();
    case "tango": return ch === 2 ? tangoSigns() : tangoRow(ch === 3 ? 6 : 8);
    case "zip": {
      const size = { 2: 5, 4: 6, 7: 7 }[ch] ?? 5;
      return talk(`Vrum! Novidade: a grade agora é ${size}×${size}. Mais casas, mesma regra!`, "Comece pelo 1, siga os números em ordem e passe por todas as casas. Dá para arrastar o dedo!");
    }
    case "patches": {
      const size = { 3: 6, 5: 7, 7: 8, 9: 9 }[ch] ?? 6;
      return talk(`Ponto e nó! Novidade: a grade agora é ${size}×${size}, com peças maiores.`, "A regra é a mesma: arraste de canto a canto; o número diz quantas casas a peça tem. Comece pelos cantos!");
    }
    default: {
      const size = { 3: 6, 5: 7, 7: 8, 9: 9 }[ch] ?? 6;
      return talk(`Novidade no céu! A grade agora é ${size}×${size}, com ${size} constelações.`, "A regra é a mesma: um astro por linha, coluna e constelação, sem se encostarem. Use “Em volta”!");
    }
  }
}
export const guidedTitle = (part: GuidedPart) => (part === "base" ? "Partida guiada" : `Novidade no capítulo ${part.slice(1)}`);
