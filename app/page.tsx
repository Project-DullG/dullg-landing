import { Footer, Header, Kicker } from "@/components/site";

const lessonFlow = [
  { number: "01", label: "READ THE CLUES", title: "영어 단서 읽기", body: "인물·시간·장소에 관한 핵심 정보를 찾고, 사실과 추측을 구분합니다." },
  { number: "02", label: "SHARE THE FACTS", title: "정보 설명하기", body: "자신이 가진 단서를 팀원에게 영어로 설명하며 서로 다른 정보를 모읍니다." },
  { number: "03", label: "TEST THE THEORY", title: "가설과 근거 비교하기", body: "질문하고 반박하며 새 단서에 따라 처음의 판단을 다시 살펴봅니다." },
  { number: "04", label: "WRITE THE REPORT", title: "사건보고서 완성하기", body: "최종 주장과 근거를 영어 문장으로 정리해 팀 보고서와 개인 결과물을 남깁니다." },
];

const materials = [
  ["01", "4차시 교사용 수업안", "차시별 목표와 진행 순서를 한눈에 확인합니다.", "/assets/dullg/rulebook-flow.png"],
  ["02", "학생용 영어 단서 카드", "학생이 직접 읽고 팀에 설명하는 핵심 자료입니다.", "/assets/dullg/card-body-1.png"],
  ["03", "학생 워크북", "찾은 정보와 바뀐 생각을 차시별로 기록합니다.", "/assets/dullg/pre-survey.png"],
  ["04", "교사용 진행 대본", "추리게임 경험이 없어도 수업을 이끌 수 있습니다.", "/assets/dullg/director-office.png"],
  ["05", "정답·단계별 힌트", "팀이 막혔을 때 필요한 만큼만 개입합니다.", "/assets/dullg/card-cover-1.png"],
  ["06", "학부모 안내·결과물 양식", "수업에서 무엇을 했는지 설명할 자료가 남습니다.", "/assets/dullg/classroom-case.png"],
];

export default function Home() {
  return <main className="academy-landing"><Header />
    <section className="landing-hero shell"><div className="landing-hero-copy"><Kicker>PROJECT DULLG · ENGLISH PROJECT CLASS</Kicker><h1>내신이 끝난 뒤,<br /><em>학생들이 영어로<br />사건을 해결합니다.</em></h1><p>영어 단서를 읽고 질문하고, 추측하고, 반박하며 팀별 사건보고서를 완성하는 초6~중1 대상 4차시 영어 프로젝트 수업입니다.</p><div className="landing-actions"><a className="button button-dark" href="#apply">1회차 샘플 받아보기 <span>↗</span></a><a className="text-link" href="#pilot">파일럿 운영 상담하기 <span>↗</span></a></div><div className="landing-proof"><span>초6~중1</span><span>총 4차시</span><span>준비 30분 이내 목표</span></div></div><div className="landing-hero-visual"><img src="/assets/dullg/students-investigation.png" alt="학생들이 영어 단서와 평면도를 함께 살펴보는 수업 장면" /><div className="landing-visual-note"><b>CASE 01</b><br />보충반의 사라진 열쇠<br /><small>READ · SHARE · REPORT</small></div></div></section>

    <section className="landing-problem shell"><div><Kicker>WHY ACADEMIES NEED IT</Kicker><h2>재미있는 활동만으로는<br /><em>방학특강이 되기 어렵습니다.</em></h2></div><div className="problem-points"><p><b>01</b><strong>시험이 끝나면<br />집중력이 떨어집니다.</strong><span>다음 수업을 기다리게 만드는 실제 장면이 필요합니다.</span></p><p><b>02</b><strong>활동형 수업은<br />준비 부담이 큽니다.</strong><span>교사가 자료를 새로 만들지 않아도 바로 시작할 수 있어야 합니다.</span></p><p><b>03</b><strong>재미만으로는<br />설명이 부족합니다.</strong><span>학생이 무엇을 읽고 판단했는지 학부모에게 보여줄 결과물이 필요합니다.</span></p></div><div className="landing-value"><Kicker>THE DULLG APPROACH</Kicker><p>Project DullG는 학생의 참여뿐 아니라 <strong>교사의 운영 편의성, 학생 결과물, 학부모 설명 가능성</strong>까지 함께 설계합니다.</p></div></section>

    <section className="landing-flow shell" id="flow"><div className="landing-section-head"><Kicker>WHAT HAPPENS IN CLASS</Kicker><h2>학생들은 영어를<br /><em>사건 해결에 사용합니다.</em></h2><p>영어를 많이 아는 학생만 참여하는 수업이 아닙니다. 각자 가진 단서를 설명하고, 팀의 판단을 함께 만들어가는 구조입니다.</p></div><div className="flow-list">{lessonFlow.map((item) => <article className="flow-item" key={item.number}><div className="flow-number">{item.number}</div><div><Kicker>{item.label}</Kicker><h3>{item.title}</h3><p>{item.body}</p></div><span className="flow-arrow">↗</span></article>)}</div></section>

    <section className="landing-materials" id="materials"><div className="shell"><div className="landing-section-head"><Kicker>READY-TO-RUN MATERIALS</Kicker><h2>수업에 필요한 자료를<br /><em>한 번에 제공합니다.</em></h2><p>교사 준비시간 30분 이내를 목표로, 수업을 바로 운영할 수 있는 완성형 패키지를 구성합니다.</p></div><div className="materials-grid">{materials.map(([number, title, body, image]) => <article className="material-item" key={number}><div className="material-image"><img src={image} alt="" /></div><div className="material-copy"><span>{number}</span><h3>{title}</h3><p>{body}</p></div></article>)}</div></div></section>

    <section className="landing-results shell" id="results"><div className="results-visual"><div className="result-sheet"><span>STUDENT ACTIVITY RECORD · SAMPLE</span><h3>이번 판단을<br /><em>이렇게 설명했습니다.</em></h3><div className="result-line"><b>핵심 단서</b><i /><strong>03</strong></div><div className="result-line"><b>가설 수정</b><i /><strong>YES</strong></div><blockquote>“The key was in the office<br />because the note changed.”</blockquote><small>실제 수업 중 관찰된 활동을 정리한 예시입니다.</small></div></div><div className="results-copy"><Kicker>WHAT REMAINS AFTER CLASS</Kicker><h2>재미로 끝나지 않고<br /><em>결과물이 남습니다.</em></h2><p>학생이 선택한 핵심 단서, 처음 세운 가설과 수정한 가설, 주장과 근거를 연결한 영어 문장을 확인할 수 있습니다.</p><ul><li>팀별 사건보고서</li><li>개인 영어 작성지</li><li>교사가 확인한 활동 기록</li></ul><small>학생의 잠재능력이나 성격을 진단하는 자료가 아니라, 수업 중 실제 활동을 정리한 자료입니다.</small></div></section>

    <section className="landing-fit" id="pilot"><div className="shell"><div className="landing-section-head"><Kicker>MADE FOR SMALL & MID-SIZE ACADEMIES</Kicker><h2>우리 학원 일정에<br /><em>맞춰 시작할 수 있습니다.</em></h2></div><div className="fit-grid"><div className="fit-facts"><div><b>대상</b><span>초6~중1</span></div><div><b>횟수</b><span>총 4차시</span></div><div><b>권장 인원</b><span>6~12명</span></div><div><b>운영 시점</b><span>내신 직후 · 방학특강 · 체험수업</span></div><div><b>운영자</b><span>기존 영어 교사</span></div></div><div className="pilot-callout"><Kicker>LIMITED PILOT · 2–3 ACADEMIES</Kicker><h3>실제 학원 환경에서<br />먼저 확인해보세요.</h3><p>수업 운영 방식과 학생 결과물을 함께 검토할 파일럿 학원을 모집하고 있습니다. 학급 규모와 운영 방식에 따라 안내드립니다.</p><a className="button button-dark" href="#apply">파일럿 상담 신청 <span>↗</span></a></div></div></div></section>

    <section className="landing-apply shell" id="apply"><div className="apply-intro"><Kicker>GET THE REVIEW PACK</Kicker><h2>우리 학원에서<br /><em>운영할 수 있는지</em><br />먼저 확인해보세요.</h2><p>4차시 커리큘럼과 1회차 학생용 단서 카드, 교사용 진행안 샘플을 보내드립니다.</p></div><form className="apply-form" action="mailto:hello@dullg.com" method="post" encType="text/plain"><h3>무료 검토자료 요청하기</h3><div className="form-split"><label>학원명<input name="academy" placeholder="학원 또는 공부방 이름" required /></label><label>담당자명<input name="name" placeholder="원장님 또는 선생님" required /></label></div><div className="form-split"><label>연락처<input name="phone" placeholder="010-0000-0000" required /></label><label>이메일<input name="email" type="email" placeholder="hello@example.com" required /></label></div><div className="form-split"><label>담당 학년<select name="grade" defaultValue=""><option value="" disabled>선택해주세요</option><option>초등 6학년</option><option>중학교 1학년</option><option>초6~중1 혼합</option></select></label><label>예상 학생 수<input name="students" placeholder="예: 8명" /></label></div><label>희망 운영 시기<input name="timing" placeholder="예: 겨울방학 첫 주" /></label><label>요청 내용<select name="request" defaultValue="sample"><option value="sample">1회차 샘플 요청</option><option value="pilot">유료 파일럿 상담</option></select></label><label className="consent"><input type="checkbox" name="consent" required /> 연락과 자료 발송을 위한 개인정보 수집에 동의합니다.</label><button className="button button-dark" type="submit">무료 검토자료 요청하기 <span>↗</span></button><small>제출하면 기본 메일 앱이 열립니다. 확인 후 담당자가 연락드립니다.</small></form></section>
    <Footer /></main>;
}
