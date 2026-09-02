import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { FormSection } from "@/components/form-section";
import { Footer, Header, Kicker } from "@/components/site";

const educationFacts = [
  ["4차시", "읽기부터 사건보고서까지"],
  ["초6~중1", "첫 파일럿 검토 기준"],
  ["4~16명", "권장 수업 인원"],
  ["30분 이내", "첫 수업 준비 목표"],
];

export default function Home() {
  return (
    <main className="brand-home" id="main-content">
      <Header />

      <section className="brand-hero shell" aria-labelledby="home-title">
        <Kicker>단서공방 · ProjectDullG</Kicker>
        <h1 id="home-title">이야기를 만들고,<br /><em>단서를 엮습니다.</em></h1>
        <p>단서공방은 머더미스터리 작품을 만들고, 영어로 읽고 토론하는 미스터리 수업팩을 준비합니다.</p>
        <div className="brand-hero-actions">
          <a className="button button-dark" href="/works">작품 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a>
          <a href="/academy">교육 수업팩 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a>
        </div>
      </section>

      <section className="brand-works shell" aria-labelledby="brand-works-title">
        <div className="brand-section-head">
          <div><Kicker>작품</Kicker><h2 id="brand-works-title">공개한 머더미스터리</h2></div>
          <a href="/works">모든 작품과 펀딩 기록 <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="brand-work-grid">
          <a href="https://tumblbug.com/projectdg2" target="_blank" rel="noreferrer">
            <img src="/assets/works/slime-soda-cover.webp" width="1000" height="1000" alt="슬라임은 소다맛이 난다 작품 이미지" />
            <span>현재 펀딩 중 · 4–5인 · 60분</span><h3>슬라임은 소다맛이 난다</h3>
          </a>
          <a href="https://tumblbug.com/projectdg2" target="_blank" rel="noreferrer">
            <img src="/assets/works/professor-rest-cover.webp" width="1000" height="1000" alt="교수님 편히 쉬세요 작품 이미지" />
            <span>현재 펀딩 중 · 6인 · 90분</span><h3>교수님, 편히 쉬세요</h3>
          </a>
          <a href="/works">
            <img src="/assets/works/snake-carnival-cover.webp" width="1000" height="1000" alt="뱀이 죽은 축제 작품 이미지" />
            <span>출시 · 4인 · 120분</span><h3>뱀이 죽은 축제</h3>
          </a>
        </div>
      </section>

      <section className="brand-method shell" aria-labelledby="brand-method-title">
        <div className="brand-method-head">
          <Kicker>만드는 방식</Kicker>
          <h2 id="brand-method-title">이야기와 단서가<br />함께 작동하게 만듭니다.</h2>
          <p>사건의 설정만 만드는 데서 멈추지 않습니다. 플레이어가 읽고, 의심하고, 판단하는 순서까지 설계합니다.</p>
        </div>
        <div className="brand-method-list">
          <article>
            <div className="clue-grid clue-grid-one" aria-hidden="true" />
            <span>01</span><h3>사건의 시작과 끝을 정합니다</h3>
            <p>누가 무엇을 알고 있는지 먼저 정리하고, 이야기의 결말까지 한 흐름으로 구성합니다.</p>
          </article>
          <article>
            <div className="clue-grid clue-grid-two" aria-hidden="true" />
            <span>02</span><h3>정보를 인물마다 나눕니다</h3>
            <p>혼자서는 풀 수 없도록 단서를 나눕니다. 질문과 대화가 자연스럽게 이어지는지 확인합니다.</p>
          </article>
          <article>
            <div className="clue-grid clue-grid-three" aria-hidden="true" />
            <span>03</span><h3>플레이하며 반복해서 고칩니다</h3>
            <p>단서가 너무 빠르거나 늦게 드러나지 않는지 살피고, 판단에 필요한 정보만 남깁니다.</p>
          </article>
        </div>
      </section>

      <section className="brand-education" aria-labelledby="brand-education-title">
        <div className="shell brand-education-grid">
          <figure><img src="/assets/dullg/mat-game-cards.webp" width="1536" height="1024" alt="책상 위에 펼쳐진 학생용 영어 단서 카드" /></figure>
          <div>
            <Kicker>교육 · 영어 미스터리 수업팩</Kicker>
            <h2 id="brand-education-title">영어 단서를 읽고<br />함께 사건을 해결합니다.</h2>
            <p>학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어 사건보고서로 정리합니다.</p>
            <dl>{educationFacts.map(([value,label])=><div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
            <a href="/academy">수업팩 자세히 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="brand-record shell">
        <div><Kicker>단서공방</Kicker><h2>공개된 결과와<br />진행 중인 일을 구분합니다.</h2></div>
        <div><p>완성한 작품, 종료된 펀딩과 제작 중인 교육 수업팩을 각각의 상태와 함께 기록합니다.</p><a href="/activity">제작·활동 기록 보기 →</a><a href="/about">단서공방 소개 보기 →</a></div>
      </section>

      <section className="product-apply" id="apply">
        <div className="shell product-apply-grid">
          <div className="product-apply-copy">
            <Kicker>교육 문의</Kicker>
            <h2>수업 자료를 먼저<br /><em>확인해보세요.</em></h2>
            <p>영어 미스터리 수업팩은 정식 출시 전 시제품 단계입니다. 자료를 검토한 뒤 파일럿 참여 여부를 결정할 수 있습니다.</p>
            <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
          </div>
          <FormSection />
        </div>
      </section>

      <Footer />
    </main>
  );
}
