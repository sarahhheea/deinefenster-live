// Test: Fenster-Vorgaben nur bei Fenster-Artikeln.
// Hintergrund (30.09.2026): Der Shop setzte bei jedem Artikel ohne Angabe
// „Dreh-Kipp“, „Kunststoff“, „weiß“ und „Klarglas“ ein — auch bei Dämmrollen.
// Die Detailansicht zeigte dann „Öffnungsart Dreh-Kipp“ an einer Dämmrolle.
const assert = require('assert');
const { vorgabenFuer, istOhneFensterFelder, daemmungAbholText, lesbarerSchluessel } = require('../js/shop-artikelart-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

t('Dämmung bekommt keine Öffnungsart', () =>
  assert.deepStrictEqual(vorgabenFuer('daemmung').oeffnungsart, []));
t('Dämmung bekommt kein Material „kunststoff“', () =>
  assert.deepStrictEqual(vorgabenFuer('daemmung').material, []));
t('Dämmung bekommt keine Farbe „weiss“', () =>
  assert.deepStrictEqual(vorgabenFuer('daemmung').farbe, []));
t('Dämmung bekommt kein Klarglas', () =>
  assert.deepStrictEqual(vorgabenFuer('daemmung').glasart, []));
t('Garagentor und Baumaterial ebenfalls ohne Fenster-Vorgaben', () => {
  assert.deepStrictEqual(vorgabenFuer('garagentor-gebraucht').oeffnungsart, []);
  assert.deepStrictEqual(vorgabenFuer('baumaterialien').material, []);
});
t('Fenster behalten die bisherigen Vorgaben', () =>
  assert.deepStrictEqual(vorgabenFuer('fenster'),
    { material: ['kunststoff'], farbe: ['weiss'], glasart: ['klarglas'], oeffnungsart: ['dreh-kipp'] }));
t('Unbekannte Gruppe verhält sich wie bisher (Fenster)', () =>
  assert.deepStrictEqual(vorgabenFuer('').oeffnungsart, ['dreh-kipp']));
t('istOhneFensterFelder erkennt Dämmung', () =>
  assert.strictEqual(istOhneFensterFelder('daemmung'), true));
t('istOhneFensterFelder: Fenster nein', () =>
  assert.strictEqual(istOhneFensterFelder('fenster'), false));
t('Dämmung-Abholtext: Termin + 200 km + ab 30 Rollen kostenlos', () => {
  assert.ok(/Terminabsprache/.test(daemmungAbholText));
  assert.ok(/200 km/.test(daemmungAbholText));
  assert.ok(/ab 30 Rollen kostenlos/.test(daemmungAbholText));
});

// Eigenschaften-Anzeige: Freitext bleibt wie eingegeben (vorher „WäRmeleitfäHigkeit … W/(M·K)“)
t('Freitext mit Umlaut und Einheit bleibt unverändert', () =>
  assert.strictEqual(lesbarerSchluessel('Wärmeleitfähigkeit λ: 0,044 W/(m·K)'), 'Wärmeleitfähigkeit λ: 0,044 W/(m·K)'));
t('Freitext „Dicke: 150 mm“ bleibt klein bei mm', () =>
  assert.strictEqual(lesbarerSchluessel('Dicke: 150 mm'), 'Dicke: 150 mm'));
t('Schlüssel „null-schwelle“ wird „Null Schwelle“', () =>
  assert.strictEqual(lesbarerSchluessel('null-schwelle'), 'Null Schwelle'));
t('Schlüssel mit Umlaut „tür-öffner“ wird „Tür Öffner“', () =>
  assert.strictEqual(lesbarerSchluessel('tür-öffner'), 'Tür Öffner'));

t('Freitext klein beginnend bekommt nur großen Anfangsbuchstaben', () =>
  assert.strictEqual(lesbarerSchluessel('hersteller: isover, 150 mm'), 'Hersteller: isover, 150 mm'));

console.log(`shop-artikelart: ${pass} ok, ${fail} Fehler`);
process.exit(fail ? 1 : 0);
