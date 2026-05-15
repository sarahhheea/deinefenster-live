#!/usr/bin/env python3
"""
Validierungsskript für Fenster- und Türbilder.
Prüft: Dimensionen (1024×1280), Hintergrund (weiß), Content-Fill (75-97%).
"""

import argparse
import sys
from pathlib import Path
from typing import List

import numpy as np
from PIL import Image


# Konstanten
TARGET_W = 1024
TARGET_H = 1280
CONTENT_MIN_PCT = 0.75
CONTENT_MAX_PCT = 0.97
BG_SAMPLE_SIZE = 20
BG_THRESHOLD_MASTER = 250  # Streng: Alle Ecken > 250
BG_THRESHOLD_VARIANT = 200  # Lenient: Alle Ecken > 200 (Farbverlauf-Toleranz)
CONTENT_THRESHOLD = 245  # Pixel < 245 avg = nicht weiß


def validate_dimensions(img: Image.Image) -> List[str]:
    """Prüft ob Bild exakt 1024×1280 px ist."""
    errors = []
    w, h = img.size
    if w != TARGET_W or h != TARGET_H:
        errors.append(f"Größe {w}×{h} statt {TARGET_W}×{TARGET_H}")
    return errors


def validate_background(arr: np.ndarray, is_master: bool = False) -> List[str]:
    """
    Prüft ob alle 4 Ecken weiß sind (20×20 px Samples).
    is_master=True: threshold 250 (streng)
    is_master=False: threshold 200 (lenient für Farbvarianten)
    """
    errors = []
    h, w = arr.shape[:2]
    sample = BG_SAMPLE_SIZE
    threshold = BG_THRESHOLD_MASTER if is_master else BG_THRESHOLD_VARIANT

    # 4 Ecken: oben-links, oben-rechts, unten-links, unten-rechts
    corners = [
        ("oben-links", slice(0, sample), slice(0, sample)),
        ("oben-rechts", slice(0, sample), slice(w - sample, w)),
        ("unten-links", slice(h - sample, h), slice(0, sample)),
        ("unten-rechts", slice(h - sample, h), slice(w - sample, w)),
    ]

    for corner_name, row_slice, col_slice in corners:
        sample_arr = arr[row_slice, col_slice]
        # Für RGB: avg über alle 3 Kanäle
        if len(sample_arr.shape) == 3:
            avg = sample_arr.mean(axis=(0, 1)).mean()  # avg aller Pixel, aller Kanäle
        else:
            avg = sample_arr.mean()

        if avg < threshold:
            if is_master:
                errors.append(f"Ecke {corner_name}: Hintergrund nicht rein weiß (avg={avg:.0f}, min={threshold})")
            else:
                errors.append(f"Ecke {corner_name}: Hintergrund nicht ausreichend weiß (avg={avg:.0f}, min={threshold})")

    return errors


def validate_content_fill(arr: np.ndarray) -> List[str]:
    """
    Prüft ob Produkt 75-97% der Höhe ausfüllt.
    Findet erste/letzte Zeile mit avg < 245 (nicht-weiß).
    """
    errors = []
    h, w = arr.shape[:2]

    # Für jede Zeile: durchschnittliche Helligkeit berechnen
    if len(arr.shape) == 3:
        row_brightness = arr.mean(axis=(1, 2))  # avg über Breite und Kanäle
    else:
        row_brightness = arr.mean(axis=1)

    # Erste nicht-weiße Zeile
    non_white_rows = np.where(row_brightness < CONTENT_THRESHOLD)[0]

    if len(non_white_rows) == 0:
        errors.append(f"Keine Inhalt erkannt (alle Zeilen weiß)")
        return errors

    first_content_row = non_white_rows[0]
    last_content_row = non_white_rows[-1]

    content_height = last_content_row - first_content_row + 1
    fill_pct = content_height / h

    if fill_pct < CONTENT_MIN_PCT:
        errors.append(f"Inhalt füllt nur {fill_pct*100:.1f}% (min {CONTENT_MIN_PCT*100:.0f}%)")
    elif fill_pct > CONTENT_MAX_PCT:
        errors.append(f"Inhalt füllt {fill_pct*100:.1f}% (max {CONTENT_MAX_PCT*100:.0f}%)")

    return errors


def validate_image(path: Path, is_master: bool = False) -> List[str]:
    """Validiert ein Bild gegen alle Kriterien."""
    errors = []

    try:
        img = Image.open(path)
        # Zu RGB konvertieren (falls RGBA oder indexed color)
        if img.mode != "RGB":
            img = img.convert("RGB")

        arr = np.array(img)

        # Alle Validierungen
        errors.extend(validate_dimensions(img))
        errors.extend(validate_background(arr, is_master=is_master))
        errors.extend(validate_content_fill(arr))

    except Exception as e:
        errors.append(f"Fehler beim Laden: {e}")

    return errors


def main():
    parser = argparse.ArgumentParser(
        description="Validiert Fenster- und Türbilder gegen Qualitätsanforderungen"
    )
    parser.add_argument(
        "path",
        type=str,
        help="Pfad zu Bild oder Verzeichnis"
    )
    parser.add_argument(
        "--masters",
        action="store_true",
        help="Strenge Hintergrund-Prüfung (avg > 250 statt > 200)"
    )
    parser.add_argument(
        "--alle",
        action="store_true",
        help="Alle PNG-Dateien im Verzeichnis prüfen"
    )

    args = parser.parse_args()
    path = Path(args.path)

    images_to_check = []

    if args.alle:
        if not path.is_dir():
            print(f"Fehler: {path} ist kein Verzeichnis", file=sys.stderr)
            sys.exit(1)
        images_to_check = sorted(path.glob("**/*.png"))
    else:
        if not path.exists():
            print(f"Fehler: {path} existiert nicht", file=sys.stderr)
            sys.exit(1)
        images_to_check = [path]

    if not images_to_check:
        print(f"Keine PNG-Dateien in {path} gefunden", file=sys.stderr)
        sys.exit(1)

    ok_count = 0
    fail_count = 0

    for img_path in images_to_check:
        errors = validate_image(img_path, is_master=args.masters)

        if not errors:
            print(f"OK: {img_path.name}")
            ok_count += 1
        else:
            print(f"FAIL: {img_path.name}")
            for error in errors:
                print(f"  - {error}")
            fail_count += 1

    # Zusammenfassung
    total = ok_count + fail_count
    print(f"\n{total} geprüft, {ok_count} OK, {fail_count} fehlerhaft")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
