"""Vereinheitlicht den CSS-Loader-Block in allen öffentlichen HTML-Seiten.

Ziel: jede Hauptseite lädt:
  tailwind.css → nav.css → global-design.css → premium.css
in dieser Reihenfolge, mit identischer Versionsnummer.

Wirkt nur auf <link rel="stylesheet" href="css/(tailwind|nav|global-design|premium).css..."/>.
Andere Stylesheets (cookie-banner, produktseiten, custom-fonts) bleiben unangetastet.
"""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parent.parent
VERSION = "2026-05-22"

# Liste aller öffentlichen HTML-Seiten — KEINE backups, _archive, test-files
EXCLUDE_PATTERNS = ("backup", "_archive", "haustuer-recolor.html",
                    "BILDER-VERGLEICH", "MASTER-COMPARE", "css-filter-test.html")

TARGET_CSS = ["tailwind.css", "nav.css", "global-design.css", "premium.css"]

# Pattern matched alle 4 CSS-Links (auch wenn nur einige da sind)
ONE_LINK = re.compile(
    r'\n?\s*<link\s+rel="stylesheet"\s+href="css/(tailwind|nav|global-design|premium)\.css(?:\?v=[^"]*)?"\s*/>\s*\n?',
    re.IGNORECASE
)


def unified_block(indent: str = "  ") -> str:
    """Standard CSS-Block der eingefügt wird."""
    lines = [
        f'{indent}<link rel="stylesheet" href="css/{name}?v={VERSION}"/>'
        for name in TARGET_CSS
    ]
    return "\n".join(lines)


def get_html_files() -> list[Path]:
    files = []
    for p in ROOT.glob("*.html"):
        n = p.name.lower()
        if any(x.lower() in n for x in EXCLUDE_PATTERNS):
            continue
        files.append(p)
    # Auch ratgeber/, produkte/, etc.
    for sub in ("ratgeber", "produkte"):
        d = ROOT / sub
        if d.exists():
            files.extend(p for p in d.glob("*.html")
                         if not any(x.lower() in p.name.lower() for x in EXCLUDE_PATTERNS))
    return files


def process(html: str) -> tuple[str, int]:
    """Findet alle 4-CSS-Link-Stellen und ersetzt sie durch den einheitlichen Block.
    Returns (new_html, changes)."""
    matches = list(ONE_LINK.finditer(html))
    if not matches:
        return html, 0
    # Find der erste Match-Start und der letzte Match-End → ersetze alles dazwischen mit unified
    start = matches[0].start()
    end = matches[-1].end()
    # Erkenne Einrückung anhand des ersten Matches
    line_start = html.rfind("\n", 0, start) + 1
    indent_match = re.match(r"\s*", html[line_start:start])
    indent = indent_match.group(0) if indent_match else "  "
    block = unified_block(indent=indent)
    new = html[:start].rstrip(" \t") + "\n" + block + "\n" + html[end:].lstrip(" \t\n")
    return new, len(matches)


def main():
    files = get_html_files()
    print(f"Verarbeite {len(files)} HTML-Dateien")
    dry_run = "--dry" in sys.argv
    total_changed = 0
    for fp in sorted(files):
        try:
            text = fp.read_text(encoding="utf-8")
            new, n = process(text)
            rel = fp.relative_to(ROOT)
            if n == 0:
                print(f"  SKIP {rel}  (keine CSS-Loader gefunden)")
                continue
            if new == text:
                print(f"  OK   {rel}  (schon einheitlich)")
                continue
            if not dry_run:
                fp.write_text(new, encoding="utf-8")
            print(f"  CHG  {rel}  ({n} Links ersetzt)")
            total_changed += 1
        except Exception as e:
            print(f"  ERR  {fp}: {e}")
    mode = "(dry-run)" if dry_run else ""
    print(f"\nGesamt geändert: {total_changed} {mode}")


if __name__ == "__main__":
    main()
