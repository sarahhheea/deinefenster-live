#!/usr/bin/env python3
"""Alt-Text-Audit: zählt alle <img> ohne alt-Attribut auf öffentlichen Seiten.

BFSG-Pflicht ab 28.06.2025 für B2C-Websites + SEO-Plus.

Ausgeschlossen werden alle Seiten die in robots.txt mit Disallow gelistet
sind (Admin / Test / Backup / Vergleich) — die werden eh nicht indexiert.
"""
from pathlib import Path
import re
import json

ROOT = Path(__file__).parent.parent

# robots.txt einlesen für Disallow-Liste
robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
DISALLOWED = set()
for line in robots.splitlines():
    line = line.strip()
    if line.startswith("Disallow: /"):
        path = line[len("Disallow: /"):]
        # Pfade die mit / enden = Verzeichnisse
        DISALLOWED.add(path.rstrip("/"))

# Regex: <img ... > tag — captures src + alt-Attribut
IMG_RE = re.compile(
    r'<img\b([^>]*)>',
    re.IGNORECASE,
)
ALT_RE = re.compile(r'\balt\s*=\s*"([^"]*)"', re.IGNORECASE)
SRC_RE = re.compile(r'\bsrc\s*=\s*"([^"]+)"', re.IGNORECASE)

def is_public(filename: str) -> bool:
    """Skip Backups, Tests, internal files."""
    if filename in DISALLOWED:
        return False
    # Pattern-based exclusions
    skip_patterns = ["backup", "BILDER-VERGLEICH", "MASTER-COMPARE",
                     "vergleich", "test", "RECOLOR", "logo-vorschlaege"]
    return not any(p in filename.lower() for p in skip_patterns)


def audit(html_path: Path):
    content = html_path.read_text(encoding="utf-8")
    imgs = IMG_RE.findall(content)
    missing = []
    total = 0
    for img_attrs in imgs:
        total += 1
        alt_match = ALT_RE.search(img_attrs)
        src_match = SRC_RE.search(img_attrs)
        if not alt_match or not alt_match.group(1).strip():
            missing.append({
                "src": src_match.group(1) if src_match else "(kein src!)",
                "has_alt": bool(alt_match),
            })
    return total, missing


def main():
    results = []
    html_files = sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("ratgeber/*.html")) + sorted(ROOT.glob("staedte/*.html"))
    for f in html_files:
        rel = f.relative_to(ROOT).as_posix()
        if not is_public(rel):
            continue
        total, missing = audit(f)
        if missing:
            results.append({"file": rel, "total": total, "missing_count": len(missing), "missing": missing[:5]})

    grand_total = sum(r["missing_count"] for r in results)
    print(f"\n=== Alt-Text-Audit (öffentliche Seiten) ===\n")
    print(f"Gesamtzahl Bilder ohne alt: {grand_total}\n")
    print(f"{'Datei':<50} {'Fehlt':>6} {'Gesamt':>8}")
    print("-" * 70)
    for r in sorted(results, key=lambda x: -x["missing_count"]):
        print(f"{r['file']:<50} {r['missing_count']:>6} {r['total']:>8}")
    return results, grand_total


if __name__ == "__main__":
    main()
