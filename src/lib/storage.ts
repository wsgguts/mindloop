// Persistência local segura: se o armazenamento falhar, o app segue funcionando.
// Quem precisa saber que algo mudou (a sincronização com o servidor) assina com onStoreWrite.
//
// Modo Administrador = ÁREA DE TESTES SEPARADA. Com ele ligado, toda chave "mindloop:…" é lida e gravada em
// "mindloop-admin:…": o progresso, as conquistas, a identidade e o apelido da pessoa ficam guardados, intocados,
// e o app enxerga um jogador de teste vazio (sem identidade → sem servidor e sem ranking). Ao desligar, a área de
// testes é apagada e o app volta a ler as chaves reais — a pessoa continua o jogo de onde parou.
const listeners = new Set<(key: string) => void>();

/** Chave (real, nunca desviada) que liga o Modo Administrador neste aparelho. */
export const ADMIN_FLAG = "mindloop:admin";
const REAL = "mindloop:";
const SANDBOX = "mindloop-admin:";

/** O Modo Administrador está ligado neste aparelho? */
export function adminActive(): boolean {
  try { return window.localStorage.getItem(ADMIN_FLAG) === "1"; } catch { return false; }
}
/** Endereço real de uma chave: no Modo Administrador, as chaves do jogo vão para a área de testes. */
const at = (key: string): string => (key !== ADMIN_FLAG && key.startsWith(REAL) && adminActive() ? SANDBOX + key.slice(REAL.length) : key);

export function readStore(key: string): string | null {
  try { return window.localStorage.getItem(at(key)); } catch { return null; }
}
export function writeStore(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(at(key));
    else window.localStorage.setItem(at(key), value);
  } catch { /* segue sem persistência */ }
  listeners.forEach((f) => f(key));
}
/** Avisa a cada gravação (devolve a função que cancela a assinatura). */
export function onStoreWrite(f: (key: string) => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}
function removeAll(prefix: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k?.startsWith(prefix) && k !== ADMIN_FLAG) keys.push(k); }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch { /* nada a apagar */ }
}
/** Apaga todas as chaves que começam com `prefix` (reinício do jogo). No Modo Administrador, só a área de testes. */
export function clearStore(prefix: string): void {
  removeAll(at(prefix));
}

/** Liga o Modo Administrador: começa uma área de testes vazia; os dados reais não são tocados. */
export function enterAdminArea(testNick: string): void {
  removeAll(SANDBOX);
  try {
    window.localStorage.setItem(ADMIN_FLAG, "1");
    window.localStorage.setItem(`${SANDBOX}nick`, testNick);
    window.localStorage.setItem(`${SANDBOX}entered`, "1");
  } catch { /* sem armazenamento: o modo não liga */ }
}
/** Desliga o Modo Administrador: apaga a área de testes e volta para os dados reais. */
export function leaveAdminArea(): void {
  removeAll(SANDBOX);
  try { window.localStorage.removeItem(ADMIN_FLAG); } catch { /* ignora */ }
}

export const KEYS = { nick: "mindloop:nick", entered: "mindloop:entered", rules: "mindloop:rules", save: "mindloop:save" };
