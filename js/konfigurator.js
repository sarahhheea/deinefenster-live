/* Konfigurator — Programmteil.
   Bis zum 12.09.2026 stand das alles direkt in konfigurator.html. Damit lud
   jeder Besucher bei JEDEM Seitenaufruf rund 272 KB neu, obwohl sich nichts
   geaendert hatte - eine Seite kann sich nicht selbst zwischenspeichern, eine
   eigene Datei schon. Ausserdem war der Quelltext der Seite zu 95 Prozent
   Maschinerie und zu 5 Prozent Inhalt.
   Der Inhalt ist unveraendert uebernommen, Zeile fuer Zeile. Eingebunden wird
   die Datei an genau der Stelle, an der der Block vorher stand, und OHNE defer -
   damit die Ausfuehrungsreihenfolge exakt dieselbe bleibt. */


const HERO_IMG="";

const COLORS_PVC=[
  {key:'weiss',n:'Weiß',c:'#f7f7f5'},
  {key:'anthrazit',n:'Anthrazitgrau',c:'#373d3f'},
  {key:'anthraz-gl',n:'Anthrazit Glatt',c:'#373d3f'},
  {key:'cremeweiss',n:'Cremeweiß',c:'#fdf6e3'},
  {key:'weiss-fx',n:'Weiß FX',c:'#ededea'},
  {key:'lichtgrau',n:'Lichtgrau',c:'#c5c6be'},
  {key:'white-sand',n:'White Sand U-Matt',c:'#e5e2d8'},
  {key:'crown-plat',n:'Crown Platin',c:'#343134'},
  {key:'pyrit',n:'Pyrit',c:'#6c6046'},
  {key:'sheffield',n:'Sheffield Oak Light',c:'#c3b4a0'},
  {key:'eiche-nat',n:'Eiche Natur',c:'#a18251'},
  {key:'grau',n:'Grau',c:'#949899'},
  {key:'betongrau',n:'Betongrau',c:'#7c7f79'},
  {key:'quarzgr-sa',n:'Quarzgrau',c:'#6c6f66'},
  {key:'quarzgr-gl',n:'Quarzgrau Glatt',c:'#6c6f66'},
  {key:'basaltgr-sa',n:'Basaltgrau',c:'#4f5458'},
  {key:'basaltgr-gl',n:'Basaltgrau Glatt',c:'#4f5458'},
  {key:'eisengl',n:'Eisenglimmer Schiefer',c:'#424949'},
  {key:'schiefgr-gl',n:'Schiefergrau Glatt',c:'#3e454c'},
  {key:'graphit-sa',n:'Graphit-Sandfarben',c:'#091216'},
  {key:'anthraz-um',n:'Anthrazitgrau Ulti-Matt',c:'#373d3f'},
  {key:'jet-black',n:'Jet Black',c:'#252729'},
  {key:'schwarz-um',n:'Schwarz Ulti-Matt',c:'#0e0e10'},
  {key:'golden-oak',n:'Golden Oak',c:'#835627'},
  {key:'turner-oak',n:'Turner Oak',c:'#d5a66d'},
  {key:'turner-toff',n:'Turner Oak Toffee',c:'#503d2f'},
  {key:'turner-waln',n:'Turner Oak Walnut',c:'#7f4f2f'},
  {key:'winchester',n:'Winchester',c:'#7f5529'},
  {key:'oregon',n:'Oregon',c:'#c67519'},
  {key:'douglasie',n:'Streifen-Douglasie',c:'#765021'},
  {key:'nussbaum',n:'Nussbaum',c:'#2d1a19'},
  {key:'dunkleiche',n:'Eiche Dunkel',c:'#291d12'},
  {key:'schwarzbr',n:'Schwarzbraun',c:'#1e0e10'},
  {key:'macore',n:'Macoré',c:'#432a19'},
  {key:'mahagoni',n:'Mahagoni',c:'#2d1f14'},
  {key:'schoko-br',n:'Schokoladenbraun',c:'#2f201a'},
  {key:'shine-bronze',n:'Shine Deep Bronze',c:'#564b37'},
  {key:'moosgruen',n:'Moosgrün',c:'#1e3e2c'},
  {key:'dunkelgr',n:'Dunkelgrün',c:'#2e4e28'},
  {key:'dunkelrot',n:'Dunkelrot',c:'#6c1c1c'},
  {key:'brillblau',n:'Brillantblau',c:'#2a5c8c'},
  {key:'stahlblau',n:'Stahlblau',c:'#1c4c6c'},
];

const COLORS_ROLL=[
  {key:'roll-weiss',      n:'Weiß',                 c:'#efeef1'},
  {key:'roll-anthrazit',  n:'Anthrazitgrau',        c:'#3a3a3c'},
  {key:'roll-silber',     n:'Silber',               c:'#b7b7b7'},
  {key:'roll-grau',       n:'Grau',                 c:'#cbcac1'},
  {key:'roll-grau-alu',   n:'Grau Aluminium',       c:'#888888'},
  {key:'roll-beige',      n:'Beige',                c:'#d4c4aa'},
  {key:'roll-basaltgrau', n:'Basaltgrau RAL 7012',  c:'#585c5f'},
  {key:'roll-quarzgrau',  n:'Quarzgrau RAL 7039',   c:'#6b6860'},
  {key:'roll-dunkelbraun',n:'Dunkelbraun',          c:'#3f3b35'},
  {key:'roll-braun',      n:'Braun',                c:'#433425'},
  {key:'roll-goldenoak',  n:'Golden Oak',           c:'#825727'},
  {key:'roll-turneroak',  n:'Turner Oak',           c:'#cca774'},
  {key:'roll-winchester', n:'Winchester',           c:'#7d5529'},
  {key:'roll-nussbaum',   n:'Nussbaum',             c:'#3a2422'},
  {key:'roll-moosgruen',  n:'Moosgrün',             c:'#334b35'},
  {key:'roll-schwarz',    n:'Schwarz',              c:'#141414'}
];

// Die Panzerfarben haengen von der Lamellenhoehe ab; nicht jeder Ton ist bei
// jeder Hoehe lieferbar. Welche Hoehe verbaut wird, ergibt sich aus der
// Rollladengroesse und steht hier nicht fest. Toene, die davon abhaengen,
// werden deshalb nicht zur Auswahl gestellt, sondern mit dem Angebot bestaetigt.
//
// Bewusst KEIN Eintrag aus COLORS_ROLL entfernt: Farben stehen im Warenkorb als
// Index. Ein geloeschter Eintrag verschiebt alle folgenden, gespeicherte Koerbe
// zeigten sonst stillschweigend eine andere Farbe.
//
// Kasten und Fuehrungsschienen sind nicht betroffen -- die kommen aus der
// RAL-Palette.
const PANZER_GESPERRT=['roll-quarzgrau'];
function _istPanzerteil(k){
  return k==='panzer'||k==='endleiste'||k==='rlPanzer'||k==='rlEndleiste'; }
function _rollGesperrt(k,co){
  return _istPanzerteil(k) && PANZER_GESPERRT.indexOf(co.key)>=0; }
// Liefert [{co,i}] -- der Index bleibt der COLORS_ROLL-Index, damit gespeicherte
// Auswahlen weiter stimmen.
function rollFarbenFuer(k){
  var raus=[];
  for(var i=0;i<COLORS_ROLL.length;i++){
    if(!_rollGesperrt(k,COLORS_ROLL[i])) raus.push({co:COLORS_ROLL[i],i:i});
  }
  return raus;
}
const COLORS_HOLZ_KIEFER=[
  {key:'weiss',            n:'Wei\u00df',       c:'#ebebeb'},
  {key:'holz-eiche-hell',  n:'Eiche Hell',   c:'#925938'},
  {key:'holz-eiche-dunkel',n:'Eiche Dunkel', c:'#863f24'},
  {key:'holz-teak',        n:'Teak',         c:'#763221'},
  {key:'holz-mahagoni',    n:'Mahagoni',     c:'#762f22'},
  {key:'holz-nussbaum',    n:'Nussbaum',     c:'#2d1f20'},
  {key:'holz-palisander',  n:'Palisander',   c:'#291619'}
];
const COLORS_HOLZ_MERANTI=[
  {key:'weiss',            n:'Wei\u00df',       c:'#ebebeb'},
  {key:'holz-eiche-hell',  n:'Eiche Hell',   c:'#9e5128'},
  {key:'holz-eiche-dunkel',n:'Eiche Dunkel', c:'#683322'},
  {key:'holz-teak',        n:'Teak',         c:'#753622'},
  {key:'holz-mahagoni',    n:'Mahagoni',     c:'#5b2821'},
  {key:'holz-nussbaum',    n:'Nussbaum',     c:'#301f1e'},
  {key:'holz-palisander',  n:'Palisander',   c:'#231517'}
];

const COLORS_ALU=[
  {key:'weiss',         n:'Wei\u00df RAL 9016',      c:'#f6f6f6'},
  {key:'alu-anthrazit', n:'Anthrazitgrau RAL 7016', c:'#293133'},
  {key:'alu-braun',     n:'Braun RAL 8019',         c:'#59351f'}
];

function COLORS_AKT(){
  if(typeof S==='undefined' || S.prod!=='fenster') return COLORS_PVC;
  if(S.material==='alu') return COLORS_ALU;
  if(S.material!=='holz') return COLORS_PVC;
  return (S.holzart==='meranti') ? COLORS_HOLZ_MERANTI : COLORS_HOLZ_KIEFER;
}
const _PREM_FARBE=['schwarzbr','basaltgr-gl','basaltgr-sa','betongrau','crown-plat','dunkelgr','dunkelrot','eiche-nat','eisengl','moosgruen','oregon','schiefgr-gl','douglasie','pyrit','graphit-sa','jet-black','shine-bronze'];

const S={ prod:'fenster', material:'kunststoff', holzart:'kiefer', profile:'classic', aufteilung:'1fl', opening:'dkr', anschlagIdx:1, hstSystem:'psk', pskKammer:'iglo5', w:1000, h:1200, anzahl:1, outer:0, inner:0, balkonSchwelle:'ohne', doorModel:'nebraska-lcr-inox', griffTuer:'klinke', griffAussen:'klinke', stossHoehe:'1200', griffHst:'innen', hstSchloss:'ohne', hstTeilung:'2', hstLauf:'rechts',
  glass:'2', glasdekor:'klar', schall:false, griff:'mistral', roll:'kein', panzer:null, endleiste:null, sproTyp:'keine', sproDicke:'27', sproRaster:'kreuz', sicher:false, colorTarget:'a',

  vbAn:false, vbL:0, vbR:0, vbO:0, vbU:0, licht:'ohne', olTyp:'fest', ulTyp:'fest', olH:0, ulH:0 };

const ANSCHLAG={

  '1fl':[
    {n:'Dreh-Kipp rechts',oeff:['dk-r']},
    {n:'Dreh-Kipp links',oeff:['dk-l']},
    {n:'Dreh rechts',oeff:['dreh-r']},
    {n:'Dreh links',oeff:['dreh-l']},
    {n:'Kipp',oeff:['kipp']},
    {n:'Festverglasung',oeff:['fest']},
  ],
  '2fl':[
    {n:'Dreh-Kipp links · Dreh-Kipp rechts · Pfosten',oeff:['dk-l','dk-r'],tag:'Beliebt'},
    {n:'Dreh links · Stulp · Dreh-Kipp rechts',oeff:['dreh-l','dk-r'],stulpAt:1,tag:'Beliebt'},
    {n:'Dreh links · Dreh-Kipp rechts · Pfosten',oeff:['dreh-l','dk-r']},
    {n:'Dreh-Kipp links · Dreh rechts · Pfosten',oeff:['dk-l','dreh-r']},
    {n:'Dreh-Kipp links · Stulp · Dreh rechts',oeff:['dk-l','dreh-r'],stulpAt:1},
    {n:'Fest · Dreh-Kipp rechts · Pfosten',oeff:['fest','dk-r']},
    {n:'Dreh-Kipp links · Fest · Pfosten',oeff:['dk-l','fest']},
  ],
  '3fl':[
    {n:'Dreh-Kipp links · Dreh-Kipp · Dreh-Kipp rechts · Pfosten',oeff:['dk-l','dk-r','dk-r'],tag:'Beliebt'},
    {n:'Dreh-Kipp links · Dreh rechts · Dreh-Kipp rechts · Pfosten',oeff:['dk-l','dreh-r','dk-r']},
    {n:'Dreh-Kipp links · Dreh links · Dreh-Kipp rechts · Pfosten',oeff:['dk-l','dreh-l','dk-r']},
    {n:'Dreh-Kipp links · Stulp · Dreh rechts · Dreh-Kipp rechts',oeff:['dk-l','dreh-r','dk-r'],stulpAt:1},
    {n:'Dreh-Kipp links · Dreh links · Stulp · Dreh-Kipp rechts',oeff:['dk-l','dreh-l','dk-r'],stulpAt:2},
    {n:'Dreh-Kipp links · Fest · Dreh-Kipp rechts · Pfosten',oeff:['dk-l','fest','dk-r']},
  ],
};

const BALKON_ANSCHLAG={
  '1fl':[
    {n:'Dreh-Kipp links',oeff:['dk-l']},
    {n:'Dreh-Kipp rechts',oeff:['dk-r']},
  ],
  '2fl':[
    {n:'Dreh links · Stulp · Dreh-Kipp rechts',oeff:['dreh-l','dk-r'],stulpAt:1},
    {n:'Dreh-Kipp links · Stulp · Dreh rechts',oeff:['dk-l','dreh-r'],stulpAt:1},
  ],
};
const ANSCHLAG_DEFIDX={'1fl':0,'2fl':0,'3fl':0};

const EXT_ANSCHLAG={
  '1fl':[
    {n:'DIN links · nach außen',oeff:['dreh-l']},
    {n:'DIN rechts · nach außen',oeff:['dreh-r']},
  ],
  '2fl':[
    {n:'DIN rechts · Pfosten · DIN links · nach außen',oeff:['dreh-r','dreh-l']},
    {n:'DIN rechts · Stulp · DIN links · nach außen',oeff:['dreh-r','dreh-l'],stulpAt:1},
  ],
  '3fl':[
    {n:'DIN rechts · Pfosten · DIN rechts · DIN links · nach außen',oeff:['dreh-r','dreh-r','dreh-l']},
    {n:'DIN rechts · Stulp · DIN links · Pfosten · nach außen',oeff:['dreh-r','dreh-l','dreh-l'],stulpAt:1},
  ],
};
function istExt(){ return S.prod==='fenster' && S.material==='kunststoff' && S.profile==='ext'; }

const HAUSTUER_ANSCHLAG=[{n:'DIN links',oeff:['dreh-l']},{n:'DIN rechts',oeff:['dreh-r']}];
function anschlagSet(){ if(S.prod==='haustuer') return HAUSTUER_ANSCHLAG; if(S.prod==='balkon') return BALKON_ANSCHLAG[S.aufteilung]||BALKON_ANSCHLAG['1fl']; if(istExt()) return EXT_ANSCHLAG[S.aufteilung]||EXT_ANSCHLAG['1fl']; return ANSCHLAG[S.aufteilung]||ANSCHLAG['1fl']; }
function curAnschlag(){ const set=anschlagSet(); return set[Math.min(S.anschlagIdx,set.length-1)]||set[0]; }
function openingName(){ const o=curAnschlag(); return o?o.n:''; }

function tuerOeffnungName(){ return (S.tuerOeffnung==='aussen') ? 'nach außen öffnend' : 'nach innen öffnend'; }

function tuerAnsichtName(){ return (S.tuerOeffnung==='aussen') ? 'Ansicht von außen' : 'Ansicht von innen'; }
function anschlagKlartext(){
  const i=anschlagInfo();
  return i.norm+(i.ansicht?' · '+i.ansicht:'');
}

function anschlagInfo(){
  const seiteWort=s=>s==='r'?'rechts':'links';

  if(S.prod==='rollladen'){
    const kas=rollKast();
    return {
      label:'Antrieb',
      norm:rollAntriebText(),
      klartext:'Bedienseite von außen gesehen',
      ansicht:'',
      kurz:rollAntriebText(),
      warn:false, warntext:'',
      satz:'Vorsatzrollladen mit '+ROLL_FORM[kas.form].d+' '+kas.n+', '+rollAntriebText()+'.',
      chip:'Maß inkl. Kasten'
    };
  }
  if(S.prod==='haustuer'){

    const dinL=(S.opening==='dkl'), aussen=(S.tuerOeffnung==='aussen');
    const band=dinL?'links':'rechts', griff=dinL?'rechts':'links';
    return {
      label:'Anschlag',
      norm:'DIN '+(dinL?'links':'rechts')+' · '+tuerOeffnungName(),
      klartext:'Bänder '+band+' · Griff '+griff+' — '+(aussen?'von außen gesehen':'von innen gesehen'),
      ansicht:tuerAnsichtName(),
      kurz:'DIN '+(dinL?'links':'rechts')+' · '+(aussen?'nach außen':'nach innen'),
      warn:aussen,
      warntext:aussen?'DIN wird von außen bestimmt':'',

      satz:'Öffnet nach '+(aussen?'außen':'innen')+', Bänder '+band+', Griff '+griff+'.',

      chip:'DIN '+(dinL?'links':'rechts')+' \u00b7 Bezugsseite '+(aussen?'au\u00dfen':'innen'),
      pikto:{typ:'dreh',hinge:dinL?'l':'r',richtung:aussen?'aussen':'innen'}
    };
  }
  if(S.prod==='schiebe'){
    const psk=(S.hstSystem!=='hs'), li=(S.hstLauf==='links');
    const norm=psk?('Kipp-Schiebe '+(li?'links':'rechts')):('Läuft nach '+(li?'links':'rechts'));
    return {
      label:'Laufrichtung', norm:norm,
      klartext:'Schiebeflügel läuft nach '+(li?'links':'rechts')+' — von innen gesehen',
      ansicht:'', kurz:norm, warn:false, warntext:'',
      satz:'Schiebeflügel läuft nach '+(li?'links':'rechts')+(psk?' und kippt zum Lüften':'')+' — von innen gesehen.',
      chip:norm,
      pikto:{typ:'schiebe',hinge:li?'l':'r',richtung:'innen'}
    };
  }

  const n=openingName()||'—';
  let klar=AUFTN[S.aufteilung]||'', satz=klar, pikto={typ:'mehr',hinge:'r',richtung:'innen'};
  try{
    const toks=(curAnschlag()||{}).oeff||[];
    if(toks.length===1){
      const t=tokSash(toks[0]);
      if(t.open==='fest'){
        klar='Feststehend — lässt sich nicht öffnen';
        satz='Feststehend — lässt sich nicht öffnen.';
        pikto={typ:'fest',hinge:'r',richtung:'innen'};
      }

      else if(t.open==='kipp'){
        klar='Nur kippen — Griff seitlich, Achse unten';
        satz='Kippt nach innen, Achse unten, Griff seitlich.';
        pikto={typ:'kipp',hinge:'r',richtung:'innen'};
      }
      else if(t.hinge){
        const b=seiteWort(t.hinge), g=seiteWort(t.hinge==='r'?'l':'r');
        klar='Band '+b+' · Griff '+g+' — von innen gesehen';
        satz=(t.open==='dk'?'Öffnet und kippt nach innen, Band ':'Öffnet nach innen, Band ')+b+', Griff '+g+' — von innen gesehen.';
        pikto={typ:'dreh',hinge:t.hinge,richtung:'innen'};
      }
    } else if(toks.length>1){

      let bs=null; try{ bs=buildSashes(); }catch(e){}
      const stulp=!!(bs&&bs.stulpAt);
      klar=stulp?'Ohne festen Mittelpfosten — volle Breite frei':'Mit festem Mittelpfosten';
      satz=(AUFTN[S.aufteilung]||'Mehrere Flügel')+(stulp?' ohne festen Mittelpfosten — volle Breite frei.':' mit festem Mittelpfosten.');
      pikto={typ:'mehr',hinge:'r',richtung:'innen'};
    }
  }catch(e){}

  return {label:'Öffnungsart', norm:n, klartext:klar, ansicht:'', kurz:n, warn:false, warntext:'',
          satz:satz, chip:n, pikto:pikto};
}

function anschlagPikto(px){
  const ai=anschlagInfo(), p=ai.pikto||{typ:'mehr',hinge:'r',richtung:'innen'};
  const W=100, H=76, A='#225eaa', G='#c3cbd6', D='#c9d4e4';
  const w=px||68;
  const kopf='<svg viewBox="0 0 '+W+' '+H+'" width="'+w+'" height="'+Math.round(w*H/W)+'" role="img" aria-label="'+esc(ai.satz)+'">';
  const wand='<line x1="6" y1="58" x2="94" y2="58" stroke="'+G+'" stroke-width="7" stroke-linecap="round"/>';
  if(p.typ==='fest'){
    return kopf+wand+'<rect x="24" y="34" width="52" height="18" rx="3" fill="#eef3fa" stroke="'+A+'" stroke-width="3"/>'+
      '<line x1="24" y1="34" x2="76" y2="52" stroke="'+D+'" stroke-width="2"/>'+
      '<line x1="76" y1="34" x2="24" y2="52" stroke="'+D+'" stroke-width="2"/></svg>';
  }
  if(p.typ==='kipp'){

    return kopf+wand+'<line x1="30" y1="58" x2="46" y2="20" stroke="'+A+'" stroke-width="6" stroke-linecap="round"/>'+
      '<path d="M30 58 A38 38 0 0 1 46 20" fill="none" stroke="'+D+'" stroke-width="2" stroke-dasharray="4 4"/>'+
      '<circle cx="30" cy="58" r="6.5" fill="#fff" stroke="'+A+'" stroke-width="3.4"/><circle cx="30" cy="58" r="1.9" fill="'+A+'"/></svg>';
  }
  if(p.typ==='schiebe'){
    const li=(p.hinge==='l');
    const pfeil=li?'<path d="M34 30 L20 38 L34 46" fill="none" stroke="'+A+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
                 :'<path d="M66 30 L80 38 L66 46" fill="none" stroke="'+A+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    return kopf+wand+'<rect x="'+(li?38:24)+'" y="30" width="38" height="16" rx="3" fill="#eef3fa" stroke="'+A+'" stroke-width="3"/>'+pfeil+'</svg>';
  }
  if(p.typ==='mehr'){
    return kopf+wand+'<rect x="14" y="32" width="34" height="16" rx="3" fill="#eef3fa" stroke="'+A+'" stroke-width="3"/>'+
      '<rect x="52" y="32" width="34" height="16" rx="3" fill="#eef3fa" stroke="'+A+'" stroke-width="3"/></svg>';
  }

  const re=(p.hinge==='r'), aus=(p.richtung==='aussen');
  const bx=re?86:14, ex=re?47:53, ey=aus?17:78;
  const bogen=aus
    ? (re?'M86 58 A44 44 0 0 0 45 15':'M14 58 A44 44 0 0 1 55 15')
    : (re?'M86 58 A26 26 0 0 1 60 78':'M14 58 A26 26 0 0 0 40 78');
  return kopf+wand+
    '<path d="'+bogen+'" fill="none" stroke="'+D+'" stroke-width="2" stroke-dasharray="4 4"/>'+
    '<line x1="'+bx+'" y1="58" x2="'+ex+'" y2="'+ey+'" stroke="'+A+'" stroke-width="6" stroke-linecap="round"/>'+
    '<circle cx="'+bx+'" cy="58" r="6.5" fill="#fff" stroke="'+A+'" stroke-width="3.4"/>'+
    '<circle cx="'+bx+'" cy="58" r="1.9" fill="'+A+'"/></svg>';
}

function tokSash(tok){
  if(tok==='kipp')return{open:'kipp',hinge:null};
  if(tok==='fest')return{open:'fest',hinge:null};
  return {open:(tok.slice(0,2)==='dk')?'dk':'dreh', hinge:tok.slice(-1)};
}

function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=(n>>16)+a,g=((n>>8)&255)+a,b=(n&255)+a;r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));return '#'+(r<<16|g<<8|b).toString(16).padStart(6,'0');}

function glasHell(){ return !(typeof S!=='undefined' && S.prod==='fenster' && (S.material==='holz'||S.material==='alu')); }
function _darkHex(h){ const n=parseInt(String(h||'#ffffff').slice(1),16); return (0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255)) < 150; }
function isDarkCol(i){ const h=(COLORS_AKT()[i]&&COLORS_AKT()[i].c)||'#ffffff'; const n=parseInt(h.slice(1),16); const r=(n>>16)&255,g=(n>>8)&255,b=n&255; return (0.299*r+0.587*g+0.114*b) < 150; }

function coilSymbol(cx,cy,r){
  r=r||8;
  let pts=[]; const turns=2.4, steps=Math.round(turns*18);
  for(let i=0;i<=steps;i++){ const t=i/steps*turns*2*Math.PI, rr=(r-1.5)*i/steps+0.6; pts.push((cx+rr*Math.cos(t)).toFixed(1)+' '+(cy+rr*Math.sin(t)).toFixed(1)); }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#3a4756" stroke-width="1.1"/>`
    +`<path d="M${pts.join(' L')}" fill="none" stroke="#3a4756" stroke-width="0.8"/>`;
}

function rollKasten(x,boxY,w,boxH){
  const co=COLORS_AKT()[S.outer], dark=isDarkCol(S.outer);
  const edge=dark?'rgba(255,255,255,.34)':'rgba(30,40,55,.52)';
  const isMotor=S.roll==='motor';
  const seite=S.rollSeite||'rechts';
  let s=`<rect x="${x}" y="${boxY}" width="${w}" height="${boxH}" fill="${co.c}" stroke="${edge}" stroke-width="1.3"/>`;
  s+=`<line x1="${x}" y1="${(boxY+boxH*0.62).toFixed(1)}" x2="${x+w}" y2="${(boxY+boxH*0.62).toFixed(1)}" stroke="${edge}" stroke-width="0.6" opacity="0.55"/>`;

  s+=`<g stroke="#b3b0a8" stroke-width="0.9" fill="none"><line x1="${x-7}" y1="${boxY}" x2="${x-7}" y2="${boxY+boxH}"/><line x1="${x-10}" y1="${boxY}" x2="${x-4}" y2="${boxY}"/><line x1="${x-10}" y1="${boxY+boxH}" x2="${x-4}" y2="${boxY+boxH}"/></g>`;
  s+=`<text x="${x-12}" y="${boxY+boxH/2}" text-anchor="middle" font-size="8" fill="#6E6A63" font-family="Inter" font-weight="600" transform="rotate(90 ${x-12} ${boxY+boxH/2})">215</text>`;

  const cx = seite==='rechts'? x+w-16 : x+16, cy=boxY-1;
  s+=coilSymbol(cx,cy,8);

  const dir = seite==='rechts'? 1 : -1;
  s+=`<path d="M${cx+dir*10} ${cy-6} q${dir*7} 1 ${dir*6} 8" fill="none" stroke="#d43a3a" stroke-width="1"/><path d="M${cx+dir*10} ${cy-6} l${dir*-3} -1 l${dir*1} 4" fill="none" stroke="#d43a3a" stroke-width="1"/>`;
  if(isMotor){
    const kx=cx+dir*16;
    s+=`<line x1="${cx+dir*8}" y1="${cy}" x2="${kx}" y2="${cy}" stroke="#3a4756" stroke-width="1"/>`;
    s+=`<rect x="${dir>0?kx:kx-9}" y="${cy-4}" width="9" height="8" rx="1.4" fill="#f4f5f7" stroke="#3a4756" stroke-width="1"/>`;
    s+=`<line x1="${(dir>0?kx+3:kx-6)}" y1="${cy-6.5}" x2="${(dir>0?kx+3:kx-6)}" y2="${cy-4}" stroke="#3a4756" stroke-width="1"/><line x1="${(dir>0?kx+6:kx-3)}" y1="${cy-6.5}" x2="${(dir>0?kx+6:kx-3)}" y2="${cy-4}" stroke="#3a4756" stroke-width="1"/>`;
  }
  return s;
}

function panzerOnGlass(x,y,w,h){
  const pz={c:panzerC()}, pzDark=_darkHex(pz.c);
  const edge='rgba(28,36,50,.42)';
  const gap=pzDark?'rgba(255,255,255,.28)':'rgba(28,38,54,.34)';
  const slatH=3.2;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${pz.c}" stroke="${edge}" stroke-width="0.9"/>`;
  for(let yy=y+slatH; yy<y+h-3.4; yy+=slatH){
    s+=`<line x1="${x}" y1="${yy.toFixed(1)}" x2="${x+w}" y2="${yy.toFixed(1)}" stroke="${gap}" stroke-width="0.6"/>`;
  }
  const elc=(S.endleiste!=null?COLORS_ROLL[S.endleiste].c:shade(pz.c,pzDark?16:-18));
  s+=`<rect x="${x}" y="${y+h-3.2}" width="${w}" height="3.6" fill="${elc}" stroke="${edge}" stroke-width="0.7"/>`;
  return s;
}

function buildSashes(){
  const o=curAnschlag();
  return {sashes:o.oeff.map(tokSash), stulpAt:o.stulpAt||0};
}

function sashOpenLines(open,hinge,gx1,gy1,gx2,gy2){
  if(open==='transom') return '';
  const mx=(gx1+gx2)/2,my=(gy1+gy2)/2;
  if(open==='fest'){ const s=Math.min(11,(gx2-gx1)*0.16); return `<path d="M${mx-s} ${my} L${mx+s} ${my} M${mx} ${my-s} L${mx} ${my+s}"/>`; }
  let o='';
  const dreh=(open==='dk'||open==='dreh'||open==='dkl'||open==='dkr');
  const tilt=(open==='dk'||open==='kipp'||open==='dkl'||open==='dkr');
  if(dreh){
    const apexRight = (hinge==='l');

    const strich = (typeof istExt==='function' && istExt()) ? ' stroke-dasharray="6 4"' : '';
    o+= apexRight? `<path${strich} d="M${gx1} ${gy1} L${gx2} ${my} L${gx1} ${gy2}"/>` : `<path${strich} d="M${gx2} ${gy1} L${gx1} ${my} L${gx2} ${gy2}"/>`;
  }
  if(tilt) o+=`<path d="M${gx1} ${gy2} L${mx} ${gy1} L${gx2} ${gy2}"/>`;
  return o;
}

function realHandle(cx,cy){
  const e='#3a4756';
  let s=`<rect x="${cx-3.6}" y="${cy-11}" width="7.2" height="22" rx="3.6" fill="#fff" stroke="${e}" stroke-width="0.9"/>`;
  s+=`<rect x="${cx-2.6}" y="${cy+1}" width="5.2" height="24" rx="2.6" fill="#fff" stroke="${e}" stroke-width="0.9"/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="3" fill="#fff" stroke="${e}" stroke-width="0.9"/>`;
  return s;
}

function gurtwickler(cx,gurtTop,boxTop){
  const bw=18, bh=27;
  let s='';
  s+=`<rect x="${cx-2.6}" y="${gurtTop}" width="5.2" height="${boxTop-gurtTop+3}" fill="#e6e1d5" stroke="rgba(70,64,52,.30)" stroke-width="0.5"/>`;
  for(let yy=gurtTop+5; yy<boxTop; yy+=5){ s+=`<line x1="${cx-2.6}" y1="${yy.toFixed(1)}" x2="${cx+2.6}" y2="${yy.toFixed(1)}" stroke="rgba(70,64,52,.14)" stroke-width="0.5"/>`; }
  s+=`<g opacity="0.20" filter="url(#hblur)"><rect x="${cx-bw/2+2}" y="${boxTop+3}" width="${bw}" height="${bh}" rx="6" fill="#0b1220"/></g>`;
  s+=`<rect x="${cx-bw/2}" y="${boxTop}" width="${bw}" height="${bh}" rx="6" fill="url(#gwbody)" stroke="rgba(120,124,130,.5)" stroke-width="0.7"/>`;
  s+=`<path d="M${cx-bw/2+2} ${boxTop+2.5} q${bw/2-2} -2.2 ${bw-4} 0" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="0.8"/>`;
  s+=`<rect x="${cx-3.4}" y="${boxTop+3.5}" width="6.8" height="2.6" rx="1.3" fill="rgba(90,94,100,.3)"/>`;
  return s;
}
function sashHandle(open,hinge,gx1,gy1,gx2,gy2){
  if(open==='fest'||open==='transom') return '';
  const my=(gy1+gy2)/2;
  const side = hinge==='l' ? 'r' : (hinge==='r' ? 'l' : 'r');
  const hx = side==='r' ? gx2+7 : gx1-7;
  return realHandle(hx,my);
}

function drawSash(x,y,w,h,sash,ctx,num){
  const {co,coI,edge,line,miter,seal}=ctx;
  const ins=Math.min(14,Math.round(w*0.17));
  const gx1=x+ins,gy1=y+ins,gx2=x+w-ins,gy2=y+h-ins, mx=(gx1+gx2)/2,my=(gy1+gy2)/2;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${co.c}" stroke="${edge}" stroke-width="1.1"/>`;
  s+=`<g stroke="${miter}" stroke-width="1"><line x1="${x}" y1="${y}" x2="${gx1}" y2="${gy1}"/><line x1="${x+w}" y1="${y}" x2="${gx2}" y2="${gy1}"/><line x1="${x}" y1="${y+h}" x2="${gx1}" y2="${gy2}"/><line x1="${x+w}" y1="${y+h}" x2="${gx2}" y2="${gy2}"/></g>`;
  s+=`<rect x="${gx1}" y="${gy1}" width="${gx2-gx1}" height="${gy2-gy1}" fill="#dcebf6" stroke="#8fa8bd" stroke-width="1"/>`;

  if(S.sproTyp&&S.sproTyp!=='keine'&&sash.open!=='transom'){
    const r=SPRO_RASTER[S.sproRaster]||SPRO_RASTER.kreuz; let sl='';
    for(let i=1;i<=r.v;i++){ const vx=(gx1+(gx2-gx1)*i/(r.v+1)).toFixed(1); sl+=`<line x1="${vx}" y1="${gy1}" x2="${vx}" y2="${gy2}"/>`; }
    for(let j=1;j<=r.h;j++){ const hy=(gy1+(gy2-gy1)*j/(r.h+1)).toFixed(1); sl+=`<line x1="${gx1}" y1="${hy}" x2="${gx2}" y2="${hy}"/>`; }
    if(S.sproTyp==='aufgesetzt') s+=`<g stroke="rgba(30,40,55,.32)" stroke-width="4.6" fill="none" stroke-linecap="round">${sl}</g><g stroke="${co.c}" stroke-width="3.2" fill="none" stroke-linecap="round">${sl}</g>`;
    else s+=`<g stroke="rgba(120,140,164,.95)" stroke-width="1.7" fill="none" stroke-linecap="round">${sl}</g>`;
  }
  s+=`<g stroke="#2c3542" stroke-width="1.5" fill="none" stroke-linejoin="round">${sashOpenLines(sash.open,sash.hinge,gx1,gy1,gx2,gy2)}</g>`;

  return s;
}

function pdfSkizzeSrc(){
  return null;
  const V='.webp?v=20260705c', B='img/pdf-skizzen/';
  const o=curAnschlag(), t=(o.oeff||[])[0], hasRoll=(S.roll&&S.roll!=='kein');
  if(S.aufteilung==='1fl'){
    if(hasRoll && t==='dk-r') return B+(S.roll==='motor'?'fenster-1fl-dkr-rollmotor':'fenster-1fl-dkr-rollgurt')+V;
    if(t==='dk-r') return B+'fenster-1fl-dkr'+V;
    if(t==='dk-l') return B+'fenster-1fl-dkl'+V;
    if(t==='kipp') return B+'fenster-1fl-kipp'+V;
    if(t==='fest') return B+'fenster-1fl-fest'+V;
  }
  if(S.aufteilung==='2fl') return B+(o.stulpAt?'fenster-2fl-stulp':'fenster-2fl-pfosten')+V;
  if(S.aufteilung==='3fl') return B+'fenster-3fl-pfosten'+V;
  return null;
}

let ANSICHT_ERZWUNGEN = null;
function sketchAussen(){
  if(ANSICHT_ERZWUNGEN !== null) return ANSICHT_ERZWUNGEN;
  try{ return started && STEPS[cur] && STEPS[cur].key==='farbe' && S.colorTarget==='a'; }catch(e){ return false; }
}
// Nummer, die in der Unterschrift der Skizze auftaucht. Nur fuer die Bilder in
// der Mail gesetzt: dort liegen mehrere Skizzen untereinander und ohne Nummer
// ist nicht erkennbar, welche Zeichnung zu welcher Zeile gehoert. Am Bildschirm
// steht die Nummer schon daneben, deshalb bleibt sie dort leer.
var SKIZZE_POSNR = null;

function skizzeSeite(conf, aussen, posNr){
  var vorher = ANSICHT_ERZWUNGEN, vorherNr = SKIZZE_POSNR;
  ANSICHT_ERZWUNGEN = aussen;
  SKIZZE_POSNR = (posNr == null) ? null : posNr;
  try { return withConf(conf, function(){ return stageSVG(); }); }
  finally { ANSICHT_ERZWUNGEN = vorher; SKIZZE_POSNR = vorherNr; }
}

function skizzeKompakt(conf, posNr){ return skizzeSeite(conf,false,posNr); }

var TUER_BUEHNE_SEITE = null;
var TUER_SEITE_ERZWUNGEN = null;
function tuerBuehneAussen(){
  return (TUER_BUEHNE_SEITE !== null) ? TUER_BUEHNE_SEITE : (S.tuerOeffnung === 'aussen');
}
function tuerSeiteUmschalten(aussen){ TUER_BUEHNE_SEITE = !!aussen; render(); }

function tuerSeitenUmschalter(){
  if(S.prod!=='haustuer') return '';
  var a = tuerBuehneAussen();
  var knopf = function(anAussen, text){
    return '<button type="button" class="tsu-btn'+(anAussen===a?' an':'')+'"'
         + ' aria-pressed="'+(anAussen===a?'true':'false')+'"'
         + ' onclick="tuerSeiteUmschalten('+anAussen+')">'+text+'</button>';
  };
  return '<div class="tsu" role="group" aria-label="Ansicht der Haust\u00fcr">'
       + knopf(false,'Von innen') + knopf(true,'Von au\u00dfen') + '</div>';
}

function skizzenFormMelden(){
  var box=document.getElementById('stage'), kasten=box&&box.closest('.stage');
  if(!kasten) return;
  var svg=box.querySelector('svg'), vb=svg&&svg.getAttribute('viewBox');
  var m=vb?vb.trim().split(/[\s,]+/).map(Number):null;
  if(m&&m.length===4&&m[2]>0&&m[3]>0) kasten.style.setProperty('--sk-ar',(m[2]/m[3]).toFixed(4));
  else kasten.style.removeProperty('--sk-ar');

  kasten.style.setProperty('--sk-extra', box.querySelector('.tsu') ? '40px' : '0px');
}
function stageSVG(){
  const pdf=pdfSkizzeSrc();
  if(pdf) return `<img src="${pdf}" alt="Fenster-Skizze" style="width:100%;height:100%;object-fit:contain;display:block">`;
  if(S.prod==='balkon') return balkonStageSVG();
  if(S.prod==='schiebe') return schiebeStageSVG();
  if(S.prod==='rollladen') return rollStageSVG();

  if(S.prod==='haustuer'){
    if(ANSICHT_ERZWUNGEN !== null) return haustuerStageSVG();
    var v1 = ANSICHT_ERZWUNGEN, v2 = TUER_SEITE_ERZWUNGEN;
    ANSICHT_ERZWUNGEN = true;
    TUER_SEITE_ERZWUNGEN = tuerBuehneAussen();
    try { return haustuerStageSVG(); } finally { ANSICHT_ERZWUNGEN = v1; TUER_SEITE_ERZWUNGEN = v2; }
  }
  return fensterStageSVG();
}

var SKZ_K=1;

function rollKastenParts(bMm,rollH,dark){
  const R=(S.rollSeite==='links'), mot=(S.roll==='motor');
  const flip=(x,w)=>R?` transform="translate(${(2*x+w).toFixed(1)},0) scale(-1,1)"`:'';
  const ch=rollH*0.86, cw=ch*51/54, ccx=R?bMm*0.30:bMm*0.70, cx=ccx-cw/2, cy=rollH*0.5-ch/2;
  let s=`<image href="${dark?'img/skizze/coil_l.webp':'img/skizze/coil_d.webp'}" x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}"${flip(cx,cw)}/>`;
  if(mot){ const ph=rollH*0.32, pw=ph*56/34, pcx=R?bMm*0.09:bMm*0.91, px=pcx-pw/2, py=rollH*0.5-ph/2;
    s+=`<image href="${dark?'img/skizze/plug_l.webp':'img/skizze/plug_d.webp'}" x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}"${flip(px,pw)}/>`; }
  return s;
}

function gurtwicklerDevice(bMm,winY,hMm,FR,uu,dark,frameFill){
  const R=(S.rollSeite==='links');
  const h=Math.min(hMm*0.13,160*SKZ_K), w=h*32/34;
  let griffSide=null; try{ const t=tokSash(curAnschlag().oeff[0]); if(t.open==='dk'||t.open==='dreh') griffSide=(t.hinge==='l')?'rechts':'links'; }catch(e){}
  const sameSide=(griffSide===(R?'links':'rechts'));
  const cx=R?FR*0.35:bMm-FR*0.35, cy=winY+hMm*(sameSide?0.74:0.52), x=cx-w/2, y=cy-h*0.42;
  const c=Math.min(w,h)*0.2;
  const pts=`${(x+c).toFixed(1)},${y.toFixed(1)} ${(x+w-c).toFixed(1)},${y.toFixed(1)} ${(x+w).toFixed(1)},${(y+c).toFixed(1)} ${(x+w).toFixed(1)},${(y+h-c).toFixed(1)} ${(x+w-c).toFixed(1)},${(y+h).toFixed(1)} ${(x+c).toFixed(1)},${(y+h).toFixed(1)} ${x.toFixed(1)},${(y+h-c).toFixed(1)} ${x.toFixed(1)},${(y+c).toFixed(1)}`;
  let s=`<polygon points="${pts}" fill="${frameFill||'#fff'}"/>`;
  const flip=R?` transform="translate(${(2*x+w).toFixed(1)},0) scale(-1,1)"`:'';
  s+=`<image href="${dark?'img/skizze/gw_l.webp':'img/skizze/gw_d.webp'}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"${flip}/>`;
  return s;
}

function sashGriff(open,hinge,gx,sashW,gy,gh,SFR,uu){
  if(open==='fest'||open==='transom') return '';
  const col='#2c3542', sw=Math.max(uu*0.0042,3), R=Math.max(uu*0.016,10);
  if(open==='kipp'){ const cx=gx+sashW/2, cy=gy+SFR*0.6;
    return `<g fill="#fff" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">`
      +`<rect x="${cx-R*0.75}" y="${cy-R*0.75}" width="${R*1.5}" height="${R*1.5}" rx="${R*0.42}"/>`
      +`<rect x="${cx-R*0.32}" y="${cy-R*0.36}" width="${R*2.6}" height="${R*0.72}" rx="${R*0.36}"/>`
      +`<circle cx="${cx}" cy="${cy}" r="${R*0.26}" fill="${col}"/></g>`;
  }
  const griffRight=(hinge==='l'), hx=griffRight?gx+sashW-SFR*0.55:gx+SFR*0.55, my=gy+gh*0.5;
  return `<g fill="#fff" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">`
    +`<rect x="${hx-R*0.75}" y="${my-R*0.75}" width="${R*1.5}" height="${R*1.5}" rx="${R*0.42}"/>`
    +`<rect x="${hx-R*0.36}" y="${my-R*0.32}" width="${R*0.72}" height="${R*2.9}" rx="${R*0.36}"/>`
    +`<circle cx="${hx}" cy="${my}" r="${R*0.26}" fill="${col}"/></g>`;
}

function sashHinges(open,hinge,gx,sashW,gy,gh,SFR,uu){
  if(open==='fest'||open==='transom') return '';
  const col='#5b6672', sw=Math.max(uu*0.0028,2), hw=Math.max(SFR*0.5,uu*0.009), hh=Math.max(gh*0.032,hw*1.2);
  let s='';
  if(open==='kipp'){ const by=gy+gh-hw*0.35;
    [0.22,0.78].forEach(f=>{ const x=gx+sashW*f; s+=`<rect x="${x-hh*0.5}" y="${by-hw*0.5}" width="${hh}" height="${hw}" rx="${hw*0.18}" fill="#fff" stroke="${col}" stroke-width="${sw}"/>`; });
    return s;
  }
  const bx=(hinge==='r')?gx+sashW-SFR*0.35:gx+SFR*0.35;
  [0.12,0.5,0.88].forEach(f=>{ const y=gy+gh*f; s+=`<rect x="${bx-hw*0.5}" y="${y-hh*0.5}" width="${hw}" height="${hh}" rx="${hw*0.18}" fill="#fff" stroke="${col}" stroke-width="${sw}"/>`; });
  return s;
}

function gurtDevice(bMm,rollH,hMm,winY,FR,uu){
  if(S.roll!=='gurt') return '';
  const seite=(S.rollSeite==='links')?'links':'rechts';
  const bx=(seite==='rechts')?bMm-FR*0.5:FR*0.5;
  const bw=Math.max(FR*0.30,uu*0.011), sw=Math.max(uu*0.0009,0.8);
  const bTop=winY+FR*0.2, wy=winY+hMm*0.56, ww=bw*2.5, wh=Math.max(hMm*0.15,ww*1.5);
  let s=`<rect x="${bx-bw/2}" y="${bTop}" width="${bw}" height="${(wy-bTop).toFixed(1)}" fill="#e7e2d6" stroke="rgba(70,64,52,.5)" stroke-width="${sw}"/>`;
  for(let yy=bTop+bw; yy<wy; yy+=bw*0.85) s+=`<line x1="${bx-bw/2}" y1="${yy.toFixed(1)}" x2="${bx+bw/2}" y2="${yy.toFixed(1)}" stroke="rgba(70,64,52,.30)" stroke-width="${sw*0.6}"/>`;
  s+=`<rect x="${bx-ww/2}" y="${wy}" width="${ww}" height="${wh}" rx="${ww*0.18}" fill="url(#gwbody)" stroke="rgba(90,94,100,.65)" stroke-width="${Math.max(uu*0.0013,1.1)}"/>`;
  s+=`<circle cx="${bx}" cy="${wy+wh*0.55}" r="${ww*0.3}" fill="none" stroke="#5a5e64" stroke-width="${Math.max(uu*0.001,0.9)}"/>`;
  s+=`<rect x="${bx-bw*0.6}" y="${wy+wh*0.12}" width="${bw*1.2}" height="${wh*0.13}" rx="${bw*0.3}" fill="rgba(90,94,100,.32)"/>`;
  return s;
}

function skizzeHandle(open,hinge,gx,gy,sashW,gh,SFR,dark){
  if(open==='fest'||open==='transom') return '';
  const griffRight=(hinge==='l');
  const cy=gy+gh*0.5;
  if(S.prod==='haustuer'){
    const img=dark?'img/skizze/klinke-dunkel.webp':'img/skizze/klinke-grau.webp';
    const kH=Math.min(gh*0.12,300*SKZ_K), kW=kH*24/50;
    const x=griffRight ? gx+sashW-SFR*0.35-kW : gx+SFR*0.35;
    const flip=griffRight ? ` transform="translate(${(2*x+kW).toFixed(1)},0) scale(-1,1)"` : '';
    return `<image href="${img}" x="${x.toFixed(1)}" y="${(cy-kH*0.5).toFixed(1)}" width="${kW.toFixed(1)}" height="${kH.toFixed(1)}"${flip}/>`;
  }

  const img=dark?'img/skizze/griff-grau.webp':'img/skizze/griff-dunkel.webp';
  const beschlagFilter=dark?'url(#beschlagdunkel)':'url(#beschlagklar)';

  const hH=Math.min(175, open==='kipp' ? sashW*0.42 : gh*0.34), hW=hH*16/58;
  if(open==='kipp'){ const cx=gx+sashW/2, cy2=gy+SFR*0.95;
    return `<image href="${img}" x="${cx-hH/2}" y="${cy2-hW/2}" width="${hH}" height="${hW}" transform="rotate(90 ${cx} ${cy2})" filter="${beschlagFilter}"/>`; }
  const x=griffRight ? gx+sashW-SFR*0.5-hW*0.5 : gx+SFR*0.5-hW*0.5;
  const gyTop=gy+gh*0.6-hH*0.5;

  const flip=griffRight ? ` transform="translate(${(2*x+hW).toFixed(1)},0) scale(-1,1)"` : '';
  return `<image href="${img}" x="${x.toFixed(1)}" y="${gyTop.toFixed(1)}" width="${hW.toFixed(1)}" height="${hH.toFixed(1)}" filter="${beschlagFilter}"${flip}/>`;
}

function skizzeHinges(open,hinge,gx,gy,sashW,gh,SFR,line){
  if(open==='fest'||open==='transom') return '';
  const sw=Math.max(SFR*0.045,1), bw=Math.max(SFR*0.3,6);
  const box=(x,y,w,h,cells,horiz)=>{ let g=`<g fill="none" stroke="${line}" stroke-width="${sw}" shape-rendering="crispEdges"><rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    for(let k=1;k<cells;k++){ if(horiz){ const xx=x+w*k/cells; g+=`<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y+h}"/>`; } else { const yy=y+h*k/cells; g+=`<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}"/>`; } }
    return g+'</g>'; };
  if(open==='kipp'){ const by=gy+gh-SFR*0.45-bw*0.5; let s='';
    [0.28,0.72].forEach(f=>{ const cx=gx+sashW*f; s+=box(cx-bw*0.85,by,bw*1.7,bw*0.7,2,true); }); return s; }
  const bandRight=(hinge==='r');
  const bx=bandRight ? gx+sashW-SFR*0.34-bw : gx+SFR*0.34;
  const topH=gh*0.075, botH=gh*0.092;
  return box(bx, gy+gh*0.04, bw, topH, 3, false) + box(bx, gy+gh-gh*0.04-botH, bw, botH, 2, false);
}

function skizzeUnterschrift(x, y, breite, DT, aussenSeite){
  var ca = (COLORS_AKT()[S.outer]||{}).n || 'Wei\u00df', ci = (COLORS_AKT()[S.inner]||{}).n || 'Wei\u00df';
  var seite = aussenSeite ? 'Ansicht von au\u00dfen' : 'Ansicht von innen';
  if (SKIZZE_POSNR != null) seite = 'Position ' + SKIZZE_POSNR + '   \u00b7   ' + seite;
  var farben = (ca===ci) ? ('Rahmen ' + ca) : ('au\u00dfen ' + ca + '   \u00b7   innen ' + ci);
  var mitte = x + breite/2;
  return '<text x="'+mitte+'" y="'+y+'" text-anchor="middle" font-family="Inter,Arial" font-weight="700"'

       + ' font-size="'+(DT*1.0)+'" fill="#3f454c">'+seite+'</text>'
       + '<text x="'+mitte+'" y="'+(y+DT*1.35)+'" text-anchor="middle" font-family="Inter,Arial" font-weight="500"'
       + ' font-size="'+(DT*0.85)+'" fill="#666d77">'+farben+'</text>';
}
function flatWindowSVG(isBalkon){
  const bR=Math.max(+S.w||1000,300), hR=Math.max(+S.h||1200,300);
  const av=sketchAussen(), ci=av?S.outer:S.inner;
  const co=COLORS_AKT()[ci], dark=isDarkCol(ci), fCol=co.c;
  const line=dark?'#17181a':'#111';
  const frameStroke=line, miter=line;
  const _gd=dark&&glasHell();
  const GLASS=_gd?'#cdd3d5':'#e4eef6', GLASSST=line, DIN=_gd?'#5e6772':'#8895a4', DIMC='#1e242b', DIML='#565b61';
  const {sashes,stulpAt}=buildSashes(), nFl=sashes.length;
  const hasRoll=(S.roll&&S.roll!=='kein'), rollHR=hasRoll?215:0;
  const alu=isBalkon&&S.balkonSchwelle==='alu', schwHR=alu?60:0;
  const totalHR=rollHR+hR+schwHR;

  const BLATT=1000, k=BLATT/Math.max(bR,totalHR);
  SKZ_K=k;
  const bMm=bR*k, hMm=hR*k, rollH=rollHR*k, schwH=schwHR*k;
  const winY=rollH, totalH=totalHR*k, uu=BLATT;
  const DT=uu*0.05, DW=Math.max(uu*0.0032,2), tick=DT*0.32;

  const _mSeite=(hasRoll?Math.max(uu*0.40,DT*8.0):Math.max(uu*0.24,DT*4.8)),
        mL=_mSeite, mR=_mSeite, mT=Math.max(uu*0.14,DT*2.8), mB=Math.max(uu*0.16,DT*3.2);

  const FR=Math.max(bMm*0.05,42*k), innerW=bMm-2*FR, sashW=innerW/nFl, gy=winY+FR, gh=hMm-2*FR;
  const SFR=Math.max(Math.min(sashW,gh)*0.075,30*k), pzH=hasRoll?Math.max(Math.min(gh*0.11,rollH*0.55),34*k):0;
  const gehr=(x,y,w,h,fr)=>`<g stroke="${miter}" stroke-width="${Math.max(uu*0.0018,1.4)}" stroke-linecap="round"><line x1="${x}" y1="${y}" x2="${x+fr}" y2="${y+fr}"/><line x1="${x+w}" y1="${y}" x2="${x+w-fr}" y2="${y+fr}"/><line x1="${x}" y1="${y+h}" x2="${x+fr}" y2="${y+h-fr}"/><line x1="${x+w}" y1="${y+h}" x2="${x+w-fr}" y2="${y+h-fr}"/></g>`;
  const vt=(x,y,t)=>`<text x="${x}" y="${y}" transform="rotate(-90 ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vth=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="start" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vthEnd=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const ht=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const _hilf=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DIML}" stroke-width="${DW*0.55}" opacity=".5"/>`;
  const hb=(x0,x1,y,von)=>{ const hoch=(von!=null&&y<von), h=(von==null)?'':_hilf(x0,von+(hoch?-tick*0.5:tick*0.5),x0,y+(hoch?-tick:tick))+_hilf(x1,von+(hoch?-tick*0.5:tick*0.5),x1,y+(hoch?-tick:tick));
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/><line x1="${x0}" y1="${y-tick}" x2="${x0}" y2="${y+tick}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/></g>`; };
  const vb=(x,y0,y1,von)=>{ const links=(von!=null&&x<von), h=(von==null)?'':_hilf(von+(links?-tick*0.5:tick*0.5),y0,x+(links?-tick:tick),y0)+_hilf(von+(links?-tick*0.5:tick*0.5),y1,x+(links?-tick:tick),y1);
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><line x1="${x-tick}" y1="${y0}" x2="${x+tick}" y2="${y0}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/></g>`; };
  let s=`<svg viewBox="${-mL} ${-mT} ${bMm+mL+mR} ${totalH+mT+mB+DT*2.9}" role="img" aria-label="${isBalkon?'Balkontür':'Fenster'} ${co.n}, ${av?'Ansicht von außen':'Ansicht von innen'}" preserveAspectRatio="xMidYMid meet">${DEFS}`;
  if(hasRoll){
    s+=`<rect x="0" y="0" width="${bMm}" height="${rollH}" fill="${dark?fCol:'#eaecef'}" stroke="${frameStroke}" stroke-width="${DW}"/>`;

    s+=`<line x1="${bMm*0.03}" y1="${rollH*0.66}" x2="${bMm*0.97}" y2="${rollH*0.66}" stroke="rgba(0,0,0,.10)" stroke-width="${DW*0.6}"/>`;
  }
  s+=`<rect x="0" y="${winY}" width="${bMm}" height="${hMm}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${Math.max(uu*0.004,3)}"/>`+gehr(0,winY,bMm,hMm,FR);
  for(let i=0;i<nFl;i++){
    const gx=FR+i*sashW;
    s+=`<rect x="${gx}" y="${gy}" width="${sashW}" height="${gh}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${DW}"/>`+gehr(gx,gy,sashW,gh,SFR);
    const glx=gx+SFR, gly=gy+SFR, glw=Math.max(sashW-2*SFR,20), glh=Math.max(gh-2*SFR,20);
    s+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${glh}" fill="${GLASS}" stroke="${GLASSST}" stroke-width="${DW}"/>`;

    if(S.sproTyp&&S.sproTyp!=='keine'){
      const sgy1=gly+pzH, sgx1=glx, sgx2=glx+glw, sgy2=gly+glh, r=SPRO_RASTER[S.sproRaster]||SPRO_RASTER.kreuz; let sl='';
      for(let vi=1;vi<=r.v;vi++){ const vx=(sgx1+(sgx2-sgx1)*vi/(r.v+1)).toFixed(1); sl+=`<line x1="${vx}" y1="${sgy1}" x2="${vx}" y2="${sgy2}"/>`; }
      for(let hj=1;hj<=r.h;hj++){ const yy=(sgy1+(sgy2-sgy1)*hj/(r.h+1)).toFixed(1); sl+=`<line x1="${sgx1}" y1="${yy}" x2="${sgx2}" y2="${yy}"/>`; }
      const bw=Math.max(uu*0.007,4);
      if(S.sproTyp==='aufgesetzt') s+=`<g stroke="${miter}" stroke-width="${bw*1.5}" fill="none" stroke-linecap="square">${sl}</g><g stroke="${fCol}" stroke-width="${bw}" fill="none" stroke-linecap="square">${sl}</g>`;
      else s+=`<g stroke="${dark?'rgba(232,240,248,.95)':'rgba(96,116,142,.98)'}" stroke-width="${Math.max(bw*0.62,3)}" fill="none" stroke-linecap="round">${sl}</g>`;
    }
    if(pzH>0){ const pz=(S.panzer!=null?COLORS_ROLL[S.panzer].c:co.c);
      s+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${pzH}" fill="${pz}" stroke="rgba(0,0,0,.2)" stroke-width="${DW*0.6}"/>`;
      const lh=Math.max(pzH/5,10*k); for(let ly=gly+lh; ly<gly+pzH-lh*0.5; ly+=lh) s+=`<line x1="${glx+2}" y1="${ly}" x2="${glx+glw-2}" y2="${ly}" stroke="rgba(0,0,0,.18)" stroke-width="${DW*0.5}"/>`;
     if(S.endleiste!=null){ const eh=Math.max(pzH*0.11,3*k); s+=`<rect x="${glx}" y="${gly+pzH-eh}" width="${glw}" height="${eh}" fill="${COLORS_ROLL[S.endleiste].c}" stroke="rgba(0,0,0,.22)" stroke-width="${DW*0.5}"/>`; }
    }
    const cy=gly+pzH+(glh-pzH)/2;

    s+=`<g stroke="${DIN}" stroke-width="${Math.max(Math.min(glw,glh)*0.006,2.4)}" fill="none" stroke-linejoin="round" stroke-linecap="round">${sashOpenLines(sashes[i].open,sashes[i].hinge,glx,gly+pzH,glx+glw,gly+glh)}</g>`;

    const isStand = stulpAt>0 && sashes[i].open==='dreh' && (i===stulpAt || i===stulpAt-1);
    if(!av){ s+=skizzeHinges(sashes[i].open,sashes[i].hinge,gx,gy,sashW,gh,SFR,line);
      if(!isStand) s+=skizzeHandle(sashes[i].open,sashes[i].hinge,gx,gy,sashW,gh,SFR,dark); }
    if(i>0){ const dx=gx;
      if(stulpAt===i){ s+=`<line x1="${dx}" y1="${gy+4}" x2="${dx}" y2="${gy+gh-4}" stroke="#7b828c" stroke-width="${DW}" stroke-dasharray="${DT*0.2} ${DT*0.12}"/><text x="${dx-DT*0.32}" y="${gy+gh*0.62}" transform="rotate(-90 ${dx-DT*0.32} ${gy+gh*0.62})" text-anchor="middle" font-family="Inter,Arial" font-weight="800" font-size="${DT*0.5}" fill="#7b828c">STULP</text>`; }
      else s+=`<rect x="${dx-SFR*0.5}" y="${gy}" width="${SFR}" height="${gh}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${DW*0.7}"/>`+gehr(dx-SFR*0.5,gy,SFR,gh,SFR*0.5);
    }
  }
  if(hasRoll && S.roll==='gurt' && !av) s+=gurtwicklerDevice(bMm,winY,hMm,FR,uu, dark, fCol);
  if(alu){ const sy=winY+hMm; s+=`<rect x="${-FR*0.3}" y="${sy}" width="${bMm+FR*0.6}" height="${schwH}" rx="${schwH*0.15}" fill="url(#metg)" stroke="${line}" stroke-width="${DW}"/><line x1="0" y1="${sy+schwH*0.55}" x2="${bMm}" y2="${sy+schwH*0.55}" stroke="rgba(28,36,50,.45)" stroke-width="${DW*0.7}"/>`; }

  const dimTot=rollH+hMm, dimTotR=rollHR+hR;
  const topY=-mT*0.5; s+=hb(0,bMm,topY,0)+ht(bMm/2,topY-DT*0.7,bR);
  if(nFl>1){ const botY=totalH+mB*0.42; for(let i=0;i<nFl;i++){ const x0=FR+i*sashW, x1=x0+sashW; s+=hb(x0,x1,botY,totalH)+ht((x0+x1)/2,botY+DT*0.72,Math.round(bR/nFl)); } }
  const rxH=bMm+DT*0.85;
  if(hasRoll){
    s+=vb(rxH,winY,winY+hMm,bMm)+vth(rxH+DT*0.5,winY+hMm/2,hR);
    const lx=-mL*0.34; s+=vb(lx,0,rollH,0)+vthEnd(lx-DT*0.45,rollH/2,rollHR);

    const rxG=bMm+DT*4.5; s+=vb(rxG,0,dimTot,bMm)+vth(rxG+DT*0.5,dimTot/2,dimTotR);
  } else {
    s+=vb(rxH,0,dimTot,bMm)+vth(rxH+DT*0.5,dimTot/2,dimTotR);
  }
  s+=skizzeUnterschrift(0, totalH+mB+DT*0.7, bMm, DT, av);
  return s+`</svg>`;
}
function fensterStageSVG(){ return flatWindowSVG(false); }

function rollStageSVG(){
  const kas=rollKast();
  const bR=+S.w||700, hR=+S.h||600;
  const kastHR=kas.kh, panzHR=Math.max(hR-kastHR, 120);
  const BLATT=1000, k=BLATT/Math.max(bR,hR);
  const bMm=bR*k, totalH=hR*k, kastH=kastHR*k, panzH=panzHR*k;
  const uu=BLATT, DT=uu*0.05, DW=Math.max(uu*0.0032,2), tick=DT*0.32;
  const DIMC='#1e242b', DIML='#565b61';
  const mL=Math.max(uu*0.40,DT*8.0), mR=mL, mT=Math.max(uu*0.14,DT*2.8), mB=Math.max(uu*0.16,DT*3.2);

  const kc=rollFarbe('KastenF'), sc=rollFarbe('Schiene'), pc=rollFarbe('Panzer'), ec=rollEndC();
  const kant=c=>_darkHex(c)?'rgba(255,255,255,.40)':'rgba(30,40,55,.55)';
  const symC=_darkHex(kc)?'#e9edf2':'#3a4756';

  const SW=Math.max(44*k, bMm*0.026);
  const schY=kastH, schH=totalH-kastH;
  const px=SW*0.42, pw=Math.max(bMm-2*SW*0.42, 20);

  let s=`<svg viewBox="${-mL} ${-mT} ${bMm+mL+mR} ${totalH+mT+mB+DT*2.9}" role="img" `
      +`aria-label="Vorsatzrollladen ${bR} mal ${hR} Millimeter, Ansicht von außen" preserveAspectRatio="xMidYMid meet">`;

  s+=`<rect x="${px.toFixed(1)}" y="${kastH.toFixed(1)}" width="${pw.toFixed(1)}" height="${panzH.toFixed(1)}" fill="${pc}" stroke="${kant(pc)}" stroke-width="${(DW*0.8).toFixed(2)}"/>`;
  const lamH=Math.max(37*k, panzH/26), fuge=_darkHex(pc)?'rgba(255,255,255,.28)':'rgba(28,38,54,.32)';
  for(let y=kastH+lamH; y<kastH+panzH-lamH*0.4; y+=lamH)
    s+=`<line x1="${px.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(px+pw).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${fuge}" stroke-width="${(DW*0.55).toFixed(2)}"/>`;
  const elH=Math.max(lamH*1.6, 10*k);
  s+=`<rect x="${px.toFixed(1)}" y="${(totalH-elH).toFixed(1)}" width="${pw.toFixed(1)}" height="${elH.toFixed(1)}" fill="${ec}" stroke="${kant(ec)}" stroke-width="${(DW*0.8).toFixed(2)}"/>`;

  [0, bMm-SW].forEach((x,i)=>{
    s+=`<rect x="${x.toFixed(1)}" y="${schY.toFixed(1)}" width="${SW.toFixed(1)}" height="${schH.toFixed(1)}" fill="${sc}" stroke="${kant(sc)}" stroke-width="${DW.toFixed(2)}"/>`;
    const nx=(i===0)? x+SW*0.66 : x+SW*0.34;
    s+=`<line x1="${nx.toFixed(1)}" y1="${schY.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${totalH.toFixed(1)}" stroke="${kant(sc)}" stroke-width="${(DW*0.6).toFixed(2)}" opacity=".75"/>`;

    const fx=(i===0)? x+SW : x;
    s+=`<line x1="${fx.toFixed(1)}" y1="${schY.toFixed(1)}" x2="${fx.toFixed(1)}" y2="${totalH.toFixed(1)}" stroke="${_darkHex(pc)?'rgba(255,255,255,.42)':'rgba(28,36,50,.34)'}" stroke-width="${(DW*0.6).toFixed(2)}"/>`;
  });

  const rxK=(kas.form==='o')? kastH*0.30 : 0;
  s+=`<rect x="0" y="0" width="${bMm.toFixed(1)}" height="${kastH.toFixed(1)}" rx="${rxK.toFixed(1)}" fill="${kc}" stroke="${kant(kc)}" stroke-width="${Math.max(uu*0.004,3).toFixed(2)}"/>`;
  if(kas.form==='e')
    s+=`<line x1="0" y1="${(kastH*0.20).toFixed(1)}" x2="${bMm.toFixed(1)}" y2="${(kastH*0.20).toFixed(1)}" stroke="${kant(kc)}" stroke-width="${(DW*0.7).toFixed(2)}" opacity=".8"/>`;
  s+=`<line x1="${(bMm*0.02+rxK*0.5).toFixed(1)}" y1="${(kastH*0.72).toFixed(1)}" x2="${(bMm*0.98-rxK*0.5).toFixed(1)}" y2="${(kastH*0.72).toFixed(1)}" stroke="${kant(kc)}" stroke-width="${(DW*0.6).toFixed(2)}" opacity=".6"/>`;

  const links=(S.rlSeite==='links');
  const acx=links? Math.max(bMm*0.13, SW*1.8) : Math.min(bMm*0.87, bMm-SW*1.8), acy=kastH*0.5;
  const ar=Math.min(kastH*0.28, bMm*0.030);
  let pts=[]; const turns=2.4, steps=Math.round(turns*18);
  for(let i=0;i<=steps;i++){ const t=i/steps*turns*2*Math.PI, rr=(ar-DW)*i/steps+DW*0.5;
    pts.push((acx+rr*Math.cos(t)).toFixed(1)+' '+(acy+rr*Math.sin(t)).toFixed(1)); }
  s+=`<circle cx="${acx.toFixed(1)}" cy="${acy.toFixed(1)}" r="${ar.toFixed(1)}" fill="none" stroke="${symC}" stroke-width="${(DW*0.9).toFixed(2)}"/>`
    +`<path d="M${pts.join(' L')}" fill="none" stroke="${symC}" stroke-width="${(DW*0.7).toFixed(2)}"/>`;
  const rx0=links? SW*0.5 : bMm-SW*0.5, ende=kastH+panzH*0.11;
  s+=`<line x1="${rx0.toFixed(1)}" y1="${kastH.toFixed(1)}" x2="${rx0.toFixed(1)}" y2="${ende.toFixed(1)}" stroke="${symC}" stroke-width="${(DW*0.9).toFixed(2)}" stroke-linecap="round"/>`;
  if(S.rlAntrieb==='motor'){
    const pw2=SW*0.78, ph=SW*0.58;
    s+=`<rect x="${(rx0-pw2/2).toFixed(1)}" y="${ende.toFixed(1)}" width="${pw2.toFixed(1)}" height="${ph.toFixed(1)}" rx="${(ph*0.24).toFixed(1)}" fill="#fff" stroke="${symC}" stroke-width="${(DW*0.85).toFixed(2)}"/>`;
  }else if(S.rlAntrieb==='kurbel'){
    s+=`<circle cx="${rx0.toFixed(1)}" cy="${(ende+SW*0.30).toFixed(1)}" r="${(SW*0.30).toFixed(1)}" fill="#fff" stroke="${symC}" stroke-width="${(DW*0.85).toFixed(2)}"/>`;
  }else{
    s+=`<line x1="${(rx0-SW*0.26).toFixed(1)}" y1="${ende.toFixed(1)}" x2="${(rx0+SW*0.26).toFixed(1)}" y2="${ende.toFixed(1)}" stroke="${symC}" stroke-width="${(DW*0.9).toFixed(2)}" stroke-linecap="round"/>`;
  }

  const _hilf=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DIML}" stroke-width="${DW*0.55}" opacity=".5"/>`;
  const hb=(x0,x1,y,von)=>{ const hoch=(von!=null&&y<von), h=(von==null)?'':_hilf(x0,von+(hoch?-tick*0.5:tick*0.5),x0,y+(hoch?-tick:tick))+_hilf(x1,von+(hoch?-tick*0.5:tick*0.5),x1,y+(hoch?-tick:tick));
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/><line x1="${x0}" y1="${y-tick}" x2="${x0}" y2="${y+tick}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/></g>`; };
  const vb=(x,y0,y1,von)=>{ const li=(von!=null&&x<von), h=(von==null)?'':_hilf(von+(li?-tick*0.5:tick*0.5),y0,x+(li?-tick:tick),y0)+_hilf(von+(li?-tick*0.5:tick*0.5),y1,x+(li?-tick:tick),y1);
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><line x1="${x-tick}" y1="${y0}" x2="${x+tick}" y2="${y0}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/></g>`; };
  const ht=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vth=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="start" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vthEnd=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;

  const topY=-mT*0.5; s+=hb(0,bMm,topY,0)+ht(bMm/2,topY-DT*0.7,bR);
  const lx=-mL*0.34; s+=vb(lx,0,kastH,0)+vthEnd(lx-DT*0.45,kastH/2,kastHR);
  const rxH=bMm+DT*0.85; s+=vb(rxH,kastH,totalH,bMm)+vth(rxH+DT*0.5,kastH+panzH/2,panzHR);
  const rxG=bMm+DT*4.5; s+=vb(rxG,0,totalH,bMm)+vth(rxG+DT*0.5,totalH/2,hR);

  const _u=(rollFarbeName('Panzer')===rollFarbeName('KastenF'))
    ? ('Panzer und Kasten '+rollFarbeName('Panzer'))
    : ('Panzer '+rollFarbeName('Panzer')+'   \u00b7   Kasten '+rollFarbeName('KastenF'));
  s+=`<text x="${(bMm/2).toFixed(1)}" y="${(totalH+mB+DT*0.7).toFixed(1)}" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="${(DT*0.62).toFixed(1)}" fill="#6E6A63">Ansicht von au\u00dfen   \u00b7   ${_u}</text>`;
  return s+`</svg>`;
}

const DEFS=`<defs><filter id="beschlagdunkel" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dick"/>
    <feFlood flood-color="#20242a" flood-opacity=".92"/><feComposite in2="dick" operator="in" result="saum"/>
    <feComponentTransfer in="SourceGraphic"><feFuncR type="linear" slope="1.15" intercept="0.06"/><feFuncG type="linear" slope="1.15" intercept="0.06"/><feFuncB type="linear" slope="1.15" intercept="0.06"/></feComponentTransfer>
    <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" flood-color="#000000" flood-opacity=".35" result="griff"/>
    <feMerge><feMergeNode in="saum"/><feMergeNode in="griff"/></feMerge></filter><filter id="beschlagklar" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dick"/>
    <feFlood flood-color="#ffffff" flood-opacity=".97"/><feComposite in2="dick" operator="in" result="saum"/>
    <feComponentTransfer in="SourceGraphic"><feFuncR type="linear" slope="1.22" intercept="-0.14"/><feFuncG type="linear" slope="1.22" intercept="-0.14"/><feFuncB type="linear" slope="1.22" intercept="-0.14"/></feComponentTransfer>
    <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" flood-color="#0b1016" flood-opacity=".30" result="griff"/>
    <feMerge><feMergeNode in="saum"/><feMergeNode in="griff"/></feMerge></filter><filter id="inoxklar" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feComponentTransfer><feFuncR type="linear" slope="1.30" intercept="-0.12"/><feFuncG type="linear" slope="1.30" intercept="-0.12"/><feFuncB type="linear" slope="1.30" intercept="-0.12"/></feComponentTransfer>
    <feDropShadow dx="0" dy="2.2" stdDeviation="2.6" flood-color="#0b1016" flood-opacity=".38"/></filter><linearGradient id="glassg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcebf6"/><stop offset="1" stop-color="#dcebf6"/></linearGradient>
  <linearGradient id="reflg" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0" stop-color="#ffffff" stop-opacity=".20"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="metg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3f5f7"/><stop offset=".45" stop-color="#d3d8de"/><stop offset=".55" stop-color="#c7cdd4"/><stop offset="1" stop-color="#e6e9ed"/></linearGradient>
  <linearGradient id="metv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f5f7"/><stop offset=".5" stop-color="#cfd4da"/><stop offset="1" stop-color="#e6e9ed"/></linearGradient>
  <linearGradient id="boxsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <linearGradient id="pzsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  <linearGradient id="hros" x1="0" y1="0" x2="1" y2="0.15"><stop offset="0" stop-color="#fdfdfe"/><stop offset=".28" stop-color="#dfe3e8"/><stop offset=".55" stop-color="#aeb5bf"/><stop offset=".8" stop-color="#cbd0d7"/><stop offset="1" stop-color="#8d949e"/></linearGradient>
  <radialGradient id="hknob" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#dfe3e8"/><stop offset=".75" stop-color="#a7aeb8"/><stop offset="1" stop-color="#767d88"/></radialGradient>
  <linearGradient id="hlev" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f959f"/><stop offset=".22" stop-color="#eef1f4"/><stop offset=".5" stop-color="#c3c9d1"/><stop offset=".78" stop-color="#f4f6f8"/><stop offset="1" stop-color="#868d97"/></linearGradient>
  <linearGradient id="gwbody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9cdd3"/><stop offset=".18" stop-color="#eef0f2"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".82" stop-color="#e6e8eb"/><stop offset="1" stop-color="#c4c8ce"/></linearGradient>
  <linearGradient id="halu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#aeb3ba"/><stop offset=".3" stop-color="#eceef1"/><stop offset=".55" stop-color="#d3d7dc"/><stop offset="1" stop-color="#a7acb3"/></linearGradient>
  <linearGradient id="doorbg" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#eff3f8"/><stop offset="1" stop-color="#dde5ee"/></linearGradient>
  <filter id="hblur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>`;
function dimsRight(x,y1,y2,val){return `<g stroke="#b3b0a8" stroke-width="1" fill="none"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x-4}" y1="${y1}" x2="${x+4}" y2="${y1}"/><line x1="${x-4}" y1="${y2}" x2="${x+4}" y2="${y2}"/></g><text x="${x+6}" y="${(y1+y2)/2}" text-anchor="start" dominant-baseline="central" font-size="12" fill="#6E6A63" font-family="Inter" font-weight="600">${val} mm</text>`;}
function dimsBottom(x1,x2,y,val){return `<g stroke="#b3b0a8" stroke-width="1" fill="none"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y-4}" x2="${x1}" y2="${y+4}"/><line x1="${x2}" y1="${y-4}" x2="${x2}" y2="${y+4}"/></g><text x="${(x1+x2)/2}" y="${y+17}" text-anchor="middle" font-size="12" fill="#6E6A63" font-family="Inter" font-weight="600">${val} mm</text>`;}

function balkonStageSVG(){ return flatWindowSVG(true); }

function slidePanel(x,y,w,h,type,dir,ctx,num,sys){
  const {co,edge,seal}=ctx; const line='#2c3542';
  const ins=Math.min(11,Math.round(w*0.06));
  const gx1=x+ins,gy1=y+ins,gx2=x+w-ins,gy2=y+h-ins, cx=(gx1+gx2)/2, cy=(gy1+gy2)/2;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${co.c}" stroke="${edge}" stroke-width="1.1"/>`;
  s+=`<rect x="${gx1}" y="${gy1}" width="${gx2-gx1}" height="${gy2-gy1}" fill="#dcebf6" stroke="#8fa8bd" stroke-width="1"/>`;
  const showNum = num && !(sys==='psk' && type==='schiebe');

  if(type==='schiebe'){

    if(sys==='psk'){
      s+=`<path d="M${gx1+9} ${gy2-26} L${cx} ${gy1+8} L${gx2-9} ${gy2-26}" stroke="${line}" stroke-width="1.6" fill="none" stroke-linejoin="round"/>`;
    }
    const ay = sys==='psk'? cy+16 : cy;
    const ax1=cx-(gx2-gx1)*0.20, ax2=cx+(gx2-gx1)*0.20;
    const head = dir==='l'
      ? `<polyline points="${ax1+8},${ay-6} ${ax1},${ay} ${ax1+8},${ay+6}" fill="none" stroke="${line}" stroke-width="1.6"/>`
      : `<polyline points="${ax2-8},${ay-6} ${ax2},${ay} ${ax2-8},${ay+6}" fill="none" stroke="${line}" stroke-width="1.6"/>`;
    s+=`<line x1="${ax1}" y1="${ay}" x2="${ax2}" y2="${ay}" stroke="${line}" stroke-width="1.6"/>${head}`;
  } else {
    const cs=11; s+=`<path d="M${cx-cs} ${cy} L${cx+cs} ${cy} M${cx} ${cy-cs} L${cx} ${cy+cs}" stroke="${line}" stroke-width="1.5" fill="none"/>`;
  }
  return s;
}

function schiebeStageSVG(){
  const bR=Math.max(+S.w||2000,600), hR=Math.max(+S.h||2000,600);
  const av=sketchAussen(), ci=av?S.outer:S.inner;
  const co=COLORS_AKT()[ci], dark=isDarkCol(ci), fCol=co.c;
  const frameStroke=dark?'rgba(255,255,255,.42)':'#333940', miter=dark?shade(fCol,30):'#333940';
  const GLASS='#e4eef6', GLASSST='#8ea4b6', DIN='#8895a4', DIMC='#1e242b', DIML='#565b61';
  const sys=S.hstSystem||'psk', n=(sys==='psk')?2:((S.hstTeilung==='3')?3:2), slideIdx=(S.hstLauf==='links')?0:n-1;
  const hasRoll=(S.roll&&S.roll!=='kein'), rollHR=hasRoll?215:0, totalHR=rollHR+hR;

  const BLATT=1000, k=BLATT/Math.max(bR,totalHR);
  SKZ_K=k;
  const bMm=bR*k, hMm=hR*k, rollH=rollHR*k, winY=rollH, totalH=totalHR*k, uu=BLATT;
  const DT=uu*0.05, DW=Math.max(uu*0.0032,2), tick=DT*0.32;

  const _mSeite=(hasRoll?Math.max(uu*0.40,DT*8.0):Math.max(uu*0.24,DT*4.8)),
        mL=_mSeite, mR=_mSeite, mT=Math.max(uu*0.14,DT*2.8), mB=Math.max(uu*0.16,DT*3.2);
  const FR=Math.max(Math.min(bMm,hMm)*0.05,40*k), innerW=bMm-2*FR, pw=innerW/n, gy=winY+FR, gh=hMm-2*FR;
  const SFR=Math.max(Math.min(pw,gh)*0.05,22*k), pzH=hasRoll?Math.max(Math.min(gh*0.11,rollH*0.55),34*k):0;
  const gehr=(x,y,w,h,fr)=>`<g stroke="${miter}" stroke-width="${Math.max(uu*0.0018,1.4)}" stroke-linecap="round"><line x1="${x}" y1="${y}" x2="${x+fr}" y2="${y+fr}"/><line x1="${x+w}" y1="${y}" x2="${x+w-fr}" y2="${y+fr}"/><line x1="${x}" y1="${y+h}" x2="${x+fr}" y2="${y+h-fr}"/><line x1="${x+w}" y1="${y+h}" x2="${x+w-fr}" y2="${y+h-fr}"/></g>`;
  const vt=(x,y,t)=>`<text x="${x}" y="${y}" transform="rotate(-90 ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vth=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="start" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vthEnd=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const ht=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const _hilf=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DIML}" stroke-width="${DW*0.55}" opacity=".5"/>`;
  const hb=(x0,x1,y,von)=>{ const hoch=(von!=null&&y<von), h=(von==null)?'':_hilf(x0,von+(hoch?-tick*0.5:tick*0.5),x0,y+(hoch?-tick:tick))+_hilf(x1,von+(hoch?-tick*0.5:tick*0.5),x1,y+(hoch?-tick:tick));
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/><line x1="${x0}" y1="${y-tick}" x2="${x0}" y2="${y+tick}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/></g>`; };
  const vb=(x,y0,y1,von)=>{ const links=(von!=null&&x<von), h=(von==null)?'':_hilf(von+(links?-tick*0.5:tick*0.5),y0,x+(links?-tick:tick),y0)+_hilf(von+(links?-tick*0.5:tick*0.5),y1,x+(links?-tick:tick),y1);
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><line x1="${x-tick}" y1="${y0}" x2="${x+tick}" y2="${y0}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/></g>`; };
  let s=`<svg viewBox="${-mL} ${-mT} ${bMm+mL+mR} ${totalH+mT+mB+DT*2.9}" role="img" aria-label="Schiebetür ${co.n}, ${av?'Ansicht von außen':'Ansicht von innen'}" preserveAspectRatio="xMidYMid meet">${DEFS}`;
  if(hasRoll){ s+=`<rect x="0" y="0" width="${bMm}" height="${rollH}" fill="${dark?fCol:'#eaecef'}" stroke="${frameStroke}" stroke-width="${DW}"/><line x1="${bMm*0.03}" y1="${rollH*0.66}" x2="${bMm*0.97}" y2="${rollH*0.66}" stroke="rgba(0,0,0,.10)" stroke-width="${DW*0.6}"/>`; }
  s+=`<rect x="0" y="${winY}" width="${bMm}" height="${hMm}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${Math.max(uu*0.004,3)}"/>`+gehr(0,winY,bMm,hMm,FR);
  for(let i=0;i<n;i++){
    const gx=FR+i*pw;
    s+=`<rect x="${gx}" y="${gy}" width="${pw}" height="${gh}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${DW}"/>`+gehr(gx,gy,pw,gh,SFR);
    const glx=gx+SFR, gly=gy+SFR, glw=Math.max(pw-2*SFR,20), glh=Math.max(gh-2*SFR,20), cx=glx+glw/2, cyy=gly+glh/2;
    s+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${glh}" fill="${GLASS}" stroke="${GLASSST}" stroke-width="${DW}"/>`;
    if(pzH>0){ const pz=(S.panzer!=null?COLORS_ROLL[S.panzer].c:co.c); s+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${pzH}" fill="${pz}" stroke="rgba(0,0,0,.2)" stroke-width="${DW*0.6}"/>`; const lh=Math.max(pzH/5,10*k); for(let ly=gly+lh; ly<gly+pzH-lh*0.5; ly+=lh) s+=`<line x1="${glx+2}" y1="${ly}" x2="${glx+glw-2}" y2="${ly}" stroke="rgba(0,0,0,.18)" stroke-width="${DW*0.5}"/>`; if(S.endleiste!=null){ const eh=Math.max(pzH*0.11,3*k); s+=`<rect x="${glx}" y="${gly+pzH-eh}" width="${glw}" height="${eh}" fill="${COLORS_ROLL[S.endleiste].c}" stroke="rgba(0,0,0,.22)" stroke-width="${DW*0.5}"/>`; } }
    const isSlide=(i===slideIdx), dir=(cx<bMm/2)?'r':'l', SW=Math.max(Math.min(glw,glh)*0.012,4);
    if(isSlide){
      if(sys==='psk'){ s+=`<path d="M${glx+glw*0.28} ${gly+pzH+(glh-pzH)*0.70} L${cx} ${gly+pzH+(glh-pzH)*0.34} L${glx+glw*0.72} ${gly+pzH+(glh-pzH)*0.70}" stroke="${DIN}" stroke-width="${SW*0.9}" fill="none" stroke-linejoin="round"/>`; }
      const ay=cyy+(sys==='psk'?glh*0.10:0), ah=glw*0.20;
      const head=dir==='l'?`<polyline points="${cx-ah+ah*0.5},${ay-ah*0.35} ${cx-ah},${ay} ${cx-ah+ah*0.5},${ay+ah*0.35}" fill="none" stroke="${DIN}" stroke-width="${SW}" stroke-linejoin="round"/>`:`<polyline points="${cx+ah-ah*0.5},${ay-ah*0.35} ${cx+ah},${ay} ${cx+ah-ah*0.5},${ay+ah*0.35}" fill="none" stroke="${DIN}" stroke-width="${SW}" stroke-linejoin="round"/>`;
      s+=`<line x1="${cx-ah}" y1="${ay}" x2="${cx+ah}" y2="${ay}" stroke="${DIN}" stroke-width="${SW}"/>${head}`;
      const ge=(cx<bMm/2)?glx+SFR*0.6:glx+glw-SFR*0.6, gr=Math.max(glh*0.14,SFR*1.2);
      s+=`<rect x="${ge-SW*1.4}" y="${cyy-gr}" width="${SW*2.8}" height="${gr*2}" rx="${SW*1.4}" fill="#fff" stroke="${DIN}" stroke-width="${SW}"/>`;
      s+=`<text x="${cx}" y="${gly+pzH+(glh-pzH)*(sys==='psk'?0.80:0.66)}" text-anchor="middle" dominant-baseline="hanging" font-family="Inter,Arial" font-weight="600" font-size="${DT*0.58}" fill="${DIML}">${sys==='psk'?'schiebt und kippt':'schiebt'}</text>`;
    } else {
      const cs=Math.min(glw,glh)*0.14; s+=`<path d="M${cx-cs} ${cyy} L${cx+cs} ${cyy} M${cx} ${cyy-cs} L${cx} ${cyy+cs}" stroke="${DIN}" stroke-width="${SW}" fill="none"/>`;
      s+=`<text x="${cx}" y="${cyy+cs*2.4}" text-anchor="middle" dominant-baseline="hanging" font-family="Inter,Arial" font-weight="600" font-size="${DT*0.58}" fill="${DIML}">fest</text>`;
    }
    if(i>0){ const dx=gx; s+=`<rect x="${dx-SFR*0.5}" y="${gy}" width="${SFR}" height="${gh}" fill="${fCol}" stroke="${frameStroke}" stroke-width="${DW*0.7}"/>`+gehr(dx-SFR*0.5,gy,SFR,gh,SFR*0.5); }
  }

  const dimTot=rollH+hMm, dimTotR=rollHR+hR, topY=-mT*0.5; s+=hb(0,bMm,topY,0)+ht(bMm/2,topY-DT*0.7,bR);
  { const botY=totalH+mB*0.42; for(let i=0;i<n;i++){ const x0=FR+i*pw, x1=x0+pw; s+=hb(x0,x1,botY,totalH)+ht((x0+x1)/2,botY+DT*0.72,Math.round(bR/n)); } }
  const rxH=bMm+DT*0.85;
  if(hasRoll){
    s+=vb(rxH,winY,winY+hMm,bMm)+vth(rxH+DT*0.5,winY+hMm/2,hR);
    const lx=-mL*0.34; s+=vb(lx,0,rollH,0)+vthEnd(lx-DT*0.45,rollH/2,rollHR);

    const rxG=bMm+DT*4.5; s+=vb(rxG,0,dimTot,bMm)+vth(rxG+DT*0.5,dimTot/2,dimTotR);
  } else {
    s+=vb(rxH,0,dimTot,bMm)+vth(rxH+DT*0.5,dimTot/2,dimTotR);
  }
  s+=skizzeUnterschrift(0, totalH+mB+DT*0.7, bMm, DT, av);
  return s+`</svg>`;
}
const DOOR_MOTIFS={'alaska-1-inox':1,'alaska-2-inox':1,'colorado-inox':1,'florida-lr-inox':1,'montana-1-inox':1,'montana-2-lr-inox':1,'montana-3-lr-inox':1,'nebraska-lcr-inox':1,'ohio-inox':1,'pennsylvania-1-inox':1,'pennsylvania-2-lr-inox':1,'pennsylvania-3-lr-inox':1,'texas-c-inox':1,'texas-lr-inox':1};

function haustuerStageSVG(){

  const einzel = (ANSICHT_ERZWUNGEN !== null);
  const nurAussen = einzel ? (TUER_SEITE_ERZWUNGEN !== null ? TUER_SEITE_ERZWUNGEN : (S.tuerOeffnung==='aussen')) : false;
  const key=S.doorModel||'nebraska-lcr-inox';
  const bR=Math.max(+S.w||1100,400), hR=Math.max(+S.h||2100,900);
  const DIMC='#1e242b', DIML='#565b61';

  const ansichten = einzel ? 1 : 2;

  const gapR=einzel?0:bR*0.30, totalWR=bR*ansichten+gapR;
  const BLATT=1000, k=BLATT/Math.max(totalWR,hR);
  SKZ_K=k;
  const bMm=bR*k, hMm=hR*k, gap=gapR*k, totalW=totalWR*k, uu=BLATT;
  const DT=uu*0.05, DW=Math.max(uu*0.0032,2), tick=DT*0.32;
  const LBL=DT*0.78;
  const LBL2=DT*0.62;

  const mR=DT*2.1, mL=mR, mT=DT*2.7;
  const mB=einzel?DT*3.1:DT*3.7;
  const FR=Math.max(bMm*0.06,64*k), gx=FR, gy=FR, sashW=bMm-2*FR, gh=hMm-2*FR;
  const SFR=Math.max(Math.min(sashW,gh)*0.06,40*k);
  const glx=gx+SFR, gly=gy+SFR, glw=Math.max(sashW-2*SFR,20), glh=Math.max(gh-2*SFR,20);
  const _hilf=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DIML}" stroke-width="${DW*0.55}" opacity=".5"/>`;
  const hb=(x0,x1,y,von)=>{ const hoch=(von!=null&&y<von), h=(von==null)?'':_hilf(x0,von+(hoch?-tick*0.5:tick*0.5),x0,y+(hoch?-tick:tick))+_hilf(x1,von+(hoch?-tick*0.5:tick*0.5),x1,y+(hoch?-tick:tick));
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/><line x1="${x0}" y1="${y-tick}" x2="${x0}" y2="${y+tick}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/></g>`; };
  const vb=(x,y0,y1,von)=>{ const links=(von!=null&&x<von), h=(von==null)?'':_hilf(von+(links?-tick*0.5:tick*0.5),y0,x+(links?-tick:tick),y0)+_hilf(von+(links?-tick*0.5:tick*0.5),y1,x+(links?-tick:tick),y1);
    return h+`<g stroke="${DIML}" stroke-width="${DW}" fill="none"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><line x1="${x-tick}" y1="${y0}" x2="${x+tick}" y2="${y0}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/></g>`; };
  const ht=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const vt=(x,y,t)=>`<text x="${x}" y="${y}" transform="rotate(-90 ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="700" font-size="${DT}" fill="${DIMC}">${t}</text>`;
  const lbl=(x,y,t,soft,farbe)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial" font-weight="${soft?500:700}" font-size="${soft?LBL2:LBL}" fill="${farbe||(soft?DIML:DIMC)}">${t}</text>`;

  const dinLinks=(S.opening==='dkl');
  const griffAussen=_griffAussenVal();

  function ansicht(ox,aussen){
    const ci=aussen?S.outer:S.inner, co=COLORS_AKT()[ci], dark=isDarkCol(ci), fCol=co.c;
    const line=dark?'#17181a':'#111';
    const _gd=dark&&glasHell();
    const GLASS=_gd?'#cdd3d5':'#e4eef6', DIN=_gd?'#5e6772':'#8895a4';
    const hinge=aussen ? (dinLinks?'r':'l') : (dinLinks?'l':'r');
    const handleSide=(hinge==='r')?'l':'r';
    const gehr=(x,y,w,h,fr)=>`<g stroke="${line}" stroke-width="${Math.max(uu*0.0018,1.4)}" stroke-linecap="round"><line x1="${x}" y1="${y}" x2="${x+fr}" y2="${y+fr}"/><line x1="${x+w}" y1="${y}" x2="${x+w-fr}" y2="${y+fr}"/><line x1="${x}" y1="${y+h}" x2="${x+fr}" y2="${y+h-fr}"/><line x1="${x+w}" y1="${y+h}" x2="${x+w-fr}" y2="${y+h-fr}"/></g>`;
    let g=`<g transform="translate(${ox},0)">`;

    g+=`<rect x="0" y="0" width="${bMm}" height="${hMm}" fill="${fCol}" stroke="${line}" stroke-width="${Math.max(uu*0.004,3)}"/>`+gehr(0,0,bMm,hMm,FR);
    g+=`<rect x="${gx}" y="${gy}" width="${sashW}" height="${gh}" fill="${fCol}" stroke="${line}" stroke-width="${DW}"/>`+gehr(gx,gy,sashW,gh,SFR);

    const INOX=dark?'#9fa7ae':'#b2bbc3';
    const flip=aussen?'':` transform="translate(${(2*glx+glw).toFixed(1)},0) scale(-1,1)"`;
    const rEin=Math.max(SFR*0.28,uu*0.007);
    if(key==='vollglas-inox'){

      g+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${glh}" fill="${INOX}" stroke="${line}" stroke-width="${DW}"/>`
        +`<rect x="${glx+rEin}" y="${gly+rEin}" width="${Math.max(glw-2*rEin,4)}" height="${Math.max(glh-2*rEin,4)}" fill="${GLASS}" stroke="${line}" stroke-width="${DW*0.7}"/>`;
    } else if(key==='halbglas-inox'){

      const ghOben=glh*0.54;
      g+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${glh}" fill="${fCol}" stroke="${line}" stroke-width="${DW}"/>`
        +`<rect x="${glx}" y="${gly}" width="${glw}" height="${ghOben}" fill="${INOX}" stroke="${line}" stroke-width="${DW}"/>`
        +`<rect x="${glx+rEin}" y="${gly+rEin}" width="${Math.max(glw-2*rEin,4)}" height="${Math.max(ghOben-2*rEin,4)}" fill="${GLASS}" stroke="${line}" stroke-width="${DW*0.7}"/>`;
    } else {

      g+=`<rect x="${glx}" y="${gly}" width="${glw}" height="${glh}" fill="${fCol}" stroke="${line}" stroke-width="${DW}"/>`;
      if(DOOR_MOTIFS[key]) g+=`<image href="img/tuer-motive/${key}.png" x="${glx}" y="${gly}" width="${glw}" height="${glh}" preserveAspectRatio="xMidYMid meet" filter="url(#inoxklar)"${flip}/>`;
    }

    g+=`<g stroke="${DIN}" stroke-width="${Math.max(Math.min(glw,glh)*0.006,2.4)}" fill="none" stroke-linejoin="round" stroke-linecap="round">${sashOpenLines('dreh',hinge,glx,gly,glx+glw,gly+glh)}</g>`;
    g+=skizzeHinges('dreh',hinge,gx,gy,sashW,gh,SFR,line);

    const holmX=(handleSide==='r')? gx+sashW-SFR*0.5 : gx+SFR*0.5;
    const cyH=Math.max(gy+SFR*1.6, Math.min(gy+gh-SFR*1.6, hMm-1050*k));
    const hw=Math.max(uu*0.0032,2.2);
    const art=aussen?griffAussen:'klinke';
    if(art==='knauf'){
      const R=Math.max(SFR*0.5,uu*0.014);
      g+=`<circle cx="${holmX}" cy="${cyH}" r="${R}" fill="#fff" stroke="${line}" stroke-width="${hw}"/><circle cx="${holmX}" cy="${cyH}" r="${R*0.3}" fill="${line}"/>`;
    } else if(art==='stoss'){
      const bw=Math.max(SFR*0.42,uu*0.011);
      g+=`<rect x="${holmX-bw/2}" y="${gy+gh*0.24}" width="${bw}" height="${gh*0.52}" rx="${bw*0.5}" fill="#fff" stroke="${line}" stroke-width="${hw}"/>`;
    } else {
      const dir=(handleSide==='r')?-1:1;
      const shH=Math.max(gh*0.11,uu*0.075), shW=Math.max(SFR*0.7,uu*0.016), lev=Math.max(glw*0.16,uu*0.05), lT=Math.max(shW*0.42,uu*0.007);
      g+=`<rect x="${holmX-shW/2}" y="${cyH-shH/2}" width="${shW}" height="${shH}" rx="${shW*0.42}" fill="#fff" stroke="${line}" stroke-width="${hw}"/>`
        +`<rect x="${dir<0?holmX-lev:holmX}" y="${cyH-lT/2}" width="${lev}" height="${lT}" rx="${lT*0.5}" fill="#fff" stroke="${line}" stroke-width="${hw}"/>`
        +`<circle cx="${holmX}" cy="${cyH}" r="${lT*0.7}" fill="${line}"/>`;
    }
    return g+`</g>`;
  }

  const nachAussen=(S.tuerOeffnung==='aussen');

  const titel = einzel
    ? (nurAussen?'Ansicht von außen':'Ansicht von innen')
    : 'Ansicht von außen und innen';
  let s=`<svg viewBox="${-mL} ${-mT} ${totalW+mL+mR} ${hMm+mT+mB}" role="img" aria-label="Haustür-Skizze ${DOORN[key]||''} — ${titel}" preserveAspectRatio="xMidYMid meet">${DEFS}`;
  s+= einzel ? ansicht(0,nurAussen) : (ansicht(0,true)+ansicht(bMm+gap,false));

  const topY=-mT*0.5; s+=hb(0,bMm,topY,0)+ht(bMm/2,topY-DT*0.72,bR);
  const rxH=totalW+DT*0.9; s+=vb(rxH,0,hMm,totalW)+vt(rxH+DT*0.62,hMm/2,hR);

  const ly=hMm+LBL*1.5, ly2=ly+LBL*1.25;
  if(einzel){

    var _ca=(COLORS_AKT()[S.outer]||{}).n||'Weiß', _ci=(COLORS_AKT()[S.inner]||{}).n||'Weiß';
    s+=lbl(bMm/2,ly,titel)+lbl(bMm/2,ly2,(_ca===_ci)?('Rahmen '+_ca):('außen '+_ca+'   ·   innen '+_ci),1);
  } else {
    s+=lbl(bMm/2,ly,'Ansicht von außen')+lbl(bMm/2,ly2,GRIFFT[griffAussen]||'Griff',1);
    s+=lbl(bMm+gap+bMm/2,ly,'Ansicht von innen')+lbl(bMm+gap+bMm/2,ly2,'Drückergarnitur · DIN '+(dinLinks?'links':'rechts'),1);

    s+=lbl(totalW/2,ly2+LBL2*1.6,
        nachAussen?'Öffnet nach außen · DIN von außen bestimmt':'Öffnet nach innen',1);
  }
  return s+`</svg>`;
}

const COLIMG={weiss:'weiss',anthrazit:'anthrazit','anthraz-gl':'anthraz-gl',cremeweiss:'cremeweiss','weiss-fx':'weiss-fx',lichtgrau:'lichtgrau'};
function stageHTML(){
  return `<img class="stageimg" src="img/fenster/${COLIMG[(COLORS_AKT()[S.outer]||{}).key]||(isDarkCol(S.outer)?'anthrazit':'weiss')}.webp" alt="Fenster ${COLORS_AKT()[S.outer].n}">
    <div class="stagedim">${AUFTN[S.aufteilung]} · ${OPEN[S.opening]}<br>${S.w} × ${S.h} mm · Außen ${COLORS_AKT()[S.outer].n}</div>`;
}

var LS={};
function _lp_unserPreis(){ return null; }
function _lp_interp1(){ return null; }
function _lp_matLookup(){ return null; }
const _lp_FMAT_B=[], _lp_FMAT_H=[400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700];
const _lp_FMAT=[];
function _lp_fensterMatrix(){ return null; }
const _lp_FESTG=[];
const _lp_FESTMAT=[];
function _lp_fensterFestMatrix(){ return null; }
const _lp_3FL_B=[], _lp_3FL_H=[600,700,800,900,1000,1200,1400,1600];
const _lp_3FL_M=[];
const _lp_2FL_B=[], _lp_2FL_H=[600,700,800,900,1000,1200,1400,1500,1600];
const _lp_2FL_P=[];
const _lp_2FL_S=[];
function _lp_fluegelFaktor(){ return null; }
const _lp_F_OEFF={};
const _lp_F_GRIFF={};
const _lp_F_SCHALL={};
const _lp_F_SICHERGLAS={};
const _lp_F_SICHER={}; const _lp_SICH_B=[], _lp_SICH_H=[600,900,1200,1500,1800]; const _lp_SICH_M=[];   function _lp_sicherFenster(){ return null; }
const _lp_F_SPRO={};
const _lp_PROFIL_PCT={};
function _lp_griffLockAdd(){ return null; }
function _lp_rolladenDelta(){ return null; }
function _lp_glasOptDelta(){ return null; }

function _lp_farbPremDelta(){ return null; }
const _lp_REINF_B=[], _lp_REINF_H=[400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700];
const _lp_REINF=[];
function _lp_reinfDelta(){ return null; }
const _lp_R2_B=[], _lp_R2_H=[500,600,700,800,900,1000];
const _lp_R2P=[];
const _lp_R2S=[];
const _lp_RF3_B=[], _lp_RF3_H=[600,700,800,900,1000,1200,1400,1600];
const _lp_RF3=[];
function _lp_reinfMF(){ return null; }
function _lp_fenster(){ return null; }
const _lp_BLK_B1=[], _lp_BLK_H1=[1700,2000,2300];
const _lp_BLK_M1=[];
const _lp_BLK_B2=[], _lp_BLK_H2=[1800,2000,2300];
const _lp_BLK_M2=[];
function _lp_balkon(){ return null; }
const _lp_PSK_B=[], _lp_PSK_H=[1800,1900,2000,2100,2200,2300,2400];
const _lp_PSK_M=[];
const _lp_HS_B=[], _lp_HS_H=[1900,2100,2300,2400];
const _lp_HS_M=[];
function _lp_hstRolladenDelta(){ return null; }
function _lp_hst(){ return null; }
const _lp_HT_B=[], _lp_HT_H=[2028,2200,2398];
const _lp_HT_M=[];
const _lp_HT_MODELL={};
function _lp_haustuer(){ return null; }

function _haFlaecheAusS(){
  if(S.aufteilung==='3fl') return 'f3';
  if(S.aufteilung==='2fl'){
    const set=(typeof anschlagSet==='function')?anschlagSet():[];
    const a=set[S.anschlagIdx];
    return (a&&a.stulpAt!=null)?'s2':'p2';
  }
  const set=(typeof anschlagSet==='function')?anschlagSet():[];
  const a=set[S.anschlagIdx], oe=(a&&a.oeff&&a.oeff[0])||'dk-r';
  if(oe==='fest') return 'fest';
  if(oe==='kipp') return 'kipp';
  if(oe==='dreh-l'||oe==='dreh-r') return 'dreh';
  return 'dk';
}
function massLimits(){

  if(S.prod==='balkon') return {bMin:600,bMax:2500,hMin:1800,hMax:2400};
  if(S.prod==='haustuer') return {bMin:800,bMax:1400,hMin:1800,hMax:2400};
  if(S.prod==='schiebe') return {bMin:1800,bMax:6500,hMin:1800,hMax:2600};

  if(S.prod==='rollladen') return {bMin:900,bMax:2600,hMin:900,hMax:2700};
  return _massEigen();
}

function _massEigen(){
  const sash=parseInt(S.aufteilung)||1;

  if(typeof istExt==='function' && istExt()){
    const b=(sash>=3)?[1700,3600]:(sash===2?[1150,2800]:[600,1500]);
    return {bMin:b[0],bMax:b[1],hMin:(sash>=3?450:500),hMax:1700};
  }
  const bMin=sash>=3?1200:(sash===2?800:500), bMax=sash>=3?4000:(sash===2?2700:1500);
  let hMin=500,hMax=1900; if(S.aufteilung==='ol'){ hMin=900; hMax=2400; }

  try{
    const a=(typeof curAnschlag==='function')?curAnschlag():null;
    if(a && a.oeff && a.oeff.length===1 && a.oeff[0]==='kipp'){ hMax=Math.min(hMax,1000); }
  }catch(e){}
  return {bMin,bMax,hMin,hMax};
}

function massKlemmen(){
  const L=massLimits(), w=+S.w||0, h=+S.h||0;
  if(w<L.bMin||w>L.bMax) S.w=Math.min(Math.max(w||L.bMin,L.bMin),L.bMax);
  if(h<L.hMin||h>L.hMax) S.h=Math.min(Math.max(h||L.hMin,L.hMin),L.hMax);
}
function massOk(){ const L=massLimits(),b=+S.w||0,h=+S.h||0; return b>=L.bMin&&b<=L.bMax&&h>=L.hMin&&h<=L.hMax; }

var _MARGE=0;

var _PF={};
var _PF_HOLZ=[];
function _pfLook(){ return null; }

const _EDGE={};
function _edgeLook(){ return null; }

function _edgeFenTeil(){ return null; }

function _holzaluKey(){ return null; }

function _holzaluFlaeche(L){
  var fl=L.fluegel, oe=L.oeff1;
  if(fl==='stulp') return 's2';
  if((''+fl).charAt(0)==='2') return 'p2';
  if((''+fl).charAt(0)==='3') return 'f3';
  if(oe==='fest') return 'fest';
  if(oe==='kipp') return 'kipp';
  if(oe==='dreh-l'||oe==='dreh-r') return 'dreh';
  return 'dk';
}

function _holzaluLook(t,b,h){
  if(!t) return null;
  var W=t.W, H=t.H, M=t.M;
  var _u=(b<W[0]||h<H[0]), _o=(b>W[W.length-1]||h>H[H.length-1]);
  var _fb=b, _fh=h;
  if(_u){ b=Math.max(b,W[0]); h=Math.max(h,H[0]); }
  if(_o){ b=Math.min(b,W[W.length-1]); h=Math.min(h,H[H.length-1]); }
  function idx(a,v){ for(var i=0;i<a.length-1;i++){ if(v<=a[i+1]) return i; } return a.length-2; }
  var i=idx(W,b), j=idx(H,h);
  var w0=W[i],w1=W[i+1],h0=H[j],h1=H[j+1];
  var q11=M[j][i],q21=M[j][i+1],q12=M[j+1][i],q22=M[j+1][i+1];
  if(q11==null||q21==null||q12==null||q22==null) return null;

  var _gross=Math.max(q11,q21,q12), _unregel=(q22 < _gross-0.01);
  var v;
  if(_unregel){
    v=Math.min(q11,q21,q12,q22);
  } else {
    var tw=(w1===w0)?0:(b-w0)/(w1-w0), th=(h1===h0)?0:(h-h0)/(h1-h0);
    v=(q11*(1-tw)+q21*tw)*(1-th) + (q12*(1-tw)+q22*tw)*th;
  }

  if(_o){
    var aGem=(W[W.length-1]/1000)*(H[H.length-1]/1000), aIst=(_fb/1000)*(_fh/1000);
    v=Math.max(v*(aIst/Math.max(aGem,0.01)), M[M.length-1][W.length-1]);
  }

  return v;
}

var _HOLZALU_FARBE={};
function _farbAufschlag(L){
  var k=_holzaluKey(L); if(!k) return null;
  var t=_HOLZALU_FARBE[k+'_'+_holzaluFlaeche(L)]; if(!t) return null;
  function stufe(a,v){ for(var i=0;i<a.length;i++){ if(v<=a[i]) return i; } return a.length-1; }
  var d=t.D[stufe(t.H,L.hMm)][stufe(t.W,L.bMm)];
  return (typeof d==='number')?d:null;
}

var _LICHT={"classic":{"fest":{"W":[500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400,2401,2500,2501,2600,2601,2700,2701,2800,2801,2900,2901,3000],"H":[210,299,300,399,400,499,500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1599,1600,1699,1700,1799,1800,1899,1900,1999,2000],"M":[]},"festMin":210,"festMax":2000,"kippMin":360,"kippMax":1000,"kippB":455,"bMax":3000,"kipp":{"W":[500,501,600,601,700,701,800,801,900,901,1000,1001,1100,1101,1200,1201,1300,1301,1400,1401,1440,1441,1460,1461,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400],"H":[360,400,401,500,501,600,601,700,701,800,801,900,901,1000],"M":[]}},"light":{"fest":{"W":[500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400,2401,2500,2501,2600,2601,2700,2701,2800,2801,2900,2901,3000],"H":[210,299,300,399,400,499,500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1599,1600,1699,1700,1799,1800,1899,1900,1999,2000],"M":[]},"festMin":210,"festMax":2000,"kippMin":410,"kippMax":1000,"kippB":640,"bMax":3000,"kipp":{"W":[640,700,701,800,801,900,901,1000,1001,1100,1101,1200,1201,1300,1301,1400,1401,1440,1441,1460,1461,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400],"H":[410,500,501,600,601,700,701,800,801,900,901,1000],"M":[]}},"energy":{"fest":{"W":[500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400,2401,2500,2501,2600,2601,2700,2701,2800,2801,2900,2901,3000],"H":[250,299,300,399,400,499,500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1599,1600,1699,1700,1799,1800,1899,1900,1999,2000],"M":[]},"festMin":250,"festMax":2000,"kippMin":450,"kippMax":1000,"kippB":470,"bMax":3000,"kipp":{"W":[500,501,600,601,700,701,800,801,900,901,1000,1001,1100,1101,1200,1201,1300,1301,1400,1401,1440,1441,1460,1461,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400],"H":[450,500,501,600,601,700,701,800,801,900,901,1000],"M":[]}},"edge":{"fest":{"W":[500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400,2401,2500,2501,2600,2601,2700,2701,2800,2801,2900,2901,3000],"H":[330,399,400,499,500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1599,1600,1699,1700,1799,1800,1899,1900,1999,2000],"M":[]},"festMin":330,"festMax":2000,"kippMin":450,"kippMax":1000,"kippB":470,"bMax":3000,"kipp":{"W":[500,501,600,601,700,701,800,801,900,901,1000,1001,1100,1101,1200,1201,1300,1301,1400,1401,1440,1441,1460,1461,1500,1501,1600,1601,1700,1701,1800,1801,1900,1901,2000,2001,2100,2101,2200,2201,2300,2301,2400],"H":[450,500,501,600,601,700,701,800,801,900,901,1000],"M":[]}},"sl68kiefer":{"fest":{"W":[500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500],"H":[350,399,400,499,500,599,600,699,700,799,800,899,900,999,1000,1099,1100,1199,1200,1299,1300,1399,1400,1499,1500,1599,1600,1699,1700,1799,1800,1899,1900,1999,2000],"M":[]},"festMin":350,"festMax":2000,"kippMin":430,"kippMax":1000,"kippB":530,"bMax":1500,"kipp":{"W":[530,600,601,700,701,800,801,900,901,1000,1001,1100,1101,1200,1201,1300,1301,1400,1401,1440,1441,1460,1461,1500],"H":[430,500,501,600,601,700,701,800,801,900,901,1000],"M":[]}}};

function _lichtKey(L){
  var m=(L&&L.material)||S.material||'kunststoff', pr=(L&&L.haProfil)||S.profile;
  if(m==='alu') return null;
  if(m==='holz') return (pr==='softline68' && ((L&&L.holzart)||S.holzart)==='kiefer') ? 'sl68kiefer' : null;
  return ({classic:'classic',light:'light',energy:'energy',edge:'edge'})[pr]||null;
}
function lichtMoeglich(){ return !!_LICHT[_lichtKey(null)]; }
function lichtGrenzen(typ){
  var e=_LICHT[_lichtKey(null)]; if(!e) return null;

  var kippArtig=(typ==='kipp'||typ==='dk-l'||typ==='dk-r');
  if(!kippArtig) return {min:e.festMin, max:e.festMax, bMin:0, da:true};

  var min=(typ==='kipp') ? e.kippMin : Math.max(e.kippMin, 395);
  return {min:min, max:e.kippMax, bMin:e.kippB, da:!!e.kipp};
}

function _lichtEins(e,typ,b,h,L){
  if(typ==='dk-l'||typ==='dk-r') return _lichtDrehKipp(e,typ,b,h,L);
  var t=(typ==='kipp')?e.kipp:e.fest;
  if(!t) return null;

  if(b < t.W[0] || b > t.W[t.W.length-1]) return null;
  if(h < t.H[0] || h > t.H[t.H.length-1]) return null;
  return _holzaluLook(t,b,h);
}
function _lichtDrehKipp(){ return null; }
function _lichtPreis(){ return null; }
function lichtAktiv(){ return S.licht && S.licht!=='ohne'; }

function lichtGesamtHoehe(){
  var h=+S.h||0;
  if(S.licht==='ober'||S.licht==='beide') h+=(+S.olH||0);
  if(S.licht==='unter'||S.licht==='beide') h+=(+S.ulH||0);
  return h;
}

function lichtText(){
  if(!lichtAktiv()) return 'ohne';
  var t=[];

  var _lart=function(v){ return (v==='kipp')?' (kipp)' : (v==='dk-l')?' (Dreh-Kipp links)' : (v==='dk-r')?' (Dreh-Kipp rechts)' : ''; };
  if(S.licht==='ober'||S.licht==='beide') t.push('Oberlicht '+(+S.olH||0)+' mm'+_lart(S.olTyp));
  if(S.licht==='unter'||S.licht==='beide') t.push('Unterlicht '+(+S.ulH||0)+' mm'+_lart(S.ulTyp));
  return t.join(' · ')+' · Gesamthöhe '+lichtGesamtHoehe()+' mm';
}

var _VERBR={};
var _VERBR_FARBE={};

function _verbrKey(){ return null; }
function _verbrBreiten(){ return _VERBR[_verbrKey(null)]||[]; }

function _verbrPreis(){ return null; }
function verbrAktiv(){ return (+S.vbL||0)+(+S.vbR||0)+(+S.vbO||0)+(+S.vbU||0) > 0; }

function verbrText(){
  var t=[['vbL','links'],['vbR','rechts'],['vbO','oben'],['vbU','unten']], out=[];
  t.forEach(function(x){ var v=+S[x[0]]||0; if(v) out.push(x[1]+' '+v+' mm'); });
  return out.length?out.join(' · '):'ohne';
}
function _pfBasis(){ return null; }

var _PF_MESS={};function _messFlaeche(){ return null; }
function _pfBasisKunststoff(){ return null; }

const _HOLZALU={};
var _FDK={};
function _fdkZone(b,h){ return h < b/_FDK_GRENZE; }
function _fdkBasis(){ return null; }
function _lp_fensterNEU(){ return null; }

var _PB={};
function _pbLook(){ return null; }

var _PBT={};
function _pbBasis(){ return null; }

var _PB2={};

function _interpH(pkte,col,h){
  var n=pkte.length;
  if(h<=pkte[0]) return col[0];
  if(h>=pkte[n-1]) return col[n-1];
  for(var i=0;i<n-1;i++){ if(h<=pkte[i+1]){ var t=(h-pkte[i])/(pkte[i+1]-pkte[i]); return col[i]+(col[i+1]-col[i])*t; } }
  return col[n-1];
}
function _pb2Basis(){ return null; }
function _lp_balkonNEU(){ return null; }

var _PH={};
var _PH_MODELL={};
var _PH_TIER={};
var _PH_FARB={};
var _PH_MOTIV={};
var _PH_GLAS={};
function _phLook(g,b,h){ if(!g)return null; var W=g.W,H=g.H,M=g.M; var wi=0; while(wi<W.length-1&&W[wi]<b)wi++; var hi=0; while(hi<H.length-1&&H[hi]<h)hi++; var v=M[hi][wi]; if(v==null){ for(var k=hi;k<H.length;k++){ if(M[k][wi]!=null){v=M[k][wi];break;} } } return v; }
function _phColor(){ return null; }
function _phBilin(g,b,h){ var W=g.W,H=g.H,M=g.M; function nb(v,a){ if(v<=a[0])return [0,0,0]; if(v>=a[a.length-1])return [a.length-1,a.length-1,0]; for(var i=0;i<a.length-1;i++){ if(v<=a[i+1])return [i,i+1,(v-a[i])/(a[i+1]-a[i])]; } return [a.length-1,a.length-1,0]; }
  var bw=nb(b,W), bh=nb(h,H); var c00=M[bh[0]][bw[0]],c10=M[bh[0]][bw[1]],c01=M[bh[1]][bw[0]],c11=M[bh[1]][bw[1]];
  var top=c00+(c10-c00)*bw[2], bot=c01+(c11-c01)*bw[2]; return top+(bot-top)*bh[2]; }

var _PHT={};
function _stufeIdx(){ return null; }
function _phBasis(){ return null; }
function _lp_haustuerNEU(){ return null; }

var _PSKG={};
var _HSG={};
var _PSKT={}, _PSKINN=[], _PSKMAP={};
var _HST={}, _HSBOTH={}, _HSMAP={}, _HSCOL={};

function _hstLook(){ return null; }
function _hstBilin(g,b,h){ var W=g.W,H=g.H,M=g.M; function nb(v,a){ if(v<=a[0])return [0,0,0]; if(v>=a[a.length-1])return [a.length-1,a.length-1,0]; for(var i=0;i<a.length-1;i++){ if(v<=a[i+1])return [i,i+1,(v-a[i])/(a[i+1]-a[i])]; } return [a.length-1,a.length-1,0]; }
  var bw=nb(b,W), bh=nb(h,H); var c00=M[bh[0]][bw[0]],c10=M[bh[0]][bw[1]],c01=M[bh[1]][bw[0]],c11=M[bh[1]][bw[1]];
  var top=c00+(c10-c00)*bw[2], bot=c01+(c11-c01)*bw[2]; return top+(bot-top)*bh[2]; }

var _HS_FLGRENZE=0, _HS_FLZUSCHLAG=359.4;
var _HST2={};
function _hs2Basis(){ return null; }
function _lp_hstNEU(){ return null; }

const _QM_AUFPREIS = 20;

var _ROLL_TAB={};
function _rollBand(){ return null; }

var _ROLL_AUF={};

function _rollAufStufe(){ return null; }
function _rollAufschlag(){ return null; }
function _rollPreis(){ return null; }
/* Preise kommen aus der Rechenstelle im Server.
   Bis zum 10.09.2026 stand die vollstaendige Kalkulation hier im Quelltext und
   wurde an jeden Besucher ausgeliefert - mit Rechtsklick lesbar. Jetzt fragt
   der Browser nur noch und merkt sich die Antwort.
   Drei Zustaende, die auseinandergehalten werden muessen:
     Zahl       - der Preis
     null       - auf Anfrage (der Server hat geantwortet, es gibt keinen Preis)
     undefined  - noch nicht bekannt, die Antwort ist unterwegs
   Wer das verwechselt, zeigt dem Kunden "auf Anfrage", waehrend nur das Netz
   langsam ist. */
const PREIS_DIENST='https://deinefenster-email.sarahchrist.workers.dev/preis';
const PREIS_FELDER=['prod','material','profile','aufteilung','opening','glass','glasdekor',
  'roll','sproTyp','sproDicke','sproRaster','licht','olTyp','ulTyp','olH','ulH',
  'holzart','hstSystem','pskKammer','hstSchloss','hstTeilung','hstLauf','griffHst',
  'balkonSchwelle','doorModel','griffTuer','griffAussen','stossHoehe','haProfil','fluegel',
  'griff','panzer','endleiste','colorTarget','anschlagIdx','outer','inner','w','h','anzahl',
  'schall','sicher','griffLocked','vbAn','vbL','vbR','vbO','vbU',
  'rlKasten','rlAntrieb','rlSeite','rlEndleiste','rollSeite','rlPanzer','rlKastenF','rlSchiene',
  'rlKastenManuell'];

const _preisWissen=new Map();
const _preisUnterwegs=new Set();
let _preisNachlauf=null;
/* Fehlversuche muessen gemerkt werden. Ohne das entsteht ein Kreislauf: Der
   Server antwortet nicht, es wird nichts gelernt, die Anzeige zeichnet neu,
   fragt wieder - und wieder. Das legt die Seite lahm und flutet den Server.
   Deshalb nach einem Fehlschlag eine Ruhezeit, bevor dieselbe Frage erneut
   gestellt wird. */
const _preisFehlversuch=new Map();
const PREIS_RUHE_MS=15000;

function _preisAuszug(q){
  const k={};
  for(const f of PREIS_FELDER){ const v=q[f]; if(v!==undefined) k[f]=v; }
  return k;
}
function _preisSchluessel(k){
  const felder=Object.keys(k).sort();
  return felder.map(f=>f+'='+k[f]).join('|');
}

/* Antworten sammeln und gebuendelt abholen: waehrend der Kunde klickt,
   entstehen mehrere Fragen kurz hintereinander. Einzeln abgeschickt waeren
   das unnoetig viele Anfragen. */
let _preisWarteschlange=[];
let _preisTakt=null;

function _preisAnfordern(k){
  const s=_preisSchluessel(k);
  if(_preisWissen.has(s)||_preisUnterwegs.has(s)) return;
  const letzter=_preisFehlversuch.get(s);
  if(letzter!==undefined && (Date.now()-letzter)<PREIS_RUHE_MS) return;
  _preisUnterwegs.add(s);
  _preisWarteschlange.push([s,k]);
  if(_preisTakt) clearTimeout(_preisTakt);
  _preisTakt=setTimeout(_preisAbschicken,60);
}

async function _preisAbschicken(){
  _preisTakt=null;
  const paket=_preisWarteschlange.splice(0,60);
  if(!paket.length) return;
  let gelernt=false;
  try{
    const r=await fetch(PREIS_DIENST,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mehrere:paket.map(([,k])=>k)})});
    const a=await r.json();
    if(a&&a.ok&&Array.isArray(a.preise)){
      paket.forEach(([s],i)=>{ _preisWissen.set(s,a.preise[i]??null); _preisUnterwegs.delete(s); _preisFehlversuch.delete(s); });
      gelernt=true;
    } else {
      // Kein Preis heisst hier NICHT "auf Anfrage" - der Server war nur nicht
      // erreichbar oder hat die Anfrage abgelehnt. Nicht als Ergebnis merken,
      // aber den Fehlschlag festhalten, damit nicht sofort wieder gefragt wird.
      const t=Date.now();
      paket.forEach(([s])=>{ _preisUnterwegs.delete(s); _preisFehlversuch.set(s,t); });
    }
  }catch(e){
    const t=Date.now();
    paket.forEach(([s])=>{ _preisUnterwegs.delete(s); _preisFehlversuch.set(s,t); });
  }
  if(_preisWarteschlange.length){ _preisTakt=setTimeout(_preisAbschicken,0); return; }
  // Nur nachziehen, wenn tatsaechlich etwas Neues bekannt ist - sonst zeichnet
  // die Seite bei jedem Fehlschlag neu und fragt dadurch sofort wieder.
  if(!gelernt) return;
  if(_preisNachlauf) clearTimeout(_preisNachlauf);
  _preisNachlauf=setTimeout(()=>{ _preisNachlauf=null;
    try{ if(typeof refreshPrice==='function') refreshPrice(); }catch(e){}
    // Auch ohne gestarteten Wizard neu zeichnen: auf der Produktauswahl
    // haengen die "ab"-Preise der fuenf Kacheln an derselben Antwort.
    try{ if(typeof render==='function') render(); }catch(e){}
  },0);
}

function price(){
  const k=_preisAuszug(S);
  const s=_preisSchluessel(k);
  if(_preisWissen.has(s)) return _preisWissen.get(s);
  _preisAnfordern(k);
  return undefined;
}

/* Mehrere Konfigurationen auf Vorrat holen - wird beim Betreten eines
   Schrittes benutzt, damit die Aufpreise schon dastehen, wenn der Kunde
   klickt, statt nach jedem Klick nachzuzucken. */
function preisVorrat(liste){
  for(const q of liste){ const k=_preisAuszug(q); if(!_preisWissen.has(_preisSchluessel(k))) _preisAnfordern(k); }
}
function _priceRoh(){ return null; }
function configTitle(){
  if(S.prod==='rollladen'){ const k=rollKast(); return 'Vorsatzrollladen · '+ROLL_FORM[k.form].n+' '+k.n; }
  if(S.prod==='haustuer') return 'Haustür · '+(DOORN[S.doorModel]||'Modell');
  if(S.prod==='schiebe') return (S.hstSystem==='hs'?'Hebe-Schiebetür':'PSK Schiebetür');
  if(S.prod==='balkon') return 'Balkontür · '+profilName(S.profile);
  return profilText();
}
// Was der Kunde liest. "IGLO 5 Classic" allein sagt einer Privatperson nichts —
// davor gehoert, um was fuer ein Bauteil es sich handelt. Steht die Gattung
// schon im Titel (Balkontuer, Haustuer, PSK Schiebetuer), bleibt er, wie er ist.
function configTitleLang(){
  var t=configTitle(), p=prodName();
  return (t.indexOf(p)>=0) ? t : (p+' \u00b7 '+t);
}
const MAT_PRODN={kunststoff:'Kunststofffenster',holz:'Holzfenster',alu:'Aluminiumfenster'};
function prodName(){
  if(S.prod==='fenster') return MAT_PRODN[S.material]||'Kunststofffenster';
  return {balkon:'Balkontür',haustuer:'Haustür',schiebe:'Schiebetür',rollladen:'Vorsatzrollladen'}[S.prod]||'Kunststofffenster';
}
function prodUnit(){ return {fenster:'Fenster',balkon:'Balkontür',haustuer:'Haustür',schiebe:'Schiebetür',rollladen:'Rollladen'}[S.prod]||'Fenster'; }

function prodSpecs(rest){
  const co=COLORS_AKT()[S.outer].n, ci=COLORS_AKT()[S.inner].n;
  const c=(S.outer===S.inner)?`${co} (außen & innen)`:`außen ${co} · innen ${ci}`;
  const teil=(...v)=>v.filter(Boolean).join(' · ');
  const a=rest?'':anschlagInfo().kurz;
  const m=rest?'':`${S.w}×${S.h} mm`;
  if(S.prod==='haustuer') return teil(DOORN[S.doorModel]||'—', a, griffTuerShort(), m, c);
  if(S.prod==='schiebe')  return teil(S.hstSystem==='hs'?'Hebe-Schiebe':'PSK', a, m, c);
  const ex=[]; if(S.roll==='gurt')ex.push('Rollladen'); if(S.roll==='motor')ex.push('Motorrolladen');
  if(S.roll!=='kein')ex.push('Panzer '+panzerText(),'Endleiste '+endleisteText()); if(S.glass==='3')ex.push('3-fach'); if(S.prod==='balkon'&&S.balkonSchwelle==='alu')ex.push('Aluschwelle'); if(S.sicher)ex.push('Sicherheitsbeschlag');
  return teil(AUFTN[S.aufteilung], a, m, c, ex.length?ex.join(', '):'');
}

const OPEN={dkl:'Dreh-Kipp links',dkr:'Dreh-Kipp rechts',kipp:'Kipp',fest:'Festverglasung'};
const DOORS=[
  {k:'vollglas-inox',n:'Vollglas'},{k:'halbglas-inox',n:'Halbglas'},{k:'florida-lr-inox',n:'Florida'},
  {k:'montana-1-inox',n:'Montana 1'},{k:'montana-2-lr-inox',n:'Montana 2'},{k:'montana-3-lr-inox',n:'Montana 3'},
  {k:'nebraska-lcr-inox',n:'Nebraska'},{k:'ohio-inox',n:'Ohio'},{k:'colorado-inox',n:'Colorado'},
  {k:'alaska-1-inox',n:'Alaska 1'},{k:'alaska-2-inox',n:'Alaska 2'},
  {k:'pennsylvania-1-inox',n:'Pennsylvania 1'},{k:'pennsylvania-2-lr-inox',n:'Pennsylvania 2'},{k:'pennsylvania-3-lr-inox',n:'Pennsylvania 3'},
  {k:'texas-c-inox',n:'Texas C'},{k:'texas-lr-inox',n:'Texas'},
];
const DOORIMG=k=>`img/drutex-tueren/studio/${k}.webp`;
const DOORN=Object.fromEntries(DOORS.map(d=>[d.k,d.n]));
const GRIFFT={stoss:'Stoßgriff',klinke:'Drückergarnitur',knauf:'Knauf'};
const STOSS_HOEHEN=['580','1200','1600'];
function _griffAussenVal(){ return S.griffAussen || ((S.griffTuer&&S.griffTuer!=='stange')?S.griffTuer:'klinke'); }
function griffTuerShort(){ var a=_griffAussenVal(); return (GRIFFT[a]||'—')+(a==='stoss'?' · '+(S.stossHoehe||'1200')+' mm':''); }
function griffTuerFull(){ var a=_griffAussenVal(); return (GRIFFT[a]||'—')+(a==='stoss'?' · Höhe '+(S.stossHoehe||'1200')+' mm':'')+' außen · Drückergarnitur innen'; }
const STEPS_FENSTER=[
  {key:'profil',label:'Profil',title:['Ihr ','Profil'],sub:'Das Drutex-System für Ihr Fenster.'},
  {key:'aufteilung',label:'Aufteilung',title:['Die ','Aufteilung'],sub:'Wie viele Flügel soll Ihr Fenster haben?'},
  {key:'oeffnung',label:'Öffnung',title:['Die ','Öffnungsart'],sub:'In welche Richtung öffnet das Fenster?'},
  {key:'masse',label:'Maße',title:['Ihre ','Maße'],sub:'Breite und Höhe der Maueröffnung (Rohbaumaß) in Millimeter.'},
  {key:'anzahl',label:'Anzahl',title:['Die ','Anzahl'],sub:'Wie viele gleiche Fenster benötigen Sie?'},
  {key:'farbe',label:'Farbe',title:['Die ','Farbe'],sub:'Außen- und Innenfarbe — die Vorschau zeigt Ihre Wahl.'},
  {key:'glas',label:'Glas',title:['Die ','Verglasung'],sub:'2-fach oder 3-fach Wärmeschutz.'},
  {key:'motiv',label:'Motiv',title:['Das ','Glasmotiv'],sub:'Klarglas oder ein Sichtschutz-Dekor.'},
  {key:'griff',label:'Griff',title:['Der ','Griff'],sub:'Modell und Ausführung Ihres Fenstergriffs.'},
  {key:'sicherheit',label:'Sicherheit',title:['Die ','Sicherheit'],sub:'Sicherheitsbeschlag erschwert das Aufhebeln.'},
  {key:'rollladen',label:'Rollladen',title:['Der ','Rollladen'],sub:'Sicht- und Sonnenschutz als Aufsatzkasten.'},
  {key:'sprossen',label:'Sprossen',title:['Die ','Sprossen'],sub:'Klassische Fenster-Optik mit Sprossen.'},

  {key:'verbreiterung',label:'Verbreiterung',title:['Die ','Verbreiterung'],sub:'Füllt den Spalt, wenn die alte Öffnung größer ist als das neue Fenster.'},
  {key:'anfrage',label:'Übersicht',title:['Übersicht & ','Anfrage'],sub:'Kostenlos anfordern — Sie gehen keinerlei Verpflichtung ein.'},
];
const STEPS_BALKON=[
  {key:'profil',label:'Profil',title:['Ihr ','Profil'],sub:'Das Drutex-System für Ihre Balkontür.'},
  {key:'aufteilung',label:'Aufteilung',title:['Die ','Aufteilung'],sub:'Ein- oder zweiflügelige Balkontür?'},
  {key:'oeffnung',label:'Öffnung',title:['Die ','Öffnungsart'],sub:'In welche Richtung öffnet die Tür?'},
  {key:'masse',label:'Maße',title:['Ihre ','Maße'],sub:'Breite und Höhe der Maueröffnung (Rohbaumaß) in Millimeter.'},
  {key:'anzahl',label:'Anzahl',title:['Die ','Anzahl'],sub:'Wie viele gleiche Balkontüren benötigen Sie?'},
  {key:'farbe',label:'Farbe',title:['Die ','Farbe'],sub:'Außen- und Innenfarbe — die Vorschau zeigt Ihre Wahl.'},
  {key:'glas',label:'Glas',title:['Die ','Verglasung'],sub:'2-fach oder 3-fach Wärmeschutz.'},
  {key:'motiv',label:'Motiv',title:['Das ','Glasmotiv'],sub:'Klarglas oder ein Sichtschutz-Dekor.'},
  {key:'griff',label:'Griff',title:['Der ','Griff'],sub:'Modell und Ausführung Ihres Griffs.'},
  {key:'schwelle',label:'Schwelle',title:['Die ','Schwelle'],sub:'Flache Aluschwelle für einen barrierearmen Übergang.'},
  {key:'sicherheit',label:'Sicherheit',title:['Die ','Sicherheit'],sub:'Sicherheitsbeschlag erschwert das Aufhebeln.'},
  {key:'rollladen',label:'Rollladen',title:['Der ','Rollladen'],sub:'Sicht- und Sonnenschutz als Aufsatzkasten.'},
  {key:'sprossen',label:'Sprossen',title:['Die ','Sprossen'],sub:'Klassische Optik mit Sprossen.'},
  {key:'anfrage',label:'Übersicht',title:['Übersicht & ','Anfrage'],sub:'Kostenlos anfordern — unverbindlich.'},
];
const STEPS_HAUSTUER=[
  {key:'profil',label:'Profil',title:['Ihr ','Profil'],sub:'Das Drutex-System für Ihre Haustür.'},
  {key:'oeffnung',label:'Anschlag',title:['Der ','Anschlag'],sub:'Öffnet die Tür nach links oder rechts (DIN)?'},
  {key:'masse',label:'Maße',title:['Ihre ','Maße'],sub:'Breite und Höhe der Türöffnung im Rohbau in Millimeter.'},
  {key:'anzahl',label:'Anzahl',title:['Die ','Anzahl'],sub:'Wie viele gleiche Haustüren benötigen Sie?'},
  {key:'modell',label:'Modell',title:['Ihr ','Türmodell'],sub:'Ihr Haustür-Design — die Vorschau zeigt es sofort.'},
  {key:'farbe',label:'Farbe',title:['Die ','Farbe'],sub:'Außen- und Innenfarbe des Türblatts.'},
  {key:'glas',label:'Glas',title:['Die ','Verglasung'],sub:'2-fach ist Standard, 3-fach dämmt noch besser.'},
  {key:'motiv',label:'Motiv',title:['Das ','Glasmotiv'],sub:'Klarglas oder ein Sichtschutz-Dekor.'},
  {key:'griffTuer',label:'Griff',title:['Der ','Türgriff'],sub:'Innen Drückergarnitur, außen Klinke, Knauf oder Stoßgriff.'},
  {key:'sicherheit',label:'Sicherheit',title:['Die ','Sicherheit'],sub:'Mehrfachverriegelung für mehr Einbruchschutz.'},
  {key:'anfrage',label:'Übersicht',title:['Übersicht & ','Anfrage'],sub:'Kostenlos anfordern — unverbindlich.'},
];

function buildSchiebeSteps(){
  const profil={key:'profil',label:'System',title:['Ihr ','Schiebe-System'],sub:'Parallel-Schiebe-Kipp oder Hebe-Schiebe-Tür?'};
  const common=[
    {key:'masse',label:'Maße',title:['Ihre ','Maße'],sub:'Breite und Höhe der Maueröffnung (Rohbaumaß) in Millimeter.'},
    {key:'anzahl',label:'Anzahl',title:['Die ','Anzahl'],sub:'Wie viele gleiche Schiebetüren benötigen Sie?'},
    {key:'farbe',label:'Farbe',title:['Die ','Farbe'],sub:'Außen- und Innenfarbe — die Vorschau zeigt Ihre Wahl.'},
    {key:'motiv',label:'Motiv',title:['Das ','Glasmotiv'],sub:'Klarglas oder ein Sichtschutz-Dekor.'},
    {key:'griffhst',label:'Griff',title:['Der ','Schiebegriff'],sub:'Innengriff, Außengriff und Ausführung.'},
    {key:'rollladen',label:'Rollladen',title:['Der ','Rollladen'],sub:'Sicht- und Sonnenschutz als Aufsatzkasten.'},
    {key:'anfrage',label:'Übersicht',title:['Übersicht & ','Anfrage'],sub:'Kostenlos anfordern — unverbindlich.'},
  ];
  if(S.hstSystem==='hs'){
    return [profil,{key:'lauf',label:'Laufrichtung',title:['Die ','Laufrichtung'],sub:'HebeSchiebe links oder rechts — Ansicht von innen.'},...common];
  }
  return [profil,
    {key:'psk',label:'PSK-System',title:['Das ','PSK-System'],sub:'Kammer-System Ihrer Parallel-Schiebe-Kipp-Tür.'},
    {key:'lauf',label:'Öffnung',title:['Die ','Öffnungsrichtung'],sub:'Kippen zum Lüften + seitlich schieben — nach links oder rechts.'},
    ...common];
}

const MATERIALS={
  kunststoff:{n:'Kunststoff', s:'IGLO-Systeme \u00b7 Lieferzeit 1\u20133 Wochen'},
  holz:      {n:'Holz',       s:'Softline Vollholz \u00b7 Lieferzeit 3\u20138 Wochen'},
  alu:       {n:'Aluminium',  s:'MB-Systeme \u00b7 Lieferzeit 4\u20138 Wochen'}
};
const HOLZARTEN={
  kiefer: {n:'Kiefer',  s:'Heimisches Weichholz \u00b7 g\u00fcnstigster Einstieg'},
  meranti:{n:'Meranti', s:'Hartholz \u00b7 formstabiler, h\u00f6herer Preis'}
};

const PROFILE_KAT={

  kunststoff:[
    {v:'classic', img:'iglo5-zentriert',               t:'IGLO 5 Classic', s:'flächenversetzt',
     sp:[['Bautiefe','70 mm'],['Kammern','5'],['Dichtungen','2 EPDM'],['Uw in W/(m²K)','0,86']]},
    {v:'light',   img:'iglo-light-zentriert',          t:'IGLO Light', s:'schmaler Rahmen, mehr Glas',
     sp:[['Bautiefe','70 mm'],['Kammern','5'],['Dichtungen','2 EPDM'],['Uw in W/(m²K)','0,88']]},
    {v:'ext',     img:'iglo-ext-zentriert',            t:'IGLO 5 Classic EXT', s:'öffnet nach außen',
     sp:[['Bautiefe','70 mm'],['Kammern','5'],['Dichtungen','2 EPDM'],['Uw in W/(m²K)','0,89']]},
    {v:'energy',  img:'iglo-energy-classic-zentriert', t:'IGLO Energy Classic', s:'flächenversetzt',
     sp:[['Bautiefe','82 mm'],['Kammern','7'],['Dichtungen','3'],['Uw in W/(m²K)','0,73']]},
    {v:'edge',    img:'iglo-edge-zentriert',           t:'IGLO EDGE', s:'flächenversetzt',
     sp:[['Bautiefe','82 mm'],['Kammern','7'],['Dichtungen','3 EPDM'],['Uw in W/(m²K)','0,66']]}],
  holz:[
    {v:'softline68', img:'softline68', t:'Softline 68 mm',
     sp:[['Bautiefe','68 mm'],['Dichtungen','2'],['Uw in W/(m²K)','1,08']]},
    {v:'softline78', img:'softline78', t:'Softline 78 mm',
     sp:[['Bautiefe','78 mm'],['Dichtungen','2'],['Uw in W/(m²K)','0,90']]},
    {v:'softline88', img:'softline88', t:'Softline 88 mm',
     sp:[['Bautiefe','88 mm'],['Dichtungen','2'],['Uw in W/(m²K)','0,80']]}],
  alu:[
    {v:'mb70',   img:'mb70',   t:'MB-70',
     sp:[['Bautiefe','70 mm'],['Dichtungen','3 EPDM'],['Uw in W/(m²K)','1,06']]},
    {v:'mb70hi', img:'mb70hi', t:'MB-70HI',
     sp:[['Bautiefe','70 mm'],['Dichtungen','3 EPDM'],['Uw in W/(m²K)','0,96']]},
    {v:'mb86si', img:'mb86si', t:'MB-86N SI',
     sp:[['Bautiefe','77 mm'],['Dichtungen','3 EPDM'],['Uw in W/(m²K)','0,76']]}]
};

const KARTE_PFAD='img/karten/profil/';

function profilBild(mat,p){
  return KARTE_PFAD + p.img + ((mat==='holz')?('-'+(S.holzart||'kiefer')):'') + '.webp?v=1';
}

function materialBild(m){
  if(m==='holz') return KARTE_PFAD+'softline78-kiefer.webp?v=1';
  if(m==='alu')  return KARTE_PFAD+'mb70.webp?v=1';
  return KARTE_PFAD+'iglo5-zentriert.webp?v=1';
}
function holzartBild(h){ return KARTE_PFAD+'softline68-'+h+'.webp?v=1'; }

const HOLZ_STANDARDTON={kiefer:1, meranti:4};
function holzTonDefault(){ return HOLZ_STANDARDTON[S.holzart||'kiefer']||1; }
function profilDefault(m){ return (PROFILE_KAT[m]||PROFILE_KAT.kunststoff)[0].v; }

function buildFensterSteps(){
  const material={key:'material',label:'Material',title:['Ihr ','Material'],sub:'Kunststoff, Holz oder Aluminium?'};
  const holzart ={key:'holzart', label:'Holzart', title:['Die ','Holzart'], sub:'Kiefer oder Meranti \u2014 die Basis f\u00fcr Optik und Preis.'};

  const rest=STEPS_FENSTER.filter(function(st){
    if(S.material==='holz' && st.key==='rollladen') return false;
    return true;
  });
  return (S.material==='holz') ? [material,holzart].concat(rest) : [material].concat(rest);
}

const STEPS_ROLL=[

  {key:'rlform',label:'Kastenform',title:['Die ','Kastenform'],sub:'Gerundet oder kantig — so wirkt der Kasten an der Fassade.'},
  {key:'masse',label:'Maße',title:['Ihre ','Maße'],sub:'Breite und Höhe des fertigen Rollladens in Millimeter — Kasten eingerechnet.'},
  {key:'rlkasten',label:'Kastengröße',title:['Die ','Kastengröße'],sub:'Im Kasten liegt der aufgerollte Panzer — je höher der Rollladen, desto größer der Kasten.'},
  {key:'anzahl',label:'Anzahl',title:['Die ','Anzahl'],sub:'Wie viele gleiche Rollläden benötigen Sie?'},
  {key:'rlfarbe',label:'Farbe',title:['Die ','Farben'],sub:'Panzer, Endleiste, Kasten und Führungsschienen — die Vorschau zeigt Ihre Wahl.'},
  {key:'rlantrieb',label:'Antrieb',title:['Der ','Antrieb'],sub:'Von Hand oder auf Knopfdruck — und auf welcher Seite.'},
  {key:'anfrage',label:'Übersicht',title:['Übersicht & ','Anfrage'],sub:'Kostenlos anfordern — unverbindlich.'},
];
function buildRollSteps(){ return STEPS_ROLL; }
const STEPMAP={fenster:STEPS_FENSTER,balkon:STEPS_BALKON,haustuer:STEPS_HAUSTUER};

function stepsFor(){
  if(S.prod==='schiebe') return buildSchiebeSteps();
  if(S.prod==='rollladen') return buildRollSteps();
  if(S.prod==='fenster') return buildFensterSteps();
  return STEPMAP[S.prod]||STEPS_FENSTER;
}
function setMaterial(v){

  if(S.material===v){ maybeAutoAdvance(); return; }
  S.material=v;
  S.profile=profilDefault(v);
  if(v!=='holz'){ S.holzart='kiefer'; } else { S.roll='kein'; S.panzer=null; S.endleiste=null; }

  if(v==='alu' && S.aufteilung==='3fl'){ S.aufteilung='2fl'; S.anschlagIdx=Math.min(ANSCHLAG_DEFIDX['2fl']||0,(ANSCHLAG['2fl']||[]).length-1); massKlemmen(); }

  S.outer=(v==='holz')?holzTonDefault():0; S.inner=S.outer;
  STEPS=stepsFor(); if(cur>=STEPS.length) cur=STEPS.length-1;
  render(); maybeAutoAdvance();
}
function setHolzart(v){

  S.holzart=v; S.outer=holzTonDefault(); S.inner=S.outer;
  render(); maybeAutoAdvance();
}
let STEPS=STEPS_FENSTER;

const SKIP_KEYS=['motiv','schall','griff','sicherheit','rollladen','sprossen','verbreiterung'];
function finishWithDefaults(){ commitCurrent(); }
let cur=0;
let started=false;
let liefer='abholung';

let lieferWunsch=false;
function setLieferWunsch(v){ lieferWunsch=!!v; saveCart();
  if(document.getElementById('cdBody')) renderCartDrawer(); render(); }

function lieferWahlHTML(t,klasse){
  var h='<div class="'+klasse+'">'
    +'<button type="button" class="'+(liefer==='abholung'?'on':'')+'" onclick="setLiefer(\'abholung\')">'

      +'<b>Abholung</b><span>Brandenburg a. d. H. &middot; freitags 10&ndash;17 Uhr &middot; kostenlos</span></button>'
    +'<button type="button" class="'+(liefer==='lieferung'?'on':'')+(t.lieferOk?'':' locked')+'"'+(t.lieferOk?'':' disabled')+' onclick="setLiefer(\'lieferung\')">'
      +'<b>Lieferung</b><span>'+(t.lieferOk?(t.ship?eur(t.ship):'kostenfrei'):'ab '+LIEFER_MIN+' Elementen')+'</span></button>'
  +'</div>';
  if(!t.lieferOk){
    var fehlt=LIEFER_MIN-t.qty;
    h+='<label class="liefer-frage"><input type="checkbox" '+(lieferWunsch?'checked':'')+' onchange="setLieferWunsch(this.checked)">'
      +'<span>Sie brauchen trotzdem Lieferung? Ab '+LIEFER_MIN+' Elementen ist sie regulär möglich — Ihnen fehlen noch '
      +fehlt+'. Haken setzen, dann prüfen wir es für Ihre Menge und nennen es Ihnen im Angebot.</span></label>';
  }
  return h;
}
var colAll=false;
let anfrageView='cart';

let cart=[];
let editIndex=-1;

function eur(n){ return (Math.round(n)).toLocaleString('de-DE',{style:'currency',currency:'EUR'}); }

/* gemerkt = der Preis, der beim Hinzufuegen galt. Er ueberbrueckt die Zeit,
   bis der Server geantwortet hat - ohne ihn stuende im Warenkorb kurz
   "Auf Anfrage", obwohl der Preis laengst feststand. Massgeblich ist immer
   die Antwort des Servers, sobald sie da ist. */
function posUnit(conf,gemerkt){
  const p=withConf(conf,price);
  if(p===undefined) return (typeof gemerkt==='number'&&gemerkt>0)?gemerkt:null;
  return (typeof p==='number'&&p>0)?p:null;
}
function eurOffen(n){ return (n==null)?'Auf Anfrage':eur(n); }
function totalOffen(t){ return !!(t && t.offen && !t.sub); }
function totalText(t){ return totalOffen(t) ? 'Auf Anfrage' : eur(t.total); }

function offenNote(t,cls){
  if(!t||!t.offen) return '';
  return '<div class="'+(cls||'cd-note')+'">'+t.offen+(t.offen===1?' Position':' Positionen')+' auf Anfrage \u2014 Preis nennen wir im Angebot; in der Summe noch nicht enthalten.</div>';
}

function withConf(conf,fn){ const bak={...S}; Object.assign(S,conf); let out; try{ out=fn(); } finally{ Object.assign(S,bak); } return out; }

const WIZ_SS_KEY='df_wiz_v1';
const WIZ_MAX_ALTER=1000*60*60*12;
function saveWiz(){
  try{

    if(!started || anfrageView==='done'){ sessionStorage.removeItem(WIZ_SS_KEY); return; }
    sessionStorage.setItem(WIZ_SS_KEY, JSON.stringify({
      v:1, t:Date.now(), cur:cur, editIndex:editIndex, conf:{...S}
    }));
  }catch(e){}
}
function restoreWiz(){
  try{
    const d=JSON.parse(sessionStorage.getItem(WIZ_SS_KEY)||'null');
    if(!d || d.v!==1 || !d.conf || !d.conf.prod) return false;
    if(Date.now()-(d.t||0) > WIZ_MAX_ALTER){ sessionStorage.removeItem(WIZ_SS_KEY); return false; }
    if(!PRODUCTS.some(x=>x.id===d.conf.prod)) return false;

    Object.assign(S, defaultConfig(d.conf.prod));
    Object.assign(S, d.conf);
    STEPS=stepsFor(); started=true;
    editIndex=(typeof d.editIndex==='number' && d.editIndex>=0 && cart[d.editIndex]) ? d.editIndex : -1;
    anfrageView='cart';
    cur=Math.max(0, Math.min(STEPS.length-1, d.cur|0));
    return true;
  }catch(e){ return false; }
}

function wizHistory(ersetzen){
  try{
    const st={df:1, started:!!started, cur:cur, prod:S&&S.prod};
    if(ersetzen) history.replaceState(st,'',location.href);
    else history.pushState(st,'',location.href);
  }catch(e){}
}
window.addEventListener('popstate', function(ev){
  const st=ev&&ev.state;
  if(!st || !st.df) return;
  if(!st.started){ started=false; anfrageView='cart'; render(); window.scrollTo({top:0}); return; }
  if(!started && st.prod && PRODUCTS.some(x=>x.id===st.prod)){
    Object.assign(S, defaultConfig(st.prod)); STEPS=stepsFor(); started=true; editIndex=-1;
  }
  if(!started) return;
  anfrageView='cart';
  cur=Math.max(0, Math.min(STEPS.length-1, st.cur|0));
  render(); window.scrollTo({top:0});
});

const CART_LS_KEY='df_cart_v1';

const PRICE_REV=4;
const KORB_TAGE=30;

function cartSnapshot(it){
  const conf=it.conf, q=conf.anzahl||1;
  let r={};

  const _kein = conf.prod==='fenster' && conf.material && conf.material!=='kunststoff';
  try{ const _p=withConf(conf,price); if(typeof _p==='number'&&_p>0) it.lastPrice=_p;
       r={ sv:3, pv:PRICE_REV, price:((typeof _p==='number'&&_p>0)?_p:(_kein?null:(it.lastPrice||0))), sketch:skizzeSeite(conf,true), title:withConf(conf,configTitle), specs:posKeySpecs(conf), full:withConf(conf,summaryRows) }; }catch(e){ r={sv:3,pv:PRICE_REV,price:(it.lastPrice||0),sketch:'',title:'Artikel',specs:'',full:''}; }
  return { conf, name:it.name||'', qty:q, r };
}

var korbSpeicherFehler=false;
function saveCart(){
  try{
    localStorage.setItem(CART_LS_KEY, JSON.stringify({v:5,t:Date.now(),liefer:liefer,lieferWunsch:lieferWunsch,items:cart.map(cartSnapshot)}));
    korbSpeicherFehler=false;
  }catch(e){
    korbSpeicherFehler=true;
    try{ if(document.getElementById('cdBody')) renderCartDrawer(); }catch(_){}
  }
  try{ window.dispatchEvent(new CustomEvent('df-cart-changed',{detail:{count:cart.length}})); }catch(e){} }

const _COL_ENTF=36;
const _COL_V3=['weiss','anthrazit','anthraz-gl','cremeweiss','weiss-fx','achatgrau','lichtgrau','signalgrau','betongrau','quarzgr-gl','quarzgr-sa','basaltgr-gl','basaltgr-sa','schiefgr-gl','schiefgr-sa','anthraz-um','schwarz-um','schwarzbr','alux-db','alu-gebr','eisengl','crown-plat','sheffield','winchester','eiche-hell','eiche-nat','golden-oak','nussbaum','mooreiche','dunkleiche','siena-noce','siena-ross','mahagoni','macore','oregon','douglasie','teak','schoko-br','braun-mar','moosgruen','dunkelgr','stahlblau','brillblau','dunkelrot'];

const _COL_ERSATZ={'eiche-hell':'sheffield','teak':'golden-oak','mooreiche':'dunkleiche','braun-mar':'nussbaum','schiefgr-sa':'schiefgr-gl','achatgrau':'lichtgrau','signalgrau':'grau','alu-gebr':'lichtgrau','alux-db':'shine-bronze','siena-noce':'winchester','siena-ross':'macore'};
function _colIdxV3(v){ return (typeof v==='number' && v>=0 && v<_COL_V3.length) ? _COL_V3[v] : null; }
function _colNeuIdx(key){ for(var i=0;i<COLORS_PVC.length;i++) if(COLORS_PVC[i].key===key) return i; return -1; }

const _ROLL_VON_FENSTER={'weiss':'roll-weiss','weiss-fx':'roll-weiss','anthrazit':'roll-anthrazit','anthraz-gl':'roll-anthrazit','anthraz-um':'roll-anthrazit','basaltgr-sa':'roll-basaltgrau','basaltgr-gl':'roll-basaltgrau','quarzgr-sa':'roll-quarzgrau','quarzgr-gl':'roll-quarzgrau','golden-oak':'roll-goldenoak','turner-oak':'roll-turneroak','winchester':'roll-winchester','nussbaum':'roll-nussbaum','moosgruen':'roll-moosgruen','schwarz-um':'roll-schwarz','schwarzbr':'roll-dunkelbraun'};
function _rollNeuIdx(key){ var z=_ROLL_VON_FENSTER[key]; if(!z) return -1; for(var i=0;i<COLORS_ROLL.length;i++) if(COLORS_ROLL[i].key===z) return i; return -1; }

function _migAnschlagV5(conf){
  if(!conf || conf.prod!=='fenster' || conf.aufteilung!=='1fl') return conf;
  if(conf.profile==='ext') return conf;
  var m={0:1, 1:0, 2:4, 3:5}, alt=+conf.anschlagIdx;
  if(m[alt]!==undefined) conf.anschlagIdx=m[alt];
  return conf;
}
function _migColors(conf){
  ['outer','inner','panzer','endleiste'].forEach(function(k){
    var v=conf[k];
    if(typeof v!=='number') return;
    if(v===_COL_ENTF) conf[k]=(k==='outer'||k==='inner')?0:null;
    else if(v>_COL_ENTF) conf[k]=v-1;
  });
  return conf;
}

function _migColorsV4(conf){
  ['outer','inner'].forEach(function(k){
    var key=_colIdxV3(conf[k]);
    if(key===null) return;
    var ziel=_colNeuIdx(key);
    if(ziel<0) ziel=_colNeuIdx(_COL_ERSATZ[key]||'');
    conf[k]=(ziel>=0)?ziel:0;
  });
  ['panzer','endleiste'].forEach(function(k){
    if(typeof conf[k]!=='number') return;
    var key=_colIdxV3(conf[k]);
    var ziel=(key===null)?-1:_rollNeuIdx(key);
    conf[k]=(ziel>=0)?ziel:null;
  });
  return conf;
}

function _klemmFarbIdx(conf){
  if(!conf) return conf;
  function liste(k){
    if(k==='panzer'||k==='endleiste') return COLORS_ROLL;
    if(conf.prod!=='fenster') return COLORS_PVC;
    if(conf.material==='alu')  return COLORS_ALU;
    if(conf.material==='holz') return (conf.holzart==='meranti')?COLORS_HOLZ_MERANTI:COLORS_HOLZ_KIEFER;
    return COLORS_PVC;
  }
  ['outer','inner','panzer','endleiste'].forEach(function(k){
    var v=conf[k];
    if(v===null||v===undefined) return;
    var L=liste(k)||[];
    if(typeof v!=='number' || !isFinite(v) || v<0 || v>=L.length) conf[k]=(k==='panzer'||k==='endleiste')?null:0;
  });
  // Ein aelterer Korb kann eine Panzerfarbe enthalten, die nicht mehr zur
  // Auswahl steht. Sie wird sichtbar zurueckgesetzt -- "passend zum Rahmen"
  // bzw. "wie Panzer" -- statt still stehen zu bleiben.
  ['panzer','endleiste','rlPanzer','rlEndleiste'].forEach(function(k){
    var v=conf[k];
    if(typeof v!=='number' || !COLORS_ROLL[v]) return;
    if(!_rollGesperrt(k,COLORS_ROLL[v])) return;
    conf[k]=(k==='rlPanzer')?0:null;
  });
  return conf;
}

var korbAlterTage=null, korbPreiseNeu=false, korbVerfallen=false;
function loadCart(){ try{ const d=JSON.parse(localStorage.getItem(CART_LS_KEY)||'null');

  if(d && d.t){
    korbAlterTage = Math.floor((Date.now()-d.t)/86400000);
    if(korbAlterTage >= KORB_TAGE){ korbVerfallen=true; try{ localStorage.removeItem(CART_LS_KEY); }catch(e){} return; }
  }

  if(d && Array.isArray(d.items)) korbPreiseNeu = d.items.some(function(o){ return o && o.r && o.r.pv !== PRICE_REV; });

  if(d&&Array.isArray(d.items)&&d.items.length){ const v=(+d.v||0), altV3=(v<3), altV4=(v<4), altV5=(v<5);
    cart=d.items.filter(o=>o&&o.conf).map(function(o){
      var c=o.conf;
      if(altV3) c=_migColors(c);
      if(altV4) c=_migColorsV4(c);
      if(altV5) c=_migAnschlagV5(c);
      c=_klemmFarbIdx(c);
      return {conf:c,name:o.name||'',lastPrice:(o.r&&Number(o.r.price))||0};
    });
    if(altV5) setTimeout(saveCart,0); }
  if(d && (d.liefer==='abholung'||d.liefer==='lieferung')) liefer=d.liefer;
  if(d && typeof d.lieferWunsch==='boolean') lieferWunsch=d.lieferWunsch;
  }catch(e){} }

function cartLeeren(){ cart=[]; editIndex=-1; try{ localStorage.removeItem(CART_LS_KEY); }catch(e){}
  try{ window.dispatchEvent(new Event('df-cart-changed')); }catch(e){} }

function itemNameSetzen(i,txt){ if(!cart[i]) return; cart[i].name=String(txt||'').slice(0,40); saveCart(); }

function itemQty(i,d){ const it=cart[i]; if(!it)return; it.conf.anzahl=Math.max(1,(it.conf.anzahl||1)+d); if(i===editIndex)S.anzahl=it.conf.anzahl; render(); }

function itemName(i,v){ if(cart[i])cart[i].name=v; saveCart(); }

function itemRemove(i){ cart.splice(i,1); if(editIndex===i)editIndex=-1; else if(editIndex>i)editIndex--; if(!cart.length){ backToPicker(); return; } render(); }

function itemEdit(i){ const it=cart[i]; if(!it)return;

  Object.assign(S, defaultConfig(it.conf&&it.conf.prod||'fenster'), it.conf);
  editIndex=i; anfrageView='cart'; STEPS=stepsFor(); started=true; cur=0; window.scrollTo({top:0}); render(); }

function addAnother(){ editIndex=-1; anfrageView='cart'; backToPicker(); }

function openCart(){ openCartDrawer(); }

function showCart(){ openCartDrawer(); }

function skizzeGross(i){
  var it=cart[i]; if(!it) return;
  var box=document.getElementById('skzOverlay');
  if(!box){
    box=document.createElement('div');
    box.id='skzOverlay'; box.className='skz'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
    box.innerHTML='<div class="skz-box"><div class="skz-head"><div><div class="skz-t"></div></div>'
      +'<button type="button" class="skz-x" aria-label="Schließen">&times;</button></div>'
      +'<div class="skz-s"></div><div class="skz-draw"></div></div>';
    document.body.appendChild(box);
    box.addEventListener('click',function(e){ if(e.target===box) skizzeGrossZu(); });
    box.querySelector('.skz-x').addEventListener('click',skizzeGrossZu);
  }
  box.querySelector('.skz-t').textContent=withConf(it.conf,configTitle)+(it.name?' · '+it.name:'');
  box.querySelector('.skz-s').textContent=withConf(it.conf,prodSpecs);
  box.querySelector('.skz-draw').innerHTML=withConf(it.conf,function(){return stageSVG();});
  box.classList.add('on'); document.body.style.overflow='hidden';
  try{ box.querySelector('.skz-x').focus({preventScroll:true}); }catch(e){}
}
function skizzeGrossZu(){
  var box=document.getElementById('skzOverlay'); if(!box) return;
  box.classList.remove('on'); document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ var b=document.getElementById('skzOverlay'); if(b&&b.classList.contains('on')) skizzeGrossZu(); }
});

function cdItemHTML(it,i){
  var conf=it.conf, q=conf.anzahl||1;
  var sketch=skizzeSeite(conf,false);
  var title=withConf(conf,configTitle);
  var unit=posUnit(conf,it.lastPrice);
  var specs=posKeySpecs(conf);
  var bilder = '<div class="cd-draws"><figure class="cd-draw" onclick="skizzeGross('+i+')" role="button" tabindex="0" aria-label="Skizze gro&szlig; ansehen">'+sketch+'</figure></div>';

  return '<div class="cd-item">'+bilder
    +'<div class="cd-main">'
      +'<div class="cd-pos-no">Pos. '+(i+1)+'</div>'
      +'<div class="cd-title">'+title+(it.name?' · '+it.name:'')+'</div>'
      +'<div class="cd-specs">'+specs+'</div>'
      +'<input class="cd-raum" type="text" maxlength="40" placeholder="Raum (optional, z. B. Bad OG)" value="'+String(it.name||'').replace(/"/g,'&quot;')+'" oninput="itemNameSetzen('+i+',this.value)" aria-label="Raumbezeichnung f&uuml;r Position '+(i+1)+'">'
    +'</div>'
    +'<div class="cd-row"><div class="cd-price'+(unit==null?' is-offen':'')+'">'+eurOffen(unit==null?null:unit*q)

      +((unit!=null && q>1) ? '<span class="cd-stueck">'+eur(unit)+' / St\u00fcck</span>' : '')
      +'</div><div class="cd-qty"><button type="button" onclick="itemQty('+i+',-1);renderCartDrawer()" aria-label="Menge verringern">&minus;</button><span>'+q+'</span><button type="button" onclick="itemQty('+i+',1);renderCartDrawer()" aria-label="Menge erhöhen">+</button></div></div>'
    +'<div class="cd-acts"><button type="button" class="cd-edit" onclick="cdEdit('+i+')">Bearbeiten</button><button type="button" class="cd-del" onclick="itemRemove('+i+');renderCartDrawer()">Entfernen</button></div>'
    +'</div>';
}
function renderCartDrawer(){
  var body=document.getElementById('cdBody'), foot=document.getElementById('cdFoot'), ship=document.getElementById('cdShip');
  if(!body||!foot) return;

  if(ship && cart.length){
    var _hw='';
    if(korbPreiseNeu) _hw+='<div class="cd-hinweis">Ihre Zusammenstellung lag eine Weile — die Preise sind auf den aktuellen Stand gebracht.</div>';
    else if(korbAlterTage!==null && korbAlterTage>=2) _hw+='<div class="cd-hinweis">Vor '+korbAlterTage+' Tagen zusammengestellt. Preise sind aktuell.</div>';
    ship.dataset.hinweis=_hw;
  }
  if(ship){ if(!cart.length){ ship.innerHTML=''; } else {

    var _q=cartTotals().qty, _hs=cartTotals().hasHS;
    var _rest = _q<LIEFER_MIN ? (LIEFER_MIN-_q) : (10-_q);
    var _wort = _rest===1 ? 'Element' : 'Elemente';
    var _pct  = Math.min(100, Math.round(_q/10*100));

    if(_q>=10)
      ship.innerHTML='<div class="cd-ship-msg reached"><b>Kostenlose Lieferung</b> deutschlandweit erreicht</div><div class="cd-ship-bar reached"><i style="width:100%"></i></div>';
    else if(_hs)
      ship.innerHTML='<div class="cd-ship-msg"><b>Hebe-Schiebet\u00fcr:</b> Direktlieferung vom Hersteller f\u00fcr <b>300 \u20ac</b> \u2014 auch unter '+LIEFER_MIN+' Elementen. Ab 10 Elementen kostenfrei.</div><div class="cd-ship-bar"><i style="width:'+_pct+'%"></i></div>';
    else if(_q<LIEFER_MIN)
      ship.innerHTML='<div class="cd-ship-msg"><b>Abholung im Lager</b> (kostenlos). Ab '+LIEFER_MIN+' Elementen liefern wir \u2014 noch <b>'+_rest+' '+_wort+'</b>.</div><div class="cd-ship-bar"><i style="width:'+_pct+'%"></i></div>';
    else
      ship.innerHTML='<div class="cd-ship-msg">Lieferung m\u00f6glich. Noch <b>'+_rest+' '+_wort+'</b> bis zur <b>kostenlosen</b> Lieferung.</div><div class="cd-ship-bar"><i style="width:'+_pct+'%"></i></div>';
    if(korbSpeicherFehler)
      ship.innerHTML = '<div class="cd-hinweis" style="text-align:left">Ihr Browser speichert diese Zusammenstellung nicht '
        + '(privates Fenster oder voller Speicher). Bitte schlie\u00dfen Sie die Anfrage in dieser Sitzung ab \u2014 '
        + 'nach dem Schlie\u00dfen des Tabs w\u00e4re sie verloren.</div>' + ship.innerHTML;
    ship.innerHTML = (ship.dataset.hinweis||'') + ship.innerHTML;
  } }
  if(!cart.length){
    body.innerHTML='<div class="cd-empty">'+(korbVerfallen?'<div class="cd-hinweis" style="text-align:left">Ihre fr\u00fchere Zusammenstellung war '+KORB_TAGE+' Tage alt und wurde entfernt, damit Sie keine veralteten Preise sehen. Sie k\u00f6nnen sie in wenigen Schritten neu zusammenstellen.</div>':'')+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="46" height="46" style="opacity:.35"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Dein Warenkorb ist noch leer.</p></div>';
    foot.innerHTML='<button type="button" class="cd-cta" onclick="closeCartDrawer()">Jetzt konfigurieren</button>';
    foot.classList.add('is-leer');
    return;
  }
  var t=cartTotals();
  foot.classList.remove('is-leer');

  body.innerHTML=cart.map(function(it,i){
    try{ return cdItemHTML(it,i); }
    catch(e){ return '<div class="cd-item"><div class="cd-hinweis" style="text-align:left">'
      +'Diese Position l\u00e4sst sich nicht mehr anzeigen. Bitte entfernen und neu zusammenstellen.'
      +'</div><button type="button" class="cd-del" onclick="itemRemove('+i+');renderCartDrawer()">Entfernen</button></div>'; }
  }).join('')
    +lieferWahlHTML(t,'cd-liefer')
    +'<div class="cd-sum"><span>Zwischensumme ('+t.qty+')</span><b>'+(totalOffen(t)?'Auf Anfrage':eur(t.sub))+'</b></div>'
    +offenNote(t)
    +'<div class="cd-note">'+(t.shipNote||'')+'</div>'
    +'<button type="button" class="cd-more" onclick="cdWeiteresProdukt()">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="17" height="17"><path d="M12 5v14M5 12h14"/></svg>'
    +'Weiteres Produkt konfigurieren</button>'
    +'<button type="button" class="cd-cont" onclick="closeCartDrawer()">Zur&uuml;ck zur Konfiguration</button>';

  var _aufschluss = '';
  if(!totalOffen(t) && cart.length){
    _aufschluss = '<div class="cd-zeile"><span>Zwischensumme</span><span>'+eur(t.sub)+'</span></div>'
      + '<div class="cd-zeile"><span>'+(liefer==='abholung'?'Abholung im Lager':'Lieferung')+'</span><span>'
      + (t.ship>0 ? eur(t.ship) : 'kostenlos')+'</span></div>';
  }
  foot.innerHTML=_aufschluss+'<div class="cd-tot"><span>Gesamt</span><b>'+totalText(t)+'</b></div>'
    +'<div class="cd-mwst">'+(totalOffen(t)?'Preis nennen wir im Angebot · unverbindlich, kein Kaufvertrag':'inkl. 19 % MwSt · unverbindlich, kein Kaufvertrag')+'</div>'
    +'<button type="button" class="cd-cta" onclick="cdToAnfrage()">Angebot anfordern &rarr;</button>'

    +'<div class="cd-trust"><span><span style="white-space:nowrap"><a href="https://www.google.com/maps?cid=9401727711250777966" target="_blank" rel="noopener" title="Alle Bewertungen bei Google ansehen" style="color:inherit;text-decoration:none">4,7 &middot; 93 Google-Bewertungen</a><a href="/impressum.html#bewertungen" title="Wie diese Bewertungen zustande kommen" aria-label="Wie diese Bewertungen zustande kommen" style="margin-left:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="vertical-align:-1px"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.15" fill="currentColor"/></svg></a></span></span><span>Familienbetrieb seit 1996</span>'
    +'<span>Antwort in 1&ndash;2 Werktagen</span><span>Kein Kaufzwang</span></div>';

  var _tt=document.getElementById('cdTitel');
  if(_tt){
    var _p=cart.length;
    _tt.innerHTML = (_p>1)
      ? _p+' Positionen'+(t.qty>_p?' &middot; '+t.qty+' St&uuml;ck':'')+' &mdash; <em>ein Angebot</em>.'
      : (t.qty>1 ? t.qty+' St&uuml;ck &mdash; <em>ein Angebot</em>.' : 'Ihr <em>Angebot</em>.');
  }
}
function openCartDrawer(){ renderCartDrawer(); var w=document.getElementById('cartDrawer'); if(!w)return; w.classList.add('on'); w.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; var x=w.querySelector('.cd-x'); if(x)x.focus(); }
function closeCartDrawer(){ var w=document.getElementById('cartDrawer'); if(!w)return; w.classList.remove('on'); w.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

function cdEdit(i){ closeCartDrawer(); itemEdit(i); setTimeout(oeffneSchritte,60); }

function cdWeiteresProdukt(){
  closeCartDrawer();
  editIndex = -1;
  backToPicker();
}
function cdToAnfrage(){ if(!cart.length){ closeCartDrawer(); return; } closeCartDrawer(); if(!started){ itemEdit(cart.length-1); } anfrageView='form'; var idx=STEPS.findIndex(function(s){return s.key==='anfrage';}); if(idx>=0){ go(idx); } else { location.href='warenkorb.html'; } }

document.addEventListener('click',function(e){ if(!e.target.closest)return; var a=e.target.closest('a[href*="warenkorb"]'); if(a){ e.preventDefault(); openCartDrawer(); } });
const PRODUCTS=[

  {id:'fenster',t:'Fenster',sub:'Kunststoff · Holz · Aluminium',img:'img/karten/fenster-weiss.webp?v=norm1',fallback:'ab 79 €'},
  {id:'balkon',t:'Balkontür',img:'img/karten/balkontuer-weiss.webp?v=norm1',fallback:'ab 274 €'},
  {id:'haustuer',t:'Haustür',img:'img/karten/haustuer-weiss.webp?v=norm1',fallback:'ab 872 €'},
  {id:'schiebe',t:'Schiebetür',img:'img/karten/hst-weiss.webp?v=norm1',fallback:'ab 1.411 €'},
  {id:'rollladen',t:'Vorsatzrollladen',img:'img/karten/vorsatzrollladen-weiss.webp?v=1',fallback:'auf Anfrage'},
];

function abLabel(p){
  const v=abPreis(p.id);
  return (v==null)?p.fallback:('ab '+Math.round(v).toLocaleString('de-DE')+' €');
}
function renderPicker(){
  /* Die fuenf "ab"-Preise in einem Zug anfordern statt einzeln beim Zeichnen -
     sonst schickt die Seite beim Aufbau fuenf getrennte Anfragen los. Was
     schon bekannt ist, wird dabei uebersprungen. */
  try{ preisVorrat(PRODUCTS.map(p=>defaultConfig(p.id))); }catch(e){}
  const cards=PRODUCTS.map(p=>`<button type="button" class="pcard" onclick="startProduct('${p.id}')">
    <div class="pimg"><img src="${p.img}" alt="${p.t} (KI-generiertes Symbolbild)"><span class="ai-badge">KI-Symbolbild</span></div>
    <div class="pinfo">
      <div class="pt">${p.t}</div>${p.sub?`<div class="psub">${p.sub}</div>`:''}<div class="pp">${abLabel(p)} <span class="pp-mass">· nach Maß</span><span class="pp-zus">inkl. MwSt · zzgl. Lieferung</span></div>
      <div class="pgo">Konfigurieren <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></div>
    </div></button>`).join('');
  const truck=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`;
  const fork=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4v11h8V9h5l4 4v2h-2"/><circle cx="6" cy="18" r="2"/><path d="M14 4h4"/></svg>`;
  const door=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M9 12h.01"/></svg>`;
  const boxic=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>`;
  const checkic=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  document.getElementById('pickerView').innerHTML=
    `<div class="pk-head2">
       <h1>Was möchten Sie <span class="accent">konfigurieren</span>?</h1>
       <p>Maßgenau, kostenlos &amp; unverbindlich — Ihr Angebot per E-Mail.</p></div>
     <div class="pk-carousel">
       <button type="button" class="pk-arrow pk-prev" aria-label="Vorheriges Produkt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
       <div class="pk-grid" id="pkGrid">${cards}</div>
       <button type="button" class="pk-arrow pk-next" aria-label="Nächstes Produkt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
     </div>
     <div class="pk-dots" id="pkDots">${PRODUCTS.map((_,i)=>`<button type="button" class="pk-dot${i===0?' on':''}" aria-label="Produkt ${i+1}"></button>`).join('')}</div>
     <button class="lf-infobtn" onclick="document.body.classList.add('lf-open')">${truck} Lieferung &amp; Abholung — so kommt's zu Ihnen<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;opacity:.6"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
     <div class="lf-backdrop" onclick="document.body.classList.remove('lf-open')"></div>
     <div class="liefer">
       <button class="lf-close" aria-label="Schließen" onclick="document.body.classList.remove('lf-open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
       <div class="lf-title">${truck} So kommen Ihre Produkte zu Ihnen</div>
       <div class="lf-tiers">
         <div class="lf-tier"><span class="lf-ic">${boxic}</span><div class="lf-txt"><b>1–4 Elemente</b><span>Abholung im Lager · Brandenburg a.d.H.</span></div><span class="lf-tag">gratis</span></div>
         <div class="lf-tier"><span class="lf-ic">${truck}</span><div class="lf-txt"><b>5–9 Elemente</b><span>Lieferung deutschlandweit</span></div><span class="lf-tag price">239 €</span></div>
         <div class="lf-tier hot"><span class="lf-ic">${checkic}</span><div class="lf-txt"><b>ab 10 Elemente</b><span>Lieferung deutschlandweit</span></div><span class="lf-tag free">kostenlos</span></div>
       </div>
       <div class="lf-hints">
         <span>${fork} Anlieferung per Stapler auf Einwegpalette — Sie müssen nichts abladen</span>
         <span>${door} Hebe-Schiebetür: Direktlieferung vom Hersteller · 300 € (ab 10 Elementen frei)</span>
       </div>
     </div>
     <div class="pk-trust">100 % kostenlos &amp; unverbindlich <span>· kein Kaufvertrag, keine Verpflichtung · Familienbetrieb aus Brandenburg seit 1996</span></div>
     <div style="text-align:center;font-size:11px;color:var(--ink-soft);margin-top:12px">Produkt-Vorschaubilder sind KI-Symboldarstellungen.</div>`;
  setupPkCarousel();
}

function setupPkCarousel(){
  const grid=document.getElementById('pkGrid'); if(!grid) return;
  const cards=[].slice.call(grid.querySelectorAll('.pcard'));
  const dots=[].slice.call(document.querySelectorAll('#pkDots .pk-dot'));
  const prev=document.querySelector('.pk-prev'), next=document.querySelector('.pk-next');
  function current(){ const c=grid.scrollLeft+grid.clientWidth/2; let best=0,bd=1e9;
    cards.forEach(function(el,i){var cc=el.offsetLeft+el.offsetWidth/2,d=Math.abs(cc-c); if(d<bd){bd=d;best=i;}}); return best; }
  function to(i){ i=Math.max(0,Math.min(cards.length-1,i)); var el=cards[i]; if(!el)return;
    grid.scrollTo({left:el.offsetLeft-(grid.clientWidth-el.offsetWidth)/2, behavior:'smooth'}); }
  function upd(){ var i=current(); dots.forEach(function(d,j){d.classList.toggle('on',j===i);}); }
  if(prev) prev.onclick=function(e){e.stopPropagation();to(current()-1);};
  if(next) next.onclick=function(e){e.stopPropagation();to(current()+1);};
  dots.forEach(function(d,i){ d.onclick=function(){to(i);}; });
  grid.addEventListener('scroll',function(){clearTimeout(grid._t);grid._t=setTimeout(upd,60);},{passive:true});
  upd();
}

const ROLL_KASTEN=[
  {v:'e137', form:'e', kh:137, n:'137 mm', hMax:1300},
  {v:'e165', form:'e', kh:165, n:'165 mm', hMax:2200},
  {v:'e180', form:'e', kh:180, n:'180 mm', hMax:2700},
  {v:'o139', form:'o', kh:144, n:'139 mm', hMax:1300},
  {v:'o167', form:'o', kh:171, n:'167 mm', hMax:2200},
  {v:'o182', form:'o', kh:188, n:'182 mm', hMax:2700},
];

const ROLL_FORM={
  e:{n:'Eckiger Kasten', d:'eckigem Kasten', s:'kantig · Revision vorne'},
  o:{n:'Runder Kasten',  d:'rundem Kasten',  s:'gerundet · Revision vorne'}
};
const ROLL_ANTRIEB={
  gurt:  {n:'Gurtwickler', s:'von Hand · Gurt im Mauerwerk'},
  kurbel:{n:'Kurbel',      s:'von Hand · abnehmbare Kurbel'},
  motor: {n:'Motor',       s:'auf Knopfdruck · Schalter innen'},
};
function rollKast(){ return ROLL_KASTEN.find(function(x){return x.v===S.rlKasten;}) || ROLL_KASTEN[0]; }

function rollKastenMoeglich(h){ h=+h||0; return ROLL_KASTEN.filter(function(x){ return h<=x.hMax; }); }
function rollKastenPasst(){ return (+S.h||0) <= rollKast().hMax; }

function rollKastenNachziehen(){
  if(S.prod!=='rollladen') return false;
  var form=rollKast().form;
  var reihe=ROLL_KASTEN.filter(function(x){ return x.form===form; });
  var passend=reihe.filter(function(x){ return (+S.h||0)<=x.hMax; });
  var neu;
  if(!rollKastenPasst()){

    neu = passend[0] || reihe[reihe.length-1];
  }else if(!S.rlKastenManuell && passend.length && passend[0].v!==S.rlKasten){

    neu = passend[0];
  }
  if(neu && neu.v!==S.rlKasten){ S.rlKasten=neu.v; return true; }
  return false;
}
function rollFarbe(k){ var i=S['rl'+k]; return (i!=null && COLORS_ROLL[i]) ? COLORS_ROLL[i].c : COLORS_ROLL[0].c; }
function rollFarbeName(k){ var i=S['rl'+k]; return (i!=null && COLORS_ROLL[i]) ? COLORS_ROLL[i].n : COLORS_ROLL[0].n; }
function rollEndC(){ return (S.rlEndleiste!=null && COLORS_ROLL[S.rlEndleiste]) ? COLORS_ROLL[S.rlEndleiste].c : rollFarbe('Panzer'); }
function rollEndName(){ return (S.rlEndleiste!=null && COLORS_ROLL[S.rlEndleiste]) ? COLORS_ROLL[S.rlEndleiste].n : 'wie Panzer'; }
function rollAntriebText(){
  var a=ROLL_ANTRIEB[S.rlAntrieb]||ROLL_ANTRIEB.gurt;
  return a.n+' '+(S.rlSeite==='links'?'links':'rechts');
}
function setRollKasten(v){
  S.rlKasten=v;
  S.rlKastenManuell=true;
  render(); maybeAutoAdvance();
}

function setRollForm(f){
  var akt=rollKast();
  if(akt.form===f){ maybeAutoAdvance(); return; }
  var alteReihe=ROLL_KASTEN.filter(function(x){ return x.form===akt.form; });
  var rang=Math.max(0, alteReihe.findIndex(function(x){ return x.v===akt.v; }));
  var neueReihe=ROLL_KASTEN.filter(function(x){ return x.form===f; });
  var neu=neueReihe[rang]||neueReihe[0];
  S.rlKasten=neu.v;
  rollKastenNachziehen();
  render(); maybeAutoAdvance();
}

function setRollAntrieb(art,seite,vonSeite){
  S.rlAntrieb=art; S.rlSeite=seite; render();
  if(vonSeite) _rollWeiter();
}
function _rollWeiter(){
  if(cur>=STEPS.length-1) return;
  clearTimeout(_advTimer);
  _advTimer=setTimeout(function(){ if(STEPS[cur]&&STEPS[cur].key==='rlantrieb') go(cur+1); }, 240);
}

function defaultConfig(id){
  const p=id||'fenster';
  const dim={fenster:[500,500],balkon:[600,1800],haustuer:[900,2000],schiebe:[1800,1800],rollladen:[900,900]}[p]||[1000,1200];
  return {
    prod:p,
    aufteilung:'1fl',

    anschlagIdx:(p==='balkon')?0:(p==='fenster'?ANSCHLAG['1fl'].findIndex(function(o){return o.oeff&&o.oeff[0]==='fest';}):(ANSCHLAG_DEFIDX['1fl']||1)),
    material:'kunststoff', holzart:'kiefer',
    profile:'classic',
    hstSystem:'psk', pskKammer:'iglo5', hstSchloss:'ohne',
    roll:'kein', panzer:null, endleiste:null, rollSeite:'rechts',
    sproTyp:'keine', sproDicke:'27', sproRaster:'kreuz', sicher:false,
    glass:(p==='schiebe')?'3':'2', glasdekor:'klar', schall:false,
    outer:0, inner:0, colorTarget:'a', anzahl:1,
    griff:'mistral', griffTuer:'klinke', griffAussen:'klinke', stossHoehe:'1200', hstTeilung:'2', hstLauf:'rechts', balkonSchwelle:'ohne',
    doorModel:'vollglas-inox',

    rlKasten:'e137', rlKastenManuell:false, rlAntrieb:'gurt', rlSeite:'rechts',
    rlPanzer:0, rlKastenF:0, rlSchiene:0, rlEndleiste:null,
    w:dim[0], h:dim[1]
  };
}

function abPreis(id){
  const bak=Object.assign({},S);
  try{ Object.assign(S,defaultConfig(id)); const p=price(); return (typeof p==='number')?p:null; }
  catch(e){ return null; }
  finally{ Object.assign(S,bak); }
}
function startProduct(id){

  Object.assign(S,defaultConfig(id));
  STEPS=stepsFor(); started=true; cur=0;
  editIndex=-1;
  window.scrollTo({top:0}); render(); wizHistory();
}

function commitCurrent(){

  if(!massOk()){ zumMassSchritt(); return; }
  if(editIndex>=0&&cart[editIndex]){ cart[editIndex].conf={...S}; }
  else { const _jetzt=price(); cart.unshift({conf:{...S},name:'',lastPrice:(typeof _jetzt==='number'&&_jetzt>0)?_jetzt:(_letzterPreis||0)}); editIndex=0; }
  saveCart();
  openCartDrawer();
}

function cartToast(){
  if(!document.getElementById('cartToastCSS')){ const st=document.createElement('style'); st.id='cartToastCSS';
    st.textContent='#cartToast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);z-index:9999;display:flex;align-items:center;gap:9px;background:#1a9e4b;color:#fff;font:700 14.5px/1 var(--sans,sans-serif);padding:13px 20px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:.28s cubic-bezier(.16,1,.3,1)}#cartToast.show{opacity:1;transform:translate(-50%,0)}#cartToast svg{width:17px;height:17px}';
    document.head.appendChild(st); }
  let t=document.getElementById('cartToast');
  if(!t){ t=document.createElement('div'); t.id='cartToast'; document.body.appendChild(t); }
  t.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg> In Ihr Angebot gelegt';
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(cartToast._h); cartToast._h=setTimeout(()=>t.classList.remove('show'),2200);
}
function setHstSystem(v){ S.hstSystem=v; S.hstTeilung='2'; massKlemmen(); STEPS=buildSchiebeSteps(); if(cur>=STEPS.length)cur=STEPS.length-1; render(); maybeAutoAdvance(); }
function backToPicker(){ started=false; anfrageView='cart'; window.scrollTo({top:0}); render(); wizHistory(); }

function cartHatAktuelles(){
  try{
    if(!cart.length) return false;
    var j = JSON.stringify(S);
    return cart.some(function(it){ return it && it.conf && JSON.stringify(it.conf) === j; });
  }catch(e){ return false; }
}
function askSwitchProduct(){ if(started && cur>0 && editIndex<0 && !cartHatAktuelles()){ document.getElementById('pwModal').classList.add('on'); document.body.style.overflow='hidden'; var b=document.querySelector('#pwModal .pw-primary'); if(b) b.focus(); } else { backToPicker(); } }
function closePwModal(){ var m=document.getElementById('pwModal'); if(m) m.classList.remove('on'); document.body.style.overflow=''; }
function confirmSwitchProduct(){ closePwModal(); backToPicker(); }
function showAnfrage(){ anfrageView='form'; window.scrollTo({top:0}); render(); setTimeout(()=>document.querySelector('.co-form input')?.focus({preventScroll:true}),40); }

function miniWin(opening){
  const gx1=14,gy1=10,gx2=86,gy2=104,mx=50,my=57;
  let l; if(opening==='fest')l=`<path d="M${gx1} ${gy1} L${gx2} ${gy2} M${gx2} ${gy1} L${gx1} ${gy2}"/>`;
  else if(opening==='kipp')l=`<path d="M${gx1} ${gy1} L${mx} ${gy2} L${gx2} ${gy1}"/>`;
  else if(opening==='dkl')l=`<path d="M${gx1} ${gy1} L${gx2} ${my} L${gx1} ${gy2}"/><path d="M${gx1} ${gy1} L${mx} ${gy2} L${gx2} ${gy1}"/>`;
  else l=`<path d="M${gx2} ${gy1} L${gx1} ${my} L${gx2} ${gy2}"/><path d="M${gx1} ${gy1} L${mx} ${gy2} L${gx2} ${gy1}"/>`;
  return `<svg viewBox="0 0 100 114"><rect x="6" y="4" width="88" height="106" rx="3" fill="#faf8f4" stroke="#DED9D0" stroke-width="1.4"/><rect x="14" y="10" width="72" height="94" fill="#eef1f4" stroke="#DED9D0"/><g stroke="#9aa3b0" stroke-width="1.4" fill="none">${l}</g></svg>`;
}

function ocText(field,val,t,s,delta){
  const on=S[field]===val; const vv=typeof val==='string'?`'${val}'`:val;
  return `<div class="ocard ${on?'on':''}" onclick="set('${field}',${vv})"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
}
function ocImg(field,val,img,t,s,delta){
  const on=S[field]===val; const vv=typeof val==='string'?`'${val}'`:val;
  return `<div class="ocard ${on?'on':''}" onclick="set('${field}',${vv})"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${img}" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
}

function massZusatz(){
  if(S.prod!=='fenster') return '';
  var teile='';
  if(lichtAktiv() && _LICHT[_lichtKey(null)]){
    var zeile=function(feld,typFeld,titel){
      var typ=S[typFeld]||'fest', g=lichtGrenzen(typ), gK=lichtGrenzen('kipp');
      var wert=+S[feld]||g.min;
      var kippGeht = gK && gK.da && (+S.w||0)>=gK.bMin;

      return '<div class="vb-zeile"><div class="vb-seite">'+titel+'<span class="vb-laenge">'+(typ==='kipp'?'zum Kippen · ':(typ==='dk-l'||typ==='dk-r')?'dreh- und kippbar · ':'fest · ')+g.min+'–'+g.max+' mm</span></div>'
        +'<div class="mrow lichtrow"><input type="number" inputmode="numeric" min="'+g.min+'" max="'+g.max+'" value="'+wert+'" oninput="setLichtH(\''+feld+'\',this.value)" onfocus="this.select()"><span class="unit">mm</span></div></div>';
    };
    var z='';
    if(S.licht==='ober'||S.licht==='beide') z+=zeile('olH','olTyp','Höhe Oberlicht');
    if(S.licht==='unter'||S.licht==='beide') z+=zeile('ulH','ulTyp','Höhe Unterlicht');
    teile+=grp('Höhe der Lichter','vb-grp',
      '<div class="vb-intro">Die Höhe oben ist die des <b>Hauptfensters</b>. Das Licht kommt oben bzw. unten dazu.</div>'
      +z+'<div class="vb-summe">Gesamthöhe: '+lichtGesamtHoehe()+' mm</div>');
  }
  return teile;
}
function ocIcon(field,val,icon,t,s,delta){
  const on=S[field]===val; const vv=typeof val==='string'?`'${val}'`:val;
  return `<div class="ocard ${on?'on':''}" onclick="set('${field}',${vv})"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis" style="height:84px;place-items:center">${icon}</div><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
}
function grp(title,cls,inner,aiNote){return `<div class="card"><div class="grp-title">${title}</div><div class="opts ${cls}">${inner}</div>${aiNote?`<p class="ai-note">${aiNote}</p>`:''}</div>`;}

const KI_BILD_PFAD = /(?:^|\/)img\/(karten\/|farben\/|glas-|sicher-|rolladen-|sprossen|glasdekor\/|drutex-griffe\/|drutex-tueren\/studio\/|profil-farben\/|schwelle-|_p-)/i;

const KI_HINWEIS = {
  material:  'Die Material-Abbildungen sind KI-generierte Symbolbilder.',
  holzart:   'Die Holzart-Abbildungen sind KI-generierte Symbolbilder; der echte Farbton haengt von Holz und Lasur ab.',
  profil:    'Die Profil-Abbildungen sind KI-generierte Symbolbilder.',
  psk:       'Die Profil-Abbildungen sind KI-generierte Symbolbilder.',
  lauf:      'Die System-Abbildungen sind KI-generierte Symbolbilder.',
  aufteilung:'Die Abbildungen der Flügelaufteilung sind KI-generierte Symbolbilder.',
  oeffnung:  'Die Abbildungen der Öffnungsarten sind KI-generierte Symbolbilder; die eingezeichneten Öffnungsrichtungen entsprechen der DIN-Darstellung.',
  modell:    'Die Türmodell-Abbildungen sind KI-generierte Symbolbilder.',
  motiv:     'Die Glasmotiv-Abbildungen sind KI-generierte Symbolbilder.',
  griff:     'Die Griff-Abbildungen sind KI-generierte Symbolbilder.',
  griffhst:  'Die Griff-Abbildungen sind KI-generierte Symbolbilder.',
  griffTuer: 'Die Griff-Abbildungen sind KI-generierte Symbolbilder.',
  schwelle:  'Die Schwellen-Abbildungen sind KI-generierte Symbolbilder.'
};
function kiHinweisHTML(key){ const h=KI_HINWEIS[key]; return h?`<p class="ai-note">${h}</p>`:''; }

function choiceCardImg(on,fn,img,t,s,werte){
  const liste=(werte&&werte.length)
    ? `<dl class="pspecs">${werte.map(([k,v])=>`<div class="pspec"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`
    : '';
  return `<div class="ocard ${on?'on':''}" onclick="${fn}"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${img}" loading="lazy" decoding="async" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}${liste}</div>`;
}
function panelHTML(){
  const k=STEPS[cur].key;
  if(k==='material'){
    return grp('Material','three', Object.keys(MATERIALS).map(function(m){
      return choiceCardImg(S.material===m, "setMaterial('"+m+"')", materialBild(m), MATERIALS[m].n, MATERIALS[m].s);
    }).join(''));
  }
  if(k==='holzart'){
    return grp('Holzart','two', Object.keys(HOLZARTEN).map(function(h){
      return choiceCardImg(S.holzart===h, "setHolzart('"+h+"')", holzartBild(h), HOLZARTEN[h].n, HOLZARTEN[h].s);
    }).join(''));
  }
  if(k==='profil'){
    if(S.prod==='schiebe'){
      const c=(val,img,t,s)=>`<div class="ocard ${S.hstSystem===val?'on':''}" onclick="setHstSystem('${val}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${img}?v=1" loading="lazy" decoding="async" alt="${t}"></div><div class="t">${t}</div><div class="s">${s}</div></div>`;
      return grp('Schiebe-System','two',
        c('psk','img/karten/profil/iglo-psk.webp','PSK Schiebetür','Kippen + seitlich schieben · mittelgroße Öffnungen · bis 160 kg')+
        c('hs','img/karten/profil/iglo-hs.webp','Hebe-Schiebetür','Anheben + schieben · große, raumhohe Terrassenfronten'));
    }

    const _mat=(S.prod==='fenster')?(S.material||'kunststoff'):'kunststoff';
    const _liste=PROFILE_KAT[_mat].filter(function(p){ return !(p.v==='edge' && S.prod==='haustuer'); });

    const _cls=((_liste.length>2) ? ('three'+((_liste.length%3)?' mitte':'')) : 'two')+' profilw';
    return grp('Profil-System', _cls, _liste.map(function(p){
      return choiceCardImg(S.profile===p.v, "setProfil('"+p.v+"')", profilBild(_mat,p), p.t, p.s||'', p.sp);
    }).join(''));
  }
  if(k==='psk'){
    return grp('PSK-Kammer-System','three',
      ocImg('pskKammer','iglo5','img/karten/profil/iglo5-zentriert.webp','IGLO 5 Classic PSK','5-Kammer · 70 mm','inklusive')+
      ocImg('pskKammer','iglo-energy','img/karten/profil/iglo-energy-classic-zentriert.webp','IGLO Energy Classic PSK','7-Kammer · 82 mm','')+
      ocImg('pskKammer','edge','img/karten/profil/iglo-edge-zentriert.webp','IGLO EDGE PSK','7-Kammer · 82 mm',''));
  }
  if(k==='griffhst'){
    const CHK='<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>';
    const fix=(img,t)=>`<div class="ocard on">${CHK}<div class="vis"><img src="${img}" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div></div>`;

    const farbHinweis='<div style="font-size:12.5px;color:#6b7280;margin:-4px 4px 16px;line-height:1.5">Die Griffe sind hier weiß abgebildet — die <b>Griff-Farbe passt sich automatisch Ihrer gewählten Rahmenfarbe an</b>.</div>';

    const schlossZu=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2.4"/><path d="M8.2 10.5V7.4a3.8 3.8 0 0 1 7.6 0v3.1"/><circle cx="12" cy="15.2" r="1.5"/><path d="M12 16.7v1.5"/></svg>`;
    const schlossAuf=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2.4"/><path d="M8.2 10.5V7.4a3.8 3.8 0 0 1 7.3-1.3"/><circle cx="12" cy="15.2" r="1.5"/><path d="M12 16.7v1.5"/></svg>`;
    const schloss=`<div class="card"><div class="grp-title">Abschließbar?</div><div class="opts two">`
        +ocIcon('hstSchloss','ohne',schlossAuf,'Nicht abschließbar','Standardgriff innen','')
        +ocIcon('hstSchloss','innen-aussen',schlossZu,'Abschließbar','Griff mit Schloss, innen und außen','')
      +`</div></div>`;
    if(S.hstSystem==='hs'){

      return `<div class="card"><div class="grp-title">Serien-Griffe — innen &amp; außen</div><div class="opts two griffvis">`
          +fix('img/drutex-griffe/hst-hebel-weiss-cut.webp','Innengriff')
          +fix('img/drutex-griffe/hst-muschel-weiss-cut.webp','Außengriff')
        +`</div></div>`+farbHinweis+schloss;
    }

    return `<div class="card"><div class="grp-title">PSK-Griff</div>`
        +`<div style="display:flex;align-items:center;gap:22px;border:2px solid var(--primary,#225eaa);border-radius:16px;padding:16px 22px;background:#fff;position:relative">`
          +`<span style="position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:50%;background:var(--primary,#225eaa);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`
          +`<div style="flex:0 0 100px;text-align:center"><img src="img/drutex-griffe/psk-set-weiss.webp" alt="PSK-Griff (KI-generiertes Symbolbild)" style="max-width:100%;max-height:120px;display:block;margin:0 auto"></div>`
          +`<div style="flex:1"><div style="font-size:16px;font-weight:800;color:#111827">PSK-Griff</div><div style="font-size:13px;color:#6b7280;margin-top:3px">Serienmäßig bei PSK-Schiebetüren</div></div>`
        +`</div>`
      +`</div>`+farbHinweis+schloss;
  }
  if(k==='aufteilung'){
    const auf=(val,img,t,dl0)=>{ const on=S.aufteilung===val; return `<div class="ocard ${on?'on':''}" onclick="setAufteilung('${val}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${img}" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div></div>`; };
    const afd=S.prod==='balkon'?'balkon-fluegel':'fluegel';

    const matSuffix=(S.prod==='fenster'&&S.material==='holz') ? '-'+(S.holzart||'kiefer')
                   : (S.prod==='fenster'&&S.material==='alu') ? '-alu' : '';
    const fbild=(nr)=>`img/karten/${afd}/${nr}-fluegel${afd==='fluegel'?matSuffix:''}.webp`;

    const _kein3=(S.prod==='fenster' && S.material==='alu');
    if(S.prod==='balkon'){
      return grp('Aufteilung','two', auf('1fl',fbild(1),'1 Flügel')+auf('2fl',fbild(2),'2 Flügel',''));
    }

    const lbild=(nr,art)=>`img/karten/fluegel/${nr}-${art}${matSuffix}.webp`;
    const kachel=(aufv,licht,img,t)=>{
      const on=(S.aufteilung===aufv && (S.licht||'ohne')===licht);
      return `<div class="ocard ${on?'on':''}" onclick="setAufteilungLicht('${aufv}','${licht}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${img}" loading="lazy" decoding="async" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div></div>`;
    };
    const zeile=(nr,aufv,wort)=>{
      let c=kachel(aufv,'ohne',fbild(nr),wort);
      if(lichtMoeglich()){
        c+=kachel(aufv,'ober',lbild(nr,'oberlicht'),wort+' + Oberlicht')
          +kachel(aufv,'unter',lbild(nr,'unterlicht'),wort+' + Unterlicht')
          +kachel(aufv,'beide',lbild(nr,'ober-unter'),wort+' + Ober- und Unterlicht');
      }
      return c;
    };
    let cards=zeile(1,'1fl','1 Flügel')+zeile(2,'2fl','2 Flügel');
    if(!_kein3) cards+=zeile(3,'3fl','3 Flügel');
    return grp('Aufteilung', lichtMoeglich()?'auft4':'three', cards);
  }
  if(k==='oeffnung'){
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;
    if(S.prod==='haustuer'){

      const richt=S.tuerOeffnung||'innen';
      const card=(idx,r,t,s)=>{ const on=(S.anschlagIdx===idx && richt===r), flip=(idx===1);
        return `<div class="ocard ${on?'on':''}" onclick="setTuerOeff(${idx},'${r}')">${tick}<div class="vis"><img src="img/karten/haus-fluegel/1-fluegel.webp?v=1"${flip?' style="transform:scaleX(-1)"':''} loading="lazy" decoding="async" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div><div class="s">${s}</div></div>`; };
      return `<div class="card"><div class="grp-title">Drehrichtung &amp; Anschlag (DIN)</div><div class="opts two">`
        +card(0,'innen','Links · Ansicht von innen','nach innen öffnend · Bänder links · Griff rechts')
        +card(1,'innen','Rechts · Ansicht von innen','nach innen öffnend · Bänder rechts · Griff links')
        +card(0,'aussen','Links · Ansicht von außen','nach außen öffnend · Bänder links')
        +card(1,'aussen','Rechts · Ansicht von außen','nach außen öffnend · Bänder rechts')
        +`</div></div>`;
    }

    const kombi=lichtKombis();
    if(kombi){
      const kk=kombi.map(c=>{
        const on=(S.anschlagIdx===c.idx && (S[c.feld]||'fest')===c.typ);
        return `<div class="ocard ${on?'on':''}" onclick="setAnschlagLicht(${c.idx},'${c.feld}','${c.typ}')">${tick}<div class="vis"><img src="${c.img}?v=1" loading="lazy" decoding="async" alt="${c.n}, ${c.s}"></div><div class="t">${c.n}</div><div class="s">${c.s}</div></div>`;
      }).join('');
      const wort=(S.licht==='ober')?'Oberlicht':'Unterlicht';
      return `<div class="card"><div class="grp-title">Öffnungsart</div>`
        +`<div class="vb-intro" style="margin:0 0 10px">Ihr Fenster hat ein ${wort}. Die Kachel zeigt beides zusammen: wie der Flügel öffnet und ob das Glasfeld fest verglast ist, sich kippen oder auch drehen lässt.</div>`
        +`<div class="opts ${kombi.length>4?'three':'two'}">${kk}</div></div>`;
    }

    const set=anschlagSet();

    let liste=set.map((o,idx)=>({o:o,idx:idx}));
    if(S.prod==='fenster' && lichtAktiv() && S.aufteilung==='1fl')
      liste=liste.filter(x=>x.o.oeff.length!==1 || (x.o.oeff[0]!=='kipp' && x.o.oeff[0]!=='fest'));
    if(liste.length && !liste.some(x=>x.idx===S.anschlagIdx)){ S.anschlagIdx=liste[0].idx; syncOpening(); }
    const cards=liste.map(({o,idx})=>{ const on=S.anschlagIdx===idx; const oimg=oeffCardImg(o);
      const vis = oimg
        ? `<div class="vis"><img src="${oimg}?v=1" loading="lazy" decoding="async" alt="${o.n}"></div>`
        : `<div class="vis anschlagvis">${miniAnschlag(o.oeff,o.stulpAt||0)}</div>`;
      return `<div class="ocard ${on?'on':''}" onclick="setAnschlag(${idx})">${tick}${o.tag?`<span class="fav">${o.tag}</span>`:''}${vis}<div class="t">${o.n}</div></div>`;
    }).join('');
    const cols=liste.length<=2?'two':(liste.length===4?'two':'three');

    let lichtBlock='';
    if(S.prod==='fenster' && lichtAktiv() && _LICHT[_lichtKey(null)]){
      const gK=lichtGrenzen('kipp');
      const kippGeht = gK && gK.da && (+S.w||0)>=gK.bMin;
      const zeile=(typFeld,titel)=>{
        const typ=S[typFeld]||'fest';
        const k=`<button type="button" class="vb-chip ${typ==='fest'?'on':''}" onclick="setLichtTyp('${typFeld}','fest')">fest verglast</button>`
          + ((gK&&gK.da)?`<button type="button" class="vb-chip ${typ==='kipp'?'on':''}"${kippGeht?'':' disabled title="Zum Kippen muss das Fenster mindestens '+gK.bMin+' mm breit sein."'} onclick="setLichtTyp('${typFeld}','kipp')">zum Kippen</button>`:'');
        return `<div class="vb-zeile"><div class="vb-seite">${titel}</div><div class="vb-chips">${k}</div></div>`;
      };
      let z='';
      if(S.licht==='ober'||S.licht==='beide') z+=zeile('olTyp','Oberlicht');
      if(S.licht==='unter'||S.licht==='beide') z+=zeile('ulTyp','Unterlicht');
      lichtBlock=grp('Öffnungsart des Lichts','vb-grp',
        `<div class="vb-intro">Das Glasfeld über bzw. unter dem Fenster kann fest verglast sein oder sich zum Lüften kippen lassen.</div>${z}`);
    }

    const lichtNote = (S.prod==='fenster' && lichtAktiv())
      ? `<div class="vb-intro" style="margin:0 0 10px">Ihr Fenster hat zusätzlich ${S.licht==='beide'?'ein Ober- und ein Unterlicht':(S.licht==='ober'?'ein Oberlicht':'ein Unterlicht')}. Die Bilder zeigen nur die Flügel; wie das Glasfeld öffnet, wählen Sie darunter.</div>`
      : '';
    return `<div class="card"><div class="grp-title">Öffnungsart je Flügel</div>${lichtNote}<div class="opts ${cols}">${cards}</div></div>`+lichtBlock;
  }
  if(k==='modell'){
    const cards=DOORS.map(d=>{ const on=S.doorModel===d.k;
      return `<div class="ocard door ${on?'on':''}" onclick="set('doorModel','${d.k}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis" style="height:300px;background:#f4f6f8;display:flex;align-items:center;justify-content:center;border-radius:10px 10px 0 0"><img src="${DOORIMG(d.k)}" style="max-width:94%;max-height:96%;object-fit:contain;display:block" loading="lazy" decoding="async" alt="${d.n}"></div><div class="t">${d.n}</div></div>`;
    }).join('');
    return `<div class="card"><div class="grp-title">Türmodell — ${DOORS.length} Designs</div><div class="opts three doorgrid">${cards}</div></div>`;
  }
  if(k==='griffTuer'){
    if(!S.griffAussen) S.griffAussen=_griffAussenVal();
    if(!S.stossHoehe) S.stossHoehe='1200';
    S.griffTuer=S.griffAussen;
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;

    const ga=(val,img,t,sub)=>
      `<div class="ocard ${S.griffAussen===val?'on':''}" onclick="setGriffAussen('${val}')">${tick}<div class="vis"><img src="${img}" alt="${t} (KI-generiertes Symbolbild)"></div><div class="t">${t}</div>${sub?`<div class="s">${sub}</div>`:''}</div>`;
    let html=`<div class="griff-cols">`

      +`<div class="card"><div class="grp-title">Innen</div><div class="griff-fest"><img src="img/drutex-griffe/klinke-innen-silber-cut.webp" alt="Drückergarnitur innen (KI-generiertes Symbolbild)"><div class="gf-txt"><span class="gf-t">Drückergarnitur</span><span class="gf-s">Klinke innen · immer enthalten</span></div></div></div>`
      +`<div class="card"><div class="grp-title">Außen</div><div class="opts three griff-aussen">`
      +ga('klinke','img/drutex-griffe/htg-flach-silber-cut.webp','Drückergarnitur','Klinke außen')
      +ga('knauf','img/drutex-griffe/knauf-silber-cut.webp','Knauf','fester Knauf außen')
      +ga('stoss','img/drutex-griffe/stoss-q45r-cut.webp','Stoßgriff','Edelstahl-Stange')
      +`</div></div>`
      +`</div>`;
    if(S.griffAussen==='stoss'){
      const pills=STOSS_HOEHEN.map(mm=>
        `<button type="button" class="spro-pill ${(S.stossHoehe||'1200')===mm?'on':''}" onclick="setStossHoehe('${mm}')">${mm} mm</button>`).join('');
      html+=`<div class="card"><div class="grp-title">Stoßgriff-Höhe</div><div class="spro-pills">${pills}</div></div>`;
    }
    return html;
  }
  if(k==='teilung'){
    const two=`<svg viewBox="0 0 40 30" fill="none" stroke="var(--primary)" stroke-width="1.6" style="height:54px;width:auto"><rect x="2" y="3" width="36" height="24" rx="1"/><line x1="20" y1="3" x2="20" y2="27"/></svg>`;
    const three=`<svg viewBox="0 0 48 30" fill="none" stroke="var(--primary)" stroke-width="1.6" style="height:54px;width:auto"><rect x="2" y="3" width="44" height="24" rx="1"/><line x1="17.3" y1="3" x2="17.3" y2="27"/><line x1="32.6" y1="3" x2="32.6" y2="27"/></svg>`;
    return grp('Teilung','two', ocIcon('hstTeilung','2',two,'2-teilig','1 fest + 1 schiebbar','inklusive')+ocIcon('hstTeilung','3',three,'3-teilig','2 fest + 1 schiebbar',''));
  }
  if(k==='lauf'){
    const psk=S.hstSystem==='psk';
    const src=psk?'img/karten/profil/iglo-psk.webp':'img/karten/hst-fluegel/2-teilig-links.webp';
    const tL=psk?'Kipp-Schiebe links':'HebeSchiebe links', tR=psk?'Kipp-Schiebe rechts':'HebeSchiebe rechts';
    const sL=psk?'Schiebeflügel links · kippt + schiebt':'Schiebeflügel öffnet links', sR=psk?'Schiebeflügel rechts · kippt + schiebt':'Schiebeflügel öffnet rechts';
    const card=(val,flip,t,s)=>`<div class="ocard ${S.hstLauf===val?'on':''}" onclick="set('hstLauf','${val}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${src}?v=1"${flip?' style="transform:scaleX(-1)"':''} loading="lazy" decoding="async" alt="${t}"></div><div class="t">${t}</div><div class="s">${s}</div></div>`;
    return grp(psk?'Öffnungsrichtung':'Laufrichtung','two', card('links',false,tL,sL)+card('rechts',true,tR,sR));
  }
  if(k==='schwelle'){

    const scard=(val,src,t,s)=>`<div class="ocard ${S.balkonSchwelle===val?'on':''}" onclick="set('balkonSchwelle','${val}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis"><img src="${src}?v=1" loading="lazy" decoding="async" alt="${t}"></div><div class="t">${t}</div><div class="s">${s}</div></div>`;
    return grp('Bodenschwelle','two',
      scard('ohne','img/schwelle-ohne.webp','Ohne Schwelle','Standard-Ausführung')
     +scard('alu','img/schwelle-alu20.webp','Alu-Schwelle 20 mm','Niedrige Alu-Schwelle · bewitterungsbeständig'));
  }
  if(k==='anzahl') return `<div class="card"><div class="grp-title">Anzahl gleicher ${prodUnit()==='Fenster'?'Fenster':prodUnit()+'en'}</div>
    <div class="qwrap"><button class="qbtn" onclick="set('anzahl',Math.max(1,S.anzahl-1))">−</button><div class="qnum">${S.anzahl}</div><button class="qbtn" onclick="set('anzahl',Math.min(99,S.anzahl+1))">+</button></div>
    <div class="mhint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span>Der Preis gilt pro ${prodUnit()}. Abholung im Lager ist kostenlos. Geliefert wird ab 5 Elementen (5\u20139 St\u00fcck 239 \u20ac, ab 10 kostenfrei).</span></div></div>`;
  if(k==='glas'){

    const nurDrei=(S.profile==='edge'&&S.prod!=='haustuer')||(S.prod==='schiebe'&&S.pskKammer==='edge');
    if(nurDrei) return grp('Verglasung','two',
      ocImg('glass','3','img/glas-3fach.webp','3-fach Wärmeschutz','bei IGLO EDGE serienmäßig','inklusive'), 'Die Glas-Abbildungen sind KI-generierte Symbolbilder zur Veranschaulichung des Aufbaus.');
    return grp('Verglasung','two',
      ocImg('glass','2','img/glas-2fach.webp','2-fach Wärmeschutz','Standard','inklusive')+ocImg('glass','3','img/glas-3fach.webp','3-fach Wärmeschutz','beste Dämmung',''), 'Die Glas-Abbildungen sind KI-generierte Symbolbilder zur Veranschaulichung des Aufbaus.');
  }
  if(k==='motiv') return grp('Glasmotiv','two',
    ocImg('glasdekor','klar','img/glasdekor/klar.webp','Klarglas','klare Durchsicht','inklusive')+ocImg('glasdekor','satinato','img/glasdekor/satinato.webp','Satinato','blickdicht','')+ocImg('glasdekor','chinchilla','img/glasdekor/chinchilla.webp','Chinchilla','Struktur','')+ocImg('glasdekor','master','img/glasdekor/master-carre.webp','Master-Carré','Ornament',''));
  if(k==='schall'){
    const wave=`<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.9" stroke-linecap="round" style="height:52px;width:auto"><path d="M4 9.5v5M8 6.5v11M12 3.5v17M16 6.5v11M20 9.5v5"/></svg>`;
    return grp('Schallschutz','two', ocIcon('schall',false,wave,'Standardglas','','inklusive')+ocIcon('schall',true,wave,'Schallschutzglas','ruhigere Räume',''));
  }
  if(k==='griff') return grp('Griff','two griffvis',
    ocImg('griff','mistral','img/drutex-griffe/cdn/klamka-mistral-35mm-k-9016.webp','Mistral','Aluminium · klassisch elegant','inklusive')+
    ocImg('griff','abschliessbar','img/drutex-griffe/cdn/klamka-mistral-abschliessbar-weiss.webp','Mistral abschließbar','mit Schließzylinder',''));
  const ban=`<svg viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" stroke-width="1.5" style="height:60px;width:auto"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>`;
  if(k==='rollladen'){
    const seite=(S.rollSeite==='links')?'links':'rechts';

    const fwFelder=(key,cur,ersteLabel,ersteFarbe)=>
      `<div class="sw ${cur==null?'on':''}" onclick="set('${key}',null)"><div class="chip" style="background:${ersteFarbe}"></div><div class="nm">${ersteLabel}</div></div>`
      + rollFarbenFuer(key).map(({co,i})=>`<div class="sw ${cur===i?'on':''}" onclick="set('${key}',${i})"><div class="chip" style="background:${co.c}"></div><div class="nm">${co.n}</div></div>`).join('');
    const fwBlock=(titel,key,cur,ersteLabel,ersteFarbe,aktFarbe,aktText,hinweis)=>{
      const offen=_pzOffen[key];
      return `<div class="grp-title"${titel==='Farbe der Endleiste'?' style="margin-top:22px"':''}>${titel}</div>
        <button type="button" class="fw-akt" onclick="pzToggle('${key}')" aria-expanded="${offen}">
          <span class="fw-feld" style="background:${aktFarbe}"></span>
          <span class="fw-txt"><span class="fw-lbl">Gewählt</span><span class="fw-nm">${aktText}</span></span>
          <svg class="fw-pf${offen?' auf':''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        ${offen?`<div class="swatches fw-raster">${fwFelder(key,cur,ersteLabel,ersteFarbe)}</div>`
               :`<button type="button" class="fw-mehr" onclick="pzToggle('${key}')">Alle ${rollFarbenFuer(key).length} Rollladenfarben zeigen</button>`}
        <div class="pzhint">${hinweis}</div>`;
    };
    const pzpick = S.roll!=='kein'? `<div class="card" style="margin-top:16px">`
      + fwBlock('Panzerfarbe','panzer',S.panzer,'passend zum Rahmen',COLORS_AKT()[S.outer].c,
                panzerC(), panzerText(),
                'Den Panzer fertigt der Hersteller in eigenen Farben — nicht in den Fensterfolien. Welche Töne möglich sind, hängt zusätzlich von der Lamellenhöhe ab; wir bestätigen die Farbe mit dem Angebot.')
      + fwBlock('Farbe der Endleiste','endleiste',S.endleiste,'wie Panzer',panzerC(),
                endleisteC(), endleisteText(),
                'Die Endleiste ist die Abschlussleiste unten am Panzer.')
      + `</div>`:'';

    const rc=(rollV,vis,t,s)=>
      `<div class="ocard ${S.roll===rollV?'on':''}" onclick="setRoll('${rollV}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis">${vis}</div><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>`;

    const rimg=(art,li)=>`<img src="img/rolladen-${art}-r.webp?v=8" ${(li&&art==='gurt')?'class="mir" ':''}alt="${art==='gurt'?'Rollladen mit Gurtwickler '+(li?'links':'rechts'):'Rollladen mit Motorantrieb'} (KI-generiertes Symbolbild)" loading="lazy" decoding="async">`;

    const hatSeite=(S.roll==='gurt'||S.roll==='motor');
    const sBtn=(v)=>`<button type="button" class="rs-btn${seite===v?' on':''}" aria-pressed="${seite===v}" onclick="setRollSeite('${v}')">${v}</button>`;
    const seitenWahl = hatSeite ? `<div class="rollseite">
        <div class="rs-frage">${S.roll==='motor'?'Auf welcher Seite soll das Kabel herauskommen?':'Auf welcher Seite soll der Gurt sitzen?'} <span class="rs-von">(von innen gesehen)</span></div>
        <div class="rs-btns" role="group" aria-label="Bedienseite">${sBtn('links')}${sBtn('rechts')}</div>
      </div>` : '';
    return `<div class="card"><div class="grp-title">Rollladen</div><div class="opts roll3">`
      +rc('kein',ban,'Kein Rollladen','ohne')
      +rc('gurt',rimg('gurt',seite==='links'),'Gurtwickler','von Hand')
      +rc('motor',rimg('motor',0),'Motor','Knopfdruck')
      +`</div>${seitenWahl}
      <p class="ai-note">Die Rollladen-Abbildungen sind KI-generierte Symbolbilder.</p></div>${pzpick}`;
  }
  if(k==='sprossen'){
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;

    const tc=(val,vis,t,s,delta0)=>`<div class="ocard ${S.sproTyp===val?'on':''}" onclick="setSproTyp('${val}')">${tick}<div class="vis">${vis}</div><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
    let html=`<div class="spro-step"><div class="card"><div class="grp-title">Sprossen — Art</div><div class="opts three">`
      +tc('keine',ban,'Ohne Sprossen','','inklusive')
      +tc('aufgesetzt','<img src="img/sprossen-aufgesetzt.webp" alt="Aufgesetzt (KI-generiertes Symbolbild)">','Aufgesetzt','außen aufgesetzt · klassisch','')
      +tc('szr','<img src="img/sprossen-innenliegend.webp" alt="Im Glas (KI-generiertes Symbolbild)">','Im Glas (SZR)','innenliegend · pflegeleicht','')
      +`</div><p class="ai-note">Die Sprossen-Abbildungen sind KI-generierte Symbolbilder.</p></div>`;
    if(S.sproTyp&&S.sproTyp!=='keine'){

      const dks=(SPRO_DICKEN[S.sproTyp]||[]);
      const pills=dks.map(d=>`<button type="button" class="spro-pill ${S.sproDicke===d?'on':''}" onclick="setSproDicke('${d}')">${d} mm</button>`).join('');
      html+=`<div class="card"><div class="grp-title">Breite</div><div class="spro-pills">${pills}</div></div>`;

      const rc=Object.keys(SPRO_RASTER).map(rk=>{ const r=SPRO_RASTER[rk];
        return `<div class="ocard ${S.sproRaster===rk?'on':''}" onclick="setSproRaster('${rk}')">${tick}<div class="vis"><img src="img/karten/sprossen/sprossen-${S.sproTyp}-${rk}.webp?v=2026" alt="${r.name} (KI-generiertes Symbolbild)" loading="lazy" decoding="async"></div><div class="t">${r.name}</div></div>`;
      }).join('');
      html+=`<div class="card"><div class="grp-title">Aufteilung</div><div class="opts spro-raster">${rc}</div></div>`;
    }
    return html+`</div>`;
  }
  if(k==='sicherheit'){
    const shield=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" style="height:60px;width:auto"><path d="M12 2 4 5v6.5c0 4.8 3.4 8 8 9.5 4.6-1.5 8-4.7 8-9.5V5l-8-3Z"/><path d="M9.3 14v-2.2M12 14v-4.2M14.7 14v-6.2" stroke-width="2" stroke-linecap="round"/></svg>`;

    const shieldLock=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" style="height:60px;width:auto"><path d="M12 2 4 5v6.5c0 4.8 3.4 8 8 9.5 4.6-1.5 8-4.7 8-9.5V5l-8-3Z"/><rect x="9" y="11.2" width="6" height="5" rx="1.3" stroke-width="1.5"/><path d="M10.4 11.2v-1.5a1.6 1.6 0 0 1 3.2 0v1.5" stroke-width="1.5"/></svg>`;
    return grp('Einbruchschutz','two', ocIcon('sicher',false,shield,'Standardbeschlag','2 Pilzkopfverriegelungen','inklusive')+ocIcon('sicher',true,shieldLock,'Sicherheitsbeschlag','abschließbarer Griff · Verbundsicherheitsglas',''));
  }

  if(k==='rlform'){
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;

    const aktForm=rollKast().form;
    const karte=(f,bild,t,s)=>
      `<div class="ocard ${aktForm===f?'on':''}" onclick="setRollForm('${f}')">${tick}`
      +`<div class="vis"><img src="img/karten/${bild}?v=1" loading="lazy" decoding="async" alt="${t} (KI-generiertes Symbolbild)"><span class="ai-badge">KI-Symbolbild</span></div>`
      +`<div class="t">${t}</div><div class="s">${s}</div></div>`;
    return `<div class="card"><div class="grp-title">Kastenform</div>`
      +`<div class="vb-intro" style="margin:0 0 10px">Beide Formen fertigt der Hersteller aus Aluminium und beide sind von vorne zu öffnen. Der Unterschied ist die Optik an der Fassade — und die Bautiefe: der runde Kasten trägt etwas weiter auf.</div>`
      +`<div class="opts two formvis">`
      +karte('o','vorsatzrollladen-oval-weiss.webp','Runder Kasten','gerundete Front · weiche Linie')
      +karte('e','vorsatzrollladen-eckig-weiss.webp','Eckiger Kasten','abgekantete Front · klare Linie')
      +`</div>`
      +`<p class="ai-note">Die Abbildungen sind KI-generierte Symbolbilder.</p></div>`;
  }
  if(k==='rlkasten'){
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;

    const form=rollKast().form, hoehe=+S.h||0;

    const formBild='img/karten/vorsatzrollladen-'+(form==='o'?'oval':'eckig')+'-weiss.webp';
    const reihe=ROLL_KASTEN.filter(x=>x.form===form);

    const kleinstePasst=(reihe.filter(x=>hoehe<=x.hMax)[0]||{}).v;
    const kk=reihe.map(x=>{
      const geht=hoehe<=x.hMax, on=(S.rlKasten===x.v), empf=(x.v===kleinstePasst);
      const satz = !geht ? ('reicht nur bis '+x.hMax.toLocaleString('de-DE')+' mm — Ihr Rollladen ist höher')
                 : empf  ? ('die kleinste Größe für Ihre '+hoehe.toLocaleString('de-DE')+' mm')
                         : ('geht auch — größerer Kasten, trägt bis '+x.hMax.toLocaleString('de-DE')+' mm');
      return `<div class="ocard ${on?'on':''}${geht?'':' aus'}" ${geht?`onclick="setRollKasten('${x.v}')"`:''} aria-disabled="${!geht}">`
        +`${tick}<div class="vis"><img src="${formBild}?v=2" loading="lazy" decoding="async" alt="Vorsatzrollladen mit ${ROLL_FORM[form].n} (KI-generiertes Symbolbild)"><span class="ai-badge">KI-Symbolbild</span></div>`
        +`<div class="t">Kasten ${x.n}</div>`
        +`<div class="s">${satz}</div></div>`;
    }).join('');
    return `<div class="card"><div class="grp-title">Größe des Kastens</div>`
      +`<div class="vb-intro" style="margin:0 0 10px">Im Kasten liegt der aufgerollte Panzer — je höher der Rollladen, desto größer muss der Kasten sein. Sie haben <b>${hoehe.toLocaleString('de-DE')} mm</b> eingegeben; wir haben die passende Größe schon vorausgewählt. Ein größerer Kasten geht auch, ein kleinerer nicht.</div>`
      +`<div class="opts three kastenvis">${kk}</div>`
      +`<p class="ai-note">Die Abbildungen sind KI-generierte Symbolbilder.</p></div>`;
  }
  if(k==='rlfarbe'){

    const felder=(key,cur,ersteLabel,ersteFarbe)=>
      (ersteLabel?`<div class="sw ${cur==null?'on':''}" onclick="set('${key}',null)"><div class="chip" style="background:${ersteFarbe}"></div><div class="nm">${ersteLabel}</div></div>`:'')
      + rollFarbenFuer(key).map(({co,i})=>`<div class="sw ${cur===i?'on':''}" onclick="set('${key}',${i})"><div class="chip" style="background:${co.c}"></div><div class="nm">${co.n}</div></div>`).join('');
    const block=(titel,key,cur,ersteLabel,ersteFarbe,aktFarbe,aktText,hinweis,erstesFeld)=>{
      const offen=_pzOffen[key];
      return `<div class="grp-title"${erstesFeld?'':' style="margin-top:22px"'}>${titel}</div>
        <button type="button" class="fw-akt" onclick="pzToggle('${key}')" aria-expanded="${offen}">
          <span class="fw-feld" style="background:${aktFarbe}"></span>
          <span class="fw-txt"><span class="fw-lbl">Gewählt</span><span class="fw-nm">${aktText}</span></span>
          <svg class="fw-pf${offen?' auf':''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        ${offen?`<div class="swatches fw-raster">${felder(key,cur,ersteLabel,ersteFarbe)}</div>`
               :`<button type="button" class="fw-mehr" onclick="pzToggle('${key}')">Alle ${rollFarbenFuer(key).length} Farben zeigen</button>`}
        <div class="pzhint">${hinweis}</div>`;
    };
    return `<div class="card">`
      + block('Farbe des Panzers','rlPanzer',S.rlPanzer,null,null,rollFarbe('Panzer'),rollFarbeName('Panzer'),
              'Der Panzer besteht aus Aluminium-Lamellen, die mit Polyurethan gefüllt sind. Welche Farben möglich sind, hängt von der Lamellenhöhe ab; wir bestätigen die Farbe mit dem Angebot.',true)
      + block('Farbe der Endleiste','rlEndleiste',S.rlEndleiste,'wie Panzer',rollFarbe('Panzer'),rollEndC(),rollEndName(),
              'Die Endleiste ist die Abschlussleiste unten am Panzer — mit verdecktem Stopper.')
      + block('Farbe des Kastens','rlKastenF',S.rlKastenF,null,null,rollFarbe('KastenF'),rollFarbeName('KastenF'),
              'Kasten und Führungsschienen liefert der Hersteller auch in der RAL-Palette.')
      + block('Farbe der Führungsschienen','rlSchiene',S.rlSchiene,null,null,rollFarbe('Schiene'),rollFarbeName('Schiene'),
              'In den Schienen läuft der Panzer. Sie sind 44 mm breit.')
      + `</div>`;
  }
  if(k==='rlantrieb'){
    const tick=`<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span>`;

    const formBild='img/karten/vorsatzrollladen-'+(rollKast().form==='o'?'oval':'eckig')+'-weiss.webp';
    const karte=(art,t,s2)=>
      `<div class="ocard ${S.rlAntrieb===art?'on':''}" onclick="setRollAntrieb('${art}','${S.rlSeite||'rechts'}')">${tick}`
      +`<div class="vis"><img src="${formBild}?v=2" loading="lazy" decoding="async" alt="Vorsatzrollladen, ${t} (KI-generiertes Symbolbild)"><span class="ai-badge">KI-Symbolbild</span></div>`
      +`<div class="t">${t}</div><div class="s">${s2}</div></div>`;
    const seite=(S.rlSeite==='links')?'links':'rechts';
    const sBtn=v=>`<button type="button" class="rs-btn${seite===v?' on':''}" aria-pressed="${seite===v}" onclick="setRollAntrieb('${S.rlAntrieb||'gurt'}','${v}',true)">${v}</button>`;
    const frage=(S.rlAntrieb==='motor')?'Auf welcher Seite soll das Kabel herauskommen?'
              :(S.rlAntrieb==='kurbel')?'Auf welcher Seite soll die Kurbel sitzen?'
              :'Auf welcher Seite soll der Gurt sitzen?';
    return `<div class="card"><div class="grp-title">Bedienung</div>`
      +`<div class="opts three antriebvis">`
      +karte('gurt','Mit Gurt','Der Gurt läuft in die Wand und wird von innen gezogen.')
      +karte('kurbel','Mit Kurbel','Eine abnehmbare Kurbel, die von innen gedreht wird.')
      +karte('motor','Mit Motor','Auf Knopfdruck — ein Schalter an der Wand.')
      +`</div>`
      +`<div class="rollseite"><div class="rs-frage">${frage} <span class="rs-von">(von außen gesehen)</span></div>`
      +`<div class="rs-btns" role="group" aria-label="Bedienseite">${sBtn('links')}${sBtn('rechts')}</div></div>`
      +`<p class="ai-note">Die Abbildungen sind KI-generierte Symbolbilder.</p></div>`;
  }
  if(k==='masse'){
    const L=massLimits();
    return `<div class="card massecard"><div class="grp-title">Maße eingeben</div>
      <div class="mgrid">
        <div class="mfield"><label for="mW">Breite <span class="mrange">${L.bMin}–${L.bMax} mm</span></label><div class="mrow"><input id="mW" type="number" inputmode="numeric" enterkeyhint="next" min="0" value="${S.w}" oninput="setMass('w',this.value)" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();var h=document.getElementById('mH');if(h){h.focus();h.select();}}"><span class="unit">mm</span></div></div>
        <div class="mfield"><label for="mH">Höhe <span class="mrange">${L.hMin}–${L.hMax} mm</span></label><div class="mrow"><input id="mH" type="number" inputmode="numeric" enterkeyhint="done" min="0" value="${S.h}" oninput="setMass('h',this.value)" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"><span class="unit">mm</span></div></div>
      </div>
      <div id="massWarn" class="masswarn" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg><span></span></div>
      ${messhilfeHTML()}
      </div>`+massZusatz();
  }
  if(k==='licht'){
    const e=_LICHT[_lichtKey(null)];
    if(!e) return grp('Ober- und Unterlicht','two',
      '<div class="vb-hinweis">Für dieses Profil bieten wir Ober- und Unterlicht noch nicht an.</div>');

    const pik=(ober,unter)=>{
      let inner='';
      if(ober) inner+='<line x1="8" y1="17" x2="52" y2="17"/>';
      if(unter) inner+='<line x1="8" y1="43" x2="52" y2="43"/>';
      return `<svg viewBox="0 0 60 60" width="58" height="58" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="8" y="6" width="44" height="48" rx="1.5"/>${inner}</svg>`;
    };
    const karte=(val,ober,unter,t,sub)=>
      `<div class="ocard ${S.licht===val?'on':''}" onclick="setLicht('${val}')"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis" style="height:76px;place-items:center">${pik(ober,unter)}</div><div class="t">${t}</div><div class="s">${sub}</div></div>`;
    const karten=karte('ohne',0,0,'Ohne','Ein durchgehendes Fenster.')
      +karte('ober',1,0,'Oberlicht','Glasfeld über dem Fenster.')
      +karte('unter',0,1,'Unterlicht','Glasfeld unter dem Fenster.')
      +karte('beide',1,1,'Beides','Oben und unten je ein Feld.');
    if(!lichtAktiv()) return grp('Ober- und Unterlicht','four',karten);
    const zeile=(feld,typFeld,titel)=>{
      const typ=S[typFeld]||'fest', g=lichtGrenzen(typ), gK=lichtGrenzen('kipp');
      const wert=+S[feld]||g.min;
      const kippGeht = gK && gK.da && (+S.w||0)>=gK.bMin;
      const typKnoepfe=`<button type="button" class="vb-chip ${typ==='fest'?'on':''}" onclick="setLichtTyp('${typFeld}','fest')">fest</button>`
        + (gK&&gK.da ? `<button type="button" class="vb-chip ${typ==='kipp'?'on':''}"${kippGeht?'':' disabled title="Zum Kippen muss das Fenster mindestens '+gK.bMin+' mm breit sein."'} onclick="setLichtTyp('${typFeld}','kipp')">zum Kippen</button>` : '');
      return `<div class="vb-zeile"><div class="vb-seite">${titel}<span class="vb-laenge">${g.min}–${g.max} mm</span></div>
        <div class="vb-chips">${typKnoepfe}</div>
        <div class="mrow lichtrow"><input type="number" inputmode="numeric" min="${g.min}" max="${g.max}" value="${wert}" oninput="setLichtH('${feld}',this.value)" onfocus="this.select()"><span class="unit">mm</span></div></div>`;
    };
    let zeilen='';
    if(S.licht==='ober'||S.licht==='beide') zeilen+=zeile('olH','olTyp','Höhe Oberlicht');
    if(S.licht==='unter'||S.licht==='beide') zeilen+=zeile('ulH','ulTyp','Höhe Unterlicht');
    return grp('Ober- und Unterlicht','four',karten)
      + grp('Höhe der Lichter','vb-grp',
        `<div class="vb-intro">Die Höhe im nächsten Schritt ist die des <b>Hauptfensters</b>. Das Licht kommt oben bzw. unten dazu.</div>${zeilen}
         <div class="vb-summe">Gesamthöhe: ${lichtGesamtHoehe()} mm</div>`);
  }
  if(k==='verbreiterung'){

    const br=_verbrBreiten();
    if(!br.length) return grp('Rahmenverbreiterung','two',
      '<div class="vb-hinweis">Für dieses Profil ist noch kein Verbreiterungspreis hinterlegt. '
      +'Schreiben Sie es uns bei der Anfrage dazu — wir rechnen es von Hand.</div>');
    const seiten=[['vbL','Links','Höhe',S.h],['vbR','Rechts','Höhe',S.h],
                  ['vbO','Oben','Breite',S.w],['vbU','Unten','Breite',S.w]];
    const rahmenIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="4" width="14" height="16" rx="1"/><path d="M9 4v16"/></svg>';
    const rahmenPlus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="6" width="10" height="12" rx="1"/><path d="M10 6v12"/><path d="M3.5 3.5v17M20.5 3.5v17" stroke-dasharray="2.5 2"/></svg>';
    const karten=
      `<div class="ocard ${!S.vbAn?'on':''}" onclick="setVerbrAn(false)"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis" style="height:84px;place-items:center">${rahmenIcon}</div><div class="t">Ohne Verbreiterung</div><div class="s">Das Fenster passt genau in die Öffnung.</div></div>`
     +`<div class="ocard ${S.vbAn?'on':''}" onclick="setVerbrAn(true)"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><div class="vis" style="height:84px;place-items:center">${rahmenPlus}</div><div class="t">Mit Verbreiterung</div><div class="s">Die alte Öffnung ist größer — der Spalt wird gefüllt.</div></div>`;
    if(!S.vbAn) return grp('Rahmenverbreiterung','two',karten);
    const zeilen=seiten.map(function(x){
      const feld=x[0], akt=+S[feld]||0;
      const knoepfe=[`<button type="button" class="vb-chip ${akt===0?'on':''}" onclick="setVerbr('${feld}',0)">ohne</button>`]
        .concat(br.map(function(b){
          return `<button type="button" class="vb-chip ${akt===b.mm?'on':''}" onclick="setVerbr('${feld}',${b.mm})" title="${b.t}">${b.mm}</button>`;
        })).join('');
      return `<div class="vb-zeile"><div class="vb-seite">${x[1]}<span class="vb-laenge">${x[2]} ${x[3]} mm</span></div>`
           + `<div class="vb-chips">${knoepfe}</div></div>`;
    }).join('');
    const summe = verbrAktiv()
      ? `<div class="vb-summe">Gewählt: ${verbrText()}</div>`
      : `<div class="vb-summe vb-offen">Noch keine Seite gewählt.</div>`;
    return grp('Rahmenverbreiterung','two',karten)
      + grp('Welche Seiten?','vb-grp',
        `<div class="vb-intro">Alle Breiten in Millimeter. Ihr Fenstermaß bleibt unverändert — die Verbreiterung kommt außen dazu.</div>${zeilen}${summe}`);
  }

function messhilfeHTML(){
  return `<div class="messhilfe">
    <p class="mh-kern"><b>Gemessen wird die Maueröffnung ohne Putz</b> — das Rohbaumaß.
      Den Abzug für die Montagefuge machen wir: Ihr Fenster wird 10–20 mm kleiner gefertigt.</p>
    <details class="mh-mehr">
      <summary>So messen Sie richtig</summary>
      <div class="mh-inhalt">
        <svg class="mh-skizze" viewBox="0 0 260 170" role="img" aria-label="Skizze: Breite und Höhe der Maueröffnung werden an je drei Stellen gemessen.">
          <rect x="4" y="4" width="252" height="162" rx="4" fill="#eef2f8" stroke="#d3d9e6"/>
          <rect x="46" y="34" width="168" height="104" fill="#fff" stroke="#225eaa" stroke-width="2"/>
          <g stroke="#225eaa" stroke-width="1.4" stroke-dasharray="4 3" opacity=".75">
            <line x1="46" y1="48" x2="214" y2="48"/><line x1="46" y1="86" x2="214" y2="86"/><line x1="46" y1="124" x2="214" y2="124"/>
            <line x1="62" y1="34" x2="62" y2="138"/><line x1="130" y1="34" x2="130" y2="138"/><line x1="198" y1="34" x2="198" y2="138"/>
          </g>
          <g stroke="#14181d" stroke-width="1.6" fill="none">
            <line x1="46" y1="152" x2="214" y2="152"/>
            <path d="M46 148v8M214 148v8"/>
            <line x1="26" y1="34" x2="26" y2="138"/>
            <path d="M22 34h8M22 138h8"/>
          </g>
          <text x="130" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#14181d" font-family="Manrope,sans-serif">Breite</text>
          <text x="16" y="90" text-anchor="middle" font-size="11" font-weight="700" fill="#14181d" font-family="Manrope,sans-serif" transform="rotate(-90 16 90)">Höhe</text>
          <text x="130" y="24" text-anchor="middle" font-size="10.5" fill="#5b626b" font-family="Manrope,sans-serif">Maueröffnung — Putz nicht mitmessen</text>
        </svg>
        <ol class="mh-schritte">
          <li>Breite an <b>drei Stellen</b> messen: oben, in der Mitte, unten.</li>
          <li>Höhe ebenso an <b>drei Stellen</b>: links, Mitte, rechts.</li>
          <li>Vom jeweiligen Ergebnis das <b>kleinste Maß</b> eintragen.</li>
        </ol>
        <p class="mh-fuss">Alte Fenster sitzen selten gerade — deshalb die drei Punkte.
          Im Zweifel lieber zweimal messen: für die Maße im Auftrag haften Sie selbst.
          <a href="/faq.html#aufmass" target="_blank" rel="noopener">Ausführlich in den häufigen Fragen</a></p>
      </div>
    </details>
  </div>`;
}
  if(k==='farbe'){
    const co=COLORS_AKT()[S.outer],ci=COLORS_AKT()[S.inner];
    const innenFarbig=(S.inner!==0);

    const sw=COLORS_AKT().map((c,i)=>
      `<div class="sw ${S.outer===i?'on':''}" onclick="pickOuter(${i})"><div class="chip" style="background:${c.c}"></div><div class="nm">${c.n}</div></div>`
    ).join('');
    const innenStack=`<div class="innen-stack">`
      +`<button type="button" class="innen-pill ${S.inner===0?'on':''}" onclick="setInnenWeiss()"><span class="segdot" style="background:${COLORS_AKT()[0].c}"></span>Weiß</button>`
      +`<button type="button" class="innen-pill ${innenFarbig?'on':''}" onclick="setInnenFarbig()"><span class="segdot" style="background:${co.c}"></span>Farbig</button>`
      +`<span class="innen-hint">Farbig = innen wie außen</span></div>`;

    const aussen=S.colorTarget!=='i';
    const reiter=`<div class="fseite" role="tablist" aria-label="Welche Seite färben?">`
      +`<button type="button" role="tab" class="fs-tab ${aussen?'on':''}" aria-selected="${aussen}" onclick="setFarbSeite('a')">`
        +`<span class="fs-dot" style="background:${co.c}"></span>`
        +`<span class="fs-txt"><span class="fs-lb">Außen</span><span class="fs-wert">${co.n}</span></span></button>`
      +`<button type="button" role="tab" class="fs-tab ${!aussen?'on':''}" aria-selected="${!aussen}" onclick="setFarbSeite('i')">`
        +`<span class="fs-dot" style="background:${ci.c}"></span>`
        +`<span class="fs-txt"><span class="fs-lb">Innen</span><span class="fs-wert">${ci.n}</span></span></button>`
      +`</div>`;
    const inhalt = aussen
      ? `<div class="card"><div class="grp-title">Außenfarbe <span class="grp-zus">zur Straße</span></div><div class="swatches">${sw}</div></div>`
      : `<div class="card"><div class="grp-title">Innenfarbe <span class="grp-zus">zum Raum</span></div>${innenStack}</div>`;
    return reiter+inhalt;
  }
  if(k==='extras'){
    const row=(key,t,s,dl,inc)=>`<label class="optrow ${S[key]?'on':''}" onclick="toggle('${key}')"><span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><span><span class="ot">${t}</span><br><span class="os">${s}</span></span></label>`;
    const glass=`<label class="optrow ${S.glass==='3'?'on':''}" onclick="toggleGlass()"><span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><span><span class="ot">3-fach Verglasung</span><br><span class="os">noch bessere Dämmung (sonst 2-fach inkl.)</span></span></label>`;
    return `<div class="card"><div class="grp-title">Extras — alles freiwillig</div>${glass}${row('roll','Rollladenkasten','Sicht- & Sonnenschutz','+ 78 €')}${row('schall','Schallschutzglas','für ruhigere Räume','+ 95 €')}${row('sprossen','Sprossen','klassische Fenster-Optik','+ 60 €')}${row('sicher','Sicherheitsbeschlag','erschwert Aufhebeln','+ 140 €')}</div>`;
  }
  if(k==='anfrage'){ return anfrageHTML(); }
}

const PROFN=(function(){
  var namen={};
  try{ Object.keys(PROFILE_KAT).forEach(function(mat){
    (PROFILE_KAT[mat]||[]).forEach(function(k){ if(k&&k.v&&k.t) namen[k.v]=k.t; });
  }); }catch(e){}
  return namen;
})();

function profilName(schluessel){ return PROFN[schluessel] || (schluessel ? String(schluessel) : '—'); }

function profilText(){
  const p=profilName(S.profile)||'—';
  return (S.prod==='fenster'&&S.material==='holz'&&HOLZARTEN[S.holzart]) ? (p+' \u00b7 '+HOLZARTEN[S.holzart].n) : p;
}
const AUFTN={'1fl':'1 Flügel','2fl':'2 Flügel','3fl':'3 Flügel',ol:'Mit Oberlicht'};
const DEKON={klar:'Klarglas',satinato:'Satinato',chinchilla:'Chinchilla',master:'Master-Carré'};

const SPRO_DICKEN={aufgesetzt:['27','45','65'], szr:['18','26','45']};
const SPRO_RASTER={senk2:{name:'Senkrecht',v:1,h:0}, waag2:{name:'Waagerecht',v:0,h:1}, kreuz:{name:'Kreuz · 4 Felder',v:1,h:1}, feld6:{name:'6 Felder',v:2,h:1}, feld9:{name:'9 Felder',v:2,h:2}};
const SPROTYPN={keine:'Ohne',aufgesetzt:'Aufgesetzt',szr:'Im Glas (SZR)'};
const GRIFFN={mistral:'Mistral',abschliessbar:'Mistral abschließbar'};

function summaryPanel(){
  const co=COLORS_AKT()[S.outer], ci=COLORS_AKT()[S.inner];

  if(S.prod==='rollladen'){
    const _p=(k,v)=>v?`<div class="ak-p"><em>${k}</em><b>${v}</b></div>`:'';
    const _d=c=>`<span class="dot" style="background:${c}"></span>`;
    const kas=rollKast();
    return `<div class="ak"><div class="ak-txt">
        <div class="ak-mass"><b class="tnum">${S.w} × ${S.h} mm</b><span>${S.anzahl} Stück</span></div>
        <div class="ak-satz">Vorsatzrollladen mit <b>${ROLL_FORM[kas.form].d} ${kas.n}</b>, ${rollAntriebText()}.</div>
        <span class="ak-chip">Maß inkl. Kasten</span>
      </div></div><div class="ak-list">`
      +_p('Kasten',`${ROLL_FORM[kas.form].n} · ${kas.n}`)
      +_p('Panzer',`${_d(rollFarbe('Panzer'))}${rollFarbeName('Panzer')}`)
      +_p('Endleiste',`${_d(rollEndC())}${rollEndName()}`)
      +_p('Kastenfarbe',`${_d(rollFarbe('KastenF'))}${rollFarbeName('KastenF')}`)
      +_p('Führungsschienen',`${_d(rollFarbe('Schiene'))}${rollFarbeName('Schiene')}`)
      +_p('Antrieb',rollAntriebText())
      +`</div>`;
  }
  const ai=anschlagInfo();
  const hebe=t=>String(t==null?'':t).replace(/\b(links|rechts|innen|außen)\b/gi,'<b>$1</b>');
  const p=(k,v)=>v?`<div class="ak-p"><em>${k}</em><b>${v}</b></div>`:'';
  const dot=c=>`<span class="dot" style="background:${c}"></span>`;

  const kopf=`<div class="ak">
      <div class="ak-txt">
        <div class="ak-mass"><b class="tnum">${S.w} × ${S.h} mm</b><span>${S.anzahl} Stück</span></div>
        <div class="ak-satz">${hebe(ai.satz)}</div>
        <span class="ak-chip">${ai.chip}</span>
      </div>
    </div>`;

  const farbP = p('Farbe außen',`${dot(co.c)}${co.n}`)+p('Farbe innen',`${dot(ci.c)}${ci.n}`);

  const glasP = p('Verglasung',S.glass==='3'?'3-fach':'2-fach')+p('Glasmotiv',DEKON[S.glasdekor]||'Klarglas');

  const pzP = (S.roll!=='kein')
    ? p('Panzerfarbe',`${dot(panzerC())}${panzerText()}`)+p('Endleiste',`${dot(endleisteC())}${endleisteText()}`)
    : '';

  const rollP = p('Rollladen', S.roll!=='kein'?rollText():'ohne');

  if(S.prod==='haustuer'){
    return kopf+`<div class="ak-list">`
      +p('Modell',DOORN[S.doorModel]||'—')
      +p('Profil',profilName(S.profile))
      +farbP
      +glasP
      +p('Griff außen',(GRIFFT[_griffAussenVal()]||'—')+(_griffAussenVal()==='stoss'?` · ${S.stossHoehe||'1200'} mm`:''))
      +p('Griff innen','Drückergarnitur')
      +p('Sicherheit',S.sicher?'Mehrfachverriegelung':'Standard')
      +`</div>`;
  }
  if(S.prod==='schiebe'){
    const psk=S.hstSystem!=='hs';

    const bauP = psk
      ? p('PSK-System',S.pskKammer==='iglo-energy'?'IGLO Energy Classic PSK':'IGLO 5 Classic PSK')
      : p('Teilung',S.hstTeilung==='3'?'3-teilig · 2 fest + 1 schiebbar':'2-teilig · 1 fest + 1 schiebbar');
    return kopf+`<div class="ak-list">`
      +p('System',psk?'PSK Schiebetür':'Hebe-Schiebetür')
      +bauP
      +farbP
      +glasP
      +p('Griff',psk?'PSK-Griff':'Innengriff + Außengriff')
      +p('Schloss',S.hstSchloss==='innen-aussen'?'abschließbar':'Standard')
      +rollP
      +pzP
      +`</div>`;
  }

  const sproN=(S.sproTyp&&S.sproTyp!=='keine')
    ? ((SPROTYPN[S.sproTyp]||'')+' · '+S.sproDicke+' mm · '+((SPRO_RASTER[S.sproRaster]||{}).name||''))
    : 'ohne';

  const schwelleP = (S.prod==='balkon') ? p('Schwelle',S.balkonSchwelle==='alu'?'Aluschwelle':'ohne') : '';

  const schallP = S.schall ? p('Schallschutz','Schallschutzglas') : '';
  return kopf+`<div class="ak-list">`
    +p('Aufteilung',AUFTN[S.aufteilung])
    +p('Profil',profilName(S.profile))
    +farbP
    +glasP
    +schallP
    +p('Griff',GRIFFN[S.griff]||'—')
    +p('Sicherheit',S.sicher?'Sicherheitsbeschlag':'Standardbeschlag')
    +p('Sprossen',sproN)
    +schwelleP
    +rollP
    +pzP
    +`</div>`;
}
function summaryRows(){
  const co=COLORS_AKT()[S.outer],ci=COLORS_AKT()[S.inner];
  const pzRows = (S.roll!=='kein')
    ? `<div class="srow"><span class="k">Panzerfarbe</span><span class="v"><span class="dot" style="background:${panzerC()}"></span>${panzerText()}</span></div>`
      +`<div class="srow"><span class="k">Farbe Endleiste</span><span class="v"><span class="dot" style="background:${endleisteC()}"></span>${endleisteText()}</span></div>`
    : '';
  const massRow=`<div class="srow"><span class="k">Maße</span><span class="v tnum">${S.w} × ${S.h} mm</span></div><div class="srow"><span class="k">Anzahl</span><span class="v tnum">${S.anzahl} Stück</span></div>`;
  const colorRows=`<div class="srow"><span class="k">Außenfarbe</span><span class="v"><span class="dot" style="background:${co.c}"></span>${co.n}</span></div><div class="srow"><span class="k">Innenfarbe</span><span class="v"><span class="dot" style="background:${ci.c}"></span>${ci.n}</span></div>`;

  const aRow=(()=>{ const ai=anschlagInfo();
    return `<div class="srow"><span class="k">${ai.label}</span><span class="v">${ai.norm}`
      +(ai.klartext?`<span class="vsub" style="display:block;font-weight:500;color:#6b7280;margin-top:2px">${ai.klartext}</span>`:'')
      +(ai.ansicht?`<span class="vsub" style="display:block;font-weight:500;color:#6b7280">${ai.ansicht}</span>`:'')
      +`</span></div>`; })();
  if(S.prod==='rollladen'){
    const kas=rollKast(), d=c=>`<span class="dot" style="background:${c}"></span>`;
    const r=(k,v)=>`<div class="srow"><span class="k">${k}</span><span class="v">${v}</span></div>`;
    return r('Produkt','Vorsatzrollladen')
      +r('Kasten',`${ROLL_FORM[kas.form].n} · ${kas.n}`)
      +massRow
      +r('Panzerfarbe',`${d(rollFarbe('Panzer'))}${rollFarbeName('Panzer')}`)
      +r('Farbe Endleiste',`${d(rollEndC())}${rollEndName()}`)
      +r('Kastenfarbe',`${d(rollFarbe('KastenF'))}${rollFarbeName('KastenF')}`)
      +r('Führungsschienen',`${d(rollFarbe('Schiene'))}${rollFarbeName('Schiene')}`)
      +r('Antrieb',rollAntriebText());
  }
  if(S.prod==='haustuer'){
    return `<div class="srow"><span class="k">Profil</span><span class="v">${profilName(S.profile)}</span></div>
      ${aRow}
      <div class="srow"><span class="k">Modell</span><span class="v">${DOORN[S.doorModel]||'—'}</span></div>${massRow}${colorRows}
      <div class="srow"><span class="k">Verglasung</span><span class="v">${S.glass==='3'?'3-fach':'2-fach'} · ${DEKON[S.glasdekor]}</span></div>
      <div class="srow"><span class="k">Griff</span><span class="v">${griffTuerFull()}</span></div>
      <div class="srow"><span class="k">Sicherheit</span><span class="v">${S.sicher?'Mehrfachverriegelung':'Standard'}</span></div>`;
  }
  if(S.prod==='schiebe'){
    const psk=S.hstSystem!=='hs';
    const kammerRow=psk?`<div class="srow"><span class="k">PSK-System</span><span class="v">${S.pskKammer==='iglo-energy'?'IGLO Energy Classic PSK':'IGLO 5 Classic PSK'}</span></div>`:'';
    const griffN=(S.hstSystem==='hs'?'Innengriff + Außengriff':'PSK-Griff')+(S.hstSchloss==='innen-aussen'?' · abschließbar':'');
    return `<div class="srow"><span class="k">System</span><span class="v">${psk?'PSK Schiebetür':'Hebe-Schiebetür'}</span></div>${kammerRow}
      ${aRow}${massRow}${colorRows}
      <div class="srow"><span class="k">Verglasung</span><span class="v">${S.glass==='3'?'3-fach':'2-fach'}</span></div>
      <div class="srow"><span class="k">Griff</span><span class="v">${griffN}</span></div>
      <div class="srow"><span class="k">Rollladen</span><span class="v">${rollText()}</span></div>${pzRows}`;
  }

  const rollRow=`<div class="srow"><span class="k">Rollladen</span><span class="v">${rollText()}</span></div>`;
  const ex=[]; if(S.schall)ex.push('Schallschutz'); if(S.sicher)ex.push('Sicherheitsbeschlag');

  const sproN=(S.sproTyp&&S.sproTyp!=='keine')?((SPROTYPN[S.sproTyp]||'')+' · '+S.sproDicke+' mm · '+((SPRO_RASTER[S.sproRaster]||{}).name||'')):'ohne';
  const sproRow=`<div class="srow"><span class="k">Sprossen</span><span class="v">${sproN}</span></div>`;
  const schwelleRow = S.prod==='balkon'?`<div class="srow"><span class="k">Schwelle</span><span class="v">${S.balkonSchwelle==='alu'?'Aluschwelle':'ohne'}</span></div>`:'';
  return `<div class="srow"><span class="k">Profil</span><span class="v">${profilName(S.profile)}</span></div>
    <div class="srow"><span class="k">Aufteilung</span><span class="v">${AUFTN[S.aufteilung]}</span></div>
    ${aRow}${massRow}${colorRows}
    <div class="srow"><span class="k">Verglasung</span><span class="v">${S.glass==='3'?'3-fach':'2-fach'} · ${DEKON[S.glasdekor]}</span></div>${schwelleRow}
    ${sproRow}
    <div class="srow"><span class="k">Ober-/Unterlicht</span><span class="v">${lichtText()}</span></div>
    <div class="srow"><span class="k">Verbreiterung</span><span class="v">${verbrText()}</span></div>
    <div class="srow"><span class="k">Griff</span><span class="v">${GRIFFN[S.griff]}</span></div>
    ${rollRow}${pzRows}
    <div class="srow"><span class="k">Extras</span><span class="v">${ex.length?ex.join(' · '):'— keine —'}</span></div>`;
}

const LIEFER_MIN=5;
function cartTotals(){
  let sub=0,qty=0,hasHS=false,offen=0;
  cart.forEach(it=>{ const q=it.conf.anzahl||1; qty+=q; const u=posUnit(it.conf,it.lastPrice);
    if(u==null) offen++; else sub+=u*q;
    if(it.conf.prod==='schiebe'&&it.conf.hstSystem==='hs')hasHS=true; });
  const lieferOk=(qty>=LIEFER_MIN||hasHS);
  if(!lieferOk && liefer==='lieferung') liefer='abholung';
  let ship=0,shipNote='';
  if(liefer==='abholung'){ ship=0; shipNote='Abholung im Lager · Brandenburg a. d. H. · freitags 10–17 Uhr'; }
  else { if(qty>=10){ ship=0; shipNote='ab 10 Elementen kostenfrei · deutschlandweit'; } else if(hasHS){ ship=300; shipNote='Hebe-Schiebetür · Direktlieferung vom Hersteller'; } else { ship=239; shipNote='Spedition deutschlandweit'; } }
  const total=sub+ship, mwst=total-total/1.19;
  return {sub,qty,ship,shipNote,total,mwst,hasHS,lieferOk,offen};
}

function setLiefer(v){ if(v==='lieferung' && !cartTotals().lieferOk) return; liefer=v; saveCart(); render();
  if(document.getElementById('cdBody')) renderCartDrawer(); }

function posKeySpecs(conf){ return withConf(conf,summaryPanel); }
function posCard(it,i){
  const conf=it.conf, q=conf.anzahl||1;
  const unit=posUnit(conf,it.lastPrice), line=(unit==null)?null:unit*q;
  const sketch=skizzeKompakt(conf);
  const title=withConf(conf,configTitleLang);
  return `<div class="pos-card">
    <div class="pos-head"><span class="pos-no">Pos. ${i+1}</span></div>
    <div class="pos-body">
      <div class="pos-draw">${sketch}</div>
      <div class="pos-main">
        <div class="pos-title">${title}</div>
        <div class="pos-specs">${posKeySpecs(conf)}</div>
        <details class="pos-more"><summary>Alle Details anzeigen</summary><div class="pos-full">${withConf(conf,summaryRows)}</div></details>
      </div>
    </div>
    <div class="pos-foot">
      <div class="qty"><button onclick="itemQty(${i},-1)" aria-label="weniger">−</button><span class="tnum">${q}</span><button onclick="itemQty(${i},1)" aria-label="mehr">+</button></div>
      <div class="pos-price">${unit==null?'':`<span class="pp-unit">${eur(unit)} / Stück</span>`}<b class="tnum">${eurOffen(line)}</b></div>
      <div class="pos-act"><button onclick="itemEdit(${i})">Bearbeiten</button><button class="rm" onclick="itemRemove(${i})">Entfernen</button></div>
    </div>
  </div>`;
}
function anfrageHTML(){
  const t=cartTotals();
  const truck=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`;
  const check=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`;
  if(anfrageView==='done'){
    const steps=[['Konfiguriert','Ihre Wunsch-Elemente sind erfasst'],['Angebot per E-Mail','Wir prüfen und senden Ihr geprüftes Festpreis-Angebot'],['Bestätigen','Passt alles? Sie geben grünes Licht'],['Lieferung','Fertigungs- und Lieferzeit nennen wir Ihnen im Angebot']];
    return `<div class="ov-done">
      <div class="done-badge">${check}</div>
      <h2>Vielen Dank — Ihre Anfrage ist eingegangen.</h2>
      ${lastAnfrageNr?`<p style="font-weight:700;color:var(--primary)">Ihre Anfrage-Nr.: ${lastAnfrageNr}</p>`:''}
      <p>Wir melden uns in der Regel innerhalb von 1–2 Werktagen per E-Mail mit Ihrem persönlichen, unverbindlichen Angebot. Sie gehen damit keinerlei Verpflichtung ein.</p>
      <div class="done-steps">${steps.map((s,i)=>`<div class="done-step"><span class="ds-no">${i+1}</span><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
      <button class="cta" onclick="backToPicker()">Weiteres Produkt konfigurieren</button>
    </div>`;
  }

  const entwurfOffen = started && editIndex<0 && !cartHatAktuelles();
  const hinweis = entwurfOffen
    ? `<div class="ov-draft"><b>Ihre aktuelle Konfiguration ist noch nicht in Ihrem Angebot.</b>`
      +`<span>${configTitle()} · ${S.w} × ${S.h} mm</span>`
      +`<button type="button" class="cta" onclick="commitCurrent()">In den Warenkorb legen</button></div>`
    : '';

  return hinweis + formHTML(t);
}

function formHTML(t){

  const mini=cart.map((it,i)=>{
    const q=it.conf.anzahl||1, nm=withConf(it.conf,configTitleLang);
    const unit=posUnit(it.conf,it.lastPrice);
    return `<div class="co-item">`
      +`<div class="co-ihead"><span class="co-nr">Position ${i+1}</span><span class="co-anz">${q} Stück</span></div>`
      +`<div class="co-draw" onclick="skizzeGross(${i})" role="button" tabindex="0" aria-label="Skizze groß ansehen" title="Skizze groß ansehen">${skizzeKompakt(it.conf)}</div>`
      +`<div class="co-info">`
        +`<div class="co-nm">${nm}${it.name?' · '+esc(it.name):''}</div>`
        +posKeySpecs(it.conf)
        +`<div class="co-pr tnum">${eurOffen(unit==null?null:unit*q)}${(unit!=null&&q>1)?`<small>${eur(unit)} / Stück</small>`:''}</div>`
      +`</div></div>`;
  }).join('');
  const lief=(liefer==='lieferung');
  const addr = lief ? `<div class="field"><label for="co-strasse">Stra&szlig;e &amp; Hausnummer <span class="req">*</span></label><input id="co-strasse" name="strasse" required autocomplete="street-address" placeholder="Musterstra&szlig;e 1"></div>
        <div class="opts two"><div class="field"><label for="co-plz">PLZ <span class="req">*</span></label><input id="co-plz" name="plz" required inputmode="numeric" autocomplete="postal-code" placeholder="14772"></div><div class="field"><label for="co-ort">Ort <span class="req">*</span></label><input id="co-ort" name="ort" required autocomplete="address-level2" placeholder="Brandenburg a. d. Havel"></div></div>` : '';
  return `<div class="co-head"><button class="co-back" onclick="showCart()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg> Zurück zum Warenkorb</button>
      <h2>Angebot anfordern</h2><p>Kostenlos &amp; unverbindlich — wir senden Ihr geprüftes Angebot per E-Mail.</p><div class="co-trust"><span class="co-tr-item"><svg viewBox="0 0 24 24" fill="currentColor" class="star"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-1z"/></svg> <span style="white-space:nowrap"><a href="https://www.google.com/maps?cid=9401727711250777966" target="_blank" rel="noopener" title="Alle Bewertungen bei Google ansehen" style="color:inherit;text-decoration:none"><b>4,7</b>&nbsp;· 93 Google-Bewertungen</a><a href="/impressum.html#bewertungen" title="Wie diese Bewertungen zustande kommen" aria-label="Wie diese Bewertungen zustande kommen" style="margin-left:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="vertical-align:-1px"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.15" fill="currentColor"/></svg></a></span></span><span class="co-tr-item chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> Jede Konfiguration persönlich geprüft</span><a class="co-tr-item co-tr-tel" href="tel:+4933812148373"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg> 03381 / 2148373</a></div></div>
    <div class="co-grid">
      <form class="card co-form" novalidate onsubmit="submitAnfrage(event)">
        <div class="co-deliv-lbl">Wie möchten Sie es erhalten?</div>
        ${lieferWahlHTML(t,'ovs-deliv co-deliv')}
        <div class="field"><label for="co-name">Name <span class="req">*</span></label><input id="co-name" name="name" required autocomplete="name" placeholder="Vor- und Nachname"></div>
        <div class="opts two">
          <div class="field"><label for="co-email">E-Mail <span class="req">*</span></label><input id="co-email" name="email" type="email" required autocomplete="email" inputmode="email" placeholder="ihre@email.de"></div>
          <div class="field"><label for="co-tel">Telefon <span class="opt">(empfohlen)</span></label><input id="co-tel" name="tel" type="tel" autocomplete="tel" inputmode="tel" placeholder="Für schnelle Rückfragen"></div></div>
        ${addr}
        <div class="field"><label for="co-msg">Nachricht <span class="opt">(optional)</span></label><textarea id="co-msg" name="msg" rows="2" placeholder="Anmerkungen, Wunsch-Liefertermin, Fragen …"></textarea></div>
        <label class="consent"><input type="checkbox" name="dse" required aria-required="true"><span>Ich habe die <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerkl&auml;rung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu. <span class="req">*</span></span></label>
        <div class="co-final">
          <span class="cf-was">${cart.length===1 ? `${cart[0].conf.anzahl||1} × ${withConf(cart[0].conf,configTitleLang)}` : `${cart.length} Positionen · ${t.qty} Stück`}</span>
          <span class="cf-sum tnum">${totalText(t)}</span>
          <span class="cf-note">${t.offen?`${t.offen===1?'1 Position':t.offen+' Positionen'} auf Anfrage${t.sub?' \u2014 in dieser Summe nicht enthalten':''} · `:''}${totalOffen(t)?'':'inkl. 19 % MwSt · '}${lief?'inkl. Lieferung':'Abholung im Lager'} · unverbindlich, kein Kaufvertrag</span>
        </div>
        <div class="co-err" id="coErr" role="alert" aria-live="polite"></div>
        <button class="cta" type="submit">Anfrage kostenlos absenden</button>
        <div class="trust"><b>Kostenlos &amp; unverbindlich</b> &mdash; kein Kaufvertrag, keine Zahlung. Jede Konfiguration wird individuell gepr&uuml;ft; Sie erhalten Ihr gepr&uuml;ftes Angebot per E-Mail, i.&nbsp;d.&nbsp;R. innerhalb von 1&ndash;2 Werktagen.</div>
      </form>
      <aside class="ov-summary co-summary">
        <div class="ovs-title">Ihre Anfrage</div>   <!-- kein Kauf: die Strecke endet mit einer unverbindlichen Anfrage -->
        <div class="co-items">${mini}</div>
        <div class="ovs-line"><span>Zwischensumme (${t.qty})</span><b class="tnum">${totalOffen(t)?'Auf Anfrage':eur(t.sub)}</b></div>
        ${offenNote(t,'ovs-offen')}
        <div class="ovs-line"><span>${lief?'Lieferung':'Abholung im Lager'}</span><b>${lief?(t.ship?eur(t.ship):'kostenfrei'):'kostenlos'}</b></div>
        <div class="ovs-total"><span>Gesamt</span><b class="tnum">${totalText(t)}</b></div>
        <div class="ovs-mwst">${totalOffen(t)?'Preis nennen wir im Angebot':`inkl. 19 % MwSt (${eur(t.mwst)})`} · unverbindlich, kein Kaufvertrag</div>
      </aside>
    </div>`;
}
let lastAnfrageNr='';

function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

function fetchToDataURL(url){
  return fetch(url).then(function(r){ if(!r.ok) throw new Error('img'); return r.blob(); })
    .then(function(b){ return new Promise(function(res,rej){ var fr=new FileReader(); fr.onload=function(){res(fr.result);}; fr.onerror=rej; fr.readAsDataURL(b); }); });
}

async function skizzeAufLeinwand(markup, breite, hoehe){
  var png = await svgToPngDataURL(markup, breite);
  return await new Promise(function(fertig, fehler){
    var img = new Image();
    img.onload = function(){
      try{
        var cv = document.createElement('canvas'); cv.width = breite; cv.height = hoehe;
        var cx = cv.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, breite, hoehe);
        var luft = Math.round(Math.min(breite, hoehe) * 0.05);
        var mass = Math.min((breite - 2*luft) / img.naturalWidth, (hoehe - 2*luft) / img.naturalHeight);
        var w = Math.round(img.naturalWidth * mass), h = Math.round(img.naturalHeight * mass);
        cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
        cx.drawImage(img, Math.round((breite - w)/2), Math.round((hoehe - h)/2), w, h);
        fertig(cv.toDataURL('image/png'));
      }catch(e){ fehler(e); }
    };
    img.onerror = function(){ fehler(new Error('Skizze liess sich nicht laden')); };
    img.src = png;
  });
}
function _drawToPng(src,W,H){
  return new Promise(function(res,rej){
    var img=new Image();
    img.onload=function(){ try{
      var w=W||img.naturalWidth||340;
      var h=H||Math.round(w*((img.naturalHeight/img.naturalWidth)||1.2));
      var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
      var cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,w,h); cx.drawImage(img,0,0,w,h);

      try{
        var d=cx.getImageData(0,0,w,h).data, minX=w,minY=h,maxX=0,maxY=0,found=false;
        for(var y=0;y<h;y++){ for(var x=0;x<w;x++){ var o=(y*w+x)*4; if(d[o]<245||d[o+1]<245||d[o+2]<245){ found=true; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; } } }
        if(found){ var pad=6; minX=Math.max(0,minX-pad); minY=Math.max(0,minY-pad); maxX=Math.min(w-1,maxX+pad); maxY=Math.min(h-1,maxY+pad);
          var cw=maxX-minX+1, ch=maxY-minY+1;
          var c2=document.createElement('canvas'); c2.width=cw; c2.height=ch;
          var cx2=c2.getContext('2d'); cx2.fillStyle='#fff'; cx2.fillRect(0,0,cw,ch); cx2.drawImage(cv,minX,minY,cw,ch,0,0,cw,ch);
          res(c2.toDataURL('image/png')); return; }
      }catch(e){}
      res(cv.toDataURL('image/png'));
    }catch(e){ rej(e); } };
    img.onerror=function(){ rej(new Error('load')); };
    img.src=src;
  });
}

async function svgToPngDataURL(markup,W){
  W=W||340; markup=(markup||'').trim();
  var im=markup.match(/<img[^>]+src="([^"]+)"/i);
  if(im){ return await _drawToPng(new URL(im[1],location.href).href,W,0); }
  var svg=markup, hrefs=[], re=/(?:xlink:href|href)="([^"]+)"/gi, m;
  while((m=re.exec(svg))){ if(m[1] && !/^data:/.test(m[1]) && !/^#/.test(m[1])) hrefs.push(m[1]); }
  var uniq=hrefs.filter(function(v,i){return hrefs.indexOf(v)===i;});
  for(var u=0;u<uniq.length;u++){
    try{ var d=await fetchToDataURL(new URL(uniq[u],location.href).href); svg=svg.split('"'+uniq[u]+'"').join('"'+d+'"'); }catch(e){}
  }
  var vw=W, vh=W, vb=svg.match(/viewBox="([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)"/);
  if(vb){ vw=+vb[3]; vh=+vb[4]; }
  svg=svg.replace(/<svg([^>]*)>/i,function(mm,attrs){
    attrs=attrs.replace(/\swidth="[^"]*"/i,'').replace(/\sheight="[^"]*"/i,'');
    if(!/xmlns=/.test(attrs)) attrs=' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'+attrs;
    return '<svg width="'+vw+'" height="'+vh+'"'+attrs+'>';
  });
  var H=Math.round(W*((vh/vw)||1));
  return await _drawToPng('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),W,H);
}

// Die Angaben einer Position als reine Textzeilen "Label: Wert".
// Gleiche Quelle wie _mailRows, nur ohne Auszeichnung — die Mail wird nicht
// hier gesetzt, es gehen nur Daten hinaus.
function _specZeilen(srowHtml,ohne){
  var weg=(ohne||[]).concat(['Anzahl','System']), raus=[];
  String(srowHtml||'').replace(/<div class="srow"><span class="k[^"]*">([\s\S]*?)<\/span><span class="v[^"]*">([\s\S]*?)<\/span><\/div>/g,
    function(mm,k,v){
      var kk=k.replace(/<[^>]*>/g,'').replace(/\u00a0/g,' ').trim();
      var vv=v.replace(/<[^>]*>/g,' ').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
      if(kk && vv && weg.indexOf(kk)===-1) raus.push(kk+': '+vv);
      return '';
    });
  return raus;
}

function _mailRows(srowHtml,ohne){
  var h=(srowHtml||'');
  (ohne||[]).forEach(function(k){
    h=h.replace(new RegExp('<div class="srow"><span class="k">'+k+'<\\/span>[\\s\\S]*?<\\/span><\\/div>','g'),'');
  });

  h=h.replace(/<span class="dot" style="background:([^"]*)"><\/span>/g,
      '<table role="presentation" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse;margin-right:7px"><tr>'
      + '<td width="12" height="12" bgcolor="$1" style="width:12px;height:12px;background:$1;border:1px solid #c9ced6;font-size:0;line-height:0">&nbsp;</td></tr></table>');
  h=h.replace(/class="dot" style="background:/g,'style="display:inline-block;width:11px;height:11px;vertical-align:middle;margin-right:6px;border:1px solid #c9ced6;background:');

  var zeilen=[];
  h.replace(/<div class="srow"><span class="k[^"]*">([\s\S]*?)<\/span><span class="v[^"]*">([\s\S]*?)<\/span><\/div>/g,
    function(mm,k,v){ zeilen.push([k,v]); return ''; });

  var doppelt={'Anzahl':1,'System':1};
  var Z=zeilen.filter(function(r){ return !doppelt[r[0].replace(/<[^>]*>/g,'').trim()]; })
    .map(function(r){
      var wert=r[1], nur=wert.replace(/<[^>]*>/g,'').replace(/\u00a0/g,' ').trim();
      if(nur==='—' || nur==='-' || nur==='— keine —' || nur==='') wert='ohne';
      return [r[0],wert];
    });

  var out='';
  Z.forEach(function(r,i){
    var linie = (i<Z.length-1) ? 'border-bottom:1px solid #f2f5f9;' : '';
    out+='<tr>'
      + '<td width="108" style="width:108px;'+linie+'padding:7px 12px 7px 0;vertical-align:top;'
      + 'font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#5b6472;white-space:nowrap">'+r[0]+'</td>'
      + '<td style="'+linie+'padding:7px 0;vertical-align:top;'
      + 'font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;font-weight:600;color:#131a24">'+r[1]+'</td></tr>';
  });
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'+out+'</table>';
}

function _posBlock(i,q,title,rowsTable,unit,line,cid,mass,ai){
  var AR='font-family:Arial,Helvetica,sans-serif;';

  var preisOben = (line==null)
    ? '<div style="'+AR+'font-size:15px;line-height:22px;font-weight:700;color:#225eaa">auf Anfrage</div>'
    : '<div style="'+AR+'font-size:20px;line-height:22px;font-weight:700;color:#131a24">'+eur(line)+'</div>'
      + ((unit!=null&&q>1)?'<div style="'+AR+'font-size:12px;line-height:16px;color:#5b6472;padding-top:3px">'+eur(unit)+' / Stück</div>':'');

  var kopf = '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
    + '<td width="26" valign="top" style="width:26px">'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>'
      + '<td width="26" height="26" align="center" bgcolor="#225eaa" style="width:26px;height:26px;background:#225eaa;border-radius:6px;'
      + AR+'font-size:12px;line-height:26px;font-weight:700;color:#ffffff">'+(i+1)+'</td></tr></table></td>'
    + '<td valign="top" style="padding:0 12px">'
      + '<div style="'+AR+'font-size:17px;line-height:22px;font-weight:700;color:#131a24">'+title+'</div>'
      + '<div style="'+AR+'font-size:12px;line-height:17px;color:#5b6472;padding-top:3px">'+q+' Stück'+(mass?' · '+esc(mass):'')+'</div></td>'
    + '<td width="118" valign="top" align="right" style="width:118px">'+preisOben+'</td>'
    + '</tr></table>';

  var skizze = cid
    ? '<img class="skizze" src="cid:'+cid+'" width="264" height="320" alt="'+esc('Skizze Position '+(i+1)+' — '+(mass||''))+'"'
      + ' style="width:264px;height:320px;max-width:100%;display:block;border:0;outline:none;'
      + AR+'font-size:12px;line-height:17px;font-weight:600;color:#5b6472">'
    : '<table role="presentation" cellpadding="0" cellspacing="0" style="width:264px;height:320px;border-collapse:collapse;background:#f5f7fa;border:1px solid #e4e9f0"><tr>'
      + '<td align="center" valign="middle" style="'+AR+'font-size:12.5px;line-height:18px;color:#5b6472;padding:16px">'
      + '<div style="font-weight:700;color:#131a24;padding-bottom:4px">'+esc(mass||'')+'</div>'+esc(title||'')
      + '<div style="padding-top:8px;font-size:11.5px;color:#8b929b">Maßskizze im Angebot</div></td></tr></table>';

  var chip = (ai&&ai.chip) ? '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>'
      + '<td bgcolor="#eef4fc" style="background:#eef4fc;border:1px solid #d5e3f6;border-radius:6px;padding:5px 10px;'
      + AR+'font-size:11px;line-height:15px;font-weight:700;color:#1d4d8c">'+esc(ai.chip)+'</td></tr></table>'
      + '<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>' : '';

  var daten = '<div style="'+AR+'font-size:20px;line-height:24px;font-weight:700;color:#131a24;letter-spacing:-.01em">'+esc(mass||'')+'</div>'
    + '<div style="height:8px;line-height:8px;font-size:0">&nbsp;</div>'
    + chip
    + (ai&&ai.satz ? '<div style="'+AR+'font-size:13px;line-height:19px;color:#4b5563;padding-top:2px">'+esc(ai.satz)+'</div>' : '')
    + '<div style="height:14px;line-height:14px;font-size:0">&nbsp;</div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
      + '<td height="1" bgcolor="#e6eaf1" style="height:1px;line-height:1px;font-size:0;background:#e6eaf1">&nbsp;</td></tr></table>'
    + '<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>'
    + rowsTable;

  return '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'
    + '<tr><td height="1" bgcolor="#e9edf3" style="height:1px;line-height:1px;font-size:0;background:#e9edf3">&nbsp;</td></tr>'
    + '<tr><td style="padding:26px 0 0">'+kopf+'</td></tr>'
    + '<tr><td style="padding:18px 0 26px">'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
      + '<td class="stapel" width="264" valign="top" style="width:264px">'+skizze+'</td>'
      + '<td class="luecke" width="24" style="width:24px;font-size:0;line-height:0">&nbsp;</td>'
      + '<td class="stapel" valign="top">'+daten+'</td>'
      + '</tr></table></td></tr></table>';
}

function _mailTotals(t){
  var AR='font-family:Arial,Helvetica,sans-serif;';
  var shipTxt=(liefer==='abholung')?'kostenlos':(t.ship?eur(t.ship):'kostenfrei');

  var zeile=function(k,v){ return '<tr>'
    + '<td style="padding:6px 0;'+AR+'font-size:13px;line-height:18px;color:#5b6472">'+k+'</td>'
    + '<td align="right" style="padding:6px 0;'+AR+'font-size:14px;line-height:18px;font-weight:600;color:#131a24">'+v+'</td></tr>'; };
  return '<div style="height:24px;line-height:24px;font-size:0">&nbsp;</div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'
    + '<tr><td height="2" bgcolor="#225eaa" colspan="2" style="height:2px;line-height:2px;font-size:0;background:#225eaa">&nbsp;</td></tr>'
    + '<tr><td colspan="2" style="height:12px;line-height:12px;font-size:0">&nbsp;</td></tr>'
    + zeile('Zwischensumme ('+t.qty+(t.qty===1?' Stück':' Stück')+')', (totalOffen(t)?'auf Anfrage':eur(t.sub)))
    + zeile((liefer==='abholung'?'Abholung im Lager':'Lieferung'), shipTxt)
    + '<tr><td colspan="2" style="padding:10px 0 0"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'
      + '<tr><td height="1" bgcolor="#e6eaf1" style="height:1px;line-height:1px;font-size:0;background:#e6eaf1">&nbsp;</td></tr></table></td></tr>'
    + '<tr><td style="padding:12px 0 0;'+AR+'font-size:15px;line-height:26px;font-weight:700;color:#131a24">Gesamt</td>'
      + '<td align="right" style="padding:12px 0 0;'+AR+'font-size:24px;line-height:26px;font-weight:700;color:#131a24">'+totalText(t)+'</td></tr>'

    + (totalOffen(t)
        ? '<tr><td colspan="2" style="padding:6px 0 0;'+AR+'font-size:12px;line-height:17px;color:#5b6472">Preise inkl. 19 % MwSt. \u2014 den Betrag nennen wir im Angebot.</td></tr>'
        : '<tr><td colspan="2" style="padding:6px 0 0;'+AR+'font-size:12px;line-height:17px;color:#5b6472">inkl. 19 % MwSt. ('+eur(t.mwst)+')</td></tr>')
    + '<tr><td colspan="2" style="padding:2px 0 0;'+AR+'font-size:12px;line-height:17px;color:#5b6472">Unverbindlicher Richtpreis — dies ist kein Kaufvertrag.</td></tr>'
    + '</table>';
}

function _mailKopf(nr,t){
  var AR='font-family:Arial,Helvetica,sans-serif;';
  var d=new Date(), pad=function(n){return String(n).padStart(2,'0');};
  var wann=pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear()+' um '+pad(d.getHours())+':'+pad(d.getMinutes())+' Uhr';

  var zelle=function(k,v,br){ return '<td width="'+br+'" valign="top" style="width:'+br+'px;padding:0 16px 0 0">'
    + '<div style="'+AR+'font-size:11px;line-height:15px;color:#5b6472;font-weight:700">'+k+'</div>'
    + '<div style="'+AR+'font-size:15px;line-height:20px;font-weight:700;color:#131a24;padding-top:3px">'+v+'</div></td>'; };
  return '<div style="'+AR+'font-size:22px;line-height:28px;font-weight:700;color:#131a24">Neue Anfrage aus dem Konfigurator</div>'
    + '<div style="'+AR+'font-size:13px;line-height:19px;color:#5b6472;padding-top:5px">Eingegangen am '+wann+'</div>'
    + '<div style="height:18px;line-height:18px;font-size:0">&nbsp;</div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f3f8ff;border:1px solid #d8e6fa;border-radius:10px">'
    + '<tr><td style="padding:14px 16px"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>'
    + zelle('Anfrage-Nr.',esc(nr),200) + zelle('Summe',totalText(t),160)
    + '</tr></table></td></tr></table>'
    + '<div style="height:18px;line-height:18px;font-size:0">&nbsp;</div>';
}
function _kundeBox(name,email,tel,adr,msg){
  var AR='font-family:Arial,Helvetica,sans-serif;';

  var knopf=function(text,ziel){ return ziel ? '<table role="presentation" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse;margin:0 8px 0 0"><tr>'
    + '<td bgcolor="#225eaa" style="background:#225eaa;border-radius:8px;padding:11px 18px">'
    + '<a href="'+ziel+'" style="'+AR+'font-size:13px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none">'+esc(text)+'</a>'
    + '</td></tr></table>' : ''; };
  var zeile=function(k,v){ if(!v) return '';
    return '<tr><td width="120" style="width:120px;padding:4px 14px 4px 0;vertical-align:top;'+AR+'font-size:12px;line-height:17px;color:#5b6472;white-space:nowrap">'+k+'</td>'
      + '<td style="padding:4px 0;'+AR+'font-size:13px;line-height:18px;font-weight:600;color:#131a24">'+esc(v)+'</td></tr>'; };
  return '<div style="'+AR+'font-size:12px;line-height:16px;font-weight:700;color:#5b6472">Kundendaten</div>'
    + '<div style="height:8px;line-height:8px;font-size:0">&nbsp;</div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'
    + zeile('Name',name) + zeile('E-Mail',email) + zeile('Telefon',tel) + zeile('Abholung/Lieferung',adr) + '</table>'
    + ((tel||email) ? '<div style="height:12px;line-height:12px;font-size:0">&nbsp;</div>'
        + knopf('Anrufen', tel?('tel:'+String(tel).replace(/[^\d+]/g,'')):'')
        + knopf('Antworten', email?('mailto:'+email):'')
        + '<div style="clear:both;height:0;line-height:0;font-size:0">&nbsp;</div>' : '')
    + (msg ? '<div style="height:14px;line-height:14px;font-size:0">&nbsp;</div>'
        + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f6f9fc"><tr>'
        + '<td style="padding:12px 14px;border-left:4px solid #225eaa;'+AR+'font-size:13px;line-height:19px;color:#374151">'
        + '<span style="color:#5b6472">Nachricht: </span>'+esc(msg)+'</td></tr></table>' : '')
    + '<div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>';
}

function _mailShell(inner,vorschau){
  var AR='font-family:Arial,Helvetica,sans-serif;';

  return '<!DOCTYPE html><html lang="de" xmlns:o="urn:schemas-microsoft-com:office:office"><head>'
    + '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="x-apple-disable-message-reformatting">'
    + '<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">'
    + '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">'
    + '<title>Neue Anfrage — DeineFenster.de</title>'
    + '<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>'
    + '<style>*{font-family:Arial,Helvetica,sans-serif !important}table,td{border-collapse:collapse}</style><![endif]-->'
    + '<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}'
    + 'table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse}'
    + 'img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}'
    + '@media only screen and (max-width:620px){.px{padding-left:18px !important;padding-right:18px !important}'
    + '.stapel{display:block !important;width:100% !important}.luecke{display:none !important}'
    + '.skizze{width:100% !important;height:auto !important;max-width:264px !important;margin:0 auto !important}}'
    + '</style></head>'
    + '<body style="margin:0;padding:0;background:#eef2f7;'+AR+'color:#131a24">'
    + '<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">'+esc(vorschau||'')+'</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="background:#eef2f7"><tr>'
    + '<td align="center" style="padding:24px 12px">'
    + '<table role="presentation" width="640" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:640px;max-width:640px;background:#ffffff;border:1px solid #e6eaf1;border-radius:14px">'
    + '<tr><td class="px" style="padding:28px 32px 0">'
      + '<div style="'+AR+'font-size:20px;line-height:26px;font-weight:700;color:#225eaa">Deine<span style="color:#131a24">Fenster</span>.de</div>'
      + '<div style="height:18px;line-height:18px;font-size:0">&nbsp;</div>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
      + '<td height="1" bgcolor="#e9edf3" style="height:1px;line-height:1px;font-size:0;background:#e9edf3">&nbsp;</td></tr></table>'
      + '<div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>'
    + '</td></tr>'
    + '<tr><td class="px" style="padding:0 32px 30px">'+inner+'</td></tr>'
    + '<tr><td class="px" bgcolor="#f6f9fc" style="background:#f6f9fc;padding:20px 32px;border-top:1px solid #e9edf3;border-radius:0 0 14px 14px;'
      + AR+'font-size:12px;line-height:19px;color:#5b6472">'
      + 'Fensterhandel Christ · Fohrder Landstraße 13 · 14776 Brandenburg an der Havel<br>'
      + 'Telefon 03381 / 2148373 · info@baustoffchrist.de · USt-IdNr. DE169107776'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

function _checkoutPruefen(f){
  var box0=document.getElementById('coErr');
  if(!cart.length){
    if(box0){ box0.textContent='In Ihrer Zusammenstellung ist noch kein Produkt. Bitte konfigurieren Sie zuerst eines \u2014 dann k\u00f6nnen wir Ihnen ein Angebot rechnen.'; box0.classList.add('on'); box0.scrollIntoView({block:'center',behavior:'smooth'}); }
    return false;
  }
  var fehlt=[];
  var feld=function(n,titel,test){
    var el=f.querySelector('[name="'+n+'"]'); if(!el) return;
    var leer=test?!test(el):!(el.value||'').trim();
    el.classList.toggle('bad',leer);
    if(el.type==='checkbox'){ var lb=el.closest('.consent'); if(lb) lb.classList.toggle('bad',leer); }
    if(leer) fehlt.push({el:el,titel:titel});
  };
  feld('name','Ihren Namen');
  feld('email','Ihre E-Mail-Adresse',function(el){ var v=(el.value||'').trim(); return v && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); });
  if(f.querySelector('[name="strasse"]')){ feld('strasse','die Straße'); feld('plz','die PLZ'); feld('ort','den Ort'); }
  feld('dse','die Zustimmung zur Datenschutzerklärung',function(el){ return el.checked; });

  var box=document.getElementById('coErr');
  if(!fehlt.length){ if(box){ box.classList.remove('on'); box.textContent=''; } return true; }
  var t=fehlt.map(function(x){return x.titel;});
  var liste=t.length>1 ? t.slice(0,-1).join(', ')+' und '+t[t.length-1] : t[0];
  if(box){ box.textContent='Uns fehlt noch '+liste+'.'; box.classList.add('on'); }
  fehlt[0].el.focus({preventScroll:true});
  fehlt[0].el.scrollIntoView({block:'center',behavior:'smooth'});
  return false;
}
async function submitAnfrage(ev){
  ev.preventDefault();
  var f=ev.target, g=function(n){ var el=f.querySelector('[name="'+n+'"]'); return el?(el.value||'').trim():''; };
  if(!_checkoutPruefen(f)) return;
  var name=g('name')||'—', email=g('email'), tel=g('tel'), plz=g('plz'), ort=g('ort'), strasse=g('strasse'), msg=g('msg');
  var nr='DF-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000);
  var t0=cartTotals();
  var adr=(liefer==='lieferung') ? ('Lieferung nach: '+[strasse,(plz+' '+ort).trim()].filter(Boolean).join(', ')) : 'Abholung im Lager · Brandenburg a. d. Havel';

  if(lieferWunsch && !t0.lieferOk) adr += ' — KUNDE WÜNSCHT LIEFERUNG (Menge unter '+LIEFER_MIN+', bitte prüfen)';
  var t=t0;
  var btn=f.querySelector('[type=submit]'), orig=btn?btn.textContent:'';
  if(btn){ btn.disabled=true; btn.textContent='Wird gesendet…'; }
  try{
    var L=['Neue Anfrage über den DeineFenster.de-Konfigurator','','KONTAKTDATEN',
      'Name:    '+name,'E-Mail:  '+email,'Telefon: '+(tel||'–'),adr,'','KONFIGURATION ('+cart.length+' Position'+(cart.length===1?'':'en')+')'];
    var posHtml='', positionen=[], sketches=[], skizzeFehler=[];
    for(let i=0;i<cart.length;i++){
      let it=cart[i], conf=it.conf, q=conf.anzahl||1;
      let unit=posUnit(conf,it.lastPrice), line=(unit==null?null:unit*q);
      let title=withConf(conf,configTitleLang);
      let ai=withConf(conf,anschlagInfo);
      let mass=conf.w+' × '+conf.h+' mm';
      let srows=withConf(conf,summaryRows);
      let rowsTable=_mailRows(srows,['Maße',ai.label]);
      let cid='pos'+i, hasSketch=false;
      try{

        let svg=skizzeKompakt(conf, i+1), png=null;
        for(let versuch=0; versuch<2 && !hasSketch; versuch++){
          try{
            png=await skizzeAufLeinwand(svg, 528, 640);
            if(png && png.indexOf('base64,')>0){
              sketches.push({filename:'skizze-pos'+(i+1)+'.png', content:png.split('base64,')[1], content_id:cid});
              hasSketch=true;
            }
          }catch(e){ skizzeFehler.push('Position '+(i+1)+' (Versuch '+(versuch+1)+'): '+(e&&e.message||e)); }
        }
        if(!hasSketch) skizzeFehler.push('Position '+(i+1)+': Skizze konnte nicht erzeugt werden');
      }catch(e){ skizzeFehler.push('Position '+(i+1)+': '+(e&&e.message||e)); }
      posHtml+=_posBlock(i,q,title,rowsTable,unit,line,hasSketch?cid:null,mass,ai);

      // Dieselbe Position noch einmal als reine Daten.
      positionen.push({
        menge:q, titel:title, masse:mass,
        anschlag:[ai.label+': '+ai.norm, ai.ansicht, ai.klartext, ai.warntext?'('+ai.warntext+')':'']
          .filter(Boolean).join(' \u00b7 '),
        zeilen:_specZeilen(srows,['Maße',ai.label]),
        einzelpreis:unit, gesamtpreis:line,
        skizzeId:hasSketch?cid:null
      });

      L.push('');
      L.push('Position '+(i+1)+': '+q+' × '+title);
      L.push('  Maße:     '+mass);
      L.push('  '+ai.label+': '+ai.norm+(ai.ansicht?' · '+ai.ansicht:''));
      L.push('            '+ai.klartext+(ai.warntext?' ('+ai.warntext+')':''));
      L.push('  '+withConf(conf,function(){ return prodSpecs(true); }));
      L.push('  Positionspreis: '+(line==null?'auf Anfrage':eur(line))+((unit!=null&&q>1)?'  ('+eur(unit)+' / Stück)':''));
    }
    L.push('');
    L.push('Zwischensumme ('+t.qty+'): '+(totalOffen(t)?'auf Anfrage':eur(t.sub)));
    if(t.offen) L.push('Hinweis: '+t.offen+(t.offen===1?' Position ist':' Positionen sind')+' auf Anfrage und in dieser Summe nicht enthalten.');
    L.push(liefer==='abholung'?'Abholung im Lager: kostenlos':'Lieferung: '+(t.ship?eur(t.ship):'kostenfrei'));
    L.push(totalOffen(t)
      ? 'Gesamt: auf Anfrage  (Preis nennen wir im Angebot · kein Kaufvertrag)'
      : 'Gesamt: '+eur(t.total)+'  (inkl. 19 % MwSt '+eur(t.mwst)+' · unverbindlicher Richtpreis · kein Kaufvertrag)');
    if(msg){ L.push(''); L.push('Anmerkung: '+msg); }
    L.push(''); L.push('Anfrage-Nr.: '+nr);
    if(skizzeFehler.length){ L.push(''); L.push('HINWEIS an uns: Skizze fehlgeschlagen -> '+skizzeFehler.join(' | ')); }

    var totalsHtml=_mailTotals(t);
    var vorschau=cart.length+(cart.length===1?' Position':' Positionen')+' · '+(totalOffen(t)?'Preis auf Anfrage':eur(t.total))+' · '+name+(tel?' · '+tel:'');
    var internHtml=_mailShell(_mailKopf(nr,t)+_kundeBox(name,email,tel,adr,msg)+posHtml+totalsHtml, vorschau);
    var detailsHtml=posHtml+totalsHtml;
    var betreffName=cart.length?withConf(cart[0].conf,configTitleLang):'Konfiguration';

    // Angaben der Anfrage in strukturierter Form.
    var _d=new Date(), _z=function(n){ return String(n).padStart(2,'0'); };
    var anfrage={
      nr:nr,
      eingang:_z(_d.getDate())+'.'+_z(_d.getMonth()+1)+'.'+_d.getFullYear()
             +' um '+_z(_d.getHours())+':'+_z(_d.getMinutes())+' Uhr',
      kunde:{ name:name, email:email, telefon:tel||'', adresse:adr, anmerkung:msg },
      positionen:positionen,
      zwischensumme:totalOffen(t)?null:t.sub,
      lieferung:{ text:(liefer==='abholung'?'Abholung im Lager':'Lieferung'),
                  betrag:(liefer==='abholung'?0:t.ship) },
      mwst:totalOffen(t)?null:Math.round(t.mwst*100)/100,
      summe:totalOffen(t)?null:t.total
    };

    var r=await fetch('https://deinefenster-email.sarahchrist.workers.dev',{ method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ quelle:'konfigurator', customer_email:email, subject:'[DeineFenster.de] Neue Anfrage '+nr+': '+betreffName, text:L.join('\n'), html:internHtml, anfrage:anfrage, confirmation:{name:name,offerId:nr,detailsHtml:detailsHtml}, sketches:sketches, website:'' }) });
    if(!r.ok) throw new Error('HTTP '+r.status);

    lastAnfrageNr=nr; cartLeeren(); anfrageView='done'; window.scrollTo({top:0,behavior:'smooth'}); render();
  }catch(e){
    if(btn){ btn.disabled=false; btn.textContent=orig||'Anfrage kostenlos absenden'; }
    alert('Das Senden hat leider nicht geklappt. Bitte versuchen Sie es gleich noch einmal oder rufen Sie uns an — Ihre Konfiguration bleibt erhalten.');
  }
}

const AUTO_ADV={material:1,holzart:1,profil:1,aufteilung:1,oeffnung:1,psk:1,lauf:1,teilung:1,glas:1,schall:1,sicherheit:1,schwelle:1,
                rlform:1,rlkasten:1};
let _advTimer=null;
function maybeAutoAdvance(){
  const k=STEPS[cur]&&STEPS[cur].key;
  if(!k||!AUTO_ADV[k]||cur>=STEPS.length-1) return;
  clearTimeout(_advTimer);
  _advTimer=setTimeout(()=>{ if(STEPS[cur]&&STEPS[cur].key===k) go(cur+1); }, 240);
}
function set(k,v){S[k]=v;render();maybeAutoAdvance();}

function setVerbr(feld,mm){ S[feld]=mm; render(); }

function setAufteilungLicht(aufv,licht){
  const wechsel=(S.aufteilung!==aufv);
  S.aufteilung=aufv;

  if(wechsel){
    const set=anschlagSet();
    S.anschlagIdx=Math.min(ANSCHLAG_DEFIDX[aufv]||0, set.length-1);
    massKlemmen();
  }
  _lichtSetzen(licht);

  syncOpening(); render(); maybeAutoAdvance();
}

function _lichtSetzen(art){
  S.licht=art;
  const g=lichtGrenzen('fest');
  if(art==='ohne'){ S.olH=0; S.ulH=0; S.olTyp='fest'; S.ulTyp='fest'; }
  else if(g){
    if((art==='ober'||art==='beide') && !(+S.olH>=g.min)) S.olH=g.min;
    if((art==='unter'||art==='beide') && !(+S.ulH>=g.min)) S.ulH=g.min;
  }
}
function setLicht(art){ _lichtSetzen(art); render(); }
function setLichtTyp(feld,typ){
  const g=lichtGrenzen(typ); if(!g||!g.da) return;
  if(typ!=='fest' && (+S.w||0)<g.bMin) return;
  S[feld]=typ;
  const h=(feld==='olTyp')?'olH':'ulH';
  S[h]=Math.min(Math.max(+S[h]||g.min, g.min), g.max);
  render();
}
function setLichtH(feld,v){
  const typ=(feld==='olH')?(S.olTyp||'fest'):(S.ulTyp||'fest'), g=lichtGrenzen(typ);
  S[feld]=Math.max(0, parseInt(v,10)||0);
  if(g && S[feld]>g.max) S[feld]=g.max;
  render();
}

function setVerbrAn(an){
  S.vbAn=!!an;
  if(!an){ S.vbL=0; S.vbR=0; S.vbO=0; S.vbU=0; }
  render();
}

function setProfil(v){
  if(S.profile===v){ render(); maybeAutoAdvance(); return; }
  const warExt=(S.profile==='ext'), wirdExt=(v==='ext');
  S.profile=v;
  if(warExt!==wirdExt){
    const liste=anschlagSet();
    S.anschlagIdx=Math.min(S.anschlagIdx||0, liste.length-1);
    massKlemmen();
  }
  render(); maybeAutoAdvance();
}

function setRoll(r,s){ S.roll=r; if(s) S.rollSeite=s; render(); }

function setRollSeite(s){ S.rollSeite=s; render(); }

function rollText(){
  if(S.roll!=='gurt'&&S.roll!=='motor') return '—';
  return (S.roll==='motor'?'Motor':'Gurtwickler')+' '+((S.rollSeite==='links')?'links':'rechts')+' (von innen)';
}

function panzerFarbe(){ return (S.panzer!=null) ? COLORS_ROLL[S.panzer] : null; }
function endleisteFarbe(){ return (S.endleiste!=null) ? COLORS_ROLL[S.endleiste] : null; }
function panzerC(){ var f=panzerFarbe(); return f ? f.c : (COLORS_AKT()[S.outer]||{c:'#f4f4f0'}).c; }
function endleisteC(){ var f=endleisteFarbe(); return f ? f.c : panzerC(); }
function panzerText(){ var f=panzerFarbe(); return f ? f.n : 'Passend zum Rahmen'; }
function endleisteText(){ var f=endleisteFarbe(); return f ? f.n : 'Wie Panzer'; }

function lichtNormalisieren(){
  if(!lichtAktiv() || !_LICHT[_lichtKey(null)]) return false;

  const _L=massLimits(); if((+S.w||0) < _L.bMin) return false;
  const gK=lichtGrenzen('kipp'), gF=lichtGrenzen('fest');
  const kippGeht=!!(gK && gK.da && (+S.w||0)>=gK.bMin);
  let geaendert=false;
  [['olTyp','olH'],['ulTyp','ulH']].forEach(([tf,hf])=>{
    if((S[tf]||'fest')!=='fest' && !kippGeht){ S[tf]='fest'; geaendert=true; }
    const g=lichtGrenzen(S[tf]||'fest'); if(!g) return;
    const neuH=Math.min(Math.max(+S[hf]||g.min, g.min), g.max);
    if(neuH!==+S[hf]){ S[hf]=neuH; geaendert=true; }
  });
  return geaendert;
}
function setMass(k,v){ S[k]=(+v||0);

  lichtNormalisieren();

  if(rollKastenNachziehen()){ STEPS=stepsFor(); if(cur>=STEPS.length) cur=STEPS.length-1; }
  if(editIndex>=0&&cart[editIndex]){ cart[editIndex].conf[k]=S[k]; saveCart(); }
  updateMassValidity(); refreshPrice(); }

let _letzterPreis=null;
function refreshPrice(){
  const p=price(), onMasse=STEPS[cur]&&STEPS[cur].key==='masse';
  const el=document.getElementById('pInt');

  /* Die Antwort ist noch unterwegs. Auf keinen Fall "Mass pruefen" anzeigen -
     das Mass ist in Ordnung, nur das Netz ist langsamer als der Klick. Der
     zuletzt bekannte Preis bleibt stehen, sonst blinkt die Leiste bei jedem
     Schritt. Sobald die Antwort da ist, ruft die Preisstelle hier erneut an. */
  if(p===undefined){
    if(el && _letzterPreis==null) el.textContent='…';
    const nb0=document.getElementById('btnNext');
    if(nb0){nb0.disabled=false;nb0.classList.remove('disabled');}
    return;
  }

  if(el){
    el.textContent=(p==null)?'—':Math.round(p).toLocaleString('de-DE');

    if(p!=null && _letzterPreis!=null && p!==_letzterPreis){
      const box=el.closest('.price')||el;
      box.classList.remove('preis-neu'); void box.offsetWidth; box.classList.add('preis-neu');
    }
    if(p!=null) _letzterPreis=p;
  }
  const sub=document.getElementById('pFootSub'), nb=document.getElementById('btnNext');

  const _offen = (p==null) && S.prod==='fenster' && S.material && S.material!=='kunststoff' && massOk();
  {const _dec=document.querySelector('.footer .price .dec'), _cur=document.querySelector('.footer .price .cur');
   if(_dec)_dec.style.display=_offen?'none':''; if(_cur)_cur.style.display=_offen?'none':'';}
  if(_offen){
    if(el) el.textContent='Auf Anfrage';
    if(sub) sub.textContent='Ihr '+prodName()+' kalkulieren wir individuell — Sie erhalten ein schriftliches Angebot.';
    if(nb){nb.disabled=false;nb.classList.remove('disabled');}
    return;
  }

  if(p==null){ if(sub)sub.textContent = onMasse ? 'Maß außerhalb des möglichen Bereichs'
                                                : 'Maß prüfen — außerhalb des möglichen Bereichs';
               if(nb){nb.disabled=false;nb.classList.add('disabled');} }
  else {

    const anz=Math.max(1,+S.anzahl||1);

    if(sub) sub.textContent=(anz>1&&p!=null)
      ? anz+' Stück · '+(Math.round(p)*anz).toLocaleString('de-DE')+' € gesamt · inkl. MwSt · zzgl. Lieferung'
      : 'pro '+prodUnit()+' · inkl. MwSt · zzgl. Lieferung · unverbindlich';
    if(nb){nb.disabled=false;nb.classList.remove('disabled');}
  }
}

function updateMassValidity(){
  const L=massLimits(), b=+S.w||0, h=+S.h||0, bOk=b>=L.bMin&&b<=L.bMax, hOk=h>=L.hMin&&h<=L.hMax;
  const mW=document.getElementById('mW'), mH=document.getElementById('mH'), warn=document.getElementById('massWarn');

  if(mW) mW.classList.toggle('bad', !bOk); if(mH) mH.classList.toggle('bad', !hOk);
  if(warn){ const sp=warn.querySelector('span'), m=[]; if(!bOk)m.push(`Breite ${L.bMin}–${L.bMax} mm`); if(!hOk)m.push(`Höhe ${L.hMin}–${L.hMax} mm`);
    if(m.length){ if(sp)sp.textContent='So können wir kein Angebot rechnen — bitte '+m.join(' und ')+' eintragen.'; warn.style.display='flex'; }
    else warn.style.display='none'; }
}
function setAufteilung(v){ const wechsel=(S.aufteilung!==v); S.aufteilung=v;

  if(wechsel){ const set=anschlagSet(); S.anschlagIdx=Math.min(ANSCHLAG_DEFIDX[v]||0,set.length-1); massKlemmen(); }
  syncOpening(); render(); maybeAutoAdvance(); }

function lichtKombis(){
  if(S.prod!=='fenster' || S.aufteilung!=='1fl') return null;
  if(S.licht!=='ober' && S.licht!=='unter') return null;
  if(!_LICHT[_lichtKey(null)]) return null;
  lichtNormalisieren();
  const set=anschlagSet(), idxOf=o=>set.findIndex(x=>x.oeff.length===1 && x.oeff[0]===o);
  const gK=lichtGrenzen('kipp');
  const kippGeht=!!(gK && gK.da && (+S.w||0)>=gK.bMin);
  const feld=(S.licht==='ober')?'olTyp':'ulTyp', wort=(S.licht==='ober')?'Oberlicht':'Unterlicht';
  const ord=(S.licht==='ober')?'-oberlicht':'-unterlicht', ksuf=(S.licht==='ober')?'-olk':'-ulk';
  const dsu=(S.licht==='ober')?'-oldk':'-uldk';

  const paare = kippGeht
    ? [['dk-r','fest'],['dk-l','fest'],['dk-r','kipp'],['dk-l','kipp'],['dk-r','dk-r'],['dk-l','dk-l']]
    : [['dk-r','fest'],['dk-l','fest']];
  const namen={'dk-r':'Dreh-Kipp rechts','dk-l':'Dreh-Kipp links','dreh-r':'Dreh rechts','dreh-l':'Dreh links'};
  const lwort={fest:' fest verglast', kipp:' zum Kippen', 'dk-r':' dreh- und kippbar', 'dk-l':' dreh- und kippbar'};
  const dsuf={fest:'', kipp:ksuf, 'dk-r':dsu, 'dk-l':dsu};
  return paare.map(([oe,typ])=>({
    oeff:oe, typ:typ, feld:feld, idx:idxOf(oe),
    n:namen[oe], s:wort+lwort[typ],
    img:'img/karten/anschlag-1f'+ord+'/'+oe+dsuf[typ]+'.webp'
  })).filter(c=>c.idx>=0);
}
function setAnschlagLicht(idx,feld,typ){
  S.anschlagIdx=idx;
  const g=lichtGrenzen(typ);
  if(g&&g.da&&!(typ!=='fest'&&(+S.w||0)<g.bMin)){
    S[feld]=typ;
    const h=(feld==='olTyp')?'olH':'ulH';
    S[h]=Math.min(Math.max(+S[h]||g.min, g.min), g.max);
  }
  syncOpening(); render(); maybeAutoAdvance();
}
function setAnschlag(idx){ S.anschlagIdx=idx; syncOpening(); render(); maybeAutoAdvance(); }
function setTuerOeff(idx,r){ S.anschlagIdx=idx; S.tuerOeffnung=r; syncOpening(); render(); maybeAutoAdvance(); }

function setGriffAussen(v){ S.griffAussen=v; S.griffTuer=v; render(); }
function setStossHoehe(v){ S.stossHoehe=v; render(); }
function setSproTyp(v){ S.sproTyp=v; if(v!=='keine'){ const dk=SPRO_DICKEN[v]||[]; if(dk.indexOf(S.sproDicke)<0)S.sproDicke=dk[0]; } render(); }
function setSproRaster(v){ S.sproRaster=v; render(); }
function setSproDicke(v){ S.sproDicke=v; render(); }

function oeffCardImg(o){
  const of=o.oeff, stulp=(o.stulpAt>0);

  let _matOrd=(S.prod==='fenster'&&S.material==='holz') ? '-'+(S.holzart||'kiefer')
             :(S.prod==='fenster'&&S.material==='alu')  ? '-alu' : '';

  const _lichtOrd = (S.prod==='fenster' && typeof lichtAktiv==='function' && lichtAktiv())
    ? ({ober:'-oberlicht', unter:'-unterlicht', beide:'-ober-unter'})[S.licht] : '';
  if(_lichtOrd) _matOrd=_lichtOrd;
  if(S.prod==='balkon'){
    const m={'dk-l':'dk-links','dk-r':'dk-rechts','dreh-l':'dreh-links','dreh-r':'dreh-rechts'};
    if(of.length===1) return 'img/karten/balkon-anschlag-1f/'+(m[of[0]]||of[0])+'.webp';
    return 'img/karten/balkon-anschlag-2f/'+(of[0]==='dreh-l'?'dl-stulp-dkr':'dkl-stulp-dr')+'.webp';
  }

  let _lk='';
  if(_lichtOrd){
    if(S.licht==='ober'||S.licht==='beide'){ if(S.olTyp==='kipp') _lk+='-olk'; else if((S.olTyp||'').indexOf('dk-')===0) _lk+='-oldk'; }
    if(S.licht==='unter'||S.licht==='beide'){ if(S.ulTyp==='kipp') _lk+='-ulk'; else if((S.ulTyp||'').indexOf('dk-')===0) _lk+='-uldk'; }
  }
  if(of.length===1) return 'img/karten/anschlag-1f'+_matOrd+'/'+of[0]+_lk+'.webp';
  if(of.length===2){
    const a=of[0],b=of[1];
    if(a==='fest'||b==='fest') return 'img/karten/anschlag-2f'+_matOrd+'/'+(a==='fest'?'fest-dkr':'dkl-fest')+_lk+'.webp';
    const type=stulp?'stulp':'pfosten';
    const m2={'dk-l|dk-r|pfosten':'dkl-pfosten-dkr','dreh-l|dk-r|stulp':'dl-stulp-dkr','dreh-l|dk-r|pfosten':'dl-pfosten-dkr','dk-l|dreh-r|stulp':'dkl-stulp-dr','dk-l|dreh-r|pfosten':'dkl-pfosten-dr'};
    const f=m2[a+'|'+b+'|'+type]; return f?('img/karten/anschlag-2f'+_matOrd+'/'+f+_lk+'.webp'):null;
  }
  if(of.length===3){
    if(of[1]==='fest') return 'img/karten/anschlag-3f'+_matOrd+'/dkl-fest-dkr'+_lk+'.webp';
    const mid=of[1]==='dreh-l'?'dl':'dr';
    const f = o.stulpAt===1?('dkl-stulp-'+mid+'-pf-dkr') : (o.stulpAt===2?('dkl-pf-'+mid+'-stulp-dkr') : ('dkl-pf-'+mid+'-pf-dkr'));
    return 'img/karten/anschlag-3f'+_matOrd+'/'+f+_lk+'.webp';
  }
  return null;
}
function syncOpening(){ const o=curAnschlag(); if(o&&o.oeff.length===1){ const t=o.oeff[0]; S.opening=(t==='kipp')?'kipp':(t==='fest')?'fest':(t==='dk-l'||t==='dreh-l')?'dkl':'dkr'; } }

function miniAnschlag(oeff,stulpAt){
  const W=138,H=104,pad=7,n=oeff.length,iw=(W-2*pad)/n;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:160px;display:block;margin:0 auto">`;
  s+=`<rect x="${pad-3}" y="${pad-3}" width="${W-2*pad+6}" height="${H-2*pad+6}" rx="3" fill="#f2f5f8" stroke="#cfd6de" stroke-width="1.3"/>`;
  for(let i=0;i<n;i++){
    const x=pad+i*iw, gx1=x+5,gy1=pad+4,gx2=x+iw-5,gy2=H-pad-4;
    s+=`<rect x="${x+2}" y="${pad+1}" width="${iw-4}" height="${H-2*pad-2}" fill="#dcebf6" stroke="#8fa8bd" stroke-width="1"/>`;
    const sh=tokSash(oeff[i]);
    s+=`<g stroke="#2c3542" stroke-width="1.3" fill="none" stroke-linejoin="round">${sashOpenLines(sh.open,sh.hinge,gx1,gy1,gx2,gy2)}</g>`;
    if(i<n-1){ const dx=x+iw;
      s+= (stulpAt===i+1)
        ? `<line x1="${dx}" y1="${pad+1}" x2="${dx}" y2="${H-pad-1}" stroke="#7b828c" stroke-width="1.4" stroke-dasharray="4 2"/>`
        : `<rect x="${dx-2}" y="${pad+1}" width="4" height="${H-2*pad-2}" fill="#c6ccd3" stroke="#9aa3b0" stroke-width="0.6"/>`;
    }
  }
  return s+`</svg>`;
}
function toggle(k){S[k]=!S[k];render();}
function toggleGlass(){S.glass=S.glass==='3'?'2':'3';render();}
function pickColor(i){if(S.colorTarget==='a')S.outer=i;else S.inner=i;render();}
function pickOuter(i){ if(S.inner!==0) S.inner=i; S.outer=i; S.colorTarget='a'; render(); }

function setFarbSeite(t){ S.colorTarget=(t==='i')?'i':'a'; render(); }
function setInnenWeiss(){ S.inner=0; S.colorTarget='i'; render(); }
function setInnenFarbig(){ S.inner=S.outer; S.colorTarget='i'; render(); }

function schrittWert(k){
  try{
    switch(k){
      case 'material':   return (MATERIALS[S.material]||{}).n||'';
      case 'holzart':    return (HOLZARTEN[S.holzart]||{}).n||'';
      case 'profil':     return S.prod==='schiebe' ? (S.hstSystem==='hs'?'Hebe-Schiebet\u00fcr':'PSK Schiebet\u00fcr')
                                                   : (profilName(S.profile)||'');
      case 'modell':     return DOORN[S.doorModel]||'';
      case 'aufteilung': return ({'1fl':'1 Fl\u00fcgel','2fl':'2 Fl\u00fcgel','3fl':'3 Fl\u00fcgel'})[S.aufteilung]||'';
      case 'masse':      return S.w+' \u00d7 '+S.h+' mm';
      case 'anzahl':     return S.anzahl+(S.anzahl==1?' St\u00fcck':' St\u00fcck');
      case 'farbe':      { var c=COLORS_AKT()||[], a=c[S.outer]||{}, i=c[S.inner]||{};
                           var na=a.n||a.name||'', ni=i.n||i.name||'';
                           return na===ni ? na : (na+' / '+ni); }
      case 'glas':       return S.glass==='3'?'3-fach':'2-fach';
      case 'motiv':      return DEKON[S.glasdekor]||'Klarglas';
      case 'griff':      return S.prod==='haustuer' ? (GRIFFT[S.griffAussen]||'') : (S.griff?String(S.griff).charAt(0).toUpperCase()+String(S.griff).slice(1):'');
      case 'sicherheit': return S.sicher?'Sicherheitsbeschlag':'Standardbeschlag';
      case 'rollladen':  return S.roll!=='kein'?rollText():'ohne';
      case 'sprossen':   return S.sproTyp&&S.sproTyp!=='keine'?'mit Sprossen':'ohne';
      case 'schall':     return S.schall?'Schallschutzglas':'ohne';
      case 'schwelle':   return S.balkonSchwelle==='alu'?'Aluschwelle':'Standard';
      case 'oeffnung':   { if(S.prod==='haustuer') return (S.tuerAnschlag||'')||'';
                           var a=(ANSCHLAG[S.aufteilung]||[])[S.anschlagIdx];
                           return a&&a.n?a.n:''; }
      default:           return '';
    }
  }catch(e){ return ''; }
}
function renderSchritteListe(){
  var box=document.getElementById('slListe'); if(!box||!STEPS) return;
  var sichtbar=STEPS.map(function(st,i){return {st:st,i:i};}).filter(function(o){return o.st.key!=='anfrage';});
  var pfeil='<svg class="sl-pfeil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  box.innerHTML=sichtbar.map(function(o,n){
    var jetzt=o.i===cur, fertig=o.i<cur, wert=schrittWert(o.st.key);
    return '<button type="button" class="sl-zeile '+(jetzt?'jetzt':(fertig?'fertig':''))+'"'
      +(jetzt?' aria-current="step"':'')+' onclick="springeZuSchritt('+o.i+')">'
      +'<span class="sl-nr">'+(n+1)+'</span>'
      +'<span class="sl-mitte"><span class="sl-lb">'+o.st.label+'</span>'
      +(wert?'<span class="sl-wert">'+wert+'</span>':'')+'</span>'+pfeil+'</button>';
  }).join('');
}
function oeffneSchritte(){
  if(!started) return;
  renderSchritteListe();
  var m=document.getElementById('slModal'); if(!m) return;
  m.classList.add('auf');
  document.body.style.overflow='hidden';
  var akt=m.querySelector('.sl-zeile.jetzt')||m.querySelector('.sl-zeile');
  if(akt){ akt.focus(); akt.scrollIntoView({block:'center'}); }
}
function schliesseSchritte(){
  var m=document.getElementById('slModal'); if(!m) return;
  m.classList.remove('auf');
  document.body.style.overflow='';
}
function springeZuSchritt(i){ schliesseSchritte(); go(i); }

function go(i){
  const ziel=Math.max(0,Math.min(STEPS.length-1,i));

  cur=ziel; render(); wizHistory(); window.scrollTo({top:0,behavior:'smooth'});
}

function zumMassSchritt(){
  const i=STEPS.findIndex(function(st){return st&&st.key==='masse';});
  if(i>=0&&cur!==i) go(i);
  updateMassValidity();
  const w=document.getElementById('massWarn');
  if(w){w.style.display='flex'; w.classList.add('shake'); setTimeout(function(){w.classList.remove('shake');},450);}

  const feld=document.querySelector('#mW.bad, #mH.bad') || document.getElementById('mW');
  if(feld){ try{ feld.focus({preventScroll:true}); if(feld.select) feld.select(); }catch(e){} }
  if(w) try{ w.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){ }
}
function next(){
  if(!massOk()){ zumMassSchritt(); return; }
  if(cur===STEPS.length-2){ commitCurrent(); return; }
  if(cur<STEPS.length-1) go(cur+1);
}
function back(){ if(cur===0) backToPicker(); else go(cur-1); }

var _pzOffen={panzer:false,endleiste:false,rlPanzer:false,rlEndleiste:false,rlKastenF:false,rlSchiene:false};
function pzToggle(k){ _pzOffen[k]=!_pzOffen[k]; render(); }
function knopfBeschriftung(){
  const nl=document.getElementById('nextLbl'), nb=document.getElementById('btnNext');
  if(!nl||!nb||!started) return;
  const korb=cur===STEPS.length-2, eng=window.innerWidth<=640;
  nl.textContent = korb ? (editIndex>=0 ? (eng?'Übernehmen':'Änderungen übernehmen')
                                        : (eng?'In den Warenkorb':'In den Warenkorb legen'))
                        : 'Weiter';
  nb.classList.toggle('ist-korb', korb);
}
function render(){
  if(editIndex>=0&&cart[editIndex]) cart[editIndex].conf={...S};
  document.body.classList.toggle('checkout-focus', started && anfrageView==='form');
  saveCart();
  saveWiz();
  const nav=document.querySelector('.steps'), foot=document.querySelector('.footer');
  if(!started){
    document.getElementById('pickerView').style.display='block';
    document.getElementById('head').style.display='none';
    document.getElementById('wizGrid').style.display='none';
    nav.style.display='none'; foot.style.display='none';
    document.body.classList.remove('wiz-active');
    renderPicker(); return;
  }
  document.body.classList.add('wiz-active');
  document.getElementById('pickerView').style.display='none';
  const key=STEPS[cur].key;
  const selectMode=['material','holzart','profil','aufteilung','oeffnung','masse','anzahl','teilung','lauf','psk'].includes(key);
  document.getElementById('head').style.display= selectMode ? 'block':'none';
  const g=document.getElementById('wizGrid');
  g.style.display='grid';
  g.classList.toggle('full', key==='anfrage');
  g.classList.toggle('select', selectMode);

  const _vorMass=['material','holzart','profil','aufteilung','oeffnung','teilung','lauf','psk','masse'].includes(key);
  g.classList.toggle('ohne-skizze', _vorMass);
  nav.style.display='block'; foot.style.display=(key==='anfrage')?'none':'block';

  const sichtbar = STEPS.map((st,i)=>({st,i})).filter(o=>o.st.key!=='anfrage');

  const nAkt=sichtbar.findIndex(o=>o.i===cur), gesamt=sichtbar.length;
  const anteil=gesamt>1?Math.max(0,Math.min(1,nAkt/(gesamt-1))):1;

  const reiheBreit=sichtbar.map(({st,i},n)=>{
    const cls=i===cur?'active':(i<cur?'done':'');
    const num=i<cur?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg>`:(n+1);
    return `<button class="step ${cls}" onclick="go(${i})" aria-current="${i===cur?'step':'false'}"><span class="num">${num}</span><span class="lb">${st.label}</span></button>`;
  }).join('');
  document.getElementById('stepbar').innerHTML=
    `<div class="leiste-breit"><div class="wizprog" aria-hidden="true"><i id="wizprogFill"></i></div>${reiheBreit}</div>`
   +`<div class="leiste-schmal">`
   +`<button class="stepnow" type="button" onclick="oeffneSchritte()" aria-haspopup="dialog"
       aria-label="Schritt ${nAkt+1} von ${gesamt}: ${STEPS[cur].label}. Alle Schritte anzeigen">
       <span class="sn-txt"><span class="sn-zahl">Schritt ${nAkt+1} von ${gesamt}</span><span class="sn-name">${STEPS[cur].label}</span></span>
       <svg class="sn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
     </button>
     <div class="sn-bahn" aria-hidden="true"><i style="width:${(anteil*100).toFixed(1)}%"></i></div></div>`;
  {var _tp=document.getElementById('tbProd'); if(_tp) _tp.textContent=prodName();

   var _tk=document.getElementById('tbProdKurz'); if(_tk) _tk.textContent=prodUnit();}

  function textBreite(txt,fam,gew,px,sperr){
    var c=textBreite._c||(textBreite._c=document.createElement('canvas').getContext('2d'));
    c.font=gew+' '+px+'px '+fam;
    return c.measureText(txt).width + sperr*px*txt.length;
  }
  function leisteVermessen(){
    var sb=document.getElementById('stepbar'); if(!sb) return;
    var felder=[].slice.call(sb.querySelectorAll('.step')); if(!felder.length) return;
    var cs=getComputedStyle(sb),
        padL=parseFloat(cs.paddingLeft)||0,
        innen=sb.clientWidth-padL-(parseFloat(cs.paddingRight)||0),
        n=felder.length, feldBreite=0;

    if(window.innerWidth>900 && innen>0){
      var GRUND=11, KLEINST=9.5, LUFT=10, breit=0,
          fam=getComputedStyle(felder[0].querySelector('.lb')).fontFamily||'sans-serif';
      felder.forEach(function(f){ var l=f.querySelector('.lb'); if(!l) return;
        breit=Math.max(breit, textBreite(l.textContent.toUpperCase(), fam, 800, GRUND, .05)); });
      if(breit>0){
        var platz=innen/n-LUFT,
            gr=Math.max(KLEINST, Math.min(GRUND, GRUND*platz/breit)),
            mw=Math.floor(breit*gr/GRUND+LUFT);
        felder.forEach(function(f){ f.style.minWidth=mw+'px';
          var l=f.querySelector('.lb'); if(l) l.style.fontSize=gr.toFixed(2)+'px'; });
        feldBreite=Math.max(mw, innen/n);
      }
    }
    leisteBahn(feldBreite, padL);
  }
  function leisteBahn(feldBreite, padL){
    var sb=document.getElementById('stepbar'); if(!sb) return;
    var schritte=[].slice.call(sb.querySelectorAll('.step')),
        bahn=sb.querySelector('.wizprog'), fuell=document.getElementById('wizprogFill');
    if(!schritte.length||!bahn) return;

    var mitte = feldBreite>0
      ? function(i){ return padL + feldBreite*(i+0.5); }
      : function(i){ var st=schritte[i], k=st.querySelector('.num');
          return k ? st.offsetLeft+k.offsetLeft+k.offsetWidth/2 : st.offsetLeft+st.offsetWidth/2; };
    var links=mitte(0), rechts=mitte(schritte.length-1), n0=schritte[0].querySelector('.num');
    bahn.style.left=links+'px';
    bahn.style.width=Math.max(0,rechts-links)+'px';
    bahn.style.top=(schritte[0].offsetTop+(n0?n0.offsetTop+n0.offsetHeight/2:0))+'px';
    var akt=-1; schritte.forEach(function(s,i){ if(s.classList.contains('active')) akt=i; });
    if(fuell) fuell.style.width=(akt>=0?Math.max(0,mitte(akt)-links):0)+'px';

    if(akt>=0){ var a=schritte[akt],
        lo=feldBreite>0 ? padL+feldBreite*akt : a.offsetLeft,
        br=feldBreite>0 ? feldBreite : a.offsetWidth;
      sb.scrollLeft=Math.max(0, lo-(sb.clientWidth-br)/2); }
  }

  function kopfMelden(){
    var tb=document.querySelector('.topbar');
    if(tb){ var h=Math.round(tb.getBoundingClientRect().height);
      if(h>0) document.documentElement.style.setProperty('--tb-h', h+'px'); }

    var sb=document.getElementById('stepbar');
    if(sb && sb.parentNode && sb.parentNode.classList.contains('steps-zeile')){
      sb.parentNode.classList.toggle('schiebbar', sb.scrollWidth > sb.clientWidth+1); }
  }
  leisteVermessen();
  requestAnimationFrame(kopfMelden);
  if(!window.__leisteFonts && document.fonts && document.fonts.ready){ window.__leisteFonts=1;
    try{ document.fonts.ready.then(function(){ leisteVermessen(); kopfMelden(); }); }catch(e){} }
  if(!window.__leisteResize){ window.__leisteResize=1;
    var _t; window.addEventListener('resize',function(){
      clearTimeout(_t); _t=setTimeout(function(){ leisteVermessen(); kopfMelden();

        try{ knopfBeschriftung(); }catch(e){} }, 120); }); }
  document.getElementById('hTitle').innerHTML=STEPS[cur].title[0]+'<span class="accent">'+STEPS[cur].title[1]+'</span>';
  document.getElementById('hSub').textContent=STEPS[cur].sub;
  document.getElementById('stage').innerHTML=stageSVG()+tuerSeitenUmschalter();
  skizzenFormMelden();
  document.getElementById('summary').innerHTML='<div class="eb">Ihre Konfiguration</div><h3>'+configTitleLang()+'</h3>'+summaryPanel();
  (function(){ const k=STEPS[cur].key, h=kiHinweisHTML(k);

    const vorne = (k==='modell'||k==='oeffnung'||k==='aufteilung');
    const panel = document.getElementById('panel');
    panel.innerHTML = vorne ? h+panelHTML() : panelHTML()+h;

    panel.querySelectorAll('img').forEach(im => {
      if (!KI_BILD_PFAD.test(im.getAttribute('src') || '')) return;
      const halter = im.closest('.ocard, .pc, .glass-card, .griff-fest, .vis') || im.parentElement;
      if (!halter || halter.querySelector('.ai-badge')) return;
      const a = im.getAttribute('alt');
      if (a && !/KI-generiert/.test(a)) im.setAttribute('alt', a + ' (KI-generiertes Symbolbild)');
      if (getComputedStyle(halter).position === 'static') halter.style.position = 'relative';
      const b = document.createElement('span');
      b.className = 'ai-badge ai-badge-sm';
      b.textContent = 'KI-Bild';
      halter.appendChild(b);
    }); })();
  if(SKIP_KEYS.includes(STEPS[cur].key) && cur<STEPS.length-1){

    document.getElementById('panel').insertAdjacentHTML('beforeend',
      '<button type="button" class="skip-extras" onclick="finishWithDefaults()">Passt so — direkt zum Angebot <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg><span class="sub">Griff, Schall, Sicherheit &amp; Rollladen sind auf Standard vorbelegt</span></button>');
  }
  updateMassValidity(); refreshPrice();
  document.getElementById('backLbl').textContent=cur===0?'Produkte':'Zurück';

  knopfBeschriftung();
}
loadCart();
restoreWiz();
render();
wizHistory(true);

try{
  const qs=location.search;
  const mEdit=qs.match(/[?&]edit=(\d+)/);
  if(/[?&]heal=1/.test(qs)){ location.replace('/warenkorb.html'); }
  else if(mEdit && cart[+mEdit[1]]){ itemEdit(+mEdit[1]); }
  else if(/[?&]checkout=1(?:&|$)/.test(qs) && cart.length){ openCart(); showAnfrage(); }
  else if(/[?&]cart=1(?:&|$)/.test(qs) && cart.length){ openCart(); }
  else {

    const mProd=qs.match(/[?&]prod=([a-z]+)/);
    if(mProd && PRODUCTS.some(x=>x.id===mProd[1])) startProduct(mProd[1]);
  }
}catch(e){}
