# Daily Digest — 06.05.2026
_Für Sarah | Automatisch generiert_

---

## 🌐 Website-Status

| URL | Status |
|-----|--------|
| fluffy-sunburst-d0520c.netlify.app | ⚠️ **503 — nicht erreichbar** (alte Netlify-Version offline) |
| fluffy-sunburst-d0520c.netlify.app/shop.html | ⚠️ **503 — nicht erreichbar** |
| Supabase (alte DB) | ✅ antwortet noch (200) |
| sarahhheea.github.io/deinefenster-live | ✅ **aktuelle Live-Version** |

**Fazit:** Die alte Netlify-Seite ist abgestorben — kein Problem, wir nutzen GitHub Pages. Supabase läuft noch, ist aber durch Google Sheets ersetzt.

---

## 🤖 Claude & Anthropic — Was ist neu (Mai 2026)

**Claude Opus 4.7** ist jetzt allgemein verfügbar:
- Deutlich bessere Bildanalyse (höhere Auflösung)
- Gleicher Preis wie Opus 4.6 ($5/$25 per MTok)
- Besser bei komplexen Coding-Aufgaben und kreativen Designs

**Claude Code Updates:**
- `/resume` für PRs verbessert
- OpenTelemetry Logging erweitert
- Memory für Managed Agents in Public Beta — Agenten merken sich jetzt Sessions

**Claude Mythos Preview:** Nur für Cybersecurity-Forscher, nicht relevant für uns.

**Für uns nützlich:** Memory für Agents ist interessant — könnte helfen dass ich zwischen Sessions mehr Kontext behalte (aktuell schon per MEMORY.md gelöst, aber natives Memory könnte besser werden).

---

## 📈 SEO & GEO — Was funktioniert Mai 2026

### Das Wichtigste für deinefenster.de:

**1. Erste 200 Wörter entscheidend**
KI-Suchmaschinen (ChatGPT, Perplexity, Google AI) bewerten primär die ERSTEN 200 Wörter einer Seite. Antwort muss sofort kommen, kein Aufbau.
→ **Aktion:** Auf allen Seiten (gebrauchte-fenster-kaufen.html, kunststofffenster-kaufen.html) die Hauptfrage direkt am Anfang beantworten.

**2. Autor-Angabe ist jetzt Pflicht für GEO**
Anonymer Content wird von KI-Systemen schlechter bewertet. Benannter Autor mit Expertise-Signalen wird bevorzugt.
→ **Aktion:** Autor-Box auf SEO-Landingpages einbauen: „Sarah Christ, Fensterhandel Christ seit 2002"

**3. llms.txt Datei**
Neue Datei die KI-Crawlern (GPTBot, ClaudeBot, PerplexityBot) erklärt wer wir sind.
→ **Aktion:** `llms.txt` in Root anlegen (ich kann das heute noch machen)

**4. robots.txt prüfen**
KI-Crawler wie GPTBot, ClaudeBot, PerplexityBot dürfen NICHT geblockt sein.
→ **Status prüfen** sobald deinefenster.de umgestellt ist.

**5. Schema Markup fehlt noch**
LocalBusiness + Product Schema würde Sichtbarkeit in Google AI Overviews stark verbessern.
→ **Aktion:** LocalBusiness-Schema auf index.html und Kontaktseite einbauen.

**Keywords die aktuell steigen (Fenstermarkt Deutschland 2026):**
- „Kunststofffenster anthrazit kaufen" ↑
- „Fenster gebraucht Brandenburg" ↑ (unser lokaler USP!)
- „Drutex Fenster Händler" ↑
- „Hebe-Schiebetür Kunststoff günstig" ↑

---

## 🪟 Fensterhandel — Markt Mai 2026

**Gute Nachrichten:** Fenstermarkt wächst 2026 um **+2,8%** (VFF/BF Prognose), erster Anstieg nach Jahren.

**Renovierung dominiert:** 70% des Marktes — unsere Kunden kommen aus Altbau-Sanierung, nicht Neubau. Das sollten SEO-Texte widerspiegeln.

**Trends:**
- Dunkle Farben (Anthrazit, Schwarz) boomen — gut, haben wir im Konfigurator
- Sicherheitstüren: 62,5% Anteil 2026 — RC2/RC3 als Keyword nutzen
- Polnische Anbieter verlieren Marktanteile → Chance: „Drutex direkt vom Händler in Brandenburg" positionieren

**Gebrauchtfenster-Markt:** Kaum Daten verfügbar = wenig Konkurrenz online. Unser Shop + gebrauchte-fenster-kaufen.html kann hier leicht Platz 1 erreichen, da fast niemand professionell in diesem Nischensegment online ist.

---

## 🛠️ Neue Tools — Was gefunden

**awesome-claude-code-toolkit (GitHub):** 135 Agenten, 400.000 Skills via SkillKit — riesige Sammlung. Nicht alles relevant, aber lohnt sich durchzuschauen.

**n8n-MCP:** MCP-Server der n8n-Workflows direkt aus Claude heraus bauen kann. Könnten wir für automatische Angebots-E-Mails nutzen.

**Kein neuer Skill installiert heute** — die bestehenden Skills (frontend-design, seo-page, seo-audit) decken unsere aktuellen Bedürfnisse ab. Neu installieren nur wenn konkreter Bedarf.

---

## ⚡ Top 3 Aktionen für heute

1. **llms.txt anlegen** — 30 Minuten, sofort GEO-Sichtbarkeit verbessern für ChatGPT/Perplexity. Ich kann das direkt machen wenn Sarah OK gibt.
2. **LocalBusiness Schema auf index.html** — Google versteht dann automatisch: Fachbetrieb, Brandenburg, Öffnungszeiten, Telefon → bessere lokale Sichtbarkeit.
3. **deinefenster.de Domain umstellen** — die neue Website muss auf die echte Domain, sonst kann Google gar nichts indizieren. Ohne das: kein Ranking. Priorität #1 sobald Sarah bereit ist.
