import {art} from './illustration-map.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=(key,alt,cls='')=>`<img class="${cls}" src="${art(key)}" alt="${alt}">`;
const note=(title,text)=>`<aside class="rb-note"><b>${title}</b><p>${text}</p></aside>`;
const section=(n,title,body)=>`<section class="rb-section"><h3><span>${n}</span>${title}</h3>${body}</section>`;
const dice=n=>`<span class="rb-dice" aria-label="주사위 ${n}개">${Array.from({length:n},()=>'<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="1" y="1" width="26" height="26" rx="5" fill="currentColor"/><g fill="#faf7ef"><circle cx="8" cy="8" r="2"/><circle cx="20" cy="8" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></g></svg>').join('')}</span>`;
const steps=items=>`<ol class="rb-steps">${items.map(([title,body])=>`<li><b>${title}</b><p>${body}</p></li>`).join('')}</ol>`;
const page=(n,title,lead,body,cls='')=>`<article data-rule-page="${n}" class="b6-page rule-page rb-page ${cls}"><header><b>울릉마블 <span>/ 규칙서</span></b><span>${String(n).padStart(2,'0')} · ${['게임 소개','시작하기','차례 순서','이동 규칙','조우 카드','여행 목표','효과와 종료','점수표'][n-1]}</span></header><h2>${title}</h2>${lead?`<p class="rb-lead">${lead}</p>`:''}<div class="page-body rb-body">${body}</div><footer><span>ULLEUNG MARBLE</span><b>${String(n).padStart(2,'0')} / 08</b></footer></article>`;

export const MANUAL_TITLES=['울릉마블','여행 준비','내 차례, 다섯 단계','길을 고르고 이동하기','권역 카드를 읽는 법','여행 중 달성할 목표','효과 처리와 여행 종료','마지막 점수 계산'];

function movementDiagram(){return `<figure class="rb-movement"><figcaption><b>이동 예시</b><span>걷기에서 4가 나왔다면</span></figcaption><svg viewBox="0 0 420 116" role="img" aria-label="출발에서 해안을 따라 1, 2, 3, 4칸 중 한 곳에 멈춥니다. 2칸째에서 양방향 갈림길로 들어가도 한 칸씩 셉니다."><defs><marker id="rb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="#315d63"/></marker></defs><path d="M47 76H94 M131 76H178 M215 76H262 M299 76H346" fill="none" stroke="#315d63" stroke-width="3" marker-end="url(#rb-arrow)"/><path d="M196 58V28H280" fill="none" stroke="#ac8346" stroke-width="3" stroke-dasharray="5 4"/><g font-family="Nanum Gothic,sans-serif" text-anchor="middle" font-size="13" font-weight="bold"><circle cx="28" cy="76" r="20" fill="#234c57"/><text x="28" y="81" fill="#fff9ed">출발</text>${[1,2,3,4].map((n,i)=>`<rect x="${94+i*84}" y="58" width="37" height="37" rx="4" fill="#dbe8e4" stroke="#7caaa7"/><text x="${112.5+i*84}" y="81" fill="#234c57">${n}칸</text>`).join('')}<rect x="278" y="9" width="37" height="37" rx="4" fill="#eee2c8" stroke="#ac8346"/><text x="296.5" y="33" fill="#73572c">3칸</text></g><g fill="#536d6e" font-family="Nanum Gothic,sans-serif" font-size="11"><text x="11" y="115">실선 · 정한 방향으로</text><text x="210" y="7">점선 · 양방향</text></g></svg></figure>`;}

function regionDecks(d){return `<div class="rb-regions">${d.regions.map(r=>`<div style="--region:${r.color}"><i aria-hidden="true"></i><b>${esc(r.title)}</b><span>조우 10장</span></div>`).join('')}</div>`;}

export function manualPages(d){return [
 page(1,MANUAL_TITLES[0],'울릉도와 독도를 여행하는 보드게임',`
  ${image('port','울릉도 항구와 해안을 그린 수채화','rb-cover-art')}
  <div class="rb-facts"><span><b>4–8</b> 명</span><span><b>7</b> 라운드</span><span><b>50</b> 만원으로 시작</span></div>
  <section class="rb-purpose"><h3>가장 높은 여행 점수를 모으세요</h3><p>주사위로 길을 따라 이동하고, 도착한 권역의 카드를 뽑습니다. 두 선택 중 하나를 골라 풍경·체험·미식을 모으고 코스와 여행자 목표를 달성하세요.</p><p>남은 예산은 점수가 되고, 쌓인 피로는 감점됩니다. 7라운드 뒤 모든 점수를 합쳐 승자를 정합니다.</p></section>
  <div class="rb-contents">${MANUAL_TITLES.slice(1).map((t,i)=>`<div><b>${String(i+2).padStart(2,'0')}</b><span>${t}</span></div>`).join('')}</div>
 `,'rb-cover'),
 page(2,MANUAL_TITLES[1],'카드를 나누고, 타고 올 배를 고릅니다.',`
  ${section('01','가운데에 놓기',`<p>보드를 펴고 라운드 배를 <b>1</b>에 놓습니다. 조우 카드는 아래 다섯 권역별로 섞고, 옆에 버린 카드를 놓을 자리를 만듭니다.</p>${regionDecks(d)}<div class="rb-supply"><b>공급 카드</b><span>풍경 32 · 체험 40 · 미식 48 · 피로 32 · 일주 4장</span><small>종류별로 나누어 섞습니다. 달인 카드 3장은 따로 놓습니다.</small></div>`)}
  ${section('02','한 사람씩 준비하기',`<p>서로 다른 여행자북과 미플을 고르고 목표 두 가지를 공개합니다. 미플과 같은 색 예산 큐브를 모두 <b>50</b>에 놓습니다.</p><p>코스 24장을 섞어 각자 <b>2장씩</b> 받습니다. <b>1장</b>을 골라 공개하고, 쓰지 않는 코스는 상자에 넣습니다.</p>`)}
  ${section('03','배를 골라 출발 항구에 놓기',`<div class="rb-boats"><section><small>크루즈</small><h4>사동항 출발</h4><p>피로 <b>0장</b><br>첫 걷기 <b>주사위 1개</b></p>${dice(1)}</section><section><small>쾌속선</small><h4>도동항 출발</h4><p>피로 <b>1장 받기</b><br>첫 이동 <b>주사위 2개</b></p>${dice(2)}</section></div>`)}
  <p class="rb-bottom-note">순서를 정한 뒤 첫 사람부터 시작합니다. 출발 항구에 놓는 것만으로는 방문한 것으로 세지 않습니다.</p>
 `),
 page(3,MANUAL_TITLES[2],'한 사람의 차례를 모두 마친 뒤 다음 사람이 진행합니다.',`
  ${steps([
   ['이동 방법을 고릅니다','걷기 또는 택시를 고릅니다. 택시는 굴리기 전에 <b>1만원</b>을 내고 예산 큐브를 옮깁니다.'],
   ['주사위를 굴리고 이동합니다','걷기는 <b>1개</b>, 택시는 <b>2개</b>를 굴립니다. 나온 수의 합 이하로 <b>1칸 이상</b> 이동합니다. '],
   ['도착한 권역의 조우 1장을 뽑습니다','마지막에 멈춘 칸과 <b>같은 색 더미</b>에서 뽑습니다. 오른쪽 사람이 상황과 A/B를 모두 읽어 줍니다.'],
   ['A/B 중 하나를 고르고 처리합니다','조건을 확인하고 가능한 선택 하나를 고릅니다. 비용을 내고, 적힌 만큼 카드를 받거나 반납합니다.'],
   ['도착을 표시하고 차례를 넘깁니다','여행자북에 코스·권역 도착을 표시합니다. 쓴 조우는 버립니다. ‘다음 이동’ 효과가 있으면 자기 앞에 남겨 둡니다.']
  ])}
  <div class="rb-example"><small>한 차례의 예</small><h3>남쪽 해안에 도착해 ‘따개비밥’을 뽑았다면</h3><p>A를 고르면 <b>3만원 지출</b> 후 <b>미식 +3장 획득</b>.<br>예산이 50이었다면 큐브를 <b>47</b>로 옮깁니다.</p></div>
  <p class="rb-bottom-note"><b>모두 한 차례씩 마치면 1라운드가 끝납니다.</b><br>라운드 배를 한 칸 옮기고 같은 순서로 진행합니다.</p>
 `),
 page(4,MANUAL_TITLES[3],'장소 하나가 1칸입니다. 연결된 선을 따라 이동합니다.',`
  ${movementDiagram()}
  <div class="rb-two-col rb-path-rules"><section><h3>해안길 · 실선</h3><p>첫 이동 전에 시계 또는 반시계 방향을 정합니다. 이후 해안에서는 그 방향을 유지합니다.</p></section><section><h3>갈림길 · 점선</h3><p>양방향으로 이동합니다. 한 번의 이동 중 같은 칸을 다시 지나거나 출발한 칸으로 돌아갈 수 없습니다.</p></section></div>
  ${note('멈출 곳은 직접 고릅니다','4가 나오면 1~4칸 중 한 곳에 멈춥니다. 중간 칸에서는 조우를 뽑거나 방문을 표시하지 않습니다. 번호가 이어져도 연결선이 없으면 바로 갈 수 없습니다.')}
  <div class="rb-transport"><section>${dice(1)}<div><h3>걷기 <small>비용 없음</small></h3><p>해안길과 갈림길을 모두 이용합니다.</p></div></section><section>${dice(2)}<div><h3>택시 <small>1만원</small></h3><p>해안 칸에서만 출발하며 해안길로만 갑니다. 갈림길에서는 탈 수 없습니다.</p></div></section></div>
  <p class="rb-bottom-note">쾌속선의 첫 이동이나 카드 효과로 2개를 굴려도 이동 방법은 그대로입니다. 택시와 겹쳐도 주사위는 <b>최대 2개</b>입니다.</p>
 `),
 page(5,MANUAL_TITLES[4],'상황 → 선택 조건 → 결과 → 비용·보상 순서로 읽습니다.',`
  <div class="rb-encounter-example"><div class="rb-card-head">${image('dokdo','독도 삽화')}<div><small>항구와 산책 · 조우 예시</small><h3>독도행 승선 안내</h3><p>배를 탈지 주변을 둘러볼지 고릅니다.</p></div></div><div class="rb-choice"><div class="rb-condition">A 선택 조건 · 저동항 / 예산 6만원 이상</div><h4><span>A</span> 독도에 다녀온다</h4><p>배를 타고 독도를 둘러본 뒤 같은 항구로 돌아왔다.</p><strong>예산 6만원 지출<br>풍경 +1장 획득 · 체험 +1장 획득</strong></div><div class="rb-choice"><h4><span>B</span> 주변 풍경을 본다</h4><p>배에 오르지 않고 주변 풍경을 사진에 담았다.</p><strong>풍경 +1장 획득</strong></div></div>
  <div class="rb-reading-rules"><p><b>둘 다 읽고 하나만 선택합니다.</b> 차례인 사람도 카드 앞면을 볼 수 있습니다. 조건을 충족하지 못한 선택은 고를 수 없습니다.</p><p><b>독도행은 카드에 적힌 항구에서만.</b> 이 카드를 도동항에서 뽑았다면 A는 고를 수 없습니다. 사동항 출항은 남쪽 해안의 독도 조우로 처리합니다.</p><p><b>독도 방문 후에는 같은 항구로 돌아옵니다.</b> 미플을 독도에 놓았다가 출항한 항구로 돌려놓습니다. 추가 조우는 뽑지 않습니다.</p></div>
  ${note('풍경·체험·미식은 선택한 결과로 받습니다','장소에 도착했다고 바로 받지 않습니다. 받은 카드의 ‘울릉도 풍경·체험·미식 정보’는 소개 글이며, 추가 보상이나 행동 지시가 아닙니다.')}
 `,'rb-encounter-page'),
 page(6,MANUAL_TITLES[5],'이동을 마친 곳만 표시합니다. 출발·통과는 세지 않습니다.',`
  <section class="rb-lap"><div class="rb-goal-heading"><div><small>일주 카드 · 총 4장</small><h3>다섯 권역을 방문하고 항구로</h3></div><b>7<span>점</span></b></div><div class="rb-check-regions">${d.regions.map(r=>`<span style="--region:${r.color}"><i>✓</i>${esc(r.title)}</span>`).join('')}</div><div class="rb-port-return"><span>다섯 권역 모두 도착</span><b>↓</b><strong>사동항 · 도동항 · 저동항 중 한 곳에 도착</strong></div><p>조건을 채우면 <b>일주 +1장 획득</b>. 마지막 권역의 도착지가 항구라면 그 자리에서 받습니다.</p><div class="rb-lap-limit"><b>1인 1회</b><span>먼저 조건을 채운 4명까지 받습니다.<br>방문 기록은 지우지 않고 끝까지 유지합니다.</span></div></section>
  ${section('01','코스 카드의 세 장소',`<p>방문 순서는 자유입니다. 도착한 장소를 여행자북에 표시하고, 게임이 끝나면 <b>도착한 수에 해당하는 점수 하나</b>를 받습니다.</p><div class="rb-course-score"><span>1곳 <b>2점</b></span><span>2곳 <b>4점</b></span><span>3곳 <b>8점</b></span></div>`)}
  ${section('02','여행자마다 다른 목표 두 가지',`<p>게임이 끝났을 때 여행자북의 조건을 확인합니다. <b>달성한 목표마다 3점</b>입니다. 코스·일주와 겹쳐도 각각 점수를 받습니다.</p>`)}
  <p class="rb-bottom-note">일주 카드 4장이 모두 나가면 추가 지급하지 않습니다. ‘일주 카드 보유’가 목표라면 실제로 카드를 받아야 달성한 것입니다.</p>
 `,'rb-goals-page'),
 page(7,MANUAL_TITLES[6],'선택한 카드의 효과를 먼저 처리한 뒤 차례를 마칩니다.',`
  <div class="rb-effect-list"><section><h3>다음 이동에 적용하는 효과</h3><p><b>이동 +1:</b> 주사위 1개를 굴렸을 때만 1을 더합니다. 최대 6칸이며, 2개를 굴릴 때는 더하지 않습니다.<br><b>주사위 2개:</b> 다음 이동에서 주사위 2개를 굴립니다.</p><p>해당 조우를 자기 앞에 두고 다음 이동에 적용한 뒤 버립니다. <b>7라운드에는 다음 이동 효과 대신 체험 +1장</b>을 받습니다.</p></section>
  <section><h3>피로와 회복</h3><p>피로는 <b>최대 4장</b>입니다. ‘피로 −1장’이면 공급 더미에 1장을 반납합니다. 피로가 0장이면 대신 <b>체험 +1장</b>을 받습니다.</p></section>
  <section><h3>A/B 중 고를 수 있는 선택이 없다면</h3><p>예산·장소 조건을 못 채우거나, 필요한 공급 카드가 부족하거나, 피로가 4장을 넘는 선택은 고를 수 없습니다. 둘 다 불가능하면 그 조우를 버리고 같은 권역에서 다시 뽑습니다.</p><p>조우 더미가 비면 같은 권역의 버린 카드를 섞습니다. 10장을 확인해도 고를 수 없다면 <b>피로 1장을 반납</b>하거나 <b>남아 있는 풍경·체험·미식 중 1장</b>을 받습니다. 둘 다 불가능하면 차례를 마칩니다.</p></section>
  <section><h3>예산이 0이어도 계속 진행합니다</h3><p><b>걷기와 비용 없는 선택</b>은 할 수 있습니다. 택시나 예산을 내는 선택은 고를 수 없습니다. 남은 차례도 평소처럼 진행합니다.</p></section></div>
  <div class="rb-end"><h3>7라운드의 마지막 차례까지 진행합니다</h3><p>마지막 사람의 이동·카드 처리까지 마치면 게임을 끝내고 8쪽에 따라 점수를 계산합니다. <b>예산이 0이라는 이유로 게임이 끝나거나 차례를 건너뛰지 않습니다.</b></p></div>
 `,'rb-effects-page'),
 page(8,MANUAL_TITLES[7],'아래 점수를 모두 합칩니다. 가장 높으면 승리합니다.',`
  <table class="rb-score-table"><thead><tr><th>점수 항목</th><th>계산 방법</th></tr></thead><tbody>
   <tr><td>풍경</td><td><b>1장</b>마다 <b>1점</b></td></tr><tr><td>체험 · 미식</td><td>체험은 <b>2장</b>마다, 미식은 <b>3장</b>마다 <b>1점</b></td></tr>
   <tr><td>여행자 목표</td><td>달성한 목표마다 <b>3점</b> · 최대 6점</td></tr><tr><td>여행코스</td><td>도착 1 / 2 / 3곳 → <b>2 / 4 / 8점</b></td></tr>
   <tr><td>일주</td><td>일주 카드 보유 시 <b>7점</b> · 1인 1회</td></tr><tr><td>남은 예산</td><td><b>5만원</b>마다 <b>1점</b></td></tr><tr><td>피로</td><td>0 / 1 / 2 / 3 / 4장<br><b>0 / −1 / −3 / −6 / −10점</b></td></tr><tr><td>항구에서 종료</td><td>마지막 위치가 사동항·도동항·저동항이면 <b>3점</b></td></tr>
  </tbody></table>
  <section class="rb-leaders"><h3>여행 달인 보너스</h3><table><thead><tr><th>최다 보유 기록</th><th>풍경</th><th>체험</th><th>미식</th></tr></thead><tbody><tr><td>단독 최다</td><td><b>3점</b></td><td><b>5점</b></td><td><b>8점</b></td></tr><tr><td>공동 최다 · 각자</td><td><b>2점</b></td><td><b>3점</b></td><td><b>4점</b></td></tr></tbody></table><p>단독 최다는 달인 카드를 받습니다. 공동 최다는 카드 없이 각자 점수를 받으며, 모두 0장이면 0점입니다.</p></section>
  <div class="rb-example rb-score-example"><small>항구 점수는 마지막 위치만 확인합니다</small><p>점수 계산 때 미플이 세 항구 중 한 곳에 있으면 <b>한 번만 3점</b>입니다. 도중에 항구를 방문했어도 마지막 위치가 성인봉이면 <b>0점</b>입니다.</p></div>
  <p class="rb-bottom-note">체험 5장 → 2점 / 예산 14만원 → 2점. 나머지는 버림합니다.<br><b>최다 보유는 전체 카드 수로 비교. 최종 동점은 공동 승리.</b></p>
 `,'rb-score-page')];}

// The box preview uses the same title, artwork and palette as page 1.
export function manualCoverSVG(){return `<svg xmlns="http://www.w3.org/2000/svg" width="128mm" height="182mm" viewBox="0 0 512 728"><rect width="512" height="728" fill="#faf7ef"/><path d="M36 60H476" stroke="#315761" stroke-width="1.3"/><g fill="#284d57" font-family="Nanum Gothic,sans-serif"><text x="36" y="45" font-size="12">울릉마블 / 규칙서</text><text x="476" y="45" text-anchor="end" font-size="12">01 · 게임 소개</text><text x="36" y="133" font-family="Nanum Myeongjo,serif" font-weight="bold" font-size="55">울릉마블</text><text x="36" y="171" font-size="17">울릉도와 독도를 여행하는 보드게임</text></g><image href="${art('port')}" x="36" y="192" width="440" height="253" preserveAspectRatio="xMidYMid slice"/><rect x="36" y="445" width="440" height="48" fill="#284d57"/><text x="256" y="475" fill="#fbf6e9" font-family="Nanum Gothic,sans-serif" font-size="16" text-anchor="middle">4–8명  /  7라운드  /  50만원으로 시작</text><g fill="#284d57" font-family="Nanum Gothic,sans-serif"><text x="36" y="543" font-size="22" font-weight="bold">가장 높은 여행 점수를 모으세요</text><text x="36" y="582" font-size="16">길을 따라 이동하고 권역의 카드를 뽑습니다.</text><text x="36" y="609" font-size="16">두 선택 중 하나를 골라 여행을 이어 갑니다.</text><path d="M36 665H476" stroke="#adbbb1"/><text x="36" y="692" font-size="11" letter-spacing="2">ULLEUNG MARBLE</text><text x="476" y="692" text-anchor="end" font-size="11">01 / 08</text></g></svg>`;}
