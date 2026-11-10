// Gera supabase/migrations/20261109000200_level_ref.sql (tempos de referência e mínimos de cada nível) a partir de src/lib/scoring.ts.
// Rode depois de mudar a fórmula ou os níveis:  npx vite-node scripts/gen_ranking_sql.ts
// O teste src/lib/scoring.test.ts confere que a migração do banco usa exatamente estes números.
import { writeFileSync } from "node:fs";
import { ALL_GAMES } from "../src/lib/games";
import { LEVELS_PER_GAME } from "../src/lib/journey";
import { minMs, refMs } from "../src/lib/scoring";

const rows: string[] = [];
for (const g of ALL_GAMES) for (let l = 1; l <= LEVELS_PER_GAME; l++) rows.push(`('${g}',${l},${refMs(g, l)},${minMs(g, l)})`);
writeFileSync("supabase/migrations/20261109000200_level_ref.sql", `-- GERADO por scripts/gen_ranking_sql.ts — não edite à mão.\ninsert into public.level_ref (game, level, ref_ms, min_ms) values\n${rows.join(",\n")}\non conflict (game, level) do update set ref_ms = excluded.ref_ms, min_ms = excluded.min_ms;\n`);
console.log(`${rows.length} níveis`);
