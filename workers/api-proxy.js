/**
 * DeineFenster.de — Cloudflare Worker: AI API Proxy
 *
 * DEPLOYMENT:
 * 1. Auf https://workers.cloudflare.com einloggen
 * 2. "Create Worker" → diesen Code einfügen → "Save and Deploy"
 * 3. Settings → Variables → Secret hinzufügen: Name = CLAUDE_API_KEY, Wert = dein  API Key
 * 4. Worker-URL in js/chatbot.js bei WORKER_URL eintragen
 *
 * API Key erstellen: https://console.anthropic.com → API Keys → Create Key
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate Limiting: max. Anfragen pro IP pro Stunde
const RATE_LIMIT = 20;
const rateLimitMap = new Map(); // In-memory (reset bei Worker-Neustart)

export default {
  async fetch(request, env) {

    // ── CORS Preflight ──────────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    // ── API Key prüfen ──────────────────────────────────────────────────────────
    if (!env.CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── Rate Limiting ──────────────────────────────────────────────────────────
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 Stunde

    const entry = rateLimitMap.get(ip);
    if (entry && now - entry.start < windowMs) {
      if (entry.count >= RATE_LIMIT) {
        return new Response(
          JSON.stringify({ error: 'Zu viele Anfragen. Bitte ruf uns direkt an: 03381 / 214 83 73' }),
          { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
      entry.count++;
    } else {
      rateLimitMap.set(ip, { start: now, count: 1 });
    }

    // ── Request validieren ─────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Nur erlaubte Felder durchlassen (Sicherheit)
    const safeBody = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: Math.min(body.max_tokens || 400, 600), // Max 600 tokens
      system: body.system || '',
      messages: (body.messages || []).slice(-10), // Max 10 Nachrichten
    };

    // ── AI API aufrufen ────────────────────────────────────────────────────
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(safeBody),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
