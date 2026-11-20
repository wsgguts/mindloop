// Conferência dos textos narrativos: cada pista diz, com clareza, a mesma informação lógica; o desfecho conta a solução.
// Usado por narrative.test.ts (e por quem escreve narrativas novas: npx vite-node scripts/check_narratives.ts <jogo>).
import type { Case } from "./catalog";
import { COLS, SIDE_NAMES, type Clue, type Model } from "./model";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A palavra aparece inteira (o "Vi" não conta dentro de "Vigília"). */
const has = (text: string, word: string) => new RegExp(`(?<![\\p{L}])${esc(word)}(?![\\p{L}])`, "u").test(text);
const NEG = /(?<![\p{L}])(não|nunca|jamais|nem|ninguém|nenhum|nenhuma|sem)(?![\p{L}])/iu;
export const sentences = (t: string) => t.split(/(?<=[.!?…][”"»]?)\s+(?=[\p{Lu}“"«—])/u).filter((s) => s.trim());

/** O que o texto da pista precisa dizer, além do nome das pessoas e objetos. */
function tokens(m: Model, c: Clue): string[] {
  switch (c.k) {
    case "row": case "notRow": return [`linha ${c.r + 1}`];
    case "col": case "notCol": return [`coluna ${COLS[c.c]}`];
    case "room": case "notRoom": return [m.scene.rooms[c.r].label];
    case "side": return [SIDE_NAMES[c.r]];
    case "stop": case "notStop": return [`${c.n + 1}ª parada`];
    case "stopAfter": return [`depois da ${c.n + 1}ª parada`];
    case "stopBefore": return [`antes da ${c.n + 1}ª parada`];
    case "size": return [`${c.n} casas`];
    case "next": return ["logo depois"];
    case "sameSide": return ["mesmo lado"];
    case "oppSide": return ["lado oposto"];
    default: return [];
  }
}
const NEGATIVE = new Set(["notRow", "notCol", "notRoom", "notStop", "hasNot"]);
const people = (c: Clue): number[] => ("a" in c ? [c.a, c.b] : "s" in c ? [c.s] : []);

type C = Case;
export function clueProblems(cases: C[]): string[] {
  const out: string[] = [];
  for (const c of cases) {
    const m = c.model;
    c.clues.forEach((k, i) => {
      const t = c.clueTexts[i], tag = `${c.id} P${i + 1} [${k.k}] ${t}`;
      const ps = people(k);
      for (const s of ps) if (!has(t, m.people[s].label)) out.push(`${tag} — falta ${m.people[s].label}`);
      for (const [s, p] of m.people.entries()) if (!ps.includes(s) && has(t, p.label)) out.push(`${tag} — cita outra pessoa (${p.label})`);
      for (const w of tokens(m, k)) if (!t.includes(w)) out.push(`${tag} — falta "${w}"`);
      const objs = k.k === "has" || k.k === "hasNot" ? [k.o] : [];
      for (const [o, ob] of m.objects.entries()) if (t.includes(ob.label) !== objs.includes(o)) out.push(`${tag} — objeto ${ob.label}`);
      // Só cita lugares da própria pista (o cômodo; no Tango, o lado — que também é um lugar da história).
      const own = k.k === "room" || k.k === "notRoom" || k.k === "side" ? k.r : -1;
      m.scene.rooms.forEach((r, i) => { if (i !== own && t.includes(r.label)) out.push(`${tag} — cita o lugar ${r.label}`); });
      if (NEGATIVE.has(k.k) && !NEG.test(t)) out.push(`${tag} — precisa negar`);
    });
  }
  return out;
}
export function endingProblems(cases: C[]): string[] {
  const out: string[] = [];
  for (const c of cases) {
    const m = c.model, n = m.people.length, end = c.ending;
    for (const p of m.people) if (!has(end, p.label)) out.push(`${c.id} desfecho sem ${p.label}`);
    for (const o of m.objects) if (!end.includes(o.label)) out.push(`${c.id} desfecho sem ${o.label}`);
    for (const s of sentences(end)) {
      const ps = m.people.map((p, i) => (has(s, p.label) ? i : -1)).filter((i) => i >= 0);
      if (ps.length !== 1) continue;
      const os = m.objects.map((o, i) => (s.includes(o.label) ? i : -1)).filter((i) => i >= 0);
      if (os.length === 1 && c.answer[n + ps[0]] !== os[0]) out.push(`${c.id} objeto errado: "${s}"`);
      const rs = m.scene.rooms.map((r, i) => (s.includes(r.label) ? i : -1)).filter((i) => i >= 0);
      if (rs.length === 1 && m.scene.room[c.answer[ps[0]]] !== rs[0]) out.push(`${c.id} lugar errado: "${s}"`);
    }
  }
  return out;
}

