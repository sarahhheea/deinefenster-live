/* ═══════════════════════════════════════════════════════════════════════
   Profil-Farben — Interaktive Hover-Vorschau mit ECHTEN Drutex-Bildern
   Sarah-Wunsch 24.04.2026 (v3): Drutex-URLs direkt eingebunden.
   Sarah ist Drutex-Händlerin und darf Marketing-Material nutzen.
   Bilder werden von drutex.de geladen (CDN-gecached, schnell).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const section = document.querySelector('.pf-section');
  if (!section) return;

  const mainImg = section.querySelector('.pf-main-img');
  const label = section.querySelector('.pf-label');
  const spinner = section.querySelector('.pf-spinner');
  const swatches = section.querySelectorAll('.pf-swatch');
  if (!mainImg || !swatches.length) return;

  function showLoading(on) {
    if (spinner) spinner.classList.toggle('visible', on);
    mainImg.classList.toggle('is-loading', on);
  }

  // Vorladen aller 8 Frame-Bilder nach 500 ms (damit First Paint nicht leidet)
  setTimeout(() => {
    swatches.forEach(sw => {
      const url = sw.dataset.frameUrl;
      if (url) { const i = new Image(); i.src = url; }
    });
  }, 500);

  function setColor(swatch) {
    const url = swatch.dataset.frameUrl;
    const name = swatch.dataset.name;
    if (!url) return;
    if (label) label.textContent = name;
    if (mainImg.src === url) return;
    showLoading(true);
    mainImg.onload = () => showLoading(false);
    mainImg.onerror = () => showLoading(false);
    mainImg.src = url;
  }

  // Erste Farbe als aktiv markieren und anzeigen
  const first = swatches[0];
  first.classList.add('is-active');
  setColor(first);
  let pinned = first;

  swatches.forEach(sw => {
    sw.addEventListener('mouseenter', () => setColor(sw));
    sw.addEventListener('focus', () => setColor(sw));
    sw.addEventListener('click', () => {
      if (pinned) pinned.classList.remove('is-active');
      pinned = sw;
      sw.classList.add('is-active');
      setColor(sw);
    });
    sw.setAttribute('tabindex', '0');
    sw.setAttribute('role', 'button');
    sw.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sw.click(); }
    });
  });

  const swatchList = section.querySelector('.pf-swatches');
  if (swatchList) {
    swatchList.addEventListener('mouseleave', () => {
      if (pinned) setColor(pinned);
    });
  }
})();
