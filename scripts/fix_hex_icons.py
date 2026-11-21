"""Conserta os hexágonos com o símbolo da FAETERJ que vieram deformados nas artes do Início.

Originais (sem conserto) em art-src/. O script gera public/home-art.jpg (celular) e public/home-art-desktop.jpg
(computador). Depois rode scripts/recolor_astros_rune.py para gerar os .webp.

Como funciona, para cada hexágono deformado (lista DEFEITOS):
  1. apaga só o ícone: a área dele é preenchida com as cores do céu em volta (média suave + um pouco da textura
     vizinha), sem tocar no resto da arte;
  2. desenha no lugar o hexágono CORRETO, recortado do logo grande e nítido do topo da arte do celular,
     reduzido ao tamanho dos ícones bons, com o mesmo brilho azulado.

Uso: python scripts/fix_hex_icons.py
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageMath

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "art-src")
PUB = os.path.join(ROOT, "public")

# (centro x, centro y, altura do ícone em px, opacidade). Opacidade menor = ícone "ao longe"/atrás de nuvem
# (fica mais apagado e azulado, como o original daquele ponto).
DEFEITOS = {
    "home-art.jpg": [(97, 45, 48, .45), (67, 454, 56, .95), (700, 744, 58, .95)],
    "home-art-desktop.jpg": [(799, 141, 44, .95), (539, 295, 44, .95), (1193, 276, 46, .95), (303, 344, 46, .8), (1418, 258, 44, .95), (1267, 442, 44, .9),
                             (1583, 464, 44, .9), (670, 530, 46, .95), (1068, 514, 44, .95), (481, 519, 46, .8),
                             (806, 617, 44, .85)],
}


def logo_mask():
    """Hexágono do logo grande da FAETERJ (topo da arte do celular): traço branco → máscara."""
    im = Image.open(os.path.join(SRC, "home-art.jpg")).convert("RGB").crop((262, 50, 392, 196))
    m = Image.new("L", im.size)
    px, mp = im.load(), m.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            mp[x, y] = max(0, min(255, round((min(r, g, b) - 135) * 255 / 85)))
    # só o que forma o desenho (apaga pontinhos de estrela soltos)
    keep = m.filter(ImageFilter.BoxBlur(3)).point(lambda v: 255 if v > 20 else 0)
    m = ImageChops.multiply(m, keep)
    return m.crop(m.getbbox())


def fill_hole(im, hole):
    """Preenche a área `hole` com as cores em volta (média ponderada que ignora o próprio buraco)."""
    keep = ImageChops.invert(hole)
    r = 7  # só as cores bem próximas (perto de nuvem, um raio grande "puxa" a cor da nuvem)
    wk = keep.filter(ImageFilter.GaussianBlur(r))
    chans = [ImageMath.unsafe_eval("convert(n*255/max(m,1),'L')", n=ImageChops.multiply(c, keep).filter(ImageFilter.GaussianBlur(r)), m=wk)
             for c in im.split()]
    fill = Image.merge("RGB", chans)
    for _ in range(4):  # leva as cores da borda até o centro
        cur = Image.composite(fill, im, hole).filter(ImageFilter.GaussianBlur(4))
        fill = Image.composite(cur, fill, hole)
    return Image.composite(fill, im, hole.filter(ImageFilter.GaussianBlur(3)))


def icon(mask, h, alpha):
    """Ícone pronto (RGBA): traço branco-azulado com brilho suave, na altura h."""
    w = round(mask.width * h / mask.height)
    m = mask.resize((w, h), Image.LANCZOS)
    pad = round(h * .35)
    big = Image.new("L", (w + 2 * pad, h + 2 * pad))
    big.paste(m, (pad, pad))
    glow = big.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(h * .09)).point(lambda v: round(v * .85 * alpha))
    out = Image.new("RGBA", big.size, (150, 200, 255, 0))
    out.putalpha(glow)
    # ícone apagado ("ao longe"): traço mais azul; ícone aceso: quase branco
    tone = (236, 245, 255) if alpha >= .7 else (120, 170, 255)
    stroke = Image.new("RGBA", big.size, tone + (0,))
    stroke.putalpha(big.point(lambda v: round(v * .95 * alpha)))
    out.alpha_composite(stroke)
    return out


def main():
    mask = logo_mask()
    for name, items in DEFEITOS.items():
        im = Image.open(os.path.join(SRC, name)).convert("RGB")
        for cx, cy, h, a in items:
            hole = Image.new("L", im.size)
            rx, ry = h * .74, h * .76  # um pouco maior que o ícone: some com os risquinhos tortos em volta
            ImageDraw.Draw(hole).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
            im = fill_hole(im, hole)
            ic = icon(mask, h, a)
            base = im.convert("RGBA")
            base.alpha_composite(ic, (cx - ic.width // 2, cy - ic.height // 2))
            im = base.convert("RGB")
        im.save(os.path.join(PUB, name), "JPEG", quality=94)
        print("ok:", name, len(items), "hexágonos")


main()
