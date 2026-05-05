#!/usr/bin/env python3
"""
DeineFenster.de — Farbe-Varianten Renderer
============================================
Repliziert den Canvas-Recoloring-Algorithmus aus konfigurator.html (rahmenFaerben)
in Python und generiert pre-rendered PNG-Dateien für alle wichtigen Farben.

Vorteil: funktioniert auch auf file:// (kein Canvas-Cross-Origin-Problem),
schneller im Konfigurator (kein JS-Compute pro Klick).

Sarah-Wunsch 28.04.2026.
"""
from __future__ import annotations
import os, sys
from pathlib import Path
import numpy as np
from PIL import Image
from collections import deque

# ────────────────────────────────────────────────────────────────
# FARB-MAP (synchron zu P.fa in konfigurator.html)
# ────────────────────────────────────────────────────────────────
# Top-15 wichtigste Farben für DeineFenster.de
FARBEN = {
    # WICHTIG: 'weiss' wird übersprungen — das ist das Master-Bild selbst
    'cremeweiss':   '#fdf6e3',  # RAL 9001
    'achatgrau':    '#b4b6a8',  # RAL 7038
    'lichtgrau':    '#c5c6be',  # RAL 7035
    'signalgrau':   '#9c9c9c',  # RAL 7004
    'betongrau':    '#7c7f79',  # RAL 7023
    'quarzgrau':    '#6c6f66',  # RAL 7039
    'basaltgrau':   '#4f5458',  # RAL 7012
    'schiefergrau': '#3e454c',  # RAL 7015
    'anthrazit':    '#373d3f',  # RAL 7016 ← MEISTGEKAUFTE Premium-Farbe
    'schwarzbraun': '#26211e',  # RAL 8022
    'schwarz':      '#0e0e10',  # RAL 9005
    # Holzoptiken
    'eiche-hell':   '#d4bc98',
    'eiche-natur':  '#b89660',
    'golden-oak':   '#9b6840',  # ← Klassiker
    'winchester':   '#8c6440',
    'nussbaum':     '#6e4828',  # ← Klassiker
    'mahagoni':     '#6b3a2a',
    'mooreiche':    '#4e3828',
    'dunkleiche':   '#3c2c20',
    # Bunt (selten, aber Drutex bietet sie an)
    'moosgruen':    '#1e3e2c',  # RAL 6005
    'stahlblau':    '#1c4c6c',  # RAL 5150
    'dunkelrot':    '#6c1c1c',  # RAL 3081
}

# Master-Bilder (Quellen)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
IMG_DIR = PROJECT_DIR / 'img'
VARIANTEN_DIR = IMG_DIR / 'varianten'
VARIANTEN_DIR.mkdir(parents=True, exist_ok=True)

MASTER = {
    'fenster':    IMG_DIR / 'fenster_standard.png',
    'balkontuer': IMG_DIR / 'balkontuer_standard.png',
    'haustuer':   IMG_DIR / 'haustuer_standard.png',
    'hst':        IMG_DIR / 'hst_standard.png',
}

# ────────────────────────────────────────────────────────────────
# RECOLORING-ALGORITHMUS (1:1 Port aus rahmenFaerben in konfigurator.html)
# ────────────────────────────────────────────────────────────────
def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def normalize_to_canvas(img: Image.Image, size: int = 1024) -> Image.Image:
    """Bild zentriert auf size×size weißem Canvas (aspect-fit)."""
    img = img.convert('RGB')
    w, h = img.size
    scale = min(size / w, size / h)
    new_w, new_h = int(w * scale), int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new('RGB', (size, size), (255, 255, 255))
    off_x, off_y = (size - new_w) // 2, (size - new_h) // 2
    canvas.paste(img_resized, (off_x, off_y))
    return canvas


def detect_regions(arr: np.ndarray, hardware_schutz: bool = True) -> np.ndarray:
    """
    Klassifiziert Pixel:
    0 = Rahmen (umzufärben)
    1 = Hintergrund (nicht ändern)
    2 = Glas (nicht ändern)
    3 = Hardware/Griff (nicht ändern)
    """
    H, W, _ = arr.shape
    mark = np.zeros((H, W), dtype=np.uint8)
    avg = arr.mean(axis=2)

    # 1. Hintergrund-Flood-Fill (avg > 232) von 4 Ecken + Kantenmitte
    bg_seeds = [(0, 0), (0, W-1), (H-1, 0), (H-1, W-1),
                (0, W//2), (H-1, W//2),
                (H//2, 0), (H//2, W-1)]
    bg_stack = deque(bg_seeds)
    while bg_stack:
        y, x = bg_stack.pop()
        if mark[y, x]:
            continue
        if avg[y, x] < 232:
            continue
        mark[y, x] = 1
        if x > 0:    bg_stack.append((y, x-1))
        if x < W-1:  bg_stack.append((y, x+1))
        if y > 0:    bg_stack.append((y-1, x))
        if y < H-1:  bg_stack.append((y+1, x))

    # 2. Glas-Flood-Fill (avg < 145) von Mitte + Versatz
    gl_seeds = [(H//2, W//2), (int(H*0.4), W//2), (int(H*0.6), W//2)]
    gl_stack = deque(gl_seeds)
    while gl_stack:
        y, x = gl_stack.pop()
        if mark[y, x]:
            continue
        if avg[y, x] >= 145:
            continue
        mark[y, x] = 2
        if x > 0:    gl_stack.append((y, x-1))
        if x < W-1:  gl_stack.append((y, x+1))
        if y > 0:    gl_stack.append((y-1, x))
        if y < H-1:  gl_stack.append((y+1, x))

    # 3. Hardware (Griff, Scharniere): mittleres Grau, niedrige Sättigung
    if hardware_schutz:
        r = arr[:, :, 0].astype(float)
        g = arr[:, :, 1].astype(float)
        b = arr[:, :, 2].astype(float)
        max_c = np.maximum(np.maximum(r, g), b)
        min_c = np.minimum(np.minimum(r, g), b)
        sat = (max_c - min_c) / np.maximum(avg, 1)
        hw_mask = (mark == 0) & (avg >= 70) & (avg <= 175) & (sat < 0.13)
        mark[hw_mask] = 3

        # 3b. Hardware-Highlights: helle Nachbarn (avg 175–235) erweitern
        hw_expand = np.zeros((H, W), dtype=bool)
        # Vektorisiert: shift-Nachbarn checken
        for shift_y, shift_x in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            shifted_hw = np.roll(mark == 3, shift=(shift_y, shift_x), axis=(0, 1))
            # Randzonen: nicht über Grenzen wickeln
            if shift_y == -1: shifted_hw[-1, :] = False
            if shift_y == 1:  shifted_hw[0, :] = False
            if shift_x == -1: shifted_hw[:, -1] = False
            if shift_x == 1:  shifted_hw[:, 0] = False
            candidate = shifted_hw & (mark == 0) & (avg > 175) & (avg < 235)
            hw_expand |= candidate
        mark[hw_expand] = 3

    return mark


def recolor_frame(arr: np.ndarray, mark: np.ndarray, hex_color: str,
                  hardware_schutz: bool = True) -> np.ndarray:
    """
    Färbt Rahmen-Pixel (mark==0) in Zielfarbe ein.
    Verwendet Luminanz-Multiplikation mit Gamma 1.25 (wie JS).
    """
    zr, zg, zb = hex_to_rgb(hex_color)
    out = arr.copy()
    avg = arr.mean(axis=2)

    min_hell = 60 if hardware_schutz else 50
    rahmen_mask = (mark == 0) & (avg >= min_hell)

    # Normiert auf 245 (weißer Rahmen) + Gamma 1.25
    raw_lum = np.minimum(1.0, avg[rahmen_mask] / 245.0)
    lum = np.power(raw_lum, 1.25)

    out[rahmen_mask, 0] = np.clip(zr * lum, 0, 255).astype(np.uint8)
    out[rahmen_mask, 1] = np.clip(zg * lum, 0, 255).astype(np.uint8)
    out[rahmen_mask, 2] = np.clip(zb * lum, 0, 255).astype(np.uint8)

    return out


def render_variant(master_path: Path, hex_color: str, output_path: Path,
                   hardware_schutz: bool = True) -> None:
    """Vollständiger Render-Pass für eine Farb-Variante."""
    img = Image.open(master_path)
    canvas = normalize_to_canvas(img, size=1024)
    arr = np.array(canvas, dtype=np.uint8)

    mark = detect_regions(arr, hardware_schutz=hardware_schutz)
    out_arr = recolor_frame(arr, mark, hex_color, hardware_schutz=hardware_schutz)

    out_img = Image.fromarray(out_arr, 'RGB')
    out_img.save(output_path, 'PNG', optimize=True)


# ────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────
def main() -> None:
    print(f"\n🎨 DeineFenster Farb-Varianten Generator")
    print(f"────────────────────────────────────────────")
    print(f"Master-Bilder: {len(MASTER)} | Farben: {len(FARBEN)}")
    print(f"Total: {len(MASTER) * len(FARBEN)} Varianten\n")

    total = 0
    skipped = 0

    for prod, master_path in MASTER.items():
        if not master_path.exists():
            print(f"⚠️  {prod}: Master fehlt → {master_path}")
            continue

        # Haustür hat oft Edelstahl-Griff (kein Hardware-Schutz nötig wenn schon dunkel),
        # aber für die Mehrheit gilt hardware_schutz=True
        hw_schutz = True

        print(f"\n📦 {prod} ({master_path.name})")
        for farb_key, hex_color in FARBEN.items():
            output_path = VARIANTEN_DIR / f'{prod}_{farb_key}.png'
            if output_path.exists():
                skipped += 1
                continue
            try:
                render_variant(master_path, hex_color, output_path,
                               hardware_schutz=hw_schutz)
                total += 1
                print(f"   ✓ {farb_key:<14} → {output_path.name}")
            except Exception as e:
                print(f"   ✗ {farb_key:<14} → ERROR: {e}")

    print(f"\n────────────────────────────────────────────")
    print(f"✅ Fertig: {total} neue Varianten generiert ({skipped} übersprungen)")
    print(f"📁 Output: {VARIANTEN_DIR}\n")


if __name__ == '__main__':
    main()
