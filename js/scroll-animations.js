/**
 * DeineFenster.de – Einheitliche Scroll-Animationen
 * Nutzt GSAP + ScrollTrigger. Respektiert prefers-reduced-motion.
 *
 * Anwendung: einfach per <script> einbinden, die Klassen nutzen:
 *   data-anim="fade-up"      Fade + Translate Y
 *   data-anim="fade"         Nur Opacity
 *   data-anim="scale"        Scale 0.96 → 1 + Fade
 *   data-anim="slide-left"   Von links einfliegen
 *   data-anim="slide-right"  Von rechts einfliegen
 *   data-anim="stagger"      Kinder werden gestaffelt animiert (auf Container setzen)
 *
 * Optionale Attribute:
 *   data-anim-delay="0.2"    Verzögerung in Sekunden
 *   data-anim-duration="1.0" Dauer (default 0.8)
 *   data-anim-y="60"         Startversatz in px (default 40)
 *
 * Auto-Fallback auf index.html-, produkte.html-, ueber-uns.html-Klassen:
 *   h2 und .grid-Kinder werden automatisch animiert — nur auf Seiten mit
 *   <body data-auto-anim="true">
 */

(function () {
  'use strict';

  // ----- FOUC-Schutz (Flash Of Unanimated Content) -----
  // Synchron schon beim Script-Load ausblenden, damit es keinen "Pop-Out → Pop-In"-Effekt gibt.
  // Wird später von GSAP mit autoAlpha animiert.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const style = document.createElement('style');
    style.id = 'anim-fouc-guard';
    style.textContent = `
      [data-anim] { opacity: 0; }
      body[data-auto-anim="true"] main h2,
      body[data-auto-anim="true"] section h2,
      body[data-auto-anim="true"] .grid > div:not([data-anim]),
      body[data-auto-anim="true"] .grid > article:not([data-anim]) { opacity: 0; }
      /* Fallback: Falls GSAP nach 3s noch nicht gerannt ist, sichtbar machen */
      @keyframes animGuardFallback { to { opacity: 1; } }
      [data-anim],
      body[data-auto-anim="true"] main h2,
      body[data-auto-anim="true"] section h2,
      body[data-auto-anim="true"] .grid > div:not([data-anim]),
      body[data-auto-anim="true"] .grid > article:not([data-anim]) {
        animation: animGuardFallback 0s ease 3s forwards;
      }
    `;
    // Auch bei erstem Paint noch vor dem Body-Rendering einspeisen
    (document.head || document.documentElement).appendChild(style);
  } else {
    // Reduced-Motion: gar nichts tun, sichtbar lassen
    document.documentElement.classList.add('motion-reduced');
    return;
  }

  function ready() {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      console.warn('[scroll-animations] GSAP oder ScrollTrigger fehlt.');
      // FOUC-Guard entfernen, damit Content sichtbar wird
      const guard = document.getElementById('anim-fouc-guard');
      if (guard) guard.remove();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Zentrale Animation-Defaults
    const DEFAULT_DURATION = 0.8;
    const DEFAULT_Y = 40;
    const DEFAULT_EASE = 'power2.out';
    const START_TRIGGER = 'top 85%'; // Element startet bei 85% Viewport-Höhe

    function parseFloatAttr(el, attr, fallback) {
      const v = parseFloat(el.getAttribute(attr));
      return isNaN(v) ? fallback : v;
    }

    // Einheitlicher Animations-Builder
    function animateElement(el, type) {
      const delay = parseFloatAttr(el, 'data-anim-delay', 0);
      const duration = parseFloatAttr(el, 'data-anim-duration', DEFAULT_DURATION);
      const y = parseFloatAttr(el, 'data-anim-y', DEFAULT_Y);

      let from = {};
      switch (type) {
        case 'fade':
          from = { autoAlpha: 0 };
          break;
        case 'fade-up':
          from = { autoAlpha: 0, y: y };
          break;
        case 'scale':
          from = { autoAlpha: 0, scale: 0.96 };
          break;
        case 'slide-left':
          from = { autoAlpha: 0, x: -y };
          break;
        case 'slide-right':
          from = { autoAlpha: 0, x: y };
          break;
        default:
          from = { autoAlpha: 0, y: y };
      }

      gsap.fromTo(el, from, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: duration,
        delay: delay,
        ease: DEFAULT_EASE,
        scrollTrigger: {
          trigger: el,
          start: START_TRIGGER,
          toggleActions: 'play none none none', // nur einmal abspielen, nicht rückwärts
        },
      });
    }

    // Stagger: animiert alle direkten Kinder eines Containers nacheinander
    function animateStagger(container) {
      const children = Array.from(container.children);
      if (!children.length) return;
      const delay = parseFloatAttr(container, 'data-anim-delay', 0);
      const duration = parseFloatAttr(container, 'data-anim-duration', DEFAULT_DURATION);
      const y = parseFloatAttr(container, 'data-anim-y', DEFAULT_Y);

      gsap.fromTo(
        children,
        { autoAlpha: 0, y: y },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration,
          delay: delay,
          ease: DEFAULT_EASE,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            start: START_TRIGGER,
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // 1) Explizit getaggte Elemente
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      const type = el.getAttribute('data-anim');
      if (type === 'stagger') {
        animateStagger(el);
      } else {
        animateElement(el, type);
      }
    });

    // 2) Auto-Fallback auf gängigen Content-Elementen (opt-in per <body data-auto-anim="true">)
    if (document.body.getAttribute('data-auto-anim') === 'true') {
      // Headlines
      document
        .querySelectorAll('main h2:not([data-anim]), section h2:not([data-anim])')
        .forEach((el) => animateElement(el, 'fade-up'));

      // Karten-Grids werden automatisch als Stagger animiert — nur Grids mit ≤12 Kindern
      document.querySelectorAll('.grid').forEach((grid) => {
        if (grid.hasAttribute('data-anim')) return;
        if (grid.dataset.staggerProcessed === 'true') return;
        const children = grid.children;
        if (children.length > 0 && children.length <= 12) {
          grid.dataset.staggerProcessed = 'true';
          animateStagger(grid);
        }
      });
    }

    // 3) Counter-Animation: Elemente mit class="counter" zählen von 0 auf Zielwert hoch
    //    data-counter-target="24"       — Zielwert
    //    data-counter-decimals="1"       — Nachkommastellen (default 0)
    //    data-counter-suffix=" Tage"     — Suffix hinter der Zahl
    //    data-counter-prefix="~"         — Prefix vor der Zahl
    //    data-counter-duration="2.5"    — Dauer in Sekunden (default 2)
    document.querySelectorAll('.counter[data-counter-target]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const prefix = el.getAttribute('data-counter-prefix') || '';
      const duration = parseFloatAttr(el, 'data-counter-duration', 2);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          const formatted = decimals > 0
            ? obj.val.toFixed(decimals).replace('.', ',')
            : Math.round(obj.val).toString();
          el.textContent = `${prefix}${formatted}${suffix}`;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // 4) FOUC-Guard entfernen (Elemente die nicht animiert wurden, sichtbar machen)
    const guard = document.getElementById('anim-fouc-guard');
    if (guard) {
      // Style-Tag deaktivieren: Alles was nicht via gsap.set auf opacity:0 gesetzt wurde,
      // wird sichtbar. autoAlpha hat inline-Style gesetzt, das überschreibt die CSS-Regel.
      setTimeout(() => {
        guard.remove();
        // Force visibility auf alles was keinen Inline-Style hat
        document
          .querySelectorAll(
            'body[data-auto-anim="true"] main h2, body[data-auto-anim="true"] section h2, body[data-auto-anim="true"] .grid > div, body[data-auto-anim="true"] .grid > article'
          )
          .forEach((el) => {
            if (!el.style.visibility && !el.style.opacity) {
              el.style.opacity = '1';
              el.style.visibility = 'visible';
            }
          });
      }, 100);
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();

// ===== SWIPER INITIALIZATION (neue Slideshows auf ueber-drutex.html) =====
(function () {
  'use strict';

  function initSwipers() {
    // Lifestyle Slideshow (Sektion 12)
    if (document.querySelector('.lifestyle-slideshow')) {
      const lifestyleSwiper = new Swiper('.lifestyle-slideshow', {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.lifestyle-pag',
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        },
        speed: 800,
      });
    }
  }

  // Warte bis Swiper geladen ist
  function waitForSwiper() {
    if (typeof Swiper !== 'undefined') {
      initSwipers();
    } else {
      setTimeout(waitForSwiper, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSwiper);
  } else {
    waitForSwiper();
  }
})();

// ===== PARALLAX EFFEKT für Image-Breaker (Sektion 14) =====
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // Kein Parallax bei reduced motion

  function initParallax() {
    const parallaxImg = document.getElementById('parallax-breaker-img');
    if (!parallaxImg) return;

    const parallaxSection = parallaxImg.parentElement;
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: parallaxSection,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        markers: false,
      },
    });

    tl.to(parallaxImg, {
      yPercent: -15,
      ease: 'none',
    });
  }

  // Warte auf GSAP
  function waitForGsap() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      initParallax();
    } else {
      setTimeout(waitForGsap, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForGsap);
  } else {
    waitForGsap();
  }
})();

// ===== SCROLL-PROGRESS BAR (Fortschritts-Linie oben am Screen) =====
(function () {
  'use strict';

  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollProgress);
  } else {
    initScrollProgress();
  }
})();

// ===== MAGNETIC CARD HOVER (Sektionen 5, 13) =====
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function initMagneticCards() {
    // Alle Karten mit group-class (Vertikal-Integriert und IM DETAIL)
    const cards = document.querySelectorAll('.group.relative');

    cards.forEach(card => {
      if (!card.classList.contains('overflow-hidden')) return; // Nur Cards mit overflow-hidden

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Berechne Winkel für subtile Rotation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = (y - centerY) * 0.02;
        const rotY = (x - centerX) * 0.02;

        // Animiere mit GSAP wenn vorhanden
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotationX: rotX,
            rotationY: rotY,
            y: -4,
            duration: 0.4,
            overwrite: 'auto',
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            y: 0,
            duration: 0.6,
            overwrite: 'auto',
          });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticCards);
  } else {
    initMagneticCards();
  }
})();

// ===== SMOOTH SCROLL ======
(function () {
  'use strict';

  // Prüfe ob CSS-Smooth-Scroll unterstützt wird
  const html = document.documentElement;
  if (html.style.scrollBehavior !== undefined) {
    html.style.scrollBehavior = 'smooth';
  }
})();
