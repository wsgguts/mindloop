// Lista, de uma vez, os problemas das narrativas de um jogo (pista ↔ informação lógica, desfecho ↔ solução, frases,
// objetos repetidos). Uso: npx vite-node scripts/check_narratives.ts <sudoku|tango|zip|patches|astros>
import { allCases } from "../src/lib/cases/catalog";
import { NARRATIVES } from "../src/lib/cases/narrativas";
import { clueProblems, endingProblems } from "../src/lib/cases/narrative-check";
const g = process.argv[2];
const cs = allCases().filter((c) => c.game === g && NARRATIVES[c.id]);
console.log(cs.length, "casos");
const seen = new Map<string, string>();
for (const [id, n] of Object.entries(NARRATIVES)) for (const o of n.objects) { const k = o.label.toLowerCase(); if (seen.has(k)) console.log("REPETIDO", o.label, id, seen.get(k)); seen.set(k, id); }
const split = (t: string) => t.split(/(?<=[.!?…][”"»]?)\s+(?=[\p{Lu}“"«—])/u).length;
for (const c of cs) { const n = NARRATIVES[c.id]; const a = split(n.intro), b = split(n.ending), s = split(n.scene); if (a < 2 || a > 4 || b < 3 || b > 5 || s !== 1) console.log(c.id, "frases", s, a, b); if (n.clues.length !== c.clues.length) console.log(c.id, "nº pistas", n.clues.length, c.clues.length); }
for (const p of [...clueProblems(cs), ...endingProblems(cs)]) console.log(p);
