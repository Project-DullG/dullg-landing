// Cover copy is condensed from each traveler's existing first-person story.
export const TRAVELER_COVERS=[
 {color:'#315e68',heading:'내가 고른 첫 여행',intro:'첫 출근까지 닷새가 비었다. 이번에는 배편부터 갈 곳까지 직접 정하고, 내가 가보고 싶었던 곳에 가기로 했다.'},
 {color:'#a47c40',heading:'나흘의 휴가를 내고',intro:'일을 동료에게 넘기고 나흘 휴가를 냈다. 배 시간을 먼저 확인하고, 돌아오는 날까지 무리 없이 다닐 코스를 골랐다.'},
 {color:'#687867',heading:'쉬어 가며 걷기로 했다',intro:'지난 여행에서는 발이 아픈데도 끝까지 걸었다. 이번에는 일정에서 두 곳을 빼고, 앉아서 쉴 시간을 남겨두었다.'},
 {color:'#a16847',heading:'이번에는 남이 차려준 한 끼',intro:'가게 공사로 사흘 동안 오븐을 돌릴 수 없게 됐다. 울릉도에서 먹고 싶은 음식을 적고, 다니는 길에서 한 집씩 들르기로 했다.'},
 {color:'#7b6570',heading:'사진을 찍기 전에',intro:'아이를 기숙사에 보내고 미뤄둔 여행을 골랐다. 이번에는 카메라를 먼저 들지 않고, 항구와 숲길을 오래 들여다보고 싶었다.'},
 {color:'#586d7a',heading:'내 발로 걸어본 길',intro:'몇 해째 미뤘던 성인봉 산행 날짜를 잡았다. 산길과 해안길을 나눠 걷고, 다음 날에도 걸을 힘을 남겨두기로 했다.'},
 {color:'#798058',heading:'계획을 바꿀 여유도 챙겼다',intro:'동생이 배편을 알아보고, 나는 숙소와 길을 찾았다. 보고 싶은 곳이 달라지면 함께 고를 수 있도록 돈과 시간을 남겨두었다.'},
 {color:'#89755e',heading:'이번에는 창밖을 볼 차례',intro:'삼십 년 넘게 시내버스를 몰다 퇴직했다. 이번에는 운전대를 잡지 않고, 울릉도 해안길을 따라 마을마다 내려 걸어보고 싶었다.'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function lines(s,max=26){const out=[];let line='',units=0;for(const word of s.split(' ')){const width=[...word].reduce((a,c)=>a+(/[\x00-\x7f]/.test(c)?.55:1),0);if(line&&units+.55+width>max){out.push(line);line=word;units=width;}else{line+=(line?' ':'')+word;units+=(line===word?0:.55)+width;}}if(line)out.push(line);return out;}
export const portraitURL=c=>`/ulleung-marble/assets/v07/portraits/traveler-${c.id}.jpg`;
export function travelerCoverSVG(c,portrait=portraitURL(c)){
 const design=TRAVELER_COVERS[c.id],id='traveler-portrait-'+c.id;
 const body=lines(design.intro),job=`${c.age}세 · ${c.job}`;
 if(body.length>4)throw new Error('Traveler cover text exceeds four lines: '+c.name);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="128mm" height="182mm" viewBox="0 0 512 728" role="img" aria-labelledby="${id}-title ${id}-desc">
 <title id="${id}-title">${esc(c.name)} 여행자북 표지</title><desc id="${id}-desc">${esc(job)}. ${esc(design.heading)}. ${esc(design.intro)}</desc>
 <defs><clipPath id="${id}"><path d="M90 394V238a166 166 0 0 1 332 0v156Z"/></clipPath></defs>
 <rect width="512" height="728" fill="#faf6ec"/><path d="M0 0H12V728H0Z" fill="${design.color}"/>
 <rect x="28" y="20" width="466" height="688" rx="3" fill="none" stroke="${design.color}" stroke-opacity=".32"/>
 <g fill="${design.color}" font-family="Nanum Gothic,sans-serif"><text x="48" y="48" font-size="10" letter-spacing="2.1">ULLEUNG MARBLE</text><text x="471" y="48" text-anchor="end" font-size="12">여행자 ${String(c.id+1).padStart(2,'0')}</text></g>
 <path d="M80 391V238a176 176 0 0 1 352 0v153" fill="none" stroke="${design.color}" stroke-opacity=".35"/>
 <image href="${portrait}" x="90" y="62" width="332" height="332" clip-path="url(#${id})"/>
 <path d="M62 394H450" stroke="${design.color}" stroke-width="2"/>
 <g text-anchor="middle" fill="${design.color}"><text x="256" y="446" font-size="43" letter-spacing="4" font-weight="700" font-family="Nanum Myeongjo,AppleMyungjo,serif">${esc(c.name)}</text><text x="256" y="475" font-size="14" font-family="Nanum Gothic,sans-serif">${esc(job)}</text></g>
 <path d="M48 497H471" stroke="#c6bc9f"/>
 <g fill="#263f41"><text x="48" y="529" font-size="22" font-weight="700" font-family="Nanum Myeongjo,AppleMyungjo,serif">${esc(design.heading)}</text>
 ${body.map((s,i)=>`<text x="48" y="${559+i*26}" font-size="16" font-family="Nanum Gothic,sans-serif">${esc(s)}</text>`).join('')}</g>
 <path d="M48 669H471" stroke="#c6bc9f"/><g fill="${design.color}" font-family="Nanum Gothic,sans-serif" font-size="11"><text x="48" y="692">울릉도 · 독도</text><text x="471" y="692" text-anchor="end">여행자북 · 공개 소개</text></g></svg>`;
}
