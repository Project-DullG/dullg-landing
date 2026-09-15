export const lesson2 = {
  href: "/materials/ulleung-high-lesson-2",
  date: "2026-09-19",
  pdf: "/assets/materials/ulleung-high-2026-09-19-revised.pdf",
  titles: [
  [
    "울릉에서, 함께 만드는 사업",
    "Building a business together on Ulleungdo"
  ],
  [
    "단서공방의 게임들",
    "Games by Project DullG"
  ],
  [
    "오늘의 수업",
    "Today's class"
  ],
  [
    "이번 학기 프로젝트",
    "This semester's project"
  ],
  [
    "창업",
    "Entrepreneurship"
  ],
  [
    "창업의 주요 업무",
    "Main tasks in starting a business"
  ],
  [
    "제품 만들기와 사업 운영",
    "Making a product and running a business"
  ],
  [
    "창업 전 검토할 것",
    "Checks before starting a business"
  ],
  [
    "같은 울릉, 서로 다른 관심",
    "Different interests on Ulleungdo"
  ],
  [
    "사용자와 구매자",
    "Users and buyers"
  ],
  [
    "배를 기다리는 가족",
    "A family waiting for the ferry"
  ],
  [
    "가치 제안 예시",
    "Value proposition example"
  ],
  [
    "고객의 다른 선택",
    "Customers' alternatives"
  ],
  [
    "단서공방 크라우드펀딩 사례",
    "Project DullG crowdfunding cases"
  ],
  [
    "한 학기 동안 만들 결과물",
    "This semester's deliverables"
  ],
  [
    "홍보와 판매 채널",
    "Promotion and sales channels"
  ],
  [
    "제작 수량과 비용",
    "Production quantity and costs"
  ],
  [
    "보드게임 제작 견적서",
    "Board game production quote"
  ],
  [
    "제작 견적 확대: 카드와 매뉴얼",
    "Quote details: cards and manuals"
  ],
  [
    "제작 견적 확대: 보드판과 상자",
    "Quote details: board and box"
  ],
  [
    "만든 뒤, 포장과 배송",
    "Packing and shipping"
  ],
  [
    "한 개를 팔 때의 계산",
    "Calculating a sale"
  ],
  [
    "사업 운영과 세무 업무",
    "Business operations and tax tasks"
  ],
  [
    "사업자 정보 변경",
    "Updating business registration details"
  ],
  [
    "저작권, 개인정보, 거래 책임",
    "Copyright, privacy and transaction responsibilities"
  ],
  [
    "우리 팀이 창업 전에 검토한 질문",
    "Questions we reviewed before starting"
  ],
  [
    "일을 나눌 때 정할 것",
    "Assigning work"
  ],
  [
    "아이디어 검토 메모",
    "Idea review notes"
  ],
  [
    "우리가 아는 울릉",
    "The Ulleungdo we know"
  ],
  [
    "나의 자원과 관심",
    "My resources and interests"
  ],
  [
    "먼저 만나 볼 고객",
    "Customers to meet first"
  ],
  [
    "고객의 상황과 필요",
    "Customer situations and needs"
  ],
  [
    "울릉의 자원과 고객",
    "Local resources and customers"
  ],
  [
    "아이디어 공유",
    "Sharing ideas"
  ],
  [
    "잠시 쉬어 갑니다",
    "Break"
  ],
  [
    "비즈니스모델",
    "Business models"
  ],
  [
    "사업 메모의 여덟 항목",
    "Eight fields in the business notes"
  ],
  [
    "보드게임 사업모델 예시",
    "Board game business model example"
  ],
  [
    "매거진·울릉소식 사업모델 예시",
    "Magazine business model example"
  ],
  [
    "두 사업팀의 협업",
    "Collaboration between the teams"
  ],
  [
    "우리 팀의 사업 메모",
    "Our team's business notes"
  ],
  [
    "제작과 운영의 실제 업무",
    "Production and operations tasks"
  ],
  [
    "웹게임 테스트와 수정 요청",
    "Web game testing and revision requests"
  ],
  [
    "팀별 AI 활용",
    "AI uses for each team"
  ],
  [
    "AI 업무 요청 예시",
    "An AI task request example"
  ],
  [
    "AI 문장 검토",
    "Reviewing AI writing"
  ],
  [
    "잠시 쉬어 갑니다",
    "Break"
  ],
  [
    "학생창업회사 조직도",
    "Student company organization"
  ],
  [
    "전략기획운영본부",
    "Strategy and operations team"
  ],
  [
    "보드게임팀",
    "Board game team"
  ],
  [
    "매거진미디어팀",
    "Magazine and media team"
  ],
  [
    "홍보와 디지털 제작 지원",
    "Marketing and digital production support"
  ],
  [
    "주 역할과 지원 역할",
    "Lead and support roles"
  ],
  [
    "의사결정과 승인",
    "Decisions and approvals"
  ],
  [
    "희망 역할과 팀 구성",
    "Preferred roles and team formation"
  ],
  [
    "팀 운영 방식",
    "Team working arrangements"
  ],
  [
    "팀 소개",
    "Team introductions"
  ],
  [
    "다음 만남 전 확인할 것",
    "Tasks before the next meeting"
  ]
],
};

export function lesson2Slides(english: boolean) {
  return lesson2.titles.map((titles, index) => ({
    title: titles[english ? 1 : 0],
    summary: "",
    image: `/assets/materials/ulleung-high-2026-09-19-revised/slide-${String(index + 1).padStart(2, "0")}.webp`,
  }));
}
