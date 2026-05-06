#!/usr/bin/env python3
"""
Download + Pipeline für alle fenster_3fl_*.png (3-Flügel Innen Farben).
Aufruf: python3 scripts/download-3fl-innen-batch.py <generations_json_file>
Oder:   python3 scripts/download-3fl-innen-batch.py --stdin
"""

import sys
import json
import os
import subprocess
from datetime import datetime

MATCHERS = [
    ('weiss-fx',    'RAL 9016 FX'),
    ('cremeweiss',  'RAL 9001'),
    ('quarzgr-gl',  'smooth glossy Quarzgrau Glatt'),
    ('quarzgr-sa',  'fine sand matte Quarzgrau Sandstruktur'),
    ('basaltgr-gl', 'smooth Basaltgrau Glatt'),
    ('basaltgr-sa', 'sand texture Basaltgrau Sandstruktur'),
    ('schiefgr-gl', 'smooth Schiefergrau Glatt'),
    ('schiefgr-sa', 'sand texture Schiefergrau Sandstruktur'),
    ('anthraz-gl',  'smooth Anthrazitgrau Glatt'),
    ('anthraz-um',  'ultra-matte Anthrazitgrau Ulti-Matt'),
    ('anthrazit',   'anthracite grey Anthrazitgrau RAL 7016'),
    ('schwarz-um',  'ultra-matte Schwarz Ulti-Matt RAL 9005'),
    ('schwarzbr',   'Schwarzbraun RAL 8022'),
    ('achatgrau',   'Achatgrau RAL 7038'),
    ('lichtgrau',   'Lichtgrau RAL 7035'),
    ('signalgrau',  'Signalgrau RAL 7004'),
    ('betongrau',   'Betongrau RAL 7023'),
    ('alu-gebr',    'brushed aluminium silver'),
    ('eisengl',     'iron mica slate'),
    ('crown-plat',  'crown platinum'),
    ('alux-db',     'Alux DB 703'),
    ('sheffield',   'Sheffield Oak'),
    ('eiche-hell',  'Eiche Hell'),
    ('eiche-nat',   'natural oak golden'),
    ('golden-oak',  'golden oak warm brown'),
    ('winchester',  'Winchester'),
    ('nussbaum',    'Nussbaum'),
    ('mooreiche',   'Mooreiche'),
    ('dunkleiche',  'Dunkeleiche'),
    ('siena-noce',  'Siena Noce'),
    ('siena-ross',  'Siena Rosso'),
    ('mahagoni',    'mahogany'),
    ('macore',      'Macore'),
    ('oregon',      'Oregon pine'),
    ('douglasie',   'Streifen-Douglasie'),
    ('bergkiefer',  'Bergkiefer'),
    ('teak',        'teak medium brown'),
    ('schoko-br',   'Schokoladenbraun'),
    ('braun-mar',   'brown Maron'),
    ('moosgruen',   'Moosgruen'),
    ('dunkelgr',    'Dunkelgruen'),
    ('stahlblau',   'Stahlblau'),
    ('brillblau',   'Brilliantblau'),
    ('dunkelrot',   'Dunkelrot'),
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTERS_DIR = os.path.join(BASE_DIR, 'img', 'masters', 'sarah')
FARBEN_DIR = os.path.join(BASE_DIR, 'img', 'farben')
PIPELINE_SCRIPT = os.path.join(BASE_DIR, 'scripts', 'process-master-image.py')

INTERIOR_MARKERS = ['INTERIOR VIEW (inside)', 'INTERIOR (inside)', '3-FLUEGEL-INNEN']


def identify_color_key(prompt):
    import re
    desc_matches = re.findall(r'Frame, sash and mullion: (.+?)\.', prompt)
    if desc_matches:
        for desc in reversed(desc_matches):
            for key, substring in MATCHERS:
                if substring in desc:
                    return key
    for key, substring in MATCHERS:
        if substring in prompt:
            return key
    return None


def process_generation(item: dict) -> bool:
    if item.get('status') != 'completed':
        return False

    prompt = item.get('params', {}).get('prompt', '')
    raw_url = item.get('results', {}).get('rawUrl', '')
    gen_id = item.get('id', 'unknown')

    # Nur Innen-Generierungen
    is_interior = any(m in prompt for m in INTERIOR_MARKERS)
    if not is_interior:
        print(f"  SKIP (not interior 3fl): {gen_id[:8]}")
        return False

    key = identify_color_key(prompt)
    if not key:
        print(f"  SKIP (no key match): {gen_id[:8]} — snippet: {prompt[:80]}")
        return False

    out_file = os.path.join(FARBEN_DIR, f'fenster_3fl_{key}.png')
    if os.path.exists(out_file):
        print(f"  SKIP (exists): fenster_3fl_{key}.png")
        return False

    if not raw_url:
        print(f"  ERROR: no rawUrl for {key}")
        return False

    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    master_file = os.path.join(MASTERS_DIR, f'v3_3fl_{key}_master_{ts}.png')
    print(f"  Downloading {key} → {os.path.basename(master_file)}")

    result = subprocess.run(['curl', '-s', '-o', master_file, raw_url], capture_output=True)
    if result.returncode != 0 or not os.path.exists(master_file):
        print(f"  ERROR: download failed for {key}")
        return False

    print(f"  Pipeline {key}...")
    result = subprocess.run(
        ['python3', PIPELINE_SCRIPT, master_file, out_file],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f"  OK: {result.stdout.strip()}")
        return True
    else:
        print(f"  ERROR pipeline: {result.stderr.strip()}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 download-3fl-innen-batch.py <generations.json>")
        sys.exit(1)

    if sys.argv[1] == '--stdin':
        data = json.load(sys.stdin)
    else:
        with open(sys.argv[1]) as f:
            data = json.load(f)

    items = data if isinstance(data, list) else data.get('items', [])
    print(f"Processing {len(items)} generations...")

    done = 0
    for item in items:
        if process_generation(item):
            done += 1

    print(f"\nDone: {done} new images processed.")


if __name__ == '__main__':
    main()
