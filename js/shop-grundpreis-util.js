/* Grundpreis je m² für Flächenware (Dämmung).
 *
 * § 4 PAngV: Wer Ware nach Fläche verkauft, muss neben dem Endpreis den Preis
 * je Maßeinheit angeben. Bei uns betrifft das die Dämmrollen.
 *
 * Die Fläche steckt nicht in breite_mm/hoehe_mm — das ist bei Rollen die
 * Dicke bzw. Bahnbreite. Sie steht im Titel oder in der Beschreibung,
 * z. B. „6,24 qm“. Genau von dort lesen wir sie.
 *
 * Wird in js/shop.js und in test/shop-grundpreis.test.js verwendet.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ShopGrundpreis = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  // Kategorien, die nach Fläche verkauft werden.
  var FLAECHENWARE = ['daemmung'];

  // Zahl + Flächeneinheit: „6,24 qm“ / „18,72 m2“ / „5.52 m²“ / „6,24 Quadratmeter“.
  // Die Einheit ist Pflicht, damit „150 mm“ nicht als Fläche durchgeht.
  // m² steht ohne Wortgrenze, weil „²“ selbst kein Wortzeichen ist und \b
  // dahinter nie greifen würde.
  var FLAECHE = /(\d+(?:[.,]\d+)?)\s*(?:m²|qm\b|m2\b|quadratmeter\b)/i;

  function flaecheAusText(text) {
    if (!text) return null;
    var treffer = String(text).match(FLAECHE);
    if (!treffer) return null;
    var wert = parseFloat(treffer[1].replace(',', '.'));
    return isFinite(wert) && wert > 0 ? wert : null;
  }

  /* shop.js benennt beim Laden kategorie_key → kategorie um und legt zusaetzlich
   * kategorie_keys als Array an. Wir pruefen alle drei, sonst greift der
   * Grundpreis in den Rohdaten, aber nicht im laufenden Shop. */
  function istFlaechenware(produkt) {
    if (!produkt) return false;
    var kandidaten = [produkt.kategorie, produkt.kategorie_key]
      .concat(Array.isArray(produkt.kategorie_keys) ? produkt.kategorie_keys : []);
    for (var i = 0; i < kandidaten.length; i++) {
      if (FLAECHENWARE.indexOf(kandidaten[i]) !== -1) return true;
    }
    return false;
  }

  function grundpreisText(preis, flaeche) {
    var p = Number(preis), f = Number(flaeche);
    if (!isFinite(p) || p <= 0) return null;
    if (!isFinite(f) || f <= 0) return null;
    var proQm = p / f;
    return proQm.toFixed(2).replace('.', ',') + ' €/m²';
  }

  /* Bequemer Aufruf aus dem Shop: nimmt das ganze Produkt, sucht die Fläche
   * zuerst im Titel, dann in der Beschreibung. Gibt null zurück, wenn nichts
   * Belastbares gefunden wurde — lieber keine Angabe als eine falsche. */
  function grundpreisFuerProdukt(produkt) {
    if (!istFlaechenware(produkt)) return null;
    var flaeche = flaecheAusText(produkt.titel) || flaecheAusText(produkt.beschreibung);
    var preis = produkt.sonderpreis_eur || produkt.preis_eur;
    return grundpreisText(preis, flaeche);
  }

  return {
    flaecheAusText: flaecheAusText,
    istFlaechenware: istFlaechenware,
    grundpreisText: grundpreisText,
    grundpreisFuerProdukt: grundpreisFuerProdukt
  };
}));
