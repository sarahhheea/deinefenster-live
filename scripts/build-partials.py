#!/usr/bin/env python3
"""build-partials.py — Rendert gemeinsame HTML-Partials in alle Seiten.

Setup:
  - Partials liegen in partials/<name>.html
  - Im Partial steht {{ROOT}} als Platzhalter für den relativen Pfad zur Repo-Root
  - In jeder HTML-Seite markieren Kommentare den Einsetz-Punkt:
      <!-- PARTIAL:topbar START -->
      ... (alter Inhalt wird ersetzt) ...
      <!-- PARTIAL:topbar END -->

Usage:
  scripts/build-partials.py           # baut alle Seiten neu
  scripts/build-partials.py --check   # exit 1 wenn drift erkannt (für Pre-Push)
  scripts/build-partials.py --file shop.html   # nur eine Seite
"""
import sys
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS_DIR = ROOT / "partials"

EXCLUDE_SUBSTRINGS = [
    "_archive/", "node_modules/", ".playwright-mcp/",
    "_backup", "BILDER-VERGLEICH", "MASTER-COMPARE",
    "css-filter-test", "haustuer-recolor", "img-test/",
    "preview-karten", "farben-vorschau", "logo-vorschlaege",
    "RECOLOR-PREVIEW", "haustuer-preview", "img-vergleich",
    "balkontuer-3d-multi", "fenster-3d-multi", "2fl_check",
    "email-templates/",
    "admin.html", "dashboard.html",
    "shop-einstellen.html", "shop-drucken.html", "shop-login.html",
]

MARKER_RE = re.compile(
    r"(<!--\s*PARTIAL:(?P<name>[\w-]+)\s+START\s*-->)"
    r"(?P<body>.*?)"
    r"(<!--\s*PARTIAL:(?P=name)\s+END\s*-->)",
    re.DOTALL,
)


def is_excluded(rel_path: pathlib.Path) -> bool:
    s = str(rel_path)
    return any(sub in s for sub in EXCLUDE_SUBSTRINGS)


def root_prefix_for(html_path: pathlib.Path) -> str:
    rel = html_path.relative_to(ROOT).parent
    depth = len(rel.parts)
    return "../" * depth


def load_partial(name: str) -> str | None:
    f = PARTIALS_DIR / f"{name}.html"
    if not f.exists():
        return None
    return f.read_text(encoding="utf-8")


def render_partial(name: str, html_path: pathlib.Path) -> str | None:
    raw = load_partial(name)
    if raw is None:
        return None
    return raw.replace("{{ROOT}}", root_prefix_for(html_path))


def process_file(html_path: pathlib.Path, check_only: bool = False):
    content = html_path.read_text(encoding="utf-8")
    original = content
    found_partials = []
    missing_partials = []

    def replace(m: re.Match) -> str:
        name = m.group("name")
        found_partials.append(name)
        rendered = render_partial(name, html_path)
        if rendered is None:
            missing_partials.append(name)
            return m.group(0)
        return f"{m.group(1)}\n{rendered}\n{m.group(4)}"

    content = MARKER_RE.sub(replace, content)

    changed = content != original
    if changed and not check_only:
        html_path.write_text(content, encoding="utf-8")
    return {
        "found": found_partials,
        "missing": missing_partials,
        "changed": changed,
    }


def find_html_files(filter_name: str | None = None):
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
    check_only = "--check" in sys.argv
    filter_name = None
    if "--file" in sys.argv:
        i = sys.argv.index("--file")
        filter_name = sys.argv[i + 1] if i + 1 < len(sys.argv) else None

    files = find_html_files(filter_name)
    if not files:
        print("Keine HTML-Dateien gefunden (filter:", filter_name, ")")
        sys.exit(1)

    drift = []
    touched = 0
    skipped = 0
    missing_total = set()

    for f in files:
        rel = f.relative_to(ROOT)
        result = process_file(f, check_only)
        if not result["found"]:
            skipped += 1
            continue
        missing_total.update(result["missing"])
        if check_only and result["changed"]:
            drift.append(rel)
        elif result["changed"]:
            touched += 1
            print(f"  ✓ {rel} [{', '.join(result['found'])}]")

    if missing_total:
        print(f"\n⚠️  Fehlende Partials: {sorted(missing_total)}")

    if check_only:
        if drift:
            print("\n❌ Drift erkannt in:")
            for f in drift:
                print(f"  - {f}")
            sys.exit(1)
        print(f"✓ {len(files)} Dateien geprüft — Partials in Sync (markiert: {len(files) - skipped})")
    else:
        print(f"\n✓ {touched} Dateien gebaut · {skipped} ohne Marker übersprungen · {len(files)} gescannt")


if __name__ == "__main__":
    main()
