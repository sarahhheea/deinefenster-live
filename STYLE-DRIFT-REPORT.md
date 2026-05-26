# Style-Drift-Audit Report

Erstellt: 2026-05-26 03:03 UTC
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
| `kunststofffenster-kaufen.html` | 19 |
| `gebrauchte-fenster-kaufen.html` | 10 |
| `produkte/kunststofffenster/iglo-energy.html` | 7 |
| `staedte/fenster-aachen.html` | 5 |
| `staedte/fenster-augsburg.html` | 5 |
| `staedte/fenster-bamberg.html` | 5 |
| `staedte/fenster-bergisch-gladbach.html` | 5 |
| `staedte/fenster-berlin.html` | 5 |
| `staedte/fenster-bielefeld.html` | 5 |
| `staedte/fenster-bochum.html` | 5 |
| `staedte/fenster-bonn.html` | 5 |
| `staedte/fenster-bottrop.html` | 5 |
| `staedte/fenster-brandenburg-an-der-havel.html` | 5 |
| `staedte/fenster-braunschweig.html` | 5 |
| `staedte/fenster-bremen.html` | 5 |
| `staedte/fenster-bremerhaven.html` | 5 |
| `staedte/fenster-chemnitz.html` | 5 |
| `staedte/fenster-cottbus.html` | 5 |
| `staedte/fenster-darmstadt.html` | 5 |
| `staedte/fenster-dessau-rosslau.html` | 5 |

## Per-File-Details (alle Files mit Issues)

### `kunststofffenster-kaufen.html` — 19 Issue(s)

**btn-inline-style** (5)
- L664: style="font-size:15px;padding:14px 28px;"
- L838: style="font-size:14px;padding:12px 24px;"
- L929: style="font-size:13px;padding:10px 20px;white-space:nowrap;"
- L991: style="font-size:16px;"
- L1136: style="font-size:14px;padding:12px 24px;"

**cta-text-drift** (2)
- konfigurator.html hat 3 verschiedene Texte: "3D-Konfigurator", "Konfigurator", "Online-Konfigurator"
- shop.html hat 3 verschiedene Texte: "Alle neuen Fenster ansehen &rarr;", "Oder: Lagerware sofort verfügbar ansehen &rarr;", "die Lagerware"

**inline-padding-or-size** (8)
- L664: .btn-primary hat inline padding/font-size
- L838: .btn-primary hat inline padding/font-size
- L929: .btn-primary hat inline padding/font-size
- L991: .btn-primary hat inline padding/font-size
- L1136: .btn-primary hat inline padding/font-size
- L667: .btn-secondary hat inline padding/font-size
- L938: .btn-secondary hat inline padding/font-size
- L1139: .btn-secondary hat inline padding/font-size

**multi-cta** (4)
- 5× → kontakt.html : L222:"Kontakt" | L502:"Kontakt" | L540:"Kontakt" | L1456:"Beratung anfordern" | L1458:"Kontakt"
- 3× → gebrauchte-fenster-kaufen.html : L492:"Gebraucht" | L533:"Gebraucht" | L1316:"→ Gebrauchte Kunststofffenster im Hofverkauf ansehen"
- 6× → konfigurator.html : L494:"Konfigurator" | L535:"Konfigurator" | L1164:"Online-Konfigurator" | L1234:"Konfigurator" | L1264:"3D-Konfigurator"
- 3× → shop.html : L664:"Alle neuen Fenster ansehen &rarr;" | L938:"Oder: Lagerware sofort verfügbar ansehen &rarr;" | L1174:"die Lagerware"


### `gebrauchte-fenster-kaufen.html` — 10 Issue(s)

**btn-inline-style** (1)
- L753: style="padding:9px 18px;font-size:13px;"

**cta-text-drift** (3)
- kontakt.html hat 3 verschiedene Texte: "Anfrage schicken", "Beratung anfordern", "Kontakt"
- kunststofffenster-kaufen.html hat 3 verschiedene Texte: "Neue Fenster", "Neues Fenster nach Maß konfigurieren &rarr;", "→ Neue Kunststofffenster nach Maß ansehen"
- shop.html hat 3 verschiedene Texte: "Im Shop durchsuchen &rarr;", "Im Shop suchen &rarr;", "Zum Online-Shop &rarr;"

**inline-padding-or-size** (2)
- L753: .btn-primary hat inline padding/font-size
- L891: .btn-secondary hat inline padding/font-size

**multi-cta** (4)
- 6× → kontakt.html : L117:"Kontakt" | L397:"Kontakt" | L435:"Kontakt" | L891:"Anfrage schicken" | L1086:"Beratung anfordern"
- 4× → kunststofffenster-kaufen.html : L386:"Neue Fenster" | L427:"Neue Fenster" | L908:"Neues Fenster nach Maß konfigurieren &rarr;" | L943:"→ Neue Kunststofffenster nach Maß ansehen"
- 3× → konfigurator.html : L389:"Konfigurator" | L430:"Konfigurator" | L1085:"Konfigurator"
- 3× → shop.html : L577:"Im Shop durchsuchen &rarr;" | L753:"Zum Online-Shop &rarr;" | L890:"Im Shop suchen &rarr;"


### `produkte/kunststofffenster/iglo-energy.html` — 7 Issue(s)

**unusual-py** (7)
- L620: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L662: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L727: <section class="...py-40..."> (erlaubt: py-10/12/14/16/20/24/28)
- L753: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L811: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L870: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L1014: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)


### `staedte/fenster-aachen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-augsburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bamberg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bergisch-gladbach.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-berlin.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bielefeld.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bochum.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bonn.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bottrop.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-brandenburg-an-der-havel.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-braunschweig.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bremen.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-bremerhaven.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-chemnitz.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-cottbus.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-darmstadt.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-dessau-rosslau.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-dortmund.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-dresden.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-dueren.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-duesseldorf.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-duisburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-erfurt.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-erlangen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-essen.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-frankfurt-am-main.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-frankfurt-oder.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-freiburg-im-breisgau.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-fuerth.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-gelsenkirchen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-gera.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-goettingen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-greifswald.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-guetersloh.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-hagen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-halle-saale.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-hamburg.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-hamm.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-hannover.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-heidelberg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-heilbronn.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-herne.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-hildesheim.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-ingolstadt.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-iserlohn.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-jena.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-kaiserslautern.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-karlsruhe.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-kassel.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-kiel.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-koblenz.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-koeln.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-krefeld.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-leipzig.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-leverkusen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-ludwigshafen-am-rhein.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-luebeck.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-lueneburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-magdeburg.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-mainz.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-mannheim.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-moenchengladbach.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-moers.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-muelheim-an-der-ruhr.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-muenchen.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-muenster.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-neubrandenburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-neuss.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-nuernberg.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-oberhausen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-offenbach-am-main.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-oldenburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-osnabrueck.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-paderborn.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-pforzheim.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-potsdam.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-ratingen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-recklinghausen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-regensburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-remscheid.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-reutlingen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-rostock.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-saarbruecken.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-salzgitter.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-schwerin.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-siegen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-solingen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-stralsund.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-stuttgart.html` — 5 Issue(s)

**details-no-class** (5)
- L533: <details> ohne class — wird Safari-Default-▸ zeigen
- L537: <details> ohne class — wird Safari-Default-▸ zeigen
- L541: <details> ohne class — wird Safari-Default-▸ zeigen
- L545: <details> ohne class — wird Safari-Default-▸ zeigen
- L549: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-trier.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-tuebingen.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-ulm.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-wiesbaden.html` — 5 Issue(s)

**details-no-class** (5)
- L534: <details> ohne class — wird Safari-Default-▸ zeigen
- L538: <details> ohne class — wird Safari-Default-▸ zeigen
- L542: <details> ohne class — wird Safari-Default-▸ zeigen
- L546: <details> ohne class — wird Safari-Default-▸ zeigen
- L550: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-wismar.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-witten.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-wolfsburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-wuerzburg.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-wuppertal.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/fenster-zwickau.html` — 5 Issue(s)

**details-no-class** (5)
- L535: <details> ohne class — wird Safari-Default-▸ zeigen
- L539: <details> ohne class — wird Safari-Default-▸ zeigen
- L543: <details> ohne class — wird Safari-Default-▸ zeigen
- L547: <details> ohne class — wird Safari-Default-▸ zeigen
- L551: <details> ohne class — wird Safari-Default-▸ zeigen


### `ueber-drutex.html` — 5 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L154:"Kontakt" | L434:"Kontakt" | L472:"Kontakt" | L1139:"Beratung anfordern" | L1141:"Kontakt"
- 4× → konfigurator.html : L426:"Konfigurator" | L467:"Konfigurator" | L1048:"Zum Konfigurator" | L1138:"Konfigurator"

**unusual-py** (3)
- L619: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L684: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)
- L967: <section class="...py-32..."> (erlaubt: py-10/12/14/16/20/24/28)


### `staedte/gebrauchte-fenster-aachen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-augsburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bamberg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bergisch-gladbach.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-berlin.html` — 4 Issue(s)

**details-no-class** (4)
- L505: <details> ohne class — wird Safari-Default-▸ zeigen
- L509: <details> ohne class — wird Safari-Default-▸ zeigen
- L513: <details> ohne class — wird Safari-Default-▸ zeigen
- L517: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bielefeld.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bochum.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bonn.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bottrop.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-brandenburg-an-der-havel.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-braunschweig.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bremen.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-bremerhaven.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-chemnitz.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-cottbus.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-darmstadt.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-dessau-rosslau.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-dortmund.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-dresden.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-dueren.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-duesseldorf.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-duisburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-erfurt.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-erlangen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-essen.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-frankfurt-am-main.html` — 4 Issue(s)

**details-no-class** (4)
- L505: <details> ohne class — wird Safari-Default-▸ zeigen
- L509: <details> ohne class — wird Safari-Default-▸ zeigen
- L513: <details> ohne class — wird Safari-Default-▸ zeigen
- L517: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-frankfurt-oder.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-freiburg-im-breisgau.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-fuerth.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-gelsenkirchen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-gera.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-goettingen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-greifswald.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-guetersloh.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-hagen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-halle-saale.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-hamburg.html` — 4 Issue(s)

**details-no-class** (4)
- L505: <details> ohne class — wird Safari-Default-▸ zeigen
- L509: <details> ohne class — wird Safari-Default-▸ zeigen
- L513: <details> ohne class — wird Safari-Default-▸ zeigen
- L517: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-hamm.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-hannover.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-heidelberg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-heilbronn.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-herne.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-hildesheim.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-ingolstadt.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-iserlohn.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-jena.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-kaiserslautern.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-karlsruhe.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-kassel.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-kiel.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-koblenz.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-koeln.html` — 4 Issue(s)

**details-no-class** (4)
- L505: <details> ohne class — wird Safari-Default-▸ zeigen
- L509: <details> ohne class — wird Safari-Default-▸ zeigen
- L513: <details> ohne class — wird Safari-Default-▸ zeigen
- L517: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-krefeld.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-leipzig.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-leverkusen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-ludwigshafen-am-rhein.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-luebeck.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-lueneburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-magdeburg.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-mainz.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-mannheim.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-moenchengladbach.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-moers.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-muelheim-an-der-ruhr.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-muenchen.html` — 4 Issue(s)

**details-no-class** (4)
- L505: <details> ohne class — wird Safari-Default-▸ zeigen
- L509: <details> ohne class — wird Safari-Default-▸ zeigen
- L513: <details> ohne class — wird Safari-Default-▸ zeigen
- L517: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-muenster.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-neubrandenburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-neuss.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-nuernberg.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-oberhausen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-offenbach-am-main.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-oldenburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-osnabrueck.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-paderborn.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-pforzheim.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-potsdam.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-ratingen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-recklinghausen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-regensburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-remscheid.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-reutlingen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-rostock.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-saarbruecken.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-salzgitter.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-schwerin.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-siegen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-solingen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-stralsund.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-stuttgart.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-trier.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-tuebingen.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-ulm.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-wiesbaden.html` — 4 Issue(s)

**details-no-class** (4)
- L506: <details> ohne class — wird Safari-Default-▸ zeigen
- L510: <details> ohne class — wird Safari-Default-▸ zeigen
- L514: <details> ohne class — wird Safari-Default-▸ zeigen
- L518: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-wismar.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-witten.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-wolfsburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-wuerzburg.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-wuppertal.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `staedte/gebrauchte-fenster-zwickau.html` — 4 Issue(s)

**details-no-class** (4)
- L507: <details> ohne class — wird Safari-Default-▸ zeigen
- L511: <details> ohne class — wird Safari-Default-▸ zeigen
- L515: <details> ohne class — wird Safari-Default-▸ zeigen
- L519: <details> ohne class — wird Safari-Default-▸ zeigen


### `drutex-haendler-berlin.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L457:"Konfigurator" | L498:"Konfigurator" | L543:"Drutex-Konfigurator starten →" | L588:"Profil im Konfigurator wählen →" | L603:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L465:"Kontakt" | L503:"Kontakt" | L723:"Beratung anfordern" | L725:"Kontakt"


### `drutex-haendler-brandenburg.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L457:"Konfigurator" | L498:"Konfigurator" | L543:"Drutex-Konfigurator starten →" | L588:"Profil im Konfigurator wählen →" | L603:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L465:"Kontakt" | L503:"Kontakt" | L723:"Beratung anfordern" | L725:"Kontakt"


### `drutex-haendler-magdeburg.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L457:"Konfigurator" | L498:"Konfigurator" | L543:"Drutex-Konfigurator starten →" | L588:"Profil im Konfigurator wählen →" | L603:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L465:"Kontakt" | L503:"Kontakt" | L723:"Beratung anfordern" | L725:"Kontakt"


### `drutex-haendler-potsdam.html` — 3 Issue(s)

**cta-text-drift** (1)
- konfigurator.html hat 4 verschiedene Texte: "Drutex-Konfigurator starten →", "Konfigurator", "Profil im Konfigurator wählen →", "deinefenster.de/konfigurator.html"

**multi-cta** (2)
- 6× → konfigurator.html : L457:"Konfigurator" | L498:"Konfigurator" | L543:"Drutex-Konfigurator starten →" | L588:"Profil im Konfigurator wählen →" | L603:"deinefenster.de/konfigurator.html"
- 4× → kontakt.html : L465:"Kontakt" | L503:"Kontakt" | L723:"Beratung anfordern" | L725:"Kontakt"


### `faq.html` — 3 Issue(s)

**details-no-class** (1)
- L207: <details> ohne class — wird Safari-Default-▸ zeigen

**multi-cta** (2)
- 5× → kontakt.html : L239:"Kontakt" | L519:"Kontakt" | L557:"Kontakt" | L746:"Beratung anfordern" | L748:"Kontakt"
- 4× → konfigurator.html : L511:"Konfigurator" | L552:"Konfigurator" | L591:"Konfigurator" | L745:"Konfigurator"


### `fenster-austauschen-kosten.html` — 3 Issue(s)

**btn-inline-style** (1)
- L895: style="width:100%;justify-content:center;"

**multi-cta** (2)
- 5× → kontakt.html : L352:"Kontakt" | L632:"Kontakt" | L670:"Kontakt" | L1001:"Beratung anfordern" | L1003:"Kontakt"
- 3× → konfigurator.html : L624:"Konfigurator" | L665:"Konfigurator" | L1000:"Konfigurator"


### `produkte.html` — 3 Issue(s)

**cta-text-drift** (1)
- kontakt.html hat 6 verschiedene Texte: "Anfrage", "Bemusterung anfragen", "Beratung anfordern", "Kontakt", "Kontakt aufnehmen"

**multi-cta** (2)
- 9× → kontakt.html : L182:"Kontakt" | L462:"Kontakt" | L500:"Kontakt" | L1736:"Kontaktformular" | L1833:"Anfrage"
- 5× → konfigurator.html : L454:"Konfigurator" | L495:"Konfigurator" | L1851:"Konfigurator" | L1920:"Konfigurator starten" | L1956:"Konfigurator"


### `shop.html` — 3 Issue(s)

**details-unknown-class** (1)
- L1493: <details class="shop-hero-info">

**multi-cta** (2)
- 5× → kontakt.html : L1113:"Kontakt" | L1393:"Kontakt" | L1431:"Kontakt" | L2143:"Beratung anfordern" | L2145:"Kontakt"
- 5× → konfigurator.html : L1385:"Konfigurator" | L1426:"Konfigurator" | L1825:"Konfigurator" | L2005:"Konfigurator" | L2142:"Konfigurator"


### `style-showcase.html` — 3 Issue(s)

**details-unknown-class** (3)
- L321: <details class="df-faq">
- L325: <details class="df-faq">
- L329: <details class="df-faq">


### `ueber-uns.html` — 3 Issue(s)

**cta-text-drift** (1)
- kontakt.html hat 4 verschiedene Texte: "Beratung anfordern", "Kontakt", "Kontakt aufnehmen", "Zur Kontaktseite"

**multi-cta** (2)
- 7× → kontakt.html : L199:"Kontakt" | L479:"Kontakt" | L517:"Kontakt" | L795:"Zur Kontaktseite" | L1015:"Kontakt aufnehmen"
- 4× → konfigurator.html : L471:"Konfigurator" | L512:"Konfigurator" | L1014:"Fenster konfigurieren" | L1104:"Konfigurator"


### `agb.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L94:"Kontakt" | L374:"Kontakt" | L412:"Kontakt" | L640:"Beratung anfordern" | L642:"Kontakt"
- 3× → konfigurator.html : L366:"Konfigurator" | L407:"Konfigurator" | L639:"Konfigurator"


### `anfrage.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L171:"Kontakt" | L451:"Kontakt" | L489:"Kontakt" | L757:"Beratung anfordern" | L759:"Kontakt"
- 3× → konfigurator.html : L443:"Konfigurator" | L484:"Konfigurator" | L756:"Konfigurator"


### `bestelluebersicht.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L207:"Kontakt" | L487:"Kontakt" | L525:"Kontakt" | L731:"Beratung anfordern" | L733:"Kontakt"
- 3× → konfigurator.html : L479:"Konfigurator" | L520:"Konfigurator" | L730:"Konfigurator"


### `daemmung-kaufen.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L237:"Kontakt" | L517:"Kontakt" | L555:"Kontakt" | L891:"Beratung anfordern" | L893:"Kontakt"
- 3× → konfigurator.html : L509:"Konfigurator" | L550:"Konfigurator" | L890:"Konfigurator"


### `danke.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L86:"Kontakt" | L366:"Kontakt" | L404:"Kontakt" | L521:"Beratung anfordern" | L523:"Kontakt"
- 3× → konfigurator.html : L358:"Konfigurator" | L399:"Konfigurator" | L520:"Konfigurator"


### `datenschutz.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L93:"Kontakt" | L373:"Kontakt" | L411:"Kontakt" | L664:"Beratung anfordern" | L666:"Kontakt"
- 3× → konfigurator.html : L365:"Konfigurator" | L406:"Konfigurator" | L663:"Konfigurator"


### `fenster-aufmass-vor-ort.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L140:"Kontakt" | L420:"Kontakt" | L458:"Kontakt" | L787:"Beratung anfordern" | L789:"Kontakt"
- 3× → konfigurator.html : L412:"Konfigurator" | L453:"Konfigurator" | L786:"Konfigurator"


### `garagentor-gebraucht-kaufen.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L242:"Kontakt" | L522:"Kontakt" | L560:"Kontakt" | L905:"Beratung anfordern" | L907:"Kontakt"
- 3× → konfigurator.html : L514:"Konfigurator" | L555:"Konfigurator" | L904:"Konfigurator"


### `glossar.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L176:"Kontakt" | L456:"Kontakt" | L494:"Kontakt" | L722:"Beratung anfordern" | L724:"Kontakt"
- 3× → konfigurator.html : L448:"Konfigurator" | L489:"Konfigurator" | L721:"Konfigurator"


### `impressum.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L93:"Kontakt" | L373:"Kontakt" | L411:"Kontakt" | L580:"Beratung anfordern" | L582:"Kontakt"
- 3× → konfigurator.html : L365:"Konfigurator" | L406:"Konfigurator" | L579:"Konfigurator"


### `index.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L564:"Kontakt" | L844:"Kontakt" | L882:"Kontakt" | L2347:"Beratung anfordern" | L2349:"Kontakt"
- 3× → konfigurator.html : L836:"Konfigurator" | L877:"Konfigurator" | L2346:"Konfigurator"


### `kfw-foerderung.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L204:"Kontakt" | L484:"Kontakt" | L522:"Kontakt" | L1004:"Beratung anfordern" | L1006:"Kontakt"
- 4× → konfigurator.html : L476:"Konfigurator" | L517:"Konfigurator" | L773:"Konfigurator" | L1003:"Konfigurator"


### `konfigurator.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L1407:"Kontakt" | L1687:"Kontakt" | L1725:"Kontakt" | L4973:"Beratung anfordern" | L4975:"Kontakt"
- 3× → konfigurator.html : L1679:"Konfigurator" | L1720:"Konfigurator" | L4972:"Konfigurator"


### `kontakt.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L171:"Kontakt" | L451:"Kontakt" | L489:"Kontakt" | L1234:"Beratung anfordern" | L1236:"Kontakt"
- 3× → konfigurator.html : L443:"Konfigurator" | L484:"Konfigurator" | L1233:"Konfigurator"


### `sitemap.html` — 2 Issue(s)

**multi-cta** (2)
- 5× → kontakt.html : L53:"Kontakt" | L333:"Kontakt" | L371:"Kontakt" | L531:"Beratung anfordern" | L533:"Kontakt"
- 3× → konfigurator.html : L325:"Konfigurator" | L366:"Konfigurator" | L530:"Konfigurator"


## Aggregierte Statistik

| Issue-Typ | Count gesamt |
|---|---|
| details-no-class | 892 |
| multi-cta | 58 |
| cta-text-drift | 11 |
| inline-padding-or-size | 10 |
| unusual-py | 10 |
| btn-inline-style | 7 |
| details-unknown-class | 4 |
