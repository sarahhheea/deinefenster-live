#!/usr/bin/env python3
"""
update_nav.py — Ersetzt den Nav-Block auf allen DeineFenster-Seiten
mit dem kanonischen Mega-Menu aus index.html.

Läuft von /Users/buissnesaccount/deinefenster Website/
"""

import re
import os

BASE = "/Users/buissnesaccount/deinefenster Website"

# ─────────────────────────────────────────────
# 1. Kanonischer Nav-Block (Root-Level, alle Pfade relativ)
# ─────────────────────────────────────────────

NAV_ROOT = """\
<!-- Navigation Mega-Menu -->
<style>
  .nav-item { position: relative; }
  .mega-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(8px);
               width: 760px; max-width: 95vw; background: #0f1c30;
               border-radius: 14px; box-shadow: 0 18px 48px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
               padding: 0; opacity: 0; visibility: hidden; pointer-events: none;
               transition: opacity .2s ease, transform .2s ease, visibility .2s; z-index: 100; margin-top: 10px;
               overflow: hidden;
               transition-delay: 0s; }
  .mega-menu::before { content:''; position: absolute; top: -10px; left: 0; right: 0; height: 10px; }
  .nav-item:hover .mega-menu, .mega-menu:hover, .nav-item:focus-within .mega-menu,
  .nav-item.mega-pinned .mega-menu {
    opacity: 1; visibility: visible; pointer-events: auto; transform: translateX(-50%) translateY(0);
    transition-delay: 0.3s;
  }
  .mega-grid { display: grid; grid-template-columns: 240px 1fr; min-height: 320px; }
  .mega-cats { background: #0a1225; padding: 18px 0; }
  .mega-cat { display: flex; align-items: center; gap: 12px; padding: 14px 22px;
              font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px;
              color: rgba(232,238,255,0.65); cursor: pointer; transition: all .18s;
              border-left: 3px solid transparent; user-select: none; }
  .mega-cat .material-symbols-outlined { font-size: 20px; color: #76a9fa; transition: color .18s; }
  .mega-cat:hover, .mega-cat.active {
    background: #0f1c30; color: #76a9fa; border-left-color: #76a9fa;
  }
  .mega-cat.active .material-symbols-outlined, .mega-cat:hover .material-symbols-outlined { color: #76a9fa; }
  .mega-cat .mega-cat-arrow { margin-left: auto; color: rgba(255,255,255,0.25); font-size: 18px; transition: transform .18s; }
  .mega-cat.active .mega-cat-arrow, .mega-cat:hover .mega-cat-arrow { color: #76a9fa; transform: translateX(2px); }
  .mega-panels { padding: 26px 32px; position: relative; }
  .mega-panel { display: none; }
  .mega-panel.active { display: block; animation: megaFade .2s ease; }
  @keyframes megaFade { from { opacity:0; transform: translateX(4px); } to { opacity:1; transform: translateX(0); } }
  .mega-panel-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 12px;
                      color: #76a9fa; text-transform: uppercase; letter-spacing: 0.08em;
                      margin-bottom: 16px; }
  .mega-system { display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px;
                 border-radius: 8px; transition: background .15s; margin-bottom: 2px; }
  .mega-system:hover { background: rgba(118,169,250,0.08); }
  .mega-system-label { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; color: #e8eeff; }
  .mega-system-desc { font-size: 12px; color: rgba(232,238,255,0.55); margin-top: 1px; }
  .mega-system-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(118,169,250,0.15);
                      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mega-system-icon .material-symbols-outlined { font-size: 20px; color: #225eaa; }
  .mega-panel-cta { display: flex; align-items: center; justify-content: space-between;
                    margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); gap: 12px; }
  .mega-panel-cta .all-link { font-size: 12px; font-weight: 700; color: rgba(232,238,255,0.65); }
  .mega-panel-cta .all-link:hover { color: #76a9fa; }
  .nav-chev { font-size: 16px !important; transition: transform .2s; }
  .nav-item:hover .nav-chev { transform: rotate(180deg); }
  @media (max-width: 767px) { .mega-menu { display: none; } }
  .nav-link { position: relative; }
  .nav-link::after { content:''; position:absolute; bottom:-5px; left:0; width:0; height:2px; background:#76a9fa; border-radius:1px; transition:width 0.22s ease; }
  .nav-link:hover::after { width:100%; }
  a.hover-tag { cursor:pointer; }
</style>

<div id="topbar">
  <div class="topbar-inner">
    <nav class="topbar-links">
      <a href="{p}ueber-drutex.html" class="topbar-link">Hersteller</a>
      <span class="topbar-dot">·</span>
      <a href="{p}faq.html" class="topbar-link">FAQ</a>
      <span class="topbar-dot">·</span>
      <a href="{p}ratgeber/" class="topbar-link">Ratgeber</a>
      <span class="topbar-dot">·</span>
      <a href="{p}ueber-uns.html" class="topbar-link">Über uns</a>
      <span class="topbar-dot">·</span>
      <a href="{p}kontakt.html" class="topbar-link">Kontakt</a>
    </nav>
    <div class="topbar-contacts">
      <a href="tel:+4933812148373" class="topbar-phone">
        <span class="material-symbols-outlined" style="font-size:12px;font-variation-settings:'FILL' 1">call</span>
        03381 / 2148373
      </a>
      <span class="topbar-dot">·</span>
      <a href="mailto:info@baustoffchrist.de" class="topbar-phone">
        <span class="material-symbols-outlined" style="font-size:12px;font-variation-settings:'FILL' 1">mail</span>
        info@baustoffchrist.de
      </a>
    </div>
  </div>
</div>
<nav id="navbar" class="fixed top-0 w-full z-50 bg-white/10 glass-nav border-b border-white/10">
  <div class="flex justify-between items-center px-6 md:px-12 py-2.5 max-w-[1440px] mx-auto">
    <a href="{p}index.html" class="text-xl md:text-2xl font-bold tracking-tighter text-white">DeineFenster<span style="color:#76a9fa">.de</span></a>
    <div class="hidden md:flex items-center gap-x-5">
      <!-- Produkte mit Mega-Menu -->
      <div class="nav-item">
        <a href="{p}produkte.html" class="nav-link inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">
          Produkte <span class="material-symbols-outlined nav-chev">expand_more</span>
        </a>
        <div class="mega-menu" id="mega-produkte">
          <div class="mega-grid">
            <!-- Links: Kategorien -->
            <div class="mega-cats">
              <div class="mega-cat active" data-mega="fenster">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">window</span>
                <span>Fenster</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
              <div class="mega-cat" data-mega="balkon">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">deck</span>
                <span>Balkontüren</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
              <div class="mega-cat" data-mega="haustuer">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">door_front</span>
                <span>Haustüren</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
              <div class="mega-cat" data-mega="schiebe">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">meeting_room</span>
                <span>Schiebetüren</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
              <div class="mega-cat" data-mega="rollladen">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">roller_shades</span>
                <span>Rollläden</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
              <div class="mega-cat" data-mega="baumaterial">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">layers</span>
                <span>Baumaterial</span>
                <span class="material-symbols-outlined mega-cat-arrow">chevron_right</span>
              </div>
            </div>

            <!-- Rechts: Panels pro Kategorie -->
            <div class="mega-panels">
              <!-- FENSTER -->
              <div class="mega-panel active" data-mega-panel="fenster">
                <div class="mega-panel-title">PVC-Kunststofffenster</div>
                <a href="{p}produkte/kunststofffenster/iglo-5-classic.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">window</span></div>
                  <div>
                    <div class="mega-system-label">IGLO 5 Classic</div>
                    <div class="mega-system-desc">5-Kammer · 70 mm · Uw 0,83 · Bewährter Allrounder</div>
                  </div>
                </a>
                <a href="{p}produkte/kunststofffenster/iglo-energy.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">bolt</span></div>
                  <div>
                    <div class="mega-system-label">IGLO Energy</div>
                    <div class="mega-system-desc">7-Kammer · 82 mm · Uw 0,71 · Premium-Wärmedämmung</div>
                  </div>
                </a>
                <a href="{p}produkte/kunststofffenster/iglo-edge.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">diamond</span></div>
                  <div>
                    <div class="mega-system-label">IGLO EDGE</div>
                    <div class="mega-system-desc">Flaggschiff · 7-Kammer · 82 mm · Uw 0,66 · technologisch fortschrittlichst</div>
                  </div>
                </a>
                <a href="{p}produkte/kunststofffenster/iglo-light.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">wb_sunny</span></div>
                  <div>
                    <div class="mega-system-label">IGLO Light</div>
                    <div class="mega-system-desc">Schlanke Profile · 5-Kammer · 70 mm · Uw 0,88 · mehr Lichteinfall</div>
                  </div>
                </a>
                <a href="{p}produkte/kunststofffenster/iglo-ext.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">open_in_new</span></div>
                  <div>
                    <div class="mega-system-label">IGLO EXT</div>
                    <div class="mega-system-desc">Nach außen öffnend · 5-Kammer · 70 mm · Uw 0,89 · Skandi-/UK-Stil</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}konfigurator.html?prod=kunststoff" class="all-link">Fenster konfigurieren →</a>
                  <a href="{p}konfigurator.html" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">tune</span> Angebot anfragen
                  </a>
                </div>
              </div>

              <!-- BALKONTÜREN -->
              <div class="mega-panel" data-mega-panel="balkon">
                <div class="mega-panel-title">Balkontüren</div>
                <a href="{p}produkte/balkontueren/iglo-5-classic.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">deck</span></div>
                  <div>
                    <div class="mega-system-label">IGLO 5 Classic Balkontür</div>
                    <div class="mega-system-desc">Ein- oder zweiflügelig · Alu-Schwelle · 70 mm Profil</div>
                  </div>
                </a>
                <a href="{p}produkte/balkontueren/iglo-energy.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">bolt</span></div>
                  <div>
                    <div class="mega-system-label">IGLO Energy Balkontür</div>
                    <div class="mega-system-desc">Premium · 82 mm · maximale Wärmedämmung</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}konfigurator.html?prod=balkontuer" class="all-link">Balkontür konfigurieren →</a>
                  <a href="{p}konfigurator.html" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">tune</span> Angebot anfragen
                  </a>
                </div>
              </div>

              <!-- HAUSTÜREN -->
              <div class="mega-panel" data-mega-panel="haustuer">
                <div class="mega-panel-title">Haustüren</div>
                <a href="{p}produkte/haustueren/iglo-5-classic.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">door_front</span></div>
                  <div>
                    <div class="mega-system-label">IGLO 5 Classic Tür</div>
                    <div class="mega-system-desc">5-Kammer Türprofil · Ud 1,0 · über 50 Design-Modelle</div>
                  </div>
                </a>
                <a href="{p}produkte/haustueren/iglo-energy.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">bolt</span></div>
                  <div>
                    <div class="mega-system-label">IGLO Energy Tür</div>
                    <div class="mega-system-desc">Premium 7-Kammer · Ud 0,8 · höchste Effizienz</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}konfigurator.html?prod=haustuere" class="all-link">Haustür konfigurieren →</a>
                  <a href="{p}konfigurator.html" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">tune</span> Angebot anfragen
                  </a>
                </div>
              </div>

              <!-- SCHIEBETÜREN -->
              <div class="mega-panel" data-mega-panel="schiebe">
                <div class="mega-panel-title">Schiebetüren (HST)</div>
                <a href="{p}produkte/hebe-schiebetueren/iglo-energy-psk.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">meeting_room</span></div>
                  <div>
                    <div class="mega-system-label">PSK Schiebetür</div>
                    <div class="mega-system-desc">Parallel-Schiebe-Kipp · bis 2400 mm breit · kompakt</div>
                  </div>
                </a>
                <a href="{p}produkte/hebe-schiebetueren/iglo-slide.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">swap_horiz</span></div>
                  <div>
                    <div class="mega-system-label">IGLO Slide</div>
                    <div class="mega-system-desc">Mittlere Schiebetür · bis 4000 mm · komfortabel</div>
                  </div>
                </a>
                <a href="{p}produkte/hebe-schiebetueren/iglo-5-classic-psk.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">door_sliding</span></div>
                  <div>
                    <div class="mega-system-label">IGLO-HS</div>
                    <div class="mega-system-desc">Große Hebe-Schiebe-Tür · bis 6500 mm · Null-Schwelle DIN 18040</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}konfigurator.html?prod=hst" class="all-link">Schiebetür konfigurieren →</a>
                  <a href="{p}konfigurator.html" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">tune</span> Angebot anfragen
                  </a>
                </div>
              </div>

              <!-- ROLLLÄDEN -->
              <div class="mega-panel" data-mega-panel="rollladen">
                <div class="mega-panel-title">Rollläden</div>
                <a href="{p}produkte/rollladen/aufsatz-rollladen.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">roller_shades</span></div>
                  <div>
                    <div class="mega-system-label">PVC-Aufsatzrollladen</div>
                    <div class="mega-system-desc">Elektrisch mit Funk-Motor · 5 Farben · Smart-Home-ready · Wärme- + Hitzeschutz</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}konfigurator.html?prod=rollladen" class="all-link">Rollladen konfigurieren →</a>
                  <a href="{p}konfigurator.html" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">tune</span> Angebot anfragen
                  </a>
                </div>
              </div>

              <!-- BAUMATERIAL -->
              <div class="mega-panel" data-mega-panel="baumaterial">
                <div class="mega-panel-title">Baumaterial &amp; Sonstiges</div>
                <a href="{p}daemmung-kaufen.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">grid_view</span></div>
                  <div>
                    <div class="mega-system-label">Dämmung – ISO-Verbund (neu)</div>
                    <div class="mega-system-desc">Plattenformat 4450 × 1400 mm · 6,24 m²/Platte · Lagerware Brandenburg</div>
                  </div>
                </a>
                <a href="{p}garagentor-gebraucht-kaufen.html" class="mega-system">
                  <div class="mega-system-icon"><span class="material-symbols-outlined">garage</span></div>
                  <div>
                    <div class="mega-system-label">Garagentore (gebraucht)</div>
                    <div class="mega-system-desc">Wechselnder Bestand · Sektional · Schwing · Rolltor · Anfrage WhatsApp/Mail</div>
                  </div>
                </a>
                <div class="mega-panel-cta">
                  <a href="{p}shop.html?cat=daemmung,garagentor-gebraucht" class="all-link">Alle Baumaterial-Angebote im Shop →</a>
                  <a href="https://wa.me/491717263776" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary-d transition-colors">
                    <span class="material-symbols-outlined" style="font-size:14px">chat</span> WhatsApp Anfrage
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="{p}ueber-drutex.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Hersteller</a>
      <a href="{p}kunststofffenster-kaufen.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Neue Fenster</a>
      <a href="{p}gebrauchte-fenster-kaufen.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Gebraucht</a>
      <a href="{p}fenster-austauschen-kosten.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Ankauf</a>
      <a href="{p}konfigurator.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Konfigurator</a>
      <a href="{p}shop.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight inline-flex items-center gap-1.5">
        Shop
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none" style="background:#76a9fa;color:#001b3d">NEU</span>
      </a>
      <a href="{p}faq.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">FAQ</a>
      <a href="{p}glossar.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Glossar</a>
      <a href="{p}ueber-uns.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Über uns</a>
      <a href="{p}kontakt.html" class="nav-link text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight">Kontakt</a>
    </div>
    <div class="flex items-center gap-3 md:gap-6">
      <a href="{p}konfigurator.html" class="hidden md:block px-5 py-1.5 rounded-full font-semibold text-xs tracking-wide transition-all duration-200" style="background:#225eaa;color:#fff;letter-spacing:0.02em;">Angebot anfragen</a>
      <button id="menuBtn" class="md:hidden text-white p-1" aria-label="Menü öffnen">
        <span class="material-symbols-outlined text-3xl" id="menuIcon">menu</span>
      </button>
    </div>
  </div>
  <!-- Mobile Menu -->
  <div id="mobileMenu" class="hidden md:hidden px-6 py-6 border-t border-white/10">
    <div class="flex flex-col gap-2">
      <details class="text-white">
        <summary class="flex items-center justify-between py-3 border-b border-white/10 font-semibold text-lg cursor-pointer list-none">
          Produkte <span class="material-symbols-outlined">expand_more</span>
        </summary>
        <div class="pl-4 py-2 space-y-2 text-base text-white/80">
          <a href="{p}produkte/kunststofffenster/iglo-energy.html" class="block py-1">Kunststofffenster</a>
          <a href="{p}produkte/balkontueren/iglo-energy.html" class="block py-1">Balkontüren</a>
          <a href="{p}produkte/haustueren/iglo-energy.html" class="block py-1">Haustüren</a>
          <a href="{p}produkte/hebe-schiebetueren/iglo-energy-psk.html" class="block py-1">Schiebetüren</a>
          <a href="{p}daemmung-kaufen.html" class="block py-1">Dämmung (neu)</a>
          <a href="{p}garagentor-gebraucht-kaufen.html" class="block py-1">Garagentore (gebraucht)</a>
          <a href="{p}produkte.html" class="block py-1 font-semibold text-white">Alle Produkte →</a>
        </div>
      </details>
      <a href="{p}ueber-drutex.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Hersteller</a>
      <a href="{p}kunststofffenster-kaufen.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Neue Fenster</a>
      <a href="{p}gebrauchte-fenster-kaufen.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Gebraucht</a>
      <a href="{p}fenster-austauschen-kosten.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Ankauf</a>
      <a href="{p}konfigurator.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Konfigurator</a>
      <a href="{p}shop.html" class="text-white font-semibold text-lg py-2 border-b border-white/10 flex items-center gap-2">Shop <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style="background:#76a9fa;color:#001b3d">NEU</span></a>
      <a href="{p}faq.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">FAQ</a>
      <a href="{p}glossar.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Glossar</a>
      <a href="{p}ueber-uns.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Über uns</a>
      <a href="{p}kontakt.html" class="text-white font-semibold text-lg py-2 border-b border-white/10">Kontakt</a>
      <a href="{p}konfigurator.html" class="mt-2 px-6 py-4 rounded-full font-bold text-center text-sm" style="background:#225eaa;color:#fff;">Angebot anfordern</a>
    </div>
  </div>
</nav>"""


def make_nav(prefix):
    """Return nav block with {p} replaced by prefix."""
    return NAV_ROOT.replace("{p}", prefix)


def find_nav_block(content):
    """
    Find the nav block: from any inline <style> block before <div id="topbar">
    (or directly from <div id="topbar">) to the closing </nav> of id="navbar".

    Handles both:
    - Full nav with id="mobileMenu" inside navbar
    - Slim nav without mobileMenu (ratgeber, shop, bestelluebersicht)

    Returns (start, end) indices or (None, None).
    """
    topbar_match = re.search(r'<div id="topbar">', content)
    if not topbar_match:
        return None, None

    topbar_start = topbar_match.start()

    # Look back from topbar for a <style> block containing nav-related rules
    before = content[:topbar_start]
    # Match a <style> block (with optional nav comment) that contains nav CSS
    style_matches = list(re.finditer(
        r'(?:<!--[^>]*[Nn]av[^>]*-->\s*)?<style>[^<]*(?:\.nav-link|\.mega-menu|Nav Underline|nav-link).*?</style>\s*$',
        before, re.DOTALL | re.MULTILINE
    ))
    if style_matches:
        nav_start = style_matches[-1].start()
    else:
        nav_start = topbar_start

    # Find navbar opening tag
    navbar_match = re.search(r'<nav id="navbar"', content[topbar_start:])
    if not navbar_match:
        return None, None

    navbar_abs = topbar_start + navbar_match.start()

    # Try to find mobileMenu first (full nav)
    mobile_menu = re.search(r'id="mobileMenu"', content[navbar_abs:])
    if mobile_menu:
        mobile_abs = navbar_abs + mobile_menu.end()
        closing_nav = re.search(r'</nav>', content[mobile_abs:])
        if closing_nav:
            nav_end = mobile_abs + closing_nav.end()
            return nav_start, nav_end

    # Fallback: slim nav — find the FIRST </nav> after navbar opening tag
    closing_nav = re.search(r'</nav>', content[navbar_abs + len('<nav id="navbar"'):])
    if not closing_nav:
        return None, None

    nav_end = navbar_abs + len('<nav id="navbar"') + closing_nav.end()
    return nav_start, nav_end


def remove_redundant_nav_styles(content):
    """Remove standalone <style> blocks that ONLY contain nav-link underline styles."""
    # Pattern: <style> blocks containing only nav-link / hover-tag rules
    pattern = re.compile(
        r'\s*<style>\s*'
        r'(?:/\*[^*]*\*+(?:[^/*][^*]*\*+)*/\s*)?'  # optional comment
        r'(?:\.nav-link\s*\{[^}]*\}\s*'
        r'(?:\.nav-link::after\s*\{[^}]*\}\s*)?'
        r'(?:\.nav-link:hover::after\s*\{[^}]*\}\s*)?'
        r'(?:a\.hover-tag\s*\{[^}]*\}\s*)?'
        r')\s*</style>',
        re.DOTALL
    )
    return pattern.sub('', content)


def process_file(filepath, prefix):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix any pre-existing </nav></nav> double tags before processing
    content = content.replace('</nav></nav>', '</nav>')

    start, end = find_nav_block(content)
    if start is None:
        print(f"  SKIP (no nav found): {filepath}")
        return False

    new_nav = make_nav(prefix)
    new_content = content[:start] + new_nav + content[end:]

    # Safety: fix any double </nav> introduced by concatenation
    new_content = new_content.replace('</nav></nav>', '</nav>')

    # Remove any leftover standalone nav-link style blocks outside the mega-menu nav
    # Find the end of our new navbar block
    nav_block_end = new_content.find('</nav>', new_content.find('<div id="mobileMenu">') if '<div id="mobileMenu">' in new_content else new_content.find('<div id="topbar">'))
    if nav_block_end > 0:
        after_nav = new_content[nav_block_end + len('</nav>'):]
        after_nav_cleaned = remove_redundant_nav_styles(after_nav)
        before_nav = new_content[:nav_block_end + len('</nav>')]
        new_content = before_nav + after_nav_cleaned

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  OK: {os.path.relpath(filepath, BASE)}")
    return True


# ─────────────────────────────────────────────
# 2. File lists
# ─────────────────────────────────────────────

ROOT_PAGES = [
    "index.html",
    "gebrauchte-fenster-kaufen.html",
    "kunststofffenster-kaufen.html",
    "shop.html",
    "faq.html",
    "glossar.html",
    "kontakt.html",
    "ueber-uns.html",
    "ueber-drutex.html",
    "kfw-foerderung.html",
    "produkte.html",
    "agb.html",
    "fenster-austauschen-kosten.html",
    "bestelluebersicht.html",
    "daemmung-kaufen.html",
    "garagentor-gebraucht-kaufen.html",
    "konfigurator.html",
    "impressum.html",
    "datenschutz.html",
    "danke.html",
]

SUBPAGES_2DEEP = []  # produkte/** — need ../../ prefix
for root, dirs, files in os.walk(os.path.join(BASE, "produkte")):
    for fn in files:
        if fn.endswith(".html"):
            SUBPAGES_2DEEP.append(os.path.join(root, fn))

RATGEBER_PAGES = []  # ratgeber/ — need ../ prefix
for root, dirs, files in os.walk(os.path.join(BASE, "ratgeber")):
    for fn in files:
        if fn.endswith(".html"):
            RATGEBER_PAGES.append(os.path.join(root, fn))

# ─────────────────────────────────────────────
# 3. Run
# ─────────────────────────────────────────────

print("=== Root-Level Seiten ===")
for fn in ROOT_PAGES:
    fp = os.path.join(BASE, fn)
    if os.path.exists(fp):
        process_file(fp, "")
    else:
        print(f"  MISSING: {fn}")

print("\n=== Unterseiten produkte/** (../../ prefix) ===")
for fp in sorted(SUBPAGES_2DEEP):
    process_file(fp, "../../")

print("\n=== Ratgeber-Seiten (../ prefix) ===")
for fp in sorted(RATGEBER_PAGES):
    process_file(fp, "../")

print("\nFertig.")
