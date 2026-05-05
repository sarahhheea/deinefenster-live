#!/usr/bin/env node
// Incoming Watcher — überwacht img/farben/ auf neue Rohbilder (nicht pipeline'd)
// Sobald ein neues Bild kommt, wird es automatisch durch die Pipeline geschickt
// und unter dem korrekten Namen gespeichert.
//
// Sarah lädt Bilder direkt in img/farben/ (oder einen Unterordner _incoming/)
// Watcher erkennt sie, Pipeline läuft, fertig.
//
// Start: node scripts/incoming-watcher.js

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT = path.join(__dirname, '..');
const FARBEN_DIR = path.join(PROJECT, 'img/farben');
const INCOMING_DIR = path.join(FARBEN_DIR, '_incoming');
const MISSING_FILE = '/tmp/2fl_missing.json';

// Create incoming dir if it doesn't exist
if (!fs.existsSync(INCOMING_DIR)) {
  fs.mkdirSync(INCOMING_DIR, { recursive: true });
}

// Load missing list
let missing = [];
try {
  missing = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf8'));
} catch(e) {
  console.error('❌ /tmp/2fl_missing.json nicht gefunden. Zuerst missing list generieren.');
  process.exit(1);
}

let nextIdx = 0;
let processed = 0;

function getNext() {
  while (nextIdx < missing.length) {
    const m = missing[nextIdx];
    if (!fs.existsSync(path.join(PROJECT, m.outPath))) return m;
    nextIdx++;
  }
  return null;
}

function showNext() {
  const next = getNext();
  if (next) {
    const view = next.batch ? (next.batch.includes('aussen') ? 'AUSSEN' : 'INNEN') : '';
    console.log(`\n📌 NÄCHSTES BILD: ${next.fname} (${view})`);
    console.log(`   Farbe: ${next.key}`);
    console.log(`   Speichern in: img/farben/_incoming/`);
  } else {
    console.log('\n🎉 ALLE BILDER FERTIG!');
  }
}

console.log(`\n🔍 Watcher läuft`);
console.log(`📂 Überwache: ${INCOMING_DIR}`);
console.log(`📋 ${missing.length} Bilder offen`);
showNext();
console.log('\n─────────────────────────────────────────\n');

const knownFiles = new Set(
  fs.existsSync(INCOMING_DIR) ? fs.readdirSync(INCOMING_DIR) : []
);

setInterval(() => {
  const current = fs.readdirSync(INCOMING_DIR);

  for (const file of current) {
    if (knownFiles.has(file)) continue;
    knownFiles.add(file);

    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.webp', '.jpeg', '.jpg'].includes(ext)) continue;

    // Skip already-pipelined files (they have the target naming pattern)
    if (file.startsWith('fenster_') || file.startsWith('balkontuer_') || file.startsWith('hst_')) continue;

    const fullPath = path.join(INCOMING_DIR, file);
    const next = getNext();

    if (!next) {
      console.log('✅ Alle Bilder fertig!');
      continue;
    }

    console.log(`\n📥 Erkannt: ${file}`);
    console.log(`🔧 → ${next.fname}`);

    const outPath = path.join(PROJECT, next.outPath);
    const pipePath = path.join(PROJECT, 'scripts/process-master-image.py');

    const result = spawnSync('python3', [pipePath, fullPath, outPath], {
      cwd: PROJECT,
      encoding: 'utf8'
    });

    if (result.status === 0) {
      console.log(`✅ OK → img/farben/${next.fname}`);
      processed++;
      nextIdx++;
      const rem = missing.filter(m => !fs.existsSync(path.join(PROJECT, m.outPath))).length;
      console.log(`📊 ${processed} fertig, ~${rem} noch offen`);
      showNext();
    } else {
      console.error(`❌ Pipeline Fehler:`, result.stderr?.slice(0, 200));
    }
    console.log('─────────────────────────────────────────');
  }
}, 1500);
