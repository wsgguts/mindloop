// Narrativas das investigações do Astros (formato em ../narrative.ts).
// Tema do jogo: um céu quadriculado — uma pessoa por linha, coluna e região, e ninguém encosta em ninguém.
import type { Narrative } from "../narrative";

export const ASTROS_NARRATIVES: Record<string, Narrative> = {
  "astros-02": {
    scene: "No Reino Celestial, estrelas cadentes caem num jardim quadriculado e viram flores de luz.",
    intro: "Esta noite caiu a estrela mais brilhante do século, e alguém a guardou antes de todos. Descubra onde cada jardineiro estava e o que segurava para saber quem pegou a estrela.",
    people: {
      Nico: { why: "Estuda por que as estrelas viram flores.", link: "Conta as flores do cesto, uma por uma." },
      Rubro: { why: "Ninguém sabe quem o chamou para a colheita.", link: "Peneira a poeira que as estrelas deixam." },
      Ravi: { why: "Colhe estrelas em silêncio, longe dos outros.", link: "Guardou a estrela mais brilhante sem contar a ninguém." },
      Mel: { why: "Veio colher flores para o cabelo.", link: "Usa luva porque as flores de luz fazem cócegas." },
    },
    objects: [
      { label: "Cesto de Luz", icon: "🧺", desc: "Cesto onde as flores de luz não apagam.", role: "ferramenta", place: "Fica no caminho principal do jardim." },
      { label: "Pote de Vidro Estrelado", icon: "🫙", desc: "Pote que guarda uma estrela inteira.", role: "chave", place: "Esquecido num canteiro escondido." },
      { label: "Luva de Seda", icon: "🧤", desc: "Luva que não sente as cócegas das flores.", role: "ferramenta", place: "Pendurada na cerca do jardim." },
      { label: "Peneira de Poeira Estelar", icon: "🥣", desc: "Peneira que separa a poeira das estrelas.", role: "distração", place: "Usada nos canteiros mais baixos." },
    ],
    clues: [
      "Pegadas vermelhas cruzavam o Canteiro do Sul: era o Rubro.",
      "O Nico ajustou os óculos para contar as flores do Cesto de Luz que segurava.",
      "Um capuz azul foi visto na linha 1: era o Ravi.",
      "Os óculos do Nico refletiam o Caminho de Cristal.",
      "Poeira de estrela no capuz do Rubro: ele segurava a Peneira de Poeira Estelar.",
      "A Mel colhia flores rindo, com a Luva de Seda na mão.",
    ],
    ending: "No Caminho de Cristal, o Nico enchia o Cesto de Luz. O Rubro peneirava o Canteiro do Sul com a Peneira de Poeira Estelar, e a Mel colhia flores com a Luva de Seda. A estrela mais brilhante caiu no Recanto das Nuvens, e o Ravi a guardou no Pote de Vidro Estrelado sem que ninguém visse. Agora ela ilumina o quarto do rei — e ninguém sabe quem a trouxe.",
  },

  "astros-08": {
    scene: "No Reino Celestial, uma nuvem quadriculada vira toalha de piquenique nos fins de semana.",
    intro: "A família se espalhou para ninguém ficar colado, e de repente choveu pipoca! Descubra onde cada um sentou e o que segurava para saber de onde veio a chuva.",
    people: {
      Ayo: { why: "Desceu do Templo para descansar.", link: "Prefere a sombra, para o cabelo não ofuscar ninguém." },
      Pipa: { why: "Investiga se a limonada tem limão de verdade.", link: "Quer interrogar o Pingo sobre a cesta." },
      Pingo: { why: "Trouxe a cesta da vovó.", link: "Senta longe da Pipa para não ser interrogado." },
      Bruma: { why: "Estende a toalha no meio da nuvem.", link: "Deixa tudo um pouquinho úmido." },
    },
    objects: [
      { label: "Jarra de Limonada", icon: "🍋", desc: "Limonada com gelo de nuvem.", role: "ferramenta", place: "Servida no canto mais ensolarado." },
      { label: "Cesta de Piquenique", icon: "🧺", desc: "A cesta da vovó, cheia de sanduíches.", role: "presente", place: "Trazida de casa." },
      { label: "Saco de Pipoca", icon: "🍿", desc: "Pipoca que estoura até depois de pronta.", role: "chave", place: "Comprado na barraca do castelo." },
      { label: "Toalha Xadrez", icon: "🟥", desc: "Toalha quadriculada como a própria nuvem.", role: "distração", place: "Estendida no meio da nuvem." },
    ],
    clues: [
      "O cabelo prateado do Ayo brilhava no Canto da Sombra.",
      "A Pipa sentou na coluna D, de óculos de aventura.",
      "A Toalha Xadrez ficou úmida: era a Bruma quem a segurava.",
      "A sombra do Pingo apareceu na coluna B.",
      "A Pipa segurava a Jarra de Limonada, investigando o gosto.",
      "O Pingo segurava a Cesta de Piquenique, quase do tamanho dele.",
    ],
    ending: "No Centro, a Bruma estendia a Toalha Xadrez. A Pipa servia a Jarra de Limonada no Canto Ensolarado, e o Pingo vigiava a Cesta de Piquenique na Beira da Nuvem. A chuva de pipoca veio do Ayo: no Canto da Sombra, ele abriu o Saco de Pipoca com força demais. O vovô disse que foi o melhor piquenique da vida — e catou pipoca até o jantar.",
  },

  "astros-14": {
    scene: "As fadas da Floresta dos Cristais jogam num tabuleiro gigante desenhado no chão da clareira.",
    intro: "No meio da partida, o sininho da vitória tocou, e a coruja-juíza precisa saber quem ganhou. Descubra onde cada jogador estava e o que segurava.",
    people: {
      Zen: { why: "Joga sem pressa — e quase sempre ganha.", link: "Ficou no meio do tabuleiro a partida inteira." },
      Kael: { why: "Foi convidado pelas fadas por ser educado.", link: "Pede licença antes de cada jogada." },
      Cubo: { why: "Lembra todas as jogadas das partidas antigas.", link: "Faz a varinha piscar com o próprio brilho." },
      Maya: { why: "Anota as jogadas no caderninho roxo.", link: "Guarda a noz mágica que ganhou no ano passado." },
    },
    objects: [
      { label: "Varinha de Fada", icon: "🪄", desc: "Varinha que pisca a cada jogada boa.", role: "ferramenta", place: "Emprestada pelas fadas da clareira." },
      { label: "Pó de Estrela", icon: "✨", desc: "Pó que faz as peças flutuarem.", role: "distração", place: "Colhido no lado do musgo." },
      { label: "Noz Mágica", icon: "🌰", desc: "Prêmio da partida do ano passado.", role: "presente", place: "Guardada na borda do tabuleiro." },
      { label: "Sininho das Fadas", icon: "🔔", desc: "Sininho que só quem vence pode tocar.", role: "chave", place: "Fica no meio do tabuleiro." },
    ],
    clues: [
      "O brilho do Cubo apareceu lá embaixo, na linha 4.",
      "O Cubo segurava a Varinha de Fada, que piscava junto com ele.",
      "O Zen meditava no Centro, sem pressa nenhuma.",
      "A Maya anotava as jogadas na coluna B.",
      "O Kael, educado, pediu licença antes de espalhar o Pó de Estrela que segurava.",
      "A Maya não segurava o Sininho das Fadas: as mãos estavam ocupadas com o caderninho.",
    ],
    ending: "No Lado do Musgo, o Kael espalhava o Pó de Estrela. A Maya guardava a Noz Mágica na Borda, e o Cubo agitava a Varinha de Fada no Lado das Pedras. Quem venceu a partida foi o Zen: sem sair do Centro, ele tocou o Sininho das Fadas na hora certa. A coruja-juíza nem acreditou — ele não tinha dado um passo.",
  },

  "astros-17": {
    scene: "Na Floresta dos Cristais, um favo gigante tem alvéolos quadriculados onde os insetos amigos descansam.",
    intro: "Depois da colheita, a rainha das abelhas provou o mel mais doce do ano e quer agradecer a quem o trouxe. Descubra onde cada visitante estava e o que segurava.",
    people: {
      Umbra: { why: "Ajuda a refrescar o favo com as asas.", link: "Leva orvalho para a rainha." },
      Nox: { why: "Veio de penetra, atrás de algo brilhante.", link: "Ficou dourado de pólen da cabeça aos pés." },
      Lila: { why: "Trouxe mel para a rainha.", link: "Pulou o caminho todo sem derramar uma gota." },
      Sol: { why: "Nunca tinha visto um girassol fora do deserto.", link: "Escolheu a pétala da cor do seu olhar." },
    },
    objects: [
      { label: "Gota de Mel Dourado", icon: "🍯", desc: "O mel mais doce da colheita.", role: "chave", place: "Colhido nas flores mais altas." },
      { label: "Pólen Dourado", icon: "🌼", desc: "Pó amarelo que gruda em tudo.", role: "distração", place: "Espalhado na entrada do favo." },
      { label: "Pétala de Girassol", icon: "🌸", desc: "Pétala grande como um guarda-chuva.", role: "presente", place: "Colhida no Jardim de Flores." },
      { label: "Frasco de Orvalho", icon: "💧", desc: "Orvalho fresquinho para refrescar o favo.", role: "ferramenta", place: "Enchido nas folhas da manhã." },
    ],
    clues: [
      "As asas do Umbra cobriram um alvéolo da linha 2.",
      "O olhar dourado da Sol brilhava entre as flores do Jardim de Flores.",
      "Dois olhos brilhavam na coluna A: era o Nox.",
      "O Umbra segurava o Frasco de Orvalho com a ponta da cauda.",
      "A Sol segurava a Pétala de Girassol, da cor do olhar dela.",
      "A Lila pulava de alegria com a Gota de Mel Dourado nas patas.",
    ],
    ending: "No Favo Sul, o Umbra guardava o Frasco de Orvalho. O Nox espalhava o Pólen Dourado na Entrada, e a Sol trazia a Pétala de Girassol do jardim. A rainha sorriu por causa da Lila: no Favo Norte, ela entregou a Gota de Mel Dourado mais doce do ano. A colmeia fez uma festa — com pulos de coelha e muitos zumbidos.",
  },

  "astros-23": {
    scene: "Na lagoa do Vale das Águas, as vitórias-régias formam uma grade perfeita.",
    intro: "Antes de a garça-maestrina chegar, uma voz começou o concerto sozinha! Descubra onde cada músico estava e o que segurava para saber quem cantou.",
    people: {
      Neve: { why: "Veio ver o concerto e acabou no coro.", link: "Ri do próprio reflexo na lágrima de orvalho." },
      Lyra: { why: "Ouve músicas nas estrelas e canta de ouvido.", link: "Começa a cantar quando a música chama." },
      Orbi: { why: "Ilumina a lagoa para o concerto.", link: "Usa um chapéu de folha para combinar com as orelhas." },
      Cris: { why: "Toca a partitura das rãs.", link: "Reflete a luz do Orbi na água." },
    },
    objects: [
      { label: "Microfone de Junco", icon: "🎤", desc: "Junco oco que aumenta a voz.", role: "chave", place: "Colhido no recanto dos juncos." },
      { label: "Partitura das Rãs", icon: "🎼", desc: "A música que as rãs ensaiaram o ano inteiro.", role: "ferramenta", place: "Guardada perto da cachoeira." },
      { label: "Chapéu de Vitória-Régia", icon: "👒", desc: "Chapéu feito de uma folha da lagoa.", role: "distração", place: "Feito na margem da lagoa." },
      { label: "Lágrima de Orvalho", icon: "💧", desc: "Gota que reflete o rosto de quem olha.", role: "presente", place: "Achada numa folha ao amanhecer." },
    ],
    clues: [
      "A luz do Orbi brilhava na Margem da lagoa.",
      "As orelhas de folha do Orbi saíam do Chapéu de Vitória-Régia que ele segurava.",
      "A Neve segurava a Lágrima de Orvalho, rindo do próprio reflexo.",
      "Reflexos azuis da Cris dançavam na coluna C.",
      "A Lyra não segurava a Partitura das Rãs: ela canta de ouvido.",
      "A música dos fones da Lyra vazava pela coluna A.",
    ],
    ending: "Na Margem, o Orbi ajeitava o Chapéu de Vitória-Régia. A Neve brincava com a Lágrima de Orvalho no Recanto dos Juncos, e a Cris lia a Partitura das Rãs no Canto da Cachoeira. O concerto começou antes da hora porque a Lyra, no Centro da Lagoa, cantou no Microfone de Junco a música que ouviu nas estrelas. A garça-maestrina largou a batuta e foi dançar.",
  },

  "astros-26": {
    scene: "No Vale das Águas, uma piscina natural foi dividida em quadrados para o treino de natação.",
    intro: "Antes da hora, um apito soou e todo mundo pulou na água! Descubra onde cada atleta estava e o que segurava para saber quem apitou.",
    people: {
      Vi: { why: "Veio torcer e contar as estrelas do teto de vidro.", link: "Segura a touca da Alva." },
      Alva: { why: "Nada de olhos fechados, sem errar a raia.", link: "Deixou a touca com a Vi." },
      Rocha: { why: "Está aprendendo a boiar.", link: "Usa a prancha que o Kai emprestou." },
      Kai: { why: "Coleciona mapas de piscinas.", link: "Achou o apito da treinadora no fundo da raia." },
    },
    objects: [
      { label: "Óculos de Natação", icon: "🥽", desc: "Óculos que não embaçam.", role: "ferramenta", place: "Distribuídos na entrada da piscina." },
      { label: "Prancha de Isopor", icon: "🟦", desc: "Prancha que ajuda a boiar.", role: "ferramenta", place: "Guardada na borda da piscina." },
      { label: "Touca de Bolinhas", icon: "🧢", desc: "Touca colorida de natação.", role: "distração", place: "Esquecida na arquibancada." },
      { label: "Apito da Treinadora", icon: "📯", desc: "Apito que dá a largada do treino.", role: "chave", place: "Caiu no fundo da raia rasa." },
    ],
    clues: [
      "A Alva nadava de olhos fechados na Raia Funda.",
      "As pegadas molhadas do Kai saíam da Raia Rasa.",
      "A Vi contava as estrelas do teto na coluna B.",
      "O Rocha segurava a Prancha de Isopor — e mesmo assim afundava.",
      "A Vi segurava a Touca de Bolinhas, com uma bolinha para cada estrela.",
      "A Alva não segurava o Apito da Treinadora.",
    ],
    ending: "Na Raia Funda, a Alva nadava com os Óculos de Natação. O Rocha tentava boiar com a Prancha de Isopor na Borda Norte, e a Vi segurava a Touca de Bolinhas na Arquibancada. O apito antes da hora foi do Kai: na Raia Rasa, ele achou o Apito da Treinadora e quis testar. A treinadora disse que foi a largada mais rápida do ano.",
  },

  "astros-32": {
    scene: "O piso do Templo das Estrelas é um mosaico quadriculado que imita o céu.",
    intro: "Na cerimônia do solstício, o mosaico só brilha quando cada um está no ladrilho certo — e ele brilhou! Descubra onde cada sacerdote estava e o que segurava para saber quem acendeu o mosaico.",
    people: {
      Floco: { why: "Cuida do cristal que acende o mosaico.", link: "Fica longe do incenso do Nimbo para não derreter." },
      Lis: { why: "Sonha em ser sacerdotisa do mar das estrelas.", link: "Segura o tridente que ninguém mais consegue erguer." },
      Theo: { why: "Sabe de cor todas as rezas do solstício.", link: "Lê o livro só para conferir." },
      Nimbo: { why: "Perfuma a cerimônia com incenso.", link: "Muda de cor com a fumaça." },
    },
    objects: [
      { label: "Tridente de Prata", icon: "🔱", desc: "Tridente que aponta para o mar das estrelas.", role: "distração", place: "Fica sobre a constelação da Ursa." },
      { label: "Varetas de Incenso", icon: "🪔", desc: "Incenso que solta fumaça colorida.", role: "ferramenta", place: "Acesas no Altar." },
      { label: "Cristal Estelar", icon: "💠", desc: "Cristal que acende o mosaico inteiro.", role: "chave", place: "Encaixa num ladrilho da Via Láctea." },
      { label: "Livro do Solstício", icon: "📘", desc: "As rezas da noite mais longa.", role: "ferramenta", place: "Guardado na biblioteca do templo." },
    ],
    clues: [
      "Uma nuvenzinha colorida pairava na coluna B: era o Nimbo.",
      "O cristal azul do Floco brilhava sobre a Via Láctea.",
      "A fumaça das Varetas de Incenso mudava de cor junto com o Nimbo, que as segurava.",
      "A Lis segurava o Tridente de Prata, sonhando com o mar das estrelas.",
      "Os brincos de estrela da Lis tilintavam na linha 2.",
      "O Theo não segurava o Cristal Estelar: estava ocupado lembrando as rezas.",
    ],
    ending: "No Altar, o Nimbo acendia as Varetas de Incenso. A Lis erguia o Tridente de Prata na Constelação da Ursa, e o Theo lia o Livro do Solstício na Constelação do Leão. O mosaico brilhou quando o Floco pôs o Cristal Estelar no ladrilho da Via Láctea. Ele ficou tão feliz que quase derreteu.",
  },

  "astros-37": {
    scene: "Atrás do Templo das Estrelas há um jardim de areia desenhado em quadrados perfeitos.",
    intro: "Depois da meditação da tarde, apareceu um poema escrito na ponte, e o mestre quer saber quem o escreveu. Descubra onde cada um estava e o que segurava.",
    people: {
      Vulto: { why: "Ninguém sabe quem o convidou para meditar.", link: "Escreve poemas que ninguém assina." },
      Estela: { why: "Medita ouvindo o vento.", link: "Pendurou o sino para guiar o Broto." },
      Byte: { why: "Desenha ondas na areia.", link: "Cuida das carpas junto com o Broto." },
      Broto: { why: "Medita para ver se cresce mais rápido.", link: "Ilumina o caminho do Byte de volta." },
    },
    objects: [
      { label: "Ancinho de Bambu", icon: "🧹", desc: "Ancinho que desenha ondas na areia.", role: "ferramenta", place: "Encostado perto do lago." },
      { label: "Lanterna de Pedra", icon: "🏮", desc: "Lanterna antiga do jardim.", role: "distração", place: "Fica na varanda de bambu." },
      { label: "Sino de Vento", icon: "🎐", desc: "Sino que toca sozinho com a brisa.", role: "ferramenta", place: "Pendurado sobre a areia ondulada." },
      { label: "Pincel de Caligrafia", icon: "🖌️", desc: "Pincel de tinta preta dos monges.", role: "chave", place: "Guardado na sala de escrita do templo." },
    ],
    clues: [
      "Uma sombra parada na linha 2: era o Vulto.",
      "Folhinhas do Broto caíram na coluna C.",
      "Tinta preta na capa do Vulto: ele segurava o Pincel de Caligrafia.",
      "O Broto segurava a Lanterna de Pedra, quase do tamanho dele.",
      "O broto do Byte balançava na linha 3.",
      "A Estela não segurava o Ancinho de Bambu: ela não risca a areia.",
    ],
    ending: "Na Areia Ondulada, a Estela ouvia o Sino de Vento. O Byte desenhava ondas com o Ancinho de Bambu no Lago das Carpas, e o Broto iluminava a Varanda de Bambu com a Lanterna de Pedra. O poema da ponte foi escrito pelo Vulto, com o Pincel de Caligrafia: “Quem medita, encontra.” O mestre leu, meditou — e encontrou os óculos que tinha perdido.",
  },

  "astros-44": {
    scene: "No Deserto dos Segredos, observadores montaram um acampamento quadriculado para ver um eclipse raro.",
    intro: "Só uma foto do eclipse saiu perfeita, e o organizador quer saber de quem é. Descubra onde cada observador estava e o que segurava.",
    people: {
      Eco: { why: "Ouve música enquanto espera o eclipse.", link: "Divide os óculos com o Astro." },
      Nina: { why: "Montou o telescópio de olhos fechados.", link: "Escolheu o lote junto do oásis." },
      Leo: { why: "Tem um palpite sobre o segundo exato do eclipse.", link: "Apostou com o Astro — e ganhou." },
      Astro: { why: "Mapeia o céu do deserto.", link: "Serve chá para todos enquanto espera." },
    },
    objects: [
      { label: "Óculos de Eclipse", icon: "🕶️", desc: "Óculos escuríssimos para olhar o sol.", role: "ferramenta", place: "Distribuídos no acampamento." },
      { label: "Telescópio Portátil", icon: "🔭", desc: "Telescópio que cabe numa mochila.", role: "ferramenta", place: "Montado perto do oásis." },
      { label: "Chaleira de Cobre", icon: "🫖", desc: "Chá quente para a noite fria do deserto.", role: "distração", place: "Esquenta nas pedras do acampamento." },
      { label: "Câmera com Filtro Solar", icon: "📷", desc: "Câmera que fotografa o sol sem queimar.", role: "chave", place: "Trazida pelo palpiteiro do grupo." },
    ],
    clues: [
      "O Leo palpitou que a melhor vista era do Lote da Duna — e ficou lá.",
      "Os passos de robô do Astro pararam na linha 2.",
      "A Nina não estava na coluna C: dali a tenda tapa o céu.",
      "A Nina montou de olhos fechados o Telescópio Portátil que segurava.",
      "O Eco segurava os Óculos de Eclipse por cima do fone.",
      "O Astro não segurava a Câmera com Filtro Solar: ele grava tudo na memória.",
    ],
    ending: "No Lote do Camelo, o Eco olhava o céu pelos Óculos de Eclipse. A Nina mirava o Telescópio Portátil no Lote do Oásis, e o Astro servia chá da Chaleira de Cobre no Lote das Pedras. A única foto perfeita foi do Leo: no Lote da Duna, ele apertou a Câmera com Filtro Solar no segundo certo. Pela primeira vez, todo mundo concordou com o palpite dele.",
  },

  "astros-48": {
    scene: "No Deserto dos Segredos, um tabuleiro gigante é desenhado na areia para o campeonato da caravana.",
    intro: "Na final, alguém fez a última jogada tão rápido que ninguém viu! Descubra onde cada participante estava e o que segurava para saber quem venceu.",
    people: {
      Kika: { why: "Torce pela Faísca, a amiga mais rápida.", link: "Agita o lenço a cada jogada." },
      Faísca: { why: "Joga damas como pilota: rápido demais.", link: "Ouviu a torcida da Kika e acelerou." },
      Luna: { why: "É a árbitra que escuta a areia cair.", link: "Conta o tempo de cada jogada." },
      Jade: { why: "Veio assistir de balão e desceu para o chá.", link: "Fica na sombra para os óculos não esquentarem." },
    },
    objects: [
      { label: "Peça de Dama Branca", icon: "⚪", desc: "A última peça do tabuleiro.", role: "chave", place: "Fica no meio do tabuleiro." },
      { label: "Ampulheta do Árbitro", icon: "⏳", desc: "Mede o tempo de cada jogada.", role: "ferramenta", place: "Fica na beira da tenda do árbitro." },
      { label: "Copinho de Chá de Menta", icon: "🍵", desc: "Chá doce da caravana.", role: "presente", place: "Servido à sombra." },
      { label: "Lenço de Torcida", icon: "🧣", desc: "Lenço colorido para agitar.", role: "distração", place: "Vendido na feira da caravana." },
    ],
    clues: [
      "A Luna escutava o silêncio na Beira da Tenda.",
      "Uma bola de chiclete estourou na linha 3: era a Kika.",
      "A Faísca não estava na coluna C: ela nunca anda devagar, e ali a areia é fofa.",
      "A Luna segurava a Ampulheta do Árbitro, ouvindo a areia cair.",
      "A Faísca segurava a Peça de Dama Branca, pronta para a última jogada.",
      "A Jade bebia do Copinho de Chá de Menta que segurava.",
    ],
    ending: "No Centro, a Faísca fez a última jogada com a Peça de Dama Branca e venceu o campeonato. A Luna marcava o tempo com a Ampulheta do Árbitro na Beira da Tenda, e a Jade tomava o Copinho de Chá de Menta no Lado da Sombra. No Lado do Sol, a Kika agitava o Lenço de Torcida. A jogada foi tão rápida que o árbitro pediu replay.",
  },

  "astros-53": {
    scene: "Nas Montanhas do Dragão, uma dragoa pôs ovos num ninho de pedra em forma de grade.",
    intro: "Os cuidadores se espalharam sem esbarrar uns nos outros, e o primeiro ovo chocou — o filhote seguiu uma pessoa como se fosse a mãe! Descubra onde cada cuidador estava e o que segurava para saber quem foi adotado.",
    people: {
      Lina: { why: "Canta para os ovos não sentirem frio.", link: "Escova os ovos no ritmo da música." },
      Chip: { why: "Guarda na memória a temperatura de cada ovo.", link: "Cobre os ovos que o Rio mede." },
      Rio: { why: "Mede o calor do ninho com calma.", link: "Avisa o Chip quando um ovo esfria." },
      Prisma: { why: "Ilumina a trilha para o dragão-pai.", link: "Brilha forte quando o pai chega." },
    },
    objects: [
      { label: "Cobertor de Lã", icon: "🧶", desc: "Cobertor que mantém os ovos quentinhos.", role: "ferramenta", place: "Fica na gruta quente." },
      { label: "Termômetro de Ovo", icon: "🌡️", desc: "Mede se o ovo está quente o bastante.", role: "ferramenta", place: "Pendurado na beira do ninho." },
      { label: "Escova Macia", icon: "🪥", desc: "Escova para limpar as cascas sem arranhar.", role: "chave", place: "Fica no ninho alto." },
      { label: "Lanterna de Cristal", icon: "🔦", desc: "Lanterna que não assusta dragões.", role: "distração", place: "Usada na trilha de pedra." },
    ],
    clues: [
      "A cantoria da Lina vinha da coluna B.",
      "O brilho do Prisma iluminava a Trilha de Pedra.",
      "O Chip não estava na coluna D: a memória dele esquenta perto do penhasco.",
      "A Lina escovava os ovos cantarolando, com a Escova Macia na mão.",
      "O Rio media a temperatura com calma no Termômetro de Ovo.",
      "O Chip não segurava a Lanterna de Cristal: os olhos dele já iluminam.",
    ],
    ending: "Na Trilha de Pedra, o Prisma iluminava o caminho com a Lanterna de Cristal. O Chip cobria os ovos com o Cobertor de Lã na Gruta Quente, e o Rio media o calor com o Termômetro de Ovo. O primeiro ovo chocou enquanto a Lina o escovava com a Escova Macia, no Ninho Alto — e o filhote achou que ela era a mãe. Agora ele só dorme ouvindo a cantoria dela.",
  },

  "astros-58": {
    scene: "Escoteiros acamparam num platô quadriculado das Montanhas do Dragão, cada barraca num quadrado.",
    intro: "No meio da noite, o dragão roncou alto, e alguém o fez dormir de novo! Descubra onde cada escoteiro estava e o que segurava para saber quem acalmou o dragão.",
    people: {
      Flor: { why: "Veio colher uma flor do platô para o cabelo.", link: "Dormiu antes de todo mundo." },
      Drako: { why: "Protege o acampamento do vento gelado.", link: "Conhece o dragão do pico desde pequeno." },
      Dante: { why: "Conta histórias das Montanhas do Dragão.", link: "Sabe a história favorita do dragão." },
      Marina: { why: "Organiza o acampamento em equilíbrio.", link: "Divide a sopa com o Drako." },
    },
    objects: [
      { label: "Barraca Dobrável", icon: "⛺", desc: "Barraca que se monta sozinha — às vezes.", role: "distração", place: "Montada no platô." },
      { label: "Lanterna de Acampamento", icon: "🔦", desc: "Lanterna que faz sombras na pedra.", role: "chave", place: "Fica perto da água, para todos acharem." },
      { label: "Saco de Dormir", icon: "🛌", desc: "Saco de dormir quentinho.", role: "ferramenta", place: "Estendido no lado norte do platô." },
      { label: "Marmita de Sopa", icon: "🍱", desc: "Sopa quente para a noite fria.", role: "presente", place: "Preparada na beira do penhasco." },
    ],
    clues: [
      "A voz do Dante contava histórias perto da Fonte.",
      "A Marina equilibrava a barraca na linha 2.",
      "A Flor não estava no Platô Sul: lá o vento leva as flores do cabelo.",
      "O Dante segurava a Lanterna de Acampamento para fazer sombras de dragão.",
      "O Drako segurava a Barraca Dobrável, que não queria desdobrar.",
      "A Marina não segurava o Saco de Dormir: ela nem tinha deitado.",
    ],
    ending: "No Platô Norte, a Flor dormia no Saco de Dormir. O Drako brigava com a Barraca Dobrável no Platô Sul, e a Marina dividia a Marmita de Sopa na Beira do Penhasco. Quando o dragão roncou, o Dante acendeu a Lanterna de Acampamento perto da Fonte e contou uma história de ninar. O dragão dormiu de novo — e a turma também.",
  },

  "astros-63": {
    scene: "No salão quadriculado do Reino das Auroras, os dançarinos começam o baile em ladrilhos que não se encostam.",
    intro: "No meio da valsa, a música parou e todos congelaram! Descubra onde cada dançarino estava e o que segurava para saber quem interrompeu a orquestra.",
    people: {
      Gelo: { why: "Veio dançar, mas sente calor no salão.", link: "Pegou o leque emprestado da orquestra." },
      Íris: { why: "Dança lendo três livros ao mesmo tempo.", link: "Ganhou a rosa de cristal na entrada." },
      Pixel: { why: "Acena para todo mundo lá de fora.", link: "Mostra um coração na tela para cada dança." },
      Gema: { why: "Prefere a mesa de doces à pista.", link: "Usa máscara para ninguém ver o doce na boca." },
    },
    objects: [
      { label: "Leque de Plumas", icon: "🪭", desc: "Leque que faz vento de verdade.", role: "chave", place: "Pertence à orquestra." },
      { label: "Máscara de Baile", icon: "🎭", desc: "Máscara bordada com auroras.", role: "distração", place: "Distribuída na entrada." },
      { label: "Rosa de Cristal", icon: "🌹", desc: "Rosa que brilha com a aurora.", role: "presente", place: "Dada a quem abre a valsa." },
      { label: "Lenço Brilhante", icon: "🧣", desc: "Lenço para acenar aos dançarinos.", role: "ferramenta", place: "Fica na varanda do salão." },
    ],
    clues: [
      "O Pixel acenava com o Lenço Brilhante, com um coração na tela.",
      "O triângulo de luz da Gema brilhou na linha 3.",
      "A Íris dançava lendo três livros na coluna A.",
      "O Pixel não estava no Canto da Orquestra: a música alta embaralha a tela.",
      "Penas no focinho do Gelo: ele segurava o Leque de Plumas.",
      "A Gema não segurava a Rosa de Cristal: estava ocupada com os doces.",
    ],
    ending: "Na Pista Central, a Íris dançava com a Rosa de Cristal. O Pixel acenava com o Lenço Brilhante na Varanda, e a Gema escondia o rosto com a Máscara de Baile na Mesa de Doces. A música parou por causa do Gelo: no Canto da Orquestra, ele se abanou com o Leque de Plumas e as partituras voaram. A aurora mudou de cor de tanto rir.",
  },

  "astros-67": {
    scene: "No Reino das Auroras, um lago congelado foi riscado em quadrados para o torneio de curling.",
    intro: "No último lance, a pedra parou exatamente no centro do alvo! Descubra onde cada jogador estava e o que segurava para saber quem guiou a pedra.",
    people: {
      Davi: { why: "Repara em cada risquinho do gelo.", link: "Varreu o caminho da pedra do Ritmo." },
      Cogu: { why: "Veio torcer, tímido, de cachecol.", link: "Brilha um pouquinho para iluminar o gelo." },
      Ritmo: { why: "Lança a pedra no ritmo da música.", link: "Confia na vassourinha do Davi." },
      Musgo: { why: "Marca os pontos lá de cima.", link: "Anotou o ponto da vitória." },
    },
    objects: [
      { label: "Pedra de Curling", icon: "🥌", desc: "Pedra lisa que desliza no gelo.", role: "distração", place: "Lançada do banco dos times." },
      { label: "Vassourinha de Curling", icon: "🧹", desc: "Vassoura que guia a pedra.", role: "chave", place: "Usada perto do alvo." },
      { label: "Cachecol de Tricô", icon: "🧣", desc: "Cachecol para os torcedores friorentos.", role: "presente", place: "Vendido na entrada do lago." },
      { label: "Placar de Giz", icon: "📋", desc: "Quadro onde se marcam os pontos.", role: "ferramenta", place: "Pendurado na arquibancada." },
    ],
    clues: [
      "O brilho do Cogu apareceu, tímido, na coluna D.",
      "A batida do Ritmo vinha da linha 4.",
      "O Ritmo marcava o compasso na coluna B.",
      "O Musgo não estava no Alvo: os pelos dele grudam no gelo.",
      "O Musgo anotava os pontos no Placar de Giz que segurava.",
      "O Davi segurava a Vassourinha de Curling e reparava em cada risquinho do gelo.",
      "O Cogu não segurava a Pedra de Curling: pesada demais para um cogumelo.",
    ],
    ending: "Na Arquibancada, o Musgo marcava os pontos no Placar de Giz. O Ritmo lançava a Pedra de Curling do Banco dos Times, e o Cogu se esquentava com o Cachecol de Tricô no Corredor de Gelo. A pedra parou bem no centro porque o Davi varreu o caminho com a Vassourinha de Curling, desviando de cada risquinho. O juiz deu a vitória ao time — e o Davi ganhou o apelido de “Olho de Águia”.",
  },

  "astros-72": {
    scene: "A Cidade Perdida foi construída em ruas que se cruzam como um tabuleiro.",
    intro: "Exploradores se espalharam pelos quarteirões atrás de um tesouro, e alguém o achou! Descubra onde cada explorador estava e o que segurava para saber quem encontrou o tesouro.",
    people: {
      Quartzo: { why: "Divide a cidade em regiões para a busca.", link: "Seguiu o apito do detector." },
      Nico: { why: "Cava onde os óculos mandam.", link: "Emprestou o mapa ao Ravi." },
      Rubro: { why: "Ninguém sabe quem o chamou para a busca.", link: "Evita os lugares cheios de gente." },
      Ravi: { why: "Vigia a cidade lá do alto.", link: "Lê o mapa que o Nico emprestou." },
    },
    objects: [
      { label: "Mapa da Cidade Antiga", icon: "🗺️", desc: "Mapa das ruas de mil anos atrás.", role: "ferramenta", place: "Achado no arquivo da cidade." },
      { label: "Picareta de Explorador", icon: "⛏️", desc: "Picareta leve para cavar com cuidado.", role: "distração", place: "Trazida pelo grupo de exploradores." },
      { label: "Detector de Metal", icon: "📡", desc: "Apita em cima de qualquer metal.", role: "chave", place: "Emprestado pelos arqueólogos." },
      { label: "Cantil de Bronze", icon: "🫗", desc: "Cantil antigo, ainda inteiro.", role: "ferramenta", place: "Achado perto dos templos." },
    ],
    clues: [
      "O Rubro bebia do Cantil de Bronze, escondido no capuz.",
      "O Nico ajustou os óculos na linha 1.",
      "Um capuz azul espiava do alto da Muralha: era o Ravi.",
      "O chão da linha 4 rachou com o peso do Quartzo.",
      "O Rubro não estava no Mercado: lá todo mundo repara no capuz vermelho.",
      "O Detector de Metal apitava nas mãos do Quartzo.",
      "O Nico não segurava o Mapa da Cidade Antiga: estava ocupado cavando.",
    ],
    ending: "No Bairro dos Templos, o Rubro descansava com o Cantil de Bronze. O Nico cavava o Mercado com a Picareta de Explorador, e o Ravi estudava o Mapa da Cidade Antiga na Muralha. O tesouro foi achado pelo Quartzo: na Praça das Fontes, o Detector de Metal apitou em cima de uma moeda gigante. Era uma tampa de bueiro — mas uma tampa de bueiro muito antiga.",
  },

  "astros-76": {
    scene: "Uma vez por ano, a Cidade Perdida se enche de lanternas, cada uma acesa num quadrado da praça.",
    intro: "Este ano, o sino tocou antes da hora, e todas as lanternas subiram de uma vez! Descubra onde cada um estava e o que segurava para saber quem tocou o sino.",
    people: {
      Mel: { why: "Sempre tem uma ideia nova — e testa na hora.", link: "Achou o sino do festival numa barraca." },
      Ayo: { why: "Acende as velas do festival.", link: "Fica longe das lanternas para não ofuscá-las." },
      Pipa: { why: "Escreve desejos nas fitas.", link: "Desejou descobrir quem toca o sino todo ano." },
      Pingo: { why: "Solta a maior lanterna do festival.", link: "Quase saiu voando junto com ela." },
    },
    objects: [
      { label: "Lanterna Voadora", icon: "🏮", desc: "Lanterna de papel que sobe sozinha.", role: "distração", place: "Solta da ponte antiga." },
      { label: "Vela de Lavanda", icon: "🕯️", desc: "Vela que acende as lanternas.", role: "ferramenta", place: "Acesa na praça das colunas." },
      { label: "Fita de Desejos", icon: "🎀", desc: "Fita onde se escreve um desejo.", role: "presente", place: "Amarrada nas lanternas da rua do templo." },
      { label: "Sino do Festival", icon: "🔔", desc: "Sino que manda soltar as lanternas.", role: "chave", place: "Vendido por engano numa barraca." },
    ],
    clues: [
      "A risada da Mel ecoou na linha 3.",
      "O Pingo segurava a Lanterna Voadora, maior que ele.",
      "A sombra do Pingo apareceu na coluna B.",
      "O Ayo não estava na coluna C: o cabelo prateado ofuscaria as lanternas.",
      "A Pipa amarrou um desejo na Fita de Desejos que segurava.",
      "A Mel não segurava a Vela de Lavanda: tinha uma ideia melhor nas mãos.",
    ],
    ending: "Na Ponte Antiga, o Pingo segurava a Lanterna Voadora. O Ayo acendia a Vela de Lavanda na Praça das Colunas, e a Pipa amarrava a Fita de Desejos na Rua do Templo. As lanternas subiram antes da hora porque a Mel, no Mercado, tocou o Sino do Festival só para ver o que acontecia. Aconteceu o festival mais bonito de todos — com dez minutos de adiantamento.",
  },

  "astros-84": {
    scene: "Na Dimensão do Tempo, um tabuleiro gigante congela quem pisa nele quando o relógio bate.",
    intro: "Viajantes de eras diferentes ficaram parados em casas distintas, até que alguém fez o tempo voltar a andar. Descubra onde cada viajante estava e o que segurava para saber quem os libertou.",
    people: {
      Bruma: { why: "Veio do presente para ver o passado.", link: "Segurou o escudo para proteger o Zen." },
      Zen: { why: "Nem percebeu que estava congelado.", link: "Continuou olhando o horizonte." },
      Kael: { why: "Pediu licença ao tabuleiro antes de pisar.", link: "Achou a bateria do Cubo caída na borda." },
      Cubo: { why: "Veio do futuro com um capacete novo.", link: "Perdeu a bateria na borda do tabuleiro." },
    },
    objects: [
      { label: "Escudo Romano", icon: "🛡️", desc: "Escudo de um soldado de dois mil anos atrás.", role: "distração", place: "Caiu de um portal do passado." },
      { label: "Capacete Robótico", icon: "🪖", desc: "Capacete que fala as horas.", role: "ferramenta", place: "Veio da casa do futuro." },
      { label: "Luneta de Navegador", icon: "🔭", desc: "Luneta dos antigos navegantes.", role: "ferramenta", place: "Achada na casa do passado." },
      { label: "Bateria do Futuro", icon: "🔋", desc: "Bateria que dá corda até no tempo.", role: "chave", place: "Caiu do capacete do Cubo." },
    ],
    clues: [
      "O cabelo branco do Kael congelou na linha 3.",
      "O Cubo segurava o Capacete Robótico, que piscava junto com ele.",
      "O brilho do Cubo iluminava a Casa do Futuro.",
      "A Bruma não estava na coluna B.",
      "O Zen olhava o horizonte sem pressa pela Luneta de Navegador.",
      "O Kael não segurava o Escudo Romano: espadachim educado não se esconde.",
    ],
    ending: "Na Casa do Passado, o Zen congelou olhando pela Luneta de Navegador. A Bruma ficou parada na Faixa do Presente com o Escudo Romano, e o Cubo, na Casa do Futuro, com o Capacete Robótico. Quem libertou todo mundo foi o Kael: na Borda do Tempo, ele ligou a Bateria do Futuro no relógio de torre, e o tempo voltou a andar. Ele ainda pediu desculpas ao relógio pela demora.",
  },

  "astros-88": {
    scene: "Na Dimensão do Tempo, uma família de várias épocas se reuniu para uma foto num estúdio quadriculado.",
    intro: "Cada um ficou num quadrado sem encostar no outro, e a foto saiu — mas o fotógrafo jura que não apertou o botão! Descubra onde cada um estava e o que segurava para saber quem tirou a foto.",
    people: {
      Maya: { why: "Anota a pose de cada parente no caderninho.", link: "Controla o tempo da foto pelo relógio." },
      Umbra: { why: "Trouxe a vovó em holograma.", link: "Segura a vovó com a ponta da asa." },
      Nox: { why: "Só aparece nas fotos — nunca na hora de posar.", link: "Folheia o álbum procurando a si mesmo." },
      Lila: { why: "Pulou de alegria na hora da foto.", link: "Achou a câmera antiga e não resistiu." },
    },
    objects: [
      { label: "Câmera Antiga", icon: "📷", desc: "Câmera de fole de um século atrás, com um botão enorme.", role: "chave", place: "Esquecida pelo fotógrafo." },
      { label: "Relógio de Bolso", icon: "⌚", desc: "Relógio que marca a hora de todas as eras.", role: "ferramenta", place: "Fica no estúdio." },
      { label: "Holograma da Vovó", icon: "💠", desc: "A vovó, em luz, direto do ano 3000.", role: "presente", place: "Trazido do futuro." },
      { label: "Álbum de Família", icon: "📔", desc: "Fotos de todas as eras da família.", role: "distração", place: "Guardado no ano 3000." },
    ],
    clues: [
      "Dois olhos brilhavam no Ano 3000: era o Nox.",
      "A Maya anotava a pose de cada um na linha 1.",
      "A Lila não estava no Ano 1900: lá não se pode pular.",
      "O Umbra segurava o Holograma da Vovó com a ponta da asa.",
      "A Maya marcava o tempo da pose no Relógio de Bolso.",
      "O Nox não segurava a Câmera Antiga: ele estava na foto, não atrás dela.",
    ],
    ending: "No Ano 3000, o Nox folheava o Álbum de Família. A Maya conferia o Relógio de Bolso no Estúdio, e o Umbra segurava o Holograma da Vovó no Ano 1900. Quem tirou a foto foi a Lila: no Ano 2000, ela apertou a Câmera Antiga no meio de um pulo. A foto saiu tremida, com o Nox na frente de todos — e virou a favorita da família.",
  },

  "astros-93": {
    scene: "No céu sobre o Trono do Infinito, os grandes campeões viraram estrelas de uma constelação nova.",
    intro: "Cada estrela carrega o símbolo de um jogo, e a constelação só acende quando todas estão no lugar, sem encostar umas nas outras. Descubra onde cada estrela estava e que símbolo carregava para saber quem acendeu a última.",
    people: {
      Sol: { why: "Virou estrela depois de atravessar o deserto.", link: "Traça trilhas no céu, como no Zip." },
      Neve: { why: "Ri alto quando os números se encaixam.", link: "Carrega a estrela do jogo das regiões." },
      Lyra: { why: "Ouve a música da constelação.", link: "Escolheu a estrela dos retalhos." },
      Orbi: { why: "Ilumina o halo da constelação.", link: "Equilibra a estrela do Cristal e do Orbe — quase o nome dele." },
    },
    objects: [
      { label: "Estrela do Sudoku", icon: "🎲", desc: "Estrela com quatro regiões perfeitas.", role: "ferramenta", place: "Brilha no núcleo da constelação." },
      { label: "Estrela do Zip", icon: "〰️", desc: "Estrela que deixa uma trilha no céu.", role: "chave", place: "A última a acender, no braço do sul." },
      { label: "Estrela do Tango", icon: "⚖️", desc: "Estrela metade Cristal, metade Orbe.", role: "distração", place: "Gira no halo." },
      { label: "Estrela do Patches", icon: "🧩", desc: "Estrela feita de retalhos de luz.", role: "presente", place: "Costurada no braço do norte." },
    ],
    clues: [
      "A Neve segurava a Estrela do Sudoku, rindo do encaixe perfeito.",
      "O olhar dourado da Sol brilhou na linha 4.",
      "A Sol desenhou o seu caminho na coluna C.",
      "A risada da Neve ecoou na coluna D.",
      "O Orbi não estava no Braço do Norte: lá a luz dele some.",
      "A Sol segurava a Estrela do Zip, traçando uma trilha no céu.",
      "A Lyra não segurava a Estrela do Tango: ela ouve outra música.",
    ],
    ending: "No Núcleo, a Neve acendeu a Estrela do Sudoku. A Lyra brilhava com a Estrela do Patches no Braço do Norte, e o Orbi equilibrava a Estrela do Tango no Halo. A última a acender foi a Estrela do Zip, da Sol, lá no Braço do Sul — e a constelação ficou completa. A astrônoma real a batizou de “Os Astros”, o quinto jogo do céu.",
  },

  "astros-97": {
    scene: "Na festa de encerramento do Trono do Infinito, a pista de dança é um piso quadriculado que acende a cada passo.",
    intro: "No meio da música, as luzes congelaram! Descubra onde cada dançarino estava e o que segurava para saber quem travou as luzes.",
    people: {
      Cris: { why: "Reflete a luz de quem chega perto.", link: "Ficou com o globo porque brilha junto." },
      Vi: { why: "Conta as estrelas do teto.", link: "Pegou o fone da Cris emprestado." },
      Alva: { why: "Dança de olhos fechados sem errar um passo.", link: "Foi coroada rainha da pista." },
      Rocha: { why: "Fala pouco e dança menos ainda.", link: "Joga confete para animar a Alva." },
    },
    objects: [
      { label: "Globo de Espelhos", icon: "🪩", desc: "Globo que espalha luz por toda a pista.", role: "chave", place: "Pendurado sobre o palco do DJ." },
      { label: "Coroa de Luz", icon: "👑", desc: "Coroa da rainha da pista.", role: "presente", place: "Entregue no meio da pista." },
      { label: "Fone de Ouvido Estrelado", icon: "🎧", desc: "Fone que toca a música das estrelas.", role: "distração", place: "Emprestado na varanda." },
      { label: "Saco de Confete", icon: "🎊", desc: "Confete brilhante para a festa.", role: "ferramenta", place: "Guardado no canto das luzes." },
    ],
    clues: [
      "O Rocha, que fala pouco, dançava quieto no Canto das Luzes.",
      "A Vi contava as estrelas do teto na coluna A.",
      "A Cris não estava na Pista Central: lá ninguém vê o reflexo dela.",
      "O Rocha segurava o Saco de Confete — e jogava um papelzinho de cada vez.",
      "A Alva dançava de olhos fechados com a Coroa de Luz.",
      "A Cris não segurava o Fone de Ouvido Estrelado.",
    ],
    ending: "No Canto das Luzes, o Rocha jogava o Saco de Confete, um papelzinho por vez. A Vi ouvia o Fone de Ouvido Estrelado na Varanda Estelar, e a Alva dançava com a Coroa de Luz na Pista Central. As luzes congelaram por causa da Cris: no Palco do DJ, ela girou o Globo de Espelhos tão rápido que o reflexo cegou o painel. O DJ religou tudo e tocou a música mais animada das jornadas.",
  },
};
