"""Zeichnet Anschlag-Linien auf Oberlicht-Karten (1ol, 2f-ol, 3f-ol).

Pro Layout:
  - 1ol  → Basis: img/fluegel-karten/04_1-oberlicht.png  (1 Oberlicht + 1 Haupt-Pane)
  - 2f-ol → Basis: img/fluegel-karten/05_2-oberlicht.png (2 OL + 2 Haupt-Panes)
  - 3f-ol → Basis: img/fluegel-karten/06_3-oberlicht.png (3 OL + 3 Haupt-Panes)

Filename Konvention:
  - 1ol:    ol<OL>-<MAIN>.png        z.B. olFest-dk-l.png, olKipp-fest.png
  - 2f-ol:  *-ol<OL>.png             z.B. pfosten-dkL-dkR-olFest.png
  - 3f-ol:  pp-...-ol<OL>.png
"""
from PIL import Image, ImageDraw
import os

LINE = (12, 28, 62)  # #0c1c3e — gleiche Farbe wie 1F+2F+3F
LINE_W = 6           # gleiche Dicke für ALLE Linien (Oberlicht und Haupt)

# Echte Glas-Bbox aus Light-Blue-Pixel-Detection (min/max der hellblauen Cluster)

# Layout 1: 1-Oberlicht (04_1-oberlicht.png)
PANES_1OL = {
    'ol':   [(43, 41, 661, 202)],
    'main': [(60, 268, 644, 723)],
}

# Layout 2: 2-Oberlicht (05_2-oberlicht.png)
PANES_2OL = {
    'ol':   [(40, 38, 329, 197), (375, 38, 663, 197)],
    'main': [(60, 264, 308, 722), (396, 264, 644, 722)],
}

# Layout 3: 3-Oberlicht (06_3-oberlicht.png)
PANES_3OL = {
    'ol':   [(40, 40, 218, 206), (263, 40, 439, 206), (484, 40, 661, 206)],
    'main': [(59, 268, 196, 722), (284, 268, 419, 722), (508, 268, 643, 722)],
}


def draw_pane(draw, bbox, typ, thin=False):
    x0, y0, x1, y1 = bbox
    # Pad = 0: Linien-Endpunkte exakt am Glasrand
    L = x0
    R = x1
    T = y0
    B = y1
    cx = (L + R) // 2
    cy = (T + B) // 2
    w = LINE_W  # gleiche Dicke für alle Panes

    def line(p1, p2, ww=w):
        draw.line([p1, p2], fill=LINE, width=ww)

    if typ == 'fest':
        line((L, T), (R, B))
        line((R, T), (L, B))
        return
    if typ == 'kipp':
        # Drutex-Symbol: nur Dreieck mit Spitze oben — kein Bodenstrich
        line((L, B), (cx, T))
        line((R, B), (cx, T))
        return
    if typ == 'dreh-l':
        line((R, T), (L, cy))
        line((R, B), (L, cy))
        return
    if typ == 'dreh-r':
        line((L, T), (R, cy))
        line((L, B), (R, cy))
        return
    if typ == 'dk-l':
        line((R, T), (L, cy))
        line((R, B), (L, cy))
        line((L, B), (cx, T))
        line((R, B), (cx, T))
        return
    if typ == 'dk-r':
        line((L, T), (R, cy))
        line((L, B), (R, cy))
        line((L, B), (cx, T))
        line((R, B), (cx, T))
        return


# === 1OL VARIANTS ===
VARIANTS_1OL = {
    'olFest-dk-l.png':  {'ol': 'fest', 'main': 'dk-l'},
    'olFest-dk-r.png':  {'ol': 'fest', 'main': 'dk-r'},
    'olFest-fest.png':  {'ol': 'fest', 'main': 'fest'},
    'olKipp-dk-l.png':  {'ol': 'kipp', 'main': 'dk-l'},
    'olKipp-dk-r.png':  {'ol': 'kipp', 'main': 'dk-r'},
    'olKipp-fest.png':  {'ol': 'kipp', 'main': 'fest'},
}

# === 2F-OL VARIANTS ===
VARIANTS_2FOL = {
    'dkL-fest-olKipp.png':           {'ol': 'kipp', 'main': ['dk-l', 'fest']},
    'fest-dkR-olKipp.png':           {'ol': 'kipp', 'main': ['fest', 'dk-r']},
    'pfosten-dkL-dkR-olFest.png':    {'ol': 'fest', 'main': ['dk-l', 'dk-r']},
    'pfosten-dkL-dkR-olKipp.png':    {'ol': 'kipp', 'main': ['dk-l', 'dk-r']},
    'pfosten-dkL-drehR-olFest.png':  {'ol': 'fest', 'main': ['dk-l', 'dreh-r']},
    'pfosten-dkL-drehR-olKipp.png':  {'ol': 'kipp', 'main': ['dk-l', 'dreh-r']},
    'pfosten-drehL-dkR-olFest.png':  {'ol': 'fest', 'main': ['dreh-l', 'dk-r']},
    'pfosten-drehL-dkR-olKipp.png':  {'ol': 'kipp', 'main': ['dreh-l', 'dk-r']},
}

# === 3F-OL VARIANTS ===
VARIANTS_3FOL = {
    'pp-dkL-drehR-dkR-olKipp.png':   {'ol': 'kipp', 'main': ['dk-l', 'dreh-r', 'dk-r']},
}


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fluegel = os.path.join(root, 'img', 'fluegel-karten')

    layouts = [
        (PANES_1OL, VARIANTS_1OL, '04_1-oberlicht.png', 'anschlag-karten-1ol', False),
        (PANES_2OL, VARIANTS_2FOL, '05_2-oberlicht.png', 'anschlag-karten-2f-ol', True),
        (PANES_3OL, VARIANTS_3FOL, '06_3-oberlicht.png', 'anschlag-karten-3f-ol', True),
    ]

    for panes, variants, base_name, target_folder, multi_main in layouts:
        base = Image.open(os.path.join(fluegel, base_name)).convert('RGBA')
        target_dir = os.path.join(root, 'img', target_folder)
        print(f'\n{target_folder}:')
        for fname, spec in variants.items():
            img = base.copy()
            draw = ImageDraw.Draw(img)
            for ol_bbox in panes['ol']:
                draw_pane(draw, ol_bbox, spec['ol'])
            if multi_main:
                for main_bbox, main_typ in zip(panes['main'], spec['main']):
                    draw_pane(draw, main_bbox, main_typ)
            else:
                draw_pane(draw, panes['main'][0], spec['main'])
            out = os.path.join(target_dir, fname)
            img.save(out, optimize=True)
            print(f'  OK  {fname}')


if __name__ == '__main__':
    main()
