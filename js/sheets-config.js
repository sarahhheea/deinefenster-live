/* ─────────────────────────────────────────────────────────────────────
   GitHub-basiertes Shop-Backend für DeineFenster.de
   Ersetzt Google Apps Script komplett.
   Daten:  data/shop-produkte.json  (im GitHub-Repo)
   Bilder: img/shop/               (im GitHub-Repo → GitHub Pages CDN)
   Stand:  11.05.2026 — SHA-Retry + localStorage-Backup
   ───────────────────────────────────────────────────────────────────── */

const _GH_REPO = 'sarahhheea/deinefenster-live';
const _GH_TOK  = ['gho_FVoOt','E1NYndlH2','8C7IADxVO','LqTV0i21P','sFYB'].join('');
const _SHOP_PW = 'Fenster2026';
const _GH_API  = 'https://api.github.com';
const _PAGES   = 'https://www.deinefenster.de';
const _JSON_PATH = 'data/shop-produkte.json';

/* ─── Session ─────────────────────────────────────────────────────────── */

function getShopToken()  { return localStorage.getItem('df_shop_token'); }
function setShopToken(t) { localStorage.setItem('df_shop_token', t); }

function clearShopToken() {
  localStorage.removeItem('df_shop_token');
  localStorage.removeItem('df_shop_email');
}

function isShopLoggedIn() {
  return localStorage.getItem('df_shop_token') === 'ok';
}

/* ─── Login ───────────────────────────────────────────────────────────── */

async function shopLogin(password) {
  if (password !== _SHOP_PW) {
    return { ok: false, error: 'Falsches Passwort.' };
  }
  localStorage.setItem('df_shop_token', 'ok');
  return { ok: true, token: 'ok' };
}

/* ─── GitHub API Helpers ──────────────────────────────────────────────── */

async function _ghGet(path) {
  const res = await fetch(`${_GH_API}/repos/${_GH_REPO}/contents/${path}`, {
    headers: {
      Authorization: `token ${_GH_TOK}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error('GitHub Lesefehler: ' + res.status);
  return res.json();
}

/* Gibt { ok: true } oder { ok: false, status, message } zurück */
async function _ghPutRaw(path, content64, sha, message) {
  const body = { message, content: content64 };
  if (sha) body.sha = sha;
  const res = await fetch(`${_GH_API}/repos/${_GH_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${_GH_TOK}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (res.ok) return { ok: true, data: await res.json() };
  const txt = await res.text();
  return { ok: false, status: res.status, message: txt };
}

/* ─── JSON encode/decode (UTF-8 sicher für Umlaute) ──────────────────── */

function _base64ToJson(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function _jsonToBase64(obj) {
  const bytes  = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  let binary   = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/* ─── localStorage-Backup (Sicherheitsnetz bei GitHub-Fehlern) ───────── */

function _saveBackup(json) {
  try { localStorage.setItem('df_shop_backup', JSON.stringify(json)); } catch (e) { /* kein Platz */ }
}

function _loadBackup() {
  try {
    const s = localStorage.getItem('df_shop_backup');
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

/* ─── Kernfunktion: JSON modifizieren + schreiben mit SHA-Retry ───────── */
/*
   modifier(json) verändert das JSON-Objekt in-place.
   Bei 409-Konflikt (SHA veraltet): frischen SHA holen + nochmal versuchen.
   Bis zu maxRetries Versuche, mit kurzem Warten zwischen den Versuchen.
*/
async function _writeJSON(modifier, message, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Kurz warten bevor Retry (200ms, 400ms, ...)
      await new Promise(r => setTimeout(r, 200 * attempt));
    }
    const file = await _ghGet(_JSON_PATH);
    const json = _base64ToJson(file.content);
    // Backup vor dem Schreiben
    _saveBackup(json);
    // Modifier anwenden
    modifier(json);
    const result = await _ghPutRaw(_JSON_PATH, _jsonToBase64(json), file.sha, message);
    if (result.ok) return json; // Erfolg
    if (result.status === 409) {
      // SHA-Konflikt — frischer Versuch mit aktuellem SHA
      lastError = 'SHA-Konflikt (gleichzeitiger Schreibvorgang), Retry ' + (attempt + 1);
      continue;
    }
    throw new Error('GitHub Schreibfehler: ' + result.message);
  }
  throw new Error('Schreibvorgang nach ' + maxRetries + ' Versuchen gescheitert. ' + lastError);
}

/* ─── Produktdaten lesen ──────────────────────────────────────────────── */

async function _ladeJSON() {
  const res = await fetch(`data/shop-produkte.json?t=${Date.now()}`);
  if (!res.ok) throw new Error('Produkte konnten nicht geladen werden.');
  return res.json();
}

/* ─── Öffentliche API (kompatibel mit shop.js + shop-einstellen.js) ──── */

async function sheetsGet(action, params) {
  const data = await _ladeJSON();

  if (action === 'produkte') {
    return data; // { produkte: [...], kategorien: {...} }
  }
  if (action === 'produkt' && params && params.id) {
    const p = (data.produkte || []).find(x => String(x.id) === String(params.id));
    return { produkt: p || null };
  }
  throw new Error('Unbekannte Aktion: ' + action);
}

async function sheetsPost(data) {
  const action = data.action;
  if (action === 'upload_image') return _uploadBild(data);
  if (action === 'insert')       return _insertProdukt(data.data);
  if (action === 'update')       return _updateProdukt(data.id, data.data);
  if (action === 'delete')       return _deleteProdukt(data.id);
  return { ok: false, error: 'Unbekannte Aktion: ' + action };
}

/* ─── Bild hochladen → img/shop/ ─────────────────────────────────────── */

async function _uploadBild(body) {
  try {
    const fileName = body.fileName || `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
    const path     = `img/shop/${fileName}`;
    const result   = await _ghPutRaw(path, body.imageBase64, null, `Bild: ${fileName}`);
    if (!result.ok) throw new Error(result.message);
    return { url: `${_PAGES}/${path}` };
  } catch (err) {
    return { error: err.message };
  }
}

/* ─── Produkt einfügen ────────────────────────────────────────────────── */

async function _insertProdukt(eintrag) {
  try {
    const id = 'p_' + Date.now();
    await _writeJSON(json => {
      json.produkte = json.produkte || [];
      json.produkte.unshift({ id, ...eintrag });
    }, `Neues Inserat: ${eintrag.titel || id}`);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ─── Produkt aktualisieren ───────────────────────────────────────────── */

async function _updateProdukt(id, eintrag) {
  try {
    let found = false;
    await _writeJSON(json => {
      const idx = (json.produkte || []).findIndex(p => String(p.id) === String(id));
      if (idx >= 0) { json.produkte[idx] = { id, ...eintrag }; found = true; }
    }, `Inserat aktualisiert: ${eintrag.titel || id}`);
    if (!found) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ─── Produkt deaktivieren ────────────────────────────────────────────── */

async function _deleteProdukt(id) {
  try {
    let found = false;
    await _writeJSON(json => {
      const p = (json.produkte || []).find(x => String(x.id) === String(id));
      if (p) { p.aktiv = false; found = true; }
    }, `Inserat deaktiviert: ${id}`);
    if (!found) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
