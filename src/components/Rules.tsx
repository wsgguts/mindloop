export type RulesGame = "sudoku" | "zip";

// Regras provisórias (hipóteses a confirmar com a equipe MindLoop).
export function RulesContent({ game }: { game: RulesGame }) {
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
      <p><b>Objetivo:</b> preencher a grade 4×4 com os números 1 a 4, sem repetir nenhum em cada linha, coluna ou bloco de 2×2.</p>
      <ul className="list">
        <li>Toque numa casa vazia e escolha um número.</li>
        <li>Casas roxas claras são pistas fixas.</li>
        <li>Se um número repetir, a casa ganha um “!” e uma mensagem explica onde.</li>
        <li>Pode desfazer, pedir uma dica ou reiniciar quando quiser.</li>
      </ul>
      <div className="note info"><b aria-hidden="true">ℹ</b><span>Versão provisória das regras 4×4, ainda a confirmar com a equipe MindLoop.</span></div>
    </div>
  );
}
