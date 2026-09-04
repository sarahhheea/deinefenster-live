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
  /* Mengensumme, nicht Positionen: sonst zeigt das Symbol "1", waehrend im Korb daneben
     "Zwischensumme (3)" steht. Gleiche Zahl an beiden Stellen. */
  function count(){ try{ var d=JSON.parse(localStorage.getItem(LS)||'null');
    if(!d||!d.items) return 0;
    return d.items.reduce(function(s,it){ return s + ((it&&it.conf&&it.conf.anzahl)||1); },0);
  }catch(e){ return 0; } }
  /* Der Angebots-Knopf fuehrt auf ein Formular, das den Warenkorb nicht kennt — wer schon
     konfiguriert hat, muesste dort alles noch einmal eintippen. Bei gefuelltem Korb zeigt er
     deshalb in den Checkout. Das Originalziel bleibt in data-df-ziel gemerkt. */
  function ctaZiel(){
    var n=count();
    var ctas=document.querySelectorAll('.dfnav-cta,.dfnav-mlcta,.nav-cta');
    for(var i=0;i<ctas.length;i++){
      var a=ctas[i];
      if(!a.hasAttribute('data-df-ziel')) a.setAttribute('data-df-ziel', a.getAttribute('href')||'/anfrage.html');
      a.setAttribute('href', n>0 ? '/konfigurator.html?checkout=1' : a.getAttribute('data-df-ziel'));
    }
  }
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
    ctaZiel();
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

/* dfnav — Merkliste (Herz) site-weit: liest localStorage (deinefenster_warenkorb_v1),
   injiziert Herz + Zaehler neben den Warenkorb. Aufbau bewusst nach demselben Muster wie
   der Warenkorb-Block darueber (self-contained, eigener Style), damit beide unabhaengig
   voneinander bleiben.

   Auf shop.html passiert hier NICHTS: dort baut js/shop.js denselben Knopf, aber als
   <button>, der den Merklisten-Drawer direkt oeffnet — das ist dort die bessere Bedienung
   als ein Seitenwechsel. Ueberall sonst fuehrt das Herz in den Shop und oeffnet die
   Merkliste per ?merkliste=1. */
(function(){
  var LS='deinefenster_warenkorb_v1';
  function aufShopSeite(){
    return /(^|\/)shop\.html$/.test(location.pathname) || !!document.getElementById('produktGrid');
  }
  function anzahl(){
    try{
      var d=JSON.parse(localStorage.getItem(LS)||'null');
      if(Array.isArray(d)) return d.length;
      return (d&&d.items&&d.items.length)?d.items.length:0;
    }catch(e){ return 0; }
  }
  function ensureStyle(){
    if(document.getElementById('df-merk-style')) return;
    var s=document.createElement('style'); s.id='df-merk-style';
    s.textContent='.df-merk-link{position:relative;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;color:#225eaa;text-decoration:none;transition:background .18s;flex:none}.df-merk-link:hover{background:rgba(34,94,170,.10)}.df-merk-link svg{width:23px;height:23px}.df-merk-badge{position:absolute;top:2px;right:2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#e11d48;color:#fff;font:700 11px/18px system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 2px 6px rgba(225,29,72,.45);pointer-events:none}.df-merk-badge[hidden]{display:none}';
    document.head.appendChild(s);
  }
  function build(){
    var a=document.createElement('a');
    a.className='df-merk-link'; a.href='/shop.html?merkliste=1';
    a.setAttribute('aria-label','Merkliste ansehen'); a.title='Merkliste';
    a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="df-merk-badge" hidden>0</span>';
    return a;
  }
  function inject(){
    if(aufShopSeite()) return null;
    ensureStyle();
    var link=document.querySelector('.df-merk-link');
    if(!link){
      // vor den Warenkorb haengen, damit die Reihenfolge Herz -> Korb -> CTA ist
      var korb=document.querySelector('.df-cart-link');
      var cta=document.querySelector('.dfnav-cta')||document.querySelector('.nav-cta');
      var anker=korb||cta;
      if(!anker||!anker.parentNode) return null;
      link=build(); anker.parentNode.insertBefore(link, anker);
    }
    return link;
  }
  function refresh(){
    var link=inject(); if(!link) return;
    var n=anzahl(); var b=link.querySelector('.df-merk-badge');
    if(!b) return;
    b.textContent=n; b.hidden = n===0;
  }
  if(document.readyState!=='loading') refresh(); else document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('storage', function(e){ if(e.key===LS) refresh(); });
  window.addEventListener('df-merk-changed', refresh);
  window.addEventListener('pageshow', refresh);
})();

/* dfnav — Route site-weit: setzt den Verweis auf die Routenplanung in die
   Kopfleiste (Desktop) und ins ausklappbare Menue (Handy). Bewusst NICHT in die
   Symbolreihe der Navigation: dort ist die Reihe bereits voll, ein weiteres Symbol
   liess die Navigation auf zwei Zeilen umbrechen und wurde am Handy auf 23 px
   zusammengedrueckt. In der Kopfleiste steht der Verweis ausserdem direkt neben den
   Oeffnungszeiten, was zusammengehoert. Reiner Link, keine eingebettete Karte —
   damit ist keine Einwilligung noetig. */
(function(){
  'use strict';
  /* Routenplanung, NICHT das Unternehmensprofil (cid=...): das Profil zeigt nur den
     Eintrag, der Kunde muesste dort erst selbst auf "Route" tippen — am Handy landete
     er in der Karten-App auf dem Eintrag und kam ohne zweiten Schritt nicht weiter.
     Mit dir/?api=1 startet die Navigation sofort, Start ist der eigene Standort. */
  var ZIEL = 'https://www.google.com/maps/dir/?api=1&destination='
    + encodeURIComponent('Fohrder Landstra\u00dfe 13, 14772 Brandenburg an der Havel');
  var PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
    + 'style="width:1em;height:1em;vertical-align:-2px;margin-right:4px">'
    + '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>'
    + '<circle cx="12" cy="10" r="3"/></svg>';

  function inKopfleiste(){
    if(document.querySelector('.df-ort-kopf')) return;
    var rechts = document.querySelector('.dfnav-uright') || document.querySelector('.util .right');
    if(!rechts) return;
    var a=document.createElement('a');
    a.className='df-ort-kopf'; a.href=ZIEL; a.target='_blank'; a.rel='noopener';
    a.title='Route zum Hofverkauf berechnen (Google Maps)';
    /* als Einheit halten, sonst rutscht das Symbol ueber das Wort */
    a.style.cssText='display:inline-flex;align-items:center;white-space:nowrap';
    a.innerHTML=PIN+'Route';
    rechts.insertBefore(a, rechts.firstChild);
  }

  function inMenue(){
    if(document.querySelector('.df-ort-menue')) return;
    var d = document.querySelector('#dfnav-drawer .dfnav-panel') || document.querySelector('#dfnav-drawer');
    if(!d) return;
    var a=document.createElement('a');
    a.className='df-ort-menue'; a.href=ZIEL; a.target='_blank'; a.rel='noopener';
    a.title='Route zum Hofverkauf berechnen (Google Maps)';
    a.innerHTML=PIN+'Route zum Hofverkauf';
    /* gleiche Metrik wie die uebrigen Menuepunkte (padding 13px 0, Anzeigeschrift,
       1.05rem), sonst steht der Eintrag eingerueckt und kleiner daneben. Nur die
       Farbe weicht ab, damit er als Handlung erkennbar bleibt. */
    a.style.cssText='display:flex;align-items:center;padding:13px 0;'
      +'font-family:var(--dfn-disp,inherit);font-weight:700;font-size:1.05rem;'
      +'color:var(--dfn-acc-text,#225eaa);text-decoration:none;'
      +'border-bottom:1px solid var(--dfn-border,rgba(34,94,170,.14))';
    /* hinter die Kopfzeile mit Logo und Schliessen-Knopf, nicht davor: als erstes Kind
       hing der Verweis ueber dem Menuekopf und sah wie ein Fremdkoerper aus. */
    var kopf = d.querySelector('.dfnav-dhead');
    if(kopf && kopf.parentNode===d) d.insertBefore(a, kopf.nextSibling);
    else d.insertBefore(a, d.firstChild);
  }

  function los(){ inKopfleiste(); inMenue(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',los);
  else los();
  setTimeout(los, 500);
})();
