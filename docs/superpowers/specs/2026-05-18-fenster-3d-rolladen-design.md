# Fenster-3D — Aufsatz-Rollladen Visualisierung

**Datum:** 2026-05-18
**Scope:** `fenster-3d.html` (1-Flügel Kunststofffenster) erhält eine 3D-Rollladen-Visualisierung, die abhängig vom Konfigurator-State (Schritt 11) sichtbar wird.

## Ziel

Wenn der Kunde im Konfigurator-Schritt 11 einen Rollladen wählt (Gurt oder Motor), erscheint im 3D-Fenster-Modell ein realistischer Drutex-Aufsatzrollladen mit Kasten, Führungsschienen und sichtbarer Endschiene. Der Rollpanzer bleibt eingerollt — das Fenster bleibt sichtbar, der Kunde versteht: „mein Fenster bekommt einen Rollladen."

## Drutex-Spezifikationen (Recherche-Basis)

- **Typ:** PVC-Aufsatzrollladen (auf Fensterrahmen montiert, keine Mauerwerksöffnung nötig)
- **Kastenhöhen:** 175 mm / 215 mm (Fenster, Balkontür), 225 mm (HST) — bereits in `P.rollKasten`
- **Kastentiefe:** ca. 230 mm (typische Aufsatz-Tiefe)
- **Lamellen-Material:** PVC, 5 Farben (Weiß, Beige, Braun, Grau, Anthrazit) — werden in dieser Spec nicht separat gewählt
- **Antrieb:** Funk-Motor oder Gurt (Gurt-Auslass auf konfigurierbarer Seite)
- **Führungsschienen:** PVC, schmal (~35 mm breit), in Fensterfarbe

## Architektur

### Konfigurator-State (bestehend, kein neuer State nötig)

- `S.roll`: `'ohne' | 'gurt' | 'motor'`
- `S.rollSeite`: `'links' | 'rechts'`
- `S.rollKasten`: `'175' | '215' | '225'` (in mm)

### Komponenten in `fenster-3d.html`

Eine neue Helper-Funktion `_addRolladen(spec)` wird am Ende von `buildWindow()` aufgerufen, wenn `spec.roll !== 'ohne'`. Sie fügt vier Bauteile zur `winGroup` hinzu:

1. **Rollladenkasten** (oberhalb des Fensterrahmens)
   - Position-Y: `FH` (Oberkante Blendrahmen)
   - Höhe: `S.rollKasten / 1000` (0.175, 0.215 oder 0.225 m)
   - Breite: `FW` (volle Fensterbreite)
   - Tiefe: `0.230` m
   - Z-Position: vor dem Rahmen, `z = FD/2 + 0.115` (Kasten ragt 115 mm nach vorne aus dem Rahmen)
   - Material: `frameMat` (mitfärbend)
   - Subtile Profilnut umlaufend an der Vorderfläche (wie Blendrahmen)

2. **Führungsschienen** (links + rechts neben dem Fenster)
   - Maße: 0.035 m breit × `FH` hoch × 0.025 m tief
   - X-Position links: `-0.035 / 2` (außen am Blendrahmen-Linkskante)
   - X-Position rechts: `FW + 0.035 / 2`
   - Y-Position: `FH / 2`
   - Z-Position: leicht vor dem Rahmen, `z = FD / 2 + 0.005`
   - Material: `frameMat`

3. **Endschiene** (Abschlusslatte direkt unter Kasten)
   - Maße: `FW` breit × 0.045 m hoch × 0.025 m tief
   - Y-Position: `FH - 0.045 / 2` (gerade unterhalb der Kasten-Unterkante)
   - X-Position: `FW / 2`
   - Z-Position: leicht vor dem Rahmen, `z = FD / 2 + 0.020`
   - Material: `frameMat`, mit leichter dunklerer Schattenlinie obendrauf (subtleNutMat)

4. **Gurt-Auslass** (nur wenn `S.roll === 'gurt'`)
   - Kleiner Vertikalstreifen unten an der Innenseite an Position `S.rollSeite`
   - Maße: 0.040 m breit × 0.200 m hoch × 0.020 m tief
   - X-Position: bei `rollSeite === 'links'` an `0.030`, bei `rollSeite === 'rechts'` an `FW - 0.030`
   - Y-Position: `0.100` (unten am Fenster)
   - Material: `frameMat`
   - Dunkler Schlitz in der Mitte (sealMat)

### Konfigurator-Bridge

`_renderFenster3d()` in `konfigurator.html` erweitert sein postMessage um:

```js
roll:       S.roll       || 'ohne',
rollKasten: S.rollKasten || '175',
rollSeite:  S.rollSeite  || 'rechts',
```

`fenster-3d.html` postMessage-Handler:
- Erweitert um Rollladen-Felder
- Speichert in `_lastRolladen = { roll, rollKasten, rollSeite }`
- Triggert kompletten `buildWindow()` Rebuild bei Wechsel (oder fügt nur die Rollladen-Teile dazu)

## Datenfluss

```
Konfigurator-Schritt 11 (Rolladen-Auswahl) → S.roll/rollKasten/rollSeite ändert sich
  → drawPrev() ruft _renderFenster3d() auf
  → postMessage mit roll/rollKasten/rollSeite an iframe
  → fenster-3d.html buildWindow() inkl. Rollladen-Teile neu

Konfigurator-Schritt 6 (Farbe) → S.fa ändert sich
  → wie bisher: setColor() färbt frameMat → Rollladen-Teile mitfärbend
```

## Code-Struktur (Änderungs-Übersicht)

### `fenster-3d.html`

Neue Funktion direkt nach den Bauteil-Helpern, vor `buildWindow()`:

```js
// Rollladen: Kasten + Schienen + Endschiene + Gurt-Auslass
function _addRolladen(spec) {
  if (!spec || !spec.roll || spec.roll === 'ohne') return;
  // ... Geometrie hinzufügen (siehe Komponenten oben)
}
```

`buildWindow()` ruft am Ende `_addRolladen(spec)` auf.

postMessage-Handler in `fenster-3d.html` nimmt zusätzliche Felder entgegen:

```js
if (d.type === 'update') {
  if (d.roll !== undefined || d.rollKasten !== undefined) {
    // Rebuild mit Rollladen-Daten
  }
  // ... bestehende Color/Glass-Logik
}
```

### `konfigurator.html`

In `_renderFenster3d()` postMessage erweitern:

```js
cw.postMessage({
  type: 'update',
  layout: _layout,
  sashes: _sashes,
  ...
  roll:       S.roll       || 'ohne',
  rollKasten: S.rollKasten || '175',
  rollSeite:  S.rollSeite  || 'rechts',
}, '*');
```

Schritt 11 (Rolladen) ruft bei Click bereits `drawPrev()` auf — das genügt um den Update-Flow zu triggern.

## Edge Cases

- **`S.roll === 'ohne'`**: keine Rollladen-Geometrie. Wichtig dass beim Wechsel von „mit Rollladen" zurück auf „ohne" die alten Meshes disposed werden.
- **Ungültige `rollKasten`-Werte**: Fallback auf `'175'`.
- **Ungültige `rollSeite`**: Fallback `'rechts'`.
- **Wechsel Gurt → Motor**: Gurt-Auslass muss verschwinden, Kasten bleibt.

## Was NICHT in dieser Spec

- **Animation** (Rollpanzer hoch- und runterfahren). Endschiene ist als sichtbarer Hinweis vorhanden, voller Panzer nicht.
- **Multi-Flügel** (`fenster-3d-multi.html`) und **Balkontür** (`balkontuer-3d.html`, `balkontuer-3d-multi.html`). Nur 1-Flügel Kunststoff in dieser Spec.
- **Lamellen-Farbe separat** (Drutex hat 5 Lamellen-Farben). Aktuell färbt Rollladen mit Fensterfarbe.
- **Bauchige Kasten-Form** (echte Drutex-Kästen haben leicht abgerundete Vorderkanten). Hier nur rechteckiger Kasten.

## Testing

Manuell durchklicken:
1. Kunststoff-Fenster → 1-Flügel → Schritt 11 „Mit Gurt" wählen → Rollladen erscheint mit Gurt-Auslass rechts
2. `S.rollSeite` auf links wechseln → Gurt-Auslass springt nach links
3. Kastenhöhe 175 → 215 → 225 — Kasten muss sichtbar höher werden (nur 175/215 für Kunststoff, 225 ist HST-only)
4. Schritt 11 „Mit Motor" → Kasten bleibt, Gurt-Auslass verschwindet
5. Schritt 11 „Ohne" → Kasten, Schienen, Endschiene, Gurt-Auslass verschwinden komplett
6. Schritt 6 Farbe wechseln (Anthrazit → Weiß) → alle Rollladen-Teile färben mit

## Erfolgskriterien

- ✅ Rollladenkasten oben sichtbar wenn `roll !== 'ohne'`
- ✅ Führungsschienen links + rechts neben dem Fenster
- ✅ Endschiene gerade unter Kasten sichtbar
- ✅ Gurt-Auslass nur bei `roll === 'gurt'` an richtiger Seite
- ✅ Kastenhöhe folgt `S.rollKasten`
- ✅ Farbe folgt `S.fa` (via frameMat)
- ✅ Keine Console-Errors, kein Memory-Leak bei Toggle ohne ↔ mit Rollladen
