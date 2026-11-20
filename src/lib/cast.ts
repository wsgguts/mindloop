// Elenco do MindLoop: os personagens do universo. Cada um é um avatar que o jogador pode usar no perfil
// (alguns liberados desde o começo, os outros desbloqueados jogando) e todos aparecem nas investigações.
// Os cinco narradores das investigações também estão aqui (não entram como personagens dos mistérios).
//
// As ilustrações ficam em /public/cast/<id>.webp (recortadas das folhas de arte; `tile` indica a origem).

import type { JourneyGame } from "./journey";

/** Como o avatar é liberado. Tudo é calculado a partir do progresso: nada extra para guardar ou sincronizar. */
export type Unlock =
  | { k: "start" }
  | { k: "levels"; n: number }                     // fases concluídas somando todas as jornadas
  | { k: "journey"; g: JourneyGame }               // as 100 fases de uma jornada
  | { k: "cases"; n: number }                      // mistérios resolvidos (todos os jogos)
  | { k: "narrator"; g: JourneyGame; n: number };  // mistérios resolvidos no jogo daquele narrador

export interface CastMember {
  id: string;
  name: string;
  /** Gênero gramatical (para "o Kai", "a Lyra"). */
  g: "m" | "f";
  /** Uma linha sobre quem é (mostrada ao escolher o avatar). */
  bio: string;
  unlock: Unlock;
  /** Narrador de um jogo (não entra como personagem dos mistérios). */
  narrator?: JourneyGame;
  tile: string;
}

const c = (id: string, name: string, g: "m" | "f", tile: string, unlock: Unlock, bio: string, narrator?: JourneyGame): CastMember =>
  ({ id, name, g, tile, unlock, bio, ...(narrator ? { narrator } : {}) });
const START: Unlock = { k: "start" };
const L = (n: number): Unlock => ({ k: "levels", n });
const J = (g: JourneyGame): Unlock => ({ k: "journey", g });
const C = (n: number): Unlock => ({ k: "cases", n });

export const CAST: CastMember[] = [
  // ---- liberados desde o começo
  c("kai", "Kai", "m", "p10-00", START, "Explorador curioso que coleciona mapas de ilhas flutuantes."),
  c("nox", "Nox", "m", "p8-01", START, "Gato das sombras com uma estrela na testa. Some e aparece."),
  c("lyra", "Lyra", "f", "p10-02", START, "Ouve a música das constelações nos fones de cristal."),
  c("mel", "Mel", "f", "p10-09", START, "Sempre rindo, sempre com uma ideia nova."),
  c("broto", "Broto", "m", "p10-12", START, "Brotinho da Floresta dos Cristais. Cresce um pouco a cada enigma."),
  c("rio", "Rio", "m", "p10-08", START, "Calmo como o Vale das Águas, atento a cada detalhe."),
  c("sol", "Sol", "f", "p10-11", START, "Viajante do Deserto dos Segredos, de olhar dourado."),
  c("pixel", "Pixel", "m", "p8-05", START, "Robozinho de tela que mostra um coração quando acerta."),
  // ---- fases concluídas (todas as jornadas somadas)
  c("faisca", "Faísca", "f", "p10-04", L(5), "Inventora de óculos de voo. Nunca anda devagar."),
  c("iris", "Íris", "f", "p10-06", L(10), "Lê três livros ao mesmo tempo e lembra de todos."),
  c("floco", "Floco", "m", "p9-14", L(15), "Bichinho de neve com um cristal azul na cabeça."),
  c("dante", "Dante", "m", "p11-08", L(20), "Contador de histórias das Montanhas do Dragão."),
  c("kika", "Kika", "f", "p11-05", L(30), "Faz bolas de chiclete enquanto pensa no próximo passo."),
  c("cogu", "Cogu", "m", "p11-20", L(40), "Cogumelo que brilha no escuro. Tímido, mas corajoso."),
  c("estela", "Estela", "f", "p8-09", L(50), "Navegadora que se guia pelas estrelas-brinco."),
  c("orbi", "Orbi", "m", "p11-15", L(60), "Espírito de luz com orelhas de folha."),
  c("ayo", "Ayo", "m", "p8-04", L(70), "Guardião de cabelo prateado do Templo das Estrelas."),
  c("nico", "Nico", "m", "p9-13", L(80), "Ajusta os óculos sempre que descobre algo."),
  c("lila", "Lila", "f", "p8-16", L(90), "Coelha de cristal rosa. Pula de alegria a cada acerto."),
  c("musgo", "Musgo", "m", "p8-06", L(100), "Felpudo e verde, conhece todos os atalhos da floresta."),
  c("jade", "Jade", "f", "p9-07", L(120), "Piloto de balão com óculos de aviadora."),
  c("theo", "Theo", "m", "p8-17", L(140), "Sorriso fácil e memória de elefante."),
  c("bruma", "Bruma", "f", "p10-20", L(160), "Espírito do nevoeiro que flutua pelo Vale."),
  c("luna", "Luna", "f", "p11-07", L(180), "Escuta o silêncio entre uma nota e outra."),
  c("chip", "Chip", "m", "p9-03", L(200), "Robô sorridente que guarda tudo na memória."),
  c("cris", "Cris", "f", "p8-03", L(230), "Raposa de cristal azul. Reflete a luz de quem chega perto."),
  c("zen", "Zen", "m", "p11-04", L(260), "Não se apressa nunca, e mesmo assim chega primeiro."),
  c("alva", "Alva", "f", "p8-08", L(300), "Raposa branca que sorri de olhos fechados."),
  c("lis", "Lis", "f", "p8-19", L(340), "Sonhadora de cabelo lilás e brincos de estrela."),
  c("prisma", "Prisma", "m", "p10-10", L(380), "Cristal vivo da Dimensão do Tempo."),
  c("rocha", "Rocha", "m", "p9-16", L(420), "Gigante de pedra e musgo. Fala pouco e ajuda muito."),
  c("drako", "Drako", "m", "p10-05", L(460), "Dragão de gelo que protege as Montanhas."),
  c("umbra", "Umbra", "m", "p9-18", L(500), "Dragão da noite. Só aparece para quem venceu as cinco jornadas."),
  // ---- jornada inteira (100 fases) de um jogo
  c("quartzo", "Quartzo", "m", "p11-11", J("sudoku"), "Golem de cristal que guarda as regiões do Mini Sudoku."),
  c("marina", "Marina", "f", "p11-18", J("tango"), "Mantém tudo em equilíbrio, como no Tango."),
  c("eco", "Eco", "m", "p8-07", J("zip"), "Segue o ritmo do caminho do Zip sem tirar o fone."),
  c("nina", "Nina", "f", "p9-17", J("patches"), "Monta qualquer retalho do Patches de olhos fechados."),
  c("astro", "Astro", "m", "p11-03", J("astros"), "Robô astronauta que mapeia o céu do Astros."),
  // ---- mistérios resolvidos
  c("pipa", "Pipa", "f", "p9-02", C(1), "Detetive iniciante com óculos de aventura."),
  c("leo", "Leo", "m", "p9-11", C(5), "Sempre tem um palpite — e às vezes acerta."),
  c("maya", "Maya", "f", "p8-13", C(10), "Anota tudo num caderninho roxo."),
  c("davi", "Davi", "m", "p11-12", C(20), "Repara no que ninguém repara."),
  c("ravi", "Ravi", "m", "p8-15", C(30), "Detetive de capuz azul, discreto como uma sombra."),
  c("neve", "Neve", "f", "p11-01", C(40), "Ri alto quando uma pista se encaixa."),
  c("rubro", "Rubro", "m", "p9-12", C(50), "Encapuzado de vermelho. Ninguém sabe de onde veio."),
  c("byte", "Byte", "m", "p8-18", C(60), "Robô jardineiro com um broto na cabeça."),
  c("vulto", "Vulto", "m", "p11-14", C(75), "O mistério em pessoa. Só se revela aos grandes detetives."),
  c("cubo", "Cubo", "m", "p11-17", C(100), "Cristal que guarda a memória de todos os mistérios."),
  // ---- mais personagens (liberados por fases)
  c("lina", "Lina", "f", "p9-09", L(25), "Cantarola enquanto resolve qualquer coisa."),
  c("kael", "Kael", "m", "p11-19", L(45), "Espadachim de cabelo branco, muito educado."),
  c("flor", "Flor", "f", "p9-19", L(65), "Usa uma flor no cabelo para cada mundo visitado."),
  c("ritmo", "Ritmo", "m", "p9-23", L(110), "DJ das festas do Trono do Infinito."),
  c("gelo", "Gelo", "m", "p11-06", L(150), "Lobo de cristal das Auroras."),
  c("nimbo", "Nimbo", "m", "p8-12", L(190), "Nuvenzinha de cristal que muda de cor."),
  c("pingo", "Pingo", "m", "p9-10", L(240), "Bolinha de sombra com um anel de planeta."),
  c("vi", "Vi", "f", "p10-17", L(280), "Observa o céu da janela e conta as estrelas."),
  c("gema", "Gema", "f", "p9-06", L(320), "Guardiã de cristal com um triângulo de luz."),
  // ---- narradores das investigações (liberados com 5 mistérios do jogo)
  c("bit", "Bit", "m", "p10-03", { k: "narrator", g: "sudoku", n: 5 }, "Robô arquivista. Narra as investigações do Mini Sudoku.", "sudoku"),
  c("coruja", "Dona Coruja", "f", "p10-18", { k: "narrator", g: "tango", n: 5 }, "Sábia e paciente. Narra as investigações do Tango.", "tango"),
  c("guaxi", "Guaxi", "m", "p8-14", { k: "narrator", g: "zip", n: 5 }, "Guaxinim batedor. Narra as investigações do Zip.", "zip"),
  c("remendo", "Remendo", "f", "p10-07", { k: "narrator", g: "patches", n: 5 }, "Raposa costureira. Narra as investigações do Patches.", "patches"),
  c("lumen", "Lumen", "m", "p9-22", { k: "narrator", g: "astros", n: 5 }, "Estrela-guia. Narra as investigações do Astros.", "astros"),
];

export const castById = (id: string | null | undefined): CastMember | undefined => CAST.find((m) => m.id === id);
export const castByName = (name: string): CastMember | undefined => CAST.find((m) => m.name === name);
export const castImg = (m: CastMember) => `/cast/${m.id}.webp`;
export const narratorOf = (g: JourneyGame) => CAST.find((m) => m.narrator === g)!;

// ---------------------------------------------------------------- avatar

export const AVATAR_KEY = "mindloop:avatar";
export const DEFAULT_AVATAR = "kai";
/** Avatares liberados que o jogador já viu na coleção (para o selo "Novo"). */
export const AVATARS_SEEN_KEY = "mindloop:avatars-seen";
export function parseSeen(raw: string | null): Set<string> {
  try { const a: unknown = raw ? JSON.parse(raw) : []; return new Set(Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : []); }
  catch { return new Set(); }
}

/** O que é preciso saber do jogador para liberar avatares. */
export interface AvatarStats {
  levels: Record<JourneyGame, number>;
  cases: number;
  casesBy: Record<JourneyGame, number>;
}

export function isUnlocked(m: CastMember, s: AvatarStats): boolean {
  const u = m.unlock;
  switch (u.k) {
    case "start": return true;
    case "levels": return Object.values(s.levels).reduce((a, b) => a + b, 0) >= u.n;
    case "journey": return s.levels[u.g] >= 100;
    case "cases": return s.cases >= u.n;
    case "narrator": return s.casesBy[u.g] >= u.n;
  }
}

const GAME_NAME: Record<JourneyGame, string> = { sudoku: "Mini Sudoku", tango: "Tango", zip: "Zip", patches: "Patches", astros: "Astros" };

/** Como liberar (texto curto para o cartão bloqueado). */
export function unlockText(m: CastMember): string {
  const u = m.unlock;
  switch (u.k) {
    case "start": return "Disponível desde o início";
    case "levels": return `Conclua ${u.n} ${u.n === 1 ? "fase" : "fases"} (somando todas as jornadas)`;
    case "journey": return `Conclua as 100 fases do ${GAME_NAME[u.g]}`;
    case "cases": return `Resolva ${u.n} ${u.n === 1 ? "mistério" : "mistérios"} nas investigações`;
    case "narrator": return `Resolva ${u.n} mistérios do ${GAME_NAME[u.g]}`;
  }
}

/** Progresso rumo ao desbloqueio: [atual, meta]. */
export function unlockProgress(m: CastMember, s: AvatarStats): [number, number] {
  const u = m.unlock;
  switch (u.k) {
    case "start": return [1, 1];
    case "levels": return [Math.min(u.n, Object.values(s.levels).reduce((a, b) => a + b, 0)), u.n];
    case "journey": return [Math.min(100, s.levels[u.g]), 100];
    case "cases": return [Math.min(u.n, s.cases), u.n];
    case "narrator": return [Math.min(u.n, s.casesBy[u.g]), u.n];
  }
}

// ---------------------------------------------------------------- elenco das investigações

/** Personagens que entram nos mistérios (todos menos os narradores). */
export const SUSPECTS = CAST.filter((m) => !m.narrator);

/**
 * Os 4 personagens do mistério `index` de um jogo. Percorre o elenco numa ordem embaralhada (fixa) por jogo, de 4
 * em 4: cada personagem aparece uma ou duas vezes por jogo, e os dois mistérios de um capítulo nunca repetem
 * ninguém.
 */
export function castFor(game: JourneyGame, index: number): CastMember[] {
  const order = shuffled(SUSPECTS, `elenco:${game}`);
  return Array.from({ length: 4 }, (_, k) => order[(index * 4 + k) % order.length]);
}

function shuffled<T>(list: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

// ---------------------------------------------------------------- objetos ilustrados

/**
 * Ilustrações de objetos (/public/items/<id>.webp) e os nomes EXATOS que as usam. Só entra um nome quando o desenho
 * é mesmo aquele objeto (um "Pote de Vidro" não ganha o pote de mel; um "Bolo de Chocolate" não ganha o bolo de
 * morango). O resto continua com emoji.
 */
export const ITEM_ART: { id: string; names: string[] }[] = [
  { id: "pena", names: ["Pena", "Pena de Escrever", "Pena de Nuvem", "Pena de Coruja", "Pena de Ganso"] },
  { id: "livro", names: ["Livro", "Livro das Constelações", "Livro de Histórias", "Livro de Receitas", "Livro dos Astros", "Almanaque", "Livro de Receitas de Chá", "Almanaque da Chuva", "Livro de Lendas do Rio", "Livro do Solstício"] },
  { id: "lupa", names: ["Lupa", "Lupa Dourada", "Lupa de Joalheiro", "Lupa de Bolso", "Lupa de Botânica"] },
  { id: "balao", names: ["Balão de Festa", "Balão"] },
  { id: "bolo", names: ["Bolo", "Bolo de Boas-Vindas", "Bolo de Nuvem", "Bolo de Aniversário"] },
  { id: "cesta", names: ["Cesta de Pães"] },
  { id: "fogo", names: ["Fogo", "Fogueira", "Chama"] },
  { id: "chave", names: ["Chave", "Chave da Estante", "Chave de Bronze", "Chave do Quarto", "Chave Mestra", "Chave da Estante Alta", "Chave Dourada"] },
  { id: "cinzel", names: ["Cinzel", "Cinzel Fino"] },
  { id: "martelo", names: ["Martelo", "Martelo de Forja", "Martelinho de Cobre"] },
  { id: "mel", names: ["Pote de Mel"] },
  { id: "gema", names: ["Gema Brilhante", "Gema Lendária", "Cristal Estelar", "Diamante Lendário"] },
  { id: "flauta", names: ["Flauta", "Flauta de Arco-Íris", "Flauta de Pastor"] },
  { id: "tambor", names: ["Tambor", "Tambor de Nuvem"] },
  { id: "cogumelo", names: ["Cogumelo"] },
  { id: "roupao", names: ["Roupão", "Roupão Bordado"] },
  { id: "pato", names: ["Pato de Borracha"] },
  { id: "chinelo", names: ["Chinelo", "Chinelo de Madeira"] },
  { id: "regua", names: ["Régua", "Régua de Nível"] },
  { id: "tubo", names: ["Tubo de Ensaio"] },
  { id: "prancheta", names: ["Prancheta", "Prancheta das Medições"] },
  { id: "lanterna", names: ["Lampião", "Lampião de Bronze", "Lampião da Tenda", "Lampião de Mineiro"] },
  { id: "sino", names: ["Sino", "Sininho", "Sino de Prata", "Sininho de Prata", "Sino Pequeno", "Sineta do Maestro", "Sininho do Santuário", "Guizo de Ronda", "Sininho das Fadas", "Sino do Festival", "Sino da Porta"] },
  { id: "pergaminho", names: ["Pergaminho", "Pergaminho Antigo", "Pergaminho do Brinde"] },
  { id: "incensario", names: ["Incensário"] },
  { id: "cajado", names: ["Cajado"] },
];

const ITEM_BY_NAME = new Map(ITEM_ART.flatMap((a) => a.names.map((n) => [n, a.id] as const)));

/** Ilustração de um objeto pelo nome exato (ou null: fica o emoji). */
export function itemArt(label: string): string | null {
  const id = ITEM_BY_NAME.get(label);
  return id ? `/items/${id}.webp` : null;
}

/** Ilustração de um personagem ou objeto pelo nome (ou null: fica o emoji). */
export function artOf(label: string): string | null {
  const m = castByName(label);
  return m ? castImg(m) : itemArt(label);
}
