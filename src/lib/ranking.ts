// Ranking online (sem login): fala com o banco Supabase só por funções do servidor (RPC).
// - O aparelho ganha um identificador anônimo + uma senha aleatória (token) na primeira participação.
//   O servidor guarda só o hash do token; sem ele ninguém envia resultados em nome de outra pessoa.
// - O aparelho envia apenas (jogo, nível, tempo). Quem calcula os pontos é o servidor, com a tabela de
//   tempos de referência dele; ele também recusa tempos impossíveis e níveis pulados.
// - Sem as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY o ranking online fica
//   desligado e a tela mostra só a pontuação real da própria pessoa (nunca jogadores inventados).

import type { JourneyGame } from "./journey";
import type { Times } from "./records";
import type { Band } from "./scoring";

export interface RankIdentity { id: string; token: string; nick: string }
export interface RankRow { pos: number; nick: string; score: number; levels: number; best_level: number; is_me: boolean }

export const RANK_KEY = "mindloop:rank";

export function rankingConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null;
}

export function parseIdentity(raw: string | null): RankIdentity | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<RankIdentity>;
    return typeof o.id === "string" && typeof o.token === "string" && typeof o.nick === "string" ? { id: o.id, token: o.token, nick: o.nick } : null;
  } catch { return null; }
}

/** Erro com mensagem pronta para mostrar na tela. */
export class RankError extends Error {
  constructor(message: string, public code: string) { super(message); }
}

const MESSAGES: Record<string, string> = {
  NICK_TAKEN: "Esse apelido já está sendo usado no ranking. Escolha outro.",
  NICK_INVALID: "Esse apelido não é permitido no ranking. Escolha outro.",
  AUTH: "Não reconhecemos este aparelho no ranking. Entre de novo para continuar participando.",
  LIMIT: "Muitos envios seguidos. Espere um pouco e tente de novo.",
};

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const cfg = rankingConfig();
  if (!cfg) throw new RankError("Ranking online não configurado.", "OFF");
  const headers: Record<string, string> = { "Content-Type": "application/json", apikey: cfg.key };
  if (cfg.key.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.key}`; // chave "anon" antiga (JWT)
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  let res: Response;
  try {
    res = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(body), signal: ctrl.signal });
  } catch {
    throw new RankError("Sem conexão com o ranking agora. Confira a internet e tente de novo.", "NET");
  } finally { clearTimeout(t); }
  if (!res.ok) {
    let code = "ERR";
    try { const j = (await res.json()) as { message?: string }; code = (j.message ?? "").split(":")[0].trim() || "ERR"; } catch { /* corpo vazio */ }
    throw new RankError(MESSAGES[code] ?? "O ranking não respondeu como esperado. Tente de novo mais tarde.", code);
  }
  // Funções sem retorno (rename/delete) respondem 204 sem corpo.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function registerPlayer(nick: string): Promise<RankIdentity> {
  const r = await rpc<{ id: string; token: string }>("register_player", { p_nick: nick });
  return { id: r.id, token: r.token, nick };
}

export async function renamePlayer(me: RankIdentity, nick: string): Promise<RankIdentity> {
  await rpc("rename_player", { p_id: me.id, p_token: me.token, p_nick: nick });
  return { ...me, nick };
}

export async function leaveRanking(me: RankIdentity): Promise<void> {
  await rpc("delete_player", { p_id: me.id, p_token: me.token });
}

/**
 * Envia os melhores tempos de um jogo. É idempotente: o servidor guarda só o melhor tempo de cada nível,
 * então reenviar (após recarregar a página, por exemplo) nunca duplica pontos.
 */
export async function syncGame(me: RankIdentity, game: JourneyGame, times: Times): Promise<number> {
  const items = Object.entries(times).map(([level, ms]) => ({ level: Number(level), ms: Math.round(ms) })).sort((a, b) => a.level - b.level);
  if (!items.length) return 0;
  return rpc<number>("submit_results", { p_id: me.id, p_token: me.token, p_game: game, p_items: items });
}

export async function fetchRanking(game: JourneyGame | null, band: Band, me: string | null): Promise<RankRow[]> {
  return rpc<RankRow[]>("get_ranking", { p_game: game, p_band: band, p_me: me, p_limit: 50 });
}
