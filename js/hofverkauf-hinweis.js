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

  /* Nicht ueber Konfigurator, Warenkorb oder Anfrage legen. Dort ist der Kunde mitten in
     der Kaufentscheidung; das Fenster verdeckt die Auswahl und schluckt Klicks auf die
     Auswahlkacheln — es sah dann so aus, als reagiere der Konfigurator nicht mehr. */
  /* Der Pfad wird zuerst normalisiert. Vorher stand hier nur ein Test auf
     "konfigurator.html" - der Webserver liefert dieselbe Seite aber auch unter
     "/konfigurator" und "/konfigurator/" aus, und dort erschien der Hinweis dann
     doch ueber dem Konfigurator (nachgewiesen am 01.09.2026 im Browser). */
  var pfad = location.pathname
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/+$/, '');
  /* shop seit 21.09.2026: dort filtert der Kunde gerade nach seinem Maß. */
  var OHNE_HINWEIS = /(^|\/)(konfigurator|warenkorb|anfrage|shop)$/;
  /* Dort nur die Karte weglassen, nicht das ganze Skript: bis 26.09.2026 stand hier ein
     return, dann fehlte dem Shop der Jahresplan (DF_HOF_PLAN) und er meldete samstags
     „Geschlossen", obwohl der Hof offen hatte. */
  var ohneKarte = OHNE_HINWEIS.test(pfad);

  var KEY        = 'dfHofHinweis_2026_09';
  var CONSENT    = 'df_cookie_consent';
  var VERZOEGERT = 8000;   // war 2000: erst lesen lassen, dann hinweisen (21.09.2026)

  function gesehen()  { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function merken()   { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  function consentDa(){ try { return !!localStorage.getItem(CONSENT); } catch (e) { return false; } }

  /* ── Jahresplan ────────────────────────────────────────────────────────────
     Alle Zeiten an einer Stelle. Wer die Zeiten aendert, aendert nur diesen Block -
     frueher stand jede Angabe einzeln im Text, deshalb blieb ein abgelaufener
     Betriebsurlaub monatelang stehen. */
  var PLAN = {
    samstagVon : '2026-09-01',   // zusaetzlicher Samstag in der Hauptsaison
    samstagBis : '2026-12-05',
    sonderVon  : '2026-12-01',   // Sonderwoche zum Jahresende, taeglich
    sonderBis  : '2026-12-07',
    sonderZu   : ['2026-12-06'], // Sonntag dazwischen
    pauseVon   : '2026-12-08',
    wiederAb   : '2027-01-15',
    /* Einzelne Tage, die von der Regel abweichen: [von, bis] in vollen Stunden, null = zu.
       Tag der Deutschen Einheit (Sa 3.10.2026) zu, dafuer Freitag davor bis 20 Uhr. */
    ausnahmen  : { '2026-10-02': [10, 20], '2026-10-03': null },
    /* Ab wann die Hinweiskarte und die Kopfleiste die Ausnahme ankuendigen */
    ausnahmeHinweisVon : '2026-09-26',
    ausnahmeHinweisBis : '2026-10-03'
  };
  /* Fuer die Oeffnungsanzeige im Shop (js/oeffnungszeiten-util.js) — dieselben Termine,
     keine zweite Kopie. */
  window.DF_HOF_PLAN = PLAN;

  function heute() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2);
  }
  function zwischen(tag, von, bis) { return tag >= von && tag <= bis; }

  var TAG = heute();
  /* Vorlauf: die naechste Regel schon ankuendigen, solange sie noch nicht gilt */
  var samstagLaeuft = zwischen(TAG, PLAN.samstagVon, PLAN.samstagBis);
  var samstagBald   = TAG < PLAN.samstagVon && TAG >= '2026-08-15';
  var sonderBald    = TAG >= '2026-11-15' && TAG < PLAN.sonderVon;
  var sonderLaeuft  = zwischen(TAG, PLAN.sonderVon, PLAN.sonderBis);
  var pause         = TAG >= PLAN.pauseVon && TAG < PLAN.wiederAb;
  var feiertag      = zwischen(TAG, PLAN.ausnahmeHinweisVon, PLAN.ausnahmeHinweisBis);

  /* Eigener Merkschluessel: wer die Samstagskarte schon weggeklickt hat, soll die
     Feiertagsaenderung trotzdem einmal sehen. */
  if (feiertag) KEY = 'dfHofHinweis_2026_10_feiertag';

  function datum(iso) {
    var m = ['Januar','Februar','M\u00e4rz','April','Mai','Juni','Juli','August',
             'September','Oktober','November','Dezember'];
    var p = iso.split('-');
    return parseInt(p[2],10) + '. ' + m[parseInt(p[1],10)-1] + ' ' + p[0];
  }

  function titel() {
    if (feiertag)     return 'Am 3. Oktober geschlossen &ndash; daf&uuml;r Freitag bis 20 Uhr';
    if (pause)        return 'Wir haben Jahrespause';
    if (sonderLaeuft) return 'Diese Woche t&auml;glich ge&ouml;ffnet';
    if (samstagLaeuft || samstagBald || sonderBald) return 'Jetzt auch samstags ge&ouml;ffnet';
    return 'Hofverkauf in Brandenburg an der Havel';
  }

  function zeile(tag, zeit, neu) {
    return '<div class="dfh-zeile"><span class="dfh-tag">' + tag
         + (neu ? '<span class="dfh-neu">' + (neu === true ? 'Neu' : neu) + '</span>' : '') + '</span>'
         + '<span class="dfh-zeit">' + zeit + '</span></div>';
  }

  function zeilen() {
    if (feiertag) {
      return zeile('Freitag, 2. Oktober', '10&ndash;20 Uhr', 'L&auml;nger')
           + zeile('Samstag, 3. Oktober', 'geschlossen');
    }
    if (pause) {
      return zeile('Wieder ge&ouml;ffnet', 'Fr, 15. Januar 2027');
    }
    if (sonderLaeuft) {
      return zeile('Di 1. bis Sa 5. Dezember', '10&ndash;17 Uhr', true)
           + zeile('Montag, 7. Dezember', '10&ndash;17 Uhr', true)
           + zeile('Ab 8. Dezember', 'Jahrespause');
    }
    var s = zeile('Freitag', '10&ndash;17 Uhr');
    if (samstagLaeuft || samstagBald || sonderBald) s += zeile('Samstag', '10&ndash;13 Uhr', true);
    return s;
  }

  function zusatz() {
    if (feiertag)     return 'Samstag ist Tag der Deutschen Einheit. Ab Samstag, 10. Oktober, '
                           + 'wieder wie gewohnt 10\u201313 Uhr.';
    if (pause)        return 'Ab Freitag, 15. Januar 2027 sind wir wieder wie gewohnt f\u00fcr Sie da.';
    if (sonderLaeuft) return 'Letzter Tag in diesem Jahr ist Montag, der 7. Dezember. '
                           + 'Danach Jahrespause bis zum 15. Januar 2027.';
    if (sonderBald)   return 'Zum Jahresabschluss haben wir vom 1. bis 7. Dezember t\u00e4glich '
                           + 'ge\u00f6ffnet. Danach Jahrespause bis zum 15. Januar 2027.';
    if (samstagLaeuft || samstagBald) return 'Samstags ge\u00f6ffnet noch bis zum 5. Dezember 2026.';
    return '';
  }

  function baue() {
    var w = document.createElement('div');
    w.id = 'df-hofhinweis';
    var z = zusatz();
    w.innerHTML =
      '<div class="dfh-karte" role="status" aria-labelledby="dfh-titel">' +
        '<button type="button" class="dfh-zu" data-schliessen="1" aria-label="Hinweis schlie&szlig;en">&times;</button>' +
        '<p class="dfh-eyebrow">Hofverkauf Brandenburg</p>' +
        '<h2 class="dfh-titel" id="dfh-titel">' + titel() + '</h2>' +
        '<div class="dfh-zeiten">' + zeilen() + '</div>' +
        '<p class="dfh-adresse"><b>Fohrder Landstra&szlig;e 13</b> &middot; 14772 Brandenburg an der Havel</p>' +
        (z ? '<p class="dfh-befristung">' + z + '</p>' : '') +
        '<a class="dfh-route" href="https://www.google.com/maps/dir/?api=1&destination=Fohrder+Landstra%C3%9Fe+13%2C+14772+Brandenburg+an+der+Havel" ' +
           'target="_blank" rel="noopener">Route berechnen &rarr;</a>' +
      '</div>';
    return w;
  }

  function zeige() {
    if (gesehen() || document.getElementById('df-hofhinweis')) return;

    var w = baue();
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.classList.add('offen'); });

    /* Bewusst ohne Fokuswechsel und ohne aria-modal: der Hinweis liegt neben dem
       Inhalt, nicht darueber. Wer gerade liest oder tippt, wird nicht unterbrochen. */
    function schliesse() {
      merken();
      w.classList.remove('offen');
      document.removeEventListener('keydown', taste);
      setTimeout(function () {
        if (w.parentNode) w.parentNode.removeChild(w);
      }, 260);
    }
    function taste(e) { if (e.key === 'Escape') schliesse(); }

    w.addEventListener('click', function (e) {
      if (e.target.closest('[data-schliessen]')) schliesse();
    });
    var route = w.querySelector('.dfh-route');
    if (route) route.addEventListener('click', merken);
    document.addEventListener('keydown', taste);
  }

  function start() {
    /* In der Feiertagswoche steht alles in der festen Leiste oben - die Karte waere doppelt. */
    if (ohneKarte || feiertag || gesehen()) return;
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
    var txt;
    if (feiertag)                     txt = '<span class="df-zeiten-lang">Hofverkauf </span>Fr 2.10. 10&ndash;20 &middot; Sa 3.10. geschlossen';
    else if (pause)                   txt = 'Jahrespause &middot; wieder ab Fr 15. Januar';
    else if (sonderLaeuft)            txt = '<span class="df-zeiten-lang">Hofverkauf </span>t&auml;glich 10&ndash;17 Uhr bis 7. Dez.';
    else if (sonderBald)              txt = '<span class="df-zeiten-lang">Hofverkauf </span>Fr 10&ndash;17 &middot; Sa 10&ndash;13 Uhr';
    else if (samstagLaeuft || samstagBald)
                                      txt = '<span class="df-zeiten-lang">Hofverkauf </span>Fr 10&ndash;17 &middot; Sa 10&ndash;13 Uhr';
    else return;
    var n = document.querySelectorAll('.df-zeiten-txt');
    for (var i = 0; i < n.length; i++) n[i].innerHTML = txt;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kopfleiste);
  else kopfleiste();

  /* ── Feste Ankuendigungsleiste ganz oben ─────────────────────────────────
     Fuer Aenderungen, die JEDER sehen muss (Feiertag): nicht wegklickbar, grosse
     Schrift, Signalfarbe. Die kleine Karte wurde leicht uebersehen, am Handy ist die
     Kopfleiste ausgeblendet. Nicht im Kaufablauf (Konfigurator, Warenkorb, Anfrage).
     Die Leiste schiebt die festen Kopfleisten (margin-top) und den Seiteninhalt
     (padding am html) um ihre eigene Hoehe nach unten - --banner-h bleibt unberuehrt,
     weil die Startseite es fuer ihr Suchband selbst setzt. */
  var OHNE_LEISTE = /(^|\/)(konfigurator|warenkorb|anfrage)$/;
  function leiste() {
    if (!feiertag || OHNE_LEISTE.test(pfad) || document.getElementById('df-ankuendigung')) return;
    var css = document.createElement('style');
    css.textContent =
      '#df-ankuendigung{position:fixed;top:0;left:0;right:0;z-index:75;background:#f6cf3f;'
    + 'color:#101c33;border-bottom:2px solid #d9ad12;font-family:"Inter","Switzer",system-ui,sans-serif}'
    + '#df-ankuendigung .dfa-in{max-width:1520px;margin:0 auto;padding:10px clamp(16px,4.5vw,72px);'
    + 'display:flex;align-items:center;justify-content:center;gap:10px 22px;flex-wrap:wrap;'
    + 'font-size:17px;line-height:1.35;text-align:center}'
    + '#df-ankuendigung .dfa-titel{display:flex;align-items:center;gap:8px;font-weight:800}'
    + '#df-ankuendigung .dfa-titel svg{flex:none}'
    + '#df-ankuendigung .dfa-tag{font-weight:600;white-space:nowrap}'
    + '#df-ankuendigung .dfa-tag b{font-weight:800}'
    + '@media(max-width:700px){#df-ankuendigung .dfa-in{flex-direction:column;gap:2px;font-size:16px;padding:8px 16px}}'
    + 'html.df-ank{padding-top:var(--df-ank-h,0px)}'
    + 'html.df-ank .dfnav-util,html.df-ank .dfnav,html.df-ank .util,html.df-ank .topsuche'
    + '{margin-top:var(--df-ank-h,0px)}'
    + 'html.df-ank .cat-tabs{top:calc(var(--banner-h,0px) + 106px + var(--df-ank-h,0px))}'
    + '@media(min-width:1024px){html.df-ank .filter-sidebar{top:calc(128px + var(--df-ank-h,0px));'
    + 'max-height:calc(100vh - 144px - var(--df-ank-h,0px))}}';
    document.head.appendChild(css);
    var el = document.createElement('div');
    el.id = 'df-ankuendigung';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Ge\u00e4nderte \u00d6ffnungszeiten');
    el.innerHTML = '<div class="dfa-in">'
      + '<span class="dfa-titel"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
      + 'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2"/>'
      + '<path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>Ge&auml;nderte &Ouml;ffnungszeiten</span>'
      + '<span class="dfa-tag">Freitag, 2. Oktober: <b>10&ndash;20 Uhr</b></span>'
      + '<span class="dfa-tag">Samstag, 3. Oktober (Feiertag): <b>geschlossen</b></span>'
      + '</div>';
    document.body.insertBefore(el, document.body.firstChild);
    function hoehe() {
      document.documentElement.style.setProperty('--df-ank-h', el.offsetHeight + 'px');
    }
    hoehe();
    document.documentElement.classList.add('df-ank');
    window.addEventListener('resize', hoehe);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', leiste);
  else leiste();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
