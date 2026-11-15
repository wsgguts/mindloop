// Astros (jogo bônus) — investigações de "Céu": um lugar quadriculado 4×4 com exatamente uma pessoa em cada linha,
// coluna e região, e ninguém encostado em ninguém, nem na diagonal (as regras dos astros). As pistas falam de
// DISTÂNCIA em passos (a 2 passos = o mais perto permitido). Uma história por capítulo, no mundo daquele capítulo.

import type { Ent } from "../model";
import type { Story } from "../story";

const F = "f" as const, M = "m" as const;
const e = (label: string, g: "m" | "f", icon?: string): Ent => (icon ? { label, g, icon } : { label, g });

const ASTROS_A: Story[] = [
  {
    key: "jardim-cadentes", title: "O jardim das estrelas cadentes", universe: "astronomia", tone: "encanto",
    intro: "No Reino Celestial, estrelas cadentes caem num jardim quadriculado e viram flores de luz. Os jardineiros noturnos correram para colhê-las, e cada um parou num canteiro diferente.",
    goal: "Em que canteiro estava cada jardineiro, e com o quê?",
    ending: "Colheita registrada. {com:Cesto de Luz} levou o cesto mais cheio para o castelo.",
    objects: [e("Cesto de Luz", M, "🧺"), e("Pote de Vidro", M, "🫙"), e("Luva de Seda", F, "🧤"), e("Peneira", F, "🥣")],
    rooms: [e("Canteiro do Norte", M), e("Canteiro do Sul", M), e("Caminho de Cristal", M), e("Recanto das Nuvens", M)],
    blocks: [e("Árvore de Nuvem", F, "☁️"), e("Fonte", F, "⛲"), e("Arco de Flores", M, "🌸")],
    seats: [e("Banquinho", M, "🪑"), e("Pedra Brilhante", F, "💎")],
  },
  {
    key: "tabuleiro-fadas", title: "O tabuleiro das fadas", universe: "magia", tone: "humor",
    intro: "As fadas da Floresta dos Cristais jogam num tabuleiro gigante desenhado no chão da clareira. No meio da partida, uma brisa apagou as marcas, e a coruja-juíza precisa reposicionar cada jogador.",
    goal: "Em que casa do tabuleiro estava cada jogador, e com o quê?",
    ending: "Partida retomada. No fim, {com:Varinha} venceu com um último movimento brilhante.",
    objects: [e("Varinha", F, "🪄"), e("Pó Brilhante", M, "✨"), e("Noz Mágica", F, "🌰"), e("Sininho", M, "🔔")],
    rooms: [e("Lado do Musgo", M), e("Lado das Pedras", M), e("Centro", M), e("Borda", F)],
    blocks: [e("Cogumelo Gigante", M, "🍄"), e("Cristal Torto", M, "💎"), e("Toca", F, "🕳️")],
    seats: [e("Folha Larga", F, "🍃"), e("Flor-Assento", F, "🌼")],
  },
  {
    key: "lagoa-vitorias", title: "O concerto das vitórias-régias", universe: "natureza", tone: "curiosidade",
    intro: "Na lagoa do Vale das Águas, as vitórias-régias formam uma grade perfeita. Os músicos da lagoa pularam cada um para uma folha antes do concerto, e a garça-maestrina quer saber quem ficou onde.",
    goal: "Em que folha da lagoa estava cada músico, e com o quê?",
    ending: "Concerto salvo. {com:Microfone de Junco} cantou tão bem que a lagoa inteira coaxou junto.",
    objects: [e("Microfone de Junco", M, "🎤"), e("Partitura", F, "🎼"), e("Chapéu de Flor", M, "👒"), e("Gota de Orvalho", F, "💧")],
    rooms: [e("Margem", F), e("Centro da Lagoa", M), e("Recanto dos Juncos", M), e("Canto da Cachoeira", M)],
    blocks: [e("Pedra", F, "🪨"), e("Tronco", M, "🪵"), e("Ninho de Garça", M, "🪺")],
    seats: [e("Vitória-Régia Grande", F, "🪷"), e("Flor de Lótus", F, "🌸")],
  },
  {
    key: "mosaico-templo", title: "O mosaico do solstício", universe: "astronomia", tone: "misterio",
    intro: "O piso do Templo das Estrelas é um mosaico quadriculado que imita o céu. Na cerimônia do solstício, cada sacerdote ficou sobre um ladrilho, e o mosaico só brilha se as posições forem anotadas sem erro.",
    goal: "Em que ladrilho estava cada sacerdote, e com o quê?",
    ending: "O mosaico brilhou inteiro. {com:Cristal Estelar} colocou o cristal no centro, e o céu do templo se acendeu.",
    objects: [e("Tridente", M, "🔱"), e("Incenso", M, "🪔"), e("Cristal Estelar", M, "💠"), e("Livro dos Astros", M, "📘")],
    rooms: [e("Constelação da Ursa", F), e("Constelação do Leão", F), e("Via Láctea", F), e("Altar", M)],
    blocks: [e("Coluna", F, "🏛️"), e("Estátua da Coruja", F, "🦉"), e("Braseiro", M, "♨️")],
    seats: [e("Almofada", F, "🟪"), e("Degrau", M, "🪜")],
  },
  {
    key: "eclipse-deserto", title: "O eclipse sobre as dunas", universe: "exploracao", tone: "aventura",
    intro: "No Deserto dos Segredos, onde o céu é mais limpo, observadores montaram um acampamento quadriculado para ver um eclipse raro. Cada um escolheu um lote, e o organizador precisa do mapa.",
    goal: "Em que lote estava cada observador, e com o quê?",
    ending: "Mapa entregue. No instante do eclipse, {com:Câmera} fez a foto que virou capa do jornal.",
    objects: [e("Óculos de Eclipse", M, "🕶️"), e("Telescópio Portátil", M, "🔭"), e("Garrafa de Chá", F, "🫖"), e("Câmera", F, "📷")],
    rooms: [e("Lote da Duna", M), e("Lote do Oásis", M), e("Lote das Pedras", M), e("Lote do Camelo", M)],
    blocks: [e("Cacto", M, "🌵"), e("Tenda Grande", F, "⛺"), e("Camelo Deitado", M, "🐪")],
    seats: [e("Tapete", M, "🟥"), e("Cadeira de Lona", F, "🪑")],
  },
  {
    key: "ninho-pedra", title: "O ninho quadriculado da dragoa", universe: "natureza", tone: "suspense",
    intro: "Nas Montanhas do Dragão, uma dragoa pôs ovos num ninho de pedra em forma de grade. Os cuidadores se posicionaram para aquecê-lo sem esbarrar uns nos outros — o dragão-pai está de olho.",
    goal: "Em que pedra do ninho estava cada cuidador, e com o quê?",
    ending: "O ninho ficou quentinho. Na manhã seguinte, {com:Escova Macia} foi o primeiro a ver um filhote espiar da casca.",
    objects: [e("Cobertor de Lã", M, "🧶"), e("Termômetro", M, "🌡️"), e("Escova Macia", F, "🪥"), e("Lanterna", F, "🔦")],
    rooms: [e("Ninho Alto", M), e("Beira do Penhasco", F), e("Gruta Quente", F), e("Trilha de Pedra", F)],
    blocks: [e("Ovo Gigante", M, "🥚"), e("Estalagmite", F, "🔺"), e("Osso de Dragão", M, "🦴")],
    seats: [e("Pedra Morna", F, "🟧"), e("Monte de Palha", M, "🟨")],
  },
  {
    key: "baile-aurora", title: "O baile sob a aurora", universe: "festa", tone: "encanto",
    intro: "No salão quadriculado do Reino das Auroras, os dançarinos começam o baile em ladrilhos diferentes. A música parou de repente quando a aurora mudou de cor, e todos congelaram onde estavam.",
    goal: "Em que ladrilho estava cada dançarino, e com o quê?",
    ending: "A música voltou. {com:Rosa de Gelo} jogou a rosa para a plateia, e o baile seguiu até o amanhecer.",
    objects: [e("Leque", M, "🪭"), e("Máscara", F, "🎭"), e("Rosa de Gelo", F, "🌹"), e("Lenço Brilhante", M, "🧣")],
    rooms: [e("Pista Central", F), e("Varanda", F), e("Canto da Orquestra", M), e("Mesa de Doces", F)],
    blocks: [e("Pilar de Gelo", M, "🧊"), e("Harpa Gigante", F, "🪕"), e("Chafariz", M, "⛲")],
    seats: [e("Poltrona Nevada", F, "💺"), e("Banquinho", M, "🪑")],
  },
  {
    key: "quarteiroes-cidade", title: "Os quarteirões da cidade em grade", universe: "arqueologia", tone: "misterio",
    intro: "A Cidade Perdida foi construída em ruas que se cruzam como um tabuleiro. Exploradores se espalharam pelos quarteirões para mapear um tesouro, e cada um parou numa esquina diferente.",
    goal: "Em que quarteirão estava cada explorador, e com o quê?",
    ending: "Tesouro localizado! {com:Detector de Metal} apitou bem em cima de um baú de moedas antigas.",
    objects: [e("Mapa do Tesouro", M, "🗺️"), e("Picareta", F, "⛏️"), e("Detector de Metal", M, "📡"), e("Cantil", M, "🫗")],
    rooms: [e("Bairro dos Templos", M), e("Mercado", M), e("Praça das Fontes", F), e("Muralha", F)],
    blocks: [e("Obelisco", M, "🗼"), e("Poço", M, "🕳️"), e("Estátua Caída", F, "🗿")],
    seats: [e("Banco de Pedra", M, "🪨"), e("Degrau", M, "🟫")],
  },
  {
    key: "tabuleiro-congelante", title: "O tabuleiro que congela o tempo", universe: "competicao", tone: "curiosidade",
    intro: "Na Dimensão do Tempo, um tabuleiro gigante congela quem pisa nele quando o relógio bate. Viajantes de eras diferentes ficaram parados em casas distintas, e o guardião do tempo quer libertá-los.",
    goal: "Em que casa estava cada viajante, e com o quê?",
    ending: "Todos libertados. {com:Bateria} recarregou o relógio, e o tabuleiro voltou a ser só um piso bonito.",
    objects: [e("Escudo", M, "🛡️"), e("Capacete", M, "🪖"), e("Luneta", F, "🔭"), e("Bateria", F, "🔋")],
    rooms: [e("Casa do Passado", F), e("Casa do Futuro", F), e("Faixa do Presente", F), e("Borda do Tempo", F)],
    blocks: [e("Relógio de Torre", M, "🕰️"), e("Ampulheta Gigante", F, "⏳"), e("Portal", M, "🌀")],
    seats: [e("Plataforma", F, "🟦"), e("Almofada", F, "🟪")],
  },
  {
    key: "constelacao-trono", title: "A constelação do Trono", universe: "astronomia", tone: "aventura",
    intro: "No céu sobre o Trono do Infinito, os grandes campeões viraram estrelas de uma constelação nova. Para batizá-la, a astrônoma real precisa saber a posição de cada estrela e o símbolo que ela carrega.",
    goal: "Onde brilha cada estrela, e com que símbolo?",
    ending: "Constelação batizada! {com:Símbolo do Cubo} ficou no coração dela, lembrando todas as jornadas.",
    objects: [e("Símbolo do Cubo", M, "🎲"), e("Símbolo da Trilha", M, "〰️"), e("Símbolo da Balança", M, "⚖️"), e("Símbolo do Mosaico", M, "🧩")],
    rooms: [e("Braço do Norte", M), e("Braço do Sul", M), e("Núcleo", M), e("Halo", M)],
    blocks: [e("Nebulosa", F, "🌌"), e("Lua Cheia", F, "🌕"), e("Cometa", M, "☄️")],
    seats: [e("Poeira Estelar", F, "🟡"), e("Anel de Luz", M, "💍")],
  },
];

import { ASTROS_B } from "./astros-b";

/** Duas investigações por capítulo: a história A e a história B do mesmo mundo, intercaladas. */
export const ASTROS_STORIES: Story[] = ASTROS_A.flatMap((s, i) => [s, ASTROS_B[i]]);
