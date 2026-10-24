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
- Tema fantasy: logo oficial (`public/logo.jpg`, `public/cube.png`) e banner `public/fantasy.jpg` só nas faixas da entrada e do menu; a área de jogo segue clara.
- Entrada com apelido opcional (salvo só no navegador, em localStorage). Sem login nem dados pessoais.
- Menu: Mini Sudoku e Zip jogáveis; Tango e Patches marcados "Em breve" (sem ação).
- Regras antes da primeira partida e ajuda durante o jogo.
- Partida: seleção de casa, dígitos 1–4 (toque e teclado), conflitos com mensagem textual e ícone "!",
  desfazer, dica (indica uma casa, não revela o número), pausar/retomar, reiniciar e encerrar (com confirmação),
  progresso salvo localmente, tela de conclusão.
- Opinião do jogador: **somente demonstração**. Nada é enviado nem salvo (`src/lib/feedback.ts` é o ponto de integração futuro).

## Hipóteses a confirmar com os responsáveis
1. **Regras do Mini Sudoku**: o manual não as define. Usamos Sudoku 4×4 convencional (dígitos 1–4; sem repetir em linha, coluna e subgrade 2×2).
   Regras em `src/lib/sudoku.ts`; puzzles em `src/lib/puzzles.ts` (3 puzzles, solução única verificada por teste).
2. **Zip** (implementado em `src/lib/zip.ts`): o manual só diz "caminhos e conexões sequenciais"; regras provisórias: ligar números em ordem com um caminho único que cobre todas as casas e termina no maior número (3 puzzles, solução única por teste). Progresso do Zip não é salvo. **Tango e Patches** não têm regras no manual e não foram implementados.
3. **Destino das avaliações** não existe; não há integração.
4. **Logo e arte**: usam os arquivos enviados (logo.jpeg e conceito fantasy), otimizados em `public/`.

## Estrutura
```
src/app/            layout, página e estilos globais (tokens de cor da marca)
src/components/     App (fluxo/telas) e Game (partida)
src/lib/            sudoku.ts (regras), puzzles.ts (dados), storage.ts, feedback.ts
```
Fontes: Space Grotesk (títulos) e Inter (texto) via Google Fonts, com fallback de sistema.
