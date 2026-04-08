$KEY = "re_5o5JYMky_MXfQoo7vAZoaNMn4KzLrNyht"
$headers = @{ "Authorization" = "Bearer $KEY"; "Content-Type" = "application/json" }

Write-Host "Füge Domain deinefenster.de zu Resend hinzu..." -ForegroundColor Cyan
$domainBody = @{ name = "deinefenster.de"; region = "eu-west-1" } | ConvertTo-Json -Compress

$response = $null
$error_msg = ""

try {
    $response = Invoke-RestMethod -Uri "https://api.resend.com/domains" -Method POST -Headers $headers -Body $domainBody
} catch {
    $error_msg = $_.ErrorDetails.Message
}

if ($response -and $response.records) {
    Write-Host "Domain hinzugefügt! DNS-Einträge:" -ForegroundColor Green
    Write-Host ""
    foreach ($rec in $response.records) {
        Write-Host "TYP:  $($rec.type)" -ForegroundColor Yellow
        Write-Host "NAME: $($rec.name)" -ForegroundColor White
        Write-Host "WERT: $($rec.value)" -ForegroundColor Cyan
        Write-Host "---"
    }
} else {
    Write-Host "Hinweis: $error_msg" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Rufe bestehende Domains ab..." -ForegroundColor Cyan
    $domains = Invoke-RestMethod -Uri "https://api.resend.com/domains" -Method GET -Headers $headers
    Write-Host "Gefundene Domains: $($domains.data.Count)"
    foreach ($dom in $domains.data) {
        Write-Host "  - $($dom.name) [Status: $($dom.status)] [ID: $($dom.id)]" -ForegroundColor White
        $detail = Invoke-RestMethod -Uri "https://api.resend.com/domains/$($dom.id)" -Method GET -Headers $headers
        foreach ($rec in $detail.records) {
            Write-Host "    TYP: $($rec.type)  NAME: $($rec.name)  WERT: $($rec.value)" -ForegroundColor Cyan
        }
    }
}
