# DeineFenster.de — Claude Anweisungen

## DEUTSCHE COMPLIANCE — IMMER MITPRÜFEN (Sarah-Wunsch 15.05.2026)

Bei JEDER Änderung an dieser Website muss ich proaktiv prüfen — auch ohne dass Sarah explizit fragt:

**Skills die ich heranziehe:**
- `anwalt-de` — DSGVO, TTDSG, DDG/TMG, UWG, AGB, Urheberrecht, BFSG, EU AI Act
- `dsgvo-third-country-transfer` — bei JEDEM externen Dienst (CDN/SaaS/API)
- `dsgvo-auth-and-logging` — bei Login/Session/Logging
- `dsgvo-email-marketing` — bei Newsletter/Marketing-Mail
- `accessibility-compliance-accessibility-audit` — BFSG ab 28.06.2025 (B2C-Pflicht)

**6 Pflicht-Checks die ich bei relevanten Änderungen automatisch laufen lasse:**

1. **Impressum** (§ 5 DDG) — Firmenname konsistent zwischen Impressum + AGB + Footer
2. **Datenschutzerklärung** (Art. 13 DSGVO) — Jeder neue externe Dienst muss in DSE rein, sonst Bußgeldrisiko
3. **Cookie-Consent** (§ 25 TTDSG) — Vor jedem nicht-essentiellen Cookie/Script: Consent erforderlich. Plausible nur nach Statistik-Consent.
4. **Widerrufsbelehrung** (§ 312g, § 355 BGB) — Bei B2C-Bestellprozess: Muster-Widerrufsformular + 14 Tage Frist + Ausnahme Maßanfertigung
5. **Preisangaben** (PAngV) — Endpreise inkl. MwSt., Versandkosten in Preisnähe sichtbar
6. **Barrierefreiheit** (BFSG ab 28.06.2025) — WCAG 2.1 AA: Kontrast 4.5:1, Tastatur-Nav, Alt-Texte, Formular-Labels, Focus-Indikatoren, Skip-Link

**Triggerlose Pflichtprüfungen** (auch ohne Sarah-Anfrage):
- Externe Script-Tags (Fonts, CDNs, Analytics) → DSGVO/TTDSG-Check + DSE-Eintrag
- Iframes (Maps, YouTube, Social Embeds) → 2-Klick-Lösung Pflicht
- Formulare → Einwilligungs-Checkbox + DSE-Link + AVV bei Auftragsverarbeiter
- API-Keys/Tokens → niemals im Frontend
- Stock-Bilder → Lizenz-Quelle prüfen
- Konkurrenten-Nennung → UWG § 6 prüfen

**Bekannte Risiken in dieser Codebase (Status 15.05.2026):**
- ✅ Cookie-Banner live (TTDSG-konform)
- ✅ Google Fonts entfernt (LG-München-Risiko ausgeschlossen)
- ✅ Resend/GitHub-Token aus Frontend (Worker-Proxy + Login-Token)
- ✅ Google Maps 2-Klick-Lösung
- ✅ DSE Cloudflare/Resend/Web3Forms/Make/Plausible/Tailwind/Supabase/Maps gelistet
- 🟡 BFSG-Audit ausstehend (B2C-Site, ab 28.06.2025 Pflicht)
- 🟡 PAngV-Check Konfigurator (Versandkosten in Preisnähe?)
- 🟡 Impressum vs. AGB Firmenname harmonisieren

## CHANGELOG (neueste zuerst)

### 15.05.2026 (2. Eintrag — Werbung mit Higgsfield)
- **YouTube-Learning gespeichert:** `~/youtube-learnings/higgsfield-mcp-claude-ugc-hooks.md` — Higgsfield MCP + Claude → UGC-Hooks-Pipeline. Sarah-Plan: später Werbung schalten (Reels/TikTok) mit Hook-Pattern (Shock-Opener stoppt Scrolling). Drei konkrete Hook-Ideen für DeineFenster: Lagerverkauf, Ankauf, Hofverkauf.
- **WICHTIG:** Higgsfield-Generate-Sperre bleibt aktiv — Memory `kontakt_christ` und CLAUDE.md "Higgsfield kritische Finanzregel" haben Vorrang. Vor produktivem Hook-Einsatz: Browser-Playwright-Test, Toggle prüfen, Balance vor/nach.
- **Recherche-Tipp aus Video:** Alex Hormozi Hook-Theorie ist die Foundation hinter Higgsfields Hooks-Feature — sein Buch "$100M Offers" ist gratis Foundation für Hook-Prompt-Engineering.

### 15.05.2026 (1. Eintrag — Seiten-Aufräumen)
- **index.html · Hofverkauf-Karten redesigned:** Bilder voll sichtbar oben (240px), hellblauer Rand 1.5px (rgba(118,169,250,0.32)), Hover lifts card. Lagerfenster-Karte: LKW-Bild (`hof-lager-lieferung.jpg`, object-position:center) — vorher hatte ich auf Stapler bzw. Hochregal-Halle getauscht, Sarah wollte LKW zurück.
- **fenster-austauschen-kosten.html (Ankauf-Seite) · Custom-CSS nachgerüstet:** Klassen badge / hero-blob / info-card / btn-whatsapp / faq-summary / ankauf-step / answer-box-blue / gallery-img / notice-box waren im HTML benutzt aber nirgends definiert → Style-Block aus gebrauchte-fenster-kaufen.html portiert + Ankauf-spezifische Klassen ergänzt + global-design.css verlinkt. **3 unpassende Stock-Fotos** (Bar/Hand/Skyline von Unsplash) entfernt — passten nicht zum Thema "alte Fenster verkaufen".
- **kunststofffenster-kaufen.html (Neue Fenster) · Sektionen kompakter:** Sektionen "ABLAUF" (96/100→72/80px) und "WARUM BEI UNS" (88→72px) hatten zuviel Padding für ihren Inhalt → wirkten leer. mb-20 → mb-12, mt-16 → mt-12.
- **gebrauchte-fenster-kaufen.html · Geprüft, kein Action:** Hero-CTA ist nur 1 Primary + 1 Öffnungszeiten-Pille (sauber). Die im Screenshot sichtbare "Fragen?"-chat-Pille ist ein globales Widget, nicht im Page-Code.
- **YouTube-Lerning gespeichert:** `~/youtube-learnings/stitch-2-claude-code-design-pipeline.md` — Plan: Stitch-MCP einbinden, `design.md` als Single-Source-of-Truth für alle Seiten generieren (verhindert künftiges Drift wie auf Ankauf-Seite).

---

## AKTUELLE URLs (Stand 07.05.2026)
| Was | URL |
|-----|-----|
| Live-Vorschau (GitHub Pages) | `https://sarahhheea.github.io/deinefenster-live/` |
| Live-Repo (wo wir pushen) | `https://github.com/sarahhheea/deinefenster-live` (Remote: `live`) |
| Template/Backup | `https://github.com/sarahhheea/template-deinefenster` (Remote: `origin`) |
| Ziel-Domain (noch WordPress) | `https://www.deinefenster.de` — NICHT anfassen |

Netlify-URL ist OFFLINE. GitHub Pages ist aktuell.
**Push IMMER zum `live` Remote:** `git push live HEAD:main`

## KONFIGURATOR-SCOPE
- Nur Drutex, nur Kunststoff. Kein Alu, kein Holz, kein anderer Hersteller.
- Scope: meinfenster24.de minus Materialvielfalt. Fehlendes = Lücke, nicht Feature.
- Links IMMER mit `.html` Extension (`/konfigurator.html`, nie `/konfigurator`).
- Funktionierenden Code (Step-Order, SVG-Preview, CRM-Logik) NICHT anfassen ohne Anfrage.

## HIGGSFIELD — KRITISCHE FINANZREGEL
MCP-Tools `generate_image` / `generate_video` sind GESPERRT — kosten Credits auch wenn "Unbegrenzt"-Toggle grün ist. Toggle gilt NUR in Browser-UI.

Einziger erlaubter Weg: Playwright → `https://higgsfield.ai/ai/image` → Toggle grün prüfen → Nano Banana 2 → Balance vor/nach Generate notieren. Bei 1 Credit Verlust: SOFORT STOP.

Erlaubte MCP-Tools (kein Credit-Verbrauch): `balance`, `job_status`, `show_generations`.

## PRODUKT-BILDER PIPELINE (PFLICHT)
Jedes neue Master-Bild MUSS durch:
```bash
python3 scripts/process-master-image.py <input.jpeg> img/<name>.png
```
Garantiert 1024×1280, 92% Inhaltshöhe, weißer Hintergrund. Ohne Pipeline = unproportional im Konfigurator.

## TÜR-BILDER REGELN (HART)
- KEINE Schatten (kein Schlag-, kein Hintergrund-, kein weicher Schatten)
- Außen: NIEMALS Scharniere sichtbar. IMMER Stoßgriff bei konkreten Modellen.
- Innen: 3 silberne Bandscharniere. DIN-Konsistenz: Außen Stoßgriff rechts → Innen Klinke links, Scharniere rechts.
- Innen und Außen müssen exakt gleich groß wirken (gleiche Pipeline, gleicher Canvas).

## HAUSTÜR-FARB-LOGIK (Stand 06.05.2026)
```
Außen + Modell + Farbe (kein Holzdekor) → img/farben/haustuer_aussen_{modell}_{farbe}.png
Außen + Modell + keine Farbe            → TUER_IMGS Katalogbild (Anthrazit-Original)
Innen + Farbe                           → img/farben/haustuer_innen_{farbe}.png
Außen + kein Modell + Farbe             → HAUSTUER_FARB_FRAMES CDN-Montana
Holzdekore + Modell                     → CDN-Montana-Fallback (keine Maserung in Pillow)
```

## BILD-WORKFLOW (PFLICHT wenn Bilder betroffen)
1. deinefenster-* Skills lesen (projekt-lokal, nicht user-level)
2. image-validator Subagent fragen
3. Plan zeigen → Freigabe abwarten
4. Implementieren → Browser-Screenshot

## BEKANNTE BUGS (nie wieder)
- Holzfenster-Bild bei Kunststoff-Auswahl → immer Material-Check
- Bild-Typ falsch (Dreh bei Kipp-Auswahl) → immer Öffnungsart prüfen
- Haustür Block-Priorität: Block 1 (Modell+Farbe) > 2e (CDN) > 2f (Innen)

## COMPLIANCE (automatisch mitprüfen)
Preise immer mit MwSt (PAngV). Drutex-Specs nur aus offizieller Quelle. KI-Bilder als "symbolische Darstellung" kennzeichnen wenn nötig. Kostenpflichtige Tools immer vorher nennen + fragen. Details in `COMPLIANCE.md`.

## KEIN JA-SAGER
Push back wenn Idee Löcher hat — direkt, nicht "ja aber". Meinung nur ändern bei neuem Argument, nicht bei Unzufriedenheit. Gilt auch wenn Sarah "mach einfach" sagt.

## DESIGN-STANDARDS
Fonts: Plus Jakarta Sans (Headlines) + Manrope (Body). Farben: #225eaa + #1e3a8a. GSAP für Animationen. Kein Inter, kein Standard-Template. Details in `DESIGN-SKILLS.md`.

## SKILLS (projekt-lokal bevorzugen)
Für Bilder/Logik/Research: `.claude/skills/deinefenster-{images,logic,research}/` — NICHT die user-level Versionen (veraltet).
Für Subagents: `.claude/agents/code-reviewer` und `image-validator`.
