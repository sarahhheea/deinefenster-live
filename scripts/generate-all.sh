#!/usr/bin/env bash
# DeineFenster.de — Pipeline Orchestrierung
# Recolor → Flip → Validate für alle Produkt-Gruppen
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FARBEN_DIR="$PROJECT_DIR/img/farben"
RECOLOR="$SCRIPT_DIR/recolor-lab.py"
FLIP="$SCRIPT_DIR/flip-anschlag.py"
VALIDATE="$SCRIPT_DIR/validate-bilder.py"

# ─── DRY-RUN Mode ────────────────────────────────────────────────────────────
DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=1
    shift
fi

run() {
    if [[ $DRY_RUN -eq 1 ]]; then
        echo "[DRY] $*"
    else
        "$@"
    fi
}

# ─── Helper Functions ─────────────────────────────────────────────────────────
run_recolor() {
    local master="$1" prefix="$2"
    if [ ! -f "$master" ]; then
        echo "  [SKIP] Master nicht gefunden: $master"
        return 0
    fi
    echo "═══ RECOLOR: $prefix ═══"
    run python3 "$RECOLOR" "$master" "$FARBEN_DIR/" --alle --prefix "$prefix"
}

run_flip() {
    local pattern="$1" suffix="${2:-_rechts}"
    echo "═══ FLIP: $pattern → suffix $suffix ═══"
    run python3 "$FLIP" --batch "$FARBEN_DIR" --pattern "$pattern" --suffix "$suffix"
}

run_validate() {
    local pattern="$1"
    echo "═══ VALIDATE: $pattern ═══"
    # Smoke test: erste 5 Dateien die zum Pattern passen
    local files=()
    local count=0
    while IFS= read -r -d '' f && [[ $count -lt 5 ]]; do
        files+=("$f")
        (( count++ )) || true
    done < <(find "$FARBEN_DIR" -maxdepth 1 -name "${pattern}*.png" -print0 2>/dev/null)

    if [[ ${#files[@]} -eq 0 ]]; then
        echo "  [SKIP] Keine Dateien gefunden für Pattern: ${pattern}*.png"
        return 0
    fi
    run python3 "$VALIDATE" "${files[@]}"
}

# ─── Targets ──────────────────────────────────────────────────────────────────
target_fenster_1fl() {
    echo ""
    echo "████ TARGET: fenster-1fl ████"

    run_recolor "$PROJECT_DIR/img/fenster_standard_v4.png"      "fenster_1fl"
    run_recolor "$PROJECT_DIR/img/fenster_standard_grau_v4.png" "fenster_1fl_grau"
    run_recolor "$PROJECT_DIR/img/fenster_aussen_v4.png"        "fenster_1fl_aussen"

    run_flip "fenster_1fl_"      "_rechts"
    run_flip "fenster_1fl_grau_" "_rechts"

    run_validate "fenster_1fl_"
}

target_fenster_2fl() {
    echo ""
    echo "████ TARGET: fenster-2fl ████"

    run_recolor "$PROJECT_DIR/img/fenster_2fluegel_v4.png"        "fenster_2fl"
    run_recolor "$PROJECT_DIR/img/fenster_2fluegel_aussen_v4.png" "fenster_2fl_aussen"

    run_validate "fenster_2fl_"
}

target_balkontuer() {
    echo ""
    echo "████ TARGET: balkontuer ████"

    run_recolor "$PROJECT_DIR/img/balkontuer_standard_v4.png" "balkontuer_1fl"
    run_recolor "$PROJECT_DIR/img/balkontuer_aussen_v4.png"   "balkontuer_1fl_aussen"

    run_flip "balkontuer_1fl_" "_rechts"

    run_validate "balkontuer_1fl_"
}

target_haustuer() {
    echo ""
    echo "████ TARGET: haustuer ████"

    # Innen-Varianten: haustuer_modell_*_innen_v4.png
    while IFS= read -r -d '' master; do
        # Dateiname ohne Pfad und ohne Extension
        fname="$(basename "$master" .png)"
        # Modell extrahieren: haustuer_modell_<model>_innen_v4 → <model>
        model="${fname#haustuer_modell_}"
        model="${model%_innen_v4}"
        run_recolor "$master" "haustuer_innen_${model}"
    done < <(find "$PROJECT_DIR/img" -maxdepth 1 -name "haustuer_modell_*_innen_v4.png" -print0 2>/dev/null)

    # Außen-Varianten: haustuer_modell_*_aussen_v4.png
    while IFS= read -r -d '' master; do
        fname="$(basename "$master" .png)"
        model="${fname#haustuer_modell_}"
        model="${model%_aussen_v4}"
        run_recolor "$master" "haustuer_aussen_${model}"
    done < <(find "$PROJECT_DIR/img" -maxdepth 1 -name "haustuer_modell_*_aussen_v4.png" -print0 2>/dev/null)

    run_validate "haustuer_"
}

target_all() {
    target_fenster_1fl
    target_fenster_2fl
    target_balkontuer
    target_haustuer
}

# ─── Main ─────────────────────────────────────────────────────────────────────
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
    echo "Verwendung: $0 [--dry-run] {fenster-1fl|fenster-2fl|balkontuer|haustuer|all}"
    exit 1
fi

case "$TARGET" in
    fenster-1fl)  target_fenster_1fl ;;
    fenster-2fl)  target_fenster_2fl ;;
    balkontuer)   target_balkontuer  ;;
    haustuer)     target_haustuer    ;;
    all)          target_all         ;;
    *)
        echo "Unbekanntes Target: $TARGET"
        echo "Gültig: fenster-1fl | fenster-2fl | balkontuer | haustuer | all"
        exit 1
        ;;
esac

echo ""
echo "═══ FERTIG ═══"
