#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# SEO Auto-Audit — DeineFenster.de
# Automatisierte SEO-Checks: Lighthouse, Alt-Texte, Titles,
# Descriptions, Headings, Bildgrößen.
# Ergebnis: .claude/seo-audit-latest.md
#
# Usage:  bash scripts/seo-auto-audit.sh [--no-lighthouse]
# ════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Pfade ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CLAUDE_DIR="$PROJECT_DIR/.claude"
REPORT="$CLAUDE_DIR/seo-audit-latest.md"
PREV_REPORT="$CLAUDE_DIR/seo-audit-previous.md"
LIGHTHOUSE_JSON="/tmp/deinefenster-lighthouse.json"
DATE=$(date '+%Y-%m-%d %H:%M')
RUN_LIGHTHOUSE=true

# Flag: --no-lighthouse überspringt den langsamen Teil
[[ "${1:-}" == "--no-lighthouse" ]] && RUN_LIGHTHOUSE=false

mkdir -p "$CLAUDE_DIR"

# Vorherigen Report archivieren
[[ -f "$REPORT" ]] && cp "$REPORT" "$PREV_REPORT"

# ── Helper ─────────────────────────────────────────────────────
count_pattern() {
  local pattern="$1" file="$2"
  grep -ciE "$pattern" "$file" 2>/dev/null || echo 0
}

# ── 1. Lighthouse (optional) ──────────────────────────────────
LH_PERF="–" LH_A11Y="–" LH_BP="–" LH_SEO="–" LH_LCP="–" LH_CLS="–" LH_TBT="–"

if $RUN_LIGHTHOUSE; then
  echo "▶ Lighthouse-Audit läuft (localhost:8080)..."
  if npx lighthouse http://localhost:8080 \
    --output=json --output-path="$LIGHTHOUSE_JSON" \
    --chrome-flags="--headless --no-sandbox" \
    --form-factor=mobile --quiet 2>/dev/null; then

    LH_PERF=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(int(d['categories']['performance']['score']*100))" 2>/dev/null || echo "?")
    LH_A11Y=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(int(d['categories']['accessibility']['score']*100))" 2>/dev/null || echo "?")
    LH_BP=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(int(d['categories']['best-practices']['score']*100))" 2>/dev/null || echo "?")
    LH_SEO=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(int(d['categories']['seo']['score']*100))" 2>/dev/null || echo "?")
    LH_LCP=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));a=d['audits']['largest-contentful-paint'];print(f\"{a['numericValue']/1000:.1f}s\")" 2>/dev/null || echo "?")
    LH_CLS=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(f\"{d['audits']['cumulative-layout-shift']['numericValue']:.3f}\")" 2>/dev/null || echo "?")
    LH_TBT=$(python3 -c "import json;d=json.load(open('$LIGHTHOUSE_JSON'));print(f\"{d['audits']['total-blocking-time']['numericValue']:.0f}ms\")" 2>/dev/null || echo "?")
    echo "  ✓ Lighthouse fertig: Performance $LH_PERF, SEO $LH_SEO"
  else
    echo "  ⚠ Lighthouse fehlgeschlagen (localhost:8080 erreichbar?)"
  fi
else
  echo "▶ Lighthouse übersprungen (--no-lighthouse)"
fi

# ── 2. Alt-Text-Scan ──────────────────────────────────────────
echo "▶ Scanne Bilder ohne Alt-Text..."
ALT_REPORT=""
TOTAL_MISSING=0

for html in "$PROJECT_DIR"/*.html; do
  [[ ! -f "$html" ]] && continue
  fname=$(basename "$html")

  # Zähle <img ohne alt= oder mit alt="">
  total_imgs=$(grep -ciE '<img ' "$html" 2>/dev/null | tr -d '[:space:]' || true)
  total_imgs=${total_imgs:-0}
  # Bilder ohne alt-Attribut ODER mit leerem alt=""
  missing_alt=$(grep -iE '<img ' "$html" 2>/dev/null | grep -cvE 'alt="[^"]' 2>/dev/null | tr -d '[:space:]' || true)
  missing_alt=${missing_alt:-0}

  if [[ "$missing_alt" -gt 0 ]]; then
    ALT_REPORT+="| $fname | $missing_alt / $total_imgs |\n"
    TOTAL_MISSING=$((TOTAL_MISSING + missing_alt))
  fi
done

# ── 3. Title-Tag-Längen ───────────────────────────────────────
echo "▶ Prüfe Title-Tags..."
TITLE_REPORT=""

for html in "$PROJECT_DIR"/*.html; do
  [[ ! -f "$html" ]] && continue
  fname=$(basename "$html")

  title=$(sed -n 's/.*<title>\(.*\)<\/title>.*/\1/Ip' "$html" 2>/dev/null | head -1 || echo "")
  if [[ -n "$title" ]]; then
    len=${#title}
    status="✅"
    [[ $len -gt 60 ]] && status="❌ zu lang"
    [[ $len -lt 30 ]] && status="⚠️ zu kurz"
    TITLE_REPORT+="| $fname | $len | $status |\n"
  fi
done

# ── 4. Meta-Description-Längen ─────────────────────────────────
echo "▶ Prüfe Meta-Descriptions..."
DESC_REPORT=""

for html in "$PROJECT_DIR"/*.html; do
  [[ ! -f "$html" ]] && continue
  fname=$(basename "$html")

  desc=$(grep -iE 'meta name="description"' "$html" 2>/dev/null | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1 || echo "")
  if [[ -n "$desc" ]]; then
    len=${#desc}
    status="✅"
    [[ $len -gt 160 ]] && status="❌ zu lang"
    [[ $len -lt 70 ]] && status="⚠️ zu kurz"
    DESC_REPORT+="| $fname | $len | $status |\n"
  else
    DESC_REPORT+="| $fname | 0 | ❌ fehlt |\n"
  fi
done

# ── 5. Heading-Hierarchie ──────────────────────────────────────
echo "▶ Prüfe Heading-Hierarchie..."
HEADING_REPORT=""

for html in "$PROJECT_DIR"/*.html; do
  [[ ! -f "$html" ]] && continue
  fname=$(basename "$html")

  h1_count=$(grep -ciE '<h1[ >]' "$html" 2>/dev/null | tr -d '[:space:]' || true)
  h1_count=${h1_count:-0}
  h2_count=$(grep -ciE '<h2[ >]' "$html" 2>/dev/null | tr -d '[:space:]' || true)
  h2_count=${h2_count:-0}
  h3_count=$(grep -ciE '<h3[ >]' "$html" 2>/dev/null | tr -d '[:space:]' || true)
  h3_count=${h3_count:-0}

  status="✅"
  [[ "$h1_count" -eq 0 ]] && status="❌ keine h1"
  [[ "$h1_count" -gt 1 ]] && status="⚠️ ${h1_count}× h1"
  # Sprung-Check: h3 vorhanden aber keine h2
  [[ "$h3_count" -gt 0 ]] && [[ "$h2_count" -eq 0 ]] && status="❌ h3 ohne h2"

  HEADING_REPORT+="| $fname | h1:$h1_count h2:$h2_count h3:$h3_count | $status |\n"
done

# ── 6. Große Bilder (>500 KB) ──────────────────────────────────
echo "▶ Suche große Bilder (>500 KB)..."
BIG_IMG_REPORT=""
BIG_IMG_COUNT=0

while IFS= read -r img; do
  size_bytes=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null || echo 0)
  if [[ "$size_bytes" -gt 512000 ]]; then
    size_kb=$((size_bytes / 1024))
    rel_path="${img#$PROJECT_DIR/}"
    BIG_IMG_REPORT+="| $rel_path | ${size_kb} KB |\n"
    BIG_IMG_COUNT=$((BIG_IMG_COUNT + 1))
  fi
done < <(find "$PROJECT_DIR/img" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) 2>/dev/null)

# ── Report schreiben ───────────────────────────────────────────
echo "▶ Schreibe Report..."

cat > "$REPORT" << REPORT_EOF
# SEO Auto-Audit — DeineFenster.de
**Datum:** $DATE
**Tool:** seo-auto-audit.sh (automatisiert)
**Baseline:** SEO-AUDIT-2026-05-05.md

---

## Lighthouse Scores

| Kategorie | Score | Ziel |
|-----------|-------|------|
| Performance | $LH_PERF | ≥ 90 |
| Accessibility | $LH_A11Y | ≥ 95 |
| Best Practices | $LH_BP | ≥ 95 |
| SEO | $LH_SEO | 100 |
| LCP | $LH_LCP | < 2.5s |
| CLS | $LH_CLS | < 0.1 |
| TBT | $LH_TBT | < 200ms |

---

## Bilder ohne Alt-Text ($TOTAL_MISSING gesamt)

| Datei | Fehlend / Gesamt |
|-------|------------------|
$(echo -e "$ALT_REPORT")

---

## Title-Tag-Längen (Ziel: 30-60 Zeichen)

| Datei | Länge | Status |
|-------|-------|--------|
$(echo -e "$TITLE_REPORT")

---

## Meta-Description-Längen (Ziel: 70-160 Zeichen)

| Datei | Länge | Status |
|-------|-------|--------|
$(echo -e "$DESC_REPORT")

---

## Heading-Hierarchie

| Datei | Headings | Status |
|-------|----------|--------|
$(echo -e "$HEADING_REPORT")

---

## Große Bilder >500 KB ($BIG_IMG_COUNT Dateien)

| Pfad | Größe |
|------|-------|
$(echo -e "$BIG_IMG_REPORT")

---

*Generiert: $DATE | Nächster Audit: manuell oder per Cron*
REPORT_EOF

echo ""
echo "═══════════════════════════════════════"
echo "✅ Report geschrieben: $REPORT"
echo "   Bilder ohne Alt: $TOTAL_MISSING"
echo "   Große Bilder:    $BIG_IMG_COUNT"
echo "═══════════════════════════════════════"
