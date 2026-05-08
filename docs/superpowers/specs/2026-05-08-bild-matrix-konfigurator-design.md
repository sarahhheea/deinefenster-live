# Bild-Matrix Konfigurator — Design Spec

**Stand:** 2026-05-08
**Ziel:** Ein einheitlicher AI-Stil für ALLE Produktbilder im Konfigurator. Jedes Produkt × Ansicht × Flügeltyp × Farbe × Anschlag muss ein konsistentes, hochwertiges Bild haben.
**Ansatz:** AI-Master (weiß) pro Variante generieren → LAB-basierte Recoloring-Pipeline erzeugt alle 45 Farbvarianten + Anschlag-Flips automatisch.

---

## 1. Ansicht-Regeln pro Produkttyp

### Fenster + Balkontür
| Ansicht | Sichtbar | NIE sichtbar |
|---------|----------|-------------|
| **Innen** | Griff (Klinke), Scharniere (Bänder), Dichtung (schwarz oder grau) | — |
| **Außen** | Nur Rahmen + Glas, glatte Profilaußenseite | Griff, Scharniere, Dichtung |

### Haustür
| Ansicht | Sichtbar | NIE sichtbar |
|---------|----------|-------------|
| **Innen** | Klinke (Drücker), 3 Bandscharniere, Türdesign (Glasausschnitt, Paneele) | — |
| **Außen** | Stoßgriff oder Türgriff, Türdesign (Glasausschnitt, Paneele, Inox-Elemente) | Scharniere NIEMALS |

### HST / Schiebetür
| Ansicht | Sichtbar | NIE sichtbar |
|---------|----------|-------------|
| **Innen** | Schiebegriff, Schiene unten, Rahmen + Glas | — |
| **Außen** | Rahmen + Glas, Schiene — fast identisch zu Innen | Griff |

### DIN-Konsistenz (gilt für ALLE Produkte)
Wenn Außen Stoßgriff/Griff rechts → Innen Klinke links, Scharniere rechts.
Immer gegenüberliegend. Muss in JEDEM Bildpaar stimmen.

---

## 2. Anschlag / Öffnungsart → Bild-Einfluss

### Fenster + Balkontür (1-Flügel)
| Öffnungsart | Code | Innen-Bild | Außen-Bild |
|-------------|------|-----------|-----------|
| DK-Links / Dreh-Links | `dk-l`, `dreh-l` | Griff rechts, Scharniere links = **Standard-Master** | 1 Außen-Master (kein Griff/Scharnier sichtbar) |
| DK-Rechts / Dreh-Rechts | `dk-r`, `dreh-r` | Griff links, Scharniere rechts = **Horizontaler Flip** | = gleicher Außen-Master |
| Kipp | `kipp` | Griff oben = **Separater Kipp-Master** | Separater Kipp-Außen-Master |
| Fest | `fest` | Kein Griff, keine Scharniere = **Separater Fest-Master** | Separater Fest-Außen-Master |

DK und Dreh sehen im Standbild identisch aus (Kipp-Mechanik unsichtbar).

### Fenster + Balkontür (2-Fl, 3-Fl, 4-Fl)
Öffnungsart wird per SVG-Overlay dargestellt, nicht im Produktfoto.
→ Kein Anschlag-Einfluss auf Bild.

### Haustür
| Richtung | Innen | Außen |
|----------|-------|-------|
| DIN-Links | Klinke links, Scharniere rechts = **Master** | Stoßgriff rechts = **Master** |
| DIN-Rechts | Klinke rechts, Scharniere links = **Flip** | Stoßgriff links = **Flip** |

Asymmetrische Designs (Glas links): Flip ist korrekt — DIN-Wechsel spiegelt die gesamte Tür.

### HST
Keine Anschlagrichtung. Schiebemechanismus ist immer gleich.

---

## 3. Vollständiges Master-Bild-Inventar

### 3.1 FENSTER (Kunststoff) — ohne Rolladen

**Innen-Master (18 Einträge, davon 2 Flips):**

| # | Dateiname | Variante |
|---|-----------|----------|
| 1 | `fenster_standard_v3.png` | 1-Fl DK/Dreh (Griff rechts) |
| 2 | `fenster_standard_v3_links.png` | 1-Fl Griff links → **Flip von #1** |
| 3 | `fenster_standard_v3_grau.png` | 1-Fl Griff rechts + Grau-Dichtung |
| 4 | `fenster_standard_v3_rechts.png` | 1-Fl Griff links + Grau-Dichtung → **Flip von #3** |
| 5 | `fenster_kipp_v3.png` | 1-Fl Kipp (Griff oben) |
| 6 | `fenster_fest_v3.png` | 1-Fl Fest (kein Griff/Scharniere) |
| 7 | `fenster_2fluegel_v3.png` | 2-Flügel |
| 8 | `fenster_3fluegel_v3.png` | 3-Flügel |
| 9 | `fenster_4fluegel_v3.png` | 4-Flügel |
| 10 | `fenster_oberlicht_v3.png` | 1-Fl + Oberlicht |
| 11 | `fenster_2fluegel_oberlicht_v3.png` | 2-Fl + Oberlicht |
| 12 | `fenster_3fluegel_oberlicht_v3.png` | 3-Fl + Oberlicht |
| 13 | `fenster_unterlicht_v3.png` | 1-Fl + Unterlicht |
| 14 | `fenster_2fluegel_unterlicht_v3.png` | 2-Fl + Unterlicht |
| 15 | `fenster_3fluegel_unterlicht_v3.png` | 3-Fl + Unterlicht |
| 16 | `fenster_ober_unter_v3.png` | 1-Fl + Ober + Unter |
| 17 | `fenster_2fluegel_ober_unter_v3.png` | 2-Fl + Ober + Unter |
| 18 | `fenster_3fluegel_ober_unter_v3.png` | 3-Fl + Ober + Unter |

Davon sind #2, #4 Pipeline-Flips (kein AI nötig).
**AI-Master: 16**

**Außen-Master (15):**

| # | Dateiname | Variante |
|---|-----------|----------|
| 1 | `fenster_aussen_v3.png` | 1-Fl Standard |
| 2 | `fenster_kipp_aussen_v3.png` | 1-Fl Kipp |
| 3 | `fenster_fest_aussen_v3.png` | 1-Fl Fest |
| 4 | `fenster_2fluegel_aussen_v3.png` | 2-Fl |
| 5 | `fenster_3fluegel_aussen_v3.png` | 3-Fl |
| 6 | `fenster_4fluegel_aussen_v3.png` | 4-Fl |
| 7 | `fenster_oberlicht_aussen_v3.png` | 1-Fl + Oberlicht |
| 8 | `fenster_2fluegel_oberlicht_aussen_v3.png` | 2-Fl + Oberlicht |
| 9 | `fenster_3fluegel_oberlicht_aussen_v3.png` | 3-Fl + Oberlicht |
| 10 | `fenster_unterlicht_aussen_v3.png` | 1-Fl + Unterlicht |
| 11 | `fenster_2fluegel_unterlicht_aussen_v3.png` | 2-Fl + Unterlicht |
| 12 | `fenster_3fluegel_unterlicht_aussen_v3.png` | 3-Fl + Unterlicht |
| 13 | `fenster_ober_unter_aussen_v3.png` | 1-Fl + Ober + Unter |
| 14 | `fenster_2fluegel_ober_unter_aussen_v3.png` | 2-Fl + Ober + Unter |
| 15 | `fenster_3fluegel_ober_unter_aussen_v3.png` | 3-Fl + Ober + Unter |

Außen: kein Anschlag-Unterschied (keine Griffe/Scharniere sichtbar).
**AI-Master: 15**

**Fenster ohne Rolladen gesamt: 31 AI-Master**

### 3.2 FENSTER MIT ROLLADEN

Gleiche Varianten wie 3.1, aber mit Rolladen-Kasten oben drauf.

**Innen mit Rolladen:**
Gleiche Varianten wie ohne Rolladen, MINUS Kipp, Fest und Grau-Dichtung (kein Rolladen nötig/sinnvoll).
Verbleibend: 1-Fl, 2-Fl, 3-Fl, 4-Fl + alle Oberlicht/Unterlicht/Ober-Unter Kombis = **13 AI-Master** (Flips automatisch).

> **Offene Frage:** Oberlicht + Rolladen — Rolladen sitzt ÜBER dem Oberlicht. Ober+Unter evtl. ebenfalls problematisch. Falls diese entfallen: 13 → 7. Siehe Frage #4.

**Außen mit Rolladen (13):**
Gleiche 13 Varianten wie Innen.
= **13 AI-Master**

**Fenster mit Rolladen gesamt: 26 AI-Master** (oder 14 falls Oberlicht/Ober-Unter entfallen)

### 3.3 BALKONTÜR

**Ohne Rolladen:**
| # | Dateiname | Variante | AI nötig? |
|---|-----------|----------|-----------|
| 1 | `balkontuer_standard_v3.png` | 1-Fl Innen (Griff rechts) | NEU |
| 2 | `balkontuer_aussen_v3.png` | 1-Fl Außen | NEU |
| 3 | `balkontuer_2fl_v3.png` | 2-Fl Innen | NEU |
| 4 | `balkontuer_2fl_aussen_v3.png` | 2-Fl Außen | NEU |

Anschlag: 1-Fl Griff-Links = Flip von #1.
**AI-Master: 4**

**Mit Rolladen:**
| # | Variante | Innen | Außen |
|---|----------|:-----:|:-----:|
| 1 | 1-Fl + Rolladen | NEU | NEU |
| 2 | 2-Fl + Rolladen | NEU | NEU |

**AI-Master: 4**

**Balkontür gesamt: 8 AI-Master**

### 3.4 HAUSTÜR

**Generische Master (ohne konkretes Modell gewählt):**
| # | Variante | Innen | Außen |
|---|----------|:-----:|:-----:|
| 1 | 1-Flügel | NEU | NEU |
| 2 | Seitenteil links | NEU | NEU |
| 3 | Seitenteil rechts | NEU | NEU |
| 4 | 2-Flügel | NEU | NEU |

DIN-Rechts = Flip von DIN-Links für jede Variante.
**AI-Master: 8**

**14 Modell-spezifische Master (Innen + Außen je Modell):**
| # | Modell | Innen | Außen |
|---|--------|:-----:|:-----:|
| 1 | Florida (L/R) Inox | NEU | NEU |
| 2 | Montana 1 Inox | NEU | NEU |
| 3 | Montana 2 L/R Inox | NEU | NEU |
| 4 | Montana 3 L/R Inox | NEU | NEU |
| 5 | Ohio Inox | NEU | NEU |
| 6 | Colorado Inox | NEU | NEU |
| 7 | Alaska 1 Inox | NEU | NEU |
| 8 | Alaska 2 Inox | NEU | NEU |
| 9 | Nebraska (L/C/R) Inox | NEU | NEU |
| 10 | Pennsylvania 1 Inox | NEU | NEU |
| 11 | Pennsylvania 2 L/R Inox | NEU | NEU |
| 12 | Pennsylvania 3 L/R Inox | NEU | NEU |
| 13 | Texas (Mittig) Inox | NEU | NEU |
| 14 | Texas (L/R) Inox | NEU | NEU |

Pro Modell: Innen (Klinke + 3 Scharniere + Türdesign) + Außen (Stoßgriff + Türdesign, keine Scharniere).
DIN-Rechts = Flip.
**AI-Master: 28**

**Haustür gesamt: 36 AI-Master**

### 3.5 HST / SCHIEBETÜR

**Ohne Rolladen:**
| # | System | Innen | Außen |
|---|--------|:-----:|:-----:|
| 1 | HS (Hebe-Schiebe) | NEU | NEU |
| 2 | PSK (Parallel-Schiebe-Kipp) | NEU | NEU |
| 3 | IGLO Slide | NEU | NEU |

**AI-Master: 6**

**Mit Rolladen:**
| # | System | Innen | Außen |
|---|--------|:-----:|:-----:|
| 1 | HS + Rolladen | NEU | NEU |
| 2 | PSK + Rolladen | NEU | NEU |
| 3 | Slide + Rolladen | NEU | NEU |

**AI-Master: 6**

**HST gesamt: 12 AI-Master**

### 3.6 ROLLADEN (Optionsbilder)

| # | Bild | Zweck |
|---|------|-------|
| 1 | Fenster + Gurt | Thumbnail für Rolladen-Optionskarte |
| 2 | Fenster + Motor | Thumbnail für Rolladen-Optionskarte |
| 3 | Balkontür + Gurt | Thumbnail |
| 4 | Balkontür + Motor | Thumbnail |
| 5 | HST + Gurt | Thumbnail |
| 6 | HST + Motor | Thumbnail |

Diese sind Optionsbilder ohne Farbvarianten.
**AI-Bilder: 6**

---

## 4. Gesamtrechnung

| Kategorie | AI-Master | × 45 Farben | + Flips | Summe |
|-----------|:---------:|:-----------:|:-------:|:-----:|
| Fenster ohne Rolladen | 31 | 1.395 | 90 | 1.485 |
| Fenster mit Rolladen | 26 | 1.170 | 45 | 1.215 |
| Balkontür ohne Rolladen | 4 | 180 | 45 | 225 |
| Balkontür mit Rolladen | 4 | 180 | 45 | 225 |
| Haustür generisch | 8 | 360 | 90 | 450 |
| Haustür 14 Modelle (I+A) | 28 | 1.260 | 1.260 | 2.520 |
| HST ohne Rolladen | 6 | 270 | — | 270 |
| HST mit Rolladen | 6 | 270 | — | 270 |
| Rolladen Thumbnails | 6 | — | — | 6 |
| **TOTAL** | **119** | **5.085** | **~1.575** | **~6.666** |

**Flip-Erklärung:** Flips = DIN-Rechts-Varianten (horizontaler Spiegelbild). Haustür-Modelle haben die meisten Flips weil jedes Modell × jede Ansicht × jede Farbe gespiegelt wird.

> **Optimierung:** Flips können statt als gespeicherte Dateien auch per CSS `transform: scaleX(-1)` zur Laufzeit erzeugt werden. Das spart ~1.575 Dateien und reduziert die Gesamtzahl auf ~5.091. Empfehlung: CSS-Flip für Haustüren, gespeicherte Flips nur für Fenster/Balkontür 1-Fl (wo die Flip-Anzahl überschaubar ist).

**119 AI-Master + ~5.085 Farbvarianten + ~1.575 Flips = ~6.670 Bilder gesamt** (oder ~5.091 mit CSS-Flips).

---

## 5. Recoloring-Pipeline (NEU zu entwickeln)

### 5.1 Ablauf
```
Master (weiß, 1024×1280) 
  → LAB-Farbraum-Konvertierung
  → L-Kanal behalten (bewahrt 3D-Tiefe, Schatten, Reflexe, Licht)
  → Farbe in A/B-Kanäle injizieren (Ziel-Farbe aus Drutex-Referenz)
  → Holzdekore: Maserungstextur als Multiply-Overlay vor Recoloring
  → Zurück zu RGB → PNG speichern
  → Anschlag-Flip: horizontaler Flip wo nötig
```

### 5.2 Farbkategorien
| Kategorie | Methode | Farben |
|-----------|---------|--------|
| Weiß / Crème | Leichte Tönung | weiss, cremeweiss, weiss-fx |
| RAL Grautöne | LAB Recoloring | achatgrau, lichtgrau, signalgrau, betongrau, quarzgr-gl/sa, basaltgr-gl/sa, schiefgr-gl/sa |
| Anthrazit / Schwarz | LAB Recoloring (dunkel) | anthrazit, anthraz-gl, anthraz-um, schwarz-um, schwarzbr |
| Metallic | LAB + leichter Glanz | alux-db, alu-gebr, eisengl, crown-plat |
| Holzdekore | LAB + Maserungstextur-Overlay | sheffield, winchester, eiche-hell, eiche-nat, golden-oak, nussbaum, mooreiche, dunkleiche, siena-noce, siena-ross, mahagoni, macore, oregon, douglasie, bergkiefer, teak, schoko-br, braun-mar |
| Bunt | LAB Recoloring (Hue) | moosgruen, dunkelgr, dunkelrot, brillblau, stahlblau |
| Spezial | LAB + besondere Textur | piryt, jet-black, deep-bronze, grafitgr |

### 5.3 Drutex-Farbreferenzen
Jede Farbe muss dem Drutex-Originalfarbton entsprechen. Referenz-Hex-Werte aus `COLOR_HEX` im Konfigurator-Code. Bei Abweichung: Drutex-Website als Quelle der Wahrheit.

### 5.4 Validierung pro Bild
- [ ] Größe: 1024 × 1280 px
- [ ] Weißer Hintergrund (reines Weiß, kein Grauschleier)
- [ ] Produkt füllt ~80-92% der Canvas-Höhe
- [ ] Exakt frontal (kein Winkel)
- [ ] Keine Schatten (kein Schlag-, kein Hintergrund-)
- [ ] Innen ↔ Außen: Produkt gleich groß
- [ ] DIN-Konsistenz: Außen Griff rechts → Innen Klinke links
- [ ] Farbe stimmt mit Drutex-Referenz überein
- [ ] Holzdekore: Maserung sichtbar, nicht flach eingefärbt

---

## 6. AI-Master Qualitätsstandard

### Prompt-Anker (in JEDEM Prompt)
```
Drutex product catalog photography: isolated cutout [PRODUCT], 
frontal centered view, bright studio lighting, pure white background, 
professional architectural product rendering, no shadows no reflections 
no context.
```

### Negativ-Liste (in JEDEM Prompt)
```
NO shadow, NO ground shadow, NO drop shadow, NO reflection, 
NO background gradient, NO vignette, NO ambient occlusion,
NO floor, NO wall, NO context, NO border, NO frame,
NO hinges visible from exterior, NO handles from exterior,
NO product mounting hardware, NO glass glare distortion,
clean cutout isolated product
```

### Hardware-Anforderungen
- **Fenster/Balkontür Griffe:** Müssen wie echte Drutex-Klinken aussehen, nicht AI-generisch
- **Fenster/Balkontür Scharniere:** Realistische Bänder, silber/weiß passend zum Rahmen
- **Haustür Stoßgriff:** Edelstahl-Stangengriff (Inox-Modelle), realistisch
- **Haustür Klinke:** Standard-Türdrücker, silber
- **Haustür Bandscharniere:** 3 Stück, silber, gleichmäßig verteilt
- **HST Schiebegriff:** Flacher Einbaugriff, passend zum Profil

### Proportionen
- Produkt füllt 80-92% der Canvas-Höhe (via `process-master-image.py`)
- Horizontal zentriert
- Innen- und Außen-Master MÜSSEN exakt gleiche Produktgröße haben
- Alle Master einer Kategorie (z.B. alle 1-Fl Fenster) haben identische Proportionen

---

## 7. Dateinamens-Konvention

### Master-Bilder (weiß)
```
img/{produkt}_{variante}_{ansicht}_v4.png

Beispiele:
img/fenster_standard_v4.png              → 1-Fl Fenster Innen
img/fenster_aussen_v4.png                → 1-Fl Fenster Außen
img/fenster_2fluegel_v4.png              → 2-Fl Fenster Innen
img/fenster_2fluegel_rolladen_v4.png     → 2-Fl Fenster Innen mit Rolladen
img/balkontuer_standard_v4.png           → 1-Fl Balkontür Innen
img/balkontuer_2fl_v4.png                → 2-Fl Balkontür Innen
img/haustuer_innen_v4.png                → Haustür generisch Innen
img/haustuer_aussen_v4.png               → Haustür generisch Außen
img/haustuer_seitenteil_l_innen_v4.png   → Haustür + Seitenteil links Innen
img/haustuer_modell_florida-lr-inox_innen_v4.png  → Florida Inox Innen
img/haustuer_modell_florida-lr-inox_aussen_v4.png → Florida Inox Außen
img/hst_hs_innen_v4.png                 → HS Innen
img/hst_psk_aussen_rolladen_v4.png       → PSK Außen mit Rolladen
```

### Farbvarianten (Pipeline-Output)
```
img/farben/{produkt}_{fluegel}[_aussen]_{farbe}.png

Beispiele:
img/farben/fenster_1fl_anthrazit.png             → 1-Fl Innen Anthrazit
img/farben/fenster_1fl_aussen_anthrazit.png       → 1-Fl Außen Anthrazit
img/farben/fenster_1fl_rechts_anthrazit.png       → 1-Fl Griff-Links Anthrazit (Flip)
img/farben/fenster_2fl_rolladen_golden-oak.png    → 2-Fl Innen + Rolladen Golden Oak
img/farben/balkontuer_1fl_winchester.png          → Balkontür Innen Winchester
img/farben/haustuer_aussen_florida-lr-inox_anthrazit.png → Florida Inox Außen Anthrazit
img/farben/hst_hs_innen_betongrau.png             → HS Innen Betongrau
```

---

## 8. Phasen-Plan

### Phase 1: Kernprodukte (höchste Kundenrelevanz)
1. **Fenster 1-Fl Innen + Außen** — Master + alle 45 Farben + Flips
2. **Fenster 2-Fl Innen + Außen** — Drutex-CDN ersetzen
3. **Balkontür 1-Fl Innen + Außen** — Aktuell 0 Farbvarianten
4. **Recoloring-Pipeline entwickeln + testen**

### Phase 2: Erweiterte Fenster
5. Fenster 3-Fl, 4-Fl
6. Oberlicht / Unterlicht / Ober+Unter Varianten
7. Kipp + Fest Master

### Phase 3: Haustüren
8. 14 Modell-Master (Innen + Außen)
9. Generische Master (Seitenteil, 2-Fl)
10. Pipeline-Farben für alle Modelle

### Phase 4: HST + Rolladen
11. HS, PSK, Slide Master (Innen + Außen)
12. Alle Rolladen-Varianten (Fenster, Balkontür, HST)

### Phase 5: Balkontür 2-Fl + Feinschliff
13. Balkontür 2-Fl
14. Grau-Dichtung-Varianten
15. Qualitäts-Audit aller Bilder

---

## 9. Technische Integration

### Code-Änderungen nötig
- `PROD_IMGS_VIEW` aktualisieren: v3 → v4 Pfade
- Rolladen-Zustand in `vorschauAktualisieren()` berücksichtigen (Master MIT Rolladen laden wenn `S.roll !== 'ohne'`)
- Balkontür 2-Fl in `PROD_IMGS_VIEW.balkontuer` eintragen
- HST per-System Master statt generischem Master
- Haustür modellspezifische Innen-Bilder in `vorschauAktualisieren()` einbauen
- Neue Farb-Bilder für alle Produkte registrieren
- CDN-Fallbacks als Backup behalten, aber lokale Bilder priorisieren

### Pipeline-Skripte (neu)
- `scripts/recolor-lab.py` — LAB-basiertes Recoloring (ersetzt primitives Pillow-Tinting)
- `scripts/flip-anschlag.py` — Horizontaler Flip für Anschlag-Varianten
- `scripts/validate-bilder.py` — Größe, Farbe, Proportionen prüfen
- `scripts/generate-all.sh` — Orchestriert: Master → Pipeline → Flip → Validierung

### Bestehende Pipeline behalten
- `scripts/process-master-image.py` — Normalisierung auf 1024×1280, 92% Inhaltshöhe

---

## 10. Offene Fragen

1. **Gurt vs. Motor:** Brauchen wir separate Rolladen-Master für Gurt (mit Gurtband sichtbar) und Motor (nur Kasten)?
2. **Haustür Seitenteil × Modell:** Braucht jedes der 14 Modelle auch Seitenteil-Varianten, oder nur die generischen?
3. **4-Flügel Priorität:** Aktuell als Phase 2 eingestuft — korrekt?
4. **Oberlicht/Unterlicht + Rolladen:** Braucht Oberlicht wirklich eine Rolladen-Variante? Rolladen sitzt über dem Oberlicht — das ändert die Optik komplett.
