"use client";
import { useSfx, useSoundSettings } from "./useSound";

// Controle único de som (ligar/desligar + volume), usado no Perfil e no menu "Mais" da partida.
// As duas telas compartilham a mesma preferência, salva no aparelho.

export function SpeakerIcon({ on, size = 22 }: { on: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {on ? <><path d="M15.5 9a4.2 4.2 0 0 1 0 6" /><path d="M18.3 6.3a8 8 0 0 1 0 11.4" /></> : <path d="m16 9.5 5 5m0-5-5 5" />}
    </svg>
  );
}

export default function SoundControls({ compact = false }: { compact?: boolean }) {
  const [s, set] = useSoundSettings();
  const sfx = useSfx();
  const pct = Math.round(s.vol * 100);
  // Amostra do volume escolhido, ao soltar o controle (não a cada passo do arraste).
  const preview = () => sfx("place");

  return (
    <div className={`sndctl${compact ? " compact" : ""}`} role="group" aria-label="Efeitos sonoros">
      <button type="button" role="switch" aria-checked={s.on} className={`sndtog${s.on ? " on" : ""}`}
        onClick={() => { const on = !s.on; set({ on }); if (on) sfx("ui"); }}>
        <SpeakerIcon on={s.on} size={compact ? 20 : 22} />
        <span>{compact ? "Som" : s.on ? "Efeitos sonoros ligados" : "Efeitos sonoros desligados"}</span>
      </button>
      <label className="sndvol">
        <span className={compact ? "sr" : "sndlbl"}>Volume</span>
        <input type="range" min={0} max={100} step={5} value={pct} disabled={!s.on}
          aria-label="Volume dos efeitos sonoros" aria-valuetext={`${pct}%`}
          style={{ "--fill": `${pct}%` } as React.CSSProperties}
          onChange={(e) => set({ vol: Number(e.target.value) / 100 })}
          onPointerUp={preview} onKeyUp={(e) => { if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End" || e.key.startsWith("Page")) preview(); }} />
        {!compact && <output className="sndpct" aria-hidden="true">{pct}%</output>}
      </label>
    </div>
  );
}
