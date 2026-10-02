/* DeineFenster.de: Produktseite – Entscheidungshilfe, Profilschnitt-Punkte, Vorher-Nachher-Schieber,
   hochzählende Zahlen, Sprungleiste und Ratgeber-Verzeichnis mit aktivem Abschnitt.
   Ohne JavaScript bleiben alle Inhalte sichtbar; bei „Bewegung reduzieren“ entfallen die Animationen. */
(function () {
  'use strict';
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Entscheidungshilfe: Empfehlung nur aus Katalogwerten (data-hilfe) */
  document.querySelectorAll('[data-hilfe]').forEach(function (hilfe) {
    var d = JSON.parse(hilfe.getAttribute('data-hilfe'));
    var form = hilfe.querySelector('form');
    var erg = hilfe.querySelector('.hilfe__ergebnis');
    function wert(n) { var x = form.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : ''; }
    /* Regeln je Seite aus dem Bauskript: erste passende Regel gewinnt, die letzte ({}) ist der Standard */
    function zeigen() {
      var r = d.regeln.filter(function (x) {
        return Object.keys(x.wenn).every(function (n) { return wert(n) === x.wenn[n]; });
      })[0];
      var k = r.ziel, anfrage = erg.querySelector('[data-anfrage]');
      erg.classList.remove('neu'); void erg.offsetWidth; if (!ruhig) erg.classList.add('neu');
      erg.querySelector('[data-name]').textContent = k.name;
      erg.querySelector('[data-warum]').textContent = r.warum;
      erg.querySelector('[data-bautiefe]').textContent = k.bautiefe;
      erg.querySelector('[data-uw]').textContent = k.uw;
      if (anfrage) anfrage.hidden = !k.anfrage;
      var link = erg.querySelector('[data-link]'); if (link && k.link) link.href = k.link;
    }
    form.addEventListener('change', zeigen);
    zeigen();
  });

  /* Profilschnitt: Punkte öffnen eine kurze Erklärung */
  document.querySelectorAll('.hotspot').forEach(function (b) {
    var karte = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var schnitt = b.closest('.schnitt'); if (schnitt) schnitt.classList.add('schnitt--entdeckt');
      var auf = b.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.hotspot[aria-expanded="true"]').forEach(function (x) {
        x.setAttribute('aria-expanded', 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = true;
      });
      b.setAttribute('aria-expanded', auf ? 'true' : 'false'); karte.hidden = !auf;
    });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    document.querySelectorAll('.hotspot[aria-expanded="true"]').forEach(function (x) {
      x.setAttribute('aria-expanded', 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = true; x.focus();
    });
  });

  /* Vorher-Nachher-Schieber */
  document.querySelectorAll('[data-schieber]').forEach(function (f) {
    var r = f.querySelector('input[type="range"]');
    r.addEventListener('input', function () { f.style.setProperty('--pos', r.value + '%'); });
  });

  /* Zahlen zählen beim Einscrollen hoch */
  if (!ruhig && 'IntersectionObserver' in window) {
    var zo = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return; zo.unobserve(x.target);
        var el = x.target, ziel = +el.getAttribute('data-zaehlen'), t0 = null;
        function schritt(t) { if (!t0) t0 = t; var a = Math.min(1, (t - t0) / 900); el.textContent = Math.round(ziel * (1 - Math.pow(1 - a, 3))); if (a < 1) requestAnimationFrame(schritt); }
        requestAnimationFrame(schritt);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-zaehlen]').forEach(function (el) { zo.observe(el); });
  }

  /* Sprungleiste und Ratgeber-Verzeichnis: aktiven Abschnitt hervorheben */
  function aktiv(listeSel, attr) {
    var links = Array.prototype.slice.call(document.querySelectorAll(listeSel));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var ziele = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        var i = ziele.indexOf(x.target);
        links.forEach(function (a, j) { a.parentElement.classList.toggle('ist-aktiv', i === j); if (i === j && attr) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        /* 02.10.: aktiven Punkt in der waagerecht wischbaren Leiste sichtbar halten (nur die Leiste scrollen, nie die Seite) */
        var li = links[i] && links[i].parentElement, ul = li && li.parentElement;
        if (attr && ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: Math.max(0, li.offsetLeft - 16), behavior: ruhig ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ziele.forEach(function (z) { if (z) o.observe(z); });
  }
  aktiv('.sprungleiste a', true);

  /* 02.10.: Kacheln neigen sich leicht zur Maus (nur feine Zeiger, nicht bei „Bewegung reduzieren“) */
  if (!ruhig && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.zkachel, .kollektion, .rest__karte').forEach(function (k) {
      k.addEventListener('pointermove', function (ev) {
        var r = k.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
        k.style.setProperty('--ny', (x * 6).toFixed(2) + 'deg'); k.style.setProperty('--nx', (-y * 6).toFixed(2) + 'deg');
      });
      k.addEventListener('pointerleave', function () { k.style.removeProperty('--nx'); k.style.removeProperty('--ny'); });
    });
  }

  /* Sprungleiste: Ziel landet sicher unter der Leiste. 01.10. UX-Prüfung: Während des sanften Scrollens laden
     Bilder oberhalb nach, das Ziel rutscht nach unten und die Überschrift lag bis 800 px außerhalb des Bildes.
     Darum nach dem Scrollen nachmessen und bis zu dreimal nachkorrigieren. */
  document.querySelectorAll('.sprungleiste a, .leseteil__inhalt a').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var ziel = document.querySelector(a.getAttribute('href'));
      if (!ziel) return;
      ev.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      var n = 0;
      function hin(art) { ziel.scrollIntoView({ behavior: art, block: 'start' }); }
      function pruefen() {
        var soll = (parseFloat(getComputedStyle(ziel).scrollMarginBlockStart) || 0) + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
        if (Math.abs(ziel.getBoundingClientRect().top - soll) > 6 && n++ < 5) { hin('auto'); setTimeout(pruefen, 250); }
      }
      hin(ruhig ? 'auto' : 'smooth');
      if ('onscrollend' in window) window.addEventListener('scrollend', function f() { window.removeEventListener('scrollend', f); pruefen(); });
      else setTimeout(pruefen, 900);
    });
  });
  aktiv('.leseteil__inhalt a', false);
})();
