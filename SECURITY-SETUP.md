# Security-Setup — finale Variante (ohne Cloudflare)

Stand: 2026-05-14 (Sarah-Entscheidung: kein Cloudflare, simpel halten)

## Was jetzt passiert ist

Vorher waren 4 sensible Werte direkt im Frontend-Code öffentlich lesbar:
- Resend API-Key (kritisch — fremde Mails versendbar)
- GitHub Personal Access Token (kritisch — Repo übernehmbar)
- Web3Forms Access-Key (akzeptabel — designed für Frontend)
- Make.com Webhook URL (Spam-Risiko)

**Jetzt im Frontend:** nur noch der Web3Forms Access-Key. Das ist OK — Web3Forms-Keys identifizieren ein Formular, sie autorisieren keinen direkten Mail-Versand.

## Was DU jetzt tun musst

### 1. Resend-Key revoken (1 Min)

https://resend.com/api-keys → den alten Key (beginnt mit `re_5o5JYMky_…`) löschen. Du brauchst Resend nicht mehr — der Mail-Versand läuft jetzt direkt über Web3Forms.

### 2. GitHub-Token revoken (1 Min)

https://github.com/settings/tokens → den alten Token (beginnt mit `gho_FVoOt…`) revoken.

⚠ **Achtung:** Der Shop-Admin (`shop-einstellen.html`) braucht aktuell den Token, um Inserate hinzuzufügen. Solange du den Shop nutzt, ist das ein Sicherheitsproblem (Token wäre wieder im Frontend, wenn wir ihn da reintun) — siehe „Shop-Backend" unten.

### 3. Make.com Scenario löschen (2 Min)

Du sagtest, du willst Make.com weghaben (haben deine Bilder gesperrt). Make.com Dashboard → Scenarios → das webhook-Scenario löschen. Der Code ruft Make.com nicht mehr auf, aber das offene Scenario kostet ggf. Operations.

### 4. Web3Forms (optional)

Der Access-Key `440a94ff-…` ist im Frontend OK, aber wenn du ihn rotieren willst:
- https://web3forms.com/dashboard → Access Key regenerieren
- Den neuen Key an 3 Stellen eintragen:
  - `js/submit-core.js` Zeile 16
  - `konfigurator.html` (suche nach `440a94ff` — eine Stelle)
  - `kontakt.html` (suche nach `440a94ff` — eine Stelle)

### 5. Plausible Analytics

Frage: Ist der Plausible-Account auf deinen Namen oder bei Jonas? Wenn du Analytics nicht mehr willst → das Script aus allen HTML-Dateien entfernen (suche `plausible.io/js/script.js`). Wenn du es behältst → in der Datenschutzerklärung steht es korrekt drin.

## Was im Code passiert ist

| Datei | Änderung |
|-------|----------|
| `js/submit-core.js` | Resend-Call + Make.com-Call entfernt. Nur noch ein Web3Forms-Call an `info@baustoffchrist.de` |
| `konfigurator.html` | Cloudflare-Worker-Call ersetzt durch direkten Web3Forms-Call |
| `kontakt.html` | Cloudflare-Worker-Call ersetzt durch direkten Web3Forms-Call + DSGVO-Checkbox |
| `js/sheets-config.js` | (steht auf einem nicht-existenten Cloudflare-Worker — Shop-Editing aktuell kaputt, siehe unten) |

## Mail-Flow heute

```
Kunde füllt Konfigurator/Kontakt aus
   ↓
direkter POST an api.web3forms.com/submit (Access-Key public)
   ↓
Web3Forms sendet Mail an info@baustoffchrist.de (im Web3Forms-Dashboard hinterlegt)
   ↓
Sarah antwortet persönlich
```

**Kein Auto-Reply an den Kunden.** Web3Forms-Free hat das nicht. Falls du Auto-Reply willst:
- **Web3Forms Pro** ($5/Monat) hat eingebautes Auto-Response-Feature
- **Formspree** (50 Submits/Monat free) hat Auto-Reply kostenlos
- **Status quo**: Kunde sieht nur den Erfolgs-Screen „Wir melden uns innerhalb 24h"

## Shop-Backend (offen — deine Entscheidung nötig)

Der GitHub-Token war das größte Risiko. Aktuell zeigt `js/sheets-config.js` auf einen nicht-existenten Cloudflare-Worker — d.h. **Schreibzugriff auf den Shop ist aktuell kaputt** (Lesen funktioniert weiter, weil das öffentliche JSON über GitHub Pages geladen wird).

Drei Optionen:

| Option | Vor- | Nachteil |
|--------|------|----------|
| **A** Shop-Schreibzugriff dauerhaft deaktivieren | maximale Sicherheit, keine weitere Arbeit | du musst neue Inserate selbst lokal via Git pflegen, Familie kann nicht selbst inserieren |
| **B** GitHub-Token wieder ins Frontend (mit minimalen Scopes + regelmäßiger Rotation) | Familie kann wieder inserieren | Risiko bleibt, Token muss alle 3 Monate rotiert werden |
| **C** Migration auf Supabase | sauber, Supabase-anon-Key ist designed für Frontend, ist eh schon im Projekt | 1-2h Migrations-Arbeit, RLS-Regeln müssen stimmen |

**Meine Empfehlung: C** — du hast Supabase schon eingerichtet (`js/supabase-config.js`), das ist die richtige Lösung. Aber **sag mir wann es brennt** — wenn Familie morgen inserieren muss, ist B als Übergang OK.

## Git-History

Die alten Keys sind in alten Commits archiviert (auch wenn das Backup-File gelöscht ist). Sie sind nach Schritt 1-3 oben revoked und damit wertlos. Optional: BFG Repo-Cleaner löscht sie aus der History — destruktiv, aber bei Einzelbetrieb sicher.
