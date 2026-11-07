#!/usr/bin/env node
// Roda antes de `npm run dev` e `npm run build` (predev/prebuild).
// Problema: no Windows, com o projeto dentro do OneDrive, a sincronização trava e converte os arquivos
// de .next enquanto o Next.js os escreve (erros EBUSY, EINVAL readlink, "Cannot find module").
// Solução: .next vira uma junção (atalho de pasta) para uma pasta fora do OneDrive — o OneDrive não
// sincroniza o conteúdo de junções. Fora do Windows ou fora do OneDrive, este script não faz nada.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const force = process.env.MINDLOOP_LINK_NEXT === "1"; // permite testar fora do OneDrive
if (process.platform !== "win32" || (!/onedrive/i.test(root) && !force)) process.exit(0);

const link = join(root, ".next");
const id = createHash("sha1").update(root.toLowerCase()).digest("hex").slice(0, 10);
const base = join(process.env.LOCALAPPDATA || tmpdir(), "mindloop-next", id);
const target = join(base, ".next");
const same = (a, b) => resolve(a).replace(/\\+$/, "").toLowerCase() === resolve(b).replace(/\\+$/, "").toLowerCase();
const linkOf = (p) => { try { return readlinkSync(p); } catch { return null; } };

// O Node procura pacotes a partir do caminho REAL do código compilado (dentro de `base`).
// Por isso `base` também ganha uma junção node_modules → node_modules do projeto.
function linkNodeModules() {
  const nm = join(base, "node_modules"), real = join(root, "node_modules");
  const cur = linkOf(nm);
  if (cur && same(cur, real)) return;
  mkdirSync(base, { recursive: true });
  if (cur !== null || existsSync(nm)) execFileSync("cmd.exe", ["/c", "rmdir", nm], { stdio: "pipe" }); // remove só a junção
  symlinkSync(real, nm, "junction");
}

const current = linkOf(link); // null: não existe, ou é pasta comum/placeholder do OneDrive
if (current && same(current, target) && existsSync(target)) { linkNodeModules(); process.exit(0); }

try {
  linkNodeModules();
  if (current !== null) {
    // Já é uma junção (para outro lugar): remove só o atalho, nunca o conteúdo do destino.
    execFileSync("cmd.exe", ["/c", "rmdir", link], { stdio: "pipe" });
  } else if (existsSync(link)) {
    // Pasta comum ou placeholder do OneDrive: Remove-Item lida com arquivos somente leitura, onde o fs do Node falha.
    execFileSync("powershell.exe", ["-NoProfile", "-Command", `Remove-Item -LiteralPath '${link.replace(/'/g, "''")}' -Recurse -Force -ErrorAction Stop`], { stdio: "pipe" });
  }
  mkdirSync(target, { recursive: true });
  symlinkSync(target, link, "junction");
  console.log(`[mindloop] .next agora aponta para ${target} (fora do OneDrive).`);
} catch (e) {
  console.error(`[mindloop] Não consegui preparar a pasta .next fora do OneDrive.
  Provável causa: um servidor do Next (npm run dev / start) ainda está rodando e segura os arquivos.
  Feche-o com Ctrl+C e rode o comando de novo. Detalhe: ${String(e.stderr || e.message).trim().split("\n")[0]}`);
  process.exit(1);
}
