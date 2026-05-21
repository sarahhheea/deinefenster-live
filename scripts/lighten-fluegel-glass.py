"""Hellt die Glasflächen der Flügel-/Anschlag-Karten auf — passend zum 3D-Modell.

Wichtig: ERSETZT die Glasfläche komplett mit einem glatten Gradient.
NICHT per-Pixel-Blend mit dem rauschenden Original — sonst bleibt das Korn als
helle Punkte sichtbar.

Workflow:
  1) Maske aller blauen Glas-Pixel (nahe Navy + klarer Blaustich)
  2) Maske morphologisch glätten (Löcher schließen, Inseln entfernen)
  3) Glatten vertikalen Gradient + sanften Diagonal-Reflex berechnen
  4) Glas-Bereich VOLLSTÄNDIG durch Gradient ersetzen, mit 2 px weicher Edge
"""
from PIL import Image
import numpy as np
import sys, os, glob

# Original-Glas ist navy (~#2A3B4D)
SRC_RGB = np.array([42, 59, 77], dtype=np.float32)

# Zielton — abgestimmt auf 3D-Modell-Glas (#3a5267 mit EnvMap-Reflexionen)
DST_TOP    = np.array([180, 200, 218], dtype=np.float32)  # leicht hellerer oberer Bereich
DST_BOTTOM = np.array([138, 165, 190], dtype=np.float32)  # ruhiger unterer Bereich

# Toleranz für Glas-Erkennung
TOL = 30


def _binary_close(mask: np.ndarray, k: int = 5) -> np.ndarray:
    """Dilate + erode: schließt kleine Löcher in der Glas-Maske (Sprosse, Rauschen)."""
    try:
        from scipy.ndimage import binary_dilation, binary_erosion
        struct = np.ones((k, k), dtype=bool)
        m = binary_dilation(mask, structure=struct)
        m = binary_erosion(m, structure=struct)
        return m
    except Exception:
        return mask


def _fill_internal_holes(mask: np.ndarray) -> np.ndarray:
    """Schließt nur Innen-Löcher (Dreck-Punkte in der Glasfläche), expandiert NICHT nach außen."""
    try:
        from scipy.ndimage import binary_fill_holes
        return binary_fill_holes(mask)
    except Exception:
        return mask


def _keep_large_components(mask: np.ndarray, min_area_ratio: float = 0.005) -> np.ndarray:
    """Behalte nur Komponenten die > min_area_ratio (z.B. 0.5%) der Gesamtfläche sind.
    Killt Pixel-Inseln im Rahmen, behält die echten Glasflächen (auch mehrere Scheiben)."""
    try:
        from scipy.ndimage import label
        labeled, n = label(mask)
        if n == 0:
            return mask
        total = mask.shape[0] * mask.shape[1]
        threshold = max(50, int(total * min_area_ratio))
        sizes = np.bincount(labeled.ravel())
        sizes[0] = 0  # background
        keep_ids = np.where(sizes >= threshold)[0]
        if len(keep_ids) == 0:
            return mask
        out = np.isin(labeled, keep_ids)
        return out
    except Exception:
        return mask


def _expand_to_bbox_per_component(mask: np.ndarray, pad: int = 4) -> np.ndarray:
    """Für jede zusammenhängende Komponente: erweitere zur Bounding-Box (+pad).
    Damit ist auch die Silikondichtung/Glasleiste am Rahmenrand mit drin —
    sie wird mit dem Gradient überschrieben statt als dunkler Streifen sichtbar."""
    try:
        from scipy.ndimage import label, find_objects
        labeled, n = label(mask)
        if n == 0:
            return mask
        out = np.zeros_like(mask, dtype=bool)
        slices = find_objects(labeled)
        h, w = mask.shape
        for sl in slices:
            if sl is None:
                continue
            y0 = max(0, sl[0].start - pad)
            y1 = min(h, sl[0].stop + pad)
            x0 = max(0, sl[1].start - pad)
            x1 = min(w, sl[1].stop + pad)
            out[y0:y1, x0:x1] = True
        return out
    except Exception:
        return mask


def _open_mask(mask: np.ndarray, k: int = 3) -> np.ndarray:
    """Erode + dilate: entfernt vereinzelte Pixel-Inseln am Rahmen."""
    try:
        from scipy.ndimage import binary_dilation, binary_erosion
        struct = np.ones((k, k), dtype=bool)
        m = binary_erosion(mask, structure=struct)
        m = binary_dilation(m, structure=struct)
        return m
    except Exception:
        return mask


def _erode(mask: np.ndarray, k: int = 3) -> np.ndarray:
    """Nur erodieren — schrumpft Maske nach innen, schützt Rahmen-Kante."""
    try:
        from scipy.ndimage import binary_erosion
        struct = np.ones((k, k), dtype=bool)
        return binary_erosion(mask, structure=struct)
    except Exception:
        return mask


def _soft_alpha(mask: np.ndarray, blur_px: int = 2) -> np.ndarray:
    """Weicher Edge-Übergang für sauberen Rand zur Rahmenkante."""
    try:
        from scipy.ndimage import uniform_filter
        return uniform_filter(mask.astype(np.float32), size=blur_px * 2 + 1)
    except Exception:
        return mask.astype(np.float32)


def lighten(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = arr[..., :3]
    a   = arr[..., 3:4]
    h, w, _ = arr.shape
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # 1) Glas-Pixel detektieren — KLAR-Blau (auch dunkle Flecken im Glas zählen,
    #    weil sie immer noch einen Blau-Stich haben). Rahmen ist neutral → fällt raus.
    blue_glass = (B > R + 5) & (B > G + 2) & ((R + G + B) > 60)

    if not blue_glass.any():
        return img

    # 2) Maske bereinigen:
    #    a) Open k=3 → Pixel-Inseln im Rahmen raus
    #    b) Keep large components → nur echte Glasflächen behalten (auch mehrere Scheiben)
    #    c) Fill holes → nur Innen-Löcher (Dreck) füllen, KEINE Expansion nach außen
    #    d) Erode k=5 → Maske nach innen schrumpfen, schützt Rahmenkante
    mask = _open_mask(blue_glass, k=3)
    mask = _keep_large_components(mask, min_area_ratio=0.01)
    # Bounding-Box jeder Glas-Komponente (deckt Silikondichtung am Rand mit ab)
    mask = _expand_to_bbox_per_component(mask, pad=2)
    # Wichtig: nach Bbox-Expansion erodieren, damit die Rahmen-Kante NICHT übermalt wird
    mask = _erode(mask, k=4)
    if not mask.any():
        return img

    # 3) Glatter Glas-Gradient (vertikal Top→Bottom)
    y_norm = (np.arange(h, dtype=np.float32) / max(1, h - 1))[:, None]
    target = (1.0 - y_norm)[:, :, None] * DST_TOP[None, None, :] \
           + y_norm[:, :, None]        * DST_BOTTOM[None, None, :]
    target = np.broadcast_to(target, rgb.shape).copy()

    # Sanfter Diagonal-Reflex (sehr dezent, damit es nicht künstlich wirkt)
    xs = np.arange(w, dtype=np.float32) / max(1, w - 1)
    ys = np.arange(h, dtype=np.float32) / max(1, h - 1)
    X, Y = np.meshgrid(xs, ys)
    band = np.clip(1.0 - np.abs((X + Y) - 0.6) * 3.5, 0.0, 1.0) * 0.12
    target = target + band[..., None] * (255.0 - target)

    # 4) Vollständig ersetzen mit weicher Kante (4 px) — glättet Rand-Streifen
    alpha = _soft_alpha(mask, blur_px=4)[..., None]  # 0..1
    rgb_new = rgb * (1.0 - alpha) + target * alpha

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
