/* ─────────────────────────────────────────────────────────────────────
   Google Sheets API-Verbindung für DeineFenster.de
   Ersetzt Supabase vollständig. Daten in Google Sheets,
   Bilder in Google Drive, Backend = Google Apps Script Web App.

   ⚠️  HIER EINTRAGEN: Nach Apps Script Deployment die URL kopieren und
   bei SHEETS_API_URL einfügen. Dann diese Datei speichern + pushen.

   Stand: 06.05.2026
   ───────────────────────────────────────────────────────────────────── */

// ⬇️ Hier die Apps Script Web App URL eintragen (nach Deployment):
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwNMtgsex9lr-5ihRN3zYITFwS9YdZYmnE7Rs9J9l4KeP_V1cPAhKhkyWeAoI-3Bz42IA/exec';

/* ─── Session-Verwaltung ──────────────────────────────────────────────── */

function getShopToken()  { return localStorage.getItem('df_shop_token'); }
function setShopToken(t) { localStorage.setItem('df_shop_token', t); }

function clearShopToken() {
  localStorage.removeItem('df_shop_token');
  localStorage.removeItem('df_shop_email');
}

function isShopLoggedIn() {
  return !!getShopToken() && SHEETS_API_URL !== 'APPS_SCRIPT_URL_HIER_EINTRAGEN';
}

/* ─── API-Aufrufe ─────────────────────────────────────────────────────── */

/** GET: Daten aus Sheets lesen */
async function sheetsGet(action, params) {
  if (SHEETS_API_URL === 'APPS_SCRIPT_URL_HIER_EINTRAGEN') {
    throw new Error('SHEETS_API_URL ist noch nicht konfiguriert.');
  }
  let url = SHEETS_API_URL + '?action=' + encodeURIComponent(action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(v);
    });
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Netzwerkfehler: ' + res.status);
  return res.json();
}

/**
 * POST: Daten in Sheets schreiben.
 * Kein Content-Type-Header → text/plain → kein CORS-Preflight → funktioniert.
 */
async function sheetsPost(data) {
  if (SHEETS_API_URL === 'APPS_SCRIPT_URL_HIER_EINTRAGEN') {
    throw new Error('SHEETS_API_URL ist noch nicht konfiguriert.');
  }
  const body = JSON.stringify({ token: getShopToken(), ...data });
  const res = await fetch(SHEETS_API_URL, { method: 'POST', body });
  if (!res.ok) throw new Error('Netzwerkfehler: ' + res.status);
  return res.json();
}

/** Login: Passwort senden, Token speichern */
async function shopLogin(password) {
  if (SHEETS_API_URL === 'APPS_SCRIPT_URL_HIER_EINTRAGEN') {
    return { ok: false, error: 'Shop noch nicht konfiguriert. Bitte Sarah kontaktieren.' };
  }
  try {
    const body = JSON.stringify({ action: 'login', password });
    const res  = await fetch(SHEETS_API_URL, { method: 'POST', body });
    const data = await res.json();
    if (data.ok && data.token) {
      setShopToken(data.token);
      return { ok: true };
    }
    return { ok: false, error: data.error || 'Unbekannter Fehler' };
  } catch(e) {
    return { ok: false, error: 'Verbindungsfehler: ' + e.message };
  }
}
