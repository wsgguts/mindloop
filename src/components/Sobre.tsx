// Aba "Sobre" do Perfil: quem fez o MindLoop e por quê.
// Os TEXTOS ficam em src/content/sobre.ts (edite lá). Este arquivo só monta a tela.
//
// Ordem pensada para quem lê no celular (do mais importante para o detalhe):
//  1. Topo: o que é, em uma frase, e de onde vem (selos);
//  2. Para quem é e o que se exercita (cartões curtos, fáceis de bater o olho);
//  3. Ligação com a faculdade;
//  4. Pessoas: orientação e equipes (iniciais coloridas, cristais dos jogos de cada grupo, o bônus feito por todos,
//     legenda das siglas);
//  5. Propósito e a frase final; rodapé.
import { Fragment } from "react";
import Gem from "./Gem";
import { GAME_META } from "../lib/games";
import { SOBRE } from "../content/sobre";

/** Transforma **trecho** em negrito (o resto fica como texto comum). */
function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}</>;
}

/** Iniciais do nome (primeiro e último): "Marcos Vinícius Fortunato" → "MF". */
const initials = (name: string) => {
  const w = name.replace(/^Profa?\.\s*/, "").split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? "") + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
};

/** Cor fixa por pessoa (a mesma sempre), dentro da paleta do app. */
const HUES = ["#762CEB", "#12A3B5", "#E0459F", "#E08A00", "#3B5BDB", "#2BA36B"];
const hueOf = (name: string) => HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return <span className="ab-ini" aria-hidden="true" style={{ "--hue": hueOf(name), width: size, height: size, fontSize: size * 0.38 } as React.CSSProperties}>{initials(name)}</span>;
}

export default function Sobre() {
  const { topo, paraQuem, faculdade, orientacao, equipe, proposito, rodape } = SOBRE;
  const legenda = equipe.papeis.filter((p) => p.sigla && p.significado); // sigla sem explicação não entra na legenda
  return (
    <div className="about">
      <section className="ab-hero" aria-labelledby="ab-title">
        <img className="ab-cube" src="/cube.png" width={96} height={82} alt="" aria-hidden="true" />
        <p className="ab-eyebrow">{topo.sobretitulo}</p>
        <h2 id="ab-title">{topo.titulo}</h2>
        <p className="ab-lead"><Rich text={topo.texto} /></p>
        <ul className="ab-seals" aria-label="Origem do projeto">
          {topo.selos.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section className="ab-sec" aria-labelledby="ab-who">
        <h3 id="ab-who">{paraQuem.titulo}</h3>
        <p><Rich text={paraQuem.texto} /></p>
        <p className="ab-kicker">{paraQuem.subtitulo}</p>
        <ul className="ab-skills">
          {paraQuem.habilidades.map((h) => <li key={h.nome}><span aria-hidden="true">{h.icone}</span>{h.nome}</li>)}
        </ul>
      </section>

      <section className="ab-sec" aria-labelledby="ab-fac">
        <h3 id="ab-fac">{faculdade.titulo}</h3>
        {faculdade.paragrafos.map((t, i) => <p key={i}><Rich text={t} /></p>)}
      </section>

      <section className="ab-sec" aria-labelledby="ab-ori">
        <h3 id="ab-ori">{orientacao.titulo}</h3>
        <div className="ab-person">
          <Avatar name={orientacao.nome} size={48} />
          <div><b>{orientacao.nome}</b><span>{orientacao.descricao}</span></div>
        </div>
      </section>

      <section className="ab-sec" aria-labelledby="ab-team">
        <h3 id="ab-team">{equipe.titulo}</h3>
        <p>{equipe.texto}</p>
        <div className="ab-groups">
          {equipe.grupos.map((g) => (
            <article key={g.nome} className="ab-group" style={{ "--g1": GAME_META[g.jogos[0]].color, "--g2": GAME_META[g.jogos[g.jogos.length - 1]].color } as React.CSSProperties}>
              <header>
                <span className="ab-gems" aria-hidden="true">{g.jogos.map((j) => <Gem key={j} kind={j} size={30} />)}</span>
                <div><b>{g.nome}</b><span>{g.jogos.map((j) => GAME_META[j].name).join(" e ")}</span></div>
              </header>
              <ul>
                {g.pessoas.map((p) => (
                  <li key={p.nome}>
                    <Avatar name={p.nome} />
                    <span className="ab-name">{p.nome}</span>
                    {"papel" in p && p.papel && <abbr className="ab-role" title={equipe.papeis.find((x) => x.sigla === p.papel)?.significado || undefined}>{p.papel}</abbr>}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="ab-bonus">
          <span className="ab-bonus-pic" aria-hidden="true"><Gem kind="astros" size={34} /><i>🔍</i></span>
          <div><b>{equipe.bonus.titulo}</b><p><Rich text={equipe.bonus.texto} /></p></div>
        </div>
        {legenda.length > 0 && (
          <dl className="ab-legend">
            {legenda.map((p) => <div key={p.sigla}><dt>{p.sigla}</dt><dd>{p.significado}</dd></div>)}
          </dl>
        )}
      </section>

      <section className="ab-purpose" aria-labelledby="ab-pur">
        <h3 id="ab-pur">{proposito.titulo}</h3>
        <p><Rich text={proposito.texto} /></p>
        <p className="ab-quote">{proposito.frase}</p>
      </section>

      <p className="ab-foot">{rodape}</p>
    </div>
  );
}
