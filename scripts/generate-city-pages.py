#!/usr/bin/env python3
"""
Generiert Stadt-Landingpages für DeineFenster.de
- staedte/fenster-{stadt}.html  (neue Drutex-Fenster)
- staedte/gebrauchte-fenster-{stadt}.html  (gebrauchte Fenster)
Danach: sitemap.xml wird automatisch ergänzt.
"""

import os
import re
import unicodedata
from datetime import date

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "staedte")
SITEMAP_PATH = os.path.join(BASE_DIR, "sitemap.xml")

# Top 100 deutsche Städte (Name, Bundesland, Einwohner-Hinweis für Texte)
CITIES = [
    ("Berlin", "Berlin", "3,7 Mio. Einwohner"),
    ("Hamburg", "Hamburg", "1,9 Mio. Einwohner"),
    ("München", "Bayern", "1,5 Mio. Einwohner"),
    ("Köln", "Nordrhein-Westfalen", "1,08 Mio. Einwohner"),
    ("Frankfurt am Main", "Hessen", "780.000 Einwohner"),
    ("Stuttgart", "Baden-Württemberg", "635.000 Einwohner"),
    ("Düsseldorf", "Nordrhein-Westfalen", "645.000 Einwohner"),
    ("Leipzig", "Sachsen", "615.000 Einwohner"),
    ("Dortmund", "Nordrhein-Westfalen", "595.000 Einwohner"),
    ("Essen", "Nordrhein-Westfalen", "580.000 Einwohner"),
    ("Bremen", "Bremen", "570.000 Einwohner"),
    ("Dresden", "Sachsen", "560.000 Einwohner"),
    ("Hannover", "Niedersachsen", "540.000 Einwohner"),
    ("Nürnberg", "Bayern", "520.000 Einwohner"),
    ("Duisburg", "Nordrhein-Westfalen", "500.000 Einwohner"),
    ("Bochum", "Nordrhein-Westfalen", "365.000 Einwohner"),
    ("Wuppertal", "Nordrhein-Westfalen", "360.000 Einwohner"),
    ("Bielefeld", "Nordrhein-Westfalen", "340.000 Einwohner"),
    ("Bonn", "Nordrhein-Westfalen", "330.000 Einwohner"),
    ("Münster", "Nordrhein-Westfalen", "320.000 Einwohner"),
    ("Mannheim", "Baden-Württemberg", "310.000 Einwohner"),
    ("Karlsruhe", "Baden-Württemberg", "305.000 Einwohner"),
    ("Augsburg", "Bayern", "300.000 Einwohner"),
    ("Wiesbaden", "Hessen", "280.000 Einwohner"),
    ("Gelsenkirchen", "Nordrhein-Westfalen", "265.000 Einwohner"),
    ("Mönchengladbach", "Nordrhein-Westfalen", "260.000 Einwohner"),
    ("Braunschweig", "Niedersachsen", "255.000 Einwohner"),
    ("Kiel", "Schleswig-Holstein", "250.000 Einwohner"),
    ("Chemnitz", "Sachsen", "248.000 Einwohner"),
    ("Aachen", "Nordrhein-Westfalen", "245.000 Einwohner"),
    ("Halle (Saale)", "Sachsen-Anhalt", "240.000 Einwohner"),
    ("Magdeburg", "Sachsen-Anhalt", "238.000 Einwohner"),
    ("Freiburg im Breisgau", "Baden-Württemberg", "235.000 Einwohner"),
    ("Krefeld", "Nordrhein-Westfalen", "227.000 Einwohner"),
    ("Lübeck", "Schleswig-Holstein", "217.000 Einwohner"),
    ("Oberhausen", "Nordrhein-Westfalen", "210.000 Einwohner"),
    ("Erfurt", "Thüringen", "213.000 Einwohner"),
    ("Rostock", "Mecklenburg-Vorpommern", "208.000 Einwohner"),
    ("Mainz", "Rheinland-Pfalz", "218.000 Einwohner"),
    ("Kassel", "Hessen", "204.000 Einwohner"),
    ("Hagen", "Nordrhein-Westfalen", "190.000 Einwohner"),
    ("Hamm", "Nordrhein-Westfalen", "179.000 Einwohner"),
    ("Saarbrücken", "Saarland", "180.000 Einwohner"),
    ("Mülheim an der Ruhr", "Nordrhein-Westfalen", "170.000 Einwohner"),
    ("Potsdam", "Brandenburg", "185.000 Einwohner"),
    ("Ludwigshafen am Rhein", "Rheinland-Pfalz", "172.000 Einwohner"),
    ("Oldenburg", "Niedersachsen", "170.000 Einwohner"),
    ("Osnabrück", "Niedersachsen", "165.000 Einwohner"),
    ("Leverkusen", "Nordrhein-Westfalen", "163.000 Einwohner"),
    ("Solingen", "Nordrhein-Westfalen", "160.000 Einwohner"),
    ("Heidelberg", "Baden-Württemberg", "158.000 Einwohner"),
    ("Darmstadt", "Hessen", "160.000 Einwohner"),
    ("Regensburg", "Bayern", "155.000 Einwohner"),
    ("Herne", "Nordrhein-Westfalen", "155.000 Einwohner"),
    ("Neuss", "Nordrhein-Westfalen", "153.000 Einwohner"),
    ("Paderborn", "Nordrhein-Westfalen", "152.000 Einwohner"),
    ("Ingolstadt", "Bayern", "140.000 Einwohner"),
    ("Offenbach am Main", "Hessen", "130.000 Einwohner"),
    ("Fürth", "Bayern", "130.000 Einwohner"),
    ("Würzburg", "Bayern", "128.000 Einwohner"),
    ("Ulm", "Baden-Württemberg", "126.000 Einwohner"),
    ("Heilbronn", "Baden-Württemberg", "126.000 Einwohner"),
    ("Pforzheim", "Baden-Württemberg", "125.000 Einwohner"),
    ("Wolfsburg", "Niedersachsen", "124.000 Einwohner"),
    ("Göttingen", "Niedersachsen", "118.000 Einwohner"),
    ("Bottrop", "Nordrhein-Westfalen", "117.000 Einwohner"),
    ("Recklinghausen", "Nordrhein-Westfalen", "115.000 Einwohner"),
    ("Reutlingen", "Baden-Württemberg", "115.000 Einwohner"),
    ("Koblenz", "Rheinland-Pfalz", "114.000 Einwohner"),
    ("Bremerhaven", "Bremen", "113.000 Einwohner"),
    ("Jena", "Thüringen", "112.000 Einwohner"),
    ("Moers", "Nordrhein-Westfalen", "104.000 Einwohner"),
    ("Bergisch Gladbach", "Nordrhein-Westfalen", "112.000 Einwohner"),
    ("Remscheid", "Nordrhein-Westfalen", "110.000 Einwohner"),
    ("Erlangen", "Bayern", "113.000 Einwohner"),
    ("Trier", "Rheinland-Pfalz", "111.000 Einwohner"),
    ("Salzgitter", "Niedersachsen", "100.000 Einwohner"),
    ("Siegen", "Nordrhein-Westfalen", "102.000 Einwohner"),
    ("Cottbus", "Brandenburg", "100.000 Einwohner"),
    ("Hildesheim", "Niedersachsen", "102.000 Einwohner"),
    ("Gütersloh", "Nordrhein-Westfalen", "101.000 Einwohner"),
    ("Zwickau", "Sachsen", "90.000 Einwohner"),
    ("Kaiserslautern", "Rheinland-Pfalz", "97.000 Einwohner"),
    ("Schwerin", "Mecklenburg-Vorpommern", "96.000 Einwohner"),
    ("Witten", "Nordrhein-Westfalen", "97.000 Einwohner"),
    ("Iserlohn", "Nordrhein-Westfalen", "94.000 Einwohner"),
    ("Düren", "Nordrhein-Westfalen", "92.000 Einwohner"),
    ("Ratingen", "Nordrhein-Westfalen", "91.000 Einwohner"),
    ("Brandenburg an der Havel", "Brandenburg", "72.000 Einwohner"),
    ("Dessau-Roßlau", "Sachsen-Anhalt", "79.000 Einwohner"),
    ("Gera", "Thüringen", "91.000 Einwohner"),
    ("Bamberg", "Bayern", "78.000 Einwohner"),
    ("Lüneburg", "Niedersachsen", "77.000 Einwohner"),
    ("Tübingen", "Baden-Württemberg", "91.000 Einwohner"),
    ("Frankfurt (Oder)", "Brandenburg", "58.000 Einwohner"),
    ("Stralsund", "Mecklenburg-Vorpommern", "58.000 Einwohner"),
    ("Neubrandenburg", "Mecklenburg-Vorpommern", "62.000 Einwohner"),
    ("Greifswald", "Mecklenburg-Vorpommern", "60.000 Einwohner"),
    ("Wismar", "Mecklenburg-Vorpommern", "43.000 Einwohner"),
]

TODAY = date.today().isoformat()
BASE_URL = "https://www.deinefenster.de"


def slugify(name: str) -> str:
    """Konvertiert Stadtname in URL-freundlichen Slug."""
    name = name.lower()
    # Umlaute ersetzen
    name = name.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    # Sonderzeichen und Leerzeichen
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-")


def generate_fenster_page(city: str, bundesland: str, ew: str, slug: str) -> str:
    """Generiert eine Fenster-Landingpage für eine Stadt."""
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Fenster in {city} kaufen — Drutex Kunststofffenster | DeineFenster.de</title>
  <meta name="description" content="Drutex-Kunststofffenster nach {city} liefern lassen — Maßanfertigung in ca. 14 Werktagen. Fachbetrieb Fensterhandel Christ, Brandenburg. Persönliche Beratung, faire Preise ab 285 €."/>
  <link rel="canonical" href="{BASE_URL}/staedte/fenster-{slug}.html"/>
  <meta property="og:title" content="Fenster in {city} kaufen — Drutex vom Fachbetrieb"/>
  <meta property="og:description" content="Drutex-Kunststofffenster deutschlandweit geliefert — auch nach {city}. Maßanfertigung, KfW-förderfähig, 14 Werktage Lieferzeit."/>
  <meta property="og:type" content="website"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600&display=swap"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ font-family: 'Manrope', sans-serif; background: #0a1530; color: #e8eeff; }}
    h1,h2,h3 {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
    .answer-box {{ background: rgba(34,94,170,0.12); border-left: 4px solid #225eaa; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 32px; }}
    .card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(232,238,255,0.08); border-radius: 16px; padding: 24px; }}
    .btn-primary {{ display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:999px;background:#225eaa;color:#fff;font-weight:700;font-size:14px;text-decoration:none;transition:background 0.2s,transform 0.2s; }}
    .btn-primary:hover {{ background:#1e3a8a; transform:translateY(-2px); }}
    .badge {{ display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:rgba(34,94,170,0.18);color:#76a9fa;border:1px solid rgba(118,169,250,0.2);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em; }}
  </style>
  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Fensterhandel Christ — Drutex-Fachbetrieb",
      "url": "{BASE_URL}",
      "telephone": "+493381214837",
      "address": {{
        "@type": "PostalAddress",
        "streetAddress": "Fohrder Landstraße 13",
        "addressLocality": "Brandenburg an der Havel",
        "postalCode": "14772",
        "addressCountry": "DE"
      }},
      "areaServed": ["{city}", "Brandenburg an der Havel", "Deutschland"],
      "description": "Drutex-Fenster Fachbetrieb — Maßanfertigung deutschlandweit lieferbar, auch nach {city}.",
      "priceRange": "€€"
    }},
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{
          "@type": "Question",
          "name": "Liefern Sie Fenster nach {city}?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Ja. Maßgefertigte Drutex-Fenster liefern wir deutschlandweit — auch nach {city} in {bundesland}. Lieferzeit ca. 14 Werktage ab Auftragsbestätigung per Spedition. Lagerware ist nur zur Selbstabholung in Brandenburg an der Havel verfügbar."}}
        }},
        {{
          "@type": "Question",
          "name": "Was kostet ein Fenster mit Lieferung nach {city}?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Maßgefertigte Drutex-Kunststofffenster beginnen ab ca. 285 € (einflügelig, 2-fach-Glas). Zweiflügelig ab ca. 420 €. Speditionskosten werden separat berechnet und vorab mitgeteilt. Kein versteckter Aufpreis für {city}."}}
        }},
        {{
          "@type": "Question",
          "name": "Wie lange dauert die Lieferung nach {city}?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Bei Maßanfertigung ca. 14 Werktage ab Auftragsbestätigung. Die Fenster werden von Drutex in Polen produziert und direkt per Spedition zu Ihnen nach {city} geliefert."}}
        }},
        {{
          "@type": "Question",
          "name": "Sind Drutex-Fenster KfW-förderfähig?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Ja. Drutex IGLO Energy (Uw 0,71 W/m²K) und IGLO Edge (Uw 0,66 W/m²K) erfüllen die KfW-BEG-Anforderung (max. Uw 0,95). Das gilt auch für Lieferungen nach {city} — die Förderung ist ortsunabhängig."}}
        }},
        {{
          "@type": "Question",
          "name": "Welche Drutex-Fensterprofile gibt es?",
          "acceptedAnswer": {{"@type": "Answer", "text": "IGLO 5 Classic (5-Kammer, 70 mm, Uw 0,83), IGLO Energy (7-Kammer, 82 mm, Uw 0,71, KfW), IGLO Edge (7-Kammer, 82 mm, Uw 0,66, KfW), IGLO Light (schlanke Profile, mehr Licht) und IGLO EXT (nach außen öffnend). Alle als Fenster, Balkontür oder Haustür erhältlich."}}
        }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{"@type": "ListItem", "position": 1, "name": "Startseite", "item": "{BASE_URL}/"}},
        {{"@type": "ListItem", "position": 2, "name": "Städte", "item": "{BASE_URL}/staedte/"}},
        {{"@type": "ListItem", "position": 3, "name": "Fenster in {city}", "item": "{BASE_URL}/staedte/fenster-{slug}.html"}}
      ]
    }}
  ]
  </script>
</head>
<body>

  <!-- Navbar minimal -->
  <nav style="background:rgba(10,21,48,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(232,238,255,0.08);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;">
    <a href="../index.html" style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:18px;color:#fff;text-decoration:none;">DeineFenster<span style="color:#76a9fa;">.de</span></a>
    <div style="display:flex;gap:16px;align-items:center;">
      <a href="../konfigurator.html" class="btn-primary" style="padding:10px 20px;font-size:13px;">Jetzt konfigurieren →</a>
    </div>
  </nav>

  <!-- Breadcrumb -->
  <div style="max-width:1200px;margin:0 auto;padding:12px 24px;font-size:13px;color:rgba(232,238,255,0.45);">
    <a href="../index.html" style="color:rgba(232,238,255,0.45);text-decoration:none;">Startseite</a>
    <span style="margin:0 8px;">›</span>
    <a href="../produkte.html" style="color:rgba(232,238,255,0.45);text-decoration:none;">Fenster</a>
    <span style="margin:0 8px;">›</span>
    <span style="color:rgba(232,238,255,0.7);">Fenster in {city}</span>
  </div>

  <!-- Hero -->
  <section style="background:linear-gradient(135deg,#060e1e 0%,#0e1e3a 55%,#0a1530 100%);padding:56px 24px 72px;">
    <div style="max-width:1200px;margin:0 auto;">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Lieferung nach {city} · {bundesland}</span>
      <h1 style="font-size:clamp(2rem,5vw,3.2rem);font-weight:800;line-height:1.1;margin:0 0 20px;max-width:700px;">
        Fenster in {city} kaufen —<br/>
        <span style="color:#76a9fa;">Drutex-Qualität direkt vom Fachbetrieb</span>
      </h1>

      <!-- Answer-First-Box -->
      <div class="answer-box" style="max-width:700px;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(232,238,255,0.9);">
          <strong style="color:#fff;">Kurz &amp; klar:</strong> Wir liefern maßgefertigte Drutex-Kunststofffenster nach {city} in ca. 14 Werktagen. Lagerware (günstigere Standardgrößen) ist nur zur Selbstabholung in Brandenburg an der Havel verfügbar.
        </p>
      </div>

      <p style="font-size:16px;line-height:1.7;color:rgba(232,238,255,0.75);max-width:640px;margin:0 0 32px;">
        Fensterhandel Christ ist offizieller Drutex-Fachbetrieb aus Brandenburg — seit 2002. Kein Callcenter, keine Zwischenhändler, persönliche Beratung per WhatsApp und Telefon.
      </p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="../konfigurator.html" class="btn-primary">Fenster für {city} konfigurieren →</a>
        <a href="../kontakt.html" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:999px;border:1px solid rgba(232,238,255,0.2);color:rgba(232,238,255,0.8);text-decoration:none;font-weight:600;font-size:14px;">WhatsApp Beratung</a>
      </div>
    </div>
  </section>

  <!-- USP-Karten -->
  <section style="padding:64px 24px;background:#0f1c30;">
    <div style="max-width:1200px;margin:0 auto;">
      <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;margin:0 0 40px;text-align:center;">Warum Fensterhandel Christ für {city}?</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
        <div class="card">
          <div style="font-size:28px;margin-bottom:12px;">🚚</div>
          <h3 style="font-size:1.05rem;font-weight:700;margin:0 0 8px;">Lieferung nach {city}</h3>
          <p style="font-size:14px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">Maßgefertigte Drutex-Fenster deutschlandweit per Spedition — ca. 14 Werktage. Direktlieferung an Ihre Baustelle in {city}.</p>
        </div>
        <div class="card">
          <div style="font-size:28px;margin-bottom:12px;">🏆</div>
          <h3 style="font-size:1.05rem;font-weight:700;margin:0 0 8px;">Echter Drutex-Fachbetrieb</h3>
          <p style="font-size:14px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">Offizieller Drutex-Partner seit 2008. Keine Händlermarge, direkter Werkspreis. Zertifiziert und geprüft.</p>
        </div>
        <div class="card">
          <div style="font-size:28px;margin-bottom:12px;">💬</div>
          <h3 style="font-size:1.05rem;font-weight:700;margin:0 0 8px;">Persönliche Beratung</h3>
          <p style="font-size:14px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">WhatsApp 0171 7263776 — wir helfen beim Aufmaß, bei der Modellwahl und bei KfW-Förderanträgen. Kein Callcenter.</p>
        </div>
        <div class="card">
          <div style="font-size:28px;margin-bottom:12px;">✅</div>
          <h3 style="font-size:1.05rem;font-weight:700;margin:0 0 8px;">KfW-förderfähig</h3>
          <p style="font-size:14px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">IGLO Energy (Uw 0,71) und IGLO Edge (Uw 0,66) erfüllen die BEG-Anforderung. Bis zu 20 % Zuschuss möglich — auch für Adressen in {city}.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Produkt-Übersicht -->
  <section style="padding:64px 24px;background:#0a1530;">
    <div style="max-width:1200px;margin:0 auto;">
      <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 12px;">Drutex-Profile für {city}</h2>
      <p style="color:rgba(232,238,255,0.65);margin:0 0 36px;">Alle Profile werden maßgefertigt und direkt nach {city} geliefert.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
        <div class="card" style="border-left:4px solid #225eaa;">
          <h3 style="font-size:15px;font-weight:700;margin:0 0 6px;">IGLO 5 Classic</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.6);margin:0 0 8px;">5-Kammer · 70 mm · Uw 0,83</p>
          <p style="font-size:13px;color:#76a9fa;font-weight:700;margin:0;">ab 285 €</p>
        </div>
        <div class="card" style="border-left:4px solid #225eaa;">
          <h3 style="font-size:15px;font-weight:700;margin:0 0 6px;">IGLO Energy <span style="font-size:11px;background:rgba(34,94,170,0.3);color:#76a9fa;padding:2px 8px;border-radius:999px;margin-left:4px;">KfW</span></h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.6);margin:0 0 8px;">7-Kammer · 82 mm · Uw 0,71</p>
          <p style="font-size:13px;color:#76a9fa;font-weight:700;margin:0;">ab 340 €</p>
        </div>
        <div class="card" style="border-left:4px solid #76a9fa;">
          <h3 style="font-size:15px;font-weight:700;margin:0 0 6px;">IGLO Edge <span style="font-size:11px;background:rgba(34,94,170,0.3);color:#76a9fa;padding:2px 8px;border-radius:999px;margin-left:4px;">KfW</span></h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.6);margin:0 0 8px;">7-Kammer · 82 mm · Uw 0,66</p>
          <p style="font-size:13px;color:#76a9fa;font-weight:700;margin:0;">ab 380 €</p>
        </div>
        <div class="card" style="border-left:4px solid #225eaa;">
          <h3 style="font-size:15px;font-weight:700;margin:0 0 6px;">IGLO Light</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.6);margin:0 0 8px;">5-Kammer · 70 mm · mehr Licht</p>
          <p style="font-size:13px;color:#76a9fa;font-weight:700;margin:0;">ab 310 €</p>
        </div>
      </div>
      <div style="margin-top:32px;text-align:center;">
        <a href="../konfigurator.html" class="btn-primary">Fenster für {city} jetzt konfigurieren →</a>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section style="padding:64px 24px;background:#0f1c30;">
    <div style="max-width:800px;margin:0 auto;">
      <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 36px;">Häufige Fragen — Fenster nach {city}</h2>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;padding:0;overflow:hidden;" open>
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Liefern Sie Fenster nach {city}?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Ja — maßgefertigte Drutex-Fenster liefern wir deutschlandweit, also auch nach {city} in {bundesland}. Lieferzeit ca. 14 Werktage per Spedition. Lagerware (Standardgrößen günstiger) ist nur zur Selbstabholung in Brandenburg an der Havel verfügbar.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;padding:0;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Was kostet ein Fenster mit Lieferung nach {city}?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Maßgefertigte Drutex-Fenster starten ab ca. 285 € (einflügelig, 2-fach-Glas). Zweiflügelig ab ca. 420 €. Speditionskosten werden separat kalkuliert und vorab transparent mitgeteilt — kein versteckter Aufpreis für {city}.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;padding:0;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Wie lange dauert die Lieferung nach {city}?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Bei Maßanfertigung ca. 14 Werktage ab Auftragsbestätigung. Drutex produziert die Fenster im Werk in Bytów (Polen), anschließend erfolgt die Speditionslieferung direkt zu Ihnen nach {city}.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;padding:0;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Sind KfW-Förderungen auch für {city} möglich?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Ja. KfW- und BAFA-Förderungen sind bundesweit und ortsunabhängig. Wer in {city} wohnt und auf IGLO Energy oder IGLO Edge umrüstet, kann bis zu 20 % Zuschuss beantragen (BEG-Einzelmaßnahme). Wir beraten kostenlos per WhatsApp.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;padding:0;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Kann ich Fenster vor dem Kauf ansehen?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Ja — an unserem Standort in Brandenburg an der Havel (Fohrder Landstraße 13) können Sie Lagerfenster und Muster ansehen. Für Kunden aus {city} lohnt sich die Fahrt besonders, wenn Sie gleichzeitig Lagerware abholen möchten (20–40 % günstiger als Maßanfertigung).</div>
        </details>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="padding:64px 24px;background:linear-gradient(135deg,#0e1e3a 0%,#1e3a8a 100%);text-align:center;">
    <div style="max-width:600px;margin:0 auto;">
      <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 16px;">Fenster für {city} — jetzt anfragen</h2>
      <p style="color:rgba(232,238,255,0.75);margin:0 0 32px;line-height:1.6;">Im Konfigurator Größe, Profil und Farbe wählen — wir schicken Ihnen ein konkretes Angebot mit Liefertermin nach {city}.</p>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
        <a href="../konfigurator.html" class="btn-primary">Jetzt konfigurieren →</a>
        <a href="https://wa.me/491717263776" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:999px;background:rgba(37,211,102,0.15);border:1px solid rgba(37,211,102,0.3);color:#4ade80;text-decoration:none;font-weight:600;font-size:14px;">WhatsApp 0171 7263776</a>
      </div>
    </div>
  </section>

  <!-- Footer minimal -->
  <footer style="background:#060e1e;padding:24px;text-align:center;font-size:13px;color:rgba(232,238,255,0.35);border-top:1px solid rgba(232,238,255,0.06);">
    <a href="../impressum.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Impressum</a>
    <a href="../datenschutz.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Datenschutz</a>
    <a href="../kontakt.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Kontakt</a>
    <p style="margin:12px 0 0;color:rgba(232,238,255,0.25);">© 2026 Fensterhandel Christ · Brandenburg an der Havel · Offizieller Drutex-Fachpartner</p>
  </footer>

</body>
</html>"""


def generate_gebraucht_page(city: str, bundesland: str, ew: str, slug: str) -> str:
    """Generiert eine 'gebrauchte Fenster' Landingpage für eine Stadt."""
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gebrauchte Fenster in {city} — ab 80 € | DeineFenster.de Brandenburg</title>
  <meta name="description" content="Gebrauchte Fenster kaufen — großer Lagerbestand bei Fensterhandel Christ in Brandenburg an der Havel. Ab 80 € pro Fenster, nur Selbstabholung. Kunden aus {city} willkommen."/>
  <link rel="canonical" href="{BASE_URL}/staedte/gebrauchte-fenster-{slug}.html"/>
  <meta property="og:title" content="Gebrauchte Fenster kaufen — auch für {city}"/>
  <meta property="og:description" content="~500 gebrauchte Kunststofffenster ab 80 € in Brandenburg. Kunden aus {city} kommen regelmäßig vorbei."/>
  <meta property="og:type" content="website"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600&display=swap"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ font-family: 'Manrope', sans-serif; background: #0a1530; color: #e8eeff; }}
    h1,h2,h3 {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
    .answer-box {{ background: rgba(34,94,170,0.12); border-left: 4px solid #225eaa; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 32px; }}
    .card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(232,238,255,0.08); border-radius: 16px; padding: 24px; }}
    .btn-primary {{ display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:999px;background:#225eaa;color:#fff;font-weight:700;font-size:14px;text-decoration:none;transition:background 0.2s,transform 0.2s; }}
    .btn-primary:hover {{ background:#1e3a8a; transform:translateY(-2px); }}
    .badge {{ display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:rgba(34,94,170,0.18);color:#76a9fa;border:1px solid rgba(118,169,250,0.2);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em; }}
  </style>
  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Fensterhandel Christ — gebrauchte Fenster Brandenburg",
      "url": "{BASE_URL}/gebrauchte-fenster-kaufen.html",
      "telephone": "+493381214837",
      "address": {{
        "@type": "PostalAddress",
        "streetAddress": "Fohrder Landstraße 13",
        "addressLocality": "Brandenburg an der Havel",
        "postalCode": "14772",
        "addressCountry": "DE"
      }},
      "areaServed": ["{city}", "Brandenburg", "Deutschland"],
      "openingHoursSpecification": {{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "10:00",
        "closes": "17:00"
      }},
      "priceRange": "€"
    }},
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{
          "@type": "Question",
          "name": "Wo kann ich gebrauchte Fenster in der Nähe von {city} kaufen?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Bei Fensterhandel Christ in Brandenburg an der Havel — ca. {ew} von {city} entfernt. Rund 500 gebrauchte Kunststofffenster ab 80 €. Öffnungszeiten: Freitag 10–17 Uhr (außer Urlaubs- und Ferienzeiten). Adresse: Fohrder Landstraße 13, 14772 Brandenburg an der Havel."}}
        }},
        {{
          "@type": "Question",
          "name": "Was kosten gebrauchte Fenster?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Gebrauchte Kunststofffenster gibt es bei uns ab 80 € pro Stück. Je nach Größe, Zustand und Bauart. Haustüren ab ca. 150 €. Alle Preise inkl. MwSt."}}
        }},
        {{
          "@type": "Question",
          "name": "Werden gebrauchte Fenster geliefert?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Nein — gebrauchte Fenster sind ausschließlich zur Selbstabholung. Bitte genug Helfer und einen geeigneten Transporter mitbringen. Wir helfen nicht beim Verladen."}}
        }},
        {{
          "@type": "Question",
          "name": "Was soll ich beim Kauf gebrauchter Fenster beachten?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Rohbauöffnung ausmessen (Fenster-Außenmaß = Öffnung minus 1–2 cm), Maßband mitbringen, Dichtungen und Dreh-Kipp-Funktion prüfen. Kunststoffprofile halten Jahrzehnte — Dichtungen können für 5–10 € selbst getauscht werden."}}
        }},
        {{
          "@type": "Question",
          "name": "Welche Öffnungszeiten hat der Hofverkauf?",
          "acceptedAnswer": {{"@type": "Answer", "text": "Freitag 10–17 Uhr. Außerhalb dieser Zeiten nach Vereinbarung per WhatsApp 0171 7263776. Urlaubs- und Ferienzeiten können variieren — kurz vorher per WhatsApp bestätigen."}}
        }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{"@type": "ListItem", "position": 1, "name": "Startseite", "item": "{BASE_URL}/"}},
        {{"@type": "ListItem", "position": 2, "name": "Gebrauchte Fenster", "item": "{BASE_URL}/gebrauchte-fenster-kaufen.html"}},
        {{"@type": "ListItem", "position": 3, "name": "Gebrauchte Fenster {city}", "item": "{BASE_URL}/staedte/gebrauchte-fenster-{slug}.html"}}
      ]
    }}
  ]
  </script>
</head>
<body>

  <!-- Navbar minimal -->
  <nav style="background:rgba(10,21,48,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(232,238,255,0.08);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;">
    <a href="../index.html" style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:18px;color:#fff;text-decoration:none;">DeineFenster<span style="color:#76a9fa;">.de</span></a>
    <div style="display:flex;gap:16px;align-items:center;">
      <a href="../gebrauchte-fenster-kaufen.html" style="color:rgba(232,238,255,0.7);text-decoration:none;font-size:14px;font-weight:600;">Gebrauchte Fenster</a>
      <a href="../shop.html" class="btn-primary" style="padding:10px 20px;font-size:13px;">Zum Shop →</a>
    </div>
  </nav>

  <!-- Breadcrumb -->
  <div style="max-width:1200px;margin:0 auto;padding:12px 24px;font-size:13px;color:rgba(232,238,255,0.45);">
    <a href="../index.html" style="color:rgba(232,238,255,0.45);text-decoration:none;">Startseite</a>
    <span style="margin:0 8px;">›</span>
    <a href="../gebrauchte-fenster-kaufen.html" style="color:rgba(232,238,255,0.45);text-decoration:none;">Gebrauchte Fenster</a>
    <span style="margin:0 8px;">›</span>
    <span style="color:rgba(232,238,255,0.7);">{city}</span>
  </div>

  <!-- Hero -->
  <section style="background:linear-gradient(135deg,#060e1e 0%,#0e1e3a 55%,#0a1530 100%);padding:56px 24px 72px;">
    <div style="max-width:1200px;margin:0 auto;">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Kunden aus {city} willkommen</span>
      <h1 style="font-size:clamp(2rem,5vw,3.2rem);font-weight:800;line-height:1.1;margin:0 0 20px;max-width:700px;">
        Gebrauchte Fenster kaufen —<br/>
        <span style="color:#76a9fa;">ab 80 €, Abholung Brandenburg</span>
      </h1>

      <!-- Answer-First-Box -->
      <div class="answer-box" style="max-width:700px;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(232,238,255,0.9);">
          <strong style="color:#fff;">Kurz &amp; klar:</strong> Wir verkaufen keine gebrauchten Fenster nach {city}. Der Kauf gebrauchter Fenster ist nur vor Ort in Brandenburg an der Havel möglich — Selbstabholung, Öffnungszeiten Freitag 10–17 Uhr.
        </p>
      </div>

      <p style="font-size:16px;line-height:1.7;color:rgba(232,238,255,0.75);max-width:640px;margin:0 0 32px;">
        Viele Kunden fahren extra aus {city} zu uns nach Brandenburg — rund 500 gebrauchte Kunststofffenster warten auf Sie. Verschiedene Größen, Bauarten, Verglasungen. Einfach vorbeikommen, Maßband mitbringen.
      </p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="../gebrauchte-fenster-kaufen.html" class="btn-primary">Mehr über gebrauchte Fenster →</a>
        <a href="https://wa.me/491717263776" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:999px;background:rgba(37,211,102,0.15);border:1px solid rgba(37,211,102,0.3);color:#4ade80;text-decoration:none;font-weight:600;font-size:14px;">WhatsApp fragen</a>
      </div>
    </div>
  </section>

  <!-- Info-Karten -->
  <section style="padding:64px 24px;background:#0f1c30;">
    <div style="max-width:1200px;margin:0 auto;">
      <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 36px;">So funktioniert es für Kunden aus {city}</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="card">
          <div style="font-size:32px;margin-bottom:12px;">📐</div>
          <h3 style="font-size:15px;font-weight:700;margin:0 0 8px;">1. Zuhause messen</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">Rohbauöffnung ausmessen (Breite × Höhe). Das Fenster muss ca. 1–2 cm kleiner sein als die Öffnung. Maßband zum Hof mitbringen.</p>
        </div>
        <div class="card">
          <div style="font-size:32px;margin-bottom:12px;">🚗</div>
          <h3 style="font-size:15px;font-weight:700;margin:0 0 8px;">2. Freitag vorbeikommen</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">Freitag 10–17 Uhr, Fohrder Landstraße 13, 14772 Brandenburg an der Havel. Kein Termin nötig. Helfer und Transporter mitbringen.</p>
        </div>
        <div class="card">
          <div style="font-size:32px;margin-bottom:12px;">🔍</div>
          <h3 style="font-size:15px;font-weight:700;margin:0 0 8px;">3. Stöbern & prüfen</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">~500 Fenster in verschiedenen Größen. Dreh-Kipp-Funktion testen, Dichtungen prüfen. Kein Zeitdruck — schauen Sie in Ruhe.</p>
        </div>
        <div class="card">
          <div style="font-size:32px;margin-bottom:12px;">💰</div>
          <h3 style="font-size:15px;font-weight:700;margin:0 0 8px;">4. Ab 80 € mitnehmen</h3>
          <p style="font-size:13px;color:rgba(232,238,255,0.65);line-height:1.6;margin:0;">Direktbezahlung vor Ort, Rechnung mit MwSt. Selbst verladen — wir helfen nicht beim Verladen. Sofort mitnehmbar.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section style="padding:64px 24px;background:#0a1530;">
    <div style="max-width:800px;margin:0 auto;">
      <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 36px;">Fragen aus {city}</h2>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;overflow:hidden;" open>
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Ist die Fahrt von {city} nach Brandenburg die werte?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Viele unserer Kunden fahren extra aus {city} und weiter — weil gebrauchte Fenster bei uns 50–70 % günstiger sind als neu. Ein 2-flügeliges Fenster, das neu 500 € kostet, gibt es hier für 80–150 €. Bei größeren Mengen oder einem ganzen Haus rechnet sich die Fahrt sehr schnell.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Was kosten gebrauchte Fenster?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Ab 80 € für ein einfaches Fenster. Je nach Größe, Verglasung und Zustand. Zweiflügelige Fenster ab ca. 120–200 €. Haustüren ab ca. 150 €. Alle Preise inkl. MwSt., Rechnung wird ausgestellt.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Wann ist der Hof geöffnet?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Freitag 10–17 Uhr, außerhalb nach Voranmeldung. Urlaubs- und Ferienzeiten können variieren — vor der Anreise aus {city} kurz per WhatsApp 0171 7263776 bestätigen lassen.</div>
        </details>
        <details style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,238,255,0.08);border-radius:12px;overflow:hidden;">
          <summary style="padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;list-style:none;">Liefern Sie auch nach {city}?</summary>
          <div style="padding:0 20px 18px;font-size:14px;line-height:1.7;color:rgba(232,238,255,0.75);">Gebrauchte Fenster: Nein — nur Selbstabholung in Brandenburg. Neue Drutex-Fenster (Maßanfertigung): Ja, deutschlandweit per Spedition in ca. 14 Werktagen. <a href="fenster-{slug}.html" style="color:#76a9fa;">Mehr zu neuen Fenstern für {city} →</a></div>
        </details>
      </div>
    </div>
  </section>

  <!-- Alternativen CTA -->
  <section style="padding:64px 24px;background:#0f1c30;text-align:center;">
    <div style="max-width:600px;margin:0 auto;">
      <h2 style="font-size:clamp(1.4rem,3vw,1.8rem);font-weight:800;margin:0 0 12px;">Neue Fenster nach {city} liefern lassen?</h2>
      <p style="color:rgba(232,238,255,0.65);margin:0 0 28px;font-size:15px;">Drutex-Maßanfertigung wird deutschlandweit geliefert — ca. 14 Werktage, faire Preise ab 285 €.</p>
      <a href="fenster-{slug}.html" class="btn-primary">Neue Fenster für {city} ansehen →</a>
    </div>
  </section>

  <!-- Footer minimal -->
  <footer style="background:#060e1e;padding:24px;text-align:center;font-size:13px;color:rgba(232,238,255,0.35);border-top:1px solid rgba(232,238,255,0.06);">
    <a href="../impressum.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Impressum</a>
    <a href="../datenschutz.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Datenschutz</a>
    <a href="../kontakt.html" style="color:rgba(232,238,255,0.4);text-decoration:none;margin:0 12px;">Kontakt</a>
    <p style="margin:12px 0 0;color:rgba(232,238,255,0.25);">© 2026 Fensterhandel Christ · Brandenburg an der Havel · Offizieller Drutex-Fachpartner</p>
  </footer>

</body>
</html>"""


def update_sitemap(new_urls: list[str]) -> None:
    """Fügt neue Stadt-URLs zur bestehenden sitemap.xml hinzu."""
    with open(SITEMAP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Bestehende URL-Einträge für Städte entfernen (bei Neugenerierung)
    content = re.sub(r'\s*<url>\s*<loc>[^<]*/staedte/[^<]*</loc>.*?</url>', '', content, flags=re.DOTALL)

    # Neue Einträge vor dem schließenden </urlset> einfügen
    new_entries = "\n"
    for url in new_urls:
        new_entries += f"""  <url>
    <loc>{url}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>\n"""

    content = content.replace("</urlset>", new_entries + "</urlset>")

    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    new_urls = []
    count = 0

    for city, bundesland, ew in CITIES:
        slug = slugify(city)

        # Neue Fenster Seite
        fenster_path = os.path.join(OUTPUT_DIR, f"fenster-{slug}.html")
        with open(fenster_path, "w", encoding="utf-8") as f:
            f.write(generate_fenster_page(city, bundesland, ew, slug))
        new_urls.append(f"{BASE_URL}/staedte/fenster-{slug}.html")

        # Gebrauchte Fenster Seite
        gebraucht_path = os.path.join(OUTPUT_DIR, f"gebrauchte-fenster-{slug}.html")
        with open(gebraucht_path, "w", encoding="utf-8") as f:
            f.write(generate_gebraucht_page(city, bundesland, ew, slug))
        new_urls.append(f"{BASE_URL}/staedte/gebrauchte-fenster-{slug}.html")

        count += 1
        if count % 10 == 0:
            print(f"  {count}/{len(CITIES)} Städte generiert...")

    # Sitemap updaten
    update_sitemap(new_urls)
    print(f"\n✓ {len(CITIES)} Städte × 2 = {len(new_urls)} Seiten generiert")
    print(f"✓ sitemap.xml aktualisiert ({len(new_urls)} neue URLs)")
    print(f"✓ Ausgabe: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
