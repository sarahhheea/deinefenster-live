/**
 * konfigurator-svg.js — Parametrische SVG-Vorschau
 * Ersetzt Bilder + 3D-Iframe in konfigurator.html
 * Alle Koordinaten in mm, SVG viewBox in mm.
 */
(function () {
  'use strict';

  // ─── Profil-Konstanten (mm) ───────────────────────────────
  const OFR = 68;   // Außenrahmen pro Seite
  const SFR = 52;   // Flügelrahmen pro Seite
  const DCT = 6;    // Dichtung-Linienstärke
  const ROLLO_H = 180; // Rolladenkasten-Höhe (Fenster/Balkon)
  const ROLLO_H_HST = 225; // Rolladenkasten Schiebetür

  // ─── Haustür Glaspanel-Definitionen (aus haustuer-3d.html, ×1000 = mm) ──
  const HD_PANELS = {
    'colorado-inox':         { panels: [{x:285,y:430,w:220,h:1340}] },
    'montana-1-inox':        { panels: [{x:400,y:320,w:185,h:1460}] },
    'montana-2-lr-inox':     { panels: [{x:405,y:399,w:190,h:1273}],
                               strips: [{x:256,y:359,w:41,h:1616},{x:704,y:96,w:40,h:1616}] },
    'montana-3-lr-inox':     { panels: [{x:275,y:235,w:175,h:1565},{x:610,y:1590,w:125,h:120},
                                        {x:610,y:1330,w:125,h:120},{x:610,y:1070,w:125,h:120},
                                        {x:610,y:810,w:125,h:120},{x:610,y:550,w:125,h:120}] },
    'florida-lr-inox':       { panels: [{x:390,y:165,w:200,h:1750}] },
    'ohio-inox':             { panels: [{x:385,y:1590,w:230,h:198},{x:385,y:1245,w:230,h:198},
                                        {x:385,y:900,w:230,h:198}],
                               strips: [{x:270,y:880,w:50,h:1130},{x:680,y:880,w:50,h:1130}] },
    'alaska-1-inox':         { panels: [{x:390,y:1640,w:220,h:210},{x:390,y:1270,w:220,h:210},
                                        {x:390,y:900,w:220,h:210}] },
    'alaska-2-inox':         { panels: [{x:390,y:1750,w:220,h:195},{x:390,y:1480,w:220,h:195},
                                        {x:390,y:1210,w:220,h:195},{x:390,y:940,w:220,h:195},
                                        {x:390,y:670,w:220,h:195}] },
    'nebraska-lcr-inox':     { panels: [{x:360,y:1720,w:220,h:195},{x:360,y:1490,w:220,h:195},
                                        {x:360,y:1260,w:220,h:195},{x:360,y:1030,w:220,h:195},
                                        {x:360,y:800,w:220,h:195}],
                               strips: [{x:150,y:780,w:75,h:1160}] },
    'pennsylvania-1-inox':   { panels: [{x:230,y:1635,w:540,h:185},{x:230,y:360,w:215,h:1235},
                                        {x:555,y:360,w:215,h:1235}] },
    'pennsylvania-2-lr-inox':{ panels: [{x:375,y:1580,w:175,h:170},{x:400,y:1355,w:175,h:170},
                                        {x:370,y:1130,w:175,h:170},{x:400,y:905,w:175,h:170},
                                        {x:370,y:680,w:175,h:170}] },
    'pennsylvania-3-lr-inox':{ panels: [{x:230,y:200,w:385,h:1710}] },
    'texas-c-inox':          { panels: [{x:413,y:235,w:175,h:1580}] },
    'texas-lr-inox':         { panels: [{x:413,y:235,w:175,h:1580}] },
  };

  // ─── Hilfsfunktionen ──────────────────────────────────────

  function colorOf(key, table) {
    return (window.P && window.P[table] && window.P[table][key]) ? window.P[table][key].hex : null;
  }

  function glassStyle(dekor) {
    switch (dekor) {
      case 'satinato':     return { fill:'#dde4ec', op:0.94, pat:false };
      case 'chinchilla':   return { fill:'#c8d4dc', op:0.90, pat:'chin' };
      case 'master-carre': return { fill:'#c8d4dc', op:0.90, pat:'mcarre' };
      default:             return { fill:'#b8cfe0', op:0.68, pat:false }; // klar
    }
  }

  function patternDefs(dekor) {
    if (dekor === 'chinchilla') {
      return `<pattern id="pat-chin" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#c8d4dc"/>
        <circle cx="4" cy="4" r="2.5" fill="#b0c0cc" opacity="0.55"/>
        <circle cx="12" cy="4" r="1.8" fill="#b0c0cc" opacity="0.40"/>
        <circle cx="8" cy="12" r="2.2" fill="#b0c0cc" opacity="0.50"/>
        <circle cx="2" cy="12" r="1.5" fill="#b0c0cc" opacity="0.35"/>
        <circle cx="14" cy="11" r="1.8" fill="#b0c0cc" opacity="0.40"/>
      </pattern>`;
    }
    if (dekor === 'master-carre') {
      return `<pattern id="pat-mcarre" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#c8d4dc"/>
        <rect x="0" y="0" width="12" height="12" fill="#b8c8d4" opacity="0.5"/>
        <rect x="12" y="12" width="12" height="12" fill="#b8c8d4" opacity="0.5"/>
        <line x1="0" y1="12" x2="24" y2="12" stroke="#a8b8c4" stroke-width="1.5"/>
        <line x1="12" y1="0" x2="12" y2="24" stroke="#a8b8c4" stroke-width="1.5"/>
      </pattern>`;
    }
    return '';
  }

  function glassFill(dekor) {
    const g = glassStyle(dekor);
    if (g.pat === 'chin')   return `url(#pat-chin)`;
    if (g.pat === 'mcarre') return `url(#pat-mcarre)`;
    return g.fill;
  }

  function glassOpacity(dekor) { return glassStyle(dekor).op; }

  // Glas-Rect mit Schimmer
  function glassRect(x, y, w, h, dekor) {
    const gf = glassFill(dekor);
    const go = glassOpacity(dekor);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${gf}" opacity="${go}"/>
    <rect x="${x}" y="${y}" width="${w*0.38}" height="${h}" fill="white" opacity="0.06"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h*0.18}" fill="white" opacity="0.06"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,0.13)" stroke-width="2.5"/>`;
  }

  // Sprossen-Gitter
  function sprosse(x, y, w, h, typ, dicke) {
    if (!typ || typ === 'keine') return '';
    const inn = (typ === 'szr');
    const d = parseInt(dicke) || 18;
    const sw = inn ? 3.5 : (d >= 45 ? 11 : d >= 26 ? 7.5 : 5);
    const col = inn ? 'rgba(148,192,220,0.72)' : '#e6e2d8';
    const flt = inn ? '' : `filter="url(#spr-sh)"`;
    const cx = x + w / 2, cy = y + h / 2;
    return `<line x1="${cx}" y1="${y + sw}" x2="${cx}" y2="${y+h-sw}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${flt}/>
    <line x1="${x+sw}" y1="${cy}" x2="${x+w-sw}" y2="${cy}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${flt}/>`;
  }

  // Öffnungsart-Symbol (Dreieck/Pfeil im Glas)
  function oeffSymbol(x, y, w, h, oeff) {
    if (!oeff || oeff === 'fest' || oeff === 'hst-slide') return '';
    const cx = x + w / 2, cy = y + h / 2;
    const col = 'rgba(30,80,160,0.42)';
    const sw = 5;
    let s = '';
    const isL = oeff === 'dreh-l' || oeff === 'dk-l';
    const isR = oeff === 'dreh-r' || oeff === 'dk-r';
    const isK = oeff === 'kipp' || oeff === 'dk-l' || oeff === 'dk-r';

    if (isL) {
      // Schwenkachse rechts → diagonal nach links oben
      s += `<line x1="${x+w-22}" y1="${y+20}" x2="${x+w-22}" y2="${y+h-20}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="0.6"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${x+w-22}" y2="${y+20}" stroke="${col}" stroke-width="${sw-1}" stroke-linecap="round" opacity="0.5"/>`;
      s += `<polyline points="${x+w-42},${y+36} ${x+w-22},${y+20} ${x+w-6},${y+36}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }
    if (isR) {
      // Schwenkachse links → diagonal nach rechts oben
      s += `<line x1="${x+22}" y1="${y+20}" x2="${x+22}" y2="${y+h-20}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="0.6"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${x+22}" y2="${y+20}" stroke="${col}" stroke-width="${sw-1}" stroke-linecap="round" opacity="0.5"/>`;
      s += `<polyline points="${x+6},${y+36} ${x+22},${y+20} ${x+42},${y+36}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }
    if (isK) {
      // Kipp: V-Pfeil unten
      s += `<polyline points="${cx-24},${y+h-36} ${cx},${y+h-20} ${cx+24},${y+h-36}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" opacity="0.65"/>`;
    }
    return s;
  }

  // Fenstergriff (Innen)
  function fensterGriff(x, y, w, h, oeff, griffKey) {
    // Achse: dreh-l → Schwenkachse rechts → Griff LINKS; dreh-r → Griff RECHTS
    const isLinks = (oeff === 'dreh-l' || oeff === 'dk-l');
    const gx = isLinks ? x + 38 : x + w - 38;
    const gy = y + h * 0.52;
    const gc = (window.P && window.P.griff && window.P.griff[griffKey]) ? window.P.griff[griffKey].col || '#c8cad4' : '#c8cad4';
    return `<rect x="${gx-9}" y="${gy-28}" width="18" height="56" rx="9" fill="${gc}" stroke="#707888" stroke-width="2" opacity="0.92"/>
    <rect x="${gx-14}" y="${gy-6}" width="28" height="12" rx="6" fill="${gc}" stroke="#707888" stroke-width="2" opacity="0.92"/>`;
  }

  // Rolladenkasten
  function rolladenKasten(x, y, w, h, rollSeite, rollTyp) {
    const stripes = 6;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8e97a4" rx="3"/>`;
    for (let i = 1; i < stripes; i++)
      s += `<line x1="${x}" y1="${y+i*h/stripes}" x2="${x+w}" y2="${y+i*h/stripes}" stroke="#707a88" stroke-width="2" opacity="0.55"/>`;
    if (rollTyp === 'gurt') {
      const gx = rollSeite === 'links' ? x + 40 : x + w - 70;
      s += `<rect x="${gx}" y="${y+h*0.18}" width="30" height="${h*0.64}" rx="5" fill="#636d7c"/>
      <circle cx="${gx+15}" cy="${y+h*0.5}" r="9" fill="#525c6a" stroke="#404858" stroke-width="1.5"/>`;
    }
    s += `<text x="${x+w/2}" y="${y+h*0.66}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="${Math.min(h*0.38,36)}" fill="rgba(255,255,255,0.6)" font-weight="600">Rollladen</text>`;
    return s;
  }

  // Maß-Label Badge
  function massLabel(cx, y, bMm, hMm, dark) {
    const col = dark ? 'rgba(255,255,255,0.38)' : '#225eaa';
    const size = Math.min(bMm * 0.044, 42);
    return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="${size}" fill="${col}" font-weight="700" opacity="0.85">${bMm} × ${hMm} mm</text>`;
  }

  // ─── SVG defs (immer am Anfang) ───────────────────────────
  function svgDefs(dekor) {
    return `<defs>
      ${patternDefs(dekor)}
      <filter id="spr-sh" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0.8" stdDeviation="1.8" flood-color="rgba(0,0,0,0.38)"/>
      </filter>
      <filter id="sash-sh" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.18)"/>
      </filter>
    </defs>`;
  }

  // ─── Ein Flügel (Sash) zeichnen ───────────────────────────
  function drawSash(x, y, w, h, oeff, S, view, fCol) {
    if (w <= 0 || h <= 0) return '';
    const gx = x + SFR, gy = y + SFR;
    const gw = w - 2 * SFR, gh = h - 2 * SFR;
    const isFixed = (oeff === 'fest' || !oeff);
    const fOpacity = isFixed ? 0.82 : 1.0;
    const dicht = colorOf(S.fd, 'fd') || '#1a1a1a';

    let s = `<g filter="url(#sash-sh)">`;
    // Sash frame
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fCol}" opacity="${fOpacity}" rx="2"/>`;
    // Dichtungslinie
    s += `<rect x="${x+DCT}" y="${y+DCT}" width="${w-DCT*2}" height="${h-DCT*2}" fill="none" stroke="${dicht}" stroke-width="${DCT*0.65}" opacity="0.55" rx="1"/>`;
    s += `</g>`;

    if (gw > 10 && gh > 10) {
      // Glas
      s += glassRect(gx, gy, gw, gh, S.glasdekor);
      // Sprossen
      s += sprosse(gx, gy, gw, gh, S.sproTyp, S.sproDicke);
      // Öffnungsart-Symbol
      if (!isFixed) s += oeffSymbol(gx, gy, gw, gh, oeff);
      // Griff (nur Innen, nur bewegliche Flügel)
      if (view === 'inn' && !isFixed && S.prod !== 'haustuere') {
        s += fensterGriff(gx, gy, gw, gh, oeff, S.griff);
      }
    }
    return s;
  }

  // ─── Fenster + Balkontür SVG ──────────────────────────────
  function drawFenster(S, view) {
    const bMm = S.bMm || 1000;
    const hMm = S.hMm || 1200;
    const fl   = S.fluegel || '1-fluegel';
    const hasRoll = S.roll && S.roll !== 'ohne';
    const rollH = hasRoll ? ROLLO_H : 0;
    const totalH = hMm + rollH;

    const fCol = colorOf(view === 'aus' ? S.fa : S.fi, view === 'aus' ? 'fa' : 'fi') || '#f4f4f0';
    const fBorder = (fCol === '#f4f4f0' || fCol === '#fdf6e3') ? '#c8c8c0' : 'rgba(0,0,0,0.16)';

    // Flügel-Parse
    const hasOL = fl.includes('oberlicht') || fl.includes('ober-unter');
    const hasUL = fl.includes('unterlicht') || fl.includes('ober-unter');
    const nFl   = parseInt(fl.charAt(0)) || 1;
    const OL_H  = hasOL ? Math.round(hMm * 0.20) : 0;
    const UL_H  = hasUL ? Math.round(hMm * 0.17) : 0;
    const MAIN_H = hMm - OL_H - UL_H;

    const wY = rollH; // Fenster startet nach Rolladenkasten

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bMm} ${totalH}" style="width:100%;height:100%;display:block" preserveAspectRatio="xMidYMid meet">`;
    svg += svgDefs(S.glasdekor);

    // Hintergrund (Wand)
    svg += `<rect width="${bMm}" height="${totalH}" fill="#cdd4dd"/>`;

    // Rolladenkasten
    if (hasRoll) svg += rolladenKasten(0, 0, bMm, rollH, S.rollSeite, S.roll);

    // Außenrahmen
    svg += `<rect x="0" y="${wY}" width="${bMm}" height="${hMm}" fill="${fCol}" rx="3"/>`;
    svg += `<rect x="0" y="${wY}" width="${bMm}" height="${hMm}" fill="none" stroke="${fBorder}" stroke-width="3" rx="3"/>`;

    // Oberlicht (fest)
    if (hasOL) {
      const olX = OFR, olY = wY + OFR;
      const olW = bMm - 2*OFR, olH2 = OL_H - OFR;
      svg += glassRect(olX, olY, olW, olH2, S.glasdekor);
      svg += sprosse(olX, olY, olW, olH2, S.sproTyp, S.sproDicke);
      // Trennlinie
      svg += `<line x1="0" y1="${wY+OL_H}" x2="${bMm}" y2="${wY+OL_H}" stroke="${fBorder}" stroke-width="OFR*0.45"/>`;
    }

    // Unterlicht (fest)
    if (hasUL) {
      const ulX = OFR, ulY = wY + hMm - UL_H + 4;
      const ulW = bMm - 2*OFR, ulH2 = UL_H - OFR + 4;
      svg += glassRect(ulX, ulY, ulW, ulH2, S.glasdekor);
      svg += sprosse(ulX, ulY, ulW, ulH2, S.sproTyp, S.sproDicke);
      svg += `<line x1="0" y1="${wY+hMm-UL_H}" x2="${bMm}" y2="${wY+hMm-UL_H}" stroke="${fBorder}" stroke-width="3"/>`;
    }

    // Haupt-Flügel
    const mainY = wY + OFR + OL_H;
    const mainW_total = bMm - 2*OFR;
    const mainH2 = MAIN_H - OFR;
    const sashW = mainW_total / nFl;

    for (let i = 0; i < nFl; i++) {
      const oeff = i === 0 ? (S.oeff1||'dreh-r') : i === 1 ? (S.oeff2||'dreh-l') : (S.oeff3||'fest');
      const sx = OFR + i * sashW;
      svg += drawSash(sx, mainY, sashW, mainH2, oeff, S, view, fCol);
      // Pfosten-Linie zwischen Flügeln
      if (i > 0)
        svg += `<rect x="${sx - 6}" y="${mainY}" width="12" height="${mainH2}" fill="${fCol}" opacity="0.9"/>`;
    }

    // Maß-Label
    svg += massLabel(bMm / 2, totalH - 14, bMm, hMm, false);

    svg += '</svg>';
    return svg;
  }

  // ─── Haustür SVG ──────────────────────────────────────────
  function drawHaustuer(S, view) {
    const bMm = S.bMm || 1000;
    const hMm = S.hMm || 2100;
    const isAussen = view === 'aus';

    // Seitenteil
    const fl = S.fluegel || '1-fluegel';
    const hasST_L = fl === 'seitenteil-l';
    const hasST_R = fl === 'seitenteil-r';
    const has2Fl  = fl === '2-fluegel';
    const ST_W = Math.round(bMm * 0.25);

    const fCol = colorOf(isAussen ? S.fa : S.fi, isAussen ? 'fa' : 'fi') || '#373d3f';
    const isDark = !fCol.startsWith('#f') && !fCol.startsWith('#fd') && !fCol.startsWith('#ed') && !fCol.startsWith('#c5');
    const fBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.16)';
    const wallCol = '#bcc4cc';

    // Türbreite (ohne Seitenteil)
    const doorX = hasST_L ? ST_W : 0;
    const doorW = bMm - doorX - (hasST_R ? ST_W : 0);

    // Referenzabmessungen für Panel-Skalierung
    const REF_W = 1000, REF_H = 2100;
    const scX = doorW / REF_W;
    const scY = hMm / REF_H;

    // DIN: dreh-l = Achse rechts (Standard), dreh-r = Achse links
    const hingeSide = (S.oeff1 === 'dreh-r') ? 'l' : 'r';
    const gripX = (hingeSide === 'r')
      ? doorX + OFR + 90
      : doorX + doorW - OFR - 90;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bMm} ${hMm}" style="width:100%;height:100%;display:block" preserveAspectRatio="xMidYMid meet">`;
    svg += svgDefs(S.glasdekor);

    // Hintergrund
    svg += `<rect width="${bMm}" height="${hMm}" fill="${wallCol}"/>`;

    // Seitenteil links
    if (hasST_L) svg += drawSeitenteil(0, 0, ST_W, hMm, S, fCol, fBorder);
    // Seitenteil rechts
    if (hasST_R) svg += drawSeitenteil(bMm - ST_W, 0, ST_W, hMm, S, fCol, fBorder);

    // Türblatt
    svg += `<rect x="${doorX}" y="0" width="${doorW}" height="${hMm}" fill="${fCol}" rx="3"/>`;
    svg += `<rect x="${doorX}" y="0" width="${doorW}" height="${hMm}" fill="none" stroke="${fBorder}" stroke-width="3" rx="3"/>`;

    // Innerer Rahmen (Zarge-Optik)
    const fi2 = 55;
    svg += `<rect x="${doorX+fi2}" y="${fi2}" width="${doorW-2*fi2}" height="${hMm-fi2*1.3}" fill="${fCol}" stroke="${fBorder}" stroke-width="2.5" rx="2"/>`;

    // Glaspanels + Strips
    const modelDef = HD_PANELS[S.tuerModell || 'florida-lr-inox'] || HD_PANELS['florida-lr-inox'];
    for (const p of modelDef.panels) {
      const px = doorX + p.x * scX;
      const py = p.y * scY;
      const pw = p.w * scX;
      const ph = p.h * scY;
      svg += glassRect(px, py, pw, ph, S.glasdekor);
    }
    if (modelDef.strips) {
      for (const st of modelDef.strips) {
        const sx = doorX + st.x * scX;
        const sy = st.y * scY;
        const sw = st.w * scX;
        const sh = st.h * scY;
        svg += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="#c4ccd4" stroke="#a0a8b0" stroke-width="1.5" rx="2" opacity="0.92"/>`;
        svg += `<rect x="${sx+sw*0.18}" y="${sy}" width="${sw*0.28}" height="${sh}" fill="white" opacity="0.13"/>`;
      }
    }

    // Scharniere
    const hingeX = (hingeSide === 'r') ? doorX + doorW - fi2 + 4 : doorX + fi2 - 22;
    for (let i = 0; i < 3; i++) {
      const hy = hMm * (0.18 + i * 0.32);
      svg += `<rect x="${hingeX}" y="${hy-22}" width="17" height="44" rx="3.5" fill="#a0aab4" stroke="#808890" stroke-width="1.5"/>`;
      svg += `<circle cx="${hingeX+8.5}" cy="${hy}" r="5" fill="#888" stroke="#666" stroke-width="1"/>`;
    }

    // Schloss-Zylinder
    const lockX = (hingeSide === 'r') ? doorX + OFR + 50 : doorX + doorW - OFR - 50;
    svg += `<ellipse cx="${lockX}" cy="${hMm*0.52}" rx="14" ry="20" fill="#8a9098" stroke="#606870" stroke-width="2"/>`;
    svg += `<rect x="${lockX-5}" y="${hMm*0.52-4}" width="10" height="8" rx="1.5" fill="#505860"/>`;

    // Außen: Stoßgriff / Innen: Klinke
    if (isAussen) {
      svg += stossgriff(gripX, hMm * 0.44, hMm * 0.22, S.tuerGriffAussen);
    } else {
      svg += klinke(gripX, hMm * 0.52, S.tuerGriffInnen, fCol, isDark);
    }

    // Maß-Label
    svg += massLabel(bMm / 2, hMm - 16, bMm, hMm, isDark);

    svg += '</svg>';
    return svg;
  }

  function drawSeitenteil(x, y, w, h, S, fCol, fBorder) {
    const gx = x + 32, gy = y + OFR;
    const gw = w - 64, gh = h - OFR * 1.5;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fCol}" rx="2"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${fBorder}" stroke-width="2"/>`;
    if (gw > 0 && gh > 0) s += glassRect(gx, gy, gw, gh, S.glasdekor);
    return s;
  }

  function stossgriff(x, y, len, griffKey) {
    let col = '#b4bec6';
    if (griffKey) {
      if (griffKey.includes('m2-weiss'))  col = '#eeece6';
      else if (griffKey.includes('m2-braun')) col = '#5c3218';
      else if (griffKey.includes('m2-silber')) col = '#b0b4bc';
    }
    const gLen = Math.max(len * 0.9, 200);
    const armY = y + len * 0.1;
    return `<rect x="${x-14}" y="${y}" width="28" height="${gLen}" rx="14" fill="${col}" stroke="#888" stroke-width="2.5" opacity="0.95"/>
    <rect x="${x-40}" y="${armY-10}" width="54" height="20" rx="8" fill="${col}" stroke="#888" stroke-width="2" opacity="0.9"/>
    <rect x="${x-10}" y="${y+gLen*0.35}" width="20" height="30" rx="5" fill="rgba(0,0,0,0.12)"/>`;
  }

  function klinke(x, y, griffKey, fCol, isDark) {
    const col = isDark ? 'rgba(255,255,255,0.82)' : '#808898';
    const len = 90;
    return `<rect x="${x-10}" y="${y-len}" width="20" height="${len+20}" rx="10" fill="${col}" stroke="#606878" stroke-width="2" opacity="0.93"/>
    <path d="M${x-10},${y+20} Q${x-46},${y+20} ${x-46},${y+48}" fill="none" stroke="${col}" stroke-width="15" stroke-linecap="round" opacity="0.93"/>`;
  }

  // ─── Schiebetür (HST) SVG ─────────────────────────────────
  function drawHST(S, view) {
    const bMm = S.bMm || 2400;
    const hMm = S.hMm || 2100;
    const hasRoll = S.roll && S.roll !== 'ohne';
    const rollH = hasRoll ? ROLLO_H_HST : 0;
    const totalH = hMm + rollH;
    const lauf = S.hstLauf || 'rechts';  // welcher Flügel öffnet
    const teilung = S.hstTeilung || '2-teilig';
    const n = teilung === '3-teilig' ? 3 : 2;

    const fCol = colorOf(view === 'aus' ? S.fa : S.fi, view === 'aus' ? 'fa' : 'fi') || '#f4f4f0';
    const fBorder = (fCol === '#f4f4f0' || fCol === '#fdf6e3') ? '#c8c8c0' : 'rgba(0,0,0,0.15)';

    const wY = rollH;
    const panW = (bMm - 2 * OFR) / n;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bMm} ${totalH}" style="width:100%;height:100%;display:block" preserveAspectRatio="xMidYMid meet">`;
    svg += svgDefs(S.glasdekor);

    // Hintergrund
    svg += `<rect width="${bMm}" height="${totalH}" fill="#cdd4dd"/>`;

    // Rolladenkasten (225mm Kasten-Höhe bei HST, kein Rollladen selbst)
    if (hasRoll) svg += rolladenKasten(0, 0, bMm, rollH, S.rollSeite, S.roll);

    // Außenrahmen
    svg += `<rect x="0" y="${wY}" width="${bMm}" height="${hMm}" fill="${fCol}" rx="3"/>`;
    svg += `<rect x="0" y="${wY}" width="${bMm}" height="${hMm}" fill="none" stroke="${fBorder}" stroke-width="3" rx="3"/>`;

    // Panels: festes Panel ganz hinten, Schiebeflügel davor
    // lauf 'rechts' = Schiebeflügel links; lauf 'links' = Schiebeflügel rechts
    for (let i = 0; i < n; i++) {
      const px = OFR + i * panW;
      // Bei 2-teilig: lauf 'rechts' → Flügel 0 ist Schieber, Flügel 1 ist fest
      //               lauf 'links' → Flügel n-1 ist Schieber, rest fest
      const isSchieber = (lauf === 'rechts') ? i === 0 : i === n - 1;
      svg += drawHSTPanel(px, wY + OFR, panW, hMm - OFR * 2, isSchieber, S, fCol, fBorder, view);
    }

    // Schiebe-Pfeil
    const arY = wY + hMm * 0.5;
    const arDir = lauf === 'rechts' ? -1 : 1;
    const arX = lauf === 'rechts' ? OFR + panW * 0.5 : OFR + panW * (n - 0.5);
    const ac = 'rgba(34,94,170,0.45)';
    svg += `<polyline points="${arX+arDir*36},${arY-18} ${arX+arDir*12},${arY} ${arX+arDir*36},${arY+18}" fill="none" stroke="${ac}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>`;
    svg += `<line x1="${arX+arDir*12}" y1="${arY}" x2="${arX+arDir*panW*0.55}" y2="${arY}" stroke="${ac}" stroke-width="6" stroke-linecap="round"/>`;

    // Maß-Label
    svg += massLabel(bMm / 2, totalH - 14, bMm, hMm, false);
    svg += '</svg>';
    return svg;
  }

  function drawHSTPanel(x, y, w, h, isSchieber, S, fCol, fBorder, view) {
    const gx = x + SFR * 0.7, gy = y + SFR * 0.7;
    const gw = w - SFR * 1.4, gh = h - SFR * 1.4;
    const shadow = isSchieber ? `filter="url(#sash-sh)"` : '';
    const opacity = isSchieber ? '1' : '0.82';
    let s = `<g ${shadow}>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fCol}" opacity="${opacity}" rx="2"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${fBorder}" stroke-width="2.5" rx="2"/>`;
    if (gw > 0 && gh > 0) {
      s += glassRect(gx, gy, gw, gh, S.glasdekor);
      s += sprosse(gx, gy, gw, gh, S.sproTyp, S.sproDicke);
    }
    // Griff (Schieber)
    if (isSchieber && view === 'inn') {
      const hx = x + w * 0.5;
      const hy = y + h * 0.5;
      s += `<rect x="${hx-10}" y="${hy-50}" width="20" height="100" rx="10" fill="${fCol}" stroke="#8a9098" stroke-width="2" opacity="0.9"/>`;
    }
    s += '</g>';
    return s;
  }

  // ─── Haupt-Export ─────────────────────────────────────────
  window.renderSVGPrev = function (containerId, view) {
    if (typeof S === 'undefined' || !S.prod) return '';

    let html = '';
    if (S.prod === 'kunststoff' || S.prod === 'balkontuer') {
      html = drawFenster(S, view || 'inn');
    } else if (S.prod === 'haustuere') {
      html = drawHaustuer(S, view || 'aus');
    } else if (S.prod === 'hst') {
      html = drawHST(S, view || 'inn');
    }

    if (containerId && html) {
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = html;
    }
    return html;
  };

})();
