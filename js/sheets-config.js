/* ─────────────────────────────────────────────────────────────────────
   Shop-Backend für DeineFenster.de — über Cloudflare-Worker-Proxy
   Daten:  data/shop-produkte.json  (im GitHub-Repo)
   Bilder: img/shop/               (im GitHub-Repo → GitHub Pages CDN)

   ⚠ SECURITY: Der GitHub-Token liegt AUSSCHLIESSLICH als Secret im
   Worker (cloudflare-worker/github-proxy.js). Das Frontend kennt nur
   das Shop-Passwort — der Worker prüft es und führt die Operation
   server-side mit dem Token aus.
   ───────────────────────────────────────────────────────────────────── */

const _WORKER = 'https://deinefenster-shop.deinefenster.workers.dev'; // siehe SECURITY-SETUP.md
const _PAGES  = 'https://sarahhheea.github.io/deinefenster-live';
const _JSON_PATH = 'data/shop-produkte.json';

/* ─── Session ─────────────────────────────────────────────────────────── */

function getShopToken()  { return localStorage.getItem('df_shop_token'); }
function setShopToken(t) { localStorage.setItem('df_shop_token', t); }

function clearShopToken() {
  localStorage.removeItem('df_shop_token');
  localStorage.removeItem('df_shop_pass');
  localStorage.removeItem('df_shop_email');
}

function isShopLoggedIn() {
  return !!localStorage.getItem('df_shop_pass');
}

/* ─── Login ───────────────────────────────────────────────────────────── */

async function shopLogin(password) {
  try {
    const res = await fetch(_WORKER + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      // Passwort wird gebraucht um jeden Folge-Call zu authentifizieren.
      // Es bleibt im localStorage (wie bisher); nicht ideal, aber kein
      // GitHub-Token mehr — und es ist nur das Shop-Passwort, kein Schlüssel.
      localStorage.setItem('df_shop_pass', password);
      localStorage.setItem('df_shop_token', 'ok');
      return { ok: true, token: 'ok' };
    }
    return { ok: false, error: data.error || 'Falsches Passwort.' };
  } catch (err) {
    return { ok: false, error: 'Verbindung zum Server fehlgeschlagen: ' + err.message };
  }
}

function _authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Shop-Pass': localStorage.getItem('df_shop_pass') || '',
  };
}

/* ─── Worker-Helfer ──────────────────────────────────────────────────── */

async function _proxyGet(path) {
  const res = await fetch(_WORKER + '/get', {
    method: 'POST',
    headers: _authHeaders(),
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('GitHub Lesefehler (' + res.status + ')');
  return res.json();
}

async function _proxyPut(path, content64, sha, message) {
  const res = await fetch(_WORKER + '/put', {
    method: 'POST',
    headers: _authHeaders(),
    body: JSON.stringify({ path, content64, sha, message }),
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

/* ─── localStorage-Backup (Sicherheitsnetz bei Worker-Fehlern) ───────── */

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

async function _writeJSON(modifier, message, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 200 * attempt));
    }
    const file = await _proxyGet(_JSON_PATH);
    const json = _base64ToJson(file.content);
    _saveBackup(json);
    modifier(json);
    const result = await _proxyPut(_JSON_PATH, _jsonToBase64(json), file.sha, message);
    if (result.ok) return json;
    if (result.status === 409) {
      lastError = 'SHA-Konflikt (gleichzeitiger Schreibvorgang), Retry ' + (attempt + 1);
      continue;
    }
    throw new Error('GitHub Schreibfehler: ' + result.message);
  }
  throw new Error('Schreibvorgang nach ' + maxRetries + ' Versuchen gescheitert. ' + lastError);
}

/* ─── Produktdaten lesen (öffentlich — kein Auth nötig) ───────────────── */

async function _ladeJSON() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('data/shop-produkte.json', { signal: controller.signal });
    if (!res.ok) throw new Error('Produkte konnten nicht geladen werden: ' + res.status);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ─── Öffentliche API (kompatibel mit shop.js + shop-einstellen.js) ──── */

async function sheetsGet(action, params) {
  const data = await _ladeJSON();

  if (action === 'produkte') {
    return data;
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
    const result   = await _proxyPut(path, body.imageBase64, null, `Bild: ${fileName}`);
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
