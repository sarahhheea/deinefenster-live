# Compliance-Status deinefenster.de

Stand: 2026-05-15

## ✅ Erledigt (rechtlich abgedeckt)

### Datenschutz / DSGVO
- [x] **Cookie-Banner** TTDSG-konform (Ablehnen + Akzeptieren gleich prominent, § 25 TTDSG)
- [x] **Datenschutzerklärung** listet alle Auftragsverarbeiter: Cloudflare, Resend, Web3Forms, Make, Plausible, Tailwind CDN, Supabase, GitHub Pages, Google Maps (2-Klick)
- [x] **Plausible Analytics** lädt nur nach Statistik-Consent (vorher: 35 Seiten ohne Consent)
- [x] **Google Fonts entfernt** (LG-München-Urteil 2022 — Abmahnrisiko ausgeschlossen)
- [x] **Google Maps 2-Klick-Lösung** auf Kontaktseite
- [x] **Kontaktformular DSGVO-Checkbox** + Link zur DSE
- [x] **Bunny Fonts** (EU-Server, DSGVO-konform) statt Google Fonts
- [x] **Konfigurator-Submit**: Einwilligungs-Checkbox

### Impressum / TMG / DDG
- [x] **§ 5 DDG vollständig**: Firmenname (Fensterhandel Christ), Inhaber, Anschrift, Telefon, E-Mail, USt-IdNr
- [x] **§ 18 MStV** (statt veraltetem § 55 RStV)
- [x] **Firmenname konsistent** zwischen Impressum, AGB, Footer

### AGB / BGB / PAngV
- [x] **Widerrufsbelehrung** formgerecht (§ 312g, § 355 BGB, Anlage 1 EGBGB)
- [x] **Muster-Widerrufsformular** enthalten
- [x] **Maßanfertigungs-Ausnahme** (§ 312g II Nr. 1 BGB) korrekt
- [x] **PAngV** in AGB klargestellt: Richtpreise inkl. MwSt., Versandkosten separat

### Sicherheit (kein Compliance-Thema, aber dazugekommen)
- [x] Resend-API-Key aus Frontend (vorher öffentlich lesbar)
- [x] GitHub-Token aus Frontend (jetzt im Browser-localStorage nach Login)
- [x] Make.com-Webhook nicht mehr im Frontend
- [x] Web3Forms-Key bleibt (designed public)

## 🟡 Offen — sollte noch gemacht werden

### Barrierefreiheit (BFSG ab 28.06.2025)
Das **Barrierefreiheitsstärkungsgesetz** ist seit 28.06.2025 in Kraft. DeineFenster.de ist B2C-Online-Verkauf → WCAG 2.1 AA Pflicht. Bei Verstoß: Ordnungsgeld bis 100.000 € + Marktuntersagung.

**Audit-Punkte (TBD)**:
- [ ] Kontraste prüfen — `rgba(255,255,255,0.4)` auf Navy ist oft < 4.5:1
- [ ] `<div onclick=...>` Stellen finden + `role="button"`/`tabindex="0"`/Keydown-Handler ergänzen (Konfigurator-Karten, Filter, etc.)
- [ ] Alt-Texte für ALLE Produktbilder prüfen
- [ ] Formular-Labels: alle `<input>` müssen `<label for="…">` oder `aria-label` haben
- [ ] Skip-Link "Zum Hauptinhalt" auf Hauptseiten
- [ ] `:focus-visible` global einheitlich
- [ ] Heading-Struktur pro Seite: 1× h1, dann hierarchisch h2 → h3 → …
- [ ] ARIA für Custom Components (Cookie-Banner, Tabs, Hero-Cards)

**Empfehlung**: Audit-Skill `accessibility-compliance-accessibility-audit` einsetzen, dann phasenweise fixen (siehe Phasen-Plan unten).

### PAngV-Detailcheck Konfigurator
- [ ] Versandkosten in Preisnähe (nicht erst auf Bestellübersicht)?
- [ ] Endpreis-Angabe inkl. MwSt. überall sichtbar?

### UWG (Wettbewerbsrecht)
- [ ] Keine namentliche Nennung von Konkurrenten in Vergleichswerbung (UWG § 6) — Memory `feedback_compliance_vergleichswerbung` ist drin, aber regelmäßig prüfen
- [ ] "Marktführer"/"größter Hersteller"-Claims vermeiden (siehe Memory `feedback_keine_marktfuehrer_claims`)

## Phasen-Plan BFSG (geschätzter Aufwand)

| Phase | Inhalt | Zeitaufwand |
|-------|--------|-------------|
| 1 | Kontrast-Audit + globale CSS-Fixes (4.5:1 minimum) | 1–2 h |
| 2 | Tastatur-Nav: `<div onclick>` → echte `<button>` ODER aria-button | 2–3 h |
| 3 | Alt-Texte + ARIA-Labels + Skip-Links | 1–2 h |
| 4 | Formular-Labels überprüfen + ergänzen | 1 h |
| 5 | Cookie-Banner ARIA-Roles ergänzen | 30 min |
| 6 | Heading-Struktur pro Seite begradigen | 1–2 h |
| 7 | Browser-Test mit Tastatur + Screen-Reader (VoiceOver) | 1 h |
| **Gesamt** |  | **8–13 h** |

## Quellen / Stand

- **§ 5 DDG** (Digitale-Dienste-Gesetz) — seit 14.05.2024, ersetzt § 5 TMG
- **§ 18 MStV** — seit 07.11.2020, ersetzt § 55 RStV
- **§ 25 TTDSG** — Cookie-Einwilligung
- **§ 312g, § 355 BGB + Anlage 1 EGBGB** — Widerrufsrecht
- **PAngV** vom 12.11.2021
- **BFSG** seit 28.06.2025 — Barrierefreiheit
- **DSGVO** Art. 6, 13, 14 — Rechtsgrundlagen, Informationspflichten
- **BGH I ZR 7/16 ("Planet49")** — Cookie-Consent muss aktiv + frei sein
- **LG München 20.01.2022 (3 O 17493/20)** — Google Fonts ohne Consent = Schadensersatz

*Stand-Hinweis: Diese Übersicht ersetzt keine anwaltliche Beratung. Für verbindliche Rechtsauskunft Fachanwalt für IT-Recht konsultieren.*
