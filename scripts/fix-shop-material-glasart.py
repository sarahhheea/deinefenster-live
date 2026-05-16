#!/usr/bin/env python3
"""
Migration: material + glasart Felder bei alten Inseraten setzen.

Logik:
  - material aus Titel/Kategorie ableiten (Holz/Aluminium/Kunststoff)
  - glasart aus eigenschaften[] oder verglasung ableiten, sonst 'klarglas'

Default-Sicherheitsregel: lieber 'kunststoff' als falsch raten.
Holz/Alu nur wenn explizit im Titel.

Erzeugt:
  - data/shop-produkte.json.bak  (Backup vor Änderung)
  - MIGRATION-REPORT.md          (Liste aller Änderungen zum Review)
"""
import json, re, sys, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON = ROOT / 'data' / 'shop-produkte.json'
BAK  = ROOT / 'data' / 'shop-produkte.json.bak'
REPORT = ROOT / 'MIGRATION-REPORT.md'

def material_aus_titel(p):
    t = (p.get('titel') or '').lower()
    k = (p.get('kategorie_key') or '').lower()
    if re.search(r'\bholz\w*', t) or 'holz' in k:
        return 'holz'
    # Aluminium: nur wenn als Hauptmaterial gemeint, nicht bei "Aluschwelle" (Bodenleiste)
    t_clean = re.sub(r'alu\s*schwelle|aluschwelle|alu\s*-?\s*schwelle', '', t)
    if (re.search(r'\b(aluminium|alurahmen|alu\s*rahmen|alu\s*fenster|alufenster)\w*', t_clean)
        or 'aluminium' in k):
        return 'aluminium'
    return 'kunststoff'

def glasart_ableiten(p):
    eigs = [e.lower() for e in (p.get('eigenschaften') or [])]
    t = (p.get('titel') or '').lower() + ' ' + (p.get('beschreibung') or '').lower()
    if any('chinchilla' in e or 'chinchilla' in t for e in eigs + ['']):
        return 'chinchilla'
    if any('milchglas' in e or 'milchglas' in t or 'satinato' in t for e in eigs + ['']):
        return 'milchglas'
    if any('sicherheit' in e or 'sicherheitsglas' in t or 'vsg' in t for e in eigs + ['']):
        return 'sicherheitsglas'
    if any('schall' in e or 'schallschutz' in t for e in eigs + ['']):
        return 'schallschutzglas'
    return 'klarglas'

def main():
    if not JSON.exists():
        print(f'FEHLER: {JSON} fehlt', file=sys.stderr); sys.exit(1)

    data = json.loads(JSON.read_text(encoding='utf-8'))
    prods = data.get('produkte', [])
    if not prods:
        print('Keine Produkte gefunden — Abbruch'); sys.exit(0)

    shutil.copy(JSON, BAK)
    print(f'Backup: {BAK}')

    changes = []
    for p in prods:
        before_mat = p.get('material', '<FEHLT>')
        before_glas = p.get('glasart', '<FEHLT>')
        mat_changed = glas_changed = False

        if 'material' not in p:
            p['material'] = material_aus_titel(p)
            mat_changed = True
        if 'glasart' not in p:
            p['glasart'] = glasart_ableiten(p)
            glas_changed = True

        if mat_changed or glas_changed:
            changes.append({
                'id': p.get('id'),
                'titel': p.get('titel', ''),
                'standnummer': p.get('standnummer', ''),
                'kategorie': p.get('kategorie_key', ''),
                'material_alt': before_mat, 'material_neu': p['material'], 'material_geaendert': mat_changed,
                'glasart_alt': before_glas, 'glasart_neu': p['glasart'], 'glasart_geaendert': glas_changed,
            })

    # JSON-Datei schreiben
    JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    # Report schreiben
    lines = ['# Shop-Migration: material + glasart Felder', '',
             f'**Datum:** 2026-05-16  ',
             f'**Inserate gesamt:** {len(prods)}  ',
             f'**Geänderte Inserate:** {len(changes)}  ',
             f'**Backup:** `data/shop-produkte.json.bak` (kannst du wiederherstellen falls was falsch ist)',
             '',
             '## Heuristik',
             '- `material` aus Titel/Kategorie: "Holz*" → holz, "Alu*/Aluminium*" → aluminium, sonst kunststoff',
             '- `glasart` aus Eigenschaften/Titel: chinchilla / milchglas / sicherheitsglas / schallschutzglas, sonst klarglas',
             '- Bei Zweifel: Default kunststoff + klarglas (konservativ)',
             '',
             '## Änderungs-Liste',
             '| Standnr. | Titel | Kategorie | Material | Glasart |',
             '|---|---|---|---|---|']
    for c in changes:
        m = c['material_neu'] + (' ✏' if c['material_geaendert'] else '')
        g = c['glasart_neu'] + (' ✏' if c['glasart_geaendert'] else '')
        titel = c['titel'][:55].replace('|', '\\|')
        lines.append(f"| {c['standnummer']} | {titel} | {c['kategorie']} | {m} | {g} |")

    REPORT.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Report: {REPORT}')
    print(f'Geändert: {len(changes)} Inserate')
    holz = sum(1 for c in changes if c['material_neu']=='holz')
    alu  = sum(1 for c in changes if c['material_neu']=='aluminium')
    kunst= sum(1 for c in changes if c['material_neu']=='kunststoff')
    print(f'  davon Holz: {holz}, Alu: {alu}, Kunststoff: {kunst}')

if __name__ == '__main__':
    main()
