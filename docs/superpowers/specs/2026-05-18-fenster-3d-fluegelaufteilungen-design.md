# Fenster-3D — Flügelaufteilungen + Griff-Logik

**Datum:** 2026-05-18
**Scope:** `fenster-3d.html` parametrisieren auf alle 12 Aufteilungen aus `P.fluegel`. Griffe je nach Öffnungsart pro Flügel. Außenmaße bleiben konstant.

## Ziel

Heute zeigt `fenster-3d.html` nur ein 1-Flügel Iglo-5 Fenster. Im Konfigurator gibt es 12 Aufteilungen (1/2/3 Flügel × kein-/Oberlicht/Unterlicht/Ober+Unter). Wenn der Kunde Aufteilung oder Öffnungsart wählt, soll das 3D-Fenster live die korrekte Geometrie zeigen, damit klar wird wie das Fenster später aussieht.

Außenmaße bleiben symbolisch immer 1000 × 1200 mm — das 3D ist eine Aufteilungs-Vorschau, kein Maßstabsmodell.

## Architektur

### Komponenten in `fenster-3d.html`

Statt eines hartcodierten Builder-Blocks gibt es wiederverwendbare Bauteil-Funktionen:

- `buildOuterFrame(W, H, D)` — Außenrahmen (Blendrahmen), unverändert pro Layout
- `buildVerticalMullion(x, yTop, yBot)` — vertikaler Pfosten (80 mm Drutex-Standard)
- `buildHorizontalMullion(y, xLeft, xRight)` — horizontaler Pfosten für Oberlicht/Unterlicht
- `buildSash(x, y, w, h, sashState, side)` — ein Flügel: Sash-Profilrahmen + Glas + ggf. Griff
- `buildLayout(spec)` — Orchestrator. Nimmt eine LayoutSpec, ruft die Bauteile auf, fügt sie zur Szene hinzu

### LayoutSpec

```js
{
  layout: '2-oberlicht',          // einer der 12 fluegel-Keys
  sashes: ['dk-l', 'dk-r'],       // Öffnungsart pro Hauptflügel (Länge = Flügelanzahl)
  oberlicht: 'fest',              // optional, default 'fest'
  unterlicht: 'fest'              // optional, default 'fest'
}
```

### Layout-Tabelle (Innen-Aufteilung bei konstanten Außenmaßen 1000 × 1200)

Hauptbereich (zwischen Oberlicht und Unterlicht, oder voll bei keiner Lichte) wird gleichmäßig in 1/2/3 Spalten geteilt. Lichten haben feste Höhe 300 mm.

| Layout | Hauptspalten | Oberlicht | Unterlicht | Hauptbereich-Höhe |
|---|---|---|---|---|
| `1-fluegel` | 1 | – | – | 1200 |
| `2-fluegel` | 2 | – | – | 1200 |
| `3-fluegel` | 3 | – | – | 1200 |
| `1-oberlicht` | 1 | 300 | – | 900 |
| `2-oberlicht` | 2 | 300 | – | 900 |
| `3-oberlicht` | 3 | 300 | – | 900 |
| `1-unterlicht` | 1 | – | 300 | 900 |
| `2-unterlicht` | 2 | – | 300 | 900 |
| `3-unterlicht` | 3 | – | 300 | 900 |
| `1-ober-unter` | 1 | 300 | 300 | 600 |
| `2-ober-unter` | 2 | 300 | 300 | 600 |
| `3-ober-unter` | 3 | 300 | 300 | 600 |

Pfosten-Stärke: 80 mm vertikal und horizontal (subtrahiert von der nutzbaren Sash-Breite/-Höhe).

### Griff-Logik je Sash-State

| State | Griff | Position | Bemerkung |
|---|---|---|---|
| `fest` | – | – | nur Sash-Rahmen + Glas |
| `dreh-l` | ja | rechts vertikal | Bänder links |
| `dreh-r` | ja | links vertikal | Bänder rechts |
| `kipp` | ja | oben mittig (Griff zeigt nach oben) | nur Kipp, keine Drehfunktion |
| `dk-l` | ja | rechts vertikal | Dreh-Kipp linksanschlag |
| `dk-r` | ja | links vertikal | Dreh-Kipp rechtsanschlag |

Lichten (Oberlicht/Unterlicht) bekommen denselben Sash-Body, aber kleiner — sind also auch Sashes mit `fest` (Standard) oder `kipp` (kleiner Griff oben).

## Konfigurator-Bridge (`konfigurator.html`)

`_renderFenster3d()` schickt nach jedem relevanten Zustandswechsel:

```js
cw.postMessage({
  type: 'update',
  layout:    S.fluegel || '1-fluegel',
  sashes:    [S.oeff1, S.oeff2, S.oeff3].filter(Boolean),
  oberlicht: S.oberlichtOeff || 'fest',
  unterlicht: S.unterlichtOeff || 'fest',
  color:     ...,
  wood:      ...,
  glass:     S.glasdekor || 'klar',
  side:      ...
}, '*');
```

`fenster-3d.html` empfängt, fragt `layout`/`sashes`/`oberlicht`/`unterlicht` ab und ruft `buildLayout(spec)` auf, das die alte Szene aufräumt und die neue aufbaut.

### Default-Sash-States pro Aufteilung

Beim Wechsel der Aufteilung in Schritt 3 setzt der Konfigurator vernünftige Defaults (sofern noch nicht vom Kunden gewählt):

- 1-Flügel default: `dk-r`
- 2-Flügel default: `dk-l`, `dk-r` (symmetrisch)
- 3-Flügel default: `dk-l`, `fest`, `dk-r` (Drutex-Standard)
- Oberlicht/Unterlicht default: `fest`

Sobald der Kunde in Schritt 4 die Öffnungsart pro Flügel ändert, wird das im 3D live übernommen.

## Datenfluss

```
Konfigurator-Schritt 3 (Flügelaufteilung) → S.fluegel ändert
  → _renderFenster3d() postet { type:'update', layout, sashes, ... }
  → fenster-3d.html buildLayout(spec) baut Szene neu

Konfigurator-Schritt 4 (Öffnungsart pro Flügel) → S.oeff1/2/3, S.oberlichtOeff, S.unterlichtOeff ändert
  → _renderFenster3d() postet { type:'update', layout, sashes, ... }
  → fenster-3d.html erkennt: gleicher layout, nur sashes anders
  → updateSashHandles(spec) — nur Griffe austauschen, kein Rebuild

Konfigurator-Schritt 6 (Farbe/Glas) → S.fa, S.glasdekor ändert
  → wie bisher, nur Material-Update, kein Rebuild
```

## Was NICHT in dieser Spec

- **Öffnungs-Animation** für mehrere Flügel — aktuell hat `fenster-3d.html` einen gemeinsamen `toggleOpen`. Bei 2/3 Flügeln wäre der naive Ansatz: alle DK-Flügel gleichzeitig auf. Animation pro Flügel kommt in einer separaten Spec.
- **Maß-Variationen** (S.bMm, S.hMm). Außenmaße bleiben konstant 1000 × 1200.
- **Haustür-Seitenteile** (`seitenteil-l`, `seitenteil-r`). Anderer Use-Case, separate Geometrie.
- **Stulp vs. Pfosten bei 2-Flügel**. Aktuell zeigt das 3D immer Pfosten. Stulp-Variante kann später ergänzt werden.

## Edge Cases

- **Konfigurator setzt unbekannte Aufteilung**: Fallback auf `1-fluegel`.
- **`sashes` Array kürzer als Flügelanzahl**: fehlende mit `dk-r` auffüllen.
- **`sashes` Array länger als Flügelanzahl**: Rest ignorieren.
- **`oberlicht`/`unterlicht` ungültiger Wert**: Fallback `fest`.
- **Schneller Layout-Wechsel (Spam-Click)**: `buildLayout` räumt alte Three.js Meshes per `dispose()` korrekt auf, sonst Memory-Leak.

## Code-Struktur (Änderungs-Übersicht)

### `fenster-3d.html`

Neue Funktionen:
- `cleanupScene()` — entfernt + disposed alle Sash/Mullion-Meshes
- `buildOuterFrame(W, H, D)`
- `buildVerticalMullion(x, yTop, yBot)`
- `buildHorizontalMullion(y, xLeft, xRight)`
- `buildSash(x, y, w, h, sashState, side)` — ersetzt aktuelle Sash-Logik, erzeugt Sash-Profilrahmen + Glas + Griff
- `buildLayout(spec)` — Hauptfunktion
- `updateSashHandles(spec)` — nur Griffe austauschen ohne Rebuild

Bestehende Funktionen die angepasst werden:
- `setSide()` — wird obsolet, wird Teil von Sash-State pro Flügel
- Postmessage-Handler erweitern um `layout`/`sashes`/`oberlicht`/`unterlicht`

### `konfigurator.html`

- `_renderFenster3d()` erweitern um die neuen Felder im postMessage
- Bei `S.fluegel` Wechsel: Default-Sash-States setzen (`S.oeff1`, `S.oeff2`, `S.oeff3` auf sinnvolle Defaults wenn noch leer)
- Bei `S.oeff1/2/3` Wechsel: `_renderFenster3d()` erneut triggern

## Testing

Nach Implementation manuell durchklicken:
1. Schritt 1 Produkt: Kunststoff-Fenster
2. Schritt 3 alle 12 Aufteilungen durch — 3D-Modell muss korrekt umbauen
3. Schritt 4 pro Flügel alle 6 Öffnungsarten — Griffe müssen live umspringen
4. Schritt 6 Farbe + Glas wechseln — alle Sashes + Pfosten müssen mitfärben
5. Schnell zwischen Aufteilungen wechseln — kein Memory-Leak, keine Geisterelemente

## Erfolgskriterien

- Alle 12 Aufteilungen visuell korrekt (Pfosten an richtiger Position, Lichten oben/unten als separater Sash)
- Pro Flügel der Griff passend zur Öffnungsart (oder kein Griff bei Fest)
- Farbe + Glas wirken auf alle Sashes + Pfosten + Rahmen einheitlich
- Live-Update spürbar (< 200ms vom Klick im Konfigurator bis 3D-Refresh)
- Keine Console-Errors, kein THREE.js Memory-Warning bei Layout-Switches
