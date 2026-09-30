/* Artikelart im Shop: welche Felder zu welcher Ware gehören.
 *
 * Fehlende Angaben füllt der Shop mit Fenster-Vorgaben („Dreh-Kipp“,
 * „Kunststoff“, „weiß“, „Klarglas“). Das passt nur zu Fenstern und Türen —
 * bei Dämmrollen stand dadurch „Öffnungsart Dreh-Kipp“ in der Detailansicht
 * (30.09.2026). Hier steht, welche Gruppen ohne diese Vorgaben auskommen.
 *
 * Wird in js/shop.js und in test/shop-artikelart.test.js verwendet.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ShopArtikelart = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  // Hauptgruppen (kategorieZuGruppe in shop.js), die keine Fenster sind.
  var OHNE_FENSTER_FELDER = ['daemmung', 'baumaterialien', 'garagentor-gebraucht'];

  function istOhneFensterFelder(gruppe) {
    return OHNE_FENSTER_FELDER.indexOf(gruppe) !== -1;
  }

  function vorgabenFuer(gruppe) {
    if (istOhneFensterFelder(gruppe)) {
      return { material: [], farbe: [], glasart: [], oeffnungsart: [] };
    }
    return { material: ['kunststoff'], farbe: ['weiss'], glasart: ['klarglas'], oeffnungsart: ['dreh-kipp'] };
  }

  // Abhol- und Lieferregel für Dämmung (Sarah 30.09.2026). Gleicher Wortlaut
  // wie im Google-Feed (.github/scripts/json_to_google_feed.py).
  var daemmungAbholText = 'Abholung in Brandenburg an der Havel jederzeit nach Terminabsprache ' +
    '(03381 214 83 73). Lieferung bis 200 km gegen Spritkosten, ab 30 Rollen kostenlos.';

  // Eigenschaft lesbar machen. Freitext (mit Leerzeichen, Doppelpunkt oder
  // Großbuchstaben) bleibt wie eingegeben; nur interne Schlüssel wie
  // „null-schwelle“ werden zu „Null Schwelle“. Vorher machte /\b\w/ ohne
  // Unicode aus „Wärmeleitfähigkeit … W/(m·K)“ ein „WäRmeleitfäHigkeit … W/(M·K)“.
  function lesbarerSchluessel(code) {
    var s = String(code == null ? '' : code);
    if (/[\s:]/.test(s) || s !== s.toLowerCase()) return s.charAt(0).toUpperCase() + s.slice(1);
    return s.replace(/[-_]+/g, ' ').replace(/(^| )(\S)/g, function (m, vor, z) { return vor + z.toUpperCase(); });
  }

  return {
    lesbarerSchluessel: lesbarerSchluessel,
    istOhneFensterFelder: istOhneFensterFelder,
    vorgabenFuer: vorgabenFuer,
    daemmungAbholText: daemmungAbholText
  };
}));
