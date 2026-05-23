#!/usr/bin/env python3
"""migrate-components.py — Ersetzt häufige Inline-Patterns durch df-* Klassen.

Patterns:
1. Fraunces-Akzent-Spans → df-section-title-accent
2. Standard-Eyebrow (Linie + Mono-Caps) → df-eyebrow + df-eyebrow-text

Idempotent: prüft ob Klasse schon da, dann skip.

Usage:
  scripts/migrate-components.py --dry-run <files...>
  scripts/migrate-components.py <files...>
"""
import sys
import pathlib
import re


# Pattern 1: Fraunces-Inline-Span — komplett ersetzbar, kein visueller Unterschied
FRAUNCES_PATTERN = re.compile(
    r'<span style="font-family:[\'"]Fraunces[\'"],serif;'
    r'font-weight:500;font-style:italic;color:#76a9fa;">'
    r'([^<]+)'
    r'</span>'
)
FRAUNCES_REPLACE = r'<span class="df-section-title-accent">\1</span>'


# Pattern 2: Standard-Eyebrow mit Blau-Linie (verschiedene Tailwind-Varianten)
# Form: <div class="flex items-center gap-X mb-Y"> ... <span ... bg-[#76a9fa]></span> <span ... text-[#76a9fa] ...>TEXT</span> </div>
EYEBROW_PATTERNS = [
    # Variante A: Tailwind w-12 h-px + text-[#76a9fa] + tracking-[0.25em]
    (
        re.compile(
            r'<div class="flex items-center gap-3 mb-6">\s*'
            r'<span class="inline-block w-12 h-px bg-\[#76a9fa\]"></span>\s*'
            r'<span class="text-\[#76a9fa\] font-bold text-xs uppercase tracking-\[0\.25em\]">([^<]+)</span>\s*'
            r'</div>',
            re.DOTALL,
        ),
        r'<div class="df-eyebrow"><span class="df-eyebrow-text">\1</span></div>',
    ),
    # Variante B: w-10 md:w-16 h-px + tracking-[0.32em]
    (
        re.compile(
            r'<div class="flex items-center gap-4 mb-(?:6|8)">\s*'
            r'<span class="block w-10 md:w-16 h-px bg-\[#76a9fa\]"></span>\s*'
            r'<span class="text-\[11px\] md:text-xs font-bold text-\[#76a9fa\] uppercase" style="letter-spacing:0\.32em;">([^<]+)</span>\s*'
            r'</div>',
            re.DOTALL,
        ),
        r'<div class="df-eyebrow"><span class="df-eyebrow-text">\1</span></div>',
    ),
]


def process(path: pathlib.Path, dry_run: bool):
    content = path.read_text(encoding="utf-8")
    original = content
    counts = {"fraunces": 0, "eyebrow": 0}

    # Fraunces-Spans
    new_content, n = FRAUNCES_PATTERN.subn(FRAUNCES_REPLACE, content)
    counts["fraunces"] = n
    content = new_content

    # Eyebrows
    for pat, repl in EYEBROW_PATTERNS:
        new_content, n = pat.subn(repl, content)
        counts["eyebrow"] += n
        content = new_content

    changed = content != original
    if changed and not dry_run:
        path.write_text(content, encoding="utf-8")
    return {"changed": changed, "counts": counts}


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    files = [pathlib.Path(a).resolve() for a in args if not a.startswith("--")]

    if not files:
        print("Usage: migrate-components.py [--dry-run] <html files...>")
        sys.exit(1)

    total = {"fraunces": 0, "eyebrow": 0, "files": 0}
    for f in files:
        if not f.exists():
            print(f"  ✗ {f.name} — nicht gefunden")
            continue
        r = process(f, dry_run)
        prefix = "[DRY]" if dry_run else "[WRITE]" if r["changed"] else "[SKIP]"
        if r["changed"]:
            total["files"] += 1
        total["fraunces"] += r["counts"]["fraunces"]
        total["eyebrow"] += r["counts"]["eyebrow"]
        print(f"{prefix} {f.name} · fraunces={r['counts']['fraunces']} eyebrow={r['counts']['eyebrow']}")

    print(f"\nGesamt: {total['files']} Dateien · {total['fraunces']} Fraunces-Spans · {total['eyebrow']} Eyebrows ersetzt")


if __name__ == "__main__":
    main()
