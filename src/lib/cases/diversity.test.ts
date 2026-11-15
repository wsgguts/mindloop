// Guarda contra repetição: títulos, histórias, personagens, estruturas de raciocínio e padrões de pistas.
// Se alguém acrescentar ou reescrever histórias (stories/*.ts) copiando uma antiga, ou se o gerador voltar a
// produzir casos vizinhos parecidos, estes testes falham e dizem onde.
import { describe, expect, it } from "vitest";
import { EVERY_GAME } from "../games";
import { allCases, casesOf } from "./catalog";
import { caseLevels } from "./config";
import { CASES_DATA } from "./data";
import { signature } from "./generate";
import { deduce } from "./model";
import { STRUCTURES } from "./structures";
import { STORIES } from "./themes";

const words = (t: string) => new Set(t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z]{4,}/g) ?? []);
const STOP = new Set(["cada", "como", "mesmo", "mesma", "para", "pela", "pelo", "antes", "depois", "precisa", "quer", "agora", "entre", "todo", "toda", "todos", "uma", "dele", "dela", "eles", "elas", "onde", "qual", "quem", "sobre", "ainda", "mais", "isso", "esta", "este", "seus", "suas", "outro", "outra", "vezes", "nada", "tudo", "estava", "tinha", "saber"]);
const jaccard = (a: Set<string>, b: Set<string>) => {
  const A = [...a].filter((w) => !STOP.has(w)), B = new Set([...b].filter((w) => !STOP.has(w)));
  const inter = A.filter((w) => B.has(w)).length;
  return inter / (A.length + B.size - inter || 1);
};

describe("histórias: originalidade", () => {
  const stories = Object.values(STORIES).flat();

  it("uma história por caso, em todos os jogos, sem reaproveitar nenhuma", () => {
    for (const g of EVERY_GAME) expect(STORIES[g].length, g).toBe(caseLevels(g).length);
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

  it("personagens não são reciclados entre histórias do mesmo jogo", () => {
    for (const g of EVERY_GAME) {
      const ss = STORIES[g];
      for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {
        const A = new Set(ss[i].people.map((e) => e.label));
        expect(ss[j].people.filter((e) => A.has(e.label)).length, `${ss[i].key} × ${ss[j].key}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("toda história tem elenco, objetos e um lugar completo (cômodos, móveis e assentos com ícone)", () => {
    for (const s of stories) {
      expect(s.people.length, s.key).toBeGreaterThanOrEqual(4);
      expect(s.objects.length, s.key).toBeGreaterThanOrEqual(4);
      expect(s.rooms.length, s.key).toBeGreaterThanOrEqual(4);
      expect(s.blocks.length, s.key).toBeGreaterThanOrEqual(3);
      expect(s.seats.length, s.key).toBeGreaterThanOrEqual(2);
      for (const e of [...s.people, ...s.objects, ...s.blocks, ...s.seats]) expect(e.icon, `${s.key}: ${e.label}`).toBeTruthy();
      expect(new Set(s.objects.map((o) => o.label)).size, s.key).toBe(s.objects.length);
      // O desfecho só cita objetos que existem.
      const inCase = CASES_DATA.find((c) => c.story === s.key)!.model.objects.map((o) => o.label);
      for (const [, label] of s.ending.matchAll(/\{com:([^}]+)\}/g)) expect(inCase, `${s.key}: ${label}`).toContain(label);
    }
  });

  it("variedade de universos e de tons em cada jogo, sem dois vizinhos no mesmo universo", () => {
    for (const g of EVERY_GAME) {
      const ss = STORIES[g];
      expect(new Set(ss.map((s) => s.universe)).size, g).toBeGreaterThanOrEqual(7);
      expect(new Set(ss.map((s) => s.tone)).size, g).toBeGreaterThanOrEqual(4);
      for (let i = 1; i < ss.length; i++) expect(ss[i].universe, `${ss[i - 1].key} → ${ss[i].key}`).not.toBe(ss[i - 1].universe);
    }
    expect(new Set(stories.map((s) => s.universe)).size).toBeGreaterThanOrEqual(18);
  });

  it("não é tudo roubo ou sumiço", () => {
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

  it("cada jogo usa várias estruturas", () => {
    for (const g of EVERY_GAME) expect(new Set(casesOf(g).map((c) => c.structure)).size, g).toBeGreaterThanOrEqual(5);
    expect(new Set(CASES_DATA.map((c) => c.structure)).size).toBeGreaterThanOrEqual(9);
  });

  it("casos vizinhos nunca repetem estrutura nem combinação de pistas", () => {
    for (const g of EVERY_GAME) {
      const cs = CASES_DATA.filter((c) => c.game === g);
      for (let i = 1; i < cs.length; i++) {
        const [a, b] = [cs[i - 1], cs[i]];
        expect(b.structure, `${a.id} → ${b.id}`).not.toBe(a.structure);
        expect(signature(b.clues), `${a.id} → ${b.id}`).not.toBe(signature(a.clues));
      }
    }
  });

  it("textos de tamanho de celular: introdução curta e pergunta objetiva", () => {
    for (const c of allCases()) {
      expect(c.story.length, c.id).toBeLessThanOrEqual(330);
      expect(c.goal.length, c.id).toBeLessThanOrEqual(80);
    }
  });
});
