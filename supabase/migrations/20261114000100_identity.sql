-- MindLoop · Identidade anônima persistente, progresso no servidor, recuperação e reinício (Supabase / Postgres 15+)
--
-- Problema corrigido: a identidade do jogador existia só no navegador. Ao limpar os dados do site, o aparelho
-- perdia o token, mas o jogador continuava no banco segurando o apelido — e não havia como voltar a ele.
--
-- O que esta migração faz (só ACRESCENTA; nenhum dado existente é apagado ou alterado):
-- * players.listed: aparece ou não no ranking. Jogadores existentes continuam listados (default true).
-- * players.recovery_hash: SHA-256 do CÓDIGO DE RECUPERAÇÃO (o código em si só existe com a pessoa).
-- * player_tokens: um jogador pode ter vários aparelhos (cada um com seu token). O token antigo de players
--   continua valendo, então ninguém que já jogava perde o acesso.
-- * player_state: o progresso completo do jogador (jornadas, tempos, histórico, conquistas, investigações) em
--   JSON, com número de revisão para nunca sobrescrever uma versão mais nova sem antes mesclar.
-- * Funções: create_player, issue_recovery, recover_player, load_state, save_state, set_listed, reset_player.
--   get_ranking passa a mostrar só jogadores listados; delete_player e register_player continuam existindo.
--
-- Segurança (igual à migração do ranking): RLS ligado e sem políticas; o navegador só chama estas funções,
-- que validam o token. Nenhuma função devolve ids de outros jogadores, tokens ou hashes. Recuperar exige o
-- código (80 bits aleatórios); um apelido sozinho nunca dá acesso a um jogador.

alter table public.players add column if not exists listed boolean not null default true;
alter table public.players add column if not exists recovery_hash bytea;
alter table public.players add column if not exists last_seen timestamptz;
create unique index if not exists players_recovery_idx on public.players (recovery_hash) where recovery_hash is not null;

create table if not exists public.player_tokens (
  player_id uuid not null references public.players(id) on delete cascade,
  token_hash bytea not null,
  created_at timestamptz not null default now(),
  primary key (player_id, token_hash)
);

create table if not exists public.player_state (
  player_id uuid primary key references public.players(id) on delete cascade,
  data jsonb not null,
  rev int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.player_tokens enable row level security;
alter table public.player_state enable row level security;
revoke all on public.player_tokens, public.player_state from anon, authenticated;

-- Autenticação: o token original (players.token_hash) ou qualquer token de aparelho (player_tokens).
create or replace function public.ml_auth(p_id uuid, p_token text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.players where id = p_id and token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8')))
      or exists (select 1 from public.player_tokens where player_id = p_id and token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8')));
$$;

-- Código de recuperação legível: 16 caracteres sem letras/números ambíguos (sem I, O, 0, 1), em 4 grupos.
create or replace function public.ml_new_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  hex text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  code text := '';
  i int;
begin
  for i in 0..15 loop
    code := code || substr(alphabet, (('x' || substr(hex, i * 4 + 1, 2))::bit(8)::int % 32) + 1, 1);
  end loop;
  return substr(code, 1, 4) || '-' || substr(code, 5, 4) || '-' || substr(code, 9, 4) || '-' || substr(code, 13, 4);
end $$;

-- Normaliza o que a pessoa digitou (minúsculas, espaços, hífens) antes de comparar.
create or replace function public.ml_code_hash(p_code text) returns bytea
language sql immutable set search_path = public as $$
  select sha256(convert_to(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), 'UTF8'));
$$;

-- Novo jogador anônimo: devolve { id, token, recovery }. listed = participar do ranking.
create or replace function public.create_player(p_nick text, p_listed boolean default true) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  v_code text := public.ml_new_code();
  v_id uuid;
begin
  if not public.ml_nick_ok(p_nick) then raise exception 'NICK_INVALID'; end if;
  begin
    insert into public.players (nick, nick_key, token_hash, listed, recovery_hash, last_seen)
    values (btrim(p_nick), lower(btrim(p_nick)), sha256(convert_to(v_token, 'UTF8')), coalesce(p_listed, true), public.ml_code_hash(v_code), now())
    returning id into v_id;
  exception when unique_violation then
    raise exception 'NICK_TAKEN';
  end;
  return json_build_object('id', v_id, 'token', v_token, 'recovery', v_code);
end $$;

-- Gera (ou troca) o código de recuperação de um jogador já existente. O código anterior deixa de valer.
create or replace function public.issue_recovery(p_id uuid, p_token text) returns text
language plpgsql volatile security definer set search_path = public as $$
declare v_code text := public.ml_new_code();
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  update public.players set recovery_hash = public.ml_code_hash(v_code) where id = p_id;
  return v_code;
end $$;

-- Recupera o jogador num aparelho novo (ou depois de limpar os dados do navegador): só com o código.
-- Cria um token novo para este aparelho e devolve { id, token, nick, listed }. Código errado: BAD_CODE.
create or replace function public.recover_player(p_code text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  p public.players%rowtype;
begin
  if char_length(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')) <> 16 then raise exception 'BAD_CODE'; end if;
  select * into p from public.players where recovery_hash = public.ml_code_hash(p_code);
  if not found then
    perform pg_sleep(0.4); -- desacelera tentativas
    raise exception 'BAD_CODE';
  end if;
  insert into public.player_tokens (player_id, token_hash) values (p.id, sha256(convert_to(v_token, 'UTF8')));
  update public.players set last_seen = now() where id = p.id;
  return json_build_object('id', p.id, 'token', v_token, 'nick', p.nick, 'listed', p.listed);
end $$;

-- Progresso guardado no servidor: { data, rev, nick, listed } (data = null se ainda não houver nada salvo).
create or replace function public.load_state(p_id uuid, p_token text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare v json;
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  update public.players set last_seen = now() where id = p_id;
  select json_build_object('data', s.data, 'rev', coalesce(s.rev, 0), 'nick', p.nick, 'listed', p.listed) into v
    from public.players p left join public.player_state s on s.player_id = p.id
   where p.id = p_id;
  return v;
end $$;

-- Salva o progresso. p_rev é a revisão que o aparelho leu por último: se o servidor já tem uma mais nova,
-- responde STALE (o aparelho baixa, mescla e tenta de novo) — assim nada é sobrescrito às cegas.
create or replace function public.save_state(p_id uuid, p_token text, p_data jsonb, p_rev int) returns int
language plpgsql volatile security definer set search_path = public as $$
declare cur int; n int;
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 1500000 then raise exception 'BAD_STATE'; end if;
  update public.players
     set submits_window = case when last_submit > now() - interval '1 minute' then submits_window + 1 else 1 end,
         last_submit = now(), last_seen = now()
   where id = p_id
  returning submits_window into n;
  if n > 30 then raise exception 'LIMIT'; end if;
  select rev into cur from public.player_state where player_id = p_id for update;
  if not found then
    insert into public.player_state (player_id, data, rev) values (p_id, p_data, 1);
    return 1;
  end if;
  if coalesce(p_rev, -1) <> cur then raise exception 'STALE'; end if;
  update public.player_state set data = p_data, rev = cur + 1, updated_at = now() where player_id = p_id;
  return cur + 1;
end $$;

-- Entrar / sair do ranking sem apagar nada.
create or replace function public.set_listed(p_id uuid, p_token text, p_listed boolean) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  update public.players set listed = coalesce(p_listed, false) where id = p_id;
end $$;

-- Reiniciar o jogo: apaga o jogador e TUDO dele numa única transação (resultados, progresso, aparelhos —
-- tudo por "on delete cascade"). O apelido fica livre de novo. Outros jogadores não são tocados.
create or replace function public.reset_player(p_id uuid, p_token text) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.ml_auth(p_id, p_token) then raise exception 'AUTH'; end if;
  delete from public.players where id = p_id;
end $$;

-- Ranking: igual ao anterior, mas só com jogadores listados (quem saiu do ranking não aparece, nem para si).
create or replace function public.get_ranking(p_game text default null, p_band text default 'all', p_me uuid default null, p_limit int default 50)
returns table (pos int, nick text, score int, levels int, best_level int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with b as (
    select case when p_game is null then 1 when p_band = 'mid' then 31 when p_band = 'hard' then 71 else 1 end as lo,
           case when p_game is null then 100 when p_band = 'easy' then 30 when p_band = 'mid' then 70 else 100 end as hi
  ),
  per_game as (
    select r.player_id, r.game, sum(r.score) as s, count(*) as n, max(r.level) as ml
      from public.results r join public.players pl on pl.id = r.player_id, b
     where (p_game is null or r.game = p_game) and r.level between b.lo and b.hi and pl.listed
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

revoke all on function public.ml_new_code(), public.ml_code_hash(text) from public, anon, authenticated;
revoke all on function public.create_player(text, boolean), public.issue_recovery(uuid, text), public.recover_player(text),
  public.load_state(uuid, text), public.save_state(uuid, text, jsonb, int), public.set_listed(uuid, text, boolean),
  public.reset_player(uuid, text) from public;
grant execute on function public.create_player(text, boolean), public.issue_recovery(uuid, text), public.recover_player(text),
  public.load_state(uuid, text), public.save_state(uuid, text, jsonb, int), public.set_listed(uuid, text, boolean),
  public.reset_player(uuid, text) to anon, authenticated;
