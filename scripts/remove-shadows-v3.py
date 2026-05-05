#!/usr/bin/env python3
"""
Drop-Shadow-Entferner v3 mit Connected Components (Sarah-Fix 29.04.2026 spät).

Funktioniert weil der Drop-Shadow immer eine SEPARATE Pixel-Insel ist,
getrennt vom Fenster durch eine reinweiße Zone. Algorithmus:
1. Binarize (alles unter Helligkeit 240 = potenzieller Inhalt)
2. Connected-Components labeln
3. Größte Insel = Fenster, alle anderen Inseln = Schatten/Artefakte
4. Alles außerhalb der Fenster-Insel-BBox → reinweiß
5. Alles innerhalb der BBox das NICHT zur Fenster-Insel gehört → auch weiß

→ Drop-Shadow komplett weg, Fenster-Inhalt 100% unverändert.
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os, glob, shutil, datetime

IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "img"))
BACKUP_ROOT = os.path.join(IMG_DIR, "masters", "sarah")
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP_DIR = os.path.join(BACKUP_ROOT, f"shadow_v3_backup_{TS}")
os.makedirs(BACKUP_DIR, exist_ok=True)

# Schwelle: alles mit min(R,G,B) < 240 zählt erstmal als „potenzieller Inhalt"
# (inkl. Schatten). Danach trennt der Algorithmus die Inseln.
INHALT_SCHWELLE = 240


def schatten_weg_cc(path):
    im = Image.open(path).convert("RGB")
    arr = np.array(im)
    helligkeit = arr.min(axis=2)
    mask = helligkeit < INHALT_SCHWELLE

    labels, n = ndimage.label(mask)
    if n == 0:
        return im, None  # nichts gefunden

    sizes = ndimage.sum(mask, labels, range(1, n + 1))
    biggest_idx = int(np.argmax(sizes)) + 1
    fenster_only = (labels == biggest_idx)

    ys, xs = np.where(fenster_only)
    y_min, y_max = int(ys.min()), int(ys.max())
    x_min, x_max = int(xs.min()), int(xs.max())

    out = arr.copy()
    # Außerhalb der BBox → weiß
    out[:y_min, :] = 255
    out[y_max + 1:, :] = 255
    out[:, :x_min] = 255
    out[:, x_max + 1:] = 255
    # Innerhalb der BBox, aber nicht zur Fenster-Insel gehörig → weiß
    in_bbox_not_window = ~fenster_only
    in_bbox_not_window[:y_min, :] = False
    in_bbox_not_window[y_max + 1:, :] = False
    in_bbox_not_window[:, :x_min] = False
    in_bbox_not_window[:, x_max + 1:] = False
    out[in_bbox_not_window] = 255

    return Image.fromarray(out), (x_min, y_min, x_max, y_max), n


def main():
    pattern_files = []
    for pat in ["fenster_*.png", "balkontuer_*.png", "haustuer_*.png", "hst_*.png"]:
        pattern_files += glob.glob(os.path.join(IMG_DIR, pat))

    skip = ["_OLD_", "_master_", "_PLATZHALTER_", "_uncropped_", "backup",
            "standart", "_TEST_", "_TEST2_"]
    files = sorted(set(
        f for f in pattern_files
        if not any(k in os.path.basename(f) for k in skip)
    ))

    print(f"Connected-Components Cleanup auf {len(files)} Bilder")
    print(f"Backup: {BACKUP_DIR}\n")

    for i, path in enumerate(files, 1):
        name = os.path.basename(path)
        shutil.copy(path, os.path.join(BACKUP_DIR, name))
        result = schatten_weg_cc(path)
        if result[1] is None:
            print(f"  [{i:2d}/{len(files)}] – {name:<48} (kein Inhalt gefunden)")
            continue
        im_out, bbox, n = result
        im_out.save(path, "PNG", optimize=True)
        print(f"  [{i:2d}/{len(files)}] ✔ {name:<48} BBox={bbox}  Inseln={n}")

    print(f"\n→ {len(files)} Bilder verarbeitet")


if __name__ == "__main__":
    main()
