// Mindloop Investigação — estruturas investigativas: a FORMA do raciocínio de cada caso.
// A história diz "o quê"; a estrutura diz "como se pensa". Cada estrutura escolhe que tipos de pista entram no
// sorteio e traz um teste (need) que é conferido na dedução real do caso: um caso "por exclusão" só é aceito se
// de fato não houver nenhuma pista direta, um caso de "contradição reveladora" só se uma pista de duas
// possibilidades for desempatada por outra pista, e assim por diante. Assim a variedade é lógica, não só de texto.

import type { JourneyGame } from "../journey";
import type { Difficulty } from "./config";
import { type CaseKind, type Clue, type ClueKind, type Deduction, type Model, involved, isRule } from "./model";

export type StructureId =
  | "progressiva" | "exclusao" | "cruzamento" | "sequencia" | "equilibrio"
  | "espacial" | "alinhamento" | "percurso" | "restricoes" | "contradicao" | "indireta";

export interface Structure {
  id: StructureId;
  /** Nome curto mostrado ao jogador ("Raciocínio: Por exclusão"). */
  name: string;
  /** Tipos de pista que podem entrar no sorteio, por tipo de caso. */
  kinds: Partial<Record<CaseKind, ClueKind[]>>;
  /** Pistas diretas ("X é 3") permitidas. */
  maxIs: number;
  /** Exceções por tipo de caso (o Tango precisa de uma âncora para sair da simetria). */
  maxIsBy?: Partial<Record<CaseKind, number>>;
  /** Peso extra no sorteio (pistas que dão o "sabor" da estrutura). */
  favor?: Partial<Record<ClueKind, number>>;
  /** Primeira dica: ensina o jeito de pensar desta estrutura. */
  hint: string;
  /** Confere se o caso pronto tem mesmo esta forma de raciocínio. */
  need: (x: Shape) => boolean;
}

/** O que se sabe de um caso pronto para conferir a estrutura. */
export interface Shape { m: Model; clues: Clue[]; ded: Deduction; difficulty: Difficulty }

const own = (x: Shape) => x.clues.filter((c) => !isRule(c));
const count = (x: Shape, ...ks: ClueKind[]) => own(x).filter((c) => ks.includes(c.k)).length;
const singles = (x: Shape) => own(x).filter((c) => involved(x.m, c).length === 1).length;
const relations = (x: Shape) => own(x).filter((c) => involved(x.m, c).length > 1).length;
const relational = (x: Shape, i: number) => !isRule(x.clues[i]) && involved(x.m, x.clues[i]).length > 1;
/**
 * Alguma descoberta exigiu cruzar informações: ou uma casa foi decidida por duas pistas juntas, ou uma relação
 * só funcionou porque outra relação, diferente, já tinha decidido uma das casas dela (cadeia de relações).
 */
const combined = (x: Shape) => {
  const fixedBy = new Map<number, number | string>();
  for (const s of x.ded.steps) {
    if (typeof s.by === "number") {
      if (s.uses.some((u) => u !== s.by)) return true;
      const by = s.by;
      if (relational(x, by) && involved(x.m, x.clues[by]).some((t) => {
        const f = fixedBy.get(t);
        return t !== s.s && typeof f === "number" && f !== by && relational(x, f);
      })) return true;
    }
    fixedBy.set(s.s, s.by);
  }
  return false;
};
/** Casas decididas diretamente pelas regras fixas do caso (equilíbrio, sem trincas, estradas). */
const ruleSteps = (x: Shape) => x.ded.steps.filter((s) => typeof s.by === "number" && isRule(x.clues[s.by])).length;
const kindsUsed = (x: Shape) => new Set(own(x).map((c) => c.k)).size;
/** Zip e Tango têm menos tipos de pista e regras fortes (mapa, equilíbrio): exigem menos relações para a mesma forma. */
const fewKinds = (x: Shape) => x.m.kind === "route" || x.m.kind === "pattern";
const negatives = (x: Shape) => count(x, "not", "either", "apart", "parity") + own(x).filter((c) => c.k === "countIn" && (c.n === 0 || c.n === 1)).length;

export const STRUCTURES: Record<StructureId, Structure> = {
  progressiva: {
    id: "progressiva", name: "Descoberta progressiva", maxIs: 1, favor: { lt: 1.5, next: 2, same: 1.5, opp: 1.5, touch: 1.5, between: 1.5 },
    kinds: {
      code: ["is", "lt", "next", "between", "diff", "parity"], pattern: ["is", "same", "opp"],
      route: ["is", "lt", "next", "between"], layout: ["is", "touch", "left", "above", "sameRow", "sameCol"],
    },
    hint: "Este caso tem um ponto de partida firme: uma única pista diz exatamente uma resposta. Comece por ela — cada descoberta destrava a pista seguinte, como uma trilha de migalhas.",
    need: (x) => count(x, "is") === 1 && x.ded.rounds >= 2,
  },
  exclusao: {
    id: "exclusao", name: "Por exclusão", maxIs: 0, favor: { not: 3, either: 2, apart: 3, countIn: 2, parity: 1.5 },
    kinds: {
      code: ["not", "either", "parity", "lt", "diff"], pattern: ["countIn", "opp", "same"],
      route: ["not", "either", "lt", "diff"], layout: ["not", "apart", "either", "row", "col", "left", "above"],
    },
    hint: "Nenhuma pista aponta a resposta diretamente. Faça o contrário: anote o que NÃO pode ser. Quando só sobrar uma possibilidade num lugar, ela é a certa.",
    need: (x) => count(x, "is") === 0 && (negatives(x) >= 2 || (fewKinds(x) && negatives(x) >= 1)),
  },
  cruzamento: {
    id: "cruzamento", name: "Cruzamento de informações", maxIs: 0, maxIsBy: { pattern: 1 }, favor: { lt: 2, diff: 2, sum: 1.5, same: 2, opp: 2, touch: 2, left: 2, above: 2, next: 2, twice: 2 },
    kinds: {
      code: ["lt", "next", "diff", "sum", "twice", "parity", "not"], pattern: ["same", "opp", "countIn", "is"],
      route: ["lt", "next", "diff", "between", "not"], layout: ["touch", "apart", "left", "above", "sameRow", "sameCol", "row", "col"],
    },
    hint: "Aqui as pistas valem pouco sozinhas. Procure duas que falam da mesma coisa e leia-as juntas: o que uma deixa em aberto, a outra fecha — e cada descoberta liga uma pista à seguinte.",
    need: (x) => singles(x) <= 1 && relations(x) >= (fewKinds(x) ? 2 : 3) && combined(x),
  },
  sequencia: {
    id: "sequencia", name: "Reconstrução da ordem", maxIs: 0, favor: { lt: 3, next: 3, between: 3 },
    kinds: { code: ["lt", "next", "between", "parity", "not", "either"], route: ["lt", "next", "between", "not", "either"] },
    hint: "Organize tudo numa fila ordenada — do menor para o maior, ou do primeiro para o último. As pistas de comparação (antes, depois, a mais, entre) encaixam os itens uns nos outros; comece pelo que só pode ficar numa das pontas.",
    need: (x) => count(x, "lt", "next", "between") >= 2 && count(x, "is") === 0,
  },
  equilibrio: {
    id: "equilibrio", name: "Problema de equilíbrio", maxIs: 1, favor: { sum: 4, countIn: 4, twice: 2 },
    kinds: { code: ["sum", "twice", "lt", "parity", "not", "is"], pattern: ["countIn", "same", "opp", "is"] },
    hint: "Este caso é sobre contas que precisam fechar. Veja quais combinações chegam ao total pedido — normalmente são poucas — e corte as que entram em conflito com o resto.",
    need: (x) => count(x, "sum", "countIn") >= 1 && (x.m.kind !== "code" || count(x, "sum", "twice") >= 2 || x.difficulty <= 2),
  },
  espacial: {
    id: "espacial", name: "Investigação espacial", maxIs: 1, favor: { row: 3, col: 3, left: 2, above: 2 },
    kinds: { layout: ["row", "col", "left", "above", "is", "not"] },
    hint: "Pense em linhas e colunas separadamente: primeiro descubra em que linha cada coisa fica, depois em que coluna. O cruzamento das duas dá a casa.",
    need: (x) => count(x, "row", "col") >= 2 && count(x, "left", "above") >= 1,
  },
  alinhamento: {
    id: "alinhamento", name: "Organização por vizinhança", maxIs: 1, favor: { sameRow: 4, sameCol: 4, touch: 2, apart: 2 },
    kinds: { layout: ["sameRow", "sameCol", "touch", "apart", "row", "col", "is"] },
    hint: "As pistas falam de quem está junto de quem. Agrupe: quem divide linha, quem divide coluna, quem encosta. Os grupos só cabem na grade de poucos jeitos.",
    need: (x) => count(x, "sameRow", "sameCol") >= 1 && count(x, "touch", "apart") >= 1,
  },
  percurso: {
    id: "percurso", name: "Planejamento de percurso", maxIs: 1, favor: { is: 2, not: 2 },
    kinds: { route: ["is", "not", "lt", "either"] },
    hint: "O próprio mapa é a maior pista. Lugares com uma só ligação precisam ser começo ou fim, e um caminho que passa uma vez por tudo não pode voltar atrás.",
    need: (x) => own(x).length <= 2 && x.ded.steps.filter((s) => s.by !== "distinct" && s.by !== "only" && isRule(x.clues[s.by as number])).length >= 1,
  },
  restricoes: {
    id: "restricoes", name: "Restrições simultâneas", maxIs: 0, maxIsBy: { pattern: 1 },
    kinds: {
      code: ["not", "lt", "next", "diff", "sum", "parity", "twice", "between", "either"], pattern: ["same", "opp", "countIn", "is"],
      route: ["not", "lt", "next", "diff", "between", "either"], layout: ["row", "col", "left", "above", "touch", "apart", "sameRow", "sameCol", "not", "either"],
    },
    hint: "Muitas regras valem ao mesmo tempo, de tipos diferentes. Faça uma tabela mental: para cada item, risque o que cada pista proíbe. As certezas aparecem no cruzamento de várias regras.",
    // O Tango só tem três tipos de relação (igual, diferente, contagem): lá bastam três tipos ao mesmo tempo.
    need: (x) => kindsUsed(x) >= (x.m.kind === "pattern" ? 3 : 4) && combined(x),
  },
  indireta: {
    id: "indireta", name: "Pista indireta", maxIs: 1, favor: { countIn: 1.5, same: 1.5 },
    kinds: { pattern: ["is", "same", "opp", "countIn"] },
    hint: "Aqui as regras fixas fazem metade do trabalho. Cada pista parece pequena, mas, junto com “metade de cada” e “nunca três iguais seguidos”, ela decide casas que nem cita. Pergunte-se: o que a regra obriga depois disso?",
    need: (x) => ruleSteps(x) >= 2 && own(x).length <= 4,
  },
  contradicao: {
    id: "contradicao", name: "Contradição reveladora", maxIs: 0, favor: { either: 4 },
    kinds: {
      code: ["either", "lt", "next", "diff", "sum", "parity", "not"],
      route: ["either", "lt", "next", "between", "not"], layout: ["either", "touch", "apart", "left", "above", "row", "col"],
    },
    hint: "Uma pista oferece duas possibilidades e as duas parecem boas. Suponha cada uma e veja qual delas bate de frente com outra pista — a que gera contradição cai.",
    // Existe uma pista "X é A ou B" cuja resposta só se decide com ajuda de outra pista (ou da regra de não repetir).
    need: (x) => own(x).length >= (fewKinds(x) ? 2 : 3) && x.clues.some((c, i) => {
      if (c.k !== "either") return false;
      const st = x.ded.steps.find((s) => s.s === c.s);
      if (!st) return false;
      const helpers = new Set([...st.uses, ...(typeof st.by === "number" ? [st.by] : [])]);
      return helpers.has(i) && (helpers.size >= 2 || typeof st.by !== "number");
    }),
  },
};

/** Estruturas possíveis em cada dificuldade, por tipo de caso (as primeiras ensinam; as últimas exigem mais). */
export const POOLS: Record<CaseKind, Record<Difficulty, StructureId[]>> = {
  code: {
    1: ["progressiva", "exclusao", "sequencia"],
    2: ["equilibrio", "progressiva", "contradicao", "sequencia", "exclusao"],
    3: ["cruzamento", "equilibrio", "contradicao", "sequencia", "restricoes"],
    4: ["restricoes", "cruzamento", "equilibrio", "contradicao", "sequencia"],
  },
  pattern: {
    1: ["progressiva", "equilibrio", "indireta"],
    2: ["equilibrio", "indireta", "progressiva", "cruzamento"],
    3: ["cruzamento", "equilibrio", "indireta", "restricoes", "exclusao"],
    4: ["restricoes", "exclusao", "cruzamento", "equilibrio", "indireta"],
  },
  route: {
    1: ["percurso", "progressiva", "sequencia"],
    2: ["sequencia", "percurso", "exclusao", "contradicao"],
    3: ["contradicao", "sequencia", "exclusao", "cruzamento"],
    4: ["cruzamento", "contradicao", "sequencia", "exclusao"],
  },
  layout: {
    1: ["espacial", "progressiva", "alinhamento"],
    2: ["alinhamento", "espacial", "exclusao", "contradicao"],
    3: ["cruzamento", "alinhamento", "exclusao", "restricoes", "espacial"],
    4: ["restricoes", "cruzamento", "contradicao", "exclusao"],
  },
};

/**
 * Agenda de estruturas de um jogo (uma por caso, na ordem da jornada). Sorteio determinístico (semente = jogo)
 * entre as estruturas da dificuldade que não apareceram nos dois casos anteriores, dando preferência às menos
 * usadas até ali. Sem rodízio fixo: nem as estruturas nem, por tabela, a quantidade de pistas viram um ciclo.
 */
export function structurePlan(game: JourneyGame, kind: CaseKind, difficulties: Difficulty[]): StructureId[] {
  let seed = [...game].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const out: StructureId[] = [];
  const used = new Map<StructureId, number>();
  for (const d of difficulties) {
    const pool = POOLS[kind][d];
    const [last, before] = [out[out.length - 1], out[out.length - 2]];
    let options = pool.filter((x) => x !== last && x !== before);
    if (!options.length) options = pool.filter((x) => x !== last);
    if (!options.length) options = pool;
    const min = Math.min(...options.map((x) => used.get(x) ?? 0));
    const least = options.filter((x) => (used.get(x) ?? 0) <= min + 1);
    const pickd = least[Math.floor(rnd() * least.length)];
    out.push(pickd);
    used.set(pickd, (used.get(pickd) ?? 0) + 1);
  }
  return out;
}
