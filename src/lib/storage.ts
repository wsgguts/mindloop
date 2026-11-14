// Persistência local segura: se o armazenamento falhar, o app segue funcionando.
// Quem precisa saber que algo mudou (a sincronização com o servidor) assina com onStoreWrite.
const listeners = new Set<(key: string) => void>();

export function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function writeStore(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* segue sem persistência */ }
  listeners.forEach((f) => f(key));
}
/** Avisa a cada gravação (devolve a função que cancela a assinatura). */
export function onStoreWrite(f: (key: string) => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}
/** Apaga todas as chaves que começam com `prefix` (reinício do jogo). */
export function clearStore(prefix: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k?.startsWith(prefix)) keys.push(k); }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch { /* nada a apagar */ }
}
export const KEYS = { nick: "mindloop:nick", entered: "mindloop:entered", rules: "mindloop:rules", save: "mindloop:save" };
