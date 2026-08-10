"""Tests fuer den Feed zum lokalen Inventar (Abholung im Hofverkauf).

Ausfuehren:  python3 .github/scripts/test_local_inventory.py
Exit 0 = alle gruen, Exit 1 = mindestens ein Fehler.
"""
import sys
import xml.etree.ElementTree as ET

import json_to_local_inventory as lokal

G = "{http://base.google.com/ns/1.0}"

_failures = []
_passed = 0


def check(name, got, want):
    global _passed
    if got == want:
        _passed += 1
    else:
        _failures.append(f"{name}\n     erwartet: {want!r}\n     bekommen: {got!r}")


def check_true(name, cond, hint=""):
    global _passed
    if cond:
        _passed += 1
    else:
        _failures.append(f"{name}\n     Bedingung nicht erfuellt. {hint}")


def produkt(**over):
    p = {
        "id": "p_test1",
        "titel": "Dämmung Glaswolle 150 mm",
        "kategorie_key": "daemmung",
        "zustand": ["neu"],
        "preis_eur": 42,
        "sonderpreis_eur": None,
        "lagerbestand": 300,
        "bilder": ["https://deinefenster.de/img/shop/a.jpg"],
        "beschreibung": "Text.",
        "aktiv": True,
    }
    p.update(over)
    return p


# --- Auswahl: muss zum Hauptfeed passen -----------------------------------

check("inaktives Produkt kommt nicht ins lokale Inventar",
      lokal.build_rows([produkt(aktiv=False)], "STORE1"), [])

check("Produkt ohne Preis kommt nicht rein",
      lokal.build_rows([produkt(preis_eur=0)], "STORE1"), [])

check("Produkt ohne Bild kommt nicht rein",
      lokal.build_rows([produkt(bilder=[])], "STORE1"), [])

check_true("gueltiges Produkt kommt rein",
           len(lokal.build_rows([produkt()], "STORE1")) == 1)


# --- Pflichtfelder ---------------------------------------------------------

zeile = lokal.build_rows([produkt()], "HOFVERKAUF")[0]

check("store_code kommt aus der Filialangabe", zeile["store_code"], "HOFVERKAUF")
check("id ist dieselbe wie im Hauptfeed", zeile["id"], "p_test1")
check("Preis im selben Format wie im Hauptfeed", zeile["price"], "42.00 EUR")
check("Lagerbestand landet als Menge im Feed", zeile["quantity"], 300)


# --- Verfuegbarkeit --------------------------------------------------------

check("Bestand 300 -> in_stock",
      lokal.build_rows([produkt(lagerbestand=300)], "S")[0]["availability"], "in_stock")

check("Bestand 0 -> out_of_stock",
      lokal.build_rows([produkt(lagerbestand=0, aktiv=True)], "S")[0]["availability"], "out_of_stock")

# Achtung: Im Feed fuer lokales Inventar heisst der Wert "limited_availability".
# Das schlichte "limited" aus dem Hauptfeed lehnt Google hier ab.
check("Einzelstueck (Bestand 1) -> limited_availability, damit niemand zwei bestellt",
      lokal.build_rows([produkt(lagerbestand=1)], "S")[0]["availability"], "limited_availability")

check("kein blosses 'limited' - das lehnt Google beim lokalen Inventar ab",
      lokal.build_rows([produkt(lagerbestand=1)], "S")[0]["availability"] == "limited", False)

check("Bestand nicht gepflegt (None) -> in_stock",
      lokal.build_rows([produkt(lagerbestand=None)], "S")[0]["availability"], "in_stock")


# --- Abholung --------------------------------------------------------------

check("Abholart ist Reservieren (kein Online-Kauf noetig)",
      zeile["pickup_method"], "reserve")

check("Ware liegt am Lager -> Abholung am selben Tag",
      zeile["pickup_sla"], "same day")

check("Einzelstueck wird trotzdem am selben Tag abholbar gemeldet",
      lokal.build_rows([produkt(lagerbestand=1)], "S")[0]["pickup_sla"], "same day")

check("ausverkaufter Artikel bietet keine Abholung an",
      lokal.build_rows([produkt(lagerbestand=0)], "S")[0]["pickup_method"], "not supported")


# --- Sonderpreis -----------------------------------------------------------

check("Sonderpreis schlaegt Normalpreis auch im lokalen Inventar",
      lokal.build_rows([produkt(preis_eur=42, sonderpreis_eur=39)], "S")[0]["price"],
      "39.00 EUR")


# --- XML -------------------------------------------------------------------

xml = lokal.build_feed([produkt(id="p_x")], "HOF1")
root = ET.fromstring(xml)
item = root.find("./channel/item")

check_true("Feed ist gueltiges XML", item is not None)
check("id im XML", item.findtext(G + "id"), "p_x")
check("store_code im XML", item.findtext(G + "store_code"), "HOF1")
check("availability im XML", item.findtext(G + "availability"), "in_stock")
check("pickup_method im XML", item.findtext(G + "pickup_method"), "reserve")
check("pickup_sla im XML", item.findtext(G + "pickup_sla"), "same day")
check("quantity im XML", item.findtext(G + "quantity"), "300")

xml_esc = lokal.build_feed([produkt(id="p_&_x")], "HOF&1")
check("Sonderzeichen werden escaped",
      ET.fromstring(xml_esc).find("./channel/item").findtext(G + "id"), "p_&_x")


# --- Ergebnis --------------------------------------------------------------

print()
if _failures:
    print(f"FEHLGESCHLAGEN: {len(_failures)}  |  bestanden: {_passed}")
    for f in _failures:
        print(f"  [X] {f}")
    sys.exit(1)

print(f"Alle {_passed} Tests gruen.")
sys.exit(0)
