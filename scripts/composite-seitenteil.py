#!/usr/bin/env python3
"""
DeineFenster.de — Haustür Seitenteil Compositing
==================================================
Kombiniert ein Haustür-Modellbild mit einem Seitenteil-Glaselement
(gleiches Rahmen-/Farbprofil) auf einem 1024×1280-Canvas.

Verwendung:
  python3 scripts/composite-seitenteil.py \
      --tuer img/farben/haustuer_aussen_florida-lr-inox_anthrazit.png \
      --seitenteil img/farben/haustuer_seitenteil_aussen_anthrazit.png \
      --position links \
      --output img/farben/haustuer_st-l_aussen_florida-lr-inox_anthrazit.png

Positionen: links, rechts, beidseitig
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Konstanten
# ---------------------------------------------------------------------------
TARGET_W = 1024
TARGET_H = 1280

# Anteil am Canvas (Breite)
DOOR_FRAC = 0.62      # Haustür ~62 %
PANEL_FRAC = 0.30     # Seitenteil ~30 %
GAP_FRAC = 0.08       # Abstand ~8 %

BACKGROUND = (255, 255, 255, 255)  # weißer Canvas


# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def find_content_bbox(arr: np.ndarray, threshold: int = 245) -> tuple[int, int, int, int]:
    """
    Gibt (top, left, bottom, right) des Nicht-Weiß-Inhalts zurück.

    Parameters
    ----------
    arr       : RGBA- oder RGB-Array (H, W, C)
    threshold : Pixel gilt als „Inhalt" wenn mindestens ein Kanal < threshold

    Returns
    -------
    (top, left, bottom, right)  — inklusive Grenzen, 0-indiziert
    """
    if arr.shape[2] == 4:
        # Alphkanal > 10 zählt ebenfalls als Inhalt
        mask = (arr[:, :, 3] > 10) | np.any(arr[:, :, :3] < threshold, axis=2)
    else:
        mask = np.any(arr[:, :, :3] < threshold, axis=2)

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)

    if not rows.any():
        h, w = arr.shape[:2]
        return 0, 0, h - 1, w - 1

    top = int(rows.argmax())
    bottom = int(len(rows) - 1 - rows[::-1].argmax())
    left = int(cols.argmax())
    right = int(len(cols) - 1 - cols[::-1].argmax())
    return top, left, bottom, right


def crop_to_content(img: Image.Image, threshold: int = 245) -> Image.Image:
    """Schneidet das Bild auf den Nicht-Weiß-Inhalt zu."""
    arr = np.array(img.convert("RGBA"))
    top, left, bottom, right = find_content_bbox(arr, threshold)
    return img.crop((left, top, right + 1, bottom + 1))


def scale_to_height(img: Image.Image, target_h: int) -> Image.Image:
    """Skaliert proportional auf Zielhöhe."""
    w, h = img.size
    new_w = max(1, round(w * target_h / h))
    return img.resize((new_w, target_h), Image.LANCZOS)


def place_on_canvas(
    canvas: Image.Image,
    element: Image.Image,
    x: int,
    y: int,
) -> None:
    """Platziert element auf canvas an Position (x, y) mit Alpha-Compositing."""
    if element.mode != "RGBA":
        element = element.convert("RGBA")
    canvas.paste(element, (x, y), element)


# ---------------------------------------------------------------------------
# Haupt-Compositing-Funktion
# ---------------------------------------------------------------------------

def composite(
    tuer_path: str | Path,
    seitenteil_path: str | Path,
    position: str,
    output_path: str | Path,
) -> None:
    """
    Kombiniert Haustür und Seitenteil auf einem 1024×1280-Canvas.

    Parameters
    ----------
    tuer_path       : Pfad zum fertig recolorierten Haustür-Bild
    seitenteil_path : Pfad zum fertig recolorierten Seitenteil-Bild
    position        : "links" | "rechts" | "beidseitig"
    output_path     : Ausgabe-PNG
    """
    position = position.lower().strip()
    if position not in ("links", "rechts", "beidseitig"):
        raise ValueError(f"Ungültige Position '{position}'. Erlaubt: links, rechts, beidseitig")

    tuer_img = Image.open(tuer_path).convert("RGBA")
    panel_img = Image.open(seitenteil_path).convert("RGBA")

    # ---- Inhalt freistellen ----
    tuer_crop = crop_to_content(tuer_img)
    panel_crop = crop_to_content(panel_img)

    # ---- Zielbreiten berechnen ----
    door_w = round(TARGET_W * DOOR_FRAC)
    panel_w = round(TARGET_W * PANEL_FRAC)
    gap = round(TARGET_W * GAP_FRAC)

    # Seitenteil: Höhe = Türhöhe  (beide erst auf TARGET_H skalieren und dann auf die Zielbreite)
    # Besser: erst auf door_w / panel_w skalieren, dann Höhe angleichen
    # Strategie: Tür auf door_w skalieren, Panel-Höhe = Türhöhe
    tuer_ratio = tuer_crop.height / tuer_crop.width if tuer_crop.width else 1
    tuer_h = round(door_w * tuer_ratio)

    # Begrenze Türhöhe auf TARGET_H
    if tuer_h > TARGET_H:
        tuer_h = TARGET_H
        door_w = round(tuer_h / tuer_ratio)

    tuer_scaled = tuer_crop.resize((door_w, tuer_h), Image.LANCZOS)

    # Panel: gleiche Höhe wie Tür, proportional breite
    panel_ratio = panel_crop.width / panel_crop.height if panel_crop.height else 1
    panel_h = tuer_h
    panel_actual_w = round(panel_h * panel_ratio)
    # Wenn Panel zu breit wird → auf panel_w kappen
    if panel_actual_w > panel_w:
        panel_actual_w = panel_w
        panel_h = round(panel_actual_w / panel_ratio)
    panel_scaled = panel_crop.resize((panel_actual_w, panel_h), Image.LANCZOS)

    # ---- Canvas aufbauen ----
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), BACKGROUND)

    # Vertikal zentrieren
    door_y = (TARGET_H - tuer_h) // 2
    panel_y = (TARGET_H - panel_h) // 2

    if position == "links":
        # Panel links, Tür rechts
        total_w = panel_actual_w + gap + door_w
        start_x = (TARGET_W - total_w) // 2
        panel_x = start_x
        door_x = start_x + panel_actual_w + gap
        place_on_canvas(canvas, panel_scaled, panel_x, panel_y)
        place_on_canvas(canvas, tuer_scaled, door_x, door_y)

    elif position == "rechts":
        # Tür links, Panel rechts
        total_w = door_w + gap + panel_actual_w
        start_x = (TARGET_W - total_w) // 2
        door_x = start_x
        panel_x = start_x + door_w + gap
        place_on_canvas(canvas, tuer_scaled, door_x, door_y)
        place_on_canvas(canvas, panel_scaled, panel_x, panel_y)

    else:  # beidseitig
        # Panel links – Tür Mitte – Panel rechts (gespiegelt)
        panel_right = panel_scaled.transpose(Image.FLIP_LEFT_RIGHT)
        total_w = panel_actual_w + gap + door_w + gap + panel_actual_w
        start_x = (TARGET_W - total_w) // 2
        panel_l_x = start_x
        door_x = start_x + panel_actual_w + gap
        panel_r_x = door_x + door_w + gap
        place_on_canvas(canvas, panel_scaled, panel_l_x, panel_y)
        place_on_canvas(canvas, tuer_scaled, door_x, door_y)
        place_on_canvas(canvas, panel_right, panel_r_x, panel_y)

    # ---- Speichern ----
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas_rgb = canvas.convert("RGB")
    canvas_rgb.save(output_path, "PNG", optimize=True)
    print(f"Gespeichert: {output_path}  ({TARGET_W}×{TARGET_H})")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Haustür + Seitenteil → kombiniertes 1024×1280 PNG"
    )
    parser.add_argument(
        "--tuer",
        required=True,
        metavar="PFAD",
        help="Haustür-Bild (recoloriert)",
    )
    parser.add_argument(
        "--seitenteil",
        required=True,
        metavar="PFAD",
        help="Seitenteil-Bild (gleiche Farbe wie Tür)",
    )
    parser.add_argument(
        "--position",
        required=True,
        choices=["links", "rechts", "beidseitig"],
        help="Position des Seitenteils relativ zur Tür",
    )
    parser.add_argument(
        "--output",
        required=True,
        metavar="PFAD",
        help="Ausgabe-PNG",
    )
    args = parser.parse_args()

    composite(
        tuer_path=args.tuer,
        seitenteil_path=args.seitenteil,
        position=args.position,
        output_path=args.output,
    )


if __name__ == "__main__":
    main()
