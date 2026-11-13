// Gera src/lib/cases/data.ts (o banco de mistérios do Mindloop Investigação) a partir de src/lib/cases/generate.ts.
// Rode depois de mudar a agenda (config.ts), os temas ou o gerador:  npx vite-node scripts/gen_cases.ts
// Os testes (src/lib/cases/cases.test.ts) conferem solução única, dedução sem chute e a agenda.
import { writeFileSync } from "node:fs";
import { ALL_GAMES } from "../src/lib/games";
import { generateAll } from "../src/lib/cases/generate";
import { clueText, deduce } from "../src/lib/cases/model";

const t0 = Date.now();
const cases = generateAll(ALL_GAMES);
const body = cases.map((c) => "  " + JSON.stringify(c)).join(",\n");
writeFileSync("src/lib/cases/data.ts",
  `// GERADO por scripts/gen_cases.ts — não edite à mão.\nimport type { CaseData } from "./generate";\n\nexport const CASES_DATA: CaseData[] = [\n${body},\n];\n`);
const byGame = ALL_GAMES.map((g) => `${g}: ${cases.filter((c) => c.game === g).length}`).join(", ");
console.log(`${cases.length} casos (${byGame}) em ${Date.now() - t0} ms`);
if (process.argv.includes("--show")) for (const c of cases.filter((_, i) => i % 9 === 0)) {
  console.log(`\n${c.id} d${c.difficulty} rounds=${deduce(c.model, c.clues).rounds}`);
  c.clues.forEach((k) => console.log("  - " + clueText(c.model, k)));
}
