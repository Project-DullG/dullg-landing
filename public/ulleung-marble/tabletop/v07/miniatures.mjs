import * as THREE from 'three';
import {createBox} from './box-model.mjs';
import {createMeeple,createThemedDie,createBudgetMarker,dieFaceRotation} from './models.mjs';
const cache=new Map();let renderer;
export function modelFor(type,i){
 if(type==='accessory'){
  if(!i){const boat=createMeeple(5);boat.scale.multiplyScalar(22/30);return boat;}
  const pencil=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,3.6,6),new THREE.MeshStandardMaterial({color:'#d6a057',roughness:.9}));pencil.add(body);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.065,.3,6),new THREE.MeshStandardMaterial({color:'#dcc197'}));tip.position.y=1.95;pencil.add(tip);
  const lead=new THREE.Mesh(new THREE.ConeGeometry(.018,.075,6),new THREE.MeshStandardMaterial({color:'#364248'}));lead.position.y=2.08;pencil.add(lead);
  pencil.rotation.z=-.22;return pencil;
 }
 return type==='box'?createBox(i):type==='marker'?createBudgetMarker(i):type==='die'?createThemedDie(i):createMeeple(i);}
export function modelImage(type,i){const key=type+i;if(cache.has(key))return cache.get(key);try{
 renderer||=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(180,200);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfffae7,0x314450,3));const light=new THREE.DirectionalLight(0xffefd3,3.5);light.position.set(-3,5,6);scene.add(light);
 const object=modelFor(type,i);object.rotation.set(type==='box'?.7:type==='marker'?.4:.1,-.4,-.04);scene.add(object);const box=new THREE.Box3().setFromObject(object),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),extent=Math.max(size.x,size.y)*.7;
 const camera=new THREE.OrthographicCamera(-extent*.9,extent*.9,extent,-extent,.01,20);camera.position.set(center.x,center.y,5);camera.lookAt(center);renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');cache.set(key,url);object.traverse(o=>{o.geometry?.dispose();[].concat(o.material||[]).forEach(m=>m.dispose());});return url;
 }catch{return '/ulleung-marble/favicon.svg';}}
export function inspectModel(host,type,i){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff5dd,0x36586a,3));const light=new THREE.DirectionalLight(0xfff6df,3);light.position.set(-3,4,5);scene.add(light);
 const pivot=new THREE.Group(),object=modelFor(type,i);if(type==='box')object.rotation.x=i===2?1.42:i?1.1:.8;object.rotation.y=-.22;const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());object.position.sub(center);pivot.add(object);scene.add(pivot);
 if(type==='box'&&i===2)object.children.slice(1).forEach(part=>part.visible=false);object.updateMatrixWorld(true);const focusBounds=new THREE.Box3().setFromObject(type==='box'&&i===2?object.children[0]:object),focusCenter=focusBounds.getCenter(new THREE.Vector3()),focusSize=focusBounds.getSize(new THREE.Vector3());const camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,100);camera.position.set(focusCenter.x,focusCenter.y,10);camera.lookAt(focusCenter.x,focusCenter.y,0);let zoom=1;
 const render=()=>renderer.render(scene,camera);const fit=()=>{const w=Math.max(200,host.clientWidth-40),h=Math.max(240,Math.min(650,host.clientHeight-60)),ratio=w/h,extent=Math.max(focusSize.y*.57,focusSize.x*.57/ratio,focusSize.z*.12);renderer.setSize(w,h);camera.left=-extent*ratio/zoom;camera.right=extent*ratio/zoom;camera.top=extent/zoom;camera.bottom=-extent/zoom;camera.updateProjectionMatrix();render();};
 let drag=null;renderer.domElement.style.touchAction='none';renderer.domElement.onpointerdown=e=>{drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);};renderer.domElement.onpointermove=e=>{if(!drag)return;pivot.rotation.y+=(e.clientX-drag[0])*.006;pivot.rotation.x+=(e.clientY-drag[1])*.006;drag=[e.clientX,e.clientY];render();};renderer.domElement.onpointerup=()=>drag=null;renderer.domElement.onpointercancel=()=>drag=null;const wheel=e=>{e.preventDefault();zoom=Math.min(2,Math.max(.6,zoom*Math.exp(-e.deltaY*.001)));fit();};renderer.domElement.addEventListener('wheel',wheel,{passive:false});
 const note=document.createElement('p');note.className='model-hint';note.textContent='드래그로 회전 · 휠로 확대';host.append(note);const observer=new ResizeObserver(fit);observer.observe(host);fit();return()=>{observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();[].concat(o.material||[]).forEach(m=>{if(!m.map?.userData.shared)m.map?.dispose();m.dispose();});});renderer.dispose();renderer.forceContextLoss();};
}
