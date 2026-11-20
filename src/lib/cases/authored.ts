// Mindloop Investigação — casos escritos À MÃO (fácil de editar).
// Um caso daqui entra no banco no lugar do caso gerado com o mesmo id, e passa pelas MESMAS conferências
// (generate.ts → checkCase, e os testes): solução única, todas as pistas necessárias, resolvível na ordem só com
// marcações diretas + "última opção", de 5 a 7 pistas e todos os personagens citados.
//
// Como escrever um caso:
//   • model: o lugar (cômodos, móveis que bloqueiam casas), os personagens e os objetos;
//   • clues: a regra do lugar ({ k: "rule" }) e as pistas, na ordem em que aparecem (tipos em model.ts → PosClue);
//   • texts: o texto de cada pista (sem a regra), escrito como depoimento ou achado;
//   • sol: a resposta (casa de cada pessoa, depois o objeto de cada pessoa).
// A história (introdução, pergunta e desfecho) fica em stories/*.ts, pela chave `story`.

import type { CaseData } from "./generate";

export const AUTHORED: Record<string, CaseData> = {
  // Mini Sudoku · capítulo 4 (Templo das Estrelas) — a versão aprovada que serviu de modelo para as outras.
  "sudoku-33": {
    id: "sudoku-33", game: "sudoku", level: 33, chapter: 4, difficulty: 2, story: "guardioes-templo", structure: "regioes",
    model: {
      rule: "regioes", rows: 4, cols: 4,
      people: [{ label: "Nimbo", g: "m" }, { label: "Mel", g: "f" }, { label: "Neve", g: "f" }, { label: "Vulto", g: "m" }],
      objects: [{ label: "Sino de Prata", g: "m", icon: "🔔" }, { label: "Pergaminho", g: "m", icon: "📜" }, { label: "Incensário", g: "m", icon: "🪔" }, { label: "Cajado", g: "m", icon: "🦯" }],
      scene: {
        // Torre do Sino (A1–B2) · Altar da Lua (C1–D2) · Claustro (A3–B4) · Nave Estelar (C3–D4)
        room: [0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 2, 2, 3, 3],
        rooms: [{ label: "Torre do Sino", g: "f" }, { label: "Altar da Lua", g: "m" }, { label: "Claustro", g: "m" }, { label: "Nave Estelar", g: "f" }],
        props: [{ cell: 6, label: "Estátua Antiga", g: "f", icon: "🗿", block: true }, { cell: 12, label: "Fonte Sagrada", g: "f", icon: "⛲", block: true }],
      },
    },
    clues: [
      { k: "rule" },
      { k: "row", s: 2, r: 0 },   // Neve × Linha 1
      { k: "room", s: 3, r: 0 },  // Vulto × Torre do Sino
      { k: "col", s: 1, c: 0 },   // Mel × Coluna A
      { k: "col", s: 0, c: 3 },   // Nimbo × Coluna D
      { k: "has", s: 0, o: 3 },   // Nimbo × Cajado
      { k: "has", s: 2, o: 2 },   // Neve × Incensário
      { k: "hasNot", s: 1, o: 0 }, // Mel ✗ Sino de Prata
    ],
    texts: [
      "O sineiro jura: “A Neve estava lá no alto, na linha 1.”",
      "O vigia conta: “O Vulto não saiu da Torre do Sino nem por um segundo.”",
      "Pegadas de mel no chão: a Mel estava na coluna A.",
      "Um rastro de vapor mostra o Nimbo colado à parede leste, na coluna D.",
      "O Nimbo segurava o Cajado.",
      "Cheiro de incenso no cabelo da Neve: ela estava com o Incensário.",
      "A Mel morre de medo de barulho: ela não segurava o Sino de Prata.",
    ],
    // Nimbo D4 · Mel A3 · Neve C1 · Vulto B2 — Cajado, Pergaminho, Incensário, Sino de Prata.
    sol: [15, 8, 2, 5, 3, 1, 2, 0],
  },
};
