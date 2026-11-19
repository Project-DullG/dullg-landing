import type { Metadata } from "next";
import Image from "next/image";
import { DeckKeys } from "./deck-keys";
import s from "./deck.module.css";

export const metadata: Metadata = {
  title: "트위즈덤 소개",
  description: "한국 도시를 여행하며 푸는 추리 게임과 영어·한국어 수업 교구",
  robots: { index: false, follow: false },
};

const total = 11;

function Foot({ n }: { n: number }) {
  return (
    <footer className={s.foot} aria-hidden="true">
      <span>트위즈덤</span>
      <span>
        {n} / {total}
      </span>
    </footer>
  );
}

const visitors = [
  { year: "2023년", value: 420688, label: "42만 688명" },
  { year: "2024년", value: 511420, label: "51만 1,420명" },
  { year: "2025년", value: 543105, label: "54만 3,105명" },
  { year: "2026년 1~9월", value: 458107, label: "45만 8,107명", partial: true },
];

const works = [
  ["red-lab-cover.webp", "레드가 죽은 연구소"],
  ["gourmet-cover.webp", "미식의 대가"],
  ["doctor-cover.webp", "의사가 너무 많아!"],
  ["snake-carnival-cover.webp", "뱀이 죽은 축제"],
  ["slime-soda-cover.webp", "슬라임은 소다맛이 난다"],
  ["professor-rest-cover.webp", "교수님, 편히 쉬세요"],
  ["gray-girl-memory-cover.webp", "잿빛 소녀가 죽은 추억"],
] as const;

const cities = ["서울", "부산", "경주", "전주", "제주", "울릉도"];

export default function VietnamBriefing() {
  return (
    <main id="main-content" className={s.deck}>
      <DeckKeys />

      {/* 1 cover */}
      <section className={`${s.slide} ${s.cover}`} aria-label="표지">
        <div className={s.coverImage}>
          <Image src="/assets/briefing/cover.jpg" alt="탁자 위에 펼친 도시 카드 여섯 장과 여객선 표, 베트남식 연유커피" fill priority sizes="60vw" />
        </div>
        <div className={s.coverText}>
          <img className={s.logo} src="/assets/brand/twisdom-horizontal-black.svg" alt="트위즈덤" />
          <h1>
            한국 도시를
            <br />
            여행하며 푸는
            <br />
            추리 게임
          </h1>
          <p className={s.explain}>
            트위즈덤은 이성로, 김강훈 두 사람이 꾸리는 팀입니다. 한국 도시를 배경으로 한 관광용 추리 상자와 영어·한국어 수업에 쓰는 상자를 소개합니다.
          </p>
          <p className={s.byline}>2026년 11월 19일</p>
        </div>
      </section>

      {/* 2 team */}
      <section className={s.slide} aria-label="우리 팀">
        <div className={s.pad}>
          <h2>트위즈덤은 추리 게임 일곱 편을 만들었고, 수업을 네 번 했습니다</h2>
          <p className={s.explain}>
            실물 상자 여섯 편과 일본 앱 UZU에 실린 한 편을 만들었습니다. 세 번의 텀블벅 펀딩은 모두 목표를 달성했고, 수업은 울릉고와 울릉군, 온라인에서 했습니다.
          </p>
          <div className={s.teamGrid}>
            <div className={s.people}>
              <strong>이성로</strong>
              <strong>김강훈</strong>
            </div>
            <dl className={s.stats}>
              <div>
                <dt>만든 머더미스터리</dt>
                <dd>7편</dd>
              </div>
              <div>
                <dt>펀딩 3회 합계</dt>
                <dd>3,942만 6천 원</dd>
              </div>
              <div>
                <dt>게임·AI 수업</dt>
                <dd>4회</dd>
              </div>
              <div>
                <dt>브라우저 웹게임</dt>
                <dd>13개</dd>
              </div>
            </dl>
          </div>
          <ul className={s.shelf}>
            {works.map(([file, title]) => (
              <li key={file}>
                <Image src={`/assets/works/${file}`} alt={title} width={300} height={300} sizes="10vw" />
              </li>
            ))}
          </ul>
          <p className={s.note}>2025 RISE 창업경진대회 인기상, 울산 중구 청년디딤터 입주기업</p>
        </div>
        <Foot n={2} />
      </section>

      {/* 3 vietnam numbers */}
      <section className={s.slide} aria-label="베트남 숫자">
        <div className={s.pad}>
          <h2>베트남에는 한국 지방을 찾는 여행객과 한국어 수험생이 많습니다</h2>
          <p className={s.explain}>
            올해 1~9월 한국을 찾은 베트남 사람은 45만 8,107명으로 1년 전보다 10.6% 늘었습니다. 수도권 밖만 다녀간 비율은 28.0%로, 외국인 전체 18.3%보다 높습니다.
          </p>
          <div className={s.numbers}>
            <figure className={s.chart}>
              <figcaption>베트남 국적 방한객</figcaption>
              <ol>
                {visitors.map((v) => (
                  <li key={v.year} className={v.partial ? s.partial : undefined}>
                    <span className={s.value}>{v.label}</span>
                    <i style={{ height: `${(v.value / 560000) * 100}%` }} />
                    <span className={s.year}>{v.year}</span>
                  </li>
                ))}
              </ol>
            </figure>
            <ul className={s.facts}>
              <li>
                <b>28.0%</b>
                <span>수도권 밖만 다녀간 베트남 방한객. 외국인 전체는 18.3%입니다</span>
              </li>
              <li>
                <b>8만 5,896명</b>
                <span>2025년 베트남 TOPIK 지원자. 해외에서 가장 많습니다</span>
              </li>
            </ul>
          </div>
          <p className={s.note}>
            출처 한국관광공사 「2026 국가별 방한관광시장 분석」(2026.11), 문화체육관광부 보도자료(2026.10.27), 교육부·국립국제교육원(2026.2)
          </p>
        </div>
        <Foot n={3} />
      </section>

      {/* 4 concept */}
      <section className={s.slide} aria-label="관광 상자 구상">
        <div className={s.pad}>
          <h2>‘여섯 도시 추리 여행’(가제)은 도시마다 사건 하나를 푸는 게임입니다</h2>
          <p className={s.explain}>
            네 명이 45분 동안 그 도시의 음식, 길, 풍경이 적힌 단서로 사라진 물건을 찾습니다. 단서 카드에는 베트남어, 한국어, 영어를 함께 적습니다.
          </p>
          <figure className={s.cities}>
            <Image src="/assets/briefing/cities.jpg" alt="서울, 부산, 경주, 전주, 제주, 울릉도를 그린 도시 카드 여섯 장" width={2172} height={724} sizes="90vw" />
            <figcaption>
              {cities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </figcaption>
          </figure>
          <p className={s.note}>
            하노이와 호찌민에는 보드게임 카페가 20곳 넘게 있고, 취재 당시 가장 인기 있던 게임은 마피아류 ‘Ma Sói’였습니다. (VnExpress, 2024.7.12)
          </p>
        </div>
        <Foot n={4} />
      </section>

      {/* 5 ulleung case */}
      <section className={`${s.slide} ${s.caseSlide}`} aria-label="울릉도 예시 사건">
        <div className={s.caseImage}>
          <Image src="/assets/briefing/ulleung-case.jpg" alt="파도가 높은 날 울릉도 도동항 민박에 모인 여행자 넷과 빈 선반을 가리키는 주인 할머니" width={1672} height={941} sizes="62vw" />
        </div>
        <div className={s.sideText}>
          <h2>울릉도 편에서는 결항으로 민박에 묶인 네 명이 호박엿 상자를 찾습니다</h2>
          <p className={s.explain}>
            단서는 아래 네 장입니다. 카드 뒷면에는 그 장소로 가는 길과 먹을거리를 적습니다.
          </p>
          <ol className={s.clues}>
            <li>여객선 결항 안내문</li>
            <li>나리분지행 버스표</li>
            <li>오징어 덕장 사진</li>
            <li>민박 방 열쇠</li>
          </ol>
          <p className={s.note}>예시입니다. 실제 사건은 현지 의견을 듣고 정합니다.</p>
        </div>
        <Foot n={5} />
      </section>

      {/* 6 ulleung record */}
      <section className={s.slide} aria-label="울릉도 수업 기록">
        <div className={s.pad}>
          <h2>울릉도에서 관광과 지역 소재로 수업을 해 봤습니다</h2>
          <p className={s.explain}>
            7월 울릉군 생태관광 AI 교육에서는 관광 소재로 홍보 문구와 웹페이지를 만들었습니다. 9월 울릉고 특강에서는 게임을 해 본 뒤 지역 이야기를 기획했습니다.
          </p>
          <div className={s.record}>
            <figure>
              <Image src="/assets/activities/ulleung-ecotourism-ai-2026-07-04-class.jpg" alt="얼굴을 흐림 처리한 울릉군 생태관광 AI 교육 실습" width={1448} height={1086} sizes="30vw" />
              <figcaption>울릉군 생태관광 AI 교육, 2026년 7월 4일</figcaption>
            </figure>
            <figure>
              <Image src="/assets/activities/ulleung-high-2026-09-05-workshop.jpg" alt="얼굴을 흐림 처리한 울릉고 특강 모둠 활동" width={1448} height={1086} sizes="30vw" />
              <figcaption>울릉고 리빙랩 특강, 2026년 9월 5일</figcaption>
            </figure>
            <figure className={s.engine}>
              <Image src="/assets/academy-remake/cover.webp" alt="‘집에 가고 싶어!’ 규칙서 표지" width={944} height={1330} sizes="14vw" />
              <figcaption>교실용 추리 게임 ‘집에 가고 싶어!’. 도시판도 이 게임과 같은 틀로 만듭니다.</figcaption>
            </figure>
          </div>
        </div>
        <Foot n={6} />
      </section>

      {/* 7 glasses */}
      <section className={`${s.slide} ${s.glasses}`} aria-label="달라지는 시험">
        <div className={s.glassesImage}>
          <Image src="/assets/briefing/glasses.jpg" alt="OMR 답안지 위에 놓인 카메라 달린 스마트안경" fill sizes="45vw" />
        </div>
        <div className={s.glassesText}>
          <h2>시험장에서는 스마트안경을 막고, 일부 대학은 말로 실력을 확인합니다</h2>
          <p className={s.explain}>
            올해 중·고교 내신에서 스마트안경 부정행위 4건이 적발돼 모두 해당 과목 0점을 받았고, 오늘 수능은 스마트안경 반입을 금지했습니다.
          </p>
          <p className={s.explain}>
            서울시립대와 연세대 논술에서도 스마트안경을 쓴 수험생이 적발됐습니다. 영국과 호주의 일부 대학은 발표, 구술, 실습으로 실력을 평가합니다.
          </p>
          <p className={s.note}>출처 교육부(2026.11.9), 연합뉴스(2026.10.13), 영국 OfS(2026.11), 호주 TEQSA(2026.6)</p>
        </div>
        <Foot n={7} />
      </section>

      {/* 8 class */}
      <section className={s.slide} aria-label="영어 수업팩">
        <div className={s.pad}>
          <h2>영어 수업팩 ‘집에 가고 싶어!’는 단서를 맞춰 보며 생각을 고쳐 나가는 수업입니다</h2>
          <p className={s.explain}>
            초6~중1 학생이 4명씩 한 팀이 되어 4차시 동안 사건을 읽고 토론한 뒤 영어 보고서를 씁니다. 교사는 학생이 어떤 단서를 근거로 생각을 고치는지 지켜봅니다.
          </p>
          <div className={s.classGrid}>
            <ol className={s.steps}>
              <li>
                <b>1차시 읽기</b>
                <span>사건과 인물 소개를 읽고 단서를 기록지에 옮깁니다</span>
              </li>
              <li>
                <b>2차시 연결</b>
                <span>서로 질문하며 시간과 장소가 어긋나는 곳을 찾습니다</span>
              </li>
              <li>
                <b>3차시 토론</b>
                <span>친구의 추리에 근거를 묻고, 새 단서가 나오면 추리를 고칩니다</span>
              </li>
              <li>
                <b>4차시 보고</b>
                <span>최종 판단과 근거 두 가지를 영어 문장으로 씁니다</span>
              </li>
            </ol>
            <figure className={s.classPhoto}>
              <Image src="/assets/activities/ulleung-high-2026-09-19-workshop.webp" alt="얼굴을 흐림 처리한 울릉고 방문 특강 모둠 활동" width={1448} height={1086} sizes="34vw" />
              <figcaption>울릉고 방문 특강 3차시, 2026년 9월 19일</figcaption>
            </figure>
          </div>
          <p className={s.note}>
            지금은 파일럿을 준비하고 있습니다. 베트남 정부는 2030년까지 초등 1학년 영어를 필수 과목으로 정할 계획입니다(총리 결정 2371/QĐ-TTg, 2025.10.27).
          </p>
        </div>
        <Foot n={8} />
      </section>

      {/* 9 korean learners */}
      <section className={`${s.slide} ${s.korean}`} aria-label="한국어 교구">
        <div className={s.koreanText}>
          <h2>시제품 ‘사라진 왕의 도장’은 한국어로 묻고 답하며 푸는 궁궐 추리 게임입니다</h2>
          <p className={s.explain}>
            다섯 명이 60분 동안 한국어로 단서를 설명하며 풉니다. 수준은 TOPIK 2~3급에 맞췄습니다.
          </p>
          <p className={s.explain}>
            베트남에서는 2025년 169개 학교에서 3만 3,271명이 한국어를 배웠습니다. 2026년부터는 TOPIK 3급 이상으로 고교 졸업시험 외국어 과목을 대신할 수 있습니다.
          </p>
          <p className={s.note}>그림은 시안입니다. 출처 교육부·국립국제교육원(2026.2), 연합뉴스(2026.4.30)</p>
        </div>
        <div className={s.koreanImage}>
          <Image src="/assets/briefing/palace-box.jpg" alt="‘사라진 왕의 도장’ 상자와 인물 시트, 증거 카드 시안" fill sizes="45vw" />
        </div>
        <Foot n={9} />
      </section>

      {/* 10 three boxes */}
      <section className={s.slide} aria-label="세 가지 상자">
        <div className={s.pad}>
          <h2>세 상자 모두 카드를 나눠 들고 대화하며 풉니다</h2>
          <p className={s.explain}>
            관광용, 영어용, 한국어용 상자는 인원과 시간, 카드 언어가 다릅니다. 어느 상자든 각자 가진 단서를 말로 설명하고 서로 물어야 사건이 풀립니다.
          </p>
          <table className={s.table}>
            <thead>
              <tr>
                <th>상자</th>
                <th>쓰는 곳</th>
                <th>인원</th>
                <th>시간</th>
                <th>카드 언어</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Image src="/assets/briefing/cities.jpg" alt="" width={2172} height={724} sizes="8vw" />
                  여섯 도시 추리 여행(가제)
                </td>
                <td>여행, 보드게임 카페</td>
                <td>4명</td>
                <td>45분</td>
                <td>베트남어, 한국어, 영어</td>
              </tr>
              <tr>
                <td>
                  <Image src="/assets/academy-remake/cover.webp" alt="" width={944} height={1330} sizes="8vw" />
                  집에 가고 싶어!
                </td>
                <td>영어 수업</td>
                <td>4명</td>
                <td>40~50분</td>
                <td>한국어, 영어</td>
              </tr>
              <tr>
                <td>
                  <Image src="/assets/briefing/palace-box.jpg" alt="" width={1122} height={1402} sizes="8vw" />
                  사라진 왕의 도장(시제품)
                </td>
                <td>한국어 수업</td>
                <td>5명</td>
                <td>60분</td>
                <td>한국어</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Foot n={10} />
      </section>

      {/* 11 closing */}
      <section className={`${s.slide} ${s.ask}`} aria-label="이야기 나누고 싶은 것">
        <div className={s.askImage}>
          <Image src="/assets/briefing/cover.jpg" alt="" fill sizes="36vw" />
        </div>
        <div className={s.pad}>
          <h2>현지에서 지내며 보신 이야기를 듣고 싶습니다</h2>
          <p className={`${s.explain} ${s.askText}`}>
            한국에 다녀간 분들이 어떤 물건을 사 가는지, 학교와 학원에서 말하기 수업을 어떻게 하는지 궁금합니다. 카드에 베트남어만 적을지, 한국어와 영어를 함께 적을지도 여쭙고 싶습니다.
          </p>
          <div className={s.contact}>
            <img src="/assets/brand/twisdom-horizontal-black.svg" alt="트위즈덤" />
            <p>
              이성로, 김강훈
              <br />
              cluedullg@gmail.com
              <br />
              dullg-landing-one.vercel.app
            </p>
          </div>
        </div>
        <Foot n={11} />
      </section>
    </main>
  );
}
