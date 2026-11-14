// Modo Administrador: a conta real fica pausada (intocada) e volta igual ao desligar.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMIN_FLAG, adminActive, clearStore, enterAdminArea, leaveAdminArea, readStore, writeStore } from "./storage";

/** localStorage em memória (os testes rodam no Node). */
function fakeStorage() {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
    removeItem: (k: string) => { m.delete(k); },
    clear: () => m.clear(),
    dump: () => Object.fromEntries(m),
  };
}

describe("Modo Administrador: área de testes separada", () => {
  let ls: ReturnType<typeof fakeStorage>;
  beforeEach(() => { ls = fakeStorage(); (globalThis as { window?: unknown }).window = { localStorage: ls }; });
  afterEach(() => { delete (globalThis as { window?: unknown }).window; });

  it("enquanto ligado, o app vê um jogador de teste vazio e não toca na conta real", () => {
    writeStore("mindloop:nick", "Lia");
    writeStore("mindloop:progress:sudoku", "1".repeat(30) + "0".repeat(70));
    writeStore("mindloop:rank", '{"id":"x"}');
    const real = ls.dump();

    enterAdminArea("Administrador");
    expect(adminActive()).toBe(true);
    expect(readStore("mindloop:nick")).toBe("Administrador");
    expect(readStore("mindloop:progress:sudoku")).toBeNull(); // progresso de teste começa vazio
    expect(readStore("mindloop:rank")).toBeNull(); // sem identidade: sem servidor e sem ranking

    writeStore("mindloop:progress:sudoku", "1".repeat(100));
    writeStore("mindloop:achievements", '{"lenda-mindloop":1}');
    clearStore("mindloop:"); // "reiniciar" no modo de testes só apaga a área de testes
    expect(adminActive()).toBe(true);
    writeStore("mindloop:progress:zip", "1".repeat(100));

    for (const [k, v] of Object.entries(real)) expect(ls.getItem(k), k).toBe(v); // conta real intocada
    expect(ls.getItem("mindloop:progress:zip")).toBeNull();
  });

  it("ao desligar, a área de testes some e a pessoa volta para a própria conta", () => {
    writeStore("mindloop:nick", "Lia");
    writeStore("mindloop:progress:tango", "1".repeat(12) + "0".repeat(88));
    enterAdminArea("Administrador");
    writeStore("mindloop:progress:tango", "1".repeat(100));
    leaveAdminArea();
    expect(adminActive()).toBe(false);
    expect(ls.getItem(ADMIN_FLAG)).toBeNull();
    expect(readStore("mindloop:nick")).toBe("Lia");
    expect(readStore("mindloop:progress:tango")).toBe("1".repeat(12) + "0".repeat(88));
    expect(Object.keys(ls.dump()).some((k) => k.startsWith("mindloop-admin:"))).toBe(false);
  });

  it("cada vez que liga, o teste começa do zero", () => {
    enterAdminArea("Administrador");
    writeStore("mindloop:progress:patches", "1".repeat(100));
    leaveAdminArea();
    enterAdminArea("Administrador");
    expect(readStore("mindloop:progress:patches")).toBeNull();
  });
});
