import TangoSymbol from "./TangoSymbol";

export type RulesGame = "sudoku" | "zip" | "tango";

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

// Regras provisórias (hipóteses a confirmar com a equipe MindLoop).
export function RulesContent({ game }: { game: RulesGame }) {
  if (game === "tango") return <TangoRules />;
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
