/* ─────────────────────────────────────────────────────────────────────
   DSGVO/TTDSG-Cookie-Consent für DeineFenster.de
   - Speichert Consent in localStorage 'df_cookie_consent' (gültig 365 Tage)
   - Lädt Plausible Analytics NUR nach Consent (Kategorie "statistik")
   - Notwendige Cookies sind technisch erforderlich, kein Toggle
   - Funktional/Statistik standardmässig AUS (Pflicht!)
   - "Cookie-Einstellungen" jederzeit über window.dfOpenCookieSettings()
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const STORAGE_KEY = 'df_cookie_consent';
  const CONSENT_VERSION = 1;
  const CONSENT_DURATION_DAYS = 365;

  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Abgelaufen?
      if (!data.timestamp || (Date.now() - data.timestamp) > CONSENT_DURATION_DAYS * 86400 * 1000) {
        return null;
      }
      if (data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(prefs) {
    const data = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      necessary: true,
      statistik: !!prefs.statistik,
      funktional: !!prefs.funktional,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    return data;
  }

  function applyConsent(consent) {
    // Plausible Analytics nur laden bei Statistik-Consent
    if (consent.statistik && !document.querySelector('script[data-domain="deinefenster.de"][src*="plausible.io"]')) {
      const s = document.createElement('script');
      s.defer = true;
      s.setAttribute('data-domain', 'deinefenster.de');
      s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    }
    // window-Event fuer andere Scripts die ggf. auf Consent warten
    try { window.dispatchEvent(new CustomEvent('df-consent-updated', { detail: consent })); } catch (e) {}
  }

  // ── Banner-HTML ───────────────────────────────────────────────────
  const BANNER_HTML = `
    <div id="df-cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie-Einwilligung">
      <div class="df-cookie-inner">
        <div class="df-cookie-text">
          <strong>🍪 Cookies &amp; Datenschutz</strong>
          Wir verwenden notwendige Cookies, damit unsere Website funktioniert. Mit Ihrer Einwilligung nutzen wir zusätzlich Statistik-Tools (Plausible, anonymisiert, EU). Sie können jederzeit über den Footer-Link „Cookie-Einstellungen" widerrufen.
          <a href="datenschutz.html">Mehr Infos</a>
        </div>
        <div class="df-cookie-actions">
          <button type="button" class="df-cookie-btn df-settings" onclick="window.dfOpenCookieSettings()">Einstellungen</button>
          <button type="button" class="df-cookie-btn df-reject" onclick="window.dfRejectCookies()">Ablehnen</button>
          <button type="button" class="df-cookie-btn df-accept" onclick="window.dfAcceptAllCookies()">Alle akzeptieren</button>
        </div>
      </div>
    </div>

    <div id="df-cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie-Einstellungen">
      <div class="df-modal-card">
        <h3>Cookie-Einstellungen</h3>
        <p class="df-modal-intro">
          Sie entscheiden, welche Cookies Sie zulassen. Notwendige Cookies sind für den Betrieb der Website erforderlich.
          Statistik und Funktional sind optional und werden nur mit Ihrer Einwilligung aktiviert.
        </p>

        <div class="df-cat">
          <div class="df-cat-head">
            <div>
              <div class="df-cat-name">Notwendig</div>
              <div class="df-cat-desc">Technisch erforderliche Cookies (z. B. Warenkorb-Speicherung, Konfigurator-Auswahl).</div>
            </div>
            <span class="df-cat-required">Immer aktiv</span>
          </div>
        </div>

        <div class="df-cat">
          <div class="df-cat-head">
            <div>
              <div class="df-cat-name">Statistik</div>
              <div class="df-cat-desc">Plausible Analytics — anonyme Aufrufzahlen, ohne Cookies, Server in der EU.</div>
            </div>
            <div class="df-toggle" id="df-toggle-statistik" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>

        <div class="df-cat">
          <div class="df-cat-head">
            <div>
              <div class="df-cat-name">Funktional</div>
              <div class="df-cat-desc">Externe Inhalte (Google Maps, Videos) — werden erst nach Klick geladen.</div>
            </div>
            <div class="df-toggle" id="df-toggle-funktional" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>

        <div class="df-modal-actions">
          <button type="button" class="df-cookie-btn df-reject" onclick="window.dfRejectCookies()">Nur notwendige</button>
          <button type="button" class="df-cookie-btn df-accept" onclick="window.dfSaveCookieSettings()">Auswahl speichern</button>
        </div>
      </div>
    </div>
  `;

  function injectBanner() {
    if (document.getElementById('df-cookie-banner')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = BANNER_HTML;
    while (wrap.firstElementChild) {
      document.body.appendChild(wrap.firstElementChild);
    }
  }

  function showBanner() {
    const el = document.getElementById('df-cookie-banner');
    if (el) el.classList.add('show');
  }
  function hideBanner() {
    const el = document.getElementById('df-cookie-banner');
    if (el) el.classList.remove('show');
  }
  function showModal() {
    const consent = loadConsent();
    if (consent) {
      // Aktuelle Werte voreingestellt für Widerruf
      document.getElementById('df-toggle-statistik').classList.toggle('on', !!consent.statistik);
      document.getElementById('df-toggle-funktional').classList.toggle('on', !!consent.funktional);
    } else {
      document.getElementById('df-toggle-statistik').classList.remove('on');
      document.getElementById('df-toggle-funktional').classList.remove('on');
    }
    document.getElementById('df-cookie-modal').classList.add('show');
  }
  function hideModal() {
    document.getElementById('df-cookie-modal').classList.remove('show');
  }

  // ── Global API ────────────────────────────────────────────────────
  window.dfAcceptAllCookies = function () {
    const consent = saveConsent({ statistik: true, funktional: true });
    applyConsent(consent);
    hideBanner();
    hideModal();
  };

  window.dfRejectCookies = function () {
    const consent = saveConsent({ statistik: false, funktional: false });
    applyConsent(consent);
    hideBanner();
    hideModal();
  };

  window.dfSaveCookieSettings = function () {
    const statistik = document.getElementById('df-toggle-statistik').classList.contains('on');
    const funktional = document.getElementById('df-toggle-funktional').classList.contains('on');
    const consent = saveConsent({ statistik, funktional });
    applyConsent(consent);
    hideBanner();
    hideModal();
  };

  window.dfOpenCookieSettings = function () {
    injectBanner();
    showModal();
  };

  // Modal schliessen bei Klick auf Overlay (aber NICHT bei Klick auf Card)
  document.addEventListener('click', function (e) {
    const modal = document.getElementById('df-cookie-modal');
    if (modal && modal.classList.contains('show') && e.target === modal) {
      // Nicht schliessen ohne Wahl wenn noch kein Consent gespeichert ist
      if (loadConsent()) hideModal();
    }
  });

  // ── Initialisierung ───────────────────────────────────────────────
  function init() {
    injectBanner();
    const consent = loadConsent();
    if (!consent) {
      showBanner();
    } else {
      applyConsent(consent);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
