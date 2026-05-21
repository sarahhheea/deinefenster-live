"""Hellt die Glasflächen der Flügel-/Anschlag-Karten auf, damit sie zum 3D-Modell passen.
Entdeckt die dunkle Navy-Glasfarbe (~#2A3B4D) und lift sie auf ein hellblaues Reflektions-Tone.
"""
from PIL import Image
import numpy as np
import sys, os, glob

# Quelle: in den Karten ist das Glas dominant um (42, 59, 77) = #2A3B4D.
SRC_RGB = np.array([42, 59, 77], dtype=np.float32)
# Ziel: hellblau-reflektiv, abgestimmt auf 3D-glassMat (#3a5267 + EnvMap-Reflexionen)
# Kein zu helles Türkis, kein Cyan — ruhiger Glas-Look mit leichter Reflexion.
DST_TOP    = np.array([175, 196, 215], dtype=np.float32)  # heller Top-Reflex
DST_BOTTOM = np.array([122, 150, 178], dtype=np.float32)  # ruhiger Bottom-Ton

# Toleranz, wie weit ein Pixel von SRC sein darf, damit es als "Glas" zählt.
TOL = 26

def lighten(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = arr[..., :3]
    a   = arr[..., 3:4]
    h, w, _ = arr.shape
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # 1) Maske: Pixel nahe Navy-Glas UND klarer Blau-Stich (sonst Rahmen erwischt)
    diff = rgb - SRC_RGB[None, None, :]
    dist = np.sqrt((diff * diff).sum(axis=2))
    blue_dominant = (B > R + 8) & (B > G + 4)   # Glas hat blauen Stich
    bright_enough = (R + G + B) > 100           # nicht der fast-schwarze Rahmen
    mask = (dist < TOL) & blue_dominant & bright_enough

    if not mask.any():
        return img

    # 2) Ziel-Bild: vertikaler Gradient von Top→Bottom
    y_norm = (np.arange(h, dtype=np.float32) / max(1, h - 1))[:, None]  # 0..1
    target = (1.0 - y_norm)[:, :, None] * DST_TOP[None, None, :] \
           + y_norm[:, :, None]        * DST_BOTTOM[None, None, :]
    target = np.broadcast_to(target, rgb.shape).copy()

    # 3) Feiner Diagonal-Reflex (leichte Aufhellung quer übers Glas) — wie echtes Glas
    xs = np.arange(w, dtype=np.float32) / max(1, w - 1)
    ys = np.arange(h, dtype=np.float32) / max(1, h - 1)
    X, Y = np.meshgrid(xs, ys)
    band = np.clip(1.0 - np.abs((X + Y) - 0.55) * 4.0, 0.0, 1.0) * 0.18
    target = target + band[..., None] * (255.0 - target)

    # 4) Harter Blend nur auf Glas-Maske, dünne Soft-Edge (3px) damit Rahmen NICHT mit aufgehellt wird
    base = mask.astype(np.float32)
    # 3px Soft-Edge via Box-Blur Approximation
    from scipy.ndimage import uniform_filter
    try:
        soft = uniform_filter(base, size=3)
    except Exception:
        soft = base
    blend = soft[..., None]  # (h,w,1)

    rgb_new = rgb * (1.0 - blend) + target * blend
    out = np.concatenate([np.clip(rgb_new, 0, 255), a], axis=2).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_dir = os.path.join(root, "img", "fluegel-karten")
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(src_dir, "*.png")))
    files = [f for f in files if "_backup" not in f]
    print(f"Verarbeite {len(files)} Bilder")
    for fp in files:
        try:
            img = Image.open(fp)
            new = lighten(img)
            new.save(fp, optimize=True)
            print(f"  OK  {os.path.basename(fp)}")
        except Exception as e:
            print(f"  ERR {os.path.basename(fp)}: {e}")

if __name__ == "__main__":
    main()
