// The printed traveler book and new-game setup share one assignment.
// Existing course cards keep their IDs and destinations, including saved games.
export const CHARACTER_COURSES = [
 {routeId:'C09',intro:'남이 짠 일정을 따라가기만 했으니, 이번에는 내가 고른 세 곳을 끝까지 찾아가 보기로 했다.',reasons:{dodong:'항구를 먼저 둘러보고 내 힘으로 다음 길을 정하고 싶다.',nari:'바다와 다른 풍경이 궁금해 산으로 둘러싸인 들을 골랐다.',taeha:'익숙한 항구 주변을 벗어나 서쪽 절벽도 직접 보고 싶다.'}},
 {routeId:'C10',intro:'짧은 휴가를 이동으로만 채우고 싶지는 않았다. 해안을 따라가며 세 곳에서 멈추고, 마지막에는 항구로 돌아올 생각이다.',reasons:{tonggumi:'남쪽 해안을 돌아가기 전에 바다 곁 마을에서 잠깐 쉬고 싶다.',daepung:'서쪽에 왔을 때는 절벽을 볼 시간을 따로 남겨두었다.',gwanum:'북쪽까지 돌아왔다면 섬 주변을 걸으며 바다를 보고 싶다.'}},
 {routeId:'C18',intro:'산과 분지를 보되 쉬는 시간을 빼먹지 않기로 했다. 세 곳만 정해두고 남은 일정은 몸 상태를 보며 바꿀 생각이다.',reasons:{seongin:'사진으로 보았던 산 위 풍경이 궁금하다. 쉬어가며 올라가고 싶다.',nari:'산으로 둘러싸인 들을 둘러보며 다음 일정 전에 쉬려고 한다.',jeodong:'산에서 내려온 뒤에는 항구를 천천히 걸으며 하루를 마치고 싶다.'}},
 {routeId:'C20',intro:'음식 때문에 길을 전부 바꾸지는 않기로 했다. 항구 두 곳과 나리분지를 지나는 동안 한 끼씩 골라 먹을 생각이다.',reasons:{sadong:'배가 드나드는 항구를 보고, 가까운 식당의 메뉴부터 읽어보고 싶다.',jeodong:'항구를 걷다가 식당에 들러 먹어본 음식과 반찬을 적어두려고 한다.',nari:'북쪽에서는 목록에 적어둔 산채비빔밥을 찾아보고 싶다.'}},
 {routeId:'C07',intro:'사진이 비슷하다고 같은 풍경은 아닐 것이다. 바다에 둘러싸인 섬과 산 안의 들, 서쪽 절벽을 각각 보고 수첩에 적고 싶다.',reasons:{gwanum:'작은 섬에서는 바다가 어느 쪽으로 보이는지 먼저 살펴보고 싶다.',nari:'바다 대신 산이 둘러싼 들을 보고 태하와 무엇이 다른지 적으려고 한다.',taeha:'사진으로 본 절벽 앞에서 카메라를 내려놓고 먼저 바라보고 싶다.'}},
 {routeId:'C03',intro:'성인봉을 걸어보려고 왔으니 산길에 시간을 남겨두었다. 나리분지와 봉래폭포에서도 쉬어가며 걸어볼 생각이다.',reasons:{bongrae:'폭포까지 걸어가며 신발과 다리 상태부터 살펴보려고 한다.',seongin:'몇 해째 미뤄둔 산이다. 이번에는 쉬어가더라도 직접 올라가고 싶다.',nari:'산길과 다른 평탄한 들도 걸어보고, 다음 길을 갈 힘을 남기려고 한다.'}},
 {routeId:'C13',intro:'항구 주변에 몰려 있던 일정을 고쳐 현포와 천부를 넣었다. 북쪽 해안을 보는 날에는 삼선암까지 이어가 보기로 했다.',reasons:{hyeonpo:'동쪽 항구만 보고 돌아오지 않으려고 서북쪽 마을도 골랐다.',undersea:'천부에 들르는 일정에 맞춰 해중전망대를 함께 보기로 했다.',samseon:'북쪽에서 볼 곳을 가까이 묶어 이동에 쓰는 시간과 돈을 줄이려고 한다.'}},
 {routeId:'C16',intro:'이번에는 운전대를 잡지 않아도 됐다. 통구미에서 남양을 거쳐 태하까지 해안을 따라가며 마을마다 내려 걸어보고 싶다.',reasons:{namyang:'지도에서 외운 마을 이름을 실제 길과 맞춰보고 싶다.',tonggumi:'항구를 떠나 남쪽 해안을 따라가며 처음 마을에 내려보고 싶다.',taeha:'서쪽까지 이어지는 굽은 길을 따라가 보고 다음 항구로 갈 길을 확인하려고 한다.'}}
];
export function characterCourse(data, character, courseId=null){
 const id=typeof character==='number'?character:character.id;
 const assignment=CHARACTER_COURSES[id];
 const route=data.routes.find(r=>r.id===(courseId||assignment?.routeId));
 if(!route)throw new Error('여행자에게 정해진 코스 카드를 찾을 수 없습니다.');
 const savedCourse=route.id!==assignment.routeId;
 return {...assignment,route,savedCourse,intro:savedCourse?'진행 중인 게임에서 받은 코스입니다. 이번 게임은 아래 세 곳의 도착 여부로 코스 점수를 계산합니다.':assignment.intro,stops:route.nodes.map(id=>({node:data.nodes.find(n=>n.id===id),reason:savedCourse?'':assignment.reasons[id]}))};
}
