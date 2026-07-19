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

/* dfnav — Warenkorb-Symbol site-weit: liest localStorage (df_cart_v1), injiziert Icon+Zähler-Badge vor den „Angebot"-CTA. Self-contained (eigener Style), funktioniert in dfnav UND alter nav.main. */
(function(){
  var LS='df_cart_v1';
  function count(){ try{ var d=JSON.parse(localStorage.getItem(LS)||'null'); return (d&&d.items&&d.items.length)?d.items.length:0; }catch(e){ return 0; } }
  function ensureStyle(){
    if(document.getElementById('df-cart-style')) return;
    var s=document.createElement('style'); s.id='df-cart-style';
    s.textContent='.df-cart-link{position:relative;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;color:#225eaa;text-decoration:none;transition:background .18s;flex:none}.df-cart-link:hover{background:rgba(34,94,170,.10)}.df-cart-link svg{width:23px;height:23px}.df-cart-badge{position:absolute;top:2px;right:2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#225eaa;color:#fff;font:700 11px/18px system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 2px 6px rgba(34,94,170,.45);pointer-events:none}.df-cart-badge[hidden]{display:none}@keyframes dfCartPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}.df-cart-badge.pop{animation:dfCartPop .35s ease}';
    document.head.appendChild(s);
  }
  function build(){
    var a=document.createElement('a');
    a.className='df-cart-link'; a.href='/warenkorb.html'; a.setAttribute('aria-label','Warenkorb ansehen');
    a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span class="df-cart-badge" hidden>0</span>';
    return a;
  }
  function inject(){
    ensureStyle();
    var link=document.querySelector('.df-cart-link');
    if(!link){
      var cta=document.querySelector('.dfnav-cta')||document.querySelector('.nav-cta');
      if(!cta||!cta.parentNode) return null;
      link=build(); cta.parentNode.insertBefore(link, cta);
    }
    return link;
  }
  var last=-1;
  function refresh(){
    var link=inject(); if(!link) return;
    var n=count(); var b=link.querySelector('.df-cart-badge');
    if(!b) return;
    b.textContent=n;
    if(n>0){ b.hidden=false; if(n!==last && last!==-1){ b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } }
    else { b.hidden=true; }
    last=n;
  }
  if(document.readyState!=='loading') refresh(); else document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('storage', function(e){ if(e.key===LS) refresh(); });
  window.addEventListener('df-cart-changed', refresh);
  window.addEventListener('pageshow', refresh);
})();
