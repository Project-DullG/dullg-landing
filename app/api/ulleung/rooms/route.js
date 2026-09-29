import {createHash, randomInt} from 'node:crypto';
import {getAdminDb} from '@/lib/firebase/admin';
import data from '@/public/ulleung-marble/tabletop/v07/data.json';
import {newRoom,joinRoom,actRoom,roomView,RoomError} from '@/lib/ulleung-marble/room-core.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const COLLECTION='ulleung_marble_rooms_v1';
const hash=s=>createHash('sha256').update(s).digest('hex');
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const codeOf=v=>{if(typeof v!=='string'||!/^[A-HJ-NP-Z2-9]{6}$/.test(v))throw new RoomError('초대 코드 6자리를 확인해 주세요.');return v;};
function credential(request){
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[A-Za-z0-9_-]{43,86}$/.test(token))throw new RoomError('참가 정보가 없습니다. 대기실에서 다시 접속해 주세요.',401);
 const digest=hash(token);return {id:digest.slice(0,24),auth:digest};
}
function authorize(room,identity){if(!room.members.some(m=>m.id===identity.id&&m.auth===identity.auth))throw new RoomError('이 방의 참가 정보를 확인할 수 없습니다.',403);}
function decode(snapshot){
 if(!snapshot.exists)throw new RoomError('방을 찾을 수 없습니다. 초대 코드를 확인해 주세요.',404);
 const room=JSON.parse(snapshot.data().payload);
 if(Date.now()-room.updatedAt>7*86400000)throw new RoomError('마지막 진행 후 7일이 지나 만료된 방입니다.',410);
 return room;
}
function stored(room){return {payload:JSON.stringify(room),updatedAt:room.updatedAt,expiresAt:new Date(room.updatedAt+7*86400000)};}
function failure(error){
 if(error instanceof RoomError)return json({error:error.message},error.status);
 if(error instanceof Error&&/^[가-힣]/.test(error.message))return json({error:error.message},400);
 console.error('Ulleung room service failed',error?.code||error?.name||'unknown');
 return json({error:'접속이 잠시 원활하지 않습니다. 진행 내용은 저장되어 있으니 잠시 후 다시 연결해 주세요.'},503);
}
export async function GET(request){
 try{
  const identity=credential(request),code=codeOf(new URL(request.url).searchParams.get('code'));
  const room=decode(await getAdminDb().collection(COLLECTION).doc(code).get());authorize(room,identity);
  return json(roomView(data,room,identity.id));
 }catch(error){return failure(error);}
}
export async function POST(request){
 try{
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)throw new RoomError('같은 사이트에서 접속해 주세요.',403);
  if(Number(request.headers.get('content-length'))>8192)throw new RoomError('요청이 너무 큽니다.',413);
  const raw=await request.text();if(raw.length>8192)throw new RoomError('요청이 너무 큽니다.',413);
  let body;try{body=JSON.parse(raw);}catch{throw new RoomError('요청을 읽을 수 없습니다.');}
  const identity=credential(request),code=codeOf(body.code),db=getAdminDb(),ref=db.collection(COLLECTION).doc(code);
  if(['create','join'].includes(body.type)){
   const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';
   const slot=Math.floor(Date.now()/600000),rate=db.collection('ulleung_marble_limits_v1').doc(hash(ip+':'+slot));
   await db.runTransaction(async tx=>{const snap=await tx.get(rate),count=snap.data()?.count||0;if(count>=60)throw new RoomError('참가 요청이 많습니다. 잠시 후 다시 시도해 주세요.',429);tx.set(rate,{count:count+1,expiresAt:new Date(Date.now()+3600000)});});
  }
  const view=await db.runTransaction(async tx=>{
   const snap=await tx.get(ref);let room;
   if(body.type==='create'){
    if(snap.exists){room=decode(snap);if(!room.members.some(m=>m.auth===identity.auth))throw new RoomError('초대 코드가 겹쳤습니다. 새 방을 만들어 주세요.',409);authorize(room,identity);}
    else room=newRoom(code,{...identity,name:body.name});
   }else{
    room=decode(snap);
    if(body.type==='join')room=joinRoom(room,{...identity,name:body.name});
    else{authorize(room,identity);room=actRoom(data,room,identity.id,body,Date.now(),()=>randomInt(0,0x100000000)/0x100000000);}
   }
   tx.set(ref,stored(room));
   if(body.type==='leave')return {left:true};
   return roomView(data,room,identity.id);
  });
  return json(view);
 }catch(error){return failure(error);}
}
