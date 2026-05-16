#!/usr/bin/env python3
"""
Smart-Quote-Wächter für DeineFenster.de

Smart-Quotes (U+201C/U+201D/U+2018/U+2019) innerhalb von HTML-Tags brechen
das Layout still: Browser ignorieren betroffene Attribute komplett.
Sarah hatte den Fall am 16.05.2026 auf shop.html — die unteren SEO-
Sektionen waren als roher Text sichtbar (413 kaputte Quotes).

Standard-Lauf  : python3 scripts/check-html-smart-quotes.py
                 → exit 0 wenn sauber, exit 1 wenn Probleme
Auto-Reparatur : python3 scripts/check-html-smart-quotes.py --fix
                 → ersetzt Smart-Quotes NUR innerhalb von <…>-Tags
                 → sichtbarer Text (z.B. „Anthrazit") bleibt unangetastet
"""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', 'node_modules', '_archive', 'css', 'fonts', 'img', '__pycache__', '.claude'}
SKIP_NAME_PARTS = ('BILDER-VERGLEICH', 'MASTER-COMPARE', 'css-filter-test', '_backup', 'haustuer-recolor')
SMART = ['“', '”', '‘', '’']
TAG_RE = re.compile(r'<[^<>]+>', flags=re.DOTALL)

def scan_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            src = f.read()
    except Exception:
        return None, 0, []
    bad_per_tag = []
    for m in TAG_RE.finditer(src):
        tag = m.group(0)
        cnt = sum(tag.count(c) for c in SMART)
        if cnt:
            line = src.count('\n', 0, m.start()) + 1
            bad_per_tag.append((line, cnt, tag[:80]))
    total = sum(c for _, c, _ in bad_per_tag)
    return src, total, bad_per_tag

def fix_tags(src):
    def repl(m):
        t = m.group(0)
        return (t.replace('“', '"').replace('”', '"')
                 .replace('‘', "'").replace('’', "'"))
    return TAG_RE.sub(repl, src)

def main():
    fix = '--fix' in sys.argv
    quiet = '--quiet' in sys.argv
    problems = []
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if not fname.endswith(('.html', '.htm')):
                continue
            if any(part in fname for part in SKIP_NAME_PARTS):
                continue
            path = os.path.join(root, fname)
            src, total, locations = scan_file(path)
            if total > 0:
                problems.append((path, total, locations, src))

    if not problems:
        if not quiet:
            print('OK — keine Smart-Quotes in HTML-Tags gefunden.')
        return 0

    for path, total, locs, src in problems:
        rel = os.path.relpath(path, ROOT)
        print(f'\n{rel} — {total} Smart-Quote(s) in HTML-Tags:')
        for line, cnt, snippet in locs[:5]:
            print(f'  Zeile {line:4} ({cnt}x): {snippet}')
        if len(locs) > 5:
            print(f'  … und {len(locs) - 5} weitere Stelle(n)')
        if fix:
            new = fix_tags(src)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new)
            print(f'  → repariert')

    if fix:
        print(f'\n{len(problems)} Datei(en) repariert. Bitte prüfen, committen, pushen.')
        return 0

    print(f'\n{len(problems)} Datei(en) betroffen. Mit --fix automatisch reparieren.')
    return 1

if __name__ == '__main__':
    sys.exit(main())
