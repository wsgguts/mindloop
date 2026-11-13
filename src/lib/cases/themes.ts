// Mindloop Investigação — histórias, personagens e objetos (todos originais) de cada jogo.
// Cada jogo tem o próprio tipo de mistério, ligado à sua mecânica:
//   Mini Sudoku → "code"    : segredos numéricos sem repetir números (cofres, cadeados, painéis).
//   Tango       → "pattern" : filas de Cristais e Orbes em equilíbrio (metade de cada, nunca três iguais seguidos).
//   Zip         → "route"   : a ordem de um caminho que passa uma vez por cada lugar, seguindo as estradas.
//   Patches     → "layout"  : onde cada peça/objeto fica numa grade.
// O cenário de cada caso é o mundo do capítulo (os 10 mundos das jornadas).

import type { JourneyGame } from "../journey";
import type { CaseKind, Ent } from "./model";

export const KIND_OF: Record<JourneyGame, CaseKind> = { sudoku: "code", tango: "pattern", zip: "route", patches: "layout" };
export const KIND_NAME: Record<CaseKind, string> = {
  code: "Investigação numérica", pattern: "Investigação de padrões", route: "Investigação de caminhos", layout: "Investigação espacial",
};

/** "no Reino Celestial", "na Floresta dos Cristais"… (capítulo N = mundo N). */
export const WORLD_IN = [
  "no Reino Celestial", "na Floresta dos Cristais", "no Vale das Águas", "no Templo das Estrelas", "no Deserto dos Segredos",
  "nas Montanhas do Dragão", "no Reino das Auroras", "na Cidade Perdida", "na Dimensão do Tempo", "no Trono do Infinito",
];

export interface Theme {
  title: string;
  /** Introdução: recebe "no Vale das Águas" e o número de slots. */
  intro: (where: string, n: number) => string;
  /** Pergunta do caso, mostrada acima da área de dedução. */
  goal: string;
  /** code: nome de cada posição ("disco"); pattern: verbos; route/layout: não usado. */
  noun?: Ent;
  verb?: [string, string];
}

// ---------------------------------------------------------------- Mini Sudoku: segredos numéricos

export const CODE_THEMES: Theme[] = [
  { title: "O cofre do relojoeiro", noun: { label: "disco", g: "m" }, goal: "Qual número fica em cada disco do cofre?",
    intro: (w, n) => `O relojoeiro que vive ${w} trancou seu invento mais precioso num cofre de ${n} discos. Antes de viajar, deixou bilhetes com pistas para o aprendiz. Nenhum número se repete no segredo.` },
  { title: "A fechadura das engrenagens", noun: { label: "engrenagem", g: "f" }, goal: "Qual número cada engrenagem precisa mostrar?",
    intro: (w, n) => `A porta da torre ${w} só se abre quando as ${n} engrenagens mostram os números certos. Riscos na parede guardam as pistas — e cada número aparece uma única vez.` },
  { title: "O cadeado do baú esquecido", noun: { label: "anel", g: "m" }, goal: "Que número vai em cada anel do cadeado?",
    intro: (w, n) => `Um baú antigo apareceu ${w}, preso por um cadeado de ${n} anéis. Dentro da tampa, alguém gravou pistas sobre a combinação, sem repetir nenhum número.` },
  { title: "O painel da ponte levadiça", noun: { label: "alavanca", g: "f" }, goal: "Em que número fica cada alavanca?",
    intro: (w, n) => `A ponte levadiça ${w} está erguida. O painel tem ${n} alavancas numeradas e o guarda deixou um bilhete enigmático. Nenhuma alavanca usa o mesmo número de outra.` },
  { title: "A senha do observatório", noun: { label: "dígito", g: "m" }, goal: "Qual é cada dígito da senha?",
    intro: (w, n) => `O telescópio do observatório ${w} está travado por uma senha de ${n} dígitos diferentes. A astrônoma anotou pistas no diário de observações.` },
  { title: "O mistério do relógio parado", noun: { label: "ponteiro", g: "m" }, goal: "Em que número parou cada ponteiro?",
    intro: (w, n) => `Um relógio de ${n} ponteiros parou ${w} na mesma hora em que o tesouro sumiu. Testemunhas lembram detalhes — e cada ponteiro marca um número diferente.` },
];

// ---------------------------------------------------------------- Tango: padrões de Cristais e Orbes

export const PATTERN_THEMES: Theme[] = [
  { title: "O baile dos lampiões", verb: ["carrega", "carregam"], goal: "Quem carrega um Cristal e quem carrega um Orbe?",
    intro: (w, n) => `No grande baile ${w}, ${n} amigos formam uma fila carregando lampiões de Cristal ou de Orbe. O mestre de cerimônias exige equilíbrio — mas a lista se perdeu. Restaram as pistas.` },
  { title: "O coral das pedras cantantes", verb: ["segura", "seguram"], goal: "Que pedra cada cantor segura?",
    intro: (w, n) => `O coral ${w} canta com pedras mágicas: Cristais agudos e Orbes graves. Os ${n} cantores estão em fila e a harmonia só funciona se as regras do equilíbrio forem respeitadas.` },
  { title: "O desfile dos estandartes", verb: ["leva", "levam"], goal: "Que estandarte cada pessoa leva no desfile?",
    intro: (w, n) => `${n} porta-estandartes vão abrir o desfile ${w}. Cada um leva o símbolo do Cristal ou do Orbe, e o organizador anotou como a fila deve ficar.` },
  { title: "Os guardiões do portal", verb: ["protege", "protegem"], goal: "Que símbolo cada guardião protege?",
    intro: (w, n) => `O portal ${w} é vigiado por ${n} guardiões lado a lado. Cada um protege um Cristal ou um Orbe — e o portal só se mantém estável em equilíbrio.` },
  { title: "A fila do teleférico", verb: ["leva", "levam"], goal: "Qual pedra cada viajante leva na mochila?",
    intro: (w, n) => `${n} viajantes esperam o teleférico ${w}, em fila. O bilheteiro registrou o peso das mochilas: cada uma leva um Cristal ou um Orbe, e as cabines precisam ir equilibradas.` },
];

export const PEOPLE: Ent[] = [
  { label: "Ana", g: "f" }, { label: "Bento", g: "m" }, { label: "Caio", g: "m" }, { label: "Duda", g: "f" },
  { label: "Elis", g: "f" }, { label: "Fábio", g: "m" }, { label: "Gabi", g: "f" }, { label: "Hugo", g: "m" },
  { label: "Iara", g: "f" }, { label: "João", g: "m" }, { label: "Lia", g: "f" }, { label: "Miguel", g: "m" },
  { label: "Nina", g: "f" }, { label: "Otto", g: "m" }, { label: "Rita", g: "f" }, { label: "Téo", g: "m" },
];
export const SYMBOLS: Ent[] = [{ label: "Cristal", g: "m", pl: "Cristais" }, { label: "Orbe", g: "m", pl: "Orbes" }];

// ---------------------------------------------------------------- Zip: caminhos

export const ROUTE_THEMES: Theme[] = [
  { title: "A rota do mensageiro", goal: "Em que ordem o mensageiro passou pelos lugares?",
    intro: (w, n) => `Um mensageiro ${w} entregou cartas em ${n} lugares, passando uma única vez por cada um. A carta mais importante sumiu: descubra a ordem das paradas para refazer o caminho.` },
  { title: "O mapa rasgado do explorador", goal: "Qual foi a ordem da expedição?",
    intro: (w, n) => `O diário de uma exploradora foi encontrado ${w}, com a página do mapa rasgada. Ela visitou ${n} lugares, um de cada vez, sempre pelas estradas. As anotações que sobraram são as pistas.` },
  { title: "A trilha dos vaga-lumes", goal: "Em que ordem os lugares se acenderam?",
    intro: (w, n) => `Toda noite ${w}, uma trilha de vaga-lumes acende ${n} lugares, um depois do outro, seguindo as estradas. Os moradores observaram alguns detalhes — qual é a ordem?` },
  { title: "O passeio do gato fujão", goal: "Por onde o gato passou, e em que ordem?",
    intro: (w, n) => `O gato da biblioteca fugiu ${w} e passou por ${n} lugares antes de voltar para o colo da dona. Ele andou só pelas estradas e não repetiu nenhum lugar. Testemunhas contaram o que viram.` },
  { title: "A ronda do guardião", goal: "Qual foi a ordem da ronda?",
    intro: (w, n) => `O guardião ${w} faz uma ronda por ${n} lugares, sem repetir nenhum. Esta noite algo estranho aconteceu, e reconstruir a ronda é o primeiro passo da investigação.` },
];

export const PLACES: Ent[] = [
  { label: "Biblioteca", g: "f", icon: "📚" }, { label: "Museu", g: "m", icon: "🏛️" }, { label: "Fonte", g: "f", icon: "⛲" },
  { label: "Ponte", g: "f", icon: "🌉" }, { label: "Torre", g: "f", icon: "🗼" }, { label: "Jardim", g: "m", icon: "🌷" },
  { label: "Mercado", g: "m", icon: "🏪" }, { label: "Observatório", g: "m", icon: "🔭" }, { label: "Castelo", g: "m", icon: "🏰" },
  { label: "Padaria", g: "f", icon: "🥖" }, { label: "Porto", g: "m", icon: "⚓" }, { label: "Bosque", g: "m", icon: "🌲" },
];

// ---------------------------------------------------------------- Patches: organização espacial

export const LAYOUT_THEMES: Theme[] = [
  { title: "A vitrine embaralhada", goal: "Em que casa da vitrine fica cada peça?",
    intro: (w, n) => `Durante a noite, alguém mexeu na vitrine do museu ${w}. As ${n} peças precisam voltar ao lugar antes da abertura, e o catálogo só tem descrições — nada de fotos.` },
  { title: "A estante da alquimista", goal: "Onde fica cada objeto na estante?",
    intro: (w, n) => `A alquimista ${w} guarda ${n} objetos numa estante de nichos, cada um num lugar exato. A estante caiu e as anotações dela são a única pista de como estava.` },
  { title: "O mosaico do templo", goal: "Em que casa do mosaico vai cada peça?",
    intro: (w, n) => `O mosaico do templo ${w} perdeu ${n} peças. A inscrição na entrada descreve onde cada uma ficava. Coloque tudo de volta para revelar o desenho.` },
  { title: "O baú do mercador", goal: "Onde estava cada objeto no baú?",
    intro: (w, n) => `Um mercador ${w} jura que arrumou ${n} objetos no baú de um jeito muito preciso. Ao abrir, tudo estava fora do lugar. Ajude a provar como ele os deixou.` },
  { title: "A galeria de relíquias", goal: "Em que casa da galeria fica cada relíquia?",
    intro: (w, n) => `A galeria ${w} expõe ${n} relíquias numa parede de nichos. O guia lembra só de detalhes soltos sobre a posição de cada uma.` },
];

export const OBJECTS: Ent[] = [
  { label: "Vaso", g: "m", icon: "🏺" }, { label: "Coroa", g: "f", icon: "👑" }, { label: "Relógio", g: "m", icon: "⏰" },
  { label: "Mapa", g: "m", icon: "🗺️" }, { label: "Ampulheta", g: "f", icon: "⏳" }, { label: "Livro", g: "m", icon: "📕" },
  { label: "Chave", g: "f", icon: "🗝️" }, { label: "Lupa", g: "f", icon: "🔍" }, { label: "Globo", g: "m", icon: "🌐" },
  { label: "Poção", g: "f", icon: "🧪" }, { label: "Escudo", g: "m", icon: "🛡️" }, { label: "Concha", g: "f", icon: "🐚" },
];

export const THEMES: Record<CaseKind, Theme[]> = { code: CODE_THEMES, pattern: PATTERN_THEMES, route: ROUTE_THEMES, layout: LAYOUT_THEMES };

// ---------------------------------------------------------------- dicas gerais (nível 1) de cada tipo

export const GENERAL_HINT: Record<CaseKind, string> = {
  code: "Comece pelas pistas que falam de um só número: elas eliminam opções na hora. Depois, use as comparações (maior, menor, soma) para cortar o que sobrou. Lembre: nenhum número se repete.",
  pattern: "Lembre das duas regras: metade Cristais e metade Orbes, e nunca três iguais seguidos. Comece por quem já tem símbolo definido e espalhe a informação usando as pistas de “mesmo símbolo” e “símbolos diferentes”.",
  route: "O caminho só segue as estradas do mapa. Lugares com uma única estrada só podem estar no começo ou no fim. Use as pistas de “antes” e “logo depois” para ir encaixando a ordem.",
  layout: "Comece pelas pistas de linha e de coluna: elas reduzem muito as casas possíveis de cada peça. Depois use “vizinhos”, “à esquerda” e “acima” — e lembre que cada casa guarda no máximo uma peça.",
};
