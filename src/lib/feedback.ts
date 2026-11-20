// Envio das opiniões pelo Netlify Forms.
// Como funciona: a Netlify detecta o formulário "opiniao" em public/__forms.html (no deploy) e passa a
// guardar tudo que for enviado (POST) para esse mesmo caminho. As respostas aparecem em Netlify > Forms.
// Só funciona no site publicado na Netlify: rodando local (npm run dev) o envio mostra a mensagem de erro.
// Privacidade: enviamos APENAS nota e comentário. Não enviamos apelido nem nenhum identificador.

export interface Feedback { rating: number | null; comment: string; honeypot?: string }

export const FORM_NAME = "opiniao";
export const FORM_PATH = "/__forms.html";
export const COMMENT_MAX = 500;

/** Devolve a mensagem de erro (ou null se estiver tudo certo). */
export function validateFeedback(f: Feedback): string | null {
  const comment = f.comment.trim();
  if (f.rating === null && !comment) return "Escolha uma nota ou escreva um comentário.";
  if (f.rating !== null && (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5)) return "A nota deve ser de 1 a 5.";
  if (comment.length > COMMENT_MAX) return `O comentário pode ter até ${COMMENT_MAX} caracteres.`;
  return null;
}

/** Monta o corpo no formato que a Netlify espera (application/x-www-form-urlencoded). */
export function encodeFeedback(f: Feedback): string {
  const body = new URLSearchParams();
  body.set("form-name", FORM_NAME);
  body.set("bot-field", f.honeypot ?? "");
  body.set("rating", f.rating === null ? "" : String(f.rating));
  body.set("comment", f.comment.trim());
  return body.toString();
}

/** Envia a opinião. Lança erro se o envio não der certo (a tela mostra uma mensagem amigável). */
export async function submitFeedback(f: Feedback, doFetch: typeof fetch = fetch): Promise<void> {
  const erro = validateFeedback(f);
  if (erro) throw new Error(erro);
  if (f.honeypot) return; // campo-armadilha preenchido = robô: finge sucesso e não envia
  const res = await doFetch(FORM_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeFeedback(f),
  });
  if (!res.ok) throw new Error(`Falha no envio (${res.status}).`);
}

// ---------------- Pedido de opinião na tela de comemoração (item 4 do teste com alunos) ----------------
// O personagem do jogo pede a opinião ao fim de uma partida completa (a partida guiada também conta).
//  • Aparece na primeira partida completa.
//  • Se a pessoa recusar ("Agora não", ou seguir sem responder), só volta depois de ASK_EVERY partidas.
//  • Depois que ela enviar uma opinião, nunca mais aparece (FB_SENT_KEY, em App.tsx).
// Guardado no aparelho: mindloop:fb-ask = {"wins":n,"declinedAt":n|null}.

export const ASK_KEY = "mindloop:fb-ask";
export const ASK_EVERY = 5;
export interface AskState { wins: number; declinedAt: number | null }

export function parseAsk(raw: string | null): AskState {
  try {
    const o = raw ? JSON.parse(raw) : null;
    if (o && Number.isInteger(o.wins) && o.wins >= 0) return { wins: o.wins, declinedAt: Number.isInteger(o.declinedAt) ? o.declinedAt : null };
  } catch { /* valor estragado: recomeça */ }
  return { wins: 0, declinedAt: null };
}

/** Mais uma partida completa: devolve o novo estado e se o pedido de opinião deve aparecer nesta comemoração. */
export function countWin(s: AskState, sent: boolean): { state: AskState; ask: boolean } {
  const state = { ...s, wins: s.wins + 1 };
  const ask = !sent && (state.declinedAt === null || state.wins - state.declinedAt >= ASK_EVERY);
  return { state, ask };
}

/** A pessoa recusou (ou seguiu sem responder): o pedido só volta depois de ASK_EVERY partidas. */
export const decline = (s: AskState): AskState => ({ ...s, declinedAt: s.wins });
