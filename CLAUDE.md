# DeineFenster.de – Claude Anweisungen

## Projekt
Online-Shop für Drutex Fenster und Türen.
Ziel: Beste Fenster-Website Deutschland – besser als meinfenster24.de
NUR Drutex Produkte. Alle Details in PROJEKT.md

## 🔗 AKTUELLE URLs (Stand 06.05.2026 — IMMER DIESE NUTZEN)

| Was | URL |
|-----|-----|
| **Live-Vorschau** (GitHub Pages, aktuell) | `https://sarahhheea.github.io/deinefenster-live/` |
| **Quellcode** (wo wir arbeiten) | `https://github.com/sarahhheea/template-deinefenster` |
| **Ziel-Domain** (noch nicht umgestellt) | `https://www.deinefenster.de` |

⚠️ Die alte Netlify-URL (`fluffy-sunburst-d0520c.netlify.app`) ist OFFLINE — nie mehr nutzen.
⚠️ Die echte Domain `deinefenster.de` zeigt noch die alte WordPress-Seite — NICHT anfassen.

## 🚪 TÜR-BILDER GRUND-REGELN (Sarah-Regel 05.05.2026 — HART, nicht abweichen)

Bei JEDEM generierten oder eingebauten Tür-Bild für DeineFenster.de gelten diese Regeln. Volldetails in `docs/drutex-bildstil-analyse.md`.

### Regel 1 — KEINE SCHATTEN (egal welches Bild)
- Kein Schlagschatten unter der Tür
- Kein Schatten auf dem Hintergrund
- Auch keine subtilen weichen Schatten — wirklich KEINE
- Gilt für alle Tür-Bilder, alle Ansichten, alle Farben

### Regel 2 — Außenansicht = NIEMALS Scharniere sichtbar
- Außenansicht zeigt nur Türblatt-Front
- Scharniere sind außen IMMER vom Rahmen verdeckt — werden also NICHT abgebildet
- Negative-Prompt für jede Außen-Generierung: `no hinges visible, no door hinges`

### Regel 3 — Innenansicht = 3 silberne Bandscharniere (DIN-Seite beachten!)
- L-förmige Bandscharniere mit zwei sichtbaren Plättchen
- Vertikale Position: ~7% (oben), ~50% (mitte), ~90% (unten) der Türhöhe
- Material: gebürstetes Edelstahl
- **Seite hängt von DIN-Anschlag ab — siehe Regel 5 unten**

### Regel 5 — DIN-Konsistenz Außen↔Innen (Sarah-Regel 06.05.2026 — HART)
Innen- und Außenansicht müssen physisch dieselbe Tür zeigen, gespiegelt:
- **Außen Stoßgriff RECHTS** (= DIN links, Bänder physisch links/verdeckt) →
  **Innen Klinke LINKS, Scharniere RECHTS**
- **Außen Stoßgriff LINKS** (= DIN rechts, Bänder physisch rechts/verdeckt) →
  **Innen Klinke RECHTS, Scharniere LINKS**

Stoßgriff/Schloss und Klinke sind IMMER auf der gegenüberliegenden Seite der Bänder
(sonst geht die Tür physisch nicht auf). Beim Wechsel der Ansicht spiegelt sich alles.

Aktueller Stand `haustuer_iglo_energy_montana_*` (Sarah-Confirm 06.05.2026):
- Außen: Stoßgriff rechts, Schloss-Zylinder rechts unter Stoßgriff → DIN links
- Innen muss: Klinke links, 3 Scharniere rechts, Glas mittig (gleicher vertikaler Schlitz)

### Regel 4 — Beschlag-Logik nach Bildklasse
| Bildklasse | Außen | Innen |
|---|---|---|
| Default-Standard-Haustür (`haustuer_*_v3/v4.png`) | Klinke (schlicht) | Klinke (schlicht) + Scharniere |
| Konkrete Modelle (Alaska, Texas, DX, IGLO Energy etc.) | Stoßgriff (Premium-Edelstahl) | Klinke + Scharniere |

Niemals Stoßgriff + Klinke gleichzeitig prominent auf einem Bild.

### Regel 4a — Außenansicht = IMMER Stoßgriff (Sarah-Confirm 05.05.2026)
Sarah-Vereinbarung 05.05.2026: Sobald wir konkrete Modell-Bilder oder Farb-Varianten
für Haustüren als Außenansicht zeigen, sind diese IMMER mit Stoßgriff. Nie mit Klinke.
Gilt für: Konfigurator-Live-Preview, Produktseiten-Hero, alle generierten Bilder ab heute.
Begründung: Drutex-Katalog-Standard für Iglo Energy / Iglo 5 Außen ist immer Stoßgriff;
Klinken sind nur für die Default-Vorschau (haustuer_*_v3/v4) zulässig wo noch kein Modell
gewählt ist.

### Regel 4b — Konfigurator: Iglo Energy Farb-Frames als Live-Preview (Sarah-Plan 05.05.2026)
Im Konfigurator zeigen wir bei Haustür-Auswahl + Farbklick die Drutex-CDN-Bilder vom
**IGLO Energy Montana** Modell (das mit Stoßgriff). Quelle: 41 Farb-Swatches auf
`produkte/haustueren/iglo-energy.html`. Map heißt `HAUSTUER_FARB_FRAMES` in
`konfigurator.html`. URLs werden programmatisch via base64 aus dem polnischen
Farbnamen gebaut. Der Rest (Innenansicht in Farbe, weitere Modelle in Farbe) wird
später per Google Flow generiert.

## 🔴 HIGGSFIELD PFLICHT-REGELN (Sarah-Regel 02.05.2026 — STOP bei Verstoß)

> **58 Credits durch MCP-API verloren (02.05.2026). Grund: MCP API zieht IMMER Credits,
> egal ob "Unbegrenzt"-Toggle im Browser grün ist. Toggle gilt NUR für Browser-UI.**

### 🖥️ PLAYWRIGHT BROWSER-SETUP (Isoliertes Chrome-Profil)

**Profil-Pfad:** `~/.claude-playwright-profiles/higgsfield/`
→ Nur Higgsfield-Cookies, kein Zugriff auf Sarahs normalen Chrome

**Erster Login (einmalig pro Session):**
1. Playwright navigiert zu `https://higgsfield.ai/ai/image`
2. Claude sagt: „Browser ist offen. Bitte logg dich jetzt manuell ein."
3. Sarah loggt sich ein — Claude liest KEINE Passwörter aus, macht KEINE Screenshots während Login
4. Sarah sagt „eingeloggt"
5. Claude prüft nur: Ist User eingeloggt? Toggle grün?
6. Session läuft — Login gilt bis Browser geschlossen wird

**Datenschutz-Pflicht beim Login:**
- NIEMALS Passwort-Felder anklicken oder auslesen
- NIEMALS Screenshots während des Login-Vorgangs
- NIEMALS E-Mail/Username aus dem DOM lesen
- NUR prüfen: Ist Toggle grün? Ist Generate-Button aktiv?

---

### ⛔ GESPERRTE TOOLS — NIEMALS für Bild-/Video-Generierung nutzen

- `generate_image` (MCP/Higgsfield)
- `Higgsfield:generate_image` (MCP)
- `Higgsfield:generate_video` (MCP)
- Alle MCP-Tools die Bilder oder Videos generieren

**WENN DU VERSEHENTLICH ein generate_image MCP-Tool nutzen willst:**
→ SOFORT STOPPEN
→ Sarah sagen: „ICH WOLLTE GERADE MCP NUTZEN — WARNUNG"
→ Auf Sarahs Erlaubnis warten

**Erlaubte Higgsfield-MCP-Tools (kein Credit-Verbrauch):**
- `balance` (Balance-Check)
- `job_status` (Job-Status prüfen)
- `show_generations` / `show_medias` (History browsen)

---

### ✅ EINZIGER ERLAUBTER WEG: Playwright + Higgsfield-Browser-UI

Sarah ist in Higgsfield eingeloggt. Playwright steuert IHREN echten Browser.
Mit grünem "Unbegrenzt"-Toggle ist die Generierung kostenlos — aber NUR in der Browser-UI.

**Standard-Workflow pro Bild (PFLICHT, keine Abkürzungen):**
1. Playwright navigiert zu `https://higgsfield.ai/ai/image`
2. Toggle-Check: Ist "Unbegrenzt" **GRÜN**? → Wenn nein: STOP, Sarah fragen
3. Modell wählen: **Nano Banana 2** (Pflicht — nicht Pro, nicht Flash, nicht andere)
4. Aspect Ratio + Prompt eingeben
5. **Balance VOR Generate notieren** (Beweis-Check)
6. Generate klicken (via Playwright-Klick)
7. Auf Fertigstellung warten (Polling via job_status oder UI)
8. **Balance NACH Generate prüfen:**
   - Gleich geblieben → ✓ kostenlos, weitermachen
   - Auch nur 1 Credit weniger → **SOFORT STOP**, Sarah sofort informieren
9. Bild downloaden → Pipeline → in `img/` ablegen

**Parallelität:** Max. 8 Bilder pro Batch → danach immer Balance-Check.

---

### 🔒 DATENSCHUTZ — Erlaubte und verbotene Seiten im Higgsfield-Browser

**Erlaubte Seiten:**
- `https://higgsfield.ai/ai/image` (Bild-Generierung)
- `https://higgsfield.ai/ai/video` (Video — nur auf Sarahs explizite Anfrage)

**VERBOTENE Seiten — niemals aufrufen:**
- `/me/settings` (Account-Einstellungen)
- `/me/billing` (Zahlungsdaten)
- `/me/profile` (Profildaten)
- `/me/subscription` (außer Sarah fragt explizit)
- `/assets` (private Asset-Galerie)

**Daten die niemals ausgelesen/gespeichert/geteilt werden dürfen:**
- E-Mail-Adresse
- Username
- Zahlungsdaten (auch nicht die letzten 4 Stellen)
- Inhalte anderer Browser-Tabs

**Auslesen erlaubt:** Credit-Balance, Job-Status, Toggle-Status (grün/rot).

---

### NICHT akzeptable Begründungen für MCP-Generierung:
- "war nur 1,5 Credits" → NEIN
- "Playwright ist komplizierter" → NEIN, trotzdem Pflicht
- "Job ist fehlgeschlagen, schnell nochmal" → NEIN, erst Toggle + Playwright prüfen

**Polling / Download / Pipeline** = kein Credit-Verbrauch → darf jederzeit ohne Fragen laufen.

---

## 🪟 PRODUKT-BILDER PIPELINE (Sarah-Regel 30.04.2026 — PFLICHT)

**JEDES neu integrierte Master-Produktbild MUSS durch diese Pipeline:**

```bash
python3 scripts/process-master-image.py <input.jpeg> img/<name>.png
```

**Garantiert:**
- Alle Master-Bilder sind **exakt gleich groß** (Canvas 1024×1280, 4:5 portrait)
- Inhalt füllt immer **92% der Canvas-Höhe** (Auto-Crop + aktive Skalierung)
- Reinweißer Hintergrund (#FFFFFF), keine Schatten, keine Ränder
- Im Konfigurator wirken alle 4 Produkte (Fenster/Balkontür/Haustür/HST) **identisch in Größe und Position** beim Wechsel

**Niemals abweichen** — wenn ein Bild nicht durch die Pipeline läuft, wirkt es im Konfigurator unproportional zu den anderen → Sarah merkt das sofort.

**Hintergrund:** Imagen 4 / Google Flow generieren mit unterschiedlichem White-Space (manche Bilder querformat 1376×768, Produkt nur 38% der Bildbreite). Ohne Pipeline wirken Bilder visuell unterschiedlich groß. Pipeline normalisiert das zentral.

**Master-Backups:** Original-JPEG IMMER vor Pipeline-Run in `img/masters/sarah/v3_<name>_master_<timestamp>.jpeg` archivieren.

## 🎯 INNEN/AUSSEN-KONSISTENZ (Sarah-Regel 01.05.2026 — PFLICHT)

**Innen- und Außenansicht MÜSSEN immer exakt gleich groß wirken.**

- Gleiches Produkt, gleiche Flügelzahl → identische Canvas-Höhe, identische visuelle Gewichtung
- Beim Umschalten Innen↔Außen darf sich das Bild NICHT verschieben, vergrößern oder verkleinern
- Beide Bilder durch dieselbe Pipeline → gleiche Canvas (1024×1280), gleiche Inhaltshöhe
- Nach jedem Einbau: **Design-Logik prüfen** — sieht der Toggle-Wechsel fließend und professionell aus?
- Wenn Innen 92% Höhe hat, muss Außen auch 92% haben — KEIN visueller Sprung

**Beim Einbauen neuer Bilder immer prüfen:**
1. Pipeline-Output von Innen und Außen vergleichen (% Inhaltshöhe muss ähnlich sein)
2. CSS-Container hat feste Höhe/Aspect-Ratio → kein Layout-Shift
3. Beide Bilder mit `object-fit: contain` auf gleichem Container → gleiche Position

## 🚨 Browser-Arbeit (Claude in Chrome)
BEVOR Claude den Browser über "Claude in Chrome" bedient:
**PFLICHT: `Read BROWSER-REGELN.md`** — enthält Goldene Regel, erlaubte/verbotene
Aktionen, Prompt-Injection-Schutz, Domain-Ampel. Sarah-vereinbart 22.04.2026.

## 🧠 KRITISCH HINTERFRAGEN — KEIN JA-SAGER (Sarah-Regel 02.05.2026)

**Sarahs Regel:** Claude darf nicht alles bejahen. Auch wenn Sarah eine Idee hat oder einen Wunsch äußert, muss Claude **kritisch prüfen** und ehrlich pushen wenn:

- Die Idee technisch fragwürdig ist (z.B. „alles auf einer Seite ohne Scrollen bei 13 Schritten" = unmöglich)
- Die Idee teurer/aufwendiger ist als der Nutzen (z.B. „komplett umbauen" wenn Tweaks reichen würden)
- Der Wunsch widersprüchlich ist (z.B. „minimalistisch" + „muss alles zeigen")
- Bessere Alternativen existieren die Sarah nicht im Kopf hat
- Der Vorschlag Anti-Patterns enthält (Dark Patterns, UX-Klischees, Compliance-Risiken)
- Die Annahme nicht stimmt (z.B. „meinfenster24 macht XY" wenn sie was anderes machen)

**Was Claude tun muss:**

1. **Pushback freundlich aber klar** — „Ich bin nicht überzeugt dass das die beste Lösung ist, weil X. Alternative wäre Y."
2. **Konkrete Argumente** statt vage Skepsis — Zahlen, Beispiele, Belege.
3. **2–3 Alternativen** anbieten wenn Claude was zurückweist, nicht nur „nein".
4. **Trade-offs transparent** machen — was kostet was, was gewinnt was.
5. **Sarah am Ende entscheiden lassen** — kritisch ≠ bevormundend. Wenn Sarah trotz Pushback bei ihrer Wahl bleibt, OK.

**Was Claude NICHT tun darf:**

- ❌ Alle Wünsche pauschal bejahen („super Idee, machen wir!")
- ❌ Sich hinter „der User entscheidet" verstecken um keine Position zu beziehen
- ❌ Nur höflich sein und versteckt unsicher
- ❌ Aufwand-Schätzungen unterschlagen weil's unangenehm wird
- ❌ Bei offensichtlichen Anti-Patterns mitspielen
- ❌ Unsicherheit in der eigenen Empfehlung verstecken („das könnte vielleicht…")

**Konkrete Beispiele wo Claude pushen muss:**

| Sarah sagt | Claude richtige Reaktion |
|------------|--------------------------|
| „Lass uns alles umbauen" | „Was genau passt nicht? Vielleicht reichen Tweaks. Komplett-Umbau = X Tage Risiko, Tweaks = Y Stunden, hier Trade-off…" |
| „Mach's wie [Konkurrent]" | „Sicher dass deren Ansatz für dein Sortiment passt? Sie haben A, du B. Hier wo du anders denken solltest…" |
| „Spawn 10 Agenten" | „Overkill für diese Frage. 2 reichen, weil…" |
| „Soll ich Tool X einbauen?" | „Was willst du damit lösen? Vielleicht löst Y das billiger/einfacher." |
| „Alles in einer Sektion" | „Bei 87 Modellen visuell überfordernd. 2–3 Gruppen besser, weil…" |

**Vorkommnis-Log:**

- **02.05.2026:** Sarah hat einen Council mit 5 Spezialisten für Konfigurator-Layout-Frage gewünscht. Claude hat zugesagt ohne zu prüfen ob die Größe der Frage entspricht. Sarah hat selbst gepusht: „kritisch hinterfragen, nicht alles bejahen." Diese Regel direkt danach festgelegt.

**Wenn Claude zustimmt obwohl die Idee fragwürdig ist:** das ist Bequemlichkeit, nicht Hilfe. Sarah will einen Sparringspartner, keinen Echo-Chamber.

---

## 💰 KOSTENPFLICHT-WARNUNG (Sarah-Regel 02.05.2026 — HART, KEIN AUTOPILOT)

**Sarahs Regel:** Claude darf NICHTS vorschlagen, einbauen, einrichten, anmelden, oder integrieren, was Geld kostet, ohne Sarah VORHER explizit zu fragen.

**Das gilt für jede dieser Kategorien — auch wenn sie wie Quick Wins / Standard-Empfehlungen wirken:**

- Trust-/Bewertungs-Siegel (Trusted Shops, eKomi, Provenexpert, Trustpilot Pro)
- Tracking & Analytics-Tools (Hotjar, Mixpanel, Amplitude bezahlte Stufen, Plausible, Fathom)
- Marketing-Tools (Mailchimp ab gewisser Größe, Brevo bezahlt, ActiveCampaign, ConvertKit)
- E-Commerce-Plugins die nach Trial Geld kosten (Stripe Tax, Klaviyo, etc.)
- Hosting-Upgrades, CDN-Pakete (Cloudflare Pro/Business, Bunny.net Premium)
- Domain-Käufe, SSL-Zertifikate (außer Let's Encrypt das gratis ist)
- KI-Tool-Abos (Higgsfield Premium, Midjourney, ChatGPT Plus für Sarah, Adobe Express Premium)
- Stock-Foto/Video-Lizenzen, Schriftarten-Lizenzen
- API-Quotas die in Bezahl-Tier fallen (OpenAI, Stripe-Premium-Features)
- SaaS-Abos jeder Art (selbst „nur 9 €/Monat")
- Werbe-Anzeigen (Google Ads, Meta Ads, TikTok Ads)
- Bezahlte Plugins/Themes (z.B. Premium-WordPress-Themes, Webflow-Templates)
- Berater, Agenturen, Freelancer-Honorare

**Was Claude tun muss:**

1. **Bevor** Claude etwas vorschlägt das Geld kostet → Kosten EXPLIZIT als allererstes nennen („kostet ca. X €/Monat" oder „ab Y € einmalig").
2. Klar schreiben: „Das ist NICHT kostenlos."
3. Wenn möglich: kostenlose Alternative gleich mit nennen.
4. Sarah explizit fragen ob sie weitermachen will, BEVOR Claude irgendwas einrichtet/registriert/integriert.

**Was Claude NICHT tun darf:**

- ❌ Einen Account auf einer Bezahl-Plattform für Sarah anlegen.
- ❌ Eine Bezahl-Plattform in Code einbauen (z.B. Trusted-Shops-Snippet ins HTML), auch nicht „in Vorbereitung".
- ❌ Trial-Anmeldungen starten die nach 30 Tagen automatisch in Bezahl-Stufe rutschen.
- ❌ Bezahl-Tools als „Quick Win" oder „Standard-Empfehlung" auflisten ohne Kosten-Hinweis.
- ❌ Sarah ein zahlungspflichtiges Tool empfehlen ohne mindestens einen kostenlosen Vergleichswert.

**Kostenlose Alternativen sind IMMER zu bevorzugen, wenn sie 70%+ vom Effekt liefern:**

| Bezahl-Tool | Kostenlose Alternative |
|-------------|------------------------|
| Trusted Shops Käuferschutz | Google Customer Reviews + Stripe Käuferschutz (ab Stripe selbst, kostenfrei) |
| Hotjar | Microsoft Clarity (komplett kostenlos, ähnliche Features) |
| Mailchimp | Brevo Free (300 Mails/Tag), MailerLite Free (1000 Kontakte) |
| Cloudflare Pro | Cloudflare Free Plan (reicht für 99% der Fälle) |
| Mixpanel/Amplitude | Plausible Cloud Free / PostHog Self-Host |
| Adobe Stock | Pexels, Unsplash (CC0) |
| Premium WP-Themes | Astra Free, Hello Theme + Elementor Free |

**Vorkommnis-Log:**

- **02.05.2026:** Claude hat im UX-Audit „Trusted Shops" als Trust-Signal in der Quick-Win-Liste aufgeführt ohne zu erwähnen dass es ~80–250 €/Monat kostet. Sarah hat zurecht reklamiert. Diese Regel direkt danach festgelegt.

**Wenn Sarah doch was Bezahltes möchte:** Sie sagt es explizit („ich will Trusted Shops"). Dann erst aktiv werden, davor nicht.

---

## 🛡️ REGELKONFORMITÄT — IMMER MITPRÜFEN (Sarah-Wunsch 28.04.2026)

**Sarahs Regel:** Bei JEDER Aktion (Code, Text, Bild, Video, Tool-Setup, Deployment, Marketing, Preise, Datenfluss) **automatisch mitprüfen** ob es regelkonform ist. Nicht nachträglich, sondern WÄHREND der Arbeit.

**Pflicht-Prüfpunkte (in dieser Reihenfolge bei JEDER Änderung):**

1. **DSGVO** — Werden personenbezogene Daten verarbeitet? Wo gespeichert? Auftragsverarbeitung-Vertrag (AVV) nötig? Cookie-Banner? Datenschutzerklärung aktuell?
2. **Markenrecht (Drutex + Konkurrenz)** — Drutex-Logo nur als autorisierter Händler. KEINE Konkurrenz-Marken (Schüco/Veka/Salamander/Aluplast) abbilden oder negativ erwähnen ohne Quelle.
3. **Werberecht** — Preise IMMER mit MwSt. Streichpreise nur wenn UVP nachweisbar. Garantie-Aussagen mit konkreter Dauer. „Bestes / Schönstes" nur mit Beleg.
4. **Preisangabenverordnung (PAngV)** — Endpreise inkl. MwSt + Versand-Kosten-Hinweis. Grundpreise wo nötig. Lieferkosten transparent.
5. **Impressum + Widerrufsbelehrung** — Bei JEDER Seite verlinkt. Bei E-Commerce: 14-Tage-Widerruf, Widerrufsformular, Mustertext.
6. **KI-Bilder-Kennzeichnung** — KI-generierte Bilder die Produkte zeigen müssen ggf. als „symbolische Darstellung" oder „mit KI erstellt" gekennzeichnet sein, sobald sie nicht das echte Produkt zeigen (UWG, ab 2026 EU AI Act Art. 50).
7. **Cookie-/Tracking-Compliance (TTDSG + ePrivacy)** — Consent-Banner für nicht-essenzielle Cookies. Localstorage für Warenkorb = ok ohne Consent.
8. **Hosting + Drittanbieter** — Server in EU? US-Anbieter mit EU-DPF (Stripe, Vercel, Netlify ja; Supabase ja)? AVV unterschrieben?
9. **Drutex-Specs** — Werte (Uw, Maße, Beschläge) nur veröffentlichen wenn aus offizieller Drutex-Quelle. Erfundene Specs = Wettbewerbsverstoß.

**Wenn Claude unsicher ist:**
→ STOPPEN, Sarah explizit fragen: „Achtung, hier ist mir [X] unklar — könnte regelkonform problematisch sein, soll ich trotzdem weitermachen oder erst klären?"

**Festhalten in `COMPLIANCE.md`** wenn ein neuer rechtlicher Punkt auftaucht der noch nicht hier dokumentiert ist.

**Kein Auto-Pilot bei rechtlichen Themen.** Auch wenn Sarah „mach einfach" sagt — bei Compliance-Fragen IMMER nachfragen.

## Konfigurator-Scope (Stand 21.04.2026 — HART)

Konfigurator-Logik folgt meinfenster24.de, **minus**:
- Kein Aluminium (Sarah ist Kunststoff-Händler)
- Kein Holz, kein Holz-Alu, kein Vollholz
- Nur **Drutex** als Hersteller (keine Aluplast / Salamander / Schüco / VEKA Auswahl)

Sonst gleiche Schritte und Fachtiefe wie meinfenster24. Fehlendes zu
meinfenster24 = Lücke (nicht Feature). Details in `KONFIGURATOR-AUDIT.md`.

## Was schon existiert
- index.html – Startseite
- konfigurator.html – 6-Schritte-Konfigurator mit Live-Preis
- produkte.html – Produktkatalog
- dashboard.html – Admin Dashboard
- img/ – Produktbilder
- Farben: Primär #225eaa, Dunkelblau #1e3a8a
- Fonts: Plus Jakarta Sans + Manrope

## Deine Aufgabe
IMMER zuerst die bestehenden Dateien lesen bevor du etwas änderst.
Optimiere was da ist – baue NICHT neu.
Orientiere dich an meinfenster24.de aber mache es schöner.

## Design Regeln
- Kein KI-Schrott, kein Standard-Template
- High-End, modern, vertrauenswürdig
- Tailwind CSS, HTML, JavaScript
- Bestehende Farben und Fonts behalten

## Skills die du nutzen sollst
- frontend-design: Bei jedem Design
- **deinefenster-images / -logic / -research**: Projekt-lokal in `.claude/skills/` —
  v2-Versionen die den realen flachen `/img/` Ordner und `data/bilder-katalog.json`
  als Wahrheitsquelle verwenden. Die User-Level-Versionen dieser Skills sind
  veraltet (beschreiben Ordnerstruktur die es nicht gibt) — IMMER die
  projekt-lokalen bevorzugen.
- seo: Bei allen Texten und Meta-Tags
- firecrawl: Konkurrenz analysieren
- ux-design: Navigation und Benutzerführung
- n8n-workflows: Konfigurator und Email Automation
- marketing: Verkaufstexte

## 🎯 SKILL-MATRIX — Welcher Skill für welche Aufgabe? (Sarah-Wunsch 24.04.2026)

> **Pflicht:** Bei jeder neuen Aufgabe **zuerst** in dieser Tabelle nachschauen,
> ob ein Skill passt. Wenn ja → Skill **immer** vor der eigentlichen Arbeit aufrufen.
> Wenn unsicher: zwei Skills nacheinander durchgehen ist OK.

### Design & UX

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Schau dir das Design an", „Critique", „Was hältst du von dieser Seite?" | `design:design-critique` |
| „Ist das barrierefrei?", „Kontrast prüfen", „WCAG", „Touch-Targets", „Tastatur-Bedienung" | `design:accessibility-review` |
| „Inkonsistenzen finden", „Designsystem-Audit", „Komponente dokumentieren" | `design:design-system` |
| „Buttons benennen", „Error-Message", „Empty-State", „CTA-Text", „Microcopy" | `design:ux-copy` |
| „User-Research planen", „Interview-Guide", „Survey", „Usability-Test" | `design:user-research` |
| „Research auswerten", „Themen aus Interviews", „NPS auswerten" | `design:research-synthesis` |
| „Dev-Spec", „Übergabe an Entwickler", „Tokens dokumentieren" | `design:design-handoff` |

### Marketing & Content

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Blog-Post", „Social-Post", „Landingpage", „Newsletter", „Pressemitteilung" | `marketing:content-creation` oder `marketing:draft-content` |
| „SEO-Audit", „Keyword-Research", „Meta-Tags prüfen", „Google-Ranking" | `marketing:seo-audit` |
| „Kampagnen-Plan", „Launch-Brief", „Marketing-Strategie für X" | `marketing:campaign-plan` |
| „Email-Sequenz", „Drip-Kampagne", „Onboarding-Mails", „Win-Back" | `marketing:email-sequence` |
| „Konkurrenz analysieren", „Battlecard", „Positionierungs-Lücke" | `marketing:competitive-brief` |
| „Performance-Report", „Wochenreport", „Was hat funktioniert" | `marketing:performance-report` |
| „Text gegen Markenführung prüfen", „On-brand?", „Style-Guide-Check" | `marketing:brand-review` |

### Brand-Voice (langfristige Markenarbeit)

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Brand-Guidelines erstellen aus Material X" | `brand-voice:guideline-generation` |
| „Wo sind unsere Brand-Dokumente?", „Brand-Audit" | `brand-voice:discover-brand` |
| „Sales-Content nach Brand-Voice", „Email/Pitch in unserem Ton" | `brand-voice:brand-voice-enforcement` |

### DeineFenster-spezifisch (Projekt-lokal)

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Bild im Konfigurator austauschen", „Produktfoto einbauen", „/img/ Ordner" | `anthropic-skills:deinefenster-images` |
| „Welches Bild passt zu Kunststoff?", „Wenn Holz dann …", „Logik-Frage Konfigurator" | `anthropic-skills:deinefenster-logic` |
| „Drutex-Spec recherchieren", „Was heißt Uw 0,71?", „Material-Vergleich" | `anthropic-skills:deinefenster-research` |

### Dokumente / Output-Formate

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| .docx erstellen/lesen/editieren | `anthropic-skills:docx` |
| .pdf erstellen, mergen, OCR, Formulare | `anthropic-skills:pdf` |
| .xlsx, .csv, Tabellen, Budget, Charts | `anthropic-skills:xlsx` |
| .pptx, Pitch-Deck, Slides | `anthropic-skills:pptx` |

### Council / Cross-Domain Entscheidungen (installiert 28.04.2026)

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Council einberufen", „Design-Debate", „Council-Review", „Get the team together", „Run a design review", „Debate this design" | `design-council` (projekt-lokal in `.claude/skills/design-council/`) |
| Cross-Domain-Entscheidungen die ≥2 Fachgebiete kreuzen UND ein Decision-Log brauchen (z.B. „Soll der Konfigurator zu Three.js wechseln?", „Pre-Launch-Audit der Produktseiten", „Architektur-Pivot Backend") | `design-council` |

**Was es macht:** Beruft 4–11 Sub-Agenten als Experten-Panel (Principal-Engineer, Security, UX, Accessibility, Product-Manager, etc.) parallel ein. Jeder hat eigenen Context — also echte Meinungsverschiedenheit, kein Selbstgespräch. Ich (Claude) bin CEO: stelle Plan-Karte vor, route Diskussion, schreibe ein einseitiges Decision-Log nach `~/.claude/councils/`. Sarah genehmigt Roster vor Spawn (`go`/`swap`/`drop`/`abort`), genehmigt Log vor Save (`save`/`amend`/`discard`).

**NICHT verwenden für:** Bug-Fixes, einfache Library-Wahl, einzelne Spezialisten-Frage, reine Recherche.

### Meta

| Aufgabe / Trigger | Skill |
|-------------------|-------|
| „Skill bauen / anpassen / testen" | `anthropic-skills:skill-creator` |
| „Wiederkehrende Aufgabe automatisch laufen lassen" | `anthropic-skills:schedule` |

### Reihenfolge-Regel
1. Pflicht-Lese-Liste vor jeder Session: `STAND.md` → `CLAUDE.md` (diese Datei) →
   ggf. `BROWSER-REGELN.md` / `DRUTEX-REGELN.md`.
2. **Vor** der ersten Code/Design-Aktion in der Session: passenden Skill aus dieser
   Matrix laden. Wenn die Aufgabe mehrere Bereiche betrifft (z.B. „neue Produktseite
   bauen + SEO + Brand-Check") → mehrere Skills nacheinander.
3. Wenn kein Skill passt: ehrlich sagen, dann normal weiterarbeiten.

## Wie Sarah arbeitet (Kontext aus Cowork-Aufbau, 21.04.2026)

- Sarah ist **blanke Anfängerin** im Code — erkläre alles in Alltagssprache,
  keine Fachchinesisch-Wände. Kleine Schritte, mit Option zur Überprüfung
  nach jedem Schritt.
- **Entscheidungsstil:** Vorschlag + Begründung + Kurz-Ok. Bei kritischen
  Sachen (Logik, Recht, Preise) immer fragen. Bei kreativen Sachen (Bilder,
  Text) darf selbst entschieden werden, solange Richtlinien/Skills befolgt werden.
- **Sarah's Vision:** DeineFenster.de live bringen → eigene Agentur aufbauen →
  3D-Konfiguratoren für 30.000€ + Websites für 10.000€ verkaufen.
- **Größte offene Baustellen (Stand 21.04.2026):** 3D-Konfigurator (aktuell
  nur SVG-Vorschau, Three.js muss rein), realistische Bilder-Einheitlichkeit,
  SEO + Video-Content, Compliance-Wächter (DSGVO/Impressum/Drutex-Normen).

### Protokoll für Drutex-/meinfenster24-Fragen (Sarah-vereinbart 21.04.2026)

1. **Claude fragt** wenn eine Drutex-spezifische Zahl/Regel unklar ist
   ("bei Drutex gilt max 1400 mm Breite für Dreh-Kipp — stimmt das bei dir?").
2. **Sarah antwortet:** "Passt" ODER "Ist anders, nämlich X" ODER "Weiß ich grad
   nicht, schick ich dir nach".
3. **Bei "schick ich nach":** Sarah sendet **Copy-Paste-Text** (einfachst) oder
   **Screenshot** oder **speichert HTML-Seite in den Projektordner**. Claude
   extrahiert daraus die Werte und baut ein.
4. **Claudes Netzwerk-Sandbox blockiert deinefenster.de / meinfenster24.de /
   drutex.de** — Claude kann nicht selbst fetchen. Deshalb obiger Workflow.
5. Für Industrie-Standard-Annahmen (die Sarah nicht aus dem Kopf weiß) darf
   Claude vorschlagen, muss sie aber in `DRUTEX-REGELN.md` ⚠️-flaggen bis
   Sarah bestätigt.

## Wichtige Kontextdateien (immer zuerst lesen)

- **`STAND.md`** — Aktueller Projektstand, was fertig ist, was offen ist. **LIES DAS IMMER ZUERST.**
- **`PROJEKTE.md`** — Sarahs 3 parallele Projekte (DeineFenster, TikTok-Shop, Agentur-Vision)
- `BROWSER-REGELN.md` — Wenn Browser benutzt wird
- `data/bilder-katalog.json` — Wahrheitsquelle für alle 91 Projekt-Bilder
- `BILDER-INVENTAR.md` — menschenlesbare Übersicht des Katalogs
- `PROJEKT.md` — Preismodell, SEO-Keywords, technische Setup-Todos
- `KONFIGURATOR-RESEARCH.md` — Konkurrenz-Analyse meinfenster24.de
- `DESIGN-SKILLS.md` — Animation- und Design-Standards
- `DRUTEX-REGELN.md` — Drutex-Zahlen/Normen (z.B. max 1400 mm etc.)

## Sarah-Arbeitsweise (22.04.2026 präzisiert)

- **Sarah ist Anfängerin** — erklären in Alltagssprache, kein Fachchinesisch
- **Schnell arbeiten** — sie sagt oft „das dauert mir zu lange". Edits direkt, nicht endlos Pläne
- **Fragen bei Unsicherheit** — bei Design-Feedback: 2-3 konkrete Optionen mit a/b/c zum Abhaken
- **Screenshots ernst nehmen** — wenn Sarah Screenshot schickt, genau analysieren
- **Kein Chat-Löschen-Angst** — alles Wichtige MUSS in `STAND.md` + `CLAUDE.md` leben, nicht im Chat-Verlauf
- **Parallele Projekte respektieren** — siehe `PROJEKTE.md`

## Drutex-Video-URLs (für Produktseiten, per `<video>` direkt verlinken)

Sarah ist Drutex-Händlerin — darf Marketing-Material nutzen. URLs getestet 22.04.2026:

| System | Cover-Video (Hero-Hintergrund) | Produkt-Video (aufgehende Fenster) |
|--------|-------------------------------|------------------------------------|
| IGLO 5 Classic | `drutex.de/media/_upload/produkty/iglo5-classic/iglo-5-classic-cover.mp4` | `.../iglo5-classic/video/iglo_5_classic.mp4` |
| IGLO Energy | `drutex.de/media/_upload/produkty/IGLO_ENERGY/okna-iglo-energy-cover.mp4` | `.../IGLO_ENERGY/video/iglo_energy_anim_winchester.mp4` |
| IGLO 5 (Basic) | `drutex.de/media/_upload/sections/movie-block/1920x940-firma-animacja_02.mp4` (Firmen-Animation) | — |

Für Haustür / Balkontür / Schiebetür-Systeme: URLs in Browser-Session 22.04.2026 noch zu holen.

## Technische Fakten (Stand 22.04.2026)

- **Sandbox-Netzwerk blockiert Drutex-CDN** bei curl-Download — Direktverlinkung funktioniert aber im Browser beim Besucher
- **KI-Bild-Generierung**: Pollinations.ai funktioniert ohne Login/Account, URL-basiert:
  `https://image.pollinations.ai/prompt/ENCODED-PROMPT?width=1200&height=900&model=flux&nologo=true&seed=NUMBER`
- **Prompt-Vorlage Drutex-Katalog-Stil**: „product catalog photography of [PRODUCT], minimal clean beige plastered wall, architectural product rendering, studio lighting, Drutex manufacturer catalog style, frontal view, neutral background, professional commercial photography"

## Produktseiten-Template (Struktur etabliert 22.04.2026)

Alle Produktseiten (IGLO 5 Classic, IGLO Energy, + 7 folgende) haben:
1. **Hero mit Drutex-Cover-Video** (video als absolute Hintergrund, dunkler Gradient-Overlay 0.35)
2. **Hero-Content zentriert**: Badge + H1 + Untertitel + CTA-Button (KEINE Tech-Specs auf Video — die sind unten in Tabelle)
3. **Beschreibung links + Produkt-Video rechts** (sticky) im Brand-Design-Frame
4. **Tech-Tabelle** mit allen Werten (Drutex-Originaltext)
5. **Vergleich-Sektion** (2 Karten, aktueller Produktsystem vs. Alternative) im Brand-Design
6. **CTA-Sektion** (dunkler Hintergrund, „nach Maß")
7. **Footer** identisch zur index.html

**Tech-Spec-Boxen mit blauen Ecken-Klammern** NICHT mehr im Hero verwendet (Sarah-Entscheidung 22.04.2026). Die CSS-Klasse `.corner-brackets` bleibt für evtl. spätere Nutzung.

## Korrekte Drutex-Schiebetür-Systeme (Sarah-Logik-Fix 24.04.2026)

> **Korrektur der vorherigen Fassung vom 22.04.2026:** Die frühere Annahme, dass
> „IGLO 5 PSK" oder „IGLO Energy PSK" nicht existieren, war FALSCH (kam durch
> Falsch-Erraten einer Drutex-URL im Sandbox-Kontext). Drutex hat diese Produkte
> sehr wohl, mit eigenen Produktseiten und Videos.

**Drutex-Schiebetür-Systeme — echte Produkte mit eigenen Seiten auf DeineFenster:**

- **IGLO 5 Classic PSK** (Parallel-Schiebe-Kipp, Uw 0,81 W/(m²K), MACO SKB-S Beschlag,
  Flügel bis 160 kg, 5-Kammer-70mm-Profil). Datei: `produkte/hebe-schiebetueren/iglo-5-classic-psk.html`
- **IGLO Energy PSK** (Parallel-Schiebe-Kipp, Uw 0,65 W/(m²K) Passivhaus-Niveau,
  MACO SKB-S, 7-Kammer-82mm-Profil). Datei: `produkte/hebe-schiebetueren/iglo-energy-psk.html`
- **IGLO Slide** (schlanke Schiebetür, Ug 1,1, Siegenia-Beschlag, bis ~4000 mm breit,
  Drutex-Hinweis: „nicht für Passivhaus-Standards"). Datei: `produkte/hebe-schiebetueren/iglo-slide.html`
- **IGLO-HS** (Hebe-Schiebe, Uw 0,71, G-U Beschlag, Flügel bis 400 kg,
  max. ~6500×2700 mm, Null-Schwelle DIN 18040). Datei: `produkte/hebe-schiebetueren/iglo-hs.html`

Drutex führt laut eigener Website zusätzlich: IGLO 5 PSK, IGLO ENERGY CLASSIC PSK,
IGLO LIGHT PSK. Sarah-Entscheidung 24.04.: Wir beschränken uns auf die 4 oben
genannten Systeme, bis nachweisbarer Kundenbedarf für weitere besteht.

## Arbeits-Branch

- `cowork-agentenaufbau` — aktueller Entwicklungs-Branch für den Umbau
  des Agenten-Systems. Alle Änderungen hier rein, bis Sarah auf main mergen will.

## DESIGN-REGELN FÜR DIESES PROJEKT

**PFLICHT:** Bei ALLEN Design-Aufgaben zuerst DESIGN-SKILLS.md lesen und konsultieren.

### Animationen
- GSAP ist die einzige Animations-Library – kein CSS-only, kein andere Libs
- ScrollTrigger für alle Scroll-basierten Animationen
- `prefers-reduced-motion` IMMER respektieren (Code-Muster in DESIGN-SKILLS.md)
- Nur `transform` und `opacity` animieren – nie Layout-Properties

### Verboten (KI-Schrott vermeiden)
- KEIN Inter-Font oder Roboto als Headline-Font
- KEINE Purple/Pink/Rainbow-Gradients
- KEIN gleichmäßiges 50/50-Grid ohne Gewichtung
- KEINE Animationen ohne Funktion (rein dekorativ)
- KEIN Standard-Template-Look

### Premium-Ästhetik für DeineFenster.de
- Primärfarbe #225eaa und Dunkelblau #1e3a8a konsequent einsetzen
- Gold-Akzent #c9a84c nur sparsam (Badges, Premium-Highlights)
- Plus Jakarta Sans für Headlines (700–800), Manrope für Body (400)
- Asymmetrische Layouts bevorzugen (60/40, versetzte Grids)
- 8px-Spacing-System einhalten (Tailwind-Klassen passen dazu)

### Fonts & Farben
- Bestehende Fonts (Plus Jakarta Sans + Manrope) NICHT ändern
- Bestehende Primärfarben NICHT ändern
- Nur Premium-Ergänzungen aus DESIGN-SKILLS.md Abschnitt 2 hinzufügen

### Accessibility
- WCAG 2.1 AA Kontrast-Mindestanforderungen einhalten
- `:focus-visible` Styles nie entfernen
- Semantisches HTML (h1 einmal, button vs. a korrekt)
