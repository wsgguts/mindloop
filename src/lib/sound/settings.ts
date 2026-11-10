// Preferências de som (salvas no aparelho). Funções puras: fáceis de testar e sem depender do navegador.

export interface SoundSettings {
  /** Efeitos sonoros ligados. */
  on: boolean;
  /** Volume dos efeitos, de 0 a 1. */
  vol: number;
}

export const SOUND_KEY = "mindloop:sound";
export const DEFAULT_SOUND: SoundSettings = { on: true, vol: 0.7 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Lê o que foi salvo; qualquer valor estranho volta ao padrão (nunca quebra o app). */
export function parseSound(raw: string | null): SoundSettings {
  if (!raw) return { ...DEFAULT_SOUND };
  try {
    const o = JSON.parse(raw) as Partial<SoundSettings>;
    return {
      on: typeof o.on === "boolean" ? o.on : DEFAULT_SOUND.on,
      vol: typeof o.vol === "number" && Number.isFinite(o.vol) ? clamp01(o.vol) : DEFAULT_SOUND.vol,
    };
  } catch {
    return { ...DEFAULT_SOUND };
  }
}

export const serializeSound = (s: SoundSettings): string => JSON.stringify({ on: s.on, vol: Math.round(clamp01(s.vol) * 100) / 100 });

/** Junta uma mudança parcial às preferências atuais (volume sempre entre 0 e 1). */
export const mergeSound = (cur: SoundSettings, patch: Partial<SoundSettings>): SoundSettings => ({
  on: patch.on ?? cur.on,
  vol: clamp01(patch.vol ?? cur.vol),
});

/**
 * Volume do controle (0–1) → ganho real. O ouvido percebe volume de forma logarítmica,
 * então uma curva faz o meio do controle soar como "meio volume".
 */
export const gainFor = (s: SoundSettings): number => (s.on ? Math.pow(clamp01(s.vol), 1.7) : 0);
