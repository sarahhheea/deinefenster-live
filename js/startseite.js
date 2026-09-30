/* DeineFenster.de: Startseite. Produkt-Umschalter im Einstieg, Lagerzahlen, frische Lagerware.
   Lagerdaten kommen vom eigenen Server (data/shop-produkte.json) und werden erst nach dem Laden geholt. */
(function () {
  'use strict';

  /* Einstieg: Produkte durchblättern (Pfeile, Punkte, Wischen, Pfeiltasten).
     Klick aufs Bild oder auf die Karte öffnet den Konfigurator beim gezeigten Produkt. */
  var buehne = document.querySelector('[data-hero-buehne]');
  var ebenen = [].slice.call(document.querySelectorAll('[data-hero-ebene]'));
  var punkte = [].slice.call(document.querySelectorAll('[data-hero-punkt]'));
  var karte = document.querySelector('[data-hero-karte]');
  var name = document.querySelector('[data-hero-name]');
  var aktuell = 0, gewischt = false;
  function zeige(n) {
    if (!ebenen.length) return;
    aktuell = (n + ebenen.length) % ebenen.length;
    ebenen.forEach(function (el, i) {
      var an = i === aktuell;
      el.classList.toggle('ist-aktiv', an);
      if (an && el.loading === 'lazy') el.loading = 'eager';
    });
    punkte.forEach(function (p, i) { var an = i === aktuell; p.classList.toggle('ist-aktiv', an); p.setAttribute('aria-pressed', an ? 'true' : 'false'); });
    var el = ebenen[aktuell];
    if (name) name.textContent = el.dataset.name;
    if (karte) {
      karte.setAttribute('href', el.dataset.ziel); karte.setAttribute('aria-label', el.dataset.name + ' konfigurieren');
      var marken = (el.dataset.marken || '').split(' ');
      [].forEach.call(karte.querySelectorAll('[data-marke]'), function (m) { m.hidden = marken.indexOf(m.dataset.marke) < 0; });
    }
  }
  var vor = document.querySelector('[data-hero-vor]');
  var zurueck = document.querySelector('[data-hero-zurueck]');
  if (vor) vor.addEventListener('click', function (e) { e.stopPropagation(); zeige(aktuell + 1); });
  if (zurueck) zurueck.addEventListener('click', function (e) { e.stopPropagation(); zeige(aktuell - 1); });
  punkte.forEach(function (p, i) { p.addEventListener('click', function (e) { e.stopPropagation(); zeige(i); }); });
  if (buehne) {
    buehne.addEventListener('click', function () {
      if (gewischt) { gewischt = false; return; }
      if (karte) window.location.href = karte.getAttribute('href');
    });
    buehne.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); zeige(aktuell - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); zeige(aktuell + 1); }
    });
    var startX = null;
    buehne.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; gewischt = false; }, { passive: true });
    buehne.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX; startX = null;
      if (Math.abs(dx) > 40) { gewischt = true; zeige(aktuell + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
  }

  /* Hofverkauf: jetzt offen oder wann als Nächstes (Jahresplan aus js/hofverkauf-hinweis.js) */
  function hofStatus() {
    var el = document.querySelector('[data-hof-status]');
    if (!el || !window.dfOeffnung) return;
    var plan = window.DF_HOF_PLAN || null, jetzt = new Date();
    var s = window.dfOeffnung.oeffnungsStatus(jetzt, plan);
    if (s.offen) { el.textContent = 'Hof jetzt geöffnet bis ' + s.bis + ' Uhr'; el.classList.add('ist-offen'); }
    else if (s.naechste) {
      var t = new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(s.naechste.tag);
      el.textContent = 'Hof öffnet ' + t + ', ' + s.naechste.von + ' Uhr'; el.classList.remove('ist-offen');
    }
    var kurz = window.dfOeffnung.zeitenKurz(jetzt, plan);
    [].forEach.call(document.querySelectorAll('[data-df-zeiten]'), function (z) { z.textContent = kurz; });
  }
  hofStatus();
  setInterval(hofStatus, 60000);

  /* Lager: zählen und frische Ware zeigen */
  var ZAHL = new Intl.NumberFormat('de-DE');
  var PREIS = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

  function hat(p, praefix) { return (p.kategorie_keys || [p.kategorie_key]).some(function (k) { return String(k || '').indexOf(praefix) === 0; }); }
  function istKat(p, liste) { return (p.kategorie_keys || [p.kategorie_key]).some(function (k) { return liste.indexOf(k) >= 0; }); }
  function feld(p, name) { var v = p[name]; return Array.isArray(v) ? v : (v ? [v] : []); }
  var GRUPPEN = {
    fenster: function (p) { return hat(p, 'fenster-') || istKat(p, ['festelement', 'rundbogenfenster', 'rundfenster', 'holzfenster']); },
    holz: function (p) { return istKat(p, ['holzfenster']) || (hat(p, 'fenster-') && feld(p, 'material').indexOf('holz') >= 0); },
    alu: function (p) { return feld(p, 'material').indexOf('aluminium') >= 0; },
    balkon: function (p) { return hat(p, 'balkontuer-'); },
    schiebe: function (p) { return hat(p, 'schiebetuer'); },
    haustuer: function (p) { return istKat(p, ['haustuer']); },
    tueren: function (p) { return hat(p, 'balkontuer-') || hat(p, 'schiebetuer') || istKat(p, ['haustuer']); },
    rollladen: function (p) { return (p.kategorie_keys || [p.kategorie_key]).some(function (k) { return /-rollo$/.test(String(k || '')); }) || feld(p, 'eigenschaften').indexOf('mit-rollo') >= 0; },
    daemmung: function (p) { return istKat(p, ['daemmung']); },
    alle: function () { return true; }
  };

  function zaehlen(liste) {
    var z = {};
    Object.keys(GRUPPEN).forEach(function (g) {
      z[g] = liste.reduce(function (s, p) { return s + (GRUPPEN[g](p) ? Math.max(1, Number(p.lagerbestand) || 1) : 0); }, 0);
    });
    return z;
  }

  function zahlenEintragen(z) {
    document.querySelectorAll('[data-lager]').forEach(function (el) {
      var g = el.getAttribute('data-lager');
      if (g === 'alle-zahl') { el.textContent = ZAHL.format(z.alle) + ' Stück'; return; }
      var n = z[g];
      if (!n) return;
      if (el.tagName === 'STRONG') el.textContent = ZAHL.format(n) + ' Stück im Lager';
      else el.textContent = ZAHL.format(n) + ' Stück ansehen';
    });
  }

  function text(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

  function frischeWare(liste, kategorien) {
    var ziel = document.querySelector('[data-lager-liste]');
    if (!ziel) return;
    var auswahl = liste.filter(function (p) {
      return feld(p, 'zustand').indexOf('neu') >= 0 && !istKat(p, ['daemmung']) && feld(p, 'bilder').length
        && !p.sonderpreis_eur && !p.export_modell && Number(p.preis_eur) > 0 && Number(p.lagerbestand) === 1
        && Number(p.breite_mm) > 0 && Number(p.hoehe_mm) > 0;
    }).sort(function (a, b) { return String(b.id).localeCompare(String(a.id)); }).slice(0, 6);
    if (auswahl.length < 3) return;
    if (auswahl.length < 6) auswahl = auswahl.slice(0, 3);
    ziel.innerHTML = auswahl.map(function (p) {
      var kat = (p.kategorie_keys || [p.kategorie_key])[0];
      var art = (kategorien && kategorien[kat]) || 'Fenster';
      var mat = feld(p, 'material')[0];
      var matText = mat === 'holz' ? 'Holz' : (mat === 'aluminium' ? 'Aluminium' : 'Kunststoff');
      return '<li><a class="lagerstueck" href="/shop.html?produkt=' + encodeURIComponent(p.id) + '">'
        + '<img src="' + text(feld(p, 'bilder')[0]) + '" alt="' + text(p.titel) + '" width="400" height="300" loading="lazy" decoding="async">'
        + '<span class="lagerstueck__text"><span class="lagerstueck__mass">' + Number(p.breite_mm) + ' × ' + Number(p.hoehe_mm) + ' mm</span>'
        + '<span class="lagerstueck__art">' + text(art) + ' · ' + matText + ' · neu</span>'
        + '<span class="lagerstueck__preis">' + PREIS.format(Number(p.preis_eur)) + ' € <small>inkl. MwSt.</small></span></span></a></li>';
    }).join('');
  }

  var geladen = false;
  function laden() {
    if (geladen) return;
    geladen = true;
    fetch('/data/shop-produkte.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !Array.isArray(d.produkte)) return;
        var aktiv = d.produkte.filter(function (p) { return p.aktiv !== false && Number(p.lagerbestand) !== 0; });
        var kat = {};
        if (Array.isArray(d.kategorien)) d.kategorien.forEach(function (k) { if (k && k.key) kat[k.key] = k.name || k.titel; });
        else if (d.kategorien) kat = d.kategorien;
        zahlenEintragen(zaehlen(aktiv));
        frischeWare(aktiv, kat);
      })
      .catch(function () { /* ohne Daten bleiben die Verweise auf den Shop stehen */ });
  }
  /* Erst nach dem Laden der Seite: das Einstiegsbild hat Vorrang */
  if (document.readyState === 'complete') (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(laden);
  else window.addEventListener('load', function () {
    (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(laden);
  });
})();

// Schnellstart: Material gibt es nur bei Fenstern. Bei anderen Produkten ausblenden und
// abschalten, damit kein falsches &material= in der Adresse landet.
(function () {
  var form = document.querySelector('[data-schnell]');
  if (!form) return;
  var feld = form.querySelector('[data-schnell-material]');
  function abgleichen() {
    var prod = form.querySelector('input[name="prod"]:checked');
    var fenster = !prod || prod.value === 'fenster';
    feld.hidden = !fenster;
    feld.querySelectorAll('input').forEach(function (i) { i.disabled = !fenster; });
  }
  form.addEventListener('change', abgleichen);
  abgleichen();
})();
