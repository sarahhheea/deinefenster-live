// Test: Bearbeiten darf ein archiviertes Inserat nicht in den Shop zurückholen.
//
// Der reale Fehler (18.09.2026 in der Historie nachgewiesen): Zwischen dem 01.09. und
// dem 11.09.2026 sind 13 archivierte Inserate wieder im Kunden-Shop aufgetaucht, ohne
// dass jemand „Wieder aktivieren" gedrückt hätte. Alle 15 Vorgänge trugen den Titel
// „Inserat aktualisiert" — es waren Korrekturen an archivierter Ware. Ursache: das
// Formular schickte hart `aktiv: true`, und das Schreiben ersetzte den Datensatz
// vollständig. Die Inserate waren bewusst aus dem Verkauf genommen; ein Tippfehler-Fix
// am Titel darf sie nicht wieder verkäuflich machen.
const assert = require('assert');
const { istArchiviert, bewahreArchivStatus } = require('../js/shop-archiv-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

const archiviert = { id: 'p_1', titel: 'Kellerfenster', aktiv: false };
const sichtbar   = { id: 'p_2', titel: 'Kellerfenster', aktiv: true };
const altohne    = { id: 'p_3', titel: 'Altes Inserat ohne aktiv-Feld' };

/* ── Lesart: nur exakt false heißt archiviert ─────────────────────────── */
t('aktiv:false ist archiviert', () => assert.strictEqual(istArchiviert(archiviert), true));
t('aktiv:true ist nicht archiviert', () => assert.strictEqual(istArchiviert(sichtbar), false));
t('fehlendes aktiv-Feld ist nicht archiviert (Alt-Inserate bleiben sichtbar)', () =>
  assert.strictEqual(istArchiviert(altohne), false));
t('aktiv:0 ist NICHT archiviert — nur echtes false zaehlt (gleiche Lesart wie shop.js)', () =>
  assert.strictEqual(istArchiviert({ aktiv: 0 }), false));

/* ── DER BUG: Formular schickt aktiv:true, Inserat war archiviert ─────── */
t('BUG 18.09.: Bearbeiten mit aktiv:true holt archiviertes Inserat NICHT zurueck', () =>
  assert.strictEqual(
    bewahreArchivStatus(archiviert, { titel: 'Kellerfenster korrigiert', aktiv: true }).aktiv,
    false));

t('auch ohne aktiv im Formular bleibt archiviert archiviert', () =>
  assert.strictEqual(
    bewahreArchivStatus(archiviert, { titel: 'Kellerfenster korrigiert' }).aktiv,
    false));

t('sichtbares Inserat bleibt nach dem Bearbeiten sichtbar', () =>
  assert.strictEqual(
    bewahreArchivStatus(sichtbar, { titel: 'neuer Titel' }).aktiv,
    true));

t('Alt-Inserat ohne aktiv-Feld wird beim Bearbeiten nicht versehentlich archiviert', () =>
  assert.strictEqual(
    bewahreArchivStatus(altohne, { titel: 'neuer Titel' }).aktiv,
    true));

/* ── Die beiden Knoepfe duerfen weiterhin bestimmen ───────────────────── */
t('"Archivieren" nimmt ein sichtbares Inserat aus dem Shop', () =>
  assert.strictEqual(bewahreArchivStatus(sichtbar, { titel: 'x' }, true).aktiv, false));
t('"Wieder aktivieren" holt ein archiviertes Inserat zurueck', () =>
  assert.strictEqual(bewahreArchivStatus(archiviert, { titel: 'x' }, false).aktiv, true));

/* ── Alle uebrigen Felder muessen unveraendert durchgehen ─────────────── */
t('Preis, Bilder und Standnummer gehen unveraendert durch', () => {
  const e = { titel: 'x', preis_eur: 180, bilder: ['a.webp'], standnummer: 'R 2903 A', aktiv: true };
  const neu = bewahreArchivStatus(archiviert, e);
  assert.strictEqual(neu.preis_eur, 180);
  assert.deepStrictEqual(neu.bilder, ['a.webp']);
  assert.strictEqual(neu.standnummer, 'R 2903 A');
});
t('der uebergebene Eintrag wird nicht veraendert (keine Nebenwirkung)', () => {
  const e = { titel: 'x', aktiv: true };
  bewahreArchivStatus(archiviert, e);
  assert.strictEqual(e.aktiv, true);
});

/* ── Produktdatei: kein Inserat darf einen kaputten Archiv-Wert haben ── */
const fs = require('fs');
const path = require('path');
t('Produktdatei: aktiv ist ueberall entweder true, false oder gar nicht gesetzt', () => {
  const datei = path.join(__dirname, '..', 'data', 'shop-produkte.json');
  const produkte = JSON.parse(fs.readFileSync(datei, 'utf8')).produkte || [];
  const kaputt = produkte.filter(p => 'aktiv' in p && p.aktiv !== true && p.aktiv !== false);
  assert.deepStrictEqual(kaputt.map(p => p.id), [],
    'Inserate mit unklarem aktiv-Wert — die waeren im Shop sichtbar, obwohl unklar ist, ob sie es sein sollen');
});

/* ── Die echte Schreibfunktion, nicht nur die Hilfsfunktion ───────────
   Der Fehler sass in _updateProdukt in js/sheets-config.js. Dieser Test laedt
   genau diese Funktion aus der ausgelieferten Datei und laesst sie gegen eine
   nachgebaute Produktdatei laufen. Faellt der Schutz dort jemals wieder raus,
   schlaegt dieser Test an — und nicht erst der Betrieb, wenn Ware wieder im Shop steht. */
const quelltext = fs.readFileSync(path.join(__dirname, '..', 'js', 'sheets-config.js'), 'utf8');
const treffer = quelltext.match(/async function _updateProdukt[\s\S]*?\n}/);

t('js/sheets-config.js enthaelt _updateProdukt', () =>
  assert.ok(treffer, '_updateProdukt nicht gefunden — wurde die Datei umgebaut?'));

async function updateLaufenLassen(gespeichert, eintrag) {
  let datei = { produkte: [gespeichert] };
  const bauen = new Function('bewahreArchivStatus', '_writeJSON',
    treffer[0] + '; return _updateProdukt;');
  const _updateProdukt = bauen(bewahreArchivStatus, async (fn) => { fn(datei); });
  const res = await _updateProdukt(gespeichert.id, eintrag);
  return { res, produkt: datei.produkte[0] };
}

/* Der Lauf ist asynchron, deshalb ausserhalb von t() mit echtem await —
   ein Promise in t() wuerde einen Fehlschlag verschlucken und gruen melden. */
async function pruefeUpdate() {
  const { produkt } = await updateLaufenLassen(
    { id: 'p_1', titel: 'alt', preis_eur: 100, aktiv: false },
    { titel: 'korrigiert', preis_eur: 120, aktiv: true });
  t('_updateProdukt haelt ein archiviertes Inserat archiviert (der Fehler vom 01.-11.09.)', () => {
    assert.strictEqual(produkt.aktiv, false, 'Inserat stand wieder im Shop');
    assert.strictEqual(produkt.titel, 'korrigiert', 'Korrektur wurde nicht uebernommen');
    assert.strictEqual(produkt.preis_eur, 120, 'Preis wurde nicht uebernommen');
    assert.strictEqual(produkt.id, 'p_1', 'ID ging verloren');
  });

  const sichtbar = await updateLaufenLassen(
    { id: 'p_2', titel: 'alt', aktiv: true }, { titel: 'neu' });
  t('_updateProdukt laesst ein sichtbares Inserat sichtbar', () =>
    assert.strictEqual(sichtbar.produkt.aktiv, true));

  console.log('\nArchiv-Status: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen');
  process.exit(fail ? 1 : 0);
}
pruefeUpdate();
