/* ─────────────────────────────────────────────────────────────────────
   Shop-Backend für DeineFenster.de
   Schaufenster-Katalog (kein Warenkorb, kein Bezahlen).

   ⚠ SECURITY: Der GitHub-Zugangsschlüssel (Personal Access Token) liegt
   AUSSCHLIESSLICH im Browser der eingeloggten Familie (localStorage).
   Er steht NICHT im Quellcode dieser Website — d.h. normale Besucher
   können ihn nicht lesen.

   Inserieren funktioniert nur, wenn die Familie sich mit ihrem
   Zugangsschlüssel eingeloggt hat. Lese-Zugriff (Shop anschauen) geht
   ohne Login, weil das JSON über GitHub Pages öffentlich ist.

   Wenn der Browser-Speicher gelöscht wird → Schlüssel muss neu eingegeben
   werden. Schlüssel-Verlust → in github.com/settings/tokens revoken +
   neuen erstellen (Scope: Contents read+write für sarahhheea/deinefenster-live).
   ───────────────────────────────────────────────────────────────────── */

const _GH_REPO = 'sarahhheea/deinefenster-live';
const _GH_API  = 'https://api.github.com';
const _PAGES   = 'https://sarahhheea.github.io/deinefenster-live';
const _JSON_PATH = 'data/shop-produkte.json';
const _TOKEN_KEY = 'df_gh_tok';

/* ─── Session: Token im Browser merken ───────────────────────────────── */

function getShopToken()  { return localStorage.getItem(_TOKEN_KEY) || ''; }
function setShopToken(t) { localStorage.setItem(_TOKEN_KEY, t); }

function clearShopToken() {
  localStorage.removeItem(_TOKEN_KEY);
  localStorage.removeItem('df_shop_token'); // alter Key falls noch da
  localStorage.removeItem('df_shop_pass');
  localStorage.removeItem('df_shop_email');
}

function isShopLoggedIn() {
  return !!getShopToken();
}

/* ─── Login: Token-Eingabe + Test gegen GitHub API ───────────────────── */

async function shopLogin(tokenOrPassword) {
  const t = (tokenOrPassword || '').trim();
  if (!t || t.length < 20) {
    return { ok: false, error: 'Bitte den vollständigen Zugangsschlüssel eingeben.' };
  }
  try {
    const r = await fetch(`${_GH_API}/repos/${_GH_REPO}`, {
      headers: {
        Authorization: `token ${t}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (r.status === 200) {
      setShopToken(t);
      return { ok: true, token: 'ok' };
    }
    if (r.status === 401 || r.status === 403) {
      return { ok: false, error: 'Zugangsschlüssel ungültig oder abgelaufen.' };
    }
    return { ok: false, error: 'Anmeldung fehlgeschlagen (HTTP ' + r.status + ').' };
  } catch (e) {
    return { ok: false, error: 'Verbindungsfehler: ' + e.message };
  }
}

/* ─── GitHub API Helpers (Token kommt aus localStorage) ──────────────── */

function _authHeaders(extra) {
  const tok = getShopToken();
  if (!tok) throw new Error('Bitte einloggen.');
  return Object.assign({
    Authorization: `token ${tok}`,
    Accept: 'application/vnd.github.v3+json',
  }, extra || {});
}

async function _ghGet(path) {
  const url = `${_GH_API}/repos/${_GH_REPO}/contents/${encodeURI(path)}?ref=main&_=${Date.now()}`;
  const res = await fetch(url, {
    headers: _authHeaders({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('GitHub Lesefehler: ' + res.status);
  return res.json();
}

async function _ghPutRaw(path, content64, sha, message) {
  const body = { message, content: content64 };
  if (sha) body.sha = sha;
  const res = await fetch(`${_GH_API}/repos/${_GH_REPO}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: _authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
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

async function _writeJSON(modifier, message, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 200 * attempt));
    }
    const file = await _ghGet(_JSON_PATH);
    const json = _base64ToJson(file.content);
    _saveBackup(json);
    modifier(json);
    const result = await _ghPutRaw(_JSON_PATH, _jsonToBase64(json), file.sha, message);
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
    // Cache-Buster gegen GitHub-Pages-CDN + Browser-Cache (sonst sieht man nach Speichern alte Daten)
    const url = `data/shop-produkte.json?_=${Date.now()}`;
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    });
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
  if (action === 'archive')      return _archiviereProdukt(data.id);
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

/* ─── Produkt archivieren (Soft-Delete — aktiv=false, bleibt im JSON) ─── */

async function _archiviereProdukt(id) {
  try {
    let found = false;
    await _writeJSON(json => {
      const p = (json.produkte || []).find(x => String(x.id) === String(id));
      if (p) { p.aktiv = false; found = true; }
    }, `Inserat archiviert: ${id}`);
    if (!found) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ─── Produkt KOMPLETT löschen (hart aus JSON entfernen) ──────────────── */

async function _deleteProdukt(id) {
  try {
    let found = false;
    await _writeJSON(json => {
      const vorher = (json.produkte || []).length;
      json.produkte = (json.produkte || []).filter(x => String(x.id) !== String(id));
      found = json.produkte.length < vorher;
    }, `Inserat gelöscht: ${id}`);
    if (!found) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
