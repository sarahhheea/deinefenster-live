/* dfnav — Hover-Intent-Flyouts (Desktop) + Burger-Drawer (Mobile). Selbst-startend, ID/Klassen-basiert. */
(function(){
  // Mega-Flyout: sofort öffnen bei Hover/Fokus, verzögert schließen, bleibt offen im Panel
  var CLOSE_DELAY = 260;
  var items = [].slice.call(document.querySelectorAll('nav.dfnav .dfnav-item'));
  items.forEach(function(item){
    if(!item.querySelector('.dfnav-mega')) return;
    var t = null;
    function open(){ clearTimeout(t); items.forEach(function(o){ if(o!==item) o.classList.remove('open'); }); item.classList.add('open'); }
    function scheduleClose(){ clearTimeout(t); t = window.setTimeout(function(){ item.classList.remove('open'); }, CLOSE_DELAY); }
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', scheduleClose);
    item.addEventListener('focusin', open);
    item.addEventListener('focusout', function(e){ if(!item.contains(e.relatedTarget)) scheduleClose(); });
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') items.forEach(function(o){ o.classList.remove('open'); }); });

  // Mobile-Drawer
  var burger = document.getElementById('dfnav-burger');
  var drawer = document.getElementById('dfnav-drawer');
  var closeBtn = document.getElementById('dfnav-close');
  if(!burger || !drawer) return;
  function openD(){ drawer.classList.add('open'); burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
  function shutD(){ drawer.classList.remove('open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  burger.addEventListener('click', openD);
  closeBtn && closeBtn.addEventListener('click', shutD);
  drawer.addEventListener('click', function(e){ if(e.target===drawer) shutD(); });
  drawer.querySelectorAll('a[href]').forEach(function(a){ a.addEventListener('click', shutD); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') shutD(); });
})();
