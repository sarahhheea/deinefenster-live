/* ─────────────────────────────────────────────────────────────
   Hofverkauf-Hinweis — grosses, schliessbares Fenster.
   Erscheint erst nach der Cookie-Entscheidung und nach einer Nutzeraktion
   (Scrollen oder kurze Wartezeit), nie sofort beim Aufruf: ein Fenster, das
   direkt nach dem Klick aus der Suche den Inhalt verdeckt, stuft Google in der
   mobilen Suche zurueck. Mit Verzoegerung greift diese Regel nicht.
   Einmal pro Besucher, die Entscheidung wird gemerkt.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var KEY        = 'dfHofHinweis_2026_09';
  var CONSENT    = 'df_cookie_consent';
  var VERZOEGERT = 2000;

  function gesehen()  { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function merken()   { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  function consentDa(){ try { return !!localStorage.getItem(CONSENT); } catch (e) { return false; } }

  var monat = new Date().getMonth() + 1;
  var saison = monat >= 9 && monat <= 11;   // Samstag gilt September bis November
  var vorlauf = monat === 8;                 // im August als Ankuendigung

  function titel() {
    if (vorlauf || saison) return 'Jetzt auch samstags ge&ouml;ffnet';
    return 'Hofverkauf in Brandenburg an der Havel';
  }

  function zeilen() {
    var s = '<div class="dfh-zeile"><span class="dfh-tag">Freitag</span>'
          + '<span class="dfh-zeit">10&ndash;17 Uhr</span></div>';
    if (saison || vorlauf) {
      s += '<div class="dfh-zeile"><span class="dfh-tag">Samstag'
         + '<span class="dfh-neu">Neu</span></span>'
         + '<span class="dfh-zeit">10&ndash;13 Uhr</span></div>';
    }
    return s;
  }

  function baue() {
    var w = document.createElement('div');
    w.id = 'df-hofhinweis';
    w.innerHTML =
      '<div class="dfh-schleier" data-schliessen="1"></div>' +
      '<div class="dfh-box" role="dialog" aria-modal="true" aria-labelledby="dfh-titel">' +
        '<button type="button" class="dfh-zu" data-schliessen="1" aria-label="Hinweis schlie&szlig;en">&times;</button>' +
        '<p class="dfh-eyebrow">Hofverkauf Brandenburg</p>' +
        '<h2 class="dfh-titel" id="dfh-titel">' + titel() + '</h2>' +
        '<div class="dfh-zeiten">' + zeilen() + '</div>' +
        '<p class="dfh-adresse"><b>Fohrder Landstra&szlig;e 13</b><br>14772 Brandenburg an der Havel</p>' +
        (saison || vorlauf ? '<p class="dfh-befristung">Die Samstagszeiten gelten bis 30. November.</p>' : '') +
        '<div class="dfh-knoepfe">' +
          '<a class="dfh-primaer" href="https://www.google.com/maps?cid=9402028850820563054" ' +
             'target="_blank" rel="noopener">Route berechnen &rarr;</a>' +
          '<button type="button" class="dfh-sekundaer" data-schliessen="1">Sp&auml;ter</button>' +
        '</div>' +
      '</div>';
    return w;
  }

  function zeige() {
    if (gesehen() || document.getElementById('df-hofhinweis')) return;

    var vorher = document.activeElement;
    var w = baue();
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.classList.add('offen'); });

    var box = w.querySelector('.dfh-box');
    if (box) box.focus();

    function schliesse() {
      merken();
      w.classList.remove('offen');
      document.removeEventListener('keydown', taste);
      setTimeout(function () {
        if (w.parentNode) w.parentNode.removeChild(w);
        if (vorher && vorher.focus) { try { vorher.focus(); } catch (e) {} }
      }, 300);
    }
    function taste(e) {
      if (e.key === 'Escape') { schliesse(); return; }
      if (e.key !== 'Tab') return;
      var z = box.querySelectorAll('a[href], button');
      if (!z.length) return;
      var a = z[0], b = z[z.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    }

    w.addEventListener('click', function (e) {
      if (e.target.closest('[data-schliessen]')) schliesse();
    });
    var route = w.querySelector('.dfh-primaer');
    if (route) route.addEventListener('click', merken);
    document.addEventListener('keydown', taste);
  }

  function start() {
    if (gesehen()) return;
    if (!consentDa()) {
      window.addEventListener('df-consent-updated', function () { setTimeout(start, 600); }, { once: true });
      return;
    }
    var los = false;
    function ausloesen() {
      if (los) return;
      los = true;
      window.removeEventListener('scroll', beiScroll);
      zeige();
    }
    function beiScroll() { if (window.scrollY > 100) ausloesen(); }
    window.addEventListener('scroll', beiScroll, { passive: true });
    setTimeout(ausloesen, VERZOEGERT);
  }

  /* Zeitangabe in der Kopfleiste: der Samstag gilt nur in der Saison und wird
     deshalb hier gesetzt statt fest im HTML zu stehen - sonst veraltet er still.
     Im HTML steht die Freitagszeit, die immer stimmt. */
  function kopfleiste() {
    var txt = (saison || vorlauf)
            ? '<span class="df-zeiten-lang">Hofverkauf </span>Fr 10\u201317 &middot; Sa 10\u201313 Uhr'
            : null;
    if (!txt) return;
    var n = document.querySelectorAll('.df-zeiten-txt');
    for (var i = 0; i < n.length; i++) n[i].innerHTML = txt;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kopfleiste);
  else kopfleiste();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
