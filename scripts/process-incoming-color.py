#!/usr/bin/env python3
"""
Verarbeitet heruntergeladene Farb-Bilder aus img/farben/incoming/
und speichert sie korrekt als haustuer_aussen_{modell}_{farbe}.png

Aufruf:
  python3 scripts/process-incoming-color.py              # alle Dateien in incoming/
  python3 scripts/process-incoming-color.py alaska-1     # nur für dieses Modell
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np

SCRIPT_DIR  = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
INCOMING    = PROJECT_DIR / 'img' / 'farben' / 'incoming'
OUT_DIR     = PROJECT_DIR / 'img' / 'farben'

# Alle gültigen Farb-Keys
FARB_KEYS = [
    'cremeweiss','weiss-fx','crown-plat','lichtgrau','sheffield','eiche-hell',
    'eiche-nat','betongrau','quarzgr-sa','quarzgr-gl','basaltgr-sa','basaltgr-gl',
    'schiefgr-sa','schiefgr-gl','eisengl','anthrazit','anthraz-gl','anthraz-um',
    'schwarz-um','golden-oak','winchester','oregon','douglasie','nussbaum',
    'mooreiche','dunkleiche','schwarzbr','macore','mahagoni','schoko-br',
    'moosgruen','dunkelgr','dunkelrot','brillblau','stahlblau','piryt',
    'jet-black','deep-bronze','grafitgr',
]

TARGET_W = 1024
TARGET_H = 1280
CONTENT_PCT = 0.92  # Tür nimmt 92% der Höhe ein


def standardize(img: Image.Image) -> Image.Image:
    """Weißer Hintergrund, 1024×1280, Tür zentriert mit 92% Inhaltshöhe."""
    img = img.convert('RGBA')

    # Weißen Hintergrund erstellen
    bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    img = bg.convert('RGB')

    # Auto-Crop: entferne weißen Rand
    gray = ImageOps.grayscale(img)
    arr  = np.array(gray)
    mask = arr < 245
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if rows.any():
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        img = img.crop((cmin, rmin, cmax + 1, rmax + 1))

    # Auf Zielgröße skalieren (Inhalt = 92% Höhe)
    content_h = int(TARGET_H * CONTENT_PCT)
    iw, ih    = img.size
    scale     = min(content_h / ih, TARGET_W * 0.95 / iw)
    new_w     = int(iw * scale)
    new_h     = int(ih * scale)
    img       = img.resize((new_w, new_h), Image.LANCZOS)

    # Auf Canvas zentrieren
    canvas = Image.new('RGB', (TARGET_W, TARGET_H), (255, 255, 255))
    x = (TARGET_W - new_w) // 2
    y = (TARGET_H - new_h) // 2
    canvas.paste(img, (x, y))
    return canvas


def main() -> None:
    model_filter = sys.argv[1] if len(sys.argv) > 1 else None

    files = sorted(INCOMING.glob('*.png')) + sorted(INCOMING.glob('*.jpg')) + sorted(INCOMING.glob('*.jpeg')) + sorted(INCOMING.glob('*.webp'))

    if not files:
        print(f"Keine Dateien in {INCOMING}")
        print("Lege die heruntergeladenen Bilder dort ab (z.B. cremeweiss.png)")
        return

    print(f"\n📂 {len(files)} Dateien gefunden in incoming/\n")

    for f in files:
        stem = f.stem.lower().replace('_', '-')

        # Farb-Key erkennen aus Dateiname
        color_key = None
        for k in FARB_KEYS:
            if k in stem or stem == k:
                color_key = k
                break

        if not color_key:
            print(f"  ⚠ Unbekannter Farb-Key: {f.name} — übersprungen")
            print(f"    Gültige Keys: {', '.join(FARB_KEYS[:5])} ...")
            continue

        # Modell bestimmen
        if model_filter:
            model = model_filter
        else:
            # Aus Dateiname lesen wenn Format: alaska-1_cremeweiss.png
            parts = stem.split('_')
            model = parts[0] if len(parts) > 1 and parts[0] != color_key else None
            if not model:
                print(f"  ? Welches Modell für {f.name}? (z.B. alaska-1): ", end='')
                model = input().strip() or 'alaska-1'

        out_path = OUT_DIR / f'haustuer_aussen_{model}_{color_key}.png'

        try:
            img = Image.open(f)
            result = standardize(img)
            result.save(out_path, 'PNG', optimize=True)
            print(f"  ✓ {color_key:<16} → {out_path.name}")

            # Originaldatei in processed/ verschieben
            processed = INCOMING / 'processed'
            processed.mkdir(exist_ok=True)
            f.rename(processed / f.name)

        except Exception as e:
            print(f"  ✗ {f.name}: {e}")

    print(f"\n✅ Fertig. Bilder in: img/farben/")
    print(f"   Verarbeitete Originale in: img/farben/incoming/processed/")


if __name__ == '__main__':
    main()
