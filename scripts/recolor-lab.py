#!/usr/bin/env python3
"""
DeineFenster.de — LAB Recoloring Engine
========================================
Ersetzt primitives RGB-Luminanz-Recoloring mit LAB-Farbraumverarbeitung.
LAB trennt Luminanz (L) von Farbe (A/B) → 3D-Tiefe bleibt erhalten.

Verwendung:
  python3 scripts/recolor-lab.py <master.png> <output.png> --farbe anthrazit
  python3 scripts/recolor-lab.py <master.png> <output-dir/> --alle --prefix fenster_1fl
  python3 scripts/recolor-lab.py <master.png> <output-dir/> --alle --prefix fenster_1fl --force
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path
from collections import deque

import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Farb-Konfiguration aus farb_config.py importieren
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).resolve().parent))
from farb_config import (
    FARBEN, SKIP_RECOLOR, LEICHTE_TOENUNG,
    KATEGORIE_HOLZ, KATEGORIE_METALLIC, KATEGORIE_SPEZIAL, KATEGORIE_WEISS,
    hex_to_rgb, get_recolor_farben,
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
IMG_DIR = PROJECT_DIR / "img"
HOLZ_TEXTUR_PATH = IMG_DIR / "holzdekor" / "maserung.png"


# ---------------------------------------------------------------------------
# Regionen-Erkennung (portiert aus recolor-varianten.py + Hardware-Erweiterung)
# ---------------------------------------------------------------------------

def detect_regions(arr: np.ndarray) -> np.ndarray:
    """
    Klassifiziert jeden Pixel:
      0 = Rahmen (wird recoloriert)
      1 = Hintergrund (weiße Ränder, nicht anfassen)
      2 = Glas (dunkles Zentrum, nicht anfassen)
      3 = Hardware/Griff (metallisches Grau, nicht anfassen)

    Parameters
    ----------
    arr : np.ndarray, shape (H, W, 3), dtype uint8

    Returns
    -------
    mark : np.ndarray, shape (H, W), dtype uint8
    """
    H, W, _ = arr.shape
    mark = np.zeros((H, W), dtype=np.uint8)
    avg = arr.mean(axis=2)  # Helligkeitskanal (0–255)

    # 1. Hintergrund: Flood-Fill von 8 Rand-/Eckpunkten, Schwelle avg > 232
    bg_seeds = [
        (0, 0), (0, W - 1), (H - 1, 0), (H - 1, W - 1),
        (0, W // 2), (H - 1, W // 2),
        (H // 2, 0), (H // 2, W - 1),
    ]
    bg_stack = deque(bg_seeds)
    while bg_stack:
        y, x = bg_stack.pop()
        if mark[y, x]:
            continue
        if avg[y, x] < 232:
            continue
        mark[y, x] = 1
        if x > 0:
            bg_stack.append((y, x - 1))
        if x < W - 1:
            bg_stack.append((y, x + 1))
        if y > 0:
            bg_stack.append((y - 1, x))
        if y < H - 1:
            bg_stack.append((y + 1, x))

    # 2. Glas: Flood-Fill von Mittelpunkten, Schwelle avg < 145
    gl_seeds = [
        (H // 2, W // 2),
        (int(H * 0.4), W // 2),
        (int(H * 0.6), W // 2),
    ]
    gl_stack = deque(gl_seeds)
    while gl_stack:
        y, x = gl_stack.pop()
        if mark[y, x]:
            continue
        if avg[y, x] >= 145:
            continue
        mark[y, x] = 2
        if x > 0:
            gl_stack.append((y, x - 1))
        if x < W - 1:
            gl_stack.append((y, x + 1))
        if y > 0:
            gl_stack.append((y - 1, x))
        if y < H - 1:
            gl_stack.append((y + 1, x))

    # 3. Hardware (Griffe, Scharniere): niedrige Sättigung, mittlere Helligkeit
    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = (max_c - min_c) / np.maximum(avg, 1)
    hw_mask = (mark == 0) & (avg >= 70) & (avg <= 175) & (sat < 0.13)
    mark[hw_mask] = 3

    # 3b. Hardware-Highlights: helle Nachbarn von Hardware-Pixeln (175–235)
    hw_expand = np.zeros((H, W), dtype=bool)
    for shift_y, shift_x in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
        shifted_hw = np.roll(mark == 3, shift=(shift_y, shift_x), axis=(0, 1))
        # Rand-Artefakte verhindern (np.roll wickelt Grenzen)
        if shift_y == -1:
            shifted_hw[-1, :] = False
        if shift_y == 1:
            shifted_hw[0, :] = False
        if shift_x == -1:
            shifted_hw[:, -1] = False
        if shift_x == 1:
            shifted_hw[:, 0] = False
        candidate = shifted_hw & (mark == 0) & (avg > 175) & (avg < 235)
        hw_expand |= candidate
    mark[hw_expand] = 3

    return mark


# ---------------------------------------------------------------------------
# RGB ↔ LAB Konvertierung (D65-Weißpunkt)
# ---------------------------------------------------------------------------

# sRGB → Linear (Gamma-Entzerrung)
def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


# Linear → sRGB (Gamma-Komprimierung)
def _linear_to_srgb(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1.0 / 2.4) - 0.055)


# D65-Weißpunkt
_D65 = np.array([0.95047, 1.00000, 1.08883])

# sRGB → XYZ (D65) Matrix
_M_RGB_XYZ = np.array([
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041],
])

# XYZ → sRGB Matrix
_M_XYZ_RGB = np.array([
    [ 3.2404542, -1.5371385, -0.4985314],
    [-0.9692660,  1.8760108,  0.0415560],
    [ 0.0556434, -0.2040259,  1.0572252],
])


def _f_xyz(t: np.ndarray) -> np.ndarray:
    delta = 6.0 / 29.0
    return np.where(t > delta ** 3, t ** (1.0 / 3.0), t / (3 * delta ** 2) + 4.0 / 29.0)


def _f_xyz_inv(t: np.ndarray) -> np.ndarray:
    delta = 6.0 / 29.0
    return np.where(t > delta, t ** 3, 3 * delta ** 2 * (t - 4.0 / 29.0))


def rgb_to_lab(rgb_arr: np.ndarray) -> np.ndarray:
    """
    Konvertiert RGB (0–255 uint8 oder float) → LAB.

    Parameters
    ----------
    rgb_arr : np.ndarray, shape (..., 3)

    Returns
    -------
    lab_arr : np.ndarray, shape (..., 3), float64
              L in [0, 100], A in [-128, 127], B in [-128, 127]
    """
    rgb = rgb_arr.astype(np.float64)
    lin = np.stack([_srgb_to_linear(rgb[..., i]) for i in range(3)], axis=-1)
    # XYZ — einsum vermeidet numpy-interne Overflow-Warnungen bei großen Arrays
    xyz = np.einsum("...i,ji->...j", lin, _M_RGB_XYZ)
    # Normalisiere auf D65-Weißpunkt
    xyz_n = xyz / _D65
    f = _f_xyz(xyz_n)
    L = 116.0 * f[..., 1] - 16.0
    A = 500.0 * (f[..., 0] - f[..., 1])
    B = 200.0 * (f[..., 1] - f[..., 2])
    return np.stack([L, A, B], axis=-1)


def lab_to_rgb(lab_arr: np.ndarray) -> np.ndarray:
    """
    Konvertiert LAB → RGB (uint8, 0–255, geklippt).

    Parameters
    ----------
    lab_arr : np.ndarray, shape (..., 3), float

    Returns
    -------
    rgb_arr : np.ndarray, shape (..., 3), dtype uint8
    """
    L = lab_arr[..., 0]
    A = lab_arr[..., 1]
    B_ch = lab_arr[..., 2]

    fy = (L + 16.0) / 116.0
    fx = A / 500.0 + fy
    fz = fy - B_ch / 200.0

    xyz_n = np.stack([_f_xyz_inv(fx), _f_xyz_inv(fy), _f_xyz_inv(fz)], axis=-1)
    xyz = xyz_n * _D65

    lin = np.einsum("...i,ji->...j", xyz, _M_XYZ_RGB)
    srgb = _linear_to_srgb(np.clip(lin, 0, None))
    rgb = np.clip(srgb * 255.0 + 0.5, 0, 255).astype(np.uint8)
    return rgb


def hex_to_lab(hex_color: str) -> tuple[float, float, float]:
    """Konvertiert Hex-Farbe → LAB (L, A, B)."""
    r, g, b = hex_to_rgb(hex_color)
    lab = rgb_to_lab(np.array([[[r, g, b]]], dtype=np.uint8))
    return float(lab[0, 0, 0]), float(lab[0, 0, 1]), float(lab[0, 0, 2])


# ---------------------------------------------------------------------------
# Holzdekor-Textur laden
# ---------------------------------------------------------------------------

def load_holz_textur() -> np.ndarray | None:
    """
    Lädt `img/holzdekor/maserung.png` als Graustufenbild (float 0–1).
    Gibt None zurück wenn Datei nicht existiert.
    """
    if not HOLZ_TEXTUR_PATH.exists():
        return None
    try:
        tex = Image.open(HOLZ_TEXTUR_PATH).convert("L")
        return np.array(tex, dtype=np.float32) / 255.0
    except Exception as e:
        print(f"  [WARN] Holztextur konnte nicht geladen werden: {e}")
        return None


# ---------------------------------------------------------------------------
# Core LAB-Recoloring
# ---------------------------------------------------------------------------

def recolor_lab(
    arr: np.ndarray,
    mark: np.ndarray,
    hex_color: str,
    holz_textur: np.ndarray | None = None,
) -> np.ndarray:
    """
    Recoloriert Rahmen-Pixel (mark==0) via LAB-Farbraum.

    Algorithmus:
    1. Konvertiere Rahmen-Pixel → LAB
    2. Skaliere L-Kanal so: hellste Pixel → target_L, dunklere Pixel proportional dunkler
    3. Ersetze A/B-Kanäle mit Zielfarbe A/B
    4. Optional: Holzmaserung auf L-Kanal (Multiply-Overlay, 30%-Stärke)
    5. Konvertiere zurück → RGB

    Parameters
    ----------
    arr : np.ndarray, shape (H, W, 3), dtype uint8 — Master-Bild (weiß)
    mark : np.ndarray, shape (H, W), dtype uint8   — Regionen-Maske
    hex_color : str                                 — Zielfarbe als Hex (#rrggbb)
    holz_textur : np.ndarray | None                — Graustufentextur float 0–1

    Returns
    -------
    out : np.ndarray, shape (H, W, 3), dtype uint8
    """
    # Zielfarbe in LAB
    target_L, target_A, target_B = hex_to_lab(hex_color)

    # Rahmen-Maske: mark==0, Mindesthelligkeit 60 (sehr dunkle Schatten ausschließen)
    avg = arr.mean(axis=2)
    frame_mask = (mark == 0) & (avg >= 60)

    out = arr.copy()

    if not np.any(frame_mask):
        return out

    # Konvertiere gesamtes Bild → LAB (nur Rahmen-Pixel nutzen)
    lab_full = rgb_to_lab(arr.astype(np.float64))
    orig_L = lab_full[..., 0]  # shape (H, W)

    # L-Kanal des Rahmens: Wertebereich bestimmen
    frame_L_vals = orig_L[frame_mask]
    L_min = float(frame_L_vals.min())
    L_max = float(frame_L_vals.max())
    L_range = L_max - L_min if L_max > L_min else 1.0

    # Ziel-L-Bereich: hellste Pixel → target_L, dunkelste → target_L_min
    target_L_range = max(target_L * 0.4, 10.0)
    target_L_min = max(target_L - target_L_range, 0.0)

    # Normalisieren und in Zielbereich mappen
    normalized = (orig_L - L_min) / L_range       # 0–1
    new_L = target_L_min + normalized * (target_L - target_L_min)  # target_L_min–target_L

    # Holzmaserung auf L-Kanal anwenden (Multiply-Overlay, 30%)
    if holz_textur is not None and np.any(frame_mask):
        H, W = arr.shape[:2]
        # Textur auf Bildgröße skalieren
        tex_img = Image.fromarray((holz_textur * 255).astype(np.uint8), "L")
        tex_resized = np.array(tex_img.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255.0
        # Multiply: new_L * (0.7 + 0.3 * tex_gray), nur auf Rahmen-Pixel
        tex_factor = 0.7 + 0.3 * tex_resized
        new_L = np.where(frame_mask, new_L * tex_factor, new_L)

    # Neues LAB-Bild aufbauen
    new_lab = lab_full.copy()
    new_lab[frame_mask, 0] = np.clip(new_L[frame_mask], 0, 100)
    new_lab[frame_mask, 1] = target_A
    new_lab[frame_mask, 2] = target_B

    # Zurück → RGB
    result = lab_to_rgb(new_lab)

    # Original-Pixel für Nicht-Rahmen-Bereiche erhalten
    out = np.where(frame_mask[:, :, np.newaxis], result, arr)
    return out.astype(np.uint8)


# ---------------------------------------------------------------------------
# Leichte Tönung (für cremeweiss etc.)
# ---------------------------------------------------------------------------

def recolor_leichte_toenung(
    arr: np.ndarray,
    mark: np.ndarray,
    hex_color: str,
) -> np.ndarray:
    """
    Leichte Tönung für fast-weiße Farben (z.B. cremeweiss).
    Mischt Zielfarbe subtil in Rahmen-Pixel (20% Intensität).
    """
    target_L, target_A, target_B = hex_to_lab(hex_color)
    avg = arr.mean(axis=2)
    frame_mask = (mark == 0) & (avg >= 60)
    out = arr.copy()
    if not np.any(frame_mask):
        return out

    lab_full = rgb_to_lab(arr.astype(np.float64))
    new_lab = lab_full.copy()

    # Nur minimale Tönung: A/B mit 20% Zielfarbe mischen
    blend = 0.20
    new_lab[frame_mask, 1] = lab_full[frame_mask, 1] * (1 - blend) + target_A * blend
    new_lab[frame_mask, 2] = lab_full[frame_mask, 2] * (1 - blend) + target_B * blend

    result = lab_to_rgb(new_lab)
    out = np.where(frame_mask[:, :, np.newaxis], result, arr)
    return out.astype(np.uint8)


# ---------------------------------------------------------------------------
# Einzel-Pipeline
# ---------------------------------------------------------------------------

def recolor_master(
    master_path: Path,
    output_path: Path,
    farbe_key: str,
) -> bool:
    """
    Vollständiger Recoloring-Pipeline für eine Farbe.

    Returns True bei Erfolg, False bei Fehler.
    """
    if farbe_key not in FARBEN:
        print(f"  [ERROR] Unbekannte Farbe: {farbe_key}")
        print(f"          Verfügbar: {', '.join(FARBEN.keys())}")
        return False

    farbe_def = FARBEN[farbe_key]
    hex_color = farbe_def["hex"]
    kategorie = farbe_def["kategorie"]

    try:
        img = Image.open(master_path).convert("RGB")
        arr = np.array(img, dtype=np.uint8)
    except Exception as e:
        print(f"  [ERROR] Master-Bild konnte nicht geladen werden: {e}")
        return False

    # Regionen erkennen
    mark = detect_regions(arr)

    # Weiss-Farben: keine Änderung nötig (Kopie des Masters)
    if farbe_key in SKIP_RECOLOR:
        try:
            img.save(output_path, "PNG", optimize=True)
            return True
        except Exception as e:
            print(f"  [ERROR] Speichern fehlgeschlagen: {e}")
            return False

    # Leichte Tönung für cremeweiss etc.
    if farbe_key in LEICHTE_TOENUNG:
        out_arr = recolor_leichte_toenung(arr, mark, hex_color)
    else:
        # Holzmaserung laden wenn Holzdekor
        holz_textur = None
        if kategorie == KATEGORIE_HOLZ:
            holz_textur = load_holz_textur()

        # LAB-Recoloring
        out_arr = recolor_lab(arr, mark, hex_color, holz_textur=holz_textur)

    # Speichern
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        out_img = Image.fromarray(out_arr)
        out_img.save(output_path, "PNG", optimize=True)
        return True
    except Exception as e:
        print(f"  [ERROR] Speichern fehlgeschlagen: {e}")
        return False


# ---------------------------------------------------------------------------
# Batch-Pipeline
# ---------------------------------------------------------------------------

def recolor_all(
    master_path: Path,
    output_dir: Path,
    prefix: str,
    skip_existing: bool = True,
) -> dict[str, bool]:
    """
    Recoloriert alle Farben aus FARBEN (exkl. SKIP_RECOLOR).

    Parameters
    ----------
    master_path  : Path — Quell-Master-PNG
    output_dir   : Path — Ausgabeverzeichnis
    prefix       : str  — Dateiname-Präfix (z.B. "fenster_1fl")
    skip_existing: bool — Vorhandene Dateien überspringen

    Returns
    -------
    results : dict[farbe_key -> bool]  — True = Erfolg, False = Fehler
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Regionen einmalig berechnen (spart Zeit bei Batch)
    try:
        img = Image.open(master_path).convert("RGB")
        arr = np.array(img, dtype=np.uint8)
    except Exception as e:
        print(f"[ERROR] Master-Bild konnte nicht geladen werden: {e}")
        return {}

    mark = detect_regions(arr)
    holz_textur = load_holz_textur()

    recolor_farben = get_recolor_farben()
    results: dict[str, bool] = {}

    total = len(recolor_farben) + len(SKIP_RECOLOR)
    done = 0

    print(f"  Batch: {total} Farben | Master: {master_path.name}")
    print(f"  Output-Dir: {output_dir}")
    if holz_textur is not None:
        print(f"  Holztextur: geladen ({holz_textur.shape})")
    else:
        print(f"  Holztextur: nicht verfügbar (Holzdekore werden eingefärbt ohne Maserung)")

    # SKIP_RECOLOR-Farben: Master-Kopie
    for farbe_key in SKIP_RECOLOR:
        out_path = output_dir / f"{prefix}_{farbe_key}.png"
        if skip_existing and out_path.exists():
            done += 1
            results[farbe_key] = True
            print(f"  [SKIP] {farbe_key:<16} → {out_path.name}")
            continue
        try:
            img.save(out_path, "PNG", optimize=True)
            results[farbe_key] = True
            done += 1
            print(f"  [OK]   {farbe_key:<16} → {out_path.name}")
        except Exception as e:
            results[farbe_key] = False
            print(f"  [ERR]  {farbe_key:<16} → {e}")

    # Alle anderen Farben
    for farbe_key, farbe_def in recolor_farben.items():
        out_path = output_dir / f"{prefix}_{farbe_key}.png"
        if skip_existing and out_path.exists():
            done += 1
            results[farbe_key] = True
            print(f"  [SKIP] {farbe_key:<16} → {out_path.name}")
            continue

        hex_color = farbe_def["hex"]
        kategorie = farbe_def["kategorie"]

        try:
            if farbe_key in LEICHTE_TOENUNG:
                out_arr = recolor_leichte_toenung(arr, mark, hex_color)
            else:
                tx = holz_textur if kategorie == KATEGORIE_HOLZ else None
                out_arr = recolor_lab(arr, mark, hex_color, holz_textur=tx)

            out_img = Image.fromarray(out_arr)
            out_img.save(out_path, "PNG", optimize=True)
            results[farbe_key] = True
            done += 1
            tag = f"[{kategorie[:4].upper()}]"
            print(f"  [OK]   {farbe_key:<16} {tag:<7} → {out_path.name}")
        except Exception as e:
            results[farbe_key] = False
            print(f"  [ERR]  {farbe_key:<16} → {e}")

    ok = sum(1 for v in results.values() if v)
    fail = sum(1 for v in results.values() if not v)
    print(f"\n  Fertig: {ok} OK, {fail} Fehler (von {total} gesamt)")
    return results


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="DeineFenster LAB Recoloring Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Beispiele:
  python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/out.png --farbe anthrazit
  python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/lab-test/ --alle --prefix fenster_1fl
  python3 scripts/recolor-lab.py img/fenster_standard_v3.png /tmp/lab-test/ --alle --prefix fenster_1fl --force
""",
    )
    parser.add_argument("master", help="Pfad zum Master-PNG (weißer Rahmen)")
    parser.add_argument("output", help="Ausgabe: PNG-Datei (Einzelfarbe) oder Verzeichnis (--alle)")
    parser.add_argument("--farbe", help="Farb-Schlüssel für Einzelfarbe (z.B. anthrazit)")
    parser.add_argument("--alle", action="store_true", help="Alle Farben recolorieren")
    parser.add_argument("--prefix", default="fenster", help="Dateiname-Präfix für Batch (Standard: fenster)")
    parser.add_argument("--force", action="store_true", help="Vorhandene Dateien überschreiben")
    parser.add_argument("--liste", action="store_true", help="Alle verfügbaren Farben auflisten")

    args = parser.parse_args()

    if args.liste:
        recolor_f = get_recolor_farben()
        print(f"\nVerfügbare Farben ({len(FARBEN)} gesamt, {len(recolor_f)} zum Recoloring):\n")
        for key, val in FARBEN.items():
            skip_tag = " [SKIP]" if key in SKIP_RECOLOR else ""
            toenung_tag = " [LEICHT]" if key in LEICHTE_TOENUNG else ""
            print(f"  {key:<18} {val['hex']}  [{val['kategorie']}]{skip_tag}{toenung_tag}")
        print()
        return

    master_path = Path(args.master)
    if not master_path.exists():
        print(f"[ERROR] Master-Bild nicht gefunden: {master_path}")
        sys.exit(1)

    if args.alle:
        # Batch-Modus
        output_dir = Path(args.output)
        results = recolor_all(
            master_path=master_path,
            output_dir=output_dir,
            prefix=args.prefix,
            skip_existing=not args.force,
        )
        if not results:
            sys.exit(1)
        failed = [k for k, v in results.items() if not v]
        if failed:
            print(f"\n[WARN] Fehlgeschlagene Farben: {', '.join(failed)}")
            sys.exit(1)

    elif args.farbe:
        # Einzelfarbe
        output_path = Path(args.output)
        farbe_key = args.farbe
        print(f"\nLAB Recoloring: {master_path.name} → {output_path.name} [{farbe_key}]")
        ok = recolor_master(
            master_path=master_path,
            output_path=output_path,
            farbe_key=farbe_key,
        )
        if ok:
            print(f"  OK → {output_path}")
        else:
            sys.exit(1)

    else:
        parser.print_help()
        print("\n[ERROR] Entweder --farbe <farbe> oder --alle angeben.")
        sys.exit(1)


if __name__ == "__main__":
    main()
