// ════════════════════════════════════════════════════════════════
// SUBMIT-CORE — gemeinsame Angebots-Absende-Logik
// Sarah-Refaktor 21.04.2026 (Variante C sauber): Formular + Submit
// leben jetzt auf bestelluebersicht.html. Diese Datei wird von beiden
// Seiten geladen — Konfigurator lädt es nicht zwingend, aber falls nötig.
// ════════════════════════════════════════════════════════════════

(function (global) {
  'use strict';

  const CART_STORAGE_KEY = 'df_cart_v1';
  const WH = 'https://hook.eu1.make.com/so6vhvekae4ve7e3peh7vgcgqmv7cbrc';
  const RESEND_KEY = 're_5o5JYMky_MXfQoo7vAZoaNMn4KzLrNyht';
  const FROM_ADDR = 'DeineFenster.de <onboarding@resend.dev>';

  function fmt(n) {
    return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';
  }

  // Display-Name-Maps — Kopien aus konfigurator.html, damit bestelluebersicht unabhängig arbeitet
  const PROD_NAMES = {
    'kunststoff':'Kunststofffenster',
    'balkontuer':'Balkontür',
    'haustuere':'Haustür',
    'hst':'Schiebetür',
  };
  const PROFIL_NAMES = {
    'iglo5':'IGLO 5 Classic','iglo-energy':'IGLO Energy',
    'iglo5-tuer':'IGLO 5 Classic Tür','iglo-e-tuer':'IGLO Energy Tür',
    'iglo-psk':'PSK Schiebetür','iglo-slide':'IGLO Slide','iglo-hs':'IGLO-HS Schiebetür',
  };
  const GLAS_NAMES = {
    '2fach': '2-fach Wärmeschutz · 24 mm',
    '3fach': '3-fach Wärmeschutz · 40 mm · Warme Kante inklusive',
  };
  const SCHALL_NAMES = {
    'ohne':'Kein Zusatz-Schallschutz','rw-33':'Schallschutz Rw 33 dB',
    'rw-38':'Schallschutz Rw 38 dB','rw-44':'Schallschutz Rw 44 dB',
  };
  const SICHERGLAS_NAMES = {
    'kein':'Kein Sicherheitsglas','esg':'ESG (Einscheibensicherheitsglas)',
    'vsg':'VSG (Verbundsicherheitsglas)','vsg-p4a':'VSG P4A (Durchwurfhemmend)',
  };
  const GLASDEKOR_NAMES = {
    'klar':'Klarglas','satinato':'Satinato','chinchilla':'Chinchilla',
    'master-carre':'Master Carré',
  };
  const SICHER_NAMES = { 'wk1':'WK1 Standard','rc2':'RC2 Einbruchschutz WK2','rc3':'RC3 Einbruchschutz WK3' };
  const ROLL_NAMES = { 'ohne':'Kein Rolladen','gurt':'Rolladen mit Gurtwickler','motor':'Motorrolladen' };
  const FLUEGEL_NAMES = {
    '1-fluegel':'1 Flügel','2-fluegel':'2 Flügel','3-fluegel':'3 Flügel',
    '1-oberlicht':'1 Flügel + Oberlicht','2-oberlicht':'2 Flügel + Oberlicht','3-oberlicht':'3 Flügel + Oberlicht',
    '1-unterlicht':'1 Flügel + Unterlicht','2-unterlicht':'2 Flügel + Unterlicht','3-unterlicht':'3 Flügel + Unterlicht',
    '1-ober-unter':'1 Flügel + Ober- & Unterlicht','2-ober-unter':'2 Flügel + Ober- & Unterlicht','3-ober-unter':'3 Flügel + Ober- & Unterlicht',
    'seitenteil-l':'Haustür + Seitenteil links','seitenteil-r':'Haustür + Seitenteil rechts',
  };
  const FARB_NAMES = {
    'weiss':'Weiß','cremeweiss':'Cremeweiß','weiss-fx':'Weiß FX',
    'anthrazit':'Anthrazitgrau','anthraz-gl':'Anthrazitgrau Glatt','anthraz-um':'Anthrazitgrau Ulti-Matt',
    'schwarz-um':'Schwarz Ulti-Matt','schwarzbr':'Schwarzbraun',
    'achatgrau':'Achatgrau','lichtgrau':'Lichtgrau','signalgrau':'Signalgrau','betongrau':'Betongrau',
    'quarzgr-gl':'Quarzgrau Glatt','quarzgr-sa':'Quarzgrau Sandstruktur',
    'basaltgr-gl':'Basaltgrau Glatt','basaltgr-sa':'Basaltgrau Sandstruktur',
    'schiefgr-gl':'Schiefergrau Glatt','schiefgr-sa':'Schiefergrau Sandstruktur',
    'alux-db':'Alux DB','alu-gebr':'Aluminium gebürstet','eisengl':'Eisenglimmer Schiefer','crown-plat':'Crown Platin',
    'sheffield':'Sheffield Oak Light','winchester':'Winchester','eiche-hell':'Eiche Hell','eiche-nat':'Eiche Natur',
    'golden-oak':'Golden Oak','nussbaum':'Nussbaum','mooreiche':'Mooreiche','dunkleiche':'Dunkleiche',
    'siena-noce':'Siena Noce','siena-ross':'Siena Rosso','mahagoni':'Mahagoni','macore':'Macoré',
    'oregon':'Oregon','douglasie':'Streifen-Douglasie','bergkiefer':'Bergkiefer','teak':'Teak',
    'schoko-br':'Schokoladenbraun','braun-mar':'Braun Maron','moosgruen':'Moosgrün','dunkelgr':'Dunkelgrün',
    'stahlblau':'Stahlblau','brillblau':'Brilliantblau','dunkelrot':'Dunkelrot','sonder':'Sonderfarbe (RAL)',
  };
  const DICHT_NAMES = { 'schwarz':'Dichtung Schwarz','grau':'Dichtung Grau' };
  const HST_SCHWELLE_NAMES = { 'standard':'Standard-Schwelle','null':'Null-Schwelle (barrierefrei)' };
  const HST_TEILUNG_NAMES = { '2-teilig':'2-teilig (A|B)','3-teilig':'3-teilig (A|B|C)' };
  const HST_LAUF_NAMES = { 'rechts':'Laufrichtung rechts öffnend','links':'Laufrichtung links öffnend' };
  const BALK_SCHWELLE_NAMES = { 'alu-20':'Alu-Schwelle 20 mm','alu-niedrig':'Niedrige Alu-Schwelle','ohne':'Ohne Schwelle' };
  const TUER_GRIFF_INNEN_NAMES = {
    'drueck-weiss':'Drücker Weiß','drueck-braun':'Drücker Braun','drueck-silber':'Drücker Silber','drueck-olive':'Drücker Olive',
  };
  const TUER_GRIFF_AUSSEN_NAMES = {
    'drueck-silber':'Drücker Silber','drueck-olive':'Drücker Olive','drueck-weiss':'Drücker Weiß','drueck-braun':'Drücker Braun',
    'knauf-weiss':'Knauf Weiß','knauf-braun':'Knauf Braun','knauf-silber':'Knauf Silber','knauf-olive':'Knauf Olive',
    'stoss-m45-650':'Stossgriff M45 Edelstahl 650 mm','stoss-m45-1200':'Stossgriff M45 Edelstahl 1200 mm','stoss-m45-1800':'Stossgriff M45 Edelstahl 1800 mm',
    'stoss-m2-weiss':'Stossgriff M2 Weiß','stoss-m2-braun':'Stossgriff M2 Braun','stoss-m2-silber':'Stossgriff M2 Silber',
  };
  const HST_GRIFF_NAMES = {
    'weiss-std':'Weiß innen & außen · Standard','braun-std':'Braun innen & außen · Standard','silber-std':'Silber innen & außen · Standard',
    'ws-std':'Weiß/Silber · Standard','wb-std':'Weiß/Braun · Standard',
    'weiss-si':'Weiß · Schloss innen','braun-si':'Braun · Schloss innen','silber-si':'Silber · Schloss innen',
    'ws-si':'Weiß/Silber · Schloss innen','wb-si':'Weiß/Braun · Schloss innen',
    'weiss-sia':'Weiß · Schloss innen+außen','braun-sia':'Braun · Schloss innen+außen','silber-sia':'Silber · Schloss innen+außen',
    'ws-sia':'Weiß/Silber · Schloss innen+außen','wb-sia':'Weiß/Braun · Schloss innen+außen',
  };
  const GRIFF_NAMES = {
    'std-weiss':'Standard-Griff Weiß','hoppe-es-matt':'Drutex Mistral Edelstahl matt','hoppe-es-pol':'Drutex Mistral Edelstahl poliert',
    'hoppe-gold':'Drutex Nevada Gold','fsb-es':'Drutex Kwadrat Edelstahl matt','pz-beid':'PZ beidseitig (Drutex Nevada)',
  };

  function prodName(k) { return PROD_NAMES[k] || k || '–'; }
  function profilName(k) { return PROFIL_NAMES[k] || k || '–'; }
  function glasName(k) { return GLAS_NAMES[k] || k || '–'; }

  // Summary einer einzelnen Konfiguration als HTML-Zeilen-Liste
  function configRows(c) {
    const rows = [
      ['Produkt', `${c.qty || 1} × ${prodName(c.prod)}`],
      ['Maße (Rohbau)', `${c.bMm} × ${c.hMm} mm`],
      ['Profil', profilName(c.profil)],
      ['Flügelaufteilung', FLUEGEL_NAMES[c.fluegel] || c.fluegel || '–'],
      ['Verglasung', glasName(c.glas)],
    ];
    if (c.schall && c.schall !== 'ohne') rows.push(['Schallschutz', SCHALL_NAMES[c.schall] || c.schall]);
    if (c.sicherGlas && c.sicherGlas !== 'kein') rows.push(['Sicherheitsglas', SICHERGLAS_NAMES[c.sicherGlas] || c.sicherGlas]);
    if (c.glasdekor && c.glasdekor !== 'klar') rows.push(['Glasdekor', GLASDEKOR_NAMES[c.glasdekor] || c.glasdekor]);
    rows.push(['Farbe außen', FARB_NAMES[c.fa] || c.fa]);
    rows.push(['Farbe innen', FARB_NAMES[c.fi] || c.fi]);
    if (c.fd) rows.push(['Dichtungsfarbe', DICHT_NAMES[c.fd] || c.fd]);
    if (c.prod === 'haustuere') {
      if (c.tuerModell) rows.push(['Türmodell', c.tuerModell]);
      rows.push(['Türgriff innen', TUER_GRIFF_INNEN_NAMES[c.tuerGriffInnen] || c.tuerGriffInnen || '–']);
      rows.push(['Türgriff außen', TUER_GRIFF_AUSSEN_NAMES[c.tuerGriffAussen] || c.tuerGriffAussen || '–']);
    } else if (c.prod === 'hst') {
      rows.push(['Schwelle', HST_SCHWELLE_NAMES[c.hstSchwelle] || c.hstSchwelle || '–']);
      rows.push(['Teilung', HST_TEILUNG_NAMES[c.hstTeilung] || c.hstTeilung || '–']);
      rows.push(['Laufrichtung', HST_LAUF_NAMES[c.hstLauf] || c.hstLauf || '–']);
      rows.push(['Schiebetür-Griff', HST_GRIFF_NAMES[c.hstGriff] || c.hstGriff || '–']);
    } else {
      rows.push(['Griff', GRIFF_NAMES[c.griff] || c.griff || '–']);
    }
    if (c.prod === 'balkontuer') {
      rows.push(['Schwelle', BALK_SCHWELLE_NAMES[c.balkonSchwelle] || c.balkonSchwelle || '–']);
      rows.push(['Balkontür-Set', c.griff === 'pz-beid' ? 'Entfällt (PZ beidseitig aktiv)' : 'Schnäpper + Griffmuschel inklusive']);
    }
    if (c.prod !== 'haustuere' && c.prod !== 'hst') {
      if (c.roll && c.roll !== 'ohne') rows.push(['Rolladen', `${ROLL_NAMES[c.roll] || c.roll} · Kasten ${c.rollKasten || '175'} mm`]);
      else rows.push(['Rolladen', 'Kein Rolladen']);
    }
    if (c.prod !== 'haustuere') {
      const sproStr = c.sproTyp === 'keine' ? 'Ohne' : `${c.sproTyp === 'aufgeklebt' ? 'Aufgeklebt' : 'SZR'} ${c.sproDicke || ''} mm`;
      rows.push(['Sprossen', sproStr]);
    }
    rows.push(['Einbruchschutz', SICHER_NAMES[c.sicher] || c.sicher || '–']);
    return rows;
  }

  // Versand-Kosten berechnen (gesamt für alle Cart-Items)
  function calcVersand(cart) {
    if (cart.length === 0) return 0;
    const hasHst = cart.some(i => i.config.prod === 'hst');
    const hasHaustuere = cart.some(i => i.config.prod === 'haustuere');
    if (hasHst) return 149;
    if (hasHaustuere) return 89;
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    if (totalQty >= 10) return 99;
    if (totalQty >= 5) return 79;
    return 49;
  }

  // Haupt-Submit-Funktion — wird von Bestellübersicht aufgerufen
  async function submitAngebot(formData, cart, uploadedImages, callbacks) {
    callbacks = callbacks || {};
    const onStart = callbacks.onStart || function(){};
    const onError = callbacks.onError || function(msg) { alert(msg); };
    const onSuccess = callbacks.onSuccess || function(){};
    onStart();

    try {
      const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
      const ship = calcVersand(cart);
      const tot = (subtotal + ship).toFixed(2);
      const datum = new Date().toLocaleDateString('de-DE');
      const offerId = 'DF-' + Date.now().toString().slice(-6);

      const deal = {
        id: Date.now(),
        offer_id: offerId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ort: formData.ort,
        strasse: formData.strasse,
        wunsch_liefertermin: formData.wunschLiefertermin,
        notes: formData.notiz,
        cart_items: cart.map(i => ({
          summary: i.summary, qty: i.qty, unit: i.unitPrice, subtotal: i.subtotal, config: i.config,
        })),
        cart_count: cart.length,
        gesamt_netto: Number(subtotal.toFixed(2)),
        versand: ship,
        price: Number(tot),
        attachments: (uploadedImages || []).map(img => ({
          name: img.name, type: img.type, size: img.size, data: img.data,
        })),
        attachment_count: (uploadedImages || []).length,
        date: datum,
        status: 'new',
      };

      // LocalStorage für Dashboard
      try {
        const existing = JSON.parse(localStorage.getItem('df_deals') || '[]');
        existing.unshift(deal);
        localStorage.setItem('df_deals', JSON.stringify(existing));
      } catch (e) { console.warn('localStorage write failed', e); }

      // Email-Template für Sarah
      const konfRow = (label, val) =>
        `<tr><td style="padding:5px 0;border-bottom:1px solid #e0e4f0;font-size:14px;color:#424751;width:40%">${label}</td>
             <td style="padding:5px 0;border-bottom:1px solid #e0e4f0;font-size:14px;font-weight:700;color:#161c27">${val}</td></tr>`;

      const itemBlock = (item, idx) => `
        <div style="background:#f1f3ff;border-radius:12px;padding:18px 22px;margin-bottom:14px">
          <div style="font-size:15px;font-weight:700;color:#161c27;margin-bottom:10px">Element ${idx + 1}: ${prodName(item.config.prod)}</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${configRows(item.config).map(([k, v]) => konfRow(k, v)).join('')}
            ${konfRow('Einzelpreis', fmt(item.unitPrice))}
            ${konfRow('<strong>Zwischensumme</strong>', `<strong>${fmt(item.subtotal)}</strong>`)}
          </table>
        </div>`;

      const attachmentNote = (uploadedImages && uploadedImages.length > 0) ? `
        <tr><td style="background:#fff;padding:0 36px">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 18px;margin-bottom:20px">
            <div style="font-size:14px;font-weight:700;color:#1e3a8a">📎 ${uploadedImages.length} Foto/Skizze vom Kunden mitgeschickt</div>
            <div style="font-size:12px;color:#1e3a8a;margin-top:4px">${uploadedImages.map(i => i.name).join(' · ')}</div>
            <div style="font-size:11px;color:#475569;margin-top:4px">Bilddaten sind im Webhook-Payload (Base64) — im Dashboard abrufbar.</div>
          </div>
        </td></tr>` : '';

      const sarahHtml = `<!DOCTYPE html><html lang="de"><body style="margin:0;padding:0;background:#f1f3ff;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3ff;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:#112455;border-radius:16px 16px 0 0;padding:28px 36px">
    <div style="font-size:22px;font-weight:800;color:#fff">DeineFenster<span style="color:#76a9fa">.de</span>
    <span style="font-size:14px;font-weight:400;color:rgba(255,255,255,.5);margin-left:12px">Neue Anfrage</span></div>
  </td></tr>
  <tr><td style="background:#fff;padding:28px 36px 0">
    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:17px;font-weight:700;color:#92400e">🔔 Neue Anfrage eingegangen!</div>
      <div style="font-size:14px;color:#78350f;margin-top:4px">${offerId} · ${datum} · ${cart.length} Element(e) · Sofort bearbeiten empfohlen</div>
    </div>
  </td></tr>
  <tr><td style="background:#fff;padding:0 36px">
    <div style="font-size:15px;font-weight:700;color:#161c27;margin-bottom:12px">👤 Kundendaten</div>
    <div style="background:#f1f3ff;border-radius:12px;padding:18px 22px;margin-bottom:20px">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${konfRow('Name', formData.name)}
      ${konfRow('E-Mail', `<a href="mailto:${formData.email}" style="color:#225eaa">${formData.email}</a>`)}
      ${konfRow('Telefon', formData.phone || '–')}
      ${konfRow('Ort / PLZ', formData.ort)}
      ${konfRow('Straße', formData.strasse || '–')}
      <tr><td style="padding:5px 0;font-size:14px;color:#424751">Anmerkungen</td>
          <td style="padding:5px 0;font-size:14px;color:#161c27">${formData.notiz || '–'}</td></tr>
    </table></div>
  </td></tr>
  ${attachmentNote}
  <tr><td style="background:#fff;padding:0 36px">
    <div style="font-size:15px;font-weight:700;color:#161c27;margin-bottom:12px">🪟 Konfiguration (${cart.length} Element${cart.length !== 1 ? 'e' : ''})</div>
    ${cart.map((item, idx) => itemBlock(item, idx)).join('')}
  </td></tr>
  <tr><td style="background:#fff;padding:0 36px 28px">
    <div style="background:#112455;border-radius:12px;padding:20px 24px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:14px;color:rgba(255,255,255,.6)">Gesamtpreis inkl. MwSt. (kalkuliert)</td>
      <td style="text-align:right;font-size:28px;font-weight:800;color:#fff">${tot} €</td>
    </tr><tr>
      <td colspan="2" style="font-size:12px;color:rgba(255,255,255,.4)">Zwischensumme ${fmt(subtotal)} + Lieferkosten ${ship.toFixed(2)} €</td>
    </tr></table></div>
  </td></tr>
</table></td></tr></table></body></html>`;

      // Kunden-Email (Kurz-Bestätigung)
      const kundenHtml = `<!DOCTYPE html><html lang="de"><body style="margin:0;padding:0;background:#f1f3ff;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3ff;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:#112455;border-radius:16px 16px 0 0;padding:28px 36px">
    <div style="font-size:22px;font-weight:800;color:#fff">DeineFenster<span style="color:#76a9fa">.de</span></div>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 36px">
    <h1 style="margin:0 0 12px;font-family:Segoe UI,Arial;color:#161c27;font-size:24px">Vielen Dank für Ihre Anfrage!</h1>
    <p style="font-size:15px;line-height:1.6;color:#424751;margin:0 0 16px">Hallo ${formData.name.split(' ')[0]},<br>wir haben Ihre Anfrage (${offerId}) erhalten und melden uns <strong>zeitnah</strong> mit einem persönlichen Angebot.</p>
    <p style="font-size:14px;color:#727782;margin:0">Anfrage-Nummer: <strong>${offerId}</strong> · ${cart.length} Element${cart.length !== 1 ? 'e' : ''} · kalkulierter Richtpreis: ${tot} €</p>
  </td></tr>
</table></td></tr></table></body></html>`;

      // ── Benachrichtigung via Web3Forms (CORS-sicher, kein Server nötig) ──
      try {
        const positionen = cart.map((item, idx) =>
          `${idx + 1}. ${item.qty}× ${item.summary || (item.config && item.config.prod) || '–'}`
        ).join(' | ');
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: '440a94ff-9f42-46af-bf3d-47013dbd8f5f',
            subject: `🔔 Neue Anfrage ${offerId} — DeineFenster.de`,
            from_name: 'DeineFenster.de Konfigurator',
            'Anfrage-Nr': offerId,
            'Datum': datum,
            'Name': formData.name,
            'E-Mail': formData.email,
            'Telefon': formData.phone || '–',
            'PLZ & Ort': formData.ort,
            'Strasse': formData.strasse || '–',
            'Positionen': positionen,
            'Anmerkungen': formData.notiz || '–',
            'Kalkulierter Preis': `${tot} €`,
          }),
        });
      } catch (e) { console.warn('Web3Forms fehlgeschlagen:', e); }

      // Make.com Webhook senden (inkl. Bildanhänge)
      try {
        await fetch(WH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deal: deal, sarah_html: sarahHtml }),
        });
      } catch (e) { console.warn('Make.com Webhook fehlgeschlagen:', e); }

      // Cart + Bilder löschen nach erfolgreichem Versand
      try {
        localStorage.setItem('df_last_img_count', String((uploadedImages || []).length));
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (e) {}

      onSuccess(offerId, cart.length, (uploadedImages || []).length);
    } catch (err) {
      console.error('submit failed', err);
      onError('Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt unter info@deinefenster.de.');
    }
  }

  // Export
  global.submitAngebot = submitAngebot;
  global.submitCoreHelpers = {
    fmt, configRows, prodName, profilName, glasName, calcVersand,
    PROD_NAMES, PROFIL_NAMES, GLAS_NAMES, FARB_NAMES, FLUEGEL_NAMES,
    SCHALL_NAMES, SICHERGLAS_NAMES, GLASDEKOR_NAMES, SICHER_NAMES, ROLL_NAMES,
    DICHT_NAMES, HST_SCHWELLE_NAMES, HST_TEILUNG_NAMES, HST_LAUF_NAMES,
    BALK_SCHWELLE_NAMES, TUER_GRIFF_INNEN_NAMES, TUER_GRIFF_AUSSEN_NAMES,
    HST_GRIFF_NAMES, GRIFF_NAMES,
  };
})(typeof window !== 'undefined' ? window : this);
