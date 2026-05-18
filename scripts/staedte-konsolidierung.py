#!/usr/bin/env python3
"""Doorway-Page-Risiko mitigieren: 99 deutsche Städte → 25 behalten, 74 noindex.

WAS DIESES SKRIPT MACHT:
  - Setzt <meta name="robots" content="noindex,follow"/> in alle Städte-Pages
    AUSSER den 25 ausgewählten (Brandenburg-Region + Top-Großstädte)
  - Lässt die Dateien bestehen (interne Links bleiben funktionsfähig)
  - Aktualisiert sitemap.xml — entfernt noindex-Pages

WAS DIESES SKRIPT NICHT MACHT:
  - Keine Dateien löschen
  - Keine Inhalts-Änderungen außer dem robots-Tag
  - Keine Aufwertung des unique Contents auf den 25 behaltenden (kommt in Phase 2)

WARUM:
  local-service.md Template warnt HARD STOP bei 50+ Städte-Pages.
  Wir hatten 198 → akutes Google-Doorway-Page-Risiko.
  Nach diesem Skript: 50 echte Pages im Index (25 Städte × 2 Page-Typen),
  148 Pages mit noindex aus dem Index entfernt aber funktional erhalten.
"""
from pathlib import Path
import re
import sys

STAEDTE_DIR = Path(__file__).parent.parent / "staedte"
SITEMAP_PATH = Path(__file__).parent.parent / "sitemap.xml"

# 25 Städte die im Index BLEIBEN (Brandenburg-Region + echte Großstadt-Reichweite)
BEHALTEN = {
    # Brandenburg-Region + Nachbar-Bundesländer (8)
    "brandenburg-an-der-havel",  # Heimat — Pflicht
    "berlin",
    "potsdam",
    "cottbus",
    "frankfurt-oder",
    "magdeburg",
    "dessau-rosslau",
    "halle-saale",
    # Mitteldeutsche Großstädte (3)
    "leipzig",
    "dresden",
    "erfurt",
    # Top-10 deutsche Großstädte nach Einwohnern (10)
    "hamburg",
    "muenchen",
    "koeln",
    "frankfurt-am-main",
    "stuttgart",
    "duesseldorf",
    "bremen",
    "hannover",
    "nuernberg",
    "essen",
    # Wirtschaftsstarke Sekundär-Großstädte (4)
    "dortmund",
    "mannheim",
    "karlsruhe",
    "wiesbaden",
}
assert len(BEHALTEN) == 25, f"Erwartet 25 Städte, sind {len(BEHALTEN)}"

# Marker — wenn das robots-Tag schon drin ist, nicht doppelt einfügen
NOINDEX_MARKER = 'content="noindex,follow"'
NOINDEX_TAG = '<meta name="robots" content="noindex,follow"/>\n'

def process_html(path: Path) -> str:
    """Returns: 'noindex-added', 'already-noindex', 'kept-indexed', 'no-head'."""
    slug = path.stem.replace("fenster-", "").replace("gebrauchte-", "")
    if slug in BEHALTEN:
        # Wenn vorher mal noindex gesetzt wurde → wieder entfernen
        content = path.read_text(encoding="utf-8")
        if NOINDEX_MARKER in content:
            new_content = re.sub(
                r'<meta name="robots" content="noindex,follow"/>\s*\n?', "", content
            )
            path.write_text(new_content, encoding="utf-8")
            return "kept-indexed (noindex removed)"
        return "kept-indexed"

    content = path.read_text(encoding="utf-8")
    if NOINDEX_MARKER in content:
        return "already-noindex"

    # Füge robots-Tag direkt nach <head> ein
    if "<head>" not in content:
        return "no-head"
    new_content = content.replace(
        "<head>",
        "<head>\n" + NOINDEX_TAG.rstrip(),
        1,
    )
    path.write_text(new_content, encoding="utf-8")
    return "noindex-added"


def main():
    stats = {"noindex-added": 0, "already-noindex": 0, "kept-indexed": 0,
             "kept-indexed (noindex removed)": 0, "no-head": 0}
    pages = sorted(STAEDTE_DIR.glob("*.html"))
    print(f"\n{len(pages)} Städte-Pages gefunden.\n")
    for p in pages:
        result = process_html(p)
        stats[result] += 1

    print("Ergebnis:")
    for k, v in stats.items():
        print(f"  {v:4d}  {k}")
    print(f"\n→ {len(BEHALTEN)} Städte behalten ({stats['kept-indexed'] + stats['kept-indexed (noindex removed)']} Pages indexierbar)")
    print(f"→ {99 - len(BEHALTEN)} Städte noindex ({stats['noindex-added'] + stats['already-noindex']} Pages aus Google-Index entfernt)")

    # ────── Sitemap aufräumen ──────
    if SITEMAP_PATH.exists():
        sitemap = SITEMAP_PATH.read_text(encoding="utf-8")
        # Entferne <url>...staedte/(fenster|gebrauchte-fenster)-<noindex-slug>...</url> blocks
        removed = 0
        for slug in [p.stem.replace("fenster-", "").replace("gebrauchte-", "")
                     for p in pages]:
            if slug in BEHALTEN:
                continue
            # Pattern: <url> ... staedte/X-slug.html ... </url>
            for prefix in ("fenster-", "gebrauchte-fenster-"):
                page_path = f"staedte/{prefix}{slug}.html"
                pattern = re.compile(
                    r"\s*<url>[^<]*<loc>[^<]*" + re.escape(page_path) +
                    r"[^<]*</loc>.*?</url>", re.DOTALL,
                )
                new_sitemap, count = pattern.subn("", sitemap)
                if count > 0:
                    sitemap = new_sitemap
                    removed += count
        SITEMAP_PATH.write_text(sitemap, encoding="utf-8")
        print(f"\nSitemap.xml aktualisiert: {removed} URLs entfernt.")
    else:
        print(f"\nWARN: sitemap.xml nicht gefunden ({SITEMAP_PATH})")


if __name__ == "__main__":
    main()
