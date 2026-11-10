-- MindLoop · Ranking online sem login (Supabase / Postgres 15+)
--
-- Segurança:
-- * RLS ligado em todas as tabelas e NENHUMA política: o navegador (chave anon/publishable) não lê nem grava
--   tabelas diretamente. Todo acesso passa pelas funções abaixo (security definer), que validam tudo.
-- * O jogador anônimo recebe um token aleatório; o banco guarda só o SHA-256 dele.
-- * O navegador envia só (jogo, nível, tempo). Os PONTOS são calculados aqui, com a tabela level_ref.
--   Tempos abaixo do mínimo plausível do nível, níveis pulados (sem o anterior) e jogos desconhecidos são recusados.
-- * O ranking devolve apenas apelido, pontos e contagens — nunca ids, tokens ou outros dados.
-- * Migração só cria objetos novos (create ... if not exists / or replace); não apaga dados existentes.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  nick text not null,
  nick_key text not null unique,           -- apelido em minúsculas: impede duplicidade (Lia = lia)
  token_hash bytea not null,
  created_at timestamptz not null default now(),
  last_submit timestamptz,
  submits_window int not null default 0    -- envios no último minuto (limite simples contra abuso)
);

create table if not exists public.level_ref (
  game text not null,
  level int not null,
  ref_ms int not null,                     -- tempo de referência do nível
  min_ms int not null,                     -- menor tempo aceito
  primary key (game, level)
);

create table if not exists public.results (
  player_id uuid not null references public.players(id) on delete cascade,
  game text not null check (game in ('sudoku', 'zip', 'tango', 'patches')),
  level int not null check (level between 1 and 100),
  best_ms int not null check (best_ms > 0),
  score int not null check (score >= 0),
  first_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, game, level)
);
create index if not exists results_game_idx on public.results (game, level);

alter table public.players enable row level security;
alter table public.level_ref enable row level security;
alter table public.results enable row level security;
revoke all on public.players, public.level_ref, public.results from anon, authenticated;

-- Apelido: 2–20 caracteres, letras/números/espaço/_ . - e sem palavras ofensivas
-- (mesma lista de src/lib/nick.ts).
create or replace function public.ml_nick_ok(p text) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  n text; j text; w text;
  parts text[] := array['caralh','bucet','porra','merda','foder','fodid','putaria','arromb','boquet','vagabund',
    'estupr','pedof','nazis','hitler','piroc','xoxot','viadinh','cuzao','retardad','babaca','desgracad','filhadaputa','fdp'];
  words text[] := array['puta','puto','foda','cu','viado','vsf','pqp','krl','nazi','otario','otaria','corno','bosta'];
begin
  if p is null then return false; end if;
  p := btrim(p);
  if char_length(p) < 2 or char_length(p) > 20 then return false; end if;
  if p !~ '^[A-Za-z0-9À-ÖØ-öø-ÿĀ-ž _.-]+$' then return false; end if;
  n := translate(lower(p), 'áàâãäåéèêëíìîïóòôõöúùûüçñ013457@$', 'aaaaaaeeeeiiiiooooouuuucnoieastas');
  j := regexp_replace(n, '[^a-z]', '', 'g');
  foreach w in array parts loop
    if position(w in j) > 0 then return false; end if;
  end loop;
  if regexp_split_to_array(n, '[^a-z]+') && words then return false; end if;
  return true;
end $$;

create or replace function public.ml_auth(p_id uuid, p_token text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.players where id = p_id and token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8')));
$$;

-- Primeira participação: cria o jogador anônimo e devolve { id, token } (o token só existe no aparelho).
create or replace function public.register_player(p_nick text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  v_id uuid;
begin
  if not public.ml_nick_ok(p_nick) then raise exception 'NICK_INVALID'; end if;
  begin
    insert into public.players (nick, nick_key, token_hash)
    values (btrim(p_nick), lower(btrim(p_nick)), sha256(convert_to(v_token, 'UTF8')))
    returning id into v_id;
  exception when unique_violation then
    raise exception 'NICK_TAKEN';
  end;
  return json_build_object('id', v_id, 'token', v_token);
end $$;

create or replace function public.rename_player(p_id uuid, p_token text, p_nick text) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  if not public.ml_nick_ok(p_nick) then raise exception 'NICK_INVALID'; end if;
  begin
    update public.players set nick = btrim(p_nick), nick_key = lower(btrim(p_nick)) where id = p_id;
  exception when unique_violation then
    raise exception 'NICK_TAKEN';
  end;
end $$;

-- Sair do ranking: apaga o jogador e todos os resultados dele.
create or replace function public.delete_player(p_id uuid, p_token text) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  delete from public.players where id = p_id;
end $$;

-- Envia os melhores tempos de um jogo: [{ "level": 1, "ms": 42000 }, ...]. Idempotente: guarda só o melhor
-- tempo de cada nível. Devolve quantos itens foram aceitos.
create or replace function public.submit_results(p_id uuid, p_token text, p_game text, p_items jsonb) returns int
language plpgsql volatile security definer set search_path = public as $$
declare
  it record; r public.level_ref%rowtype; acc int := 0; n int; sc int;
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  if p_game not in ('sudoku', 'zip', 'tango', 'patches') then raise exception 'BAD_GAME'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 100 then raise exception 'BAD_ITEMS'; end if;

  update public.players
     set submits_window = case when last_submit > now() - interval '1 minute' then submits_window + 1 else 1 end,
         last_submit = now()
   where id = p_id
  returning submits_window into n;
  if n > 30 then raise exception 'LIMIT'; end if;

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

-- Ranking. p_game null = geral (soma dos jogos × (1 + 0,05 × (jogos jogados − 1))).
-- p_band filtra a dificuldade no ranking por jogo: all | easy (1–30) | mid (31–70) | hard (71–100).
-- Devolve o top p_limit (máx. 100) e, se p_me vier preenchido, também a linha da própria pessoa.
create or replace function public.get_ranking(p_game text default null, p_band text default 'all', p_me uuid default null, p_limit int default 50)
returns table (pos int, nick text, score int, levels int, best_level int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with b as (
    select case when p_game is null then 1 when p_band = 'mid' then 31 when p_band = 'hard' then 71 else 1 end as lo,
           case when p_game is null then 100 when p_band = 'easy' then 30 when p_band = 'mid' then 70 else 100 end as hi
  ),
  per_game as (
    select r.player_id, r.game, sum(r.score) as s, count(*) as n, max(r.level) as ml
      from public.results r, b
     where (p_game is null or r.game = p_game) and r.level between b.lo and b.hi
     group by r.player_id, r.game
  ),
  tot as (
    select player_id,
           (case when p_game is null then round(sum(s) * (1 + 0.05 * (count(*) - 1))) else sum(s) end)::int as score,
           sum(n)::int as levels, max(ml)::int as best_level
      from per_game group by player_id
  ),
  ranked as (select t.*, rank() over (order by t.score desc, t.levels desc) as pos from tot t)
  select r.pos::int, p.nick, r.score, r.levels, r.best_level, coalesce(r.player_id = p_me, false)
    from ranked r join public.players p on p.id = r.player_id
   where r.pos <= least(greatest(coalesce(p_limit, 50), 1), 100) or r.player_id = p_me
   order by r.pos, p.nick;
$$;

revoke all on function public.ml_nick_ok(text), public.ml_auth(uuid, text) from public, anon, authenticated;
revoke all on function public.register_player(text), public.rename_player(uuid, text, text), public.delete_player(uuid, text),
  public.submit_results(uuid, text, text, jsonb), public.get_ranking(text, text, uuid, int) from public;
grant execute on function public.register_player(text), public.rename_player(uuid, text, text), public.delete_player(uuid, text),
  public.submit_results(uuid, text, text, jsonb), public.get_ranking(text, text, uuid, int) to anon, authenticated;
