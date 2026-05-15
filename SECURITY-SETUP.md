# Security-Setup — was Sarah jetzt tun muss

Stand: 2026-05-14

Hintergrund: Bis heute lagen 4 API-Keys/Webhooks im Frontend-Code und damit für jeden Besucher lesbar. Die wurden alle entfernt und auf Cloudflare-Worker als Proxy umgestellt. Damit die Live-Seite wieder funktioniert, müssen die folgenden Schritte abgearbeitet werden.

## 1. ALTE KEYS SOFORT REVOKEN (5 Minuten)

> Wichtig: Code ist gesäubert, **aber die alten Keys sind in der Git-History und auf archive.org für immer drin**. Wer sie schon kopiert hat, kann sie weiter missbrauchen, bis sie revoked sind.

| Plattform | Wo revoken | Welcher Key |
|-----------|-----------|-------------|
| **Resend** | https://resend.com/api-keys | Den vorhandenen Key löschen (beginnt mit `re_5o5JYMky_…`) und neuen erstellen |
| **GitHub** | https://github.com/settings/tokens | Vorhandenen Token revoken (beginnt mit `gho_FVoOt…`) und neuen PAT erstellen (Scope: `repo` für `sarahhheea/deinefenster-live`) |
| **Web3Forms** | https://web3forms.com/dashboard | Access Key regenerieren (alter beginnt mit `440a94ff-…`) |
| **Make.com** | Make.com → Scenarios | Webhook-Modul löschen + neu anlegen (alte URL endete auf `…so6vhvekae…`) |

## 2. WORKER NEU DEPLOYEN (10 Minuten)

Zwei Worker existieren in `cloudflare-worker/`:

- `email-proxy.js`  → bereits live unter `https://deinefenster-email.deinefenster.workers.dev`
- `github-proxy.js` → **NEU**, muss als zweiter Worker deployed werden

### A) `email-proxy.js` aktualisieren

1. Cloudflare Dashboard → Workers & Pages → Worker `deinefenster-email` öffnen
2. **Edit Code** → Inhalt von `cloudflare-worker/email-proxy.js` komplett ersetzen → Save and Deploy
3. **Settings → Variables → Add Variable** (alle als „Encrypt"!):
   - `RESEND_API_KEY`   = der neue Resend-Key aus Schritt 1
   - `WEB3FORMS_KEY`    = der neue Web3Forms-Key aus Schritt 1
   - `MAKE_WEBHOOK_URL` = die neue Make.com-URL aus Schritt 1

### B) `github-proxy.js` neu anlegen

1. Cloudflare Dashboard → Workers & Pages → **Create Worker** → Name: `deinefenster-shop`
2. **Edit Code** → Inhalt von `cloudflare-worker/github-proxy.js` einfügen → Save and Deploy
3. **Settings → Variables → Add Variable** (alle als „Encrypt"!):
   - `GH_TOKEN`      = der neue GitHub-PAT aus Schritt 1
   - `SHOP_PASSWORD` = das Passwort für die Familie (z.B. das bisherige `Fenster2026`, oder ein neues)
   - `GH_REPO`       = `sarahhheea/deinefenster-live`
4. **Endgültige URL prüfen**: muss `https://deinefenster-shop.deinefenster.workers.dev` sein, damit `js/sheets-config.js` Zeile 13 passt. Falls die URL anders ist → diese eine Zeile in `js/sheets-config.js` anpassen.

## 3. TESTEN

- **Konfigurator-Submit**: Eine Test-Anfrage über die Bestellübersicht abschicken. Erwartet:
  - Bestätigungs-Mail an Kundenadresse (Resend)
  - Benachrichtigung an Sarah's Mailbox (Web3Forms)
  - Eintrag in Make.com-Datenbank
- **Shop-Login** in `/shop-einstellen.html`: Passwort eingeben → muss durchkommen. Dann ein Produkt hochladen/bearbeiten → muss in GitHub-Repo landen.

## 4. WAS IM CODE NICHT MEHR EXISTIERT

- `js/submit-core.js` — kein Resend-Key, kein Web3Forms-Key, keine Make.com-URL mehr. Alle Calls gehen an den Worker.
- `js/sheets-config.js` — kein GitHub-Token mehr. Alle Calls gehen an den Worker. Shop-Passwort liegt nur im localStorage des angemeldeten Browsers.
- `konfigurator-backup-2026-05-12.html` — gelöscht, war ein Snapshot mit den alten Keys.

## 5. OPTIONAL — Git-History säubern (für maximale Sauberkeit)

Die alten Keys sind in alten Commits archiviert. Da sie eh revoked sind, ist das kein akuter Hebel mehr, aber für die Optik:

```bash
# Mit BFG Repo-Cleaner (separat installieren):
bfg --replace-text patterns.txt   # patterns.txt enthält die alten Keys
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push live --force HEAD:main
```

⚠ Das ist destruktiv und kann Co-Workern den Tag versauen — bei Einzelbetrieb aber unkritisch.
