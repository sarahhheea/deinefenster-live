// Test: Öffnungsanzeige im Shop.
// Der reale Fehler (gefunden 19.09.2026): Die Anzeige im Shop kannte nur den Freitag.
// Wer am Samstag 11 Uhr in den Shop sah, las „Geschlossen — nächste Öffnung: Freitag",
// obwohl der Hof samstags 10–13 Uhr offen hatte. Am Samstag kamen null Kunden.
// Die Zeiten kommen jetzt aus dem einen Jahresplan (js/hofverkauf-hinweis.js).
const assert = require('assert');
const { oeffnungAm, oeffnungsStatus, zeitenKurz } = require('../js/oeffnungszeiten-util.js');

const PLAN = {
  samstagVon: '2026-09-01', samstagBis: '2026-12-05',
  sonderVon: '2026-12-01', sonderBis: '2026-12-07', sonderZu: ['2026-12-06'],
  pauseVon: '2026-12-08', wiederAb: '2027-01-15'
};
const d = (s) => new Date(s);   // lokale Zeit

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

t('Samstag 19.09. 11 Uhr ist offen bis 13', () => {
  const s = oeffnungsStatus(d('2026-09-19T11:00:00'), PLAN);
  assert.strictEqual(s.offen, true); assert.strictEqual(s.bis, 13);
});
t('Samstag 13:30 ist zu, nächste Öffnung Freitag 25.09.', () => {
  const s = oeffnungsStatus(d('2026-09-19T13:30:00'), PLAN);
  assert.strictEqual(s.offen, false);
  assert.strictEqual(s.naechste.tag.getDate(), 25); assert.strictEqual(s.naechste.von, 10);
});
t('Donnerstag: nächste Öffnung Freitag 10–17', () => {
  const s = oeffnungsStatus(d('2026-09-24T09:00:00'), PLAN);
  assert.strictEqual(s.naechste.tag.getDate(), 25); assert.strictEqual(s.naechste.bis, 17);
});
t('Freitag 18 Uhr: nächste Öffnung Samstag 10–13', () => {
  const s = oeffnungsStatus(d('2026-09-25T18:00:00'), PLAN);
  assert.strictEqual(s.naechste.tag.getDate(), 26); assert.strictEqual(s.naechste.bis, 13);
});
t('Samstag vor der Saison (29.08.) ist zu', () => {
  assert.strictEqual(oeffnungAm(d('2026-08-29T11:00:00'), PLAN), null);
});
t('Sonderwoche: Mittwoch 2.12. offen 10–17', () => {
  assert.deepStrictEqual(oeffnungAm(d('2026-12-02T11:00:00'), PLAN), { von: 10, bis: 17 });
});
t('Sonderwoche: Samstag 5.12. gilt 10–17, nicht 10–13', () => {
  assert.deepStrictEqual(oeffnungAm(d('2026-12-05T11:00:00'), PLAN), { von: 10, bis: 17 });
});
t('Sonntag 6.12. zu', () => {
  assert.strictEqual(oeffnungAm(d('2026-12-06T11:00:00'), PLAN), null);
});
t('Jahrespause: Freitag 11.12. zu, nächste Öffnung 15.01.2027', () => {
  const s = oeffnungsStatus(d('2026-12-11T11:00:00'), PLAN);
  assert.strictEqual(s.offen, false);
  assert.strictEqual(s.naechste.tag.getFullYear(), 2027);
  assert.strictEqual(s.naechste.tag.getMonth(), 0); assert.strictEqual(s.naechste.tag.getDate(), 15);
});
t('Ohne Plan: nur Freitag (alte Regel als Rückfall)', () => {
  assert.strictEqual(oeffnungAm(d('2026-09-19T11:00:00'), null), null);
  assert.deepStrictEqual(oeffnungAm(d('2026-09-25T11:00:00'), null), { von: 10, bis: 17 });
});

t('Zeiten-Text in der Saison nennt den Samstag', () => {
  assert.strictEqual(zeitenKurz(d('2026-09-19T11:00:00'), PLAN), 'Fr 10–17 · Sa 10–13 Uhr');
});
t('Zeiten-Text ausserhalb der Saison nur Freitag', () => {
  assert.strictEqual(zeitenKurz(d('2027-03-01T11:00:00'), PLAN), 'Fr 10–17 Uhr');
});

console.log(`oeffnungszeiten: ${pass} ok, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
