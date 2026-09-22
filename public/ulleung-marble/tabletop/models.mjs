import * as THREE from 'three';
export const PALETTE={navy:0x203f53,teal:0x3c7c80,forest:0x4e6b50,ivory:0xf4ebd8,sky:0xa1c3cd,coral:0xbf775b};
export const matte=(color)=>new THREE.MeshStandardMaterial({color,roughness:.87,metalness:0});
const mesh=(g,m)=>{const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;return o;};
export function roundedBox(w,h,d,r=.08,material=matte(PALETTE.ivory)){
  w-=2*r;h-=2*r;
  const s=new THREE.Shape();const x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});g.translate(0,0,-(d-2*r)/2);g.computeVertexNormals();return mesh(g,material);
}
export function createCameraMeeple(){
  const group=new THREE.Group();group.name='camera-meeple-30mm';
  const navy=matte(PALETTE.navy),ivory=matte(PALETTE.ivory);
  const base=mesh(new THREE.CylinderGeometry(.37,.39,.12,48),navy);base.position.y=.06;group.add(base);
  const body=roundedBox(.67,.49,.27,.055,navy);body.position.y=.56;group.add(body);
  const foot=mesh(new THREE.CylinderGeometry(.15,.22,.21,32),navy);foot.position.y=.23;group.add(foot);
  const lens=mesh(new THREE.CylinderGeometry(.178,.178,.10,40),ivory);lens.rotation.x=Math.PI/2;lens.position.set(.025,.56,.208);group.add(lens);
  const inset=mesh(new THREE.CylinderGeometry(.127,.127,.105,40),navy);inset.rotation.x=Math.PI/2;inset.position.set(.025,.56,.219);group.add(inset);
  const finder=roundedBox(.23,.12,.21,.025,ivory);finder.position.set(.08,.858,0);group.add(finder);
  const shutter=mesh(new THREE.CylinderGeometry(.045,.045,.05,20),ivory);shutter.position.set(-.21,.83,0);group.add(shutter);
  const glint=mesh(new THREE.SphereGeometry(.028,12,8),ivory);glint.position.set(.06,.607,.28);group.add(glint);
  group.userData={assetId:'MEEPLE-01',heightMm:30,colors:2};return group;
}
export function createDie(size=.72){
  const group=new THREE.Group();group.name='custom-die-1-1-2-2-3-3';
  const body=roundedBox(size,size,size,.045,matte(PALETTE.ivory));group.add(body);
  const pipMat=matte(PALETTE.navy),r=size*.047,offset=size*.185,surface=size*.505;
  const faces=[{n:1,axis:'x',sign:1},{n:1,axis:'x',sign:-1},{n:2,axis:'y',sign:1},{n:2,axis:'y',sign:-1},{n:3,axis:'z',sign:1},{n:3,axis:'z',sign:-1}];
  for(const face of faces){
    const coords=face.n===1?[[0,0]]:face.n===2?[[-offset,-offset],[offset,offset]]:[[-offset,-offset],[0,0],[offset,offset]];
    for(const[a,b]of coords){const pip=mesh(new THREE.CircleGeometry(r,24),pipMat);pip.material.side=THREE.DoubleSide;
      if(face.axis==='z'){pip.position.set(a,b,face.sign*surface);pip.rotation.y=face.sign<0?Math.PI:0;}
      if(face.axis==='y'){pip.position.set(a,face.sign*surface,b);pip.rotation.x=face.sign>0?-Math.PI/2:Math.PI/2;}
      if(face.axis==='x'){pip.position.set(face.sign*surface,a,b);pip.rotation.y=face.sign>0?Math.PI/2:-Math.PI/2;}
      group.add(pip);
    }
  }
  group.userData={assetId:'DICE-01',sizeMm:20,faces:[1,1,2,2,3,3]};return group;
}
export function dieRotation(value){return value===1?new THREE.Euler(0,0,Math.PI/2):value===2?new THREE.Euler(0,0,0):new THREE.Euler(-Math.PI/2,0,0);}
