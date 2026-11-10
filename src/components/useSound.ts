"use client";
import { useCallback, useSyncExternalStore } from "react";
import { type SfxEvent, type SfxOpts, getSound, playWith, setSound, subscribeSound } from "../lib/sound/engine";
import { DEFAULT_SOUND, type SoundSettings } from "../lib/sound/settings";
import { BASE, type SoundGame, themeFor } from "../lib/sound/themes";

export type { SfxEvent, SfxOpts };

/** Toca os efeitos com a identidade do jogo (sem jogo: sons neutros de interface). */
export function useSfx(game?: SoundGame) {
  return useCallback((ev: SfxEvent, opts?: SfxOpts) => playWith(themeFor(game), BASE, ev, opts, game ?? "ui"), [game]);
}

/** Preferências de som atuais (ligado + volume) e como mudá-las. Atualiza todos os controles juntos. */
export function useSoundSettings(): [SoundSettings, (patch: Partial<SoundSettings>) => void] {
  const s = useSyncExternalStore(subscribeSound, getSound, () => DEFAULT_SOUND);
  return [s, setSound];
}
