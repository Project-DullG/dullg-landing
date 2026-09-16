export function StartupLessonReview({ en }: { en: boolean }) {
  const sections = en ? [
    ["Prepare the application one step at a time", "The class covered the application screens and how to work through the questions using Back, Save draft and Next. Start with a short outline, complete the relevant fields, save your work and revise it. A saved draft is not a submitted application: confirm submission separately."],
    ["Describe a business, not just an interesting idea", "Explain who pays, what you offer, how revenue could cover costs, and why a customer would choose it over an existing alternative. Describe how you could reach your first customers and what would need to happen before expanding. Compare existing products and manual or free alternatives."],
    ["Connect your experience to the work ahead", "The lecture notes discuss team expertise, relationships and possible social contributions. Use real club projects, production work or research to explain what you can do. State what help you still need. These are review topics from the class, not a universal scoring rubric: consult your track and institution’s actual criteria."],
    ["Generate three different ideas and compare them", "If you do not have an idea, begin with an interest, something you have tried or an inconvenience you noticed. Education, games, tourism, food, shopping, social media, events and part-time work can all be starting points. Ask AI for three ideas based on different problems or business models, then compare customers, revenue, startup costs, execution difficulty and possible growth. Treat suggestions and market claims as assumptions until checked."],
    ["Develop one idea through questions", "Ask who uses it and who pays, what problem it solves, why it improves on current alternatives, how you can test it on a small scale, and how it could grow after that test. Use the answers to draft the application. AI helps you compare and revise ideas; you remain responsible for checking facts and describing your own experience accurately."],
  ] : [
    ["신청서는 한 단계씩 작성하고 보완합니다", "강의에서는 신청 화면을 보며 ‘뒤로’, ‘임시저장’, ‘다음’ 기능과 작성 순서를 살펴봤습니다. 아이디어를 짧게 정리한 뒤 필요한 항목을 채우고, 저장하면서 보완하는 방식입니다. 임시저장은 최종 제출과 다르므로 마지막에는 접수 상태를 따로 확인해야 합니다."],
    ["재미있는 아이디어를 넘어 사업 내용을 설명합니다", "누가 돈을 내는지, 무엇을 제공하는지, 비용과 수익이 어떻게 맞는지, 기존 대안보다 왜 나은지 설명합니다. 첫 고객을 만날 방법과 그다음에 사업을 넓힐 조건도 생각해봅니다. 비슷한 제품뿐 아니라 고객이 지금 쓰는 무료 도구나 수작업도 비교 대상입니다."],
    ["실행할 사람의 경험과 필요한 도움을 정리합니다", "강의 요약에서는 팀의 전문성, 협력 관계를 만들 역량, 사업의 사회적 기여도 함께 다뤘습니다. 동아리·제작·조사 등 실제로 해본 일을 바탕으로 맡을 수 있는 역할을 설명하고, 부족한 부분은 누구에게 어떤 도움을 받을지 적습니다. 모든 분야에 같은 평가표가 적용된다는 뜻은 아니므로, 실제 지원 트랙과 기관의 평가지표는 별도로 확인하세요."],
    ["아이디어가 없다면 후보 3개를 만들어 비교합니다", "관심 분야, 해본 일, 생활 속 불편, 주변 사람이 겪는 문제 중 하나부터 시작합니다. 교육·보드게임·관광·음식·쇼핑·SNS·행사·아르바이트 경험도 소재가 될 수 있습니다. AI에는 이름만 다른 아이디어가 아니라 문제나 수익 방식이 다른 후보 3개를 요청합니다. 고객, 수익 방식, 초기 비용, 실행 난이도, 성장 경로를 비교하되 AI의 제안과 시장 주장은 확인할 가정으로 남겨둡니다."],
    ["질문을 이어가며 한 가지 아이디어를 구체화합니다", "사용자와 구매자는 누구인지, 어떤 문제를 해결하는지, 기존 방식보다 왜 나은지, 작게 무엇을 시험할지, 시험 후 어떻게 확장할지를 차례로 묻습니다. 그 답을 신청 문항에 맞춰 정리하세요. AI는 후보 비교와 초안 수정에 활용하고, 사실 확인과 본인의 경험 설명은 직접 해야 합니다."],
  ];
  return <section id="review">
    <h2>{en ? "Class review · lecture notes" : "수업 다시보기 · 강의노트"}</h2>
    <p>{en ? "September 16 online class: applying to Modoo Startup and developing business ideas with AI." : "9월 16일 온라인 강의에서는 모두의 창업 신청 방법과 AI를 활용한 창업 아이디어 발굴·보완 과정을 다뤘습니다."}</p>
    <p>{en ? "Based on the instructor-provided Zoom lecture summary, not a verbatim transcript. The video is not currently available on this page; use these notes to review the lesson." : "강사가 제공한 Zoom 강의 요약을 복습용으로 정리했습니다. 발언을 그대로 옮긴 기록은 아닙니다. 현재 이 페이지에는 영상이 등록되어 있지 않으며, 아래 강의노트로 내용을 복습할 수 있습니다."}</p>
    <p><strong>{en ? "You can develop an idea while preparing an application; you do not have to wait for it to be perfect." : "아이디어가 완벽해질 때까지 기다리기보다, 하나씩 구체화하면서 신청을 준비해보세요."}</strong></p>
    {sections.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}
    <details>
      <summary>{en ? "Lecture sequence from the supplied summary" : "제공된 요약으로 보는 강의 순서"}</summary>
      <p>{en ? "Times are approximate and were supplied with the summary; they have not been checked against the video. They are not playback links." : "시간은 제공된 요약의 대략적인 구간이며, 영상과 직접 대조하지 않았습니다. 재생 위치로 이동하는 링크는 아닙니다."}</p>
      <ol>
        <li>{en ? "About 00:00–10:00: application screens, business model, market entry, team capabilities and social contribution." : "약 00:00~10:00: 신청 화면, 사업모델, 시장 진입, 팀 역량과 사회적 기여 설명"}</li>
        <li>{en ? "About 10:00–11:00: discussion and the next steps." : "약 10:00~11:00: 강의 내용에 대한 대화와 다음 단계 안내"}</li>
        <li>{en ? "About 11:00–12:00: an AI demonstration starting without an idea, generating three candidates and comparing them." : "약 11:00~12:00: 아이디어가 없는 상태에서 AI로 후보 3개를 만들고 비교하는 시연"}</li>
        <li>{en ? "About 12:00 to the end: questions, answers and recap." : "약 12:00~종료: 질의응답과 내용 정리"}</li>
      </ol>
    </details>
    <h3>{en ? "After reviewing, write these three things" : "복습을 마쳤다면 세 가지를 적어보세요"}</h3>
    <ol>
      <li>{en ? "One problem you actually observed and the person who experiences it." : "직접 본 불편 한 가지와 그 불편을 겪는 사람"}</li>
      <li>{en ? "Why you chose one of the three ideas, and what is still uncertain." : "후보 3개 중 하나를 선택한 이유와 아직 모르는 점"}</li>
      <li>{en ? "One person to ask or one small test to try this week." : "이번 주에 물어볼 사람 한 명 또는 해볼 작은 시험 한 가지"}</li>
    </ol>
    <nav aria-label={en ? "Continue after the lesson" : "복습 후 실습으로 이동"}>
      <a href="#examples">{en ? "Compare example ideas" : "아이디어 예시 비교하기"}</a>
      <a href="#files">{en ? "Get the v2.0 master prompt" : "마스터 프롬프트 v2.0 받기"}</a>
      <a href="#practice">{en ? "Start the practice steps" : "단계별 실습 시작하기"}</a>
    </nav>
  </section>;
}
