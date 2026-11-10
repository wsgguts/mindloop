"use client";
import { useMemo, useState } from "react";
import Medal from "./Medal";
import { ACHIEVEMENTS, CATEGORIES, CATEGORY_LABEL, RARITY_LABEL, type AchCtx, type Category, type Rarity, type Unlocked, progressOf } from "../lib/achievements";
import { GAME_META } from "../lib/games";

type Show = "all" | "got" | "todo";
const fmtDate = (t: number) => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const RARITIES: Rarity[] = ["bronze", "prata", "ouro", "diamante"];

export default function Achievements({ ctx, unlocked }: { ctx: Omit<AchCtx, "medals">; unlocked: Unlocked }) {
  const [cat, setCat] = useState<Category | "all">("all");
  const [show, setShow] = useState<Show>("all");
  const total = ACHIEVEMENTS.length;
  const got = ACHIEVEMENTS.filter((a) => unlocked[a.id] !== undefined).length;
  const byRarity = RARITIES.map((r) => ({ r, got: ACHIEVEMENTS.filter((a) => a.rarity === r && unlocked[a.id] !== undefined).length, all: ACHIEVEMENTS.filter((a) => a.rarity === r).length }));

  const list = useMemo(() => ACHIEVEMENTS
    .filter((a) => cat === "all" || a.category === cat)
    .map((a) => ({ a, at: unlocked[a.id], ...progressOf(a, ctx, unlocked) }))
    .filter((x) => show === "all" || (show === "got" ? x.at !== undefined : x.at === undefined))
    // Obtidas primeiro (mais recentes antes); depois as bloqueadas mais perto de sair.
    .sort((x, y) => (x.at !== undefined) !== (y.at !== undefined) ? (x.at !== undefined ? -1 : 1) : x.at !== undefined ? y.at! - x.at! : y.frac - x.frac),
  [cat, show, ctx, unlocked]);

  return (
    <div className="wrap ach-page">
      <h1>Conquistas</h1>
      <section className="ach-sum" aria-label="Resumo das conquistas">
        <div className="ach-sum-main">
          <b>{got}<small>/{total}</small></b>
          <span>medalhas conquistadas</span>
          <div className="ach-bar" role="progressbar" aria-label="Conquistas obtidas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={got}>
            <i style={{ width: `${(got / total) * 100}%` }} />
          </div>
          <span className="ach-pct">{Math.round((got / total) * 100)}% concluído</span>
        </div>
        <ul className="ach-rar">
          {byRarity.map((x) => (
            <li key={x.r} className={`r-${x.r}`}><i aria-hidden="true" />{RARITY_LABEL[x.r]} <b>{x.got}/{x.all}</b></li>
          ))}
        </ul>
      </section>

      <div className="chips" role="group" aria-label="Categoria">
        {(["all", ...CATEGORIES] as const).map((c) => (
          <button key={c} className={cat === c ? "on" : ""} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c === "all" ? "Todas" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="chips small" role="group" aria-label="Mostrar">
        {([["all", "Todas"], ["got", "Desbloqueadas"], ["todo", "Bloqueadas"]] as const).map(([v, l]) => (
          <button key={v} className={show === v ? "on" : ""} aria-pressed={show === v} onClick={() => setShow(v)}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="muted">{show === "got" ? "Nenhuma medalha desta categoria ainda. Jogue uma partida para começar a coleção!" : "Você já conquistou todas as medalhas desta categoria. 🎉"}</p>
      ) : (
        <ul className="ach-grid">
          {list.map(({ a, at, value, frac }) => {
            const done = at !== undefined;
            return (
              <li key={a.id} className={`ach-card r-${a.rarity}${done ? " got" : ""}`}>
                <Medal a={a} size={56} locked={!done} />
                <div className="ach-body">
                  <div className="ach-top">
                    <h3>{a.title}</h3>
                    <span className={`rar r-${a.rarity}`}>{RARITY_LABEL[a.rarity]}</span>
                  </div>
                  {a.game && <span className="ach-game">{GAME_META[a.game].name}</span>}
                  <p>{a.desc}</p>
                  {done ? (
                    <p className="ach-date">✓ Obtida em {fmtDate(at)}</p>
                  ) : (
                    <>
                      <div className="ach-bar sm" role="progressbar" aria-label={`Progresso de ${a.title}`} aria-valuemin={0} aria-valuemax={a.target} aria-valuenow={value}>
                        <i style={{ width: `${frac * 100}%` }} />
                      </div>
                      <p className="ach-left">Progresso: {value}/{a.target} {a.unit} · falta{a.target - value > 1 ? "m" : ""} {a.target - value}</p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
