"""
Konfigurator-Karten in-place sauber trimmen:
  - composite gegen weißen Hintergrund (kein Alpha mehr → kein durchscheinender Karten-BG)
  - strenger BBox-Crop (alpha > 80) → nur die sichtbare Fenster-Form, kein transparentes Padding
  - in-place überschreiben (PNG bleibt, jetzt opaque + minimal)

Betrifft:
  img/anschlag-karten/*.png
  img/anschlag-karten-2f/*.png
  img/anschlag-karten-3f/*.png
  img/anschlag-karten-1ol/*.png
  img/fluegel-karten/*.png
  img/haustuer-karten/*.png
"""
from PIL import Image
from pathlib import Path
import sys

FOLDERS = [
    "img/anschlag-karten",
    "img/anschlag-karten-2f",
    "img/anschlag-karten-3f",
    "img/anschlag-karten-1ol",
    "img/fluegel-karten",
    "img/haustuer-karten",
]

def trim(src):
    img = Image.open(src)
    if img.mode != "RGBA":
        return f"{src}  SKIP (no alpha)"
    alpha = img.split()[3]
    # strenge BBox: ignoriert halbtransparente Anti-Aliasing-Pixel
    hard = alpha.point(lambda a: 255 if a > 80 else 0)
    bbox = hard.getbbox()
    if not bbox:
        return f"{src}  SKIP (empty)"
    cropped = img.crop(bbox)
    canvas = Image.new("RGB", cropped.size, "white")
    canvas.paste(cropped, (0, 0), mask=cropped.split()[3])
    canvas.save(src, optimize=True)
    return f"{src}  -> {cropped.size}"

if __name__ == "__main__":
    files = []
    for f in FOLDERS:
        files.extend(sorted(Path(f).glob("*.png")))
    for f in files:
        print(trim(f))
