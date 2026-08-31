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

  /* ─── Volltextsuche · Schreibweisen zusammenfuehren ──────────────────────
     Bisher war die Suche ein reiner Substring-Vergleich. Wer "haustuer" ohne
     Umlaut tippte, bekam 0 Treffer, "Haustueren" im Plural genau 1, und
     "nach aussen oeffnend" fand die Ware nicht, weil das Merkmal intern
     "nach-aussen-oeffnend" heisst — mit Bindestrichen. Hier werden beide Seiten
     auf dieselbe Form gebracht: Umlaute ausgeschrieben, alles was kein
     Buchstabe/Ziffer ist wird zum Trennzeichen. */
  function normText(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /* Kundenwoerter auf die Bezeichnung im Shop bringen. Wer "Eingangstuer"
     sucht, meint eine Haustuer — im Bestand heisst sie aber nie so. */
  var SYNONYME = [
    [/\b(eingangstuer|eingangstueren|hauseingangstuer|hauseingangstueren|wohnungstuer|wohnungstueren|haustuere|haustueren|eingangstur|haustur)\b/g, 'haustuer'],
    [/\b(terrassentuer|terrassentueren|balkontuere|balkontueren|balkonelement|balkonelemente)\b/g, 'balkontuer'],
    [/\b(hebeschiebetuer|hebeschiebetueren|schiebetuere|schiebetueren|psk|hst)\b/g, 'schiebetuer'],
    [/\b(dachflaechenfenster|velux|roto)\b/g, 'dachfenster'],
    [/\b(garagentore|garagendoor|garagen tor)\b/g, 'garagentor'],
    // Richtungsangabe: Kunden schreiben sie frei, im Datensatz steht ein fester Begriff
    [/\bnach aussen (aufgehend|aufgeht|oeffnet|oeffnend|schlagend)\b/g, 'nach aussen oeffnend'],
    [/\boeffnet nach aussen\b/g, 'nach aussen oeffnend'],
    [/\bnach innen (aufgehend|aufgeht|oeffnet|schlagend)\b/g, 'nach innen oeffnend']
  ];
  function normSuche(s) {
    var t = normText(s);
    for (var i = 0; i < SYNONYME.length; i++) t = t.replace(SYNONYME[i][0], SYNONYME[i][1]);
    return t;
  }

  /* Deutsche Plural-/Flexionsendung abschneiden, damit "Haustueren" die
     "Haustuer" findet. Nur bei laengeren Woertern — sonst wird aus "Rollo" ein Stummel. */
  function stamm(w) {
    return w.length > 5 ? w.replace(/(en|er|es|e|n|s)$/, '') : w;
  }

  /* Trifft die Suche den Text?
     1. Zuerst die ganze Suche als zusammenhaengende Phrase — normalisiert, also
        findet "haustuer" die "Haustür" und "nach aussen oeffnend" das intern
        mit Bindestrichen gespeicherte Merkmal. Das ist der praezise Weg und
        deckt auch Teilwoerter ab ("fenster" findet "Kellerfenster").
     2. Trifft die Phrase nicht, wortweise UND-verknuepft, Reihenfolge egal —
        Solche Treffer bleiben sichtbar, sortieren sich bei "Relevanz" aber
        hinter die, in denen die Suche woertlich zusammenhaengend steht.
        damit "haustuer weiss" auch "Haustuer 1000 x 2100 weiss" findet.
        Nur fuer reine Wortsuchen: sobald eine Zahl oder ein sehr kurzes Wort
        dabei ist, bliebe es bei Schritt 1 — sonst wuerde "2 Fluegel" ueber die
        einzelne "2" in jedem Maß landen. */
  function textTreffer(query, text) {
    var q = normSuche(query);
    if (!q) return true;
    var hay = normText(text);
    if (hay.indexOf(q) !== -1) return true;                    // 1) Phrase

    var worte = q.split(' ').filter(Boolean);
    if (worte.length < 2) {
      // Einzelwort: zusaetzlich die Stammform pruefen ("Haustueren" -> "haustuer")
      return hay.split(' ').some(function (hw) { return hw.indexOf(stamm(worte[0])) === 0; });
    }
    for (var i = 0; i < worte.length; i++) {
      if (worte[i].length <= 2 || /\d/.test(worte[i])) return false;   // 2) nur reine Wortsuchen
    }
    var hayWorte = hay.split(' ').filter(Boolean);
    for (var k = 0; k < worte.length; k++) {
      var w = worte[k], st = stamm(w), ok = false;
      if (hay.indexOf(w) !== -1) continue;                      // Teilwort wie bisher
      for (var j = 0; j < hayWorte.length; j++) {
        if (hayWorte[j].indexOf(st) === 0) { ok = true; break; }
      }
      if (!ok) return false;
    }
    return true;
  }

  var api = { normNr: normNr, nummerTreffer: nummerTreffer,
              normText: normText, normSuche: normSuche, stamm: stamm, textTreffer: textTreffer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.normNr = normNr;
  root.nummerTreffer = nummerTreffer;
  root.normText = normText;
  root.normSuche = normSuche;
  root.textTreffer = textTreffer;
})(typeof window !== 'undefined' ? window : globalThis);
