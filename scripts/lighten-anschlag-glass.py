"""Anschlag-Karten: Glas heller (wie fluegel-karten), Einzeichnungen dunkler.

Workflow:
  1) Weiße Linien (Pfeile, Symbole) per Helligkeits-Filter erkennen → später dunkel überzeichnen
  2) Blaue Glasfläche per Bounding-Box-Maske erkennen → mit hellem Gradient ersetzen
  3) Erkannte weiße Linien überzeichnen mit Dunkelblau #0d2a52
"""
from PIL import Image
import numpy as np
import sys, os, glob

DST_TOP    = np.array([180, 200, 218], dtype=np.float32)
DST_BOTTOM = np.array([138, 165, 190], dtype=np.float32)
LINE_DARK  = np.array([12, 28, 62],   dtype=np.float32)   # #0c1c3e — dunkles Drutex-Blau

TOL = 30


def _open_mask(mask, k=3):
    try:
        from scipy.ndimage import binary_dilation, binary_erosion
        s = np.ones((k, k), dtype=bool)
        m = binary_erosion(mask, structure=s)
        return binary_dilation(m, structure=s)
    except Exception:
        return mask


def _erode(mask, k=3):
    try:
        from scipy.ndimage import binary_erosion
        return binary_erosion(mask, structure=np.ones((k, k), dtype=bool))
    except Exception:
        return mask


def _dilate(mask, k=3):
    try:
        from scipy.ndimage import binary_dilation
        return binary_dilation(mask, structure=np.ones((k, k), dtype=bool))
    except Exception:
        return mask


def _keep_large_components(mask, min_area_ratio=0.01):
    try:
        from scipy.ndimage import label
        labeled, n = label(mask)
        if n == 0:
            return mask
        total = mask.shape[0] * mask.shape[1]
        threshold = max(50, int(total * min_area_ratio))
        sizes = np.bincount(labeled.ravel()); sizes[0] = 0
        keep_ids = np.where(sizes >= threshold)[0]
        if len(keep_ids) == 0:
            return mask
        return np.isin(labeled, keep_ids)
    except Exception:
        return mask


def _expand_to_bbox_per_component(mask, pad=2):
    try:
        from scipy.ndimage import label, find_objects
        labeled, n = label(mask)
        if n == 0:
            return mask
        out = np.zeros_like(mask, dtype=bool)
        slices = find_objects(labeled)
        h, w = mask.shape
        for sl in slices:
            if sl is None: continue
            y0 = max(0, sl[0].start - pad); y1 = min(h, sl[0].stop + pad)
            x0 = max(0, sl[1].start - pad); x1 = min(w, sl[1].stop + pad)
            out[y0:y1, x0:x1] = True
        return out
    except Exception:
        return mask


def _soft_alpha(mask, blur_px=2):
    try:
        from scipy.ndimage import uniform_filter
        return uniform_filter(mask.astype(np.float32), size=blur_px * 2 + 1)
    except Exception:
        return mask.astype(np.float32)


def process(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = arr[..., :3]
    a   = arr[..., 3:4]
    h, w, _ = arr.shape
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # 1) Weiße Linien (Einzeichnungen): sehr hell, neutral (alle 3 Kanäle ähnlich)
    bright = (R + G + B) > 600
    neutral = (np.abs(R - G) < 12) & (np.abs(G - B) < 12)
    line_mask_raw = bright & neutral

    # Linien sind dünn — Open mit kleinem Kernel würde sie weg-erodieren, deshalb skip.
    # Aber: nur Linien INNERHALB des Glasbereichs zählen (nicht externe Highlights am Griff o.ä.)

    # 2) Glas-Pixel (blau-dominant)
    blue_glass = (B > R + 5) & (B > G + 2) & ((R + G + B) > 60)
    if not blue_glass.any():
        return img

    glass_mask = _open_mask(blue_glass, k=3)
    glass_mask = _keep_large_components(glass_mask, min_area_ratio=0.01)
    glass_bbox = _expand_to_bbox_per_component(glass_mask, pad=2)
    glass_mask_inner = _erode(glass_bbox, k=4)

    # Linien sind INSIDE-glass nur dort wo wir auch die Glasfläche umfärben
    line_mask = line_mask_raw & glass_bbox
    # Linien leicht verdicken damit sie nach Recolor klar sichtbar sind
    line_mask = _dilate(line_mask, k=2)

    # 3) Glatter Glas-Gradient
    y_norm = (np.arange(h, dtype=np.float32) / max(1, h - 1))[:, None]
    target = (1.0 - y_norm)[:, :, None] * DST_TOP[None, None, :] \
           + y_norm[:, :, None]        * DST_BOTTOM[None, None, :]
    target = np.broadcast_to(target, rgb.shape).copy()
    xs = np.arange(w, dtype=np.float32) / max(1, w - 1)
    ys = np.arange(h, dtype=np.float32) / max(1, h - 1)
    X, Y = np.meshgrid(xs, ys)
    band = np.clip(1.0 - np.abs((X + Y) - 0.6) * 3.5, 0.0, 1.0) * 0.12
    target = target + band[..., None] * (255.0 - target)

    # 4) Glas-Bereich ersetzen (weiche Edge)
    alpha = _soft_alpha(glass_mask_inner, blur_px=4)[..., None]
    rgb_new = rgb * (1.0 - alpha) + target * alpha

    # 5) Linien überzeichnen — dunkelblau auf hellem Glas
    line_alpha = line_mask.astype(np.float32)[..., None]
    rgb_new = rgb_new * (1.0 - line_alpha) + LINE_DARK[None, None, :] * line_alpha

    out = np.concatenate([np.clip(rgb_new, 0, 255), a], axis=2).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dirs = [
        os.path.join(root, "img", "anschlag-karten"),
        os.path.join(root, "img", "anschlag-karten-2f"),
        os.path.join(root, "img", "anschlag-karten-3f"),
        os.path.join(root, "img", "anschlag-karten-1ol"),
    ]
    files = sys.argv[1:]
    if not files:
        for d in dirs:
            files.extend(sorted(glob.glob(os.path.join(d, "*.png"))))
    files = [f for f in files if "_backup" not in f]
    print(f"Verarbeite {len(files)} Bilder")
    for fp in files:
        try:
            img = Image.open(fp)
            new = process(img)
            new.save(fp, optimize=True)
            print(f"  OK  {os.path.relpath(fp, root)}")
        except Exception as e:
            print(f"  ERR {os.path.basename(fp)}: {e}")


if __name__ == "__main__":
    main()
