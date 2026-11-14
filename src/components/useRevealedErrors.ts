"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Tempo (ms) que o tabuleiro precisa ficar parado antes de um erro aparecer. Vale para os 4 jogos e para as
 * investigações. Curto o bastante para não deixar o jogo lento; longo o bastante para o jogo não "soprar"
 * a resposta a cada toque (e para quem toca em ciclo — vazio → Cristal → Orbe — terminar o gesto).
 */
export const ERROR_REVEAL_MS = 1200;

/**
 * Erros revelados com atraso.
 * - `keys`: erros atuais (ex.: casas em conflito "2-3"), calculados pela regra do próprio jogo.
 * - `version`: muda a cada jogada; enquanto a pessoa continua jogando, nada novo é revelado.
 * - Depois de `delay` ms sem jogadas, os erros que ainda existem aparecem e `onReveal` recebe só os novos
 *   (para tocar o som de erro e escrever a mensagem uma única vez).
 * - Um erro corrigido some na hora; um erro já revelado que continua existindo continua visível (sem piscar).
 * `revealNow` mostra tudo imediatamente (usado pela Dica, que é ajuda pedida).
 */
export function useRevealedErrors(keys: string[], version: unknown, onReveal?: (fresh: string[]) => void, delay = ERROR_REVEAL_MS) {
  const [shown, setShown] = useState<Set<string>>(() => new Set());
  const keysRef = useRef(keys);
  keysRef.current = keys;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const cb = useRef(onReveal);
  cb.current = onReveal;
  const sig = useMemo(() => [...keys].sort().join("|"), [keys]);

  const reveal = useCallback(() => {
    const cur = new Set(keysRef.current);
    const fresh = [...cur].filter((k) => !shownRef.current.has(k));
    shownRef.current = cur;
    setShown(cur);
    if (fresh.length) cb.current?.(fresh);
  }, []);

  useEffect(() => {
    if (!sig) { if (shownRef.current.size) { shownRef.current = new Set(); setShown(new Set()); } return; }
    const t = window.setTimeout(reveal, delay);
    return () => window.clearTimeout(t);
  }, [sig, version, delay, reveal]);

  const visible = useMemo(() => new Set(keys.filter((k) => shown.has(k))), [keys, shown]);
  return { visible, revealNow: reveal };
}

/** O valor só "assenta" depois de `delay` ms sem mudar (o ✓ das investigações usa isto: sem confirmação a cada toque). */
export function useSettled<T>(value: T, delay = ERROR_REVEAL_MS): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return settled;
}
