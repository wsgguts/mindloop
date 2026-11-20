// Verificador das investigações: para CADA caso confere
//   • solução única (força bruta sobre todas as respostas possíveis);
//   • todas as pistas necessárias (sem qualquer uma delas, a solução deixa de ser única);
//   • solução alcançável só com marcações diretas das pistas, NA ORDEM, + "última opção" nas grades (sem chute);
//   • toda pista gera ao menos um ✓; de 5 a 7 pistas; todo personagem citado.
// e escreve docs/INVESTIGACOES_PISTAS.md com a tabela "pista → marcações → conclusões" de todos os casos.
//   npx vite-node scripts/validate_cases.ts
// Sai com erro (código 1) se algum caso falhar.
import { mkdirSync, writeFileSync } from "node:fs";
import { allCases, conclText } from "../src/lib/cases/catalog";
import { CASES_DATA } from "../src/lib/cases/data";
import { checkCase } from "../src/lib/cases/generate";
import { GAME_META } from "../src/lib/games";

const out: string[] = [
  "# Investigações — pista → marcações",
  "",
  "Gerado por `scripts/validate_cases.ts` (não edite à mão). Para cada investigação: as pistas na ordem em que aparecem,",
  "a grade que cada uma afeta, as marcações diretas que ela gera (✓ / ✗) e as conclusões que aparecem em seguida",
  "(pela própria pista, pelo tabuleiro ligando as grades ou pela \"última opção\").",
  "",
];
let bad = 0;
for (const c of allCases()) {
  const d = CASES_DATA.find((x) => x.id === c.id)!;
  const problem = checkCase(d);
  if (problem) { bad++; console.log(`✗ ${c.id}: ${problem}`); }
  const m = c.model;
  const name = (s: number) => m.people[s].label;
  out.push(`## ${c.id} · ${c.title}`, "", `${GAME_META[c.game].name} · capítulo ${c.chapter} · ${c.difficultyLabel} · ${c.structureName} · ${c.clues.length} pistas · ${problem ? `**FALHOU: ${problem}**` : "solução única, todas as pistas necessárias, resolvível na ordem sem chute"}`, "");
  out.push("| # | Grade | Pista | Marcações diretas | Conclusões |", "|---|---|---|---|---|");
  for (const st of c.trace) {
    const dim = c.dims[c.clueDims[st.clue]];
    const marks = st.marks.map((x) => `${name(x.s)} × ${c.dims[x.d].values[x.v].short} ${x.yes ? "✓" : "✗"}`).join("; ");
    const concl = st.concl.map((x) => conclText(m, c.dims, x)).join(" ");
    out.push(`| ${st.clue + 1} | ${dim.icon} ${dim.title} | ${c.clueTexts[st.clue].replace(/\|/g, "/")} | ${marks} | ${concl} |`);
  }
  const n = m.people.length;
  out.push("", `**Solução:** ${m.people.map((p, i) => `${p.label} — ${m.scene.rooms[m.scene.room[c.answer[i]]].label} (${m.rule === "comodos" ? "cômodo" : m.trail ? `parada ${m.trail.indexOf(c.answer[i]) + 1}` : `casa ${"ABCDEF"[c.answer[i] % m.cols]}${Math.floor(c.answer[i] / m.cols) + 1}`}), ${m.objects[c.answer[n + i]].label}`).join(" · ")}`, "");
}
mkdirSync("docs", { recursive: true });
writeFileSync("docs/INVESTIGACOES_PISTAS.md", out.join("\n") + "\n");
console.log(`${allCases().length} investigações conferidas · ${bad} com problema · tabela em docs/INVESTIGACOES_PISTAS.md`);
if (bad) process.exit(1);
