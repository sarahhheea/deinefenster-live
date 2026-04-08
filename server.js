// DeineFenster.de – Lokaler Dev-Server mit E-Mail-Proxy
// Start: node server.js
// Öffne dann: http://localhost:8080

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = 8080;
const ROOT = __dirname;

// .env einlesen
function loadEnv() {
  try {
    const lines = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n');
    lines.forEach(line => {
      const [k, ...rest] = line.split('=');
      if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
    });
  } catch(e) {}
}
loadEnv();

const RESEND_KEY = process.env.RESEND_API_KEY || '';
if (!RESEND_KEY) { console.error('❌ RESEND_API_KEY fehlt in .env!'); process.exit(1); }

// MIME types
const MIME = {
  '.html':'text/html;charset=utf-8', '.css':'text/css', '.js':'application/javascript',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2',
};

// Resend API aufrufen (server-side, kein CORS-Problem)
function sendViaResend(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Body einlesen
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ── CORS für lokale Entwicklung ─────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API: E-Mail senden ──────────────────────────────────────────
  if (pathname === '/api/send-email' && req.method === 'POST') {
    try {
      const payload = await readBody(req);
      console.log(`📧 Sende E-Mail an: ${payload.to}`);

      const result = await sendViaResend(payload);
      console.log(`   → Resend Status: ${result.status}`, result.body);

      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.body));
    } catch(err) {
      console.error('❌ E-Mail Fehler:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Statische Dateien ───────────────────────────────────────────
  let filePath = path.join(ROOT, pathname === '/' ? '/index.html' : pathname);

  // Verzeichnis → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Saubere URLs: /konfigurator → /konfigurator.html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = filePath + '.html';
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + pathname);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✅ DeineFenster.de Dev-Server läuft');
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📧 Resend API Key: ${RESEND_KEY.slice(0,12)}...`);
  console.log('');
  console.log('  Seiten:');
  console.log(`    http://localhost:${PORT}/konfigurator.html`);
  console.log(`    http://localhost:${PORT}/dashboard.html  (Passwort: admin123)`);
  console.log('');
  console.log('  Zum Beenden: Ctrl+C');
  console.log('');
});
