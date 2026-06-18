/* ─────────────────────────────────────────────────────────────────────
   shop.js — DeineFenster.de Lager-Shop
   Lädt data/shop-produkte.json, baut Filter-Sidebar dynamisch auf,
   handhabt Suche (mit Maß-Auto-Erkennung), Filter, Sortierung,
   Warenkorb (LocalStorage), Detail-Modal.
   Stand: 27.04.2026
   ───────────────────────────────────────────────────────────────────── */

/* Mehrfach-Werte (07.06.2026): Farbe/Glasart/Verglasung/Öffnungsart können seit
   dem Inserat-Tool-Umbau Listen sein. Alte Inserate haben Einzelwerte (Strings).
   Diese Helper machen beide Formen einheitlich nutzbar (abwärtskompatibel). */
function _asArr(v) {
  if (v == null || v === '') return [];
  return (Array.isArray(v) ? v : [v]).filter(x => x != null && x !== '');
}
function _hatTreffer(wert, filterSet) {
  // true, wenn irgendein Wert (String ODER Array) im Filter-Set liegt
  return _asArr(wert).some(x => filterSet.has(x));
}

const STATE = {
  produkte: [],            // alle Produkte aus JSON
  metadaten: null,         // filter_metadaten aus JSON
  kategorien: {},          // kategorie-key → Anzeigename
  loggedIn: false,         // wahr wenn Inhaberin/Mitarbeiter eingeloggt — zeigt Druck-Icons
  filter: {
    zustand: new Set(),
    material: new Set(),
    glasart: new Set(),
    kategorien: new Set(),
    farben: new Set(),
    verglasung: new Set(),
    rc: new Set(),
    eigenschaften: new Set(),
    groesse: new Set(),
    sonderpreis: false,
    exportModell: false,
    breite: null,
    hoehe: null,
    toleranz: 15,           // Prozent
    preisVon: null,
    preisBis: null,
    suche: ''
  },
  sortierung: 'relevanz',
  warenkorb: [],            // [{id, menge}]
};

const LS_KEY = 'deinefenster_warenkorb_v1';

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', async () => {
  loadCart();
  initShopTabs();
  initShopSticky();
  updateOpenStatus();
  await checkAuth();
  await loadProdukte();
  baueFilterSidebar();
  bindeEventHandler();
  applyUrlFilter();
  rendere();
  updateCartUI();
  oeffneDeepLinkProdukt();
});

/* ─── Tab-Navigation für Shop-Hero-Card (BFSG-konform mit Tastatur) ─── */
function initShopTabs() {
  const tablist = document.querySelector('.shop-tablist');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('.shop-tab'));
  const panels = Array.from(document.querySelectorAll('.shop-tab-panel'));
  function activate(idx) {
    tabs.forEach((tab, i) => {
      const active = i === idx;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
  }
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => { activate(idx); tab.focus(); });
    tab.addEventListener('keydown', (e) => {
      let nextIdx = null;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
      if (e.key === 'ArrowLeft')  nextIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home')       nextIdx = 0;
      if (e.key === 'End')        nextIdx = tabs.length - 1;
      if (nextIdx !== null) {
        e.preventDefault();
        activate(nextIdx);
        tabs[nextIdx].focus();
      }
    });
  });
}

/* ─── Sticky-Mini-Bar: sichtbar wenn Hero-Card aus Viewport scrollt ─── */
function initShopSticky() {
  const heroCard = document.getElementById('shopHeroCard');
  const stickyBar = document.getElementById('shopStickyBar');
  if (!heroCard || !stickyBar || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stickyBar.classList.remove('is-visible');
        } else if (entry.boundingClientRect.top < 0) {
          stickyBar.classList.add('is-visible');
        }
      });
    },
    { rootMargin: '0px', threshold: 0 }
  );
  observer.observe(heroCard);
}

/* ─── Open-Status: Lager nur Freitag 10–17 Uhr ─── */
function updateOpenStatus() {
  const badge = document.getElementById('shopOpenBadge');
  const text = document.getElementById('shopOpenText');
  if (!badge || !text) return;
  const now = new Date();
  const day = now.getDay();   // 0=So, 5=Fr
  const hour = now.getHours();
  const istFreitagOffen = day === 5 && hour >= 10 && hour < 17;
  if (istFreitagOffen) {
    text.textContent = 'Jetzt geöffnet bis 17 Uhr — vor Anfahrt kurz Verfügbarkeit prüfen';
    badge.classList.remove('shop-open-badge--closed');
    badge.classList.add('shop-open-badge--open');
  } else {
    const daysUntilFr = day === 5 ? (hour >= 17 ? 7 : 0) : (5 - day + 7) % 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilFr);
    const fmt = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
    text.textContent = `Geschlossen — nächste Öffnung: ${fmt.format(next)}, 10–17 Uhr`;
    badge.classList.add('shop-open-badge--closed');
    badge.classList.remove('shop-open-badge--open');
  }
}
// Auto-Refresh alle 60 Sekunden — Badge springt um wenn Freitag 10 Uhr beginnt/17 Uhr endet
setInterval(updateOpenStatus, 60000);

/* ─── URL-Parameter Filter (z.B. shop.html?zustand=gebraucht oder ?cat=daemmung) ─── */
function applyUrlFilter() {
  const params = new URLSearchParams(window.location.search);
  const zustand = params.get('zustand');
  let scrollNeeded = false;
  if (zustand === 'gebraucht' || zustand === 'neu' || zustand === 'vermessen') {
    STATE.filter.zustand.add(zustand);
    const cb = document.querySelector(`.filter-zustand[value="${zustand}"]`);
    if (cb) cb.checked = true;
    scrollNeeded = true;
  }
  // ?cat=daemmung oder ?cat=garagentor-gebraucht (auch komma-separiert möglich)
  const cat = params.get('cat');
  if (cat) {
    const cats = cat.split(',').map(s => s.trim()).filter(Boolean);
    cats.forEach(k => {
      if (STATE.kategorien && STATE.kategorien[k]) {
        STATE.filter.kategorien.add(k);
        const cb = document.querySelector(`.filter-kategorie[value="${k}"]`);
        if (cb) cb.checked = true;
        scrollNeeded = true;
      }
    });
  }
  if (scrollNeeded) {
    setTimeout(() => {
      const grid = document.getElementById('produktGrid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

async function checkAuth() {
  if (!isShopLoggedIn()) { STATE.loggedIn = false; return; }
  STATE.loggedIn = true;
  STATE.user = { email: localStorage.getItem('df_shop_email') || 'Mitarbeiter' };
  setupLoggedInUI();
}

function setupLoggedInUI() {
  // Login-Bar oben sichtbar machen + Email + Logout
  const bar = document.getElementById('loginStatusBar');
  if (bar) bar.classList.remove('hidden');
  const eml = document.getElementById('loginStatusEmail');
  if (eml && STATE.user) eml.textContent = STATE.user.email;
  const logout = document.getElementById('logoutShopBtn');
  if (logout) {
    logout.addEventListener('click', () => {
      clearShopToken();
      location.reload();
    });
  }
  // Admin-FAB (+ Inserat anlegen) nur für eingeloggte Mitarbeiter
  const adminFab = document.getElementById('admin-fab');
  if (adminFab) adminFab.style.display = 'flex';
}

/* ─── Hauptgruppen (interner Hinweis.05.2026: Untertypen zu Eigenschaften)
       Filter zeigt nur diese 7 Hauptgruppen — Sub-Kategorien wie
       "fenster-1fluegel" werden über kategorieZuGruppe() gemappt. ─── */
const FIXED_KATEGORIEN = {
  'fenster': 'Fenster',
  'balkontuer': 'Balkontür',
  'haustuer': 'Haustür',
  'schiebetuer': 'Schiebetür',
  'daemmung': 'Dämmung',
  'baumaterialien': 'Baumaterialien',
  'garagentor-gebraucht': 'Garagentor (gebraucht)'
};

/* ─── Sub-Kategorie aus Sheet (z.B. "fenster-1fluegel") auf Hauptgruppe mappen ─── */
function kategorieZuGruppe(kat) {
  if (!kat) return '';
  if (kat.startsWith('fenster-') || ['festelement','kellerfenster','rundfenster','rundbogenfenster','stichbogenfenster','dachfenster'].includes(kat)) return 'fenster';
  if (kat.startsWith('balkontuer-')) return 'balkontuer';
  if (kat === 'haustuer' || kat.startsWith('haustuer-')) return 'haustuer';
  if (kat.startsWith('schiebetuer-')) return 'schiebetuer';
  // Einstell-Formular speichert den Schlüssel 'garagentor' — Shop-Hauptgruppe heißt aber 'garagentor-gebraucht'. Beide akzeptieren.
  if (kat === 'garagentor' || kat === 'garagentor-gebraucht') return 'garagentor-gebraucht';
  if (['daemmung','baumaterialien'].includes(kat)) return kat;
  return '';
}

/* ─── Bauart-Tags abgeleitet aus kategorie_key — wandern in p.eigenschaften ─── */
function deriveBauartTags(kat) {
  const tags = [];
  if (!kat) return tags;
  if (kat.includes('-1fluegel')) tags.push('einfluegelig');
  else if (kat.includes('-2fluegel')) tags.push('zweifluegelig');
  else if (kat.includes('-3fluegel')) tags.push('dreifluegelig');
  else if (kat.includes('-4fluegel')) tags.push('vierfluegelig');
  if (kat.endsWith('-rollo')) tags.push('mit-rollo');
  if (kat === 'fenster-oberlicht') tags.push('oberlicht');
  if (kat === 'fenster-unterlicht') tags.push('unterlicht');
  if (kat === 'fenster-sprossen') tags.push('sprossen-aufgesetzt');
  if (kat === 'festelement') tags.push('festverglasung');
  if (kat === 'kellerfenster') tags.push('kellerfenster-typ');
  if (kat === 'rundfenster') tags.push('rundfenster-typ');
  if (kat === 'rundbogenfenster') tags.push('rundbogenfenster-typ');
  if (kat === 'stichbogenfenster') tags.push('stichbogenfenster-typ');
  if (kat === 'schiebetuer-psk') tags.push('parallel-schiebe-kipp');
  if (kat === 'schiebetuer-hst') tags.push('hebe-schiebe');
  return tags;
}

/* ─── Daten laden (aus Google Sheets) ─── */
async function loadProdukte() {
  try {
    const data = await sheetsGet('produkte');

    // Nur Hauptgruppen (interner Hinweis.05.2026 — Sub-Kategorien wandern zu Eigenschaften)
    STATE.kategorien = { ...FIXED_KATEGORIEN };
    STATE.kategorienListe = Object.entries(STATE.kategorien)
      .map(([key, label]) => ({ key, label }));

    const sheetsProdukte = (data.produkte || []).map(p => {
      const kat = p.kategorie || p.kategorie_key || '';
      const baseEig = Array.isArray(p.eigenschaften) ? p.eigenschaften : [];
      const bauart = deriveBauartTags(kat).filter(t => !baseEig.includes(t));
      const matArr = _asArr(p.material).map(x => String(x).toLowerCase());
      const zustArr = _asArr(p.zustand);
      const katKeys = _asArr(p.kategorie_keys);
      return {
        id: String(p.id),
        titel: p.titel || '',
        kategorie: kat,                                  // Primär-Kategorie (Gruppierung/Anzeige)
        kategorie_keys: katKeys.length ? katKeys : (kat ? [kat] : []), // alle (Mehrfach-Filter)
        system: _asArr(p.system).join(' · '),
        zustand: zustArr.length ? zustArr : ['neu'],     // Mehrfach
        material: matArr.length ? matArr : ['kunststoff'], // Mehrfach
        // Mehrfach-Felder → immer Array (alte Einzelwerte werden mit eingepackt)
        glasart: (_asArr(p.glasart).map(x => String(x).toLowerCase())).length ? _asArr(p.glasart).map(x => String(x).toLowerCase()) : ['klarglas'],
        breite_mm: Number(p.breite_mm) || 0,
        hoehe_mm: Number(p.hoehe_mm) || 0,
        preis_eur: Number(p.preis_eur) || 0,
        sonderpreis_eur: p.sonderpreis_eur ? Number(p.sonderpreis_eur) : null,
        groesse_klasse: p.groesse_klasse || null,
        export_modell: !!p.export_modell,
        standnummer: p.standnummer || null,
        farbe: _asArr(p.farbe).length ? _asArr(p.farbe) : ['weiss'],
        verglasung: _asArr(p.verglasung),
        u_wert: p.u_wert || null,
        oeffnungsart: _asArr(p.oeffnungsart).length ? _asArr(p.oeffnungsart) : ['dreh-kipp'],
        rc_klasse: p.rc_klasse || null,
        eigenschaften: [...baseEig, ...bauart],
        lagerbestand: Number(p.lagerbestand) || 1,
        bild: (Array.isArray(p.bilder) && p.bilder[0]) || 'img/fenster_standard.png',
        bilder: Array.isArray(p.bilder) ? p.bilder : [],
        beschreibung: p.beschreibung || '',
        aktiv: p.aktiv !== false
      };
    });
    // Eingeloggte Admins sehen auch archivierte Inserate (für Reaktivierung)
    // Normale Besucher sehen nur aktive
    const istAdmin = typeof isShopLoggedIn === 'function' && isShopLoggedIn();
    const sichtbar = istAdmin ? sheetsProdukte : sheetsProdukte.filter(p => p.aktiv);

    // Wenn Sheets leer → JSON-Fallback damit der Shop nie blank ist
    if (sichtbar.length === 0) {
      return loadProdukteFromJson();
    }

    STATE.produkte = sichtbar;
    STATE.metadaten = berechneMetadaten(STATE.produkte);
  } catch (err) {
    console.error('Sheets-Fehler beim Laden — Fallback auf JSON:', err);
    return loadProdukteFromJson();
  }
}

async function loadProdukteFromJson() {
  try {
    const res = await fetch('data/shop-produkte.json');
    const data = await res.json();
    // Bauart-Tags in eigenschaften reinpacken, Sub-Kategorien werden nur über kategorie_key referenziert
    STATE.produkte = (data.produkte || []).map(p => {
      const kat = p.kategorie || p.kategorie_key || '';
      const baseEig = Array.isArray(p.eigenschaften) ? p.eigenschaften : [];
      const bauart = deriveBauartTags(kat).filter(t => !baseEig.includes(t));
      const katKeys = _asArr(p.kategorie_keys);
      return {
        ...p, kategorie: kat, eigenschaften: [...baseEig, ...bauart],
        kategorie_keys: katKeys.length ? katKeys : (kat ? [kat] : []),
        system: _asArr(p.system).join(' · '),
        // Mehrfach-Felder vereinheitlichen (abwärtskompatibel zu Einzelwerten)
        zustand: _asArr(p.zustand).length ? _asArr(p.zustand) : ['neu'],
        material: _asArr(p.material).map(x => String(x).toLowerCase()).length ? _asArr(p.material).map(x => String(x).toLowerCase()) : ['kunststoff'],
        glasart: _asArr(p.glasart).map(x => String(x).toLowerCase()),
        farbe: _asArr(p.farbe),
        verglasung: _asArr(p.verglasung),
        oeffnungsart: _asArr(p.oeffnungsart)
      };
    });
    STATE.metadaten = berechneMetadaten(STATE.produkte);
    STATE.kategorien = { ...FIXED_KATEGORIEN };
  } catch (err) {
    console.error('JSON-Fallback auch fehlgeschlagen:', err);
    STATE.produkte = [];
  }
}

function berechneMetadaten(produkte) {
  if (!produkte || produkte.length === 0) {
    return {
      preis_min: 0, preis_max: 5000,
      breite_min: 500, breite_max: 4000,
      hoehe_min: 400, hoehe_max: 2400,
      alle_eigenschaften: [],
      alle_farben: ['weiss', 'anthrazit', 'grau', 'schwarz', 'dunkelgruen', 'golden-oak', 'nussbaum', 'holzdekor', 'farbig']
    };
  }
  const alleEig = new Set();
  const alleFarben = new Set(['weiss', 'anthrazit', 'grau', 'schwarz', 'dunkelgruen', 'golden-oak', 'nussbaum', 'holzdekor', 'farbig']);
  produkte.forEach(p => {
    (p.eigenschaften || []).forEach(e => alleEig.add(e));
    _asArr(p.farbe).forEach(f => alleFarben.add(f));
  });
  return {
    preis_min: Math.min(...produkte.map(p => p.preis_eur || 0)),
    preis_max: Math.max(...produkte.map(p => p.preis_eur || 0)),
    breite_min: Math.min(...produkte.map(p => p.breite_mm || 0)),
    breite_max: Math.max(...produkte.map(p => p.breite_mm || 0)),
    hoehe_min: Math.min(...produkte.map(p => p.hoehe_mm || 0)),
    hoehe_max: Math.max(...produkte.map(p => p.hoehe_mm || 0)),
    alle_eigenschaften: Array.from(alleEig),
    alle_farben: Array.from(alleFarben)
  };
}

/* ─── Filter-Sidebar dynamisch ─── */
function baueFilterSidebar() {
  // Reihenfolge der Hauptgruppen (interner Hinweis.05.2026: Untertypen wandern zu Eigenschaften)
  const katWrap = document.getElementById('filterKategorien');
  const ORDER = ['fenster', 'balkontuer', 'haustuer', 'schiebetuer', 'daemmung', 'baumaterialien', 'garagentor-gebraucht'];
  const renderItem = (key, label) => {
    const count = STATE.produkte.filter(p => _asArr(p.kategorie_keys).some(k => kategorieZuGruppe(k) === key)).length;
    return `
      <label class="filter-option">
        <span class="flex items-center gap-2"><input type="checkbox" class="check filter-kategorie" value="${key}"/><span>${escapeHtml(label)}</span></span>
        ${count > 0 ? `<span class="count">${count}</span>` : ''}
      </label>`;
  };
  katWrap.innerHTML = ORDER
    .filter(k => STATE.kategorien[k])
    .map(k => renderItem(k, STATE.kategorien[k]))
    .join('');

  // Farben — in Unterkategorien gruppiert (Inhaberin-Wunsch 16.06.2026: Uni-Farben / Holzdekore / Sonstige)
  const farbWrap = document.getElementById('filterFarben');
  const alleFarben = STATE.metadaten.alle_farben || [];
  const farbOption = (f) => {
    const count = STATE.produkte.filter(p => _asArr(p.farbe).includes(f)).length;
    if (count === 0) return '';
    return `
      <label class="filter-option">
        <span class="flex items-center gap-2"><input type="checkbox" class="check filter-farbe" value="${f}"/><span>${farbeAnzeige(f)}</span></span>
        <span class="count">${count}</span>
      </label>`;
  };
  const FARB_GRUPPEN = [
    { titel: 'Uni-Farben', werte: ['weiss', 'anthrazit', 'grau', 'schwarz', 'dunkelgruen'] },
    { titel: 'Holzdekore', werte: ['golden-oak', 'nussbaum', 'holzdekor'] },
    { titel: 'Sonstige',   werte: ['farbig'] }
  ];
  const inGruppen = new Set(FARB_GRUPPEN.flatMap(g => g.werte));
  let farbHtml = '', ersteGruppe = true;
  // Unterüberschrift nutzt dieselbe Klasse wie die Block-Titel (theme-sicher), nur kleiner
  const addFarbGruppe = (titel, opts) => {
    if (!opts) return;  // leere Gruppe ganz überspringen
    farbHtml += `<div class="filter-block-title" style="font-size:10px;opacity:.7;margin:${ersteGruppe ? '0' : '12px'} 0 6px">${titel}</div>` + opts;
    ersteGruppe = false;
  };
  FARB_GRUPPEN.forEach(g => addFarbGruppe(g.titel, g.werte.map(farbOption).join('')));
  // selbst angelegte / unbekannte Farben ans Ende
  addFarbGruppe('Weitere', alleFarben.filter(f => !inGruppen.has(f)).map(farbOption).join(''));
  farbWrap.innerHTML = farbHtml;

  // Eigenschaften (nur die, die mindestens 1 Produkt hat)
  const eigWrap = document.getElementById('filterEigenschaften');
  const alleEig = STATE.metadaten.alle_eigenschaften || [];
  eigWrap.innerHTML = alleEig.map(e => {
    if (e.startsWith('rc')) return ''; // RC läuft separat
    if (e.endsWith('-verglasung')) return ''; // Verglasung läuft separat
    const count = STATE.produkte.filter(p => (p.eigenschaften || []).includes(e)).length;
    if (count === 0) return '';
    return `
      <label class="filter-option">
        <span class="flex items-center gap-2"><input type="checkbox" class="check filter-eigenschaft" value="${e}"/><span>${eigenschaftAnzeige(e)}</span></span>
        <span class="count">${count}</span>
      </label>`;
  }).join('');

  // Counts für Verglasung, RC, Zustand, Größe, Sonderpreis, Export (statisch im HTML)
  setCountAttr('zustand-neu', STATE.produkte.filter(p => _asArr(p.zustand).includes('neu')).length);
  setCountAttr('zustand-gebraucht', STATE.produkte.filter(p => _asArr(p.zustand).includes('gebraucht')).length);
  setCountAttr('zustand-vermessen', STATE.produkte.filter(p => (p.eigenschaften || []).includes('vermessen')).length);
  setCountAttr('zustand-sonderposten', STATE.produkte.filter(p => _asArr(p.zustand).includes('sonderposten')).length);
  setCountAttr('material-kunststoff', STATE.produkte.filter(p => _asArr(p.material).includes('kunststoff')).length);
  setCountAttr('material-holz', STATE.produkte.filter(p => _asArr(p.material).includes('holz')).length);
  setCountAttr('material-aluminium', STATE.produkte.filter(p => _asArr(p.material).includes('aluminium')).length);
  setCountAttr('glasart-klarglas', STATE.produkte.filter(p => _asArr(p.glasart).includes('klarglas')).length);
  setCountAttr('glasart-chinchilla', STATE.produkte.filter(p => _asArr(p.glasart).includes('chinchilla')).length);
  setCountAttr('glasart-milchglas', STATE.produkte.filter(p => _asArr(p.glasart).includes('milchglas')).length);
  setCountAttr('glasart-sicherheitsglas', STATE.produkte.filter(p => _asArr(p.glasart).includes('sicherheitsglas')).length);
  setCountAttr('glasart-schallschutzglas', STATE.produkte.filter(p => _asArr(p.glasart).includes('schallschutzglas')).length);
  setCountAttr('verglasung-2-fach', STATE.produkte.filter(p => _asArr(p.verglasung).includes('2-fach')).length);
  setCountAttr('verglasung-3-fach', STATE.produkte.filter(p => _asArr(p.verglasung).includes('3-fach')).length);
  setCountAttr('rc-RC2', STATE.produkte.filter(p => p.rc_klasse === 'RC2').length);
  setCountAttr('rc-RC3', STATE.produkte.filter(p => p.rc_klasse === 'RC3').length);
  setCountAttr('groesse-klein', STATE.produkte.filter(p => p.groesse_klasse === 'klein').length);
  setCountAttr('groesse-schmal', STATE.produkte.filter(p => p.groesse_klasse === 'schmal').length);
  setCountAttr('groesse-normal', STATE.produkte.filter(p => p.groesse_klasse === 'normal').length);
  setCountAttr('groesse-hoch', STATE.produkte.filter(p => p.groesse_klasse === 'hoch').length);
  setCountAttr('groesse-gross', STATE.produkte.filter(p => p.groesse_klasse === 'gross').length);
  setCountAttr('sonderpreis', STATE.produkte.filter(p => !!p.sonderpreis_eur).length);
  setCountAttr('export', STATE.produkte.filter(p => !!p.export_modell).length);
}

function setCountAttr(key, val) {
  const el = document.querySelector(`[data-count="${key}"]`);
  if (el) el.textContent = val;
}

/* ─── Event-Handler ─── */
function bindeEventHandler() {
  // Suche mit Debounce
  const sucheInput = document.getElementById('sucheInput');
  let suchDebounce;
  sucheInput.addEventListener('input', e => {
    clearTimeout(suchDebounce);
    suchDebounce = setTimeout(() => {
      STATE.filter.suche = e.target.value.trim();
      pruefeMassErkennung(STATE.filter.suche);
      document.getElementById('sucheClearBtn').classList.toggle('hidden', !STATE.filter.suche);
      rendere();
    }, 200);
  });

  document.getElementById('sucheClearBtn').addEventListener('click', () => {
    sucheInput.value = '';
    STATE.filter.suche = '';
    document.getElementById('sucheClearBtn').classList.add('hidden');
    document.getElementById('masseHinweis').classList.add('hidden');
    rendere();
  });

  // Filter-Checkboxen (Event-Delegation)
  document.getElementById('filterSidebar').addEventListener('change', e => {
    const t = e.target;
    if (!t.matches('input[type="checkbox"]')) return;
    const wert = t.value;
    let setRef;
    if (t.classList.contains('filter-zustand')) {
      // Gegenseitiger Ausschluss — nur einer aktiv
      STATE.filter.zustand.clear();
      document.querySelectorAll('.filter-zustand').forEach(cb => { if (cb !== t) cb.checked = false; });
      if (t.checked) STATE.filter.zustand.add(wert);
      rendere(); return;
    }
    else if (t.classList.contains('filter-material')) setRef = STATE.filter.material;
    else if (t.classList.contains('filter-glasart')) setRef = STATE.filter.glasart;
    else if (t.classList.contains('filter-kategorie')) setRef = STATE.filter.kategorien;
    else if (t.classList.contains('filter-farbe')) setRef = STATE.filter.farben;
    else if (t.classList.contains('filter-verglasung')) setRef = STATE.filter.verglasung;
    else if (t.classList.contains('filter-rc')) setRef = STATE.filter.rc;
    else if (t.classList.contains('filter-eigenschaft')) setRef = STATE.filter.eigenschaften;
    else if (t.classList.contains('filter-groesse')) setRef = STATE.filter.groesse;
    else if (t.classList.contains('filter-sonderpreis')) { STATE.filter.sonderpreis = t.checked; rendere(); return; }
    else if (t.classList.contains('filter-export')) { STATE.filter.exportModell = t.checked; rendere(); return; }
    else return;
    if (t.checked) setRef.add(wert);
    else setRef.delete(wert);
    rendere();
  });

  // Maße + Preis
  document.getElementById('filterBreite').addEventListener('input', e => {
    STATE.filter.breite = e.target.value ? parseInt(e.target.value, 10) : null;
    rendere();
  });
  document.getElementById('filterHoehe').addEventListener('input', e => {
    STATE.filter.hoehe = e.target.value ? parseInt(e.target.value, 10) : null;
    rendere();
  });
  document.getElementById('filterPreisVon').addEventListener('input', e => {
    STATE.filter.preisVon = e.target.value ? parseInt(e.target.value, 10) : null;
    rendere();
  });
  document.getElementById('filterPreisBis').addEventListener('input', e => {
    STATE.filter.preisBis = e.target.value ? parseInt(e.target.value, 10) : null;
    rendere();
  });
  document.getElementById('filterToleranz').addEventListener('input', e => {
    STATE.filter.toleranz = parseInt(e.target.value, 10);
    document.getElementById('toleranzWert').textContent = `±${STATE.filter.toleranz}%`;
    rendere();
  });

  // Sortierung
  document.getElementById('sortSelect').addEventListener('change', e => {
    STATE.sortierung = e.target.value;
    rendere();
  });

  // Filter zurücksetzen
  document.getElementById('filterReset').addEventListener('click', resetAlleFilter);
  document.getElementById('resetFromEmpty').addEventListener('click', resetAlleFilter);
  const fmReset = document.getElementById('filterResetMob');
  if (fmReset) fmReset.addEventListener('click', resetAlleFilter);

  // Mobile Filter-Drawer
  document.getElementById('filterTrigger').addEventListener('click', () => {
    document.getElementById('filterSidebar').classList.add('open');
  });
  document.getElementById('filterClose').addEventListener('click', () => {
    document.getElementById('filterSidebar').classList.remove('open');
  });
  const fApply = document.getElementById('filterApplyMob');
  if (fApply) fApply.addEventListener('click', () => {
    document.getElementById('filterSidebar').classList.remove('open');
    const g = document.getElementById('produktGrid');
    if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Maße-Hinweis schließen
  document.getElementById('masseHinweisClose').addEventListener('click', () => {
    STATE.filter.breite = null;
    STATE.filter.hoehe = null;
    document.getElementById('filterBreite').value = '';
    document.getElementById('filterHoehe').value = '';
    document.getElementById('masseHinweis').classList.add('hidden');
    rendere();
  });

  // Detail-Modal
  document.getElementById('detailCloseBtn').addEventListener('click', schliesseDetail);
  document.getElementById('detailOverlay').addEventListener('click', schliesseDetail);

  // ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      schliesseCart();
      schliesseDetail();
    }
  });

  // Sticky Nav scroll-Effekt
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ─── Maß-Auto-Erkennung im Suchtext ─── */
function pruefeMassErkennung(text) {
  const re = /(\d{3,4})\s*[x×*]\s*(\d{3,4})/i;
  const match = text.match(re);
  const hinweis = document.getElementById('masseHinweis');
  if (match) {
    const breite = parseInt(match[1], 10);
    const hoehe = parseInt(match[2], 10);
    STATE.filter.breite = breite;
    STATE.filter.hoehe = hoehe;
    document.getElementById('filterBreite').value = breite;
    document.getElementById('filterHoehe').value = hoehe;
    document.getElementById('masseAusSuche').textContent = `${breite} × ${hoehe} mm (Toleranz ±${STATE.filter.toleranz}%)`;
    hinweis.classList.remove('hidden');
  } else {
    hinweis.classList.add('hidden');
  }
}

/* ─── Filter-/Sort-Logik ─── */
function gefilterteProdukte() {
  const f = STATE.filter;

  let result = STATE.produkte.filter(p => {
    // Zustand (neu / gebraucht / vermessen — Produkt kann jetzt mehrere haben)
    if (f.zustand.size) {
      if (f.zustand.has('vermessen')) {
        if (!(p.eigenschaften || []).includes('vermessen')) return false;
      } else {
        if (!_hatTreffer(p.zustand, f.zustand)) return false;
      }
    }
    // Material (mehrere Filter UND mehrere Produkt-Werte kombinierbar)
    if (f.material.size && !_hatTreffer(p.material, f.material)) return false;
    // Glasart (mehrere Filter UND mehrere Produkt-Werte kombinierbar)
    if (f.glasart.size && !_hatTreffer(p.glasart, f.glasart)) return false;
    // Kategorie (Hauptgruppe matched alle gewählten Kategorien des Produkts via kategorieZuGruppe)
    if (f.kategorien.size && !_asArr(p.kategorie_keys).some(k => f.kategorien.has(kategorieZuGruppe(k)))) return false;
    // Größen-Klasse
    if (f.groesse.size && (!p.groesse_klasse || !f.groesse.has(p.groesse_klasse))) return false;
    // Sonderpreis
    if (f.sonderpreis && !p.sonderpreis_eur) return false;
    // Export
    if (f.exportModell && !p.export_modell) return false;
    // Farbe
    if (f.farben.size && !_hatTreffer(p.farbe, f.farben)) return false;
    // Verglasung
    if (f.verglasung.size && !_hatTreffer(p.verglasung, f.verglasung)) return false;
    // RC-Klasse
    if (f.rc.size && !f.rc.has(p.rc_klasse)) return false;
    // Eigenschaften — alle müssen vorhanden sein (UND-Logik)
    if (f.eigenschaften.size) {
      for (const e of f.eigenschaften) {
        if (!(p.eigenschaften || []).includes(e)) return false;
      }
    }
    // Maße mit Toleranz (Fuzzy-Match)
    const tol = f.toleranz / 100;
    if (f.breite !== null) {
      const min = f.breite * (1 - tol);
      const max = f.breite * (1 + tol);
      if (p.breite_mm < min || p.breite_mm > max) return false;
    }
    if (f.hoehe !== null) {
      const min = f.hoehe * (1 - tol);
      const max = f.hoehe * (1 + tol);
      if (p.hoehe_mm < min || p.hoehe_mm > max) return false;
    }
    // Preis
    if (f.preisVon !== null && p.preis_eur < f.preisVon) return false;
    if (f.preisBis !== null && p.preis_eur > f.preisBis) return false;
    // Suche im Titel + Beschreibung + Kategorie + Standnummer
    if (f.suche) {
      // Maß-Patterns aus Suche entfernen, da via Filter abgedeckt
      const reinText = f.suche.replace(/\d{3,4}\s*[x×*]\s*\d{3,4}/i, '').trim().toLowerCase();
      if (reinText) {
        const haystack = [
          p.titel,
          p.beschreibung,
          STATE.kategorien[p.kategorie] || '',
          p.system,
          _asArr(p.farbe).join(' '),
          p.standnummer || '',
          (p.eigenschaften || []).join(' ')
        ].join(' ').toLowerCase();
        if (!haystack.includes(reinText)) return false;
      }
    }
    return true;
  });

  // Sortierung
  switch (STATE.sortierung) {
    case 'preis-auf':
      result.sort((a, b) => a.preis_eur - b.preis_eur);
      break;
    case 'preis-ab':
      result.sort((a, b) => b.preis_eur - a.preis_eur);
      break;
    case 'groesse-ab':
      result.sort((a, b) => (b.breite_mm * b.hoehe_mm) - (a.breite_mm * a.hoehe_mm));
      break;
    case 'groesse-auf':
      result.sort((a, b) => (a.breite_mm * a.hoehe_mm) - (b.breite_mm * b.hoehe_mm));
      break;
    case 'relevanz':
    default:
      // Wenn Maße gefiltert: nach Nähe zur Wunschgröße sortieren
      if (f.breite !== null && f.hoehe !== null) {
        result.sort((a, b) => {
          const dA = Math.abs(a.breite_mm - f.breite) + Math.abs(a.hoehe_mm - f.hoehe);
          const dB = Math.abs(b.breite_mm - f.breite) + Math.abs(b.hoehe_mm - f.hoehe);
          return dA - dB;
        });
      }
      break;
  }

  return result;
}

/* ─── Shop-Header dynamisch je nach Zustand-Filter ─── */
// SHOP_HEADERS-Logik entfernt: H1 + Sub bleiben statisch allgemein (Sarah-Entscheidung 24.05.2026).
// aktualisiereShopHeader steuert nur noch den Gebraucht-Filter-Hinweis.
function aktualisiereShopHeader() {
  const zustand = STATE.filter.zustand.size ? [...STATE.filter.zustand][0] : 'default';
  const hinweis = document.getElementById('gebrauchtHinweis');
  if (hinweis && zustand === 'gebraucht') hinweis.classList.remove('hidden');
  else if (hinweis) hinweis.classList.add('hidden');
}

/* ─── Render-Pipeline ─── */
function rendere() {
  const result = gefilterteProdukte();
  document.getElementById('produktAnzahl').textContent = result.length;
  const _applyBtn = document.getElementById('filterApplyMob');
  if (_applyBtn) _applyBtn.textContent = result.length + (result.length === 1 ? ' Ergebnis anzeigen' : ' Ergebnisse anzeigen');
  aktualisiereShopHeader();
  rendereSchemaOrg(result);

  // Aktive Chips
  rendereAktiveChips();

  // Empty State
  const emptyEl = document.getElementById('emptyState');
  const gridEl = document.getElementById('produktGrid');
  if (result.length === 0) {
    // Spezial-Hinweis wenn Filter Dämmung / Baumaterialien / Garagentor aktiv (Bestand wechselt)
    const f = STATE.filter.kategorien;
    const isDaemmung = f.has('daemmung');
    const isBaumat = f.has('baumaterialien');
    const isGaragentor = f.has('garagentor-gebraucht');
    if ((isDaemmung || isBaumat || isGaragentor) && f.size === 1) {
      const sortiment = isDaemmung
        ? { name: 'ISO-Verbunddämmung', detail: 'Polen-Import · neu · Preis pro Rolle' }
        : isGaragentor
          ? { name: 'gebrauchte Garagentore', detail: 'Sektional · Schwing · Rolltor — Bestand wechselt schnell' }
          : { name: 'Baumaterialien', detail: 'Sortiment wechselt — fragen Sie was Sie suchen' };
      emptyEl.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:56px;color:rgba(118,169,250,0.45);">inventory_2</span>
        <h3 class="text-xl font-extrabold mt-3" style="color:#e8eeff;">Wir führen ${sortiment.name} ab Lager</h3>
        <p class="text-sm mt-1.5 max-w-md mx-auto" style="color:rgba(232,238,255,0.65);">
          ${sortiment.detail}.<br>
          Bestand wechselt — bitte aktuelle Verfügbarkeit kurz anfragen.
        </p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <a href="https://wa.me/491717263776" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold" style="border-radius:8px;background:#25D366;color:#fff;text-decoration:none;">
            <span class="material-symbols-outlined" style="font-size:18px">chat</span> WhatsApp 0171 7263776
          </a>
          <a href="mailto:info@baustoffchrist.de" class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold" style="border-radius:8px;background:#225eaa;color:#fff;text-decoration:none;">
            <span class="material-symbols-outlined" style="font-size:18px">mail</span> Anfrage per E-Mail
          </a>
          <a href="kontakt.html" class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold" style="border-radius:8px;background:transparent;color:#76a9fa;border:1.5px solid rgba(118,169,250,0.5);text-decoration:none;">
            <span class="material-symbols-outlined" style="font-size:18px">phone</span> Kontakt &amp; Anfahrt
          </a>
        </div>`;
    } else {
      emptyEl.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:56px;color:rgba(118,169,250,0.35);">search_off</span>
        <h3 class="text-xl font-extrabold mt-3" style="color:#e8eeff;">Keine Produkte gefunden</h3>
        <p class="text-sm mt-1.5 max-w-md mx-auto" style="color:rgba(232,238,255,0.55);">Probier andere Filter oder Maße — oder geh zum <a href="konfigurator.html" style="color:#76a9fa;font-weight:600;text-decoration:underline;">Konfigurator</a> für eine Maßanfertigung.</p>
        <button id="resetFromEmpty" class="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold" style="border-radius:8px;background:#225eaa;color:#fff;border:none;cursor:pointer;">
          <span class="material-symbols-outlined" style="font-size:18px">refresh</span>
          Filter zurücksetzen
        </button>`;
      const resetBtn = document.getElementById('resetFromEmpty');
      if (resetBtn) resetBtn.addEventListener('click', () => {
        const reset = document.getElementById('resetFilters');
        if (reset) reset.click();
      });
    }
    emptyEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  gridEl.classList.remove('hidden');

  // Karten rendern
  gridEl.innerHTML = result.map(p => karteHtml(p)).join('');

  // Druck-Icon: Klick soll nicht das Detail-Modal öffnen
  gridEl.querySelectorAll('[data-action="drucken"]').forEach(a => {
    a.addEventListener('click', e => e.stopPropagation());
  });
  // 3-Punkte-Menü: Klick öffnet Aktions-Popup
  gridEl.querySelectorAll('[data-action="menu"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      oeffneAktionsMenu(btn.dataset.id, btn);
    });
  });
  gridEl.querySelectorAll('[data-action="detail"]').forEach(card => {
    card.addEventListener('click', () => oeffneDetail(card.dataset.id));
  });
  gridEl.querySelectorAll('[data-action="teilen"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); const p = STATE.produkte.find(x => x.id === btn.dataset.id); if (p) teileProdukt(p); });
  });
  gridEl.querySelectorAll('[data-action="kundendruck"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); const p = STATE.produkte.find(x => x.id === btn.dataset.id); if (p) druckeProduktblatt(p); });
  });
  gridEl.querySelectorAll('[data-action="anfrage"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); const p = STATE.produkte.find(x => x.id === btn.dataset.id); if (p) oeffneAnfrageModal(p); });
  });
}

// Bestands-Badge zentral. "Nur X verfügbar" auf jedem Einzelprodukt (neu + gebraucht).
// AUSNAHME: Sammel-Inserate (Beschreibung listet mehrere Größen/Preise, zeigen "ab") —
// dort wäre "Nur 1 verfügbar" ein Widerspruch, also kein Knappheits-Badge.
function lagerBadgeHtml(p) {
  if (istSammelInserat(p)) return '';
  return p.lagerbestand > 1
    ? `<span class="pill is-success">${p.lagerbestand} auf Lager</span>`
    : `<span class="pill is-warning">Nur ${p.lagerbestand} verfügbar</span>`;
}

// "ab" vor dem Preis nur bei Sammel-Inseraten (Beschreibung listet mehrere Maße/Preise,
// z.B. "1000 x 600 = 195 Euro, 1000 x 700 = 200 Euro …"). Bei einem Einzelprodukt mit
// genau einem Preis ist "ab" irreführend → kein "ab".
function istSammelInserat(p) {
  const b = p.beschreibung || '';
  const masse = new Set(b.match(/\d{2,4}\s*[x×]\s*\d{2,4}/gi) || []).size;
  const euro = (b.match(/€|euro/gi) || []).length;
  return masse >= 3 || euro >= 3;
}

function karteHtml(p) {
  const istNeu = _asArr(p.zustand).includes('neu');
  const istGebraucht = _asArr(p.zustand).includes('gebraucht');
  // Verglasung nur bei Produkten mit Glas (Fenster/Balkontür/Haustür/Schiebetür) — NICHT bei Dämmung/Baumaterialien/Garagentor
  const NO_GLAS_KATS = new Set(['daemmung','baumaterialien','garagentor-gebraucht']);
  const verglasungTxt = !NO_GLAS_KATS.has(kategorieZuGruppe(p.kategorie))
    ? _asArr(p.verglasung).map(v => `${v}-fach`).join(' · ') : '';
  const istMarkiert = !!p.sonderpreis_eur || !!p.export_modell;
  const preisStern = istMarkiert ? '*' : '';

  // Verfügbarkeit als dezenter, aber sichtbarer Hinweis (Knappheit treibt Anfragen)
  const verfTxt = istSammelInserat(p) ? '' :
    (p.lagerbestand > 1 ? `${p.lagerbestand} auf Lager` : `Nur ${p.lagerbestand} verfügbar`);
  // Gebraucht-Tag als kleine Marke aufs Bild (oben links), wie bei Kleinanzeigen die Zustandsmarke
  const zustandTag = istGebraucht
    ? '<span class="karte-tag karte-tag--gebraucht">Gebraucht</span>' : '';

  // Kompakte Meta-Zeile: Stand · Verglasung · Verfügbarkeit (statt Pillen-Stapel)
  const metaParts = [];
  if (p.standnummer) metaParts.push(`<span class="karte-stand">📍 Stand ${escapeHtml(p.standnummer)}</span>`);
  if (verglasungTxt) metaParts.push(`<span>${verglasungTxt}</span>`);
  if (p.rc_klasse) metaParts.push(`<span>${escapeHtml(p.rc_klasse)}</span>`);
  if (verfTxt) metaParts.push(`<span class="karte-verf">${verfTxt}</span>`);
  const metaZeile = metaParts.length
    ? `<div class="karte-meta">${metaParts.join('<span class="karte-meta-dot">·</span>')}</div>` : '';

  // Preis-Präfix (Sonderpreis/Export/Sammel-„ab")
  const preisPrefix = p.sonderpreis_eur
    ? '<span class="karte-preis-tag">Sonderpreis</span>'
    : (p.export_modell ? '<span class="karte-preis-tag">Export</span>'
    : (istSammelInserat(p) ? '<span class="karte-preis-tag">ab</span>' : ''));

  // Druck-Icon + 3-Punkte-Menü nur für eingeloggte User sichtbar
  const druckIcon = STATE.loggedIn ? `
    <a href="shop-drucken.html?id=${escapeHtml(p.id)}" data-action="drucken" data-id="${escapeHtml(p.id)}"
       class="absolute top-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink hover:text-primary shadow-md border border-border-soft transition-colors"
       title="Schild für dieses Produkt drucken"
       aria-label="Schild drucken">
      <span class="material-symbols-outlined" style="font-size:18px">print</span>
    </a>` : '';
  const aktionMenu = STATE.loggedIn ? `
    <button data-action="menu" data-id="${escapeHtml(p.id)}"
       class="absolute top-2 right-12 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink hover:text-primary shadow-md border border-border-soft transition-colors"
       title="Inserat verwalten" aria-label="Aktionen">
      <span class="material-symbols-outlined" style="font-size:20px">more_vert</span>
    </button>` : '';

  const istArchiviert = p.aktiv === false;
  const archivBadge = istArchiviert
    ? '<span style="position:absolute;top:8px;left:8px;background:#b87f00;color:#fff;font-size:10px;font-weight:800;padding:4px 8px;border-radius:6px;letter-spacing:0.05em;text-transform:uppercase;box-shadow:0 2px 6px rgba(0,0,0,0.2);z-index:5">Archiviert</span>'
    : '';
  const archivStyle = istArchiviert ? 'opacity:0.55;filter:saturate(0.6)' : '';

  // Haupt-Action: blauer „Anfragen"-Knopf aufs On-Site-Formular (oeffneAnfrageModal, DSGVO-konform).
  // Sekundär (Details/Teilen/Drucken) bleibt für Desktop, am Handy ausgeblendet.
  const ctaRow = istArchiviert ? '' : `
        <div class="shop-card-cta-row">
          <button type="button" class="shop-card-cta-anfrage" data-action="anfrage" data-id="${p.id}"
             aria-label="${escapeHtml(p.titel)} anfragen">
            <span class="material-symbols-outlined">mail</span>
            Anfragen
          </button>
        </div>
        <div class="shop-card-cta-row shop-card-cta-secondary" style="margin-top:6px">
          <button type="button" class="shop-card-cta-details" style="flex:1" aria-label="Details ansehen">
            <span class="material-symbols-outlined">open_in_new</span>
            <span>Details</span>
          </button>
          <button type="button" class="shop-card-cta-details" style="flex:1" data-action="teilen" data-id="${p.id}" aria-label="Teilen" title="Teilen">
            <span class="material-symbols-outlined">share</span>
            <span>Teilen</span>
          </button>
          <button type="button" class="shop-card-cta-details" style="flex:1" data-action="kundendruck" data-id="${p.id}" aria-label="Drucken" title="Drucken">
            <span class="material-symbols-outlined">print</span>
            <span>Drucken</span>
          </button>
        </div>`;

  return `
    <article class="karte" data-action="detail" data-id="${p.id}" style="${archivStyle}">
      <div class="karte-bild-wrap" style="position:relative">
        <img src="${escapeHtml(p.bild)}" alt="${escapeHtml(p.titel)}" class="karte-bild w-full" loading="lazy" decoding="async" onerror="this.src='img/fenster_standard.png'"/>
        <span class="symbolbild-mini">Symbolbild</span>
        ${zustandTag}
        ${archivBadge}
        ${druckIcon}
        ${aktionMenu}
      </div>
      <div class="karte-body">
        <div class="karte-preis-row">
          ${preisPrefix}
          <span class="karte-preis">${formatPreis(p.preis_eur)}<span class="karte-preis-stern">${preisStern}</span></span>
        </div>
        <p class="karte-masse"><span class="material-symbols-outlined">straighten</span>${p.breite_mm} × ${p.hoehe_mm} mm</p>
        <h3 class="karte-titel line-clamp-2">${escapeHtml(p.titel)}</h3>
        ${metaZeile}
        <div class="karte-cta-wrap">
          ${ctaRow}
        </div>
      </div>
    </article>`;
}

/* ─── Aktions-Menü (Archivieren / Löschen) für eingeloggte User ─── */
function oeffneAktionsMenu(id, anchor) {
  // Bestehende Menüs schließen
  document.querySelectorAll('.aktions-popup').forEach(el => el.remove());

  const rect = anchor.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'aktions-popup';
  menu.style.cssText = `position:fixed;top:${rect.bottom + 6}px;right:${window.innerWidth - rect.right}px;z-index:110;background:white;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.08);padding:6px;min-width:200px`;
  menu.innerHTML = `
    <a href="shop-einstellen.html?edit=${escapeHtml(id)}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:#1d1d1f;font-size:13px;font-weight:600;text-decoration:none" onmouseover="this.style.background='#f5f5f7'" onmouseout="this.style.background=''">
      <span class="material-symbols-outlined" style="font-size:18px;color:#225eaa">edit</span>
      Bearbeiten
    </a>
    <a href="shop-drucken.html?id=${escapeHtml(id)}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:#1d1d1f;font-size:13px;font-weight:600;text-decoration:none" onmouseover="this.style.background='#f5f5f7'" onmouseout="this.style.background=''">
      <span class="material-symbols-outlined" style="font-size:18px;color:#225eaa">print</span>
      Schild drucken
    </a>
    ${(() => {
      const aktuell = STATE.produkte.find(p => String(p.id) === String(id));
      const istArchiviert = aktuell && aktuell.aktiv === false;
      return istArchiviert
        ? `<button data-do="reactivate" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:transparent;border:none;cursor:pointer;color:#0a8a3a;font-size:13px;font-weight:600;text-align:left" onmouseover="this.style.background='#e3f5e9'" onmouseout="this.style.background=''">
            <span class="material-symbols-outlined" style="font-size:18px;color:#0a8a3a">unarchive</span>
            Wieder aktivieren
          </button>`
        : `<button data-do="archive" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:transparent;border:none;cursor:pointer;color:#1d1d1f;font-size:13px;font-weight:600;text-align:left" onmouseover="this.style.background='#f5f5f7'" onmouseout="this.style.background=''">
            <span class="material-symbols-outlined" style="font-size:18px;color:#b87f00">archive</span>
            Archivieren
          </button>`;
    })()}
    <button data-do="delete" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:transparent;border:none;cursor:pointer;color:#ba1a1a;font-size:13px;font-weight:600;text-align:left" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">
      <span class="material-symbols-outlined" style="font-size:18px">delete</span>
      Löschen
    </button>`;
  document.body.appendChild(menu);

  // Click-Outside zum Schließen
  setTimeout(() => {
    const close = (ev) => {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    };
    document.addEventListener('click', close);
  }, 50);

  // Aktion-Klick
  menu.addEventListener('click', e => {
    const btn = e.target.closest('[data-do]');
    if (!btn) return;
    const action = btn.dataset.do;
    menu.remove();
    if (action === 'archive') archiviereProdukt(id);
    else if (action === 'reactivate') reaktiviereProdukt(id);
    else if (action === 'delete') loescheProdukt(id);
  });
}

async function archiviereProdukt(id) {
  if (!confirm('Inserat archivieren? Es verschwindet aus dem Shop, bleibt aber gespeichert — du kannst es jederzeit über das Menü wieder aktivieren (z.B. wenn ein reservierter Artikel doch nicht abgeholt wird).')) return;
  const res = await sheetsPost({ action: 'archive', id });
  if (res.error) { alert('Fehler beim Archivieren: ' + res.error); return; }
  await loadProdukte();
  rendere();
}

async function reaktiviereProdukt(id) {
  const res = await sheetsPost({ action: 'reactivate', id });
  if (res.error) { alert('Fehler beim Reaktivieren: ' + res.error); return; }
  await loadProdukte();
  rendere();
}

async function loescheProdukt(id) {
  if (!confirm('Inserat KOMPLETT LÖSCHEN?\n\nDie Aktion ist endgültig — Produkt + alle Daten weg.\n\nWenn du nur „aufräumen" willst, nimm lieber „Archivieren".')) return;
  const res = await sheetsPost({ action: 'delete', id });
  if (res.error) { alert('Fehler beim Löschen: ' + res.error); return; }
  await loadProdukte();
  rendere();
}

/* ─── Aktive Filter-Chips ─── */
function rendereAktiveChips() {
  const f = STATE.filter;
  const chips = [];

  f.zustand.forEach(z => chips.push({label: z === 'neu' ? 'Nur Neu' : 'Nur Gebraucht', type: 'zustand', value: z}));
  f.material.forEach(m => {
    const label = m === 'kunststoff' ? 'Kunststoff' : m === 'holz' ? 'Holz' : 'Aluminium';
    chips.push({label, type: 'material', value: m});
  });
  f.glasart.forEach(g => {
    const label = g === 'klarglas' ? 'Klarglas'
      : g === 'chinchilla' ? 'Chinchilla'
      : g === 'milchglas' ? 'Milchglas'
      : g === 'sicherheitsglas' ? 'Sicherheitsglas'
      : g === 'schallschutzglas' ? 'Schallschutzglas'
      : g;
    chips.push({label, type: 'glasart', value: g});
  });
  f.kategorien.forEach(k => chips.push({label: STATE.kategorien[k] || k, type: 'kategorie', value: k}));
  f.farben.forEach(c => chips.push({label: 'Farbe: ' + farbeAnzeige(c), type: 'farbe', value: c}));
  f.verglasung.forEach(v => chips.push({label: v + '-Verglasung', type: 'verglasung', value: v}));
  f.rc.forEach(r => chips.push({label: 'Sicherheit ' + r, type: 'rc', value: r}));
  f.eigenschaften.forEach(e => chips.push({label: eigenschaftAnzeige(e), type: 'eigenschaft', value: e}));

  if (f.breite !== null || f.hoehe !== null) {
    const b = f.breite || '?';
    const h = f.hoehe || '?';
    chips.push({label: `Maße: ${b} × ${h} mm (±${f.toleranz}%)`, type: 'masse', value: 'masse'});
  }
  if (f.preisVon !== null || f.preisBis !== null) {
    const v = f.preisVon || 0;
    const bis = f.preisBis || '∞';
    chips.push({label: `Preis: ${v}–${bis} €`, type: 'preis', value: 'preis'});
  }

  const wrap = document.getElementById('aktiveChips');
  wrap.innerHTML = chips.map(c => `
    <button class="chip" data-chip-type="${c.type}" data-chip-value="${escapeHtml(c.value)}">
      ${escapeHtml(c.label)}
      <span class="material-symbols-outlined" style="font-size:14px">close</span>
    </button>`).join('');

  wrap.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => entferneChipFilter(b.dataset.chipType, b.dataset.chipValue));
  });

  // Filter-Counter im Mobile-Trigger
  const fb = document.getElementById('filterCountBadge');
  if (chips.length) {
    fb.textContent = chips.length;
    fb.classList.remove('hidden');
  } else {
    fb.classList.add('hidden');
  }
}

function entferneChipFilter(type, value) {
  switch (type) {
    case 'zustand':
      STATE.filter.zustand.delete(value);
      const ze = document.querySelector(`.filter-zustand[value="${value}"]`);
      if (ze) ze.checked = false;
      break;
    case 'material':
      STATE.filter.material.delete(value);
      const me = document.querySelector(`.filter-material[value="${value}"]`);
      if (me) me.checked = false;
      break;
    case 'glasart':
      STATE.filter.glasart.delete(value);
      const ge = document.querySelector(`.filter-glasart[value="${value}"]`);
      if (ge) ge.checked = false;
      break;
    case 'kategorie':
      STATE.filter.kategorien.delete(value);
      document.querySelector(`.filter-kategorie[value="${value}"]`).checked = false;
      break;
    case 'farbe':
      STATE.filter.farben.delete(value);
      document.querySelector(`.filter-farbe[value="${value}"]`).checked = false;
      break;
    case 'verglasung':
      STATE.filter.verglasung.delete(value);
      document.querySelector(`.filter-verglasung[value="${value}"]`).checked = false;
      break;
    case 'rc':
      STATE.filter.rc.delete(value);
      document.querySelector(`.filter-rc[value="${value}"]`).checked = false;
      break;
    case 'eigenschaft':
      STATE.filter.eigenschaften.delete(value);
      const el = document.querySelector(`.filter-eigenschaft[value="${value}"]`);
      if (el) el.checked = false;
      break;
    case 'masse':
      STATE.filter.breite = null;
      STATE.filter.hoehe = null;
      document.getElementById('filterBreite').value = '';
      document.getElementById('filterHoehe').value = '';
      document.getElementById('masseHinweis').classList.add('hidden');
      break;
    case 'preis':
      STATE.filter.preisVon = null;
      STATE.filter.preisBis = null;
      document.getElementById('filterPreisVon').value = '';
      document.getElementById('filterPreisBis').value = '';
      break;
  }
  rendere();
}

function resetAlleFilter() {
  STATE.filter.zustand.clear();
  STATE.filter.material.clear();
  STATE.filter.glasart.clear();
  STATE.filter.kategorien.clear();
  STATE.filter.farben.clear();
  STATE.filter.groesse.clear();
  STATE.filter.sonderpreis = false;
  STATE.filter.exportModell = false;
  STATE.filter.verglasung.clear();
  STATE.filter.rc.clear();
  STATE.filter.eigenschaften.clear();
  STATE.filter.breite = null;
  STATE.filter.hoehe = null;
  STATE.filter.preisVon = null;
  STATE.filter.preisBis = null;
  STATE.filter.suche = '';
  document.querySelectorAll('#filterSidebar input[type="checkbox"]').forEach(c => c.checked = false);
  document.getElementById('filterBreite').value = '';
  document.getElementById('filterHoehe').value = '';
  document.getElementById('filterPreisVon').value = '';
  document.getElementById('filterPreisBis').value = '';
  document.getElementById('sucheInput').value = '';
  document.getElementById('sucheClearBtn').classList.add('hidden');
  document.getElementById('masseHinweis').classList.add('hidden');
  rendere();
}

/* ─── Warenkorb ─── */
function loadCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    STATE.warenkorb = raw ? JSON.parse(raw) : [];
  } catch (e) { STATE.warenkorb = []; }
}

function saveCart() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(STATE.warenkorb)); }
  catch (e) { console.warn('Warenkorb konnte nicht gespeichert werden'); }
}

function addToCart(id) {
  const eintrag = STATE.warenkorb.find(e => e.id === id);
  if (eintrag) eintrag.menge += 1;
  else STATE.warenkorb.push({id, menge: 1});
  saveCart();
  updateCartUI();
  zeigeCartFeedback(id);
}

function entferneAusCart(id) {
  STATE.warenkorb = STATE.warenkorb.filter(e => e.id !== id);
  saveCart();
  updateCartUI();
}

function aendereMenge(id, delta) {
  const eintrag = STATE.warenkorb.find(e => e.id === id);
  if (!eintrag) return;
  eintrag.menge = Math.max(1, eintrag.menge + delta);
  saveCart();
  updateCartUI();
}

function leereCart() {
  if (STATE.warenkorb.length === 0) return;
  if (!confirm('Warenkorb wirklich leeren?')) return;
  STATE.warenkorb = [];
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const total = STATE.warenkorb.reduce((s, e) => s + e.menge, 0);
  const badgeNav = document.getElementById('cartBadgeNav');
  if (badgeNav) {
    if (total > 0) { badgeNav.textContent = total; badgeNav.classList.remove('hidden'); }
    else { badgeNav.classList.add('hidden'); }
  }
  const titleCount = document.getElementById('cartTitleCount');
  if (titleCount) titleCount.textContent = total ? `(${total})` : '';

  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmptyState');
  const footerEl = document.getElementById('cartFooter');
  if (!itemsEl || !emptyEl || !footerEl) return;
  if (STATE.warenkorb.length === 0) {
    itemsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    footerEl.style.display = 'none';
    return;
  }
  itemsEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  footerEl.style.display = 'block';

  itemsEl.innerHTML = STATE.warenkorb.map(eintrag => {
    const p = STATE.produkte.find(x => x.id === eintrag.id);
    if (!p) return '';
    return `
      <div class="flex gap-3 py-3 border-b border-outline-variant last:border-0">
        <img src="${escapeHtml(p.bild)}" alt="" class="w-20 h-20 rounded-lg object-contain bg-surface-container-low" onerror="this.src='img/fenster_standard.png'"/>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold leading-snug line-clamp-2">${escapeHtml(p.titel)}</h4>
          <p class="text-[10px] text-on-surface-variant mt-0.5">${p.breite_mm} × ${p.hoehe_mm} mm</p>
          <div class="flex items-center justify-between mt-2">
            <div class="inline-flex items-center bg-surface-container-low rounded-full">
              <button class="w-6 h-6 rounded-full hover:bg-surface-variant flex items-center justify-center" data-cart-act="minus" data-id="${p.id}" aria-label="Weniger">
                <span class="material-symbols-outlined" style="font-size:14px">remove</span>
              </button>
              <span class="px-2 text-xs font-bold">${eintrag.menge}</span>
              <button class="w-6 h-6 rounded-full hover:bg-surface-variant flex items-center justify-center" data-cart-act="plus" data-id="${p.id}" aria-label="Mehr">
                <span class="material-symbols-outlined" style="font-size:14px">add</span>
              </button>
            </div>
            <span class="text-sm font-extrabold text-primary">${formatPreis(p.preis_eur * eintrag.menge)}</span>
          </div>
        </div>
        <button class="self-start text-on-surface-variant hover:text-error" data-cart-act="entfernen" data-id="${p.id}" aria-label="Entfernen">
          <span class="material-symbols-outlined" style="font-size:18px">delete_outline</span>
        </button>
      </div>`;
  }).join('');

  itemsEl.querySelectorAll('[data-cart-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.cartAct;
      const id = btn.dataset.id;
      if (act === 'minus') aendereMenge(id, -1);
      else if (act === 'plus') aendereMenge(id, 1);
      else if (act === 'entfernen') entferneAusCart(id);
    });
  });

  // Subtotal
  const subtotal = STATE.warenkorb.reduce((s, e) => {
    const p = STATE.produkte.find(x => x.id === e.id);
    return s + (p ? p.preis_eur * e.menge : 0);
  }, 0);
  document.getElementById('cartSubtotal').textContent = formatPreis(subtotal);
}

function oeffneCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function schliesseCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function zeigeCartFeedback(id) {
  // Kurz-Animation am Cart-Icon
  const btn = document.getElementById('cartBtnNav');
  btn.style.transition = 'transform 0.18s ease';
  btn.style.transform = 'scale(1.18)';
  setTimeout(() => { btn.style.transform = ''; }, 180);
}

function stelleCartAnfrage() {
  if (STATE.warenkorb.length === 0) return;
  const items = STATE.warenkorb.map(e => {
    const p = STATE.produkte.find(x => x.id === e.id);
    if (!p) return '';
    return `${e.menge}× ${p.titel} (Art.-Nr. ${p.id}) — ${formatPreis(p.preis_eur * e.menge)}`;
  }).filter(Boolean).join('\n');
  const subtotal = STATE.warenkorb.reduce((s, e) => {
    const p = STATE.produkte.find(x => x.id === e.id);
    return s + (p ? p.preis_eur * e.menge : 0);
  }, 0);
  const subject = encodeURIComponent('Anfrage Lager-Shop · DeineFenster.de');
  const body = encodeURIComponent(
    `Hallo,\n\nich interessiere mich für folgende Lagerware:\n\n${items}\n\nZwischensumme: ${formatPreis(subtotal)} (zzgl. Versand, inkl. 19% USt.)\n\nBitte um Rückmeldung mit Verfügbarkeit und Versandkosten.\n\nMein Name:\nMeine Adresse:\nLieferanschrift (falls abweichend):\nGewünschter Liefertermin:\n\nVielen Dank!\n`
  );
  window.location.href = `mailto:info@baustoffchrist.de?subject=${subject}&body=${body}`;
}

function stelleCartAnfrageWhatsApp() {
  if (STATE.warenkorb.length === 0) return;
  const items = STATE.warenkorb.map(e => {
    const p = STATE.produkte.find(x => x.id === e.id);
    if (!p) return '';
    return `${e.menge}× ${p.titel} (${p.breite_mm}×${p.hoehe_mm}mm) – ${formatPreis(p.preis_eur * e.menge)}`;
  }).filter(Boolean).join('\n');
  const subtotal = STATE.warenkorb.reduce((s, e) => {
    const p = STATE.produkte.find(x => x.id === e.id);
    return s + (p ? p.preis_eur * e.menge : 0);
  }, 0);
  const text = encodeURIComponent(`Hallo, ich interessiere mich für folgende Lagerware:\n\n${items}\n\nGesamt: ${formatPreis(subtotal)}\n\nBitte um Rückmeldung. Danke!`);
  window.open(`https://wa.me/491717263776?text=${text}`, '_blank');
}

/* ─── Detail-Modal ─── */
function oeffneDetail(id) {
  const p = STATE.produkte.find(x => x.id === id);
  if (!p) return;
  document.getElementById('detailTitel').textContent = p.titel;
  const eigList = (p.eigenschaften || []).map(e => `<li class="flex items-center gap-2"><span class="material-symbols-outlined text-success" style="font-size:16px">check_circle</span>${escapeHtml(eigenschaftAnzeige(e))}</li>`).join('');
  const standnrInfo = p.standnummer ? `<div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">📍 Standnummer</span><span class="font-bold text-ink">${escapeHtml(p.standnummer)}</span></div>` : '';
  const detail = document.getElementById('detailContent');
  // Bilder-Liste: alle hochgeladenen URLs, Fallback auf p.bild oder Platzhalter
  const bilderListe = (p.bilder && p.bilder.length > 0) ? p.bilder : [p.bild];
  const hatMehrere = bilderListe.length > 1;
  const carouselHTML = `
    <div class="aspect-[4/3] bg-bg-soft relative" id="bilderCarousel">
      <div class="carousel-track" data-current="0">
        ${bilderListe.map((url, i) => `
          <img src="${escapeHtml(url)}" alt="${escapeHtml(p.titel)} – Bild ${i+1} von ${bilderListe.length}"
               class="carousel-slide${i === 0 ? ' is-active' : ''}"
               loading="${i === 0 ? 'eager' : 'lazy'}"
               onerror="this.src='img/fenster_standard.png'"/>
        `).join('')}
      </div>
      <span class="symbolbild-mini">Symbolbild</span>
      ${hatMehrere ? `
        <button class="carousel-btn carousel-prev" type="button" aria-label="Vorheriges Bild">
          <span class="material-symbols-outlined" style="font-size:24px">chevron_left</span>
        </button>
        <button class="carousel-btn carousel-next" type="button" aria-label="Nächstes Bild">
          <span class="material-symbols-outlined" style="font-size:24px">chevron_right</span>
        </button>
        <div class="carousel-counter"><span id="carouselNum">1</span> / ${bilderListe.length}</div>
        <div class="carousel-dots" role="tablist" aria-label="Bilder-Auswahl">
          ${bilderListe.map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? ' is-active' : ''}" data-idx="${i}" aria-label="Bild ${i+1} anzeigen" role="tab"></button>`).join('')}
        </div>
      ` : ''}
    </div>`;
  detail.innerHTML = `
    ${carouselHTML}
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between gap-2 -mt-1">
        <span class="text-[11px] text-ink-soft inline-flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:15px">zoom_in</span>Bild antippen zum Vergrößern</span>
        <div class="inline-flex items-center gap-2">
          <button id="detailPrintBtn" type="button" class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm hover:opacity-90" style="color:#225eaa;background:#eef4ff;border:1px solid #cfe0ff;"><span class="material-symbols-outlined" style="font-size:18px">print</span>Drucken</button>
          <button id="detailShareBtn" type="button" class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm hover:opacity-90" style="color:#fff;background:#225eaa;"><span class="material-symbols-outlined" style="font-size:18px">share</span>Teilen</button>
        </div>
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${!['daemmung','baumaterialien','garagentor-gebraucht'].includes(kategorieZuGruppe(p.kategorie)) ? _asArr(p.verglasung).map(v => `<span class="pill is-primary">${v}-Verglasung</span>`).join('') : ''}
        ${p.rc_klasse ? `<span class="pill is-gold">${p.rc_klasse}</span>` : ''}
        ${lagerBadgeHtml(p)}
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Breite</span><span class="font-bold text-ink">${p.breite_mm} mm</span></div>
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Höhe</span><span class="font-bold text-ink">${p.hoehe_mm} mm</span></div>
        ${standnrInfo}
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">System</span><span class="font-bold text-ink">${p.system ? escapeHtml(p.system) : '—'}</span></div>
        ${_asArr(p.oeffnungsart).length ? `<div class="bg-bg-soft rounded-lg px-3 py-2 col-span-2"><span class="block text-[10px] text-ink-soft">Öffnungsart</span><span class="font-bold text-ink">${_asArr(p.oeffnungsart).map(o => escapeHtml(oeffnungsartLabel(o))).join(', ')}</span></div>` : ''}
      </div>
      <p class="text-sm text-ink-soft leading-relaxed">${nl2br(p.beschreibung)}</p>
      <div>
        <h4 class="text-sm font-bold mb-2 text-ink">Eigenschaften</h4>
        <ul class="text-xs space-y-1 text-ink">${eigList || '<li class="text-ink-soft">Keine besonderen Eigenschaften eingetragen</li>'}</ul>
      </div>
    </div>
    <div class="shop-detail-cta">
      <div class="shop-detail-cta-price">
        <span class="block text-[11px] text-ink-soft">${istSammelInserat(p) ? 'Preis ab' : 'Preis'}</span>
        <span class="text-2xl font-extrabold text-primary leading-none">${formatPreis(p.preis_eur)}</span>
      </div>
      <div class="shop-detail-cta-btns">
        <a href="https://wa.me/491717263776?text=${encodeURIComponent(`Hallo, ist "${p.titel}" (${p.breite_mm}×${p.hoehe_mm} mm, ${formatPreis(p.preis_eur)}, Art-Nr. ${p.id}) noch verfügbar?`)}"
           target="_blank" rel="noopener" class="detail-cta-wa" aria-label="Per WhatsApp anfragen">
          <span class="material-symbols-outlined" style="font-size:18px">chat</span>
          WhatsApp
        </a>
        <button id="detailAddBtn" class="detail-cta-anfrage">
          <span class="material-symbols-outlined" style="font-size:18px">mail</span>
          Anfragen
        </button>
      </div>
    </div>`;
  detail.querySelector('#detailAddBtn').addEventListener('click', () => {
    schliesseDetail();
    oeffneAnfrageModal(p);
  });
  // Bilder-Carousel-Setup (nur wenn mehrere Bilder)
  if (hatMehrere) setupCarousel(bilderListe.length);
  // Teilen-Button
  const shareBtn = detail.querySelector('#detailShareBtn');
  if (shareBtn) shareBtn.addEventListener('click', () => teileProdukt(p));
  const printBtn = detail.querySelector('#detailPrintBtn');
  if (printBtn) printBtn.addEventListener('click', () => druckeProduktblatt(p));
  // Bild antippen → große Vollbild-Ansicht (startet beim aktuell sichtbaren Bild)
  const carouselEl = detail.querySelector('#bilderCarousel');
  if (carouselEl) {
    carouselEl.style.cursor = 'zoom-in';
    carouselEl.addEventListener('click', (e) => {
      if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dot')) return; // Pfeile/Punkte nicht abfangen
      const slides = Array.from(carouselEl.querySelectorAll('.carousel-slide'));
      const aktiv  = carouselEl.querySelector('.carousel-slide.is-active');
      const startIdx = Math.max(0, slides.indexOf(aktiv));
      oeffneLightbox(bilderListe, startIdx, p.titel);
    });
  }
  document.getElementById('detailModal').classList.add('open');
  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Deep-Link in der Adresszeile setzen — Kunde/Inhaber kann die URL direkt kopieren/teilen
  try { history.replaceState(null, '', location.pathname + '?produkt=' + encodeURIComponent(id)); } catch (e) {}
}

/* ─── Bilder-Carousel im Detail-Modal ─── */
function setupCarousel(total) {
  const root = document.getElementById('bilderCarousel');
  if (!root) return;
  let current = 0;
  const slides = root.querySelectorAll('.carousel-slide');
  const dots   = root.querySelectorAll('.carousel-dot');
  const num    = root.querySelector('#carouselNum');
  const prev   = root.querySelector('.carousel-prev');
  const next   = root.querySelector('.carousel-next');
  const track  = root.querySelector('.carousel-track');

  function show(idx) {
    current = ((idx % total) + total) % total;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i)   => d.classList.toggle('is-active', i === current));
    if (num) num.textContent = String(current + 1);
  }

  prev?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));
  dots.forEach(d => d.addEventListener('click', e => {
    const idx = Number(e.currentTarget.dataset.idx);
    if (!Number.isNaN(idx)) show(idx);
  }));

  // Touch-Swipe für Mobile
  let startX = 0;
  let startY = 0;
  track?.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  track?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    // Nur horizontal swipen (kein vertikales Versehen)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      show(current + (dx > 0 ? -1 : 1));
    }
  }, { passive: true });

  // Keyboard-Pfeiltasten (nur wenn Modal offen)
  function carouselKeys(e) {
    const modal = document.getElementById('detailModal');
    if (!modal || !modal.classList.contains('open')) {
      document.removeEventListener('keydown', carouselKeys);
      return;
    }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  }
  document.addEventListener('keydown', carouselKeys);
}

function schliesseDetail() {
  document.getElementById('detailModal').classList.remove('open');
  document.getElementById('detailOverlay').classList.remove('open');
  document.body.style.overflow = '';
  // Deep-Link-Parameter aus der Adresse entfernen (sauberer Zustand)
  try { if (location.search.indexOf('produkt=') !== -1) history.replaceState(null, '', location.pathname); } catch (e) {}
}

/* ─── Bild-Lightbox (Vollbild beim Antippen) + Teilen + Deep-Link ─── */
let _lbBilder = [], _lbIdx = 0;
function ensureLightboxStyles() {
  if (document.getElementById('lbStyles')) return;
  const s = document.createElement('style');
  s.id = 'lbStyles';
  s.textContent = `
    #lightbox{position:fixed;inset:0;z-index:9999;background:rgba(8,10,20,0.94);display:none;
      align-items:center;justify-content:center;padding:24px}
    #lightbox.open{display:flex}
    #lightbox img{max-width:96vw;max-height:88vh;object-fit:contain;border-radius:8px;
      box-shadow:0 12px 60px rgba(0,0,0,0.6);user-select:none;-webkit-user-select:none}
    .lb-close{position:absolute;top:16px;right:20px;width:46px;height:46px;border:none;border-radius:50%;
      background:rgba(255,255,255,0.14);color:#fff;font-size:28px;cursor:pointer;display:flex;
      align-items:center;justify-content:center;line-height:1}
    .lb-close:hover{background:rgba(255,255,255,0.26)}
    .lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:54px;height:54px;border:none;
      border-radius:50%;background:rgba(255,255,255,0.14);color:#fff;font-size:30px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;line-height:1}
    .lb-nav:hover{background:rgba(255,255,255,0.26)}
    .lb-prev{left:16px}.lb-next{right:16px}
    .lb-count{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:#fff;font-size:13px;
      background:rgba(0,0,0,0.4);padding:5px 12px;border-radius:20px;font-family:Manrope,sans-serif}
    #shopToast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#225eaa;
      color:#fff;padding:12px 22px;border-radius:30px;font-size:14px;font-weight:700;font-family:Manrope,sans-serif;
      box-shadow:0 8px 30px rgba(0,0,0,0.3);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:10000}
    #shopToast.show{opacity:1;transform:translateX(-50%) translateY(0)}`;
  document.head.appendChild(s);
}
function _lbRender() {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const mehrere = _lbBilder.length > 1;
  box.querySelector('img').src = _lbBilder[_lbIdx];
  const cnt = box.querySelector('.lb-count');
  if (cnt) cnt.textContent = mehrere ? `${_lbIdx + 1} / ${_lbBilder.length}` : '';
  box.querySelectorAll('.lb-nav').forEach(b => b.style.display = mehrere ? 'flex' : 'none');
}
function oeffneLightbox(bilder, startIdx, titel) {
  ensureLightboxStyles();
  _lbBilder = (bilder && bilder.length) ? bilder : [];
  if (!_lbBilder.length) return;
  _lbIdx = Math.min(Math.max(0, startIdx || 0), _lbBilder.length - 1);
  let box = document.getElementById('lightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'lightbox';
    box.innerHTML = `
      <button class="lb-close" type="button" aria-label="Schließen">&times;</button>
      <button class="lb-nav lb-prev" type="button" aria-label="Vorheriges Bild">&#8249;</button>
      <img alt=""/>
      <button class="lb-nav lb-next" type="button" aria-label="Nächstes Bild">&#8250;</button>
      <div class="lb-count"></div>`;
    document.body.appendChild(box);
    box.querySelector('img').onerror = function () { this.src = 'img/fenster_standard.png'; };
    box.querySelector('.lb-close').addEventListener('click', schliesseLightbox);
    box.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); _lbIdx = (_lbIdx - 1 + _lbBilder.length) % _lbBilder.length; _lbRender(); });
    box.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); _lbIdx = (_lbIdx + 1) % _lbBilder.length; _lbRender(); });
    box.addEventListener('click', e => { if (e.target === box) schliesseLightbox(); });
    document.addEventListener('keydown', _lbKeys);
  }
  box.querySelector('img').alt = titel || '';
  _lbRender();
  box.classList.add('open');
}
function schliesseLightbox() { const b = document.getElementById('lightbox'); if (b) b.classList.remove('open'); }
function _lbKeys(e) {
  const b = document.getElementById('lightbox');
  if (!b || !b.classList.contains('open')) return;
  if (e.key === 'Escape') schliesseLightbox();
  if (e.key === 'ArrowLeft'  && _lbBilder.length > 1) { _lbIdx = (_lbIdx - 1 + _lbBilder.length) % _lbBilder.length; _lbRender(); }
  if (e.key === 'ArrowRight' && _lbBilder.length > 1) { _lbIdx = (_lbIdx + 1) % _lbBilder.length; _lbRender(); }
}
function teileProdukt(p) {
  const url = location.origin + location.pathname + '?produkt=' + encodeURIComponent(p.id);
  if (navigator.share) {
    navigator.share({ title: p.titel || 'Produkt', text: (p.titel || '') + ' – DeineFenster.de', url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => zeigeToast('Link kopiert ✓')).catch(() => zeigeToast(url));
  } else {
    zeigeToast(url);
  }
}
// Kunden-Druckblatt: sauberes A4-Produktblatt zum Mitnehmen / dem Fahrer mitgeben
function druckeProduktblatt(p) {
  if (!p) return;
  const e = s => escapeHtml(String(s == null ? '' : s));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const arr = a => _asArr(a).filter(Boolean).join(', ');
  const url = location.origin + location.pathname + '?produkt=' + encodeURIComponent(p.id);
  const bild = p.bild || (p.bilder && p.bilder[0]) || '';
  const masse = (p.breite_mm && p.hoehe_mm) ? (p.breite_mm + ' × ' + p.hoehe_mm + ' mm') : '';
  const oeff = _asArr(p.oeffnungsart).map(o => oeffnungsartLabel(o)).join(', ');
  const row = (l, v) => v ? ('<tr><td class="l">' + l + '</td><td class="v">' + v + '</td></tr>') : '';
  const standBig = p.standnummer
    ? '<div class="stand"><span class="stand-l">Lagerplatz / Standnummer</span><span class="stand-v">' + e(p.standnummer) + '</span></div>'
    : '';
  const rows = row('Artikel-Nr.', e(p.id))
    + row('Maße (B × H)', e(masse))
    + row('Zustand', e(cap(arr(p.zustand))))
    + row('Material', e(cap(arr(p.material))))
    + row('Verglasung', e(arr(p.verglasung)))
    + row('Farbe', e(cap(arr(p.farbe))))
    + row('Öffnungsart', e(oeff))
    + row('System', e(p.system || ''));
  const html = '<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>'
    + e(p.titel || 'Produkt') + ' – DeineFenster.de</title><style>'
    + '@page{size:A4;margin:16mm}*{box-sizing:border-box}'
    + 'body{font-family:Arial,Helvetica,sans-serif;color:#14233f;margin:0;line-height:1.5}'
    + '.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #225eaa;padding-bottom:10px;margin-bottom:18px}'
    + '.brand{font-size:22px;font-weight:800;color:#225eaa}.brand i{color:#14233f;font-style:normal}'
    + '.firm{font-size:11px;text-align:right;color:#3b4a63;line-height:1.45}'
    + 'h1{font-size:20px;margin:0 0 14px}.top{display:flex;gap:18px;margin-bottom:8px}'
    + '.foto{width:46%;max-width:320px}.foto img{width:100%;border:1px solid #d6deea;border-radius:8px}'
    + '.foto .sym{font-size:10px;color:#6b7790;margin-top:4px;display:block}'
    + '.info{flex:1}table{border-collapse:collapse;width:100%;font-size:13px}'
    + 'td{padding:6px 8px;border-bottom:1px solid #e6ebf3;vertical-align:top}'
    + 'td.l{color:#6b7790;width:42%}td.v{font-weight:700}'
    + '.stand{margin:14px 0;padding:10px 14px;background:#eef4ff;border:1px solid #cfe0ff;border-radius:8px}'
    + '.stand-l{display:block;font-size:10px;color:#6b7790;text-transform:uppercase;letter-spacing:.04em}'
    + '.stand-v{font-size:22px;font-weight:800;color:#225eaa}'
    + '.preis{font-size:30px;font-weight:800;color:#225eaa;margin:6px 0 2px}'
    + '.preis-hint{font-size:11px;color:#3b4a63;margin-bottom:6px}'
    + '.desc{font-size:12.5px;color:#2a3650;margin:10px 0;white-space:pre-line}'
    + '.foot{margin-top:18px;border-top:1px solid #d6deea;padding-top:10px;font-size:11px;color:#3b4a63}'
    + '.foot b{color:#14233f}</style></head>'
    + '<body onload="window.focus();window.print();">'
    + '<div class="head"><div class="brand">DeineFenster<i>.de</i></div>'
    + '<div class="firm"><b>Türen und Fensterhandel Christ</b><br>Fohrder Landstraße 13<br>14772 Brandenburg an der Havel<br>Tel. 03381 / 2148373 · WhatsApp 0171 7263776</div></div>'
    + '<h1>' + e(p.titel || 'Produkt') + '</h1><div class="top">'
    + (bild ? '<div class="foto"><img src="' + e(bild) + '" alt=""><span class="sym">Abbildung ähnlich (Symbolbild)</span></div>' : '')
    + '<div class="info"><table>' + rows + '</table>'
    + '<div class="preis">' + e(formatPreis(p.sonderpreis_eur || p.preis_eur)) + '</div>'
    + '<div class="preis-hint">inkl. 19 % MwSt., zzgl. Versandkosten bei Lieferung · Selbstabholung in Brandenburg a. d. Havel kostenfrei</div>'
    + standBig + '</div></div>'
    + (p.beschreibung ? '<div class="desc">' + e(p.beschreibung) + '</div>' : '')
    + '<div class="foot"><b>Verfügbarkeit bitte vorab prüfen</b> — WhatsApp 0171 7263776 oder Angebot per E-Mail. '
    + 'Lagerverkauf vor Ort: freitags 10–17 Uhr, Fohrder Landstraße 13, Brandenburg a. d. Havel.<br>Online ansehen: ' + e(url) + '</div>'
    + '</body></html>';
  const w = window.open('', '_blank', 'width=840,height=1000');
  if (!w) { zeigeToast('Bitte Pop-ups erlauben zum Drucken'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
function zeigeToast(text) {
  ensureLightboxStyles();
  let t = document.getElementById('shopToast');
  if (!t) { t = document.createElement('div'); t.id = 'shopToast'; document.body.appendChild(t); }
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}
function oeffneDeepLinkProdukt() {
  const pid = new URLSearchParams(location.search).get('produkt');
  if (!pid) return;
  if (STATE.produkte && STATE.produkte.some(x => x.id === pid)) oeffneDetail(pid);
}

/* ─── Anfrage-Modal: Produkt-spezifische Anfrage via Web3Forms ─── */
const SHOP_WEB3FORMS_KEY = '440a94ff-9f42-46af-bf3d-47013dbd8f5f';

function oeffneAnfrageModal(p) {
  document.getElementById('anfrageProduktId').value = p.id;
  document.getElementById('anfrageProduktTitel').value = p.titel;
  // Nachricht vorausfüllen mit Produkt-Daten
  const lines = [
    `Hallo,`,
    ``,
    `ich interessiere mich für folgendes Produkt aus Ihrem Lager-Shop:`,
    ``,
    `Produkt: ${p.titel}`,
    `Artikel-Nr.: ${p.id}`,
    `Maße: ${p.breite_mm} × ${p.hoehe_mm} mm`,
    `Zustand: ${_asArr(p.zustand).includes('gebraucht') ? 'Gebraucht' : 'Neu'}`,
    `Preis: ${formatPreis(p.preis_eur)}`,
    p.standnummer ? `Standnummer: ${p.standnummer}` : '',
    ``,
    `Ist dieses Produkt noch verfügbar? Bitte um Rückmeldung.`,
    ``,
    `Vielen Dank!`
  ].filter(Boolean).join('\n');
  document.getElementById('anfrageNachricht').value = lines;
  // Status zurücksetzen
  const st = document.getElementById('anfrageStatus');
  st.classList.add('hidden');
  st.textContent = '';
  const btn = document.getElementById('anfrageSubmitBtn');
  btn.disabled = false;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">send</span> Anfrage senden';

  document.getElementById('anfrageModal').classList.add('open');
  document.getElementById('anfrageOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('anfrageName').focus(), 80);
}

function schliesseAnfrageModal() {
  document.getElementById('anfrageModal').classList.remove('open');
  document.getElementById('anfrageOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function sendeAnfrage(ev) {
  ev.preventDefault();
  const form = ev.target;
  const status = document.getElementById('anfrageStatus');
  const btn = document.getElementById('anfrageSubmitBtn');

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const dse = form.dse.checked;
  if (!name || !email || !dse) {
    status.textContent = 'Bitte Name, E-Mail und Datenschutz-Zustimmung ausfüllen.';
    status.style.cssText = 'padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);color:#fca5a5;';
    status.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">hourglass_empty</span> Wird gesendet …';

  const payload = {
    access_key: SHOP_WEB3FORMS_KEY,
    subject: `Lager-Anfrage · ${form.produkt_titel.value}`,
    from_name: 'DeineFenster.de Shop-Anfrage',
    botcheck: '',
    Name: name,
    Email: email,
    Telefon: form.telefon.value.trim() || '—',
    Produkt: form.produkt_titel.value,
    'Artikel-Nr': form.produkt_id.value,
    Nachricht: form.nachricht.value,
    'Datenschutz-Zustimmung': dse ? 'Ja, akzeptiert' : 'Nein'
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      status.textContent = 'Danke! Ihre Anfrage ist bei uns angekommen — wir melden uns so schnell wie möglich zurück.';
      status.style.cssText = 'padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);color:#86efac;';
      status.classList.remove('hidden');
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">check</span> Gesendet';
      setTimeout(schliesseAnfrageModal, 2500);
    } else {
      throw new Error(data.message || 'Unbekannter Fehler');
    }
  } catch (err) {
    status.textContent = 'Senden fehlgeschlagen. Bitte direkt per WhatsApp (0171 7263776) oder E-Mail (info@baustoffchrist.de) melden.';
    status.style.cssText = 'padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);color:#fca5a5;';
    status.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">send</span> Erneut versuchen';
  }
}

// Listener registrieren (bei DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('anfrageForm');
  if (form) form.addEventListener('submit', sendeAnfrage);
  const closeBtn = document.getElementById('anfrageCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', schliesseAnfrageModal);
  const overlay = document.getElementById('anfrageOverlay');
  if (overlay) overlay.addEventListener('click', schliesseAnfrageModal);
});

/* ─── Schema.org Product Markup für SEO + AEO/GEO ─── */
function rendereSchemaOrg(produkte) {
  const items = produkte.slice(0, 50).map((p, i) => ({  // Cap auf 50 für Performance
    '@type': 'ListItem',
    'position': i + 1,
    'item': {
      '@type': 'Product',
      'name': p.titel,
      'description': p.beschreibung || `${STATE.kategorien[p.kategorie] || 'Fenster'} ${p.breite_mm}×${p.hoehe_mm} mm`,
      'image': p.bild ? `https://sarahhheea.github.io/deinefenster-live/${p.bild}` : undefined,
      'category': STATE.kategorien[p.kategorie] || 'Fenster und Türen',
      'brand': { '@type': 'Brand', 'name': p.system ? p.system.split(' ')[0] : 'Drutex' },
      'width':  { '@type': 'QuantitativeValue', 'value': p.breite_mm, 'unitCode': 'MMT' },
      'height': { '@type': 'QuantitativeValue', 'value': p.hoehe_mm, 'unitCode': 'MMT' },
      'itemCondition': _asArr(p.zustand).includes('gebraucht') ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      'offers': {
        '@type': 'Offer',
        'price': p.preis_eur,
        'priceCurrency': 'EUR',
        'availability': p.lagerbestand > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'url': `https://sarahhheea.github.io/deinefenster-live/shop.html#${p.id}`,
        'seller': {
          '@type': 'Organization',
          'name': 'Türen und Fensterhandel Christ',
          'url': 'https://sarahhheea.github.io/deinefenster-live/'
        }
      }
    }
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Drutex Lager-Shop · DeineFenster.de',
    'description': 'Drutex-Fenster und -Türen direkt aus dem Lager — sofort lieferbar.',
    'numberOfItems': items.length,
    'itemListElement': items
  };

  let scriptEl = document.getElementById('schema-org-products');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.id = 'schema-org-products';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(data);
}

/* ─── Helper ─── */
function formatPreis(n) {
  return new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(n);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function nl2br(str) {
  return escapeHtml(str).replace(/\n/g, '<br>');
}

function farbeAnzeige(code) {
  const map = {
    'weiss': 'Weiß',
    'anthrazit': 'Anthrazit',
    'grau': 'Grau',
    'schwarz': 'Schwarz',
    'dunkelgruen': 'Dunkelgrün',
    'golden-oak': 'Golden Oak',
    'nussbaum': 'Nussbaum',
    'holzdekor': 'Holzdekor',
    'farbig': 'Farbig'
  };
  return map[code] || code;
}

function groesseLabel(code) {
  return ({klein:'Klein', schmal:'Schmal', normal:'Normal', hoch:'Hoch', gross:'Groß'})[code] || code;
}

/* Öffnungsart-Anzeige mit Griff-Hinweis (interner Hinweis.04.2026)
   Damit Kunden im Shop sofort sehen wo der Griff sitzt. */
function oeffnungsartLabel(code) {
  const map = {
    'dreh-kipp-rechts': 'Dreh-Kipp Rechts (Griff links)',
    'dreh-kipp-links':  'Dreh-Kipp Links (Griff rechts)',
    'dreh-rechts':      'Dreh Rechts (Griff links)',
    'dreh-links':       'Dreh Links (Griff rechts)',
    'dreh-kipp':        'Dreh-Kipp',
    'kipp':             'Nur Kipp',
    'fest':             'Festverglasung',
    'stulp':            'Stulp (zweiflüglig, ohne Pfosten)',
    'pfosten':          'Pfosten (zweiflüglig, mit Mittelpfosten)',
    'psk':              'Parallel-Schiebe-Kipp (PSK)',
    'hebe-schiebe':     'Hebe-Schiebe',
    'drehfluegel':      'Drehflügel'
  };
  return map[code] || code;
}

function eigenschaftAnzeige(code) {
  const map = {
    'dreh-kipp': 'Dreh-Kipp',
    'stulp': 'Stulpprofil (kein Mittelpfosten)',
    'pfosten': 'Mittelpfosten',
    'festverglasung': 'Festverglasung',
    'kompaktmass': 'Kompaktmaß',
    'alu-schwelle': 'Alu-Schwelle',
    'null-schwelle': 'Null-Schwelle',
    'barrierefrei': 'Barrierefrei',
    'rollladen-elektrisch': 'Mit elektr. Rollladen',
    'edelstahl-stossgriff': 'Edelstahl-Stoßgriff',
    '5-fach-verriegelung': '5-fach-Verriegelung',
    'parallel-schiebe-kipp': 'Parallel-Schiebe-Kipp',
    'hebe-schiebe': 'Hebe-Schiebe',
    'oberlicht': 'Mit Oberlicht',
    'unterlicht': 'Mit Unterlicht',
    'ober-unter-licht': 'Mit Ober- und Unterlicht',
    'kaempfer': 'Mit Kämpfer',
    'sprossen-aufgesetzt': 'Mit Sprossen',
    'sprossen-innen': 'Innenliegende Sprossen',
    'holzdekor': 'Holzdekor',
    // Rollladen — gleiche Schlüssel wie im Einstell-Formular (vorher unbeschriftet)
    'rollladen-gurtwickler': 'Mit Rollladen (Gurtwickler)',
    'rollladen-motor': 'Mit Rollladen (Motor)',
    // Zustand / Komfort (vorher unbeschriftet → roher Code im Filter)
    'einzelstueck': 'Einzelstück',
    'vermessen': 'Vermessen',
    'beidseitig-abschliessbar': 'Beidseitig abschließbar',
    // Farbe (Eigenschaften-Variante)
    'farbe-weiss': 'Weiß',
    'farbe-anthrazit': 'Anthrazit',
    'farbe-grau': 'Grau',
    'farbe-farbig': 'Farbig',
    'passivhaus-tauglich': 'Passivhaus-tauglich',
    '2-fach-verglasung': '2-fach-Verglasung',
    '3-fach-verglasung': '3-fach-Verglasung',
    'rc2': 'RC2-Sicherheit',
    'rc3': 'RC3-Sicherheit',
    // Bauart-Tags (abgeleitet aus kategorie_key, interner Hinweis.05.2026)
    'einfluegelig': 'Einflügelig',
    'zweifluegelig': 'Zweiflügelig',
    'dreifluegelig': 'Dreiflügelig',
    'vierfluegelig': 'Vierflügelig',
    'mit-rollo': 'Mit Rollladen',
    'kellerfenster-typ': 'Kellerfenster',
    'rundfenster-typ': 'Rundes Fenster',
    'rundbogenfenster-typ': 'Rundbogenfenster',
    'stichbogenfenster-typ': 'Stichbogenfenster'
  };
  if (map[code]) return map[code];
  // Fallback: unbekannten Schlüssel lesbar machen statt roh anzeigen
  // (z.B. neue Eigenschaft "null-schwelle" → "Null Schwelle")
  return String(code).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
