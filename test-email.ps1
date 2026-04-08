# ══════════════════════════════════════════════════════════
#  DeineFenster.de – Resend Test-Email Script
#  Anleitung: Trage deinen API-Key ein, dann Rechtsklick → "Mit PowerShell ausführen"
# ══════════════════════════════════════════════════════════

# ── HIER EINTRAGEN ──────────────────────────────────────────
$API_KEY   = "re_HIER_DEINEN_API_KEY_EINTRAGEN"   # z.B. re_aBcDeFgH...
$AN_EMAIL  = "sarahchrist@aol.com"                  # Wer bekommt die Test-Mail?
# ────────────────────────────────────────────────────────────

# Prüfen ob API Key eingetragen
if ($API_KEY -eq "re_HIER_DEINEN_API_KEY_EINTRAGEN") {
    Write-Host ""
    Write-Host "⚠️  STOP! Du hast den API-Key noch nicht eingetragen." -ForegroundColor Yellow
    Write-Host "   Öffne diese Datei (test-email.ps1) und ersetze:" -ForegroundColor Yellow
    Write-Host "   re_HIER_DEINEN_API_KEY_EINTRAGEN → deinen echten Key von resend.com" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Drücke Enter zum Beenden"
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DeineFenster.de – Resend Test" -ForegroundColor White
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Sende Test-Mail an: $AN_EMAIL" -ForegroundColor Gray
Write-Host ""

# E-Mail Body (HTML)
$htmlBody = @"
<!DOCTYPE html>
<html lang="de">
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f3ff;padding:32px">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:#112455;padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px">DeineFenster<span style="color:#76a9fa">.de</span></h1>
    <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:13px">E-Mail System Test</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#161c27;margin:0 0 12px">✅ Test erfolgreich!</h2>
    <p style="color:#424751;line-height:1.6;margin:0 0 20px">
      Das Resend E-Mail System für <strong>DeineFenster.de</strong> funktioniert korrekt.
      Kunden erhalten ab jetzt automatisch eine Bestätigung nach dem Absenden des Konfigurators.
    </p>
    <div style="background:#f1f3ff;border-radius:10px;padding:16px 20px;margin-bottom:20px">
      <strong style="font-size:14px;color:#161c27">Gesendet:</strong>
      <span style="font-size:14px;color:#424751"> $(Get-Date -Format 'dd.MM.yyyy HH:mm') Uhr</span>
    </div>
    <div style="background:#112455;border-radius:10px;padding:16px 20px;text-align:center">
      <div style="color:rgba(255,255,255,.6);font-size:13px;margin-bottom:4px">Nächster Schritt</div>
      <div style="color:#fff;font-weight:700;font-size:15px">Make.com Szenario einrichten</div>
      <div style="color:rgba(255,255,255,.5);font-size:13px;margin-top:4px">Siehe RESEND_SETUP.md</div>
    </div>
  </div>
  <div style="background:#0e1a38;padding:16px 32px;text-align:center">
    <p style="color:rgba(255,255,255,.3);font-size:12px;margin:0">DeineFenster.de · Automatischer Test</p>
  </div>
</div>
</body>
</html>
"@

# API Call an Resend
$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type"  = "application/json"
}

$body = @{
    from    = "DeineFenster.de <onboarding@resend.dev>"
    to      = @($AN_EMAIL)
    subject = "✅ Test erfolgreich – DeineFenster.de E-Mail System"
    html    = $htmlBody
    reply_to = "info@deinefenster.de"
} | ConvertTo-Json -Depth 5

Write-Host "Sende E-Mail..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.resend.com/emails" `
        -Method POST `
        -Headers $headers `
        -Body $body

    Write-Host ""
    Write-Host "✅ ERFOLG! E-Mail wurde gesendet." -ForegroundColor Green
    Write-Host "   ID: $($response.id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Bitte prüfe dein Postfach: $AN_EMAIL" -ForegroundColor Cyan
    Write-Host "(Auch Spam-Ordner prüfen!)" -ForegroundColor Gray
}
catch {
    $errMsg = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "❌ FEHLER beim Senden:" -ForegroundColor Red
    if ($errMsg.message) {
        Write-Host "   $($errMsg.message)" -ForegroundColor Red
        if ($errMsg.message -match "domain") {
            Write-Host ""
            Write-Host "💡 LÖSUNG: Du musst deine Domain in Resend verifizieren." -ForegroundColor Yellow
            Write-Host "   Gehe zu: https://resend.com/domains → Add Domain → deinefenster.de" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Drücke Enter zum Beenden"
