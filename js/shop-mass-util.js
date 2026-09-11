/* Shop · Maß-Bewertung: Wie genau trifft ein Artikel das gesuchte Maß?
   Ohne Kennzeichnung sieht der Kunde in der Ergebnisliste nicht, welcher Artikel sein
   Maß wirklich hat und welcher 8 cm daneben liegt — beide stehen gleich da.
   Geprüft werden die Hauptmaße des Inserats und jedes Maß-Paar aus Titel und
   Beschreibung (Sammel-Auktionen mit Preistabelle). Es gewinnt das Paar, das am
   nächsten am Wunsch liegt.

   Breite bleibt Breite, Höhe bleibt Höhe. Ein Fenster 1200 × 1500 ist kein Treffer für
   die Suche 1500 × 1200: Beschlag, Kippfunktion, DIN-Richtung, Griffhöhe und ein
   Rollladenkasten sitzen fest, und die Maueröffnung ist ohnehin nicht drehbar.
   Genau das war der Fehler bis 10.09.2026 — jedes Textmaß wurde zusätzlich vertauscht
   gewertet, wodurch 42 % aller grünen „Genau dein Maß"-Bänder falsch waren.

   Läuft im Browser (window) und in node (module.exports) — damit testbar.
   Rückgabe: { stufe, achsen, breite, hoehe, db, dh, summe } oder null, wenn nichts passt.
   db/dh sind vorzeichenbehaftet (negativ = Artikel ist kleiner als gewünscht). */
(function (root) {

  /* Alle Breite×Höhe-Paare aus einem Text ziehen. Drei- und vierstellig, damit
     Glasaufbauten wie „4x16x4" nicht als Fenstermaß gelesen werden. */
  function parseMasse(text) {
    var re = /(\d{3,4})\s*[x×*]\s*(\d{3,4})/gi, out = [], m;
    while ((m = re.exec(text)) !== null) out.push([parseInt(m[1], 10), parseInt(m[2], 10)]);
    return out;
  }

  var MASS_FAST_MM = 20;   // bis 2 cm je Seite gilt als „fast genau" — so weit geht
                           // ein Fenster real noch in dieselbe Öffnung

  function massBewertung(p, f) {
    if (f.breite === null && f.hoehe === null) return null;
    var tol = f.toleranz / 100;
    var inTol = function (val, ziel) {
      return ziel == null || (val >= ziel * (1 - tol) && val <= ziel * (1 + tol));
    };

    var kandidaten = [];
    if (p.breite_mm > 0 && p.hoehe_mm > 0) kandidaten.push([p.breite_mm, p.hoehe_mm]);
    parseMasse((p.titel || '') + ' \n ' + (p.beschreibung || '')).forEach(function (paar) {
      kandidaten.push(paar);   // Reihenfolge im Text ist Breite × Höhe — nicht drehen
    });

    var best = null;
    for (var i = 0; i < kandidaten.length; i++) {
      var b = kandidaten[i][0], h = kandidaten[i][1];
      if (!inTol(b, f.breite) || !inTol(h, f.hoehe)) continue;
      var db = f.breite === null ? 0 : b - f.breite;
      var dh = f.hoehe  === null ? 0 : h - f.hoehe;
      var summe = Math.abs(db) + Math.abs(dh);
      if (!best || summe < best.summe) best = { breite: b, hoehe: h, db: db, dh: dh, summe: summe };
    }
    if (!best) return null;

    /* Welche Achsen hat der Kunde überhaupt vorgegeben? Wer nur die Breite eingibt,
       darf kein „Genau dein Maß" lesen — geprüft wurde nur die Breite. */
    best.achsen = (f.breite !== null && f.hoehe !== null) ? 'beide'
                : (f.breite !== null ? 'breite' : 'hoehe');

    var groesste = Math.max(Math.abs(best.db), Math.abs(best.dh));
    best.stufe = groesste === 0 ? 'exakt' : (groesste <= MASS_FAST_MM ? 'fast' : 'aehnlich');
    return best;
  }

  var api = { parseMasse: parseMasse, massBewertung: massBewertung, MASS_FAST_MM: MASS_FAST_MM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.parseMasse = parseMasse;
  root.massBewertung = massBewertung;
  root.MASS_FAST_MM = MASS_FAST_MM;
})(typeof window !== 'undefined' ? window : globalThis);
