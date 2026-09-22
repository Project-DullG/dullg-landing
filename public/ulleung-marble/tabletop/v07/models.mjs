import * as THREE from 'three';
import {roundedBox,matte,dieRotation} from '../models.mjs?v=20260923j';
export {dieRotation};
export const dieFaceRotation=v=>({1:[0,0,0],2:[Math.PI/2,0,0],3:[0,-Math.PI/2,0],4:[0,Math.PI/2,0],5:[-Math.PI/2,0,0],6:[0,Math.PI,0]}[v]||[0,0,0]);
export const COLORS=['#367b83','#d39445','#9a636c','#7d91a2','#536f9d','#b47751','#72864e','#888778'];
export const MOTIFS=['강치','호박','오징어','괭이갈매기','등대','여객선','명이 잎','코끼리바위'];
// One cut contour per piece: the same path is used on cards, on the box and for the 3D extrusion.
export const SHAPES=[
 [['M',-.43,0],['L',.43,0],['Q',.45,.10,.23,.18],['Q',.38,.44,.24,.68],['L',.44,.72],['Q',.53,.78,.46,.85],['L',.38,.89],['Q',.34,1.10,.13,1.06],['Q',-.06,1.03,-.08,.77],['Q',-.14,.68,-.20,.56],['Q',-.35,.42,-.43,.26],['Q',-.24,.27,-.15,.36],['Q',-.20,.12,-.43,0],['Z']],
 [['M',-.35,0],['L',.35,0],['Q',.58,.10,.54,.49],['Q',.50,.85,.18,.80],['L',.10,.85],['L',.15,1.00],['Q',.08,1.09,-.04,1.00],['L',-.06,.82],['Q',-.53,.97,-.55,.50],['Q',-.57,.13,-.35,0],['Z']],
 [['M',-.38,0],['L',.38,0],['L',.32,.23],['L',.19,.25],['L',.24,.43],['L',.40,.44],['L',.23,.75],['Q',.15,.93,0,1.10],['Q',-.17,.92,-.23,.75],['L',-.40,.44],['L',-.24,.43],['L',-.19,.25],['L',-.32,.23],['Z']],
 [['M',-.40,0],['L',.39,0],['L',.24,.20],['Q',.34,.33,.40,.56],['L',.56,.60],['L',.43,.70],['Q',.39,.89,.18,.88],['Q',-.02,.88,-.06,.58],['Q',-.27,.55,-.42,.32],['L',-.54,.40],['L',-.49,.17],['Q',-.38,.12,-.40,0],['Z']],
 [['M',-.37,0],['L',.37,0],['L',.27,.12],['L',.17,.76],['L',.28,.76],['L',.28,.85],['L',.20,.87],['L',.20,1.02],['L',0,1.13],['L',-.20,1.02],['L',-.20,.87],['L',-.28,.85],['L',-.28,.76],['L',-.17,.76],['L',-.27,.12],['Z']],
 [['M',-.30,0],['L',.30,0],['L',.53,.43],['L',.35,.53],['L',.35,.72],['L',.24,.72],['L',.24,.90],['L',.07,.90],['L',.07,1.05],['L',-.07,1.05],['L',-.07,.90],['L',-.24,.90],['L',-.24,.72],['L',-.35,.72],['L',-.35,.53],['L',-.53,.43],['Z']],
 [['M',-.25,0],['L',.27,0],['L',.11,.23],['Q',.61,.34,.40,1.06],['Q',-.02,.98,-.02,.50],['Q',-.22,1.01,-.48,.84],['Q',-.54,.32,-.11,.24],['Z']],
 [['M',-.47,0],['L',-.19,0],['L',-.17,.26],['Q',-.09,.61,.13,.44],['Q',.26,.33,.24,0],['L',.49,0],['L',.42,.62],['Q',.18,.99,-.12,.83],['Q',-.47,.82,-.49,.41],['Z']]
];
export function pathString(i){return SHAPES[i].map(a=>a.join(' ')).join(' ');}
// The same pad-print artwork is used on both wooden faces and the printable cutout.
const DETAILS=[
 {lines:[[[.19,.70],[.09,.55],[.14,.39],[.27,.33]],[[.26,.80],[.34,.78]],[[.29,.76],[.37,.75]]],eyes:[[.29,.88,.024]]},
 {lines:[[[-.25,.16],[-.34,.40],[-.29,.66]],[[-.07,.12],[-.13,.39],[-.07,.71]],[[.12,.13],[.20,.40],[.12,.70]],[[.30,.17],[.39,.41],[.30,.66]]]},
 {lines:[[[-.22,.14],[-.15,.27],[-.17,.37]],[[0,.10],[.04,.27],[0,.37]],[[.22,.14],[.16,.26],[.18,.37]],[[-.13,.73],[0,.94],[.13,.73]]],eyes:[[-.085,.54,.028],[.085,.54,.028]]},
 {lines:[[[-.32,.28],[-.12,.43],[.17,.47]],[[-.27,.23],[-.04,.29],[.17,.47]],[[.39,.63],[.46,.63]]],eyes:[[.27,.75,.021]]},
 {lines:[[[-.20,.25],[.20,.25]],[[-.17,.48],[.17,.48]],[[-.20,.82],[.20,.82]],[[-.09,.9],[-.09,.98]],[[.09,.9],[.09,.98]]]},
 {lines:[[[-.33,.38],[0,.25],[.33,.38]],[[-.22,.60],[.22,.60]],[[-.19,.78],[.19,.78]],[[0,.13],[0,.40]]]},
 {lines:[[[.07,.28],[.16,.57],[.32,.90]],[[-.05,.29],[-.23,.55],[-.39,.73]],[[.15,.56],[.32,.59]],[[.19,.67],[.14,.82]],[[-.2,.52],[-.4,.53]]]},
 {lines:[[[-.36,.22],[-.36,.53],[-.21,.68],[-.04,.69]],[[.09,.67],[.30,.49],[.36,.22]]]}
];
function shapeFor(i){const s=new THREE.Shape();for(const[c,...v]of SHAPES[i])s[{M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',C:'bezierCurveTo',Z:'closePath'}[c]](...v);return s;}
const detailSvg=i=>{const d=DETAILS[i];return (d.lines||[]).map(p=>`<path d="M${p.map(v=>v.join(' ')).join(' L')}" fill="none" stroke="#fff5df" stroke-width=".018" stroke-linecap="round" stroke-linejoin="round"/>`).join('')+(d.eyes||[]).map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#183d45"/>`).join('');};
export function motifSVG(i,color=COLORS[i]){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.65 -1.22 1.3 1.3"><g transform="scale(1,-1)"><path d="${pathString(i)}" fill="${color}"/>${detailSvg(i)}</g></svg>`;}
export function motifPrintSVG(i,heightMm=30){const b=new THREE.Box2().setFromPoints(shapeFor(i).getPoints(160)),w=b.max.x-b.min.x,h=b.max.y-b.min.y,widthMm=Math.min(24,heightMm*w/h);return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" style="width:${widthMm}mm;height:${heightMm}mm" viewBox="${b.min.x} ${-b.max.y} ${w} ${h}" preserveAspectRatio="none" aria-label="${MOTIFS[i]} 높이 ${heightMm}mm"><g transform="scale(1,-1)"><path d="${pathString(i)}" fill="${COLORS[i]}"/>${detailSvg(i)}</g></svg>`;}
export function createMeeple(i){
 const g=new THREE.ExtrudeGeometry(shapeFor(i),{depth:.235,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:24});g.translate(0,.023,-.1175);
 const paint=new THREE.MeshStandardMaterial({color:COLORS[i],roughness:.77,metalness:0}),edge=new THREE.MeshStandardMaterial({color:'#bd986a',roughness:.91});
 const mesh=new THREE.Mesh(g,[paint,edge]);mesh.castShadow=true;mesh.receiveShadow=true;const group=new THREE.Group();group.add(mesh);group.name=`meeple-${i}-${MOTIFS[i]}`;
 for(const side of [1,-1]){
  const print=new THREE.Group();
  for(const points of DETAILS[i].lines||[]){const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y+.023,.138*side))),20,.009,5,false);print.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#fff4dd',roughness:.88})));}
  for(const[x,y,r]of DETAILS[i].eyes||[]){const dot=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshStandardMaterial({color:'#203d43',roughness:.9}));dot.position.set(x,y+.023,.139*side);dot.rotation.y=side<0?Math.PI:0;print.add(dot);}group.add(print);
 }
 const measured=new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());group.scale.set(Math.min(1,measured.y*.8/measured.x),1,measured.y*(8/30)/measured.z);group.userData={motif:i,heightMm:30,maxWidthMm:24,depthMm:8,finish:'painted wood, two-sided pad print'};return group;
}
export function createThemedDie(i,size=.75){
 const group=new THREE.Group();group.name=i?'호박 주사위':'바다 주사위';const color=i?'#d49942':'#285a69';group.add(roundedBox(size,size,size,.06,matte(color)));
 const pips=matte('#fff5df');const s=size*.501,o=size*.2;
 for(const face of [{n:3,axis:'x',sign:1},{n:4,axis:'x',sign:-1},{n:2,axis:'y',sign:1},{n:5,axis:'y',sign:-1},{n:1,axis:'z',sign:1},{n:6,axis:'z',sign:-1}]){
  const coords=({1:[[0,0]],2:[[-o,-o],[o,o]],3:[[-o,-o],[0,0],[o,o]],4:[[-o,-o],[o,-o],[-o,o],[o,o]],5:[[-o,-o],[o,-o],[0,0],[-o,o],[o,o]],6:[[-o,-o],[o,-o],[-o,0],[o,0],[-o,o],[o,o]]})[face.n];
  for(const[a,b]of coords){let geo;if(i&&face.n===1){const pumpkin=new THREE.Shape();for(const[c,...v]of SHAPES[1])pumpkin[{M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',Z:'closePath'}[c]](...v);geo=new THREE.ShapeGeometry(pumpkin,12);geo.translate(0,-.5,0);geo.scale(size*.14,size*.14,1);}else geo=new THREE.CircleGeometry(size*.065,20);const pip=new THREE.Mesh(geo,pips);
   if(face.axis==='x'){pip.position.set(face.sign*s,a,b);pip.rotation.y=face.sign*Math.PI/2;}
   if(face.axis==='y'){pip.position.set(a,face.sign*s,b);pip.rotation.x=face.sign*-Math.PI/2;}
   if(face.axis==='z'){pip.position.set(a,b,face.sign*s);pip.rotation.y=face.sign<0?Math.PI:0;}group.add(pip);
  }
 }
 group.userData={faces:[1,2,3,4,5,6],sizeMm:20};return group;
}

export function createBudgetMarker(i){
 const g=new THREE.Group();g.name=`budget-marker-${i}`;g.add(roundedBox(.42,.42,.42,.035,new THREE.MeshStandardMaterial({color:COLORS[i],roughness:.77})));
 // Large, flat silhouettes remain recognizable on an 8 mm cube; no tiny text.
 const symbol=new THREE.ShapeGeometry(shapeFor(i),20);symbol.computeBoundingBox();const b=symbol.boundingBox,scale=.265/Math.max(b.max.x-b.min.x,b.max.y-b.min.y);symbol.translate(-(b.min.x+b.max.x)/2,-(b.min.y+b.max.y)/2,0);symbol.scale(scale,scale,1);
 const ink=new THREE.MeshStandardMaterial({color:'#fff6df',roughness:.9});
 for(const[r,pos]of [[[0,0,0],[0,0,.212]],[[0,Math.PI,0],[0,0,-.212]],[[-Math.PI/2,0,0],[0,.212,0]],[[Math.PI/2,0,0],[0,-.212,0]],[[0,Math.PI/2,0],[.212,0,0]],[[0,-Math.PI/2,0],[-.212,0,0]]]){const m=new THREE.Mesh(symbol,ink);m.rotation.set(...r);m.position.set(...pos);g.add(m);}g.userData={player:i,motif:MOTIFS[i],widthMm:8,heightMm:8,depthMm:8};return g;
}
