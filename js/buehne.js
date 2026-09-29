/* Produktbühne: Umschalter Tag/Abend. Die Hinweispunkte brauchen kein JS (native Popover). */
(function () {
  document.querySelectorAll('.buehne').forEach(function (buehne) {
    buehne.querySelectorAll('.buehne__umschalter button').forEach(function (knopf) {
      knopf.addEventListener('click', function () {
        buehne.setAttribute('data-szene', knopf.getAttribute('data-szene'));
        buehne.querySelectorAll('.buehne__umschalter button').forEach(function (k) { k.setAttribute('aria-pressed', String(k === knopf)); });
      });
    });
  });
})();
/* Offener Hinweispunkt sichtbar markieren (Popover setzt aria-expanded nur im Barrierebaum, nicht im DOM) */
(function () {
  document.querySelectorAll('.buehne__karte[popover]').forEach(function (karte) {
    karte.addEventListener('toggle', function (e) {
      var punkt = document.querySelector('[popovertarget="' + karte.id + '"]');
      if (punkt) punkt.setAttribute('aria-expanded', String(e.newState === 'open'));
    });
  });
})();
