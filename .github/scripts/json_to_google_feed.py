"""Erzeugt feed.xml (Google-Produktfeed, RSS 2.0) aus data/shop-produkte.json.

Aufruf:  python3 .github/scripts/json_to_google_feed.py
Schreibt feed.xml ins Repo-Wurzelverzeichnis.

Laeuft automatisch per GitHub Action, sobald sich shop-produkte.json aendert.
"""
import json
import os
import re
import sys
from xml.sax.saxutils import escape

DOMAIN = "https://deinefenster.de"
SHOP_URL = f"{DOMAIN}/shop.html"

# Alte Pages-Adresse; leitet per 301 weiter, was Google als Bildfehler wertet.
LEGACY_IMAGE_PREFIX = "https://sarahhheea.github.io/deinefenster-live/"

MAX_TITLE = 150
MAX_DESCRIPTION = 5000
MAX_ADDITIONAL_IMAGES = 10

# Versandkosten. Google verlangt fuer Deutschland zwingend eine Angabe -
# ohne sie wurden im August 2026 alle Produkte abgelehnt. Die Zahl ist eine
# Obergrenze; weniger berechnen ist ausdruecklich erlaubt.
# Berlin und Brandenburg liegen im Liefergebiet (rund 100 km), der Rest der
# Republik geht nur per Spedition zum hoeheren Satz.
VERSAND_NAH = "99.00 EUR"
VERSAND_FERN = "250.00 EUR"
NAHE_REGIONEN = ("BE", "BB")

# ISO 3166-2:DE - alle 16 Laender einzeln, damit sich keine Regel mit einer
# anderen ueberschneidet und Google nichts interpretieren muss.
BUNDESLAENDER = (
    "BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV",
    "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH",
)

# Steht unter jeder Beschreibung. Die Abholung ist der eigentliche Vorteil
# gegenueber den bundesweiten Versendern, taucht in Googles Versandzeile
# aber nicht auf - Abholung wird in Deutschland nicht unterstuetzt.
ABHOL_HINWEIS = (
    "Selbstabholung bei uns in Brandenburg an der Havel: jederzeit kostenlos. "
    "Eine Lieferung ist nicht garantiert - sie muss vorher angefragt werden, "
    "erfolgt per Spedition, und der angezeigte Lieferpreis ist ein Hoechstwert."
)

# Interne Standplatz-Angabe, die nicht zu Google gehoert:
#   "Nr. 1219" | "Nr 400 A" | "Nr.1502" | "Nr. 1007 AB" | "Nr.2808 DDD"
#   "Nr. 0311/1  A" | "Standort Nr 0018"
# Die Ziffer ist Pflicht, damit "Nr DIN Links" stehen bleibt. Der Platzcode
# dahinter sind 1-3 Grossbuchstaben - laengere Woerter wie "Kunststofffenster"
# oder "nach Aussen oeffnend" sind echte Angaben und bleiben erhalten.
STANDNUMMER = re.compile(
    r"\s*\b(?:Standort\s+)?Nr\.?\s*\d+(?:/\d+)?(?:\s+[A-ZÄÖÜ]{1,3}\b)?",
)

# Fuer die Suche optimierte Titel. Der Shop-Titel bleibt davon unberuehrt.
TITEL_UEBERSCHREIBUNG = {
    "p_1779382702846": "Dämmung Glaswolle 150 mm – Dachdämmung, Rolle 6,24 m² (WLG 044)",
}

# Freigegebene Produktfotos (ohne fremde Logos oder Bildschirm-Overlays).
BILD_UEBERSCHREIBUNG = {
    "p_1779382702846": f"{DOMAIN}/img/shop/daemmung-rolle.webp",
}


def clean_title(titel):
    """Entfernt die interne Standplatz-Nummer; die gehoert nicht zu Google."""
    ohne_nummer = STANDNUMMER.sub(" ", titel or "")
    return re.sub(r"\s+", " ", ohne_nummer).strip()


def normalize_image_url(url):
    """Macht aus jedem Bildpfad eine absolute URL auf der eigenen Domain."""
    url = (url or "").strip()
    if not url:
        return ""
    if url.startswith(LEGACY_IMAGE_PREFIX):
        return DOMAIN + "/" + url[len(LEGACY_IMAGE_PREFIX):]
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return f"{DOMAIN}/{url.lstrip('/')}"


def _zustand_tokens(produkt):
    """zustand ist im Datensatz mal eine Liste, mal ein einzelner String."""
    z = produkt.get("zustand")
    if isinstance(z, str):
        z = [z]
    elif not isinstance(z, list):
        z = []
    return {str(t).strip().lower() for t in z if str(t).strip()}


def condition_of(produkt):
    """gebraucht schlaegt alles andere; im Zweifel gebraucht (konservativ)."""
    tokens = _zustand_tokens(produkt)
    if "gebraucht" in tokens:
        return "used"
    if tokens & {"neu", "sonderposten"}:
        return "new"
    return "used"


def price_of(produkt):
    wert = produkt.get("sonderpreis_eur") or produkt.get("preis_eur") or 0
    return f"{float(wert):.2f} EUR"


def availability_of(produkt):
    bestand = produkt.get("lagerbestand")
    if bestand is None:
        return "in_stock"
    try:
        return "in_stock" if float(bestand) > 0 else "out_of_stock"
    except (TypeError, ValueError):
        return "in_stock"


def shipping_of():
    """Ein Eintrag je Bundesland - ueberschreibt die Konto-Pauschale."""
    return [
        {
            "country": "DE",
            "region": land,
            "price": VERSAND_NAH if land in NAHE_REGIONEN else VERSAND_FERN,
        }
        for land in BUNDESLAENDER
    ]


def ensure_gebraucht(titel, condition):
    """Setzt 'gebraucht' in den Titel - danach suchen die Leute.

    Vor die Massangabe, weil die uebrigen Titel es genau dort stehen haben.
    Fehlt eine Massangabe, wird angehaengt.
    """
    if condition != "used" or not titel:
        return titel
    if "gebraucht" in titel.lower():
        return titel

    mass = re.search(r"\d{3,4}\s*[xX\u00d7]\s*\d{3,4}", titel)
    if mass:
        return f"{titel[:mass.start()]}gebraucht {titel[mass.start():]}".strip()
    return f"{titel} gebraucht"


def description_of(produkt):
    text = (produkt.get("beschreibung") or "").strip()
    if not text:
        titel = clean_title(produkt.get("titel", "")) or "Dieser Artikel"
        text = (
            f"{titel} – verfügbar bei Fensterhandel Christ in Brandenburg an der Havel. "
            "Abholung vor Ort im Hofverkauf oder Lieferung nach Absprache. "
            "Maße und Zustand auf Anfrage."
        )
    # Nach vorne, weil Google bei den Produktdetails den Anfang zeigt.
    platz = MAX_DESCRIPTION - len(ABHOL_HINWEIS) - 2
    return f"{ABHOL_HINWEIS}\n\n{text[:platz].rstrip()}"


def _has_price(produkt):
    try:
        return float(produkt.get("sonderpreis_eur") or produkt.get("preis_eur") or 0) > 0
    except (TypeError, ValueError):
        return False


def build_items(produkte, kategorien=None):
    """Baut die Feed-Eintraege. Ueberspringt, was Google ohnehin ablehnen wuerde."""
    kategorien = kategorien or {}
    items = []

    for p in produkte:
        if not p.get("aktiv"):
            continue
        if not p.get("bilder"):
            continue
        if not _has_price(p):
            continue

        pid = str(p.get("id") or "").strip()
        if not pid:
            continue

        fester_titel = TITEL_UEBERSCHREIBUNG.get(pid)
        titel = fester_titel or clean_title(p.get("titel", ""))
        if not titel:
            continue
        if not fester_titel:
            titel = ensure_gebraucht(titel, condition_of(p))

        bilder = [normalize_image_url(b) for b in p["bilder"]]
        bilder = [b for b in bilder if b]
        if not bilder:
            continue

        hauptbild = BILD_UEBERSCHREIBUNG.get(pid, bilder[0])
        weitere = [b for b in bilder[1:] if b != hauptbild][:MAX_ADDITIONAL_IMAGES]

        items.append({
            "id": pid,
            "title": titel[:MAX_TITLE],
            "description": description_of(p),
            "link": f"{SHOP_URL}?produkt={pid}",
            "image_link": hauptbild,
            "additional_image_link": weitere,
            "price": price_of(p),
            "availability": availability_of(p),
            "condition": condition_of(p),
            "identifier_exists": "no",
            "shipping": shipping_of(),
            "product_type": kategorien.get(p.get("kategorie_key"), "") or "",
        })

    return items


def _tag(name, wert):
    return f"      <g:{name}>{escape(str(wert))}</g:{name}>\n"


def build_feed(produkte, kategorien=None):
    items = build_items(produkte, kategorien)

    out = ['<?xml version="1.0" encoding="UTF-8"?>\n']
    out.append('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n')
    out.append("  <channel>\n")
    out.append("    <title>DeineFenster Shop</title>\n")
    out.append(f"    <link>{SHOP_URL}</link>\n")
    out.append("    <description>Gebrauchte und neue Fenster, Türen und Dämmung — "
               "Fensterhandel Christ, Brandenburg an der Havel</description>\n")

    for it in items:
        out.append("    <item>\n")
        for feld in ("id", "title", "description", "link", "image_link",
                     "price", "availability", "condition", "identifier_exists"):
            out.append(_tag(feld, it[feld]))
        if it["product_type"]:
            out.append(_tag("product_type", it["product_type"]))
        for bild in it["additional_image_link"]:
            out.append(_tag("additional_image_link", bild))
        for v in it["shipping"]:
            out.append("      <g:shipping>\n")
            out.append(f"        <g:country>{v['country']}</g:country>\n")
            out.append(f"        <g:region>{v['region']}</g:region>\n")
            out.append(f"        <g:price>{v['price']}</g:price>\n")
            out.append("      </g:shipping>\n")
        out.append("    </item>\n")

    out.append("  </channel>\n</rss>\n")
    return "".join(out)


def main():
    hier = os.path.dirname(os.path.abspath(__file__))
    wurzel = os.path.abspath(os.path.join(hier, "..", ".."))
    quelle = os.path.join(wurzel, "data", "shop-produkte.json")
    ziel = os.path.join(wurzel, "feed.xml")

    with open(quelle, encoding="utf-8") as f:
        daten = json.load(f)

    produkte = daten.get("produkte", [])
    kategorien = daten.get("kategorien", {})

    xml = build_feed(produkte, kategorien)

    with open(ziel, "w", encoding="utf-8") as f:
        f.write(xml)

    anzahl = xml.count("<item>")
    print(f"feed.xml geschrieben: {anzahl} von {len(produkte)} Produkten "
          f"({len(produkte) - anzahl} uebersprungen: inaktiv, ohne Bild oder ohne Preis)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
