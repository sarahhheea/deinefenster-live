#!/usr/bin/env python3
"""
Faerbt das Glas der Haustuer-Karten gleichmaessig in dem Hellblau-Verlauf
der Fenster-Karten ein. Studio-BG bleibt erhalten (passt zum dunklen
Konfigurator-Karten-Hintergrund) — kein Flood-Fill, kein verfranselter
Rahmen.

Glas-Erkennung per scipy-freier morphologischer Erosion: Glas ist eine
GROSSE zusammenhaengende Region INNERHALB des Tuer-Rahmens. Der Anthrazit-
Rahmen trennt Glas vom Studio-BG.

Quelle: img/haustuer-karten/_backup/
Ziel:   img/haustuer-karten/
"""

import os
import numpy as np
from PIL import Image, ImageDraw

SRC = 'img/haustuer-karten/_backup'
OUT = 'img/haustuer-karten'

LIGHT = np.array([195, 215, 232], dtype=np.float32)
DARK  = np.array([148, 175, 200], dtype=np.float32)

BG_REF = np.array([37, 53, 69])

def recolor(path_in, path_out):
    # Schritt 1: Original laden
    img_orig = Image.open(path_in).convert('RGBA')
    W, H = img_orig.size

    # Schritt 2: Auf KOPIE die Flood-Fill machen — nur um BG-Region als
    # Maske zu identifizieren (nicht in Output uebernehmen)
    mask_img = img_orig.copy()
    for seed in [(0, 0), (W-1, 0), (0, H-1), (W-1, H-1)]:
        sp = mask_img.getpixel(seed)
        if abs(sp[0] - BG_REF[0]) < 30 and abs(sp[2] - BG_REF[2]) < 30:
            ImageDraw.floodfill(mask_img, seed, (255, 0, 255, 255), thresh=22)

    mask_arr = np.array(mask_img)
    is_outer_bg = (mask_arr[..., 0] == 255) & (mask_arr[..., 1] == 0) & (mask_arr[..., 2] == 255)

    # Schritt 3: Original-Pixel laden (mit unveraendertem Rahmen)
    arr = np.array(img_orig).astype(np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    # Schritt 4: Glas-Maske — blueish/mid-dark pixel die NICHT outer BG sind
    mean = (r + g + b) / 3.0
    blueshift = b - r
    glass_mask = ((blueshift >= 12) & (mean >= 45) & (mean <= 115) &
                  ((g - r) >= 4) & (~is_outer_bg))

    # Plus helle Reflexionen innerhalb des Korpus
    bright_refl = (mean > 115) & (mean < 240) & (b > r) & (~is_outer_bg)
    glass_mask = glass_mask | bright_refl

    # Schritt 5: Top-zu-Bottom Verlauf nur fuer Glas-Pixel
    H_arr, W_arr = r.shape
    if glass_mask.any():
        rows = np.where(glass_mask.any(axis=1))[0]
        y_min, y_max = rows.min(), rows.max()
        rng = max(y_max - y_min, 1.0)
        ys = np.arange(H_arr).reshape(-1, 1).astype(np.float32)
        t = np.clip((ys - y_min) / rng, 0.0, 1.0)
        t = t * np.ones_like(r)
    else:
        t = np.zeros_like(r)

    new_r = LIGHT[0] + (DARK[0] - LIGHT[0]) * t
    new_g = LIGHT[1] + (DARK[1] - LIGHT[1]) * t
    new_b = LIGHT[2] + (DARK[2] - LIGHT[2]) * t

    out = arr.copy()
    out[glass_mask, 0] = new_r[glass_mask]
    out[glass_mask, 1] = new_g[glass_mask]
    out[glass_mask, 2] = new_b[glass_mask]
    # BG bleibt erhalten — kein Alpha-Aenderung

    Image.fromarray(out.astype(np.uint8)).save(path_out)
    g_pct = 100.0 * glass_mask.sum() / glass_mask.size
    print(f"{os.path.basename(path_in)}: glass {g_pct:.1f}%")

for fn in ['01_1-fluegel.png', '02_seitenteil-links.png',
           '03_seitenteil-rechts.png', '04_2-fluegel.png']:
    recolor(os.path.join(SRC, fn), os.path.join(OUT, fn))

print("Fertig.")
