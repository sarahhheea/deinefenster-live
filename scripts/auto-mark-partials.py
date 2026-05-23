#!/usr/bin/env python3
"""auto-mark-partials.py — Setzt <!-- PARTIAL:name START/END --> Marker in HTML-Seiten.

Findet Topbar (<div id="topbar">), MainNav (<nav id="navbar">) und Footer
(<footer ...> als erstes Match, das Hauptfooter darstellt), ersetzt deren
Inhalt mit den entsprechenden Markern. Skip wenn Marker schon gesetzt sind.

Usage:
  scripts/auto-mark-partials.py --dry-run file1.html file2.html
  scripts/auto-mark-partials.py file1.html file2.html
"""
import sys
import pathlib


def find_balanced(content: str, open_tag_start: int, open_tag_name: str) -> int | None:
    """Findet das matching schließende Tag ab open_tag_start.
    Returnt den Index NACH dem schließenden Tag."""
    open_pat = f"<{open_tag_name}"
    close_pat = f"</{open_tag_name}>"
    depth = 1  # opener-Tag ist schon offen
    pos = open_tag_start
    while pos < len(content):
        next_open = content.find(open_pat, pos)
        next_close = content.find(close_pat, pos)
        if next_close == -1:
            return None
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + len(open_pat)
        else:
            depth -= 1
            pos = next_close + len(close_pat)
            if depth == 0:
                return pos
    return None


def replace_block(content: str, start: int, end: int, marker_name: str) -> str:
    block = f"<!-- PARTIAL:{marker_name} START -->\n<!-- PARTIAL:{marker_name} END -->"
    return content[:start] + block + content[end:]


def mark_section(content: str, opener: str, tag_name: str, marker_name: str) -> tuple[str, bool, str]:
    """Sucht opener, findet matching close, ersetzt mit Marker.
    Skip wenn opener nicht gefunden oder Marker schon gesetzt."""
    # Skip wenn schon markiert
    if f"PARTIAL:{marker_name}" in content:
        return content, False, "schon markiert"

    start = content.find(opener)
    if start == -1:
        return content, False, f"opener '{opener[:30]}...' nicht gefunden"

    # Finde Ende des öffnenden Tags (>)
    open_tag_end = content.find(">", start)
    if open_tag_end == -1:
        return content, False, "kein '>' nach opener"

    end = find_balanced(content, open_tag_end + 1, tag_name)
    if end is None:
        return content, False, f"kein matching </{tag_name}> gefunden"

    new_content = replace_block(content, start, end, marker_name)
    return new_content, True, f"chars {start}-{end} ersetzt"


def process(path: pathlib.Path, dry_run: bool) -> dict:
    content = path.read_text(encoding="utf-8")
    original = content
    results = {}

    content, ok, msg = mark_section(content, '<div id="topbar"', "div", "topbar")
    results["topbar"] = (ok, msg)

    content, ok, msg = mark_section(content, '<nav id="navbar"', "nav", "mainnav")
    results["mainnav"] = (ok, msg)

    content, ok, msg = mark_section(content, '<footer', "footer", "footer")
    results["footer"] = (ok, msg)

    changed = content != original
    if changed and not dry_run:
        path.write_text(content, encoding="utf-8")
    return {"results": results, "changed": changed, "dry_run": dry_run}


def main():
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = "--dry-run" in sys.argv
    if not args:
        print("Usage: auto-mark-partials.py [--dry-run] <html files...>")
        sys.exit(1)
    for arg in args:
        p = pathlib.Path(arg)
        if not p.exists():
            print(f"  ✗ {arg} — nicht gefunden")
            continue
        r = process(p, dry_run)
        prefix = "[DRY]" if dry_run else "[WRITE]" if r["changed"] else "[SKIP]"
        print(f"{prefix} {p}")
        for name, (ok, msg) in r["results"].items():
            icon = "✓" if ok else "·"
            print(f"  {icon} {name}: {msg}")


if __name__ == "__main__":
    main()
