// Test: Was der Kunde ins Suchfeld tippt, als Maß verstehen.
// Gefunden am 20.09.2026 in der Prüfung auf der Live-Seite:
//   „100x120"   (Kunde denkt in Zentimetern) wurde als 100 × 120 MILLIMETER gelesen
//               → winziges Fenster, „keiner trifft es genau", kein Hinweis.
//   „1,00 x 1,20 m" wurde gar nicht erkannt.
//   „10o0x1200" (Tippfehler) scheiterte still, ohne jede Meldung.
// Regel: Maße unter 320 sind für ein Fenster unrealistisch klein — das ist dann Zentimeter.
// Diese Umrechnung gilt NUR für Kundeneingaben, nicht für Produkttexte (dort kann „4x16x4"
// ein Glasaufbau sein).
const assert = require('assert');
const { massAusKundeneingabe, ohneMassText } = require('../js/shop-mass-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }
const g = (s) => massAusKundeneingabe(s);

t('Millimeter normal', () => assert.deepStrictEqual(g('1000x1200'), { breite:1000, hoehe:1200, einheit:'mm' }));
t('mit Leerzeichen und ×', () => assert.deepStrictEqual(g('1000 × 1200'), { breite:1000, hoehe:1200, einheit:'mm' }));
t('Text davor', () => assert.deepStrictEqual(g('Balkontür 1000x1200'), { breite:1000, hoehe:1200, einheit:'mm' }));
t('Zentimeter: 100x120 wird 1000x1200', () => assert.deepStrictEqual(g('100x120'), { breite:1000, hoehe:1200, einheit:'cm' }));
t('Zentimeter mit Einheit', () => assert.deepStrictEqual(g('100 x 120 cm'), { breite:1000, hoehe:1200, einheit:'cm' }));
t('Meter mit Komma', () => assert.deepStrictEqual(g('1,00 x 1,20 m'), { breite:1000, hoehe:1200, einheit:'m' }));
t('Meter mit Punkt', () => assert.deepStrictEqual(g('1.5x1.2m'), { breite:1500, hoehe:1200, einheit:'m' }));
t('Meter ohne Einheit erkannt', () => assert.deepStrictEqual(g('1,2 x 0,9'), { breite:1200, hoehe:900, einheit:'m' }));
t('Grenzfall 320 bleibt Millimeter', () => assert.deepStrictEqual(g('320x300'), { breite:320, hoehe:300, einheit:'mm' }));
t('mm ausdrücklich bleibt mm', () => assert.deepStrictEqual(g('300 x 200 mm'), { breite:300, hoehe:200, einheit:'mm' }));
t('Tippfehler ergibt nichts', () => assert.strictEqual(g('10o0x1200'), null));
t('nur eine Zahl ergibt nichts', () => assert.strictEqual(g('1000'), null));
t('leer ergibt nichts', () => assert.strictEqual(g(''), null));
t('Stichwort ergibt nichts', () => assert.strictEqual(g('Balkontür weiß'), null));
t('unrealistisch grosse Werte ergeben nichts', () => assert.strictEqual(g('99999x88888'), null));

t('Maß aus dem Suchtext entfernen: cm-Schreibweise', () => assert.strictEqual(ohneMassText('120 x 80 cm'), ''));
t('Maß entfernen, Stichwort bleibt', () => assert.strictEqual(ohneMassText('Balkontür 1000x1200'), 'Balkontür'));
t('Maß entfernen, Meter', () => assert.strictEqual(ohneMassText('1,00 x 1,20 m weiß'), 'weiß'));
t('ohne Maß bleibt alles stehen', () => assert.strictEqual(ohneMassText('Balkontür weiß'), 'Balkontür weiß'));

console.log(`Kundenmaß: ${pass} ok, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
