# DeineFenster.de – Bilder generieren mit Gemini

## So rufst du das Script auf

Öffne das Terminal, gehe in den Projektordner, dann:

```bash
cd "/Users/buissnesaccount/deinefenster Website"
python3 scripts/generate-image.py --prompt "DEINE BESCHREIBUNG" --output DATEINAME
```

Das Bild wird automatisch in `/img/masters/sarah/` gespeichert.

---

## Die 3 fehlenden Master-Bilder generieren

### 1. Balkontür (2-balkontur.png)

```bash
python3 scripts/generate-image.py \
  --prompt "modern white PVC balcony door, floor-to-ceiling glass, tilt-and-turn hardware, Drutex IGLO plastic door, interior living room view, white frame" \
  --output 2-balkontur
```

### 2. Haustür (3-haustur.png)

```bash
python3 scripts/generate-image.py \
  --prompt "modern white PVC front entry door, clean minimal design, stainless steel handle, sidelight glass panels, Drutex entrance door, exterior view daylight" \
  --output 3-haustur
```

### 3. Hebe-Schiebetür (4-hebe-schiebeture.png)

```bash
python3 scripts/generate-image.py \
  --prompt "modern white PVC sliding patio door, large glass panels, sliding track visible, Drutex IGLO-HS sliding door, interior garden view, clean minimal" \
  --output 4-hebe-schiebeture
```

---

## Mit Referenzbild (gleicher Stil wie 1-fenster.png)

Wenn du willst dass das neue Bild exakt wie das Fenster-Referenzbild aussieht:

```bash
python3 scripts/generate-image.py \
  --prompt "modern white PVC balcony door" \
  --output 2-balkontur \
  --reference img/masters/sarah/1-fenster.png \
  --model gemini-2.0-flash-preview-image-generation
```

---

## Modelle erklärt

| Modell | Wann verwenden |
|--------|----------------|
| `imagen-3.0-generate-002` | Standard – beste Qualität für Produktfotos (kein Referenzbild) |
| `gemini-2.0-flash-preview-image-generation` | Wenn du ein Referenzbild für den Stil angibst |

---

## Tipps für gute Prompts

- **Immer auf Englisch** – Gemini versteht englische Prompts am besten
- **Farbe nennen:** "white", "anthracite gray", "golden oak"
- **Perspektive:** "frontal view", "interior view", "exterior view"
- **Hintergrund:** "neutral white background" oder "modern living room interior"
- **Kein Logo, keine Texte** in der Beschreibung

## Probleme?

**API-Key Fehler:** Prüfe ob `.env` im Projektordner vorhanden ist und `GEMINI_API_KEY=dein-key` enthält.

**Modell nicht verfügbar:** Manchmal ist Imagen 3 für bestimmte API-Keys noch nicht freigeschaltet. Dann probier `--model gemini-2.0-flash-preview-image-generation`.

**Bild sieht schlecht aus:** Mehr Details im Prompt + "professional product photography, high resolution" hinzufügen.
