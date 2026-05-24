#!/usr/bin/env python3
"""
Title/Meta Length Fixer fuer Bing-Recommendations.
Ziel: Title 30-65 chars, Meta 70-160 chars.
"""

import re
import os
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def city_from_filename(path):
    """staedte/fenster-frankfurt-am-main.html -> Frankfurt am Main"""
    name = os.path.basename(path)
    if name.startswith('fenster-'):
        name = name[8:]
    if name.endswith('.html'):
        name = name[:-5]
    # Title-Case mit Sonderfaellen
    parts = name.split('-')
    return ' '.join(p.capitalize() for p in parts)

def replace_title_meta(html, new_title, new_desc):
    html = re.sub(
        r'<title>[^<]*</title>',
        f'<title>{new_title}</title>',
        html, count=1
    )
    html = re.sub(
        r'(<meta name="description" content=")[^"]*(")',
        lambda m: m.group(1) + new_desc + m.group(2),
        html, count=1
    )
    return html

# --- Stadt-Pages (~200) ---
city_files = glob.glob('staedte/fenster-*.html')
city_fixed = 0
for f in city_files:
    city = city_from_filename(f)
    # Kurzer Title: 30-65 chars
    new_title = f"Fenster {city} - Drutex direkt | DeineFenster.de"
    if len(new_title) > 65:
        new_title = f"Fenster {city} | DeineFenster.de"
    if len(new_title) > 65:
        new_title = f"{city} Fenster | DeineFenster.de"
    # Meta 120-150 chars
    new_desc = f"Drutex-Kunststofffenster nach Maß für {city}: Direktimport aus Polen, Lieferung deutschlandweit, Hofverkauf jeden Freitag in Brandenburg."
    if len(new_desc) > 160:
        new_desc = f"Drutex-Kunststofffenster für {city}: Maßanfertigung, Direktimport, Versand deutschlandweit, Hofverkauf Brandenburg jeden Freitag."

    html = open(f).read()
    new_html = replace_title_meta(html, new_title, new_desc)
    if new_html != html:
        open(f, 'w').write(new_html)
        city_fixed += 1

print(f"Stadt-Pages gefixt: {city_fixed}/{len(city_files)}")

# --- Drutex-Haendler-Stadt Pages ---
haendler_map = {
    'drutex-haendler-berlin.html':       ("Drutex Händler Berlin - DeineFenster.de", "Drutex-Direktimporteur für Berlin in Brandenburg an der Havel. Nur 65 km entfernt, Lieferung und Selbstabholung jeden Freitag im Hofverkauf."),
    'drutex-haendler-brandenburg.html':  ("Drutex Händler Brandenburg | DeineFenster.de", "Drutex-Händler in Brandenburg an der Havel: Direktimport aus Polen, Lieferung deutschlandweit, Hofverkauf jeden Freitag 10-17 Uhr."),
    'drutex-haendler-magdeburg.html':    ("Drutex Händler Magdeburg | DeineFenster.de", "Drutex-Direktimporteur für Magdeburg in Brandenburg an der Havel (65 km). Maßanfertigung, Lieferung und Selbstabholung im Hofverkauf."),
    'drutex-haendler-potsdam.html':      ("Drutex Händler Potsdam | DeineFenster.de", "Drutex-Direktimporteur für Potsdam in Brandenburg an der Havel (35 km). Maßanfertigung, Lieferung und Selbstabholung im Hofverkauf."),
}
hf = 0
for fn, (t, d) in haendler_map.items():
    if not os.path.exists(fn): continue
    html = open(fn).read()
    new_html = replace_title_meta(html, t, d)
    if new_html != html:
        open(fn, 'w').write(new_html)
        hf += 1
print(f"Drutex-Händler-Pages gefixt: {hf}")

# --- Wichtige Hauptpages ---
main_map = {
    'kunststofffenster-kaufen.html':       ("Kunststofffenster kaufen — Drutex direkt | DeineFenster.de", "Drutex-Kunststofffenster nach Maß vom Direktimporteur: 5- und 7-Kammer-Profile, Lieferung deutschlandweit, Hofverkauf Brandenburg jeden Freitag."),
    'gebrauchte-fenster-kaufen.html':      ("Gebrauchte Fenster Hofverkauf Brandenburg | DeineFenster.de", "Hofverkauf gebrauchte Drutex-Fenster jeden Freitag 10-17 Uhr in Brandenburg an der Havel: ca. 10.000 Artikel, Selbstabholung, Direktimport."),
    'fenster-austauschen-kosten.html':     ("Alte Fenster verkaufen — Ankauf | DeineFenster.de", "Wir kaufen alte Drutex-Fenster in Brandenburg an der Havel an: kostenlose Bewertung, faire Preise, Abholung möglich. Anfrage per WhatsApp."),
    'fenster-aufmass-vor-ort.html':        ("Fenster vor Ort aufmessen Brandenburg | DeineFenster.de", "Wir kommen für Aufmaß: Brandenburg an der Havel, Potsdam, Berlin. Maßgenau und kostenlos vor Auftragsvergabe."),
    'garagentor-gebraucht-kaufen.html':    ("Garagentor gebraucht Brandenburg | DeineFenster.de", "Gebrauchte Garagentore aus Sanierungsprojekten im Hofverkauf Brandenburg an der Havel. Sektional, Schwing, Rolltor. Selbstabholung möglich."),
    'konfigurator.html':                   ("Drutex Fenster online konfigurieren | DeineFenster.de", "Maßgenaues Drutex-Fenster konfigurieren: Profil, Glas, Farbe, Beschlag. Angebot per E-Mail. Lieferung deutschlandweit aus Brandenburg."),
    'kontakt.html':                        ("Kontakt — Fensterhandel Christ Brandenburg | DeineFenster.de", "Türen und Fensterhandel Christ, Fohrder Landstr. 13, 14774 Brandenburg an der Havel. Telefon, WhatsApp, E-Mail, Öffnungszeiten und Anfahrt."),
    'shop.html':                           ("Drutex Fenster sofort lieferbar | Shop DeineFenster.de", "Lager-Fenster sofort verfügbar: Drutex-Direktimport zu attraktiven Preisen, Lieferung deutschlandweit oder Selbstabholung im Hofverkauf Brandenburg."),
    'kfw-foerderung.html':                 ("KfW & BAFA Fenster-Förderung 2026 | DeineFenster.de", "Aktueller Stand KfW- und BAFA-Förderung für Fenstertausch 2026: Bedingungen, Höchstsätze, Antragsweg. Ehrlich erklärt vom Fachbetrieb Brandenburg."),
    'farben-vorschau.html':                ("Fensterfarben & Holzdekore Übersicht | DeineFenster.de", "45 Drutex-Oberflächen im Überblick: Standard-Weiß bis Holzdekore und RAL-Sonderfarben. Vorschau für Maßanfertigung im Konfigurator."),
    'daemmung-kaufen.html':                ("Dämmung kaufen Brandenburg + Berlin | DeineFenster.de", "ISO-Verbund-Dämmplatten neu im Direktimport: Lagerverkauf jeden Freitag in Brandenburg an der Havel. Auch Selbstabholung möglich."),
    'sitemap.html':                        ("Sitemap — alle Seiten | DeineFenster.de", "Übersicht aller Seiten von DeineFenster.de: Produkte, Konfigurator, Ratgeber, Städte-Seiten, Kontakt und Rechtliches."),
}
mf = 0
for fn, (t, d) in main_map.items():
    if not os.path.exists(fn): continue
    html = open(fn).read()
    new_html = replace_title_meta(html, t, d)
    if new_html != html:
        open(fn, 'w').write(new_html)
        mf += 1
print(f"Haupt-Pages gefixt: {mf}/{len(main_map)}")

# --- Ratgeber-Pages ---
ratgeber_map = {
    'ratgeber/index.html':                              ("Fenster Ratgeber 2026 | DeineFenster.de", "Ehrlicher Fenster-Ratgeber 2026: U-Wert, KfW-Förderung, Kosten, Drutex-Profile, Sanierungstipps vom Fachbetrieb Brandenburg an der Havel."),
    'ratgeber/iglo5-vs-iglo-energy.html':               ("Drutex IGLO 5 vs IGLO Energy Vergleich | DeineFenster.de", "5-Kammer oder 7-Kammer Drutex-Profil? Unterschiede bei Bautiefe, Dämmung, Schallschutz und Förderfähigkeit ehrlich erklärt."),
    'ratgeber/fenster-kosten-2026.html':                ("Fensterpreis 2026 — die 6 Kostenfaktoren | DeineFenster.de", "Was beeinflusst den Fensterpreis? Profil, Glas, Größe, Farbe, Beschlag, Einbau — Praxiswissen vom Fachbetrieb Brandenburg an der Havel."),
    'ratgeber/fenster-u-wert-erklaert.html':            ("Fenster U-Wert einfach erklärt 2026 | DeineFenster.de", "Was bedeuten Uw, Ug, Uf beim Fenster? Welcher U-Wert ist gut? Förder-Grenzen 2026 und Praxis-Tipps zum Verständnis der Dämmwerte."),
    'ratgeber/gebrauchte-fenster-kaufen-ratgeber.html': ("Gebrauchte Fenster kaufen — Tipps & Checks | DeineFenster.de", "Wann lohnen gebrauchte Fenster, worauf achten? Kaufcheckliste und typische Mängel ehrlich vom Betrieb mit eigenem Gebrauchtlager Brandenburg."),
    'ratgeber/kfw-foerderung-fenster-2026.html':        ("KfW-Förderung Fenster 2026 | DeineFenster.de", "Bis zu 15% KfW-Zuschuss für Fenstertausch 2026: Voraussetzungen, Höchstsätze, Antragsweg, Drutex-Profile mit Uw ≤ 0,95 W/(m²K)."),
    'ratgeber/drutex-iglo-5-hofverkauf-brandenburg.html': ("Drutex IGLO 5 Hofverkauf Brandenburg | DeineFenster.de", "Drutex IGLO 5 zur Selbstabholung jeden Freitag 10-17 Uhr in Brandenburg an der Havel: Lagerware, Maßanfertigung, Anfahrt aus 5 Städten."),
}
rf = 0
for fn, (t, d) in ratgeber_map.items():
    if not os.path.exists(fn): continue
    html = open(fn).read()
    new_html = replace_title_meta(html, t, d)
    if new_html != html:
        open(fn, 'w').write(new_html)
        rf += 1
print(f"Ratgeber-Pages gefixt: {rf}/{len(ratgeber_map)}")

# --- Produkt-Sub-Pages ---
produkt_map = {
    'produkte/kunststofffenster/iglo-edge.html':            ("IGLO EDGE Kunststofffenster | DeineFenster.de", "Drutex IGLO EDGE: 93 mm Bautiefe, 7 Kammern, Uw bis 0,63 W/(m²K). Passivhaus-tauglich, Direktimport aus Polen, Hofverkauf Brandenburg."),
    'produkte/kunststofffenster/iglo-energy.html':          ("IGLO Energy Kunststofffenster | DeineFenster.de", "Drutex IGLO Energy: 82 mm, 7 Kammern, Uw bis 0,71 W/(m²K), RC2 serienmäßig. KfW-förderfähig. Direktimport, Hofverkauf Brandenburg."),
    'produkte/kunststofffenster/iglo-ext.html':             ("IGLO EXT nach außen öffnend | DeineFenster.de", "Drutex IGLO EXT: Kunststofffenster nach außen öffnend für besondere Anwendungen. Direktimport aus Polen, Lieferung deutschlandweit."),
    'produkte/kunststofffenster/iglo-light.html':           ("IGLO Light schmale Profile | DeineFenster.de", "Drutex IGLO Light: schmale Profile für mehr Lichteinfall. Maßanfertigung, Direktimport aus Polen, Hofverkauf Brandenburg an der Havel."),
    'produkte/kunststofffenster/iglo-5-classic.html':       ("IGLO 5 Classic Kunststofffenster | DeineFenster.de", "Drutex IGLO 5 Classic: 70 mm Bautiefe, 5 Kammern, Uw bis 0,83 W/(m²K). Bewährtes Standardprofil. Direktimport, Hofverkauf Brandenburg."),
    'produkte/balkontueren/iglo-5-classic.html':            ("IGLO 5 Classic Balkontür | DeineFenster.de", "Drutex IGLO 5 Classic Balkontür: 5 Kammern, 70 mm Bautiefe, Maßanfertigung, Direktimport, Hofverkauf Brandenburg an der Havel."),
    'produkte/balkontueren/iglo-energy.html':               ("IGLO Energy Balkontür | DeineFenster.de", "Drutex IGLO Energy Balkontür: 7 Kammern, 82 mm Bautiefe, Passivhaus-tauglich. Maßanfertigung, Direktimport, Hofverkauf Brandenburg."),
    'produkte/haustueren/iglo-5-classic.html':              ("IGLO 5 Classic PVC-Haustür | DeineFenster.de", "Drutex IGLO 5 Classic Haustür: PVC-Profil, individuelle Füllung, RC2-Beschlag optional. Direktimport, Hofverkauf Brandenburg."),
    'produkte/haustueren/iglo-energy.html':                 ("IGLO Energy PVC-Haustür | DeineFenster.de", "Drutex IGLO Energy Haustür: 82 mm Bautiefe, 7 Kammern, beste Dämmwerte. Maßanfertigung, Direktimport, Hofverkauf Brandenburg."),
    'produkte/hebe-schiebetueren/iglo-5-classic-psk.html':  ("IGLO 5 Classic PSK Schiebetür | DeineFenster.de", "Drutex IGLO 5 Classic PSK Parallel-Schiebe-Kipp-Tür: 70 mm, leichte Bedienung. Maßanfertigung, Direktimport, Hofverkauf Brandenburg."),
    'produkte/hebe-schiebetueren/iglo-energy-psk.html':     ("IGLO Energy PSK Schiebetür | DeineFenster.de", "Drutex IGLO Energy PSK Parallel-Schiebe-Kipp-Tür: 82 mm, sehr gute Dämmung. Maßanfertigung, Direktimport, Hofverkauf Brandenburg."),
    'produkte/rollladen/aufsatz-rollladen.html':            ("PVC-Aufsatzrollladen mit Motor | DeineFenster.de", "Drutex Aufsatzrollladen: elektrischer Antrieb, individuelle Maße, passend zu IGLO-Profilen. Direktimport, Hofverkauf Brandenburg."),
}
pf = 0
for fn, (t, d) in produkt_map.items():
    if not os.path.exists(fn): continue
    html = open(fn).read()
    new_html = replace_title_meta(html, t, d)
    if new_html != html:
        open(fn, 'w').write(new_html)
        pf += 1
print(f"Produkt-Pages gefixt: {pf}/{len(produkt_map)}")

# --- Test/Dev Pages: noindex ---
noindex_files = [
    '2fl_check.html',
    'RECOLOR-PREVIEW.html',
    'img-vergleich.html',
    'preview-karten.html',
]
ni = 0
for fn in noindex_files:
    if not os.path.exists(fn): continue
    html = open(fn).read()
    if 'noindex' in html.lower(): continue
    # Inject noindex robots meta after <head>
    new_html = html.replace(
        '<head>',
        '<head>\n<meta name="robots" content="noindex, nofollow">',
        1
    )
    if new_html != html:
        open(fn, 'w').write(new_html)
        ni += 1
print(f"Test-Pages auf noindex gesetzt: {ni}")

print(f"\n=== TOTAL FIXES ===")
print(f"  Städte: {city_fixed}")
print(f"  Drutex-Händler: {hf}")
print(f"  Haupt-Pages: {mf}")
print(f"  Ratgeber: {rf}")
print(f"  Produkte: {pf}")
print(f"  Noindex Test: {ni}")
print(f"  SUMME: {city_fixed + hf + mf + rf + pf + ni}")
