# Resend E-Mail Setup – DeineFenster.de
## Status: API Key ✅ · Domain-Verifizierung ⏳ · Make.com ⏳

---

## ✅ Was bereits erledigt ist
- Resend-Konto aktiv
- API Key erstellt: `re_5o5JYMky_...`
- Test-Mail erfolgreich gesendet (ID: d676c09b-7059-4bb2-a3a2-48d477d8f161)
- Domain `deinefenster.de` in Resend angelegt → DNS-Einträge bereit

---

## SCHRITT 1: DNS-Einträge bei deinem Domain-Anbieter eintragen

Gehe zu deinem Domain-Anbieter (IONOS / Strato / Namecheap / etc.) → DNS-Verwaltung

### Eintrag 1 – DKIM (TXT)
| Feld | Wert |
|------|------|
| **Typ** | TXT |
| **Name/Host** | `resend._domainkey` |
| **Wert** | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC59wpgpk/zt/K9L7XPDW4zHbkoomRef7rfTUFuegS06zzwurqZte2VcUqKsQOhF/ntMtxwdJsRhNqu5qplRoUj6APcHLHA3MnxgUm0wBzr6k/XWDaEmdK+vhDGiVUn0rEbljE7nMIpXDvaigxU5qx7VbW7mFWjEn9Y3pv0KSdNOwIDAQAB` |
| **TTL** | 3600 (oder Auto) |

### Eintrag 2 – MX (Bounce-Handling)
| Feld | Wert |
|------|------|
| **Typ** | MX |
| **Name/Host** | `send` |
| **Wert** | `feedback-smtp.eu-west-1.amazonses.com` |
| **TTL** | 3600 |

### Eintrag 3 – SPF (TXT)
| Feld | Wert |
|------|------|
| **Typ** | TXT |
| **Name/Host** | `send` |
| **Wert** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | 3600 |

> ⏱️ DNS-Änderungen brauchen 5–30 Minuten. Danach in Resend auf **"Verify"** klicken.

---

## SCHRITT 2: Domain in Resend verifizieren

1. Gehe zu **https://resend.com/domains**
2. Du siehst `deinefenster.de` mit Status "Pending"
3. Klicke auf **"Verify"**
4. Status wechselt zu ✅ **Verified**

---

## SCHRITT 3: Make.com Szenario einrichten

### Aufbau des Szenarios:
```
[Webhook empfangen] → [HTTP: Mail an Kunde] → [HTTP: Mail an Sarah]
```

### 3a. Webhook-Modul (bereits vorhanden)
- Dein Webhook: `https://hook.eu1.make.com/so6vhein Profil-Herstellere4ve7e3peh7vgcgqmv7cbrc`

### 3b. Erstes HTTP-Modul: Kunden-Bestätigung

**Modul:** `HTTP → Make a request`

| Einstellung | Wert |
|-------------|------|
| URL | `https://api.resend.com/emails` |
| Method | `POST` |
| Header 1 Name | `Authorization` |
| Header 1 Wert | `Bearer re_5o5JYMky_MXfQoo7vAZoaNMn4KzLrNyht` |
| Header 2 Name | `Content-Type` |
| Header 2 Wert | `application/json` |
| Body Type | `Raw` |
| Content Type | `JSON (application/json)` |

**Body (JSON):**
```json
{
  "from": "DeineFenster.de <info@deinefenster.de>",
  "to": ["{{1.kunde_email}}"],
  "reply_to": "sarahchrist@aol.com",
  "subject": "Ihre Anfrage bei DeineFenster.de – {{1.produkt}}",
  "html": "HIER_KUNDE_HTML_EINFÜGEN"
}
```
> Für `HIER_KUNDE_HTML_EINFÜGEN` → Inhalt von `email-templates/kunde-bestaetigung.html` komplett einfügen (Anführungszeichen mit `\"` escapen oder JSON-Tool nutzen).

### 3c. Zweites HTTP-Modul: Sarah-Benachrichtigung

Gleiche Einstellungen, nur anderer Body:

```json
{
  "from": "DeineFenster.de <info@deinefenster.de>",
  "to": ["sarahchrist@aol.com"],
  "reply_to": "{{1.kunde_email}}",
  "subject": "🔔 Neue Anfrage: {{1.produkt}} – {{1.kunde_name}}",
  "html": "HIER_SARAH_HTML_EINFÜGEN"
}
```

### 3d. Platzhalter in Make.com

| HTML-Platzhalter | Make.com Variable |
|-----------------|-------------------|
| `{{kunde_name}}` | `{{1.kunde_name}}` |
| `{{kunde_email}}` | `{{1.kunde_email}}` |
| `{{kunde_telefon}}` | `{{1.kunde_telefon}}` |
| `{{kunde_ort}}` | `{{1.kunde_ort}}` |
| `{{kunde_strasse}}` | `{{1.kunde_strasse}}` |
| `{{kunde_notizen}}` | `{{1.kunde_notizen}}` |
| `{{produkt}}` | `{{1.produkt}}` |
| `{{anzahl}}` | `{{1.anzahl}}` |
| `{{breite_mm}}` | `{{1.breite_mm}}` |
| `{{hoehe_mm}}` | `{{1.hoehe_mm}}` |
| `{{glasart}}` | `{{1.glasart}}` |
| `{{oeffnungsart}}` | `{{1.oeffnungsart}}` |
| `{{profil}}` | `{{1.profil}}` |
| `{{farbe_aussen}}` | `{{1.farbe_aussen}}` |
| `{{farbe_innen}}` | `{{1.farbe_innen}}` |
| `{{sprossen}}` | `{{1.sprossen}}` |
| `{{rolladen}}` | `{{1.rolladen}}` |
| `{{sicherheit}}` | `{{1.sicherheit}}` |
| `{{preis_gesamt}}` | `{{1.preis_gesamt}}` |
| `{{preis_stueck}}` | `{{1.preis_stueck}}` |
| `{{preis_lieferung}}` | `{{1.preis_lieferung}}` |
| `{{datum}}` | `{{1.datum}}` |

---

## SCHRITT 4: Volltest

1. Öffne `konfigurator.html` → Fenster konfigurieren → Angebot absenden
2. Prüfe `sarahchrist@aol.com`:
   - ✅ Kunden-Bestätigung (von info@deinefenster.de)
   - ✅ Sarah-Benachrichtigung mit allen Details

---

## Wichtig: API Key sichern

Dein Resend API Key: `re_5o5JYMky_MXfQoo7vAZoaNMn4KzLrNyht`

⚠️ **Nur in Make.com eintragen. Niemals in HTML-Dateien!**
Nach dem Make.com Setup: Erstelle sicherheitshalber einen neuen Key auf resend.com/api-keys
und ersetze den alten in Make.com.
