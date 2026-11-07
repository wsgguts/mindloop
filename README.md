# MindLoop

Plataforma de jogos de raciocínio lógico para jovens de 15 a 18 anos. **Lógica sem mistério.**

Quatro jogos — **Mini Sudoku, Zip, Tango e Patches** — cada um com uma jornada ilustrada de **100 níveis** em 10 capítulos, dificuldade crescente, cronômetro, dicas que explicam o raciocínio e tela de conquista.

## Como rodar
Requer Node.js 18.18+.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes (regras, níveis, progressão)
npm run typecheck
npm run build && npm start
```
O projeto fica no OneDrive; `scripts/link-next.mjs` (rodado antes do `dev` e do `build`) guarda a pasta `.next` fora dele para evitar travas de sincronização.

## O que existe
- **Início:** a arte original é a central dos jogos — os cristais da arte, os cards, o nome e o botão “Jogar agora” abrem a jornada do jogo. No primeiro acesso, um painel pede o apelido (2–20 caracteres, salvo só no aparelho).
- **Jornada:** trilha ilustrada com 10 capítulos de 10 níveis; o 10º é o desafio do capítulo. Os níveis abrem em sequência. Ao voltar de uma vitória, o próximo nível aparece destacado; com a jornada completa, todos ficam livres e a volta é para o nível repetido.
- **Partida (todos os jogos):** cronômetro (pausa com a aba em segundo plano), desfazer, dica com explicação, reiniciar com confirmação, regras sem perder o progresso, zoom por pinça/botões (60% a 300%), animação de conclusão no tabuleiro e tela de parabéns com tempo, recorde e progresso da jornada.
- **Celular deitado:** a navegação vira um trilho lateral e o tabuleiro fica ao lado dos controles, do tamanho da tela.
- **Regras:** aba própria e painel dentro de cada jogo (abre sozinho na primeira partida).
- **Opinião** (Perfil → Dar opinião): nota e comentário anônimos, enviados ao Netlify Forms (veja abaixo).

### Os jogos
| Jogo | Regra | Grades | Níveis gerados por |
|---|---|---|---|
| Mini Sudoku | números sem repetir em linha, coluna e bloco | 4×4 → 6×6 | `python3 scripts/gen_sudoku.py` |
| Zip | um caminho que liga os números em ordem e passa por todas as casas | 4×4 → 7×7 | `python3 scripts/gen_zip.py` |
| Tango | Cristais e Orbes equilibrados, sem três iguais seguidos, sinais = e × | 4×4 → 8×8 | `node scripts/gen_tango.mjs` |
| Patches | cobrir a grade com retângulos; o número é o tamanho e a etiqueta é o formato (quadrada, em pé, deitada ou livre) | 5×5 → 9×9 | `node scripts/gen_patches.mjs` |

Todos os níveis têm **solução única** e se resolvem **só com lógica** — os testes (`npm test`) conferem isso para os 400 níveis. Os dados gerados ficam em `src/lib/data/` (não edite à mão).

## Dados salvos no aparelho (localStorage)
| Chave | Conteúdo |
|---|---|
| `mindloop:nick` | apelido |
| `mindloop:progress:<jogo>` | 100 caracteres “0”/“1” (níveis concluídos) |
| `mindloop:times:<jogo>` | melhor tempo (ms) de cada nível |
| `mindloop:last:<jogo>` | último nível jogado |
| `mindloop:rules`, `mindloop:rules-<jogo>` | regras já vistas |
| `mindloop:save` | partida de Mini Sudoku em andamento |

## Estrutura
```
src/app/            layout (fontes, metadados), página e estilos globais
src/components/     App (telas e fluxo), Journey, LevelComplete, Celebration, ZoomBoard, GameHeader,
                    useLevelPlay (cronômetro e vitória) e um componente por jogo
src/lib/            regras e solucionadores de cada jogo, níveis (data/), jornada, recordes, armazenamento
scripts/            geradores de níveis
public/             artes (.webp servidas pelo app; .jpg/.png originais guardados como matriz)
```
Fontes: Space Grotesk (títulos) e Inter (texto), servidas pelo próprio site via `next/font` (sem pedidos ao Google).

## Hipóteses a confirmar com os responsáveis
- As regras do Mini Sudoku e do Zip ainda aparecem marcadas como “versão provisória” na tela de regras.
- O ranking citado no briefing de UX **não** foi implementado (o escopo do MVP exclui ranking); o apelido identifica a pessoa apenas neste aparelho.

## Opiniões dos usuários (Netlify Forms)
A tela **Perfil → Dar opinião** envia nota e comentário para o formulário `opiniao`. O arquivo `public/__forms.html` é um formulário "fantasma" que só serve para a Netlify detectar o formulário no deploy (o app em Next.js monta o formulário com JavaScript). **Não apague esse arquivo** e mantenha os nomes dos campos iguais aos de `src/lib/feedback.ts`.

**Configuração (uma vez):**
1. Publique o projeto na Netlify (como o restante do app).
2. No painel da Netlify, abra o site → **Forms** e confirme que a detecção de formulários está ligada; se tiver acabado de ligar, faça um novo deploy.
3. Abra o site publicado, envie uma opinião de teste e confira se ela aparece em **Forms → opiniao**.
4. Para receber aviso por e-mail, crie uma notificação em **Forms → Form notifications** (os nomes dos menus podem variar um pouco).

**Observações**
- Rodando local (`npm run dev`) o envio mostra a mensagem de erro, pois o Netlify Forms só existe no site publicado.
- Contra robôs há um campo-armadilha (`bot-field`) e o filtro da própria Netlify.
- Limite de envios: depende do plano da conta (contas antigas: 100 por mês por site). Confira o seu na Netlify.
- Privacidade: só nota e comentário são enviados; o texto da tela pede para não escrever dados pessoais. Como o público tem 15–18 anos, vale uma revisão de LGPD antes de divulgar.
