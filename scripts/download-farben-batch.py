#!/usr/bin/env python3
"""
Download + Pipeline für alle fenster_2fl_aussen_*.png Farbgenerierungen.
Aufruf: python3 scripts/download-farben-batch.py <generations_json_file>
Oder:   python3 scripts/download-farben-batch.py --stdin  (liest JSON von stdin)

JSON-Format:
[{"id": "...", "params": {"prompt": "..."}, "results": {"rawUrl": "..."}, "status": "completed"}]
"""

import sys
import json
import os
import subprocess
import re
from datetime import datetime

# Mapping: Substring im Prompt → Farb-Key
# Reihenfolge ist wichtig: spezifischere zuerst
MATCHERS = [
    # Weiß-Töne
    ('weiss-fx',    'RAL 9016 FX hex #ededea'),
    ('cremeweiss',  'RAL 9001 hex #fdf6e3'),
    # Grau-Töne (spezifisch zuerst)
    ('quarzgr-gl',  'smooth glossy Quarzgrau Glatt'),
    ('quarzgr-sa',  'fine sand matte Quarzgrau Sandstruktur'),
    ('basaltgr-gl', 'smooth Basaltgrau Glatt'),
    ('basaltgr-sa', 'sand texture Basaltgrau Sandstruktur'),
    ('schiefgr-gl', 'smooth Schiefergrau Glatt'),
    ('schiefgr-sa', 'sand texture Schiefergrau Sandstruktur'),
    ('anthraz-gl',  'smooth Anthrazitgrau Glatt'),
    ('anthraz-um',  'ultra-matte Anthrazitgrau Ulti-Matt'),
    ('anthrazit',   'anthracite grey Anthrazitgrau RAL 7016 hex #373d3f'),
    ('schwarz-um',  'ultra-matte Schwarz Ulti-Matt RAL 9005'),
    ('schwarzbr',   'Schwarzbraun RAL 8022'),
    ('achatgrau',   'Achatgrau RAL 7038'),
    ('lichtgrau',   'Lichtgrau RAL 7035'),
    ('signalgrau',  'Signalgrau RAL 7004'),
    ('betongrau',   'Betongrau RAL 7023'),
    # Metallic / Spezial
    ('alu-gebr',    'brushed aluminium silver'),
    ('eisengl',     'iron mica slate'),
    ('crown-plat',  'crown platinum'),
    ('alux-db',     'Alux DB 703'),
    # Holz-Dekore
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
    # Farben
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


def identify_color_key(prompt):
    # For duplicate prompts (prompt stacking bug), use the LAST color description block
    import re
    desc_matches = re.findall(r'Frame, sash and mullion: (.+?)\.[ \n]SLIM', prompt)
    if desc_matches:
        # Check from last to first (most recent color)
        for desc in reversed(desc_matches):
            for key, substring in MATCHERS:
                if substring in desc:
                    return key
    # Fallback: full-text search
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

    # Nur AUSSEN-Generierungen (enthalten "EXTERIOR VIEW")
    if 'EXTERIOR VIEW' not in prompt and 'viewed from OUTSIDE' not in prompt:
        print(f"  SKIP (not exterior): {gen_id[:8]}")
        return False

    key = identify_color_key(prompt)
    if not key:
        print(f"  SKIP (no key match): {gen_id[:8]} — prompt snippet: {prompt[:80]}")
        return False

    out_file = os.path.join(FARBEN_DIR, f'fenster_2fl_aussen_{key}.png')

    # Bereits verarbeitet?
    if os.path.exists(out_file):
        print(f"  SKIP (exists): fenster_2fl_aussen_{key}.png")
        return False

    if not raw_url:
        print(f"  ERROR: no rawUrl for {key}")
        return False

    # Download master
    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    master_file = os.path.join(MASTERS_DIR, f'v3_{key}_master_{ts}.png')
    print(f"  Downloading {key} → {os.path.basename(master_file)}")

    result = subprocess.run(
        ['curl', '-s', '-o', master_file, raw_url],
        capture_output=True
    )
    if result.returncode != 0 or not os.path.exists(master_file):
        print(f"  ERROR: download failed for {key}")
        return False

    # Pipeline
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
        print("Usage: python3 download-farben-batch.py <generations.json>")
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
        result = process_generation(item)
        if result:
            done += 1

    print(f"\nDone: {done} new images processed.")


if __name__ == '__main__':
    main()
