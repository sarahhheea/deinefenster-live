#!/usr/bin/env python3
"""
Drop-Shadow-Entferner v2 (Sarah-Wunsch 29.04.2026 abends).

Methode: Bounding-Box-basiert.
- Finde Pixel die SICHER zum Fenster gehören (Helligkeit < 200, also klar
  Rahmen-Innenkante oder dunkle Linien — heller als das ist Schatten oder
  Glas-Reflexion).
- BBox darüber spannen.
- Alles AUSSERHALB der BBox auf reines Weiß setzen.
- Fenster-Inhalt selbst bleibt 100% unverändert.

Vor jedem Schreiben wird ein Backup angelegt.
"""
from PIL import Image
import numpy as np
import os, glob, shutil, datetime

IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "img"))
BACKUP_ROOT = os.path.join(IMG_DIR, "masters", "sarah")
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP_DIR = os.path.join(BACKUP_ROOT, f"shadow_removal_v2_backup_{TS}")
os.makedirs(BACKUP_DIR, exist_ok=True)

# Schwelle: alles unterhalb davon (in min(R,G,B)) zählt als „klar Fenster"
# 200 = dunkler als Drop-Shadow (199-220) aber heller als Rahmen-Schatten (~140-187)
FENSTER_SCHWELLE = 200


def schatten_weg(path):
    """Setzt alles außerhalb der Fenster-BBox auf reines Weiß."""
    im = Image.open(path).convert("RGB")
    arr = np.array(im)

    helligkeit = arr.min(axis=2)
    fenster_mask = helligkeit < FENSTER_SCHWELLE

    ys, xs = np.where(fenster_mask)
    if len(ys) == 0:
        # Kein dunkles Pixel gefunden — Bild komplett hell, zurückgeben wie es ist
        return im, None

    y_min, y_max = ys.min(), ys.max()
    x_min, x_max = xs.min(), xs.max()

    out_arr = arr.copy()
    out_arr[:y_min, :] = 255
    out_arr[y_max + 1:, :] = 255
    out_arr[:, :x_min] = 255
    out_arr[:, x_max + 1:] = 255

    return Image.fromarray(out_arr), (x_min, y_min, x_max, y_max)


def main():
    pattern_files = []
    for pattern in ["fenster_*.png", "balkontuer_*.png", "haustuer_*.png", "hst_*.png"]:
        pattern_files += glob.glob(os.path.join(IMG_DIR, pattern))

    skip_keywords = ["_OLD_", "_master_", "_PLATZHALTER_", "_uncropped_",
                     "backup", "standart", "_TEST_"]
    files = sorted(set(
        f for f in pattern_files
        if not any(k in os.path.basename(f) for k in skip_keywords)
    ))

    print(f"Drop-Shadow-Entfernung läuft auf {len(files)} Bilder")
    print(f"Backup: {BACKUP_DIR}\n")

    for i, path in enumerate(files, 1):
        name = os.path.basename(path)
        # Backup
        shutil.copy(path, os.path.join(BACKUP_DIR, name))
        # Schatten weg
        im_out, bbox = schatten_weg(path)
        im_out.save(path, "PNG", optimize=True)
        if bbox:
            print(f"  [{i:2d}/{len(files)}] ✔ {name:<48} BBox: {bbox}")
        else:
            print(f"  [{i:2d}/{len(files)}] – {name:<48} (kein dunkles Pixel)")

    print(f"\n→ {len(files)} Bilder verarbeitet")


if __name__ == "__main__":
    main()
