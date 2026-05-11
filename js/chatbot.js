/**
 * DeineFenster.de — KI-Chatbot Widget
 * Floating Chat-Button + Chat-Fenster mit Claude Haiku via Cloudflare Worker
 *
 * EINRICHTUNG:
 * 1. Cloudflare Worker deployen (workers/claude-proxy.js)
 * 2. Unten WORKER_URL eintragen
 */

const WORKER_URL = 'DEINE_CLOUDFLARE_WORKER_URL_HIER'; // z.B. https://deinefenster-chat.xyz.workers.dev

const SYSTEM_PROMPT = `Du bist der Kundenberater-Chatbot von Fensterhandel Christ, bekannt als DeineFenster.de. Du hilfst Kunden freundlich und kompetent bei Fragen rund um Fenster und Türen.

WICHTIGE REGELN:
- Antworte IMMER auf Deutsch, kurz (max. 3–4 Sätze) und freundlich
- Nenne KEINE konkreten Preise — verweise immer auf den Online-Konfigurator oder WhatsApp
- Versprich KEINE konkreten Liefertermine — nenne nur Richtwerte ("ca. 4–6 Wochen")
- Füge bei preislichen oder technischen Angaben hinzu: "Angaben ohne Gewähr"
- Bei Unsicherheit empfehle den direkten Kontakt per Telefon oder WhatsApp
- Beantworte NUR Fragen zu Fenstern, Türen und unserem Unternehmen — alles andere freundlich ablehnen
- Formatiere Antworten als normalen Text, keine Markdown-Überschriften oder langen Aufzählungen

ÜBER UNS — FENSTERHANDEL CHRIST:
- Autorisierter Drutex-Händler, Familienbetrieb in Brandenburg an der Havel seit vielen Jahren
- Adresse: Fohrder Landstraße 13, 14772 Brandenburg an der Havel
- Festnetz: 03381 / 214 83 73 (Mo–Fr 10–18 Uhr)
- WhatsApp: 0171 7263776 (nur schreiben, kein Anruf auf diese Nummer)
- E-Mail: info@baustoffchrist.de
- Hofverkauf: Jeden Freitag 10–17 Uhr, bis 20 Uhr nach telefonischer Voranmeldung
- Sommerferien 2026: 01.08.–31.08. geschlossen

NEUE FENSTER (Drutex Kunststoff/PVC):
- Nur Drutex-Marke — einer der größten Fensterhersteller Europas aus Bytów/Polen
- Maßanfertigung nach Kundenwunsch, Standardfarbe Weiß, viele RAL-Farben und Holzdekore verfügbar
- 2-fach Verglasung (Standard) oder 3-fach (bessere Dämmung, empfohlen für Sanierung)
- U-Wert bis 0,6 W/m²K bei Dreifachverglasung
- 10 Jahre Hersteller-Garantie von Drutex
- Konfigurator: https://sarahhheea.github.io/deinefenster-live/konfigurator.html
- Lieferung: ca. 4–6 Wochen nach Bestellung (Richtwert, ohne Gewähr)
- WIR BAUEN NICHT EIN — nur Lieferung frei Haus oder Abholung bei uns

GEBRAUCHTE FENSTER:
- Wechselnder Bestand, verschiedene Marken und Größen
- NUR vor Ort zu besichtigen und abzuholen — FREITAGS 10–17 Uhr
- Keine Reservierungen — wer zuerst kommt, kauft zuerst
- Selbstverladung erforderlich — eigenes Fahrzeug und Helfer mitbringen
- Nicht online bestellbar
- WIR KAUFEN KEINE gebrauchten Fenster AN

PREISE:
- Keine Festpreise — alles wird individuell nach Maß und Ausstattung berechnet
- Angebot holen: Konfigurator nutzen → https://sarahhheea.github.io/deinefenster-live/konfigurator.html
- Oder direkt fragen: WhatsApp 0171 7263776

FÖRDERUNG (BAFA):
- BAFA BEG EM: Zuschuss bis 15% der Materialkosten für Fenster mit U-Wert ≤ 0,95 W/m²K
- Antrag MUSS vor der Bestellung gestellt werden (nicht danach)
- Website: bafa.de
- Unsere Dreifachverglasung erfüllt die Anforderungen
- KfW Nr. 458 gilt NICHT mehr für einzelne Fensterkäufe — nur BAFA

WIE MESSE ICH AUS:
- Rohbaumaß = die freie Öffnung im Mauerwerk, an 3 Stellen messen, kleinsten Wert nehmen
- Breite × Höhe in mm angeben
- Bei Austausch (alter Rahmen wird entfernt): Mauerwerksöffnung messen
- Bei Überbau (alter Rahmen bleibt): den alten Rahmen von innen ausmessen
- Im Konfigurator einfach die Maße eingeben

KUNSTSTOFF vs. HOLZ vs. ALU:
- Kunststoff: pflegeleicht, keine Feuchteschäden, langlebig (30–50 Jahre), günstigster Preis — das bieten wir an
- Holz: natürlich, aber mehr Pflege (Streichen alle 5–10 Jahre) — bieten wir nicht an
- Aluminium: sehr langlebig, teurere Option — bieten wir nicht an

2-FACH vs. 3-FACH VERGLASUNG:
- 2-fach: günstig, ausreichend für Nebenräume, U-Wert ca. 1,1 W/m²K
- 3-fach: deutlich besser für Wohnräume, U-Wert bis 0,6 W/m²K — empfohlen für Sanierung und BAFA-Förderung

HAUSTÜREN (Drutex):
- Drutex-Haustüren ebenfalls erhältlich, verschiedene Modelle und Farben
- Konfigurator: https://sarahhheea.github.io/deinefenster-live/haustuer-3d.html`;

const QUICK_CHIPS = [
  { text: 'Preise & Angebot', q: 'Wie bekomme ich ein Angebot für neue Fenster?' },
  { text: 'Fenster ausmessen', q: 'Wie messe ich mein Fenster richtig aus?' },
  { text: 'Lieferung & Einbau', q: 'Liefert ihr die Fenster und bietet ihr Einbau an?' },
  { text: 'Gebraucht kaufen', q: 'Wie kann ich bei euch gebrauchte Fenster kaufen?' },
  { text: 'BAFA-Förderung', q: 'Gibt es Förderung für neue Fenster?' },
  { text: 'Öffnungszeiten', q: 'Wann habt ihr geöffnet?' },
];

// ─── Inject CSS ────────────────────────────────────────────────────────────────
(function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    #df-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #225eaa, #76a9fa);
      box-shadow: 0 4px 20px rgba(34,94,170,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: df-pulse 3s infinite;
    }
    #df-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(34,94,170,0.65);
    }
    #df-chat-btn.df-open {
      animation: none;
      background: linear-gradient(135deg, #1e3a8a, #225eaa);
    }
    #df-chat-btn svg { transition: opacity 0.15s; }
    #df-chat-btn .df-icon-close { display: none; }
    #df-chat-btn.df-open .df-icon-chat { display: none; }
    #df-chat-btn.df-open .df-icon-close { display: block; }
    #df-chat-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ef4444;
      border: 2px solid #060e1e;
      animation: df-badge-pulse 2s infinite;
    }
    #df-chat-tooltip {
      position: absolute;
      right: 72px;
      bottom: 12px;
      white-space: nowrap;
      background: #0f1c30;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid rgba(118,169,250,0.25);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      pointer-events: none;
      opacity: 0;
      transform: translateX(6px);
      transition: opacity 0.3s, transform 0.3s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    #df-chat-tooltip::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-right: none;
      border-left-color: rgba(118,169,250,0.25);
    }
    #df-chat-tooltip.df-visible {
      opacity: 1;
      transform: translateX(0);
    }

    #df-chat-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      z-index: 9999;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100dvh - 120px);
      background: #060e1e;
      border: 1px solid rgba(118,169,250,0.2);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(118,169,250,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(16px) scale(0.96);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      font-family: 'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif;
    }
    #df-chat-window.df-visible {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }
    @media (max-width: 480px) {
      #df-chat-window {
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        border-radius: 20px 20px 0 0;
      }
      #df-chat-btn { bottom: 20px; right: 16px; }
    }

    #df-chat-header {
      background: linear-gradient(135deg, #0e1e3a 0%, #122a52 100%);
      border-bottom: 1px solid rgba(118,169,250,0.15);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #df-chat-header-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #225eaa, #76a9fa);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #df-chat-header-text { flex: 1; }
    #df-chat-header-name {
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      letter-spacing: -0.01em;
    }
    #df-chat-header-sub {
      font-size: 11px;
      color: rgba(118,169,250,0.7);
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 1px;
    }
    #df-chat-header-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      animation: df-badge-pulse 2s infinite;
    }
    #df-chat-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.5);
      transition: background 0.15s, color 0.15s;
    }
    #df-chat-close-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }

    #df-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #df-chat-messages::-webkit-scrollbar { width: 4px; }
    #df-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #df-chat-messages::-webkit-scrollbar-thumb { background: rgba(118,169,250,0.2); border-radius: 2px; }

    .df-msg {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      animation: df-msg-in 0.25s ease;
    }
    .df-msg.df-user { flex-direction: row-reverse; }
    .df-msg-bubble {
      max-width: 82%;
      padding: 10px 13px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .df-msg.df-bot .df-msg-bubble {
      background: rgba(118,169,250,0.1);
      border: 1px solid rgba(118,169,250,0.15);
      color: rgba(255,255,255,0.88);
      border-bottom-left-radius: 4px;
    }
    .df-msg.df-user .df-msg-bubble {
      background: linear-gradient(135deg, #225eaa, #1e3a8a);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .df-msg-bubble a {
      color: #76a9fa;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .df-msg-avatar {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: linear-gradient(135deg, #225eaa, #76a9fa);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    #df-typing {
      display: none;
      align-items: flex-end;
      gap: 8px;
    }
    #df-typing.df-show { display: flex; }
    #df-typing-bubble {
      background: rgba(118,169,250,0.1);
      border: 1px solid rgba(118,169,250,0.15);
      border-bottom-left-radius: 4px;
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .df-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(118,169,250,0.6);
      animation: df-dot-bounce 1.2s infinite;
    }
    .df-dot:nth-child(2) { animation-delay: 0.2s; }
    .df-dot:nth-child(3) { animation-delay: 0.4s; }

    #df-chat-chips {
      padding: 0 12px 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex-shrink: 0;
    }
    .df-chip {
      padding: 5px 11px;
      border-radius: 20px;
      border: 1px solid rgba(118,169,250,0.25);
      background: rgba(118,169,250,0.06);
      color: rgba(118,169,250,0.85);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      font-family: inherit;
    }
    .df-chip:hover {
      background: rgba(118,169,250,0.15);
      border-color: rgba(118,169,250,0.5);
      color: #fff;
    }

    #df-chat-input-area {
      padding: 10px 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }
    #df-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13.5px;
      color: #fff;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
      min-height: 44px;
    }
    #df-chat-input::placeholder { color: rgba(255,255,255,0.3); }
    #df-chat-input:focus { border-color: rgba(118,169,250,0.5); }
    #df-chat-send {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #225eaa, #76a9fa);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
    }
    #df-chat-send:hover { opacity: 0.85; transform: scale(1.05); }
    #df-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #df-chat-send svg { pointer-events: none; }

    #df-chat-disclaimer {
      text-align: center;
      font-size: 10.5px;
      color: rgba(255,255,255,0.2);
      padding: 0 14px 10px;
      flex-shrink: 0;
      font-family: inherit;
    }

    @keyframes df-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(34,94,170,0.5); }
      50% { box-shadow: 0 4px 28px rgba(34,94,170,0.75), 0 0 0 8px rgba(34,94,170,0.12); }
    }
    @keyframes df-badge-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes df-dot-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    @keyframes df-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

// ─── Inject HTML ───────────────────────────────────────────────────────────────
(function injectHTML() {
  document.body.insertAdjacentHTML('beforeend', `
    <button id="df-chat-btn" aria-label="Chat öffnen" title="Fragen? Ich helfe gerne!">
      <svg class="df-icon-chat" width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.377 3.114 1.047 4.453L2 22l5.547-1.047A9.953 9.953 0 0012 22z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="df-icon-close" width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span id="df-chat-badge" aria-hidden="true"></span>
    </button>
    <span id="df-chat-tooltip">Fragen zu Fenstern?</span>

    <div id="df-chat-window" role="dialog" aria-label="DeineFenster Chatbot" aria-modal="true">
      <div id="df-chat-header">
        <div id="df-chat-header-avatar">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" stroke-width="2"/>
            <path d="M9 9h6M9 13h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div id="df-chat-header-text">
          <div id="df-chat-header-name">DeineFenster Assistent</div>
          <div id="df-chat-header-sub">
            <span id="df-chat-header-dot"></span>
            Online · Antwortet sofort
          </div>
        </div>
        <button id="df-chat-close-btn" aria-label="Chat schließen">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="df-chat-messages" role="log" aria-live="polite" aria-label="Chat-Nachrichten">
        <!-- Begrüßung -->
        <div class="df-msg df-bot">
          <div class="df-msg-avatar">🪟</div>
          <div class="df-msg-bubble">
            Hallo! Ich bin der Fenster-Assistent von DeineFenster.de.<br><br>
            Ich helfe dir gerne bei Fragen zu Fenstern, Preisen, Lieferung oder unserem Hofverkauf. Was möchtest du wissen?
          </div>
        </div>
        <!-- Typing indicator -->
        <div id="df-typing" role="status" aria-label="Assistent tippt...">
          <div class="df-msg-avatar">🪟</div>
          <div id="df-typing-bubble">
            <span class="df-dot"></span>
            <span class="df-dot"></span>
            <span class="df-dot"></span>
          </div>
        </div>
      </div>

      <div id="df-chat-chips" aria-label="Schnellfragen">
        ${QUICK_CHIPS.map(c => `<button class="df-chip" data-q="${c.q}">${c.text}</button>`).join('')}
      </div>

      <div id="df-chat-input-area">
        <input id="df-chat-input" type="text" placeholder="Deine Frage eingeben…" autocomplete="off" maxlength="500" aria-label="Nachricht eingeben"/>
        <button id="df-chat-send" aria-label="Senden">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div id="df-chat-disclaimer">KI-Assistent · Angaben ohne Gewähr · Kein Rechtsrat</div>
    </div>
  `);
})();

// ─── Logic ─────────────────────────────────────────────────────────────────────
(function init() {
  const btn = document.getElementById('df-chat-btn');
  const win = document.getElementById('df-chat-window');
  const closeBtn = document.getElementById('df-chat-close-btn');
  const input = document.getElementById('df-chat-input');
  const sendBtn = document.getElementById('df-chat-send');
  const messagesEl = document.getElementById('df-chat-messages');
  const typingEl = document.getElementById('df-typing');
  const badge = document.getElementById('df-chat-badge');
  const tooltip = document.getElementById('df-chat-tooltip');
  const chips = document.getElementById('df-chat-chips');

  let isOpen = false;
  let isLoading = false;
  let conversationHistory = [];
  let tooltipTimer;
  let tooltipShown = false;

  // Tooltip nach 8s anzeigen
  tooltipTimer = setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltip.classList.add('df-visible');
      tooltipShown = true;
      setTimeout(() => tooltip.classList.remove('df-visible'), 5000);
    }
  }, 8000);

  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('df-open', isOpen);
    win.classList.toggle('df-visible', isOpen);
    badge.style.display = 'none';
    tooltip.classList.remove('df-visible');
    clearTimeout(tooltipTimer);
    if (isOpen) {
      setTimeout(() => input.focus(), 300);
      btn.setAttribute('aria-label', 'Chat schließen');
    } else {
      btn.setAttribute('aria-label', 'Chat öffnen');
    }
  }

  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Escape key closes chat
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggleChat();
  });

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(text, role) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `df-msg ${isUser ? 'df-user' : 'df-bot'}`;

    const bubble = document.createElement('div');
    bubble.className = 'df-msg-bubble';

    if (isUser) {
      bubble.textContent = text;
    } else {
      // Convert URLs to links in bot responses
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const linked = escaped.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      );
      bubble.innerHTML = linked;

      const avatar = document.createElement('div');
      avatar.className = 'df-msg-avatar';
      avatar.textContent = '🪟';
      div.appendChild(avatar);
    }

    div.appendChild(bubble);

    // Insert before typing indicator
    messagesEl.insertBefore(div, typingEl);
    scrollToBottom();
  }

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    input.disabled = state;
    typingEl.classList.toggle('df-show', state);
    scrollToBottom();
  }

  // Hide chips after first real interaction
  function hideChips() {
    if (chips) chips.style.display = 'none';
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    hideChips();
    appendMessage(text, 'user');
    input.value = '';
    setLoading(true);

    conversationHistory.push({ role: 'user', content: text });

    // Fallback wenn Worker URL nicht konfiguriert
    if (!WORKER_URL || WORKER_URL.includes('DEINE_CLOUDFLARE')) {
      setTimeout(() => {
        setLoading(false);
        appendMessage(
          'Der Chatbot ist noch nicht vollständig eingerichtet. Bitte ruf uns an: 03381 / 214 83 73 oder schreib uns auf WhatsApp: 0171 7263776.',
          'bot'
        );
      }, 800);
      return;
    }

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: conversationHistory.slice(-10) // max 10 Nachrichten Kontext
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const reply = data?.content?.[0]?.text || 'Entschuldigung, ich konnte keine Antwort generieren. Bitte ruf uns direkt an: 03381 / 214 83 73';

      conversationHistory.push({ role: 'assistant', content: reply });
      setLoading(false);
      appendMessage(reply, 'bot');

    } catch (err) {
      console.warn('[DeineFenster Chatbot]', err);
      setLoading(false);
      appendMessage(
        'Es gab leider einen technischen Fehler. Ruf uns bitte direkt an: 03381 / 214 83 73 oder schreib auf WhatsApp: 0171 7263776',
        'bot'
      );
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  // Quick chips
  chips.addEventListener('click', e => {
    const chip = e.target.closest('.df-chip');
    if (!chip) return;
    sendMessage(chip.dataset.q);
  });

  // Konfigurator-Seite: Tooltip-Ping nach 30s
  if (window.location.pathname.includes('konfigurator')) {
    setTimeout(() => {
      if (!isOpen && !tooltipShown) {
        tooltip.textContent = 'Fragen zur Konfiguration?';
        tooltip.classList.add('df-visible');
        tooltipShown = true;
        badge.style.display = 'block';
        setTimeout(() => tooltip.classList.remove('df-visible'), 6000);
      }
    }, 30000);
  }

})();
