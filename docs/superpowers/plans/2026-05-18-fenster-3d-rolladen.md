# Fenster-3D Rollladen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aufsatz-Rollladen 3D-Visualisierung im `fenster-3d.html` (1-Flügel) — Kasten, Schienen, Endschiene, optional Gurt-Auslass, alles mitfärbend mit Fensterfarbe.

**Architektur:** Neue Helper-Funktion `_addRolladen(spec)` in `fenster-3d.html` ergänzt die Rollladen-Geometrie zur `winGroup`, gesteuert über drei neue postMessage-Felder vom Konfigurator. Bestehender Sash-Code unverändert — keine Look-Regression.

**Tech-Stack:** Three.js (bestehend in `fenster-3d.html`), postMessage-Bridge.

**Spec:** `docs/superpowers/specs/2026-05-18-fenster-3d-rolladen-design.md`

---

## File Structure

**Modifiziert:**
- `fenster-3d.html` — neue `_addRolladen()` Funktion + postMessage-Handler erweitert + Initial-Build mit Rolladen-Default
- `konfigurator.html` — `_renderFenster3d()` sendet `roll`/`rollKasten`/`rollSeite`

---

## Task 1: Rolladen-Konstanten + State

**Files:**
- Modify: `fenster-3d.html` (direkt vor `function buildWindow`)

- [ ] **Step 1: Konstanten + State-Variable einfügen**

In `fenster-3d.html`, direkt vor `function buildWindow(spec)`:

```js
// ══════════════════════════════════════════════
// ROLLLADEN — Drutex-Aufsatzrollladen-Maße
// ══════════════════════════════════════════════
const ROL_BOX_DEPTH = 0.230;   // Kasten-Tiefe 230 mm (typisch Drutex Aufsatz)
const ROL_SCHIENE_W = 0.035;   // Führungsschiene Breite 35 mm
const ROL_SCHIENE_D = 0.025;   // Führungsschiene Tiefe 25 mm
const ROL_END_H     = 0.045;   // Endschiene Höhe 45 mm
const ROL_GURT_W    = 0.040;   // Gurt-Auslass Breite 40 mm
const ROL_GURT_H    = 0.200;   // Gurt-Auslass Höhe 200 mm
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/buissnesaccount/deinefenster Website"
git add fenster-3d.html
git -c commit.gpgsign=false commit -m "fenster-3d: Rolladen-Konstanten hinzufügen"
```

---

## Task 2: _addRolladen Funktion

**Files:**
- Modify: `fenster-3d.html` (direkt vor `function buildWindow`)

- [ ] **Step 1: Funktion einfügen**

Direkt nach den Rolladen-Konstanten:

```js
// Rollladen-Geometrie: Kasten + Schienen + Endschiene + optional Gurt-Auslass
// spec.roll: 'ohne' | 'gurt' | 'motor'
// spec.rollKasten: '175' | '215' | '225' (mm)
// spec.rollSeite: 'links' | 'rechts'
function _addRolladen(spec) {
  if (!spec || !spec.roll || spec.roll === 'ohne') return;

  const kastenH = (parseInt(spec.rollKasten, 10) || 175) / 1000;   // in m
  const kastenY = FH + kastenH / 2;                                  // sitzt OBEN auf Blendrahmen
  const kastenZ = FD / 2 + 0.115;                                    // ragt 115 mm nach vorne
  const kastenD = ROL_BOX_DEPTH;
  const fzc = FD / 2;

  // ── Rollladenkasten ──
  winGroup.add(bx(FW / 2, kastenY, kastenZ, FW, kastenH, kastenD, frameMat));

  // Profilnut umlaufend auf Vorderfläche des Kastens (subtleNutMat)
  const kastenFront = kastenZ + kastenD / 2;
  const kxL = 0.012, kxR = FW - 0.012;
  const kyB = FH + 0.012, kyT = FH + kastenH - 0.012;
  winGroup.add(nut(kxL, kyB, kxR, kyB, kastenFront, subtleNutMat));
  winGroup.add(nut(kxL, kyT, kxR, kyT, kastenFront, subtleNutMat));
  winGroup.add(nut(kxL, kyB, kxL, kyT, kastenFront, subtleNutMat));
  winGroup.add(nut(kxR, kyB, kxR, kyT, kastenFront, subtleNutMat));

  // ── Führungsschienen (links + rechts) ──
  const schieneY = FH / 2;
  const schieneZ = fzc + 0.005;   // leicht vor dem Blendrahmen
  // Links: außen am Blendrahmen-Linkskante
  winGroup.add(bx(-ROL_SCHIENE_W / 2, schieneY, schieneZ, ROL_SCHIENE_W, FH, ROL_SCHIENE_D, frameMat));
  // Rechts: außen am Blendrahmen-Rechtskante
  winGroup.add(bx(FW + ROL_SCHIENE_W / 2, schieneY, schieneZ, ROL_SCHIENE_W, FH, ROL_SCHIENE_D, frameMat));

  // ── Endschiene (gerade unter Kasten-Unterkante) ──
  const endY = FH - ROL_END_H / 2;
  const endZ = fzc + 0.020;
  winGroup.add(bx(FW / 2, endY, endZ, FW, ROL_END_H, ROL_SCHIENE_D, frameMat));
  // Dunkle Schattenlinie obendrauf für Trennung Kasten ↔ Endschiene
  winGroup.add(nut(0.020, FH - 0.002, FW - 0.020, FH - 0.002, endZ + ROL_SCHIENE_D / 2 + 0.001, subtleNutMat));

  // ── Gurt-Auslass (nur bei 'gurt') ──
  if (spec.roll === 'gurt') {
    const gurtX = (spec.rollSeite === 'links') ? 0.030 : FW - 0.030;
    const gurtY = 0.100;
    const gurtZ = fzc + 0.010;
    winGroup.add(bx(gurtX, gurtY, gurtZ, ROL_GURT_W, ROL_GURT_H, 0.020, frameMat));
    // Dunkler Schlitz in der Mitte
    winGroup.add(nut(gurtX, gurtY - ROL_GURT_H / 2 + 0.020, gurtX, gurtY + ROL_GURT_H / 2 - 0.020, gurtZ + 0.011, sealMat));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add fenster-3d.html
git -c commit.gpgsign=false commit -m "fenster-3d: _addRolladen Funktion (Kasten + Schienen + Endschiene + Gurt-Auslass)"
```

---

## Task 3: buildWindow ruft _addRolladen auf

**Files:**
- Modify: `fenster-3d.html` (am Ende von `buildWindow`)

- [ ] **Step 1: spec um Rolladen-Defaults erweitern + Aufruf einfügen**

In `function buildWindow(spec)` die Spec-Defaults erweitern:

```js
function buildWindow(spec) {
  spec = spec || { layout: '1-fluegel', sashes: ['dk-r'], oberlicht: 'fest', unterlicht: 'fest', roll: 'ohne', rollKasten: '175', rollSeite: 'rechts' };
  ...
```

Und direkt vor der schließenden `}` von `buildWindow`, NACH den letzten Scharniere-Aufrufen:

```js
  // ── Rollladen (falls konfiguriert) ──
  _addRolladen(spec);
}
```

- [ ] **Step 2: Commit**

```bash
git add fenster-3d.html
git -c commit.gpgsign=false commit -m "fenster-3d: buildWindow ruft _addRolladen auf"
```

---

## Task 4: postMessage-Handler erweitern

**Files:**
- Modify: `fenster-3d.html` (message listener)

- [ ] **Step 1: Handler erweitern**

Suche den `window.addEventListener('message'`-Block. Im `if (d.type === 'update')`-Zweig:

```js
  if (d.type === 'update') {
    // Rolladen-State persistieren — bei JEDEM update mitziehen
    const _lastSpec = window._lastBuildSpec || { layout: '1-fluegel', sashes: ['dk-r'] };
    const newSpec = {
      layout:     d.layout     || _lastSpec.layout     || '1-fluegel',
      sashes:     d.sashes     || _lastSpec.sashes     || ['dk-r'],
      oberlicht:  d.oberlicht  || _lastSpec.oberlicht  || 'fest',
      unterlicht: d.unterlicht || _lastSpec.unterlicht || 'fest',
      roll:       d.roll       || _lastSpec.roll       || 'ohne',
      rollKasten: d.rollKasten || _lastSpec.rollKasten || '175',
      rollSeite:  d.rollSeite  || _lastSpec.rollSeite  || 'rechts',
    };
    window._lastBuildSpec = newSpec;
    buildWindow(newSpec);

    if (d.wood)  setWood(d.wood);
    else if (d.color) setColor(d.color);
    if (d.glass) setGlass(d.glass);
    if (d.side) setSide(d.side);
  }
```

Hinweis: dieser Block ersetzt den bestehenden `if (d.type === 'update')`-Block komplett.

- [ ] **Step 2: Commit**

```bash
git add fenster-3d.html
git -c commit.gpgsign=false commit -m "fenster-3d: postMessage-Handler übergibt Rolladen-Spec an buildWindow"
```

---

## Task 5: Konfigurator-Bridge erweitern

**Files:**
- Modify: `konfigurator.html` `_renderFenster3d()` Funktion

- [ ] **Step 1: postMessage-Payload erweitern**

In `_renderFenster3d()` (`grep -n "function _renderFenster3d" konfigurator.html` für die Position) beide postMessage-Aufrufe (onload und Live) um drei Felder erweitern. Suche den Block:

```js
cw.postMessage({
  type: 'update',
  layout:     _layout,
  sashes:     _sashes,
  oberlicht:  _oberlicht,
  unterlicht: _unterlicht,
  color: isWood ? null : _ck,
  ...
}, '*');
```

Direkt nach `unterlicht: _unterlicht,` einfügen (in beiden Aufrufen):

```js
  roll:       S.roll       || 'ohne',
  rollKasten: S.rollKasten || '175',
  rollSeite:  S.rollSeite  || 'rechts',
```

- [ ] **Step 2: Commit**

```bash
git add konfigurator.html
git -c commit.gpgsign=false commit -m "konfigurator: _renderFenster3d sendet Rolladen-Spec ans 3D"
```

---

## Task 6: Live-Test + Push

- [ ] **Step 1: Smart-Quote-Check**

```bash
cd "/Users/buissnesaccount/deinefenster Website"
python3 scripts/check-html-smart-quotes.py fenster-3d.html konfigurator.html
```

Erwartet: „OK — keine Smart-Quotes".

- [ ] **Step 2: JS-Syntax-Check fenster-3d.html**

```bash
python3 -c "
import re
html = open('fenster-3d.html').read()
scripts = re.findall(r'<script(?:\s+type=\"module\")?\s*>(.*?)</script>', html, re.DOTALL)
for i, s in enumerate(scripts):
    with open(f'/tmp/check_{i}.js', 'w') as f:
        f.write(s)
"
node --check /tmp/check_1.js && echo "JS OK"
```

- [ ] **Step 3: Push**

```bash
git push live HEAD:main
```

Warten ~60s.

- [ ] **Step 4: Browser-Test**

`https://deinefenster.de/konfigurator.html` öffnen (Cmd+Shift+R), Kunststoff-Fenster wählen, 1-Flügel, dann:

1. **Schritt 11 „Mit Gurt"** → Rolladen-Kasten oben sichtbar, Endschiene drunter, Schienen seitlich, Gurt-Auslass rechts unten
2. **Gurt-Seite auf links wechseln** → Gurt-Auslass springt nach links
3. **Schritt 11 „Mit Motor"** → Gurt-Auslass verschwindet, Rest bleibt
4. **Kastenhöhe 175 → 215** → Kasten wird sichtbar höher
5. **Schritt 11 „Ohne Rolladen"** → alle Rolladen-Teile verschwinden
6. **Schritt 6 Farbe Anthrazit → Weiß** → Rolladen färbt mit
7. Console öffnen — keine Errors

---

## Erfolgskriterien

- ✓ Kasten oben sichtbar wenn `roll !== 'ohne'`
- ✓ Schienen links + rechts
- ✓ Endschiene unter Kasten
- ✓ Gurt-Auslass nur bei `roll === 'gurt'` an richtiger Seite
- ✓ Kastenhöhe folgt `rollKasten`
- ✓ Farbe folgt Fensterfarbe
- ✓ Keine Errors, kein Memory-Leak

## Bekannte Einschränkungen (für später, separat)

- Animation Rollpanzer hoch/runter
- Multi-Flügel und Balkontür Rolladen
- Lamellen-Farbe separat (5 Drutex-Farben)
- Abgerundete Kasten-Vorderkante
