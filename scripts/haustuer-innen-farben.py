#!/usr/bin/env python3
"""
DeineFenster.de — Haustür Innenansicht: alle Farb-Varianten
=============================================================
Nimmt img/haustuer_iglo_energy_montana_innen_weiss.png als Master,
erkennt PVC-Rahmenpixel automatisch und färbt sie in alle 41 Konfigurator-Farben.
Glas, Scharniere, Klinke bleiben unverändert.

Output: img/farben/haustuer_innen_<key>.png (41 Dateien)

Drehrichtung (DIN links/rechts) wird im Browser per CSS scaleX(-1) gehandhabt —
kein extra Bild nötig.

Ausführen: python3 scripts/haustuer-innen-farben.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image

# ── Pfade ──────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
IMG_DIR     = PROJECT_DIR / 'img'
OUT_DIR     = IMG_DIR / 'farben'
OUT_DIR.mkdir(parents=True, exist_ok=True)

MASTER = IMG_DIR / 'haustuer_iglo_energy_montana_innen_weiss.png'

# ── Farb-Map (exakt die farbeKey-Werte aus konfigurator.html) ──────
# Nur die Farben für die wir CDN-Außenframes haben — gleiche Keys!
FARBEN: dict[str, str] = {
    'cremeweiss':  '#fdf6e3',
    'weiss-fx':    '#f4f4f0',
    'crown-plat':  '#dddbd6',
    'lichtgrau':   '#c5c6be',
    'sheffield':   '#c8b89a',   # Sheffield Oak Light (Holzdekor)
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
    'deep-bronze': '#3a2818',
    'grafitgr':    '#4a4c46',
    # Sonder-Grautöne die im Konfigurator als eigene Keys laufen
    'lichtgrau':   '#c5c6be',
}

# ── Algorithmus (aus recolor-varianten.py, leicht angepasst) ───────

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def detect_regions(arr: np.ndarray) -> np.ndarray:
    """
    Klassifiziert Pixel:
      0 = PVC-Rahmen  (wird umgefärbt)
      1 = Hintergrund (bleibt weiß)
      2 = Glas        (bleibt grau/frosted)
      3 = Hardware    (Scharniere, Klinke — bleibt silber)

    Strategie: Weiße Tür auf weißem Hintergrund lässt sich nicht zuverlässig per
    Farbschwellwert + Flood-Fill trennen. Stattdessen:
    1. Hardware (Scharniere/Klinke) und Glas als Ankerpixel detektieren
    2. Bounding-Box der Tür aus Ankerpixeln ableiten (+ Margin)
    3. Alles AUSSERHALB der Bounding-Box = Hintergrund
    4. Innerhalb: Glas- und Hardware-Pixel schützen, Rest = Rahmen
    """
    H, W, _ = arr.shape
    mark = np.zeros((H, W), dtype=np.uint8)
    avg  = arr.mean(axis=2)

    r  = arr[:,:,0].astype(float)
    g  = arr[:,:,1].astype(float)
    b  = arr[:,:,2].astype(float)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat   = (max_c - min_c) / np.maximum(avg, 1)

    # 1. Hardware (Scharniere, Klinke): silber-grau, wenig Sättigung — ZUERST als Anker
    #    KRITISCH: Räumliche Beschränkung auf Türränder (Klinke links, Scharniere rechts).
    #    Ohne Beschränkung werden Türpanel-Schatten (avg 130-220, sat≈0) fälschlich als
    #    Hardware erkannt → Tür-Zentrum wird nicht umgefärbt.
    #    Links 30% = Klinken-Bereich, Rechts 30% = Scharnier-Bereich
    x_arr  = np.tile(np.arange(W), (H, 1))
    hw_zone = (x_arr < int(W * 0.30)) | (x_arr > int(W * 0.70))
    hw    = hw_zone & (avg >= 60) & (avg <= 220) & (sat < 0.12)
    mark[hw] = 3

    # 2. Glas: Flood-Fill von Bildmitte, avg < 228
    for seed in [(H//2, W//2), (int(H*0.3), W//2), (int(H*0.7), W//2),
                 (int(H*0.45), W//2), (int(H*0.55), W//2)]:
        sy, sx = seed
        if avg[sy, sx] < 228 and mark[sy, sx] == 0:
            stack = deque([(sy, sx)])
            while stack:
                y, x = stack.pop()
                if mark[y, x]: continue
                if avg[y, x] >= 228: continue
                mark[y, x] = 2
                if x > 0:   stack.append((y, x-1))
                if x < W-1: stack.append((y, x+1))
                if y > 0:   stack.append((y-1, x))
                if y < H-1: stack.append((y+1, x))

    # 3. Bounding-Box der Tür aus Hardware + Glas ableiten
    #    Scharniere und Klinke definieren die Ausdehnung der Tür zuverlässig.
    anchor_mask = (mark == 2) | (mark == 3)
    if anchor_mask.any():
        rows, cols = np.where(anchor_mask)
        y1, y2 = int(rows.min()), int(rows.max())
        x1, x2 = int(cols.min()), int(cols.max())
        # Margin: 18% der Anker-Ausdehnung dazurechnen (Rahmen ist breiter als Beschläge)
        my = max(60, int((y2 - y1) * 0.18))
        mx = max(60, int((x2 - x1) * 0.18))
        y1 = max(0, y1 - my);  y2 = min(H - 1, y2 + my)
        x1 = max(0, x1 - mx);  x2 = min(W - 1, x2 + mx)
    else:
        # Fallback: konservativer zentraler Bereich
        y1, y2 = H // 8, H * 7 // 8
        x1, x2 = W // 8, W * 7 // 8

    # 4. Hintergrund = ALLES außerhalb der Bounding-Box
    bg = np.ones((H, W), dtype=bool)
    bg[y1:y2 + 1, x1:x2 + 1] = False
    mark[bg] = 1

    # 5. Hardware-Highlights: direkte helle Nachbarpixel innerhalb der BBox schützen
    for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
        shifted = np.roll(mark == 3, (dy, dx), axis=(0,1))
        if dy == -1: shifted[-1,:] = False
        if dy ==  1: shifted[0,:] = False
        if dx == -1: shifted[:,-1] = False
        if dx ==  1: shifted[:,0] = False
        expand = shifted & (mark == 0) & (avg > 220) & (avg < 253)
        mark[expand] = 3

    return mark


def recolor(arr: np.ndarray, mark: np.ndarray, hex_color: str) -> np.ndarray:
    zr, zg, zb = hex_to_rgb(hex_color)
    out  = arr.copy()
    avg  = arr.mean(axis=2)
    mask = (mark == 0) & (avg >= 55)

    # Luminanz-Multiplikation mit Gamma 1.2 → dunkle Kanten bleiben erkennbar
    raw_lum = np.minimum(1.0, avg[mask] / 248.0)
    lum     = np.power(raw_lum, 1.2)

    out[mask, 0] = np.clip(zr * lum, 0, 255).astype(np.uint8)
    out[mask, 1] = np.clip(zg * lum, 0, 255).astype(np.uint8)
    out[mask, 2] = np.clip(zb * lum, 0, 255).astype(np.uint8)
    return out


# ── Main ───────────────────────────────────────────────────────────

def main() -> None:
    if not MASTER.exists():
        print(f"❌ Master-Bild nicht gefunden: {MASTER}")
        sys.exit(1)

    print(f"\n🚪 Haustür Innen — Farb-Varianten Generator")
    print(f"  Master : {MASTER.name}")
    print(f"  Output : {OUT_DIR}/haustuer_innen_<key>.png")
    print(f"  Farben : {len(FARBEN)}")
    print()

    img_master = Image.open(MASTER).convert('RGB')
    arr_master = np.array(img_master, dtype=np.uint8)
    mark       = detect_regions(arr_master)

    # Statistik ausgeben
    total_px = mark.size
    counts   = {k: int((mark == v).sum()) for k, v in {'BG':1,'Glas':2,'HW':3,'Rahmen':0}.items()}
    print(f"  Pixel-Aufteilung: Rahmen={counts['Rahmen']:,} ({100*counts['Rahmen']//total_px}%) | "
          f"Glas={counts['Glas']:,} | HW={counts['HW']:,} | BG={counts['BG']:,}")
    print()

    done = skipped = errors = 0

    for key, hex_color in FARBEN.items():
        out_path = OUT_DIR / f'haustuer_innen_{key}.png'
        if out_path.exists():
            skipped += 1
            continue
        try:
            recolored = recolor(arr_master, mark, hex_color)
            Image.fromarray(recolored, 'RGB').save(out_path, 'PNG', optimize=True)
            done += 1
            print(f"  ✓ {key:<16} {hex_color}  →  haustuer_innen_{key}.png")
        except Exception as e:
            errors += 1
            print(f"  ✗ {key:<16} ERROR: {e}")

    print(f"\n{'─'*60}")
    print(f"✅ {done} neue Bilder  |  ⏭  {skipped} übersprungen  |  ❌ {errors} Fehler")
    print(f"📁 {OUT_DIR}\n")

    if done > 0:
        print("Nächster Schritt: Konfigurator nutzt jetzt diese Bilder automatisch.")
        print("Drehrichtung (DIN links/rechts) wird im Browser per CSS scaleX(-1) gehandhabt.")


if __name__ == '__main__':
    main()
