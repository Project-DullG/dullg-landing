export const startupGuide = {
  href: "/materials/modoo-startup",
  title: "모두의 창업 · 아이디어부터 신청서까지",
  prompt: "/assets/materials/modoo-startup/idea-to-application-v1.2.md",
  pdf: "/assets/materials/modoo-startup/application-manual-round2.pdf",
};

export const guideSteps = [
  {
    title: ["관심 있는 문제부터 적어보세요", "Start with a problem you know"],
    body: ["완성된 사업계획서부터 쓰려고 하지 않아도 됩니다. 학교나 집에서 겪은 불편, 주변 사람이 반복해서 하는 수고를 한 가지 적어보세요. 누구에게 어떤 문제가 있는지 설명하는 것이 첫 단계입니다.", "You do not need to begin with a finished business plan. Write down one inconvenience at school or home, or a task people repeatedly struggle with. First, explain who has the problem and when it happens."],
    prompt: ["아직 창업 아이디어가 없어. 관심 분야는 [분야]이고, [상황]에서 [불편]을 겪었어. 서로 다른 해결 방법 3개를 제안하고, 각각 누구를 위한 것인지 설명해줘.", "I do not have a business idea yet. I am interested in [field] and experienced [problem] in [situation]. Suggest three different solutions and explain who each one would help."],
    result: ["해결하고 싶은 문제 한 가지와 아이디어 후보 3개", "One problem and three possible solutions"],
  },
  {
    title: ["첫 고객과 기존 해결 방법을 정하세요", "Identify your first customer and existing alternatives"],
    body: ["‘모든 사람’ 대신 먼저 만날 수 있는 고객을 정하세요. 그 사람이 지금 문제를 어떻게 해결하는지 알아보고, 내 아이디어가 무엇을 바꾸는지 비교합니다. AI의 추측은 실제 고객에게 확인할 질문으로 남겨두세요.", "Choose a customer you can actually reach, rather than everyone. Find out how they solve the problem today and compare your idea with that approach. Treat AI suggestions as questions to check with real customers."],
    prompt: ["선택한 아이디어는 [아이디어]야. 첫 고객, 사용하는 상황, 현재 쓰는 대안, 내 아이디어의 차이를 정리해줘. 확인된 사실과 추측을 나누고 고객에게 물어볼 질문 3개를 만들어줘.", "My chosen idea is [idea]. Describe the first customer, use case, current alternatives and what changes with my idea. Separate facts from assumptions and suggest three questions to ask customers."],
    result: ["첫 고객·기존 대안·차이점·확인할 질문", "First customer, alternatives, differences and research questions"],
  },
  {
    title: ["누가 돈을 내고, 무엇부터 만들지 정하세요", "Decide who pays and what to test first"],
    body: ["사용하는 사람과 돈을 내는 사람이 다를 수 있습니다. 무엇을 얼마에 제공할지 가정하고, 비용과 제작 시간을 적어보세요. 처음부터 앱 전체를 만들기보다 종이 시안이나 간단한 시제품으로 확인할 방법을 찾습니다.", "The user and the buyer may be different people. Make an initial assumption about your offer and price, then estimate costs and production time. Consider a paper prototype or small trial before building an entire app."],
    prompt: ["이 아이디어의 사용자와 구매자를 구분해줘. 첫 상품, 가격 가정, 필요한 비용, 작게 시험할 방법을 제안해줘. 숫자는 확정된 실적이 아니라 확인할 가정으로 표시해줘.", "Separate the user from the buyer. Suggest a first offer, a price assumption, costs and a small test. Label numbers as assumptions to verify, not completed results."],
    result: ["첫 상품·가격 가정·비용·시험할 방법", "First offer, assumed price, costs and a small test"],
  },
  {
    title: ["신청 문항에 맞춰 초안을 쓰세요", "Draft answers to the actual application questions"],
    body: ["공식 신청 화면의 문항을 확인한 뒤 앞에서 정리한 내용을 옮깁니다. 한 줄 소개, 아이디어를 떠올린 배경, 차별점, 수익 계획, 사업화 계획, 멘토에게 받고 싶은 도움을 각각 구분하세요. 제공 매뉴얼의 Q3-1·Q3-2·Q4-1·Q4-2에는 각 2,000자가 표시되어 있습니다. 실제 입력 화면의 제한이 우선입니다.", "Check the official form before drafting. Separate your one-line introduction, background, differences, revenue plan, execution plan and mentoring needs. The supplied manual lists 2,000 characters each for Q3-1, Q3-2, Q4-1 and Q4-2; follow the limits shown in the actual form."],
    prompt: ["앞에서 정리한 내용을 첨부한 실제 신청 문항 순서로 작성해줘. 내가 하지 않은 인터뷰·매출·수상·계약은 쓰지 마. 완료한 일과 앞으로 할 일을 구분하고, 확인이 필요한 내용은 본문 밖에 표시해줘.", "Draft answers in the order of the actual application questions I provide. Do not invent interviews, revenue, awards or contracts. Separate completed work from plans, and list items that need checking outside the draft."],
    result: ["문항별 초안과 추가로 확인할 사항", "A draft for each question and a list of checks"],
  },
  {
    title: ["직접 읽고 확인한 뒤 제출하세요", "Review the draft yourself before submitting"],
    body: ["AI는 질문과 초안을 만드는 데 도움을 주지만, 실제 경험과 신청 자격을 확인해주지는 않습니다. 내가 설명할 수 없는 문장은 고치고, 출처가 없는 수치는 빼세요. 연락처와 필수 항목을 확인한 뒤 제출하고 접수 상태도 확인합니다.", "AI can help with questions and drafts, but it cannot verify your experience or eligibility. Rewrite statements you cannot explain and remove unsupported figures. Check contact details and required fields, then submit and confirm the submission status."],
    prompt: ["이 신청서를 검토해줘. 문항끼리 다른 고객·가격·일정, 근거 없는 수치, 실제 경험처럼 쓴 가정을 찾아줘. 고칠 이유와 수정안을 보여주고, 내가 최종 확인할 목록을 정리해줘.", "Review this application for inconsistent customers, prices or dates, unsupported figures and assumptions written as real experience. Explain each issue, propose a revision and list what I must check myself."],
    result: ["직접 확인한 신청서와 접수 상태", "A personally reviewed application and confirmed submission status"],
  },
];

export const manualTitles = [
  ["모두의 창업 홈페이지 접속", "Open the official website"],
  ["로그인 방식 선택", "Choose a sign-in method"],
  ["계정 로그인", "Sign in to your account"],
  ["필수 동의 항목 확인", "Review required consent items"],
  ["닉네임 입력", "Enter a nickname"],
  ["도전하기 메뉴", "Open the application menu"],
  ["본인인증 안내", "Identity verification consent"],
  ["본인인증 수단 선택", "Choose a verification method"],
  ["신청 분야 선택 예시", "Example of choosing an application track"],
  ["아이디어와 신청 문항 작성", "Complete the application questions"],
  ["멘토기관 선택 예시", "Example of choosing a mentoring institution"],
  ["연락처 확인과 제출", "Check contact details and submit"],
];
