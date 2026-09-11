// Test: Wie genau trifft ein Artikel das gesuchte Maß?
// Der reale Bug (Kundenmeldung 10.09.2026): Suche „1500 breit × 1200 hoch" zeigte auf
// Fenstern mit 1200 × 1500 das grüne Band „Genau dein Maß". Ursache: jedes Maß aus dem
// Text wurde zusätzlich vertauscht als Treffer gewertet („quer eingebaut ist dasselbe
// Fenster"). Ist es nicht — Beschlag, Kippfunktion, DIN-Richtung und Rollladenkasten
// sitzen fest, und die Maueröffnung ist ohnehin fix. „Genau dein Maß" darf nur stehen,
// wenn Breite auf Breite und Höhe auf Höhe passt.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseMasse, massBewertung } = require('../js/shop-mass-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

const suche = (b, h, tol) => ({ breite: b, hoehe: h, toleranz: tol == null ? 15 : tol });
const artikel = (b, h, titel, beschr) => ({
  breite_mm: b, hoehe_mm: h, titel: titel || '', beschreibung: beschr || ''
});

/* ── parseMasse: Maß-Paare aus Text ───────────────────────────────────── */
t('parseMasse findet "1200 x 1500"', () =>
  assert.deepStrictEqual(parseMasse('Fenster 1200 x 1500 Nr. 2512'), [[1200, 1500]]));
t('parseMasse findet auch × und *', () =>
  assert.deepStrictEqual(parseMasse('1300 ×1200 und 1400*1200'), [[1300, 1200], [1400, 1200]]));
t('parseMasse ignoriert Glasaufbau "4x16x4"', () =>
  assert.deepStrictEqual(parseMasse('3 Fach Glas 4x16x4'), []));

/* ── DER BUG: vertauschte Maße sind kein Treffer ──────────────────────── */
t('1200×1500-Fenster ist bei Suche 1500×1200 KEIN Treffer', () =>
  assert.strictEqual(massBewertung(artikel(1200, 1500, 'Fenster 1200 x 1500 Nr. 2512'), suche(1500, 1200)), null));

t('Maßtabelle nur mit Höhe 1500 liefert bei Suche 1500×1200 keinen Treffer', () =>
  assert.strictEqual(massBewertung(
    artikel(1200, 1500, '2 Flügel Fenster in den Höhen 1500',
            '1200 x1500 = 610 Euro\n1300 ×1500 = 630 Euro\n1500 x 1500 = 680 Euro'),
    suche(1500, 1200)), null));

t('Querformat 1300×800 ist bei Suche 800×1300 KEIN Treffer', () =>
  assert.strictEqual(massBewertung(artikel(1300, 800, 'Fenster 1300 x 800'), suche(800, 1300)), null));

/* ── Echte Treffer bleiben erhalten ───────────────────────────────────── */
t('1500×1200-Fenster ist bei Suche 1500×1200 exakt', () => {
  const m = massBewertung(artikel(1500, 1200, 'Fenster 1500 x 1200 Nr. 4017'), suche(1500, 1200));
  assert.strictEqual(m.stufe, 'exakt');
  assert.strictEqual(m.breite, 1500);
  assert.strictEqual(m.hoehe, 1200);
});

t('Sammelinserat mit Zeile "1500 x 1200" trifft exakt', () => {
  const m = massBewertung(
    artikel(1200, 1200, 'Fenster in den Höhen 1200',
            'Breite x Höhe\n1200 x1200= 660Euro\n1500 x 1200= 720 Euro\n1600 x 1200= 750 Euro'),
    suche(1500, 1200));
  assert.strictEqual(m.stufe, 'exakt');
  assert.strictEqual(m.breite, 1500);
  assert.strictEqual(m.hoehe, 1200);
});

t('2 cm schmaler gilt als „fast genau"', () => {
  const m = massBewertung(artikel(1480, 1200, ''), suche(1500, 1200));
  assert.strictEqual(m.stufe, 'fast');
  assert.strictEqual(m.db, -20);
});

t('2,1 cm Abweichung ist nur noch „ähnlich"', () =>
  assert.strictEqual(massBewertung(artikel(1479, 1200, ''), suche(1500, 1200)).stufe, 'aehnlich'));

t('näheres Maß aus der Tabelle gewinnt', () => {
  const m = massBewertung(artikel(1200, 1200, '', '1400 x 1200\n1490 x 1200\n1600 x 1200'), suche(1500, 1200));
  assert.strictEqual(m.breite, 1490);
});

/* ── Nur eine Achse gesucht ───────────────────────────────────────────── */
t('nur Breite gesucht → Kennzeichnung sagt „breite", nicht „beide"', () => {
  const m = massBewertung(artikel(1500, 2200, ''), suche(1500, null));
  assert.strictEqual(m.stufe, 'exakt');
  assert.strictEqual(m.achsen, 'breite');
});
t('nur Höhe gesucht → Kennzeichnung sagt „hoehe"', () => {
  const m = massBewertung(artikel(900, 1200, ''), suche(null, 1200));
  assert.strictEqual(m.achsen, 'hoehe');
});
t('beide gesucht → „beide"', () =>
  assert.strictEqual(massBewertung(artikel(1500, 1200, ''), suche(1500, 1200)).achsen, 'beide'));
t('kein Maß gesucht → keine Bewertung', () =>
  assert.strictEqual(massBewertung(artikel(1500, 1200, ''), suche(null, null)), null));

/* ── Toleranz ─────────────────────────────────────────────────────────── */
t('außerhalb der Toleranz → kein Treffer', () =>
  assert.strictEqual(massBewertung(artikel(1200, 1200, ''), suche(1500, 1200)), null));
t('innerhalb der Toleranz → ähnlich', () =>
  assert.strictEqual(massBewertung(artikel(1400, 1200, ''), suche(1500, 1200)).stufe, 'aehnlich'));

/* ── Gegenprobe am echten Bestand: „exakt" heißt exakt ────────────────── */
const datei = path.join(__dirname, '..', 'data', 'shop-produkte.json');
if (fs.existsSync(datei)) {
  const produkte = JSON.parse(fs.readFileSync(datei, 'utf8')).produkte || [];
  // Ein „exakt" ist nur dann ehrlich, wenn genau dieses Breite×Höhe-Paar auch wirklich
  // im Artikel steht — als Hauptmaß oder in dieser Reihenfolge im Text. Steht dort nur
  // das gedrehte Paar, ist es ein anderes Fenster.
  const stehtDrin = (p, B, H) =>
    (p.breite_mm === B && p.hoehe_mm === H) ||
    parseMasse((p.titel || '') + ' \n ' + (p.beschreibung || '')).some(([b, h]) => b === B && h === H);

  t('kein Artikel im Bestand wird „exakt" genannt, ohne es zu sein', () => {
    const fehler = [];
    for (const B of [800, 1000, 1200, 1300, 1500, 1800]) {
      for (const H of [600, 800, 1000, 1200, 1500]) {
        for (const p of produkte) {
          const m = massBewertung(p, suche(B, H));
          if (m && m.stufe === 'exakt' && !stehtDrin(p, B, H)) {
            fehler.push(`${B}×${H} → ${p.standnummer} (hat ${p.breite_mm}×${p.hoehe_mm})`);
          }
        }
      }
    }
    assert.strictEqual(fehler.length, 0, fehler.length + ' Fehlalarme, z.B.: ' + fehler.slice(0, 4).join(' | '));
  });
  t('Artikel mit passendem Hauptmaß wird gefunden', () => {
    const p = produkte.find(x => x.breite_mm > 0 && x.hoehe_mm > 0);
    const m = massBewertung(p, suche(p.breite_mm, p.hoehe_mm));
    assert.ok(m && m.stufe === 'exakt', 'eigenes Maß muss exakt treffen');
  });
} else {
  console.log('  (data/shop-produkte.json fehlt — Bestandsprüfung übersprungen)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
