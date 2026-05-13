// konfigurator-3d.js — Photorealistischer 3D-Konfigurator für Drutex IGLO 5
// Alle 4 Produkte: Fenster, Balkontür, Haustür, Hebeschiebetür
// Floating-Style (kein Kasten), echte Öffnungsanimation per Pivot-Gruppen

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ════════════════════════════════════════════════════════════
// DRUTEX IGLO 5 — Profilmaße (1 unit = 1 Meter)
// ════════════════════════════════════════════════════════════
const OFR  = 0.090;   // Blendrahmen 90mm
const SFR  = 0.085;   // Flügelrahmen 85mm
const DD   = 0.070;   // Profiltiefe 70mm
const OVHG = 0.010;   // Flügel-Überschlag 10mm
const DCT  = 0.009;   // EPDM-Dichtung 9mm
const GLB  = 0.018;   // Glasleiste 18mm
const ABH  = 0.022;   // Abstandhalter 22mm

// ════════════════════════════════════════════════════════════
// SZENEN-STATE + ANIMATION
// ════════════════════════════════════════════════════════════
let renderer, camera, controls, scene, productGroup;
let _animFrame = null;
let _containerId = null;
let _initDone = false;

// Öffnungsanimation
let _openProgress = 0;     // 0=geschlossen, 1=offen
let _openTarget   = 0;
let _animatables  = [];    // [{pivot, openRot, openPos, type}]
let _currentProd  = null;

// ════════════════════════════════════════════════════════════
// MATERIALIEN
// ════════════════════════════════════════════════════════════
const texLoader = new THREE.TextureLoader();

const frameMat = new THREE.MeshPhysicalMaterial({
  color: 0xF2F1EC,
  roughness: 0.18, metalness: 0.0,
  clearcoat: 0.60, clearcoatRoughness: 0.08,
  envMapIntensity: 1.20
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xd8eef4,          // leichter Blau-Grün-Stich — Klarglas sieht man so
  metalness: 0.0, roughness: 0.04,
  transmission: 0.88, thickness: 0.028, ior: 1.52, transparent: true,
  envMapIntensity: 0.06
});
const glassRoomMat = new THREE.MeshStandardMaterial({
  color: 0xe8ecee, roughness: 0.95, metalness: 0
});
const sealMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a, roughness: 0.92, metalness: 0
});
const spacerMat = new THREE.MeshStandardMaterial({
  color: 0x111210, roughness: 0.78, metalness: 0.06
});
const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xd8dce0, roughness: 0.08, metalness: 0.95, envMapIntensity: 4.0
});
const bracketMat = new THREE.MeshStandardMaterial({
  color: 0xcdd2d6, roughness: 0.10, metalness: 0.90, envMapIntensity: 3.5
});
const glFrameMat = new THREE.MeshStandardMaterial({
  color: 0xc8ced2, roughness: 0.20, metalness: 0.72, envMapIntensity: 2.0
});
const grooveMat = new THREE.MeshStandardMaterial({
  color: 0x181b1d, roughness: 0.72
});
const sillMat = new THREE.MeshStandardMaterial({
  color: 0xebebE6, roughness: 0.55, metalness: 0
});

// ════════════════════════════════════════════════════════════
// FARB-SYSTEM
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
  const hex = window._kP?.fa?.[faKey]?.hex || window._kP?.fi?.[faKey]?.hex || '#F2F1EC';
  mat.color.set(hex);
  const isGlatt    = k.endsWith('-gl');
  const isUltiMatt = k.endsWith('-um');
  mat.roughness        = isUltiMatt ? 0.97 : isGlatt ? 0.16 : 0.20;
  mat.envMapIntensity  = isUltiMatt ? 0.02 : isGlatt ? 1.70 : 1.20;
  mat.metalness        = isUltiMatt ? 0 : 0.0;
  if(mat.clearcoat !== undefined) {
    mat.clearcoat          = isUltiMatt ? 0.0 : isGlatt ? 0.60 : 0.45;
    mat.clearcoatRoughness = isUltiMatt ? 1.0 : isGlatt ? 0.06 : 0.16;
  }
  mat.needsUpdate = true;
  grooveMat.color.set(hex).multiplyScalar(0.58);
  grooveMat.needsUpdate = true;
}
function applyWood(mat, k) {
  clearMatMaps(mat);
  if (k === 'schwarzbraun') {
    mat.color.set(0x1c1810); mat.roughness = 0.88; mat.metalness = 0;
    mat.envMapIntensity = 0.04; mat.needsUpdate = true; return;
  }
  const [rx, ry] = WOOD_REPEAT[k] ?? [1.5, 1];
  texLoader.load('img/swatches/' + k + '.webp', tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.rotation = Math.PI / 2; tex.center.set(0.5, 0.5);
    tex.repeat.set(rx, ry); tex.needsUpdate = true;
    mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 0.022;
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
// GLAS-TYPEN
// ════════════════════════════════════════════════════════════
function seededRnd(seed) {
  let s=seed; return ()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};
}
function heightToNormal(hCanvas, strength) {
  const W=hCanvas.width,H=hCanvas.height,hData=hCanvas.getContext('2d').getImageData(0,0,W,H).data;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const nCtx=out.getContext('2d'),nImg=nCtx.createImageData(W,H);
  function h(x,y){x=Math.max(0,Math.min(W-1,x));y=Math.max(0,Math.min(H-1,y));return hData[(y*W+x)*4]/255;}
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dX=(h(x-1,y-1)-h(x+1,y-1))+2*(h(x-1,y)-h(x+1,y))+(h(x-1,y+1)-h(x+1,y+1));
    const dY=(h(x-1,y-1)-h(x-1,y+1))+2*(h(x,y-1)-h(x,y+1))+(h(x+1,y-1)-h(x+1,y+1));
    const nx=dX*strength,ny=dY*strength,nz=1.0,len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    const i=(y*W+x)*4;
    nImg.data[i]=(nx/len*.5+.5)*255;nImg.data[i+1]=(ny/len*.5+.5)*255;
    nImg.data[i+2]=(nz/len*.5+.5)*255;nImg.data[i+3]=255;
  }
  nCtx.putImageData(nImg,0,0); return out;
}
function chinchillaHeight(){
  const W=512,H=512,cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;
  const ctx=cvs.getContext('2d'),rnd=seededRnd(4217);
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  for(let i=0;i<300;i++){
    const x=rnd()*W,y=rnd()*H,r=18+rnd()*28,rx=r*(0.65+rnd()*0.7),ry=r*(0.65+rnd()*0.7);
    const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.6,'rgba(128,128,128,0.5)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rnd()*Math.PI,0,Math.PI*2);ctx.fill();
  } return cvs;
}
function masterCarreHeight(){
  const W=256,H=256,cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;
  const ctx=cvs.getContext('2d'),STEP=32,LINE=8;
  ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);
  for(let p=0;p<=W;p+=STEP){const g=ctx.createLinearGradient(p-LINE,0,p+LINE,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(p-LINE,0,LINE*2,H);}
  for(let p=0;p<=H;p+=STEP){const g=ctx.createLinearGradient(0,p-LINE,0,p+LINE);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,p-LINE,W,LINE*2);}
  return cvs;
}
function buildNormalTex(hFn,strength,rx,ry){
  const tex=new THREE.CanvasTexture(heightToNormal(hFn(),strength));
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(rx,ry);return tex;
}
function applyGlass(key){
  ['normalMap'].forEach(k=>{if(glassMat[k]){glassMat[k].dispose();glassMat[k]=null;}});
  if(key==='satinato'){
    glassMat.transmission=0.28;glassMat.roughness=0.95;glassMat.color.set(0xdde4e4);
  }else if(key==='chinchilla'){
    glassMat.transmission=0.58;glassMat.roughness=0.12;glassMat.color.set(0xc8dce8);
    glassMat.normalMap=buildNormalTex(chinchillaHeight,4.5,5,16);
    glassMat.normalScale=new THREE.Vector2(1.8,1.8);
  }else if(key==='master-carre'){
    glassMat.transmission=0.72;glassMat.roughness=0.06;glassMat.color.set(0xc8dce8);
    glassMat.normalMap=buildNormalTex(masterCarreHeight,4.0,3,11);
    glassMat.normalScale=new THREE.Vector2(1.5,1.5);
  }else{
    // Klarglas — leicht blau-grün wie echtes Float-Glas
    glassMat.transmission=0.88;glassMat.roughness=0.04;glassMat.color.set(0xd8eef4);
    glassMat.envMapIntensity=0.06;
  }
  glassMat.needsUpdate=true;
}

// ════════════════════════════════════════════════════════════
// GEOMETRIE-HELFER
// ════════════════════════════════════════════════════════════
function addBox(g,x,y,z,w,h,d,mat){
  if(w<=0||h<=0||d<=0)return;
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||frameMat);
  m.position.set(x+w/2,y+h/2,z+d/2);
  m.castShadow=m.receiveShadow=true;
  g.add(m);
}
function addPlane(g,x,y,z,w,h,mat){
  if(w<=0||h<=0)return;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat||glassMat);
  m.position.set(x+w/2,y+h/2,z);g.add(m);
}
function addGlass(g,x,y,gw,gh,zPos){
  // Raumhintergrund (Interior-Ton hinter Glas)
  addPlane(g,x,y,Math.max(0.002,zPos-0.028),gw,gh,glassRoomMat);
  addPlane(g,x,y,zPos,gw,gh,glassMat);
  // Abstandhalter (Swisspacer — schwarz, klar sichtbar)
  const ahZ=zPos+0.002;
  addBox(g,x,      y+gh-ABH,ahZ,gw,      ABH,     0.005,spacerMat);
  addBox(g,x,      y,       ahZ,gw,      ABH,     0.005,spacerMat);
  addBox(g,x,      y+ABH,   ahZ,ABH,     gh-2*ABH,0.005,spacerMat);
  addBox(g,x+gw-ABH,y+ABH,  ahZ,ABH,     gh-2*ABH,0.005,spacerMat);
}
function addGlasleiste(g,gx,gy,gw,gh,zSashFront){
  const GLD=0.004;
  addBox(g,gx,      gy+gh-GLB,zSashFront,gw,  GLB,     GLD,frameMat);
  addBox(g,gx,      gy,       zSashFront,gw,  GLB,     GLD,frameMat);
  addBox(g,gx,      gy+GLB,   zSashFront,GLB, gh-2*GLB,GLD,frameMat);
  addBox(g,gx+gw-GLB,gy+GLB,  zSashFront,GLB, gh-2*GLB,GLD,frameMat);
}
function buildOuterFrame(g,X,Y,W,H,FW,depth,mat,zStart=0){
  addBox(g,X,      Y+H-FW, zStart,W,    FW,    depth,mat);
  addBox(g,X,      Y,      zStart,W,    FW,    depth,mat);
  addBox(g,X,      Y+FW,   zStart,FW,   H-2*FW,depth,mat);
  addBox(g,X+W-FW, Y+FW,   zStart,FW,   H-2*FW,depth,mat);
}
function buildFrameExtruded(g,X,Y,W,H,FW,depth,mat,zStart=0){
  const shape=new THREE.Shape();
  shape.moveTo(X,Y);shape.lineTo(X+W,Y);shape.lineTo(X+W,Y+H);shape.lineTo(X,Y+H);shape.closePath();
  const hole=new THREE.Path();
  hole.moveTo(X+FW,Y+FW);hole.lineTo(X+W-FW,Y+FW);hole.lineTo(X+W-FW,Y+H-FW);hole.lineTo(X+FW,Y+H-FW);hole.closePath();
  shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{
    depth,bevelEnabled:true,bevelSize:0.004,bevelThickness:0.004,bevelSegments:3
  });
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.z=zStart;
  mesh.castShadow=mesh.receiveShadow=true;
  g.add(mesh);
}

// ════════════════════════════════════════════════════════════
// HARDWARE — HOPPE Atlanta Griff (original Geometrie)
// ════════════════════════════════════════════════════════════
function addFensterGriff(g,cx,cy,z){
  // Griff weiß wie Rahmen (Drutex Standard) — extremer Clearcoat für Glanzlinie
  const hMat=new THREE.MeshPhysicalMaterial({
    color:frameMat.color.clone(),
    roughness:0.12,metalness:0.0,
    clearcoat:0.98,clearcoatRoughness:0.04,envMapIntensity:3.0
  });
  const axisMat=new THREE.MeshStandardMaterial({color:0x8a8a92,roughness:0.35,metalness:0.75});

  // Langschild 28×92×18mm abgerundet
  const sW=0.028,sH=0.092,sD=0.018,sR=0.005;
  const sShape=new THREE.Shape();
  sShape.moveTo(-sW/2+sR,-sH/2);
  sShape.lineTo(sW/2-sR,-sH/2);sShape.absarc(sW/2-sR,-sH/2+sR,sR,-Math.PI/2,0,false);
  sShape.lineTo(sW/2,sH/2-sR);sShape.absarc(sW/2-sR,sH/2-sR,sR,0,Math.PI/2,false);
  sShape.lineTo(-sW/2+sR,sH/2);sShape.absarc(-sW/2+sR,sH/2-sR,sR,Math.PI/2,Math.PI,false);
  sShape.lineTo(-sW/2,-sH/2+sR);sShape.absarc(-sW/2+sR,-sH/2+sR,sR,Math.PI,Math.PI*1.5,false);
  const sGeo=new THREE.ExtrudeGeometry(sShape,{depth:sD,bevelEnabled:true,bevelSize:0.003,bevelThickness:0.003,bevelSegments:3});
  const sMesh=new THREE.Mesh(sGeo,hMat);
  sMesh.position.set(cx-sW/2,cy-sH/2,z);sMesh.castShadow=true;g.add(sMesh);

  // Achslager — sichtbarer Metall-Zapfen
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.012,16),axisMat);
  axle.rotation.x=Math.PI/2;axle.position.set(cx,cy,z+sD+0.006);g.add(axle);

  // Griffarm — TubeGeometry S-Kurve nach unten
  const armCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx,cy,         z+sD+0.002),
    new THREE.Vector3(cx,cy,         z+sD+0.020),
    new THREE.Vector3(cx,cy-0.014,   z+sD+0.034),
    new THREE.Vector3(cx,cy-0.052,   z+sD+0.040),
    new THREE.Vector3(cx,cy-0.095,   z+sD+0.034),
    new THREE.Vector3(cx,cy-0.104,   z+sD+0.026),
  ]);
  const armMesh=new THREE.Mesh(new THREE.TubeGeometry(armCurve,28,0.014,14,false),hMat);
  armMesh.castShadow=true;g.add(armMesh);

  // Griffspitze — leicht ovale Kugel
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.014,16,10),hMat);
  tip.scale.set(1,1.35,1);tip.position.set(cx,cy-0.106,z+sD+0.026);tip.castShadow=true;g.add(tip);
}

function addBalkontuerGriff(g,cx,cy,z,isLinks){
  const hMat=new THREE.MeshPhysicalMaterial({
    color:frameMat.color.clone(),
    roughness:0.12,metalness:0.0,
    clearcoat:0.98,clearcoatRoughness:0.04,envMapIntensity:3.0
  });
  const axisMat=new THREE.MeshStandardMaterial({color:0x8a8a92,roughness:0.35,metalness:0.75});
  const sW=0.028,sH=0.118,sD=0.018,sR=0.005;
  const sShape=new THREE.Shape();
  sShape.moveTo(-sW/2+sR,-sH/2);
  sShape.lineTo(sW/2-sR,-sH/2);sShape.absarc(sW/2-sR,-sH/2+sR,sR,-Math.PI/2,0,false);
  sShape.lineTo(sW/2,sH/2-sR);sShape.absarc(sW/2-sR,sH/2-sR,sR,0,Math.PI/2,false);
  sShape.lineTo(-sW/2+sR,sH/2);sShape.absarc(-sW/2+sR,sH/2-sR,sR,Math.PI/2,Math.PI,false);
  sShape.lineTo(-sW/2,-sH/2+sR);sShape.absarc(-sW/2+sR,-sH/2+sR,sR,Math.PI,Math.PI*1.5,false);
  const sGeo=new THREE.ExtrudeGeometry(sShape,{depth:sD,bevelEnabled:true,bevelSize:0.003,bevelThickness:0.003,bevelSegments:3});
  const sMesh=new THREE.Mesh(sGeo,hMat);
  sMesh.position.set(cx-sW/2,cy-sH/2,z);sMesh.castShadow=true;g.add(sMesh);

  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.012,16),axisMat);
  axle.rotation.x=Math.PI/2;axle.position.set(cx,cy+sH*0.20,z+sD+0.006);g.add(axle);

  // Horizontaler Drücker-Arm
  const dir=isLinks?1:-1;
  const pivotY=cy+sH*0.20;
  const armCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx,           pivotY,z+sD+0.002),
    new THREE.Vector3(cx,           pivotY,z+sD+0.020),
    new THREE.Vector3(cx+dir*0.020, pivotY,z+sD+0.030),
    new THREE.Vector3(cx+dir*0.082, pivotY,z+sD+0.034),
    new THREE.Vector3(cx+dir*0.132, pivotY,z+sD+0.030),
    new THREE.Vector3(cx+dir*0.142, pivotY,z+sD+0.022),
  ]);
  const armMesh=new THREE.Mesh(new THREE.TubeGeometry(armCurve,22,0.014,12,false),hMat);
  armMesh.castShadow=true;g.add(armMesh);

  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.014,14,10),hMat);
  tip.scale.set(1,1.35,1);tip.position.set(cx+dir*0.144,pivotY,z+sD+0.022);tip.castShadow=true;g.add(tip);

  addBox(g,cx-0.004,cy-sH*0.25,z+0.001,0.008,0.014,0.006,grooveMat);
}

// MACO Multi-Matic Scharnier — echte Geometrie
function addFensterScharnier(g,cx,cy,z){
  const sMat=new THREE.MeshStandardMaterial({color:0xbec0be,roughness:0.55,metalness:0.25,envMapIntensity:1.0});
  const pinMat=new THREE.MeshStandardMaterial({color:0xa8aaa8,roughness:0.45,metalness:0.35});
  // Flügelplatte 44×48×7mm
  addBox(g,cx-0.022,cy-0.024,z,0.044,0.048,0.007,sMat);
  // L-Körper (Lagerkörper) tiefer ins Profil
  addBox(g,cx-0.022,cy-0.006,z-0.016,0.044,0.012,0.016,sMat);
  // Tragezapfen Ø8mm
  const pin=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.018,12),pinMat);
  pin.rotation.x=Math.PI/2;pin.position.set(cx,cy,z+0.009);g.add(pin);
  // 2 Schraubenköpfe (sichtbare Befestigung)
  [cy-0.014,cy+0.012].forEach(sy=>{
    const scr=new THREE.Mesh(new THREE.CylinderGeometry(0.0030,0.0028,0.005,8),pinMat);
    scr.rotation.x=Math.PI/2;scr.position.set(cx,sy,z+0.008);g.add(scr);
    // Schlitz im Schraubenkopf
    addBox(g,cx-0.003,sy-0.0002,z+0.011,0.006,0.0004,0.002,grooveMat);
  });
}

// Bandscharniere für Haustür (3-fach)
function addBandScharnier(g,cx,cy,z){
  const bMat=new THREE.MeshStandardMaterial({color:0xb8bcba,roughness:0.50,metalness:0.30,envMapIntensity:1.2});
  // Oberer Bandlappen (Zargenplatte)
  addBox(g,cx-0.025,cy,      z,0.050,0.062,0.013,bMat);
  // Unterer Bandlappen (Blattplatte)
  addBox(g,cx-0.025,cy-0.062,z-0.001,0.050,0.058,0.011,bMat);
  // Scharnierachse
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.010,14),grooveMat);
  axle.position.set(cx,cy,z+0.007);g.add(axle);
  // Schraubenköpfe (je 2)
  [[cy+0.016,cy+0.044],[-0.040,-0.018]].forEach(([y1,y2])=>{
    [y1,y2].forEach(sy=>{
      const s=new THREE.Mesh(new THREE.CylinderGeometry(0.0035,0.003,0.005,8),bMat);
      s.rotation.x=Math.PI/2;s.position.set(cx,sy,z+0.013);g.add(s);
    });
  });
}

// Haustür-Stoßgriff: runder Edelstahlstab + Kugeln + L-Halterungen
function addStoßgriff(g,cx,cyBottom,cyTop,z){
  const L=cyTop-cyBottom, midY=(cyBottom+cyTop)/2;
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.020,0.020,L,18),chromeMat);
  rod.position.set(cx,midY,z+0.062);rod.castShadow=true;g.add(rod);
  [cyTop,cyBottom].forEach(capY=>{
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.021,16,12),chromeMat);
    cap.position.set(cx,capY,z+0.062);cap.castShadow=true;g.add(cap);
  });
  // L-Halterungen (oben + unten)
  [[cyTop-0.130,1],[cyBottom+0.095,-1]].forEach(([hy])=>{
    addBox(g,cx-0.020,hy,         z,     0.040,0.025,0.066,bracketMat);
    addBox(g,cx-0.020,hy,         z+0.046,0.040,0.025,0.022,bracketMat);
  });
}

// Klinke (Innen-Haustür): Schild in Rahmenfarbe + Chrom-Drücker
function addKlinke(g,cx,cy,z){
  const sW=0.022,sH=0.118,sD=0.015,sR=0.004;
  const sh=new THREE.Shape();
  sh.moveTo(-sW/2+sR,-sH/2);
  sh.lineTo(sW/2-sR,-sH/2);sh.absarc(sW/2-sR,-sH/2+sR,sR,-Math.PI/2,0,false);
  sh.lineTo(sW/2,sH/2-sR);sh.absarc(sW/2-sR,sH/2-sR,sR,0,Math.PI/2,false);
  sh.lineTo(-sW/2+sR,sH/2);sh.absarc(-sW/2+sR,sH/2-sR,sR,Math.PI/2,Math.PI,false);
  sh.lineTo(-sW/2,-sH/2+sR);sh.absarc(-sW/2+sR,-sH/2+sR,sR,Math.PI,Math.PI*1.5,false);
  const shieldMesh=new THREE.Mesh(
    new THREE.ExtrudeGeometry(sh,{depth:sD,bevelEnabled:true,bevelSize:0.002,bevelThickness:0.002,bevelSegments:2}),
    frameMat
  );
  shieldMesh.position.set(cx-sW/2,cy-sH/2,z);shieldMesh.castShadow=true;g.add(shieldMesh);

  const pivotY=cy+sH*0.20;
  const drvCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx,        pivotY,       z+sD+0.002),
    new THREE.Vector3(cx,        pivotY,       z+sD+0.018),
    new THREE.Vector3(cx-0.018,  pivotY-0.008, z+sD+0.028),
    new THREE.Vector3(cx-0.082,  pivotY-0.012, z+sD+0.032),
    new THREE.Vector3(cx-0.132,  pivotY-0.010, z+sD+0.028),
    new THREE.Vector3(cx-0.142,  pivotY-0.006, z+sD+0.020),
  ]);
  const drv=new THREE.Mesh(new THREE.TubeGeometry(drvCurve,22,0.014,12,false),chromeMat);
  drv.castShadow=true;g.add(drv);
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.014,12,8),chromeMat);
  tip.scale.set(1,1.3,1);tip.position.set(cx-0.144,pivotY-0.005,z+sD+0.020);tip.castShadow=true;g.add(tip);

  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.010,14),chromeMat);
  axle.rotation.x=Math.PI/2;axle.position.set(cx,pivotY,z+sD+0.005);g.add(axle);

  addBox(g,cx-0.004,cy+0.018,z+0.001,0.008,0.014,0.006,grooveMat);
}

// ════════════════════════════════════════════════════════════
// FLÜGEL-BUILDER — Pivot-Gruppe für Animation
// ════════════════════════════════════════════════════════════
function buildSash(parentG, sx, sy, sw, sh, oeff, view, prod) {
  if(sw<=0.01||sh<=0.01) return null;

  const SZ_FRONT=OVHG+DD;
  const isFixed=(oeff==='fest'||!oeff);
  const isLinks=(oeff==='dreh-l'||oeff==='dk-l');
  const isKipp=(oeff==='kipp');

  // Pivot-Gruppe an der Scharnier-Achse
  // Dreh-rechts: Scharnier links (sx), Flügel öffnet rechts raus → rotiert um linke Y-Achse
  // Dreh-links:  Scharnier rechts (sx+sw)
  // Kipp:        Achse unten (sy)
  const pivotX = isKipp ? sx+sw/2 : (isLinks ? sx+sw : sx);
  const pivotY = isKipp ? sy       : sy+sh/2;

  const pivot=new THREE.Group();
  pivot.position.set(pivotX, pivotY, 0);

  const inner=new THREE.Group();
  inner.position.set(-pivotX, -pivotY, 0);
  pivot.add(inner);

  // Flügelrahmen (ExtrudeGeometry mit Bevel)
  buildFrameExtruded(inner, sx, sy, sw, sh, SFR, DD, frameMat, OVHG);

  // Profil-Stufe (sichtbarer Innenrand — deutlich dunkler für Tiefenwirkung)
  const _stepCol=new THREE.Color(frameMat.color).multiplyScalar(0.60);
  const _stepMat=new THREE.MeshStandardMaterial({color:_stepCol,roughness:0.30,metalness:0});
  const STEP=0.022;
  addBox(inner,sx+SFR,    sy+sh-SFR-STEP,  DD+OVHG+0.001,sw-2*SFR,STEP,0.003,_stepMat);
  addBox(inner,sx+SFR,    sy+SFR,          DD+OVHG+0.001,sw-2*SFR,STEP,0.003,_stepMat);
  addBox(inner,sx+SFR,    sy+SFR+STEP,     DD+OVHG+0.001,STEP,sh-2*SFR-2*STEP,0.003,_stepMat);
  addBox(inner,sx+sw-SFR-STEP,sy+SFR+STEP, DD+OVHG+0.001,STEP,sh-2*SFR-2*STEP,0.003,_stepMat);

  // EPDM-Dichtung
  addBox(inner,sx,      sy+sh-DCT,OVHG-0.002,sw, DCT,     0.004,sealMat);
  addBox(inner,sx,      sy,       OVHG-0.002,sw, DCT,     0.004,sealMat);
  addBox(inner,sx,      sy+DCT,   OVHG-0.002,DCT,sh-2*DCT,0.004,sealMat);
  addBox(inner,sx+sw-DCT,sy+DCT,  OVHG-0.002,DCT,sh-2*DCT,0.004,sealMat);

  // Schattenfuge
  const _sfMat=new THREE.MeshStandardMaterial({color:0x050608,roughness:0.99,metalness:0});
  const SFG=0.007;
  addBox(inner,sx,        sy+sh-SFG,SZ_FRONT,sw,      SFG,     0.002,_sfMat);
  addBox(inner,sx,        sy,       SZ_FRONT,sw,      SFG,     0.002,_sfMat);
  addBox(inner,sx,        sy+SFG,   SZ_FRONT,SFG,     sh-2*SFG,0.002,_sfMat);
  addBox(inner,sx+sw-SFG, sy+SFG,   SZ_FRONT,SFG,     sh-2*SFG,0.002,_sfMat);

  // Glasfeld
  const gx=sx+SFR,gy=sy+SFR,gw=sw-2*SFR,gh=sh-2*SFR;
  if(gw>0.01&&gh>0.01){
    const GZ=OVHG+DD*0.50;
    addGlass(inner,gx,gy,gw,gh,GZ);
    addGlasleiste(inner,gx,gy,gw,gh,SZ_FRONT);
  }

  // Hardware (nur Innenansicht, beweglicher Flügel)
  if(!isFixed&&view==='inn'){
    const hx=isLinks?sx+SFR*0.60:sx+sw-SFR*0.60;
    const hy=sy+sh*0.53;
    if(prod==='balkontuer') addBalkontuerGriff(inner,hx,hy,SZ_FRONT,isLinks);
    else                    addFensterGriff(inner,hx,hy,SZ_FRONT);
    const hingeX=isLinks?sx+sw-SFR*0.55:sx+SFR*0.55;
    addFensterScharnier(inner,hingeX,sy+sh*0.14,SZ_FRONT);
    addFensterScharnier(inner,hingeX,sy+sh*0.86-0.024,SZ_FRONT);
  }

  parentG.add(pivot);

  // Animation registrieren
  if(!isFixed){
    let openRot;
    if(isKipp){
      // Kipp: Oberkante kommt 30° auf Betrachter zu
      openRot=new THREE.Euler(-Math.PI/6,0,0);
    }else if(isLinks){
      // Dreh-links: Scharnier rechts, öffnet nach links
      openRot=new THREE.Euler(0,Math.PI/3,0);
    }else{
      // Dreh-rechts: Scharnier links, öffnet nach rechts
      openRot=new THREE.Euler(0,-Math.PI/3,0);
    }
    _animatables.push({type:'sash',pivot,openRot,closedRot:new THREE.Euler(0,0,0)});
  }

  return pivot;
}

// ════════════════════════════════════════════════════════════
// PRODUKT 1: FENSTER + BALKONTÜR
// ════════════════════════════════════════════════════════════
function buildFenster(S,view){
  const W=(S.bMm||1000)/1000, H=(S.hMm||1200)/1000;
  const isFenster=S.prod==='kunststoff';
  const fl=S.fluegel||'1-fluegel';
  const hasOL=fl.includes('oberlicht')||fl.includes('ober-unter');
  const hasUL=fl.includes('unterlicht')||fl.includes('ober-unter');
  const nFl=parseInt(fl.charAt(0))||1;
  const OL_H=hasOL?H*0.26:0, UL_H=hasUL?H*0.18:0;
  const MAIN_H=H-OL_H-UL_H;
  const SB_H=isFenster?0.048:0, sbOvhg=isFenster?0.020:0;

  const g=new THREE.Group();

  // Blendrahmen — ExtrudeGeometry mit echtem Bevel
  buildFrameExtruded(g,0,0,W,H,OFR,DD,frameMat);

  // Innere Profil-Stufe (deutlich dunkler — sichtbare Tiefe)
  const _stepCol=new THREE.Color(frameMat.color).multiplyScalar(0.58);
  const _stepMat=new THREE.MeshStandardMaterial({color:_stepCol,roughness:0.32,metalness:0});
  const STEP=0.024;
  addBox(g,OFR,      H-OFR-STEP,DD+0.001,W-2*OFR,STEP,0.003,_stepMat);
  addBox(g,OFR,      OFR,       DD+0.001,W-2*OFR,STEP,0.003,_stepMat);
  addBox(g,OFR,      OFR+STEP,  DD+0.001,STEP,H-2*OFR-2*STEP,0.003,_stepMat);
  addBox(g,W-OFR-STEP,OFR+STEP, DD+0.001,STEP,H-2*OFR-2*STEP,0.003,_stepMat);

  // Glanzlinie — subtile Profilkante
  const hlMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.04,metalness:0,emissive:0xffffff,emissiveIntensity:0.08});
  const HL=0.004;
  addBox(g,0,H-OFR,DD-HL,W,HL,HL,hlMat);
  addBox(g,0,OFR-HL,DD-HL,W,HL,HL,hlMat);
  addBox(g,OFR-HL,OFR,DD-HL,HL,H-2*OFR,HL,hlMat);
  addBox(g,W-OFR,OFR,DD-HL,HL,H-2*OFR,HL,hlMat);

  // Oberlicht
  if(hasOL){
    const olX=OFR,olY=H-OFR-OL_H+OFR*0.4;
    addGlass(g,olX,olY,W-2*OFR,OL_H-OFR*0.4,DD*0.55);
    addBox(g,0,H-OL_H-OFR*0.4,0,W,OFR*0.5,DD,frameMat);
  }
  if(hasUL){
    addGlass(g,OFR,OFR,W-2*OFR,UL_H-OFR,DD*0.55);
    addBox(g,0,UL_H,0,W,OFR*0.5,DD,frameMat);
  }

  // Hauptflügel — pivot-basiert
  const mainY=OFR+UL_H;
  const sashW=(W-2*OFR)/nFl;
  for(let i=0;i<nFl;i++){
    const oeff=i===0?(S.oeff1||'dreh-r'):i===1?(S.oeff2||'dreh-l'):(S.oeff3||'fest');
    const sx=OFR+i*sashW;
    buildSash(g,sx,mainY,sashW,MAIN_H-OFR,oeff,view,S.prod);
    if(i>0) addBox(g,sx-OFR*0.2,mainY,0,OFR*0.4,MAIN_H-OFR,DD,frameMat);
  }

  // Fensterbank
  if(isFenster){
    addBox(g,-sbOvhg,-SB_H,-0.100,W+2*sbOvhg,SB_H,0.185,sillMat);
  }

  g.position.set(-W/2,-H/2,0);
  return g;
}

// ════════════════════════════════════════════════════════════
// PRODUKT 2: HAUSTÜR
// ════════════════════════════════════════════════════════════
const MODELLE={
  'colorado-inox':         {panels:[{x:0.285,y:0.430,w:0.220,h:1.340}]},
  'montana-1-inox':        {panels:[{x:0.400,y:0.320,w:0.185,h:1.460}]},
  'montana-2-lr-inox':     {panels:[{x:0.405,y:0.399,w:0.190,h:1.273}],strips:[{x:0.256,y:0.359,w:0.041,h:1.616},{x:0.704,y:0.096,w:0.040,h:1.616}]},
  'montana-3-lr-inox':     {panels:[{x:0.275,y:0.235,w:0.175,h:1.565},{x:0.610,y:1.590,w:0.125,h:0.120},{x:0.610,y:1.330,w:0.125,h:0.120},{x:0.610,y:1.070,w:0.125,h:0.120},{x:0.610,y:0.810,w:0.125,h:0.120},{x:0.610,y:0.550,w:0.125,h:0.120}]},
  'florida-lr-inox':       {panels:[{x:0.390,y:0.165,w:0.200,h:1.750}]},
  'ohio-inox':             {panels:[{x:0.385,y:1.590,w:0.230,h:0.198},{x:0.385,y:1.245,w:0.230,h:0.198},{x:0.385,y:0.900,w:0.230,h:0.198}],strips:[{x:0.270,y:0.880,w:0.050,h:1.130},{x:0.680,y:0.880,w:0.050,h:1.130}]},
  'alaska-1-inox':         {panels:[{x:0.390,y:1.640,w:0.220,h:0.210},{x:0.390,y:1.270,w:0.220,h:0.210},{x:0.390,y:0.900,w:0.220,h:0.210}]},
  'alaska-2-inox':         {panels:[{x:0.390,y:1.750,w:0.220,h:0.195},{x:0.390,y:1.480,w:0.220,h:0.195},{x:0.390,y:1.210,w:0.220,h:0.195},{x:0.390,y:0.940,w:0.220,h:0.195},{x:0.390,y:0.670,w:0.220,h:0.195}]},
  'nebraska-lcr-inox':     {panels:[{x:0.360,y:1.720,w:0.220,h:0.195},{x:0.360,y:1.490,w:0.220,h:0.195},{x:0.360,y:1.260,w:0.220,h:0.195},{x:0.360,y:1.030,w:0.220,h:0.195},{x:0.360,y:0.800,w:0.220,h:0.195}],strips:[{x:0.150,y:0.780,w:0.075,h:1.160}]},
  'pennsylvania-1-inox':   {panels:[{x:0.230,y:1.635,w:0.540,h:0.185},{x:0.230,y:0.360,w:0.215,h:1.235},{x:0.555,y:0.360,w:0.215,h:1.235}]},
  'pennsylvania-2-lr-inox':{panels:[{x:0.375,y:1.580,w:0.175,h:0.170},{x:0.400,y:1.355,w:0.175,h:0.170},{x:0.370,y:1.130,w:0.175,h:0.170},{x:0.400,y:0.905,w:0.175,h:0.170},{x:0.370,y:0.680,w:0.175,h:0.170}]},
  'pennsylvania-3-lr-inox':{panels:[{x:0.230,y:0.200,w:0.385,h:1.710}]},
  'texas-c-inox':          {panels:[{x:0.413,y:0.235,w:0.175,h:1.580}]},
  'texas-lr-inox':         {panels:[{x:0.413,y:0.235,w:0.175,h:1.580}]},
};

function roundedRectShape(w,h,r){
  const s=new THREE.Shape();
  s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);
  s.absarc(w/2-r,-h/2+r,r,-Math.PI/2,0,false);
  s.lineTo(w/2,h/2-r);
  s.absarc(w/2-r,h/2-r,r,0,Math.PI/2,false);
  s.lineTo(-w/2+r,h/2);
  s.absarc(-w/2+r,h/2-r,r,Math.PI/2,Math.PI,false);
  s.lineTo(-w/2,-h/2+r);
  s.absarc(-w/2+r,-h/2+r,r,Math.PI,Math.PI*1.5,false);
  return s;
}

function buildHaustuer(S,view){
  const DW=(S.bMm||1000)/1000,DH=(S.hMm||2100)/1000;
  const scX=DW/1.000,scY=DH/2.100;
  const isAussen=view==='aus';
  const model=MODELLE[S.tuerModell||'florida-lr-inox']||MODELLE['florida-lr-inox'];
  const panels=model.panels||[];
  const modelStrips=model.strips||[];
  const isLinks=(S.oeff1==='dreh-l');

  const g=new THREE.Group();

  // Zarge 3-stufig
  const z1w=0.043,z1d=0.032;
  addBox(g,0,DH-z1w,0,DW,z1w,z1d,frameMat);addBox(g,0,0,0,DW,z1w,z1d,frameMat);
  addBox(g,0,z1w,0,z1w,DH-2*z1w,z1d,frameMat);addBox(g,DW-z1w,z1w,0,z1w,DH-2*z1w,z1d,frameMat);
  const z2off=z1w+0.009,z2w=0.021,z2d=0.018;
  addBox(g,z2off,DH-z2off-z2w,0,DW-2*z2off,z2w,z2d,frameMat);
  addBox(g,z2off,z2off,0,DW-2*z2off,z2w,z2d,frameMat);
  addBox(g,z2off,z2off+z2w,0,z2w,DH-2*(z2off+z2w),z2d,frameMat);
  addBox(g,DW-z2off-z2w,z2off+z2w,0,z2w,DH-2*(z2off+z2w),z2d,frameMat);

  // Türblatt (Pivot-Gruppe für Öffnungsanimation)
  const hingeX=isLinks?DW:0;
  const doorPivot=new THREE.Group();
  doorPivot.position.set(hingeX,DH/2,0);
  const doorInner=new THREE.Group();
  doorInner.position.set(-hingeX,-DH/2,0);
  doorPivot.add(doorInner);
  g.add(doorPivot);

  // Türblatt-Körper (ExtrudeGeometry mit Glasausschnitten)
  {
    const s=new THREE.Shape();
    s.moveTo(0,0);s.lineTo(DW,0);s.lineTo(DW,DH);s.lineTo(0,DH);s.closePath();
    panels.forEach(p=>{
      const px=p.x*scX,py=p.y*scY,pw=p.w*scX,ph=p.h*scY;
      const hole=new THREE.Path();
      hole.moveTo(px,py);hole.lineTo(px+pw,py);hole.lineTo(px+pw,py+ph);hole.lineTo(px,py+ph);hole.closePath();
      s.holes.push(hole);
    });
    const body=new THREE.Mesh(
      new THREE.ExtrudeGeometry(s,{depth:DD,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.002,bevelSegments:2}),
      [frameMat,frameMat]
    );
    body.castShadow=body.receiveShadow=true;doorInner.add(body);
  }

  // Profilnut
  const NUT=0.095*scX;
  const nutMat=new THREE.MeshStandardMaterial({color:frameMat.color.clone().multiplyScalar(0.68),roughness:0.9});
  [{x1:NUT,y1:NUT,x2:DW-NUT,y2:NUT},{x1:NUT,y1:DH-NUT,x2:DW-NUT,y2:DH-NUT},
   {x1:NUT,y1:NUT,x2:NUT,y2:DH-NUT},{x1:DW-NUT,y1:NUT,x2:DW-NUT,y2:DH-NUT}]
  .forEach(({x1,y1,x2,y2})=>{
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    const isH=Math.abs(dx)>Math.abs(dy);
    const m=new THREE.Mesh(new THREE.BoxGeometry(isH?len:0.005,isH?0.005:len,0.004),nutMat);
    m.position.set((x1+x2)/2,(y1+y2)/2,DD+0.001);doorInner.add(m);
  });

  // Glas + Glasleiste + Glasrahmen pro Panel
  const GFW=0.040*scX;
  panels.forEach(p=>{
    const px=p.x*scX,py=p.y*scY,pw=p.w*scX,ph=p.h*scY;
    addGlass(doorInner,px,py,pw,ph,DD/2);
    addGlasleiste(doorInner,px,py,pw,ph,DD+0.006);
    const gf=(x,y,w,h)=>addBox(doorInner,x,y,0,w,h,DD+0.010,glFrameMat);
    gf(px-GFW,py-GFW,pw+GFW*2,GFW);gf(px-GFW,py+ph,pw+GFW*2,GFW);
    gf(px-GFW,py,GFW,ph);gf(px+pw,py,GFW,ph);
  });

  // Edelstahl-Strips
  modelStrips.forEach(st=>{
    addBox(doorInner,st.x*scX,st.y*scY,DD,st.w*scX,st.h*scY,0.008,chromeMat);
  });

  // Hardware
  const HX=0.115,LX=0.082,LY=1.110*scY;
  if(isAussen){
    addStoßgriff(doorInner,HX,0.670*scY,1.740*scY,DD);
    const lsGeo=new THREE.ExtrudeGeometry(roundedRectShape(0.024,0.072,0.012),{depth:0.007,bevelEnabled:false});
    const lsPlate=new THREE.Mesh(lsGeo,chromeMat);
    lsPlate.position.set(LX,LY,DD+0.020);doorInner.add(lsPlate);
    const keyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.009,20),chromeMat);
    keyCyl.rotation.x=Math.PI/2;keyCyl.position.set(LX,LY+0.014,DD+0.029);doorInner.add(keyCyl);
  }else{
    addKlinke(doorInner,HX,DH*0.52,DD);
    [0.18,0.50,0.82].forEach(frac=>addBandScharnier(doorInner,DW-HX,DH*frac,DD));
  }

  if(isLinks){g.scale.x=-1;g.position.x=DW;}

  // Animation: Tür schwingt 70° um Scharnierkante
  const openAngle=isLinks?Math.PI/2.5:-Math.PI/2.5;
  _animatables.push({type:'door',pivot:doorPivot,openRot:new THREE.Euler(0,openAngle,0),closedRot:new THREE.Euler(0,0,0)});

  g.position.set(g.position.x-DW/2,-DH/2,0);
  return g;
}

// ════════════════════════════════════════════════════════════
// PRODUKT 3: HEBE-SCHIEBETÜR (HST / Drutex IGLO-HS)
// Öffnungsmechanik: Panel hebt sich 8mm (Dichtung frei), gleitet seitlich
// ════════════════════════════════════════════════════════════
function buildHST(S,view){
  const W=(S.bMm||2400)/1000,H=(S.hMm||2100)/1000;
  const n=(S.hstTeilung==='3-teilig')?3:2;
  const lauf=S.hstLauf||'rechts';
  const HOF=0.075;  // Drutex IGLO-HS: ~75mm sichtbarer Blendrahmen
  const HSF=0.080;  // Schiebeflügelrahmen
  const BR=0.042;

  const sealMat_hst=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.90,metalness:0});
  const g=new THREE.Group();

  // Außenrahmen
  buildFrameExtruded(g,0,0,W,H,HOF,DD,frameMat);

  // Profil-Stufe am Außenrahmen
  const _stepCol=new THREE.Color(frameMat.color).multiplyScalar(0.60);
  const _stepMat=new THREE.MeshStandardMaterial({color:_stepCol,roughness:0.32,metalness:0});
  const STEP=0.018;
  addBox(g,HOF,H-HOF-STEP,DD+0.001,W-2*HOF,STEP,0.003,_stepMat);
  addBox(g,HOF,HOF,        DD+0.001,W-2*HOF,STEP,0.003,_stepMat);
  addBox(g,HOF,HOF+STEP,   DD+0.001,STEP,H-2*HOF-2*STEP,0.003,_stepMat);
  addBox(g,W-HOF-STEP,HOF+STEP,DD+0.001,STEP,H-2*HOF-2*STEP,0.003,_stepMat);

  const panW=(W-2*HOF)/n;

  for(let i=0;i<n;i++){
    const isSchieber=(lauf==='rechts')?(i===0):(i===n-1);
    const px=HOF+i*panW,py=HOF+BR,ph=H-2*HOF-BR;

    if(isSchieber){
      // Schiebeflügel als Pivot-Gruppe (für Slide-Animation)
      const panelGroup=new THREE.Group();
      panelGroup.position.set(0,0,0);
      g.add(panelGroup);

      buildOuterFrame(panelGroup,px,py,panW,ph,HSF,DD,frameMat,OVHG);
      const gx=px+HSF,gy=py+HSF,gw=panW-2*HSF,gh=ph-2*HSF;
      if(gw>0.01&&gh>0.01){
        addGlass(panelGroup,gx,gy,gw,gh,DD*0.60);
        addGlasleiste(panelGroup,gx,gy,gw,gh,DD+OVHG);
      }

      // Stangengriff (Innenansicht)
      if(view==='inn'){
        const gripX=lauf==='rechts'?px+panW-HSF*0.55:px+HSF*0.55;
        const gripY=py+ph*0.38,gripH=ph*0.24;
        addBox(panelGroup,gripX-0.018,gripY,          OVHG+DD+0.014,0.036,0.068,0.015,chromeMat);
        addBox(panelGroup,gripX-0.018,gripY+gripH-0.068,OVHG+DD+0.014,0.036,0.068,0.015,chromeMat);
        const stange=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,gripH-0.052,16),chromeMat);
        stange.position.set(gripX,gripY+gripH/2,OVHG+DD+0.030);
        stange.castShadow=true;panelGroup.add(stange);
      }

      // Schattenfuge an Panel-Übergängen
      if(i>0){
        const _sfMat2=new THREE.MeshStandardMaterial({color:0x050608,roughness:0.99,metalness:0});
        addBox(panelGroup,px-0.005,py,DD+OVHG,0.010,ph,0.004,_sfMat2);
      }

      // Slide-Animation: HST hebt 8mm, gleitet dann seitlich weg
      const slideDir=lauf==='rechts'?1:-1;
      const slideDistance=panW*0.88;
      const openPos=new THREE.Vector3(slideDir*slideDistance,0.008,0.035);
      const closedPos=new THREE.Vector3(0,0,0);
      _animatables.push({type:'hst',pivot:panelGroup,openPos,closedPos});

    }else{
      // Feststehender Flügel
      buildOuterFrame(g,px,py,panW,ph,HSF,DD,frameMat,0);
      const gx=px+HSF,gy=py+HSF,gw=panW-2*HSF,gh=ph-2*HSF;
      if(gw>0.01&&gh>0.01){
        addGlass(g,gx,gy,gw,gh,DD*0.55);
        addGlasleiste(g,gx,gy,gw,gh,DD);
      }
    }
  }

  // Bodenschwelle (3-teilig — realistisch)
  addBox(g,HOF,HOF,0,          W-2*HOF,0.040,0.022,chromeMat);
  addBox(g,HOF+0.010,HOF+0.012,0.018,W-2*HOF-0.020,0.016,0.008,grooveMat);
  addBox(g,HOF,HOF+0.036,0,    W-2*HOF,0.006,0.012,sealMat_hst);

  g.position.set(-W/2,-H/2,0);
  return g;
}

// ════════════════════════════════════════════════════════════
// SZENE INITIALISIEREN
// ════════════════════════════════════════════════════════════
function initScene(container){
  if(renderer){cancelAnimationFrame(_animFrame);renderer.dispose();}
  container.innerHTML='';

  const W=container.clientWidth||440,H=container.clientHeight||480;

  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});  // alpha für Floating
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  renderer.setClearColor(0xffffff,1);

  const cvs=renderer.domElement;
  cvs.style.cssText='width:100%;height:100%;display:block;border-radius:inherit;background:#ffffff;';
  container.appendChild(cvs);

  scene=new THREE.Scene();
  scene.background=new THREE.Color(0xffffff);  // Reines Weiß — Fenster "schwimmt"

  camera=new THREE.PerspectiveCamera(22,W/H,0.1,50);
  camera.position.set(0,0,6);

  controls=new OrbitControls(camera,cvs);
  controls.enablePan=false;
  controls.minDistance=2;controls.maxDistance=14;
  controls.maxPolarAngle=Math.PI*0.55;controls.minPolarAngle=Math.PI*0.45;
  controls.minAzimuthAngle=-0.45;controls.maxAzimuthAngle=0.45;
  controls.update();

  // PMREM Environment
  const pmremGen=new THREE.PMREMGenerator(renderer);
  pmremGen.compileEquirectangularShader();
  scene.environment=pmremGen.fromScene(new RoomEnvironment(renderer),0.04).texture;
  pmremGen.dispose();

  // ── BELEUCHTUNG — Produktfoto-Studio-Setup ──────────────
  // HemisphereLight: weicher Himmel von oben
  scene.add(new THREE.HemisphereLight(0xf8f6f2,0x8090a0,0.50));

  // Key-Light: oben-links, harter Schatten für Profiltiefe
  const key=new THREE.DirectionalLight(0xfffdf8,1.40);
  key.position.set(-4,8,5);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.near=1;key.shadow.camera.far=18;
  key.shadow.camera.left=-4;key.shadow.camera.right=4;
  key.shadow.camera.top=6;key.shadow.camera.bottom=-6;
  key.shadow.bias=-0.001;key.shadow.normalBias=0.02;
  scene.add(key);

  // Fill-Light: rechts, kühl (kompensiert Schatten ohne auszulöschen)
  const fill=new THREE.DirectionalLight(0xd8e8f4,0.45);
  fill.position.set(4,2,4);scene.add(fill);

  // Bounce-Light: von unten (simuliert Boden-Reflexion im Studio)
  const bounce=new THREE.DirectionalLight(0xfff8f0,0.20);
  bounce.position.set(0,-4,3);scene.add(bounce);

  // Rim-Light: von hinten-oben für Profilkanten-Highlight
  const rim=new THREE.DirectionalLight(0xffffff,0.25);
  rim.position.set(0,5,-4);scene.add(rim);

  // Subtiler Bodenschatten (ShadowMaterial, unsichtbare Ebene)
  const gnd=new THREE.Mesh(
    new THREE.PlaneGeometry(14,14),
    new THREE.ShadowMaterial({opacity:0.12})
  );
  gnd.rotation.x=-Math.PI/2;gnd.position.set(0.04,-1.8,0);gnd.receiveShadow=true;
  scene.add(gnd);

  productGroup=new THREE.Group();
  scene.add(productGroup);

  // Render-Loop mit Animations-Lerp
  function loop(){
    _animFrame=requestAnimationFrame(loop);

    // Sanftes Lerp für Öffnungsfortschritt
    if(Math.abs(_openTarget-_openProgress)>0.0005){
      _openProgress+=(_openTarget-_openProgress)*0.06;
      _applyAnimation(_openProgress);
    }

    controls.update();
    renderer.render(scene,camera);
  }
  loop();

  const ro=new ResizeObserver(()=>{
    const pw=container.clientWidth,ph=container.clientHeight;
    if(pw>0&&ph>0){renderer.setSize(pw,ph);camera.aspect=pw/ph;camera.updateProjectionMatrix();}
  });
  ro.observe(container);

  _initDone=true;
}

// ════════════════════════════════════════════════════════════
// ANIMATIONS-ENGINE
// ════════════════════════════════════════════════════════════
function _applyAnimation(progress){
  _animatables.forEach(a=>{
    if(a.type==='sash'||a.type==='door'){
      // Rotation (Euler-Interpolation)
      a.pivot.rotation.x=a.closedRot.x+(a.openRot.x-a.closedRot.x)*progress;
      a.pivot.rotation.y=a.closedRot.y+(a.openRot.y-a.closedRot.y)*progress;
      a.pivot.rotation.z=a.closedRot.z+(a.openRot.z-a.closedRot.z)*progress;
    }else if(a.type==='hst'){
      // HST: Phase 1 (0-0.2): Heben, Phase 2 (0.2-1.0): Gleiten
      const liftPhase=Math.min(progress/0.20,1.0);
      const slidePhase=Math.max((progress-0.20)/0.80,0.0);
      a.pivot.position.x=a.closedPos.x+(a.openPos.x-a.closedPos.x)*slidePhase;
      a.pivot.position.y=a.closedPos.y+(a.openPos.y-a.closedPos.y)*liftPhase;
      a.pivot.position.z=a.closedPos.z+(a.openPos.z-a.closedPos.z)*liftPhase;
    }
  });
}

// ════════════════════════════════════════════════════════════
// KAMERA AUF PRODUKT ANPASSEN
// ════════════════════════════════════════════════════════════
function fitCamera(S){
  const LB=0.060;
  const W=(S.bMm||1000)/1000+2*LB;
  const H=(S.hMm||(S.prod==='haustuere'?2100:1200))/1000+2*LB;
  const fovRad=22*Math.PI/180;
  const ar=camera.aspect;
  const distH=(H*0.50)/Math.tan(fovRad/2);
  const distW=(W*0.50)/(ar*Math.tan(fovRad/2));
  const dist=Math.max(distH,distW,2.5);
  camera.position.set(0,0,dist);
  controls.target.set(0,0,0);
  controls.minDistance=dist*0.40;
  controls.maxDistance=dist*2.8;
  controls.update();
}

// ════════════════════════════════════════════════════════════
// SZENE AUFBAUEN
// ════════════════════════════════════════════════════════════
function rebuildScene(S,view){
  while(productGroup.children.length>0){
    const c=productGroup.children[0];
    c.traverse(o=>{if(o.geometry)o.geometry.dispose();});
    productGroup.remove(c);
  }
  _animatables=[];
  _openProgress=0;_openTarget=0;
  if(!S||!S.prod)return;

  _currentProd=S.prod;

  const isAussen=view==='aus';
  applyMaterial(frameMat,(isAussen?S.fa:S.fi)||'weiss');

  const sealHex=window._kP?.fd?.[S.fd]?.hex||'#1a1a1a';
  sealMat.color.set(sealHex);sealMat.needsUpdate=true;

  // Handle-Material-Farbe mitaktualisieren
  applyGlass(S.glasdekor||'klar');

  let group=null;
  if(S.prod==='kunststoff'||S.prod==='balkontuer')group=buildFenster(S,view);
  else if(S.prod==='haustuere')group=buildHaustuer(S,view);
  else if(S.prod==='hst')group=buildHST(S,view);
  if(group)productGroup.add(group);

  fitCamera(S);

  // Öffnen-Button Sichtbarkeit + Label
  const btn=document.getElementById('oeffnen-btn');
  if(btn){
    const labels={
      'kunststoff':'Fenster öffnen','balkontuer':'Balkontür öffnen',
      'haustuere':'Haustür öffnen','hst':'Schiebetür öffnen'
    };
    btn.style.display='flex';
    if(!window.prevOpen){
      const label=labels[S.prod]||'Öffnen';
      btn.innerHTML=`<span style="display:inline-flex;align-items:center;gap:8px"><i class="ms" style="font-size:16px">play_arrow</i> ${label}</span>`;
      btn.classList.remove('active');
    }
  }
}

// ════════════════════════════════════════════════════════════
// ÖFFENTLICHE API
// ════════════════════════════════════════════════════════════
window.renderSVGPrev=function(containerId,view){
  const container=document.getElementById(containerId);
  if(!container)return;
  if(_containerId!==containerId||!_initDone){
    initScene(container);
    _containerId=containerId;
  }
  const S=window._kS;
  if(!S||!S.prod)return;
  rebuildScene(S,view||'inn');
};

// Öffnungsanimation — wird von toggleOpen() in konfigurator.html aufgerufen
window.openProduct3D=function(open){
  _openTarget=open?1:0;
};

if(typeof window.drawPrev==='function'&&window._kS?.prod){
  window.drawPrev();
}
