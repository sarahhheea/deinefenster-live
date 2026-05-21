/* ─────────────────────────────────────────────────────────────────────
   shop-einstellen.js — Inserat-Formular für Lager-Shop
   Kleinanzeigen-Workflow: Kategorie → Detail-Formular → Veröffentlichen
   Stand: 27.04.2026
   ───────────────────────────────────────────────────────────────────── */

const KATEGORIEN = [
  { key: 'fenster-1fluegel',           label: 'Einflügelig',                      icon: 'window' },
  { key: 'fenster-1fluegel-rollo',     label: 'Einflügelig mit Rollo',            icon: 'roller_shades' },
  { key: 'fenster-2fluegel',           label: 'Zweiflügelig',                     icon: 'border_outer' },
  { key: 'fenster-2fluegel-rollo',     label: 'Zweiflügelig mit Rollo',           icon: 'roller_shades' },
  { key: 'fenster-3fluegel',           label: 'Dreiflügelig',                     icon: 'view_column' },
  { key: 'fenster-3fluegel-rollo',     label: 'Dreiflügelig mit Rollo',           icon: 'roller_shades' },
  { key: 'fenster-4fluegel',           label: 'Vierflügelig',                     icon: 'grid_view' },
  { key: 'festelement',                label: 'Festverglasung',                   icon: 'crop_free' },
  { key: 'kellerfenster',              label: 'Kellerfenster',                    icon: 'crop_landscape' },
  { key: 'rundfenster',                label: 'Rundes Fenster',                   icon: 'circle' },
  { key: 'rundbogenfenster',           label: 'Rundbogenfenster',                 icon: 'arch' },
  { key: 'stichbogenfenster',          label: 'Stichbogenfenster',                icon: 'arch' },
  { key: 'haustuer',                   label: 'Haustür',                          icon: 'door_front' },
  { key: 'balkontuer-1fluegel',        label: 'Balkontür einflüglig',             icon: 'deck' },
  { key: 'balkontuer-1fluegel-rollo',  label: 'Balkontür einflüglig mit Rollo',   icon: 'roller_shades' },
  { key: 'balkontuer-2fluegel',        label: 'Balkontür zweiflüglig',            icon: 'fence' },
  { key: 'balkontuer-2fluegel-rollo',  label: 'Balkontür zweiflüglig mit Rollo',  icon: 'roller_shades' },
  { key: 'schiebetuer-psk',            label: 'Schiebetür PSK',                   icon: 'meeting_room' },
  { key: 'schiebetuer-hst',            label: 'Hebe-Schiebetür',                  icon: 'door_sliding' },
  { key: 'schiebetuer-rollo',          label: 'Schiebetür mit Rollo',             icon: 'roller_shades' },
  { key: 'fenster-oberlicht',          label: 'Fenster mit Oberlicht',            icon: 'space_dashboard' },
  { key: 'fenster-unterlicht',         label: 'Fenster mit Unterlicht',           icon: 'vertical_split' },
  { key: 'fenster-sprossen',           label: 'Fenster mit Sprossen',             icon: 'window_open' },
  { key: 'dachfenster',                label: 'Dachfenster',                      icon: 'skylight' },
  { key: 'garagentor',                 label: 'Garagentor',                       icon: 'garage' },
  { key: 'daemmung',                   label: 'Dämmung',                          icon: 'layers' },
  { key: 'baumaterialien',             label: 'Baumaterialien',                   icon: 'construction' }
];

// interner Hinweis.04.2026 v2: Gruppierte Eigenschaften für übersichtlichere Auswahl
const EIGENSCHAFTEN_GRUPPEN = [
  {
    titel: 'Zustand',
    icon: 'inventory_2',
    items: [
      { key: 'einzelstueck',          label: 'Einzelstück' },
      { key: 'vermessen',             label: 'Vermessen (konkrete Maße)' }
    ]
  },
  {
    titel: 'Farbe',
    icon: 'palette',
    items: [
      { key: 'farbe-weiss',           label: 'Weiß' },
      { key: 'farbe-anthrazit',       label: 'Anthrazit' },
      { key: 'farbe-grau',            label: 'Grau' },
      { key: 'farbe-farbig',          label: 'Farbig (sonstige)' },
      { key: 'holzdekor',             label: 'Holzdekor' }
    ]
  },
  {
    titel: 'Aufteilung / Glas',
    icon: 'grid_view',
    items: [
      { key: 'oberlicht',             label: 'Mit Oberlicht' },
      { key: 'unterlicht',            label: 'Mit Unterlicht' },
      { key: 'ober-unter-licht',      label: 'Mit Ober- und Unterlicht' },
      { key: 'kaempfer',              label: 'Mit Kämpfer' },
      { key: 'festverglasung',        label: 'Festverglasung' },
      { key: 'sprossen-aufgesetzt',   label: 'Aufgesetzte Sprossen' },
      { key: 'sprossen-innen',        label: 'Innenliegende Sprossen (SZR)' }
    ]
  },
  {
    titel: 'Öffnungsart',
    icon: 'open_in_full',
    items: [
      { key: 'dreh-kipp',             label: 'Dreh-Kipp' },
      { key: 'stulp',                 label: 'Stulpprofil (ohne Pfosten)' },
      { key: 'pfosten',               label: 'Mittelpfosten' },
      { key: 'parallel-schiebe-kipp', label: 'Parallel-Schiebe-Kipp' },
      { key: 'hebe-schiebe',          label: 'Hebe-Schiebe' }
    ]
  },
  {
    titel: 'Schwelle / Türen',
    icon: 'door_sliding',
    items: [
      { key: 'alu-schwelle',          label: 'Alu-Schwelle' },
      { key: 'null-schwelle',         label: 'Null-Schwelle' },
      { key: 'barrierefrei',          label: 'Barrierefrei' }
    ]
  },
  {
    titel: 'Rollladen',
    icon: 'roller_shades',
    items: [
      { key: 'rollladen-gurtwickler', label: 'Mit Gurtwickler' },
      { key: 'rollladen-motor',       label: 'Mit Motor (elektrisch)' }
    ]
  },
  {
    titel: 'Sicherheit / Komfort',
    icon: 'shield',
    items: [
      { key: '5-fach-verriegelung',   label: '5-fach-Verriegelung' },
      { key: 'edelstahl-stossgriff',  label: 'Edelstahl-Stoßgriff' },
      { key: 'beidseitig-abschliessbar', label: 'Beidseitig abschließbar' }
    ]
  },
  {
    titel: 'Maße / Energie',
    icon: 'eco',
    items: [
      { key: 'kompaktmass',           label: 'Kompaktmaß' },
      { key: 'passivhaus-tauglich',   label: 'Passivhaus-tauglich' }
    ]
  }
];

// Flache Liste für Rückwärtskompatibilität (Lade-/Speicher-Logik)
const EIGENSCHAFTEN = EIGENSCHAFTEN_GRUPPEN.flatMap(g => g.items);

const FARBE_LABEL = {
  'weiss': 'Weiß', 'anthrazit': 'Anthrazit', 'golden-oak': 'Golden Oak',
  'nussbaum': 'Nussbaum', 'schwarz': 'Schwarz', 'dunkelgruen': 'Dunkelgrün'
};

const STATE = {
  typ: null,        // 'vermessen' oder 'sonderposten'
  zustand: 'neu',  // 'neu' | 'gebraucht' | 'vermessen' | 'sonderposten'
  material: 'kunststoff', // 'kunststoff' | 'holz' | 'aluminium' — gilt für neu UND gebraucht
  glasart: 'klarglas', // 'klarglas' | 'chinchilla' | 'milchglas' | 'sicherheitsglas' | 'schallschutzglas' — Shop-Filter
  kategorie: null,
  groesseKlasse: '',
  bilder: [],          // Array von DataURLs (neue Bilder, Base64 für Vorschau)
  bilderBestand: [],   // Array von Storage-URLs (bestehende Bilder beim Bearbeiten)
  draft: {},
  user: null,
  editMode: false,
  editId: null
};

// Welche Kategorien haben Größen-Klassen?
const KATEGORIEN_MIT_GROESSE = new Set([
  'fenster-1fluegel', 'fenster-2fluegel', 'fenster-3fluegel',
  'balkontuer-1fluegel', 'balkontuer-2fluegel', 'balkontuer-rollo',
  'festelement'
]);

const DRAFT_KEY = 'deinefenster_inserat_draft_v1';
let KATEGORIEN_LIVE = [...KATEGORIEN]; // wird aus DB überschrieben falls verfügbar

document.addEventListener('DOMContentLoaded', async () => {
  // Auth-Check via localStorage-Token
  if (!isShopLoggedIn()) {
    location.href = `shop-login.html?next=${encodeURIComponent('shop-einstellen.html')}`;
    return;
  }

  // User-Badge anzeigen
  const ub   = document.getElementById('userBadge');
  const ueml = document.getElementById('userEmail');
  const lb   = document.getElementById('logoutBtn');
  if (ueml) ueml.textContent = localStorage.getItem('df_shop_email') || 'eingeloggt';
  if (ub)   ub.classList.remove('hidden');
  if (lb) {
    lb.classList.remove('hidden');
    lb.addEventListener('click', () => {
      clearShopToken();
      location.href = 'shop-login.html';
    });
  }

  // Edit-Mode: ?edit=PRODUKT_ID
  const editParam = new URLSearchParams(location.search).get('edit');
  if (editParam) {
    STATE.editMode = true;
    STATE.editId   = editParam;
    try {
      const res = await sheetsGet('produkt', { id: editParam });
      if (res.produkt) await ladeProduktInsFormular(res.produkt);
    } catch(e) {
      console.warn('Produkt laden fehlgeschlagen:', e);
    }
  }

  rendereKategorien();
  rendereEigenschaften();
  bindeFormHandler();
  bindeZustandHandler();
  bindeMaterialHandler();
  bindeGlasartHandler();
  bindeGroesseHandler();
  if (!STATE.editMode) ladeDraft();
  setZustandUI();
  setMaterialUI();
  setGlasartUI();
  setGroesseUI();
  setEditModeUI();
  rendereVorschau();
});

/* ─── Edit-Mode: Produkt ins Formular laden ─── */
async function ladeProduktInsFormular(p) {
  STATE.zustand = p.zustand || 'neu';
  STATE.material = p.material || 'keine';
  STATE.glasart = p.glasart || 'keine';
  STATE.kategorie = p.kategorie_key;
  STATE.groesseKlasse = p.groesse_klasse || '';
  STATE.bilderBestand = Array.isArray(p.bilder) ? [...p.bilder] : [];
  STATE.bilder = [];

  // Felder befüllen — passiert im DOM nachdem rendereKategorien fertig ist
  setTimeout(() => {
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    setVal('formTitel', p.titel);
    setVal('formBreite', p.breite_mm);
    setVal('formHoehe', p.hoehe_mm);
    setVal('formPreis', p.preis_eur);
    setVal('formSonderpreis', p.sonderpreis_eur);
    setVal('formLager', p.lagerbestand);
    setVal('formStandnummer', p.standnummer);
    setVal('formSystem', p.system);
    setVal('formFarbe', p.farbe);
    setVal('formVerglasung', p.verglasung);
    setVal('formOeffnungsart', p.oeffnungsart);
    setVal('formBeschreibung', p.beschreibung);
    const exp = document.getElementById('formExport'); if (exp) exp.checked = !!p.export_modell;
    (p.eigenschaften || []).forEach(e => {
      const el = document.querySelector(`.eig-check[value="${e}"]`);
      if (el) el.checked = true;
    });
    // Kategorie vorauswählen
    const sel = document.querySelector(`.kat-karte[data-kat="${p.kategorie_key}"]`);
    if (sel) sel.classList.add('selected');
    document.getElementById('weiterZuStep2').disabled = false;
    // Direkt zu Schritt 2 springen
    goToStep2();
    rendereBildVorschau();
    setZustandUI();
    setGroesseUI();
    rendereVorschau();
  }, 80);
}

function setEditModeUI() {
  if (!STATE.editMode) return;
  const btn = document.getElementById('veroeffentlichenBtn');
  if (btn) btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">save</span> Änderungen speichern';
  // Kategorie-Wechsel bleibt im Edit-Mode aktiv (Inhaberin: Kategorie nachträglich korrigierbar)
}

/* ─── Größen-Klasse ─── */
function bindeGroesseHandler() {
  document.querySelectorAll('.groesse-btn').forEach(b => {
    b.addEventListener('click', () => {
      STATE.groesseKlasse = b.dataset.groesse;
      // Manuelle Wahl: Hinweis ausblenden (User hat entschieden)
      STATE.groesseHinweis = [];
      setGroesseUI();
      saveDraft();
      rendereVorschau();
    });
  });
}

function setGroesseUI() {
  const wrap = document.getElementById('groesseKlasseWrap');
  if (!wrap) return;
  // Nur sichtbar bei den passenden Kategorien
  const sichtbar = STATE.kategorie && KATEGORIEN_MIT_GROESSE.has(STATE.kategorie);
  wrap.classList.toggle('hidden', !sichtbar);
  // Buttons markieren
  document.querySelectorAll('.groesse-btn').forEach(b => {
    const aktiv = b.dataset.groesse === STATE.groesseKlasse;
    b.classList.toggle('bg-primary', aktiv);
    b.classList.toggle('text-white', aktiv);
    b.classList.toggle('border-primary', aktiv);
    b.classList.toggle('bg-surface-container-low', !aktiv);
  });
  // Hinweis-Text bei Mehrfach-Treffer (oder leerer wenn nicht relevant)
  const hint = document.getElementById('groesseHinweis');
  if (hint) {
    if (STATE.groesseHinweis && STATE.groesseHinweis.length > 1) {
      const labels = STATE.groesseHinweis.map(c => groesseLabelDE(c)).join(' und ');
      hint.textContent = `Hinweis: Bei diesen Maßen treffen mehrere Klassen zu (${labels}). Bitte wähl selbst aus.`;
      hint.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
      hint.textContent = '';
    }
  }
}

function groesseLabelDE(code) {
  return ({ klein: 'Klein', schmal: 'Schmal', normal: 'Normal', hoch: 'Hoch', gross: 'Groß' })[code] || code;
}

/* ─── Auto-Vorauswahl Größen-Klasse basierend auf Breite × Höhe + Kategorie ─── */
// interner Hinweis.04.2026:
//  1-Flügelig:      Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 1000 → schmal
//  2-Flügelig:      Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 1600 → schmal
//  3-Flügelig:      Höhe < 1350 → klein, ≥ 1350 → groß | Breite ≤ 2000 → schmal
//  Balkontür:       Höhe < 2100 → klein, ≥ 2100 → groß | Breite ≤ 1000 → schmal
//  Wenn mehrere Klassen gleichzeitig zutreffen → keine Vorauswahl, Hinweis-Text
//  Festelement / balkontuer-rollo → keine Auto-Voraus (Inhaberin-Anweisung)
function autoVorauswahlGroesse() {
  STATE.groesseHinweis = [];
  if (!STATE.kategorie) { setGroesseUI(); return; }
  if (!KATEGORIEN_MIT_GROESSE.has(STATE.kategorie)) { setGroesseUI(); return; }

  // Auto-Voraus nur bei diesen Kategorien
  const AUTO_KATS = new Set([
    'fenster-1fluegel', 'fenster-2fluegel', 'fenster-3fluegel',
    'balkontuer-1fluegel', 'balkontuer-2fluegel'
  ]);
  if (!AUTO_KATS.has(STATE.kategorie)) { setGroesseUI(); return; }

  const breite = parseInt(document.getElementById('formBreite')?.value, 10);
  const hoehe = parseInt(document.getElementById('formHoehe')?.value, 10);
  if (!breite || !hoehe) { setGroesseUI(); return; }

  const isBalkon = STATE.kategorie.startsWith('balkontuer');
  const hoeheLimit = isBalkon ? 2100 : 1350;

  let breiteLimit = null;
  if (STATE.kategorie === 'fenster-1fluegel' || isBalkon) breiteLimit = 1000;
  else if (STATE.kategorie === 'fenster-2fluegel') breiteLimit = 1600;
  else if (STATE.kategorie === 'fenster-3fluegel') breiteLimit = 2000;

  const treffen = [];
  if (hoehe < hoeheLimit) treffen.push('klein');
  else treffen.push('gross');
  if (breiteLimit && breite <= breiteLimit) treffen.push('schmal');

  if (treffen.length === 1) {
    // Einzige passende Klasse → setzen
    STATE.groesseKlasse = treffen[0];
    STATE.groesseHinweis = [];
  } else if (treffen.length > 1) {
    // Mehrfach-Treffer → Wahl löschen + Hinweis zeigen, User entscheidet
    STATE.groesseKlasse = '';
    STATE.groesseHinweis = treffen;
  }
  setGroesseUI();
  saveDraft();
  rendereVorschau();
}

/* ─── Zustand-Auswahl (Neu / Gebraucht / Vermessen / Sonderposten) ─── */
const ZUSTAND_BTN_IDS = ['zustandNeu', 'zustandGebraucht', 'zustandVermessen', 'zustandSonderposten'];
function bindeZustandHandler() {
  ZUSTAND_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      STATE.zustand = el.dataset.zustand;
      setZustandUI();
      saveDraft();
      rendereVorschau();
    });
  });
}

function setZustandUI() {
  ZUSTAND_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('selected', el.dataset.zustand === STATE.zustand);
  });
  // Drutex-System nur bei "neu" anzeigen
  const sysWrap = document.getElementById('formSystemWrap');
  if (sysWrap) {
    sysWrap.style.display = STATE.zustand === 'neu' ? '' : 'none';
  }
}

/* ─── Material-Auswahl (Kunststoff / Holz / Aluminium) ─── */
const MATERIAL_BTN_IDS = ['materialKunststoff', 'materialHolz', 'materialAluminium', 'materialKeine'];
function bindeMaterialHandler() {
  MATERIAL_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      STATE.material = el.dataset.material;
      setMaterialUI();
      saveDraft();
      rendereVorschau();
    });
  });
}

function setMaterialUI() {
  MATERIAL_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('selected', el.dataset.material === STATE.material);
  });
}

/* ─── Glasart-Auswahl (Klarglas / Chinchilla / Milchglas / Sicherheitsglas / Schallschutzglas) ─── */
const GLASART_BTN_IDS = ['glasartKlarglas', 'glasartChinchilla', 'glasartMilchglas', 'glasartSicherheitsglas', 'glasartSchallschutzglas', 'glasartKeine'];

function bindeGlasartHandler() {
  GLASART_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      STATE.glasart = el.dataset.glasart;
      setGlasartUI();
      saveDraft();
      rendereVorschau();
    });
  });
}

function setGlasartUI() {
  GLASART_BTN_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('selected', el.dataset.glasart === STATE.glasart);
  });
}

/* ─── Schritt 1: Kategorie-Auswahl ─── */
function rendereKategorien() {
  const grid = document.getElementById('kategorieGrid');
  grid.innerHTML = KATEGORIEN_LIVE.map(k => `
    <button type="button" class="kat-karte" data-kat="${k.key}">
      <div class="icon-wrap">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">${k.icon}</span>
      </div>
      <h3 class="text-sm font-bold leading-tight">${escapeHtml(k.label)}</h3>
    </button>
  `).join('');

  grid.querySelectorAll('.kat-karte').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.kat-karte').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      STATE.kategorie = btn.dataset.kat;
      document.getElementById('weiterZuStep2').disabled = false;
      saveDraft();
      setGroesseUI();
      autoVorauswahlGroesse();
    });
  });

  // Falls Draft hatte: vorauswählen
  if (STATE.kategorie) {
    const sel = grid.querySelector(`.kat-karte[data-kat="${STATE.kategorie}"]`);
    if (sel) sel.classList.add('selected');
    document.getElementById('weiterZuStep2').disabled = false;
  }
}

function rendereEigenschaften() {
  const wrap = document.getElementById('eigenschaftenWrap');
  // Inhaberin-Refactor 30.04.2026 v2: Gruppen-Header für übersichtliche Auswahl
  wrap.innerHTML = EIGENSCHAFTEN_GRUPPEN.map(g => `
    <div class="eig-gruppe" style="margin-bottom:18px">
      <div class="flex items-center gap-1.5 mb-2 pb-1.5 border-b" style="border-color:rgba(0,0,0,0.08)">
        <span class="material-symbols-outlined" style="font-size:16px;color:#225eaa">${g.icon || 'tune'}</span>
        <span class="text-[12px] font-bold uppercase tracking-wider" style="color:#225eaa;letter-spacing:0.05em">${g.titel}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        ${g.items.map(e => `
          <label class="flex items-center gap-2 cursor-pointer hover:text-primary text-sm">
            <input type="checkbox" class="filter-check eig-check" value="${e.key}"/>
            <span>${e.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
  wrap.addEventListener('change', () => { rendereVorschau(); saveDraft(); });
}

/* ─── Navigation Schritt 1 ↔ 2 ─── */
function bindeFormHandler() {
  document.getElementById('weiterZuStep2').addEventListener('click', goToStep2);
  document.getElementById('zurueckZuStep1').addEventListener('click', goToStep1);
  document.getElementById('kategorieWechseln').addEventListener('click', goToStep1);

  // Live-Vorschau bei jedem Input
  ['formTitel','formBreite','formHoehe','formPreis','formLager','formSystem','formFarbe','formVerglasung','formBeschreibung','formStandnummer','formOeffnungsart'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => { rendereVorschau(); saveDraft(); });
    el.addEventListener('change', () => { rendereVorschau(); saveDraft(); });
  });

  // Auto-Vorauswahl Größen-Klasse triggern bei Maß-Änderung
  ['formBreite','formHoehe'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', autoVorauswahlGroesse);
    el.addEventListener('change', autoVorauswahlGroesse);
  });

  // Maß-Auto-Erkennung im Titel
  document.getElementById('formTitel').addEventListener('input', e => {
    const re = /(\d{3,4})\s*[x×*]\s*(\d{3,4})/i;
    const match = e.target.value.match(re);
    const hint = document.getElementById('autoErkanntHinweis');
    if (match) {
      const breite = parseInt(match[1], 10);
      const hoehe = parseInt(match[2], 10);
      // Nur ausfüllen wenn Maß-Felder leer sind (nicht überschreiben falls Inhaberin eigene Werte eingegeben hat)
      const breiteEl = document.getElementById('formBreite');
      const hoeheEl = document.getElementById('formHoehe');
      if (!breiteEl.value) breiteEl.value = breite;
      if (!hoeheEl.value) hoeheEl.value = hoehe;
      document.getElementById('autoMaseAnzeige').textContent = `${breite} × ${hoehe} mm`;
      hint.classList.remove('hidden');
      rendereVorschau();
    } else {
      hint.classList.add('hidden');
    }
  });

  // Foto-Buttons (Mobile-First Schnell-Modus)
  const camInput = document.getElementById('bildInputCam');
  const galInput = document.getElementById('bildInput');
  const camBtn = document.getElementById('fotoMachenBtn');
  const galBtn = document.getElementById('fotoGalerieBtn');
  if (camBtn) camBtn.addEventListener('click', () => camInput.click());
  if (galBtn) galBtn.addEventListener('click', () => galInput.click());
  if (camInput) camInput.addEventListener('change', e => {
    if (!e.target.files.length) return;
    const vorher    = STATE.bilderBestand.length + STATE.bilder.length;
    const neuAnzahl = e.target.files.length; // vor Reset merken
    handleFiles(e.target.files);
    e.target.value = ''; // Reset damit dasselbe Foto nochmal ladbar ist
    // Kamera automatisch wieder öffnen → mehrere Fotos hintereinander schießen
    // Stoppt wenn Nutzer in der Kamera-App auf "Abbrechen" drückt (kein change-Event)
    if (vorher + neuAnzahl < 20) {
      setTimeout(() => camInput.click(), 350);
    }
  });
  if (galInput) galInput.addEventListener('change', e => {
    handleFiles(e.target.files);
    e.target.value = '';
  });

  // Drop-Zone (Desktop Drag&Drop)
  const drop = document.getElementById('dropZone');
  if (drop) {
    drop.addEventListener('click', () => galInput.click());
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', e => {
      e.preventDefault();
      drop.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
  }

  // Veröffentlichen
  document.getElementById('veroeffentlichenBtn').addEventListener('click', veroeffentlichen);
  document.getElementById('vorschauBtn').addEventListener('click', () => {
    rendereVorschau();
    showSnackbar('Vorschau aktualisiert');
  });

  document.getElementById('publishCloseBtn').addEventListener('click', () => {
    const ov = document.getElementById('publishOverlay');
    ov.classList.add('hidden');
    ov.classList.remove('flex');
    // Formular zurücksetzen für nächstes Inserat
    resetFormular();
  });
}

function resetFormular() {
  ['formTitel','formBreite','formHoehe','formPreis','formUwert','formBeschreibung'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('formLager').value = '1';
  document.getElementById('formSystem').value = 'IGLO 5 Classic';
  document.getElementById('formFarbe').value = 'weiss';
  document.getElementById('formVerglasung').value = '2-fach';
  document.querySelectorAll('.eig-check').forEach(c => { c.checked = false; });
  STATE.bilder = [];
  STATE.zustand = 'neu';
  STATE.material = 'kunststoff';
  STATE.glasart = 'klarglas';
  setZustandUI();
  setMaterialUI();
  setGlasartUI();
  rendereBildVorschau();
  document.getElementById('autoErkanntHinweis').classList.add('hidden');
  // Zurück zu Schritt 0
  STATE.kategorie = null;
  document.querySelectorAll('.kat-karte').forEach(b => b.classList.remove('selected'));
  document.getElementById('weiterZuStep2').disabled = true;
  goToStep1();
  rendereVorschau();
}

function goToStep2() {
  if (!STATE.kategorie) return;
  const label = KATEGORIEN_LIVE.find(k => k.key === STATE.kategorie)?.label || STATE.kategorie;
  document.getElementById('gewaehlteKategorie').textContent = label;
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
  document.getElementById('stepCircle1').classList.remove('active');
  document.getElementById('stepCircle1').classList.add('done');
  document.getElementById('stepLine1').classList.add('done');
  document.getElementById('stepCircle2').classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function goToStep1() {
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('stepCircle1').classList.add('active');
  document.getElementById('stepCircle1').classList.remove('done');
  document.getElementById('stepLine1').classList.remove('done');
  document.getElementById('stepCircle2').classList.remove('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ─── Bild-Upload ─── */
function getExifOrientation(dataUrl) {
  try {
    const b64 = dataUrl.split(',')[1];
    const bin = atob(b64.substring(0, 3000));
    const b = i => bin.charCodeAt(i);
    if (b(0) !== 0xFF || b(1) !== 0xD8) return 1;
    let i = 2;
    while (i < bin.length - 3) {
      if (b(i) !== 0xFF) break;
      const m = b(i + 1), len = (b(i + 2) << 8) | b(i + 3);
      if (m === 0xE1 && bin.substr(i + 4, 4) === 'Exif') {
        const t = i + 10;
        const le = b(t) === 0x49;
        const r16 = o => le ? (b(t+o) | b(t+o+1)<<8) : (b(t+o)<<8 | b(t+o+1));
        const r32 = o => le
          ? (b(t+o) | b(t+o+1)<<8 | b(t+o+2)<<16 | b(t+o+3)<<24)
          : (b(t+o)<<24 | b(t+o+1)<<16 | b(t+o+2)<<8 | b(t+o+3));
        const ifd = r32(4), n = r16(ifd);
        for (let j = 0; j < n; j++) {
          const e = ifd + 2 + j * 12;
          if (r16(e) === 0x0112) return r16(e + 8);
        }
      }
      i += 2 + len;
    }
  } catch (_) {}
  return 1;
}

function compressImage(dataUrl, maxPx = 1200, quality = 0.85) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

function handleFiles(files) {
  const total = STATE.bilderBestand.length + STATE.bilder.length;
  const arr = Array.from(files).slice(0, 20 - total);
  if (total >= 20) {
    showSnackbar('Maximal 20 Bilder pro Inserat', 'error');
    return;
  }
  arr.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async e => {
      const compressed = await compressImage(e.target.result);
      STATE.bilder.push(compressed);
      rendereBildVorschau();
      rendereVorschau();
    };
    reader.readAsDataURL(file);
  });
}

function rendereBildVorschau() {
  const wrap = document.getElementById('bildVorschauWrap');
  const anz = document.getElementById('bildAnzahl');
  const tipp = document.getElementById('fotoTipp');
  const total = STATE.bilderBestand.length + STATE.bilder.length;
  if (anz) anz.textContent = `${total} / 20`;
  if (tipp) tipp.classList.toggle('hidden', total === 0);
  if (total === 0) {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');

  // Bestehende Bilder zuerst (beim Bearbeiten), dann neue
  const html = [];
  STATE.bilderBestand.forEach((url, i) => {
    html.push(`
      <div class="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group">
        <img src="${url}" class="w-full h-full object-cover" onerror="this.src='img/fenster_standard.png'"/>
        <button type="button" class="absolute top-1 right-1 w-7 h-7 bg-error/90 hover:bg-error text-white rounded-full flex items-center justify-center opacity-100 transition-opacity" data-bild-bestand-entf="${i}" aria-label="Entfernen">
          <span class="material-symbols-outlined" style="font-size:16px">close</span>
        </button>
        ${i === 0 ? '<span class="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">HAUPTBILD</span>' : ''}
      </div>`);
  });
  STATE.bilder.forEach((url, i) => {
    const realPos = STATE.bilderBestand.length + i;
    html.push(`
      <div class="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group">
        <img src="${url}" class="w-full h-full object-cover"/>
        <button type="button" class="absolute top-1 right-1 w-7 h-7 bg-error/90 hover:bg-error text-white rounded-full flex items-center justify-center opacity-100 transition-opacity" data-bild-entf="${i}" aria-label="Entfernen">
          <span class="material-symbols-outlined" style="font-size:16px">close</span>
        </button>
        ${realPos === 0 ? '<span class="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">HAUPTBILD</span>' : ''}
        <span class="absolute bottom-1 right-1 bg-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEU</span>
      </div>`);
  });
  wrap.innerHTML = html.join('');

  wrap.querySelectorAll('[data-bild-bestand-entf]').forEach(b => {
    b.addEventListener('click', () => {
      STATE.bilderBestand.splice(parseInt(b.dataset.bildBestandEntf, 10), 1);
      rendereBildVorschau(); rendereVorschau();
    });
  });
  wrap.querySelectorAll('[data-bild-entf]').forEach(b => {
    b.addEventListener('click', () => {
      STATE.bilder.splice(parseInt(b.dataset.bildEntf, 10), 1);
      rendereBildVorschau(); rendereVorschau();
    });
  });
}

/* ─── Live-Vorschau ─── */
function rendereVorschau() {
  const titel = document.getElementById('formTitel').value || 'Dein Produkt-Titel';
  const breite = document.getElementById('formBreite').value || '–';
  const hoehe = document.getElementById('formHoehe').value || '–';
  const preis = parseInt(document.getElementById('formPreis').value, 10) || 0;
  const lager = parseInt(document.getElementById('formLager').value, 10) || 1;
  const system = document.getElementById('formSystem').value || 'IGLO 5 Classic';
  const verglasung = document.getElementById('formVerglasung').value;
  const rc = '';
  const beschr = document.getElementById('formBeschreibung').value || (STATE.kategorie ? KATEGORIEN_LIVE.find(k=>k.key===STATE.kategorie)?.label + ' direkt aus dem Lager.' : 'Lagerware – sofort lieferbar.');
  // Hauptbild: erst neue (Bilder), dann bestehende (bilderBestand), sonst Default
  const echtesBild = STATE.bilder[0] || STATE.bilderBestand[0] || null;
  const bild = echtesBild || 'img/fenster_standard.png';
  const istSymbolbild = !echtesBild;

  const lagerBadge = lager <= 1
    ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style="background:#fff4dc;color:#b87f00">Nur ${lager} verfügbar</span>`
    : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style="background:#e3f5e9;color:#0a8a3a">${lager} auf Lager</span>`;
  const rcBadge = rc ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style="background:rgba(201,168,76,0.16);color:#8e6d10">${rc}</span>` : '';

  const html = `
    <div class="relative aspect-[4/3] bg-surface-container-low">
      <img src="${escapeHtml(bild)}" alt="" class="w-full h-full object-contain" onerror="this.src='img/fenster_standard.png'"/>
      ${istSymbolbild ? '<span class="absolute bottom-2 left-2 bg-[#0e1e3a]/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Symbolbild</span>' : ''}
    </div>
    <div class="p-4">
      <div class="flex flex-wrap gap-1 mb-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-fixed text-on-primary-fixed">${verglasung}-Verglasung</span>
        ${rcBadge}
        ${lagerBadge}
      </div>
      <h3 class="text-sm font-bold leading-snug line-clamp-2 mb-1">${escapeHtml(titel)}</h3>
      <p class="text-[11px] text-on-surface-variant">${escapeHtml(system)} · ${breite} × ${hoehe} mm</p>
      <p class="text-[11px] text-on-surface-variant line-clamp-2 mt-1">${escapeHtml(beschr)}</p>
      <div class="mt-3 flex items-end justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block">ab</span>
          <span class="text-xl font-extrabold text-primary leading-none">${preis ? new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(preis) : '— €'}</span>
        </div>
        <button class="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1" disabled>
          <span class="material-symbols-outlined" style="font-size:14px">add_shopping_cart</span>
          Hinzufügen
        </button>
      </div>
    </div>
  `;
  document.getElementById('vorschauKarte').innerHTML = html;
}

/* ─── Veröffentlichen → in Google Sheets speichern ─── */
async function veroeffentlichen() {
  const titel      = document.getElementById('formTitel').value.trim();
  const breite     = parseInt(document.getElementById('formBreite').value, 10);
  const hoehe      = parseInt(document.getElementById('formHoehe').value, 10);
  const preis      = parseInt(document.getElementById('formPreis').value, 10);
  const standnummer     = document.getElementById('formStandnummer')?.value.trim() || '';
  const sonderpreisAktiv = !!document.getElementById('formSonderpreis')?.checked;
  const exportModell    = !!document.getElementById('formExport')?.checked;

  if (!STATE.kategorie || !titel || !breite || !hoehe || !preis) {
    showSnackbar('Bitte Pflichtfelder ausfüllen: Kategorie, Titel, Maße, Preis', 'error');
    return;
  }
  if (!standnummer) {
    showSnackbar('Standnummer ist Pflicht — bitte eintragen (z.B. A-12)', 'error');
    document.getElementById('formStandnummer')?.focus();
    return;
  }

  const btn = document.getElementById('veroeffentlichenBtn');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span> Speichere…';

  try {
    // Eigenschaften zusammenstellen
    const eigArr = Array.from(document.querySelectorAll('.eig-check:checked')).map(c => c.value);
    const verglasung = document.getElementById('formVerglasung').value;
    if (verglasung === '2-fach') eigArr.push('2-fach-verglasung');
    if (verglasung === '3-fach') eigArr.push('3-fach-verglasung');
    const rc = null;

    // Bilder zu Google Drive hochladen
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span> Lade Bilder hoch…';
    const bildUrls = [];
    for (let i = 0; i < STATE.bilder.length; i++) {
      const dataUrl  = STATE.bilder[i];
      const parts    = dataUrl.split(',');
      const mimeType = parts[0].match(/:(.*?);/)[1];
      const base64   = parts[1];
      const ext      = mimeType.split('/')[1].replace('jpeg', 'jpg');
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${i}.${ext}`;

      const res = await sheetsPost({
        action: 'upload_image',
        imageBase64: base64,
        mimeType,
        fileName
      });
      if (res.error) throw new Error('Bild-Upload fehlgeschlagen: ' + res.error);
      bildUrls.push(res.url);
    }

    // Bilder zusammenführen: bestehende (beim Bearbeiten) + neu hochgeladene
    const alleBilder = [...STATE.bilderBestand, ...bildUrls];
    if (alleBilder.length === 0) alleBilder.push('img/fenster_standard.png');

    btn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span> Speichere Inserat…';

    const eintrag = {
      titel,
      kategorie_key: STATE.kategorie,
      zustand: STATE.zustand,
      material: (STATE.material && STATE.material !== 'keine') ? STATE.material : null,
      glasart: (STATE.glasart && STATE.glasart !== 'keine') ? STATE.glasart : null,
      system: STATE.zustand === 'neu' ? (document.getElementById('formSystem').value || null) : null,
      breite_mm: breite,
      hoehe_mm: hoehe,
      preis_eur: preis,
      sonderpreis_eur: sonderpreisAktiv ? preis : null,
      groesse_klasse: KATEGORIEN_MIT_GROESSE.has(STATE.kategorie) && STATE.groesseKlasse ? STATE.groesseKlasse : null,
      export_modell: exportModell,
      farbe: document.getElementById('formFarbe').value || null,
      verglasung: verglasung || null,
      u_wert: null,
      oeffnungsart: document.getElementById('formOeffnungsart')?.value || null,
      rc_klasse: rc,
      eigenschaften: Array.from(new Set(eigArr)),
      lagerbestand: parseInt(document.getElementById('formLager').value, 10) || 1,
      standnummer,
      bilder: alleBilder,
      beschreibung: document.getElementById('formBeschreibung').value.trim() || '',
      aktiv: true
    };

    let res;
    if (STATE.editMode && STATE.editId) {
      res = await sheetsPost({ action: 'update', id: STATE.editId, data: eintrag });
    } else {
      res = await sheetsPost({ action: 'insert', data: eintrag });
    }
    if (res.error) throw new Error('Speichern fehlgeschlagen: ' + res.error);

    // Erfolg → Modal anzeigen, Draft löschen
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    const ov = document.getElementById('publishOverlay');
    ov.classList.remove('hidden');
    ov.classList.add('flex');
  } catch (e) {
    console.error(e);
    showSnackbar(e.message || 'Unbekannter Fehler', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function dataURLToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

/* ─── Draft Auto-Save ─── */
function saveDraft() {
  const draft = {
    zustand: STATE.zustand,
    material: STATE.material,
    glasart: STATE.glasart,
    kategorie: STATE.kategorie,
    titel: document.getElementById('formTitel')?.value || '',
    breite: document.getElementById('formBreite')?.value || '',
    hoehe: document.getElementById('formHoehe')?.value || '',
    preis: document.getElementById('formPreis')?.value || '',
    lager: document.getElementById('formLager')?.value || '',
    system: document.getElementById('formSystem')?.value || '',
    farbe: document.getElementById('formFarbe')?.value || '',
    verglasung: document.getElementById('formVerglasung')?.value || '',
    uwert: document.getElementById('formUwert')?.value || '',
    beschreibung: document.getElementById('formBeschreibung')?.value || '',
    rc: document.querySelector('input[name="formRC"]:checked')?.value || '',
    eigenschaften: Array.from(document.querySelectorAll('.eig-check:checked')).map(c => c.value),
    standnummer: document.getElementById('formStandnummer')?.value || '',
    oeffnungsart: document.getElementById('formOeffnungsart')?.value || ''
  };
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
}

function ladeDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.zustand) STATE.zustand = d.zustand;
    if (d.material) STATE.material = d.material;
    if (d.glasart) STATE.glasart = d.glasart;
    if (d.kategorie) STATE.kategorie = d.kategorie;
    const setIfPresent = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setIfPresent('formTitel', d.titel);
    setIfPresent('formBreite', d.breite);
    setIfPresent('formHoehe', d.hoehe);
    setIfPresent('formPreis', d.preis);
    setIfPresent('formLager', d.lager);
    setIfPresent('formSystem', d.system);
    setIfPresent('formFarbe', d.farbe);
    setIfPresent('formVerglasung', d.verglasung);
    setIfPresent('formUwert', d.uwert);
    setIfPresent('formBeschreibung', d.beschreibung);
    setIfPresent('formStandnummer', d.standnummer);
    setIfPresent('formOeffnungsart', d.oeffnungsart);
    if (d.rc) {
      const rcEl = document.querySelector(`input[name="formRC"][value="${d.rc}"]`);
      if (rcEl) rcEl.checked = true;
    }
    if (Array.isArray(d.eigenschaften)) {
      d.eigenschaften.forEach(e => {
        const el = document.querySelector(`.eig-check[value="${e}"]`);
        if (el) el.checked = true;
      });
    }
  } catch (e) {}
}

/* ─── Snackbar ─── */
let snackbarTimer;
function showSnackbar(text, type = 'info') {
  const el = document.getElementById('snackbar');
  const icon = type === 'error' ? 'error' : 'check_circle';
  el.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">${icon}</span>${text}`;
  el.classList.add('show');
  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ─── Helper ─── */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
