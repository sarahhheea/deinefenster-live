/* Shop-Suche · tolerante Standnummer-Erkennung
   Problem: Kunde nennt die Nummer als "741B", "Nr 741" oder "Nummer 741 B",
   in den Produktdaten steht sie als "741 B" (mit Leerzeichen). Reiner Textvergleich
   findet dann nichts. Lösung: beide Seiten auf reine Ziffern+Buchstaben normalisieren.
   Läuft im Browser (window) und in node (module.exports) — damit testbar. */
(function (root) {
  function normNr(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      // führende Bezeichner wie "Nr.", "Nummer", "Stand", "Artikelnr" entfernen
      .replace(/\b(standnummer|stand-?nr|artikelnr|artikel|nummer|stand|nr|art)\.?\s*/g, '')
      // alle Trenner raus: Leerzeichen, Punkt, Bindestrich, Slash, Unterstrich
      .replace(/[\s.\-–—_/]/g, '');
  }

  // Passt die (eingetippte) Suche auf eine konkrete Standnummer?
  function nummerTreffer(query, standnummer) {
    if (!standnummer) return false;
    var q = normNr(query);
    if (!/\d/.test(q)) return false;   // nur echte Nummern-Suchen (nicht "kellerfenster")
    if (q.length < 2) return false;    // einzelne Ziffer soll nicht alles matchen
    var s = normNr(standnummer);
    return !!s && s.indexOf(q) !== -1;
  }

  var api = { normNr: normNr, nummerTreffer: nummerTreffer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.normNr = normNr;
  root.nummerTreffer = nummerTreffer;
})(typeof window !== 'undefined' ? window : globalThis);
