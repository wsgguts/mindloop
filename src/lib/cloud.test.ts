import { afterEach, describe, expect, it, vi } from "vitest";
import { emptySnapshot, hasProgress, mergeSnapshots, normalizeCode, parseIdentityFull, parseSnapshot, readSnapshot, sameSnapshot, syncSnapshot, writeSnapshot, type Identity, type Snapshot } from "./cloud";
import { markDone } from "./journey";
import { addMatch } from "./history";
import { recordSolve } from "./cases/progress";
import { casesOf } from "./cases/catalog";

const mem = () => { const m = new Map<string, string>(); return { m, read: (k: string) => m.get(k) ?? null, write: (k: string, v: string | null) => (v === null ? m.delete(k) : m.set(k, v)) }; };

function sample(): Snapshot {
  const s = emptySnapshot();
  s.progress.sudoku = markDone(markDone(s.progress.sudoku, 1), 2);
  s.times.sudoku = { 1: 30000, 2: 50000 };
  s.history = addMatch(s.history, { id: "sudoku-1-100", game: "sudoku", level: 1, ms: 30000, at: 100, hints: 0, first: true, record: false });
  s.achievements = { "primeiro-cronometro": 100 };
  s.cases = recordSolve(s.cases, casesOf("sudoku")[0], 60000, 1, 200).log;
  s.tutorial.sudoku = "done";
  s.prefs["mindloop:sound"] = '{"on":false,"vol":0.5}';
  return s;
}

describe("snapshot do progresso", () => {
  it("aparelho → snapshot → aparelho preserva tudo", () => {
    const a = mem();
    writeSnapshot(sample(), a.write);
    expect(readSnapshot(a.read)).toEqual(sample());
  });

  it("dados do servidor passam pelos mesmos leitores (lixo vira vazio, nunca quebra)", () => {
    expect(parseSnapshot(JSON.parse(JSON.stringify(sample())))).toEqual(sample());
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ v: 2 })).toBeNull();
    const bad = parseSnapshot({ v: 1, progress: { sudoku: "xyz" }, times: 5, history: "lixo" })!;
    expect(bad.progress.sudoku).toBe(emptySnapshot().progress.sudoku);
    expect(bad.history.matches).toEqual([]);
  });

  it("hasProgress distingue aparelho novo de aparelho com jogo", () => {
    expect(hasProgress(emptySnapshot())).toBe(false);
    expect(hasProgress(sample())).toBe(true);
  });
});

describe("mesclagem (mesmo jogador em dois aparelhos)", () => {
  it("nada conquistado se perde e nada duplica", () => {
    const a = sample();
    const b = emptySnapshot();
    b.progress.sudoku = markDone(b.progress.sudoku, 3);
    b.progress.zip = markDone(b.progress.zip, 1);
    b.times.sudoku = { 1: 20000, 3: 90000 };
    b.history = addMatch(addMatch(b.history, { id: "sudoku-1-100", game: "sudoku", level: 1, ms: 30000, at: 100, hints: 0, first: true, record: false }),
      { id: "zip-1-300", game: "zip", level: 1, ms: 40000, at: 300, hints: 2, first: true, record: false });
    b.achievements = { "primeiro-cronometro": 50, "primeiros-passos": 300 };
    const m = mergeSnapshots(a, b);
    expect(m.progress.sudoku.slice(0, 4)).toBe("1110");
    expect(m.progress.zip[0]).toBe("1");
    expect(m.times.sudoku).toEqual({ 1: 20000, 2: 50000, 3: 90000 });
    expect(m.history.matches.map((x) => x.id)).toEqual(["sudoku-1-100", "zip-1-300"]);
    expect(m.achievements).toEqual({ "primeiro-cronometro": 50, "primeiros-passos": 300 });
    expect(Object.keys(m.cases.records)).toHaveLength(1);
    expect(m.prefs["mindloop:sound"]).toBe(a.prefs["mindloop:sound"]);
  });

  it("é idempotente e não depende da ordem das chaves", () => {
    const a = sample();
    const once = mergeSnapshots(a, a);
    expect(sameSnapshot(once, a)).toBe(true);
    expect(sameSnapshot(mergeSnapshots(once, a), once)).toBe(true);
  });
});

describe("identidade e código de recuperação", () => {
  it("normaliza o código digitado de qualquer jeito", () => {
    expect(normalizeCode("abcd efgh-jkmn pqrs")).toBe("ABCD-EFGH-JKMN-PQRS");
    expect(normalizeCode("ABCD-EFGH")).toBeNull();
  });
  it("lê a identidade antiga (só ranking) e a nova", () => {
    expect(parseIdentityFull('{"id":"a","token":"t","nick":"Lia"}')).toEqual({ id: "a", token: "t", nick: "Lia", recovery: undefined, listed: undefined, rev: undefined });
    expect(parseIdentityFull('{"id":"a","token":"t","nick":"Lia","recovery":"X","listed":false,"rev":3}')?.listed).toBe(false);
    expect(parseIdentityFull("{")).toBeNull();
  });
});

describe("sincronização com o servidor (simulado)", () => {
  const me: Identity = { id: "p1", token: "t1", nick: "Lia" };
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  /** Servidor falso com as mesmas regras do SQL: revisão, STALE e autenticação. */
  function fakeServer(start: { data: Snapshot | null; rev: number }, interfere = 0) {
    const db = { ...start, saves: 0 };
    let left = interfere;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_x");
    vi.stubGlobal("fetch", async (url: string, init: { body: string }) => {
      const fn = url.split("/").pop();
      const b = JSON.parse(init.body);
      const ok = (x: unknown) => new Response(JSON.stringify(x), { status: 200 });
      if (b.p_token !== "t1") return new Response(JSON.stringify({ message: "AUTH" }), { status: 400 });
      if (fn === "load_state") return ok({ data: db.data, rev: db.rev, nick: "Lia", listed: true });
      if (fn === "save_state") {
        if (left > 0) { left--; db.rev++; return new Response(JSON.stringify({ message: "STALE" }), { status: 400 }); }
        if (db.data && b.p_rev !== db.rev) return new Response(JSON.stringify({ message: "STALE" }), { status: 400 });
        db.data = JSON.parse(JSON.stringify(b.p_data)); db.rev++; db.saves++;
        return ok(db.rev);
      }
      return new Response("{}", { status: 404 });
    });
    return db;
  }

  it("primeira sincronização envia o progresso do aparelho", async () => {
    const db = fakeServer({ data: null, rev: 0 });
    const r = await syncSnapshot(me, sample());
    expect(db.saves).toBe(1);
    expect(sameSnapshot(parseSnapshot(db.data)!, sample())).toBe(true);
    expect(r.rev).toBe(1);
  });

  it("aparelho limpo + recuperação: o progresso volta do servidor, sem reenviar nada", async () => {
    const db = fakeServer({ data: sample(), rev: 5 });
    const r = await syncSnapshot(me, emptySnapshot());
    expect(db.saves).toBe(0);
    expect(sameSnapshot(r.merged, sample())).toBe(true);
  });

  it("outro aparelho salvou no meio do caminho (STALE): mescla e tenta de novo", async () => {
    const db = fakeServer({ data: emptySnapshot(), rev: 1 }, 1);
    const r = await syncSnapshot(me, sample());
    expect(db.saves).toBe(1);
    expect(r.rev).toBe(db.rev);
  });

  it("token inválido não grava nada", async () => {
    const db = fakeServer({ data: null, rev: 0 });
    await expect(syncSnapshot({ ...me, token: "outro" }, sample())).rejects.toMatchObject({ code: "AUTH" });
    expect(db.saves).toBe(0);
  });
});
