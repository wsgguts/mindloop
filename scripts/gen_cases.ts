// Gera src/lib/cases/data.ts (o banco de mistérios do Mindloop Investigação) a partir de src/lib/cases/generate.ts.
// Rode depois de mudar a agenda (config.ts), as histórias (stories/*.ts), as estruturas ou o gerador:
//   npx vite-node scripts/gen_cases.ts          (gera e mostra o resumo por jogo)
//   npx vite-node scripts/gen_cases.ts --show   (mostra também as pistas de alguns casos)
// Os testes (src/lib/cases/*.test.ts) conferem solução única, dedução sem chute, agenda e variedade.
import { writeFileSync } from "node:fs";
import { ALL_GAMES } from "../src/lib/games";
import { clueCount, generateAll } from "../src/lib/cases/generate";
import { clueText, deduce } from "../src/lib/cases/model";
import { STRUCTURES } from "../src/lib/cases/structures";

const t0 = Date.now();
const cases = generateAll(ALL_GAMES);
const body = cases.map((c) => "  " + JSON.stringify(c)).join(",\n");
writeFileSync("src/lib/cases/data.ts",
  `// GERADO por scripts/gen_cases.ts — não edite à mão.\nimport type { CaseData } from "./generate";\n\nexport const CASES_DATA: CaseData[] = [\n${body},\n];\n`);
const byGame = ALL_GAMES.map((g) => `${g}: ${cases.filter((c) => c.game === g).length}`).join(", ");
console.log(`${cases.length} casos (${byGame}) em ${Date.now() - t0} ms`);
for (const g of ALL_GAMES) {
  const cs = cases.filter((c) => c.game === g);
  const st = Object.keys(STRUCTURES).map((s) => [STRUCTURES[s as keyof typeof STRUCTURES].name, cs.filter((c) => c.structure === s).length] as const).filter(([, n]) => n);
  console.log(`\n${g}: ${st.map(([n, k]) => `${n} ${k}`).join(" · ")}`);
  console.log(`  pistas: ${cs.map((c) => clueCount(c.clues)).join(" ")}`);
  console.log(`  etapas: ${cs.map((c) => deduce(c.model, c.clues).rounds).join(" ")}`);
}
if (process.argv.includes("--show")) for (const c of cases.filter((_, i) => i % 9 === 0)) {
  console.log(`\n${c.id} d${c.difficulty} ${c.structure} rounds=${deduce(c.model, c.clues).rounds}`);
  c.clues.forEach((k) => console.log("  - " + clueText(c.model, k)));
}
