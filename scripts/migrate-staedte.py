#!/usr/bin/env python3
"""migrate-staedte.py — Migriert staedte/*.html auf die Master-Nav.

Ersetzt die schlanke Mini-Nav + Mini-Footer durch Partial-Marker und
ergänzt die benötigten CSS/Font-Links (nav.css, material-symbols).

Strategie:
- <!-- Navbar minimal --> bis </nav>  → Topbar+Mainnav-Marker
- <!-- Footer minimal --> bis </footer>  → Footer-Marker
- Im <head>: nav.css + material-symbols-link einfügen falls noch nicht da

Usage:
  scripts/migrate-staedte.py --dry-run
  scripts/migrate-staedte.py
  scripts/migrate-staedte.py --file staedte/fenster-berlin.html
"""
import sys
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
STAEDTE_DIR = ROOT / "staedte"

NEW_NAV_BLOCK = (
    "<!-- PARTIAL:topbar START -->\n"
    "<!-- PARTIAL:topbar END -->\n"
    "<!-- PARTIAL:mainnav START -->\n"
    "<!-- PARTIAL:mainnav END -->\n"
    '<div style="height:115px" aria-hidden="true"></div>  <!-- Spacer für fixed Master-Nav (Topbar 34px + Nav ~81px) -->'
)

NEW_FOOTER_BLOCK = (
    "<!-- PARTIAL:footer START -->\n"
    "<!-- PARTIAL:footer END -->"
)

NAV_PATTERN = re.compile(
    r"\s*<!-- Navbar minimal -->\s*<nav style=\".*?\".*?</nav>",
    re.DOTALL,
)
FOOTER_PATTERN = re.compile(
    r"\s*<!-- Footer minimal -->\s*<footer style=\".*?\".*?</footer>",
    re.DOTALL,
)

CSS_LINK_NAV = '<link rel="stylesheet" href="../css/nav.css?v=2026-05-22"/>'
CSS_LINK_FONT = '<link rel="stylesheet" href="../fonts/material-symbols.css"/>'


def migrate(path: pathlib.Path, dry_run: bool) -> dict:
    content = path.read_text(encoding="utf-8")
    original = content
    notes = []

    # 1. Nav-Block ersetzen (falls noch nicht migriert)
    if "PARTIAL:mainnav" in content:
        notes.append("nav: schon markiert")
    else:
        new_content, n = NAV_PATTERN.subn(f"\n{NEW_NAV_BLOCK}", content)
        if n == 0:
            notes.append("nav: Pattern nicht gefunden")
        else:
            notes.append(f"nav: ersetzt ({n}×)")
            content = new_content

    # 1b. Spacer-Div für fixed Master-Nav (idempotent)
    if "Spacer für fixed Master-Nav" not in content and "PARTIAL:mainnav END" in content:
        spacer = '\n<div style="height:115px" aria-hidden="true"></div>  <!-- Spacer für fixed Master-Nav (Topbar 34px + Nav ~81px) -->'
        content = content.replace(
            "<!-- PARTIAL:mainnav END -->",
            f"<!-- PARTIAL:mainnav END -->{spacer}",
            1,
        )
        notes.append("spacer: hinzugefügt")

    # 2. Footer-Block ersetzen
    if "PARTIAL:footer" in content:
        notes.append("footer: schon markiert")
    else:
        new_content, n = FOOTER_PATTERN.subn(f"\n{NEW_FOOTER_BLOCK}", content)
        if n == 0:
            notes.append("footer: Pattern nicht gefunden")
        else:
            notes.append(f"footer: ersetzt ({n}×)")
            content = new_content

    # 3. CSS/Font-Links im Head einfügen falls fehlend
    if "css/nav.css" not in content and "../css/nav.css" not in content:
        # Nach tailwind.css einfügen
        content = content.replace(
            '<link rel="stylesheet" href="../css/tailwind.css"/>',
            f'<link rel="stylesheet" href="../css/tailwind.css"/>\n  {CSS_LINK_NAV}',
            1,
        )
        notes.append("nav.css: link hinzugefügt")
    else:
        notes.append("nav.css: schon vorhanden")

    if "material-symbols.css" not in content:
        content = content.replace(
            '<link rel="stylesheet" href="../css/tailwind.css"/>',
            f'<link rel="stylesheet" href="../css/tailwind.css"/>\n  {CSS_LINK_FONT}',
            1,
        )
        notes.append("material-symbols: link hinzugefügt")
    else:
        notes.append("material-symbols: schon vorhanden")

    changed = content != original
    if changed and not dry_run:
        path.write_text(content, encoding="utf-8")
    return {"changed": changed, "notes": notes}


def main():
    dry_run = "--dry-run" in sys.argv
    file_args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if file_args:
        files = [pathlib.Path(f).resolve() for f in file_args]
    else:
        files = sorted(STAEDTE_DIR.glob("*.html"))

    changed_count = 0
    for f in files:
        if not f.exists():
            print(f"  ✗ {f} — nicht gefunden")
            continue
        r = migrate(f, dry_run)
        prefix = "[DRY]" if dry_run else "[WRITE]" if r["changed"] else "[SKIP]"
        if r["changed"]:
            changed_count += 1
        print(f"{prefix} {f.relative_to(ROOT)} · {'; '.join(r['notes'])}")

    print(f"\n{'[DRY] würde ändern' if dry_run else 'Geändert'}: {changed_count}/{len(files)}")


if __name__ == "__main__":
    main()
