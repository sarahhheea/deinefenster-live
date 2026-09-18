// Test: Jedes im Code benutzte Symbol muss in der ausgelieferten Schrift stecken.
//
// Der reale Fehler (18.09.2026, aus dem Betrieb gemeldet): Auf shop-einstellen.html standen
// 21 Symbole als nackte Wörter quer über den Kacheln — "CROP_FREE", "ROLLER_SHADES",
// "CIRCLE", "arch". Die Icon-Schrift ist auf die benutzten Symbole beschnitten (11 KB
// statt 339 KB); wer ein neues Symbol im Code verwendet, ohne die Schrift neu zu
// beschneiden, bekommt an dessen Stelle den Namen als Text. Auffallen tut das nur dem,
// der die Seite ansieht — kein Skript meldet es, die Seite funktioniert ja.
//
// Beschnitten wird mit pyftsubset (statische Instanz FILL 0, wght 400, GRAD 0, opsz 24,
// --no-layout-closure — ohne das zieht die Ligatur-Aufloesung die halbe Schrift mit:
// 256 KB statt 12 KB). Dabei muessen ALLE Zeichen der Namen rein, Ziffern eingeschlossen,
// sonst faellt z.B. inventory_2 still heraus.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { TextDecoder } = require('util');

const WURZEL = path.join(__dirname, '..');
let pass = 0, fail = 0;
function t(name, fn){ try { fn(); pass++; } catch(e){ fail++; console.log('  ✗ '+name+' → '+e.message); } }

/* Welche Symbole liegen in der Schrift? Die Namen stehen als Ligaturen in der
   GSUB-Tabelle; ohne Abhaengigkeit lesen wir sie ueber fontTools per Python. */
function symboleInDerSchrift() {
  const { execFileSync } = require('child_process');
  const skript = `
import json,sys
from fontTools.ttLib import TTFont
f=TTFont(sys.argv[1]); cmap={v:k for k,v in f.getBestCmap().items()}
out=set()
for lu in f['GSUB'].table.LookupList.Lookup:
    for st in lu.SubTable:
        e = st.ExtSubTable if st.__class__.__name__=='ExtensionSubst' else st
        if e.__class__.__name__!='LigatureSubst': continue
        for first, ls in e.ligatures.items():
            for l in ls:
                out.add(''.join(chr(cmap[g]) for g in [first]+list(l.Component) if g in cmap))
print(json.dumps(sorted(out)))`;
  const roh = execFileSync('python3', ['-c', skript,
    path.join(WURZEL, 'fonts', 'material-symbols-outlined.woff2')], { encoding: 'utf8' });
  return new Set(JSON.parse(roh));
}

/* Welche Symbole benutzt der Code? Statische Tags und die Namen aus den
   Datenlisten (icon: '…'), aus denen die Karten gebaut werden. */
function symboleImCode() {
  const treffer = new Map();
  const dateien = [];
  for (const d of fs.readdirSync(WURZEL)) if (d.endsWith('.html')) dateien.push(d);
  for (const d of fs.readdirSync(path.join(WURZEL, 'js'))) if (d.endsWith('.js')) dateien.push('js/' + d);
  for (const datei of dateien) {
    const s = fs.readFileSync(path.join(WURZEL, datei), 'utf8');
    const muster = [
      /material-symbols-outlined[^>]*>\s*([a-z][a-z0-9_]{2,30})\s*</g,
      /\bicon\s*:\s*['"]([a-z][a-z0-9_]{2,30})['"]/g,
      /\bsymbol\s*:\s*['"]([a-z][a-z0-9_]{2,30})['"]/g,
    ];
    for (const m of muster) {
      let x;
      while ((x = m.exec(s)) !== null) {
        if (!treffer.has(x[1])) treffer.set(x[1], []);
        if (!treffer.get(x[1]).includes(datei)) treffer.get(x[1]).push(datei);
      }
    }
  }
  return treffer;
}

const inSchrift = symboleInDerSchrift();
const imCode = symboleImCode();

t('die Schrift enthaelt ueberhaupt Symbole', () =>
  assert.ok(inSchrift.size > 100, 'nur ' + inSchrift.size + ' Symbole — ist die Datei kaputt?'));

t('der Code benutzt Symbole, die gefunden werden', () =>
  assert.ok(imCode.size > 50, 'nur ' + imCode.size + ' gefunden — greifen die Suchmuster noch?'));

t('KEIN benutztes Symbol fehlt in der Schrift (sonst steht sein Name als Wort auf der Seite)', () => {
  const fehlend = [...imCode.keys()].filter(n => !inSchrift.has(n))
    .map(n => n + ' (in ' + imCode.get(n).join(', ') + ')');
  assert.deepStrictEqual(fehlend, [],
    '\n    Diese Symbole erscheinen als Text:\n    - ' + fehlend.join('\n    - ') +
    '\n    Schrift neu beschneiden, nicht das Symbol im Code stehen lassen.');
});

t('inventory_2 ist drin — Ziffern in Symbolnamen sind die klassische Luecke', () =>
  assert.ok(inSchrift.has('inventory_2')));

t('die Schrift bleibt klein (der Beschnitt ist der Grund fuer ihre Existenz)', () => {
  const kb = fs.statSync(path.join(WURZEL, 'fonts', 'material-symbols-outlined.woff2')).size / 1024;
  assert.ok(kb < 40, 'Schrift ist ' + kb.toFixed(0) + ' KB — vermutlich ohne --no-layout-closure beschnitten');
});

console.log('\nIcon-Subset: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
