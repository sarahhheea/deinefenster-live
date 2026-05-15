# STAND — DeineFenster.de (Stand 07.05.2026)

## OFFEN: shop-einstellen.html Login fixen
Apps Script muss neu deployed werden mit dem hardcodierten Passwort `Fenster2026`.
Sarah muss das einmal selbst im Google Apps Script Console machen (scripts/apps-script.js ist bereits aktualisiert).

---

## IN ARBEIT: Haustür Farben via Google Flow

### Status
| Modell | Status |
|--------|--------|
| alaska-1-inox | ✅ fertig (41 Farben) |
| florida-lr-inox | ✅ fertig (41 Farben) |
| montana-2-lr-inox | ✅ fertig (41 Farben) |
| montana-3-lr-inox | ⬜ offen |
| ohio-inox | ⬜ offen |
| colorado-inox | ⬜ offen |
| alaska-2-inox | ⬜ offen |
| montana-1-inox | ⬜ offen |
| nebraska-lcr-inox | ⬜ offen |
| pennsylvania-1-inox | ⬜ offen |
| texas-c-inox | ⬜ offen |
| texas-lr-inox | ⬜ offen |
| pennsylvania-2-lr-inox | ⬜ offen |
| pennsylvania-3-lr-inox | ⬜ offen |

### Dateiname-Schema
`haustuer_aussen_{modell}_{farbe}.png`
Ablage: `img/farben/`

### Referenzbilder (für Google Flow Upload)
| Modell | Referenzbild |
|--------|-------------|
| florida-lr-inox | img/drutex-tueren/florida-inox-lr_antracyt.jpg |
| colorado-inox | img/drutex-tueren/colorado-inox_antracyt.jpg |
| alle anderen | img/drutex-tueren/ → nachschauen |

---

## GOOGLE FLOW PROMPTS — MASTER VORLAGE

Ersetze `{MODELL}` mit dem jeweiligen Modellnamen (z.B. "Florida LR Inox").
Lade immer das Referenzbild des Modells in Anthrazit als Basis hoch.

### Runde 1 — anthraz-gl · anthraz-um · anthrazit · basaltgr-gl
```
Recolor this exact door model "{MODELL}" keeping all shapes, glass, handle, frame and proportions identical. Show 4 color variants in a 2×2 grid:
Top-left: Anthracite glossy (RAL 7016, high-gloss finish)
Top-right: Anthracite dual-color (RAL 7016 outside, white inside — only outside visible)
Bottom-left: Anthracite matte (RAL 7016, smooth matte finish)
Bottom-right: Basalt grey glossy (RAL 7012, dark grey, high-gloss)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._anthraz-gl.png` · `..._anthraz-um.png` · `..._anthrazit.png` · `..._basaltgr-gl.png`

### Runde 2 — basaltgr-sa · betongrau · braun-mar · brillblau
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Basalt grey satin (RAL 7012, satin finish)
Top-right: Concrete grey (warm medium grey, smooth matte)
Bottom-left: Brown marbled (dark brown with subtle marble texture)
Bottom-right: Brilliant blue (deep royal blue, smooth matte)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._basaltgr-sa.png` · `..._betongrau.png` · `..._braun-mar.png` · `..._brillblau.png`

### Runde 3 — cremeweiss · crown-plat · deep-bronze · douglasie
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Cream white (warm off-white, slightly warm tone, smooth)
Top-right: Crown platinum (silver-platinum metallic finish)
Bottom-left: Deep bronze (dark bronze metallic)
Bottom-right: Douglas fir (natural pine wood grain, warm honey tones)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._cremeweiss.png` · `..._crown-plat.png` · `..._deep-bronze.png` · `..._douglasie.png`

### Runde 4 — dunkelgr · dunkelrot · dunkleiche · eiche-hell
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Dark grey (RAL 7043, traffic grey, matte)
Top-right: Dark red (deep burgundy red, RAL 3005, matte)
Bottom-left: Dark oak (dark brown oak wood grain)
Bottom-right: Light oak (pale golden oak wood texture)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._dunkelgr.png` · `..._dunkelrot.png` · `..._dunkleiche.png` · `..._eiche-hell.png`

### Runde 5 — eiche-nat · eisengl · golden-oak · grafitgr
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Natural oak (medium natural oak wood grain)
Top-right: Iron mica (very dark grey-black with sparkling metallic mica particles)
Bottom-left: Golden oak (warm golden-yellow oak wood grain)
Bottom-right: Graphite grey (RAL 7024, dark graphite, matte)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._eiche-nat.png` · `..._eisengl.png` · `..._golden-oak.png` · `..._grafitgr.png`

### Runde 6 — jet-black · lichtgrau · macore · mahagoni
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Jet black (pure black, ultra-smooth matte, RAL 9005)
Top-right: Light grey (RAL 7035, light cool grey, matte)
Bottom-left: Macore (exotic African hardwood, reddish-brown with fine grain)
Bottom-right: Mahogany (classic mahogany reddish-brown wood grain)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._jet-black.png` · `..._lichtgrau.png` · `..._macore.png` · `..._mahagoni.png`

### Runde 7 — mooreiche · moosgruen · nussbaum · oregon
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Bog oak (very dark almost black aged oak wood grain)
Top-right: Moss green (RAL 6005, deep forest green, matte)
Bottom-left: Walnut (warm dark walnut wood grain)
Bottom-right: Oregon pine (light pine wood, bright natural grain)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._mooreiche.png` · `..._moosgruen.png` · `..._nussbaum.png` · `..._oregon.png`

### Runde 8 — piryt · quarzgr-gl · quarzgr-sa · schiefgr-gl
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Pyrite (dark olive-metallic with golden-grey shimmer)
Top-right: Quartz grey glossy (RAL 7039, medium grey, high-gloss)
Bottom-left: Quartz grey satin (RAL 7039, medium grey, satin finish)
Bottom-right: Slate grey glossy (RAL 7015, blue-grey, high-gloss)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._piryt.png` · `..._quarzgr-gl.png` · `..._quarzgr-sa.png` · `..._schiefgr-gl.png`

### Runde 9 — schiefgr-sa · schoko-br · schwarz-um · schwarzbr
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Top-left: Slate grey satin (RAL 7015, blue-grey, satin finish)
Top-right: Chocolate brown (RAL 8017, warm dark chocolate brown)
Bottom-left: Black dual-color (RAL 9005 outside, white inside — only outside visible)
Bottom-right: Black-brown (very dark brown almost black, RAL 8022)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._schiefgr-sa.png` · `..._schoko-br.png` · `..._schwarz-um.png` · `..._schwarzbr.png`

### Runde 10 — sheffield · stahlblau · weiss-fx · weiss
```
Recolor this exact door model "{MODELL}", 4 variants 2×2 grid:
Oben links: Sheffield Oak Light (helles cremiges Eichenholz-Dekor, warme beige-blonde Holzmaserung, sehr hell)
Top-right: Steel blue (muted blue-grey, RAL 5011, steel tone)
Bottom-left: White FX (pure white with subtle surface texture effect)
Bottom-right: White (RAL 9016, pure smooth white, matte)
White background, frontal view, photorealistic, no shadows.
```
Dateinamen: `..._sheffield.png` · `..._stahlblau.png` · `..._weiss-fx.png` · `..._weiss.png`

### Runde 11 — winchester (einzeln)
```
Recolor this exact door model "{MODELL}" in one color:
Winchester (warm medium-brown wood grain with reddish undertone, classic English oak look)
White background, frontal view, photorealistic, no shadows.
```
Dateiname: `..._winchester.png`

---

## OFFEN: Innenseite Haustür
Innenansicht mit Klinke + Scharnieren, in allen Farben — nach den Außenansichten.
