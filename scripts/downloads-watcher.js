#!/usr/bin/env node
// Downloads Watcher — überwacht ~/Downloads auf neue Bilder
// und verarbeitet sie automatisch durch die Pipeline
//
// Workflow: Inhaberin lädt Bild in Higgsfield runter → Watcher erkennt es →
//           Pipeline läuft → Bild landet in img/farben/ mit korrektem Namen
//
// Start: node scripts/downloads-watcher.js
// Stop: Ctrl+C

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const DOWNLOADS = path.join(process.env.HOME, 'Downloads');
const PROJECT = path.join(__dirname, '..');
const FARBEN_DIR = path.join(PROJECT, 'img/farben');
const MISSING_FILE = '/tmp/2fl_missing.json';

// Load missing list
let missing = [];
try {
  missing = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf8'));
  console.log(`\n📋 ${missing.length} Bilder noch offen\n`);
} catch(e) {
  console.error('❌ Fehler: /tmp/2fl_missing.json nicht gefunden. Zuerst Generation-Plan laden.');
  process.exit(1);
}

let processed = 0;
let nextIdx = 0;

// Find the next unprocessed image
function getNext() {
  while (nextIdx < missing.length) {
    const m = missing[nextIdx];
    if (!fs.existsSync(path.join(PROJECT, m.outPath))) {
      return m;
    }
    nextIdx++;
  }
  return null;
}

console.log('🔍 Watcher läuft — warte auf neue Downloads in:', DOWNLOADS);
console.log('📌 Nächstes Bild:', getNext()?.fname || '(alle fertig!)');
console.log('─────────────────────────────────────────\n');

// Track existing files
const knownFiles = new Set(fs.readdirSync(DOWNLOADS));
const startTime = Date.now();

setInterval(() => {
  const current = fs.readdirSync(DOWNLOADS);

  for (const file of current) {
    if (knownFiles.has(file)) continue;
    knownFiles.add(file);

    const fullPath = path.join(DOWNLOADS, file);
    const ext = path.extname(file).toLowerCase();

    // Only process image files
    if (!['.png', '.webp', '.jpeg', '.jpg'].includes(ext)) continue;

    // Check it's recent (within last 60s)
    const stat = fs.statSync(fullPath);
    if (Date.now() - stat.mtimeMs > 60000) continue;

    const next = getNext();
    if (!next) {
      console.log('✅ Alle Bilder fertig! Kein nächstes mehr.');
      continue;
    }

    console.log(`\n📥 Neues Bild erkannt: ${file}`);
    console.log(`🔧 Verarbeite als: ${next.fname}`);

    const outPath = path.join(PROJECT, next.outPath);

    // Run through pipeline
    const pipePath = path.join(PROJECT, 'scripts/process-master-image.py');
    const result = spawnSync('python3', [pipePath, fullPath, outPath], {
      cwd: PROJECT,
      encoding: 'utf8'
    });

    if (result.status === 0) {
      console.log(`✅ Pipeline OK → ${next.outPath}`);
      processed++;
      nextIdx++;
      const remaining = missing.length - nextIdx;
      console.log(`📊 ${processed} fertig, ${remaining} noch offen`);

      const nextItem = getNext();
      if (nextItem) {
        console.log(`\n📌 Nächstes Bild bitte: ${nextItem.fname}`);
        console.log(`   Farbe: ${nextItem.key}`);
        console.log(`   (${nextItem.batch.includes('aussen') ? 'AUSSEN' : 'INNEN'})`);
      } else {
        console.log('\n🎉 ALLE BILDER FERTIG!');
      }
    } else {
      console.error(`❌ Pipeline Fehler für ${next.fname}:`);
      console.error(result.stderr);
      console.log('⚠️  Datei nicht verarbeitet. Nächster Versuch beim nächsten Download.');
    }

    console.log('─────────────────────────────────────────');
  }
}, 2000);

// Show next image reminder every 30s
setInterval(() => {
  const next = getNext();
  if (next) {
    process.stdout.write(`\r⏳ Warte... Nächstes: ${next.fname} (${next.batch.includes('aussen') ? 'AUSSEN' : 'INNEN'})   `);
  }
}, 5000);
