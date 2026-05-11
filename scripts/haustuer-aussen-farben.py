#!/usr/bin/env python3
"""
DeineFenster.de — Haustür Außenansicht: alle Farb-Varianten für alle Modelle
==============================================================================
Nimmt die Anthrazit-Katalogfotos (IGLO Energy / czarny_antracyt.jpg) als Master,
erkennt PVC-Rahmen-Pixel und färbt sie in alle 39 Konfigurator-Farben.
Glas, Beschläge, Stoßgriff und Hintergrund bleiben unverändert.

Output: img/farben/haustuer_aussen_<modelKey>_<colorKey>.png

Ausführen: python3 scripts/haustuer-aussen-farben.py
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np
from PIL import Image

# ── Pfade ──────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
IMG_DIR     = PROJECT_DIR / 'img'
TUEREN_DIR  = IMG_DIR / 'drutex-tueren'
OUT_DIR     = IMG_DIR / 'farben'
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Modell-Key → Quelldatei (nur Anthrazit-Quellen — recolorbar) ───
# Exakt die Keys aus TUER_IMGS in konfigurator.html
MODEL_SOURCES: dict[str, str] = {
    # IGLO Energy · Klassisch (czarny = schwarz/anthrazit)
    'alaska-1':           'alaska-czarny-1_antracyt.jpg',
    'alaska-2':           'alaska-czarny-2_antracyt.jpg',
    'arizona-1':          'arizona-czarny-1_antracyt.jpg',
    'arizona-2':          'arizona-czarny-2_antracyt.jpg',
    'california-1-c':     'california-czarny-1-c_antracyt.jpg',
    'california-1-lr':    'california-czarny-1-lr_antracyt.jpg',
    'colorado':           'colorado-czarny_antracyt.jpg',
    'florida-lr':         'florida-czarny-lr_antracyt.jpg',
    'hawaii-2':           'hawaii-czarny-2_antracyt.jpg',
    'hawaii-3':           'hawaii-czarny-3_antracyt.jpg',
    'montana-1':          'montana-czarny-1_antracyt.jpg',
    'montana-2-lr':       'montana-czarny-2-lr_antracyt.jpg',
    'montana-3-lr':       'montana-czarny-3-lr_antracyt.jpg',
    'nebraska-lcr':       'nebraska-czarny-lcr_antracyt.jpg',
    'ohio':               'ohio-czarny_antracyt.jpg',
    'pennsylvania-1':     'pennsylvania-czarny-1_antracyt.jpg',
    'pennsylvania-2-lr':  'pennsylvania-czarny-2-lr_antracyt.jpg',
    'pennsylvania-3-lr':  'pennsylvania-czarny-3-lr_antracyt.jpg',
    'texas-c':            'texas-czarny-c_antracyt.jpg',
    'texas-lr':           'texas-czarny-lr_antracyt.jpg',
    # IGLO Energy · Inox (gleiche Türform, anderer Beschlag)
    'alaska-1-inox':      'alaska-inox-1_antracyt.jpg',
    'alaska-2-inox':      'alaska-inox-2_antracyt.jpg',
    'arizona-1-inox':     'arizona-inox-1_antracyt.jpg',
    'arizona-2-inox':     'arizona-inox-2_antracyt.jpg',
    'california-1-c-inox':  'california-inox-1-c_antracyt.jpg',
    'california-1-lr-inox': 'california-inox-1-lr_antracyt.jpg',
    'colorado-inox':      'colorado-inox_antracyt.jpg',
    'florida-lr-inox':    'florida-inox-lr_antracyt.jpg',
    'hawaii-2-inox':      'hawaii-inox-2_antracyt.jpg',
    'hawaii-3-inox':      'hawaii-inox-3_antracyt.jpg',
    'montana-1-inox':     'montana-inox-1_antracyt.jpg',
    'montana-2-lr-inox':  'montana-inox-2-lr_antracyt.jpg',
    'montana-3-lr-inox':  'montana-inox-3-lr_antracyt.jpg',
    'nebraska-lcr-inox':  'nebraska-inox-lcr_antracyt.jpg',
    'ohio-inox':          'ohio-inox_antracyt.jpg',
    'pennsylvania-1-inox':    'pennsylvania-inox-1_antracyt.jpg',
    'pennsylvania-2-lr-inox': 'pennsylvania-inox-2-lr_antracyt.jpg',
    'pennsylvania-3-lr-inox': 'pennsylvania-inox-3-lr_antracyt.jpg',
    'texas-c-inox':       'texas-inox-c_antracyt.jpg',
    'texas-lr-inox':      'texas-inox-lr_antracyt.jpg',
}

# ── Farb-Map (exakt die farbeKey-Werte aus konfigurator.html) ──────
FARBEN: dict[str, str] = {
    'cremeweiss':  '#fdf6e3',
    'weiss-fx':    '#f4f4f0',
    'crown-plat':  '#dddbd6',
    'lichtgrau':   '#c5c6be',
    'sheffield':   '#c8b89a',
    'eiche-hell':  '#c8b89a',
    'eiche-nat':   '#b89660',
    'betongrau':   '#7c7f79',
    'quarzgr-sa':  '#6c6f66',
    'quarzgr-gl':  '#6c6f66',
    'basaltgr-sa': '#4f5458',
    'basaltgr-gl': '#4f5458',
    'schiefgr-sa': '#3e454c',
    'schiefgr-gl': '#3e454c',
    'eisengl':     '#3c3e42',
    'anthrazit':   '#373d3f',
    'anthraz-gl':  '#373d3f',
    'anthraz-um':  '#2e3235',
    'schwarz-um':  '#1a1c1e',
    'golden-oak':  '#9b6840',
    'winchester':  '#8c6440',
    'oregon':      '#a07040',
    'douglasie':   '#906238',
    'nussbaum':    '#6e4828',
    'mooreiche':   '#4e3828',
    'dunkleiche':  '#3c2c20',
    'schwarzbr':   '#26211e',
    'macore':      '#7a4030',
    'mahagoni':    '#6b3a2a',
    'schoko-br':   '#4a2820',
    'moosgruen':   '#2d4a30',
    'dunkelgr':    '#1e3828',
    'dunkelrot':   '#6c1c1c',
    'brillblau':   '#1c5080',
    'stahlblau':   '#1c4c6c',
    'piryt':       '#6a5a30',
    'jet-black':   '#101214',
    'deep-bronze': '#6b6040',
    'grafitgr':    '#4a4c46',
}

# ── Hilfsfunktionen ────────────────────────────────────────────────

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _dilate(mask: np.ndarray, px: int) -> np.ndarray:
    """Schnelle binäre Dilation ohne scipy — N Pixel in alle Richtungen."""
    result = mask.copy()
    for _ in range(px):
        tmp = result.copy()
        tmp[:-1, :] |= result[1:, :]
        tmp[1:,  :] |= result[:-1, :]
        tmp[:,  :-1] |= result[:, 1:]
        tmp[:,   1:] |= result[:, :-1]
        result = tmp
    return result


def detect_frame_mask(arr: np.ndarray) -> np.ndarray:
    """
    Erkennt PVC-Rahmen-Pixel in einem Anthrazit-Katalogbild.
    v5: Glas-Maske wird um 8px erweitert → keine Farb-Bleed-Artefakte an Glas-Kanten.
    """
    avg = arr.mean(axis=2)
    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat   = (max_c - min_c) / np.maximum(avg, 1)

    # Hintergrund
    bg_mask = avg > 240

    # Rahmen-Kandidaten
    frame_candidate = (avg >= 25) & (avg <= 155) & (sat < 0.22)

    # Glas: breite Erkennung (milchig bis leicht getönt) + 8px Puffer
    glass_core = (avg >= 140) & (avg <= 240) & (sat < 0.12) & (~bg_mask)
    glass_mask = _dilate(glass_core, px=8)   # Rand-Bleed verhindern

    very_dark   = avg < 20
    metal_light = (avg > 238) & (~bg_mask)

    frame_mask = (frame_candidate
                  & ~bg_mask
                  & ~glass_mask
                  & ~very_dark
                  & ~metal_light)

    return frame_mask


def _linearize(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _gamma_encode(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, None)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1.0 / 2.4) - 0.055)


def _f_lab(t: np.ndarray) -> np.ndarray:
    return np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16.0 / 116.0)


def _f_lab_inv(t: np.ndarray) -> np.ndarray:
    return np.where(t > 0.206897, t ** 3, (t - 16.0 / 116.0) / 7.787)


def rgb_to_lab(arr: np.ndarray) -> np.ndarray:
    """RGB uint8 (H,W,3) → CIE Lab float32 (H,W,3)."""
    f = arr.astype(np.float32) / 255.0
    r, g, b = _linearize(f[:,:,0]), _linearize(f[:,:,1]), _linearize(f[:,:,2])
    X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    Y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.00000
    Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    fx, fy, fz = _f_lab(X), _f_lab(Y), _f_lab(Z)
    L = 116.0 * fy - 16.0
    a = 500.0 * (fx - fy)
    bch = 200.0 * (fy - fz)
    return np.stack([L, a, bch], axis=2).astype(np.float32)


def lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    """CIE Lab float32 (H,W,3) → RGB uint8 (H,W,3)."""
    L, a, bch = lab[:,:,0], lab[:,:,1], lab[:,:,2]
    fy = (L + 16.0) / 116.0
    fx = a / 500.0 + fy
    fz = fy - bch / 200.0
    X = 0.95047 * _f_lab_inv(fx)
    Y = 1.00000 * _f_lab_inv(fy)
    Z = 1.08883 * _f_lab_inv(fz)
    r  =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z
    g  = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z
    b  =  0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z
    rgb = np.stack([_gamma_encode(r), _gamma_encode(g), _gamma_encode(b)], axis=2)
    return np.clip(rgb * 255, 0, 255).astype(np.uint8)


def recolor(arr: np.ndarray, frame_mask: np.ndarray, hex_color: str) -> np.ndarray:
    """
    v4 — CIE Lab Farbraum (Photoshop "Color"-Modus).

    Strategie:
    - Zielfarbe → Lab: L* skaliert auf Zielhelligkeit, a* + b* = Zielchrominanz
    - Quell-L* (Tiefen/Lichter des Anthrazit-Originals) wird auf den
      Helligkeitsbereich der Zielfarbe remappt: [t_L*0.55 … min(t_L*1.25, 98)]
    - Chrominanz wird vollständig durch Zielfarbe ersetzt
    - Ergebnis: alle Farben (hell, dunkel, bunt) mit echter Tiefe
    """
    zr, zg, zb = hex_to_rgb(hex_color)

    # Zielfarbe → Lab
    t_lab = rgb_to_lab(np.array([[[zr, zg, zb]]], dtype=np.uint8))
    t_L = float(t_lab[0, 0, 0])
    t_a = float(t_lab[0, 0, 1])
    t_b = float(t_lab[0, 0, 2])

    # Quell-Lab
    src_lab = rgb_to_lab(arr)
    avg = arr.mean(axis=2)
    mask = frame_mask & (avg >= 25)

    src_L = src_lab[:, :, 0][mask]
    L_min = float(src_L.min())
    L_max = float(src_L.max())
    src_range = max(L_max - L_min, 1.0)
    pos = (src_L - L_min) / src_range   # [0, 1]

    # Ziel-Helligkeitsbereich
    L_lo = t_L * 0.55
    L_hi = min(t_L * 1.25, 98.0)
    if L_hi - L_lo < 6.0:              # sehr dunkle Zielfarben: mehr Kontrast
        L_lo = max(t_L - 10.0, 0.0)
        L_hi = min(t_L + 10.0, 100.0)

    out_lab = src_lab.copy()
    out_lab[:, :, 0][mask] = L_lo + pos * (L_hi - L_lo)
    out_lab[:, :, 1][mask] = t_a
    out_lab[:, :, 2][mask] = t_b

    result = arr.copy()
    result[mask] = lab_to_rgb(out_lab)[mask]
    return result


# ── Main ───────────────────────────────────────────────────────────

def main() -> None:
    total_models = len(MODEL_SOURCES)
    total_colors = len(FARBEN)
    total_images = total_models * total_colors

    print(f"\n🚪 Haustür Außen — Farb-Varianten Generator")
    print(f"  Modelle : {total_models}  (IGLO Energy Klassisch + Inox)")
    print(f"  Farben  : {total_colors}")
    print(f"  Output  : {OUT_DIR}/haustuer_aussen_<modell>_<farbe>.png")
    print(f"  Gesamt  : {total_images:,} Bilder")
    print()

    done = skipped = errors = 0

    for model_key, src_file in MODEL_SOURCES.items():
        src_path = TUEREN_DIR / src_file
        if not src_path.exists():
            print(f"  ⚠ Quelldatei fehlt: {src_file} — Model '{model_key}' übersprungen")
            errors += len(FARBEN)
            continue

        # Maske einmalig pro Modell berechnen
        img_master = Image.open(src_path).convert('RGB')
        arr_master = np.array(img_master, dtype=np.uint8)
        frame_mask = detect_frame_mask(arr_master)

        frame_pct = round(100 * frame_mask.sum() / frame_mask.size, 1)
        print(f"  📁 {model_key:<28} Rahmen={frame_mask.sum():>8,} ({frame_pct}%)")

        for color_key, hex_color in FARBEN.items():
            out_path = OUT_DIR / f'haustuer_aussen_{model_key}_{color_key}.png'
            if out_path.exists():
                skipped += 1
                continue
            try:
                recolored = recolor(arr_master, frame_mask, hex_color)
                Image.fromarray(recolored, 'RGB').save(out_path, 'PNG', optimize=True)
                done += 1
            except Exception as e:
                errors += 1
                print(f"    ✗ {color_key:<16} ERROR: {e}")

        print(f"    ✓ {total_colors} Farben → {OUT_DIR.name}/haustuer_aussen_{model_key}_*.png")

    print(f"\n{'─'*64}")
    print(f"✅ {done:,} neue Bilder  |  ⏭  {skipped:,} übersprungen  |  ❌ {errors} Fehler")
    print(f"📁 {OUT_DIR}\n")

    if done > 0:
        print("Nächster Schritt: Konfigurator-Logik in vorschauAktualisieren() aktualisieren")
        print("  Block 2e: haustuer_aussen_<modelKey>_<colorKey>.png als Priorität nutzen")


if __name__ == '__main__':
    main()
