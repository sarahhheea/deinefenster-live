/* mail-fallback.js
   Smart-Fallback für mailto:-CTAs.
   Klick → versuche Mail-Client. Wenn nach 1500ms Tab noch sichtbar ist
   (= kein Mail-Client installiert/registriert), redirect zum Kontaktformular.
   Markup: <a class="cta-mail-with-fallback" href="mailto:..." data-fallback="/kontakt.html#kontakt-form">…</a>
*/
(function () {
  function bind() {
    document.querySelectorAll('.cta-mail-with-fallback').forEach(function (el) {
      if (el.__mailFallbackBound) return;
      el.__mailFallbackBound = true;
      el.addEventListener('click', function () {
        var fallback = this.getAttribute('data-fallback');
        if (!fallback) return;
        var cancelled = false;
        function onHide() { cancelled = true; }
        document.addEventListener('visibilitychange', onHide, { once: true });
        window.addEventListener('blur', onHide, { once: true });
        setTimeout(function () {
          document.removeEventListener('visibilitychange', onHide);
          window.removeEventListener('blur', onHide);
          if (!cancelled && document.visibilityState === 'visible') {
            location.href = fallback;
          }
        }, 1500);
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
