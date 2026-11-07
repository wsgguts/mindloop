import TangoSymbol from "./TangoSymbol";
import type { JourneyGame } from "../lib/journey";
import { PATCHES_EXAMPLE } from "../lib/patches";
import PatchesTag, { KIND_HELP } from "./PatchesTag";

export type RulesGame = JourneyGame;

const C = () => <TangoSymbol v={1} size={20} />;
const O = () => <TangoSymbol v={2} size={20} />;
const Gap = () => <span className="tex-gap" aria-hidden="true" />;
/** Exemplo visual curto (os símbolos ficam ocultos para leitores de tela; o texto ao lado explica). */
const Ex = ({ children }: { children: React.ReactNode }) => <span className="tex" aria-hidden="true">{children}</span>;

function TangoRules() {
  return (
    <div className="stack">
      <p><b>Objetivo:</b> preencher todas as casas com <b>Cristais</b> <C /> e <b>Orbes</b> <O />, respeitando as três regras abaixo.</p>
      <h3>Regras</h3>
      <ol className="list">
        <li><b>Nada de três iguais seguidos.</b> Numa linha ou coluna, no máximo dois símbolos iguais podem ficar lado a lado.</li>
        <li><b>Equilíbrio.</b> Cada linha e cada coluna tem a mesma quantidade de Cristais e Orbes: 2 e 2 na grade 4×4, 3 e 3 na 6×6, 4 e 4 na 8×8.</li>
        <li><b>Sinais entre casas.</b> “=” quer dizer que as duas casas têm o mesmo símbolo; “×” quer dizer que são diferentes.</li>
      </ol>
      <p className="muted">Casas com fundo mais escuro são pistas fixas. Cada nível tem uma única solução e pode ser resolvido só com lógica, sem chutar.</p>

      <h3>Como jogar</h3>
      <ul className="list">
        <li>Toque numa casa: vazia → Cristal → Orbe → vazia. Ou selecione a casa e use os botões abaixo da grade.</li>
        <li>Se algo quebrar uma regra, a casa ganha um “!” e uma mensagem explica o motivo.</li>
        <li>Desfazer volta a última jogada. Dica mostra o próximo passo lógico e explica o porquê.</li>
        <li>No teclado: setas movem, 1 coloca Cristal, 2 coloca Orbe e Backspace apaga.</li>
      </ul>

      <h3>Dicas para resolver</h3>
      <ul className="list tips">
        <li><b>Par:</b> dois iguais lado a lado? As casas nas duas pontas são do outro símbolo. <Ex><C /><C /> → <O /><C /><C /><O /></Ex></li>
        <li><b>Sanduíche:</b> uma casa vazia entre dois iguais é do outro símbolo. <Ex><C /><Gap /><C /> → <C /><O /><C /></Ex></li>
        <li><b>Contagem:</b> se a linha já tem metade de um símbolo, todas as vazias dela são do outro.</li>
        <li><b>Sinais em cadeia:</b> descobriu uma casa ligada por “=” ou “×”? A vizinha também está resolvida. E duas “×” seguidas (A × B × C) significam que A e C são iguais.</li>
        <li><b>Pontas e meio:</b> em linhas com poucas vazias, teste mentalmente as poucas combinações que mantêm o equilíbrio.</li>
        <li><b>E se…?</b> Travou? Imagine um símbolo numa casa e siga as regras. Se aparecerem três iguais ou a contagem estourar, a casa é do outro símbolo.</li>
      </ul>
    </div>
  );
}

/** Mini tabuleiro de exemplo: os números (antes) e as peças encaixadas (depois). */
function PatchesExample() {
  const grid = (withPieces: boolean) => (
    <span className="pex">
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="pex-cell" style={{ gridRow: Math.floor(i / 4) + 1, gridColumn: (i % 4) + 1 }} />)}
      {withPieces && PATCHES_EXAMPLE.pieces.map(([r, c, h, w, color], i) => <span key={i} className="pex-piece" style={{ gridRow: `${r + 1} / span ${h}`, gridColumn: `${c + 1} / span ${w}`, "--pc": color } as React.CSSProperties} />)}
      {PATCHES_EXAMPLE.clues.map(([r, c, v, kind], i) => <span key={i} className="pex-num" style={{ gridRow: r + 1, gridColumn: c + 1 }}><PatchesTag v={v} kind={kind} color={PATCHES_EXAMPLE.pieces[i][4]} /></span>)}
    </span>
  );
  return <div className="pex-row" aria-hidden="true">{grid(false)}<span className="pex-arrow">→</span>{grid(true)}</div>;
}

function PatchesRules() {
  return (
    <div className="stack">
      <p><b>Objetivo:</b> cobrir toda a grade com peças retangulares (quadrados também valem), sem deixar casa vazia e sem sobrepor peças.</p>
      <h3>Regras</h3>
      <ol className="list">
        <li><b>Um número por peça.</b> Cada peça precisa conter exatamente um número.</li>
        <li><b>O número é o tamanho.</b> Ele diz quantas casas a peça ocupa: um 6 pode ser 1×6, 2×3, 3×2 ou 6×1.</li>
        <li><b>Grade completa.</b> Toda casa fica dentro de uma peça, e as peças não se sobrepõem.</li>
        <li><b>O formato da etiqueta é o formato da peça.</b>
          <ul className="ptlegend big">
            {(["q", "v", "h", "a"] as const).map((kd) => (
              <li key={kd}><span className="ptl-tag" aria-hidden="true"><PatchesTag v={kd === "q" ? 4 : kd === "a" ? 2 : 6} kind={kd} color="#9A6BFF" /></span>
                <span><b>{kd === "q" ? "Quadrada" : kd === "v" ? "Em pé" : kd === "h" ? "Deitada" : "Livre"}:</b> {KIND_HELP[kd]}.</span></li>
            ))}
          </ul>
        </li>
      </ol>
      <PatchesExample />
      <p className="muted">No exemplo: o 3 com etiqueta deitada vira uma faixa 1×3, o 3 e o 2 com etiquetas em pé ficam de pé (3×1 e 2×1) e o 4 com etiqueta quadrada forma um quadrado 2×2. Cada nível tem uma única solução e pode ser resolvido só com lógica, sem chutar.</p>

      <h3>Como jogar</h3>
      <ul className="list">
        <li><b>Arraste</b> de um canto da peça até o canto oposto. Enquanto arrasta, o tamanho aparece na peça (ex.: 2×3 = 6).</li>
        <li>Prefere tocar? <b>Toque num canto</b> e depois <b>no canto oposto</b>.</li>
        <li><b>Toque numa peça</b> para tirá-la. Desenhar por cima também troca as peças que estavam ali.</li>
        <li>Se uma peça quebrar uma regra, ela ganha um “!” e uma mensagem explica o motivo.</li>
        <li>Desfazer volta a última jogada. Dica mostra o próximo encaixe lógico e explica o porquê.</li>
        <li>No teclado: setas escolhem a casa, Enter marca os cantos e Delete tira a peça.</li>
      </ul>

      <h3>Dicas para resolver</h3>
      <ul className="list tips">
        <li><b>Encaixe único:</b> números perto de cantos e bordas costumam ter poucos formatos. Comece por eles.</li>
        <li><b>Números primos:</b> 2, 3, 5, 7, 11 e 13 só formam faixas retas (1×5 ou 5×1, por exemplo).</li>
        <li><b>Casa sem dono:</b> procure casas que só um número consegue alcançar — a peça dele precisa passar por ali.</li>
        <li><b>Casas reservadas:</b> se todo encaixe possível de um número usa a mesma casa, nenhum outro número pode usá-la.</li>
        <li><b>Vizinhos apertados:</b> quando dois números estão próximos, as peças de um limitam os formatos do outro.</li>
      </ul>
    </div>
  );
}

// Regras provisórias (hipóteses a confirmar com a equipe MindLoop).
export function RulesContent({ game }: { game: RulesGame }) {
  if (game === "tango") return <TangoRules />;
  if (game === "patches") return <PatchesRules />;
  return game === "zip" ? (
    <div className="stack">
      <p><b>Objetivo:</b> traçar um único caminho que liga os números em ordem (1, 2, 3…), passa por todas as casas uma só vez e termina no maior número.</p>
      <ul className="list">
        <li>O caminho começa no 1. Arraste o dedo ou toque nas casas vizinhas (sem diagonais).</li>
        <li>Você só entra num número depois de passar pelo anterior.</li>
        <li>Toque numa casa do caminho, ou use Desfazer, para voltar e tentar outra rota.</li>
        <li>No teclado: setas estendem o caminho e Backspace volta um passo.</li>
      </ul>
      <div className="note info"><b aria-hidden="true">ℹ</b><span>Versão provisória das regras do Zip, ainda a confirmar com a equipe MindLoop.</span></div>
    </div>
  ) : (
    <div className="stack">
      <p><b>Objetivo:</b> preencher a grade com os números de 1 até o tamanho dela (1 a 4 na grade 4×4; 1 a 6 na grade 6×6), sem repetir nenhum em cada linha, coluna ou bloco.</p>
      <ul className="list">
        <li>Toque numa casa vazia e escolha um número.</li>
        <li>Os blocos são as áreas separadas por linhas mais grossas: 2×2 na grade 4×4 e 2 linhas × 3 colunas na grade 6×6.</li>
        <li>Casas roxas claras são pistas fixas.</li>
        <li>Se um número repetir, a casa ganha um “!” e uma mensagem explica onde.</li>
        <li>Pode desfazer, pedir uma dica ou reiniciar quando quiser.</li>
      </ul>
      <div className="note info"><b aria-hidden="true">ℹ</b><span>Versão provisória das regras (grades 4×4 e 6×6), ainda a confirmar com a equipe MindLoop.</span></div>
    </div>
  );
}
