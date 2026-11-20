// Mindloop Investigação — a NARRAÇÃO da tela de história: o narrador do jogo conta o caso em falas curtas.
// narracao: [{ texto, expressao, destaques }] e pergunta, por caso.
//   • As falas de abertura (o que aconteceu + uma piada) e a de fechamento são escritas à mão, por caso, em
//     roteiros.ts, na voz do narrador do jogo (Bit, Dona Coruja, Guaxi, Remendo, Lumen).
//   • As falas que apresentam os personagens e os objetos saem dos dados do caso (nomes, traços do elenco abaixo),
//     para nunca ficarem diferentes do caso — e nunca dizem quem segurava o quê nem onde estava.
// No texto, **Nome** marca um personagem ou objeto do caso: aparece em destaque, com o desenho dele.
// Nada aqui muda a lógica; narracao.test.ts confere tamanho, quantidade, nomes e que nenhuma fala entrega a solução.

export type Expressao = "feliz" | "assustado" | "desconfiado" | "pensativo";
export interface Fala { texto: string; expressao: Expressao; destaques: string[] }
/** Roteiro escrito à mão: o coletivo dos personagens ("ajudantes"), 2 falas de abertura e 1 de fechamento. */
export interface Roteiro { grupo: string; abre: [Expressao, string][]; fecha: [Expressao, string] }

/** Os nomes marcados com **…** numa fala. */
export const destaquesDe = (texto: string) => [...texto.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);
/** O texto como aparece na tela (sem as marcas). */
export const textoPuro = (texto: string) => texto.replace(/\*\*(.+?)\*\*/g, "$1");
const fala = (expressao: Expressao, texto: string): Fala => ({ texto, expressao, destaques: destaquesDe(texto) });

/** Traço curto de cada personagem do elenco (aposto: "**Lina**, que cantarola sem parar"). */
export const TRACO: Record<string, string> = {
  Kai: "que coleciona mapas de ilhas", Nox: "o gato que some e aparece", Lyra: "que ouve música nas estrelas",
  Mel: "sempre rindo", Broto: "o brotinho que cresce a cada enigma", Rio: "calmo como um lago",
  Sol: "de olhar dourado", Pixel: "o robozinho de tela", Faísca: "que nunca anda devagar",
  Íris: "que lê três livros de uma vez", Floco: "bichinho de neve", Dante: "contador de histórias",
  Kika: "a rainha do chiclete", Cogu: "cogumelo tímido que brilha", Estela: "que se guia pelas estrelas",
  Orbi: "espírito de luz", Ayo: "de cabelo prateado", Nico: "que ajusta os óculos sem parar",
  Lila: "coelha que pula de alegria", Musgo: "o rei dos atalhos", Jade: "piloto de balão",
  Theo: "memória de elefante", Bruma: "feita de nevoeiro", Luna: "que escuta o silêncio",
  Chip: "robô que lembra de tudo", Cris: "raposa que reflete a luz", Zen: "que nunca se apressa",
  Alva: "que sorri de olhos fechados", Lis: "sonhadora de cabelo lilás", Prisma: "cristal vivo",
  Rocha: "gigante de poucas palavras", Drako: "dragão de gelo", Umbra: "dragão da noite",
  Quartzo: "golem de cristal", Marina: "rainha do equilíbrio", Eco: "que nunca tira o fone",
  Nina: "costureira de olhos fechados", Astro: "robô astronauta", Pipa: "detetive iniciante",
  Leo: "que sempre tem um palpite", Maya: "do caderninho roxo", Davi: "que repara em tudo",
  Ravi: "discreto como uma sombra", Neve: "que ri alto", Rubro: "o encapuzado misterioso",
  Byte: "robô jardineiro", Vulto: "o mistério em pessoa", Cubo: "cristal da memória",
  Lina: "que cantarola sem parar", Kael: "espadachim educado", Flor: "com uma flor no cabelo",
  Ritmo: "DJ das festas", Gelo: "lobo de cristal", Nimbo: "nuvenzinha que muda de cor",
  Pingo: "bolinha de sombra", Vi: "que conta as estrelas", Gema: "do triângulo de luz",
};

const P = (n: string) => `**${n}**, ${TRACO[n] ?? "nosso convidado"}`;
const list = (os: string[], e: string) => `${os.slice(0, -1).map((o) => `**${o}**`).join(", ")} ${e} **${os[os.length - 1]}**`;

/** As falas dos personagens (2) e dos objetos (1). Variam de caso para caso (k), sem nunca ligar pessoa a objeto. */
function apresentacao(grupo: string, people: string[], objects: string[], k: number): Fala[] {
  const [a, b, c, d] = people;
  const l1 = [
    `Quatro ${grupo} estavam lá: ${P(a)}, e ${P(b)}...`,
    `Agora, os suspeitos! Digo, os ${grupo}: ${P(a)}, e ${P(b)}...`,
    `Na cena havia quatro ${grupo}. Primeiro, ${P(a)}. Depois, ${P(b)}...`,
  ][k % 3];
  const l2 = [`...${P(c)}, e ${P(d)}.`, `...e mais ${P(c)}, e ${P(d)}. Que turma!`, `...completando o time: ${P(c)}, e ${P(d)}.`][k % 3];
  const ob = [
    `Cada um segurava uma coisa: ${list(objects, "ou")}. Mas quem tinha o quê?`,
    `No meio da confusão, quatro objetos: ${list(objects, "e")}. Um para cada um!`,
    `E nas mãos deles: ${list(objects, "e")}. Quem segurava o quê? Mistério!`,
  ];
  // Nomes longos: a forma mais curta, para a fala caber no balão.
  const o = [...ob].sort((x, y) => textoPuro(x).length - textoPuro(y).length);
  const pick = textoPuro(ob[k % 3]).length <= 140 ? ob[k % 3] : o[0];
  return [fala("pensativo", l1), fala("desconfiado", l2), fala("pensativo", pick)];
}

/** A narração completa de um caso: abertura (2), personagens (2), objetos (1) e fechamento (1). */
export function narracaoDe(r: Roteiro, people: string[], objects: string[], k: number): Fala[] {
  return [...r.abre.map(([e, t]) => fala(e, t)), ...apresentacao(r.grupo, people, objects, k), fala(r.fecha[0], r.fecha[1])];
}
