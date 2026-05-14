/**
 * DeineFenster.de — Cloudflare Worker: E-Mail via Resend
 *
 * DEPLOYMENT (Cloudflare Dashboard):
 * 1. https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Worker-Name: deinefenster-email
 * 3. Diesen Code einfügen → "Save and Deploy"
 * 4. Settings → Variables → Secret: RESEND_API_KEY = dein Resend API Key
 *
 * Sendet zwei E-Mails:
 *   A) Interne Benachrichtigung → info@baustoffchrist.de
 *   B) Auftragsbestätigung HTML → Kunde (customer_email im Body)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function confirmationHtml({ name, offerId, prodName, breite, hoehe, anzahl, datum }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ihre Anfrage bei DeineFenster.de</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#225eaa 0%,#1e3a8a 100%);padding:36px 40px 30px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <!-- Logo-Icon (Fenster-Symbol) -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                  <span style="font-size:28px;line-height:1;">🪟</span>
                </td>
                <td style="padding-left:14px;vertical-align:middle;">
                  <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.1;">
                    Deine<span style="color:#7eb8f7;">Fenster</span>
                  </div>
                  <div style="color:rgba(255,255,255,0.65);font-size:10px;font-weight:600;letter-spacing:2px;margin-top:3px;">
                    .DE &nbsp;·&nbsp; DRUTEX FACHHANDEL
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td align="right" style="vertical-align:middle;">
            <div style="background:rgba(255,255,255,0.15);border-radius:20px;padding:6px 14px;display:inline-block;">
              <span style="color:#ffffff;font-size:11px;font-weight:600;letter-spacing:1px;">ANFRAGE EINGEGANGEN</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Grüner Bestätigungs-Banner -->
  <tr>
    <td style="background:#edfaf3;border-bottom:1px solid #c3eed8;padding:16px 40px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:28px;font-size:20px;">✅</td>
          <td style="padding-left:10px;color:#166534;font-size:13px;font-weight:600;">
            Vielen Dank – Ihre Anfrage ist bei uns eingegangen!
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Hauptinhalt -->
  <tr>
    <td style="padding:36px 40px;">

      <p style="color:#1a2744;font-size:16px;font-weight:700;margin:0 0 6px;">
        Hallo ${name},
      </p>
      <p style="color:#4a5568;font-size:15px;line-height:1.7;margin:0 0 28px;">
        wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich bei Ihnen —
        in der Regel innerhalb von <strong style="color:#225eaa;">24 Stunden</strong>.
      </p>

      <!-- Anfrage-Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #dce8f7;border-radius:10px;overflow:hidden;margin-bottom:28px;">
        <tr>
          <td style="background:#225eaa;padding:12px 20px;">
            <span style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1px;">IHRE ANFRAGE</span>
            <span style="color:rgba(255,255,255,0.7);font-size:11px;margin-left:12px;">${offerId}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr style="border-bottom:1px solid #e8f0fb;">
                <td style="padding:12px 20px;color:#6b7a99;font-size:13px;width:140px;">Produkt</td>
                <td style="padding:12px 20px;color:#1a2744;font-size:13px;font-weight:600;">${prodName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8f0fb;background:#fcfdff;">
                <td style="padding:12px 20px;color:#6b7a99;font-size:13px;">Maße</td>
                <td style="padding:12px 20px;color:#1a2744;font-size:13px;font-weight:600;">${breite} × ${hoehe} mm</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;color:#6b7a99;font-size:13px;">Anzahl</td>
                <td style="padding:12px 20px;color:#1a2744;font-size:13px;font-weight:600;">${anzahl} Stück</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Was passiert als nächstes -->
      <p style="color:#1a2744;font-size:14px;font-weight:700;margin:0 0 14px;">Was passiert als Nächstes?</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="vertical-align:top;padding-bottom:12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:#e8f0fb;border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:800;color:#225eaa;">1</td>
                <td style="padding-left:12px;color:#4a5568;font-size:13px;line-height:1.5;">Wir prüfen Ihre Konfiguration und erstellen ein verbindliches Angebot.</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding-bottom:12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:#e8f0fb;border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:800;color:#225eaa;">2</td>
                <td style="padding-left:12px;color:#4a5568;font-size:13px;line-height:1.5;">Wir melden uns telefonisch oder per E-Mail mit Ihrem persönlichen Angebot.</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="vertical-align:top;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:#e8f0fb;border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:800;color:#225eaa;">3</td>
                <td style="padding-left:12px;color:#4a5568;font-size:13px;line-height:1.5;">Nach Ihrer Freigabe beginnt die Produktion – direkt beim Hersteller Drutex.</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Kontakt-Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2744;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;letter-spacing:1.5px;margin:0 0 10px;">SIE MÖCHTEN DIREKT SPRECHEN?</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:24px;">
                  <a href="tel:033812148373" style="color:#7eb8f7;font-size:15px;font-weight:700;text-decoration:none;">📞 03381 / 214 83 73</a>
                  <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:3px;">Mo–Fr · 08:00–17:00 Uhr</div>
                </td>
                <td>
                  <a href="mailto:info@baustoffchrist.de" style="color:#7eb8f7;font-size:13px;text-decoration:none;">✉ info@baustoffchrist.de</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8faff;border-top:1px solid #e8f0fb;padding:20px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#9aa5b4;font-size:11px;line-height:1.7;">
            <strong style="color:#4a5568;">Fensterhandel Christ GmbH</strong><br>
            Niemöllerstraße 10 · 14772 Brandenburg an der Havel<br>
            Diese E-Mail wurde automatisch versendet · ${datum}
          </td>
          <td align="right" style="vertical-align:top;">
            <a href="https://deinefenster.de" style="color:#225eaa;font-size:11px;font-weight:700;text-decoration:none;">deinefenster.de</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS });
    }
    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }); }

    // ── 1. Interne E-Mail an info@baustoffchrist.de ──────────────────────────
    const internalRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: body.from || 'DeineFenster.de <noreply@deinefenster.de>',
        to: body.to || ['info@baustoffchrist.de'],
        reply_to: body.reply_to,
        subject: body.subject,
        text: body.text,
      }),
    });

    // ── 2. Kunden-Bestätigung (HTML) ─────────────────────────────────────────
    let confirmRes = { ok: true };
    if (body.customer_email) {
      const c = body.confirmation || {};
      const html = confirmationHtml({
        name:     c.name     || 'Kunde',
        offerId:  c.offerId  || '–',
        prodName: c.prodName || '–',
        breite:   c.breite   || '–',
        hoehe:    c.hoehe    || '–',
        anzahl:   c.anzahl   || 1,
        datum:    new Date().toLocaleDateString('de-DE'),
      });

      confirmRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'DeineFenster.de <noreply@deinefenster.de>',
          to: [body.customer_email],
          subject: `✅ Ihre Anfrage ${c.offerId || ''} ist eingegangen – DeineFenster.de`,
          html,
        }),
      });
    }

    const ok = internalRes.ok;
    return new Response(JSON.stringify({ ok, confirm_sent: !!body.customer_email }),
      { status: ok ? 200 : 502, headers: { ...CORS, 'Content-Type': 'application/json' } });
  },
};
