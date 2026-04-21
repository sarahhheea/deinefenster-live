# DESIGN-SKILLS – DeineFenster.de

## 1. GSAP Animations

### Installation

**CDN (empfohlen für dieses Projekt):**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

**npm:**
```bash
npm install gsap
```
```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

---

### ScrollTrigger – Scroll-Animationen

Elemente erscheinen beim Scrollen elegant ins Bild.

```js
gsap.registerPlugin(ScrollTrigger);

// Einfaches Fade-in beim Scrollen
gsap.from(".section-card", {
  scrollTrigger: {
    trigger: ".section-card",
    start: "top 80%",
    toggleActions: "play none none none"
  },
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: "power2.out"
});

// Parallax-Hintergrundbild
gsap.to(".hero-bg", {
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1.5
  },
  y: "20%",
  ease: "none"
});

// Fortschrittsbalken mit Scrub
gsap.to(".progress-line", {
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.3
  },
  scaleX: 1,
  transformOrigin: "left center"
});
```

**Best Practice:** `start: "top 85%"` für mobile, `start: "top 75%"` für Desktop – so sieht der User die Animation bevor er zu weit scrollt.

---

### Stagger – Listen, Karten, Grids

Karten erscheinen nacheinander, nicht alle gleichzeitig.

```js
// Produktkarten staggered einblenden
gsap.from(".product-card", {
  scrollTrigger: {
    trigger: ".product-grid",
    start: "top 80%"
  },
  opacity: 0,
  y: 50,
  scale: 0.97,
  duration: 0.6,
  stagger: 0.12,
  ease: "power2.out"
});

// Icon-Reihe von links nach rechts
gsap.from(".feature-icon", {
  scrollTrigger: { trigger: ".features", start: "top 75%" },
  opacity: 0,
  x: -20,
  duration: 0.5,
  stagger: 0.08,
  ease: "back.out(1.4)"
});
```

---

### Smooth Page Transitions

Zwischen Seiten sanft wechseln (ohne Framework).

```js
// Seite ein-/ausblenden
function pageLeave(callback) {
  gsap.to("main", {
    opacity: 0,
    y: -15,
    duration: 0.35,
    ease: "power2.in",
    onComplete: callback
  });
}

function pageEnter() {
  gsap.from("main", {
    opacity: 0,
    y: 15,
    duration: 0.45,
    ease: "power2.out"
  });
}

// Links abfangen
document.querySelectorAll("a[href]").forEach(link => {
  if (link.hostname === location.hostname) {
    link.addEventListener("click", e => {
      e.preventDefault();
      const href = link.href;
      pageLeave(() => { window.location.href = href; });
    });
  }
});

window.addEventListener("load", pageEnter);
```

---

### Hover-Effekte

**3D-Tilt-Rotation (Premium-Karten):**
```js
document.querySelectorAll(".card-3d").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 12,
      rotateX: -y * 12,
      transformPerspective: 800,
      ease: "power1.out",
      duration: 0.4
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  });
});
```

**Scale + Shadow Lift:**
```js
gsap.utils.toArray(".hover-lift").forEach(el => {
  el.addEventListener("mouseenter", () =>
    gsap.to(el, { y: -6, scale: 1.02, boxShadow: "0 20px 40px rgba(34,94,170,0.2)", duration: 0.3, ease: "power2.out" })
  );
  el.addEventListener("mouseleave", () =>
    gsap.to(el, { y: 0, scale: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", duration: 0.4, ease: "power2.out" })
  );
});
```

**Parallax-Bild innerhalb Karte:**
```js
document.querySelectorAll(".parallax-card").forEach(card => {
  const img = card.querySelector("img");
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(img, { x: x * 18, y: y * 10, duration: 0.5, ease: "power1.out" });
  });
  card.addEventListener("mouseleave", () =>
    gsap.to(img, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" })
  );
});
```

---

### Performance & Accessibility

```js
// Nur animieren wenn kein Reduced-Motion gewünscht
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  // Alle GSAP-Animationen hier
  gsap.from(".hero-title", { opacity: 0, y: 30, duration: 1 });
}

// GPU-Beschleunigung für häufig animierte Elemente
// CSS: will-change: transform; transform: translateZ(0);

// ScrollTrigger aufräumen (SPA/Komponenten)
ScrollTrigger.getAll().forEach(t => t.kill());
```

**Regeln:**
- Animiere nur `transform` und `opacity` — nie `width`, `height`, `top`, `left` (löst Layout-Reflow aus)
- `will-change: transform` nur auf Elemente die wirklich animiert werden
- Komplexe Timelines in `matchMedia`-Blöcke wrappen für Desktop/Mobile-Unterschiede
- `ScrollTrigger.refresh()` nach dynamischen Inhalten aufrufen

---

## 2. UI/UX Best Practices – Premium-Websites

### Typografie-System

**Fonts für DeineFenster.de (bereits konfiguriert):**
- **Plus Jakarta Sans** – Headlines, CTAs (modern, technisch-premium)
- **Manrope** – Body Text, UI-Elemente (klar, vertrauenswürdig)

**Zu vermeiden:** Inter, Roboto, Open Sans → generisch, kein Charakter

**Typografie-Skala (fluid, clamp-basiert):**
```css
:root {
  --text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 0.8rem  + 0.375vw, 1rem);
  --text-base: clamp(1rem,     0.95rem + 0.25vw,  1.125rem);
  --text-lg:   clamp(1.125rem, 1rem    + 0.625vw, 1.375rem);
  --text-xl:   clamp(1.25rem,  1.1rem  + 0.75vw,  1.625rem);
  --text-2xl:  clamp(1.5rem,   1.25rem + 1.25vw,  2rem);
  --text-3xl:  clamp(1.875rem, 1.5rem  + 1.875vw, 2.625rem);
  --text-4xl:  clamp(2.25rem,  1.75rem + 2.5vw,   3.5rem);
  --text-hero: clamp(2.75rem,  2rem    + 3.75vw,  5rem);
}
```

**Schriftgewichte:**
- Headlines: 700–800 (Bold/ExtraBold)
- Subheadings: 600 (SemiBold)
- Body: 400–450
- Captions/Labels: 500–600, Uppercase + Letter-spacing 0.05em

---

### Farbpalette – Premium & Vertrauenswürdig

**DeineFenster.de Basis:**
```css
:root {
  /* Primär-Blau (bestehend, beibehalten) */
  --color-primary:     #225eaa;
  --color-primary-dark: #1e3a8a;
  --color-primary-light: #3b82f6;

  /* Premium-Ergänzungen */
  --color-slate:       #0f172a;   /* Fast-Schwarz für Headlines */
  --color-slate-700:   #334155;   /* Dunkelgrau für Body */
  --color-slate-400:   #94a3b8;   /* Grau für Captions */
  --color-slate-100:   #f1f5f9;   /* Sehr helles Grau für Backgrounds */

  /* Akzent */
  --color-gold:        #c9a84c;   /* Sparingly: Premium-Badge, CTA-Highlight */
  --color-success:     #059669;   /* Grüner Haken, Bestätigung */

  /* Backgrounds */
  --bg-white:          #ffffff;
  --bg-offwhite:       #fafafa;
  --bg-section:        #f8fafc;
}
```

**Gradient-Regeln:**
- Erlaubt: Subtile Blau-Verläufe `linear-gradient(135deg, #1e3a8a 0%, #225eaa 100%)`
- Verboten: Purple, Pink, Rainbow, Neon-Gradients → KI-Klischee

---

### 8px-Spacing-System

```css
:root {
  --space-1:  4px;
  --space-2:  8px;   /* Basis-Einheit */
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
}
```

**Tailwind-Mapping:** Tailwind arbeitet bereits mit 4px-Basis (space-1=4px, space-2=8px) → passt perfekt.

**Section-Padding:** `py-20 md:py-32` (80px/128px) für Abschnitte mit viel Inhalt, `py-12 md:py-20` für kompakte.

---

### Motion-Design-Prinzipien

**Wann Animation sinnvoll:**
- Zustandswechsel (Button hover, Modal öffnen/schließen)
- Navigation/Orientierung (welche Seite, welcher Schritt)
- Aufmerksamkeit lenken (CTA pulsiert sanft)
- Scroll-Storytelling (Produktvorteile erscheinen beim Scrollen)

**Wann KEINE Animation:**
- Reine Dekoration ohne Funktion
- Kritische UI-Elemente (Fehlermeldungen, Ladebalken)
- Wenn `prefers-reduced-motion: reduce` aktiv ist
- Wenn Ladezeit > 100ms dadurch steigt

**Timing-Referenz:**
```
Hover-Feedback:    150–200ms  (power1.out)
UI-Elemente:       200–350ms  (power2.out)
Karten/Panels:     400–600ms  (power3.out)
Hero/Page-Enter:   600–900ms  (power2.out + stagger)
Komplexe Szenen:   1000–1500ms (Timeline mit stagger)
```

---

### Asymmetrische Layouts

Gleichmäßige Grids wirken langweilig. Premium-Sites nutzen Gewichtung:

```html
<!-- 60/40 Split statt 50/50 -->
<div class="grid grid-cols-5 gap-12">
  <div class="col-span-3"><!-- Hauptinhalt --></div>
  <div class="col-span-2"><!-- Sidebar/Bild --></div>
</div>

<!-- Versetztes Grid für Features -->
<div class="grid grid-cols-12 gap-8">
  <div class="col-span-7 col-start-1">...</div>
  <div class="col-span-4 col-start-9 mt-16">...</div><!-- Bewusst versetzt -->
</div>

<!-- Großes Bild das aus dem Container bricht -->
<div class="relative overflow-visible">
  <img class="w-full translate-x-12 translate-y-8 scale-105" ...>
</div>
```

---

### Accessibility-Standards (WCAG 2.1 AA)

**Kontrast-Mindestanforderungen:**
- Body Text: 4.5:1 gegen Hintergrund
- Große Headlines (>24px bold): 3:1
- UI-Komponenten (Buttons, Inputs): 3:1

**Fokus-Styles (nie entfernen!):**
```css
:focus-visible {
  outline: 2px solid #225eaa;
  outline-offset: 3px;
  border-radius: 4px;
}
```

**GSAP + Accessibility:**
```js
// Reduzierte Bewegung respektieren
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // Alle Animationen hier
});
mm.add("(prefers-reduced-motion: reduce)", () => {
  // Statische Fallbacks oder keine Animation
  gsap.set(".animated", { opacity: 1, x: 0, y: 0 });
});
```

**Semantisches HTML:**
- `<h1>` nur einmal pro Seite
- `<button>` für klickbare Aktionen, `<a>` für Navigation
- `alt`-Texte beschreiben den Inhalt, nicht "Bild von..."
- `aria-label` für Icons ohne sichtbaren Text

---

## 3. Zusammenarbeit mit Stitch-generiertem Code

Stitch exportiert Tailwind-Komponenten. So integrierst du GSAP:

1. **Klassen als GSAP-Selektoren nutzen** – Stitch-Klassen direkt ansprechen, keine Extra-Klassen nötig
2. **GSAP nach DOM-Ready** – `<script>` vor `</body>`, nach Stitch-Elementen
3. **Tailwind-Transitions deaktivieren** wo GSAP übernimmt:
   ```html
   <!-- Statt Tailwind transition-all -->
   <div class="card" style="will-change: transform;">
   ```
4. **ScrollTrigger.refresh()** nach Stitch-Komponenten die Höhe ändern

---

## 4. Wann welcher Skill

| Aufgabe | Skill |
|---|---|
| Neue Sektion/Komponente bauen | `frontend-design` |
| Scroll-Animationen hinzufügen | Diese Datei (GSAP) |
| Hover-Effekte auf Karten | Diese Datei (GSAP) |
| Page-Transition einbauen | Diese Datei (GSAP) |
| Typografie/Farben anpassen | Abschnitt 2 dieser Datei |
| Accessibility-Check | Abschnitt 2 diese Datei |
| SEO-Texte optimieren | `seo` Skill |
| Konkurrenz analysieren | `firecrawl` Skill |
