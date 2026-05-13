// konfigurator-3d.js — Three.js 3D Vorschau für alle 4 Produkttypen
// Ersetzt SVG-Vorschau im Konfigurator. Wird via window.renderSVGPrev aufgerufen.
// Erfordert importmap mit three@0.162.0 im <head>.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ════════════════════════════════════════════════════════════
// KONSTANTEN — Drutex IGLO 5 Profilmaße (1 unit = 1 Meter)
// ════════════════════════════════════════════════════════════
const OFR  = 0.075;   // Blendrahmen-Ansichtsbreite 75mm (Agent 1 bestätigt, IGLO 5 Classic)
const SFR  = 0.078;   // Flügelrahmen-Ansichtsbreite 78mm (ähnlich Blendrahmen)
const DD   = 0.070;   // Profiltiefe 70mm
const OVHG = 0.010;   // Flügel-Überschlag: 10mm (IGLO 5 realistisch, Agent 1 bestätigt 8–12mm)
const DCT  = 0.009;   // Dichtungsbreite 9mm
const GLB  = 0.018;   // Glasleiste Breite 18mm
const ABH  = 0.022;   // Abstandhalter sichtbare Breite 22mm (großzügig für Sichtbarkeit im Konfigurator)
const SD   = 0.001;   // Spielraum (Tiefenpuffer für Stege/Oberlicht)

// ════════════════════════════════════════════════════════════
// SCENE STATE
// ════════════════════════════════════════════════════════════
let renderer, camera, controls, scene, productGroup;
let _animFrame = null;
let _containerId = null;
let _initDone = false;

// ════════════════════════════════════════════════════════════
// MATERIALIEN (geteilt, werden pro render()-Call aktualisiert)
// ════════════════════════════════════════════════════════════
const texLoader = new THREE.TextureLoader();

const frameMat = new THREE.MeshPhysicalMaterial({
  color: 0xF1F0EA,   // RAL 9016 Traffic White
  roughness: 0.20, metalness: 0.02,
  clearcoat: 0.50, clearcoatRoughness: 0.10,
  envMapIntensity: 1.40
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xa8c8b8,  // Float-Glas: satteres Grün-Blau (echtes Isolierglas-Tint)
  metalness: 0.0, roughness: 0.04,
  transmission: 0.42, thickness: 0.028, ior: 1.52, transparent: true,
  envMapIntensity: 2.5
});
const sealMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a, roughness: 0.90, metalness: 0
});
const spacerMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a18, roughness: 0.80, metalness: 0.08  // Swisspacer Ultimate (Standard bei Drutex)
});
const glassBackMat = new THREE.MeshStandardMaterial({
  color: 0x7ca0bc, roughness: 0.92, metalness: 0  // Raumhintergrund, mittelhell (Himmel/Raum)
});
const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xdde0e4, roughness: 0.10, metalness: 0.92, envMapIntensity: 3.5
});
const bracketMat = new THREE.MeshStandardMaterial({
  color: 0xdde0e4, roughness: 0.12, metalness: 0.88, envMapIntensity: 3.5
});
const glFrameMat = new THREE.MeshStandardMaterial({
  color: 0xd0d5d8, roughness: 0.22, metalness: 0.70, envMapIntensity: 2.0
});
const grooveMat = new THREE.MeshStandardMaterial({
  color: 0x181b1d, roughness: 0.68
});
const wallRevMat = new THREE.MeshStandardMaterial({
  color: 0xa8b4c0, roughness: 0.90, metalness: 0
});
const sillMat = new THREE.MeshStandardMaterial({
  color: 0xedede8, roughness: 0.52, metalness: 0
});

// ════════════════════════════════════════════════════════════
// FARB-SYSTEM — Mapping P.fa/fi-Keys → FARBEN-Keys + Holz-Texturen
// ════════════════════════════════════════════════════════════
const FA_KEY_MAP = {
  'weiss':'weiss-fx','cremeweiss':'cremeweiss','weiss-fx':'weiss-fx',
  'achatgrau':'lichtgrau','lichtgrau':'lichtgrau','signalgrau':'grau',
  'betongrau':'betongrau','quarzgr-gl':'quarzgrau-gl','quarzgr-sa':'quarzgrau',
  'basaltgr-gl':'basaltgrau-gl','basaltgr-sa':'basaltgrau',
  'schiefgr-gl':'schiefgrau-gl','schiefgr-sa':'eisengl',
  'eisengl':'eisengl','crown-plat':'crown-plat',
  'anthrazit':'anthrazitgrau','anthraz-gl':'anthrazit-gl','anthraz-um':'anthrazit-um',
  'schwarz-um':'schwarz-um',
  'alux-db':'deep-bronze','alu-gebr':'crown-plat',
  'schoko-br':'schoko-br','braun-mar':'schoko-br',
  'moosgruen':'moosgruen','dunkelgr':'dunkelgruen',
  'stahlblau':'stahlblau','brillblau':'brillblau','dunkelrot':'dunkelrot',
  'schwarzbr':'schwarzbraun','sheffield':'sheffield','winchester':'winchester',
  'eiche-hell':'sheffield','eiche-nat':'eiche-nat','golden-oak':'golden-oak',
  'nussbaum':'nussbaum','mooreiche':'eiche-dunkel','dunkleiche':'eiche-dunkel',
  'siena-noce':'turner-toffee','siena-ross':'mahagoni',
  'mahagoni':'mahagoni','macore':'macore','oregon':'oregon',
  'douglasie':'douglasie','bergkiefer':'sheffield','teak':'nussbaum',
  'sonder':'anthrazitgrau'
};

const WOOD_KEYS = new Set([
  'golden-oak','sheffield','turner-oak','turner-toffee','turner-walnut',
  'eiche-nat','winchester','oregon','douglasie','nussbaum','eiche-dunkel',
  'schwarzbraun','macore','mahagoni'
]);

const WOOD_REPEAT = {
  'golden-oak':[1.5,1],'sheffield':[1.5,1],'turner-oak':[1.5,1],
  'turner-toffee':[1.5,1],'turner-walnut':[1.5,1],'eiche-nat':[1.5,1],
  'winchester':[1.5,1],'oregon':[1,1],'douglasie':[1.5,1],
  'nussbaum':[1.5,1],'eiche-dunkel':[1.5,1],'schwarzbraun':[1,1],
  'macore':[2,1],'mahagoni':[2,1]
};

function clearMatMaps(mat) {
  ['map','bumpMap','normalMap','roughnessMap'].forEach(k => {
    if (mat[k]) { mat[k].dispose(); mat[k] = null; }
  });
}

function applyColor(mat, faKey) {
  clearMatMaps(mat);
  const k = FA_KEY_MAP[faKey] || faKey;
  const hex = window._kP?.fa?.[faKey]?.hex || window._kP?.fi?.[faKey]?.hex || '#F1F0EA';
  mat.color.set(hex);
  const isGlatt    = k.endsWith('-gl');
  const isUltiMatt = k.endsWith('-um');
  mat.roughness        = isUltiMatt ? 0.97 : isGlatt ? 0.18 : 0.22;
  mat.envMapIntensity  = isUltiMatt ? 0.02 : isGlatt ? 1.60 : 1.20;
  mat.metalness        = isUltiMatt ? 0 : 0.02;
  if(mat.clearcoat !== undefined) {
    mat.clearcoat          = isUltiMatt ? 0.0 : isGlatt ? 0.55 : 0.40;
    mat.clearcoatRoughness = isUltiMatt ? 1.0 : isGlatt ? 0.08 : 0.18;
  }
  mat.needsUpdate      = true;
  grooveMat.color.set(hex).multiplyScalar(0.62);
  grooveMat.needsUpdate = true;
}

function applyWood(mat, k) {
  clearMatMaps(mat);
  if (k === 'schwarzbraun') {
    mat.color.set(0x1c1810); mat.roughness = 0.88; mat.metalness = 0;
    mat.envMapIntensity = 0.04; mat.needsUpdate = true;
    return;
  }
  const [rx, ry] = WOOD_REPEAT[k] ?? [1.5, 1];
  texLoader.load('img/swatches/' + k + '.webp', tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.rotation  = Math.PI / 2;
    tex.center.set(0.5, 0.5);
    tex.repeat.set(rx, ry);
    tex.needsUpdate = true;
    mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 0.025;
    mat.color.set(0xffffff);
    mat.roughness = 0.82; mat.metalness = 0; mat.envMapIntensity = 0.10;
    mat.needsUpdate = true;
  });
  grooveMat.color.set(0x181818); grooveMat.needsUpdate = true;
}

function applyMaterial(mat, faKey) {
  const k = FA_KEY_MAP[faKey] || faKey;
  if (WOOD_KEYS.has(k)) applyWood(mat, k);
  else                   applyColor(mat, faKey);
}

// ════════════════════════════════════════════════════════════
// GLAS-SYSTEM (identisch haustuer-3d.html)
// ════════════════════════════════════════════════════════════
function seededRnd(seed) {
  let s = seed;
  return () => { s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
}
function heightToNormal(hCanvas, strength) {
  const W=hCanvas.width, H=hCanvas.height;
  const hData = hCanvas.getContext('2d').getImageData(0,0,W,H).data;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const nCtx=out.getContext('2d'), nImg=nCtx.createImageData(W,H);
  function h(x,y){ x=Math.max(0,Math.min(W-1,x)); y=Math.max(0,Math.min(H-1,y)); return hData[(y*W+x)*4]/255; }
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    const dX=(h(x-1,y-1)-h(x+1,y-1))+2*(h(x-1,y)-h(x+1,y))+(h(x-1,y+1)-h(x+1,y+1));
    const dY=(h(x-1,y-1)-h(x-1,y+1))+2*(h(x,y-1)-h(x,y+1))+(h(x+1,y-1)-h(x+1,y+1));
    const nx=dX*strength, ny=dY*strength, nz=1.0, len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    const i=(y*W+x)*4;
    nImg.data[i]=(nx/len*.5+.5)*255; nImg.data[i+1]=(ny/len*.5+.5)*255;
    nImg.data[i+2]=(nz/len*.5+.5)*255; nImg.data[i+3]=255;
  }
  nCtx.putImageData(nImg,0,0); return out;
}
function chinchillaHeight() {
  const W=512,H=512,cvs=document.createElement('canvas'); cvs.width=W; cvs.height=H;
  const ctx=cvs.getContext('2d'), rnd=seededRnd(4217);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  for(let i=0;i<300;i++){
    const x=rnd()*W, y=rnd()*H, r=18+rnd()*28, rx=r*(0.65+rnd()*0.7), ry=r*(0.65+rnd()*0.7);
    const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.6,'rgba(128,128,128,0.5)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rnd()*Math.PI,0,Math.PI*2); ctx.fill();
  }
  return cvs;
}
function masterCarreHeight() {
  const W=256,H=256,cvs=document.createElement('canvas'); cvs.width=W; cvs.height=H;
  const ctx=cvs.getContext('2d'), STEP=32, LINE=8;
  ctx.fillStyle='#111'; ctx.fillRect(0,0,W,H);
  for(let p=0;p<=W;p+=STEP){
    const g=ctx.createLinearGradient(p-LINE,0,p+LINE,0);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(0.5,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(p-LINE,0,LINE*2,H);
  }
  for(let p=0;p<=H;p+=STEP){
    const g=ctx.createLinearGradient(0,p-LINE,0,p+LINE);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(0.5,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,p-LINE,W,LINE*2);
  }
  return cvs;
}
function buildNormalTex(hFn, strength, rx, ry) {
  const tex=new THREE.CanvasTexture(heightToNormal(hFn(), strength));
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(rx,ry); return tex;
}
function applyGlass(key) {
  ['normalMap'].forEach(k=>{ if(glassMat[k]){glassMat[k].dispose();glassMat[k]=null;} });
  if(key==='satinato'){
    glassMat.transmission=0.35; glassMat.roughness=0.96; glassMat.color.set(0xe8eeee);
  } else if(key==='chinchilla'){
    glassMat.transmission=0.65; glassMat.roughness=0.12; glassMat.color.set(0xd4e8f0);
    glassMat.normalMap=buildNormalTex(chinchillaHeight,4.5,5,16);
    glassMat.normalScale=new THREE.Vector2(1.8,1.8);
  } else if(key==='master-carre'){
    glassMat.transmission=0.78; glassMat.roughness=0.06; glassMat.color.set(0xd4eaf4);
    glassMat.normalMap=buildNormalTex(masterCarreHeight,4.0,3,11);
    glassMat.normalScale=new THREE.Vector2(1.5,1.5);
  } else {
    glassMat.transmission=0.75; glassMat.roughness=0.03; glassMat.color.set(0x90bca8);
  }
  glassMat.needsUpdate=true;
}

// ════════════════════════════════════════════════════════════
// GEOMETRIE-HELFER
// ════════════════════════════════════════════════════════════
function addBox(g, x, y, z, w, h, d, mat) {
  if(w<=0||h<=0||d<=0) return;
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat||frameMat);
  m.position.set(x+w/2, y+h/2, z+d/2);
  m.castShadow=m.receiveShadow=true;
  g.add(m);
}

function addPlane(g, x, y, z, w, h, mat) {
  if(w<=0||h<=0) return;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat||glassMat);
  m.position.set(x+w/2, y+h/2, z); g.add(m);
}

function addGlass(g, x, y, gw, gh, zPos) {
  // Raumhintergrund (dunkel, realistisch)
  addPlane(g, x, y, Math.max(0.003, zPos - 0.030), gw, gh, glassBackMat);

  // Glasscheibe zuerst (dahinter), dann Abstandhalter darüber
  addPlane(g, x, y, zPos, gw, gh, glassMat);

  // Abstandhalter (Swisspacer Ultimate, schwarz, 14mm) — VOR der Scheibe (sichtbarer Rand)
  const ahZ = zPos + 0.002;
  addBox(g, x,          y+gh-ABH, ahZ, gw,         ABH,      0.005, spacerMat);
  addBox(g, x,          y,        ahZ, gw,         ABH,      0.005, spacerMat);
  addBox(g, x,          y+ABH,    ahZ, ABH,        gh-2*ABH, 0.005, spacerMat);
  addBox(g, x+gw-ABH,   y+ABH,    ahZ, ABH,        gh-2*ABH, 0.005, spacerMat);
}

// Glasleiste — 3mm erhöhter Klemmstreifen um das Glasfeld (sichtbar von außen)
function addGlasleiste(g, gx, gy, gw, gh, zSashFront) {
  const GLD = 0.003;
  addBox(g, gx,           gy+gh-GLB, zSashFront, gw,  GLB,      GLD, frameMat);
  addBox(g, gx,           gy,        zSashFront, gw,  GLB,      GLD, frameMat);
  addBox(g, gx,           gy+GLB,    zSashFront, GLB, gh-2*GLB, GLD, frameMat);
  addBox(g, gx+gw-GLB,    gy+GLB,    zSashFront, GLB, gh-2*GLB, GLD, frameMat);
}

function buildOuterFrame(g, X, Y, W, H, FW, depth, mat, zStart=0) {
  addBox(g, X,        Y+H-FW,  zStart, W,       FW,     depth, mat);
  addBox(g, X,        Y,       zStart, W,       FW,     depth, mat);
  addBox(g, X,        Y+FW,    zStart, FW, H-2*FW,      depth, mat);
  addBox(g, X+W-FW,  Y+FW,    zStart, FW, H-2*FW,      depth, mat);
}

// ExtrudeGeometry-Rahmen mit Profilfase (Bevel an Vorderkanten — typisches PVC-Profil)
function buildFrameExtruded(g, X, Y, W, H, FW, depth, mat, zStart=0) {
  const shape = new THREE.Shape();
  shape.moveTo(X, Y); shape.lineTo(X+W, Y); shape.lineTo(X+W, Y+H); shape.lineTo(X, Y+H); shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(X+FW, Y+FW); hole.lineTo(X+W-FW, Y+FW); hole.lineTo(X+W-FW, Y+H-FW); hole.lineTo(X+FW, Y+H-FW); hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true,
    bevelSize: 0.0035, bevelThickness: 0.0035, bevelSegments: 2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = zStart;
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);
}

// ════════════════════════════════════════════════════════════
// HARDWARE — Griffe, Scharniere, Stoßgriff
// ════════════════════════════════════════════════════════════
function addFensterGriff(g, cx, cy, z) {
  // NEVADA-Griff: ovale Rosette 40×26mm + Hals + Hebelarm 120mm (Schließstellung = nach unten)
  const hMat = new THREE.MeshPhysicalMaterial({
    color: 0x8a9098, roughness: 0.10, metalness: 0.92,
    clearcoat: 0.45, clearcoatRoughness: 0.06, envMapIntensity: 4.5
  });
  const pinMat = new THREE.MeshStandardMaterial({color: 0x60686e, roughness: 0.22, metalness: 0.92});

  // 1. Rosette — ovale Abdeckplatte (40mm breit × 26mm hoch × 7mm tief)
  addBox(g, cx-0.020, cy-0.013, z, 0.040, 0.026, 0.007, hMat);

  // 2. Spindel-Achse (sichtbarer dunkler Zylinder in Rosetten-Mitte)
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.010, 12), pinMat);
  sp.rotation.x = Math.PI/2;
  sp.position.set(cx, cy, z + 0.012);
  g.add(sp);

  // 3. Griffhals (konischer Übergang Rosette→Arm, Ø18mm→Ø13mm, 20mm lang)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.0065, 0.020, 14), hMat);
  neck.rotation.x = Math.PI/2;
  neck.position.set(cx, cy, z + 0.017);
  g.add(neck);

  // 4. Griffarm — zylindrisch Ø13mm, 120mm lang, zeigt nach unten (Schließstellung)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.120, 14), hMat);
  arm.position.set(cx, cy - 0.060, z + 0.027); // mittig bei cy-60mm
  g.add(arm);

  // 5. Griffspitze (Halbkugel, abgerundetes Ende)
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 12, 8), hMat);
  tip.position.set(cx, cy - 0.120, z + 0.027);
  g.add(tip);
}

function addBalkontuerGriff(g, cx, cy, z, isLinks) {
  // Langschild
  addBox(g, cx-0.012, cy-0.055, z, 0.024, 0.110, 0.013, chromeMat);
  // Drücker (horizontal arm)
  const dx = isLinks ? 0 : -0.048;
  addBox(g, cx+dx, cy-0.008, z+0.013, 0.048, 0.016, 0.010, chromeMat);
  // Schlüsselloch
  addBox(g, cx-0.004, cy+0.020, z+0.001, 0.008, 0.012, 0.006, grooveMat);
}

function addFensterScharnier(g, cx, cy, z) {
  // MACO Multi Matic Ecklager — L-Form Zinkdruckguss, silbergrau #a0a098
  const sMat = new THREE.MeshStandardMaterial({
    color: 0xa0a098, roughness: 0.35, metalness: 0.72, envMapIntensity: 2.5
  });
  const pinMat = new THREE.MeshStandardMaterial({color: 0x7888a8, roughness: 0.12, metalness: 0.96});

  // Platte an Flügelkante (sichtbar von innen, 56×14mm)
  addBox(g, cx-0.012, cy-0.028, z, 0.024, 0.056, 0.007, sMat);

  // L-Körper (dicker Lagerkörper, 20×14×14mm) — Knotenpunkt der L-Form
  addBox(g, cx-0.012, cy-0.007, z-0.014, 0.024, 0.014, 0.014, sMat);

  // Tragezapfen (Ø7mm, 16mm lang — sichtbarer Drehzapfen)
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 12), pinMat);
  pin.rotation.x = Math.PI/2;
  pin.position.set(cx, cy, z + 0.008);
  g.add(pin);

  // Schraubenattrappen (2× kleine Zylinder auf Platte)
  [cy-0.020, cy+0.008].forEach(sy => {
    const scr = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.003, 8), pinMat);
    scr.rotation.x = Math.PI/2;
    scr.position.set(cx, sy, z + 0.008);
    g.add(scr);
  });
}

function addBandScharnier(g, cx, cy, z) {
  // Bandlappen oben (an Zarge)
  addBox(g, cx-0.024, cy-0.002, z, 0.048, 0.060, 0.012, chromeMat);
  // Bandlappen unten (an Türblatt)
  addBox(g, cx-0.024, cy-0.060, z-0.001, 0.048, 0.056, 0.010, chromeMat);
  // Scharnierachse
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.008,12), grooveMat);
  axle.position.set(cx, cy-0.001, z+0.006); g.add(axle);
}

function addKlinke(g, cx, cy, z) {
  // Langschild
  addBox(g, cx-0.011, cy-0.092, z, 0.022, 0.118, 0.013, chromeMat);
  // Highlight auf Schild
  addBox(g, cx-0.004, cy-0.085, z+0.013, 0.008, 0.032, 0.003, new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.3,metalness:0.8}));
  // Schlüsselloch
  addBox(g, cx-0.004, cy+0.018, z+0.001, 0.008, 0.014, 0.006, grooveMat);
  // Drücker (L-förmig nach links, weil Tür innen)
  addBox(g, cx-0.008, cy-0.008, z+0.013, 0.046, 0.016, 0.010, chromeMat);
}

function addStoßgriff(g, cx, cyBottom, cyTop, z) {
  const L=cyTop-cyBottom;
  // Hauptstab
  addBox(g, cx-0.013, cyBottom, z, 0.026, L, 0.040, chromeMat);
  // Halterung oben
  addBox(g, cx-0.024, cyTop-0.110-0.007, z-0.002, 0.016, 0.014, 0.042, bracketMat);
  // Halterung unten
  addBox(g, cx-0.024, cyBottom+0.096, z-0.002, 0.016, 0.014, 0.042, bracketMat);
}

// ════════════════════════════════════════════════════════════
// FLÜGEL-BUILDER
// ════════════════════════════════════════════════════════════
function addSash(g, sx, sy, sw, sh, oeff, view, prod) {
  if(sw<=0.01||sh<=0.01) return;
  // Flügel-Überschlag: Sash starts at z=OVHG, front face at OVHG+DD = 0.090
  // Frame front face at DD = 0.070 → step = 20mm (sichtbarer Überschlag)
  const SZ_FRONT = OVHG + DD;  // 0.090
  const isFixed=(oeff==='fest'||!oeff);
  const isLinks=(oeff==='dreh-l'||oeff==='dk-l');

  buildOuterFrame(g, sx, sy, sw, sh, SFR, DD, frameMat, OVHG);

  // Glanzlinie auf Flügelrahmen-Front (Profil-Kante)
  const _hl=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.04,metalness:0,emissive:0xffffff,emissiveIntensity:0.32});
  const HL2=0.003;
  addBox(g, sx, sy+sh-SFR, SZ_FRONT-HL2, sw, HL2, HL2, _hl);
  addBox(g, sx, sy+SFR-HL2, SZ_FRONT-HL2, sw, HL2, HL2, _hl);
  addBox(g, sx+SFR-HL2, sy+SFR, SZ_FRONT-HL2, HL2, sh-2*SFR, HL2, _hl);
  addBox(g, sx+sw-SFR, sy+SFR, SZ_FRONT-HL2, HL2, sh-2*SFR, HL2, _hl);

  // Äußere EPDM-Dichtung am Falz (sichtbar als schwarze Linie an Überschlag-Kante)
  addBox(g, sx,          sy+sh-DCT, OVHG-0.002, sw, DCT, 0.004, sealMat);
  addBox(g, sx,          sy,        OVHG-0.002, sw, DCT, 0.004, sealMat);
  addBox(g, sx,          sy+DCT,    OVHG-0.002, DCT, sh-2*DCT, 0.004, sealMat);
  addBox(g, sx+sw-DCT,   sy+DCT,    OVHG-0.002, DCT, sh-2*DCT, 0.004, sealMat);

  // Glasfeld
  const gx=sx+SFR, gy=sy+SFR, gw=sw-2*SFR, gh=sh-2*SFR;
  if(gw>0.01&&gh>0.01) {
    const GZ = OVHG + DD * 0.50;  // Glas in Mitte des Flügelrahmens
    addGlass(g, gx, gy, gw, gh, GZ);
    // Glasleiste — leicht erhabener PVC-Klemmstreifen um das Glas
    addGlasleiste(g, gx, gy, gw, gh, SZ_FRONT);
  }

  if(!isFixed&&view==='inn') {
    const hx=isLinks ? sx+SFR*0.55 : sx+sw-SFR*0.55;
    const hy=sy+sh*0.43;
    if(prod==='balkontuer') addBalkontuerGriff(g, hx, hy, SZ_FRONT, isLinks);
    else                    addFensterGriff(g, hx, hy, SZ_FRONT);

    if(prod==='kunststoff') {
      const hingeX=isLinks ? sx+sw-SFR*0.55 : sx+SFR*0.55;
      addFensterScharnier(g, hingeX, sy+0.165, SZ_FRONT);
      addFensterScharnier(g, hingeX, sy+sh-0.165-0.048, SZ_FRONT);
    }
  }

  // Schattenfuge — dunkle Schattennut am Flügel-Außenrand (sichtbarer Spalt zwischen Blend- und Flügelrahmen)
  const _sfMat = new THREE.MeshStandardMaterial({color: 0x060708, roughness: 0.99, metalness: 0});
  const SFG = 0.006;  // 6mm sichtbare Schattenfuge
  addBox(g, sx,        sy+sh-SFG, SZ_FRONT, sw,      SFG,      0.002, _sfMat);  // oben
  addBox(g, sx,        sy,        SZ_FRONT, sw,      SFG,      0.002, _sfMat);  // unten
  addBox(g, sx,        sy+SFG,    SZ_FRONT, SFG,     sh-2*SFG, 0.002, _sfMat);  // links
  addBox(g, sx+sw-SFG, sy+SFG,    SZ_FRONT, SFG,     sh-2*SFG, 0.002, _sfMat);  // rechts
}

// ════════════════════════════════════════════════════════════
// PRODUKT 1: FENSTER + BALKONTÜR
// ════════════════════════════════════════════════════════════
function buildFenster(S, view) {
  const W=(S.bMm||1000)/1000, H=(S.hMm||1200)/1000;
  const isFenster=S.prod==='kunststoff';
  const fl=S.fluegel||'1-fluegel';
  const hasOL=fl.includes('oberlicht')||fl.includes('ober-unter');
  const hasUL=fl.includes('unterlicht')||fl.includes('ober-unter');
  const nFl=parseInt(fl.charAt(0))||1;
  const OL_H=hasOL?H*0.20:0, UL_H=hasUL?H*0.17:0;
  const MAIN_H=H-OL_H-UL_H;
  const SB_H=isFenster?0.046:0; // Fensterbank nur bei Kunststofffenster
  const sbOvhg=isFenster?0.018:0;

  const g=new THREE.Group();

  buildLeibung(g, W, H);

  // Blendrahmen (mit Profilfase via ExtrudeGeometry)
  buildFrameExtruded(g, 0, 0, W, H, OFR, DD, frameMat);

  // Glanzlinie — charakteristische helle PVC-Kante auf der Frontfläche des Blendrahmens
  const hlMat=new THREE.MeshStandardMaterial({color:0xffffff, roughness:0.04, metalness:0, emissive:0xffffff, emissiveIntensity:0.35});
  const HL=0.005; // 5mm Glanzstreifen
  addBox(g, 0, H-OFR, DD-HL, W, HL, HL, hlMat);  // oben
  addBox(g, 0, OFR-HL, DD-HL, W, HL, HL, hlMat);  // unten
  addBox(g, OFR-HL, OFR, DD-HL, HL, H-2*OFR, HL, hlMat);  // links
  addBox(g, W-OFR, OFR, DD-HL, HL, H-2*OFR, HL, hlMat);   // rechts

  // Oberlicht
  if(hasOL) {
    const olX=OFR, olY=H-OFR-OL_H+OFR*0.5;
    addGlass(g, olX, olY, W-2*OFR, OL_H-OFR, DD*0.55);
    // OL-Trenner (horizontale Sprosse)
    addBox(g, 0, H-OL_H-OFR*0.5, 0, W, OFR*0.5, DD+SD, frameMat);
  }

  // Unterlicht
  if(hasUL) {
    const ulX=OFR, ulY=OFR;
    addGlass(g, ulX, ulY, W-2*OFR, UL_H-OFR, DD*0.55);
    addBox(g, 0, UL_H, 0, W, OFR*0.5, DD+SD, frameMat);
  }

  // Hauptflügel
  const mainY=OFR+UL_H;
  const sashW=(W-2*OFR)/nFl;
  for(let i=0;i<nFl;i++) {
    const oeff=i===0?(S.oeff1||'dreh-r'):i===1?(S.oeff2||'dreh-l'):(S.oeff3||'fest');
    const sx=OFR+i*sashW;
    addSash(g, sx, mainY, sashW, MAIN_H-OFR, oeff, view, S.prod);
    // Mittelsteg zwischen Flügeln
    if(i>0) addBox(g, sx-OFR*0.2, mainY, 0, OFR*0.4, MAIN_H-OFR, DD+SD*1.5, frameMat);
  }

  // Fensterbank (Kunststofffenster, unter dem Rahmen)
  if(isFenster) {
    addBox(g, -sbOvhg, -SB_H, -0.100, W+2*sbOvhg, SB_H, 0.180, sillMat);
  }

  g.position.set(-W/2, -H/2, 0);
  return g;
}

// ════════════════════════════════════════════════════════════
// PRODUKT 2: HAUSTÜR
// ════════════════════════════════════════════════════════════
const MODELLE = {
  'colorado-inox':         { panels:[{x:0.285,y:0.430,w:0.220,h:1.340}] },
  'montana-1-inox':        { panels:[{x:0.400,y:0.320,w:0.185,h:1.460}] },
  'montana-2-lr-inox':     { panels:[{x:0.405,y:0.399,w:0.190,h:1.273}],
                              strips:[{x:0.256,y:0.359,w:0.041,h:1.616},{x:0.704,y:0.096,w:0.040,h:1.616}] },
  'montana-3-lr-inox':     { panels:[{x:0.275,y:0.235,w:0.175,h:1.565},
                              {x:0.610,y:1.590,w:0.125,h:0.120},{x:0.610,y:1.330,w:0.125,h:0.120},
                              {x:0.610,y:1.070,w:0.125,h:0.120},{x:0.610,y:0.810,w:0.125,h:0.120},
                              {x:0.610,y:0.550,w:0.125,h:0.120}] },
  'florida-lr-inox':       { panels:[{x:0.390,y:0.165,w:0.200,h:1.750}] },
  'ohio-inox':             { panels:[{x:0.385,y:1.590,w:0.230,h:0.198},{x:0.385,y:1.245,w:0.230,h:0.198},{x:0.385,y:0.900,w:0.230,h:0.198}],
                              strips:[{x:0.270,y:0.880,w:0.050,h:1.130},{x:0.680,y:0.880,w:0.050,h:1.130}] },
  'alaska-1-inox':         { panels:[{x:0.390,y:1.640,w:0.220,h:0.210},{x:0.390,y:1.270,w:0.220,h:0.210},{x:0.390,y:0.900,w:0.220,h:0.210}] },
  'alaska-2-inox':         { panels:[{x:0.390,y:1.750,w:0.220,h:0.195},{x:0.390,y:1.480,w:0.220,h:0.195},{x:0.390,y:1.210,w:0.220,h:0.195},{x:0.390,y:0.940,w:0.220,h:0.195},{x:0.390,y:0.670,w:0.220,h:0.195}] },
  'nebraska-lcr-inox':     { panels:[{x:0.360,y:1.720,w:0.220,h:0.195},{x:0.360,y:1.490,w:0.220,h:0.195},{x:0.360,y:1.260,w:0.220,h:0.195},{x:0.360,y:1.030,w:0.220,h:0.195},{x:0.360,y:0.800,w:0.220,h:0.195}],
                              strips:[{x:0.150,y:0.780,w:0.075,h:1.160}] },
  'pennsylvania-1-inox':   { panels:[{x:0.230,y:1.635,w:0.540,h:0.185},{x:0.230,y:0.360,w:0.215,h:1.235},{x:0.555,y:0.360,w:0.215,h:1.235}] },
  'pennsylvania-2-lr-inox':{ panels:[{x:0.375,y:1.580,w:0.175,h:0.170},{x:0.400,y:1.355,w:0.175,h:0.170},{x:0.370,y:1.130,w:0.175,h:0.170},{x:0.400,y:0.905,w:0.175,h:0.170},{x:0.370,y:0.680,w:0.175,h:0.170}] },
  'pennsylvania-3-lr-inox':{ panels:[{x:0.230,y:0.200,w:0.385,h:1.710}] },
  'texas-c-inox':          { panels:[{x:0.413,y:0.235,w:0.175,h:1.580}] },
  'texas-lr-inox':         { panels:[{x:0.413,y:0.235,w:0.175,h:1.580}] },
};

function roundedRectShape(w,h,r) {
  const s=new THREE.Shape();
  s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2);
  s.absarc(w/2-r,-h/2+r,r,-Math.PI/2,0,false);
  s.lineTo(w/2,h/2-r);
  s.absarc(w/2-r,h/2-r,r,0,Math.PI/2,false);
  s.lineTo(-w/2+r,h/2);
  s.absarc(-w/2+r,h/2-r,r,Math.PI/2,Math.PI,false);
  s.lineTo(-w/2,-h/2+r);
  s.absarc(-w/2+r,-h/2+r,r,Math.PI,Math.PI*1.5,false);
  return s;
}

function buildHaustuer(S, view) {
  const DW=(S.bMm||1000)/1000, DH=(S.hMm||2100)/1000;
  const scX=DW/1.000, scY=DH/2.100;
  const isAussen=view==='aus';
  const model=MODELLE[S.tuerModell||'florida-lr-inox']||MODELLE['florida-lr-inox'];
  const panels=model.panels||[];
  const modelStrips=model.strips||[];
  const isLinks=(S.oeff1==='dreh-l');

  const g=new THREE.Group();

  buildLeibung(g, DW, DH);

  // ── Zarge (3-stufig) ──────────────────────────────
  const z1w=0.043, z1d=0.032;
  addBox(g, 0, DH-z1w, 0, DW, z1w, z1d, frameMat);
  addBox(g, 0, 0, 0, DW, z1w, z1d, frameMat);
  addBox(g, 0, z1w, 0, z1w, DH-2*z1w, z1d, frameMat);
  addBox(g, DW-z1w, z1w, 0, z1w, DH-2*z1w, z1d, frameMat);

  const z2off=z1w+0.009, z2w=0.021, z2d=0.018;
  addBox(g, z2off, DH-z2off-z2w, 0, DW-2*z2off, z2w, z2d, frameMat);
  addBox(g, z2off, z2off, 0, DW-2*z2off, z2w, z2d, frameMat);
  addBox(g, z2off, z2off+z2w, 0, z2w, DH-2*(z2off+z2w), z2d, frameMat);
  addBox(g, DW-z2off-z2w, z2off+z2w, 0, z2w, DH-2*(z2off+z2w), z2d, frameMat);

  // ── Türblatt mit Glasausschnitten (ExtrudeGeometry) ──
  {
    const s=new THREE.Shape();
    s.moveTo(0,0); s.lineTo(DW,0); s.lineTo(DW,DH); s.lineTo(0,DH); s.closePath();
    panels.forEach(p => {
      const px=p.x*scX, py=p.y*scY, pw=p.w*scX, ph=p.h*scY;
      const hole=new THREE.Path();
      hole.moveTo(px,py); hole.lineTo(px+pw,py); hole.lineTo(px+pw,py+ph); hole.lineTo(px,py+ph); hole.closePath();
      s.holes.push(hole);
    });
    const body=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:DD,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.002,bevelSegments:2}),[frameMat,frameMat]);
    body.castShadow=body.receiveShadow=true; g.add(body);
  }

  // ── Profilnut ─────────────────────────────────────
  const NUT=0.095*scX;
  const nutMat=new THREE.MeshStandardMaterial({color:frameMat.color.clone().multiplyScalar(0.72),roughness:0.9});
  [{x1:NUT,y1:NUT,x2:DW-NUT,y2:NUT},{x1:NUT,y1:DH-NUT,x2:DW-NUT,y2:DH-NUT},
   {x1:NUT,y1:NUT,x2:NUT,y2:DH-NUT},{x1:DW-NUT,y1:NUT,x2:DW-NUT,y2:DH-NUT}]
  .forEach(({x1,y1,x2,y2})=>{
    const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
    const isH=Math.abs(dx)>Math.abs(dy);
    const m=new THREE.Mesh(new THREE.BoxGeometry(isH?len:0.005, isH?0.005:len, 0.004), nutMat);
    m.position.set((x1+x2)/2,(y1+y2)/2,DD+0.001); g.add(m);
  });

  // ── Glas + Glasrahmen pro Panel ───────────────────
  const GFW=0.040*scX;
  panels.forEach(p => {
    const px=p.x*scX, py=p.y*scY, pw=p.w*scX, ph=p.h*scY;
    addGlass(g, px, py, pw, ph, DD/2);
    // Glasrahmen (Edelstahl)
    const gf=(x,y,w,h)=>addBox(g,x,y,0,w,h,DD+0.010,glFrameMat);
    gf(px-GFW,     py-GFW,     pw+GFW*2, GFW);
    gf(px-GFW,     py+ph,      pw+GFW*2, GFW);
    gf(px-GFW,     py,         GFW,      ph);
    gf(px+pw,      py,         GFW,      ph);
  });

  // ── Dekorative Edelstahl-Strips ───────────────────
  modelStrips.forEach(st=>{
    addBox(g, st.x*scX, st.y*scY, DD, st.w*scX, st.h*scY, 0.008, chromeMat);
  });

  // ── Außen: Stoßgriff ──────────────────────────────
  // Immer an HX=0.115 von links; scale.x=-1 spiegelt für DIN-links
  const HX=0.115*scX, LX=0.082*scX, LY=1.110*scY;
  if(isAussen) {
    addStoßgriff(g, HX, 0.670*scY, 1.740*scY, DD);
    // Schloss
    const lsGeo=new THREE.ExtrudeGeometry(roundedRectShape(0.024,0.072,0.012),{depth:0.007,bevelEnabled:false});
    const lsPlate=new THREE.Mesh(lsGeo, chromeMat);
    lsPlate.position.set(LX, LY, DD+0.020); g.add(lsPlate);
    const keyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.009,20), chromeMat);
    keyCyl.rotation.x=Math.PI/2; keyCyl.position.set(LX, LY+0.014, DD+0.029); g.add(keyCyl);
  }

  // ── Innen: Klinke + 3 Bandscharniere ─────────────
  if(!isAussen) {
    // Klinke an HX (gleiche Seite wie Stoßgriff — scale.x spiegelt für DIN)
    addKlinke(g, HX, DH*0.52, DD);
    // Bandscharniere gegenüber (scale.x spiegelt für DIN korrekt)
    [0.18, 0.50, 0.82].forEach(frac=>addBandScharnier(g, DW-HX, DH*frac, DD));
  }

  // DIN-Seite (Griff-Seite spiegeln wenn links)
  if(isLinks) { g.scale.x=-1; g.position.x=DW; }

  g.position.set(g.position.x - DW/2, -DH/2, 0);
  return g;
}

// ════════════════════════════════════════════════════════════
// PRODUKT 3: HEBE-SCHIEBTÜR (HST)
// ════════════════════════════════════════════════════════════
function buildHST(S, view) {
  const W=(S.bMm||2400)/1000, H=(S.hMm||2100)/1000;
  const n=(S.hstTeilung==='3-teilig')?3:2;
  const lauf=S.hstLauf||'rechts';
  const HOF=0.115; // HST outer frame
  const HSF=0.095; // HST sash profile (breiter als Fenster)
  const BR=0.022;  // Bodenschwelle

  const g=new THREE.Group();
  buildLeibung(g, W, H);

  // Außenrahmen
  buildOuterFrame(g, 0, 0, W, H, HOF, DD, frameMat);

  // Panels
  const panW=(W-2*HOF)/n;
  for(let i=0;i<n;i++) {
    const isSchieber=(lauf==='rechts')?(i===0):(i===n-1);
    const px=HOF+i*panW, py=HOF+BR, ph=H-2*HOF-BR;
    // Rahmen des Panels
    buildOuterFrame(g, px, py, panW, ph, HSF, DD, frameMat, OVHG);
    // Glas
    const gx=px+HSF, gy=py+HSF, gw=panW-2*HSF, gh=ph-2*HSF;
    if(gw>0.01&&gh>0.01) addGlass(g, gx, gy, gw, gh, DD*0.60);
    // Vertikaler Griff auf Schiebeflügel (Innenansicht)
    if(isSchieber&&view==='inn') {
      const gripX=lauf==='rechts'?px+panW-HSF*0.55:px+HSF*0.55;
      const gripY=py+ph*0.38;
      const gripH=ph*0.24;
      addBox(g, gripX-0.015, gripY, OVHG+DD+0.012, 0.030, gripH, 0.016, chromeMat);
    }
    // Schiebepfeil-Andeutung auf festem Panel (außen sichtbar)
    if(!isSchieber&&view==='aus'&&gw>0.05&&gh>0.05) {
      // kleine Glasrahmen-Andeutung der Überlappungszone
      addBox(g, isSchieber?px+panW-0.03:px, py, DD+0.012, 0.012, ph, 0.006, glFrameMat);
    }
  }

  // Bodenschwelle
  addBox(g, HOF, HOF, DD, W-2*HOF, BR, 0.028, chromeMat);

  g.position.set(-W/2, -H/2, 0);
  return g;
}

// ════════════════════════════════════════════════════════════
// LEIBUNG — angedeutete Maueröffnung (4 angeschrägte Flächen)
// ════════════════════════════════════════════════════════════
function buildLeibung(g, W, H) {
  const LD=0.160; // Leibungstiefe 160mm
  const WD=0.200; // Mauerbreite sichtbar (schmal halten)

  const addLeibFace = (pts, col) => {
    const verts=new Float32Array(pts.length*3);
    pts.forEach((p,i)=>{ verts[i*3]=p[0]; verts[i*3+1]=p[1]; verts[i*3+2]=p[2]; });
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts,3));
    geo.setIndex([0,2,1, 0,3,2]);
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:col,roughness:0.88,metalness:0})));
  };

  // Top (hell — Licht von oben)
  addLeibFace([[-WD,H+WD,-LD],[W+WD,H+WD,-LD],[W,H,0],[0,H,0]], 0xa8b8c8);
  // Bottom
  addLeibFace([[0,0,0],[W,0,0],[W+WD,-WD,-LD],[-WD,-WD,-LD]], 0x9aaabb);
  // Left
  addLeibFace([[-WD,H+WD,-LD],[0,H,0],[0,0,0],[-WD,-WD,-LD]], 0xa0b0c0);
  // Right (Schattenseite)
  addLeibFace([[W,H,0],[W+WD,H+WD,-LD],[W+WD,-WD,-LD],[W,0,0]], 0x7a8898);
}

// ════════════════════════════════════════════════════════════
// SZENE INITIALISIEREN
// ════════════════════════════════════════════════════════════
function initScene(container) {
  // Cleanup
  if(renderer) {
    cancelAnimationFrame(_animFrame);
    renderer.dispose();
  }
  container.innerHTML='';

  const W=container.clientWidth||420, H=container.clientHeight||480;

  renderer=new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;

  const cvs=renderer.domElement;
  cvs.style.cssText='width:100%;height:100%;display:block;border-radius:inherit;';
  container.appendChild(cvs);

  scene=new THREE.Scene();
  scene.background=new THREE.Color(0xbcc8d4);

  camera=new THREE.PerspectiveCamera(22, W/H, 0.1, 50);
  camera.position.set(0, 0, 6);

  controls=new OrbitControls(camera, cvs);
  controls.enablePan=false;
  controls.minDistance=2;
  controls.maxDistance=14;
  controls.maxPolarAngle=Math.PI*0.56;
  controls.minPolarAngle=Math.PI*0.44;
  controls.minAzimuthAngle=-0.28;
  controls.maxAzimuthAngle= 0.28;
  controls.update();

  // PMREM Environment für Chrome-Reflexionen
  const pmremGen=new THREE.PMREMGenerator(renderer);
  pmremGen.compileEquirectangularShader();
  // RoomEnvironment — kalibriertes Studio-Licht, ideal für Clearcoat + Metallic
  scene.environment = pmremGen.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmremGen.dispose();

  // Szenenbeleuchtung — warmes Tageslicht, Rahmen erscheint weiß
  scene.add(new THREE.HemisphereLight(0xf0eeea, 0x8090a0, 0.60)); // Himmel warm, Boden kühl
  scene.add(new THREE.AmbientLight(0xf5f2f0, 0.60));  // warmes Weiß, reduziert wegen HemisphereLight
  const key=new THREE.DirectionalLight(0xfffcf0, 1.20);  // warme Sonne von rechts-oben
  key.position.set(4,6,5); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.near=1; key.shadow.camera.far=16;
  key.shadow.camera.left=-3; key.shadow.camera.right=3;
  key.shadow.camera.top=5; key.shadow.camera.bottom=-5;
  key.shadow.bias=-0.001; scene.add(key);
  const fill=new THREE.DirectionalLight(0xc0d8f0, 0.55);  // kühles Fülllicht links
  fill.position.set(-3,2,4); scene.add(fill);
  const front=new THREE.DirectionalLight(0xffffff, 0.18); // leichter Front-Akzent versetzt
  front.position.set(1.2, 0.8, 9); scene.add(front);
  // Chrome-Spot für Griff-Reflexion
  const cL=new THREE.SpotLight(0xffffff, 12.0, 16, Math.PI/9, 0.12);
  cL.position.set(-1.0, 2.5, 5.5); scene.add(cL); scene.add(cL.target);

  // Wand hinter Produkt
  const wallMesh=new THREE.Mesh(new THREE.PlaneGeometry(16,16), new THREE.MeshStandardMaterial({color:0x8090a4,roughness:0.95}));
  wallMesh.position.set(0,0,-0.30); wallMesh.receiveShadow=true; scene.add(wallMesh);

  // Boden-Schatten
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(14,14), new THREE.ShadowMaterial({opacity:0.10}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-1.6; gnd.receiveShadow=true; scene.add(gnd);

  productGroup=new THREE.Group();
  scene.add(productGroup);

  // Render-Loop
  function loop(){ _animFrame=requestAnimationFrame(loop); controls.update(); renderer.render(scene,camera); }
  loop();

  // ResizeObserver
  const ro=new ResizeObserver(()=>{
    const pw=container.clientWidth, ph=container.clientHeight;
    if(pw>0&&ph>0){ renderer.setSize(pw,ph); camera.aspect=pw/ph; camera.updateProjectionMatrix(); }
  });
  ro.observe(container);

  _initDone=true;
}

// ════════════════════════════════════════════════════════════
// KAMERA AUF PRODUKT ANPASSEN
// ════════════════════════════════════════════════════════════
function fitCamera(S) {
  // Include Leibung (WD=0.200) in visible extent so product never clips
  const LB=0.200;
  const W=(S.bMm||1000)/1000 + 2*LB;
  const H=(S.hMm||(S.prod==='haustuere'?2100:1200))/1000 + 2*LB;
  const fovRad=22*Math.PI/180;
  const ar=camera.aspect;
  const distH=(H*0.58)/Math.tan(fovRad/2);
  const distW=(W*0.58)/(ar*Math.tan(fovRad/2));
  const dist=Math.max(distH,distW,2.5);
  camera.position.set(0,0,dist);
  controls.target.set(0,0,0);
  controls.minDistance=dist*0.45;
  controls.maxDistance=dist*2.8;
  controls.update();
}

// ════════════════════════════════════════════════════════════
// SZENE AUFBAUEN (bei jedem renderSVGPrev-Aufruf)
// ════════════════════════════════════════════════════════════
function rebuildScene(S, view) {
  // productGroup leeren
  while(productGroup.children.length>0){
    const c=productGroup.children[0];
    if(c.geometry) c.geometry.dispose();
    productGroup.remove(c);
  }
  if(!S||!S.prod) return;

  // Farbe/Material setzen
  const isAussen=view==='aus';
  const colorKey=isAussen?S.fa:S.fi;
  applyMaterial(frameMat, colorKey||'weiss');

  // Dichtungsfarbe
  const sealHex=window._kP?.fd?.[S.fd]?.hex||'#1a1a1a';
  sealMat.color.set(sealHex); sealMat.needsUpdate=true;

  // Glasart
  applyGlass(S.glasdekor||'klar');

  // Produkt bauen
  let group=null;
  if(S.prod==='kunststoff'||S.prod==='balkontuer') group=buildFenster(S,view);
  else if(S.prod==='haustuere') group=buildHaustuer(S,view);
  else if(S.prod==='hst') group=buildHST(S,view);
  if(group) productGroup.add(group);

  fitCamera(S);
}

// ════════════════════════════════════════════════════════════
// ÖFFENTLICHE API — ersetzt window.renderSVGPrev
// ════════════════════════════════════════════════════════════
window.renderSVGPrev = function(containerId, view) {
  const container=document.getElementById(containerId);
  if(!container) return;

  // Szene beim ersten Mal oder wenn Container gewechselt hat
  if(_containerId!==containerId||!_initDone) {
    initScene(container);
    _containerId=containerId;
  }

  const S=window._kS;
  if(!S||!S.prod) return;
  rebuildScene(S, view||'inn');
};

// Wenn Produkt schon gewählt war während Modul lud, neu rendern
if (typeof window.drawPrev === 'function' && window._kS?.prod) {
  window.drawPrev();
}
