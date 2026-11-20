"""Recolore a runa do Astros na arte do Início (public/home-art.webp).

A runa vem pintada em VERDE na arte original. Gera duas versões da arte do Início:
  • public/home-art.webp       — Astros BLOQUEADO: runa índigo (azul-noite) com reflexos prateados;
  • public/home-art-open.webp  — Astros LIBERADO: a arte original, com a runa verde.
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
CX, CY, RX, RY = 472, 990, 150, 150
INDIGO = 232 / 360  # tom alvo (azul-noite)

im = Image.open(SRC).convert("RGB")
im.save(OUT_OPEN, "WEBP", quality=80, method=6)  # liberado: runa verde original
px = im.load()
for y in range(CY - RY, CY + RY):
    for x in range(CX - RX, CX + RX):
        d = math.hypot((x - CX) / RX, (y - CY) / RY)
        if d >= 1:
            continue
        r, g, b = (v / 255 for v in px[x, y])
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        # Só os tons verdes (inclui o verde-amarelado do brilho) e com alguma cor.
        if not (55 / 360 <= h <= 175 / 360) or s < 0.12:
            continue
        w = min(1.0, (1 - d) / 0.25)  # borda suave da elipse
        w *= min(1.0, (s - 0.12) / 0.15)  # pixels quase sem cor mudam pouco
        nh = INDIGO
        ns = s * 0.80 if v < 0.82 else s * 0.35  # brilhos ficam prateados
        nv = v * 0.95 if v < 0.82 else min(1.0, v * 1.02)
        nr, ng, nb = colorsys.hsv_to_rgb(nh, ns, nv)
        px[x, y] = tuple(round((a * (1 - w) + c * w) * 255) for a, c in ((r, nr), (g, ng), (b, nb)))

im.save(OUT, "WEBP", quality=80, method=6)
print("ok:", OUT, OUT_OPEN)
