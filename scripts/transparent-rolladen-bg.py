"""Macht den blauen Hintergrund der Rolladen-Bilder transparent.

Strategie: Flood-fill von den 4 Bildrändern nach innen mit Toleranz.
Alle Pixel die zur Outer-Region gehören (blauer Hintergrund) werden Alpha=0.
"""
from PIL import Image
import numpy as np
from scipy.ndimage import binary_dilation
import sys, os


def remove_background(in_path: str, out_path: str, tolerance: int = 50):
    img = Image.open(in_path).convert('RGBA')
    arr = np.array(img)
    H, W = arr.shape[:2]
    rgb = arr[..., :3].astype(np.int16)

    # Sample background color from 4 corners
    corners = np.concatenate([
        rgb[:30, :30].reshape(-1, 3),
        rgb[:30, -30:].reshape(-1, 3),
        rgb[-30:, :30].reshape(-1, 3),
        rgb[-30:, -30:].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    print(f'  bg color: ({int(bg[0])}, {int(bg[1])}, {int(bg[2])})')

    # Pixels matching background (within tolerance)
    diff = np.abs(rgb - bg).max(axis=2)
    bg_mask = diff < tolerance

    # Flood-fill from edges: connected component containing the corners
    from scipy.ndimage import label
    # Mark border pixels of bg_mask, then propagate
    edge_seed = np.zeros((H, W), dtype=bool)
    edge_seed[0, :] = bg_mask[0, :]
    edge_seed[-1, :] = bg_mask[-1, :]
    edge_seed[:, 0] = bg_mask[:, 0]
    edge_seed[:, -1] = bg_mask[:, -1]
    lbl, n = label(bg_mask)
    # Keep only labels touching the edge
    edge_labels = set()
    edge_labels.update(lbl[0, :].tolist())
    edge_labels.update(lbl[-1, :].tolist())
    edge_labels.update(lbl[:, 0].tolist())
    edge_labels.update(lbl[:, -1].tolist())
    edge_labels.discard(0)
    bg_connected = np.isin(lbl, list(edge_labels))

    # Soften edges: erode 1 px so we don't kill antialiased pixels of the window
    bg_connected_inner = bg_connected.copy()

    # Apply alpha
    new = arr.copy()
    new[bg_connected_inner, 3] = 0

    Image.fromarray(new, 'RGBA').save(out_path, optimize=True)
    print(f'  saved: {out_path} (transparent px: {bg_connected_inner.sum():,})')


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for fname in ['rolladen-gurt.png', 'rolladen-elektrisch.png']:
        fp = os.path.join(root, 'img', fname)
        print(f'\n{fname}:')
        remove_background(fp, fp, tolerance=50)


if __name__ == '__main__':
    main()
