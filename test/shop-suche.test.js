// Test: tolerante Standnummer-Suche im Shop.
// Der reale Bug: Kunde nennt "741B" / "Nr 741", Daten liegen als "741 B" → kein Treffer.
const assert = require('assert');
const { normNr, nummerTreffer } = require('../js/shop-suche-util.js');

let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

// normNr: alles auf Ziffern+Buchstaben ohne Leerzeichen/Punkt/„Nr."/„Stand"
t('normNr "741 B" → 741b', ()=> assert.strictEqual(normNr('741 B'),'741b'));
t('normNr "741B" → 741b',  ()=> assert.strictEqual(normNr('741B'),'741b'));
t('normNr "Nr. 741 B" → 741b', ()=> assert.strictEqual(normNr('Nr. 741 B'),'741b'));
t('normNr "Stand 741b" → 741b', ()=> assert.strictEqual(normNr('Stand 741b'),'741b'));
t('normNr "  752 " → 752', ()=> assert.strictEqual(normNr('  752 '),'752'));

// nummerTreffer(query, standnummer)
t('741B findet "741 B"',   ()=> assert.ok(nummerTreffer('741B','741 B')));
t('nr 741 findet "741 B"', ()=> assert.ok(nummerTreffer('nr 741','741 B')));
t('741 findet "741 B"',    ()=> assert.ok(nummerTreffer('741','741 B')));
t('741 b findet "741 B"',  ()=> assert.ok(nummerTreffer('741 b','741 B')));
t('741 findet NICHT "752"', ()=> assert.ok(!nummerTreffer('741','752')));
t('kellerfenster (keine Ziffer) → kein Nummer-Treffer', ()=> assert.ok(!nummerTreffer('kellerfenster','741 B')));
t('leere Standnummer → kein Treffer', ()=> assert.ok(!nummerTreffer('741',null)));
t('einzelne Ziffer "7" matcht nicht alles', ()=> assert.ok(!nummerTreffer('7','741 B')));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
