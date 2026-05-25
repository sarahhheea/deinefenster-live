#!/usr/bin/env python3
"""
Generiert haustuer-karten Bilder im gleichen Stil wie fluegel-karten:
- portrait, transparent background, hellblaues Glas, anthrazit-Frame
- 1-fluegel und 2-fluegel direkt von fluegel-karten kopiert
- seitenteil-l/r aus Fluegel-Bildern komponiert (schmaler + breiter nebeneinander)

Verwendung: python3 scripts/build-haustuer-karten.py
"""

from PIL import Image
import os

SRC_DIR = 'img/fluegel-karten'
OUT_DIR = 'img/haustuer-karten'

# Quellen
single = Image.open(f'{SRC_DIR}/01_1-fluegel.png').convert('RGBA')  # 1-Fluegel-Bild

# Ausgabe-Format wie fluegel-karten (gleiche Hoehe)
W_SINGLE, H = single.size  # 896 x 1200

# 1. 1-fluegel: direkter Kopie der Fenster-Karte (gleiche Optik)
single.save(f'{OUT_DIR}/01_1-fluegel.png')
print(f'01_1-fluegel.png: {single.size} -> kopiert von fluegel-karten')

# 2. 2-fluegel: ebenfalls direkt von fluegel-karten
two = Image.open(f'{SRC_DIR}/02_2-fluegel.png').convert('RGBA')
two.save(f'{OUT_DIR}/04_2-fluegel.png')
print(f'04_2-fluegel.png: {two.size} -> kopiert von fluegel-karten')

# 3. seitenteil-l: kleines Fenster LINKS + grosse Tuer RECHTS
# 4. seitenteil-r: grosse Tuer LINKS + kleines Fenster RECHTS
# Beide aus 1-fluegel-Bild komponiert mit verschiedenen Breiten.

# Skaliere "Seitenteil" (schmal) auf 60% der Originalbreite
SEITENTEIL_W = int(W_SINGLE * 0.55)
HAUPT_W     = W_SINGLE  # Haupttuer in Originalbreite

# Seitenteil-Bild (gleiche Hoehe, schmaler)
seitenteil = single.resize((SEITENTEIL_W, H), Image.LANCZOS)

# Spacing zwischen beiden Elementen
GAP = 30

# Gesamt-Canvas-Breite
total_w = SEITENTEIL_W + GAP + HAUPT_W

# seitenteil-LINKS: schmal links, breit rechts
canvas_l = Image.new('RGBA', (total_w, H), (0, 0, 0, 0))
canvas_l.paste(seitenteil, (0, 0), seitenteil)
canvas_l.paste(single, (SEITENTEIL_W + GAP, 0), single)
canvas_l.save(f'{OUT_DIR}/02_seitenteil-links.png')
print(f'02_seitenteil-links.png: {canvas_l.size}')

# seitenteil-RECHTS: breit links, schmal rechts
canvas_r = Image.new('RGBA', (total_w, H), (0, 0, 0, 0))
canvas_r.paste(single, (0, 0), single)
canvas_r.paste(seitenteil, (HAUPT_W + GAP, 0), seitenteil)
canvas_r.save(f'{OUT_DIR}/03_seitenteil-rechts.png')
print(f'03_seitenteil-rechts.png: {canvas_r.size}')

print('\nFertig — 4 haustuer-karten Bilder im fluegel-karten-Stil generiert.')
