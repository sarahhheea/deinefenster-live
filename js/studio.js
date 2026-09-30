/* DeineFenster.de: Produktstudio. Scrollfortschritt durch die Bahn = Zeit im Video,
   dazu wird das passende Kapitel hervorgehoben. Nur am Rechner (ab 1280 px, gleiche Schwelle wie der Desktop-Kopf), ohne
   "Bewegung reduzieren" und ohne Datensparmodus; sonst bleibt das Standbild stehen. */
(function () {
  'use strict';
  var weit = window.matchMedia('(min-width: 1280px)').matches;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sparen = navigator.connection && navigator.connection.saveData;
  if (!weit || ruhig || sparen || !('IntersectionObserver' in window)) return;

  document.querySelectorAll('.studio').forEach(function (studio) {
    var bahn = studio.querySelector('.studio__bahn');
    var video = studio.querySelector('video[data-src]');
    var balken = studio.querySelector('.studio__fortschritt');
    var kapitel = studio.querySelectorAll('.studio__kapitel li');
    if (!bahn || !video) return;
    studio.classList.add('studio--fahrt');
    var aktiv = false, geplant = false;

    function anteil() {
      var r = bahn.getBoundingClientRect();
      var weg = r.height - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / Math.max(weg, 1)));
    }
    function zeichnen() {
      geplant = false;
      var a = anteil();
      if (balken) balken.style.setProperty('--studio-anteil', a.toFixed(3));
      var nr = Math.min(kapitel.length - 1, Math.floor(a * kapitel.length));
      kapitel.forEach(function (k, i) { k.classList.toggle('ist-aktiv', i === nr); });
      if (video.readyState >= 1 && video.duration) {
        var ziel = a * (video.duration - 0.05);
        if (Math.abs(video.currentTime - ziel) > 0.03) video.currentTime = ziel;
      }
    }
    function beimScrollen() {
      if (aktiv && !geplant) { geplant = true; requestAnimationFrame(zeichnen); }
    }
    new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        aktiv = e.isIntersecting;
        if (aktiv && !video.src) { video.src = video.getAttribute('data-src'); video.load(); }
        if (aktiv) beimScrollen();
      });
    }, { rootMargin: '300px 0px' }).observe(bahn);
    video.addEventListener('loadeddata', function () { video.classList.add('laeuft'); beimScrollen(); });
    window.addEventListener('scroll', beimScrollen, { passive: true });
    zeichnen();
  });
})();
