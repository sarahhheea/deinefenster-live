# DeineFenster.de — Projektstand

**Letzte Aktualisierung:** 05.05.2026

---

## ✅ FERTIG — Bereit für Go-Live

### Design & Dark Theme
- **Alle Seiten** außer `shop.html` und `konfigurator.html` sind im dunklen Design umgesetzt
- Farbpalette: `#0a1530` (main), `#060e1e` (footer/body), `#0f1c30` (cards), `#0a1225` (alternating)
- CTA-Buttons: `background:#225eaa;color:#fff` überall einheitlich
- **14 Produkt-Unterseiten** (`produkte/**/*.html`) — vollständig dark

### Performance
- **Tailwind CSS lokal gebündelt** — `css/tailwind.css` (74KB minified)
  - Vorher: CDN-Script mit 7.9s render-block
  - Jetzt: Lokale CSS-Datei, kein render-block
  - Rebuild: `npm run build:css`
- Google Fonts preconnect auf allen Seiten

### SEO
- Title-Tags: alle unter 60 Zeichen
- Meta-Descriptions: alle unter 160 Zeichen
- Heading-Hierarchie: h1→h2→h3 überall korrekt
- Sitemap: `sitemap.xml` mit 27 URLs, lastmod 2026-05-05
- Schema.org: LocalBusiness, FAQPage, Article, BreadcrumbList
- robots.txt: BLOCK-MODUS (Disallow: /) — vor Go-Live umstellen!

### Seiten-Status
| Seite | Status | Notizen |
|-------|--------|---------|
| index.html | ✅ fertig | Hero-Slideshow, KI-Bilder, Wissens-Sektion |
| produkte.html | ✅ fertig | Kategorie-Nav, Video-Heroes, Listenzeilen |
| ueber-drutex.html | ✅ fertig | Videos, Timeline, Produktion, Awards, Bento-Grid |
| ueber-uns.html | ✅ fertig | Team, Öffnungszeiten, Kontakt-Schnellkarte |
| kontakt.html | ✅ fertig | Große Tel-Nr, Maps-Embed, Team-Zeilen, Anfahrt |
| faq.html | ✅ fertig | 12 FAQs, FAQPage-Schema, dark |
| glossar.html | ✅ fertig | A–Z Glossar, Anchor-Links |
| kfw-foerderung.html | ✅ fertig | KfW-Inhalte, dark |
| impressum.html | ✅ fertig | |
| datenschutz.html | ✅ fertig | |
| agb.html | ✅ fertig | |
| danke.html | ✅ fertig | |
| shop.html | 🔄 eigenständig | Shop-System, CDN Tailwind bleibt |
| konfigurator.html | 🔄 nicht anfassen | Noch in Bearbeitung |
| produkte/kunststofffenster/*.html | ✅ fertig | 4 Seiten |
| produkte/balkontueren/*.html | ✅ fertig | 2 Seiten |
| produkte/haustueren/*.html | ✅ fertig | 2 Seiten |
| produkte/hebe-schiebetueren/*.html | ✅ fertig | 4 Seiten |
| produkte/rollladen/*.html | ✅ fertig | 1 Seite |

---

## 🚨 VOR GO-LIVE (muss Sarah machen)

### 1. robots.txt umstellen
Datei: `robots.txt`
- Aktuell: `Disallow: /` (Block-Modus für Preview-URL)
- Bei Go-Live: Die ersten 2 Zeilen (`User-agent: *` + `Disallow: /`) löschen
- Die auskommentierte Produktions-Version aktivieren (Kommentare entfernen)

### 2. img/masters/sarah/ NICHT deployen
- Ordner enthält KI-Master-Bilder (bis 4.9 MB pro Stück, ~197 MB gesamt)
- Bereits in `.gitignore` eingetragen → wird nicht committet → nicht deployed ✓

### 3. Google Search Console einrichten
- Domain verifizieren nach Go-Live
- Sitemap `https://www.deinefenster.de/sitemap.xml` einreichen

---

## 📋 OFFEN — Post Go-Live Backlog

### Performance
- [ ] Produktbilder → WebP konvertieren (2,990 KB Einsparung laut Lighthouse)
- [ ] LCP verbessern: Erstes Hero-Bild/Video `<link rel="preload">` hinzufügen
- [ ] Accessibility Score: Aktuell 88/100, Ziel 95+ (kleiner Kontrast-Tweaks)

### Content
- [ ] Produkt-Seiten: Echte Kundenfotos sobald vorhanden
- [ ] Blog/Ratgeber-Sektion (Long-Tail SEO) — Sarah-Entscheidung ausstehend

### Konfigurator
- [ ] `konfigurator.html` — Sarah sagt Bescheid wann fertig
- [x] Haustür-Farbframes für Live-Preview — fertig 06.05.2026
  - 37 Drutex-CDN-Frames gemappt (Iglo Energy Montana, Außenansicht mit Stoßgriff)
  - 8 Farben ohne Drutex-Pendant (Achatgrau, Signalgrau, Alux DB, Alu gebürstet, Siena Noce/Rosso, Bergkiefer, Teak) bei Haustür ausgeblendet via `HAUSTUER_FARB_BLOCKLIST` — beim Fenster bleiben sie sichtbar
  - Innenansicht in Farbe weiterhin offen (Sarah-Plan: später per Google Flow)
- [ ] Balkontür Farbbilder (innen + außen, 0/46 generiert)
- [ ] HST Farbbilder (innen + außen, 0/46 generiert)

---

## 🛠️ TECH-STACK

- **Frontend:** HTML + Tailwind CSS v4 (lokal gebündelt) + JavaScript
- **Fonts:** Plus Jakarta Sans + Manrope + Fraunces (Google Fonts)
- **Icons:** Material Symbols Outlined (Google)
- **Animationen:** GSAP 3.12 + ScrollTrigger
- **Slider:** Swiper 11
- **Deployment:** Netlify (Static, kein Build-Step nötig — CSS vorgebaut)
- **Videos:** Drutex CDN direkt verlinkt

## 🎨 DESIGN-TOKENS

```
Hintergründe:  #060e1e (body)  #0a1530 (main)  #0f1c30 (cards)  #0a1225 (alt)
Text:          #e8eeff (primary)  rgba(232,238,255,0.75) (secondary)  rgba(232,238,255,0.45) (muted)
Akzente:       #76a9fa (blue)  #c9a84c (gold)
CTA:           background:#225eaa  color:#fff
Borders:       rgba(255,255,255,0.08)  rgba(118,169,250,0.2) (blue-tinted)
```
