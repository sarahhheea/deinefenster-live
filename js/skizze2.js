/* skizze2 — Elementzeichnung für den Konfigurator, neu aufgebaut.
 *
 * Warum neu: Die alte Zeichnung bettet sieben Bilder aus dem Herstellerprogramm ein
 * (Griff, Klinke, Gurtwickler, Motorstecker, Wickelspule) und skaliert den Griff mit der
 * Fensterhöhe. Beides geht nicht in einem Produkt, das verkauft werden soll.
 *
 * Grundsätze:
 *   1. Alles ist Vektor. Kein <image>, keine Fremddatei.
 *   2. Gerechnet wird in Millimetern. Der Maßstab kommt erst am Schluss über die viewBox.
 *      Dadurch hat ein Griff immer dieselbe reale Größe — egal wie groß das Element ist.
 *   3. Ein Bauteil, eine Funktion. Jede Funktion gibt SVG-Text zurück und kennt nur
 *      ihre eigenen Maße.
 *   4. Herstellerabhängig sind nur Zahlen (Ansichtsbreiten), nicht die Zeichnung. Sie kommen
 *      von außen als Daten im Format von df-neubau `src/daten/fakten.json` (skizze-daten.json):
 *      `zeichne(konfiguration, daten)`. Kein DOM, kein Bauwerkzeug — Daten rein, SVG-Text raus.
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ Daten
   * <systemId>.<eigenschaft>  — Produktangabe, Quelle Pflicht, sonst Abbruch.
   * zeichnung.<systemId>.<eigenschaft> — unveröffentlichtes Zeichenmaß, `quelle: null` nur mit
   *   `zeichenannahme`. Nur Linienabstand: nie Text, nie Preis/Grenze/Validierung/Glasmaß
   *   (Absprache Neubau-Sitzung 14.09.2026, per Test abgesichert).                        */

  var ALTE_SCHLUESSEL = { classic: 'iglo-5-classic', light: 'iglo-light', ext: 'iglo-ext',
                          energy: 'iglo-energy-classic', edge: 'iglo-edge', standard: 'iglo-5-classic',
                          /* Katalog-IDs, die die Zuordnung (SKIZZE_SYSTEM) bis 29.09.2026 unverändert
                             durchreichte — 296 der 1590 Prüfpaare brachen mit „Unbekanntes System“ ab. */
                          premier: 'iglo-premier', 'energy-alucover': 'iglo-energy-alucover',
                          mb79nsi: 'mb-79n-si',
                          // Holz-Aluminium (30.09.2026, Inhalts-Sitzung): innen Softline-Holzprofil, außen Alu-Schale
                          duoline68: 'duoline-68', duoline78: 'duoline-78', duoline88: 'duoline-88' };

  function fakt(daten, systemId, eigenschaft) {
    var pfad = systemId + '.' + eigenschaft,
        f = daten[systemId] && daten[systemId][eigenschaft];
    if (!f || !f.quelle || f.wert === null || f.wert === undefined) {
      throw new Error('Produktangabe ohne Quelle: ' + pfad);
    }
    return f.wert;
  }

  function zeichenmass(daten, systemId, eigenschaft) {
    var pfad = 'zeichnung.' + systemId + '.' + eigenschaft,
        z = daten.zeichnung && daten.zeichnung[systemId] && daten.zeichnung[systemId][eigenschaft];
    if (z && z.quelle) throw new Error('Belegter Wert gehört nach ' + systemId + '.' + eigenschaft + ', nicht nach ' + pfad);
    if (!z || !z.zeichenannahme) throw new Error('Zeichenmaß ohne Begründung: ' + pfad);
    if (z.wert === null || z.wert === undefined) throw new Error('Zeichenmaß nicht festgelegt: ' + pfad);
    return z.wert;
  }

  /* Ein Maß, das die Zeichnung braucht: zuerst ein belegter Wert unter einem der Namen, unter
     denen Hersteller es führen, sonst die Zeichenannahme unter dem festen Namen. Nie beides. */
  function zeichenwert(daten, systemId, belegtNamen, annahmeName) {
    var z = daten.zeichnung && daten.zeichnung[systemId] && daten.zeichnung[systemId][annahmeName];
    for (var i = 0; i < belegtNamen.length; i++) {
      if (daten[systemId] && daten[systemId][belegtNamen[i]]) {
        if (z) throw new Error('Doppelt geführt: ' + systemId + '.' + belegtNamen[i] + ' und zeichnung.' + systemId + '.' + annahmeName);
        return fakt(daten, systemId, belegtNamen[i]);
      }
    }
    return zeichenmass(daten, systemId, annahmeName);
  }

  /* Sichtbare Profilbreiten je Ansicht (Recherche 03-systeme.md, 14.09.2026): Der Flügel überdeckt
     innen einen Teil des Rahmens, außen verdeckt der Rahmen einen Teil des Flügels. Gezeichnet
     wird: sichtbarer Rahmen `arb`, sichtbarer Flügel `afb` bis zur Glaskante. Pfosten und Stulp
     sind Glaskante-zu-Glaskante-Maße; die Lücke zwischen zwei Flügelrahmen ist das Maß minus
     beide sichtbaren Flügel. Belegte Werte werden sofort gelesen, Annahmen erst bei Bedarf. */
  function systemMasse(daten, systemId, aussen) {
    if (!daten) throw new Error('Keine Skizzen-Daten übergeben');
    systemId = ALTE_SCHLUESSEL[systemId] || systemId || 'iglo-5-classic';
    if (!daten[systemId]) throw new Error('Unbekanntes System: ' + systemId);
    if (TUER_SYSTEME[systemId] || SCHIEBE_SYSTEME[systemId]) throw new Error('Kein Fenstersystem: ' + systemId);
    var W = function (belegt, annahme) { return zeichenwert(daten, systemId, belegt, annahme); };
    var arb = aussen ? W(['rahmenAussen', 'ansichtsbreiteRahmen'], 'rahmenAussen') : W(['rahmenSichtbarInnen'], 'rahmenSichtbarInnen'),
        glas = aussen ? W(['rahmenFluegelAussen'], 'rahmenFluegelAussen') : W(['glaskanteInnen', 'rahmenFluegelInnen'], 'glaskanteInnen'),
        afb = glas - arb,
        richtung = daten[systemId].oeffnungsrichtung;
    if (!(afb > 0)) throw new Error('Flügel nicht sichtbar – Maße widersprüchlich: ' + systemId);
    return {
      id: systemId, arb: arb, afb: afb,
      nachAussen: !!(richtung && fakt(daten, systemId, 'oeffnungsrichtung') === 'nach außen'),
      griffAmStulp: !!(daten[systemId].griffAmStulp && fakt(daten, systemId, 'griffAmStulp')),
      fest: function () { return W([], 'festGlaskante'); },
      pfosten: function () { return W([], 'pfostenGlasGlas') - 2 * afb; },
      /* Waagerechter Kämpfer (Oberlicht/Unterlicht gegen Flügel). Bis 25.09.2026 wurde hier
         stillschweigend das Pfostenmaß benutzt — jetzt ein eigener Wert in skizze-daten.json, damit
         die Annahme sichtbar ist und an EINER Stelle korrigiert werden kann, sobald Drutex eine
         Schnittzeichnung liefert (Betrieb 25.09.2026: der Riegel wirkt zu fett). Fällt auf das
         Pfostenmaß zurück, solange ein System den Wert nicht führt. */
      kaempfer: function () {
        var d = daten[systemId] || {};
        return (d.kaempferGlasGlas ? W([], 'kaempferGlasGlas') : W([], 'pfostenGlasGlas')) - 2 * afb;
      }
    };
  }

  /* ------------------------------------------------------------- Beschlagmaße
   * Echte Bauteile haben echte Größen. Diese bleiben in mm konstant, damit der
   * Griff bei einem 600er Fenster genauso lang ist wie bei einem 2200er.        */

  /* Griff als Symbolmaß, keine Produktangabe (Drutex veröffentlicht keine Griffmaße;
     Recherche 14.09.2026, lokal unter ~/df-preis-analyse/griff-analyse-2026-09-14/):
       Rosette 31 × 62 mm, senkrechtes Langrund — HOPPE-Maßzeichnung Toulon 0737/US947
       Hebel 129 mm ab Rosettenmitte, 24 mm breit — Schüco-Prospekt P 4003 S. 8 (ca.-Maße)
     Der Wert 43 mm ist der Schraubenabstand, kein Rosettendurchmesser. */
  var GRIFF = {
    laenge: 129,          // Rosettenmitte bis Hebelende
    breite: 24,           // Hebelbreite
    rosetteB: 31,
    rosetteH: 62
  };
  var BAND = { hoehe: 95, breite: 22 };   // sichtbares Band (Scharnier)
  var GURT = { breite: 130, hoehe: 130 }; // Gurtwickler in der Laibung
  var MOTOR = { breite: 90, hoehe: 60 };  // Motoranschluss
  /* Kurbelantrieb. Der Bestellweg kennt drei Antriebe („Gurtwickler“, „Kurbel“, „Motor“);
     bis 17.09.2026 zeichnete das Modul alles außer „motor“ als Gurtwickler — eine Kurbel war
     von einem Gurt nicht zu unterscheiden. Drutex veröffentlicht keine Maßzeichnung des
     Kurbelantriebs, deshalb ist die Geometrie hier schematisch (wie bei GURT und MOTOR) und
     erscheint nirgends als Maß oder Zahl: Kurbelstange neben dem Element, unten die Öse. */
  var KURBEL = { breite: 150, abstand: 34, stange: 26, anteil: 0.52, oese: 34, griff: 150 };
  /* `breite` ist nur der Platz, den die Kurbel am Rand braucht (Stange + abgewinkelte Kurbel);
     `abstand` ist der Abstand der Stangenmitte von der Laibung. */

  /* ------------------------------------------------------- Schlüssel-Wächter
   * Ursache der Lücke vom 17.09.2026: `zeichne()` nahm jedes Objekt an und übersah stumm jeden
   * Schlüssel, den es nicht kannte. Wer `sproTyp` statt `sprossen` übergab (die Feldnamen des
   * Bestellwegs), bekam eine Skizze ohne Sprossen — ohne Fehler, ohne Hinweis. Betrieb musste
   * nachfragen. Jetzt ist eine unbekannte Eigenschaft ein Abbruch: lieber keine Skizze als eine,
   * die eine bestellte Eigenschaft verschweigt. Wer eine neue Eigenschaft ergänzt, muss sie hier
   * eintragen — und damit auch zeichnen oder ins Schriftfeld schreiben. */
  var EIGENSCHAFTEN = {
    produkt: 1, system: 1, b: 1, h: 1, ansicht: 1, schema: 1, position: 1, anzahl: 1,
    idPraefix: 1, farbName: 1, oeffnung: 1,
    /* ohneSchriftfeld: Konfigurator-Bühne zeigt Titel/Maße-Hinweis/Schriftfeldliste selbst als
       HTML — dieselbe Abschalt-Wirkung wie schriftfeld:false, siehe kompaktSchriftfeld(). */
    ohneSchriftfeld: 1,
    /* ohneMasse: Kartenbilder (Optionskacheln) zeigen ein Bauteil, kein vermaßtes Element — die
       Maßketten müssten sonst nachträglich aus dem Bild geschnitten werden, was den Ausschnitt
       verschiebt, sobald sich ein Maß ändert (Bilder-Sitzung, 23.09.2026). */
    ohneMasse: 1,
    /* bildkasten: { breite, hoehe } in px — Platz, den die Zeichnung ausfüllen soll
       (Warenkorbkachel, Mail-Bild, PDF-Zelle), siehe kastenAus(). */
    bildkasten: ['breite', 'hoehe'],
    schriftfeld: ['titel', 'farbe', 'griff', 'anbau', 'luefter', 'montage', 'system', 'kopplungsart', 'modell',
                  /* profil: fertige Zeile „Profil: …“ fürs neutrale Türsystem 'kunststoff-tuer' */
                  'profil',
                  /* zusatz: fertige Zeilen für alles, was bestellt, aber nicht gezeichnet ist */
                  'zusatz'],
    fluegel: ['oeffnung', 'stulp', 'passiv'],
    oberlicht: ['hoehe', 'teilung', 'oeffnung', 'bedienung'],
    unterlicht: ['hoehe', 'teilung', 'oeffnung', 'bedienung'],
    verbreiterung: ['links', 'rechts', 'oben', 'unten'],
    /* antriebsart: nur bei bedienung:'motor' gezeichnet (motorSvg kabel/funk/solar/smarthome,
       siehe antriebTeil()) — der Bestellweg führt dieses Merkmal für den Aufsatzrollladen
       (fenster.mjs/schiebetuer.mjs) Stand 22.09.2026 noch nicht, EIGENSCHAFTEN erlaubt es schon,
       damit die Zeichnung bereit ist, sobald es verdrahtet wird (siehe Kommentar antriebTeil()). */
    rollladen: ['kasten', 'kastenHoehe', 'lamelle', 'seite', 'bedienung', 'antriebsart', 'massBezug'],
    /* breiteOffen: die Aufteilung steht, die Breite noch nicht — gezeichnet wird die schmalste
       belegte Breite, im Schriftfeld erscheint dann KEINE Millimeterzahl (Betrieb 25.09.2026). */
    sprossen: ['typ', 'breite', 'raster', 'farbe', 'breiteOffen', 'senkrecht', 'waagerecht'],
    kasten: ['form', 'groesse'],
    griffAussen: ['art', 'modell', 'laenge', 'ausfuehrung'], griffInnen: ['art', 'modell', 'laenge', 'ausfuehrung'],
    fuellungsart: 1, zweifluegelig: 1, fluegelstaerke: 1,
    schwelle: 1, glasMotiv: 1, verglasung: 1, schallschutz: 1, sicherheitsbeschlag: 1,
    sicherheitsglas: 1, randverbund: 1,
    insektenschutz: 1, musterLage: 1, lamelle: 1, bedienung: 1, seite: 1,
    farbeAussen: 1, farbeInnen: 1, rahmenFarbe: 1, panzerFarbe: 1, panzerFarbeName: 1,
    endleisteFarbe: 1, kastenFarbe: 1, schienenFarbe: 1,
    griffModell: 1, griffArt: 1, griffForm: 1, griffFarbe: 1, griffStil: 1, griffRosette: 1,
    griffAusfuehrung: 1, abschliessbar: 1, drueckerInnen: 1,
    modell: 1, din: 1, dekorBeidseitig: 1, stulpZusatzgriff: 1, schiebefluegelSeite: 1,
    /* links/rechts/oberlicht in mm, massBezug 'tuer': b/h meinen nur das Türelement (Katalog seit
       27.09.2026, siehe seitenteilLayout). Ohne massBezug: b/h sind die Gesamtmaße wie bisher. */
    seitenteil: ['bauform', 'links', 'rechts', 'oberlicht', 'massBezug'], kaempfer: 1, anbauFuellung: 1,
    // Kopplung (eigenes Produkt seit 22.09.2026): kopplungsart statisch/h/eck90/winkel (Katalog
    // kopplung.mjs, Kopplungsart-Commit 89b1f7f), laenge in mm.
    bauart: 1, laenge: 1, kopplungsart: 1,
    darstellung: ['pxBreite', 'pxHoehe', 'schriftPx', 'liniePx'], ohneBeschriftung: 1, hervorheben: 1, hoeheBezug: 1, massOffen: 1,
    /* Gemeinsames Bezugsmaß aller Positionen einer Anfrage — Maximum über alle Breiten und
       über alle Höhen, getrennt gebildet. Der Aufrufer setzt es; fehlt es, zeichnet jede
       Position formatfüllend wie bisher. */
    bezugsmass: ['b', 'h']
  };
  function eigenschaftenPruefen(k) {
    var weg = ' — die Skizze würde sie stillschweigend weglassen';
    Object.keys(k).forEach(function (n) {
      var erlaubt = EIGENSCHAFTEN[n];
      if (!erlaubt) throw new Error('Unbekannte Eigenschaft: ' + n + weg);
      if (erlaubt === 1 || !k[n] || typeof k[n] !== 'object') return;
      (n === 'fluegel' ? k[n] : [k[n]]).forEach(function (o) {
        if (!o || typeof o !== 'object') return;
        Object.keys(o).forEach(function (u) {
          if (erlaubt.indexOf(u) < 0) throw new Error('Unbekannte Eigenschaft: ' + n + '.' + u + weg);
        });
      });
    });
  }
  var ANTRIEB_NAME = { gurt: 'Gurtwickler', kurbel: 'Kurbel', motor: 'Motor' };
  function antriebAus(rl) {
    var b = (rl && rl.bedienung) || 'gurt';
    if (!ANTRIEB_NAME[b]) {
      throw new Error('Unbekannter Antrieb: ' + b + ' — belegt sind Gurtwickler, Kurbel und Motor');
    }
    return b;
  }
  /* Zielgrößen für die drei echten Bedienelemente (Koordinator-Korrektur 22.09.2026: die erste
     Fassung reichte die Symbolmaße aus griffe.js unskaliert/falsch skaliert durch — Gurtwickler
     „winzig und am Rahmen klebend“, Motor „ein Punkt oben links“; zweite Korrektur 22.09.2026:
     Gurtwickler kollidierte mit den Maßketten rechts, Gurtwickler noch zu klein, Kurbelstange als
     Haarlinie, Motor zu weit vom Rahmen). griffe.js liefert reine Strichsymbole in eigenen,
     kleinen mm-Einheiten (Referenzbox 32×34 bzw. bis 70×34), keine maßstäblichen Bauteile
     (siehe dortiger Kopfkommentar) — deshalb wird hier NICHT die Symbolgröße als „echtes“ mm-Maß
     übernommen, sondern das Symbol wie ein Firmenzeichen auf eine lesbare Zielgröße gebracht
     (äußere translate/scale-Gruppe, dieselbe Technik wie bandEcht()). `gurtMasse()`/`motorMasse()`
     sind die EINE Stelle, die die tatsächliche Icon-Breite kennt — antriebTeil() (Zeichnung) UND
     antriebAussen() (Rand-/Maßketten-Platz) rufen beide dieselbe Funktion auf, damit Zeichnung und
     Randberechnung nie wieder auseinanderlaufen (genau das war die Kollisionsursache). */
  var GURT_ABSTAND = 95;    // mm — Lücke Rahmen–Icon
  var MOTOR_ABSTAND = 40;   // mm — Lücke Rahmen–Schalter (nah am Rahmen, auf der Bedienseite)
  var KURBEL_ABSTAND = 95;  // mm — Lücke Rahmen–Kurbelstange
  var KURBEL_DICKE = 14, KURBEL_KNAUF_R = 15; // mm, sichtbare Stange/Handgriff (statt Haarlinie)
  /* Gurtwickler-Zielhöhe: 0,135 × Elementhöhe (Mitte des vom Eigentümer genannten Live-Vorbilds
     0,12–0,15 × H, Koordinator-Korrektur 22.09.2026 „klar lesbar wie das LIVE-Icon, nicht
     gequetscht") — bei 1480 mm ~200 mm, bei einem 1200er Fenster ~162 mm. Geklemmt auf 110–260 mm,
     damit sehr kleine/große Elemente das Icon nicht auf einen Punkt schrumpfen bzw. explodieren
     lassen. Das Seitenverhältnis (native Icon-Box 32:34, siehe gurtwicklerSvg) bleibt IMMER
     erhalten — `b` folgt rein aus `h`, es gibt keinen zweiten, unabhängigen Breitenwert. */
  function gurtMasse(H) {
    var zielH = Math.max(110, Math.min(260, H * 0.135)),
        nativH = 80, nativB = 32 * (nativH / 34), f = zielH / nativH;
    return { f: f, nativH: nativH, b: nativB * f, h: zielH };
  }
  /* Motor-Zielgröße seit 23.09.2026 elementabhängig wie beim Gurtwickler (vorher fix 80 mm — der
     Schalter war neben dem großen Wickler-Symbol ein Punkt). Symbolgröße, kein Bauteilmaß. */
  function motorZiel(H) { return Math.max(90, Math.min(150, (H || 1480) * 0.085)); }
  var MOTOR_ZIEL = 80; // Vorgabe für Aufrufe ohne Höhe (motorMasse ohne H)
  function motorMasse(art, H) {
    var ZIEL = motorZiel(H),
        nativH = art === 'solar' ? 16 : (art === 'smarthome' ? 20 : 34),
        nativB = art === 'solar' ? 70 : (art === 'smarthome' ? 20 : (art === 'funk' ? 16 : 22));
    // Solar ist ein breiter, flacher Streifen (Kopfkommentar motorSvg) — auf die BREITE zielen,
    // sonst bliese eine Höhen-Skalierung ihn auf ein Vielfaches auf.
    if (art === 'solar') { var f = ZIEL / nativB; return { f: f, b: ZIEL, h: nativH * f }; }
    var f2 = ZIEL / nativH; return { f: f2, b: nativB * f2, h: ZIEL };
  }
  /* Wie weit ein Bedienelement über die Rahmenkante hinausragt (Lücke + Icon-Breite) — für Rand-
     und Maßkettenberechnung, siehe Kopfkommentar. */
  function antriebAussen(bed, H, art, ar) {
    // Motor überlappt seit 23.09.2026 die Rahmenkante (siehe antriebTeil) — nach außen ragt
    // deshalb nur noch die halbe Symbolbreite, nicht Abstand + volle Breite.
    if (bed === 'motor') return motorMasse(art || 'kabel', H).b / 2;
    /* Gurtwickler und Kurbel sitzen seit 22.09.2026 AUF der Rahmenkante (antriebTeil: Mitte
       arb·0,35 innerhalb der Kante), nicht mehr GURT_ABSTAND/KURBEL_ABSTAND frei in der Laibung.
       Hier stand bis 26.09.2026 noch die alte Rechnung „Abstand + volle Breite“ — die Höhenmaße
       schwebten dadurch weit neben dem Fenster (Betrieb: „viel zu weit weg vom Objekt“). Jetzt
       dieselbe Geometrie wie die Zeichnung: Gurt ragt 13 von 32 Icon-Einheiten über den
       Austritt hinaus (beide Seiten, gespiegelt), Kurbel bis versatzX 34 + Knauf. Ohne `ar`
       wird der Einzug nicht abgezogen — dann eher etwas zu viel Platz als eine überdeckte Zahl. */
    var einzug = (ar > 0) ? ar * 0.35 : 0;
    if (bed === 'kurbel') return Math.max(0, 34 + KURBEL_KNAUF_R - einzug);
    return Math.max(0, gurtMasse(H).b * 13 / 32 - einzug);
  }
  /* Zeichnet Gurtwickler, Kurbel oder Motoranschluss neben dem Element. Ein Koordinatensatz für
     Fenster (Kasten 0…rollH, Element darunter) und Schiebetür (Kasten −rollH…0).
     Seit 22.09.2026: echte Bauteile aus griffe.js (gurtwicklerSvg/kurbelSvg/motorSvg) statt der
     alten schematischen Symbole (Koordinator-Vorgabe „Rollladen-Bedienung wie das Live-Icon“) —
     dieselbe Fallback-Regel wie griffEcht()/tuerGriffEcht(): nur wenn das Modul geladen ist, sonst
     bleibt die alte, in sich geschlossene Zeichnung bestehen (kein Bruch bei fehlendem Skript,
     z. B. in einem HTML, das griffe.js nicht einbindet). `farbeName` ist die Rahmenfarbe, auf die
     nächste griffe.js-Farbe abgebildet (rahmenFarbeZuBeschlagFarbe() des Aufrufers) — weißer
     Rahmen bekommt ein weißes/hellgraues Bedienelement, anthrazit ein anthrazitfarbenes, wie am
     Rahmen selbst (der Katalog führt keine eigene Antriebsfarbe). `antriebsart` ist die
     Motor-Antriebsart (kabel/funk/solar/smarthome, siehe MOTOR_ARTEN unten) — der Bestellweg führt
     dafür noch kein eigenes Merkmal (Stand 22.09.2026), deshalb 'kabel' als Vorgabe, wenn nichts
     oder ein unbekannter Wert übergeben wird. */
  /* Durchführung an der Kastenunterkante — dieselbe Blende für den Gurt und für das Motorkabel
     (Betrieb 23.09.2026: Antrieb wie im Marktvorbild, dort führt beides sichtbar in den Kasten).
     Dunkler Schlitz in einer schmalen Blende, mittig über dem Band bzw. Kabel; wird NACH dem Band
     gezeichnet und verdeckt dessen Ende, damit es nicht abgeschnitten wirkt.
     Der Kasten läuft von 0 bis B, das Bedienelement sitzt aber auf der Rahmenkante und damit
     außen: ohne Klemmung ragte die Blende über die Kastenecke hinaus (Sichtprüfung 23.09.2026).
     Konturen auf dStark/dFein, nicht auf Bruchteilen davon — halbe Strichstärken fielen bei
     kleiner Darstellung unter die Pixelgrenze und wurden grau-matschig (Betrieb: „noch schärfer").
     Maße folgen der Bandbreite, keine erfundene Millimeterangabe (Drutex zeigt in keinem Schnitt
     einen Gurt- oder Kabelaustritt, siehe recherche/zeichenvorlage-rollladen-…md). */
  function durchfuehrung(cx, kastenUnten, bandBreite, B, dStark, dFein) {
    var durchB = bandBreite * 1.9, durchH = bandBreite * 0.85,
        durchCx = Math.max(durchB / 2, Math.min(B - durchB / 2, cx));
    return rechteck(durchCx - durchB / 2, kastenUnten - durchH * 0.55, durchB, durchH,
        '#f2f4f6', FARBE.strich, dStark, ' rx="' + z(durchH * 0.18) + '"') +
      rechteck(durchCx - bandBreite * 0.62, kastenUnten - durchH * 0.28, bandBreite * 1.24,
        durchH * 0.4, '#4e565d', FARBE.strich, dFein, ' rx="' + z(durchH * 0.1) + '"');
  }

  function antriebTeil(bed, links, B, kastenOben, kastenUnten, elementOben, H, vL, vR, dStark, dFein, farbeName, idPraefix, antriebsart, ar, griffSeite) {
    var kh = kastenUnten - kastenOben, s = '';
    var g = global.skizzeGriffe, seite = links ? 'links' : 'rechts', farbe = farbeName || 'weiss';
    /* Rahmenband-Breite (sys.arb bzw. schiebe-M('ansichtsbreiteRahmen')) — Koordinator-Vorgabe
       22.09.2026: „wie das Live-Engine-Vorbild" (live-referenz-konfigurator.js gurtwicklerDevice/
       gurtDevice). Ohne arb (z. B. alter Aufruf) fällt der Überlapp auf eine Zeichenannahme
       zurück, statt zu werfen. */
    var arb = (ar > 0) ? ar : Math.max(B, H) * 0.045;
    // Kante des ECHTEN Blendrahmens (inkl. Verbreiterung) — dort soll das Bedienelement sitzen,
    // zu 35 % in den Rahmen hinein eingerückt, wie beim Live-Icon (cx = FR*0.35 von der Kante).
    var kanteLinks = -vL, kanteRechts = B + vR,
        ueberlappCx = links ? kanteLinks + arb * 0.35 : kanteRechts - arb * 0.35;
    if (bed === 'gurt') {
      /* gurtwicklerSvg clamped auf max. 80 mm Symbolhöhe (eigener Kopfkommentar) — die native
         Symbolgröße wird dort abgerufen und ANSCHLIESSEND über eine äußere Gruppe auf die
         gurtMasse()-Zielhöhe gebracht (~H/9, 120–220 mm), statt die interne Grenze als Endmaß zu
         nehmen (das war die „winzig“-Ursache). gurtMasse() ist dieselbe Funktion, die
         antriebAussen() für den Randabstand/die Maßketten verwendet — Zeichnung und
         Randberechnung können dadurch nicht mehr auseinanderlaufen. */
      /* Sitzplatz wie im Live-Engine-Vorbild (gurtwicklerDevice): das Icon überlappt die äußere
         Rahmenkante auf der Bedienseite, in Griffhöhe (Koordinator-Korrektur 22.09.2026 — „muss
         auf dem Fenster sitzen, nicht frei an der Wand"). Vorher stand es mit GURT_ABSTAND (95 mm)
         Luft frei in der Laibung. Griffhöhe = echte Griffposition am Flügel (fy + fh/2, siehe
         griff()-Aufrufe unten) ≈ elementOben + H·0,55 — NICHT H·0,52/0,42 wie in der ersten
         Fassung (Koordinator-Korrektur 22.09.2026, zweite Runde: „sitzt bei uns bei ~0,8 statt
         ~0,55"). */
      /* Waagerechte Lage: NICHT das Gehäuse mittig auf die Rahmenkante setzen, sondern den
         GURTAUSTRITT (Icon-x=19 von 32) — sonst läuft das Band außerhalb des Rollladenkastens
         hoch und trifft die Gurtdurchführung nicht (Sichtprüfung 23.09.2026, Betrieb: „man muss
         erkennen, dass der in den Kasten reingeht"). Das Gehäuse hängt dadurch ein Stück weiter
         nach außen, der Gurt liegt dafür auf der Rahmenkante und damit unter dem Kasten. */
      /* Bei seite='links' spiegelt gurtwicklerSvg das Icon in sich (translate+scale(-1,1)) —
         der Austritt liegt dann bei 32−19=13 der nativen 32er-Box, nicht bei 19. */
      var gm = gurtMasse(H),
          gAustritt = (links ? 13 : 19) * (gm.nativH / 34) * gm.f,
          gx = ueberlappCx - gAustritt,
          cy = elementOben + H * 0.55;
      /* Dritte Runde (Koordinator-Korrektur 22.09.2026): sitzt der Griff auf DERSELBEN Seite wie
         der Gurtwickler, überlappt das zentrierte Icon den Griff — im LIVE-Vorbild sitzt das Icon
         dort UNTER dem Griff, Oberkante mit kleinem Abstand zur Griff-Unterkante. GRIFF_HALBHOEHE
         ist eine Zeichenannahme (Rosette + Hebelansatz, kein Herstellermaß, Regel 2) — der Griff
         selbst kommt aus griffe.js griffSvg/griffEcht und hat keinen abrufbaren mm-Wert für seine
         sichtbare Höhe. Sitzt der Griff auf der anderen Seite (kein Konflikt), bleibt das Icon auf
         Griffhöhe zentriert. */
      var GRIFF_HALBHOEHE = 70, GRIFF_LUFT = 25,
          gy = (griffSeite && griffSeite === seite) ? (cy + GRIFF_HALBHOEHE + GRIFF_LUFT) : (cy - gm.h / 2);
      if (g && g.gurtwicklerSvg) {
        try {
          /* Gurtband zum Kasten (Betrieb 23.09.2026: „für den Gurtwickler fehlt der Gurt — weißt
             du, wie's hochgeht?"). Ersetzt die Vorgabe vom 22.09.2026 („nur das Wickler-Icon"):
             ohne Band endete der Gurtaustritt an der Gehäusespitze im Nichts. Die Länge wird in
             den ICON-Einheiten von gurtwicklerSvg gerechnet (dort beginnt das Band bei y=6 der
             nativen 34er-Box), damit die Oberkante des Bandes genau an der Kastenunterkante
             sitzt — eine Konstante wäre bei jedem anderen Maß falsch. */
          /* Der Gurt läuft ein Stück IN den Kasten hinein (Betrieb 23.09.2026: „man muss erkennen,
             dass der in den Kasten reingeht"). Vorher stieß er stumpf an die Kastenunterkante und
             hörte dort auf. GURT_EINZUG ist die sichtbare Überlappung, danach verdeckt die
             Gurtdurchführung das Bandende — so liest sich die Stelle als Durchlass und nicht als
             abgeschnittenes Band. */
          /* 29.09.2026 (Betrieb am Konfigurator-Bild: „über dem Band ist so ein schwarzes Ding … macht
             das weg, das Band kann einfach rein in den Kasten, das sieht besser aus“): keine
             Gurtdurchführung mehr. Das Band endet bündig an der Kastenunterkante und läuft so
             sichtbar in den Kasten — kein Einzug über die Kastenfront, keine Blende. */
          var gurtLokal = Math.max(0, (gy - kastenUnten) / gm.f + 6 * (gm.nativH / 34));
          s += '<g data-teil="gurt" transform="translate(' + z(gx) + ' ' + z(gy) + ') scale(' + z(gm.f) + ')">' +
            g.gurtwicklerSvg({ x: 0, y: 0, farbe: farbe, seite: seite, hoeheMm: gm.nativH,
              gurtLaengeMm: gurtLokal, idPraefix: idPraefix }) + '</g>';
        } catch (e) { g = null; }
      }
      if (!g || !g.gurtwicklerSvg) {
        // Auch der Ersatz ohne griffe.js zeigt kein Gurtband mehr — dieselbe Vorgabe wie oben.
        s += rechteck(gx, gy, gm.b, gm.h, '#e4e8ec', FARBE.strich, dFein, ' rx="' + z(gm.b * 0.12) + '"') +
          '<circle cx="' + z(gx + gm.b / 2) + '" cy="' + z(gy + gm.h / 2) + '" r="' + z(gm.b * 0.17) +
          '" fill="none" stroke="' + FARBE.strich + '" stroke-width="' + z(dFein) + '"/>';
      }
    } else if (bed === 'kurbel') {
      /* Kurbel hängt am Getriebe im Kasten, reicht an der Laibung herunter — kurbelSvg zeichnet
         Wandhalterung, Öse, abgewinkelte Stange und Handgriff in einem Bauteil, hängend am Kasten
         (Bestellweg „von Hand · abnehmbare Kurbel“). kurbelSvg selbst zeichnet die Stange fix mit
         7 mm Strichstärke — bei einem echten Kurbelantrieb (Ø 12–16 mm marktüblich) las sich das
         als Haarlinie (Koordinator-Korrektur 22.09.2026). griffe.js ist hier nicht editierbar
         (Regel „nur skizze2.js“), deshalb wird NUR die eine bekannte, feste Stroke-Width-Zahl
         (dicke=7, siehe griffe.js kurbelSvg-Quelltext) gezielt durch KURBEL_DICKE ersetzt und der
         Handgriff-Radius (fix 11) durch KURBEL_KNAUF_R — beides literale, in griffe.js hart
         codierte Zahlen, keine geratenen Treffer. */
      /* Wie der Gurtwickler: an der Rahmenkante hängend, nicht mit KURBEL_ABSTAND (95 mm) Luft
         frei in der Laibung (Koordinator-Korrektur 22.09.2026). */
      var mx = ueberlappCx,
          laenge = Math.max(150, Math.min(400, H / 3));
      if (g && g.kurbelSvg) {
        try {
          var kSvg = g.kurbelSvg({ x: mx, y: kastenUnten, seite: seite, laengeMm: laenge, idPraefix: idPraefix });
          kSvg = kSvg.replace(/stroke-width="7"/, 'stroke-width="' + z(KURBEL_DICKE) + '"')
                     .replace(/r="11"/, 'r="' + z(KURBEL_KNAUF_R) + '"');
          s += kSvg;
        } catch (e) { g = null; }
      }
      if (!g || !g.kurbelSvg) {
        var unten = kastenUnten + laenge,
            ri = links ? -1 : 1, gx2 = mx + ri * KURBEL.griff * 0.55, gy2 = unten + KURBEL.griff * 0.62;
        s += rechteck(mx - KURBEL_DICKE * 0.9, kastenOben + kh * 0.38, KURBEL_DICKE * 1.8, kh * 0.44,
                   '#e4e8ec', FARBE.strich, dStark * 0.7, ' rx="' + z(KURBEL_DICKE * 0.28) + '"') +
          rechteck(mx - KURBEL_DICKE / 2, kastenUnten, KURBEL_DICKE, unten - kastenUnten,
                   '#e4e8ec', FARBE.strich, dStark * 0.7, ' rx="' + z(KURBEL_DICKE * 0.45) + '"') +
          '<circle cx="' + z(mx) + '" cy="' + z(unten) + '" r="' + z(KURBEL.oese * 0.42) +
          '" fill="#e4e8ec" stroke="' + FARBE.strich + '" stroke-width="' + z(dStark * 0.7) + '"/>' +
          linie(mx, unten, gx2, gy2, FARBE.strich, dStark * 0.9, ' stroke-linecap="round"') +
          linie(gx2, gy2, gx2 + ri * KURBEL.griff * 0.16, gy2 + KURBEL.griff * 0.3,
                FARBE.strich, dStark * 1.5, ' stroke-linecap="round"');
      }
    } else {
      /* Motor: nur das Bedien-/Versorgungselement ist sichtbar (der Rohrmotor selbst sitzt im
         Kasten) — motorSvg zeichnet es je Antriebsart, über motorMasse() auf eine ~80-mm-Zielgröße
         gebracht (Koordinator-Vorgabe) und nah am Rahmen (MOTOR_ABSTAND, auf der Bedienseite —
         genau da, wo ein Wandschalter real sitzt), nicht mehr auf gleichem weiten Abstand wie der
         Gurtwickler. */
      /* Sitzplatz seit 23.09.2026 wie beim Gurtwickler (Betrieb: „motortechnisch übernehmen wie im
         Marktvorbild"): der Schalter überlappt die Rahmenkante auf der Bedienseite und hängt nicht
         mehr mit MOTOR_ABSTAND frei in der Laibung. Vom Schalter läuft ein Kabel senkrecht nach
         oben in den Kasten — dorthin, wo der Rohrmotor sitzt; ohne das war der Schalter ein Punkt
         ohne Zusammenhang. Höhe wie beim Gurtwickler auf Griffhöhe, mit derselben Ausweichregel,
         wenn der Griff auf derselben Seite sitzt. */
      var motorArten = (g && g.MOTOR_ARTEN) || ['kabel', 'funk', 'solar', 'smarthome'],
          art = motorArten.indexOf(antriebsart) >= 0 ? antriebsart : 'kabel',
          mm2 = motorMasse(art, H),
          mx2 = ueberlappCx - mm2.b / 2,
          mCy = elementOben + H * 0.55,
          my = (griffSeite && griffSeite === seite) ? (mCy + 70 + 25) : (mCy - mm2.h / 2);
      /* Kabel: schmaler als der Gurt (ein Kabel ist dünner als ein 23-mm-Gurt), gleiche
         Durchführung am Kasten — ein Bauteil, zwei Anwendungen. Bei Solar und Funk gibt es kein
         Kabel zum Kasten: das Solarpaneel versorgt den Motor über den Kasten, der Handsender gar
         nicht. Deshalb nur bei 'kabel' und 'smarthome'. */
      if (art === 'kabel' || art === 'smarthome') {
        var kabB = Math.max(2, mm2.b * 0.16), kabCx = ueberlappCx;
        s += rechteck(kabCx - kabB / 2, kastenUnten, kabB, Math.max(0, my - kastenUnten),
            '#dde2e6', FARBE.strich, dFein) +
          durchfuehrung(kabCx, kastenUnten, kabB, B, dStark, dFein);
      }
      if (g && g.motorSvg) {
        try {
          s += '<g transform="translate(' + z(mx2) + ' ' + z(my) + ') scale(' + z(mm2.f) + ')">' +
            g.motorSvg({ x: 0, y: 0, art: art, seite: seite, idPraefix: idPraefix }) + '</g>';
        } catch (e) { g = null; }
      }
      if (!g || !g.motorSvg) {
        var mcy = my + mm2.h / 2, kastenX = links ? 0 : B;
        s += linie(kastenX, mcy, mx2, mcy, FARBE.strichFein, dFein,
                ' stroke-dasharray="' + z(dStark * 2.4) + ' ' + z(dStark * 1.6) + '"') +
          rechteck(mx2, my, mm2.b, mm2.h, 'url(#skz-alu)', FARBE.strich, dFein, ' rx="' + z(mm2.h * 0.22) + '"') +
          linie(mx2 + mm2.b * 0.25, my + mm2.h, mx2 + mm2.b * 0.25, my + mm2.h * 1.7, FARBE.strich, dFein) +
          linie(mx2 + mm2.b * 0.75, my + mm2.h, mx2 + mm2.b * 0.75, my + mm2.h * 1.7, FARBE.strich, dFein);
      }
    }
    return s;
  }

  /* ------------------------------------------------------------------ Farben */

  /* Gemessenes Drutex-Weiß aus den Farbmustern des Herstellers (Messung 15.09.2026,
     05-farben.json). Vorher stand hier ein warmes Grauweiß #f7f7f4 — Betrieb 16.09.2026:
     „wirklich weiß sein, das Fenster“. */
  var WEISS = '#fefefe';

  var FARBE = {
    strich: '#12161a',        // Hauptkontur
    strichFein: '#6b7580',    // Hilfslinien
    /* Öffnungssymbol in Petrol-Grau statt Schwarz — so zeichnen 5 von 6 europäischen
       Referenzen (Marktvergleich 16.09.2026). Kontrast auf dem Glas 7 : 1, also weiterhin
       deutlich über der Mindestanforderung 3 : 1 für Grafiken. */
    symbol: '#3d5566',
    /* Glas: EINE Farbe, kein Verlauf, keine Spiegelung (Betrieb 16.09.2026 — der Verlauf
       wirkte wie ein Comic). Heller Ton, damit es neben weißen Profilen hell bleibt, aber
       noch erkennbar blau — sonst verschwindet die Scheibe im weißen Rahmen. */
    /* Design-Review 3. Runde (22.09.2026, "nicht zeigbar" — Glas wirkt papieren): EINE Flachfarbe
       durch einen Himmel-Boden-Verlauf ersetzt (Stufe-3-Freigabe 21.09.2026). Koordinator-
       Entscheidung 22.09.2026: der Verlauf „wirkt comichaft" — zurück auf EINE Flachfarbe, für
       alle Glasflächen (Fenster, Türen, Seitenteile, Oberlicht, Schiebetür). Einzige verbliebene
       Tiefe: schmaler Kantenschatten (falzSchatten3, 6–8 mm) und ein sehr leiser Reflexstreifen
       (glasReflex3, Deckkraft ≤ 0.12). Die Innen/Außen-Differenz kommt weiterhin aus
       glasAussenTon() (dünner Dunkelton nur bei Außenansicht), nicht aus der Glasfarbe selbst. */
    /* 29.09.2026 (Betrieb: „das Glas ist irgendwie immer noch weiß“): #dde7ee (HSL-Sättigung 26 %, Helligkeit
       90 %) las sich auf weißem Grund und neben weißem Rahmen als weiß. Jetzt deutlich hellblau, bleibt hell:
       Sättigung 45 %, Helligkeit 85 %. Ornamentlinien (#b1c4d2/#b9cbd8) bleiben dunkler als das Glas. */
    glas: '#c8dcea',
    glasKante: '#7590a8',
    sprosseMusterKante: '#4d6479',   // SZR-Sprosse auf Ornament-/Mattglas (sonst im Muster unsichtbar)   // traegt allein die Scheibenkante, seit das Glas flach ist
    beschlag: '#2a3138',
    massText: '#1e242b',
    massLinie: '#565b61',
    gehrung: 'rgba(17,17,17,.5)'
  };

  /* -------------------------------------------------- Stufe 3: Realismus (nur Fenster)
   * Freigabe Betrieb 21.09.2026 am Blatt `realismus/realismus-stufen.png`
   * (siehe df-werkzeug/Leitregeln.md Regel 4): dezente Lichtkanten auf Profilen, ein
   * Glas-Spiegelstreifen, ein Falzschatten und ein Holzdekor-Muster als eingebettete
   * Data-URI-Kachel — NICHT nachladend, alles bleibt in der einen SVG-Datei. Gilt nur für
   * `zeichne()` (Fenster/Balkontür); Haustür, Schiebetür und Rollladen bleiben unverändert
   * (eigene Funktionen, eigener Look, vom Betrieb nicht mitgeprüft). Prototyp und Begründung:
   * `realismus/generate.py`. */

  /* Holzdekor-Kachel (Golden Oak), 80x80 px PNG, einmalig mit Pillow erzeugt
   * (realismus/generate.py -> tile-golden-oak.png) und vom Betrieb am Realismus-Blatt
   * mitgeprüft. Hier unverändert als Base64 übernommen, damit nicht zwei Kacheln pro
   * Projekt entstehen. */
  var HOLZ_TILE_B64 = "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";

  /* Welche Farbnamen aus dem Bestellweg ein Holzdekor sind, steht nirgends als Flag im
   * Datensatz — Farbe kommt bei `zeichne()` nur als geprüfter Hexcode an (`farbwert()`),
   * `farbName` ist freier Anzeigetext. Die Liste stammt aus den Foliennamen, die
   * `live-referenz-konfigurator.js` (`_COL_V3`) als Holzdekore führt (Referenzmessung, kein
   * Drutex-Katalogbeleg für die Namensliste selbst) — reine Uni-Farbtöne bleiben außen vor.
   * Ohne Treffer: flache Verlaufsfarbe statt Holzmuster (auf Nummer sicher statt Fehlfarbe). */
  var HOLZ_DEKOR_NAMEN = ['golden oak', 'golden-oak', 'winchester', 'sheffield', 'eiche', 'eiche-nat',
    'eiche-hell', 'dunkleiche', 'mooreiche', 'nussbaum', 'mahagoni', 'macore', 'oregon',
    'douglasie', 'teak', 'schoko-br', 'schokobraun', 'braun-mar', 'siena-noce', 'siena-ross',
    'turner-oak', 'turner-toff', 'turner-waln', 'turner oak', 'turner toffee', 'turner walnut'];

  function istHolzDekor(farbName) {
    if (!farbName) return false;
    var n = String(farbName).toLowerCase();
    for (var i = 0; i < HOLZ_DEKOR_NAMEN.length; i++) {
      if (n.indexOf(HOLZ_DEKOR_NAMEN[i]) !== -1) return true;
    }
    return false;
  }

  /* Alle neuen Kennungen (Stufe 3) laufen über dieselbe idPraefix-Ersetzung wie die
   * bestehenden. Bis 21.09.2026 stand die Liste viermal einzeln im Code — jetzt eine
   * Konstante, an vier Stellen eingesetzt, damit eine neue Kennung nicht drei Stellen
   * vergessen kann. */
  var SKZ_ID_TEIL = 'glas|alu-ros|alu|weiss|inox|fuell|r\\d{4}|messing|bronze|titan|holz\\d+|verl\\d+|falz\\d+|refl\\d+|rs-[a-z0-9-]+|rauschen\\d+';
  var SKZ_ID_REGEX = new RegExp('skz-(' + SKZ_ID_TEIL + ')\\b', 'g');

  /* ----------------------------------------------------------------- Werkzeug */

  function z(n) { return Math.round(n * 100) / 100; }

  /* Mindest-Strichstärke am Auslieferungsformat (Recherche `beste-skizzen-techniken.md`
     Abschnitt 3/5, Regel 8: „nie unter 0.75 px effektiv im Export"). Alle Linienstärken werden
     in Millimeter-Koordinaten gerechnet und erst über die viewBox auf Pixel abgebildet — bei
     extremen Seitenverhältnissen (z.B. 500 × 2400) frisst der Pflichthinweis „Schematische
     Darstellung …" so viel seitlichen Rand, dass die viewBox-Breite weit über das Element
     hinauswächst und dünne Konturen bei der Mail-Größe 528×640 unter 0,2 px fallen — praktisch
     unsichtbar (gemessen 22.09.2026, siehe Test unten). Fix: NACH der endgültigen viewBox eine
     Nachbearbeitung, die jede Kontur mit `stroke!="none"` auf die Mindestbreite anhebt, die bei
     528×640 (kleinere Seite ist bindend) noch mindestens MIN_STRICH_PX ergibt. Nur ein Boden,
     kein Deckel — dickere Linien bleiben unverändert. */
  var MAIL_B = 528, MAIL_H = 640, MIN_STRICH_PX = 0.75;
  function mindestStriche(svg, vbBox) {
    var skala = Math.min(MAIL_B / vbBox[2], MAIL_H / vbBox[3]);
    if (!(skala > 0) || !isFinite(skala)) return svg;
    var bodenMM = MIN_STRICH_PX / skala;
    // Striche mit vector-effect="non-scaling-stroke" sind schon in Bildschirm-Pixeln angegeben —
    // ein mm-Boden würde sie zu dicken Comic-Rändern aufblähen (Pennsylvania-Glas, 22.09.2026).
    return svg.replace(/stroke="([^"]*)" stroke-width="([0-9.]+)"(?! vector-effect="non-scaling-stroke")/g, function (treffer, farbe, w) {
      var wn = parseFloat(w);
      if (farbe === 'none' || !(wn > 0) || wn >= bodenMM) return treffer;
      return 'stroke="' + farbe + '" stroke-width="' + z(bodenMM) + '"';
    });
  }

  /* Eingaben aus dem Bestellweg landen im SVG-Text und in Attributen. Ohne Maskierung ließe sich
     über einen Farbnamen oder Schriftfeldtext Markup einschleusen — im Konfigurator (innerHTML)
     wie in der Mail. Offener Punkt aus der Neubau-ROADMAP, behoben 17.09.2026. */
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* Farbwerte nur als Hexcode. Alles andere bricht ab, statt als Attribut durchzurutschen. */
  /* Beide Seiten prüfen, auch die gerade nicht gezeigte — ein kaputter Wert darf nicht still
     durchrutschen, nur weil die Ansicht ihn nicht braucht. */
  function seitenFarbe(k, aussen) {
    var innen = farbwert(k.farbeInnen, null), aus = farbwert(k.farbeAussen, null), beide = farbwert(k.rahmenFarbe, WEISS);
    return (aussen ? aus : innen) || beide;
  }
  function farbwert(v, ersatz) {
    if (v === undefined || v === null || v === '') return ersatz;
    if (typeof v === 'string' && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v)) return v;
    throw new Error('Ungültiger Farbwert (nur #rgb oder #rrggbb): ' + String(v).slice(0, 20));
  }

  /* Beschlagteile (Band, Gurtwickler, Kurbel, Motoranschluss), die neben/auf dem Rahmen sitzen,
     sollen in der Farbfamilie des Rahmens erscheinen (Koordinator-Korrektur 22.09.2026: „weiß
     Rahmen → weißer/hellgrauer Beschlag, anthrazit → anthrazit"), nicht in der Griff-Bestellfarbe
     — der Katalog führt keine eigene Beschlagfarbe. Nächster Treffer per RGB-Abstand aus denselben
     acht Referenztönen, die skizze2.js für den Rahmen selbst verwendet (RAL-Verlaufskonstanten
     GRIFF_DEFS/ralVerlauf, dieselben Hex-Werte wie griffe.js FARBEN) — kein neuer Farbraum, nur
     eine Zuordnung zur nächsten der acht griffe.js-Farben. */
  var RAHMEN_ZU_BESCHLAG_FARBE = [
    ['#ffffff', 'weiss'], ['#fefefe', 'weiss'],
    ['#c3c9cf', 'silber'], ['#f4f6f8', 'silber'],
    ['#9aa0a3', 'titan'], ['#6d7377', 'titan'],
    ['#4a5156', 'anthrazit'], ['#2a2f33', 'anthrazit'],
    ['#2c2c2e', 'schwarz'], ['#0a0a0a', 'schwarz'],
    ['#544b4b', 'braun'], ['#352f2f', 'braun'],
    ['#f1e9dc', 'creme'], ['#dcd3c3', 'creme'],
    ['#e3cf8f', 'altmessing'], ['#9c8141', 'altmessing']
  ];
  function hexZuRgb(hex) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
    if (!m) return [255, 255, 255];
    var h = m[1].length === 3 ? m[1].split('').map(function (c) { return c + c; }).join('') : m[1];
    var n = parseInt(h, 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function rahmenFarbeZuBeschlagFarbe(hex) {
    var rgb = hexZuRgb(hex), beste = 'weiss', bestD = Infinity;
    RAHMEN_ZU_BESCHLAG_FARBE.forEach(function (e) {
      var r2 = hexZuRgb(e[0]), d = Math.pow(rgb[0] - r2[0], 2) + Math.pow(rgb[1] - r2[1], 2) + Math.pow(rgb[2] - r2[2], 2);
      if (d < bestD) { bestD = d; beste = e[1]; }
    });
    return beste;
  }

  function rechteck(x, y, b, h, fuell, kontur, dicke, extra) {
    return '<rect x="' + z(x) + '" y="' + z(y) + '" width="' + z(b) + '" height="' + z(h) +
      '" fill="' + fuell + '" stroke="' + (kontur || 'none') + '" stroke-width="' + (dicke || 0) +
      '"' + (extra || '') + '/>';
  }

  function linie(x1, y1, x2, y2, farbe, dicke, extra) {
    return '<line x1="' + z(x1) + '" y1="' + z(y1) + '" x2="' + z(x2) + '" y2="' + z(y2) +
      '" stroke="' + farbe + '" stroke-width="' + dicke + '"' + (extra || '') + '/>';
  }

  // Farbe leicht auf-/abhellen (Bildschirm-Mischung, kein Herstellerwert) — dieselbe Formel wie
  // sonnenschutz.js `mische()`, hier für den Rollladenpanzer wiederverwendet.
  function rollMischen(hex, anteil) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    var h = m[1].length === 3 ? m[1].split('').map(function (c) { return c + c; }).join('') : m[1];
    var n = parseInt(h, 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255,
        ziel = anteil > 0 ? 255 : 0, f = Math.abs(anteil);
    function mix(v) { return Math.round(v + (ziel - v) * f); }
    function hex2(v) { return ('0' + v.toString(16)).slice(-2); }
    return '#' + hex2(mix(r)) + hex2(mix(g)) + hex2(mix(b));
  }

  /* „Zu comichaft" (Betrieb 22.09.2026, gegen die Referenzfotos `referenz/tafel-haustuer.png` /
     `referenz/tafel-rahmen.png` und das freigegebene Realismus-Blatt): die feste dunkle Kontur
     FARBE.strich auf JEDEM Profil (Flügel, Kämpfer, Pfosten, Blattfüllung) war der Haupttreiber —
     eine echte Tür/Fenster hat dort nur eine feine Fasenkante in der eigenen Flächenfarbe, keine
     schwarze Linie. `kanteWeich()` liefert diese Kante (dunklerer bzw. bei dunklen Farben
     hellerer Ton derselben Fläche) für INNERE Profilkanten. Die äußere Elementsilhouette (Blend-
     rahmen außen, Rollladenkasten, Schwelle) und technische Symbole (Öffnungsdreieck, Maßlinien,
     Schriftfeld) behalten weiterhin FARBE.strich/strichR/… — Regel 7 (Normen) verlangt dort klare
     Linien, keine Reduzierung. */
  function kanteWeich(hex) {
    return istDunkel(hex) ? rollMischen(hex, 0.34) : rollMischen(hex, -0.42);
  }

  /* Gehrung: die vier Ecklinien eines Rahmenprofils. Design-Review 22.09.2026 (2. Runde): eine
     einzige flache Linienfarbe an allen vier Ecken las sich als „zweite Kontur", nicht als Tiefe.
     Jetzt wie am Profilring selbst (oben/links hell, unten/rechts dunkel): die Ecke oben-links
     bekommt eine helle Linie (Lichtkante), die Ecke unten-rechts eine dunkle (Schattenkante); die
     beiden Übergangsecken (oben-rechts, unten-links) behalten die neutrale Kontur `farbe`. So
     wirkt die Gehrung wie eine echte Kante mit Licht/Schatten statt wie ein zweiter Strich. */
  function gehrung(x, y, b, h, tiefe, dicke, farbe) {
    var f = farbe || FARBE.gehrung, hell = 'rgba(255,255,255,.4)', dunkel = 'rgba(8,10,12,.4)';
    return '<g stroke-linecap="round">' +
      linie(x, y, x + tiefe, y + tiefe, hell, dicke) +
      linie(x + b, y, x + b - tiefe, y + tiefe, f, dicke) +
      linie(x, y + h, x + tiefe, y + h - tiefe, f, dicke) +
      linie(x + b, y + h, x + b - tiefe, y + h - tiefe, dunkel, dicke) +
      '</g>';
  }

  /* ------------------------------------------------- Tiefe, Glasfläche, Spiegelung
   * Ohne Licht und Schatten wirkt eine Vektorzeichnung wie ein Comic (Betrieb 15.09.2026).
   * Deshalb: jedes Profil bekommt einen leichten Verlauf, das Glas eine schräge Spiegelung
   * und eine Glasleistenkante. Alles mit Verläufen, ohne Filter — Filter überleben die
   * Rasterung für die Mail nicht zuverlässig. Lichtrichtung immer oben links.            */

  /* Die Profilfläche bleibt EXAKT in der bestellten Farbe — kein Verlauf, kein Kantensaum, kein
     Schatten (Betrieb 16.09.2026: „das Weiße ist so komisch verlaufen, das darf auch nicht sein“).
     Zwischenschritt am selben Tag war ein dünner Licht-/Schattensaum an der Kante. Die
     Design-Prüfung hat ihn wieder gekippt: auf Weiß ist die helle Hälfte unsichtbar, auf
     Anthrazit wird sie zum dominanten Element — dasselbe Profil sah je nach bestellter Farbe
     wie eine Technikzeichnung oder wie ein abgeschrägter Bilderrahmen aus. Anthrazitgrau ist die
     meistverkaufte Farbe. Tiefe kommt jetzt allein aus Kontur, Gehrung und Glasleiste; nur Metall
     (Griff, Scharnier) behält seinen Verlauf, sonst wirkt es wie ein Aufkleber.
     Die Funktion bleibt als eigener Name bestehen, damit „Profilfläche“ eine Stelle hat. */
  function profilFlaeche(x, y, b, h, farbe, kontur, dicke, extra) {
    return rechteck(x, y, b, h, farbe, kontur, dicke, extra);
  }

  /* Eine ruhige Fläche plus die Kante der Glasleiste. Die schräge Spiegelung von 15.09. ist
     wieder raus (Betrieb 16.09.2026: „das Glas wirkt cartoonmäßig, eine einheitliche Farbe ist
     besser, die hellere“). Hersteller zeichnen Glas in Elementskizzen genauso flach. */
  function glasFlaeche(x, y, b, h, dicke) {
    if (!(b > 0 && h > 0)) return '';
    return '<g>' + rechteck(x, y, b, h, 'url(#skz-glas)', 'none', 0) +
      rechteck(x, y, b, h, 'none', FARBE.glasKante, dicke) + '</g>';
  }
  function glas(x, y, b, h, dicke) { return glasFlaeche(x, y, b, h, dicke); }

  /* ------------------------------------------------------------------- Griff
   * Gezeichnet, nicht fotografiert: Rosette, Hebel, Griffhals. x/y = Rosettenmitte. */

  /* Drei Darstellungsarten zur Auswahl (14.09.2026), gleiche Geometrie:
       'hell'   — technischer Umriss: weiße Fläche, dunkle Kontur, keine Wirkung
       'silber' — Aluminium: seitlicher Metallverlauf, Schatten
       'weiss'  — weißer Griff mit Tiefe: heller Verlauf, Schatten
     Der Griff liegt immer auf dem Flügelrahmen, geschlossen zeigt der Hebel nach unten.
     Design-Prüfung 14.09.: Kontur mind. #6b7580 (Kontrast 4,4:1 auf hellem Rahmen), kein
     Kreis quer über dem Hebel, Schatten fällt immer nach rechts unten. */
  var GRIFF_STIL = {
    /* `kappe` ist die flache Farbe für Scharnierabdeckungen — die gehören zur Fensterfläche und
       bekommen deshalb keinen Verlauf; der Griff behält seinen (vom Betrieb abgenommen 14.09.). */
    hell:   { flaeche: '#ffffff', rosette: '#ffffff', kontur: '#3a4149', kappe: '#ffffff', schatten: false, licht: false },
    silber: { flaeche: 'url(#skz-alu)', rosette: 'url(#skz-alu-ros)', kontur: '#5f6972', kappe: '#d7dbdf', schatten: true, licht: true },
    weiss:  { flaeche: 'url(#skz-weiss)', rosette: 'url(#skz-weiss)', kontur: '#4a545e', kappe: '#ffffff', schatten: true, licht: true },
    /* Pulverbeschichtete Griffe in den RAL-Farben, die Drutex je Modell listet (Recherche 07).
       Die Hex-Werte sind Bildschirmnäherungen der RAL-Farbe, keine Herstellerangabe. Dunkle
       Griffe bekommen eine helle Kontur und einen schwächeren Glanz, sonst verschwinden sie auf
       einem anthrazitfarbenen Flügel. */
    anthrazit: { flaeche: 'url(#skz-r7016)', rosette: 'url(#skz-r7016)', kontur: '#9aa3ab', kappe: '#d7dbdf', schatten: true, licht: 'schwach' },
    schwarz:   { flaeche: 'url(#skz-r9005)', rosette: 'url(#skz-r9005)', kontur: '#8f989f', kappe: '#d7dbdf', schatten: true, licht: 'schwach' },
    braun:     { flaeche: 'url(#skz-r8019)', rosette: 'url(#skz-r8019)', kontur: '#9a9090', kappe: '#d7dbdf', schatten: true, licht: 'schwach' },
    creme:     { flaeche: 'url(#skz-r9001)', rosette: 'url(#skz-r9001)', kontur: '#7d766b', kappe: '#ffffff', schatten: true, licht: true },
    // Schüco-Oberflächen „messingfarbig/Messing-Look“ und „bronzefarbig“ (Bericht 08)
    messing:   { flaeche: 'url(#skz-messing)', rosette: 'url(#skz-messing)', kontur: '#8a7440', kappe: '#d7dbdf', schatten: true, licht: true },
    bronze:    { flaeche: 'url(#skz-bronze)', rosette: 'url(#skz-bronze)', kontur: '#6e5a45', kappe: '#d7dbdf', schatten: true, licht: 'schwach' },
    // Titan (B S. 8, Griff-Farbliste Fenster/Balkontür): dunkleres, mattes Metall — eigener Stil,
    // sonst nicht von Silber zu unterscheiden. Hex eine Bildschirmnäherung, kein Herstellerwert.
    titan:     { flaeche: 'url(#skz-titan)', rosette: 'url(#skz-titan)', kontur: '#5c6266', kappe: '#c9cdd0', schatten: true, licht: 'schwach' }
  };

  /* Griffarbe aus dem Bestellweg → Zeichenstil. Nur RAL-Nummern, die B-S8-Farbnamen (Weiß, Braun,
     Silber, Titan, Anthrazit, Schwarz, Altmessing, Creme) und „silber“ sind zeichenbar:
     Die Drutex-Codes F1/F2/F4/F9/F71 sind vom Hersteller nirgends auf eine Farbe abgebildet —
     statt zu raten bricht die Skizze ab (offene Frage 1 an Drutex, Recherche 07). Altmessing
     bekommt denselben Stil wie Messing (Bildschirmnäherung, kein eigener Hex-Wert belegt). */
  var GRIFF_FARBE = { weiss: 'weiss', RAL9016: 'weiss', silber: 'silber', RAL7016: 'anthrazit',
                      RAL9005: 'schwarz', RAL8019: 'braun', RAL9001: 'creme',
                      // Schüco nennt Farben beim Namen, nicht als RAL (Bericht 08)
                      'weiß': 'weiss', schwarz: 'schwarz', 'cremeweiß': 'creme', 'Edelstahl-Look': 'silber',
                      silberfarbig: 'silber', messingfarbig: 'messing', 'Messing-Look': 'messing',
                      bronzefarbig: 'bronze',
                      // B S. 8 (Fenster-/Balkontürgriffe): einfache deutsche Farbworte statt RAL
                      braun_wort: 'braun', anthrazit: 'anthrazit', titan: 'titan', altmessing: 'messing', creme_wort: 'creme' };
  // Zusaetzliche Klein/Freitext-Aliase, damit "braun"/"creme" (ohne RAL) nicht mit den
  // gross geschriebenen Schluesseln oben kollidieren
  GRIFF_FARBE.braun = 'braun';
  GRIFF_FARBE.creme = 'creme';
  function griffStilAus(k) {
    if (GRIFF_STIL[k.griffStil]) return k.griffStil;
    // 'standard' ist die Katalog-Vorgabe (kein eigener Farbwunsch) — Standardgriff bleibt weiß.
    if (!k.griffFarbe || k.griffFarbe === 'standard') return 'weiss';
    var st = GRIFF_FARBE[String(k.griffFarbe).replace(/\s+/g, '')];
    if (!st) throw new Error('Griffarbe „' + k.griffFarbe + '“ hat keine belegte Farbzuordnung');
    return st;
  }

  /* Griffmodell mit Systembindung (Daten: griffkatalog, belegt Recherche 07). Ein Modell, das
     Drutex für das gewählte System nicht listet, wird nicht gezeichnet — z. B. MISTRAL an einem
     IGLO-EDGE-Fenster. Das Modell bestimmt die Form; die Farbe muss in seiner Liste stehen. */
  function griffModellPruefen(k, daten, systemId) {
    if (!k.griffModell) return null;
    var kat = daten.griffkatalog || {};
    // g1033: Katalog-Id (fenster.mjs/balkontuer.mjs GRIFFE) vs. griffkatalog-Schlüssel '1033'
    // (Objektschlüssel dürfen nicht mit einer Ziffer beginnen) — dieselbe Abweichung wie
    // GRIFFKATALOG_ZU_GRIFFE_ID weiter unten, hier für die Katalogprüfung selbst.
    var katSchluessel = (k.griffModell === 'g1033') ? '1033' : k.griffModell;
    var m = kat[katSchluessel];
    if (!m || katSchluessel.charAt(0) === '_') throw new Error('Unbekanntes Griffmodell: ' + k.griffModell);
    /* Systembindung NICHT mehr als Abbruch: griffkatalog.<modell>.systeme ist eine belegte
       Verfügbarkeitsliste (Recherche 07, Quelle je Modell im Datensatz), aber die ZEICHNUNG ist
       kein Bestellweg-Gate — sie zeichnet, was verlangt wird, und überlässt die Sperre dem
       Katalog/Konfigurator (Koordinator-Entscheidung 22.09.2026, siehe PRUEFUNGEN.md). Vorher warf
       das hier bei jedem Katalog-Fall ab, der (noch) nicht in der Modell-Systemliste steht, z. B.
       NEVADA an IGLO-5-CLASSIC oder jedes Modell an SCHÜCO FOCUSING (kein Drutex-Griffprogramm
       dort belegt). */
    if (m.ausfuehrungen) {
      // Schüco: je Ausführung eigene Farbliste; die Ausführung bestimmt, was sichtbar ist
      var aName = k.griffAusfuehrung || 'basis', a = m.ausfuehrungen[aName];
      if (!a) throw new Error('Griff ' + m.name + ': Ausführung „' + aName + '“ nicht belegt');
      var fs = String((!k.griffFarbe || k.griffFarbe === 'standard') ? 'weiß' : k.griffFarbe);
      if (a.farben.indexOf(fs) < 0) throw new Error('Griff ' + m.name + ' ' + aName + ' gibt es nicht in ' + fs);
      return { name: m.name, form: m.form, rosette: m.rosette, art: a.art, laengeFaktor: a.laengeFaktor || 1 };
    }
    // 'standard' (keine eigene Farbwahl) → Katalog-Vorgabe des Modells, ohne Farbprüfung
    var farbe = String((!k.griffFarbe || k.griffFarbe === 'standard') ? (m.farben[0] || 'RAL9016') : k.griffFarbe).replace(/\s+/g, '');
    var liste = (k.griffArt === 'abschliessbar' && m.abschliessbarFarben) ? m.abschliessbarFarben : m.farben;
    // silber/titan/altmessing sind keinem Drutex-Kürzel (F1, F2, F4, F9) sicher zugeordnet: nur
    // sperren, wenn die Liste weder ein F-Kürzel noch den Namen selbst enthält (z. B. MA 1010 =
    // nur 'silber'). Belegt: drutex.de addons, abgerufen 22.09.2026 (Konfigurator-Sitzung).
    var ohneZuordnung = /^(silber|titan|altmessing)$/i.test(farbe) &&
                        liste.some(function (c) { return /^F\d+$/.test(c); });
    /* Der Katalog schickt Farbworte (B S. 8: „Anthrazit“), griffkatalog führt RAL-Nummern
       (RAL 7016). Beide Seiten über GRIFF_FARBE auf denselben Stil bringen — bis 26.09.2026 fiel
       „anthrazit“ ≠ „RAL7016“ durch und jede Farbwahl außer Silber/Titan/Altmessing warf. */
    var stil = function (c) { return GRIFF_FARBE[c] || c; };
    var vorhanden = liste.some(function (c) { return stil(c) === stil(farbe); });
    if (!vorhanden && !ohneZuordnung) {
      throw new Error('Griff ' + m.name + (k.griffArt === 'abschliessbar' ? ' abschließbar' : '') +
                      ' gibt es nicht in ' + farbe);
    }
    return { name: m.name, form: m.form, rosette: null, art: null, laengeFaktor: 1 };
  }

  /* --------------------------------------------------------- Echte Griffbauteile (griffe.js)
   * griffe.js zeichnet fünf (bald mehr) Griffmodelle als eigene Silhouette statt des generischen
   * Einheitsgriffs oben. Katalog-Id (daten.griffkatalog, z. B. „1033“) und Modell-Id in griffe.js
   * (z. B. „g1033“ — Objektschlüssel dürfen nicht mit einer Ziffer beginnen) weichen an einer
   * Stelle voneinander ab; alles, was griffe.js noch nicht kennt (Schüco-Modelle — eine andere
   * Sitzung ergänzt sie gerade dort), fällt auf den Drutex-Standard MISTRAL zurück. Das Modell
   * steht trotzdem im Schriftfeld (schriftfeldZeilen liest daten.griffkatalog, nicht griffe.js),
   * der Rückfall betrifft nur die Zeichnung, nicht die Angabe. */
  var GRIFFKATALOG_ZU_GRIFFE_ID = { '1033': 'g1033' };
  var GRIFF_STIL_ZU_GRIFFE_FARBE = { weiss: 'weiss', silber: 'silber', titan: 'titan',
    anthrazit: 'anthrazit', schwarz: 'schwarz', braun: 'braun', creme: 'creme',
    // griffe.js führt nur „altmessing“ (Katalogfarbe S. 8); messingfarbig/bronzefarbig (Schüco,
    // eigene Hex-Stile oben) sind dieselbe Bildschirmnäherung wie beim generischen Griff.
    messing: 'altmessing', bronze: 'altmessing' };
  function griffeModellId(katalogId) {
    var g = global.skizzeGriffe;
    if (!g) return null;
    var id = GRIFFKATALOG_ZU_GRIFFE_ID[katalogId] || katalogId;
    return (id && g.MODELLE.indexOf(id) >= 0) ? id : 'mistral';
  }
  function griffeFarbeId(stilName) {
    var g = global.skizzeGriffe;
    if (!g) return null;
    var farbe = GRIFF_STIL_ZU_GRIFFE_FARBE[stilName] || 'weiss';
    return (g.FARBEN.indexOf(farbe) >= 0) ? farbe : 'weiss';
  }
  /* Baut den echten Griff (griffe.js) statt des generischen Symbols — nur wenn das Modul geladen
     ist (skizzeGriffe global, siehe HTML/Test-Ladereihenfolge). Ohne griffkatalog-Wahl (Standard)
     gilt MISTRAL als gezeichnetes Modell, siehe Katalogprüfung (fenster.mjs griff_modell,
     vorgabe „standard“ — die Drutex-Broschüre S. 16/17 zeigt zum Standardgriff dasselbe Foto wie
     zu Mistral). */
  function griffEcht(x, y, k, stilName, f, lage, griffArtWert, uidLokal) {
    /* Abgeschaltet (Eigentümer-Feedback 22.09.2026, Vergleich gegen Commit bd74aaa): griffe.js
       griffSvg sah gegenüber dem am 14.09.2026 abgenommenen Griff C („weiß mit Tiefe“) schlechter
       aus. Gibt diese Funktion `null` zurück, fällt der Aufrufer über `||` auf
       griff()/hebelPfad()/GRIFF_FORM/GRIFF_STIL zurück — genau die Konstruktion aus bd74aaa, die
       Betrieb freigegeben hat (siehe griff() weiter unten). griffe.js bleibt im Code für eine
       spätere Sitzung, wird von hier aber nicht mehr aufgerufen. */
    return null;
  }

  /* --------------------------------------------------------------- Griffformen
   * Hersteller führen zwar viele Griffnamen, aber die Zahl der Formen, die sich in einer
   * Elementzeichnung überhaupt unterscheiden lassen, ist klein. Die Schüco-Auswertung vom
   * 16.09.2026 (Bericht 08) nennt genau drei: kantige Schulter (Reihe Standard / Euro
   * Standard), geschwungene Schulter (Reihe Design / Euro Design) und durchgehend
   * rechteckig-scharfkantig (Euro eckig). Alles andere — Sicherheitsstufen, Akustik,
   * SmartActive — sieht laut Hersteller gleich aus und bekommt deshalb KEINE eigene Form.
   *
   * Die Länge ist ein Symbolmaß, solange der Hersteller keine veröffentlicht. Belegt ist bei
   * Schüco bisher nur „Grifflänge ca. 160 mm“, und zwar ausschließlich für die Komfort-Griffe;
   * die Messkante dazu ist nicht angegeben. Deshalb steckt die Länge nicht hier im Code,
   * sondern kommt als Faktor von außen.
   *
   * x/y = Rosettenmitte, der Hebel zeigt nach unten (geschlossene Stellung). */
  var GRIFF_FORM = {
    /* Geschwungen: der Hals geht in einem weichen Bogen in den Hebel über, das Ende ist rund.
       Das ist die Form, die Betrieb am 14.09.2026 abgenommen hat — deshalb bleibt sie Standard. */
    geschwungen: function (x, y, f, lf) {
      var b = GRIFF.breite / 2 * f, l = GRIFF.laenge * f * (lf || 1), e = b * 1.12;
      return 'M' + z(x - b) + ' ' + z(y) +
             ' A' + z(b) + ' ' + z(b) + ' 0 0 1 ' + z(x + b) + ' ' + z(y) +
             ' L' + z(x + e) + ' ' + z(y + l - e) +
             ' A' + z(e) + ' ' + z(e) + ' 0 0 1 ' + z(x - e) + ' ' + z(y + l - e) + ' Z';
    },
    /* Gestuft: derselbe runde Hals, aber die Schulter setzt mit einem geraden Absatz auf —
       bei Drutex „gestufter Übergang Rosette–Hals“ (1033, DUBLIN). */
    gestuft: function (x, y, f, lf) {
      var b = GRIFF.breite / 2 * f, l = GRIFF.laenge * f * (lf || 1), e = b * 1.2,
          s = l * 0.30, r = e * 0.55;
      return 'M' + z(x - b) + ' ' + z(y) +
             ' A' + z(b) + ' ' + z(b) + ' 0 0 1 ' + z(x + b) + ' ' + z(y) +
             ' L' + z(x + b) + ' ' + z(y + s) +
             ' L' + z(x + e) + ' ' + z(y + s + e * 0.7) +
             ' L' + z(x + e) + ' ' + z(y + l - r) +
             ' Q' + z(x + e) + ' ' + z(y + l) + ' ' + z(x + e - r) + ' ' + z(y + l) +
             ' L' + z(x - e + r) + ' ' + z(y + l) +
             ' Q' + z(x - e) + ' ' + z(y + l) + ' ' + z(x - e) + ' ' + z(y + l - r) +
             ' L' + z(x - e) + ' ' + z(y + s + e * 0.7) +
             ' L' + z(x - b) + ' ' + z(y + s) + ' Z';
    },
    /* Eckig: durchgehend rechteckig, scharfe Kanten, kein Bogen — Schüco „Euro eckig“. */
    eckig: function (x, y, f, lf) {
      // schmaler als die Rosette, sonst verschmelzen Hebel und Rosette zu einem Balken
      var b = GRIFF.breite / 2 * f * 0.86, l = GRIFF.laenge * f * (lf || 1);
      return 'M' + z(x - b) + ' ' + z(y - b * 0.75) +
             ' L' + z(x + b) + ' ' + z(y - b * 0.75) +
             ' L' + z(x + b) + ' ' + z(y + l) +
             ' L' + z(x - b) + ' ' + z(y + l) + ' Z';
    },
    /* Rundrohr: gleichbleibend schmaler runder Hebel mit halbrund geschlossenem Ende —
       Drutex MA 1010 Edelstahl und HOPPE HAMBURG (Recherche 07, 16.09.2026). */
    rundrohr: function (x, y, f, lf) {
      var b = GRIFF.breite / 2 * f * 0.78, l = GRIFF.laenge * f * (lf || 1);
      return 'M' + z(x - b) + ' ' + z(y) +
             ' A' + z(b) + ' ' + z(b) + ' 0 0 1 ' + z(x + b) + ' ' + z(y) +
             ' L' + z(x + b) + ' ' + z(y + l - b) +
             ' A' + z(b) + ' ' + z(b) + ' 0 0 1 ' + z(x - b) + ' ' + z(y + l - b) + ' Z';
    }
  };

  /* Welche Rosette zu welcher Form gehört — aus denselben Herstellerunterlagen:
     eckige Griffe tragen eine rechteckige Rosette, das Rundrohr eine runde, alles andere die
     senkrecht-langrunde. Ausdrücklich überschreibbar über `k.griffRosette`. */
  var GRIFF_ROSETTE = { geschwungen: 'langrund', gestuft: 'rechteckig', eckig: 'rechteckig', rundrohr: 'rund' };

  /* Hebel etwas kürzer (Betrieb auf 8960, 01.10.2026: „Der Griff kann allgemein minimal kürzer sein“): 85 % der bisherigen
     Hebellänge, Rosette unverändert. Die Länge ist ohnehin ein Symbolmaß (siehe oben), keine Herstellerangabe. Gilt für
     jeden Hebelgriff (Fenster, Balkontür, Schiebetür, Griffkarten); der Haustür-Drücker hat eine eigene Konstruktion. */
  var GRIFF_HEBEL = 0.85;
  function hebelPfad(x, y, f, form, lf) {
    return (GRIFF_FORM[form] || GRIFF_FORM.geschwungen)(x, y, f, (lf == null ? 1 : lf) * GRIFF_HEBEL);
  }

  /* Mindestgröße: Auf großen Elementen wächst der Griff mit, damit er in Mail (528×640) und
     am Handy erkennbar bleibt — höchstens 1,5-fach und nie über das Flügelprofil hinaus.
     Maßstab 1400 mm: dort wirkt der Griff in echter Größe richtig (Design-Prüfung 14.09.). */
  /* Obergrenze 16.09.2026 von 1,5 auf 2,2 angehoben: In der Mail (528 × 640) schrumpfte der
     Griff bei einem 3000 × 2300 mm Element auf 7,5 × 35 px, das Band auf 3 px — Schrift und
     Linien blieben gleich groß, nur der Beschlag verschwand (Design-Prüfung 16.09., M2). Die
     Rosette darf den Flügelholm jetzt bis auf je 4 mm füllen; darüber hinaus nie. */
  var BESCHLAG_MAX = 2.2;
  function griffFaktor(groessteSeite, profil, fluegelLaenge) {
    var fMax = Math.min(BESCHLAG_MAX, (profil - 8) / GRIFF.rosetteB, (fluegelLaenge / 2 - profil) / GRIFF.laenge);
    return Math.max(1, Math.min(groessteSeite / 1400, fMax));
  }

  /* Derselbe Gedanke für die Bänder: Sie wachsen mit, bleiben aber auf der sichtbaren
     Rahmenfläche (Bandbreite höchstens 95 % davon). */
  function bandFaktor(groessteSeite, rahmen, bandBreite) {
    return Math.max(1, Math.min(groessteSeite / 1400, BESCHLAG_MAX, rahmen * 0.95 / bandBreite));
  }

  /* Der liegende Griff des Kippflügels braucht eine eigene Mindestgröße (Betrieb 16.09.2026:
     „bei Kipp musst du den Griff oben irgendwie sichtbar machen“). Stehend liest das Auge die
     Länge des Hebels, liegend nur die Höhe der Rosette — 31 mm gegen einen 78 mm hohen
     Flügelholm verschwinden darin. Deshalb wird die Rosette hier auf gut die halbe Holmhöhe
     gebracht, begrenzt durch den Holm selbst, damit sie nicht darüber hinaussteht. */
  function griffFaktorWaagerecht(profil, fluegelBreite) {
    var fMax = Math.min(1.6,
      (profil - 10) / GRIFF.rosetteB,                 // bleibt im Flügelholm
      (fluegelBreite / 2 - profil) / GRIFF.laenge,    // stößt nicht an den Rahmen
      0.24 * fluegelBreite / GRIFF.laenge);           // höchstens ein Viertel der Flügelbreite
    return Math.max(1, Math.min(profil * 0.58 / GRIFF.rosetteB, fMax));
  }

  /* drehung: Winkel, um den der Aufrufer den Griff dreht (Kipp, Türdrücker). Der Schatten
     wird gegengedreht, damit er in der fertigen Zeichnung immer nach rechts unten fällt. */
  /* griffArt: 'standard' | 'abschliessbar' (Schließzylinder als kleiner Kreis am Griffhals,
     wie im Drutex-TBT-Schema [K] S. 72) | 'knopf' (Druckknopf-Sperre am Griffhals, [K] S. 80/81
     nennt die Option; Darstellung als Symbol). */
  function griff(x, y, stilName, dicke, f, drehung, griffArt, form, rosetteArt, laengeF) {
    var st = GRIFF_STIL[stilName] || GRIFF_STIL.weiss,
        /* Eckige Griffe bekommen auch eine eckige Rosette — bei Schüco „Euro eckig“ gehört
           beides zusammen (Bericht 08). Bei den runden Formen bleibt die langrunde Rosette. */
        rosette = rosetteArt || GRIFF_ROSETTE[form] || 'langrund',
        /* Euro-Rosette (Schüco Euro-Reihen): schmaler und etwas höher als die langrunde —
           Zeichenannahme nach dem Katalogbild, Maße veröffentlicht Schüco nicht. */
        rb = GRIFF.rosetteB * f * (rosette === 'euro' ? 0.82 : 1),
        rh = (rosette === 'rund' ? GRIFF.rosetteB : GRIFF.rosetteH) * f * (rosette === 'euro' ? 1.12 : 1),
        rund = rosette === 'rechteckig' ? rb * 0.12 : rb / 2,
        pfad = hebelPfad(x, y, f, form, laengeF),
        s = '<g stroke-linejoin="round" data-teil="griff">';
    if (st.schatten) {
      var v = Math.max(dicke * 1.3, 2.5), w = -(drehung || 0) * Math.PI / 180,
          dx = v * Math.cos(w) - v * 1.2 * Math.sin(w),
          dy = v * Math.sin(w) + v * 1.2 * Math.cos(w);
      s += '<g transform="translate(' + z(dx) + ' ' + z(dy) + ')" fill="rgba(20,28,36,.14)" stroke="none">' +
           rechteck(x - rb / 2, y - rh / 2, rb, rh, 'rgba(20,28,36,.14)', 'none', 0,
                    ' rx="' + z(rund) + '" ry="' + z(rund) + '"') +
           '<path d="' + pfad + '"/></g>';
    }
    s += rechteck(x - rb / 2, y - rh / 2, rb, rh, st.rosette, st.kontur, dicke,
                  ' rx="' + z(rund) + '" ry="' + z(rund) + '"');
    s += '<path d="' + pfad + '" fill="' + st.flaeche + '" stroke="' + st.kontur +
         '" stroke-width="' + z(dicke) + '"/>';
    if (st.licht) {
      s += linie(x - GRIFF.breite * 0.2 * f, y + GRIFF.breite * 0.2 * f, x - GRIFF.breite * 0.22 * f, y + GRIFF.laenge * 0.82 * f,
                 st.licht === 'schwach' ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.9)', dicke * 0.9, ' stroke-linecap="round"');
    }
    if (griffArt === 'abschliessbar') {
      var zy = y + GRIFF.breite * 0.55 * f, zr = GRIFF.breite * 0.26 * f;
      s += '<g data-teil="zylinder"><circle cx="' + z(x) + '" cy="' + z(zy) + '" r="' + z(zr) + '" fill="#cfd5da" stroke="' +
           st.kontur + '" stroke-width="' + z(dicke * 0.8) + '"/>' +
           linie(x, zy - zr * 0.55, x, zy + zr * 0.55, st.kontur, dicke * 0.8, ' stroke-linecap="round"') + '</g>';
    } else if (griffArt === 'knopf') {
      s += '<circle data-teil="knopf" cx="' + z(x) + '" cy="' + z(y) + '" r="' + z(GRIFF.breite * 0.24 * f) +
           '" fill="#cfd5da" stroke="' + st.kontur + '" stroke-width="' + z(dicke * 0.8) + '"/>';
    }
    return s + '</g>';
  }

  /* Derselbe Griff, um 90 Grad gedreht — für Kippflügel, deren Griff oben sitzt. */
  function griffWaagerecht(x, y, stilName, dicke, f, griffArt, form, rosetteArt, laengeF) {
    return '<g transform="rotate(-90 ' + z(x) + ' ' + z(y) + ')">' + griff(x, y, stilName, dicke, f, -90, griffArt, form, rosetteArt, laengeF) + '</g>';
  }

  /* Türdrücker: derselbe Griff, waagerecht zur Türmitte hin. */
  function klinke(x, y, rechts, stilName, dicke, f) {
    var winkel = rechts ? 90 : -90;
    return '<g transform="rotate(' + winkel + ' ' + z(x) + ' ' + z(y) + ')">' + griff(x, y, stilName, dicke, f, winkel) + '</g>';
  }

  /* Der Flächenverlauf „skz-tiefe“ ist am 16.09.2026 entfallen — er hat weiße Profile grau
     gefärbt. Die Tiefe steckt jetzt in profilFlaeche() als Kantensaum. */
  var TIEFE_DEF = '';

  function ralVerlauf(id, rand, mitte, schatten) {
    return '<linearGradient id="skz-' + id + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="' + rand + '"/><stop offset="40%" stop-color="' + mitte + '"/>' +
      '<stop offset="100%" stop-color="' + schatten + '"/></linearGradient>';
  }
  var GRIFF_DEFS =
    '<linearGradient id="skz-alu" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#c3c9cf"/><stop offset="35%" stop-color="#f4f6f8"/>' +
      '<stop offset="70%" stop-color="#d5dade"/><stop offset="100%" stop-color="#b3bac1"/></linearGradient>' +
    '<linearGradient id="skz-alu-ros" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#eef1f3"/><stop offset="100%" stop-color="#c2c8ce"/></linearGradient>' +
    ralVerlauf('r7016', '#2a2f33', '#4a5156', '#262a2d') +
    ralVerlauf('r9005', '#0a0a0a', '#2c2c2e', '#050505') +
    ralVerlauf('r8019', '#352f2f', '#544b4b', '#2e2828') +
    ralVerlauf('r9001', '#dcd3c3', '#f1e9dc', '#d4cab9') +
    ralVerlauf('messing', '#b39650', '#e3cf8f', '#9c8141') +
    ralVerlauf('bronze', '#6f5840', '#9a7f60', '#5b4733') +
    ralVerlauf('titan', '#6d7377', '#9aa0a3', '#575c5f') +
    '<linearGradient id="skz-weiss" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#e6e9ec"/><stop offset="40%" stop-color="#ffffff"/>' +
      '<stop offset="100%" stop-color="#dde1e5"/></linearGradient>';

  /* ------------------------------------------------------------------- Bänder
   * Zwei bei Drehflügeln, drei bei hohen Flügeln. Sitzen auf der Bandseite. */

  /* Scharnierabdeckungen: Drutex setzt auf die sichtbaren Bänder Kappen (K S. 72/73, Farben
     Weiß/Braun/Hellbraun/Silber, optional weitere). Sie sitzen auf dem Flügel an der Bandseite:
     oben die lange Kappe des Scherenlagers, unten die kürzere des Ecklagers. Maße sind
     Zeichenmaße (siehe zeichnung.beschlag), Form nach dem Katalogfoto. */
  /* Nachgezeichnet vom Katalogfoto „STANDARD BESCHLAG“ (Drutex Kunststofffenster [K] S. 72):
     Das sichtbare Band ist ein schlanker, silberner Metallzylinder mit Bund oben und unten. Es
     sitzt IN DER ECKE des Flügels auf der Rahmenfalz, nicht mittig auf der Flügelfläche, und
     es ist immer metallisch — auch am anthrazitfarbenen Fenster. Farbige Abdeckungen (Weiß,
     Braun, Hellbraun, Silber) sind laut derselben Seite eine Zusatzausstattung.
     Vorige Fassung (15.09.) war eine weiße Kappe mittig am Flügel — Betrieb 16.09.2026:
     „die Scharniere sind mir oben zu unrealistisch“. */
  function kappe(x, y, b, h, dicke, stil) {
    /* Maßverhältnisse vom Foto abgenommen: Bunde stehen seitlich über den Schaft hinaus, der
       Schaft hat rechts und links eine dunkle Längskante, die Ecken sind fast rechtwinklig.
       Eine stark gerundete Kapsel (rx = 0,3 b) sah beim Zoomen aus wie eine Tablette. */
    var r = b * 0.12, bh = h * 0.13, bb = b * 1.16, d = Math.max(dicke * 0.7, 0.8),
        sx = x - b / 2, sy = y - h / 2;
    return '<g data-teil="band" stroke-linejoin="round">' +
      rechteck(sx, sy, b, h, 'url(#skz-alu)', BAND_KONTUR, d, ' rx="' + z(r) + '" ry="' + z(r) + '"') +
      // dunkle Längskanten: der Schaft ist rund, die Ränder liegen im Schatten
      linie(sx + b * 0.08, sy + bh, sx + b * 0.08, sy + h - bh, 'rgba(45,54,63,.30)', b * 0.14) +
      linie(sx + b * 0.92, sy + bh, sx + b * 0.92, sy + h - bh, 'rgba(45,54,63,.34)', b * 0.14) +
      linie(sx + b * 0.34, sy + bh, sx + b * 0.34, sy + h - bh, 'rgba(255,255,255,.8)', b * 0.14) +
      // Bunde oben und unten, seitlich überstehend — daran erkennt man das Band als Band
      rechteck(x - bb / 2, sy, bb, bh, 'url(#skz-alu)', BAND_KONTUR, d, ' rx="' + z(r) + '"') +
      rechteck(x - bb / 2, sy + h - bh, bb, bh, 'url(#skz-alu)', BAND_KONTUR, d, ' rx="' + z(r) + '"') +
      '</g>';
  }
  var BAND_KONTUR = '#5f6a74';

  /* Echtes Fensterband (griffe.js bandSvg) statt der alten Kappen-Tablette — dieselbe Fallback-
     Regel wie griffEcht(): nur wenn das Modul geladen ist, sonst bleibt kappe() bestehen.
     bandSvg zeichnet ein festes Symbol in eigenen, festen mm-Einheiten (Deckel 34 breit × 20 hoch,
     „oben“ zusätzlich mit Scherenarm bis 32 hoch) — KEINE einzelne Skala aus einer der beiden
     Zielgrößen (Korrektur 22.09.2026: eine aus der Höhe abgeleitete Skala blies die Breite auf ein
     Vielfaches auf, das Band wurde als ~120-mm-Klotz gemeldet). Stattdessen b/h (aus
     zeichenmass 'beschlag' kappeBreite/kappeObenHoehe/kappeUntenHoehe, ~20×90–112 mm — dieselben
     Zeichenmaße wie bei der alten kappe()) je Achse EIGENSTÄNDIG auf die native Symbolgröße
     skaliert, um (x,y) als Bandmitte zentriert. */
  var BAND_NATIV_B = 34, BAND_NATIV_H_OBEN = 32, BAND_NATIV_H_UNTEN = 20;
  function bandEcht(x, y, b, h, lage, farbeName, idPraefix) {
    /* Abgeschaltet (Eigentümer-Feedback 22.09.2026, wie griffEcht() oben): fällt über `||`
       zurück auf kappe() — dieselbe Bandkappe wie in Commit bd74aaa. */
    return null;
  }

  /* Dreh- und Dreh-Kipp-Flügel: OBEN und UNTEN je eine Kappe (Eigentümer-Entscheid 22.09.2026,
     später am selben Tag zurückgenommen: „doch wieder oben und unten“ — zurück auf den
     bd74aaa-Stand, zwei Kappen, dieselbe schlanke, dezente kappe()-Form wie unten, oben nur
     kürzer/kleiner (kappeObenHoehe < kappeUntenHoehe, siehe Test „unten größer als oben“). */
  function baender(daten, fx, fy, fb, fh, bandRechts, dicke, stil, f, farbeName, idPraefix, amNachbarn) {
    f = f || 1;
    var Z = function (e) { return zeichenmass(daten, 'beschlag', e) * f; },
        // Faktor 0,5 = das Band steht bündig an der Flügelkante und liegt ganz auf dem Rahmen,
        // wie im Katalogfoto. Bei 0,35 ragte es 3 von 20 mm auf den Flügel und verdeckte die Fuge.
        // amNachbarn (01.10.2026, Betrieb: „Griff und Scharniere auf derselben Seite … sowas gibt's nicht“): Liegt die
        // Bandseite nicht am Blendrahmen, sondern am Nachbarflügel (Flügel stoßen im Hauptfeld ohne sichtbaren Pfosten
        // aneinander, Betrieb 30.09.), lag das Band außen auf dem NACHBARN, direkt neben dessen Griff. Dann sitzt es
        // innen auf der eigenen Flügelkante.
        b = Z('kappeBreite'), x = amNachbarn ? (bandRechts ? fx + fb - b * 0.5 : fx + b * 0.5)
                                             : (bandRechts ? fx + fb + b * 0.5 : fx - b * 0.5),
        hOben = Z('kappeObenHoehe'), yOben = fy + Z('kappeObenAbstand'),
        hUnten = Z('kappeUntenHoehe'), yUnten = fy + fh - Z('kappeUntenAbstand');
    return (bandEcht(x, yOben, b, hOben, 'oben', farbeName, idPraefix) || kappe(x, yOben, b, hOben, dicke, stil)) +
           (bandEcht(x, yUnten, b, hUnten, 'unten', farbeName, idPraefix) || kappe(x, yUnten, b, hUnten, dicke, stil));
  }

  /* Kippflügel: die Bänder sitzen unten, die Zylinder liegen also waagerecht auf der unteren Falz. */
  function baenderUnten(daten, fx, fy, fb, fh, dicke, stil, f, farbeName, idPraefix) {
    f = f || 1;
    var Z = function (e) { return zeichenmass(daten, 'beschlag', e) * f; },
        b = Z('kappeBreite'), a = zeichenmass(daten, 'beschlag', 'kappeKippAbstand'), y = fy + fh + b * 0.5,
        hUnten = Z('kappeUntenHoehe'), s = '';
    [fx + fb * a, fx + fb * (1 - a)].forEach(function (x) {
      s += '<g transform="rotate(90 ' + z(x) + ' ' + z(y) + ')">' +
        (bandEcht(x, y, b, hUnten, 'unten', farbeName, idPraefix) || kappe(x, y, b, hUnten, dicke, stil)) + '</g>';
    });
    return s;
  }

  /* Achsteilung: Teilmaße laufen von Rahmenaußenkante zu Pfostenmitte, so wie Elemente
     bestellt werden — die Summe ergibt immer das Gesamtmaß. Gerundet wird auf ganze mm,
     der Rest landet im letzten Feld. Die Pfostenbreite (Platzhalter) steckt in keiner
     angezeigten Zahl. */
  function achsen(gesamt, anzahl) {
    var grenzen = [0];
    for (var i = 1; i < anzahl; i++) grenzen.push(Math.round(gesamt * i / anzahl));
    grenzen.push(gesamt);
    return grenzen;
  }

  /* --------------------------------------------------- Öffnungsrichtung (DIN)
   * Konvention: Dreiecksbasis auf der Bandseite, Spitze zur Griffseite.
   * Kippflügel: Dreieck mit Spitze nach oben, Basis unten.
   * Dreh-Kipp: beide übereinander.
   * Festfeld: Kreuz in der Mitte.                                             */

  /* Als Linien gezeichnet, nicht als <text>: Kartenbilder tragen bewusst keine Schrift, und in der
     Mail-PNG hängt ein Buchstabe nicht von der installierten Schrift ab. Proportion wie ein
     serifenloses Versal-F: Höhe h, Breite 0,55 h, Mittelbalken 0,8 der Breite auf 0,48 h. */
  var festKennungH = 0;   // je Zeichnung gleich groß, gesetzt in zeichne(); 0 = nach Feldgröße (Karten)
  function festFeldKennung(x1, y1, x2, y2) {
    var feld = Math.min(x2 - x1, y2 - y1),
        h = Math.max(festKennungH > 0 ? Math.min(festKennungH, feld * 0.45) : feld * 0.2, 1), b = h * 0.55, st = h * 0.12,
        x = (x1 + x2) / 2 - b / 2 + st / 2, y = (y1 + y2) / 2 - h / 2;
    return '<path data-teil="fest-kennung" d="M' + z(x) + ' ' + z(y + h) + ' L' + z(x) + ' ' + z(y) + ' L' + z(x + b) + ' ' + z(y) +
      ' M' + z(x) + ' ' + z(y + h * 0.48) + ' L' + z(x + b * 0.8) + ' ' + z(y + h * 0.48) +
      '" fill="none" stroke="' + FARBE.symbol + '" stroke-opacity="0.75" stroke-width="' + z(st) +
      '" stroke-linecap="butt" stroke-linejoin="miter"/>';
  }

  function oeffnungsSymbol(art, x1, y1, x2, y2, dicke) {
    var links = x1, rechts = x2, oben = y1, unten = y2,
        mx = (x1 + x2) / 2, my = (y1 + y2) / 2,
        d = dicke, s = '', g = '<g fill="none" stroke="' + FARBE.symbol +
          '" stroke-width="' + z(d) + '" stroke-linejoin="round" stroke-linecap="round">';

    function dreieckWaagerecht(spitzeRechts) {
      // Basis auf der Bandseite (gegenüber der Spitze)
      var bx = spitzeRechts ? links : rechts,
          sx = spitzeRechts ? rechts : links;
      return linie(bx, oben, sx, my, FARBE.symbol, d) +
             linie(bx, unten, sx, my, FARBE.symbol, d);
    }
    function dreieckKipp() {
      return linie(links, unten, mx, oben, FARBE.symbol, d) +
             linie(rechts, unten, mx, oben, FARBE.symbol, d);
    }
    /* Festverglasung: „F“ statt „+“ (Betrieb 29.09.2026: übliche Kennzeichnung am Markt und in
       Fensterzeichnungen). In den Drutex-Quellen (K, KAH, D, HS-Datenblätter) ist KEINE Feldkennzeichnung
       belegt — es ist eine Darstellungsentscheidung, keine Produktangabe. Eine Funktion für alle festen
       Felder aller Produkte (festFeldKennung), damit es überall gleich aussieht. */
    function kreuz() { return festFeldKennung(links, oben, rechts, unten); }

    switch (art) {
      case 'dreh-r':  s = dreieckWaagerecht(false); break;  // Band rechts, öffnet links
      case 'dreh-l':  s = dreieckWaagerecht(true);  break;
      case 'dk-r':    s = dreieckWaagerecht(false) + dreieckKipp(); break;
      case 'dk-l':    s = dreieckWaagerecht(true)  + dreieckKipp(); break;
      case 'kipp':    s = dreieckKipp(); break;
      case 'fest':    return kreuz();
      default:        return '';
    }
    return g + s + '</g>';
  }

  /* ---------------------------------------------------------------- Maßkette */

  /* Bemaßung (Design-Prüfung 16.09.2026):
     - Die Zahl steht immer auf der AUSSENSEITE der Maßlinie — links vom linken Maß, rechts vom
       rechten, über dem oberen, unter dem unteren. Vorher stand sie bei senkrechten Maßen immer
       rechts der Linie, links also zwischen Maßlinie und Rahmen.
     - Derselbe sichtbare Abstand zwischen Ziffer und Linie in beiden Richtungen (vorher 9,7 px
       waagerecht gegen 1,9 px senkrecht in der Mailgröße).
     - Ist das Maß kürzer als seine Zahl, liefen die Endstriche durch die Ziffern („20“ an der
       Balkontürschwelle, „60“ an der HS-Schwelle). Dann rückt die Zahl hinter das Maßende.
     `seite`: -1 = Zahl links bzw. oben, +1 = rechts bzw. unten.
     `ausweich`: +1 = kurze Maße rücken nach unten/rechts hinaus, -1 = nach oben/links. */
  var ZIFFER_B = 0.6,      // mittlere Ziffernbreite je Schriftgröße (Systemschrift, fett)
      ZIFFER_H = 0.72,     // Höhe der Ziffern je Schriftgröße
      MASS_LUFT = 0.28;    // sichtbarer Abstand Ziffer–Maßlinie je Schriftgröße

  function textLaenge(text, schrift) { return String(text).length * ZIFFER_B * schrift; }

  /* Renderweiter Schalter für k.ohneMasse: massWaagerecht/massSenkrecht sind die EINZIGEN Stellen,
     an denen eine Maßkette entsteht — wird er gesetzt, liefern beide nichts. Der Platz am Rand
     bleibt reserviert (die Randberechnung hängt an vielen Stellen daran); für ein Kartenbild wird
     ohnehin ein Ausschnitt gesetzt. Gesetzt und zurückgesetzt wird er in zeichne(). */
  var ohneMasse = false;
  /* k.ohneBeschriftung (30.09.2026, Betrieb: „Ansicht von innen“ darf nicht ins Bild gezeichnet sein, das
     stammt aus der alten Angebotserstellung): Im Konfigurator schreibt der Motor KEINEN Text ins Bild außer
     den Maßzahlen. Ansicht, DIN-Seite, Hinweise, Legende und Titel setzt die Oberfläche als eigene Zeile
     unter die Skizze. Mail-PNG und Angebots-PDF behalten die Unterschrift (eigenständiges Dokument, DIN 107:
     die Blickrichtung gehört auf die Zeichnung). */
  var ohneBeschriftung = false;
  /* k.hervorheben (30.09.2026, Maßeingabe: der Kunde sieht nicht, welches Feld zu welchem Teil der Skizze
     gehört): 'breite' | 'hoehe' | 'oberlicht_hoehe' | 'unterlicht_hoehe'. Die zugehörige Maßkette wird in der
     Akzentfarbe der Seite (--primary #2e69b2) gezeichnet, das Feld leicht getönt. Fenster und Balkontür. */
  var hervorheben = null, AKZENT = '#2e69b2', HERVORHEBBAR = ['breite', 'hoehe', 'oberlicht_hoehe', 'unterlicht_hoehe', 'verbreiterung'];
  function akzentWenn(art, svg) {
    if (!hervorheben || !art || art !== hervorheben || !svg) return svg;
    return svg.split(FARBE.massLinie).join(AKZENT).split(FARBE.massText).join(AKZENT)
      .replace('<g>', '<g data-teil="hervorhebung-mass">');
  }

  /* k.bildkasten = { breite, hoehe } in px: setzt width/height am Wurzel-SVG (Betrieb 25.09.2026 —
     „dass es überall reinpasst, im Warenkorb und im Angebot"). OHNE diese beiden Angaben hat ein
     SVG keine eigene Höhe: der Browser gibt ihm 100 % Breite und rechnet die Höhe aus dem
     Seitenverhältnis — in einem Kasten fester Höhe (Warenkorbzeile, Mail-Bild, PDF-Zelle) läuft es
     dann unten heraus, und das Schriftfeld steht außerhalb des Rahmens (gesehen am Prüfblatt
     blatt/einsatzorte.png, 25.09.2026). Mit kasten füllt die Zeichnung genau den zugewiesenen
     Platz und bleibt durch preserveAspectRatio zentriert und unverzerrt. Der Name grenzt sich
     bewusst von `rollladen.kasten` (Rollladenkasten) ab — es ist der BILDkasten. */
  /* Ohne Maßketten braucht es auch den Platz nicht, den sie brauchten: mit `ohneMasse` schrumpfen
     die drei Ränder, die nur für Maßketten da sind (links/rechts/oben), auf einen schmalen Rest.
     Sonst schwebt ein Bauteil in einer Warenkorbkachel mitten in Luft und wirkt kleiner als das
     Nachbarbild (gesehen am Prüfblatt blatt/einsatzorte.png, 25.09.2026). Der untere Rand bleibt,
     solange das Schriftfeld darunter steht — er gehört dem Text, nicht dem Maß. */
  function massRand(wert, schrift) { return ohneMasse ? schrift * 0.6 : wert; }

  var kastenAttr = '';
  function kastenAus(k) {
    if (!k || !k.bildkasten) return '';
    var b = +k.bildkasten.breite, h = +k.bildkasten.hoehe;
    if (!(b > 0) || !(h > 0)) throw new Error('bildkasten braucht breite und hoehe in px (>0)');
    return ' width="' + z(b) + '" height="' + z(h) + '"';
  }

  /* Waagerechte Teilmaßkette staffeln (30.09.2026, Wächter „Zahlen frei“): Bei schmalen Feldern (3 × 200 mm) waren die
     Zahlen breiter als ihr Stück und lagen aufeinander. Überlappen zwei Nachbarzahlen, rückt jede zweite Zahl eine Zeile
     weiter nach außen; die Linien bleiben, wo sie sind. Rückgabe: Versatz je Stück (0 oder eine Zeile). */
  function staffelWaagerecht(stuecke, schrift) {
    var luft = schrift * 0.35, eng = false, i;
    for (i = 1; i < stuecke.length; i++) {
      var a = stuecke[i - 1], b = stuecke[i],
          abstand = Math.abs((b[0] + b[1]) / 2 - (a[0] + a[1]) / 2),
          noetig = (textLaenge(a[2], schrift) + textLaenge(b[2], schrift)) / 2 + luft;
      if (abstand < noetig) eng = true;
    }
    return stuecke.map(function (st, j) { return eng && j % 2 === 1 ? schrift * 1.15 : 0; });
  }
  function massWaagerecht(x1, x2, y, text, schrift, dicke, seite, ausweich, textVersatz) {
    if (ohneMasse) return '';
    dicke = dicke * LINIE_MASS / 0.62 * linienFaktor;   // linienFaktor: nur Maßlinien (darstellung)
    var t = schrift * 0.34, s = seite || -1, len = textLaenge(text, schrift),
        mx = (x1 + x2) / 2,
        /* Kurzes Maß: Die Zahl ist breiter als die Strecke und würde die Endstriche berühren.
           Sie bleibt mittig, rückt aber über die Endstriche hinaus nach außen. (Bis 17.09.2026
           rückte sie entlang der Linie — zwei kurze Maße in derselben Ecke trafen sich dann,
           gesehen an der Verbreiterung rundum.) */
        kurz = Math.abs(x2 - x1) < len + schrift * 0.6,
        luft = schrift * MASS_LUFT + (kurz ? t : 0);
    // Grundlinie: oben liegt sie über der Linie um den Abstand, unten um Abstand + Ziffernhöhe
    var ty = (s < 0 ? y - luft : y + luft + schrift * ZIFFER_H) + s * (textVersatz || 0), anker = 'middle';
    /* `ausweich` (30.09.2026, Wächter „Zahlen frei“): nur gesetzt, wenn die Reihe zu eng ist (Aufrufer prüft). Die kurze
       Zahl steht dann NEBEN dem Kettenende auf Höhe der Linie (−1 links davor, +1 rechts dahinter) statt mittig darüber,
       wo sie in die Nachbarzahl lief (60 | 600 | 30 bei schmalen Fenstern). */
    if (kurz && ausweich) {
      mx = ausweich < 0 ? x1 - schrift * 0.35 : x2 + schrift * 0.35;
      ty = y + schrift * ZIFFER_H / 2;
      anker = ausweich < 0 ? 'end' : 'start';
    }
    return '<g>' +
      linie(x1, y, x2, y, FARBE.massLinie, dicke) +
      linie(x1, y - t, x1, y + t, FARBE.massLinie, dicke) +
      linie(x2, y - t, x2, y + t, FARBE.massLinie, dicke) +
      '<text x="' + z(mx) + '" y="' + z(ty) +
        '" text-anchor="' + anker + '" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
        z(schrift) + '" fill="' + FARBE.massText + '">' + text + '</text>' +
      '</g>';
  }

  /* `textMitte` (optional): Lage der Zahl entlang der Linie, wenn sie dem Nachbarmaß ausweichen
     muss — gesetzt nur von kettenTexteEntzerren(). Ohne Wert steht die Zahl mittig. */
  function massSenkrecht(y1, y2, x, text, schrift, dicke, seite, ausweich, textMitte) {
    if (ohneMasse) return '';
    dicke = dicke * LINIE_MASS / 0.62 * linienFaktor;
    var t = schrift * 0.34, s = seite || 1, len = textLaenge(text, schrift),
        my = (typeof textMitte === 'number') ? textMitte : (y1 + y2) / 2,
        kurz = Math.abs(y2 - y1) < len + schrift * 0.6,
        luft = schrift * MASS_LUFT + (kurz ? t : 0);
    // gedrehte Ziffern: Mitte um Abstand + halbe Ziffernhöhe von der Linie weg
    var tx = x + s * (luft + schrift * ZIFFER_H / 2);
    return '<g>' +
      linie(x, y1, x, y2, FARBE.massLinie, dicke) +
      linie(x - t, y1, x + t, y1, FARBE.massLinie, dicke) +
      linie(x - t, y2, x + t, y2, FARBE.massLinie, dicke) +
      '<text x="' + z(tx) + '" y="' + z(my) +
        '" text-anchor="middle" dominant-baseline="central" font-family="system-ui,Arial,sans-serif"' +
        ' font-weight="700" font-size="' + z(schrift) + '" fill="' + FARBE.massText +
        '" transform="rotate(-90 ' + z(tx) + ' ' + z(my) + ')">' + text + '</text>' +
      '</g>';
  }

  /* Senkrechte Kette in EINER Spalte (links am Fenster: Verbreiterung oben, Kasten, Oberlicht,
     Fenster, Unterlicht, Schwelle, Verbreiterung unten). Kurze Teilstücke haben Zahlen, die länger
     sind als die Strecke — zwei solche Nachbarn (Verbreiterung 120 über Kasten 175) lagen bis
     29.09.2026 übereinander (Prüffall 35 der Konfigurator-Sitzung). Hier werden die Zahlen von der
     Mitte der Kette nach außen geschoben, bis zwischen zwei Zahlen ein halber Schriftgrad Luft ist:
     oberhalb der längsten Strecke nach oben, darunter nach unten. Die Linien bleiben, wo sie sind. */
  function kettenTexteEntzerren(stuecke) {
    if (!stuecke.length) return stuecke;
    var anker = 0;
    stuecke.forEach(function (st, i) {
      st.mitte = (st.y1 + st.y2) / 2;
      // offenes Maß: dort steht das Wort („Oberlicht“), nicht die Zahl — mit seiner Länge entzerren (Wächter „Zahlen frei“)
      var anzeige = (st.art && massOffenListe.indexOf(st.art) >= 0 && OFFEN_WORT[st.art]) || st.text;
      st.halb = textLaenge(anzeige, st.schrift) / 2;
      if (Math.abs(st.y2 - st.y1) > Math.abs(stuecke[anker].y2 - stuecke[anker].y1)) anker = i;
    });
    var i, luft;
    for (i = anker - 1; i >= 0; i--) {
      luft = Math.max(stuecke[i].schrift, stuecke[i + 1].schrift) * 0.5;
      stuecke[i].mitte = Math.min(stuecke[i].mitte, stuecke[i + 1].mitte - stuecke[i + 1].halb - luft - stuecke[i].halb);
    }
    for (i = anker + 1; i < stuecke.length; i++) {
      luft = Math.max(stuecke[i].schrift, stuecke[i - 1].schrift) * 0.5;
      stuecke[i].mitte = Math.max(stuecke[i].mitte, stuecke[i - 1].mitte + stuecke[i - 1].halb + luft + stuecke[i].halb);
    }
    return stuecke;
  }

  /* ================================================================= Zeichnen */

  /* ================================================================ Haustür
   * Belege und Annahmen: ~/df-preis-analyse/skizzen-hersteller-2026-09-14/02-haustueren.md.
   * Aufbau von außen nach innen: Blendrahmen (seitlich/oben, unten Schwelle) → Flügel →
   * Füllung mit Muster. Das Muster hat eine feste Größe und wird NICHT mit der Tür skaliert.
   * Links/rechts nach DIN 107 von der Öffnungsseite (einwärts öffnend = von innen).
   * Maßgrenzen je Modell (MIN-Paneel) prüft der Katalog, nicht die Zeichnung: ein zu großes
   * Muster wird an der Füllung abgeschnitten, nie als Hinweis ausgegeben.             */

  /* 'kunststoff-tuer' (26.09.2026): profilneutrale Kunststoff-Haustür für Katalogprofile ohne eigenen
     Drutex-Türbeleg (IGLO 5 Classic, IGLO Energy Classic — im Katalog „Marktwert, vorläufig“). Die
     Frontansicht hängt bei allen Kunststofftüren nur an den gemeinsamen Zeichenannahmen
     (zeichnung.haustuer: rahmen, pfosten, kaempfer …); systemabhängig ist nur die Bautiefe, und die
     wird nicht gezeichnet. Deshalb keine Bautiefe und kein Profilname in der Zeichnung — das Profil
     steht im Schriftfeld (Zuordnung). Holz-/Alu-Türen NICHT hierher: für sie gelten die
     Kunststoff-Annahmen nicht. */
  /* Alu-Haustüren (30.09.2026, 88/7a): Drutex führt im Türkatalog D nur MB-86N SI und MB-79N SI (MB-70/70HI nicht
     als Tür). Ansichtsbreiten je System aus der bemaßten Aluprof-Türtyp-Ansicht (zeichnung.haustuer-<system>),
     Bautiefe D S. 56. Außen mit Alu-Motivfüllung: flügelüberdeckend (D S. 4/11, alle Katalogfotos) — der Flügel
     liegt hinter der Füllung, sichtbar bleibt nur der Blendrahmen. Glastüren und Einlassfüllung zeigen ihn. */
  var TUER_ALU = { 'mb-86n-si-tuer': 'haustuer-mb-86n-si', 'mb-79n-si-tuer': 'haustuer-mb-79n-si',
    /* MB-70/70HI: nicht im Türkatalog D, Angebot nach Betriebsentscheidung (88, 30.09.2026); Ansicht = MB-79N. */
    'mb-70-tuer': 'haustuer-mb-70', 'mb-70hi-tuer': 'haustuer-mb-70hi',
    /* Holz Softline 68/78/88 (1d, 30.09.2026): Flügelbreite 110/140 mm aus D S. 73 („Flügelstärke“), Rahmen/Schwelle
       wie die Drutex-Haustür-Annahme. Nicht flügelüberdeckend (Holz: Einlass). */
    'softline-68-tuer': 'haustuer-softline', 'softline-78-tuer': 'haustuer-softline', 'softline-88-tuer': 'haustuer-softline' };
  var TUER_HOLZ = { 'softline-68-tuer': 1, 'softline-78-tuer': 1, 'softline-88-tuer': 1 };
  var TUER_SYSTEME = { 'iglo-5-tuer': 1, 'iglo-energy-tuer': 1, 'iglo-edge-tuer': 1, 'kunststoff-tuer': 1,
    'mb-86n-si-tuer': 1, 'mb-79n-si-tuer': 1, 'mb-70-tuer': 1, 'mb-70hi-tuer': 1,
    'softline-68-tuer': 1, 'softline-78-tuer': 1, 'softline-88-tuer': 1 };
  var TUER_OHNE_BAUTIEFE = { 'kunststoff-tuer': 1 };

  /* Querschnittsform nach Katalogfoto D S. 72/73 (eckiges Rechteckrohr / Rundrohr). */
  var STOSS_FORM = { 'Q45RX': 'eckig', 'QA45RX-40x20': 'eckig', 'QA45RX-40x40': 'eckig', 'Z1L': 'rund', 'P45': 'rund', 'P45L': 'rund',
    /* 30.09.2026 (1d): D24 S. 72 — Q10/QA10 flache Rechteckstange, P10D rund (Edelstahl + Golden Oak), KA1 flaches Leuchtband. */
    'Q10': 'eckig', 'QA10': 'eckig', 'P10D': 'rund', 'KA1': 'band' };
  /* Ausführung laut D24 S. 72/73: lackiert = RAL 9005 (QA45RX, QA10), Holz = P10D, Licht = KA1 (LED weiß oder RGB).
     Nur diese Paarungen sind belegt — alles andere bricht ab, statt eine nicht lieferbare Kombination zu zeichnen. */
  var STOSS_AUSFUEHRUNG = { edelstahl: ['Q45RX', 'Z1L', 'P45', 'P45L', 'Q10'], lackiert: ['QA45RX-40x20', 'QA45RX-40x40', 'QA10'],
    holz: ['P10D'], licht: ['KA1'] };

  /* Auf dunklen Rahmenfarben verschwinden schwarze Linien — dort hell zeichnen (Design-Prüfung 14.09.).
     Kein fester Schwellwert mehr (Design-Prüfung 16.09.): bei „Luminanz < 110“ lag Golden Oak
     #9a6a37 mit 112,5 keine drei Punkte neben der Kippkante — ein minimal dunkleres Holzdekor
     hätte die helle Kontur bekommen und das Fenster dann gar keinen Umriss mehr gegen die weiße
     Seite gehabt. Jetzt wird für beide Kandidaten der Kontrast nach WCAG gerechnet und der
     stärkere genommen; eine Kippkante gibt es damit nicht mehr. */
  function relLeuchte(farbe) {
    var m = /^#([0-9a-f]{6})$/i.exec(farbe || '');
    if (!m) return null;
    var n = parseInt(m[1], 16), k = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  }
  function kontrast(a, b) {
    var h = Math.max(a, b), t = Math.min(a, b);
    return (h + 0.05) / (t + 0.05);
  }
  function istDunkel(farbe) {
    var L = relLeuchte(farbe);
    if (L === null) return false;
    return kontrast(L, relLeuchte(HELLE_LINIE)) > kontrast(L, relLeuchte(FARBE.strich));
  }
  var HELLE_LINIE = '#8f989f';

  /* Rollladenpanzer mit Einzellamellen, EINE Lamelle je echtem Katalogmaß (37/42/55 mm,
     `bezugMm` skaliert nur die Zeichnung, nicht die Anzahl). Design-Prüfung 22.09.2026 an einem
     echten Rollladenfoto: eine Zebra-Musterung (vorher 14 %/-7 % je zweite Lamelle) sah nach
     Jalousie statt Rollladen aus. Jetzt wie ein echter Panzer — fast einfarbig, nur eine sehr
     leise Wechselschattierung (±3–5 %, deckt sich mit Leitregeln.md Regel 4 „flach“) PLUS je Lamelle
     eine dünne helle Kante oben (Lichtkante der leicht gewölbten Profilkante) und eine dünne
     dunkle Fuge unten (Falz zur nächsten Lamelle) — das trägt den Kontrast, nicht die Fläche, und
     bleibt darum auch bei dunklen Farben (Anthrazit, RAL 9005) lesbar. */
  function rollPanzer(x, y, b, h, lamelle, farbeHex, strichHex, dickeFein, bezugMm) {
    if (!(b > 0 && h > 0)) return '';
    var dunkel = istDunkel(farbeHex),
        hell = rollMischen(farbeHex, dunkel ? 0.05 : -0.03), dkl = rollMischen(farbeHex, dunkel ? -0.03 : 0.05),
        skala = h / Math.max(1, bezugMm || h), lh = Math.max((lamelle || 40) * skala, 2.5),
        n = Math.max(2, Math.round(h / lh));
    if ((h / n) < 2) n = Math.max(2, Math.round(n / 4)); // sehr klein: vereinfachter Satz, sonst nur Strichbrei
    lh = h / n;
    var lichtKante = rollMischen(farbeHex, 0.22), fugenSchatten = rollMischen(farbeHex, -0.28);
    var g = '<g data-teil="panzer">';
    for (var i = 0, ly = y; i < n; i++, ly += lh) {
      var fuellI = (i % 2) ? dkl : hell, bot = ly + lh;
      g += rechteck(x, ly, b, lh, fuellI, 'none', 0);
      g += linie(x, ly, x + b, ly, lichtKante, dickeFein * 0.5, ' opacity="0.65"');
      g += linie(x, bot, x + b, bot, fugenSchatten, dickeFein * 0.4, ' opacity="0.55"');
    }
    g += rechteck(x, y, b, h, 'none', strichHex, dickeFein * 0.7) + '</g>';
    return g;
  }

  /* Die Anschlagseite steht so in der Bestellung — sie darf nicht still auf „links“ fallen.
     Der Konfigurator kann sie als `din` liefern oder, wie beim Fenster, als Öffnungsrichtung des
     Flügels (`fluegel[0].oeffnung` endet auf -l oder -r). Bis 16.09.2026 las die Tür nur `din`:
     eine als `dreh-r` bestellte Tür wurde als DIN links gezeichnet UND als DIN links beschriftet.
     Jetzt zählen beide Wege; widersprechen sie sich, wird nicht geraten, sondern abgebrochen. */
  /* Der Pflichthinweis „Schematische Darstellung, nicht maßstäblich“ steht mittig unter der
     Skizze. Bei schmalen, hohen Elementen (500 mm breit, 2200 hoch) ist die Schrift breiter als
     das Element und wurde beidseitig aus dem Bild geschnitten — ausgerechnet der Satz, der aus
     rechtlichen Gründen dort steht (Design-Prüfung 16.09.2026). Deshalb wachsen die seitlichen
     Ränder notfalls mit der Textbreite. 0,52 · Schriftgröße je Zeichen ist der übliche
     Mittelwert für die verwendete Systemschrift. */
  /* Eigener weißer Grund in jeder Skizze. Ohne ihn übernimmt die Skizze den Hintergrund des
     Einbettenden — im Dunkelmodus eines Mailprogramms wären Maßzahlen und dunkle Türen dann
     schwarz auf schwarz (Kontrast rund 1,1 : 1, Design-Prüfung 16.09.2026). */
  function grund(x, y, b, h) {
    /* Doppelt so groß wie der Ausschnitt in jede Richtung: Beim Einpassen in ein anderes
       Seitenverhältnis (Mail 528 × 640) entstehen Randstreifen außerhalb des Ausschnitts, die
       das SVG trotzdem zeichnet — ohne Übergröße blieben sie durchsichtig (Gegenprobe
       16.09.2026: 8,5 % der Mail-Pixel). */
    return '<rect data-teil="grund" x="' + z(x - b) + '" y="' + z(y - h) + '" width="' + z(b * 3) + '" height="' + z(h * 3) + '" fill="#ffffff"/>';
  }

  /* Strichart des Öffnungssymbols (Norm-Recherche 02 vom 16.09.2026): GESTRICHELT heißt
     „der Flügel öffnet vom Betrachter weg“, durchgezogen „öffnet zum Betrachter hin“. Belegt
     über Normbilder der DIN EN 12519 (Anhang A), Schüco-Prospekt P 4356 („von innen“) und
     Schücos Planungssoftware („Außen DIN EN 12519“ mit gestricheltem Dreh-Kipp-Fenster).
     Folge: ein normales Fenster ist innen durchgezogen und AUSSEN gestrichelt, IGLO EXT genau
     umgekehrt. Bis 16.09. hing die Strichart am Produkt — jede Außenansicht eines normalen
     Fensters behauptete damit „öffnet nach außen“. Der Normtext von DIN EN ISO 7519:2025 ist
     noch nicht eingesehen (kostenpflichtig) — offener Punkt vor dem Verkauf als Produkt. */
  function gestrichelt(inhalt, d) {
    return '<g data-teil="strichelung" stroke-dasharray="' + z(d * 5) + ' ' + z(d * 3.5) + '">' + inhalt + '</g>';
  }
  var LEGENDE_STRICH = 'Gestrichelt: Flügel öffnet vom Betrachter weg';

  /* Linienstärken im Verhältnis nach ISO 128-23 (Tabelle 1/2, Leseprobe): Kontur : Symbol :
     Maßlinie ≈ 2 : 1,4 : 1. Vorher war das Öffnungssymbol die dickste Linie der Zeichnung,
     dicker als der Blendrahmen (Design-Prüfung 16.09.2026, M1). */
  var LINIE_SYMBOL = 0.7, LINIE_MASS = 0.5;

  /* Schrifthierarchie (Design-Prüfung 16.09.2026, M3/M4): Die Überschrift „Ansicht von …“ war
     mit 95 % der Maßzahl kaum größer als die Zahlen; der Pflichthinweis war am Handy nur
     7,6–8,2 px groß. Jetzt: Titel 1,1 · Hauptmaß 1,0 · Teilmaß 0,82 · Hinweis 0,72 der
     Grundschrift. Die Grundschrift selbst bleibt an die Elementgröße gebunden — dadurch ist sie
     nach dem Einpassen in den Anzeigekasten gleich groß, egal wie groß das Fenster ist (so
     machen es alle Referenzen mit Maßen, Marktvergleich 16.09.). */
  var TITEL = 1.1, HINWEIS_G = 0.72;
  /* Unterer Rand der kompakten Bühne: die Zeile „Ansicht von innen“ steht bei 2,4 × Schrift, ihre
     Unterlänge reicht bis ≈ 2,6. Bis 29.09.2026 war der Rand 1,8 — die Zeile lag unter dem Ausschnitt
     und war nur zu sehen, solange die Anzeigefläche seitlich Luft hatte (fiel mit größerer Maßschrift
     am Handy auf: abgeschnitten bzw. ganz weg). */
  var KOMPAKT_UNTEN = 2.7;

  /* „Maße in mm“ davor: In keiner Skizze stand bisher eine Einheit (Design-Prüfung 16.09.). */
  var HINWEIS = 'Maße in mm · Schematische Darstellung, nicht maßstäblich';

  /* Positionsnummer im Bild (Spitzenklasse-Bericht 05, Muss 4): In der Mail stehen die Details als
     Text unter dem Bild; im Bild selbst bleiben nur Maße, Ansicht, „Maße in mm“ und die Position —
     sonst weiß niemand, welches Bild zu welcher Zeile gehört. */
  function titelMitPos(k, text) {
    var p = k && k.position;
    return (p !== undefined && p !== null && p !== '') ? 'Pos. ' + esc(p) + ' · ' + text : text;
  }

  /* ---------------------------------------------------- Schriftfeld-Schalter (Konfigurator-Bühne)
   * Sitzt der Konfigurator die Skizze selbst in ein Kästchen mit eigener Beschriftung, braucht das
   * SVG keinen zweiten Titel, keinen „Maße in mm …“-Hinweis und keine Schriftfeldliste — nur
   * Element, Maßketten und höchstens eine kurze „Ansicht von innen/außen“-Zeile, damit klar bleibt,
   * welche Seite gezeigt wird. k.schriftfeld === false ODER k.ohneSchriftfeld === true schalten das
   * um; ohne einen der beiden Werte bleibt alles wie zuvor (auch k.schriftfeld undefined/true). */
  function kompaktSchriftfeld(k) {
    return !!k && (k.schriftfeld === false || k.ohneSchriftfeld === true);
  }
  /* Die eine erlaubte Kurzzeile im Kompakt-Modus — dieselbe Schriftgröße wie der Pflichthinweis
     (HINWEIS_G), damit sie nicht wie ein Titel wirkt. */
  function ansichtsZeileKompakt(text, mitteX, y, schrift) {
    /* In einer Warenkorbkachel (96 px) ist diese Zeile nicht mehr lesbar und wirkt wie ein Fleck.
       `ohneMasse` heißt: die Zeichnung steht als Bild in einer Liste, wo Maß UND Ansichtsseite
       daneben als Text stehen — dann entfällt sie hier. Steht die Skizze allein (Konfigurator,
       Mail, Angebot), bleibt sie: der Kunde muss sehen, von welcher Seite er das Element sieht
       (Betrieb 25.09.2026: „der Kunde darf nicht missverstehen, was er bekommt"). Wer sie hier
       abschaltet, MUSS die Ansichtsseite daneben schreiben. */
    if (ohneMasse || ohneBeschriftung) return '';
    return '<text x="' + z(mitteX) + '" y="' + z(y) +
      '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
      z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + text + '</text>';
  }
  /* Bühne — der Ausschnitt, auf den gezeichnet wird. Ohne k.bezugsmass ist die Bühne das Element
     selbst; dann zeichnet das Modul exakt wie vorher und eine einzeln gezeigte Position füllt
     ihren Rahmen. Mit Bezugsmaß teilen sich alle Positionen einer Anfrage EINEN Maßstab: das
     kleine Fenster wird dann sichtbar kleiner als die große Schiebetür gezeichnet. Weil Schrift
     und Strichstärken aus bue.bezug kommen, sind sie über alle Positionen gleich groß — vorher
     hingen sie am Elementmaß, und derselbe Text war bei einer schmalen Tür doppelt so grob wie
     bei einem breiten Fenster. */
  function buehne(k, B, H) {
    var bm = k && k.bezugsmass;
    var bb = bm ? Math.max(+bm.b || 0, B) : B,
        bh = bm ? Math.max(+bm.h || 0, H) : H;
    return { eigen: !bm, b: bb, h: bh, bezug: Math.max(bb, bh) };
  }

  /* Spannt den eng um das Element gelegten Ausschnitt auf die Bühne auf. Waagerecht wird
     zentriert, senkrecht wächst er nach oben — so stehen alle Positionen einer Anfrage auf
     einer gemeinsamen Standlinie statt in der Mitte zu schweben. Math.max ist die Sicherung:
     eine Position, die größer ist als das gemeldete Bezugsmaß, wird nie abgeschnitten, sie
     verliert dann nur den exakten Maßstab. */
  function buehnenAusschnitt(bue, vbX, vbY, vbB, vbH, randL, randR, randO, randU) {
    if (bue.eigen) return { box: [vbX, vbY, vbB, vbH], dx: 0, dy: 0 };
    /* Der Ausschnitt wird allein aus der Bühne gebildet, nicht aus dem Element — nur dann ist er
       für alle Positionen wirklich identisch. Das Element wandert stattdessen IN die Bühne:
       waagerecht zentriert, unten bündig, damit alle auf einer Standlinie stehen. */
    var zB = Math.max(bue.b + randL + randR, vbB),
        zH = Math.max(bue.h + randO + randU, vbH),
        box = [-randL, -randO, zB, zH];
    return { box: box, dx: (box[0] + (zB - vbB) / 2) - vbX, dy: (box[1] + (zH - vbH)) - vbY };
  }
  /* Ohne Bühne bleibt der Inhalt unangetastet — sonst stünde in jeder bisherigen Zeichnung eine
     zusätzliche Gruppe und die Ausgabe wäre nicht mehr zeichengleich. */
  function versetzt(vb, inhalt) {
    if (!vb.dx && !vb.dy) return inhalt;
    return '<g transform="translate(' + z(vb.dx) + ' ' + z(vb.dy) + ')">' + inhalt + '</g>';
  }

  function randFuerHinweis(rand, B, schrift) {
    var breite = HINWEIS.length * schrift * HINWEIS_G * 0.52;   // an die Hinweisschrift gebunden, nicht fest
    return Math.max(rand, (breite - B) / 2 + schrift * 0.4);
  }

  /* Balkontürschwelle. Belegt im Drutex-Katalog Kunststofffenster S. 68/69: 20-mm-Aluminium-
     schwelle für IGLO 5, IGLO 5 CLASSIC, IGLO LIGHT und IGLO EXT; für IGLO ENERGY und
     IGLO ENERGY CLASSIC gibt es dort stattdessen COMBI 20 MM und COMBI PLAN 0,0 MM; IGLO EDGE
     steht auf der Seite überhaupt nicht. Wird eine Schwelle für ein System bestellt, für das
     der Katalog sie nicht führt, wird nicht einfach etwas gezeichnet — dann bricht die Zeichnung
     ab und der Widerspruch fällt auf, statt in eine Bestellung zu wandern. */
  function balkonSchwelle(daten, systemId, art) {
    if (!art || art === 'ohne') return null;
    var sorte = { alu: ['alu20Systeme', 'alu20Hoehe'], holz: ['holzSysteme', 'alu20Hoehe'],
                  combi20: ['combiSysteme', 'combi20Hoehe'], combiPlan: ['combiSysteme', 'combiPlanHoehe'] }[art];
    if (!sorte) throw new Error('Unbekannte Balkontürschwelle: ' + art);
    var systeme = fakt(daten, 'balkonschwelle', sorte[0]);
    if (systeme.indexOf(systemId) < 0) {
      throw new Error('Schwelle „' + art + '“ ist für ' + systemId + ' nicht belegt (K S. 68/69)');
    }
    return fakt(daten, 'balkonschwelle', sorte[1]);
  }

  /* ---------------------------------------------------------------- Schriftfeld
   * Marktvergleich 16.09.2026: Keine Referenz zeigt farbechte Ansicht UND vollständige Angaben
   * in derselben Zeichnung, und keine schreibt dazu, welches Maß gemeint ist. In der Mail muss
   * das im Bild selbst stehen — dort gibt es kein HTML daneben. Deshalb ein optionales
   * Schriftfeld (`k.schriftfeld`), im Konfigurator abschaltbar, wenn die Seite es als HTML zeigt.
   * Die Öffnungsart wird aus denselben Codes abgeleitet, aus denen gezeichnet wird — Bild und
   * Text können dadurch nicht auseinanderlaufen. Die Namen folgen dem Bestellweg (ANSCHLAG in
   * deinefenster.de/js/konfigurator.js). */
  var OEFF_NAME = { 'dk-l': 'Dreh-Kipp links', 'dk-r': 'Dreh-Kipp rechts', 'dreh-l': 'Dreh links',
                    'dreh-r': 'Dreh rechts', 'kipp': 'Kipp', 'fest': 'Fest' };
  function oeffnungText(fluegel) {
    if (fluegel.length === 1) {
      var o = fluegel[0].oeffnung || 'dk-r';
      return o === 'fest' ? 'Festverglasung' : (OEFF_NAME[o] || esc(o));
    }
    var mitStulp = false, t = '';
    fluegel.forEach(function (f, i) {
      if (i > 0) t += ' · ';
      if (f.stulp) mitStulp = true;
      t += OEFF_NAME[f.oeffnung || 'dk-r'] || esc(f.oeffnung);
    });
    // Seit 30.09.2026 zeichnet die Skizze Pfosten und Stulp gleich (Flügel aneinander) — die Bauart steht deshalb hier.
    return t + (mitStulp ? ' · ohne Mittelsteg (Stulp)' : ' · mit Mittelsteg (Pfosten)');
  }
  var LICHT_NAME = { fest: 'fest verglast', kipp: 'Kipp', 'dk-l': 'Dreh-Kipp links', 'dk-r': 'Dreh-Kipp rechts' };

  /* Türmodellname wie im Bestellweg (Drutex-Türprogramm): aus der Musterkennung gebildet, damit
     Zeichnung und Text nicht auseinanderlaufen. `glas` und `kaempfer-1` heißen dort Vollglas und
     Halbglas. */
  /* Kundennamen der Füllungen wie im Katalog (1d, 30.09.2026) — vorher „Fraesung D“, „Glas Halb“ aus der Kennung.
     Vorrang hat schriftfeld.modell aus der Zuordnung (Katalogname); diese Tabelle ist nur der Rückfall. */
  var TUER_MODELL_NAME = { 'fraesung-v': 'Fräsung senkrecht', 'fraesung-h': 'Fräsung waagerecht', 'fraesung-d': 'Fräsung diagonal',
    'glas-halb': 'Glas über die halbe Höhe', 'glas-drittel': 'Glas über ein Drittel', 'glas-zweidrittel': 'Glas über zwei Drittel',
    einlass: 'Geschlossen, ohne Glas' };
  function tuerModellName(m) {
    if (m === 'glas') return 'Vollglas';
    if (m === 'kaempfer-1') return 'Halbglas';
    if (TUER_MODELL_NAME[m]) return TUER_MODELL_NAME[m];
    m = String(m).replace(/^alu-/, '');
    return String(m).replace(/[^a-z0-9-]/gi, '').split('-').map(function (t) {
      return t.charAt(0).toUpperCase() + t.slice(1);
    }).join(' ');
  }

  function schriftfeldZeilen(k, B, gesamtHoehe, daten) {
    var sf = (k.schriftfeld && typeof k.schriftfeld === 'object') ? k.schriftfeld : {},
        z = [];
    var produkt = k.produkt || 'fenster';
    if (sf.titel) z.push({ t: esc(sf.titel), fett: true });
    /* Maßbezug laienverständlich (Betrieb 17.09.: keine Baubegriffe; 30.09.2026: kein Fugenabzug, der Kunde gibt das
       Fenstermaß ein = Gesamtmaß): Fenster „Fenstermaß“, Balkon-/Schiebe-/Haustür „Türmaß“, Rollladen „Breite und Höhe des fertigen
       Rollladens — Kasten eingerechnet“. Ein falscher Bezug kostet ein Fenster. */
    if (produkt !== 'kopplung') {
      z.push({ t: (produkt === 'rollladen' ? 'Rollladen fertig (Kasten eingerechnet): '
                  : (produkt === 'haustuer' || produkt === 'balkon' || produkt === 'schiebe') ? 'Türmaß: '
                  : 'Fenstermaß: ') + B + ' × ' + gesamtHoehe + ' mm' });
    }
    /* Profilname von der Zuordnung (betrieb-punkte 078b159): IGLO 5 und IGLO 5 Classic sehen gleich
       aus, nur diese Zeile sagt, welches bestellt ist. Die Haustür schreibt sie weiter unten selbst. */
    if (sf.profil && produkt !== 'haustuer') z.push({ t: esc(sf.profil) });
    if (produkt === 'kopplung') {
      /* Kopplung (eigenes Produkt seit 22.09.2026, K S. 18/19): keine Maueröffnung, nur die
         Länge des Kopplungsprofils ist eine belegte Zeichenmasse (Katalog `laenge`). Kopplungsart
         (Katalog-Commit 89b1f7f, 22.09.2026) und System stehen im Text, weil Drutex fürs Profil
         selbst keine Breite/kein Maß nennt. */
      // Katalog-Anzeigename der Kopplungsart ("Statische Kopplung" statt "statisch") — steht
      // zusätzlich zum großen Bild-Titel auch hier im Schriftfeld (Regel 6).
      if (sf.kopplungsart) z.push({ t: sf.kopplungsart, fett: true });
      // Anzeigename aus dem Katalog (sf.system, z. B. "IGLO 5 Classic") statt der internen
      // Katalog-ID (k.system, z. B. "classic") — Koordinator-Fund 22.09.2026.
      if (sf.system) z.push({ t: 'Profil: ' + esc(sf.system) });
      else if (k.system) z.push({ t: 'Profil: ' + esc(k.system) });
      z.push({ t: 'Länge: ' + (+k.laenge) + ' mm' });
    } else if (produkt === 'haustuer') {
      z.push({ t: 'Anschlag: DIN ' + (tuerDin(k) === 'links' ? 'links' : 'rechts') + ', von innen gesehen' });
      /* Das neutrale Zeichensystem 'kunststoff-tuer' gilt für mehrere Profile — welches bestellt
         ist, sagt nur diese Zeile (Zuordnung schriftfeld.profil, betrieb-punkte 64ef2a3). */
      if (sf.profil) z.push({ t: esc(sf.profil) });
      if (sf.modell || k.modell) z.push({ t: 'Türmodell: ' + (sf.modell ? esc(sf.modell) : tuerModellName(k.modell)) });
      /* Wortlaut wie im Bestellweg: „Stoßgriff · Höhe 1200 mm außen · Drückergarnitur innen“ */
      var gaS = k.griffAussen || { art: 'druecker' },
          gaN = { stoss: 'Stoßgriff', knauf: 'Knauf', druecker: 'Drückergarnitur' }[gaS.art] || esc(gaS.art),
          diN = k.drueckerInnen === 'edelstahl' ? 'Edelstahldrücker' : 'Drückergarnitur';
      z.push({ t: 'Griff: ' + gaN + (gaS.art === 'stoss' && gaS.laenge ? ' · Höhe ' + (+gaS.laenge) + ' mm' : '') +
                  ' außen · ' + diN + ' innen' });
      // Seitenteil/Oberlicht (Bauform) und Kämpfer stehen zusätzlich im Text — beide verändern
      // die Zeichnung, aber ihr Name (Bauform Nr./Mustername) steht nirgends sonst.
      var bfSf = k.seitenteil && BAUFORM_SEITENTEIL[k.seitenteil.bauform];
      if (bfSf) z.push({ t: bfSf.name });
      var kfSf = kaempferName(k.kaempfer);
      if (kfSf) z.push({ t: 'Kämpfer: ' + kfSf });
      if (k.zweifluegelig) z.push({ t: 'Zweiflügelig (Gehflügel ' + (k.din === 'rechts' ? 'rechts' : 'links') + ') · Teilung im Angebot' });
    } else if (produkt === 'schiebe') {
      /* Eine Schiebetür dreht nicht — die Öffnungsnamen des Fensters passen hier nicht.
         Wortlaut wie im Bestellweg: Parallel-Schiebe-Kipp bzw. Hebe-Schiebe, dazu die Seite,
         auf der der Schiebeflügel läuft (Schritt „Laufseite“). */
      z.push({ t: 'Öffnung: ' + (/hs/.test(k.system || '') ? 'Hebe-Schiebe' : 'Parallel-Schiebe-Kipp') +
                  ' · Schiebeflügel ' + (k.schiebefluegelSeite === 'links' ? 'links' : 'rechts') });
    } else if (produkt !== 'rollladen') {
      z.push({ t: oeffnungsZeile(k, daten) });
    } else {
      /* Der Vorsatzrollladen wird nur von außen gezeichnet — Kastenform, Lamelle und Antrieb
         sieht man dort nicht oder nicht vollständig. Kastennamen wie im Drutex-Datenblatt. */
      var kk = k.kasten || {};
      if (kk.groesse) {
        z.push({ t: 'Kasten: ' + (kk.form === 'rund' ? 'RA OW oval ' : kk.form === 'eckig90' ? 'RA 90°P Unterputz ' : 'RA 45° eckig ') + (+kk.groesse) + ' mm' });
      }
      if (k.lamelle) z.push({ t: 'Lamelle: ' + (+k.lamelle) + ' mm' });
      if (k.panzerFarbeName) z.push({ t: 'Panzer: ' + esc(k.panzerFarbeName) });
      if (k.bedienung) {
        z.push({ t: 'Antrieb: ' + ANTRIEB_NAME[antriebAus({ bedienung: k.bedienung })] +
                    ' · Bedienung ' + (k.seite === 'links' ? 'links' : 'rechts') });
      }
    }
    lichtZeilen(k).forEach(function (t) { z.push({ t: t }); });
    /* Verglasung, Schallschutz und Beschlag sind in der Ansicht nicht zu sehen — eine zweite
       Scheibe zeichnet man von vorn nicht. Verschwiegen werden dürfen sie trotzdem nicht: der
       Kunde hat sie gewählt und bezahlt sie (Betrieb 17.09.2026: „jede Eigenschaft, die möglich
       ist, zählt“). Wortlaut wie im Bestellweg („3-fach Wärmeschutz“, „Schallschutzglas“,
       „Sicherheitsbeschlag“). Ohne Uw- oder Ug-Wert — das wäre eine Herstellerangabe. */
    var glasZusatz = (k.schallschutz ? ' · Schallschutzglas' : '') +
      (k.sicherheitsglas ? ' · Verbundsicherheitsglas' : '') + (k.randverbund ? ' · warme Kante' : '');
    if (k.verglasung === '2' || k.verglasung === '3' || k.verglasung === '4' ||
        k.verglasung === 2 || k.verglasung === 3 || k.verglasung === 4) {
      z.push({ t: 'Verglasung: ' + k.verglasung + '-fach Wärmeschutz' + glasZusatz });
    } else if (glasZusatz) {
      z.push({ t: 'Verglasung: ' + glasZusatz.replace(/^ · /, '') });
    }
    if (k.glasMotiv && GLAS_MOTIV[k.glasMotiv]) {
      z.push({ t: 'Glas: ' + GLAS_MOTIV[k.glasMotiv].name });
    }
    if (k.sprossen && k.sprossen.typ && k.sprossen.typ !== 'keine') {
      var r = k.sprossen.raster === 'gitter'
        ? { name: 'eigene Teilung: ' + (+k.sprossen.senkrecht || 0) + ' senkrecht, ' + (+k.sprossen.waagerecht || 0) + ' waagerecht' }
        : SPROSSEN_RASTER[k.sprossen.raster || 'kreuz'];
      z.push({ t: 'Sprossen: ' + (k.sprossen.typ === 'szr' ? 'im Scheibenzwischenraum'
                 : (k.sprossen.typ === 'wiener' ? 'Wiener Sprossen, außen aufgesetzt' : 'aufgesetzt')) + ' ' +
                  (k.sprossen.breiteOffen ? '' : (+k.sprossen.breite) + ' mm ') + '· ' +
                  (r ? r.name : esc(k.sprossen.raster)) });
    }
    /* Griff: gezeichnet ist die Form, aber nicht das Modell — QUADRAT und HOPPE TOULON haben
       dieselbe eckige Form. Der Name muss deshalb dastehen, sonst ist die Wahl unsichtbar.
       Geschrieben wird die Katalogschreibweise (griffkatalog.<modell>.name). */
    if (k.griffModell) {
      var gmSchluessel = (k.griffModell === 'g1033') ? '1033' : k.griffModell;
      var gm = daten && daten.griffkatalog && daten.griffkatalog[gmSchluessel];
      var gz = 'Griff: ' + (gm && gm.name ? esc(gm.name) : esc(k.griffModell));
      if (k.griffArt === 'abschliessbar' || k.abschliessbar) gz += ' · abschließbar';
      else if (k.griffArt === 'knopf') gz += ' · mit Druckknopf';
      if (k.griffAusfuehrung && gm && gm.ausfuehrungen && gm.ausfuehrungen[k.griffAusfuehrung] &&
          gm.ausfuehrungen[k.griffAusfuehrung].name) {
        gz += ' · ' + esc(gm.ausfuehrungen[k.griffAusfuehrung].name);
      }
      z.push({ t: gz });
    } else if (k.griffArt === 'abschliessbar' || k.abschliessbar) {
      z.push({ t: 'Griff: abschließbar' });
    }
    if (k.sicherheitsbeschlag) z.push({ t: 'Beschlag: Sicherheitsbeschlag' });
    /* Schwelle, Rollladen und Insektenschutz sind gezeichnet; die Zeile nennt zusätzlich die
       Ausführung, die man der Ansicht nicht ansehen kann (welche Schwelle, welcher Antrieb). */
    if (k.schwelle && k.schwelle !== 'ohne') {
      var schwN = { alu: '20 mm Aluminiumschwelle', holz: 'Holzschwelle',
                    combi20: 'COMBI 20 mm', combiPlan: 'COMBI PLAN 0,0 mm (bodengleich)' }[k.schwelle];
      z.push({ t: 'Schwelle: ' + (schwN || esc(k.schwelle)) });
    }
    if (k.rollladen) {
      var rn = +(k.rollladen.kasten || k.rollladen.kastenHoehe || 0),
          rz = 'Rollladen: Aufsatzkasten' + (rn ? ' RN ' + rn : '') +
               ' · ' + ANTRIEB_NAME[antriebAus(k.rollladen)] +
               ' · Bedienung ' + (k.rollladen.seite === 'links' ? 'links' : 'rechts');
      if (k.rollladen.lamelle) rz += ' · Lamelle ' + (+k.rollladen.lamelle) + ' mm';
      z.push({ t: rz });
    }
    if (k.insektenschutz) z.push({ t: 'Insektenschutzrollo' });
    var vb = k.verbreiterung || {}, teileV = [];
    [['links', 'links'], ['rechts', 'rechts'], ['oben', 'oben'], ['unten', 'unten']].forEach(function (p) {
      if (+vb[p[0]] > 0) teileV.push(p[1] + ' ' + (+vb[p[0]]) + ' mm');
    });
    if (teileV.length) {
      /* Der Bestellweg nennt das eingegebene Maß im Schritt „Maße“ Rohbaumaß, im Schritt
         „Verbreiterung“ aber Fenstermaß („die Verbreiterung kommt außen dazu“). Beides zugleich
         geht nicht: Mit Verbreiterung wäre das Element größer als die Maueröffnung. Die Skizze
         schreibt deshalb nur, was sie sicher weiß — die Summe —, bis der Betrieb es klärt. */
      z.push({ t: 'Verbreiterung außen: ' + teileV.join(' · ') });
      z.push({ t: 'Gesamt mit Verbreiterung: ' + (B + (+vb.links || 0) + (+vb.rechts || 0)) + ' × ' +
                  (gesamtHoehe + (+vb.oben || 0) + (+vb.unten || 0)) + ' mm' });
    }
    /* Kopplung ist seit Katalog-Commit 3cacd59 ein eigenes Produkt (siehe ZEICHNER.kopplung
       weiter unten) — Fenster/Balkontür/Schiebetür führen `kopplung` nicht mehr als Merkmal. */
    /* Anzahl gleicher Elemente: steht im Bestellweg als eigener Schritt. In der Mail ist die
       Skizze oft das Einzige, was man sich ansieht — ohne diese Zeile sieht der Kunde ein
       Fenster, bestellt hat er drei. */
    if (+k.anzahl > 1) z.push({ t: (+k.anzahl) + ' × dieses Element' });
    if (sf.farbe) z.push({ t: esc(sf.farbe) });
    if (sf.griff) z.push({ t: esc(sf.griff) });
    if (sf.anbau) z.push({ t: esc(sf.anbau) });
    if (sf.luefter) z.push({ t: esc(sf.luefter) });
    /* Freie Zusatzzeilen (seit 25.09.2026): jede bestellte Eigenschaft, die nicht gezeichnet wird,
       gehört trotzdem in die Skizze — sonst sieht der Kunde in Mail und Angebot ein Element ohne
       das, was er dazubestellt hat (Türschließer, Zutrittssystem, Reedkontakt, Beschlagfarbe …).
       Vorher lieferte die Zuordnung bei solchen Werten gar keine Zeichnung mehr, die Skizze
       verschwand also ganz. Der Aufrufer übergibt fertige Zeilen „Merkmal: Wert“; hier wird nur
       noch escapet und begrenzt, damit ein langer Katalogtext das Schriftfeld nicht sprengt. */
    zusatzZeilen(sf, z);
    return z;
  }

  /* Hängt schriftfeld.zusatz an eine Zeilenliste an — auch für Produkte mit eigenem Schriftfeld
     (Vorsatzrollladen), die schriftfeldZeilen() nicht benutzen. Dort fehlten die Zeilen bis
     26.09.2026: der Server lieferte „Schienenfarbe: Turner Oak“, die Skizze zeigte es nicht. */
  function zusatzZeilen(sf, z) {
    if (!sf || !Array.isArray(sf.zusatz)) return;
    /* Bis 29.09.2026 nach 14 Zeilen und 70 Zeichen still gekappt — der Kunde sah dann nicht,
       was er bestellt hat. Jetzt kommt jede Zeile; zu lange bricht schriftfeldUmbruch() um. */
    sf.zusatz.forEach(function (t) {
      var text = String(t).trim();
      if (!text) return;
      z.push({ t: esc(text) });
    });
  }

  /* Ein Schriftfeld für alle vier Produkte. Bis 17.09.2026 hatte es nur das Fenster — bei
     Haustür, Schiebetür und Rollladen stand in der Zeichnung keine einzige gewählte Eigenschaft.
     Gibt SVG, die neue Schreibhöhe und die Breite der längsten Zeile zurück (der Ausschnitt muss
     seitlich mitwachsen, sonst wird der Text abgeschnitten). */
  /* Eine Schriftfeldzeile länger als SF_ZEICHEN wird umgebrochen, bevorzugt an „ · “ (dort trennt
     sie selbst ihre Teile — so bleibt „Merkmal: Wert“ am Stück, der Abdeckungs-Wächter sucht genau
     danach), nur ohne jedes „ · “ am Leerzeichen. Folgezeilen tragen dasselbe Gewicht. Nichts wird
     abgeschnitten (Prüfbefund der Konfigurator-Sitzung 29.09.2026). */
  var SF_ZEICHEN = 80;
  function schriftfeldUmbruch(zeilen) {
    var aus = [];
    zeilen.forEach(function (zl) {
      var rest = zl.t, forts = false;
      while (rest.length > SF_ZEICHEN) {
        var fenster = rest.slice(0, SF_ZEICHEN + 1),
            p = fenster.lastIndexOf(' · '), len = 3;
        if (p <= 0) p = rest.indexOf(' · ', SF_ZEICHEN);   // Teil zu lang: am nächsten „ · “ danach
        if (p <= 0) { p = fenster.lastIndexOf(' '); len = 1; }   // gar kein „ · “: am Leerzeichen
        if (p < SF_ZEICHEN * 0.4) break;   // nie „Merkmal:“ allein in eine Zeile — dann lieber breit
        aus.push({ t: rest.slice(0, p), fett: zl.fett, forts: forts });
        rest = rest.slice(p + len);
        forts = true;
      }
      aus.push({ t: rest, fett: zl.fett, forts: forts });
    });
    return aus;
  }

  function schriftfeldBlock(k, B, gesamtHoehe, daten, zeileY, schrift, mitteX, dickeFein) {
    var sfz = schriftfeldUmbruch(schriftfeldZeilen(k, B, gesamtHoehe, daten)), sfTop = zeileY - schrift * 0.35,
        svg = '<g data-teil="schriftfeld">' + linie(B * 0.08, sfTop, B * 0.92, sfTop, FARBE.strichFein, dickeFein * 0.6);
    zeileY += schrift * 0.55;
    sfz.forEach(function (zl) {
      svg += '<text x="' + z(mitteX) + '" y="' + z(zeileY) +
        '" text-anchor="middle" font-family="system-ui,Arial,sans-serif"' + (zl.fett ? ' font-weight="700"' : '') +
        (zl.forts ? ' data-forts="1"' : '') +
        ' font-size="' + z(schrift * 0.74) + '" fill="' + FARBE.massText + '">' + zl.t + '</text>';
      zeileY += schrift * 0.98;
    });
    return {
      svg: svg + '</g>', zeileY: zeileY,
      breite: sfz.reduce(function (m, zl) { return Math.max(m, zl.t.length); }, 0) * schrift * 0.74 * 0.52
    };
  }

  /* ------------------------------------------------------------------ Sprossen
   * Belegt: Drutex-Katalog Kunststofffenster S. 66/67 — aufgesetzte „Wiener“ Sprossen 27/45/65 mm
   * in den Dekorfolienfarben; Sprossen im Scheibenzwischenraum (SZR) 8/18/26/45 mm in eigenen
   * Farben. Die Teilung ist die des eigenen Bestellwegs. Eine nicht belegte Breite wird nicht
   * gezeichnet. Aufgesetzte Sprossen sind ein Profil in Rahmenfarbe auf dem Glas; SZR-Sprossen
   * liegen HINTER der Scheibe und werden deshalb heller und mit Glaskante gezeichnet. */
  var SPROSSE_ZEICHEN_ZUSCHLAG = 14;
  var GRIFF_GROESSE_FENSTER = 0.7;   // Betrieb 01.10.2026: Vergrößerung großer Fenster ×0,7; Griff wieder mittig
  var SPROSSEN_RASTER = {
    senk2: { v: 1, h: 0, name: 'senkrecht' }, waag2: { v: 0, h: 1, name: 'waagerecht' },
    kreuz: { v: 1, h: 1, name: 'Kreuz' }, feld6: { v: 2, h: 1, name: '6 Felder' },
    feld9: { v: 2, h: 2, name: '9 Felder' },
    /* 30.09.2026 (7a/88): weitere gleichmäßige Teilungen — Sprossen gleichmäßig verteilt wie die bisherigen. */
    senk3: { v: 2, h: 0, name: '2 senkrecht (3 Felder)' }, waag3: { v: 0, h: 2, name: '2 waagerecht (3 Felder)' },
    feld8: { v: 1, h: 3, name: '8 Felder (2 × 4)' },
    /* 30.09.2026 (7a): festes Muster 2 breit × 3 hoch mit eigenem Namen (statt „eigene Teilung“ über gitter). */
    feld6h: { v: 1, h: 2, name: '6 Felder (2 × 3)' },
    /* 30.09.2026 (7a/88): „Oberlicht-Optik“ — Querteilung bei 1/3 der Höhe von oben, senkrechte Sprossen nur darüber.
       Lage 1/3 ist eine Darstellungsannahme (übliche Oberlicht-Proportion), kein Herstellermaß. */
    oben1: { v: 1, h: 1, hLagen: [1 / 3], vBis: 1 / 3, name: 'Querteilung oben, darüber 1 senkrecht' },
    oben2: { v: 2, h: 1, hLagen: [1 / 3], vBis: 1 / 3, name: 'Querteilung oben, darüber 2 senkrecht' },
    /* „Andere Aufteilung“ (Bestellweg sprossen_bild=eigene): Teilung legt der Kunde mit dem Betrieb fest —
       kein Gitter (es wäre geraten), aber Schriftfeld-Zeile, damit die Wahl in Warenkorb/Angebot steht (88, 30.09.2026). */
    eigene: { v: 0, h: 0, name: 'eigene Aufteilung (nach Absprache)' }
  };
  /* Sprossengitter in einer Glasfläche — EINE Funktion für Fenster, Balkontür und Schiebetür (30.09.2026: die
     Schiebetür übernahm k.sprossen bis dahin stillschweigend nicht, 3b/88). `o`: glasMotiv, rahmenFarbe, strich,
     dickeFein, aussen. */
  function sprossenGitter(sprossen, gx, gy, gb, gh, o) {
    /* Wiener Sprossen liegen laut Bestellweg AUSSEN auf (nur Holzfenster, nur auf Anfrage,
       KAH S. 48/49). Von innen sieht man sie nicht — dort stehen sie nur im Schriftfeld, wie die
       Führungsschienen des Rollladens. Sie zu zeichnen, wo sie nicht sind, wäre genau die
       Irreführung, die wir vermeiden (Betrieb 25.09.2026). */
    if (!sprossen || (sprossen.typ === 'wiener' && !o.aussen) || !(gb > 0 && gh > 0)) return '';
    /* Zeichenbreite (30.09.2026, Betrieb über 3b/88: „die Breite in der Skizze erkennen“): maßstäblich waren 8 und 18 mm auf
       der Bühne beide Haarstriche (1,3 / 2,8 px). Darstellungsregel 14 mm + Nennbreite: 8→22, 18→32, 26→40, 45→59,
       65→79 — Reihenfolge bleibt, schmale Sprossen werden sichtbar. Das Nennmaß steht unverändert im Schriftfeld. */
    var sb = SPROSSE_ZEICHEN_ZUSCHLAG + sprossen.breite, r = sprossen.raster, i,
        szr = sprossen.typ === 'szr',
        /* Auf Muster-/Mattglas verschwand die helle SZR-Sprosse im Ornament (Prüffall 19 der
           Konfigurator-Sitzung, 29.09.2026: Silvit). Dort bekommt sie eine kräftigere Kante;
           auf Klarglas bleibt sie wie freigegeben. */
        aufMuster = szr && GLAS_MUSTER.indexOf(o.glasMotiv) >= 0,
        farbe = sprossen.farbe || (szr ? (aufMuster ? '#ffffff' : '#f4f6f7') : o.rahmenFarbe),
        kontur = szr ? (aufMuster ? FARBE.sprosseMusterKante : FARBE.glasKante) : o.strich,
        konturDicke = o.dickeFein * (aufMuster ? 1.2 : 0.7),
        s = '<g data-teil="sprossen"' + (aufMuster ? ' data-auf-muster="1"' : '') + '>';
    // bei aufgesetzten Sprossen zuerst die waagerechten, damit die senkrechten durchlaufen
    for (i = 1; i <= r.h; i++) {
      var hy = r.hLagen ? r.hLagen[i - 1] : i / (r.h + 1);
      s += rechteck(gx, gy + gh * hy - sb / 2, gb, sb, farbe, kontur, konturDicke);
    }
    var vH = r.vBis ? gh * r.vBis : gh;   // „oben“: senkrechte nur bis zur Querteilung
    for (i = 1; i <= r.v; i++) {
      s += rechteck(gx + gb * i / (r.v + 1) - sb / 2, gy, sb, vH, farbe, kontur, konturDicke);
    }
    return s + '</g>';
  }
  function sprossenPruefen(daten, sp) {
    if (!sp || !sp.typ || sp.typ === 'keine') return null;
    var liste = sp.typ === 'aufgesetzt' ? 'aufgesetztBreiten'
              : (sp.typ === 'szr' ? 'szrBreiten'
              : (sp.typ === 'wiener' ? 'wienerBreiten' : null));
    if (!liste) throw new Error('Unbekannte Sprossenart: ' + sp.typ);
    var breite = +sp.breite;
    if (fakt(daten, 'sprossen', liste).indexOf(breite) < 0) {
      throw new Error('Sprosse ' + sp.typ + ' ' + sp.breite + ' mm ist nicht belegt (K S. 66/67, Wiener: KAH S. 48/49)');
    }
    var r = SPROSSEN_RASTER[sp.raster || 'kreuz'];
    /* „Eigene Teilung“ (7a/88, 30.09.2026): n senkrechte und m waagerechte Sprossen (je 0–4), gleichmäßig verteilt. */
    if (sp.raster === 'gitter') {
      var n = +sp.senkrecht, m = +sp.waagerecht, ganz = function (x) { return x === Math.floor(x) && x >= 0 && x <= 4; };
      if (!ganz(n) || !ganz(m) || n + m === 0) throw new Error('Sprossengitter braucht senkrecht und waagerecht als ganze Zahl 0–4 (nicht beide 0)');
      r = { v: n, h: m, name: 'eigene Teilung: ' + n + ' senkrecht, ' + m + ' waagerecht' };
    } else if (sp.senkrecht != null || sp.waagerecht != null) {
      throw new Error('senkrecht/waagerecht gibt es nur bei raster gitter');
    }
    if (!r) throw new Error('Unbekannte Sprossenteilung: ' + sp.raster);
    return { typ: sp.typ, breite: breite, raster: r, farbe: farbwert(sp.farbe, null) };
  }

  /* --------------------------------------------------------------- Glasmotive
   * Belegt im Drutex-Katalog Kunststofffenster S. 78/79 („Arten von Scheiben“): Ornament
   * Chinchilla, Ornament Master Carre, Satinmatt (dazu Delta, Silvit, Cathedral, Streifen,
   * Matte Folie u. a., die der Bestellweg heute nicht anbietet). Der Bestellweg nennt ein
   * „Satinato“ — diesen Namen führt Drutex NICHT; gezeichnet wird es als satiniertes Glas und im
   * Schriftfeld mit dem Drutex-Namen „Satinmatt“ bezeichnet (offene Frage an den Betrieb).
   * Die Muster sind Andeutungen, keine Nachbildung des Ornaments. Sie ersetzen die Glasfüllung
   * `skz-glas` — dadurch wirken sie ohne weitere Änderung bei Fenster, Tür und Schiebetür. */
  /* Katalog führt 22 Glasarten über vier Produkte (K/D S. 78/79). Drei zeichenbare Familien:
   *   - „Klar/matt“: Milchglas/Folie/sandgestrahlt — heller Punktraster statt Vollglas-Verlauf.
   *   - „Ornamentglas“: Chinchilla/Master-Carré/Delta/Cathedral/Silvit/Streifen — je Muster ein
   *     eigenes, einfaches Linien-/Punktmuster (keine Nachbildung, nur Andeutung).
   *   - „Sonnenschutz und Spiegel“ (Antisol/Reflektofloat/Mirastar/Black Line): eigene Tönung `ton`
   *     (seit 30.09.2026, vorher nur Schriftfeld — 3b/88: alle sahen aus wie Klarglas). Drutex nennt keinen
   *     Farbwert; gemessen am Musterfoto K PDF-S. 42 (Druckseite 83, „Arten von Scheiben“), 200 dpi, Glasfläche
   *     oben links (frei vom Stein), Median, Streuung < 9 außer Antisol Blau/Black Line (Verlauf im Foto).
   *     Durchlässigkeit T je Kanal = (Glas/freier Grund der Zeile) / (dasselbe bei Float im selben Foto).
   *     Farbton und Sättigung aus T (neutrale Gläser behalten einen Hauch Klarglas-Blau), Helligkeit =
   *     Klarglas × (1 − 0,6 × (1 − Lichtdurchlässigkeit)): nie heller als Klarglas (Betriebs „weißes Glas“),
   *     dezent, und das Öffnungssymbol bleibt auf Black Line/Mirastar lesbar.
   *     Grenze des Belegs: Antisol Braun und Grau sind im Foto neutral grau und fast gleich hell — ein Braunton
   *     ist nicht belegt und wird nicht erfunden; der Name steht im Schriftfeld. Prospekt B S. 9 zeigt dieselben
   *     Fotos („Die dargestellten Ansichten können von der Realität abweichen“). Rechnung: recherche/glas-toene-2026-09-30.md
   * Einige Produkte schreiben dieselbe Glasart anders (Haustür „reflekto-blau“ statt
   * „reflektofloat-blau“, „sandgestreift“ statt „sandgestrahlt“) — als alias auf denselben
   * Zeichenwert gemappt, aber mit der jeweils eigenen Katalog-Schreibweise im Schriftfeld. */
  var GLAS_MOTIV = {
    klar:            { name: 'Klarglas' },
    // 30.09.2026: Katalog (K S. 78/79) „Klarglas 6 mm“ — sieht aus wie Klarglas, Dicke nur im Schriftfeld
    float6:          { name: 'Klarglas 6 mm', alias: true },
    satinmatt:       { name: 'Satinmatt' },
    satinato:        { name: 'Satinmatt', alias: true },
    'matte-folie':   { name: 'Glas mit matter Folie' },
    sandgestrahlt:   { name: 'Gestreiftes sandgestrahltes Glas' },
    sandgestreift:   { name: 'Gestreiftes sandgestrahltes Glas', alias: true },
    chinchilla:      { name: 'Ornamentglas Chinchilla' },
    master:          { name: 'Ornamentglas Master-Carré' },
    'master-carre':  { name: 'Ornamentglas Master-Carré', alias: true },
    delta:           { name: 'Ornamentglas Delta' },
    cathedral:       { name: 'Ornamentglas Cathedral' },
    silvit:          { name: 'Ornamentglas Silvit' },
    streifen:        { name: 'Ornamentglas Streifen' },
    /* Waterfall 105: Drutex-Prospekt B S. 9 („Waterfall 105“, Musterfoto: senkrecht geriffelt,
       fließend). Der Bestellweg nennt es „Ornamentglas Waterfall 105“ (Katalog-Quelle B(9)). */
    waterfall:       { name: 'Ornamentglas Waterfall 105' },
    'antisol-blau':  { name: 'Antisol Blau', ton: '#95ccd6' },
    'antisol-braun': { name: 'Antisol Braun', ton: '#c7ced3' },
    'antisol-grau':  { name: 'Antisol Grau', ton: '#c2cacf' },
    'antisol-gruen': { name: 'Antisol Grün', ton: '#bddacf' },
    'reflektofloat-blau':  { name: 'Reflektofloat blau 6 mm', ton: '#a8b7bb' },
    'reflektofloat-braun': { name: 'Reflektofloat braun 6 mm', ton: '#bbaea1' },
    'reflekto-blau':  { name: 'Reflektofloat blau 6 mm', ton: '#a8b7bb', alias: true },
    'reflekto-braun': { name: 'Reflektofloat braun 6 mm', ton: '#bbaea1', alias: true },
    mirastar:        { name: 'Mirastar', ton: '#5b6a74' },
    'black-line':    { name: 'Black Line', ton: '#6e808c' }
  };
  // Alias → Zeichenwert (die Form, die glasDef() kennt); ohne Eintrag zeichnet glasDef mit der ID selbst.
  var GLAS_MOTIV_ZEICHNUNG = { float6: 'klar', satinato: 'satinmatt', 'master-carre': 'master',
    sandgestreift: 'sandgestrahlt', 'reflekto-blau': 'reflektofloat-blau', 'reflekto-braun': 'reflektofloat-braun' };
  // Zeichenwerte mit eigenem Muster (glasDef); alle übrigen werden als Klarglas gezeichnet.
  var GLAS_MUSTER = ['satinmatt', 'matte-folie', 'sandgestrahlt', 'chinchilla', 'master', 'delta',
                     'cathedral', 'silvit', 'streifen', 'waterfall'];
  function glasMotivAus(k) {
    var m = k.glasMotiv || 'klar';
    if (!GLAS_MOTIV[m]) throw new Error('Glasmotiv nicht belegt: ' + m);
    return GLAS_MOTIV_ZEICHNUNG[m] || m;
  }
  // Heller Punktraster, gemeinsam für die „klar/matt“-Familie (Milchglas, matte Folie,
  // sandgestrahltes Glas) — Andeutung von Mattierung, kein Verlauf, keine Fotorealistik.
  function glasMattRaster(id, zelle, c) {
    var r = zelle * 0.05;
    return '<pattern id="skz-glas" data-motiv="' + id + '" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
      '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="#eef1f3"/>' +
      '<circle cx="' + z(zelle * 0.5) + '" cy="' + z(zelle * 0.5) + '" r="' + z(r) + '" fill="#d6dce0"/></pattern>';
  }
  function glasDef(motiv, groesse) {
    var c = FARBE.glas, zelle = Math.max(groesse / 70, 12);
    if (GLAS_MOTIV[motiv] && GLAS_MOTIV[motiv].ton) {
      return '<pattern id="skz-glas" data-motiv="' + motiv + '" data-ton="' + GLAS_MOTIV[motiv].ton +
        '" patternUnits="userSpaceOnUse" width="1" height="1"><rect width="1" height="1" fill="' + GLAS_MOTIV[motiv].ton + '"/></pattern>';
    }
    if (motiv === 'satinmatt' || motiv === 'matte-folie' || motiv === 'sandgestrahlt') {
      return glasMattRaster(motiv, zelle, c);
    }
    if (motiv === 'chinchilla') {
      var r = zelle * 0.12;
      return '<pattern id="skz-glas" data-motiv="chinchilla" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<circle cx="' + z(zelle * 0.25) + '" cy="' + z(zelle * 0.3) + '" r="' + z(r) + '" fill="#b9cbd8"/>' +
        '<circle cx="' + z(zelle * 0.72) + '" cy="' + z(zelle * 0.78) + '" r="' + z(r) + '" fill="#b9cbd8"/></pattern>';
    }
    if (motiv === 'master') {
      var q = zelle * 0.34;
      return '<pattern id="skz-glas" data-motiv="master" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<rect x="' + z((zelle - q) / 2) + '" y="' + z((zelle - q) / 2) + '" width="' + z(q) + '" height="' + z(q) + '" fill="none" stroke="#b1c4d2" stroke-width="' + z(zelle * 0.05) + '"/></pattern>';
    }
    // Delta: schräge Punktreihe (angedeutete Facette, kein Verlauf)
    if (motiv === 'delta') {
      var dr = zelle * 0.09;
      return '<pattern id="skz-glas" data-motiv="delta" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '" patternTransform="rotate(30)">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<circle cx="' + z(zelle * 0.5) + '" cy="' + z(zelle * 0.18) + '" r="' + z(dr) + '" fill="#b9cbd8"/></pattern>';
    }
    // Cathedral: einfache gewölbte Linie (Andeutung der Riffelung, kein Nachbau)
    if (motiv === 'cathedral') {
      var ch = zelle * 0.6;
      return '<pattern id="skz-glas" data-motiv="cathedral" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<path d="M0 ' + z(ch) + ' Q ' + z(zelle * 0.5) + ' 0 ' + z(zelle) + ' ' + z(ch) + '" fill="none" stroke="#b1c4d2" stroke-width="' + z(zelle * 0.05) + '"/></pattern>';
    }
    // Silvit: kleine Raute (schlichtes Facettenmuster)
    if (motiv === 'silvit') {
      var sm = zelle * 0.5, sq = zelle * 0.16;
      return '<pattern id="skz-glas" data-motiv="silvit" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<path d="M ' + z(sm) + ' ' + z(sm - sq) + ' L ' + z(sm + sq) + ' ' + z(sm) + ' L ' + z(sm) + ' ' + z(sm + sq) + ' L ' + z(sm - sq) + ' ' + z(sm) + ' Z" fill="none" stroke="#b1c4d2" stroke-width="' + z(zelle * 0.05) + '"/></pattern>';
    }
    // Streifen: senkrechte Linien, wörtlich das, was der Name sagt
    if (motiv === 'streifen') {
      var sw = zelle * 0.12;
      return '<pattern id="skz-glas" data-motiv="streifen" patternUnits="userSpaceOnUse" width="' + z(zelle) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(zelle) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<rect x="0" y="0" width="' + z(sw) + '" height="' + z(zelle) + '" fill="#b9cbd8"/></pattern>';
    }
    // Waterfall 105: senkrechte, leicht gewellte Rippen — Andeutung des Musterfotos (B S. 9),
    // gewellt statt gerade, damit es sich vom Ornament „Streifen“ unterscheidet.
    if (motiv === 'waterfall') {
      var wb = zelle * 0.5, wa = zelle * 0.08;
      return '<pattern id="skz-glas" data-motiv="waterfall" patternUnits="userSpaceOnUse" width="' + z(wb) + '" height="' + z(zelle) + '">' +
        '<rect width="' + z(wb) + '" height="' + z(zelle) + '" fill="' + c + '"/>' +
        '<path d="M ' + z(wb * 0.5) + ' 0 Q ' + z(wb * 0.5 + wa) + ' ' + z(zelle * 0.25) + ' ' + z(wb * 0.5) + ' ' + z(zelle * 0.5) +
        ' T ' + z(wb * 0.5) + ' ' + z(zelle) + '" fill="none" stroke="#b1c4d2" stroke-width="' + z(zelle * 0.05) + '"/></pattern>';
    }
    // Kein Verlauf (Koordinator-Entscheidung 22.09.2026) — trotzdem als <pattern> definiert,
    // damit `url(#skz-glas)` für alle Aufrufer (Fenster, Tür, Seitenteil, Schiebetür) gleich bleibt.
    return '<pattern id="skz-glas" data-motiv="klar" patternUnits="userSpaceOnUse" width="1" height="1">' +
           '<rect width="1" height="1" fill="' + c + '"/></pattern>';
  }

  /* ------------------------------------------------------- Aufsatzrollladen
   * Belegt: Drutex-Datenblätter RN 175 / RN 215 / RN 225 (PVC-Aufsatzrollladen), je S. 1 —
   * Einbauhöhe = Kastenhöhe 175/215/225 mm, Lamellen, kompatible Systeme. Bis 17.09.2026 setzte
   * die Skizze stillschweigend 215 mm (Wert des alten Konfigurators). Jetzt:
   * - Die Kastengröße muss bestellt sein (`rollladen.kasten`), sonst Abbruch — kein Standardwert.
   * - RN 175 / RN 225: „PVC, Aluminium, Holz“ bis 164 bzw. 195 mm Rahmenbautiefe → geprüft
   *   gegen die belegte Bautiefe des Systems.
   * - RN 215: nur die wörtlich genannten Systeme (IGLO LIGHT, IGLO EDGE; die CLASSIC-Varianten
   *   nennt das Blatt nicht — offene Frage an Drutex).
   * - IGLO EXT öffnet nach außen; ein Rollladen davor blockiert den Flügel. Drutex schließt es nicht
   *   ausdrücklich aus, bestätigt es aber auch nirgends → nicht gezeichnet, Frage an Drutex.
   * - Schiebetüren (26.09.2026, Belege von der Schiebetür-Sitzung, selbst nachgeprüft): Drutex K nennt
   *   bei jedem Terrassensystem „Kann mit Rollläden, Raffstores und Insektenschutzgittern ausgestattet
   *   werden“ (z. B. IGLO 5 PSK S. 52/53, IGLO-HS S. 40/41), aber keinen Kastentyp; RN 215 nennt als
   *   kompatible Systeme nur Fensterprofile. Den Kasten legt der Betrieb fest: bei Schiebetüren nur
   *   RN 215 (Betrieb 26.09.2026, Bestellpraxis). Deshalb bei Schiebetüren NUR RN 215, Höhe aus dem
   *   RN-215-Datenblatt, keine Systemprüfung gegen die Fensterliste. Alles Weitere „auf Anfrage“. */
  function aufsatzKasten(daten, systemId, rl, schiebe) {
    var A = function (e) { return fakt(daten, 'aufsatzrollladen', e); },
        rn = +(rl.kasten || rl.kastenHoehe || 0);
    if (!rn) throw new Error('Aufsatzrollladen: Kastengröße fehlt (RN 175, RN 215 oder RN 225)');
    if ([175, 215, 225].indexOf(rn) < 0) throw new Error('Aufsatzrollladen RN ' + rn + ' ist nicht belegt');
    var id = 'rn' + rn;
    if (rl.lamelle && A(id + '.lamellen').indexOf(+rl.lamelle) < 0) {
      throw new Error('Lamelle ' + rl.lamelle + ' mm gibt es beim RN ' + rn + ' nicht');
    }
    if (schiebe) {
      if (rn !== 215) throw new Error('Aufsatzrollladen an der Schiebetür: nur RN 215 (Betrieb), nicht RN ' + rn);
      return A('rn215.einbauhoehe');
    }
    /* Nach außen öffnende Systeme (IGLO EXT, seit 29.09.2026 auch IGLO PREMIER, K S. 24): der Flügel
       schlägt in die Rollladenebene — kein Rollladendatenblatt nennt sie. */
    if (daten[systemId] && daten[systemId].oeffnungsrichtung && fakt(daten, systemId, 'oeffnungsrichtung') === 'nach außen') {
      throw new Error('Aufsatzrollladen an ' + systemId.toUpperCase().replace(/-/g, ' ') + ' (öffnet nach außen) ist nicht belegt');
    }
    if (rn === 215) {
      /* Neben den Drutex-belegten Systemen (R S. 10) die Betriebsfestlegung (Betriebs Punkt 31: über
         1750 mm Höhe RN 215, RN 225 führt der Betrieb nicht) — ohne Herstellerbeleg, deshalb als
         begründete Zeichenannahme gelesen (zeichenannahme Pflicht, steht in belege-offen.json). */
      var betrieb = daten.aufsatzrollladen && daten.aufsatzrollladen['rn215.systemeBetrieb'];
      if (betrieb && !betrieb.zeichenannahme) throw new Error('rn215.systemeBetrieb ohne Begründung');
      if (A('rn215.systeme').indexOf(systemId) < 0 && !(betrieb && betrieb.wert.indexOf(systemId) >= 0)) {
        throw new Error('RN 215 ist für ' + systemId + ' nicht belegt');
      }
    } else {
      var tiefe = fakt(daten, systemId, 'bautiefeRahmen');
      if (tiefe > A(id + '.maxRahmenbautiefe')) throw new Error('RN ' + rn + ' passt nicht auf ' + tiefe + ' mm Rahmenbautiefe');
    }
    return A(id + '.einbauhoehe');
  }

  /* ------------------------------------------------------- Seitenteil, Oberlicht, Kämpfer
   * Sieben Bauformen nach D S. 100/101 (PDF-Seite 51 von drzwi_de_2026-06.pdf, „MÖGLICHKEIT DER
   * ANWENDUNG EINES SEITENTEILS ODER OBERLICHTES"). Der Katalog bemaßt weder die Seitenteilbreite
   * noch die Oberlichthöhe noch die Kämpferlinie der 16 Alu/PVC-Muster — deshalb ausschließlich
   * über zeichenmass()/tuerZeichenmass() mit Begründung, nie als Zahl im Bestellweg.
   *
   * Die Seite/Seiten je Bauform sind KEINE Zeichenannahme — sie stehen als sieben getrennte
   * Produktfotos auf der Katalogseite fest, keine eigene Auswahl im Bestellweg (katalog/
   * haustuer.mjs `seitenteil` kennt nur `bauform-1..7`, kein Links/Rechts-Feld). Geprüft am
   * 21.09.2026 an gerenderten Ausschnitten von PDF-Seite 51 (`pdftoppm -r 60/200`), jede Bauform
   * einzeln zugeschnitten und am Türgriff (Griff sitzt immer an der Seite zum Seitenteil hin,
   * das Blendrahmenfoto zeigt keinen Anschlag) von der Seitenteilseite unterschieden:
   *   Nr. 1: Seitenteil LINKS, Tür rechts (Griff links im Türblatt, an der Fuge zum Seitenteil).
   *          Achtung: Recherche haustuer-drutex.md Abschnitt 7 nannte bisher „rechts" — das war
   *          eine Verwechslung beim Abschreiben, am Bild korrigiert (siehe dortige Korrektur).
   *   Nr. 2: Seitenteil RECHTS, Tür links (spiegelbildlich zu Nr. 1).
   *   Nr. 3: Seitenteile beidseitig, kein Oberlicht.
   *   Nr. 4: Seitenteile beidseitig UND Oberlicht — aber das Oberlicht sitzt im Katalogbild NUR
   *          über der Tür, nicht über den Seitenteilen: deren Blendrahmen läuft ohne Querriegel
   *          bis zur Rahmenoberkante durch. Kein „durchgehendes" Oberlicht über die ganze Breite.
   *   Nr. 5: kein Seitenteil, nur Oberlicht über der Tür.
   *   Nr. 6: Seitenteil LINKS, Oberlicht nur über der Tür (Seitenteil bis zur Rahmenoberkante
   *          durchgehend, wie bei Nr. 4).
   *   Nr. 7: Seitenteil RECHTS, Oberlicht nur über der Tür (spiegelbildlich zu Nr. 6).
   * In keiner der sieben Bauformen erstreckt sich das Oberlicht über ein Seitenteil — die
   * Formulierung „durchgehendes Oberlicht" in der Recherche war eine Fehllesung des Bildes und
   * ist dort korrigiert. */
  var BAUFORM_SEITENTEIL = {
    1: { links: true,  rechts: false, oberlichtTuer: false, name: 'Bauform Nr. 1 — Seitenteil links' },
    2: { links: false, rechts: true,  oberlichtTuer: false, name: 'Bauform Nr. 2 — Seitenteil rechts' },
    3: { links: true,  rechts: true,  oberlichtTuer: false, name: 'Bauform Nr. 3 — Seitenteile beidseitig' },
    4: { links: true,  rechts: true,  oberlichtTuer: true,  name: 'Bauform Nr. 4 — Seitenteile beidseitig, Oberlicht über der Tür' },
    5: { links: false, rechts: false, oberlichtTuer: true,  name: 'Bauform Nr. 5 — nur Oberlicht über der Tür' },
    6: { links: true,  rechts: false, oberlichtTuer: true,  name: 'Bauform Nr. 6 — Seitenteil links, Oberlicht über der Tür' },
    7: { links: false, rechts: true,  oberlichtTuer: true,  name: 'Bauform Nr. 7 — Seitenteil rechts, Oberlicht über der Tür' }
  };

  /* Acht Beispielmuster (D S. 104/105), Kämpferlinie im Katalog nicht bemaßt (Abschnitt 7). Ohne
     eigene Balkenform je Muster zeichnet die Skizze einen einfachen Kämpferriegel und trägt den
     Musternamen ins Schriftfeld ein (Vorgabe der Sitzung: „sonst Riegel + Name“). */
  function kaempferName(id) {
    if (id === 'eigen') return 'eigenes Muster (nach Absprache)';
    var m = /^kaempfer-([1-9]|1[0-6])$/.exec(id || ''), h = /^kaempfer-holz-([1-8])$/.exec(id || '');
    return m ? 'Kämpfermuster Nr. ' + m[1] : (h ? 'Kämpfermuster Holz Nr. ' + h[1] : null);
  }

  /* Berechnet die Aufteilung Gesamtbreite/-höhe in Seitenteil(e), Pfosten, Türflügel und
     Oberlicht. Gibt null zurück, wenn kein Seitenteil/Oberlicht bestellt ist — dann zeichnet
     zeichneHaustuer exakt wie vorher, byte-gleich. */
  function seitenteilLayout(k, daten, Bges, Hges) {
    var bf = k.seitenteil && BAUFORM_SEITENTEIL[k.seitenteil.bauform];
    if (!bf) return null;
    var bezug = k.seitenteil.massBezug;
    if (bezug === 'tuer') return seitenteilLayoutTuer(k, daten, bf, Bges, Hges);
    if (bezug !== undefined && bezug !== 'gesamt') throw new Error('Seitenteil: unbekannter massBezug „' + bezug + '“');
    var pfosten = tuerZeichenmass(daten, 'pfosten'),
        anteil = tuerZeichenmass(daten, 'seitenteilAnteil'),
        n = (bf.links ? 1 : 0) + (bf.rechts ? 1 : 0),
        bT = (Bges - n * pfosten) / (1 + n * anteil);
    if (bT < 400) throw new Error('Haustür mit Seitenteil: Gesamtbreite ' + Bges + ' mm zu klein für ' + bf.name);
    var panelB = anteil * bT,
        oberlichtAnteil = tuerZeichenmass(daten, 'oberlichtAnteil'),
        kaempferDicke = tuerZeichenmass(daten, 'kaempfer'),
        oberlichtH = bf.oberlichtTuer ? oberlichtAnteil * Hges : 0,
        xT = bf.links ? (panelB + pfosten) : 0,
        // Das Oberlicht sitzt in allen sieben Bauformen ausschließlich über der Tür (siehe
        // Kommentar an BAUFORM_SEITENTEIL) — die Seitenteile laufen immer bis zur Rahmenoberkante
        // durch, deshalb keine eigene Oberlicht-Höhe je Seitenteil.
        yT = bf.oberlichtTuer ? (oberlichtH + kaempferDicke) : 0,
        hT = Hges - yT;
    if (hT < 1200) throw new Error('Haustür mit Oberlicht: Gesamthöhe ' + Hges + ' mm zu klein für ' + bf.name);
    var links = bf.links ? { x: 0, b: panelB, h: Hges } : null,
        rechts = bf.rechts ? { x: xT + bT + pfosten, b: panelB, h: Hges } : null;
    return { bf: bf, Bges: Bges, Hges: Hges, bT: bT, hT: hT, xT: xT, yT: yT, pfosten: pfosten,
             panelB: panelB, oberlichtH: oberlichtH, kaempferDicke: kaempferDicke, links: links, rechts: rechts,
             oberlichtTuer: bf.oberlichtTuer };
  }

  /* Maße vom Türelement aus (Katalog seit 27.09.2026: breite/hoehe = NUR die Tür, dazu
     seitenteil_links/_rechts und oberlicht_hoehe). b/h bleiben so, wie der Kunde sie bestellt hat;
     die Anbauten kommen außen dazu. Ein eingegebenes Seitenteilmaß schließt den Pfosten zur Tür
     ein, ein Oberlichtmaß den Kämpfer — so zeigt die Maßkette genau die bestellten Zahlen und
     geht in der Gesamtbreite/-höhe auf. Pfosten- und Kämpferbreite sind Zeichenannahmen
     (skizze-daten.json), keine Herstellerwerte. Fehlt eine Zahl, gilt der bisherige Anteil
     (seitenteilAnteil/oberlichtAnteil) als Rückfall — ebenfalls nur Zeichenannahme. */
  function seitenteilLayoutTuer(k, daten, bf, bT, hT) {
    var st = k.seitenteil,
        pfosten = tuerZeichenmass(daten, 'pfosten'),
        anteil = tuerZeichenmass(daten, 'seitenteilAnteil'),
        oberlichtAnteil = tuerZeichenmass(daten, 'oberlichtAnteil'),
        kaempferDicke = tuerZeichenmass(daten, 'kaempfer');
    if (bT < 400) throw new Error('Haustür mit Seitenteil: Türbreite ' + bT + ' mm zu klein');
    if (hT < 1200) throw new Error('Haustür mit Oberlicht: Türhöhe ' + hT + ' mm zu klein');
    function mass(wert, rueckfall, name, minimum) {
      if (wert === undefined || wert === null || wert === '') return rueckfall;
      var v = +wert;
      if (!(v > minimum)) throw new Error('Seitenteil: ' + name + ' ' + wert + ' mm ist kein zeichenbares Maß');
      return v;
    }
    var bL = bf.links ? mass(st.links, anteil * bT + pfosten, 'links', pfosten) : 0,
        bR = bf.rechts ? mass(st.rechts, anteil * bT + pfosten, 'rechts', pfosten) : 0,
        // Rückfall wie bisher: Oberlichtglas ≈ Anteil der Gesamthöhe, hier nach hT aufgelöst
        hO = bf.oberlichtTuer ? mass(st.oberlicht, (oberlichtAnteil * (hT + kaempferDicke)) / (1 - oberlichtAnteil) + kaempferDicke, 'Oberlicht', kaempferDicke) : 0,
        Bges = bL + bT + bR, Hges = hO + hT, xT = bL;
    return { bf: bf, massBezug: 'tuer', Bges: Bges, Hges: Hges, bT: bT, hT: hT, xT: xT, yT: hO, pfosten: pfosten,
             panelB: null, oberlichtH: bf.oberlichtTuer ? hO - kaempferDicke : 0, oberlichtGes: hO,
             kaempferDicke: kaempferDicke, oberlichtTuer: bf.oberlichtTuer,
             links: bf.links ? { x: 0, b: bL - pfosten, h: Hges, mass: bL } : null,
             rechts: bf.rechts ? { x: xT + bT + pfosten, b: bR - pfosten, h: Hges, mass: bR } : null };
  }

  /* Ein Seitenteil: Rahmenprofil über die volle Gesamthöhe. Katalogbild D S. 100/101 zeigt für
     Seitenteile durchgehend Glas (kein Muster) — das ist weiterhin die Zeichenvorgabe. Füllung
     „wie-tuer" (Merkmal `anbau_fuellung`, haustuer.mjs) zeichnet stattdessen eine geschlossene
     Füllung wie am Türblatt (`w3.fuellung`) statt Glas — kein eigenes Türmuster, weil der Katalog
     für Seitenteile keine Mustergeometrie nennt, nur die Füllungsart. Nie mit eigenem Oberlicht,
     siehe oben. */
  function seitenteilTeil(x, y, b, h, farbe, strich, dickeStark, dickeFein, daten, w3, gefuellt) {
    var r = tuerZeichenmass(daten, 'rahmen'), s = '';
    s += w3.ring(x, y, b, h, farbe, strich, dickeStark, r);
    var gx = x + r, gy = y + r, gb = b - 2 * r, gh = h - 2 * r;
    if (gefuellt) {
      s += profilFlaeche(gx, gy, gb, gh, w3.fuellung(farbe, gh > gb), kanteWeich(farbe), dickeFein);
    } else {
      s += glasFlaeche(gx, gy, gb, gh, dickeFein);
      s += w3.glasReflex(gx, gy, gb, gh) + w3.randSchatten(gx, gy, gb, gh);
      s += w3.dichtung(gx, gy, gb, gh, dickeFein);
    }
    return s + festFeldKennung(gx, gy, gx + gb, gy + gh);
  }

  /* Kämpferriegel im Türflügel selbst (kein Seitenteil/Oberlicht, nur eine Kämpferlinie quer
     durchs Türblatt, D S. 104/105 Muster 1–8). Ohne Musterform: Riegel + Name im Schriftfeld. */
  /* Kämpfer im Türflügel: Drutex D S. 104–107 zeigt 16 Beispielmuster (Bilder, keine Maße). Bis 30.09.2026 zeichnete
     der Motor für jede Nummer denselben Querriegel (3b/88: „Kämpferteilung zeichnet wie Glas ganz“). Jetzt je Muster
     die abgelesenen Riegel (zeichnung.haustuer.kaempferMuster), Dicke = Kämpfer-Zeichenmaß, stumpf gestoßen wie der
     Fensterkämpfer (kein Ring, keine Gehrung), auf das Füllungsfeld beschnitten. Nr. 1/2: unten geschlossen.
     „eigen“: Teilung nach Absprache — kein geratenes Muster, nur Schriftfeld. */
  function tuerKaempferRiegel(fx, fy, fb, fh, kaempferId, farbe, strich, dickeFein, daten, w3, spiegeln) {
    if (!kaempferId || kaempferId === 'ohne' || kaempferId === 'eigen') return '';
    var alle = tuerZeichenmass(daten, 'kaempferMuster'), m = alle[kaempferId];
    if (!m) throw new Error('Kämpfermuster nicht belegt: ' + kaempferId);
    var kd = tuerZeichenmass(daten, 'kaempfer'), fuell = w3.fuellung(farbe, false),
        s = '<g data-teil="kaempfer" data-muster="' + kaempferId + '" clip-path="url(#skz-fuell)">';
    if (m.paneelAb) s += rechteck(fx, fy + fh * m.paneelAb, fb, fh * (1 - m.paneelAb), fuell, strich, dickeFein);
    /* Holztüren (D S. 108/109): geschlossene Holzfüllung mit Glasfeldern statt Riegeln über Glas. */
    if (m.glas) {
      var Xg = function (u) { return fx + fb * (spiegeln ? 1 - u : u); };
      s += rechteck(fx, fy, fb, fh, fuell, strich, dickeFein);
      m.glas.forEach(function (poly) {
        s += polygon(poly.map(function (q) { return [Xg(q[0]), fy + fh * q[1]]; }), 'url(#skz-glas)', FARBE.glasKante, dickeFein);
      });
    }
    (m.riegel || []).forEach(function (r) {
      // Katalogbild = Außenansicht; von innen seitenverkehrt (wie die Motive, tuerMusterZeichnen)
      var X = function (u) { return fx + fb * (spiegeln ? 1 - u : u); },
          x1 = X(r[0]), y1 = fy + fh * r[1], x2 = X(r[2]), y2 = fy + fh * r[3],
          l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), ux = (x2 - x1) / l, uy = (y2 - y1) / l,
          nx = -uy * kd / 2, ny = ux * kd / 2, ex = ux * kd / 2, ey = uy * kd / 2;
      // an beiden Enden um die halbe Dicke verlängert: Stöße und Anschlüsse an den Rand bleiben geschlossen
      s += polygon([[x1 - ex + nx, y1 - ey + ny], [x2 + ex + nx, y2 + ey + ny], [x2 + ex - nx, y2 + ey - ny], [x1 - ex - nx, y1 - ey - ny]],
        fuell, strich, dickeFein);
    });
    return s + '</g>';
  }

  function tuerDin(k) {
    var f = k.fluegel && k.fluegel[0], ausFluegel = null,
        ausDin = (k.din === 'rechts') ? 'rechts' : (k.din === 'links' ? 'links' : null);
    if (f && f.oeffnung) {
      if (/-r$/.test(f.oeffnung)) ausFluegel = 'rechts';
      else if (/-l$/.test(f.oeffnung)) ausFluegel = 'links';
    }
    if (ausDin && ausFluegel && ausDin !== ausFluegel) {
      throw new Error('Haustür: Anschlag widersprüchlich — din=' + ausDin + ', Flügel=' + f.oeffnung);
    }
    return ausDin || ausFluegel || 'links';
  }

  /* Aktives Alu-Türsystem (TUER_ALU) — gesetzt von zeichneHaustuer, zurückgesetzt bei jedem Zeichenaufruf. Seine
     eigenen Ansichtsbreiten gehen vor; was es nicht hat (Pfosten, Kämpfer, Beschlag), bleibt die gemeinsame Annahme. */
  var tuerAlu = null, tuerFluegelBreit = false;
  function tuerZeichenmass(daten, eigenschaft) {
    var z = tuerAlu && daten.zeichnung && daten.zeichnung[tuerAlu];
    // Holz mit Flügelstärke 140 mm: eigene Werte für das Flügelholz
    if (tuerFluegelBreit && z && z[eigenschaft + 'Breit']) eigenschaft += 'Breit';
    return zeichenmass(daten, z && z[eigenschaft] ? tuerAlu : 'haustuer', eigenschaft);
  }

  function tuerMuster(daten, modell) {
    var m = daten.zeichnung && daten.zeichnung.tuermuster && daten.zeichnung.tuermuster[modell];
    if (!m) throw new Error('Unbekanntes Türmodell: ' + modell);
    if (m.quelle || !m.zeichenannahme) throw new Error('Mustergeometrie ohne Begründung: zeichnung.tuermuster.' + modell);
    return m;
  }

  function stossAusfuehrungPruefen(g) {
    // ohne Angabe: die Ausführung, in der es das Modell gibt (QA45RX/QA10 nur lackiert, P10D nur Holz …)
    var a = g.ausfuehrung || Object.keys(STOSS_AUSFUEHRUNG).filter(function (x) { return STOSS_AUSFUEHRUNG[x].indexOf(g.modell) >= 0; })[0] || 'edelstahl',
        erlaubt = STOSS_AUSFUEHRUNG[a];
    if (!erlaubt) throw new Error('Stoßgriff-Ausführung unbekannt: ' + a);
    if (erlaubt.indexOf(g.modell) < 0) throw new Error('Stoßgriff ' + g.modell + ' gibt es nicht in Ausführung ' + a + ' (D24 S. 72/73)');
    return a;
  }
  function stossLaengePruefen(daten, modell, laenge) {
    var g = daten['haustuer-stossgriff'] && daten['haustuer-stossgriff'][modell];
    if (!g) throw new Error('Stoßgriff-Modell nicht belegt: ' + modell);
    if (g.laengen) {
      var liste = fakt(daten['haustuer-stossgriff'], modell, 'laengen');
      if (liste.indexOf(+laenge) < 0) throw new Error('Stoßgriff-Länge nicht belegt: ' + modell + ' ' + laenge + ' mm');
    } else {
      var bereich = fakt(daten['haustuer-stossgriff'], modell, 'laengenBereich');
      if (!(+laenge >= bereich[0] && +laenge <= bereich[1])) throw new Error('Stoßgriff-Länge nicht belegt: ' + modell + ' ' + laenge + ' mm');
    }
    return +laenge;
  }

  function polygon(punkte, fuell, kontur, dicke) {
    return '<polygon points="' + punkte.map(function (p) { return z(p[0]) + ',' + z(p[1]); }).join(' ') +
      '" fill="' + fuell + '" stroke="' + (kontur || 'none') + '" stroke-width="' + z(dicke || 0) + '" stroke-linejoin="round"/>';
  }

  /* Waagerechter Türdrücker bzw. Knauf auf Langschild mit Profilzylinder darunter. */
  function tuerBeschlag(x, achseY, richtung, art, stilName, dicke, daten, f) {
    f = f || 1;
    var st = GRIFF_STIL[stilName] || GRIFF_STIL.weiss,
        lb = tuerZeichenmass(daten, 'langschildB') * f, lh = tuerZeichenmass(daten, 'langschildH') * f,
        pz = tuerZeichenmass(daten, 'zylinderAbstand') * f,
        oben = achseY + pz / 2 - lh / 2, s = '<g stroke-linejoin="round" data-teil="' + art + '">',
        v = Math.max(dicke * 1.4, 3), schatten = 'rgba(20,28,36,.16)';
    s += rechteck(x - lb / 2 + v, oben + v * 1.2, lb, lh, schatten, 'none', 0, ' rx="' + z(lb / 2) + '" ry="' + z(lb / 2) + '"');
    s += rechteck(x - lb / 2, oben, lb, lh, st.rosette, st.kontur, dicke, ' rx="' + z(lb / 2) + '" ry="' + z(lb / 2) + '"');
    // Profilzylinder
    s += '<circle cx="' + z(x) + '" cy="' + z(achseY + pz) + '" r="' + z(lb * 0.28) + '" fill="#aeb5bb" stroke="' + st.kontur + '" stroke-width="' + z(dicke * 0.8) + '"/>' +
         rechteck(x - lb * 0.1, achseY + pz, lb * 0.2, lb * 0.5, '#aeb5bb', st.kontur, dicke * 0.8);
    if (art === 'knauf') {
      // runder Knaufkörper am Ende der Reichweite, kurzer Hals zur Achse
      var kr = tuerZeichenmass(daten, 'knaufReichweite') * f, kd = lb * 1.9, kx = x + richtung * (kr - kd / 2);
      s += rechteck(Math.min(x, kx), achseY - lb * 0.3, Math.abs(kx - x), lb * 0.6, st.flaeche, st.kontur, dicke);
      s += '<circle cx="' + z(kx + v) + '" cy="' + z(achseY + v * 1.2) + '" r="' + z(kd / 2) + '" fill="' + schatten + '"/>' +
           '<circle cx="' + z(kx) + '" cy="' + z(achseY) + '" r="' + z(kd / 2) + '" fill="' + st.flaeche + '" stroke="' + st.kontur + '" stroke-width="' + z(dicke) + '"/>';
      if (st.licht) s += '<path d="M' + z(kx - kd * 0.3) + ' ' + z(achseY - kd * 0.12) + ' A' + z(kd * 0.32) + ' ' + z(kd * 0.32) + ' 0 0 1 ' + z(kx + kd * 0.12) + ' ' + z(achseY - kd * 0.3) +
           '" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="' + z(dicke) + '" stroke-linecap="round"/>';
    } else {
      // Gerader Hebelbalken mit runder Rose am Drehpunkt — Form/Proportion aus dem alten
      // Live-Motor (df-2026, Branch skizzen-herstellerneutral, Commit b472ffded, haustuerStageSVG,
      // 11.09.2026, vom Eigentümer als Vorbild bestätigt 22.09.2026): schlichter, gerader Stab mit
      // runden Enden, keine geschwungene Klinge/Klinge-Spitze wie zuvor. Der Achsenpunkt bleibt
      // eine flache runde Rose statt der vorherigen dickeren Kreisscheibe.
      var dl = tuerZeichenmass(daten, 'druecker') * f, db = lb * 0.5, ende = x + richtung * dl;
      s += rechteck(Math.min(x, ende) + v, achseY - db / 2 + v * 1.2, dl, db, schatten, 'none', 0, ' rx="' + z(db / 2) + '"');
      s += rechteck(Math.min(x, ende), achseY - db / 2, dl, db, st.flaeche, st.kontur, dicke, ' rx="' + z(db / 2) + '"');
      // Rose am Drehpunkt voll ausgefüllt (Betrieb 22.09.2026: „dieser Kreis muss fertig ausgefüllt sein“).
      s += '<circle cx="' + z(x) + '" cy="' + z(achseY) + '" r="' + z(lb * 0.36) + '" fill="' + st.kontur + '" stroke="' + st.kontur + '" stroke-width="' + z(dicke) + '"/>';
    }
    return s + '</g>';
  }

  /* KA1: Stangengriff mit LED-Streifen, weiß oder RGB (D24 S. 72/73; Foto: flacher, in die Füllung eingelassener
     Streifen). Gezeichnet als helles Band ohne Stützen — die Lichtfarbe steht im Schriftfeld, gezeichnet neutral. */
  function leuchtband(xStange, mitteY, laenge, dicke, daten) {
    var sb = tuerZeichenmass(daten, 'stossBreite'), oben = mitteY - laenge / 2;
    return '<g data-teil="stossgriff" data-ausfuehrung="licht">' +
      rechteck(xStange - sb * 0.4, oben, sb * 0.8, laenge, '#5a636b', '#2a3036', dicke, ' rx="' + z(sb * 0.1) + '"') +
      rechteck(xStange - sb * 0.22, oben + sb * 0.3, sb * 0.44, laenge - sb * 0.6, '#f4f8fb', 'none', 0, ' rx="' + z(sb * 0.08) + '"') + '</g>';
  }
  function stossgriff(xStange, xProfil, mitteY, laenge, stilName, dicke, daten, form, ausfuehrung, holzFuell) {
    if (ausfuehrung === 'licht' || form === 'band') return leuchtband(xStange, mitteY, laenge, dicke, daten);
    if (ausfuehrung === 'lackiert') stilName = 'schwarz';
    var st = GRIFF_STIL[stilName] || GRIFF_STIL.silber,
        sb = tuerZeichenmass(daten, 'stossBreite'), rand = tuerZeichenmass(daten, 'stossStuetzenRand'),
        oben = mitteY - laenge / 2, s = '<g stroke-linejoin="round" data-teil="stossgriff">',
        kontur = '#4d565e', v = Math.max(dicke * 1.8, 4), rund = form === 'rund' ? sb / 2 : sb * 0.14;
    s += rechteck(xStange - sb / 2 + v, oben + v * 1.3, sb, laenge, 'rgba(10,16,22,.28)', 'none', 0, ' rx="' + z(rund) + '"');
    [oben + rand, oben + laenge - rand].forEach(function (y) {
      var x1 = Math.min(xStange, xProfil), x2 = Math.max(xStange, xProfil);
      s += rechteck(x1, y - sb * 0.38, x2 - x1, sb * 0.76, 'url(#skz-alu-ros)', kontur, dicke, ' rx="' + z(sb * 0.2) + '"');
    });
    s += rechteck(xStange - sb / 2, oben, sb, laenge, st.flaeche, kontur, dicke, ' rx="' + z(rund) + '" ry="' + z(rund) + '"');
    /* P10D: Handlauf Eichenholz Golden Oak zwischen Edelstahl-Enden (D24 S. 72, Foto). Länge der Enden nicht
       veröffentlicht — Zeichenannahme 2 × Stangenbreite, am Foto grob stimmig. */
    if (ausfuehrung === 'holz') {
      var kap = sb * 2;
      s += rechteck(xStange - sb / 2, oben + kap, sb, laenge - 2 * kap, holzFuell || '#9a6a37', kontur, dicke, ' data-teil="stossgriff-holz"');
    }
    if (st.licht) s += linie(xStange - sb * 0.18, oben + sb, xStange - sb * 0.18, oben + laenge - sb, 'rgba(255,255,255,.9)', dicke * 0.9, ' stroke-linecap="round"');
    var zb = tuerZeichenmass(daten, 'zylinderRosetteB'), zh = tuerZeichenmass(daten, 'zylinderRosetteH');
    s += rechteck(xProfil - zb / 2, mitteY + zh * 0.6, zb, zh, st.rosette, st.kontur, dicke, ' rx="' + z(zb / 2) + '" ry="' + z(zb / 2) + '"') +
         '<circle cx="' + z(xProfil) + '" cy="' + z(mitteY + zh * 1.1) + '" r="' + z(zb * 0.28) + '" fill="#aeb5bb" stroke="' + st.kontur + '" stroke-width="' + z(dicke * 0.8) + '"/>';
    return s + '</g>';
  }

  /* Muster in die Füllung setzen. spiegeln = Innenansicht (Lage und Form seitenverkehrt). */
  function tuerMusterZeichnen(m, lage, fx, fy, fb, fh, spiegeln, mitInox, farbe, dicke, daten, w3) {
    var teile = [], rand = tuerZeichenmass(daten, 'musterRand'),
        teil0 = m.teile[0] && m.teile[0].typ;
    // INOX-Applikation als gebürstetes Metall statt der vorherigen flachen Ein-Farb-Fläche
    // (Stufe 3, 22.09.2026) — Verlauf kommt aus w3.inox().
    var INOX = w3.inox(), INOX_K = '#8b949c';
    function glas(x, y, b, h, d) {   // Türglas: Spiegelung wie beim Fenster, kräftigere Glasleiste
      return glasFlaeche(x, y, b, h, d) + rechteck(x, y, b, h, 'none', '#6f8396', d * 1.4) +
        w3.glasReflex(x, y, b, h) + w3.randSchatten(x, y, b, h) + w3.dichtung(x, y, b, h, d);
    }
    if (teil0 === 'vollglas') return glas(fx, fy, fb, fh, dicke);
    // Geschlossenes Türblatt ohne Glas und ohne Muster (Füllung „einlass“, 26.09.2026)
    if (teil0 === 'geschlossen') return '';
    if (teil0 === 'kaempfer') {
      /* Glasanteil je Muster als Bruch [Zähler, Nenner] (Füllungen glas-halb/-drittel/-zweidrittel,
         26.09.2026): belegt ist nur der Kämpfer als Trennung (D S. 104), der Anteil ist Marktwert
         und vorläufig — deshalb Bruch statt Millimeter. Ohne Angabe gilt kaempferLage (Muster Nr. 1). */
      var ga = m.teile[0].glasAnteil,
          kb = tuerZeichenmass(daten, 'kaempfer'),
          yk = fy + fh * (ga ? ga[0] / ga[1] : tuerZeichenmass(daten, 'kaempferLage'));
      return glas(fx, fy, fb, yk - fy, dicke) + rechteck(fx, yk, fb, kb, farbe, kanteWeich(farbe), dicke);
    }
    var formSpiegel = (m.lagen === 'LR_SPIEGEL' && lage === 'R');
    if (spiegeln) formSpiegel = !formSpiegel;
    var versatz = 0;
    if ((m.lagen === 'LR' || m.lagen === 'LRC') && (lage === 'L' || lage === 'R')) {
      versatz = Math.min(m.versatz, Math.max(0, (fb - m.b) / 2 - rand)) * (lage === 'L' ? -1 : 1);
    }
    if (spiegeln) versatz = -versatz;
    var hx = fx + (fb - m.b) / 2 + versatz, hy = fy + (fh - m.h) / 2;
    function X(x) { return formSpiegel ? hx + m.b - x : hx + x; }
    function rx(x, b) { return formSpiegel ? hx + m.b - x - b : hx + x; }
    function Yv(v) { return v === 'oben' ? fy : v === 'unten' ? fy + fh : hy + v; }
    m.teile.forEach(function (tl) {
      if (tl.typ === 'inox' && !mitInox) return;
      if (tl.typ === 'inox' || tl.typ === 'glas') {
        var y1 = tl.von !== undefined ? Yv(tl.von) : hy + tl.y, y2 = tl.bis !== undefined ? Yv(tl.bis) : hy + tl.y + tl.h;
        teile.push(tl.typ === 'glas' ? glas(rx(tl.x, tl.b), y1, tl.b, y2 - y1, dicke)
                                     : rechteck(rx(tl.x, tl.b), y1, tl.b, y2 - y1, INOX, INOX_K, dicke));
      } else if (tl.typ === 'poly') {
        if (tl.fuellung === 'inox' && !mitInox) return;
        var pts = tl.punkte.map(function (p) { return [X(p[0]), hy + p[1]]; });
        teile.push(polygon(pts, tl.fuellung === 'glas' ? 'url(#skz-glas)' : INOX, tl.fuellung === 'glas' ? FARBE.glasKante : INOX_K, dicke));
      } else if (tl.typ === 'welle') {
        // geschlossene Leiter: zwei gebogene Holme auf einer S-Kurve, fünf Felder, begleitende Bänder
        // (nach Paneelblatt P frei nachempfunden, nicht abgepaust)
        var mitte = function (y) { return m.b / 2 + 50 * Math.sin(2 * Math.PI * y / m.h); };
        var kurve = function (dx, y1, y2) { var pts = []; for (var y = y1; y <= y2 + 0.1; y += 25) pts.push([X(mitte(y) + dx), hy + y]); return pts; };
        if (mitInox) {
          teile.push(polygon(kurve(-160, 0, m.h).concat(kurve(160, 0, m.h).reverse()), INOX, INOX_K, dicke));
          [-1, 1].forEach(function (sg) { teile.push(polygon(kurve(sg * 205, 0, m.h).concat(kurve(sg * 185, 0, m.h).reverse()), INOX, INOX_K, dicke)); });
        }
        for (var n = 0; n < 5; n++) {
          var ya = 38 + n * 272.8, yb = ya + 235;
          teile.push(polygon(kurve(-118, ya, yb).concat(kurve(118, ya, yb).reverse()), 'url(#skz-glas)', '#6f8396', dicke * 1.4));
        }
      } else if (tl.typ === 'bogen') {
        // Außenkante rechts: quadratische Kurve (525,0)–(335,775)–(525,1550); y ist linear im Parameter
        var P = function (x, y) { return z(X(x)) + ' ' + z(hy + y); };
        var kante = function (y) { var u = y / 1550; return 525 * (1 - u) * (1 - u) + 670 * (1 - u) * u + 525 * u * u; };
        if (mitInox) teile.push('<path d="M' + P(0, 115) + ' L' + P(190, 115) + ' L' + P(190, 0) + ' L' + P(525, 0) + ' Q' + P(335, 775) + ' ' + P(525, 1550) +
          ' L' + P(190, 1550) + ' L' + P(190, 1435) + ' L' + P(0, 1435) + ' Z" fill="' + INOX + '" stroke="' + INOX_K + '" stroke-width="' + z(dicke) + '"/>');
        teile.push('<path d="M' + P(40, 175) + ' L' + P(330, 175) + ' Q' + P(150, 775) + ' ' + P(330, 1375) + ' L' + P(40, 1375) +
          ' Z" fill="url(#skz-glas)" stroke="#6f8396" stroke-width="' + z(dicke * 1.4) + '"/>');
        [[45, 110, 880], [95, 670, 1440]].forEach(function (sl) {
          var pts = [];
          for (var y = sl[1]; y <= sl[2]; y += 30) pts.push(P(kante(y) - sl[0], y));
          var d = 'M' + pts.join(' L');
          teile.push('<path d="' + d + '" fill="none" stroke="#6f8396" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>' +
                     '<path d="' + d + '" fill="none" stroke="#e3eef7" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>');
        });
      } else if (tl.typ === 'kreis') {
        // Rundes Bullauge (new-jersey, new-york-1, alu-new-jersey-1): cx/cy/r als Bruchteil der
        // Füllungsbreite fb (nicht der Musterbox m.b×m.h wie bei rechteckigen Teilen) — ein rundes
        // Fenster sitzt lageunabhängig von der Musterbreite. r bezieht sich bewusst nur auf fb
        // (nicht auf fh), damit der Kreis bei fb≠fh ein Kreis bleibt und keine Ellipse wird.
        if (tl.art === 'inox' && !mitInox) return;
        var kcx = fx + fb * (formSpiegel ? 1 - tl.cx : tl.cx), kcy = fy + fh * tl.cy, kr = fb * tl.r,
            kFuell = tl.art === 'glas' ? 'url(#skz-glas)' : INOX, kKontur = tl.art === 'glas' ? FARBE.glasKante : INOX_K;
        if (tl.ring) {
          var ringBreite = fb * (tl.ring.breite != null ? tl.ring.breite : 0.05);
          teile.push('<circle cx="' + z(kcx) + '" cy="' + z(kcy) + '" r="' + z(kr) + '" fill="' + INOX + '" stroke="' + INOX_K + '" stroke-width="' + z(dicke) + '"/>');
          teile.push('<circle cx="' + z(kcx) + '" cy="' + z(kcy) + '" r="' + z(Math.max(0, kr - ringBreite)) + '" fill="' + kFuell + '" stroke="' + kKontur + '" stroke-width="' + z(dicke) + '"/>');
        } else {
          teile.push('<circle cx="' + z(kcx) + '" cy="' + z(kcy) + '" r="' + z(kr) + '" fill="' + kFuell + '" stroke="' + kKontur + '" stroke-width="' + z(dicke) + '"/>');
        }
      } else if (tl.typ === 'pfad') {
        // Freiform (alu-pennsylvania-4/5/6, organische Kiesel-/Halbrund-/Puzzleform, per
        // werkzeug-tuerkontur.py aus dem Katalogfoto nachgezeichnet): d ist ein SVG-Pfad in einer
        // normierten 0..1×0..1-Box, die per <g transform> 1:1 auf die Füllung (fx/fy/fb/fh)
        // abgebildet wird — kein Nachrechnen der Pfadkoordinaten nötig. vector-effect sorgt dafür,
        // dass die Konturlinien trotz der (meist ungleichmäßigen) Skalierung gleichmäßig dick
        // bleiben. Kantenbehandlung wie bei den rechteckigen Glasscheiben (glas()/randSchatten,
        // Design-Review 22.09.2026): EIN feiner, dunkler Kontur-Strich (≈0.5 px auf Mailgröße)
        // plus EIN breiterer, blasser Schatten-Strich darunter statt eines einzelnen dicken
        // Strichs — sonst wirken die Rundungen/Ecken der getracten Kontur wie ein Comic-Rand.
        // Kein Blur-Filter (siehe Kopf der Datei) — die „Weichheit" kommt allein aus der
        // niedrigen Deckkraft des breiteren Schatten-Strichs, genau wie randSchatten() es für
        // rechteckige Scheiben schon per Verlauf macht.
        if (tl.art === 'inox' && !mitInox) return;
        var pFuell = tl.art === 'glas' ? 'url(#skz-glas)' : INOX, pKontur = tl.art === 'glas' ? FARBE.glasKante : INOX_K,
            pSchattenF = tl.art === 'glas' ? '#3a4a58' : '#202427',
            // vector-effect="non-scaling-stroke" rechnet stroke-width in Bildschirm-Pixeln, nicht in
            // mm — dicke (mm) hier einzusetzen ergab ~10 px breite Comic-Ränder (22.09.2026).
            pKernBreite = 0.8, pSchattenBreite = 2.4,
            pTransform = formSpiegel ? 'translate(' + z(fx + fb) + ' ' + z(fy) + ') scale(' + z(-fb) + ' ' + z(fh) + ')'
                                      : 'translate(' + z(fx) + ' ' + z(fy) + ') scale(' + z(fb) + ' ' + z(fh) + ')';
        teile.push('<g transform="' + pTransform + '">' +
          '<path d="' + esc(tl.d) + '" fill="' + pFuell + '" stroke="none"/>' +
          '<path d="' + esc(tl.d) + '" fill="none" stroke="' + pSchattenF + '" stroke-opacity="0.22" stroke-width="' +
            z(pSchattenBreite) + '" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
          '<path d="' + esc(tl.d) + '" fill="none" stroke="' + pKontur + '" stroke-width="' + z(pKernBreite) +
            '" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></g>');
      } else if (tl.typ === 'fraesung') {
        // Gefräste Rillen im Holzblatt (fraesung-v/h/d): anzahl gleich verteilte Rillen, abstand/
        // breite als Bruchteil von fb — dieselbe zweifache Kontur-Technik wie bei den Bogen-Sprossen
        // oben (dunkle breitere Linie, darüber eine hellere schmalere Linie auf derselben Achse
        // ergibt eine sichtbare Kante statt einer flachen Linie), Farbe aus der Blattfarbe gemischt,
        // damit die Rillen auf jeder Blattfarbe (auch Holzdekor) sichtbar bleiben.
        var fDunkel = stufe3MischenTuer(farbe, 'dunkel', 0.4), fHell = stufe3MischenTuer(farbe, 'hell', 0.55),
            fBreite = fb * (tl.breite || 0.01), fAbstand = fb * (tl.abstand || 0.05), fAnzahl = tl.anzahl || 1,
            fSegmente = [];
        function fLinie(x1, y1, x2, y2) {
          teile.push('<line x1="' + z(x1) + '" y1="' + z(y1) + '" x2="' + z(x2) + '" y2="' + z(y2) +
            '" stroke="' + fDunkel + '" stroke-width="' + z(fBreite) + '" stroke-linecap="round"/>' +
            '<line x1="' + z(x1) + '" y1="' + z(y1) + '" x2="' + z(x2) + '" y2="' + z(y2) +
            '" stroke="' + fHell + '" stroke-width="' + z(fBreite * 0.55) + '" stroke-linecap="round"/>');
        }
        for (var fi = 0; fi < fAnzahl; fi++) {
          var fVersatz = (fi - (fAnzahl - 1) / 2) * fAbstand;
          if (tl.richtung === 'v') {
            var fx1 = fx + fb / 2 + fVersatz; fLinie(fx1, fy, fx1, fy + fh);
          } else if (tl.richtung === 'h') {
            var fy1 = fy + fh / 2 + fVersatz; fLinie(fx, fy1, fx + fb, fy1);
          } else if (tl.richtung === 'd') {
            // 45°: Mittelpunkt der Füllung, senkrecht zur Rillenrichtung versetzt, über die volle
            // Bilddiagonale gezogen — der umgebende <g clip-path="url(#skz-fuell)"> (Aufrufer,
            // zeichneHaustuer) schneidet den Überstand außerhalb der Füllung sauber ab.
            var diag = Math.sqrt(fb * fb + fh * fh), mx = fx + fb / 2 + fVersatz * Math.SQRT1_2, my = fy + fh / 2 - fVersatz * Math.SQRT1_2;
            fLinie(mx - diag * Math.SQRT1_2, my - diag * Math.SQRT1_2, mx + diag * Math.SQRT1_2, my + diag * Math.SQRT1_2);
          } else {
            throw new Error('Unbekannte Fräsungsrichtung: ' + tl.richtung);
          }
        }
      } else {
        throw new Error('Unbekannter Musterteil-Typ: ' + tl.typ);
      }
    });
    function teiles(pts) { teile.push(polygon(pts, INOX, INOX_K, dicke)); }
    return teile.join('');
  }

  /* Stufe-3-Werkzeuge für die Haustür (Freigabe 21./22.09.2026, siehe Leitregeln.md Punkt 4) — eigene
     Kopie der Fenster-Helfer aus zeichne() (Rahmenring aus vier Gehrungs-Trapezen, Glas-Spiegel-
     streifen, Falzschatten, Dichtungslinie, Holzdekor). Eine gemeinsame Quer-Refaktorierung mit
     zeichneFenster hätte den dort laufenden Fenster-Code angefasst; stattdessen dieselbe Formel
     hier separat, damit Haustür und Fenster unabhängig bleiben. */
  /* Verbreiterung deutlich vom Blendrahmen abgesetzt (30.09.2026, Betrieb: gewählte Seiten „als deutlicher
     Streifen“): gleiche Farbfamilie, aber hell 9 % dunkler bzw. dunkel 14 % heller, dazu eine kräftige Stoßfuge.
     Vorher exakt Rahmenfarbe — bei Anthrazit rundum praktisch unsichtbar. */
  function verbreiterungTon(hex) {
    // 30.09.2026 (4e: bei realen Maßen kaum zu sehen): Abstand zum Rahmen erhöht, hell 16 % dunkler / dunkel 22 % heller
    return istDunkel(hex) ? stufe3MischenTuer(hex, 'hell', 0.22) : stufe3MischenTuer(hex, 'dunkel', 0.16);
  }
  /* hervorheben 'verbreiterung' (Verbreiterungs-Schritt): Streifen hell im Akzent mit Akzentrand, damit auch
     15–35 mm (2–5 px auf der Bühne) sofort auffallen — ohne die Geometrie zu verfälschen. */
  var AKZENT_HELL = '#cfe0f5';
  function verbreiterungStil(hex, holzFuellung) {
    if (hervorheben === 'verbreiterung') return { fill: AKZENT_HELL, stroke: AKZENT };
    return { fill: holzFuellung || verbreiterungTon(hex), stroke: FARBE.strich };
  }
  function stufe3MischenTuer(hex, richtung, anteil) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16),
        z2 = richtung === 'hell' ? 255 : 0;
    r = Math.round(r + (z2 - r) * anteil); g = Math.round(g + (z2 - g) * anteil); b = Math.round(b + (z2 - b) * anteil);
    function hh(v) { return ('0' + v.toString(16)).slice(-2); }
    return '#' + hh(r) + hh(g) + hh(b);
  }
  function stufe3WerkzeugeTuer(farbNameHolz, uid) {
    var defsStufe3 = [], musterCache = {}, stufe3Zaehler = 0, kantenCache = {}, rauschenId = null;
    /* Design-Review 22.09.2026 (Vergleich mit blatt/realismus-v2.png, Hawaii-1-Katalogfoto und
       referenz/tafel-rahmen.png): drei Nachbesserungen additiv zu den bestehenden Stufe-3-
       Werkzeugen — Kantenschatten am Glasausschnitt (statt nur Spiegelstreifen), eine feine
       Rauschstruktur auf Blatt/Rahmen und ein weicher statt harter Übergang Rahmen→Füllung.
       KEIN feTurbulence-Filter (siehe Kopf der Datei, Zeile ~513: „ohne Filter — Filter
       überleben die Rasterung für die Mail nicht zuverlässig“) — die Rauschstruktur ist deshalb
       eine feste Punktkachel, genau wie das Holzdekor oben eine feste Bild-Kachel ist, keine
       zufällige Berechnung. `uid` macht die Kennung je Zeichnung eindeutig (dieselbe Begründung
       wie bei griffEcht/idPraefix oben). */
    function kantenGrad(dir, deckkraft) {
      var key = dir + '-' + deckkraft;
      if (!kantenCache[key]) {
        var id = 'skz-rs-' + key.replace(/\./g, '') + (++stufe3Zaehler), x1, y1, x2, y2;
        if (dir === 'oben') { x1 = 0; y1 = 0; x2 = 0; y2 = 1; }
        else if (dir === 'unten') { x1 = 0; y1 = 1; x2 = 0; y2 = 0; }
        else if (dir === 'links') { x1 = 0; y1 = 0; x2 = 1; y2 = 0; }
        else { x1 = 1; y1 = 0; x2 = 0; y2 = 0; }
        defsStufe3.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
          '<stop offset="0" stop-color="#000000" stop-opacity="' + deckkraft + '"/>' +
          '<stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>');
        kantenCache[key] = id;
      }
      return 'url(#' + kantenCache[key] + ')';
    }
    function kantenSchatten(x, y, b, h, tiefe, deckkraft) {
      if (!(b > 0 && h > 0)) return '';
      var d = Math.max(0.8, Math.min(tiefe, Math.min(b, h) / 2));
      return rechteck(x, y, b, d, kantenGrad('oben', deckkraft), 'none', 0) +
             rechteck(x, y + h - d, b, d, kantenGrad('unten', deckkraft), 'none', 0) +
             rechteck(x, y, d, h, kantenGrad('links', deckkraft), 'none', 0) +
             rechteck(x + b - d, y, d, h, kantenGrad('rechts', deckkraft), 'none', 0);
    }
    /* Glasausschnitt: Schatten auf allen VIER Kanten (Einfassprofil/Glasleiste), nicht nur als
       diagonaler Spiegelstreifen — 3–4 px auf Mailgröße, dieselbe Formel wie der bisherige
       Falzschatten am Fenster. Design-Review 2. Runde (22.09.2026): 0.24 Deckkraft ging bei
       Mailgröße gegen die helle Glasfarbe unter — jetzt 0.4, dieselbe Anhebung wie am Fenster
       (falzSchatten3). */
    function randSchatten(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      var d = Math.max(2.2, Math.min(b, h) * 0.05);
      return kantenSchatten(x, y, b, h, d, 0.4);
    }
    /* Übergang Rahmen -> Füllung: 1–2 px weicher Verlauf statt der harten rgba-Kontur.
       Design-Review 2. Runde: ebenfalls angehoben (0.18 -> 0.28), sonst blieb auch diese Kante
       auf dem gerasterten Mailbild praktisch unsichtbar. */
    function bevelKante(x, y, b, h, dicke) {
      if (!(b > 0 && h > 0)) return '';
      var d = Math.max(1.2, dicke * 1.6);
      return kantenSchatten(x, y, b, h, d, 0.28);
    }
    function rauschenPattern() {
      if (!rauschenId) {
        var id = 'skz-rauschen' + (++stufe3Zaehler),
            punkte = [[3, 4, 0.9], [9, 2, 0.6], [15, 7, 0.8], [21, 3, 0.7], [5, 11, 0.7], [13, 13, 0.9],
                      [19, 15, 0.6], [2, 19, 0.8], [10, 21, 0.7], [17, 20, 0.9], [23, 11, 0.6], [7, 17, 0.8]],
            inner = punkte.map(function (p) {
              return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.6" fill="' +
                ((p[0] + p[1]) % 2 === 0 ? '#000000' : '#ffffff') + '" fill-opacity="' + p[2] + '"/>';
            }).join('');
        defsStufe3.push('<pattern id="' + id + '" width="24" height="24" patternUnits="userSpaceOnUse">' + inner + '</pattern>');
        rauschenId = id;
      }
      return rauschenId;
    }
    /* Feine Oberflächenmodulation (2–3 % Deckkraft) auf Blatt-/Rahmenflächen — eine feste
       Punktkachel statt feTurbulence, ein Def je Zeichnung (Test prüft das). */
    function rauschen(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      return '<rect x="' + z(x) + '" y="' + z(y) + '" width="' + z(b) + '" height="' + z(h) +
        '" fill="url(#' + rauschenPattern() + ')" opacity="0.03" pointer-events="none"/>';
    }
    function muster(vertikal) {
      var key = vertikal ? 'v' : 'h';
      if (!musterCache[key]) {
        var id = 'skz-holz' + (++stufe3Zaehler);
        // Design-Review 2. Runde (22.09.2026): dieselbe Dämpfung wie am Fenster (stufe3Muster) —
        // die Holzkachel wirkte kontrastreicher/„lauter" als die flachen Unifarben daneben.
        // Design-Review 4. Runde (22.09.2026, "verpixelt"): die Kachel ist jetzt 192x64 px (statt
        // 80x80) und läuft LANG entlang der Maserung — im Pattern deshalb im selben Seitenverhältnis
        // (34 x 11,33, Faktor 3:1) statt gestaucht auf ein Quadrat, sonst wirken die feinen Linien
        // wieder wie grobe Blöcke.
        defsStufe3.push('<pattern id="' + id + '" width="34" height="11.33" patternUnits="userSpaceOnUse"' +
          (vertikal ? ' patternTransform="rotate(90)"' : '') + '>' +
          '<image href="data:image/png;base64,' + HOLZ_TILE_B64 + '" x="0" y="0" width="34" height="11.33"/>' +
          '<rect x="0" y="0" width="34" height="11.33" fill="#ffffff" fill-opacity="0.16"/></pattern>');
        musterCache[key] = id;
      }
      return 'url(#' + musterCache[key] + ')';
    }
    function fuellung(hex, vertikal) { return farbNameHolz ? muster(vertikal) : hex; }
    // Wie stufe3RingFuellung (29.09.2026): alle Seiten gleiche Fläche, Tiefe nur über dünne Kanten.
    function ringFuellung(hex, vertikal, licht) {
      if (farbNameHolz) return muster(vertikal);
      return hex;
    }
    function ringPfad(pkt, fuell) {
      return '<path d="M' + pkt.map(function (p) { return z(p[0]) + ' ' + z(p[1]); }).join(' L') +
        ' Z" fill="' + fuell + '" stroke="none"/>';
    }
    function ring(x, y, b, h, hex, kontur, dicke, ringTiefe) {
      if (!(b > 0 && h > 0)) return '';
      var tMax = Math.min(b, h) / 2,
          t = Math.max(0, Math.min(ringTiefe == null ? tMax : ringTiefe, tMax));
      if (t < 0.05) return rechteck(x, y, b, h, ringFuellung(hex, h > b, null), kontur, dicke);
      var ix1 = x + t, iy1 = y + t, ix2 = x + b - t, iy2 = y + h - t;
      /* Design-Review 22.09.2026: drei sichtbare Stufen statt zwei — Blendrahmen (Kontur+Fläche),
         eine schmale Falzbande zwischen Kontur und Lichtkante, Dichtung (bereits eigene Funktion
         am Glas). Die Bande ist eine feine, halbtransparente Kontur knapp innerhalb der Kante. */
      var bandT = Math.max(0.5, t * 0.16), bandIn = Math.max(0.3, t * 0.18);
      return '<g data-teil="profilring">' +
        ringPfad([[x, y], [x + b, y], [ix2, iy1], [ix1, iy1]], ringFuellung(hex, false, 'hell')) +
        ringPfad([[x, y], [ix1, iy1], [ix1, iy2], [x, y + h]], ringFuellung(hex, true, 'hell')) +
        ringPfad([[x, y + h], [ix1, iy2], [ix2, iy2], [x + b, y + h]], ringFuellung(hex, false, 'dunkel')) +
        ringPfad([[x + b, y], [x + b, y + h], [ix2, iy2], [ix2, iy1]], ringFuellung(hex, true, 'dunkel')) +
        (t > 1.2 ? '<rect x="' + z(x + bandIn) + '" y="' + z(y + bandIn) + '" width="' + z(Math.max(0, b - 2 * bandIn)) +
          '" height="' + z(Math.max(0, h - 2 * bandIn)) + '" fill="none" stroke="' +
          stufe3MischenTuer(hex, 'dunkel', 0.07) + '" stroke-opacity="0.45" stroke-width="' + z(bandT) + '"/>' : '') +
        '<rect x="' + z(x) + '" y="' + z(y) + '" width="' + z(b) + '" height="' + z(h) +
          '" fill="none" stroke="' + (kontur || 'none') + '" stroke-width="' + (dicke || 0) + '"/>' +
        '</g>';
    }
    /* Design-Review 2. Runde (22.09.2026, Koordinator-Vorgabe): Deckkraft fest auf ~0.18 statt
       0.5, plus Fade-IN am Anfang UND Fade-OUT am Ende (dieselbe Formel wie glasReflex3 am
       Fenster) — vorher hart bei offset 0 und wirkte auf dem Türglas wie ein Aufkleber. */
    function glasReflex(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      var id = 'skz-refl' + (++stufe3Zaehler);
      defsStufe3.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>' +
        '<stop offset="0.08" stop-color="#ffffff" stop-opacity="0.18"/>' +
        '<stop offset="0.14" stop-color="#ffffff" stop-opacity="0.05"/>' +
        '<stop offset="0.19" stop-color="#ffffff" stop-opacity="0"/></linearGradient>');
      /* 30.09.2026: aus der KÜRZEREN Seite gerechnet. Bei breiten, flachen Lichtern (Oberlicht über drei
         Flügel) war der Streifen 13 % der Feldbreite — ein großes weißes Band, das Licht wirkte heller/weißer
         als die Flügel (Betrieb: „das durchgehende Feld hat kein blaues Glas“). Hoch/quadratisch: unverändert. */
      var kurz = Math.min(b, h), bw = kurz * 0.26, x0 = x + b * 0.08,
          pts = [[x0, y], [x0 + bw, y], [x0 + kurz * 0.42, y + h], [x0 + kurz * 0.42 - bw, y + h]];
      return polygon(pts, 'url(#' + id + ')', null, 0);
    }
    function dichtung(x, y, b, h, dicke) {
      var d = Math.max(1, dicke * 0.5);
      return rechteck(x + d, y + d, Math.max(0, b - 2 * d), Math.max(0, h - 2 * d), 'none', '#14171a', d);
    }
    // INOX-Applikation als gebürstetes Edelstahl statt der bisherigen Ein-Farb-Fläche (Design-
    // Prüfung 22.09.2026): derselbe vierstufige Metallverlauf wie skz-alu bei den Beschlagteilen,
    // aber eine eigene, feste Id — die Kennung "…-inox" bleibt so für die Regressionstests
    // durchsuchbar, unabhängig vom Griff-Verlauf.
    var inoxAngelegt = false;
    function inox() {
      if (!inoxAngelegt) {
        defsStufe3.push('<linearGradient id="skz-inox" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#c3c9cf"/><stop offset="35%" stop-color="#f4f6f8"/>' +
          '<stop offset="70%" stop-color="#d5dade"/><stop offset="100%" stop-color="#b3bac1"/></linearGradient>');
        inoxAngelegt = true;
      }
      return 'url(#skz-inox)';
    }
    /* Rahmen oben und seitlich, unten offen (steht stumpf auf dem Kämpfer): oben auf Gehrung. */
    function rahmenU(x, y, b, h, hex, kontur, dicke, t) {
      if (!(b > 0 && h > 0)) return '';
      t = Math.max(0, Math.min(t, b / 2, h));
      var ix1 = x + t, ix2 = x + b - t, iy1 = y + t, yu = y + h;
      return '<g data-teil="profilring">' +
        ringPfad([[x, y], [x + b, y], [ix2, iy1], [ix1, iy1]], ringFuellung(hex, false, 'hell')) +
        ringPfad([[x, y], [ix1, iy1], [ix1, yu], [x, yu]], ringFuellung(hex, true, 'hell')) +
        ringPfad([[x + b, y], [x + b, yu], [ix2, yu], [ix2, iy1]], ringFuellung(hex, true, 'dunkel')) +
        '<path d="M' + z(x) + ' ' + z(yu) + ' L' + z(x) + ' ' + z(y) + ' L' + z(x + b) + ' ' + z(y) + ' L' + z(x + b) + ' ' + z(yu) +
          ' M' + z(ix1) + ' ' + z(yu) + ' L' + z(ix1) + ' ' + z(iy1) + ' L' + z(ix2) + ' ' + z(iy1) + ' L' + z(ix2) + ' ' + z(yu) +
          '" fill="none" stroke="' + (kontur || 'none') + '" stroke-width="' + (dicke || 0) + '"/>' +
        '</g>';
    }
    return { defs: defsStufe3, ring: ring, rahmenU: rahmenU, fuellung: fuellung, glasReflex: glasReflex, dichtung: dichtung, inox: inox, holzMuster: muster,
      randSchatten: randSchatten, bevelKante: bevelKante, rauschen: rauschen };
  }

  /* Echter Haustürbeschlag (griffe.js tuerGriffSvg) statt des generischen Symbols — dieselbe
     Fallback-Regel wie griffEcht() beim Fenster: nur wenn das Modul geladen ist UND die Kombination
     dort belegt ist, sonst null (Aufrufer fällt dann auf tuerBeschlag()/stossgriff() zurück).
     `richtung` (+1/-1, „zeigt von den Bändern weg“) entscheidet über `seite`: griffe.js spiegelt den
     Beschlag intern nur über diesen einen Wert (siehe Kopfkommentar tuerGriffSvg), DIN-Seite und
     Ansicht sind schon in `richtung` verrechnet (siehe zeichneHaustuer). */
  function tuerGriffEcht(art, modell, stilName, x, y, laengeMm, richtung, uidLokal) {
    /* Abgeschaltet (Eigentümer-Feedback 22.09.2026, wie griffEcht() oben): fällt über `||`
       zurück auf tuerBeschlag()/stossgriff() — dieselbe Konstruktion wie in Commit bd74aaa. */
    return null;
  }

  /* Echtes Türband (griffe.js tuerBandSvg — 3D-Rollenband mit Justierkappen) statt der
     Fenster-Kappe kappe(): dieselbe Skalierungs-Logik wie bandEcht() (Symbol hat feste Maße
     26×100 mm, wird auf die gewünschte Höhe skaliert und um x,y als Mitte zentriert). Bänder
     sind an der Haustür nur in der Innenansicht sichtbar (siehe zeichneHaustuer, [K] S. 72/73:
     Außenfoto zeigt eine glatte Kante) — der Aufrufer ruft diese Funktion deshalb nur dort auf. */
  function tuerBandEcht(x, y, h, farbeName, idPraefix) {
    /* Abgeschaltet (Eigentümer-Feedback 22.09.2026): griffe.js tuerBandSvg wirkte klobiger/dunkler
       als die schlanke Kappe aus bd74aaa. Fällt über `||` zurück auf kappe() — dieselbe, dezente
       silberne Bandkappe, die auch am Fenster verwendet wird (Task „Türbänder dezent“). */
    return null;
  }

  function zeichneHaustuer(k, daten, uid) {
    if (!daten) throw new Error('Keine Skizzen-Daten übergeben');
    var systemId = k.system || 'iglo-5-tuer';
    if (!TUER_SYSTEME[systemId]) throw new Error('Kein Drutex-Türsystem: ' + systemId);
    tuerAlu = TUER_ALU[systemId] || null;
    if (k.fluegelstaerke != null && !TUER_HOLZ[systemId]) throw new Error('fluegelstaerke gibt es nur bei Holztüren (Softline)');
    if (k.fluegelstaerke != null && [110, 140].indexOf(+k.fluegelstaerke) < 0) throw new Error('fluegelstaerke nur 110 oder 140 (D S. 73)');
    tuerFluegelBreit = +k.fluegelstaerke === 140;
    if (!TUER_OHNE_BAUTIEFE[systemId]) fakt(daten, systemId, 'bautiefe');
    if (k.oeffnung && k.oeffnung !== 'innen') throw new Error('Nach außen öffnende PVC-Haustür nicht belegt');

    var Bges = Math.max(+k.b || 1100, 600), Hges = Math.max(+k.h || 2100, 1600);
    // Seitenteil/Oberlicht (Bauform 1–7, D S. 100/101): teilt Bges/Hges in Türflügel + Anbau.
    // Ohne Bestellung bleibt layout = null und B/H = Bges/Hges wie vorher — byte-gleiches
    // Verhalten für jedes Element ohne Seitenteil.
    var layout = seitenteilLayout(k, daten, Bges, Hges);
    // massBezug 'tuer': Bges/Hges waren die Türmaße — ab hier gelten die Maße des ganzen Elements
    if (layout && layout.massBezug === 'tuer') { Bges = layout.Bges; Hges = layout.Hges; }
    var B = layout ? layout.bT : Bges, H = layout ? layout.hT : Hges,
        aussen = (k.ansicht === 'aussen'),
        din = tuerDin(k),
        bandLinks = aussen ? (din === 'rechts') : (din === 'links'),
        farbe = seitenFarbe(k, aussen),
        griffStil = griffStilAus(k),
        muster = tuerMuster(daten, k.modell || 'glas'),
        r = tuerZeichenmass(daten, 'rahmen'), fl = tuerZeichenmass(daten, 'fluegel'),
        flu = tuerZeichenmass(daten, 'fluegelUnten'), sw = tuerZeichenmass(daten, 'schwelle'),
        /* Füllungsart (1d, 30.09.2026): 'beidseitig' = beidseitig bündig/flügelüberdeckend (D S. 6/7, 12/13) → Flügel
           außen UND innen verdeckt; 'muster' = außen überdeckend; 'einlass' = Flügel sichtbar. Ohne Angabe wie bisher:
           Alu-Motiv (alu-*) außen überdeckend. */
        fArt = k.fuellungsart || (/^alu-/.test(k.modell || '') ? 'muster' : 'einlass'),
        ueberdeckend = !!TUER_ALU[systemId] && !TUER_HOLZ[systemId] && (fArt === 'beidseitig' || (aussen && fArt === 'muster')),
        flS = ueberdeckend ? 0 : fl, fluS = ueberdeckend ? 0 : flu;

    var kompakt = kompaktSchriftfeld(k);
    var bue = buehne(k, Bges, Hges),
        dickeStark = bue.bezug / 330, dickeFein = dickeStark * 0.62, schrift = bue.bezug / 22 * schriftFaktor,
        randL = massRand(schrift * 3.2, schrift), randR = massRand(schrift * 2.4, schrift),
        randO = massRand(schrift * 2.6, schrift),
        randU = schrift * (kompakt ? ((ohneMasse || k.ohneBeschriftung === true) ? 1.8 : KOMPAKT_UNTEN) : (k.farbName ? 5.3 : 4.2)),
        teile = [];

    // Stufe-3-Werkzeuge (Ring statt Flatprofil, Holzdekor, Glasspiegel, Dichtung) — dieselbe
    // Freigabe wie am Fenster (Leitregeln.md Punkt 4, 21./22.09.2026).
    var w3 = stufe3WerkzeugeTuer(istHolzDekor(k.farbName), uid);

    // Blendrahmen mit Schwelle, Flügel, Füllung. Auf dunkler Farbe helle Linien.
    var strich = istDunkel(farbe) ? '#8f989f' : FARBE.strich;
    // Innere Profilkanten (Flügelrahmen, Blattfüllung, Kämpfer) bekommen eine Kante aus der
    // Flächenfarbe statt der festen dunklen Kontur — „comichaft" (Betrieb 22.09.2026), siehe
    // kanteWeich(). Die äußere Silhouette (Blendrahmen ganz außen, Schwelle) bleibt bei `strich`.
    var strichInnen = kanteWeich(farbe);
    teile.push(w3.ring(0, 0, B, H, farbe, strich, dickeStark, r));
    // Design-Review 2. Runde (22.09.2026): der Übergang Blendrahmen -> Schwelle war eine harte
    // Kontur um die volle Schwellenfläche — dieselbe Linie wie die äußere Silhouette der Schwelle.
    // Jetzt: Fläche ohne Kontur, die äußere Silhouette (unten/seitlich) als eigener Pfad ohne
    // Oberkante, und ein weicher Schattenverlauf über der Naht statt der harten oberen Linie —
    // dieselbe Lösung wie an der Balkontür-Schwelle im Fenster-Pfad (falzSchatten3).
    teile.push(profilFlaeche(0, H - sw, B, sw, '#c9ced3', 'none', 0));
    teile.push('<path d="M0 ' + z(H - sw) + ' L0 ' + z(H) + ' L' + z(B) + ' ' + z(H) + ' L' + z(B) + ' ' + z(H - sw) +
      '" fill="none" stroke="' + FARBE.strich + '" stroke-width="' + z(dickeFein) + '"/>');
    teile.push(w3.bevelKante(0, H - sw - Math.max(2, sw * 0.16), B, Math.max(4, sw * 0.32), dickeFein));
    // Alu-Schwelle: dezente Lichtkante wie an der Balkontür-Schwelle im Fenster-Pfad, sonst
    // verschwindet die Schwelle unten im Ausschnitt als reine Kontur.
    teile.push(linie(0, H - sw + sw * 0.45, B, H - sw + sw * 0.45, FARBE.strichFein, dickeFein * 0.8));
    // Gehrung Blendrahmen (nur oben sichtbar, unten sitzt die Schwelle): links hell (Lichtkante),
    // rechts neutral — dieselbe Licht/Schatten-Logik wie an gehrung() unten (Design-Review 2. Runde).
    teile.push('<g stroke-width="' + z(dickeFein) + '">' + linie(0, 0, r, r, 'rgba(255,255,255,.4)', dickeFein) + linie(B, 0, B - r, r, FARBE.gehrung, dickeFein) + '</g>');
    var sx = r, sy = r, sbw = B - 2 * r, sh = H - sw - r;
    /* Zweiflügelig (1d, 30.09.2026): D S. 12/13 nennt „ein- oder zweiflügelige Außentüren“ (MB-79N SI), aber keine
       Teilung und keine Flügelmaße → beide Flügel gleich breit gezeichnet, Schriftfeld „Teilung im Angebot“.
       Gehflügel auf der DIN-Seite (Bänder dort), Standflügel daneben mit eigenen Bändern auf seiner Außenseite,
       ohne Griff. Füllung des Standflügels: Glas bleibt Glas, ein Motiv wird zur glatten Füllung (kein Beleg,
       dass das Motiv über beide Flügel läuft). Danach zeichnet der übliche Code den Gehflügel in seiner Hälfte. */
    if (k.zweifluegelig) {
      var halb = sbw / 2, stX = bandLinks ? sx + halb : sx,
          stFx = stX + flS, stFy = sy + flS, stFb = halb - 2 * flS, stFh = sh - flS - fluS,
          stGlas = muster.teile[0] && (muster.teile[0].typ === 'vollglas' || muster.teile[0].typ === 'kaempfer');
      if (flS > 0) teile.push(w3.ring(stX, sy, halb, sh, farbe, strichInnen, dickeFein, flS));
      teile.push('<g data-teil="standfluegel">' + profilFlaeche(stFx, stFy, stFb, stFh, w3.fuellung(farbe, stFh > stFb), strichInnen, dickeFein) +
        w3.bevelKante(stFx, stFy, stFb, stFh, dickeFein) +
        '<clipPath id="skz-fuell-st"><rect x="' + z(stFx) + '" y="' + z(stFy) + '" width="' + z(stFb) + '" height="' + z(stFh) + '"/></clipPath>' +
        (stGlas ? '<g clip-path="url(#skz-fuell-st)">' + tuerMusterZeichnen(muster, 'C', stFx, stFy, stFb, stFh, !aussen, false, farbe, dickeFein, daten, w3) + '</g>' : '') +
        '</g>');
      if (!aussen) {
        var stKb = tuerZeichenmass(daten, 'langschildB'), stKx = bandLinks ? sx + sbw + stKb * 0.5 : sx - stKb * 0.5;
        [0.12, 0.5, 0.88].forEach(function (a) {
          var by = sy + sh * a, bh = stKb * 4.2;
          teile.push(tuerBandEcht(stKx, by, bh, rahmenFarbeZuBeschlagFarbe(farbe), uid) || kappe(stKx, by, stKb, bh, dickeFein, griffStil));
        });
      }
      sx = bandLinks ? sx : sx + halb; sbw = halb;
    }
    // Flügelrahmen: derselbe Gehrungsring wie der Blendrahmen, Tiefe = sichtbare Flügelbreite `fl`
    // — vorher eine flache Fläche, jetzt ein eigenes, auf Gehrung geschnittenes Profil.
    if (flS > 0) teile.push(w3.ring(sx, sy, sbw, sh, farbe, strichInnen, dickeFein, flS));
    var fx = sx + flS, fy = sy + flS, fb = sbw - 2 * flS, fh = sh - flS - fluS;
    // Gehrung Flügelrahmen -> Füllung: die zweite Rahmenebene bekam bisher vier gleichfarbige
    // Linien (,,zweite Kontur"). Jetzt oben-links hell, unten-rechts dunkel, damit die Ecke als
    // Kante mit Tiefe liest statt als Strich (Design-Review 2. Runde, 22.09.2026).
    teile.push('<g stroke-width="' + z(dickeFein) + '">' + linie(sx, sy, fx, fy, 'rgba(255,255,255,.4)', dickeFein) +
               linie(sx + sbw, sy, fx + fb, fy, FARBE.gehrung, dickeFein) + linie(sx, sy + sh, fx, fy + fh, FARBE.gehrung, dickeFein) +
               linie(sx + sbw, sy + sh, fx + fb, fy + fh, 'rgba(8,10,12,.4)', dickeFein) + '</g>');
    teile.push(profilFlaeche(fx, fy, fb, fh, w3.fuellung(farbe, fh > fb), strichInnen, dickeFein) + w3.bevelKante(fx, fy, fb, fh, dickeFein));
    teile.push('<clipPath id="skz-fuell"><rect x="' + z(fx) + '" y="' + z(fy) + '" width="' + z(fb) + '" height="' + z(fh) + '"/></clipPath>');
    teile.push('<g clip-path="url(#skz-fuell)" data-teil="muster">' +
      tuerMusterZeichnen(muster, k.musterLage || 'C', fx, fy, fb, fh, !aussen, aussen || !!k.dekorBeidseitig, farbe, dickeFein, daten, w3) + '</g>');
    // Kämpfer (D S. 104–107, 16 Beispielmuster): Riegel je Muster, siehe tuerKaempferRiegel.
    if (k.kaempfer) teile.push(tuerKaempferRiegel(fx, fy, fb, fh, k.kaempfer, farbe, strichInnen, dickeFein, daten, w3, !aussen));

    var schlossX = bandLinks ? sx + sbw - fl / 2 : sx + fl / 2,
        richtung = bandLinks ? -1 : 1,
        achseY = H - tuerZeichenmass(daten, 'drueckerHoehe'),
        // Mindestgröße wie beim Fenstergriff (höchstens 1,5-fach, Langschild bleibt im Flügelprofil)
        beschlagF = Math.max(1, Math.min(Math.max(B, H) / 1400, 1.5, fl / tuerZeichenmass(daten, 'langschildB') - 0.2));
    /* Stoßgriff — außen (griffAussen) und bei „stoss-beidseitig“ auch innen (griffInnen). Länge aus der Bestellung,
       geprüft gegen daten['haustuer-stossgriff'] (D24 S. 72/73); Ausführung Edelstahl/lackiert/Holz/Licht. */
    function stossgriffTeil(g) {
      var laenge = stossLaengePruefen(daten, g.modell, g.laenge), ausf = stossAusfuehrungPruefen(g),
          grenze = bandLinks ? fx + fb - tuerZeichenmass(daten, 'stossBreite') : fx + tuerZeichenmass(daten, 'stossBreite'),
          stilStoss = GRIFF_STIL[k.griffStil] ? k.griffStil : 'silber',
          // Koordinator-Korrektur 22.09.2026: `achseY` (Drückerhöhe) blieb bisher auch bei langen
          // Stoßgriffen der Mittelpunkt — bei Bauform 5/6/7 ist der Türflügel durch das Oberlicht
          // verkürzt, ein 1600-mm-Griff ragte dann oben über die Füllung hinaus in den Rahmen.
          // Jetzt bleibt die Mitte bei achseY, solange der Griff komplett in der Füllung Platz hat,
          // sonst rutscht er so weit, dass er ganz in fy..fy+fh bleibt.
          stossRand = tuerZeichenmass(daten, 'stossStuetzenRand'),
          stossMitteY = (laenge + 2 * stossRand >= fh) ? fy + fh / 2 :
            Math.max(fy + laenge / 2 + stossRand, Math.min(achseY, fy + fh - laenge / 2 - stossRand));
      // Das fotorealistische Griffbild aus griffe.js gibt es nur für Edelstahl.
      return (ausf === 'edelstahl' && tuerGriffEcht('stossgriff', 'edelstahl', stilStoss, grenze, stossMitteY - laenge / 2, laenge, richtung, uid)) ||
        stossgriff(grenze, schlossX, stossMitteY, laenge, stilStoss, dickeFein * 1.25, daten, STOSS_FORM[g.modell], ausf, ausf === 'holz' ? w3.holzMuster(true) : null);
    }
    if (!aussen) {
      // Bänder (3 Stück, D26 S. 111) und Öffnungssymbol nur auf der Öffnungsseite
      // Drei Bänder (D26 S. 111) mit Abdeckkappen wie beim Fenster
      /* Bänder NUR in der Innenansicht — belegt am Drutex-Türkatalog (katalog_drzwi_de.pdf, IGLO
         ENERGY, S. 42/43): Das Innenfoto zeigt drei silberne Bänder an der Bandseite, das Außenfoto
         derselben Kunststofftür eine völlig glatte Kante. (Die Aluminiumtür MB-86N SI auf S. 6 zeigt
         außen schmale Bandrollen auf der Fuge — das gilt nicht für die hier gezeichneten PVC-Türen.)
         Betrieb fragte am 17.09.2026, ob das so bleiben soll: ja, es ist die Blickrichtung, nicht die Farbe. */
      // Band an der Flügelkante, Körper auf dem Rahmen — derselbe Bezug wie beim Fenster und wie im
      // Katalogfoto [K] S. 72. Bis 16.09.2026 saß es mittig auf dem Türblatt; Fenster und Tür zeigten
      // dasselbe Bauteil an zwei verschiedenen Orten.
      var kb = tuerZeichenmass(daten, 'langschildB'), kx = bandLinks ? sx - kb * 0.5 : sx + sbw + kb * 0.5;
      [0.12, 0.5, 0.88].forEach(function (a) {
        var by = sy + sh * a, bh = kb * 4.2;
        teile.push(tuerBandEcht(kx, by, bh, rahmenFarbeZuBeschlagFarbe(farbe), uid) || kappe(kx, by, kb, bh, dickeFein, griffStil));
      });
      // Gilt jetzt (Eigentümer-Entscheid 22.09.2026): Öffnungsdreieck NUR außen (gestrichelt, wie
      // beim Fenster — breite Seite an den Bändern, Spitze zur Griffseite), innen bleiben die drei
      // sichtbaren Bänder ohne Dreieck. Siehe `else`-Zweig (aussen) unten.
      // Verlauf: bis 22.09.2026 „kein Öffnungsdreieck bei Haustüren“ (Betrieb 14.09.2026: innen und
      // außen gleich, wie die Katalogansichten) — vom Eigentümer widerrufen.
      // Drücker-Höhe (`achseY`, aus daten.zeichnung.haustuer.drueckerHoehe — ≈1050 mm über
      // Schwelle, siehe recherche/zeichenvorlage-haustuer.md) bleibt der Bezug; der echte Griff
      // (tuerGriffSvg) hängt sein Langschild mit demselben Achsenpunkt (rh*0.18, Drehpunkt des
      // Hebels) an `achseY`, das generische Symbol war dort mittig auf dem Langschild zentriert —
      // eine Zeichenannahme, weil griffe.js x/y als Rosettenoberkante, nicht -mitte, nimmt.
      var langschildHInnen = tuerZeichenmass(daten, 'langschildH');
      if (k.griffInnen && k.griffInnen.art === 'stoss') teile.push(stossgriffTeil(k.griffInnen));   // „stoss-beidseitig“
      else teile.push(
        tuerGriffEcht('druecker', 'alu', griffStil, schlossX, achseY - langschildHInnen * 0.18, tuerZeichenmass(daten, 'druecker') * beschlagF, richtung, uid) ||
        tuerBeschlag(schlossX, achseY, richtung, 'druecker', griffStil, dickeFein * 1.25, daten, beschlagF));
    } else {
      // Öffnungsdreieck außen (Eigentümer-Entscheid 22.09.2026, siehe Kommentar im `!aussen`-Zweig
      // oben): dieselbe Konvention wie am Fenster — breite Seite an den Bändern, Spitze zur
      // Griffseite (Leitregeln.md Regel 7) — und gestrichelt, weil der Flügel von außen betrachtet vom
      // Betrachter weg öffnet (dieselbe Logik wie gestrichelt() am Fenster).
      teile.push(gestrichelt(oeffnungsSymbol(bandLinks ? 'dreh-l' : 'dreh-r', fx, fy, fx + fb, fy + fh, dickeFein * 1.3), dickeFein * 1.3));
      var ga = k.griffAussen || { art: 'druecker' };
      if (ga.art === 'stoss') {
        teile.push(stossgriffTeil(ga));
      } else {
        var langschildAussen = tuerZeichenmass(daten, 'langschildH');
        teile.push(
          tuerGriffEcht(ga.art === 'knauf' ? 'knauf' : 'druecker', 'edelstahl', griffStil, schlossX, achseY - langschildAussen * 0.18, tuerZeichenmass(daten, 'druecker') * beschlagF, richtung, uid) ||
          tuerBeschlag(schlossX, achseY, richtung, ga.art === 'knauf' ? 'knauf' : 'druecker', griffStil, dickeFein * 1.25, daten, beschlagF));
      }
    }

    // Feine Oberflächenmodulation über Blatt + Rahmen — ganz oben, als letztes Element, sonst
    // wird sie von Füllung/Muster/Beschlag wieder übermalt (Design-Review 22.09.2026).
    teile.push(w3.rauschen(0, 0, B, H));
    var inhalt = teile.join(''), aussenTeile = [];
    if (layout) {
      // Türflügel-Teilzeichnung (unverändert, in eigenem Koordinatenraum 0..B,0..H) an ihre
      // Stelle im Gesamtelement verschieben; Seitenteil(e) und Oberlicht/Kämpfer drumherum in
      // den Gesamtkoordinaten 0..Bges,0..Hges zeichnen.
      inhalt = '<g transform="translate(' + z(layout.xT) + ' ' + z(layout.yT) + ')">' + inhalt + '</g>';
      // Seitenteile laufen immer über die volle Gesamthöhe durch — in keiner der sieben
      // Bauformen liegt ein eigenes Oberlicht über einem Seitenteil (siehe BAUFORM_SEITENTEIL).
      var anbauGefuellt = k.anbauFuellung === 'wie-tuer';
      if (layout.links) aussenTeile.push(seitenteilTeil(layout.links.x, 0, layout.links.b, layout.links.h, farbe, strich, dickeStark, dickeFein, daten, w3, anbauGefuellt));
      if (layout.rechts) aussenTeile.push(seitenteilTeil(layout.rechts.x, 0, layout.rechts.b, layout.rechts.h, farbe, strich, dickeStark, dickeFein, daten, w3, anbauGefuellt));
      if (layout.oberlichtTuer) {
        // Oberlicht ausschließlich über der Tür selbst: Verglasung + Kämpferriegel, nur so breit
        // wie der Türflügel — die Pfosten daneben laufen ungebrochen bis zur Rahmenoberkante.
        // Koordinator-Korrektur 22.09.2026: das Glas hing bisher rahmenlos an der Oberkante —
        // jetzt derselbe Gehrungsring (Tiefe `r`, wie der Blendrahmen) drumherum, genau wie am
        // Seitenteil (seitenteilTeil) und am Fensteroberlicht.
        /* 29.09.2026 (Betrieb am Fensteroberlicht: „so ein Pfosten existiert nicht“ — gilt für alle
           Produkte): Zwischen Oberlichtglas und Türflügel lagen hier DREI gehrte Ringe übereinander —
           Unterkante des Oberlicht-Rings (r), ein eigener Kämpfer-Ring (kaempferDicke) und der obere
           Blendrahmen der Tür (r), zusammen ≈ 239 mm; der Kämpfer sah wie ein weiteres Bauteil aus.
           Jetzt: Oberlicht mit nach unten offenem Rahmen (oben auf Gehrung), das Glas steht direkt
           auf dem Kämpfer; der Kämpfer ist ein flacher Balken, stumpf zwischen die seitlichen Rahmen
           gestoßen, ohne Ring und Gehrung. Teilung und Maße bleiben (Glasunterkante = oberlichtH,
           dort endet das Oberlichtmaß). Kämpferhöhe weiter Zeichenannahme zeichnung.haustuer.kaempfer. */
        var olX = layout.xT, olB = layout.bT, olHu = layout.oberlichtH, kd = layout.kaempferDicke;
        aussenTeile.push(w3.rahmenU(olX, 0, olB, olHu + kd, farbe, strich, dickeStark, r));
        var olGx = olX + r, olGy = r, olGb = olB - 2 * r, olGh = olHu - r;
        aussenTeile.push(glasFlaeche(olGx, olGy, olGb, olGh, dickeFein) +
          w3.glasReflex(olGx, olGy, olGb, olGh) + w3.randSchatten(olGx, olGy, olGb, olGh) +
          w3.dichtung(olGx, olGy, olGb, olGh, dickeFein) + festFeldKennung(olGx, olGy, olGx + olGb, olGy + olGh) +
          '<g data-teil="kaempfer">' + rechteck(olX + r, olHu, olB - 2 * r, kd, w3.fuellung(farbe, false), strich, dickeFein) + '</g>');
      }
      if (layout.links) aussenTeile.push(w3.ring(layout.xT - layout.pfosten, 0, layout.pfosten, Hges, farbe, strich, dickeStark));
      if (layout.rechts) aussenTeile.push(w3.ring(layout.xT + layout.bT, 0, layout.pfosten, Hges, farbe, strich, dickeStark));
    }

    /* Rahmenverbreiterung (30.09.2026, gewählte Seiten als deutlicher Streifen mit Maß, wie beim Fenster):
       außen um das ganze Element, oben/unten über die volle Breite. Die Maßketten rücken um die Streifen nach
       außen; die Verbreiterungen stehen als eigene Teilmaße daneben. */
    var vbT = k.verbreiterung || {}, tvL = Math.max(+vbT.links || 0, 0), tvR = Math.max(+vbT.rechts || 0, 0),
        tvO = Math.max(+vbT.oben || 0, 0), tvU = Math.max(+vbT.unten || 0, 0);
    if (tvL || tvR || tvO || tvU) {
      var tStreifen = function (x, y, b, h) {
        var st = verbreiterungStil(farbe, istHolzDekor(k.farbName) ? w3.fuellung(farbe, h > b) : null);
        return '<g data-teil="verbreiterung">' + rechteck(x, y, b, h, st.fill, st.stroke, dickeFein * (hervorheben === 'verbreiterung' ? 2.2 : 1.4)) + '</g>';
      };
      if (tvL) aussenTeile.push(tStreifen(-tvL, 0, tvL, Hges));
      if (tvR) aussenTeile.push(tStreifen(Bges, 0, tvR, Hges));
      if (tvO) aussenTeile.push(tStreifen(-tvL, -tvO, Bges + tvL + tvR, tvO));
      if (tvU) aussenTeile.push(tStreifen(-tvL, Hges, Bges + tvL + tvR, tvU));
    }
    // Maßketten außen (DIN 406): Gesamtbreite, bei Seitenteil zusätzlich die Teilbreiten in
    // einer zweiten Kette darunter; Gesamthöhe, bei Oberlicht zusätzlich dessen Höhe daneben.
    var mass = [massWaagerecht(0, Bges, -tvO - schrift * 0.9, Bges + '', (tvL || tvR) ? schrift * 0.82 : schrift, dickeFein),
                massSenkrecht(0, Hges, Bges + tvR + schrift * 0.9, Hges + '', schrift, dickeFein)];
    if (tvL) mass.push(akzentWenn('verbreiterung', massWaagerecht(-tvL, 0, -tvO - schrift * 0.9, tvL + '', schrift * 0.82, dickeFein, -1)));
    if (tvR) mass.push(akzentWenn('verbreiterung', massWaagerecht(Bges, Bges + tvR, -tvO - schrift * 0.9, tvR + '', schrift * 0.82, dickeFein, -1)));
    if (tvL || tvR) mass.push(massWaagerecht(-tvL, Bges + tvR, -tvO - schrift * 2.35, (tvL + Bges + tvR) + '', schrift, dickeFein));
    if (tvO) mass.push(akzentWenn('verbreiterung', massSenkrecht(-tvO, 0, -tvL - schrift * 0.9, tvO + '', schrift * 0.82, dickeFein, -1)));
    if (tvU) mass.push(akzentWenn('verbreiterung', massSenkrecht(Hges, Hges + tvU, -tvL - schrift * 0.9, tvU + '', schrift * 0.82, dickeFein, -1)));
    if (tvO || tvU) mass.push(massSenkrecht(-tvO, Hges + tvU, Bges + tvR + schrift * 2.6, (tvO + Hges + tvU) + '', schrift, dickeFein));
    if (layout && (layout.links || layout.rechts)) {
      // Kette lückenlos (DIN 406): Seitenteil, Pfosten, Türflügel, Pfosten, Seitenteil — jedes
      // Teilstück zählt, sonst ergäbe die Summe nicht die Gesamtbreite. Ohne Seitenteil (nur
      // Oberlicht, Bauform 5) bleibt die Breite ungeteilt — eine zweite Kette wäre nur die
      // Gesamtbreite ein zweites Mal.
      var kettenY = -tvO - schrift * ((tvL || tvR) ? 3.8 : 2.5), seg = [];
      if (layout.massBezug === 'tuer') {
        // Bestellte Zahlen: Seitenteil (mit Pfosten) | Tür | Seitenteil (mit Pfosten)
        if (layout.links) seg.push([0, layout.xT]);
        seg.push([layout.xT, layout.xT + layout.bT]);
        if (layout.rechts) seg.push([layout.xT + layout.bT, Bges]);
      } else {
        if (layout.links) { seg.push([0, layout.panelB]); seg.push([layout.panelB, layout.xT]); }
        seg.push([layout.xT, layout.xT + layout.bT]);
        if (layout.rechts) { seg.push([layout.xT + layout.bT, layout.rechts.x]); seg.push([layout.rechts.x, layout.rechts.x + layout.panelB]); }
      }
      // Gerundet wird kumulativ (nicht Segment für Segment), sonst geht die Kette nicht mehr
      // exakt in der Gesamtbreite auf (Rundungsdifferenz von 1 mm bei krummen Anteilen).
      var lfd = 0;
      seg.forEach(function (s) { var e = Math.round(s[1]), l = e - lfd; mass.push(massWaagerecht(s[0], s[1], kettenY, l + '', schrift * 0.8, dickeFein)); lfd = e; });
    }
    if (layout && layout.oberlichtTuer) {
      // massBezug 'tuer': das bestellte Oberlichtmaß (mit Kämpfer), sonst wie bisher die Glashöhe
      var olMass = layout.massBezug === 'tuer' ? layout.oberlichtGes : layout.oberlichtH;
      mass.push(massSenkrecht(0, olMass, Bges + tvR + schrift * ((tvO || tvU) ? 4.0 : 2.3), Math.round(olMass) + '', schrift * 0.8, dickeFein));
    }
    var ansichtTextT = titelMitPos(k, (aussen ? 'Ansicht von außen' : 'Ansicht von innen') + ' · DIN ' + din);
    var unterschrift, zeileYT;
    if (kompakt) {
      zeileYT = Hges + schrift * 2.4;
      unterschrift = ansichtsZeileKompakt(ansichtTextT, Bges / 2, zeileYT, schrift);
    } else {
      unterschrift = '<text x="' + z(Bges / 2) + '" y="' + z(Hges + schrift * 2.4) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + ansichtTextT + '</text>' +
        '<text x="' + z(Bges / 2) + '" y="' + z(Hges + schrift * 3.55) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + HINWEIS + '</text>';
      zeileYT = Hges + schrift * 4.5;
      if (k.farbName) {
        unterschrift += '<text x="' + z(Bges / 2) + '" y="' + z(zeileYT) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * 0.8) + '" fill="' + FARBE.strichFein + '">' + esc(k.farbName) + '</text>';
        zeileYT += schrift * 1.05;
      }
      if (k.schriftfeld) {
        var sfbT = schriftfeldBlock(k, Bges, Hges, daten, zeileYT, schrift, Bges / 2, dickeFein);
        unterschrift += sfbT.svg;
        randU = Math.max(randU, sfbT.zeileY - Hges + schrift * 0.2);
        randL = Math.max(randL, (sfbT.breite - Bges) / 2 + schrift * 0.4);
        randR = Math.max(randR, (sfbT.breite - Bges) / 2 + schrift * 0.4);
      }
    }
    // Platz für die zweite Maßkette der Teilbreiten (Ziffernhöhe + Luft über der Kettenlinie bei
    // -2,5·schrift, siehe massWaagerecht) und für die Oberlichthöhe rechts daneben (massSenkrecht,
    // gedreht). Ohne diese beiden Zuschläge schnitt der Bildausschnitt „1019“/„73“ oben ab (Design-
    // Prüfung 21.09.2026) — mit Rand geprüft über alle sieben Bauformen (Test unten).
    if (layout && (layout.links || layout.rechts)) randO = Math.max(randO, schrift * 4.2);
    if (layout && layout.oberlichtTuer) randR = Math.max(randR, schrift * 4.5);
    // Verbreiterung: Streifen + zusätzliche Ketten brauchen Platz
    if (tvL || tvR) randO = Math.max(randO, schrift * ((layout && (layout.links || layout.rechts)) ? 5.5 : 4.0));
    if (tvO || tvU) randR = Math.max(randR, schrift * ((layout && layout.oberlichtTuer) ? 6.2 : 4.4));
    randO += tvO; randU += tvU; randL += tvL + ((tvO || tvU) ? schrift * 1.6 : 0); randR += tvR;

    if (!kompakt) {
      randL = randFuerHinweis(randL, Math.max(Bges, bue.b), schrift);
      randR = randFuerHinweis(randR, Math.max(Bges, bue.b), schrift);
    }
    var vb = buehnenAusschnitt(bue, -randL, -randO, Bges + randL + randR, Hges + randO + randU, randL, randR, randO, randU);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + z(vb.box[0]) + ' ' + z(vb.box[1]) + ' ' + z(vb.box[2]) + ' ' + z(vb.box[3]) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="' + beschriftung(k, Bges, Hges) + '">' +
      '<defs>' + glasDef(glasMotivAus(k), bue.bezug) + TIEFE_DEF + GRIFF_DEFS + w3.defs.join('') + '</defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, inhalt + aussenTeile.join('') + mass.join('') + unterschrift) + '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  /* ============================================================ Schiebetür
   * PSK (Parallel-Schiebe-Kipp) und HS (Hebe-Schiebe), Schema A (ein Schiebeflügel, ein
   * Festfeld). Belege: ~/df-preis-analyse/skizzen-hersteller-2026-09-14/01-schiebetueren.md.
   * PSK: Festfeld direkt im Rahmen verglast, Schiebeflügel liegt raumseitig davor.
   * HS: Festflügel in der äußeren Ebene, Schiebeflügel innen, 60-mm-Schwelle.
   * `schiebefluegelSeite` = Lage des Schiebeflügels geschlossen, von innen gesehen.       */

  var SCHIEBE_SYSTEME = { 'iglo-5-classic-psk': 'psk', 'iglo-energy-classic-psk': 'psk', 'iglo-hs': 'hs',
    // 26.09.2026: gleiche Ansichtsbreiten wie die Classic-Fassung, belegt okna_pvc_de.pdf (Stand 22.06.2026) S. 88/89
    'iglo-5-psk': 'psk', 'iglo-light-psk': 'psk', 'iglo-energy-psk': 'psk',
    /* 30.09.2026: Holz (Softline), Holz-Alu (Duoline) und Alu (MB-70/70HI) — VORLÄUFIG mit Schwesterprofil-Maßen
       (Freigabe Konfigurator-Sitzung), Drutex nennt für diese Schiebetüren nur Einbautiefen. MB-77HS bleibt
       „Skizze im Angebot“: Kunststoff- oder Fenstermaße auf ein schlankes Alu-HS zu übertragen wäre falsch. */
    'softline-68-psk': 'psk', 'softline-68-hs': 'hs', 'duoline-68-hs': 'hs', 'softline-78-psk': 'psk', 'softline-78-hs': 'hs', 'duoline-78-hs': 'hs', 'softline-88-psk': 'psk', 'softline-88-hs': 'hs', 'duoline-88-hs': 'hs', 'duoline-68-psk': 'psk', 'duoline-78-psk': 'psk', 'mb-70-psk': 'psk', 'mb-70hi-psk': 'psk' };
  // Katalog-IDs → Zeichen-IDs (die Zuordnung darf die Katalog-ID direkt durchreichen)
  var SCHIEBE_ALIAS = { 'softline68-psk': 'softline-68-psk', 'softline68-hs': 'softline-68-hs', 'duoline68-hs': 'duoline-68-hs', 'softline78-psk': 'softline-78-psk', 'softline78-hs': 'softline-78-hs', 'duoline78-hs': 'duoline-78-hs', 'softline88-psk': 'softline-88-psk', 'softline88-hs': 'softline-88-hs', 'duoline88-hs': 'duoline-88-hs', 'duoline68-psk': 'duoline-68-psk', 'duoline78-psk': 'duoline-78-psk', 'mb70-psk': 'mb-70-psk', 'mb70hi-psk': 'mb-70hi-psk' };

  /* Ein Maß steht entweder belegt unter <systemId> oder als Zeichenannahme — nie an beiden Stellen. */
  function schiebeMass(daten, systemId, eigenschaft) {
    var belegt = daten[systemId] && daten[systemId][eigenschaft],
        annahme = daten.zeichnung && daten.zeichnung[systemId] && daten.zeichnung[systemId][eigenschaft];
    if (belegt && annahme) throw new Error('Doppelt geführt: ' + systemId + '.' + eigenschaft);
    return belegt ? fakt(daten, systemId, eigenschaft) : zeichenmass(daten, systemId, eigenschaft);
  }

  function pfeil(x1, x2, y, anstrich, dicke) {
    var r = x2 > x1 ? 1 : -1, sp = Math.abs(x2 - x1) * 0.12, a = '<g data-teil="pfeil" fill="none" stroke="' + FARBE.symbol +
      '" stroke-width="' + z(dicke) + '" stroke-linecap="round" stroke-linejoin="round">';
    a += linie(x1, y, x2, y, FARBE.symbol, dicke) +
         '<polyline points="' + z(x2 - r * sp) + ',' + z(y - sp * 0.55) + ' ' + z(x2) + ',' + z(y) + ' ' + z(x2 - r * sp) + ',' + z(y + sp * 0.55) + '"/>';
    if (anstrich) a += linie(x1, y, x1, y + anstrich, FARBE.symbol, dicke);
    return a + '</g>';
  }

  /* HS-Hebel: kurze Rosette, langer Hebel; geschlossen senkrecht nach oben (MACO/Siegenia). */
  function hsGriff(x, y, stilName, dicke, daten, abschliessbar) {
    var st = GRIFF_STIL[stilName] || GRIFF_STIL.weiss,
        rb = schiebeMass(daten, 'iglo-hs', 'rosetteB'), rh = schiebeMass(daten, 'iglo-hs', 'rosetteH'),
        hl = schiebeMass(daten, 'iglo-hs', 'hebelLaenge'), hb = schiebeMass(daten, 'iglo-hs', 'hebelBreite'),
        s = '<g stroke-linejoin="round" data-teil="griff">', v = Math.max(dicke * 1.3, 2.5);
    var hebel = 'M' + z(x - hb / 2) + ' ' + z(y) + ' L' + z(x - hb * 0.42) + ' ' + z(y - hl + hb * 0.42) +
      ' A' + z(hb * 0.42) + ' ' + z(hb * 0.42) + ' 0 0 1 ' + z(x + hb * 0.42) + ' ' + z(y - hl + hb * 0.42) +
      ' L' + z(x + hb / 2) + ' ' + z(y) + ' A' + z(hb / 2) + ' ' + z(hb / 2) + ' 0 0 1 ' + z(x - hb / 2) + ' ' + z(y) + ' Z';
    if (st.schatten) s += '<path d="' + hebel + '" transform="translate(' + z(v) + ' ' + z(v * 1.2) + ')" fill="rgba(20,28,36,.14)"/>';
    s += rechteck(x - rb / 2, y - rh * 0.3, rb, rh, st.rosette, st.kontur, dicke, ' rx="' + z(rb / 2) + '" ry="' + z(rb / 2) + '"');
    if (abschliessbar) s += '<circle data-teil="zylinder" cx="' + z(x) + '" cy="' + z(y + rh * 0.45) + '" r="' + z(rb * 0.24) + '" fill="#cfd5da" stroke="' + st.kontur + '" stroke-width="' + z(dicke * 0.8) + '"/>';
    s += '<path d="' + hebel + '" fill="' + st.flaeche + '" stroke="' + st.kontur + '" stroke-width="' + z(dicke) + '"/>';
    if (st.licht) s += linie(x - hb * 0.18, y - hb * 0.4, x - hb * 0.16, y - hl * 0.85, 'rgba(255,255,255,.9)', dicke * 0.9, ' stroke-linecap="round"');
    return s + '</g>';
  }

  function griffmulde(x, y, dicke, daten) {
    var mb = schiebeMass(daten, 'iglo-hs', 'muldeB'), mh = schiebeMass(daten, 'iglo-hs', 'muldeH');
    return '<g data-teil="griffmulde">' + rechteck(x - mb / 2, y - mh / 2, mb, mh, 'url(#skz-alu)', '#5f6972', dicke, ' rx="' + z(mb * 0.3) + '"') +
      rechteck(x - mb * 0.28, y - mh * 0.38, mb * 0.56, mh * 0.76, '#b9c0c6', '#5f6972', dicke * 0.7, ' rx="' + z(mb * 0.2) + '"') + '</g>';
  }

  function zeichneSchiebe(k, daten, uid) {
    if (!daten) throw new Error('Keine Skizzen-Daten übergeben');
    var systemId = SCHIEBE_ALIAS[k.system] || k.system || 'iglo-energy-classic-psk', bauart = SCHIEBE_SYSTEME[systemId];
    if (!bauart) throw new Error('Kein Drutex-Schiebesystem: ' + systemId);
    if (k.schema && k.schema !== 'A') throw new Error('Teilungsschema nicht belegt: ' + k.schema);
    if (k.abschliessbar && bauart === 'psk') throw new Error('Abschließbare PSK nicht belegt');
    var M = function (e) { return schiebeMass(daten, systemId, e); };
    var sprossenS = sprossenPruefen(daten, k.sprossen), glasMotivS = glasMotivAus(k);

    var B = Math.max(+k.b || 2000, 1200), H = Math.max(+k.h || 2200, 1600),
        aussen = (k.ansicht === 'aussen'),
        seite = k.schiebefluegelSeite === 'links' ? 'links' : 'rechts',
        schiebeRechts = aussen ? (seite === 'links') : (seite === 'rechts'),
        farbe = seitenFarbe(k, aussen),
        griffStil = griffStilAus(k);

    var kompakt = kompaktSchriftfeld(k);
    var bue = buehne(k, B, H),
        dickeStark = bue.bezug / 330, dickeFein = dickeStark * 0.62, schrift = bue.bezug / 22 * schriftFaktor,
        randL = massRand(schrift * 3.2, schrift), randR = massRand(schrift * 2.4, schrift),
        randO = massRand(schrift * 2.6, schrift),
        randU = schrift * (kompakt ? ((ohneMasse || k.ohneBeschriftung === true) ? 1.8 : KOMPAKT_UNTEN) : (k.farbName ? 5.3 : 4.2)),
        teile = [], spiegel = [], mass = [];
    var ar = M('ansichtsbreiteRahmen'), afb = M('ansichtsbreiteFluegel'), tx = B * M('teilung'),
        strich = istDunkel(farbe) ? '#8f989f' : FARBE.strich, gehrungFarbe = istDunkel(farbe) ? 'rgba(255,255,255,.22)' : FARBE.gehrung,
        // Innere Flügel-/Festfeldkanten weich aus der Flächenfarbe, wie an Fenster und Haustür
        // (kanteWeich(), Betrieb 22.09.2026 „zu comichaft"); der äußere Rahmen bleibt bei `strich`.
        strichInnen = kanteWeich(farbe);
    // Stufe-3-Werkzeuge (Ring aus vier Gehrungs-Trapezen, Holzdekor, Glasspiegel, Dichtung) —
    // dieselbe Freigabe wie Fenster/Haustür (Leitregeln.md Punkt 4, 21./22.09.2026), hier für die
    // Schiebetür wiederverwendet (stufe3WerkzeugeTuer ist produktneutral trotz des Namens).
    var w3 = stufe3WerkzeugeTuer(istHolzDekor(k.farbName), uid);
    // Gezeichnet wird immer „Schiebeflügel rechts“; liegt er links, wird die Gruppe gespiegelt.
    var X = function (x) { return schiebeRechts ? x : B - x; };
    var sprossenS_ = function (x, y, b, h) {
      return sprossenGitter(sprossenS, x, y, b, h, { glasMotiv: glasMotivS, rahmenFarbe: farbe, strich: strichInnen, dickeFein: dickeFein, aussen: aussen });
    };
    // Linke Maßspalte weicht einem links sitzenden Gurtwickler/Motor aus (wie beim Fenster)
    var linksSchiebe = (k.rollladen && k.rollladen.seite === 'links' && !aussen)
      ? -antriebAussen(antriebAus(k.rollladen), H, k.rollladen.antriebsart, ar) - schrift * 0.9
      : -schrift * 0.9;

    if (bauart === 'psk') {
      var rs = M('rahmenInnenSichtbar'), mitte = M('mitteGlasZuGlasInnen'),
          gOben = M('randBisGlasOben'), gUnten = M('randBisGlasUnten'),
          sfx1 = tx + mitte / 2 - afb, sfx2 = B - rs, sfy1 = gOben - afb, sfy2 = H - (gUnten - afb);
      /* 30.09.2026: Innenfläche des Rahmens in Profilfarbe. Bis dahin blieb zwischen Festglas und Schiebeflügel
         (dort sitzt das Mittelprofil) ein ungefüllter, weißer Spalt — bei allen PSK sichtbar oben am Übergang. */
      teile.push(rechteck(ar, ar, B - 2 * ar, H - 2 * ar, w3.fuellung(farbe, false), 'none', 0));
      teile.push(w3.ring(0, 0, B, H, farbe, strich, dickeStark, ar));
      spiegel.push(gehrung(0, 0, B, H, ar, dickeFein, gehrungFarbe));
      // Festfeld: Glas direkt im Rahmen, kein Flügelrahmen
      var fgx1 = M('randBisGlasFestseite'), fgx2 = tx - mitte / 2, fgy1 = M('festGlasOben'), fgy2 = H - M('festGlasUnten');
      spiegel.push(glas(fgx1, fgy1, fgx2 - fgx1, fgy2 - fgy1, dickeFein));
      spiegel.push(w3.glasReflex(fgx1, fgy1, fgx2 - fgx1, fgy2 - fgy1) + w3.randSchatten(fgx1, fgy1, fgx2 - fgx1, fgy2 - fgy1));
      spiegel.push(sprossenS_(fgx1, fgy1, fgx2 - fgx1, fgy2 - fgy1));
      spiegel.push(oeffnungsSymbol('fest', fgx1, fgy1, fgx2, fgy2, dickeStark * LINIE_SYMBOL));
      // Schiebeflügel. Von außen liegt er hinter dem Rahmen: sichtbar nur innerhalb der
      // Rahmenöffnung, der Rahmen bleibt rundum voll sichtbar (T S. 2).
      if (aussen) { sfx1 = Math.max(sfx1, ar); sfx2 = Math.min(sfx2, B - ar); sfy1 = Math.max(sfy1, ar); sfy2 = Math.min(sfy2, H - ar); }
      spiegel.push(w3.ring(sfx1, sfy1, sfx2 - sfx1, sfy2 - sfy1, farbe, strichInnen, dickeFein, afb));
      spiegel.push(w3.dichtung(sfx1, sfy1, sfx2 - sfx1, sfy2 - sfy1, dickeFein));
      if (!aussen) spiegel.push(gehrung(sfx1, sfy1, sfx2 - sfx1, sfy2 - sfy1, afb, dickeFein * 0.9, gehrungFarbe));
      var sgx1 = tx + mitte / 2, sgx2 = B - M('randBisGlasSchiebeseite');
      spiegel.push(glas(sgx1, gOben, sgx2 - sgx1, H - gUnten - gOben, dickeFein));
      spiegel.push(w3.glasReflex(sgx1, gOben, sgx2 - sgx1, H - gUnten - gOben) + w3.randSchatten(sgx1, gOben, sgx2 - sgx1, H - gUnten - gOben));
      spiegel.push(sprossenS_(sgx1, gOben, sgx2 - sgx1, H - gUnten - gOben));
      // Der Schiebepfeil steckt bereits im Kipp-Symbol (pskSymbol unten) — kein zweiter Pfeil,
      // sonst zwei Richtungssymbole im selben Flügel (Test „innen Griff + Schiebepfeil“, 1 pro Bild).
      var pskSymbol = oeffnungsSymbol('kipp', sgx1, gOben, sgx2, H - gUnten, dickeStark * LINIE_SYMBOL);
      // Pfeil im unteren Teil des Kipp-Dreiecks, frei von den Schenkeln (dort ist das Dreieck breit)
      var sgMitte = (sgx1 + sgx2) / 2, sgHalb = (sgx2 - sgx1) / 2, pfY = gOben + (H - gUnten - gOben) * 0.84;
      pskSymbol += pfeil(sgMitte + sgHalb * 0.48, sgMitte - sgHalb * 0.48, pfY, -schrift * 0.6, dickeStark * LINIE_SYMBOL);
      // Von außen gesehen kippt und schiebt der Flügel auf der Innenseite — also vom Betrachter weg.
      spiegel.push(aussen ? gestrichelt(pskSymbol, dickeStark * LINIE_SYMBOL) : pskSymbol);
      if (!aussen) {
        var fh = sfy2 - sfy1, gy = fh > 1700 ? sfy2 - M('griffHoehe') : sfy1 + fh / 2;
        teile.push(griff(X(B - rs - afb / 2), gy, griffStil, dickeFein * 1.25, griffFaktor(Math.max(B, H), afb, fh), 0));
      }
    } else {
      var sw = M('schwelleHoehe'), sOben = M('rahmenOben') + M('fuehrungLuft'), glO = M('randBisGlasOben'),
          glS = M('randBisGlasSeite'), glU = sw + M('fluegelProfilUnten') + M('glasrandUnten'), halb = afb / 2;
      teile.push(rechteck(ar, ar, B - 2 * ar, H - 2 * ar, w3.fuellung(farbe, false), 'none', 0));   // wie PSK: keine weißen Spalten
      teile.push(w3.ring(0, 0, B, H, farbe, strich, dickeStark, ar));
      // Schwelle/Bodenschiene bleibt eine flache Aluleiste (kein Holzdekor, kein Ringlicht — echtes
      // Profil ist hier ein separates Aluteil, keine Bestellfarbe).
      teile.push(profilFlaeche(0, H - sw, B, sw, '#c9ced3', strich, dickeFein));
      spiegel.push(gehrung(0, 0, B, H - sw, M('rahmenOben'), dickeFein, gehrungFarbe));
      var glasFestB = tx - halb - glS, glasFestH = H - M('festGlasUnten') - M('festGlasOben'),
          fest = w3.ring(sOben, sOben, tx + halb - sOben, H - sw - sOben, farbe, strichInnen, dickeFein, afb) +
                 w3.dichtung(sOben, sOben, tx + halb - sOben, H - sw - sOben, dickeFein) +
                 gehrung(sOben, sOben, tx + halb - sOben, H - sw - sOben, afb, dickeFein * 0.9, gehrungFarbe) +
                 glas(glS, M('festGlasOben'), glasFestB, glasFestH, dickeFein) +
                 w3.glasReflex(glS, M('festGlasOben'), glasFestB, glasFestH) + w3.randSchatten(glS, M('festGlasOben'), glasFestB, glasFestH) +
                 sprossenS_(glS, M('festGlasOben'), glasFestB, glasFestH) +
                 oeffnungsSymbol('fest', glS, M('festGlasOben'), tx - halb, H - M('festGlasUnten'), dickeStark * LINIE_SYMBOL);
      var sx1 = tx - halb, sx2 = B - sOben, glasSchB = B - glS - tx - halb, glasSchH = H - glU - glO,
          schiebe = w3.ring(sx1, sOben, sx2 - sx1, H - sw - sOben, farbe, strichInnen, dickeFein, afb) +
                    w3.dichtung(sx1, sOben, sx2 - sx1, H - sw - sOben, dickeFein) +
                    gehrung(sx1, sOben, sx2 - sx1, H - sw - sOben, afb, dickeFein * 0.9, gehrungFarbe) +
                    glas(tx + halb, glO, glasSchB, glasSchH, dickeFein) +
                    w3.glasReflex(tx + halb, glO, glasSchB, glasSchH) + w3.randSchatten(tx + halb, glO, glasSchB, glasSchH) +
                    sprossenS_(tx + halb, glO, glasSchB, glasSchH) +
                    (function (pf) { return aussen ? gestrichelt(pf, dickeStark * LINIE_SYMBOL) : pf; })(
                      pfeil(B - glS - glasSchB * 0.18, tx + halb + glasSchB * 0.18, glO + glasSchH * 0.55, schrift * 0.45, dickeStark * LINIE_SYMBOL));
      // Von innen liegt der Schiebeflügel vorn, von außen der Festflügel
      spiegel.push(aussen ? schiebe + fest : fest + schiebe);
      var hx = X(B - sOben - halb), hy = H - sw - M('griffHoehe');
      teile.push(aussen ? (k.abschliessbar ? griff(hx, hy, griffStil, dickeFein * 1.25, 1, 0, 'abschliessbar') : griffmulde(hx, hy, dickeFein, daten))
                        : hsGriff(hx, hy, griffStil, dickeFein * 1.25, daten, !!k.abschliessbar));
      /* Höhenkette vollständig: Element über der Schwelle + Schwelle = Gesamthöhe. Vorher stand
         links nur die „60“ (Design-Prüfung 16.09.2026, S4). */
      mass.push(massSenkrecht(0, H - sw, linksSchiebe, (H - sw) + '', schrift * 0.82, dickeFein, -1));
      mass.push(massSenkrecht(H - sw, H, linksSchiebe, sw + '', schrift * 0.82, dickeFein, -1, 1));
    }

    var gruppe = '<g' + (schiebeRechts ? '' : ' transform="matrix(-1 0 0 1 ' + z(B) + ' 0)"') + '>' + spiegel.join('') + '</g>';

    /* Aufsatzrollladen auf der Schiebetür — im Bestellweg ein eigener Schritt („Der Rollladen —
       Sicht- und Sonnenschutz als Aufsatzkasten“), live gezeichnet, im neuen Modul fehlte er
       (Lückensuche 17.09.2026). Gezeichnet wie beim Fenster: Kasten über dem Element, Gurt-
       wickler bzw. Motoranschluss neben dem Element, eigenes Maß links, Gesamthöhe rechts.
       Der Kasten liegt bei negativem y, damit die Elementmaße unverändert bleiben. */
    var rollH = k.rollladen ? aufsatzKasten(daten, systemId, k.rollladen, true) : 0,
        kasten = '', antriebSvg = '', massRechts = B + schrift * 0.9;
    if (rollH > 0) {
      var rSeite = k.rollladen.seite === 'links' ? 'links' : 'rechts',
          bedS = antriebAus(k.rollladen);
      kasten += '<g data-teil="rollladen">' + rechteck(0, -rollH, B, rollH, '#eef0f2', FARBE.strich, dickeStark) +
        linie(B * 0.04, -rollH * 0.3, B * 0.96, -rollH * 0.3, FARBE.strichFein, dickeFein) + '</g>';
      /* Gurtwickler/Kurbel/Motor: von außen nicht zu sehen. NICHT in `kasten` (das ganz vorn
         gezeichnet wird) — das Icon überlappt bewusst die Rahmenkante (Koordinator-Korrektur
         22.09.2026, „sitzt auf dem Fenster wie live") und würde vom danach gezeichneten Flügel/
         Rahmen (gruppe/teile) zur Hälfte übermalt. Stattdessen ganz zuletzt angehängt, wie beim
         Fenster (dort in `beschlag`). */
      /* Griffseite = Seite des Schiebeflügels (Griff sitzt an dessen Außenkante, siehe griff(X(B − rs …))).
         Ohne diese Angabe griff die Ausweichregel in antriebTeil() nicht, und der Gurtwickler lag auf
         dem Griff (Sichtprüfung 26.09.2026). */
      if (!aussen) antriebSvg = antriebTeil(bedS, rSeite === 'links', B, -rollH, 0, 0, H, 0, 0, dickeStark, dickeFein, rahmenFarbeZuBeschlagFarbe(farbe), uid, k.rollladen.antriebsart, ar,
                                           schiebeRechts ? 'rechts' : 'links');
      /* Führungsschienen in der Außenansicht wie am Fenster (61 mm, R S. 10/11) — gleiche Eigenschaft,
         gleiches Bild (Sichtprüfung 26.09.2026: an der Schiebetür fehlten sie). */
      if (aussen) {
        var schBS = fakt(daten, 'aufsatzrollladen', 'schiene.einseitig.masse')[0],
            schFarbeS = farbwert(k.schienenFarbe, farbe),
            schStrichS = istDunkel(schFarbeS) ? HELLE_LINIE : FARBE.strich;
        kasten += '<g data-teil="schiene">' + rechteck(-schBS, 0, schBS, H, schFarbeS, schStrichS, dickeFein) +
          rechteck(B, 0, schBS, H, schFarbeS, schStrichS, dickeFein) + '</g>';
        randL = Math.max(randL, schBS + schrift * 2.4);
        randR = Math.max(randR, schBS + schrift * 3.1);
      }
      var neben = aussen ? 0 : antriebAussen(bedS, H, k.rollladen.antriebsart, ar);
      if (rSeite === 'rechts') massRechts = B + neben + schrift * 0.9;
      var linksRoll = -schrift * 0.9; // Kastenhöhe dicht am Kasten, der Wickler hängt tiefer (26.09.2026)
      mass.push(massSenkrecht(-rollH, 0, linksRoll, rollH + '', schrift, dickeFein, -1, -1));
      mass.push(massSenkrecht(-rollH, H, massRechts + schrift * 1.7, (rollH + H) + '', schrift, dickeFein));
      randO += rollH;
      randR = Math.max(randR, massRechts - B + schrift * 3.1);
      if (rSeite === 'links') randL = Math.max(randL, neben + schrift * 2.4);
    }
    mass.push(massWaagerecht(0, B, -rollH - schrift * 0.9, B + '', schrift, dickeFein));
    mass.push(massSenkrecht(0, H, massRechts, H + '', schrift, dickeFein));
    var ansichtTextS = titelMitPos(k, aussen ? 'Ansicht von außen' : 'Ansicht von innen');
    var unterschrift, zeileY;
    if (kompakt) {
      zeileY = H + schrift * 2.4;
      unterschrift = ansichtsZeileKompakt(ansichtTextS, B / 2, zeileY, schrift);
    } else {
      unterschrift = '<text x="' + z(B / 2) + '" y="' + z(H + schrift * 2.4) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + ansichtTextS + '</text>' +
        '<text x="' + z(B / 2) + '" y="' + z(H + schrift * 3.55) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + HINWEIS + '</text>';
      zeileY = H + schrift * 4.5;
      if (aussen) {
        unterschrift += '<text data-teil="legende" x="' + z(B / 2) + '" y="' + z(H + schrift * 4.35) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * 0.66) + '" fill="' + FARBE.strichFein + '">' + LEGENDE_STRICH + '</text>';
        zeileY += schrift * 0.95; randU += schrift * 0.95;
      }
      if (k.farbName) {
        unterschrift += '<text x="' + z(B / 2) + '" y="' + z(zeileY) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * 0.8) + '" fill="' + FARBE.strichFein + '">' + esc(k.farbName) + '</text>';
        zeileY += schrift * 1.05;
      }
      if (k.schriftfeld) {
        var sfbS = schriftfeldBlock(k, B, H, daten, zeileY, schrift, B / 2, dickeFein);
        unterschrift += sfbS.svg;
        randU = Math.max(randU, sfbS.zeileY - H + schrift * 0.2);
        randL = Math.max(randL, (sfbS.breite - B) / 2 + schrift * 0.4);
        randR = Math.max(randR, (sfbS.breite - B) / 2 + schrift * 0.4);
      }
    }
    if (!kompakt) {
      randL = randFuerHinweis(randL, Math.max(B, bue.b), schrift);
      randR = randFuerHinweis(randR, Math.max(B, bue.b), schrift);
    }
    var vb = buehnenAusschnitt(bue, -randL, -randO, B + randL + randR, H + randO + randU, randL, randR, randO, randU);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + z(vb.box[0]) + ' ' + z(vb.box[1]) + ' ' + z(vb.box[2]) + ' ' + z(vb.box[3]) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="' + beschriftung(k, B, H) + '">' +
      '<defs>' + glasDef(glasMotivAus(k), bue.bezug) + TIEFE_DEF + GRIFF_DEFS + w3.defs.join('') + '</defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, kasten + teile[0] + (teile.length > 2 && bauart === 'hs' ? teile[1] : '') + gruppe + teile.slice(bauart === 'hs' ? 2 : 1).join('') + antriebSvg + mass.join('') + unterschrift) +
      '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  /* ======================================================= Vorsatzrollladen
   * Belege: Bericht 10-vorsatzrollladen.md (17.09.2026), Drutex-Blätter RA 45 / RA OW und
   * Katalog Rollläden. Gezeichnet wird NUR die Außenansicht: Der Vorsatzrollladen sitzt vor dem
   * Fenster, und ob er an der Fassade oder in der Leibung montiert ist, fragt der Bestellweg
   * nicht ab — eine Innenansicht wäre geraten. Gurt, Kurbel und Motor sitzen innen und sind
   * von außen nicht zu sehen.
   * Maßbezug wie im Bestellweg („Breite und Höhe des fertigen Rollladens — Kasten
   * eingerechnet“); Drutex selbst nennt keinen Maßbezug (offene Frage, Bericht 10).
   * Belegte Maße: Kastenhöhen je Form und Größe, Führungsschiene 53 × 22 mm (37/42-mm-Lamelle)
   * bzw. 66 × 27 mm (55 mm), extrudierte Endleiste 55 mm, Lamellenhöhen 37/42/55. */
  var ROLL_KASTEN = { eckig: { id: 'ra45', groessen: [137, 165, 180, 205], name: 'RA 45°' },
                      rund:  { id: 'raow', groessen: [139, 167, 182], name: 'RA OW (oval)' },
                      // RA 90°P (Unterputz): rechtwinkliger Kasten ohne Schräge/Rundung (recherche/
                      // rollladen-drutex.md 3.1: „rechtwinklig“, Revision „von unten“ statt „von vorne“).
                      // Kastenmaße nur als EINE Zahl je Größe belegt (skizze-daten.json
                      // vorsatzrollladen["ra90p.kastenmasse"] = [137,165,180,205]) — bei RA 45° steht
                      // an derselben Katalogstelle Tiefe = Höhe = 137 (kasten137.hoehe = kasten137.tiefe
                      // = 137), also Quadratkasten; dieselbe Tabellenform gilt laut Recherche auch für
                      // RA 90°P. Kastenhöhe = Kastengröße ist deshalb eine begründete Zeichenannahme
                      // (kein eigener „.hoehe“-Beleg für ra90p in skizze-daten.json), keine erfundene
                      // Zahl. Lamellenhöhen: Korrektur 22.09.2026 (quellen/roleta_ra_90_p_de.pdf PDF-S. 1,
                      // „Verfügbare Aluminiumlamellen: 37 mm, 42 mm, 55 mm“) — 55 mm ist für RA 90°P
                      // belegt (siehe recherche/rollladen-drutex.md §3.9, Korrekturvermerk); nur die
                      // Insektenschutz-Kombination mit 55 mm bleibt gesperrt (dieselbe Fußnote + R S. 22 —
                      // die Doppel-Führungsschiene mit Insektenschutz gibt es nur für H37/H42).
                      eckig90: { id: 'ra90p', groessen: [137, 165, 180, 205], name: 'RA 90°P (Unterputz)', kastenQuadrat: true, lamellenhoehen: [37, 42, 55], insektenschutzKaesten: [165, 180, 205] } };

  function zeichneVorsatzrollladen(k, daten, uid) {
    if (!daten) throw new Error('Keine Skizzen-Daten übergeben');
    // Antrieb prüfen, auch wenn er von außen nicht zu sehen ist: ein unbelegter Antrieb ist
    // ein Bestellfehler und darf keine Skizze bekommen.
    if (k.bedienung) antriebAus({ bedienung: k.bedienung });
    var V = function (e) { return fakt(daten, 'vorsatzrollladen', e); },
        Z = function (e) { return zeichenmass(daten, 'vorsatzrollladen', e); },
        form = (k.kasten && k.kasten.form) || 'eckig',
        kf = ROLL_KASTEN[form];
    if (!kf) throw new Error('Unbekannte Kastenform: ' + form);
    var groesse = +((k.kasten && k.kasten.groesse) || kf.groessen[0]);
    if (kf.groessen.indexOf(groesse) < 0) {
      throw new Error('Kasten ' + kf.name + ' ' + groesse + ' mm ist nicht belegt');
    }
    var lamelle = +(k.lamelle || 37);
    var lamellenhoehen = kf.lamellenhoehen || V(kf.id + '.lamellenhoehen');
    if (lamellenhoehen.indexOf(lamelle) < 0) {
      throw new Error('Lamellenhöhe ' + lamelle + ' mm ist für ' + kf.name + ' nicht belegt');
    }
    if (k.panzerFarbeName && V('panzer.farben.' + lamelle).indexOf(k.panzerFarbeName) < 0) {
      throw new Error('Panzerfarbe „' + k.panzerFarbeName + '“ gibt es bei ' + lamelle + '-mm-Lamellen nicht');
    }
    // RA 90°P hat in skizze-daten.json keine eigene "insektenschutzKaesten"-Liste — Recherche 3.9
    // nennt für RA 45°/90°/90°P gemeinsam „nur Kastengrößen 165, 180, 205“, deshalb dieselbe Liste
    // wie RA 45° als begründete Zeichenannahme, nicht die volle Größenliste.
    var insektKaesten = kf.insektenschutzKaesten || V(kf.id + '.insektenschutzKaesten');
    if (k.insektenschutz && insektKaesten.indexOf(groesse) < 0) {
      throw new Error('Insektenschutz ist für Kasten ' + kf.name + ' ' + groesse + ' mm nicht belegt');
    }
    // Korrektur 22.09.2026: 55-mm-Lamelle ist für alle drei Kastenformen belegt (RA 90°P siehe
    // ROLL_KASTEN.eckig90 oben), Insektenschutz aber nur mit der Doppel-Führungsschiene für
    // H37/H42 (R S. 22 / roleta_ra_90_p_de.pdf PDF-S. 1, Fußnote) — diese eine Kombination bleibt
    // gesperrt, unabhängig vom Kastenmaß.
    if (k.insektenschutz && lamelle === 55) {
      throw new Error('Insektenschutz gibt es nicht bei 55-mm-Lamellen');
    }

    // RA 90°P: kein eigener ".kastenNNN.hoehe"-Beleg — dieselbe Katalogstelle nennt bei RA 45°
    // Tiefe = Höhe = Kastengröße (Quadratkasten, siehe Kommentar an ROLL_KASTEN.eckig90).
    var kh = kf.kastenQuadrat ? groesse : V(kf.id + '.kasten' + groesse + '.hoehe'),
        schiene = V(lamelle === 55 ? 'schiene.h55.masse' : 'schiene.einseitig.masse')[Z('schieneAussenIndex')],
        endleiste = V('endleiste.extrudiert'),
        B = Math.max(+k.b || 1200, 400), H = Math.max(+k.h || 1400, kh + 300),
        kastenFarbe = farbwert(k.kastenFarbe, WEISS), schienenFarbe = farbwert(k.schienenFarbe, kastenFarbe),
        panzerFarbe = farbwert(k.panzerFarbe, '#d9dde1'), endleisteFarbe = farbwert(k.endleisteFarbe, panzerFarbe),
        bue = buehne(k, B, H),
        dickeStark = bue.bezug / 330, dickeFein = dickeStark * 0.62, schrift = bue.bezug / 22 * schriftFaktor,
        randL = massRand(schrift * 3.2, schrift), randR = massRand(schrift * 2.4, schrift),
        randO = massRand(schrift * 2.6, schrift), randU = schrift * 4.2,
        teile = [], mass = [];
    var strichK = istDunkel(kastenFarbe) ? HELLE_LINIE : FARBE.strich,
        strichS = istDunkel(schienenFarbe) ? HELLE_LINIE : FARBE.strich,
        strichP = istDunkel(panzerFarbe) ? HELLE_LINIE : FARBE.strichFein;

    // Öffnung hinter dem Panzer (das Fenster selbst ist hier nicht Teil der Bestellung)
    var ox = schiene, ob = B - 2 * schiene, oy = kh, oh = H - kh,
        unten = oy + oh * Z('panzerStellung');
    teile.push(rechteck(ox, oy, ob, oh, '#f3f5f7', 'none', 0));
    // Panzer mit Einzellamellen, jede zweite minimal heller/dunkler (rollPanzer) — bei dunklen
    // Panzerfarben (Design-Prüfung: RAL 9005/Anthrazit) sonst eine einzige schwarze Fläche.
    var panzerH = Math.max(0, unten - endleiste - oy);
    var panzer = rollPanzer(ox, oy, ob, panzerH, lamelle, panzerFarbe, strichP, dickeFein, panzerH);
    teile.push(panzer);
    teile.push('<g data-teil="endleiste">' + rechteck(ox, unten - endleiste, ob, endleiste, endleisteFarbe, FARBE.strich, dickeFein) + '</g>');
    // Führungsschienen
    teile.push('<g data-teil="schiene">' + rechteck(0, kh, schiene, oh, schienenFarbe, strichS, dickeFein) +
               rechteck(B - schiene, kh, schiene, oh, schienenFarbe, strichS, dickeFein) + '</g>');
    // Kasten, mit der Linie, an der Schräge bzw. Rundung beginnen
    var kante = kh * Z('rundeKanteAnteil');
    // RA 90°P: reines Rechteck, keine Schräge (RA 45°) und keine Rundung (RA OW) — deshalb ohne die
    // Anteilslinie, die bei den beiden anderen Formen markiert, wo Schräge/Rundung beginnt.
    teile.push('<g data-teil="kasten" data-form="' + form + '">' + rechteck(0, 0, B, kh, kastenFarbe, strichK, dickeStark) +
               (form === 'eckig90' ? '' : linie(0, kante, B, kante, strichK, dickeFein * 0.7) +
               (form === 'rund' ? linie(0, kante + (kh - kante) * 0.5, B, kante + (kh - kante) * 0.5, strichK, dickeFein * 0.45) : '')) +
               '</g>');

    // Maße: Breite oben, Gesamthöhe rechts, Kasten | Rest links, Schiene unten
    mass.push(massWaagerecht(0, B, -schrift * 0.9, B + '', schrift, dickeFein));
    mass.push(massSenkrecht(0, H, B + schrift * 0.9, H + '', schrift, dickeFein));
    mass.push(massSenkrecht(0, kh, -schrift * 0.9, kh + '', schrift * 0.82, dickeFein, -1, -1));
    mass.push(massSenkrecht(kh, H, -schrift * 0.9, (H - kh) + '', schrift * 0.82, dickeFein, -1));

    var uy = H, zeileY = uy + schrift * 4.5,
        unterschrift = '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 2.4) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + titelMitPos(k, 'Ansicht von außen') + '</text>' +
          '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 3.55) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + HINWEIS + '</text>';
    if (k.farbName) {
      unterschrift += '<text x="' + z(B / 2) + '" y="' + z(zeileY) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
        z(schrift * 0.8) + '" fill="' + FARBE.strichFein + '">' + esc(k.farbName) + '</text>';
      zeileY += schrift * 1.05;
    }
    if (k.schriftfeld) {
      var sf = typeof k.schriftfeld === 'object' ? k.schriftfeld : {}, zeilen = [];
      if (sf.titel) zeilen.push({ t: esc(sf.titel), fett: true });
      zeilen.push({ t: 'Rollladen gesamt, Kasten eingerechnet: ' + B + ' × ' + H + ' mm' });
      zeilen.push({ t: 'Kasten ' + kf.name + ' · ' + groesse + ' mm · Lamelle ' + lamelle + ' mm' });
      if (k.panzerFarbeName) zeilen.push({ t: 'Panzer: ' + esc(k.panzerFarbeName) });
      /* Antrieb und Bedienseite sitzen innen — in der Außenansicht des Vorsatzrollladens sind sie
         nicht zu sehen. Gewählt hat der Kunde sie trotzdem (Bestellweg „Der Antrieb“). */
      if (k.bedienung) {
        zeilen.push({ t: 'Antrieb: ' + ANTRIEB_NAME[antriebAus({ bedienung: k.bedienung })] +
                        ' · Bedienung ' + (k.seite === 'links' ? 'links' : 'rechts') });
      }
      // Immer eine Zeile, nicht nur bei „mit“ — sonst ist eine explizite „Ohne“-Wahl im
      // Schriftfeld nicht von „nichts gewählt“ zu unterscheiden (Regel 6, Abdeckungs-Wächter).
      zeilen.push({ t: k.insektenschutz ? 'mit Insektenschutz' : 'ohne Insektenschutz' });
      if (+k.anzahl > 1) zeilen.push({ t: (+k.anzahl) + ' × dieses Element' });
      if (sf.farbe) zeilen.push({ t: esc(sf.farbe) });
      if (sf.montage) zeilen.push({ t: esc(sf.montage) });
      zusatzZeilen(sf, zeilen);
      zeilen = schriftfeldUmbruch(zeilen);
      unterschrift += '<g data-teil="schriftfeld">' + linie(B * 0.08, zeileY - schrift * 0.35, B * 0.92, zeileY - schrift * 0.35, FARBE.strichFein, dickeFein * 0.6);
      zeileY += schrift * 0.55;
      zeilen.forEach(function (zl) {
        unterschrift += '<text x="' + z(B / 2) + '" y="' + z(zeileY) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif"' +
          (zl.fett ? ' font-weight="700"' : '') + (zl.forts ? ' data-forts="1"' : '') + ' font-size="' + z(schrift * 0.74) + '" fill="' + FARBE.massText + '">' + zl.t + '</text>';
        zeileY += schrift * 0.98;
      });
      unterschrift += '</g>';
      randU = Math.max(randU, zeileY - H + schrift * 0.2);
      var laengste = zeilen.reduce(function (m, zl) { return Math.max(m, zl.t.length); }, 0) * schrift * 0.74 * 0.52;
      randL = Math.max(randL, (laengste - B) / 2 + schrift * 0.4);
      randR = Math.max(randR, (laengste - B) / 2 + schrift * 0.4);
    }
    randL = randFuerHinweis(randL, Math.max(B, bue.b), schrift);
    randR = randFuerHinweis(randR, Math.max(B, bue.b), schrift);
    var vbX = -randL, vbY = -randO, vbB = B + randL + randR, vbH = H + randO + randU;
    var vb = buehnenAusschnitt(bue, vbX, vbY, vbB, vbH, randL, randR, randO, randU);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + z(vb.box[0]) + ' ' + z(vb.box[1]) + ' ' + z(vb.box[2]) + ' ' + z(vb.box[3]) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="Vorsatzrollladen, Rollladenmaß (Kasten eingerechnet) ' + B + ' mal ' + H +
      ' Millimeter, Ansicht von außen"><defs>' + GRIFF_DEFS + '</defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, teile.join('') + mass.join('') + unterschrift) +
      '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  /* ======================================================= Kopplung (eigenes Produkt)
   * Belege: Katalog kopplung.mjs (df-skizzen-zuordnung, Stand 22.09.2026), K S. 18/19 — Drutex
   * nennt Kopplungen nur pauschal als Zusatzprofil, keine Profilbreite, kein Maß, jede Option
   * "auf Anfrage". Einzige belegte Zeichenmasse ist `laenge` (Katalog-Merkmal). Die Kopplungsart
   * (Katalog-Commit 89b1f7f, 22.09.2026, Quelle MARKT, vorläufig) entscheidet die Ansicht:
   *   - statisch/h: ANSICHT (wie bisher) — zwei SCHEMATISCHE Nachbarelemente (gestrichelt, kein
   *     bestelltes Bauteil) stehend nebeneinander mit dem Kopplungsprofil in echter Farbe
   *     dazwischen (Stufe 3: flache Fläche + Gehrungs-Lichtkanten, siehe profilFlaeche/gehrung).
   *     `h` bekommt zusätzlich zwei dünne Linien im Profilband als H-Steg-Andeutung
   *     (Zeichenannahme, kein Maß).
   *   - eck90/winkel: DRAUFSICHT — zwei Element-Schenkel treffen im Winkel an einem
   *     schematischen Eckpfosten aufeinander, dahinter gestrichelte Wandlinien. eck90 fest im
   *     rechten Winkel; winkel mit einem Beispielwinkel (KOPPLUNG_WINKEL_GRAD, Zeichenannahme —
   *     Drutex nennt keinen Wert) und einem Winkelbogen-Symbol OHNE Zahl (Regel 2: keine
   *     unbelegte Maßangabe).
   * Profilbreite/Schenkellänge: keine Systemquelle nennt sie — Zeichenannahme wie zuvor an der
   * (entfernten) Nachbarschafts-Zeichnung des Fensters; nur `laenge` selbst ist belegt und wird
   * nur in der Ansicht (statisch/h) als Maßzahl gezeigt — in der Draufsicht macht eine einzelne
   * Maßkette an einem von zwei ungleich langen Schenkeln keinen Sinn, deshalb keine Zahl dort. */
  var KOPPLUNG_ELEMENT_ANTEIL = 0.62; // Zeichenannahme: Nachbarelement ~62 % der Kopplungslänge
  var KOPPLUNG_WINKEL_GRAD = 135; // Zeichenannahme: Beispielwinkel der freien Winkelkopplung, Katalog nennt keinen Wert
  var KOPPLUNG_ART_NAME = { statisch: 'Statische Kopplung', h: 'H-Kopplung', eck90: 'Eckkopplung 90°', winkel: 'Variable Winkelkopplung' };
  var KOPPLUNG_DRAUFSICHT_HINWEIS = 'Elemente schematisch, Winkel/Wand als Beispiel — kein bestelltes Bauteil';

  function zeichneKopplung(k, daten, uid) {
    var artName = KOPPLUNG_ART_NAME[k.kopplungsart];
    if (!artName) throw new Error('Unbekannte Kopplungsart: ' + k.kopplungsart);
    var laenge = +k.laenge;
    if (!(laenge > 0)) throw new Error('Keine Kopplungslänge übergeben');
    var farbe = farbwert(k.farbeAussen, WEISS),
        strichF = istDunkel(farbe) ? HELLE_LINIE : FARBE.strich;
    if (k.kopplungsart === 'statisch' || k.kopplungsart === 'h') {
      return zeichneKopplungAnsicht(k, daten, uid, k.kopplungsart, laenge, farbe, strichF, artName);
    }
    return zeichneKopplungDraufsicht(k, daten, uid, k.kopplungsart, laenge, farbe, strichF, artName);
  }

  /* statisch/h: gerade Kopplung stehend zwischen zwei Elementen (unverändert seit 22.09.2026,
   * nur Titel/Schriftfeld sprechen jetzt die Kopplungsart statt „Richtung“ aus). */
  function zeichneKopplungAnsicht(k, daten, uid, art, laenge, farbe, strichF, artName) {
    var elementMass = Math.max(200, Math.round(laenge * KOPPLUNG_ELEMENT_ANTEIL)),
        profilB = Math.max(30, Math.round(laenge * 0.035)); // Zeichenannahme, wie die entfernte Nachbarschafts-Fuge
    var B = elementMass * 2 + profilB, H = laenge;
    var bue = buehne(k, B, H),
        dickeStark = bue.bezug / 330, dickeFein = dickeStark * 0.62, schrift = bue.bezug / 22 * schriftFaktor,
        randL = schrift * 2.6, randR = schrift * 2.6, randO = schrift * 2.6, randU = schrift * 4.4,
        teile = [], mass = [];
    var nachbar = function (x, y, b, h) {
      return '<g data-teil="kopplung-nachbar">' +
        rechteck(x, y, b, h, 'none', FARBE.strichFein, dickeFein,
                 ' stroke-dasharray="' + z(dickeFein * 3.2) + ' ' + z(dickeFein * 2.2) + '"') + '</g>';
    };
    var profil = function (x, y, b, h) {
      var s = '<g data-teil="kopplung-profil">' + profilFlaeche(x, y, b, h, farbe, strichF, dickeStark) +
        gehrung(x, y, b, h, Math.min(b, h) * 0.16, dickeFein, kanteWeich(farbe));
      if (art === 'h') {
        // H-Steg-Andeutung: zwei dünne senkrechte Linien im Profilband (Zeichenannahme, kein
        // belegtes Profilbild — reine Andeutung „H", keine Maßzahl, Regel 2).
        var l1 = x + b * 0.32, l2 = x + b * 0.68;
        s += linie(l1, y + h * 0.08, l1, y + h * 0.92, strichF, dickeFein) +
             linie(l2, y + h * 0.08, l2, y + h * 0.92, strichF, dickeFein);
      }
      return s + '</g>';
    };
    teile.push(nachbar(0, 0, elementMass, H));
    teile.push(profil(elementMass, 0, profilB, H));
    teile.push(nachbar(elementMass + profilB, 0, elementMass, H));
    // Länge = Höhe: Maßkette rechts außen, wie bei jedem anderen Element.
    mass.push(massSenkrecht(0, H, B + schrift * 0.9, laenge + '', schrift, dickeFein));
    // Keine Maßzahl für die Profilbreite: Drutex nennt keine, profilB ist reine Zeichenannahme (Regel 2, 22.09.2026).
    var uy = H, zeileY = uy + schrift * 4.5,
        unterschrift = '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 2.4) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + titelMitPos(k, artName) + '</text>' +
          '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 3.55) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + HINWEIS + '</text>' +
          '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 4.15) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">Nachbarelemente gestrichelt: kein bestelltes Bauteil, nur Schema</text>';
    zeileY += schrift * 0.6;
    var sfBlock = schriftfeldBlock(k, B, laenge, daten, zeileY, schrift, B / 2, dickeFein);
    unterschrift += sfBlock.svg;
    randU = Math.max(randU, sfBlock.zeileY - H + schrift * 0.2);
    randL = Math.max(randL, (sfBlock.breite - B) / 2 + schrift * 0.4);
    randR = Math.max(randR, (sfBlock.breite - B) / 2 + schrift * 0.4);
    var nachbarHinweisBreite = 'Nachbarelemente gestrichelt: kein bestelltes Bauteil, nur Schema'.length * schrift * HINWEIS_G * 0.52;
    randL = Math.max(randL, (nachbarHinweisBreite - B) / 2 + schrift * 0.4);
    randR = Math.max(randR, (nachbarHinweisBreite - B) / 2 + schrift * 0.4);
    randL = randFuerHinweis(randL, Math.max(B, bue.b), schrift);
    randR = randFuerHinweis(randR, Math.max(B, bue.b), schrift);
    var vb = buehnenAusschnitt(bue, -randL, -randO, B + randL + randR, H + randO + randU, randL, randR, randO, randU);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + z(vb.box[0]) + ' ' + z(vb.box[1]) + ' ' + z(vb.box[2]) + ' ' + z(vb.box[3]) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="' + esc(artName) + ', Länge ' + laenge +
      ' Millimeter"><defs></defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, teile.join('') + mass.join('') + unterschrift) +
      '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  /* eck90/winkel: Draufsicht — zwei Element-Schenkel (schematisch, gestrichelt) treffen an einem
   * Eckpfosten (Vollfläche in Profilfarbe) aufeinander; die zweite Schenkelrichtung ist die
   * erste, um den Winkel um den Eckpfosten gedreht (eck90: 90°, winkel: KOPPLUNG_WINKEL_GRAD).
   * Wandlinien gestrichelt hinter den Schenkeln deuten die Ecke im Baukörper an. Keine Maßzahlen
   * außer der Katalog-Länge (die hier keinen einzelnen Schenkel eindeutig beschreibt und deshalb
   * nicht gezeichnet wird, Regel 2) — bei winkel zusätzlich ein Winkelbogen ohne Gradzahl. */
  /* wandSeite dreht NUR die Wandlinie um (nicht die Schenkel-Kontur selbst): läuft man den
     Streckenzug vom fernen Ende von Schenkel A über den Eckpfosten zum fernen Ende von Schenkel B
     durch, liegt die Außenseite (Wand) bei Schenkel A auf der „Rechts vom Blickwinkel“-Normale,
     bei Schenkel B auf deren Gegenrichtung — sonst knickt die gestrichelte Wandlinie am Pfosten
     nach INNEN statt außen weiter (Koordinator-Fund 22.09.2026, erste Fassung). */
  function kopplungSchenkel(px, py, winkelGrad, laenge, tiefe, wandSeite) {
    var r = winkelGrad * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), nx = -dy, ny = dx;
    var fx = px + dx * laenge, fy = py + dy * laenge, ws = wandSeite || 1;
    return {
      naeher1: { x: px + nx * tiefe / 2, y: py + ny * tiefe / 2 },
      fern1: { x: fx + nx * tiefe / 2, y: fy + ny * tiefe / 2 },
      fern2: { x: fx - nx * tiefe / 2, y: fy - ny * tiefe / 2 },
      naeher2: { x: px - nx * tiefe / 2, y: py - ny * tiefe / 2 },
      wandAussen1: { x: px + nx * tiefe * 0.85 * ws, y: py + ny * tiefe * 0.85 * ws },
      wandAussen2: { x: fx + nx * tiefe * 0.85 * ws, y: fy + ny * tiefe * 0.85 * ws },
      end: { x: fx, y: fy }
    };
  }
  function zeichneKopplungDraufsicht(k, daten, uid, art, laenge, farbe, strichF, artName) {
    var winkelGrad = art === 'eck90' ? 90 : KOPPLUNG_WINKEL_GRAD;
    var schenkelLaenge = Math.max(200, Math.round(laenge * KOPPLUNG_ELEMENT_ANTEIL)),
        tiefe = Math.max(60, Math.round(schenkelLaenge * 0.16)), // Zeichenannahme: Element-/Wandtiefe in der Draufsicht
        eck = Math.max(50, Math.round(tiefe * 1.15)); // schematischer Eckpfosten (Quadrat), Zeichenannahme
    // Schenkel A entlang 180° (nach links), Schenkel B um winkelGrad dazu gedreht (Regel: Winkel
    // zwischen den Schenkeln = winkelGrad, so wie im Katalog benannt).
    var schenkelA = kopplungSchenkel(0, 0, 180, schenkelLaenge, tiefe, 1),
        schenkelB = kopplungSchenkel(0, 0, 180 - winkelGrad, schenkelLaenge, tiefe, -1);
    var punkte = [schenkelA.naeher1, schenkelA.fern1, schenkelA.fern2, schenkelA.naeher2,
      schenkelB.naeher1, schenkelB.fern1, schenkelB.fern2, schenkelB.naeher2,
      { x: -eck / 2, y: -eck / 2 }, { x: eck / 2, y: eck / 2 }];
    var minX = Math.min.apply(null, punkte.map(function (p) { return p.x; })),
        maxX = Math.max.apply(null, punkte.map(function (p) { return p.x; })),
        minY = Math.min.apply(null, punkte.map(function (p) { return p.y; })),
        maxY = Math.max.apply(null, punkte.map(function (p) { return p.y; }));
    var dxOff = -minX, dyOff = -minY, B = maxX - minX, H = maxY - minY,
        v = function (p) { return { x: p.x + dxOff, y: p.y + dyOff }; };
    var bue = buehne(k, B, H),
        dickeStark = bue.bezug / 330, dickeFein = dickeStark * 0.62, schrift = bue.bezug / 22 * schriftFaktor,
        randL = schrift * 2.6, randR = schrift * 2.6, randO = schrift * 2.6, randU = schrift * 4.4;
    var poly = function (p1, p2, p3, p4, fuell, kontur, dicke, extra) {
      var q1 = v(p1), q2 = v(p2), q3 = v(p3), q4 = v(p4);
      return '<polygon points="' + [q1, q2, q3, q4].map(function (q) { return z(q.x) + ',' + z(q.y); }).join(' ') +
        '" fill="' + fuell + '" stroke="' + kontur + '" stroke-width="' + z(dicke) + '"' + (extra || '') + ' />';
    };
    var wandLinie = function (s) {
      var a = v(s.wandAussen1), b = v(s.wandAussen2);
      return linie(a.x, a.y, b.x, b.y, FARBE.strichFein, dickeFein * 0.8,
        ' stroke-dasharray="' + z(dickeFein * 2.6) + ' ' + z(dickeFein * 1.8) + '"');
    };
    var teile = '<g data-teil="kopplung-schenkel">' +
      poly(schenkelA.naeher1, schenkelA.fern1, schenkelA.fern2, schenkelA.naeher2, 'none', FARBE.strichFein, dickeFein,
        ' stroke-dasharray="' + z(dickeFein * 3.2) + ' ' + z(dickeFein * 2.2) + '"') +
      poly(schenkelB.naeher1, schenkelB.fern1, schenkelB.fern2, schenkelB.naeher2, 'none', FARBE.strichFein, dickeFein,
        ' stroke-dasharray="' + z(dickeFein * 3.2) + ' ' + z(dickeFein * 2.2) + '"') +
      wandLinie(schenkelA) + wandLinie(schenkelB) + '</g>';
    var eckPfosten = (function () {
      var e1 = v({ x: -eck / 2, y: -eck / 2 }), e2 = v({ x: eck / 2, y: eck / 2 });
      return '<g data-teil="kopplung-eckpfosten">' +
        rechteck(e1.x, e1.y, e2.x - e1.x, e2.y - e1.y, farbe, strichF, dickeStark) + '</g>';
    })();
    var winkelBogen = '';
    if (art === 'winkel') {
      // Winkelbogen-Symbol OHNE Gradzahl (Regel 2: kein unbelegter Wert) — deutet nur an, dass
      // der Winkel variabel ist, nicht den festen rechten Winkel von eck90.
      var r = Math.max(eck * 1.3, tiefe * 1.6),
          p1v = v({ x: Math.cos(180 * Math.PI / 180) * r, y: Math.sin(180 * Math.PI / 180) * r }),
          p2v = v({ x: Math.cos((180 - winkelGrad) * Math.PI / 180) * r, y: Math.sin((180 - winkelGrad) * Math.PI / 180) * r });
      winkelBogen = '<g data-teil="kopplung-winkelbogen">' +
        '<path d="M ' + z(p1v.x) + ' ' + z(p1v.y) + ' A ' + z(r) + ' ' + z(r) + ' 0 0 1 ' + z(p2v.x) + ' ' + z(p2v.y) +
        '" fill="none" stroke="' + FARBE.strichFein + '" stroke-width="' + z(dickeFein) + '" />' + '</g>';
    }
    var uy = H, zeileY = uy + schrift * 4.5,
        unterschrift = '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 2.4) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + titelMitPos(k, artName) + '</text>' +
          '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 3.55) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">Draufsicht · ' + HINWEIS + '</text>' +
          '<text x="' + z(B / 2) + '" y="' + z(uy + schrift * 4.15) + '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + KOPPLUNG_DRAUFSICHT_HINWEIS + '</text>';
    zeileY += schrift * 0.6;
    var sfBlock = schriftfeldBlock(k, B, laenge, daten, zeileY, schrift, B / 2, dickeFein);
    unterschrift += sfBlock.svg;
    randU = Math.max(randU, sfBlock.zeileY - H + schrift * 0.2);
    randL = Math.max(randL, (sfBlock.breite - B) / 2 + schrift * 0.4);
    randR = Math.max(randR, (sfBlock.breite - B) / 2 + schrift * 0.4);
    var hinweisBreite = KOPPLUNG_DRAUFSICHT_HINWEIS.length * schrift * HINWEIS_G * 0.52;
    randL = Math.max(randL, (hinweisBreite - B) / 2 + schrift * 0.4);
    randR = Math.max(randR, (hinweisBreite - B) / 2 + schrift * 0.4);
    randL = randFuerHinweis(randL, Math.max(B, bue.b), schrift);
    randR = randFuerHinweis(randR, Math.max(B, bue.b), schrift);
    var vb = buehnenAusschnitt(bue, -randL, -randO, B + randL + randR, H + randO + randU, randL, randR, randO, randU);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + z(vb.box[0]) + ' ' + z(vb.box[1]) + ' ' + z(vb.box[2]) + ' ' + z(vb.box[3]) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="' + esc(artName) + ', Draufsicht"><defs></defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, teile + eckPfosten + winkelBogen + unterschrift) +
      '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  var skizzenZaehler = 0;

  /* Darstellungsgröße (29.09.2026, Betrieb: „Skizze zu klein, Maßeinzeichnung groß genug?“): gemessen auf
     8960 standen die Maßzahlen bei 11–13 px (Rechner) bzw. 7–9 px (Handy) gegen 16 px Fließtext, die
     Maßlinien bei 0,25–0,45 px. Der Motor rechnet Schrift und Linien in mm relativ zum Element und kennt
     die Bildschirmgröße nicht. Mit `darstellung: { pxBreite, pxHoehe, schriftPx, liniePx }` nennt der
     Aufrufer die Anzeigefläche; der Motor skaliert Schrift und Linien so, dass die KLEINSTE Maßzahl
     mindestens schriftPx und die dünnste Maßlinie mindestens liniePx am Bildschirm hat (nur Maßlinien werden dicker, Rahmen und Symbole bleiben). Weil die Ränder mit
     der Schrift wachsen (und die Zeichnung dadurch kleiner wird), wird bis zu fünfmal nachgerechnet.
     Nur vergrößern, nie verkleinern. Ohne `darstellung` zeichnet der Motor genau wie bisher. */
  var schriftFaktor = 1, linienFaktor = 1;
  /* Ohne Beschriftung: alles entfernen, was keine reine Maßzahl ist — auch Unterschriften der Produkte, die
     keine Kompaktzeile haben (Rollladen, Kopplung). Ein neuer Text im Bild fällt so nie wieder durch. */
  function beschriftungWeg(k, svg) {
    if (!k || k.ohneBeschriftung !== true || typeof svg !== 'string') return svg;
    /* Maßzahlen bleiben, ebenso das Wort einer offenen Kette („Breite“) — es steht an Stelle der Zahl. */
    return svg.replace(/<text\b[^>]*>([^<]*)<\/text>/g, function (ganz, inhalt) { return /^\s*\d+\s*$/.test(inhalt) || /data-offen="1"/.test(ganz) ? ganz : ''; });
  }
  /* Glas ohne Musterverweis (30.09.2026, Betrieb: „manchmal ist das Glas nicht mehr blau, ganz zufällig“):
     Stehen mehrere Skizzen mit derselben Kennung im DOM (Bühne im Übergang, Kopien), zeigt url(#…-glas) auf
     ein Muster, das gerade entfernt oder versteckt ist — der Browser malt dann weiß/durchsichtig. Klarglas
     bekommt deshalb die Farbe DIREKT; Ornament-/Mattglas behält das Muster, aber mit Ersatzfarbe
     (SVG-Paint-Fallback „url(#id) #farbe“): fehlt das Muster, bleibt es blau statt weiß. */
  var SYMBOL_HELL = '#e8eef2';
  function relLeuchte(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function glasDirekt(svg) {
    if (typeof svg !== 'string') return svg;
    var m = /<pattern id="([^"]*-glas|skz-glas)" data-motiv="([^"]+)"/.exec(svg);
    if (!m) return svg;
    var klar = m[2] === 'klar', id = m[1], ton = GLAS_MOTIV[m[2]] && GLAS_MOTIV[m[2]].ton;
    if (ton) {
      svg = svg.split('fill="url(#' + id + ')"').join('fill="' + ton + '" data-glas="ton"');
      /* Dunkles Glas (Black Line, Mirastar): das Öffnungssymbol in Petrol-Grau verschwände darin — hell zeichnen.
         Kontrast hell auf #5b6a74 ≈ 4,7 : 1, auf #6e808c ≈ 3,5 : 1 (Grafiken mind. 3 : 1, WCAG 1.4.11). */
      if (relLeuchte(ton) < 0.25) svg = svg.split('stroke="' + FARBE.symbol + '"').join('stroke="' + SYMBOL_HELL + '"');
      return svg;
    }
    return svg.split('fill="url(#' + id + ')"').join(klar ? 'fill="' + FARBE.glas + '" data-glas="klar"'
      : 'fill="url(#' + id + ') ' + FARBE.glas + '" data-glas="muster"');
  }
  /* Nach außen öffnende Systeme (IGLO EXT, IGLO PREMIER): Die DIN-Bezeichnung „Dreh rechts/links“ gilt nach
     DIN 107 von der Seite, zu der der Flügel aufgeht — hier also von AUSSEN. Die Zuordnung liefert sie so
     (2fl-ext-pf = dreh-r, dreh-l). Von innen gesehen liegt das Band damit auf der anderen Seite: jede Richtung
     wird gespiegelt, die Reihenfolge bleibt. Beleg Drutex K S. 28/29 (Foto IGLO EXT von innen): Bänder außen
     am Rahmen, Griffe zur Mitte. Bis 30.09.2026 lagen Griff und Band vertauscht, beim Stulp beide Bänder am
     Stulp (Fund der Öffnungsvarianten-Sitzung). Preiszuordnung unberührt — nur die Zeichnung. */
  var SPIEGEL_RICHTUNG = { 'dk-r': 'dk-l', 'dk-l': 'dk-r', 'dreh-r': 'dreh-l', 'dreh-l': 'dreh-r' };
  function fluegelVonInnen(fluegel, nachAussen) {
    if (!nachAussen || !Array.isArray(fluegel)) return fluegel;
    return fluegel.map(function (f) {
      var kopie = {};
      for (var s in f) if (Object.prototype.hasOwnProperty.call(f, s)) kopie[s] = f[s];
      if (SPIEGEL_RICHTUNG[kopie.oeffnung]) kopie.oeffnung = SPIEGEL_RICHTUNG[kopie.oeffnung];
      return kopie;
    });
  }
  function systemOeffnetNachAussen(daten, systemId) {
    var id = ALTE_SCHLUESSEL[systemId] || systemId, d = daten && daten[id];
    return !!(d && d.oeffnungsrichtung && d.oeffnungsrichtung.wert === 'nach außen');
  }
  /* Öffnung im Klartext — EINE Quelle für Schriftfeld, Warenkorb, Übersicht und Anfrage-Mail (30.09.2026,
     Befund K10 Kundenweg: dort stand nur der Kartenname, die Anschlagseite je Flügel fehlte für die
     Drutex-Bestellung). Aus denselben Codes wie die Zeichnung, nach außen öffnend gespiegelt. */
  function oeffnungsZeile(k, daten) {
    var nachAussen = systemOeffnetNachAussen(daten, k.system);
    return 'Öffnung, von innen gesehen: ' + oeffnungText(fluegelVonInnen((k.fluegel && k.fluegel.length) ? k.fluegel : [{ oeffnung: 'dk-r' }],
      nachAussen)) + (nachAussen ? ' · öffnet nach außen' : '');
  }
  function lichtZeilen(k) {
    var z = [];
    /* 30.09.2026 (1d/e7): Die Licht-Öffnung wird VOR den Maßen gewählt — die Zeile steht deshalb auch ohne Höhe da
       („Oberlicht: Kipp“), mit Höhe wie bisher („Oberlicht 400 mm: Kipp“). */
    var mm = function (l) { return +l.hoehe > 0 ? ' ' + (+l.hoehe) + ' mm' : ''; };
    if (k.oberlicht) {
      z.push('Oberlicht' + mm(k.oberlicht) + ': ' + (LICHT_NAME[k.oberlicht.oeffnung || 'fest'] || esc(k.oberlicht.oeffnung)) +
             ((k.oberlicht.oeffnung === 'kipp' && k.oberlicht.bedienung !== 'griff') ? ' mit Oberlichtöffner' : ''));
    }
    if (k.unterlicht) {
      z.push('Unterlicht' + mm(k.unterlicht) + ': ' + (LICHT_NAME[k.unterlicht.oeffnung || 'fest'] || esc(k.unterlicht.oeffnung)));
    }
    return z;
  }
  /* Klartext für Warenkorb, Übersicht und Anfrage-Mail (Wortlaut 1d/7a, 30.09.2026): je Flügel Bänder- und
     Griffseite, Trenner nennt Pfosten/Stulp. Nach außen öffnend ohne DIN-Seitenwort (die Seite gilt dort von
     außen und verwirrt), Premier-Kipp ohne Bandangabe (Drutex nennt die Lage nicht). Das Schriftfeld der Skizze
     bleibt kurz (oeffnungsZeile). Aus denselben, ggf. gespiegelten Codes wie die Zeichnung. */
  var KLAR_INNEN = { 'dk-l': 'Dreh-Kipp links (Bänder links, Griff rechts)', 'dk-r': 'Dreh-Kipp rechts (Bänder rechts, Griff links)',
                     'dreh-l': 'Dreh links (Bänder links, Griff rechts)', 'dreh-r': 'Dreh rechts (Bänder rechts, Griff links)',
                     'kipp': 'Kipp (Bänder unten)', 'fest': 'fest verglast' };
  var KLAR_AUSSEN = { 'dk-l': 'Dreh-Kipp (Bänder links, Griff rechts)', 'dk-r': 'Dreh-Kipp (Bänder rechts, Griff links)',
                      'dreh-l': 'Dreh (Bänder links, Griff rechts)', 'dreh-r': 'Dreh (Bänder rechts, Griff links)',
                      'kipp': 'Kipp nach außen', 'fest': 'fest verglast' };
  function oeffnungKlartext(k, daten) {
    k = k || {}; daten = daten || global.SKIZZE_DATEN;
    var nachAussen = systemOeffnetNachAussen(daten, k.system), namen = nachAussen ? KLAR_AUSSEN : KLAR_INNEN,
        fl = fluegelVonInnen((k.fluegel && k.fluegel.length) ? k.fluegel : [{ oeffnung: 'dk-r' }], nachAussen), t = '';
    fl.forEach(function (f, i) {
      if (i > 0) t += f.stulp ? ' · ohne Mittelsteg (Stulp) · ' : ' · mit Mittelsteg (Pfosten) · ';
      t += namen[f.oeffnung || 'dk-r'] || String(f.oeffnung);
    });
    return [t + (nachAussen ? ' · von innen gesehen, öffnet nach außen' : ' · von innen gesehen')].concat(lichtZeilen(k));
  }
  /* Export für die Oberfläche: dieselben Zeilen wie im Schriftfeld (Fenster/Balkontür), Wortlaut identisch. */
  function oeffnungZeilen(k, daten) {
    k = k || {}; daten = daten || global.SKIZZE_DATEN;
    return [oeffnungsZeile(k, daten)].concat(lichtZeilen(k));
  }
  /* massOffen (30.09.2026, Betriebs Vorschlag): Maße, die der Kunde noch nicht eingegeben hat, zeichnet die Skizze
     mit dem Beispielmaß, ihre Maßkette aber grau gestrichelt und mit dem Wort statt der Zahl. So ist der Platz für
     die Ketten von Anfang an da (kein Sprung, wenn das echte Maß kommt), und niemand hält das Beispiel für sein Maß. */
  var OFFEN_GRAU = '#b8bec5', OFFEN_WORT = { breite: 'Breite', hoehe: 'Höhe', oberlicht_hoehe: 'Oberlicht', unterlicht_hoehe: 'Unterlicht' };
  var massOffenListe = [];
  /* Ober-/Unterlichthöhe: über die Kennung der Kette markieren, nicht über die Zahl — sonst würde ein gleich
     hohes Unterlicht mit grau, obwohl nur das Oberlicht offen ist. */
  function offenWenn(art, svg) {
    if (!art || !OFFEN_WORT[art] || massOffenListe.indexOf(art) < 0 || !svg) return svg;
    return svg.replace(/^<g( data-teil="[^"]*")?>((?:<line [^>]*\/>){3})(<text [^>]*>)(\d+)(<\/text>)<\/g>$/, function (g, dt, linien, tAuf, zahl, tZu) {
      return offenGruppe(dt, linien, tAuf, OFFEN_WORT[art], tZu, zahl);
    });
  }
  /* Offene Kette: gestrichelt, Wort statt Zahl. Grau — außer sie ist gerade hervorgehoben (der Kunde tippt dieses
     Maß): dann in der Akzentfarbe, damit er sieht, welche Kette er ändert (4e, 30.09.2026). */
  /* Das Wort ist länger als die Zahl, für die Lage und Ausweichen berechnet wurden. Passt die Zahl in ihre Strecke, das
     Wort aber nicht, rückt das Wort wie eine kurze Zahl um einen Endstrich weiter nach außen — sonst läuft es durch die
     Endstriche (Wächter „Zahlen frei“, 30.09.2026: „Oberlicht“/„Unterlicht“/„Breite“ auf der Handy-Bühne). */
  function offenTextVerschieben(linien, tAuf, wort, zahl) {
    var l = /<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/.exec(linien),
        fs = +((/font-size="([\d.]+)"/.exec(tAuf) || [])[1]), tx = /\bx="([-\d.]+)"/.exec(tAuf), ty = /\by="([-\d.]+)"/.exec(tAuf);
    if (!l || !fs || !tx || !ty) return tAuf;
    var waag = l[2] === l[4], seg = waag ? Math.abs(l[3] - l[1]) : Math.abs(l[4] - l[2]),
        passtZahl = seg >= textLaenge(zahl || '', fs) + fs * 0.6, passtWort = seg >= textLaenge(wort, fs) + fs * 0.6;
    if (!passtZahl || passtWort) return tAuf;
    var t = fs * 0.34;
    if (waag) {
      var neuY = +ty[1] + (+ty[1] < +l[2] ? -t : t);
      return tAuf.replace(/\by="[-\d.]+"/, 'y="' + z(neuY) + '"');
    }
    var neuX = +tx[1] + (+tx[1] < +l[1] ? -t : t);
    return tAuf.replace(/\bx="[-\d.]+"/, 'x="' + z(neuX) + '"').replace(/rotate\(-90 [-\d.]+ /, 'rotate(-90 ' + z(neuX) + ' ');
  }
  function offenGruppe(dt, linien, tAuf, wort, tZu, zahl) {
    if (wort && zahl) tAuf = offenTextVerschieben(linien, tAuf, wort, zahl);
    var aktiv = /hervorhebung/.test(dt || ''), farbe = aktiv ? AKZENT : OFFEN_GRAU;
    var l = linien.replace(/stroke="[^"]*"/g, 'stroke="' + farbe + '"').replace(/\/>/g, ' stroke-dasharray="6 5"/>');
    return '<g data-teil="mass-offen"' + (aktiv ? ' data-hervor="1"' : '') + '>' + l +
      tAuf.replace(/fill="[^"]*"/, 'fill="' + farbe + '"').replace(/font-weight="700"/, 'font-weight="600"').replace(/^<text/, '<text data-offen="1"') + wort + tZu + '</g>';
  }
  function massOffenMarkieren(k, svg) {
    var offen = k && Array.isArray(k.massOffen) ? k.massOffen : [];
    if (!offen.length || typeof svg !== 'string') return svg;
    /* Fenster/Balkontür markieren über die Kettenkennung (offenWenn) — über die Zahl kollidierte es, wenn Breite und
       Beispielhöhe gleich sind (1200/1200: die Breitenkette wurde mit grau, gemessen auf 8960, 30.09.2026). */
    var fensterArt = !k.produkt || k.produkt === 'fenster' || k.produkt === 'balkon',
        wOffen = offen.indexOf('breite') >= 0, sOffen = offen.indexOf('hoehe') >= 0;
    /* Offene Richtung (Betrieb, Bild 43, 30.09.2026: Beispielbreite 1750, Flügelkette zeigte „875 | 875“ —
       „Das darf nicht sein.“): Solange Breite oder Höhe offen ist, zeigt KEINE Kette dieser Richtung eine Zahl —
       Flügelteilung, Pfosten, Seitenteile, Ober-/Unterlicht, Kasten, Gesamtmaß mit Verbreiterung. Die Kette
       selbst bleibt (grau gestrichelt, ohne Zahl), damit die Skizze beim Eintippen nicht springt.
       Die Hauptkette bekommt das Wort („Breite“/„Höhe“): Fenster/Balkontür schon im Zeichner (offenWenn),
       die übrigen Produkte hier — Breite nur an waagerechten, Höhe nur an senkrechten Ketten. */
    return svg.replace(/<g( data-teil="[^"]*")?>((?:<line [^>]*\/>){3})(<text [^>]*>)(\d+)(<\/text>)<\/g>/g, function (ganz, dt, linien, tAuf, zahl, tZu) {
      var l = /<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/.exec(linien);
      if (!l) return ganz;
      var waagerecht = l[2] === l[4];
      if (waagerecht ? !wOffen : !sOffen) return ganz;
      if (!fensterArt && ((waagerecht && String(+k.b) === zahl) || (!waagerecht && String(+k.h) === zahl)))
        return offenGruppe(dt, linien, tAuf, waagerecht ? 'Breite' : 'Höhe', tZu, zahl);
      return offenGruppe(dt, linien, '', '', '');
    });
  }
  /* Mit darstellung (Bühne) steht das Element waagerecht in der Mitte: linker und rechter Rand gleich. Vorher lag
     es 6–7 px rechts der Mitte, weil links Platz für eine Maßkette reserviert ist, die es nicht immer gibt. */
  function mittig(k, svg) {
    if (!k || !k.darstellung || k.bezugsmass || typeof svg !== 'string') return svg;   // bezugsmass: Bühne zentriert selbst
    if (k.produkt && ['fenster', 'balkon', 'schiebe'].indexOf(k.produkt) < 0) return svg;
    var m = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg);
    if (!m) return svg;
    var vb = k.verbreiterung || {}, x0 = -(+vb.links || 0), x1 = (+k.b || 0) + (+vb.rechts || 0);
    if (!(x1 > x0)) return svg;
    var vx = +m[1], vw = +m[3], links = x0 - vx, rechts = vx + vw - x1, rand = Math.max(links, rechts);
    return svg.replace(m[0], 'viewBox="' + z(x0 - rand) + ' ' + m[2] + ' ' + z(x1 - x0 + 2 * rand) + ' ' + m[4] + '"');
  }
  function zeichne(k, daten) {
    k = k || {};
    return glasDirekt(massOffenMarkieren(k, beschriftungWeg(k, zeichneMitDarstellung(k, daten))));
  }
  function zeichneMitDarstellung(k, daten) {
    if (!k.darstellung) { schriftFaktor = 1; linienFaktor = 1; return zeichneEinmal(k, daten); }
    var d = k.darstellung, pxB = +d.pxBreite, pxH = +d.pxHoehe, sPx = +d.schriftPx || 16, lPx = +d.liniePx || 1;
    if (!(pxB > 0) || !(pxH > 0)) throw new Error('darstellung braucht pxBreite und pxHoehe (>0)');
    var kk = {}, svg, i, besteSvg = null, elB = Math.max(+k.b || 1200, 200), elH = Math.max(+k.h || 1400, 200);
    Object.keys(k).forEach(function (x) { if (x !== 'darstellung') kk[x] = k[x]; });
    schriftFaktor = 1; linienFaktor = 1;
    /* Das Element behält mindestens 55 % der Fläche (Breite ODER Höhe, je nachdem, was begrenzt) —
       reicht der Platz nicht für die Wunschschrift, gewinnt die Zeichnung, und die Schrift wird so groß,
       wie es dann geht. Faktoren je Durchgang höchstens ×1,5 (die Ränder wachsen mit). */
    function messen(t) {
      var vb = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(t);
      if (!vb) return null;
      var ms = Math.min(pxB / +vb[3], pxH / +vb[4]), fs = [], ls = [], m,
          reT = /font-weight="700" font-size="([\d.]+)"[^>]*>(\d+)<\/text>/g, reL = new RegExp('<line [^>]*stroke="' + FARBE.massLinie + '"[^>]*stroke-width="([\\d.]+)"', 'g');   // nur Maßlinien
      while ((m = reT.exec(t))) fs.push(+m[1]);
      while ((m = reL.exec(t))) if (+m[1] > 0) ls.push(+m[1]);
      return { fsPx: fs.length ? Math.min.apply(null, fs) * ms : sPx, lnPx: ls.length ? Math.min.apply(null, ls) * ms : lPx,
               anteil: Math.max(elB * ms / pxB, elH * ms / pxH) };
    }
    try {
      for (i = 0; i < 6; i++) {
        var sF = schriftFaktor, lF = linienFaktor;
        svg = mittig(k, zeichneEinmal(kk, daten));
        var w = messen(svg);
        if (!w) return svg;
        if (w.anteil < 0.55 && besteSvg) break;          // zu weit: letzter Stand, der noch Platz ließ
        besteSvg = svg;
        /* Auf den Zielwert hin (±2 %), in beide Richtungen (Faktor 0,5 … ) — sonst lag die Schrift je nach
           Maß mal bei 15,9, mal bei 17,4 px, und die Skizze sprang beim Tippen (Betrieb 30.09.2026). */
        var fS = Math.abs(w.fsPx / sPx - 1) > 0.02 ? Math.max(Math.min(sPx / w.fsPx, 1.5), 0.67) : 1,
            fL = w.lnPx < lPx * 0.98 ? Math.min(lPx / w.lnPx, 1.5) : 1;
        if (fS === 1 && fL === 1) break;
        schriftFaktor = Math.max(sF * fS, 0.5); linienFaktor = lF * fL;
        if (schriftFaktor === sF && linienFaktor === lF) break;
      }
      return besteSvg || svg;
    } finally { schriftFaktor = 1; linienFaktor = 1; }
  }
  function zeichneEinmal(k, daten) {
    tuerAlu = null; tuerFluegelBreit = false;
    daten = daten || global.SKIZZE_DATEN;
    eigenschaftenPruefen(k);
    ohneMasse = k.ohneMasse === true;
    ohneBeschriftung = k.ohneBeschriftung === true;
    if (k.hervorheben != null && HERVORHEBBAR.indexOf(k.hervorheben) < 0) throw new Error('hervorheben kennt nur ' + HERVORHEBBAR.join(', '));
    hervorheben = k.hervorheben || null;
    massOffenListe = Array.isArray(k.massOffen) ? k.massOffen.slice() : [];
    massOffenListe.forEach(function (m) {
      if (['breite', 'hoehe', 'oberlicht_hoehe', 'unterlicht_hoehe'].indexOf(m) < 0) throw new Error('massOffen kennt nur breite, hoehe, oberlicht_hoehe, unterlicht_hoehe');
    });
    kastenAttr = kastenAus(k);
    // Alle „F“ einer Zeichnung gleich hoch: 4 % der größeren Elementseite (Zeichenannahme, Lesbarkeit).
    festKennungH = Math.max(+k.b || 1200, +k.h || 1400) * 0.04;
    /* Eigene Kennung je Skizze: `idPraefix` für Seiten, die dieselbe Zeichnung mehrfach zeigen
       (Neubau: Handy-Kopie unter den Maßen, Desktop-Kopie in der Seitenspalte). Mit der
       gleichen Kennung zeigten die Verweise der sichtbaren Kopie auf die ausgeblendete, und Chrome
       malte das Glas weiß (Fund der Konfigurator-Sitzung, 17.09.2026). Nur Buchstaben, Ziffern,
       Bindestrich und Unterstrich. */
    var uid = k.idPraefix ? String(k.idPraefix).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40) : '';
    if (!uid) uid = 's' + (++skizzenZaehler);
    if (k.produkt === 'haustuer') return zeichneHaustuer(k, daten, uid);
    if (k.produkt === 'schiebe') return zeichneSchiebe(k, daten, uid);
    if (k.produkt === 'rollladen') return zeichneVorsatzrollladen(k, daten, uid);
    if (k.produkt === 'kopplung') return zeichneKopplung(k, daten, uid);

    /* --- Stufe 3 (nur hier, siehe Kopf der Datei) ------------------------- */
    var defsStufe3 = [], verlaufCache = {}, musterCache = {}, stufe3Zaehler = 0, randSchattenCacheFenster = {};
    /* Hex-Farbe Richtung Weiß/Schwarz mischen — für die dezente Lichtkante am Profil.
       Kein CSS-Filter (überlebt die PNG-Rasterung für die Mail nicht zuverlässig, siehe
       Kommentar bei glasFlaeche oben), reines Rechnen auf den RGB-Kanälen. */
    function stufe3Mischen(hex, richtung, anteil) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16),
          z2 = richtung === 'hell' ? 255 : 0;
      r = Math.round(r + (z2 - r) * anteil); g = Math.round(g + (z2 - g) * anteil); b = Math.round(b + (z2 - b) * anteil);
      function hh(v) { return ('0' + v.toString(16)).slice(-2); }
      return '#' + hh(r) + hh(g) + hh(b);
    }
    /* Verlauf hell (Fasenlicht oben links) -> Bestellfarbe -> dunkel (Schatten unten rechts),
       je Farbe nur einmal angelegt. */
    function stufe3Verlauf(hex) {
      if (!verlaufCache[hex]) {
        var id = 'skz-verl' + (++stufe3Zaehler),
            hell = stufe3Mischen(hex, 'hell', 0.30), dunkel = stufe3Mischen(hex, 'dunkel', 0.32);
        defsStufe3.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + hell + '"/>' +
          '<stop offset="0.45" stop-color="' + hex + '"/>' +
          '<stop offset="1" stop-color="' + dunkel + '"/></linearGradient>');
        verlaufCache[hex] = id;
      }
      return 'url(#' + verlaufCache[hex] + ')';
    }
    /* Holzdekor-Musterkachel, eingebettet als Data-URI (nachgebaut aus realismus/generate.py,
       vom Betrieb am Realismus-Blatt mitgeprüft). Senkrechte Profile bekommen die um 90° gedrehte
       Maserung, damit sie an der Gehrung wie ein Profilstab und nicht wie eine Fliese wirkt. */
    function stufe3Muster(vertikal) {
      var key = vertikal ? 'v' : 'h';
      if (!musterCache[key]) {
        var id = 'skz-holz' + (++stufe3Zaehler);
        // Design-Review 2. Runde (22.09.2026): die Holzdekor-Kachel steht viel kontrastreicher da
        // als der flache Verlauf der Unifarben — auf dem Blatt wirkt Golden Oak „lauter" als Weiß/
        // Anthrazit daneben. Eine dünne weiße Auflage über der Kachel (selbe Technik, keine neue
        // Bilddatei, Regel 3 „nur Vektor" bleibt gewahrt) dämpft die Maserung, ohne den Farbton zu
        // verändern, damit alle Folien ähnlich kräftig wirken.
        // Design-Review 4. Runde (22.09.2026, "verpixelt"): die Kachel ist jetzt 192x64 px (statt
        // 80x80) und läuft LANG entlang der Maserung — im Pattern deshalb im selben Seitenverhältnis
        // (34 x 11,33, Faktor 3:1) statt gestaucht auf ein Quadrat, sonst wirken die feinen Linien
        // wieder wie grobe Blöcke.
        defsStufe3.push('<pattern id="' + id + '" width="34" height="11.33" patternUnits="userSpaceOnUse"' +
          (vertikal ? ' patternTransform="rotate(90)"' : '') + '>' +
          '<image href="data:image/png;base64,' + HOLZ_TILE_B64 + '" x="0" y="0" width="34" height="11.33"/>' +
          '<rect x="0" y="0" width="34" height="11.33" fill="#ffffff" fill-opacity="0.16"/></pattern>');
        musterCache[key] = id;
      }
      return 'url(#' + musterCache[key] + ')';
    }
    /* Fläche für ein Profil (Rahmen, Flügel, Pfosten, Kämpfer): Holzdekor -> Musterkachel,
       sonst dezenter Lichtverlauf in der Bestellfarbe. `vertikal` steuert nur die Maserung. */
    function stufe3Fuellung(hex, vertikal) {
      return farbNameHolz ? stufe3Muster(vertikal) : stufe3Verlauf(hex);
    }
    /* Gehrungsring (Betrieb 21.09.2026: „die Maserung läuft nur in eine Richtung, das sieht aus
       wie ein Kamm“ — jedes Profil war bis dahin EIN Rechteck mit EINER Musterrichtung).
       Ein Profilring (Rahmen, Flügel, Pfosten, Stulp) wird jetzt aus vier auf Gehrung
       geschnittenen Trapezen gebaut — oben/unten waagerechte Maserung, links/rechts senkrechte,
       genau wie an einem echten Profilstab. Bei einem schmalen Stab (Pfosten, Stulp) ist die
       Ringtiefe automatisch die halbe Stärke, die vier Trapeze werden dann zu vier Dreiecken, die
       sich in der Mittelachse treffen — an einem Kämpfer oder Pfosten passt das, weil dort kein
       Glas mehr „im Ring“ sichtbar wird. `ringTiefe` (optional) gibt die tatsächlich sichtbare
       Profilbreite vor (Rahmen: sys.arb, Flügel: sys.afb) — dann bleibt in der Mitte die Fläche
       stehen, die später vom Glas/Flügel überdeckt wird. Unifarben bekommen dieselbe
       Lichtrichtung wie der bisherige Verlauf (oben/links hell, unten/rechts dunkel), aber FLACH
       je Seite statt als Verlauf — noch näher an Regel 4 „flach“ als der Diagonal-Verlauf vorher. */
    /* Design-Prüfung 22.09.2026 (Referenztafel `referenz/tafel-rahmen.png` und das freigegebene
       `realismus/realismus-stufen.png`): 0.22/0.24 war viel zu kräftig — Weiß wurde zur grauen
       Fläche, Anthrazit zum fast schwarzen Bilderrahmen. Echtes PVC bleibt fast einfarbig, nur
       eine sehr leise Fasenkante. Jetzt ~3 % heller (oben/links), 4–6 % dunkler (unten/rechts). */
    /* 29.09.2026 (Betrieb an der Festverglasung: „Wir brauchen überall die gleiche Tiefe“): die flächige
       Tönung je Seite (oben/links 3 % heller, unten/rechts 5 % dunkler) ließ auf Weiß Rahmen und Glasleiste
       links/oben zu EINEM Band verschmelzen, rechts/unten hob sich der Rahmen dunkel ab — gleich breite
       Seiten wirkten ungleich tief. Jetzt alle vier Seiten in derselben Farbe; Tiefe nur noch über die
       dünnen Licht-/Schattenkanten und die Gehrungsfuge. `licht` bleibt als Parameter für die Aufrufer. */
    function stufe3RingFuellung(hex, vertikal, licht) {
      if (farbNameHolz) return stufe3Muster(vertikal);
      return hex;
    }
    // Wahrgenommene Helligkeit (0-255) — steuert, wie kräftig die Lichtkante gezeichnet wird:
    // auf Weiß ist eine helle Kante unsichtbar (dort trägt der Schattenrand die Kontur), auf
    // Anthrazit/dunklen Folien ist genau umgekehrt die HELLE Kante das einzige sichtbare Signal
    // (Design-Review 3. Runde 22.09.2026: "Lichtkanten zu schwach, auf Anthrazit unsichtbar").
    function stufe3Luminanz(hex) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    function stufe3RingPfad(pkt, fuell) {
      return '<path d="M' + pkt.map(function (p) { return z(p[0]) + ' ' + z(p[1]); }).join(' L') +
        ' Z" fill="' + fuell + '" stroke="none"/>';
    }
    /* Feine Oberflächenmodulation (2–3 % Deckkraft) — dieselbe feste Punktkachel wie bei der
       Haustür (stufe3WerkzeugeTuer.rauschen), hier lokal, weil zeichne() ihre eigenen Stufe-3-
       Werkzeuge hat. KEIN feTurbulence-Filter (siehe Kommentar am Kopf der Datei, Zeile ~513). */
    var stufe3RauschenId = null;
    function stufe3RauschenPattern() {
      if (!stufe3RauschenId) {
        var id = 'skz-rauschen' + (++stufe3Zaehler),
            punkte = [[3, 4, 0.9], [9, 2, 0.6], [15, 7, 0.8], [21, 3, 0.7], [5, 11, 0.7], [13, 13, 0.9],
                      [19, 15, 0.6], [2, 19, 0.8], [10, 21, 0.7], [17, 20, 0.9], [23, 11, 0.6], [7, 17, 0.8]],
            inner = punkte.map(function (p) {
              return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.6" fill="' +
                ((p[0] + p[1]) % 2 === 0 ? '#000000' : '#ffffff') + '" fill-opacity="' + p[2] + '"/>';
            }).join('');
        defsStufe3.push('<pattern id="' + id + '" width="24" height="24" patternUnits="userSpaceOnUse">' + inner + '</pattern>');
        stufe3RauschenId = id;
      }
      return stufe3RauschenId;
    }
    function stufe3Rauschen(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      return '<rect x="' + z(x) + '" y="' + z(y) + '" width="' + z(b) + '" height="' + z(h) +
        '" fill="url(#' + stufe3RauschenPattern() + ')" opacity="0.03" pointer-events="none"/>';
    }
    function profilRing(x, y, b, h, hex, kontur, dicke, ringTiefe) {
      var tMax = Math.min(b, h) / 2,
          t = Math.max(0, Math.min(ringTiefe == null ? tMax : ringTiefe, tMax));
      if (!(b > 0 && h > 0)) return '';
      if (t < 0.05) return rechteck(x, y, b, h, stufe3RingFuellung(hex, h > b, null), kontur, dicke);
      var ix1 = x + t, iy1 = y + t, ix2 = x + b - t, iy2 = y + h - t;
      /* Design-Review 22.09.2026: dieselbe dritte Stufe wie am w3.ring() der Tür — eine schmale
         Falzbande zwischen Blendrahmenkontur und Lichtkante. */
      var bandT = Math.max(0.5, t * 0.16), bandIn = Math.max(0.3, t * 0.18),
          // Auf dunklen Folien (Anthrazit & Co.) trägt die HELLE Kante die Fasenwirkung, auf
          // hellen Folien (Weiß) die dunkle — je nach Grundhelligkeit gegenläufig eingesetzt,
          // damit auf beiden Extremen ETWAS sichtbar bleibt (Design-Review 3. Runde 22.09.2026).
          dunkelFarbe = farbNameHolz ? null : stufe3Luminanz(hex),
          hellKante = dunkelFarbe !== null && dunkelFarbe < 140,
          hellOpazitaet = hellKante ? 0.55 : 0.22,
          dunkelOpazitaet = hellKante ? 0.22 : 0.5,
          mitreFarbe = farbNameHolz ? '#3a2a16' : stufe3Mischen(hex, 'dunkel', 0.35);
      return '<g data-teil="profilring">' +
        stufe3RingPfad([[x, y], [x + b, y], [ix2, iy1], [ix1, iy1]], stufe3RingFuellung(hex, false, 'hell')) +
        stufe3RingPfad([[x, y], [ix1, iy1], [ix1, iy2], [x, y + h]], stufe3RingFuellung(hex, true, 'hell')) +
        stufe3RingPfad([[x, y + h], [ix1, iy2], [ix2, iy2], [x + b, y + h]], stufe3RingFuellung(hex, false, 'dunkel')) +
        stufe3RingPfad([[x + b, y], [x + b, y + h], [ix2, iy2], [ix2, iy1]], stufe3RingFuellung(hex, true, 'dunkel')) +
        (t > 1.2 ? '<rect x="' + z(x + bandIn) + '" y="' + z(y + bandIn) + '" width="' + z(Math.max(0, b - 2 * bandIn)) +
          '" height="' + z(Math.max(0, h - 2 * bandIn)) + '" fill="none" stroke="' +
          stufe3Mischen(hex, 'dunkel', 0.07) + '" stroke-opacity="0.45" stroke-width="' + z(bandT) + '"/>' : '') +
        /* Gehrungsnaht: die vier Diagonalen, an denen die Trapeze aufeinandertreffen, waren
           bisher konturlos — auf dem Referenzfoto (referenz/tafel-rahmen.png) ist genau dort die
           sichtbare Fuge. Eine dünne, gedeckte Linie je Ecke macht die Gehrung lesbar, ohne die
           Fläche selbst zu verändern. */
        '<g stroke="' + mitreFarbe + '" stroke-opacity="0.4" stroke-width="' + z(Math.max(0.4, t * 0.05)) + '">' +
          '<line x1="' + z(x) + '" y1="' + z(y) + '" x2="' + z(ix1) + '" y2="' + z(iy1) + '"/>' +
          '<line x1="' + z(x + b) + '" y1="' + z(y) + '" x2="' + z(ix2) + '" y2="' + z(iy1) + '"/>' +
          '<line x1="' + z(x) + '" y1="' + z(y + h) + '" x2="' + z(ix1) + '" y2="' + z(iy2) + '"/>' +
          '<line x1="' + z(x + b) + '" y1="' + z(y + h) + '" x2="' + z(ix2) + '" y2="' + z(iy2) + '"/>' +
        '</g>' +
        /* Fasenlicht oben/links, Fasenschatten unten/rechts — als eigene, dünne Kantenlinie statt
           Flächenmischung (die Flächenmischung bleibt bei 3-5 %, siehe stufe3RingFuellung/
           Design-Prüfung 22.09.2026: höher gemischt wurde Weiß grau und Anthrazit fast schwarz).
           Die Opazität kehrt sich mit der Grundhelligkeit um (hellKante), damit auf JEDER Farbe
           mindestens eine Kante sichtbar bleibt. */
        (t > 1.2 ? ('<line x1="' + z(ix1) + '" y1="' + z(iy1) + '" x2="' + z(ix2) + '" y2="' + z(iy1) +
          '" stroke="#ffffff" stroke-opacity="' + hellOpazitaet + '" stroke-width="' + z(bandT * 0.6) + '"/>' +
          '<line x1="' + z(ix1) + '" y1="' + z(iy1) + '" x2="' + z(ix1) + '" y2="' + z(iy2) +
          '" stroke="#ffffff" stroke-opacity="' + hellOpazitaet + '" stroke-width="' + z(bandT * 0.6) + '"/>' +
          '<line x1="' + z(ix1) + '" y1="' + z(iy2) + '" x2="' + z(ix2) + '" y2="' + z(iy2) +
          '" stroke="#000000" stroke-opacity="' + dunkelOpazitaet + '" stroke-width="' + z(bandT * 0.6) + '"/>' +
          '<line x1="' + z(ix2) + '" y1="' + z(iy1) + '" x2="' + z(ix2) + '" y2="' + z(iy2) +
          '" stroke="#000000" stroke-opacity="' + dunkelOpazitaet + '" stroke-width="' + z(bandT * 0.6) + '"/>') : '') +
        '<rect x="' + z(x) + '" y="' + z(y) + '" width="' + z(b) + '" height="' + z(h) +
          '" fill="none" stroke="' + (kontur || 'none') + '" stroke-width="' + (dicke || 0) + '"/>' +
        '</g>';
    }
    var sys = systemMasse(daten, k.system, k.ansicht === 'aussen'),
        B = Math.max(+k.b || 1200, 200),
        /* Höhenbezug wie im Live-Konfigurator (deinefenster.de, Schritt „Höhe der Lichter“):
           „Die Höhe oben ist die des Hauptfensters. Das Licht kommt oben bzw. unten dazu.“
           `k.h` ist also das Hauptfenster; Ober- und Unterlicht werden addiert. Bis 16.09.2026
           rechnete die Skizze die Lichter IN die Höhe hinein — dann hätte die Mail bei 1400 +
           400 Oberlicht eine Gesamthöhe von 1400 gezeigt statt 1800. `H` ist unten die Höhe des
           ganzen Blendrahmens, `HF` die bestellte Hauptfensterhöhe. */
        /* rollladen.massBezug 'gesamt' (Betrieb 30.09.2026): die eingegebene Höhe ist die Gesamthöhe INKLUSIVE
           Aufsatzkasten — der Kasten steckt in der Höhe, nicht obendrauf. Dann ist das Hauptfenster um die
           Kastenhöhe niedriger; außen steht die Eingabe als Gesamtmaß, innen Kasten + Fenster. Ohne Angabe
           (oder 'fenster') wie bisher: Höhe = Hauptfenster, der Kasten kommt dazu. */
        kastenInHoehe = (k.rollladen && (k.rollladen.massBezug === 'gesamt' || k.hoeheBezug === 'gesamt')) ? aufsatzKasten(daten, sys.id, k.rollladen, false) : 0,
        /* hoeheBezug 'gesamt' (Betriebs Grundsatz 30.09.2026, Inhalts-Sitzung): h = Kasten + Oberlicht + Fenster +
           Unterlicht. Das Hauptfenster ist dann der Rest; außen steht die Eingabe, innen die Teile. */
        lichterInHoehe = (k.hoeheBezug === 'gesamt')
          ? Math.max(+(k.oberlicht && k.oberlicht.hoehe) || 0, 0) + Math.max(+(k.unterlicht && k.unterlicht.hoehe) || 0, 0) : 0,
        HF = Math.max(+k.h || 1400, 200) - kastenInHoehe - lichterInHoehe,
        aussenAnsicht = (k.ansicht === 'aussen'),
        fluegel = (k.fluegel && k.fluegel.length) ? k.fluegel : [{ oeffnung: 'dk-r' }],
        /* Von innen sieht man die Innenfarbe, von außen die Außenfarbe. `rahmenFarbe`
           bleibt als Kurzform für beidseitig gleiche Farbe. */
        rahmenFarbe = seitenFarbe(k, aussenAnsicht),
        // Holzdekor gilt seitenunabhängig für das ganze Element (Folie beidseitig kaschiert)
        farbNameHolz = istHolzDekor(k.farbName),
        olH = Math.max(+(k.oberlicht && k.oberlicht.hoehe) || 0, 0),
        ulH = Math.max(+(k.unterlicht && k.unterlicht.hoehe) || 0, 0),
        H = olH + HF + ulH,
        rollH = k.rollladen ? aufsatzKasten(daten, sys.id, k.rollladen, false) : 0,
        /* Nur die Balkontür hat eine Bodenschwelle; sie sitzt UNTER dem Rahmen und zählt
           nicht zur bestellten Fensterhöhe — genauso wie der Rollladenkasten darüber. */
        schwH = (k.produkt === 'balkon') ? (balkonSchwelle(daten, sys.id, k.schwelle) || 0) : 0,
        /* Abgenommen vom Betrieb 14.09.2026: weißer Griff mit Tiefe ist Standard. Silber nur,
           wenn der Kunde einen silbernen Griff hat (`griffFarbe: 'silber'`). */
        griffStil = griffStilAus(k),
        griffArtWunsch = k.griffArt || 'standard',
        /* Griffform aus dem Bestellweg. Ohne Angabe die vom Betrieb abgenommene Form. */
        griffModell = griffModellPruefen(k, daten, sys.id),
        griffArt = (griffModell && griffModell.art) || griffArtWunsch,
        griffForm = griffModell ? griffModell.form : (GRIFF_FORM[k.griffForm] ? k.griffForm : 'geschwungen'),
        griffRosette = (griffModell && griffModell.rosette) || k.griffRosette || null,
        griffLaenge = griffModell ? griffModell.laengeFaktor : 1,
        /* Rahmenverbreiterung je Seite in mm. Bestellweg (deinefenster.de, Schritt „Verbreiterung“):
           „Ihr Fenstermaß bleibt unverändert — die Verbreiterung kommt außen dazu.“ Gezeichnet wird
           sie deshalb als eigener Streifen AUSSEN am Blendrahmen, ohne Gehrung (Verbreiterungs-
           profile werden stumpf angesetzt), und das Gesamtmaß wächst. Dass Drutex Verbreiterungen
           führt, ist belegt (K S. 18/19: „zusätzliche Profile (Kopplungen, Verbreiterungen …)“);
           die Breitenliste ist es nicht — die Skizze zeichnet deshalb jede Zahl, prüft aber keine. */
        vbw = k.verbreiterung || {},
        vL = Math.max(+vbw.links || 0, 0), vR = Math.max(+vbw.rechts || 0, 0),
        vO = Math.max(+vbw.oben || 0, 0), vU = Math.max(+vbw.unten || 0, 0),
        mitVerbreiterung = (vL + vR + vO + vU) > 0,
        sprossen = sprossenPruefen(daten, k.sprossen),
        glasMotiv = glasMotivAus(k);
    if (vU > 0 && schwH > 0) {
      throw new Error('Balkontür: Bodenschwelle und Verbreiterung unten schließen sich aus');
    }

    fluegel = fluegelVonInnen(fluegel, sys.nachAussen);
    /* Von außen betrachtet liegt links, was von innen rechts liegt. Deshalb wird die
       Flügelreihe umgedreht und jede Öffnungsrichtung gespiegelt. Die DIN-Bezeichnung
       des Elements ändert sich dadurch nicht — nur die Zeichnung. */
    if (aussenAnsicht) {
      var tausch = vL; vL = vR; vR = tausch;
      var spiegel = { 'dk-r': 'dk-l', 'dk-l': 'dk-r', 'dreh-r': 'dreh-l', 'dreh-l': 'dreh-r' };
      fluegel = fluegel.slice().reverse().map(function (f) {
        var kopie = {};
        for (var s in f) if (Object.prototype.hasOwnProperty.call(f, s)) kopie[s] = f[s];
        if (spiegel[kopie.oeffnung]) kopie.oeffnung = spiegel[kopie.oeffnung];
        return kopie;
      });
    }

    // Strichstärken in mm, damit sie mit dem Element mitskalieren, aber nie verschwinden
    var bue = buehne(k, B, H),
        dickeStark = bue.bezug / 330,
        dickeFein = dickeStark * 0.62,
        dickeSymbol = dickeStark * LINIE_SYMBOL,
        strichelungGezeichnet = false,
        schrift = bue.bezug / 22 * schriftFaktor;

    var kompakt = kompaktSchriftfeld(k);
    var randL = massRand(schrift * 3.2, schrift), randR = massRand(schrift * 2.4, schrift),
        randO = massRand(schrift * 2.6, schrift), randU = schrift * (kompakt ? ((ohneMasse || k.ohneBeschriftung === true) ? 1.8 : KOMPAKT_UNTEN) : (k.farbName ? 5.3 : 4.2));
    /* Gurtwickler und Motoranschluss sitzen neben dem Element in der Laibung.
       Ohne diesen Zuschlag werden sie vom Rand abgeschnitten. */
    var antriebSichtbar = !!k.rollladen && !aussenAnsicht;
    if (antriebSichtbar) {
      var ueberstand = antriebAussen(antriebAus(k.rollladen), H, k.rollladen.antriebsart, sys.arb);
      if (k.rollladen.seite === 'links') randL = Math.max(randL, ueberstand + schrift * 1.6);
      else randR = Math.max(randR, ueberstand + schrift * 2.6);
    }
    /* Von außen stehen die Führungsschienen neben dem Element (siehe Rollladenkasten weiter unten).
       Ohne diesen Zuschlag lägen sie außerhalb des Bildausschnitts — links ganz unsichtbar, rechts
       angeschnitten (Sichtprüfung 25.09.2026). */
    if (k.rollladen && aussenAnsicht && !k.rollladen.vorsatz) {
      var schBreite = fakt(daten, 'aufsatzrollladen', 'schiene.einseitig.masse')[0];
      randL = Math.max(randL, vL + schBreite + schrift * 1.2);
      randR = Math.max(randR, vR + schBreite + schrift * 1.2);
    }

    var strichR = istDunkel(rahmenFarbe) ? '#8f989f' : FARBE.strich,
        gehrungR = istDunkel(rahmenFarbe) ? 'rgba(255,255,255,.22)' : FARBE.gehrung,
        // Innere Profilkanten (Pfosten, Flügel) weich aus der Rahmenfarbe statt fester dunkler
        // Kontur — wie an Haustür/Schiebetür (kanteWeich(), Betrieb 22.09.2026 „zu comichaft"). Der
        // äußere Blendrahmen und der Verbreiterungsstreifen bleiben bei `strichR`.
        strichRInnen = kanteWeich(rahmenFarbe);
    var y0 = rollH,                       // Oberkante Blendrahmen
        gesamtH = rollH + H + schwH,
        teile = [],
        /* Beschlag wird zuletzt gezeichnet: Pfosten, Kämpfer und Stulp entstehen erst nach dem
           Feld und haben bis 16.09.2026 die Bänder des Nachbarflügels übermalt — am mittleren
           Pfosten war statt zwei Bändern nur eines zu sehen, am Kipp-Oberlicht nur zwei Stummel. */
        beschlag = [];

    /* --- Rollladenkasten ------------------------------------------------- */
    if (rollH > 0) {
      teile.push(rechteck(0, 0, B, rollH, '#eef0f2', FARBE.strich, dickeStark));
      teile.push(linie(B * 0.04, rollH * 0.7, B * 0.96, rollH * 0.7, FARBE.strichFein, dickeFein));
      /* Führungsschienen (Betrieb 25.09.2026, „alles perfekt machen"): Sie liefen am Fenster bisher
         gar nicht mit — auch nicht in der Außenansicht, wo sie an der Fassade neben dem Element
         sichtbar sind. Von INNEN sieht man sie nicht, sie sitzen außen; deshalb nur bei
         aussenAnsicht. Ansichtsbreite 61 mm ist belegt (katalog_rolety_de.pdf Druckseite 10/11,
         aus der technischen Zeichnung gelesen 25.09.2026), mit Insektenschutz dieselbe Breite.
         Sie stehen NEBEN dem Element, nicht darüber: der Panzer läuft zwischen ihnen. */
      if (aussenAnsicht) {
        var schB = fakt(daten, 'aufsatzrollladen', 'schiene.einseitig.masse')[0],
            schFarbe = farbwert(k.schienenFarbe, rahmenFarbe),
            schStrich = istDunkel(schFarbe) ? HELLE_LINIE : FARBE.strich;
        teile.push('<g data-teil="schiene">' +
          rechteck(-vL - schB, rollH, schB, H, schFarbe, schStrich, dickeFein) +
          rechteck(B + vR, rollH, schB, H, schFarbe, schStrich, dickeFein) + '</g>');
      }
      /* Gurtwickler, Kurbel und Motoranschluss sitzen im Raum — von außen sieht man nur den Kasten.
         In `beschlag`, NICHT `teile`: das Icon überlappt jetzt bewusst die Rahmenkante (Koordinator-
         Korrektur 22.09.2026, „sitzt auf dem Fenster wie live") — in `teile` gezeichnet, hätte der
         danach folgende Blendrahmen (profilRing) es zur Hälfte übermalt (Fund: „nur ein dünner
         Streifen sichtbar"). `beschlag` wird zuletzt gezeichnet (siehe Kommentar oben), liegt also
         über dem fertigen Rahmen — wie im Live-Icon, das ebenfalls über der fertigen Ansicht sitzt. */
      if (!aussenAnsicht) {
        /* Griffseite des ersten (bzw. einzigen) Flügels — dieselbe Konvention wie `bandRechts`
           weiter unten (/-r$/ = Band rechts → Griff links): antriebTeil() braucht sie, um dem
           Fenstergriff auszuweichen (Koordinator-Korrektur 22.09.2026, dritte Runde). */
        var griffSeiteHaupt = (Array.isArray(k.fluegel) && k.fluegel[0] && k.fluegel[0].oeffnung && k.fluegel[0].oeffnung !== 'fest')
          ? (/-r$/.test(k.fluegel[0].oeffnung) ? 'links' : 'rechts') : null;
        beschlag.push(antriebTeil(antriebAus(k.rollladen), k.rollladen.seite === 'links', B,
                               0, rollH, y0, H, vL, vR, dickeStark, dickeFein, rahmenFarbeZuBeschlagFarbe(rahmenFarbe), uid, k.rollladen.antriebsart, sys.arb, griffSeiteHaupt));
      }
    }

    /* --- Blendrahmen ----------------------------------------------------- */
    teile.push(profilRing(0, y0, B, H, rahmenFarbe, strichR, dickeStark, sys.arb));
    /* Bodenschwelle der Balkontür — Aluminium, deshalb in Metallfarbe statt in der Rahmenfarbe.
       COMBI PLAN ist bodengleich (0 mm) und wird folgerichtig gar nicht sichtbar. Fix 22.09.2026
       (Recherche `schiebe-balkon-drutex.md`: „Alu-Schwelle sichtbar zeichnen" — vorher eine
       einzelne flache Fläche mit dünner Mittellinie, die bei kleinem Vorschaubild kaum von einer
       einfachen Kontur zu unterscheiden war). Jetzt zwei flache Tonabstufungen (hell oben, dunkel
       unten — gleiche Technik wie am Profilring, Regel 4 „flach" bleibt gewahrt) plus kräftigere
       Kontur, damit die Schwelle klar als eigenes Metallbauteil erkennbar bleibt statt als
       Kontur-Rest unter dem Rahmen unterzugehen. */
    if (schwH > 0) {
      var aluBasis = '#c9ced3', aluHell = stufe3Mischen(aluBasis, 'hell', 0.22),
          aluDunkel = stufe3Mischen(aluBasis, 'dunkel', 0.26), aluTeil = schwH * 0.4,
          // Design-Review 2. Runde (22.09.2026): der Übergang Rahmen -> Schwelle war eine harte
          // durchgehende Kontur (dieselbe Linie wie die äußere Schwellen-Silhouette). Jetzt strichlos
          // oben, dafür ein weicher Schattenverlauf über der Naht — die äußere Silhouette (unten/
          // seitlich) bleibt weiterhin eine klare Linie, siehe Leitregeln.md Regel „äußere Silhouette".
          nahtD = Math.max(3, schwH * 0.22),
          // Design-Review 3. Runde (22.09.2026): zwei flache Bänder lasen als harter Bruch statt
          // Metall. Jetzt ein echter Verlauf (Glanzlicht oben, Kernton, Schatten unten — typisches
          // gebürstetes Aluminium) plus ein weicher Kontaktschatten unter der Schwelle, wo sie auf
          // die Fensterbank/den Boden trifft (Regel 4 „flach" bleibt gewahrt: Verlauf, kein Filter).
          aluGlanzId = 'skz-aluschwelle' + (++stufe3Zaehler),
          kontaktSchattenId = 'skz-aluschwelle-kontakt' + (++stufe3Zaehler),
          kontaktD = Math.max(3, schwH * 0.5);
      defsStufe3.push('<linearGradient id="' + aluGlanzId + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + stufe3Mischen(aluBasis, 'hell', 0.42) + '"/>' +
        '<stop offset="0.18" stop-color="' + aluHell + '"/>' +
        '<stop offset="0.55" stop-color="' + aluBasis + '"/>' +
        '<stop offset="1" stop-color="' + aluDunkel + '"/></linearGradient>');
      defsStufe3.push('<linearGradient id="' + kontaktSchattenId + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity="0.3"/></linearGradient>');
      teile.push('<g data-teil="alu-schwelle">' +
        rechteck(0, y0 + H, B, schwH, 'url(#' + aluGlanzId + ')', 'none', 0) +
        '<path d="M0 ' + z(y0 + H) + ' L0 ' + z(y0 + H + schwH) + ' L' + z(B) + ' ' + z(y0 + H + schwH) +
          ' L' + z(B) + ' ' + z(y0 + H) + '" fill="none" stroke="' + FARBE.strich + '" stroke-width="' + z(dickeFein * 1.3) + '"/>' +
        falzSchatten3(0, y0 + H - nahtD, B, 2 * nahtD) +
        rechteck(0, y0 + H + schwH - kontaktD, B, kontaktD, 'url(#' + kontaktSchattenId + ')', 'none', 0) +
        linie(0, y0 + H + aluTeil, B, y0 + H + aluTeil, FARBE.strichFein, dickeFein * 0.5) +
        '</g>');
    }
    teile.push(gehrung(0, y0, B, H, sys.arb, dickeFein, gehrungR));
    /* Verbreiterungsstreifen. Oben und unten laufen sie über die ganze Breite einschließlich der
       seitlichen Streifen; seitlich neben Rollladenkasten und Rahmen. Zeichenannahme — wie Drutex
       die Ecken ausbildet, ist nicht veröffentlicht. */
    if (mitVerbreiterung) {
      var vbTeil = function (x, y, b, h) {
        var st = verbreiterungStil(rahmenFarbe, farbNameHolz ? stufe3Fuellung(rahmenFarbe, h > b) : null);
        return '<g data-teil="verbreiterung">' + profilFlaeche(x, y, b, h, st.fill, st.stroke, dickFuge) + '</g>';
      }, dickFuge = dickeFein * (hervorheben === 'verbreiterung' ? 2.2 : 1.4);
      if (vL > 0) teile.push(vbTeil(-vL, 0, vL, y0 + H));
      if (vR > 0) teile.push(vbTeil(B, 0, vR, y0 + H));
      if (vO > 0) teile.push(vbTeil(-vL, -vO, B + vL + vR, vO));
      if (vU > 0) teile.push(vbTeil(-vL, y0 + H, B + vL + vR, vU));
    }
    /* Kopplung an ein Nachbarelement ist seit Katalog-Commit 3cacd59 ein eigenes Produkt
       (ZEICHNER.kopplung) — Fenster/Balkontür/Schiebetür liefern kein k.kopplung mehr, die
       frühere Nachbarschafts-Zeichnung hier entfällt ersatzlos. */

    /* --- Felder aufteilen: Oberlicht / Hauptfeld / Unterlicht ------------- */
    var innenX = sys.arb,
        innenB = B - 2 * sys.arb,
        innenY = y0 + sys.arb,
        innenH = H - 2 * sys.arb;

    /* Die Kämpfer sitzen mit ihrer Achse genau auf der Teilung — so wie die Pfosten bei der
       Breite. Dann laufen die Maßstriche links durch die Kämpfermitte, und die Zeichnung zeigt
       dieselbe Aufteilung wie die Zahlen. Bis 16.09.2026 lag der Kämpfer 76 mm daneben, das
       Oberlicht war dadurch 19 % höher gezeichnet als bemaßt (Design-Prüfung 16.09.). */
    // Kämpferbreite nur abfragen, wenn es einen Kämpfer gibt — sonst bricht ein einflügeliges
    // Fenster ab, dessen System keine Pfostenbreite festgelegt hat (Schüco FocusIng).
    /* Seit 29.09.2026 (Betrieb: „so ein Pfosten existiert nicht“): der Kämpfer ist dasselbe T-Profil wie
       der Pfosten, nur waagerecht. Zu sehen ist wie beim Pfosten nur ein schmaler Streifen — der Rest
       liegt hinter dem Flügelrahmen bzw. unter der Glasleiste des festen Feldes. Vorher lag hier die
       volle Profilbreite als eigener Kasten mit Gehrung und Innenlinien (≈ 76 mm + 28 mm Glasleiste
       zwischen Flügel und Oberlichtglas) — das las sich wie ein zusätzliches Bauteil. */
    var kp = (olH || ulH) ? kaempferSichtbar() : 0,
        kaempfer1 = y0 + olH,                    // Achse Oberlicht | Hauptfenster
        kaempfer2 = y0 + olH + HF,               // Achse Hauptfenster | Unterlicht
        olFeld = olH ? kaempfer1 - kp / 2 - innenY : 0,
        ulFeld = ulH ? (innenY + innenH) - (kaempfer2 + kp / 2) : 0;
    if (k.rollladen && k.rollladen.massBezug != null && ['gesamt', 'fenster'].indexOf(k.rollladen.massBezug) < 0) {
      throw new Error('rollladen.massBezug kennt nur gesamt oder fenster');
    }
    if (k.hoeheBezug != null && ['gesamt', 'fenster'].indexOf(k.hoeheBezug) < 0) throw new Error('hoeheBezug kennt nur gesamt oder fenster');
    if ((kastenInHoehe || lichterInHoehe) && HF < 200) {
      throw new Error('Höhe ' + (+k.h) + ' mm ist kaum höher als Kasten und Lichter (' + (kastenInHoehe + lichterInHoehe) + ' mm)');
    }
    if (olH && olFeld <= 0) throw new Error('Oberlicht zu niedrig für Rahmen und Kämpfer: ' + olH + ' mm');
    if (ulH && ulFeld <= 0) throw new Error('Unterlicht zu niedrig für Rahmen und Kämpfer: ' + ulH + ' mm');
    var hauptY = olH ? kaempfer1 + kp / 2 : innenY,
        hauptH = (ulH ? kaempfer2 - kp / 2 : innenY + innenH) - hauptY;

    /* Kämpfer, nicht Pfosten: waagerecht liegt ein eigenes Maß zugrunde (sys.kaempfer() →
       kaempferSichtbar()), auch wenn es heute denselben Wert hat — so steht die Annahme an einer
       Stelle und nicht im Code. */
    function querRiegel(y) { teile.push(profilStreifen(innenX, y, innenB, kp, false, 'kaempfer')); }

    /* Oberlicht */
    if (olH > 0) {
      var olTeile = Math.max(1, +(k.oberlicht.teilung || 1));
      zeichneFelderReihe(innenX, innenY, innenB, olFeld, olTeile, k.oberlicht.oeffnung || 'fest', false,
                         { bedienung: k.oberlicht.bedienung });
      querRiegel(kaempfer1 - kp / 2);
    }
    /* Unterlicht */
    if (ulH > 0) {
      var ulY = kaempfer2 + kp / 2,
          ulTeile = Math.max(1, +(k.unterlicht.teilung || 1));
      querRiegel(kaempfer2 - kp / 2);
      zeichneFelderReihe(innenX, ulY, innenB, ulFeld, ulTeile, k.unterlicht.oeffnung || 'fest', true,
                         { ohneGriff: k.unterlicht.bedienung === 'oeffner' });
    }
    /* Kein Feld-Farbton beim Hervorheben (Betrieb, Bild 44, 30.09.2026: „Wenn ich das Maß eingebe, wird das
       Fenster kurz blau.“): Rahmen, Flügel und Glas bleiben beim Tippen unverändert — nur die Maßkette des
       Feldes, in dem getippt wird, ist in der Akzentfarbe (akzentWenn). Bis 30.09. lag hier eine blaue
       Fläche über dem Feld. */

    /* --- Hauptfeld: die Flügel ------------------------------------------- */
    var n = fluegel.length,
        stulpIndex = -1;
    fluegel.forEach(function (f, i) { if (f.stulp) stulpIndex = i; });

    /* Stulp: Zwei Flügel ohne festen Pfosten. Nur der Gehflügel hat einen Griff, der
       Standflügel wird über den Stulp im Falz bedient. Belege: Drutex-Katalog
       Kunststofffenster S. 9/15/19/35 führt den „zusätzlichen Griff bei Stulpbeschlag“ als
       Zusatzausstattung; die Hersteller-Programmausgabe „2-flg Stulp“ zeigt nur einen Griff. Für IGLO Light nicht belegt.
       Welcher passiv ist: ausdrücklich per `passiv`, sonst der reine Drehflügel neben
       einem Dreh-Kipp-Flügel, sonst der linke. */
    var passivIndex = -1;
    if (stulpIndex > 0) {
      var li = stulpIndex - 1, re = stulpIndex;
      if (fluegel[li].passiv) passivIndex = li;
      else if (fluegel[re].passiv) passivIndex = re;
      else if (/^dreh/.test(fluegel[li].oeffnung) && /^dk/.test(fluegel[re].oeffnung)) passivIndex = li;
      else if (/^dreh/.test(fluegel[re].oeffnung) && /^dk/.test(fluegel[li].oeffnung)) passivIndex = re;
      else passivIndex = li;
    }

    var hauptAchsen = achsen(B, n);
    /* fuge(j) = Breite der Trennung links von Feld j (Pfosten oder Stulp) */
    /* Sichtbarer Pfostenanteil im Hauptfeld. Diese Breite geht direkt in die ACHSTEILUNG ein (nicht nur in die
       Pfosten-Zeichnung), sonst bleibt zwischen Streifen und Flügelrahmen eine Lücke (Fund 22.09.2026).
       Verlauf: 22.–30.09.2026 nur 18 % des Spalts (10–20 mm, Referenzvergleich) — zu schmal, siehe unten. */
    /* 30.09.2026 (Betrieb, Bild 51: „Da ist schon wieder so ein Pfosten drin … man sieht ihn fast nicht … EINEN Pfosten bei
       zwei Flügeln“): 10–20 mm waren schmaler als der Stulp (32 mm) — Pfosten und Stulp waren nicht zu unterscheiden.
       Jetzt die Hälfte des angenommenen Spalts: pfostenGlasGlas setzt ihn als 2 × 38 mm Rahmenanteil an, sichtbar
       bleibt EIN Rahmenanteil (IGLO 5: 38 mm = sichtbarer Blendrahmen innen, B S. 2). Der Pfosten liest sich als Teil
       des Rahmens, an dem beide Flügel anschlagen wie am Blendrahmen. Zeichenannahme, bleibt über pfostenGlasGlas messbar. */
    function pfostenSichtbar() { return sys.pfosten() / 2; }
    /* 30.09.2026 (88): Kämpfer = dasselbe T-Profil wie der Pfosten, also gleich breit (ein Rahmenanteil). Betriebs „kein
       Kasten“ (29.09.) meinte die Kästchen-Linien, nicht die Breite — die Fläche bleibt ruhig, ohne eigene Kontur.
       Aus sys.kaempfer() gerechnet, damit die Zeichenannahme kaempferGlasGlas messbar bleibt. */
    function kaempferSichtbar() { return sys.kaempfer() / 2; }
    /* Pfosten und Kämpfer als ein Bild: flacher Streifen in Rahmenfarbe, stumpf an Rahmen bzw.
       Nachbarprofil gestoßen (T-Profil, keine Gehrung), feine Mittelfuge. `senkrecht` legt die
       Fuge längs. */
    /* 30.09.2026 (Betrieb: „zwischen Fenster und Oberlicht hat man normalerweise keinen Kasten“): Der Streifen hatte
       eine eigene Kontur oben/unten plus Mittelfuge und las sich wie ein flaches Kästchen. Sichtbar ist dort nur
       Profilfläche; ihre Kanten zeichnen Glasleiste und Flügelrahmen schon selbst. Deshalb nur noch Fläche. */
    /* 30.09.2026 (Betrieb auf 8960: „Man sieht einen Pfosten nicht optisch, es sieht genauso aus mit oder ohne“): in
       Rahmenfarbe war der Pfosten weiß auf weiß zwischen weißen Flügeln. Er liegt tiefer als die Flügel (wie der
       sichtbare Blendrahmen daneben) — deshalb ein leicht abgesetzter Ton: helle Farben 20 % dunkler, dunkle 15 %
       heller. Weiter ohne eigene Linien (Betrieb 29.09.: „kein Kasten“). */
    // Ton beim Aufruf rechnen: profilStreifen läuft (Kämpfer, Oberlicht-Pfosten) VOR dieser Stelle — eine hier gesetzte
    // Variable war dort noch undefined und malte schwarz (fill="undefined", Wächter-Blatt 30.09.2026)
    function pfostenTon() { return istDunkel(rahmenFarbe) ? stufe3Mischen(rahmenFarbe, 'hell', 0.15) : stufe3Mischen(rahmenFarbe, 'dunkel', 0.2); }
    function profilStreifen(x, y, b, h, senkrecht, teil) {
      return '<g data-teil="' + teil + '">' + rechteck(x, y, b, h, farbNameHolz ? rahmenFarbe : pfostenTon(), 'none', 0) + '</g>';
    }
    /* 30.09.2026, Betriebs Entscheidung am Bild von 8960 („Beide Skizzen sehen furchtbar aus … Macht einfach beide Flügel
       zusammen“): Im Hauptfeld stoßen die Flügel IMMER direkt aneinander, eine saubere Trennlinie, kein Pfosten- und kein
       Stulpstreifen. Ob mit Mittelsteg (Pfosten) oder ohne (Stulp), steht im Schriftfeld (oeffnungText). Ober-/Unterlicht
       und Kämpfer bleiben wie bisher (zeichneFelderReihe/querRiegel). */
    function hauptFuge(j) { return 0; }
    function feldLinks(grenzen, j, anzahl, fuge) { return j === 0 ? innenX : grenzen[j] + fuge(j) / 2; }
    function feldRechts(grenzen, j, anzahl, fuge) { return j === anzahl - 1 ? innenX + innenB : grenzen[j + 1] - fuge(j + 1) / 2; }

    /* Ein Feld zeichnen — Festverglasung oder Flügel. Wird vom Hauptfeld und von
       Ober-/Unterlicht benutzt, damit ein Kipp-Oberlicht genauso aussieht wie ein Kippflügel. */
    function sprossenZeichnen(gx, gy, gb, gh) {
      if (!sprossen || opt_licht) return;
      var g = sprossenGitter(sprossen, gx, gy, gb, gh, { glasMotiv: glasMotiv, rahmenFarbe: rahmenFarbe, strich: strichR,
        dickeFein: dickeFein, aussen: aussenAnsicht });
      if (g) teile.push(g);
    }
    var opt_licht = false;

    /* --- Stufe 3: Glasleiste, Spiegelstreifen, Falzschatten, Dichtung -----
     * Rein additiv über der bestehenden `glas()`-Fläche — die Glasfüllung selbst (Farbe,
     * Kante) bleibt exakt wie vorher, damit an Maßen und Randbedingungen nichts wackelt. */
    function glasleiste3(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      return rechteck(x, y, b, h, 'none', stufe3Mischen(rahmenFarbe, 'dunkel', 0.2), Math.max(0.6, dickeFein * 0.55));
    }
    /* Design-Review 22.09.2026 (Referenzfoto Hawaii-1 + realismus-v2.png): der Spiegelstreifen
       wirkte als „Comic-Diagonale übers ganze Fenster" — halbe Breite, weicheres Fadeout,
       geringere Deckkraft. Design-Review 2. Runde (22.09.2026): danach war er so gut wie weg
       ("wirkt tot") — Deckkraft testweise auf 0.18. Koordinator-Entscheidung 22.09.2026 (Glas
       flach statt Verlauf): Deckkraft auf ≤0.12 gekappt, sonst wirkt der Streifen wie ein
       Aufkleber auf der jetzt einheitlichen Glasfläche — ein Band bleibt, nur leiser. */
    function glasReflex3(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      var id = 'skz-refl' + (++stufe3Zaehler);
      defsStufe3.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>' +
        '<stop offset="0.12" stop-color="#ffffff" stop-opacity="0.12"/>' +
        '<stop offset="0.4" stop-color="#ffffff" stop-opacity="0.04"/>' +
        '<stop offset="0.62" stop-color="#ffffff" stop-opacity="0"/></linearGradient>');
      /* 30.09.2026: aus der KÜRZEREN Seite gerechnet. Bei breiten, flachen Lichtern (Oberlicht über drei
         Flügel) war der Streifen 13 % der Feldbreite — ein großes weißes Band, das Licht wirkte heller/weißer
         als die Flügel (Betrieb: „das durchgehende Feld hat kein blaues Glas“). Hoch/quadratisch: unverändert. */
      var kurz = Math.min(b, h), bw = kurz * 0.13, x0 = x + b * 0.08,
          pts = [[x0, y], [x0 + bw, y], [x0 + kurz * 0.42, y + h], [x0 + kurz * 0.42 - bw, y + h]];
      return polygon(pts, 'url(#' + id + ')', null, 0);
    }
    function randSchattenGradFenster(dir) {
      if (!randSchattenCacheFenster[dir]) {
        var id = 'skz-rs-' + dir + (++stufe3Zaehler), x1, y1, x2, y2;
        if (dir === 'oben') { x1 = 0; y1 = 0; x2 = 0; y2 = 1; }
        else if (dir === 'unten') { x1 = 0; y1 = 1; x2 = 0; y2 = 0; }
        else if (dir === 'links') { x1 = 0; y1 = 0; x2 = 1; y2 = 0; }
        else { x1 = 1; y1 = 0; x2 = 0; y2 = 0; }
        defsStufe3.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
          '<stop offset="0" stop-color="#000000" stop-opacity="0.32"/>' +
          '<stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>');
        randSchattenCacheFenster[dir] = id;
      }
      return 'url(#' + randSchattenCacheFenster[dir] + ')';
    }
    /* Glasausschnitt: Kantenschatten auf allen VIER Seiten (Einfassprofil/Glasleiste), nicht nur
       oben/links — Design-Review 22.09.2026. Design-Review 2. Runde (22.09.2026): auf dem
       Flügelglas kam der Schatten bisher NICHT an — falzSchatten3() wurde am Flügelrahmen-Rechteck
       (fx/fy/fb/fh) aufgerufen, bevor die Scheibe darüber gezeichnet wurde, und verschwand darunter.
       Jetzt zusätzlich direkt auf der sichtbaren Glasfläche (siehe feldZeichnen unten).
       Design-Review 4. Runde (22.09.2026, "wirkt wie schwere Vignette"): die Breite war 5,5 % der
       kleineren Kante — bei einer 1000-mm-Scheibe also 55 mm Schatten rundum. Jetzt ein echtes
       Falzmaß: 6-8 mm (Herstellerfalz liegt in dieser Größenordnung), nicht mehr proportional zur
       Scheibengröße, plus etwas geringere Deckkraft (0.42 -> 0.32), damit die Scheibe klar bleibt. */
    function falzSchatten3(x, y, b, h) {
      if (!(b > 0 && h > 0)) return '';
      var d = Math.max(6, Math.min(8, Math.min(b, h) * 0.02));
      return rechteck(x, y, b, d, randSchattenGradFenster('oben'), 'none', 0) +
             rechteck(x, y + h - d, b, d, randSchattenGradFenster('unten'), 'none', 0) +
             rechteck(x, y, d, h, randSchattenGradFenster('links'), 'none', 0) +
             rechteck(x + b - d, y, d, h, randSchattenGradFenster('rechts'), 'none', 0);
    }
    function dichtung3(x, y, b, h) {
      var d = Math.max(1, dickeFein * 0.5);
      return rechteck(x + d, y + d, Math.max(0, b - 2 * d), Math.max(0, h - 2 * d), 'none', '#14171a', d);
    }
    /* Design-Review 3. Runde (22.09.2026): von außen soll die Scheibe dunkler wirken als von
       innen (Tageslicht-Glas reflektiert nach außen mehr, man sieht weniger "hindurch"). Ein
       flächiger, sehr dünner Dunkelton nur bei aussenAnsicht — keine neue Geometrie, kein Filter. */
    function glasAussenTon(x, y, b, h) {
      if (!aussenAnsicht || !(b > 0 && h > 0)) return '';
      return rechteck(x, y, b, h, '#111c24', 'none', 0, ' opacity="0.10"');
    }

    function feldZeichnen(fx, fy, fb, fh, art, opt) {
      opt = opt || {};
      if (art === 'fest') {
        var ein = Math.max(0, sys.fest() - sys.arb);
        /* Glasleiste: beim festen Feld sitzt das Glas direkt im Rahmen bzw. am Kämpfer, gehalten von
           der Glasleiste — ringsum gleich breit, an den Ecken auf Gehrung. Bis 29.09.2026 war dieser
           Streifen eine konturlose Fläche und las sich wie ein verbreiterter, schiefer Blendrahmen
           (Betrieb: „Rahmen rechts breit, links schmal, Gehrung unterbrochen“). */
        if (ein > 0) teile.push('<g data-teil="glasleiste">' + profilRing(fx, fy, fb, fh, rahmenFarbe, strichRInnen, dickeFein * 0.8, ein) + '</g>');
        teile.push(glasleiste3(fx + ein - dickeFein, fy + ein - dickeFein, fb - 2 * ein + 2 * dickeFein, fh - 2 * ein + 2 * dickeFein));
        teile.push(glas(fx + ein, fy + ein, fb - 2 * ein, fh - 2 * ein, dickeFein));
        teile.push(glasAussenTon(fx + ein, fy + ein, fb - 2 * ein, fh - 2 * ein));
        teile.push(glasReflex3(fx + ein, fy + ein, fb - 2 * ein, fh - 2 * ein));
        teile.push(falzSchatten3(fx + ein, fy + ein, fb - 2 * ein, fh - 2 * ein));
        sprossenZeichnen(fx + ein, fy + ein, fb - 2 * ein, fh - 2 * ein);
        teile.push(oeffnungsSymbol('fest', fx, fy, fx + fb, fy + fh, dickeSymbol));
        return;
      }
      teile.push(profilRing(fx, fy, fb, fh, rahmenFarbe, strichRInnen, dickeStark * 0.85, sys.afb));
      // Falzschatten (Flügel liegt im Rahmenfalz) und Dichtungslinie — beide am Flügelrand,
      // vor dem Glas gezeichnet, damit sie unter der Scheibenkante verschwinden.
      teile.push(falzSchatten3(fx, fy, fb, fh));
      teile.push(dichtung3(fx, fy, fb, fh));
      teile.push(gehrung(fx, fy, fb, fh, sys.afb, dickeFein * 0.9, gehrungR));
      var gx2 = fx + sys.afb, gy2 = fy + sys.afb, gb = fb - 2 * sys.afb, gh2 = fh - 2 * sys.afb;
      teile.push(glasleiste3(gx2 - dickeFein, gy2 - dickeFein, gb + 2 * dickeFein, gh2 + 2 * dickeFein));
      teile.push(glas(gx2, gy2, gb, gh2, dickeFein));
      teile.push(glasAussenTon(gx2, gy2, gb, gh2));
      teile.push(glasReflex3(gx2, gy2, gb, gh2));
      // Design-Review 2. Runde (22.09.2026): fehlte bisher komplett am Flügelglas (siehe Kommentar
      // an falzSchatten3 oben) — der Schatten am Flügelrahmen-Rechteck lag unsichtbar unter der Scheibe.
      teile.push(falzSchatten3(gx2, gy2, gb, gh2));
      sprossenZeichnen(gx2, gy2, gb, gh2);
      // Strichart nach Blickrichtung, siehe gestrichelt(). IGLO EXT (K S. 28/29) öffnet nach
      // außen und ist deshalb INNEN gestrichelt; seine Bänder liegen verdeckt.
      var symbol = oeffnungsSymbol(art, gx2, gy2, gx2 + gb, gy2 + gh2, dickeSymbol),
          vomBetrachterWeg = !!sys.nachAussen !== !!aussenAnsicht;
      if (vomBetrachterWeg) { symbol = gestrichelt(symbol, dickeSymbol); strichelungGezeichnet = true; }
      teile.push(symbol);

      var bandRechts = /-r$/.test(art),
          bf = bandFaktor(Math.max(B, H), sys.arb, zeichenmass(daten, 'beschlag', 'kappeBreite'));
      if (sys.nachAussen || aussenAnsicht) {
        // verdeckt liegender Beschlag bzw. Außenansicht: keine sichtbaren Bandkappen
      } else if (art === 'kipp') {
        beschlag.push(baenderUnten(daten, fx, fy, fb, fh, dickeFein, griffStil, bf, rahmenFarbeZuBeschlagFarbe(rahmenFarbe), uid));
      } else {
        beschlag.push(baender(daten, fx, fy, fb, fh, bandRechts, dickeFein, griffStil, bf, rahmenFarbeZuBeschlagFarbe(rahmenFarbe), uid,
          bandRechts ? !!opt.nachbarRechts : !!opt.nachbarLinks));
      }
      if (aussenAnsicht || opt.ohneGriff) return;
      /* Betrieb 01.10.2026 (Variante a, „Griffe total komisch zusammengepresst“): die Sichtbarkeits-Vergrößerung großer Fenster
         auf 70 %, nie unter Echtgröße — bei normalen Fenstern also unverändert. Einheitlich für alle Fenster und Balkontüren. */
      // nie kleiner als in echt (Rosette 31 mm) — verkleinert wird nur die Sichtbarkeits-Vergrößerung großer Fenster
      var f2 = Math.max(1, griffFaktor(Math.max(B, H), sys.afb, fh) * GRIFF_GROESSE_FENSTER),
          /* Betrieb 01.10.2026 (zweite Wahl): „Der Griff bitte wieder normal mittig, generell immer mittig“ — die Verschiebung
             zur Glasseite aus Variante (a) ist zurückgenommen; kürzer ist nur der Hebel (GRIFF_HEBEL). */
          griffX = bandRechts ? fx + sys.afb / 2 : fx + fb - sys.afb / 2;
      if (art === 'kipp') {
        var fw = griffFaktorWaagerecht(sys.afb, fb);
        beschlag.push(griffEcht(fx + fb / 2, fy + sys.afb / 2, k, griffStil, fw * griffLaenge, 'waagerecht', griffArt, uid) ||
          griffWaagerecht(fx + fb / 2, fy + sys.afb / 2, griffStil, dickeFein * 1.25, fw, griffArt, griffForm, griffRosette, griffLaenge));
      } else {
        beschlag.push(griffEcht(griffX, fy + fh / 2, k, griffStil, f2 * griffLaenge, 'senkrecht', griffArt, uid) ||
          griff(griffX, fy + fh / 2, griffStil, dickeFein * 1.25, f2, 0, griffArt, griffForm, griffRosette, griffLaenge));
      }
    }

    for (var i = 0; i < n; i++) {
      var f = fluegel[i],
          art = f.oeffnung || 'fest',
          fx = feldLinks(hauptAchsen, i, n, hauptFuge),
          fy = hauptY,
          fb = feldRechts(hauptAchsen, i, n, hauptFuge) - fx,
          fh = hauptH;

      // Der Standflügel eines Stulpelements hat keinen Griff — außer mit der Drutex-Option
      // „zusätzlicher Griff bei Stulpbeschlag“. Bei IGLO LIGHT sitzt ein Griff mittig am Stulp.
      var amStulp = sys.griffAmStulp && stulpIndex > 0 && (i === stulpIndex || i === stulpIndex - 1);
      feldZeichnen(fx, fy, fb, fh, art, { ohneGriff: amStulp || (i === passivIndex && !k.stulpZusatzgriff),
        // Nachbarflügel ohne sichtbaren Pfosten (hauptFuge 0): Bänder dort auf die eigene Flügelkante (baender amNachbarn)
        nachbarLinks: i > 0 && hauptFuge(i) === 0, nachbarRechts: i < n - 1 && hauptFuge(i + 1) === 0 });

      // Pfosten oder Stulp zwischen den Flügeln
      if (i < n - 1) {
        var px = fx + fb;
        if (stulpIndex === i + 1) {
          /* Kein fester Pfosten: die beiden Flügel schlagen aneinander, dazwischen nur die schmale
             Stulpleiste. Ein eigenes Stulp-Zeichen führt kein Hersteller und keine Software
             (Norm-Recherche 02). Eine Strichlinie wäre falsch — sie heißt nach Norm „verdeckte
             Kante“ bzw. hier „öffnet vom Betrachter weg“. Erkennbar ist der Stulp daran, dass er
             schmal ist und KEINE Pfostenkanten hat; das Wort „Stulp“ steht im Schriftfeld. */
          /* Fix 22.09.2026 (Design-Kritik #2, „Pfosten wirkt wie ein separates, schwebendes
             Teil"): profilRing() hier zeichnete eine eigene Vierkant-Kontur UM den Spalt —
             dieselbe Farbe wie die Flügel, aber mit eigenem Rahmenstrich links UND rechts, also
             ein doppelter Strich mit hellem Spalt dazwischen statt zweier Flügel, die aneinander
             schlagen. Jetzt: flächenbündige Füllung ohne eigene Kontur (verschmilzt farblich mit
             beiden Flügelrahmen, keine Lücke, kein sichtbarer „Pfosten"), plus EINE feine
             Fugenlinie als Stulpleiste — nach der Recherche (`schiebe-balkon-drutex.md` Abschnitt
             1) sitzt die Leiste am Gehflügel, überlappt also den Standflügel: die Linie liegt
             darum zur Seite des passiven (Stand-)Flügels verschoben, nicht mittig. */
          /* 30.09.2026 (Betrieb, Bild 51): Die Naht lag mitten im Stulpstreifen — mit der Kante des Standflügels ergab
             das zwei Linien mit Lücke, „wieder so ein Pfosten“. Die Stulpleiste gehört zum Gehflügel und überlappt den
             Standflügel: der Streifen läuft ohne Linie in den Gehflügel über, EINE Naht liegt an der Kante zum
             Standflügel, dorthin fällt der schmale Schatten. */
          var sx = px;   // Flügel stoßen aneinander (30.09.2026): kein Stulpstreifen mehr, nur der Griff bei IGLO LIGHT
          // IGLO LIGHT: ein Griff mittig auf dem Stulp (K S. 20/21)
          if (sys.griffAmStulp && !aussenAnsicht) {
            var fStulp = Math.max(1, griffFaktor(Math.max(B, H), sys.afb, fh) * GRIFF_GROESSE_FENSTER);
            beschlag.push(griffEcht(sx, fy + fh / 2, k, griffStil, fStulp * griffLaenge, 'senkrecht', griffArt, uid) ||
              griff(sx, fy + fh / 2, griffStil, dickeFein * 1.25, fStulp, 0, griffArt, griffForm, griffRosette, griffLaenge));
          }
        } else {
          /* Pfosten zwischen zwei nebeneinanderliegenden Flügeln (nicht Kämpfer/Oberlicht-Steg,
             siehe querRiegel/zeichneFelderReihe — seit 29.09.2026 dieselbe profilStreifen()). Die Achsteilung
             (hauptFuge oben) räumt den Flügeln jetzt schon fast die volle Pfostenbreite zu den
             Flügelrahmen selbst ein — hier bleibt nur noch GENAU der sichtbare Streifen
             (pfostenSichtbar(), = px bis px+pfostenSichtbar()) zu zeichnen, keine zusätzliche
             Fläche daneben. Erste Fassung (22.09.2026) zeichnete den schmalen Streifen zusätzlich
             zu einer vollbreiten "Bündig"-Füllfläche über die ALTE (volle) Pfostenbreite — die
             Flügel selbst blieben aber auf den alten, engeren Positionen stehen, dadurch eine
             sichtbare Lücke von rund 30 mm je Seite (Koordinator-Fund 22.09.2026, 2. Runde,
             Vergleich mit Referenzfoto). Jetzt ist px..px+Breite bereits der volle, von der
             Achsteilung übrig gelassene Spalt, die Flügelrahmen selbst reichen bis dorthin. */
          // seit 30.09.2026 kein Pfostenstreifen im Hauptfeld (Betrieb) — die Flügelkonturen bilden die Trennlinie
        }
      }
    }

    /* Gleiche Achsteilung wie im Hauptfeld, damit Pfosten im Ober-/Unterlicht über
       den Pfosten darunter stehen. */
    function zeichneFelderReihe(x, y, b, h, anzahl, art, unten, opt) {
      var grenzen = achsen(B, anzahl);
      opt_licht = true;   // wie live: keine Sprossen in Ober- und Unterlichtern
      for (var j = 0; j < anzahl; j++) {
        var xx = feldLinks(grenzen, j, anzahl, pfostenSichtbar),
            fb2 = feldRechts(grenzen, j, anzahl, pfostenSichtbar) - xx;
        /* Am OBERlicht sitzt laut Drutex kein Griff: bedient wird über eine Ausstellschere oben
           und eine senkrechte Bedienstange am seitlichen Rahmen — der Oberlichtöffner (K S. 72/73,
           Recherche 07 vom 16.09.2026). Betrieb wollte am Kipp sichtbare Bedienung; gezeichnet wird
           deshalb nicht nichts und auch kein erfundener Griff, sondern der Öffner, den es gibt.
           Mit `oberlicht.bedienung: 'griff'` lässt sich ausdrücklich ein Griff bestellen.
           Am UNTERlicht ist der Flügel erreichbar, dort bleibt der Griff der Normalfall. */
        var oeffner = !unten && art === 'kipp' && !(opt && opt.bedienung === 'griff');
        feldZeichnen(xx, y, fb2, h, art, { ohneGriff: oeffner || (opt && opt.ohneGriff) });
        // Die Bedienstange sitzt innen am Rahmen — von außen ist sie nicht zu sehen.
        if (oeffner && j === 0 && !aussenAnsicht) beschlag.push(oberlichtOeffner(x, y, h));
        if (j < anzahl - 1) teile.push(profilStreifen(xx + fb2, y, pfostenSichtbar(), h, true, 'pfosten'));
      }
      opt_licht = false;
    }

    /* Bedienstange am seitlichen Blendrahmen, von der Ausstellschere am Oberlicht nach unten in
       Reichhöhe, unten ein kurzer Bediengriff. Länge als Anteil des Hauptfeldes, weil Drutex
       keine Reichhöhe nennt und die Skizze ohnehin nicht maßstäblich ist. */
    function oberlichtOeffner(x, y, h) {
      var Z = function (e) { return zeichenmass(daten, 'beschlag', e); },
          sb = Z('oeffnerStangeBreite'), gh = Z('oeffnerGriffHoehe'),
          sx = x - sys.arb / 2,
          bis = y + h + (gesamtH - (y + h)) * Z('oeffnerLaengeAnteil');
      return '<g data-teil="oberlichtoeffner">' +
        rechteck(sx - sb / 2, y + h * 0.45, sb, bis - (y + h * 0.45), 'url(#skz-alu)', BAND_KONTUR, dickeFein * 0.7,
                 ' rx="' + z(sb * 0.4) + '"') +
        rechteck(sx - sb * 0.85, bis - gh, sb * 1.7, gh, 'url(#skz-alu)', BAND_KONTUR, dickeFein * 0.7,
                 ' rx="' + z(sb * 0.75) + '"') + '</g>';
    }

    /* --- Maßketten -------------------------------------------------------- */
    var mass = [];
    /* Beim Rollladen steht das Breitenmaß über dem Kasten, nicht darin. Liegt der
       Gurtwickler/Motor rechts, rücken die Höhenmaße über ihn hinaus. */
    var massRechts = B + vR + schrift * 0.9;
    if (antriebSichtbar && k.rollladen.seite !== 'links') {
      massRechts = B + vR + antriebAussen(antriebAus(k.rollladen), H, k.rollladen.antriebsart, sys.arb) + schrift * 0.9;
      randR = Math.max(randR, massRechts - B - vR + schrift * 2.6);
    }
    var obenY = -vO - schrift * 0.9;
    if (vL > 0 || vR > 0) {
      // innere Reihe: Verbreiterung | Fenster | Verbreiterung, äußere Reihe: Gesamtbreite
      var tfv = schrift * 0.82,
          // zu eng (Zahlen der Verbreiterung laufen in die Breitenzahl)? Dann stehen sie neben den Kettenenden
          obenEng = staffelWaagerecht([[-vL, 0, vL + ''], [0, B, B + ''], [B, B + vR, vR + '']].filter(function (st) { return st[1] > st[0]; }), tfv)
            .some(function (v) { return v > 0; });
      if (vL > 0) mass.push(akzentWenn('verbreiterung', massWaagerecht(-vL, 0, obenY, vL + '', tfv, dickeFein, -1, obenEng ? -1 : 0)));
      mass.push(offenWenn('breite', akzentWenn('breite', massWaagerecht(0, B, obenY, B + '', tfv, dickeFein))));
      if (vR > 0) mass.push(akzentWenn('verbreiterung', massWaagerecht(B, B + vR, obenY, vR + '', tfv, dickeFein, -1, obenEng ? 1 : 0)));
      // äußere Gesamtkette 1,6 statt 1,45 Schrifthöhen darüber: eine kurze, hochgerückte Verbreiterungszahl (30) stieß
      // sonst an ihren Endstrich (Wächter „Zahlen frei“, 500 × 500 auf der Handy-Bühne, 30.09.2026)
      mass.push(massWaagerecht(-vL, B + vR, obenY - schrift * 1.6, (vL + B + vR) + '', schrift, dickeFein));
      randO = Math.max(randO, schrift * 4.0);
    } else {
      mass.push(offenWenn('breite', akzentWenn('breite', massWaagerecht(0, B, obenY, B + '', schrift, dickeFein))));
    }
    // Ohne Lichter ist die Rahmenhöhe die bestellte Höhe; mit Lichtern steht sie links als Teilmaß (mitteH)
    var gesamtBezug = (kastenInHoehe || lichterInHoehe) > 0;   // Höhe = Gesamthöhe → äußere Kette ist die Eingabe
    var rechtsArt = (olH || ulH || gesamtBezug) ? null : 'hoehe';
    mass.push(offenWenn(rechtsArt, akzentWenn(rechtsArt, massSenkrecht(y0, y0 + H, massRechts, H + '', schrift, dickeFein))));
    /* Die linke Maßspalte weicht einem links sitzenden Gurtwickler oder Motor aus — vorher lag
       der Wickler genau auf der Höhen-Maßlinie und der Motor deckte die Zahl „215“ zu. */
    var linksX = -vL - schrift * 0.9;
    if (antriebSichtbar && k.rollladen.seite === 'links') {
      linksX = -vL - antriebAussen(antriebAus(k.rollladen), H, k.rollladen.antriebsart, sys.arb) - schrift * 0.9;
      randL = Math.max(randL, -linksX - vL + schrift * 1.4);
    }
    /* Alle Teilmaße der linken Spalte werden erst gesammelt und dann gemeinsam entzerrt
       (kettenTexteEntzerren), damit sich kurze Nachbarmaße nicht überdecken. */
    var linksKette = [];
    function linksMass(y1, y2, x, text, tf, art) { linksKette.push({ y1: y1, y2: y2, x: x, text: text, schrift: tf, art: art || null }); }
    if (vO > 0) linksMass(-vO, 0, linksX, vO + '', schrift * 0.82, 'verbreiterung');
    if (vU > 0) linksMass(gesamtH, gesamtH + vU, linksX, vU + '', schrift * 0.82, 'verbreiterung');
    if (schwH > 0) linksMass(y0 + H, gesamtH, linksX, schwH + '', schrift * 0.82);
    /* Fix 22.09.2026 (Design-Kritik #7, „doppelte Maßlinien bei extremen Größen": eine
       1800×2100-Balkontür mit Schwelle zeigte „2100“ UND „2120“ nebeneinander — zwei Zahlen,
       die sich nur um 20 mm unterscheiden, lesen sich wie zwei widersprüchliche
       Gesamthöhenangaben, nicht wie Element + Schwelle. Für die Balkontür MIT Schwelle und
       SONST keinem weiteren Zusatzteil reicht die zweiteilige Kette (Elementhöhe H links am
       Rahmen + Schwellenhöhe schwH als eigenes kleines Maß) — die dritte, addierte
       Gesamthöhen-Zahl fällt hier weg, weil sie in diesem Fall nichts zeigt, was die zwei
       anderen Zahlen nicht schon zeigen. Kommt zur Schwelle noch ein Rollladenkasten oder eine
       Verbreiterung dazu, bleibt die addierte Gesamtkette wie bisher — dort macht sie den
       Unterschied zwischen mehreren Teilmaßen sichtbar. */
    var nurSchwelleOhneSonst = (schwH > 0 && rollH === 0 && vO === 0 && vU === 0);
    if ((rollH > 0 || schwH > 0 || vO > 0 || vU > 0) && !nurSchwelleOhneSonst) {
      /* Die Kastenhöhe steht neben dem Kasten, der Wickler hängt tiefer am Rahmen — sie muss ihm
         nicht ausweichen und bleibt dicht am Objekt (Betrieb 26.09.2026: „die 175 muss näher“). */
      if (rollH > 0) linksMass(0, rollH, -vL - schrift * 0.9, rollH + '', schrift);
      mass.push(offenWenn(gesamtBezug ? 'hoehe' : null, akzentWenn(gesamtBezug ? 'hoehe' : null, massSenkrecht(-vO, gesamtH + vU, massRechts + schrift * 1.7, (vO + gesamtH + vU) + '', schrift, dickeFein))));
      /* Die zweite Maßspalte (Gesamthöhe) braucht rechts Platz für ihre Zahl — sonst schneidet
         der Bildausschnitt sie ab. Aufgefallen 16.09.2026 an der Balkontürschwelle: 2120 fehlte. */
      randR = Math.max(randR, massRechts - B + schrift * 3.1);
    }
    /* Höhen-Teilmaße müssen sich zur Gesamthöhe addieren, genau wie die Breiten-Teilmaße. Bis
       16.09.2026 standen nur Ober- und Unterlicht in der Kette — bei 2200 mm mit zwei 400ern
       waren 1400 mm unbemaßt, und der Kunde konnte die Kette nicht nachrechnen. Bezug ist der
       Rahmen (y0 … y0+H), nicht die lichte Öffnung, sonst geht die Summe wieder nicht auf. */
    if (olH > 0 || ulH > 0) {
      var mitteH = HF, tf = schrift * 0.82, tx = linksX;
      if (olH > 0) linksMass(y0, y0 + olH, tx, olH + '', tf, 'oberlicht_hoehe');
      if (mitteH > 0) linksMass(y0 + olH, y0 + H - ulH, tx, mitteH + '', tf, (kastenInHoehe || lichterInHoehe) ? null : 'hoehe');
      if (ulH > 0) linksMass(y0 + H - ulH, y0 + H, tx, ulH + '', tf, 'unterlicht_hoehe');
    }
    // Je Spalte (x) entzerren — der Kasten steht neben einem links sitzenden Antrieb in einer eigenen.
    var spalten = {};
    linksKette.forEach(function (st) { (spalten[z(st.x)] = spalten[z(st.x)] || []).push(st); });
    Object.keys(spalten).forEach(function (sx) {
      kettenTexteEntzerren(spalten[sx].sort(function (a, b) { return a.y1 - b.y1; })).forEach(function (st) {
        mass.push(offenWenn(st.art, akzentWenn(st.art, massSenkrecht(st.y1, st.y2, st.x, st.text, st.schrift, dickeFein, -1, 0, st.mitte))));
      });
    });
    var unterStaffel = 0;
    /* Ohne Breite (Beispielskizze) KEINE Teilkette unten (88/Betrieb 30.09.2026, 3-flügelig: „leere Maßkette mit Teilstrichen
       ohne Zahlen“) — die Teilmaße hängen an der Breite; gestrichelt ohne Zahl sah das wie ein Fehler aus. */
    if (n > 1 && massOffenListe.indexOf('breite') < 0) {
      var unterStuecke = [];
      for (var m = 0; m < n; m++) unterStuecke.push([hauptAchsen[m], hauptAchsen[m + 1], (hauptAchsen[m + 1] - hauptAchsen[m]) + '']);
      var unterVersatz = staffelWaagerecht(unterStuecke, schrift * 0.82);
      unterStaffel = Math.max.apply(null, unterVersatz);
      unterStuecke.forEach(function (st, j) {
        // unter der Zeichnung, Zahl unter der Linie — also außen, nicht zwischen Linie und Rahmen
        mass.push(massWaagerecht(st[0], st[1], gesamtH + vU + schrift * 0.7, st[2], schrift * 0.82, dickeFein, 1, 0, unterVersatz[j]));
      });
    }

    /* --- Unterschrift ----------------------------------------------------- */
    /* Unter der Zeichnung steht bei mehreren Flügeln die Teilmaßkette, ihre Zahlen UNTER der
       Linie. Die Unterschrift rückt um diese Zeile nach unten, sonst kleben „800 | 800“ an
       „Ansicht von innen“. */
    var ketteUnten = (n > 1) ? schrift * 0.95 + unterStaffel : 0,
        uy = gesamtH + vU + ketteUnten,
        mitteX = (B + vR - vL) / 2;
    randU += ketteUnten;
    var ansichtText = titelMitPos(k, aussenAnsicht ? 'Ansicht von außen' : 'Ansicht von innen'),
        unterschrift, zeileY;
    if (kompakt) {
      zeileY = uy + schrift * 2.4;
      unterschrift = ansichtsZeileKompakt(ansichtText, mitteX, zeileY, schrift);
    } else {
      unterschrift =
        '<text x="' + z(mitteX) + '" y="' + z(uy + schrift * 2.4) +
          '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="' +
          z(schrift * TITEL) + '" fill="' + FARBE.massText + '">' + ansichtText + '</text>';
      /* Pflichthinweis (Absprache Neubau-Sitzung 14.09.2026): Pfosten-/Stulpbreiten und Griffe
         sind Zeichenannahmen bzw. Symbolmaße. Beschriftet werden nur die Kundenmaße. */
      unterschrift += '<text x="' + z(mitteX) + '" y="' + z(uy + schrift * 3.55) +
        '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
        z(schrift * HINWEIS_G) + '" fill="' + FARBE.strichFein + '">' + HINWEIS + '</text>';
      /* Laien kennen die Strichart nicht — steht ein gestricheltes Symbol in der Zeichnung, wird
         es in einer Zeile erklärt (der Entwurf ISO 7519 verlangt eine Symbollegende). */
      zeileY = uy + schrift * 4.5;
      if (strichelungGezeichnet) {
        unterschrift += '<text data-teil="legende" x="' + z(mitteX) + '" y="' + z(uy + schrift * 4.35) +
          '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * 0.66) + '" fill="' + FARBE.strichFein + '">' + LEGENDE_STRICH + '</text>';
        zeileY += schrift * 0.95;
        randU += schrift * 0.95;
      }
      if (k.farbName) {
        unterschrift += '<text x="' + z(mitteX) + '" y="' + z(zeileY) +
          '" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' +
          z(schrift * 0.8) + '" fill="' + FARBE.strichFein + '">' + esc(k.farbName) + '</text>';
        zeileY += schrift * 1.05;
      }
      if (k.schriftfeld) {
        var sfb = schriftfeldBlock(k, B, gesamtH, daten, zeileY, schrift, mitteX, dickeFein);
        unterschrift += sfb.svg;
        zeileY = sfb.zeileY;
        // Platz nach unten: alles, was über die Grundhöhe hinausgeht
        randU = Math.max(randU, zeileY - gesamtH + schrift * 0.2);
        // Die Zeilen sind breiter als die Zeichnung — der Ausschnitt wächst seitlich mit
        randL = Math.max(randL, (sfb.breite - (B + vL + vR)) / 2 + schrift * 0.4);
        randR = Math.max(randR, (sfb.breite - (B + vL + vR)) / 2 + schrift * 0.4);
      }
    }

    /* --- Rahmen zusammensetzen -------------------------------------------- */
    var Bges = B + vL + vR;
    if (!kompakt) {
      randL = randFuerHinweis(randL, Math.max(Bges, bue.b), schrift);
      randR = randFuerHinweis(randR, Math.max(Bges, bue.b), schrift);
    }
    var vbX = -vL - randL, vbY = -vO - randO,
        vbB = Bges + randL + randR,
        vbH = vO + gesamtH + vU + randO + randU;
    var vb = buehnenAusschnitt(bue, vbX, vbY, vbB, vbH, randL, randR, randO, randU);
    vbX = vb.box[0]; vbY = vb.box[1]; vbB = vb.box[2]; vbH = vb.box[3];

    /* Jede Skizze bekommt eigene Verlaufsnamen. Sonst verlieren alle Skizzen einer Seite
       ihre Verläufe, sobald die erste unsichtbar ist (z. B. im zugeklappten Warenkorb). */
    // Rauschen-Overlay ZUERST als eigene Anweisung bilden (registriert sein <pattern> in
    // defsStufe3) — sonst wertet '+' die <defs>-Verkettung vor diesem Aufruf aus, und die
    // Kachel fehlt in <defs> (Fund Design-Review 22.09.2026, Test „idPraefix ... ohne Ziel“).
    var rauschenOverlay = stufe3Rauschen(0, y0, B, gesamtH);
    return mindestStriche(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
      z(vbX) + ' ' + z(vbY) + ' ' + z(vbB) + ' ' + z(vbH) +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + ' role="img" aria-label="' +
      beschriftung(k, B, gesamtH) + '">' +   // Gesamtmaß wie im Schriftfeld (mit Kasten/Schwelle)
      '<defs>' + glasDef(glasMotivAus(k), bue.bezug) + TIEFE_DEF + GRIFF_DEFS + defsStufe3.join('') + '</defs>' +
      grund(vb.box[0], vb.box[1], vb.box[2], vb.box[3]) +
      versetzt(vb, teile.join('') + beschlag.join('') + rauschenOverlay + mass.join('') + unterschrift) +
      '</svg>'), vb.box).replace(SKZ_ID_REGEX, 'skz-' + uid + '-$1');
  }

  function beschriftung(k, B, H) {
    // Wortlaut wie im Schriftfeld (30.09.2026, Screenreader/BFSG): Fenster „Fenstermaß“, Türen „Türmaß“, Gesamtmaß
    var was = { fenster: 'Fenster', balkon: 'Balkontür', haustuer: 'Haustür', schiebe: 'Schiebetür' }[k.produkt] || 'Fenster',
        wort = (!k.produkt || k.produkt === 'fenster') ? 'Fenstermaß' : 'Türmaß';
    return was + ', ' + wort + ' ' + B + ' mal ' + H + ' Millimeter, ' +
      ((k.ansicht === 'aussen') ? 'Ansicht von außen' : 'Ansicht von innen');
  }

  /* ============================================================ Kartenbilder
   * Kleine Auswahlkarten für den Konfigurator (Haustür-Flügel/Bauart/Öffnung,
   * Insektenschutz-Bauart) — feste Bühne 600×400, ruhiger Linienstil wie der Zeichenmotor,
   * KEINE Maßketten, KEIN Schriftfeld, KEIN Text (nur die Silhouette, damit die Karte bei
   * jeder Kachelgröße lesbar bleibt). Wiederverwendet Blendrahmen/Flügel/Griff/Band aus
   * zeichneHaustuer und das Öffnungssymbol (`oeffnungsSymbol`/`gestrichelt`) unverändert —
   * dieselbe Norm-Konvention (Leitregeln.md Regel 7: breite Seite an den Bändern, Spitze zum
   * Griff) und dieselbe Strichart-Regel (Kommentar bei `gestrichelt()` oben: gestrichelt =
   * „öffnet vom Betrachter weg"). Auftrag 22.09.2026. */
  var KARTE_B = 600, KARTE_H = 400;

  function karteRand(inhalt) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + KARTE_B + ' ' + KARTE_H +
      '" preserveAspectRatio="xMidYMid meet"' + kastenAttr + '>' +
      '<rect x="0" y="0" width="' + KARTE_B + '" height="' + KARTE_H + '" fill="#ffffff"/>' +
      inhalt + '</svg>';
  }

  /* Ein Türflügel als einfache Silhouette (Blendrahmen + Flügelrahmen + Füllungsfläche),
     ohne Muster/Beschlag-Realismus — reicht für die Auswahlkarte, die nur die Kontur zeigt.
     Eine Haustür steht HOCH (Koordinator-Korrektur 22.09.2026: Flügel wurden quer wie ein
     Fenster gezeichnet — Seitenverhältnis jetzt fest wie ein echter Türflügel, ~1 : 2,1
     Breite:Höhe, siehe recherche/zeichenvorlage-haustuer.md). `bandLinks` = Bänder/
     Öffnungssymbol links, `griff` = Drücker zeichnen (nur am Gehflügel). */
  function karteTuerfluegel(x, y, b, h, bandLinks, griff) {
    var d = 2.2, r = Math.min(b, h) * 0.05, fl = Math.min(b, h) * 0.07, g = '<g>';
    g += rechteck(x, y, b, h, '#eef0f2', FARBE.strich, d, ' rx="' + z(r * 0.3) + '"');
    g += rechteck(x + fl, y + fl, b - 2 * fl, h - 2 * fl, FARBE.glas, FARBE.strichFein, d * 0.7);
    if (griff) g += karteGriff(x, y, b, h, bandLinks);
    return g + '</g>';
  }

  /* Drücker als Langschild (Rosette) + gerader Hebelbalken — dieselbe Form wie tuerBeschlag()
     oben, nur ohne Bestelldaten auf feste Kartenmaße herunterskaliert. Der Hebel zeigt VON den
     Bändern WEG (Koordinator-Auftrag 22.09.2026: bisher nur ein schwarzer Punkt — kein Beschlag
     erkennbar). Montagepunkt nahe der bandfernen Kante, wie am echten Flügel (schlossX in
     zeichneHaustuer). */
  function karteGriff(x, y, b, h, bandLinks) {
    // Koordinator-Korrektur 22.09.2026: der Hebel ragte über die Flügelkante hinaus in den
    // Kartenrand (mx bei 0,8·b PLUS Hebellänge 0,34·b = 1,14·b, außerhalb des Flügels). Jetzt
    // wie am echten Türblatt (zeichneHaustuer/tuerBeschlag): Langschild nahe der Schließkante,
    // Hebel zeigt zur Schließkante, endet aber MIT Abstand davor — bleibt vollständig im Flügel.
    var lb = Math.min(b, h) * 0.16, lh = lb * 1.9, my = y + h * 0.5,
        weg = bandLinks ? 1 : -1, db = lb * 0.42,
        kante = bandLinks ? x + b : x,           // Schließkante (bandfern)
        randKante = b * 0.06,                     // Sicherheitsabstand Hebelspitze -> Kante
        dl = b * 0.22,                             // Hebellänge
        ende = kante - weg * randKante,            // Hebelspitze, innerhalb der Kante
        mx = ende - weg * dl,                      // Langschild/Rose, weiter zur Bandseite hin
        g = '<g data-teil="griff">';
    // Langschild (Rosette)
    g += rechteck(mx - lb / 2, my - lh / 2, lb, lh, GRIFF.weiss ? GRIFF.weiss.rosette : '#f4f5f6', FARBE.strich, 1.4, ' rx="' + z(lb / 2) + '"');
    // Profilzylinder
    g += '<circle cx="' + z(mx) + '" cy="' + z(my + lh * 0.32) + '" r="' + z(lb * 0.24) + '" fill="#aeb5bb" stroke="' + FARBE.strich + '" stroke-width="1"/>';
    // Hebelbalken, weg von den Bändern
    g += rechteck(Math.min(mx, ende), my - db / 2, Math.abs(ende - mx), db, FARBE.beschlag, FARBE.strich, 1.2, ' rx="' + z(db / 2) + '"');
    // Rose am Drehpunkt
    g += '<circle cx="' + z(mx) + '" cy="' + z(my) + '" r="' + z(lb * 0.3) + '" fill="' + FARBE.strich + '"/>';
    return g + '</g>';
  }

  function karteBaender(x, y, b, h, bandLinks) {
    var bx = bandLinks ? x + b * 0.03 : x + b * 0.97, kb = h * 0.025, kh = h * 0.09, g = '<g data-teil="band">';
    [0.15, 0.5, 0.85].forEach(function (a) {
      g += rechteck(bx - kb / 2, y + h * a - kh / 2, kb, kh, '#c7ccd1', FARBE.strichFein, 1.4, ' rx="' + z(kb * 0.3) + '"');
    });
    return g + '</g>';
  }

  /* Feste Kartengeometrie für die Haustür-Karten: ein Flügel füllt die volle Kartenhöhe minus
     Rand, im Seitenverhältnis ~1 : 2,1 (Breite : Höhe) wie ein echter Türflügel — NICHT quer
     wie ein Fenster (Koordinator-Korrektur 22.09.2026). Zwei Flügel stehen nebeneinander,
     Standflügel 0,6× so breit wie der Gehflügel, beide dieselbe Höhe; die Gruppe steht
     mittig auf der Karte. */
  var TUER_VERHAELTNIS = 2.1, TUER_STAND_FAKTOR = 0.6, TUER_RAND = 34, TUER_LUECKE = 8;
  function tuerKartenMasse() {
    var h = KARTE_H - TUER_RAND * 2, gehB = h / TUER_VERHAELTNIS;
    return { h: h, y: TUER_RAND, gehB: gehB, standB: gehB * TUER_STAND_FAKTOR };
  }

  var BAUART_DIN = { 'din-l': { din: 'links', zwei: false }, 'din-r': { din: 'rechts', zwei: false },
    '2fl-din-l': { din: 'links', zwei: true }, '2fl-din-r': { din: 'rechts', zwei: true } };

  /* Eine Karte, die Bauart (Anschlag) UND Öffnungsrichtung gemeinsam zeigt — Marktstandard
     (Koordinator-Auftrag 22.09.2026): eine Frage mit 4 Karten statt zwei getrennten Fragen.
     `bauartId` wie in BAUART_DIN (din-l/din-r/2fl-din-l/2fl-din-r), `oeffnungId` innen/aussen. */
  function anschlagInhalt(bauartId, oeffnungId) {
    var ba = BAUART_DIN[bauartId];
    if (!ba) throw new Error('kartenbild: Bauart kennt nur din-l/din-r/2fl-din-l/2fl-din-r, nicht „' + bauartId + '“');
    if (oeffnungId !== 'innen' && oeffnungId !== 'aussen') throw new Error('kartenbild: Öffnung kennt nur innen/aussen, nicht „' + oeffnungId + '“');
    // Ansicht von innen (DIN 107, Leitregeln.md Regel 7): DIN links = Band links, wie tuerDin()/
    // zeichneHaustuer oben (bandLinks = aussen ? din==='rechts' : din==='links'; hier immer
    // Innenansicht, also bandLinks = din==='links').
    var bandLinksB = ba.din === 'links', mB = tuerKartenMasse(),
        symArt = bandLinksB ? 'dreh-l' : 'dreh-r', dSym = 1.6, inh;
    // Strichart nach `gestrichelt()`-Kommentar oben und Leitregeln.md Regel 7: gestrichelt = Flügel
    // öffnet VOM Betrachter weg (= „außen"), durchgezogen = öffnet ZUM Betrachter hin (= „innen").
    function sym(x1, y1, x2, y2) {
      var s = oeffnungsSymbol(symArt, x1, y1, x2, y2, dSym);
      return oeffnungId === 'aussen' ? gestrichelt(s, dSym) : s;
    }
    if (!ba.zwei) {
      var xB = (KARTE_B - mB.gehB) / 2;
      inh = karteTuerfluegel(xB, mB.y, mB.gehB, mB.h, bandLinksB, true) +
        karteBaender(xB, mB.y, mB.gehB, mB.h, bandLinksB) +
        sym(xB + mB.gehB * 0.12, mB.y + mB.h * 0.14, xB + mB.gehB * 0.88, mB.y + mB.h * 0.86);
    } else {
      var totalB = mB.gehB + mB.standB + TUER_LUECKE, startB = (KARTE_B - totalB) / 2,
          gehX = bandLinksB ? startB : startB + mB.standB + TUER_LUECKE,
          standX = bandLinksB ? startB + mB.gehB + TUER_LUECKE : startB;
      inh = karteTuerfluegel(standX, mB.y, mB.standB, mB.h, bandLinksB, false) +
        karteTuerfluegel(gehX, mB.y, mB.gehB, mB.h, bandLinksB, true) +
        karteBaender(gehX, mB.y, mB.gehB, mB.h, bandLinksB) +
        sym(gehX + mB.gehB * 0.1, mB.y + mB.h * 0.14, gehX + mB.gehB * 0.9, mB.y + mB.h * 0.86);
    }
    return inh;
  }

  /* Haustür-Aufteilung (Merkmal haustuer.seitenteil, 16 Karten: ohne/bauform-1…7, je ein- und
     zweiflügelig mit Präfix „2fl-“) — Auftrag Haustür-Sitzung 26.09.2026, statt KI-Symbolbildern.
     Ansicht von AUSSEN, ohne Bänder und ohne Öffnungssymbol (Anschlag wird erst danach gewählt),
     keine Maßzahlen: Drutex zeigt die sieben Bauformen nur als Bild (D S. 100/101). Proportionen
     wie in der großen Skizze (Zeichenannahmen haustuer.seitenteilAnteil 0,7 der Türbreite,
     oberlichtAnteil 0,2 der Höhe) und in allen 16 Karten dieselbe Türgröße. Oberlicht nur über der
     Tür, Seitenteile bis zur Rahmenoberkante (siehe BAUFORM_SEITENTEIL). Griff zum Seitenteil hin,
     wie im Katalogbild; ohne einseitiges Seitenteil rechts; zweiflügelig am Gehflügel an der Stulpfuge. */
  var AUFTEIL_F = 7, AUFTEIL_ST = 0.7, AUFTEIL_OL = 0.2;
  function karteFestfeld(x, y, b, h) {
    return '<g data-teil="festfeld">' + rechteck(x, y, b, h, FARBE.glas, FARBE.strichFein, 1.5) +
      festFeldKennung(x, y, x + b, y + h) + '</g>';
  }
  function seitenteilInhalt(wert) {
    var zwei = /^2fl-/.test(wert), id = zwei ? wert.slice(4) : wert, bf = null;
    if (id !== 'ohne') {
      var m = /^bauform-([1-7])$/.exec(id);
      if (!m) throw new Error('kartenbild: haustuer_seitenteil kennt ohne/bauform-1…7 (optional mit 2fl-), nicht „' + wert + '“');
      bf = BAUFORM_SEITENTEIL[m[1]];
    }
    var f = AUFTEIL_F, hInnen = KARTE_H - 2 * TUER_RAND - 2 * f,
        olH = AUFTEIL_OL * hInnen, tH = hInnen - olH - f,
        gehB = tH / TUER_VERHAELTNIS, standB = gehB * TUER_STAND_FAKTOR,
        tuerB = zwei ? gehB + TUER_LUECKE + standB : gehB,
        stB = AUFTEIL_ST * gehB,
        mitOl = !!(bf && bf.oberlichtTuer), li = !!(bf && bf.links), re = !!(bf && bf.rechts),
        gesB = f + (li ? stB + f : 0) + tuerB + (re ? f + stB : 0) + f,
        gesH = f + (mitOl ? olH + f : 0) + tH + f,
        x0 = (KARTE_B - gesB) / 2, y0 = (KARTE_H - gesH) / 2,
        xT = x0 + f + (li ? stB + f : 0), yT = y0 + gesH - f - tH,
        g = rechteck(x0, y0, gesB, gesH, '#eef0f2', FARBE.strich, 2.2, ' rx="1"');
    if (li) g += karteFestfeld(x0 + f, y0 + f, stB, gesH - 2 * f);
    if (re) g += karteFestfeld(xT + tuerB + f, y0 + f, stB, gesH - 2 * f);
    if (mitOl) g += karteFestfeld(xT, y0 + f, tuerB, olH);
    if (!zwei) {
      // bandLinks = Griff rechts; Seitenteil links (Nr. 1/6) holt den Griff nach links
      g += karteTuerfluegel(xT, yT, gehB, tH, !(li && !re), true);
    } else {
      g += karteTuerfluegel(xT, yT, standB, tH, false, false) +
        karteTuerfluegel(xT + standB + TUER_LUECKE, yT, gehB, tH, false, true);
    }
    return g;
  }

  /* Schiebetür-Öffnungsart (Merkmal schiebetuer.bauart), 26.09.2026 — alle fünf Werte als Zeichnung,
     damit die Gruppe EINE Bildsprache hat (vorher zwei KI-Fotos, die drei HS-Mehrteiler ohne Bild).
     Ansicht von innen wie die große Skizze: Festfeld mit dem Kreuz aus oeffnungsSymbol('fest'),
     Schiebeflügel mit Flügelrahmen und Pfeil in Schieberichtung (pfeil() der Schiebetür-Skizze).
     Keine Maße. hs3-l/hs3-r/hs4 sind im Katalog „marktüblich, vorläufig“ — die Karte zeigt nur
     Feldfolge und Richtung, wie der Katalog sie beschreibt (fest · Schiebeflügel · fest bzw.
     zwei Schiebeflügel, die zur Mitte hin auseinander öffnen). */
  var SCHIEBE_KARTE = {
    'schiebe-r': ['fest', 'links'], 'schiebe-l': ['rechts', 'fest'],
    'hs3-l': ['fest', 'links', 'fest'], 'hs3-r': ['fest', 'rechts', 'fest'],
    'hs4': ['fest', 'links', 'rechts', 'fest']
  };
  function schiebeBauartInhalt(wert) {
    var felder = SCHIEBE_KARTE[wert];
    if (!felder) throw new Error('kartenbild: schiebetuer_bauart kennt ' + Object.keys(SCHIEBE_KARTE).join('/') + ', nicht „' + wert + '“');
    var n = felder.length, rand = 34, h = KARTE_H - 2 * rand, f = 8,
        feldB = Math.min((KARTE_B - 2 * rand - 2 * f) / n, h * 0.62),
        gesB = feldB * n + 2 * f, x0 = (KARTE_B - gesB) / 2, y0 = rand,
        g = rechteck(x0, y0, gesB, h, '#eef0f2', FARBE.strich, 2.2, ' rx="1"');
    felder.forEach(function (art, i) {
      var x = x0 + f + i * feldB, y = y0 + f, b = feldB, hh = h - 2 * f;
      if (art === 'fest') {
        g += rechteck(x + 2, y, b - 4, hh, FARBE.glas, FARBE.strichFein, 1.5) +
          oeffnungsSymbol('fest', x, y, x + b, y + hh, 1.6);
      } else {
        var fl = Math.min(b, hh) * 0.08;
        g += rechteck(x + 1, y, b - 2, hh, '#eef0f2', FARBE.strich, 2) +
          rechteck(x + 1 + fl, y + fl, b - 2 - 2 * fl, hh - 2 * fl, FARBE.glas, FARBE.strichFein, 1.4);
        var py = y + hh * 0.72, l = b * 0.5, mx = x + b / 2;
        g += art === 'links' ? pfeil(mx + l / 2, mx - l / 2, py, 0, 2.4) : pfeil(mx - l / 2, mx + l / 2, py, 0, 2.4);
      }
    });
    return g;
  }

  function kartenbild(art, wert) {
    var inhalt;
    festKennungH = 0;   // Karten: „F“ nach Feldgröße, nicht von der zuletzt gezeichneten Skizze erben
    tuerAlu = null; tuerFluegelBreit = false;   // Karten: nie die Maße der zuletzt gezeichneten Tür erben
    switch (art) {
      /* -------------------------------------------------- Haustür: ein/zwei Flügel */
      case 'haustuer_fluegel': {
        if (wert !== 'ein' && wert !== 'zwei') throw new Error('kartenbild: haustuer_fluegel kennt nur ein/zwei, nicht „' + wert + '“');
        var mF = tuerKartenMasse();
        if (wert === 'ein') {
          var xF = (KARTE_B - mF.gehB) / 2;
          inhalt = karteTuerfluegel(xF, mF.y, mF.gehB, mF.h, false, true);
        } else {
          var totalF = mF.gehB + mF.standB + TUER_LUECKE, startF = (KARTE_B - totalF) / 2;
          inhalt = karteTuerfluegel(startF, mF.y, mF.standB, mF.h, false, false) +
            karteTuerfluegel(startF + mF.standB + TUER_LUECKE, mF.y, mF.gehB, mF.h, false, true);
        }
        break;
      }
      /* -------------------------------------------------- Schiebetür: Öffnungsart — siehe
         schiebeBauartInhalt() */
      case 'schiebetuer_bauart': {
        inhalt = schiebeBauartInhalt(String(wert || ''));
        break;
      }
      /* -------------------------------------------------- Haustür: Aufteilung (Seitenteil/
         Oberlicht, ein-/zweiflügelig) — siehe seitenteilInhalt() */
      case 'haustuer_seitenteil': {
        inhalt = seitenteilInhalt(String(wert || ''));
        break;
      }
      /* -------------------------------------------------- Haustür: Anschlag + Öffnung, EINE
         Frage mit 8 Karten (`<bauart>:<oeffnung>`, Koordinator-Auftrag 22.09.2026 — Marktstandard
         statt zwei getrennter Fragen). Ansicht von innen, Bänder + Griff sichtbar, „aussen"
         gestrichelt (siehe anschlagInhalt). */
      case 'haustuer_anschlag': {
        var teileW = String(wert || '').split(':');
        if (teileW.length !== 2) throw new Error('kartenbild: haustuer_anschlag erwartet „<bauart>:<oeffnung>", nicht „' + wert + '“');
        inhalt = anschlagInhalt(teileW[0], teileW[1]);
        break;
      }
      /* -------------------------------------------------- Haustür: Bauart/Anschlag (DIN)
         Dünner Kompatibilitäts-Wrapper (Koordinator-Entscheid 22.09.2026, siehe kartenbild.test.mjs
         „Kompatibilität"): die vier Konfigurator-Karten haben `haustuer_anschlag` ersetzt (eine
         Frage statt zwei), diese Art bleibt nur für alten Code/alte Vorschauen bestehen — feste
         Öffnung „innen" (Konfigurator-Vorgabe, keine eigene Bedeutung mehr). */
      case 'haustuer_bauart': {
        if (!BAUART_DIN[wert]) throw new Error('kartenbild: haustuer_bauart kennt nur din-l/din-r/2fl-din-l/2fl-din-r, nicht „' + wert + '“');
        inhalt = anschlagInhalt(wert, 'innen');
        break;
      }
      /* -------------------------------------------------- Haustür: Öffnungsrichtung
         Dünner Kompatibilitäts-Wrapper (wie oben) — feste Bauart „din-r" (keine eigene Bedeutung
         mehr, nur damit alte Aufrufe mit `innen`/`aussen` weiterhin ein Bild bekommen). */
      case 'haustuer_oeffnung': {
        if (wert !== 'innen' && wert !== 'aussen') throw new Error('kartenbild: haustuer_oeffnung kennt nur innen/aussen, nicht „' + wert + '“');
        inhalt = anschlagInhalt('din-r', wert);
        break;
      }
      /* -------------------------------------------------- Insektenschutz-Bauart: delegiert
         an sonnenschutz.js (dort dieselbe Zeichenlogik wie insektenschutzSvg — Faltenpaket +
         Gleitpfeil). Nur geladen, wenn `window.skizzeSonnenschutz`/`global.skizzeSonnenschutz`
         verfügbar ist (siehe Kopfkommentar dort). */
      case 'insektenschutz_bauart': {
        var son = (typeof global !== 'undefined' && global.skizzeSonnenschutz) ||
          (typeof window !== 'undefined' && window.skizzeSonnenschutz);
        if (!son || !son.kartenbild) throw new Error('kartenbild: sonnenschutz.js (skizzeSonnenschutz) nicht geladen — vor skizze2.js einbinden');
        return son.kartenbild(art, wert);
      }
      default:
        throw new Error('kartenbild: unbekannte Art „' + art + '“');
    }
    return karteRand(inhalt);
  }

  global.skizze2 = {
    zeichne: zeichne,
    oeffnungZeilen: oeffnungZeilen,
    oeffnungKlartext: oeffnungKlartext,
    kartenbild: kartenbild,
    GRIFF: GRIFF,
    GRIFF_STIL: GRIFF_STIL,
    FARBE: FARBE
  };
})(typeof window !== 'undefined' ? window : this);
