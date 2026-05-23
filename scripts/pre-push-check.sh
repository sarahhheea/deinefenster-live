#!/bin/bash
# Pre-Push-Check für DeineFenster.de
# Läuft alle Qualitäts-Gates: Smart-Quotes + Partials-Drift
# Usage: scripts/pre-push-check.sh

set -e
cd "$(dirname "$0")/.."

echo "→ Smart-Quote-Check…"
python3 scripts/check-html-smart-quotes.py

echo "→ Partials-Drift-Check…"
python3 scripts/build-partials.py --check

echo ""
echo "✓ Alle Checks bestanden — bereit zum Push"
