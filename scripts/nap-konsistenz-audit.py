#!/usr/bin/env python3
"""
NAP-Konsistenz-Audit für Türen und Fensterhandel Christ.

Prüft 10 Branchenverzeichnisse + Maps-Plattformen auf konsistente NAP-Daten
(Name, Address, Phone). Ersetzt BrightLocal Single-Scan (39 € einmalig).

Usage:
  python3 scripts/nap-konsistenz-audit.py

Output:
  - Markdown-Report nach ~/Desktop/NAP-Audit-YYYY-MM-DD.md
  - Liste der Inkonsistenzen (Name, Adresse, Telefon variieren)
  - Plattformen wo kein Eintrag existiert
"""

import urllib.request
import urllib.parse
import re
import datetime
import os

# Master-NAP (Single Source of Truth — GBP-konform)
MASTER = {
    "name": "Türen und Fensterhandel Christ",
    "name_alt": "Fensterhandel Christ",
    "owner": "Kersten Christ",
    "street": "Fohrder Landstraße 13",
    "zip": "14772",
    "city": "Brandenburg an der Havel",
    "phone_local": "03381 / 214 83 73",
    "phone_clean": "03381 2148373",
    "phone_intl": "+49 3381 2148373",
    "email": "info@baustoffchrist.de",
    "web": "https://deinefenster.de",
}

# Plattformen — Suche nach Brand + Stadt
PLATTFORMEN = [
    {"name": "Google (Brand-Suche)", "url": "https://www.google.com/search?q=%22T%C3%BCren+und+Fensterhandel+Christ%22+Brandenburg"},
    {"name": "Gelbe Seiten", "url": "https://www.gelbeseiten.de/Suche/T%C3%BCren%20und%20Fensterhandel%20Christ/Brandenburg%20an%20der%20Havel"},
    {"name": "Das Örtliche", "url": "https://www.dasoertliche.de/?form_name=search_nat&kw=Fensterhandel%20Christ&ci=Brandenburg%20an%20der%20Havel"},
    {"name": "11880.com", "url": "https://www.11880.com/suche/fensterhandel+christ/brandenburg+an+der+havel"},
    {"name": "Cylex", "url": "https://www.cylex.de/firma/fensterhandel-christ-brandenburg-an-der-havel"},
    {"name": "Meine Stadt", "url": "https://branchenbuch.meinestadt.de/brandenburg-an-der-havel/search?keyword=fensterhandel+christ"},
    {"name": "Apple Maps (Web)", "url": "https://maps.apple.com/?q=T%C3%BCren+und+Fensterhandel+Christ+Brandenburg"},
    {"name": "Bing Maps", "url": "https://www.bing.com/maps?q=T%C3%BCren+und+Fensterhandel+Christ+Brandenburg"},
    {"name": "Yelp DE", "url": "https://www.yelp.de/search?find_desc=Fensterhandel+Christ&find_loc=Brandenburg+an+der+Havel"},
    {"name": "Trustpilot", "url": "https://de.trustpilot.com/search?query=deinefenster.de"},
]


def fetch_page(url, timeout=10):
    """Hole Seite. Return None bei Fehler."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (NAP-Audit-Bot)"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return f"__ERROR__: {e}"


def check_nap(html, p):
    """Prüfe ob NAP-Daten gefunden werden."""
    if not html or html.startswith("__ERROR__"):
        return {"ok": False, "reason": "Page nicht erreichbar"}

    findings = {
        "name_full": MASTER["name"].lower() in html.lower(),
        "name_short": MASTER["name_alt"].lower() in html.lower(),
        "street": "fohrder landstra" in html.lower(),
        "zip": MASTER["zip"] in html,
        "city": "brandenburg an der havel" in html.lower(),
        "phone_local": MASTER["phone_local"].replace(" ", "") in html.replace(" ", ""),
        "phone_clean": MASTER["phone_clean"] in html.replace(" ", "").replace("/", ""),
        "email": MASTER["email"] in html.lower(),
        "web": "deinefenster.de" in html.lower(),
    }
    found_count = sum(1 for v in findings.values() if v)
    return {
        "ok": found_count >= 4,
        "found": found_count,
        "details": findings,
        "reason": f"{found_count}/9 NAP-Felder gefunden" if found_count >= 4 else "Eintrag fehlt oder unvollständig",
    }


def main():
    print("=" * 70)
    print("NAP-Konsistenz-Audit — Türen und Fensterhandel Christ")
    print("=" * 70)
    print(f"\nMaster-NAP:")
    print(f"  Name:    {MASTER['name']}")
    print(f"  Adresse: {MASTER['street']}, {MASTER['zip']} {MASTER['city']}")
    print(f"  Telefon: {MASTER['phone_local']}")
    print(f"  Web:     {MASTER['web']}")
    print()

    results = []
    for p in PLATTFORMEN:
        print(f"  -> Prüfe {p['name']}...", end=" ", flush=True)
        html = fetch_page(p["url"])
        r = check_nap(html, p)
        results.append({**p, **r})
        status = "OK" if r["ok"] else "FEHLT"
        print(f"[{status}] {r.get('reason', '')}")

    # Markdown-Report schreiben
    today = datetime.date.today().isoformat()
    report_path = os.path.expanduser(f"~/Desktop/NAP-Audit-{today}.md")

    lines = [
        f"# NAP-Konsistenz-Audit — {today}",
        "",
        "## Master-NAP",
        "",
        f"- **Name:** {MASTER['name']}",
        f"- **Alt-Name:** {MASTER['name_alt']}",
        f"- **Adresse:** {MASTER['street']}, {MASTER['zip']} {MASTER['city']}",
        f"- **Telefon:** {MASTER['phone_local']} ({MASTER['phone_clean']})",
        f"- **E-Mail:** {MASTER['email']}",
        f"- **Web:** {MASTER['web']}",
        "",
        "## Plattform-Status",
        "",
        "| Plattform | Status | Details |",
        "|-----------|--------|---------|",
    ]

    for r in results:
        status = "✅ OK" if r["ok"] else "❌ FEHLT"
        details = r.get("reason", "")
        lines.append(f"| {r['name']} | {status} | {details} |")

    lines += [
        "",
        "## Aktionen",
        "",
        "Plattformen mit Status FEHLT → Eintrag anlegen oder prüfen.",
        "Plattformen mit OK aber wenig Felder gefunden → manuelle Kontrolle.",
        "",
        "## Master-NAP für Eintragungen (copy-paste)",
        "",
        f"```",
        f"Name:    {MASTER['name']}",
        f"Inhaber: {MASTER['owner']}",
        f"Adresse: {MASTER['street']}, {MASTER['zip']} {MASTER['city']}",
        f"Telefon: {MASTER['phone_local']}",
        f"E-Mail:  {MASTER['email']}",
        f"Web:     {MASTER['web']}",
        f"```",
    ]

    with open(report_path, "w") as f:
        f.write("\n".join(lines))

    print()
    print(f"📄 Report: {report_path}")
    print()
    fehlt = sum(1 for r in results if not r["ok"])
    ok = sum(1 for r in results if r["ok"])
    print(f"✅ OK: {ok} / ❌ Fehlt: {fehlt} / Gesamt: {len(results)}")


if __name__ == "__main__":
    main()
