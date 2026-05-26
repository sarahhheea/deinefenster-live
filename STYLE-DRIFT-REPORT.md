# Style-Drift-Audit Report

Erstellt: 2026-05-26 03:26 UTC
Quelle: `scripts/style-drift-audit.py`

## Issue-Typen (Erklärung)

- **btn-inline-style** — `btn-primary` mit `style="..."` Override. Sollte CSS-Klasse statt inline sein.
- **multi-cta** — Mehr als 3 Links zum gleichen Ziel auf einer Seite. Eventuell redundant.
- **cta-text-drift** — Mehrere verschiedene Wordings für den gleichen Link (z.B. "Shop ansehen" / "Im Shop suchen" / "Zum Shop").
- **inline-padding-or-size** — Inline `padding:` oder `font-size:` auf Standard-Komponente.
- **details-no-class** — `<details>` ohne CSS-Klasse — zeigt Browser-Default-▸-Pfeil.
- **details-unknown-class** — `<details>` mit ungewöhnlicher Klasse, evtl. ohne Stil.
- **unusual-py** — `<section>` mit ungewöhnlichem `py-`-Wert außerhalb STYLE-GUIDE.
- **multi-h1** — Seite hat mehrere `<h1>`-Tags (SEO + a11y issue).

## Übersicht — Top 20 Files mit den meisten Issues

| File | Total Issues |
|---|---|
| `kunststofffenster-kaufen.html` | 7 |
| `gebrauchte-fenster-kaufen.html` | 6 |
| `drutex-haendler-berlin.html` | 3 |
| `drutex-haendler-brandenburg.html` | 3 |
| `drutex-haendler-magdeburg.html` | 3 |
| `drutex-haendler-potsdam.html` | 3 |
| `fenster-austauschen-kosten.html` | 3 |
| `produkte.html` | 3 |
| `ueber-uns.html` | 3 |
| `agb.html` | 2 |
| `anfrage.html` | 2 |
| `bestelluebersicht.html` | 2 |
| `daemmung-kaufen.html` | 2 |
| `danke.html` | 2 |
| `datenschutz.html` | 2 |
| `faq.html` | 2 |
| `fenster-aufmass-vor-ort.html` | 2 |
| `garagentor-gebraucht-kaufen.html` | 2 |
| `glossar.html` | 2 |
| `impressum.html` | 2 |

## Per-File-Details (alle Files mit Issues)

### `kunststofffenster-kaufen.html` — 7 Issue(s)

**btn-inline-style** (1)
- L672: style="white-space:nowrap;"

**cta-text-drift** (2)
- konfigurator.html hat 3 verschiedene Texte: "3D-Konfigurator", "Konfigurator", "Online-Konfigurator"
- shop.html hat 3 verschiedene Texte: "Alle neuen Fenster ansehen &rarr;", "Oder: Lagerware sofort verfügbar ansehen &rarr;", "die Lagerware"

**multi-cta** (4)
- 5× → kontakt.html : L51:"Kontakt" | L331:"Kontakt" | L369:"Kontakt" | L1166:"Beratung anfordern" | L1168:"Kontakt"
- 3× → gebrauchte-fenster-kaufen.html : L321:"Gebraucht" | L362:"Gebraucht" | L1059:"→ Gebrauchte Kunststofffenster im Hofverkauf ansehen"
- 6× → konfigurator.html : L323:"Konfigurator" | L364:"Konfigurator" | L907:"Online-Konfigurator" | L977:"Konfigurator" | L1007:"3D-Konfigurator"
- 3× → shop.html : L493:"Alle neuen Fenster ansehen &rarr;" | L681:"Oder: Lagerware sofort verfügbar ansehen &rarr;" | L917:"die Lagerware"


### `gebrauchte-fenster-kaufen.html` — 6 Issue(s)

**cta-text-drift** (2)
- kontakt.html hat 3 verschiedene Texte: "Anfrage schicken", "Beratung anfordern", "Kontakt"
- kunststofffenster-kaufen.html hat 3 verschiedene Texte: "Neue Fenster", "Neues Fenster nach Maß konfigurieren &rarr;", "→ Neue Kunststofffenster nach Maß ansehen"

**multi-cta** (4)
- 6× → kontakt.html : L51:"Kontakt" | L331:"Kontakt" | L369:"Kontakt" | L825:"Anfrage schicken" | L986:"Beratung anfordern"
- 4× → kunststofffenster-kaufen.html : L320:"Neue Fenster" | L361:"Neue Fenster" | L842:"Neues Fenster nach Maß konfigurieren &rarr;" | L877:"→ Neue Kunststofffenster nach Maß ansehen"
- 3× → konfigurator.html : L323:"Konfigurator" | L364:"Konfigurator" | L985:"Konfigurator"
- 3× → shop.html : L511:"Im Shop ansehen &rarr;" | L687:"Im Shop ansehen &rarr;" | L824:"Im Shop ansehen &rarr;"


### `drutex-haendler-berlin.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L296:"Konfigurator" | L337:"Konfigurator" | L382:"Drutex-Konfigurator starten →" | L427:"Profil im Konfigurator wählen →" | L442:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L304:"Kontakt" | L342:"Kontakt" | L562:"Beratung anfordern" | L564:"Kontakt"


### `drutex-haendler-brandenburg.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L296:"Konfigurator" | L337:"Konfigurator" | L382:"Drutex-Konfigurator starten →" | L427:"Profil im Konfigurator wählen →" | L442:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L304:"Kontakt" | L342:"Kontakt" | L562:"Beratung anfordern" | L564:"Kontakt"


### `drutex-haendler-magdeburg.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L296:"Konfigurator" | L337:"Konfigurator" | L382:"Drutex-Konfigurator starten →" | L427:"Profil im Konfigurator wählen →" | L442:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L304:"Kontakt" | L342:"Kontakt" | L562:"Beratung anfordern" | L564:"Kontakt"


### `drutex-haendler-potsdam.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L296:"Konfigurator" | L337:"Konfigurator" | L382:"Drutex-Konfigurator starten →" | L427:"Profil im Konfigurator wählen →" | L442:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L304:"Kontakt" | L342:"Kontakt" | L562:"Beratung anfordern" | L564:"Kontakt"


### `fenster-austauschen-kosten.html` — 3 Issue(s)

**btn-inline-style** (1)
- L591: style="width:100%;justify-content:center;"

**multi-cta** (2)
- 5× → kontakt.html : L48:"Kontakt" | L328:"Kontakt" | L366:"Kontakt" | L697:"Beratung anfordern" | L699:"Kontakt"
- 3× → konfigurator.html : L320:"Konfigurator" | L361:"Konfigurator" | L696:"Konfigurator"


### `produkte.html` — 3 Issue(s)

**cta-text-drift** (1)
- kontakt.html hat 6 verschiedene Texte: "Anfrage", "Bemusterung anfragen", "Beratung anfordern", "Kontakt", "Kontakt aufnehmen"

**multi-cta** (2)
- 9× → kontakt.html : L61:"Kontakt" | L341:"Kontakt" | L379:"Kontakt" | L1581:"Kontaktformular" | L1678:"Anfrage"
- 5× → konfigurator.html : L333:"Konfigurator" | L374:"Konfigurator" | L1696:"Konfigurator" | L1765:"Konfigurator starten" | L1801:"Konfigurator"


### `ueber-uns.html` — 3 Issue(s)

**cta-text-drift** (1)
- kontakt.html hat 4 verschiedene Texte: "Beratung anfordern", "Kontakt", "Kontakt aufnehmen", "Zur Kontaktseite"

**multi-cta** (2)
- 7× → kontakt.html : L54:"Kontakt" | L334:"Kontakt" | L372:"Kontakt" | L650:"Zur Kontaktseite" | L870:"Kontakt aufnehmen"
- 4× → konfigurator.html : L326:"Konfigurator" | L367:"Konfigurator" | L869:"Fenster konfigurieren" | L959:"Konfigurator"


### `agb.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L40:"Kontakt" | L320:"Kontakt" | L358:"Kontakt" | L585:"Beratung anfordern" | L587:"Kontakt"
- 3× → konfigurator.html : L312:"Konfigurator" | L353:"Konfigurator" | L584:"Konfigurator"


### `anfrage.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L53:"Kontakt" | L333:"Kontakt" | L371:"Kontakt" | L497:"Beratung anfordern" | L499:"Kontakt"
- 3× → konfigurator.html : L325:"Konfigurator" | L366:"Konfigurator" | L496:"Konfigurator"


### `bestelluebersicht.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L43:"Kontakt" | L323:"Kontakt" | L361:"Kontakt" | L565:"Beratung anfordern" | L567:"Kontakt"
- 3× → konfigurator.html : L315:"Konfigurator" | L356:"Konfigurator" | L564:"Konfigurator"


### `daemmung-kaufen.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L53:"Kontakt" | L333:"Kontakt" | L371:"Kontakt" | L674:"Beratung anfordern" | L676:"Kontakt"
- 3× → konfigurator.html : L325:"Konfigurator" | L366:"Konfigurator" | L673:"Konfigurator"


### `danke.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L32:"Kontakt" | L312:"Kontakt" | L350:"Kontakt" | L467:"Beratung anfordern" | L469:"Kontakt"
- 3× → konfigurator.html : L304:"Konfigurator" | L345:"Konfigurator" | L466:"Konfigurator"


### `datenschutz.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L39:"Kontakt" | L319:"Kontakt" | L357:"Kontakt" | L610:"Beratung anfordern" | L612:"Kontakt"
- 3× → konfigurator.html : L311:"Konfigurator" | L352:"Konfigurator" | L609:"Konfigurator"


### `faq.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L50:"Kontakt" | L330:"Kontakt" | L368:"Kontakt" | L557:"Beratung anfordern" | L559:"Kontakt"
- 4× → konfigurator.html : L322:"Konfigurator" | L363:"Konfigurator" | L402:"Konfigurator" | L556:"Konfigurator"


### `fenster-aufmass-vor-ort.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L51:"Kontakt" | L331:"Kontakt" | L369:"Kontakt" | L665:"Beratung anfordern" | L667:"Kontakt"
- 3× → konfigurator.html : L323:"Konfigurator" | L364:"Konfigurator" | L664:"Konfigurator"


### `garagentor-gebraucht-kaufen.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L53:"Kontakt" | L333:"Kontakt" | L371:"Kontakt" | L683:"Beratung anfordern" | L685:"Kontakt"
- 3× → konfigurator.html : L325:"Konfigurator" | L366:"Konfigurator" | L682:"Konfigurator"


### `glossar.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L55:"Kontakt" | L335:"Kontakt" | L373:"Kontakt" | L601:"Beratung anfordern" | L603:"Kontakt"
- 3× → konfigurator.html : L327:"Konfigurator" | L368:"Konfigurator" | L600:"Konfigurator"


### `impressum.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L39:"Kontakt" | L319:"Kontakt" | L357:"Kontakt" | L526:"Beratung anfordern" | L528:"Kontakt"
- 3× → konfigurator.html : L311:"Konfigurator" | L352:"Konfigurator" | L525:"Konfigurator"


### `index.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L81:"Kontakt" | L361:"Kontakt" | L399:"Kontakt" | L1151:"Beratung anfordern" | L1153:"Kontakt"
- 3× → konfigurator.html : L353:"Konfigurator" | L394:"Konfigurator" | L1150:"Konfigurator"


### `kfw-foerderung.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L54:"Kontakt" | L334:"Kontakt" | L372:"Kontakt" | L854:"Beratung anfordern" | L856:"Kontakt"
- 4× → konfigurator.html : L326:"Konfigurator" | L367:"Konfigurator" | L623:"Konfigurator" | L853:"Konfigurator"


### `konfigurator.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L57:"Kontakt" | L337:"Kontakt" | L375:"Kontakt" | L1892:"Beratung anfordern" | L1894:"Kontakt"
- 3× → konfigurator.html : L329:"Konfigurator" | L370:"Konfigurator" | L1891:"Konfigurator"


### `kontakt.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L53:"Kontakt" | L333:"Kontakt" | L371:"Kontakt" | L966:"Beratung anfordern" | L968:"Kontakt"
- 3× → konfigurator.html : L325:"Konfigurator" | L366:"Konfigurator" | L965:"Konfigurator"


### `shop.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L72:"Kontakt" | L352:"Kontakt" | L390:"Kontakt" | L1097:"Beratung anfordern" | L1099:"Kontakt"
- 5× → konfigurator.html : L344:"Konfigurator" | L385:"Konfigurator" | L784:"Konfigurator" | L959:"Konfigurator" | L1096:"Konfigurator"


### `sitemap.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L41:"Kontakt" | L321:"Kontakt" | L359:"Kontakt" | L519:"Beratung anfordern" | L521:"Kontakt"
- 3× → konfigurator.html : L313:"Konfigurator" | L354:"Konfigurator" | L518:"Konfigurator"


### `ueber-drutex.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L57:"Kontakt" | L337:"Kontakt" | L375:"Kontakt" | L1042:"Beratung anfordern" | L1044:"Kontakt"
- 4× → konfigurator.html : L329:"Konfigurator" | L370:"Konfigurator" | L951:"Zum Konfigurator" | L1041:"Konfigurator"


## Aggregierte Statistik

| Issue-Typ | Count gesamt |
|---|---|
| multi-cta | 58 |
| cta-text-drift | 10 |
| btn-inline-style | 2 |
