import * as THREE from 'three';
import {createMeeple,createBudgetMarker,createThemedDie} from './models.mjs';
import {boxTextures} from './box-textures.mjs';
export const BOX={width:.380,depth:.240,height:.070,wall:.002,inside:[.372,.232,.062],board:[.360,.210,.008],book:[.128,.182,.0012],card:[.058,.090,.00032],cardPiles:[74,72,52,35]};
export function createBox(state=0){
 const mode=state===true?2:Number(state),open=mode>0,root=new THREE.Group();
 root.name='box-'+mode;root.userData={dimensionsMm:[380,240,70],kind:'prototype packaging',contents:'board 1, B6 8p books 9, cards 233, meeples 8, cubes 8, dice 2, round boat 1, pencil 1',mode};
 const mats={teal:new THREE.MeshStandardMaterial({color:'#285360',roughness:.83}),paper:new THREE.MeshStandardMaterial({color:'#f4ebd5',roughness:.94}),insert:new THREE.MeshStandardMaterial({color:'#d6cdb7',roughness:1}),edge:new THREE.MeshStandardMaterial({color:'#ae9877',roughness:.85})};
 const box=(g,x,y,z,w,h,dep,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),mat);m.position.set(x,y,z);g.add(m);return m;};
 const print=(g,key,x,y,z,w,h,vertical=false)=>{const map=boxTextures.get(key);if(!map)return;const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.88}));face.position.set(x,y,z);if(!vertical)face.rotation.x=-Math.PI/2;g.add(face);};
 const shell=(g,w,dep,h,mat,top=false)=>{box(g,0,top?h-.001:.001,0,w,.002,dep,mat);box(g,-w/2+.001,h/2,0,.002,h,dep,mat);box(g,w/2-.001,h/2,0,.002,h,dep,mat);box(g,0,h/2,-dep/2+.001,w-.004,h,.002,mat);box(g,0,h/2,dep/2-.001,w-.004,h,.002,mat);};
 const base=new THREE.Group();root.add(base);shell(base,.376,.236,.066,mats.teal);box(base,0,.003,0,.372,.002,.232,mats.insert);box(base,-.113,.0105,0,.138,.013,.224,mats.insert);box(base,.169,.0105,0,.022,.013,.110,mats.insert);
 box(base,-.041,.018,0,.002,.030,.230,mats.insert);box(base,.062,.018,0,.002,.030,.230,mats.insert);box(base,.065,.018,0,.203,.030,.002,mats.insert);
 const piles=[[-.002,-.053,[[50,'teal-01-back','#367b83'],[24,'C01-front','#335d65']]],[.116,-.053,[[32,'scenery-1-back','#507e8b'],[40,'activity-1-back','#667d50']]],[-.002,.053,[[48,'food-1-back','#b47b47'],[4,'lap-1-back','#b39a60']]],[.116,.053,[[32,'fatigue-1-back','#927572'],[3,'award-0-front','#c2a669']]]];
 piles.forEach(([x,z,layers])=>{let y=.005;for(const [n,key,color] of layers){const h=n*.00032;box(base,x,y+h/2,z,.058,h,.090,mats.paper);box(base,x,y+h+.00004,z,.058,.00008,.090,new THREE.MeshStandardMaterial({color,roughness:.9}));print(base,key,x,y+h+.00009,z,.058,.090);y+=h;}});
 const books=new THREE.Group();root.add(books);for(let i=0;i<9;i++){const y=.027+i*.0014;box(books,-.111,y,-.014,.128,.0012,.182,mats.paper);print(books,i===8?'manual':'book'+i,-.111,y+.00061,-.014,.128,.182);}
 if(mode===2)books.position.set(-.175,.075,-.135);
 const place=(object,x,y,z,height,flat=false)=>{const s=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());object.scale.multiplyScalar(height/s.y);if(flat)object.rotation.x=-Math.PI/2;const b=new THREE.Box3().setFromObject(object),center=b.getCenter(new THREE.Vector3());object.position.set(x-center.x,y-b.min.y,z-center.z);base.add(object);};
 for(let i=0;i<8;i++)place(createMeeple(i),-.153+(i%4)*.029,.017,-.06+Math.floor(i/4)*.040,.030,true);
 for(let i=0;i<8;i++)place(createBudgetMarker(i),.169,.017,-.038+i*.011,.008);
 place(createThemedDie(0),-.153,.017,.104,.020);place(createThemedDie(1),-.125,.017,.104,.020);
 place(createMeeple(5),-.083,.017,.084,.022,true);
 const pencil=new THREE.Mesh(new THREE.CylinderGeometry(.0018,.0018,.170,6),new THREE.MeshStandardMaterial({color:'#b8853d'}));pencil.rotation.x=Math.PI/2;pencil.position.set(-.052,.019,-.009);base.add(pencil);
 const folded=new THREE.Group();box(folded,0,.004,0,.360,.008,.210,mats.paper);print(folded,'board',0,.00804,0,.360,.210);root.add(folded);folded.position.set(0,open?.08:.044,open?-.274:0);
 const lid=new THREE.Group();shell(lid,.380,.240,.032,mats.teal,true);root.add(lid);lid.position.set(open?.408:0,open?.012:.038,0);
 print(lid,'cover',0,.03204,0,.380,.240);print(lid,'side',0,.016,.12004,.376,.029,true);

 return root;
}
