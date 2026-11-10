/** Apelido: 2 a 20 caracteres (letras, números, espaço, _ . -). Retorna a mensagem de erro ou null. */
export function validateNick(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Digite um apelido para continuar.";
  if (v.length < 2 || v.length > 20) return "Use de 2 a 20 caracteres.";
  if (!/^[\p{L}\p{N} _.-]+$/u.test(v)) return "Use só letras, números, espaço, _ . ou -.";
  if (isOffensive(v)) return "Esse apelido não é permitido. Escolha outro, sem palavrões ou ofensas.";
  return null;
}

// Filtro básico de palavras ofensivas (o servidor do ranking aplica a mesma lista — supabase/migrations).
// Trechos longos são procurados em qualquer parte do apelido; os curtos só como palavra inteira,
// para não barrar nomes comuns que apenas os contêm.
export const BLOCK_PARTS = ["caralh", "bucet", "porra", "merda", "foder", "fodid", "putaria", "arromb", "boquet", "vagabund",
  "estupr", "pedof", "nazis", "hitler", "piroc", "xoxot", "viadinh", "cuzao", "retardad", "babaca", "desgracad", "filhadaputa", "fdp"];
export const BLOCK_WORDS = ["puta", "puto", "foda", "cu", "viado", "vsf", "pqp", "krl", "nazi", "otario", "otaria", "corno", "bosta"];

/** Minúsculas, sem acento e com troca de números/símbolos usados para disfarçar letras (0→o, 1→i, 3→e…). */
export function normalizeNick(v: string): string {
  return v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/@/g, "a").replace(/\$/g, "s");
}

export function isOffensive(v: string): boolean {
  const n = normalizeNick(v);
  const joined = n.replace(/[^a-z]/g, "");
  if (BLOCK_PARTS.some((p) => joined.includes(p))) return true;
  return n.split(/[^a-z]+/).some((w) => BLOCK_WORDS.includes(w));
}
