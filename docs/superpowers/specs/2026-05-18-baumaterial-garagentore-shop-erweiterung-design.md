---
title: Shop-Erweiterung — Baumaterial (Dämmung) & gebrauchte Garagentore
date: 2026-05-18
type: spec
status: draft
ai-first: true
tags: [shop, seo, baumaterial, daemmung, garagentore]
---

## Für künftige Claude

Sarah erweitert das Sortiment von DeineFenster.de um zwei Sparten neben Fenster/Türen: **ISO-Verbunddämmung (neu, aus Polen, Plattenformat 4450 × 1400 mm = 6,24 m²/Platte)** und **gebrauchte Garagentore** (wechselnder Bestand, Verkauf über Anfrage). Ziel: Google-Suchanfragen wie „Dämmung kaufen Brandenburg" und „Garagentor gebraucht kaufen" abfangen und Besucher in den Shop leiten. Diese Spec definiert die UI-, SEO- und Compliance-Anforderungen — die Implementierung läuft anschließend über einen Implementation-Plan (writing-plans).

## Ziel & Motivation

- Zwei neue Sortimentsbereiche im Shop sichtbar und filterbar machen, ohne den bestehenden Shop-Aufbau zu zerlegen.
- Zwei SEO-Landingpages, die für die jeweiligen Kauf-Keywords ranken und in den vorgefilterten Shop weiterleiten.
- Hauptnavigation um einen sammelnden Top-Level-Eintrag „Baumaterial" erweitern, damit Direkt-Besucher das Sortiment finden.
- 100 % Compliance: keine konkreten Preise außerhalb des Shops, keine Konkurrenten-Namen, ehrliche Bestands-Formulierung („Bestand wechselt"), Footer- und Nav-Konsistenz auf allen 38 Seiten.

## Nicht-Ziele

- Keine Konfigurator-Integration für Dämmung/Garagentore — beides bleibt reines Lagergeschäft.
- Kein separater Shop-Tab oder Sub-Shop — alles bleibt in `shop.html`.
- Keine eigene Mega-Cat für Garagentore — sie bleiben unter „Baumaterial".
- Keine Werbung/Behauptungen zu CE-Konformität der Dämmung oder zu konkreten U-Werten, solange keine Hersteller-Datenblätter im Repo liegen.

## Sortimentsdaten (Stand 2026-05-18)

**Dämmung — real auf Lager:**
- Produkttyp: ISO-Verbunddämmplatten, Herkunft Polen
- Plattenformat: 4450 × 1400 mm = 6,24 m² je Platte
- Zustand: neu
- Genaue Marke/WLG/U-Wert: ergänzt Sarah beim Pflegen der Produkt-JSON (Bauproduktenverordnung — keine ungeprüften Specs publizieren)

**Garagentore — real auf Lager, Bestand variabel:**
- Zustand: gebraucht
- Typen: gemischt (Sektional / Schwing / Rolltor) — je nach Tagesbestand
- Stückzahl: nicht festgelegt, wechselt schnell
- Verkaufsweg: persönliche Anfrage (WhatsApp 0171 7263776, Mail, Anruf), Besichtigung im Hof Brandenburg an der Havel
- Konkrete Artikel-Einträge in `shop-produkte.json` folgen nach und nach, wenn Sarah etwas einstellt

## Architektur — vier Bausteine

### 1. Shop-Filter `shop.html` (Filter-Block „Produkttyp")

Im bestehenden Filter-Block „Produkttyp" (Z. 1115 in `shop.html`, generiert über `js/shop.js` und `data/shop-produkte.json`) kommen zwei neue Filter-Optionen dazu:

- `daemmung` — Label „Dämmung"
- `garagentor` — Label „Garagentor"

Beide hängen am gleichen Filter-Mechanismus wie die bestehenden Produkttypen (Fenster, Balkontür, Haustür, HST, Kellerfenster, Rollladen). Kein neuer Filter-Block, keine Sonder-Logik.

**Empty-State-Verhalten:** Wenn ein Filter ausgewählt ist (z.B. `garagentor`) aber `shop-produkte.json` keine passenden Einträge enthält, zeigt der Shop eine Hinweisbox:

> „Bestand wechselt schnell — aktuelle Verfügbarkeit per **WhatsApp** (0171 7263776), **Mail** (info@baustoffchrist.de) oder **Anruf** anfragen."

Diese Box ist im JS-Layer (`js/shop.js`) zu implementieren — sie löst keinen leeren Shop-Zustand aus, sondern ersetzt nur das Produkt-Grid.

### 2. Mega-Menü „Produkte" (`partials/navbar.html` bzw. inline in jeder Seite)

Im bestehenden Mega-Menü (Z. 695–820 in `shop.html`, gleiche Struktur in den 37 anderen Seiten) kommt ein neuer Mega-Cat-Eintrag dazu:

- **Position:** unter „Rollläden", also als 6. und letztes Top-Level-Item
- **Label:** „Baumaterial"
- **Icon:** `material-symbols-outlined` „layers" (gefüllt)
- **Panel-Inhalt (`data-mega-panel="baumaterial"`):**
  - Eintrag 1: „Dämmung – ISO-Verbund (neu)" → `shop.html?cat=daemmung`
  - Eintrag 2: „Garagentore (gebraucht)" → `shop.html?cat=garagentor`
  - Panel-CTA: „Alle Baumaterial-Angebote im Shop →" → `shop.html?cat=daemmung,garagentor` (oder Fallback `shop.html`)

**Wichtig:** Nav-Konsistenz auf allen 38 Seiten (Memory `feedback_nav_konsistenz`). Die Nav wird in vielen Seiten inline kopiert — der Implementation-Plan muss alle 38 Seiten enthalten, sonst entstehen Inkonsistenzen.

### 3. Zwei SEO-Landingpages

**`daemmung-kaufen.html`**

- H1: „ISO-Verbunddämmung kaufen · Brandenburg an der Havel"
- Title: „ISO-Verbunddämmung kaufen · Lagerware Brandenburg | DeineFenster.de"
- Meta-Description: „ISO-Verbunddämmplatten aus Polen direkt aus dem Lager in Brandenburg an der Havel. Plattenformat 4450 × 1400 mm. Selbstabholung oder Anfrage."
- Canonical: `https://www.deinefenster.de/daemmung-kaufen.html`
- Hauptsektionen:
  1. Hero mit kurzem Trust-Block (Lagerware Brandenburg, sofort verfügbar)
  2. Produktdaten-Tabelle (Plattenformat 4450 × 1400 mm, 6,24 m²/Platte, Herkunft Polen, Zustand neu) — **keine technischen Specs ohne Datenblatt**
  3. CTA-Block: „Im Shop ansehen" (Button → `shop.html?cat=daemmung`) + „Per WhatsApp anfragen"
  4. FAQ (Schema.org `FAQPage`): „Welche Dämmstärken?" „Was kostet eine Platte?" „Selbstabholung oder Lieferung?" „Wo kann ich besichtigen?"
  5. Vertrauen: Adresse + Öffnungszeiten + Anfahrt-Button
- **Keine Preise** (Sarah-Regel: nur Shop führt Preise) — stattdessen „Preis pro Platte auf Anfrage / im Shop sichtbar"
- Strukturiertes Daten: `Product`-Schema (mit `offers.priceSpecification` als Anfrage-Modell, keine konkreten Beträge) + `BreadcrumbList` + `FAQPage`

**`garagentor-gebraucht-kaufen.html`**

- H1: „Gebrauchte Garagentore kaufen · Brandenburg an der Havel"
- Title: „Garagentor gebraucht kaufen · Lagerverkauf Brandenburg | DeineFenster.de"
- Meta-Description: „Gebrauchte Garagentore (Sektional, Schwing, Rolltor) aus laufendem Lagerbestand in Brandenburg an der Havel. Bestand wechselt — Anfrage per WhatsApp, Mail oder Anruf."
- Canonical: `https://www.deinefenster.de/garagentor-gebraucht-kaufen.html`
- Hauptsektionen:
  1. Hero mit ehrlichem Trust-Block: „Wechselnder Bestand — aktuelle Verfügbarkeit auf Anfrage"
  2. Was wir typischerweise führen (Liste): Sektionaltore, Schwingtore, Rolltore — je nach Tagesbestand
  3. Wie der Verkauf abläuft (Step-Liste): Anfrage → Foto/Beschreibung schicken → Besichtigung im Hof → Abholung
  4. CTA-Block: WhatsApp (0171 7263776) + Mail (info@baustoffchrist.de) + Anruf-Button + „Aktuelle Lagerware im Shop ansehen" → `shop.html?cat=garagentor`
  5. FAQ (Schema.org `FAQPage`): „Habt ihr aktuell Sektionaltore?" „Mit Motor oder ohne?" „Garantie auf gebrauchte Tore?" „Selbstabholung Pflicht?"
  6. Vertrauen: Adresse + Öffnungszeiten + Anfahrt-Button
- **Keine konkreten Modelle/Hersteller-Namen** ohne Wissen über Bestand (UWG-Risiko: keine Behauptungen über Verfügbarkeit machen, die nicht haltbar sind)
- Strukturiertes Daten: `Product`-Schema (Modell „auf Anfrage") + `BreadcrumbList` + `FAQPage` + `LocalBusiness`-Verweis

### 4. SEO-Verankerung an bestehenden Seiten

**Footer (auf allen 38 Seiten, Sarah-Regel: Nav-Konsistenz):**
- Neue Footer-Spalte oder Erweiterung der bestehenden Sortiment-Spalte um:
  - „Dämmung kaufen" → `daemmung-kaufen.html`
  - „Garagentor gebraucht" → `garagentor-gebraucht-kaufen.html`

**`produkte.html`:**
- Unter den bestehenden Produkt-Kategorien (Fenster, Türen, etc.) ein dezenter Hinweis-Block:
  > „Außer Fenstern und Türen führen wir auch **ISO-Dämmung** und **gebrauchte Garagentore** — [Sortiment ansehen]"

**`index.html` (Startseite):**
- In der Hofverkauf-Sektion (existierende Karten für „Lager-Fenster" und „Gebraucht-Fenster") zwei neue Karten ergänzen:
  - „ISO-Dämmung aus dem Lager"
  - „Gebrauchte Garagentore"
- Bildauswahl folgt der bestehenden Bild-Pipeline (`scripts/process-master-image.py`) — keine externen Stock-Fotos ohne Lizenz-Check

**`sitemap.xml` + `robots.txt`:**
- Beide neuen URLs in `sitemap.xml` aufnehmen
- `robots.txt` unverändert (keine Sperre nötig)

## Datenflüsse

```
User googelt „Dämmung kaufen Brandenburg"
  → Treffer: daemmung-kaufen.html (rankt SEO)
  → Klick auf „Im Shop ansehen"
  → shop.html?cat=daemmung
  → js/shop.js liest URL-Parameter, setzt Filter „Dämmung" auf checked, rendert Produkte aus shop-produkte.json gefiltert
  → Bei leerem Bestand: Hinweisbox „Anfrage WhatsApp/Mail/Anruf"
```

```
User klickt im Mega-Menü auf „Baumaterial → Garagentore (gebraucht)"
  → Direkter Link zu shop.html?cat=garagentor
  → Gleicher Mechanismus wie oben
```

```
User pflegt neue Artikel (Sarah, manuell oder über shop-einstellen.html):
  → Eintrag mit kategorie: "daemmung" oder "garagentor" in shop-produkte.json
  → Filter zeigt Artikel sofort ohne Code-Änderung
```

## Compliance-Pflichtchecks für die Implementierung

Bei der Implementierung MUSS der Plan folgende Punkte sicherstellen (gemäß `CLAUDE.md`-Vorgaben des Projekts und Sarahs Hart-Regeln):

1. **Keine Konkurrenten-Namen** im sichtbaren Text oder in HTML-Kommentaren.
2. **Keine konkreten Preise** auf Landingpages — nur im Shop selbst.
3. **Keine ungeprüften Hersteller-/Technik-Specs** für Dämmung (Bauproduktenverordnung) und keine ungeprüften Modelle/Garantien für Garagentore (UWG-Irreführung).
4. **PAngV / Versandkosten:** falls Preise im Shop angezeigt werden, müssen Versandkosten/Abholpflicht in Preisnähe sichtbar sein.
5. **Smart-Quotes-Check:** vor jedem Push `scripts/check-html-smart-quotes.py` laufen lassen (Memory `feedback_html_smart_quotes`).
6. **Nav-Konsistenz auf allen 38 Seiten** (Memory `feedback_nav_konsistenz`) — nicht nur shop.html.
7. **BFSG/WCAG 2.1 AA:** neue Filter-Items + Mega-Menü-Eintrag tastatur-zugänglich, ARIA-Labels, Focus-Indikator, Kontrast 4.5:1.
8. **`.reveal` Anti-Pattern vermeiden** (Memory `feedback_reveal_antipattern`): neue Sektionen müssen ohne JS sichtbar sein.
9. **Datenschutzerklärung:** keine neuen externen Dienste — keine DSE-Änderung nötig.
10. **Impressum:** keine Änderung — gleiche Firma, gleicher Sitz.

## Erfolgs-Kriterien (Definition of Done)

- [ ] Shop-Filter zeigt „Dämmung" und „Garagentor" als Häkchen im Block „Produkttyp"
- [ ] URL-Parameter `?cat=daemmung` und `?cat=garagentor` aktivieren den jeweiligen Filter beim Seiten-Aufruf
- [ ] Empty-State zeigt Anfrage-Hinweisbox (WhatsApp / Mail / Anruf)
- [ ] Mega-Menü „Baumaterial" auf allen 38 Seiten konsistent eingebaut
- [ ] `daemmung-kaufen.html` und `garagentor-gebraucht-kaufen.html` live, validiert (W3C HTML + Schema.org Validator)
- [ ] Footer + `produkte.html` + `index.html` Hofverkauf-Sektion verlinken die neuen Seiten
- [ ] `sitemap.xml` enthält die zwei neuen URLs
- [ ] `scripts/check-html-smart-quotes.py` läuft ohne Fehler
- [ ] BFSG/WCAG: Tastatur-Nav durch neue Filter + Mega-Cat funktioniert, Kontrast geprüft
- [ ] Smoke-Test im Browser: Suche → Landingpage → Shop-Klick → Filter korrekt gesetzt → Empty-State sichtbar (solange keine Produkte gepflegt)

## Risiken & Mitigations

| Risiko | Mitigation |
|--------|------------|
| Leere Filter-Ansicht wirkt unprofessionell | Hinweisbox mit WhatsApp/Mail/Anruf statt „Keine Produkte" |
| Garagentor-Landingpage verspricht Bestand, der nicht da ist (UWG) | Hero-Text klar: „Wechselnder Bestand — Anfrage" + keine konkreten Modelle nennen |
| Dämmung-Specs ohne Datenblatt publiziert (Bauproduktenverordnung) | Nur Plattenformat angeben, keine WLG/U-Werte ohne Herstellerbeleg |
| Nav-Inkonsistenz auf einzelnen Seiten | Plan listet alle 38 Seiten explizit als Änderungs-Punkt |
| Smart-Quotes brechen Vercel-Build | Check-Skript läuft vor Push (Memory-Regel) |

## Offene Punkte für später (nicht Teil dieser Spec)

- Produktbilder für die Landingpages (eigene Bild-Pipeline-Session)
- Konkrete Artikel-Einträge in `shop-produkte.json` (Sarah pflegt nach)
- Eventuell später: Untergruppierung der Garagentore (Sektional/Schwing/Rolltor) als zweiter Filter-Block, falls Bestand wächst
- Eventuell später: weitere Baumaterial-Kategorien (Holzbalken, Putz, Trockenbau) unter dem gleichen Mega-Cat

## Nächster Schritt

Nach Sarahs Spec-Review wird ein detaillierter Implementation-Plan über `superpowers:writing-plans` geschrieben — mit Schritt-für-Schritt-Aufgaben, Datei-für-Datei-Änderungen, Test-Plan und Push-Reihenfolge.
