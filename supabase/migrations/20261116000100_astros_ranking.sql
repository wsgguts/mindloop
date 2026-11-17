-- GERADO por scripts/gen_ranking_sql.ts — não edite à mão.
-- MindLoop · O Astros (jogo bônus) passa a fazer parte do ranking.
--
-- Só acrescenta: nenhum jogador, resultado, tabela, política RLS ou permissão é apagado ou recriado.
--  1. A restrição de jogo da tabela results passa a aceitar 'astros' (os resultados existentes continuam válidos).
--  2. submit_results: mesmo corpo de antes; aceita 'astros', mas SÓ de quem já tem o nível 100 das 4 jornadas
--     principais registrado — a mesma regra de desbloqueio do app (games.ts → bonusUnlocked), conferida no servidor.
--     Antes disso, os itens do Astros são ignorados em silêncio (nada é gravado; nenhum erro quebra o envio).
--  3. level_ref: tempos de referência e mínimos dos 100 níveis do Astros (mesma fórmula de src/lib/scoring.ts).
-- get_ranking não muda: o ranking geral e o ranking por jogo já somam qualquer jogo presente em results.
-- Pode ser aplicada mais de uma vez sem efeito colateral.

alter table public.results drop constraint if exists results_game_check;
alter table public.results add constraint results_game_check check (game in ('sudoku', 'zip', 'tango', 'patches', 'astros'));

create or replace function public.submit_results(p_id uuid, p_token text, p_game text, p_items jsonb) returns int
language plpgsql volatile security definer set search_path = public as $$
declare
  it record; r public.level_ref%rowtype; acc int := 0; n int; sc int;
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  if p_game not in ('sudoku', 'zip', 'tango', 'patches', 'astros') then raise exception 'BAD_GAME'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 100 then raise exception 'BAD_ITEMS'; end if;

  update public.players
     set submits_window = case when last_submit > now() - interval '1 minute' then submits_window + 1 else 1 end,
         last_submit = now()
   where id = p_id
  returning submits_window into n;
  if n > 30 then raise exception 'LIMIT'; end if;

  -- Jogo bônus: só depois das 4 jornadas principais completas (nível 100 de cada uma registrado).
  if p_game = 'astros' and (select count(distinct game) from public.results
       where player_id = p_id and level = 100 and game in ('sudoku', 'zip', 'tango', 'patches')) < 4 then
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

insert into public.level_ref (game, level, ref_ms, min_ms) values
('astros',1,50000,3750),
('astros',2,50000,3750),
('astros',3,50000,3750),
('astros',4,50000,3750),
('astros',5,55000,3750),
('astros',6,55000,3750),
('astros',7,55000,3750),
('astros',8,55000,3750),
('astros',9,55000,3750),
('astros',10,55000,3750),
('astros',11,55000,3750),
('astros',12,55000,3750),
('astros',13,55000,3750),
('astros',14,55000,3750),
('astros',15,55000,3750),
('astros',16,60000,3750),
('astros',17,60000,3750),
('astros',18,60000,3750),
('astros',19,60000,3750),
('astros',20,60000,3750),
('astros',21,85000,5400),
('astros',22,90000,5400),
('astros',23,90000,5400),
('astros',24,90000,5400),
('astros',25,90000,5400),
('astros',26,90000,5400),
('astros',27,90000,5400),
('astros',28,90000,5400),
('astros',29,95000,5400),
('astros',30,95000,5400),
('astros',31,95000,5400),
('astros',32,95000,5400),
('astros',33,95000,5400),
('astros',34,95000,5400),
('astros',35,95000,5400),
('astros',36,100000,5400),
('astros',37,100000,5400),
('astros',38,100000,5400),
('astros',39,100000,5400),
('astros',40,100000,5400),
('astros',41,140000,7350),
('astros',42,140000,7350),
('astros',43,140000,7350),
('astros',44,140000,7350),
('astros',45,140000,7350),
('astros',46,145000,7350),
('astros',47,145000,7350),
('astros',48,145000,7350),
('astros',49,145000,7350),
('astros',50,145000,7350),
('astros',51,150000,7350),
('astros',52,150000,7350),
('astros',53,150000,7350),
('astros',54,150000,7350),
('astros',55,150000,7350),
('astros',56,155000,7350),
('astros',57,155000,7350),
('astros',58,155000,7350),
('astros',59,155000,7350),
('astros',60,155000,7350),
('astros',61,205000,9600),
('astros',62,205000,9600),
('astros',63,210000,9600),
('astros',64,210000,9600),
('astros',65,210000,9600),
('astros',66,210000,9600),
('astros',67,215000,9600),
('astros',68,215000,9600),
('astros',69,215000,9600),
('astros',70,220000,9600),
('astros',71,220000,9600),
('astros',72,220000,9600),
('astros',73,220000,9600),
('astros',74,225000,9600),
('astros',75,225000,9600),
('astros',76,225000,9600),
('astros',77,225000,9600),
('astros',78,230000,9600),
('astros',79,230000,9600),
('astros',80,230000,9600),
('astros',81,295000,12150),
('astros',82,295000,12150),
('astros',83,295000,12150),
('astros',84,300000,12150),
('astros',85,300000,12150),
('astros',86,300000,12150),
('astros',87,305000,12150),
('astros',88,305000,12150),
('astros',89,305000,12150),
('astros',90,310000,12150),
('astros',91,310000,12150),
('astros',92,310000,12150),
('astros',93,315000,12150),
('astros',94,315000,12150),
('astros',95,315000,12150),
('astros',96,320000,12150),
('astros',97,320000,12150),
('astros',98,320000,12150),
('astros',99,320000,12150),
('astros',100,325000,12150)
on conflict (game, level) do update set ref_ms = excluded.ref_ms, min_ms = excluded.min_ms;
