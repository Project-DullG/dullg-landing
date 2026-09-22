// 공개가격을 게임 비용과 분리해 관리합니다. 확인일은 가격의 적용일이 아닙니다.
export const PRICE_CHECKED_AT='2026.09.22';
const foodURL=id=>`https://www.ulcruise.co.kr/www/ulleungdo/tourism/food?idx=${id}&mode=view`;
const shopURL=(slug,id)=>`https://www.ulleungfood.co.kr/product/${encodeURIComponent(slug)}/${id}/category/1/display/2/`;
const menu=(label,price,unit,provider,id)=>({label,price,unit,provider,source:'울릉크루즈 음식점 안내',url:foodURL(id),kind:'공개 메뉴',note:'메뉴 적용일은 표기되어 있지 않습니다. 방문 전에 업소에 확인하세요.'});
const shop=(label,price,unit,slug,id,soldOut=false)=>({label,price,unit,provider:'농어촌푸드',source:'농어촌푸드 상품 페이지',url:shopURL(slug,id),kind:'온라인 판매가',soldOut,note:`${soldOut?'확인 당시 품절입니다. ':''}배송비 별도이며 현지 매장 가격과 다를 수 있습니다.`});
export const TRAVEL_PRICES={
 taxi:{label:'울릉 택시 기본요금',price:4500,unit:'기본 1.7km',provider:'울릉군 택시',source:'프레시안 · 2026.02.02 보도',url:'https://v.daum.net/v/xVMkpOXS1T',kind:'2026.02.06 시행',note:'거리·시간 및 할증에 따라 총요금이 달라집니다. 게임의 택시·합승 비용 1만원은 실제 정액요금이 아닙니다.'},
 dokdo:{label:'독도 여객선 일반석',price:60000,unit:'대인 정상운임',provider:'대저페리 썬라이즈호',source:'대저페리 운임안내',url:'https://www.daezer.com/departure/departure-charge.html',kind:'선사 공개 운임',note:'특정 선박의 운임 예시입니다. 출발 항구·선박·할증 여부에 따라 달라지며, 사동항 출발편에 그대로 적용하지 않습니다.'},
 mussel:menu('홍합밥',20000,'메뉴 1개','명가식당',147),
 limpet:menu('따개비밥',20000,'메뉴 1개','명가식당',147),
 noodle:menu('따개비칼국수',15000,'메뉴 1개','명가식당',147),
 bibimbap:menu('산채비빔밥',13000,'1인분','나리촌식당',59),
 beef:menu('약소구이',30000,'150g','향우촌',69),
 stirSquid:menu('오징어불고기',20000,'1인분','수복식당',72),
 driedSquid:shop('마른 오징어',16000,'2미 · 180g','울릉도-당일-오징어-2미180g',236,true),
 myeongi:shop('명이나물',15000,'300g × 2병','울릉도-명이나물-300g×2병',149),
 greens:shop('부지갱이',3700,'150g × 2봉','울릉도-부지갱이-150g×2봉',389),
 seaweed:shop('돌미역',9000,'100g','돌미역-100g-x-1',73,true),
 laver:shop('돌김',25000,'10장 · 130g','돌김-돌김10장130g',74,true),
 shrimp:{label:'독도새우 소',price:150000,unit:'2인',provider:'비치온회센터',source:'다이닝코드 · 비치온회센터 메뉴',url:'https://www.diningcode.com/profile.php?rid=NI1beDJEnnBm',kind:'메뉴 게시자료',note:'방문자 메뉴 자료로, 업소에서 확인한 최신 요금은 아닙니다. 크기와 구성·당일 가격을 주문 전에 확인하세요.'},
 mulhoe:{label:'물회·회덮밥',price:22000,unit:'메뉴 1개',provider:'비치온회센터',source:'다이닝코드 · 비치온회센터 메뉴',url:'https://www.diningcode.com/profile.php?rid=NI1beDJEnnBm',kind:'메뉴 게시자료',note:'방문자 메뉴 자료이며 적용일은 표기되어 있지 않습니다. 주문 전에 업소에 확인하세요.'},
 sashimi:{label:'모둠회 중',price:120000,unit:'중 1접시',provider:'비치온회센터',source:'다이닝코드 · 비치온회센터 메뉴',url:'https://www.diningcode.com/profile.php?rid=NI1beDJEnnBm',kind:'메뉴 게시자료',note:'방문자 메뉴 자료입니다. 생선 종류·구성·당일 가격을 주문 전에 확인하세요.'},
 pumpkin:{label:'호박엿',price:null,note:'2026년 적용 가격과 판매 단위를 함께 확인할 수 있는 자료를 확보하지 못했습니다. 구매처에 용량과 가격을 확인하세요.'},
 halfSquid:{label:'반건조 오징어',price:null,note:'울릉도산 상품의 2026년 가격을 확인하지 못했습니다. 원산지·마릿수·중량을 확인한 뒤 가격을 비교하세요.'},
 lunch:{label:'산채 도시락',price:null,note:'카드의 산채 도시락과 일치하는 판매 메뉴·가격을 확인하지 못했습니다. 식당의 산채비빔밥 가격을 도시락 가격으로 대신 적지 않았습니다.'}
};
const foodKeys=['driedSquid','halfSquid','stirSquid','mussel','limpet','noodle','beef','myeongi','greens','bibimbap','pumpkin','shrimp','mulhoe','sashimi','seaweed','laver'];
export const foodPrice=i=>TRAVEL_PRICES[foodKeys[i%foodKeys.length]];
export function encounterPrice(c){if(c.number===7)return TRAVEL_PRICES.taxi;if(c.number===9)return TRAVEL_PRICES.pumpkin;if(c.number===1&&['teal','orange'].includes(c.region))return TRAVEL_PRICES.dokdo;if(c.number===5)return TRAVEL_PRICES[{teal:'mussel',blue:'driedSquid',orange:'limpet',ochre:'lunch',green:'bibimbap'}[c.region]];return null;}
export const priceAmount=p=>p.price===null?'2026 가격 미확인':p.price.toLocaleString('ko-KR')+'원';
export const priceCaption=p=>p.price===null?[`실제 가격 참고 · ${p.label} 미확인`,'2026.09 확인 · 구매처에 가격 문의']:[`실제 가격 참고 · ${p.unit} ${priceAmount(p)}`,`${p.provider} · 2026.09 조회${p.soldOut?' · 품절':' · 변동 가능'}`];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function priceHTML(p){if(!p)return '';return `<aside class="travel-price"><small>실제 여행 가격 참고 · 게임 비용과 별도</small><h3>${escape(p.label)} <strong>${priceAmount(p)}</strong></h3>${p.price===null?'':`<p>${escape(p.unit)} · ${escape(p.provider)}<br>${escape(p.kind)}${p.soldOut?' · 확인 당시 품절':''}</p>`}<p>${escape(p.note)}</p><footer>공개자료 확인: ${PRICE_CHECKED_AT}${p.url?`<br><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">${escape(p.source)} ↗</a>`:''}</footer></aside>`;}
