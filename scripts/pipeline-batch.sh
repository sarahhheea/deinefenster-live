#!/bin/bash
# Pipeline Batch Script
# Verarbeitet alle .jpeg/.jpg/.png in einem Ordner durch die Master-Pipeline
# Verwendung: bash scripts/pipeline-batch.sh <input_ordner> <prefix>
# Beispiel:   bash scripts/pipeline-batch.sh ~/Downloads/session-A fenster_2fl

INPUT_DIR="${1:-$HOME/Downloads}"
PREFIX="${2:-}"
OUT_DIR="$(dirname "$0")/../img/farben"

echo "=== Pipeline Batch ==="
echo "Input:  $INPUT_DIR"
echo "Prefix: $PREFIX"
echo "Output: $OUT_DIR"
echo ""

SCRIPT="$(dirname "$0")/process-master-image.py"
COUNT=0
FAILED=0

for f in "$INPUT_DIR"/*.jpeg "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.png; do
  [ -f "$f" ] || continue
  BASENAME=$(basename "$f")
  # Ziel-Dateiname: prefix_basename (ohne Extension) + .png
  NOEXT="${BASENAME%.*}"
  if [ -n "$PREFIX" ]; then
    OUTNAME="${PREFIX}_${NOEXT}.png"
  else
    OUTNAME="${NOEXT}.png"
  fi
  OUTPATH="$OUT_DIR/$OUTNAME"
  echo "[$((COUNT+1))] $BASENAME → $OUTNAME"
  python3 "$SCRIPT" "$f" "$OUTPATH"
  if [ $? -eq 0 ]; then
    COUNT=$((COUNT+1))
  else
    echo "  ⚠️  FEHLER bei $BASENAME"
    FAILED=$((FAILED+1))
  fi
done

echo ""
echo "=== Fertig: $COUNT OK, $FAILED Fehler ==="
