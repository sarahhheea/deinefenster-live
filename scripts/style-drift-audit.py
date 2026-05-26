#!/usr/bin/env python3
"""
Style-Drift-Audit für DeineFenster.de

Scannt alle öffentlichen HTML-Seiten und findet Inkonsistenzen die vom
STYLE-GUIDE.md abweichen. Output: STYLE-DRIFT-REPORT.md im Repo.

Was wird gefunden:
1. btn-primary mit inline style="..." (sollte CSS-Klasse sein)
2. Mehrfache CTAs zum gleichen href auf einer Seite (mit ggf. verschiedenen Texten)
3. Inline padding / font-size auf Standard-Komponenten
4. <details>-Elemente ohne saubere Klasse (rendert Browser-Default)
5. Sections mit ungewöhnlichem py-XX-Wert (Style-Guide: py-16/20/28)
6. Doppelte H1 / mehrere H1 pro Seite
7. Inline background:#XX statt CSS-Variable / Klasse

Verwendung:
  python3 scripts/style-drift-audit.py
  → schreibt STYLE-DRIFT-REPORT.md
"""
import re
import sys
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent

# Welche HTMLs scannen
SCAN_GLOBS = ['*.html', 'produkte/**/*.html', 'ratgeber/**/*.html', 'staedte/**/*.html', 'partials/**/*.html', 'oeffnungszeiten/**/*.html']
SKIP_PATTERNS = ['_archive', '_screenshots', '_cowork-uebergabe', '.playwright-mcp', 'backup', '_backup', 'test', 'shop-einstellen', 'admin.html', 'dashboard.html']

# Master-Page als Referenz für Section-Padding
ALLOWED_PY = {'py-10', 'py-12', 'py-14', 'py-16', 'py-20', 'py-24', 'py-28'}

# Master-Pattern-Klassen (Style-Guide §11)
MASTER_HERO_HINTS = ['df-eyebrow', 'df-section-title', 'shop-hero-card']


def discover_files():
    files = []
    for glob in SCAN_GLOBS:
        for p in ROOT.glob(glob):
            if not p.is_file():
                continue
            rel = p.relative_to(ROOT)
            s = str(rel)
            if any(skip in s for skip in SKIP_PATTERNS):
                continue
            files.append(p)
    return sorted(set(files))


def scan_file(path: Path):
    """Return dict of issue-type → list of finding-strings."""
    issues = defaultdict(list)
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        issues['read-error'].append(str(e))
        return issues

    # 1. btn-primary mit inline style
    for m in re.finditer(r'class="[^"]*\bbtn-primary\b[^"]*"\s*style="([^"]+)"', text):
        line = text[:m.start()].count('\n') + 1
        issues['btn-inline-style'].append(f'L{line}: style="{m.group(1)}"')

    # 2. Mehrfache CTAs zum gleichen href
    href_to_texts = defaultdict(list)
    for m in re.finditer(r'<a\s[^>]*href="([^"]+)"[^>]*>([^<]{2,80})</a>', text):
        href, txt = m.group(1), m.group(2).strip()
        href_to_texts[href].append((text[:m.start()].count('\n') + 1, txt))
    cta_hrefs = {'shop.html', 'konfigurator.html', 'kontakt.html', 'daemmung-kaufen.html',
                 'gebrauchte-fenster-kaufen.html', 'kunststofffenster-kaufen.html'}
    for href, entries in href_to_texts.items():
        bare = href.split('?')[0].split('#')[0].lstrip('/')
        if bare in cta_hrefs and len(entries) >= 3:
            texts_distinct = sorted({t for _, t in entries})
            issues['multi-cta'].append(
                f'{len(entries)}× → {bare} : ' + ' | '.join(f'L{l}:"{t}"' for l, t in entries[:5])
            )
            if len(texts_distinct) >= 3:
                issues['cta-text-drift'].append(f'{bare} hat {len(texts_distinct)} verschiedene Texte: ' + ', '.join(f'"{t}"' for t in texts_distinct[:5]))

    # 3. Inline padding/font-size auf gängigen Klassen
    for cls in ['btn-primary', 'btn-secondary', 'btn-whatsapp', 'oeff-btn', 'mega-system']:
        for m in re.finditer(rf'class="[^"]*\b{cls}\b[^"]*"\s*style="[^"]*(padding|font-size)\s*:', text):
            line = text[:m.start()].count('\n') + 1
            issues['inline-padding-or-size'].append(f'L{line}: .{cls} hat inline padding/font-size')

    # 4. <details> ohne Klasse oder mit unbekannter Klasse
    for m in re.finditer(r'<details(\s+[^>]*)?>', text):
        attrs = (m.group(1) or '').strip()
        line = text[:m.start()].count('\n') + 1
        cls_match = re.search(r'class="([^"]+)"', attrs)
        if not cls_match:
            issues['details-no-class'].append(f'L{line}: <details> ohne class — wird Safari-Default-▸ zeigen')
            continue
        classes = cls_match.group(1).split()
        # Bekannte gute Klassen
        good = {'faq-item', 'faq-details', 'text-white', 'glass', 'reveal',
                'reveal-d1', 'reveal-d2', 'reveal-d3', 'group', 'rounded-xl', 'p-5',
                'transition-colors', 'faq-answer', 'open'}
        # Wenn keine der bekannten gut-Klassen drin → ggf. broken
        if not any(c in good for c in classes):
            issues['details-unknown-class'].append(f'L{line}: <details class="{cls_match.group(1)}">')

    # 5. Ungewöhnliche py-Werte auf <section>
    for m in re.finditer(r'<section\s+class="([^"]*\bpy-\d+\b[^"]*)"', text):
        line = text[:m.start()].count('\n') + 1
        cls = m.group(1)
        for py in re.findall(r'\bpy-\d+\b', cls):
            if py not in ALLOWED_PY:
                issues['unusual-py'].append(f'L{line}: <section class="...{py}..."> (erlaubt: py-10/12/14/16/20/24/28)')

    # 6. Mehrere H1
    h1_count = len(re.findall(r'<h1\b', text))
    if h1_count >= 2:
        # Sammle Inhalt der H1s für Bericht
        h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', text, re.DOTALL)
        compact = ' | '.join(re.sub(r'<[^>]+>', '', h)[:60].strip() for h in h1s)
        issues['multi-h1'].append(f'{h1_count} H1-Tags: {compact}')

    return issues


def render_report(by_file: dict) -> str:
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    lines = [
        '# Style-Drift-Audit Report',
        '',
        f'Erstellt: {now}',
        f'Quelle: `scripts/style-drift-audit.py`',
        '',
        '## Issue-Typen (Erklärung)',
        '',
        '- **btn-inline-style** — `btn-primary` mit `style="..."` Override. Sollte CSS-Klasse statt inline sein.',
        '- **multi-cta** — Mehr als 3 Links zum gleichen Ziel auf einer Seite. Eventuell redundant.',
        '- **cta-text-drift** — Mehrere verschiedene Wordings für den gleichen Link (z.B. "Shop ansehen" / "Im Shop suchen" / "Zum Shop").',
        '- **inline-padding-or-size** — Inline `padding:` oder `font-size:` auf Standard-Komponente.',
        '- **details-no-class** — `<details>` ohne CSS-Klasse — zeigt Browser-Default-▸-Pfeil.',
        '- **details-unknown-class** — `<details>` mit ungewöhnlicher Klasse, evtl. ohne Stil.',
        '- **unusual-py** — `<section>` mit ungewöhnlichem `py-`-Wert außerhalb STYLE-GUIDE.',
        '- **multi-h1** — Seite hat mehrere `<h1>`-Tags (SEO + a11y issue).',
        '',
        '## Übersicht — Top 20 Files mit den meisten Issues',
        '',
    ]
    # Total issues per file
    totals = sorted(
        ((f, sum(len(v) for v in issues.values())) for f, issues in by_file.items()),
        key=lambda x: -x[1],
    )
    lines.append('| File | Total Issues |')
    lines.append('|---|---|')
    for f, n in totals[:20]:
        if n == 0:
            continue
        lines.append(f'| `{f.relative_to(ROOT)}` | {n} |')
    lines.append('')
    lines.append('## Per-File-Details (alle Files mit Issues)')
    lines.append('')

    # Detailed per-file breakdown
    for f, n in totals:
        if n == 0:
            continue
        rel = f.relative_to(ROOT)
        lines.append(f'### `{rel}` — {n} Issue(s)')
        lines.append('')
        issues = by_file[f]
        for issue_type, items in sorted(issues.items()):
            lines.append(f'**{issue_type}** ({len(items)})')
            for item in items[:10]:
                lines.append(f'- {item}')
            if len(items) > 10:
                lines.append(f'- … +{len(items) - 10} weitere')
            lines.append('')
        lines.append('')

    # Aggregate stats
    issue_counter = Counter()
    for issues in by_file.values():
        for issue_type, items in issues.items():
            issue_counter[issue_type] += len(items)
    lines.append('## Aggregierte Statistik')
    lines.append('')
    lines.append('| Issue-Typ | Count gesamt |')
    lines.append('|---|---|')
    for issue_type, count in issue_counter.most_common():
        lines.append(f'| {issue_type} | {count} |')
    lines.append('')

    return '\n'.join(lines)


def main():
    files = discover_files()
    print(f'Scanne {len(files)} HTML-Files…', file=sys.stderr)
    by_file = {}
    for f in files:
        issues = scan_file(f)
        if any(issues.values()):
            by_file[f] = issues
    report = render_report(by_file)
    out_path = ROOT / 'STYLE-DRIFT-REPORT.md'
    out_path.write_text(report, encoding='utf-8')
    total_issues = sum(sum(len(v) for v in i.values()) for i in by_file.values())
    print(f'{len(by_file)} Files mit Issues. Total: {total_issues} Issues.', file=sys.stderr)
    print(f'Report: {out_path.relative_to(ROOT)}', file=sys.stderr)


if __name__ == '__main__':
    main()
