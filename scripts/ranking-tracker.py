#!/usr/bin/env python3
"""
Ranking-Tracker für deinefenster.de — ersetzt SE-Ranking / Localo.

Prüft wöchentlich die Position von 15 Kern-Keywords bei Google.
Loggt in CSV-Datei + Trend-Verlauf nach Vault.

Usage:
  python3 scripts/ranking-tracker.py

Output:
  ~/Documents/Sarahs 2. Gehirn/03-Bereiche/SEO-Ranking-Log.csv
  ~/Desktop/Ranking-Update-YYYY-MM-DD.md (Kurzbericht)
"""

import urllib.request
import urllib.parse
import re
import datetime
import csv
import os
from pathlib import Path

# 15 Kern-Keywords aus Search Console
KEYWORDS = [
    "fensterhandel christ",
    "türen und fensterhandel christ",
    "gebrauchte fenster brandenburg an der havel",
    "fenster christ brandenburg",
    "fenster brandenburg an der havel",
    "gebrauchte fenster brandenburg",
    "drutex händler brandenburg",
    "drutex händler berlin",
    "drutex fenster kaufen",
    "iglo 5 kaufen",
    "iglo energy kaufen",
    "fenster nach maß brandenburg",
    "gebrauchte fenster havelland",
    "hofverkauf fenster brandenburg",
    "fenster aufmaß brandenburg",
]

TARGET_DOMAIN = "deinefenster.de"


def search_google_position(keyword, max_pages=2):
    """
    Suche bei Google nach keyword.
    Return: Position 1-100 wenn deinefenster.de gefunden, sonst None.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9",
    }

    for page in range(max_pages):
        start = page * 10
        q = urllib.parse.quote_plus(keyword)
        url = f"https://www.google.com/search?q={q}&hl=de&gl=de&num=10&start={start}"

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as r:
                html = r.read().decode("utf-8", errors="ignore")
        except Exception as e:
            return ("ERROR", str(e)[:50])

        # Suche nach allen Result-Links in der Seite
        # Google rendered SERPs mit "url?q=..." oder direkt "href"
        urls_found = re.findall(r'href="(?:/url\?q=)?(https?://[^"&]+)', html)

        for i, u in enumerate(urls_found[:30]):
            if TARGET_DOMAIN in u and "webcache.google" not in u:
                position = start + i + 1
                return (position, u[:60])

    return (None, None)


def main():
    today = datetime.date.today().isoformat()

    print("=" * 70)
    print(f"Ranking-Tracker — {today}")
    print("=" * 70)
    print()

    results = []
    for kw in KEYWORDS:
        pos, url = search_google_position(kw)
        results.append({"keyword": kw, "position": pos, "url": url, "date": today})

        if pos is None:
            print(f"  [—] {kw}: nicht in Top-20")
        elif pos == "ERROR":
            print(f"  [!] {kw}: Fehler — {url}")
        else:
            print(f"  [{pos:2d}] {kw}: {url[:40]}...")

    # CSV-Log
    vault_path = Path.home() / "Documents" / "Sarahs 2. Gehirn" / "03-Bereiche" / "SEO-Ranking-Log.csv"
    vault_path.parent.mkdir(parents=True, exist_ok=True)
    file_exists = vault_path.exists()
    with open(vault_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "keyword", "position", "url"])
        if not file_exists:
            writer.writeheader()
        for r in results:
            writer.writerow({
                "date": r["date"],
                "keyword": r["keyword"],
                "position": r["position"] if r["position"] not in (None, "ERROR") else "",
                "url": r["url"] if r["url"] else "",
            })

    # Desktop-Kurzbericht
    report_path = Path.home() / "Desktop" / f"Ranking-Update-{today}.md"
    in_top10 = sum(1 for r in results if isinstance(r["position"], int) and r["position"] <= 10)
    in_top20 = sum(1 for r in results if isinstance(r["position"], int) and r["position"] <= 20)
    not_found = sum(1 for r in results if r["position"] is None)

    lines = [
        f"# Ranking-Update {today}",
        "",
        f"- **In Top 10:** {in_top10}/{len(KEYWORDS)} Keywords",
        f"- **In Top 20:** {in_top20}/{len(KEYWORDS)} Keywords",
        f"- **Nicht in Top 20:** {not_found}/{len(KEYWORDS)}",
        "",
        "## Detail",
        "",
        "| Keyword | Position |",
        "|---------|----------|",
    ]
    for r in results:
        pos_str = str(r["position"]) if isinstance(r["position"], int) else "—"
        lines.append(f"| {r['keyword']} | {pos_str} |")

    lines += [
        "",
        f"Voller Verlauf: `{vault_path}`",
    ]

    with open(report_path, "w") as f:
        f.write("\n".join(lines))

    print()
    print(f"📊 Bilanz: {in_top10}/{len(KEYWORDS)} Top-10, {in_top20}/{len(KEYWORDS)} Top-20")
    print(f"📄 Report: {report_path}")
    print(f"📁 Log:    {vault_path}")


if __name__ == "__main__":
    main()
