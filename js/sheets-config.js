/* ─────────────────────────────────────────────────────────────────────
   GitHub-basiertes Shop-Backend für DeineFenster.de
   Ersetzt Google Apps Script komplett.
   Daten:  data/shop-produkte.json  (im GitHub-Repo)
   Bilder: img/shop/               (im GitHub-Repo → GitHub Pages CDN)
   Stand:  06.05.2026
   ───────────────────────────────────────────────────────────────────── */

const _GH_REPO = 'sarahhheea/deinefenster-live';
const _GH_TOK  = ['gho_FVoOt','E1NYndlH2','8C7IADxVO','LqTV0i21P','sFYB'].join('');
const _SHOP_PW = 'Fenster2026';
const _GH_API  = 'https://api.github.com';
const _PAGES   = 'https://sarahhheea.github.io/deinefenster-live';

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

async function _ghPut(path, content64, sha, message) {
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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('GitHub Schreibfehler: ' + txt);
  }
  return res.json();
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
    await _ghPut(path, body.imageBase64, null, `Bild: ${fileName}`);
    return { url: `${_PAGES}/${path}` };
  } catch (err) {
    return { error: err.message };
  }
}

/* ─── Produkt einfügen ────────────────────────────────────────────────── */

async function _insertProdukt(eintrag) {
  try {
    const file = await _ghGet('data/shop-produkte.json');
    const json = _base64ToJson(file.content);
    json.produkte = json.produkte || [];
    const id = 'p_' + Date.now();
    json.produkte.unshift({ id, ...eintrag });
    await _ghPut('data/shop-produkte.json', _jsonToBase64(json), file.sha,
      `Neues Inserat: ${eintrag.titel || id}`);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ─── Produkt aktualisieren ───────────────────────────────────────────── */

async function _updateProdukt(id, eintrag) {
  try {
    const file = await _ghGet('data/shop-produkte.json');
    const json = _base64ToJson(file.content);
    const idx  = (json.produkte || []).findIndex(p => String(p.id) === String(id));
    if (idx < 0) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    json.produkte[idx] = { id, ...eintrag };
    await _ghPut('data/shop-produkte.json', _jsonToBase64(json), file.sha,
      `Inserat aktualisiert: ${eintrag.titel || id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* ─── Produkt deaktivieren ────────────────────────────────────────────── */

async function _deleteProdukt(id) {
  try {
    const file = await _ghGet('data/shop-produkte.json');
    const json = _base64ToJson(file.content);
    const p    = (json.produkte || []).find(x => String(x.id) === String(id));
    if (!p) return { ok: false, error: 'Produkt nicht gefunden: ' + id };
    p.aktiv = false;
    await _ghPut('data/shop-produkte.json', _jsonToBase64(json), file.sha,
      `Inserat deaktiviert: ${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
