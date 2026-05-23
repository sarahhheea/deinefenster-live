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
# Pattern 3 (Städte-Pages): H1-Akzent nach <br/> (NICHT Logo im Footer)
STAEDTE_ACCENT_PATTERN = re.compile(
    r'<br/>\s*\n(\s+)<span style="color:#76a9fa;">([^<]+)</span>',
)
STAEDTE_ACCENT_REPLACE = r'<br/>\n\1<span class="df-section-title-accent">\2</span>'


# Pattern 4 (Städte-Pages): .badge mit Lokal-CSS → df-pill
STAEDTE_BADGE_PATTERN = re.compile(
    r'<span class="badge" style="margin-bottom:16px;display:inline-flex;">([^<]+)</span>',
)
STAEDTE_BADGE_REPLACE = r'<span class="df-pill" style="margin-bottom:16px;">\1</span>'


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
    counts = {"fraunces": 0, "eyebrow": 0, "staedte_accent": 0, "staedte_badge": 0}

    # Fraunces-Spans
    new_content, n = FRAUNCES_PATTERN.subn(FRAUNCES_REPLACE, content)
    counts["fraunces"] = n
    content = new_content

    # Eyebrows
    for pat, repl in EYEBROW_PATTERNS:
        new_content, n = pat.subn(repl, content)
        counts["eyebrow"] += n
        content = new_content

    # Städte-Akzent + Badge
    new_content, n = STAEDTE_ACCENT_PATTERN.subn(STAEDTE_ACCENT_REPLACE, content)
    counts["staedte_accent"] = n
    content = new_content

    new_content, n = STAEDTE_BADGE_PATTERN.subn(STAEDTE_BADGE_REPLACE, content)
    counts["staedte_badge"] = n
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

    total = {"fraunces": 0, "eyebrow": 0, "staedte_accent": 0, "staedte_badge": 0, "files": 0}
    for f in files:
        if not f.exists():
            print(f"  ✗ {f.name} — nicht gefunden")
            continue
        r = process(f, dry_run)
        prefix = "[DRY]" if dry_run else "[WRITE]" if r["changed"] else "[SKIP]"
        if r["changed"]:
            total["files"] += 1
        for k in ("fraunces", "eyebrow", "staedte_accent", "staedte_badge"):
            total[k] += r["counts"][k]
        if r["changed"]:
            print(f"{prefix} {f.name} · " + " ".join(f"{k}={v}" for k, v in r["counts"].items() if v))

    print(f"\nGesamt: {total['files']} Dateien · "
          f"{total['fraunces']} Fraunces · {total['eyebrow']} Eyebrows · "
          f"{total['staedte_accent']} Stadt-Akzente · {total['staedte_badge']} Stadt-Badges")


if __name__ == "__main__":
    main()
