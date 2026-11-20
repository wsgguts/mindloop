// Fotografia da LÓGICA das investigações (pistas, solução, tabuleiro e as marcações que cada pista gera no quadro).
// O teste src/lib/cases/narrative.test.ts compara o banco atual com ela: a reescrita narrativa (textos, fichas,
// nomes de objetos) nunca pode mudar a lógica. Só regere a fotografia de propósito, depois de mudar a lógica:
//   npx vite-node scripts/snapshot_cases.ts
import { writeFileSync } from "node:fs";
import { logicFingerprint } from "../src/lib/cases/narrative";
import { CASES_DATA } from "../src/lib/cases/data";

writeFileSync("src/lib/cases/logic-snapshot.json", JSON.stringify(Object.fromEntries(CASES_DATA.map((c) => [c.id, logicFingerprint(c)])), null, 0) + "\n");
console.log(`${CASES_DATA.length} casos fotografados`);
