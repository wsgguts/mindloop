# Investigações — pista → marcações

Gerado por `scripts/validate_cases.ts` (não edite à mão). Para cada investigação: as pistas na ordem em que aparecem,
a grade que cada uma afeta, as marcações diretas que ela gera (✓ / ✗) e as conclusões que aparecem em seguida
(pela própria pista, pelo tabuleiro ligando as grades ou pela "última opção").

## sudoku-03 · A biblioteca entre as nuvens

Mini Sudoku · capítulo 1 · Iniciante · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | Tinta de nuvem escorrendo pelos dedos do Rio: era ele quem segurava a Pena de Nuvem. | Rio × Atlas do Céu ✗; Rio × Lupa Dourada ✗; Rio × Marcador ✗; Rio × Pena ✓ | O Rio segurava a Pena de Nuvem. |
| 2 | ↕️ Coluna | As pegadas pesadas de cristal do Quartzo afundaram o piso da coluna B. | Quartzo × A ✗; Quartzo × C ✗; Quartzo × D ✗; Quartzo × B ✓ | O Quartzo estava na coluna B. |
| 3 | 🎁 Objeto | O Pingo ficou com marcas de corrente nas mãos: ele segurava o Atlas do Céu. | Pingo × Lupa Dourada ✗; Pingo × Marcador ✗; Pingo × Atlas do Céu ✓ | O Pingo segurava o Atlas do Céu. |
| 4 | 🎁 Objeto | As mãos do Nico estavam sem brilho nenhum: ele não segurava o Marcador de Cristal. | Nico × Marcador ✗ | O Nico segurava a Lupa Dourada: na grade Objeto, era a única opção que sobrava para ele. O Quartzo segurava o Marcador de Cristal: na grade Objeto, era a única opção que sobrava para ele. |
| 5 | 🏛️ Cômodo | O diário do vento ficou molhado de nuvem: o Rio escreveu na Varanda das Nuvens. | Rio × Torre dos Mapas ✗; Rio × Sala de Leitura ✗; Rio × Arquivo ✗; Rio × Varanda das Nuvens ✓ | O Rio estava na Varanda das Nuvens. O Rio estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Quartzo estava na Torre dos Mapas: na grade Cômodo, era a única opção que sobrava para ele. |
| 6 | ↔️ Linha | A bibliotecária viu os óculos do Nico brilhando na linha 2. | Nico × 1 ✗; Nico × 3 ✗; Nico × 4 ✗; Nico × 2 ✓ | O Nico estava na linha 2. O Nico estava na Sala de Leitura: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Pingo estava no Arquivo: na grade Cômodo, era a única opção que sobrava para ele. O Quartzo estava na linha 1: na grade Linha, era a única opção que sobrava para ele. |
| 7 | ↔️ Linha | O cabelo do Rio ficou todo bagunçado pelo vento da linha 3. | Rio × 4 ✗; Rio × 3 ✓ | O Rio estava na linha 3. O Pingo estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Pingo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Nico estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Pingo — Arquivo (casa C4), Atlas do Céu · Rio — Varanda das Nuvens (casa A3), Pena de Nuvem · Nico — Sala de Leitura (casa D2), Lupa Dourada · Quartzo — Torre dos Mapas (casa B1), Marcador de Cristal

## sudoku-07 · A padaria das nuvens doces

Mini Sudoku · capítulo 1 · Iniciante · Linhas, colunas e cômodos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | O padeiro viu a Vi contando estrelas na janela da linha 2. | Vi × 1 ✗; Vi × 3 ✗; Vi × 4 ✗; Vi × 2 ✓ | A Vi estava na linha 2. |
| 2 | 🏛️ Cômodo | O avental da Vi saiu quentinho: ela estava no Forno. | Vi × Balcão ✗; Vi × Forno ✓ | A Vi estava no Forno. |
| 3 | 🎁 Objeto | Migalhas por todo o capuz do Rubro: ele segurava a Cesta de Pães. | Rubro × Bolo ✗; Rubro × Saco ✗; Rubro × Sino ✗; Rubro × Cesta ✓ | O Rubro segurava a Cesta de Pães. |
| 4 | ↕️ Coluna | As asas do Umbra roçaram as paredes da coluna B. | Umbra × A ✗; Umbra × C ✗; Umbra × D ✗; Umbra × B ✓ | O Umbra estava na coluna B. O Umbra estava na Calçada: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Vi estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | ↔️ Linha | A cantoria da Lina ecoava lá de baixo, da linha 4. | Lina × 1 ✗; Lina × 3 ✗; Lina × 4 ✓ | A Lina estava na linha 4. A Lina estava na Despensa: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Umbra estava na linha 3: na grade Linha, era a única opção que sobrava para ele. O Rubro estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Rubro estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Rubro estava no Balcão: na grade Cômodo, era a única opção que sobrava para ele. A Lina estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | O Umbra ficou branco da cabeça às asas: ele segurava o Saco de Farinha. | Umbra × Bolo ✗; Umbra × Sino ✗; Umbra × Saco ✓ | O Umbra segurava o Saco de Farinha. |
| 7 | 🎁 Objeto | A Lina marcava o ritmo da música com o Sino da Porta. | Lina × Bolo ✗; Lina × Sino ✓ | A Lina segurava o Sino da Porta. A Vi segurava o Bolo de Nuvem: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Lina — Despensa (casa D4), Sino da Porta · Umbra — Calçada (casa B3), Saco de Farinha · Rubro — Balcão (casa C1), Cesta de Pães · Vi — Forno (casa A2), Bolo de Nuvem

## sudoku-12 · A oficina dos gnomos lapidadores

Mini Sudoku · capítulo 2 · Iniciante · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | Os óculos da Pipa estavam cheios de pó verde: ela segurava a Lixa de Musgo. | Pipa × Cinzel Fino ✗; Pipa × Martelinho ✗; Pipa × Lente ✗; Pipa × Lixa ✓ | A Pipa segurava a Lixa de Musgo. |
| 2 | 🎁 Objeto | O Broto ficou com bolhas nas mãos de tanto bater: ele segurava o Martelinho de Cobre. | Broto × Cinzel Fino ✗; Broto × Lente ✗; Broto × Martelinho ✓ | O Broto segurava o Martelinho de Cobre. |
| 3 | 🎁 Objeto | A Lente de Lapidar não tem nem um pelo preto: o Nox não a segurava. | Nox × Lente ✗ | O Nox segurava o Cinzel Fino: na grade Objeto, era a única opção que sobrava para ele. A Marina segurava a Lente de Lapidar: na grade Objeto, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | Folhinhas do Broto caíram pelo chão da coluna B. | Broto × A ✗; Broto × C ✗; Broto × D ✗; Broto × B ✓ | O Broto estava na coluna B. |
| 5 | 🏛️ Cômodo | A Marina nunca deixa a Bancada de Corte durante a troca de turno. | Marina × Forno de Cristal ✗; Marina × Depósito de Gemas ✗; Marina × Janela de Musgo ✗; Marina × Bancada de Corte ✓ | A Marina estava na Bancada de Corte. A Marina estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Broto estava no Forno de Cristal: na grade Cômodo, era a única opção que sobrava para ele. |
| 6 | ↔️ Linha | Dois olhos brilhando no escuro da linha 1: era o Nox. | Nox × 2 ✗; Nox × 3 ✗; Nox × 4 ✗; Nox × 1 ✓ | O Nox estava na linha 1. O Nox estava na coluna C: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Nox estava no Depósito de Gemas: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Broto estava na linha 2: na grade Linha, era a única opção que sobrava para ele. A Pipa estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. A Pipa estava na Janela de Musgo: na grade Cômodo, era a única opção que sobrava para ela. |
| 7 | ↔️ Linha | Um gnomo jura que a Marina estava na linha 3, medindo uma gema. | Marina × 4 ✗; Marina × 3 ✓ | A Marina estava na linha 3. A Pipa estava na linha 4: na grade Linha, era a única opção que sobrava para ela. |

**Solução:** Broto — Forno de Cristal (casa B2), Martelinho de Cobre · Marina — Bancada de Corte (casa A3), Lente de Lapidar · Pipa — Janela de Musgo (casa D4), Lixa de Musgo · Nox — Depósito de Gemas (casa C1), Cinzel Fino

## sudoku-16 · A feira de trocas das fadas

Mini Sudoku · capítulo 2 · Iniciante · Linhas, colunas e cômodos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | A Estela parou na linha 2 para conferir as estrelas-brinco. | Estela × 1 ✗; Estela × 3 ✗; Estela × 4 ✗; Estela × 2 ✓ | A Estela estava na linha 2. |
| 2 | 🏛️ Cômodo | Um duende viu a Luna sentada na Ponte de Raízes, de olhos fechados. | Luna × Barraca das Gemas ✗; Luna × Barraca de Doces ✗; Luna × Clareira Central ✗; Luna × Ponte de Raízes ✓ | A Luna estava na Ponte de Raízes. A Luna estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Estela estava na Barraca das Gemas: na grade Cômodo, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | Desenhos de estrela da Lis ficaram espalhados na coluna A. | Lis × B ✗; Lis × C ✗; Lis × D ✗; Lis × A ✓ | A Lis estava na coluna A. A Lis estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lis estava na Barraca de Doces: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Luna estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. A Íris estava na linha 3: na grade Linha, era a única opção que sobrava para ela. A Íris estava na Clareira Central: na grade Cômodo, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | A Estela nem passou pela coluna D: lá não dava para ver o céu. | Estela × D ✗ | A Estela estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Íris estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Luna ficou com os dedos grudentos: ela segurava o Pote de Mel. | Luna × Gema ✗; Luna × Flauta ✗; Luna × Chapéu ✗; Luna × Pote de Mel ✓ | A Luna segurava o Pote de Mel. |
| 6 | 🎁 Objeto | O orvalho não molhou a Estela, que estava com o Chapéu de Folha. | Estela × Gema ✗; Estela × Flauta ✗; Estela × Chapéu ✓ | A Estela segurava o Chapéu de Folha. |
| 7 | 🎁 Objeto | A Gema Brilhante acendia toda vez que a Íris sorria para um livro: era ela quem a segurava. | Íris × Flauta ✗; Íris × Gema ✓ | A Íris segurava a Gema Brilhante. A Lis segurava a Flauta de Galho: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Lis — Barraca de Doces (casa A4), Flauta de Galho · Estela — Barraca das Gemas (casa C2), Chapéu de Folha · Luna — Ponte de Raízes (casa B1), Pote de Mel · Íris — Clareira Central (casa D3), Gema Brilhante

## sudoku-24 · A casa de banhos termais

Mini Sudoku · capítulo 3 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O Leo jura que estava na coluna C — e desta vez o palpite dele está certo. | Leo × A ✗; Leo × B ✗; Leo × D ✗; Leo × C ✓ | O Leo estava na coluna C. |
| 2 | 🏛️ Cômodo | Reflexos azuis dançavam na água do Tanque Morno: a Cris estava lá. | Cris × Jardim de Pedras ✗; Cris × Tanque Quente ✗; Cris × Sala do Vapor ✗; Cris × Tanque Morno ✓ | A Cris estava no Tanque Morno. A Cris estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Cris estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Leo estava no Tanque Quente: na grade Cômodo, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | Nenhuma pétala da Flor caiu na coluna B: ela não esteve lá. | Flor × B ✗ | A Flor estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Ayo estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 🏛️ Cômodo | O Ayo passou a tarde inteira na Sala do Vapor. | Ayo × Jardim de Pedras ✗; Ayo × Sala do Vapor ✓ | O Ayo estava na Sala do Vapor. O Ayo estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Flor estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Flor estava no Jardim de Pedras: na grade Cômodo, era a única opção que sobrava para ela. O Leo estava na linha 1: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | Pegadas de madeira molhada: o Ayo estava com o Chinelo de Madeira. | Ayo × Roupão ✗; Ayo × Pato ✗; Ayo × Livro ✗; Ayo × Chinelo ✓ | O Ayo segurava o Chinelo de Madeira. |
| 6 | 🎁 Objeto | O Pato de Borracha ficou todo azul de reflexo: quem o segurava era a Cris. | Cris × Roupão ✗; Cris × Livro ✗; Cris × Pato ✓ | A Cris segurava o Pato de Borracha. |
| 7 | 🎁 Objeto | A Flor não leu nada a tarde inteira: ela não segurava o Livro de Receitas de Chá. | Flor × Livro ✗ | A Flor segurava o Roupão Bordado: na grade Objeto, era a única opção que sobrava para ela. O Leo segurava o Livro de Receitas de Chá: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Flor — Jardim de Pedras (casa A2), Roupão Bordado · Ayo — Sala do Vapor (casa B3), Chinelo de Madeira · Cris — Tanque Morno (casa D4), Pato de Borracha · Leo — Tanque Quente (casa C1), Livro de Receitas de Chá

## sudoku-28 · O laboratório da represa

Mini Sudoku · capítulo 3 · Intermediário · Leitura do cenário · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A memória do Chip registrou o barulho das engrenagens: ele estava na Casa de Máquinas. | Chip × Sala das Comportas ✗; Chip × Laboratório ✗; Chip × Mirante ✗; Chip × Casa de Máquinas ✓ | O Chip estava na Casa de Máquinas. |
| 2 | ↕️ Coluna | O coração da tela do Pixel iluminou a coluna C no apagão. | Pixel × A ✗; Pixel × B ✗; Pixel × D ✗; Pixel × C ✓ | O Pixel estava na coluna C. O Pixel estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Pixel estava no Mirante: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Chip estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Chip estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | Ninguém viu brilho de cristal na coluna A: o Prisma não estava lá. | Prisma × A ✗ | O Prisma estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Ritmo estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 🏛️ Cômodo | O Ritmo não entrou no Laboratório: ali é proibido fazer barulho. | Ritmo × Laboratório ✗ | O Ritmo estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Ritmo estava na Sala das Comportas: na grade Cômodo, era a única opção que sobrava para ele. O Prisma estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Prisma estava no Laboratório: na grade Cômodo, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Chip guardou na memória cada risco da Régua de Nível que segurava. | Chip × Tubo ✗; Chip × Prancheta ✗; Chip × Lanterna ✗; Chip × Régua ✓ | O Chip segurava a Régua de Nível. |
| 6 | 🎁 Objeto | Respingos de rio na tela do Pixel: ele segurava o Tubo de Ensaio. | Pixel × Prancheta ✗; Pixel × Lanterna ✗; Pixel × Tubo ✓ | O Pixel segurava o Tubo de Ensaio. |
| 7 | 🎁 Objeto | A Prancheta das Medições estava cheia de notas musicais: era o Ritmo quem a segurava. | Ritmo × Lanterna ✗; Ritmo × Prancheta ✓ | O Ritmo segurava a Prancheta das Medições. O Prisma segurava a Lanterna à Prova d'Água: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Ritmo — Sala das Comportas (casa A2), Prancheta das Medições · Pixel — Mirante (casa C3), Tubo de Ensaio · Prisma — Laboratório (casa B4), Lanterna à Prova d'Água · Chip — Casa de Máquinas (casa D1), Régua de Nível

## sudoku-33 · Os guardiões do eclipse

Mini Sudoku · capítulo 4 · Intermediário · Linhas, colunas e cômodos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | O monge da porta jura que viu a Neve lá em cima, na linha 1, rindo sozinha no escuro. | Neve × 2 ✗; Neve × 3 ✗; Neve × 4 ✗; Neve × 1 ✓ | A Neve estava na linha 1. |
| 2 | 🏛️ Cômodo | As teias de aranha da escada continuam inteiras: o Vulto não saiu da Torre do Sino a noite toda. | Vulto × Altar da Lua ✗; Vulto × Claustro ✗; Vulto × Nave Estelar ✗; Vulto × Torre do Sino ✓ | O Vulto estava na Torre do Sino. O Vulto estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Neve estava no Altar da Lua: na grade Cômodo, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | Pegadas meladas no chão: a Mel passou a Vigília encostada na parede da coluna A. | Mel × B ✗; Mel × C ✗; Mel × D ✗; Mel × A ✓ | A Mel estava na coluna A. A Mel estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Mel estava no Claustro: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Nimbo estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Nimbo estava na Nave Estelar: na grade Cômodo, era a única opção que sobrava para ele. O Vulto estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | ↕️ Coluna | Um rastro de vapor colorido mostra o Nimbo colado à parede leste, na coluna D. | Nimbo × C ✗; Nimbo × D ✓ | O Nimbo estava na coluna D. A Neve estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | O cristal do Cajado mudava de cor junto com o Nimbo: era ele quem segurava o Cajado. | Nimbo × Sino ✗; Nimbo × Pergaminho ✗; Nimbo × Incensário ✗; Nimbo × Cajado ✓ | O Nimbo segurava o Cajado. |
| 6 | 🎁 Objeto | Cheiro de ervas de neve no cabelo da Neve: ela estava com o Incensário. | Neve × Sino ✗; Neve × Pergaminho ✗; Neve × Incensário ✓ | A Neve segurava o Incensário. |
| 7 | 🎁 Objeto | A Mel ri de tudo, menos de barulho alto: ela não segurava o Sino de Prata. | Mel × Sino ✗ | A Mel segurava o Pergaminho: na grade Objeto, era a única opção que sobrava para ela. O Vulto segurava o Sino de Prata: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Nimbo — Nave Estelar (casa D4), Cajado · Mel — Claustro (casa A3), Pergaminho · Neve — Altar da Lua (casa C1), Incensário · Vulto — Torre do Sino (casa B2), Sino de Prata

## sudoku-37 · A aula dos pequenos astrônomos

Mini Sudoku · capítulo 4 · Intermediário · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | O olhar dourado da Sol brilhou sob o teto do Corredor Estrelado. | Sol × Sala da Lua ✗; Sol × Pátio ✗; Sol × Sala do Sol ✗; Sol × Corredor Estrelado ✓ | A Sol estava no Corredor Estrelado. |
| 2 | ↕️ Coluna | Os passos de robô do Astro deixaram marquinhas na coluna C. | Astro × A ✗; Astro × B ✗; Astro × D ✗; Astro × C ✓ | O Astro estava na coluna C. O Astro estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Astro estava no Pátio: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Sol estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | Nenhuma bola de chiclete da Kika estourou na coluna B: ela não passou por lá. | Kika × B ✗ | A Kika estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Musgo estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 🏛️ Cômodo | Pelinhos verdes do Musgo na janela da Sala da Lua: ele estava lá. | Musgo × Sala do Sol ✗; Musgo × Sala da Lua ✓ | O Musgo estava na Sala da Lua. O Musgo estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Sol estava na linha 3: na grade Linha, era a única opção que sobrava para ela. A Kika estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Kika estava na Sala do Sol: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Sol nunca se perde, porque segurava a Bússola de Latão. | Sol × Mapa ✗; Sol × Luneta ✗; Sol × Caderno ✗; Sol × Bússola ✓ | A Sol segurava a Bússola de Latão. |
| 6 | 🎁 Objeto | O Caderno de Constelações ficou cheio de chiclete: era a Kika quem o segurava. | Kika × Mapa ✗; Kika × Luneta ✗; Kika × Caderno ✓ | A Kika segurava o Caderno de Constelações. |
| 7 | 🎁 Objeto | O Mapa das Estrelas não tem nenhum pelinho verde: o Musgo não o segurou. | Musgo × Mapa ✗ | O Musgo segurava a Luneta da Turma: na grade Objeto, era a única opção que sobrava para ele. O Astro segurava o Mapa das Estrelas: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Sol — Corredor Estrelado (casa D3), Bússola de Latão · Musgo — Sala da Lua (casa B2), Luneta da Turma · Astro — Pátio (casa C1), Mapa das Estrelas · Kika — Sala do Sol (casa A4), Caderno de Constelações

## sudoku-42 · A noite da caravana no oásis

Mini Sudoku · capítulo 5 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | Pegadas calmas, uma atrás da outra, subiam até a Duna Alta: era o Zen. | Zen × Tenda Grande ✗; Zen × Beira do Oásis ✗; Zen × Curral dos Camelos ✗; Zen × Duna Alta ✓ | O Zen estava na Duna Alta. |
| 2 | ↔️ Linha | O guia garante que o Zen não estava na linha 1. | Zen × 1 ✗ | O Zen estava na linha 2: na grade Linha, era a única opção que sobrava para ele. |
| 3 | 🏛️ Cômodo | Um nevoeiro fininho cobriu a Beira do Oásis: a Bruma estava lá. | Bruma × Tenda Grande ✗; Bruma × Curral dos Camelos ✗; Bruma × Beira do Oásis ✓ | A Bruma estava na Beira do Oásis. |
| 4 | ↕️ Coluna | A voz do Dante contando histórias vinha da coluna C. | Dante × A ✗; Dante × B ✗; Dante × D ✗; Dante × C ✓ | O Dante estava na coluna C. O Dante estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Dante estava no Curral dos Camelos: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Zen estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Kael estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Kael estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Kael estava na Tenda Grande: na grade Cômodo, era a única opção que sobrava para ele. A Bruma estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Bruma estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | O Kael pediu licença à noite e acendeu o Lampião da Tenda. | Kael × Bússola ✗; Kael × Cantil ✗; Kael × Mapa ✗; Kael × Lampião ✓ | O Kael segurava o Lampião da Tenda. |
| 6 | 🎁 Objeto | O Zen, sem pressa nenhuma, segurava a Bússola da Caravana. | Zen × Cantil ✗; Zen × Mapa ✗; Zen × Bússola ✓ | O Zen segurava a Bússola da Caravana. |
| 7 | 🎁 Objeto | O Mapa Estelar da Caravana estava seco: a Bruma não o segurou. | Bruma × Mapa ✗ | A Bruma segurava o Cantil de Couro: na grade Objeto, era a única opção que sobrava para ela. O Dante segurava o Mapa Estelar da Caravana: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Zen — Duna Alta (casa D2), Bússola da Caravana · Dante — Curral dos Camelos (casa C3), Mapa Estelar da Caravana · Kael — Tenda Grande (casa A1), Lampião da Tenda · Bruma — Beira do Oásis (casa B4), Cantil de Couro

## sudoku-48 · O museu enterrado na duna

Mini Sudoku · capítulo 5 · Intermediário · Leitura do cenário · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | Os óculos da Jade ficaram cheios de areia: ela estava na Entrada quando a porta fechou. | Jade × Câmara Secreta ✗; Jade × Galeria das Dunas ✗; Jade × Sala dos Faraós ✗; Jade × Entrada ✓ | A Jade estava na Entrada. |
| 2 | ↔️ Linha | O guarda viu a Nina costurando um pergaminho na linha 2. | Nina × 1 ✗; Nina × 3 ✗; Nina × 4 ✗; Nina × 2 ✓ | A Nina estava na linha 2. A Nina estava na Câmara Secreta: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Jade estava na linha 1: na grade Linha, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | O Davi parou na coluna B para olhar um detalhe que ninguém viu. | Davi × A ✗; Davi × C ✗; Davi × D ✗; Davi × B ✓ | O Davi estava na coluna B. O Davi estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Davi estava na Galeria das Dunas: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Nina estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Orbi estava na linha 3: na grade Linha, era a única opção que sobrava para ele. O Orbi estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Orbi estava na Sala dos Faraós: na grade Cômodo, era a única opção que sobrava para ele. A Jade estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | Pó dourado nas orelhas de folha do Orbi: ele segurava o Pincel de Pó. | Orbi × Escaravelho ✗; Orbi × Pergaminho ✗; Orbi × Lamparina ✗; Orbi × Pincel de Pó ✓ | O Orbi segurava o Pincel de Pó. |
| 5 | 🎁 Objeto | A Nina remendava o Pergaminho Antigo de olhos fechados. | Nina × Escaravelho ✗; Nina × Lamparina ✗; Nina × Pergaminho ✓ | A Nina segurava o Pergaminho Antigo. |
| 6 | 🎁 Objeto | A Jade nem viu o Escaravelho de Pedra: ela não o segurava. | Jade × Escaravelho ✗ | A Jade segurava a Lamparina de Óleo: na grade Objeto, era a única opção que sobrava para ela. O Davi segurava o Escaravelho de Pedra: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Jade — Entrada (casa D1), Lamparina de Óleo · Nina — Câmara Secreta (casa A2), Pergaminho Antigo · Davi — Galeria das Dunas (casa B4), Escaravelho de Pedra · Orbi — Sala dos Faraós (casa C3), Pincel de Pó

## sudoku-54 · O refúgio do pico roncador

Mini Sudoku · capítulo 6 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | Música de ninar escapava das mãos da Faísca: ela segurava o Rádio de Pilha. | Faísca × Corda ✗; Faísca × Picareta ✗; Faísca × Bule ✗; Faísca × Rádio ✓ | A Faísca segurava o Rádio de Pilha. |
| 2 | 🎁 Objeto | O caderninho roxo da Maya registra: “dobrei a Corda de Escalada”. | Maya × Picareta ✗; Maya × Bule ✗; Maya × Corda ✓ | A Maya segurava a Corda de Escalada. |
| 3 | 🎁 Objeto | O Ravi não tocou na Picareta de Gelo. | Ravi × Picareta ✗ | O Ravi segurava o Bule de Chá Quente: na grade Objeto, era a única opção que sobrava para ele. O Kai segurava a Picareta de Gelo: na grade Objeto, era a única opção que sobrava para ele. |
| 4 | ↔️ Linha | Um capuz azul foi visto na linha 4: era o Ravi. | Ravi × 1 ✗; Ravi × 2 ✗; Ravi × 3 ✗; Ravi × 4 ✓ | O Ravi estava na linha 4. |
| 5 | 🏛️ Cômodo | A Maya não saiu do Dormitório: anotava cada ronco. | Maya × Varanda de Pedra ✗; Maya × Despensa ✗; Maya × Sala da Lareira ✗; Maya × Dormitório ✓ | A Maya estava no Dormitório. A Maya estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Maya estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Ravi estava na Sala da Lareira: na grade Cômodo, era a única opção que sobrava para ele. |
| 6 | 🏛️ Cômodo | Neve nas botas do Kai: ele estava na Varanda de Pedra. | Kai × Despensa ✗; Kai × Varanda de Pedra ✓ | O Kai estava na Varanda de Pedra. O Kai estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Kai estava na coluna B: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Faísca estava na linha 1: na grade Linha, era a única opção que sobrava para ela. A Faísca estava na Despensa: na grade Cômodo, era a única opção que sobrava para ela. |
| 7 | ↕️ Coluna | Ninguém viu o capuz azul do Ravi na coluna C. | Ravi × C ✗ | O Ravi estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. A Faísca estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. |

**Solução:** Faísca — Despensa (casa C1), Rádio de Pilha · Kai — Varanda de Pedra (casa B2), Picareta de Gelo · Maya — Dormitório (casa A3), Corda de Escalada · Ravi — Sala da Lareira (casa D4), Bule de Chá Quente

## sudoku-57 · A forja dentro da montanha

Mini Sudoku · capítulo 6 · Avançado · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O som do fone do Eco vazava pela coluna C. | Eco × A ✗; Eco × B ✗; Eco × D ✗; Eco × C ✓ | O Eco estava na coluna C. |
| 2 | 🏛️ Cômodo | O Theo lembra bem: “eu estava na Fornalha, contando as batidas”. | Theo × Depósito de Metal ✗; Theo × Túnel de Entrada ✗; Theo × Sala da Bigorna ✗; Theo × Fornalha ✓ | O Theo estava na Fornalha. O Theo estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Eco estava no Túnel de Entrada: na grade Cômodo, era a única opção que sobrava para ele. |
| 3 | ↔️ Linha | O Eco não estava na linha 1: lá a música não pega. | Eco × 1 ✗ | O Eco estava na linha 2: na grade Linha, era a única opção que sobrava para ele. |
| 4 | ↔️ Linha | Musgo queimadinho no chão da linha 4: o Rocha passou a tarde ali. | Rocha × 1 ✗; Rocha × 3 ✗; Rocha × 4 ✓ | O Rocha estava na linha 4. O Rocha estava na coluna B: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Rocha estava na Sala da Bigorna: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Theo estava na linha 3: na grade Linha, era a única opção que sobrava para ele. A Lyra estava na linha 1: na grade Linha, era a única opção que sobrava para ela. A Lyra estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. A Lyra estava no Depósito de Metal: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | O Eco pegou no ar a Espada Nova e não parou de dançar. | Eco × Martelo ✗; Eco × Tenaz ✗; Eco × Elmo ✗; Eco × Espada Nova ✓ | O Eco segurava a Espada Nova. |
| 6 | 🎁 Objeto | Faíscas no sorriso do Theo: ele segurava o Martelo de Forja. | Theo × Tenaz ✗; Theo × Elmo ✗; Theo × Martelo ✓ | O Theo segurava o Martelo de Forja. |
| 7 | 🎁 Objeto | A Lyra não segurava a Tenaz de Ferro: seus dedos estavam frios. | Lyra × Tenaz ✗ | A Lyra segurava o Elmo de Cobre: na grade Objeto, era a única opção que sobrava para ela. O Rocha segurava a Tenaz de Ferro: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Eco — Túnel de Entrada (casa C2), Espada Nova · Theo — Fornalha (casa D3), Martelo de Forja · Lyra — Depósito de Metal (casa A1), Elmo de Cobre · Rocha — Sala da Bigorna (casa B4), Tenaz de Ferro

## sudoku-63 · A estufa das flores da aurora

Mini Sudoku · capítulo 7 · Avançado · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Pegadas de lobo cristalizadas na coluna B: o Gelo estava ali. | Gelo × A ✗; Gelo × C ✗; Gelo × D ✗; Gelo × B ✓ | O Gelo estava na coluna B. |
| 2 | 🎁 Objeto | Pétalas de rosa geladas nas garras do Drako: ele segurava a Tesoura de Poda. | Drako × Regador ✗; Drako × Semente ✗; Drako × Lamparina ✗; Drako × Tesoura ✓ | O Drako segurava a Tesoura de Poda. |
| 3 | 🏛️ Cômodo | O brilho do Cubo se refletia em todo o Corredor de Vidro. | Cubo × Canteiro das Rosas ✗; Cubo × Viveiro ✗; Cubo × Canteiro dos Lírios ✗; Cubo × Corredor de Vidro ✓ | O Cubo estava no Corredor de Vidro. O Cubo estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Cubo estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Gelo estava no Viveiro: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | ↔️ Linha | A Lila não pulou pela linha 2: ali o chão é escorregadio. | Lila × 2 ✗ | A Lila estava no Canteiro dos Lírios: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Drako estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Drako estava no Canteiro das Rosas: na grade Cômodo, era a única opção que sobrava para ele. |
| 5 | ↕️ Coluna | Nenhuma pegada de coelha na coluna C: a Lila não esteve lá. | Lila × C ✗ | A Lila estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lila estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. O Drako estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Gelo estava na linha 3: na grade Linha, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | A luz fria vinha da Lamparina da Estufa que o Cubo segurava. | Cubo × Regador ✗; Cubo × Semente ✗; Cubo × Lamparina ✓ | O Cubo segurava a Lamparina da Estufa. |
| 7 | 🎁 Objeto | A Lila não segurava a Semente da Aurora — e está até agora com ciúmes. | Lila × Semente ✗ | A Lila segurava o Regador de Orvalho: na grade Objeto, era a única opção que sobrava para ela. O Gelo segurava a Semente da Aurora: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Drako — Canteiro das Rosas (casa C2), Tesoura de Poda · Cubo — Corredor de Vidro (casa A1), Lamparina da Estufa · Lila — Canteiro dos Lírios (casa D4), Regador de Orvalho · Gelo — Viveiro (casa B3), Semente da Aurora

## sudoku-66 · O abrigo dos esquiadores

Mini Sudoku · capítulo 7 · Avançado · Leitura do cenário · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O triângulo de luz da Gema refletia no Esqui Prateado que ela segurava. | Gema × Gorro de Lã ✗; Gema × Garrafa ✗; Gema × Apito ✗; Gema × Esqui ✓ | A Gema segurava o Esqui Prateado. |
| 2 | 🏛️ Cômodo | Neve derretendo no chão da Cantina: a Gema estava lá. | Gema × Vestiário ✗; Gema × Sala de Equipamentos ✗; Gema × Varanda Nevada ✗; Gema × Cantina ✓ | A Gema estava na Cantina. |
| 3 | ↔️ Linha | O broto da cabeça do Byte apareceu na janela da linha 4. | Byte × 1 ✗; Byte × 2 ✗; Byte × 3 ✗; Byte × 4 ✓ | O Byte estava na linha 4. O Byte estava na coluna C: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Byte estava na Varanda Nevada: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Gema estava na linha 3: na grade Linha, era a única opção que sobrava para ela. A Gema estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | O brilho do Cogu não apareceu na coluna D. | Cogu × D ✗ | O Cogu estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Cogu estava no Vestiário: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Alva estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. A Alva estava na Sala de Equipamentos: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | Bigode de chocolate no Cogu: ele segurava a Garrafa Térmica. | Cogu × Gorro de Lã ✗; Cogu × Apito ✗; Cogu × Garrafa ✓ | O Cogu segurava a Garrafa Térmica. |
| 6 | ↔️ Linha | O Cogu, tímido, não chegou nem perto da linha 2. | Cogu × 2 ✗ | O Cogu estava na linha 1: na grade Linha, era a única opção que sobrava para ele. A Alva estava na linha 2: na grade Linha, era a única opção que sobrava para ela. |
| 7 | 🎁 Objeto | A Alva não segurava o Apito do Socorrista: ela estava tricotando. | Alva × Apito ✗ | A Alva segurava o Gorro de Lã: na grade Objeto, era a única opção que sobrava para ela. O Byte segurava o Apito do Socorrista: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Cogu — Vestiário (casa A1), Garrafa Térmica · Alva — Sala de Equipamentos (casa D2), Gorro de Lã · Byte — Varanda Nevada (casa C4), Apito do Socorrista · Gema — Cantina (casa B3), Esqui Prateado

## sudoku-72 · A casa do escriba

Mini Sudoku · capítulo 8 · Avançado · Linhas, colunas e cômodos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O Rio mediu, com calma, cada passo da coluna C. | Rio × A ✗; Rio × B ✗; Rio × D ✗; Rio × C ✓ | O Rio estava na coluna C. |
| 2 | 🏛️ Cômodo | Gotinhas de neve derretida no Pátio: o Floco esteve lá. | Floco × Cozinha Antiga ✗; Floco × Sala dos Símbolos ✗; Floco × Escritório do Escriba ✗; Floco × Pátio ✓ | O Floco estava no Pátio. O Floco estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Rio estava no Escritório do Escriba: na grade Cômodo, era a única opção que sobrava para ele. |
| 3 | ↔️ Linha | A sombra redondinha do Pingo apareceu na linha 1. | Pingo × 2 ✗; Pingo × 3 ✗; Pingo × 4 ✗; Pingo × 1 ✓ | O Pingo estava na linha 1. O Pingo estava na Cozinha Antiga: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Floco estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Nico estava na Sala dos Símbolos: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | ↕️ Coluna | O anel de planeta do Pingo não brilhou na coluna B. | Pingo × B ✗ | O Pingo estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Nico estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Nico estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Rio estava na linha 3: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Nico ajustou os óculos sobre a Tabuleta de Argila que segurava. | Nico × Selo de Cera ✗; Nico × Pincel ✗; Nico × Ânfora ✗; Nico × Tabuleta ✓ | O Nico segurava a Tabuleta de Argila. |
| 6 | 🎁 Objeto | Pelo de camelo no cristal azul do Floco: ele segurava o Pincel de Escriba. | Floco × Selo de Cera ✗; Floco × Ânfora ✗; Floco × Pincel ✓ | O Floco segurava o Pincel de Escriba. |
| 7 | 🎁 Objeto | O Rio não segurava o Selo de Cera: as mãos dele estavam sujas de tinta. | Rio × Selo de Cera ✗ | O Rio segurava a Ânfora: na grade Objeto, era a única opção que sobrava para ele. O Pingo segurava o Selo de Cera: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Floco — Pátio (casa D2), Pincel de Escriba · Pingo — Cozinha Antiga (casa A1), Selo de Cera · Rio — Escritório do Escriba (casa C3), Ânfora · Nico — Sala dos Símbolos (casa B4), Tabuleta de Argila

## sudoku-77 · A praça do mercado antigo

Mini Sudoku · capítulo 8 · Avançado · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | As mãos da Lina ficaram escorregadias: ela segurava o Jarro de Azeite. | Lina × Balança ✗; Lina × Moeda do Rei ✗; Lina × Rolo de Seda ✗; Lina × Jarro ✓ | A Lina segurava o Jarro de Azeite. |
| 2 | ↔️ Linha | A sombra das asas do Umbra cobriu a linha 4. | Umbra × 1 ✗; Umbra × 2 ✗; Umbra × 3 ✗; Umbra × 4 ✓ | O Umbra estava na linha 4. |
| 3 | ↔️ Linha | Um capuz vermelho foi visto na linha 1: era o Rubro. | Rubro × 2 ✗; Rubro × 3 ✗; Rubro × 1 ✓ | O Rubro estava na linha 1. |
| 4 | ↕️ Coluna | O Umbra não passou pela coluna C: as asas não cabiam entre as bancas. | Umbra × C ✗ | O Umbra estava no Portão: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 5 | ↕️ Coluna | O piso da coluna A trincou com o peso do Quartzo. | Quartzo × B ✗; Quartzo × C ✗; Quartzo × D ✗; Quartzo × A ✓ | O Quartzo estava na coluna A. O Quartzo estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Quartzo estava na Banca das Especiarias: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lina estava na linha 3: na grade Linha, era a única opção que sobrava para ela. A Lina estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Lina estava na Banca dos Tecidos: na grade Cômodo, era a única opção que sobrava para ela. O Umbra estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Rubro estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Rubro estava na Fonte da Praça: na grade Cômodo, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Rubro segurava a Moeda do Rei, pronto para um pedido. | Rubro × Balança ✗; Rubro × Rolo de Seda ✗; Rubro × Moeda do Rei ✓ | O Rubro segurava a Moeda do Rei. |
| 7 | 🎁 Objeto | O Quartzo não segurava o Rolo de Seda: seda escorrega no cristal. | Quartzo × Rolo de Seda ✗ | O Quartzo segurava a Balança de Bronze: na grade Objeto, era a única opção que sobrava para ele. O Umbra segurava o Rolo de Seda: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Quartzo — Banca das Especiarias (casa A2), Balança de Bronze · Lina — Banca dos Tecidos (casa C3), Jarro de Azeite · Umbra — Portão (casa B4), Rolo de Seda · Rubro — Fonte da Praça (casa D1), Moeda do Rei

## sudoku-84 · A relojoaria ao avesso

Mini Sudoku · capítulo 9 · Mestre · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | A Marina equilibrava relógios na prateleira da linha 4. | Marina × 1 ✗; Marina × 2 ✗; Marina × 3 ✗; Marina × 4 ✓ | A Marina estava na linha 4. |
| 2 | 🏛️ Cômodo | Contas de estrelas rabiscadas na Oficina dos Ponteiros: a Vi estava lá. | Vi × Sala dos Cucos ✗; Vi × Vitrine ✗; Vi × Balcão ✗; Vi × Oficina dos Ponteiros ✓ | A Vi estava na Oficina dos Ponteiros. A Vi estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Marina estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. A Marina estava no Balcão: na grade Cômodo, era a única opção que sobrava para ela. |
| 3 | 🏛️ Cômodo | A Pipa não ficou na Vitrine: lá não tem nada para desmontar. | Pipa × Vitrine ✗ | A Pipa estava na Sala dos Cucos: na grade Cômodo, era a única opção que sobrava para ela. O Broto estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Broto estava na Vitrine: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | ↕️ Coluna | Nenhuma digital de detetive na coluna B: a Pipa não passou por ali. | Pipa × B ✗ | A Pipa estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Pipa estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. A Vi estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. O Broto estava na linha 2: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Broto segurava a Ampulheta Invertida, esperando crescer. | Broto × Engrenagem ✗; Broto × Chave ✗; Broto × Cuco ✗; Broto × Ampulheta ✓ | O Broto segurava a Ampulheta Invertida. |
| 6 | 🎁 Objeto | Graxa nos óculos da Pipa: ela segurava a Engrenagem Dourada. | Pipa × Chave ✗; Pipa × Cuco ✗; Pipa × Engrenagem ✓ | A Pipa segurava a Engrenagem Dourada. |
| 7 | 🎁 Objeto | A Marina não segurava o Cuco de Madeira: cuco desequilibra tudo. | Marina × Cuco ✗ | A Marina segurava a Chave de Corda: na grade Objeto, era a única opção que sobrava para ela. A Vi segurava o Cuco de Madeira: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Vi — Oficina dos Ponteiros (casa B3), Cuco de Madeira · Broto — Vitrine (casa C2), Ampulheta Invertida · Marina — Balcão (casa D4), Chave de Corda · Pipa — Sala dos Cucos (casa A1), Engrenagem Dourada

## sudoku-88 · A estação dos viajantes do tempo

Mini Sudoku · capítulo 9 · Mestre · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Lis sonhava acordada na Sala de Espera. | Lis × Bilheteria ✗; Lis × Plataforma do Futuro ✗; Lis × Plataforma do Passado ✗; Lis × Sala de Espera ✓ | A Lis estava na Sala de Espera. |
| 2 | 🎁 Objeto | Pelos pretos no Passaporte Temporal: era o Nox quem o segurava. | Nox × Cronômetro ✗; Nox × Mapa ✗; Nox × Mala ✗; Nox × Passaporte ✓ | O Nox segurava o Passaporte Temporal. |
| 3 | ↕️ Coluna | Dois olhos brilhando na coluna D: era o Nox. | Nox × A ✗; Nox × B ✗; Nox × C ✗; Nox × D ✓ | O Nox estava na coluna D. O Nox estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Nox estava na Plataforma do Passado: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lis estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | 🏛️ Cômodo | A Estela não foi à Bilheteria: ela já tinha bilhete. | Estela × Bilheteria ✗ | A Estela estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Estela estava na coluna B: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Estela estava na Plataforma do Futuro: na grade Cômodo, era a única opção que sobrava para ela. A Luna estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. A Luna estava na Bilheteria: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | ↔️ Linha | A Lis não sentou na linha 1: ali os bancos são do século passado. | Lis × 1 ✗ | A Lis estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Luna estava na linha 1: na grade Linha, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | A Estela não largava a Mala de Viagem do Século. | Estela × Cronômetro ✗; Estela × Mapa ✗; Estela × Mala ✓ | A Estela segurava a Mala de Viagem do Século. |
| 7 | 🎁 Objeto | A Luna não segurava o Mapa das Eras: ela só ouvia. | Luna × Mapa ✗ | A Luna segurava o Cronômetro de Bolso: na grade Objeto, era a única opção que sobrava para ela. A Lis segurava o Mapa das Eras: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Nox — Plataforma do Passado (casa D3), Passaporte Temporal · Lis — Sala de Espera (casa C2), Mapa das Eras · Estela — Plataforma do Futuro (casa B4), Mala de Viagem do Século · Luna — Bilheteria (casa A1), Cronômetro de Bolso

## sudoku-93 · O banquete dos campeões

Mini Sudoku · capítulo 10 · Mestre · Linhas, colunas e cômodos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | Reflexos azuis da Cris dançavam na linha 4. | Cris × 1 ✗; Cris × 2 ✗; Cris × 3 ✗; Cris × 4 ✓ | A Cris estava na linha 4. |
| 2 | 🏛️ Cômodo | A música da Íris enchia o Salão do Trono. | Íris × Sacada ✗; Íris × Galeria dos Heróis ✗; Íris × Antessala ✗; Íris × Salão do Trono ✓ | A Íris estava no Salão do Trono. A Íris estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Cris estava na Antessala: na grade Cômodo, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | A Cris não passou pela coluna B. | Cris × B ✗ | A Cris estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | Os passos prateados do Ayo seguiram pela coluna D. | Ayo × B ✗; Ayo × C ✗; Ayo × D ✓ | O Ayo estava na coluna D. O Ayo estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Ayo estava na Galeria dos Heróis: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Íris estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Flor estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Flor estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. A Flor estava na Sacada: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Íris tocava a Harpa de Luz sem olhar a partitura. | Íris × Coroa ✗; Íris × Taça ✗; Íris × Estandarte ✗; Íris × Harpa de Luz ✓ | A Íris segurava a Harpa de Luz. |
| 6 | 🎁 Objeto | A Cris segurava firme o Estandarte das Jornadas. | Cris × Coroa ✗; Cris × Taça ✗; Cris × Estandarte ✓ | A Cris segurava o Estandarte das Jornadas. |
| 7 | 🎁 Objeto | A Flor não segurava a Taça dos Campeões: estava ocupada com algo mais brilhante. | Flor × Taça ✗ | A Flor segurava a Coroa de Cristal: na grade Objeto, era a única opção que sobrava para ela. O Ayo segurava a Taça dos Campeões: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Íris — Salão do Trono (casa C3), Harpa de Luz · Flor — Sacada (casa B2), Coroa de Cristal · Ayo — Galeria dos Heróis (casa D1), Taça dos Campeões · Cris — Antessala (casa A4), Estandarte das Jornadas

## sudoku-98 · O teatro das jornadas

Mini Sudoku · capítulo 10 · Mestre · Leitura do cenário · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | Um brilho colorido piscou na linha 3: era o Prisma. | Prisma × 1 ✗; Prisma × 2 ✗; Prisma × 4 ✗; Prisma × 3 ✓ | O Prisma estava na linha 3. |
| 2 | ↔️ Linha | O coração da tela do Pixel brilhava na linha 1. | Pixel × 2 ✗; Pixel × 4 ✗; Pixel × 1 ✓ | O Pixel estava na linha 1. |
| 3 | 🎁 Objeto | O Ritmo marcava o tempo das falas no Roteiro do Ensaio. | Ritmo × Máscara ✗; Ritmo × Coroa ✗; Ritmo × Holofote ✗; Ritmo × Roteiro ✓ | O Ritmo segurava o Roteiro do Ensaio. |
| 4 | 🏛️ Cômodo | A música do Ritmo vinha da Coxia. | Ritmo × Palco ✗; Ritmo × Plateia ✗; Ritmo × Camarim ✗; Ritmo × Coxia ✓ | O Ritmo estava na Coxia. O Ritmo estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Ritmo estava na coluna B: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Leo estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Pixel estava no Palco: na grade Cômodo, era a única opção que sobrava para ele. |
| 5 | ↕️ Coluna | O Prisma não estava na coluna A: lá a luz não reflete. | Prisma × A ✗ | O Prisma estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Prisma estava no Camarim: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Leo estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Leo estava na Plateia: na grade Cômodo, era a única opção que sobrava para ele. O Pixel estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Leo segurava o Holofote Portátil “por via das dúvidas”. | Leo × Máscara ✗; Leo × Coroa ✗; Leo × Holofote ✓ | O Leo segurava o Holofote Portátil. |
| 7 | 🎁 Objeto | O Prisma não segurava a Coroa de Papel: ela não é do papel dele. | Prisma × Coroa ✗ | O Prisma segurava a Máscara de Ouro: na grade Objeto, era a única opção que sobrava para ele. O Pixel segurava a Coroa de Papel: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Leo — Plateia (casa A4), Holofote Portátil · Ritmo — Coxia (casa B2), Roteiro do Ensaio · Pixel — Palco (casa D1), Coroa de Papel · Prisma — Camarim (casa C3), Máscara de Ouro

## zip-04 · A corrida das nuvens saltitantes

Zip · capítulo 1 · Iniciante · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Luna bebia em silêncio da Garrafinha de Orvalho. | Luna × Medalha ✗; Luna × Bandeirinha ✗; Luna × Viseira ✗; Luna × Garrafinha ✓ | A Luna segurava a Garrafinha de Orvalho. |
| 2 | 🎁 Objeto | Os brincos de estrela da Lis tilintavam na Medalha das Nuvens que ela segurava. | Lis × Bandeirinha ✗; Lis × Viseira ✗; Lis × Medalha ✓ | A Lis segurava a Medalha das Nuvens. |
| 3 | 🎁 Objeto | A Sol não segurava a Bandeirinha de Chegada: usava as duas mãos para proteger os olhos. | Sol × Bandeirinha ✗ | A Sol segurava a Viseira de Penas: na grade Objeto, era a única opção que sobrava para ela. O Orbi segurava a Bandeirinha de Chegada: na grade Objeto, era a única opção que sobrava para ele. |
| 4 | 🔢 Parada | A Lis parou sonhando na 2ª parada da trilha. | Lis × 1 ✗; Lis × 3 ✗; Lis × 4 ✗; Lis × 5 ✗; Lis × 6 ✗; Lis × 7 ✗; Lis × 2 ✓ | A Lis estava na 2ª parada. |
| 5 | 🔢 Parada | Quando o sino tocou, o Orbi estava depois da 6ª parada, quase na chegada. | Orbi × 1 ✗; Orbi × 3 ✗; Orbi × 4 ✗; Orbi × 5 ✗; Orbi × 6 ✗; Orbi × 7 ✓ | O Orbi estava na 7ª parada. |
| 6 | 🔢 Parada | A Luna parou na 4ª parada para escutar o silêncio das nuvens. | Luna × 1 ✗; Luna × 3 ✗; Luna × 5 ✗; Luna × 6 ✗; Luna × 4 ✓ | A Luna estava na 4ª parada. |
| 7 | 🔢 Parada | A Sol vinha logo depois da Luna, pulando na nuvem seguinte. | Sol × 1 ✗; Sol × 3 ✗; Sol × 6 ✗; Sol × 5 ✓ | A Sol estava na 5ª parada. |

**Solução:** Orbi — Castelo Lilás (parada 7), Bandeirinha de Chegada · Sol — Arco-Íris (parada 5), Viseira de Penas · Lis — Castelo Lilás (parada 2), Medalha das Nuvens · Luna — Arco-Íris (parada 4), Garrafinha de Orvalho

## zip-08 · O carteiro das nuvens

Zip · capítulo 1 · Iniciante · Reconstrução do percurso · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Kael, muito educado, pediu licença para segurar a Carta Perfumada. | Kael × Pacote ✗; Kael × Cartão-Postal ✗; Kael × Telegrama ✗; Kael × Carta ✓ | O Kael segurava a Carta Perfumada. |
| 2 | 🔢 Parada | O cabelo branco do Kael brilhava depois da 6ª parada. | Kael × 1 ✗; Kael × 2 ✗; Kael × 3 ✗; Kael × 4 ✗; Kael × 5 ✗; Kael × 6 ✗; Kael × 7 ✓ | O Kael estava na 7ª parada. |
| 3 | 🔢 Parada | O Musgo nem chegou a sair: estava antes da 2ª parada. | Musgo × 2 ✗; Musgo × 3 ✗; Musgo × 4 ✗; Musgo × 5 ✗; Musgo × 6 ✗; Musgo × 1 ✓ | O Musgo estava na 1ª parada. |
| 4 | 🔢 Parada | O Gelo vinha logo depois do Musgo, farejando o caminho. | Gelo × 3 ✗; Gelo × 4 ✗; Gelo × 5 ✗; Gelo × 6 ✗; Gelo × 2 ✓ | O Gelo estava na 2ª parada. |
| 5 | 🔢 Parada | A Maya anotou no caderninho: “estou depois da 5ª parada”. | Maya × 3 ✗; Maya × 4 ✗; Maya × 5 ✗; Maya × 6 ✓ | A Maya estava na 6ª parada. |
| 6 | 🎁 Objeto | Pegadas de lobo no Cartão-Postal do Vale: era o Gelo quem o segurava. | Gelo × Pacote ✗; Gelo × Telegrama ✗; Gelo × Cartão-Postal ✓ | O Gelo segurava o Cartão-Postal do Vale. |
| 7 | 🎁 Objeto | O barbante do Pacote de Barbante prendeu no caderninho da Maya, que o segurava. | Maya × Telegrama ✗; Maya × Pacote ✓ | A Maya segurava o Pacote de Barbante. O Musgo segurava o Telegrama Urgente: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Gelo — Bairro das Nuvens (parada 2), Cartão-Postal do Vale · Maya — Praça do Arco-Íris (parada 6), Pacote de Barbante · Musgo — Praça do Arco-Íris (parada 1), Telegrama Urgente · Kael — Praça do Arco-Íris (parada 7), Carta Perfumada

## zip-13 · A excursão dos cogumelos luminosos

Zip · capítulo 2 · Iniciante · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | A Estela parou na 3ª parada para se guiar pelas estrelas-brinco. | Estela × 1 ✗; Estela × 2 ✗; Estela × 4 ✗; Estela × 5 ✗; Estela × 6 ✗; Estela × 7 ✗; Estela × 3 ✓ | A Estela estava na 3ª parada. |
| 2 | 🎁 Objeto | O Rubro examinava cogumelos com a Lupa de Bolso, escondido no capuz. | Rubro × Caderno ✗; Rubro × Pote ✗; Rubro × Periscópio ✗; Rubro × Lupa ✓ | O Rubro segurava a Lupa de Bolso. |
| 3 | 🔢 Parada | As botas do Kai ficaram encharcadas: ele estava no Riacho. | Kai × 1 ✗; Kai × 4 ✗; Kai × 5 ✗; Kai × 6 ✗; Kai × 7 ✗; Kai × 2 ✓ | O Kai estava na 2ª parada. |
| 4 | 🎁 Objeto | O Kai espiava os peixes com o Periscópio de Bambu. | Kai × Caderno ✗; Kai × Pote ✗; Kai × Periscópio ✓ | O Kai segurava o Periscópio de Bambu. |
| 5 | 🎁 Objeto | A Lyra não segurava o Caderno da Excursão: estava com as mãos nos fones. | Lyra × Caderno ✗ | A Lyra segurava o Pote de Esporos: na grade Objeto, era a única opção que sobrava para ela. A Estela segurava o Caderno da Excursão: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | 🔢 Parada | O Rubro ficou para trás, antes da 4ª parada. | Rubro × 4 ✗; Rubro × 5 ✗; Rubro × 6 ✗; Rubro × 7 ✗; Rubro × 1 ✓ | O Rubro estava na 1ª parada. |
| 7 | 🔢 Parada | A música da Lyra vinha lá do fim, depois da 6ª parada. | Lyra × 4 ✗; Lyra × 5 ✗; Lyra × 6 ✗; Lyra × 7 ✓ | A Lyra estava na 7ª parada. |

**Solução:** Rubro — Clareira dos Cogumelos (parada 1), Lupa de Bolso · Kai — Riacho (parada 2), Periscópio de Bambu · Lyra — Clareira dos Cogumelos (parada 7), Pote de Esporos · Estela — Riacho (parada 3), Caderno da Excursão

## zip-17 · A caça ao tesouro dos cristais

Zip · capítulo 2 · Iniciante · Reconstrução do percurso · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | O sorriso do Theo apareceu depois da 6ª parada, bem no fim da trilha. | Theo × 1 ✗; Theo × 2 ✗; Theo × 3 ✗; Theo × 4 ✗; Theo × 5 ✗; Theo × 6 ✗; Theo × 7 ✓ | O Theo estava na 7ª parada. |
| 2 | 🔢 Parada | Folhinhas do Broto caíram na 4ª parada da trilha. | Broto × 1 ✗; Broto × 2 ✗; Broto × 3 ✗; Broto × 5 ✗; Broto × 6 ✗; Broto × 4 ✓ | O Broto estava na 4ª parada. |
| 3 | 🎁 Objeto | Terra no cabelo prateado do Ayo: ele segurava a Pá de Brinquedo. | Ayo × Mapa ✗; Ayo × Luneta ✗; Ayo × Baú do Tesouro ✗; Ayo × Pá de Brinquedo ✓ | O Ayo segurava a Pá de Brinquedo. |
| 4 | 🎁 Objeto | A Pipa conferia as setas no Mapa do Tesouro com os óculos de aventura. | Pipa × Luneta ✗; Pipa × Baú do Tesouro ✗; Pipa × Mapa ✓ | A Pipa segurava o Mapa do Tesouro. |
| 5 | 🔢 Parada | A Pipa vinha logo depois do Broto, lendo as pistas em voz alta. | Pipa × 1 ✗; Pipa × 2 ✗; Pipa × 3 ✗; Pipa × 6 ✗; Pipa × 5 ✓ | A Pipa estava na 5ª parada. |
| 6 | 🎁 Objeto | O Broto não segurava o Baú do Tesouro: era pesado demais para um brotinho. | Broto × Baú do Tesouro ✗ | O Broto segurava a Luneta de Pirata: na grade Objeto, era a única opção que sobrava para ele. O Theo segurava o Baú do Tesouro: na grade Objeto, era a única opção que sobrava para ele. |
| 7 | 🔢 Parada | O Ayo cavava na 3ª parada da trilha. | Ayo × 1 ✗; Ayo × 2 ✗; Ayo × 6 ✗; Ayo × 3 ✓ | O Ayo estava na 3ª parada. |

**Solução:** Pipa — Clareira dos Cristais (parada 5), Mapa do Tesouro · Theo — Clareira dos Cristais (parada 7), Baú do Tesouro · Broto — Riacho Raso (parada 4), Luneta de Pirata · Ayo — Riacho Raso (parada 3), Pá de Brinquedo

## zip-22 · A descida do rio das prainhas

Zip · capítulo 3 · Intermediário · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | A Lila pulou de alegria lá no fim, depois da 6ª parada. | Lila × 1 ✗; Lila × 2 ✗; Lila × 3 ✗; Lila × 4 ✗; Lila × 5 ✗; Lila × 6 ✗; Lila × 7 ✓ | A Lila estava na 7ª parada. |
| 2 | 🎁 Objeto | A Lila não tirava o Colete Salva-Vidas nem para pular. | Lila × Remo ✗; Lila × Buzina ✗; Lila × Boné ✗; Lila × Colete ✓ | A Lila segurava o Colete Salva-Vidas. |
| 3 | 🎁 Objeto | Um remo saiu da névoa: o Vulto segurava o Remo de Reserva. | Vulto × Buzina ✗; Vulto × Boné ✗; Vulto × Remo ✓ | O Vulto segurava o Remo de Reserva. |
| 4 | 🎁 Objeto | O Dante não segurava o Boné de Aba Larga: diz que histórias se contam de cabeça descoberta. | Dante × Boné ✗ | O Dante segurava o Buzina de Mão: na grade Objeto, era a única opção que sobrava para ele. A Jade segurava o Boné de Aba Larga: na grade Objeto, era a única opção que sobrava para ela. |
| 5 | 🔢 Parada | A voz do Dante contava histórias depois da 5ª parada. | Dante × 1 ✗; Dante × 2 ✗; Dante × 3 ✗; Dante × 4 ✗; Dante × 5 ✗; Dante × 6 ✓ | O Dante estava na 6ª parada. |
| 6 | 🔢 Parada | O Vulto ficou parado na 2ª parada, sem dizer nada. | Vulto × 1 ✗; Vulto × 3 ✗; Vulto × 4 ✗; Vulto × 5 ✗; Vulto × 2 ✓ | O Vulto estava na 2ª parada. |
| 7 | 🔢 Parada | Os óculos da Jade brilharam depois da 4ª parada. | Jade × 1 ✗; Jade × 3 ✗; Jade × 4 ✗; Jade × 5 ✓ | A Jade estava na 5ª parada. |

**Solução:** Dante — Cachoeira (parada 6), Buzina de Mão · Lila — Cachoeira (parada 7), Colete Salva-Vidas · Vulto — Cachoeira (parada 2), Remo de Reserva · Jade — Remanso (parada 5), Boné de Aba Larga

## zip-28 · A rota das hortas flutuantes

Zip · capítulo 3 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | O Quartzo quase afundou o barco na 3ª parada da trilha. | Quartzo × 1 ✗; Quartzo × 2 ✗; Quartzo × 4 ✗; Quartzo × 5 ✗; Quartzo × 6 ✗; Quartzo × 7 ✗; Quartzo × 3 ✓ | O Quartzo estava na 3ª parada. |
| 2 | 🔢 Parada | A Vi contava as estrelas da 4ª parada. | Vi × 1 ✗; Vi × 2 ✗; Vi × 5 ✗; Vi × 6 ✗; Vi × 7 ✗; Vi × 4 ✓ | A Vi estava na 4ª parada. |
| 3 | 🎁 Objeto | As asas do Umbra pingavam: ele segurava o Regador de Lata. | Umbra × Cesto ✗; Umbra × Chapéu ✗; Umbra × Saquinho ✗; Umbra × Regador ✓ | O Umbra segurava o Regador de Lata. |
| 4 | 🔢 Parada | A Cris começou bem cedo, antes da 2ª parada. | Cris × 2 ✗; Cris × 5 ✗; Cris × 6 ✗; Cris × 7 ✗; Cris × 1 ✓ | A Cris estava na 1ª parada. |
| 5 | 🔢 Parada | O Umbra não estava no Canal: as asas não cabem entre os barcos. | Umbra × 5 ✗; Umbra × 6 ✗; Umbra × 7 ✗ | O Umbra estava na 2ª parada: na grade Parada, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | A Vi protegia os olhos com o Chapéu de Palha para ver as estrelas de dia. | Vi × Cesto ✗; Vi × Saquinho ✗; Vi × Chapéu ✓ | A Vi segurava o Chapéu de Palha. |
| 7 | 🎁 Objeto | A Cris não segurava o Saquinho de Sementes Gigantes: as mãos dela só refletiam verduras. | Cris × Saquinho ✗ | A Cris segurava o Cesto de Verduras: na grade Objeto, era a única opção que sobrava para ela. O Quartzo segurava o Saquinho de Sementes Gigantes: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Cris — Horta das Couves (parada 1), Cesto de Verduras · Vi — Canal (parada 4), Chapéu de Palha · Quartzo — Horta das Couves (parada 3), Saquinho de Sementes Gigantes · Umbra — Horta das Couves (parada 2), Regador de Lata

## zip-34 · A procissão das tochas

Zip · capítulo 4 · Intermediário · Reconstrução do percurso · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | O som do fone do Eco vinha lá do fim, depois da 6ª parada. | Eco × 1 ✗; Eco × 2 ✗; Eco × 3 ✗; Eco × 4 ✗; Eco × 5 ✗; Eco × 6 ✗; Eco × 7 ✓ | O Eco estava na 7ª parada. |
| 2 | 🔢 Parada | A risada da Neve ecoou depois da 5ª parada. | Neve × 1 ✗; Neve × 2 ✗; Neve × 3 ✗; Neve × 4 ✗; Neve × 5 ✗; Neve × 6 ✓ | A Neve estava na 6ª parada. |
| 3 | 🎁 Objeto | O Rolo das Orações ficou úmido: era a Bruma quem o segurava. | Bruma × Lanterna ✗; Bruma × Tocha ✗; Bruma × Sininho ✗; Bruma × Rolo ✓ | A Bruma segurava o Rolo das Orações. |
| 4 | 🎁 Objeto | O Astro iluminava o mapa do céu com a Lanterna de Papel. | Astro × Tocha ✗; Astro × Sininho ✗; Astro × Lanterna ✓ | O Astro segurava a Lanterna de Papel. |
| 5 | 🎁 Objeto | O Eco não segurava a Tocha Sagrada: fogo e fone não combinam. | Eco × Tocha ✗ | O Eco segurava o Sininho do Santuário: na grade Objeto, era a única opção que sobrava para ele. A Neve segurava a Tocha Sagrada: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | 🔢 Parada | Os passos de robô do Astro pararam na 3ª parada da trilha. | Astro × 1 ✗; Astro × 2 ✗; Astro × 4 ✗; Astro × 5 ✗; Astro × 3 ✓ | O Astro estava na 3ª parada. |
| 7 | 🔢 Parada | Um nevoeiro fininho cobriu a 2ª parada: era a Bruma. | Bruma × 1 ✗; Bruma × 4 ✗; Bruma × 5 ✗; Bruma × 2 ✓ | A Bruma estava na 2ª parada. |

**Solução:** Bruma — Pátio Estrelado (parada 2), Rolo das Orações · Astro — Pátio Estrelado (parada 3), Lanterna de Papel · Eco — Santuário (parada 7), Sininho do Santuário · Neve — Santuário (parada 6), Tocha Sagrada

## zip-37 · A ronda noturna do templo

Zip · capítulo 4 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Ritmo segurava a Carta Estelar e marcava as estrelas no compasso. | Ritmo × Lampião ✗; Ritmo × Chave Mestra ✗; Ritmo × Guizo ✗; Ritmo × Carta ✓ | O Ritmo segurava a Carta Estelar. |
| 2 | 🔢 Parada | Uma bola de chiclete estourou na 2ª parada da trilha: era a Kika. | Kika × 1 ✗; Kika × 3 ✗; Kika × 4 ✗; Kika × 5 ✗; Kika × 6 ✗; Kika × 7 ✗; Kika × 2 ✓ | A Kika estava na 2ª parada. |
| 3 | 🎁 Objeto | Pelos pretos no Lampião de Bronze: o Nox o segurava. | Nox × Chave Mestra ✗; Nox × Guizo ✗; Nox × Lampião ✓ | O Nox segurava o Lampião de Bronze. |
| 4 | 🎁 Objeto | O Drako não segurava a Chave Mestra: chave pequena some na garra dele. | Drako × Chave Mestra ✗ | O Drako segurava o Guizo de Ronda: na grade Objeto, era a única opção que sobrava para ele. A Kika segurava a Chave Mestra: na grade Objeto, era a única opção que sobrava para ela. |
| 5 | 🔢 Parada | Dois olhos brilharam na 6ª parada: era o Nox. | Nox × 1 ✗; Nox × 3 ✗; Nox × 4 ✗; Nox × 5 ✗; Nox × 7 ✗; Nox × 6 ✓ | O Nox estava na 6ª parada. |
| 6 | 🔢 Parada | O Drako parou na 5ª parada da trilha, soprando ar gelado. | Drako × 1 ✗; Drako × 3 ✗; Drako × 4 ✗; Drako × 7 ✗; Drako × 5 ✓ | O Drako estava na 5ª parada. |
| 7 | 🔢 Parada | O Ritmo não estava na Escadaria Norte: lá o eco atrapalha a música. | Ritmo × 1 ✗; Ritmo × 3 ✗; Ritmo × 7 ✗ | O Ritmo estava na 4ª parada: na grade Parada, era a única opção que sobrava para ele. |

**Solução:** Nox — Escadaria Norte (parada 6), Lampião de Bronze · Kika — Escadaria Norte (parada 2), Chave Mestra · Drako — Biblioteca (parada 5), Guizo de Ronda · Ritmo — Biblioteca (parada 4), Carta Estelar

## zip-43 · As pegadas na duna

Zip · capítulo 5 · Intermediário · Reconstrução do percurso · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | O triângulo de luz da Gema brilhou antes da 2ª parada, bem no começo. | Gema × 2 ✗; Gema × 3 ✗; Gema × 4 ✗; Gema × 5 ✗; Gema × 6 ✗; Gema × 7 ✗; Gema × 1 ✓ | A Gema estava na 1ª parada. |
| 2 | 🔢 Parada | O Cogu vinha logo depois da Gema, tímido, brilhando nas pegadas dela. | Cogu × 3 ✗; Cogu × 4 ✗; Cogu × 5 ✗; Cogu × 6 ✗; Cogu × 7 ✗; Cogu × 2 ✓ | O Cogu estava na 2ª parada. |
| 3 | 🔢 Parada | Uma flor do cabelo da Flor caiu na 6ª parada da trilha. | Flor × 3 ✗; Flor × 4 ✗; Flor × 5 ✗; Flor × 7 ✗; Flor × 6 ✓ | A Flor estava na 6ª parada. |
| 4 | 🔢 Parada | A sombra do Pingo passou antes da 4ª parada. | Pingo × 4 ✗; Pingo × 5 ✗; Pingo × 7 ✗; Pingo × 3 ✓ | O Pingo estava na 3ª parada. |
| 5 | 🎁 Objeto | O Cogu se apoiava no Bastão de Caminhada para subir a areia. | Cogu × Turbante ✗; Cogu × Astrolábio ✗; Cogu × Cabaça ✗; Cogu × Bastão ✓ | O Cogu segurava o Bastão de Caminhada. |
| 6 | 🎁 Objeto | A Flor regava a flor do cabelo com a Cabaça de Água. | Flor × Turbante ✗; Flor × Astrolábio ✗; Flor × Cabaça ✓ | A Flor segurava a Cabaça de Água. |
| 7 | 🎁 Objeto | A Gema não segurava o Turbante Listrado: o triângulo de luz não deixava. | Gema × Turbante ✗ | A Gema segurava a Astrolábio de Bolso: na grade Objeto, era a única opção que sobrava para ela. O Pingo segurava o Turbante Listrado: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Flor — Acampamento (parada 6), Cabaça de Água · Gema — Duna Alta (parada 1), Astrolábio de Bolso · Cogu — Duna Alta (parada 2), Bastão de Caminhada · Pingo — Acampamento (parada 3), Turbante Listrado

## zip-46 · A descida das dunas de prancha

Zip · capítulo 5 · Intermediário · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Nimbo ficou branquinho: ele segurava o Protetor Solar. | Nimbo × Prancha ✗; Nimbo × Óculos ✗; Nimbo × Garrafa ✗; Nimbo × Protetor ✓ | O Nimbo segurava o Protetor Solar. |
| 2 | 🎁 Objeto | A Faísca bebia da Garrafa de Suco de Cacto sem parar de correr. | Faísca × Prancha ✗; Faísca × Óculos ✗; Faísca × Garrafa ✓ | A Faísca segurava a Garrafa de Suco de Cacto. |
| 3 | 🎁 Objeto | O Zen não segurava os Óculos Espelhados: ele aprecia a paisagem sem filtro. | Zen × Óculos ✗ | O Zen segurava a Prancha de Areia: na grade Objeto, era a única opção que sobrava para ele. O Prisma segurava o Óculos Espelhados: na grade Objeto, era a única opção que sobrava para ele. |
| 4 | 🔢 Parada | O Zen sentou com calma na 3ª parada da trilha. | Zen × 1 ✗; Zen × 2 ✗; Zen × 4 ✗; Zen × 5 ✗; Zen × 6 ✗; Zen × 7 ✗; Zen × 3 ✓ | O Zen estava na 3ª parada. |
| 5 | 🔢 Parada | O Nimbo mudou de cor na 2ª parada da trilha. | Nimbo × 1 ✗; Nimbo × 4 ✗; Nimbo × 5 ✗; Nimbo × 6 ✗; Nimbo × 7 ✗; Nimbo × 2 ✓ | O Nimbo estava na 2ª parada. |
| 6 | 🔢 Parada | O brilho do Prisma refletia na 7ª parada, a última. | Prisma × 1 ✗; Prisma × 4 ✗; Prisma × 5 ✗; Prisma × 6 ✗; Prisma × 7 ✓ | O Prisma estava na 7ª parada. |
| 7 | 🔢 Parada | A Faísca, que nunca anda devagar, já estava depois da 5ª parada. | Faísca × 1 ✗; Faísca × 4 ✗; Faísca × 5 ✗; Faísca × 6 ✓ | A Faísca estava na 6ª parada. |

**Solução:** Faísca — Vale de Areia (parada 6), Garrafa de Suco de Cacto · Prisma — Duna Alta (parada 7), Óculos Espelhados · Nimbo — Duna Alta (parada 2), Protetor Solar · Zen — Duna Alta (parada 3), Prancha de Areia

## zip-52 · Os trilhos da mina abandonada

Zip · capítulo 6 · Avançado · Reconstrução do percurso · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Ravi segurava a Picareta Enferrujada, discreto como uma sombra. | Ravi × Lampião ✗; Ravi × Desenho ✗; Ravi × Detector ✗; Ravi × Picareta ✓ | O Ravi segurava a Picareta Enferrujada. |
| 2 | 🔢 Parada | O brilho do Cubo iluminou a 3ª parada da trilha. | Cubo × 1 ✗; Cubo × 2 ✗; Cubo × 4 ✗; Cubo × 5 ✗; Cubo × 6 ✗; Cubo × 7 ✗; Cubo × 8 ✗; Cubo × 3 ✓ | O Cubo estava na 3ª parada. |
| 3 | 🔢 Parada | A Alva vinha logo depois do Cubo, sorrindo de olhos fechados. | Alva × 1 ✗; Alva × 2 ✗; Alva × 5 ✗; Alva × 6 ✗; Alva × 7 ✗; Alva × 8 ✗; Alva × 4 ✓ | A Alva estava na 4ª parada. |
| 4 | 🎁 Objeto | O Detector de Cristais apitava sem parar nas mãos do Cubo. | Cubo × Lampião ✗; Cubo × Desenho ✗; Cubo × Detector ✓ | O Cubo segurava o Detector de Cristais. |
| 5 | 🔢 Parada | O Ravi seguia logo depois da Alva, em silêncio. | Ravi × 1 ✗; Ravi × 2 ✗; Ravi × 6 ✗; Ravi × 7 ✗; Ravi × 8 ✗; Ravi × 5 ✓ | O Ravi estava na 5ª parada. |
| 6 | 🎁 Objeto | A Alva não segurava o Desenho dos Túneis: de olhos fechados, não dá para ler. | Alva × Desenho ✗ | A Alva segurava o Lampião de Mineiro: na grade Objeto, era a única opção que sobrava para ela. O Pixel segurava o Desenho dos Túneis: na grade Objeto, era a única opção que sobrava para ele. |
| 7 | 🔢 Parada | O Pixel não estava no Poço de Ar: o vento de lá desliga a tela dele. | Pixel × 1 ✗; Pixel × 6 ✗; Pixel × 7 ✗; Pixel × 8 ✗ | O Pixel estava na 2ª parada: na grade Parada, era a única opção que sobrava para ele. |

**Solução:** Pixel — Trilho Velho (parada 2), Desenho dos Túneis · Ravi — Galeria Norte (parada 5), Picareta Enferrujada · Cubo — Trilho Velho (parada 3), Detector de Cristais · Alva — Trilho Velho (parada 4), Lampião de Mineiro

## zip-57 · O pastoreio das cabras da montanha

Zip · capítulo 6 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | A Íris lia três livros ao mesmo tempo na 3ª parada da trilha. | Íris × 1 ✗; Íris × 2 ✗; Íris × 4 ✗; Íris × 5 ✗; Íris × 6 ✗; Íris × 7 ✗; Íris × 8 ✗; Íris × 3 ✓ | A Íris estava na 3ª parada. |
| 2 | 🎁 Objeto | Cheiro de queijo no broto do Byte: ele segurava o Queijo Fresco. | Byte × Chocalho ✗; Byte × Bordão ✗; Byte × Flauta ✗; Byte × Queijo ✓ | O Byte segurava o Queijo Fresco. |
| 3 | 🔢 Parada | O Nico ajustou os óculos na 4ª parada da trilha. | Nico × 1 ✗; Nico × 2 ✗; Nico × 5 ✗; Nico × 6 ✗; Nico × 7 ✗; Nico × 8 ✗; Nico × 4 ✓ | O Nico estava na 4ª parada. |
| 4 | 🔢 Parada | Musgo molhado no chão: o Rocha estava no Riacho. | Rocha × 1 ✗; Rocha × 5 ✗; Rocha × 6 ✗; Rocha × 7 ✗; Rocha × 8 ✗; Rocha × 2 ✓ | O Rocha estava na 2ª parada. |
| 5 | 🔢 Parada | O Byte não estava no Penhasco: as rodinhas dele escorregam. | Byte × 1 ✗; Byte × 6 ✗; Byte × 7 ✗; Byte × 8 ✗ | O Byte estava na 5ª parada: na grade Parada, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Rocha, que fala pouco, apontava o caminho com o Bordão de Pastor. | Rocha × Chocalho ✗; Rocha × Flauta ✗; Rocha × Bordão ✓ | O Rocha segurava o Bordão de Pastor. |
| 7 | 🎁 Objeto | O Nico não segurava a Flauta de Pastor: ele nem sabe tocar. | Nico × Flauta ✗ | O Nico segurava o Chocalho da Cabra-Líder: na grade Objeto, era a única opção que sobrava para ele. A Íris segurava a Flauta de Pastor: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Byte — Curral (parada 5), Queijo Fresco · Rocha — Riacho (parada 2), Bordão de Pastor · Íris — Riacho (parada 3), Flauta de Pastor · Nico — Curral (parada 4), Chocalho da Cabra-Líder

## zip-64 · A corrida de trenós da aurora

Zip · capítulo 7 · Avançado · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Rio estudava com calma o Mapa da Corrida. | Rio × Óculos ✗; Rio × Luvas ✗; Rio × Petisco ✗; Rio × Mapa ✓ | O Rio segurava o Mapa da Corrida. |
| 2 | 🔢 Parada | O sorriso do Chip brilhou na 8ª parada da trilha. | Chip × 1 ✗; Chip × 2 ✗; Chip × 3 ✗; Chip × 4 ✗; Chip × 5 ✗; Chip × 6 ✗; Chip × 7 ✗; Chip × 8 ✓ | O Chip estava na 8ª parada. |
| 3 | 🔢 Parada | O Rio parou na 7ª parada, atento a cada curva. | Rio × 1 ✗; Rio × 2 ✗; Rio × 3 ✗; Rio × 4 ✗; Rio × 5 ✗; Rio × 6 ✗; Rio × 7 ✓ | O Rio estava na 7ª parada. |
| 4 | 🎁 Objeto | A Lina cantava batendo palmas com as Luvas de Pelúcia. | Lina × Óculos ✗; Lina × Petisco ✗; Lina × Luvas ✓ | A Lina segurava a Luvas de Pelúcia. |
| 5 | 🎁 Objeto | O Chip não segurava o Petisco das Raposas: robô não come, e as raposas sabem. | Chip × Petisco ✗ | O Chip segurava o Óculos de Neve: na grade Objeto, era a única opção que sobrava para ele. A Nina segurava o Petisco das Raposas: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | 🔢 Parada | A Nina remendava uma rédea na 4ª parada da trilha. | Nina × 1 ✗; Nina × 2 ✗; Nina × 3 ✗; Nina × 5 ✗; Nina × 6 ✗; Nina × 4 ✓ | A Nina estava na 4ª parada. |
| 7 | 🔢 Parada | A Lina não estava na Rampa: lá ela não consegue cantar e frear ao mesmo tempo. | Lina × 1 ✗; Lina × 2 ✗; Lina × 3 ✗; Lina × 6 ✗ | A Lina estava na 5ª parada: na grade Parada, era a única opção que sobrava para ela. |

**Solução:** Lina — Pista do Iglu (parada 5), Luvas de Pelúcia · Chip — Floresta Nevada (parada 8), Óculos de Neve · Rio — Floresta Nevada (parada 7), Mapa da Corrida · Nina — Pista do Iglu (parada 4), Petisco das Raposas

## zip-68 · O cortejo musical da aurora

Zip · capítulo 7 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O cristal do Floco tremia a cada batida do Tambor de Gelo que ele segurava. | Floco × Sanfoninha ✗; Floco × Campainha ✗; Floco × Lanterna ✗; Floco × Tambor ✓ | O Floco segurava o Tambor de Gelo. |
| 2 | 🔢 Parada | O Leo já estava depois da 7ª parada, adiantado como seus palpites. | Leo × 1 ✗; Leo × 2 ✗; Leo × 3 ✗; Leo × 4 ✗; Leo × 5 ✗; Leo × 6 ✗; Leo × 7 ✗; Leo × 8 ✓ | O Leo estava na 8ª parada. |
| 3 | 🔢 Parada | O Floco batucava na 5ª parada da trilha. | Floco × 1 ✗; Floco × 2 ✗; Floco × 3 ✗; Floco × 4 ✗; Floco × 6 ✗; Floco × 7 ✗; Floco × 5 ✓ | O Floco estava na 5ª parada. |
| 4 | 🔢 Parada | A Marina mantinha o ritmo em equilíbrio na 7ª parada. | Marina × 1 ✗; Marina × 2 ✗; Marina × 3 ✗; Marina × 4 ✗; Marina × 6 ✗; Marina × 7 ✓ | A Marina estava na 7ª parada. |
| 5 | 🔢 Parada | A Mel não estava na Ponte de Gelo: ri tanto que escorregaria. | Mel × 1 ✗; Mel × 2 ✗; Mel × 3 ✗; Mel × 4 ✗ | A Mel estava na 6ª parada: na grade Parada, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | A Marina abria e fechava a Sanfoninha sem perder o compasso. | Marina × Campainha ✗; Marina × Lanterna ✗; Marina × Sanfoninha ✓ | A Marina segurava a Sanfoninha. |
| 7 | 🎁 Objeto | A Mel não segurava a Lanterna Boreal: precisava das duas mãos para rir. | Mel × Lanterna ✗ | A Mel segurava o Campainha de Trenó: na grade Objeto, era a única opção que sobrava para ela. O Leo segurava a Lanterna Boreal: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Leo — Porto (parada 8), Lanterna Boreal · Marina — Praça Gelada (parada 7), Sanfoninha · Floco — Praça Gelada (parada 5), Tambor de Gelo · Mel — Praça Gelada (parada 6), Campainha de Trenó

## zip-73 · O tour noturno pelas ruínas

Zip · capítulo 8 · Avançado · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | A luz do Orbi brilhou na 5ª parada da trilha. | Orbi × 1 ✗; Orbi × 2 ✗; Orbi × 3 ✗; Orbi × 4 ✗; Orbi × 6 ✗; Orbi × 7 ✗; Orbi × 8 ✗; Orbi × 5 ✓ | O Orbi estava na 5ª parada. |
| 2 | 🎁 Objeto | Os brincos de estrela da Lis apareciam em todas as fotos da Câmera Instantânea que ela segurava. | Lis × Audioguia ✗; Lis × Folheto ✗; Lis × Lanterna ✗; Lis × Câmera ✓ | A Lis segurava a Câmera Instantânea. |
| 3 | 🎁 Objeto | O Davi apontava a Lanterna de Mão para os detalhes que ninguém via. | Davi × Audioguia ✗; Davi × Folheto ✗; Davi × Lanterna ✓ | O Davi segurava a Lanterna de Mão. |
| 4 | 🎁 Objeto | A Sol não segurava o Audioguia: prefere ouvir o deserto. | Sol × Audioguia ✗ | A Sol segurava o Folheto do Tour: na grade Objeto, era a única opção que sobrava para ela. O Orbi segurava o Audioguia: na grade Objeto, era a única opção que sobrava para ele. |
| 5 | 🔢 Parada | O Davi parou na 2ª parada para reparar numa rachadura. | Davi × 1 ✗; Davi × 3 ✗; Davi × 4 ✗; Davi × 6 ✗; Davi × 7 ✗; Davi × 8 ✗; Davi × 2 ✓ | O Davi estava na 2ª parada. |
| 6 | 🔢 Parada | O olhar dourado da Sol brilhou na 4ª parada da trilha. | Sol × 1 ✗; Sol × 3 ✗; Sol × 6 ✗; Sol × 7 ✗; Sol × 8 ✗; Sol × 4 ✓ | A Sol estava na 4ª parada. |
| 7 | 🔢 Parada | A Lis não passou pelo Mercado Antigo: estava sonhando acordada em outro lugar. | Lis × 1 ✗; Lis × 6 ✗; Lis × 7 ✗; Lis × 8 ✗ | A Lis estava na 3ª parada: na grade Parada, era a única opção que sobrava para ela. |

**Solução:** Davi — Praça das Colunas (parada 2), Lanterna de Mão · Orbi — Arena (parada 5), Audioguia · Sol — Praça das Colunas (parada 4), Folheto do Tour · Lis — Praça das Colunas (parada 3), Câmera Instantânea

## zip-78 · O resgate no labirinto de pedra

Zip · capítulo 8 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | O Musgo se enroscou nas raízes: ele estava na Sala das Raízes. | Musgo × 1 ✗; Musgo × 2 ✗; Musgo × 3 ✗; Musgo × 5 ✗; Musgo × 6 ✗; Musgo × 7 ✗; Musgo × 8 ✗; Musgo × 4 ✓ | O Musgo estava na 4ª parada. |
| 2 | 🎁 Objeto | A Maya anotava tudo à luz do Capacete com Luz que segurava. | Maya × Corda ✗; Maya × Corneta ✗; Maya × Kit de Primeiros Socorros ✗; Maya × Capacete ✓ | A Maya segurava a Capacete com Luz. |
| 3 | 🔢 Parada | A Maya vinha logo depois do Musgo, conferindo as marcas de giz. | Maya × 1 ✗; Maya × 2 ✗; Maya × 3 ✗; Maya × 6 ✗; Maya × 7 ✗; Maya × 8 ✗; Maya × 5 ✓ | A Maya estava na 5ª parada. |
| 4 | 🔢 Parada | A Luna não estava no Corredor dos Ecos: lá não há silêncio para ela ouvir. | Luna × 1 ✗; Luna × 2 ✗; Luna × 3 ✗; Luna × 7 ✗; Luna × 8 ✗ | A Luna estava na 6ª parada: na grade Parada, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | O Musgo segurava a Corda de Sisal, pronta para puxar alguém. | Musgo × Corneta ✗; Musgo × Kit de Primeiros Socorros ✗; Musgo × Corda ✓ | O Musgo segurava a Corda de Sisal. |
| 6 | 🎁 Objeto | O Gelo não segurava o Kit de Primeiros Socorros: correu na frente sem ele. | Gelo × Kit de Primeiros Socorros ✗ | O Gelo segurava o Corneta de Resgate: na grade Objeto, era a única opção que sobrava para ele. A Luna segurava o Kit de Primeiros Socorros: na grade Objeto, era a única opção que sobrava para ela. |
| 7 | 🔢 Parada | Pegadas de lobo seguiam até depois da 7ª parada: era o Gelo. | Gelo × 1 ✗; Gelo × 2 ✗; Gelo × 3 ✗; Gelo × 7 ✗; Gelo × 8 ✓ | O Gelo estava na 8ª parada. |

**Solução:** Luna — Pátio Afundado (parada 6), Kit de Primeiros Socorros · Gelo — Corredor dos Ecos (parada 8), Corneta de Resgate · Maya — Pátio Afundado (parada 5), Capacete com Luz · Musgo — Sala das Raízes (parada 4), Corda de Sisal

## zip-83 · O labirinto dos relógios

Zip · capítulo 9 · Mestre · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Kael, educado, pediu licença à Ampulheta de Areia Azul antes de virá-la. | Kael × Bússola ✗; Kael × Chave ✗; Kael × Mapa Rasgado ✗; Kael × Ampulheta ✓ | O Kael segurava a Ampulheta de Areia Azul. |
| 2 | 🔢 Parada | O cabelo branco do Kael apareceu depois da 7ª parada. | Kael × 1 ✗; Kael × 2 ✗; Kael × 3 ✗; Kael × 4 ✗; Kael × 5 ✗; Kael × 6 ✗; Kael × 7 ✗; Kael × 8 ✓ | O Kael estava na 8ª parada. |
| 3 | 🔢 Parada | O Kai desenhou o mapa da Sala do Agora: ele estava lá. | Kai × 1 ✗; Kai × 2 ✗; Kai × 3 ✗; Kai × 4 ✗; Kai × 5 ✗; Kai × 6 ✗; Kai × 7 ✓ | O Kai estava na 7ª parada. |
| 4 | 🔢 Parada | A Lyra ficou ouvindo os tique-taques na 1ª parada da trilha. | Lyra × 2 ✗; Lyra × 3 ✗; Lyra × 4 ✗; Lyra × 5 ✗; Lyra × 6 ✗; Lyra × 1 ✓ | A Lyra estava na 1ª parada. |
| 5 | 🔢 Parada | O Rubro não estava no Corredor dos Ponteiros. | Rubro × 3 ✗; Rubro × 4 ✗; Rubro × 5 ✗; Rubro × 6 ✗ | O Rubro estava na 2ª parada: na grade Parada, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Kai segurava a Chave de Bronze da última porta. | Kai × Bússola ✗; Kai × Mapa Rasgado ✗; Kai × Chave ✓ | O Kai segurava a Chave de Bronze. |
| 7 | 🎁 Objeto | A Lyra não segurava o Mapa Rasgado: ela se guia pela música. | Lyra × Mapa Rasgado ✗ | A Lyra segurava a Bússola do Tempo: na grade Objeto, era a única opção que sobrava para ela. O Rubro segurava o Mapa Rasgado: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Kael — Sala do Agora (parada 8), Ampulheta de Areia Azul · Rubro — Ala do Ontem (parada 2), Mapa Rasgado · Kai — Sala do Agora (parada 7), Chave de Bronze · Lyra — Ala do Ontem (parada 1), Bússola do Tempo

## zip-87 · O experimento do túnel do tempo

Zip · capítulo 9 · Mestre · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🔢 Parada | A Estela conferia as estrelas-brinco na 3ª parada da trilha. | Estela × 1 ✗; Estela × 2 ✗; Estela × 4 ✗; Estela × 5 ✗; Estela × 6 ✗; Estela × 7 ✗; Estela × 8 ✗; Estela × 3 ✓ | A Estela estava na 3ª parada. |
| 2 | 🔢 Parada | O Broto não estava na Câmara do Ontem: ele quer crescer, não diminuir. | Broto × 1 ✗; Broto × 4 ✗; Broto × 5 ✗; Broto × 6 ✗; Broto × 7 ✗; Broto × 8 ✗ | O Broto estava na 2ª parada: na grade Parada, era a única opção que sobrava para ele. |
| 3 | 🔢 Parada | O sorriso do Theo apareceu depois da 7ª parada. | Theo × 1 ✗; Theo × 4 ✗; Theo × 5 ✗; Theo × 6 ✗; Theo × 7 ✗; Theo × 8 ✓ | O Theo estava na 8ª parada. |
| 4 | 🎁 Objeto | O Broto segurava o Cronômetro Quântico para ver quanto tempo leva para crescer. | Broto × Bateria ✗; Broto × Caderno ✗; Broto × Óculos ✗; Broto × Cronômetro ✓ | O Broto segurava o Cronômetro Quântico. |
| 5 | 🎁 Objeto | A Pipa trocou os óculos de aventura pelos Óculos de Proteção que segurava. | Pipa × Bateria ✗; Pipa × Caderno ✗; Pipa × Óculos ✓ | A Pipa segurava o Óculos de Proteção. |
| 6 | 🎁 Objeto | O Theo não segurava o Caderno de Fórmulas: ele sabe todas de cor. | Theo × Caderno ✗ | O Theo segurava a Bateria de Raios: na grade Objeto, era a única opção que sobrava para ele. A Estela segurava o Caderno de Fórmulas: na grade Objeto, era a única opção que sobrava para ela. |
| 7 | 🔢 Parada | A Pipa vinha logo depois da Estela, investigando cada fio. | Pipa × 1 ✗; Pipa × 5 ✗; Pipa × 6 ✗; Pipa × 7 ✗; Pipa × 4 ✓ | A Pipa estava na 4ª parada. |

**Solução:** Estela — Sala das Máquinas (parada 3), Caderno de Fórmulas · Pipa — Câmara do Ontem (parada 4), Óculos de Proteção · Theo — Câmara do Ontem (parada 8), Bateria de Raios · Broto — Câmara do Amanhã (parada 2), Cronômetro Quântico

## zip-92 · O cortejo até o Trono

Zip · capítulo 10 · Mestre · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Lila pulava de alegria com a Coroa de Louros nas mãos. | Lila × Troféu ✗; Lila × Flâmula ✗; Lila × Medalhão ✗; Lila × Coroa ✓ | A Lila segurava a Coroa de Louros. |
| 2 | 🎁 Objeto | O cabelo prateado do Ayo esvoaçava com a Flâmula dos Ventos que ele segurava. | Ayo × Troféu ✗; Ayo × Medalhão ✗; Ayo × Flâmula ✓ | O Ayo segurava a Flâmula dos Ventos. |
| 3 | 🎁 Objeto | O Dante não segurava o Troféu do Infinito: estava ocupado contando a história dele. | Dante × Troféu ✗ | O Dante segurava o Medalhão de Ouro: na grade Objeto, era a única opção que sobrava para ele. O Vulto segurava o Troféu do Infinito: na grade Objeto, era a única opção que sobrava para ele. |
| 4 | 🔢 Parada | A Lila já tinha pulado para depois da 7ª parada. | Lila × 1 ✗; Lila × 2 ✗; Lila × 3 ✗; Lila × 4 ✗; Lila × 5 ✗; Lila × 6 ✗; Lila × 7 ✗; Lila × 8 ✓ | A Lila estava na 8ª parada. |
| 5 | 🔢 Parada | O Dante contava histórias na 3ª parada da trilha. | Dante × 1 ✗; Dante × 2 ✗; Dante × 4 ✗; Dante × 5 ✗; Dante × 6 ✗; Dante × 7 ✗; Dante × 3 ✓ | O Dante estava na 3ª parada. |
| 6 | 🔢 Parada | O vento do Patamar dos Ventos bagunçou o cabelo do Ayo: ele estava lá. | Ayo × 1 ✗; Ayo × 4 ✗; Ayo × 5 ✗; Ayo × 6 ✗; Ayo × 7 ✗; Ayo × 2 ✓ | O Ayo estava na 2ª parada. |
| 7 | 🔢 Parada | O Vulto não estava na Ponte de Cristal: lá o reflexo o revelaria. | Vulto × 1 ✗; Vulto × 4 ✗; Vulto × 5 ✗; Vulto × 6 ✗ | O Vulto estava na 7ª parada: na grade Parada, era a única opção que sobrava para ele. |

**Solução:** Ayo — Patamar dos Ventos (parada 2), Flâmula dos Ventos · Dante — Patamar dos Ventos (parada 3), Medalhão de Ouro · Lila — Portal do Trono (parada 8), Coroa de Louros · Vulto — Portal do Trono (parada 7), Troféu do Infinito

## zip-96 · A queima de fogos do Trono

Zip · capítulo 10 · Mestre · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Cris segurava a Trombeta de Sinal, refletindo a luz das tochas. | Cris × Foguete ✗; Cris × Acendedor ✗; Cris × Mapa ✗; Cris × Trombeta ✓ | A Cris segurava o Trombeta de Sinal. |
| 2 | 🔢 Parada | A Vi contava as estrelas na 2ª parada da trilha. | Vi × 1 ✗; Vi × 3 ✗; Vi × 4 ✗; Vi × 5 ✗; Vi × 6 ✗; Vi × 7 ✗; Vi × 8 ✗; Vi × 2 ✓ | A Vi estava na 2ª parada. |
| 3 | 🔢 Parada | Os óculos de aviadora da Jade brilharam na 3ª parada da trilha. | Jade × 1 ✗; Jade × 4 ✗; Jade × 5 ✗; Jade × 6 ✗; Jade × 7 ✗; Jade × 8 ✗; Jade × 3 ✓ | A Jade estava na 3ª parada. |
| 4 | 🎁 Objeto | A Vi conferia no Mapa dos Fogos onde cada estrela ia explodir. | Vi × Foguete ✗; Vi × Acendedor ✗; Vi × Mapa ✓ | A Vi segurava o Mapa dos Fogos. |
| 5 | 🎁 Objeto | A Jade não segurava o Acendedor Longo: piloto de balão não brinca com fogo. | Jade × Acendedor ✗ | A Jade segurava o Foguete Dourado: na grade Objeto, era a única opção que sobrava para ela. O Quartzo segurava o Acendedor Longo: na grade Objeto, era a única opção que sobrava para ele. |
| 6 | 🔢 Parada | O Quartzo não estava na Torre Leste: a escada é estreita demais para ele. | Quartzo × 1 ✗; Quartzo × 5 ✗; Quartzo × 6 ✗; Quartzo × 7 ✗; Quartzo × 8 ✗ | O Quartzo estava na 4ª parada: na grade Parada, era a única opção que sobrava para ele. |
| 7 | 🔢 Parada | Reflexos azuis da Cris dançavam na 7ª parada da trilha. | Cris × 1 ✗; Cris × 5 ✗; Cris × 6 ✗; Cris × 8 ✗; Cris × 7 ✓ | A Cris estava na 7ª parada. |

**Solução:** Jade — Ponte Real (parada 3), Foguete Dourado · Cris — Torre Leste (parada 7), Trombeta de Sinal · Vi — Jardim do Trono (parada 2), Mapa dos Fogos · Quartzo — Ponte Real (parada 4), Acendedor Longo

## tango-02 · A ponte de arco-íris

Tango · capítulo 1 · Iniciante · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Musgo do Rocha ficou grudado no corrimão da coluna C. | Rocha × A ✗; Rocha × B ✗; Rocha × D ✗; Rocha × C ✓ | O Rocha estava na coluna C. |
| 2 | ↕️ Coluna | O broto do Byte balançava ao vento na coluna D, a última da ponte. | Byte × A ✗; Byte × B ✗; Byte × D ✓ | O Byte estava na coluna D. |
| 3 | ↕️ Coluna | Um rastro de neve do Floco derreteu na coluna B. | Floco × A ✗; Floco × B ✓ | O Floco estava na coluna B. O Floco estava no lado do Cristal (Margem do Sol): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Gema estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | 💠 Lado | O Byte e o Floco tocaram juntinhos, do mesmo lado da ponte. | Byte × Orbe ✗; Byte × Cristal ✓ | O Byte estava no lado do Cristal (Margem do Sol). A Gema estava no lado do Orbe (Margem da Lua): na grade Lado, era a única opção que sobrava para ela. O Rocha estava no lado do Orbe (Margem da Lua): na grade Lado, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O triângulo de luz da Gema piscava a cada batida: ela tocava o Tambor de Nuvem. | Gema × Flauta ✗; Gema × Pandeiro ✗; Gema × Sineta ✗; Gema × Tambor ✓ | A Gema segurava o Tambor de Nuvem. |
| 6 | 🎁 Objeto | O Byte segurava a Sineta do Maestro — e não resistiu a tocá-la. | Byte × Flauta ✗; Byte × Pandeiro ✗; Byte × Sineta ✓ | O Byte segurava o Sineta do Maestro. |
| 7 | 🎁 Objeto | O Rocha, que fala pouco, deixou a Flauta de Arco-Íris falar por ele. | Rocha × Pandeiro ✗; Rocha × Flauta ✓ | O Rocha segurava a Flauta de Arco-Íris. O Floco segurava o Pandeiro Celeste: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Floco — Margem do Sol (casa B1), Pandeiro Celeste · Gema — Margem da Lua (casa A2), Tambor de Nuvem · Byte — Margem do Sol (casa D1), Sineta do Maestro · Rocha — Margem da Lua (casa C2), Flauta de Arco-Íris

## tango-06 · O torneio de pipas entre torres

Tango · capítulo 1 · Iniciante · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 💠 Lado | A Pipa acenava lá da Torre Sul, a do Orbe, com os óculos de aventura. | Pipa × Cristal ✗; Pipa × Orbe ✓ | A Pipa estava no lado do Orbe (Torre Sul). |
| 2 | 💠 Lado | O Zen estava do mesmo lado da Pipa, sentado sem pressa. | Zen × Cristal ✗; Zen × Orbe ✓ | O Zen estava no lado do Orbe (Torre Sul). O Theo estava no lado do Cristal (Torre Norte): na grade Lado, era a única opção que sobrava para ele. O Musgo estava no lado do Cristal (Torre Norte): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | O Theo lembra direitinho: a sacada dele ficava na coluna D. | Theo × B ✗; Theo × C ✗; Theo × D ✓ | O Theo estava na coluna D. |
| 4 | ↕️ Coluna | O Zen nem se mexeu da coluna C a tarde toda. | Zen × A ✗; Zen × B ✗; Zen × C ✓ | O Zen estava na coluna C. O Musgo estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. A Pipa estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | Linha dourada enrolada nos dedos da Pipa: ela segurava o Carretel de Linha Dourada. | Pipa × Dragão ✗; Pipa × Coruja ✗; Pipa × Rabiola ✗; Pipa × Carretel ✓ | A Pipa segurava o Carretel de Linha Dourada. |
| 6 | 🎁 Objeto | O Theo, sorridente, amarrava laço por laço da Rabiola de Laços. | Theo × Dragão ✗; Theo × Coruja ✗; Theo × Rabiola ✓ | O Theo segurava a Rabiola de Laços. |
| 7 | 🎁 Objeto | Nenhum pelo verde na Coruja de Seda: o Musgo não a segurou. | Musgo × Coruja ✗ | O Musgo segurava a Dragão de Papel: na grade Objeto, era a única opção que sobrava para ele. O Zen segurava a Coruja de Seda: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Zen — Torre Sul (casa C2), Coruja de Seda · Theo — Torre Norte (casa D1), Rabiola de Laços · Pipa — Torre Sul (casa A2), Carretel de Linha Dourada · Musgo — Torre Norte (casa B1), Dragão de Papel

## tango-14 · O acampamento dos vaga-lumes

Tango · capítulo 2 · Iniciante · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A lanterna de leitura da Íris iluminou a barraca da coluna B a noite toda. | Íris × A ✗; Íris × C ✗; Íris × D ✗; Íris × B ✓ | A Íris estava na coluna B. |
| 2 | 🎁 Objeto | A Flor ficou com açúcar até na flor do cabelo: ela segurava o Saco de Marshmallows. | Flor × Apito ✗; Flor × Binóculo ✗; Flor × Mapa ✗; Flor × Saco ✓ | A Flor segurava o Saco de Marshmallows. |
| 3 | ↕️ Coluna | O chão da coluna D afundou com o peso do Quartzo. | Quartzo × A ✗; Quartzo × C ✗; Quartzo × D ✓ | O Quartzo estava na coluna D. |
| 4 | 💠 Lado | A Flor armou a barraca no Lado da Clareira, o lado do Orbe. | Flor × Cristal ✗; Flor × Orbe ✓ | A Flor estava no lado do Orbe (Lado da Clareira). A Flor estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Drako estava no lado do Cristal (Lado do Riacho): na grade Lado, era a única opção que sobrava para ele. O Drako estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 💠 Lado | O Quartzo ficou no Lado do Riacho, o lado do Cristal, para combinar. | Quartzo × Orbe ✗; Quartzo × Cristal ✓ | O Quartzo estava no lado do Cristal (Lado do Riacho). A Íris estava no lado do Orbe (Lado da Clareira): na grade Lado, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | O Drako vigiava o céu com o Binóculo Noturno. | Drako × Apito ✗; Drako × Mapa ✗; Drako × Binóculo ✓ | O Drako segurava o Binóculo Noturno. |
| 7 | 🎁 Objeto | A Íris não segurava o Mapa dos Vaga-Lumes: estava ocupada com três livros. | Íris × Mapa ✗ | A Íris segurava o Apito de Bambu: na grade Objeto, era a única opção que sobrava para ela. O Quartzo segurava o Mapa dos Vaga-Lumes: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Drako — Lado do Riacho (casa C1), Binóculo Noturno · Quartzo — Lado do Riacho (casa D1), Mapa dos Vaga-Lumes · Flor — Lado da Clareira (casa A2), Saco de Marshmallows · Íris — Lado da Clareira (casa B2), Apito de Bambu

## tango-18 · O espetáculo dos esquilos acrobatas

Tango · capítulo 2 · Iniciante · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 💠 Lado | As asas do Umbra cobriram o Galho Alto, o lado do Cristal. | Umbra × Orbe ✗; Umbra × Cristal ✓ | O Umbra estava no lado do Cristal (Galho Alto). |
| 2 | 💠 Lado | O Cubo estava do mesmo lado do Umbra, iluminando o show. | Cubo × Orbe ✗; Cubo × Cristal ✓ | O Cubo estava no lado do Cristal (Galho Alto). O Leo estava no lado do Orbe (Galho Baixo): na grade Lado, era a única opção que sobrava para ele. O Vulto estava no lado do Orbe (Galho Baixo): na grade Lado, era a única opção que sobrava para ele. |
| 3 | 🎁 Objeto | Um brilho dourado escapava da capa do Vulto: ele segurava a Noz Dourada. | Vulto × Pinha ✗; Vulto × Fita ✗; Vulto × Trapézio ✗; Vulto × Noz Dourada ✓ | O Vulto segurava a Noz Dourada. |
| 4 | 🎁 Objeto | O Cubo guardou na memória o peso da Pinha Gigante que segurava. | Cubo × Fita ✗; Cubo × Trapézio ✗; Cubo × Pinha ✓ | O Cubo segurava a Pinha Gigante. |
| 5 | ↕️ Coluna | O Leo palpitou o show inteiro da coluna A. | Leo × B ✗; Leo × C ✗; Leo × D ✗; Leo × A ✓ | O Leo estava na coluna A. O Vulto estava na coluna B: na grade Coluna, só ele ainda podia ficar com isso. |
| 6 | 🎁 Objeto | O Umbra balançava a Fita de Cetim com a ponta da cauda. | Umbra × Trapézio ✗; Umbra × Fita ✓ | O Umbra segurava a Fita de Cetim. O Leo segurava o Trapézio de Cipó: na grade Objeto, era a única opção que sobrava para ele. |
| 7 | ↕️ Coluna | A cauda do Umbra pendia lá na coluna D. | Umbra × C ✗; Umbra × D ✓ | O Umbra estava na coluna D. O Cubo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Umbra — Galho Alto (casa D1), Fita de Cetim · Cubo — Galho Alto (casa C1), Pinha Gigante · Leo — Galho Baixo (casa A2), Trapézio de Cipó · Vulto — Galho Baixo (casa B2), Noz Dourada

## tango-23 · A regata de barquinhos de papel

Tango · capítulo 3 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | Chiclete grudado na vela do Veleiro Dourado: era a Kika quem o segurava. | Kika × Galeão ✗; Kika × Barquinho ✗; Kika × Canoa ✗; Kika × Veleiro ✓ | A Kika segurava o Veleiro Dourado. |
| 2 | 💠 Lado | A risada da Neve vinha do Cais Sul, o lado do Orbe. | Neve × Cristal ✗; Neve × Orbe ✓ | A Neve estava no lado do Orbe (Cais Sul). |
| 3 | 💠 Lado | A Kika largou do mesmo lado da Neve, rindo junto. | Kika × Cristal ✗; Kika × Orbe ✓ | A Kika estava no lado do Orbe (Cais Sul). O Dante estava no lado do Cristal (Cais Norte): na grade Lado, era a única opção que sobrava para ele. A Lyra estava no lado do Cristal (Cais Norte): na grade Lado, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | O Dante contou a história de cada nervura da Canoa de Folha Seca que segurava. | Dante × Galeão ✗; Dante × Barquinho ✗; Dante × Canoa ✓ | O Dante segurava a Canoa de Folha Seca. |
| 5 | 🎁 Objeto | A Neve não segurava o Barquinho de Jornal: ela nem lê jornal. | Neve × Barquinho ✗ | A Neve segurava o Galeão Pirata de Papel: na grade Objeto, era a única opção que sobrava para ela. A Lyra segurava o Barquinho de Jornal: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | ↕️ Coluna | Uma bola de chiclete da Kika estourou na coluna C. | Kika × A ✗; Kika × B ✗; Kika × D ✗; Kika × C ✓ | A Kika estava na coluna C. A Neve estava na coluna D: na grade Coluna, só ela ainda podia ficar com isso. |
| 7 | ↕️ Coluna | A Lyra não esteve na coluna B: lá a música dos fones não pega. | Lyra × B ✗ | A Lyra estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Dante estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Kika — Cais Sul (casa C2), Veleiro Dourado · Dante — Cais Norte (casa B1), Canoa de Folha Seca · Neve — Cais Sul (casa D2), Galeão Pirata de Papel · Lyra — Cais Norte (casa A1), Barquinho de Jornal

## tango-27 · O varal das duas margens

Tango · capítulo 3 · Intermediário · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Os passos de robô do Astro marcaram a grama da coluna C. | Astro × A ✗; Astro × B ✗; Astro × D ✗; Astro × C ✓ | O Astro estava na coluna C. |
| 2 | 🎁 Objeto | Bolhas de sabão nos óculos da Jade: ela segurava o Sabão de Coco. | Jade × Lençol ✗; Jade × Cesto ✗; Jade × Pregador ✗; Jade × Sabão ✓ | A Jade segurava o Sabão de Coco. |
| 3 | 🎁 Objeto | O Ravi se escondeu atrás do Lençol Bordado que segurava — discreto como sempre. | Ravi × Cesto ✗; Ravi × Pregador ✗; Ravi × Lençol ✓ | O Ravi segurava o Lençol Bordado. |
| 4 | ↕️ Coluna | Um capuz azul apareceu na coluna A: era o Ravi. | Ravi × B ✗; Ravi × D ✗; Ravi × A ✓ | O Ravi estava na coluna A. |
| 5 | ↕️ Coluna | A luz do Orbi brilhava na coluna B. | Orbi × D ✗; Orbi × B ✓ | O Orbi estava na coluna B. O Orbi estava no lado do Orbe (Margem Direita): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Jade estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | O Astro não segurava o Cesto de Vime: as mãos de robô prendem no vime. | Astro × Cesto ✗ | O Astro segurava o Pregador de Madeira: na grade Objeto, era a única opção que sobrava para ele. O Orbi segurava o Cesto de Vime: na grade Objeto, era a única opção que sobrava para ele. |
| 7 | 💠 Lado | O Ravi estava do mesmo lado do Orbi, os dois longe do vento. | Ravi × Cristal ✗; Ravi × Orbe ✓ | O Ravi estava no lado do Orbe (Margem Direita). A Jade estava no lado do Cristal (Margem Esquerda): na grade Lado, era a única opção que sobrava para ela. O Astro estava no lado do Cristal (Margem Esquerda): na grade Lado, era a única opção que sobrava para ele. |

**Solução:** Orbi — Margem Direita (casa B2), Cesto de Vime · Jade — Margem Esquerda (casa D1), Sabão de Coco · Astro — Margem Esquerda (casa C1), Pregador de Madeira · Ravi — Margem Direita (casa A2), Lençol Bordado

## tango-32 · O coral das duas galerias

Tango · capítulo 4 · Intermediário · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Kael, educado, pediu licença e segurou a Partitura do Hino. | Kael × Diapasão ✗; Kael × Vela ✗; Kael × Lenço ✗; Kael × Partitura ✓ | O Kael segurava a Partitura do Hino. |
| 2 | ↕️ Coluna | O Kai desenhou o mapa do templo encostado na parede da coluna A. | Kai × B ✗; Kai × C ✗; Kai × D ✗; Kai × A ✓ | O Kai estava na coluna A. |
| 3 | 🎁 Objeto | Cera quente nos fones do Ritmo: ele segurava a Vela de Cera de Abelha. | Ritmo × Diapasão ✗; Ritmo × Lenço ✗; Ritmo × Vela ✓ | O Ritmo segurava a Vela de Cera de Abelha. |
| 4 | 🎁 Objeto | A Lis não segurava o Diapasão de Prata: estava sonhando acordada. | Lis × Diapasão ✗ | A Lis segurava o Lenço da Regente: na grade Objeto, era a única opção que sobrava para ela. O Kai segurava o Diapasão de Prata: na grade Objeto, era a única opção que sobrava para ele. |
| 5 | ↕️ Coluna | O Ritmo marcava a batida na coluna B. | Ritmo × C ✗; Ritmo × D ✗; Ritmo × B ✓ | O Ritmo estava na coluna B. O Ritmo estava no lado do Orbe (Galeria do Poente): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 6 | 💠 Lado | O Kai cantou do mesmo lado do Ritmo, no compasso dele. | Kai × Cristal ✗; Kai × Orbe ✓ | O Kai estava no lado do Orbe (Galeria do Poente). O Kael estava no lado do Cristal (Galeria do Oriente): na grade Lado, era a única opção que sobrava para ele. A Lis estava no lado do Cristal (Galeria do Oriente): na grade Lado, era a única opção que sobrava para ela. |
| 7 | ↕️ Coluna | Os brincos de estrela da Lis não brilharam na coluna D. | Lis × D ✗ | A Lis estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. O Kael estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Kael — Galeria do Oriente (casa D1), Partitura do Hino · Kai — Galeria do Poente (casa A2), Diapasão de Prata · Lis — Galeria do Oriente (casa C1), Lenço da Regente · Ritmo — Galeria do Poente (casa B2), Vela de Cera de Abelha

## tango-38 · A biblioteca das duas alas

Tango · capítulo 4 · Intermediário · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O Davi reparou numa rachadura que ninguém viu, lá na coluna D. | Davi × A ✗; Davi × B ✗; Davi × C ✗; Davi × D ✓ | O Davi estava na coluna D. |
| 2 | ↕️ Coluna | Folhinhas do Broto caíram no tapete da coluna C. | Broto × A ✗; Broto × B ✗; Broto × C ✓ | O Broto estava na coluna C. |
| 3 | 🎁 Objeto | Cera pingada nos sapatos do Davi: ele segurava o Castiçal de Bronze. | Davi × Livro ✗; Davi × Pena ✗; Davi × Chave ✗; Davi × Castiçal ✓ | O Davi segurava o Castiçal de Bronze. |
| 4 | ↕️ Coluna | A Bruma não flutuou pela coluna A: o nevoeiro molharia os livros. | Bruma × A ✗ | A Bruma estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. A Lila estava no lado do Orbe (Ala do Sol): na grade Lado, era a única opção que sobrava para ela. A Lila estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 💠 Lado | O Broto estava do mesmo lado da Lila, tentando pular igual a ela. | Broto × Cristal ✗; Broto × Orbe ✓ | O Broto estava no lado do Orbe (Ala do Sol). A Bruma estava no lado do Cristal (Ala da Lua): na grade Lado, era a única opção que sobrava para ela. O Davi estava no lado do Cristal (Ala da Lua): na grade Lado, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | As páginas do Livro das Constelações ficaram úmidas: era a Bruma quem o segurava. | Bruma × Pena ✗; Bruma × Chave ✗; Bruma × Livro ✓ | A Bruma segurava o Livro das Constelações. |
| 7 | 🎁 Objeto | O Broto rabiscava com a Pena de Coruja, crescendo a cada palavra. | Broto × Chave ✗; Broto × Pena ✓ | O Broto segurava a Pena de Coruja. A Lila segurava a Chave da Estante Alta: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Bruma — Ala da Lua (casa B1), Livro das Constelações · Davi — Ala da Lua (casa D1), Castiçal de Bronze · Lila — Ala do Sol (casa A2), Chave da Estante Alta · Broto — Ala do Sol (casa C2), Pena de Coruja

## tango-44 · O mercado das tendas em fileira

Tango · capítulo 5 · Intermediário · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A cantoria da Lina vinha da tenda da coluna A. | Lina × B ✗; Lina × C ✗; Lina × D ✗; Lina × A ✓ | A Lina estava na coluna A. A Lina estava no lado do Orbe (Fileira dos Tecidos): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 🎁 Objeto | A Estela trocou estrelas por doces e ficou com a Caixa de Tâmaras. | Estela × Pote ✗; Estela × Tapete ✗; Estela × Lanterna ✗; Estela × Caixa ✓ | A Estela segurava a Caixa de Tâmaras. |
| 3 | 🎁 Objeto | Pó laranja no pelo azul da Cris: ela segurava o Pote de Açafrão. | Cris × Tapete ✗; Cris × Lanterna ✗; Cris × Pote ✓ | A Cris segurava o Pote de Açafrão. |
| 4 | 🎁 Objeto | A Lina não segurava a Lanterna de Vidro Colorido: cantava de mãos livres. | Lina × Lanterna ✗ | A Lina segurava o Tapete Bordado de Dunas: na grade Objeto, era a única opção que sobrava para ela. A Marina segurava a Lanterna de Vidro Colorido: na grade Objeto, era a única opção que sobrava para ela. |
| 5 | 💠 Lado | A Estela estava do mesmo lado da Lina, cantando junto. | Estela × Cristal ✗; Estela × Orbe ✓ | A Estela estava no lado do Orbe (Fileira dos Tecidos). A Marina estava no lado do Cristal (Fileira das Especiarias): na grade Lado, era a única opção que sobrava para ela. A Cris estava no lado do Cristal (Fileira das Especiarias): na grade Lado, era a única opção que sobrava para ela. |
| 6 | ↕️ Coluna | As estrelas-brinco da Estela brilhavam na coluna B. | Estela × C ✗; Estela × D ✗; Estela × B ✓ | A Estela estava na coluna B. |
| 7 | ↕️ Coluna | A Marina equilibrava pilhas de pratos na coluna C. | Marina × D ✗; Marina × C ✓ | A Marina estava na coluna C. A Cris estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |

**Solução:** Estela — Fileira dos Tecidos (casa B2), Caixa de Tâmaras · Marina — Fileira das Especiarias (casa C1), Lanterna de Vidro Colorido · Cris — Fileira das Especiarias (casa D1), Pote de Açafrão · Lina — Fileira dos Tecidos (casa A2), Tapete Bordado de Dunas

## tango-47 · A largada da corrida de camelos

Tango · capítulo 5 · Intermediário · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A Nina remendava selas na coluna B. | Nina × A ✗; Nina × C ✗; Nina × D ✗; Nina × B ✓ | A Nina estava na coluna B. A Nina estava no lado do Cristal (Pista Norte): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 💠 Lado | O Rio estava do mesmo lado da Nina, observando com calma. | Rio × Orbe ✗; Rio × Cristal ✓ | O Rio estava no lado do Cristal (Pista Norte). A Sol estava no lado do Orbe (Pista Sul): na grade Lado, era a única opção que sobrava para ela. O Ayo estava no lado do Orbe (Pista Sul): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | O cabelo prateado do Ayo brilhava na coluna A. | Ayo × C ✗; Ayo × D ✗; Ayo × A ✓ | O Ayo estava na coluna A. |
| 4 | ↕️ Coluna | A Sol não estava na coluna D: dali não se vê o horizonte. | Sol × D ✗ | A Sol estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. O Rio estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Ayo segurava a Bandeirola de Largada — e o braço coçava para balançá-la. | Ayo × Sela Bordada ✗; Ayo × Odre de Água ✗; Ayo × Lenço ✗; Ayo × Bandeirola ✓ | O Ayo segurava a Bandeirola de Largada. |
| 6 | 🎁 Objeto | O Rio protegia o rosto da areia com o Lenço do Vento. | Rio × Sela Bordada ✗; Rio × Odre de Água ✗; Rio × Lenço ✓ | O Rio segurava o Lenço do Vento. |
| 7 | 🎁 Objeto | A Nina não segurava o Odre de Água: estava com as mãos cheias de linha. | Nina × Odre de Água ✗ | A Nina segurava a Sela Bordada: na grade Objeto, era a única opção que sobrava para ela. A Sol segurava o Odre de Água: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Nina — Pista Norte (casa B1), Sela Bordada · Rio — Pista Norte (casa D1), Lenço do Vento · Sol — Pista Sul (casa C2), Odre de Água · Ayo — Pista Sul (casa A2), Bandeirola de Largada

## tango-53 · A travessia da ponte suspensa

Tango · capítulo 6 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Dois olhos brilhando na coluna A: era o Nox. | Nox × B ✗; Nox × C ✗; Nox × D ✗; Nox × A ✓ | O Nox estava na coluna A. O Nox estava no lado do Cristal (Lado do Penhasco): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 💠 Lado | A Maya parou do mesmo lado do Nox e anotou tudo no caderninho. | Maya × Orbe ✗; Maya × Cristal ✓ | A Maya estava no lado do Cristal (Lado do Penhasco). O Pixel estava no lado do Orbe (Lado da Caverna): na grade Lado, era a única opção que sobrava para ele. A Mel estava no lado do Orbe (Lado da Caverna): na grade Lado, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | A Maya não estava na coluna D: a ponte ali balançava demais para escrever. | Maya × D ✗ | A Maya estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | O coração da tela do Pixel não apareceu na coluna C. | Pixel × C ✗ | O Pixel estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. A Mel estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | O Pixel segurava a Lanterna de Cabeça, que acendia junto com a tela. | Pixel × Gancho ✗; Pixel × Mochila ✗; Pixel × Cantil ✗; Pixel × Lanterna ✓ | O Pixel segurava a Lanterna de Cabeça. |
| 6 | 🎁 Objeto | Pelos pretos na alça da Mochila de Lona: o Nox a segurava. | Nox × Gancho ✗; Nox × Cantil ✗; Nox × Mochila ✓ | O Nox segurava a Mochila de Lona. |
| 7 | 🎁 Objeto | A Mel não segurava o Cantil Amassado: estava ocupada tendo uma ideia. | Mel × Cantil ✗ | A Mel segurava o Gancho de Escalada: na grade Objeto, era a única opção que sobrava para ela. A Maya segurava o Cantil Amassado: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Pixel — Lado da Caverna (casa D2), Lanterna de Cabeça · Maya — Lado do Penhasco (casa B1), Cantil Amassado · Nox — Lado do Penhasco (casa A1), Mochila de Lona · Mel — Lado da Caverna (casa C2), Gancho de Escalada

## tango-56 · As cabines do teleférico

Tango · capítulo 6 · Avançado · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Vi contava as estrelas com a Corda de Resgate enrolada no braço. | Vi × Mapa ✗; Vi × Óculos ✗; Vi × Pote ✗; Vi × Corda ✓ | A Vi segurava a Corda de Resgate. |
| 2 | ↕️ Coluna | A janela da coluna B ficou embaçada: era a Vi, colada nela. | Vi × A ✗; Vi × C ✗; Vi × D ✗; Vi × B ✓ | A Vi estava na coluna B. A Vi estava no lado do Cristal (Cabine de Subida): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | 💠 Lado | O Prisma brilhava na Cabine de Subida, a do Cristal. | Prisma × Orbe ✗; Prisma × Cristal ✓ | O Prisma estava no lado do Cristal (Cabine de Subida). A Alva estava no lado do Orbe (Cabine de Descida): na grade Lado, era a única opção que sobrava para ela. O Cogu estava no lado do Orbe (Cabine de Descida): na grade Lado, era a única opção que sobrava para ele. |
| 4 | ↕️ Coluna | O Prisma não estava na coluna A: lá não bate luz para ele brilhar. | Prisma × A ✗ | O Prisma estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | ↕️ Coluna | A Alva não sentou na coluna A: a janela ali é baixa demais. | Alva × A ✗ | A Alva estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. O Cogu estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | A Alva abriu os olhos só para pôr os Óculos de Neblina. | Alva × Mapa ✗; Alva × Pote ✗; Alva × Óculos ✓ | A Alva segurava o Óculos de Neblina. |
| 7 | 🎁 Objeto | O Cogu não segurava o Mapa das Montanhas: tímido, nem pediu para ver. | Cogu × Mapa ✗ | O Cogu segurava a Pote de Sopa Quente: na grade Objeto, era a única opção que sobrava para ele. O Prisma segurava o Mapa das Montanhas: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Alva — Cabine de Descida (casa D2), Óculos de Neblina · Cogu — Cabine de Descida (casa A2), Pote de Sopa Quente · Prisma — Cabine de Subida (casa C1), Mapa das Montanhas · Vi — Cabine de Subida (casa B1), Corda de Resgate

## tango-62 · O festival de patinação no lago

Tango · capítulo 7 · Avançado · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Faísca passou voando com o Cachecol Listrado tremulando atrás dela. | Faísca × Caneca ✗; Faísca × Fita ✗; Faísca × Guizo ✗; Faísca × Cachecol ✓ | A Faísca segurava o Cachecol Listrado. |
| 2 | ↕️ Coluna | Um capuz vermelho deslizou pela coluna B: era o Rubro. | Rubro × A ✗; Rubro × C ✗; Rubro × D ✗; Rubro × B ✓ | O Rubro estava na coluna B. O Rubro estava no lado do Orbe (Margem Sombreada): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | 🎁 Objeto | O Nimbo mudava de cor a cada toque do Guizo da Aurora que segurava. | Nimbo × Caneca ✗; Nimbo × Fita ✗; Nimbo × Guizo ✓ | O Nimbo segurava o Guizo da Aurora. |
| 4 | 💠 Lado | O Chip patinou do mesmo lado do Rubro, gravando tudo na memória. | Chip × Cristal ✗; Chip × Orbe ✓ | O Chip estava no lado do Orbe (Margem Sombreada). A Faísca estava no lado do Cristal (Margem Iluminada): na grade Lado, era a única opção que sobrava para ela. O Nimbo estava no lado do Cristal (Margem Iluminada): na grade Lado, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Rubro não segurava a Caneca de Chocolate: o capuz dele ficou limpinho. | Rubro × Caneca ✗ | O Rubro segurava a Fita de Patinação: na grade Objeto, era a única opção que sobrava para ele. O Chip segurava o Caneca de Chocolate: na grade Objeto, era a única opção que sobrava para ele. |
| 6 | ↕️ Coluna | A Faísca não parou na coluna C: ela nunca anda devagar. | Faísca × C ✗ | O Nimbo estava na coluna C: na grade Coluna, só ele ainda podia ficar com isso. |
| 7 | ↕️ Coluna | Pela coluna A a Faísca nem passou: odeia a beirada do lago. | Faísca × A ✗ | A Faísca estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. O Chip estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Faísca — Margem Iluminada (casa D1), Cachecol Listrado · Rubro — Margem Sombreada (casa B2), Fita de Patinação · Chip — Margem Sombreada (casa A2), Caneca de Chocolate · Nimbo — Margem Iluminada (casa C1), Guizo da Aurora

## tango-67 · A exposição de esculturas de gelo

Tango · capítulo 7 · Avançado · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Pegadas de lobo congeladas na coluna B: o Gelo esteve ali. | Gelo × A ✗; Gelo × C ✗; Gelo × D ✗; Gelo × B ✓ | O Gelo estava na coluna B. |
| 2 | ↕️ Coluna | A Luna escutava o silêncio do gelo na coluna D. | Luna × A ✗; Luna × C ✗; Luna × D ✓ | A Luna estava na coluna D. A Luna estava no lado do Orbe (Galeria Sul): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | ↕️ Coluna | A sombra do Pingo não passou pela coluna A. | Pingo × A ✗ | O Pingo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Nico estava no lado do Cristal (Galeria Norte): na grade Lado, era a única opção que sobrava para ele. O Nico estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 💠 Lado | O Gelo estava no lado oposto ao do Nico: um não via o outro. | Gelo × Cristal ✗; Gelo × Orbe ✓ | O Gelo estava no lado do Orbe (Galeria Sul). O Pingo estava no lado do Cristal (Galeria Norte): na grade Lado, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | Raspas de gelo no focinho do Gelo: ele segurava o Serrote Cristalino. | Gelo × Lanterna ✗; Gelo × Luvas ✗; Gelo × Catálogo ✗; Gelo × Serrote ✓ | O Gelo segurava a Serrote Cristalino. |
| 6 | 🎁 Objeto | O Nico ajustava os óculos à luz da Lanterna Colorida que segurava. | Nico × Luvas ✗; Nico × Catálogo ✗; Nico × Lanterna ✓ | O Nico segurava a Lanterna Colorida. |
| 7 | 🎁 Objeto | A Luna não segurava o Catálogo da Exposição: preferia ouvir a ler. | Luna × Catálogo ✗ | A Luna segurava a Luvas Térmicas: na grade Objeto, era a única opção que sobrava para ela. O Pingo segurava o Catálogo da Exposição: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Gelo — Galeria Sul (casa B2), Serrote Cristalino · Nico — Galeria Norte (casa A1), Lanterna Colorida · Pingo — Galeria Norte (casa C1), Catálogo da Exposição · Luna — Galeria Sul (casa D2), Luvas Térmicas

## tango-74 · A escadaria das duas estátuas

Tango · capítulo 8 · Avançado · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 💠 Lado | O triângulo de luz da Gema brilhava no Lado da Lua, o lado do Orbe. | Gema × Cristal ✗; Gema × Orbe ✓ | A Gema estava no lado do Orbe (Lado da Lua). |
| 2 | 💠 Lado | O Eco estava do mesmo lado da Gema, dançando nos degraus. | Eco × Cristal ✗; Eco × Orbe ✓ | O Eco estava no lado do Orbe (Lado da Lua). O Floco estava no lado do Cristal (Lado do Sol): na grade Lado, era a única opção que sobrava para ele. O Byte estava no lado do Cristal (Lado do Sol): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | O Floco não estava na coluna A: a pedra ali esquenta demais. | Floco × A ✗ | O Floco estava na coluna C: na grade Coluna, só ele ainda podia ficar com isso. O Byte estava na coluna A: na grade Coluna, só ele ainda podia ficar com isso. |
| 4 | ↕️ Coluna | A Gema não subiu pela coluna B. | Gema × B ✗ | A Gema estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. O Eco estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O cristal do Floco pingava de calor: ele segurava a Tocha de Resina. | Floco × Câmera ✗; Floco × Trena ✗; Floco × Diário ✗; Floco × Tocha ✓ | O Floco segurava a Tocha de Resina. |
| 6 | 🎁 Objeto | A Gema anotava cada degrau no Diário de Campo. | Gema × Câmera ✗; Gema × Trena ✗; Gema × Diário ✓ | A Gema segurava o Diário de Campo. |
| 7 | 🎁 Objeto | O Byte não segurava a Trena de Arqueólogo: estava cuidando de uma plantinha na escada. | Byte × Trena ✗ | O Byte segurava a Câmera de Fole: na grade Objeto, era a única opção que sobrava para ele. O Eco segurava a Trena de Arqueólogo: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Eco — Lado da Lua (casa B2), Trena de Arqueólogo · Floco — Lado do Sol (casa C1), Tocha de Resina · Gema — Lado da Lua (casa D2), Diário de Campo · Byte — Lado do Sol (casa A1), Câmera de Fole

## tango-78 · A restauração do aqueduto

Tango · capítulo 8 · Avançado · Rastro dos objetos · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 💠 Lado | O Theo almoçou no Arco de Baixo, o lado do Orbe. | Theo × Cristal ✗; Theo × Orbe ✓ | O Theo estava no lado do Orbe (Arco de Baixo). |
| 2 | 💠 Lado | A Pipa estava no lado oposto ao do Theo, de olho em tudo. | Pipa × Orbe ✗; Pipa × Cristal ✓ | A Pipa estava no lado do Cristal (Arco de Cima). |
| 3 | ↕️ Coluna | O Zen descansava sem pressa na coluna B. | Zen × A ✗; Zen × C ✗; Zen × D ✗; Zen × B ✓ | O Zen estava na coluna B. O Rocha estava no lado do Orbe (Arco de Baixo): na grade Lado, era a única opção que sobrava para ele. A Pipa estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. O Zen estava no lado do Cristal (Arco de Cima): na grade Lado, era a única opção que sobrava para ele. |
| 4 | ↕️ Coluna | O Rocha não estava na coluna C: a betoneira ocupa quase tudo ali. | Rocha × C ✗ | O Rocha estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Theo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | A Pipa estudava a Planta do Aqueduto com os óculos de aventura. | Pipa × Nível ✗; Pipa × Colher ✗; Pipa × Capacete ✗; Pipa × Planta ✓ | A Pipa segurava a Planta do Aqueduto. |
| 6 | 🎁 Objeto | Massa fresca na mão do Zen: ele segurava a Colher de Pedreiro. | Zen × Nível ✗; Zen × Capacete ✗; Zen × Colher ✓ | O Zen segurava a Colher de Pedreiro. |
| 7 | 🎁 Objeto | O Rocha não segurava o Nível de Bolha: para ele, tudo já está reto. | Rocha × Nível ✗ | O Rocha segurava o Capacete Amarelo: na grade Objeto, era a única opção que sobrava para ele. O Theo segurava o Nível de Bolha: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Rocha — Arco de Baixo (casa A2), Capacete Amarelo · Zen — Arco de Cima (casa B1), Colher de Pedreiro · Theo — Arco de Baixo (casa C2), Nível de Bolha · Pipa — Arco de Cima (casa D1), Planta do Aqueduto

## tango-83 · O trem que atravessa as eras

Tango · capítulo 9 · Mestre · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O piso da coluna B rachou com o peso do Quartzo. | Quartzo × A ✗; Quartzo × C ✗; Quartzo × D ✗; Quartzo × B ✓ | O Quartzo estava na coluna B. O Quartzo estava no lado do Cristal (Janela do Passado): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 💠 Lado | A Flor sentou do mesmo lado do Quartzo, para ver a mesma paisagem. | Flor × Orbe ✗; Flor × Cristal ✓ | A Flor estava no lado do Cristal (Janela do Passado). O Musgo estava no lado do Orbe (Janela do Futuro): na grade Lado, era a única opção que sobrava para ele. O Drako estava no lado do Orbe (Janela do Futuro): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | A Flor não estava na coluna A: lá a janela não abre. | Flor × A ✗ | A Flor estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | O Drako não estava na coluna A: ali o banco é pequeno para um dragão. | Drako × A ✗ | O Drako estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Musgo estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Musgo segurava o Fóssil de Trilobita, achado num atalho do passado. | Musgo × Bilhete ✗; Musgo × Relógio ✗; Musgo × Disquete ✗; Musgo × Fóssil ✓ | O Musgo segurava o Fóssil de Trilobita. |
| 6 | 🎁 Objeto | O Quartzo guardava o Bilhete Dourado como guarda as regiões: sem soltar. | Quartzo × Relógio ✗; Quartzo × Disquete ✗; Quartzo × Bilhete ✓ | O Quartzo segurava o Bilhete Dourado. |
| 7 | 🎁 Objeto | A Flor não segurava o Relógio de Corrente: perdeu a noção do tempo. | Flor × Relógio ✗ | A Flor segurava o Disquete Antigo: na grade Objeto, era a única opção que sobrava para ela. O Drako segurava o Relógio de Corrente: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Musgo — Janela do Futuro (casa A2), Fóssil de Trilobita · Drako — Janela do Futuro (casa C2), Relógio de Corrente · Quartzo — Janela do Passado (casa B1), Bilhete Dourado · Flor — Janela do Passado (casa D1), Disquete Antigo

## tango-88 · O corredor das duas épocas

Tango · capítulo 9 · Mestre · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A Íris lia três placas ao mesmo tempo na coluna D. | Íris × A ✗; Íris × B ✗; Íris × C ✗; Íris × D ✓ | A Íris estava na coluna D. |
| 2 | ↕️ Coluna | O brilho do Cubo refletiu na vitrine da coluna A. | Cubo × B ✗; Cubo × C ✗; Cubo × A ✓ | O Cubo estava na coluna A. |
| 3 | ↕️ Coluna | O Leo não estava na coluna B: o foguete tapava a vista. | Leo × B ✗ | O Leo estava no lado do Cristal (Lado Antigo): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Leo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Umbra estava no lado do Orbe (Lado Moderno): na grade Lado, era a única opção que sobrava para ele. O Umbra estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 💠 Lado | A Íris estava no lado oposto ao do Umbra, um de frente para o outro. | Íris × Orbe ✗; Íris × Cristal ✓ | A Íris estava no lado do Cristal (Lado Antigo). O Cubo estava no lado do Orbe (Lado Moderno): na grade Lado, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Umbra girava o Disco Voador de Brinquedo na ponta da garra. | Umbra × Candeeiro ✗; Umbra × Gramofone ✗; Umbra × Tablet ✗; Umbra × Disco ✓ | O Umbra segurava o Disco Voador de Brinquedo. |
| 6 | 🎁 Objeto | Os dedos da Íris deslizavam no Tablet do Museu. | Íris × Candeeiro ✗; Íris × Gramofone ✗; Íris × Tablet ✓ | A Íris segurava o Tablet do Museu. |
| 7 | 🎁 Objeto | O Leo não segurava o Candeeiro de Barro: tinha um palpite melhor nas mãos. | Leo × Candeeiro ✗ | O Leo segurava o Gramofone de Corneta: na grade Objeto, era a única opção que sobrava para ele. O Cubo segurava a Candeeiro de Barro: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Íris — Lado Antigo (casa D1), Tablet do Museu · Umbra — Lado Moderno (casa B2), Disco Voador de Brinquedo · Cubo — Lado Moderno (casa A2), Candeeiro de Barro · Leo — Lado Antigo (casa C1), Gramofone de Corneta

## tango-93 · O conselho das bancadas

Tango · capítulo 10 · Mestre · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A risada da Neve ecoava na coluna C. | Neve × A ✗; Neve × B ✗; Neve × D ✗; Neve × C ✓ | A Neve estava na coluna C. A Neve estava no lado do Cristal (Bancada da Luz): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 💠 Lado | A Kika sentou na Bancada da Luz, o lado do Cristal. | Kika × Orbe ✗; Kika × Cristal ✓ | A Kika estava no lado do Cristal (Bancada da Luz). O Vulto estava no lado do Orbe (Bancada da Sombra): na grade Lado, era a única opção que sobrava para ele. O Dante estava no lado do Orbe (Bancada da Sombra): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | A Kika não estava na coluna D: chiclete é proibido ali. | Kika × D ✗ | A Kika estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | O Dante não sentou na coluna D: ali ninguém escuta histórias. | Dante × D ✗ | O Dante estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Vulto estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Dante segurava o Selo de Água e contava a história de cada gota. | Dante × Selo de Fogo ✗; Dante × Selo de Vento ✗; Dante × Selo de Terra ✗; Dante × Selo de Água ✓ | O Dante segurava o Selo de Água. |
| 6 | 🎁 Objeto | Terra seca nas luvas do Vulto: ele segurava o Selo de Terra. | Vulto × Selo de Fogo ✗; Vulto × Selo de Vento ✗; Vulto × Selo de Terra ✓ | O Vulto segurava o Selo de Terra. |
| 7 | 🎁 Objeto | A Kika não segurava o Selo de Vento: o chiclete teria voado. | Kika × Selo de Vento ✗ | A Kika segurava o Selo de Fogo: na grade Objeto, era a única opção que sobrava para ela. A Neve segurava o Selo de Vento: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Vulto — Bancada da Sombra (casa D2), Selo de Terra · Kika — Bancada da Luz (casa A1), Selo de Fogo · Dante — Bancada da Sombra (casa B2), Selo de Água · Neve — Bancada da Luz (casa C1), Selo de Vento

## tango-97 · A mesa longa do brinde final

Tango · capítulo 10 · Mestre · Equilíbrio do Cristal e do Orbe · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A Lyra ouvia as constelações na ponta da coluna A. | Lyra × B ✗; Lyra × C ✗; Lyra × D ✗; Lyra × A ✓ | A Lyra estava na coluna A. A Lyra estava no lado do Orbe (Lado da Rainha): o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 2 | 💠 Lado | A Jade sentou do mesmo lado da Lyra, para dividir o fone. | Jade × Cristal ✗; Jade × Orbe ✓ | A Jade estava no lado do Orbe (Lado da Rainha). O Orbi estava no lado do Cristal (Lado do Rei): na grade Lado, era a única opção que sobrava para ele. O Astro estava no lado do Cristal (Lado do Rei): na grade Lado, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | A Jade não estava na coluna D: lá o vento da janela embaça os óculos. | Jade × D ✗ | A Jade estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | ↕️ Coluna | A luz do Orbi não brilhou na coluna C. | Orbi × C ✗ | O Orbi estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Astro estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Orbi segurava o Pergaminho do Brinde, ensaiando baixinho. | Orbi × Taça ✗; Orbi × Guirlanda ✗; Orbi × Bandeja ✗; Orbi × Pergaminho ✓ | O Orbi segurava o Pergaminho do Brinde. |
| 6 | 🎁 Objeto | Açúcar nos óculos de aviadora da Jade: ela segurava a Bandeja de Doces. | Jade × Taça ✗; Jade × Guirlanda ✗; Jade × Bandeja ✓ | A Jade segurava a Bandeja de Doces. |
| 7 | 🎁 Objeto | O Astro não segurava a Taça de Vidro Soprado: robô e vidro não combinam. | Astro × Taça ✗ | O Astro segurava a Guirlanda de Flores: na grade Objeto, era a única opção que sobrava para ele. A Lyra segurava a Taça de Vidro Soprado: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Lyra — Lado da Rainha (casa A2), Taça de Vidro Soprado · Orbi — Lado do Rei (casa D1), Pergaminho do Brinde · Jade — Lado da Rainha (casa B2), Bandeja de Doces · Astro — Lado do Rei (casa C1), Guirlanda de Flores

## patches-03 · A faxina do castelo flutuante

Patches · capítulo 1 · Iniciante · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | Pó de livro nos óculos de aventura: a Pipa estava na Biblioteca. | Pipa × Salão do Trono ✗; Pipa × Torre do Sino ✗; Pipa × Cozinha das Nuvens ✗; Pipa × Biblioteca ✓ | A Pipa estava na Biblioteca. |
| 2 | 🏛️ Cômodo | A Nina esfregou um cômodo de 3 casas, de olhos fechados. | Nina × Salão do Trono ✗; Nina × Cozinha das Nuvens ✗; Nina × Torre do Sino ✓ | A Nina estava na Torre do Sino. |
| 3 | 🏛️ Cômodo | A Marina equilibrava baldes num cômodo de 4 casas. | Marina × Salão do Trono ✗; Marina × Cozinha das Nuvens ✓ | A Marina estava na Cozinha das Nuvens. O Byte estava no Salão do Trono: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | A Marina segurava o Balde de Espuma sem derramar uma gota. | Marina × Espanador ✗; Marina × Vassoura ✗; Marina × Esponja ✗; Marina × Balde ✓ | A Marina segurava o Balde de Espuma. |
| 5 | 🎁 Objeto | O Byte segurava a Vassoura Voadora, que tentava escapar das mãos dele. | Byte × Espanador ✗; Byte × Esponja ✗; Byte × Vassoura ✓ | O Byte segurava a Vassoura Voadora. |
| 6 | 🎁 Objeto | Bolhas de sabão nos retalhos da Nina: ela segurava a Esponja Mágica. | Nina × Espanador ✗; Nina × Esponja ✓ | A Nina segurava a Esponja Mágica. A Pipa segurava o Espanador de Penas: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Marina — Cozinha das Nuvens (cômodo), Balde de Espuma · Byte — Salão do Trono (cômodo), Vassoura Voadora · Pipa — Biblioteca (cômodo), Espanador de Penas · Nina — Torre do Sino (cômodo), Esponja Mágica

## patches-07 · O hotel flutuante

Patches · capítulo 1 · Iniciante · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Nico ajustou os óculos e conferiu o número na Chave Dourada que segurava. | Nico × Bolo ✗; Nico × Mala ✗; Nico × Guarda-Chuva ✗; Nico × Chave ✓ | O Nico segurava a Chave Dourada. |
| 2 | 🏛️ Cômodo | A Íris lia três livros ao vento: ela estava no Terraço. | Íris × Restaurante ✗; Íris × Quarto Nimbus ✗; Íris × Recepção ✗; Íris × Terraço ✓ | A Íris estava no Terraço. |
| 3 | 🏛️ Cômodo | A sombra do Pingo apareceu entre as mesas do Restaurante. | Pingo × Quarto Nimbus ✗; Pingo × Recepção ✗; Pingo × Restaurante ✓ | O Pingo estava no Restaurante. |
| 4 | 🎁 Objeto | O Pingo segurava a Mala de Rodinhas, maior que ele. | Pingo × Bolo ✗; Pingo × Guarda-Chuva ✗; Pingo × Mala ✓ | O Pingo segurava a Mala de Rodinhas. |
| 5 | 🎁 Objeto | O Dante não segurava o Bolo de Boas-Vindas: estava ocupado contando uma história. | Dante × Bolo ✗ | O Dante segurava o Guarda-Chuva de Nuvem: na grade Objeto, era a única opção que sobrava para ele. A Íris segurava o Bolo de Boas-Vindas: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | 🏛️ Cômodo | A voz do Dante ecoava na Recepção. | Dante × Quarto Nimbus ✗; Dante × Recepção ✓ | O Dante estava na Recepção. O Nico estava no Quarto Nimbus: na grade Cômodo, era a única opção que sobrava para ele. |

**Solução:** Dante — Recepção (cômodo), Guarda-Chuva de Nuvem · Pingo — Restaurante (cômodo), Mala de Rodinhas · Nico — Quarto Nimbus (cômodo), Chave Dourada · Íris — Terraço (cômodo), Bolo de Boas-Vindas

## patches-12 · O clube da casa na árvore

Patches · capítulo 2 · Iniciante · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Gema ficou num cômodo pequenininho, de 2 casas. | Gema × Sala de Reunião ✗; Gema × Cozinha ✗; Gema × Esconderijo ✗; Gema × Mirante ✓ | A Gema estava no Mirante. |
| 2 | 🏛️ Cômodo | A música dos fones da Lyra vazava pelo Esconderijo. | Lyra × Sala de Reunião ✗; Lyra × Cozinha ✗; Lyra × Esconderijo ✓ | A Lyra estava no Esconderijo. |
| 3 | 🏛️ Cômodo | Migalhas nos passos de robô: o Astro estava na Cozinha. | Astro × Sala de Reunião ✗; Astro × Cozinha ✓ | O Astro estava na Cozinha. O Kael estava na Sala de Reunião: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O triângulo de luz da Gema refletia na Luneta do Clube. | Gema × Senha ✗; Gema × Lanterna ✗; Gema × Pote ✗; Gema × Luneta ✓ | A Gema segurava a Luneta do Clube. |
| 5 | 🎁 Objeto | O Kael, educado, segurava a Lanterna de Pilha para todos. | Kael × Senha ✗; Kael × Pote ✗; Kael × Lanterna ✓ | O Kael segurava a Lanterna de Pilha. |
| 6 | 🎁 Objeto | A Lyra segurava a Senha Secreta, escrita em notas musicais. | Lyra × Pote ✗; Lyra × Senha ✓ | A Lyra segurava a Senha Secreta. O Astro segurava o Pote de Biscoitos: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Lyra — Esconderijo (cômodo), Senha Secreta · Kael — Sala de Reunião (cômodo), Lanterna de Pilha · Astro — Cozinha (cômodo), Pote de Biscoitos · Gema — Mirante (cômodo), Luneta do Clube

## patches-18 · A toca da família coelho

Patches · capítulo 2 · Iniciante · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | O Leo palpitou que a chuva entraria pelo Túnel de Saída — e ficou lá vigiando. | Leo × Sala da Toca ✗; Leo × Quarto dos Filhotes ✗; Leo × Despensa de Raízes ✗; Leo × Túnel de Saída ✓ | O Leo estava no Túnel de Saída. |
| 2 | 🎁 Objeto | A Flor segurava a Cenoura Gigante, com uma flor amarrada na ponta. | Flor × Almanaque ✗; Flor × Novelo ✗; Flor × Lanterna ✗; Flor × Cenoura ✓ | A Flor segurava a Cenoura Gigante. |
| 3 | 🏛️ Cômodo | O brilho do Prisma iluminou um cômodo de 4 casas. | Prisma × Sala da Toca ✗; Prisma × Quarto dos Filhotes ✗; Prisma × Despensa de Raízes ✓ | O Prisma estava na Despensa de Raízes. |
| 4 | 🏛️ Cômodo | O Pixel ficou num cômodo de 3 casas, com o coração piscando na tela. | Pixel × Sala da Toca ✗; Pixel × Quarto dos Filhotes ✓ | O Pixel estava no Quarto dos Filhotes. A Flor estava na Sala da Toca: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | Fios de lã azul enroscados no Prisma: ele segurava o Novelo de Lã Azul. | Prisma × Almanaque ✗; Prisma × Lanterna ✗; Prisma × Novelo ✓ | O Prisma segurava o Novelo de Lã Azul. |
| 6 | 🎁 Objeto | O Pixel não segurava a Lanterna de Vaga-lume: a tela dele já ilumina. | Pixel × Lanterna ✗ | O Pixel segurava o Almanaque da Chuva: na grade Objeto, era a única opção que sobrava para ele. O Leo segurava a Lanterna de Vaga-lume: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Pixel — Quarto dos Filhotes (cômodo), Almanaque da Chuva · Leo — Túnel de Saída (cômodo), Lanterna de Vaga-lume · Flor — Sala da Toca (cômodo), Cenoura Gigante · Prisma — Despensa de Raízes (cômodo), Novelo de Lã Azul

## patches-24 · A tarde de chuva no barco-casa

Patches · capítulo 3 · Intermediário · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Alva sorria de olhos fechados para a chuva do Convés. | Alva × Proa ✗; Alva × Cabine ✗; Alva × Cozinha ✗; Alva × Convés ✓ | A Alva estava no Convés. |
| 2 | 🏛️ Cômodo | O Kai desenhava mapas num cômodo de 3 casas. | Kai × Cabine ✗; Kai × Cozinha ✗; Kai × Proa ✓ | O Kai estava na Proa. |
| 3 | 🏛️ Cômodo | O Rocha não estava na Cabine: ele não cabe lá dentro. | Rocha × Cabine ✗ | O Rocha estava na Cozinha: na grade Cômodo, era a única opção que sobrava para ele. O Umbra estava na Cabine: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O Umbra segurava a Vara de Pescar com a ponta da cauda. | Umbra × Violão ✗; Umbra × Livro ✗; Umbra × Bolo de Fubá ✗; Umbra × Vara ✓ | O Umbra segurava a Vara de Pescar. |
| 5 | 🎁 Objeto | O Rocha, que fala pouco, deixou o Violão de Bambu falar por ele. | Rocha × Livro ✗; Rocha × Bolo de Fubá ✗; Rocha × Violão ✓ | O Rocha segurava o Violão de Bambu. |
| 6 | 🎁 Objeto | O Kai não segurava o Bolo de Fubá: as mãos estavam sujas de tinta de mapa. | Kai × Bolo de Fubá ✗ | O Kai segurava o Livro de Lendas do Rio: na grade Objeto, era a única opção que sobrava para ele. A Alva segurava o Bolo de Fubá: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Umbra — Cabine (cômodo), Vara de Pescar · Alva — Convés (cômodo), Bolo de Fubá · Rocha — Cozinha (cômodo), Violão de Bambu · Kai — Proa (cômodo), Livro de Lendas do Rio

## patches-27 · A noite de tempestade no farol

Patches · capítulo 3 · Intermediário · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Luna escutava o silêncio num cômodo pequeno, de 2 casas. | Luna × Sala do Rádio ✗; Luna × Cozinha ✗; Luna × Topo do Farol ✗; Luna × Depósito ✓ | A Luna estava no Depósito. |
| 2 | 🎁 Objeto | A Luna segurava a Lanterna de Reserva, ainda zumbindo. | Luna × Barômetro ✗; Luna × Capa Amarela ✗; Luna × Diário ✗; Luna × Lanterna ✓ | A Luna segurava a Lanterna de Reserva. |
| 3 | 🏛️ Cômodo | Um capuz azul foi visto num cômodo de 4 casas: era o Ravi. | Ravi × Sala do Rádio ✗; Ravi × Cozinha ✗; Ravi × Topo do Farol ✓ | O Ravi estava no Topo do Farol. |
| 4 | 🎁 Objeto | O Ravi vestia a Capa Amarela por cima do capuz azul. | Ravi × Barômetro ✗; Ravi × Diário ✗; Ravi × Capa Amarela ✓ | O Ravi segurava a Capa Amarela. |
| 5 | 🏛️ Cômodo | A Estela não estava na Sala do Rádio: o chiado atrapalha as estrelas-brinco. | Estela × Sala do Rádio ✗ | A Estela estava na Cozinha: na grade Cômodo, era a única opção que sobrava para ela. O Zen estava na Sala do Rádio: na grade Cômodo, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Zen escrevia sem pressa no Diário do Farol. | Zen × Barômetro ✗; Zen × Diário ✓ | O Zen segurava o Diário do Farol. A Estela segurava o Barômetro de Mercúrio: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Ravi — Topo do Farol (cômodo), Capa Amarela · Estela — Cozinha (cômodo), Barômetro de Mercúrio · Luna — Depósito (cômodo), Lanterna de Reserva · Zen — Sala do Rádio (cômodo), Diário do Farol

## patches-33 · O observatório dos monges

Patches · capítulo 4 · Intermediário · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Cogu, tímido, espiava o céu pelo Telescópio de Bolso. | Cogu × Sextante ✗; Cogu × Carta ✗; Cogu × Ampulheta ✗; Cogu × Telescópio ✓ | O Cogu segurava o Telescópio de Bolso. |
| 2 | 🏛️ Cômodo | A Lila pulava de alegria num cômodo de 4 casas. | Lila × Cúpula ✗; Lila × Terraço ✗; Lila × Câmara Escura ✗; Lila × Biblioteca dos Astros ✓ | A Lila estava na Biblioteca dos Astros. |
| 3 | 🏛️ Cômodo | Um brilho de cogumelo apareceu na Câmara Escura: era o Cogu. | Cogu × Cúpula ✗; Cogu × Terraço ✗; Cogu × Câmara Escura ✓ | O Cogu estava na Câmara Escura. |
| 4 | 🏛️ Cômodo | O Ritmo marcava o tempo num cômodo de 3 casas. | Ritmo × Cúpula ✗; Ritmo × Terraço ✓ | O Ritmo estava no Terraço. A Kika estava na Cúpula: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Lila marcava cada meteoro na Carta dos Meteoros. | Lila × Sextante ✗; Lila × Ampulheta ✗; Lila × Carta ✓ | A Lila segurava a Carta dos Meteoros. |
| 6 | 🎁 Objeto | A Kika não segurava a Ampulheta dos Monges: ela conta o tempo em bolas de chiclete. | Kika × Ampulheta ✗ | A Kika segurava o Sextante de Latão: na grade Objeto, era a única opção que sobrava para ela. O Ritmo segurava a Ampulheta dos Monges: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Cogu — Câmara Escura (cômodo), Telescópio de Bolso · Kika — Cúpula (cômodo), Sextante de Latão · Ritmo — Terraço (cômodo), Ampulheta dos Monges · Lila — Biblioteca dos Astros (cômodo), Carta dos Meteoros

## patches-36 · A cozinha dos monges estelares

Patches · capítulo 4 · Intermediário · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Jade acendeu a Vela Aromática com o cuidado de quem pilota balões. | Jade × Panela ✗; Jade × Pão de Mel ✗; Jade × Concha ✗; Jade × Vela ✓ | A Jade segurava a Vela Aromática. |
| 2 | 🏛️ Cômodo | O Floco ficou num cômodo de 4 casas, longe do fogo. | Floco × Fogão a Lenha ✗; Floco × Despensa ✗; Floco × Horta de Ervas ✗; Floco × Refeitório ✓ | O Floco estava no Refeitório. |
| 3 | 🏛️ Cômodo | O Chip se enfiou num cômodo pequeno, de 2 casas. | Chip × Fogão a Lenha ✗; Chip × Despensa ✗; Chip × Horta de Ervas ✓ | O Chip estava na Horta de Ervas. |
| 4 | 🏛️ Cômodo | O Gelo não estava no Fogão a Lenha: lobo de cristal não gosta de calor. | Gelo × Fogão a Lenha ✗ | O Gelo estava na Despensa: na grade Cômodo, era a única opção que sobrava para ele. A Jade estava no Fogão a Lenha: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | Mel no cristal azul do Floco: ele segurava o Pão de Mel. | Floco × Panela ✗; Floco × Concha ✗; Floco × Pão de Mel ✓ | O Floco segurava o Pão de Mel. |
| 6 | 🎁 Objeto | O Gelo não segurava a Panela de Barro: o barro esquenta demais. | Gelo × Panela ✗ | O Gelo segurava a Concha de Madeira: na grade Objeto, era a única opção que sobrava para ele. O Chip segurava a Panela de Barro: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Floco — Refeitório (cômodo), Pão de Mel · Gelo — Despensa (cômodo), Concha de Madeira · Chip — Horta de Ervas (cômodo), Panela de Barro · Jade — Fogão a Lenha (cômodo), Vela Aromática

## patches-42 · O palácio de areia do sultãozinho

Patches · capítulo 5 · Intermediário · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | Dois olhos brilhavam lá no alto, na Torre de Vigia: era o Nox. | Nox × Pátio das Fontes ✗; Nox × Salão Dourado ✗; Nox × Sala dos Tapetes ✗; Nox × Torre de Vigia ✓ | O Nox estava na Torre de Vigia. |
| 2 | 🎁 Objeto | Areia nos pelos verdes do Musgo: ele segurava o Molde de Cúpula. | Musgo × Espátula ✗; Musgo × Balde ✗; Musgo × Pincel ✗; Musgo × Molde ✓ | O Musgo segurava o Molde de Cúpula. |
| 3 | 🏛️ Cômodo | O Musgo achou um atalho até o Salão Dourado e ficou lá. | Musgo × Pátio das Fontes ✗; Musgo × Sala dos Tapetes ✗; Musgo × Salão Dourado ✓ | O Musgo estava no Salão Dourado. |
| 4 | 🏛️ Cômodo | A Lis não estava na Sala dos Tapetes: estava sonhando ao ar livre. | Lis × Sala dos Tapetes ✗ | A Lis estava no Pátio das Fontes: na grade Cômodo, era a única opção que sobrava para ela. O Rio estava na Sala dos Tapetes: na grade Cômodo, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Nox segurava a Espátula de Escultor entre as patas. | Nox × Balde ✗; Nox × Pincel ✗; Nox × Espátula ✓ | O Nox segurava a Espátula de Escultor. |
| 6 | 🎁 Objeto | O Rio não segurava o Pincel de Ouro: prefere a água à tinta. | Rio × Pincel ✗ | O Rio segurava o Balde do Oásis: na grade Objeto, era a única opção que sobrava para ele. A Lis segurava o Pincel de Ouro: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Lis — Pátio das Fontes (cômodo), Pincel de Ouro · Rio — Sala dos Tapetes (cômodo), Balde do Oásis · Nox — Torre de Vigia (cômodo), Espátula de Escultor · Musgo — Salão Dourado (cômodo), Molde de Cúpula

## patches-47 · O casamento na tenda grande

Patches · capítulo 5 · Intermediário · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A risada da Mel enchia um cômodo de 4 casas. | Mel × Jardim do Oásis ✗; Mel × Cozinha da Festa ✗; Mel × Tenda das Danças ✗; Mel × Tenda Principal ✓ | A Mel estava na Tenda Principal. |
| 2 | 🎁 Objeto | O Véu Bordado brilhava com a luz do Orbi, que o segurava. | Orbi × Alaúde ✗; Orbi × Bandeja ✗; Orbi × Anel ✗; Orbi × Véu Bordado ✓ | O Orbi segurava o Véu Bordado. |
| 3 | 🎁 Objeto | A Mel segurava a Bandeja de Figos — e provava um a cada risada. | Mel × Alaúde ✗; Mel × Anel ✗; Mel × Bandeja ✓ | A Mel segurava a Bandeja de Figos. |
| 4 | 🏛️ Cômodo | O Davi reparou num detalhe dentro de um cômodo de 2 casas. | Davi × Cozinha da Festa ✗; Davi × Tenda das Danças ✗; Davi × Jardim do Oásis ✓ | O Davi estava no Jardim do Oásis. |
| 5 | 🎁 Objeto | O Drako não segurava o Anel de Noivado: as garras dele são grandes demais. | Drako × Anel ✗ | O Drako segurava o Alaúde: na grade Objeto, era a única opção que sobrava para ele. O Davi segurava o Anel de Noivado: na grade Objeto, era a única opção que sobrava para ele. |
| 6 | 🏛️ Cômodo | O Orbi não estava na Cozinha da Festa: luz demais estraga o fermento. | Orbi × Cozinha da Festa ✗ | O Orbi estava na Tenda das Danças: na grade Cômodo, era a única opção que sobrava para ele. O Drako estava na Cozinha da Festa: na grade Cômodo, era a única opção que sobrava para ele. |

**Solução:** Drako — Cozinha da Festa (cômodo), Alaúde · Mel — Tenda Principal (cômodo), Bandeja de Figos · Orbi — Tenda das Danças (cômodo), Véu Bordado · Davi — Jardim do Oásis (cômodo), Anel de Noivado

## patches-54 · A caverna da dragoa chocadeira

Patches · capítulo 6 · Avançado · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Eco anotava no Caderno à Prova de Fogo, no ritmo da música. | Eco × Termômetro ✗; Eco × Câmera ✗; Eco × Gravador ✗; Eco × Caderno ✓ | O Eco segurava o Caderno à Prova de Fogo. |
| 2 | 🏛️ Cômodo | O Eco ficou num cômodo apertado, de 2 casas. | Eco × Salão dos Ovos ✗; Eco × Túnel Quente ✗; Eco × Lago Subterrâneo ✗; Eco × Galeria de Cristais ✓ | O Eco estava na Galeria de Cristais. |
| 3 | 🎁 Objeto | O Cubo segurava a Câmera Silenciosa sem fazer nenhum clique. | Cubo × Termômetro ✗; Cubo × Gravador ✗; Cubo × Câmera ✓ | O Cubo segurava a Câmera Silenciosa. |
| 4 | 🎁 Objeto | A Neve não segurava o Gravador de Sons: a risada dela estragaria a gravação. | Neve × Gravador ✗ | A Neve segurava o Termômetro de Lava: na grade Objeto, era a única opção que sobrava para ela. A Faísca segurava o Gravador de Sons: na grade Objeto, era a única opção que sobrava para ela. |
| 5 | 🏛️ Cômodo | O brilho do Cubo se refletia na água do Lago Subterrâneo. | Cubo × Salão dos Ovos ✗; Cubo × Túnel Quente ✗; Cubo × Lago Subterrâneo ✓ | O Cubo estava no Lago Subterrâneo. |
| 6 | 🏛️ Cômodo | A Faísca não estava no Túnel Quente: os óculos de voo embaçam lá. | Faísca × Túnel Quente ✗ | A Faísca estava no Salão dos Ovos: na grade Cômodo, era a única opção que sobrava para ela. A Neve estava no Túnel Quente: na grade Cômodo, era a única opção que sobrava para ela. |

**Solução:** Eco — Galeria de Cristais (cômodo), Caderno à Prova de Fogo · Neve — Túnel Quente (cômodo), Termômetro de Lava · Cubo — Lago Subterrâneo (cômodo), Câmera Silenciosa · Faísca — Salão dos Ovos (cômodo), Gravador de Sons

## patches-58 · O chá no castelo do dragão

Patches · capítulo 6 · Avançado · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Maya anotou no caderninho cada corredor do Mapa do Castelo que segurava. | Maya × Espada ✗; Maya × Escudo ✗; Maya × Bolo ✗; Maya × Mapa ✓ | A Maya segurava o Mapa do Castelo. |
| 2 | 🏛️ Cômodo | A Maya ficou num cômodo de 3 casas, escrevendo sem parar. | Maya × Torre do Dragão ✗; Maya × Salão Principal ✗; Maya × Calabouço ✗; Maya × Cozinha ✓ | A Maya estava na Cozinha. |
| 3 | 🎁 Objeto | Chocolate no cabelo prateado do Ayo: ele segurava o Bolo de Chocolate. | Ayo × Espada ✗; Ayo × Escudo ✗; Ayo × Bolo ✓ | O Ayo segurava o Bolo de Chocolate. |
| 4 | 🎁 Objeto | O Vulto não segurava a Espada de Madeira. | Vulto × Espada ✗ | O Vulto segurava o Escudo de Lata: na grade Objeto, era a única opção que sobrava para ele. A Lina segurava a Espada de Madeira: na grade Objeto, era a única opção que sobrava para ela. |
| 5 | 🏛️ Cômodo | A cantoria da Lina ecoava num cômodo enorme, de 9 casas. | Lina × Torre do Dragão ✗; Lina × Calabouço ✗; Lina × Salão Principal ✓ | A Lina estava no Salão Principal. |
| 6 | 🏛️ Cômodo | O Vulto não estava na Torre do Dragão. | Vulto × Torre do Dragão ✗ | O Vulto estava no Calabouço: na grade Cômodo, era a única opção que sobrava para ele. O Ayo estava na Torre do Dragão: na grade Cômodo, era a única opção que sobrava para ele. |

**Solução:** Maya — Cozinha (cômodo), Mapa do Castelo · Ayo — Torre do Dragão (cômodo), Bolo de Chocolate · Lina — Salão Principal (cômodo), Espada de Madeira · Vulto — Calabouço (cômodo), Escudo de Lata

## patches-63 · O palácio de gelo da rainha

Patches · capítulo 7 · Avançado · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | As folhinhas do Broto caíram pelos degraus de um cômodo enorme, de 8 casas. | Broto × Jardim de Gelo ✗; Broto × Sala do Trono ✗; Broto × Salão das Auroras ✗; Broto × Escadaria ✓ | O Broto estava na Escadaria. |
| 2 | 🏛️ Cômodo | O olhar dourado da Sol refletia as luzes do Salão das Auroras. | Sol × Jardim de Gelo ✗; Sol × Sala do Trono ✗; Sol × Salão das Auroras ✓ | A Sol estava no Salão das Auroras. |
| 3 | 🏛️ Cômodo | O Theo não estava no Jardim de Gelo: ele lembra que escorregou lá no ano passado. | Theo × Jardim de Gelo ✗ | O Theo estava na Sala do Trono: na grade Cômodo, era a única opção que sobrava para ele. A Cris estava no Jardim de Gelo: na grade Cômodo, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | O Cristal de Neve Eterno brilhava azul nas patas da Cris. | Cris × Espelho ✗; Cris × Coroa ✗; Cris × Taça Gelada ✗; Cris × Cristal ✓ | A Cris segurava o Cristal de Neve Eterno. |
| 5 | 🎁 Objeto | O Broto segurava a Taça Gelada, esperando crescer com o suco. | Broto × Espelho ✗; Broto × Coroa ✗; Broto × Taça Gelada ✓ | O Broto segurava a Taça Gelada. |
| 6 | 🎁 Objeto | O Theo não segurava a Coroa de Neve: estava ocupado sorrindo para o espelho. | Theo × Coroa ✗ | O Theo segurava o Espelho de Gelo: na grade Objeto, era a única opção que sobrava para ele. A Sol segurava a Coroa de Neve: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Broto — Escadaria (cômodo), Taça Gelada · Sol — Salão das Auroras (cômodo), Coroa de Neve · Cris — Jardim de Gelo (cômodo), Cristal de Neve Eterno · Theo — Sala do Trono (cômodo), Espelho de Gelo

## patches-68 · O viveiro que brilha no escuro

Patches · capítulo 7 · Avançado · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | O piso de um cômodo de 8 casas rachou com o peso do Quartzo. | Quartzo × Sementeira ✗; Quartzo × Ala dos Cactos ✗; Quartzo × Corredor de Vidro ✗; Quartzo × Ala das Orquídeas ✓ | O Quartzo estava na Ala das Orquídeas. |
| 2 | 🎁 Objeto | A Vi aparava espinhos com a Tesourinha de Cacto. | Vi × Regador ✗; Vi × Semente ✗; Vi × Lupa ✗; Vi × Tesourinha ✓ | A Vi segurava a Tesourinha de Cacto. |
| 3 | 🏛️ Cômodo | Um nevoeiro fininho cobriu um cômodo de 4 casas: era a Bruma. | Bruma × Ala dos Cactos ✗; Bruma × Corredor de Vidro ✗; Bruma × Sementeira ✓ | A Bruma estava na Sementeira. |
| 4 | 🏛️ Cômodo | A Vi não estava no Corredor de Vidro: o reflexo atrapalha a contagem de estrelas. | Vi × Corredor de Vidro ✗ | A Vi estava na Ala dos Cactos: na grade Cômodo, era a única opção que sobrava para ela. O Rubro estava no Corredor de Vidro: na grade Cômodo, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | Um brilho escapava do capuz do Rubro: ele segurava a Semente de Luz. | Rubro × Regador ✗; Rubro × Lupa ✗; Rubro × Semente ✓ | O Rubro segurava a Semente de Luz. |
| 6 | 🎁 Objeto | A Bruma não segurava o Regador de Prata: ela já molha tudo sozinha. | Bruma × Regador ✗ | A Bruma segurava a Lupa de Botânica: na grade Objeto, era a única opção que sobrava para ela. O Quartzo segurava o Regador de Prata: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Quartzo — Ala das Orquídeas (cômodo), Regador de Prata · Vi — Ala dos Cactos (cômodo), Tesourinha de Cacto · Rubro — Corredor de Vidro (cômodo), Semente de Luz · Bruma — Sementeira (cômodo), Lupa de Botânica

## patches-73 · A biblioteca subterrânea

Patches · capítulo 8 · Avançado · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | O broto do Byte encostou nas prateleiras do Salão dos Rolos. | Byte × Corredor ✗; Byte × Sala de Leitura ✗; Byte × Cripta ✗; Byte × Salão dos Rolos ✓ | O Byte estava no Salão dos Rolos. |
| 2 | 🏛️ Cômodo | Uma luz colorida piscava na Sala de Leitura: era o Nimbo. | Nimbo × Corredor ✗; Nimbo × Cripta ✗; Nimbo × Sala de Leitura ✓ | O Nimbo estava na Sala de Leitura. |
| 3 | 🏛️ Cômodo | A Marina não estava no Corredor: lá nada fica em equilíbrio. | Marina × Corredor ✗ | A Marina estava na Cripta: na grade Cômodo, era a única opção que sobrava para ela. A Pipa estava no Corredor: na grade Cômodo, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | A Pipa examinava o Mapa Antigo com os óculos de aventura. | Pipa × Rolo ✗; Pipa × Tinteiro ✗; Pipa × Chave ✗; Pipa × Mapa Antigo ✓ | A Pipa segurava o Mapa Antigo. |
| 5 | 🎁 Objeto | O Byte segurava a Chave de Pedra, fria como o chão da biblioteca. | Byte × Rolo ✗; Byte × Tinteiro ✗; Byte × Chave ✓ | O Byte segurava a Chave de Pedra. |
| 6 | 🎁 Objeto | A Marina não segurava o Tinteiro de Sépia: não tinha nenhuma mancha nas mãos. | Marina × Tinteiro ✗ | A Marina segurava o Rolo de Papiro: na grade Objeto, era a única opção que sobrava para ela. O Nimbo segurava o Tinteiro de Sépia: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Nimbo — Sala de Leitura (cômodo), Tinteiro de Sépia · Marina — Cripta (cômodo), Rolo de Papiro · Byte — Salão dos Rolos (cômodo), Chave de Pedra · Pipa — Corredor (cômodo), Mapa Antigo

## patches-77 · A casa do mercador de joias

Patches · capítulo 8 · Avançado · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Nico ajustou os óculos para ver a dançarina da Caixinha de Música que segurava. | Nico × Colar ✗; Nico × Lupa ✗; Nico × Moeda ✗; Nico × Caixinha ✓ | O Nico segurava a Caixinha de Música. |
| 2 | 🏛️ Cômodo | O Nico estava no Pátio, ao ar livre. | Nico × Quarto do Mercador ✗; Nico × Oficina ✗; Nico × Loja ✗; Nico × Pátio ✓ | O Nico estava no Pátio. |
| 3 | 🏛️ Cômodo | A voz do Dante ecoava num cômodo enorme, de 8 casas. | Dante × Oficina ✗; Dante × Loja ✗; Dante × Quarto do Mercador ✓ | O Dante estava no Quarto do Mercador. |
| 4 | 🏛️ Cômodo | O Pingo não estava na Oficina: o anel de planeta prende nas ferramentas. | Pingo × Oficina ✗ | O Pingo estava na Loja: na grade Cômodo, era a única opção que sobrava para ele. A Nina estava na Oficina: na grade Cômodo, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Nina remendou o fio do Colar de Âmbar de olhos fechados. | Nina × Lupa ✗; Nina × Moeda ✗; Nina × Colar ✓ | A Nina segurava o Colar de Âmbar. |
| 6 | 🎁 Objeto | O Dante não segurava a Lupa de Joalheiro: ele vê as coisas pelas histórias. | Dante × Lupa ✗ | O Dante segurava a Moeda de Prata Furada: na grade Objeto, era a única opção que sobrava para ele. O Pingo segurava a Lupa de Joalheiro: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Nina — Oficina (cômodo), Colar de Âmbar · Dante — Quarto do Mercador (cômodo), Moeda de Prata Furada · Pingo — Loja (cômodo), Lupa de Joalheiro · Nico — Pátio (cômodo), Caixinha de Música

## patches-82 · A casa das eras

Patches · capítulo 9 · Mestre · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | O Kael pediu licença ao entrar num cômodo enorme, de 8 casas. | Kael × Sótão Pré-Histórico ✗; Kael × Quarto dos Anos 80 ✗; Kael × Cozinha do Futuro ✗; Kael × Sala Medieval ✓ | O Kael estava na Sala Medieval. |
| 2 | 🏛️ Cômodo | A Íris lia três livros num cômodo de 4 casas. | Íris × Sótão Pré-Histórico ✗; Íris × Cozinha do Futuro ✗; Íris × Quarto dos Anos 80 ✓ | A Íris estava no Quarto dos Anos 80. |
| 3 | 🏛️ Cômodo | A Lyra não estava na Cozinha do Futuro: lá a música é só bipe. | Lyra × Cozinha do Futuro ✗ | A Lyra estava no Sótão Pré-Histórico: na grade Cômodo, era a única opção que sobrava para ela. O Astro estava na Cozinha do Futuro: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | A Lyra ouvia o Disco de Vinil girando com o dedo. | Lyra × Lamparina ✗; Lyra × Tablet ✗; Lyra × Pena ✗; Lyra × Disco ✓ | A Lyra segurava o Disco de Vinil. |
| 5 | 🎁 Objeto | O Astro segurava a Lamparina de Pedra, curioso com o fogo antigo. | Astro × Tablet ✗; Astro × Pena ✗; Astro × Lamparina ✓ | O Astro segurava a Lamparina de Pedra. |
| 6 | 🎁 Objeto | A Íris não segurava o Tablet Dobrável: prefere papel. | Íris × Tablet ✗ | A Íris segurava a Pena de Ganso: na grade Objeto, era a única opção que sobrava para ela. O Kael segurava o Tablet Dobrável: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Íris — Quarto dos Anos 80 (cômodo), Pena de Ganso · Lyra — Sótão Pré-Histórico (cômodo), Disco de Vinil · Kael — Sala Medieval (cômodo), Tablet Dobrável · Astro — Cozinha do Futuro (cômodo), Lamparina de Pedra

## patches-86 · A nave que salta entre séculos

Patches · capítulo 9 · Mestre · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Flor marcou com uma flor a página do Atlas das Galáxias que segurava. | Flor × Chave ✗; Flor × Painel ✗; Flor × Capacete ✗; Flor × Atlas ✓ | A Flor segurava o Atlas das Galáxias. |
| 2 | 🎁 Objeto | O Pixel segurava o Capacete Espacial, que embaçava a tela. | Pixel × Chave ✗; Pixel × Painel ✗; Pixel × Capacete ✓ | O Pixel segurava o Capacete Espacial. |
| 3 | 🎁 Objeto | A Gema não segurava o Painel Portátil: o triângulo de luz atrapalha a tela. | Gema × Painel ✗ | A Gema segurava a Chave de Ignição: na grade Objeto, era a única opção que sobrava para ela. O Leo segurava o Painel Portátil: na grade Objeto, era a única opção que sobrava para ele. |
| 4 | 🏛️ Cômodo | O Leo dava palpites de navegação na Ponte de Comando. | Leo × Refeitório ✗; Leo × Cápsula de Fuga ✗; Leo × Casa de Máquinas ✗; Leo × Ponte de Comando ✓ | O Leo estava na Ponte de Comando. |
| 5 | 🏛️ Cômodo | Graxa na flor do cabelo: a Flor estava na Casa de Máquinas. | Flor × Refeitório ✗; Flor × Cápsula de Fuga ✗; Flor × Casa de Máquinas ✓ | A Flor estava na Casa de Máquinas. |
| 6 | 🏛️ Cômodo | A Gema não estava na Cápsula de Fuga: odeia lugares apertados. | Gema × Cápsula de Fuga ✗ | A Gema estava no Refeitório: na grade Cômodo, era a única opção que sobrava para ela. O Pixel estava na Cápsula de Fuga: na grade Cômodo, era a única opção que sobrava para ele. |

**Solução:** Gema — Refeitório (cômodo), Chave de Ignição · Pixel — Cápsula de Fuga (cômodo), Capacete Espacial · Leo — Ponte de Comando (cômodo), Painel Portátil · Flor — Casa de Máquinas (cômodo), Atlas das Galáxias

## patches-94 · A galeria das jornadas

Patches · capítulo 10 · Mestre · Tamanho dos cômodos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Alva sorria de olhos fechados num cômodo enorme, de 8 casas. | Alva × Mirante ✗; Alva × Sala dos Mundos ✗; Alva × Corredor do Infinito ✗; Alva × Sala dos Campeões ✓ | A Alva estava na Sala dos Campeões. |
| 2 | 🏛️ Cômodo | O brilho do Prisma refletia num cômodo de 4 casas. | Prisma × Mirante ✗; Prisma × Corredor do Infinito ✗; Prisma × Sala dos Mundos ✓ | O Prisma estava na Sala dos Mundos. |
| 3 | 🏛️ Cômodo | O Rocha não estava no Corredor do Infinito: é estreito demais para um gigante. | Rocha × Corredor do Infinito ✗ | O Rocha estava no Mirante: na grade Cômodo, era a única opção que sobrava para ele. O Umbra estava no Corredor do Infinito: na grade Cômodo, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O Diamante Lendário mudava de cor junto com o Prisma, que o segurava. | Prisma × Mapa ✗; Prisma × Medalha ✗; Prisma × Dado ✗; Prisma × Diamante ✓ | O Prisma segurava a Diamante Lendário. |
| 5 | 🎁 Objeto | A Alva segurava o Mapa das Jornadas — e sabia de cor cada caminho. | Alva × Medalha ✗; Alva × Dado ✗; Alva × Mapa ✓ | A Alva segurava o Mapa das Jornadas. |
| 6 | 🎁 Objeto | O Umbra não segurava a Medalha do Primeiro Enigma. | Umbra × Medalha ✗ | O Umbra segurava o Dado das Jornadas: na grade Objeto, era a única opção que sobrava para ele. O Rocha segurava a Medalha do Primeiro Enigma: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Prisma — Sala dos Mundos (cômodo), Diamante Lendário · Umbra — Corredor do Infinito (cômodo), Dado das Jornadas · Alva — Sala dos Campeões (cômodo), Mapa das Jornadas · Rocha — Mirante (cômodo), Medalha do Primeiro Enigma

## patches-98 · O ensaio da banda dos campeões

Patches · capítulo 10 · Mestre · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🏛️ Cômodo | A Luna ouvia o silêncio do Estúdio. | Luna × Bastidores ✗; Luna × Camarim ✗; Luna × Palco ✗; Luna × Estúdio ✓ | A Luna estava no Estúdio. |
| 2 | 🎁 Objeto | A Luna lia a Partitura de Encerramento entre uma nota e outra. | Luna × Baquetas ✗; Luna × Palheta ✗; Luna × Microfone ✗; Luna × Partitura ✓ | A Luna segurava a Partitura de Encerramento. |
| 3 | 🎁 Objeto | O Kai batucava num mapa com as Baquetas de Cristal. | Kai × Palheta ✗; Kai × Microfone ✗; Kai × Baquetas ✓ | O Kai segurava a Baquetas de Cristal. |
| 4 | 🎁 Objeto | A Estela não segurava a Palheta Dourada: as unhas dela estavam pintadas de estrela. | Estela × Palheta ✗ | A Estela segurava o Microfone sem Fio: na grade Objeto, era a única opção que sobrava para ela. O Ravi segurava a Palheta Dourada: na grade Objeto, era a única opção que sobrava para ele. |
| 5 | 🏛️ Cômodo | As estrelas-brinco da Estela brilhavam nos Bastidores. | Estela × Camarim ✗; Estela × Palco ✗; Estela × Bastidores ✓ | A Estela estava no Bastidores. |
| 6 | 🏛️ Cômodo | O Ravi não estava no Camarim: espelho demais para quem é discreto. | Ravi × Camarim ✗ | O Ravi estava no Palco: na grade Cômodo, era a única opção que sobrava para ele. O Kai estava no Camarim: na grade Cômodo, era a única opção que sobrava para ele. |

**Solução:** Kai — Camarim (cômodo), Baquetas de Cristal · Ravi — Palco (cômodo), Palheta Dourada · Estela — Bastidores (cômodo), Microfone sem Fio · Luna — Estúdio (cômodo), Partitura de Encerramento

## astros-02 · O jardim das estrelas cadentes

Astros · capítulo 1 · Iniciante · Mapa do céu · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | Pegadas vermelhas cruzavam o Canteiro do Sul: era o Rubro. | Rubro × Caminho de Cristal ✗; Rubro × Recanto das Nuvens ✗; Rubro × Canteiro do Norte ✗; Rubro × Canteiro do Sul ✓ | O Rubro estava no Canteiro do Sul. |
| 2 | 🎁 Objeto | O Nico ajustou os óculos para contar as flores do Cesto de Luz que segurava. | Nico × Pote ✗; Nico × Luva de Seda ✗; Nico × Peneira ✗; Nico × Cesto de Luz ✓ | O Nico segurava o Cesto de Luz. |
| 3 | ↔️ Linha | Um capuz azul foi visto na linha 1: era o Ravi. | Ravi × 2 ✗; Ravi × 3 ✗; Ravi × 4 ✗; Ravi × 1 ✓ | O Ravi estava na linha 1. O Rubro estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Rubro estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | ✨ Região | Os óculos do Nico refletiam o Caminho de Cristal. | Nico × Recanto das Nuvens ✗; Nico × Canteiro do Norte ✗; Nico × Caminho de Cristal ✓ | O Nico estava no Caminho de Cristal. O Nico estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Ravi estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Ravi estava no Recanto das Nuvens: na grade Região, era a única opção que sobrava para ele. A Mel estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Mel estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Mel estava no Canteiro do Norte: na grade Região, era a única opção que sobrava para ela. O Nico estava na linha 3: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | Poeira de estrela no capuz do Rubro: ele segurava a Peneira de Poeira Estelar. | Rubro × Pote ✗; Rubro × Luva de Seda ✗; Rubro × Peneira ✓ | O Rubro segurava a Peneira de Poeira Estelar. |
| 6 | 🎁 Objeto | A Mel colhia flores rindo, com a Luva de Seda na mão. | Mel × Pote ✗; Mel × Luva de Seda ✓ | A Mel segurava a Luva de Seda. O Ravi segurava o Pote de Vidro Estrelado: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Nico — Caminho de Cristal (casa A3), Cesto de Luz · Rubro — Canteiro do Sul (casa D2), Peneira de Poeira Estelar · Ravi — Recanto das Nuvens (casa B1), Pote de Vidro Estrelado · Mel — Canteiro do Norte (casa C4), Luva de Seda

## astros-08 · O piquenique na nuvem quadriculada

Astros · capítulo 1 · Iniciante · Descoberta progressiva · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | O cabelo prateado do Ayo brilhava no Canto da Sombra. | Ayo × Centro ✗; Ayo × Canto Ensolarado ✗; Ayo × Beira da Nuvem ✗; Ayo × Canto da Sombra ✓ | O Ayo estava no Canto da Sombra. |
| 2 | ↕️ Coluna | A Pipa sentou na coluna D, de óculos de aventura. | Pipa × A ✗; Pipa × B ✗; Pipa × C ✗; Pipa × D ✓ | A Pipa estava na coluna D. A Pipa estava no Canto Ensolarado: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | 🎁 Objeto | A Toalha Xadrez ficou úmida: era a Bruma quem a segurava. | Bruma × Jarra ✗; Bruma × Cesta ✗; Bruma × Saco ✗; Bruma × Toalha ✓ | A Bruma segurava a Toalha Xadrez. |
| 4 | ↕️ Coluna | A sombra do Pingo apareceu na coluna B. | Pingo × A ✗; Pingo × C ✗; Pingo × B ✓ | O Pingo estava na coluna B. O Ayo estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Ayo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. A Bruma estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Pingo estava na linha 4: na grade Linha, só ele ainda podia ficar com isso. O Pingo estava na Beira da Nuvem: na grade Região, só ele ainda podia ficar com isso. A Bruma estava na linha 2: na grade Linha, só ela ainda podia ficar com isso. A Bruma estava no Centro: na grade Região, só ela ainda podia ficar com isso. A Pipa estava na linha 3: na grade Linha, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | A Pipa segurava a Jarra de Limonada, investigando o gosto. | Pipa × Cesta ✗; Pipa × Saco ✗; Pipa × Jarra ✓ | A Pipa segurava a Jarra de Limonada. |
| 6 | 🎁 Objeto | O Pingo segurava a Cesta de Piquenique, quase do tamanho dele. | Pingo × Saco ✗; Pingo × Cesta ✓ | O Pingo segurava a Cesta de Piquenique. O Ayo segurava a Saco de Pipoca: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Ayo — Canto da Sombra (casa C1), Saco de Pipoca · Pipa — Canto Ensolarado (casa D3), Jarra de Limonada · Pingo — Beira da Nuvem (casa B4), Cesta de Piquenique · Bruma — Centro (casa A2), Toalha Xadrez

## astros-14 · O tabuleiro das fadas

Astros · capítulo 2 · Iniciante · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | O brilho do Cubo apareceu lá embaixo, na linha 4. | Cubo × 1 ✗; Cubo × 2 ✗; Cubo × 3 ✗; Cubo × 4 ✓ | O Cubo estava na linha 4. |
| 2 | 🎁 Objeto | O Cubo segurava a Varinha de Fada, que piscava junto com ele. | Cubo × Pó de Estrela ✗; Cubo × Noz Mágica ✗; Cubo × Sininho ✗; Cubo × Varinha ✓ | O Cubo segurava a Varinha de Fada. |
| 3 | ✨ Região | O Zen meditava no Centro, sem pressa nenhuma. | Zen × Borda ✗; Zen × Lado do Musgo ✗; Zen × Lado das Pedras ✗; Zen × Centro ✓ | O Zen estava no Centro. |
| 4 | ↕️ Coluna | A Maya anotava as jogadas na coluna B. | Maya × A ✗; Maya × C ✗; Maya × D ✗; Maya × B ✓ | A Maya estava na coluna B. A Maya estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Maya estava na Borda: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Zen estava na linha 3: na grade Linha, era a única opção que sobrava para ele. O Zen estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Kael estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Kael estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Kael estava no Lado do Musgo: na grade Região, era a única opção que sobrava para ele. O Cubo estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Cubo estava no Lado das Pedras: na grade Região, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Kael, educado, pediu licença antes de espalhar o Pó de Estrela que segurava. | Kael × Noz Mágica ✗; Kael × Sininho ✗; Kael × Pó de Estrela ✓ | O Kael segurava o Pó de Estrela. |
| 6 | 🎁 Objeto | A Maya não segurava o Sininho das Fadas: as mãos estavam ocupadas com o caderninho. | Maya × Sininho ✗ | A Maya segurava a Noz Mágica: na grade Objeto, era a única opção que sobrava para ela. O Zen segurava o Sininho das Fadas: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Zen — Centro (casa A3), Sininho das Fadas · Kael — Lado do Musgo (casa D2), Pó de Estrela · Cubo — Lado das Pedras (casa C4), Varinha de Fada · Maya — Borda (casa B1), Noz Mágica

## astros-17 · As abelhas no favo de cristal

Astros · capítulo 2 · Iniciante · Descoberta progressiva · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | As asas do Umbra cobriram um alvéolo da linha 2. | Umbra × 1 ✗; Umbra × 3 ✗; Umbra × 4 ✗; Umbra × 2 ✓ | O Umbra estava na linha 2. |
| 2 | ✨ Região | O olhar dourado da Sol brilhava entre as flores do Jardim de Flores. | Sol × Favo Sul ✗; Sol × Entrada ✗; Sol × Favo Norte ✗; Sol × Jardim de Flores ✓ | A Sol estava no Jardim de Flores. A Sol estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Umbra estava na coluna D: na grade Coluna, só ele ainda podia ficar com isso. O Umbra estava no Favo Sul: na grade Região, só ele ainda podia ficar com isso. |
| 3 | ↕️ Coluna | Dois olhos brilhavam na coluna A: era o Nox. | Nox × B ✗; Nox × C ✗; Nox × A ✓ | O Nox estava na coluna A. O Nox estava na Entrada: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lila estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Lila estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Lila estava no Favo Norte: na grade Região, era a única opção que sobrava para ela. A Sol estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. O Nox estava na linha 3: na grade Linha, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O Umbra segurava o Frasco de Orvalho com a ponta da cauda. | Umbra × Gota ✗; Umbra × Pólen ✗; Umbra × Pétala ✗; Umbra × Frasco ✓ | O Umbra segurava o Frasco de Orvalho. |
| 5 | 🎁 Objeto | A Sol segurava a Pétala de Girassol, da cor do olhar dela. | Sol × Gota ✗; Sol × Pólen ✗; Sol × Pétala ✓ | A Sol segurava a Pétala de Girassol. |
| 6 | 🎁 Objeto | A Lila pulava de alegria com a Gota de Mel Dourado nas patas. | Lila × Pólen ✗; Lila × Gota ✓ | A Lila segurava a Gota de Mel Dourado. O Nox segurava o Pólen Dourado: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Umbra — Favo Sul (casa D2), Frasco de Orvalho · Nox — Entrada (casa A3), Pólen Dourado · Lila — Favo Norte (casa C4), Gota de Mel Dourado · Sol — Jardim de Flores (casa B1), Pétala de Girassol

## astros-23 · O concerto das vitórias-régias

Astros · capítulo 3 · Intermediário · Leitura do cenário · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | A luz do Orbi brilhava na Margem da lagoa. | Orbi × Recanto dos Juncos ✗; Orbi × Centro da Lagoa ✗; Orbi × Canto da Cachoeira ✗; Orbi × Margem ✓ | O Orbi estava na Margem. |
| 2 | 🎁 Objeto | As orelhas de folha do Orbi saíam do Chapéu de Vitória-Régia que ele segurava. | Orbi × Microfone ✗; Orbi × Partitura ✗; Orbi × Lágrima ✗; Orbi × Chapéu ✓ | O Orbi segurava o Chapéu de Vitória-Régia. |
| 3 | 🎁 Objeto | A Neve segurava a Lágrima de Orvalho, rindo do próprio reflexo. | Neve × Microfone ✗; Neve × Partitura ✗; Neve × Lágrima ✓ | A Neve segurava a Lágrima de Orvalho. |
| 4 | ↕️ Coluna | Reflexos azuis da Cris dançavam na coluna C. | Cris × A ✗; Cris × B ✗; Cris × D ✗; Cris × C ✓ | A Cris estava na coluna C. A Cris estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Cris estava no Canto da Cachoeira: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Orbi estava na linha 1: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | A Lyra não segurava a Partitura das Rãs: ela canta de ouvido. | Lyra × Partitura ✗ | A Lyra segurava o Microfone de Junco: na grade Objeto, era a única opção que sobrava para ela. A Cris segurava a Partitura das Rãs: na grade Objeto, era a única opção que sobrava para ela. |
| 6 | ↕️ Coluna | A música dos fones da Lyra vazava pela coluna A. | Lyra × B ✗; Lyra × D ✗; Lyra × A ✓ | A Lyra estava na coluna A. A Lyra estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lyra estava no Centro da Lagoa: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Neve estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Neve estava na coluna D: na grade Coluna, era a única opção que sobrava para ela. A Neve estava no Recanto dos Juncos: na grade Região, era a única opção que sobrava para ela. O Orbi estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |

**Solução:** Neve — Recanto dos Juncos (casa D2), Lágrima de Orvalho · Lyra — Centro da Lagoa (casa A3), Microfone de Junco · Orbi — Margem (casa B1), Chapéu de Vitória-Régia · Cris — Canto da Cachoeira (casa C4), Partitura das Rãs

## astros-26 · A piscina de raias do vale

Astros · capítulo 3 · Intermediário · Mapa do céu · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | A Alva nadava de olhos fechados na Raia Funda. | Alva × Arquibancada ✗; Alva × Borda Norte ✗; Alva × Raia Rasa ✗; Alva × Raia Funda ✓ | A Alva estava na Raia Funda. |
| 2 | ✨ Região | As pegadas molhadas do Kai saíam da Raia Rasa. | Kai × Arquibancada ✗; Kai × Borda Norte ✗; Kai × Raia Rasa ✓ | O Kai estava na Raia Rasa. |
| 3 | ↕️ Coluna | A Vi contava as estrelas do teto na coluna B. | Vi × C ✗; Vi × D ✗; Vi × B ✓ | A Vi estava na coluna B. A Vi estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Vi estava na Arquibancada: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Alva estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. O Rocha estava na Borda Norte: na grade Região, era a única opção que sobrava para ele. O Kai estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Rocha estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Rocha estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Kai estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. A Alva estava na linha 3: na grade Linha, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | O Rocha segurava a Prancha de Isopor — e mesmo assim afundava. | Rocha × Óculos ✗; Rocha × Touca ✗; Rocha × Apito ✗; Rocha × Prancha ✓ | O Rocha segurava a Prancha de Isopor. |
| 5 | 🎁 Objeto | A Vi segurava a Touca de Bolinhas, com uma bolinha para cada estrela. | Vi × Óculos ✗; Vi × Apito ✗; Vi × Touca ✓ | A Vi segurava a Touca de Bolinhas. |
| 6 | 🎁 Objeto | A Alva não segurava o Apito da Treinadora. | Alva × Apito ✗ | A Alva segurava o Óculos de Natação: na grade Objeto, era a única opção que sobrava para ela. O Kai segurava o Apito da Treinadora: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Vi — Arquibancada (casa B1), Touca de Bolinhas · Alva — Raia Funda (casa A3), Óculos de Natação · Rocha — Borda Norte (casa D2), Prancha de Isopor · Kai — Raia Rasa (casa C4), Apito da Treinadora

## astros-32 · O mosaico do solstício

Astros · capítulo 4 · Intermediário · Descoberta progressiva · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | Uma nuvenzinha colorida pairava na coluna B: era o Nimbo. | Nimbo × A ✗; Nimbo × C ✗; Nimbo × D ✗; Nimbo × B ✓ | O Nimbo estava na coluna B. |
| 2 | ✨ Região | O cristal azul do Floco brilhava sobre a Via Láctea. | Floco × Constelação do Leão ✗; Floco × Altar ✗; Floco × Constelação da Ursa ✗; Floco × Via Láctea ✓ | O Floco estava na Via Láctea. O Floco estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | 🎁 Objeto | A fumaça das Varetas de Incenso mudava de cor junto com o Nimbo, que as segurava. | Nimbo × Tridente ✗; Nimbo × Cristal ✗; Nimbo × Livro ✗; Nimbo × Varetas ✓ | O Nimbo segurava o Varetas de Incenso. |
| 4 | 🎁 Objeto | A Lis segurava o Tridente de Prata, sonhando com o mar das estrelas. | Lis × Cristal ✗; Lis × Livro ✗; Lis × Tridente ✓ | A Lis segurava o Tridente de Prata. |
| 5 | ↔️ Linha | Os brincos de estrela da Lis tilintavam na linha 2. | Lis × 1 ✗; Lis × 3 ✗; Lis × 2 ✓ | A Lis estava na linha 2. O Nimbo estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Nimbo estava no Altar: na grade Região, era a única opção que sobrava para ele. O Theo estava na linha 3: na grade Linha, era a única opção que sobrava para ele. A Lis estava na coluna D: na grade Coluna, só ela ainda podia ficar com isso. A Lis estava na Constelação da Ursa: na grade Região, só ela ainda podia ficar com isso. O Theo estava na coluna A: na grade Coluna, só ele ainda podia ficar com isso. O Theo estava na Constelação do Leão: na grade Região, só ele ainda podia ficar com isso. O Floco estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Theo não segurava o Cristal Estelar: estava ocupado lembrando as rezas. | Theo × Cristal ✗ | O Theo segurava o Livro do Solstício: na grade Objeto, era a única opção que sobrava para ele. O Floco segurava o Cristal Estelar: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Floco — Via Láctea (casa C4), Cristal Estelar · Lis — Constelação da Ursa (casa D2), Tridente de Prata · Theo — Constelação do Leão (casa A3), Livro do Solstício · Nimbo — Altar (casa B1), Varetas de Incenso

## astros-37 · O jardim de areia do templo

Astros · capítulo 4 · Intermediário · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | Uma sombra parada na linha 2: era o Vulto. | Vulto × 1 ✗; Vulto × 3 ✗; Vulto × 4 ✗; Vulto × 2 ✓ | O Vulto estava na linha 2. |
| 2 | ↕️ Coluna | Folhinhas do Broto caíram na coluna C. | Broto × A ✗; Broto × B ✗; Broto × D ✗; Broto × C ✓ | O Broto estava na coluna C. |
| 3 | 🎁 Objeto | Tinta preta na capa do Vulto: ele segurava o Pincel de Caligrafia. | Vulto × Ancinho ✗; Vulto × Lanterna ✗; Vulto × Sino ✗; Vulto × Pincel ✓ | O Vulto segurava o Pincel de Caligrafia. |
| 4 | 🎁 Objeto | O Broto segurava a Lanterna de Pedra, quase do tamanho dele. | Broto × Ancinho ✗; Broto × Sino ✗; Broto × Lanterna ✓ | O Broto segurava a Lanterna de Pedra. |
| 5 | ↔️ Linha | O broto do Byte balançava na linha 3. | Byte × 1 ✗; Byte × 4 ✗; Byte × 3 ✓ | O Byte estava na linha 3. A Estela estava na linha 1: na grade Linha, só ela ainda podia ficar com isso. A Estela estava na Areia Ondulada: na grade Região, só ela ainda podia ficar com isso. O Byte estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. O Byte estava no Lago das Carpas: na grade Região, era a única opção que sobrava para ele. O Broto estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Broto estava na Varanda de Bambu: na grade Região, era a única opção que sobrava para ele. O Vulto estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Vulto estava na Ponte: na grade Região, era a única opção que sobrava para ele. A Estela estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. |
| 6 | 🎁 Objeto | A Estela não segurava o Ancinho de Bambu: ela não risca a areia. | Estela × Ancinho ✗ | A Estela segurava o Sino de Vento: na grade Objeto, era a única opção que sobrava para ela. O Byte segurava o Ancinho de Bambu: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Vulto — Ponte (casa D2), Pincel de Caligrafia · Estela — Areia Ondulada (casa B1), Sino de Vento · Byte — Lago das Carpas (casa A3), Ancinho de Bambu · Broto — Varanda de Bambu (casa C4), Lanterna de Pedra

## astros-44 · O eclipse sobre as dunas

Astros · capítulo 5 · Intermediário · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | O Leo palpitou que a melhor vista era do Lote da Duna — e ficou lá. | Leo × Lote das Pedras ✗; Leo × Lote do Oásis ✗; Leo × Lote do Camelo ✗; Leo × Lote da Duna ✓ | O Leo estava no Lote da Duna. |
| 2 | ↔️ Linha | Os passos de robô do Astro pararam na linha 2. | Astro × 1 ✗; Astro × 3 ✗; Astro × 4 ✗; Astro × 2 ✓ | O Astro estava na linha 2. O Astro estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Astro estava no Lote das Pedras: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Leo estava na linha 1: na grade Linha, era a única opção que sobrava para ele. |
| 3 | ↕️ Coluna | A Nina não estava na coluna C: dali a tenda tapa o céu. | Nina × C ✗ | O Eco estava na linha 4: na grade Linha, só ele ainda podia ficar com isso. O Eco estava na coluna C: na grade Coluna, só ele ainda podia ficar com isso. O Eco estava no Lote do Camelo: na grade Região, só ele ainda podia ficar com isso. A Nina estava na coluna A: na grade Coluna, só ela ainda podia ficar com isso. A Nina estava no Lote do Oásis: na grade Região, só ela ainda podia ficar com isso. A Nina estava na linha 3: na grade Linha, era a única opção que sobrava para ela. O Leo estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | A Nina montou de olhos fechados o Telescópio Portátil que segurava. | Nina × Óculos ✗; Nina × Chaleira ✗; Nina × Câmera ✗; Nina × Telescópio ✓ | A Nina segurava o Telescópio Portátil. |
| 5 | 🎁 Objeto | O Eco segurava os Óculos de Eclipse por cima do fone. | Eco × Chaleira ✗; Eco × Câmera ✗; Eco × Óculos ✓ | O Eco segurava o Óculos de Eclipse. |
| 6 | 🎁 Objeto | O Astro não segurava a Câmera com Filtro Solar: ele grava tudo na memória. | Astro × Câmera ✗ | O Astro segurava a Chaleira de Cobre: na grade Objeto, era a única opção que sobrava para ele. O Leo segurava a Câmera com Filtro Solar: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Eco — Lote do Camelo (casa C4), Óculos de Eclipse · Nina — Lote do Oásis (casa A3), Telescópio Portátil · Leo — Lote da Duna (casa B1), Câmera com Filtro Solar · Astro — Lote das Pedras (casa D2), Chaleira de Cobre

## astros-48 · O jogo de damas na areia

Astros · capítulo 5 · Intermediário · Descoberta progressiva · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | A Luna escutava o silêncio na Beira da Tenda. | Luna × Centro ✗; Luna × Lado da Sombra ✗; Luna × Lado do Sol ✗; Luna × Beira da Tenda ✓ | A Luna estava na Beira da Tenda. |
| 2 | ↔️ Linha | Uma bola de chiclete estourou na linha 3: era a Kika. | Kika × 1 ✗; Kika × 2 ✗; Kika × 4 ✗; Kika × 3 ✓ | A Kika estava na linha 3. A Kika estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Kika estava no Lado do Sol: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Luna estava na linha 4: na grade Linha, era a única opção que sobrava para ela. |
| 3 | ↕️ Coluna | A Faísca não estava na coluna C: ela nunca anda devagar, e ali a areia é fofa. | Faísca × C ✗ | A Faísca estava no Centro: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Jade estava na linha 1: na grade Linha, era a única opção que sobrava para ela. A Jade estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Jade estava no Lado da Sombra: na grade Região, era a única opção que sobrava para ela. A Faísca estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Luna estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. A Faísca estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | A Luna segurava a Ampulheta do Árbitro, ouvindo a areia cair. | Luna × Peça ✗; Luna × Copinho ✗; Luna × Lenço ✗; Luna × Ampulheta ✓ | A Luna segurava a Ampulheta do Árbitro. |
| 5 | 🎁 Objeto | A Faísca segurava a Peça de Dama Branca, pronta para a última jogada. | Faísca × Copinho ✗; Faísca × Lenço ✗; Faísca × Peça ✓ | A Faísca segurava a Peça de Dama Branca. |
| 6 | 🎁 Objeto | A Jade bebia do Copinho de Chá de Menta que segurava. | Jade × Lenço ✗; Jade × Copinho ✓ | A Jade segurava a Copinho de Chá de Menta. A Kika segurava o Lenço de Torcida: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Kika — Lado do Sol (casa D3), Lenço de Torcida · Faísca — Centro (casa A2), Peça de Dama Branca · Luna — Beira da Tenda (casa B4), Ampulheta do Árbitro · Jade — Lado da Sombra (casa C1), Copinho de Chá de Menta

## astros-53 · O ninho quadriculado da dragoa

Astros · capítulo 6 · Avançado · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | A cantoria da Lina vinha da coluna B. | Lina × A ✗; Lina × C ✗; Lina × D ✗; Lina × B ✓ | A Lina estava na coluna B. |
| 2 | ✨ Região | O brilho do Prisma iluminava a Trilha de Pedra. | Prisma × Ninho Alto ✗; Prisma × Beira do Penhasco ✗; Prisma × Gruta Quente ✗; Prisma × Trilha de Pedra ✓ | O Prisma estava na Trilha de Pedra. O Prisma estava na linha 3: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Prisma estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lina estava na linha 1: na grade Linha, só ela ainda podia ficar com isso. A Lina estava no Ninho Alto: na grade Região, só ela ainda podia ficar com isso. |
| 3 | ↕️ Coluna | O Chip não estava na coluna D: a memória dele esquenta perto do penhasco. | Chip × D ✗ | O Chip estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Chip estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Chip estava na Gruta Quente: na grade Região, era a única opção que sobrava para ele. O Rio estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Rio estava na Beira do Penhasco: na grade Região, era a única opção que sobrava para ele. O Rio estava na linha 2: na grade Linha, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | A Lina escovava os ovos cantarolando, com a Escova Macia na mão. | Lina × Cobertor ✗; Lina × Termômetro ✗; Lina × Lanterna ✗; Lina × Escova Macia ✓ | A Lina segurava a Escova Macia. |
| 5 | 🎁 Objeto | O Rio media a temperatura com calma no Termômetro de Ovo. | Rio × Cobertor ✗; Rio × Lanterna ✗; Rio × Termômetro ✓ | O Rio segurava o Termômetro de Ovo. |
| 6 | 🎁 Objeto | O Chip não segurava a Lanterna de Cristal: os olhos dele já iluminam. | Chip × Lanterna ✗ | O Chip segurava o Cobertor de Lã: na grade Objeto, era a única opção que sobrava para ele. O Prisma segurava a Lanterna de Cristal: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Lina — Ninho Alto (casa B1), Escova Macia · Chip — Gruta Quente (casa C4), Cobertor de Lã · Rio — Beira do Penhasco (casa D2), Termômetro de Ovo · Prisma — Trilha de Pedra (casa A3), Lanterna de Cristal

## astros-58 · O acampamento no platô

Astros · capítulo 6 · Avançado · Leitura do cenário · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | A voz do Dante contava histórias perto da Fonte. | Dante × Beira do Penhasco ✗; Dante × Platô Norte ✗; Dante × Platô Sul ✗; Dante × Fonte ✓ | O Dante estava na Fonte. |
| 2 | ↔️ Linha | A Marina equilibrava a barraca na linha 2. | Marina × 1 ✗; Marina × 3 ✗; Marina × 4 ✗; Marina × 2 ✓ | A Marina estava na linha 2. A Marina estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Marina estava na Beira do Penhasco: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Dante estava na linha 1: na grade Linha, era a única opção que sobrava para ele. |
| 3 | ✨ Região | A Flor não estava no Platô Sul: lá o vento leva as flores do cabelo. | Flor × Platô Sul ✗ | A Flor estava na linha 4: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Flor estava na coluna B: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Flor estava no Platô Norte: na grade Região, era a única opção que sobrava para ela. O Drako estava na linha 3: na grade Linha, era a única opção que sobrava para ele. O Drako estava na coluna D: na grade Coluna, era a única opção que sobrava para ele. O Drako estava no Platô Sul: na grade Região, era a única opção que sobrava para ele. O Dante estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O Dante segurava a Lanterna de Acampamento para fazer sombras de dragão. | Dante × Barraca ✗; Dante × Saco ✗; Dante × Marmita ✗; Dante × Lanterna ✓ | O Dante segurava a Lanterna de Acampamento. |
| 5 | 🎁 Objeto | O Drako segurava a Barraca Dobrável, que não queria desdobrar. | Drako × Saco ✗; Drako × Marmita ✗; Drako × Barraca ✓ | O Drako segurava a Barraca Dobrável. |
| 6 | 🎁 Objeto | A Marina não segurava o Saco de Dormir: ela nem tinha deitado. | Marina × Saco ✗ | A Marina segurava a Marmita de Sopa: na grade Objeto, era a única opção que sobrava para ela. A Flor segurava o Saco de Dormir: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Flor — Platô Norte (casa B4), Saco de Dormir · Drako — Platô Sul (casa D3), Barraca Dobrável · Dante — Fonte (casa C1), Lanterna de Acampamento · Marina — Beira do Penhasco (casa A2), Marmita de Sopa

## astros-63 · O baile sob a aurora

Astros · capítulo 7 · Avançado · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Pixel acenava com o Lenço Brilhante, com um coração na tela. | Pixel × Leque ✗; Pixel × Máscara ✗; Pixel × Rosa ✗; Pixel × Lenço ✓ | O Pixel segurava o Lenço Brilhante. |
| 2 | ↔️ Linha | O triângulo de luz da Gema brilhou na linha 3. | Gema × 1 ✗; Gema × 2 ✗; Gema × 4 ✗; Gema × 3 ✓ | A Gema estava na linha 3. |
| 3 | ↕️ Coluna | A Íris dançava lendo três livros na coluna A. | Íris × B ✗; Íris × C ✗; Íris × D ✗; Íris × A ✓ | A Íris estava na coluna A. A Íris estava na Pista Central: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 4 | ✨ Região | O Pixel não estava no Canto da Orquestra: a música alta embaralha a tela. | Pixel × Canto da Orquestra ✗ | O Gelo estava na linha 4: na grade Linha, só ele ainda podia ficar com isso. O Gelo estava na coluna B: na grade Coluna, só ele ainda podia ficar com isso. O Gelo estava no Canto da Orquestra: na grade Região, só ele ainda podia ficar com isso. O Pixel estava na Varanda: na grade Região, só ele ainda podia ficar com isso. A Gema estava na coluna D: na grade Coluna, só ela ainda podia ficar com isso. A Gema estava na Mesa de Doces: na grade Região, só ela ainda podia ficar com isso. O Pixel estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Pixel estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. A Íris estava na linha 2: na grade Linha, era a única opção que sobrava para ela. |
| 5 | 🎁 Objeto | Penas no focinho do Gelo: ele segurava o Leque de Plumas. | Gelo × Máscara ✗; Gelo × Rosa ✗; Gelo × Leque ✓ | O Gelo segurava o Leque de Plumas. |
| 6 | 🎁 Objeto | A Gema não segurava a Rosa de Cristal: estava ocupada com os doces. | Gema × Rosa ✗ | A Gema segurava a Máscara de Baile: na grade Objeto, era a única opção que sobrava para ela. A Íris segurava a Rosa de Cristal: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Gelo — Canto da Orquestra (casa B4), Leque de Plumas · Íris — Pista Central (casa A2), Rosa de Cristal · Pixel — Varanda (casa C1), Lenço Brilhante · Gema — Mesa de Doces (casa D3), Máscara de Baile

## astros-67 · A pista de curling da aurora

Astros · capítulo 7 · Avançado · Por exclusão · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↕️ Coluna | O brilho do Cogu apareceu, tímido, na coluna D. | Cogu × A ✗; Cogu × B ✗; Cogu × C ✗; Cogu × D ✓ | O Cogu estava na coluna D. |
| 2 | ↔️ Linha | A batida do Ritmo vinha da linha 4. | Ritmo × 1 ✗; Ritmo × 2 ✗; Ritmo × 3 ✗; Ritmo × 4 ✓ | O Ritmo estava na linha 4. |
| 3 | ↕️ Coluna | O Ritmo marcava o compasso na coluna B. | Ritmo × A ✗; Ritmo × C ✗; Ritmo × B ✓ | O Ritmo estava na coluna B. O Ritmo estava no Banco dos Times: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Cogu estava na linha 3: na grade Linha, só ele ainda podia ficar com isso. O Cogu estava no Corredor de Gelo: na grade Região, só ele ainda podia ficar com isso. |
| 4 | ✨ Região | O Musgo não estava no Alvo: os pelos dele grudam no gelo. | Musgo × Alvo ✗ | O Musgo estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Musgo estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Musgo estava na Arquibancada: na grade Região, era a única opção que sobrava para ele. O Davi estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Davi estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Davi estava no Alvo: na grade Região, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Musgo anotava os pontos no Placar de Giz que segurava. | Musgo × Pedra ✗; Musgo × Vassourinha ✗; Musgo × Cachecol ✗; Musgo × Placar ✓ | O Musgo segurava o Placar de Giz. |
| 6 | 🎁 Objeto | O Davi segurava a Vassourinha de Curling e reparava em cada risquinho do gelo. | Davi × Pedra ✗; Davi × Cachecol ✗; Davi × Vassourinha ✓ | O Davi segurava a Vassourinha de Curling. |
| 7 | 🎁 Objeto | O Cogu não segurava a Pedra de Curling: pesada demais para um cogumelo. | Cogu × Pedra ✗ | O Cogu segurava o Cachecol de Tricô: na grade Objeto, era a única opção que sobrava para ele. O Ritmo segurava a Pedra de Curling: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Davi — Alvo (casa C1), Vassourinha de Curling · Cogu — Corredor de Gelo (casa D3), Cachecol de Tricô · Ritmo — Banco dos Times (casa B4), Pedra de Curling · Musgo — Arquibancada (casa A2), Placar de Giz

## astros-72 · Os quarteirões da cidade em grade

Astros · capítulo 8 · Avançado · Leitura do cenário · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | O Rubro bebia do Cantil de Bronze, escondido no capuz. | Rubro × Mapa ✗; Rubro × Picareta ✗; Rubro × Detector ✗; Rubro × Cantil ✓ | O Rubro segurava o Cantil de Bronze. |
| 2 | ↔️ Linha | O Nico ajustou os óculos na linha 1. | Nico × 2 ✗; Nico × 3 ✗; Nico × 4 ✗; Nico × 1 ✓ | O Nico estava na linha 1. |
| 3 | ✨ Região | Um capuz azul espiava do alto da Muralha: era o Ravi. | Ravi × Bairro dos Templos ✗; Ravi × Mercado ✗; Ravi × Praça das Fontes ✗; Ravi × Muralha ✓ | O Ravi estava na Muralha. O Ravi estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 4 | ↔️ Linha | O chão da linha 4 rachou com o peso do Quartzo. | Quartzo × 2 ✗; Quartzo × 3 ✗; Quartzo × 4 ✓ | O Quartzo estava na linha 4. O Quartzo estava na Praça das Fontes: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 5 | ✨ Região | O Rubro não estava no Mercado: lá todo mundo repara no capuz vermelho. | Rubro × Mercado ✗ | O Rubro estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Rubro estava na coluna A: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Rubro estava no Bairro dos Templos: na grade Região, era a única opção que sobrava para ele. O Nico estava na coluna C: na grade Coluna, era a única opção que sobrava para ele. O Nico estava no Mercado: na grade Região, era a única opção que sobrava para ele. O Ravi estava na linha 3: na grade Linha, era a única opção que sobrava para ele. O Quartzo estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | O Detector de Metal apitava nas mãos do Quartzo. | Quartzo × Mapa ✗; Quartzo × Picareta ✗; Quartzo × Detector ✓ | O Quartzo segurava o Detector de Metal. |
| 7 | 🎁 Objeto | O Nico não segurava o Mapa da Cidade Antiga: estava ocupado cavando. | Nico × Mapa ✗ | O Nico segurava a Picareta de Explorador: na grade Objeto, era a única opção que sobrava para ele. O Ravi segurava o Mapa da Cidade Antiga: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Quartzo — Praça das Fontes (casa B4), Detector de Metal · Nico — Mercado (casa C1), Picareta de Explorador · Rubro — Bairro dos Templos (casa A2), Cantil de Bronze · Ravi — Muralha (casa D3), Mapa da Cidade Antiga

## astros-76 · O festival das lanternas da cidade antiga

Astros · capítulo 8 · Avançado · Por exclusão · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | A risada da Mel ecoou na linha 3. | Mel × 1 ✗; Mel × 2 ✗; Mel × 4 ✗; Mel × 3 ✓ | A Mel estava na linha 3. |
| 2 | 🎁 Objeto | O Pingo segurava a Lanterna Voadora, maior que ele. | Pingo × Vela ✗; Pingo × Fita ✗; Pingo × Sino ✗; Pingo × Lanterna ✓ | O Pingo segurava a Lanterna Voadora. |
| 3 | ↕️ Coluna | A sombra do Pingo apareceu na coluna B. | Pingo × A ✗; Pingo × C ✗; Pingo × D ✗; Pingo × B ✓ | O Pingo estava na coluna B. O Pingo estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Pingo estava na Ponte Antiga: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 4 | ↕️ Coluna | O Ayo não estava na coluna C: o cabelo prateado ofuscaria as lanternas. | Ayo × C ✗ | A Mel estava na coluna A: na grade Coluna, só ela ainda podia ficar com isso. A Mel estava no Mercado: na grade Região, só ela ainda podia ficar com isso. O Ayo estava na linha 2: na grade Linha, só ele ainda podia ficar com isso. O Ayo estava na coluna D: na grade Coluna, só ele ainda podia ficar com isso. O Ayo estava na Praça das Colunas: na grade Região, só ele ainda podia ficar com isso. A Pipa estava na linha 4: na grade Linha, só ela ainda podia ficar com isso. A Pipa estava na coluna C: na grade Coluna, só ela ainda podia ficar com isso. A Pipa estava na Rua do Templo: na grade Região, só ela ainda podia ficar com isso. |
| 5 | 🎁 Objeto | A Pipa amarrou um desejo na Fita de Desejos que segurava. | Pipa × Vela ✗; Pipa × Sino ✗; Pipa × Fita ✓ | A Pipa segurava a Fita de Desejos. |
| 6 | 🎁 Objeto | A Mel não segurava a Vela de Lavanda: tinha uma ideia melhor nas mãos. | Mel × Vela ✗ | A Mel segurava o Sino do Festival: na grade Objeto, era a única opção que sobrava para ela. O Ayo segurava a Vela de Lavanda: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Mel — Mercado (casa A3), Sino do Festival · Ayo — Praça das Colunas (casa D2), Vela de Lavanda · Pipa — Rua do Templo (casa C4), Fita de Desejos · Pingo — Ponte Antiga (casa B1), Lanterna Voadora

## astros-84 · O tabuleiro que congela o tempo

Astros · capítulo 9 · Mestre · Rastro dos objetos · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ↔️ Linha | O cabelo branco do Kael congelou na linha 3. | Kael × 1 ✗; Kael × 2 ✗; Kael × 4 ✗; Kael × 3 ✓ | O Kael estava na linha 3. |
| 2 | 🎁 Objeto | O Cubo segurava o Capacete Robótico, que piscava junto com ele. | Cubo × Escudo ✗; Cubo × Luneta ✗; Cubo × Bateria ✗; Cubo × Capacete ✓ | O Cubo segurava o Capacete Robótico. |
| 3 | ✨ Região | O brilho do Cubo iluminava a Casa do Futuro. | Cubo × Casa do Passado ✗; Cubo × Borda do Tempo ✗; Cubo × Faixa do Presente ✗; Cubo × Casa do Futuro ✓ | O Cubo estava na Casa do Futuro. O Cubo estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Kael estava na Borda do Tempo: na grade Região, era a única opção que sobrava para ele. O Kael estava na coluna A: na grade Coluna, só ele ainda podia ficar com isso. |
| 4 | ↕️ Coluna | A Bruma não estava na coluna B. | Bruma × B ✗ | A Bruma estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Bruma estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Bruma estava na Faixa do Presente: na grade Região, era a única opção que sobrava para ela. O Zen estava na linha 1: na grade Linha, era a única opção que sobrava para ele. O Zen estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Zen estava na Casa do Passado: na grade Região, era a única opção que sobrava para ele. O Cubo estava na linha 2: na grade Linha, era a única opção que sobrava para ele. |
| 5 | 🎁 Objeto | O Zen olhava o horizonte sem pressa pela Luneta de Navegador. | Zen × Escudo ✗; Zen × Bateria ✗; Zen × Luneta ✓ | O Zen segurava a Luneta de Navegador. |
| 6 | 🎁 Objeto | O Kael não segurava o Escudo Romano: espadachim educado não se esconde. | Kael × Escudo ✗ | O Kael segurava a Bateria do Futuro: na grade Objeto, era a única opção que sobrava para ele. A Bruma segurava o Escudo Romano: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Bruma — Faixa do Presente (casa C4), Escudo Romano · Zen — Casa do Passado (casa B1), Luneta de Navegador · Kael — Borda do Tempo (casa A3), Bateria do Futuro · Cubo — Casa do Futuro (casa D2), Capacete Robótico

## astros-88 · A foto de família das eras

Astros · capítulo 9 · Mestre · Mapa do céu · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | Dois olhos brilhavam no Ano 3000: era o Nox. | Nox × Estúdio ✗; Nox × Ano 1900 ✗; Nox × Ano 2000 ✗; Nox × Ano 3000 ✓ | O Nox estava no Ano 3000. |
| 2 | ↔️ Linha | A Maya anotava a pose de cada um na linha 1. | Maya × 2 ✗; Maya × 3 ✗; Maya × 4 ✗; Maya × 1 ✓ | A Maya estava na linha 1. A Maya estava na coluna C: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Maya estava no Estúdio: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Nox estava na linha 2: na grade Linha, era a única opção que sobrava para ele. O Nox estava na coluna A: na grade Coluna, era a única opção que sobrava para ele. |
| 3 | ✨ Região | A Lila não estava no Ano 1900: lá não se pode pular. | Lila × Ano 1900 ✗ | A Lila estava na coluna D: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Lila estava no Ano 2000: na grade Região, era a única opção que sobrava para ela. O Umbra estava na linha 4: na grade Linha, era a única opção que sobrava para ele. O Umbra estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. O Umbra estava no Ano 1900: na grade Região, era a única opção que sobrava para ele. A Lila estava na linha 3: na grade Linha, era a única opção que sobrava para ela. |
| 4 | 🎁 Objeto | O Umbra segurava o Holograma da Vovó com a ponta da asa. | Umbra × Câmera ✗; Umbra × Relógio ✗; Umbra × Álbum ✗; Umbra × Holograma ✓ | O Umbra segurava o Holograma da Vovó. |
| 5 | 🎁 Objeto | A Maya marcava o tempo da pose no Relógio de Bolso. | Maya × Câmera ✗; Maya × Álbum ✗; Maya × Relógio ✓ | A Maya segurava o Relógio de Bolso. |
| 6 | 🎁 Objeto | O Nox não segurava a Câmera Antiga: ele estava na foto, não atrás dela. | Nox × Câmera ✗ | O Nox segurava o Álbum de Família: na grade Objeto, era a única opção que sobrava para ele. A Lila segurava a Câmera Antiga: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Maya — Estúdio (casa C1), Relógio de Bolso · Umbra — Ano 1900 (casa B4), Holograma da Vovó · Nox — Ano 3000 (casa A2), Álbum de Família · Lila — Ano 2000 (casa D3), Câmera Antiga

## astros-93 · A constelação do Trono

Astros · capítulo 10 · Mestre · Descoberta progressiva · 7 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | 🎁 Objeto | A Neve segurava a Estrela do Sudoku, rindo do encaixe perfeito. | Neve × Estrela do Zip ✗; Neve × Estrela do Tango ✗; Neve × Estrela do Patches ✗; Neve × Estrela do Sudoku ✓ | A Neve segurava o Estrela do Sudoku. |
| 2 | ↔️ Linha | O olhar dourado da Sol brilhou na linha 4. | Sol × 1 ✗; Sol × 2 ✗; Sol × 3 ✗; Sol × 4 ✓ | A Sol estava na linha 4. |
| 3 | ↕️ Coluna | A Sol desenhou o seu caminho na coluna C. | Sol × A ✗; Sol × B ✗; Sol × D ✗; Sol × C ✓ | A Sol estava na coluna C. A Sol estava no Braço do Sul: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 4 | ↕️ Coluna | A risada da Neve ecoou na coluna D. | Neve × A ✗; Neve × B ✗; Neve × D ✓ | A Neve estava na coluna D. A Neve estava na linha 2: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). A Neve estava no Núcleo: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 5 | ✨ Região | O Orbi não estava no Braço do Norte: lá a luz dele some. | Orbi × Braço do Norte ✗ | O Orbi estava na linha 1: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). O Orbi estava no Halo: na grade Região, era a única opção que sobrava para ele. A Lyra estava na linha 3: na grade Linha, era a única opção que sobrava para ela. A Lyra estava na coluna A: na grade Coluna, era a única opção que sobrava para ela. A Lyra estava no Braço do Norte: na grade Região, era a única opção que sobrava para ela. O Orbi estava na coluna B: na grade Coluna, era a única opção que sobrava para ele. |
| 6 | 🎁 Objeto | A Sol segurava a Estrela do Zip, traçando uma trilha no céu. | Sol × Estrela do Tango ✗; Sol × Estrela do Patches ✗; Sol × Estrela do Zip ✓ | A Sol segurava o Estrela do Zip. |
| 7 | 🎁 Objeto | A Lyra não segurava a Estrela do Tango: ela ouve outra música. | Lyra × Estrela do Tango ✗ | A Lyra segurava o Estrela do Patches: na grade Objeto, era a única opção que sobrava para ela. O Orbi segurava o Estrela do Tango: na grade Objeto, era a única opção que sobrava para ele. |

**Solução:** Sol — Braço do Sul (casa C4), Estrela do Zip · Neve — Núcleo (casa D2), Estrela do Sudoku · Lyra — Braço do Norte (casa A3), Estrela do Patches · Orbi — Halo (casa B1), Estrela do Tango

## astros-97 · A pista de dança do Trono

Astros · capítulo 10 · Mestre · Mapa do céu · 6 pistas · solução única, todas as pistas necessárias, resolvível na ordem sem chute

| # | Grade | Pista | Marcações diretas | Conclusões |
|---|---|---|---|---|
| 1 | ✨ Região | O Rocha, que fala pouco, dançava quieto no Canto das Luzes. | Rocha × Varanda Estelar ✗; Rocha × Palco do DJ ✗; Rocha × Pista Central ✗; Rocha × Canto das Luzes ✓ | O Rocha estava no Canto das Luzes. O Rocha estava na coluna D: na grade Coluna, só ele ainda podia ficar com isso. |
| 2 | ↕️ Coluna | A Vi contava as estrelas do teto na coluna A. | Vi × B ✗; Vi × C ✗; Vi × A ✓ | A Vi estava na coluna A. A Vi estava na Varanda Estelar: o tabuleiro liga as grades (veja onde ficam os cômodos, as linhas e as casas bloqueadas). |
| 3 | ✨ Região | A Cris não estava na Pista Central: lá ninguém vê o reflexo dela. | Cris × Pista Central ✗ | A Cris estava no Palco do DJ: na grade Região, era a única opção que sobrava para ela. A Alva estava na linha 4: na grade Linha, era a única opção que sobrava para ela. A Alva estava na coluna B: na grade Coluna, era a única opção que sobrava para ela. A Alva estava na Pista Central: na grade Região, era a única opção que sobrava para ela. A Cris estava na coluna C: na grade Coluna, era a única opção que sobrava para ela. A Vi estava na linha 2: na grade Linha, era a única opção que sobrava para ela. A Cris estava na linha 1: na grade Linha, era a única opção que sobrava para ela. O Rocha estava na linha 3: na grade Linha, era a única opção que sobrava para ele. |
| 4 | 🎁 Objeto | O Rocha segurava o Saco de Confete — e jogava um papelzinho de cada vez. | Rocha × Globo ✗; Rocha × Coroa de Luz ✗; Rocha × Fone ✗; Rocha × Saco ✓ | O Rocha segurava o Saco de Confete. |
| 5 | 🎁 Objeto | A Alva dançava de olhos fechados com a Coroa de Luz. | Alva × Globo ✗; Alva × Fone ✗; Alva × Coroa de Luz ✓ | A Alva segurava a Coroa de Luz. |
| 6 | 🎁 Objeto | A Cris não segurava o Fone de Ouvido Estrelado. | Cris × Fone ✗ | A Cris segurava o Globo de Espelhos: na grade Objeto, era a única opção que sobrava para ela. A Vi segurava o Fone de Ouvido Estrelado: na grade Objeto, era a única opção que sobrava para ela. |

**Solução:** Cris — Palco do DJ (casa C1), Globo de Espelhos · Vi — Varanda Estelar (casa A2), Fone de Ouvido Estrelado · Alva — Pista Central (casa B4), Coroa de Luz · Rocha — Canto das Luzes (casa D3), Saco de Confete

