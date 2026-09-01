"""Tests fuer den Google-Produktfeed-Generator.

Ausfuehren:  python3 .github/scripts/test_google_feed.py
Exit 0 = alle gruen, Exit 1 = mindestens ein Fehler.
"""
import sys
import xml.etree.ElementTree as ET

import json_to_google_feed as gen

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
    """Minimal gueltiges Produkt, per Keyword ueberschreibbar."""
    p = {
        "id": "p_test1",
        "titel": "1 Fluegel Fenster gebraucht 1220 x 1290",
        "kategorie_key": "fenster-1fluegel",
        "zustand": ["gebraucht"],
        "preis_eur": 140,
        "sonderpreis_eur": None,
        "lagerbestand": 1,
        "standnummer": "A12",
        "bilder": ["https://sarahhheea.github.io/deinefenster-live/img/shop/a.jpg"],
        "beschreibung": "Ein gutes Fenster.",
        "aktiv": True,
    }
    p.update(over)
    return p


# --- clean_title: interne Standortnummer darf nicht zu Google ---------------

check("Standortnummer 'Nr. 1219' wird entfernt",
      gen.clean_title("1 Fluegel Balkontuer DIN Links 1070 x 2220 Nr. 1219"),
      "1 Fluegel Balkontuer DIN Links 1070 x 2220")

check("Standortnummer ohne Punkt 'Nr 400 A' wird entfernt",
      gen.clean_title("Festverglasung fuer Gewaechshaus 1350 x 1490 Nr 400 A"),
      "Festverglasung fuer Gewaechshaus 1350 x 1490")

check("Standortnummer ohne Leerzeichen 'Nr.1502' wird entfernt",
      gen.clean_title("1 Fluegel Balkontuer DIN Rechts 830 x 2290 Nr.1502"),
      "1 Fluegel Balkontuer DIN Rechts 830 x 2290")

check("Masse bleiben unangetastet",
      gen.clean_title("1 Fluegel Fenster gebraucht 1220 x 1290"),
      "1 Fluegel Fenster gebraucht 1220 x 1290")

check("'Nr' ohne folgende Zahl bleibt stehen (kein Kahlschlag)",
      gen.clean_title("Balkontuer Nr DIN Links 1070 x 2220 Nr. 1219"),
      "Balkontuer Nr DIN Links 1070 x 2220")

# Standplatz-Codes sind 1-3 Grossbuchstaben hinter der Nummer.
check("Code mit zwei Buchstaben 'Nr. 1007 AB' wird entfernt",
      gen.clean_title("1 Fluegel Fenster gebraucht 1300 x 800 Nr. 1007 AB"),
      "1 Fluegel Fenster gebraucht 1300 x 800")

check("Code mit drei Buchstaben 'Nr. 2800 KNK' wird entfernt",
      gen.clean_title("Haustuer Anthrazit 1225 x 2240 Nr. 2800 KNK"),
      "Haustuer Anthrazit 1225 x 2240")

check("Code ohne Leerzeichen 'Nr.2808 DDD' wird entfernt",
      gen.clean_title("1 Fluegel weiss 1000 x 1000 Nr.2808 DDD"),
      "1 Fluegel weiss 1000 x 1000")

check("Nummer mit Schraegstrich 'Nr. 0311/1  A' wird entfernt",
      gen.clean_title("Balkontuer mit Kaempfer DIN Rechts 1000 x 2370 Nr. 0311/1  A"),
      "Balkontuer mit Kaempfer DIN Rechts 1000 x 2370")

check("Wort 'Standort' vor der Nummer wird mit entfernt",
      gen.clean_title("1 Fluegel Fenster mit Unterlicht 1060 x 1870 Standort Nr 0018"),
      "1 Fluegel Fenster mit Unterlicht 1060 x 1870")

# Kritisch: hinter der Nummer stehen echte Produktangaben, die bleiben muessen.
check("Angabe hinter der Nummer bleibt erhalten ('nach Aussen oeffnend')",
      gen.clean_title("Haustuer 1000 x 2100 DIN Rechts  Nr. 5201 R  nach Aussen oeffnend"),
      "Haustuer 1000 x 2100 DIN Rechts nach Aussen oeffnend")

check("Suchbegriffe hinter der Nummer bleiben erhalten",
      gen.clean_title("3 Fluegel Fenster gebraucht 2560 x 1500 Standort Nr 0013/1 A Fenster kaufen"),
      "3 Fluegel Fenster gebraucht 2560 x 1500 Fenster kaufen")

check("langes Wort hinter der Nummer wird nicht als Code verwechselt",
      gen.clean_title("1 Fluegel Fenster 1060 x 1870 Nr 0018 Kunststofffenster"),
      "1 Fluegel Fenster 1060 x 1870 Kunststofffenster")

check("'DIN L' mitten im Titel bleibt unangetastet",
      gen.clean_title("1 Fluegel Fenster 800 x 820 DIN L Anthrazit 3 Fach Nr. 2702 ZY"),
      "1 Fluegel Fenster 800 x 820 DIN L Anthrazit 3 Fach")

check("doppelte Leerzeichen werden aufgeraeumt",
      gen.clean_title("2 Fluegel  Fenster 3 Fach Glas 1530 x 950  Nr. 2800 KNM"),
      "2 Fluegel Fenster 3 Fach Glas 1530 x 950")


# --- Bild-URLs -------------------------------------------------------------

check("github.io-URL wird auf die eigene Domain umgeschrieben",
      gen.normalize_image_url("https://sarahhheea.github.io/deinefenster-live/img/shop/a.jpg"),
      "https://deinefenster.de/img/shop/a.jpg")

check("relativer Bildpfad wird absolut",
      gen.normalize_image_url("img/fenster_standard.png"),
      "https://deinefenster.de/img/fenster_standard.png")

check("bereits korrekte URL bleibt unveraendert",
      gen.normalize_image_url("https://deinefenster.de/img/shop/b.webp"),
      "https://deinefenster.de/img/shop/b.webp")


# --- zustand: mal Liste, mal String (273 Artikel im Live-Datensatz) --------

check("zustand als Liste ['gebraucht'] -> used",
      gen.condition_of(produkt(zustand=["gebraucht"])), "used")

check("zustand als String 'gebraucht' -> used",
      gen.condition_of(produkt(zustand="gebraucht")), "used")

check("zustand als String 'neu' -> new",
      gen.condition_of(produkt(zustand="neu")), "new")

check("zustand ['neu', 'vermessen'] -> new",
      gen.condition_of(produkt(zustand=["neu", "vermessen"])), "new")

check("gemischt ['gebraucht', 'sonderposten'] -> used (gebraucht gewinnt)",
      gen.condition_of(produkt(zustand=["gebraucht", "sonderposten"])), "used")

check("zustand ['sonderposten'] -> new",
      gen.condition_of(produkt(zustand=["sonderposten"])), "new")

check("zustand leer -> used (konservativ)",
      gen.condition_of(produkt(zustand=[])), "used")


# --- Preis -----------------------------------------------------------------

check("Preis wird als '140.00 EUR' formatiert",
      gen.price_of(produkt(preis_eur=140)), "140.00 EUR")

check("Sonderpreis schlaegt Normalpreis",
      gen.price_of(produkt(preis_eur=140, sonderpreis_eur=99)), "99.00 EUR")

check("Kommazahl wird korrekt formatiert",
      gen.price_of(produkt(preis_eur=42.5)), "42.50 EUR")


# --- Verfuegbarkeit --------------------------------------------------------

check("Lagerbestand 300 -> in_stock",
      gen.availability_of(produkt(lagerbestand=300)), "in_stock")

check("Lagerbestand 0 -> out_of_stock",
      gen.availability_of(produkt(lagerbestand=0)), "out_of_stock")

check("Lagerbestand None -> in_stock (Standardware ohne Zaehlung)",
      gen.availability_of(produkt(lagerbestand=None)), "in_stock")


# --- Beschreibung ----------------------------------------------------------

check_true("leere Beschreibung bekommt Ersatztext",
           len(gen.description_of(produkt(beschreibung=""))) > 20,
           "197 Artikel im Live-Datensatz haben keinen Text")

check_true("vorhandene Beschreibung bleibt erhalten",
           "Ein gutes Fenster." in gen.description_of(produkt(beschreibung="Ein gutes Fenster.")))

check_true("zu lange Beschreibung wird auf 5000 Zeichen gekuerzt",
           len(gen.description_of(produkt(beschreibung="x" * 6000))) <= 5000)


# --- Auswahl: was kommt ueberhaupt in den Feed -----------------------------

check("inaktives Produkt wird uebersprungen",
      gen.build_items([produkt(aktiv=False)]), [])

check("Produkt ohne Bild wird uebersprungen",
      gen.build_items([produkt(bilder=[])]), [])

check("Produkt ohne Preis wird uebersprungen",
      gen.build_items([produkt(preis_eur=0)]), [])

check_true("gueltiges Produkt kommt rein",
           len(gen.build_items([produkt()])) == 1)


# --- XML-Ausgabe -----------------------------------------------------------

xml = gen.build_feed([produkt(id="p_x", titel="Fenster & Tuer <Test> Nr. 99")])
root = ET.fromstring(xml)
item = root.find("./channel/item")

check_true("Feed ist gueltiges XML", item is not None)
check("id landet im Feed", item.findtext(G + "id"), "p_x")
check_true("Sonderzeichen werden escaped statt das XML zu zerstoeren",
           item.findtext(G + "title").startswith("Fenster & Tuer <Test>"))
check("link zeigt auf die Produktseite im Shop",
      item.findtext(G + "link"),
      "https://deinefenster.de/shop.html?produkt=p_x")
check("identifier_exists=no (wir haben keine GTIN)",
      item.findtext(G + "identifier_exists"), "no")
check_true("Bild-Link ist gesetzt", bool(item.findtext(G + "image_link")))

# Titellaenge: Google kappt bei 150
long_title = "A" * 200
xml2 = gen.build_feed([produkt(id="p_y", titel=long_title)])
t2 = ET.fromstring(xml2).find("./channel/item").findtext(G + "title")
check_true("zu langer Titel wird auf 150 Zeichen gekuerzt", len(t2) <= 150)


# --- Daemmung: Titel-/Bild-Ueberschreibung ---------------------------------

daem = produkt(id="p_1779382702846",
               titel="Daemmung Klemmfilz 150 mm hoch 6,24 qm eine Rolle",
               preis_eur=42, lagerbestand=300, zustand=["neu"])
d_item = gen.build_items([daem])[0]
check_true("Daemmung bekommt den fuer die Suche optimierten Titel",
           d_item["title"] != "Daemmung Klemmfilz 150 mm hoch 6,24 qm eine Rolle",
           f"bekommen: {d_item['title']!r}")
check_true("Daemmung-Titel enthaelt '150 mm'", "150 mm" in d_item["title"])
check("Daemmung nutzt das freigegebene Foto",
      d_item["image_link"], "https://deinefenster.de/img/shop/daemmung-rolle.webp")


# --- Versandkosten: regional gestaffelt statt Konto-Pauschale --------------

v_item = gen.build_items([produkt()])[0]
versand = v_item["shipping"]

check("Versand deckt alle 16 Bundeslaender ab", len(versand), 16)
check("jedes Bundesland genau einmal",
      len({v["region"] for v in versand}), 16)
check_true("Versand immer Land DE",
           all(v["country"] == "DE" for v in versand))

nah = {v["region"]: v["price"] for v in versand if v["region"] in ("BE", "BB")}
check("Berlin bekommt den Nahpreis", nah.get("BE"), "99.00 EUR")
check("Brandenburg bekommt den Nahpreis", nah.get("BB"), "99.00 EUR")

fern = [v for v in versand if v["region"] not in ("BE", "BB")]
check("14 Bundeslaender bekommen den Fernpreis", len(fern), 14)
check_true("Fernpreis ist ueberall 250.00 EUR",
           all(v["price"] == "250.00 EUR" for v in fern),
           f"abweichend: {[v for v in fern if v['price'] != '250.00 EUR']}")

x = gen.build_feed([produkt()])
check("XML enthaelt 16 Versandbloecke", x.count("<g:shipping>"), 16)
check_true("XML nennt Brandenburg mit 99 EUR",
           "<g:region>BB</g:region>" in x and "99.00 EUR" in x)
check_true("XML nennt kein Bundesland doppelt",
           x.count("<g:region>BE</g:region>") == 1)


# --- Selbstabholung: Hinweis gehoert an jede Beschreibung ------------------

check_true("Beschreibung nennt kostenlose Selbstabholung",
           "Selbstabholung" in v_item["description"]
           and "kostenlos" in v_item["description"])
check_true("Abholhinweis steht vorn, Google zeigt den Anfang",
           v_item["description"].startswith("Selbstabholung"))
check_true("Produkttext folgt dahinter",
           "Ein gutes Fenster." in v_item["description"])
check_true("Abholhinweis nennt den Ort",
           "Brandenburg an der Havel" in v_item["description"])

leer = gen.build_items([produkt(beschreibung="")])[0]
check_true("auch ohne eigenen Text kommt der Abholhinweis",
           "Selbstabholung" in leer["description"])
check_true("Hinweis sagt, dass Lieferung nicht garantiert ist",
           "nicht garantiert" in leer["description"]
           and "angefragt" in leer["description"])
check_true("Abholhinweis steht nur einmal drin",
           leer["description"].count("Selbstabholung") == 1)

lang = gen.build_items([produkt(beschreibung="W" * 5200)])[0]
check_true("sehr lange Beschreibung bleibt unter dem Limit",
           len(lang["description"]) <= gen.MAX_DESCRIPTION,
           f"Laenge: {len(lang['description'])}")
check_true("bei langer Beschreibung ueberlebt der Abholhinweis",
           "Selbstabholung" in lang["description"])


# --- Titel: 'gebraucht' muss rein, damit Kunden uns finden -----------------

g1 = gen.build_items([produkt(titel="Festverglasung Holzfenster Einzelstueck 970 x 1280",
                              zustand=["gebraucht"])])[0]
check("gebraucht wird vor den Massen ergaenzt",
      g1["title"], "Festverglasung Holzfenster Einzelstueck gebraucht 970 x 1280")

g2 = gen.build_items([produkt(titel="2 Fluegel Fenster gebraucht 1160 x 1365",
                              zustand=["gebraucht"])])[0]
check("vorhandenes 'gebraucht' wird nicht verdoppelt",
      g2["title"], "2 Fluegel Fenster gebraucht 1160 x 1365")

g3 = gen.build_items([produkt(titel="Kunststofffenster weiss 1000 x 1200",
                              zustand=["neu"])])[0]
check("Neuware bekommt kein 'gebraucht'",
      g3["title"], "Kunststofffenster weiss 1000 x 1200")

g4 = gen.build_items([produkt(titel="Fenster Sonderposten 800 x 900",
                              zustand=["sonderposten"])])[0]
check_true("Sonderposten bekommt kein 'gebraucht'",
           "gebraucht" not in g4["title"])

g5 = gen.build_items([produkt(titel="Altes Holzfenster ohne Massangabe",
                              zustand=["gebraucht"])])[0]
check("ohne Massangabe wird angehaengt",
      g5["title"], "Altes Holzfenster ohne Massangabe gebraucht")

g6 = gen.build_items([produkt(titel="Grossformatiges Kunststofffenster " + "sehr " * 30 + "1000 x 1200",
                              zustand=["gebraucht"])])[0]
check_true("Titel bleibt unter 150 Zeichen", len(g6["title"]) <= gen.MAX_TITLE,
           f"Laenge: {len(g6['title'])}")

g7 = gen.build_items([produkt(id="p_1779382702846", titel="Daemmung Klemmfilz",
                              zustand=["neu"], preis_eur=42)])[0]
check_true("die feste Daemmung-Ueberschreibung bleibt unberuehrt",
           "gebraucht" not in g7["title"])

g8 = gen.build_items([produkt(titel="1 Fluegel Fenster Gebraucht 900 x 1440",
                              zustand=["gebraucht"])])[0]
check("grossgeschriebenes 'Gebraucht' zaehlt auch",
      g8["title"], "1 Fluegel Fenster Gebraucht 900 x 1440")


# --- Ergebnis --------------------------------------------------------------

print()
if _failures:
    print(f"FEHLGESCHLAGEN: {len(_failures)}  |  bestanden: {_passed}")
    for f in _failures:
        print(f"  [X] {f}")
    sys.exit(1)

print(f"Alle {_passed} Tests gruen.")
sys.exit(0)
