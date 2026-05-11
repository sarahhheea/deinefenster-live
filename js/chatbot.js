/**
 * DeineFenster.de — KI-Chatbot Widget
 * Funktioniert sofort ohne API-Key (regelbasiert).
 * Mit Cloudflare Worker + Anthropic API-Key: echte KI-Antworten.
 *
 * UPGRADE AUF ECHTE KI:
 * 1. workers/claude-proxy.js auf Cloudflare deployen
 * 2. WORKER_URL unten eintragen — fertig
 */

const WORKER_URL = ''; // Leer lassen = regelbasierter Modus. Worker-URL eintragen für echte KI.

// ─── Regelbasierte Antworten ───────────────────────────────────────────────────
const RULES = [
  {
    keys: ['hallo','hi','hey','guten tag','moin','servus','guten morgen','guten abend'],
    answer: 'Hallo! Schön, dass du da bist. Ich helfe dir gerne bei Fragen zu Fenstern, Haustüren, Lieferung oder unserem Hofverkauf. Was möchtest du wissen?'
  },
  {
    keys: ['preis','kosten','kostet','teuer','günstig','angebot','rabatt','wie viel','wieviel','budget'],
    answer: 'Unsere Preise werden individuell nach Maß und Ausstattung berechnet — Pauschalpreise gibt es nicht. Das schnellste: einfach im <a href="konfigurator.html">Online-Konfigurator</a> deine Maße eingeben, da siehst du sofort was es kostet. Oder schreib uns direkt auf <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>.'
  },
  {
    keys: ['maß','messen','ausmessen','rohbaumaß','breite','höhe','maße','abmessung','wie groß','welche größe'],
    answer: 'Das Rohbaumaß ist die freie Öffnung im Mauerwerk — einfach die Breite × Höhe des Mauerlochs an 3 Stellen messen und den kleinsten Wert nehmen. Bei Austausch (alter Rahmen bleibt): Außenmaß des alten Rahmens nehmen. Im <a href="konfigurator.html">Konfigurator</a> gibst du dann einfach diese Maße ein.'
  },
  {
    keys: ['lieferung','liefern','lieferzeit','wann kommt','wann liefert','versand','zustellung','abholen'],
    answer: 'Drutex-Fenster nach Maß liefern wir frei Haus — Richtwert ca. 4–6 Wochen nach Bestelleingang (ohne Gewähr, da abhängig von Drutex-Produktion). Abholung direkt bei uns in Brandenburg ist ebenfalls möglich, nach Absprache.'
  },
  {
    keys: ['einbau','montage','montieren','einbauen','installieren','installation','handwerker','eingebaut'],
    answer: 'Wir bieten keinen Einbau an — nur Lieferung und Verkauf. Du brauchst also einen eigenen Fensterbauer oder Handwerker für die Montage. Bei Fragen zur Einbauart helfen wir dir aber gerne weiter: 03381 / 214 83 73.'
  },
  {
    keys: ['gebraucht','gebrauchte','occasion','second hand','hofverkauf','hof','abholen','besichtigen','vor ort'],
    answer: 'Gebrauchte Fenster findest du bei uns jeden <strong>Freitag 10–17 Uhr</strong> auf unserem Hof (Fohrder Landstraße 13, Brandenburg). Bestand wechselt — keine Reservierungen möglich, Selbstverladung. Bis 20 Uhr möglich nach tel. Voranmeldung: 03381 / 214 83 73.'
  },
  {
    keys: ['verkaufen','ankaufen','kauft ihr','nehmt ihr an','loswerden','entsorgen','alte fenster'],
    answer: 'Leider kaufen wir keine gebrauchten Fenster an. Für die Entsorgung alter Fenster ist in der Regel der örtliche Wertstoffhof zuständig.'
  },
  {
    keys: ['förderung','fördermittel','bafa','kfw','zuschuss','staatlich','subvention','förder','beg'],
    answer: 'Ja! Für unsere Dreifachverglasung gibt es die <strong>BAFA BEG EM Förderung</strong> — bis zu 15% der Materialkosten. Voraussetzung: U-Wert ≤ 0,95 W/m²K (erfüllen wir). Wichtig: Antrag <strong>vor</strong> der Bestellung stellen auf bafa.de. KfW Nr. 458 gilt nicht mehr für Einzelfenster.'
  },
  {
    keys: ['öffnungszeit','geöffnet','wann offen','wann da','freitag','öffnungszeiten','wann kann','besuch','kommen'],
    answer: 'Unser Hofverkauf ist jeden <strong>Freitag von 10 bis 17 Uhr</strong> geöffnet (Fohrder Landstraße 13, Brandenburg). Bis 20 Uhr nach tel. Voranmeldung: 03381 / 214 83 73. Sommerferien 2026: 01.08.–31.08. geschlossen. Mo–Do und Sa–So kein Hofverkauf.'
  },
  {
    keys: ['dreifach','3-fach','triple','drei','bessere dämmung','wärmedämmung','schallschutz','unterschied verglas'],
    answer: 'Dreifachverglasung (U-Wert bis 0,6 W/m²K) ist deutlich besser für Wohnräume und Schlafzimmer — ca. 20–30% teurer als 2-fach, aber BAFA-förderfähig und deutlich weniger Wärmeverlust. 2-fach reicht für Nebenräume oder Garagen. Für Neubauten und energetische Sanierungen empfehlen wir immer 3-fach.'
  },
  {
    keys: ['zweifach','2-fach','doppel','doppelverglas','doppelglas'],
    answer: '2-fach Verglasung ist günstiger und reicht gut für Nebenräume, Keller oder Garagen. U-Wert ca. 1,1 W/m²K. Für Wohnräume und Schlafzimmer empfehlen wir die Dreifachverglasung — die ist auch BAFA-förderfähig.'
  },
  {
    keys: ['kunststoff','pvc','plastik','kunststofffenster','material','holz','aluminium','alu','welches material'],
    answer: 'Wir führen ausschließlich <strong>Drutex Kunststoff-PVC-Fenster</strong>. Kunststoff ist pflegeleicht (kein Streichen nötig), feuchtigkeitsresistent und sehr langlebig (30–50 Jahre). Holz- oder Alufenster sind nicht in unserem Sortiment.'
  },
  {
    keys: ['drutex','hersteller','qualität','herkunft','woher','polnisch','polen','marke','werk'],
    answer: 'Drutex ist einer der größten Fensterhersteller Europas, mit Werk in Bytów/Polen. Wir sind autorisierter Drutex-Händler — alle Fenster kommen direkt vom Hersteller mit <strong>10 Jahren Garantie</strong>. Sehr hohes Qualitätsniveau bei fairen Preisen.'
  },
  {
    keys: ['haustür','haustüren','eingangstür','tür','türen','door'],
    answer: 'Ja, wir führen auch Drutex-Haustüren! Verschiedene Modelle und Farben verfügbar. Im <a href="haustuer-3d.html">Haustür-Konfigurator</a> kannst du Modell und Farbe direkt visualisieren. Bei Fragen: WhatsApp <a href="https://wa.me/491717263776" target="_blank">0171 7263776</a>.'
  },
  {
    keys: ['farbe','farben','ral','anthrazit','weiß','braun','grau','schwarz','golden oak','holzdekor'],
    answer: 'Neben Standard-Weiß haben wir viele RAL-Farben (z.B. Anthrazitgrau, Schwarzbraun, Moosgrün) und Holzdekore (z.B. Golden Oak, Sheffield Oak). Welche Farben genau verfügbar sind, siehst du im <a href="konfigurator.html">Konfigurator</a> oder frag direkt an.'
  },
  {
    keys: ['rollladen','rolladen','sonnenschutz','beschattung','jalousie','markise'],
    answer: 'Ja, wir führen auch Drutex-Rollladen und Sonnenschutz — passend zu den Fenstern. Ruf uns an oder schreib auf WhatsApp für ein Angebot: 03381 / 214 83 73 oder <a href="https://wa.me/491717263776" target="_blank">0171 7263776</a>.'
  },
  {
    keys: ['garantie','gewährleistung','reklamation','defekt','kaputt'],
    answer: 'Auf alle neuen Drutex-Fenster gibt es <strong>10 Jahre Herstellergarantie</strong> von Drutex. Bei Mängeln direkt bei uns melden — wir klären das mit dem Hersteller.'
  },
  {
    keys: ['konfigurator','online bestellen','bestellen','konfigurieren','selbst zusammenstellen'],
    answer: 'Im <a href="konfigurator.html">Online-Konfigurator</a> kannst du dein Fenster selbst zusammenstellen: Maße eingeben, Farbe wählen, Verglasung wählen — und siehst sofort den Preis. Anschließend kommt eine unverbindliche Anfrage zu uns.'
  },
  {
    keys: ['kontakt','telefon','anrufen','whatsapp','mail','email','schreiben','erreichbar','wie kann ich'],
    answer: 'Du erreichst uns so: 📞 Festnetz <a href="tel:+493381214837">03381 / 214 83 73</a> (Mo–Fr 10–18 Uhr) · 💬 <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a> (nur schreiben) · 📧 info@baustoffchrist.de'
  },
  {
    keys: ['adresse','standort','wo seid','wo sind','wo befindet','anfahrt','wie komme','navigation','maps'],
    answer: 'Wir sind in <strong>Brandenburg an der Havel</strong>: Fohrder Landstraße 13, 14772 Brandenburg a.d.H. Google Maps: einfach "Fensterhandel Christ Brandenburg" eingeben.'
  },
  {
    keys: ['danke','vielen dank','super','perfekt','toll','prima','klasse','gut','hilfreich'],
    answer: 'Gerne! Wenn du noch weitere Fragen hast oder ein konkretes Angebot möchtest, erreichst du uns unter 03381 / 214 83 73 oder per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>. Viel Erfolg bei deinem Fensterprojekt! 🪟'
  },
];

function ruleBasedAnswer(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const rule of RULES) {
    if (rule.keys.some(k => lower.includes(k))) {
      return rule.answer;
    }
  }
  return null;
}

// ─── Systemprompt für echte KI ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `Du bist der Kundenberater-Chatbot von Fensterhandel Christ (DeineFenster.de). Du hilfst Kunden bei Fragen zu Fenstern und Türen.

REGELN:
- Antworte IMMER auf Deutsch, kurz (max. 3–4 Sätze) und freundlich
- Nenne KEINE konkreten Preise — verweise auf Konfigurator oder WhatsApp
- Versprich KEINE konkreten Liefertermine — nur Richtwert "ca. 4–6 Wochen"
- Beantworte NUR Fragen zu Fenstern, Türen und unserem Unternehmen
- Nutze einfache Links wenn sinnvoll: konfigurator.html, haustuer-3d.html

UNTERNEHMEN: Fensterhandel Christ, Fohrder Landstraße 13, 14772 Brandenburg a.d.H.
Festnetz: 03381/214837 (Mo–Fr 10–18 Uhr) | WhatsApp: 0171 7263776 (nur schreiben)
Hofverkauf: Freitag 10–17 Uhr | Sommerferien 2026: 01.08.–31.08. geschlossen

PRODUKTE:
- Nur Drutex-Kunststofffenster (neu, Maßanfertigung, 10 Jahre Garantie)
- Gebrauchte Fenster: vor Ort freitags, keine Reservierungen, Selbstverladung
- Wir KAUFEN KEINE gebrauchten Fenster AN
- Kein Einbau — nur Lieferung/Verkauf
- Haustüren: Konfigurator unter haustuer-3d.html
- Farben: Weiß, viele RAL-Farben, Holzdekore
- Rollladen und Sonnenschutz auch erhältlich

FÖRDERUNG: BAFA BEG EM bis 15%, U-Wert ≤ 0,95 W/m²K, MUSS vor Bestellung beantragt werden

AUSMESSEN: Rohbaumaß = freie Mauerwerkslöffnung, Breite × Höhe, kleinsten Wert nehmen

2-fach vs 3-fach: 3-fach empfohlen für Wohnräume + BAFA-Förderung`;

const QUICK_CHIPS = [
  { text: 'Preis & Angebot', q: 'Wie bekomme ich ein Angebot für neue Fenster?' },
  { text: 'Fenster ausmessen', q: 'Wie messe ich mein Fenster richtig aus?' },
  { text: 'Lieferung & Einbau', q: 'Liefert ihr die Fenster und bietet ihr Einbau an?' },
  { text: 'Gebraucht kaufen', q: 'Wie kann ich bei euch gebrauchte Fenster kaufen?' },
  { text: 'BAFA-Förderung', q: 'Gibt es Förderung für neue Fenster?' },
  { text: 'Öffnungszeiten', q: 'Wann habt ihr geöffnet?' },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
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
    #df-chat-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(34,94,170,0.65); }
    #df-chat-btn.df-open { animation: none; background: linear-gradient(135deg,#1e3a8a,#225eaa); }
    #df-chat-btn svg { transition: opacity 0.15s; }
    #df-chat-btn .df-icon-close { display: none; }
    #df-chat-btn.df-open .df-icon-chat { display: none; }
    #df-chat-btn.df-open .df-icon-close { display: block; }
    #df-chat-badge {
      position: absolute; top: -3px; right: -3px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #ef4444; border: 2px solid #060e1e;
      animation: df-badge-pulse 2s infinite;
    }
    #df-chat-tooltip {
      position: absolute; right: 72px; bottom: 12px;
      white-space: nowrap; background: #0f1c30; color: #fff;
      font-size: 13px; font-weight: 600; padding: 8px 14px;
      border-radius: 12px; border: 1px solid rgba(118,169,250,0.25);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4); pointer-events: none;
      opacity: 0; transform: translateX(6px);
      transition: opacity 0.3s, transform 0.3s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    #df-chat-tooltip::after {
      content: ''; position: absolute; right: -6px; top: 50%;
      transform: translateY(-50%); border: 6px solid transparent;
      border-right: none; border-left-color: rgba(118,169,250,0.25);
    }
    #df-chat-tooltip.df-visible { opacity: 1; transform: translateX(0); }

    #df-chat-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 9999;
      width: 360px; max-width: calc(100vw - 32px);
      height: 520px; max-height: calc(100dvh - 120px);
      background: #060e1e; border: 1px solid rgba(118,169,250,0.2);
      border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(118,169,250,0.1);
      display: flex; flex-direction: column; overflow: hidden;
      transform: translateY(16px) scale(0.96); opacity: 0; pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      font-family: 'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif;
    }
    #df-chat-window.df-visible { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
    @media (max-width: 480px) {
      #df-chat-window { right:0; bottom:0; width:100%; max-width:100%; height:100dvh; max-height:100dvh; border-radius:20px 20px 0 0; }
      #df-chat-btn { bottom: 20px; right: 16px; }
    }

    #df-chat-header {
      background: linear-gradient(135deg,#0e1e3a 0%,#122a52 100%);
      border-bottom: 1px solid rgba(118,169,250,0.15);
      padding: 14px 16px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #df-chat-header-avatar {
      width: 38px; height: 38px; border-radius: 12px;
      background: linear-gradient(135deg,#225eaa,#76a9fa);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #df-chat-header-text { flex: 1; }
    #df-chat-header-name { font-weight: 700; font-size: 14px; color: #fff; letter-spacing: -0.01em; }
    #df-chat-header-sub {
      font-size: 11px; color: rgba(118,169,250,0.7);
      display: flex; align-items: center; gap: 5px; margin-top: 1px;
    }
    #df-chat-header-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: df-badge-pulse 2s infinite; }
    #df-chat-close-btn {
      width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.5); transition: background 0.15s, color 0.15s;
    }
    #df-chat-close-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

    #df-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth;
    }
    #df-chat-messages::-webkit-scrollbar { width: 4px; }
    #df-chat-messages::-webkit-scrollbar-thumb { background: rgba(118,169,250,0.2); border-radius: 2px; }

    .df-msg { display: flex; gap: 8px; align-items: flex-end; animation: df-msg-in 0.25s ease; }
    .df-msg.df-user { flex-direction: row-reverse; }
    .df-msg-bubble {
      max-width: 82%; padding: 10px 13px; border-radius: 16px;
      font-size: 13.5px; line-height: 1.55; word-break: break-word;
    }
    .df-msg.df-bot .df-msg-bubble {
      background: rgba(118,169,250,0.1); border: 1px solid rgba(118,169,250,0.15);
      color: rgba(255,255,255,0.88); border-bottom-left-radius: 4px;
    }
    .df-msg.df-user .df-msg-bubble {
      background: linear-gradient(135deg,#225eaa,#1e3a8a);
      color: #fff; border-bottom-right-radius: 4px;
    }
    .df-msg-bubble a { color: #76a9fa; text-decoration: underline; text-underline-offset: 2px; }
    .df-msg-avatar {
      width: 26px; height: 26px; border-radius: 8px;
      background: linear-gradient(135deg,#225eaa,#76a9fa);
      flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px;
    }

    #df-typing { display: none; align-items: flex-end; gap: 8px; }
    #df-typing.df-show { display: flex; }
    #df-typing-bubble {
      background: rgba(118,169,250,0.1); border: 1px solid rgba(118,169,250,0.15);
      border-bottom-left-radius: 4px; border-radius: 16px;
      padding: 10px 14px; display: flex; gap: 4px; align-items: center;
    }
    .df-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(118,169,250,0.6); animation: df-dot-bounce 1.2s infinite; }
    .df-dot:nth-child(2) { animation-delay: 0.2s; }
    .df-dot:nth-child(3) { animation-delay: 0.4s; }

    #df-chat-chips { padding: 0 12px 10px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
    .df-chip {
      padding: 5px 11px; border-radius: 20px; border: 1px solid rgba(118,169,250,0.25);
      background: rgba(118,169,250,0.06); color: rgba(118,169,250,0.85);
      font-size: 11.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s; font-family: inherit;
    }
    .df-chip:hover { background: rgba(118,169,250,0.15); border-color: rgba(118,169,250,0.5); color: #fff; }

    #df-chat-input-area {
      padding: 10px 12px 14px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; align-items: center; flex-shrink: 0;
    }
    #df-chat-input {
      flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 10px 14px; font-size: 13.5px; color: #fff;
      outline: none; font-family: inherit; transition: border-color 0.15s; min-height: 44px;
    }
    #df-chat-input::placeholder { color: rgba(255,255,255,0.3); }
    #df-chat-input:focus { border-color: rgba(118,169,250,0.5); }
    #df-chat-send {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg,#225eaa,#76a9fa);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
    }
    #df-chat-send:hover { opacity: 0.85; transform: scale(1.05); }
    #df-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    #df-chat-disclaimer {
      text-align: center; font-size: 10.5px; color: rgba(255,255,255,0.2);
      padding: 0 14px 10px; flex-shrink: 0; font-family: inherit;
    }

    @keyframes df-pulse {
      0%,100% { box-shadow: 0 4px 20px rgba(34,94,170,0.5); }
      50% { box-shadow: 0 4px 28px rgba(34,94,170,0.75), 0 0 0 8px rgba(34,94,170,0.12); }
    }
    @keyframes df-badge-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes df-dot-bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-5px); } }
    @keyframes df-msg-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  `;
  document.head.appendChild(style);
})();

// ─── HTML ──────────────────────────────────────────────────────────────────────
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
            <span id="df-chat-header-dot"></span>Online · Antwortet sofort
          </div>
        </div>
        <button id="df-chat-close-btn" aria-label="Chat schließen">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="df-chat-messages" role="log" aria-live="polite">
        <div class="df-msg df-bot">
          <div class="df-msg-avatar">🪟</div>
          <div class="df-msg-bubble">
            Hallo! Ich bin der Fenster-Assistent von DeineFenster.de.<br><br>
            Ich helfe dir bei Fragen zu Fenstern, Preisen, Lieferung oder dem Hofverkauf. Was möchtest du wissen?
          </div>
        </div>
        <div id="df-typing">
          <div class="df-msg-avatar">🪟</div>
          <div id="df-typing-bubble">
            <span class="df-dot"></span><span class="df-dot"></span><span class="df-dot"></span>
          </div>
        </div>
      </div>

      <div id="df-chat-chips">
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
      <div id="df-chat-disclaimer">Fenster-Assistent · Angaben ohne Gewähr</div>
    </div>
  `);
})();

// ─── Logic ─────────────────────────────────────────────────────────────────────
(function init() {
  const btn      = document.getElementById('df-chat-btn');
  const win      = document.getElementById('df-chat-window');
  const closeBtn = document.getElementById('df-chat-close-btn');
  const input    = document.getElementById('df-chat-input');
  const sendBtn  = document.getElementById('df-chat-send');
  const messages = document.getElementById('df-chat-messages');
  const typing   = document.getElementById('df-typing');
  const badge    = document.getElementById('df-chat-badge');
  const tooltip  = document.getElementById('df-chat-tooltip');
  const chips    = document.getElementById('df-chat-chips');

  let isOpen = false;
  let isLoading = false;
  let history = []; // für echte KI
  let tooltipShown = false;

  // Tooltip nach 8s
  setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltip.classList.add('df-visible');
      tooltipShown = true;
      setTimeout(() => tooltip.classList.remove('df-visible'), 5000);
    }
  }, 8000);

  // Konfigurator: Ping nach 30s
  if (window.location.pathname.includes('konfigurator')) {
    setTimeout(() => {
      if (!isOpen) {
        tooltip.textContent = 'Fragen zur Konfiguration?';
        tooltip.classList.add('df-visible');
        badge.style.display = 'block';
        tooltipShown = true;
        setTimeout(() => tooltip.classList.remove('df-visible'), 6000);
      }
    }, 30000);
  }

  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('df-open', isOpen);
    win.classList.toggle('df-visible', isOpen);
    badge.style.display = 'none';
    tooltip.classList.remove('df-visible');
    if (isOpen) setTimeout(() => input.focus(), 300);
    btn.setAttribute('aria-label', isOpen ? 'Chat schließen' : 'Chat öffnen');
  }

  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) toggleChat(); });

  function scrollBottom() { messages.scrollTop = messages.scrollHeight; }

  function addMsg(html, role) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `df-msg ${isUser ? 'df-user' : 'df-bot'}`;
    const bubble = document.createElement('div');
    bubble.className = 'df-msg-bubble';
    if (isUser) {
      bubble.textContent = html;
    } else {
      bubble.innerHTML = html;
      const av = document.createElement('div');
      av.className = 'df-msg-avatar';
      av.textContent = '🪟';
      div.appendChild(av);
    }
    div.appendChild(bubble);
    messages.insertBefore(div, typing);
    scrollBottom();
  }

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    input.disabled = state;
    typing.classList.toggle('df-show', state);
    scrollBottom();
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    chips.style.display = 'none';
    addMsg(text, 'user');
    input.value = '';
    setLoading(true);

    // Delay simuliert Nachdenken
    const delay = 400 + Math.random() * 400;

    // ── Regelbasierter Modus (kein Worker) ──
    if (!WORKER_URL) {
      await new Promise(r => setTimeout(r, delay));
      setLoading(false);
      const answer = ruleBasedAnswer(text);
      if (answer) {
        addMsg(answer, 'bot');
      } else {
        addMsg(
          'Zu dieser Frage habe ich leider keine direkte Antwort. Ruf uns gerne an: <a href="tel:+493381214837">03381 / 214 83 73</a> (Mo–Fr 10–18 Uhr) oder schreib auf <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a> — wir helfen schnell weiter!',
          'bot'
        );
      }
      return;
    }

    // ── Echter KI-Modus (Worker konfiguriert) ──
    history.push({ role: 'user', content: text });
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: history.slice(-10)
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.content?.[0]?.text || 'Entschuldigung, keine Antwort erhalten. Bitte ruf uns an: 03381 / 214 83 73';
      history.push({ role: 'assistant', content: reply });
      setLoading(false);
      // Einfache URL-Verlinkung
      const linked = reply.replace(/&/g,'&amp;').replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
      addMsg(linked, 'bot');
    } catch (err) {
      console.warn('[Chatbot]', err);
      setLoading(false);
      addMsg('Technischer Fehler. Bitte ruf uns direkt an: <a href="tel:+493381214837">03381 / 214 83 73</a>', 'bot');
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); } });
  chips.addEventListener('click', e => { const c = e.target.closest('.df-chip'); if (c) sendMessage(c.dataset.q); });
})();
