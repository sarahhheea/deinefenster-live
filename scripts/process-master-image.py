#!/usr/bin/env python3
"""
Master-Bild-Pipeline (Sarah-Regel 30.04.2026):
JEDES neu generierte Imagen-/Flow-Bild durchläuft diese Pipeline beim Ablegen.

Garantiert:
- Auto-Crop weiße Ränder (Connected Components → echte Produkt-BBox)
- Skalierung auf gemeinsame Inhaltshöhe (92% des Canvas)
- Padding auf gemeinsame Ziel-Canvas 1024×1280 (4:5)
- Reinweißer Hintergrund (#FFFFFF)
- Alle Master-Bilder wirken gleich groß im Konfigurator

Nutzung:
    python3 scripts/process-master-image.py <input.jpeg> <output.png>

Oder direkt importieren:
    from process_master_image import process_image
    process_image(src, dest)
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import sys

# === GLOBALE KONSTANTEN (NICHT ändern ohne Sarah-Freigabe) ===
TARGET_W = 1024            # 4:5 portrait — gemeinsamer Canvas für ALLE Produktbilder
TARGET_H = 1280
TARGET_INHALT_H = 1240     # Sarah-Update 30.04.2026 v4: 1240 px = 97% von 1280, sehr wenig Whitespace oben/unten
TARGET_INHALT_W_MAX = 1020 # max. Breite (knapp unter 1024) — fast volle Canvas-Breite
INHALT_THRESHOLD = 235     # Pixel unter dieser Helligkeit zählen als Inhalt
CROP_PADDING_PCT = 0.02    # 2% Pad rund um den Inhalt vor Skalierung


def process_image(src, dest, target_w=TARGET_W, target_h=TARGET_H,
                  target_inhalt_h=TARGET_INHALT_H):
    """
    Verarbeitet ein Master-Bild für Konfigurator-Konsistenz.

    Args:
        src: Pfad zum Original (JPEG/PNG mit weißem HG)
        dest: Pfad wo das verarbeitete PNG hin soll
    """
    im = Image.open(src).convert("RGB")
    arr = np.array(im)

    # 1) Connected Components: finde größte zusammenhängende Pixel-Insel = das Produkt
    helligkeit = arr.min(axis=2)
    mask = helligkeit < INHALT_THRESHOLD
    labels, n = ndimage.label(mask)
    if n == 0:
        print(f"WARNUNG: Kein Inhalt in {src} gefunden!")
        return None

    sizes = ndimage.sum(mask, labels, range(1, n + 1))
    biggest = int(np.argmax(sizes)) + 1
    produkt_mask = (labels == biggest)

    # 2) BBox des Produkts + kleines Padding
    ys, xs = np.where(produkt_mask)
    y_min, y_max = int(ys.min()), int(ys.max())
    x_min, x_max = int(xs.min()), int(xs.max())
    pad = int(max(x_max - x_min, y_max - y_min) * CROP_PADDING_PCT)
    x_min = max(0, x_min - pad)
    x_max = min(im.size[0], x_max + pad)
    y_min = max(0, y_min - pad)
    y_max = min(im.size[1], y_max + pad)

    im_cropped = im.crop((x_min, y_min, x_max, y_max))

    # 3) Aktive Skalierung: Inhalt-Höhe = EXAKT target_inhalt_h px (für ALLE gleich)
    # → so wirken Fenster, Balkontür, Haustür, HST visuell gleich hoch im Konfigurator
    cw, ch = im_cropped.size
    scale = target_inhalt_h / ch
    new_w = int(cw * scale)
    new_h = target_inhalt_h

    # Notfall-Limit: falls Bild dadurch breiter als Canvas wird, anhand Breite zurückskalieren
    if new_w > TARGET_INHALT_W_MAX:
        scale = TARGET_INHALT_W_MAX / cw
        new_w = TARGET_INHALT_W_MAX
        new_h = int(ch * scale)
        print(f"  ! Bild zu breit für volle Höhe — auf {new_w}×{new_h} reduziert")

    im_scaled = im_cropped.resize((new_w, new_h), Image.LANCZOS)

    # 4) Padding auf Ziel-Canvas, weißer Hintergrund, mittig zentriert
    canvas = Image.new("RGB", (target_w, target_h), (255, 255, 255))
    x = (target_w - new_w) // 2
    y = (target_h - new_h) // 2
    canvas.paste(im_scaled, (x, y))

    canvas.save(dest, "PNG", optimize=True)
    print(f"OK: {dest} — Canvas {canvas.size}, Inhalt {im_scaled.size} "
          f"({new_w/target_w*100:.0f}%×{new_h/target_h*100:.0f}%)")
    return canvas


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Nutzung: python3 process-master-image.py <input> <output>")
        sys.exit(1)
    process_image(sys.argv[1], sys.argv[2])
