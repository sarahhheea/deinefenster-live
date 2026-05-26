#!/usr/bin/env python3
"""
Faerbt das Glas der Haustuer-Karten-Bilder in dem Hellblau-Ton der
Fenster-Karten ein UND macht den dunklen Studio-Hintergrund
transparent. So passt die Karte in den anthrazit-blauen Card-Container
wie die Fenster-Karten.

Quelle: img/haustuer-karten/_backup/ (Original Drutex-Tueren mit
dunklem Studio-BG + dunklem Glas)
Ziel:   img/haustuer-karten/ (Tuer-Form + Anthrazit-Rahmen + Schatten
        + Griff bleiben; Glas wird hellblau; BG wird transparent)
"""

import os
import numpy as np
from PIL import Image

SRC = 'img/haustuer-karten/_backup'
OUT = 'img/haustuer-karten'

# Target-Farbverlauf aus fluegel-karten/01_1-fluegel.png:
DARK  = np.array([135, 165, 190], dtype=np.float32)
LIGHT = np.array([195, 215, 230], dtype=np.float32)

# Studio-BG-Farbe der Original-Tuerbilder: ca. (37, 53, 69)
BG_REF = np.array([37, 53, 69], dtype=np.float32)
BG_TOL = 8  # Pixel mit Diff < 8 in jedem Kanal = BG -> transparent

def recolor(path_in, path_out):
    img = Image.open(path_in).convert('RGBA')
    arr = np.array(img).astype(np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    # 1) Studio-BG-Maske: Pixel sehr nahe an BG_REF
    bg_mask = ((np.abs(r - BG_REF[0]) <= BG_TOL) &
               (np.abs(g - BG_REF[1]) <= BG_TOL) &
               (np.abs(b - BG_REF[2]) <= BG_TOL))

    # 2) Glas-Maske: blaeulich, mittlere Helligkeit, NICHT BG, NICHT Frame
    #    Frame ist neutral-dunkel (b-r klein). Glas hat b-r >= ~15.
    mean = (r + g + b) / 3.0
    blueshift = b - r
    glass_mask = ((blueshift >= 14) & (mean >= 50) & (mean <= 115) &
                  ((g - r) >= 5) & (~bg_mask))

    # Helligkeitsfaktor (0..1) entlang des bestehenden Glas-Verlaufs
    if glass_mask.any():
        glass_vals = mean[glass_mask]
        gmin, gmax = glass_vals.min(), glass_vals.max()
        rng = max(gmax - gmin, 1.0)
        t = np.clip((mean - gmin) / rng, 0.0, 1.0)
    else:
        t = np.zeros_like(mean)

    new_r = DARK[0] + (LIGHT[0] - DARK[0]) * t
    new_g = DARK[1] + (LIGHT[1] - DARK[1]) * t
    new_b = DARK[2] + (LIGHT[2] - DARK[2]) * t

    out = arr.copy()
    # Glas einfaerben
    out[glass_mask, 0] = new_r[glass_mask]
    out[glass_mask, 1] = new_g[glass_mask]
    out[glass_mask, 2] = new_b[glass_mask]
    # BG transparent
    out[bg_mask, 3] = 0.0

    Image.fromarray(out.astype(np.uint8)).save(path_out)
    g_pct = 100.0 * glass_mask.sum() / glass_mask.size
    b_pct = 100.0 * bg_mask.sum() / bg_mask.size
    print(f"{os.path.basename(path_in)}: glass {g_pct:.1f}%, bg {b_pct:.1f}% -> {path_out}")

for fn in ['01_1-fluegel.png', '02_seitenteil-links.png',
           '03_seitenteil-rechts.png', '04_2-fluegel.png']:
    recolor(os.path.join(SRC, fn), os.path.join(OUT, fn))

print("Fertig.")
