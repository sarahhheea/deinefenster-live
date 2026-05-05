#!/usr/bin/env python3
"""
Master-Bilder Cleanup (Sarah-Wunsch 29.04.2026 abends).

Was es macht:
- Aggressiver Crop schneidet weichen Drop-Shadow weg (Threshold 30 statt 8).
- Pro Konfig-Paar (Innen + Außen) gleiche Ziel-Canvas-Größe.
- Fenster zentriert mit gleichem prozentualen Padding.
- Bild-Inhalt selbst (Fenster) bleibt unverändert — nur Whitespace und Schatten weg.

Ergebnis: Im Konfigurator wirkt Innen↔Außen exakt identisch in Größe und
Positionierung; Übergänge zwischen verschiedenen Flügel-Konfigs sind sauber.
"""
from PIL import Image, ImageChops, ImageDraw
import os, sys

IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "img")
IMG_DIR = os.path.abspath(IMG_DIR)

# Padding-Anteil rund ums Fenster auf der Ziel-Canvas (5% Rand)
PADDING_PCT = 0.05

# Konfig-Paare: (innen, außen) — werden aufeinander abgestimmt
PAARE = [
    # 1-Flügel-Familie
    ("fenster_standard.png",                     "fenster_aussen.png"),
    ("fenster_standard_links.png",               "fenster_aussen.png"),  # gleiche Außen
    # 2-Flügel
    ("fenster_2fluegel.png",                     "fenster_2fluegel_aussen.png"),
    # 3-Flügel
    ("fenster_3fluegel.png",                     "fenster_3fluegel_aussen.png"),
    # 1-Fl + Oberlicht
    ("fenster_oberlicht.png",                    "fenster_oberlicht_aussen.png"),
    # 2-Fl + Oberlicht
    ("fenster_2fluegel_oberlicht.png",           "fenster_2fluegel_oberlicht_aussen.png"),
    # 3-Fl + Oberlicht
    ("fenster_3fluegel_oberlicht.png",           "fenster_3fluegel_oberlicht_aussen.png"),
    # 1-Fl + Unterlicht
    ("fenster_unterlicht.png",                   "fenster_unterlicht_aussen.png"),
    # 2-Fl + Unterlicht
    ("fenster_2fluegel_unterlicht.png",          "fenster_2fluegel_unterlicht_aussen.png"),
    # 3-Fl + Unterlicht
    ("fenster_3fluegel_unterlicht.png",          "fenster_3fluegel_unterlicht_aussen.png"),
    # 1-Fl + Ober/Unter
    ("fenster_ober_unter.png",                   "fenster_ober_unter_aussen.png"),
    # 2-Fl + Ober/Unter
    ("fenster_2fluegel_ober_unter.png",          "fenster_2fluegel_ober_unter_aussen.png"),
    # 3-Fl + Ober/Unter
    ("fenster_3fluegel_ober_unter.png",          "fenster_3fluegel_ober_unter_aussen.png"),
    # Festverglasung (innen=außen, schon identisch)
    ("fenster_fest.png",                         "fenster_fest_aussen.png"),
    # Kipp (Kellerfenster)
    ("fenster_kipp.png",                         "fenster_kipp_aussen.png"),
    # Balkontür
    ("balkontuer_standard.png",                  "balkontuer_aussen.png"),
    # Haustür
    ("haustuer_standard.png",                    "haustuer_aussen.png"),
    # Hebeschiebetür
    ("hst_standard.png",                         "hst_aussen.png"),
]


def schatten_crop_bbox(im, threshold=30):
    """Findet die BBox des Fensters OHNE den weichen Drop-Shadow.
    threshold=30 ignoriert sehr helle Pixel (Schatten ~5-15 Differenz zu weiß)."""
    rgb = im.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg)
    # Nur Pixel die deutlich vom Weiß abweichen zählen als Inhalt
    diff = diff.point(lambda v: 255 if v > threshold else 0)
    return diff.getbbox()


def lade_und_croppe(path):
    """Lädt Bild und gibt das geschnittene Fenster (ohne Schatten) zurück."""
    im = Image.open(path).convert("RGB")
    bbox = schatten_crop_bbox(im, threshold=30)
    if not bbox:
        # Fallback: tolerantester Crop
        bbox = schatten_crop_bbox(im, threshold=8)
    if bbox:
        im = im.crop(bbox)
    return im


def cleanup_paar(innen_name, aussen_name, padding_pct=PADDING_PCT):
    """Bringt ein Innen/Außen-Paar auf gleiche Canvas-Größe + Footprint."""
    innen_path = os.path.join(IMG_DIR, innen_name)
    aussen_path = os.path.join(IMG_DIR, aussen_name)

    if not os.path.exists(innen_path):
        print(f"  ! {innen_name} fehlt — überspringe Paar")
        return False
    if not os.path.exists(aussen_path):
        print(f"  ! {aussen_name} fehlt — überspringe Paar")
        return False

    # Beide Bilder laden + Schatten-Crop (Fenster-Inhalt bleibt UNVERÄNDERT,
    # nur weiße Ränder + weicher Schatten werden geschnitten)
    innen = lade_und_croppe(innen_path)
    aussen = lade_und_croppe(aussen_path)

    iw, ih = innen.size
    aw, ah = aussen.size

    # Für ein Paar: nimm die GRÖSSERE Höhe + Breite als Referenz für die
    # gemeinsame Canvas. Dadurch werden beide Fenster gleich groß angezeigt.
    # Wir paddem das kleinere Bild mit weißem Hintergrund.
    target_w = max(iw, aw)
    target_h = max(ih, ah)

    # Plus Padding rundherum
    canvas_w = int(target_w * (1 + 2 * padding_pct))
    canvas_h = int(target_h * (1 + 2 * padding_pct))

    def auf_canvas(im):
        canvas = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
        x = (canvas_w - im.size[0]) // 2
        y = (canvas_h - im.size[1]) // 2
        canvas.paste(im, (x, y))
        return canvas

    innen_neu = auf_canvas(innen)
    aussen_neu = auf_canvas(aussen)

    innen_neu.save(innen_path, "PNG", optimize=True)
    aussen_neu.save(aussen_path, "PNG", optimize=True)

    print(f"  ✔ {innen_name:<48} {iw}x{ih} → {canvas_w}x{canvas_h}")
    print(f"  ✔ {aussen_name:<48} {aw}x{ah} → {canvas_w}x{canvas_h}")
    return True


def main():
    print(f"Cleanup-Pipeline läuft auf: {IMG_DIR}")
    print(f"Konfig-Paare: {len(PAARE)}\n")

    erfolg = 0
    bereits_verarbeitet = set()

    for innen, aussen in PAARE:
        # Wenn das gleiche Außen-Bild für mehrere Innen-Paare verwendet wird
        # (z.B. fenster_aussen.png für links+rechts), nur einmal verarbeiten
        # aber jedes Innen separat.
        key = (innen, aussen)
        if key in bereits_verarbeitet:
            continue
        bereits_verarbeitet.add(key)

        # Wenn Außen schon mit anderem Innen verarbeitet wurde, nur Innen anpassen
        aussen_already = any(
            (i != innen and a == aussen) for i, a in bereits_verarbeitet if (i, a) != key
        )
        if aussen_already:
            # Innen separat auf Größe der bereits-fertigen Außen bringen
            innen_path = os.path.join(IMG_DIR, innen)
            aussen_path = os.path.join(IMG_DIR, aussen)
            if os.path.exists(innen_path) and os.path.exists(aussen_path):
                aussen_im = Image.open(aussen_path)
                cw, ch = aussen_im.size
                innen_im = lade_und_croppe(innen_path)
                canvas = Image.new("RGB", (cw, ch), (255, 255, 255))
                x = (cw - innen_im.size[0]) // 2
                y = (ch - innen_im.size[1]) // 2
                canvas.paste(innen_im, (x, y))
                canvas.save(innen_path, "PNG", optimize=True)
                print(f"  ✔ {innen:<48} → {cw}x{ch} (matched zu Außen)")
                erfolg += 1
            continue

        if cleanup_paar(innen, aussen):
            erfolg += 1

    print(f"\n→ {erfolg}/{len(PAARE)} Paare verarbeitet")


if __name__ == "__main__":
    main()
