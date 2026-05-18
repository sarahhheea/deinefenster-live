# Fenster-3D Flügelaufteilungen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `fenster-3d.html` von hartcodiertem 1-Flügel auf alle 12 Aufteilungen aus `P.fluegel` parametrisieren, mit korrekter Griff-Logik je Öffnungsart und Live-Update aus dem Konfigurator.

**Architektur:** Bestehender `buildWindow()`-Block wird auf eine LayoutSpec parametrisiert. Wiederverwendbare Bauteile (`buildOuterFrame`, `buildVerticalMullion`, `buildHorizontalMullion`, `buildSash`) werden aus dem aktuellen Code extrahiert. Außenmaße bleiben konstant 1000×1200 mm. Die `winGroup` enthält Außenrahmen + Pfosten, jeder Sash kommt in seine eigene `THREE.Group` (für spätere pro-Sash-Animation).

**Tech-Stack:** Three.js (bereits in `fenster-3d.html`), Vanilla-JS postMessage-Bridge zwischen `konfigurator.html` und iframe.

---

## File Structure

**Modifiziert:**
- `fenster-3d.html` (lines ~285-549) — buildWindow umstrukturiert, neue Bauteil-Funktionen, erweiterter postMessage-Handler
- `konfigurator.html` — `_renderFenster3d()` schickt neue Felder, Default-Sash-State-Helper, Trigger bei Schritt 3/4

**Spec-Referenz:** `docs/superpowers/specs/2026-05-18-fenster-3d-fluegelaufteilungen-design.md`

---

## Task 1: Layout-Parser + Konstanten

**Files:**
- Modify: `fenster-3d.html` (oben bei den FENSTER-KONSTANTEN, ca. Zeile 259)

- [ ] **Step 1: Layout-Konstanten + Parser einfügen direkt nach `const FW = 1.000;` Block**

In `fenster-3d.html` direkt nach den FENSTER-KONSTANTEN (nach Zeile 282, vor `const winGroup`):

```js
// ══════════════════════════════════════════════
// LAYOUT-PARSER — wandelt fluegel-Key in Geometry-Spec
// ══════════════════════════════════════════════
const LICHTE_H = 0.300;   // Oberlicht/Unterlicht Höhe (300 mm)
const MULLION_T = 0.080;  // Pfosten-Stärke (80 mm Drutex)

function parseLayout(key) {
  const k = key || '1-fluegel';
  const m = k.match(/^(\d)-(fluegel|oberlicht|unterlicht|ober-unter)$/);
  if (!m) return { cols: 1, hasOber: false, hasUnter: false };
  return {
    cols: parseInt(m[1], 10),
    hasOber: m[2] === 'oberlicht' || m[2] === 'ober-unter',
    hasUnter: m[2] === 'unterlicht' || m[2] === 'ober-unter',
  };
}

// Default-Sash-State pro Aufteilung (Drutex-Standard)
function defaultSashes(cols) {
  if (cols === 1) return ['dk-r'];
  if (cols === 2) return ['dk-l', 'dk-r'];
  if (cols === 3) return ['dk-l', 'fest', 'dk-r'];
  return ['dk-r'];
}
```

- [ ] **Step 2: Manuell testen im Browser-Console**

Lokal in Chrome `/Users/buissnesaccount/deinefenster Website/fenster-3d.html` öffnen, Console:

```js
parseLayout('2-oberlicht')  // → {cols:2, hasOber:true, hasUnter:false}
parseLayout('3-ober-unter') // → {cols:3, hasOber:true, hasUnter:true}
parseLayout('garbage')      // → {cols:1, hasOber:false, hasUnter:false}
defaultSashes(2)            // → ['dk-l','dk-r']
defaultSashes(3)            // → ['dk-l','fest','dk-r']
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/buissnesaccount/deinefenster Website"
git add fenster-3d.html
git commit -m "fenster-3d: Layout-Parser + Default-Sash-Helper hinzufügen"
```

---

## Task 2: buildOuterFrame extrahieren

**Files:**
- Modify: `fenster-3d.html` ~Zeile 354-371 (Blendrahmen-Code in `buildWindow`)

- [ ] **Step 1: Neue Funktion `buildOuterFrame` direkt vor `function buildWindow()` einfügen**

```js
// Außenrahmen (Blendrahmen) — 4 Stäbe + Profilnuten
// Kein Sash darin, nur statische Geometrie. Wird in winGroup hinzugefügt.
function buildOuterFrame() {
  const meshes = [];
  const fzc = FD / 2;
  const ffz = FD;

  // 4 Stäbe (oben, unten, links, rechts)
  meshes.push(bx(FW/2,        FRT/2,        fzc, FW,          FRT,        FD, frameMat));
  meshes.push(bx(FW/2,        FH - FRT/2,   fzc, FW,          FRT,        FD, frameMat));
  meshes.push(bx(FRT/2,       FH/2,         fzc, FRT,         FH - 2*FRT, FD, frameMat));
  meshes.push(bx(FW - FRT/2,  FH/2,         fzc, FRT,         FH - 2*FRT, FD, frameMat));

  // Profilnut innen (nahe Falz)
  const fni = FRT - 0.012;
  meshes.push(nut(fni,        fni,         FW - fni,    fni,         ffz, subtleNutMat));
  meshes.push(nut(fni,        FH - fni,    FW - fni,    FH - fni,    ffz, subtleNutMat));
  meshes.push(nut(fni,        fni,         fni,         FH - fni,    ffz, subtleNutMat));
  meshes.push(nut(FW - fni,   fni,         FW - fni,    FH - fni,    ffz, subtleNutMat));
  // Profilnut außen
  const fno = 0.012;
  meshes.push(nut(fno,        fno,         FW - fno,    fno,         ffz, subtleNutMat));
  meshes.push(nut(fno,        FH - fno,    FW - fno,    FH - fno,    ffz, subtleNutMat));
  meshes.push(nut(fno,        fno,         fno,         FH - fno,    ffz, subtleNutMat));
  meshes.push(nut(FW - fno,   fno,         FW - fno,    FH - fno,    ffz, subtleNutMat));

  return meshes;
}
```

- [ ] **Step 2: In `buildWindow()` den alten Blendrahmen-Code (Z. 354-371) ersetzen durch:**

```js
  // ── Blendrahmen (statisch in winGroup) ──
  buildOuterFrame().forEach(m => winGroup.add(m));
```

- [ ] **Step 3: Manuell visuell prüfen — Fenster sieht gleich aus wie vorher**

`fenster-3d.html` im Browser öffnen, Außenrahmen muss visuell identisch sein. Falls Console-Errors: zurück und Code prüfen.

- [ ] **Step 4: Commit**

```bash
git add fenster-3d.html
git commit -m "fenster-3d: buildOuterFrame extrahiert"
```

---

## Task 3: buildVerticalMullion + buildHorizontalMullion

**Files:**
- Modify: `fenster-3d.html` — neue Helper nach `buildOuterFrame`

- [ ] **Step 1: Zwei Pfosten-Funktionen einfügen direkt nach `buildOuterFrame()`**

```js
// Vertikaler Pfosten zwischen Flügeln (Drutex 80 mm)
// xCenter: Position der Pfosten-Mitte (Welt-X, Blendrahmen-Koord-System)
// yTop, yBot: oberer/unterer Anschluss (z.B. an Querpfosten oder Blendrahmen-Innenkante)
function buildVerticalMullion(xCenter, yBot, yTop) {
  const h = yTop - yBot;
  const yCenter = (yTop + yBot) / 2;
  const fzc = FD / 2;
  return bx(xCenter, yCenter, fzc, MULLION_T, h, FD, frameMat);
}

// Horizontaler Pfosten für Oberlicht/Unterlicht-Trennung
// yCenter: Pfosten-Höhe (Welt-Y)
// xLeft, xRight: linker/rechter Anschluss
function buildHorizontalMullion(yCenter, xLeft, xRight) {
  const w = xRight - xLeft;
  const xCenter = (xLeft + xRight) / 2;
  const fzc = FD / 2;
  return bx(xCenter, yCenter, fzc, w, MULLION_T, FD, frameMat);
}
```

- [ ] **Step 2: Commit**

```bash
git add fenster-3d.html
git commit -m "fenster-3d: Pfosten-Builder (vertikal + horizontal)"
```

---

## Task 4: buildSash — parametrische Flügel-Funktion

**Files:**
- Modify: `fenster-3d.html` — neue Funktion vor `buildWindow`, ersetzt vorhandenen Sash-Code

- [ ] **Step 1: `buildSash(x, y, w, h, sashState)` Funktion einfügen**

```js
// Ein Flügel (Sash) — eigener Profilrahmen + Glas + Griff je nach sashState
// x, y: linke untere Ecke des Sash im Blendrahmen-Koordinatensystem
// w, h: Sash-Außenmaße
// sashState: 'fest' | 'kipp' | 'dreh-l' | 'dreh-r' | 'dk-l' | 'dk-r'
// Liefert: { group: THREE.Group, glass: Mesh, handles: Array }
function buildSash(x, y, w, h, sashState) {
  const group = new THREE.Group();
  const szc = FD / 2 + SASH_DZ;
  const sfz = FD + SASH_DZ;
  const glasses = [];
  const handles = [];

  // Sash-Profilrahmen (4 Stäbe relativ zu (x,y))
  group.add(bx(x + w/2,       y + FST/2,      szc, w,    FST,        FD, sashMat));
  group.add(bx(x + w/2,       y + h - FST/2,  szc, w,    FST,        FD, sashMat));
  group.add(bx(x + FST/2,     y + h/2,        szc, FST,  h - 2*FST,  FD, sashMat));
  group.add(bx(x + w - FST/2, y + h/2,        szc, FST,  h - 2*FST,  FD, sashMat));

  // Profilnuten Flügel (analog Original)
  const sniL = x + FST * 0.54, sniR = x + w - FST * 0.54;
  const sniB = y + FST * 0.54, sniT = y + h - FST * 0.54;
  group.add(nut(sniL, sniB, sniR, sniB, sfz, subtleNutMat));
  group.add(nut(sniL, sniT, sniR, sniT, sfz, subtleNutMat));
  group.add(nut(sniL, sniB, sniL, sniT, sfz, subtleNutMat));
  group.add(nut(sniR, sniB, sniR, sniT, sfz, subtleNutMat));
  const sniOutL = x + FST * 0.16, sniOutR = x + w - FST * 0.16;
  const sniOutB = y + FST * 0.16, sniOutT = y + h - FST * 0.16;
  group.add(nut(sniOutL, sniOutB, sniOutR, sniOutB, sfz, subtleNutMat));
  group.add(nut(sniOutL, sniOutT, sniOutR, sniOutT, sfz, subtleNutMat));
  group.add(nut(sniOutL, sniOutB, sniOutL, sniOutT, sfz, subtleNutMat));
  group.add(nut(sniOutR, sniOutB, sniOutR, sniOutT, sfz, subtleNutMat));

  // Glas (innerhalb des Sash-Rahmens, mit Spacer-Abstand SBW)
  const gw = w - 2 * (FST + SBW);
  const gh = h - 2 * (FST + SBW);
  const gcx = x + FST + SBW + gw / 2;
  const gcy = y + FST + SBW + gh / 2;
  const gm = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, 0.006), glassMat);
  gm.position.set(gcx, gcy, szc + 0.002);
  gm.castShadow = true;
  group.add(gm);
  glasses.push(gm);

  // Spacer-Rahmen ums Glas
  const sbz = szc;
  const sbd = 0.004;
  group.add(bx(gcx, gcy + gh/2 + SBW/2, sbz, gw + SBW * 2, SBW, sbd, spacerMat));
  group.add(bx(gcx, gcy - gh/2 - SBW/2, sbz, gw + SBW * 2, SBW, sbd, spacerMat));
  group.add(bx(gcx - gw/2 - SBW/2, gcy, sbz, SBW, gh, sbd, spacerMat));
  group.add(bx(gcx + gw/2 + SBW/2, gcy, sbz, SBW, gh, sbd, spacerMat));

  // Griff je nach sashState
  // - fest: kein Griff
  // - dk-l, dreh-l: Griff rechts (Bänder links)
  // - dk-r, dreh-r: Griff links (Bänder rechts)
  // - kipp: Griff oben mittig (zeigt nach oben)
  if (sashState !== 'fest' && sashState !== undefined) {
    const isKipp = sashState === 'kipp';
    const isLeft = sashState === 'dreh-r' || sashState === 'dk-r';  // Griff links
    let hx, hy, hRotZ;
    if (isKipp) {
      hx = x + w / 2;
      hy = y + h - FST * 0.52;
      hRotZ = Math.PI / 2;   // Griff horizontal -> wenn "geöffnet" zeigt er nach oben
    } else {
      hx = isLeft ? x + FST * 0.52 : x + w - FST * 0.52;
      hy = y + h / 2;
      hRotZ = 0;
    }
    // Schild (Rosette)
    const rosette = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.070, 6, 22),
      handleMat
    );
    rosette.rotation.z = hRotZ;
    rosette.scale.set(1.0, 1.0, 0.47);
    rosette.position.set(hx, hy, sfz + 0.0035);
    rosette.castShadow = true;
    rosette.userData.isHandle = true;
    group.add(rosette);
    handles.push(rosette);

    // Olive-Griff (Stab, der vom Schild absteht)
    const handle = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.008, 0.060, 6, 22),
      handleMat
    );
    handle.rotation.z = hRotZ + Math.PI / 2;   // Griff senkrecht zum Schild
    const dir = isLeft ? -1 : 1;
    handle.position.set(
      isKipp ? hx : hx + dir * 0.030,
      isKipp ? hy + 0.030 : hy,
      sfz + 0.012
    );
    handle.castShadow = true;
    handle.userData.isHandle = true;
    group.add(handle);
    handles.push(handle);
  }

  return { group, glasses, handles };
}
```

- [ ] **Step 2: Commit**

```bash
git add fenster-3d.html
git commit -m "fenster-3d: buildSash parametrisch (mit Griff-Logik je Öffnungsart)"
```

---

## Task 5: buildWindow refactor — Layout-Spec verarbeiten

**Files:**
- Modify: `fenster-3d.html` `buildWindow` Funktion komplett

- [ ] **Step 1: `buildWindow` Signatur und Body ändern**

Komplett ersetzen (alter Body Z. ~328-545):

```js
// ══════════════════════════════════════════════
// buildWindow — Layout aus Spec aufbauen
// spec: { layout, sashes, oberlicht, unterlicht }
// ══════════════════════════════════════════════
let _lastSpec = null;

function buildWindow(spec) {
  spec = spec || { layout: '1-fluegel', sashes: ['dk-r'], oberlicht: 'fest', unterlicht: 'fest' };
  _lastSpec = spec;

  // Cleanup
  while (winGroup.children.length > 0) {
    const c = winGroup.children[0];
    c.traverse(node => { if (node.geometry) node.geometry.dispose(); });
    winGroup.remove(c);
  }
  glassObjects = [];
  handleObjects = [];

  // Außenrahmen
  buildOuterFrame().forEach(m => winGroup.add(m));

  // Layout parsen
  const lay = parseLayout(spec.layout);
  const cols = lay.cols;

  // Vertikale Bereiche (Y-Koordinaten): Blendrahmen-Innenkante
  const yInnerBot = FRT;
  const yInnerTop = FH - FRT;
  const xInnerLeft = FRT;
  const xInnerRight = FW - FRT;

  // Lichten-Grenzen (innerhalb des Blendrahmens)
  const oberY = lay.hasOber ? yInnerTop - LICHTE_H : yInnerTop;
  const unterY = lay.hasUnter ? yInnerBot + LICHTE_H : yInnerBot;

  // Querpfosten für Lichten
  if (lay.hasOber) {
    winGroup.add(buildHorizontalMullion(oberY, xInnerLeft, xInnerRight));
  }
  if (lay.hasUnter) {
    winGroup.add(buildHorizontalMullion(unterY, xInnerLeft, xInnerRight));
  }

  // Hauptbereich-Y
  const mainBot = unterY + (lay.hasUnter ? MULLION_T/2 : 0);
  const mainTop = oberY - (lay.hasOber ? MULLION_T/2 : 0);
  const mainH = mainTop - mainBot;

  // Vertikale Pfosten (cols - 1 Stück, gleichmäßig verteilt)
  const usableW = xInnerRight - xInnerLeft;
  const sashW = (usableW - (cols - 1) * MULLION_T) / cols;
  for (let i = 1; i < cols; i++) {
    const xMull = xInnerLeft + i * sashW + (i - 1) * MULLION_T + MULLION_T/2;
    winGroup.add(buildVerticalMullion(xMull, mainBot, mainTop));
  }

  // Hauptflügel
  const sashStates = (spec.sashes || []).slice();
  while (sashStates.length < cols) sashStates.push('dk-r');   // auffüllen
  for (let i = 0; i < cols; i++) {
    const xSash = xInnerLeft + i * (sashW + MULLION_T);
    const r = buildSash(xSash, mainBot, sashW, mainH, sashStates[i]);
    winGroup.add(r.group);
    glassObjects.push(...r.glasses);
    handleObjects.push(...r.handles);
  }

  // Oberlicht-Sash (eine durchgehende Sektion, oben)
  if (lay.hasOber) {
    const oberSashY = oberY + MULLION_T/2;
    const oberSashH = yInnerTop - oberSashY;
    const r = buildSash(xInnerLeft, oberSashY, usableW, oberSashH, spec.oberlicht || 'fest');
    winGroup.add(r.group);
    glassObjects.push(...r.glasses);
    handleObjects.push(...r.handles);
  }

  // Unterlicht-Sash (eine durchgehende Sektion, unten)
  if (lay.hasUnter) {
    const unterSashY = yInnerBot;
    const unterSashH = unterY - MULLION_T/2 - unterSashY;
    const r = buildSash(xInnerLeft, unterSashY, usableW, unterSashH, spec.unterlicht || 'fest');
    winGroup.add(r.group);
    glassObjects.push(...r.glasses);
    handleObjects.push(...r.handles);
  }

  // Farbe/Glas-Materialien nach Rebuild neu anwenden
  if (_curWood)  setWood(_curWood);
  else if (_curColor) setColor(_curColor);
  if (_curGlass) setGlass(_curGlass);
}
```

- [ ] **Step 2: Initial-Call beim Setup anpassen — `setSide(_urlSide)` weiter unten ersetzen durch `buildWindow()` falls Initial-Build noch nicht passiert ist**

Suche in `fenster-3d.html` die Stelle wo `setSide` zum ersten Mal aufgerufen wird (Z. ~562) und ersetze durch:

```js
// Initial-Build mit Default-Spec (1-Flügel DK-rechts)
buildWindow();
```

`setSide()` bleibt vorerst als Stub (wird in Task 7 mit postMessage-Handler entfernt).

- [ ] **Step 3: Visuell prüfen — Browser öffnen, 1-Flügel muss aussehen wie vorher**

Im Browser `fenster-3d.html?embed&color=anthrazitgrau` öffnen. Default = 1-Flügel mit DK-rechts-Griff. Vergleich mit alter Version: Optik identisch.

- [ ] **Step 4: Layout-Test via Console**

```js
buildWindow({layout:'2-fluegel', sashes:['dk-l','dk-r']})       // 2 Flügel, Pfosten Mitte
buildWindow({layout:'3-fluegel', sashes:['dk-l','fest','dk-r']}) // 3 Flügel, 2 Pfosten
buildWindow({layout:'1-oberlicht'})                             // 1 Flügel + Oberlicht
buildWindow({layout:'2-ober-unter', sashes:['dk-l','dk-r']})    // 2 Flügel + Ober+Unter
```

Bei jedem Aufruf muss das Modell sichtbar umgebaut werden. Falls Geisterelemente oder Console-Fehler: Cleanup-Logik in `buildWindow` prüfen.

- [ ] **Step 5: Commit**

```bash
git add fenster-3d.html
git commit -m "fenster-3d: buildWindow auf LayoutSpec parametrisiert (alle 12 Aufteilungen)"
```

---

## Task 6: postMessage-Handler erweitern

**Files:**
- Modify: `fenster-3d.html` — message-listener (suche `window.addEventListener('message'`)

- [ ] **Step 1: Aktuellen Handler finden**

```bash
grep -n "addEventListener.*message" "/Users/buissnesaccount/deinefenster Website/fenster-3d.html"
```

- [ ] **Step 2: Handler-Body erweitern um layout/sashes/oberlicht/unterlicht**

Innerhalb des Handlers (vor color/wood/glass-Verarbeitung):

```js
  // Layout-Update — wenn layout-Felder dabei sind, Szene neu bauen
  if (data.layout || data.sashes) {
    const newSpec = {
      layout: data.layout || (_lastSpec && _lastSpec.layout) || '1-fluegel',
      sashes: data.sashes || (_lastSpec && _lastSpec.sashes) || ['dk-r'],
      oberlicht: data.oberlicht || (_lastSpec && _lastSpec.oberlicht) || 'fest',
      unterlicht: data.unterlicht || (_lastSpec && _lastSpec.unterlicht) || 'fest',
    };
    buildWindow(newSpec);
  }
```

- [ ] **Step 3: Visuell testen — Postmessage von außen senden**

Browser-Console (auf `fenster-3d.html` direkt):

```js
window.postMessage({type:'update', layout:'3-fluegel', sashes:['dk-l','fest','dk-r']}, '*');
window.postMessage({type:'update', layout:'2-ober-unter', sashes:['dk-l','dk-r']}, '*');
```

Modell muss umbauen.

- [ ] **Step 4: Commit**

```bash
git add fenster-3d.html
git commit -m "fenster-3d: postMessage-Handler nimmt LayoutSpec entgegen"
```

---

## Task 7: Konfigurator-Bridge — neue Felder senden

**Files:**
- Modify: `konfigurator.html` `_renderFenster3d()` Funktion (suche `_renderFenster3d`)

- [ ] **Step 1: `_renderFenster3d()` postMessage erweitern**

Suche in `konfigurator.html`:

```bash
grep -n "function _renderFenster3d\|cw.postMessage({" "/Users/buissnesaccount/deinefenster Website/konfigurator.html" | head -5
```

In der Funktion `_renderFenster3d()` (Z. ~8746) BEIDE `postMessage`-Aufrufe (onload-Variante + Live-Variante) auf folgenden Payload erweitern:

```js
cw.postMessage({
  type: 'update',
  layout:     S.fluegel || '1-fluegel',
  sashes:     [S.oeff1, S.oeff2, S.oeff3].filter(Boolean),
  oberlicht:  S.oberlichtOeff || 'fest',
  unterlicht: S.unterlichtOeff || 'fest',
  color: isWood ? null : _ck,
  wood:  isWood ? _ck  : null,
  glass: S.glasdekor || 'klar',
  side:  _side
}, '*');
```

- [ ] **Step 2: Live-Test via Konfigurator**

Konfigurator-URL öffnen, Kunststoff-Fenster wählen, Aufteilung in Schritt 3 wechseln. Das 3D rechts muss umbauen.

- [ ] **Step 3: Commit**

```bash
git add konfigurator.html
git commit -m "konfigurator: _renderFenster3d sendet Layout + Sash-States ans 3D"
```

---

## Task 8: Konfigurator — Default-Sash-States bei Aufteilungswechsel

**Files:**
- Modify: `konfigurator.html` — Stelle wo `S.fluegel` gesetzt wird (Click-Handler in Schritt 3)

- [ ] **Step 1: Helper-Funktion einfügen**

In `konfigurator.html` nach den anderen Helper-Funktionen (suche `function setS\|function set`):

```js
// Default-Sash-States setzen wenn Aufteilung gewechselt und State noch leer
function _applyDefaultSashStates(fluegelKey) {
  const m = (fluegelKey || '1-fluegel').match(/^(\d)-/);
  const cols = m ? parseInt(m[1], 10) : 1;
  const defaults = cols === 1 ? ['dk-r']
                 : cols === 2 ? ['dk-l', 'dk-r']
                 : cols === 3 ? ['dk-l', 'fest', 'dk-r']
                 : ['dk-r'];
  // Nur setzen wenn leer ODER wenn Anzahl Flügel sich geändert hat
  const currentCount = [S.oeff1, S.oeff2, S.oeff3].filter(Boolean).length;
  if (currentCount !== cols) {
    S.oeff1 = defaults[0] || null;
    S.oeff2 = defaults[1] || null;
    S.oeff3 = defaults[2] || null;
  }
  // Lichten-Defaults
  const fk = fluegelKey || '';
  if (fk.includes('oberlicht') || fk.includes('ober-unter')) {
    S.oberlichtOeff = S.oberlichtOeff || 'fest';
  }
  if (fk.includes('unterlicht') || fk.includes('ober-unter')) {
    S.unterlichtOeff = S.unterlichtOeff || 'fest';
  }
}
```

- [ ] **Step 2: Im Aufteilungs-Click-Handler aufrufen**

Suche `S.fluegel = ` Stellen:

```bash
grep -n "S\.fluegel\s*=" "/Users/buissnesaccount/deinefenster Website/konfigurator.html"
```

An jeder Stelle wo `S.fluegel = ...` gesetzt wird (ausser bei der State-Reset-Initialisierung), direkt danach einfügen:

```js
  _applyDefaultSashStates(S.fluegel);
```

- [ ] **Step 3: Live-Test**

Konfigurator → Kunststoff-Fenster → Aufteilung wechseln auf 2-Flügel. Im 3D müssen zwei Flügel mit DK-l (Griff rechts) + DK-r (Griff links) erscheinen. Wechseln auf 3-Flügel: links DK-l, Mitte fest (kein Griff), rechts DK-r.

- [ ] **Step 4: Commit**

```bash
git add konfigurator.html
git commit -m "konfigurator: Default-Sash-States bei Aufteilungswechsel"
```

---

## Task 9: Konfigurator — Trigger bei Öffnungsart pro Flügel

**Files:**
- Modify: `konfigurator.html` — Stellen wo `S.oeff1`, `S.oeff2`, `S.oeff3` gesetzt werden

- [ ] **Step 1: Aktuelle Trigger finden**

```bash
grep -n "S\.oeff[123]\s*=\|S\.oberlichtOeff\s*=\|S\.unterlichtOeff\s*=" "/Users/buissnesaccount/deinefenster Website/konfigurator.html" | head -20
```

- [ ] **Step 2: Nach jeder Zuweisung sicherstellen dass `_renderFenster3d()` getriggert wird**

Bestehende Click-Handler für oeff1/2/3 sollten bereits `drawPrev()` aufrufen (das wiederum `_renderFenster3d` aufruft). Falls nicht, ergänzen.

Verifikation: Konfigurator öffnen, Schritt 4 wählen. Wenn pro-Flügel-Öffnungsart geklickt → 3D-Griffe müssen umspringen.

- [ ] **Step 3: Falls Trigger fehlen**

In dem Click-Handler-Block der Öffnungsart wählt (suche nach `dataset.v1` oder ähnlichem):

```js
// nach der State-Zuweisung
if (typeof drawPrev === 'function') drawPrev();
```

- [ ] **Step 4: Visueller Test**

Schritt 4 alle 6 Öffnungsarten durchklicken bei 2-Flügel und 3-Flügel. Griffe müssen sich live ändern.

- [ ] **Step 5: Commit**

```bash
git add konfigurator.html
git commit -m "konfigurator: Live-Trigger 3D-Update bei Öffnungsart pro Flügel"
```

---

## Task 10: Visuelle End-Verifikation

- [ ] **Step 1: Pre-Push Smart-Quote-Check**

```bash
cd "/Users/buissnesaccount/deinefenster Website"
python3 scripts/check-html-smart-quotes.py konfigurator.html fenster-3d.html
```

Erwartet: "OK — keine Smart-Quotes".

- [ ] **Step 2: Push live**

```bash
git push live HEAD:main
```

Warte ~60s bis GitHub Pages deployed hat.

- [ ] **Step 3: Live-Test im Browser**

`https://deinefenster.de/konfigurator.html` öffnen, Kunststoff-Fenster wählen. Folgende 12 Aufteilungen durchklicken und visuell prüfen:

1. 1-Flügel — ein Flügel mit DK-Griff rechts (default `dk-r` → Griff links). ✓ wenn Aussehen wie bisher
2. 2-Flügel — zwei halbe Flügel + Mittel-Pfosten, beide mit Griff (links DK-l = Griff rechts, rechts DK-r = Griff links)
3. 3-Flügel — drei drittel-Flügel + 2 Pfosten, Mitte ohne Griff
4. 1-Oberlicht — ein Flügel unten + Oberlicht oben (fest, kein Griff im Oberlicht)
5. 2-Oberlicht — wie 2-Flügel + Oberlicht
6. 3-Oberlicht — wie 3-Flügel + Oberlicht
7. 1-Unterlicht — ein Flügel oben + Unterlicht unten
8. 2-Unterlicht — wie 2-Flügel + Unterlicht
9. 3-Unterlicht — wie 3-Flügel + Unterlicht
10. 1-Ober-Unter — Flügel mittig, Lichten oben + unten
11. 2-Ober-Unter — wie 10 mit 2 Hauptflügeln
12. 3-Ober-Unter — wie 10 mit 3 Hauptflügeln

- [ ] **Step 4: Öffnungsart-Wechsel testen**

Bei 2-Flügel in Schritt 4 für linken Flügel `kipp` wählen. Griff am linken Flügel muss nach oben springen. Bei `fest` Griff verschwinden.

- [ ] **Step 5: Farbe + Glas Test**

Schritt 6: Anthrazit wählen → alle Sashes + Pfosten + Rahmen werden anthrazit. Glas auf Chinchilla → Muster sichtbar in allen Sashes inkl. Lichten.

- [ ] **Step 6: Schnell-Klick-Test (Memory-Leak-Check)**

Zwischen 1-Flügel ↔ 3-Ober-Unter 10× hin und her klicken. Console öffnen — keine THREE.js-Warnings, kein Lag.

- [ ] **Step 7: Bei Erfolg: Final-Commit-Tag**

```bash
git tag -a "fenster-3d-aufteilungen-v1" -m "Alle 12 Flügelaufteilungen + Griff-Logik live"
```

---

## Erfolgskriterien (Spec-Erinnerung)

- ✓ Alle 12 Aufteilungen visuell korrekt
- ✓ Griff passend zur Öffnungsart pro Flügel
- ✓ Farbe + Glas wirken einheitlich
- ✓ Live-Update <200ms
- ✓ Keine Console-Errors, kein Memory-Leak

## Bekannte Einschränkungen (für spätere Specs)

- Animation für mehrere Flügel: aktueller `toggleFensterOpen` klappt nur den ersten Sash auf. Echte Multi-Flügel-Animation kommt in eigener Spec.
- Maß-Variation (S.bMm/hMm) wird nicht ans 3D gegeben — Außenmaße bleiben 1000×1200.
- Stulp-Variante bei 2-Flügel zeigt aktuell Pfosten. Stulp-Modus später.
