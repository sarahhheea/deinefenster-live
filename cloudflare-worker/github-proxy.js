// DeineFenster.de – GitHub Shop-Backend Proxy
// Hält den GitHub-Personal-Access-Token server-side, damit er nie ins Frontend gelangt.
//
// Worker-Secrets (in Cloudflare Dashboard → Worker → Settings → Variables):
//   GH_TOKEN          → frisch generierter PAT mit Scope `repo` für sarahhheea/deinefenster-live
//   SHOP_PASSWORD     → Klartext-Passwort der Familie (z.B. Fenster2026)
//   GH_REPO           → "sarahhheea/deinefenster-live" (oder env-config)
//
// Frontend schickt mit JEDEM Request einen Header `X-Shop-Pass: <passwort>`.
// Falsches Passwort → 401. Richtiges Passwort → GitHub-Operation wird mit dem Server-Token ausgeführt.
//
// Routen (POST):
//   /get          { path }                          → liest Datei (JSON oder Base64)
//   /put          { path, content64, sha?, message } → schreibt Datei
//   /login        { password }                      → prüft nur das Passwort, returnt {ok:true}

const PAGES_BASE = 'https://sarahhheea.github.io/deinefenster-live';

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
      'Access-Control-Allow-Headers': 'Content-Type, X-Shop-Pass',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const pass = request.headers.get('X-Shop-Pass') || '';

    if (!env.GH_TOKEN || !env.SHOP_PASSWORD || !env.GH_REPO) {
      return json({ error: 'Worker nicht konfiguriert (GH_TOKEN/SHOP_PASSWORD/GH_REPO fehlt)' }, 500, corsHeaders);
    }

    try {
      const body = await request.json().catch(() => ({}));

      // Login-Endpoint: nur Passwort prüfen (für Frontend-Login-Flow)
      if (path === '/login') {
        if (body.password !== env.SHOP_PASSWORD) {
          await sleep(800); // gegen Brute-Force etwas bremsen
          return json({ ok: false, error: 'Falsches Passwort.' }, 401, corsHeaders);
        }
        return json({ ok: true }, 200, corsHeaders);
      }

      // Alle anderen Endpoints: Passwort-Header erforderlich
      if (pass !== env.SHOP_PASSWORD) {
        await sleep(800);
        return json({ error: 'Nicht autorisiert' }, 401, corsHeaders);
      }

      if (path === '/get') {
        const filePath = String(body.path || '').replace(/^\/+/, '');
        if (!filePath) return json({ error: 'path fehlt' }, 400, corsHeaders);
        const r = await fetch(
          `https://api.github.com/repos/${env.GH_REPO}/contents/${encodeURI(filePath)}`,
          {
            headers: {
              Authorization: `token ${env.GH_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'deinefenster-shop-proxy',
            },
          },
        );
        const text = await r.text();
        return new Response(text, {
          status: r.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path === '/put') {
        const filePath = String(body.path || '').replace(/^\/+/, '');
        if (!filePath || !body.content64) {
          return json({ error: 'path + content64 erforderlich' }, 400, corsHeaders);
        }
        const payload = { message: body.message || `Update ${filePath}`, content: body.content64 };
        if (body.sha) payload.sha = body.sha;
        const r = await fetch(
          `https://api.github.com/repos/${env.GH_REPO}/contents/${encodeURI(filePath)}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `token ${env.GH_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'deinefenster-shop-proxy',
            },
            body: JSON.stringify(payload),
          },
        );
        const text = await r.text();
        return new Response(text, {
          status: r.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return json({ error: 'Unbekannter Pfad' }, 404, corsHeaders);
    } catch (e) {
      return json({ error: 'Server error', detail: String(e && e.message || e) }, 500, corsHeaders);
    }
  },
};

function json(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
