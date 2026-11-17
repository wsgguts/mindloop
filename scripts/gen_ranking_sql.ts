// Gera as migrações com os tempos de referência e mínimos de cada nível a partir de src/lib/scoring.ts:
//   supabase/migrations/20261109000200_level_ref.sql   — os 4 jogos principais (já aplicada; o conteúdo não muda)
//   supabase/migrations/20261116000100_astros_ranking.sql — o Astros (jogo bônus) entra no ranking
// Rode depois de mudar a fórmula ou os níveis:  npx vite-node scripts/gen_ranking_sql.ts
// O teste src/lib/scoring.test.ts confere que as migrações do banco usam exatamente estes números.
import { writeFileSync } from "node:fs";
import { ALL_GAMES, BONUS_GAME } from "../src/lib/games";
import { LEVELS_PER_GAME, type JourneyGame } from "../src/lib/journey";
import { minMs, refMs } from "../src/lib/scoring";

const rowsOf = (games: JourneyGame[]) => {
  const rows: string[] = [];
  for (const g of games) for (let l = 1; l <= LEVELS_PER_GAME; l++) rows.push(`('${g}',${l},${refMs(g, l)},${minMs(g, l)})`);
  return rows;
};
const insert = (rows: string[]) =>
  `insert into public.level_ref (game, level, ref_ms, min_ms) values\n${rows.join(",\n")}\non conflict (game, level) do update set ref_ms = excluded.ref_ms, min_ms = excluded.min_ms;\n`;

const main = rowsOf(ALL_GAMES);
writeFileSync("supabase/migrations/20261109000200_level_ref.sql", `-- GERADO por scripts/gen_ranking_sql.ts — não edite à mão.\n${insert(main)}`);

const bonus = rowsOf([BONUS_GAME]);
const games = [...ALL_GAMES, BONUS_GAME].map((g) => `'${g}'`).join(", ");
const mains = ALL_GAMES.map((g) => `'${g}'`).join(", ");
writeFileSync("supabase/migrations/20261116000100_astros_ranking.sql", `-- GERADO por scripts/gen_ranking_sql.ts — não edite à mão.
-- MindLoop · O Astros (jogo bônus) passa a fazer parte do ranking.
--
-- Só acrescenta: nenhum jogador, resultado, tabela, política RLS ou permissão é apagado ou recriado.
--  1. A restrição de jogo da tabela results passa a aceitar '${BONUS_GAME}' (os resultados existentes continuam válidos).
--  2. submit_results: mesmo corpo de antes; aceita '${BONUS_GAME}', mas SÓ de quem já tem o nível 100 das 4 jornadas
--     principais registrado — a mesma regra de desbloqueio do app (games.ts → bonusUnlocked), conferida no servidor.
--     Antes disso, os itens do Astros são ignorados em silêncio (nada é gravado; nenhum erro quebra o envio).
--  3. level_ref: tempos de referência e mínimos dos 100 níveis do Astros (mesma fórmula de src/lib/scoring.ts).
-- get_ranking não muda: o ranking geral e o ranking por jogo já somam qualquer jogo presente em results.
-- Pode ser aplicada mais de uma vez sem efeito colateral.

alter table public.results drop constraint if exists results_game_check;
alter table public.results add constraint results_game_check check (game in (${games}));

create or replace function public.submit_results(p_id uuid, p_token text, p_game text, p_items jsonb) returns int
language plpgsql volatile security definer set search_path = public as $$
declare
  it record; r public.level_ref%rowtype; acc int := 0; n int; sc int;
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  if p_game not in (${games}) then raise exception 'BAD_GAME'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 100 then raise exception 'BAD_ITEMS'; end if;

  update public.players
     set submits_window = case when last_submit > now() - interval '1 minute' then submits_window + 1 else 1 end,
         last_submit = now()
   where id = p_id
  returning submits_window into n;
  if n > 30 then raise exception 'LIMIT'; end if;

  -- Jogo bônus: só depois das 4 jornadas principais completas (nível 100 de cada uma registrado).
  if p_game = '${BONUS_GAME}' and (select count(distinct game) from public.results
       where player_id = p_id and level = 100 and game in (${mains})) < ${ALL_GAMES.length} then
    return 0;
  end if;

  for it in
    select (e->>'level')::int as level, (e->>'ms')::int as ms
      from jsonb_array_elements(p_items) e
     where jsonb_typeof(e->'level') = 'number' and jsonb_typeof(e->'ms') = 'number'
     order by 1
  loop
    select * into r from public.level_ref where game = p_game and level = it.level;
    continue when not found;
    continue when it.ms < r.min_ms or it.ms > 86400000;                     -- tempo impossível
    continue when it.level > 1 and not exists (                              -- nível pulado
      select 1 from public.results where player_id = p_id and game = p_game and level = it.level - 1);
    sc := round((1 + 2 * (it.level - 1) / 99.0) * (100 + 100 * least(1, r.ref_ms::numeric / it.ms)));
    insert into public.results as x (player_id, game, level, best_ms, score)
    values (p_id, p_game, it.level, it.ms, sc)
    on conflict (player_id, game, level) do update
      set best_ms = excluded.best_ms, score = excluded.score, updated_at = now()
      where x.best_ms > excluded.best_ms;
    acc := acc + 1;
  end loop;
  return acc;
end $$;

-- Mesmas permissões de antes (create or replace preserva os grants; repetidos aqui por clareza).
revoke all on function public.submit_results(uuid, text, text, jsonb) from public;
grant execute on function public.submit_results(uuid, text, text, jsonb) to anon, authenticated;

${insert(bonus)}`);
console.log(`${main.length} + ${bonus.length} níveis`);
