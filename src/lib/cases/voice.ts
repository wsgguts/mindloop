// Mindloop Investigação — "voz" de cada história: as palavras com que as pistas são escritas.
// A lógica é sempre a mesma (model.ts), mas "o 2º disco é menor que o 3º" vira "a Lia mora num andar abaixo do Téo"
// ou "o Frasco Âmbar leva menos gotas que o Frasco Verde": a pista passa a fazer parte da história.
// Os textos são modelos com marcadores, preenchidos em model.ts:
//   {a} {b} {s}          → "o Téo", "a Lia" (com artigo)
//   {de_a} {de_b} {de_s} → "do Téo", "da Lia"
//   {list} {de_list}     → "a Ana, o Bento e o Caio" / "da Ana, do Bento e do Caio"
//   {n} {x} {y} {d} {t} {V} → números
//   {n|gota|gotas}       → "1 gota", "3 gotas" (vale para n, x, y, d, t)
//   {par}                → "par" ou "ímpar"

import type { Ent } from "./model";

/** Mini Sudoku: cada personagem/objeto recebe um número diferente. */
export interface CodeVoice {
  is: string; not: string; either: string; lt: string; next: string; diff: string;
  sum: string; parity: string; twice: string; between: string;
  /** Regra fixa mostrada à parte (sem número): o que os números significam e que não se repetem. */
  rule: string;
}

/** Tango: cada elemento da fileira recebe um de dois valores (metade de cada, nunca três iguais seguidos). */
export interface PatternVoice {
  /** "leva"/"levam". */
  verb: [string, string];
  /** Categoria dos dois valores: "símbolo", "cor", "sabor"… (gênero define "o mesmo"/"a mesma"). */
  kind: Ent;
  /** "fila", "fileira", "varal"… */
  line: Ent;
  /** Sem artigo antes do valor ("o Rui pediu calabresa", "a Ika é gelada"). */
  bare?: boolean;
  /** Frases próprias (marcadores {a} {b} {h}) para quando o padrão não soa bem. */
  same?: string; opp?: string; count?: string; triple?: string;
}

/** Zip: a ordem de um percurso que passa uma vez por cada lugar. */
export interface RouteVoice {
  /** "parada", "escala", "pouso"… (gênero define "3ª parada"/"3º pouso"). */
  stop: Ent;
  /** "estrada", "trilha", "túnel"… */
  road: Ent;
  /** Quem percorre: "A expedição", "O carteiro". */
  actor: string;
  /** Complemento de "veio antes de…": "no caminho", "na rota". */
  path: string;
}

/** Patches: onde cada elemento fica numa grade. */
export interface LayoutVoice {
  /** "casa", "nicho", "canteiro"… */
  cell: Ent;
  /** Regra fixa: "Cada nicho guarda no máximo uma relíquia." */
  rule: string;
}

export type Voice = CodeVoice | PatternVoice | RouteVoice | LayoutVoice;

// ---------------------------------------------------------------- vozes prontas do Mini Sudoku

/** Números genéricos com um verbo: "o Disco Sol marca 3". */
export function numero(v = "marca", what = "número"): CodeVoice {
  return {
    is: `{a} ${v} {n}`, not: `{a} não ${v} {n}`, either: `{a} ${v} {x} ou {y}`,
    lt: `{a} ${v} um ${what} menor que {b}`, next: `{b} ${v} exatamente 1 a mais que {a}`,
    diff: `A diferença entre {a} e {b} é {d}`, sum: `{list} somam {t}`, parity: `{a} ${v} um ${what} {par}`,
    twice: `{a} ${v} o dobro {de_b}`, between: `{s} ${v} mais que {a} e menos que {b}`,
    rule: `Cada um ${v} um ${what} diferente, de 1 a {V}.`,
  };
}

/** Andares de um prédio/torre: "a Lia mora no 3º andar". */
export function andar(v = "mora", place = "andar", places = "andares"): CodeVoice {
  return {
    is: `{a} ${v} no {n}º ${place}`, not: `{a} não ${v} no {n}º ${place}`, either: `{a} ${v} no {x}º ou no {y}º ${place}`,
    lt: `{a} ${v} num ${place} abaixo {de_b}`, next: `{b} ${v} exatamente um ${place} acima {de_a}`,
    diff: `{a} e {b} estão a {d|${place}|${places}} de distância`, sum: `Somando os ${places} {de_list}, o total é {t}`,
    parity: `{a} ${v} num ${place} {par}`, twice: `O ${place} {de_a} é o dobro do ${place} {de_b}`,
    between: `{s} ${v} acima {de_a} e abaixo {de_b}`,
    rule: `Cada um ${v} num ${place} diferente, do 1º ao {V}º.`,
  };
}

/** Datas de um calendário: "o Cometa apareceu no dia 3". */
export function dia(v = "chegou", unit = "dia", f = false): CodeVoice {
  const no = f ? "na" : "no", num = f ? "numa" : "num", um = f ? "uma" : "um", o = f ? "a" : "o", os = f ? "as" : "os";
  return {
    is: `{a} ${v} ${no} ${unit} {n}`, not: `{a} não ${v} ${no} ${unit} {n}`, either: `{a} ${v} ${no} ${unit} {x} ou ${no} ${unit} {y}`,
    lt: `{a} ${v} antes {de_b}`, next: `{b} ${v} exatamente ${um} ${unit} depois {de_a}`,
    diff: `Há {d|${unit}|${unit}s} de diferença entre {a} e {b}`, sum: `Somando ${os} ${unit}s {de_list}, dá {t}`,
    parity: `{a} ${v} ${num} ${unit} {par}`, twice: `${o.toUpperCase()} ${unit} {de_a} é o dobro d${o} ${unit} {de_b}`,
    between: `{s} ${v} depois {de_a} e antes {de_b}`,
    rule: `Cada um ${v} ${num} ${unit} diferente, entre ${o} ${unit} 1 e ${o} ${unit} {V}.`,
  };
}

/** Quantidades com unidade: "o Frasco Âmbar leva 3 gotas". u/us = singular/plural, f = unidade feminina. */
export function quantidade(u: string, us: string, f: boolean, v = "tem", vpl = "têm"): CodeVoice {
  const um = f ? "uma" : "um";
  return {
    is: `{a} ${v} {n|${u}|${us}}`, not: `{a} não ${v} {n|${u}|${us}}`, either: `{a} ${v} {x} ou {y|${u}|${us}}`,
    lt: `{a} ${v} menos ${us} que {b}`, next: `{b} ${v} exatamente ${um} ${u} a mais que {a}`,
    diff: `{a} e {b} ${vpl} {d|${u}|${us}} de diferença`, sum: `Somando {list}, são {t|${u}|${us}}`,
    parity: `{a} ${v} um número {par} de ${us}`, twice: `{a} ${v} o dobro de ${us} {de_b}`,
    between: `{s} ${v} mais ${us} que {a} e menos que {b}`,
    rule: `Cada um ${v} uma quantidade diferente de ${us}, de 1 a {V}.`,
  };
}

/** Colocação numa prova/fila: "o Téo chegou em 2º lugar" (1º = o primeiro). */
export function ordem(v = "chegou", pos = "lugar"): CodeVoice {
  return {
    is: `{a} ${v} em {n}º ${pos}`, not: `{a} não ${v} em {n}º ${pos}`, either: `{a} ${v} em {x}º ou em {y}º ${pos}`,
    lt: `{a} ${v} antes {de_b}`, next: `{b} ${v} logo depois {de_a}`,
    diff: `{a} e {b} ficaram a {d|posição|posições} de distância`, sum: `Somando as posições {de_list}, dá {t}`,
    parity: `{a} ${v} numa posição {par}`, twice: `A posição {de_a} é o dobro da posição {de_b}`,
    between: `{s} ${v} depois {de_a} e antes {de_b}`,
    rule: `Não houve empate: cada um ${v} numa posição diferente, entre o 1º e o {V}º ${pos}.`,
  };
}

/** Horários: "o Sino Grave tocou às 3 h". */
export function hora(v = "tocou"): CodeVoice {
  return {
    is: `{a} ${v} às {n} h`, not: `{a} não ${v} às {n} h`, either: `{a} ${v} às {x} h ou às {y} h`,
    lt: `{a} ${v} mais cedo que {b}`, next: `{b} ${v} exatamente uma hora depois {de_a}`,
    diff: `Entre {a} e {b} há {d|hora|horas} de diferença`, sum: `Somando os horários {de_list}, dá {t}`,
    parity: `{a} ${v} numa hora {par}`, twice: `O horário {de_a} é o dobro do horário {de_b}`,
    between: `{s} ${v} depois {de_a} e antes {de_b}`,
    rule: `Cada um ${v} num horário diferente, entre 1 h e {V} h.`,
  };
}

/** Rótulos numerados (quarto 3, vagão 5, gruta 2): "a Dra. Vega usou o telescópio 3". v já traz o artigo ("usou o"). */
export function rotulo(v: string, noun: string, nounPl: string, f = false): CodeVoice {
  const O = f ? "A" : "O", o = f ? "a" : "o", os = f ? "as" : "os", d = f ? "da" : "do", ds = f ? "das" : "dos";
  return {
    is: `{a} ${v} ${noun} {n}`, not: `{a} não ${v} ${noun} {n}`, either: `{a} ${v} ${noun} {x} ou {y}`,
    lt: `${O} ${noun} {de_a} tem número menor que ${o} {de_b}`, next: `O número ${d} ${noun} {de_b} é exatamente 1 a mais que o ${d} ${noun} {de_a}`,
    diff: `Os números ${ds} ${nounPl} {de_a} e {de_b} têm diferença de {d}`, sum: `Somando os números ${ds} ${nounPl} {de_list}, dá {t}`,
    parity: `${O} ${noun} {de_a} tem número {par}`, twice: `O número ${d} ${noun} {de_a} é o dobro do número ${d} ${noun} {de_b}`,
    between: `${O} ${noun} {de_s} tem número maior que ${o} {de_a} e menor que ${o} {de_b}`,
    rule: `${os.charAt(0).toUpperCase() + os.slice(1)} ${nounPl} são numerad${os} de 1 a {V}, e cada um ficou com ${f ? "uma" : "um"} diferente.`,
  };
}

/** Medida de algo que pertence a cada um: "a melancia do Zeca pesa 3 quilos". */
export function posse(noun: string, nounPl: string, f: boolean, v: string, u: string, us: string, uf: boolean): CodeVoice {
  const N = `${f ? "a" : "o"} ${noun}`, Ns = `${f ? "as" : "os"} ${nounPl}`, o = f ? "a" : "o", dN = `${f ? "da" : "do"} ${noun}`, um = uf ? "uma" : "um";
  return {
    is: `${N} {de_a} ${v} {n|${u}|${us}}`, not: `${N} {de_a} não ${v} {n|${u}|${us}}`, either: `${N} {de_a} ${v} {x} ou {y|${u}|${us}}`,
    lt: `${N} {de_a} ${v} menos que ${o} {de_b}`, next: `${N} {de_b} ${v} exatamente ${um} ${u} a mais que ${o} {de_a}`,
    diff: `${Ns} {de_a} e {de_b} têm {d|${u}|${us}} de diferença`, sum: `Somando ${Ns} {de_list}, são {t|${u}|${us}}`,
    parity: `${N} {de_a} ${v} um número {par} de ${us}`, twice: `${N} {de_a} ${v} o dobro ${dN} {de_b}`,
    between: `${N} {de_s} ${v} mais que ${o} {de_a} e menos que ${o} {de_b}`,
    rule: `Cada ${noun} ${v} uma quantidade diferente de ${us}, de 1 a {V}.`,
  };
}

// ---------------------------------------------------------------- vozes prontas do Tango, Zip e Patches

export const fila = (verb: [string, string], kind: Ent, line: Ent = { label: "fila", g: "f" }, extra: Partial<PatternVoice> = {}): PatternVoice => ({ verb, kind, line, ...extra });
export const rota = (stop: Ent, road: Ent, actor: string, path: string): RouteVoice => ({ stop, road, actor, path });
export const grade = (cell: Ent, rule: string): LayoutVoice => ({ cell, rule });

/** Preenche um modelo de texto (marcadores acima). */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t
    .replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, (_, k: string, s: string, p: string) => `${vars[k]} ${Number(vars[k]) === 1 ? s : p}`)
    .replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] !== undefined ? String(vars[k]) : m));
}
