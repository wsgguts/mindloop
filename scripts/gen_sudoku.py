#!/usr/bin/env python3
"""Gera os 100 níveis do Mini Sudoku (20 de 4x4 + 80 de 6x6, blocos 2x3).
Cada puzzle tem solução ÚNICA e pode ser resolvido só com lógica (sem chute):
técnicas usadas = "único possível" e "único na unidade" (linha/coluna/bloco).
A dificuldade cresce reduzindo as pistas. Uso: python3 scripts/gen_sudoku.py
"""
import random, json

def spec(n):
    bh = 2; bw = n // 2   # 4 -> 2x2 ; 6 -> 2x3
    units = [[r*n+c for c in range(n)] for r in range(n)] + [[r*n+c for r in range(n)] for c in range(n)]
    for br in range(0, n, bh):
        for bc in range(0, n, bw):
            units.append([(br+i)*n+bc+j for i in range(bh) for j in range(bw)])
    peers = [set() for _ in range(n*n)]
    for u in units:
        for a in u:
            peers[a].update(x for x in u if x != a)
    return n, units, peers

def cands(g, n, peers, i):
    if g[i]: return set()
    return set(range(1, n+1)) - {g[p] for p in peers[i]}

def count(g, S, limit=2):
    n, units, peers = S
    g = g[:]
    def rec():
        best = None; bc = None
        for i in range(n*n):
            if g[i] == 0:
                c = cands(g, n, peers, i)
                if not c: return 0
                if bc is None or len(c) < len(bc): best, bc = i, c
                if len(bc) == 1: break
        if best is None: return 1
        t = 0
        for v in bc:
            g[best] = v; t += rec(); g[best] = 0
            if t >= limit: return t
        return t
    return rec()

def logic(g, S):
    """Resolve só com únicos. Retorna (resolvido, passos_hidden)."""
    n, units, peers = S
    g = g[:]; hidden = 0
    while True:
        prog = False
        for i in range(n*n):
            if g[i] == 0:
                c = cands(g, n, peers, i)
                if len(c) == 1: g[i] = next(iter(c)); prog = True
        if prog: continue
        for u in units:
            for v in range(1, n+1):
                if any(g[i] == v for i in u): continue
                spots = [i for i in u if g[i] == 0 and v in cands(g, n, peers, i)]
                if len(spots) == 1: g[spots[0]] = v; hidden += 1; prog = True
        if not prog: break
    return all(g), hidden

def solution(S, rng):
    n, units, peers = S
    g = [0]*(n*n)
    def fill(k):
        if k == n*n: return True
        vs = list(range(1, n+1)); rng.shuffle(vs)
        for v in vs:
            if v not in {g[p] for p in peers[k]}:
                g[k] = v
                if fill(k+1): return True
                g[k] = 0
        return False
    fill(0); return g

def make(S, target, rng, tries=80):
    n = S[0]; best = None
    for _ in range(tries):
        sol = solution(S, rng); g = sol[:]
        cells = list(range(n*n)); rng.shuffle(cells)
        clues = n*n
        for i in cells:
            if clues <= target: break
            v = g[i]; g[i] = 0
            if count(g, S) == 1 and logic(g, S)[0]: clues -= 1
            else: g[i] = v
        if best is None or clues < best[0]: best = (clues, g[:])
        if clues <= target: break
    return best

def rows(g, n): return "/".join("".join(str(x) if x else "." for x in g[r*n:(r+1)*n]) for r in range(n))

if __name__ == "__main__":
    rng = random.Random(2026)
    S4, S6 = spec(4), spec(6)
    t4 = [12,12,11,11,10,10,9,9,8,8, 8,7,7,7,6,6,6,5,5,5]
    t6 = [round(24 - 13*(i/79)) for i in range(80)]
    out = []; seen = set()
    for S, targets in ((S4, t4), (S6, t6)):
        level = []
        for t in targets:
            while True:
                clues, g = make(S, t, rng)
                key = rows(g, S[0])
                if key not in seen: seen.add(key); break
            level.append((clues, logic(g, S)[1], key))
        level.sort(key=lambda x: (-x[0], x[1]))   # mais pistas = mais fácil; dentro do empate, menos passos "hidden"
        out += level
        print("grade", S[0], "pistas:", [x[0] for x in level], flush=True)
    assert len(out) == 100 and len({x[2] for x in out}) == 100
    open("src/lib/data/sudokuLevels.ts", "w").write(
        "// GERADO por scripts/gen_sudoku.py — não edite à mão.\n// Cada nível: linhas separadas por \"/\"; \".\" = casa vazia. Níveis 1–20: 4×4; 21–100: 6×6 (blocos 2×3).\n"
        "export const SUDOKU_RAW: string[] = " + json.dumps([x[2] for x in out], indent=1) + ";\n")
    print("ok")
