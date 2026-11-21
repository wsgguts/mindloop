// Efeitos de ambiente por cima da arte do Início (celular e computador). Só enfeite: não recebe toques
// (os cristais e o "Jogar agora" continuam clicáveis embaixo), é escondido de leitores de tela e fica parado
// para quem pediu menos movimento no aparelho. Posições em lib/homeFx.ts; estilos em globals.css ("Efeitos do Início").
//  • céu: um véu de luz (aurora) que passa devagar e brilhos de estrela que piscam;
//  • runas: cada cristal "respira" um brilho na cor do jogo (o Astros, azul-noite enquanto bloqueado, verde depois);
//  • hexágonos com o símbolo da FAETERJ: acendem e apagam, cada um num tempo diferente;
//  • ambiente (como nas jornadas): vaga-lumes que sobem da grama e das ilhas, poeira de luz no céu e névoa
//    que passa devagar sobre as nuvens de baixo.
import type { FxLayout } from "../lib/homeFx";

const GEM_COLOR: Record<string, string> = { sudoku: "#F05BC8", zip: "#12CFE0", tango: "#FF9A2E", patches: "#8A5CFF" };

/** Número "aleatório" estável (o mesmo a cada abertura, sem diferença entre servidor e navegador). */
const rnd = (i: number, k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
const FLY_COLORS = ["#FFE58A", "#9DF7FF", "#FFB3EC", "#C8FF9E"];
const FLIES = 16;
const MOTES = 14;

/** Atraso "embaralhado" e estável para cada item (os brilhos não piscam todos juntos). */
const delay = (i: number, every: number) => `${-((i * 7919) % 97) / 97 * every}s`;

export default function HomeFx({ layout, astrosOpen }: { layout: FxLayout; astrosOpen: boolean }) {
  return (
    <div className="hfx" aria-hidden="true">
      <i className="hfx-aurora" />
      <i className="hfx-mist" style={{ top: `${layout.mist}%` }} />
      <i className="hfx-mist b" style={{ top: `${layout.mist + 9}%` }} />
      {layout.stars.map((p, i) => (
        <i key={`s${i}`} className="hfx-star" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: delay(i, 4.6), animationDuration: `${3.6 + (i % 4) * 0.8}s` } as React.CSSProperties} />
      ))}
      {layout.gems.map((g, i) => (
        <i key={g.id} className="hfx-gem" style={{ left: `${g.x}%`, top: `${g.y}%`, "--c": g.id === "astros" ? (astrosOpen ? "#3BE070" : "#6F7CFF") : GEM_COLOR[g.id], animationDelay: `${-i * 0.9}s` } as React.CSSProperties} />
      ))}
      {layout.hex.map((p, i) => (
        <i key={`h${i}`} className="hfx-hex" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: delay(i + 3, 6.5), animationDuration: `${5.5 + (i % 3) * 1.2}s` } as React.CSSProperties} />
      ))}
      {Array.from({ length: MOTES }, (_, i) => (
        <i key={`m${i}`} className="hfx-mote" style={{ left: `${4 + rnd(i, 1) * 92}%`, top: `${6 + rnd(i, 2) * 50}%`, animationDelay: `${-rnd(i, 3) * 9}s`, animationDuration: `${7 + rnd(i, 4) * 5}s` }} />
      ))}
      {Array.from({ length: FLIES }, (_, i) => {
        const f = layout.flies;
        return (
          <i key={`f${i}`} className="hfx-fly" style={{ left: `${f.x0 + rnd(i, 5) * (f.x1 - f.x0)}%`, top: `${f.y0 + rnd(i, 6) * (f.y1 - f.y0)}%`, color: FLY_COLORS[i % FLY_COLORS.length], "--sz": 0.7 + rnd(i, 7) * 0.8, animationDelay: `${-rnd(i, 8) * 11}s`, animationDuration: `${8 + rnd(i, 9) * 6}s` } as React.CSSProperties} />
        );
      })}
    </div>
  );
}
