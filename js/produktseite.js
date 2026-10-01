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
    function zeigen() {
      var wichtig = wert('wichtig'), richtung = wert('richtung'), k, warum;
      if (richtung === 'aussen') { k = d.ext; warum = 'Öffnet nach außen; innen bleibt der Platz vor dem Fenster frei.'; }
      else if (wichtig === 'daemmung') { k = d.energy; warum = 'Der niedrigste Uw-Wert unserer bestellbaren Kunststoffprofile, Dreifachglas serienmäßig. Beim Fenstertausch prüfen, ob die Laibung 82 mm Bautiefe aufnimmt.'; }
      else if (wichtig === 'licht') { k = d.light; warum = 'Die schmale Profilform: weniger Rahmen, mehr Glas.'; }
      else if (wichtig === 'form') { k = d.edge; warum = 'Die moderne, eckige Profilform auf Basis der 82-mm-Technik.'; }
      else { k = d.classic; warum = 'Das bewährte 70-mm-Profil; passt gut in vorhandene Laibungen.'; }
      erg.classList.remove('neu'); void erg.offsetWidth; if (!ruhig) erg.classList.add('neu');
      erg.querySelector('[data-name]').textContent = k.name;
      erg.querySelector('[data-warum]').textContent = warum;
      erg.querySelector('[data-bautiefe]').textContent = k.bautiefe;
      erg.querySelector('[data-uw]').textContent = k.uw;
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
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ziele.forEach(function (z) { if (z) o.observe(z); });
  }
  aktiv('.sprungleiste a', true);
  aktiv('.leseteil__inhalt a', false);
})();
