# Bild-Matrix Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete image pipeline (LAB recoloring, flip, compositing, validation) and integrate it into the konfigurator, replacing the primitive Pillow RGB recoloring with LAB color space processing.

**Architecture:** A Python pipeline reads white AI masters, recolors them via LAB color space (preserving luminance/3D depth while injecting color), generates flipped Anschlag variants, composites Haustür Seitenteile, and validates output. The konfigurator JS is updated to load these new images with proper fallback chains.

**Tech Stack:** Python 3 (Pillow, NumPy — reines NumPy für LAB-Konvertierung), Bash orchestration, vanilla JS integration in konfigurator.html

**Spec:** `docs/superpowers/specs/2026-05-08-bild-matrix-konfigurator-design.md`

**Existing code to know about:**
- `scripts/process-master-image.py` — normalizes masters to 1024×1280, 92% content height. KEEP.
- `scripts/recolor-varianten.py` — current RGB recoloring (flood-fill region detection + luminance multiply). REPLACE with LAB approach.
- `konfigurator.html:5111-5161` — `PROD_IMGS_VIEW` maps product × view × flügel → master image path.
- `konfigurator.html:5526-5571` — `COLOR_FILTER` CSS fallbacks (45 colors).
- `konfigurator.html:5591-5608` — `COLOR_HEX` reference hex values per color key.
- `konfigurator.html:5945-6139` — `vorschauAktualisieren()` preview logic.
- `img/farben/` — existing color variant images (~1,833 files).

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/farb_config.py` | CREATE | Central color definitions: all 45 color keys with hex, LAB target, category, holzdekor flag |
| `scripts/recolor-lab.py` | CREATE | LAB recoloring engine: master → colored variant. Replaces `recolor-varianten.py` |
| `scripts/flip-anschlag.py` | CREATE | Horizontal flip for Anschlag variants (DK-Rechts, DIN-Rechts) |
| `scripts/composite-seitenteil.py` | CREATE | Haustür model + Seitenteil element compositing |
| `scripts/validate-bilder.py` | CREATE | Validates image dimensions, proportions, color accuracy |
| `scripts/generate-all.sh` | CREATE | Orchestrates full pipeline: recolor → flip → validate |
| `konfigurator.html` | MODIFY | Update `PROD_IMGS_VIEW` v3→v4, add rolladen-aware logic, integrate new image paths |
| `img/holzdekor/` | CREATE DIR | Wood grain texture overlays for Holzdekor colors |

---

### Task 1: Central Color Config (`scripts/farb_config.py`)

**Files:**
- Create: `scripts/farb_config.py`
- Reference: `konfigurator.html:5591-5608` (COLOR_HEX)

All other pipeline scripts import colors from here. Single source of truth.

- [ ] **Step 1: Create farb_config.py with all 45 colors**

```python
#!/usr/bin/env python3
"""
DeineFenster.de — Zentrale Farbdefinitionen
============================================
Single Source of Truth für alle 45 Drutex-Farben.
Wird von recolor-lab.py, validate-bilder.py und generate-all.sh importiert.

Farb-Hex-Werte synchron mit COLOR_HEX in konfigurator.html:5591-5608.
Bei Abweichung: Drutex-Website ist Quelle der Wahrheit.
"""
from __future__ import annotations

# Farbkategorien bestimmen die Recoloring-Methode
KATEGORIE_UNI = 'uni'           # Einfache LAB-Tönung
KATEGORIE_HOLZ = 'holzdekor'    # LAB + Holzmaserung-Overlay
KATEGORIE_METALLIC = 'metallic' # LAB + leichter Glanz
KATEGORIE_SPEZIAL = 'spezial'   # LAB + besondere Textur
KATEGORIE_WEISS = 'weiss'       # Keine/minimale Tönung

FARBEN: dict[str, dict] = {
    # ── Weiß / Crème ──
    'weiss':       {'hex': '#ffffff', 'kategorie': KATEGORIE_WEISS},
    'cremeweiss':  {'hex': '#f0ebe0', 'kategorie': KATEGORIE_WEISS},
    'weiss-fx':    {'hex': '#ffffff', 'kategorie': KATEGORIE_WEISS},

    # ── RAL Grautöne ──
    'achatgrau':   {'hex': '#888888', 'kategorie': KATEGORIE_UNI},
    'lichtgrau':   {'hex': '#b0b0b0', 'kategorie': KATEGORIE_UNI},
    'signalgrau':  {'hex': '#636363', 'kategorie': KATEGORIE_UNI},
    'betongrau':   {'hex': '#525252', 'kategorie': KATEGORIE_UNI},
    'quarzgr-gl':  {'hex': '#4a4a4a', 'kategorie': KATEGORIE_UNI},
    'quarzgr-sa':  {'hex': '#4a4a4a', 'kategorie': KATEGORIE_UNI},
    'basaltgr-gl': {'hex': '#3a3a3a', 'kategorie': KATEGORIE_UNI},
    'basaltgr-sa': {'hex': '#3a3a3a', 'kategorie': KATEGORIE_UNI},
    'schiefgr-gl': {'hex': '#323232', 'kategorie': KATEGORIE_UNI},
    'schiefgr-sa': {'hex': '#323232', 'kategorie': KATEGORIE_UNI},

    # ── Anthrazit / Schwarz ──
    'anthrazit':   {'hex': '#2d2d2d', 'kategorie': KATEGORIE_UNI},
    'anthraz-gl':  {'hex': '#2a2a2a', 'kategorie': KATEGORIE_UNI},
    'anthraz-um':  {'hex': '#252525', 'kategorie': KATEGORIE_UNI},
    'schwarz-um':  {'hex': '#111111', 'kategorie': KATEGORIE_UNI},
    'schwarzbr':   {'hex': '#1a1510', 'kategorie': KATEGORIE_UNI},

    # ── Metallic ──
    'alux-db':     {'hex': '#5a5a5a', 'kategorie': KATEGORIE_METALLIC},
    'alu-gebr':    {'hex': '#909090', 'kategorie': KATEGORIE_METALLIC},
    'eisengl':     {'hex': '#383838', 'kategorie': KATEGORIE_METALLIC},
    'crown-plat':  {'hex': '#c2c2c2', 'kategorie': KATEGORIE_METALLIC},

    # ── Holzdekore ──
    'sheffield':   {'hex': '#8a6a40', 'kategorie': KATEGORIE_HOLZ},
    'winchester':  {'hex': '#6a4520', 'kategorie': KATEGORIE_HOLZ},
    'eiche-hell':  {'hex': '#b08050', 'kategorie': KATEGORIE_HOLZ},
    'eiche-nat':   {'hex': '#9a6830', 'kategorie': KATEGORIE_HOLZ},
    'golden-oak':  {'hex': '#7a3b1e', 'kategorie': KATEGORIE_HOLZ},
    'nussbaum':    {'hex': '#5a3018', 'kategorie': KATEGORIE_HOLZ},
    'mooreiche':   {'hex': '#3a1e0c', 'kategorie': KATEGORIE_HOLZ},
    'dunkleiche':  {'hex': '#2a1408', 'kategorie': KATEGORIE_HOLZ},
    'siena-noce':  {'hex': '#6a4025', 'kategorie': KATEGORIE_HOLZ},
    'siena-ross':  {'hex': '#5a2818', 'kategorie': KATEGORIE_HOLZ},
    'mahagoni':    {'hex': '#4a1c0c', 'kategorie': KATEGORIE_HOLZ},
    'macore':      {'hex': '#4a1a0a', 'kategorie': KATEGORIE_HOLZ},
    'oregon':      {'hex': '#b08550', 'kategorie': KATEGORIE_HOLZ},
    'douglasie':   {'hex': '#a07840', 'kategorie': KATEGORIE_HOLZ},
    'bergkiefer':  {'hex': '#c09860', 'kategorie': KATEGORIE_HOLZ},
    'teak':        {'hex': '#7a5020', 'kategorie': KATEGORIE_HOLZ},
    'schoko-br':   {'hex': '#3a1810', 'kategorie': KATEGORIE_HOLZ},
    'braun-mar':   {'hex': '#4a2818', 'kategorie': KATEGORIE_HOLZ},

    # ── Bunt ──
    'moosgruen':   {'hex': '#2a4a1a', 'kategorie': KATEGORIE_UNI},
    'dunkelgr':    {'hex': '#1e3a14', 'kategorie': KATEGORIE_UNI},
    'dunkelrot':   {'hex': '#502020', 'kategorie': KATEGORIE_UNI},
    'brillblau':   {'hex': '#1e3860', 'kategorie': KATEGORIE_UNI},
    'stahlblau':   {'hex': '#1a3050', 'kategorie': KATEGORIE_UNI},

    # ── Spezial ──
    'piryt':       {'hex': '#6a6a58', 'kategorie': KATEGORIE_SPEZIAL},
    'jet-black':   {'hex': '#0a0a0a', 'kategorie': KATEGORIE_SPEZIAL},
    'deep-bronze': {'hex': '#3a2a18', 'kategorie': KATEGORIE_SPEZIAL},
    'grafitgr':    {'hex': '#2a2a28', 'kategorie': KATEGORIE_SPEZIAL},
}

# Farben die NICHT recolored werden (Master = weißes Bild IST das Produkt)
SKIP_RECOLOR = {'weiss', 'weiss-fx'}

# Farben die nur leicht getönt werden
LEICHTE_TOENUNG = {'cremeweiss'}

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)

def get_recolor_farben() -> dict[str, dict]:
    """Gibt nur Farben zurück die recolored werden müssen (ohne weiss/weiss-fx)."""
    return {k: v for k, v in FARBEN.items() if k not in SKIP_RECOLOR}
```

- [ ] **Step 2: Verify import works**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 -c "from scripts.farb_config import FARBEN, get_recolor_farben; print(f'{len(FARBEN)} Farben, {len(get_recolor_farben())} zum Recoloring')"`

Expected: `45 Farben, 43 zum Recoloring` (weiss + weiss-fx skipped)

- [ ] **Step 3: Commit**

```bash
git add scripts/farb_config.py
git commit -m "feat: zentrale Farbdefinitionen (45 Drutex-Farben, kategorisiert)"
```

---

### Task 2: LAB Recoloring Engine (`scripts/recolor-lab.py`)

**Files:**
- Create: `scripts/recolor-lab.py`
- Reference: `scripts/recolor-varianten.py` (existing RGB approach — study `detect_regions()` for region detection logic)
- Import: `scripts/farb_config.py`

This is the core innovation: recolor using LAB color space instead of RGB multiplication.
LAB separates Luminance (L) from color (A=green-red, B=blue-yellow).
By keeping L and replacing A/B, we preserve 3D depth, shadows, and reflections.

- [ ] **Step 1: Create recolor-lab.py with region detection + LAB recoloring**

```python
#!/usr/bin/env python3
"""
DeineFenster.de — LAB Recoloring Engine
=========================================
Replaces primitive RGB recoloring (recolor-varianten.py) with LAB color space.

How it works:
1. Detect regions: background (white), glass (dark center), hardware (gray metallic), frame (everything else)
2. Convert frame pixels to LAB
3. Keep L channel (luminance = 3D depth, shadows, light reflections)
4. Replace A/B channels with target color's A/B values
5. For Holzdekore: apply wood grain texture as Multiply overlay before recoloring
6. Convert back to RGB, save

Usage:
    python3 scripts/recolor-lab.py <master.png> <output.png> --farbe anthrazit
    python3 scripts/recolor-lab.py <master.png> <output-dir/> --alle
    python3 scripts/recolor-lab.py <master.png> <output-dir/> --alle --prefix fenster_1fl
"""
from __future__ import annotations
import argparse, sys, os
from pathlib import Path
import numpy as np
from PIL import Image
from collections import deque

# Add scripts dir to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))
from farb_config import (
    FARBEN, SKIP_RECOLOR, LEICHTE_TOENUNG,
    KATEGORIE_HOLZ, KATEGORIE_METALLIC, KATEGORIE_SPEZIAL, KATEGORIE_WEISS,
    hex_to_rgb, get_recolor_farben
)

# ────────────────────────────────────────────────────────────────
# REGION DETECTION (improved from recolor-varianten.py)
# ────────────────────────────────────────────────────────────────
def detect_regions(arr: np.ndarray) -> np.ndarray:
    """
    Classify each pixel:
      0 = frame (to be recolored)
      1 = background (white, untouched)
      2 = glass (dark center, untouched)
      3 = hardware (handles, hinges — metallic gray, untouched)
    """
    H, W, _ = arr.shape
    mark = np.zeros((H, W), dtype=np.uint8)
    avg = arr.mean(axis=2)

    # 1. Background: flood-fill from edges (avg > 232)
    bg_seeds = [
        (0, 0), (0, W-1), (H-1, 0), (H-1, W-1),
        (0, W//2), (H-1, W//2), (H//2, 0), (H//2, W-1)
    ]
    bg_stack = deque(bg_seeds)
    while bg_stack:
        y, x = bg_stack.pop()
        if mark[y, x]: continue
        if avg[y, x] < 232: continue
        mark[y, x] = 1
        if x > 0:    bg_stack.append((y, x-1))
        if x < W-1:  bg_stack.append((y, x+1))
        if y > 0:    bg_stack.append((y-1, x))
        if y < H-1:  bg_stack.append((y+1, x))

    # 2. Glass: flood-fill from center (avg < 145)
    gl_seeds = [(H//2, W//2), (int(H*0.4), W//2), (int(H*0.6), W//2)]
    gl_stack = deque(gl_seeds)
    while gl_stack:
        y, x = gl_stack.pop()
        if mark[y, x]: continue
        if avg[y, x] >= 145: continue
        mark[y, x] = 2
        if x > 0:    gl_stack.append((y, x-1))
        if x < W-1:  gl_stack.append((y, x+1))
        if y > 0:    gl_stack.append((y-1, x))
        if y < H-1:  gl_stack.append((y+1, x))

    # 3. Hardware: metallic gray (low saturation, mid brightness)
    r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = (max_c - min_c) / np.maximum(avg, 1)
    hw_mask = (mark == 0) & (avg >= 70) & (avg <= 175) & (sat < 0.13)
    mark[hw_mask] = 3

    # Expand hardware to neighboring highlights
    for dy, dx in [(0,-1),(0,1),(-1,0),(1,0)]:
        shifted = np.roll(mark == 3, shift=(dy, dx), axis=(0, 1))
        if dy == -1: shifted[-1,:] = False
        if dy == 1:  shifted[0,:] = False
        if dx == -1: shifted[:,-1] = False
        if dx == 1:  shifted[:,0] = False
        expand = shifted & (mark == 0) & (avg > 175) & (avg < 235)
        mark[expand] = 3

    return mark


# ────────────────────────────────────────────────────────────────
# LAB RECOLORING
# ────────────────────────────────────────────────────────────────
def rgb_to_lab(rgb_arr: np.ndarray) -> np.ndarray:
    """Convert RGB (0-255) array to LAB. Returns float array [L(0-100), a(-128..127), b(-128..127)]."""
    # Normalize to 0-1
    rgb = rgb_arr.astype(np.float64) / 255.0

    # sRGB -> linear RGB
    mask = rgb > 0.04045
    rgb[mask] = ((rgb[mask] + 0.055) / 1.055) ** 2.4
    rgb[~mask] = rgb[~mask] / 12.92

    # Linear RGB -> XYZ (D65)
    r, g, b = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

    # Normalize by D65 white point
    x /= 0.95047
    z /= 1.08883

    # XYZ -> LAB
    def f(t):
        mask = t > 0.008856
        result = np.zeros_like(t)
        result[mask] = np.cbrt(t[mask])
        result[~mask] = 7.787 * t[~mask] + 16/116
        return result

    fx, fy, fz = f(x), f(y), f(z)
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b_ch = 200 * (fy - fz)

    return np.stack([L, a, b_ch], axis=2)


def lab_to_rgb(lab_arr: np.ndarray) -> np.ndarray:
    """Convert LAB array back to RGB (0-255 uint8)."""
    L, a, b_ch = lab_arr[:,:,0], lab_arr[:,:,1], lab_arr[:,:,2]

    # LAB -> XYZ
    fy = (L + 16) / 116
    fx = a / 500 + fy
    fz = fy - b_ch / 200

    def f_inv(t):
        mask = t > 0.206893
        result = np.zeros_like(t)
        result[mask] = t[mask] ** 3
        result[~mask] = (t[~mask] - 16/116) / 7.787
        return result

    x = f_inv(fx) * 0.95047
    y = f_inv(fy)
    z = f_inv(fz) * 1.08883

    # XYZ -> linear RGB
    r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314
    g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560
    b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252

    # Linear -> sRGB
    r = np.clip(r, 0, 1)
    g = np.clip(g, 0, 1)
    b = np.clip(b, 0, 1)

    mask_r = r > 0.0031308
    r[mask_r] = 1.055 * (r[mask_r] ** (1/2.4)) - 0.055
    r[~mask_r] = 12.92 * r[~mask_r]

    mask_g = g > 0.0031308
    g[mask_g] = 1.055 * (g[mask_g] ** (1/2.4)) - 0.055
    g[~mask_g] = 12.92 * g[~mask_g]

    mask_b = b > 0.0031308
    b[mask_b] = 1.055 * (b[mask_b] ** (1/2.4)) - 0.055
    b[~mask_b] = 12.92 * b[~mask_b]

    rgb = np.stack([r, g, b], axis=2)
    return (np.clip(rgb, 0, 1) * 255).astype(np.uint8)


def hex_to_lab(hex_color: str) -> tuple[float, float, float]:
    """Convert hex color to LAB values."""
    r, g, b = hex_to_rgb(hex_color)
    pixel = np.array([[[r, g, b]]], dtype=np.uint8)
    lab = rgb_to_lab(pixel)
    return float(lab[0,0,0]), float(lab[0,0,1]), float(lab[0,0,2])


def recolor_lab(arr: np.ndarray, mark: np.ndarray, hex_color: str,
                holz_textur: np.ndarray | None = None) -> np.ndarray:
    """
    Recolor frame pixels using LAB color space.

    1. Convert frame pixels to LAB
    2. Keep L (luminance) — preserves 3D depth, shadows, reflections
    3. Set A/B to target color's A/B values
    4. Scale L to match target color's lightness range
    5. Optional: apply wood grain texture for Holzdekore
    """
    out = arr.copy()
    frame_mask = mark == 0

    if not frame_mask.any():
        return out

    # Target color in LAB
    target_L, target_a, target_b = hex_to_lab(hex_color)

    # Convert frame region to LAB
    frame_lab = rgb_to_lab(arr)

    # Original L channel (frame pixels only)
    orig_L = frame_lab[:,:,0].copy()

    # Normalize L: map white frame (L≈95-100) to target lightness
    # Frame pixels on white master have L values roughly 85-100
    # Scale them so the brightest frame pixel maps to target_L
    frame_L = orig_L[frame_mask]
    L_max = np.percentile(frame_L, 95) if len(frame_L) > 100 else 95.0
    L_min = np.percentile(frame_L, 5) if len(frame_L) > 100 else 60.0

    # Scale L to target range while preserving relative differences (= 3D depth)
    # Target range: from ~20% below target_L to target_L
    target_L_range = max(target_L * 0.4, 10)
    target_L_min = max(target_L - target_L_range, 0)

    if L_max > L_min:
        normalized = (orig_L - L_min) / (L_max - L_min)
        normalized = np.clip(normalized, 0, 1)
        new_L = target_L_min + normalized * (target_L - target_L_min)
    else:
        new_L = np.full_like(orig_L, target_L)

    # Apply wood grain texture if Holzdekor
    if holz_textur is not None:
        # Resize texture to match image if needed
        if holz_textur.shape[:2] != arr.shape[:2]:
            tex_img = Image.fromarray(holz_textur).resize(
                (arr.shape[1], arr.shape[0]), Image.LANCZOS
            )
            holz_textur = np.array(tex_img)

        # Multiply blend: texture modulates L channel
        tex_gray = holz_textur.mean(axis=2) / 255.0  # 0-1
        # Subtle effect: blend 70% original L + 30% texture-modulated
        tex_L = new_L * (0.7 + 0.3 * tex_gray)
        new_L = np.where(frame_mask, tex_L, new_L)

    # Assemble new LAB
    new_lab = frame_lab.copy()
    new_lab[:,:,0] = np.where(frame_mask, new_L, frame_lab[:,:,0])
    new_lab[:,:,1] = np.where(frame_mask, target_a, frame_lab[:,:,1])
    new_lab[:,:,2] = np.where(frame_mask, target_b, frame_lab[:,:,2])

    # Convert back to RGB
    new_rgb = lab_to_rgb(new_lab)

    # Only replace frame pixels
    out[frame_mask] = new_rgb[frame_mask]
    return out


# ────────────────────────────────────────────────────────────────
# HOLZDEKOR TEXTURE
# ────────────────────────────────────────────────────────────────
HOLZ_TEXTUR_DIR = Path(__file__).resolve().parent.parent / 'img' / 'holzdekor'

def load_holz_textur() -> np.ndarray | None:
    """Load wood grain texture if available."""
    textur_path = HOLZ_TEXTUR_DIR / 'maserung.png'
    if textur_path.exists():
        return np.array(Image.open(textur_path).convert('RGB'))
    return None


# ────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ────────────────────────────────────────────────────────────────
def recolor_master(master_path: Path, output_path: Path, farbe_key: str) -> bool:
    """
    Recolor a single master image to a target color.
    Returns True on success, False on skip/error.
    """
    if farbe_key in SKIP_RECOLOR:
        return False

    farbe_def = FARBEN.get(farbe_key)
    if not farbe_def:
        print(f"  SKIP: unbekannte Farbe '{farbe_key}'")
        return False

    img = Image.open(master_path).convert('RGB')
    arr = np.array(img, dtype=np.uint8)

    # Detect regions
    mark = detect_regions(arr)

    # Load wood texture for Holzdekore
    holz_tex = None
    if farbe_def['kategorie'] == KATEGORIE_HOLZ:
        holz_tex = load_holz_textur()

    # Recolor
    result = recolor_lab(arr, mark, farbe_def['hex'], holz_textur=holz_tex)

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(result, 'RGB').save(output_path, 'PNG', optimize=True)
    return True


def recolor_all(master_path: Path, output_dir: Path, prefix: str,
                skip_existing: bool = True) -> dict:
    """Recolor a master to ALL colors. Returns stats dict."""
    stats = {'created': 0, 'skipped': 0, 'errors': 0}
    farben = get_recolor_farben()

    for farbe_key in farben:
        output_path = output_dir / f'{prefix}_{farbe_key}.png'
        if skip_existing and output_path.exists():
            stats['skipped'] += 1
            continue
        try:
            if recolor_master(master_path, output_path, farbe_key):
                stats['created'] += 1
                print(f"  OK: {output_path.name}")
        except Exception as e:
            stats['errors'] += 1
            print(f"  ERR: {farbe_key} — {e}")

    return stats


def main():
    parser = argparse.ArgumentParser(description='LAB Recoloring Pipeline')
    parser.add_argument('master', type=Path, help='Master image (white, 1024x1280)')
    parser.add_argument('output', type=Path, help='Output file or directory')
    parser.add_argument('--farbe', type=str, help='Single color key (e.g. anthrazit)')
    parser.add_argument('--alle', action='store_true', help='Generate all 43 color variants')
    parser.add_argument('--prefix', type=str, help='Output filename prefix (e.g. fenster_1fl)')
    parser.add_argument('--force', action='store_true', help='Overwrite existing files')
    args = parser.parse_args()

    if not args.master.exists():
        print(f"ERROR: Master nicht gefunden: {args.master}")
        sys.exit(1)

    if args.farbe:
        output = args.output
        if output.is_dir():
            prefix = args.prefix or args.master.stem
            output = output / f'{prefix}_{args.farbe}.png'
        ok = recolor_master(args.master, output, args.farbe)
        print(f"{'OK' if ok else 'SKIP'}: {output}")

    elif args.alle:
        output_dir = args.output
        if not output_dir.is_dir():
            output_dir.mkdir(parents=True, exist_ok=True)
        prefix = args.prefix or args.master.stem
        stats = recolor_all(args.master, output_dir, prefix,
                           skip_existing=not args.force)
        print(f"\nFertig: {stats['created']} erstellt, {stats['skipped']} übersprungen, {stats['errors']} Fehler")

    else:
        parser.error("Entweder --farbe oder --alle angeben")


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Create wood texture directory**

```bash
mkdir -p "img/holzdekor"
```

Create a placeholder `img/holzdekor/README.md`:
```
# Holzdekor Texturen
Hier liegt die Maserungstextur für Holzdekor-Farben.
`maserung.png` — tileable Holzmaserung, wird als Multiply-Overlay auf den L-Kanal angewandt.
```

- [ ] **Step 3: Test with existing master image**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/recolor-lab.py img/fenster_standard_v3.png img/farben/ --farbe anthrazit --prefix fenster_1fl_lab_test --force`

Expected: Creates `img/farben/fenster_1fl_lab_test_anthrazit.png`. Open it and compare with existing `img/farben/fenster_1fl_anthrazit.png` — LAB version should have better 3D depth.

- [ ] **Step 4: Test batch mode**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/lab-test/ --alle --prefix fenster_1fl_test`

Expected: Creates 43 PNG files in `/tmp/lab-test/`. Check golden-oak for wood grain quality.

- [ ] **Step 5: Commit**

```bash
git add scripts/recolor-lab.py img/holzdekor/
git commit -m "feat: LAB recoloring engine (preserves 3D depth via L-channel)"
```

---

### Task 3: Flip Script (`scripts/flip-anschlag.py`)

**Files:**
- Create: `scripts/flip-anschlag.py`

Simple horizontal flip for Anschlag variants (DK-Rechts → mirror of DK-Links).

- [ ] **Step 1: Create flip-anschlag.py**

```python
#!/usr/bin/env python3
"""
DeineFenster.de — Anschlag-Flip
================================
Horizontaler Flip für Anschlag-Varianten:
- Fenster/Balkontür 1-Fl: DK-Rechts/Dreh-Rechts = Flip von DK-Links/Dreh-Links
- Haustür: DIN-Rechts = Flip von DIN-Links

Usage:
    python3 scripts/flip-anschlag.py img/farben/fenster_1fl_anthrazit.png img/farben/fenster_1fl_rechts_anthrazit.png
    python3 scripts/flip-anschlag.py --batch img/farben/ --pattern "fenster_1fl_" --suffix "_rechts"
"""
from __future__ import annotations
import argparse, sys, re
from pathlib import Path
from PIL import Image


def flip_horizontal(input_path: Path, output_path: Path) -> None:
    """Flip an image horizontally and save."""
    img = Image.open(input_path)
    flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    flipped.save(output_path, 'PNG', optimize=True)


def batch_flip(source_dir: Path, pattern: str, suffix: str,
               skip_existing: bool = True) -> dict:
    """
    Flip all files matching pattern in source_dir.
    Input:  fenster_1fl_anthrazit.png
    Output: fenster_1fl_rechts_anthrazit.png (suffix inserted before last _segment)
    """
    stats = {'created': 0, 'skipped': 0}

    for src in sorted(source_dir.glob(f'{pattern}*.png')):
        # Skip files that already have the suffix
        if suffix.strip('_') in src.stem:
            continue

        # Insert suffix: fenster_1fl_{farbe}.png → fenster_1fl_rechts_{farbe}.png
        parts = src.stem.rsplit('_', 1)
        if len(parts) == 2:
            new_name = f'{parts[0]}{suffix}_{parts[1]}.png'
        else:
            new_name = f'{src.stem}{suffix}.png'

        output = source_dir / new_name
        if skip_existing and output.exists():
            stats['skipped'] += 1
            continue

        flip_horizontal(src, output)
        stats['created'] += 1
        print(f"  FLIP: {src.name} → {output.name}")

    return stats


def main():
    parser = argparse.ArgumentParser(description='Anschlag-Flip (horizontal)')
    parser.add_argument('input', type=Path, nargs='?', help='Input image')
    parser.add_argument('output', type=Path, nargs='?', help='Output image')
    parser.add_argument('--batch', type=Path, help='Batch: source directory')
    parser.add_argument('--pattern', type=str, default='fenster_1fl_',
                       help='Batch: filename pattern to match')
    parser.add_argument('--suffix', type=str, default='_rechts',
                       help='Batch: suffix to insert')
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()

    if args.batch:
        stats = batch_flip(args.batch, args.pattern, args.suffix,
                          skip_existing=not args.force)
        print(f"\nFertig: {stats['created']} Flips, {stats['skipped']} übersprungen")
    elif args.input and args.output:
        flip_horizontal(args.input, args.output)
        print(f"OK: {args.output}")
    else:
        parser.error("Entweder input+output oder --batch angeben")


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Test single flip**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/flip-anschlag.py img/fenster_standard_v3.png /tmp/flip-test.png`

Expected: Creates horizontally mirrored image. Handle should be on the left side instead of right.

- [ ] **Step 3: Commit**

```bash
git add scripts/flip-anschlag.py
git commit -m "feat: Anschlag-Flip Script (horizontale Spiegelung für DK-Rechts/DIN-Rechts)"
```

---

### Task 4: Validation Script (`scripts/validate-bilder.py`)

**Files:**
- Create: `scripts/validate-bilder.py`
- Import: `scripts/farb_config.py`

Checks all images against quality requirements from the spec.

- [ ] **Step 1: Create validate-bilder.py**

```python
#!/usr/bin/env python3
"""
DeineFenster.de — Bild-Validierung
====================================
Prüft Bilder gegen die Qualitätsanforderungen aus der Design-Spec:
- Größe: 1024 × 1280 px
- Weißer Hintergrund (reines Weiß, kein Grauschleier) — nur für Master
- Produkt füllt 80-92% der Canvas-Höhe
- Farbe stimmt grob mit Referenz überein

Usage:
    python3 scripts/validate-bilder.py img/fenster_standard_v4.png
    python3 scripts/validate-bilder.py img/farben/ --alle
    python3 scripts/validate-bilder.py --masters img/
"""
from __future__ import annotations
import argparse, sys
from pathlib import Path
import numpy as np
from PIL import Image

TARGET_W = 1024
TARGET_H = 1280
CONTENT_MIN_PCT = 0.75  # Minimum 75% canvas height
CONTENT_MAX_PCT = 0.97  # Maximum 97% canvas height


def validate_dimensions(img: Image.Image) -> list[str]:
    """Check image is exactly 1024×1280."""
    errors = []
    w, h = img.size
    if w != TARGET_W or h != TARGET_H:
        errors.append(f"Größe {w}×{h} statt {TARGET_W}×{TARGET_H}")
    return errors


def validate_background(arr: np.ndarray, is_master: bool = False) -> list[str]:
    """Check corners are white (background check)."""
    errors = []
    H, W = arr.shape[:2]
    corners = [
        arr[0:20, 0:20],       # top-left
        arr[0:20, W-20:W],     # top-right
        arr[H-20:H, 0:20],     # bottom-left
        arr[H-20:H, W-20:W],   # bottom-right
    ]
    for i, corner in enumerate(corners):
        avg = corner.mean()
        if is_master and avg < 250:
            errors.append(f"Ecke {i+1}: Hintergrund nicht rein weiß (avg={avg:.0f})")
        elif avg < 200:
            errors.append(f"Ecke {i+1}: Hintergrund zu dunkel (avg={avg:.0f})")
    return errors


def validate_content_fill(arr: np.ndarray) -> list[str]:
    """Check product fills 75-97% of canvas height."""
    errors = []
    H = arr.shape[0]
    avg_per_row = arr.mean(axis=(1, 2))

    # Find first and last non-white row (content)
    content_rows = np.where(avg_per_row < 245)[0]
    if len(content_rows) < 10:
        errors.append("Kaum Inhalt erkannt — Bild möglicherweise leer")
        return errors

    content_top = content_rows[0]
    content_bottom = content_rows[-1]
    content_height = content_bottom - content_top
    fill_pct = content_height / H

    if fill_pct < CONTENT_MIN_PCT:
        errors.append(f"Produkt füllt nur {fill_pct:.0%} der Höhe (min {CONTENT_MIN_PCT:.0%})")
    elif fill_pct > CONTENT_MAX_PCT:
        errors.append(f"Produkt füllt {fill_pct:.0%} der Höhe (max {CONTENT_MAX_PCT:.0%})")

    return errors


def validate_image(path: Path, is_master: bool = False) -> list[str]:
    """Run all validations on a single image. Returns list of error strings."""
    try:
        img = Image.open(path).convert('RGB')
    except Exception as e:
        return [f"Kann nicht geöffnet werden: {e}"]

    arr = np.array(img, dtype=np.uint8)
    errors = []
    errors.extend(validate_dimensions(img))
    errors.extend(validate_background(arr, is_master=is_master))
    errors.extend(validate_content_fill(arr))
    return errors


def main():
    parser = argparse.ArgumentParser(description='Bild-Validierung')
    parser.add_argument('path', type=Path, help='Image file or directory')
    parser.add_argument('--alle', action='store_true', help='Validate all PNGs in directory')
    parser.add_argument('--masters', action='store_true', help='Validate as master images (stricter)')
    args = parser.parse_args()

    if args.path.is_file():
        errors = validate_image(args.path, is_master=args.masters)
        if errors:
            print(f"FAIL: {args.path.name}")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
        else:
            print(f"OK: {args.path.name}")

    elif args.path.is_dir():
        total = 0
        fails = 0
        for png in sorted(args.path.glob('*.png')):
            total += 1
            errors = validate_image(png, is_master=args.masters)
            if errors:
                fails += 1
                print(f"FAIL: {png.name}")
                for e in errors:
                    print(f"  - {e}")

        print(f"\n{total} geprüft, {total - fails} OK, {fails} fehlerhaft")
        if fails:
            sys.exit(1)


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Test on existing masters**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/validate-bilder.py img/fenster_standard_v3.png --masters`

Expected: Either OK or specific error messages about dimensions/background.

- [ ] **Step 3: Test on farben directory**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/validate-bilder.py img/farben/ --alle 2>&1 | tail -5`

Expected: Summary line with total/OK/fail counts.

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-bilder.py
git commit -m "feat: Bild-Validierungsskript (Größe, Hintergrund, Content-Fill)"
```

---

### Task 5: Compositing Script (`scripts/composite-seitenteil.py`)

**Files:**
- Create: `scripts/composite-seitenteil.py`

Composites a Haustür model image with a generic Seitenteil panel element.

- [ ] **Step 1: Create composite-seitenteil.py**

```python
#!/usr/bin/env python3
"""
DeineFenster.de — Haustür Seitenteil Compositing
==================================================
Combines a Haustür model master (1-Flügel) with a generic Seitenteil glass panel.

Seitenteil = fixed glass element next to the door, same frame/color.
Instead of generating 56+ separate AI masters, we composite:
  Model master + Seitenteil-L → door with left side panel
  Model master + Seitenteil-R → door with right side panel
  Model master + Seitenteil-L + Seitenteil-R → double side panels (= 2-Flügel)

Both elements are recolored FIRST, then composited.

Usage:
    python3 scripts/composite-seitenteil.py \\
        --tuer img/farben/haustuer_aussen_florida-lr-inox_anthrazit.png \\
        --seitenteil img/farben/haustuer_seitenteil_aussen_anthrazit.png \\
        --position links \\
        --output img/farben/haustuer_st-l_aussen_florida-lr-inox_anthrazit.png
"""
from __future__ import annotations
import argparse, sys
from pathlib import Path
import numpy as np
from PIL import Image

# Target canvas: 1024×1280 (same as all other products)
TARGET_W = 1024
TARGET_H = 1280


def find_content_bbox(arr: np.ndarray, threshold: int = 245) -> tuple[int, int, int, int]:
    """Find bounding box of non-white content. Returns (top, left, bottom, right)."""
    avg = arr.mean(axis=2)
    content = avg < threshold
    rows = np.any(content, axis=1)
    cols = np.any(content, axis=0)
    if not rows.any():
        return 0, 0, arr.shape[0], arr.shape[1]
    top = np.argmax(rows)
    bottom = arr.shape[0] - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = arr.shape[1] - np.argmax(cols[::-1])
    return int(top), int(left), int(bottom), int(right)


def composite(tuer_path: Path, seitenteil_path: Path,
              position: str, output_path: Path) -> None:
    """
    Composite door + side panel onto a single 1024×1280 canvas.

    Door takes ~65% of width, Seitenteil takes ~30%, 5% gap/margins.
    """
    tuer = Image.open(tuer_path).convert('RGB')
    st = Image.open(seitenteil_path).convert('RGB')

    tuer_arr = np.array(tuer)
    st_arr = np.array(st)

    # Find content bounds
    t_top, t_left, t_bot, t_right = find_content_bbox(tuer_arr)
    s_top, s_left, s_bot, s_right = find_content_bbox(st_arr)

    # Crop to content
    tuer_content = tuer.crop((t_left, t_top, t_right, t_bot))
    st_content = st.crop((s_left, s_top, s_right, s_bot))

    # Scale: door gets 62% of canvas width, seitenteil 30%, gap 8%
    door_w = int(TARGET_W * 0.62)
    st_w = int(TARGET_W * 0.30)
    gap = TARGET_W - door_w - st_w

    # Maintain aspect ratios
    door_scale = door_w / tuer_content.width
    door_h = int(tuer_content.height * door_scale)
    tuer_resized = tuer_content.resize((door_w, door_h), Image.LANCZOS)

    st_scale = st_w / st_content.width
    st_h = int(st_content.height * st_scale)
    # Seitenteil should match door height
    if st_h != door_h:
        st_h = door_h
        st_resized = st_content.resize((st_w, st_h), Image.LANCZOS)
    else:
        st_resized = st_content.resize((st_w, st_h), Image.LANCZOS)

    # Create canvas
    canvas = Image.new('RGB', (TARGET_W, TARGET_H), (255, 255, 255))

    # Vertical centering
    y_offset = (TARGET_H - door_h) // 2

    if position == 'links':
        # Seitenteil left, door right
        canvas.paste(st_resized, (gap // 2, y_offset))
        canvas.paste(tuer_resized, (gap // 2 + st_w + gap // 2, y_offset))
    elif position == 'rechts':
        # Door left, Seitenteil right
        canvas.paste(tuer_resized, (gap // 2, y_offset))
        canvas.paste(st_resized, (gap // 2 + door_w + gap // 2, y_offset))
    elif position == 'beidseitig':
        # Seitenteil left, door center, Seitenteil right
        total_w = st_w + door_w + st_w
        scale_all = min(1.0, (TARGET_W - 20) / total_w)
        door_w2 = int(door_w * scale_all)
        st_w2 = int(st_w * scale_all)
        door_h2 = int(door_h * scale_all)
        st_h2 = door_h2

        tuer_r2 = tuer_content.resize((door_w2, door_h2), Image.LANCZOS)
        st_r2 = st_content.resize((st_w2, st_h2), Image.LANCZOS)

        x_start = (TARGET_W - door_w2 - 2 * st_w2) // 2
        y_off2 = (TARGET_H - door_h2) // 2
        canvas.paste(st_r2, (x_start, y_off2))
        canvas.paste(tuer_r2, (x_start + st_w2, y_off2))
        # Flip right seitenteil for symmetry
        st_right = st_r2.transpose(Image.FLIP_LEFT_RIGHT)
        canvas.paste(st_right, (x_start + st_w2 + door_w2, y_off2))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, 'PNG', optimize=True)
    print(f"OK: {output_path.name}")


def main():
    parser = argparse.ArgumentParser(description='Haustür Seitenteil Compositing')
    parser.add_argument('--tuer', type=Path, required=True, help='Door image')
    parser.add_argument('--seitenteil', type=Path, required=True, help='Side panel image')
    parser.add_argument('--position', choices=['links', 'rechts', 'beidseitig'],
                       required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    composite(args.tuer, args.seitenteil, args.position, args.output)


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Commit** (testing deferred until Seitenteil masters exist)

```bash
git add scripts/composite-seitenteil.py
git commit -m "feat: Haustür Seitenteil Compositing (Model + Panel → kombiniert)"
```

---

### Task 6: Orchestration Script (`scripts/generate-all.sh`)

**Files:**
- Create: `scripts/generate-all.sh`

Runs the full pipeline for a given product category.

- [ ] **Step 1: Create generate-all.sh**

```bash
#!/usr/bin/env bash
# DeineFenster.de — Bild-Pipeline Orchestrierung
# ================================================
# Orchestriert: Master → Recolor → Flip → Validate
#
# Usage:
#   ./scripts/generate-all.sh fenster-1fl     # Phase 1: 1-Fl Fenster (Innen + Außen)
#   ./scripts/generate-all.sh fenster-2fl     # Phase 1: 2-Fl Fenster
#   ./scripts/generate-all.sh balkontuer      # Phase 1: Balkontür
#   ./scripts/generate-all.sh all             # Alles (nur wenn Master vorhanden)
#   ./scripts/generate-all.sh --dry-run all   # Zeigt was passieren würde

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FARBEN_DIR="$PROJECT_DIR/img/farben"
RECOLOR="$SCRIPT_DIR/recolor-lab.py"
FLIP="$SCRIPT_DIR/flip-anschlag.py"
VALIDATE="$SCRIPT_DIR/validate-bilder.py"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    shift
fi

TARGET="${1:-help}"

run_recolor() {
    local master="$1" prefix="$2"
    echo "═══ RECOLOR: $prefix ═══"
    if $DRY_RUN; then
        echo "  [DRY] python3 $RECOLOR $master $FARBEN_DIR/ --alle --prefix $prefix"
    else
        python3 "$RECOLOR" "$master" "$FARBEN_DIR/" --alle --prefix "$prefix"
    fi
}

run_flip() {
    local pattern="$1" suffix="${2:-_rechts}"
    echo "═══ FLIP: $pattern ═══"
    if $DRY_RUN; then
        echo "  [DRY] python3 $FLIP --batch $FARBEN_DIR --pattern $pattern --suffix $suffix"
    else
        python3 "$FLIP" --batch "$FARBEN_DIR" --pattern "$pattern" --suffix "$suffix"
    fi
}

run_validate() {
    local pattern="$1"
    echo "═══ VALIDATE: $pattern ═══"
    # Validate a sample (first 5 files) to catch systematic errors
    local count=0
    for f in "$FARBEN_DIR"/${pattern}*.png; do
        [ -f "$f" ] || continue
        if $DRY_RUN; then
            echo "  [DRY] python3 $VALIDATE $f"
        else
            python3 "$VALIDATE" "$f" || true
        fi
        count=$((count + 1))
        [ $count -ge 5 ] && break
    done
}

case "$TARGET" in
    fenster-1fl)
        # Innen: Standard (Griff rechts, schwarze Dichtung)
        [ -f "$PROJECT_DIR/img/fenster_standard_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/fenster_standard_v4.png" "fenster_1fl"
        # Innen: Grau-Dichtung
        [ -f "$PROJECT_DIR/img/fenster_standard_grau_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/fenster_standard_grau_v4.png" "fenster_1fl_grau"
        # Außen
        [ -f "$PROJECT_DIR/img/fenster_aussen_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/fenster_aussen_v4.png" "fenster_1fl_aussen"
        # Flips: Griff-Links (Standard + Grau)
        run_flip "fenster_1fl_" "_rechts"
        run_flip "fenster_1fl_grau_" "_rechts"
        # Validate
        run_validate "fenster_1fl_"
        ;;

    fenster-2fl)
        [ -f "$PROJECT_DIR/img/fenster_2fluegel_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/fenster_2fluegel_v4.png" "fenster_2fl"
        [ -f "$PROJECT_DIR/img/fenster_2fluegel_aussen_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/fenster_2fluegel_aussen_v4.png" "fenster_2fl_aussen"
        run_validate "fenster_2fl_"
        ;;

    balkontuer)
        [ -f "$PROJECT_DIR/img/balkontuer_standard_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/balkontuer_standard_v4.png" "balkontuer_1fl"
        [ -f "$PROJECT_DIR/img/balkontuer_aussen_v4.png" ] && \
            run_recolor "$PROJECT_DIR/img/balkontuer_aussen_v4.png" "balkontuer_1fl_aussen"
        run_flip "balkontuer_1fl_" "_rechts"
        run_validate "balkontuer_1fl_"
        ;;

    haustuer)
        # 14 models × Innen + Außen
        for model_img in "$PROJECT_DIR"/img/haustuer_modell_*_innen_v4.png; do
            [ -f "$model_img" ] || continue
            model=$(basename "$model_img" | sed 's/haustuer_modell_//;s/_innen_v4.png//')
            run_recolor "$model_img" "haustuer_innen_${model}"
        done
        for model_img in "$PROJECT_DIR"/img/haustuer_modell_*_aussen_v4.png; do
            [ -f "$model_img" ] || continue
            model=$(basename "$model_img" | sed 's/haustuer_modell_//;s/_aussen_v4.png//')
            run_recolor "$model_img" "haustuer_aussen_${model}"
        done
        run_validate "haustuer_"
        ;;

    all)
        echo "=== FULL PIPELINE ==="
        for t in fenster-1fl fenster-2fl balkontuer haustuer; do
            "$0" "$t" || echo "WARN: $t hatte Fehler"
        done
        ;;

    help|*)
        echo "Usage: $0 [--dry-run] <target>"
        echo "Targets: fenster-1fl, fenster-2fl, balkontuer, haustuer, all"
        ;;
esac

echo ""
echo "═══ FERTIG ═══"
```

- [ ] **Step 2: Make executable and test dry-run**

```bash
chmod +x scripts/generate-all.sh
./scripts/generate-all.sh --dry-run fenster-1fl
```

Expected: Prints what commands WOULD be run without actually executing them.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-all.sh
git commit -m "feat: Pipeline-Orchestrierung (generate-all.sh)"
```

---

### Task 7: Konfigurator Code — PROD_IMGS_VIEW v4 Update

**Files:**
- Modify: `konfigurator.html:5111-5161` (PROD_IMGS_VIEW)

Update master image paths from v3 to v4 for products where v4 masters exist.
Add missing entries: balkontuer 2-fl, rolladen-aware paths.

- [ ] **Step 1: Add rolladen-aware PROD_IMGS_VIEW structure**

After `PROD_IMGS_VIEW` (line ~5161), add a new map for rolladen variants:

```javascript
// Rolladen-Varianten: gleiche Keys wie PROD_IMGS_VIEW, aber mit Rolladen-Kasten
const PROD_IMGS_ROLLADEN = {
  kunststoff: {
    innen: {
      '1-fluegel':   'img/fenster_standard_rolladen_v4.png',
      '2-fluegel':   'img/fenster_2fluegel_rolladen_v4.png',
      '3-fluegel':   'img/fenster_3fluegel_rolladen_v4.png',
      '4-fluegel':   'img/fenster_4fluegel_rolladen_v4.png',
      '1-oberlicht': 'img/fenster_oberlicht_rolladen_v4.png',
      '2-oberlicht': 'img/fenster_2fluegel_oberlicht_rolladen_v4.png',
      '3-oberlicht': 'img/fenster_3fluegel_oberlicht_rolladen_v4.png',
      '1-unterlicht': 'img/fenster_unterlicht_rolladen_v4.png',
      '2-unterlicht': 'img/fenster_2fluegel_unterlicht_rolladen_v4.png',
      '3-unterlicht': 'img/fenster_3fluegel_unterlicht_rolladen_v4.png',
      '1-ober-unter': 'img/fenster_ober_unter_rolladen_v4.png',
      '2-ober-unter': 'img/fenster_2fluegel_ober_unter_rolladen_v4.png',
      '3-ober-unter': 'img/fenster_3fluegel_ober_unter_rolladen_v4.png',
    },
    aussen: {
      // Same structure with _aussen_ in filenames
      '1-fluegel':   'img/fenster_aussen_rolladen_v4.png',
      '2-fluegel':   'img/fenster_2fluegel_aussen_rolladen_v4.png',
      '3-fluegel':   'img/fenster_3fluegel_aussen_rolladen_v4.png',
      '4-fluegel':   'img/fenster_4fluegel_aussen_rolladen_v4.png',
      '1-oberlicht': 'img/fenster_oberlicht_aussen_rolladen_v4.png',
      '2-oberlicht': 'img/fenster_2fluegel_oberlicht_aussen_rolladen_v4.png',
      '3-oberlicht': 'img/fenster_3fluegel_oberlicht_aussen_rolladen_v4.png',
      '1-unterlicht': 'img/fenster_unterlicht_aussen_rolladen_v4.png',
      '2-unterlicht': 'img/fenster_2fluegel_unterlicht_aussen_rolladen_v4.png',
      '3-unterlicht': 'img/fenster_3fluegel_unterlicht_aussen_rolladen_v4.png',
      '1-ober-unter': 'img/fenster_ober_unter_aussen_rolladen_v4.png',
      '2-ober-unter': 'img/fenster_2fluegel_ober_unter_aussen_rolladen_v4.png',
      '3-ober-unter': 'img/fenster_3fluegel_ober_unter_aussen_rolladen_v4.png',
    },
  },
  balkontuer: {
    innen:  { '1-fluegel': 'img/balkontuer_standard_rolladen_v4.png', '2-fluegel': 'img/balkontuer_2fl_rolladen_v4.png' },
    aussen: { '1-fluegel': 'img/balkontuer_aussen_rolladen_v4.png', '2-fluegel': 'img/balkontuer_2fl_aussen_rolladen_v4.png' },
  },
  hst: {
    innen:  { '1-fluegel': 'img/hst_hs_innen_rolladen_v4.png' },
    aussen: { '1-fluegel': 'img/hst_hs_aussen_rolladen_v4.png' },
  },
};
```

- [ ] **Step 2: Add balkontuer 2-fl to PROD_IMGS_VIEW**

In `PROD_IMGS_VIEW.balkontuer` (line ~5144), add 2-fluegel entries:

```javascript
balkontuer: {
    innen:  { '1-fluegel': 'img/balkontuer_standard_v3.png', '2-fluegel': 'img/balkontuer_2fl_v4.png' },
    aussen: { '1-fluegel': 'img/balkontuer_aussen_v3.png', '2-fluegel': 'img/balkontuer_2fl_aussen_v4.png' },
},
```

- [ ] **Step 3: Update getMasterImage to support rolladen**

Modify `getMasterImage()` (line ~5166) to accept rolladen parameter:

```javascript
function getMasterImage(prod, ansicht, fluegelKey, rolladen) {
  // If rolladen active and rolladen map exists, try rolladen version first
  if (rolladen && PROD_IMGS_ROLLADEN[prod]) {
    const rollMap = PROD_IMGS_ROLLADEN[prod][ansicht];
    if (rollMap && rollMap[fluegelKey]) {
      return rollMap[fluegelKey];
    }
  }
  const prodMap = PROD_IMGS_VIEW[prod];
  if (!prodMap) return null;
  const viewMap = prodMap[ansicht] || prodMap.innen;
  return viewMap[fluegelKey]
      || viewMap['1-fluegel']
      || prodMap.innen['1-fluegel'];
}
```

- [ ] **Step 4: Wire rolladen into vorschauAktualisieren()**

In `vorschauAktualisieren()` (line ~5984), pass rolladen state to getMasterImage:

```javascript
// 2) Master-Bild für Produkt × Ansicht × Flügel-Key (inkl. '-oberlicht' Varianten)
const hasRolladen = S.roll && S.roll !== 'ohne';
let masterSrc = getMasterImage(S.prod, ansicht, flKey, hasRolladen);
```

- [ ] **Step 5: Test in browser** — open konfigurator, toggle Rolladen on/off, check preview changes (will show fallback until v4 masters exist)

- [ ] **Step 6: Commit**

```bash
git add konfigurator.html
git commit -m "feat: PROD_IMGS_ROLLADEN + Balkontür 2-Fl + Rolladen-aware Vorschau"
```

---

### Task 8: Konfigurator Code — CSS-Flip for Haustür DIN-Richtung

**Files:**
- Modify: `konfigurator.html` (vorschauAktualisieren)

Instead of generating ~1,260 flipped Haustür files, use CSS `transform: scaleX(-1)` at runtime.

- [ ] **Step 1: Add CSS flip logic for Haustür**

In `vorschauAktualisieren()`, after the Haustür Modell block (line ~5982), add DIN flip:

```javascript
// Haustür DIN-Richtung: DIN-Rechts = horizontaler Flip von DIN-Links (CSS)
// Spart ~1.260 Bilddateien. Flip ist korrekt weil DIN-Wechsel die gesamte Tür spiegelt.
if (S.prod === 'haustuere') {
  const dinRechts = S.oeff1 === 'dreh-r';
  img.style.transform = dinRechts ? 'scaleX(-1)' : 'none';
}
```

- [ ] **Step 2: Reset transform for non-Haustür products**

At the top of `vorschauAktualisieren()`, after `const img = ...`:

```javascript
// Reset CSS flip from previous Haustür selection
if (S.prod !== 'haustuere') {
  img.style.transform = 'none';
}
```

- [ ] **Step 3: Test in browser** — select Haustür, switch between DIN-Links and DIN-Rechts, verify flip works

- [ ] **Step 4: Commit**

```bash
git add konfigurator.html
git commit -m "feat: CSS-Flip für Haustür DIN-Rechts (spart ~1.260 Bilddateien)"
```

---

### Task 9: v3 → v4 Migration Path

**Files:**
- Modify: `konfigurator.html:5111-5161` (PROD_IMGS_VIEW)

When v4 masters are generated, update paths. This task defines the exact changes needed per phase.

- [ ] **Step 1: Create migration checklist** in `docs/superpowers/plans/v4-migration-checklist.md`

```markdown
# v3 → v4 Master Migration Checklist

When a new v4 master is generated and processed through the pipeline:

## Per-Master Checklist
1. Generate AI master (Higgsfield or Google Flow)
2. Run through process-master-image.py: `python3 scripts/process-master-image.py input.png img/<name>_v4.png`
3. Validate: `python3 scripts/validate-bilder.py img/<name>_v4.png --masters`
4. Generate color variants: `python3 scripts/recolor-lab.py img/<name>_v4.png img/farben/ --alle --prefix <prefix>`
5. Generate flips if needed: `python3 scripts/flip-anschlag.py --batch img/farben/ --pattern <prefix>`
6. Update PROD_IMGS_VIEW in konfigurator.html: change v3 → v4 path
7. Test in browser: all views, all colors, flip toggle
8. Commit

## Phase 1 Paths to Update (when v4 ready)
| Current v3 | New v4 | Farben prefix |
|-----------|--------|---------------|
| `img/fenster_standard_v3.png` | `img/fenster_standard_v4.png` | `fenster_1fl` |
| `img/fenster_aussen_v3.png` | `img/fenster_aussen_v4.png` | `fenster_1fl_aussen` |
| `img/fenster_2fluegel_v3.png` | `img/fenster_2fluegel_v4.png` | `fenster_2fl` |
| `img/fenster_2fluegel_aussen_v3.png` | `img/fenster_2fluegel_aussen_v4.png` | `fenster_2fl_aussen` |
| `img/balkontuer_standard_v3.png` | `img/balkontuer_standard_v4.png` | `balkontuer_1fl` |
| `img/balkontuer_aussen_v3.png` | `img/balkontuer_aussen_v4.png` | `balkontuer_1fl_aussen` |
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/v4-migration-checklist.md
git commit -m "docs: v3→v4 Migration Checklist für Master-Bilder"
```

---

### Task 10: Holzdekor Texture Creation

**Files:**
- Create: `img/holzdekor/maserung.png`
- Modify: `scripts/recolor-lab.py` (texture loading already built in Task 2)

The wood grain texture is needed for realistic Holzdekor colors (Golden Oak, Winchester, etc.).

- [ ] **Step 1: Generate wood grain texture**

Use Higgsfield (via browser, NOT MCP — credit rules!) to generate a tileable wood grain texture:

Prompt: `Seamless tileable wood grain texture, natural oak wood, high resolution, subtle grain pattern, even lighting, no shadows, suitable for overlay blending`

Process to 1024×1280 and save as `img/holzdekor/maserung.png`.

Alternatively, extract a wood grain region from an existing Drutex product image.

- [ ] **Step 2: Test Holzdekor recoloring**

Run: `cd "/Users/buissnesaccount/deinefenster Website" && python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/holz-test/ --farbe golden-oak --prefix test`

Expected: `/tmp/holz-test/test_golden-oak.png` should show visible wood grain texture, not just flat brown.

- [ ] **Step 3: Compare with existing golden-oak**

Open both side by side:
- Existing: `img/farben/fenster_1fl_golden-oak.png` (AI-generated, gold standard)
- New: `/tmp/holz-test/test_golden-oak.png` (LAB + texture)

The LAB version should be closer in quality to the AI version than the old Pillow approach was.

- [ ] **Step 4: Commit**

```bash
git add img/holzdekor/
git commit -m "feat: Holzdekor Maserungstextur für LAB Pipeline"
```

---

### Task 11: Integration Test — Full Phase 1 Dry Run

**Files:**
- No new files. Tests the pipeline end-to-end.

- [ ] **Step 1: Run dry-run for Phase 1**

```bash
cd "/Users/buissnesaccount/deinefenster Website"
./scripts/generate-all.sh --dry-run fenster-1fl
./scripts/generate-all.sh --dry-run fenster-2fl
./scripts/generate-all.sh --dry-run balkontuer
```

Expected: All commands print correctly, no errors.

- [ ] **Step 2: Run real pipeline on existing v3 masters (as test)**

```bash
# Test with existing v3 master to verify LAB quality
python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/phase1-test/ --alle --prefix fenster_1fl_labtest
```

Expected: 43 color variants in `/tmp/phase1-test/`. Spot-check:
- `fenster_1fl_labtest_anthrazit.png` — dark gray with visible 3D depth
- `fenster_1fl_labtest_golden-oak.png` — warm brown with wood grain (if texture exists)
- `fenster_1fl_labtest_cremeweiss.png` — very slight cream tint

- [ ] **Step 3: Run validation on test output**

```bash
python3 scripts/validate-bilder.py /tmp/phase1-test/ --alle
```

Expected: All pass (1024×1280, proper fill, corners white on non-dark colors).

- [ ] **Step 4: Open test images in browser alongside existing ones**

Compare LAB output with existing Pillow/AI images in `img/farben/`. The LAB versions should preserve more 3D depth and look more consistent across different colors.

---

## Phase 2-5 Notes

Phases 2-5 follow the same pattern as Phase 1:
1. Generate AI master (Higgsfield browser UI)
2. Run through `process-master-image.py`
3. Run through `recolor-lab.py --alle`
4. Run through `flip-anschlag.py --batch` (where applicable)
5. Run through `validate-bilder.py`
6. Update `PROD_IMGS_VIEW` / `PROD_IMGS_ROLLADEN` paths
7. Test in browser
8. Commit

The pipeline scripts from Tasks 1-6 handle all phases. Only the AI master generation and path updates differ per phase.

### Phase 2 specifics
- Fenster 3-Fl, 4-Fl, Oberlicht/Unterlicht/Ober-Unter masters
- Kipp + Fest masters
- No new pipeline code needed

### Phase 3 specifics
- 14 Haustür model masters (Innen + Außen each)
- Seitenteil element masters (2)
- Run `composite-seitenteil.py` for each model × position
- Haustür Innen update in `vorschauAktualisieren()` to use model-specific images

### Phase 4 specifics
- HST system-specific masters (HS, PSK, Slide × Innen/Außen)
- All Rolladen variants
- Update `PROD_IMGS_ROLLADEN` paths

### Phase 5 specifics
- Balkontür 2-Fl
- Grau-Dichtung variants
- Full quality audit across all ~5,000+ images
