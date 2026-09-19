/* Öffnungszeiten des Hofverkaufs: Ist gerade offen, und wann öffnet es als Nächstes?
   Die Termine selbst (Samstagssaison, Sonderwoche, Jahrespause) stehen NUR im Jahresplan
   in js/hofverkauf-hinweis.js und kommen hier als PLAN herein — keine zweite Kopie.
   Grundregel: Freitag 10–17 Uhr. Dazu Samstag 10–13 in der Saison, täglich 10–17 in der
   Sonderwoche (außer sonderZu), nichts in der Jahrespause.
   Bis 19.09.2026 kannte die Shop-Anzeige nur den Freitag und meldete samstags
   „Geschlossen", während der Hof offen hatte.
   Läuft im Browser (window) und in node (module.exports) — damit testbar. */
(function (root) {

  function iso(t) {
    return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  }

  /* Öffnungszeit an einem Kalendertag: { von, bis } in vollen Stunden oder null. */
  function oeffnungAm(t, plan) {
    var tag = iso(t), wt = t.getDay();   // 0 = Sonntag, 5 = Freitag, 6 = Samstag
    if (!plan) return wt === 5 ? { von: 10, bis: 17 } : null;
    if (tag >= plan.pauseVon && tag < plan.wiederAb) return null;
    if (tag >= plan.sonderVon && tag <= plan.sonderBis) {
      return (plan.sonderZu || []).indexOf(tag) >= 0 ? null : { von: 10, bis: 17 };
    }
    if (wt === 5) return { von: 10, bis: 17 };
    if (wt === 6 && tag >= plan.samstagVon && tag <= plan.samstagBis) return { von: 10, bis: 13 };
    return null;
  }

  /* { offen, bis, naechste: { tag, von, bis } } — naechste nur, wenn gerade zu. */
  function oeffnungsStatus(jetzt, plan) {
    var heute = oeffnungAm(jetzt, plan), h = jetzt.getHours();
    if (heute && h >= heute.von && h < heute.bis) return { offen: true, bis: heute.bis, naechste: null };
    for (var i = 0; i <= 120; i++) {   // Jahrespause ist gut fünf Wochen lang
      var tag = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() + i);
      var z = oeffnungAm(tag, plan);
      if (!z) continue;
      if (i === 0 && h >= z.von) continue;   // heute schon vorbei
      return { offen: false, bis: null, naechste: { tag: tag, von: z.von, bis: z.bis } };
    }
    return { offen: false, bis: null, naechste: null };
  }

  /* Kurzer Zeiten-Text fuer Hinweiszeilen, z. B. „Fr 10–17 · Sa 10–13 Uhr". */
  function zeitenKurz(jetzt, plan) {
    var tag = iso(jetzt);
    if (!plan) return 'Fr 10\u201317 Uhr';
    function kurzDatum(i) { var p = i.split('-'); return p[2] + '.' + p[1] + '.'; }
    if (tag >= plan.pauseVon && tag < plan.wiederAb) return 'Jahrespause, wieder ab ' + kurzDatum(plan.wiederAb);
    if (tag >= plan.sonderVon && tag <= plan.sonderBis) return 't\u00e4glich 10\u201317 Uhr bis ' + kurzDatum(plan.sonderBis);
    if (tag >= plan.samstagVon && tag <= plan.samstagBis) return 'Fr 10\u201317 \u00b7 Sa 10\u201313 Uhr';
    return 'Fr 10\u201317 Uhr';
  }

  var api = { oeffnungAm: oeffnungAm, oeffnungsStatus: oeffnungsStatus, zeitenKurz: zeitenKurz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.dfOeffnung = api;
})(typeof window !== 'undefined' ? window : this);
