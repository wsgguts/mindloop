// Gera src/lib/cases/data.ts (o banco de mistérios do Mindloop Investigação) a partir de src/lib/cases/generate.ts.
// Rode depois de mudar a agenda (config.ts), as histórias (stories/*.ts), os casos escritos à mão (authored.ts),
// as estruturas ou o gerador:
//   npx vite-node scripts/gen_cases.ts            (gera e mostra o resumo por jogo)
//   npx vite-node scripts/gen_cases.ts sudoku     (só mostra o resumo de um jogo, sem gravar)
// Os testes (src/lib/cases/*.test.ts) conferem solução única, pistas necessárias, dedução sem chute e a agenda.
// A tabela "pista → marcações" de todos os casos sai de scripts/validate_cases.ts.
import { writeFileSync } from "node:fs";
import { EVERY_GAME } from "../src/lib/games";
import type { JourneyGame } from "../src/lib/journey";
import { REJECTS, clueCount, generateAll, generateGame } from "../src/lib/cases/generate";
import { runLogic } from "../src/lib/cases/logic";
import { STRUCTURES } from "../src/lib/cases/structures";

const only = process.argv[2] as JourneyGame | undefined;
const t0 = Date.now();
const cases = only ? generateGame(only) : generateAll(EVERY_GAME);
if (!only) {
  const body = cases.map((c) => "  " + JSON.stringify(c)).join(",\n");
  writeFileSync("src/lib/cases/data.ts",
    `// GERADO por scripts/gen_cases.ts — não edite à mão (casos escritos à mão ficam em authored.ts).\nimport type { CaseData } from "./generate";\n\nexport const CASES_DATA: CaseData[] = [\n${body},\n];\n`);
}
console.log(`${cases.length} casos em ${Date.now() - t0} ms`);
for (const g of only ? [only] : EVERY_GAME) {
  const cs = cases.filter((c) => c.game === g);
  console.log(`\n${g}: ${cs.map((c) => STRUCTURES[c.structure].name).join(" · ")}`);
  console.log(`  pistas: ${cs.map((c) => clueCount(c.clues)).join(" ")}`);
  console.log(`  conclusões pelo raciocínio: ${cs.map((c) => runLogic(c.model, c.clues).steps.flatMap((s) => s.concl).filter((x) => x.why !== "pista").length).join(" ")}`);
}
console.log("\ndescartes:", JSON.stringify(REJECTS));
