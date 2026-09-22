import * as THREE from 'three';
import {createMeeple,createBudgetMarker,createThemedDie} from './models.mjs';
import {createBox} from './box-model.mjs';
import {prepareBoxTextures} from './box-textures.mjs';

// Render the same physical models used at the game table, once per gallery image.
export async function showComponents(){
 const hosts=[...document.querySelectorAll('[data-component-model]')];
 if(!hosts.length)return;
 await prepareBoxTextures();
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1000,620);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfffcf0,0x548899,2.7));
 const light=new THREE.DirectionalLight(0xfff6dc,3);light.position.set(-3,6,8);scene.add(light);
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,100);
 for(const host of hosts){
  const kind=host.dataset.componentModel,group=new THREE.Group();
  if(kind==='meeples'){
   for(let i=0;i<8;i++){const p=createMeeple(i);p.position.set((i%4-1.5)*1.65,Math.floor(i/4)*-1.55,0);p.rotation.set(.08,-.30,0);group.add(p);}
  }else if(kind==='dice'){
   for(let i=0;i<2;i++){const p=createThemedDie(i);p.rotation.set(.45,-.5,.1);p.position.set(-.8+i*1.6,.3,0);group.add(p);}
   for(let i=0;i<8;i++){const p=createBudgetMarker(i);p.scale.multiplyScalar((8/20)*.75/.42);p.rotation.set(.35,-.45,.08);p.position.set((i-3.5)*.55,-.9,0);group.add(p);}
  }else if(kind==='accessories'){
   const ship=createMeeple(5);ship.scale.multiplyScalar(.49);ship.position.set(-1.6,-.20,0);ship.rotation.y=-.3;group.add(ship);
   const pencil=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,3.9,6),new THREE.MeshStandardMaterial({color:'#d6a057',roughness:.9}));pencil.rotation.z=-1.28;pencil.position.set(.9,.1,0);group.add(pencil);
   const tip=new THREE.Mesh(new THREE.ConeGeometry(.066,.3,6),new THREE.MeshStandardMaterial({color:'#dcc197'}));tip.rotation.z=-1.28;tip.position.set(2.93,.71,0);group.add(tip);
  }else{
   group.add(createBox(2));group.rotation.set(.98,-.12,-.08);
  }
  scene.add(group);const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  const extent=Math.max(size.y*.62,size.x*.62/(1000/620));camera.left=-extent*1000/620;camera.right=extent*1000/620;camera.top=extent;camera.bottom=-extent;camera.position.set(center.x,center.y,10);camera.lookAt(center);camera.updateProjectionMatrix();renderer.render(scene,camera);
  const img=new Image();img.alt=host.getAttribute('aria-label');img.src=renderer.domElement.toDataURL('image/webp',.92);host.replaceChildren(img);host.removeAttribute('role');host.removeAttribute('aria-label');scene.remove(group);
  group.traverse(o=>{o.geometry?.dispose();[].concat(o.material||[]).forEach(m=>{if(!m.map?.userData.shared)m.map?.dispose();m.dispose();});});
 }
 renderer.dispose();renderer.forceContextLoss();
}
