import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Clock,
  FileText,
  FolderOpen,
  GraduationCap,
  MagnifyingGlass,
  Printer,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { CurriculumExplorer } from "@/components/curriculum-explorer";
import { FormSection } from "@/components/form-section";
import { Footer, Header, Kicker } from "@/components/site";

const facts = [
  {
    value: "4차시",
    label: "수업팩 시제품",
    note: "읽기부터 보고서까지",
    icon: BookOpenText,
  },
  {
    value: "초6 기준",
    label: "첫 검증 수준",
    note: "초등 고학년~중등 확장",
    icon: GraduationCap,
  },
  {
    value: "4~16명",
    label: "권장 인원",
    note: "팀당 4명 구성",
    icon: UsersThree,
  },
  {
    value: "30분 이내",
    label: "교사 준비 목표",
    note: "출력·배정 후 시작",
    icon: Clock,
  },
];

const productRoutes = [
  {
    label: "01 · PRODUCT",
    title: "제품 소개",
    body: "DullG 수업팩이 누구에게 맞고, 수업에서 무엇을 바꾸는지 한눈에 확인합니다.",
    href: "/academy",
    cta: "제품 전체 보기",
    icon: MagnifyingGlass,
  },
  {
    label: "02 · CURRICULUM",
    title: "4차시 커리큘럼",
    body: "읽기·질문·토론·쓰기가 한 사건 안에서 어떻게 이어지는지 살펴봅니다.",
    href: "/academy/curriculum",
    cta: "차시별 구성 보기",
    icon: BookOpenText,
  },
  {
    label: "03 · MATERIALS",
    title: "실제 수업 자료",
    body: "학생용 단서 카드, 워크북, 교사용 진행안과 결과물 예시를 직접 확인합니다.",
    href: "/academy/sample",
    cta: "자료 미리 보기",
    icon: FolderOpen,
  },
  {
    label: "04 · PILOT",
    title: "파일럿 운영 안내",
    body: "샘플 요청부터 일정 조율, 수업 운영과 피드백까지의 과정을 안내합니다.",
    href: "/academy/pilot",
    cta: "운영 방식 보기",
    icon: Printer,
  },
];

const materialPreviews = [
  {
    title: "학생용 게임 카드",
    caption: "학생마다 다른 영어 단서가 담긴 역할별 카드",
    image: "/assets/dullg/mat-game-cards.png",
    alt: "책상 위에 펼쳐진 학생용 역할별 영어 단서 카드",
  },
  {
    title: "학생 워크북",
    caption: "단서·가설·근거를 차시별로 기록하는 활동지",
    image: "/assets/dullg/mat-workbook.png",
    alt: "학생이 단서와 추론 과정을 기록하는 워크북",
  },
  {
    title: "교사용 진행안",
    caption: "진행 순서, 대본, 힌트와 정답을 포함한 가이드",
    image: "/assets/dullg/mat-teacher-guide.png",
    alt: "교사용 4차시 진행안과 힌트 가이드",
  },
  {
    title: "수업 결과 리포트",
    caption: "학생이 무엇을 읽고 말하고 썼는지 정리한 예시",
    image: "/assets/dullg/mat-report.png",
    alt: "학생의 활동 결과를 정리한 학부모 전달용 리포트",
  },
];

const process = [
  {
    number: "01",
    title: "샘플 요청",
    body: "기관 정보와 관심 유형을 남기면 검토할 수 있는 자료를 보내드립니다.",
  },
  {
    number: "02",
    title: "자료 확인",
    body: "수업 난이도, 구성품과 교사 준비 범위를 시제품 자료로 확인합니다.",
  },
  {
    number: "03",
    title: "일정 조율",
    body: "학원 일정과 학생 수에 맞춰 파일럿 운영 방식을 함께 정합니다.",
  },
  {
    number: "04",
    title: "수업과 피드백",
    body: "완성형 자료로 수업을 진행하고, 이후 자료 개선 의견을 나눕니다.",
  },
];

const faqs = [
  {
    q: "영어 수준이 낮은 학생도 참여할 수 있나요?",
    a: "단서 카드는 초등 6학년 수준 어휘를 기준으로 구성합니다. 정답보다 정보를 찾고 설명하는 과정이 중심이라 다양한 수준의 학생이 역할을 나눠 참여할 수 있습니다.",
  },
  {
    q: "원어민 교사가 아니어도 운영할 수 있나요?",
    a: "교사용 진행안에 수업 순서, 대본, 단계별 힌트와 정답을 함께 제공합니다. 교사가 자료를 새로 만들지 않고 진행에 집중하도록 설계했습니다.",
  },
  {
    q: "수업 준비에는 얼마나 걸리나요?",
    a: "첫 수업 기준 30분 이내 준비를 목표로 합니다. 필요한 자료를 출력하고 역할 카드를 배정하면 시작할 수 있습니다.",
  },
  {
    q: "샘플을 받으면 파일럿에 꼭 참여해야 하나요?",
    a: "아닙니다. 샘플 자료를 먼저 검토한 뒤 적합할 때만 파일럿 일정을 논의하시면 됩니다. 구매 의무도 없습니다.",
  },
  {
    q: "요청한 자료는 언제 받을 수 있나요?",
    a: "영업일 1~2일 내 입력하신 연락처로 안내드립니다. 추가 질문은 hello@dullg.com으로 보내주셔도 됩니다.",
  },
];

export default function Home() {
  return (
    <main className="product-home" id="main-content">
      <Header />

      <section className="product-hero shell" aria-labelledby="home-title">
        <div className="product-hero-copy">
          <Kicker>영어학원용 4차시 미스터리 수업팩</Kicker>
          <h1 id="home-title">
            영어로 단서를 읽고,
            <br />
            <em>함께 푸는 미스터리 수업</em>
          </h1>
          <p>
            서로 다른 영어 단서를 가진 학생들이 정보를 나누고 사건을
            해결합니다. 교사는 준비 부담을 줄이고, 수업 뒤에는 학생의
            근거가 담긴 보고서를 확인할 수 있습니다.
          </p>
          <div className="product-hero-actions">
            <a className="button button-dark" href="#apply">
              무료 검토팩 요청
              <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
            <a className="product-secondary-link" href="/academy/sample">
              실제 자료 먼저 보기
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <small>정식 출시 전 시제품 · 검토 후 참여 결정 · 영업일 1~2일 내 안내</small>
        </div>

        <figure className="product-hero-visual">
          <div className="product-hero-sheet product-hero-sheet-back">
            <img
              src="/assets/dullg/rulebook-flow.png"
              alt="교사용 수업 진행안"
            />
          </div>
          <div className="product-hero-sheet product-hero-sheet-card">
            <img
              src="/assets/dullg/card-body-1.png"
              alt="학생용 영어 단서 카드"
            />
          </div>
          <div className="product-hero-sheet product-hero-sheet-report">
            <img
              src="/assets/dullg/pre-survey.png"
              alt="학생용 추론 기록지"
            />
          </div>
          <figcaption>
            <Printer size={18} aria-hidden="true" />
            수업 운영 검토를 위해 제작한 시제품 자료
          </figcaption>
        </figure>
      </section>

      <section className="product-facts shell" aria-label="수업팩 주요 조건">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div key={fact.value}>
              <Icon size={25} weight="duotone" aria-hidden="true" />
              <span>
                <b>{fact.value}</b>
                <strong>{fact.label}</strong>
                <small>{fact.note}</small>
              </span>
            </div>
          );
        })}
      </section>

      <section className="product-fit shell">
        <div className="product-section-heading">
          <Kicker>학원 수업에 맞춘 설계</Kicker>
          <h2>
            학생은 참여하고,
            <br />
            <em>교사는 진행에 집중합니다.</em>
          </h2>
        </div>
        <div className="product-fit-list">
          <article>
            <span>01</span>
            <h3>학생은 설명해야 다음으로 갑니다</h3>
            <p>
              각자 가진 단서가 달라 서로 설명하고 질문해야 사건을 해결할 수
              있습니다.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>교사는 진행에 집중합니다</h3>
            <p>
              카드·워크북·대본·힌트·정답을 한 세트로 구성해 교사가 새로
              만들 범위를 줄이는 것이 목표입니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>수업 뒤에 기록이 남습니다</h3>
            <p>
              학생의 영어 사건보고서와 활동 기록을 학부모에게 전달할 수
              있습니다.
            </p>
          </article>
        </div>
      </section>

      <section className="product-curriculum" id="curriculum">
        <div className="shell">
          <div className="product-section-heading product-section-heading-row">
            <div>
              <Kicker>ONE MYSTERY · FOUR LESSONS</Kicker>
              <h2>
                4차시 수업 흐름을
                <br />
                <em>직접 선택해 살펴보세요.</em>
              </h2>
              <p>
                각 차시의 목표, 학생 활동, 교사 지원 자료와 결과물이 한
                사건 안에서 이어집니다.
              </p>
            </div>
            <a href="/academy/curriculum">
              커리큘럼 상세 보기
              <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>

          <CurriculumExplorer />
        </div>
      </section>

      <section className="product-routes shell" aria-labelledby="routes-title">
        <div className="product-section-heading">
          <Kicker>도입 전 확인하기</Kicker>
          <h2 id="routes-title">
            검토 순서에 맞춰
            <br />
            <em>필요한 정보만 보세요.</em>
          </h2>
          <p>
            수업 구조, 시제품 자료, 운영 조건 중 지금 필요한 내용부터
            확인할 수 있습니다.
          </p>
        </div>

        <div className="product-route-grid">
          {productRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <a href={route.href} className="product-route" key={route.href}>
                <span className="product-route-icon" aria-hidden="true">
                  <Icon size={27} weight="duotone" />
                </span>
                <small>{route.label}</small>
                <h3>{route.title}</h3>
                <p>{route.body}</p>
                <strong>
                  {route.cta}
                  <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </strong>
              </a>
            );
          })}
        </div>
      </section>

      <section className="product-materials">
        <div className="shell">
          <div className="product-section-heading product-section-heading-row">
            <div>
              <Kicker>검토용 시제품 자료</Kicker>
              <h2>
                설명보다 먼저,
                <br />
                <em>제작한 시제품을 보여드립니다.</em>
              </h2>
              <p>
                카드, 워크북, 진행안과 결과물 예시가 어떤 역할을 하도록
                설계했는지 확인할 수 있습니다.
              </p>
            </div>
            <a href="/academy/sample">
              시제품 자료 전체 보기
              <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>

          <div className="product-material-grid">
            {materialPreviews.map((material) => (
              <figure key={material.title}>
                <div>
                  <img src={material.image} alt={material.alt} loading="lazy" />
                </div>
                <figcaption>
                  <strong>{material.title}</strong>
                  <span>{material.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="product-outcome shell">
        <figure className="product-outcome-visual">
          <img
            src="/assets/dullg/timeline-yoon.png"
            alt="학생이 사건의 시간대별 단서를 정리한 활동 기록지"
            loading="lazy"
          />
          <figcaption>학생 활동 기록 예시 · 사건 타임라인</figcaption>
        </figure>
        <div className="product-outcome-copy">
          <Kicker>수업 뒤에 남는 기록</Kicker>
          <h2>
            재미로 끝나지 않고,
            <br />
            <em>영어로 쓴 판단이 남습니다.</em>
          </h2>
          <p>
            학생마다 선택한 단서, 수정한 가설, 최종 판단과 근거를 남기도록
            설계했습니다. 파일럿에서는 이 기록이 실제 수업 안에서 완성되는지
            확인합니다.
          </p>
          <ul>
            <li>
              <FileText size={19} aria-hidden="true" />
              핵심 단서와 가설 수정 과정
            </li>
            <li>
              <FileText size={19} aria-hidden="true" />
              because·however를 사용한 영어 문장
            </li>
            <li>
              <FileText size={19} aria-hidden="true" />
              팀 사건보고서와 개인 작성지
            </li>
          </ul>
          <small>
            활동 결과 요약은 수업 중 수행을 정리한 자료이며, 학생의
            지능·성격 또는 공인 문해력 수준을 진단하지 않습니다.
          </small>
        </div>
      </section>

      <section className="product-episode">
        <div className="shell product-episode-grid">
          <div className="product-episode-copy">
            <Kicker>EPISODE 01 · FIRST CASE</Kicker>
            <h2>
              보충반의
              <br />
              <em>사라진 열쇠</em>
            </h2>
            <p>
              재시험을 시작하려던 순간, 원장실 벽면의 두 개의 열쇠가
              사라졌습니다. 네 명의 학생이 각자 가진 영어 단서와 3층 공간의
              관계를 연결하며 사건을 해결합니다.
            </p>
            <a className="button button-light" href="/episode">
              에피소드 01 살펴보기
              <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <div className="product-episode-visual">
            <figure>
              <img
                src="/assets/dullg/classroom-case.png"
                alt="보충반의 사라진 열쇠 사건이 시작되는 교실"
                loading="lazy"
              />
              <figcaption>사건이 시작되는 교실</figcaption>
            </figure>
            <figure>
              <img
                src="/assets/dullg/floor-map-3f.png"
                alt="사건의 주요 장소가 표시된 학원 3층 평면도"
                loading="lazy"
              />
              <figcaption>학원 3층 사건 지도</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="product-trust shell">
        <div className="product-trust-intro">
          <Kicker>현재 운영 원칙</Kicker>
          <h2>
            제작한 시제품과
            <br />
            <em>투명한 운영 원칙</em>
          </h2>
          <p>
            현재는 수업용 시제품을 제작하고 파일럿 운영을 준비하는
            단계입니다. 운영 결과가 생기면 확인된 내용부터 공개하겠습니다.
          </p>
          <a href="/about">
            DullG가 만드는 방식
            <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </a>
        </div>
        <div className="product-trust-points">
          <article>
            <span>01</span>
            <div>
              <h3>시제품 자료를 먼저 공개합니다</h3>
              <p>
                카드, 워크북, 교사용 진행안과 결과물 예시를 도입 전에
                검토할 수 있도록 보여드립니다.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>파일럿 상태를 명확히 안내합니다</h3>
              <p>
                파일럿은 효과 증명이 아니라 시간·이해·참여·교사 부담과
                결과물을 확인하는 과정입니다.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>결과물의 한계를 함께 설명합니다</h3>
              <p>
                활동 기록은 수업 수행을 보여주는 자료이며 진단이나 성적표로
                과장하지 않습니다.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="product-activity-proof">
        <div className="shell product-activity-proof-grid">
          <div>
            <Kicker>지금 만드는 과정</Kicker>
            <h2>
              완성된 것과
              <br />
              <em>확인 중인 것을 구분합니다.</em>
            </h2>
            <p>
              제작한 시제품과 현재 진행 상황을 공개합니다. 수업 현장 사진과
              팀 소개는 공개 동의를 확인한 뒤 순서대로 추가하겠습니다.
            </p>
            <a href="/activity">
              DullG 활동 기록 보기
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <div className="product-activity-proof-images">
            <figure>
              <img
                src="/assets/dullg/mat-game-cards.png"
                alt="제작한 학생용 게임 카드 시제품"
                loading="lazy"
              />
              <figcaption>현재 공개 시제품 · 학생용 게임 카드</figcaption>
            </figure>
            <figure>
              <img
                src="/assets/dullg/mat-teacher-guide.png"
                alt="제작한 교사용 진행안 시제품"
                loading="lazy"
              />
              <figcaption>현재 공개 시제품 · 교사용 진행안</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="product-process" id="process">
        <div className="shell">
          <div className="product-section-heading">
            <Kicker>샘플부터 파일럿까지</Kicker>
            <h2>
              시작 이후의 과정을
              <br />
              <em>미리 확인하세요.</em>
            </h2>
          </div>
          <ol className="product-process-list">
            {process.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <a className="product-process-link" href="/academy/pilot">
            파일럿 운영 과정 자세히 보기
            <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="product-faq shell">
        <div className="product-section-heading">
          <Kicker>도입 전 자주 묻는 질문</Kicker>
          <h2>검토 전에 많이 묻는 질문</h2>
        </div>
        <div className="product-faq-list">
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="product-apply" id="apply">
        <div className="shell product-apply-grid">
          <div className="product-apply-copy">
            <Kicker>무료 검토팩</Kicker>
            <h2>
              파일럿보다 먼저,
              <br />
              <em>자료부터 확인하세요.</em>
            </h2>
            <p>
              샘플 요청은 무료이며 구매 의무가 없습니다. 시제품 자료를 검토한
              뒤 파일럿 여부를 결정하시면 됩니다.
            </p>
            <ul>
              <li>4차시 커리큘럼 개요</li>
              <li>학생용 단서 카드 샘플</li>
              <li>교사용 진행안 샘플</li>
              <li>영업일 1~2일 내 안내</li>
            </ul>
            <a href="mailto:hello@dullg.com">hello@dullg.com</a>
          </div>
          <FormSection />
        </div>
      </section>

      <Footer />
    </main>
  );
}
