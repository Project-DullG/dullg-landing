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

function Tag({ n }: { n: number }) {
  return (
    <span className={s.tag} aria-hidden="true">
      <b>{String(n).padStart(2, "0")}</b>
      <i>/ {total}</i>
    </span>
  );
}

const visitors = [
  { year: "2023", value: 420688, label: "42만 688명" },
  { year: "2024", value: 511420, label: "51만 1,420명" },
  { year: "2025", value: 543105, label: "54만 3,105명" },
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

      {/* 01 cover */}
      <section className={`${s.slide} ${s.cover}`} aria-label="표지">
        <div className={s.coverImage}>
          <Image src="/assets/briefing/cover.jpg" alt="탁자 위에 펼친 도시 카드 여섯 장과 여객선 표, 베트남식 연유커피" fill priority sizes="60vw" />
        </div>
        <div className={s.coverText}>
          <img className={s.logo} src="/assets/brand/twisdom-horizontal-black.svg" alt="트위즈덤" />
          <p className={s.kicker}>트위즈덤 소개</p>
          <h1>
            한국 도시를
            <br />
            여행하며 푸는
            <br />
            추리 게임
          </h1>
          <p className={s.lead}>
            관광용 상자와
            <br />
            영어·한국어 수업 교구를 소개합니다
          </p>
          <p className={s.byline}>트위즈덤 · 이성로 · 김강훈 · 2026. 11. 19.</p>
        </div>
        <Tag n={1} />
      </section>

      {/* 02 team */}
      <section className={s.slide} aria-label="우리 팀">
        <div className={s.pad}>
          <p className={s.kicker}>우리 팀</p>
          <h2>추리 게임을 만들고, 그 게임으로 수업합니다</h2>
          <div className={s.teamGrid}>
            <div className={s.people}>
              <span className={s.peopleLabel}>트위즈덤 두 사람</span>
              <strong>이성로</strong>
              <strong>김강훈</strong>
              <p>둘이 함께 게임을 기획하고, 수업에도 직접 들어갑니다.</p>
            </div>
            <dl className={s.stats}>
              <div>
                <dt>직접 만든 머더미스터리</dt>
                <dd>7편</dd>
                <small>실물 상자 6편, 일본 앱 UZU 수록 1편</small>
              </div>
              <div>
                <dt>텀블벅 펀딩 3회, 모두 목표 달성</dt>
                <dd>3,942만 6천 원</dd>
                <small>세 번의 펀딩 합계</small>
              </div>
              <div>
                <dt>게임·AI로 진행한 수업</dt>
                <dd>4회</dd>
                <small>울릉고, 울릉군, 온라인</small>
              </div>
              <div>
                <dt>브라우저 웹게임</dt>
                <dd>13개</dd>
                <small>사이트에서 바로 플레이</small>
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
          <p className={s.foot}>2025 RISE 창업경진대회 인기상 · 울산 중구 청년디딤터 입주기업</p>
        </div>
        <Tag n={2} />
      </section>

      {/* 03 vietnam numbers */}
      <section className={s.slide} aria-label="베트남 숫자">
        <div className={s.pad}>
          <p className={s.kicker}>베트남에서 본 숫자</p>
          <h2>베트남에는 한국을 찾고 한국어를 배우는 사람이 많습니다</h2>
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
              <p>국가별 방한객 순위 2025년 7위. 2026년 1~9월은 1년 전보다 10.6% 늘었습니다.</p>
            </figure>
            <ul className={s.facts}>
              <li>
                <b>28.0%</b>
                <span>수도권 밖만 다녀간 베트남 방한객 비율. 외국인 전체는 18.3%</span>
              </li>
              <li>
                <b>8만 5,896명</b>
                <span>2025년 베트남 TOPIK 지원자. 해외 1위</span>
              </li>
              <li>
                <b>2030년</b>
                <span>초등 1학년부터 영어를 필수 과목으로 넣는 것이 베트남 정부 목표 (2025.10 결정)</span>
              </li>
              <li>
                <b>20곳 이상</b>
                <span>하노이·호찌민 보드게임 카페. 가장 인기 있던 게임은 마피아류 ‘Ma Sói’</span>
              </li>
            </ul>
          </div>
          <p className={s.source}>
            출처 한국관광공사 「2026 국가별 방한관광시장 분석」(2026.11) · 문화체육관광부 보도자료(2026.10.27) · 교육부·국립국제교육원(2026.2) · 베트남 총리 결정 2371/QĐ-TTg(2025.10.27) · VnExpress(2024.7.12)
          </p>
        </div>
        <Tag n={3} />
      </section>

      {/* 04 concept */}
      <section className={s.slide} aria-label="제안 하나">
        <div className={s.pad}>
          <p className={s.kicker}>구상 중인 상자 · 관광</p>
          <h2>도시마다 사건을 하나씩 만듭니다</h2>
          <p className={s.name}>
            「여섯 도시 추리 여행」<em>가제</em>
            <span lang="vi">Hành trình phá án: 6 thành phố Hàn Quốc</span>
          </p>
          <figure className={s.cities}>
            <Image src="/assets/briefing/cities.jpg" alt="서울, 부산, 경주, 전주, 제주, 울릉도를 그린 도시 카드 여섯 장" width={2172} height={724} sizes="90vw" />
            <figcaption>
              {cities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </figcaption>
          </figure>
          <ul className={s.three}>
            <li>네 사람이 여행자가 되어 45분 동안 사라진 물건 하나를 찾습니다</li>
            <li>그 도시의 음식, 길, 풍경이 단서로 나옵니다. 게임을 하면서 가 볼 곳을 알게 됩니다</li>
            <li>단서 카드는 베트남어·한국어·영어 세 줄로 인쇄합니다</li>
          </ul>
        </div>
        <Tag n={4} />
      </section>

      {/* 05 ulleung case */}
      <section className={`${s.slide} ${s.caseSlide}`} aria-label="예시 사건">
        <div className={s.caseImage}>
          <Image src="/assets/briefing/ulleung-case.jpg" alt="파도가 높은 날 울릉도 도동항 민박에 모인 여행자 넷과 빈 선반을 가리키는 주인 할머니" width={1672} height={941} sizes="62vw" />
          <p>카드 뒷면에는 그 장소에 가는 길과 먹어 볼 것을 적습니다.</p>
        </div>
        <div className={s.splitText}>
          <p className={s.kicker}>예시 사건</p>
          <h2>
            울릉도에서
            <br />
            배가 뜨지 않은 날
          </h2>
          <p>
            파도가 높아 여객선이 뜨지 못합니다. 도동항 민박에 발이 묶인 여행자 넷. 주인 할머니가 아끼던 호박엿 상자가 사라졌습니다.
          </p>
          <ol className={s.clues}>
            <li>여객선 결항 안내문</li>
            <li>나리분지행 버스표</li>
            <li>오징어 덕장 사진</li>
            <li>민박 방 열쇠</li>
          </ol>
          <p className={s.note}>실제 사건은 현지 의견을 듣고 정합니다.</p>
        </div>
        <Tag n={5} />
      </section>

      {/* 06 ulleung record */}
      <section className={s.slide} aria-label="울릉도 기록">
        <div className={s.pad}>
          <p className={s.kicker}>이미 해 본 일</p>
          <h2>울릉도에서 관광 소재로 수업했습니다</h2>
          <div className={s.record}>
            <figure>
              <Image src="/assets/activities/ulleung-ecotourism-ai-2026-07-04-class.jpg" alt="얼굴을 흐림 처리한 울릉군 생태관광 AI 교육 실습" width={1448} height={1086} sizes="30vw" />
              <figcaption>
                <time>2026.07.04</time>
                <strong>울릉군 생태관광 AI 교육</strong>
                <span>관광 소재를 골라 홍보 문구를 쓰고 웹페이지를 만들었습니다</span>
              </figcaption>
            </figure>
            <figure>
              <Image src="/assets/activities/ulleung-high-2026-09-05-workshop.jpg" alt="얼굴을 흐림 처리한 울릉고 특강 모둠 활동" width={1448} height={1086} sizes="30vw" />
              <figcaption>
                <time>2026.09.05</time>
                <strong>울릉고 리빙랩 특강</strong>
                <span>게임을 해 보고, 지역 소재로 이야기를 기획했습니다</span>
              </figcaption>
            </figure>
            <aside className={s.engine}>
              <Image src="/assets/academy-remake/cover.webp" alt="「집에 가고 싶어!」 규칙서 표지" width={944} height={1330} sizes="14vw" />
              <div>
                <strong>「집에 가고 싶어!」</strong>
                <span>4인 · 40~50분 · 한국어·영어 단서</span>
                <p>이미 만든 교실용 추리 게임입니다. 도시판도 같은 틀로 만듭니다.</p>
              </div>
            </aside>
          </div>
        </div>
        <Tag n={6} />
      </section>

      {/* 07 glasses */}
      <section className={`${s.slide} ${s.glasses}`} aria-label="제안 둘">
        <div className={s.glassesImage}>
          <Image src="/assets/briefing/glasses.jpg" alt="OMR 답안지 위에 놓인 카메라 달린 스마트안경" fill sizes="45vw" />
        </div>
        <div className={s.glassesText}>
          <p className={s.kicker}>교실에서 쓰는 상자</p>
          <h2>
            오늘 수능 시험장에
            <br />
            스마트안경은
            <br />
            가지고 갈 수 없습니다
          </h2>
          <ul>
            <li>
              올해 중·고교 내신에서 스마트안경 부정행위 4건. 모두 해당 과목 0점 <small>교육부, 2026.11.9</small>
            </li>
            <li>
              서울시립대·연세대 논술에서 스마트안경을 쓴 수험생 적발 <small>연합뉴스, 2026.10.13</small>
            </li>
            <li>
              영국·호주 대학은 발표·구술·실습으로 본인 실력을 확인하는 방식을 늘리고 있습니다 <small>OfS 2026.11 · TEQSA 2026.6</small>
            </li>
          </ul>
          <p className={s.punch}>외운 답은 안경으로 찾아볼 수 있어도, 그 자리에서 묻고 답하는 건 대신 못 합니다.</p>
        </div>
        <Tag n={7} />
      </section>

      {/* 08 class */}
      <section className={s.slide} aria-label="수업">
        <div className={s.pad}>
          <p className={s.kicker}>영어 미스터리 수업팩 「집에 가고 싶어!」</p>
          <h2>학생이 새 단서를 보고 생각을 고치는 과정을 봅니다</h2>
          <div className={s.classGrid}>
            <ol className={s.steps}>
              <li>
                <b>01 읽기</b>
                <span>사건과 인물 소개를 읽고, 카드의 사실과 단서를 기록지에 옮깁니다</span>
              </li>
              <li>
                <b>02 연결</b>
                <span>서로 질문하며 시간·장소·인물의 말을 맞춰 보고, 어긋나는 곳을 표시합니다</span>
              </li>
              <li>
                <b>03 토론</b>
                <span>친구의 추리에 근거를 묻고, 새 단서가 나오면 판단을 고칩니다</span>
              </li>
              <li>
                <b>04 보고</b>
                <span>최종 판단과 근거 두 가지를 영어 문장으로 써서 팀 보고서를 냅니다</span>
              </li>
            </ol>
            <div className={s.watch}>
              <Image src="/assets/academy-remake/card-front.webp" alt="한영 단서 카드" width={600} height={840} sizes="12vw" />
              <div>
                <strong>교사가 보는 것</strong>
                <ul>
                  <li>누가 어떤 질문을 했는지</li>
                  <li>어떤 단서를 근거로 댔는지</li>
                  <li>새 단서가 나왔을 때 판단을 어떻게 고쳤는지</li>
                </ul>
              </div>
            </div>
            <figure className={s.classPhoto}>
              <Image src="/assets/activities/ulleung-high-2026-09-19-workshop.webp" alt="얼굴을 흐림 처리한 울릉고 방문 특강 모둠 활동" width={1448} height={1086} sizes="34vw" />
              <figcaption>울릉고 방문 특강 3차시 · 2026.09.19</figcaption>
            </figure>
          </div>
          <p className={s.foot}>대상 초6~중1 · 4~16명(4명 1팀) · 4차시 · 파일럿 준비 중</p>
        </div>
        <Tag n={8} />
      </section>

      {/* 09 korean learners */}
      <section className={`${s.slide} ${s.split} ${s.splitReverse}`} aria-label="한국어 교구">
        <div className={s.splitText}>
          <p className={s.kicker}>한국어 학습자용</p>
          <h2>
            한국어로 묻고 설명해야
            <br />
            풀리는 궁궐 추리
          </h2>
          <p>
            「사라진 왕의 도장」 시제품
            <br />
            5인 1모둠 · 60분 · TOPIK 2~3급
          </p>
          <ul className={s.mini}>
            <li>
              <b>169개교 3만 3,271명</b>
              <span>2025년 베트남 초·중·고 한국어 수업</span>
            </li>
            <li>
              <b>TOPIK 3급 이상</b>
              <span>2026년부터 고교 졸업시험 외국어 과목을 대신할 수 있습니다</span>
            </li>
          </ul>
          <p className={s.note}>시제품 시안 그림입니다. 출처 교육부·국립국제교육원(2026.2), 연합뉴스(2026.4.30)</p>
        </div>
        <div className={s.splitImage}>
          <Image src="/assets/briefing/palace-box.jpg" alt="「사라진 왕의 도장」 상자와 인물 시트, 증거 카드 시안" fill sizes="45vw" />
        </div>
        <Tag n={9} />
      </section>

      {/* 10 routes */}
      <section className={s.slide} aria-label="베트남에서 갈 길">
        <div className={s.pad}>
          <p className={s.kicker}>세 가지 상자</p>
          <h2>상자는 관광·영어·한국어 세 가지입니다</h2>
          <div className={s.routes}>
            <article>
              <Image src="/assets/briefing/cover.jpg" alt="" width={1672} height={941} sizes="28vw" />
              <b>관광</b>
              <strong>「여섯 도시 추리 여행」</strong>
              <span>4인 · 45분 · 도시 단서</span>
            </article>
            <article>
              <Image src="/assets/going-home-scenes/classroom-play.webp" alt="" width={1600} height={900} sizes="28vw" />
              <b>영어</b>
              <strong>「집에 가고 싶어!」</strong>
              <span>4인 · 40~50분 · 한국어·영어 단서</span>
            </article>
            <article>
              <Image src="/assets/briefing/palace-box.jpg" alt="" width={1122} height={1402} sizes="28vw" className={s.topCrop} />
              <b>한국어</b>
              <strong>「사라진 왕의 도장」</strong>
              <span>5인 · 60분 · TOPIK 2~3급</span>
            </article>
          </div>
          <p className={s.common}>세 상자 모두 단서 카드를 나눠 들고, 서로 묻고 답하며 풉니다.</p>
        </div>
        <Tag n={10} />
      </section>

      {/* 11 closing */}
      <section className={`${s.slide} ${s.ask}`} aria-label="이야기 나누고 싶은 것">
        <div className={s.askImage}>
          <Image src="/assets/briefing/cover.jpg" alt="" fill sizes="36vw" />
        </div>
        <div className={s.pad}>
          <p className={s.kicker}>이야기 나누고 싶은 것</p>
          <h2>베트남 이야기가 궁금합니다</h2>
          <ol className={s.questions}>
            <li>한국에 다녀간 분들은 어떤 기념품을 사 가나요</li>
            <li>학교와 학원에서는 말하기 수업을 어떻게 하나요</li>
            <li>카드 글자는 베트남어만 적는 편이 읽기 쉬울까요, 한국어·영어를 같이 적는 편이 좋을까요</li>
          </ol>
          <div className={s.contact}>
            <img src="/assets/brand/twisdom-horizontal-black.svg" alt="트위즈덤" />
            <p>
              이성로 · 김강훈
              <br />
              cluedullg@gmail.com · dullg-landing-one.vercel.app
            </p>
          </div>
        </div>
        <Tag n={11} />
      </section>
    </main>
  );
}
