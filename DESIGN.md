---
name: DeineFenster.de
description: Premium Fenster & Türen Shop — Drutex Fachhandel, Dark Theme, Brandenburg
colors:
  primary: "#225eaa"
  primary-light: "#76a9fa"
  primary-deep: "#1e3a8a"
  gold: "#c9a84c"
  surface: "#0a1530"
  surface-elevated: "#0f1c30"
  surface-deep: "#0a1225"
  surface-card: "rgba(255,255,255,0.04)"
  surface-card-border: "rgba(232,238,255,0.08)"
  on-surface: "#e8eeff"
  on-surface-secondary: "rgba(232,238,255,0.75)"
  on-surface-tertiary: "rgba(232,238,255,0.55)"
  on-surface-muted: "rgba(232,238,255,0.40)"
  success: "#4ade80"
  error: "#f87171"
  glass-border: "rgba(255,255,255,0.10)"
  glass-bg: "rgba(255,255,255,0.06)"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  subheading:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(1.1rem, 2vw, 1.4rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "72px"
  2xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
    fontWeight: 700
    fontSize: "14px"
    shadow: "0 8px 20px rgba(34,94,170,0.35)"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    transform: "translateY(-2px)"
    shadow: "0 12px 28px rgba(34,94,170,0.45)"
  card:
    backgroundColor: "{colors.surface-card}"
    border: "1px solid {colors.surface-card-border}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-hover:
    backgroundColor: "rgba(255,255,255,0.07)"
    border: "1px solid rgba(34,94,170,0.25)"
  badge:
    backgroundColor: "rgba(34,94,170,0.18)"
    textColor: "{colors.primary-light}"
    border: "1px solid rgba(118,169,250,0.20)"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.14em"
    textTransform: "uppercase"
---

## Brand Identity

DeineFenster.de ist der Online-Shop des Familien­betriebs Fensterhandel Christ aus Brandenburg an der Havel. Offizieller Drutex-Fachpartner. Zielgruppe: Deutsche Privatkunden, die Qualitätsfenster direkt vom Händler kaufen wollen — ohne Zwischenhändler, ohne versteckte Kosten.

**Ton:** Vertrauenswürdig, direkt, kompetent. Kein Corporate-Sprech, kein KI-Promo-Stil. Familien­betrieb mit Fachkenntnis — nahbar, aber professionell.

**Anti-Referenzen:** Kein generisches AI-Design. Kein helles Bootstrap-Template. Kein eBay-Kleinanzeigen-Look. Keine weißen Hintergründe auf Produktseiten.

## Colors

Das komplette Farbsystem ist dunkel (Dark Theme) — niemals weiße oder sehr helle Seiten­hintergründe. Alle Produktseiten, Landingpages und Formulare bleiben dunkel.

- **Surface** `#0a1530`: Haupt-Background, Navbar, Footer
- **Surface elevated** `#0f1c30`: Sektionen, Karten-Hintergrund
- **Surface deep** `#0a1225`: Tiefste Ebene, Querschnitt-Sektionen
- **Primary** `#225eaa`: CTAs, aktive Links, Icons
- **Primary light** `#76a9fa`: Labels, Badges, helle Akzente auf dunkel
- **Gold** `#c9a84c`: Aktiver Swatch-State, Premium-Markierung, Trennlinien
- **On-surface** `#e8eeff`: Haupttext (immer auf dunklem BG)
- **On-surface secondary** `rgba(232,238,255,0.75)`: Fließtext, Beschreibungen
- **On-surface muted** `rgba(232,238,255,0.40)`: Nur für rein dekorative Elemente — NIE für lesbare Texte

**Kontrast-Regel:** Texte die gelesen werden sollen minimum 4.5:1 — also mindestens `rgba(232,238,255,0.65)` auf `#0a1530`.

## Typography

Zwei Fonts, beide über Google Fonts:
- **Plus Jakarta Sans** (800, 700): alle Headlines, CTAs, Labels
- **Manrope** (400, 500, 600): Body, Beschreibungen, Tabellen

Kein Inter, kein Roboto, kein System-Font-Stack für sichtbare Texte.

Display-Headlines haben `letter-spacing: -0.02em` für kompakten Premium-Look.
Body-Text hat `line-height: 1.7` für gute Lesbarkeit bei dunklem Hintergrund.

## Elevation & Shadows

Drei Ebenen:
1. **Base** (Body): `#0a1530` — kein Schatten
2. **Raised** (Karten, Modals): `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(232,238,255,0.08)` + `box-shadow: 0 8px 24px rgba(0,0,0,0.3)`
3. **Floating** (Tooltips, Dropdowns): `background: rgba(14,30,58,0.95)` + `backdrop-filter: blur(12px)` + `box-shadow: 0 16px 40px rgba(0,0,0,0.5)`

## Motion & Animation

**Library:** GSAP 3.12.5 + ScrollTrigger (CDN)
**Zentrales Script:** `js/scroll-animations.js` — auf ALLEN Seiten einbinden

Standard Scroll-Reveal Einstellungen:
```js
gsap.from(el, {
  opacity: 0,
  y: 32,
  duration: 0.7,
  ease: "power2.out",
  scrollTrigger: { trigger: el, start: "top 85%" }
});
```

**Timing:** Nichts unter 0.3s, nichts über 1.0s für primäre Animationen.
**Stagger:** 0.08s zwischen Grid-Items, 0.12s zwischen größeren Elementen.
**Easing:** `power2.out` Standard, `back.out(1.2)` für Elemente die "einfedern" sollen.
**Reduced motion:** `@media (prefers-reduced-motion: reduce)` immer implementieren.

## Components

**Eyebrow-Label** (über Überschriften):
```html
<span class="eyebrow">KATEGORIE</span>
```
```css
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(34,94,170,0.18); color: #76a9fa;
  border: 1px solid rgba(118,169,250,0.20);
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em;
}
```

**Glass-Card** (Standard-Karte):
```css
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(232,238,255,0.08);
  border-radius: 20px;
  padding: 24px;
  transition: background 0.2s, border-color 0.2s;
}
.card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(34,94,170,0.25);
}
```

**CTA-Button (Primary)**:
```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 999px;
  background: #225eaa; color: #fff;
  font-weight: 700; font-size: 14px;
  box-shadow: 0 8px 20px rgba(34,94,170,0.35);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(34,94,170,0.45);
}
```

## Layout

Max-Width: `1440px`, Padding: `px-6 md:px-12`.
Sektions-Padding: `py-16 md:py-20` (Standard), `py-20 md:py-28` (Hero-Bereiche).
Grid: Tailwind Grid, mobile-first, meistens `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
