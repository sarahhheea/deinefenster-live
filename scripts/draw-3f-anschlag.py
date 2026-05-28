"""Zeichnet Anschlag-Linien auf 3F-Karten basierend auf fluegel-karten/03_3-fluegel.png.

Pro Variante:
  - dkL-fest-dkR: [dk-l, fest, dk-r]
  - pp-dkL-drehL-dkR: [dk-l, dreh-l, dk-r]
  - pp-dkL-drehR-dkR: [dk-l, dreh-r, dk-r]
  - ps-dkL-drehL-dkR: [dk-l, dreh-l, dk-r]
  - sp-dkL-drehR-dkR: [dk-l, dreh-r, dk-r]

Pane-Koordinaten (in 701x781 Basisbild):
  Pane 1: x[59-195]  y[52-777]
  Pane 2: x[283-419] y[52-777]
  Pane 3: x[506-643] y[52-777]
"""
from PIL import Image, ImageDraw
import os

LINE = (12, 28, 62)  # #0c1c3e dunkelblau
LINE_W = 4           # dicke Linien für 3F (Panes sind schmal)

PANES = [
    (59, 56, 195, 725),
    (283, 56, 419, 725),
    (506, 56, 643, 725),
]

VARIANTS = {
    'dkL-fest-dkR.png':       ['dk-l', 'fest',   'dk-r'],
    'pp-dkL-drehL-dkR.png':   ['dk-l', 'dreh-l', 'dk-r'],
    'pp-dkL-drehR-dkR.png':   ['dk-l', 'dreh-r', 'dk-r'],
    'ps-dkL-drehL-dkR.png':   ['dk-l', 'dreh-l', 'dk-r'],
    'sp-dkL-drehR-dkR.png':   ['dk-l', 'dreh-r', 'dk-r'],
}


def draw_pane(draw, bbox, typ):
    """Zeichnet Anschlag-Linien für einen Pane.

    bbox = (x0, y0, x1, y1) = absolute coords in image
    typ in {'dreh-l', 'dreh-r', 'dk-l', 'dk-r', 'fest'}
    """
    x0, y0, x1, y1 = bbox
    pad = 2
    L = x0 + pad
    R = x1 - pad
    T = y0 + pad
    B = y1 - pad
    cx = (L + R) // 2
    cy = (T + B) // 2

    def line(p1, p2, w=LINE_W):
        draw.line([p1, p2], fill=LINE, width=w)

    if typ == 'fest':
        # X-Diagonalen, dünner
        line((L, T), (R, B), w=3)
        line((R, T), (L, B), w=3)
        return

    if typ == 'dreh-l':
        # Achse links + V-Spitze rechts (Mitte)
        line((R, T), (L, cy))
        line((R, B), (L, cy))
        return

    if typ == 'dreh-r':
        # Achse rechts + V-Spitze links
        line((L, T), (R, cy))
        line((L, B), (R, cy))
        return

    if typ == 'dk-l':
        # Dreh-Linien (Spitze links)
        line((R, T), (L, cy))
        line((R, B), (L, cy))
        # Kipp-Linien (Spitze oben Mitte)
        line((L, B), (cx, T))
        line((R, B), (cx, T))
        return

    if typ == 'dk-r':
        line((L, T), (R, cy))
        line((L, B), (R, cy))
        line((L, B), (cx, T))
        line((R, B), (cx, T))
        return


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    base = Image.open(os.path.join(root, 'img', 'fluegel-karten', '03_3-fluegel.png')).convert('RGBA')
    for fname, types in VARIANTS.items():
        img = base.copy()
        draw = ImageDraw.Draw(img)
        for pane_bbox, typ in zip(PANES, types):
            draw_pane(draw, pane_bbox, typ)
        out_path = os.path.join(root, 'img', 'anschlag-karten-3f', fname)
        img.save(out_path, optimize=True)
        print(f'  OK  {fname}  [{", ".join(types)}]')


if __name__ == '__main__':
    main()
