// Persistência local segura: se o armazenamento falhar, o app segue funcionando.
export function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function writeStore(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* segue sem persistência */ }
}
export const KEYS = { nick: "mindloop:nick", entered: "mindloop:entered", rules: "mindloop:rules", save: "mindloop:save" };
