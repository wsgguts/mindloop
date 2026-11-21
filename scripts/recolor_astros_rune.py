"""Recolore a runa do Astros na arte do Início (public/home-art.webp).

A runa vem pintada em VERDE na arte original. Para cada arte do Início (celular e computador) gera duas versões:
  • public/home-art.webp       — Astros BLOQUEADO: runa índigo (azul-noite) com reflexos prateados;
  • public/home-art-open.webp  — Astros LIBERADO: a arte original, com a runa verde.
  • public/home-art-desktop.webp / home-art-desktop-open.webp — o mesmo para a arte do computador
    (original em public/home-art-desktop.jpg). Nela a runa JÁ vem azul-noite: o script gera a VERDE (to_green).
O App mostra uma ou outra (sem efeitos por cima); a área de toque é a mesma.

Como funciona: parte da arte ORIGINAL (public/home-art.jpg, que não é alterada) e, só na região da runa,
troca o tom dos pixels esverdeados por índigo. Os pixels mais claros (brilhos) ficam quase sem cor, prateados.
O resto da imagem (céu, etiqueta "ASTROS", estrela do centro) não muda. A transição é suave nas bordas.

Uso: python scripts/recolor_astros_rune.py
"""
import colorsys
import math
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public")
SRC = os.path.join(ROOT, "home-art.jpg")
OUT = os.path.join(ROOT, "home-art.webp")
OUT_OPEN = os.path.join(ROOT, "home-art-open.webp")

# Região da runa na arte (944 × 1680 px): centro e raios da elipse onde a cor é trocada (com borda suave).
INDIGO = 232 / 360  # tom alvo (azul-noite)


def recolor(src, out, out_open, cx, cy, rx, ry, top, quality=80):
    """Gera as duas versões de uma arte. (cx, cy, rx, ry): elipse da runa; top: acima disso começa o cubo (não muda)."""
    im = Image.open(src).convert("RGB")
    im.save(out_open, "WEBP", quality=quality, method=6)  # liberado: runa verde original
    px = im.load()
    for y in range(max(cy - ry, top), cy + ry):
        for x in range(cx - rx, cx + rx):
            d = math.hypot((x - cx) / rx, (y - cy) / ry)
            if d >= 1:
                continue
            r, g, b = (v / 255 for v in px[x, y])
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            # Só os tons verdes (inclui o verde-amarelado do brilho) e com alguma cor.
            if not (55 / 360 <= h <= 175 / 360) or s < 0.06:
                continue
            w = min(1.0, (1 - d) / 0.2)  # borda suave da elipse
            w *= min(1.0, (s - 0.06) / 0.12)  # pixels quase sem cor mudam pouco
            # Troca suave: a saturação cai aos poucos nos pontos mais claros (brilhos prateados, sem manchas).
            ns = s * (0.85 - 0.35 * max(0.0, (v - 0.75) / 0.25))
            nv = v * 0.92
            nr, ng, nb = colorsys.hsv_to_rgb(INDIGO, ns, nv)
            px[x, y] = tuple(round((a * (1 - w) + c * w) * 255) for a, c in ((r, nr), (g, ng), (b, nb)))
    im.save(out, "WEBP", quality=quality, method=6)
    print("ok:", out, out_open)


# Celular (retrato, 944 × 1680): runa embaixo do cubo.
recolor(SRC, OUT, OUT_OPEN, 462, 768, 108, 108, top=688)
def to_green(src, out, out_open, polygon, quality=92):
    """Arte em que a runa JÁ vem azul-noite (bloqueado): gera a versão verde (liberado), só DENTRO do contorno
    do cristal (polygon, com borda suave), para o céu azul em volta não mudar. Etiqueta e estrela quase não têm
    cor azul e ficam iguais."""
    from PIL import ImageDraw, ImageFilter
    im = Image.open(src).convert("RGB")
    im.save(out, "WEBP", quality=quality, method=6)  # bloqueado: como veio
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    xs, ys = [p[0] for p in polygon], [p[1] for p in polygon]
    px, mk = im.load(), mask.load()
    for y in range(min(ys) - 4, max(ys) + 4):
        for x in range(min(xs) - 4, max(xs) + 4):
            w = mk[x, y] / 255
            if w <= 0:
                continue
            r, g, b = (v / 255 for v in px[x, y])
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            if not (185 / 360 <= h <= 265 / 360) or s < 0.08:
                continue
            w *= min(1.0, (s - 0.08) / 0.12)
            nr, ng, nb = colorsys.hsv_to_rgb(GREEN, min(1.0, s * 1.05), min(1.0, v * 1.12))
            px[x, y] = tuple(round((a * (1 - w) + c * w) * 255) for a, c in ((r, nr), (g, ng), (b, nb)))
    im.save(out_open, "WEBP", quality=quality, method=6)
    print("ok:", out, out_open)


GREEN = 128 / 360  # verde do Astros

# Computador (paisagem, 1776 × 896): a runa já vem azul-noite; o verde é gerado só dentro do cristal.
to_green(os.path.join(ROOT, "home-art-desktop.jpg"), os.path.join(ROOT, "home-art-desktop.webp"),
         os.path.join(ROOT, "home-art-desktop-open.webp"),
         [(877, 470), (915, 492), (940, 542), (920, 600), (873, 612), (822, 578), (805, 535), (836, 490)])
