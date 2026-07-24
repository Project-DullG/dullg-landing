const features = [
  {
    number: "01",
    title: "영어 단서를 읽고",
    body: "이야기 속 단서를 읽고 핵심 정보를 골라냅니다. 문장을 외우는 수업에서, 의미를 따라가는 수업으로.",
  },
  {
    number: "02",
    title: "근거를 연결하고",
    body: "질문하고, 추측하고, 반박하며 단서 사이의 관계를 찾아갑니다. 정답보다 생각의 과정을 중요하게 다룹니다.",
  },
  {
    number: "03",
    title: "내 생각을 보고서로",
    body: "최종 판단과 그 이유를 짧은 영어 보고서로 남깁니다. 교사는 학생의 활동을 놓치지 않고 확인할 수 있어요.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="주요 메뉴">
          <a className="brand" href="#top" aria-label="DullG 홈">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>DullG</span>
        </a>
        <div className="nav-links">
          <a href="#why">왜 Morrow인가</a>
          <a href="#features">기능</a>
          <a href="#stories">이야기</a>
        </div>
        <a className="nav-cta" href="#start">파일럿 문의하기 <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> STORY · EVIDENCE · EXPRESSION</p>
          <h1>영어를 읽고,<br /><em>추리하고</em>, 설명하는 수업.</h1>
          <p className="hero-description">DullG는 초등 영어 학원을 위한 미스터리 프로젝트 수업입니다. 학생들은 단서를 읽고, 팀과 토론하고, 자신의 판단을 보고서로 남깁니다.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#start">교사용 자료 요청 <span>↗</span></a>
            <a className="text-link" href="#why">수업 흐름 살펴보기 <span>↓</span></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Morrow workspace preview">
          <div className="sun" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="workspace-card">
            <div className="card-top"><span className="tiny-logo">D</span><span>CASE FILE 01 · CLASS 6</span><b>•••</b></div>
            <div className="card-title">누가 사라진<br /><strong>보물지도를 가져갔을까?</strong></div>
            <div className="progress-row"><span>Evidence collected</span><strong>72%</strong></div>
            <div className="progress"><i /></div>
            <div className="task-grid"><span className="task done">✓&nbsp; 핵심 단서 찾기</span><span className="task">○&nbsp; 인물 동기 연결</span><span className="task">○&nbsp; 팀 근거 토론</span><span className="task done">✓&nbsp; 최종 보고 제출</span></div>
          </div>
          <div className="floating-note"><span>✦</span><div><b>근거가 있는 판단</b><br />영어로 설명해보세요.</div></div>
          <span className="art-label label-top">CASE FILE / 01</span><span className="art-label label-bottom">READ THE CLUES<br />TELL YOUR STORY</span>
        </div>
      </section>

      <section className="statement shell" id="why">
        <p className="section-kicker">WHY DULLG</p>
        <h2>영어를 배웠지만,<br /><span>말할 기회가 부족했다면.</span></h2>
        <p className="statement-body">DullG는 영어를 목적지가 아니라 추리의 도구로 사용합니다. 학생은 이야기를 이해하고, 증거를 비교하고, 자신의 생각을 설명하며 한 편의 수업을 완성합니다.</p>
      </section>

      <section className="feature-section shell" id="features">
        <div className="feature-intro"><p className="section-kicker">ONE MYSTERY · FOUR LESSONS</p><h2>읽기에서 토론,<br /><span>보고서까지.</span></h2></div>
        <div className="feature-list">{features.map((feature) => <article className="feature" key={feature.number}><span className="feature-number">{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.body}</p></div><span className="feature-arrow">↗</span></article>)}</div>
      </section>

      <section className="quote-section shell" id="stories">
        <div className="quote-mark">“</div><blockquote>정답을 맞히는 것보다<br />왜 그렇게 생각했는지<br /><em>설명하는 경험을 만듭니다.</em></blockquote><p className="quote-by">— DullG 영어 미스터리 프로젝트</p>
      </section>

      <section className="final-cta shell" id="start"><div><p className="section-kicker">BRING DULLG TO YOUR CLASS</p><h2>우리 반의 첫 사건을<br /><em>함께 시작해보세요.</em></h2></div><a className="button button-light" href="mailto:hello@dullg.com">파일럿 문의하기 <span>↗</span></a></section>

      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>DullG</span></a><p>© 2026 DullG. Read the clues. Tell your story.</p><div><a href="#top">Instagram</a><a href="mailto:hello@dullg.com">Contact</a></div></footer>
    </main>
  );
}
