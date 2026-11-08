"use client";
// "Início" é a central dos jogos (a antiga aba "Jogos" foi unificada a ela).
export type Tab = "home" | "rules" | "profile";

const ICONS: Record<Tab, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M10 20v-6h4v6" />,
  rules: <path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8.5h6" />,
  profile: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c.8-4 3.6-6 7.5-6s6.700 2 7.500 6" /></>,
};
const ITEMS: { id: Tab; label: string }[] = [
  { id: "home", label: "Início" }, { id: "rules", label: "Regras" }, { id: "profile", label: "Perfil" },
];

// Na partida (celular em pé) a barra some para o tabuleiro ganhar altura; a volta é pelo botão ‹ do cabeçalho.
export default function BottomNav({ active, onChange, inGame = false }: { active: Tab; onChange: (t: Tab) => void; inGame?: boolean }) {
  return (
    <nav className={`bnav${inGame ? " in-game" : ""}`} aria-label="Navegação principal">
      <ul>
        {ITEMS.map((it) => (
          <li key={it.id}>
            <button className={it.id === active ? "on" : ""} aria-current={it.id === active ? "page" : undefined} onClick={() => onChange(it.id)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[it.id]}</svg>
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
