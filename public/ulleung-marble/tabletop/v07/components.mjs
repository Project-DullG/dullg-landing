import {travelerCoverSVG,portraitURL} from './traveler-cover.mjs';
import {encounterPrice,foodPrice,priceCaption} from './travel-prices.mjs';
import {landmarkArt,landmarkFor,routeStory} from './landmarks.mjs';
import {art,placeArt,recordArt,encounterArt} from './illustration-map.mjs';
import {effectText,LABELS,LEADER_POINTS,TIED_LEADER_POINTS,optionCondition} from './engine.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ink='#213e42',paper='#f7f1e4',colors={scenery:'#507e8b',activity:'#667d50',food:'#b47b47',fatigue:'#927572',lap:'#b39a60'};
export const dataURL=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const serif='Nanum Myeongjo, Georgia, serif';
export function lines(s,max){
 const width=t=>Array.from(t).reduce((n,c)=>n+(/[\x00-\x7f]/.test(c)?.54:1),0),out=[];
 for(const paragraph of String(s).split('\n')){let row='';for(const word of paragraph.trim().split(/\s+/)){if(width(word)>max){if(row){out.push(row);row='';}let part='';for(const c of word){if(width(part+c)>max){out.push(part);part='';}part+=c;}row=part;}else if(row&&width(row+' '+word)>max){out.push(row);row=word;}else row+=(row?' ':'')+word;}if(row)out.push(row);}
 return out;
}
function txt(s,x,y,size=17,color=ink,max=99,lh=size*1.5,extra=''){return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${lines(s,max).map((t,i)=>`<tspan x="${x}" dy="${i?lh:0}">${esc(t)}</tspan>`).join('')}</text>`;}
function svg(w,h,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w/6}mm" height="${h/6}mm" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="12" fill="${paper}"/><g font-family="Nanum Gothic, Arial, sans-serif">${body}</g></svg>`;}
function border(w,h,color){return `<rect x="12" y="12" width="${w-24}" height="${h-24}" rx="6" fill="none" stroke="${color}" stroke-width="1"/>`;}
export function backSVG(label,color,w=348,h=540){return svg(w,h,`<rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="${color}"/>${border(w,h,'#c9d9ce')}<circle cx="${w/2}" cy="${h*.45}" r="${w*.28}" fill="none" stroke="#cfddcf" stroke-width="1"/><path d="M ${w*.23} ${h*.5} Q ${w*.34} ${h*.40} ${w*.4} ${h*.45} L ${w*.53} ${h*.31} L ${w*.71} ${h*.5} M ${w*.23} ${h*.53} Q ${w*.4} ${h*.49} ${w*.53} ${h*.53} T ${w*.78} ${h*.53}" fill="none" stroke="#eee8d6" stroke-width="2"/>${txt('울릉마블',w/2,h*.18,21,paper,99,30,'text-anchor="middle" letter-spacing="4"')}${txt(label,w/2,h*.70,25,paper,99,32,`text-anchor="middle" font-family="${serif}"`)}${txt('ULLEUNG MARBLE',w/2,h*.88,10,'#d7dfd2',99,20,'text-anchor="middle" letter-spacing="2"')}`);}
export function encounterLayout(c){
 const e=c.entries[0],font=15,lh=21,max=308/font,scenario=lines(e.scenario,max);
 const options=e.options.map((o,i)=>{const outcome=lines(o.outcome||'',304/14.5),effect=compactEffect(o.effect),effectLines=lines(effect,302/15),conditionHeight=o.requiredNodes?.length||o.maxFatigue<4?28:0;return {label:String.fromCharCode(65+i)+'  '+o.label,outcome,effect,effectLines,conditionHeight,height:28+outcome.length*20+effectLines.length*21+conditionHeight+9};});
 const rows=options.reduce((sum,o)=>sum+o.height+9,0),imageHeight=Math.min(130,496-83-17-scenario.length*lh-14-rows);
 if(imageHeight<62)throw Error(c.id+': 결과 문구가 인쇄 영역을 넘칩니다.');
 const top=83+imageHeight+23;let y=top+(scenario.length-1)*lh+28;
 for(const o of options){o.top=y;o.bottom=y+o.height;y=o.bottom+9;}
 if(y>513)throw Error(c.id+': 58×90 본문 넘침 '+y);
 return {font,lh,max,scenario,imageHeight,top,options,entries:[{top,bottom:y}],bottom:y};
}
function compactEffect(e){return effectText({...e,dokdo:false}).replace('다음 일반 이동 +1 (최대 6)','다음 일반 이동 +1 (최대 6)');}
function cardHeading(label,id,color){return '<path d="M20 39H328" stroke="'+color+'" stroke-width="2"/>'+txt(label,20,26,13,color)+txt(id,328,26,12,color,99,18,'text-anchor="end"');}
export function encounterSVG(d,c){
 const r=d.regions.find(r=>r.id===c.region),e=c.entries[0],l=encounterLayout(c);
 let body=cardHeading(r.title,String(c.number).padStart(2,'0'),r.color)+txt(c.title,20,70,23,ink,99,28,'font-weight="bold"')+'<image href="'+encounterArt(c)+'" x="20" y="83" width="308" height="'+l.imageHeight+'" preserveAspectRatio="xMidYMid slice"/>'+txt(e.scenario,20,l.top,l.font,ink,l.max,l.lh);
 l.options.forEach((o,i)=>{
  const rule=e.options[i],labelY=o.top+o.conditionHeight,resultY=labelY+24,rewardY=resultY+o.outcome.length*20+3;
  body+='<rect x="16" y="'+(o.top-17)+'" width="316" height="'+o.height+'" rx="4" fill="'+(i?'#eeeade':'#e7ede7')+'"/><rect x="16" y="'+(o.top-17)+'" width="3" height="'+o.height+'" fill="'+r.color+'"/>'+txt(o.label,25,labelY,16,ink,99,22,'font-weight="bold"')+txt(o.outcome.join('\n'),25,resultY,14.5,'#445653',304/14.5,20)+'<path d="M25 '+(rewardY-15)+'H323" stroke="#c6cec1" stroke-width=".6"/>'+txt(o.effect,25,rewardY+3,15,r.color,302/15,21,'font-weight="bold"');
  if(o.conditionHeight)body+='<rect x="19" y="'+(o.top-17)+'" width="313" height="26" rx="3" fill="#775831"/>'+txt('조건  '+optionCondition(d,rule),25,o.top,12.5,'#fff8e8',99,18,'font-weight="bold"');
 });
 const price=encounterPrice(c);body+=price?'<path d="M20 489H328" stroke="#c8c2ae"/>'+priceCaption(price).map((t,i)=>txt(t,20,506+i*18,10.5,'#596d66')).join(''):txt('같은 색 권역에서 뽑고 · A/B 중 하나 선택',20,524,10.5,'#64736a');return svg(348,540,body);
}
export function routeSVG(d,c){const story=routeStory(d,c),sc=lines(story,22).slice(0,3).join('\n');return svg(348,540,cardHeading('나의 여행코스',c.id,'#305965')+txt(c.name,20,73,23,ink,99,28,'font-weight="bold"')+`<image href="${placeArt(c.nodes[1])}" x="20" y="87" width="308" height="145" preserveAspectRatio="xMidYMid slice"/>`+txt(sc,20,257,14,ink,22,21)+c.nodes.map((id,i)=>`<path d="M20 ${326+i*43}H328" stroke="#cbd1c7"/>`+txt('0'+(i+1),20,354+i*43,13,'#947841')+txt(d.nodes.find(n=>n.id===id).name,51,354+i*43,17,ink,99,22)+`<rect x="309" y="${341+i*43}" width="14" height="14" fill="none" stroke="#768d80"/>`).join('')+`<rect x="20" y="472" width="308" height="32" fill="#305965"/>`+txt('1곳 2점 · 2곳 4점 · 3곳 8점',174,494,16,paper,99,20,'text-anchor="middle"')+txt('순서 무관 · 출발·통과 제외 · 도착만 표시',174,524,11,'#677969',99,18,'text-anchor="middle"'));}
export function infoSVG(d,type,i=0){const item=d.information[type][i%d.information[type].length],title=lines(item.name,14),top=294+(title.length-1)*27;const font=16,bodyLines=lines(item.text,308/font);if(top+bodyLines.length*23>489)throw Error(`${type}-${i}: 기록 카드 본문이 넘칩니다.`);return svg(348,540,cardHeading(['scenery','activity','food'].includes(type)?'울릉도 '+LABELS[type]+' 정보':LABELS[type],type==='lap'?'7점':String(i+1).padStart(2,'0'),colors[type])+`<image href="${recordArt(type,i)}" x="20" y="52" width="308" height="194" preserveAspectRatio="xMidYMid slice"/>`+txt(item.name,20,275,23,ink,14,27,'font-weight="bold"')+txt(item.text,20,top+12,16,ink,308/16,23)+(type==='food'?priceCaption(foodPrice(i)).map((t,j)=>txt(t,20,465+j*18,11,'#596d66')).join(''):'')+`<path d="M20 501H328" stroke="${colors[type]}"/>`+txt({scenery:'1장마다 1점',activity:'2장마다 1점',food:'3장마다 1점',fatigue:'0·1·2·3·4장 → 0·−1·−3·−6·−10점',lap:'5권역 방문 후 항구 귀환 · 1장 7점'}[type],20,522,12,colors[type]));}
export function recordBackSVG(type){
 if(type!=='lap')return backSVG(LABELS[type],colors[type]);
 const center='text-anchor="middle"';
 return svg(348,540,`<rect width="348" height="540" rx="12" fill="#8b743f"/>${border(348,540,'#decda3')}`+txt('울릉마블',174,62,20,paper,99,28,center+' letter-spacing="4"')+'<path d="M116 124L142 98L165 117L192 80L232 124M114 139Q144 127 174 139T234 139" fill="none" stroke="#efe4c9" stroke-width="2"/>'+txt('일주',174,195,32,paper,99,40,center+` font-family="${serif}"`)+txt('획득 조건',174,238,15,'#eee0ba',99,22,center+' font-weight="bold"')+txt('다섯 권역에서 각각 이동을 마치고,\n사동항·도동항·저동항 중\n한 곳에 도착하면 가져갑니다.',174,273,14.5,paper,99,24,center)+txt('출발·통과는 방문으로 세지 않습니다.\n방문 기록은 게임이 끝날 때까지 유지합니다.',174,356,12.5,'#eee3c7',99,23,center)+'<path d="M35 403H313" stroke="#d6c397"/>'+txt('+1장 획득 · 7점',174,440,24,paper,99,30,center+' font-weight="bold"')+txt('1인 1회 · 총 4장\n먼저 조건을 채운 4명만 받습니다.',174,480,12.5,paper,99,23,center));
}
export function recordItems(d,type,ids=null){
 return (ids||d.information[type].map((_,i)=>`${type}-${i+1}`)).map(id=>{
  const index=Number(id.split('@')[0].split('-').at(-1))-1;
  const item=d.information[type][index%d.information[type].length];
  return {name:item.name,svg:infoSVG(d,type,index)};
 });
}
export function shipSVG(type){const fast=type==='fast';return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 130"><image href="${art('port')}" width="300" height="130" preserveAspectRatio="xMidYMid slice"/><rect y="101" width="300" height="29" fill="${fast?'#a67742':'#305965'}"/><text x="150" y="121" text-anchor="middle" font-size="15" fill="#fff7e9" font-family="Nanum Gothic, sans-serif">${fast?'쾌속선 → 도동항':'크루즈 → 사동항'}</text></svg>`;}
export function awardSVG(type){return svg(348,540,cardHeading('여행 기록 · 여행 달인','+'+LEADER_POINTS[type],'#927c4b')+`<image href="${recordArt(type,0)}" x="20" y="54" width="308" height="205" preserveAspectRatio="xMidYMid slice"/>`+txt(LABELS[type]+' 달인',174,319,30,ink,99,40,'text-anchor="middle" font-weight="bold"')+txt('+'+LEADER_POINTS[type]+'점',174,388,40,'#94783f',99,45,'text-anchor="middle"')+txt('이 종류를 가장 많이 모은 한 사람',174,448,15,ink,99,20,'text-anchor="middle"')+txt('공동 최다는 카드 없이 각 '+TIED_LEADER_POINTS[type]+'점',174,478,14,ink,99,20,'text-anchor="middle"')+txt('모두 0장이면 달인 점수 없음',174,518,11,'#65736a',99,20,'text-anchor="middle"'));}

export function portraitStyle(c){return `background-image:url('${portraitURL(c)}');background-size:cover;background-position:center`; }
export function coverHTML(c){return `<article class="book-cover traveler-cover"><h2 class="cover-accessible-title">${esc(c.name)} · 표지</h2>${travelerCoverSVG(c)}</article>`;}
export {turnHTML,scoreHTML,bookPages,manualPages} from './books.mjs';
export function inventory(d){return [
 ...d.encounters.map(c=>({id:c.id,type:'조우',w:58,h:90,front:()=>encounterSVG(d,c),back:()=>backSVG(d.regions.find(r=>r.id===c.region).title,d.regions.find(r=>r.id===c.region).color)})),
 ...d.routes.map(c=>({id:c.id,type:'코스',w:58,h:90,front:()=>routeSVG(d,c),back:()=>backSVG('여행코스','#305965',348,540)})),
 ...Object.entries(d.stock).flatMap(([t,n])=>Array.from({length:n},(_,i)=>({id:`${t}-${i+1}`,type:LABELS[t],w:58,h:90,front:()=>infoSVG(d,t,i),back:()=>recordBackSVG(t)}))),
 ...['scenery','activity','food'].map((t,i)=>({id:`award-${i}`,type:'보너스',w:58,h:90,front:()=>awardSVG(t),back:()=>backSVG('여행 보너스','#927c4b',348,540)}))];}
