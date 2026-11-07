// Tempo das partidas: formatação do cronômetro e melhores tempos por nível (guardados no aparelho).
// Funções puras, fáceis de testar.

/** 75_000 → "01:15"; a partir de 1 hora → "1:02:05". */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Versão para leitores de tela: "1 minuto e 15 segundos". */
export function spokenTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  const part = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts = [h && part(h, "hora", "horas"), m && part(m, "minuto", "minutos"), (s || (!h && !m)) && part(s, "segundo", "segundos")].filter(Boolean);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}` : String(parts[0]);
}

/** Melhor tempo (ms) de cada nível já concluído: { 15: 95000 }. */
export type Times = Record<number, number>;

/** Lê os tempos salvos; ignora qualquer coisa inválida. */
export function parseTimes(raw: string | null): Times {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out: Times = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const level = Number(k);
      if (Number.isInteger(level) && level >= 1 && level <= 100 && typeof v === "number" && Number.isFinite(v) && v > 0) out[level] = v;
    }
    return out;
  } catch { return {}; }
}

export interface TimeResult { times: Times; best: number; previous: number | null; isRecord: boolean }

/** Registra o tempo de uma partida concluída. Repetir um nível só troca o tempo se for melhor. */
export function recordTime(times: Times, level: number, ms: number): TimeResult {
  const previous = times[level] ?? null;
  const isRecord = previous !== null && ms < previous;
  const best = previous === null ? ms : Math.min(previous, ms);
  return { times: { ...times, [level]: best }, best, previous, isRecord };
}
