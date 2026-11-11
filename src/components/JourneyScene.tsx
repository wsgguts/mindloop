"use client";
import { memo } from "react";
import type { JourneyGame } from "../lib/journey";
import { GAME_LOOK, type Decor, type Scene, particlesOf, sceneArt } from "../lib/scenes";
import { TRAIL_IMAGE } from "../lib/trail";

// Cenário de um mundo da jornada, em camadas sobre a pintura da trilha (ver lib/scenes.ts).
// O mesmo componente atende os 4 jogos: o mundo define composição e gradação; o jogo define a luz
// (variáveis --g1 principal, --g2 clara, --g3 profunda) usada em cristais, brilhos e partículas.
// Nada aqui recebe toques (pointer-events: none) — os botões das fases ficam por cima.

const W = TRAIL_IMAGE.width, H = TRAIL_IMAGE.height;
const G1 = "var(--g1)", G2 = "var(--g2)", G3 = "var(--g3)";

/** Desenha um elemento centrado em (0,0), dentro da caixa definida em DECOR_BOX. */
function Shape({ d, sc }: { d: Decor; sc: Scene }) {
  const ink = sc.ink ?? "#1B0B3F", tone = sc.tone;
  switch (d.k) {
    case "tree":
      return (
        <g>
          <path d="M-22 280 C-18 160 -30 60 -10 -60 L10 -60 C30 60 18 160 26 280 Z M-6 40 C-50 0 -80 -10 -100 -40 M8 0 C50 -30 80 -30 104 -70" fill={ink} stroke={ink} strokeWidth="14" strokeLinecap="round" />
          {/* copa de cor única + um só reflexo suave no alto (vários reflexos formariam "rostos") */}
          {[[-95, -60, 70], [95, -80, 70], [0, -110, 90], [-60, -150, 95], [55, -170, 100], [0, -230, 105]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={ink} />
          ))}
          <ellipse cx="-30" cy="-210" rx="110" ry="80" fill="url(#sc-canopy)" />
          {/* bordas recortadas em folhas */}
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2, x = Math.cos(a) * 150, y = -150 + Math.sin(a) * 140;
            return <ellipse key={i} cx={x} cy={y} rx="26" ry="15" fill={ink} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
          })}
          {/* frutos de cristal: brilham na cor do jogo */}
          {[[-70, -150], [50, -200], [10, -110], [-30, -240], [85, -110], [-100, -70]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 11} l7 11 l-7 11 l-7 -11 Z`} className="sc-glow sc-twinkle" style={{ fill: i % 2 ? G2 : G1, animationDelay: `${i * .4}s` }} />
          ))}
        </g>
      );
    case "vines":
      return (
        <g fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round">
          {[-60, -20, 25, 65].map((x, i) => <path key={i} d={`M${x} -140 C${x + 25} ${-60 + i * 10} ${x - 25} ${20 + i * 15} ${x + 8} ${70 + i * 25}`} />)}
          {[[-50, -60], [-10, 0], [30, -30], [70, 40], [-20, 70], [20, 100]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill={ink} stroke="none" transform={`rotate(${i * 40} ${x} ${y})`} />)}
          {[[-45, -20], [28, 20], [62, 80], [-8, 110]].map(([x, y], i) => <circle key={i} className="sc-twinkle" cx={x} cy={y} r="6" style={{ fill: G1, animationDelay: `${i * .5}s` }} stroke="none" />)}
        </g>
      );
    case "mushroom":
      return (
        <g>
          <path d="M-10 40 C-12 10 -8 0 -6 -6 L6 -6 C8 0 12 10 10 40 Z" fill={tone} opacity=".85" />
          <path d="M-44 -4 C-40 -40 40 -40 44 -4 Z" className="sc-glow" style={{ fill: G1 }} />
          {[[-20, -18], [8, -26], [26, -12]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#fff" opacity=".8" />)}
        </g>
      );
    case "falls":
      return (
        <g>
          <rect x="-26" y="-210" width="52" height="400" rx="14" fill={tone} opacity=".55" />
          {[-14, 0, 14].map((x, i) => <line key={i} className="sc-flow" x1={x} y1="-205" x2={x} y2="185" stroke="#fff" strokeWidth="5" strokeDasharray="30 22" opacity=".7" style={{ animationDelay: `${i * -.3}s` }} />)}
          <ellipse cx="0" cy="195" rx="46" ry="16" fill="#fff" opacity=".55" className="sc-pulse" />
        </g>
      );
    case "mist":
      return <ellipse className="sc-drift" cx="0" cy="0" rx="470" ry="80" fill="url(#sc-mist)" />;
    case "ripple":
      return <g fill="none" stroke={tone} strokeWidth="3">{[0, 1, 2].map((i) => <ellipse key={i} className="sc-ripple" cx="0" cy="0" rx="80" ry="22" style={{ animationDelay: `${i * .9}s` }} />)}</g>;
    case "constellation": {
      const pts = [[-140, 40], [-80, -50], [-10, -20], [50, -80], [120, -30], [90, 60], [10, 70]];
      return (
        <g>
          <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" style={{ stroke: G2 }} strokeWidth="2" opacity=".55" />
          {pts.map(([x, y], i) => <circle key={i} className="sc-twinkle" cx={x} cy={y} r={i % 3 ? 4 : 6} style={{ fill: G2, animationDelay: `${i * .35}s` }} />)}
        </g>
      );
    }
    case "planet":
      return (
        <g>
          <circle r="38" fill={tone} opacity=".9" />
          <path d="M-38 0 A38 38 0 0 0 38 0" fill={ink} opacity=".35" />
          <ellipse rx="78" ry="16" fill="none" style={{ stroke: G1 }} strokeWidth="5" transform="rotate(-18)" className="sc-glow" />
        </g>
      );
    case "dome":
      return (
        <g fill={ink}>
          <rect x="-70" y="10" width="140" height="75" />
          <path d="M-62 12 A62 62 0 0 1 62 12 Z" />
          <rect x="-8" y="-50" width="16" height="50" fill={tone} opacity=".4" />
          {[-45, -15, 15, 45].map((x, i) => <rect key={i} x={x - 7} y="30" width="14" height="28" rx="7" className="sc-glow" style={{ fill: G1 }} />)}
          <line x1="0" y1="-40" x2="55" y2="-80" stroke={tone} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "pyramid":
      return (
        <g>
          <path d="M-110 75 L0 -75 L110 75 Z" fill={ink} />
          <path d="M0 -75 L110 75 L20 75 Z" fill={tone} opacity=".35" />
          <path d="M-14 -56 L0 -75 L14 -56 Z" className="sc-glow" style={{ fill: G1 }} />
          <rect x="-12" y="40" width="24" height="35" fill={tone} opacity=".5" />
        </g>
      );
    case "sun":
      return <g><circle r="80" fill="url(#sc-sun)" /><circle r="44" fill={tone} opacity=".9" /></g>;
    case "obelisk":
      return (
        <g>
          <path d="M-26 160 L-18 -130 L0 -160 L18 -130 L26 160 Z" fill={ink} />
          <path d="M0 -160 L18 -130 L26 160 L4 160 Z" fill={tone} opacity=".25" />
          {[-90, -40, 10, 60, 110].map((y, i) => <path key={i} d={`M-8 ${y} l8 -10 l8 10 l-8 10 Z`} className="sc-glow sc-twinkle" style={{ fill: G1, animationDelay: `${i * .3}s` }} />)}
        </g>
      );
    case "dunes":
      return (
        <g>
          <path d="M-450 75 L-450 0 C-300 -60 -160 -30 -40 -10 C90 10 220 -70 450 -20 L450 75 Z" fill={tone} opacity=".45" />
          <path d="M-450 75 L-450 30 C-260 -10 -60 50 120 20 C260 0 360 10 450 30 L450 75 Z" fill={ink} opacity=".35" />
        </g>
      );
    case "peaks":
      return (
        <g>
          {/* montanhas distantes: esmaecem no ar (perspectiva atmosférica) */}
          <path d="M-450 130 L-380 -20 L-330 30 L-250 -110 L-170 20 L-120 -40 L-60 40 L0 130 Z M60 130 L130 -10 L190 40 L280 -120 L350 0 L400 -50 L450 30 L450 130 Z" fill="url(#sc-fade)" />
          <path d="M-250 -110 L-230 -70 L-262 -78 Z M280 -120 L300 -80 L268 -88 Z" fill={tone} opacity=".8" />
        </g>
      );
    case "volcano":
      return (
        <g>
          <path d="M-120 125 L-40 -80 L40 -80 L120 125 Z" fill={ink} />
          <ellipse cx="0" cy="-80" rx="40" ry="10" fill={tone} className="sc-glow sc-pulse" />
          <path d="M-8 -78 C-20 -20 -40 20 -30 90 M10 -78 C20 -30 40 10 48 80" fill="none" stroke={tone} strokeWidth="7" strokeLinecap="round" className="sc-glow" />
          {[0, 1, 2].map((i) => <circle key={i} className="sc-smoke" cx={-10 + i * 12} cy="-100" r={18 + i * 6} fill={ink} opacity=".5" style={{ animationDelay: `${i * 1.3}s` }} />)}
        </g>
      );
    case "dragon":
      return (
        <g className="sc-bob" fill={ink}>
          <path d="M-110 20 C-60 10 -20 30 20 10 C50 -5 80 -5 105 -18 L118 -10 L100 0 C70 20 30 35 -10 38 C-50 40 -90 35 -125 45 Z" />
          <path className="sc-flap" d="M-20 15 L-70 -55 L-30 -40 L-10 -70 L10 -35 L30 -50 L25 10 Z" />
          <circle cx="104" cy="-14" r="3.5" style={{ fill: G1 }} className="sc-glow" />
        </g>
      );
    case "aurora":
      return (
        <g className="sc-sway" filter="url(#sc-blur)">
          <path d="M-450 40 C-300 -90 -150 60 0 -40 C150 -140 300 30 450 -70 L450 10 C300 110 150 -60 0 40 C-150 140 -300 -20 -450 120 Z" fill="url(#sc-aurora)" opacity=".75" />
          <path d="M-450 -60 C-260 -160 -120 0 60 -110 C220 -200 340 -60 450 -150 L450 -110 C330 -20 220 -150 60 -60 C-120 40 -260 -110 -450 -10 Z" fill="url(#sc-aurora)" opacity=".5" />
        </g>
      );
    case "icicles":
      return <g fill={tone} opacity=".85">{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-450 + i * 30} -40 l15 0 l-7 ${30 + ((i * 37) % 45)} Z`} />)}</g>;
    case "spire":
      return (
        <g>
          <path d="M0 -140 L32 -90 L28 140 L-28 140 L-32 -90 Z" fill={tone} opacity=".75" />
          <path d="M0 -140 L32 -90 L28 140 L4 140 Z" fill="#fff" opacity=".35" />
          <path d="M0 -140 L32 -90 L28 140 L-28 140 L-32 -90 Z" fill="none" style={{ stroke: G2 }} strokeWidth="3" className="sc-glow" />
        </g>
      );
    case "column":
      return (
        <g>
          <path d="M-30 150 L-30 -110 L-18 -130 L-4 -112 L10 -140 L30 -118 L30 150 Z" fill={ink} />
          {[-15, 0, 15].map((x) => <line key={x} x1={x} y1="-100" x2={x} y2="140" stroke={tone} strokeWidth="3" opacity=".3" />)}
          <rect x="-38" y="130" width="76" height="20" fill={ink} />
          <path d="M-30 -60 C-10 -40 20 -70 30 -30 M-30 40 C0 60 10 20 30 70" fill="none" stroke={tone} strokeWidth="5" opacity=".7" />
          <circle cx="26" cy="-28" r="5" style={{ fill: G1 }} className="sc-twinkle" />
        </g>
      );
    case "glyph":
      return (
        <g className="sc-spin-slow" fill="none" style={{ stroke: G1 }} strokeWidth="3" opacity=".6">
          <circle r="80" /><circle r="62" strokeDasharray="8 10" />
          <path d="M0 -60 L52 30 L-52 30 Z M0 60 L52 -30 L-52 -30 Z" />
        </g>
      );
    case "clock":
      return (
        <g opacity=".6">
          <circle r="170" fill="none" stroke={tone} strokeWidth="6" />
          <circle r="150" fill="none" style={{ stroke: G2 }} strokeWidth="2" strokeDasharray="4 14" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x="-4" y="-166" width="8" height={i % 3 ? 16 : 28} fill={tone} transform={`rotate(${i * 30})`} />)}
          {/* círculos invisíveis: centralizam a caixa do ponteiro para ele girar em torno do centro do relógio */}
          <g className="sc-spin"><circle r="135" fill="none" /><rect x="-4" y="-130" width="8" height="135" rx="4" style={{ fill: G1 }} /></g>
          <g className="sc-spin-slow"><circle r="135" fill="none" /><rect x="-6" y="-90" width="12" height="95" rx="6" fill={tone} /></g>
          <circle r="12" style={{ fill: G1 }} />
        </g>
      );
    case "gear":
      return (
        <g className="sc-spin-slow">
          <path d={gearPath(56, 44, 12)} fill={ink} stroke={tone} strokeWidth="3" />
          <circle r="16" fill="none" style={{ stroke: G1 }} strokeWidth="5" />
        </g>
      );
    case "hourglass":
      return (
        <g>
          <rect x="-36" y="-64" width="72" height="10" rx="4" fill={ink} /><rect x="-36" y="54" width="72" height="10" rx="4" fill={ink} />
          <path d="M-28 -54 L28 -54 L4 0 L28 54 L-28 54 L-4 0 Z" fill="none" stroke={tone} strokeWidth="4" />
          <path d="M-18 -46 L18 -46 L2 -8 L-2 -8 Z" style={{ fill: G1 }} className="sc-glow" />
          <path d="M-20 52 L20 52 L0 26 Z" style={{ fill: G1 }} />
          <line x1="0" y1="-6" x2="0" y2="26" style={{ stroke: G2 }} strokeWidth="2" className="sc-flow" strokeDasharray="4 4" />
        </g>
      );
    case "halo":
      return (
        <g opacity=".7">
          <g className="sc-spin-slow"><circle r="200" fill="none" stroke={tone} strokeWidth="4" strokeDasharray="2 18" /></g>
          <g className="sc-spin-rev"><circle r="165" fill="none" style={{ stroke: G1 }} strokeWidth="3" strokeDasharray="40 20" /></g>
          <circle r="130" fill="none" stroke={tone} strokeWidth="2" opacity=".6" />
        </g>
      );
    case "rays":
      return (
        <g className="sc-pulse" opacity=".28">
          {[-60, -36, -14, 8, 30, 54].map((a, i) => <path key={i} d="M-14 -380 L14 -380 L70 380 L-70 380 Z" fill="url(#sc-ray)" transform={`rotate(${a} 0 -380)`} style={{ animationDelay: `${i * .4}s` }} />)}
        </g>
      );
    case "infinity":
      return <path className="sc-glow sc-dash" d="M0 0 C-30 -40 -85 -40 -85 0 C-85 40 -30 40 0 0 C30 -40 85 -40 85 0 C85 40 30 40 0 0 Z" fill="none" style={{ stroke: G1 }} strokeWidth="7" strokeLinecap="round" />;
    case "moon":
      return <path d="M30 -52 A56 56 0 1 0 30 52 A44 44 0 1 1 30 -52 Z" fill={tone} opacity=".85" />;
    case "island":
      return (
        <g className="sc-bob">
          <path d="M-70 -10 L70 -10 L20 60 L0 50 L-25 70 Z" fill={ink} />
          <ellipse cx="0" cy="-12" rx="72" ry="16" fill={tone} opacity=".75" />
          <path d="M-6 -24 l6 -26 l6 26 Z" className="sc-glow" style={{ fill: G1 }} />
        </g>
      );
  }
}

function gearPath(R: number, r: number, n: number) {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a1 = (Math.PI * i) / n, a2 = (Math.PI * (i + 1)) / n, rad = i % 2 ? r : R;
    p.push(`${(Math.cos(a1) * rad).toFixed(1)},${(Math.sin(a1) * rad).toFixed(1)}`, `${(Math.cos(a2) * rad).toFixed(1)},${(Math.sin(a2) * rad).toFixed(1)}`);
  }
  return `M${p.join(" L")} Z`;
}

function JourneyScene({ scene, game }: { scene: Scene; game: JourneyGame }) {
  const look = GAME_LOOK[game];
  const parts = particlesOf(scene);
  return (
    <div className={`scene scene-${scene.id}`} aria-hidden="true"
      style={{ "--g1": look.main, "--g2": look.light, "--g3": look.deep, "--tone": scene.tone } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="scene-art" src={sceneArt(scene)} width={W} height={H} alt="" decoding="async" draggable={false} style={scene.grade ? { filter: scene.grade } : undefined} />
      {scene.wash && <div className="scene-wash" style={{ background: `linear-gradient(180deg, ${scene.wash[0]}, ${scene.wash[1]})`, mixBlendMode: scene.blend }} />}
      {/* Identidade do jogo: cristais da pintura e luz do céu na cor do jogo. */}
      {scene.crystals.map(([x, y, r], i) => (
        <span key={i} className="scene-crystal" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${((r * 2) / W) * 100}%`, aspectRatio: "1" }} />
      ))}
      {/* Ambiente: elementos da própria pintura ganham movimento (água, fogo, portais, névoa). */}
      {scene.fx?.map(([k, x, y, w, h], i) => (
        <span key={`fx${i}`} className={`scene-fx fx-${k}`}
          style={{ left: `${((x - w / 2) / W) * 100}%`, top: `${((y - h / 2) / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%`, animationDelay: `${-(i * 0.7) % 3}s` }} />
      ))}
      <div className="scene-light" />
      {!!scene.decor?.length && <svg className="scene-decor" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <radialGradient id="sc-mist"><stop offset="0" stopColor="#fff" stopOpacity=".38" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
          <radialGradient id="sc-sun"><stop offset="0" stopColor={scene.tone} stopOpacity=".9" /><stop offset="1" stopColor={scene.tone} stopOpacity="0" /></radialGradient>
          <linearGradient id="sc-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={scene.tone} stopOpacity=".9" /><stop offset="1" stopColor={scene.tone} stopOpacity="0" /></linearGradient>
          <linearGradient id="sc-aurora" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6BFFB8" stopOpacity="0" /><stop offset=".3" stopColor="#6BFFB8" />
            <stop offset=".65" stopColor={look.main} /><stop offset="1" stopColor={look.light} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sc-canopy"><stop offset="0" stopColor={scene.tone} stopOpacity=".28" /><stop offset="1" stopColor={scene.tone} stopOpacity="0" /></radialGradient>
          <linearGradient id="sc-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={scene.ink ?? "#1B0B3F"} stopOpacity=".7" /><stop offset="1" stopColor={scene.ink ?? "#1B0B3F"} stopOpacity="0" /></linearGradient>
          <filter id="sc-blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        {scene.decor.map((d, i) => (
          <g key={i} className="deco-item" transform={`translate(${d.x} ${d.y}) scale(${(d.s ?? 1) * (d.flip ? -1 : 1)} ${d.s ?? 1})`}>
            <Shape d={d} sc={scene} />
          </g>
        ))}
      </svg>}
      <div className={`scene-particles p-${scene.particles.kind}`}>
        {parts.map((p, i) => (
          <i key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s`, "--sz": p.size, background: look.particles[i % look.particles.length] } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export default memo(JourneyScene);
