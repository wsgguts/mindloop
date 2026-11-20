// Narrativas das investigações do Patches (formato em ../narrative.ts).
// Tema do jogo: cômodos como peças de retalho, cada um com o seu tamanho — uma pessoa em cada cômodo.
import type { Narrative } from "../narrative";

export const PATCHES_NARRATIVES: Record<string, Narrative> = {
  "patches-03": {
    scene: "No Reino Celestial, um castelo flutua preso por correntes de cristal.",
    intro: "Na faxina da primavera, cada ajudante limpou um cômodo — e um deles achou o anel que o rei perdeu havia dez anos! Descubra em que cômodo cada um estava e o que segurava para saber quem achou o anel.",
    people: {
      Marina: { why: "Coordena a faxina, cômodo por cômodo.", link: "Leva o balde, porque é a única que não derrama." },
      Byte: { why: "Veio limpar as plantas do castelo e ganhou uma vassoura.", link: "A vassoura voadora gosta mais dele do que de ninguém." },
      Pipa: { why: "Acha que todo cômodo esconde um mistério.", link: "Pegou o espanador para procurar pistas entre os livros." },
      Nina: { why: "Remenda as cortinas enquanto limpa.", link: "Esfrega os sinos da torre de olhos fechados." },
    },
    objects: [
      { label: "Espanador de Penas", icon: "🪶", desc: "Espanador que tira o pó até das letras.", role: "distração", place: "Fica na Biblioteca do castelo." },
      { label: "Vassoura Voadora", icon: "🧹", desc: "Vassoura que varre sozinha — quando quer.", role: "chave", place: "Guardada no armário do Salão do Trono." },
      { label: "Balde de Espuma", icon: "🪣", desc: "Balde de espuma que nunca acaba.", role: "ferramenta", place: "Enchido na Cozinha das Nuvens." },
      { label: "Esponja Mágica", icon: "🧽", desc: "Esponja que deixa o metal brilhando.", role: "ferramenta", place: "Usada nos sinos da torre." },
    ],
    clues: [
      "Pó de livro nos óculos de aventura: a Pipa estava na Biblioteca.",
      "A Nina esfregou um cômodo de 3 casas, de olhos fechados.",
      "A Marina equilibrava baldes num cômodo de 4 casas.",
      "A Marina segurava o Balde de Espuma sem derramar uma gota.",
      "O Byte segurava a Vassoura Voadora, que tentava escapar das mãos dele.",
      "Bolhas de sabão nos retalhos da Nina: ela segurava a Esponja Mágica.",
    ],
    ending: "Na Biblioteca, a Pipa tirava o pó dos livros com o Espanador de Penas. Na Cozinha das Nuvens, a Marina carregava o Balde de Espuma, e a Nina fazia os sinos brilharem com a Esponja Mágica. No Salão do Trono, o Byte varreu embaixo do trono com a Vassoura Voadora e achou o anel perdido do rei. O rei deu uma festa — e a faxina virou baile.",
  },

  "patches-07": {
    scene: "No Reino Celestial, um hotel flutuante recebe viajantes que chegam de balão.",
    intro: "Na hora do check-in, o Bolo de Boas-Vindas sumiu do balcão! Descubra em que cômodo cada hóspede estava e o que segurava para achar o bolo.",
    people: {
      Dante: { why: "Chegou de balão contando a história da viagem.", link: "Trouxe guarda-chuva porque nunca confia nas nuvens." },
      Pingo: { why: "Veio de férias com uma mala maior que ele.", link: "Dividiu o elevador com o Nico." },
      Nico: { why: "Reservou o Quarto Nimbus para estudar as nuvens.", link: "Ajustou os óculos três vezes para ler o número da chave." },
      Íris: { why: "Veio ler em paz no alto do hotel.", link: "Lê três livros — e come três pedaços." },
    },
    objects: [
      { label: "Bolo de Boas-Vindas", icon: "🍰", desc: "Bolo de nuvem para os hóspedes novos.", role: "chave", place: "Fica no balcão da recepção." },
      { label: "Chave Dourada", icon: "🗝️", desc: "Chave com o número do quarto.", role: "ferramenta", place: "Entregue na recepção." },
      { label: "Mala de Rodinhas", icon: "🧳", desc: "Mala enorme, cheia de roupas de férias.", role: "distração", place: "Chegou de balão com o hóspede." },
      { label: "Guarda-Chuva de Nuvem", icon: "☂️", desc: "Guarda-chuva que segura até chuva de granizo.", role: "ferramenta", place: "Emprestado na porta do hotel." },
    ],
    clues: [
      "O Nico ajustou os óculos e conferiu o número na Chave Dourada que segurava.",
      "A Íris lia três livros ao vento: ela estava no Terraço.",
      "A sombra do Pingo apareceu entre as mesas do Restaurante.",
      "O Pingo segurava a Mala de Rodinhas, maior que ele.",
      "O Dante não segurava o Bolo de Boas-Vindas: estava ocupado contando uma história.",
      "A voz do Dante ecoava na Recepção.",
    ],
    ending: "Na Recepção, o Dante contava histórias sacudindo o Guarda-Chuva de Nuvem. O Pingo arrastava a Mala de Rodinhas pelo Restaurante, e o Nico abria o Quarto Nimbus com a Chave Dourada. O Bolo de Boas-Vindas sumiu porque a Íris o levou para o Terraço — e comeu um pedaço a cada capítulo. A recepcionista pediu outro bolo e, desta vez, trancou na cozinha.",
  },

  "patches-12": {
    scene: "Uma turma construiu uma casa na árvore de cristal, com cômodos ligados por escadinhas.",
    intro: "Depois da reunião secreta, a senha do clube mudou, e ninguém consegue entrar! Descubra em que cômodo cada sócio estava e o que segurava para saber quem trocou a senha.",
    people: {
      Lyra: { why: "Fundou o clube para ouvir as estrelas em segredo.", link: "Guarda a senha, porque ninguém lembra melodias como ela." },
      Kael: { why: "É o secretário do clube, muito educado.", link: "Ilumina a reunião para a Lyra ler as notas." },
      Astro: { why: "Mapeia o céu da casa na árvore.", link: "Toma conta dos biscoitos — e conta todos." },
      Gema: { why: "Vigia a floresta lá do alto.", link: "Avisa o clube quando alguém se aproxima." },
    },
    objects: [
      { label: "Senha Secreta", icon: "📜", desc: "O papel com a senha para entrar no clube.", role: "chave", place: "Escondida no Esconderijo." },
      { label: "Lanterna de Pilha", icon: "🔦", desc: "Lanterna das reuniões noturnas.", role: "ferramenta", place: "Pendurada na Sala de Reunião." },
      { label: "Pote de Biscoitos", icon: "🍪", desc: "Biscoitos para os sócios.", role: "distração", place: "Guardado na Cozinha da casa na árvore." },
      { label: "Luneta do Clube", icon: "🔭", desc: "Luneta para vigiar a floresta.", role: "ferramenta", place: "Fica no Mirante." },
    ],
    clues: [
      "A Gema ficou num cômodo pequenininho, de 2 casas.",
      "A música dos fones da Lyra vazava pelo Esconderijo.",
      "Migalhas nos passos de robô: o Astro estava na Cozinha.",
      "O triângulo de luz da Gema refletia na Luneta do Clube.",
      "O Kael, educado, segurava a Lanterna de Pilha para todos.",
      "A Lyra segurava a Senha Secreta, escrita em notas musicais.",
    ],
    ending: "No Mirante, a Gema vigiava a floresta com a Luneta do Clube. O Kael iluminava a Sala de Reunião com a Lanterna de Pilha, e o Astro contava os biscoitos do Pote de Biscoitos. A senha nova foi ideia da Lyra: lá do Esconderijo, ela trocou a Senha Secreta por uma melodia. Agora, para entrar no clube, é preciso cantar.",
  },

  "patches-18": {
    scene: "Sob uma árvore de cristal mora uma família de coelhos, numa toca cheia de cômodos.",
    intro: "Numa noite de chuva, o filhote caçula sumiu, e alguém o encontrou antes de a vovó se preocupar. Descubra em que cômodo cada visitante estava e o que segurava para saber quem achou o filhote.",
    people: {
      Pixel: { why: "Veio ler histórias para os filhotes.", link: "Mostra um coração na tela para cada filhote que dorme." },
      Leo: { why: "Veio jantar e ficou para dar palpites sobre a chuva.", link: "Apostou com a Flor que a chuva entraria pelo túnel." },
      Flor: { why: "Trouxe uma cenoura gigante de presente.", link: "Perdeu a aposta para o Leo." },
      Prisma: { why: "Ajuda a vovó a tricotar cachecóis.", link: "Muda de cor a cada volta do novelo." },
    },
    objects: [
      { label: "Almanaque da Chuva", icon: "📖", desc: "Livro que diz quando vai chover.", role: "distração", place: "Fica na estante do Quarto dos Filhotes." },
      { label: "Cenoura Gigante", icon: "🥕", desc: "A maior cenoura da floresta.", role: "presente", place: "Colhida na horta da Floresta dos Cristais." },
      { label: "Novelo de Lã Azul", icon: "🧶", desc: "Lã para os cachecóis de inverno.", role: "ferramenta", place: "Guardado na cesta da vovó." },
      { label: "Lanterna de Vaga-lume", icon: "🏮", desc: "Pote com vaga-lumes que iluminam a toca.", role: "chave", place: "Pendurada na saída da toca." },
    ],
    clues: [
      "O Leo palpitou que a chuva entraria pelo Túnel de Saída — e ficou lá vigiando.",
      "A Flor segurava a Cenoura Gigante, com uma flor amarrada na ponta.",
      "O brilho do Prisma iluminou um cômodo de 4 casas.",
      "O Pixel ficou num cômodo de 3 casas, com o coração piscando na tela.",
      "Fios de lã azul enroscados no Prisma: ele segurava o Novelo de Lã Azul.",
      "O Pixel não segurava a Lanterna de Vaga-lume: a tela dele já ilumina.",
    ],
    ending: "Na Sala da Toca, a Flor dividia a Cenoura Gigante com a vovó. O Pixel lia o Almanaque da Chuva para os filhotes, e o Prisma enrolava o Novelo de Lã Azul na Despensa de Raízes. Quando o caçula sumiu, foi o Leo quem o achou no Túnel de Saída, com a Lanterna de Vaga-lume: ele estava brincando na lama. O palpite do Leo estava certo — pela primeira vez na semana.",
  },

  "patches-24": {
    scene: "Uma família mora num barco-casa que desce devagar pelo Vale das Águas.",
    intro: "Numa tarde de chuva, uma música bonita tomou conta do barco, e o avô quer saber quem estava tocando. Descubra em que cômodo cada visitante estava e o que segurava.",
    people: {
      Umbra: { why: "Veio pescar com o avô.", link: "Pesca pela janela para não molhar as asas." },
      Alva: { why: "Adora sentir a chuva no rosto.", link: "Ganhou o bolo de fubá da avó." },
      Rocha: { why: "Ajuda a remar quando a correnteza é forte.", link: "Aprendeu a tocar com o avô." },
      Kai: { why: "Desenha o mapa do rio para a coleção.", link: "Lê as lendas para descobrir ilhas novas." },
    },
    objects: [
      { label: "Vara de Pescar", icon: "🎣", desc: "Vara comprida de bambu.", role: "distração", place: "Fica na janela da Cabine." },
      { label: "Violão de Bambu", icon: "🎸", desc: "Violão feito pelo avô.", role: "chave", place: "Pendurado na parede da cozinha." },
      { label: "Livro de Lendas do Rio", icon: "📖", desc: "Histórias de ilhas que aparecem e somem.", role: "ferramenta", place: "Guardado na Proa." },
      { label: "Bolo de Fubá", icon: "🍰", desc: "O bolo da avó, ainda quente.", role: "presente", place: "Assado no forno do barco." },
    ],
    clues: [
      "A Alva sorria de olhos fechados para a chuva do Convés.",
      "O Kai desenhava mapas num cômodo de 3 casas.",
      "O Rocha não estava na Cabine: ele não cabe lá dentro.",
      "O Umbra segurava a Vara de Pescar com a ponta da cauda.",
      "O Rocha, que fala pouco, deixou o Violão de Bambu falar por ele.",
      "O Kai não segurava o Bolo de Fubá: as mãos estavam sujas de tinta de mapa.",
    ],
    ending: "Na Cabine, o Umbra pescava pela janela com a Vara de Pescar. No Convés, a Alva comia o Bolo de Fubá debaixo da chuva. Na Proa, o Kai lia o Livro de Lendas do Rio. A música vinha da Cozinha: era o Rocha, tocando baixinho o Violão de Bambu. O avô cantou junto — e a chuva parou para escutar.",
  },

  "patches-27": {
    scene: "Um farol na foz do Vale das Águas guia os barcos e mede a chuva da região.",
    intro: "Numa noite de tempestade, a luz grande apagou bem quando um barco se aproximava, e alguém acendeu a luz de reserva a tempo. Descubra em que cômodo cada morador estava e o que segurava para saber quem salvou o barco.",
    people: {
      Ravi: { why: "Sobe ao topo para vigiar o mar.", link: "Usa a capa amarela por cima do capuz, para ser visto." },
      Estela: { why: "Acompanha o tempo pelas estrelas e pelo barômetro.", link: "Avisa o Zen quando a pressão cai." },
      Luna: { why: "Ouve os barulhos do farol à noite.", link: "Conhece o zumbido de cada lâmpada." },
      Zen: { why: "Escreve o diário do farol sem pressa.", link: "Anota tudo o que a Estela avisa." },
    },
    objects: [
      { label: "Lanterna de Reserva", icon: "🔦", desc: "Lanterna forte para quando a luz grande falha.", role: "chave", place: "Guardada no Depósito, ao pé da escada." },
      { label: "Barômetro de Mercúrio", icon: "🌡️", desc: "Mostra quando vem tempestade.", role: "ferramenta", place: "Pendurado na parede da Cozinha." },
      { label: "Capa Amarela", icon: "🧥", desc: "Capa de chuva que se vê de longe.", role: "ferramenta", place: "Fica no gancho do topo do farol." },
      { label: "Diário do Farol", icon: "📓", desc: "Caderno com cada noite de tempestade.", role: "distração", place: "Guardado na Sala do Rádio." },
    ],
    clues: [
      "A Luna escutava o silêncio num cômodo pequeno, de 2 casas.",
      "A Luna segurava a Lanterna de Reserva, ainda zumbindo.",
      "Um capuz azul foi visto num cômodo de 4 casas: era o Ravi.",
      "O Ravi vestia a Capa Amarela por cima do capuz azul.",
      "A Estela não estava na Sala do Rádio: o chiado atrapalha as estrelas-brinco.",
      "O Zen escrevia sem pressa no Diário do Farol.",
    ],
    ending: "No Topo do Farol, o Ravi enfrentava o vento com a Capa Amarela. A Estela lia o Barômetro de Mercúrio na Cozinha, e o Zen anotava tudo no Diário do Farol. Quando a luz grande apagou, foi a Luna quem achou a Lanterna de Reserva no Depósito, só pelo zumbido. O barco chegou ao porto em segurança, guiado pela lanterna e pelo silêncio.",
  },

  "patches-33": {
    scene: "No alto do Templo das Estrelas, monges estudam o céu num observatório de pedra.",
    intro: "Na noite da chuva de meteoros, alguém viu o maior meteoro do século — e só essa pessoa viu! Descubra em que cômodo cada visitante estava e o que segurava para saber quem foi.",
    people: {
      Cogu: { why: "Tem medo do escuro, mas adora estrelas.", link: "Brilha um pouquinho para enxergar o telescópio." },
      Kika: { why: "Veio ajudar os monges a medir o céu.", link: "Ganhou o sextante por acertar uma conta difícil." },
      Ritmo: { why: "Marca o tempo de cada meteoro no compasso.", link: "Vira a ampulheta a cada batida." },
      Lila: { why: "Anota cada meteoro pulando de alegria.", link: "Corre para contar ao Cogu cada meteoro anotado." },
    },
    objects: [
      { label: "Sextante de Latão", icon: "🧭", desc: "Instrumento que mede o ângulo das estrelas.", role: "ferramenta", place: "Fica na Cúpula." },
      { label: "Telescópio de Bolso", icon: "🔭", desc: "Telescópio pequeno que enxerga longe.", role: "chave", place: "Usado na Câmara Escura." },
      { label: "Carta dos Meteoros", icon: "🌠", desc: "Mapa onde se marca cada meteoro.", role: "prova", place: "Guardada na Biblioteca dos Astros." },
      { label: "Ampulheta dos Monges", icon: "⏳", desc: "Ampulheta que mede um minuto exato.", role: "distração", place: "Fica no Terraço." },
    ],
    clues: [
      "O Cogu, tímido, espiava o céu pelo Telescópio de Bolso.",
      "A Lila pulava de alegria num cômodo de 4 casas.",
      "Um brilho de cogumelo apareceu na Câmara Escura: era o Cogu.",
      "O Ritmo marcava o tempo num cômodo de 3 casas.",
      "A Lila marcava cada meteoro na Carta dos Meteoros.",
      "A Kika não segurava a Ampulheta dos Monges: ela conta o tempo em bolas de chiclete.",
    ],
    ending: "Na Cúpula, a Kika media os ângulos com o Sextante de Latão. No Terraço, o Ritmo virava a Ampulheta dos Monges a cada batida. Na Biblioteca dos Astros, a Lila anotava tudo na Carta dos Meteoros. O maior meteoro foi visto pelo Cogu, na Câmara Escura, pelo Telescópio de Bolso — e ele brilhou de emoção. O abade deu ao meteoro o nome de “Cogumelo Cadente”.",
  },

  "patches-36": {
    scene: "A ceia do solstício está quase pronta, e o cheiro de pão de mel sobe pelas escadarias do Templo das Estrelas.",
    intro: "Na correria, alguém mexeu na panela da sopa, e ela ficou verde! Descubra em que cômodo cada ajudante estava e o que segurava para saber quem foi.",
    people: {
      Floco: { why: "Arruma as mesas, longe do fogo.", link: "Divide o pão de mel com o Gelo." },
      Gelo: { why: "Ajuda na despensa, onde é fresquinho.", link: "Foi buscar sal para o Chip." },
      Chip: { why: "Sabe de cor todas as receitas — com algumas mudanças.", link: "Pediu ao Gelo um pouco de sal." },
      Jade: { why: "Cuida do fogão, porque entende de fogo de balão.", link: "Perfuma a cozinha para disfarçar o cheiro de queimado." },
    },
    objects: [
      { label: "Panela de Barro", icon: "🍲", desc: "A panela da sopa do solstício.", role: "chave", place: "Devia estar no Fogão a Lenha." },
      { label: "Pão de Mel", icon: "🍯", desc: "O doce mais esperado da ceia.", role: "presente", place: "Assado no forno de pedra." },
      { label: "Concha de Madeira", icon: "🥄", desc: "Concha grande para servir a sopa.", role: "ferramenta", place: "Guardada na Despensa." },
      { label: "Vela Aromática", icon: "🕯️", desc: "Vela de ervas que perfuma a cozinha.", role: "distração", place: "Acesa perto do fogão." },
    ],
    clues: [
      "A Jade acendeu a Vela Aromática com o cuidado de quem pilota balões.",
      "O Floco ficou num cômodo de 4 casas, longe do fogo.",
      "O Chip se enfiou num cômodo pequeno, de 2 casas.",
      "O Gelo não estava no Fogão a Lenha: lobo de cristal não gosta de calor.",
      "Mel no cristal azul do Floco: ele segurava o Pão de Mel.",
      "O Gelo não segurava a Panela de Barro: o barro esquenta demais.",
    ],
    ending: "No Refeitório, o Floco arrumava o Pão de Mel nas mesas. Na Despensa, o Gelo procurava sal com a Concha de Madeira, e a Jade cuidava do fogão com a Vela Aromática. Quem mexeu na panela foi o Chip: ele levou a Panela de Barro para a Horta de Ervas e jogou uma folha de cada erva lá dentro. A sopa ficou verde — e foi a melhor ceia do solstício.",
  },

  "patches-42": {
    scene: "No Deserto dos Segredos, um palácio de areia é refeito todo ano para a festa do sultãozinho.",
    intro: "Na manhã da festa, a torre amanheceu com uma cara de gato esculpida no topo! Descubra em que cômodo cada artesão estava e o que segurava para saber quem a esculpiu.",
    people: {
      Lis: { why: "Pinta os detalhes dourados do palácio.", link: "Sonha que o palácio é de verdade." },
      Rio: { why: "Mantém a areia molhada para ela não desmanchar.", link: "Molha a areia que o Musgo vai moldar." },
      Nox: { why: "Ninguém o contratou, mas ele está sempre na obra.", link: "Sobe nas torres que ninguém alcança." },
      Musgo: { why: "Conhece o atalho até cada salão.", link: "Faz as cúpulas com a areia que o Rio molha." },
    },
    objects: [
      { label: "Espátula de Escultor", icon: "🥄", desc: "Espátula fina que esculpe detalhes na areia.", role: "chave", place: "Guardada no alto da Torre de Vigia." },
      { label: "Balde do Oásis", icon: "🪣", desc: "Balde com água fresca do oásis.", role: "ferramenta", place: "Enchido no poço do palácio." },
      { label: "Pincel de Ouro", icon: "🖌️", desc: "Pincel que deixa a areia dourada.", role: "ferramenta", place: "Usado nas fontes do pátio." },
      { label: "Molde de Cúpula", icon: "🟫", desc: "Forma redonda para as cúpulas do palácio.", role: "distração", place: "Fica no Salão Dourado." },
    ],
    clues: [
      "Dois olhos brilhavam lá no alto, na Torre de Vigia: era o Nox.",
      "Areia nos pelos verdes do Musgo: ele segurava o Molde de Cúpula.",
      "O Musgo achou um atalho até o Salão Dourado e ficou lá.",
      "A Lis não estava na Sala dos Tapetes: estava sonhando ao ar livre.",
      "O Nox segurava a Espátula de Escultor entre as patas.",
      "O Rio não segurava o Pincel de Ouro: prefere a água à tinta.",
    ],
    ending: "No Pátio das Fontes, a Lis pintava as paredes com o Pincel de Ouro. Na Sala dos Tapetes, o Rio molhava a areia com o Balde do Oásis, e o Musgo enchia o Molde de Cúpula no salão ao lado. No alto da Torre de Vigia, o Nox esculpiu com a Espátula de Escultor uma cara de gato que ninguém pediu. O sultãozinho amou e mandou fazer igual todo ano.",
  },

  "patches-47": {
    scene: "No Deserto dos Segredos, um casamento reúne a família numa tenda enorme dividida em cômodos de tecido.",
    intro: "Minutos antes da cerimônia, o Anel de Noivado sumiu! Descubra em que cômodo cada convidado estava e o que segurava para achar o anel.",
    people: {
      Drako: { why: "Toca alaúde nas festas da família.", link: "Esfria as bebidas com o próprio sopro." },
      Mel: { why: "Prima da noiva, sempre rindo.", link: "Prova os figos que deveria servir." },
      Orbi: { why: "Ilumina a tenda para a festa.", link: "Segura o véu da noiva para não arrastar." },
      Davi: { why: "Amigo do noivo, repara em tudo.", link: "Procurou o anel onde ninguém pensou em olhar." },
    },
    objects: [
      { label: "Véu Bordado", icon: "🤍", desc: "O véu da noiva, bordado com estrelas.", role: "ferramenta", place: "Pendurado na Tenda das Danças." },
      { label: "Alaúde", icon: "🪕", desc: "Instrumento de cordas da família.", role: "distração", place: "Tocado na festa desde a vovó." },
      { label: "Bandeja de Figos", icon: "🍇", desc: "Figos doces do oásis.", role: "presente", place: "Servida na Tenda Principal." },
      { label: "Anel de Noivado", icon: "💍", desc: "O anel que o noivo vai entregar.", role: "devolver", place: "Caiu do bolso do noivo no jardim." },
    ],
    clues: [
      "A risada da Mel enchia um cômodo de 4 casas.",
      "O Véu Bordado brilhava com a luz do Orbi, que o segurava.",
      "A Mel segurava a Bandeja de Figos — e provava um a cada risada.",
      "O Davi reparou num detalhe dentro de um cômodo de 2 casas.",
      "O Drako não segurava o Anel de Noivado: as garras dele são grandes demais.",
      "O Orbi não estava na Cozinha da Festa: luz demais estraga o fermento.",
    ],
    ending: "Na Tenda Principal, a Mel servia a Bandeja de Figos. O Orbi segurava o Véu Bordado na Tenda das Danças, e o Drako tocava o Alaúde para os cozinheiros. O Anel de Noivado tinha caído no Jardim do Oásis, e foi o Davi quem o achou, brilhando entre as pedrinhas. O casamento começou na hora — e o Davi ganhou o primeiro pedaço do bolo.",
  },

  "patches-54": {
    scene: "Numa caverna das Montanhas do Dragão, uma dragoa choca seus ovos em silêncio absoluto.",
    intro: "No meio da visita dos pesquisadores, um ovo rachou, e alguém gravou o primeiro som do filhote! Descubra em que salão cada pesquisador estava e o que segurava para saber quem gravou.",
    people: {
      Eco: { why: "Anota os sons da caverna sem tirar o fone.", link: "Escreve o que a Faísca grava." },
      Neve: { why: "Mede o calor dos túneis.", link: "Segura a risada perto da dragoa." },
      Cubo: { why: "Guarda as imagens da caverna na memória e na câmera.", link: "Fotografa tudo o que o Eco anota." },
      Faísca: { why: "Inventou um gravador que não faz barulho.", link: "Correu para o salão dos ovos antes de todos." },
    },
    objects: [
      { label: "Termômetro de Lava", icon: "🌡️", desc: "Termômetro que aguenta o calor da lava.", role: "ferramenta", place: "Usado no Túnel Quente." },
      { label: "Câmera Silenciosa", icon: "📷", desc: "Câmera que não faz clique.", role: "ferramenta", place: "Feita para não acordar dragões." },
      { label: "Gravador de Sons", icon: "🎙️", desc: "Gravador que capta até um suspiro.", role: "chave", place: "Inventado pela própria pesquisadora." },
      { label: "Caderno à Prova de Fogo", icon: "📓", desc: "Caderno que não queima nem com bafo de dragão.", role: "distração", place: "Fica na entrada da caverna." },
    ],
    clues: [
      "O Eco anotava no Caderno à Prova de Fogo, no ritmo da música.",
      "O Eco ficou num cômodo apertado, de 2 casas.",
      "O Cubo segurava a Câmera Silenciosa sem fazer nenhum clique.",
      "A Neve não segurava o Gravador de Sons: a risada dela estragaria a gravação.",
      "O brilho do Cubo se refletia na água do Lago Subterrâneo.",
      "A Faísca não estava no Túnel Quente: os óculos de voo embaçam lá.",
    ],
    ending: "Na Galeria de Cristais, o Eco anotava tudo no Caderno à Prova de Fogo. A Neve media o calor com o Termômetro de Lava, e o Cubo fotografava o lago com a Câmera Silenciosa. No Salão dos Ovos, a Faísca gravou com o Gravador de Sons o primeiro espirro de um dragãozinho recém-nascido. A dragoa nem acordou — mas o filhote já tem fã-clube.",
  },

  "patches-58": {
    scene: "Nas Montanhas do Dragão, um castelo é guardado por um dragão que adora visitas.",
    intro: "No meio do chá, o bolo de chocolate sumiu da mesa! Descubra em que cômodo cada convidado estava e o que segurava para saber para onde o bolo foi.",
    people: {
      Maya: { why: "Quer desenhar o castelo no caderninho.", link: "Copia os corredores do mapa que o dragão emprestou." },
      Ayo: { why: "Veio do Templo trazer um presente ao dragão.", link: "Foi o único que lembrou do aniversário dele." },
      Lina: { why: "Canta para o dragão dormir depois do chá.", link: "Brinca de duelo com o Vulto." },
      Vulto: { why: "Ninguém sabe quem o convidou para o chá.", link: "Fugiu do duelo da Lina para o calabouço." },
    },
    objects: [
      { label: "Espada de Madeira", icon: "🗡️", desc: "Espada de brinquedo para duelos de mentira.", role: "distração", place: "Pendurada no Salão Principal." },
      { label: "Escudo de Lata", icon: "🛡️", desc: "Escudo leve e amassado.", role: "ferramenta", place: "Guardado no calabouço, junto das armaduras velhas." },
      { label: "Mapa do Castelo", icon: "🗺️", desc: "Mapa de todos os corredores do castelo.", role: "ferramenta", place: "Emprestado pelo dragão." },
      { label: "Bolo de Chocolate", icon: "🎂", desc: "O bolo do chá da tarde.", role: "chave", place: "Feito na Cozinha do castelo." },
    ],
    clues: [
      "A Maya anotou no caderninho cada corredor do Mapa do Castelo que segurava.",
      "A Maya ficou num cômodo de 3 casas, escrevendo sem parar.",
      "Chocolate no cabelo prateado do Ayo: ele segurava o Bolo de Chocolate.",
      "O Vulto não segurava a Espada de Madeira.",
      "A cantoria da Lina ecoava num cômodo enorme, de 9 casas.",
      "O Vulto não estava na Torre do Dragão.",
    ],
    ending: "Na Cozinha, a Maya estudava o Mapa do Castelo. No Salão Principal, a Lina duelava com a Espada de Madeira, enquanto o Vulto se escondia atrás do Escudo de Lata no Calabouço. O bolo sumiu porque o Ayo levou o Bolo de Chocolate até a Torre do Dragão: era aniversário do dragão, e só ele lembrou. O dragão chorou de alegria e apagou as velas sem queimar ninguém.",
  },

  "patches-63": {
    scene: "No Reino das Auroras, a rainha da neve abriu o palácio de gelo para visitantes.",
    intro: "Ao badalar da meia-noite, a Coroa de Neve não estava mais na almofada! Descubra em que salão cada visitante estava e o que segurava para achar a coroa.",
    people: {
      Broto: { why: "Veio ver se o frio o faz crescer.", link: "Tomou o suco que a Cris ofereceu." },
      Sol: { why: "Nunca tinha visto neve antes.", link: "Experimentou a coroa só por um minuto." },
      Cris: { why: "Faz o cristal eterno brilhar com o reflexo dela.", link: "Ofereceu suco ao Broto." },
      Theo: { why: "Lembra de cada baile do palácio.", link: "Fica de frente para o espelho mágico." },
    },
    objects: [
      { label: "Cristal de Neve Eterno", icon: "❄️", desc: "Floco de neve que nunca derrete.", role: "distração", place: "Exposto no Jardim de Gelo." },
      { label: "Espelho de Gelo", icon: "🪞", desc: "Espelho que mostra como você era no ano passado.", role: "ferramenta", place: "Fica na Sala do Trono." },
      { label: "Coroa de Neve", icon: "👑", desc: "A coroa da rainha.", role: "devolver", place: "Fica numa almofada, no Salão das Auroras." },
      { label: "Taça Gelada", icon: "🥂", desc: "Taça de gelo com suco de amora.", role: "presente", place: "Servida na Escadaria." },
    ],
    clues: [
      "As folhinhas do Broto caíram pelos degraus de um cômodo enorme, de 8 casas.",
      "O olhar dourado da Sol refletia as luzes do Salão das Auroras.",
      "O Theo não estava no Jardim de Gelo: ele lembra que escorregou lá no ano passado.",
      "O Cristal de Neve Eterno brilhava azul nas patas da Cris.",
      "O Broto segurava a Taça Gelada, esperando crescer com o suco.",
      "O Theo não segurava a Coroa de Neve: estava ocupado sorrindo para o espelho.",
    ],
    ending: "Na Escadaria, o Broto bebia da Taça Gelada. No Jardim de Gelo, a Cris fazia o Cristal de Neve Eterno brilhar, e o Theo se olhava no Espelho de Gelo, na sala ao lado. A coroa estava com a Sol: no Salão das Auroras, ela experimentou a Coroa de Neve para ver se combinava com o olhar dourado. A rainha gostou tanto que a deixou usar até o fim do baile.",
  },

  "patches-68": {
    scene: "No Reino das Auroras existe um viveiro onde as plantas brilham na escuridão.",
    intro: "Na inspeção noturna, nasceu uma planta vermelha que ninguém tinha plantado! Descubra em que cômodo cada visitante estava e o que segurava para saber quem a plantou.",
    people: {
      Quartzo: { why: "Organiza os canteiros em regiões.", link: "Rega as flores que a Bruma examina." },
      Vi: { why: "Cuida dos cactos e conta as estrelas pelo teto de vidro.", link: "Corta os espinhos que espetaram o Quartzo." },
      Rubro: { why: "Ninguém sabe como ele entrou no viveiro.", link: "Trouxe uma semente de onde ninguém sabe." },
      Bruma: { why: "Mantém o ar úmido para as mudas.", link: "Examina as mudas que o Quartzo rega." },
    },
    objects: [
      { label: "Regador de Prata", icon: "💧", desc: "Regador que espalha água morna.", role: "ferramenta", place: "Fica na fonte morna do viveiro." },
      { label: "Tesourinha de Cacto", icon: "✂️", desc: "Tesoura que corta espinhos sem dor.", role: "ferramenta", place: "Pendurada na Ala dos Cactos." },
      { label: "Semente de Luz", icon: "🌱", desc: "Semente que brota brilhando.", role: "chave", place: "Ninguém sabe de onde veio." },
      { label: "Lupa de Botânica", icon: "🔍", desc: "Lupa para ver as raízes das mudas.", role: "distração", place: "Fica na Sementeira." },
    ],
    clues: [
      "O piso de um cômodo de 8 casas rachou com o peso do Quartzo.",
      "A Vi aparava espinhos com a Tesourinha de Cacto.",
      "Um nevoeiro fininho cobriu um cômodo de 4 casas: era a Bruma.",
      "A Vi não estava no Corredor de Vidro: o reflexo atrapalha a contagem de estrelas.",
      "Um brilho escapava do capuz do Rubro: ele segurava a Semente de Luz.",
      "A Bruma não segurava o Regador de Prata: ela já molha tudo sozinha.",
    ],
    ending: "Na Ala das Orquídeas, o Quartzo regava as flores com o Regador de Prata. Na Ala dos Cactos, a Vi aparava espinhos com a Tesourinha de Cacto. Na Sementeira, a Bruma examinava os brotos com a Lupa de Botânica. A planta nova nasceu no Corredor de Vidro, onde o Rubro tinha plantado a Semente de Luz sem contar a ninguém. Ela brilha vermelho — da cor do capuz dele.",
  },

  "patches-73": {
    scene: "Sob a Cidade Perdida existe uma biblioteca escavada na rocha.",
    intro: "A equipe catalogava os salões quando a tocha principal se apagou — e, no escuro, uma porta secreta se abriu! Descubra em que cômodo cada pesquisador estava e o que segurava para saber quem a abriu.",
    people: {
      Nimbo: { why: "Ilumina a leitura mudando de cor.", link: "Empresta o tinteiro para quem precisar anotar." },
      Marina: { why: "Cataloga os rolos sem deixar nenhum cair.", link: "Equilibra os rolos que a Pipa encontra." },
      Byte: { why: "Procura livros sobre plantas antigas.", link: "Achou a chave num vaso esquecido." },
      Pipa: { why: "Investiga as passagens secretas da biblioteca.", link: "Desconfiava da porta que o Byte abriu." },
    },
    objects: [
      { label: "Rolo de Papiro", icon: "📜", desc: "Rolo antigo com receitas de mil anos.", role: "distração", place: "Achado na Cripta." },
      { label: "Tinteiro de Sépia", icon: "🖋️", desc: "Tinta marrom dos escribas.", role: "ferramenta", place: "Fica na mesa da Sala de Leitura." },
      { label: "Chave de Pedra", icon: "🗝️", desc: "Chave pesada, com raízes desenhadas.", role: "chave", place: "Escondida num vaso do Salão dos Rolos." },
      { label: "Mapa Antigo", icon: "🗺️", desc: "Mapa das passagens da biblioteca.", role: "prova", place: "Pintado na parede do Corredor." },
    ],
    clues: [
      "O broto do Byte encostou nas prateleiras do Salão dos Rolos.",
      "Uma luz colorida piscava na Sala de Leitura: era o Nimbo.",
      "A Marina não estava no Corredor: lá nada fica em equilíbrio.",
      "A Pipa examinava o Mapa Antigo com os óculos de aventura.",
      "O Byte segurava a Chave de Pedra, fria como o chão da biblioteca.",
      "A Marina não segurava o Tinteiro de Sépia: não tinha nenhuma mancha nas mãos.",
    ],
    ending: "Na Sala de Leitura, o Nimbo iluminava as páginas e molhava a pena no Tinteiro de Sépia. A Marina equilibrava o Rolo de Papiro na Cripta, e a Pipa estudava o Mapa Antigo no Corredor. Quando a tocha apagou, o Byte girou a Chave de Pedra no Salão dos Rolos e abriu uma porta secreta cheia de livros de jardinagem. Ele está lá até agora, lendo.",
  },

  "patches-77": {
    scene: "Na Cidade Perdida, arqueólogos estudam a casa de um antigo mercador de joias.",
    intro: "No fim da escavação, uma música começou a tocar nas ruínas! Descubra em que cômodo cada pesquisador estava e o que segurava para saber de onde veio a música.",
    people: {
      Nina: { why: "Restaura joias quebradas.", link: "Pediu ao Pingo que não entrasse na oficina." },
      Dante: { why: "Conta as histórias que cada peça esconde.", link: "Sabe por que a moeda tem um furo." },
      Pingo: { why: "Procura pedras da cor do seu anel.", link: "Ficou longe da oficina da Nina." },
      Nico: { why: "Estuda mecanismos antigos.", link: "Deu corda na caixinha só para ver se funcionava." },
    },
    objects: [
      { label: "Colar de Âmbar", icon: "📿", desc: "Colar com um inseto preso no âmbar.", role: "ferramenta", place: "Achado na Oficina, com o fio arrebentado." },
      { label: "Lupa de Joalheiro", icon: "🔍", desc: "Lupa que conta os brilhos de uma pedra.", role: "ferramenta", place: "Esquecida no balcão da Loja." },
      { label: "Caixinha de Música", icon: "🎶", desc: "Caixinha com uma dançarina de prata.", role: "chave", place: "Enterrada no Pátio." },
      { label: "Moeda de Prata Furada", icon: "🪙", desc: "Moeda com um furo no meio.", role: "distração", place: "Achada no Quarto do Mercador." },
    ],
    clues: [
      "O Nico ajustou os óculos para ver a dançarina da Caixinha de Música que segurava.",
      "O Nico estava no Pátio, ao ar livre.",
      "A voz do Dante ecoava num cômodo enorme, de 8 casas.",
      "O Pingo não estava na Oficina: o anel de planeta prende nas ferramentas.",
      "A Nina remendou o fio do Colar de Âmbar de olhos fechados.",
      "O Dante não segurava a Lupa de Joalheiro: ele vê as coisas pelas histórias.",
    ],
    ending: "Na Oficina, a Nina consertava o Colar de Âmbar. O Dante contava a história da Moeda de Prata Furada no Quarto do Mercador, e o Pingo examinava as vitrines com a Lupa de Joalheiro. A música misteriosa veio do Pátio: o Nico deu corda na Caixinha de Música, e ela tocou depois de mil anos. Era a canção favorita do mercador — e agora é a da equipe também.",
  },

  "patches-82": {
    scene: "Na Dimensão do Tempo, cada cômodo de uma casa fica numa época diferente.",
    intro: "Depois da tarde de exploração, o relógio da sala começou a girar para todos os lados! Descubra em que cômodo cada viajante estava e o que segurava para saber quem confundiu as eras.",
    people: {
      Íris: { why: "Quer ler um livro de cada época.", link: "Trocou o tablet pela pena com o Kael." },
      Lyra: { why: "Leva música a todas as eras.", link: "Ensinou os homens das cavernas a dançar." },
      Kael: { why: "Quer conhecer os cavaleiros de verdade.", link: "Ficou com o tablet que a Íris não quis." },
      Astro: { why: "Estuda o fogo dos tempos antigos.", link: "Levou a lamparina para o futuro." },
    },
    objects: [
      { label: "Disco de Vinil", icon: "💿", desc: "Disco com as músicas dos anos 80.", role: "distração", place: "Saiu do quarto dos anos 80." },
      { label: "Lamparina de Pedra", icon: "🪔", desc: "Lamparina dos tempos das cavernas.", role: "ferramenta", place: "Saiu do sótão pré-histórico." },
      { label: "Tablet Dobrável", icon: "📱", desc: "Tela do futuro que dobra como papel.", role: "chave", place: "Saiu da cozinha do futuro." },
      { label: "Pena de Ganso", icon: "🪶", desc: "Pena de escrever dos copistas medievais.", role: "ferramenta", place: "Saiu da sala medieval." },
    ],
    clues: [
      "O Kael pediu licença ao entrar num cômodo enorme, de 8 casas.",
      "A Íris lia três livros num cômodo de 4 casas.",
      "A Lyra não estava na Cozinha do Futuro: lá a música é só bipe.",
      "A Lyra ouvia o Disco de Vinil girando com o dedo.",
      "O Astro segurava a Lamparina de Pedra, curioso com o fogo antigo.",
      "A Íris não segurava o Tablet Dobrável: prefere papel.",
    ],
    ending: "No Sótão Pré-Histórico, a Lyra girava o Disco de Vinil para os homens das cavernas. No Quarto dos Anos 80, a Íris escrevia com a Pena de Ganso, e o Astro acendia a Lamparina de Pedra na cozinha do futuro. O relógio enlouqueceu por causa do Kael: na Sala Medieval, ele mostrou o Tablet Dobrável a um cavaleiro, que pediu um carregador. Cada objeto estava na era errada — e todo mundo adorou.",
  },

  "patches-86": {
    scene: "Na Dimensão do Tempo, uma nave salta entre séculos com uma tripulação curiosa.",
    intro: "Hoje a nave deu um salto que ninguém mandou, e a comandante quer saber quem foi. Descubra em que cômodo da nave cada tripulante estava e o que segurava.",
    people: {
      Gema: { why: "É a chefe da cozinha da nave.", link: "Pega emprestado tudo o que abre potes." },
      Pixel: { why: "Testa o equipamento de emergência.", link: "Mostra um coração na tela quando o capacete serve." },
      Leo: { why: "Pilota por palpite — às vezes acerta.", link: "Procura no painel o que a Flor marcou no atlas." },
      Flor: { why: "Escolhe a próxima era a visitar.", link: "Marca as galáxias com flores." },
    },
    objects: [
      { label: "Atlas das Galáxias", icon: "🗺️", desc: "Livro com o caminho para cada século.", role: "ferramenta", place: "Guardado na Casa de Máquinas." },
      { label: "Chave de Ignição", icon: "🔑", desc: "A chave que liga o motor de salto.", role: "chave", place: "Devia estar no painel — e não estava." },
      { label: "Painel Portátil", icon: "📱", desc: "Tela que pilota a nave de qualquer lugar.", role: "ferramenta", place: "Fica na Ponte de Comando." },
      { label: "Capacete Espacial", icon: "🪖", desc: "Capacete para emergências fora da nave.", role: "distração", place: "Guardado na Cápsula de Fuga." },
    ],
    clues: [
      "A Flor marcou com uma flor a página do Atlas das Galáxias que segurava.",
      "O Pixel segurava o Capacete Espacial, que embaçava a tela.",
      "A Gema não segurava o Painel Portátil: o triângulo de luz atrapalha a tela.",
      "O Leo dava palpites de navegação na Ponte de Comando.",
      "Graxa na flor do cabelo: a Flor estava na Casa de Máquinas.",
      "A Gema não estava na Cápsula de Fuga: odeia lugares apertados.",
    ],
    ending: "Na Ponte de Comando, o Leo pilotava pelo Painel Portátil. A Flor procurava a próxima parada no Atlas das Galáxias, e o Pixel testava o Capacete Espacial na Cápsula de Fuga. O salto foi culpa da Gema: no Refeitório, ela usou a Chave de Ignição para abrir um pote de geleia — e a nave pulou de século. A geleia chegou intacta ao ano 3000.",
  },

  "patches-94": {
    scene: "No Trono do Infinito, uma galeria guarda as lembranças de cada jornada.",
    intro: "Na inauguração, a peça mais rara — o Dado das Jornadas — não estava na vitrine! Descubra em que sala cada curador estava e o que segurava para achar a peça.",
    people: {
      Prisma: { why: "Cuida das pedras preciosas da galeria.", link: "Brilha junto com o diamante." },
      Umbra: { why: "Só aparece para quem venceu as cinco jornadas.", link: "Levou o dado para onde só os campeões chegam." },
      Alva: { why: "Conhece de cor o caminho de cada jornada.", link: "Explica o mapa de olhos fechados." },
      Rocha: { why: "Carrega as peças pesadas da exposição.", link: "Ganhou a medalha do primeiro enigma, há muito tempo." },
    },
    objects: [
      { label: "Diamante Lendário", icon: "💎", desc: "Pedra que muda de cor com quem a segura.", role: "distração", place: "Exposto na Sala dos Mundos." },
      { label: "Mapa das Jornadas", icon: "🗺️", desc: "O caminho dos cinco mundos.", role: "ferramenta", place: "Pendurado na Sala dos Campeões." },
      { label: "Medalha do Primeiro Enigma", icon: "🥇", desc: "A medalha do primeiro enigma resolvido.", role: "presente", place: "Guardada no Mirante." },
      { label: "Dado das Jornadas", icon: "🎲", desc: "Dado com um jogo em cada face.", role: "chave", place: "Devia estar na vitrine da entrada." },
    ],
    clues: [
      "A Alva sorria de olhos fechados num cômodo enorme, de 8 casas.",
      "O brilho do Prisma refletia num cômodo de 4 casas.",
      "O Rocha não estava no Corredor do Infinito: é estreito demais para um gigante.",
      "O Diamante Lendário mudava de cor junto com o Prisma, que o segurava.",
      "A Alva segurava o Mapa das Jornadas — e sabia de cor cada caminho.",
      "O Umbra não segurava a Medalha do Primeiro Enigma.",
    ],
    ending: "Na Sala dos Mundos, o Prisma exibia o Diamante Lendário. A Alva apresentava o Mapa das Jornadas na Sala dos Campeões, e o Rocha guardava a Medalha do Primeiro Enigma no Mirante. O Dado das Jornadas não tinha sumido: o Umbra o levou para o Corredor do Infinito, onde só aparece para quem venceu as cinco jornadas. Agora a peça mais rara da galeria só pode ser vista por quem chegar até o fim.",
  },

  "patches-98": {
    scene: "No Trono do Infinito, a banda dos campeões ensaia a música de encerramento das jornadas.",
    intro: "Na pausa, alguém tocou um solo tão bonito que o produtor quer pôr no show! Descubra em que cômodo cada músico estava e o que segurava para saber quem tocou.",
    people: {
      Kai: { why: "Toca bateria nos mapas que coleciona.", link: "Ensaia no camarim para não atrapalhar a Luna." },
      Ravi: { why: "Toca guitarra escondido de todos.", link: "Só toca quando acha que ninguém está ouvindo." },
      Estela: { why: "É a vocalista da banda.", link: "Canta as músicas que a Luna escreve." },
      Luna: { why: "Compõe a música de encerramento.", link: "Escuta o silêncio entre as notas da Estela." },
    },
    objects: [
      { label: "Baquetas de Cristal", icon: "🥢", desc: "Baquetas que soam como sininhos.", role: "ferramenta", place: "Ficam no Camarim." },
      { label: "Palheta Dourada", icon: "🎸", desc: "Palheta da guitarra dos campeões.", role: "chave", place: "Esquecida em cima do amplificador do Palco." },
      { label: "Microfone sem Fio", icon: "🎤", desc: "Microfone da vocalista.", role: "ferramenta", place: "Testado nos Bastidores." },
      { label: "Partitura de Encerramento", icon: "🎼", desc: "A música final das jornadas.", role: "distração", place: "Escrita no Estúdio." },
    ],
    clues: [
      "A Luna ouvia o silêncio do Estúdio.",
      "A Luna lia a Partitura de Encerramento entre uma nota e outra.",
      "O Kai batucava num mapa com as Baquetas de Cristal.",
      "A Estela não segurava a Palheta Dourada: as unhas dela estavam pintadas de estrela.",
      "As estrelas-brinco da Estela brilhavam nos Bastidores.",
      "O Ravi não estava no Camarim: espelho demais para quem é discreto.",
    ],
    ending: "No Estúdio, a Luna estudava a Partitura de Encerramento. O Kai batucava com as Baquetas de Cristal no Camarim, e a Estela testava o Microfone sem Fio nos Bastidores. O solo misterioso foi do Ravi: sozinho no Palco, ele tocou com a Palheta Dourada achando que ninguém ouvia. Ouviram — e o solo entrou na música de encerramento.",
  },
};
