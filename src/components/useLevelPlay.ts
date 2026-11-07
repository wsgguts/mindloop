"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** true enquanto a aba do navegador está visível (o cronômetro não conta com o app em segundo plano). */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Cronômetro único de todos os jogos: conta só enquanto `running` (e a página está visível).
 * Usa o relógio do sistema, então não "atrasa" se o navegador demorar a redesenhar.
 */
export function useStopwatch(running: boolean, initialMs = 0) {
  const visible = usePageVisible();
  const on = running && visible;
  const [ms, setMs] = useState(initialMs);
  const base = useRef(initialMs); // tempo acumulado em trechos já encerrados
  const since = useRef<number | null>(null); // início do trecho atual

  useEffect(() => {
    if (!on) return;
    since.current = performance.now();
    const id = window.setInterval(() => setMs(base.current + performance.now() - since.current!), 250);
    return () => {
      window.clearInterval(id);
      base.current += performance.now() - (since.current ?? performance.now());
      since.current = null;
      setMs(base.current);
    };
  }, [on]);

  /** Tempo exato agora (sem esperar o próximo tique). */
  const read = useCallback(() => (since.current === null ? base.current : base.current + performance.now() - since.current), []);
  return { ms, read };
}

interface LevelPlayOptions {
  /** A partida está na tela e sem nada por cima (regras, pausa...). */
  active: boolean;
  /** Chamado assim que o nível é resolvido, com o tempo final (para salvar o progresso na hora). */
  onWin: (ms: number) => void;
  /** Chamado quando a animação de conclusão no tabuleiro termina. */
  onCelebrated: () => void;
  /** Duração da animação de conclusão própria do jogo. */
  fxMs: number;
  /** Tempo já jogado numa partida retomada. */
  initialMs?: number;
}

/**
 * Fluxo comum de uma partida: cronômetro → vitória (tempo congelado e salvo) →
 * animação no tabuleiro (que continua visível) → tela de parabéns.
 */
export function useLevelPlay({ active, onWin, onCelebrated, fxMs, initialMs = 0 }: LevelPlayOptions) {
  const [won, setWon] = useState(false);
  const [finalMs, setFinalMs] = useState<number | null>(null);
  const clock = useStopwatch(active && !won, initialMs);
  const doneRef = useRef(onCelebrated);
  doneRef.current = onCelebrated;
  const wonRef = useRef(false); // evita vitória dupla se dois eventos chegarem antes do próximo render

  function win() {
    if (wonRef.current) return;
    wonRef.current = true;
    const ms = Math.round(clock.read()); // milissegundos inteiros (salvos no aparelho)
    setFinalMs(ms);
    setWon(true);
    onWin(ms);
  }

  useEffect(() => {
    if (!won) return;
    const t = window.setTimeout(() => doneRef.current(), prefersReducedMotion() ? 700 : fxMs);
    return () => window.clearTimeout(t);
  }, [won, fxMs]);

  return { won, win, ms: finalMs ?? clock.ms, read: clock.read };
}
