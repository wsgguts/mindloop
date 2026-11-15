// Patches — investigações de "Cômodos": o lugar é dividido em cômodos (os "retalhos" do Patches) e há
// exatamente uma pessoa em cada cômodo, com móveis que bloqueiam casas e assentos que podem ser ocupados.
// Uma história por capítulo, no mundo daquele capítulo.

import type { Ent } from "../model";
import type { Story } from "../story";

const F = "f" as const, M = "m" as const;
const e = (label: string, g: "m" | "f", icon?: string): Ent => (icon ? { label, g, icon } : { label, g });

const PATCHES_A: Story[] = [
  {
    key: "castelo-flutuante", title: "A faxina do castelo flutuante", universe: "casa", tone: "encanto",
    intro: "No Reino Celestial, um castelo flutua preso por correntes de cristal. Na faxina da primavera, cada ajudante ficou num cômodo com um objeto, e a governanta quer conferir quem limpou o quê.",
    goal: "Em que cômodo estava cada ajudante, e com o quê?",
    ending: "Faxina conferida, castelo brilhando. {com:Espanador} achou uma pena de fênix atrás do lustre.",
    objects: [e("Espanador", M, "🪶"), e("Vassoura", F, "🧹"), e("Balde", M, "🪣"), e("Esponja", F, "🧽")],
    rooms: [e("Salão do Trono", M), e("Cozinha das Nuvens", F), e("Biblioteca", F), e("Torre do Sino", F)],
    blocks: [e("Lustre de Cristal", M, "💎"), e("Armadura", F, "🛡️"), e("Piano", M, "🎹")],
    seats: [e("Poltrona", F, "💺"), e("Tapete", M, "🟥")],
  },
  {
    key: "clube-arvore", title: "O clube da casa na árvore", universe: "aventura", tone: "humor",
    intro: "Uma turma construiu uma casa na árvore de cristal da floresta, com cômodos ligados por escadinhas. Depois da reunião secreta, cada um ficou num cômodo com um item do clube.",
    goal: "Em que cômodo ficou cada sócio, e com que item?",
    ending: "Clube organizado. A senha secreta ficou com {com:Senha Secreta}, que jurou não contar para ninguém.",
    objects: [e("Senha Secreta", F, "📜"), e("Lanterna", F, "🔦"), e("Pote de Biscoitos", M, "🍪"), e("Luneta", F, "🔭")],
    rooms: [e("Sala de Reunião", F), e("Mirante", M), e("Cozinha", F), e("Esconderijo", M)],
    blocks: [e("Tronco", M, "🪵"), e("Ninho", M, "🪺"), e("Balde da Polia", M, "🪣")],
    seats: [e("Almofada", F, "🟥"), e("Rede", F, "🪢")],
  },
  {
    key: "barco-casa", title: "A tarde de chuva no barco-casa", universe: "mar", tone: "curiosidade",
    intro: "Uma família mora num barco-casa que desce devagar pelo Vale das Águas. Numa tarde de chuva, cada um se ajeitou num cômodo com algo para fazer, e o avô quer adivinhar quem está onde.",
    goal: "Em que cômodo do barco estava cada um, e com o quê?",
    ending: "O avô acertou tudo, e {com:Bolo de Fubá} lhe deu o primeiro pedaço de bolo.",
    objects: [e("Vara de Pescar", F, "🎣"), e("Violão", M, "🎸"), e("Livro de Histórias", M, "📖"), e("Bolo de Fubá", M, "🍰")],
    rooms: [e("Convés", M), e("Cabine", F), e("Cozinha", F), e("Proa", F)],
    blocks: [e("Timão", M, "☸️"), e("Barril", M, "🛢️"), e("Rolo de Corda", M, "🪢")],
    seats: [e("Boia", F, "🛟"), e("Banquinho", M, "🪑")],
  },
  {
    key: "observatorio-monges", title: "O observatório dos monges", universe: "astronomia", tone: "misterio",
    intro: "No alto do Templo das Estrelas, monges estudam o céu num observatório de pedra. Na noite de uma chuva de meteoros, cada monge ficou num cômodo com um instrumento, e o abade quer o registro.",
    goal: "Em que cômodo estava cada monge, e com que instrumento?",
    ending: "Registro feito. {com:Carta Celeste} desenhou o meteoro mais brilhante da noite.",
    objects: [e("Astrolábio", M, "🧭"), e("Telescópio", M, "🔭"), e("Carta Celeste", F, "🌠"), e("Ampulheta", F, "⏳")],
    rooms: [e("Cúpula", F), e("Biblioteca dos Astros", F), e("Terraço", M), e("Câmara Escura", F)],
    blocks: [e("Globo Celeste", M, "🌐"), e("Coluna", F, "🏛️"), e("Relógio de Sol", M, "☀️")],
    seats: [e("Banco de Pedra", M, "🪨"), e("Almofada", F, "🟪")],
  },
  {
    key: "palacio-areia", title: "O palácio de areia do sultãozinho", universe: "historia", tone: "aventura",
    intro: "No Deserto dos Segredos, um palácio de areia é refeito todo ano para a festa do sultãozinho. Na véspera, os artesãos se espalharam pelos salões com suas ferramentas, e o chefe quer o mapa da obra.",
    goal: "Em que salão estava cada artesão, e com que ferramenta?",
    ending: "Mapa da obra completo. Na festa, {com:Pincel} pintou o último detalhe do portão.",
    objects: [e("Colher de Pedreiro", F, "🥄"), e("Balde de Água", M, "🪣"), e("Pincel", M, "🖌️"), e("Molde", M, "🟫")],
    rooms: [e("Salão Dourado", M), e("Pátio das Fontes", M), e("Torre de Vigia", F), e("Sala dos Tapetes", F)],
    blocks: [e("Coluna de Areia", F, "🏛️"), e("Fonte Seca", F, "⛲"), e("Monte de Areia", M, "🟤")],
    seats: [e("Tapete", M, "🟥"), e("Banquinho", M, "🪑")],
  },
  {
    key: "caverna-dragoa", title: "A caverna da dragoa chocadeira", universe: "natureza", tone: "suspense",
    intro: "Pesquisadores visitam uma caverna nas Montanhas do Dragão onde uma dragoa choca seus ovos. Para não acordá-la, cada um ficou num salão diferente com um equipamento, em silêncio absoluto.",
    goal: "Em que salão estava cada pesquisador, e com que equipamento?",
    ending: "Ninguém acordou a dragoa. Dias depois, {com:Gravador} gravou o primeiro grito do filhote.",
    objects: [e("Termômetro", M, "🌡️"), e("Câmera Silenciosa", F, "📷"), e("Gravador", M, "🎙️"), e("Caderno", M, "📓")],
    rooms: [e("Salão dos Ovos", M), e("Túnel Quente", M), e("Lago Subterrâneo", M), e("Galeria de Cristais", F)],
    blocks: [e("Estalagmite", F, "🔺"), e("Ovo de Dragão", M, "🥚"), e("Rocha", F, "🪨")],
    seats: [e("Pedra Lisa", F, "⬜"), e("Saco de Dormir", M, "🛌")],
  },
  {
    key: "palacio-gelo", title: "O palácio de gelo da rainha", universe: "magia", tone: "encanto",
    intro: "No Reino das Auroras, a rainha da neve abriu o palácio de gelo para visitantes. Ao badalar da meia-noite, cada visitante estava num salão com uma lembrança, e a rainha quer saber quem levou o quê.",
    goal: "Em que salão estava cada visitante, e com que lembrança?",
    ending: "Cada lembrança tinha dono. {com:Floco Eterno} guardou o floco que nunca derrete.",
    objects: [e("Floco Eterno", M, "❄️"), e("Espelho de Gelo", M, "🪞"), e("Coroa de Neve", F, "👑"), e("Taça Gelada", F, "🥂")],
    rooms: [e("Salão das Auroras", M), e("Jardim de Gelo", M), e("Escadaria", F), e("Sala do Trono", F)],
    blocks: [e("Estátua de Gelo", F, "🧊"), e("Lustre de Gelo", M, "💎"), e("Pinheiro Nevado", M, "🌲")],
    seats: [e("Trono de Gelo", M, "🪑"), e("Tapete de Pele", M, "🟫")],
  },
  {
    key: "biblioteca-subterranea", title: "A biblioteca subterrânea", universe: "biblioteca", tone: "misterio",
    intro: "Sob a Cidade Perdida existe uma biblioteca escavada na rocha. Uma equipe catalogava seus salões, cada pesquisador num cômodo com um achado, até que a tocha principal se apagou.",
    goal: "Em que salão estava cada pesquisador, e com que achado?",
    ending: "Catálogo completo. {com:Chave de Pedra} abriu a sala que ninguém via havia mil anos.",
    objects: [e("Rolo de Papiro", M, "📜"), e("Tinteiro", M, "🖋️"), e("Chave de Pedra", F, "🗝️"), e("Mapa Antigo", M, "🗺️")],
    rooms: [e("Salão dos Rolos", M), e("Sala de Leitura", F), e("Cripta", F), e("Corredor", M)],
    blocks: [e("Estante de Pedra", F, "📚"), e("Estátua do Escriba", F, "🗿"), e("Pilar", M, "🏛️")],
    seats: [e("Banco de Pedra", M, "🪨"), e("Esteira", F, "🟨")],
  },
  {
    key: "casa-eras", title: "A casa das eras", universe: "casa", tone: "curiosidade",
    intro: "Na Dimensão do Tempo, cada cômodo de uma casa fica numa época diferente. Uma família de viajantes passou a tarde explorando, e o relógio da sala precisa saber quem estava em cada era.",
    goal: "Em que cômodo (e era) estava cada um, e com o quê?",
    ending: "Cada um em sua era. {com:Disco de Vinil} colocou uma música antiga, e a casa inteira dançou.",
    objects: [e("Disco de Vinil", M, "💿"), e("Lamparina", F, "🪔"), e("Tablet", M, "📱"), e("Pena de Escrever", F, "🪶")],
    rooms: [e("Sala Medieval", F), e("Cozinha do Futuro", F), e("Quarto dos Anos 80", M), e("Sótão Pré-Histórico", M)],
    blocks: [e("Armadura", F, "🛡️"), e("Robô Doméstico", M, "🤖"), e("Totem", M, "🗿")],
    seats: [e("Poltrona", F, "💺"), e("Pufe", M, "🟣")],
  },
  {
    key: "galeria-herois", title: "A galeria das jornadas", universe: "museu", tone: "aventura",
    intro: "No Trono do Infinito, uma galeria guarda as lembranças de cada jornada. Na inauguração, os curadores ficaram em salas diferentes com uma peça especial, e o diretor quer o mapa final da exposição.",
    goal: "Em que sala estava cada curador, e com que peça?",
    ending: "Exposição montada. {com:Cubo da Lógica} colocou o cubo no centro — o símbolo de todas as jornadas.",
    objects: [e("Gema Lendária", F, "💎"), e("Mapa das Jornadas", M, "🗺️"), e("Medalha de Ouro", F, "🥇"), e("Cubo da Lógica", M, "🎲")],
    rooms: [e("Sala dos Mundos", F), e("Sala dos Campeões", F), e("Corredor do Infinito", M), e("Mirante", M)],
    blocks: [e("Pedestal", M, "🏛️"), e("Vitrine", F, "🗄️"), e("Estátua do Cubo", F, "🗿")],
    seats: [e("Banco de Visitas", M, "🪑"), e("Tapete Estrelado", M, "🟪")],
  },
];

import { PATCHES_B } from "./patches-b";

/** Duas investigações por capítulo: a história A e a história B do mesmo mundo, intercaladas. */
export const PATCHES_STORIES: Story[] = PATCHES_A.flatMap((s, i) => [s, PATCHES_B[i]]);
