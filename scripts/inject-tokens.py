#!/usr/bin/env python3
"""inject-tokens.py — Fügt tokens.css + components.css in alle HTML-Pages ein.

Strategie:
- Suche erstes <link rel="stylesheet"...> im File
- Füge davor zwei Links ein: tokens.css + components.css
- Pfad-Awareness: tier 0 = "css/", tier 1 = "../css/", tier 2 = "../../css/"
- Idempotent: skip wenn tokens.css schon drin

Usage:
  scripts/inject-tokens.py --dry-run
  scripts/inject-tokens.py
  scripts/inject-tokens.py --file index.html
"""
import sys
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

EXCLUDE_SUBSTRINGS = [
    "_archive/", "node_modules/", "worktrees/",
    "_backup", "-backup-", "BILDER-VERGLEICH", "MASTER-COMPARE",
    "css-filter-test", "haustuer-recolor", "img-test/",
    "preview-karten", "farben-vorschau", "logo-vorschlaege",
    "RECOLOR-PREVIEW", "haustuer-preview", "img-vergleich",
    "balkontuer-3d-multi", "fenster-3d-multi", "2fl_check",
    "email-templates/",
    "admin.html", "dashboard.html",
    "shop-einstellen.html", "shop-drucken.html", "shop-login.html",
    "style-showcase.html",  # showcase hat schon die CSS-Links
]


def is_excluded(rel_path: pathlib.Path) -> bool:
    # Hidden directories (Pfad-Komponente startet mit Punkt) ausschliessen
    if any(part.startswith(".") for part in rel_path.parts):
        return True
    s = str(rel_path)
    return any(sub in s for sub in EXCLUDE_SUBSTRINGS)


def css_prefix_for(html_path: pathlib.Path) -> str:
    rel = html_path.relative_to(ROOT).parent
    depth = len(rel.parts)
    return "../" * depth


def process(path: pathlib.Path, dry_run: bool):
    content = path.read_text(encoding="utf-8")
    if "tokens.css" in content:
        return False, "schon vorhanden"

    match = re.search(r'<link rel="stylesheet"', content)
    if not match:
        return False, "kein <link rel='stylesheet'> gefunden"

    prefix = css_prefix_for(path)

    # Indent vor dem ersten Link-Tag rekonstruieren
    line_start = content.rfind("\n", 0, match.start()) + 1
    indent = content[line_start:match.start()]

    new_lines = (
        f'<link rel="stylesheet" href="{prefix}css/tokens.css?v=2026-05-23"/>\n'
        f'{indent}<link rel="stylesheet" href="{prefix}css/components.css?v=2026-05-23"/>\n'
        f'{indent}'
    )

    new_content = content[:match.start()] + new_lines + content[match.start():]

    if not dry_run:
        path.write_text(new_content, encoding="utf-8")
    return True, f"prefix={prefix or 'root'}"


def find_html_files(filter_name=None):
    files = []
    for p in ROOT.rglob("*.html"):
        rel = p.relative_to(ROOT)
        if is_excluded(rel):
            continue
        if filter_name and p.name != filter_name and str(rel) != filter_name:
            continue
        files.append(p)
    return sorted(files)


def main():
    dry_run = "--dry-run" in sys.argv
    filter_name = None
    if "--file" in sys.argv:
        i = sys.argv.index("--file")
        if i + 1 < len(sys.argv):
            filter_name = sys.argv[i + 1]

    files = find_html_files(filter_name)
    changed = 0
    skipped = 0
    not_found = 0

    for f in files:
        ok, msg = process(f, dry_run)
        rel = f.relative_to(ROOT)
        if ok:
            changed += 1
            if changed <= 5 or changed % 50 == 0:
                print(f"  ✓ {rel} · {msg}")
        elif "schon" in msg:
            skipped += 1
        else:
            not_found += 1
            if not_found <= 5:
                print(f"  · {rel} · {msg}")

    mode = "[DRY] würde ändern" if dry_run else "Geändert"
    print(f"\n{mode}: {changed}/{len(files)} · schon vorhanden: {skipped} · nicht gefunden: {not_found}")


if __name__ == "__main__":
    main()
