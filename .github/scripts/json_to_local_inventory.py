"""Erzeugt local-inventory.xml — den Bestandsfeed fuer die Abholung im Hofverkauf.

Google zeigt damit "Im Geschaeft verfuegbar" samt Entfernung an, statt Versand.
Der Kunde reserviert und holt ab; ein Kaufabschluss auf der Website ist dafuer
nicht noetig.

Aufruf:  python3 .github/scripts/json_to_local_inventory.py
Schreibt local-inventory.xml ins Repo-Wurzelverzeichnis.

WICHTIG — vor dem ersten Einsatz einzutragen:
  STORE_CODE muss der Filialnummer entsprechen, die im Google-Unternehmensprofil
  fuer den Hofverkauf vergeben wird. Solange dort der Platzhalter steht, lehnt
  Google den Feed ab.
"""
import json
import os
import sys
from xml.sax.saxutils import escape

import json_to_google_feed as haupt

# Filialnummer aus dem Google-Unternehmensprofil. Muss dort exakt so stehen.
STORE_CODE = os.environ.get("DF_STORE_CODE", "HOFVERKAUF-BRB")

# Abholart: "reserve" = Kunde reserviert online, kauft und zahlt vor Ort.
# Genau deshalb braucht der Shop keinen Bezahlvorgang.
ABHOLART = "reserve"
ABHOLART_AUSVERKAUFT = "not supported"

# Ware liegt auf dem Hof, also am selben Tag abholbar.
ABHOLZEIT = "same day"


def availability_of(produkt):
    """limited bei Einzelstuecken, damit niemand zwei davon reserviert."""
    bestand = produkt.get("lagerbestand")
    if bestand is None:
        return "in_stock"
    try:
        bestand = float(bestand)
    except (TypeError, ValueError):
        return "in_stock"
    if bestand <= 0:
        return "out_of_stock"
    if bestand <= 1:
        return "limited"
    return "in_stock"


def quantity_of(produkt):
    bestand = produkt.get("lagerbestand")
    if bestand is None:
        return None
    try:
        return max(0, int(float(bestand)))
    except (TypeError, ValueError):
        return None


def build_rows(produkte, store_code=STORE_CODE):
    """Dieselbe Auswahl wie im Hauptfeed - sonst kennt Google die Artikel nicht."""
    rows = []

    for p in produkte:
        # Der Hauptfeed entscheidet, was ueberhaupt zu Google geht.
        if not haupt.build_items([p]):
            continue

        verfuegbar = availability_of(p)
        rows.append({
            "store_code": store_code,
            "id": str(p.get("id")).strip(),
            "price": haupt.price_of(p),
            "availability": verfuegbar,
            "quantity": quantity_of(p),
            "pickup_method": ABHOLART if verfuegbar != "out_of_stock" else ABHOLART_AUSVERKAUFT,
            "pickup_sla": ABHOLZEIT,
        })

    return rows


def _tag(name, wert):
    return f"      <g:{name}>{escape(str(wert))}</g:{name}>\n"


def build_feed(produkte, store_code=STORE_CODE):
    rows = build_rows(produkte, store_code)

    out = ['<?xml version="1.0" encoding="UTF-8"?>\n']
    out.append('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n')
    out.append("  <channel>\n")
    out.append("    <title>DeineFenster Hofverkauf — Bestand vor Ort</title>\n")
    out.append("    <link>https://deinefenster.de/shop.html</link>\n")
    out.append("    <description>Verfügbarkeit zur Abholung bei Fensterhandel Christ, "
               "Brandenburg an der Havel</description>\n")

    for r in rows:
        out.append("    <item>\n")
        out.append(_tag("store_code", r["store_code"]))
        out.append(_tag("id", r["id"]))
        out.append(_tag("price", r["price"]))
        out.append(_tag("availability", r["availability"]))
        if r["quantity"] is not None:
            out.append(_tag("quantity", r["quantity"]))
        out.append(_tag("pickup_method", r["pickup_method"]))
        out.append(_tag("pickup_sla", r["pickup_sla"]))
        out.append("    </item>\n")

    out.append("  </channel>\n</rss>\n")
    return "".join(out)


def main():
    hier = os.path.dirname(os.path.abspath(__file__))
    wurzel = os.path.abspath(os.path.join(hier, "..", ".."))
    quelle = os.path.join(wurzel, "data", "shop-produkte.json")
    ziel = os.path.join(wurzel, "local-inventory.xml")

    with open(quelle, encoding="utf-8") as f:
        daten = json.load(f)

    produkte = daten.get("produkte", [])
    xml = build_feed(produkte)

    with open(ziel, "w", encoding="utf-8") as f:
        f.write(xml)

    anzahl = xml.count("<item>")
    print(f"local-inventory.xml geschrieben: {anzahl} Artikel zur Abholung "
          f"(Filiale {STORE_CODE})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
