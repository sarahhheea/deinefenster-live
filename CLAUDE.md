# DeineFenster.de – Claude Anweisungen

## Projekt
Online-Shop für Drutex Fenster und Türen.
Ziel: Beste Fenster-Website Deutschland – besser als meinfenster24.de
NUR Drutex Produkte. Alle Details in PROJEKT.md

## Was schon existiert
- index.html – Startseite
- konfigurator.html – 6-Schritte-Konfigurator mit Live-Preis
- produkte.html – Produktkatalog
- dashboard.html – Admin Dashboard
- img/ – Produktbilder
- Farben: Primär #225eaa, Dunkelblau #1e3a8a
- Fonts: Plus Jakarta Sans + Manrope

## Deine Aufgabe
IMMER zuerst die bestehenden Dateien lesen bevor du etwas änderst.
Optimiere was da ist – baue NICHT neu.
Orientiere dich an meinfenster24.de aber mache es schöner.

## Design Regeln
- Kein KI-Schrott, kein Standard-Template
- High-End, modern, vertrauenswürdig
- Tailwind CSS, HTML, JavaScript
- Bestehende Farben und Fonts behalten

## Skills die du nutzen sollst
- frontend-design: Bei jedem Design
- seo: Bei allen Texten und Meta-Tags
- firecrawl: Konkurrenz analysieren
- ux-design: Navigation und Benutzerführung
- n8n-workflows: Konfigurator und Email Automation
- marketing: Verkaufstexte

## DESIGN-REGELN FÜR DIESES PROJEKT

**PFLICHT:** Bei ALLEN Design-Aufgaben zuerst DESIGN-SKILLS.md lesen und konsultieren.

### Animationen
- GSAP ist die einzige Animations-Library – kein CSS-only, kein andere Libs
- ScrollTrigger für alle Scroll-basierten Animationen
- `prefers-reduced-motion` IMMER respektieren (Code-Muster in DESIGN-SKILLS.md)
- Nur `transform` und `opacity` animieren – nie Layout-Properties

### Verboten (KI-Schrott vermeiden)
- KEIN Inter-Font oder Roboto als Headline-Font
- KEINE Purple/Pink/Rainbow-Gradients
- KEIN gleichmäßiges 50/50-Grid ohne Gewichtung
- KEINE Animationen ohne Funktion (rein dekorativ)
- KEIN Standard-Template-Look

### Premium-Ästhetik für DeineFenster.de
- Primärfarbe #225eaa und Dunkelblau #1e3a8a konsequent einsetzen
- Gold-Akzent #c9a84c nur sparsam (Badges, Premium-Highlights)
- Plus Jakarta Sans für Headlines (700–800), Manrope für Body (400)
- Asymmetrische Layouts bevorzugen (60/40, versetzte Grids)
- 8px-Spacing-System einhalten (Tailwind-Klassen passen dazu)

### Fonts & Farben
- Bestehende Fonts (Plus Jakarta Sans + Manrope) NICHT ändern
- Bestehende Primärfarben NICHT ändern
- Nur Premium-Ergänzungen aus DESIGN-SKILLS.md Abschnitt 2 hinzufügen

### Accessibility
- WCAG 2.1 AA Kontrast-Mindestanforderungen einhalten
- `:focus-visible` Styles nie entfernen
- Semantisches HTML (h1 einmal, button vs. a korrekt)
