// Mindloop Investigação — a NARRATIVA de cada caso, separada da lógica.
// Os textos ficam em narrative/<jogo>.ts (fáceis de editar), um por investigação (pelo id do caso):
//   • ambientação (1 frase), introdução (2–4 frases), desfecho (3–5 frases);
//   • ficha dos personagens: por que estava ali e a ligação com um objeto ou outro personagem
//     (a personalidade vem do elenco, cast.ts, e é a mesma em todos os casos);
//   • ficha dos objetos, na MESMA ordem dos objetos do caso: nome, descrição, papel na história e por que existe
//     naquele lugar (o nome pode mudar: a lógica só usa a posição do objeto);
//   • o texto de cada pista, na mesma ordem das pistas, com a mesma informação lógica.
// Nada aqui muda a lógica: o teste narrative.test.ts compara a "impressão digital" da lógica de cada caso
// (pistas, solução, tabuleiro e marcações) com logic-snapshot.json e confere que cada texto de pista cita
// claramente a pessoa, o lugar/valor e o objeto da pista.

import type { CaseData } from "./generate";
import { runLogic } from "./logic";

/** Papel do objeto na história. */
export type ObjectRole = "chave" | "prova" | "ferramenta" | "distração" | "devolver" | "presente";
export const ROLE_LABEL: Record<ObjectRole, string> = {
  chave: "A chave do mistério", prova: "A prova", ferramenta: "A ferramenta", distração: "A distração", devolver: "Precisa ser devolvido", presente: "O presente",
};

export interface NarrativeObject { label: string; icon?: string; desc: string; role: ObjectRole; place: string }
export interface NarrativePerson { why: string; link: string }
export interface Narrative {
  title?: string;
  /** Ambientação: 1 frase. */
  scene: string;
  /** Introdução: 2–4 frases (o que aconteceu, o que está em jogo, por que descobrir lugar e objeto resolve). */
  intro: string;
  goal?: string;
  /** Ficha de cada personagem, pelo nome. */
  people: Record<string, NarrativePerson>;
  /** Ficha de cada objeto, na ordem dos objetos do caso. */
  objects: NarrativeObject[];
  /** Texto de cada pista (sem a regra), na ordem em que aparecem. */
  clues: string[];
  /** Desfecho: 3–5 frases, usando a solução. */
  ending: string;
}

/** Nome curto de um objeto para o cabeçalho estreito da grade: a primeira palavra, quando o nome é longo e ela já
 *  distingue o objeto dos outros do caso ("Mala de Viagem do Século" → "Mala"); senão, o nome inteiro. */
export function shortLabel(labels: string[], i: number): string {
  const l = labels[i];
  if (l.length <= 12) return l;
  const first = (s: string) => s.split(" ")[0];
  const f = first(l);
  return f.length >= 4 && labels.every((x, j) => j === i || first(x) !== f) ? f : l;
}

/** Impressão digital da LÓGICA de um caso: pistas, solução, tabuleiro e as marcações que cada pista gera. */
export function logicFingerprint(c: CaseData): string {
  const m = c.model;
  const steps = runLogic(m, c.clues).steps.map((s) => [s.clue, s.marks.map((x) => [x.d, x.s, x.v, x.yes ? 1 : 0]), s.concl.map((x) => [x.d, x.s, x.v, x.why])]);
  const logic = JSON.stringify({
    clues: c.clues, sol: c.sol, rule: m.rule, rows: m.rows, cols: m.cols, room: m.scene.room, rooms: m.scene.rooms.length,
    blocks: m.scene.props.filter((p) => p.block).map((p) => p.cell), trail: m.trail ?? null, n: m.people.length, o: m.objects.length, steps,
  });
  // cyrb53: hash curto e estável (não é segurança, só comparação).
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < logic.length; i++) { const ch = logic.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
