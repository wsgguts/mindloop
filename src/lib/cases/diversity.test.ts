// Guarda contra repetição: títulos, histórias, personagens, estruturas de raciocínio e padrões de pistas.
// Se alguém acrescentar ou reescrever histórias (stories/*.ts) copiando uma antiga, ou se o gerador voltar a
// produzir casos vizinhos parecidos, estes testes falham e dizem onde.
import { describe, expect, it } from "vitest";
import { ALL_GAMES } from "../games";
import { allCases, casesOf } from "./catalog";
import { caseLevels } from "./config";
import { CASES_DATA } from "./data";
import { clueCount, sizeOf, signature } from "./generate";
import { deduce } from "./model";
import { STRUCTURES, structurePlan } from "./structures";
import { KIND_OF, STORIES } from "./themes";
import type { Difficulty } from "./config";

const words = (t: string) => new Set(t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z]{4,}/g) ?? []);
const STOP = new Set(["cada", "como", "mesmo", "mesma", "para", "pela", "pelo", "antes", "depois", "precisa", "quer", "agora", "entre", "todo", "toda", "todos", "uma", "dele", "dela", "eles", "elas", "onde", "qual", "quem", "sobre", "ainda", "mais", "isso", "esta", "este", "seus", "suas", "outro", "outra", "vezes", "nada", "tudo"]);
const jaccard = (a: Set<string>, b: Set<string>) => {
  const A = [...a].filter((w) => !STOP.has(w)), B = new Set([...b].filter((w) => !STOP.has(w)));
  const inter = A.filter((w) => B.has(w)).length;
  return inter / (A.length + B.size - inter || 1);
};

describe("histórias: originalidade", () => {
  const stories = Object.values(STORIES).flat();

  it("uma história por caso, em todos os jogos, sem reaproveitar nenhuma", () => {
    for (const g of ALL_GAMES) expect(STORIES[g].length, g).toBe(caseLevels(g).length);
    expect(new Set(stories.map((s) => s.key)).size).toBe(stories.length);
    expect(new Set(CASES_DATA.map((c) => c.story)).size).toBe(CASES_DATA.length);
  });

  it("todos os títulos são únicos e nenhum par é quase igual", () => {
    const titles = allCases().map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (let i = 0; i < titles.length; i++) for (let j = i + 1; j < titles.length; j++) {
      expect(jaccard(words(titles[i]), words(titles[j])), `${titles[i]} × ${titles[j]}`).toBeLessThan(0.5);
    }
  });

  it("nenhuma história é a outra com nomes trocados (introduções e desfechos bem diferentes)", () => {
    for (let i = 0; i < stories.length; i++) for (let j = i + 1; j < stories.length; j++) {
      const [a, b] = [stories[i], stories[j]];
      expect(jaccard(words(a.intro), words(b.intro)), `${a.key} × ${b.key}`).toBeLessThan(0.3);
      expect(jaccard(words(a.ending), words(b.ending)), `${a.key} × ${b.key} (desfecho)`).toBeLessThan(0.4);
    }
  });

  it("personagens, objetos e lugares não são reciclados entre histórias do mesmo jogo", () => {
    for (const g of ALL_GAMES) {
      const ss = STORIES[g];
      for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {
        const A = new Set(ss[i].slots.map((e) => e.label));
        const shared = ss[j].slots.filter((e) => A.has(e.label)).length;
        expect(shared, `${ss[i].key} × ${ss[j].key}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("cada história tem elementos suficientes para o tamanho do seu caso, e os números citados batem", () => {
    const N: Record<string, number> = { dois: 2, duas: 2, "três": 3, quatro: 4, cinco: 5, seis: 6, oito: 8 };
    for (const c of CASES_DATA) {
      const s = STORIES[c.game].find((x) => x.key === c.story)!;
      const n = sizeOf(KIND_OF[c.game], c.chapter).n;
      expect(s.slots.length, s.key).toBeGreaterThanOrEqual(n);
      if (KIND_OF[c.game] === "pattern") expect(s.values, s.key).toHaveLength(2);
      // "quatro objetos", "seis moedas"… na introdução precisam ser o número real de elementos.
      for (const [w, k] of Object.entries(N)) {
        const m = s.intro.match(new RegExp(`\\b${w}\\s+(\\p{L}+)`, "iu"));
        if (m && /^(amigos|caracóis|sinos|frascos|fósseis|passageiros|espeleólogos|participantes|meteoros|engrenagens|pombos|objetos|flores|finalistas|astrônomos|filhotes|crianças|navios|portões|selos|magos|tartarugas|robôs|minissubmarinos|discos|ampulhetas|pontos|ilhas|recintos|lugares|cidades|corpos|mundos|sapos|vasos|gatos|moedas|luas|lâmpadas|vagões|atores|ninhos|clientes|remadores|jarros|aprendizes|torres|bustos|malabaristas|livros|camelos|aquários|semáforos|pescadores|estrelas|guardas|árvores|montadores|azulejos|guardiões|achados|convidados|peças|equipamentos|amigos|astros)$/i.test(m[1]))
          expect(k, `${s.key}: "${m[0]}"`).toBe(n);
      }
    }
  });

  it("variedade de universos e de tons em cada jogo, sem dois vizinhos no mesmo universo", () => {
    for (const g of ALL_GAMES) {
      const ss = STORIES[g];
      expect(new Set(ss.map((s) => s.universe)).size, g).toBeGreaterThanOrEqual(15);
      expect(new Set(ss.map((s) => s.tone)).size, g).toBeGreaterThanOrEqual(4);
      for (let i = 1; i < ss.length; i++) expect(ss[i].universe, `${ss[i - 1].key} → ${ss[i].key}`).not.toBe(ss[i - 1].universe);
    }
    expect(new Set(stories.map((s) => s.universe)).size).toBeGreaterThanOrEqual(25);
  });

  it("não é tudo roubo, sumiço ou cofre", () => {
    const crime = allCases().filter((c) => /roub|ladr|cofre|furt|sumiu|desapare/i.test(`${c.title} ${c.story}`));
    expect(crime.length / allCases().length).toBeLessThan(0.15);
  });
});

describe("estruturas investigativas: o raciocínio varia de verdade", () => {
  it("cada caso tem a forma de raciocínio que diz ter (conferida na dedução real)", () => {
    for (const c of CASES_DATA) {
      const ded = deduce(c.model, c.clues);
      expect(STRUCTURES[c.structure].need({ m: c.model, clues: c.clues, ded, difficulty: c.difficulty }), `${c.id} (${c.structure})`).toBe(true);
    }
  });

  it("cada jogo usa várias estruturas, e o banco usa todas", () => {
    for (const g of ALL_GAMES) expect(new Set(casesOf(g).map((c) => c.structure)).size, g).toBeGreaterThanOrEqual(6);
    expect(new Set(CASES_DATA.map((c) => c.structure)).size).toBe(Object.keys(STRUCTURES).length);
  });

  it("casos vizinhos nunca repetem estrutura, combinação de pistas ou resposta", () => {
    for (const g of ALL_GAMES) {
      const cs = CASES_DATA.filter((c) => c.game === g);
      for (let i = 1; i < cs.length; i++) {
        const [a, b] = [cs[i - 1], cs[i]];
        expect(b.structure, `${a.id} → ${b.id}`).not.toBe(a.structure);
        expect(signature(b.clues), `${a.id} → ${b.id}`).not.toBe(signature(a.clues));
        expect(b.sol.join(), `${a.id} → ${b.id}`).not.toBe(a.sol.join());
      }
    }
  });

  it("nunca três casos seguidos com a mesma quantidade de pistas (e quase sempre muda de um para o outro)", () => {
    for (const g of ALL_GAMES) {
      const n = CASES_DATA.filter((c) => c.game === g).map((c) => clueCount(c.clues));
      let same = 0;
      for (let i = 1; i < n.length; i++) {
        if (n[i] === n[i - 1]) same++;
        if (i >= 2) expect(n[i] === n[i - 1] && n[i] === n[i - 2], `${g}: casos ${i - 1}–${i + 1}`).toBe(false);
      }
      expect(same / (n.length - 1), g).toBeLessThan(0.25);
    }
  });

  it("a agenda de estruturas não repete a estrutura do caso anterior", () => {
    for (const g of ALL_GAMES) {
      const plan = structurePlan(g, KIND_OF[g], CASES_DATA.filter((c) => c.game === g).map((c) => c.difficulty));
      for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1]);
    }
  });

  it("a primeira dica ensina o jeito de pensar da estrutura (não é igual para todos os casos)", () => {
    for (const g of ALL_GAMES) expect(new Set(casesOf(g).map((c) => c.hints[0])).size, g).toBeGreaterThanOrEqual(5);
  });
});

describe("dificuldade: cresce pela lógica, não pelo texto", () => {
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  it("os mistérios Mestre exigem mais pistas e mais etapas encadeadas que os Iniciante", () => {
    for (const g of ALL_GAMES) {
      const by = (d: Difficulty) => CASES_DATA.filter((c) => c.game === g && c.difficulty === d);
      const steps = (d: Difficulty) => mean(by(d).map((c) => deduce(c.model, c.clues).rounds));
      const clues = (d: Difficulty) => mean(by(d).map((c) => clueCount(c.clues)));
      expect(clues(4), g).toBeGreaterThan(clues(1));
      expect(steps(4), g).toBeGreaterThanOrEqual(steps(1));
    }
  });

  it("textos de tamanho de celular: introdução curta e objetiva", () => {
    for (const c of allCases()) {
      expect(c.story.length, c.id).toBeLessThanOrEqual(330);
      expect(c.goal.length, c.id).toBeLessThanOrEqual(80);
    }
  });
});
