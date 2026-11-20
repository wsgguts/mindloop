# MindLoop — Alterações após o teste com alunos

No teste, a tarefa dos alunos era: entrar em um jogo, jogar uma partida completa e dar uma opinião. Vários travaram no caminho. As correções abaixo foram feitas na ordem 5 → 1 → 2 → 3 → 4. Nenhuma apaga ou muda o progresso salvo (aparelho ou conta).

## 5. Menu e botões que "somem"

**O que foi encontrado** (testado em 360×640, 390×844, 412×915, 640×360, 844×390 e 1366×768, com o Modo Administrador ligado e desligado):

- **Procede — menu escondido na partida.** No celular em pé, a barra de navegação era escondida de propósito durante a partida, a investigação e a prévia do Astros (`.bnav.in-game { display: none }`), e a volta era só pelo "‹" pequeno do cabeçalho. Para quem não via o "‹", o menu tinha "sumido".
- **Procede — botões da comemoração somem sozinhos.** A tela de parabéns voltava sozinha para a jornada depois de 6,5 s; quem estava lendo via os botões desaparecerem.
- **Procede — comemoração cobria o menu.** A tela de parabéns ocupava a tela inteira, por cima do menu.
- **Não procede:** nenhum código mexe em `overflow` do `body` (nenhum bloqueio de rolagem esquecido); depois de fechar o apelido e o tutorial não sobrava camada invisível; não há `position: fixed` dentro de `transform`; o menu é desenhado desde o primeiro carregamento (sem problema de hidratação); o comportamento é igual com o Modo Administrador ligado e desligado.
- **Risco:** a janela do apelido usava `100svh` e não encolhia com o teclado virtual; no celular deitado e baixo (640×360) o trilho lateral com 5 botões ficava no limite da altura.

**O que mudou:**

- O menu inferior aparece **também na partida** (mais baixo, 52px). O tabuleiro desconta essa altura (`--gnav`) e continua cabendo na tela.
- A comemoração termina **acima do menu** (ou ao lado do trilho lateral); tocar no menu fecha a comemoração (a vitória já está salva).
- Com o pedido de opinião na tela, a comemoração **não volta sozinha** para a jornada.
- Janelas usam `100dvh` (acompanham o teclado virtual); no celular deitado e baixo, o trilho fica compacto (sem o cubo da marca).

Arquivos: `src/app/globals.css`, `src/app/ui.css`, `src/components/LevelComplete.tsx`, `src/components/App.tsx`.

## 1. Código de recuperação fora do primeiro acesso

- Depois de criar o apelido, a pessoa vai **direto para a partida guiada**. O código continua sendo **gerado e salvo** do mesmo jeito; só não aparece mais nessa hora (e o selo vermelho no Perfil deixou de existir).
- **Perfil → Ajustes → "Jogar em outro dispositivo"**: "Ver meu código" (com botão de copiar e uma explicação curta) e "Já tenho um código" (campo para recuperar a conta neste aparelho; se o aparelho já tem progresso, pede confirmação antes de substituir).
- Na tela do apelido, o link ficou "Já jogou antes? Recuperar conta".

Arquivos: `src/components/account/Account.tsx` (seção `OtherDevice`; a janela `CodeModal` saiu), `src/components/App.tsx`.

## 2. Direto para a Jornada; investigações no mapa

- Ao tocar num jogo, abre **direto o mapa** do capítulo em que a pessoa está, com o próximo nível destacado e o rótulo **"JOGAR"**. A tela de capítulos (grade de 10 cartões, barra de progresso vazia e card "Começar Nível X") saiu.
- **Cabeçalho do mapa:** ‹ Início · nome do capítulo (toque = **lista compacta de capítulos**) · **caderno de investigações com contador** (ex.: 🔍 4/20) · ? (rever a partida guiada) · ‹ › (capítulo anterior/seguinte).
- **Cristal "Extra":** quando um nível libera uma investigação, aparece ao lado dele um cristal **dourado, com lupa e o selo "Extra"**. É opcional e não bloqueia o caminho; resolvida, fica **verde com ✓**. Tocar nele abre a investigação; ao sair, volta para a jornada.
- O **Caderno de Investigações** também fica no Perfil (aba Desempenho); o "Voltar" do caderno leva de volta para onde ele foi aberto.

Arquivos: `src/components/Journey.tsx` (reescrito), `src/app/journeys.css`, `src/components/App.tsx`, `src/components/journey.render.test.tsx`.

## 3. Partida guiada com o personagem de cada jogo

O tutorial passo a passo ("Passo 1 de 9") saiu. No lugar, o **personagem do jogo** conduz uma partida de verdade num tabuleiro pequeno e fácil: Bit (Mini Sudoku), Dona Coruja (Tango), Guaxi (Zip), Remendo (Patches) e Lumen (Astros).

- **Balão de fala** com frases curtas (no máximo 2 linhas).
- **Holofote:** o resto da tela escurece e só a casa ou o botão certo fica iluminado; toques em outros lugares não fazem nada.
- **Exemplo errado antes de agir:** o personagem coloca algo que quebra a regra, a casa fica vermelha, ele explica e desfaz ("Entendi, desfaz").
- **Lance guiado:** "Toque nesta casa" → "Agora escolha o 2". Errou? Uma dica gentil, sem punição.
- **Uma regra por vez**, na hora em que aparece (Sudoku: linha → coluna → bloco; Tango: linha → coluna; Zip: ordem → todas as casas; Patches: tamanho → formato; Astros: um por linha/coluna/constelação → sem se encostar).
- **"Agora é com você!"** nas últimas casas: o personagem só ajuda se a pessoa errar ou ficar 12 s parada (dica + holofote).
- **Ao terminar**, conta como partida completa e leva à comemoração (com o botão "Jogar o nível 1").
- **Cronômetro parado** durante a partida guiada. **"Pular"** sempre visível: leva para a Jornada.
- **Quando aparece:** na primeira vez em cada jogo, e numa **versão curta** no primeiro nível de um capítulo que muda o tamanho ou a regra (Sudoku: cap. 3 — 6×6 com blocos 2×3; Tango: cap. 2 — sinais = e ×, cap. 3 — 6×6 e "nunca 3 iguais seguidos", cap. 8 — 8×8; Zip: caps. 2, 4 e 7; Patches e Astros: caps. 3, 5, 7 e 9).
- **Fica salvo** no aparelho por jogo e por parte (`mindloop:guided:<jogo>`). Quem já tinha visto ou pulado o tutorial antigo (`mindloop:tutorial:<jogo>`) não é obrigado a ver de novo, e quem já passou de um capítulo não é interrompido.
- O **"?"** do jogo e do mapa e a aba **Regras** oferecem **"Rever partida guiada"** (rever não muda nada salvo).
- O menu inferior continua visível durante a partida guiada; tocar nele fecha a partida guiada.

Arquivos novos: `src/components/guided/GuidedPlay.tsx` (motor), `src/components/guided/scripts.tsx` (roteiros dos 5 jogos), `src/lib/guided.ts` (quando mostrar e o que já foi visto), `src/components/guided/guided.test.tsx`. Removidos: `src/components/tutorial/Tutorial.tsx`, `index.ts` e os `*Steps.tsx` (os mini tabuleiros, `tutorial/minis.tsx`, e os exemplos validados, `lib/tutorialData.ts`, continuam).

O teste `guided.test.tsx` joga cada roteiro do começo ao fim e confere que todo toque pedido existe no tabuleiro e que o final é a **solução real** de cada jogo.

## 4. Pedido de opinião na comemoração

- Na comemoração, o **mesmo personagem** pergunta: "Você mandou bem! Pode ajudar nossa equipe com sua opinião? É rapidinho, leva menos de 1 minuto 💜", com **"Dar opinião"** (abre o formulário de sempre, Netlify Forms) e **"Agora não"**.
- O botão **"Próximo nível"** vem logo depois do "Parabéns", é o principal e nunca fica bloqueado. Em telas baixas a comemoração fica compacta para "Próximo nível" e o pedido aparecerem sem rolar (os detalhes — tempos, jornada e conquistas — ficam abaixo).
- **Frequência** (`lib/feedback.ts`, `countWin`/`decline`): aparece na **primeira partida completa** (a guiada também conta); se a pessoa recusar (ou seguir sem responder), só volta **a cada 5 partidas**; depois de **enviada** uma opinião, não aparece mais. No Modo Administrador não aparece. Substitui as 5 estrelas que apareciam nos níveis 3, 10, 25, 50 e 100.

Arquivos: `src/components/LevelComplete.tsx`, `src/lib/feedback.ts` (+ testes), `src/app/features.css`, `src/components/App.tsx`.

## Comemoração que cabe em uma tela (sem "amplia e reduz")

**Causa encontrada** (medida no navegador, em modo celular, amostrando a cada 100 ms): não havia zoom da página (escala sempre 1) nem rolagem horizontal — os confetes são desenhados num `<canvas>` fixo do tamanho da tela e a tag viewport está correta (`width=device-width, initial-scale=1`, sem `maximum-scale`). O que "ampliava e reduzia" era o **próprio card**:

1. ele entrava com `scale(.6)` e uma curva com ressalto (`cubic-bezier(.2,1.4,.4,1)`): passava do tamanho final e voltava (altura medida: 888 → 883 → 873 → 870 px);
2. o "Parabéns!" crescia até 112% e voltava;
3. cada medalha de conquista entrava com `scale(0)` e ressalto;
4. o card ficava **centralizado na vertical** (`place-items: center`): qualquer mudança de altura (conquista, "Agora não") recentralizava o card inteiro.

Além disso, o card não tinha altura máxima: em telas baixas passava da tela e o fim (o card "Conquista desbloqueada") ficava atrás do menu.

**O que mudou** (só layout e animação; nenhuma regra do jogo):

- O card fica **preso ao topo** e tem altura máxima = espaço acima do menu inferior (a camada da comemoração já termina acima dele).
- **Parte de cima, que nunca rola:** cristal menor (≈12–16% da altura; menor ainda abaixo de 700 px), selo, "Parabéns!", frase e **"Próximo nível"** — sempre visível. A linha "Próximo: Nível N" saiu.
- **Miolo**, que só rola por dentro se não couber: pedido de opinião compacto (avatar menor, botões logo abaixo do texto), **tempos numa faixa só** ("⏱ 00:09 · 🏆 Melhor 00:09", com etiqueta "Novo recorde!" ou "1º tempo" no lugar da frase longa), **jornada numa linha** (nome, barra fina, "2/100").
- **Conquista desbloqueada** virou um **aviso no topo, por cima** (não ocupa espaço no card), que some sozinho em cerca de 4 s e tem o botão "Ver ›".
- Entradas animam só **opacidade e deslocamento**, nunca o tamanho (card, título, pedido de opinião).

**Testado** em 360×640, 375×667, 390×844, 412×915, 844×390 e 1366×768, com Mini Sudoku, Tango e Zip, com e sem conquista, com e sem pedido de opinião, primeiro tempo e novo recorde: zoom 1, sem rolagem horizontal, altura do card constante, nada atrás do menu, "Próximo nível" sempre visível e sem rolagem interna.

Arquivos: `src/components/LevelComplete.tsx`, `src/app/features.css`.

## Fases extras no mapa e runa do Astros na tela inicial

**Fases extras (investigações) no mapa de capítulo.** O quadrado amarelo com lupa e etiqueta preta "EXTRA" destoava dos cristais e ficava colado ou por cima dos níveis. Agora:

- é o **mesmo cristal facetado** dos níveis, em **âmbar/dourado** (a cor do contador 🔍 0/20), com brilho suave e uma **lupa em linha clara** no lugar do número, com **~72% do tamanho** do cristal do nível ao qual pertence;
- sem a etiqueta "EXTRA": o nome fica no `aria-label` e no tooltip ("Investigação extra");
- **estados**: disponível (brilho pulsando), resolvida (brilho mais forte e ✓) e **bloqueada** (dessaturada e mais transparente — antes nem aparecia; tocar mostra "Conclua o nível N para liberar esta investigação extra");
- **posição**: ao lado do caminho, na altura entre o nível de origem e o seguinte, deslocado para fora da trilha, com **folga mínima de 12 px** até qualquer cristal de nível; se um lado colide, usa o outro; nunca sai da imagem do mapa. Uma **linha pontilhada** curta liga o cristal ao nível de origem. O cálculo (`src/lib/extraPlacement.ts`) usa o tamanho real dos cristais na tela e é testado em todos os 10 mundos, em 348, 380 e 600 px de largura (`extraPlacement.test.ts`);
- o clique continua abrindo a investigação, e o contador continua igual.

**Runa do Astros na tela inicial.** O cadeado, o véu escuro e o selo "PRÉVIA" sobre a runa saíram (e as condicionais que só afetavam essa runa). Ela agora é igual às outras quatro: cristal colorido com a estrela, etiqueta "ASTROS" e a mesma área de toque. A cor passou de verde para **azul-noite (índigo) com reflexos prateados**, recolorida na própria arte por `scripts/recolor_astros_rune.py` (parte do original `public/home-art.jpg`, que não muda, e grava `public/home-art.webp`, que ficou menor: 249 KB). Ao tocar, abre a tela do Astros, que é quem mostra se ele está bloqueado (prévia jogável) ou liberado (jornada).

**Runa verde quando o Astros é liberado.** Enquanto o jogo está bloqueado, a runa fica azul-noite; depois de liberado (ou no Modo Administrador), fica **verde**, a cor do jogo. São duas versões da mesma arte geradas pelo mesmo script (`public/home-art.webp` e `public/home-art-open.webp`, a original); o App só troca a imagem — sem efeitos por cima, mesma área de toque.

**Botão "Ajuda" → "Tutorial".** Na barra de cada partida (Mini Sudoku, Zip, Tango, Patches e Astros), o botão que reabre a partida guiada passou a se chamar **Tutorial**; o "?" do cabeçalho do jogo e do mapa também diz "Tutorial" no aviso.

Arquivos: `src/components/Journey.tsx`, `src/app/journeys.css`, `src/lib/extraPlacement.ts` (+ teste), `src/components/journey.render.test.tsx`, `src/components/App.tsx`, `src/app/astros.css`, `public/home-art.webp`, `scripts/recolor_astros_rune.py`.

## Partida guiada com a mecânica real de cada jogo

A partida guiada pedia "toque na casa e depois escolha o símbolo" em todos os jogos, diferente de como cada jogo funciona. Agora cada roteiro usa a **mesma mecânica da partida** (função `act` em `src/components/guided/scripts.tsx`):

- **Tango:** cada toque na casa troca vazia → Cristal → Orbe → vazia ("1 toque = Cristal, 2 toques = Orbe, 3 toques = apaga"); os botões Cristal/Orbe também funcionam.
- **Astros:** cada toque troca vazia → × → astro → vazia, e a partida guiada ensina o botão **"Em volta"** (marca × em todas as casas que um astro apaga).
- **Zip:** dá para **arrastar o dedo** pela trilha (ou tocar casa por casa); voltar pela trilha desfaz.
- **Patches:** dá para **arrastar de um canto ao outro** da peça (ou tocar nos dois cantos); tocar numa peça a retira.
- **Mini Sudoku:** tocar na casa e no número; os **números já usados em todas as linhas ficam apagados** no teclado (e tocar neles explica por quê), igual à partida.
- **Linhas, colunas e blocos** são mostrados **pintados em todo o tabuleiro**, um tipo de cada vez (cada linha/coluna/bloco de uma cor), no Mini Sudoku (também na versão 6×6) e no Tango.
- **Parte livre ("Agora é com você!")**: a pessoa joga de verdade; o personagem confere o tabuleiro a cada toque e, se algo estiver errado ou se ela demorar, dá uma dica e ilumina onde mexer.

Arquivos: `src/components/guided/GuidedPlay.tsx` (motor: toques, arrastos, conferência), `src/components/guided/scripts.tsx` (roteiros + mecânica de cada jogo), `src/components/tutorial/minis.tsx` (faixas coloridas, números apagados, botão "Em volta"), `src/app/features.css`, `src/components/guided/guided.test.tsx` (joga cada roteiro com a mecânica real até a solução e testa cada mecânica).

## Barra da partida: "Tutorial" à vista e confirmação de reiniciar inteira

- **Confirmação cortada:** a caixa "Reiniciar… Continuar?" era um aviso fixo DENTRO do cartão da partida, que recorta o que passa das bordas (cantos arredondados com `clip-path`); ela também tinha sido posicionada antes de o menu inferior voltar a aparecer na partida. Resultado: no celular, a caixa ficava cortada embaixo, sem os botões. Agora é uma **janela centralizada** desenhada fora do cartão (`src/components/ConfirmDialog.tsx`, com o mesmo visual das outras janelas), com "Sim, reiniciar" (ou "Sim, encerrar") e "Cancelar"; Esc ou ✕ cancelam. Vale para os 5 jogos.
- **Barra:** **"Tutorial" fica sempre visível** na barra; **"Reiniciar" foi para o menu "Mais"** (primeiro item). Mini Sudoku: Desfazer · Dica · Pausar · Tutorial · Mais. Tango, Zip, Patches e Astros: Desfazer · Dica · Tutorial · Mais.

Arquivos: `src/components/ConfirmDialog.tsx` (novo), `Game.tsx`, `TangoGame.tsx`, `ZipGame.tsx`, `PatchesGame.tsx`, `AstrosGame.tsx`, `src/app/journeys.css`.

## Progresso salvo

Nada foi apagado nem convertido: as chaves antigas continuam valendo. Novas chaves: `mindloop:guided:<jogo>` e `mindloop:fb-ask`. O aviso antigo `mindloop:code-unseen` é apenas limpo.

## Validação

- `npm test`: 32 arquivos, 299 testes.
- Navegador (só localhost, requisições externas bloqueadas): fluxo completo de um aluno novo — abrir o site → apelido → partida guiada (completa e pulada) → Jornada → Nível 1 → comemoração → opinião — em 360×640, 390×844, 412×915, 640×360, 844×390 e 1366×768, conferindo em cada tela que o menu inferior está visível e recebe o toque.

---

# MindLoop — Alterações: reformulação das Investigações

Este documento explica o que mudou nas 100 investigações do MindLoop (Mini Sudoku, Tango, Zip, Patches e Astros) e por quê.

## Objetivo

Deixar a investigação divertida para quem está começando: uma história curta, poucas regras e a sensação de "fui juntando as pistas e descobri". O jogador **nunca** precisa guardar hipóteses na cabeça, fazer contas mentais ou testar "e se ele estivesse aqui?" sem conseguir anotar.

## Problemas corrigidos

| Problema anterior | O que mudou |
|---|---|
| Pistas dependiam de elementos pequenos do tabuleiro (ex.: "Almofada de Prece", só um ícone numa casa) | Os assentos decorativos saíram de todos os cenários. As pistas usam só linha, coluna, cômodo/região, lado, parada e objeto. Casas bloqueadas têm nome escrito e legenda abaixo do tabuleiro. |
| Pistas relacionais exigiam testar combinações de cabeça ("Neve numa coluna à esquerda do Nimbo") | Saíram "à esquerda", "acima", "a 2 passos", "vizinhos", "na diagonal" e "quem tinha o X…". Só ficaram as relações da mecânica de dois jogos — Zip ("logo depois de") e Tango (= e ×) — e **só depois** que a outra pessoa já foi descoberta, então elas viram marcações simples. |
| Uma grade única "Onde?" não deixava anotar "a Mel pode estar em A1 ou A2, mas não em A3" | O quadro virou um conjunto de grades estilo "enigma de Einstein": personagem × linha, × coluna, × cômodo, × objeto (cada jogo tem as suas). |
| Pistas que não viravam marcação | Toda pista afeta uma grade e vira ✓ ou ✗ em células específicas. A pista mostra a etiqueta da grade (📍 Linha, 🏛️ Cômodo, 🎁 Objeto…); tocar nela abre a grade e acende as células. |
| Personagens/objetos sem pista, resolvidos por uma eliminação invisível | Todo personagem é citado em pelo menos uma pista. Objetos podem sair pela "última opção" — visível no quadro, como a última célula livre de uma fileira. |

## Regras das pistas (garantidas pelo gerador e pelos testes)

- De **5 a 7 pistas** por investigação, frases curtas, sem dupla negação.
- **Toda pista vira marcações diretas** (✓ ou ✗) numa grade.
- **Ordem pensada:** as pistas são resolvidas na ordem em que aparecem, e **cada uma gera pelo menos uma conclusão nova** (um ✓) no quadro.
- **Solução única** e **todas as pistas necessárias** (sem qualquer uma delas, surge outra solução).
- **Sem tentativa e erro:** a solução é alcançável só com (1) as marcações diretas das pistas, (2) a ligação entre grades que o próprio tabuleiro mostra (o cômodo fica em certas linhas e colunas; casa bloqueada não conta) e (3) a "última opção restante" numa fileira ou coluna de uma grade.
- Pistas escritas como **depoimentos ou achados** ("Pegadas no chão mostram que a Mel estava na coluna A."), sempre de fontes firmes — nada de "ouvi dizer".

## As grades de cada jogo (a mecânica do jogo no quadro)

| Jogo | Regra do lugar | Grades | Como a mecânica aparece |
|---|---|---|---|
| Mini Sudoku | uma pessoa por linha, coluna e cômodo 2×2 | Linha · Coluna · Cômodo · Objeto | um ✓ fecha a linha, a coluna e o cômodo para os outros |
| Tango | metade das pessoas no lado do **Cristal** e metade no do **Orbe**; uma por coluna | Lado · Coluna · Objeto | equilíbrio dos lados; pistas = (mesmo lado) e × (lados opostos); um móvel numa coluna fixa o lado de quem está nela |
| Zip | cada pessoa numa parada da trilha | Parada · Objeto | ordem: "depois da 4ª parada", "logo depois do Theo" |
| Patches | uma pessoa por cômodo; o tamanho está no canto | Cômodo · Objeto | "estava no cômodo de 4 casas" |
| Astros | uma pessoa por linha, coluna e região, sem se encostar | Linha · Coluna · Região · Objeto | mesma lógica do Sudoku, com regiões de formato livre |

**Observação sobre o Tango:** no MindLoop os símbolos do Tango são **Cristal e Orbe** (não Sol e Lua). Nas investigações, o tabuleiro tem dois lados — o de cima é o lado do Cristal e o de baixo, o do Orbe — e o nome do lugar da história aparece entre parênteses na regra.

## Quadro de decisões (novo componente)

- Uma grade por aba; personagens nas fileiras, valores nas colunas. No celular, as abas evitam rolagem horizontal; grades largas (as 8 paradas do Zip) aparecem invertidas para os nomes caberem.
- Cada toque: **vazio → ✕ → ✓**.
- **Ajuda automática** (ligada por padrão nos capítulos 1–5, desligada nos avançados; a escolha da pessoa fica guardada no aparelho): cada ✓ preenche, em cor mais clara e tracejada, os ✕ óbvios da mesma fileira e da mesma coluna da grade.
- Quando os ✓ de lugar de alguém apontam uma única casa (linha + coluna, lado + coluna, parada ou cômodo), o tabuleiro **sugere a casa** com o retrato translúcido — sem preencher a resposta.
- Desfazer e Limpar continuam.

## Dicas (sistema de 3 níveis)

As dicas acompanham o que a pessoa já marcou: sempre falam do **próximo passo ainda não marcado** no quadro (ou na resposta).

1. **Dica 1** — qual pista usar agora (e qual grade ela afeta).
2. **Dica 2** — qual grade e fileira olhar (a célula pisca).
3. **Dica 3** — a conclusão daquele passo, com o porquê.

Nunca revelam a solução inteira. Cada nível gasta uma dica (máximo de 3 por investigação, como antes; cada uma reduz 20% do XP).

## Narrativa (reescrita das 100 investigações)

Cada investigação agora conta uma pequena história completa. **A lógica não mudou**: as mesmas pistas, na mesma ordem e na mesma quantidade, a mesma solução e o mesmo quadro de decisões. Só mudaram os textos e os nomes dos objetos.

**O que cada caso tem** (em `src/lib/cases/narrativas/<jogo>.ts`, um arquivo por jogo, separado da lógica):

- **Ambientação** (1 frase), logo abaixo do título.
- **Introdução** (2 a 4 frases): o que aconteceu e por que descobrir o lugar e o objeto de cada um resolve o mistério.
- **Ficha dos personagens**: a personalidade vem do elenco (`src/lib/cast.ts`, igual em todos os casos), mais *por que está ali* e a *ligação* com um objeto ou com outro personagem. Personagens que voltam em outros casos trazem pequenas referências (o Bit da biblioteca, a feira de trocas das fadas, a padaria das nuvens…).
- **Ficha dos objetos**: nome, descrição de uma linha, **papel na história** (a chave do mistério, a prova, a ferramenta, a distração, precisa ser devolvido, o presente) e por que existe naquele lugar.
- **Pistas narrativas**: cada texto diz, com clareza, a mesma informação lógica de antes — o nome da pessoa, o lugar ou valor ("linha 2", "coluna C", o nome do cômodo, "lado do Cristal/Orbe", "3ª parada", "depois da 5ª parada", "cômodo de 4 casas", "logo depois", "mesmo lado", "lado oposto") e o objeto — e continua virando uma marcação direta no quadro. Pistas negativas sempre têm "não", "nunca", "nem" ou "nenhum".
- **Desfecho** (3 a 5 frases) usando a solução, com humor.

**Objetos únicos.** Nenhum objeto se repete entre as 100 investigações (antes eram 93 repetições, como a Lanterna em 6 casos). Os nomes novos são mais específicos ("Lanterna à Prova d'Água", "Lampião de Mineiro", "Sineta do Maestro"); os objetos que tinham ilustração continuam com o mesmo desenho (os nomes novos foram cadastrados em `ITEM_ART`, `src/lib/cast.ts`). No cabeçalho estreito da grade de objetos aparece um **nome curto** automático — a primeira palavra, quando ela já distingue o objeto no caso ("Mala de Viagem do Século" → "Mala"); o nome completo continua nas pistas, nas fichas, na resposta e na dica do cabeçalho.

**Ligação com a mecânica de cada jogo.** Sudoku: postos em linhas, colunas e cômodos. Tango: os dois lados do **Cristal** e do **Orbe** (os símbolos do Tango do MindLoop, não Sol e Lua). Zip: trilhas numeradas (corridas, cortejos, procissões). Patches: cômodos como peças de tamanho diferente. Astros: céus quadriculados em que ninguém encosta em ninguém.

**Na tela.**

- **História** (`CaseIntro.tsx`): uma função só — o narrador do jogo **conta o caso, fala por fala**. Três blocos: a pintura do mundo (sem nada por cima; o título num degradê na base), o narrador com um balão de fala único e o botão. No alto, só "‹ Voltar", "Pular ›" e uma linha com mundo · dificuldade · tempo · XP.
  - Texto em máquina de escrever; um toque completa a fala, outro avança; bolinhas mostram o progresso. "Pular" vai direto à última fala.
  - Personagens e objetos citados aparecem em destaque, com o desenho; tocar no nome mostra uma linha sobre ele.
  - O narrador muda de expressão a cada fala (feliz, assustado, desconfiado, pensativo): pula, treme ou inclina a cabeça, com um rostinho ao lado, e pisca de vez em quando. (A arte de cada narrador é uma ilustração só; a expressão vem do movimento e do rostinho.)
  - Na última fala surgem a **pergunta do caso** (cartão com 🔍) e o botão "Começar investigação"; antes, "Toque para continuar".
  - Saíram desta tela: o cofre do quebra-cabeça, a estrutura de raciocínio, o número de pistas e de personagens, os cartões de personagens e os objetos — as fichas ficam na investigação.
  - **Dados**: `narracao: [{ texto, expressao, destaques }]` e `pergunta`, por caso. As falas de abertura e de fechamento são escritas à mão em `src/lib/cases/roteiros.ts`, na voz do narrador de cada jogo (Bit no Mini Sudoku, Dona Coruja no Tango, Guaxi no Zip, Remendo no Patches, Lumen no Astros); as que apresentam personagens e objetos saem dos dados do caso (`narracao.ts`). São 6 falas por caso, de até ~140 letras. `narracao.test.ts` confere quantidade, tamanho, nomes e que nenhuma fala entrega a solução nem fala de regras.
- **Investigação**: botão **🗂️ Fichas** na barra do quadro de decisões; na grade "Objeto", tocar no desenho de um objeto abre a ficha dele. As fichas abrem numa janela sobre o jogo — nada se perde.
- **Ao acertar**: o desfecho e a lista de quem estava onde, com qual objeto.

**Como a lógica fica protegida.**

- `src/lib/cases/logic-snapshot.json` é a "impressão digital" da lógica de cada caso (pistas, solução, tabuleiro e as marcações que cada pista gera no quadro), tirada **antes** da reescrita por `npx vite-node scripts/snapshot_cases.ts`.
- `src/lib/cases/narrative.test.ts` confere que a lógica de todos os casos continua idêntica à fotografia; que todo caso tem narrativa completa (fichas batendo com os personagens e objetos, 1 frase de ambientação, 2–4 de introdução, 3–5 de desfecho); que nenhum objeto se repete; que nenhum perde a ilustração; que os nomes curtos não confundem dois objetos; que **cada pista cita a pessoa, o lugar/valor e o objeto dela — e nenhum outro personagem, objeto ou lugar** (pistas negativas com negação); e que o desfecho cita todos e cada frase com uma pessoa e um objeto (ou lugar) bate com a resposta.
- O catálogo (`catalog.ts`) só troca os **rótulos** dos objetos e os textos; a lógica usa a posição de cada objeto, não o nome.
- Para escrever ou revisar narrativas: `npx vite-node scripts/check_narratives.ts <jogo>` lista, de uma vez, todo problema de pista ou desfecho.

## A investigação aprovada (modelo)

"Os guardiões do eclipse" (Mini Sudoku, capítulo 4, Templo das Estrelas, `sudoku-33`) foi escrita à mão exatamente como aprovada e está em `src/lib/cases/authored.ts`. Ela passa pelas mesmas conferências de todas as outras.

## Decisões tomadas durante a implementação

- **Sempre 4 personagens.** Zip e Patches começavam com 3. Com 3 pessoas o caso fecha em 4 pistas — abaixo do mínimo de 5 com todas as pistas necessárias. Agora todos os casos têm 4 personagens e 4 objetos.
- **Patches: só importa o cômodo.** A pergunta do Patches é "em qual área cada um ficou"; qualquer casa livre do cômodo vale como resposta.
- **Dificuldade.** Cresce pelos capítulos com mais pistas negativas ("não estava…") e mais conclusões pela "última opção". No Zip, onde a trilha tem mais paradas que pessoas, a dificuldade vem das pistas de ordem.
- **Estruturas de raciocínio.** Agora são 9: Descoberta progressiva, Por exclusão, Leitura do cenário, Rastro dos objetos (todos os jogos) e uma de cada jogo (Linhas, colunas e cômodos; Equilíbrio do Cristal e do Orbe; Reconstrução do percurso; Tamanho dos cômodos; Mapa do céu). A conquista "Raciocínio Versátil" (8 estruturas) continua possível.

## Validação

- `npx vite-node scripts/validate_cases.ts` confere as 100 investigações (solução única, todas as pistas necessárias, resolvível na ordem só com marcações diretas + última opção, toda pista gerando um ✓, de 5 a 7 pistas, todos os personagens citados) e gera **`docs/INVESTIGACOES_PISTAS.md`**, com a tabela **pista → marcações → conclusões** de cada caso.
- Os testes (`npm test`) conferem o mesmo, mais a regra de cada jogo, a coerência dos cenários, os textos e as telas.

## Compatibilidade com o progresso

- Investigações já resolvidas continuam resolvidas (XP, medalhas e tempos ficam como estavam).
- Rascunhos de investigações em andamento recomeçam do zero, porque as pistas mudaram (a versão do rascunho mudou).

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/cases/model.ts` | tipos de pista (só diretas), conferência da resposta, textos |
| `src/lib/cases/grids.ts` | as grades de cada jogo e a grade que cada pista afeta |
| `src/lib/cases/logic.ts` | o passo a passo: pista → marcações → "última opção" |
| `src/lib/cases/generate.ts` | o gerador (pistas uma a uma, na ordem, cada uma gerando um ✓) e `checkCase` |
| `src/lib/cases/authored.ts` | casos escritos à mão (o Templo das Estrelas) |
| `src/lib/cases/witness.ts` | "quem conta" cada pista (fácil de editar) |
| `src/lib/cases/structures.ts` | as 9 formas de raciocínio |
| `src/lib/cases/catalog.ts` | textos das pistas, explicação, personagens e dicas |
| `src/lib/cases/relations.ts` | anotações das grades, Ajuda automática, sugestão no tabuleiro, destaques |
| `src/components/cases/CasePanels.tsx` | pistas com etiqueta da grade, **quadro de decisões em grades**, resposta |
| `src/components/cases/CaseScreen.tsx` | tela da investigação (personagens com personalidade, dicas em 3 níveis) |
| `src/components/cases/CaseBoard.tsx` | sugestão de casa, legenda das casas bloqueadas, lados Cristal/Orbe |
| `src/app/cases-theme.css` | visual das grades, etiquetas, dicas e legenda |
| `scripts/gen_cases.ts` | gera o banco `src/lib/cases/data.ts` |
| `scripts/validate_cases.ts` | verificador + tabela `docs/INVESTIGACOES_PISTAS.md` |
| `src/lib/cases/narrativas/<jogo>.ts` | **narrativa de cada caso**: ambientação, introdução, fichas, pistas e desfecho |
| `src/lib/cases/narrative.ts` | formato da narrativa, papéis dos objetos, nome curto e impressão digital da lógica |
| `src/lib/cases/narrative-check.ts` | conferência dos textos (pista ↔ informação lógica; desfecho ↔ solução) |
| `src/lib/cases/logic-snapshot.json` | fotografia da lógica tirada antes da reescrita |
| `src/lib/cases/narrative.test.ts` | garante lógica inalterada e textos coerentes |
| `src/components/cases/CaseIntro.tsx` | tela de história: o narrador conta o caso fala por fala |
| `src/lib/cases/narracao.ts` · `roteiros.ts` | a narração de cada caso (falas, expressões, destaques) |
| `src/components/cases/CaseSheets.tsx` | fichas dos personagens e objetos (janela e botões de objeto) |
| `scripts/snapshot_cases.ts` | refaz a fotografia (só de propósito, depois de mudar a lógica) |
| `scripts/check_narratives.ts` | lista os problemas das narrativas de um jogo |
| `docs/AUDITORIA_NARRATIVA.md` | auditoria antes/depois da reescrita |
