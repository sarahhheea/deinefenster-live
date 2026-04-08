# PROJEKT: DeineFenster.de – Prototyp
## Letztes Update: Dezember 2024

---

## PROJEKTÜBERSICHT

- **Website:** DeineFenster.de
- **Typ:** Fenster Online-Shop (Business 1)
- **Lieferant:** Drutex Polen
- **Design-Vorlage:** Google Stitch (Haven Windows Design)
- **Status:** ✅ Alle Hauptseiten erstellt

---

## DATEIEN-ÜBERSICHT

| Datei | Beschreibung | Status |
|---|---|---|
| `index.html` | Startseite | ✅ Fertig |
| `produkte.html` | Produktkatalog | ✅ Fertig |
| `konfigurator.html` | 6-Schritte-Konfigurator mit Live-Preis | ✅ Fertig |
| `ueber-uns.html` | Über uns Seite | ✅ Fertig |
| `kontakt.html` | Kontakt + FAQ | ✅ Fertig |
| `dashboard.html` | Admin-Dashboard (nur für Sarah) | ✅ Fertig |
| `impressum.html` | Rechtliche Pflichtseite | ✅ Fertig |
| `datenschutz.html` | DSGVO Pflichtseite | ✅ Fertig |
| `sitemap.xml` | Für Google SEO | ✅ Fertig |
| `robots.txt` | Für Google SEO | ✅ Fertig |

---

## DESIGN-SYSTEM

### Farben
- **Primär (Blau):** #225eaa
- **Dunkelblau (Navbars):** #1e3a8a (blue-900)
- **Heller Hintergrund:** #f9f9ff
- **Container:** #e8eeff

### Schriftarten
- **Headlines:** Plus Jakarta Sans (Google Fonts)
- **Fließtext:** Manrope (Google Fonts)

### Icons
- Material Symbols Outlined (Google)

---

## KONFIGURATOR – PREISMODELL

### Grundpreise pro m²
| Material | Preis/m² | Minimum |
|---|---|---|
| Kunststoff | 220 € | 180 € |
| Aluminium | 380 € | 280 € |
| Holz-Alu | 520 € | 400 € |

### Verglasung Aufschlag
| Verglasung | Multiplikator |
|---|---|
| 2-fach Wärme | ×1,0 |
| 3-fach Wärme | ×1,25 |
| 3-fach Schall | ×1,35 |

### Öffnungsart Aufschlag
| Öffnungsart | Preis |
|---|---|
| Festverglasung | −30 € |
| Nur Dreh | +0 € |
| Dreh-Kipp | +35 € |
| Parallel-Schiebe | +90 € |

### Farbe Aufschlag
| Farbe | Preis |
|---|---|
| Weiß | +0 € |
| Weiß/Anthrazit | +60 € |
| Anthrazit | +80 € |
| Sonderfarbe | +120 € |

### Extras (pro Fenster)
| Extra | Preis |
|---|---|
| Rolladen motorisiert | +220 € |
| Rolladen manuell | +120 € |
| Insektenschutz | +55 € |
| Sprossen | +75 € |
| Sicherheitspaket RC2 | +180 € |

---

## SEO – KEYWORDS

### Hauptkeywords
- fenster kaufen online
- kunststofffenster
- aluminiumfenster preis
- holzfenster kaufen
- drutex händler
- fenster auf maß

### Long-Tail Keywords
- kunststofffenster online bestellen
- aluminiumfenster anthrazit kaufen
- fenster konfigurator preis berechnen
- drutex fenster deutschland
- günstige fenster direktkauf

---

## NÄCHSTE SCHRITTE (TODO)

### Technisch (Claude macht das)
- [ ] Make.com Webhook einrichten (E-Mail-Automatisierung)
- [ ] Resend.com API Key einbinden
- [ ] Google Analytics 4 einbinden
- [ ] Cookie Banner hinzufügen
- [ ] Formular an Make.com anschließen

### Inhalt (Sarah macht das)
- [ ] Echte Produktbilder von Drutex einfügen
- [ ] Echte Preise anpassen
- [ ] Impressum mit echten Daten füllen
- [ ] Datenschutzerklärung mit echten Daten füllen
- [ ] Telefonnummer + E-Mail-Adresse eintragen
- [ ] Google My Business erstellen

---

## E-MAIL SYSTEM (Make.com + Resend.com)

### Ablauf
1. Kunde füllt Konfigurator aus → klickt "Angebot anfordern"
2. Formular sendet Daten an **Make.com Webhook**
3. Make.com sendet via **Resend.com**:
   - **Kunde** bekommt: Bestätigungs-E-Mail mit seiner Konfiguration
   - **Sarah** bekommt: Neue-Anfrage-E-Mail mit allen Details

### Einrichten (Schritt für Schritt)
1. Make.com Account erstellen (kostenlos bis 1.000 Operationen/Monat)
2. Resend.com Account erstellen (kostenlos bis 3.000 Mails/Monat)
3. In Make.com: Neues Szenario → Webhook → HTTP-Modul
4. Webhook-URL in `konfigurator.html` eintragen (Zeile mit `MAKE_WEBHOOK_URL`)
5. E-Mail-Templates in Make.com einrichten

---

## WENN DU DIESES PROJEKT FÜR EINEN NEUEN KUNDEN KOPIERST

1. Ordner kopieren → umbenennen zu `kunde-FIRMENNAME`
2. KUNDE.md erstellen
3. Folgendes ändern:
   - Firmenname (überall ersetzen)
   - Farben (tailwind.config in allen Dateien)
   - Produkte (in produkte.html)
   - Preismodell (in konfigurator.html → pricing Objekt)
   - Kontaktdaten (Telefon, E-Mail, Adresse)
   - SEO Meta-Tags (Title, Description, Keywords)
   - Schema.org Daten
   - Impressum & Datenschutz

---

*Erstellt mit Claude Code – DeineFenster.de Prototyp*
