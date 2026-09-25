/* DeineFenster.de: Herstellervideos auf Produktseiten.
   Kopfbereich: Video läuft stumm in Schleife. Kino-Abschnitt: Video folgt der Scrollposition.
   Videos laden nur am Rechner (ab 768 px), ohne "Bewegung reduzieren" und ohne Datensparmodus,
   und erst, wenn sie ins Bild kommen. Sonst bleibt das Standbild stehen. */
(function () {
  'use strict';
  var weit = window.matchMedia('(min-width: 768px)').matches;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sparen = navigator.connection && navigator.connection.saveData;
  if (!weit || ruhig || sparen || !('IntersectionObserver' in window)) return;

  function laden(video) {
    if (video.src) return;
    video.src = video.getAttribute('data-src');
    video.load();
  }

  // Kopfbereich: abspielen, solange sichtbar
  document.querySelectorAll('.produkt-held video[data-src]').forEach(function (video) {
    new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) {
          laden(video);
          video.play().then(function () { video.classList.add('laeuft'); }).catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 }).observe(video);
  });

  // Kino-Abschnitt: Scrollfortschritt durch den Abschnitt = Zeit im Video
  document.querySelectorAll('.kino').forEach(function (abschnitt) {
    var video = abschnitt.querySelector('video[data-src]');
    var balken = abschnitt.querySelector('.kino__fortschritt');
    if (!video) return;
    var aktiv = false, ziel = 0, geplant = false;

    function anteil() {
      var r = abschnitt.getBoundingClientRect();
      var weg = r.height - window.innerHeight * 0.5;
      return Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(weg, 1)));
    }
    function zeichnen() {
      geplant = false;
      var a = anteil();
      if (balken) balken.style.setProperty('--kino-anteil', a.toFixed(3));
      if (video.readyState >= 1 && video.duration) {
        ziel = a * (video.duration - 0.05);
        if (Math.abs(video.currentTime - ziel) > 0.03) video.currentTime = ziel;
      }
    }
    function beimScrollen() {
      if (aktiv && !geplant) { geplant = true; requestAnimationFrame(zeichnen); }
    }
    new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        aktiv = e.isIntersecting;
        if (aktiv) { laden(video); video.classList.add('laeuft'); beimScrollen(); }
      });
    }, { rootMargin: '200px 0px' }).observe(abschnitt);
    video.addEventListener('loadedmetadata', beimScrollen);
    window.addEventListener('scroll', beimScrollen, { passive: true });
  });
})();
