// Gera src/lib/cases/data.ts (o banco de mistérios do Mindloop Investigação) a partir de src/lib/cases/generate.ts.
// Rode depois de mudar a agenda (config.ts), as histórias (stories/*.ts), as estruturas ou o gerador:
//   npx vite-node scripts/gen_cases.ts          (gera e mostra o resumo por jogo)
//   npx vite-node scripts/gen_cases.ts --show   (mostra também as pistas de alguns casos)
// Os testes (src/lib/cases/*.test.ts) conferem solução única, dedução sem chute, agenda e variedade.
import { writeFileSync } from "node:fs";
import { EVERY_GAME } from "../src/lib/games";
import { REJECTS, clueCount, generateAll } from "../src/lib/cases/generate";
import { clueText, deduce, posList } from "../src/lib/cases/model";
import { STRUCTURES } from "../src/lib/cases/structures";

const t0 = Date.now();
const cases = generateAll(EVERY_GAME);
const body = cases.map((c) => "  " + JSON.stringify(c)).join(",\n");
writeFileSync("src/lib/cases/data.ts",
  `// GERADO por scripts/gen_cases.ts — não edite à mão.\nimport type { CaseData } from "./generate";\n\nexport const CASES_DATA: CaseData[] = [\n${body},\n];\n`);
console.log(`${cases.length} casos em ${Date.now() - t0} ms`);
for (const g of EVERY_GAME) {
  const cs = cases.filter((c) => c.game === g);
  console.log(`\n${g}: ${cs.map((c) => STRUCTURES[c.structure].name).join(" · ")}`);
  console.log(`  pistas: ${cs.map((c) => clueCount(c.clues)).join(" ")}   etapas: ${cs.map((c) => deduce(c.model, c.clues).rounds).join(" ")}   posições: ${cs.map((c) => posList(c.model).length).join(" ")}`);
}
console.log("\ndescartes:", JSON.stringify(REJECTS));
if (process.argv.includes("--show")) for (const c of cases.filter((_, i) => i % 7 === 0)) {
  console.log(`\n${c.id} d${c.difficulty} ${c.structure} ${c.model.rows}×${c.model.cols}`);
  c.clues.forEach((k) => console.log("  - " + clueText(c.model, k)));
}
