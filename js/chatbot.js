/**
 * DeineFenster.de — KI-Chatbot Widget
 * Regelbasiert (sofort funktionsfähig) · Upgrade auf echte KI via Cloudflare Worker möglich.
 */

const WORKER_URL = ''; // Leer = regelbasierter Modus. Worker-URL eintragen für echte KI.

// ─── Regelwerk (aus echten Website-Inhalten) ───────────────────────────────────
const RULES = [
  {
    keys: ['hallo','hi','hey','guten tag','moin','guten morgen','guten abend','servus'],
    answer: 'Hallo! Schön, dass du da bist. 👋 Ich bin der KI-Assistent von DeineFenster.de und helfe dir bei Fragen zu Fenstern, Preisen, Lieferung oder unserem Hofverkauf. Was möchtest du wissen?'
  },

  // ── Preise ──────────────────────────────────────────────────────────────────
  {
    keys: ['preis','kosten','kostet','wie viel','wieviel','teuer','günstig','angebot','budget','ab welchem'],
    answer: 'Ein Drutex-Standardfenster (1-flügelig, ca. 1000×1200 mm, weiß, 2-fach) startet <strong>ab ca. 99 €</strong>. Das IGLO Energy mit 3-fach Verglasung liegt bei <strong>220–280 €</strong>. Den genauen Preis berechnet der <a href="konfigurator.html">Konfigurator live</a> — abhängig von Maßen, Profil, Farbe und Extras. Angaben ohne Gewähr.'
  },

  // ── Lieferkosten ────────────────────────────────────────────────────────────
  {
    keys: ['lieferkosten','versandkosten','versand kostet','porto','wie viel kostet die lieferung'],
    answer: 'Lieferung deutschlandweit per Spedition (mit eigenem Stapler). <strong>Kostenlos</strong> ab 4.000 € Bestellwert oder ab 10 Fensterelementen. Bei 5–9 Elementen: <strong>200 € Versandpauschale</strong>. Einzelne Hebeschiebetür: 300 €. Lagerware und Gebrauchtware: <strong>nur Selbstabholung</strong> in Brandenburg.'
  },

  // ── Lieferzeit ──────────────────────────────────────────────────────────────
  {
    keys: ['lieferzeit','wann kommt','wann liefert','wie lange','lieferung','liefern','versand','zustellung','wann fertig'],
    answer: 'Drutex-Fenster werden nach Maß gefertigt — Lieferzeit in der Regel <strong>2–4 Wochen</strong> ab Auftragsbestätigung. Versand per Spedition deutschlandweit (LKW mit eigenem Stapler). Lagerware aus unserem Shop: <strong>nur Selbstabholung</strong> in Brandenburg a.d.H.'
  },

  // ── Einbau ──────────────────────────────────────────────────────────────────
  {
    keys: ['einbau','montage','montieren','einbauen','installieren','wer baut','monteur','handwerker'],
    answer: 'Wir liefern und verkaufen — <strong>Einbau bieten wir selbst nicht an</strong>. Du beauftragst einen Handwerker deiner Wahl. Auf Wunsch können wir Montage-Partner in deiner Region vermitteln — einfach per <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a> anfragen. Wichtig: Nicht-fachgerechte Montage lässt die Garantie erlöschen.'
  },

  // ── Aufmaß / Messen ─────────────────────────────────────────────────────────
  {
    keys: ['maß','messen','ausmessen','rohbaumaß','breite','höhe','aufmaß','wie messe','mauer','öffnung'],
    answer: 'Du misst das <strong>Rohbaumaß</strong> — die freie Maueröffnung ohne Putz. An 3 Stellen (oben/Mitte/unten) messen, den kleinsten Wert nehmen. Fenster werden 10–20 mm kleiner gefertigt. Bei Unsicherheit: kostenloses Aufmaß-Angebot per <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>. Du trägst das Risiko bei selbst gemessenem Aufmaß — daher lieber einmal mehr nachmessen!'
  },

  // ── Fehlmessung / Haftung ───────────────────────────────────────────────────
  {
    keys: ['falsch gemessen','fehlmessung','haftet','haftung','falsches maß','wer haftet'],
    answer: 'Bei selbst gemessenem Aufmaß liegt das Risiko bei dir — Fenster werden mm-genau nach deinen Angaben gefertigt. Deshalb: zweimal messen (oben/unten und links/rechts), kleineres Maß nehmen. Für größere Projekte empfehlen wir ein <strong>kostenloses Aufmaß-Angebot</strong> per <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>.'
  },

  // ── Zahlung ─────────────────────────────────────────────────────────────────
  {
    keys: ['zahlen','zahlung','bezahlen','zahlungsart','überweisung','paypal','kreditkarte','anzahlung','ratenzahlung','rate'],
    answer: 'Online-Bestellung: <strong>100% Anzahlung</strong> nach Auftragsbestätigung (erst dann Produktionsfreigabe). Zahlungsarten: Banküberweisung, PayPal, Kreditkarte (Visa/Mastercard), bar vor Ort. <strong>Ratenzahlung ist nicht möglich.</strong> Vor-Ort-Abholung: Zahlung vor oder bei Abholung.'
  },

  // ── Gebrauchte kaufen ───────────────────────────────────────────────────────
  {
    keys: ['gebraucht','gebrauchte','occasion','hofverkauf','hof','besichtigen','vor ort','second hand','lagerware','lagerfenster'],
    answer: 'Gebrauchte Fenster (wechselnder Bestand) gibt es bei uns jeden <strong>Freitag 10–17 Uhr</strong> auf dem Hof (Fohrder Landstraße 13, Brandenburg). Kein Vorabverkauf, keine Reservierungen — Selbstverladung, eigenes Fahrzeug mitbringen. Bis 20 Uhr möglich nach tel. Voranmeldung: <a href="tel:+493381214837">03381 / 214 83 73</a>.'
  },

  // ── Gebrauchte verkaufen ────────────────────────────────────────────────────
  {
    keys: ['verkaufen','ankaufen','kauft ihr','nehmt ihr','loswerden','alte fenster abgeben','alte fenster'],
    answer: 'Wir kaufen <strong>keine</strong> gebrauchten Fenster an. Für die Entsorgung ist der örtliche Wertstoffhof zuständig — PVC-Fenster können dort kostenlos abgegeben werden.'
  },

  // ── Förderung / BAFA / KfW ──────────────────────────────────────────────────
  {
    keys: ['förderung','fördermittel','bafa','kfw','zuschuss','staatlich','subvention','beg','förderfähig'],
    answer: 'Ja! Für <strong>IGLO Energy (Uw 0,71)</strong> und <strong>IGLO Edge (Uw 0,66)</strong> gibt es <strong>BAFA BEG EM</strong> — bis zu 15% Zuschuss. Wichtig: Antrag <strong>vor</strong> der Bestellung stellen auf bafa.de. KfW Nr. 458 gilt <strong>nicht mehr</strong> für Einzelfenster. IGLO 5 Classic (Uw 0,83) ist lt. aktueller Richtlinie nicht förderfähig. Angaben ohne Gewähr — bitte bafa.de prüfen.'
  },

  // ── Öffnungszeiten ──────────────────────────────────────────────────────────
  {
    keys: ['öffnungszeit','geöffnet','wann offen','wann da','freitag','öffnen','besuch','kommen wann','wann kann'],
    answer: 'Unser <strong>Hofverkauf</strong> ist jeden Freitag von <strong>10 bis 17 Uhr</strong> geöffnet (Fohrder Landstraße 13, Brandenburg). Bis 20 Uhr nach telefonischer Voranmeldung: <a href="tel:+493381214837">03381 / 214 83 73</a>. Mo–Do und Sa–So kein Hofverkauf. <strong>Sommerferien 2026: 01.08.–31.08. geschlossen.</strong>'
  },

  // ── IGLO Energy / Produktmodelle ────────────────────────────────────────────
  {
    keys: ['iglo energy','iglo edge','iglo 5','7-kammer','passivhaus','profil','einbautiefe','82 mm'],
    answer: '<strong>IGLO Energy</strong>: 7-Kammer, 82 mm Einbautiefe, Uw 0,71 W/m²K — Passivhaus-tauglich und BAFA-förderfähig. <strong>IGLO Edge</strong>: Uw 0,66, Premium. <strong>IGLO 5 Classic</strong>: Einstiegsmodell, Uw 0,83 — günstig, nicht BAFA-förderfähig. Alle Profile: Klasse A nach EN 12608 (3 mm Wandstärke — höchste Qualitätsstufe).'
  },

  // ── 3-fach vs 2-fach ────────────────────────────────────────────────────────
  {
    keys: ['dreifach','3-fach','triple','doppel','2-fach','zweifach','verglasung','uw-wert','u-wert','wärmeschutz','schallschutz','dämmung'],
    answer: '<strong>2-fach</strong> (Uw ca. 1,1): günstiger, reicht für Nebenräume/Keller. <strong>3-fach</strong> (Uw bis 0,66): empfohlen für Wohnräume, Schlafzimmer, BAFA-Förderung — ca. 20–30% Aufpreis, aber deutlich weniger Wärmeverlust. Für Sanierungen und Neubauten empfehlen wir 3-fach.'
  },

  // ── Einbruchschutz ──────────────────────────────────────────────────────────
  {
    keys: ['einbruch','rc2','rc1','sicherheit','einbruchsicher','pilzkopf','sicherheitsglas','p4a'],
    answer: 'Standard ist <strong>RC1N</strong> (Grundschutz). <strong>RC2</strong> ist im Konfigurator als Option wählbar — beinhaltet verstärkte Pilzkopfzapfen-Beschläge und VSG-Sicherheitsglas P4A. Polizei empfiehlt RC2 für EG-Fenster und leicht zugängliche Türen. <strong>RC3</strong> (noch höherer Schutz) ebenfalls verfügbar.'
  },

  // ── Garantie ────────────────────────────────────────────────────────────────
  {
    keys: ['garantie','gewährleistung','reklamation','defekt','kaputt','mangel','versicherung'],
    answer: 'Drutex-Herstellergarantie: <strong>10 Jahre Profil</strong> (Verzug, Vergilbung, Versprödung) + <strong>5 Jahre Beschlag</strong> (Mechanik) + 2 Jahre gesetzliche Gewährleistung. Nicht abgedeckt: Schäden durch unfachgemäße Montage, Transportschäden (sofort bei Anlieferung melden!), Kratzer durch Bauarbeiten.'
  },

  // ── Deutschlandweite Lieferung ──────────────────────────────────────────────
  {
    keys: ['deutschlandweit','ganz deutschland','bundesweit','liefert ihr nach','wohnort','entfernung'],
    answer: 'Ja, wir liefern <strong>deutschlandweit</strong> per Spedition (Neubestellungen/Maßware). Lagerware und Gebrauchtware: nur Selbstabholung in Brandenburg an der Havel. Lieferkosten: kostenlos ab 4.000 € oder 10 Elementen, sonst 200 € Versandpauschale.'
  },

  // ── Material ────────────────────────────────────────────────────────────────
  {
    keys: ['kunststoff','pvc','material','holz','aluminium','alu','welches material','unterschied material'],
    answer: 'Wir führen ausschließlich <strong>Drutex Kunststoff-PVC-Fenster</strong>. Kunststoff ist pflegeleicht (kein Streichen nötig), feuchtigkeitsresistent und langlebig (30–50 Jahre). Holz- oder Aluminiumfenster sind nicht in unserem Sortiment.'
  },

  // ── Drutex ──────────────────────────────────────────────────────────────────
  {
    keys: ['drutex','hersteller','qualität','herkunft','woher','polnisch','bytów','marke','werk','europas größter'],
    answer: '<strong>Drutex</strong> ist Europas größter PVC-Fenster-Hersteller mit eigenem Glaswerk und Profil-Extrusion in Bytów/Polen. Alle Profile Klasse A nach EN 12608 — das höchste Qualitätsniveau. Direktlieferung vom Werk = 20–30% günstiger als marktüblich. Wir sind autorisierter Drutex-Händler.'
  },

  // ── Haustüren ───────────────────────────────────────────────────────────────
  {
    keys: ['haustür','haustüren','eingangstür','tür ','türen','außentür'],
    answer: 'Ja, wir führen auch <strong>Drutex-Haustüren</strong> — verschiedene Modelle und Farben (inkl. RAL-Farben und Holzdekore). Im <a href="haustuer-3d.html">Haustür-3D-Konfigurator</a> kannst du Modell und Farbe direkt visualisieren. Für ein Angebot: <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>.'
  },

  // ── Farben ──────────────────────────────────────────────────────────────────
  {
    keys: ['farbe','farben','ral','anthrazit','weiß','braun','grau','schwarz','golden oak','holzdekor','farbig'],
    answer: 'Neben Standard-Weiß gibt es viele <strong>RAL-Farben</strong> (z.B. Anthrazitgrau RAL 7016, Schwarzbraun RAL 8022, Moosgrün) und <strong>Holzdekore</strong> (z.B. Golden Oak, Sheffield Oak). Welche genau verfügbar sind, siehst du im <a href="konfigurator.html">Konfigurator</a> oder frag direkt an.'
  },

  // ── Rollladen ───────────────────────────────────────────────────────────────
  {
    keys: ['rollladen','rolladen','sonnenschutz','beschattung','jalousie'],
    answer: 'Ja, wir führen auch <strong>Drutex-Rollladen und Sonnenschutz</strong> — passend zu den Fenstern. Für ein Angebot ruf uns an (<a href="tel:+493381214837">03381 / 214 83 73</a>) oder schreib auf <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── Konfigurator / Bestellung ───────────────────────────────────────────────
  {
    keys: ['konfigurator','online bestellen','bestellen','konfigurieren','zusammenstellen','online kaufen'],
    answer: 'Im <a href="konfigurator.html">Online-Konfigurator</a> Maße eingeben, Farbe und Verglasung wählen — Preis erscheint live. Danach kommt eine unverbindliche Anfrage zu uns, wir bestätigen und du bekommst die Zahlungsaufforderung. <strong>Produktion startet erst nach 100% Anzahlung.</strong>'
  },

  // ── Kontakt / Erreichbarkeit ────────────────────────────────────────────────
  {
    keys: ['kontakt','telefon','anrufen','whatsapp','mail','email','erreichbar','wie kann ich','wann erreichbar'],
    answer: '📞 <a href="tel:+493381214837"><strong>03381 / 214 83 73</strong></a> — Festnetz, Mo–Fr 10–18 Uhr<br>💬 <a href="https://wa.me/491717263776" target="_blank"><strong>WhatsApp 0171 7263776</strong></a> — nur schreiben (kein Anruf)<br>📧 info@baustoffchrist.de — Antwort i.d.R. innerhalb 24h'
  },

  // ── Adresse / Anfahrt ───────────────────────────────────────────────────────
  {
    keys: ['adresse','standort','wo seid','wo sind','wo befindet','anfahrt','wie komme','navigation','google maps','hinfahren'],
    answer: '<strong>Fohrder Landstraße 13, 14772 Brandenburg an der Havel.</strong> Google Maps: "Fensterhandel Christ Brandenburg" eingeben. Hofverkauf freitags 10–17 Uhr — kein Termin nötig.'
  },

  // ── Sprossen / Sonderform ───────────────────────────────────────────────────
  {
    keys: ['sprosse','sprossen','rund','bogenfenster','sonderform','rundbogen','dreieck','trapez'],
    answer: 'Sprossen sind im <a href="konfigurator.html">Konfigurator</a> als Extra-Option wählbar. Sonderformen (Rundbogen, Dreieck, Trapez) sind auf Anfrage möglich — direkt per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> oder Telefon anfragen, da diese nicht im Standard-Konfigurator abgedeckt sind.'
  },

  // ── Danke / Abschluss ───────────────────────────────────────────────────────
  {
    keys: ['danke','vielen dank','super','perfekt','toll','prima','klasse','gut','hilfreich','hat geholfen'],
    answer: 'Gerne! 😊 Wenn du noch mehr Fragen hast oder ein konkretes Angebot möchtest: <a href="tel:+493381214837">03381 / 214 83 73</a> oder <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>. Viel Erfolg bei deinem Fenster-Projekt!'
  },
];

function ruleBasedAnswer(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const rule of RULES) {
    if (rule.keys.some(k => lower.includes(k))) return rule.answer;
  }
  return null;
}

// ─── System-Prompt für echte KI ────────────────────────────────────────────────
const SYSTEM_PROMPT = `Du bist der KI-Assistent von DeineFenster.de (Fensterhandel Christ, Brandenburg). Antworte auf Deutsch, kurz (max. 4 Sätze), freundlich und kompetent.

REGELN: Keine genauen Preisversprechen außer Richtwerten (ab 99€ Standard, 220-280€ IGLO Energy). Keine genauen Lieferdaten. Nur Fenster/Türen-Themen. Bei Unsicherheit: Telefon oder WhatsApp empfehlen.

FIRMA: Fohrder Landstraße 13, 14772 Brandenburg a.d.H. | Tel: 03381/214837 (Mo-Fr 10-18h) | WhatsApp: 0171 7263776 (nur schreiben) | Hofverkauf: Freitag 10-17h | Sommerferien 2026: 01.08-31.08 zu

PRODUKTE: Nur Drutex PVC-Fenster (neu+Maß) + Gebrauchtware (nur Freitag vor Ort). IGLO Energy (7-Kammer, Uw 0,71, BAFA-förderfähig), IGLO Edge (Uw 0,66), IGLO 5 Classic (Uw 0,83, nicht BAFA). 10J Profil-Garantie + 5J Beschlag. Kein Einbau. Kein Ankauf gebraucht. RC2/RC3 als Option. Deutschlandweit liefern (kostenlos ab 4000€ oder 10 Elemente). 100% Anzahlung online. BAFA BEG EM bis 15%, Antrag VOR Bestellung.`;

const QUICK_CHIPS = [
  { text: 'Preis & Angebot',   q: 'Was kostet ein Fenster ungefähr?' },
  { text: 'Fenster ausmessen', q: 'Wie messe ich mein Fenster richtig aus?' },
  { text: 'Lieferung',         q: 'Wie lange dauert die Lieferung und was kostet sie?' },
  { text: 'Gebraucht kaufen',  q: 'Wie kann ich bei euch gebrauchte Fenster kaufen?' },
  { text: 'BAFA Förderung',    q: 'Welche Fenster sind BAFA-förderfähig?' },
  { text: 'Öffnungszeiten',    q: 'Wann habt ihr geöffnet?' },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
(function injectCSS() {
  const s = document.createElement('style');
  s.textContent = `
    #df-chat-label {
      position:fixed;bottom:34px;right:92px;z-index:9997;
      background:#0f1c30;color:#fff;font-size:13px;font-weight:700;
      padding:7px 14px 7px 12px;border-radius:30px;
      border:1px solid rgba(118,169,250,0.3);
      box-shadow:0 4px 16px rgba(0,0,0,0.35);
      display:flex;align-items:center;gap:7px;
      cursor:pointer;white-space:nowrap;
      font-family:'Plus Jakarta Sans','Manrope',system-ui,sans-serif;
      animation:df-label-in 0.4s 1.5s both;
      transition:opacity 0.2s,transform 0.2s,background 0.15s;
    }
    #df-chat-label:hover{background:#172a4a;border-color:rgba(118,169,250,0.55);}
    #df-chat-label.df-hidden{opacity:0;pointer-events:none;transform:translateX(6px);}
    #df-chat-label-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;flex-shrink:0;animation:df-badge-pulse 2s infinite;}
    #df-chat-label-ki{font-size:10px;font-weight:800;background:linear-gradient(135deg,#225eaa,#76a9fa);color:#fff;padding:1px 6px;border-radius:6px;letter-spacing:0.05em;}

    #df-chat-btn {
      position:fixed;bottom:24px;right:24px;z-index:9998;
      width:60px;height:60px;border-radius:50%;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      box-shadow:0 4px 20px rgba(34,94,170,0.5);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;border:none;
      transition:transform 0.2s,box-shadow 0.2s;
      animation:df-pulse 3s infinite;
    }
    #df-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(34,94,170,0.65);}
    #df-chat-btn.df-open{animation:none;background:linear-gradient(135deg,#1e3a8a,#225eaa);}
    #df-chat-btn .df-icon-close{display:none;}
    #df-chat-btn.df-open .df-icon-chat{display:none;}
    #df-chat-btn.df-open .df-icon-close{display:block;}
    #df-chat-badge{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid #060e1e;animation:df-badge-pulse 2s infinite;}
    #df-chat-tooltip{
      position:absolute;right:72px;bottom:12px;white-space:nowrap;
      background:#0f1c30;color:#fff;font-size:13px;font-weight:600;
      padding:8px 14px;border-radius:12px;border:1px solid rgba(118,169,250,0.25);
      box-shadow:0 4px 16px rgba(0,0,0,0.4);pointer-events:none;
      opacity:0;transform:translateX(6px);transition:opacity 0.3s,transform 0.3s;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    #df-chat-tooltip::after{content:'';position:absolute;right:-6px;top:50%;transform:translateY(-50%);border:6px solid transparent;border-right:none;border-left-color:rgba(118,169,250,0.25);}
    #df-chat-tooltip.df-visible{opacity:1;transform:translateX(0);}

    #df-chat-window{
      position:fixed;bottom:96px;right:24px;z-index:9999;
      width:370px;max-width:calc(100vw - 32px);
      height:540px;max-height:calc(100dvh - 120px);
      background:#060e1e;border:1px solid rgba(118,169,250,0.2);
      border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(118,169,250,0.1);
      display:flex;flex-direction:column;overflow:hidden;
      transform:translateY(16px) scale(0.96);opacity:0;pointer-events:none;
      transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.2s ease;
      font-family:'Plus Jakarta Sans','Manrope',system-ui,sans-serif;
    }
    #df-chat-window.df-visible{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}
    @media(max-width:480px){
      #df-chat-window{right:0;bottom:0;width:100%;max-width:100%;height:100dvh;max-height:100dvh;border-radius:20px 20px 0 0;}
      #df-chat-btn{bottom:20px;right:16px;}
      #df-chat-label{bottom:28px;right:84px;font-size:12px;padding:6px 12px 6px 10px;}
    }

    #df-chat-header{
      background:linear-gradient(135deg,#0e1e3a 0%,#122a52 100%);
      border-bottom:1px solid rgba(118,169,250,0.15);
      padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;
    }
    #df-chat-header-avatar{
      width:40px;height:40px;border-radius:12px;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    #df-chat-header-text{flex:1;}
    #df-chat-header-name{font-weight:700;font-size:14px;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;}
    #df-chat-header-ki{font-size:9px;font-weight:800;background:linear-gradient(135deg,#225eaa,#76a9fa);color:#fff;padding:2px 6px;border-radius:5px;letter-spacing:0.08em;text-transform:uppercase;}
    #df-chat-header-sub{font-size:11px;color:rgba(118,169,250,0.7);display:flex;align-items:center;gap:5px;margin-top:2px;}
    #df-chat-header-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:df-badge-pulse 2s infinite;}
    #df-chat-close-btn{
      width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);
      border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
      color:rgba(255,255,255,0.5);transition:background 0.15s,color 0.15s;
    }
    #df-chat-close-btn:hover{background:rgba(255,255,255,0.12);color:#fff;}

    #df-chat-messages{
      flex:1;overflow-y:auto;padding:16px 14px;
      display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth;
    }
    #df-chat-messages::-webkit-scrollbar{width:4px;}
    #df-chat-messages::-webkit-scrollbar-thumb{background:rgba(118,169,250,0.2);border-radius:2px;}

    .df-msg{display:flex;gap:8px;align-items:flex-end;animation:df-msg-in 0.25s ease;}
    .df-msg.df-user{flex-direction:row-reverse;}
    .df-msg-bubble{max-width:84%;padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.58;word-break:break-word;}
    .df-msg.df-bot .df-msg-bubble{background:rgba(118,169,250,0.1);border:1px solid rgba(118,169,250,0.15);color:rgba(255,255,255,0.88);border-bottom-left-radius:4px;}
    .df-msg.df-user .df-msg-bubble{background:linear-gradient(135deg,#225eaa,#1e3a8a);color:#fff;border-bottom-right-radius:4px;}
    .df-msg-bubble a{color:#76a9fa;text-decoration:underline;text-underline-offset:2px;}
    .df-msg-avatar{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#225eaa,#76a9fa);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;}

    #df-typing{display:none;align-items:flex-end;gap:8px;}
    #df-typing.df-show{display:flex;}
    #df-typing-bubble{background:rgba(118,169,250,0.1);border:1px solid rgba(118,169,250,0.15);border-bottom-left-radius:4px;border-radius:16px;padding:10px 14px;display:flex;gap:4px;align-items:center;}
    .df-dot{width:7px;height:7px;border-radius:50%;background:rgba(118,169,250,0.6);animation:df-dot-bounce 1.2s infinite;}
    .df-dot:nth-child(2){animation-delay:0.2s;}
    .df-dot:nth-child(3){animation-delay:0.4s;}

    #df-chat-chips{padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;}
    .df-chip{
      padding:5px 11px;border-radius:20px;border:1px solid rgba(118,169,250,0.25);
      background:rgba(118,169,250,0.06);color:rgba(118,169,250,0.85);
      font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap;
      transition:background 0.15s,border-color 0.15s,color 0.15s;font-family:inherit;
    }
    .df-chip:hover{background:rgba(118,169,250,0.15);border-color:rgba(118,169,250,0.5);color:#fff;}

    #df-chat-input-area{
      padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,0.06);
      display:flex;gap:8px;align-items:center;flex-shrink:0;
    }
    #df-chat-input{
      flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
      border-radius:12px;padding:10px 14px;font-size:13.5px;color:#fff;
      outline:none;font-family:inherit;transition:border-color 0.15s;min-height:44px;
    }
    #df-chat-input::placeholder{color:rgba(255,255,255,0.3);}
    #df-chat-input:focus{border-color:rgba(118,169,250,0.5);}
    #df-chat-send{
      width:44px;height:44px;border-radius:12px;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:opacity 0.15s,transform 0.15s;
    }
    #df-chat-send:hover{opacity:0.85;transform:scale(1.05);}
    #df-chat-send:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
    #df-chat-disclaimer{text-align:center;font-size:10.5px;color:rgba(255,255,255,0.2);padding:0 14px 10px;flex-shrink:0;font-family:inherit;}

    @keyframes df-pulse{0%,100%{box-shadow:0 4px 20px rgba(34,94,170,0.5);}50%{box-shadow:0 4px 28px rgba(34,94,170,0.75),0 0 0 8px rgba(34,94,170,0.12);}}
    @keyframes df-badge-pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
    @keyframes df-dot-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
    @keyframes df-msg-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes df-label-in{from{opacity:0;transform:translateX(10px);}to{opacity:1;transform:translateX(0);}}
  `;
  document.head.appendChild(s);
})();

// ─── HTML ──────────────────────────────────────────────────────────────────────
(function injectHTML() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="df-chat-label" role="button" tabindex="0" aria-label="KI-Chatbot öffnen">
      <span id="df-chat-label-dot"></span>
      Fragen? Ich helfe!
      <span id="df-chat-label-ki">KI</span>
    </div>

    <button id="df-chat-btn" aria-label="KI-Chatbot öffnen" title="KI-Chatbot — Fragen zu Fenstern">
      <svg class="df-icon-chat" width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.377 3.114 1.047 4.453L2 22l5.547-1.047A9.953 9.953 0 0012 22z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="df-icon-close" width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span id="df-chat-badge" aria-hidden="true"></span>
    </button>
    <span id="df-chat-tooltip">Fenster-Fragen? Ich weiß alles!</span>

    <div id="df-chat-window" role="dialog" aria-label="DeineFenster KI-Chatbot" aria-modal="true">
      <div id="df-chat-header">
        <div id="df-chat-header-avatar">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v2a2 2 0 01-2 2h-.17A6.001 6.001 0 0112 16a6.001 6.001 0 01-4.83-5H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2z" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="9.5" cy="10.5" r="1" fill="#fff"/>
            <circle cx="14.5" cy="10.5" r="1" fill="#fff"/>
            <path d="M9 21h6M12 16v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div id="df-chat-header-text">
          <div id="df-chat-header-name">
            Fenster-Assistent
            <span id="df-chat-header-ki">KI</span>
          </div>
          <div id="df-chat-header-sub">
            <span id="df-chat-header-dot"></span>KI-gestützt · Antwortet sofort
          </div>
        </div>
        <button id="df-chat-close-btn" aria-label="Chat schließen">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div id="df-chat-messages" role="log" aria-live="polite">
        <div class="df-msg df-bot">
          <div class="df-msg-avatar">🤖</div>
          <div class="df-msg-bubble">
            Hallo! Ich bin der <strong>KI-Assistent</strong> von DeineFenster.de 👋<br><br>
            Ich kenne alle Produkte, Preise, Lieferzeiten und beantworte deine Fragen sofort. Was möchtest du wissen?
          </div>
        </div>
        <div id="df-typing">
          <div class="df-msg-avatar">🤖</div>
          <div id="df-typing-bubble">
            <span class="df-dot"></span><span class="df-dot"></span><span class="df-dot"></span>
          </div>
        </div>
      </div>

      <div id="df-chat-chips">
        ${QUICK_CHIPS.map(c => `<button class="df-chip" data-q="${c.q}">${c.text}</button>`).join('')}
      </div>

      <div id="df-chat-input-area">
        <input id="df-chat-input" type="text" placeholder="Frage stellen…" autocomplete="off" maxlength="500" aria-label="Frage eingeben"/>
        <button id="df-chat-send" aria-label="Senden">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div id="df-chat-disclaimer">KI-Assistent · Angaben ohne Gewähr · kein Rechtsrat</div>
    </div>
  `);
})();

// ─── Logik ─────────────────────────────────────────────────────────────────────
(function init() {
  const label    = document.getElementById('df-chat-label');
  const btn      = document.getElementById('df-chat-btn');
  const win      = document.getElementById('df-chat-window');
  const closeBtn = document.getElementById('df-chat-close-btn');
  const input    = document.getElementById('df-chat-input');
  const sendBtn  = document.getElementById('df-chat-send');
  const msgs     = document.getElementById('df-chat-messages');
  const typing   = document.getElementById('df-typing');
  const badge    = document.getElementById('df-chat-badge');
  const tooltip  = document.getElementById('df-chat-tooltip');
  const chips    = document.getElementById('df-chat-chips');

  let isOpen = false, isLoading = false, history = [], tooltipShown = false;

  setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltip.classList.add('df-visible');
      tooltipShown = true;
      setTimeout(() => tooltip.classList.remove('df-visible'), 5000);
    }
  }, 9000);

  if (window.location.pathname.includes('konfigurator')) {
    setTimeout(() => {
      if (!isOpen) { tooltip.textContent = 'Fragen zur Konfiguration?'; tooltip.classList.add('df-visible'); badge.style.display='block'; tooltipShown=true; setTimeout(()=>tooltip.classList.remove('df-visible'),6000); }
    }, 30000);
  }

  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('df-open', isOpen);
    win.classList.toggle('df-visible', isOpen);
    label.classList.toggle('df-hidden', isOpen);
    badge.style.display = 'none';
    tooltip.classList.remove('df-visible');
    if (isOpen) setTimeout(() => input.focus(), 300);
    btn.setAttribute('aria-label', isOpen ? 'Chat schließen' : 'KI-Chatbot öffnen');
  }

  btn.addEventListener('click', toggleChat);
  label.addEventListener('click', toggleChat);
  label.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') toggleChat(); });
  closeBtn.addEventListener('click', toggleChat);
  document.addEventListener('keydown', e => { if (e.key==='Escape' && isOpen) toggleChat(); });

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  function addMsg(html, role) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `df-msg ${isUser ? 'df-user' : 'df-bot'}`;
    const bubble = document.createElement('div');
    bubble.className = 'df-msg-bubble';
    if (isUser) { bubble.textContent = html; }
    else {
      bubble.innerHTML = html;
      const av = document.createElement('div');
      av.className = 'df-msg-avatar'; av.textContent = '🤖';
      div.appendChild(av);
    }
    div.appendChild(bubble);
    msgs.insertBefore(div, typing);
    scrollBottom();
  }

  function setLoading(state) {
    isLoading = state; sendBtn.disabled = state; input.disabled = state;
    typing.classList.toggle('df-show', state); scrollBottom();
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    chips.style.display = 'none';
    addMsg(text, 'user');
    input.value = '';
    setLoading(true);
    const delay = 350 + Math.random() * 450;

    if (!WORKER_URL) {
      await new Promise(r => setTimeout(r, delay));
      setLoading(false);
      const answer = ruleBasedAnswer(text);
      addMsg(answer || 'Zu dieser Frage habe ich leider keine direkte Antwort. Ruf uns an: <a href="tel:+493381214837">03381 / 214 83 73</a> oder schreib auf <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a> — wir helfen schnell weiter!', 'bot');
      return;
    }

    history.push({ role: 'user', content: text });
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:400, system:SYSTEM_PROMPT, messages:history.slice(-10) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.content?.[0]?.text || 'Kein Ergebnis erhalten. Bitte ruf uns an: 03381 / 214 83 73';
      history.push({ role: 'assistant', content: reply });
      setLoading(false);
      addMsg(reply.replace(/&/g,'&amp;').replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>'), 'bot');
    } catch(err) {
      console.warn('[Chatbot]', err);
      setLoading(false);
      addMsg('Technischer Fehler. Ruf uns bitte an: <a href="tel:+493381214837">03381 / 214 83 73</a>', 'bot');
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }});
  chips.addEventListener('click', e => { const c = e.target.closest('.df-chip'); if (c) sendMessage(c.dataset.q); });
})();
