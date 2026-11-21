# MindLoop

Plataforma de jogos de raciocínio lógico para jovens de 15 a 18 anos. **Lógica sem mistério.**

Quatro jogos — **Mini Sudoku, Zip, Tango e Patches** — cada um com uma jornada ilustrada de **100 níveis** em 10 capítulos, dificuldade crescente, cronômetro, dicas que explicam o raciocínio e tela de conquista. Quem completa as quatro jornadas libera o jogo bônus **Astros** (mais 100 níveis).

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
- **Jornada direto no mapa:** ao abrir um jogo, a pessoa cai no mapa do capítulo em que está, com o próximo nível em “JOGAR”. Cabeçalho: ‹ Início · nome do capítulo (toque = lista de capítulos) · caderno de investigações com contador · ? (rever a partida guiada) · ‹ ›. As investigações aparecem como um **cristal âmbar menor, com lupa**, ao lado do caminho entre o nível que as libera e o seguinte (ligado a ele por uma linha pontilhada); são opcionais.
- **Partida guiada:** na primeira vez em cada jogo, o personagem do jogo conduz uma partida de verdade num tabuleiro pequeno (holofote no que tocar, exemplo errado em vermelho, dicas gentis). Versão curta quando um capítulo muda o tamanho ou a regra. “Pular” sempre visível. Detalhes em `DOCUMENTACAO_ALTERACOES_MINDLOOP.md`.
- **Tela de parabéns:** **Continuar** abre o **próximo nível** da jornada; se a pessoa não tocar em nada, ao fim do temporizador (6,5 s) ela volta para a **jornada**. As duas ações são independentes: o primeiro evento vence e os demais são ignorados (sem navegação dupla). No nível 100 o botão vira “Ver jornada”. Medalhas ganhas na vitória aparecem ali mesmo, com “Ver todas as conquistas”.
- **Ranking** (aba própria): ranking geral e por jogo (com filtro de dificuldade), pódio, lista, posição e destaque da própria pessoa. Sem login. Veja “Conta anônima, progresso no servidor e ranking”.
- **Conquistas** (aba própria): 74 medalhas em 6 categorias (incluindo Investigação) e 4 raridades, com progresso, data de obtenção e o que falta.
- **Meu desempenho** (Perfil): partidas, fases, aproveitamento, jornadas, ritmo, recordes, atividade dos últimos 14 dias, comparação entre jogos e, por jogo, tempo médio, melhor tempo, tentativas por vitória, evolução e histórico.
- **Regras:** aba própria com o texto de referência de cada jogo.
- **Perfil:** abas Desempenho (estatísticas e investigações) e Ajustes (apelido, **Jogar em outro dispositivo** — ver/copiar o código de recuperação ou usar um código —, sons, opinião, Modo Administrador e Reiniciar jogo). O código não aparece mais logo depois de criar o apelido.
- **Modo Administrador** (Perfil → Ajustes, senha `admin`): a conta real fica **pausada** e o app passa a usar um jogador de teste ("Administrador") com tudo liberado (todos os níveis, capítulos, investigações e o jogo bônus). Enquanto ele está ligado, nada vai para o servidor: sem sincronização, **sem ranking e sem pontuação**. Os dados de teste ficam numa área separada do aparelho (`mindloop-admin:*`, em `src/lib/storage.ts`) e as chaves reais não são lidas nem gravadas. Ao tocar em **Desligar**, a área de testes é apagada e a pessoa volta para a própria conta, do ponto em que parou (cada vez que o modo é ligado, o teste começa do zero). A senha fica no código (`src/lib/admin.ts`): ela evita ativação por engano, mas não protege nada.
- **Opinião** (ícone de balão no cabeçalho, ou Perfil → Ajustes): nota e comentário anônimos, enviados ao Netlify Forms (veja abaixo).

### Os jogos
| Jogo | Regra | Grades | Níveis gerados por |
|---|---|---|---|
| Mini Sudoku | números sem repetir em linha, coluna e bloco | 4×4 → 6×6 | `python3 scripts/gen_sudoku.py` |
| Zip | um caminho que liga os números em ordem e passa por todas as casas | 4×4 → 7×7 | `python3 scripts/gen_zip.py` |
| Tango | Cristais e Orbes equilibrados, sem três iguais seguidos, sinais = e × | 4×4 → 8×8 | `node scripts/gen_tango.mjs` |
| Patches | cobrir a grade com retângulos; o número é o tamanho e a etiqueta é o formato (quadrada, em pé, deitada ou livre) | 5×5 → 9×9 | `node scripts/gen_patches.mjs` |
| Astros (bônus) | um astro por linha, coluna e constelação (região colorida), sem dois astros se encostarem, nem na diagonal | 5×5 → 9×9 | `npx vite-node scripts/gen_astros.ts` |

Todos os níveis têm **solução única** e se resolvem **só com lógica** — os testes (`npm test`) conferem isso para os 500 níveis.

**Calibragem de Zip e Tango:** depois de gerar os níveis desses dois jogos, rode `npx vite-node scripts/tune_levels.ts`. Ele mede o esforço de cada nível em hipóteses “E se…?” (Zip: solucionador por dedução de `src/lib/zipLogic.ts`; Tango: as deduções das dicas), acrescenta pistas tiradas da própria solução quando um nível passa do teto do capítulo (`src/lib/difficulty.ts`) e ordena cada capítulo do mais leve ao mais pesado. Os testes conferem os tetos e a curva.

### Astros, o jogo bônus
- **Identidade:** cristal verde-esmeralda com a estrela de oito pontas (recortado da arte do Início em `public/gem-astros.webp`); verde em jornada, tabuleiro, botões, conclusão, investigações e no narrador Lumen (o retrato dourado original fica em `art/cast/`).
- **Liberação:** o card do Astros aparece no Início desde o começo, com cadeado e o progresso de cada jornada principal. Ele abre quando as 4 jornadas (Mini Sudoku, Zip, Tango e Patches) estão completas, junto com a medalha “Senhor dos Quatro Mundos”. No **Modo Administrador** ele já vem liberado, com todos os níveis abertos.
- **Prévia (bloqueado):** tocar na runa do Astros na arte do Início (azul-noite, igual às outras, sem cadeado) ou no card abre uma prévia jogável — a partida real do jogo num céu 5×5 exclusivo (`ASTROS_DEMO`, fora dos 100 níveis), com apresentação e convite no fim. A prévia não grava nada: nem progresso, tempo, histórico, conquistas, tutorial visto nem ranking.
- **Ranking:** depois de liberado, o Astros entra no ranking como jogo próprio e soma no geral, com a mesma fórmula de pontos. No servidor, a migração `20261116000100_astros_ranking.sql` (gerada por `scripts/gen_ranking_sql.ts`) aceita o jogo e só grava resultados do Astros de quem já tem o nível 100 das 4 jornadas registrado.
- **Como se joga:** tocar numa casa alterna vazia → × (anotação) → astro. O botão “Em volta” (marcar × em volta dos astros) faz as marcações óbvias de uma vez. Os erros (linha, coluna ou constelação com dois astros, ou astros encostados) aparecem com o mesmo atraso dos outros jogos.
- **Níveis e dicas:** `src/lib/astrosLogic.ts` tem as regras, o resolvedor (unicidade) e um motor de dedução em 4 níveis de raciocínio: casa única, constelação presa numa linha/coluna, bloqueio e faixas em dupla/trio. O gerador usa esse motor para medir a dificuldade, e a Dica mostra o próximo passo dele, com a explicação. Um teste confere que seguir só as dicas resolve os 100 céus.
- **O que vale para ele:** jornada nos mesmos 10 mundos, tutorial animado, regras, sons próprios (sinos), investigações, conquistas, estatísticas e progresso salvo no servidor. **Fica fora do ranking online**, que continua só com os 4 jogos principais (o servidor não conhece o Astros; incluí-lo exige uma migração nova). Os dados gerados ficam em `src/lib/data/` (não edite à mão).

## Dados salvos no aparelho (localStorage)
| Chave | Conteúdo |
|---|---|
| `mindloop:nick` | apelido |
| `mindloop:progress:<jogo>` | 100 caracteres “0”/“1” (níveis concluídos) |
| `mindloop:times:<jogo>` | melhor tempo (ms) de cada nível |
| `mindloop:last:<jogo>` | último nível jogado |
| `mindloop:tutorial:<jogo>` | tutorial antigo já visto (só lido: quem já viu não precisa ver a partida guiada) |
| `mindloop:guided:<jogo>` | partida guiada já vista: `{"base":1,"c3":1,...}` (completa e versões curtas de cada capítulo) |
| `mindloop:fb-ask` | pedido de opinião na comemoração: partidas completas e quando a pessoa recusou |
| `mindloop:save` | partida de Mini Sudoku em andamento |
| `mindloop:history` | histórico central de vitórias (jogo, nível, tempo, data, dicas, 1ª vez, recorde), sequência de vitórias e partidas iniciadas por jogo |
| `mindloop:achievements` | conquistas obtidas: id → data |
| `mindloop:rank` | identidade anônima (id, token, apelido, código de recuperação, participa do ranking, revisão do progresso no servidor) |
| `mindloop:code-unseen` | (antigo; é apagado ao abrir) o código de recuperação ainda não tinha sido visto |
| `mindloop:cases` | Mindloop Investigação: por mistério, 1ª solução, melhor tempo, menor nº de dicas, XP, se foi pulado e o andamento salvo; histórico de soluções |

**Um evento, todos os sistemas.** Cada vitória passa por um único ponto (`winLevel` em `App.tsx`), chamado uma vez por partida: progresso da jornada → recorde → histórico (`lib/history.ts`) → conquistas (`lib/achievements.ts`) → ranking (`lib/ranking.ts`). Estatísticas (`lib/stats.ts`) são calculadas desse histórico. Cada registro tem id próprio, então recarregar a página não duplica partidas, conquistas ou pontos.
Na primeira abertura desta versão, os melhores tempos já salvos viram registros “importados” (sem data): ninguém perde o que já jogou. Eles contam para médias, recordes e quantidades, mas não para dias jogados nem sessões.

## Mindloop Investigação
Mistérios **opcionais** entre as fases das jornadas: **duas investigações por capítulo, no mundo daquele capítulo** — 20 por jogo, 100 no total. Em todas, a pergunta é a mesma: **onde cada um dos 4 personagens estava e que objeto segurava**. Feitas para iniciantes: uma história curta, poucas regras e a sensação de "fui juntando as pistas e descobri" — **sem guardar hipóteses na cabeça**. Detalhes da reformulação em `DOCUMENTACAO_ALTERACOES_MINDLOOP.md`. Cada caso conta uma pequena história completa — ambientação, introdução, **fichas dos personagens e dos objetos** (tocar no desenho de um objeto abre a ficha), pistas narrativas e desfecho —, escrita em `src/lib/cases/narrativas/<jogo>.ts`, separada da lógica; `src/lib/cases/narrative.test.ts` garante que a lógica (pistas, solução e quadro) é idêntica à fotografia `logic-snapshot.json`.

O cenário segue **as regras do jogo de verdade** (conferido por `gamerules.test.ts`, escrito sem usar o motor), e o **quadro de decisões** tem as grades da mecânica de cada jogo:

| Jogo | Regra do cenário (como no jogo) | Grades do quadro | Pistas típicas |
|---|---|---|---|
| Mini Sudoku | 4×4, cômodos = os quadrados 2×2; uma pessoa por linha, coluna e cômodo | Linha · Coluna · Cômodo · Objeto | "estava na coluna A", "não estava na linha 3", "estava no Claustro" |
| Tango | dois lados (2×4): **Cristal** em cima, **Orbe** embaixo; uma por coluna, metade de cada lado | Lado · Coluna · Objeto | "estava no lado do Cristal", "do mesmo lado do Theo (=)", "no lado oposto (×)" |
| Zip | trilha numerada por todas as casas livres; cada pessoa numa parada | Parada · Objeto | "na 3ª parada", "depois da 4ª parada", "logo depois do Theo" |
| Patches | cômodos retangulares com o tamanho no canto; uma pessoa por cômodo (só importa o cômodo) | Cômodo · Objeto | "no cômodo de 4 casas", "não estava na Cozinha" |
| Astros (bônus) | 4×4: uma pessoa por linha, coluna e região, sem ninguém se encostar | Linha · Coluna · Região · Objeto | "estava na linha 4", "não estava no Braço do Norte" |

- **Pistas:** de 5 a 7, escritas como **depoimentos ou achados** ("Pegadas no chão mostram que a Mel estava na coluna A."). Toda pista vira, direto, ✓ ou ✗ numa grade — e mostra qual (📍 etiqueta da grade). Relações entre duas pessoas (só "logo depois de", "=" e "×") aparecem **depois** que a primeira já foi descoberta. Nada de casa exata, móvel decorativo ou distância.
- **Quadro de decisões:** uma grade por tipo de informação, em abas (personagens × valores); cada toque: **vazio → ✕ → ✓**. A **Ajuda automática** (ligada nos capítulos iniciais) preenche, mais claros, os ✕ óbvios de cada ✓. Quando linha e coluna (ou lado e coluna, parada, cômodo) de alguém estão com ✓, o tabuleiro **sugere a casa** (sem preencher a resposta). Grades largas (as 8 paradas do Zip) aparecem invertidas para caber no celular. Tocar numa pista abre a grade dela e acende as células.
- **Tabuleiro:** nomes dos cômodos legíveis; **casas bloqueadas** com nome e legenda; no Tango, os lados com o símbolo do Cristal e do Orbe.
- **Dicas (até 3):** sempre sobre o próximo passo que a pessoa ainda não marcou — 1) qual pista usar; 2) qual grade e fileira (a célula pisca); 3) a conclusão daquele passo. Nunca a solução inteira. Cada dica reduz 20% do XP.
- **Verificar:** errou, a tela aponta a pista a conferir, sem revelar a solução; acertou, o narrador conta o desfecho e mostra quem estava onde, com qual objeto.
- **Quando aparece:** só ao tocar em **Continuar** na tela de parabéns, depois da fase agendada do capítulo (`src/lib/cases/config.ts`). Pular nunca tira nada. Resolvidos e pulados ficam no **caderno de investigações**.
- **Recompensas:** XP na primeira solução (80 a 220, pela dificuldade), Lupa de Ouro/Prata/Bronze (0, 1 ou 2–3 dicas), melhor tempo e as conquistas da categoria Investigação. Nada disso entra no ranking.
- **Arquivos fáceis de editar:** histórias em `src/lib/cases/stories/` (introdução, pergunta, desfecho, objetos, cômodos e móveis); casos escritos à mão em `src/lib/cases/authored.ts` (o Templo das Estrelas, `sudoku-33`, é o modelo); quem conta as pistas em `src/lib/cases/witness.ts`; personagens e a linha de personalidade em `src/lib/cast.ts`.
- **Motor:** `model.ts` (pistas e conferência), `grids.ts` (as grades de cada jogo), `logic.ts` (o passo a passo: pista → marcações → "última opção"), `generate.ts` (o gerador: escolhe as pistas uma a uma, na ordem, cada uma gerando um ✓ novo), `structures.ts` (formas de raciocínio: 4 comuns + 1 de cada jogo).
- **Banco e validação:** `src/lib/cases/data.ts`, gerado por `npx vite-node scripts/gen_cases.ts` — não edite à mão. `npx vite-node scripts/validate_cases.ts` confere cada caso (solução única, todas as pistas necessárias, resolvível na ordem só com marcações diretas + última opção) e gera `docs/INVESTIGACOES_PISTAS.md` com a tabela **pista → marcações → conclusões** de todos os casos. Os testes (`src/lib/cases/*.test.ts`) conferem o mesmo, mais a regra de cada jogo, cenários coerentes, textos e telas.

## Elenco e avatares

O MindLoop tem um elenco próprio de **62 personagens** (src/lib/cast.ts), com nomes curtos e retratos em /public/cast. Eles são:

- **Avatares do perfil** (Perfil → Avatares): 8 liberados desde o início; os outros chegam jogando — por fases concluídas (somando todas as jornadas, de 5 até 500), por jornada completa (100 fases de um jogo), por mistérios resolvidos (1 a 100) e, para os 5 narradores, por 5 mistérios resolvidos no jogo de cada um. Os bloqueados mostram o que falta e uma barra de progresso; os recém-liberados ganham o selo "Novo". A escolha aparece no topo da tela e no Perfil, e viaja com a conta (preferências do progresso na nuvem). Nada mais é guardado: o desbloqueio é calculado do progresso.
- **Personagens das investigações**: cada mistério usa 4 personagens do elenco (os narradores ficam de fora), e os dois mistérios de um capítulo nunca repetem ninguém.
- **Narradores**: Bit (Mini Sudoku), Dona Coruja (Tango), Guaxi (Zip), Remendo (Patches) e Lumen (Astros) ganharam retrato.

Os **objetos** dos mistérios usam as ilustrações de /public/items (recortadas, sem o fundo de pedra) quando o nome é exatamente o do desenho (lista em `ITEM_ART`); os demais usam emoji. Todos aparecem no visual do MindLoop: cada objeto, móvel e assento é um “cristal” — fundo cósmico, borda neon (objetos em ciano, móveis em violeta, assentos em dourado) e brilho no desenho. Para incluir um personagem novo: acrescente-o em CAST, coloque o retrato em /public/cast/<id>.webp e gere o banco de novo (npx vite-node scripts/gen_cases.ts).

## Mundos das jornadas
Os 10 capítulos de cada jogo acontecem em **10 mundos compartilhados pelos 4 jogos** (capítulo N = mundo N): Reino Celestial, Floresta dos Cristais, Vale das Águas, Templo das Estrelas, Deserto dos Segredos, Montanhas do Dragão, Reino das Auroras, Cidade Perdida, Dimensão do Tempo e Trono do Infinito.
- **Pinturas:** cada mundo tem a sua, em `public/journeys/` (WebP 900 × 1600; o mundo 1 usa `public/journey-trail.webp`). Os originais em PNG ficam em `art/journeys/` (não são publicados no site).
- **Cadastro central:** `src/lib/scenes.ts`, com a pintura, as 10 posições das fases medidas sobre o caminho de cada pintura (`points`), os cristais pintados (`crystals`), as partículas de cada mundo e a identidade de cada jogo (`GAME_LOOK`).
- **Montagem:** `src/components/JourneyScene.tsx` monta, em camadas, a pintura do mundo, depois a identidade do jogo e por cima os botões das fases (`Journey.tsx`, sem mudanças na lógica).
- **Identidade de cada jogo:** a pintura é a mesma nos 4 jogos. Cada jogo muda só a cor dos cristais pintados, a luz do céu e do castelo e as partículas, usando cores que ele já usa no tabuleiro.
- **Testes** (`scenes.test.ts`): conferem que cada pintura existe, que as 10 fases ficam dentro da arte e sobem pela trilha, e que não se sobrepõem nem em celulares de 320 px.
- **Trocar ou adicionar uma pintura:** gere a arte em 9:16, converta para WebP 900 × 1600 em `public/journeys/` e aponte `art` no mundo. Se o caminho tiver outro traçado, meça as 10 posições (de baixo para cima, em px da arte) e informe em `points` (há o atalho `tweak` para mudar só algumas).
- **Mundo sem pintura (recurso de reserva):** sem `art`, o mundo usa a trilha original com gradação de cor (`grade`) e um cenário vetorial (`decor`).

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
| Tempo | Primeiro Cronômetro (bronze) — 1ª fase · Velocidade Mental (bronze) — fase em até 3 min · Mente Relâmpago (prata) — fase do nível 21+ em até 1 min · Contra o Relógio (bronze) — bater um recorde pessoal · Mestre da Velocidade (ouro) — 10 fases diferentes dentro do tempo de referência · Desafio Final (ouro) — fase do nível 91+ dentro do tempo de referência · Mente Afiada (diamante) — 30 fases diferentes dentro do tempo de referência |
| Jornadas | Primeiros Passos (bronze) — 1ª fase · Explorador (bronze) — liberar um novo capítulo (10 níveis de uma jornada) · Caminho Percorrido (bronze) — 10 fases · Grande Jornada (prata) — 25 · Mestre das Jornadas (ouro) — 50 · Lenda MindLoop (diamante) — 100 · Explorador Versátil (prata) — 1º capítulo das 4 jornadas · Meio Caminho em Tudo (ouro) — 50 níveis em cada jornada · Senhor dos Quatro Mundos (diamante) — as 4 jornadas inteiras (400 níveis) |
| Por jogo (×4) | Primeiro Desafio (bronze) — 1 partida · Especialista (prata) — 10 partidas · Persistência (prata) — 25 partidas · Mestre do Jogo (ouro) — 50 níveis da jornada |
| Constância | Constância (bronze) — 3 dias diferentes · Dedicação (prata) — 7 · Comprometimento (ouro) — 15 · Hábito de Mestre (diamante) — 30 · Sem Desistir (prata) — 5 vitórias seguidas sem abandonar · Inabalável (ouro) — 20 seguidas · Maratona Mental (ouro) — 10 fases numa sessão (até 30 min entre vitórias) |
| Investigação | Primeira Pista (bronze) — 1º mistério · Olho Rápido (bronze) — mistério em até 1 min · Detetive (prata) — 10 · Dedução Pura (prata) — 5 sem dicas · Detetive Completo (prata) — 1 mistério em cada jogo · Mil Pistas (prata) — 1.000 XP · Caso Encerrado (prata, ×5) — 5 mistérios do jogo · Detetive Experiente (ouro) — 30 · Coleção de Lupas (ouro) — 20 sem dicas · Raciocínio Versátil (ouro) — 8 estruturas de raciocínio diferentes · Lupa Relâmpago (ouro) — Avançado/Mestre em até 2 min sem dicas · Arquivo Vivo (ouro) — 5.000 XP · Caderno Completo (ouro) — todos os mistérios de um jogo · Mestre Investigador (diamante) — 40 · Detetive de Elite (diamante) — 5 mistérios Mestre sem dicas · Nenhum Mistério Sem Solução (diamante) — todos os 100 |
| Especiais | Por Conta Própria (bronze) — fase sem dicas · Mente Versátil (prata) — vencer os 4 jogos · Mente Independente (ouro) — 25 fases diferentes do nível 21+ sem dicas · Caçador de Recordes (ouro) — 10 recordes · Jornada Completa (diamante) — 100 níveis de uma jornada · Céu de Nove Constelações (ouro) — um céu 9×9 do Astros · Guardião das Estrelas (diamante) — os 100 níveis do Astros · Lenda Absoluta (diamante) — as 5 jornadas, 500 níveis · Colecionador (ouro) — 10 medalhas · Galeria Lendária (diamante) — 25 medalhas · Lenda das Medalhas (diamante) — 50 medalhas |

Para criar uma conquista nova, acrescente um item em `ACHIEVEMENTS` (`src/lib/achievements.ts`). Os limites de tempo ficam em constantes no mesmo arquivo. Nunca mude o `id` de uma conquista publicada.
Notas: “Primeiro recorde pessoal” do briefing é a mesma condição de “Contra o Relógio”, por isso o especial virou “Caçador de Recordes” (10). Como todas as jornadas já começam liberadas, “Explorador” vale ao liberar um novo capítulo.

## Conta anônima, progresso no servidor e ranking (Supabase)
**Sem login.** Ao escolher o apelido, o aparelho ganha uma **identidade anônima** (id + token aleatório; o banco guarda só o hash do token) e um **código de recuperação** de 16 caracteres (ex.: `ABCD-EFGH-JKMN-PQRS`; o banco guarda só o hash). Nenhum e-mail, senha ou dado pessoal.
- **Progresso no servidor:** jornadas, tempos, histórico, conquistas, investigações e preferências ficam também no banco (`player_state`), com número de revisão. Cada gravação no aparelho agenda uma sincronização (2,5 s) e, ao sair do app, ela é feita na hora. A mesclagem (`src/lib/cloud.ts`) nunca perde nada do mesmo jogador: fases se somam, vale o melhor tempo, partidas e conquistas se unem pelo id. Se outro aparelho salvou no meio, o servidor responde `STALE` e o app baixa, mescla e tenta de novo.
- **Limpar os dados do navegador:** a conta continua no servidor. Para voltar a ela: “Já jogou antes? Recuperar com código” (no pedido de apelido) ou Perfil → Ajustes. **Só o código recupera** — digitar o mesmo apelido nunca dá acesso à conta de outra pessoa (o apelido continua único e é recusado). Recuperar num aparelho com progresso de outra conta **substitui** os dados do aparelho (com aviso), nunca mistura históricos.
- **Ranking:** participar é opcional (aba Ranking → Participar). Sair do ranking só esconde o apelido; pontos e progresso continuam guardados.
- **Reiniciar jogo** (Perfil → Ajustes): pede para digitar `REINICIAR`, apaga primeiro no servidor (`reset_player`: jogador, resultados, progresso e aparelhos numa única transação; o apelido fica livre) e só depois no aparelho; recarrega já pedindo um novo apelido. Sem internet, nada é apagado.
- O navegador envia só **(jogo, nível, tempo)** para o ranking; o servidor **calcula os pontos**, recusa tempos impossíveis e níveis pulados e limita envios por minuto. RLS ligado e nenhuma política: tudo passa por funções. O ranking devolve só apelido, pontos e contagens.

**Configuração (uma vez):**
1. Crie um projeto em supabase.com (pode ser o plano gratuito).
2. Rode as migrações, em ordem (SQL Editor ou `supabase db push`): `20261109000100_ranking.sql`, `20261109000200_level_ref.sql`, `20261114000100_identity.sql` e `20261116000100_astros_ranking.sql`. Todas só acrescentam objetos e não apagam dados; a última pode ser aplicada num banco que já tem jogadores (eles continuam no ranking e o token antigo continua valendo; ao abrir o app, cada um recebe um código de recuperação).
3. Em **Project Settings → API**, copie a URL do projeto e a chave **publishable** (ou a “anon”, a antiga).
4. Crie `.env.local` a partir de `.env.example` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, e cadastre as mesmas variáveis na Netlify. Depois, faça um novo deploy.

Sem essas variáveis o app funciona igual, só no aparelho, e a aba Ranking mostra só a pontuação real da pessoa.
Se mudar a fórmula ou os níveis, rode `npx vite-node scripts/gen_ranking_sql.ts` para regenerar `level_ref` e aplique a migração gerada.
**Limites conhecidos:** o servidor não confere a solução do tabuleiro (só tempo e ordem dos níveis). Quem perder o código **e** os dados do navegador não recupera a conta (é o preço de não ter login); o apelido antigo continua reservado para ela.

## Validação das jogadas
Erros (número repetido, três símbolos iguais, peça errada, pista contrariada nas investigações) **não aparecem a cada toque**: só depois que o tabuleiro fica parado por `ERROR_REVEAL_MS` (1,2 s, em `src/components/useRevealedErrors.ts`, igual para os 4 jogos e as investigações). Erro corrigido some na hora; casa alterada recomeça a espera; o som de erro e a contagem que acende o botão Dica só contam erros revelados. Pedir uma dica mostra tudo na hora. No Zip, passar por um número fora de ordem continua sendo bloqueado (é uma regra de movimento, como uma parede).

## Estrutura
```
src/app/            layout (fontes, metadados), página e estilos globais
src/components/     App (telas e fluxo), Journey, LevelComplete, Celebration, ZoomBoard, GameHeader,
                    useLevelPlay (cronômetro e vitória), um componente por jogo, guided/ (partida guiada:
                    motor e roteiros de cada jogo) e tutorial/minis.tsx (mini tabuleiros)
src/lib/            regras e solucionadores de cada jogo, níveis (data/), jornada, recordes, armazenamento,
                    tutorialData.ts (tabuleiros da partida guiada, conferidos pelos testes contra as regras reais)
                    guided.ts (quando mostrar a partida guiada e o que já foi visto)
scripts/            geradores de níveis
public/             artes servidas pelo app (.webp)
art/                originais das artes (matrizes em .jpg/.png; não vão para o site)
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
