#!/usr/bin/env python3
"""Gera os 100 níveis do Zip (caminho único que liga os números em ordem e cobre todas as casas).
Todo nível tem solução ÚNICA (verificada com busca podada). A dificuldade cresce com o tamanho da grade
e com a redução dos pontos numerados. Usa cache em scripts/.zip_cache.json (pode ser interrompido e retomado).
Uso: python3 scripts/gen_zip.py [segundos_de_limite]
"""
import random, json, sys, time, os

def neighbors(n):
    nb = {}
    for r in range(n):
        for c in range(n):
            nb[(r, c)] = [(r+dr, c+dc) for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)) if 0 <= r+dr < n and 0 <= c+dc < n]
    return nb

class Budget(Exception): pass

def count(n, nums, limit=2, budget=400000):
    """Conta caminhos válidos (até `limit`). nums: {(r,c): k}. Lança Budget se estourar o orçamento."""
    nb = neighbors(n); total = n*n
    start = next(p for p, v in nums.items() if v == 1)
    mx = max(nums.values()); end = next(p for p, v in nums.items() if v == mx)
    pos = {v: p for p, v in nums.items()}
    seen = {start}; found = 0; nodes = 0
    def feasible(head, visited):
        # casas livres devem ser alcançáveis e não ter becos (exceto a casa final)
        free = [p for p in nb if p not in seen]
        if not free: return True
        stack = [q for q in nb[head] if q not in seen]; reach = set(stack)
        while stack:
            x = stack.pop()
            for y in nb[x]:
                if y not in seen and y not in reach: reach.add(y); stack.append(y)
        if len(reach) != len(free): return False
        dead = 0
        for p in free:
            d = sum(1 for q in nb[p] if q not in seen or q == head)
            if d <= 1:
                if p != end: return False
                dead += 1
        nxt = pos.get(visited+1)
        if nxt and nxt not in seen and abs(nxt[0]-head[0]) + abs(nxt[1]-head[1]) > total - len(seen): return False
        return True
    def dfs(p, visited):
        nonlocal found, nodes
        nodes += 1
        if nodes > budget: raise Budget()
        if found >= limit: return
        if len(seen) == total:
            if p == end: found += 1
            return
        for q in nb[p]:
            if q in seen: continue
            v = nums.get(q)
            if v is not None and v != visited+1: continue
            if q == end and len(seen) != total-1: continue
            seen.add(q)
            if feasible(q, visited + (1 if v else 0)): dfs(q, visited + (1 if v else 0))
            seen.discard(q)
    dfs(start, 1)
    return found

def ham_path(n, rng):
    nb = neighbors(n)
    cells = list(nb)
    while True:
        s = rng.choice(cells); path = [s]; seen = {s}; steps = [0]
        def dfs():
            steps[0] += 1
            if steps[0] > 20000: return False
            if len(path) == n*n: return True
            cur = path[-1]
            opts = [q for q in nb[cur] if q not in seen]
            rng.shuffle(opts)
            opts.sort(key=lambda q: sum(1 for z in nb[q] if z not in seen))   # Warnsdorff
            for q in opts:
                path.append(q); seen.add(q)
                if dfs(): return True
                path.pop(); seen.discard(q)
            return False
        if dfs(): return path

def make(n, target, rng, deadline):
    """Tenta chegar perto de `target` pontos numerados mantendo solução única."""
    best = None
    while time.time() < deadline:
        path = ham_path(n, rng); L = len(path)
        k = min(L, target + 6)
        idx = sorted({0, L-1} | set(rng.sample(range(1, L-1), k-2)))
        def build(ix): return {path[i]: j+1 for j, i in enumerate(ix)}
        try:
            while count(n, build(idx)) != 1:
                extra = [i for i in range(1, L-1) if i not in idx]
                idx = sorted(idx + [rng.choice(extra)])
            order = idx[1:-1]; rng.shuffle(order)
            for i in order:
                if len(idx) <= target: break
                trial = [x for x in idx if x != i]
                try:
                    if count(n, build(trial)) == 1: idx = trial
                except Budget: pass
        except Budget:
            continue
        nums = build(idx)
        if best is None or len(idx) < best[0]: best = (len(idx), nums)
        if len(idx) <= target: break
    return best

def encode(n, nums):
    return "/".join(",".join(str(nums.get((r, c), 0)) for c in range(n)) for r in range(n))

# Plano: (tamanho, quantos níveis, pontos no 1º nível do bloco, pontos no último)
PLAN = [(4,10,7,4),(5,10,10,7),(5,10,7,5),(6,10,12,9),(6,10,9,7),(6,10,7,5),(7,10,14,11),(7,10,11,8),(7,10,8,6),(7,10,6,5)]

if __name__ == "__main__":
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 240
    t0 = time.time(); cache_f = "scripts/.zip_cache.json"
    cache = json.load(open(cache_f)) if os.path.exists(cache_f) else {}
    rng = random.Random(7)
    slot = 0
    for n, cnt, k0, k1 in PLAN:
        for j in range(cnt):
            slot += 1; key = str(slot)
            target = round(k0 + (k1-k0) * (j/(cnt-1)))
            rr = random.Random(slot*977)
            if key in cache: continue
            if time.time() - t0 > limit: break
            res = make(n, target, rr, min(time.time()+25, t0+limit))
            if res: cache[key] = {"n": n, "k": res[0], "enc": encode(n, res[1]), "target": target}; json.dump(cache, open(cache_f, "w"))
            print(slot, n, "alvo", target, "obtido", res[0] if res else None, flush=True)
    print("prontos", len(cache), "de 100")
    if len(cache) == 100:
        lv = sorted((cache[str(i)] for i in range(1, 101)), key=lambda x: (x["n"], -x["k"]))  # mais fácil → mais difícil
        open("src/lib/data/zipLevels.ts", "w").write(
            "// GERADO por scripts/gen_zip.py — não edite à mão.\n// Cada nível: linhas separadas por \"/\", casas por \",\"; 0 = casa livre; 1..k = pontos em ordem.\n"
            "export const ZIP_RAW: string[] = " + json.dumps([x["enc"] for x in lv], indent=1) + ";\n")
        print("zipLevels.ts escrito")
