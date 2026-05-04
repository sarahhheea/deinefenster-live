# STAND – DeineFenster.de

**Stand:** 04.05.2026 — Außenfarben-Bilder alle korrigiert + in Konfigurator
**Branch:** `cowork-agentenaufbau`

> **Diese Datei ist Wahrheitsquelle für „wo stehen wir gerade".**
> Immer zuerst lesen bei Session-Start. Bei Änderungen updaten.

---

## 🆕 SESSION 04.05.2026 — Außenfarben komplett korrigiert

### Was wurde gemacht

**5 fehlerhafte Außenansichts-Bilder neu generiert + in Konfigurator eingebaut:**

| Datei | Problem vorher | Fix |
|---|---|---|
| `fenster_1fl_aussen_teak.png` | Drutex-Wasserzeichen unten rechts | Neu generiert ✅ |
| `fenster_1fl_aussen_siena-ross.png` | Komische Form / Ausschnitte | Neu generiert ✅ |
| `fenster_1fl_aussen_sheffield.png` | Zu schmal (71%) + Text im Bild | Neu generiert + Text-Crop ✅ |
| `fenster_1fl_aussen_basaltgr-sa.png` | Rahmen zu dick | Neu generiert ✅ |
| `fenster_1fl_aussen_quarzgr-sa.png` | Rahmen zu dick | Neu generiert ✅ |

Alle Pipeline-Outputs: 97–99% Breite, 95–97% Höhe ✅

### Commits dieser Session
- `7562290` — 5 Außenbilder korrigiert
- `35c5405` — Sheffield Text-Watermark entfernt

---

## 🚨 PFLICHT-REGELN HIGGSFIELD (neu/bestätigt 04.05.2026)

### Prompt-Pflicht: NIEMALS Text/Watermarks

**IMMER in jeden Higgsfield-Prompt einbauen:**
```
NO text, NO labels, NO watermarks, NO captions, NO product names written on image.
```
→ Ohne diese Zeile schreibt das Modell manchmal den Prompt-Text als Label ins Bild.

### Higgsfield Playwright-Workflow (einziger erlaubter Weg)

**Login:** Nur einmalig pro Session. Claude öffnet `https://higgsfield.ai/ai/image`, Sarah loggt sich selbst ein, sagt "eingeloggt".

**Unlimited-Toggle prüfen:** Vor JEDER Generierung → `Nano Banana Pro & 2, Kling 3.0 Unlimited` muss sichtbar sein. Timer (z.B. "1h 52m") muss > 0 sein.

**Modell:** Nano Banana 2 (URL `?model=nano-banana-2` oder `nano-banana-flash`) — NICHT Pro wenn Pro Credits kostet.

**Prompt löschen (PFLICHT-Methode):**
```js
// 1. Atomic clear via browser_run_code_unsafe:
await el.click({ force: true });
await page.keyboard.press('Meta+a');
await page.keyboard.press('Backspace');
// 2. Verify length === 0, dann browser_type mit slowly=true
```

**Balance-Check:** VOR und NACH jeder Batch. Bei auch nur 1 Credit Unterschied → SOFORT STOP + Sarah informieren.

**Silent-Failure erkennen:** `document.querySelectorAll('[class*="animate-spin"]').length` — wenn 0 nach Submit → Seite neu laden + erneut submitten.

### Außen-Bilder Pflicht-Prompts

**Basis-Template für alle Außenfarben:**
```
Perfectly flat 2D frontal orthographic view — zero perspective, zero angle, camera dead center.
Single-leaf PVC casement window EXTERIOR outside view.
SLIM THIN FRAME: frame profile maximum 10% of total window width on each side.
Large glass pane fills center 70% of image.
Simple clean flat frame profile — no decorative inner molding, no stepped inner frame, no carved panel details.
Frame and sash: [FARBE-BESCHREIBUNG mit Hex-Code].
No handle. No hinges. No hardware of any kind visible.
Glass: pure white opaque, no reflection.
Dark black rubber gasket seal around glass.
White #FFFFFF background.
NO text, NO labels, NO watermarks, NO captions, NO product names written on image.
Drutex manufacturer catalog photo.
```

**Farben + Hex-Codes:**
| Schlüssel | Farbe | Hex | Prompt-Zusatz |
|---|---|---|---|
| `teak` | Teak | #8c6838 | warm golden-brown wood grain foil, amber-brown natural teak |
| `siena-ross` | Siena Rosso | #8c3c2c | deep wine-red rosewood foil, rich dark reddish-brown |
| `sheffield` | Sheffield Oak Light | #c8b090 | honey-tan beige oak, clearly visible warm tan-beige frame |
| `basaltgr-sa` | Basaltgrau SA RAL 7012 | #4f5458 | dark blue-grey, dark slate charcoal-grey, fine sand grain |
| `quarzgr-sa` | Quarzgrau SA RAL 7039 | #6c6f66 | medium warm grey, fine sand grain texture |
| `alux-db` | Alux DB DB 703 | #4a3520 | very dark espresso brown-bronze, deep chocolate bronze |

---

## ✅ STATUS AUSSENFARBEN (Stand 04.05.2026)

Konfigurator-Außenansicht (Pfad: `img/farben/fenster_1fl_aussen_<key>.png`):

| Farb-Key | Status |
|---|---|
| teak | ✅ OK |
| siena-ross | ✅ OK |
| sheffield | ✅ OK |
| basaltgr-sa | ✅ OK |
| quarzgr-sa | ✅ OK |
| alux-db | ✅ OK (Außenbild noch ausstehend — Innen bereits korrigiert) |

**Noch fehlende Außenbilder** (nächste Session):
- alle anderen Farben aus `P.fa` in konfigurator.html (winchester, anthrazitgr-sa, mooreiche, etc.)

---

## 📋 WIE MAN EINE NEUE SESSION STARTET

**Für Claude Code (neue Session):**
1. Projekt öffnen: `/Users/buissnesaccount/deinefenster Website`
2. Claude liest automatisch: `CLAUDE.md` → enthält alle Pflicht-Regeln
3. Claude soll ZUERST lesen: `STAND.md` (diese Datei) — aktueller Stand
4. Dann optional: `DRUTEX-REGELN.md`, `BROWSER-REGELN.md`

**Memory-System:** Unter `~/.claude/projects/-Users-buissnesaccount-deinefenster-Website/memory/` sind wichtige Regeln gespeichert (Higgsfield-Workflow, Griff-Richtung, Innen/Außen-Größe). Claude lädt diese automatisch.

**Kein Kontext-Verlust** bei neuer Session solange:
- `STAND.md` aktuell ist
- `CLAUDE.md` aktuell ist
- Memory-Files in `~/.claude/.../memory/` vorhanden

---

---

## 🆕 SESSION 30.04.2026 (zehnte Session, abend) — wichtigste Updates

### 1. Master-Bilder-Pipeline etabliert (`scripts/process-master-image.py`)

PFLICHT-Pipeline für jedes neu generierte Imagen-Bild:
- Auto-Crop weiße Ränder (Connected Components, scipy.ndimage)
- Aktive Skalierung auf gemeinsame Inhaltshöhe (TARGET_INHALT_H = 1240 px = 97% Canvas)
- Padding auf gemeinsame Ziel-Canvas 1024×1280 (4:5 Portrait)
- Reinweißer Hintergrund (#FFFFFF), kein Schatten

Regel in CLAUDE.md fest verdrahtet — alle künftigen Master-Bilder MÜSSEN durch diese Pipeline.

Konstanten:
- TARGET_W = 1024, TARGET_H = 1280
- TARGET_INHALT_H = 1240 (97% Höhe)
- TARGET_INHALT_W_MAX = 1020

### 2. Alle 4 Master-Hauptprodukt-Bilder integriert

| Datei | Drutex-Modell | Status |
|---|---|---|
| `fenster_standard.png` | IGLO 5 1-Flügel Innen | ✅ Pipeline |
| `fenster_aussen.png` | IGLO 5 1-Flügel Außen | ✅ Pipeline |
| `balkontuer_standard.png` | IGLO 5 Balkontür Innen vollverglast | ✅ Pipeline |
| `haustuer_standard.png` | DX01 Haustür Innen | ✅ Pipeline |
| `hst_standard.png` | IGLO HS Hebeschiebetür Innen | ✅ Pipeline |
| `fenster_2fluegel.png` | IGLO 5 2-Flügel Innen | ✅ Pipeline (querformat — wirkt klein) |
| `fenster_2fluegel_aussen.png` | IGLO 5 2-Flügel Außen | ✅ Pipeline (querformat) |

Alle Master-JPEG-Backups in `img/masters/sarah/v3_*_master_*.jpeg`.

### 3. Konfigurator-UI-Polish

`konfigurator.html`:
- Schritt 1 Produktauswahl: KEIN Border-Kasten mehr, KEIN Drop-Shadow — Karten als freistehende Studio-Fotos
- Bild-Container aspect-ratio 4:5, min-height 280-380px je Viewport
- Sidebar rechts: alles sticky in einem Flex-Layout, alles auf einem Schlag sichtbar (Vorschau + Auswahl-Liste + Preis + CTA)
- Vorschau max-height 240px, Auswahl-Liste flex-1 mit interner Scroll
- Total-Badge zeigt Stückzahl-Pille (×N) wenn >1 + Einzelpreis "/Stück"
- "Ihre Auswahl"-Header weggelassen für Platz
- View-Toggle (Innen/Außen) als iOS-Style Segmented Control mit grauer Hintergrund-Pille
- Trust-Badges aus Sidebar entfernt (Platzgewinn)
- Hero kompakt: Breadcrumb + Untertitel weg, H1 18-26px, Padding pt-16/pb-1
- Main py-4 statt py-8
- `#chips` → strukturierte Label-Wert-Liste (Stückzahl ganz oben, dann Produkt/Maße/Profil/Verglasung/Farbe-außen/Farbe-innen/Dichtung/etc.)

### 4. Shop-Einstellen-Refactor (`shop-einstellen.html` + `js/shop-einstellen.js`)

Eigenschaften-Liste komplett umgebaut:
- Aus flacher Liste mit 17 Tags → **8 logische Gruppen** mit Header + Material-Symbol-Icon
- Gruppen: Zustand · Farbe · Aufteilung/Glas · Öffnungsart · Schwelle/Türen · Rollladen · Sicherheit/Komfort · Maße/Energie
- 2-Spalten-Grid INNERHALB jeder Gruppe (`sm:grid-cols-2`)
- Visuelle Trenner (Border-Bottom unter Header)

**Neue Tags hinzugefügt:**
- `einzelstueck`, `vermessen` (Zustand)
- `farbe-weiss`, `farbe-anthrazit`, `farbe-grau`, `farbe-farbig` (Farb-Filter-Tags zusätzlich zum Single-Select-Dropdown)
- `unterlicht`, `ober-unter-licht`, `kaempfer` (Aufteilung/Glas)
- `sprossen-innen` (zusätzlich zu `sprossen-aufgesetzt`)
- `rollladen-gurtwickler`, `rollladen-motor` (statt nur `rollladen-elektrisch`)
- `beidseitig-abschliessbar` (Sicherheit)

Schritt 1 (Zustand + Kategorie) in 2 nummerierte Karten mit Schritt-Badge ① ②.

**KEINE Supabase-Schema-Änderung nötig** — alle Tags landen im bestehenden `eigenschaften` jsonb-Array.

### 5. Live-Deploy Workflow geklärt

Sarah hat:
- GitHub-Repo: `github.com/sarahhheea/template-deinefenster`
- Branch: `cowork-agentenaufbau`
- Netlify-Site: https://iridescent-chebakia-1796b0.netlify.app

**ABER:** Netlify ist **NICHT mit GitHub verbunden** — wurde via "Netlify Drop" (Drag & Drop) deployed. Daher KEIN Auto-Deploy bei Push.

**Aktueller Workflow für Sarah's Eltern (Live-Update):**
1. Code committen + pushen via GitHub Desktop oder Terminal
2. Komplettes `deinefenster Website` Folder per Drag & Drop in Netlify-Dashboard ziehen
3. Netlify deployt 1-3 Min, dann live

**TODO (zukünftig):** GitHub-Integration in Netlify einrichten → dann reicht `git push` und Auto-Deploy.

### 6. Master-Prompt-Block für Imagen-Konsistenz (`MASTER-PROMPT-BLOCK.md`)

Nach Bilder-Audit gefunden: **Glas-Tönung inkonsistent** zwischen Innen- und Außen-Bildern!
- Innen-Bilder (1-Flügel, 2-Flügel, Balkontür) haben leicht **bläuliches/grünliches Glas**
- Außen-Bilder haben **klares Glas**
- → beim Innen↔Außen-Wechsel ändert sich nicht nur Griff/Bänder, sondern auch Glas-Look

Lösung: zentraler **Master-Prompt-Block** mit 3 Pflicht-Bausteinen:
- BLOCK 1 (Glas-Look): "absolutely NO bluish tint, NO greenish tint, NO cyan haze..."
- BLOCK 2 (Hintergrund + Licht): "PURE WHITE RGB(255,255,255), 5500K..."
- BLOCK 3 (Konsistenz-Anker): "match the previous Drutex reference images"

→ Alle künftigen Bilder MÜSSEN diese 3 Blöcke einbauen.

### 7. Offen (TODO nächste Sitzung)

- [ ] **3 Innen-Bilder regenerieren** mit Anti-Blau-Glas-Block: 1-Flügel, 2-Flügel, Balkontür
- [ ] **2-Flügel + 3-Flügel Bilder neu** mit Hochformat-Komposition (aktuell querformat → wirken klein)
- [ ] **3-Flügel Innen + Außen** generieren (Prompt steht bereit)
- [ ] **Außenbilder für Balkontür, Haustür, HST** noch offen (3 Bilder)
- [ ] **Netlify ↔ GitHub-Integration** einrichten für Auto-Deploy
- [ ] **Bilder-Katalog `data/bilder-katalog.json`** updaten mit neuen Master-Bildern

### 8. Geänderte Files Session 30.04.

- `scripts/process-master-image.py` (NEU)
- `MASTER-PROMPT-BLOCK.md` (NEU)
- `CLAUDE-CODE-BRIEFING.md` (NEU — Onboarding für Claude Code falls Sarah dort weitermacht)
- `BILDER-MASTER-PLAN.md` (existiert)
- `KONFIGURATOR-IMAGE-MASTER-SCHEMA.md` (existiert)
- `js/image-schema-builder.js` (existiert)
- `konfigurator.html` (massive Sidebar/Header/Card CSS-Refactor)
- `shop-einstellen.html` (Schritt 1 Karten-Layout)
- `js/shop-einstellen.js` (EIGENSCHAFTEN_GRUPPEN, rendereEigenschaften umgebaut)
- `CLAUDE.md` (Pipeline-Regel ganz oben dokumentiert)
- 7 neue Master-Bilder + 7 Backup-JPEG in `img/masters/sarah/`

### 9. Higgsfield-Integration — Plan für nächste Session

**Sarah hat:** Higgsfield **ULTRA-Plan** (Update 01.05.2026)

**Burst-Window bis 07.05.2026 (UNLIMITED):**
- Nano Banana Pro 2K — Unlimited (= Google Imagen 4, 2K-Auflösung)
- Nano Banana 2 — Unlimited

**Dauerhaft Unlimited (365 Tage):**
- FLUX.2 Pro, Seedream 4.5, GPT-Bild, Kling O1 Bild, Nano Banana (Basis), Seedream V5 Lite

**Verfügbar:** 3.010 Credits · 8 parallele Jobs

**Zugriffsweg (entschieden 30.04.):** **Higgsfield MCP** (offizieller MCP-Server `https://mcp.higgsfield.ai/mcp`) — Claude Code hat MCP-Tools direkt verfügbar.

**Workflow nach Session-Start:**
1. Sarah hat Higgsfield-Tab in Chrome offen, eingeloggt im Ultra-Plan
2. Claude-in-Chrome (oder Playwright MCP) wird in Cowork-Settings aktiviert
3. Claude bedient die Higgsfield-Web-UI:
   - Modell wählen: **Nano Banana Pro** (= Imagen 4) für Master-Konsistenz
   - Prompt aus `BILDER-MASTER-PLAN.md` + `MASTER-PROMPT-BLOCK.md` zusammenbauen
   - Format setzen (1024×1280 für Hochformat, 1280×960 für Kipp-Querformat)
   - Generate → warten → runterladen
4. Pipeline `scripts/process-master-image.py` normalisiert
5. Bild im `img/`-Ordner, in PROD_IMGS_VIEW eintragen

**Credit-Monitoring:** ~3-5 Credits pro Nano-Banana-Bild → 1000 Credits = 200-300 Bilder pro Monat. Reicht für die wichtigsten Master + Variations-Anfang.

### 10. Wo wir morgen weitermachen (Phase A — Bilder mit Anti-Blau-Glas)

**Sofort nach Higgsfield-Connect:**
1. **`fenster_standard.png`** regenerieren (1-Flügel Innen — hat aktuell blauen Tint)
2. **`fenster_2fluegel.png`** regenerieren (2-Flügel Innen — blauer Tint + querformat)
3. **`fenster_2fluegel_aussen.png`** regenerieren (querformat → hochformat)
4. **`balkontuer_standard.png`** regenerieren (blauer Tint)

**Pflicht in jedem Prompt:** alle 3 Pflicht-Bausteine aus `MASTER-PROMPT-BLOCK.md`:
- BLOCK 1: Glas-Look (kein Blau)
- BLOCK 2: Hintergrund + Licht
- BLOCK 3: Konsistenz-Anker

**Phase B nach Phase A:** fehlende Außen-Bilder
- `balkontuer_aussen.png`, `haustuer_aussen.png`, `hst_aussen.png`

**Phase C:** 3-Flügel Innen + Außen

**Phase D:** Variations-Stadium pro Flügelzahl (Anschlag-Spiegel, Kipp, Fest, +Oberlicht, +Unterlicht, +Ober/Unter)

**Phase E (groß!):** 44 Farben × Variations-Set (~600 Bilder, brauchen Sarahs grünes Licht da > 1000 Credits)

### 11. Eltern-Status (Shop-Einstellen)

✅ Eltern sehen die neuen Eigenschaften live auf https://iridescent-chebakia-1796b0.netlify.app/shop-einstellen
- Eigenschaften-Gruppen sichtbar
- Kämpfer / Sprossen-innen / Rollladen-Varianten / Beidseitig-abschließbar wählbar
- Schritt 1 in 2 nummerierten Karten (Zustand + Kategorie)

**Deploy-Methode:** GitHub Desktop → Push (Branch cowork-agentenaufbau) → Sarah lädt Folder via Drag & Drop auf Netlify-Dashboard. **Auto-Deploy noch NICHT eingerichtet.**

**TODO langfristig:** Netlify ↔ GitHub-Integration in Site-Settings einrichten → Production Branch auf `main` ODER `cowork-agentenaufbau` setzen → ab dann reicht `git push`.

---

## 🆕 SESSION 30.04.2026 — IMAGE-SCHEMA MASTER etabliert

### Master-Schema für 800+ konsistente Konfigurator-Bilder (Imagen 4 / Google Flow)

**Neue Files:**
1. **`KONFIGURATOR-IMAGE-MASTER-SCHEMA.md`** — Technische Spec für alle Bilder-Generierungen
   - Globaler Stil-Anker (1 Satz, in JEDEM Prompt)
   - Auflösungen nach Produkttyp (Dreh-Kipp: 1200×1400, Schiebe: 1400×900, Haustür: 1000×1600, HST: 1600×1000)
   - Exakte Beleuchtungs-Definition (2 Softboxen 45° symmetrisch, 5500K, NULL Schatten)
   - Produkt-Positions-Definition (70–75% Canvas, zentral)
   - Negativ-Liste mit 13 NO-Anweisungen (NO shadow, NO floor, NO border, etc.)
   - Test-Prompt (validierbar)
   - 8 häufige Fallen + Lösungen für Imagen 4 / Google Flow
   - Varianten-Template für parametrische Matrix (System × Ansicht × Farbe × Glas × Griff × Anschlag)
   - Checkliste für jeden Prompt

2. **`js/image-schema-builder.js`** — JavaScript-Helper zum automatischen Prompt-Bauen
   - `ImageSchemaBuilder.buildPrompt(config)` → kompletten Prompt konstruieren
   - `buildPollinationsUrl(config)` → direkt Pollinations-API-URL generieren (Imagen 4)
   - `generateFilename(config)` → eindeutige Dateinamen für Caching
   - `getResolution(typ)` → Auflösung pro Produkttyp
   - Vordef. Maps: Systeme, Farben, Glas, Griffe, Anschläge
   - Beispiele inline dokumentiert

**Warum diese Separation?**
- `.md` ist human-readable Spec + Training für Sarah (technische Grundlagen verstehen)
- `.js` ist automation → Batch-Generation starten (später per n8n-Workflow)

### Keine Grausen, keine KI-Schrott-Prompts mehr

Das Schema erzwingt:
- ✅ Exakt identische Beleuchtung über alle 800+ Bilder
- ✅ Reproduzierbare Positionen (70–75% Canvas, zentral)
- ✅ Konsistente Größe (wenn User zwischen Farben wechselt, ändert sich NICHTS außer das Produkt selbst)
- ✅ KEIN Schatten, KEIN Kontext, KEIN Rahmen (Negativ-Liste blockiert das)
- ✅ Drutex-Katalog-Stil (kein Standard-Template, kein Purple-Gradient-Müll)

### Nächste Schritte für Sarah

1. **Test-Generierung:** Einen Prompt aus `KONFIGURATOR-IMAGE-MASTER-SCHEMA.md` Sektion F nehmen, zu Pollinations/Imagen oder Higgsfield schicken, Bild prüfen
   - Ist der Hintergrund absolut weiß? ✓
   - Ist das Fenster 70–75% der Canvas? ✓
   - Gibt es Schatten? ✗ (darf nicht sein)
   - Sind Scharniere von außen sichtbar? ✗ (wenn Außenansicht)
   
2. **Bei OK:** Top 5 Farben × häufigste Konfigs (z.B. weiß, anthrazit, grau × 1-Flügel Innen/Außen × 2-Flügel Innen) = ca. 10–15 Testbilder generieren

3. **Bei Validierung:** Per `js/image-schema-builder.js` alle 800+ Prompts bauen + Batch an Imagen schicken (via n8n-Workflow oder manuell)

4. **Speichern unter eindeutigem Namen:** `iglo5classic_drehkipp_int_white_neutral_maco_1f_r.png` (Schema-Funktion `generateFilename()` macht das automatisch)

### Wo speichern?

- **Master-Schema-Doku:** `/Users/buissnesaccount/deinefenster Website/KONFIGURATOR-IMAGE-MASTER-SCHEMA.md`
- **JavaScript-Helper:** `/Users/buissnesaccount/deinefenster Website/js/image-schema-builder.js`
- **Generierte Bilder später:** `img/konfigurator/SYSTEM/ANSICHT/` (hierarchisch, damit's nicht 800 Dateien im Root sind)

---

## 🆕 SESSION 29.04.2026 — wichtigste Updates

### Konfigurator: 25 echte Imagen-Master für Kunststofffenster integriert

Alle 12 Flügel-Konfigurationen × Innen/Außen sind jetzt echte Studio-Fotos (Drutex-Stil, Imagen 4 / Google Flow). Live-Vorschau wechselt sauber je nach Auswahl.

**Naming-Konvention `img/fenster_*.png`:**

| Konfig | Innen | Außen |
|---|---|---|
| 1-Flügel (Griff rechts = Anschlag links / DIN-L) | `fenster_standard.png` | `fenster_aussen.png` |
| **1-Flügel (Griff links = Anschlag rechts / DIN-R)** | **`fenster_standard_links.png`** *(NEU 29.04.)* | (gleich, kein Griff von außen) |
| 2-Flügel | `fenster_2fluegel.png` | `fenster_2fluegel_aussen.png` |
| 3-Flügel (Mitte fest) | `fenster_3fluegel.png` | `fenster_3fluegel_aussen.png` |
| 1-Flügel + Oberlicht | `fenster_oberlicht.png` | `fenster_oberlicht_aussen.png` |
| 2-Flügel + Oberlicht | `fenster_2fluegel_oberlicht.png` | `fenster_2fluegel_oberlicht_aussen.png` |
| 3-Flügel + Oberlicht | `fenster_3fluegel_oberlicht.png` | `fenster_3fluegel_oberlicht_aussen.png` |
| 1-Flügel + Unterlicht | `fenster_unterlicht.png` | `fenster_unterlicht_aussen.png` |
| 2-Flügel + Unterlicht | `fenster_2fluegel_unterlicht.png` | `fenster_2fluegel_unterlicht_aussen.png` |
| 3-Flügel + Unterlicht | `fenster_3fluegel_unterlicht.png` | `fenster_3fluegel_unterlicht_aussen.png` |
| 1-Flügel + Ober-/Unterlicht | `fenster_ober_unter.png` | `fenster_ober_unter_aussen.png` |
| 2-Flügel + Ober-/Unterlicht | `fenster_2fluegel_ober_unter.png` | `fenster_2fluegel_ober_unter_aussen.png` |
| 3-Flügel + Ober-/Unterlicht | `fenster_3fluegel_ober_unter.png` | `fenster_3fluegel_ober_unter_aussen.png` |

Backups aller Original-Imagen-Outputs (vor Auto-Crop) liegen in `img/masters/sarah/*_master.jpeg`.

### Konfigurator-Code: `PROD_IMGS_VIEW` Matrix + Anschlag-Logik

In `konfigurator.html` (Zeilen ~3940–4010 + ~4509–4561):

- **`PROD_IMGS_VIEW`-Matrix** mit Keys `'1-fluegel'`, `'2-fluegel'`, …, `'1-oberlicht'`, …, `'1-ober-unter'` etc. pro `kunststoff`/`balkontuer`/`haustuere`/`hst` × `innen`/`aussen`. Lookup via `getMasterImage(prod, ansicht, fluegelKey)`.
- **`vorschauAktualisieren()` umgebaut**: nutzt `flKey` (voller String) statt nur die Zahl, lädt das richtige Master-Bild je nach Auswahl, fällt zurück auf 1-Flügel-Master wenn keine spezifische Variante existiert.
- **Anschlag-Logik (Sarah-Konvention 29.04.):**
  - `dreh-l` / `dk-l` (Scharnier links) → Griff RECHTS = `fenster_standard.png` (Default = Linkes Fenster nach DIN)
  - `dreh-r` / `dk-r` (Scharnier rechts) → Griff LINKS = `fenster_standard_links.png` (Rechtes Fenster nach DIN)
  - `kipp` / `fest` → noch keine eigenen Master, fallen auf Standard zurück (kommen als nächstes)
  - **Außen ist identisch** für links/rechts (kein Griff sichtbar) → kein Wechsel nötig.

### Bugs gefixt diese Session

1. **Map-Keys-Bug:** PROD_IMGS_VIEW hatte ursprünglich Number-Keys (`1`, `2`, …), aber `S.fluegel` ist ein String (`'1-fluegel'`, `'2-fluegel'`). Resultat: Konfigurator zeigte für ALLE Flügel-Konfigs nur 1-Flügel-Bild. Fix: Map-Keys auf Strings umgestellt.
2. **Innen/Außen-Switch tat nichts:** Vorher gab es nur ein `PROD_IMGS`-Lookup ohne Ansicht-Differenzierung. Fix: Matrix mit `innen`/`aussen` getrennten Branches eingeführt.
3. **Live-Vorschau abgeschnitten:** `transform: scale()` hatte Cap bei 1.5 (höher als Container) → Bild ragte raus + wurde durch `overflow:hidden` abgeschnitten. Fix: Cap bei 1.0, Formel angepasst.

### Pre-rendered Farb-Varianten (Status: bekanntermaßen kaputt)

`img/varianten/<prod>_<farbe>.png` — 88 Bilder via `scripts/recolor-varianten.py`. **Bug:** Glas wird vom Algorithmus als Rahmen miterkannt → Anthrazit etc. färbt das ganze Innere ein, nicht nur den Rahmen. Sarah hat entschieden: statt diesen Algorithmus zu fixen, **echte Imagen-Bilder pro Farbe × Innen/Außen** generieren (kommt nächste Phase).

### 🔖 Sarah-Notizen für nächste Bilder-Runde (29.04.)

**Anschlag-Sparmaßnahme:** Bei den nächsten Außenansicht-Generierungen sollen die **Scharniere/Bänder NICHT sichtbar** sein. Dann reicht **EIN Außen-Bild für Anschlag-rechts UND Anschlag-links** — wir sparen pro Konfiguration 1 Bild.

**Reihenfolge im Konfigurator beim Anschlag-Schritt (Sarah-Wunsch):**
- Standard-Anzeige: „Rechtes Fenster" (Anschlag rechts, Griff links) zuerst
- Erst wenn User aktiv „Anschlag links" wählt → wechselt zu „Linkes Fenster" (Griff rechts)
- Optional kleine graue Pfeil-Indikatoren bei Hover über die Anschlag-Kachel

### Council-Result vom 29.04. (Live-Vorschau-Roadmap)

5 unabhängige Spezialisten (UX, Frontend, Conversion, Accessibility, Product) haben unabhängig priorisiert. Konsens:

| Visualisierung | UX | Frontend | Conversion | A11y | Product | **Score** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Öffnungsart (Dreh/Kipp/DK) | #1 | #1 | #1 | MUST | #2 | **5/5** |
| Verglasung (2/3-fach Querschnitt) | #2 | – | #3 | MUST | #3 | **4/5** |
| Rolladen-Aktion (animiert) | – | #2 | – | NICE | #1 | **3/5** |
| Profil-Energy-Badge | – | #3 (Quick) | – | – | – | (Quick Win) |
| Einbruchschutz RC1-3 | – | – | #2 | SHOULD | – | (später) |

**Deal-Breaker (A11y-Spezialist):** Vorschau-Border #e5e5e5 auf weißem Bild = Kontrast-Fail. Border auf #225eaa (Brand-Primär) ändern.

**Roadmap (priorisiert):**
1. **Phase 1 (Quick Wins, ~1 Std.):** Öffnungsart-Pfeile sichtbarer + Energy-Badge + A11y-Border-Fix + ARIA-Live-Region
2. **Phase 2 (1-2 Tage):** Verglasung-Querschnitt-SVG + Rolladen halb-offen-Animation
3. **Phase 3 (parallel, Sarah):** Top 5 Farben × wichtige Konfigs als echte Imagen-Bilder
4. **Phase 4 (später):** Glasdekor, Griff-Varianten, RC-Symbole, 4-Flügel

### Offene Bilder (was Sarah als nächstes generieren wollte)

- ⏳ **1-Flügel Kipp** (Innenansicht, Prompt steht im Chat)
- ⏳ **1-Flügel Fest** (kein Griff, keine Bänder)
- ⏳ **Anthrazit-Farbvarianten** (Top 5 Farben × häufigste Konfigs)
- ⏳ **Neutrale Außenansichten ohne Scharniere** (1 Bild für rechts+links)

### Geänderte Files Session 29.04.

- `konfigurator.html` — PROD_IMGS_VIEW-Matrix, getMasterImage, vorschauAktualisieren, Anschlag-Logik, scale-Cap
- 25 neue Bilder in `img/fenster_*.png`
- 25 Backup-Bilder in `img/masters/sarah/*_master.jpeg`

---

## 🆕 SESSION 28.04.2026 — wichtigste Updates

### Was komplett neu ist

#### 1. Design-Council Skill installiert (projekt-lokal)

**Ort:** `.claude/skills/design-council/` (mit SKILL.md + 16 Experten-Rollen + Protokoll-Templates)
**Quelle:** `sjsyrek/design-council` (GitHub) — geklont via `git clone --depth 1`

**Was er macht:** Beruft 4-11 Sub-Agenten als Experten-Panel parallel ein (Principal-Engineer, UX, Security, Accessibility, FinOps, Domain-Expert, Legal-Compliance etc.). Jeder hat eigenen Context — echte Meinungsverschiedenheit, kein Echo-Chamber. Claude ist CEO: stellt Plan-Karte vor, sammelt Verdikts, schreibt einseitiges Decision-Log.

**Trigger:** „Council einberufen", „Design-Debate", „Run a design review", „Get the team together", oder Cross-Domain-Entscheidungen die ≥2 Fachgebiete kreuzen UND Decision-Log brauchen.

**NICHT verwenden für:** Bug-Fixes, einfache Library-Wahl, einzelne Spezialisten-Frage.

In `CLAUDE.md` ist eine neue Sektion „Council / Cross-Domain Entscheidungen" in der Skill-Matrix dokumentiert.

#### 2. 🛡️ COMPLIANCE-REGEL permanent in CLAUDE.md (Sarah-Wunsch 28.04.)

**Sarah's neue Hausregel:** Bei JEDER Aktion (Code, Text, Bild, Video, Tool, Marketing, Preise, Datenfluss) **automatisch mitprüfen** ob es regelkonform ist. Nicht nachträglich.

**Pflicht-Prüfpunkte:** DSGVO • Markenrecht (Drutex + keine Konkurrenz-Marken) • Werberecht • PAngV • Impressum/Widerruf • **KI-Bilder-Kennzeichnung** (EU AI Act 2026 Art. 50!) • Cookie-Compliance • Hosting + Drittanbieter-AVV • Drutex-Specs nur aus offizieller Quelle.

**Bei Unklarheit:** STOPPEN, Sarah fragen — kein Auto-Pilot bei Recht.

Kompletter Text steht in `CLAUDE.md` direkt unter „Browser-Arbeit" als eigene Sektion.

#### 3. Shop: Bilder-Carousel im Detail-Modal

**Bug war:** Beim Inserieren konnten mehrere Fotos hochgeladen werden, aber im Shop wurde nur das ERSTE angezeigt. Mapping in `js/shop.js` Zeile 121 las nur `bilder[0]`.

**Fix:**
- `js/shop.js`: `bilder` als ganzes Array ergänzt (zusätzlich zu `bild` für Karten-Mini-Anzeige)
- Detail-Modal mit Carousel: Pfeile, Touch-Swipe (Mobile), Dot-Indikatoren, Zähler, Pfeiltasten (Tastatur)
- Lazy-Loading für nicht-erstes Bild
- Accessibility: aria-labels, role="tab", focus-visible, prefers-reduced-motion respektiert
- CSS-Block in `shop.html` direkt unter `.symbolbild-mini`

**Funktionen neu:** `setupCarousel(total)` in `js/shop.js`

#### 4. Shop-Einstellen: Größen-Klasse „Schmal" + Auto-Vorauswahl + Griffseite

**Geändert in `shop-einstellen.html`:**
- 5. Button **„Schmal"** zur Größen-Klasse hinzugefügt (Reihenfolge: keine / Klein / Schmal / Normal / Hoch / Groß)
- Hinweis-Text-Element `#groesseHinweis` für Mehrfach-Treffer
- Layout: `grid grid-cols-3 sm:grid-cols-6` (statt 4 Spalten)
- Drehkipp-Klammertext korrigiert (Sarah-Anweisung — alte Beschriftung war falsch):
  - „Dreh-Kipp Rechts (~~Anschlag links~~) → **(Griff links)**"
  - „Dreh-Kipp Links (~~Anschlag rechts~~) → **(Griff rechts)**"
  - Auch „Dreh Rechts (Griff links)", „Dreh Links (Griff rechts)"

**Geändert in `js/shop-einstellen.js`:**
- Neue Funktion `autoVorauswahlGroesse()` — triggert bei Maß-Änderungen + Kategorie-Wechsel
- Logik (Sarah-Regel 28.04.):
  - 1-Flügelig (`fenster-1fluegel`): Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 1000 → schmal
  - 2-Flügelig (`fenster-2fluegel`): Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 1600 → schmal
  - 3-Flügelig (`fenster-3fluegel`): Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 2000 → schmal
  - Balkontür (`balkontuer-1fluegel`, `balkontuer-2fluegel`): Höhe < 2100 → klein, ≥ 2100 → groß | Breite ≤ 1000 → schmal
  - **Bei Mehrfach-Treffer** (z.B. 800×1200 = klein UND schmal): keine Vorauswahl, gelber Hinweis-Text *„Bei diesen Maßen treffen mehrere Klassen zu (Klein und Schmal). Bitte wähl selbst aus."*
  - Festelement, balkontuer-rollo, Haustüren, HST → keine Auto-Voraus (Sarah-Anweisung „lassen wir erstmal")
- Helper `groesseLabelDE()` für Hinweis-Text-Rendering
- Listener auf `formBreite`/`formHoehe` (input + change events)
- `setGroesseUI()` erweitert um Hinweis-Rendering
- Manuelle Wahl per Button-Click → Hinweis verschwindet

**Geändert in `js/shop.js`:**
- `groesseLabel()` um `schmal: 'Schmal'` erweitert
- Neue Funktion `oeffnungsartLabel()` — formatiert Drehkipp/Dreh mit Griff-Klammer für Shop-Anzeige
- Detail-Modal: Öffnungsart als zusätzlicher Grid-Eintrag (col-span-2) angezeigt mit Griff-Hinweis
- Counter erweitert: `groesse-schmal` wird gezählt

**Geändert in `shop.html`:**
- Filter-Sidebar: „Schmal"-Filter zwischen Klein und Normal eingefügt
- Counter-Badge `data-count="groesse-schmal"`

#### 5. ⚠️ DB-Migration AUSSTEHEND (Sarah muss in Supabase ausführen!)

**Datei:** `database/add-schmal-groesse.sql`

**Problem:** Bestehender CHECK-Constraint erlaubt nur `klein/normal/hoch/gross`. Wenn Sarah ein Produkt als „Schmal" speichern will, gibt's einen DB-Fehler.

**Migration-SQL:**
```sql
begin;

alter table public.produkte
  drop constraint if exists produkte_groesse_klasse_check;

alter table public.produkte
  add constraint produkte_groesse_klasse_check
  check (groesse_klasse in ('klein','schmal','normal','hoch','gross') or groesse_klasse is null);

commit;
```

**Ausführen:** Supabase Dashboard → SQL Editor → New Query → Code einfügen → Run.

**Status:** Sarah hat das in dieser Session vermutlich gemacht (in der Session sagte ich „sag Migration durch wenn's geklappt hat"). **Nächste Session: bestätigen lassen** ob die Migration tatsächlich gelaufen ist (durch Test-Insert eines „Schmal"-Produkts).

#### 6. Higgsfield-Setup VORBEREITET, aber NICHT abgeschlossen

**Was Sarah will:** Per MCP-Verbindung mit Higgsfield AI Bilder + Videos generieren (für Konfigurator + TikTok-Werbung). „Tell Claude → Claude does it" Workflow.

**Was wir herausgefunden haben:**
1. Higgsfield hat **zwei getrennte Welten:**
   - `higgsfield.ai/pricing` (Consumer): Plus = $39/Mo Annual ODER **$49/Mo Monthly** = Web-UI zum selbst klicken
   - `cloud.higgsfield.ai` (Developer): API-Zugang den der MCP-Server BRAUCHT — vermutlich separate Anmeldung
2. Consumer-Plus enthält wahrscheinlich KEINEN API-Zugang (nirgends sauber dokumentiert).
3. **Offizielles SDK** existiert: `github.com/higgsfield-ai/higgsfield-client` (Auth via `HF_API_KEY` + `HF_API_SECRET`)
4. **MCP-Server existiert** und ist aktiv: `github.com/geopopos/higgsfield_ai_mcp` (Update Nov 2025)
5. NSFW-Content ist HART blockiert in Higgsfield's Filter (für OnlyFans-Use-Case ungeeignet → Council hat das ausführlich begründet)

**Council-Verdict zum Higgsfield-Plan (28.04.):**
- ✅ Plus ($49 Monthly) für DeineFenster + TikTok-Werbung
- ⛔ OnlyFans-Content geht NICHT (Higgsfield-ToS + OnlyFans-ToS + EU AI Act → Verdict: streichen)
- ⚠️ KI-Bilder die Produkte zeigen müssen ggf. als „symbolisch / mit KI erstellt" gekennzeichnet werden (EU AI Act 2026 Art. 50)

**Aktueller Plan (Sarah-Anweisung):**
1. Sarah registriert sich GRATIS auf **`cloud.higgsfield.ai`** (NICHT higgsfield.ai!) — Sandbox-Netzwerk konnte beide Domains nicht direkt fetchen, deshalb muss Sarah selber schauen welche Pläne dort angeboten werden
2. API-Key + Secret in Cloud-Dashboard generieren
3. An sich selbst per Apple Notes / Mail schicken
4. Sarah sagt mir „cloud-account fertig" → ich:
   - Klone `geopopos/higgsfield_ai_mcp` lokal
   - Konfiguriere mit `HF_API_KEY` + `HF_API_SECRET` aus `.env`-Datei (Sarah tippt Key selbst rein, ich seh ihn nie)
   - Registriere bei Claude
5. Test mit Konfigurator-Bild

**Falls Higgsfield-Cloud zu kompliziert/teuer ist:** Fallback auf **Replicate** (pay-per-use, $0.04/Bild, $10 Test-Guthaben reicht).

**Status:** Sarah HAT NOCH KEINEN Account abgeschlossen am Ende der Session. Nächste Session: Sarah hat Cloud-Account → ich installier MCP → Test-Bild.

### Geänderte/Neue Files in Session 28.04.

**Neu:**
- `.claude/skills/design-council/` (kompletter Skill mit Roles, Templates, Protokoll)
- `database/add-schmal-groesse.sql` (Migration für Schmal-Constraint)

**Geändert:**
- `CLAUDE.md` — Neue Compliance-Sektion + Council-Eintrag in Skill-Matrix
- `js/shop.js` — bilder-Array, Carousel-Funktion, oeffnungsartLabel, groesseLabel erweitert, Schmal-Counter, Detail-Modal-Öffnungsart-Anzeige
- `shop.html` — Carousel-CSS, Schmal-Filter in Sidebar
- `shop-einstellen.html` — Schmal-Button, Layout-Grid 6 Spalten, Drehkipp-Texte korrigiert, Hinweis-Text-Element
- `js/shop-einstellen.js` — autoVorauswahlGroesse-Funktion, groesseLabelDE, Listener auf Maße + Kategorie

### Nächste Session — Open-To-Dos

1. **Sarah bestätigt:** DB-Migration `add-schmal-groesse.sql` in Supabase ausgeführt? Test-Insert mit Schmal-Klasse.
2. **Higgsfield-Cloud-Account:** Sarah hat Free-Tier auf `cloud.higgsfield.ai` registriert + API-Key in Notes? Falls ja → MCP-Setup starten (Schritt: klonen, .env konfigurieren, bei Claude registrieren).
3. **Falls Higgsfield-Cloud nicht hat was Sarah will (z.B. zu teuer, kein Free-Tier):** Replicate-Alternative installieren stattdessen.
4. **Test-Bild generieren** für Konfigurator (1 Test-Fenster IGLO Energy mit einheitlichem Premium-Stil) → Sarah validiert Stil → bei OK rollen wir auf alle Konfigurator-Bilder aus.
5. **KI-Bilder-Kennzeichnung im Shop:** Aktuell wird „Symbolbild" auf JEDES Bild im Detail-Modal eingeblendet — auch wenn Sarah ECHTE Lager-Fotos hochlädt ist das falsch. Vorschlag offen: Symbolbild-Label nur bei Platzhalter-Bildern (`fenster_standard.png`) zeigen, nicht bei echten User-Uploads.

---

## 🆕 SHOP-MARATHON 27.04. ABENDS — vorherige Session

### Was komplett neu ist: vollwertiger Lager-Shop mit echtem Backend

**Live-URL (Test, nicht öffentlich):**
`https://iridescent-chebakia-1796b0.netlify.app/`

Diese URL ist privat (zufällig, nirgends verlinkt + `robots.txt` blockt alle Suchmaschinen). Vercel kommt später wenn Sarah live geht — dann wird `robots.txt` umgestellt.

### Backend: Supabase-Account angelegt + verbunden

- **Supabase-Konto-Email:** `businessautomation@yahoo.com`
- **Supabase Project URL:** `https://kgklvkainekbiphjdehy.supabase.co`
- **publishable key (frontend-safe):** `sb_publishable_M8ej2NK7N6ZJtImiA3n6cQ_pVD4brP-`
- Beide oben in `js/supabase-config.js` eingetragen
- **Datenbank-Passwort + service_role key:** kennt nur Sarah, sicher abgelegt
- **Auth-User für Sarah:** angelegt in Supabase → Authentication → Users (Email vermutlich `sarahchrist@aol.com`, Passwort hat Sarah selbst gesetzt — falls vergessen: User löschen und neu anlegen)
- **Storage-Bucket:** `produkt-bilder` (public, für Inserate-Fotos)
- **RLS aktiv:** Policies in `database/schema.sql` + `database/storage-policies.sql`
- **DB-Tabellen:**
  - `kategorien`: id, key, label, icon, reihenfolge, aktiv (mit 14 Initial-Kategorien)
  - `produkte`: alle Felder inkl. zustand, standnummer, sonderpreis_eur, groesse_klasse, export_modell, bilder (jsonb-Array von URLs)

### Hosting: Netlify (manuelles Drag-and-Drop)

- Sarah hat sich bei Netlify registriert mit Email-Login
- Deployment via `app.netlify.com` → Projekt → Deploys → Drag-and-Drop des kompletten DeineFenster-Ordners
- **Bei jeder Code-Änderung muss Sarah neu hochladen** (kein Git-Sync, kein Auto-Deploy)
- URL-Subdomain `iridescent-chebakia-1796b0` ist die Netlify-zufalls-Domain

### Neue Files (alle in `/Users/buissnesaccount/deinefenster Website/`)

**Shop-Frontend:**
- `shop.html` — Lager-Übersicht (Apple-Stil, clean Header, Filter-Sidebar, Karten-Grid, Warenkorb-Drawer, Detail-Modal, Login-Status-Bar oben)
- `js/shop.js` — Filter-/Such-/Warenkorb-Logik, Schema.org Product-Markup, Auth-Check, 3-Punkte-Menü mit Bearbeiten/Drucken/Archivieren/Löschen

**Inserieren (Login-geschützt):**
- `shop-einstellen.html` — Schritt 1 (Zustand neu/gebraucht + Kategorie) → Schritt 2 (Detail-Formular)
- `js/shop-einstellen.js` — Auth-Check, Foto-Upload via Kamera + Galerie (max. 20 Bilder), Save zu Supabase, Edit-Mode via `?edit=ID`
- Pflichtfelder: Kategorie, Titel, Maße, Preis, Standnummer
- Optional: Sonderpreis-Marker (Checkbox + Stern), Export-Marker, Größen-Klasse (klein/normal/hoch/groß — nur bei 1/2/3-Flügelig + Balkontür + Festelement)

**Schilder-Druck (Login-geschützt):**
- `shop-drucken.html` — Auswahl-Liste + Druck-Vorschau, **1 Schild pro A4** mit Standnummer riesig (96px), Bild groß, Kategorie als „1 Flügel/2 Flügel/…", Preis 90px
- Aufrufbar mit `?id=ID` für direkten Einzeldruck (vom Drucker-Icon im Shop)

**Login:**
- `shop-login.html` — Email + Passwort, Auth via Supabase, Redirect zu `?next=...`

**Datenbank-Skripte (Sarah hat alle ausgeführt am 27.04.):**
- `database/schema.sql` — Initial Schema + 14 Kategorien + RLS
- `database/storage-policies.sql` — Storage-Bucket Policies für authenticated upload/update/delete
- `database/seed-mock-produkte.sql` — 24 Demo-Produkte (kann später gelöscht werden)
- `database/add-zustand-feld.sql` — Erweiterungen: zustand, standnummer, sonderpreis_eur, groesse_klasse, export_modell

**SEO + AI-Crawler:**
- `manifest.webmanifest` — PWA für Home-Screen-App (Inserieren als App-Icon)
- `llms.txt` — Klartext für ChatGPT/Perplexity-Crawler über das Sortiment
- `robots.txt` — **TEST-Version: blockt ALLES**. Bei Live-Gang ändern auf `Allow: /` und `Disallow: /shop-einstellen.html /shop-drucken.html /shop-login.html`
- Schema.org Store-Markup statisch in `shop.html` + dynamisches Product-Markup via `js/shop.js`
- Open Graph + Twitter Cards in `shop.html`

**Geänderte bestehende Files:**
- `index.html`, `produkte.html`, `konfigurator.html`, `ueber-uns.html`, `kontakt.html`: Shop-Link in Desktop + Mobile-Nav (mit Gold „NEU"-Badge)
- `datenschutz.html`: Drei neue Sections §11 Hosting (Netlify), §12 Datenbank (Supabase, DPA, EU-DPF), §13 LocalStorage (Warenkorb, §25 TTDSG)
- `shop-einstellen.html` + `shop-login.html`: PWA-Meta-Tags (apple-touch-icon, mobile-web-app-capable)

### Features die jetzt live sind

- **Filter (komplett dynamisch):** Zustand (Neu/Gebraucht), Angebote (Sonderpreis/Export-Toggles), Größen-Klasse, Produkttyp, Maße mit Toleranz-Slider, Preis-Range, Verglasung, Sicherheit (RC), Farbe, Eigenschaften
- **Suche:** durchsucht Titel, Beschreibung, Kategorie, System, Farbe, Standnummer, Eigenschaften
- **Maß-Auto-Erkennung:** „1200×800" in Suche → setzt Filter automatisch + zeigt ähnliche Größen (Toleranz 15% default)
- **Warenkorb:** LocalStorage-basiert, Anfrage per `mailto:` an `info@baustoffchrist.de`
- **20 Bilder pro Inserat:** Kamera-Button + Galerie-Button (auf Mobile öffnet Kamera direkt), in Reihenfolge mit X zum Löschen
- **3-Punkte-Menü auf Karten** (nur eingeloggt): Bearbeiten, Schild drucken, Archivieren (aktiv=false), Löschen (komplett weg, mit Confirmation)
- **Drucker-Icon auf Karten** (nur eingeloggt): direkter Schild-Druck
- **FAB Plus-Button** unten rechts für schnellen Zugang zu Inserieren

### Sarah-Klärungen zu Begriffen

- **Export = Restposten / sehr günstige Ware** (NICHT Auslandsversand wie ich anfangs dachte). Wird nur als Stern-Marker gesetzt
- **Sonderpreis = nur Marker mit Sternchen**, kein extra Preis-Feld. Sarah trägt Preis im normalen Feld ein, hakt zusätzlich „Sonderpreis" an
- **Größen-Klassen** nur für: 1-Flügelig, 2-Flügelig, 3-Flügelig, Balkontür-1/2/Rollo, Festelement (NICHT für Haustür/Schiebetür/Kellerfenster)
- **Standnummer** ist Pflichtfeld auch bei Gebraucht (im Druck-Schild prominenter Hinweis)

### Was Sarah noch tun muss

🔴 **USt-ID im Impressum** nachtragen (steht aktuell „Wird nachgereicht") — fragen ob sie eine hat oder Steuernummer reicht
🟡 **Ihren echten Lagerbestand einstellen** — Demo-Produkte aus seed-mock-produkte.sql können später gelöscht werden
🟢 **Vercel-Migration** wenn Live-Gang ansteht — dann robots.txt auf produktiv stellen

### Bekannte offene Technik-Punkte

- **Mobile-First Refactor von `shop-einstellen.html`** — Layout ist Desktop-orientiert, funktioniert aber auf Handy. Echte Mobile-Optimierung steht noch aus (große Touch-Buttons, sticky Veröffentlichen-Button unten, vertikales Stacking)
- **„Archiv ansehen"-Toggle** für eingeloggte: aktuell verschwinden archivierte Inserate komplett, Wiederherstellen nur via Supabase-UI
- **2FA für Auth-User** — Sarah-empfohlen wenn sie mehr Zeit hat
- **Demo-Produkte vs. echte Produkte:** wenn Sarah Demo löschen will, einfach in Supabase Table Editor → produkte → manuell löschen oder `delete from public.produkte where id like 'f-%' or id like 'h-%' …`

### Pausierte Bilder-Aufgabe (vom Vormittag)

Apple-Style Prompts für 4 Kategorie-Bilder (Fenster, Balkontür, Haustür, Hebe-Schiebe) wurden im Chat geschrieben — Sarah wollte selbst in Google Flow generieren. Status unklar ob sie's gemacht hat. Falls noch offen: alte Bilder in `img/fenster_standard.png` etc. funktionieren weiter als Fallback. Prompts sind nicht in Datei gespeichert (nur im Chat) — wenn nächste Session: Sarah neu fragen oder Prompts neu generieren.

---

## 🎯 WO WIR JETZT STEHEN (lies zuerst!)

### Konfigurator-Status: Apple-Clean fertig, Premium-Polish 80% durch

**1. Konfigurator-Hero ist auf Apple-Shop-Stil umgebaut** ✅ (Sarah-Feedback hat Pattern+Glow-Orbs als Fehler entlarvt). Reinweißer Hintergrund, kleine Breadcrumb mittig, Headline 44px statt 64px (zurückgenommen damit Produkte der Star sind).

**2. Design-Token-System eingeführt** ✅ — `:root` mit 27 Tokens für Farben, Radien, Schatten, Easings. Eine Quelle für alles, kein Drift mehr.

**3. Selected-States über alle Komponenten unifiziert** ✅ — eine Sprache: 1px Border + 2px Ring + Check-Icon. Kein harter Background-Fill mehr.

**4. Produktkarten Step 1 vergrößert** ✅ — Bild-Höhe 140→220px (Desktop), Card-Hover mit Lift -2px + Bild-Scale 1.04, Apple-Watch-Studio-Pattern.

**5. Live-Vorschau aufgewertet** ✅ — 480px Höhe (statt 400), sanfter Gradient-Hintergrund, besseres Empty-State mit Icon-Kreis + Erklär-Text.

**6. JS-Bug gefixt** ✅ — Apostroph in Inline-CSS-String hatte das ganze JS gebrochen, dadurch waren Klicks tot. Mit Backticks gefixt.

### Was noch offen ist (Priorität nach Aufwand)

⚠️ **Step-1 Produktbilder sind nicht 100% einheitlich** — Sarahs aktuelle 4 AI-Bilder haben unterschiedliche Hintergründe/Stile. Lange Tooling-Schlacht heute (Pollinations rate-limited, Browser-Bridge timeouts, Plugin-Marketplace nicht verfügbar). **Lösung wartet auf Higgsfield €35/Mo (Sarah hat zugestimmt, noch nicht gebucht) ODER Sarah generiert manuell in Google Flow (sie ist eingeloggt).**

🔴 **BAFA-Förder-Banner einbauen** (aus News-Digest, ~2h) — echter Verkaufs-Hebel: BEG-Topf 2026 schrumpft 17% (15,3→12 Mrd €). „Sichern Sie sich Ihre Förderung bevor das Budget aus ist." Klar dringend.

🟡 **Hardcoded Border-Radius + Transitions auf Tokens migrieren** (~25 Min) — siehe DESIGN-SYSTEM-AUDIT.md Priority 1.

🟡 **Telegram-Bot Setup** — Sarah wollte den offiziellen Anthropic-Telegram-Plugin (`claude-plugins-official/telegram`) — 7-Schritte-Anleitung steht in api/README.md.bak (und im Cowork-Stand), Sarah noch nicht durchgegangen. Der Vercel-Telegram-Bridge-Code liegt im `_archive/` als Plan B falls 24/7-ohne-Mac gewünscht ist.

### Nächster konkreter Schritt für neue Session

1. **STAND.md komplett lesen** (diese Datei). Insbesondere die Sektion „Bildergenerierung" weiter unten.
2. **Sarah fragen: Hast du Higgsfield gebucht? Hast du in Flow Bilder selbst generiert?** Je nach Antwort:
   - Ja Higgsfield → 4 konsistente Bilder dort generieren mit Sarahs Account, ich integriere
   - Ja Flow-manual → wenn Bilder in img/ liegen, ich integriere
   - Nein → BAFA-Banner ziehen (P1) ODER Border-Radius/Transition-Migration (P2)
3. **Telegram-Bot:** Sarah fragen ob sie die 7 Schritte für `claude-plugins-official/telegram` durchgemacht hat. Falls ja: testen.
4. **Cowork-Browser-Bridge:** wenn timeouts wieder anfangen — sofort aufgeben, Sarah manuell machen lassen. NICHT 9 Versuche wie heute.

---

---

## 🔥 SESSION 27.04.2026 — was an diesem Sonntag passiert ist

### Konfigurator-Refactor (alles im konfigurator.html)

1. **Hero auf Apple-Shop Clean** — Pattern+Glow+Gradient raus, reinweiß+klein-mittig+Headline 44px+Subline. Lines ~298-318.
2. **Nav glassmorph** statt dunkelblau — nur auf konfigurator.html via CSS `!important`-Override (Lines ~98-109). Andere Seiten unverändert.
3. **Selected-States unifiziert** — `.oc/.cc/.pc/.csw/.fp-item/.griff-opt`: Default 1px Border, hover Tint, selected = 2px Ring + Check-Icon. Lines ~131-251.
4. **Token-System** in `:root` (Lines ~45-86):
   - Colors: `--c-primary/dark/tint/ring`, `--c-bg/bg-soft`, `--c-border/border-hover`, `--c-text/text-soft/text-muted`, `--c-gold/warn/success`
   - Radii: `--r-sm/md/lg/xl/full` (8/12/16/20/999px)
   - Shadows: `--shadow-1/2/3` (resting/hover/active)
   - Easings: `--ease`, `--t-fast/norm/slow` (150/250/350ms)
   - A11y: `--focus-ring`
5. **Schrift-Bug** — `'Inter'` und `'Archivo'` global ersetzt durch `'Plus Jakarta Sans'` / `'Manrope'`. Eine kritische Bug-Falle: ein Inline-JS-String `editBanner.style.cssText='...font-family:Archivo,...'` wurde durch `'...font-family:'Plus Jakarta Sans',...'` ersetzt → der Apostroph hat den String gebrochen → ganzer JS-Block kaputt → Klicks tot. **Gefixt indem dieser String auf Backticks `\`...\`` umgestellt wurde** (Line ~2154). **Lehre:** vor `replace_all` für Strings die in JS-Code vorkommen IMMER prüfen ob es in String-Literalen vorkommt.
6. **Touch-Targets a11y-konform** — `.szb` min 40px, `.csw` 32→40px, `.qbtn` 44×44 bestätigt. Plus globale `:focus-visible`-Regel mit `--focus-ring`.
7. **Brand-Farben durchgezogen** (76 Stellen) — Python-Script mit Skip-Regel: nur in HTML `style="..."`-Attributen ersetzt, JS-Strings/Email-Templates unangetastet (sonst wieder Apostroph-Bug). Inputs: 174 Hardcodes vorher → 98 nachher (Differenz 76, alle in HTML).
8. **Step-1 Produktkarten visualisiert vergrößert** — Bild-Höhe 140→180px (Tablet) bzw. 220px (Desktop), Card-Hover lift+image-scale, Card-Padding 18/16/20, Border-Radius 16px. Grid 1/2/4 cols statt 2/4.
9. **Live-Vorschau-Bereich** — Höhe 400→480px, Gradient-Hintergrund `#fafbff→#f0f3fa`, Empty-State mit großem Icon-Kreis + Headline + Erklärung.
10. **Open-Button auf Tokens** — alte Inline-Hover-Hardcodes raus, `.oeffnen-btn`-Klasse mit `:hover` + `.active`. JS `toggleOpen()` toggled jetzt `.active` statt Inline-Style.

### Neu erstellte Dateien (alle im Projekt-Root)

- **`SKILLS-AUDIT.md`** — was Anthropic offiziell anbietet vs. was Sarah hat. 17 offizielle Skills im `github.com/anthropics/skills` Repo, davon hat Sarah die meisten (docx/pdf/xlsx/pptx/schedule/skill-creator/setup-cowork/consolidate-memory). Empfehlungen: `mcp-builder` (für Multi-Agent-Plan), `webapp-testing` (Playwright für Auto-Tests), `brand-guidelines`. **Diese Skills sind NICHT in Coworks Plugin-Marketplace** — Cowork erkennt `/plugin marketplace add`-Befehle nicht.
- **`BILDER-PLAN.md`** — vollständige Konfigurator-Bild-Logik-Map. 12 Konfigurator-Optionen kartiert (Step 1-9 + Spezial-Cases). Pro Option: was triggert Bildwechsel, aktueller Stand, Drutex-Quelle, Priorität. **Harte Regel von Sarah: kein abgehacktes Bild, kein Crop, kein Stretch — bei Inkompatibilität Kachel anpassen, nicht Bild verzerren.**
- **`DESIGN-SYSTEM-AUDIT.md`** — `design:design-system`-Skill auf konfigurator.html angewendet. Score 72/100. P1 quick-wins: 12 verschiedene Border-Radius-Werte → auf 4+full reduzieren (15 Min); 10+ Transition-Signaturen → auf Token-konform (10 Min). P2 mittelfristig: Spacing-Token-System, Type-Scale-Tokens. P3: z-index-Skala, Disabled/Error-Tokens.
- **`WEEKLY-DIGEST-2026-04-26.md`** + **`WEEKLY-DIGEST.md`** (Kopie auf jüngsten) — 1. echter Wochen-Digest. 4 Lanes: AI/Tools, Fenster-Branche, Social/Creator, Monetarisierung. Top-3-Action-Items: BAFA-Förder-Banner einbauen (Topf-Kürzung 17%), TikTok-Shop-EU-Timing, Claude Opus 4.7 + Managed Agents.
- **`.claude/skills/news-pipeline/SKILL.md`** — Skill-Definition für wöchentlichen Digest. Triggers, 4-Lanes-Struktur, Quellen-Allowlist, Workflow.
- **`.claude/config/notifications.json.example`** — Template für Telegram-Bot-Token + Resend-Email-Config. Echte Datei `notifications.json` ist gitignored.
- **`.gitignore`** erweitert um `.claude/config/notifications.json`.
- **`_archive/api-vercel-telegram-bridge/`** — Plan B Telegram-Bridge (Vercel-Functions). Wird nicht aktiv genutzt — Plan A ist Anthropic-offizieller Telegram-Plugin (`claude-plugins-official/telegram`). Code im Archive falls 24/7-ohne-Mac mal gewünscht.
- **`_archive/vercel.json`** — passende Cron-Config zur Vercel-Bridge.
- **`_archive/README.md`** — erklärt was im Archive liegt und wann zurückholen.
- **`BILDER-VERGLEICH.html`** — Test-Page für Bild-Vergleich (Pollinations vs aktuell). Im Root liegen lassen, ist Scratch-Pad.
- **`img-test/fenster_v2.svg`** + **`fenster_v2_preview.png`** — SVG-Vector-Versuch für Produktbild. Sarah-Verdikt: zu Cartoon, Foto-Look bevorzugt. Im img-test/ als Backup falls SVG-Approach später interessant.
- **`img-test/balkontuer_v2.png`** + **`fenster_v3.png`** + **`fenster_v5.png`** — Pollinations-Versuche, alle nicht gut genug. Im img-test/ als Negativ-Beleg dass Pollinations Free für Window-Photography nicht reicht.

### Was Sarah explizit abgelehnt hat in dieser Session

- **Pollinations-Bilder zu schlecht** — „Bilddarstellung Tool Kacke"
- **Drutex-Wohnzimmer-Inspirationsfotos** — sie wollte pure isolierte Produktbilder, keinen Kontext
- **SVG-Vector-Style** — „keine SVG Zeichnung Bilder", will photo-realistisch
- **Browser-Login-Sharing** — Sicherheitsregel respektiert: sie loggt selbst ein
- **Vercel-eigene-Telegram-Bridge** — zugunsten des offiziellen Anthropic-Plugins (einfacher)

### Was Sarah explizit gewünscht hat (für künftige Sessions wichtig)

- **„Echte Foto-Optik wie meine fenster_standard.png" für die anderen 3 Step-1-Karten** — sobald Tool verfügbar (Higgsfield €35 oder Flow funktional)
- **Telegram-Chat-Bot mit mir** — sie tippt Aufgaben aufm Handy, ich antworte. Plan: Anthropic-offizieller Plugin (claude-plugins-official/telegram), 7-Schritte-Setup
- **Wochen-Digest** — automatisch jeden Montag, Telegram + Email Versand. News-Pipeline-Skill ist scharf, Versand-Channels noch nicht eingerichtet
- **30k€-würdiger Konfigurator** — über andere Branchen verkaufbar (Möbelbau, Carports, Pools). Three.js 3D-Vorschau ist Phase C, post-Launch
- **Multi-Stream-Vision** weiter denken — Webagentur (Stream 1) + UGC-Agentur (Stream 2) + TikTok-Shop-Affiliate (Stream 3). Siehe AGENTUR-PLAN.md

### Tooling-Probleme die Zeit gekostet haben (für Lessons-Learned)

- **Pollinations Free** — flux-Modell macht keine sauberen Window-Renderings, sana-Modell besser aber rate-limited nach ~3 Calls. Verbrannt: ~6 Versuche.
- **Cowork → Claude-in-Chrome-Bridge** — 60s-Timeouts bei screenshot/click. Plus Extension-Permission-Block für `labs.google/fx/tools/flow`. Sarah hat „on labs.google" Permission gegeben, half nicht (Reload nötig, Sub-Pfad-Issue). Verbrannt: ~3 Versuche.
- **GitHub-Direkt-Download im Sandbox** — `codeload.github.com`, `raw.githubusercontent.com`, `api.github.com` alle vom Cowork-Proxy blockiert. Nur `github.com` HTML-Seiten sind erreichbar.
- **Cowork-Plugin-Slash-Commands** — `/plugin marketplace add` ist Claude-Code-CLI-Syntax, nicht Cowork. Cowork hat eigenen Marketplace, der UI/UX Pro Max nicht enthält. Lösung: Sarah müsste Claude Code CLI separat installieren oder Skill manuell `git clone`-en lokal.
- **Image-MCP `generateImage`** — sana-Modell hat 60s-Timeout bei Folge-Aufrufen, nur erstes Bild ging durch. Free-Tier-Limit.

### Lehren für künftige Sessions

1. **Vor `replace_all`** auf Strings die in JS-Code vorkommen: prüfen ob es in JS-String-Literalen ist. Apostroph-Wirbel vermeiden.
2. **Bei Browser-Bridge-Timeouts** sofort aufgeben nach 2 Versuchen — nicht 9× wiederholen wie heute.
3. **Free-Image-Tools für Photo-Realism** funktionieren heute nicht zuverlässig für spezifische Produktkategorien wie Fenster. **Higgsfield Plus €35/Mo ist der pragmatische Weg** — Sarah hat zugestimmt, muss aber buchen.
4. **Cowork ≠ Claude Code CLI** — verschiedene Plugin-Systeme. Sarah hat Cowork mit installierten Plugins (brand-voice, design, marketing, anthropic-skills). Externe GitHub-Skills brauchen Claude Code CLI separat oder manuelles `git clone` ins .claude/skills/.
5. **Sarahs Geduld respektieren** — wenn Tools nicht liefern, ehrlich kommunizieren + Pivot-Optionen anbieten statt 9× weiter probieren.

---

## ✅ WAS FERTIG IST

### Website-Seiten (alle launchbereit)

- `index.html` — Hero-Video (Drutex Firmen-Animation), Trust-Bar, **Drutex-Inspirationen-Slideshow** (8 echte Drutex-Bilder mit Auto-Play), „Warum DeineFenster"-Counter-Section (animierte Zahlen), Reviews-Slider, „So bestellen Sie", CTA, Kontakt-Banner, Footer
- `produkte.html` — 5 Kategorien-Cards mit Sub-Buttons (Kunststoff/Balkon/Haustür/Schiebe/Rollladen)
- `ueber-uns.html` — **Hero mit Premium-Pattern-Background** (kein Foto, gradient + window-grid pattern + 2 animierte Glow-Orbs in Blau/Gold), „Seit 2002 Brandenburg"-Story, Pull-Quote „Ein Fenster ist keine Schraube" (Kersten Christ), Timeline 2002→2026, „Vier Werte"-Section, Drutex-Faktenblock (1985, 65 Länder, 60ha, 7M Fenster/Jahr), Mini-Map, „So bestellen Sie"-Section
- `kontakt.html` — 3 Kontakt-Cards (Konfigurator prominent, E-Mail mittel, Telefon dezent), Form mit Make.com-Webhook, Sidebar (Erreichbarkeit, Schnellzugriff, Trust), Google-Maps-Standort, Ansprechpartner (4 Personen), FAQ (6 Fragen)
- `agb.html`, `datenschutz.html` (mit Google-Maps-DSGVO-Abschnitt), `impressum.html`
- 14 Produktseiten — alle mit Drutex-Cover-Videos + Produkt-Videos, Tech-Tabelle, Vergleich, Profil-Farben (41 Drutex-Dekore), Querschnitt auf Premium-Seiten

### Branding & Design-System

- **Schriftarten:** Plus Jakarta Sans (Headlines, 700-800) + Manrope (Body, 400-500)
- **Farben:** primary #225eaa, dunkelblau #1e3a8a, hellblau #76a9fa, gold #c9a84c
- **Border-Radius:** 0.5/0.75/1rem (NICHT mehr 1/2/3rem)
- **Animationen:** GSAP + ScrollTrigger über `js/scroll-animations.js`, respektiert prefers-reduced-motion
- **Logo:** ZURÜCK auf Text „DeineFenster<span class="text-primary-container">.de</span>" — Sarah hat SVG-Logo gehasst, alle SVG-Versuche sind raus aus den Pages (Dateien in `img/logo/` existieren noch als Backup)
- **Favicon:** SVG-Mark (kleines Fensterkreuz)

### Bilder

- Über-uns Hero: PURE PATTERN (kein Foto/Video) — Sarah hat 3 Foto-/Video-Versuche abgelehnt
- Startseiten-Galerie: Drutex-Inspirationen-Slideshow (8 Bilder, von drutex.de geladen, lizenziert als Drutex-Händler)
- Produktseiten: Drutex-Videos (Cover + Produkt) + Drutex-Farb-Swatches
- Pollinations-AI-Bilder (für Brandenburg, Traumhaus, Wohnzimmer-Drutex, etc.) sind als Datei-Backup im img/ Ordner vorhanden, werden aber nicht mehr genutzt.

### Recht / Compliance

- Impressum: Inhaber Kersten Christ, Fohrder Landstraße 13, 14772 Brandenburg an der Havel, 03381/2148373, info@baustoffchrist.de
- Datenschutz: 10 Abschnitte inkl. Google Maps + Google Fonts + Make.com Webhook (DSGVO-konform Art. 6 Abs. 1 lit. f)
- AGB: Widerrufsbelehrung + Muster-Widerrufsformular
- Schema.org: HomeAndConstructionBusiness, ContactPage, Product+AggregateOffer auf allen Produktseiten
- Open Graph: Title + Description + Image auf allen öffentlichen Seiten

### Echte Geschäftsdaten (verifiziert)

- Firma: Fensterhandel Christ
- Inhaber: Kersten Christ
- Adresse: Fohrder Landstraße 13, 14772 Brandenburg an der Havel
- Tel: 03381 / 2148373
- E-Mail: info@baustoffchrist.de
- WhatsApp (nur Text): 0171 / 7263776
- Bewertung: 4,2★ aus 110 Google-Reviews
- Aktiv seit: 2002 (24 Jahre)
- **Reale Öffnungszeiten:** Festnetz Mo-Fr 10-18, Lagerverkauf nur Freitags 10-17, E-Mail/WhatsApp 24/7
- **Betriebsurlaub:** Sommer 01.08.-31.08., Winter ab 12.12. bis April

### Drutex-Video-URLs (alle getestet, funktionieren)

| System | Cover-Video | Produkt-Video |
|--------|------------|---------------|
| Firmen-Animation (für index.html Hero) | `drutex.de/media/_upload/sections/movie-block/1920x940-firma-animacja_02.mp4` | — |
| IGLO 5 Classic | `produkty/iglo5-classic/iglo-5-classic-cover.mp4` | `produkty/iglo5-classic/video/iglo_5_classic.mp4` |
| IGLO Energy | `produkty/IGLO_ENERGY/okna-iglo-energy-cover.mp4` | `produkty/IGLO_ENERGY/video/iglo_energy_anim_winchester.mp4` |
| Haustür IGLO 5 | `produkty/drzwi-iglo5/drzwi-iglo-5-cover.mp4` | `.../video/drzwi_iglo_5.mp4` |
| Haustür IGLO Energy | `produkty/drzwi-iglo-energy/drzwi-iglo-energy-cover.mp4` | `.../video/drzwi_iglo_energy.mp4` |
| IGLO-HS | `header_video/iglo_hs.mp4` | `produkty/iglo-hs/video/iglo_hs_animacja_-_niemiecka_-_22-05-2020_web.mp4` |
| IGLO Slide | `produkty/iglo-slide/header/iglo-slide-header.mp4` | `produkty/iglo-slide.mp4` |
| IGLO 5 Classic PSK | `produkty/drzwi-iglo5-psk/psk-iglo-5-cover.mp4` | `psk_iglo_5_classic/video/psk-iglo-5-classic-cover.mp4` |
| IGLO Energy PSK | `produkty/iglo-psk/psk-iglo-energy-cover.mp4` | `iglo_pks/video/iglo_uchylno_przesowne.mp4` |
| Aufsatz-Rollladen | `produkty/rolety/rolety-pvc-drutex_cover.mp4` | — |

---

## 🚨 KONFIGURATOR — AKTUELLER STATUS (Phase A in progress)

### Sarah-Wunsch (von ihr selbst formuliert)

- Konfigurator ist **Herzstück** der Site
- Muss der **beste Fenster-Konfigurator auf dem Markt** sein, **30k€-würdig**
- Soll auf **andere Branchen übertragbar** sein (Möbelbau, Carports, Pools, Wintergärten, Treppen) → modular bauen
- **Apple-Konfigurator-Stil** (sie hat das explizit gewählt)
- „Kasten zum Aufmachen" (Akkordeon) findet sie cool, soll bleiben
- Sticky-Sidebar rechts soll bleiben aber besser werden
- ALLES was bisher drin ist (R1-R8 Drutex-Regeln, etc.) muss bleiben + plus Erweiterungen
- Bilder die im Live-Preview erscheinen sollen wie **echte Drutex-Produktbilder** aussehen, nicht generiert
- Logik perfekt, Design perfekt, alles perfekt

### Was ich (Claude) bisher gemacht habe in Phase A

✅ Schriften konsolidiert: Plus Jakarta Sans + Manrope (statt Mix Inter/Archivo/Manrope)
✅ Tailwind-Config erweitert: gold-Farbe + surf-Farben aufgehellt
✅ Step-Cards: Premium-Schatten, Glow-on-Hover, Gradient-Number-Badges (01/02/03 in Blau-Gradient wenn aktiv), Done-Cards mit Check-Icon, Smooth-Fade-In
✅ Sidebar: Premium-Schatten, dünnere Scrollbar, max-height + scrollbar
✅ View-Toggle-Buttons: aktiv-State mit Blau-Gradient
✅ Progress-Bar: Backdrop-Blur, Gradient-Fill (Blau→Hellblau)

❌ **HERO-BEREICH KOMPLETT FALSCH** — Sarah hat das abgelehnt. Aktuell drin:
```
Pattern-Hintergrund (window-grid SVG, opacity 0.06) +
Animierte Glow-Orbs (blau + gold, blur 70px, animiert) +
Gradient-Background (linear-gradient #0a1530 → #1e3a8a → #225eaa) +
Headline „Ihr Fenster. Ihr Maß. Ihr Preis." (groß, weiß auf dunkel)
```
Sarah-Feedback wörtlich: **„diese komische Kasten da, dieses blaue ... übelst unprofessionell und KI-generiert ... gar nicht wie Apple ... nimmt Fokus weg vom Konfigurator"**

### Was als nächstes muss

1. **Research zu echten Apple/Tesla/BMW-Konfiguratoren machen.** Konkret:
   - apple.com/shop/buy-iphone (iPhone-Konfigurator)
   - apple.com/shop/buy-watch (Apple Watch Konfigurator)
   - tesla.com/de_DE/model3/design (Tesla Model 3)
   - bmw.de Konfigurator
   - boconcept.com (Möbel-Konfigurator)
   - Was ist gemeinsam? Wie sieht der Hero aus? Wie ist der Page-Background? Welche Farben? Welche Typografie?
2. **Konfigurator-Hero komplett umbauen.** Hypothese (vor Research): Apple = weißer Hintergrund, MINIMALER Header, fast nur Breadcrumb + kleine Headline, dann GROSSE Vorschau direkt darunter, alle Optionen rechts. KEIN Pattern, KEINE Glow-Orbs, KEINE Gradient-Hintergründe.
3. **Konfigurator selbst soll der „Held" der Seite sein** — Header tritt zurück.
4. Phase A weitermachen: Option-Cards, Color-Swatches, Buttons polishen.

### Phasen-Plan (Sarah-bestätigt)

| Phase | Inhalt | Status |
|---|---|---|
| **A** | Design-Refresh (Cards, Sidebar, Hero, Buttons, Inputs) | 🔄 in progress, Hero muss umgebaut werden |
| **B** | Save&Share-URL, PDF-Export, Vergleich-Modus, Smart-Defaults, Mobile-Sidebar | 📋 geplant |
| **C** | Three.js 3D-Vorschau (Sarah will dass es wie Drutex-Produktbilder aussieht) | 📋 NACH Launch, Phase C |
| **D** | Performance + Mobile (Lazy-Load, Touch, Web-Worker) | 📋 geplant |

### Wichtige Konfigurator-Files

- `konfigurator.html` — 4846 Zeilen, gewachsen über mehrere Sessions
- `DRUTEX-REGELN.md` — R1-R8 (Rolladen-Kasten, Dreh-Kipp max 1400mm, RC2/RC3 zwingt VSG, etc.)
- `KONFIGURATOR-AUDIT.md` — historischer Audit, viele Fixes durchgegangen
- `KONFIGURATOR-RESEARCH.md` — meinfenster24-Vergleich

### Bestehende Konfigurator-Logik (alles bleibt)

- 12 Schritte Akkordeon mit Auto-Scroll und Step-Done-Badges
- Live-Preis mit Versandkostenstaffel (1F=50€, 2F=80€... 6+=kostenlos)
- 6 produktspezifische Flows (Kunststoff/Balkontür/Haustür/3 Schiebetür-Systeme)
- 45 RAL-Farben + Drutex-Dekore mit echten Codes
- Drutex-Regeln R1-R8 implementiert
- Make.com-Webhook für Bestellung (URL: `https://hook.eu1.make.com/so6vhvekae4ve7e3peh7vgcgqmv7cbrc`)
- Bestellübersicht mit Mehrfach-Konfiguration → bestelluebersicht.html
- localStorage-Speicherung („Automatisch gespeichert"-Badge)

---

## 🎯 SARAH'S GESAMT-VISION (Multi-Stream)

### 3 parallele Streams (gespeichert in `AGENTUR-PLAN.md`)

1. **AI-Webagentur** ← Stream 1, DeineFenster ist Portfolio-Stück
   - Zielkunden: Handwerker (Fliesenleger, Türen, Fenster), später erweitern
   - 3 Produktlinien:
     - **Standard-Websites** 1.497-2.997€ einmalig (Volume-Play)
     - **3D-Konfigurator** 30.000€ einmalig (Premium-Cash-Cow)
     - **Add-Ons** (SEO, Voice-Agents, Lead-Magnets)
   - 12 KI-Agenten als „Mitarbeiter" geplant: Lead-Hunter, Outreach, Sales, Onboarding, Website-Builder, Content, Image, QA, Deployment, Rechnung
   - Realistische Zahlen: Monat 12 = 23-27k€/Mo, Monat 24 = 42-56k€/Mo
2. **UGC-Agentur** ← Stream 2, kommt nach Webagentur Phase 1
   - AI-Videos für E-Commerce-Brands (TikTok-Shop, Shopify)
   - Tools: Kling 3.0 free → später Higgsfield
   - Nische: Home & Kitchen Gadgets zuerst
3. **TikTok-Shop-Affiliate** ← Stream 3, später

### Sarahs Arbeitsweise (wichtig für neuen Chat)

- **Sarah ist Anfängerin** — keine Code-Kenntnisse, lernt mit Claude
- **Schnell arbeiten** — sie sagt oft „das dauert mir zu lange"
- **Direkt und ehrlich** — keine Marketingsprache, keine Hype-Worte
- **Sie hasst Fenster** als Geschäft — pivot zu AI-Agentur ist ihr Hauptziel
- **Action vor Reden** — bei Fragen entscheidet sie schnell („egal, mach selbst", „du bist Experte")
- **Sie nutzt Sprache-zu-Text** — Tippfehler in Nachrichten sind normal
- **Sie hat Claude Max** — alle Skills/Tools verfügbar, keine Kosten-Sorgen für AI-Calls
- **„Reich werden"** ist explizites Ziel, aber ich (Claude) muss realistische Zahlen geben (nicht „Millionär in 8 Monaten" versprechen)

### Was Sarah explizit NICHT will

- TikTok-Shop-Creator selbst werden (zu viel Eigenaufwand)
- OnlyFans (haben wir besprochen, ist raus)
- Generischer „AI-Beauty-UGC"-Hustle (Markt überlaufen)
- Eigene Produkte verkaufen (will Service/Andere-Brands-bewerben)
- Konstant über Telefon Kunden beraten (Selbstservice via Konfigurator + Email)

### Was Sarah explizit WILL

- Mehrere Einkommens-Streams (echte Unternehmer haben mehrere)
- Konfigurator als 30k€-Premium-Produkt für andere Branchen
- AI-Agenten als „Mitarbeiter" die täglich für sie arbeiten
- Reicheinkommen, in 24 Monaten 25-50k€/Monat zumindest
- Keine Fenster-Identität (lieber „AI-Gründerin")

---

## ⚠️ DESIGN-LEHREN (was NICHT geht)

### Was Sarah ABGELEHNT hat in dieser Session

1. **AI-generiertes Hero-Foto modernes Haus bei Dämmerung** für Über-uns („zu California-modern, nicht Drutex")
2. **Drutex-Werk-Bild als Über-uns-Hero** („nicht so schön")
3. **Drutex-IGLO-Energy-Cover-Video** als Über-uns-Hero („das war ja schon mal irgendwo drin")
4. **AI-Wohnzimmer/Küche/Rollladen-Bilder** in Galerie auf Startseite („sehen blöd aus, nicht wie Drutex")
5. **SVG-Logo „DeineFenster"** mit Fensterkreuz-Symbol („sieht richtig schlimm aus") → Text-Logo wieder rein
6. **Archivo + Inter** als Schriften statt Plus Jakarta Sans + Manrope („alte Schrift war besser")
7. **Pattern-Background + Glow-Orbs auf Konfigurator-Hero** („übelst unprofessionell und KI-generiert, gar nicht wie Apple") ← LETZTES Feedback
8. **Counter mit hochzählenden Zahlen** auf index.html → das hat sie GEMOCHT (bleibt drin)
9. **Pattern-Background + Glow-Orbs auf ueber-uns Hero** → das hat sie GEMOCHT (bleibt drin)

**Lehre:** Pattern-Background funktioniert auf Marketing-Pages (ueber-uns), aber NICHT auf funktionalen Tools (Konfigurator). Bei Konfiguratoren MUSS das Tool selbst der Held sein.

### Was Sarah erwartet (Design-Standard)

- **Premium aber nicht KI-generiert** — keine offensichtlich AI-aussehenden Bilder
- **Apple-Stil heißt: clean, weiß, viel Whitespace, Produkt im Fokus** (nicht: Pattern + Glows)
- **Drutex-Bilder direkt nutzen** ist OK (sie ist Händler) und sieht professionell aus
- **Eigene AI-Bilder** sind problematisch — meine Pollinations-Bilder sind nicht gut genug Qualität
- **Schriftarten konsistent** — Plus Jakarta Sans + Manrope überall

---

## 📋 TASK-STATUS (Stand 24.04.2026 später Abend)

### Aktiv (in_progress)
- **#41 Konfigurator Phase A: Design-Refresh** — Hero MUSS umgebaut werden!

### Geplant (pending)
- **#42 Konfigurator Phase B:** UX (Save/Share/PDF/Vergleich)
- **#43 Konfigurator Phase C:** Three.js 3D-Vorschau (DER 30k€-Boost)
- **#44 Konfigurator Phase D:** Performance + Mobile
- **#37 UGC-Agency Phase 1:** Demo-Portfolio mit Kling 3.0 (später)
- **#15 Mega-Menu auf alle Seiten** (defer post-Launch laut CLAUDE.md)

### Erledigt heute (Session 24.04.)
- #38 DeineFenster-Audit, STAND.md-Update, Bild-Probleme fix
- #39 Drutex-Inspirationen-Slideshow auf Startseite
- #40 Final-Launch-Audit aller Seiten
- #36 Deep Research AI-Income-Paths
- #28 Alte deinefenster.de durchscrollen
- #29 Google Maps + Mini-Map auf Über-uns
- #30 Drutex-Geschichte + eigene Story auf Über-uns
- #31 Einheitliche Scroll-Animationen auf allen Seiten
- #32 Schärfere Ecken global
- #33 Logo-Design (REVERTED zu Text-Logo)
- #34 Über-uns Hero (Pattern + Glow nach 3 abgelehnten Varianten)
- #35 Icon-Kreise ersetzen

---

## 🚀 NÄCHSTER SCHRITT FÜR NEUEN CHAT

1. **Diese STAND.md komplett lesen.** Besonders Sektion „KONFIGURATOR — AKTUELLER STATUS" und „DESIGN-LEHREN".
2. **Research starten:** Wie sehen echte Apple/Tesla/BMW-Konfiguratoren wirklich aus? Was ist gemeinsam in Layout/Background/Typografie?
3. **Konfigurator-Hero umbauen:** Pattern + Glow + Gradient ersetzen durch CLEAN white/minimal Apple-Stil. Konfigurator selbst (Steps + Sidebar + Preview) wird der Held der Seite.
4. **Sarah zeigen, Feedback einholen, iterieren.**

---

## 📁 WICHTIGE PROJEKT-DATEIEN

- `CLAUDE.md` — Projektkontext, Skills, Sarah-Arbeitsweise, Drutex-Video-URLs
- `STAND.md` — diese Datei (Wahrheitsquelle)
- `AGENTUR-PLAN.md` — Multi-Stream-Pivot-Plan (3 Streams: Webagentur, UGC, TikTok-Shop)
- `DRUTEX-REGELN.md` — R1-R8 Konfigurator-Logik
- `KONFIGURATOR-AUDIT.md` — historischer Audit
- `KONFIGURATOR-RESEARCH.md` — meinfenster24-Vergleich
- `BROWSER-REGELN.md` — Goldene Regeln für Browser-Sessions (drutex.de, deinefenster.de)
- `PROJEKTE.md` — Sarah's 3 parallele Projekte
- `data/bilder-katalog.json` — 91 Projekt-Bilder Wahrheitsquelle (alt, evtl. nicht mehr aktuell)

---

## ✅ LAUNCH-STATUS: GO (Audit 24.04. später Abend)

Voll-Audit aller Seiten durchgeführt. Ergebnis: **GO ohne Vorbehalt.**

- Logik-Konsistenz ✅ (Telefon, Adresse, Öffnungszeiten überall gleich)
- Design-Konsistenz ✅ (PJS+Manrope, Farben, Buttons, Cards)
- Copy ✅ (keine Fake-Reviews, keine erfundenen Stats)
- SEO ✅ (Title/Meta/OG/Schema.org auf allen Seiten)
- Mobile ✅ (responsive, Touch-Targets, Mobile-Menu)
- Compliance ✅ (Impressum/AGB/Datenschutz mit DSGVO-Hinweisen)
- Performance ✅ (GSAP, Drutex-CDN, Webhook funktioniert)
- Konfigurator ✅ (lädt, Live-Preis, Bestellung über Make.com)

**Nächste Schritte:**
1. Domain auf Vercel deployen → live gehen
2. Konfigurator auf Premium-Niveau bringen (3D Three.js, 30k€-würdig)

---

## 🚨 ALTE OFFENE PUNKTE (vor Audit 24.04. abends)

### 🟡 Bild-Status (Update 24.04. abends)

| Datei | Status | Was |
|---|---|---|
| `img/ueber-uns-konzept-brandenburg.jpeg` | ✅ AKTIV | Brandenburg-Stadt am Wasser, goldene Stunde — Hero auf ueber-uns |
| `img/home-wohnzimmer-drutex.jpeg` | ✅ AKTIV | Drutex-Style Sprossenfenster mit Wohnzimmer |
| `img/home-rollladen-drutex.jpeg` | ✅ AKTIV (verbesserungswürdig) | Klassisches DE-Haus, Rollläden nicht prominent |
| `img/home-kueche.jpeg` | ✅ AKTIV | OK, generic |
| `img/home-haustuer.jpeg` | ✅ AKTIV | OK, passt |
| `img/ueber-uns-konzept-handwerk.jpeg` | 💾 BACKUP | Hand mit Maßband, nicht gewählt |
| `img/ueber-uns-konzept-lager.jpeg` | 💾 BACKUP | Lager-Innenansicht, nicht gewählt |

**Sarah-Plan:** 5 Drutex-Marketing-Bilder werden in Galerie auf Startseite eingebaut, sobald sie im `img/` Ordner sind. Drutex-Bilder NICHT auf ueber-uns (= eigenes Branding).

### 🟡 Andere offene Sachen
- **Fake-Reviews auf index.html** (Michael B. München / Sandra K. Hamburg / Thomas W. Berlin) → ABMAHNRISIKO § 5 UWG, müssen raus oder durch echte ersetzt werden
- **Mega-Menu** nur auf index.html — auf anderen Seiten flache Nav (defer post-Launch laut CLAUDE.md, aber für sauberen Launch anschauen)
- **Reviews-Section auf ueber-uns** wurde entfernt, dadurch nur noch auf Startseite — OK, einmalig

### 🟢 Geplant nach Launch
- Brand-agnostische Agenten-Architektur bauen (für Webagentur Phase 1)
- 3D-Konfigurator-Agenten (Premium-Linie 30k€)
- DeineFenster.de Domain auf Vercel deployen

---

## 🆕 Session 24.04. Abend – 3 Audit-Schritte abgearbeitet

Nach Audit Q1-Option-A: Sarah hat mich durchlaufen lassen, ich bestimme Reihenfolge.

### ✅ Schritt 1 — Google Maps auf kontakt.html + ueber-uns.html

- **Recherche auf alter www.deinefenster.de** (IONOS-Legacy-Seite): Startseite, Kontakt, Öffnungszeiten, Ansprechpartner durchgescrollt. Firmeninfos + reale Öffnungszeiten gezogen.
- **kontakt.html**: Neue „Standort"-Sektion zwischen Ansprechpartner und FAQ, 2-Spalten (Info-Karte links, Google-Maps-iframe 420px rechts). Adress-Bullets: Anschrift, Anfahrt ab Berlin, Lagerverkauf-Hinweis, Telefon/Mail/WhatsApp. CTA „Route zu uns berechnen" → opens Google-Maps-App.
- **Öffnungszeiten korrigiert** auf Realität: Festnetz Mo–Fr 10–18, E-Mail+WhatsApp 24/7, Lagerverkauf nur Freitags 10–17. Vorher war „Mo-Fr 08-18, Sa 09-14" erfunden.
- **Schema.org** erweitert mit PostalAddress + 2 openingHoursSpecification (Telefon + Lagerverkauf separat).
- **Betriebsurlaub-Hinweis** (amber-Box): 01.08.–31.08.2026 Sommer + ab 12.12.2026 Winter. März-Pause rausgelassen, da schon vorbei.
- **ueber-uns.html**: Mini-Map-Sektion vor dem CTA (2-Spalten, Adress-Karte im Blau-Gradient + kompakte 340px-Karte).
- **datenschutz.html**: Neuer Abschnitt „10. Google Maps" (Art. 6 Abs. 1 lit. f DSGVO-konform, Link zu Google-Privacy).

### ✅ Schritt 2 — Drutex-Geschichte + eigene Story auf ueber-uns.html

- **„Wie alles begann" → „Seit 2002 das Gleiche Ziel"**: Neuer verkäuferischer Story-Text, ehrlich ohne Fake-Zahlen (2002-Gründung in Brandenburg, Entwicklung vom Baustoffhandel zum reinen Fenster-Spezialisten, Drutex-Direktbezug).
- **Stats-Box umgebaut**: Fake 2.500+ Kunden / 12.000+ Fenster RAUS, ersetzt durch ehrlich: 24 Jahre Fachhandel · 4,2★ aus 110 Google-Reviews · 14 Tage Lieferzeit Lagerware · 41 Drutex-Dekorfarben.
- **Neue Timeline-Sektion** (4 Stationen: 2002 Start · 2010er Drutex-Partnerschaft · 2020er Versand deutschlandweit · 2026 DeineFenster.de Online).
- **„Warum Drutex?" erweitert**: 1985 Gründung in Bytów Polen, 60 ha Werksfläche, 65 Länder Export.
- **Meta-Tags & OG** auf ueber-uns.html neu, ohne Fake-Zahlen.
- **Reviews-Section-Text** angepasst (nicht mehr „über 2.500 Kunden").

### ✅ Schritt 3 — Einheitliche Scroll-Animationen auf allen Seiten

- **`/js/scroll-animations.js`** (~200 Zeilen): GSAP + ScrollTrigger, respektiert `prefers-reduced-motion`. Unterstützt `data-anim="fade-up|fade|scale|slide-left|slide-right|stagger"` + `data-anim-delay/-duration/-y`. Auto-Fallback für `<body data-auto-anim="true">`: animiert automatisch alle h2 in main/section und `.grid > div|article` als Stagger.
- **FOUC-Guard eingebaut**: Synchron beim Script-Load wird CSS injected das Elemente ausblendet, damit kein „Pop-Out → Pop-In" flackert. Nach GSAP-Init wird Guard entfernt. 3s-Fallback-Keyframe falls JS blockiert.
- **Inject-Script `/tmp/inject_scroll_anim.py`**: Hat GSAP + ScrollTrigger + scroll-animations.js in 24 HTML-Dateien injiziert (index, produkte, ueber-uns, kontakt, agb, datenschutz, impressum, dashboard, bestelluebersicht, danke, + alle 14 Produktseiten). Konfigurator ausgenommen (Sarah-Scope).
- **Idempotent**: Script prüft ob GSAP/ScrollTrigger/scroll-animations.js schon vorhanden sind, fügt nur Fehlendes hinzu.
- **Alle Seiten haben jetzt `<body data-auto-anim="true">`** + die 3 Script-Tags im head.

### Neue Dateien (diese Session)

- `js/scroll-animations.js` — zentrale Animation-Library (~200 Zeilen)
- `/tmp/inject_scroll_anim.py` — Inject-Script (reused-bar)

### Wichtige Erkenntnisse aus alter www.deinefenster.de

- **Inhaber-Name**: Kersten Christ (aus Impressum)
- **Reale Öffnungszeiten**: Lagerverkauf nur Freitags 10–17, Festnetz Mo–Fr 10–18, E-Mail/WhatsApp 24/7
- **Betriebspausen**: Sommer (01.08.–31.08.), Winter (ab ca. 12.12. bis April)
- **Ansprechpartner** stimmen mit neuer kontakt.html überein (Frau Christ, Herr Beck, Herr Richter, Herr Budick)

### Offen (nach diesem Fortschritt)

- **Q2 aus Audit**: Trusted Shops / RAL-Zertifikat-Check (Sarah muss sagen welche wir wirklich haben).
- **Q3 aus Audit**: Foto ja/nein auf ueber-uns (Sarah entscheidet).
- **Q5 aus Audit**: Telefon „24 Std Antwort" vs. „Lagerverkauf Freitag nur" Widerspruch final ausräumen.
- **Fake-Review-Texte** in ueber-uns.html (Michael B. aus München, Sandra K. aus Hamburg, Thomas W. aus Berlin) — sollten durch echte Reviews ersetzt werden oder raus.
- **Mega-Menu auf alle Seiten** (Task #15) — nach Launch.
- **AGB/Datenschutz Legal Check** — Anwalt oder Trusted Shops.
- **FAQ-Durchgang auf kontakt.html** — Antworten gegen reale Prozesse prüfen.

---

## 🆕 Session 24.04. nachmittags 2 – Audit + 6 Launch-Fixes

Nach umfassendem Audit (Logik/Struktur/Design/SEO über alle Seiten plus Drutex-Benchmark):

- ✅ **Mega-Menu 50-Jahre-sicher** (index.html): Click-to-Pin raus — „Produkte" klicken geht jetzt normal zu produkte.html. Hover öffnet Menu mit 300 ms Delay (verhindert Aufploppen bei Maus-Vorbeiziehen). CSS + JS entsprechend angepasst.
- ✅ **produkte.html 2-Level-Cards**: jede Kategorie zeigt jetzt **sichtbar** die verfügbaren Profile als Sub-Buttons (IGLO 5 Classic / IGLO Energy, bzw. PSK/Slide/HS für Schiebetüren). Cross-Selling zwischen Profilen funktioniert.
- ✅ **Schema.org Product + Open Graph** auf alle 10 Produktseiten injiziert (JSON-LD mit AggregateOffer, priceCurrency EUR, availability InStock; plus og:type=product, og:image, og:url, Twitter-Card).
- ✅ **Interaktive Profil-Farben-Sektion** auf allen 10 Produktseiten: SVG-Fenster-Preview + 8 Drutex-Farb-Swatches (Weiß, Anthrazit, Grau, Golden Oak, Mahagoni, Winchester, Nussbaum, Douglasie). Hover = Farbe wechselt sofort, Click = fixieren. Label unter Fenster zeigt aktuellen Farbnamen. Keyboard-Bedienung (Tab + Enter) funktioniert. JS: `js/profil-farben.js`.
- ✅ **Querschnitt-Sektion** auf 6 Premium-Seiten (IGLO Energy × 3 Kategorien + PSK × 2 + IGLO-HS): SVG-Profil-Schnitt mit sichtbaren Kammern, 4-5 erklärende Fact-Boxes (Kammern · Einbautiefe · Dichtungen · U-Wert · ggf. Beschlag). Laien verstehen jetzt, warum „7 Kammern" besser dämmen.
- ✅ **Footer-Jahr** auf allen 9 Seiten von 2025 auf 2026 aktualisiert (index.html hatte bereits 2026).

### Offen (defer auf nach Launch)

- **Mega-Menu auf alle Seiten verbreiten** (produkte/kontakt/konfigurator/ueber-uns/Produktseiten): aktuell nur auf index.html. Flache Nav auf anderen Seiten funktioniert für Launch. Nach Launch als sauberer Refactor (JS-Include).
- **Realistische Farb-Fotos** statt SVG-Schema für Profil-Farben-Sektion: nach Launch mit Pollinations oder Drutex-Assets austauschen.
- **Querschnitt-Fotos/Renderings** von Drutex anfragen: SVG-Schema reicht für Launch, echte Drutex-Querschnitt-PDFs als PNG exportieren wäre aber noch überzeugender.

### Neue Dateien

- `js/profil-farben.js` (65 Zeilen, Hover-Preview Logik)
- `css/produktseiten.css` (+ 90 Zeilen für Profil-Farben, + 30 Zeilen für Querschnitt)

---

## 🆕 Session 24.04. nachmittags 1 – 3 Produktseiten + CLAUDE.md-Fix

- ✅ **`produkte/haustueren/iglo-5-classic.html`** nach neuem Template neu gebaut
  - Drutex-Cover-Video `drzwi-iglo-5-cover.mp4` als Hero-Hintergrund
  - Sticky Produkt-Video `drzwi_iglo_5.mp4` rechts
  - Tech-Tabelle: Ud 1,0, 5/3 Kammern, 70mm, 2 EPDM, 40+ Dekorblenden, 30+ Farben, dB 34, thermisch getrennte Alu-Schwelle, 3-fach-Getriebe
  - Vergleich-2er: IGLO 5 Classic (hervorgehoben „Sie sind hier") vs IGLO Energy
  - Vorgänger war alte Template-Version mit Bild-Hero und Key-Fact-Boxen — ersetzt

- ✅ **`produkte/balkontueren/iglo-5-classic.html`** neu gebaut (Option A gewählt — eigene Balkontür-Seiten)
  - Nutzt IGLO 5 Classic Fenster-Videos (Cover + Produkt), da Drutex keine eigenen Balkontür-Videos hat
  - Tech-Tabelle: Uw ab 0,83, 5 Kammern, 70mm, 2 EPDM, dB 42, Dreh-Kipp, 3 Schwellen-Varianten
  - Schwellen-Varianten: Standard · Alu niedrig · Null-Schwelle DIN 18040
  - Vergleich-2er: IGLO 5 Classic (hervorgehoben) vs IGLO Energy Balkontür

- ✅ **`produkte/balkontueren/iglo-energy.html`** neu gebaut
  - Nutzt IGLO Energy Fenster-Videos (Cover + Produkt winchester)
  - Tech-Tabelle: Uw ab 0,71 (Passivhaus), 7 Kammern, 82mm, 3 EPDM, dB 46, KfW-förderfähig
  - Vergleich-2er: IGLO Energy (hervorgehoben) vs IGLO 5 Classic Balkontür

- ✅ **`CLAUDE.md` PSK-Regel korrigiert** — alte falsche Regel „IGLO 5 PSK existiert nicht" ersetzt durch die 4 echten Produkte (IGLO 5 Classic PSK, IGLO Energy PSK, IGLO Slide, IGLO-HS)

### Balkontür-Strategie-Entscheidung 24.04. nachmittags
Option A gewählt: Eigene Balkontür-Seiten pro Profil (statt nur Hinweis-Block auf Fenster-Seiten). Grund: SEO (eigene Suchanfragen „Balkontür kaufen"), andere Kaufintention (Schwelle, barrierefrei), andere Default-Maße.

### Damit sind alle Produktseiten fertig
**4 Kategorien × Profile = 9 Produktseiten:**
- Kunststofffenster: IGLO 5 Classic · IGLO Energy (2) ✅
- Haustüren: IGLO 5 Classic · IGLO Energy (2) ✅
- Balkontüren: IGLO 5 Classic · IGLO Energy (2) ✅
- Hebe-Schiebetüren: IGLO-HS · IGLO Slide · IGLO 5 Classic PSK · IGLO Energy PSK (4) — Anmerkung: 3 Türen hier, nicht 2
Gesamt: 10 fertige Produktseiten.

---

## 1. Was FERTIG ist

### Seiten live/fertig
- ✅ **`index.html`** – Startseite
  - Hero mit Drutex Firmen-Animation-Video (Cover-Video als Hintergrund)
  - Honest Stats: 24 Jahre / 4,2★ / 10 J. Garantie / 14 Tage Lieferzeit
  - Mega-Menu 2-Level (Drutex-Style): links 4 Kategorien, rechts Systeme
  - Click-to-pin auf Mega-Menu + ESC/Outside-Click schließt
  - Reviews-Slider (2 echte Google-Reviews + 4 Platzhalter)
  - Drutex-Partner-Section entfernt (war 4× redundant)
  - Produkt-Cards-Section entfernt (war Doppelung zum Mega-Menu)
  - Schema.org: HomeAndConstructionBusiness + AggregateRating

- ✅ **`konfigurator.html`** – 6-Schritte-Konfigurator
  - Bug „Löschen auf Bestellübersicht" gefixt (confirm() → In-App-Modal)
  - Bug „Klick auf Produkt scrollt nicht zu System-Schritt" gefixt (manueller scrollTo mit -120px Offset)
  - DX-Tür-Thumbnail-Mismatch gefixt (Keys `dx-01` statt `dx01`)

- ✅ **`produkte.html`** – Produktkatalog

- ✅ **`agb.html`** – 10 Sections + Widerrufsbelehrung + Muster-Widerrufsformular

- ✅ **`kontakt.html`**

- ✅ **`dashboard.html`** – Admin

### Produktseiten nach Template (Struktur etabliert 22.04.2026)

- ✅ **`produkte/kunststofffenster/iglo-5-classic.html`** – PRODUKTSEITEN-TEMPLATE
  - Hero: `iglo-5-classic-cover.mp4` als Hintergrund
  - Tech-Tabelle: 5 Kammern, Uw 0.83, 70mm, dB 34-42, 2 EPDM, Klasse A
  - Vergleich IGLO 5 Classic vs IGLO Energy (Classic hervorgehoben)

- ✅ **`produkte/kunststofffenster/iglo-energy.html`**
  - Hero: `okna-iglo-energy-cover.mp4`
  - Werte: dB 37-46, 3 EPDM, Uw 0.71, 7 Kammern, 82mm, A

- ✅ **`produkte/haustueren/iglo-energy.html`** *(neu 24.04.2026)*
  - Hero: Drutex `drzwi-iglo-energy-cover.mp4`
  - Produkt-Video: `drzwi_iglo_energy.mp4`
  - Werte: Ud ab 0,8 W/(m²K), 7 Kammern, 82mm, 44mm Türblatt, 5-Punkt-Verriegelung (RC2 optional), 38 dB
  - Vergleich: Energy (hervorgehoben) vs IGLO 5 Classic Haustür

- ✅ **`produkte/hebe-schiebetueren/iglo-hs.html`** *(neu 24.04.2026)*
  - Hero: Drutex `header_video/iglo_hs.mp4`
  - Produkt-Video: `iglo_hs_animacja_-_niemiecka_-_22-05-2020_web.mp4`
  - Werte: Uw 0,71, Ug 0,5 (3-fach+Argon), 7 Kammern, 194mm, Flügel bis 400 kg, max. ~6500×2700mm, G-U Beschlag, Null-Schwelle DIN 18040
  - Vergleich-3er: PSK · IGLO Slide · IGLO-HS (hervorgehoben)

- ✅ **`produkte/hebe-schiebetueren/iglo-slide.html`** *(neu 24.04.2026)*
  - Hero: Drutex `iglo-slide-header.mp4`
  - Produkt-Video: `iglo-slide.mp4`
  - Werte: Ug 1,1, 3 Kammern, 82mm, 24mm Scheibenpaket, Siegenia-Beschlag, bis ~4000mm, V-Perfect-Schweißnaht
  - ⚠️-Hinweis in Tabelle: „nicht für Passivhaus-Standards" (Drutex-Originaltext)
  - Vergleich-3er: PSK · IGLO Slide (hervorgehoben) · IGLO-HS

- ✅ **`produkte/hebe-schiebetueren/iglo-5-classic-psk.html`** *(neu 24.04.2026)*
  - Hero: Drutex `drzwi-iglo5-psk/psk-iglo-5-cover.mp4`
  - Produkt-Video: `psk_iglo_5_classic/video/psk-iglo-5-classic-cover.mp4`
  - Werte: **Uw 0,81 W/(m²K)** (Drutex-Referenzwert), Ug 1,1, 5 Kammern, 70mm, 2 Dichtungen, 24–40mm, MACO SKB-S, Flügel bis 160 kg, 75mm Ansichtsbreite, 4 Schienenfarben
  - Vergleich-2er: IGLO 5 Classic PSK (hervorgehoben) vs IGLO Energy PSK + Cross-Links zu Slide/HS

- ✅ **`produkte/hebe-schiebetueren/iglo-energy-psk.html`** *(neu 24.04.2026)*
  - Hero: Drutex `iglo-psk/psk-iglo-energy-cover.mp4`
  - Produkt-Video: `iglo_pks/video/iglo_uchylno_przesowne.mp4`
  - Werte: **Uw 0,65 W/(m²K)** (Passivhaus-Niveau), Ug 1,1, 7 Kammern, 82mm, 3 Dichtungen, 24–48mm, MACO SKB-S, Flügel bis 160 kg
  - Vergleich-2er: IGLO Energy PSK (hervorgehoben) vs IGLO 5 Classic PSK + Cross-Links zu Slide/HS

### Dokumentation fertig
- ✅ `CLAUDE.md` – komplette Anweisungsdatei (erweitert 22.04.)
- ✅ `BROWSER-REGELN.md` – Goldene Regel, Domain-Ampel, Prompt-Injection-Schutz
- ✅ `PROJEKTE.md` – 3-Projekte-Übersicht
- ✅ `data/bilder-katalog.json` – 91 Projekt-Bilder Wahrheitsquelle
- ✅ `BILDER-INVENTAR.md`
- ✅ `DESIGN-SKILLS.md`
- ✅ `KONFIGURATOR-RESEARCH.md`
- ✅ `KONFIGURATOR-AUDIT.md`

---

## 2. Was OFFEN ist (Priorität)

### 🔴 HOCH – diese Woche angehen

1. ~~**Produktseiten fertig bauen (3 offen)**~~ ✅ ERLEDIGT 24.04. nachmittags
   - ~~`produkte/haustueren/iglo-5-classic.html`~~ ✅
   - ~~`produkte/balkontueren/iglo-5-classic.html`~~ ✅ (Option A)
   - ~~`produkte/balkontueren/iglo-energy.html`~~ ✅ (Option A)

2. ~~**CLAUDE.md Schiebetür-Logik korrigieren**~~ ✅ ERLEDIGT 24.04. nachmittags

3. **Self-Check der 8 neuen / geänderten Produktseiten** (Sarah im Browser öffnen)
   - Neue Seiten 24.04. früh: iglo-hs, iglo-slide, iglo-5-classic-psk, iglo-energy-psk, haustueren/iglo-energy
   - Neue Seiten 24.04. nachmittags: haustueren/iglo-5-classic, balkontueren/iglo-5-classic, balkontueren/iglo-energy
   - Alle Drutex-Videos spielen korrekt?
   - Mobile-Ansicht OK?
   - Vergleich-Blöcke plausibel?
   - Tech-Werte vs. Drutex-Händler-Katalog gegenprüfen

4. **SEO-Pass über alle Produktseiten**
   - Meta-Tags (Title, Description), Open Graph, Schema.org Product
   - Interne Verlinkung zwischen den Seiten (aktuell nur im Vergleich-Block)

### 🟡 MITTEL

4. **SEO-Pass über alle Seiten**
   - Meta-Tags, Description, Open Graph, Title
   - Schema.org Product auf Produktseiten

5. **3D-Konfigurator Three.js** statt nur SVG-Vorschau
   - Aktuell: SVG-Stub im Konfigurator
   - Ziel: rotierbare 3D-Fenster-Vorschau

6. **Compliance-Wächter**
   - DSGVO-Konformität check
   - Impressum finalisieren
   - Drutex-Normen-Einhaltung (DRUTEX-REGELN.md bestätigen)

### 🟢 NIEDRIG / NICE-TO-HAVE
7. Email-Automation über n8n (Angebotsanfrage-Workflow)
8. Blog-/Ratgeber-Bereich
9. Video-Content (TikTok-Repurpose für Website)

---

## 3. Known-Working Drutex-Video-URLs

Alle URLs in Browser-Session 22.–24.04.2026 verifiziert. Direktverlinkung funktioniert im Besucher-Browser. Sandbox-curl blockiert — nicht selbst herunterladen.

### Fenster (PVC)
| System | Cover-Video | Produkt-Video |
|--------|-------------|---------------|
| IGLO 5 Classic | `drutex.de/media/_upload/produkty/iglo5-classic/iglo-5-classic-cover.mp4` | `drutex.de/media/_upload/produkty/iglo5-classic/video/iglo_5_classic.mp4` |
| IGLO Energy | `drutex.de/media/_upload/produkty/IGLO_ENERGY/okna-iglo-energy-cover.mp4` | `drutex.de/media/_upload/produkty/IGLO_ENERGY/video/iglo_energy_anim_winchester.mp4` |
| IGLO 5 (Firmen-Animation) | `drutex.de/media/_upload/sections/movie-block/1920x940-firma-animacja_02.mp4` | — |

### Haustüren (PVC) *(neu 24.04.)*
| System | Drutex-URL | Cover-Video | Produkt-Video |
|--------|------------|-------------|---------------|
| IGLO Energy Haustür | `/de/produkte/iglo-energy-turen-pvc.html` | `drutex.de/media/_upload/produkty/drzwi-iglo-energy/drzwi-iglo-energy-cover.mp4` | `drutex.de/media/_upload/produkty/drzwi-iglo-energy/video/drzwi_iglo_energy.mp4` |
| IGLO 5 Haustür | `/de/produkte/iglo5-tur-pvc.html` | `drutex.de/media/_upload/produkty/drzwi-iglo5/drzwi-iglo-5-cover.mp4` | `drutex.de/media/_upload/produkty/drzwi-iglo5/video/drzwi_iglo_5.mp4` |

### Hebe-Schiebetüren *(neu 24.04.)*
| System | Drutex-URL | Cover-Video | Produkt-Video |
|--------|------------|-------------|---------------|
| IGLO-HS | `/de/produkte/iglo-hs.html` | `drutex.de/media/_upload/header_video/iglo_hs.mp4` | `drutex.de/media/_upload/produkty/iglo-hs/video/iglo_hs_animacja_-_niemiecka_-_22-05-2020_web.mp4` |
| IGLO Slide | `/de/produkte/iglo-slide.html` | `drutex.de/media/_upload/produkty/iglo-slide/header/iglo-slide-header.mp4` | `drutex.de/media/_upload/produkty/iglo-slide.mp4` |
| IGLO 5 Classic PSK | `/de/produkte/iglo-5-classic-psk.html` | `drutex.de/media/_upload/produkty/drzwi-iglo5-psk/psk-iglo-5-cover.mp4` | `drutex.de/media/_upload/produkty/psk_iglo_5_classic/video/psk-iglo-5-classic-cover.mp4` |
| IGLO Energy PSK | `/de/produkte/iglo-energy-psk.html` | `drutex.de/media/_upload/produkty/iglo-psk/psk-iglo-energy-cover.mp4` | `drutex.de/media/_upload/produkty/iglo_pks/video/iglo_uchylno_przesowne.mp4` |

### Balkontüren
Drutex hat **keine eigenen Balkontür-Produkte/Videos** — Balkontür = Fenster-Profil in Tür-Ausführung. Bei Bedarf Fenster-Videos (IGLO 5 Classic / IGLO Energy) im Hero verwenden.

---

## 4. Kontakt- und Geschäfts-Daten (Fensterhandel Christ)

- **Firma:** Fensterhandel Christ
- **Adresse:** Fohrder Landstraße 13, 14772 Brandenburg an der Havel
- **Tel:** 03381/2148373
- **Email:** info@baustoffchrist.de
- **Google-Bewertung:** 4,2★ bei 110 Rezensionen
- **Aktiv seit:** 2002 (24 Jahre)

---

## 5. Bekannte Bugs & Fixes (für spätere Regressionen)

| Bug | Ort | Fix |
|-----|-----|-----|
| `confirm()` blockiert in manchen Kontexten | konfigurator.html Bestellübersicht | In-App-Modal + index-Fallback für Items ohne ID |
| `openS()` scrollt nicht richtig | konfigurator.html System-Schritt | Manueller `scrollTo` mit -120px Offset für sticky Header, am Anfang von `pickProd()` |
| Thumbnail-Mismatch | TUER_IMGS Map | Keys auf `dx-01` vereinheitlicht statt `dx01` |
| Fake-Stats „2.500+ Kunden" | index.html | Ersetzt durch ehrliche 24 Jahre / 4,2★ / 10 J. Garantie / 14 Tage |
| Broken Google-AI-Image-URLs | index.html | komplett ersetzt |
| Tech-Spec-Boxen unsichtbar auf Video | Produktseiten Hero | Hintergrund `rgba(14,30,58,0.55)` + text-shadow — dann ganz entfernt |
| ~~„IGLO 5 PSK" existiert nicht~~ | ~~Logik~~ | **KORREKTUR 24.04.**: Die Annahme war falsch. Drutex hat IGLO 5 CLASSIC PSK, IGLO 5 PSK, IGLO ENERGY PSK, IGLO ENERGY CLASSIC PSK als echte Produkte mit eigenen Seiten und Videos. |
| Falsch benannte Platzhalter-Dateien | `hebe-schiebetueren/iglo-5-classic-psk.html` + `iglo-energy-psk.html` (alte Platzhalter-Versionen) | Am 24.04. gelöscht und durch neue Template-basierte Versionen mit echten Drutex-Daten ersetzt |

---

## 6. Technische Fakten

- **Sandbox-Netzwerk** blockiert curl-Download von drutex.de / meinfenster24.de / deinefenster.de — Direktverlinkung im Besucher-Browser funktioniert.
- **Pollinations.ai** (KI-Bilder ohne Login): `https://image.pollinations.ai/prompt/ENCODED?width=1200&height=900&model=flux&nologo=true&seed=NUMBER`
- **Prompt-Vorlage Drutex-Katalog-Stil:** „product catalog photography of [PRODUCT], minimal clean beige plastered wall, architectural product rendering, studio lighting, Drutex manufacturer catalog style, frontal view, neutral background, professional commercial photography"
- **Stack:** Vanilla HTML + Tailwind CDN + Vanilla JS, kein Build-Step.
- **Tailwind-CDN-Warnung** in der Browser-Konsole („cdn.tailwindcss.com should not be used in production") ist **nur Hinweis, kein Fehler** — bewusste Projekt-Entscheidung (kein Build-Step). Später Upgrade möglich wenn Traffic wächst.
- **Deploy:** Vercel.
- **Branch:** `cowork-agentenaufbau` (nicht direkt auf main pushen).

---

## 7. Letzte Sarah-Entscheidungen

### 24.04.2026
- **Schiebetür-Logik korrigiert (v2):** Es gibt sehr wohl IGLO 5 Classic PSK und IGLO Energy PSK als echte Drutex-Produkte. STAND.md + CLAUDE.md PSK-Regel ist zu fixen. Wir bauen 2 PSK-Seiten (nicht eine generische).
- **Falsch benannte PSK-Platzhalter gelöscht** und durch Template-Seiten mit echten Drutex-Daten ersetzt.
- **5 Produktseiten neu gebaut** nach bestehendem Template (Haustür IGLO Energy, IGLO-HS, IGLO Slide, IGLO 5 Classic PSK, IGLO Energy PSK).
- **Reihenfolge für Produktseiten:** Erst echte-Drutex-Daten-Seiten (Haustür/Schiebe), danach Balkontür (weil dort keine eigenen Drutex-Assets existieren).
- **Drutex-URL-Sandbox-Fehler:** Die alte Annahme „iglo-5-psk.html existiert nicht" kam durch Falsch-Erraten der URL. Die richtige URL ist `iglo-5-classic-psk.html` mit Bindestrich zwischen iglo und 5.
- **Balkontür-Strategie noch offen:** Claude empfiehlt eigene Balkontür-Seiten pro Profil (wie meinfenster24.de und alle Konkurrenten machen), weil:
  - SEO: „Balkontür IGLO Energy" ist eigene Google-Suchanfrage
  - Kauf-Intention: Balkontür-Käufer haben andere Fragen (Schwelle, barrierefrei)
  - Konfigurator-Defaults: Mindesthöhe 1800mm etc.
  - Videos können Fenster-Videos sein (Profil ist identisch).
  - **→ Sarah entscheidet noch** ob wir Balkontür-Seiten bauen.

### 22.04.2026
- Tech-Spec-Ecken-Klammern-Boxen aus Hero raus (sind unten in Tabelle).
- Produkt-Cards von Startseite entfernen — Mega-Menu übernimmt das.
- Mega-Menu 2-Level Drutex-Style statt 4 flacher Spalten.
- ~~Schiebetür-Logik korrigiert: PSK / IGLO Slide / IGLO-HS (nicht „IGLO 5 PSK")~~ **überholt durch 24.04.-Entscheidung**
- Drutex-Partner-Section ist 4× redundant → raus.
- Pollinations.ai für neutrale Drutex-Katalog-Stil-Bilder.
- Claude in Chrome ist eingerichtet (Zweitaccount für Sicherheit).
- Hero-Video-Overlay von 0.88 → 0.35 (Video muss sichtbar sein).

---

## 8. Git-Checkpoint

Sarah muss selbst commiten. Vorschlag:
```
git add -A
git commit -m "24.04. 5 neue Produktseiten (Haustür Energy + IGLO-HS + IGLO Slide + IGLO 5/Energy PSK) mit echten Drutex-Videos + STAND.md-Update"
```

### Neu angelegte/geänderte Dateien heute (24.04.):
- `produkte/haustueren/iglo-energy.html` (überschrieben, war Platzhalter)
- `produkte/hebe-schiebetueren/iglo-hs.html` (neu)
- `produkte/hebe-schiebetueren/iglo-slide.html` (überschrieben, war Platzhalter)
- `produkte/hebe-schiebetueren/iglo-5-classic-psk.html` (neu; Vorgänger gelöscht)
- `produkte/hebe-schiebetueren/iglo-energy-psk.html` (neu; Vorgänger gelöscht)
- `STAND.md` (diese Datei)

---

## 9. Wie's weitergeht (nächste Session)

Priorität nach STAND.md Sektion 2:
1. **Haustür IGLO 5 Classic** bauen — Drutex-Videos schon gefunden, direkt nach Template.
2. **Balkontür-Strategie mit Sarah besprechen** (Option A: 2 eigene Seiten pro Profil / Option B: nur Hinweis auf Fenster-Seite).
3. **CLAUDE.md PSK-Regel korrigieren** (Z. 138–144).
4. **Self-Check** aller neuen Seiten im Browser.
