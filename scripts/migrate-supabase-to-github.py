#!/usr/bin/env python3
"""
Supabase → GitHub Pages Bildmigration
Läuft NACH dem Supabase Quota-Reset (27. Mai 2026).

Was es tut:
1. Liest data/shop-produkte.json
2. Lädt alle Supabase-Bilder herunter
3. Schreibt sie nach img/shop/
4. Aktualisiert die JSON-URLs auf GitHub Pages URLs
5. Git-commit + push

Aufruf: python3 scripts/migrate-supabase-to-github.py
"""

import json, os, re, sys, time, urllib.request, subprocess
from pathlib import Path

REPO_ROOT   = Path(__file__).parent.parent
JSON_PATH   = REPO_ROOT / 'data' / 'shop-produkte.json'
IMG_DIR     = REPO_ROOT / 'img' / 'shop'
GH_BASE     = 'https://sarahhheea.github.io/deinefenster-live'
SUPABASE_RE = re.compile(r'https://kgklvkainekbiphjdehy\.supabase\.co/.*')

IMG_DIR.mkdir(parents=True, exist_ok=True)

def download(url, dest):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
        if len(data) < 1000:
            print(f'  SKIP (zu klein, wahrscheinlich Fehler): {url}')
            return False
        dest.write_bytes(data)
        return True
    except Exception as e:
        print(f'  FEHLER: {e}')
        return False

def migrate_url(url):
    """Lädt Supabase-URL herunter, gibt neue GitHub-URL zurück. Gibt None bei Fehler."""
    if not SUPABASE_RE.match(url):
        return url  # bereits migriert oder anderer Host
    filename = url.split('/')[-1]
    dest = IMG_DIR / filename
    if dest.exists():
        print(f'  Bereits vorhanden: {filename}')
        return f'{GH_BASE}/img/shop/{filename}'
    print(f'  Download: {filename}')
    ok = download(url, dest)
    if not ok:
        return None  # Beibehalten der alten URL wenn Download fehlschlägt
    time.sleep(0.1)  # sanfter Rate-Limit
    return f'{GH_BASE}/img/shop/{filename}'

data = json.loads(JSON_PATH.read_text(encoding='utf-8'))
produkte = data.get('produkte', [])

total_bilder  = 0
total_ok      = 0
total_skip    = 0
gesamt_geld   = 0

for p in produkte:
    bilder_alt = p.get('bilder', [])
    if not any(SUPABASE_RE.match(str(b)) for b in bilder_alt):
        continue

    print(f"\nProdukt: {p.get('titel','?')[:50]}")
    bilder_neu = []
    for url in bilder_alt:
        total_bilder += 1
        neu = migrate_url(str(url))
        if neu:
            bilder_neu.append(neu)
            total_ok += 1
        else:
            bilder_neu.append(url)  # alte URL behalten als Fallback
            total_skip += 1
    p['bilder'] = bilder_neu
    if bilder_neu:
        p['bild'] = bilder_neu[0]

JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'\nJSON aktualisiert: {total_ok}/{total_bilder} Bilder migriert, {total_skip} fehlgeschlagen')

# Git commit + push
print('\nGit commit...')
os.chdir(REPO_ROOT)
subprocess.run(['git', 'add', 'img/shop/', 'data/shop-produkte.json'], check=True)
subprocess.run(['git', 'commit', '-m', f'Migration: {total_ok} Supabase-Bilder → GitHub Pages img/shop/'], check=True)
subprocess.run(['git', 'push', 'live', 'HEAD:main'], check=True)
print('Fertig! Alle Bilder sind jetzt auf GitHub Pages.')
