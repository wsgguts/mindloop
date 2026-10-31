# MindLoop — MVP (Mini Sudoku)

Plataforma de jogos de raciocínio lógico para jovens de 15 a 18 anos. **Lógica sem mistério.**

## Como rodar (VS Code)
Requer Node.js 18.18+.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes da lógica do Sudoku
npm run typecheck
npm run build && npm start
```

## O que existe
- Ícones dos jogos: recortados da arte original (`public/gem-*.png`; as etiquetas de texto foram retiradas só nos recortes). Cores e fundo seguem a paleta da arte.
- **Home:** a arte original (`public/home-art.jpg`, sem filtros; a barra de ícones desenhada na base da arte foi cortada, pois não é funcional), com o botão Jogar sobre o "JOGAR AGORA" da arte. Barra de navegação inferior fixa: Início, Jogos, Regras e Perfil.
- **Primeiro acesso:** ao tocar em Jogar, um painel pede o apelido (obrigatório, 2–20 caracteres, validado). Fica salvo só no aparelho; nos acessos seguintes o Jogar vai direto à seleção de jogos.
- Menu: Mini Sudoku e Zip jogáveis; Tango e Patches marcados "Em breve" (sem ação).
- Regras: aba própria (Regras) e painel "Regras" dentro de cada jogo, que abre sem perder o progresso. Aparece sozinho na primeira partida de cada jogo.
- Partida: seleção de casa, dígitos 1–4 (toque e teclado), conflitos com mensagem textual e ícone "!",
  desfazer, dica (indica uma casa, não revela o número), pausar/retomar, reiniciar e encerrar (com confirmação),
  progresso salvo localmente, tela de conclusão.
- Opinião do jogador: **somente demonstração**. Nada é enviado nem salvo (`src/lib/feedback.ts` é o ponto de integração futuro).

## Hipóteses a confirmar com os responsáveis
1. **Regras do Mini Sudoku**: o manual não as define. Usamos Sudoku convencional em grades pequenas: 4×4 (dígitos 1–4, blocos 2×2) e 6×6 (dígitos 1–6, 6 blocos de 2 linhas × 3 colunas), sem repetir em linha, coluna e bloco.
   Regras em `src/lib/sudoku.ts`; puzzles em `src/lib/puzzles.ts` (3 puzzles: dois 4×4 e o "Quase lá" 6×6; solução única verificada por teste).
2. **Zip** (implementado em `src/lib/zip.ts`): o manual só diz "caminhos e conexões sequenciais"; regras provisórias: ligar números em ordem com um caminho único que cobre todas as casas e termina no maior número (3 puzzles, solução única por teste). Progresso do Zip não é salvo. **Tango e Patches** não têm regras no manual e não foram implementados.
3. **Destino das avaliações** não existe; não há integração.
4. **Logo e arte**: derivadas dos arquivos enviados, otimizadas em `public/`.

## Estrutura
```
src/app/            layout, página e estilos globais (tokens de cor da marca)
src/components/     App (fluxo/telas) e Game (partida)
src/lib/            sudoku.ts (regras), puzzles.ts (dados), storage.ts, feedback.ts
```
Fontes: Space Grotesk (títulos) e Inter (texto) via Google Fonts, com fallback de sistema.

> Observação: o ranking citado no briefing de UX **não** foi implementado (o escopo do MVP exclui ranking e comparação). O apelido identifica a pessoa apenas neste aparelho.

## Jornada de níveis (100 por jogo)
A seleção de puzzles virou uma trilha de **100 níveis por jogo** (Mini Sudoku e Zip), em **10 capítulos de 10 níveis**.
- Os níveis abrem **em sequência**: concluir o nível N libera o N+1. O 10º de cada capítulo é o "desafio do capítulo".
- O progresso fica só no aparelho (`mindloop:progress:sudoku` e `mindloop:progress:zip`, uma string de 100 caracteres "0"/"1").
- **Mini Sudoku:** níveis 1–20 em 4×4 (de 12 a 5 pistas) e 21–100 em 6×6 com blocos 2×3 (de 24 a 11 pistas). Todos têm solução única e podem ser resolvidos só com lógica.
- **Zip:** grades de 4×4 a 7×7; a dificuldade cresce com o tamanho e com a redução de pontos numerados. Todos têm solução única.
- Os níveis são **gerados** por `python3 scripts/gen_sudoku.py` e `python3 scripts/gen_zip.py` (arquivos em `src/lib/data/`, não edite à mão). Os testes (`npm test`) conferem que os 100 níveis de cada jogo existem e têm solução única.
- Ao concluir um nível aparece uma tela rápida de parabéns (`src/components/Congrats.tsx`) com o número do nível; ela volta sozinha para a trilha em ~3,5 s ou ao tocar em **Continuar**. No 10º nível de cada capítulo ela avisa que o capítulo foi concluído.
- Código: `src/lib/journey.ts` (capítulos e progresso), `src/components/Journey.tsx` (tela da trilha).
