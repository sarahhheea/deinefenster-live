// DeineFenster.de – Mail/Webhook Proxy (Resend + Web3Forms + Make.com)
// Deploy auf Cloudflare Workers → alle Keys bleiben server-side
//
// Worker-Secrets (in Cloudflare Dashboard → Worker → Settings → Variables):
//   RESEND_API_KEY      → re_...
//   WEB3FORMS_KEY       → 8-4-4-4-12 UUID-Format
//   MAKE_WEBHOOK_URL    → vollständige hook.eu1.make.com URL
//
// Routen (POST):
//   /            oder /resend     → leitet an Resend (api.resend.com/emails)
//   /web3forms                    → leitet an Web3Forms (api.web3forms.com/submit)
//   /make                         → leitet an Make.com Webhook

export default {
  async fetch(request, env) {
    const allowedOrigins = [
      'https://sarahhheea.github.io',
      'https://www.deinefenster.de',
      'https://deinefenster.de',
    ];
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      const body = await request.json();

      // ── Web3Forms (Sarah-Benachrichtigung) ──
      if (path === '/web3forms') {
        if (!env.WEB3FORMS_KEY) {
          return json({ error: 'WEB3FORMS_KEY nicht konfiguriert' }, 500, corsHeaders);
        }
        const r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_key: env.WEB3FORMS_KEY, ...body }),
        });
        return passThrough(r, corsHeaders);
      }

      // ── Make.com Webhook (Datenbank-Eintrag) ──
      if (path === '/make') {
        if (!env.MAKE_WEBHOOK_URL) {
          return json({ error: 'MAKE_WEBHOOK_URL nicht konfiguriert' }, 500, corsHeaders);
        }
        const r = await fetch(env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return passThrough(r, corsHeaders);
      }

      // ── Resend (default: Kundenbestätigung + Kontaktformular) ──
      if (!env.RESEND_API_KEY) {
        return json({ error: 'RESEND_API_KEY nicht konfiguriert' }, 500, corsHeaders);
      }
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return passThrough(r, corsHeaders);
    } catch (e) {
      return json({ error: 'Server error', detail: String(e && e.message || e) }, 500, corsHeaders);
    }
  },
};

async function passThrough(response, corsHeaders) {
  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

function json(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
