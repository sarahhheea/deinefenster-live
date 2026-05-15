"""
Zentrale Farbkonfiguration für die Drutex Bild-Matrix Pipeline.
Single source of truth — wird von recolor-lab.py, validate-bilder.py und generate-all.sh importiert.

Sync-Quelle: COLOR_HEX in konfigurator.html
"""

# ---------------------------------------------------------------------------
# Kategorie-Konstanten
# ---------------------------------------------------------------------------
KATEGORIE_WEISS = "weiss"
KATEGORIE_UNI = "uni"
KATEGORIE_HOLZ = "holzdekor"
KATEGORIE_METALLIC = "metallic"
KATEGORIE_SPEZIAL = "spezial"

# ---------------------------------------------------------------------------
# Alle 45 Drutex-Farben
# Hinweis: 'sonder' ist ein Platzhalter für RAL-Sonderfarben und wird NICHT aufgeführt.
# ---------------------------------------------------------------------------
FARBEN: dict[str, dict] = {
    # ── Weiß-Gruppe ────────────────────────────────────────────────────────
    "weiss":        {"hex": "#ffffff", "kategorie": KATEGORIE_WEISS},
    "cremeweiss":   {"hex": "#f0ebe0", "kategorie": KATEGORIE_WEISS},
    "weiss-fx":     {"hex": "#ffffff", "kategorie": KATEGORIE_WEISS},

    # ── Uni-Grau-Gruppe ────────────────────────────────────────────────────
    "achatgrau":    {"hex": "#888888", "kategorie": KATEGORIE_UNI},
    "lichtgrau":    {"hex": "#b0b0b0", "kategorie": KATEGORIE_UNI},
    "signalgrau":   {"hex": "#636363", "kategorie": KATEGORIE_UNI},
    "betongrau":    {"hex": "#525252", "kategorie": KATEGORIE_UNI},
    "quarzgr-gl":   {"hex": "#4a4a4a", "kategorie": KATEGORIE_UNI},
    "quarzgr-sa":   {"hex": "#4a4a4a", "kategorie": KATEGORIE_UNI},
    "basaltgr-gl":  {"hex": "#3a3a3a", "kategorie": KATEGORIE_UNI},
    "basaltgr-sa":  {"hex": "#3a3a3a", "kategorie": KATEGORIE_UNI},
    "schiefgr-gl":  {"hex": "#323232", "kategorie": KATEGORIE_UNI},
    "schiefgr-sa":  {"hex": "#323232", "kategorie": KATEGORIE_UNI},
    "anthrazit":    {"hex": "#2d2d2d", "kategorie": KATEGORIE_UNI},
    "anthraz-gl":   {"hex": "#2a2a2a", "kategorie": KATEGORIE_UNI},
    "anthraz-um":   {"hex": "#252525", "kategorie": KATEGORIE_UNI},
    "schwarz-um":   {"hex": "#111111", "kategorie": KATEGORIE_UNI},
    "schwarzbr":    {"hex": "#1a1510", "kategorie": KATEGORIE_UNI},

    # ── Metallic-Gruppe ────────────────────────────────────────────────────
    "alux-db":      {"hex": "#5a5a5a", "kategorie": KATEGORIE_METALLIC},
    "alu-gebr":     {"hex": "#909090", "kategorie": KATEGORIE_METALLIC},
    "eisengl":      {"hex": "#383838", "kategorie": KATEGORIE_METALLIC},
    "crown-plat":   {"hex": "#c2c2c2", "kategorie": KATEGORIE_METALLIC},

    # ── Holzdekor-Gruppe (18 Holzfarben) ───────────────────────────────────
    "sheffield":    {"hex": "#8a6a40", "kategorie": KATEGORIE_HOLZ},
    "winchester":   {"hex": "#6a4520", "kategorie": KATEGORIE_HOLZ},
    "eiche-hell":   {"hex": "#b08050", "kategorie": KATEGORIE_HOLZ},
    "eiche-nat":    {"hex": "#9a6830", "kategorie": KATEGORIE_HOLZ},
    "golden-oak":   {"hex": "#7a3b1e", "kategorie": KATEGORIE_HOLZ},
    "nussbaum":     {"hex": "#5a3018", "kategorie": KATEGORIE_HOLZ},
    "mooreiche":    {"hex": "#3a1e0c", "kategorie": KATEGORIE_HOLZ},
    "dunkleiche":   {"hex": "#2a1408", "kategorie": KATEGORIE_HOLZ},
    "siena-noce":   {"hex": "#6a4025", "kategorie": KATEGORIE_HOLZ},
    "siena-ross":   {"hex": "#5a2818", "kategorie": KATEGORIE_HOLZ},
    "mahagoni":     {"hex": "#4a1c0c", "kategorie": KATEGORIE_HOLZ},
    "macore":       {"hex": "#4a1a0a", "kategorie": KATEGORIE_HOLZ},
    "oregon":       {"hex": "#b08550", "kategorie": KATEGORIE_HOLZ},
    "douglasie":    {"hex": "#a07840", "kategorie": KATEGORIE_HOLZ},
    "bergkiefer":   {"hex": "#c09860", "kategorie": KATEGORIE_HOLZ},
    "teak":         {"hex": "#7a5020", "kategorie": KATEGORIE_HOLZ},
    "schoko-br":    {"hex": "#3a1810", "kategorie": KATEGORIE_HOLZ},
    "braun-mar":    {"hex": "#4a2818", "kategorie": KATEGORIE_HOLZ},

    # ── Uni-Farben (Bunt) ─────────────────────────────────────────────────
    "moosgruen":    {"hex": "#2a4a1a", "kategorie": KATEGORIE_UNI},
    "dunkelgr":     {"hex": "#1e3a14", "kategorie": KATEGORIE_UNI},
    "dunkelrot":    {"hex": "#502020", "kategorie": KATEGORIE_UNI},
    "brillblau":    {"hex": "#1e3860", "kategorie": KATEGORIE_UNI},
    "stahlblau":    {"hex": "#1a3050", "kategorie": KATEGORIE_UNI},

    # ── Spezial-Gruppe ────────────────────────────────────────────────────
    "piryt":        {"hex": "#6a6a58", "kategorie": KATEGORIE_SPEZIAL},
    "jet-black":    {"hex": "#0a0a0a", "kategorie": KATEGORIE_SPEZIAL},
    "deep-bronze":  {"hex": "#3a2a18", "kategorie": KATEGORIE_SPEZIAL},
    "grafitgr":     {"hex": "#2a2a28", "kategorie": KATEGORIE_SPEZIAL},
}

# ---------------------------------------------------------------------------
# Sonder-Sets
# ---------------------------------------------------------------------------
# Farben, die kein Recoloring brauchen (identisch mit Basis-Weiß)
SKIP_RECOLOR: set[str] = {"weiss", "weiss-fx"}

# Farben, die nur leichte Tönung bekommen (kein vollständiges LAB-Mapping)
LEICHTE_TOENUNG: set[str] = {"cremeweiss"}

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    """Konvertiert einen Hex-Farbwert (mit oder ohne '#') in ein RGB-Tupel."""
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def get_recolor_farben() -> dict[str, dict]:
    """Gibt alle Farben zurück, die aktiv recoloriert werden müssen (ohne SKIP_RECOLOR)."""
    return {key: val for key, val in FARBEN.items() if key not in SKIP_RECOLOR}


# ---------------------------------------------------------------------------
# Quick-Check beim direkten Aufruf
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    recolor = get_recolor_farben()
    print(f"{len(FARBEN)} Farben, {len(recolor)} zum Recoloring")
    print()
    for kat in [KATEGORIE_WEISS, KATEGORIE_UNI, KATEGORIE_METALLIC, KATEGORIE_HOLZ, KATEGORIE_SPEZIAL]:
        gruppe = [k for k, v in FARBEN.items() if v["kategorie"] == kat]
        print(f"  {kat:12s}: {len(gruppe):2d} Farben — {', '.join(gruppe)}")
