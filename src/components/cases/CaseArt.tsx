import { useId } from "react";
import type { CaseKind } from "../../lib/cases/model";

// Ilustrações originais do Mindloop Investigação, em SVG (leves e nítidas em qualquer tela).
// Cada tipo de mistério tem a sua cena; as cores vêm do jogo (main/light/deep de GAME_LOOK).

interface Look { main: string; light: string; deep: string }

/** Cena do tipo de mistério: cofre (numérico), lampiões (padrões), mapa (caminhos) ou vitrine (espacial). */
export function CaseScene({ kind, look, className }: { kind: CaseKind; look: Look; className?: string }) {
  const id = useId().replace(/:/g, "");
  const { main, light, deep } = look;
  const bg = (
    <defs>
      <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A1670" /><stop offset="1" stopColor="#1B0B3F" /></linearGradient>
      <radialGradient id={`gl${id}`} cx=".5" cy=".45" r=".6"><stop offset="0" stopColor={main} stopOpacity=".55" /><stop offset="1" stopColor={main} stopOpacity="0" /></radialGradient>
      <linearGradient id={`mt${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F7FB" /><stop offset="1" stopColor="#8E9BB0" /></linearGradient>
    </defs>
  );
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {bg}
      <rect width="160" height="120" fill={`url(#bg${id})`} />
      <rect width="160" height="120" fill={`url(#gl${id})`} />
      {kind === "code" && (
        <g>
          {/* cofre com três discos e maçaneta */}
          <rect x="34" y="14" width="92" height="92" rx="10" fill={deep} stroke="#120630" strokeWidth="3" />
          <rect x="40" y="20" width="80" height="80" rx="7" fill={`url(#mt${id})`} opacity=".22" />
          {[56, 80, 104].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="48" r="11" fill="#1B0B3F" stroke={light} strokeWidth="2.5" />
              <text x={x} y="52.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={light} fontFamily="monospace">{["3", "?", "7"][i]}</text>
            </g>
          ))}
          <circle cx="80" cy="80" r="12" fill="none" stroke={light} strokeWidth="3" />
          <path d="M80 68v24M68 80h24" stroke={light} strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="80" r="3.5" fill={main} />
          <rect x="120" y="36" width="8" height="18" rx="3" fill="#120630" /><rect x="120" y="66" width="8" height="18" rx="3" fill="#120630" />
          <text x="22" y="34" fontSize="13" fill="#FFD23F" opacity=".9">✦</text><text x="134" y="104" fontSize="10" fill={light}>✦</text>
        </g>
      )}
      {kind === "pattern" && (
        <g>
          {/* varal de lampiões alternando cristal (hexágono) e orbe (círculo) */}
          <path d="M6 22 Q80 48 154 22" fill="none" stroke={light} strokeWidth="1.6" opacity=".7" />
          {[18, 44, 70, 96, 122, 146].map((x, i) => {
            const y = 22 + 26 * (1 - ((x - 80) / 74) ** 2) * 0.9;
            const cr = [0, 1, 0, 0, 1, 1][i] === 0;
            return (
              <g key={x}>
                <line x1={x} y1={y - 2} x2={x} y2={y + 14} stroke={light} strokeWidth="1.4" opacity=".8" />
                <circle cx={x} cy={y + 30} r="17" fill={cr ? "#FFB020" : "#8E52F5"} opacity=".25" />
                {cr
                  ? <polygon points={`${x},${y + 16} ${x + 11},${y + 23} ${x + 11},${y + 37} ${x},${y + 44} ${x - 11},${y + 37} ${x - 11},${y + 23}`} fill="#FFB020" stroke="#A2560A" strokeWidth="1.5" />
                  : <circle cx={x} cy={y + 30} r="12" fill="#8E52F5" stroke="#33107A" strokeWidth="1.5" />}
                <circle cx={x - 3} cy={y + 26} r="2.6" fill="#fff" opacity=".7" />
              </g>
            );
          })}
          <path d="M0 108h160v12H0z" fill="#120630" opacity=".6" />
          {[30, 62, 100, 132].map((x) => <path key={x} d={`M${x} 108v-12a5 5 0 0 1 10 0v12`} fill="#120630" opacity=".8" />)}
        </g>
      )}
      {kind === "route" && (
        <g>
          {/* mapa de pergaminho com estradas, caminho tracejado e alfinete */}
          <path d="M14 16l40-6 52 6 40-6v96l-40 6-52-6-40 6z" fill="#F6E7C8" stroke="#8A6A3B" strokeWidth="2" />
          <path d="M54 10v96M106 16v96" stroke="#D9C39A" strokeWidth="1.2" />
          <path d="M32 90 L56 64 L92 74 L110 42 L134 32" fill="none" stroke="#B89B6C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
          <path d="M32 90 L56 64 L92 74 L110 42" fill="none" stroke={deep} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M56 64 L60 30 M92 74 L120 92" stroke="#B89B6C" strokeWidth="3" strokeLinecap="round" opacity=".45" />
          {[[32, 90], [56, 64], [92, 74], [110, 42], [134, 32], [60, 30], [120, 92]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={i < 4 ? main : "#fff"} stroke="#5A3D12" strokeWidth="1.5" />
          ))}
          <path d="M134 32c0-8 10-8 10 0 0 6-5 9-5 14 0-5-5-8-5-14z" fill="#FF6B83" stroke="#7A1D30" strokeWidth="1.2" transform="translate(-5 -20)" />
          <text x="24" y="34" fontSize="11" fill="#8A6A3B" fontWeight="700">N</text>
          <path d="M28 38l-3 8h6z" fill="#8A6A3B" />
        </g>
      )}
      {kind === "layout" && (
        <g>
          {/* vitrine de nichos 3×3 com relíquias e um nicho vazio */}
          <rect x="30" y="10" width="100" height="100" rx="8" fill="#5A2E14" stroke="#2E1408" strokeWidth="3" />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={36 + c * 31} y={16 + r * 31} width="27" height="27" rx="3" fill={r === 1 && c === 2 ? "#1B0B3F" : "#2A1050"} stroke={light} strokeOpacity=".35" />
          )))}
          <path d="M44 37c0-9 11-9 11 0v3H44z" fill={main} /><rect x="45" y="27" width="9" height="3" rx="1" fill={light} />
          <circle cx="80.5" cy="29.5" r="8" fill="#12CFE0" opacity=".85" /><path d="M75 29.5h11M80.5 22v15" stroke="#fff" strokeWidth="1" opacity=".6" />
          <path d="M104 37l4-14 4 6 4-6 4 14z" fill="#FFD23F" stroke="#7A5A00" strokeWidth="1" />
          <rect x="44" y="56" width="11" height="14" rx="2" fill="#F05BC8" /><path d="M46 60h7M46 64h7" stroke="#fff" strokeWidth="1" opacity=".6" />
          <path d="M77 55h7l-1 6 4 9h-13l4-9z" fill="#4FD6B1" stroke="#1D6B55" strokeWidth="1" />
          <rect x="102" y="54" width="20" height="18" rx="3" fill="none" stroke={light} strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="112" y="67" textAnchor="middle" fontSize="11" fill={light} fontWeight="700">?</text>
          <circle cx="50" cy="94" r="6" fill="none" stroke="#FFD23F" strokeWidth="2.5" /><path d="M54 98l5 5" stroke="#FFD23F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M75 90h12v10l-6 4-6-4z" fill="#C9B8EC" stroke="#4A16A8" strokeWidth="1" />
          <path d="M104 88h16l-3 14h-10z" fill="#FFB020" stroke="#A2560A" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

/** Lupa grande do convite (com reflexo). */
export function Magnifier({ size = 120, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`lens${id}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".6" stopColor="#A6F6FF" stopOpacity=".18" /><stop offset="1" stopColor="#12CFE0" stopOpacity=".3" /></radialGradient>
        <linearGradient id={`rim${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE680" /><stop offset="1" stopColor="#D19A00" /></linearGradient>
      </defs>
      <path d="M62 64l26 26" stroke="#5A2E14" strokeWidth="12" strokeLinecap="round" />
      <path d="M62 64l26 26" stroke="#8A4A22" strokeWidth="6" strokeLinecap="round" />
      <circle cx="40" cy="40" r="28" fill={`url(#lens${id})`} stroke={`url(#rim${id})`} strokeWidth="7" />
      <path d="M24 32a18 18 0 0 1 14-12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Medalha do mistério: lupa de ouro, prata ou bronze. */
export function CaseMedalIcon({ medal, size = 56 }: { medal: "ouro" | "prata" | "bronze"; size?: number }) {
  const id = useId().replace(/:/g, "");
  const [a, b] = medal === "ouro" ? ["#FFE680", "#D19A00"] : medal === "prata" ? ["#F4F7FB", "#8E9BB0"] : ["#F2B27A", "#A65A23"];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className={`cx-medal m-${medal}`}>
      <defs><linearGradient id={`md${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <circle cx="32" cy="32" r="29" fill={`url(#md${id})`} stroke="#26104D" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.6" />
      <circle cx="28" cy="28" r="9" fill="rgba(255,255,255,.35)" stroke="#26104D" strokeWidth="3" />
      <path d="M35 35l9 9" stroke="#26104D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
