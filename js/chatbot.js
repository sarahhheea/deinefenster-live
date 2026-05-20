/**
 * DeineFenster.de — KI-Chatbot Widget
 * Regelbasiert (sofort funktionsfähig) · Upgrade auf echte KI via Cloudflare Worker möglich.
 */

const WORKER_URL = ''; // Leer = regelbasierter Modus. Worker-URL eintragen für echte KI.

// ─── Regelwerk ─────────────────────────────────────────────────────────────────
// Reihenfolge ist entscheidend — spezifisch vor allgemein, bekannte Konflikte zuerst
const RULES = [

  // ── Begrüßung ────────────────────────────────────────────────────────────────
  {
    keys: ['hallo','hey','guten tag','moin','guten morgen','guten abend','servus','hi!'],
    answer: 'Hallo! 👋 Ich helfe dir bei Fragen zu Fenstern, Türen, Lieferung, Förderung und unserem Hofverkauf. Was möchtest du wissen?'
  },

  // ── Schutzfolie (VOR Pflege) ─────────────────────────────────────────────────
  {
    keys: ['schutzfolie','folie abziehen','folie entfernen','folie drauf','folie kleben','folie fenster','folie klebt','klebt am fenster','klebt auf'],
    answer: '⚠️ <strong>Schutzfolie sofort nach dem Einbau abziehen!</strong> Bei längerem UV-Kontakt klebt sie sich dauerhaft in den Rahmen — kaum mehr zu entfernen. Handwerker vergessen das häufig. Bitte nach der Montage kurz kontrollieren.'
  },

  // ── Kondensation / Beschlag ──────────────────────────────────────────────────
  {
    keys: ['kondensation','beschlägt','beschlagen','schwitzwasser','tauwasser','wasser am fenster','fenster schwitzen','innen beschlagen','außen beschlagen','feuchtigkeit fenster','schwitzt','wasser zwischen','zwischen den scheiben','zwischen scheiben'],
    answer: '🌡️ <strong>Beschlag am Fenster — was steckt dahinter:</strong><br><br>• <strong>Innen beschlagen</strong> = zu hohe Luftfeuchtigkeit im Raum. Lösung: 3–4× täglich <strong>stoßlüften</strong> (5 Min. voll öffnen — nicht kippen!).<br>• <strong>Außen beschlagen</strong> (morgens) = sehr gute Dämmung. Das ist ein Qualitätsmerkmal, kein Fehler!<br>• <strong>Zwischen den Scheiben</strong> = defekte Dichtung → Garantiefall. Bitte Foto per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> schicken.'
  },

  // ── Pflege / Wartung ──────────────────────────────────────────────────────────
  {
    keys: ['pflege','warten','wartung','reinigen','putzen','ölen','schmieren','dichtung','gummidichtung','fenster einstellen','klemmt','schließt nicht','knarrt'],
    answer: '🧹 <strong>Fenster richtig pflegen:</strong><br><br>• <strong>Rahmen</strong>: mildes Seifenwasser, keine Lösungsmittel oder Scheuermittel<br>• <strong>Beschläge ölen</strong>: 1× jährlich (Maschinenöl oder Fensterpflegeöl)<br>• <strong>Dichtungen</strong>: 1× jährlich mit Glycerin einreiben — bleiben elastisch und dichten besser<br>• <strong>Klemmt / schließt schlecht</strong>: meist durch einfaches Nachstellen des Beschlags zu beheben — Anleitung auf Anfrage per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── Lüften / Schimmel ────────────────────────────────────────────────────────
  {
    keys: ['lüften','stoßlüften','dauerlüften','kipplüften','schimmel','schimmelgefahr','lüftung','wie oft lüften','richtig lüften'],
    answer: '💨 <strong>Richtig lüften mit neuen Fenstern:</strong><br><br>Neue dichte Fenster dämmen so gut, dass du aktiv lüften musst — die „natürliche Undichtigkeit" alter Fenster fehlt.<br><br>✅ <strong>Stoßlüften</strong>: 5 Min. voll öffnen, 3–4× täglich — am effektivsten<br>❌ <strong>Dauerkippen vermeiden</strong>: kühlt Wände aus, erhöht Schimmelgefahr<br><br>Bad & Küche: Lüftungsanlage oder Abzugshaube empfohlen.'
  },

  // ── Widerruf / Rückgabe (Legal §312g BGB) ───────────────────────────────────
  {
    keys: ['widerruf','widerrufsrecht','zurückgeben','rückgabe','rückgaberecht','stornieren','storno','kann ich stornieren','bestellung stornieren','umtauschen'],
    answer: '⚠️ <strong>Kein Widerrufsrecht bei Maßfenstern.</strong><br><br>Fenster werden mm-genau nach deinen individuellen Angaben gefertigt — sie sind nach <strong>§312g Abs. 2 Nr. 1 BGB</strong> von der Rückgabe ausgenommen. Das gilt für alle Fenster-Online-Shops, nicht nur bei uns.<br><br>Daher: Maße und Angebot sorgfältig prüfen, <strong>dann erst überweisen</strong>. Fehler im Angebot vor der Überweisung? Sofort Bescheid geben — wir korrigieren das kostenlos.'
  },

  // ── Lieferkosten (VOR Preis) ─────────────────────────────────────────────────
  {
    keys: ['lieferkosten','versandkosten','versand kostet','porto','kostet die lieferung','kostet versand','kostet lieferung','lieferung kostet','was kostet versand','was kostet lieferung','versandkostenfrei'],
    answer: '🚚 <strong>Lieferkosten:</strong><br><br>• <strong>Kostenlos</strong> ab 4.000 € oder ab 10 Fensterelementen<br>• <strong>200 €</strong> Versandpauschale bei 5–9 Elementen<br>• Einzelne Hebeschiebetür: <strong>300 €</strong><br>• Lager- & Gebrauchtware: <strong>nur Selbstabholung</strong> in Brandenburg<br><br>Lieferung per Spedition deutschlandweit, mit eigenem Stapler beim Kunden.'
  },

  // ── Förderung (VOR Preis) ────────────────────────────────────────────────────
  {
    keys: ['förderung','fördermittel','foerderung','bafa','kfw','zuschuss','staatlich','subvention','beg','förderfähig','foerderfähig','steuer absetzen','steuerlich absetzbar','gefördet','gefordert'],
    answer: '💰 <strong>Förderung für neue Fenster (Stand 2026):</strong><br><br>• <strong>BAFA BEG EM</strong>: bis <strong>15% Zuschuss</strong> für IGLO Energy (Uw 0,71) und IGLO Edge (Uw 0,66). Antrag <strong>vor</strong> Bestellung auf bafa.de stellen!<br>• <strong>KfW 458</strong>: gilt <strong>nicht mehr</strong> für Einzelmaßnahmen (nur noch in Kombination mit Komplettsanierung)<br>• <strong>IGLO 5 Classic (Uw 0,83)</strong>: nicht BAFA-förderfähig<br>• <strong>Steuer</strong>: 20% der Handwerker-Lohnkosten absetzbar (§35a EStG) — nur Arbeitsleistung, nicht Material<br><br>⚠️ Angaben ohne Gewähr — bitte bafa.de und Steuerberater prüfen.'
  },

  // ── Haustüren ────────────────────────────────────────────────────────────────
  {
    keys: ['haustür','haustüren','eingangstür','außentür'],
    answer: 'Ja, wir führen <strong>Drutex-Haustüren</strong> in vielen Modellen — RAL-Farben und Holzdekore verfügbar. Im <a href="haustuer-3d.html">Haustür-3D-Konfigurator</a> kannst du Modell und Farbe direkt visualisieren. Angebot: <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>.'
  },

  // ── Haustür Maße / DIN ───────────────────────────────────────────────────────
  {
    keys: ['haustür maße','haustür größe','haustür breite','haustür höhe','türmaße','türgröße','norm haustür','din haustür','standard haustür'],
    answer: '📐 <strong>Standard-Haustürmaße (nach DIN):</strong><br><br>• Türblatt: <strong>1000 × 2100 mm</strong> (Breite × Höhe) — häufigste Variante<br>• Auch üblich: 900 mm oder 1100 mm Breite<br>• Rohbauöffnung: ca. 60–80 mm größer als Türblatt einrechnen<br><br>Wir fertigen auch Sondermaße — einfach Rohbaumaß per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> schicken.'
  },

  // ── Haustür Einbruchschutz ───────────────────────────────────────────────────
  {
    keys: ['haustür einbruch','haustür sicherheit','einbruchsichere haustür','türschloss','mehrfachverriegelung haustür'],
    answer: 'Drutex-Haustüren haben standardmäßig <strong>3-Punkt-Verriegelung</strong> + Stahlverstärkung. Auf Anfrage auch <strong>RC2-zertifiziert</strong> (für Erdgeschoss empfohlen). Details per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── Preis ───────────────────────────────────────────────────────────────────
  {
    keys: ['preis','kosten','kostet','wie viel','wieviel','teuer','günstig','budget','ab welchem','was kostet ein'],
    answer: 'Der Preis hängt von Maßen, Profil, Farbe und Verglasung ab — wir erstellen für jede Anfrage ein individuelles Angebot.<br><br>📩 <strong>Schreib uns:</strong> Maße, Fenstertyp und Farbe — wir melden uns mit einem konkreten Preis:<br><br><a href="https://wa.me/491717263776" target="_blank" style="display:inline-block;margin-top:4px;padding:7px 14px;background:rgba(118,169,250,0.15);border:1px solid rgba(118,169,250,0.3);border-radius:8px;color:#76a9fa;text-decoration:none;font-weight:700;font-size:12px;">💬 WhatsApp 0171 7263776</a>'
  },

  // ── Transportschaden ─────────────────────────────────────────────────────────
  {
    keys: ['transportschaden','lieferschaden','beschädigt angekommen','kaputt geliefert','schaden bei lieferung','kaputt angekommen'],
    answer: '⚠️ <strong>Transportschäden sofort bei Anlieferung melden!</strong><br><br>1. Lieferschein <strong>vor</strong> dem Unterschreiben auf Schäden prüfen<br>2. Schäden auf dem Lieferschein notieren oder Annahme verweigern<br>3. Fotos machen → sofort kontaktieren: <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> oder <a href="tel:+493381214837">03381 / 214 83 73</a><br><br>Nachträglich gemeldete Transportschäden sind kaum durchsetzbar!'
  },

  // ── Lieferzeit ──────────────────────────────────────────────────────────────
  {
    keys: ['lieferzeit','wann kommt','wann liefert','geliefert','lieferung','liefern','zustellung','wann fertig','dauert die lieferung','wie lange dauert','abholen','selbst abholen','abholung','lager abholen','wie lange bis','wie lange brauchts','wann da','wann ist es da','wann hab ich','wann bekomme ich'],
    answer: '📦 <strong>Lieferzeit: ca. 2 Wochen</strong> ab Bestellbestätigung bei Drutex — nach deinem Zahlungseingang. Feste Regel, kein „kommt drauf an".<br><br><strong>Versand deutschlandweit per Spedition:</strong><br>• <strong>Kostenlos</strong> ab 4.000 € Auftragswert <em>oder</em> ab 10 Fensterelementen<br>• <strong>200 €</strong> Pauschale bei 5–9 Elementen<br>• <strong>300 €</strong> bei einzelner Hebe-Schiebetür<br>• <strong>Selbstabholung</strong> kostenlos — Bestellung ins Lager Brandenburg<br><br><strong>Gebraucht- & Lagerware:</strong> nur Selbstabholung freitags 10–17 Uhr, kein Versand.'
  },

  // ── Einbau ──────────────────────────────────────────────────────────────────
  {
    keys: ['einbau','montage','montieren','einbauen','installieren','wer baut','monteur','handwerker','baut ihr','einbaukosten'],
    answer: 'Wir <strong>liefern nur</strong> — Einbau bieten wir selbst nicht an. Du beauftragst deinen Handwerker. Wichtig: Nicht-fachgerechte Montage lässt die Herstellergarantie erlöschen. Tipp: Frag ob dein Monteur bei der Lieferung vor Ort sein kann.'
  },

  // ── Ausmessen ───────────────────────────────────────────────────────────────
  {
    keys: ['ausmessen','aufmaß','maße nehmen','maß nehmen','fenster messen','wie messe','richtig messen','richtig ausmessen','lichte weite','rohbaumaß','einbaumaß','maße ermitteln'],
    answer: '📏 <strong>Fenster richtig ausmessen:</strong><br><br>Nicht das alte Fenster — sondern das <strong>Wandloch (Lichte Weite)</strong> messen:<br>• Breite: oben, mitte, unten → <strong>kleinsten Wert nehmen</strong><br>• Höhe: links, mitte, rechts → <strong>kleinsten Wert nehmen</strong><br>• Montagefuge: ca. <strong>1 cm pro Seite</strong> abziehen<br><br>📌 Beispiel: Wandloch 1182 × 982 mm → Bestellung <strong>1180 × 980 mm</strong><br><br>Unsicher? Foto per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> schicken — wir schauen drüber!'
  },

  // ── Fehlmessung ─────────────────────────────────────────────────────────────
  {
    keys: ['falsch gemessen','fehlmessung','haftet','haftung','falsches maß','wer haftet','was passiert wenn falsch'],
    answer: 'Bei selbst gemessenen Maßen liegt das Risiko bei dir — Fenster werden mm-genau gefertigt. Fehler im Angebot <strong>vor</strong> der Überweisung melden — dann korrigieren wir kostenlos. Nach Zahlungseingang und Produktionsstart nicht mehr möglich.'
  },

  // ── PSK vs HST ───────────────────────────────────────────────────────────────
  {
    keys: ['psk unterschied','hst unterschied','unterschied hebeschiebe','unterschied psk','parallel schiebe kipp','welche schiebetür besser','psk oder hst','welches system besser'],
    answer: '🔄 <strong>PSK vs. Hebe-Schiebetür (HST):</strong><br><br><strong>PSK (Parallel-Schiebe-Kipp)</strong>:<br>✓ Günstiger · Kippfunktion zum Lüften<br>✗ Nicht barrierefrei (hohe Bodenschwelle)<br><br><strong>HST (Hebe-Schiebetür)</strong>:<br>✓ Sehr leichtgängig auch bei großen Elementen · Null-Schwelle möglich<br>✗ Teurer · Keine Kippfunktion<br><br>Empfehlung: HST ab 2.500 mm Breite oder wenn barrierefrei gewünscht. Beratung: <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── Schiebetüren ────────────────────────────────────────────────────────────
  {
    keys: ['schiebetür','schiebtür','hebe-schiebe','hebeschiebe','hebe schiebe','psk','panoramatür','terrassenschiebe','große öffnung','sliding door'],
    answer: 'Wir fertigen <strong>Drutex Hebe-Schiebetüren</strong> bis zu <strong>6.500 mm Breite</strong> — ideal für große Terrassenöffnungen. Profile: IGLO HS, IGLO Energy PSK, IGLO 5 Classic PSK, IGLO Slide. Angebot: <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>.'
  },

  // ── Balkontüren ──────────────────────────────────────────────────────────────
  {
    keys: ['balkontür','balkontüren','terrassentür','terrassentüren','balkon','terrasse','terrassenausgang','balkonausgang'],
    answer: 'Ja, wir fertigen <strong>Drutex Balkontüren & Terrassentüren</strong> in allen IGLO-Profilen, maßgefertigt. Einzel- oder Doppeltür, mit oder ohne Rollo. Anfragen: <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> oder direkt im <a href="konfigurator.html">Konfigurator</a>.'
  },

  // ── Zahlung ─────────────────────────────────────────────────────────────────
  {
    keys: ['zahlen','zahlung','bezahlen','zahlungsart','zahlungsmöglichkeit','wie kann ich bezahlen','wie bezahle','wie zahle','barzahlung','bar zahlen','kann ich bar','überweisung','anzahlung','ratenzahlung','rate','auf rechnung','per rechnung','vorkasse','welche zahlungsarten','paypal'],
    answer: '💳 <strong>Zahlungsablauf:</strong><br><br>📦 <strong>Online-Bestellung:</strong><br>Konfigurieren → Angebot per E-Mail erhalten → <strong>Gesamtbetrag überweisen</strong> → wir bestellen bei Drutex<br><br>🏪 <strong>Vor-Ort (Hofverkauf freitags):</strong><br>Bar, EC-Karte oder PayPal — Zahlung nach der Abholung möglich<br><br>❌ Keine Ratenzahlung · Keine Teilzahlung · Keine Anzahlung'
  },

  // ── Gebrauchte kaufen ───────────────────────────────────────────────────────
  {
    keys: ['gebraucht','gebrauchte','occasion','hofverkauf','hof','besichtigen','vor ort','second hand','lagerware','lagerfenster'],
    answer: '♻️ Gebrauchte Fenster (wechselnder Bestand) gibt es jeden <strong>Freitag 10–17 Uhr</strong> auf dem Hof (Fohrder Landstraße 13, Brandenburg). Keine Reservierungen, kein Vorabverkauf. Selbstverladung, eigenes Fahrzeug mitbringen. Bis 20 Uhr nach Voranmeldung: <a href="tel:+493381214837">03381 / 214 83 73</a>.'
  },

  // ── Gebrauchte verkaufen ────────────────────────────────────────────────────
  {
    keys: ['fenster abgeben','fenster loswerden','ankaufen','nehmt ihr an','ihr kauft','fenster verkaufen','gebraucht verkaufen','kauft ihr','alte fenster kaufen','kaufen sie','nehmen sie gebraucht'],
    answer: 'Wir kaufen <strong>keine</strong> gebrauchten Fenster an.'
  },

  // ── Alte Fenster entsorgen ───────────────────────────────────────────────────
  {
    keys: ['alte fenster entsorgen','fenster entsorgen','altes fenster weg','wohin mit alten fenstern','entsorgung','recycling fenster','wo entsorgen'],
    answer: 'Alte PVC-Fenster zum <strong>Wertstoffhof</strong> bringen — dort kostenlos abgebbar (PVC-Recycling). Viele Handwerker nehmen beim Einbau die Altfenster gleich mit. Wir selbst nehmen keine Altfenster an.'
  },

  // ── Öffnungszeiten ──────────────────────────────────────────────────────────
  {
    keys: ['öffnungszeit','geöffnet','wann offen','wann da','freitag','wann auf','vorbeikommen','wann habt','besuch','aufgemacht','aufgemacht','öffnet','wann öffnet','wann kann ich kommen','öffnungszeiten'],
    answer: '🕙 <strong>Hofverkauf:</strong> Freitags <strong>10–17 Uhr</strong> (Fohrder Landstraße 13, Brandenburg). Bis 20 Uhr nach Voranmeldung: <a href="tel:+493381214837">03381 / 214 83 73</a>. Mo–Do und Sa–So kein Hofverkauf.<br><br>⚠️ Sommerferien und Feiertage: ggf. abweichende Zeiten — vorher kurz anrufen!<br><br><a href="kontakt.html" style="display:inline-block;margin-top:6px;padding:7px 14px;background:rgba(118,169,250,0.15);border:1px solid rgba(118,169,250,0.3);border-radius:8px;color:#76a9fa;text-decoration:none;font-weight:700;font-size:12px;">→ Kontaktseite</a>'
  },

  // ── Schallschutz ─────────────────────────────────────────────────────────────
  {
    keys: ['schallschutz','schallschutzklasse','ssk','lärm','lärmschutz','straßenlärm','dezibel','db ','geräusche','lärmdämmung','laut','schallgedämmt'],
    answer: '🔇 <strong>Schallschutzklassen (SSK):</strong><br><br>• <strong>SSK 1</strong> (25 dB) — ruhige Wohnlage<br>• <strong>SSK 2</strong> (30 dB) — normale Wohnstraße, Standard 3-fach-Verglasung<br>• <strong>SSK 3</strong> (35 dB) — Hauptstraßen, städtische Lage (empfohlen)<br>• <strong>SSK 4</strong> (40 dB) — stark befahrene Straßen, Bahnlinien<br><br>Für SSK 3–4 gibt es VSG-Verbundsicherheitsglas und asymmetrische Scheibenstärken. Anfrage per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── IGLO Profile ────────────────────────────────────────────────────────────
  {
    keys: ['iglo energy','iglo edge','iglo 5','7-kammer','passivhaus','profil','einbautiefe','82 mm','welches profil','profilsystem'],
    answer: '<strong>IGLO Energy</strong>: 7-Kammer, 82 mm, Uw 0,71 — Passivhaus-tauglich, BAFA-förderfähig<br><strong>IGLO Edge</strong>: Uw 0,66 — Premium<br><strong>IGLO 5 Classic</strong>: Uw 0,83 — Einstieg, günstiger, nicht BAFA-förderfähig<br><br>Alle Profile Klasse A nach EN 12608 (3 mm Wandstärke — höchste Qualitätsstufe).'
  },

  // ── 2-fach vs 3-fach ────────────────────────────────────────────────────────
  {
    keys: ['dreifach','3-fach','zweifach','2-fach','verglasung','uw-wert','u-wert','wärmeschutz','wärmedämmung','welche verglasung'],
    answer: '<strong>2-fach</strong> (Uw ca. 1,1): günstiger, für Keller und Nebenräume.<br><strong>3-fach</strong> (Uw bis 0,66): empfohlen für Wohnräume, BAFA-förderfähig, ca. 20–30% Aufpreis — deutlich weniger Wärmeverlust.<br><br>Für Sanierungen und Neubauten: immer <strong>3-fach</strong>.'
  },

  // ── Einbruchschutz ──────────────────────────────────────────────────────────
  {
    keys: ['einbruch','rc2','rc1','sicherheit','einbruchsicher','pilzkopf','sicherheitsglas'],
    answer: 'Standard: <strong>RC1N</strong> (Grundschutz). <strong>RC2</strong> im Konfigurator wählbar — Pilzkopfzapfen-Beschläge + VSG-Glas P4A. Polizei empfiehlt RC2 für Erdgeschoss. RC3 auf Anfrage verfügbar.'
  },

  // ── Garantie ────────────────────────────────────────────────────────────────
  {
    keys: ['garantie','gewährleistung','reklamation','defekt','kaputt','mangel','wie lange gilt','jahre garantie'],
    answer: 'Drutex-Garantie: <strong>10 Jahre Profil</strong> + <strong>5 Jahre Beschlag</strong> + 2 Jahre gesetzliche Gewährleistung.<br><br>Nicht abgedeckt: unfachgerechte Montage, Transportschäden (sofort bei Lieferung melden!), Kratzer durch Bauarbeiten.'
  },

  // ── Öffnungsarten ────────────────────────────────────────────────────────────
  {
    keys: ['dreh-kipp','dreh kipp','kippfenster','drehfenster','öffnungsart','wie öffnet','welche art','stulp','wie geht das fenster auf'],
    answer: '🪟 <strong>Öffnungsarten:</strong><br><br>• <strong>Dreh-Kipp</strong>: Standard — voll öffnen (Drehen) oder Lüften (Kippen)<br>• <strong>Kipp</strong>: nur Kippfunktion — Keller, schmale Fenster<br>• <strong>Fest</strong>: keine Öffnung — günstig als Festfeld<br>• <strong>Stulp</strong>: Zweiflügelig ohne Mittelpfosten — großes, offenes Bild<br><br>Alles im <a href="konfigurator.html">Konfigurator</a> wählbar.'
  },

  // ── Milchglas / Satinato ──────────────────────────────────────────────────
  {
    keys: ['milchglas','satinato','ornamentglas','badezimmer fenster','badezimmer','bad fenster','wc fenster','sichtschutzglas','blickdicht','opak','mattes glas','sichtschutz glas'],
    answer: 'Ja, <strong>Satinato (Milchglas)</strong> ist als Verglasung verfügbar — für Bad, WC oder Treppe. Im <a href="konfigurator.html">Konfigurator</a> als Glasoption wählbar oder per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> anfragen.'
  },

  // ── Standardmaße ─────────────────────────────────────────────────────────────
  {
    keys: ['standardmaß','normmaß','normfenster','standardgröße','gängige größen','übliche maße','welche größe','typische maße','fenstermaße','gängige fenster','übliche größe','normale fenster','welche fenstergröße'],
    answer: '📐 <strong>Gängige Fenstermaße:</strong><br><br>• Wohnzimmer: 1200 × 1200 mm<br>• Schlafzimmer: 1000 × 1000 mm oder 1200 × 900 mm<br>• Küche: 1000 × 600 mm<br>• Bad: 600 × 600 mm<br>• Balkontür einflügelig: 900 × 2100 mm<br><br>Wir fertigen <strong>jeden Millimeter auf Maß</strong> — keine Standardzwänge.'
  },

  // ── Wie lange hält ───────────────────────────────────────────────────────────
  {
    keys: ['wie lange hält','lebensdauer','haltbarkeit','wie alt','wann erneuern','wann tauschen','30 jahre','50 jahre','erneuern','tauschen','austauschen','wie lange fenster'],
    answer: 'PVC-Fenster halten bei guter Pflege <strong>30–50 Jahre</strong>. Drutex Klasse A (3 mm Wandstärke) ist die langlebigste Qualitätsstufe. Typische Zeichen für Erneuerung: Zugluft, schwergängige Beschläge, Beschlag zwischen den Scheiben.'
  },

  // ── Deutschlandweit ─────────────────────────────────────────────────────────
  {
    keys: ['deutschlandweit','ganz deutschland','bundesweit','liefert ihr nach','liefert ihr auch','wohnort','entfernung'],
    answer: 'Ja, wir liefern <strong>deutschlandweit</strong> per Spedition (Neuware/Maßware). Österreich und Schweiz leider nicht. Lager- und Gebrauchtware: nur Selbstabholung in Brandenburg.'
  },

  // ── Österreich / Ausland ────────────────────────────────────────────────────
  {
    keys: ['österreich','schweiz','ausland','liefert ihr nach österreich','liefert ihr nach schweiz','international','wien','graz','zürich','basel','außerhalb deutschland'],
    answer: 'Wir liefern aktuell <strong>nur innerhalb Deutschlands</strong>. Für Österreich und die Schweiz gibt es autorisierte Drutex-Händler — auf drutex.eu den nächsten Händler suchen.'
  },

  // ── Dachfenster ─────────────────────────────────────────────────────────────
  {
    keys: ['dachfenster','velux','fakro','dachflächenfenster','schrägfenster'],
    answer: 'Dachfenster führen wir <strong>nicht</strong> im Sortiment — wir sind auf senkrechte PVC-Fenster spezialisiert. Für Dachfenster empfehlen wir Velux oder Fakro.'
  },

  // ── Material ────────────────────────────────────────────────────────────────
  {
    keys: ['kunststoff','pvc','material','holz','aluminium','alu','welches material'],
    answer: 'Wir führen ausschließlich <strong>Drutex Kunststoff-PVC-Fenster</strong>. Pflegeleicht, feuchtigkeitsresistent, langlebig (30–50 Jahre), kein Streichen nötig. Holz- oder Alufenster sind nicht in unserem Sortiment.'
  },

  // ── Drutex ──────────────────────────────────────────────────────────────────
  {
    keys: ['drutex','hersteller','qualität','herkunft','woher','polnisch','bytów','marke','werk'],
    answer: '<strong>Drutex</strong> ist Europas größter PVC-Fenster-Hersteller — eigenes Glaswerk + Profil-Extrusion in Bytów, Polen. Klasse A nach EN 12608. Direktlieferung vom Werk = 20–30% günstiger als Handel. Wir sind autorisierter Drutex-Händler.'
  },

  // ── Produktübersicht ────────────────────────────────────────────────────────
  {
    keys: ['was habt ihr','welche produkte','was verkauft ihr','sortiment','was führt ihr','was gibt es','was kann ich bestellen','was kann ich kaufen','bei euch kaufen','was kann man kaufen','was bietet ihr','euer angebot'],
    answer: '🪟 <strong>Unser Sortiment:</strong><br><br>🪟 Kunststofffenster — alle Formen, Farben, Größen<br>🚪 Balkontüren & Terrassentüren<br>🏠 Haustüren — viele Modelle, RAL & Holzdekore<br>⬅️ Hebe-Schiebetüren — bis 6.500 mm Breite<br>🔄 Rollladen — passend zu Drutex-Fenstern<br>♻️ Gebrauchte Fenster — Hofverkauf freitags<br><br>Alles Maßanfertigung. <a href="produkte.html">→ Alle Produkte</a>'
  },

  // ── Farben ──────────────────────────────────────────────────────────────────
  {
    keys: ['farbe','farben','ral','anthrazit','weiß','braun','grau','schwarz','golden oak','holzdekor','farbig','wie viele farben'],
    answer: '<strong>41 Farben & Holzdekore:</strong> RAL-Farben (Anthrazitgrau 7016, Schwarzbraun 8022, Moosgrün u.v.m.) + Holzdekore (Golden Oak, Sheffield Oak, Nussbaum u.v.m.). Alle Optionen: <a href="farben-vorschau.html">Farben-Vorschau</a> oder im <a href="konfigurator.html">Konfigurator</a>.'
  },

  // ── Sprossen / Sonderform ───────────────────────────────────────────────────
  {
    keys: ['sprosse','sprossen','rund','bogenfenster','sonderform','rundbogen','dreieck','trapez'],
    answer: 'Sprossen im <a href="konfigurator.html">Konfigurator</a> wählbar. Sonderformen (Rundbogen, Dreieck, Trapez) auf Anfrage möglich — nicht im Standard-Konfigurator, bitte per <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a> anfragen.'
  },

  // ── Rollladen ───────────────────────────────────────────────────────────────
  {
    keys: ['rollladen','rolladen','sonnenschutz','beschattung','jalousie'],
    answer: 'Ja, wir führen <strong>Drutex-Rollladen</strong> passend zu den Fenstern. Angebot: <a href="tel:+493381214837">03381 / 214 83 73</a> oder <a href="https://wa.me/491717263776" target="_blank">WhatsApp</a>.'
  },

  // ── Konfigurator / Bestellung ───────────────────────────────────────────────
  {
    keys: ['konfigurator','online bestellen','bestellen','konfigurieren','zusammenstellen','wie bestelle','wie kann ich bestellen','ablauf','bestellvorgang','wie läuft das','wie geht das','wie geht eine bestellung'],
    answer: '🪟 <strong>Bestellablauf:</strong><br><br><strong>1. Konfigurieren</strong> → Maße, Profil, Farbe, Verglasung wählen<br><strong>2. Anfrage senden</strong> → wir erhalten deine Konfiguration per E-Mail<br><strong>3. Angebot erhalten</strong> → individueller Preis + Lieferbedingungen von uns<br><strong>4. Überweisen</strong> → nach Zahlung bestellen wir bei Drutex<br><strong>5. Lieferung</strong> → ca. <strong>2 Wochen</strong> ab Bestellbestätigung bei Drutex<br><br><a href="konfigurator.html" style="display:inline-block;margin-top:6px;padding:7px 14px;background:rgba(118,169,250,0.15);border:1px solid rgba(118,169,250,0.3);border-radius:8px;color:#76a9fa;text-decoration:none;font-weight:700;font-size:12px;">→ Jetzt konfigurieren</a>'
  },

  // ── Kontakt ──────────────────────────────────────────────────────────────────
  {
    keys: ['kontakt','telefon','anrufen','whatsapp','mail','email','erreichbar','wann erreichbar','wie erreiche','telefonnummer','erreichen','wie komme ich in kontakt','schreiben'],
    answer: '📞 <a href="tel:+493381214837"><strong>03381 / 214 83 73</strong></a> — Mo–Fr 10–18 Uhr<br>💬 <a href="https://wa.me/491717263776" target="_blank"><strong>WhatsApp 0171 7263776</strong></a> — nur schreiben (kein Anruf)<br>📧 info@baustoffchrist.de — Antwort i.d.R. innerhalb 24h'
  },

  // ── Adresse ──────────────────────────────────────────────────────────────────
  {
    keys: ['adresse','standort','wo seid','wo sind','wo befindet','anfahrt','wie komme','navigation','google maps','wo kaufen'],
    answer: '📍 <strong>Fohrder Landstraße 13, 14772 Brandenburg an der Havel.</strong> Google Maps: "Fensterhandel Christ Brandenburg". Hofverkauf freitags 10–17 Uhr, kein Termin nötig.'
  },

  // ── Datenschutz / Impressum / Firma ─────────────────────────────────────────
  {
    keys: ['datenschutz','impressum','dsgvo','rechtlich','agb','geschäftsbedingungen','wer seid ihr','firma','über euch'],
    answer: 'Betrieben von <strong>Fensterhandel Christ</strong> (Baustoff Christ GmbH), Fohrder Landstraße 13, 14772 Brandenburg a.d.H. Rechtliche Infos: <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a> · <a href="agb.html">AGB</a>.'
  },

  // ── Danke ────────────────────────────────────────────────────────────────────
  {
    keys: ['danke','vielen dank','super','perfekt','toll','prima','klasse','hilfreich','hat geholfen'],
    answer: 'Gerne! 😊 Weitere Fragen: <a href="tel:+493381214837">03381 / 214 83 73</a> oder <a href="https://wa.me/491717263776" target="_blank">WhatsApp 0171 7263776</a>. Viel Erfolg!'
  },
];

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function ruleBasedAnswer(text) {
  const lower = normalize(text);
  for (const rule of RULES) {
    if (rule.keys.some(k => lower.includes(normalize(k)))) return rule.answer;
  }
  return null;
}

const IS_AI_MODE = !!WORKER_URL;

// Einfaches Markdown → HTML (für echten KI-Modus)
function renderMarkdown(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/^#{1,3}\s+(.+)$/gm,'<strong>$1</strong>')
    .replace(/^[-•]\s+(.+)$/gm,'• $1')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>')
    .replace(/(https?:\/\/[^\s<&]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

// ─── System-Prompt für echte KI ────────────────────────────────────────────────
const SYSTEM_PROMPT = `Du bist der automatische Assistent von DeineFenster.de (Fensterhandel Christ, Brandenburg an der Havel). Du bist ein automatisiertes System — weise dich als solches aus wenn gefragt. Antworte auf Deutsch, kurz (max. 5 Sätze), freundlich und kompetent.

REGELN: Niemals konkrete Preise nennen — bei Preisfragen Kunden bitten, Maße/Typ/Farbe per WhatsApp zu schicken. Keine genauen Lieferdaten versprechen. Nur Fenster/Türen-Themen. Bei Unsicherheit: Telefon oder WhatsApp empfehlen. Angaben ohne Gewähr.

FIRMA: Fohrder Landstraße 13, 14772 Brandenburg a.d.H. | Tel: 03381/214837 (Mo-Fr 10-18h) | WhatsApp: 0171 7263776 (nur schreiben, kein Anruf) | Hofverkauf: Freitag 10-17h

PRODUKTE: Nur Drutex PVC-Fenster (neu+Maß) + Gebrauchtware (Freitag vor Ort, Selbstverladung, keine Reservierung). Haustüren (3D-Konfigurator: haustuer-3d.html), Balkontüren, Hebe-Schiebetüren bis 6500mm, Rollladen. KEIN Einbau, KEIN Ankauf gebraucht, KEIN Dachfenster, NICHT nach Österreich/Schweiz.

PROFILE: IGLO Energy (7-Kammer, 82mm, Uw 0,71, BAFA-förderfähig) | IGLO Edge (Uw 0,66, Premium) | IGLO 5 Classic (Uw 0,83, kein BAFA). Klasse A, EN 12608. Garantie: 10J Profil + 5J Beschlag.

LIEFERUNG: FESTE REGEL: ca. 2 Wochen Lieferzeit ab Bestellbestätigung bei Drutex (nach Zahlungseingang). Versandkosten: KOSTENLOS ab 4.000€ Auftragswert ODER ab 10 Fensterelementen. Sonst 200€ Pauschale (5-9 Elemente). Einzelne Hebe-Schiebetür 300€. Selbstabholung im Lager Brandenburg kostenlos. Gebrauchte/Lager: nur Selbstabholung, kein Versand. Niemals "kommt drauf an" — Regel ist klar.

ZAHLUNG: Vollständige Überweisung nach Angebotserhalt → dann Bestellung bei Drutex. Keine Anzahlung, keine Ratenzahlung. Vor-Ort (freitags): Bar/EC/PayPal.

FÖRDERUNG: BAFA BEG EM bis 15% Zuschuss (IGLO Energy + Edge). Antrag VOR Bestellung auf bafa.de! KfW 458 gilt nicht mehr für Einzelmaßnahmen. §35a EStG: 20% Handwerkerlohn steuerlich absetzbar (nicht Material).

RECHT: Maßfenster = kein Widerruf nach §312g Abs. 2 Nr. 1 BGB — Maße VOR Überweisung prüfen! Transportschäden sofort bei Lieferung auf dem Lieferschein vermerken.

TECHNISCH: Schutzfolie sofort nach Einbau abziehen (UV klebt sie dauerhaft fest). Außen beschlagene Scheiben morgens = gutes Zeichen (gute Dämmung). Zwischen den Scheiben beschlagen = Garantiefall. Pflege: 1x/Jahr Beschläge ölen, Dichtungen mit Glycerin einreiben. Lüften: Stoßlüften 3-4x täglich, kein Dauerkippen (Schimmelgefahr).`;

const QUICK_CHIPS = [
  { text: 'Preis & Angebot',   q: 'Was kostet ein Fenster ungefähr?' },
  { text: 'Fenster ausmessen', q: 'Wie messe ich mein Fenster richtig aus?' },
  { text: 'Lieferung',         q: 'Wie lange dauert die Lieferung und was kostet sie?' },
  { text: 'Gebraucht kaufen',  q: 'Wie kann ich bei euch gebrauchte Fenster kaufen?' },
  { text: 'BAFA Förderung',    q: 'Welche Fenster sind BAFA-förderfähig?' },
  { text: 'Öffnungszeiten',    q: 'Wann habt ihr geöffnet?' },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
(function injectCSS() {
  const s = document.createElement('style');
  s.textContent = `
    #df-chat-label {
      position:fixed;bottom:34px;right:92px;z-index:9997;
      background:#0f1c30;color:#fff;font-size:13px;font-weight:700;
      padding:7px 14px 7px 12px;border-radius:30px;
      border:1px solid rgba(118,169,250,0.3);
      box-shadow:0 4px 16px rgba(0,0,0,0.35);
      display:flex;align-items:center;gap:7px;
      cursor:pointer;white-space:nowrap;
      font-family:'Plus Jakarta Sans','Manrope',system-ui,sans-serif;
      animation:df-label-in 0.4s 1.5s both;
      transition:opacity 0.2s,transform 0.2s,background 0.15s;
    }
    #df-chat-label:hover{background:#172a4a;border-color:rgba(118,169,250,0.55);}
    #df-chat-label.df-hidden{opacity:0;pointer-events:none;transform:translateX(6px);}
    #df-chat-label-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;flex-shrink:0;animation:df-badge-pulse 2s infinite;}
    #df-chat-label-ki{font-size:10px;font-weight:800;background:linear-gradient(135deg,#225eaa,#76a9fa);color:#fff;padding:1px 6px;border-radius:6px;letter-spacing:0.05em;}

    #df-chat-btn {
      position:fixed;bottom:24px;right:24px;z-index:9998;
      width:60px;height:60px;border-radius:50%;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      box-shadow:0 4px 20px rgba(34,94,170,0.5);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;border:none;
      transition:transform 0.2s,box-shadow 0.2s;
      animation:df-pulse 3s infinite;
    }
    #df-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(34,94,170,0.65);}
    #df-chat-btn.df-open{animation:none;background:linear-gradient(135deg,#1e3a8a,#225eaa);}
    #df-chat-btn .df-icon-close{display:none;}
    #df-chat-btn.df-open .df-icon-chat{display:none;}
    #df-chat-btn.df-open .df-icon-close{display:block;}
    #df-chat-badge{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid #060e1e;animation:df-badge-pulse 2s infinite;}
    #df-chat-tooltip{
      position:absolute;right:72px;bottom:12px;white-space:nowrap;
      background:#0f1c30;color:#fff;font-size:13px;font-weight:600;
      padding:8px 14px;border-radius:12px;border:1px solid rgba(118,169,250,0.25);
      box-shadow:0 4px 16px rgba(0,0,0,0.4);pointer-events:none;
      opacity:0;transform:translateX(6px);transition:opacity 0.3s,transform 0.3s;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    #df-chat-tooltip::after{content:'';position:absolute;right:-6px;top:50%;transform:translateY(-50%);border:6px solid transparent;border-right:none;border-left-color:rgba(118,169,250,0.25);}
    #df-chat-tooltip.df-visible{opacity:1;transform:translateX(0);}

    #df-chat-window{
      position:fixed;bottom:96px;right:24px;z-index:9999;
      width:370px;max-width:calc(100vw - 32px);
      height:540px;max-height:calc(100dvh - 120px);
      background:#060e1e;border:1px solid rgba(118,169,250,0.2);
      border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(118,169,250,0.1);
      display:flex;flex-direction:column;overflow:hidden;
      transform:translateY(16px) scale(0.96);opacity:0;pointer-events:none;
      transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.2s ease;
      font-family:'Plus Jakarta Sans','Manrope',system-ui,sans-serif;
    }
    #df-chat-window.df-visible{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}
    @media(max-width:480px){
      #df-chat-window{right:0;bottom:0;width:100%;max-width:100%;height:100dvh;max-height:100dvh;border-radius:20px 20px 0 0;}
      #df-chat-btn{bottom:20px;right:16px;}
      #df-chat-label{bottom:28px;right:84px;font-size:12px;padding:6px 12px 6px 10px;}
    }

    #df-chat-header{
      background:linear-gradient(135deg,#0e1e3a 0%,#122a52 100%);
      border-bottom:1px solid rgba(118,169,250,0.15);
      padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;
    }
    #df-chat-header-avatar{
      width:40px;height:40px;border-radius:12px;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    #df-chat-header-text{flex:1;}
    #df-chat-header-name{font-weight:700;font-size:14px;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;}
    #df-chat-header-ki{font-size:9px;font-weight:800;background:linear-gradient(135deg,#225eaa,#76a9fa);color:#fff;padding:2px 6px;border-radius:5px;letter-spacing:0.08em;text-transform:uppercase;}
    #df-chat-header-sub{font-size:11px;color:rgba(118,169,250,0.7);display:flex;align-items:center;gap:5px;margin-top:2px;}
    #df-chat-header-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:df-badge-pulse 2s infinite;}
    #df-chat-close-btn{
      width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);
      border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
      color:rgba(255,255,255,0.5);transition:background 0.15s,color 0.15s;
    }
    #df-chat-close-btn:hover{background:rgba(255,255,255,0.12);color:#fff;}

    #df-chat-messages{
      flex:1;overflow-y:auto;padding:16px 14px;
      display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth;
    }
    #df-chat-messages::-webkit-scrollbar{width:4px;}
    #df-chat-messages::-webkit-scrollbar-thumb{background:rgba(118,169,250,0.2);border-radius:2px;}

    .df-msg{display:flex;gap:8px;align-items:flex-end;animation:df-msg-in 0.25s ease;}
    .df-msg.df-user{flex-direction:row-reverse;}
    .df-msg-bubble{max-width:84%;padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.58;word-break:break-word;}
    .df-msg.df-bot .df-msg-bubble{background:rgba(118,169,250,0.1);border:1px solid rgba(118,169,250,0.15);color:rgba(255,255,255,0.88);border-bottom-left-radius:4px;}
    .df-msg.df-user .df-msg-bubble{background:linear-gradient(135deg,#225eaa,#1e3a8a);color:#fff;border-bottom-right-radius:4px;}
    .df-msg-bubble a{color:#76a9fa;text-decoration:underline;text-underline-offset:2px;}
    .df-msg-avatar{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#225eaa,#76a9fa);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;}

    #df-typing{display:none;align-items:flex-end;gap:8px;}
    #df-typing.df-show{display:flex;}
    #df-typing-bubble{background:rgba(118,169,250,0.1);border:1px solid rgba(118,169,250,0.15);border-bottom-left-radius:4px;border-radius:16px;padding:10px 14px;display:flex;gap:4px;align-items:center;}
    .df-dot{width:7px;height:7px;border-radius:50%;background:rgba(118,169,250,0.6);animation:df-dot-bounce 1.2s infinite;}
    .df-dot:nth-child(2){animation-delay:0.2s;}
    .df-dot:nth-child(3){animation-delay:0.4s;}

    #df-chat-chips{padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;}
    .df-chip{
      padding:5px 11px;border-radius:20px;border:1px solid rgba(118,169,250,0.25);
      background:rgba(118,169,250,0.06);color:rgba(118,169,250,0.85);
      font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap;
      transition:background 0.15s,border-color 0.15s,color 0.15s;font-family:inherit;
    }
    .df-chip:hover{background:rgba(118,169,250,0.15);border-color:rgba(118,169,250,0.5);color:#fff;}

    .df-lead-card{animation:df-msg-in 0.3s ease;margin-top:4px;}
    .df-lead-bubble-inner{background:linear-gradient(135deg,rgba(34,94,170,0.15),rgba(118,169,250,0.08));border:1px solid rgba(118,169,250,0.3);border-radius:14px;padding:12px 14px;font-size:13px;color:rgba(255,255,255,0.88);line-height:1.5;}
    .df-lead-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:opacity 0.15s;}
    .df-lead-btn:hover{opacity:0.85;}
    .df-lead-btn-wa{background:#25d366;color:#fff;}
    .df-lead-btn-skip{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:11px;}

    #df-chat-input-area{
      padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,0.06);
      display:flex;gap:8px;align-items:center;flex-shrink:0;
    }
    #df-chat-input{
      flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
      border-radius:12px;padding:10px 14px;font-size:13.5px;color:#fff;
      outline:none;font-family:inherit;transition:border-color 0.15s;min-height:44px;
    }
    #df-chat-input::placeholder{color:rgba(255,255,255,0.3);}
    #df-chat-input:focus{border-color:rgba(118,169,250,0.5);}
    #df-chat-send{
      width:44px;height:44px;border-radius:12px;
      background:linear-gradient(135deg,#225eaa,#76a9fa);
      border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:opacity 0.15s,transform 0.15s;
    }
    #df-chat-send:hover{opacity:0.85;transform:scale(1.05);}
    #df-chat-send:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
    #df-chat-disclaimer{text-align:center;font-size:10.5px;color:rgba(255,255,255,0.2);padding:0 14px 10px;flex-shrink:0;font-family:inherit;}

    @keyframes df-pulse{0%,100%{box-shadow:0 4px 20px rgba(34,94,170,0.5);}50%{box-shadow:0 4px 28px rgba(34,94,170,0.75),0 0 0 8px rgba(34,94,170,0.12);}}
    @keyframes df-badge-pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
    @keyframes df-dot-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
    @keyframes df-msg-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes df-label-in{from{opacity:0;transform:translateX(10px);}to{opacity:1;transform:translateX(0);}}
  `;
  document.head.appendChild(s);
})();

// ─── HTML ──────────────────────────────────────────────────────────────────────
(function injectHTML() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="df-chat-label" role="button" tabindex="0" aria-label="KI-Chatbot öffnen">
      <span id="df-chat-label-dot"></span>
      Fragen? Ich helfe!
      <span id="df-chat-label-ki">KI</span>
    </div>

    <button id="df-chat-btn" aria-label="KI-Chatbot öffnen" title="KI-Chatbot — Fragen zu Fenstern">
      <svg class="df-icon-chat" width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.377 3.114 1.047 4.453L2 22l5.547-1.047A9.953 9.953 0 0012 22z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="df-icon-close" width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span id="df-chat-badge" aria-hidden="true"></span>
    </button>
    <span id="df-chat-tooltip">Fenster-Fragen? Ich weiß alles!</span>

    <div id="df-chat-window" role="dialog" aria-label="DeineFenster KI-Chatbot" aria-modal="true">
      <div id="df-chat-header">
        <div id="df-chat-header-avatar">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v2a2 2 0 01-2 2h-.17A6.001 6.001 0 0112 16a6.001 6.001 0 01-4.83-5H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2z" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="9.5" cy="10.5" r="1" fill="#fff"/>
            <circle cx="14.5" cy="10.5" r="1" fill="#fff"/>
            <path d="M9 21h6M12 16v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div id="df-chat-header-text">
          <div id="df-chat-header-name">
            Fenster-Assistent
            <span id="df-chat-header-ki">KI</span>
          </div>
          <div id="df-chat-header-sub">
            <span id="df-chat-header-dot"></span>KI-gestützt · Antwortet sofort
          </div>
        </div>
        <button id="df-wa-header-btn" aria-label="Per WhatsApp anfragen" title="Chat per WhatsApp weiterführen" style="width:32px;height:32px;border-radius:8px;background:rgba(37,211,102,0.12);border:1px solid rgba(37,211,102,0.25);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.658 1.438 5.168L2 22l4.985-1.414A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
        </button>
        <button id="df-chat-close-btn" aria-label="Chat schließen">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div id="df-chat-messages" role="log" aria-live="polite">
        <div class="df-msg df-bot">
          <div class="df-msg-avatar">🤖</div>
          <div class="df-msg-bubble">
            Hallo! Ich bin der <strong>KI-Assistent</strong> von DeineFenster.de 👋<br><br>
            Ich kenne alle Produkte, Lieferzeiten und Konditionen — und beantworte deine Fragen sofort. Was möchtest du wissen?
          </div>
        </div>
        <div id="df-typing">
          <div class="df-msg-avatar">🤖</div>
          <div id="df-typing-bubble">
            <span class="df-dot"></span><span class="df-dot"></span><span class="df-dot"></span>
          </div>
        </div>
      </div>

      <div id="df-chat-chips">
        ${QUICK_CHIPS.map(c => `<button class="df-chip" data-q="${c.q}">${c.text}</button>`).join('')}
      </div>

      <div id="df-chat-input-area">
        <input id="df-chat-input" type="text" placeholder="Frage stellen…" autocomplete="off" maxlength="500" aria-label="Frage eingeben"/>
        <button id="df-chat-send" aria-label="Senden">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div id="df-chat-disclaimer">Automatischer Assistent · Angaben ohne Gewähr · <a href="datenschutz.html" style="color:inherit;text-decoration:underline;opacity:0.6;">Datenschutz</a></div>
    </div>
  `);
})();

// KI-Badge und Willkommenstext nur bei echtem API-Modus anzeigen
if (!IS_AI_MODE) {
  const kiHeader = document.getElementById('df-chat-header-ki');
  const kiLabel  = document.getElementById('df-chat-label-ki');
  const subEl    = document.getElementById('df-chat-header-sub');
  if (kiHeader) kiHeader.style.display = 'none';
  if (kiLabel)  kiLabel.style.display  = 'none';
  if (subEl) subEl.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;animation:df-badge-pulse 2s infinite;flex-shrink:0"></span>Antwortet sofort';
  // Willkommensnachricht: kein "KI", da regelbasiert (EU AI Act Art. 50: Transparenzpflicht)
  const welcomeBubble = document.querySelector('#df-chat-messages .df-msg.df-bot .df-msg-bubble');
  if (welcomeBubble) {
    welcomeBubble.innerHTML = 'Hallo! Ich bin der <strong>Fenster-Assistent</strong> von DeineFenster.de 👋<br><br>Ich kenne alle Produkte, Lieferzeiten und Konditionen — und beantworte deine Fragen sofort. Was möchtest du wissen?';
  }
  // Aria-Labels anpassen
  const chatBtn = document.getElementById('df-chat-btn');
  const chatWin = document.getElementById('df-chat-window');
  const chatLabel = document.getElementById('df-chat-label');
  if (chatBtn)   chatBtn.setAttribute('aria-label', 'Fenster-Assistent öffnen');
  if (chatLabel) chatLabel.setAttribute('aria-label', 'Fenster-Assistent öffnen');
  if (chatWin)   chatWin.setAttribute('aria-label', 'DeineFenster Fenster-Assistent');
}

// ─── Logik ─────────────────────────────────────────────────────────────────────
(function init() {
  const label    = document.getElementById('df-chat-label');
  const btn      = document.getElementById('df-chat-btn');
  const win      = document.getElementById('df-chat-window');
  const closeBtn = document.getElementById('df-chat-close-btn');
  const input    = document.getElementById('df-chat-input');
  const sendBtn  = document.getElementById('df-chat-send');
  const msgs     = document.getElementById('df-chat-messages');
  const typing   = document.getElementById('df-typing');
  const badge    = document.getElementById('df-chat-badge');
  const tooltip  = document.getElementById('df-chat-tooltip');
  const chips    = document.getElementById('df-chat-chips');

  let isOpen = false, isLoading = false, history = [], tooltipShown = false, noMatchCount = 0, botMsgCount = 0, leadShown = false;

  // ── Seiten mit FAB unten-rechts → Chatbot nach links verschieben ──────────
  const path = window.location.pathname;
  const conflictPages = ['gebrauchte-fenster-kaufen', 'konfigurator', 'shop'];
  const moveLeft = conflictPages.some(p => path.includes(p));
  if (moveLeft) {
    btn.style.cssText   += ';right:auto;left:16px;';
    label.style.cssText += ';right:auto;left:84px;';
    win.style.cssText   += ';right:auto;left:16px;';
    // Tooltip-Pfeil für links anpassen
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #df-chat-tooltip{right:auto;left:72px;}
      #df-chat-tooltip::after{right:auto;left:-6px;border-left:none;border-right-color:rgba(118,169,250,0.25);}
      @media(max-width:480px){#df-chat-window{right:auto;left:0;border-radius:20px 20px 0 0;}}
    `;
    document.head.appendChild(styleEl);
  }

  setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltip.classList.add('df-visible');
      tooltipShown = true;
      setTimeout(() => tooltip.classList.remove('df-visible'), 5000);
    }
  }, 9000);

  if (window.location.pathname.includes('konfigurator')) {
    setTimeout(() => {
      if (!isOpen) { tooltip.textContent = 'Fragen zur Konfiguration?'; tooltip.classList.add('df-visible'); badge.style.display='block'; tooltipShown=true; setTimeout(()=>tooltip.classList.remove('df-visible'),6000); }
    }, 30000);
  }

  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('df-open', isOpen);
    win.classList.toggle('df-visible', isOpen);
    label.classList.toggle('df-hidden', isOpen);
    badge.style.display = 'none';
    tooltip.classList.remove('df-visible');
    if (isOpen) setTimeout(() => input.focus(), 300);
    btn.setAttribute('aria-label', isOpen ? 'Chat schließen' : 'KI-Chatbot öffnen');
  }

  const waHeaderBtn = document.getElementById('df-wa-header-btn');
  if (waHeaderBtn) waHeaderBtn.addEventListener('click', () => {
    window.open('https://wa.me/491717263776?text=' + buildWaContext(), '_blank');
  });

  btn.addEventListener('click', toggleChat);
  label.addEventListener('click', toggleChat);
  label.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') toggleChat(); });
  closeBtn.addEventListener('click', toggleChat);
  document.addEventListener('keydown', e => { if (e.key==='Escape' && isOpen) toggleChat(); });

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  // Baut WhatsApp-Vortext aus dem bisherigen Chat-Verlauf
  function buildWaContext() {
    const allMsgs = msgs.querySelectorAll('.df-msg:not(#df-typing)');
    const lines = [];
    allMsgs.forEach(m => {
      const isUser = m.classList.contains('df-user');
      const b = m.querySelector('.df-msg-bubble');
      if (!b) return;
      const t = (b.innerText || b.textContent || '').trim().replace(/\s+/g,' ').slice(0, 150);
      if (t) lines.push((isUser ? 'Ich: ' : 'Bot: ') + t);
    });
    const ctx = lines.slice(1, 9).join('\n'); // erste Bot-Begrüßung überspringen
    return encodeURIComponent('Hallo! Ich hatte folgende Fragen im Chat auf DeineFenster.de:\n\n' + ctx + '\n\nKönnen Sie mir weiterhelfen?');
  }

  // Lead-Card: Angebot per WhatsApp anbieten
  function showLeadCard() {
    if (leadShown) return;
    leadShown = true;
    const card = document.createElement('div');
    card.className = 'df-msg df-bot df-lead-card';
    card.innerHTML = `
      <div class="df-msg-avatar">📨</div>
      <div class="df-lead-bubble-inner">
        <strong>Möchtest du direkt ein Angebot?</strong><br>
        <span style="font-size:12px;color:rgba(255,255,255,0.55)">Wir schicken dir deinen Chat-Verlauf mit — so erklärt sich alles von selbst.</span>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="df-lead-btn df-lead-btn-wa" data-wa="1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.658 1.438 5.168L2 22l4.985-1.414A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Jetzt per WhatsApp anfragen
          </button>
          <button class="df-lead-btn df-lead-btn-skip" data-skip="1">Nein danke</button>
        </div>
      </div>`;
    msgs.insertBefore(card, typing);
    scrollBottom();
    card.querySelector('[data-wa]').addEventListener('click', () => {
      window.open('https://wa.me/491717263776?text=' + buildWaContext(), '_blank');
    });
    card.querySelector('[data-skip]').addEventListener('click', () => card.remove());
  }

  function addMsg(html, role) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `df-msg ${isUser ? 'df-user' : 'df-bot'}`;
    const bubble = document.createElement('div');
    bubble.className = 'df-msg-bubble';
    if (isUser) { bubble.textContent = html; }
    else {
      bubble.innerHTML = html;
      const av = document.createElement('div');
      av.className = 'df-msg-avatar'; av.textContent = '🤖';
      div.appendChild(av);
      botMsgCount++;
      if (botMsgCount === 3 && !leadShown) setTimeout(showLeadCard, 700);
    }
    div.appendChild(bubble);
    msgs.insertBefore(div, typing);
    scrollBottom();
  }

  function setLoading(state) {
    isLoading = state; sendBtn.disabled = state; input.disabled = state;
    typing.classList.toggle('df-show', state); scrollBottom();
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    chips.style.display = 'none';
    addMsg(text, 'user');
    input.value = '';
    setLoading(true);
    const delay = 350 + Math.random() * 450;

    if (!WORKER_URL) {
      await new Promise(r => setTimeout(r, delay));
      setLoading(false);
      const answer = ruleBasedAnswer(text);
      if (answer) {
        noMatchCount = 0;
        addMsg(answer, 'bot');
      } else {
        noMatchCount++;
        if (noMatchCount >= 2) {
          addMsg('Dazu habe ich gerade keine fertige Antwort — am schnellsten hilft dir unser Team direkt weiter:<br><br><a href="https://wa.me/491717263776" target="_blank" style="display:inline-block;margin-top:4px;padding:7px 14px;background:rgba(118,169,250,0.15);border:1px solid rgba(118,169,250,0.3);border-radius:8px;color:#76a9fa;text-decoration:none;font-weight:700;font-size:12px;">💬 WhatsApp 0171 7263776</a>&nbsp;&nbsp;<a href="tel:+493381214837" style="display:inline-block;margin-top:4px;padding:7px 14px;background:rgba(118,169,250,0.08);border:1px solid rgba(118,169,250,0.2);border-radius:8px;color:#76a9fa;text-decoration:none;font-weight:700;font-size:12px;">📞 03381 / 214 83 73</a>', 'bot');
        } else {
          addMsg('Dazu habe ich leider keine direkte Antwort. Versuch es mit anderen Worten — oder ruf uns an: <a href="tel:+493381214837">03381 / 214 83 73</a>.', 'bot');
        }
      }
      return;
    }

    history.push({ role: 'user', content: text });
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_tokens:400, system:SYSTEM_PROMPT, messages:history.slice(-10) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.content?.[0]?.text || 'Kein Ergebnis erhalten. Bitte ruf uns an: 03381 / 214 83 73';
      history.push({ role: 'assistant', content: reply });
      setLoading(false);
      addMsg(renderMarkdown(reply), 'bot');
    } catch(err) {
      console.warn('[Chatbot]', err);
      setLoading(false);
      addMsg('Technischer Fehler. Ruf uns bitte an: <a href="tel:+493381214837">03381 / 214 83 73</a>', 'bot');
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }});
  chips.addEventListener('click', e => { const c = e.target.closest('.df-chip'); if (c) sendMessage(c.dataset.q); });
})();
