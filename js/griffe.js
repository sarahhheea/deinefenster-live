/* griffe.js — Fenstergriffe als eigene Vektorbauteile, unabhängig von skizze2.js.
 *
 * Warum eigenständig: Schritt 2a der Griff-Recherche zeichnet die fünf Griffmodelle aus der
 * Drutex-Broschüre (recherche/quellen/okna_brochure_de.pdf, S. 8 „Aluminiumgriffe für Fenster
 * und Balkontüren“) als eigene Silhouetten nach — nicht den generischen Einheitsgriff, den
 * skizze2.js heute für jedes Modell gleich zeichnet. skizze2.js bleibt unberührt; dieses Modul
 * wird erst nach Betriebs Freigabe des Blatts dort eingehängt.
 *
 * Grundsätze wie skizze2.js: nur Vektor (kein <image>), Millimeter, Daten/Maße rein, SVG-Text
 * raus. Look „Stufe 3“ (Betrieb 21.09.2026 am Realismus-Blatt freigegeben, siehe Leitregeln.md #4):
 * dezenter Metall-Verlauf, dünne dunklere Kontur, kleine Lichtkante — keine Flächenverläufe
 * darüber hinaus, keine Spiegelung, kein Schlagschatten.
 *
 * Maße (Zeichenannahme, kein Herstellerbeleg — Drutex veröffentlicht auf S. 8 keine
 * Maßzeichnung, nur Fotos): Hebellänge ~130 mm, Rosette ~30×65 mm senkrechtes Langrund —
 * dieselbe Annahme wie skizze2.js GRIFF (129/31×62, Recherche 14.09.2026, HOPPE-Maßzeichnung
 * Toulon als Referenzgröße für einen vergleichbaren Fenstergriff). Die Silhouette je Modell
 * (gerade/geschwungen, spitz/eckig, Rosettenform) ist aus dem Foto S. 8 abgezeichnet, an der
 * Frontalansicht jedes Griffpaars (immer der linke, unverschlossene Griff im Foto).
 */
(function (global) {
  'use strict';

  function z(n) { return Math.round(n * 100) / 100; }

  /* -------------------------------------------------------------- Grundmaß
   * Referenzlänge, auf die sich laengeMm skaliert (siehe Kommentar oben): Rosettenmitte bis
   * Hebelende, wie skizze2.js GRIFF.laenge. */
  var REF_LAENGE = 130;

  /* ------------------------------------------------------- 3/4-Ansicht — Messung 21.09.2026
   * Alle fünf Fotos (S. 8) zeigen den Griff nicht frontal, sondern leicht von schräg vorn: man
   * sieht die Rosette mit einer schmalen Seitenfläche, einen HALS, der sichtbar nach vorn/seitlich
   * aus der Rosette heraustritt (eigene Licht-/Schattenfläche), und erst danach den Hebel — nicht
   * Rosette und Hebel direkt überlappend wie in der ersten Fassung dieses Moduls. Gemessen an den
   * 300-dpi-Ausschnitten (`recherche/quellen/griffe/<modell>.png`, jeweils der linke Griff einer
   * Zweiergruppe, per Sobel-Kantenmaske freigestellt — Skript nicht Teil des Repos, Werte hier
   * festgehalten): Rosettenfront nimmt die oberen ~13 % der Gesamthöhe (Rosettenoberkante bis
   * Hebelspitze) ein, der Hals-Klotz ~13–43 %, der Hebel selbst die restlichen ~57 %. Die
   * Hals-Mitte liegt bei allen fünf Modellen 0,4–0,55 Rosettenbreiten rechts der Rosettenmitte,
   * die Hebel-Mitte 0,9–1,3 Rosettenbreiten rechts davon — dieser seitliche Versatz *ist* die
   * Schrägansicht und war die eigentliche Lücke der ersten Fassung. Die Hebelbreite blieb bei
   * allen fünf Modellen über die volle Länge nahezu konstant (kein Keil, anders als zuerst
   * angenommen); nur Mistral/Nevada haben eine geschwungene Mittelachse. */
  /* Nachgezogen 21.09.2026, zweite Fassung: die erste Fassung setzte den Hals als eigenen,
     deutlich breiteren Klotz — er wirkte wie eine zweite kleine Rosette statt wie ein
     Übergangsstück. Jetzt näher an der Rosette (weniger Versatz), kürzer, schmaler (nah an der
     Hebelbreite, aus der er ja herauswächst) und mit weniger eigener Tiefe. */
  var ANSICHT = {
    rosetteEnde: 0.13,   // Anteil der Gesamthöhe, ab dem der Hals beginnt
    halsEnde: 0.30,      // Anteil, ab dem der Hebelschaft beginnt
    halsVersatz: 0.30,   // Hals-Mitte rechts der Rosettenmitte, in Rosettenbreiten
    hebelVersatz: 0.55,  // Hebel-Mitte rechts der Rosettenmitte, in Rosettenbreiten
    tiefeRosette: 0.22,  // Seitenfläche der Rosette, in Rosettenbreiten
    tiefeHals: 0.4,      // Seitenfläche des Halses, in Rosettenbreiten
    tiefeHebel: 0.34     // Seitenfläche des Hebels, in Hebelbreiten
  };

  /* ---------------------------------------------------------- Modelle (5)
   * kurve:     0 = gerade Hebelachse, sonst Schwung nach rechts wie Mistral/Nevada (mm bei f=1)
   * hebelB:    Hebelbreite in Rosettenbreiten. Nachgemessen 22.09.2026 (Design-Review am Blatt
   *            blatt/griffe-realistisch.png, Koordinator-Korrektur): die ursprünglichen Werte
   *            (Mistral/Nevada ~0,7, Quadrat ~0,75, Dublin ~0,85) waren an den Fotos S. 8 zu
   *            breit gegenüber der Rosette — Schritt 2b (Zeile 96 ff.) hatte für die dort neu
   *            gezeichneten zehn Modelle bereits auf 0,32–0,42 korrigiert, die ersten fünf blieben
   *            beim alten, zu fetten Wert. Jetzt an dieselbe Bandbreite angeglichen (0,38–0,45,
   *            an den Fotos mit Lineal am Bildschirm nachgemessen: Hebelbreite ≈ 0,4× Rosettenbreite
   *            bei allen fünf). Der Hals-/Hebel-Versatz (masse() versatzSkala) skaliert automatisch
   *            mit herunter — das behebt zugleich die zu weit rechts sitzende Halsmitte.
   * spitze:    Hebelende gerundet (Mistral/Nevada) oder mit kleiner Fase (die anderen drei)
   * rosette:   'langrund' (schmal-hoch, voll abgerundet) oder 'rechteck' (Ecken nur leicht rund)
   * rosB/rosH: Rosettenmaß in mm bei f=1, wo das Foto sichtbar von 30×65 abweicht
   * Quelle je Zeile: Foto S. 8, Spalte des Modells, linker (unverschlossener) Griff.        */
  var MODELLE = {
    mistral: { kurve: 30, hebelB: 0.40, spitze: true, rosette: 'langrund', rosB: 28, rosH: 66 },
    nevada:  { kurve: 14, hebelB: 0.42, spitze: true, rosette: 'rechteck', rosB: 34, rosH: 52 },
    quadrat: { kurve: 0,  hebelB: 0.40, spitze: false, rosette: 'rechteck', rosB: 30, rosH: 56 },
    dublin:  { kurve: 0,  hebelB: 0.45, spitze: false, rosette: 'rechteck', rosB: 32, rosH: 62 },
    g1033:   { kurve: 0,  hebelB: 0.40, spitze: false, rosette: 'rechteck', rosB: 30, rosH: 58 },

    /* ------------------------------------------------------- Schritt 2b — Rest der Broschüre
     * Zehn weitere Modelle von S. 8 (Ausschnitte `recherche/quellen/griffe/<id>.png`, 300 dpi,
     * jeweils der linke/unverschlossene Griff einer Gruppe — bei Einzelfotos das ganze Foto).
     * Schlüssel = exakte Katalog-Id aus fenster.mjs GRIFFE / balkontuer.mjs GRIFFE bzw.
     * BALKONGRIFFE, oder der griff_modell-Wert 'abnehmbar'; 'abschliessbar' ist ausnahmsweise
     * der Wert des `griff`-Merkmals (nicht griff_modell) — Drutex zeigt dafür auf S. 8 ein
     * eigenes Foto „Abschließbarer Griff mit TBT-Funktion“, das nicht über den generischen
     * abschliessbar-Zylinder (griffSvg opts.abschliessbar) hinausgeht.
     * Maße mit Quelle in recherche/griffe-und-profile-original.md (Secustik Hamburg 127 mm,
     * Rosette 29×66; Secuforte Hamburg 129, 31×69; Atlanta 139, 43×66; Toulon-Rosette 31×62-63);
     * die übrigen (Secustik/Secuforte-Toulon-Länge, MA1010, abnehmbar, balkon, balkon1033) sind
     * an den Ausschnitten abgezeichnete Zeichenannahmen wie bei den ersten fünf Modellen.
     *
     * Nachgezogen 22.09.2026 (Koordinator-Review am ersten Blatt): hebelB deutlich runter (die
     * erste Fassung wirkte wie ein Block, Foto zeigt schlanke ~1:7–1:9-Hebel — an den
     * Ausschnitten `recherche/quellen/griffe/*.png`, 2×-Vergrößerung, mit Lineal am Bild
     * nachgemessen: Hebelbreite ≈ 0,35–0,45× Rosettenbreite, nicht 0,7–0,85×). Neue Felder:
     * welle (die geriffelte Griffmulde auf der Rückkante bei allen Hoppe-Secustik/-Secuforte-
     * und der Atlanta-Reihe, gut sichtbar auf den Fotos als 4–5 helle/dunkle Wellen),
     * halsRund (runder statt eckiger Halsklotz — Hamburg/Atlanta/Balkon haben eine runde
     * Rosette UND einen runden Hals, Toulon/1033 einen eckigen Hals auch bei runder Rosette). */
    'secustik-toulon':  { kurve: 0,  hebelB: 0.40, spitze: false, rosette: 'rechteck', rosB: 31, rosH: 62, welle: true },
    'secuforte-toulon': { kurve: 0,  hebelB: 0.40, spitze: false, rosette: 'rechteck', rosB: 31, rosH: 63, welle: true },
    'secustik-hamburg': { kurve: 0,  hebelB: 0.38, spitze: false, rosette: 'langrund', rosB: 29, rosH: 66, welle: true, halsRund: true },
    'secuforte-hamburg':{ kurve: 0,  hebelB: 0.38, spitze: false, rosette: 'langrund', rosB: 31, rosH: 69, welle: true, halsRund: true },
    // Atlanta: starker Schwung wie Mistral, aber deutlich schlanker, mit Wellenkante (Foto S. 8
    // dritte Spalte oben — der Hebel biegt unten fast zum Haken, schlanker als Mistral).
    'secustik-atlanta': { kurve: 40, hebelB: 0.32, spitze: true,  rosette: 'langrund', rosB: 43, rosH: 66, welle: true, halsRund: true },
    // MA1010: klares L — Rosette oval, waagerechter runder Hals-Arm, dann rechtwinklig gerade
    // nach unten (kein Schwung, kein Keil). form:'L' schaltet die eigene Achse in hebelFlaechen()
    // scharf, buerstet zieht eine zweite, feinere Lichtlinie für den Edelstahl-Look.
    ma1010:             { form: 'L', armLaenge: 0.85, hebelB: 0.34, spitze: false, rosette: 'langrund', rosB: 32, rosH: 64, buerstet: true },
    // Abnehmbar: kein Rosettenfoto (nur ein Vierkantstummel statt Rosette) — Rosette klein
    // gezeichnet, starker Schwanenhals-Schwung wie auf dem Foto, Wellenkante.
    abnehmbar:          { kurve: 42, hebelB: 0.42, spitze: true,  rosette: 'langrund', rosB: 16, rosH: 20, welle: true },
    // Abschließbar mit TBT: rundes Rosette+Zylinder (Foto zeigt Rundrosette, nicht eckig wie
    // zuerst angenommen), gerader schlanker Hebel.
    abschliessbar:      { kurve: 0,  hebelB: 0.40, spitze: false, rosette: 'langrund', rosB: 31, rosH: 62 },
    // Balkontürgriff: ovale Rosette, runder Hals, leichter Schwung (Foto: näher an Hamburg als
    // an Dublin).
    balkon:             { kurve: 18, hebelB: 0.38, spitze: false, rosette: 'langrund', rosB: 32, rosH: 64, halsRund: true },
    // Balkontürgriff 1033: eckige, breite Rosette fast wie ein Schild (T-Form mit dem Hebel),
    // deutlich weniger schlank als die Fenstergriffe.
    balkon1033:         { kurve: 0,  hebelB: 0.55, spitze: false, rosette: 'rechteck', rosB: 34, rosH: 58 },
    // Standard (Iglo 5, K S. 70/71 `recherche/quellen/render/griffe-crop.png`): Schwanenhals,
    // Betriebs erster Katalogwert vor jeder Auswahl — bisher unbelegt, jetzt mit Foto.
    standard:           { kurve: 34, hebelB: 0.42, spitze: true,  rosette: 'langrund', rosB: 28, rosH: 64, halsRund: true }
  };

  /* --------------------------------------------------------------- Farben
   * Dieselben acht Farben, die die Broschüre S. 8 unten für alle Griffmodelle listet: „Weiß,
   * Braun, Silber, Titan, Anthrazit, Schwarz, Altmessing, Creme“ (Fußnote: Verfügbarkeit je
   * Griffmodell abhängig — hier trotzdem alle acht angeboten, echte Einschränkung ist Aufgabe
   * des Bestellwegs, nicht der Zeichnung). Verlaufsfarben als Bildschirmnäherung wie in
   * skizze2.js GRIFF_STIL (Recherche 07/16.09.2026) — dieselben Hex-Werte, damit ein Griff auf
   * dem Fenster und dieses Blatt gleich aussehen. */
  var FARBEN = {
    weiss:     { rand: '#e6e9ec', mitte: '#ffffff', schatten: '#dde1e5', kontur: '#4a545e', licht: 'stark' },
    silber:    { rand: '#c3c9cf', mitte: '#f4f6f8', schatten: '#b3bac1', kontur: '#5f6972', licht: 'stark' },
    titan:     { rand: '#5c6266', mitte: '#9aa0a3', schatten: '#4a5054', kontur: '#3d4245', licht: 'schwach' },
    anthrazit: { rand: '#2a2f33', mitte: '#4a5156', schatten: '#22262a', kontur: '#9aa3ab', licht: 'schwach' },
    schwarz:   { rand: '#0a0a0a', mitte: '#2c2c2e', schatten: '#050505', kontur: '#8f989f', licht: 'schwach' },
    braun:     { rand: '#352f2f', mitte: '#544b4b', schatten: '#2e2828', kontur: '#9a9090', licht: 'schwach' },
    altmessing:{ rand: '#9c8141', mitte: '#e3cf8f', schatten: '#8a7440', kontur: '#7a6635', licht: 'stark' },
    creme:     { rand: '#dcd3c3', mitte: '#f1e9dc', schatten: '#d4cab9', kontur: '#7d766b', licht: 'stark' }
  };

  var MODELL_NAMEN = Object.keys(MODELLE).join(', ');
  var FARB_NAMEN = Object.keys(FARBEN).join(', ');

  /* Maße in lokalen mm ableiten (Ursprung = Rosettenmitte, y wächst nach unten, wie in
     skizze2.js griff()). Alles, was die drei Bauteile (Rosette/Hals/Hebel) braucht, an einer
     Stelle berechnet, damit Front- und Seitenfläche exakt zusammenpassen. */
  function masse(m, f) {
    // Der seitliche Versatz (ANSICHT.halsVersatz/hebelVersatz) ist an den ersten fünf, eher
    // kräftigen Hebeln (hebelB ~0,72–0,85) kalibriert. Schritt 2b zeichnet deutlich schlankere
    // Hebel (~0,3–0,4) — ungeändert ergäbe das einen freischwebenden Hals-Klotz neben einem
    // dünnen Stab (Koordinator-Review 22.09.2026). Der Versatz skaliert daher proportional zur
    // Hebelbreite mit, damit Hals/Hebel bei jeder Breite sichtbar aus derselben Rosette wachsen.
    var versatzSkala = Math.min(1, m.hebelB / 0.75);
    var rosB = m.rosB * f, rosH = m.rosH * f,
        rosTop = -rosH / 2,
        tipY = REF_LAENGE * f,                       // Hebelspitze — laengeMm ab Rosettenmitte
        spanne = tipY - rosTop,
        halsStartY = rosTop + ANSICHT.rosetteEnde * spanne,
        halsEndeY = rosTop + ANSICHT.halsEnde * spanne,
        halsCx = ANSICHT.halsVersatz * versatzSkala * rosB,
        hebelCx = ANSICHT.hebelVersatz * versatzSkala * rosB,
        hebelB = m.hebelB * rosB;
    return { rosB: rosB, rosH: rosH, rosTop: rosTop, tipY: tipY, halsStartY: halsStartY,
             halsEndeY: halsEndeY, halsCx: halsCx, hebelCx: hebelCx, hebelB: hebelB };
  }

  /* Rundrechteck als Pfad (statt <rect>), damit Front- und Seitenfläche über denselben
     Pfad-Mechanismus laufen und sich sauber am Rand treffen. */
  function rundrechteckPfad(cx, y0, y1, b, r) {
    var xl = cx - b / 2, xr = cx + b / 2;
    r = Math.min(r, b / 2, (y1 - y0) / 2);
    return 'M ' + z(xl) + ' ' + z(y0 + r) +
      ' Q ' + z(xl) + ' ' + z(y0) + ' ' + z(xl + r) + ' ' + z(y0) +
      ' L ' + z(xr - r) + ' ' + z(y0) +
      ' Q ' + z(xr) + ' ' + z(y0) + ' ' + z(xr) + ' ' + z(y0 + r) +
      ' L ' + z(xr) + ' ' + z(y1 - r) +
      ' Q ' + z(xr) + ' ' + z(y1) + ' ' + z(xr - r) + ' ' + z(y1) +
      ' L ' + z(xl + r) + ' ' + z(y1) +
      ' Q ' + z(xl) + ' ' + z(y1) + ' ' + z(xl) + ' ' + z(y1 - r) +
      ' Z';
  }

  /* Rosette: Frontfläche (Rundrechteck oder Langrund) plus schmale Seitenfläche rechts — die
     Seitenfläche macht aus der Draufsicht die 3/4-Ansicht des Fotos (Rosette „mit Tiefe“, nicht
     flach aufgeklebt). */
  function rosetteFlaechen(m, ma) {
    var r = m.rosette === 'langrund' ? ma.rosB / 2 : ma.rosB * 0.1,
        front = rundrechteckPfad(0, ma.rosTop, ma.rosTop + ma.rosH, ma.rosB, r),
        tiefe = ANSICHT.tiefeRosette * ma.rosB,
        xr = ma.rosB / 2,
        seite = 'M ' + z(xr - r * 0.3) + ' ' + z(ma.rosTop + r * 0.3) +
          ' L ' + z(xr + tiefe) + ' ' + z(ma.rosTop + tiefe * 0.6) +
          ' L ' + z(xr + tiefe) + ' ' + z(ma.rosTop + ma.rosH - tiefe * 0.6) +
          ' L ' + z(xr - r * 0.3) + ' ' + z(ma.rosTop + ma.rosH - r * 0.3) + ' Z';
    return { front: front, seite: seite };
  }

  /* Hals: der Klotz, der die Rosette mit dem Hebel verbindet und im Foto sichtbar nach vorn/
     seitlich heraustritt (die Hauptlücke der ersten Fassung). Frontfläche + Seitenfläche wie bei
     der Rosette, aber weiter rechts versetzt (ANSICHT.halsVersatz) und schmaler. */
  function halsFlaechen(m, ma) {
    var b = ma.hebelB * 1.1, r = b * (m.halsRund ? 0.5 : 0.3),
        front = rundrechteckPfad(ma.halsCx, ma.halsStartY, ma.halsEndeY, b, r),
        tiefe = ANSICHT.tiefeHals * ma.rosB, xr = ma.halsCx + b / 2,
        seite = 'M ' + z(xr - r * 0.3) + ' ' + z(ma.halsStartY + r * 0.3) +
          ' L ' + z(xr + tiefe) + ' ' + z(ma.halsStartY + tiefe * 0.35) +
          ' L ' + z(xr + tiefe) + ' ' + z(ma.halsEndeY - tiefe * 0.15) +
          ' L ' + z(xr - r * 0.3) + ' ' + z(ma.halsEndeY) + ' Z';
    return { front: front, seite: seite };
  }

  /* Hebelachse: bei Mistral/Nevada ein sanfter Schwung (kubisch, glatt aus dem Hals heraus und
     zur Spitze hin wieder ausklingend), sonst eine Gerade — beides mit KONSTANTER Hebelbreite
     (Messung 21.09.2026: der Keil der ersten Fassung war ein Foreshortening-Effekt der 3/4-
     Ansicht, kein echter Formunterschied). n Stützpunkte für eine glatte Polylinie. */
  function achse(m, ma, n) {
    var y0 = ma.halsEndeY, y1 = ma.tipY, pts = [];
    // MA1010 (form:'L'): kein Schwung entlang y — erst ein waagerechter Arm aus dem Hals, dann
    // im rechten Winkel gerade nach unten (Foto: ovale Rosette, runder Arm zur Seite, dann
    // scharfer Knick in den geraden Hebel — kein Foreshortening-Schwung wie bei den anderen).
    if (m.form === 'L') {
      var armX = ma.hebelCx + m.armLaenge * ma.rosB, armY = y0 + (y1 - y0) * 0.06,
          nArm = Math.max(3, Math.round(n * 0.3)), nAb = n - nArm, i;
      for (i = 0; i <= nArm; i++) {
        var ta = i / nArm;
        pts.push({ x: ma.hebelCx + (armX - ma.hebelCx) * ta, y: armY, t: ta * 0.3 });
      }
      for (i = 1; i <= nAb; i++) {
        var tb = i / nAb;
        pts.push({ x: armX, y: armY + (y1 - armY) * tb, t: 0.3 + tb * 0.7 });
      }
      return pts;
    }
    for (var j = 0; j <= n; j++) {
      var t = j / n, y = y0 + (y1 - y0) * t;
      pts.push({ x: ma.hebelCx, y: y, t: t });
    }
    if (m.kurve) {
      // easeOutCubic: schwingt rasch aus dem Hals heraus und pendelt sich zur Spitze hin ein —
      // wie im Foto (Mistral/Nevada), wo der Versatz nach dem Hals kaum noch zunimmt.
      pts.forEach(function (p) {
        var e = 1 - Math.pow(1 - p.t, 3);
        p.x = ma.hebelCx + m.kurve * e;
      });
    }
    return pts;
  }

  /* Wellenkante (Griffmulde): bei Hoppe Secustik/Secuforte (Toulon, Hamburg) und Atlanta läuft
     die Rückkante des Hebels nicht glatt, sondern in 4–5 flachen Wellen — auf den Fotos gut
     sichtbar als Wechsel heller/dunkler Streifen. Nur die Rückkante (linke Kontur, „-halbe“)
     bekommt die Welle; die sichtbare Frontkante bleibt glatt (Fotobeleg: die Welle liegt auf der
     dem Betrachter abgewandten Seite des Griffkörpers). Klingt an Hals und Spitze aus (kein
     Knick am Übergang). */
  function wellenVersatz(t, halbe) {
    var kanten = 0.08, mitte = 1 - 2 * kanten;
    if (t < kanten || t > 1 - kanten) return 0;
    var tm = (t - kanten) / mitte;
    return Math.sin(tm * Math.PI * 4.5) * halbe * 0.16;
  }

  /* MA1010: die generische achse()/hebelFlaechen()-Extrusion versetzt die Kontur immer in
     x-Richtung — für einen waagerechten Arm ergibt das nur einen dünnen Strich statt eines
     Balkens (die Dicke gehört bei einem waagerechten Stück nach y, nicht nach x). Eigene,
     rechtwinklige L-Kontur statt der geteilten achse()-Extrusion: ein Balken mit fester Dicke
     ma.hebelB, waagerecht aus dem Hals, dann im rechten Winkel senkrecht bis zur Spitze — wie
     auf dem Foto (`recherche/quellen/griffe/ma1010.png`). */
  function lFormFlaechen(m, ma) {
    var halbe = ma.hebelB / 2,
        armY0 = ma.halsEndeY, armY1 = armY0 + ma.hebelB,
        x0 = ma.hebelCx - halbe,
        x1 = ma.hebelCx + m.armLaenge * ma.rosB,
        yTip = ma.tipY, r = halbe * 0.5,
        tiefe = ANSICHT.tiefeHebel * ma.hebelB;
    // Außenkontur (oben+rechts) leicht gerundet, Innenknick (unten der Arm/links vom Hebel)
    // scharf — wie im Foto, wo die Außenkante des Knicks ein sauberer kleiner Radius ist.
    var front = 'M ' + z(x0) + ' ' + z(armY0) +
      ' L ' + z(x1 - halbe - r) + ' ' + z(armY0) +
      ' Q ' + z(x1 - halbe) + ' ' + z(armY0) + ' ' + z(x1 - halbe) + ' ' + z(armY0 + r) +
      ' L ' + z(x1 - halbe) + ' ' + z(yTip - r) +
      ' Q ' + z(x1 - halbe) + ' ' + z(yTip) + ' ' + z(x1 - halbe + r) + ' ' + z(yTip) +
      ' L ' + z(x1 + halbe) + ' ' + z(yTip) +
      ' L ' + z(x1 + halbe) + ' ' + z(armY0 - r) +
      ' Q ' + z(x1 + halbe) + ' ' + z(armY0 - halbe) + ' ' + z(x1 + halbe - r) + ' ' + z(armY0 - halbe) +
      ' L ' + z(x0) + ' ' + z(armY0 - halbe) + ' Z';
    var seite = 'M ' + z(x1 + halbe) + ' ' + z(armY0 - halbe) +
      ' L ' + z(x1 + halbe + tiefe) + ' ' + z(armY0 - halbe - tiefe * 0.4) +
      ' L ' + z(x1 + halbe + tiefe) + ' ' + z(yTip - tiefe * 0.4) +
      ' L ' + z(x1 + halbe) + ' ' + z(yTip) + ' Z';
    return { front: front, seite: seite, lichtX: x0 + 4, lichtX2: x1 - halbe * 0.3, tipY: yTip,
             lichtY: armY0 - halbe * 0.3, lichtY2: yTip - 8 };
  }

  function hebelFlaechen(m, ma) {
    if (m.form === 'L') return lFormFlaechen(m, ma);
    var pts = achse(m, ma, 14), halbe = ma.hebelB / 2,
        tiefe = ANSICHT.tiefeHebel * ma.hebelB,
        rSpitze = m.spitze ? halbe * 0.9 : halbe * 0.22,
        welleX0 = m.welle ? wellenVersatz(pts[0].t, halbe) : 0,
        front = 'M ' + z(pts[0].x - halbe + welleX0) + ' ' + z(pts[0].y);
    var i;
    for (i = 1; i < pts.length; i++) {
      var w = m.welle ? wellenVersatz(pts[i].t, halbe) : 0;
      front += ' L ' + z(pts[i].x - halbe + w) + ' ' + z(pts[i].y);
    }
    var tip = pts[pts.length - 1];
    front += ' Q ' + z(tip.x - halbe) + ' ' + z(tip.y + rSpitze) + ' ' + z(tip.x) + ' ' + z(tip.y + rSpitze);
    front += ' Q ' + z(tip.x + halbe) + ' ' + z(tip.y + rSpitze) + ' ' + z(tip.x + halbe) + ' ' + z(tip.y);
    for (i = pts.length - 2; i >= 0; i--) front += ' L ' + z(pts[i].x + halbe) + ' ' + z(pts[i].y);
    front += ' Z';
    /* Seitenfläche: dieselbe Achse, aber von der rechten Kante bis rechte Kante + Tiefe — ein
       schmaler, durchgehend dunklerer Streifen neben dem Hebel (Facette wie im Dublin-Foto). */
    var seite = 'M ' + z(pts[0].x + halbe) + ' ' + z(pts[0].y);
    for (i = 1; i < pts.length; i++) seite += ' L ' + z(pts[i].x + halbe) + ' ' + z(pts[i].y);
    seite += ' L ' + z(tip.x + halbe + tiefe) + ' ' + z(tip.y - tiefe * 0.4);
    for (i = pts.length - 1; i >= 0; i--) seite += ' L ' + z(pts[i].x + halbe + tiefe) + ' ' + z(pts[i].y);
    seite += ' Z';
    return { front: front, seite: seite, lichtX: pts[0].x - halbe * 0.35, lichtX2: tip.x - halbe * 0.35 * 0.4, tipY: tip.y };
  }

  /* Profilzylinder-Stirnfläche (Rosette am Fenster ODER Langschild an der Haustür): Kreis in
     hellem Zylinderstahl-Ton mit einem echten Schlüsselschlitz (schmales, leicht schräg
     stehendes Rechteck über den Kern) statt eines bloßen Mittelpunkts — auf 300-dpi-Fotos von
     Fenster-/Türbeschlägen ist der Schlitz das Merkmal, das den Kreis überhaupt als Zylinder statt
     als Niet oder Logo lesbar macht (Koordinator-Review 22.09.2026, Punkt 4). cx/cy/r in
     lokalen mm, kontur = Umrissfarbe des Griffs (Schlitz in derselben Farbe wie die Kontur, damit
     er sich vom hellen Zylinderkörper abhebt, egal welche Griff-/Profilfarbe gewählt ist). */
  function zylinderSvg(cx, cy, r, kontur, dicke) {
    var kernR = r * 0.62, schlitzL = r * 1.5, schlitzB = Math.max(0.35, r * 0.16);
    // Feinere Fassung 22.09.2026: dritter, ganz schmaler innerer Ring gibt dem PZ eine echte
    // Stahl-/Messing-Facette (statt zweier flacher Kreisflächen), Konturen dünner.
    var s = '<circle data-teil="zylinder" cx="' + z(cx) + '" cy="' + z(cy) + '" r="' + z(r) +
      '" fill="#dfe3e6" stroke="' + kontur + '" stroke-width="' + z(dicke * 0.5) + '"/>';
    s += '<circle cx="' + z(cx) + '" cy="' + z(cy) + '" r="' + z(r * 0.82) + '" fill="none" stroke="' +
      kontur + '" stroke-opacity=".3" stroke-width="' + z(dicke * 0.3) + '"/>';
    s += '<circle cx="' + z(cx) + '" cy="' + z(cy) + '" r="' + z(kernR) + '" fill="#c3c8cc" stroke="' +
      kontur + '" stroke-width="' + z(dicke * 0.32) + '"/>';
    s += '<rect x="' + z(cx - schlitzB / 2) + '" y="' + z(cy - schlitzL / 2) + '" width="' + z(schlitzB) +
      '" height="' + z(schlitzL) + '" rx="' + z(schlitzB * 0.3) + '" fill="' + kontur +
      '" transform="rotate(12 ' + z(cx) + ' ' + z(cy) + ')"/>';
    return s;
  }

  /* Hex-Farbe um Anteil t (-1..1) heller/dunkler mischen — für die Speculare-Lichtkante im
     Metallverlauf (heller als farbe.mitte) und die abgedunkelte Zone davor, OHNE eine zweite
     Verlaufs-Id zu brauchen (Tests prüfen, dass jede id im SVG exakt der eine erwartete Name
     ist — deshalb bleibt es bei einem <linearGradient>, nur mit mehr <stop>s). */
  /* Additiv statt Richtung-Weiß/Schwarz mischen (bis 22.09.2026: mische(hex, t) mischte t% des
     Wegs zu reinem Weiß/Schwarz — bei einer fast weißen Mittelfarbe (weiss.mitte = #ffffff) blieb
     das „helle Glanzband" dadurch IDENTISCH mit der Mittelfarbe, der Stoßgriff/Hebel wirkte flach
     (Design-Review 22.09.2026 „Stoßgriff wie eine einheitlich weiße Leiste"). Jetzt ein fester
     Helligkeits-Offset je Kanal, geklemmt auf 0..255 — dunkelt auch nahe Weiß sichtbar ab (255 →
     255-|t|·255 bleibt grau, nicht weiß), sättigt aber beim Aufhellen an Weiß (siehe glanz in
     verlaufDefs, dort deshalb bei „licht:stark" ein fester #ffffff-Stop statt eines Mischwerts). */
  function mische(hex, t) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g2 = (n >> 8) & 255, b = n & 255;
    var d = Math.round(t * 255);
    function kl(v) { return Math.max(0, Math.min(255, v + d)); }
    r = kl(r); g2 = kl(g2); b = kl(b);
    return '#' + [r, g2, b].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }

  /* Runder-Stab-Verlauf (Design-Review 22.09.2026 „Stoßgriff als echten Rundstab rendern — schmaler
     heller Kern + gestufte Grautöne auf beiden Seiten, ≥3 Bänder, dunkle dünne Kante"): Kante dunkel
     → Rand → abgedunkelte Zone → Mittelton → schmaler heller Kern (Speculare-Reflex, LEICHT links
     der Mitte — Licht kommt aus oben-links, siehe Kopfkommentar rosetteFlaechen) → Mittelton →
     abgedunkelte Zone → Schatten → dunkle Kante. Neun Stops, EINE Gradient-Id wie vorher (Tests
     prüfen genau einen erwarteten id-Namen je Bauteil). Gilt für Rosette/Hals/Hebel (griffSvg) UND
     Stoßgriff/Drücker/Knauf (tuerGriffSvg) — dieselbe eine Funktion, kein zweiter Verlaufstyp. */
  function verlaufDefs(farbId, farbe, gid) {
    var dunkel = mische(farbe.mitte, -0.22), dunkel2 = mische(farbe.mitte, -0.4),
        // Bei hellen Farben (licht:'stark', Mittelton nahe Weiß) sättigt ein additives Aufhellen
        // sofort an Weiß — dort reicht das echte Weiß als Kern, der Kontrast kommt von den
        // umgebenden Grautönen. Bei dunklen Farben (licht:'schwach') bleibt genug Kopfraum, ein
        // additiver Aufhellwert liefert dort den Speculare-Ton.
        glanz = farbId && farbe.licht === 'schwach' ? mische(farbe.mitte, 0.42) : '#ffffff';
    return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="' + dunkel2 + '"/>' +
      '<stop offset="10%" stop-color="' + farbe.rand + '"/>' +
      '<stop offset="26%" stop-color="' + dunkel + '"/>' +
      '<stop offset="36%" stop-color="' + farbe.mitte + '"/>' +
      '<stop offset="40%" stop-color="' + glanz + '"/>' +
      '<stop offset="44%" stop-color="' + farbe.mitte + '"/>' +
      '<stop offset="58%" stop-color="' + dunkel + '"/>' +
      '<stop offset="80%" stop-color="' + farbe.schatten + '"/>' +
      '<stop offset="100%" stop-color="' + dunkel2 + '"/></linearGradient>';
  }

  /* Ruhiger Verlauf für Haustürbeschläge (Owner-Korrektur 22.09.2026 „calm uniform colours, kein
     Multi-Streifen-Chrome-Look, besonders bei dunklen Farben"): verlaufDefs() oben ist für den
     Katalogfoto-Look der Fenstergriffe kalibriert (viele Bänder, starker Kontrast) — auf den
     schmalen, großflächigen Haustürbauteilen (Langschild/Hebel/Stange) wirkte genau das wie
     poliertes Chrom statt wie ruhiges Aluminium/Edelstahl. Nur EIN Verlauf, Rand höchstens 8 %
     dunkler als die Mitte (mische(...,-0.08), siehe Kopfkommentar mische() für die Skala), keine
     eigene Glanzstufe — die eine Lichtkante kommt separat als dünne Linie (siehe Hebel-Zeichnung
     unten), nicht als Verlaufsstop. Eigene Funktion statt verlaufDefs()-Parameter, weil
     verlaufDefs() von den Fenstergriffen (griffSvg) unverändert weiterverwendet wird — diese
     Aufgabe ändert nur tuerGriffSvg. */
  function tuerVerlaufDefs(farbe, gid) {
    var kante = mische(farbe.mitte, -0.08);
    return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="' + kante + '"/>' +
      '<stop offset="50%" stop-color="' + farbe.mitte + '"/>' +
      '<stop offset="100%" stop-color="' + kante + '"/></linearGradient>';
  }

  /* PZ-Zylinder als echte Profilzylinder-Silhouette (Owner-Korrektur 22.09.2026 „round top Ø~17mm
     + narrow lower slot ~10×33mm total, nicht eine Münze") — Kreiskopf UND schmaler Schlitzkörper
     als EINE Silhouette: das Rechteck zuerst (Füllung+Kontur), der Kreis darüber (deckt die obere
     Rechteckkante samt deren Kontur ab, damit KEINE doppelte Nahtlinie zwischen Kopf und Schlitz
     entsteht) — dieselbe Zeichentechnik wie tuerFlaeche (Fläche zuerst, sichtbare Kontur zuletzt),
     nur ohne Verlauf (ruhige, fast einfarbige Stahlfläche, Owner-Vorgabe „calm"). r = Kopfradius
     (Ø~17 mm bei r≈8.5); Schlitzbreite/-höhe daraus abgeleitet (Verhältnisse an der Owner-Angabe
     10×33 mm Gesamthöhe kalibriert: slotW≈1,18·r, Gesamthöhe≈3,9·r). */
  function tuerZylinderSvg(cx, cy, r, kontur, dicke) {
    var slotW = r * 1.18, gesamtH = r * 3.9, slotR = slotW * 0.28,
        kopfCy = cy - gesamtH / 2 + r,
        schlitzY0 = kopfCy, schlitzY1 = cy + gesamtH / 2,
        schlitzH = schlitzY1 - schlitzY0,
        schlitzB = Math.max(0.35, r * 0.16), schlitzL = r * 0.85;
    var s = '<g data-teil="zylinder">';
    s += '<rect x="' + z(cx - slotW / 2) + '" y="' + z(schlitzY0) + '" width="' + z(slotW) +
      '" height="' + z(schlitzH) + '" rx="' + z(slotR) + '" fill="#d7dbdd" stroke="' + kontur +
      '" stroke-width="' + z(dicke * 0.45) + '"/>';
    s += '<circle cx="' + z(cx) + '" cy="' + z(kopfCy) + '" r="' + z(r) + '" fill="#dfe3e6" stroke="' +
      kontur + '" stroke-width="' + z(dicke * 0.45) + '"/>';
    // Schlüsselschlitz im Kopf — als gedrehtes Rechteck wie beim Fenstergriff-Zylinder
    // (zylinderSvg oben), nicht nur eine Linie: dieselbe Lesbarkeit „Schlitz, kein Punkt/Niet",
    // nur auf den kleineren Profilzylinder-Kopf skaliert.
    s += '<rect x="' + z(cx - schlitzB / 2) + '" y="' + z(kopfCy - schlitzL / 2) + '" width="' + z(schlitzB) +
      '" height="' + z(schlitzL) + '" rx="' + z(schlitzB * 0.3) + '" fill="' + kontur +
      '" transform="rotate(12 ' + z(cx) + ' ' + z(kopfCy) + ')"/>';
    s += '</g>';
    return s;
  }

  /* ---------------------------------------------------------- Frontansicht (22.09.2026, Owner-
   * Hinweis): die Skizzen sind orthografische Frontalansichten (senkrecht von innen auf das
   * Fenster geschaut, DIN 107) — ein 3/4-Griff wie oben (schräg fotografiert, Rosette „mit
   * Tiefe") wirkt darauf falsch, siehe Leitregeln.md #7. Baseline ist NICHT die 3/4-Fassung oben,
   * sondern die alte Live-Engine, die die Betriebsinhaberin lokal (Port 8953) bereits als „gut"
   * abgenommen hat: df-code-aufraeumen/js/skizze2.js griff()/GRIFF_FORM (read-only, Zeile
   * ~400–531) — Rosette als flaches Rundrechteck, Hebel als EIN Pfad, der direkt und glatt aus
   * der Rosettenkante wächst (kein separater Halsklotz, kein Versatz), eine Lichtkante, ein
   * kleiner Zylinderkreis für abschließbar. Hierher übernommen und auf unsere MODELLE gemappt
   * (mehr Formen als die alte Engine, weil wir 16 statt 5 Griffbilder unterscheiden), mit der
   * Wellenkante (Hoppe Secustik/Secuforte) als zusätzliche, nur in der Front sichtbare Rippung.
   * frontForm(): welche der vier Hebel-Grundformen (siehe unten) zu welchem Modell passt —
   * anhand vorhandener MODELLE-Felder, EIN Sonderfall (quadrat) namentlich, weil „eckig vs.
   * gestuft" an den Zahlenfeldern allein nicht eindeutig unterscheidbar ist. */
  function frontForm(modell, m) {
    if (m.form === 'L') return 'L';
    if (m.halsRund) return 'rundrohr';
    if (modell === 'quadrat') return 'eckig';
    if (m.kurve) return 'geschwungen';
    return 'gestuft';
  }

  /* Hebelbreite der Frontansicht: NICHT ma.hebelB (das ist die an den Katalogfotos für die
   * Schrägansicht kalibrierte, schlanke 3/4-Hebelbreite, ~0,32–0,55 Rosettenbreiten) — Koordinator-
   * Korrektur 22.09.2026 nach Owner-Review: in der alten, abgenommenen Live-Engine
   * (df-code-aufraeumen/js/skizze2.js griff()) ist der Hebel BREIT, GRIFF.breite/rosetteB =
   * 24/31 ≈ 0,77 der vollen Rosettenbreite. Zu schmal (unsere alte Front-Fassung landete bei
   * ~0,2, wirkte wie ein Lutscher an einem Stiel) — jetzt an dieselbe Bandbreite (0,58–0,78 volle
   * Breite, je Form) angeglichen. */
  function frontHalbe(modell, m, ma, form) {
    if (form === 'eckig') return ma.rosB * 0.40;     // Quadrat: quadratisch-breit
    if (form === 'rundrohr') return ma.rosB * 0.32;  // Hamburg-Reihe/Balkon: schlankes Rundrohr
    if (form === 'L') return ma.rosB * 0.30;          // MA1010: schlanker Edelstahl-Rundstab
    return ma.rosB * 0.36;                            // geschwungen/gestuft: ~0,72 volle Breite
  }

  /* Hebelpfad der Frontansicht: startet NICHT an der Rosettenunterkante, sondern an der
   * ROSETTENMITTE (y0 = 0, wie skizze2.js griff(x,y,...) — Rosette UND Hebel teilen sich dieselbe
   * y-Referenz) und legt sich mit einer runden Kappe über die obere Rosettenhälfte — dadurch
   * bleibt die Rosette nur noch als schmaler Rand/„Rim" sichtbar, der Hebel dominiert das Bild,
   * genau wie am abgenommenen Live-Griff (Owner-Review 22.09.2026: „lever overlapping rosette,
   * wide, rounded cap, rosette rim visible" — die erste Fassung, die unten an der Rosette ansetzte
   * und schmal war, wirkte wie ein Lutscher/Pin). Endet an der Hebelspitze (ma.tipY). Vier
   * Grundformen wie skizze2.js GRIFF_FORM (geschwungen/gestuft/eckig/rundrohr). welle (Hoppe
   * Secustik/Secuforte, Atlanta): die Kante nahe der Spitze bekommt einen kleinen Wellenversatz
   * statt glatt zu bleiben — auf dem Foto sind das die Griffmulden-Rillen, in der Frontalansicht
   * als einzelner Knick an der sichtbaren Kante genug (Owner-Auftrag: „subtle profile"). */
  function frontHebelPfad(modell, m, ma) {
    var x = 0, y0 = 0, y1 = ma.tipY, l = y1 - y0,
        form = frontForm(modell, m), halbe = frontHalbe(modell, m, ma, form),
        wv = m.welle ? wellenVersatz(0.92, halbe) : 0;
    if (form === 'L') {
      // MA1010, von vorn: kürzere Kappe direkt auf der Rosettenmitte, dann waagerechter Arm,
      // dann rechtwinklig gerade nach unten (Owner-Auftrag „shorter cap + straight bar").
      var maFront = { rosB: ma.rosB, rosTop: ma.rosTop, tipY: ma.tipY, halsEndeY: y0,
        halsCx: 0, hebelCx: 0, hebelB: halbe * 2 };
      return { front: lFormFlaechen(m, maFront).front, halbe: halbe };
    }
    if (form === 'geschwungen') {
      // weicher Bogen aus der Rosettenmitte (Schulter), gerades Stück, rundes Ende, das zur Spitze
      // hin leicht breiter wird (Mistral/Nevada/Atlanta/Standard/abnehmbar — „slight widening at
      // the end").
      var e = halbe * 1.14;
      return { front: 'M ' + z(x - halbe) + ' ' + z(y0) +
        ' A ' + z(halbe) + ' ' + z(halbe) + ' 0 0 1 ' + z(x + halbe) + ' ' + z(y0) +
        ' L ' + z(x + e + wv) + ' ' + z(y1 - e) +
        ' A ' + z(e) + ' ' + z(e) + ' 0 0 1 ' + z(x - e + wv) + ' ' + z(y1 - e) + ' Z', halbe: halbe };
    }
    if (form === 'eckig') {
      // durchgehend rechteckig, scharfkantig, gerade Kappe (kein Bogen) — Quadrat.
      return { front: 'M ' + z(x - halbe) + ' ' + z(y0 - halbe * 0.7) +
        ' L ' + z(x + halbe) + ' ' + z(y0 - halbe * 0.7) +
        ' L ' + z(x + halbe) + ' ' + z(y1) +
        ' L ' + z(x - halbe) + ' ' + z(y1) + ' Z', halbe: halbe };
    }
    if (form === 'rundrohr') {
      // gleichbleibend schmaler runder Hebel, halbrund geschlossenes Ende — Hoppe Hamburg-Reihe
      // + Balkon (halsRund:true), Fingermulden-Welle nahe der Spitze.
      return { front: 'M ' + z(x - halbe) + ' ' + z(y0) +
        ' A ' + z(halbe) + ' ' + z(halbe) + ' 0 0 1 ' + z(x + halbe) + ' ' + z(y0) +
        ' L ' + z(x + halbe + wv) + ' ' + z(y1 - halbe) +
        ' A ' + z(halbe) + ' ' + z(halbe) + ' 0 0 1 ' + z(x - halbe + wv) + ' ' + z(y1 - halbe) + ' Z', halbe: halbe };
    }
    // gestuft (Standardfall): runde Schulter, dann ein gerader Absatz auf die volle Hebelbreite
    // (Dublin, 1033, Secustik/Secuforte Toulon, Balkontürgriff 1033, abschließbar).
    var e2 = halbe * 1.2, sAbs = l * 0.24, r = e2 * 0.55;
    return { front: 'M ' + z(x - halbe) + ' ' + z(y0) +
      ' A ' + z(halbe) + ' ' + z(halbe) + ' 0 0 1 ' + z(x + halbe) + ' ' + z(y0) +
      ' L ' + z(x + halbe) + ' ' + z(y0 + sAbs) +
      ' L ' + z(x + e2) + ' ' + z(y0 + sAbs + e2 * 0.7) +
      ' L ' + z(x + e2 + wv) + ' ' + z(y1 - r) +
      ' Q ' + z(x + e2) + ' ' + z(y1) + ' ' + z(x + e2 - r) + ' ' + z(y1) +
      ' L ' + z(x - e2 + r) + ' ' + z(y1) +
      ' Q ' + z(x - e2) + ' ' + z(y1) + ' ' + z(x - e2) + ' ' + z(y1 - r) +
      ' L ' + z(x - e2 + wv) + ' ' + z(y0 + sAbs + e2 * 0.7) +
      ' L ' + z(x - halbe) + ' ' + z(y0 + sAbs) + ' Z', halbe: halbe };
  }

  /* griffSvg — eine Funktion, ein Bauteil, gibt SVG-Text zurück (Grundsatz 3 aus skizze2.js).
     x,y: Rosettenmitte in mm. laengeMm: gewünschte Hebellänge (skaliert die Referenz 130 mm).
     lage: 'senkrecht' (Hebel hängt, wie am geschlossenen Fenster) oder 'waagerecht' (um 90°
     gedreht, wie beim Kippflügel — derselbe Kniff wie skizze2.js griffWaagerecht()).
     ansicht: 'front' (Standard seit 22.09.2026, Owner-Hinweis: Skizzen sind Frontalansichten,
     siehe Kopfkommentar oben) oder 'schraeg' (die ursprüngliche 3/4-Fassung von Schritt 2a/2b,
     weiterhin für die Griff-Vergleichsblätter, die den Katalogfotos gegenüberstehen). */
  function griffSvg(opts) {
    opts = opts || {};
    var modell = opts.modell, farbeName = opts.farbe, x = opts.x || 0, y = opts.y || 0,
        laengeMm = opts.laengeMm || REF_LAENGE, lage = opts.lage || 'senkrecht',
        ansicht = opts.ansicht || 'front',
        abschliessbar = !!opts.abschliessbar, idPraefix = opts.idPraefix || 'x';

    var m = MODELLE[modell];
    if (!m) throw new Error('Unbekanntes Griffmodell: ' + modell + ' — belegt sind ' + MODELL_NAMEN);
    var farbe = FARBEN[farbeName];
    if (!farbe) throw new Error('Unbekannte Grifffarbe: ' + farbeName + ' — belegt sind ' + FARB_NAMEN);
    if (ansicht !== 'front' && ansicht !== 'schraeg') {
      throw new Error('Unbekannte Ansicht: ' + ansicht + ' — belegt sind front, schraeg');
    }

    var f = laengeMm / REF_LAENGE;
    var gid = 'skz-' + idPraefix + '-griff-' + modell + '-' + farbeName;
    // Feinere Kontur (Koordinator-Vorgabe 22.09.2026 „kein Comic-Look" — bisher 0.9, wirkte bei
    // hoher Vergrößerung wie eine dicke Umrisslinie statt einer Materialkante).
    var dicke = Math.max(0.35, 0.6 * Math.sqrt(f));
    var ma = masse(m, f);
    var ros = rosetteFlaechen(m, ma);

    var s = '<g data-teil="griff" data-modell="' + modell + '" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<defs>' + verlaufDefs(farbeName, farbe, gid) + '</defs>';
    s += '<g stroke-linejoin="round">';

    if (ansicht === 'front') {
      var hebelFront = frontHebelPfad(modell, m, ma), hebelPfad = hebelFront.front, fHalbe = hebelFront.halbe;
      /* Nur Frontflächen — kein eigener Hals-Klotz, kein Seitenflächen-Duplikat: von vorn
         gesehen liegt der Hals hinter dem Hebelansatz und ist nicht als eigenes Bauteil
         sichtbar (Owner-Auftrag 22.09.2026). Rosette zuerst, Hebel obenauf — legt sich mit der
         runden Kappe über die obere Rosettenhälfte, die Rosette bleibt nur als schmaler Rand
         sichtbar (wie im abgenommenen Live-Griff, siehe Kopfkommentar frontHebelPfad). */
      s += '<g fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke) + '">';
      s += '<path d="' + ros.front + '"/><path d="' + hebelPfad + '"/>';
      s += '</g>';
      // Lichtkante: eine schmale helle Linie im Hebel, von kurz unterhalb der Kappe bis kurz vor
      // die Spitze, leicht links der Mitte (Licht oben-links, wie skizze2.js griff()).
      if (farbe.licht) {
        var tonF = farbe.licht === 'stark' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.25)';
        var lx = -fHalbe * 0.3;
        s += '<line x1="' + z(lx) + '" y1="' + z(fHalbe * 0.6) + '" x2="' + z(lx) +
          '" y2="' + z(ma.tipY - fHalbe * 0.5) + '" stroke="' + tonF + '" stroke-width="' +
          z(dicke * 0.9) + '" stroke-linecap="round"/>';
        if (m.buerstet) {
          s += '<line x1="' + z(lx + fHalbe * 0.5) + '" y1="' + z(fHalbe * 0.6) +
            '" x2="' + z(lx + fHalbe * 0.5) + '" y2="' + z(ma.tipY - fHalbe * 0.5) +
            '" stroke="rgba(255,255,255,.45)" stroke-width="' + z(dicke * 0.4) + '" stroke-linecap="round"/>';
        }
      }
      if (abschliessbar) {
        // Zylinder sitzt sichtbar AUF dem Hebel, kurz unterhalb der Kappe (Owner-Auftrag
        // „cylinder visible on rosette below the cap") — wird nach dem Hebel gezeichnet, liegt
        // also über dem Metallverlauf, nicht darunter verdeckt.
        var zrF = Math.min(ma.rosB, ma.rosH) * 0.2, zyF = fHalbe * 1.35;
        s += zylinderSvg(0, zyF, zrF, farbe.kontur, dicke);
      }
    } else {
      var hals = halsFlaechen(m, ma), hebel = hebelFlaechen(m, ma);
      /* Seitenflächen zuerst (Rosette → Hals → Hebel), flach in der Schattenfarbe — sie sitzen
         hinter/neben den Frontflächen und geben die 3/4-Tiefe, ohne selbst zu leuchten (Stufe 3:
         kein zweiter Verlauf nötig, ein Ton reicht für die „andere Seite“). Licht kommt aus
         oben-links, deshalb bleibt die rechte Seitenfläche durchgehend die dunklere. */
      s += '<g fill="' + farbe.schatten + '" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke * 0.8) + '">';
      s += '<path d="' + ros.seite + '"/><path d="' + hals.seite + '"/><path d="' + hebel.seite + '"/>';
      s += '</g>';
      /* Frontflächen im Metallverlauf — Rosette und Hals zuerst, Hebel obenauf (überdeckt den
         unteren Rand des Halses, wie im Foto). */
      s += '<g fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke) + '">';
      s += '<path d="' + ros.front + '"/><path d="' + hals.front + '"/><path d="' + hebel.front + '"/>';
      s += '</g>';
      /* Lichtkante: kurze helle Linie entlang der Hebelfront, oben breiter (näher am Licht) als
         unten (Stufe 3, siehe Kopfkommentar). */
      if (farbe.licht) {
        var ton = farbe.licht === 'stark' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.25)';
        s += '<line x1="' + z(hebel.lichtX) + '" y1="' + z(ma.halsEndeY + 4 * f) + '" x2="' + z(hebel.lichtX2) +
          '" y2="' + z(hebel.tipY - 6 * f) + '" stroke="' + ton + '" stroke-width="' + z(dicke * 0.8) +
          '" stroke-linecap="round"/>';
        // buerstet (MA1010 Edelstahl): zweite, feinere Lichtlinie parallel daneben — der
        // gebürstete Edelstahl-Look aus mehreren feinen Längsreflexen statt einer einzelnen
        // breiten Lichtkante.
        if (m.buerstet) {
          var halbeVersatz = ma.hebelB * 0.32;
          s += '<line x1="' + z(hebel.lichtX + halbeVersatz) + '" y1="' + z(ma.halsEndeY + 6 * f) +
            '" x2="' + z(hebel.lichtX2 + halbeVersatz) + '" y2="' + z(hebel.tipY - 8 * f) +
            '" stroke="rgba(255,255,255,.45)" stroke-width="' + z(dicke * 0.4) + '" stroke-linecap="round"/>';
        }
      }
      /* Schließzylinder (Profilzylinder-Stirnfläche): Kreis auf der Rosette, wie im Foto
         (mittlerer/rechter Griff je Modellspalte), MIT Schlüsselschlitz — ein echter PZ zeigt an
         der Stirnseite immer den schmalen Schlitz, sonst liest der Kreis nur als Punkt/Niet, nicht
         als Zylinder (Koordinator-Vorgabe 22.09.2026). */
      if (abschliessbar) {
        var zx = ma.rosB * 0.28, zy = ma.rosTop + ma.rosH * 0.62, zr = ma.rosB * 0.22;
        s += zylinderSvg(zx, zy, zr, farbe.kontur, dicke);
      }
    }
    s += '</g></g>';

    /* waagerecht: derselbe Griff, um 90° um die Rosettenmitte gedreht — für den Kippflügel, wie
       skizze2.js griffWaagerecht() es für den generischen Griff macht. */
    if (lage === 'waagerecht') {
      return '<g transform="rotate(-90 ' + z(x) + ' ' + z(y) + ')">' + s + '</g>';
    }
    if (lage !== 'senkrecht') {
      throw new Error('Unbekannte Lage: ' + lage + ' — belegt sind senkrecht, waagerecht');
    }
    return s;
  }

  /* ============================================================================================
   * tuerGriffSvg — Haustürbeschläge (Drücker/Stoßgriff/Knauf), eigenes Bauteil neben griffSvg.
   *
   * Warum eigene Funktion statt griffSvg-Wiederverwendung: Haustürbeschläge haben eine andere
   * Silhouette als der Fenstergriff (langes, schmales Langschild statt Rosette, Hebel mit Knick
   * statt Kurbel, Stoßgriff ohne Hebel überhaupt) — genau der in
   * recherche/zeichenvorlage-haustuer.md Abschnitt 0/6 beschriebene Bruch, den skizze2.js heute
   * hat, weil es dort den Fenstergriff 1:1 für die Haustür wiederverwendet. skizze2.js bleibt
   * unberührt (wird gerade von anderer Sitzung bearbeitet); dieses Modul hängt erst nach
   * Freigabe dort ein.
   *
   * Quellen: recherche/quellen/drzwi_de_2026-06.pdf S.84/85 „Stoßgriffe" (Druckseite, PDF-Seite
   * 43) und S.86/87 „Drücker" (PDF-Seite 44) — Ausschnitte gespeichert unter
   * recherche/quellen/tuergriffe/*.png. Tafel referenz/tafel-griffe.png und
   * referenz/masse-aus-fotos.md (Stoßgriff-Länge 85–97 % der Blatthöhe, Bildschätzung, kein
   * Herstellermaß). Geometrie-Zeichenannahmen aus recherche/zeichenvorlage-haustuer.md §6:
   * Rosette/Langschild-Verhältnis 1:5, Hebelknick bei 35–40 % der Hebellänge, Zylinderloch bei
   * 60 % Rosettenhöhe. Alle mm-Werte hier sind Zeichenannahmen (kein Hoppe-/Zulieferer-
   * Datenblatt vorhanden, siehe zeichenvorlage-haustuer.md „Offene Punkte" zu Abschnitt 6) außer
   * der Stoßgriff-Länge, die aus der Bestellangabe des Betriebs kommt (haustuer.mjs
   * stoss_laenge: 580/1200/1600 mm).
   *
   * Katalog-Abgleich (git -C ~/df-worker-mail show konfigurator-kern:worker/konfigurator/katalog/
   * haustuer.mjs):
   *   griff:          druecker → art:'druecker' modell:'alu' seite:'aussen'
   *                   stoss    → art:'stossgriff' modell:'edelstahl' (Länge aus stoss_laenge)
   *                   knauf    → art:'knauf' modell:'edelstahl' (MARKT, kein Drutex-Foto/-Modellname)
   *   stoss_laenge:   l580/l1200/l1600 → laengeMm 580/1200/1600 (kein eigenes Modell, nur Länge)
   *   druecker_innen: alu      → art:'druecker' modell:'alu' seite:'innen'
   *                   edelstahl→ art:'druecker' modell:'edelstahl' seite:'innen' (buerstet)
   * Unzugeordnet: keine — alle sechs Katalog-Ids (griff×3, druecker_innen×2, stoss_laenge als
   * reine Längenwahl) sind oben abgedeckt.
   */

  /* Rosette/Langschild-Verhältnis Breite:Höhe 1:6 (Koordinator-Review 22.09.2026: 1:5–1:6,
     zeichenvorlage-haustuer.md §6.1 nennt „ca. 1:5"; 1:6 gewählt, weil die Fotos ein sichtbar
     schlankes, langes Schild zeigen). Alle Maße hier in echten mm — Zeichenannahme (kein
     Hoppe-/Zulieferer-Datenblatt, siehe Kopfkommentar), NICHT über einen willkürlichen
     Bildschirm-Faktor skaliert, damit ein Vergleich mit dem 1000×2100-mm-Türblatt stimmt. */
  var TUER_LANGSCHILD_B = 46;   // mm, Zeichenannahme — breiter/runder an den Enden (Owner-Korrektur
                                 // 22.09.2026 „slightly wider/rounder ends as photo 1")
  var TUER_LANGSCHILD_VERHAELTNIS = 5.3; // Bandbreite laut Foto 1:5–1:6, an der breiteren Optik
  /* Referenzlänge für den Drücker-Hebel (Owner-Vorgabe 22.09.2026 „~120–140 mm lang") — für
     Knauf/Stoßgriff hat laengeMm eine andere Bedeutung (Knaufdurchmesser bzw. Stoßgriff-Länge
     aus der Bestellangabe), deshalb keine gemeinsame REF-Konstante mehr. */
  var TUER_HEBEL_REF = 130;
  var TUER_HEBEL_DICKE = 27;    // mm, Owner-Korrektur 22.09.2026 „thick round tube lever, ~25–30 mm
                                 // visible width" — Fotos zeigen einen deutlich kräftigeren
                                 // Rundstab als die erste, zu dünne Fassung (19–20 mm)
  var TUER_KNAUF_REF = 55;      // mm Durchmesser, Koordinator-Vorgabe „50–60 mm"
  var TUER_NECK_R = 12;         // mm, runder Hals/Rosette zwischen Langschild und Hebel/Knauf
  /* Achsmaß Hebeldrehpunkt–Zylindermitte: 92 mm. Nachgemessen 22.09.2026 an den Drutex-Fotos
     recherche/quellen/tuergriffe/druecker-alu-gebogen.png und -rund-zylinder.png (S. 87, 300 dpi):
     Hebelmitte/Hals ≈ 35 % der Langschildhöhe von oben, Zylindermitte ≈ 71–72 % — bei
     TUER_LANGSCHILD_VERHAELTNIS=6 und rb=40 mm ergibt das rechnerisch ~88–96 mm, deckungsgleich
     mit dem verbreiteten Wechselgarnitur-Achsmaß 92 mm (PZ-Beschläge, Marktstandard). Kein
     Hoppe-Einzeldatenblatt geprüft (siehe Kopfkommentar „Offene Punkte") — als Zeichenannahme mit
     Fotobeleg behandelt, nicht als Bestellangabe. */
  var TUER_ACHSMASS = 92;

  var TUER_MODELLE = {
    druecker:   { alu: {}, edelstahl: { buerstet: true } },
    stossgriff: { edelstahl: { querschnitt: 'eckig' } },
    knauf:      { edelstahl: {} }
  };
  var TUER_ARTEN = Object.keys(TUER_MODELLE).join(', ');

  /* Liegendes Rundrechteck (x0→x1 waagerecht) — Pendant zu rundrechteckPfad (dort stehend),
     für den Hebel und die Stoßgriff-Stange, die in x-Richtung laufen. */
  function liegendRechteckPfad(x0, x1, cy, h, r) {
    var y0 = cy - h / 2, y1 = cy + h / 2;
    r = Math.min(r, h / 2, (x1 - x0) / 2);
    return 'M ' + z(x0 + r) + ' ' + z(y0) +
      ' L ' + z(x1 - r) + ' ' + z(y0) +
      ' Q ' + z(x1) + ' ' + z(y0) + ' ' + z(x1) + ' ' + z(y0 + r) +
      ' L ' + z(x1) + ' ' + z(y1 - r) +
      ' Q ' + z(x1) + ' ' + z(y1) + ' ' + z(x1 - r) + ' ' + z(y1) +
      ' L ' + z(x0 + r) + ' ' + z(y1) +
      ' Q ' + z(x0) + ' ' + z(y1) + ' ' + z(x0) + ' ' + z(y1 - r) +
      ' L ' + z(x0) + ' ' + z(y0 + r) +
      ' Q ' + z(x0) + ' ' + z(y0) + ' ' + z(x0 + r) + ' ' + z(y0) + ' Z';
  }

  /* Ein Bauteil = Front (Metallverlauf) + Seite/Schatten-Duplikat leicht nach oben-links versetzt
     (dieselbe Technik wie bei griffSvg: Seitenfläche zuerst, dunkler, dann Front obenauf) — gibt
     die 3/4-Tiefe, ohne eine echte zweite Perspektive zu rechnen. */
  function tuerFlaeche(pfad, farbe, gid, dicke, versatz) {
    // Die Seiten-/Schattenkopie bekommt KEINE eigene Kontur mehr (nur die Füllung) — mit eigener
    // Kontur zeichnete sie eine zweite, leicht versetzte dunkle Umrisslinie unter der Front, die
    // zusammen mit der Frontkontur wie ein doppelter „Sticker"-Rand wirkte (Hauptursache des
    // Comic-Looks am Türblatt, Koordinator-Review 22.09.2026). Ohne eigene Kontur bleibt sie eine
    // reine Tiefen-/Schattenfläche, die Front zeichnet die einzige sichtbare Kante.
    var s = '<path d="' + pfad + '" fill="' + farbe.schatten + '" transform="translate(' +
      z(-versatz) + ' ' + z(-versatz) + ')"/>';
    s += '<path d="' + pfad + '" fill="url(#' + gid + ')" stroke="' + farbe.kontur +
      '" stroke-width="' + z(dicke) + '"/>';
    return s;
  }

  function tuerGriffSvg(opts) {
    opts = opts || {};
    var art = opts.art, farbeName = opts.farbe, x = opts.x || 0, y = opts.y || 0,
        seite = opts.seite || 'aussen', idPraefix = opts.idPraefix || 'x',
        ansicht = opts.ansicht || 'front';
    if (ansicht !== 'front' && ansicht !== 'schraeg') {
      throw new Error('Unbekannte Ansicht: ' + ansicht + ' — belegt sind front, schraeg');
    }

    var artModelle = TUER_MODELLE[art];
    if (!artModelle) throw new Error('Unbekannte Griffart: ' + art + ' — belegt sind ' + TUER_ARTEN);
    var modellName = opts.modell || Object.keys(artModelle)[0];
    var mod = artModelle[modellName];
    if (!mod) {
      throw new Error('Unbekanntes Modell "' + modellName + '" für Griffart ' + art +
        ' — belegt sind ' + Object.keys(artModelle).join(', '));
    }
    var farbe = FARBEN[farbeName];
    if (!farbe) throw new Error('Unbekannte Grifffarbe: ' + farbeName + ' — belegt sind ' + FARB_NAMEN);
    if (seite !== 'innen' && seite !== 'aussen') {
      throw new Error('Unbekannte Seite: ' + seite + ' — belegt sind innen, aussen');
    }

    var laengeStandard = art === 'stossgriff' ? 1200 : (art === 'knauf' ? TUER_KNAUF_REF : TUER_HEBEL_REF);
    var laengeMm = opts.laengeMm || laengeStandard;
    // dir spiegelt NICHT über x/y-Vorzeichen in jeder Koordinate (fehleranfällig), sondern über
    // eine einzige äußere Spiegelgruppe scale(dir,1) um die (symmetrische) Langschildmitte —
    // Hebel/Knauf werden immer so gezeichnet, als zeigten sie nach rechts/von den Bändern weg
    // (seite='aussen'), und für 'innen' komplett gespiegelt. DIN links/rechts ist Sache der
    // aufrufenden Türzeichnung (Spiegelung des ganzen Türblatts), nicht dieses Bauteils.
    var dir = seite === 'innen' ? -1 : 1;
    var gid = 'skz-' + idPraefix + '-tuergriff-' + art + '-' + modellName + '-' + farbeName;
    // Kontur mit der Bauteilgröße mitskalieren statt fest 1.1 mm (Koordinator-Vorgabe 22.09.2026
    // „feine Konturen") — ein 1600-mm-Stoßgriff braucht eine andere Liniendicke als ein 40-mm-
    // Langschild; dieselbe sqrt-Skalierung wie bei griffSvg, auf die jeweilige Referenzgröße bezogen.
    var dicke = Math.max(0.3, 0.55 * Math.sqrt(laengeMm / laengeStandard));

    // Weicher Kontaktschatten unter Halter/Langschild (Design-Review 22.09.2026 „Standoffs mit
    // eigener Zylinderschattierung UND weichem Kontaktschatten auf der Tür"): eine eigene, mit
    // idPraefix eindeutige Filter-Id neben der Verlauf-Id, sonst kollidieren zwei Griffe auf
    // einem Blatt über dieselbe globale Filter-Id (derselbe Grund wie beim Verlauf-idPraefix,
    // siehe Test „Verlauf-Ids der Türgriffe tragen den übergebenen idPraefix"). Leitregeln.md #4
    // erlaubt seit 21.09.2026 Falzschatten in Stufe 3 — ein weicher Kontaktschatten ist dieselbe
    // Kategorie, kein Fremdkörper im Look.
    var schattenId = 'skz-' + idPraefix + '-tuergriff-schatten-' + art + '-' + modellName;
    var s = '<g data-teil="tuergriff" data-art="' + art + '" data-modell="' + modellName +
      '" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    // Die Schatten-Filter-Id nur einhängen, wenn sie auch gebraucht wird (Stoßgriff) — sonst
    // trägt jedes Drücker-/Knauf-Blatt eine ungenutzte, aber vom Id-Test erfasste zweite Id.
    s += '<defs>' + tuerVerlaufDefs(farbe, gid) + (art === 'stossgriff' ?
      '<filter id="' + schattenId + '" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="' + z(Math.max(0.6, dicke * 1.4)) + '"/></filter>' : '') + '</defs>';
    s += '<g transform="scale(' + dir + ' 1)" stroke-linejoin="round" stroke-linecap="round">';

    if (art === 'druecker' || art === 'knauf') {
      // Langschild 40×240 mm (1:6), Kapselform — zeichenvorlage-haustuer.md §6.1/§6.4.
      var rb = TUER_LANGSCHILD_B, rh = rb * TUER_LANGSCHILD_VERHAELTNIS,
          rosettePfad = rundrechteckPfad(0, 0, rh, rb, rb * 0.45),
          pivotY = rh * 0.32,                 // Hebeldrehpunkt/Hals — Fotomessung s.o.
          zylCx = 0, zylCy = pivotY + TUER_ACHSMASS, zylR = 8.5, // mm Kopfradius (Ø~17 mm, Owner-Vorgabe)
          neckCx = rb / 2;

      s += tuerFlaeche(rosettePfad, farbe, gid, dicke, rb * 0.06);
      // Feiner Facettenring auf dem Langschild selbst (dezente Fase am Rand, kein zweiter
      // Volumenkörper) — macht die Kapselform als gekantetes Blech statt als flache Fläche
      // lesbar, ohne einen zusätzlichen dunklen Umriss zu ziehen (Leitregeln.md #4: keine neuen
      // Schlagschatten/Flächenverläufe über Stufe 3 hinaus, eine reine Konturlinie ist erlaubt).
      s += '<path d="' + rundrechteckPfad(0, rb * 0.12, rh - rb * 0.12, rb - rb * 0.32, rb * 0.32) +
        '" fill="none" stroke="' + farbe.kontur + '" stroke-opacity=".22" stroke-width="' + z(dicke * 0.5) + '"/>';

      if (art === 'druecker') {
        // Hebel: 130 mm lang (laengeMm), 19 mm dick, rundes Ende, runder Hals an der
        // Langschildkante. Frontalansicht (Standard seit 22.09.2026, Owner-Hinweis): waagerecht,
        // ohne Neigung — von vorn auf die Tür geschaut zeigt ein geschlossener Drücker
        // horizontal von den Bändern weg, die 12°-Neigung war ein Schrägansichts-Detail (jetzt
        // nur noch bei ansicht:'schraeg'). Gebaut, als zeige er nach rechts (seite='aussen'); die
        // äußere scale(dir,1)-Gruppe spiegelt für 'innen'.
        var hebelDicke = TUER_HEBEL_DICKE, neigung = ansicht === 'schraeg' ? 12 : 0,
            // Gerader Hebel wirkte auf dem Vergleichsblatt (Owner-Review 22.09.2026, Foto S. 87
            // druecker-alu-gebogen.png) wie ein Lineal — echte Türdrücker haben einen leichten
            // Knick/Schwung kurz hinterm Hals, danach läuft der Hebel flach zur Spitze. Als
            // Strichpfad (zwei Segmente, gerundete Ecken/Kappen) statt Füllfläche, wie kurbelSvg
            // es für die Kurbelstange schon macht — ergibt die Krümmung ohne Bezier-Offsetmathe.
            crankLaenge = Math.min(laengeMm * 0.24, 34), crankFall = hebelDicke * 0.55,
            hebelY = pivotY + crankFall,
            hebelMitte = 'M ' + z(neckCx) + ' ' + z(pivotY) +
              ' L ' + z(neckCx + crankLaenge) + ' ' + z(hebelY) +
              ' L ' + z(neckCx + laengeMm - hebelDicke * 0.4) + ' ' + z(hebelY),
            neckPfad = 'M ' + z(neckCx - TUER_NECK_R) + ' ' + z(pivotY) +
              ' m 0 0 a ' + z(TUER_NECK_R) + ' ' + z(TUER_NECK_R) + ' 0 1 0 ' + z(TUER_NECK_R * 2) + ' 0' +
              ' a ' + z(TUER_NECK_R) + ' ' + z(TUER_NECK_R) + ' 0 1 0 ' + z(-TUER_NECK_R * 2) + ' 0 Z';
        s += '<g transform="rotate(' + z(neigung) + ' ' + z(neckCx) + ' ' + z(pivotY) + ')">';
        // Schattenkopie zuerst (wie tuerFlaeche es für Füllflächen macht), dann der eigentliche
        // Rundstab als Strich mit Metallverlauf — Kappen/Ecken rund, damit Hals→Knick→Spitze aus
        // einem Guss wirken statt aus sichtbar gestoßenen Segmenten.
        s += '<path d="' + hebelMitte + '" fill="none" stroke="' + farbe.schatten + '" stroke-width="' +
          z(hebelDicke) + '" stroke-linecap="round" stroke-linejoin="round" transform="translate(' +
          z(-hebelDicke * 0.1) + ' ' + z(-hebelDicke * 0.1) + ')"/>';
        s += tuerFlaeche(neckPfad, farbe, gid, dicke, hebelDicke * 0.08);
        // Facettenring auf dem Hals — dieselbe Bauart wie der Knauf-Ring weiter unten, macht den
        // runden Hals als eigenes, gekantetes Rundteil lesbar statt als flachen Farbklecks
        // (Owner-Vorgabe „hub/rosette ring with bevel").
        s += '<circle cx="' + z(neckCx) + '" cy="' + z(pivotY) + '" r="' + z(TUER_NECK_R * 0.62) +
          '" fill="none" stroke="' + farbe.kontur + '" stroke-opacity=".4" stroke-width="' + z(dicke * 0.5) + '"/>';
        s += '<path d="' + hebelMitte + '" fill="none" stroke="url(#' + gid + ')" stroke-width="' +
          z(hebelDicke) + '" stroke-linecap="round" stroke-linejoin="round"/>';
        s += '<path d="' + hebelMitte + '" fill="none" stroke="' + farbe.kontur + '" stroke-width="' +
          z(dicke) + '" stroke-linecap="round" stroke-linejoin="round"/>';
        // Owner-Korrektur 22.09.2026 „calm uniform colours … one soft highlight line": nur noch
        // EINE dezente Lichtkante, die zweite (vorher zusätzlich für mod.buerstet) fällt weg —
        // zusammen mit den Mehrfach-Bändern in verlaufDefs war das der „Multi-Streifen-Chrome"-Look.
        if (farbe.licht) {
          var ton = farbe.licht === 'stark' ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.18)';
          s += '<path d="M ' + z(neckCx + crankLaenge * 0.6) + ' ' + z(hebelY - hebelDicke * 0.28) +
            ' L ' + z(neckCx + laengeMm - hebelDicke * 1.1) + ' ' + z(hebelY - hebelDicke * 0.28) +
            '" fill="none" stroke="' + ton + '" stroke-width="' + z(hebelDicke * 0.14) +
            '" stroke-linecap="round"/>';
        }
        s += '</g>';
      } else {
        // Knauf: runder Knopf Ø 50–60 mm, auf kurzem Hals an derselben Langschildkante wie der
        // Drücker — Marktform, kein Drutex-Foto (§6.4). Frontalansicht (Standard): reiner Kreis
        // mit Facettenring (kein Tiefen-Hinweis nötig — von vorn gesehen ist ein Knauf ein
        // Kreis, siehe Owner-Auftrag „circle with rim"); die seitliche Tiefen-Ellipse bleibt der
        // Schrägansicht vorbehalten.
        var knaufR = laengeMm / 2,
            kx = neckCx + knaufR * 0.75, ky = pivotY;
        s += tuerFlaeche('M ' + z(neckCx - TUER_NECK_R * 0.6) + ' ' + z(ky - TUER_NECK_R) +
          ' L ' + z(kx) + ' ' + z(ky - TUER_NECK_R) + ' L ' + z(kx) + ' ' + z(ky + TUER_NECK_R) +
          ' L ' + z(neckCx - TUER_NECK_R * 0.6) + ' ' + z(ky + TUER_NECK_R) + ' Z', farbe, gid, dicke, TUER_NECK_R * 0.15);
        if (ansicht === 'schraeg') {
          // Seitliche Ellipse zuerst (Knopftiefe, dunklerer Ton), dann die runde Vorderfläche obenauf.
          s += '<ellipse cx="' + z(kx + knaufR * 0.55) + '" cy="' + z(ky) + '" rx="' + z(knaufR * 0.4) +
            '" ry="' + z(knaufR * 0.92) + '" fill="' + farbe.schatten + '" stroke="' + farbe.kontur +
            '" stroke-opacity=".6" stroke-width="' + z(dicke * 0.45) + '"/>';
        }
        s += '<circle cx="' + z(kx) + '" cy="' + z(ky) + '" r="' + z(knaufR) + '" fill="url(#' + gid +
          ')" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke) + '"/>';
        if (ansicht === 'front') {
          // Facettenring statt Tiefe: dünner, konzentrischer Innenkreis macht den Knauf als
          // rundes Bauteil lesbar, ohne eine Seitenfläche vorzutäuschen, die es frontal nicht gibt.
          s += '<circle cx="' + z(kx) + '" cy="' + z(ky) + '" r="' + z(knaufR * 0.78) +
            '" fill="none" stroke="' + farbe.kontur + '" stroke-opacity=".35" stroke-width="' + z(dicke * 0.5) + '"/>';
        }
        if (farbe.licht) {
          // Owner-Korrektur 22.09.2026 „calm": schwächer als vorher, dieselbe Skala wie beim
          // Hebel (.55/.18), kein knalliger Glanzpunkt mehr.
          var tonK = farbe.licht === 'stark' ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.16)';
          s += '<circle cx="' + z(kx - knaufR * 0.32) + '" cy="' + z(ky - knaufR * 0.32) + '" r="' +
            z(knaufR * 0.28) + '" fill="' + tonK + '"/>';
        }
      }

      s += tuerZylinderSvg(zylCx, zylCy, zylR, farbe.kontur, dicke);
    } else {
      // Stoßgriff: durchgehende Stange Ø ~30 mm + 2 Halter, je ~100 mm lang, in 3/4 sichtbar
      // (foreshortened wie die Hals-/Rosettentiefe bei griffSvg) — zeichenvorlage-haustuer.md
      // §6.3, Koordinator-Vorgabe 22.09.2026 für die Maße. x,y = Stangenmitte oben.
      var barB = 30,
          eckig = mod.querschnitt === 'eckig',
          r = eckig ? barB * 0.12 : barB / 2,
          stange = rundrechteckPfad(0, 0, laengeMm, barB, r),
          halterLaenge = 26, // mm, foreshortened aus ~100 mm realer Haltertiefe (3/4-Ansicht)
          halterY0 = laengeMm * 0.08, halterY1 = halterY0 + barB * 0.9,
          halterY2 = laengeMm * 0.92, halterY3 = halterY2 + barB * 0.9,
          halbeB = barB / 2;
      function halterPfad(y0, y1) {
        var xr = halbeB;
        return 'M ' + z(xr) + ' ' + z(y0) + ' L ' + z(xr + halterLaenge) + ' ' + z(y0 + halterLaenge * 0.15) +
          ' L ' + z(xr + halterLaenge) + ' ' + z(y1 - halterLaenge * 0.15) + ' L ' + z(xr) + ' ' + z(y1) + ' Z';
      }
      // Kontaktschatten zuerst (unter allem, weich verwischt — Design-Review 22.09.2026 Punkt 1):
      // ein Schattenoval je Halter, dorthin, wo der Halter auf dem Türblatt aufliegt. In der
      // Schrägansicht nach rechts-unten versetzt (Perspektive der Haltertiefe), in der
      // Frontalansicht mittig unter der runden Standoff-Scheibe (Owner-Auftrag 22.09.2026: von
      // vorn gesehen ist der Halter ein Kreis, kein foreshortened Trapez).
      [[halterY0, halterY1], [halterY2, halterY3]].forEach(function (p) {
        var cy = (p[0] + p[1]) / 2;
        if (ansicht === 'front') {
          s += '<circle cx="0" cy="' + z(cy) + '" r="' + z((p[1] - p[0]) * 0.62) +
            '" fill="#000" fill-opacity=".18" filter="url(#' + schattenId + ')"/>';
        } else {
          s += '<ellipse cx="' + z(halbeB + halterLaenge * 0.55) + '" cy="' + z(cy + halterLaenge * 0.12) +
            '" rx="' + z(halterLaenge * 0.6) + '" ry="' + z((p[1] - p[0]) * 0.62) +
            '" fill="#000" fill-opacity=".22" filter="url(#' + schattenId + ')"/>';
        }
      });
      // Halter: eigener runder Stab-Verlauf statt flacher Schattenfarbe (Design-Review „Standoffs
      // mit eigener Zylinderschattierung") — dieselbe verlaufDefs-Id wie die Stange, weil der
      // Halter aus demselben Metallstab gefertigt ist wie die Stange, keine zweite Gradient-Id nötig.
      // Frontalansicht: zwei runde Standoff-Scheiben zentriert auf der Stange (Owner-Auftrag
      // „two standoff discs"), Schrägansicht: die alten seitlich versetzten Halter-Trapeze.
      s += '<g fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke * 0.7) + '">';
      if (ansicht === 'front') {
        var scheibeR = barB * 0.85;
        s += '<circle cx="0" cy="' + z((halterY0 + halterY1) / 2) + '" r="' + z(scheibeR) + '"/>';
        s += '<circle cx="0" cy="' + z((halterY2 + halterY3) / 2) + '" r="' + z(scheibeR) + '"/>';
      } else {
        s += '<path d="' + halterPfad(halterY0, halterY1) + '"/><path d="' + halterPfad(halterY2, halterY3) + '"/>';
      }
      s += '</g>';
      // Stange: echter Rundstab über verlaufDefs (dunkle Kante → Grauband → schmaler heller Kern
      // → Grauband → dunkle Kante, quer zur Stangenbreite, siehe verlaufDefs-Kopfkommentar) — keine
      // zusätzlichen Lichtlinien mehr nötig, die vorher bei fast-weißen Farben mit der Fläche
      // verschmolzen und den Stab flach wirken ließen (Design-Review 22.09.2026 Punkt 1).
      s += '<g fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="' + z(dicke) + '">';
      s += '<path d="' + stange + '"/>';
      s += '</g>';
    }

    s += '</g></g>';
    return s;
  }

  /* ============================================================================================
   * gurtwicklerSvg / kurbelSvg / motorSvg — Rollladen-Bedienelemente, eigene Bauteile.
   *
   * Quellen: recherche/echt-aussehen-details.md Abschnitt 2+3 (live-referenz/img/skizze/
   * gw_l.webp+gw_d.webp, 32×34 px Original, nur grobe Formvorlage — kein Maßbeleg) und
   * recherche/zeichenvorlage-rollladen-raffstore-insektenschutz.md Z. 97 (Drutex zeigt in keinem
   * Schnitt einen Gurt-/Kurbel-/Kabelaustritt — Kurbel/Motor sind Branchenkonvention, kein
   * Herstellerschema). Maße: Aufschraub-Gurtwickler 90–165 mm Höhe je nach Gurtbreite
   * (Marktwert, echt-aussehen-details.md), hier 60×180 mm Gehäusefläche als Zeichenannahme
   * (mittig in dieser Marktspanne, Breite an einem typischen 20-mm-Gurt gespiegelt).
   */

  /* Gurtwickler — dritte Fassung 22.09.2026 (Koordinator-Vorgabe: „exakt wie das LIVE-Icon").
     `recherche/quellen/details/gw-live-weich-10x.png` (weich vergrößerte Live-Icon-Fassung, links
     hell/rechts dunkel) zeigt eindeutig ein reines LINIEN-Icon, kein 3D-Volumenkörper: ein
     schräg gesehenes Gehäuse als Kontur (gerade, leicht diagonale Oberkante, rechts abgeschrägte/
     gerundete Ecke, rechte Kante mit einer zweiten, leicht versetzten Innenlinie — die
     Kanten-Andeutung der Schrägansicht — dann eine gerundete Unterkante), darin eine gewickelte
     Gurtrolle (schräg stehende, abgerundete Fläche mit 4–5 parallelen Diagonalstreifen) und ein
     Gurtstück, das von der Rolle als Kurve nach unten-links hängt und in einem kleinen Haken
     endet, plus ein kurzer Steg/„Tick" unten links (Wandbefestigung). Zweite Fassung dieses Moduls
     (Stadion-Kapsel mit Flächenfüllung) war ein Rückschritt gegenüber der ALLERERSTEN Fassung, die
     bereits näher an dieser Ikonografie war — jetzt direkt an den 10×-Konturen aus dem Live-Icon
     nachgezeichnet, nicht mehr an der Marktgröße realer Aufputz-Gurtwickler orientiert (das Icon
     ist ein Symbol, kein maßstäbliches Bauteil). Referenzbox 32×34 (Originalpixelgröße
     gw_l.webp/gw_d.webp) — `hoeheMm` skaliert diese Box wie eine Schriftgröße, Vorgabe bleibt eine
     Zeichenannahme (kein Hersteller-Maßblatt, s. echt-aussehen-details.md).
     Farbvarianten: NUR Kontur, keine Füllung (reines Strichsymbol wie im Original) — dunkelgraue
     Kontur auf hellen Rahmenfarben (farbe.licht='stark'), helle Kontur auf dunklen Rahmenfarben
     (farbe.licht='schwach'), damit das Icon auf jedem Rahmenton lesbar bleibt, genau wie gw_l vs.
     gw_d. `gurtLaengeMm` bleibt als optionale ZUSATZfunktion erhalten (nicht Teil des Live-Icons):
     ein gerader Gurt, der oberhalb des Icons zum Rollladenkasten weiterläuft, für skizze2.js. */
  var GW_REF_W = 32, GW_REF_H = 34;

  function gurtwicklerSvg(opts) {
    opts = opts || {};
    var x = opts.x || 0, y = opts.y || 0, farbeName = opts.farbe || 'weiss',
        seite = opts.seite || 'rechts', idPraefix = opts.idPraefix || 'x',
        hoeheMm = Math.min(80, Math.max(20, opts.hoeheMm || GW_REF_H)),
        gurtLaengeMm = Math.min(600, Math.max(0, opts.gurtLaengeMm != null ? opts.gurtLaengeMm : 0));
    var farbe = FARBEN[farbeName];
    if (!farbe) throw new Error('Unbekannte Gurtwickler-Farbe: ' + farbeName + ' — belegt sind ' + FARB_NAMEN);
    if (seite !== 'links' && seite !== 'rechts') {
      throw new Error('Unbekannte Seite: ' + seite + ' — belegt sind links, rechts');
    }
    var f = hoeheMm / GW_REF_H, dir = seite === 'links' ? -1 : 1;
    // Kontur hell auf dunklen Rahmenfarben, dunkel auf hellen — reines Strichsymbol, keine Füllung
    // (Vorgabe „line-art icon, nicht 3D-schattiert").
    var strich = farbe.licht === 'schwach' ? '#e4e7ea' : farbe.kontur;
    var dicke = Math.max(0.6, 1.1 * f);
    // uu(): lokale Icon-Einheit (0..32 / 0..34) in mm dieser Instanz umrechnen.
    function uu(v) { return z(v * f); }

    // Spiegelung um die eigene Icon-Mitte (nicht um x=0): das Icon liegt bei x=0..32*f, nicht
    // symmetrisch um 0 wie Rosette/Langschild bei den anderen Bauteilen — scale(-1,1) um x=0 würde
    // es komplett aus dem sichtbaren Bereich schieben (Sichtprüfung 22.09.2026, links-Variante war
    // leer). translate(breiteIcon,0) VOR dem scale holt es zurück in den positiven Bereich.
    var spiegel = dir === -1 ? 'translate(' + z(GW_REF_W * f) + ' 0) scale(-1 1)' : 'scale(1 1)';
    var s = '<g data-teil="gurtwickler" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<g transform="' + spiegel + '" fill="none" stroke="' + strich + '" stroke-width="' + z(dicke) +
      '" stroke-linejoin="round" stroke-linecap="round">';

    // Optionaler gerader Gurt zum Kasten, oberhalb des Icons (kein Teil des Live-Icons selbst,
    // reine skizze2-Zusatzfunktion) — tritt an der Oberkante bei x≈19 aus (dort, wo im Icon die
    // Rolle liegt) und läuft nach oben.
    /* Gurt (Betrieb 23.09.2026: „da fehlt der Gurt — breiteres Band, muss gut aussehen"). Er tritt
       an der Spitze der Gehäuse-Oberkante aus (x=19, der „Zippel") und läuft senkrecht nach oben
       zum Rollladenkasten. Breite 8 Icon-Einheiten statt 3: das Verhältnis Gurt zu Gehäusebreite
       (21 Einheiten) entspricht damit rund 23 mm Gurt auf ein ~60 mm breites Aufputz-Gehäuse, dem
       marktüblichen Verhältnis (Maß selbst bleibt Zeichenannahme, kein Drutex-Maßblatt).
       Gezeichnet als Fläche mit eigener Kontur statt als dicke Linie mit Sprossen — die alten
       Querstriche lasen sich als Leiter. Die Farbe folgt der Rahmenfarbe wie das Gehäuse. */
    if (gurtLaengeMm > 0) {
      var bandB = Math.max(2, 5 * f), bandX0 = 19 * f - bandB / 2,
          bandY0 = 6 * f, bandY1 = 6 * f - gurtLaengeMm,
          bandFuell = farbe.licht === 'schwach' ? '#585e63' : '#dde2e6';
      s += '<rect x="' + z(bandX0) + '" y="' + z(bandY1) + '" width="' + z(bandB) +
        '" height="' + z(bandY0 - bandY1) + '" fill="' + bandFuell + '" stroke="' + strich +
        '" stroke-width="' + z(dicke * 0.7) + '"/>';
      // Feine Mittellinie: macht aus dem Streifen erkennbar ein GEWEBEBAND und nicht eine
      // zweite Rahmenleiste (Sichtprüfung 23.09.2026 — der erste, breitere Streifen las sich als
      // Profil). Keine Querstriche, die lasen sich als Leiter.
      s += '<line x1="' + z(19 * f) + '" y1="' + z(bandY1 + bandB * 0.6) + '" x2="' + z(19 * f) +
        '" y2="' + z(bandY0 - bandB * 0.6) + '" stroke="' +
        (farbe.licht === 'schwach' ? '#7d858b' : '#9aa2a9') + '" stroke-width="' + z(dicke * 0.5) + '"/>';
    }

    // Gehäuse-Kontur: schräg gesehenes Gehäuse — gerade Oberkante mit leichtem Knick nach rechts
    // oben, gerundete rechte Ecke, fast senkrechte rechte Kante, gerundete Unterkante, linke Kante
    // wieder hoch (an den 10×-Konturen von gw-live-weich-10x.png abgezeichnet).
    var gehaeuse = 'M ' + uu(6) + ' ' + uu(5) +
      ' L ' + uu(19) + ' ' + uu(4) +
      ' L ' + uu(27) + ' ' + uu(11) +
      ' L ' + uu(27) + ' ' + uu(25) +
      ' Q ' + uu(27) + ' ' + uu(29) + ' ' + uu(23) + ' ' + uu(30) +
      ' L ' + uu(9) + ' ' + uu(30) +
      ' Q ' + uu(6) + ' ' + uu(30) + ' ' + uu(6) + ' ' + uu(26) + ' Z';
    s += '<path d="' + gehaeuse + '" fill="#ffffff"/>';
    // Innenlinie an der rechten Kante: die Kanten-Andeutung der Schrägansicht (zweite, leicht
    // versetzte Linie, im Referenzbild deutlich als „Doppelkontur" rechts sichtbar).
    s += '<path d="M ' + uu(21) + ' ' + uu(6.5) + ' L ' + uu(23.5) + ' ' + uu(11.5) +
      ' L ' + uu(23.5) + ' ' + uu(27) + '"/>';

    // Gurtrolle und hängendes Gurtstück entfernt (Betrieb 22.09.2026: „die Hand soll einfach nur weiß
    // sein“) — nur das weiß gefüllte Gehäuse mit Kontur bleibt.

    // Steg/„Tick" unten links entfernt (Betrieb 23.09.2026: „komische Nippel dran") — das war die
    // Wandbefestigung aus dem Live-Icon; in unserer Zeichnung sitzt der Wickler auf dem Rahmen,
    // eine freistehende Wandbefestigung ergibt dort keinen Sinn und las sich als Fremdkörper.
    // Gehäuseform bleibt unverändert (Betrieb 23.09.2026: „von der Form war er schon gut").

    s += '</g></g>';
    return s;
  }

  /* Kurbel: kurze, abgewinkelte Stange mit Öse/Gelenk oben (an der Wandhalterung) und rundem
     Kurbelgriff (Knauf) am unteren Ende, plus die Wandhalterung selbst als kleine Konsole —
     Branchenkonvention (kein Drutex-Schnitt zeigt eine Kurbel, siehe Kopfkommentar). Neutralfarbig
     (Metall/Kunststoff), da der Katalog keine eigene Kurbelfarbe führt. */
  function kurbelSvg(opts) {
    opts = opts || {};
    var x = opts.x || 0, y = opts.y || 0, seite = opts.seite || 'rechts',
        idPraefix = opts.idPraefix || 'x',
        laengeMm = Math.min(400, Math.max(150, opts.laengeMm || 250));
    if (seite !== 'links' && seite !== 'rechts') {
      throw new Error('Unbekannte Seite: ' + seite + ' — belegt sind links, rechts');
    }
    // versatzX deutlich größer als die Stangendicke (Sichtblatt 22.09.2026: mit versatzX=dicke*0.6
    // war der Knick auf der Zeichenfläche praktisch unsichtbar, die Kurbel wirkte wie ein
    // gerader Stab) — eine echte Handkurbel steht sichtbar schräg vom Rahmen ab, damit der Griff
    // nicht am Profil streift.
    var dir = seite === 'links' ? -1 : 1, dicke = 7, knaufR = 11, oeseR = 6,
        knickY = laengeMm * 0.18, versatzX = 34, // Winkel kurz unter der Öse, dann gerade Stange zum Griff
        farbe = { rand: '#c3c9cf', mitte: '#eef1f3', schatten: '#a9b0b6', kontur: '#5f6972' };
    var gid = 'skz-' + idPraefix + '-kurbel';
    var s = '<g data-teil="kurbel" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<defs>' + verlaufDefs('kurbel', farbe, gid) + '</defs>';
    s += '<g transform="scale(' + dir + ' 1)">';
    // Wandhalterung: kleine Konsole am oberen Rahmenaustritt.
    s += '<rect x="-9" y="-6" width="18" height="10" rx="2" fill="' + farbe.schatten + '" stroke="' + farbe.kontur + '" stroke-width="1"/>';
    // Öse/Gelenk: Ring, in den die Kurbelstange eingehängt ist.
    s += '<circle cx="0" cy="' + z(oeseR + 4) + '" r="' + z(oeseR) + '" fill="none" stroke="' + farbe.kontur + '" stroke-width="2"/>';
    // Stange: abgewinkelt — kurzes Stück schräg aus der Öse, dann gerade zum Griff (typische
    // Kurbelform, damit der Griff nicht am Rahmen streift).
    var pfad = 'M 0 ' + z(oeseR + 4 + oeseR) +
      ' L ' + z(versatzX) + ' ' + z(knickY) +
      ' L ' + z(versatzX) + ' ' + z(laengeMm);
    s += '<path d="' + pfad + '" fill="none" stroke="url(#' + gid + ')" stroke-width="' + z(dicke) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="' + pfad + '" fill="none" stroke="' + farbe.kontur + '" stroke-opacity=".5" stroke-width="' + z(dicke + 1) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>';
    // Kurbelgriff (Knauf): runder Handgriff am unteren Ende, quer zur Stange.
    s += '<circle cx="' + z(versatzX) + '" cy="' + z(laengeMm) + '" r="' + z(knaufR) + '" fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="1"/>';
    s += '<line x1="' + z(versatzX - knaufR * 0.4) + '" y1="' + z(laengeMm - knaufR * 0.4) + '" x2="' +
      z(versatzX + knaufR * 0.4) + '" y2="' + z(laengeMm - knaufR * 0.4) + '" stroke="rgba(255,255,255,.8)" stroke-width="1.4" stroke-linecap="round"/>';
    s += '</g></g>';
    return s;
  }

  var MOTOR_ARTEN = ['kabel', 'funk', 'solar', 'smarthome'];

  /* Motor: das Kastenmotor selbst ist unsichtbar (im Rollladenkasten verbaut) — sichtbar ist nur
     das Bedien-/Versorgungselement daneben, je Antriebsart unterschiedlich (echt-aussehen-
     details.md Abschnitt 3): Kabel → kleiner Wandschalter, Funk → Handsender, Solar → schmaler
     Solarstreifen auf dem Kasten, Smart Home → kleines Hub-Symbol mit Funkbogen. Klein und
     dezent, damit es nicht wie ein eigenes Bauteil am Fenster wirkt. */
  function motorSvg(opts) {
    opts = opts || {};
    var x = opts.x || 0, y = opts.y || 0, art = opts.art,
        seite = opts.seite || 'rechts', idPraefix = opts.idPraefix || 'x';
    if (MOTOR_ARTEN.indexOf(art) === -1) {
      throw new Error('Unbekannte Antriebsart: ' + art + ' — belegt sind ' + MOTOR_ARTEN.join(', '));
    }
    if (seite !== 'links' && seite !== 'rechts') {
      throw new Error('Unbekannte Seite: ' + seite + ' — belegt sind links, rechts');
    }
    var dir = seite === 'links' ? -1 : 1, kontur = '#4a545e', hell = '#f4f6f8';
    var s = '<g data-teil="motor" data-art="' + art + '" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<g transform="scale(' + dir + ' 1)">';

    if (art === 'kabel') {
      // Wandschalter: kleines Rechteck mit Wippe (zwei Halbfelder) neben dem Fenster.
      s += '<rect x="0" y="0" width="22" height="34" rx="3" fill="' + hell + '" stroke="' + kontur + '" stroke-width="1.4"/>';
      s += '<line x1="2" y1="17" x2="20" y2="17" stroke="' + kontur + '" stroke-width="1"/>';
      s += '<circle cx="11" cy="9" r="1.6" fill="' + kontur + '"/>';
      s += '<circle cx="11" cy="25" r="1.6" fill="' + kontur + '" fill-opacity=".4"/>';
    } else if (art === 'funk') {
      // Kleiner Handsender: schmales Rechteck mit zwei Tasten und einer kurzen Antennenlinie.
      s += '<rect x="0" y="0" width="16" height="30" rx="3" fill="' + hell + '" stroke="' + kontur + '" stroke-width="1.4"/>';
      s += '<line x1="8" y1="0" x2="8" y2="-7" stroke="' + kontur + '" stroke-width="1.2" stroke-linecap="round"/>';
      s += '<rect x="3" y="6" width="10" height="6" rx="1.5" fill="none" stroke="' + kontur + '" stroke-width="1"/>';
      s += '<rect x="3" y="15" width="10" height="6" rx="1.5" fill="none" stroke="' + kontur + '" stroke-width="1"/>';
    } else if (art === 'solar') {
      // Solarstreifen: schmales, dunkelblaues Feld mit Zellenraster, auf dem Kasten liegend
      // (breit statt hoch, anders als Schalter/Sender).
      var breite = 70, hoehe = 16, felder = 5, i;
      s += '<rect x="0" y="0" width="' + breite + '" height="' + hoehe + '" rx="1.5" fill="#1c2f4a" stroke="' + kontur + '" stroke-width="1"/>';
      for (i = 1; i < felder; i++) {
        s += '<line x1="' + z(breite / felder * i) + '" y1="1" x2="' + z(breite / felder * i) + '" y2="' + (hoehe - 1) + '" stroke="#3a5680" stroke-width="0.8"/>';
      }
      s += '<line x1="2" y1="' + (hoehe / 2) + '" x2="' + (breite - 2) + '" y2="' + (hoehe / 2) + '" stroke="#3a5680" stroke-width="0.8"/>';
    } else {
      // Smart Home: kleines Hub-Symbol (abgerundetes Quadrat) mit Funkbogen-Symbol.
      s += '<rect x="0" y="0" width="20" height="20" rx="5" fill="' + hell + '" stroke="' + kontur + '" stroke-width="1.4"/>';
      s += '<circle cx="10" cy="12" r="1.6" fill="' + kontur + '"/>';
      s += '<path d="M 5 9 A 7 7 0 0 1 15 9" fill="none" stroke="' + kontur + '" stroke-width="1.2" stroke-linecap="round"/>';
      s += '<path d="M 7 11.5 A 4 4 0 0 1 13 11.5" fill="none" stroke="' + kontur + '" stroke-width="1.1" stroke-linecap="round"/>';
    }
    s += '</g></g>';
    return s;
  }

  /* ============================================================================================
   * bandSvg / tuerBandSvg — Bänder/Scharniere als eigene, sichtbare Bauteile.
   *
   * Fenster (bandSvg): PVC-Bandabdeckung/Ecklager, wie an Drutex-Fotos von innen sichtbar — ein
   * flaches, meist weißes/farblich passendes Kunststoffteil, das das eigentliche Scherenlager
   * abdeckt (siehe recherche/zeichenvorlage-fenster.md Z. 249–258: nur bei „sichtbar" zeichnen,
   * verdeckt liegende Bänder zeigen von innen gar nichts). `lage`: 'oben' = Scherenlager mit
   * sichtbarem Arm (Flügel im Kippbereich), 'unten' = Ecklager, reiner Abdeckblock ohne Arm.
   * Tür (tuerBandSvg): 3D-Rollenband — zylindrisches Bandrohr mit sichtbarer Justierkappe
   * (Kreuz-/Sternschlitz) oben und unten, wie an Alu-/PVC-Haustürkanten sichtbar.
   */
  function bandSvg(opts) {
    opts = opts || {};
    var x = opts.x || 0, y = opts.y || 0, farbeName = opts.farbe || 'weiss',
        lage = opts.lage || 'oben', idPraefix = opts.idPraefix || 'x';
    var farbe = FARBEN[farbeName];
    if (!farbe) throw new Error('Unbekannte Band-Farbe: ' + farbeName + ' — belegt sind ' + FARB_NAMEN);
    if (lage !== 'oben' && lage !== 'unten') {
      throw new Error('Unbekannte Lage: ' + lage + ' — belegt sind oben, unten');
    }
    var gid = 'skz-' + idPraefix + '-band-' + farbeName, b = 34, h = 20;
    var s = '<g data-teil="band" data-lage="' + lage + '" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<defs>' + verlaufDefs(farbeName, farbe, gid) + '</defs>';
    var deckel = rundrechteckPfad(b / 2, 0, h, b, 4);
    s += '<path d="' + deckel + '" fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="1"/>';
    // Zwei Schrauben, wie an jeder PVC-Bandabdeckung sichtbar.
    s += '<circle cx="' + z(b * 0.25) + '" cy="' + z(h / 2) + '" r="1.6" fill="' + farbe.kontur + '" fill-opacity=".6"/>';
    s += '<circle cx="' + z(b * 0.75) + '" cy="' + z(h / 2) + '" r="1.6" fill="' + farbe.kontur + '" fill-opacity=".6"/>';
    if (lage === 'oben') {
      // Scherenarm: schmaler, leicht schräger Steg, der unter der Abdeckung zum Flügelfalz läuft
      // (deutet das Scherenlager an, ohne die Mechanik im Detail zu zeigen).
      s += '<rect x="' + z(b * 0.4) + '" y="' + z(h * 0.9) + '" width="' + z(b * 0.2) + '" height="' + z(h * 0.7) +
        '" rx="2" fill="' + farbe.schatten + '" stroke="' + farbe.kontur + '" stroke-width="0.8"/>';
    }
    if (farbe.licht) {
      var ton = farbe.licht === 'stark' ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)';
      s += '<line x1="' + z(b * 0.12) + '" y1="' + z(h * 0.18) + '" x2="' + z(b * 0.88) + '" y2="' + z(h * 0.18) +
        '" stroke="' + ton + '" stroke-width="1" stroke-linecap="round"/>';
    }
    s += '</g>';
    return s;
  }

  function tuerBandSvg(opts) {
    opts = opts || {};
    var x = opts.x || 0, y = opts.y || 0, farbeName = opts.farbe || 'silber',
        idPraefix = opts.idPraefix || 'x';
    var farbe = FARBEN[farbeName];
    if (!farbe) throw new Error('Unbekannte Band-Farbe: ' + farbeName + ' — belegt sind ' + FARB_NAMEN);
    var gid = 'skz-' + idPraefix + '-tuerband-' + farbeName, breite = 26, hoehe = 100, r = breite / 2;
    var s = '<g data-teil="tuerband" transform="translate(' + z(x) + ' ' + z(y) + ')">';
    s += '<defs>' + verlaufDefs(farbeName, farbe, gid) + '</defs>';
    var rohr = rundrechteckPfad(breite / 2, 0, hoehe, breite, r);
    s += '<path d="' + rohr + '" fill="url(#' + gid + ')" stroke="' + farbe.kontur + '" stroke-width="1"/>';
    // Justierkappen oben/unten (3D-Rollenband: Höhe/Seitenanschlag/Anpressdruck einzeln
    // einstellbar, an drei Kappen mit Kreuzschlitz erkennbar).
    [0.12, 0.5, 0.88].forEach(function (t) {
      var cy = hoehe * t;
      s += '<circle cx="' + z(breite / 2) + '" cy="' + z(cy) + '" r="' + z(r * 0.6) + '" fill="' +
        farbe.schatten + '" stroke="' + farbe.kontur + '" stroke-width="0.7"/>';
      s += '<line x1="' + z(breite / 2 - r * 0.4) + '" y1="' + z(cy) + '" x2="' + z(breite / 2 + r * 0.4) + '" y2="' + z(cy) +
        '" stroke="' + farbe.kontur + '" stroke-width="0.9"/>';
      s += '<line x1="' + z(breite / 2) + '" y1="' + z(cy - r * 0.4) + '" x2="' + z(breite / 2) + '" y2="' + z(cy + r * 0.4) +
        '" stroke="' + farbe.kontur + '" stroke-width="0.9"/>';
    });
    if (farbe.licht) {
      var ton = farbe.licht === 'stark' ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.22)';
      s += '<line x1="' + z(r * 0.4) + '" y1="' + z(hoehe * 0.06) + '" x2="' + z(r * 0.4) + '" y2="' +
        z(hoehe * 0.94) + '" stroke="' + ton + '" stroke-width="1.2" stroke-linecap="round"/>';
    }
    s += '</g>';
    return s;
  }

  var api = {
    griffSvg: griffSvg, MODELLE: Object.keys(MODELLE), FARBEN: Object.keys(FARBEN),
    tuerGriffSvg: tuerGriffSvg,
    TUER_ARTEN: Object.keys(TUER_MODELLE),
    TUER_MODELLE: (function () {
      var out = {};
      Object.keys(TUER_MODELLE).forEach(function (a) { out[a] = Object.keys(TUER_MODELLE[a]); });
      return out;
    })(),
    gurtwicklerSvg: gurtwicklerSvg, kurbelSvg: kurbelSvg, motorSvg: motorSvg,
    MOTOR_ARTEN: MOTOR_ARTEN.slice(),
    bandSvg: bandSvg, tuerBandSvg: tuerBandSvg
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.skizzeGriffe = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
