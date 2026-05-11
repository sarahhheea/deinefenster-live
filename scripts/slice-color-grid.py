#!/usr/bin/env python3
"""
Schneidet ein Batch-Bild (mehrere Türen nebeneinander) in einzelne Türbilder.

Aufruf:
  python3 scripts/slice-color-grid.py batch1.png alaska-1
  python3 scripts/slice-color-grid.py batch2.png alaska-1
  ... usw.

Legt die Dateien ab in: img/farben/haustuer_aussen_{modell}_{farbe}.png
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np

PROJECT_DIR = Path(__file__).resolve().parent.parent
INCOMING    = PROJECT_DIR / 'img' / 'farben' / 'incoming'
OUT_DIR     = PROJECT_DIR / 'img' / 'farben'

TARGET_W = 1024
TARGET_H = 1280

# Farbreihenfolge pro Batch — MUSS mit farben-batch-prompts.txt übereinstimmen
BATCHES: dict[str, list[str]] = {
    'batch1': ['cremeweiss','weiss-fx','crown-plat','lichtgrau','sheffield','eiche-hell','betongrau','quarzgr-sa'],
    'batch2': ['quarzgr-gl','basaltgr-sa','basaltgr-gl','schiefgr-sa','schiefgr-gl','eisengl','anthrazit','anthraz-gl'],
    'batch3': ['anthraz-um','schwarz-um','grafitgr','jet-black','piryt','deep-bronze','eiche-nat'],
    'batch4': ['golden-oak','winchester','oregon','douglasie','nussbaum','mooreiche','dunkleiche','schwarzbr'],
    'batch5': ['macore','mahagoni','schoko-br','moosgruen','dunkelgr','dunkelrot','brillblau','stahlblau'],
}


def autocrop_white(img: Image.Image) -> Image.Image:
    """Entfernt weißen Rand."""
    arr  = np.array(img.convert('L'))
    mask = arr < 245
    if not mask.any():
        return img
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    return img.crop((cmin, rmin, cmax + 1, rmax + 1))


def standardize(img: Image.Image) -> Image.Image:
    """1024×1280, weiß, Tür zentriert."""
    img = img.convert('RGB')
    img = autocrop_white(img)

    content_h = int(TARGET_H * 0.92)
    iw, ih    = img.size
    scale     = min(content_h / ih, TARGET_W * 0.95 / iw)
    img       = img.resize((int(iw * scale), int(ih * scale)), Image.LANCZOS)

    canvas = Image.new('RGB', (TARGET_W, TARGET_H), (255, 255, 255))
    x = (TARGET_W - img.width)  // 2
    y = (TARGET_H - img.height) // 2
    canvas.paste(img, (x, y))
    return canvas


def find_door_columns(arr: np.ndarray, n: int) -> list[tuple[int, int]]:
    """
    Findet automatisch die n Türspalten anhand vertikaler Helligkeitsprofile.
    Sucht n Bereiche wo nicht-weißer Inhalt ist.
    """
    gray = arr.mean(axis=2) if arr.ndim == 3 else arr
    col_dark = (gray < 245).any(axis=0)   # True wo Inhalt ist

    # Runs von True-Bereichen finden
    in_door = False
    segments = []
    start = 0
    for i, v in enumerate(col_dark):
        if v and not in_door:
            start = i
            in_door = True
        elif not v and in_door:
            segments.append((start, i))
            in_door = False
    if in_door:
        segments.append((start, len(col_dark)))

    if len(segments) == 0:
        # Fallback: gleichmäßig aufteilen
        W = arr.shape[1]
        w = W // n
        return [(i * w, (i + 1) * w) for i in range(n)]

    # Segmente auf n reduzieren (merge kleine Lücken)
    if len(segments) >= n:
        # Wähle die n größten
        segments = sorted(segments, key=lambda s: s[1] - s[0], reverse=True)[:n]
        segments = sorted(segments, key=lambda s: s[0])
    else:
        # Zu wenige Segmente — gleichmäßig aufteilen
        W = arr.shape[1]
        w = W // n
        segments = [(i * w, (i + 1) * w) for i in range(n)]

    return segments


def slice_batch(img_path: Path, model: str, color_keys: list[str]) -> None:
    n = len(color_keys)
    img  = Image.open(img_path).convert('RGB')
    arr  = np.array(img)
    H, W = arr.shape[:2]

    print(f"\n  Bild: {img_path.name}  ({W}×{H}px)  →  {n} Türen")

    cols = find_door_columns(arr, n)
    print(f"  Spalten erkannt: {cols}")

    for i, (x0, x1) in enumerate(cols):
        key = color_keys[i]
        # Etwas Puffer
        pad = max(0, (x1 - x0) // 20)
        crop = img.crop((max(0, x0 - pad), 0, min(W, x1 + pad), H))
        result = standardize(crop)
        out = OUT_DIR / f'haustuer_aussen_{model}_{key}.png'
        result.save(out, 'PNG', optimize=True)
        print(f"  ✓ [{i+1}/{n}] {key:<16} → {out.name}")


def main() -> None:
    if len(sys.argv) < 3:
        print("Aufruf: python3 scripts/slice-color-grid.py <batch1.png> <modell>")
        print("        python3 scripts/slice-color-grid.py alle alaska-1")
        print(f"\nBatches: {', '.join(BATCHES.keys())}")
        sys.exit(1)

    filename = sys.argv[1]
    model    = sys.argv[2]

    if filename == 'alle':
        # Alle Batches verarbeiten
        for batch_name, color_keys in BATCHES.items():
            p = INCOMING / f'{batch_name}.png'
            if not p.exists():
                p = INCOMING / f'{batch_name}.jpg'
            if not p.exists():
                print(f"  ⚠ {batch_name}.png nicht gefunden — übersprungen")
                continue
            slice_batch(p, model, color_keys)
    else:
        # Einzelnen Batch
        stem = Path(filename).stem
        p = INCOMING / filename
        if not p.exists():
            p = INCOMING / f'{filename}.png'
        if not p.exists():
            print(f"Datei nicht gefunden: {filename}")
            sys.exit(1)

        color_keys = BATCHES.get(stem)
        if not color_keys:
            print(f"Unbekannter Batch: {stem}")
            print(f"Bekannte Batches: {', '.join(BATCHES.keys())}")
            sys.exit(1)

        slice_batch(p, model, color_keys)

    print(f"\n✅ Fertig! Bilder in: img/farben/")


if __name__ == '__main__':
    main()
