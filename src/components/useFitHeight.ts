"use client";
import { type RefObject, useEffect, useLayoutEffect } from "react";

/** useLayoutEffect no navegador (mede antes de pintar); useEffect no servidor (evita o aviso do React). */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Mede o espaço entre o topo do elemento e a barra de navegação inferior e grava em --fit-h. O CSS usa a medida
 * (só no celular em pé) para a tela caber inteira, sem rolar — cabeçalho e barra têm alturas que variam por
 * aparelho (área segura, fontes), então medir é mais confiável que somar constantes.
 */
export function useFitHeight(ref: RefObject<HTMLElement>, deps: unknown[] = []) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const nav = document.querySelector(".bnav")?.getBoundingClientRect();
      const navH = nav && nav.top > window.innerHeight / 2 ? window.innerHeight - nav.top : 0; // deitado o menu é lateral
      el.style.setProperty("--fit-h", `${Math.max(0, Math.floor(window.innerHeight - top - navH))}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => { window.removeEventListener("resize", fit); window.visualViewport?.removeEventListener("resize", fit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
