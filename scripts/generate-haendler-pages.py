#!/usr/bin/env python3
"""
Generiert 4 Drutex-Händler-Landingpages für deinefenster.de:
  - drutex-haendler-brandenburg.html
  - drutex-haendler-berlin.html
  - drutex-haendler-potsdam.html
  - drutex-haendler-magdeburg.html

Lokal optimiert, Schema.org JSON-LD, Quick-Anfrage-Form (Web3Forms).
"""
import os, json, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CITIES = {
    "brandenburg": {
        "name": "Brandenburg an der Havel",
        "name_short": "Brandenburg",
        "slug": "brandenburg",
        "distance_km": 0,
        "distance_text": "direkt vor Ort",
        "region_desc": "Im Westen Brandenburgs zwischen B1 und B102 gelegen, an der Havel — von der Altstadt bis Kirchmöser, Plaue und Hohenstücken sind wir der Drutex-Händler vor Ort. Auch aus dem Havelland (Premnitz, Rathenow, Nauen) und Potsdam-Mittelmark (Werder, Lehnin) kommen viele Bauherren direkt zu uns.",
        "anfahrt_text": "Unser Hof liegt in der Fohrder Landstraße 13, im Stadtteil Görden — gut erreichbar über die B1 von Osten (aus Richtung Potsdam) und die A2-Abfahrt Brandenburg-Wust von Westen. Parkplätze direkt am Hof.",
        "kunden_text": "Bauherren aus Brandenburg-Görden, Hohenstücken, Nord und der Altstadt holen ihre Drutex-Maßanfertigung meist selbst ab. Sanierungsbetriebe und Hausverwaltungen aus der Region bestellen größere Posten zur Lieferung an die Baustelle. Architektenbüros aus Brandenburg und dem Havelland nutzen unsere IGLO-EDGE-Beratung für Energieeffizienz-Konzepte.",
        "lieferung_lohnt": "Selbstabholung ist hier die naheliegende Wahl — die meisten Brandenburger packen die Fenster direkt auf den Anhänger. Anlieferung machen wir aber selbstverständlich auch, wenn größere Mengen oder Hebebühne nötig sind.",
        "faqs": [
            ("Wo finde ich den Drutex-Händler in Brandenburg an der Havel?",
             "Türen und Fensterhandel Christ, Fohrder Landstraße 13, 14772 Brandenburg an der Havel. Der Hof liegt im Stadtteil Görden, gut erreichbar über die B1. Telefonisch unter 03381 / 214 83 73 oder per WhatsApp 0171 7263776."),
            ("Kann ich Drutex-Fenster in Brandenburg direkt abholen?",
             "Ja. Neuware aus Maßanfertigung wird normalerweise per Spedition geliefert, kann aber bei örtlicher Bestellung auch am Hof übergeben werden — wir stimmen das individuell ab. Gebrauchte Fenster aus unserem Hofverkauf nehmen Sie ohnehin selbst mit (freitags 10–17 Uhr)."),
            ("Welche Drutex-Profile sind in Brandenburg am beliebtesten?",
             "Für Sanierungen in den Altbauten der Innenstadt wird oft IGLO 5 Classic gewählt (5-Kammer, 70 mm, Uw 0,83 W/m²K) — solides Profil, gutes Preis-Leistungs-Verhältnis. Für Neubauten in Hohenstücken und Görden eher IGLO Energy (7-Kammer, 82 mm, Uw 0,71 W/m²K) wegen KfW-Förderbarkeit."),
            ("Lohnt sich der Weg zum Hofverkauf für gebrauchte Fenster?",
             "Für Brandenburger ja — kein Weg. Der Hofverkauf läuft jeden Freitag 10–17 Uhr in der Fohrder Landstraße 13. Aktuelle Bestände wechseln, hier finden sich gebrauchte Kunststofffenster für Schuppen, Werkstatt, Anbau oder günstige Sanierung."),
            ("Wie lange dauert eine Drutex-Lieferung nach Brandenburg?",
             "Etwa 4–6 Wochen ab Auftragsbestätigung — Drutex fertigt jedes Fenster individuell in Polen, die Logistik nach Brandenburg ist routiniert. Bei Express-Bestellungen geben wir die voraussichtliche KW direkt im Angebot an.")
        ]
    },
    "berlin": {
        "name": "Berlin",
        "name_short": "Berlin",
        "slug": "berlin",
        "distance_km": 65,
        "distance_text": "rund 65 km Fahrtweg",
        "region_desc": "Berlin liegt etwa 65 km östlich von Brandenburg an der Havel — die Verbindung läuft über die A2 (Anschluss Brandenburg an der Havel) und die A100/Stadtring. Aus Spandau, Charlottenburg, Wilmersdorf und den westlichen Bezirken sind wir der nächstgelegene Drutex-Händler mit eigenem Lager und Hofverkauf.",
        "anfahrt_text": "Aus Berlin fahren Sie über die A2 Richtung Hannover bis Abfahrt Brandenburg-Wust (rund 50 Minuten ohne Stau aus Spandau, 70 Minuten aus Friedrichshain). Der Hof in der Fohrder Landstraße 13 liegt im Stadtteil Görden — ausgeschildert ab Abfahrt B1.",
        "kunden_text": "Aus Berlin bestellen oft Eigentümer aus Altbau-Sanierungen in Charlottenburg, Wilmersdorf und Tempelhof — gebrauchte Fenster für Hinterhausgebäude oder Neuware für Mietshäuser. Wohnungsbau-Genossenschaften aus dem Berliner Umland nutzen unseren Konfigurator für Bulk-Bestellungen mit Lieferung direkt zur Baustelle. Auch Berliner Bauherren, die in Brandenburg ein Wochenendhaus oder Eigenheim bauen, kaufen häufig bei uns.",
        "lieferung_lohnt": "Für 1–4 Fenster lohnt sich oft Selbstabholung mit Anhänger oder Sprinter (Mietwagen ab Berlin günstig). Für komplette Bestellungen ab 5 Fenstern oder bei großen Formaten ist Spedition meist die bequemere Wahl — wir liefern bis vor die Berliner Haustür.",
        "faqs": [
            ("Gibt es in Berlin selbst einen Drutex-Händler?",
             "Berlin hat einige Fachbetriebe, die Drutex anbieten — wir sind im näheren Umland (65 km westlich) und kombinieren Online-Konfigurator, Beratung per Telefon/WhatsApp und Lieferung deutschlandweit. Für Berliner Kunden ist die Anfahrt zum Hofverkauf für gebrauchte Fenster oder zur Beratung gut machbar."),
            ("Wie kommt die Drutex-Bestellung nach Berlin?",
             "Per Spedition direkt zur Baustelle oder zum Lieferort in Berlin — egal ob Innenstadt-Bezirk oder Randlage. Die Spediteure kennen Berliner Anfahrtsregeln (Halteverbote, Liefer-Zeitfenster) und stimmen den Termin vorab ab."),
            ("Was kostet die Lieferung nach Berlin?",
             "Die Lieferkosten richten sich nach Stückzahl und Format der Fenster und werden im individuellen Angebot ausgewiesen. Lieferung ist in der Regel günstiger als der Aufwand für einen eigenen Transport mit Mietwagen — wir berechnen das fair pro Auftrag."),
            ("Welche Drutex-Profile passen für Berliner Altbauten?",
             "Für denkmalgeschützte Altbauten in Charlottenburg, Mitte und Friedrichshain wird oft IGLO Light verwendet (schlankere Profile, mehr Glasanteil bei kleinen Sprossenfenstern). Für Neubau und KfW-geförderte Sanierungen passt IGLO Energy (7-Kammer, Uw 0,71)."),
            ("Lohnt sich die Anfahrt von Berlin zum Hofverkauf?",
             "Für gebrauchte Fenster zur Selbstabholung lohnt sich die Anfahrt erfahrungsgemäß ab 3–5 Stück. Berliner Kunden kombinieren das oft mit einem Ausflug ins Havelland — Mietwagen oder Anhänger ab Berlin lohnt sich preislich gegenüber Großstadt-Baumärkten.")
        ]
    },
    "potsdam": {
        "name": "Potsdam",
        "name_short": "Potsdam",
        "slug": "potsdam",
        "distance_km": 35,
        "distance_text": "rund 35 km Fahrtweg",
        "region_desc": "Potsdam liegt rund 35 km östlich von Brandenburg an der Havel — direkt verbunden über die B1, die als Havel-Achse durch das gesamte Stadtgebiet führt. Aus Potsdam-West, der Innenstadt, Babelsberg und Drewitz sind wir der nächstgelegene Drutex-Fachhändler mit eigenem Lager und Hofverkauf.",
        "anfahrt_text": "Aus Potsdam einfach die B1 Richtung Westen — durchgehend ohne Umwege etwa 30–40 Minuten bis zur Fohrder Landstraße 13. Alternativ über die A10 (Berliner Ring) und Abfahrt Brandenburg-Wust auf die B102. Bahnverbindung Potsdam Hbf → Brandenburg Hbf in rund 35 Minuten, ab Bahnhof 12 Minuten mit dem Bus.",
        "kunden_text": "Potsdamer Bauherren — Sanierer in Babelsberg, Eigentümer in Potsdam-Nord, Architekten aus der Innenstadt — bestellen regelmäßig bei uns. Die Nähe macht persönliche Beratung vor Ort einfach: viele kommen für die Profil-Auswahl direkt zu uns, schauen die Drutex-Musterfenster an und nehmen kleinere Bestellungen gleich mit.",
        "lieferung_lohnt": "Bei 35 km lohnt sich beides — Selbstabholung mit Anhänger oder Lieferung. Für 1–3 Fenster oder kleine Türen kommen die meisten Potsdamer selbst vorbei. Größere Aufträge ab 5–10 Fenstern lassen sich preislich oft besser per Spedition direkt zur Baustelle bringen.",
        "faqs": [
            ("Gibt es in Potsdam einen Drutex-Händler vor Ort?",
             "Wir sind im Nachbarort Brandenburg an der Havel — rund 35 km westlich, direkt über die B1 erreichbar. Für Potsdamer Kunden sind wir der nächstgelegene Drutex-Händler mit eigenem Hof, Lager und Hofverkauf."),
            ("Wie lange dauert die Fahrt von Potsdam zum Hof?",
             "Etwa 30–40 Minuten über die B1 — eine gerade Verbindung entlang der Havel ohne große Umwege. Wer den Berliner Ring (A10) bevorzugt, fährt über Abfahrt Brandenburg-Wust und ist etwa gleich schnell da."),
            ("Lohnt sich die Anfahrt für Drutex-Beratung?",
             "Ja — gerade für Potsdamer ist der Weg überschaubar. Viele kommen einmalig für die Profil-Auswahl und Maßabnahme vorbei und bestellen danach online über den Konfigurator. Termin per WhatsApp 0171 7263776 abstimmen."),
            ("Welche Drutex-Profile sind für Potsdamer Sanierungen geeignet?",
             "Für Potsdamer Gründerzeit- und Jugendstil-Häuser (Babelsberg, Innenstadt-Nord) ist IGLO 5 Classic ein bewährter Allrounder — solide Wärmedämmung (Uw 0,83) bei vertretbarem Preis. Bei KfW-geförderten Komplettsanierungen empfehlen wir IGLO Energy (Uw 0,71)."),
            ("Kommt die Drutex-Lieferung bis nach Potsdam?",
             "Ja, deutschlandweit — selbstverständlich auch nach Potsdam. Die Spedition liefert in alle Potsdamer Stadtteile, von der Innenstadt bis Marquardt oder Groß Glienicke. Lieferzeit ab Auftragsbestätigung etwa 4–6 Wochen.")
        ]
    },
    "magdeburg": {
        "name": "Magdeburg",
        "name_short": "Magdeburg",
        "slug": "magdeburg",
        "distance_km": 65,
        "distance_text": "rund 65 km Fahrtweg",
        "region_desc": "Magdeburg liegt etwa 65 km westlich von Brandenburg an der Havel — direkt über die A2 (Hannover-Berlin-Achse) verbunden. Für Bauherren aus Magdeburg, Burg und dem nördlichen Jerichower Land sind wir der nächste Drutex-Händler östlich der Elbe.",
        "anfahrt_text": "Aus Magdeburg einfach die A2 Richtung Berlin, Abfahrt Brandenburg-Wust oder Brandenburg-Süd (je nach Stadtteil) — etwa 50–60 Minuten. Über die B1 (Magdeburg → Burg → Brandenburg) ist die Fahrt etwa gleich lang, aber gemütlicher (kein Lkw-Stau auf der A2). Hofadresse Fohrder Landstraße 13.",
        "kunden_text": "Aus Magdeburg, Burg und dem Jerichower Land kommen vor allem Bauherren mit Einfamilienhaus-Projekten und Hausverwaltungen mit Wohnungs-Sanierungen. Die Nähe entlang der A2 macht uns zur logischen Wahl für die Region — gerade wenn lokale Fachbetriebe Drutex-Profile nicht im Sortiment haben oder Lieferzeiten knapp sind.",
        "lieferung_lohnt": "Bei 65 km Distanz lohnt sich Lieferung per Spedition meist mehr als Selbstabholung — gerade bei mehreren Fenstern oder Türen. Für Einzelstücke oder gebrauchte Fenster vom Hofverkauf kommen Magdeburger trotzdem regelmäßig vorbei, meist freitags zum Hofverkauf (10–17 Uhr).",
        "faqs": [
            ("Gibt es in Magdeburg einen Drutex-Händler?",
             "Magdeburg hat Fenster-Fachbetriebe, aber wenige mit dem vollen Drutex-Sortiment und eigenem Lager. Wir sind 65 km östlich, direkt über die A2 erreichbar — die nächstgelegene Drutex-Verkaufsstelle mit Konfigurator, Hofverkauf und Spedition-Lieferung deutschlandweit."),
            ("Wie kommt die Drutex-Bestellung nach Magdeburg?",
             "Per Spedition zur Baustelle oder zum Lieferort in Magdeburg, Burg oder ins Jerichower Land. Die Logistik über die A2 ist gut eingespielt — Lieferzeit ab Auftragsbestätigung etwa 4–6 Wochen für Maßanfertigung."),
            ("Lohnt sich die Anfahrt von Magdeburg?",
             "Für die einmalige Beratung mit Profilauswahl ja — viele Magdeburger kommen einmal vorbei, sehen sich die IGLO-Profile in echt an und bestellen danach über den Konfigurator. Für gebrauchte Fenster ab 3–5 Stück lohnt sich die Selbstabholung mit Anhänger meist."),
            ("Welche Drutex-Profile werden im Magdeburger Raum gewählt?",
             "Für Sanierungen in Magdeburg-Stadtfeld, Neue Neustadt und Sudenburg wird oft IGLO 5 Classic verwendet — bewährter 5-Kammer-Aufbau, gutes Preis-Leistungs-Verhältnis. Bei Neubauten und KfW-Sanierungen tendieren Bauherren zu IGLO Energy (Uw 0,71, förderfähig)."),
            ("Was kostet die Lieferung nach Magdeburg?",
             "Lieferkosten richten sich nach Stückzahl und Format und werden im Angebot ausgewiesen. Über die A2-Achse ist Magdeburg gut angebunden — die Spediteure berechnen die Strecke fair pro Auftrag.")
        ]
    }
}


def build_page(city_key):
    c = CITIES[city_key]
    city = c["name"]
    city_short = c["name_short"]
    slug = c["slug"]

    title = f"Drutex Händler {city_short} — Türen und Fensterhandel Christ | DeineFenster.de"
    if c["distance_km"] == 0:
        meta_desc = f"Drutex-Maßanfertigung direkt in {city}: Türen und Fensterhandel Christ, Fohrder Landstraße 13. Hofverkauf freitags 10–17 Uhr, Lieferung deutschlandweit."
    else:
        meta_desc = f"Drutex-Maßanfertigung für {city_short}: {c['distance_km']} km Fahrtweg, Lieferung oder Selbstabholung. Hofverkauf freitags 10–17 Uhr in Brandenburg an der Havel."
    meta_desc = meta_desc[:160]
    canonical = f"https://deinefenster.de/drutex-haendler-{slug}.html"

    faq_entities = []
    for q, a in c["faqs"]:
        faq_entities.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}})

    jsonld = [
        {
            "@context": "https://schema.org", "@type": "Service",
            "serviceType": "Drutex-Maßanfertigung für Fenster, Türen und Schiebetüren",
            "provider": {
                "@type": "LocalBusiness", "name": "Türen und Fensterhandel Christ",
                "url": "https://deinefenster.de", "telephone": "+493381214837",
                "email": "info@baustoffchrist.de",
                "address": {"@type": "PostalAddress", "streetAddress": "Fohrder Landstraße 13",
                            "addressLocality": "Brandenburg an der Havel", "postalCode": "14772", "addressCountry": "DE"}
            },
            "areaServed": {"@type": "City", "name": city},
            "description": f"Drutex-Maßanfertigung, Beratung und Lieferung für Kunden aus {city}. Fachbetrieb seit 1996, autorisierter Drutex-Händler."
        },
        {
            "@context": "https://schema.org", "@type": "LocalBusiness",
            "name": "Türen und Fensterhandel Christ",
            "description": f"Drutex-Händler für {city} und Umgebung. Maßanfertigung, Lieferung deutschlandweit, Hofverkauf für gebrauchte Fenster.",
            "url": "https://deinefenster.de", "telephone": "+493381214837", "email": "info@baustoffchrist.de",
            "address": {"@type": "PostalAddress", "streetAddress": "Fohrder Landstraße 13",
                        "addressLocality": "Brandenburg an der Havel", "postalCode": "14772", "addressCountry": "DE"},
            "priceRange": "€€",
            "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "10:00", "closes": "17:00"}],
            "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.2", "reviewCount": "110", "bestRating": "5", "worstRating": "1"}
        },
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://deinefenster.de/"},
                {"@type": "ListItem", "position": 2, "name": f"Drutex Händler {city_short}", "item": canonical}
            ]
        },
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq_entities}
    ]
    jsonld_str = json.dumps(jsonld, ensure_ascii=False, indent=2)

    faq_html = ""
    for q, a in c["faqs"]:
        faq_html += f'''    <details class="faq-item">
      <summary><span>{q}</span><span class="material-symbols-outlined faq-chev">expand_more</span></summary>
      <div class="faq-answer"><p>{a}</p></div>
    </details>
'''

    if c["distance_km"] == 0:
        distance_badge = '<span class="badge">Direkt vor Ort</span>'
        hero_line = f"Maßanfertigung direkt in {city} — Konfigurator, Beratung und Auslieferung über unseren Hof in der Fohrder Landstraße 13."
    else:
        distance_badge = f'<span class="badge">{c["distance_km"]} km zum Hof</span>'
        hero_line = f"Drutex-Maßanfertigung für Bauherren und Sanierer aus {city_short} — {c['distance_text']} bis zu unserem Hof in Brandenburg an der Havel. Lieferung deutschlandweit oder Selbstabholung."

    html = '''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>__TITLE__</title>
  <meta name="description" content="__META_DESC__"/>
  <meta name="keywords" content="Drutex Händler __CITY_SHORT__, Drutex __CITY_SHORT__, Fenster __CITY_SHORT__ Drutex, Kunststofffenster __CITY_SHORT__, Drutex Vertriebspartner __CITY_SHORT__, IGLO Fenster __CITY_SHORT__"/>
  <link rel="canonical" href="__CANONICAL__"/>

  <meta property="og:type" content="website"/>
  <meta property="og:title" content="__TITLE__"/>
  <meta property="og:description" content="__META_DESC__"/>
  <meta property="og:url" content="__CANONICAL__"/>
  <meta property="og:site_name" content="DeineFenster.de"/>
  <meta property="og:locale" content="de_DE"/>
  <meta property="og:image" content="https://deinefenster.de/img/og-default.jpg"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="__TITLE__"/>
  <meta name="twitter:description" content="__META_DESC__"/>

  <link rel="stylesheet" href="css/tailwind.css?v=2"/>
  <link rel="stylesheet" href="css/nav.css?v=4"/>
  <link rel="preconnect" href="https://fonts.bunny.net"/>
  <link href="https://fonts.bunny.net/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link href="fonts/material-symbols.css" rel="stylesheet"/>

  <script type="application/ld+json">
__JSONLD__
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { background: #060e1e; color: #e8eeff; font-family: 'Manrope', sans-serif; overflow-x: hidden; margin: 0; }
    h1,h2,h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-nav { background: rgba(6,14,30,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    .btn-primary { background: linear-gradient(135deg,#225eaa 0%,#1e4fa0 100%); color:#fff; padding:14px 28px; border-radius:8px; font-weight:700; display:inline-block; text-decoration:none; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); box-shadow:0 4px 24px rgba(34,94,170,0.35); cursor:pointer; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(34,94,170,0.55); }
    .btn-secondary { background: rgba(255,255,255,0.07); color:#e8eeff; padding:14px 28px; border-radius:8px; font-weight:700; text-decoration:none; border:1px solid rgba(255,255,255,0.12); display:inline-block; transition: all 0.3s ease; }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
    .badge { background: rgba(118,169,250,0.1); color:#76a9fa; border:1px solid rgba(118,169,250,0.28); border-radius:6px; padding:5px 14px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:7px; letter-spacing:0.06em; text-transform:uppercase; }
    .section-label { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .section-label-line { width: 22px; height: 1px; background: #76a9fa; display: inline-block; }
    .section-label-text { color: #76a9fa; font-size: 11px; letter-spacing: 0.18em; font-weight: 700; text-transform: uppercase; }
    .answer-box { background: rgba(118,169,250,0.06); border: 1px solid rgba(118,169,250,0.2); border-radius: 12px; }
    .info-card { background:#0f1c30; border:1px solid rgba(118,169,250,0.14); border-radius:14px; padding:28px 26px; transition: border-color .3s, background .3s; }
    .info-card:hover { border-color: rgba(118,169,250,0.3); background: rgba(118,169,250,0.04); }
    .step-num { font-family:'Plus Jakarta Sans',sans-serif; font-size:2.4rem; font-weight:900; color:#76a9fa; opacity:0.3; line-height:1; }
    .faq-item { background:#0f1c30; border:1px solid rgba(118,169,250,0.14); border-radius:12px; margin-bottom:12px; overflow:hidden; }
    .faq-item summary { list-style:none; padding:18px 22px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:1.05rem; color:#e8eeff; gap:14px; }
    .faq-item summary::-webkit-details-marker { display:none; }
    .faq-chev { transition: transform .25s ease; color:#76a9fa; }
    .faq-item[open] .faq-chev { transform: rotate(180deg); }
    .faq-answer { padding: 0 22px 22px; color: rgba(232,238,255,0.78); font-size: 14.5px; line-height: 1.7; }
    .hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
    .hero-blob-1 { width:520px; height:520px; background:rgba(34,94,170,0.22); top:-160px; right:-80px; }
    .hero-blob-2 { width:380px; height:380px; background:rgba(118,169,250,0.1); bottom:-100px; left:35%; }
    .skip-to-main { position: absolute; left: -9999px; top: 0; }
    .skip-to-main:focus { left: 8px; top: 8px; background:#225eaa; color:#fff; padding:10px 16px; border-radius:6px; z-index:9999; }
    .qf-input { background:#0f1c30; border:1px solid rgba(118,169,250,0.22); border-radius:10px; padding:12px 14px; color:#e8eeff; font-family:'Manrope',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; width:100%; box-sizing:border-box; }
    .qf-input:focus { border-color:#76a9fa; background:#142847; }
    .qf-input::placeholder { color:rgba(232,238,255,0.4); }
    @media (max-width:640px) { #dfQuickForm { grid-template-columns:1fr !important; } #dfQuickForm > * { grid-column:span 1 !important; } }
    .df-wa-float { position: fixed; bottom: 22px; left: 22px; z-index: 90; display: flex; align-items: center; gap: 0; background: #25D366; color: #fff; border-radius: 999px; padding: 14px 18px 14px 14px; box-shadow: 0 8px 28px rgba(37,211,102,0.45), 0 4px 14px rgba(0,0,0,0.25); text-decoration: none; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; }
    .df-wa-float:hover { transform: translateY(-2px) scale(1.03); }
    .df-wa-float svg { width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0; }
    @media (min-width: 768px) { .df-wa-float { display: none; } }
  </style>
</head>
<body>
<a href="#main" class="skip-to-main">Zum Hauptinhalt springen</a>

<nav id="navbar" class="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
  <div class="flex justify-between items-center px-6 md:px-12 py-3 max-w-[1440px] mx-auto">
    <a href="index.html" class="text-xl md:text-2xl font-bold tracking-tighter text-white">DeineFenster<span style="color:#76a9fa">.de</span></a>
    <div class="hidden md:flex items-center gap-x-5">
      <a href="produkte.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Produkte</a>
      <a href="ueber-drutex.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Hersteller</a>
      <a href="kunststofffenster-kaufen.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Neue Fenster</a>
      <a href="gebrauchte-fenster-kaufen.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Gebraucht</a>
      <a href="konfigurator.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Konfigurator</a>
      <a href="shop.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Shop</a>
      <a href="faq.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">FAQ</a>
      <a href="kontakt.html" class="text-white/80 hover:text-white transition-colors text-sm font-medium">Kontakt</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="konfigurator.html" class="hidden md:block px-5 py-1.5 rounded-full font-semibold text-xs" style="background:#225eaa;color:#fff;">Angebot anfragen</a>
      <button id="menuBtn" class="md:hidden text-white p-1" aria-label="Menü öffnen">
        <span class="material-symbols-outlined text-3xl" id="menuIcon">menu</span>
      </button>
    </div>
  </div>
  <div id="mobileMenu" class="hidden md:hidden px-6 py-4 border-t border-white/10">
    <div class="flex flex-col gap-1">
      <a href="produkte.html" class="text-white py-2 border-b border-white/10">Produkte</a>
      <a href="ueber-drutex.html" class="text-white py-2 border-b border-white/10">Hersteller</a>
      <a href="kunststofffenster-kaufen.html" class="text-white py-2 border-b border-white/10">Neue Fenster</a>
      <a href="gebrauchte-fenster-kaufen.html" class="text-white py-2 border-b border-white/10">Gebraucht</a>
      <a href="konfigurator.html" class="text-white py-2 border-b border-white/10">Konfigurator</a>
      <a href="shop.html" class="text-white py-2 border-b border-white/10">Shop</a>
      <a href="faq.html" class="text-white py-2 border-b border-white/10">FAQ</a>
      <a href="kontakt.html" class="text-white py-2 border-b border-white/10">Kontakt</a>
    </div>
  </div>
</nav>

<div class="max-w-[1200px] mx-auto px-6 text-xs" style="padding-top:88px;padding-bottom:8px;color:rgba(232,238,255,0.4);">
  <a href="index.html" style="color:rgba(232,238,255,0.5);">Startseite</a>
  <span class="mx-2">›</span>
  <span style="color:rgba(232,238,255,0.7);">Drutex Händler __CITY_SHORT__</span>
</div>

<main id="main">

<section style="position:relative;padding:48px 24px 72px;overflow:hidden;background:linear-gradient(135deg,#060e1e 0%,#0e1e3a 55%,#0a1530 100%);">
  <div class="hero-blob hero-blob-1"></div>
  <div class="hero-blob hero-blob-2"></div>
  <div class="max-w-[1200px] mx-auto" style="position:relative;z-index:1;">
    <div style="max-width:820px;">
      <div class="flex gap-3 mb-7 flex-wrap items-center">
        <div class="section-label" style="margin-bottom:0;">
          <span class="section-label-line"></span>
          <span class="section-label-text">Drutex-Händler für __CITY_SHORT__</span>
        </div>
        <span class="badge">Fachbetrieb seit 1996</span>
        __DISTANCE_BADGE__
      </div>
      <h1 style="font-size:clamp(2rem,4.5vw,3.4rem);font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin-bottom:18px;">
        Drutex Händler in __CITY_SHORT__<br/>
        <span style="color:#76a9fa;">Maßanfertigung mit Lieferung aus Brandenburg an der Havel</span>
      </h1>
      <div class="answer-box" style="padding:18px 22px;margin-bottom:24px;max-width:780px;">
        <p style="margin:0;font-size:15.5px;line-height:1.7;color:#e8eeff;">__HERO_LINE__ Türen und Fensterhandel Christ — autorisierter Drutex-Vertriebspartner seit 1996, Fohrder Landstraße 13, 14772 Brandenburg an der Havel. Kontakt: 03381 / 214 83 73, WhatsApp 0171 7263776, <a href="mailto:info@baustoffchrist.de" style="color:#76a9fa;text-decoration:underline;">info@baustoffchrist.de</a>.</p>
      </div>
      <div class="flex flex-wrap gap-4 mt-8">
        <a href="konfigurator.html" class="btn-primary">Drutex-Konfigurator starten →</a>
        <a href="https://wa.me/491717263776" target="_blank" rel="noopener" class="btn-secondary">WhatsApp-Anfrage</a>
      </div>
    </div>
  </div>
</section>

<section style="padding:72px 24px;background:#0a1225;">
  <div class="max-w-[1100px] mx-auto">
    <div class="section-label"><span class="section-label-line"></span><span class="section-label-text">Anfahrt &amp; Lieferung</span></div>
    <h2 style="font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:18px;color:#fff;">Was das für Kunden aus __CITY_SHORT__ bedeutet</h2>
    <p style="color:rgba(232,238,255,0.82);font-size:16px;line-height:1.75;max-width:800px;margin-bottom:18px;">__REGION_DESC__</p>
    <p style="color:rgba(232,238,255,0.72);font-size:15px;line-height:1.7;max-width:800px;margin-bottom:18px;">__ANFAHRT_TEXT__</p>
    <p style="color:rgba(232,238,255,0.72);font-size:15px;line-height:1.7;max-width:800px;">__LIEFERUNG_LOHNT__</p>
  </div>
</section>

<section style="padding:72px 24px;background:#060e1e;border-top:1px solid rgba(118,169,250,0.08);">
  <div class="max-w-[1200px] mx-auto">
    <div class="section-label"><span class="section-label-line"></span><span class="section-label-text">Sortiment</span></div>
    <h2 style="font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:14px;color:#fff;">Drutex IGLO-Profile, die wir nach __CITY_SHORT__ liefern</h2>
    <p style="color:rgba(232,238,255,0.7);font-size:15px;line-height:1.7;max-width:780px;margin-bottom:36px;">Drutex fertigt seit über 30 Jahren in Polen — von der Profil-Extrusion bis zur Verglasung in einem Werk. Wir vermitteln nicht nur, wir kennen die Profile aus erster Hand. Drei Hauptsysteme decken die Bandbreite ab — von solider Standard-Sanierung bis Hochenergie-Neubau.</p>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="info-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><span class="material-symbols-outlined" style="color:#76a9fa;font-size:26px;">window</span><h3 style="font-size:1.2rem;font-weight:800;color:#fff;margin:0;">IGLO 5 Classic</h3></div>
        <p style="color:rgba(232,238,255,0.6);font-size:13.5px;line-height:1.65;margin-bottom:10px;">5-Kammer-System · Bautiefe 70 mm · Uw bis 0,83 W/m²K (mit 3-fach-Verglasung).</p>
        <p style="color:rgba(232,238,255,0.7);font-size:14px;line-height:1.7;">Der bewährte Allrounder. Solide Wärmedämmung, gutes Preis-Leistungs-Verhältnis — für Sanierungen mit gemäßigtem Energieanspruch die häufigste Wahl.</p>
      </div>
      <div class="info-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><span class="material-symbols-outlined" style="color:#76a9fa;font-size:26px;">bolt</span><h3 style="font-size:1.2rem;font-weight:800;color:#fff;margin:0;">IGLO Energy</h3></div>
        <p style="color:rgba(232,238,255,0.6);font-size:13.5px;line-height:1.65;margin-bottom:10px;">7-Kammer-System · Bautiefe 82 mm · Uw bis 0,71 W/m²K · KfW/BAFA-förderfähig.</p>
        <p style="color:rgba(232,238,255,0.7);font-size:14px;line-height:1.7;">Premium-Wärmedämmung für Neubau und KfW-Sanierung. Erfüllt die Anforderungen für Bundesförderung effiziente Gebäude (BEG) — passender Profil-Standard für moderne Effizienzhäuser.</p>
      </div>
      <div class="info-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><span class="material-symbols-outlined" style="color:#76a9fa;font-size:26px;">wb_sunny</span><h3 style="font-size:1.2rem;font-weight:800;color:#fff;margin:0;">IGLO Light</h3></div>
        <p style="color:rgba(232,238,255,0.6);font-size:13.5px;line-height:1.65;margin-bottom:10px;">5-Kammer · schmale Profile · 70 mm · Uw bis 0,88 W/m²K · mehr Glasanteil.</p>
        <p style="color:rgba(232,238,255,0.7);font-size:14px;line-height:1.7;">Schmalere Ansichtsbreite, mehr Lichteinfall — gut für Altbauten mit Sprossenfenstern, denkmalgeschützte Fassaden oder kleinformatige Öffnungen, wo jeder Zentimeter Glas zählt.</p>
      </div>
    </div>

    <p style="color:rgba(232,238,255,0.55);font-size:13px;line-height:1.6;margin-top:24px;max-width:780px;">Technische Werte gemäß Drutex-Datenblättern (Stand 2026). Der erreichte Uw-Wert hängt von Verglasung, Format und Einbau ab. Detailblätter geben wir im Angebot mit.</p>

    <div style="margin-top:28px;">
      <a href="ueber-drutex.html" class="btn-secondary" style="margin-right:10px;">Mehr über Drutex →</a>
      <a href="konfigurator.html" class="btn-primary">Profil im Konfigurator wählen →</a>
    </div>
  </div>
</section>

<section style="padding:72px 24px;background:#0a1225;">
  <div class="max-w-[1100px] mx-auto">
    <div class="section-label"><span class="section-label-line"></span><span class="section-label-text">Ablauf</span></div>
    <h2 style="font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:18px;color:#fff;">Wie der Bestellprozess aus __CITY_SHORT__ funktioniert</h2>
    <p style="color:rgba(232,238,255,0.7);font-size:15px;line-height:1.7;max-width:780px;margin-bottom:34px;">In vier Schritten von der ersten Idee bis zur Lieferung — transparent, ohne Anzahlung, ohne Überraschungen.</p>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="info-card">
        <div class="step-num">01</div>
        <h3 style="font-size:1.15rem;font-weight:800;margin:10px 0 8px;color:#fff;">Konfigurator oder Anfrage</h3>
        <p style="color:rgba(232,238,255,0.7);font-size:14.5px;line-height:1.7;">Online-Konfigurator auf <a href="konfigurator.html" style="color:#76a9fa;text-decoration:underline;">deinefenster.de/konfigurator.html</a> nutzen — Profil, Maße, Farbe, Verglasung, Beschlag. Oder Foto/Skizze per WhatsApp 0171 7263776 schicken. Maße liefern wir bei Bedarf vor Ort (Aufmaß-Service).</p>
      </div>
      <div class="info-card">
        <div class="step-num">02</div>
        <h3 style="font-size:1.15rem;font-weight:800;margin:10px 0 8px;color:#fff;">Verbindliches Angebot</h3>
        <p style="color:rgba(232,238,255,0.7);font-size:14.5px;line-height:1.7;">Wir rechnen das Angebot mit Lieferkosten nach __CITY_SHORT__ aus und schicken eine PDF-Auftragsbestätigung — inklusive technischer Datenblätter, voraussichtliche Lieferwoche und allen Konditionen. Keine versteckten Aufpreise.</p>
      </div>
      <div class="info-card">
        <div class="step-num">03</div>
        <h3 style="font-size:1.15rem;font-weight:800;margin:10px 0 8px;color:#fff;">Vollüberweisung &amp; Fertigung</h3>
        <p style="color:rgba(232,238,255,0.7);font-size:14.5px;line-height:1.7;">Nach Bestellbestätigung wird der Gesamtbetrag überwiesen — keine Anzahlung, kein Ratenmodell. Drutex startet die Fertigung in Polen, etwa 4–6 Wochen Lieferzeit. Eingangsbestätigung und KW-Termin kommen schriftlich.</p>
      </div>
      <div class="info-card">
        <div class="step-num">04</div>
        <h3 style="font-size:1.15rem;font-weight:800;margin:10px 0 8px;color:#fff;">Lieferung nach __CITY_SHORT__</h3>
        <p style="color:rgba(232,238,255,0.7);font-size:14.5px;line-height:1.7;">Spedition liefert direkt zu Ihrer Baustelle in __CITY_SHORT__ oder zum vereinbarten Lieferort. Alternativ Selbstabholung in der Fohrder Landstraße 13 — meist freitags zum Hofverkauf-Tag. Rechnung mit MwSt. nach Lieferung.</p>
      </div>
    </div>

    <p style="color:rgba(232,238,255,0.5);font-size:12.5px;line-height:1.6;margin-top:24px;max-width:780px;">Hinweis Maßanfertigung: Bei nach Kundenmaßen gefertigten Fenstern gilt eine Ausnahme vom 14-tägigen Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB). Details in unseren <a href="agb.html" style="color:#76a9fa;text-decoration:underline;">AGB</a>.</p>
  </div>
</section>

<section style="padding:72px 24px;background:#060e1e;">
  <div class="max-w-[1100px] mx-auto">
    <div class="section-label"><span class="section-label-line"></span><span class="section-label-text">Kundenkreis</span></div>
    <h2 style="font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:16px;color:#fff;">Wer aus __CITY_SHORT__ bei uns bestellt</h2>
    <p style="color:rgba(232,238,255,0.78);font-size:16px;line-height:1.75;max-width:800px;">__KUNDEN_TEXT__</p>
    <p style="color:rgba(232,238,255,0.6);font-size:14.5px;line-height:1.7;max-width:800px;margin-top:14px;">Sie sind Bauherr, Sanierer, Hausverwalter oder Architekt aus __CITY_SHORT__? Wir beraten unabhängig, transparent und ohne Verkaufsdruck. Beratung kostet nichts.</p>
  </div>
</section>

<section style="padding:72px 24px;background:#0a1225;">
  <div class="max-w-[900px] mx-auto">
    <div class="section-label"><span class="section-label-line"></span><span class="section-label-text">Häufige Fragen</span></div>
    <h2 style="font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:30px;color:#fff;">Fragen aus __CITY_SHORT__ und Umgebung</h2>
__FAQ_HTML__
  </div>
</section>

<section style="padding:48px 24px;background:linear-gradient(135deg,rgba(34,94,170,0.06) 0%,rgba(118,169,250,0.10) 100%);border-top:1px solid rgba(118,169,250,0.15);border-bottom:1px solid rgba(118,169,250,0.15);">
  <div class="max-w-[820px] mx-auto">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <span style="width:22px;height:1px;background:#76a9fa;display:inline-block;"></span>
      <span style="font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#76a9fa;">Schnelle Anfrage · 30 Sekunden</span>
    </div>
    <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(1.8rem,3.5vw,2.4rem);font-weight:900;line-height:1.05;color:#fff;letter-spacing:-0.02em;margin:0 0 8px;">Drutex-Anfrage aus __CITY_SHORT__</h2>
    <p style="margin:0 0 22px;color:rgba(232,238,255,0.65);font-size:14.5px;line-height:1.55;max-width:600px;">Schreib uns kurz Maße, Profil-Wunsch und Lieferort. Wir rechnen und antworten meist am gleichen Werktag.</p>

    <form id="dfQuickForm" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;" onsubmit="return dfQuickFormSubmit(event)">
      <input type="hidden" name="access_key" value="440a94ff-9f42-46af-bf3d-47013dbd8f5f">
      <input type="hidden" name="subject" value="Drutex-Anfrage aus __CITY_SHORT__">
      <input type="hidden" name="from_name" value="DeineFenster — Händler-Anfrage __CITY_SHORT__">
      <input type="text" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

      <input name="Name" placeholder="Dein Name" required class="qf-input" style="grid-column:span 1;">
      <input name="Kontakt" placeholder="E-Mail oder Telefon" required class="qf-input" style="grid-column:span 1;">
      <textarea name="Anfrage" placeholder="Was suchst du? Maße, Profil, Stückzahl, Lieferort in __CITY_SHORT__ — was du weißt reicht." required rows="3" class="qf-input" style="grid-column:span 2;resize:vertical;min-height:96px;"></textarea>

      <div style="grid-column:span 2;display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:4px;">
        <button type="submit" id="dfQuickSubmit" style="padding:13px 28px;background:#76a9fa;color:#0a1225;border:none;border-radius:999px;font-family:'Manrope',sans-serif;font-weight:800;font-size:14px;letter-spacing:0.01em;cursor:pointer;display:inline-flex;align-items:center;gap:8px;">
          <span class="material-symbols-outlined" style="font-size:18px;">send</span>
          Anfrage senden
        </button>
        <a href="https://wa.me/491717263776" target="_blank" rel="noopener" style="padding:13px 22px;background:rgba(37,211,102,0.12);color:#5eead4;border:1px solid rgba(37,211,102,0.32);border-radius:999px;font-weight:700;font-size:13.5px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          <span class="material-symbols-outlined" style="font-size:17px;">photo_camera</span>
          Lieber Foto per WhatsApp
        </a>
        <span style="font-size:11.5px;color:rgba(232,238,255,0.42);">Mit dem Senden akzeptierst du unsere <a href="datenschutz.html" style="color:#76a9fa;text-decoration:underline;">Datenschutzerklärung</a>.</span>
      </div>
      <div id="dfQuickFormMsg" style="grid-column:span 2;font-size:14px;display:none;padding:14px 18px;border-radius:10px;font-weight:600;"></div>
    </form>
  </div>
</section>

</main>

<footer style="background:#060e1e;padding:40px 24px 24px;border-top:1px solid rgba(255,255,255,0.07);">
  <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
    <p class="text-xs" style="color:rgba(255,255,255,0.4);">© 2026 DeineFenster.de · Türen und Fensterhandel Christ · Alle Rechte vorbehalten.</p>
    <div class="flex gap-6">
      <a href="impressum.html" class="text-xs font-semibold" style="color:rgba(255,255,255,0.4);">Impressum</a>
      <a href="datenschutz.html" class="text-xs font-semibold" style="color:rgba(255,255,255,0.4);">Datenschutz</a>
      <a href="agb.html" class="text-xs font-semibold" style="color:rgba(255,255,255,0.4);">AGB</a>
    </div>
  </div>
  <div style="text-align:center;padding:8px 16px;font-size:11px;color:rgba(255,255,255,0.5);font-family:Manrope,sans-serif;"><button type="button" class="cookie-settings-link" onclick="window.dfOpenCookieSettings && window.dfOpenCookieSettings()">Cookie-Einstellungen</button></div>
</footer>

<a class="df-wa-float" href="https://wa.me/491717263776" target="_blank" rel="noopener" aria-label="WhatsApp-Anfrage an Türen und Fensterhandel Christ">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/></svg>
  <span>WhatsApp</span>
</a>

<script>
  document.getElementById('menuBtn').addEventListener('click', () => {
    const m = document.getElementById('mobileMenu');
    const open = !m.classList.contains('hidden');
    m.classList.toggle('hidden');
    document.getElementById('menuIcon').textContent = open ? 'menu' : 'close';
  });

  function dfQuickFormSubmit(e){
    e.preventDefault();
    var form = e.target, msg = document.getElementById('dfQuickFormMsg'), btn = document.getElementById('dfQuickSubmit');
    var data = new FormData(form);
    btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = 'Wird gesendet…';
    fetch('https://api.web3forms.com/submit', { method:'POST', body: data })
      .then(r => r.json())
      .then(res => {
        if(res.success){
          msg.style.display='block'; msg.style.background='rgba(34,197,94,0.12)'; msg.style.color='#86efac'; msg.style.border='1px solid rgba(34,197,94,0.3)';
          msg.innerHTML='Anfrage angekommen — wir melden uns. Eilbedarf gerne per WhatsApp: <a href="https://wa.me/491717263776" target="_blank" style="color:#86efac;text-decoration:underline;">0171 7263776</a>';
          form.reset();
        } else {
          msg.style.display='block'; msg.style.background='rgba(239,68,68,0.10)'; msg.style.color='#fca5a5'; msg.style.border='1px solid rgba(239,68,68,0.3)';
          msg.textContent = 'Hat nicht geklappt. Bitte direkt per E-Mail an info@baustoffchrist.de oder WhatsApp 0171 7263776.';
        }
        btn.disabled = false; btn.style.opacity = '1';
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">send</span> Anfrage senden';
      })
      .catch(() => {
        msg.style.display='block'; msg.style.background='rgba(239,68,68,0.10)'; msg.style.color='#fca5a5'; msg.style.border='1px solid rgba(239,68,68,0.3)';
        msg.textContent = 'Hat nicht geklappt. Bitte direkt per E-Mail an info@baustoffchrist.de oder WhatsApp 0171 7263776.';
        btn.disabled = false; btn.style.opacity = '1';
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">send</span> Anfrage senden';
      });
    return false;
  }
</script>

<link rel="stylesheet" href="css/cookie-banner.css">
<script defer src="js/cookie-banner.js"></script>
</body>
</html>
'''

    html = html.replace("__TITLE__", title)
    html = html.replace("__META_DESC__", meta_desc)
    html = html.replace("__CANONICAL__", canonical)
    html = html.replace("__CITY_SHORT__", city_short)
    html = html.replace("__JSONLD__", jsonld_str)
    html = html.replace("__DISTANCE_BADGE__", distance_badge)
    html = html.replace("__HERO_LINE__", hero_line)
    html = html.replace("__REGION_DESC__", c["region_desc"])
    html = html.replace("__ANFAHRT_TEXT__", c["anfahrt_text"])
    html = html.replace("__LIEFERUNG_LOHNT__", c["lieferung_lohnt"])
    html = html.replace("__KUNDEN_TEXT__", c["kunden_text"])
    html = html.replace("__FAQ_HTML__", faq_html)
    return html


def count_words(html):
    text = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return len(text.split())


def validate_jsonld(html):
    """Extrahiert + validiert alle <script type='application/ld+json'> Blöcke."""
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, flags=re.DOTALL)
    for i, block in enumerate(blocks):
        try:
            json.loads(block)
        except json.JSONDecodeError as e:
            return False, f"Block #{i+1}: {e}"
    return True, f"{len(blocks)} JSON-LD Block(s) gültig"


if __name__ == "__main__":
    print("=" * 60)
    print("Drutex-Händler-Landingpages — Generator")
    print("=" * 60)
    for slug in ["brandenburg", "berlin", "potsdam", "magdeburg"]:
        html = build_page(slug)
        outpath = os.path.join(BASE, f"drutex-haendler-{slug}.html")
        with open(outpath, 'w', encoding='utf-8') as f:
            f.write(html)
        words = count_words(html)
        ok, msg = validate_jsonld(html)
        flag = "OK" if ok else "FAIL"
        print(f"  [{flag}] drutex-haendler-{slug}.html — {words} Wörter, JSON-LD: {msg}")
    print("=" * 60)
    print("Fertig. Smart-Quote-Check + Sitemap-Update separat ausführen.")
