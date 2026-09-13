import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin=process.argv[2] || 'http://localhost:3002';
const pages={};
for(const route of ['/','/mini-projects','/games/tide-room','/en/games/tide-room','/play/tide-room']){
 const response=await fetch(origin+route);assert.equal(response.status,200,route);assert.equal(new URL(response.url).origin,new URL(origin).origin,`${route}: redirected outside the site`);pages[route]=await response.text();
}
const includes=(path,text)=>assert.ok(pages[path].includes(text),`${path}: missing ${text}`);
includes('/','href="/games/tide-room"');includes('/mini-projects','href="/games/tide-room"');includes('/games/tide-room','href="/play/tide-room"');
includes('/en/games/tide-room','Korean only');includes('/en/games/tide-room','Play in Korean');includes('/en/games/tide-room','<html lang="en"');includes('/play/tide-room','id="main-content"');
assert.ok(!pages['/play/tide-room'].includes('작가용 사건 전말 보기'));
for(const prefix of ['', '/en']){const r=await fetch(origin+prefix+'/dashboard',{redirect:'manual'});assert.ok([307,308].includes(r.status));assert.equal(new URL(r.headers.get('location'),origin).pathname,prefix+'/login');}
const files=fs.readdirSync('public/assets/tide-room');
for(const file of files){const r=await fetch(origin+'/assets/tide-room/'+file,{method:'HEAD'});assert.equal(r.status,200,file);assert.ok(Number(r.headers.get('content-length'))>0,file);}
const range=await fetch(origin+'/assets/tide-room/ink-in-the-files.m4a',{headers:{Range:'bytes=0-255'}});assert.equal(range.status,206);
console.log(JSON.stringify({pages:Object.keys(pages).length,media:files.length,audioRange:206,authRedirects:2,browser:false,status:'passed'}));
