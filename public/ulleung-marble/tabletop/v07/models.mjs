import * as THREE from 'three';
import {roundedBox,matte,dieRotation} from '../models.mjs';
export {dieRotation};
export const dieFaceRotation=v=>({1:[0,0,0],2:[Math.PI/2,0,0],3:[0,-Math.PI/2,0],4:[0,Math.PI/2,0],5:[-Math.PI/2,0,0],6:[0,Math.PI,0]}[v]||[0,0,0]);
export const COLORS=['#367b83','#d39445','#9a636c','#7d91a2','#536f9d','#b47751','#72864e','#888778'];
export const MOTIFS=['강치','호박','오징어','괭이갈매기','등대','여객선','명이 잎','코끼리바위'];
// One cut contour per piece: the same path is used on cards, on the box and for the 3D extrusion.
export const SHAPES=[
 [['M',-.43,0],['L',.43,0],['Q',.50,.13,.24,.24],['Q',.47,.48,.25,.70],['Q',.48,.71,.44,.84],['Q',.40,1.08,.15,1.05],['Q',-.06,1.00,-.10,.72],['Q',-.22,.68,-.31,.50],['Q',-.45,.44,-.47,.27],['Q',-.20,.30,-.19,.25],['Q',-.35,.14,-.43,0],['Z']],
 [['M',-.35,0],['L',.35,0],['Q',.58,.10,.54,.49],['Q',.50,.85,.18,.80],['L',.10,.85],['L',.15,1.00],['Q',.08,1.09,-.04,1.00],['L',-.06,.82],['Q',-.53,.97,-.55,.50],['Q',-.57,.13,-.35,0],['Z']],
 [['M',-.38,0],['L',.38,0],['L',.32,.23],['L',.19,.25],['L',.24,.43],['L',.40,.44],['L',.23,.75],['Q',.15,.93,0,1.10],['Q',-.17,.92,-.23,.75],['L',-.40,.44],['L',-.24,.43],['L',-.19,.25],['L',-.32,.23],['Z']],
 [['M',-.40,0],['L',.39,0],['L',.24,.20],['Q',.34,.33,.40,.56],['L',.56,.60],['L',.43,.70],['Q',.39,.89,.18,.88],['Q',-.02,.88,-.06,.58],['Q',-.27,.55,-.42,.32],['L',-.54,.40],['L',-.49,.17],['Q',-.38,.12,-.40,0],['Z']],
 [['M',-.37,0],['L',.37,0],['L',.27,.12],['L',.17,.76],['L',.28,.76],['L',.28,.85],['L',.20,.87],['L',.20,1.02],['L',0,1.13],['L',-.20,1.02],['L',-.20,.87],['L',-.28,.85],['L',-.28,.76],['L',-.17,.76],['L',-.27,.12],['Z']],
 [['M',-.30,0],['L',.30,0],['L',.53,.43],['L',.35,.53],['L',.35,.72],['L',.24,.72],['L',.24,.90],['L',.07,.90],['L',.07,1.05],['L',-.07,1.05],['L',-.07,.90],['L',-.24,.90],['L',-.24,.72],['L',-.35,.72],['L',-.35,.53],['L',-.53,.43],['Z']],
 [['M',-.25,0],['L',.27,0],['L',.11,.23],['Q',.61,.34,.40,1.06],['Q',-.02,.98,-.02,.50],['Q',-.22,1.01,-.48,.84],['Q',-.54,.32,-.11,.24],['Z']],
 [['M',-.47,0],['L',-.19,0],['L',-.17,.26],['Q',-.09,.61,.13,.44],['Q',.26,.33,.24,0],['L',.49,0],['L',.42,.62],['Q',.18,.99,-.12,.83],['Q',-.47,.82,-.49,.41],['Z']]
];
export function pathString(i){return SHAPES[i].map(a=>a.join(' ')).join(' ');}
export function motifSVG(i,color=COLORS[i]){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.65 -1.22 1.3 1.3"><g transform="scale(1,-1)"><path d="${pathString(i)}" fill="${color}"/></g></svg>`;}
// Print cutouts use the contour bounds, not the padded preview viewBox.
export function motifPrintSVG(i,heightMm=30){
 const shape=new THREE.Shape();
 for(const[c,...v]of SHAPES[i])shape[{M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',C:'bezierCurveTo',Z:'closePath'}[c]](...v);
 const b=new THREE.Box2().setFromPoints(shape.getPoints(160)),w=b.max.x-b.min.x,h=b.max.y-b.min.y,widthMm=Math.min(24,heightMm*w/h);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" style="width:${widthMm}mm;height:${heightMm}mm" viewBox="${b.min.x} ${-b.max.y} ${w} ${h}" preserveAspectRatio="none" aria-label="${MOTIFS[i]} 높이 ${heightMm}mm"><path transform="scale(1,-1)" d="${pathString(i)}" fill="${COLORS[i]}"/></svg>`;
}
export function createMeeple(i){
 const shape=new THREE.Shape();for(const[c,...v]of SHAPES[i])({M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',C:'bezierCurveTo',Z:'closePath'}[c]&&shape[{M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',C:'bezierCurveTo',Z:'closePath'}[c]](...v));
 const g=new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:16});g.translate(0,.025,-.125);
 const mesh=new THREE.Mesh(g,matte(COLORS[i]));mesh.castShadow=true;mesh.receiveShadow=true;const group=new THREE.Group();group.add(mesh);group.name=`meeple-${i}-${MOTIFS[i]}`;
 const line=(points)=>{const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y,.154))),24,.009,6,false);const m=new THREE.Mesh(geo,matte('#f8ecd4'));group.add(m);};
 const dot=(x,y,r=.018)=>{const eye=new THREE.Mesh(new THREE.CircleGeometry(r,16),matte('#233e46'));eye.position.set(x,y,.16);group.add(eye);};
 if(i===0){dot(.29,.87);line([[.21,.62],[.12,.48],[.28,.34]]);}
 if(i===1){line([[-.06,.14],[-.16,.4],[-.09,.70]]);line([[.10,.14],[.20,.42],[.11,.71]]);}
 if(i===2){dot(-.075,.53,.025);dot(.075,.53,.025);}
 if(i===3){dot(.28,.74);line([[-.28,.28],[-.12,.43],[.12,.47]]);}
 if(i===4){line([[-.20,.3],[.20,.3]]);line([[-.15,.60],[.15,.60]]);}
 if(i===5){line([[-.23,.61],[.23,.61]]);line([[-.23,.78],[.23,.78]]);line([[0,.13],[0,.46]]);}
 if(i===6){line([[.07,.28],[.16,.57],[.32,.9]]);line([[-.05,.3],[-.23,.56],[-.38,.72]]);}
 if(i===7)line([[-.35,.38],[-.27,.65],[-.09,.69]]);
 const measured=new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());group.scale.set(Math.min(1,measured.y*.8/measured.x),1,measured.y*(8/30)/measured.z);group.userData={motif:i,heightMm:30,maxWidthMm:24,depthMm:8};return group;
}
export function createThemedDie(i,size=.75){
 const group=new THREE.Group();group.name=i?'호박 주사위':'바다 주사위';const color=i?'#d49942':'#285a69';group.add(roundedBox(size,size,size,.06,matte(color)));
 const pips=matte('#fff5df');const s=size*.501,o=size*.2;
 for(const face of [{n:3,axis:'x',sign:1},{n:4,axis:'x',sign:-1},{n:2,axis:'y',sign:1},{n:5,axis:'y',sign:-1},{n:1,axis:'z',sign:1},{n:6,axis:'z',sign:-1}]){
  const coords=({1:[[0,0]],2:[[-o,-o],[o,o]],3:[[-o,-o],[0,0],[o,o]],4:[[-o,-o],[o,-o],[-o,o],[o,o]],5:[[-o,-o],[o,-o],[0,0],[-o,o],[o,o]],6:[[-o,-o],[o,-o],[-o,0],[o,0],[-o,o],[o,o]]})[face.n];
  for(const[a,b]of coords){let geo;if(i){const pumpkin=new THREE.Shape();for(const[c,...v]of SHAPES[1])pumpkin[{M:'moveTo',L:'lineTo',Q:'quadraticCurveTo',Z:'closePath'}[c]](...v);geo=new THREE.ShapeGeometry(pumpkin,12);geo.translate(0,-.5,0);geo.scale(size*.14,size*.14,1);}else geo=new THREE.CircleGeometry(size*.065,20);const pip=new THREE.Mesh(geo,pips);
   if(face.axis==='x'){pip.position.set(face.sign*s,a,b);pip.rotation.y=face.sign*Math.PI/2;}
   if(face.axis==='y'){pip.position.set(a,face.sign*s,b);pip.rotation.x=face.sign*-Math.PI/2;}
   if(face.axis==='z'){pip.position.set(a,b,face.sign*s);pip.rotation.y=face.sign<0?Math.PI:0;}group.add(pip);
  }
 }
 group.userData={faces:[1,2,3,4,5,6],sizeMm:20};return group;
}

export function createBudgetMarker(i){const g=new THREE.Group();g.name=`budget-marker-${i}`;const cube=roundedBox(.42,.42,.42,.025,matte(COLORS[i]));g.add(cube);const dot=new THREE.Mesh(new THREE.CircleGeometry(.065,20),matte('#fff4df'));dot.position.z=.215;g.add(dot);g.userData={player:i,widthMm:8,heightMm:8,depthMm:8};return g;}
