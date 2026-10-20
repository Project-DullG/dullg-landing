const move=(n,solo=false)=>({type:'move',n,solo});
const draw=(n=1)=>({type:'draw',n});
const catchUp=n=>({type:'catch',n});
const rear=n=>({type:'rear',n});
const lead=n=>({type:'lead',n});
const gift=()=>({type:'gift'});
const row=(text,effect)=>({text,effect});
function event(id,title,place,scene,intro,rows){return {id:`event-${id}`,kind:'event',title,place,scene,intro,rows};}
export const EVENTS=[
 event(1,'손끝에서 놓친 오징어','저동항','port','물통 안 오징어를 맨손으로 잡아 보기로 했다.',[row('손끝에서 미끄러졌다. 무리는 제자리.',move(0)),row('한 마리를 붙잡았다. 고른 말만 1칸 전진.',move(1,true)),row('연달아 잡아 박수를 받았다. 고른 말만 2칸 전진.',move(2,true))]),
 event(2,'바위틈의 찬바람','봉래폭포 풍혈','bongrae','숲길을 걷다 바위틈에서 불어오는 찬바람 앞에 섰다.',[row('앉아서 조금 더 쉬었다. 무리는 제자리.',move(0)),row('땀을 식히고 일어났다. 무리 1칸 전진.',move(1)),row('더위가 가시니 걸음이 빨라졌다. 무리 2칸 전진.',move(2))]),
 event(3,'케이블카가 들어온다','도동·망향봉','coast','전망대에 오르는 케이블카 앞에 줄을 섰다.',[row('이번 차에는 자리가 없다. 무리 1칸 후진.',move(-1)),row('다음 차에 올라탔다. 무리 1칸 전진.',move(1)),row('문이 닫히기 전에 모두 탔다. 무리 3칸 전진.',move(3))]),
 event(4,'파도 옆 산책','행남해안산책로','coast','바위 절벽을 따라 걷다 바다가 잘 보이는 곳을 찾았다.',[row('사진을 찍느라 뒤에 남았다. 고른 말만 1칸 후진.',move(-1,true)),row('바다를 보며 나란히 걸었다. 무리 1칸 전진.',move(1)),row('앞서 걷던 사람들을 따라잡았다. 앞 무리 쪽으로 최대 3칸 전진.',catchUp(3))]),
 event(5,'다리 건너 관음도','관음도','gwanum','다리를 건너니 숲길과 바다 풍경이 번갈아 나타났다.',[row('바람이 잦아들기를 기다렸다. 무리는 제자리.',move(0)),row('함께 전망대에 올랐다. 무리 2칸 전진.',move(2)),row('혼자 다음 전망대까지 걸었다. 고른 말만 3칸 전진.',move(3,true))]),
 event(6,'산채비빔밥 한 그릇','나리분지','food-bibimbap','나물을 듬뿍 넣은 비빔밥 앞에 둘러앉았다.',[row('밥을 한 그릇 더 시켰다. 무리는 제자리.',move(0)),row('든든하게 먹고 출발했다. 무리 2칸 전진.',move(2)),row('식당에서 작은 선물을 받았다. 아이템 1장 획득.',draw())]),
 event(7,'해 뜨기를 기다리며','내수전일출전망대','stacks','어둠이 걷히는 바다를 바라보며 해를 기다렸다.',[row('구름에 가려 조금 더 기다렸다. 무리 1칸 후진.',move(-1)),row('구름 사이로 해가 보였다. 무리 1칸 전진.',move(1)),row('사진을 마치고 먼저 내려왔다. 고른 말만 2칸 전진.',move(2,true))]),
 event(8,'죽도에 오르는 계단','죽도','gwanum','배에서 내려 굽이진 계단을 천천히 올랐다.',[row('중간에서 숨을 골랐다. 무리 1칸 후진.',move(-1)),row('앞사람 걸음에 맞춰 올랐다. 무리 1칸 전진.',move(1)),row('뒤에 오는 사람을 기다렸다. 꼴찌 무리가 2칸 전진.',rear(2))]),
 event(9,'등대까지 걸어볼까','태하등대','lighthouse','등대로 가는 길에서 발아래 펼쳐진 해안을 내려다봤다.',[row('전망대에서 오래 머물렀다. 무리는 제자리.',move(0)),row('일행을 따라 다시 걸었다. 앞 무리 쪽으로 최대 2칸 전진.',catchUp(2)),row('먼저 등대에 닿았다. 고른 말만 2칸 전진.',move(2,true))]),
 event(10,'갈매기와 모자','울릉도 해안','coast','바닷바람에 모자가 벗겨져 데굴데굴 굴러갔다.',[row('모자를 주우러 돌아갔다. 고른 말만 2칸 후진.',move(-2,true)),row('난간에 걸린 모자를 찾았다. 무리는 제자리.',move(0)),row('옆 사람이 모자를 잡아줬다. 다른 사람 한 명이 아이템 1장 획득.',gift())]),
 event(11,'호박엿을 나눠 먹다','울릉도 장터','food-pumpkin','봉지를 열자 일행이 하나씩 손을 내밀었다.',[row('이야기를 나누며 쉬었다. 무리는 제자리.',move(0)),row('남은 간식을 챙겼다. 아이템 1장 획득.',draw()),row('나눠 먹고 기운을 냈다. 무리 2칸 전진.',move(2))]),
 event(12,'숲속에서 길을 묻다','내수전 옛길','seongin','갈림길에서 지도를 펴자 지나가던 사람이 길을 알려줬다.',[row('지나온 길로 조금 돌아갔다. 무리 2칸 후진.',move(-2)),row('길을 확인하고 출발했다. 무리 1칸 전진.',move(1)),row('앞서 간 일행이 보였다. 앞 무리 쪽으로 최대 3칸 전진.',catchUp(3))]),
 event(13,'시원한 물회','울릉도 식당','food-mulhoe','걷고 난 뒤 시원한 물회를 주문했다.',[row('마지막 한 숟갈까지 천천히 먹었다. 무리는 제자리.',move(0)),row('더위를 식히고 일어났다. 무리 1칸 전진.',move(1)),row('먼저 먹고 먼저 출발했다. 고른 말만 3칸 전진.',move(3,true))]),
 event(14,'바위 이름 맞히기','삼선암','stacks','배 위에서 바위를 보며 서로 닮은 모양을 찾았다.',[row('사진 속 바위를 다시 찾았다. 무리는 제자리.',move(0)),row('설명을 듣고 고개를 끄덕였다. 무리 1칸 전진.',move(1)),row('퀴즈를 맞혀 선물을 받았다. 아이템 1장 획득.',draw())]),
 event(15,'숲길의 쉼표','나리분지 숲길','nari','나무 그늘에 자리를 잡고 물을 나눠 마셨다.',[row('뒤에 오는 일행을 기다렸다. 꼴찌 무리가 1칸 전진.',rear(1)),row('짐을 정리하고 함께 출발했다. 무리 1칸 전진.',move(1)),row('주머니에서 쓸 만한 물건을 찾았다. 아이템 1장 획득.',draw())]),
 event(16,'사진 한 장 부탁해요','거북바위','turtle','바위 앞에서 서로 사진을 찍어주기로 했다.',[row('다시 찍느라 남았다. 고른 말만 1칸 후진.',move(-1,true)),row('사진을 찍고 함께 출발했다. 무리 1칸 전진.',move(1)),row('사진을 찍어준 사람에게 선물을 건넸다. 다른 사람 한 명이 아이템 1장 획득.',gift())]),
 event(17,'배 시간을 확인하다','사동항','port','전광판을 보고 표를 꺼내 출발 시간을 다시 확인했다.',[row('두고 온 물건이 생각났다. 무리 2칸 후진.',move(-2)),row('아직 여유가 있다. 아이템 1장 획득.',draw()),row('탑승 안내에 맞춰 움직였다. 무리 3칸 전진.',move(3))]),
 event(18,'일주버스 창가 자리','울릉도 일주도로','coast','버스 창밖으로 해안 마을과 절벽이 이어졌다.',[row('사진을 찍으며 천천히 갔다. 무리 1칸 전진.',move(1)),row('앞서 간 일행과 가까워졌다. 앞 무리 쪽으로 최대 3칸 전진.',catchUp(3)),row('먼저 간 일행이 정류장에서 기다렸다. 선두 무리 1칸 후진.',lead(-1))]),
 event(19,'지도를 펴놓고 수다','도동항 골목','port','어디를 다녀왔는지 이야기하다 서로 여행 팁을 나눴다.',[row('같은 자리를 다시 짚어봤다. 무리는 제자리.',move(0)),row('유용한 물건을 하나 챙겼다. 아이템 1장 획득.',draw()),row('서로 선물을 주고받았다. 나와 다른 사람 한 명이 아이템 1장씩 획득.',{type:'share'})]),
 event(20,'저 멀리 보이는 섬','울릉도 앞바다','dokdo','배 난간 너머로 섬의 윤곽이 서서히 드러났다.',[row('파도가 잦아들기를 기다렸다. 무리 1칸 후진.',move(-1)),row('일행과 함께 바다를 바라봤다. 무리 2칸 전진.',move(2)),row('바람을 타고 성큼 다가갔다. 무리 3칸 전진.',move(3))])
];
function item(id,title,type,text,flavor,mods={},target='self',icon='compass'){return {id:`item-${id}`,kind:'item',title,type,text,flavor,mods,target,icon};}
export const ITEMS=[
 item(1,'순풍이다!','이동','+주사위를 두 번 굴려 합산합니다.','돛이 팽팽해졌다. 이번에는 멀리 간다.',{plusRolls:2,plusMode:'sum'},'self','sail'),
 item(2,'한 번 더 출발','이동','+주사위를 두 번 굴려 더 큰 눈을 씁니다.','출발 전에 한 번 더 몸을 풀었다.',{plusRolls:2,plusMode:'max'},'self','dice'),
 item(3,'가벼운 배낭','이동','이번 +주사위 이동에 2칸을 더합니다.','짐을 덜었더니 발걸음도 가벼워졌다.',{plusBonus:2},'self','bag'),
 item(4,'홀수의 행운','이동','+주사위 눈이 홀수면 2칸을 더합니다.','문득 고른 숫자에 운을 걸었다.',{oddBonus:2},'self','star'),
 item(5,'느린 걸음도 괜찮아','이동','+주사위 눈이 1·2·3이면 2칸을 더합니다.','처음은 느려도 금세 걸음이 붙는다.',{lowBonus:2},'self','shoe'),
 item(6,'혼자 걷는 시간','이동','+주사위로 고른 말만 이동합니다. 같은 칸의 다른 말은 남습니다.','잠깐은 혼자 걸어보고 싶었다.',{plusSolo:true},'self','shoe'),
 item(7,'여기서 내려주세요','이동','+주사위 눈 그대로 또는 1칸 적게 이동할 수 있습니다.','내리고 싶은 곳을 미리 정했다.',{flexPlus:true},'self','bus'),
 item(8,'발걸음 돌리기','이동','이번 −주사위의 후진 거리를 두 배로 합니다.','다시 돌아가서 확인할 일이 생겼다.',{minusDouble:true},'self','turn'),
 item(9,'천천히 둘러보기','이동','−주사위를 두 번 굴려 더 큰 후진 눈을 씁니다.','지나친 풍경을 한 번 더 보러 갔다.',{minusRolls:2},'self','dice'),
 item(10,'사진 찍고 갈게','이동','−주사위로 고른 말만 후진합니다. 같은 칸의 다른 말은 남습니다.','사진 한 장만 찍고 따라갈게.',{minusSolo:true},'self','camera'),
 item(11,'쉼터도 지나쳐','이동','이번 −주사위는 쉼터의 후진 감소를 무시합니다.','오늘은 쉬는 시간도 짧게 잡았다.',{ignoreShelter:true},'self','wind'),
 item(12,'돌아갈 일 없는 날','이동','이번 −주사위의 후진 거리를 0으로 합니다.','표도 챙겼고, 두고 온 물건도 없다.',{minusZero:true},'self','anchor'),
 item(13,'간식 꾸러미','나눔','나와 고른 다른 사람 한 명이 아이템을 1장씩 뽑습니다.','같이 먹으려고 하나 더 챙겼어.',{share:true},'player','gift'),
 item(14,'모자 날아갔다!','방해','상대의 다음 이동 차례에 +주사위를 사용하지 못하게 합니다. −주사위는 사용합니다.','바람에 날아간 모자를 잡으러 갔다.',{blockPlus:true},'opponent','wind'),
 item(15,'내가 길 안내할게','방해','상대의 다음 이동 차례에 +주사위를 배정할 말을 내가 고릅니다.','이번 길은 내가 정해볼게.',{steerPlus:true},'opponent','compass'),
 item(16,'이쪽도 보고 가','방해','상대의 다음 이동 차례에 −주사위를 배정할 말을 내가 고릅니다.','지나온 쪽에 볼거리가 하나 더 있어.',{steerMinus:true},'opponent','turn'),
 item(17,'잠깐만 기다려','방해','상대는 다음 +주사위를 두 번 굴려 더 작은 눈을 씁니다.','서두르지 말고 우리도 기다려줘.',{plusRolls:2,plusMode:'min'},'opponent','clock'),
 item(18,'무거워진 짐','방해','상대의 다음 +주사위 이동에서 2칸을 뺍니다. 최소 0칸입니다.','기념품을 너무 많이 샀나 보다.',{plusBonus:-2},'opponent','bag'),
 item(19,'각자 구경하자','방해','상대의 다음 +이동에서 고른 말만 이동하게 합니다. 같은 칸의 다른 말은 남습니다.','여기서는 잠깐 따로 돌아보자.',{plusSolo:true},'opponent','shoe'),
 item(20,'여행 계획 변경','방어','내 앞에 놓인 방해 아이템 1장을 버립니다.','계획을 바꿔 다시 출발한다.',{clear:true},'self','shield')
];
export const BETS=[{id:'first-5',rank:'first',points:5,name:'1등 5점'},{id:'first-3',rank:'first',points:3,name:'1등 3점'},{id:'last-4',rank:'last',points:4,name:'꼴등 4점'},{id:'last-2',rank:'last',points:2,name:'꼴등 2점'}];
export const EVENT_BY_ID=Object.fromEntries(EVENTS.map(c=>[c.id,c]));
export const ITEM_BY_ID=Object.fromEntries(ITEMS.map(c=>[c.id,c]));
export const BET_BY_ID=Object.fromEntries(BETS.map(c=>[c.id,c]));
export const SOURCES=[{title:'한국관광공사: 섬들이 노는 섬, 울릉도',url:'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=b02c1460-248b-41cb-9edc-ab8e8e08304c'},{title:'한국관광공사: 봉래폭포',url:'https://data.visitkorea.or.kr/page/126071'}];
