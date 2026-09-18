/* Shop · Archiv-Status beim Bearbeiten bewahren.

   Der reale Fehler (gefunden 18.09.2026): Wer ein archiviertes Inserat nachträglich
   korrigierte, stellte es dabei still wieder in den Kunden-Shop. Ursache war eine
   Kette aus zwei Stellen: das Einstell-Formular schickte beim Speichern immer
   `aktiv: true` mit, und das Schreiben ersetzte den Datensatz komplett
   (`produkte[idx] = { id, ...eintrag }`). Der archivierte Zustand hatte damit keine
   Chance, das Speichern zu überleben — betroffen waren 13 Inserate zwischen dem
   01.09. und dem 11.09.2026, jedes mit dem harmlos klingenden Commit-Titel
   „Inserat aktualisiert".

   Die Regel hier ist deshalb bewusst eng: Ob ein Inserat im Shop sichtbar ist,
   entscheiden ausschließlich „Archivieren" und „Wieder aktivieren" — niemals das
   Bearbeiten-Formular. Ein Bearbeiten-Vorgang, der `aktiv` nicht ausdrücklich und
   bewusst mitbringt, erbt den gespeicherten Stand.

   `aktiv` ist absichtlich nur dann „archiviert", wenn es exakt `false` ist — dieselbe
   Lesart wie in shop.js (`p.aktiv === false`). Ein fehlendes Feld heißt „aktiv", damit
   Alt-Inserate ohne das Feld sichtbar bleiben. */
(function (root) {
  'use strict';

  /* Ist dieser gespeicherte Datensatz archiviert? */
  function istArchiviert(produkt) {
    return !!produkt && produkt.aktiv === false;
  }

  /* Baut den zu schreibenden Datensatz beim Bearbeiten.
     vorher  = der gespeicherte Datensatz (aus der Produktdatei)
     eintrag = was das Formular schickt
     Rückgabe: eintrag, aber mit dem Archiv-Stand von `vorher`, solange der
     Aufrufer nicht ausdrücklich etwas anderes will (archivSetzen). */
  function bewahreArchivStatus(vorher, eintrag, archivSetzen) {
    var neu = {};
    for (var k in eintrag) if (Object.prototype.hasOwnProperty.call(eintrag, k)) neu[k] = eintrag[k];

    /* Ausdrücklicher Wunsch („Archivieren"/„Wieder aktivieren") gewinnt immer. */
    if (archivSetzen === true || archivSetzen === false) {
      neu.aktiv = !archivSetzen;
      return neu;
    }
    /* Sonst zählt der gespeicherte Stand, nicht das Formular. */
    neu.aktiv = !istArchiviert(vorher);
    return neu;
  }

  var api = { istArchiviert: istArchiviert, bewahreArchivStatus: bewahreArchivStatus };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.istArchiviert = istArchiviert;
  root.bewahreArchivStatus = bewahreArchivStatus;
})(typeof window !== 'undefined' ? window : globalThis);
