// Calibra a dificuldade do Zip e do Tango (rodar depois de gen_zip.py / gen_tango.mjs):
//   npx vite-node scripts/tune_levels.ts
//
// Mede o esforço de cada nível com o raciocínio de uma pessoa: regras diretas + hipóteses de um passo ("E se…?").
//  - Zip: solucionador por dedução de src/lib/zipLogic.ts.
//  - Tango: as mesmas deduções das dicas do jogo (src/lib/tangoLogic.ts).
// Se um nível passa do teto do seu capítulo (ou não se resolve sem chute), ganha pistas tiradas da PRÓPRIA
// solução — um ponto numerado a mais no Zip, uma casa revelada no Tango — escolhidas uma a uma pela que mais
// reduz o esforço, até caber no teto. A resposta continua a mesma (e única). Por fim, cada capítulo é ordenado
// do mais leve ao mais pesado, para a curva subir sem saltos. Determinístico: rodar de novo não muda nada.
import { readFileSync, writeFileSync } from "node:fs";
import { parseZip, countZipSolutions, type ParsedZip } from "../src/lib/zip";
import { solveZipLogically } from "../src/lib/zipLogic";
import { ZIP_CAP, TANGO_CAP } from "../src/lib/difficulty";
import { parseTango, encodeTango, nextDeduction, isFullT, cloneT, solveLogically, countTangoSolutions, type TangoBoard } from "../src/lib/tangoLogic";

const INF = 999;

/** Escolha da pista: a que deixa o nível o MAIS desafiador possível dentro do teto (não facilita além do preciso);
 *  se nenhuma cabe no teto ainda, a que mais aproxima dele. */
const better = (e: number, best: number, cap: number) => (e <= cap ? best > cap || e > best : e < best);

// ---------------- Zip ----------------

function zipEffort(z: ParsedZip): number {
  const r = solveZipLogically(z, true);
  return r.solved ? r.hypotheses : INF;
}

/** A única solução, como sequência de casas (busca com poda). */
function zipPath(z: ParsedZip): number[] {
  const n = z.size, N = n * n;
  const num = (i: number) => z.nums[Math.floor(i / n)][i % n];
  const nb = (i: number) => { const r = Math.floor(i / n), c = i % n, o: number[] = []; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
  const start = z.start.r * n + z.start.c;
  const path = [start]; const seen = new Uint8Array(N); seen[start] = 1;
  let result: number[] | null = null;
  const go = (next: number): boolean => {
    const head = path[path.length - 1];
    if (path.length === N) { if (num(head) === z.max) { result = path.slice(); return true; } return false; }
    for (const q of nb(head)) {
      if (seen[q]) continue;
      const v = num(q);
      if (v && v !== next) continue;
      seen[q] = 1; path.push(q);
      // poda: casas livres conexas
      let ok = true;
      { const free = N - path.length; if (free) { const st = nb(q).filter((x) => !seen[x]); const rch = new Uint8Array(N); st.forEach((x) => (rch[x] = 1)); let cnt = st.length; while (st.length) { const x = st.pop()!; for (const y of nb(x)) if (!seen[y] && !rch[y]) { rch[y] = 1; cnt++; st.push(y); } } ok = cnt === free; } }
      if (ok && go(v ? next + 1 : next)) return true;
      seen[q] = 0; path.pop();
    }
    return false;
  };
  go(2);
  if (!result) throw new Error("Zip sem solução");
  return result;
}

function zipFrom(n: number, path: number[], idx: number[]): ParsedZip {
  const rows = Array.from({ length: n }, () => Array<number>(n).fill(0));
  idx.forEach((i, k) => { rows[Math.floor(path[i] / n)][path[i] % n] = k + 1; });
  return parseZip(rows.map((r) => r.join(",")));
}
const zipEncode = (z: ParsedZip) => z.nums.map((r) => r.join(",")).join("/");

function tuneZip(raw: string, cap: number): { raw: string; effort: number; added: number } {
  let z = parseZip(raw.split("/"));
  let e = zipEffort(z);
  if (e <= cap) return { raw, effort: e, added: 0 };
  const n = z.size, path = zipPath(z);
  let idx = path.map((p, i) => (z.nums[Math.floor(p / n)][p % n] ? i : -1)).filter((i) => i >= 0);
  let added = 0;
  while (e > cap) {
    let best: { i: number; e: number; gap: number } | null = null;
    for (let i = 1; i < path.length - 1; i++) {
      if (idx.includes(i)) continue;
      const trial = [...idx, i].sort((a, b) => a - b);
      const te = zipEffort(zipFrom(n, path, trial));
      // Desempate: o ponto que divide o maior trecho sem números (pistas espalhadas, sem amontoar).
      const k = trial.indexOf(i), gap = Math.min(i - trial[k - 1], trial[k + 1] - i);
      if (!best || better(te, best.e, cap) || (te === best.e && gap > best.gap)) best = { i, e: te, gap };
    }
    idx = [...idx, best!.i].sort((a, b) => a - b);
    e = best!.e; added++;
  }
  z = zipFrom(n, path, idx);
  if (countZipSolutions(z, 2) !== 1) throw new Error("Zip ficou com mais de uma solução");
  return { raw: zipEncode(z), effort: e, added };
}

// ---------------- Tango ----------------

function tangoEffort(b: TangoBoard): number {
  const g = cloneT(b.givens); let hyp = 0;
  while (!isFullT(g)) {
    const d = nextDeduction(g, b.signs, true);
    if (!d) return INF;
    if (d.reason === "hipotese") hyp++;
    g[d.r][d.c] = d.v;
  }
  return hyp;
}

function tuneTango(raw: string, cap: number): { raw: string; effort: number; added: number } {
  const b = parseTango(raw);
  let e = tangoEffort(b);
  if (e <= cap) return { raw, effort: e, added: 0 };
  const sol = solveLogically(b.givens, b.signs, true)!;
  const n = b.n; let added = 0;
  while (e > cap) {
    let best: { r: number; c: number; e: number } | null = null;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (b.givens[r][c]) continue;
      b.givens[r][c] = sol[r][c];
      const te = tangoEffort(b);
      b.givens[r][c] = 0;
      // Desempate: a primeira casa na ordem de leitura (determinístico).
      if (!best || better(te, best.e, cap)) best = { r, c, e: te };
    }
    b.givens[best!.r][best!.c] = sol[best!.r][best!.c];
    e = best!.e; added++;
  }
  if (countTangoSolutions(b.givens, b.signs, 2) !== 1) throw new Error("Tango ficou com mais de uma solução");
  return { raw: encodeTango(b), effort: e, added };
}

// ---------------- Arquivos ----------------
function rewrite(file: string, name: string, tune: (raw: string, cap: number) => { raw: string; effort: number; added: number }, caps: number[]) {
  const src = readFileSync(file, "utf8");
  const start = src.indexOf("= [", src.indexOf(`export const ${name}`)) + 2;
  const levels: string[] = new Function(`return ${src.slice(start, src.lastIndexOf("]") + 1)}`)();
  const out: string[] = [];
  const report: string[] = [];
  for (let ch = 0; ch < 10; ch++) {
    const chapter = levels.slice(ch * 10, ch * 10 + 10).map((raw, j) => {
      const t = tune(raw, caps[ch]);
      if (t.added) report.push(`  nível ${ch * 10 + j + 1}: +${t.added} pista(s) → esforço ${t.effort}`);
      return t;
    });
    // Mais leve primeiro; no empate, mantém a ordem do gerador (sort estável).
    chapter.sort((a, b) => a.effort - b.effort);
    out.push(...chapter.map((x) => x.raw));
    report.push(`cap. ${ch + 1}: ${chapter.map((x) => x.effort).join(" ")}`);
  }
  let head = src.slice(0, start);
  const note = "// Calibrado por scripts/tune_levels.ts (teto de esforço por capítulo; capítulos ordenados do mais leve ao mais pesado).";
  if (!head.includes("tune_levels")) head = head.replace(/\r?\nexport const/, (m) => `\n${note}${m}`);
  writeFileSync(file, `${head}${JSON.stringify(out, null, 1)};\n`);
  console.log(`${name}\n${report.join("\n")}`);
}

rewrite("src/lib/data/zipLevels.ts", "ZIP_RAW", tuneZip, ZIP_CAP);
rewrite("src/lib/data/tangoLevels.ts", "TANGO_RAW", tuneTango, TANGO_CAP);
