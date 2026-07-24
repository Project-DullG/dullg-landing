import { Footer, Header, Kicker } from "@/components/site";

const lessonFlow = [
  { number: "01", label: "READ THE CLUES", title: "단서를 읽습니다", body: "인물·시간·장소에 관한 핵심 정보를 찾고 사실과 추측을 구분합니다.", image: "/assets/dullg/case-intro.png" },
  { number: "02", label: "SHARE THE FACTS", title: "정보를 설명합니다", body: "자신이 가진 단서를 팀원에게 영어로 설명하며 서로 다른 정보를 모읍니다.", image: "/assets/dullg/card-cover-1.png" },
  { number: "03", label: "TEST THE THEORY", title: "가설을 비교하고 수정합니다", body: "질문하고 반박하며 새 단서에 따라 처음의 판단을 다시 살펴봅니다.", image: "/assets/dullg/rulebook-map-detailed.png" },
  { number: "04", label: "WRITE THE REPORT", title: "사건보고서를 완성합니다", body: "최종 주장과 근거를 영어 문장으로 정리해 팀 보고서와 개인 결과물을 남깁니다.", image: "/assets/dullg/timeline-yoon.png" },
];

const materials = [
  ["01", "교사용 진행안", "수업 순서, 예상 질문, 힌트 제공 시점과 정답을 확인합니다.", "/assets/dullg/rulebook-flow-detailed.png", "material-large"],
  ["02", "학생용 영어 단서 카드", "학생마다 다른 정보를 읽고 팀에 설명하도록 구성합니다.", "/assets/dullg/card-body-1.png", ""],
  ["03", "학생 워크북", "가설, 근거, 반박과 수정 과정을 차시별로 기록합니다.", "/assets/dullg/timeline-yoon.png", ""],
  ["04", "사건보고서·학부모 안내자료", "수업이 끝난 뒤 학생의 영어 활동 결과를 확인할 수 있습니다.", "/assets/dullg/rulebook-map-detailed.png", "material-wide"],
];

const faqs = [
  ["영어 수준은 어느 정도여야 하나요?", "초등학교 6학년부터 중학교 1학년 수준을 기준으로 설계했습니다. 학생이 단서를 읽고 핵심 정보를 설명할 수 있도록 교사용 힌트와 진행 문장을 함께 제공합니다."],
  ["추리게임 경험이 없는 교사도 진행할 수 있나요?", "가능하도록 구성했습니다. 4차시 수업안, 진행 대본, 정답과 단계별 힌트를 함께 제공해 교사는 학생의 대화와 판단을 돕는 역할에 집중할 수 있습니다."],
  ["폭력적이거나 어두운 소재가 포함되나요?", "아닙니다. 학교 공간에서 사라진 열쇠의 행방을 단서와 대화로 추적하는 밝은 교육용 이야기입니다."],
  ["수업자료는 어떤 형태로 제공되나요?", "교사용 수업안과 진행 대본, 학생용 단서 카드·워크북, 정답·힌트, 사건보고서와 학부모 안내자료를 검토팩 형태로 안내드립니다."],
];

export default function Home() {
  return <main className="academy-landing"><Header />
    <section className="landing-hero shell"><div className="landing-hero-copy"><Kicker>영어학원 방학특강 · 4차시 수업팩</Kicker><h1>내신이 끝난 뒤,<br /><em>학생들이 영어로<br />사건을 해결합니다.</em></h1><p>영어 단서를 읽고 질문하고, 추측하고, 반박하며 팀별 사건보고서를 완성하는 초6~중1 대상 영어 프로젝트 수업입니다.</p><p className="landing-hero-sub">교사용 진행안부터 학생 자료와 학부모 안내자료까지 함께 제공합니다.</p><div className="landing-actions"><a className="button button-dark" href="#apply">1회차 샘플 받아보기 <span>↗</span></a><a className="text-link" href="#pilot">파일럿 운영 상담하기 <span>↗</span></a></div><p className="landing-assurance">커리큘럼 · 학생용 단서 카드 · 교사용 진행안 샘플 제공</p></div><div className="landing-hero-visual" aria-label="수업자료 구성 예시"><div className="hero-material-back"><img src="/assets/dullg/rulebook-flow.png" alt="교사용 진행안 자료 예시" /></div><div className="hero-material-card hero-card-clue"><img src="/assets/dullg/card-body-1.png" alt="학생용 단서 카드 자료 예시" /></div><div className="hero-material-card hero-card-report"><img src="/assets/dullg/pre-survey.png" alt="학생 기록 자료 예시" /></div><span className="hero-material-label">수업자료 구성 예시</span></div></section>

    <section className="landing-trust shell"><span>초6~중1 권장</span><span>총 4차시</span><span>교사 준비 30분 이내 목표</span><span>학생 결과물 제공</span><span>초기 파일럿 2~3개 학원 모집</span></section>

    <section className="landing-problem shell"><div><Kicker>WHY ACADEMIES NEED IT</Kicker><h2>재미있는 활동만으로는<br /><em>방학특강이 되기 어렵습니다.</em></h2></div><div className="problem-points"><p><b>01</b><strong>시험 이후<br />집중력이 떨어지는 학생</strong><span>다음 수업을 기다리게 만드는 실제 장면이 필요합니다.</span></p><p><b>02</b><strong>활동형 수업을<br />준비해야 하는 교사</strong><span>자료를 새로 만들지 않아도 바로 시작할 수 있어야 합니다.</span></p><p><b>03</b><strong>수업 결과를<br />설명해야 하는 원장</strong><span>학생이 무엇을 읽고 판단했는지 보여줄 자료가 필요합니다.</span></p></div><div className="landing-value"><Kicker>THE DULLG APPROACH</Kicker><p>학생의 참여, 교사의 운영 편의성, 학부모에게 보여줄 결과물을 <strong>하나의 수업팩</strong>으로 설계했습니다.</p></div></section>

    <section className="landing-flow shell" id="flow"><div className="landing-section-head"><Kicker>HOW THE CLASS WORKS</Kicker><h2>학생들은 영어를<br /><em>사건 해결에 사용합니다.</em></h2><p>각자 가진 단서를 설명하고 팀의 판단을 함께 만들어가는 4단계 수업 흐름입니다.</p></div><div className="flow-list">{lessonFlow.map((item) => <article className="flow-item" key={item.number}><div className="flow-number">{item.number}</div><div><Kicker>{item.label}</Kicker><h3>{item.title}</h3><p>{item.body}</p></div><div className="flow-thumb"><img src={item.image} alt="" /></div></article>)}</div></section>

    <section className="landing-materials" id="materials"><div className="shell"><div className="landing-section-head"><Kicker>READY-TO-RUN MATERIALS</Kicker><h2>교사가 바로 운영할 수 있도록<br /><em>필요한 자료를 함께 제공합니다.</em></h2><p>교사 준비시간 30분 이내를 목표로, 수업을 바로 운영할 수 있는 완성형 패키지를 구성합니다.</p></div><div className="materials-grid">{materials.map(([number, title, body, image, className]) => <article className={`material-item ${className}`} key={number}><div className="material-image"><img src={image} alt="" /></div><div className="material-copy"><span>{number}</span><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="materials-more"><b>그 외 포함 자료</b> · 교사용 진행 대본 · 정답과 단계별 힌트 · 개인 영어 작성지 · 활동 결과 요약 템플릿</p></div></section>

    <section className="landing-benefits shell"><div className="benefit-image"><img src="/assets/dullg/students-investigation.png" alt="학생들이 단서와 평면도를 함께 살펴보는 수업 장면" /></div><div className="benefit-copy"><Kicker>WHY DULLG WORKS FOR ACADEMIES</Kicker><h2>수업을 운영하는 사람마다<br /><em>얻는 것이 분명합니다.</em></h2><div className="benefit-list"><article><b>교사에게</b><h3>준비 부담을 줄입니다</h3><p>진행 순서, 학생 자료, 힌트와 정답이 함께 제공되어 추리게임 경험이 없는 교사도 수업을 준비할 수 있습니다.</p></article><article><b>학생에게</b><h3>영어를 사용해야 할 이유가 생깁니다</h3><p>정답을 고르는 데서 끝나지 않고, 자신이 가진 정보를 팀원에게 설명하고 근거를 비교합니다.</p></article><article><b>원장과 학부모에게</b><h3>수업 후 보여줄 결과물이 남습니다</h3><p>학생이 선택한 단서, 작성한 영어 문장과 팀 사건보고서를 확인할 수 있습니다.</p></article></div></div></section>

    <section className="landing-results shell" id="results"><div className="results-visual"><div className="result-sheet"><span>STUDENT ACTIVITY RECORD · EXAMPLE FORMAT</span><h3>이번 판단을<br /><em>이렇게 설명했습니다.</em></h3><div className="result-line"><b>핵심 단서 선택</b><i /><strong>03</strong></div><div className="result-line"><b>가설 수정</b><i /><strong>YES</strong></div><blockquote>“The key was in the office<br />because the note changed.”</blockquote><small>사건 결론과 관련된 근거를 선택하고, because와 however를 사용해 판단을 설명했습니다.</small></div></div><div className="results-copy"><Kicker>WHAT REMAINS AFTER CLASS</Kicker><h2>재미로 끝나지 않고<br /><em>학생의 활동 기록이 남습니다.</em></h2><ul><li>핵심 단서 선택</li><li>처음의 가설과 수정된 가설</li><li>주장과 근거를 연결한 영어 문장</li><li>팀별 사건보고서와 개인 작성지</li></ul><small>활동 결과 요약은 수업 중 관찰된 수행을 정리하며, 학생의 지능·성격 또는 공인 문해력 수준을 진단하지 않습니다.</small></div></section>

    <section className="landing-fit" id="pilot"><div className="shell"><div className="landing-section-head"><Kicker>PILOT PROGRAM · 2–3 ACADEMIES</Kicker><h2>첫 수업을 함께 검토할<br /><em>파일럿 학원을 모집합니다.</em></h2></div><div className="fit-grid"><div className="fit-facts"><div><b>대상</b><span>초6~중1</span></div><div><b>권장 인원</b><span>6~12명</span></div><div><b>운영 시점</b><span>내신 직후 · 방학특강 · 체험수업</span></div><div><b>확인할 항목</b><span>준비시간 · 수업 운영 · 학생 결과물</span></div></div><div className="pilot-callout"><h3>우리 학원에서<br />운영할 수 있는지 확인해보세요.</h3><p>실제 학원 환경에서 수업 운영 방식과 학생 결과물을 함께 검토합니다. 학급 규모와 운영 방식에 따라 안내드립니다.</p><a className="button button-outline" href="#apply">파일럿 운영 상담하기 <span>↗</span></a></div></div></div></section>

    <section className="landing-faq shell"><div className="landing-section-head"><Kicker>QUESTIONS BEFORE REVIEW</Kicker><h2>검토 전에<br /><em>궁금한 점을 확인하세요.</em></h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="landing-apply shell" id="apply"><div className="apply-intro"><Kicker>GET THE REVIEW PACK</Kicker><h2>우리 학원에서<br /><em>운영할 수 있는지</em><br />먼저 자료로 확인해보세요.</h2><p>4차시 커리큘럼과 1회차 학생용 단서 카드, 교사용 진행안 샘플을 보내드립니다.</p></div><form className="apply-form" action="mailto:hello@dullg.com" method="post" encType="text/plain"><h3>무료 검토자료 요청하기</h3><label>학원명 <span>필수</span><input name="academy" placeholder="학원 또는 공부방 이름" required /></label><label>담당자명 <span>필수</span><input name="name" placeholder="원장님 또는 선생님" required /></label><label>연락 가능한 연락처 <span>필수</span><input name="contact" placeholder="휴대전화 또는 이메일" required /></label><div className="form-split"><label>담당 학년 <span>필수</span><select name="grade" defaultValue="" required><option value="" disabled>선택해주세요</option><option>초등 6학년</option><option>중학교 1학년</option><option>초6~중1 혼합</option></select></label><label>예상 학생 수 <small>선택</small><input name="students" placeholder="예: 8명" /></label></div><label>요청 유형 <span>필수</span><select name="request" defaultValue="sample" required><option value="sample">1회차 샘플 요청</option><option value="pilot">파일럿 운영 상담</option></select></label><label className="consent"><input type="checkbox" name="consent" required /> 연락과 자료 발송을 위한 개인정보 수집에 동의합니다.</label><button className="button button-dark" type="submit">무료 검토자료 요청하기 <span>↗</span></button><small>요청하신 연락처로 커리큘럼과 1회차 샘플 자료를 안내드립니다.</small></form></section>
    <Footer /></main>;
}
