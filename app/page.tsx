const features = [
  {
    number: "01",
    title: "생각을 한곳에 모으고",
    body: "회의 메모, 아이디어, 파일을 흩어지지 않게 담아두세요. 모든 팀의 맥락이 한 화면에 모입니다.",
  },
  {
    number: "02",
    title: "다음 액션을 선명하게",
    body: "해야 할 일과 책임자를 바로 정리합니다. 막연한 논의가 실제 진척으로 이어지도록 도와요.",
  },
  {
    number: "03",
    title: "더 가볍게 공유하고",
    body: "진행 상황을 매번 설명하지 않아도 됩니다. 필요한 사람에게 필요한 순간, 가장 좋은 형태로 전달됩니다.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="주요 메뉴">
        <a className="brand" href="#top" aria-label="Morrow 홈">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Morrow</span>
        </a>
        <div className="nav-links">
          <a href="#why">왜 Morrow인가</a>
          <a href="#features">기능</a>
          <a href="#stories">이야기</a>
        </div>
        <a className="nav-cta" href="#start">무료로 시작하기 <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> THE CALMER WAY TO WORK</p>
          <h1>좋은 일은<br /><em>선명함</em>에서 시작됩니다.</h1>
          <p className="hero-description">Morrow는 팀의 생각을 정리하고, 중요한 일에 집중하도록 돕는 가장 가벼운 업무 공간입니다.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#start">무료로 시작하기 <span>↗</span></a>
            <a className="text-link" href="#why">어떻게 작동하나요? <span>↓</span></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Morrow workspace preview">
          <div className="sun" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="workspace-card">
            <div className="card-top"><span className="tiny-logo">M</span><span>Monday, 24 June</span><b>•••</b></div>
            <div className="card-title">이번 주, 우리가<br /><strong>만들고 있는 것</strong></div>
            <div className="progress-row"><span>Project North Star</span><strong>72%</strong></div>
            <div className="progress"><i /></div>
            <div className="task-grid"><span className="task done">✓&nbsp; 방향성 정리</span><span className="task">○&nbsp; 첫 화면 만들기</span><span className="task">○&nbsp; 팀에 공유하기</span><span className="task done">✓&nbsp; 리서치 마무리</span></div>
          </div>
          <div className="floating-note"><span>✦</span><div><b>작은 진전도</b><br />기록해두면 자산이 됩니다.</div></div>
          <span className="art-label label-top">CLARITY / 01</span><span className="art-label label-bottom">MAKE SPACE FOR<br />WHAT MATTERS</span>
        </div>
      </section>

      <section className="statement shell" id="why">
        <p className="section-kicker">WHY MORROW</p>
        <h2>바쁜데도 앞으로<br /><span>나아가지 않는 날들.</span></h2>
        <p className="statement-body">우리는 더 많은 툴이 아니라, 더 적은 소음이 필요하다고 믿습니다. Morrow는 팀이 본질에 가까이 머물 수 있도록 업무의 흐름을 다시 설계합니다.</p>
      </section>

      <section className="feature-section shell" id="features">
        <div className="feature-intro"><p className="section-kicker">ONE CLEAR FLOW</p><h2>복잡함은 덜고,<br /><span>몰입은 더하고.</span></h2></div>
        <div className="feature-list">{features.map((feature) => <article className="feature" key={feature.number}><span className="feature-number">{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.body}</p></div><span className="feature-arrow">↗</span></article>)}</div>
      </section>

      <section className="quote-section shell" id="stories">
        <div className="quote-mark">“</div><blockquote>회의가 끝난 뒤에야<br />진짜 일이 시작되는 느낌이었어요.<br /><em>이제는 회의 중에 시작됩니다.</em></blockquote><p className="quote-by">— 박서윤, Product Lead at Oribit</p>
      </section>

      <section className="final-cta shell" id="start"><div><p className="section-kicker">YOUR NEXT CHAPTER</p><h2>더 나은 내일을<br /><em>오늘 정리해두세요.</em></h2></div><a className="button button-light" href="mailto:hello@morrow.space">Morrow 시작하기 <span>↗</span></a></section>

      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>Morrow</span></a><p>© 2026 Morrow Studio. Make space for what matters.</p><div><a href="#top">Instagram</a><a href="mailto:hello@morrow.space">Contact</a></div></footer>
    </main>
  );
}
