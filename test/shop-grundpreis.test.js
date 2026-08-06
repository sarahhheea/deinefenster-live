// Test: Grundpreis je m² bei Flächenware (Dämmung).
// Hintergrund: § 4 PAngV verlangt bei Ware nach Fläche neben dem Endpreis den
// Grundpreis. Die Fläche steht bei uns nicht in breite_mm/hoehe_mm (das ist die
// Rollendicke), sondern im Titel bzw. in der Beschreibung — z. B. „6,24 qm“.
const assert = require('assert');
const { flaecheAusText, grundpreisText, istFlaechenware } = require('../js/shop-grundpreis-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

// --- Fläche aus dem Text lesen -------------------------------------------

t('"6,24 qm" wird erkannt', () =>
  assert.strictEqual(flaecheAusText('Dämmung Klemmfilz 150 mm hoch 6,24 qm eine Rolle'), 6.24));

t('"18,72 m2" wird erkannt', () =>
  assert.strictEqual(flaecheAusText('Dämmung Knauf EKOROLL MPR 44 mit 50 mm Hoch 18,72 m2'), 18.72));

t('Punkt statt Komma: "5.52 qm"', () =>
  assert.strictEqual(flaecheAusText('Dämmung ISOVER 200 mm Hoch 5.52 qm'), 5.52));

t('"3,72 qm" mitten im Satz', () =>
  assert.strictEqual(flaecheAusText('Dämmung ISOVER SUPER MAT 150 mm 3,72 qm mit Wärmeleitwert 0,033'), 3.72));

t('"m²" mit Hochzahl wird erkannt', () =>
  assert.strictEqual(flaecheAusText('Rolle mit 6,24 m² Inhalt'), 6.24));

t('"Quadratmeter" ausgeschrieben', () =>
  assert.strictEqual(flaecheAusText('Rolle mit 6,24 Quadratmeter'), 6.24));

// Kritisch: Millimeter-Angaben dürfen NICHT als Fläche durchgehen
t('"150 mm" ist keine Fläche', () =>
  assert.strictEqual(flaecheAusText('Dämmung 150 mm hoch'), null));

t('Fenstermaße sind keine Fläche', () =>
  assert.strictEqual(flaecheAusText('1 Flügel Fenster gebraucht 1220 x 1290'), null));

t('leerer Text ergibt null', () =>
  assert.strictEqual(flaecheAusText(''), null));

t('undefined ergibt null', () =>
  assert.strictEqual(flaecheAusText(undefined), null));

t('erste Angabe gewinnt bei mehreren', () =>
  assert.strictEqual(flaecheAusText('6,24 qm pro Rolle, Palette 124,8 qm'), 6.24));

// --- Grundpreis rechnen und formatieren -----------------------------------

t('42 € auf 6,24 m² → 6,73 €/m²', () =>
  assert.strictEqual(grundpreisText(42, 6.24), '6,73 €/m²'));

t('59 € auf 18,72 m² → 3,15 €/m²', () =>
  assert.strictEqual(grundpreisText(59, 18.72), '3,15 €/m²'));

t('69 € auf 3,72 m² → 18,55 €/m²', () =>
  assert.strictEqual(grundpreisText(69, 3.72), '18,55 €/m²'));

t('ohne Fläche kein Grundpreis', () =>
  assert.strictEqual(grundpreisText(42, null), null));

t('Fläche 0 ergibt keinen Grundpreis (keine Division durch null)', () =>
  assert.strictEqual(grundpreisText(42, 0), null));

t('ohne Preis kein Grundpreis', () =>
  assert.strictEqual(grundpreisText(0, 6.24), null));

// --- Welche Ware braucht überhaupt einen Grundpreis? ----------------------

t('Dämmung ist Flächenware', () =>
  assert.strictEqual(istFlaechenware({ kategorie_key: 'daemmung' }), true));

t('Fenster ist keine Flächenware', () =>
  assert.strictEqual(istFlaechenware({ kategorie_key: 'fenster-1fluegel' }), false));

t('fehlende Kategorie ist keine Flächenware', () =>
  assert.strictEqual(istFlaechenware({}), false));

// shop.js benennt kategorie_key beim Laden in kategorie um — beide müssen greifen,
// sonst erscheint der Grundpreis in der Rohdatei, aber nicht im Shop.
t('normalisiertes Feld "kategorie" wird erkannt', () =>
  assert.strictEqual(istFlaechenware({ kategorie: 'daemmung' }), true));

t('Mehrfachkategorien "kategorie_keys" werden erkannt', () =>
  assert.strictEqual(istFlaechenware({ kategorie_keys: ['daemmung'] }), true));

t('normalisiertes Fenster bleibt ohne Grundpreis', () =>
  assert.strictEqual(istFlaechenware({ kategorie: 'fenster-2fluegel' }), false));

console.log(`\nGrundpreis: ${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
