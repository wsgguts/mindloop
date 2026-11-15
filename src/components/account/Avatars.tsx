"use client";
// Avatares: a coleção de personagens do MindLoop. Alguns vêm liberados; os outros chegam jogando (fases, jornadas
// completas e mistérios resolvidos). Tudo é calculado do progresso — nada a mais para guardar além da escolha.

import { useMemo, useState } from "react";
import { type AvatarStats, CAST, type CastMember, castById, castImg, DEFAULT_AVATAR, isUnlocked, unlockProgress, unlockText } from "../../lib/cast";
import type { CaseLog } from "../../lib/cases/progress";
import { solvedCount } from "../../lib/cases/progress";
import { EVERY_GAME } from "../../lib/games";
import { type JourneyGame, doneCount } from "../../lib/journey";

export function avatarStats(progress: Record<JourneyGame, string>, log: CaseLog): AvatarStats {
  const per = <T,>(f: (g: JourneyGame) => T) => Object.fromEntries(EVERY_GAME.map((g) => [g, f(g)])) as Record<JourneyGame, T>;
  return { levels: per((g) => doneCount(progress[g] ?? "")), cases: solvedCount(log), casesBy: per((g) => solvedCount(log, g)) };
}

/** Avatar em uso: o escolhido, se ainda estiver liberado; senão o padrão. */
export function currentAvatar(chosen: string | null, stats: AvatarStats): CastMember {
  const m = castById(chosen);
  return m && isUnlocked(m, stats) ? m : castById(DEFAULT_AVATAR)!;
}

/** Liberados que o jogador ainda não viu na coleção (os do começo não contam como novidade). */
export function newAvatars(stats: AvatarStats, seen: Set<string>): CastMember[] {
  return CAST.filter((m) => m.unlock.k !== "start" && isUnlocked(m, stats) && !seen.has(m.id));
}

export function AvatarPic({ m, size = 40, className = "" }: { m: CastMember; size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`avatar-pic ${className}`} src={castImg(m)} alt="" width={size} height={size} decoding="async" draggable={false} />;
}

/** Coleção na ordem em que costuma ser liberada: começo, fases, mistérios, narradores e jornadas completas. */
const rank = (m: CastMember) => { const u = m.unlock; return u.k === "start" ? 0 : u.k === "levels" ? 1000 + u.n : u.k === "cases" ? 2000 + u.n : u.k === "narrator" ? 3000 : 4000; };
const ORDERED = CAST.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m) - rank(b.m) || a.i - b.i).map((x) => x.m);

type Filter = "todos" | "liberados" | "bloqueados";

export function AvatarsPanel({ stats, current, fresh, onPick }: { stats: AvatarStats; current: string; fresh: Set<string>; onPick: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [peek, setPeek] = useState<string | null>(null);
  const open = useMemo(() => new Set(CAST.filter((m) => isUnlocked(m, stats)).map((m) => m.id)), [stats]);
  const list = ORDERED.filter((m) => filter === "todos" || (filter === "liberados") === open.has(m.id));
  const me = castById(current)!;
  const shown = castById(peek) ?? me;
  const shownOpen = open.has(shown.id);
  const [now, goal] = unlockProgress(shown, stats);

  return (
    <section className="card stack av-panel" aria-labelledby="av-t">
      <div className="av-head">
        <h2 id="av-t">Avatares</h2>
        <span className="muted small">{open.size} de {CAST.length} liberados</span>
      </div>

      <div className="av-show" aria-live="polite">
        <AvatarPic m={shown} size={96} className={shownOpen ? "" : "locked"} />
        <div>
          <b>{shown.name}{shown.id === current && <span className="av-tag">em uso</span>}</b>
          <p className="small">{shown.bio}</p>
          {shownOpen ? (
            shown.id !== current && <button className="btn cta sm" onClick={() => { onPick(shown.id); setPeek(null); }}>Usar este avatar</button>
          ) : (
            <>
              <p className="small av-need">🔒 {unlockText(shown)}</p>
              <span className="av-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={now} aria-label={`Progresso: ${now} de ${goal}`}><i style={{ width: `${(now / goal) * 100}%` }} /></span>
              <span className="muted small">{now} / {goal}</span>
            </>
          )}
        </div>
      </div>

      <div className="tabs av-filter" role="group" aria-label="Filtrar avatares">
        {(["todos", "liberados", "bloqueados"] as Filter[]).map((f) => (
          <button key={f} className={filter === f ? "on" : ""} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <ul className="av-grid" aria-label="Coleção de avatares">
        {list.map((m) => {
          const ok = open.has(m.id);
          return (
            <li key={m.id}>
              <button className={`av-item${ok ? "" : " locked"}${m.id === current ? " on" : ""}${shown.id === m.id ? " peek" : ""}`}
                onClick={() => setPeek(m.id)} aria-pressed={shown.id === m.id}
                aria-label={`${m.name}${m.id === current ? " (em uso)" : ""}${ok ? "" : ` — bloqueado: ${unlockText(m)}`}`}>
                <AvatarPic m={m} size={64} />
                {!ok && <span className="av-lock" aria-hidden="true">🔒</span>}
                {fresh.has(m.id) && <span className="av-new" aria-hidden="true">Novo</span>}
                <span className="av-name">{m.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="muted small">Os personagens também aparecem nas investigações. Novos avatares chegam ao concluir fases, completar jornadas e resolver mistérios.</p>
    </section>
  );
}
