#!/usr/bin/env python3
"""
Sync der Topbar-Contacts über ALLE HTML-Seiten.

Wahrheit: index.html. Block: <div class="topbar-contacts"> ... </div>
Alle anderen Seiten bekommen exakt diesen Block.

Aufruf:
    python3 scripts/sync-topbar.py             # ersetzt
    python3 scripts/sync-topbar.py --dry-run   # nur zeigen was sich ändert

Künftiger Workflow: Topbar nur noch in index.html anpassen, dann dieses
Script laufen lassen — alle anderen Seiten ziehen automatisch nach.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / 'index.html'

# Welche Seiten kriegen die Topbar? Alle die schon "topbar-contacts" enthalten.
# (Wir packen die Topbar NICHT in Seiten ein, die keine haben — z.B. Test-Files.)

EXCLUDE_DIRS = {'_archive', '_cowork-uebergabe', '_screenshots', 'node_modules',
                '.git', '.claude', '.cursor', 'email-templates', 'img-test', 'audits',
                'backups', 'COMPLIANCE-DAILY', 'WEEKLY-DIGEST', 'audit-reports'}
EXCLUDE_FILES_GLOB = ['*backup*', '*BACKUP*', 'BILDER-VERGLEICH*.html', 'MASTER-COMPARE.html',
                      'css-filter-test.html', 'RECOLOR-PREVIEW.html', 'haustuer-recolor.html',
                      '2fl_check.html', 'preview-karten.html', 'img-vergleich.html',
                      'farben-vorschau.html', 'haustuer-preview.html']

BLOCK_RE = re.compile(
    r'<div class="topbar-contacts">.*?</div>',
    re.DOTALL
)

def extract_master():
    txt = MASTER.read_text(encoding='utf-8')
    m = BLOCK_RE.search(txt)
    if not m:
        sys.exit('FEHLER: Master-Block <div class="topbar-contacts"> in index.html nicht gefunden')
    return m.group(0)

def find_pages():
    out = []
    for p in ROOT.rglob('*.html'):
        # Excludes
        rel = p.relative_to(ROOT)
        if any(part in EXCLUDE_DIRS for part in rel.parts):
            continue
        if any(p.match(pat) for pat in EXCLUDE_FILES_GLOB):
            continue
        if p == MASTER:
            continue
        out.append(p)
    return out

def main():
    dry = '--dry-run' in sys.argv
    master_block = extract_master()
    pages = find_pages()
    changed, skipped, unchanged = [], [], []

    for p in pages:
        try:
            txt = p.read_text(encoding='utf-8')
        except Exception as e:
            skipped.append((p, f'read error: {e}'))
            continue

        if 'topbar-contacts' not in txt:
            skipped.append((p, 'kein topbar-contacts auf der Seite'))
            continue

        new_txt = BLOCK_RE.sub(master_block, txt, count=1)
        if new_txt == txt:
            unchanged.append(p)
            continue

        if not dry:
            p.write_text(new_txt, encoding='utf-8')
        changed.append(p)

    print(f'Master: {MASTER.name}')
    print(f'Pages mit Topbar geprüft: {len(pages) - len([x for x in skipped if "kein topbar" in x[1]])}')
    print(f'  geändert:   {len(changed)}')
    print(f'  unverändert: {len(unchanged)}')
    print(f'  übersprungen (kein Topbar): {len([x for x in skipped if "kein topbar" in x[1]])}')
    if dry:
        print('\n--- DRY-RUN — keine Datei wurde geschrieben ---')
    if changed:
        print('\nGeänderte Dateien:')
        for p in changed:
            print(f'  {p.relative_to(ROOT)}')

if __name__ == '__main__':
    main()
