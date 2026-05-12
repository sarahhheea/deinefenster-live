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
  loggedIn: false,         // wahr wenn Sarah/Mitarbeiter eingeloggt — zeigt Druck-Icons
  filter: {
    zustand: new Set(),
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

/* ─── URL-Parameter Filter (z.B. shop.html?zustand=gebraucht) ─── */
function applyUrlFilter() {
  const params = new URLSearchParams(window.location.search);
  const zustand = params.get('zustand');
  if (zustand === 'gebraucht' || zustand === 'neu') {
    STATE.filter.zustand.add(zustand);
    // Checkbox visuell anpassen
    const cb = document.querySelector(`.filter-zustand[value="${zustand}"]`);
    if (cb) cb.checked = true;
    // Scroll sanft zur Produktliste
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

/* ─── Daten laden (aus Google Sheets) ─── */
async function loadProdukte() {
  try {
    const data = await sheetsGet('produkte');

    STATE.kategorien = data.kategorien || {};
    STATE.kategorienListe = Object.entries(data.kategorien || {})
      .map(([key, label]) => ({ key, label }));

    const sheetsProdukte = (data.produkte || []).map(p => ({
      id: String(p.id),
      titel: p.titel || '',
      kategorie: p.kategorie || p.kategorie_key || '',
      system: p.system || '',
      zustand: p.zustand || 'neu',
      breite_mm: Number(p.breite_mm) || 0,
      hoehe_mm: Number(p.hoehe_mm) || 0,
      preis_eur: Number(p.preis_eur) || 0,
      sonderpreis_eur: p.sonderpreis_eur ? Number(p.sonderpreis_eur) : null,
      groesse_klasse: p.groesse_klasse || null,
      export_modell: !!p.export_modell,
      standnummer: p.standnummer || null,
      farbe: p.farbe || 'weiss',
      verglasung: p.verglasung || '2-fach',
      u_wert: p.u_wert || null,
      oeffnungsart: p.oeffnungsart || 'dreh-kipp',
      rc_klasse: p.rc_klasse || null,
      eigenschaften: Array.isArray(p.eigenschaften) ? p.eigenschaften : [],
      lagerbestand: Number(p.lagerbestand) || 1,
      bild: (Array.isArray(p.bilder) && p.bilder[0]) || 'img/fenster_standard.png',
      bilder: Array.isArray(p.bilder) ? p.bilder : [],
      beschreibung: p.beschreibung || ''
    }));

    // Wenn Sheets leer → JSON-Fallback damit der Shop nie blank ist
    if (sheetsProdukte.length === 0) {
      return loadProdukteFromJson();
    }

    STATE.produkte = sheetsProdukte;
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
    STATE.produkte = data.produkte || [];
    STATE.metadaten = data.filter_metadaten || berechneMetadaten(STATE.produkte);
    STATE.kategorien = data.kategorien || {};
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
  // Kategorien
  const katWrap = document.getElementById('filterKategorien');
  katWrap.innerHTML = Object.entries(STATE.kategorien).map(([key, label]) => {
    const count = STATE.produkte.filter(p => p.kategorie === key).length;
    return `
      <label class="filter-option">
        <span class="flex items-center gap-2"><input type="checkbox" class="check filter-kategorie" value="${key}"/><span>${escapeHtml(label)}</span></span>
        ${count > 0 ? `<span class="count">${count}</span>` : ''}
      </label>`;
  }).join('');

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

  // Warenkorb
  document.getElementById('cartBtnNav').addEventListener('click', oeffneCart);
  document.getElementById('cartCloseBtn').addEventListener('click', schliesseCart);
  document.getElementById('cartOverlay').addEventListener('click', schliesseCart);
  document.getElementById('cartLeerenBtn').addEventListener('click', leereCart);
  document.getElementById('cartAnfrageBtn').addEventListener('click', stelleCartAnfrage);
  document.getElementById('cartWhatsappBtn').addEventListener('click', e => {
    e.preventDefault();
    stelleCartAnfrageWhatsApp();
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
    // Kategorie
    if (f.kategorien.size && !f.kategorien.has(p.kategorie)) return false;
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
  if (hinweis) hinweis.classList.toggle('hidden', zustand !== 'gebraucht' && zustand !== 'vermessen' && zustand !== 'default');
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
    emptyEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  gridEl.classList.remove('hidden');

  // Karten rendern
  gridEl.innerHTML = result.map(p => karteHtml(p)).join('');

  // Click-Handler für Karten (Event-Delegation würde reichen, aber für Klarheit hier)
  gridEl.querySelectorAll('[data-action="cart-add"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });
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
  const lagerBadge = p.lagerbestand <= 1
    ? `<span class="pill is-warning">Nur ${p.lagerbestand} verfügbar</span>`
    : `<span class="pill is-success">${p.lagerbestand} auf Lager</span>`;
  const rcBadge = p.rc_klasse ? `<span class="pill is-gold">${p.rc_klasse}</span>` : '';
  const verglasungBadge = `<span class="pill is-primary">${p.verglasung}-Verglasung</span>`;
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

  return `
    <article class="karte" data-action="detail" data-id="${p.id}">
      <div class="karte-bild-wrap">
        <img src="${escapeHtml(p.bild)}" alt="${escapeHtml(p.titel)}" class="karte-bild w-full" loading="lazy" onerror="this.src='img/fenster_standard.png'"/>
        <span class="symbolbild-mini">Symbolbild</span>
        ${druckIcon}
        ${aktionMenu}
      </div>
      <div class="p-4 flex flex-col flex-1">
        <div class="flex flex-wrap gap-1.5 mb-2">${standBadge}${zustandBadge}${sonderpreisBadge}${exportBadge}${groesseBadge}${verglasungBadge}${rcBadge}${lagerBadge}</div>
        <h3 class="text-sm font-bold leading-snug line-clamp-2 mb-1 text-ink">${escapeHtml(p.titel)}</h3>
        <p class="text-[11px] text-ink-soft mb-1">${escapeHtml(p.system)} · ${p.breite_mm} × ${p.hoehe_mm} mm</p>
        <p class="text-[11px] text-ink-soft mb-3 line-clamp-2">${escapeHtml(p.beschreibung)}</p>
        <div class="mt-auto flex items-end justify-between gap-2">
          <div>
            <span class="text-[10px] text-ink-soft block">${p.sonderpreis_eur ? 'Sonderpreis' : (p.export_modell ? 'Export' : 'ab')}</span>
            <span class="text-xl font-extrabold text-primary leading-none">${formatPreis(p.preis_eur)}<span class="text-sm">${preisStern}</span></span>
          </div>
          <button data-action="cart-add" data-id="${p.id}" class="bg-primary text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-primary-d transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined" style="font-size:14px">add_shopping_cart</span>
            <span class="hidden sm:inline">Hinzufügen</span>
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
    <button data-do="archive" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:transparent;border:none;cursor:pointer;color:#1d1d1f;font-size:13px;font-weight:600;text-align:left" onmouseover="this.style.background='#f5f5f7'" onmouseout="this.style.background=''">
      <span class="material-symbols-outlined" style="font-size:18px;color:#b87f00">archive</span>
      Archivieren
    </button>
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
    else if (action === 'delete') loescheProdukt(id);
  });
}

async function archiviereProdukt(id) {
  if (!confirm('Inserat archivieren? Es verschwindet aus dem Shop (kann im Google Sheet wiederhergestellt werden: Spalte aktiv = TRUE).')) return;
  const res = await sheetsPost({ action: 'archive', id });
  if (res.error) { alert('Fehler beim Archivieren: ' + res.error); return; }
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
  if (total > 0) {
    badgeNav.textContent = total;
    badgeNav.classList.remove('hidden');
  } else {
    badgeNav.classList.add('hidden');
  }
  document.getElementById('cartTitleCount').textContent = total ? `(${total})` : '';

  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmptyState');
  const footerEl = document.getElementById('cartFooter');
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
        <span class="pill is-primary">${p.verglasung}-Verglasung</span>
        ${p.rc_klasse ? `<span class="pill is-gold">${p.rc_klasse}</span>` : ''}
        ${p.lagerbestand <= 1
          ? `<span class="pill is-warning">Nur ${p.lagerbestand} verfügbar</span>`
          : `<span class="pill is-success">${p.lagerbestand} auf Lager</span>`}
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Breite</span><span class="font-bold text-ink">${p.breite_mm} mm</span></div>
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">Höhe</span><span class="font-bold text-ink">${p.hoehe_mm} mm</span></div>
        ${standnrInfo}
        <div class="bg-bg-soft rounded-lg px-3 py-2"><span class="block text-[10px] text-ink-soft">System</span><span class="font-bold text-ink">${p.system ? escapeHtml(p.system) : '—'}</span></div>
        ${p.oeffnungsart ? `<div class="bg-bg-soft rounded-lg px-3 py-2 col-span-2"><span class="block text-[10px] text-ink-soft">Öffnungsart</span><span class="font-bold text-ink">${escapeHtml(oeffnungsartLabel(p.oeffnungsart))}</span></div>` : ''}
      </div>
      <p class="text-sm text-ink-soft leading-relaxed">${escapeHtml(p.beschreibung)}</p>
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
          <span class="material-symbols-outlined" style="font-size:18px">add_shopping_cart</span>
          In den Warenkorb
        </button>
      </div>
    </div>`;
  detail.querySelector('#detailAddBtn').addEventListener('click', () => {
    addToCart(id);
    schliesseDetail();
    oeffneCart();
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

/* Öffnungsart-Anzeige mit Griff-Hinweis (Sarah-Wunsch 28.04.2026)
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
    'sprossen-aufgesetzt': 'Mit Sprossen',
    'holzdekor': 'Holzdekor',
    'passivhaus-tauglich': 'Passivhaus-tauglich',
    '2-fach-verglasung': '2-fach-Verglasung',
    '3-fach-verglasung': '3-fach-Verglasung',
    'rc2': 'RC2-Sicherheit',
    'rc3': 'RC3-Sicherheit'
  };
  return map[code] || code;
}
