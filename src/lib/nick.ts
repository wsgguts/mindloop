/** Apelido: 2 a 20 caracteres (letras, números, espaço, _ . -). Retorna a mensagem de erro ou null. */
export function validateNick(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Digite um apelido para continuar.";
  if (v.length < 2 || v.length > 20) return "Use de 2 a 20 caracteres.";
  if (!/^[\p{L}\p{N} _.-]+$/u.test(v)) return "Use só letras, números, espaço, _ . ou -.";
  return null;
}
