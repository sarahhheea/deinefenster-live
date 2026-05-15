#!/usr/bin/env python3
"""
DeineFenster.de — Anschlag-Flip Script
=======================================
Horizontales Spiegeln für DK-Rechts / Dreh-Rechts / DIN-Rechts Varianten.

Wenn ein Fenster eine DK-Rechts oder Dreh-Rechts Öffnung hat, wandert der Griff
auf die linke Seite. Dies wird erreicht durch horizontales Spiegeln des DK-Links
Master-Bildes. Gleiches Prinzip für Haustür DIN-Rechts.

Verwendung (Single File):
  python3 scripts/flip-anschlag.py img/farben/fenster_1fl_anthrazit.png img/farben/fenster_1fl_rechts_anthrazit.png

Verwendung (Batch Mode):
  python3 scripts/flip-anschlag.py --batch img/farben/ --pattern "fenster_1fl_" --suffix "_rechts"
    fenster_1fl_anthrazit.png → fenster_1fl_rechts_anthrazit.png
    fenster_1fl_golden-oak.png → fenster_1fl_rechts_golden-oak.png
    (überspringt Dateien die bereits "rechts" im Namen haben)

  Mit --force: Existing files überschreiben
"""

import argparse
import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("FEHLER: Pillow nicht installiert. Bitte: pip3 install Pillow")
    sys.exit(1)


def flip_horizontal(input_path: str, output_path: str) -> bool:
    """
    Spiegelt ein Bild horizontal und speichert es.

    Args:
        input_path: Pfad zur Eingabedatei
        output_path: Pfad zur Ausgabedatei

    Returns:
        True bei Erfolg, False bei Fehler
    """
    try:
        img = Image.open(input_path)
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
        flipped.save(output_path, "PNG", optimize=True)
        return True
    except Exception as e:
        print(f"  FEHLER bei {input_path}: {e}")
        return False


def batch_flip(source_dir: str, pattern: str, suffix: str, skip_existing: bool = True, force: bool = False) -> dict:
    """
    Batch-Flip alle Dateien die einem Pattern entsprechen.

    Namenslogik:
    - Input: fenster_1fl_anthrazit.png
    - Split nach letztem Unterstrich: fenster_1fl + anthrazit
    - Insert Suffix: fenster_1fl_rechts_anthrazit.png

    Args:
        source_dir: Quellenverzeichnis
        pattern: Datei-Pattern zum Finden (z.B. "fenster_1fl_")
        suffix: Suffix zum Einfügen vor letztem _segment (z.B. "_rechts")
        skip_existing: Überspringe Dateien die bereits den Suffix enthalten
        force: Überschreibe existing files

    Returns:
        Dict mit Statistiken: {success: int, skipped: int, failed: int, total: int}
    """
    source_dir_path = Path(source_dir)

    if not source_dir_path.exists():
        print(f"FEHLER: Verzeichnis nicht gefunden: {source_dir}")
        return {"success": 0, "skipped": 0, "failed": 0, "total": 0}

    # Alle Dateien die das Pattern enthalten
    matching_files = sorted(source_dir_path.glob(f"*{pattern}*.png"))

    if not matching_files:
        print(f"Keine Dateien gefunden mit Pattern '*{pattern}*.png' in {source_dir}")
        return {"success": 0, "skipped": 0, "failed": 0, "total": 0}

    stats = {"success": 0, "skipped": 0, "failed": 0, "total": len(matching_files)}

    print(f"Batch-Flip startet auf {len(matching_files)} Dateien")
    print(f"Pattern: *{pattern}*.png")
    print(f"Suffix: {suffix}")
    print()

    for i, input_file in enumerate(matching_files, 1):
        filename = input_file.name

        # Prüfe ob bereits den Suffix im Namen hat
        if skip_existing and suffix in filename:
            print(f"  [{i:2d}/{len(matching_files)}] – {filename:<50} (bereits {suffix})")
            stats["skipped"] += 1
            continue

        # Berechne Output-Filename
        # fenster_1fl_anthrazit.png → split nach letztem _ → fenster_1fl + anthrazit.png
        # Dann einfügen: fenster_1fl_rechts_anthrazit.png

        stem = input_file.stem  # fenster_1fl_anthrazit

        # Find last underscore in stem
        last_underscore_idx = stem.rfind('_')
        if last_underscore_idx == -1:
            # Keine Unterstrich vorhanden — kann nicht splitten
            print(f"  [{i:2d}/{len(matching_files)}] SKIP {filename:<50} (kein _ zum Splitten)")
            stats["skipped"] += 1
            continue

        # Split: fenster_1fl + anthrazit
        prefix = stem[:last_underscore_idx]  # fenster_1fl
        suffix_part = stem[last_underscore_idx + 1:]  # anthrazit

        # Output: prefix + suffix + _ + suffix_part + .png
        output_filename = f"{prefix}{suffix}_{suffix_part}.png"
        output_file = input_file.parent / output_filename

        # Prüfe ob Output-Datei existiert
        if output_file.exists() and not force:
            print(f"  [{i:2d}/{len(matching_files)}] SKIP {output_filename:<50} (existiert, use --force)")
            stats["skipped"] += 1
            continue

        # Flip durchführen
        if flip_horizontal(str(input_file), str(output_file)):
            print(f"  [{i:2d}/{len(matching_files)}] ✔ {filename:<35} → {output_filename}")
            stats["success"] += 1
        else:
            print(f"  [{i:2d}/{len(matching_files)}] ✗ {filename:<35} → {output_filename}")
            stats["failed"] += 1

    print()
    print(f"Zusammenfassung:")
    print(f"  Erfolgreich: {stats['success']}")
    print(f"  Übersprungen: {stats['skipped']}")
    print(f"  Fehler: {stats['failed']}")
    print(f"  Total: {stats['total']}")

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Horizontales Spiegeln für Anschlag-Varianten (DK-Rechts, DIN-Rechts)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  # Single File:
  python3 scripts/flip-anschlag.py img/farben/fenster_1fl_anthrazit.png img/farben/fenster_1fl_rechts_anthrazit.png

  # Batch Mode:
  python3 scripts/flip-anschlag.py --batch img/farben/ --pattern "fenster_1fl_" --suffix "_rechts"

  # Mit --force (existing files überschreiben):
  python3 scripts/flip-anschlag.py --batch img/farben/ --pattern "fenster_1fl_" --suffix "_rechts" --force
        """
    )

    # Positional arguments for single-file mode
    parser.add_argument(
        "input",
        nargs="?",
        help="Eingabedatei (Single-File Modus)"
    )
    parser.add_argument(
        "output",
        nargs="?",
        help="Ausgabedatei (Single-File Modus)"
    )

    # Batch-Modus (--batch flag)
    parser.add_argument(
        "--batch",
        type=str,
        help="Batch-Modus: Quellverzeichnis"
    )
    parser.add_argument(
        "--pattern",
        type=str,
        help="Datei-Pattern (z.B. 'fenster_1fl_') — nur mit --batch"
    )
    parser.add_argument(
        "--suffix",
        type=str,
        help="Suffix zum Einfügen (z.B. '_rechts') — nur mit --batch"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Existing files überschreiben"
    )

    args = parser.parse_args()

    # Batch-Modus
    if args.batch:
        if not args.pattern or not args.suffix:
            print("FEHLER: --batch erfordert --pattern und --suffix")
            sys.exit(1)

        batch_flip(
            source_dir=args.batch,
            pattern=args.pattern,
            suffix=args.suffix,
            skip_existing=not args.force,
            force=args.force
        )

    # Single-File Modus
    elif args.input and args.output:
        input_path = Path(args.input)
        output_path = Path(args.output)

        if not input_path.exists():
            print(f"FEHLER: Eingabedatei nicht gefunden: {args.input}")
            sys.exit(1)

        print(f"Flip-Anschlag: Single File")
        print(f"  Input:  {input_path}")
        print(f"  Output: {output_path}")
        print()

        if flip_horizontal(str(input_path), str(output_path)):
            file_size = output_path.stat().st_size // 1024
            print(f"✔ Erfolgreich!")
            print(f"  Dateigröße: {file_size} KB")
        else:
            print(f"✗ Fehler beim Spiegeln")
            sys.exit(1)

    else:
        print("FEHLER: Bitte entweder (input output) oder --batch mit --pattern und --suffix angeben")
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
