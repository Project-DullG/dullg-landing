import * as THREE from 'three';
export const boxTextures=new Map();let loading;
export function prepareBoxTextures(){
 if(typeof document==='undefined')return Promise.resolve();
 if(loading)return loading;
 loading=(async()=>{await document.fonts.ready;
 const files={cover:'box-cover.svg',side:'box-spine.svg',board:'board.svg',manual:'manual-cover.svg',...Object.fromEntries(Array.from({length:8},(_,i)=>['book'+i,'book-cover-'+i+'.svg'])),...Object.fromEntries(['teal-01-back','green-01-back','C01-front','scenery-1-back','activity-1-back','food-1-back','lap-1-back','fatigue-1-back','award-0-front'].map(k=>[k,'cards/'+k+'.svg']))};
 await Promise.all(Object.entries(files).map(async([key,path])=>{const img=new Image();img.src='/ulleung-marble/assets/v07/'+path;await img.decode();const canvas=document.createElement('canvas');canvas.width=key==='cover'?1520:key==='board'?900:512;canvas.height=key==='cover'?960:key==='board'?525:key==='side'?72:Math.round(512*img.naturalHeight/img.naturalWidth);const ctx=canvas.getContext('2d');if(key==='board')ctx.drawImage(img,0,0,img.naturalWidth/2,img.naturalHeight/2,0,0,canvas.width,canvas.height);else ctx.drawImage(img,0,0,canvas.width,canvas.height);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.userData.shared=true;boxTextures.set(key,texture);}));
 })();return loading;
}

