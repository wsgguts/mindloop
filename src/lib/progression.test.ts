import { describe, expect, it } from "vitest";
import { LEVELS_PER_GAME, currentLevel, doneCount, emptyProgress, focusLevel, isComplete, isDone, isUnlocked, markDone, parseLevel, parseProgress } from "./journey";
import { formatTime, parseTimes, recordTime, spokenTime } from "./records";

const upTo = (n: number) => "1".repeat(n) + "0".repeat(LEVELS_PER_GAME - n);
const ALL = "1".repeat(LEVELS_PER_GAME);

describe("progressão: retorno à jornada", () => {
  it("concluiu o nível 15 → volta com o 16 destacado; 1–15 continuam concluídos", () => {
    const after = markDone(upTo(14), 15);
    expect(focusLevel(after, 15)).toBe(16);
    for (let n = 1; n <= 15; n++) expect(isDone(after, n)).toBe(true);
    expect(isDone(after, 16)).toBe(false);
    expect(isUnlocked(after, 16)).toBe(true);
    expect(isUnlocked(after, 17)).toBe(false); // demais seguem as regras de desbloqueio
  });

  it("jornada em andamento: repetir um nível antigo devolve ao ponto em que a pessoa parou", () => {
    const p = upTo(20);
    const after = markDone(p, 5);
    expect(after).toBe(p); // repetir não altera o progresso
    expect(focusLevel(after, 5)).toBe(21);
  });

  it("concluir o nível 100 pela primeira vez completa a jornada e mantém o 100 como referência", () => {
    const after = markDone(upTo(99), 100);
    expect(isComplete(after)).toBe(true);
    expect(focusLevel(after, 100)).toBe(100);
  });

  it("jornada completa: todas as 100 fases ficam concluídas e liberadas", () => {
    expect(doneCount(ALL)).toBe(100);
    for (let n = 1; n <= 100; n++) { expect(isDone(ALL, n)).toBe(true); expect(isUnlocked(ALL, n)).toBe(true); }
  });

  it("jornada completa: repetir o nível 25 mantém tudo concluído e volta ao 25 (nunca ao 100)", () => {
    const after = markDone(ALL, 25);
    expect(after).toBe(ALL);
    expect(focusLevel(after, 25)).toBe(25);
    expect(focusLevel(after, 25)).not.toBe(currentLevel(after)); // currentLevel sozinho apontaria para o 100
    // Repetições em sequência: a referência acompanha sempre o último nível jogado.
    expect(focusLevel(markDone(after, 3), 3)).toBe(3);
    expect(focusLevel(markDone(after, 87), 87)).toBe(87);
  });

  it("jornada completa sem último nível salvo (ou inválido) usa o último nível", () => {
    expect(focusLevel(ALL, null)).toBe(100);
    expect(focusLevel(ALL, 0)).toBe(100);
    expect(focusLevel(ALL, 101)).toBe(100);
  });

  it("progresso e último nível sobrevivem a recarregar (ida e volta pelo armazenamento)", () => {
    const saved = markDone(ALL, 25);
    expect(parseProgress(saved)).toBe(ALL);
    expect(parseLevel(String(25))).toBe(25);
    expect(focusLevel(parseProgress(saved), parseLevel("25"))).toBe(25);
    expect(parseLevel("abc")).toBeNull();
    expect(parseLevel("0")).toBeNull();
    expect(parseLevel(null)).toBeNull();
    expect(focusLevel(parseProgress(emptyProgress()), parseLevel("40"))).toBe(1); // jornada nova ignora referência antiga
  });
});

describe("tempo das partidas", () => {
  it("formata minutos e segundos", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(999)).toBe("00:00");
    expect(formatTime(75_000)).toBe("01:15");
    expect(formatTime(59 * 60_000 + 59_000)).toBe("59:59");
    expect(formatTime(3_725_000)).toBe("1:02:05");
    expect(formatTime(-5)).toBe("00:00");
  });
  it("descreve o tempo por extenso para leitores de tela", () => {
    expect(spokenTime(1_000)).toBe("1 segundo");
    expect(spokenTime(75_000)).toBe("1 minuto e 15 segundos");
    expect(spokenTime(120_000)).toBe("2 minutos");
    expect(spokenTime(3_725_000)).toBe("1 hora, 2 minutos e 5 segundos");
  });
  it("guarda o melhor tempo de cada nível; repetir só troca se for melhor", () => {
    let r = recordTime({}, 15, 90_000);
    expect(r).toMatchObject({ best: 90_000, previous: null, isRecord: false });
    r = recordTime(r.times, 15, 120_000);
    expect(r).toMatchObject({ best: 90_000, previous: 90_000, isRecord: false });
    r = recordTime(r.times, 15, 60_000);
    expect(r).toMatchObject({ best: 60_000, previous: 90_000, isRecord: true });
    expect(r.times[15]).toBe(60_000);
  });
  it("ignora tempos salvos inválidos", () => {
    expect(parseTimes(null)).toEqual({});
    expect(parseTimes("lixo")).toEqual({});
    expect(parseTimes("[1,2]")).toEqual({});
    expect(parseTimes(JSON.stringify({ 3: 5000, 0: 10, 101: 10, 7: -1, 8: "x" }))).toEqual({ 3: 5000 });
  });
});
