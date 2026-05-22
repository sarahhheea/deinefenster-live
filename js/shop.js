/* ─────────────────────────────────────────────────────────────────────
   shop.js — DeineFenster.de Lager-Shop
   Lädt data/shop-produkte.json, baut Filter-Sidebar dynamisch auf,
   handhabt Suche (mit Maß-Auto-Erkennung), Filter, Sortierung,
   Warenkorb (LocalStorage), Detail-Modal.
   Stand: 27.04.2026
   ───────────────────────────────────────────────────────────────────── */

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
  await checkAuth();
  await loadProdukte();
  baueFilterSidebar();
  bindeEventHandler();
  applyUrlFilter();
  rendere();
  updateCartUI();
});

/* ─── URL-Parameter Filter (z.B. shop.html?zustand=gebraucht oder ?cat=daemmung) ─── */
function applyUrlFilter() {
  const params = new URLSearchParams(window.location.search);
  const zustand = params.get('zustand');
  let scrollNeeded = false;
  if (zustand === 'gebraucht' || zustand === 'neu') {
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
  if (kat.startsWith('fenster-') || ['festelement','kellerfenster','rundfenster','rundbogenfenster','stichbogenfenster'].includes(kat)) return 'fenster';
  if (kat.startsWith('balkontuer-')) return 'balkontuer';
  if (kat === 'haustuer' || kat.startsWith('haustuer-')) return 'haustuer';
  if (kat.startsWith('schiebetuer-')) return 'schiebetuer';
  if (['daemmung','baumaterialien','garagentor-gebraucht'].includes(kat)) return kat;
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
      return {
        id: String(p.id),
        titel: p.titel || '',
        kategorie: kat,
        system: p.system || '',
        zustand: p.zustand || 'neu',
        material: (p.material || 'kunststoff').toLowerCase(),
        glasart: (p.glasart || 'klarglas').toLowerCase(),
        breite_mm: Number(p.breite_mm) || 0,
        hoehe_mm: Number(p.hoehe_mm) || 0,
        preis_eur: Number(p.preis_eur) || 0,
        sonderpreis_eur: p.sonderpreis_eur ? Number(p.sonderpreis_eur) : null,
        groesse_klasse: p.groesse_klasse || null,
        export_modell: !!p.export_modell,
        standnummer: p.standnummer || null,
        farbe: p.farbe || 'weiss',
        verglasung: p.verglasung || null,
        u_wert: p.u_wert || null,
        oeffnungsart: p.oeffnungsart || 'dreh-kipp',
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
      return { ...p, kategorie: kat, eigenschaften: [...baseEig, ...bauart] };
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
      alle_farben: ['weiss', 'anthrazit', 'golden-oak', 'nussbaum', 'schwarz', 'dunkelgruen']
    };
  }
  const alleEig = new Set();
  const alleFarben = new Set(['weiss', 'anthrazit', 'golden-oak', 'nussbaum', 'schwarz', 'dunkelgruen']);
  produkte.forEach(p => {
    (p.eigenschaften || []).forEach(e => alleEig.add(e));
    if (p.farbe) alleFarben.add(p.farbe);
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
    const count = STATE.produkte.filter(p => kategorieZuGruppe(p.kategorie) === key).length;
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

  // Farben
  const farbWrap = document.getElementById('filterFarben');
  const alleFarben = STATE.metadaten.alle_farben || [];
  farbWrap.innerHTML = alleFarben.map(f => {
    const count = STATE.produkte.filter(p => p.farbe === f).length;
    if (count === 0) return '';
    return `
      <label class="filter-option">
        <span class="flex items-center gap-2"><input type="checkbox" class="check filter-farbe" value="${f}"/><span>${farbeAnzeige(f)}</span></span>
        <span class="count">${count}</span>
      </label>`;
  }).join('');

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
  setCountAttr('zustand-neu', STATE.produkte.filter(p => (p.zustand || 'neu') === 'neu').length);
  setCountAttr('zustand-gebraucht', STATE.produkte.filter(p => p.zustand === 'gebraucht').length);
  setCountAttr('zustand-vermessen', STATE.produkte.filter(p => (p.eigenschaften || []).includes('vermessen')).length);
  setCountAttr('zustand-sonderposten', STATE.produkte.filter(p => p.zustand === 'sonderposten').length);
  setCountAttr('material-kunststoff', STATE.produkte.filter(p => (p.material || 'kunststoff') === 'kunststoff').length);
  setCountAttr('material-holz', STATE.produkte.filter(p => p.material === 'holz').length);
  setCountAttr('material-aluminium', STATE.produkte.filter(p => p.material === 'aluminium').length);
  setCountAttr('glasart-klarglas', STATE.produkte.filter(p => (p.glasart || 'klarglas') === 'klarglas').length);
  setCountAttr('glasart-chinchilla', STATE.produkte.filter(p => p.glasart === 'chinchilla').length);
  setCountAttr('glasart-milchglas', STATE.produkte.filter(p => p.glasart === 'milchglas').length);
  setCountAttr('glasart-sicherheitsglas', STATE.produkte.filter(p => p.glasart === 'sicherheitsglas').length);
  setCountAttr('glasart-schallschutzglas', STATE.produkte.filter(p => p.glasart === 'schallschutzglas').length);
  setCountAttr('verglasung-2-fach', STATE.produkte.filter(p => p.verglasung === '2-fach').length);
  setCountAttr('verglasung-3-fach', STATE.produkte.filter(p => p.verglasung === '3-fach').length);
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
    // Zustand (neu / gebraucht / vermessen — exklusiv)
    if (f.zustand.size) {
      if (f.zustand.has('vermessen')) {
        if (!(p.eigenschaften || []).includes('vermessen')) return false;
      } else {
        if (!f.zustand.has(p.zustand || 'neu')) return false;
      }
    }
    // Material (Kunststoff / Holz / Aluminium — mehrere kombinierbar)
    if (f.material.size && !f.material.has(p.material || 'kunststoff')) return false;
    // Glasart (Klarglas / Chinchilla / Milchglas / Sicherheitsglas / Schallschutzglas — mehrere kombinierbar)
    if (f.glasart.size && !f.glasart.has(p.glasart || 'klarglas')) return false;
    // Kategorie (Hauptgruppe matched alle Sub-Kategorien via kategorieZuGruppe)
    if (f.kategorien.size && !f.kategorien.has(kategorieZuGruppe(p.kategorie))) return false;
    // Größen-Klasse
    if (f.groesse.size && (!p.groesse_klasse || !f.groesse.has(p.groesse_klasse))) return false;
    // Sonderpreis
    if (f.sonderpreis && !p.sonderpreis_eur) return false;
    // Export
    if (f.exportModell && !p.export_modell) return false;
    // Farbe
    if (f.farben.size && !f.farben.has(p.farbe)) return false;
    // Verglasung
    if (f.verglasung.size && !f.verglasung.has(p.verglasung)) return false;
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
          p.farbe,
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
const SHOP_HEADERS = {
  default: {
    label: 'Direkt vor Ort · Brandenburg an der Havel',
    title: 'Unser Lagerbestand — Drutex Ware direkt zum Mitnehmen',
    desc: 'Originale <strong>Drutex-Kunststofffenster, Balkontüren und Haustüren</strong> in gängigen Maßen — neu, gebraucht und falsch vermessen. Alles zur Selbstabholung vor Ort in Brandenburg an der Havel. <strong>Bitte Helfer und Transporter mitbringen. Öffnungszeiten beachten.</strong>'
  },
  neu: {
    label: 'Neuware · Brandenburg an der Havel',
    title: 'Drutex Neuware ab Lager — ungeöffnet, direkt zum Mitnehmen',
    desc: 'Originale <strong>Drutex-Kunststofffenster, Balkontüren und Haustüren</strong> in gängigen Maßen — neu, ungeöffnet, ab Lager. Zur Selbstabholung vor Ort in Brandenburg an der Havel. <strong>Bitte Öffnungszeiten beachten.</strong>'
  },
  gebraucht: {
    label: 'Gebrauchtware · Brandenburg an der Havel',
    title: 'Gebrauchte Fenster & Türen direkt vor Ort abholen',
    desc: 'Gebrauchte <strong>Fenster, Balkontüren und Haustüren</strong> — geprüft, funktional und zu fairen Preisen. Nachhaltig kaufen: Gut erhaltene Fenster weiterverwenden schont Ressourcen und schützt die Umwelt. Zur Selbstabholung vor Ort. <strong>Bitte Helfer und Transporter mitbringen. Öffnungszeiten beachten.</strong>'
  },
  vermessen: {
    label: 'Falsch vermessen · Bis zu 50 % unter Neupreis · Brandenburg',
    title: 'Falsch vermessen — Ihr Gewinn. Neuware zum halben Preis.',
    desc: 'Maßgefertigte <strong>Neuware</strong> — unbenutzt, einwandfreie Qualität — die durch einen Aufmaßfehler nicht gepasst hat. Für Sie bedeutet das: <strong>ein fabrikneues Fenster für ca. 50 % unter Neupreis.</strong> Kein Kompromiss bei Qualität. Zur Selbstabholung vor Ort in Brandenburg an der Havel. <strong>Bitte Helfer und Transporter mitbringen. Öffnungszeiten beachten.</strong>'
  }
};

function aktualisiereShopHeader() {
  const zustand = STATE.filter.zustand.size ? [...STATE.filter.zustand][0] : 'default';
  const h = SHOP_HEADERS[zustand] || SHOP_HEADERS.default;
  const label = document.getElementById('shopHeaderLabel');
  const title = document.getElementById('shopHeaderTitle');
  const desc  = document.getElementById('shopHeaderDesc');
  if (label) label.textContent = h.label;
  if (title) title.textContent = h.title;
  if (desc)  desc.innerHTML = h.desc;
  const hinweis = document.getElementById('gebrauchtHinweis');
  if (hinweis) hinweis.classList.remove('hidden');
}

/* ─── Render-Pipeline ─── */
function rendere() {
  const result = gefilterteProdukte();
  document.getElementById('produktAnzahl').textContent = result.length;
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
        ? { name: 'ISO-Verbunddämmung', detail: 'Rollenformat 4450 × 1400 mm (6,24 m² pro Rolle) · Polen-Import · neu · Preis pro Rolle' }
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
}

function karteHtml(p) {
  const istNeu = (p.zustand || 'neu') === 'neu';
  // Bei neuen Drutex-Produkten: keinen Knappheits-Badge — Drutex liefert nach, "Nur 1 verfuegbar" verunsichert nur.
  const lagerBadge = istNeu
    ? ''
    : (p.lagerbestand <= 1
        ? `<span class="pill is-warning">Nur ${p.lagerbestand} verfügbar</span>`
        : `<span class="pill is-success">${p.lagerbestand} auf Lager</span>`);
  const rcBadge = p.rc_klasse ? `<span class="pill is-gold">${p.rc_klasse}</span>` : '';
  // Verglasungs-Badge nur bei Produkten mit Glas (Fenster/Balkontür/Haustür/Schiebetür) — NICHT bei Dämmung/Baumaterialien/Garagentor
  const NO_GLAS_KATS = new Set(['daemmung','baumaterialien','garagentor-gebraucht']);
  const verglasungBadge = (p.verglasung && !NO_GLAS_KATS.has(p.kategorie_key))
    ? `<span class="pill is-primary">${p.verglasung}-Verglasung</span>` : '';
  const zustandBadge = p.zustand === 'gebraucht' ? `<span class="pill is-warning">Gebraucht</span>` : '';
  const sonderpreisBadge = p.sonderpreis_eur ? `<span class="pill is-warning">Sonderpreis *</span>` : '';
  const exportBadge = p.export_modell ? `<span class="pill is-primary">Export *</span>` : '';
  const groesseBadge = p.groesse_klasse ? `<span class="pill">${groesseLabel(p.groesse_klasse)}</span>` : '';
  const standBadge = p.standnummer ? `<span class="pill" style="background:#e8f0fe;color:#225eaa;border-color:rgba(34,94,170,0.30);font-weight:800">📍 Stand ${escapeHtml(p.standnummer)}</span>` : '';
  const istMarkiert = !!p.sonderpreis_eur || !!p.export_modell;
  const preisStern = istMarkiert ? '*' : '';

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

  return `
    <article class="karte" data-action="detail" data-id="${p.id}" style="${archivStyle}">
      <div class="karte-bild-wrap" style="position:relative">
        <img src="${escapeHtml(p.bild)}" alt="${escapeHtml(p.titel)}" class="karte-bild w-full" loading="lazy" decoding="async" onerror="this.src='img/fenster_standard.png'"/>
        <span class="symbolbild-mini">Symbolbild</span>
        ${archivBadge}
        ${druckIcon}
        ${aktionMenu}
      </div>
      <div class="p-4 flex flex-col flex-1">
        <div class="flex flex-wrap gap-1.5 mb-2">${standBadge}${zustandBadge}${sonderpreisBadge}${exportBadge}${groesseBadge}${verglasungBadge}${rcBadge}${lagerBadge}</div>
        <h3 class="text-sm font-bold leading-snug line-clamp-2 mb-1 text-ink">${escapeHtml(p.titel)}</h3>
        <p class="text-[11px] text-ink-soft mb-1">${escapeHtml(p.system)} · ${p.breite_mm} × ${p.hoehe_mm} mm</p>
        <p class="text-[11px] text-ink-soft mb-3 line-clamp-2">${nl2br(p.beschreibung)}</p>
        <div class="mt-auto flex items-end justify-between gap-2">
          <div>
            ${p.sonderpreis_eur ? '<span class="text-[10px] text-ink-soft block">Sonderpreis</span>' : (p.export_modell ? '<span class="text-[10px] text-ink-soft block">Export</span>' : (p.zustand === 'gebraucht' ? '' : '<span class="text-[10px] text-ink-soft block">ab</span>'))}
            <span class="text-xl font-extrabold text-primary leading-none">${formatPreis(p.preis_eur)}<span class="text-sm">${preisStern}</span></span>
          </div>
          <button data-action="detail" data-id="${p.id}" class="bg-primary/10 text-primary px-3 py-2 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
            <span class="hidden sm:inline">Details</span>
          </button>
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
      <div class="flex flex-wrap gap-1.5">
        ${(p.verglasung && !['daemmung','baumaterialien','garagentor-gebraucht'].includes(p.kategorie_key)) ? `<span class="pill is-primary">${p.verglasung}-Verglasung</span>` : ''}
        ${p.rc_klasse ? `<span class="pill is-gold">${p.rc_klasse}</span>` : ''}
        ${(p.zustand || 'neu') === 'neu'
          ? ''
          : (p.lagerbestand <= 1
              ? `<span class="pill is-warning">Nur ${p.lagerbestand} verfügbar</span>`
              : `<span class="pill is-success">${p.lagerbestand} auf Lager</span>`)}
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Breite</span><span class="font-bold text-ink">${p.breite_mm} mm</span></div>
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Höhe</span><span class="font-bold text-ink">${p.hoehe_mm} mm</span></div>
        ${standnrInfo}
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">System</span><span class="font-bold text-ink">${p.system ? escapeHtml(p.system) : '—'}</span></div>
        ${p.oeffnungsart ? `<div class="bg-bg-soft rounded-lg px-3 py-2 col-span-2"><span class="block text-[10px] text-ink-soft">Öffnungsart</span><span class="font-bold text-ink">${escapeHtml(oeffnungsartLabel(p.oeffnungsart))}</span></div>` : ''}
      </div>
      <p class="text-sm text-ink-soft leading-relaxed">${nl2br(p.beschreibung)}</p>
      <div>
        <h4 class="text-sm font-bold mb-2 text-ink">Eigenschaften</h4>
        <ul class="text-xs space-y-1 text-ink">${eigList || '<li class="text-ink-soft">Keine besonderen Eigenschaften eingetragen</li>'}</ul>
      </div>
      <div class="pt-4 border-t border-border-soft flex items-end justify-between gap-3">
        <div>
          <span class="block text-[11px] text-ink-soft">Preis ab Lager</span>
          <span class="text-3xl font-extrabold text-primary">${formatPreis(p.preis_eur)}</span>
        </div>
        <button id="detailAddBtn" class="bg-primary text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-primary-d transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined" style="font-size:18px">send</span>
          Anfrage senden
        </button>
      </div>
    </div>`;
  detail.querySelector('#detailAddBtn').addEventListener('click', () => {
    schliesseDetail();
    oeffneAnfrageModal(p);
  });
  // Bilder-Carousel-Setup (nur wenn mehrere Bilder)
  if (hatMehrere) setupCarousel(bilderListe.length);
  document.getElementById('detailModal').classList.add('open');
  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
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
    `Zustand: ${p.zustand === 'gebraucht' ? 'Gebraucht' : 'Neu'}`,
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
      'itemCondition': p.zustand === 'gebraucht' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
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
    'golden-oak': 'Golden Oak',
    'nussbaum': 'Nussbaum',
    'schwarz': 'Schwarz',
    'dunkelgruen': 'Dunkelgrün'
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
    'sprossen-aufgesetzt': 'Mit Sprossen',
    'holzdekor': 'Holzdekor',
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
  return map[code] || code;
}
