/* DeineFenster.de: Farbwähler auf Produktseiten. Klick oder Pfeiltasten wechseln das Produktbild
   und den Farbnamen. Ohne JavaScript bleibt die erste Farbe stehen, alle Namen sind im HTML lesbar. */
(function () {
  'use strict';
  document.querySelectorAll('[data-farbwahl]').forEach(function (wahl) {
    var bild = wahl.querySelector('.farbwahl__bild');
    var name = wahl.querySelector('[data-farbname]');
    var gruppe = wahl.querySelector('[data-farbgruppe]');
    var knoepfe = Array.prototype.slice.call(wahl.querySelectorAll('.farbe'));
    var produkt = (bild.getAttribute('alt') || '').split(' in ')[0];

    function waehlen(k, fokus) {
      knoepfe.forEach(function (b) {
        var an = b === k;
        b.setAttribute('aria-checked', an ? 'true' : 'false');
        b.tabIndex = an ? 0 : -1;
      });
      if (fokus) k.focus();
      var neu = k.getAttribute('data-bild');
      if (bild.getAttribute('src') === neu) return;
      var vor = new Image();
      vor.onload = function () {
        bild.classList.add('wechselt');
        setTimeout(function () {
          bild.src = neu;
          bild.alt = produkt + ' in ' + k.getAttribute('data-name') + ', Außenansicht (Farbdarstellung)';
          bild.classList.remove('wechselt');
        }, 120);
      };
      vor.src = neu;
      name.textContent = k.getAttribute('data-name');
      gruppe.textContent = k.getAttribute('data-gruppe');
    }
    knoepfe.forEach(function (k, i) {
      k.addEventListener('click', function () { waehlen(k, false); });
      k.addEventListener('keydown', function (ev) {
        var s = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (ev.key === 'Home') s = -i; if (ev.key === 'End') s = knoepfe.length - 1 - i;
        if (s === undefined) return;
        ev.preventDefault();
        waehlen(knoepfe[(i + s + knoepfe.length) % knoepfe.length], true);
      });
    });
  });
})();
