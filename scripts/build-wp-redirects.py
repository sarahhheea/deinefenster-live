#!/usr/bin/env python3
"""
Baut Redirect-Stubs fuer alte WordPress-URLs.
GitHub Pages kann keine echten 301 — Meta-Refresh + Canonical ist Standard-Workaround.
Bing/Google werten 0-Sekunden-Refresh + Canonical als 301-Aequivalent.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Mapping alte URL (Slash-Verzeichnis) -> neues Ziel (absolute Pfad ab Root)
REDIRECTS = {
    "home":                  "/",
    "iglo-edge":             "/produkte/kunststofffenster/iglo-edge.html",
    "iglo-energy":           "/produkte/kunststofffenster/iglo-energy.html",
    "iglo-5":                "/produkte/kunststofffenster/iglo-5-classic.html",
    "iglo-5-haustueren":     "/produkte/haustueren/iglo-energy.html",
    "haustueren":            "/produkte/haustueren/iglo-energy.html",
    "balkontueren":          "/produkte/balkontueren/iglo-energy.html",
    "profil-psk":            "/produkte/hebe-schiebetueren/iglo-energy-psk.html",
    "rolllaeden":            "/produkte/rollladen/aufsatz-rollladen.html",
    "infos-unterputzrollladen": "/produkte/rollladen/aufsatz-rollladen.html",
    "wer-ist-drutex":        "/ueber-drutex.html",
    "drutex-produktion":     "/ueber-drutex.html",
    "mb-86-n-si":            "/ueber-drutex.html",
    "mehr-ueber-uns":        "/ueber-uns.html",
    "oeffnungszeiten":       "/kontakt.html",
    "impressum":             "/impressum.html",
    "verglasungen":          "/ratgeber/fenster-u-wert-erklaert.html",
    "glasleisten":           "/produkte.html",
    "sprossen-und-kaempfer": "/produkte.html",
    "verbreiterungen":       "/produkte.html",
    "kopplungen":            "/produkte.html",
    "montagezubehoer":       "/produkte.html",
    "zubehoer":              "/produkte.html",
    "lueftungen":            "/produkte.html",
}

STUB_TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Seite umgezogen | DeineFenster.de</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://deinefenster.de{target}">
<meta http-equiv="refresh" content="0; url=https://deinefenster.de{target}">
<script>window.location.replace("https://deinefenster.de{target}");</script>
<style>
  body{{font-family:system-ui,sans-serif;background:#0a1225;color:#e8eeff;margin:0;padding:48px 24px;text-align:center;}}
  a{{color:#76a9fa;}}
</style>
</head>
<body>
<h1 style="font-size:1.4rem;font-weight:700;margin:0 0 12px;">Diese Seite ist umgezogen</h1>
<p style="margin:0 0 18px;">Du wirst automatisch weitergeleitet. Klappt das nicht:</p>
<p><a href="https://deinefenster.de{target}">Hier weiterlesen &rarr;</a></p>
</body>
</html>
"""

created = 0
skipped = 0
for slug, target in REDIRECTS.items():
    dir_path = os.path.join(ROOT, slug)
    os.makedirs(dir_path, exist_ok=True)
    stub_path = os.path.join(dir_path, "index.html")
    with open(stub_path, "w", encoding="utf-8") as f:
        f.write(STUB_TEMPLATE.format(target=target))
    created += 1
    print(f"✅ /{slug}/  ->  {target}")

print(f"\n{created} Redirect-Stubs erzeugt.")
