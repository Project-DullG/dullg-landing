import kit,{getCardInventory,CARD_WIDTH} from './physical-kit.mjs?v=physical-components-20261029-v1';
// A world unit is a fixed length, including type and all internal artwork.
const WORLD_PER_MM=CARD_WIDTH/58;
const PRINT_SCALE=(96/25.4)/WORLD_PER_MM;
const mm=world=>(world/WORLD_PER_MM).toFixed(9);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function cut(piece,side='front',{cropX=0,cropWidth=piece.width,extraClass=''}={}){
 const face=piece[side];if(!face)return '';
 // mountPhysicalTable adds this class to the very same writable fields.
 const faceHTML=face.replace(/<textarea /g,'<textarea class="physical-inline-note" ').replace(/<input /g,'<input class="physical-inline-note" ');
 const bare=piece.printBare;
 return `<div class="mk-print-cut ${extraClass}" data-physical-id="${esc(piece.id)}" data-side="${side}" data-type="${piece.type}" data-crop-x="${cropX}" style="width:${mm(cropWidth)}mm;height:${mm(piece.height)}mm"><div class="mk-print-original ${bare?'':'physical-piece'}" data-type="${piece.type}" data-world-width="${piece.width}" data-world-height="${piece.height}" style="width:${piece.width}px;height:${piece.height}px;left:${-cropX*PRINT_SCALE}px;transform:scale(${PRINT_SCALE})">${bare?faceHTML:`<div class="physical-face">${faceHTML}</div>`}</div></div>`;
}
const sheet=(title,body,mode='support',extra='')=>`<section class="mk-print-sheet ${extra}" data-print-section="${mode}"><h2>${title}</h2>${body}</section>`;
const blankBack=(title,mode='support')=>sheet(`${title} / 이 앞면 구성품의 빈 뒷면`,'',mode,'mk-blank-back');
const oneSidedSheet=(title,body,mode='support',extra='')=>sheet(title,body,mode,extra)+blankBack(title,mode);
function mirroredRows(items,columns){const result=[];for(let start=0;start<items.length;start+=columns)result.push(...items.slice(start,start+columns).reverse());return result;}
function imposed(title,items,{columns,rows,cellWidth,cellHeight,mode='support',captions=false}={}){
 const capacity=columns*rows,total=Math.ceil(items.length/capacity);let output='';
 for(let page=0;page<total;page++){
  const cells=Array.from({length:capacity},(_,index)=>items[page*capacity+index]||null);
  for(const side of ['front','back']){
   if(side==='back'&&!cells.some(piece=>piece?.back)){output+=blankBack(`${title} / ${page+1} / ${total}`,mode==='card'?'back':'support');continue;}
   const placed=side==='back'?mirroredRows(cells,columns):cells;
   const grid=placed.map(piece=>`<div class="mk-print-cell ${piece?.[side]?'':'is-blank'}" style="width:${cellWidth}mm;height:${cellHeight}mm">${piece?.[side]?cut(piece,side,{extraClass:piece.type==='card'?'mk-print-card':piece.id.startsWith('coin-')?'mk-print-coin':''})+(captions?`<span class="mk-print-caption">${esc(piece.label)}${side==='back'?' 뒷면':''}</span>`:''):''}</div>`).join('');
   const sectionMode=mode==='card'?side:'support';
   output+=sheet(`${title} / ${side==='front'?'앞면':'뒷면 좌우 대응'} / ${page+1} / ${total}`,`<div class="mk-print-grid" style="grid-template-columns:repeat(${columns},${cellWidth}mm)">${grid}</div>`,sectionMode,'mk-imposed-sheet');
  }
 }
 return output;
}
function pairedPaper(piece,title=piece.label){let output='';for(const side of ['front','back'])if(piece[side])output+=sheet(`${title} / ${side==='front'?'앞면':'뒷면'} / ${mm(piece.width).slice(0,6)} × ${mm(piece.height).slice(0,6)}mm`,`<div class="mk-print-single">${cut(piece,side,{extraClass:piece.id.startsWith('ledger-')?'mk-print-ledger':''})}</div>`);if(!piece.back)output+=blankBack(title);return output;}
const originalIds=new Set(getCardInventory().map(card=>card.id));
const cards=[...getCardInventory().map(card=>kit.pieces.find(piece=>piece.id===card.id)),...kit.pieces.filter(piece=>piece.type==='card'&&!originalIds.has(piece.id))];
let html=imposed('섬마을 장터 카드 154장과 참고 카드 6장',cards,{columns:3,rows:3,cellWidth:58,cellHeight:88,mode:'card'});
for(const [value,columns,rows]of [[1,8,12],[5,7,10],[10,6,9]]){
 const coins=kit.pieces.filter(piece=>piece.id.startsWith('coin-'+value+'-'));
 html+=imposed(`${value}냥 동전 ${coins.length}개`,coins,{columns,rows,cellWidth:mm(coins[0].width),cellHeight:mm(coins[0].height)});
}
const markerIds=['round-marker','first-player','turn-pawn','trade-opportunity','round-cooked'];
html+=imposed('장날과 차례, 거래와 요리 판매 표식',markerIds.map(id=>kit.pieces.find(piece=>piece.id===id)),{columns:4,rows:2,cellWidth:43,cellHeight:55,captions:true});
for(const piece of kit.pieces.filter(piece=>piece.id.startsWith('ledger-')))html+=pairedPaper(piece);
const ruleCover=kit.pieces.find(piece=>piece.id==='rule-cover');html+=pairedPaper(ruleCover);
for(const piece of kit.pieces.filter(piece=>piece.id.startsWith('rule-page-')))html+=pairedPaper(piece);
// The mat is not rearranged into another grid. These are two crops of one original.
for(const mat of kit.pieces.filter(piece=>piece.id.startsWith('mat-'))){
 html+=oneSidedSheet(`${mat.label} / 왼쪽 6칸 / 1번 조각`,`<p class="mk-crop-note">오른쪽 조각과 맞대어 붙입니다. 원본 매트 ${mm(mat.width).slice(0,6)} × ${mm(mat.height).slice(0,6)}mm</p><div class="mk-print-single">${cut(mat,'front',{cropWidth:508,extraClass:'mk-print-mat'})}</div>`);
 html+=oneSidedSheet(`${mat.label} / 오른쪽 4칸 / 2번 조각`,`<p class="mk-crop-note">왼쪽 조각과 같은 높이로 붙입니다. 매트의 1~10칸을 함께 사용합니다.</p><div class="mk-print-single">${cut(mat,'front',{cropX:508,cropWidth:mat.width-508,extraClass:'mk-print-mat'})}</div>`);
}
const track=kit.pieces.find(piece=>piece.id==='round-track');
html+=oneSidedSheet('장날 트랙 / 왼쪽 1~5와 오른쪽 6~10을 이어 붙입니다.',`<div class="mk-print-track-tiles">${cut(track,'front',{cropWidth:480,extraClass:'mk-print-track'})}${cut(track,'front',{cropX:480,cropWidth:track.width-480,extraClass:'mk-print-track'})}</div>`);
const slip=kit.pieces.find(piece=>piece.id==='bank-slip');
html+=imposed('은행 확인증 / 필요할 때만 쓰는 여분 8장',Array.from({length:8},(_,index)=>({...slip,id:'printed-bank-slip-'+(index+1)})),{columns:2,rows:4,cellWidth:mm(slip.width),cellHeight:mm(slip.height)});
const envelope=kit.pieces.find(piece=>piece.id==='unused-envelope');
const envelopeWidth=Number(mm(envelope.width)),envelopeHeight=Number(mm(envelope.height));
html+=oneSidedSheet('이번 판 미사용 카드 보관 봉투 / 실선 자르기, 점선 접기',`<p class="mk-crop-note">양옆 날개와 아래 날개를 붙입니다. 카드는 가로로 넣고 위 날개로 닫습니다.</p><div class="mk-envelope-net" style="width:${envelopeWidth+40}mm;height:${envelopeHeight+90}mm"><div class="mk-envelope-front">${cut(envelope)}</div><div class="mk-envelope-flap mk-flap-top" style="width:${envelopeWidth}mm">윗날개</div><div class="mk-envelope-flap mk-flap-bottom" style="width:${envelopeWidth}mm;top:${envelopeHeight+40}mm">아래 날개</div><div class="mk-envelope-flap mk-flap-left" style="height:${envelopeHeight}mm">풀칠</div><div class="mk-envelope-flap mk-flap-right" style="left:${envelopeWidth+20}mm;height:${envelopeHeight}mm">풀칠</div></div>`);
const bankZone=kit.zones.find(zone=>zone.id==='bank'),bank={id:'bank-place-strip',label:'은행 자리',type:'paper',width:bankZone.width,height:bankZone.height,front:bankZone.html,printBare:true};
html+=oneSidedSheet('공용 은행 자리 / 두 조각을 맞대어 붙입니다.',`<div class="mk-print-track-tiles">${cut(bank,'front',{cropWidth:415})}${cut(bank,'front',{cropX:415,cropWidth:bank.width-415})}</div>`);
document.querySelector('#print-content').innerHTML=html;
document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>{document.body.dataset.printMode=button.dataset.print;window.print();}));
window.addEventListener('afterprint',()=>delete document.body.dataset.printMode);
