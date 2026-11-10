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
- **Tutoriais animados:** cada jogo tem o seu, com passos curtos (explicação, demonstração animada no tabuleiro real do jogo, “Observe”), barra de passos tocável, Voltar/Próximo, Repetir animação, Recomeçar e Pular. Abre sozinho na primeira partida de cada jogo e pode ser reaberto pelo “?” ao lado do título, pelo botão “Como jogar” da partida, pela jornada e pela aba Regras.
- **Tela de parabéns:** **Continuar** abre o **próximo nível** da jornada; se a pessoa não tocar em nada, ao fim do temporizador (6,5 s) ela volta para a **jornada**. As duas ações são independentes: o primeiro evento vence e os demais são ignorados (sem navegação dupla). No nível 100 o botão vira “Ver jornada”. Medalhas ganhas na vitória aparecem ali mesmo, com “Ver todas as conquistas”.
- **Ranking** (aba própria): ranking geral e por jogo (com filtro de dificuldade), pódio, lista, posição e destaque da própria pessoa. Sem login. Veja “Ranking online”.
- **Conquistas** (aba própria): 38 medalhas em 5 categorias e 4 raridades, com progresso, data de obtenção e o que falta.
- **Meu desempenho** (Perfil): partidas, fases, aproveitamento, jornadas, ritmo, recordes, atividade dos últimos 14 dias, comparação entre jogos e, por jogo, tempo médio, melhor tempo, tentativas por vitória, evolução e histórico.
- **Regras:** aba própria com o texto de referência de cada jogo.
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
| `mindloop:tutorial:<jogo>` | tutorial já visto: `done` (até o fim) ou `skipped` (pulado) |
| `mindloop:save` | partida de Mini Sudoku em andamento |
| `mindloop:history` | histórico central de vitórias (jogo, nível, tempo, data, dicas, 1ª vez, recorde), sequência de vitórias e partidas iniciadas por jogo |
| `mindloop:achievements` | conquistas obtidas: id → data |
| `mindloop:rank` | identidade anônima do ranking (id, token, apelido) — só existe se a pessoa entrou no ranking |

**Um evento, todos os sistemas.** Cada vitória passa por um único ponto (`winLevel` em `App.tsx`), chamado uma vez por partida: progresso da jornada → recorde → histórico (`lib/history.ts`) → conquistas (`lib/achievements.ts`) → ranking (`lib/ranking.ts`). Estatísticas (`lib/stats.ts`) são calculadas desse histórico. Cada registro tem id próprio, então recarregar a página não duplica partidas, conquistas ou pontos.
Na primeira abertura desta versão, os melhores tempos já salvos viram registros “importados” (sem data): ninguém perde o que já jogou. Eles contam para médias, recordes e quantidades, mas não para dias jogados nem sessões.

## Médias e estatísticas
- Só vitórias entram no histórico: partidas abandonadas nunca contam como concluídas.
- Tempos de jogos diferentes **não são misturados**: tempo médio e melhor tempo são sempre por jogo.
- Para comparar jogos usa-se o **ritmo** = tempo de referência do nível ÷ tempo gasto (100% = no tempo de referência).
- Médias aparecem a partir de **3 partidas**; antes disso a tela explica que falta jogar.
- **Evolução:** ritmo médio das 5 vitórias mais recentes menos o das 5 anteriores (precisa de 6+).
- **Tentativas por vitória:** partidas iniciadas ÷ vitórias, contadas desde esta versão.

## Pontuação (ranking)
Definida em `src/lib/scoring.ts` e repetida no banco (`supabase/migrations`). O teste `scoring.test.ts` garante que as duas não se separam.
- Tempo de referência do nível = casas da grade × segundos por casa (Sudoku 3, Zip 2, Tango 2,5, Patches 2) × (1 + nível/100), arredondado a 5 s.
- Peso do nível = 1 + 2 × (nível − 1)/99 → 1 a 3.
- Pontos do nível = round(peso × (100 + 100 × min(1, referência ÷ tempo))) → 100×peso a 200×peso. Vale o melhor tempo de cada nível; repetir só melhora se for mais rápido.
- Pontos do jogo = soma dos níveis concluídos (máximo 40.000, igual nos quatro jogos).
- Ranking geral = soma dos jogos × (1 + 0,05 × (jogos jogados − 1)): bônus de consistência.
- Ranking por jogo com faixas de dificuldade: Iniciante (1–30), Intermediário (31–70), Avançado (71–100).

## Conquistas
| Categoria | Conquista (raridade) — condição |
|---|---|
| Tempo | Primeiro Cronômetro (bronze) — 1ª fase · Velocidade Mental (bronze) — fase em até 3 min · Mente Relâmpago (prata) — fase do nível 21+ em até 1 min · Contra o Relógio (bronze) — bater um recorde pessoal · Mestre da Velocidade (ouro) — 10 fases diferentes dentro do tempo de referência |
| Jornadas | Primeiros Passos (bronze) — 1ª fase · Explorador (bronze) — liberar um novo capítulo (10 níveis de uma jornada) · Caminho Percorrido (bronze) — 10 fases · Grande Jornada (prata) — 25 · Mestre das Jornadas (ouro) — 50 · Lenda MindLoop (diamante) — 100 |
| Por jogo (×4) | Primeiro Desafio (bronze) — 1 partida · Especialista (prata) — 10 partidas · Persistência (prata) — 25 partidas · Mestre do Jogo (ouro) — 50 níveis da jornada |
| Constância | Constância (bronze) — 3 dias diferentes · Dedicação (prata) — 7 · Comprometimento (ouro) — 15 · Sem Desistir (prata) — 5 vitórias seguidas sem abandonar · Maratona Mental (ouro) — 10 fases numa sessão (até 30 min entre vitórias) |
| Especiais | Por Conta Própria (bronze) — fase sem dicas · Mente Versátil (prata) — vencer os 4 jogos · Caçador de Recordes (ouro) — 10 recordes · Jornada Completa (diamante) — 100 níveis de uma jornada · Colecionador (ouro) — 10 medalhas · Galeria Lendária (diamante) — 25 medalhas |

Para criar uma conquista nova, acrescente um item em `ACHIEVEMENTS` (`src/lib/achievements.ts`). Os limites de tempo ficam em constantes no mesmo arquivo. Nunca mude o `id` de uma conquista publicada.
Notas: “Primeiro recorde pessoal” do briefing é a mesma condição de “Contra o Relógio”, por isso o especial virou “Caçador de Recordes” (10). Como todas as jornadas já começam liberadas, “Explorador” vale ao liberar um novo capítulo.

## Ranking online (Supabase)
Sem login: na primeira participação o aparelho ganha um **id anônimo + token aleatório** (o banco guarda só o hash do token) e a pessoa escolhe um apelido (único, sem palavrões; dá para trocar ou sair do ranking, o que apaga os dados dela no servidor).
O navegador envia só **(jogo, nível, tempo)**. O servidor **calcula os pontos**, recusa tempos abaixo do mínimo plausível do nível e níveis pulados, e limita envios por minuto. As tabelas têm RLS ligado e nenhuma política: tudo passa por funções (`register_player`, `rename_player`, `delete_player`, `submit_results`, `get_ranking`). O ranking só devolve apelido, pontos e contagens.

**Configuração (uma vez):**
1. Crie um projeto em supabase.com (pode ser o plano gratuito).
2. Rode as migrações, em ordem: `supabase/migrations/20261109000100_ranking.sql` e depois `20261109000200_level_ref.sql` (pelo SQL Editor do painel ou com `supabase db push`). Elas só criam objetos novos e não apagam nada.
3. Em **Project Settings → API**, copie a URL do projeto e a chave **publishable** (ou a “anon”, a antiga).
4. Crie `.env.local` a partir de `.env.example` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, e cadastre as mesmas variáveis na Netlify (Site configuration → Environment variables). Depois, faça um novo deploy.

Sem essas variáveis o app funciona igual e a aba Ranking mostra só a pontuação real da pessoa (nunca jogadores inventados).
Se mudar a fórmula ou os níveis, rode `npx vite-node scripts/gen_ranking_sql.ts` para regenerar `level_ref` e aplique a migração gerada.
**Limites conhecidos:** o servidor não confere a solução do tabuleiro (só tempo e ordem dos níveis), então alguém com conhecimento técnico ainda pode enviar tempos falsos, desde que sejam plausíveis. O progresso de cada pessoa fica no aparelho; trocar de aparelho começa outra identidade no ranking.

## Estrutura
```
src/app/            layout (fontes, metadados), página e estilos globais
src/components/     App (telas e fluxo), Journey, LevelComplete, Celebration, ZoomBoard, GameHeader,
                    useLevelPlay (cronômetro e vitória), um componente por jogo e tutorial/ (sistema de
                    tutoriais: Tutorial.tsx, mini tabuleiros e os passos de cada jogo)
src/lib/            regras e solucionadores de cada jogo, níveis (data/), jornada, recordes, armazenamento,
                    tutorialData.ts (exemplos dos tutoriais, conferidos pelos testes contra as regras reais)
scripts/            geradores de níveis
public/             artes (.webp servidas pelo app; .jpg/.png originais guardados como matriz)
```
Fontes: Space Grotesk (títulos) e Inter (texto), servidas pelo próprio site via `next/font` (sem pedidos ao Google).

## Hipóteses a confirmar com os responsáveis
- As regras do Mini Sudoku e do Zip ainda aparecem marcadas como “versão provisória” na tela de regras.
- O ranking online é opcional e depende da configuração do Supabase (veja acima). Como o público tem 15–18 anos, vale uma revisão de LGPD antes de ligá-lo: só apelido e tempos são enviados, e a pessoa pode sair e apagar os dados.

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
