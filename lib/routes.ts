export type RouteGroup = "studio" | "education" | "resources";
export type PublicRoute = {
  path: string;
  title: string;
  description: string;
  group: RouteGroup;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

export const publicRoutes: PublicRoute[] = [
  {
    path: "/",
    title: "홈",
    description: "단서공방의 작품과 영어 미스터리 수업팩을 소개합니다.",
    group: "studio",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/works",
    title: "작품과 펀딩",
    description: "공개한 작품을 한 편씩 살펴보고 펀딩 기록을 확인합니다.",
    group: "studio",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/activity",
    title: "제작·활동 기록",
    description: "확인된 제작 결과와 예정된 활동을 구분해 기록합니다.",
    group: "studio",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    path: "/activity/ulleung-high-living-lab",
    title: "울릉고 리빙랩 특강",
    description: "2026년 9월 5일 교육 활동과 공개 자료를 확인합니다.",
    group: "studio",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/about",
    title: "단서공방 소개",
    description: "어떤 콘텐츠를 만들고 있는지 소개합니다.",
    group: "studio",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/academy",
    title: "교육 수업팩 소개",
    description: "대상, 구성과 사용 장면, 함께 제공되는 운영 도구를 한눈에 봅니다.",
    group: "education",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/academy/curriculum",
    title: "4차시 수업 흐름",
    description: "사건 읽기부터 팀 보고서까지 차시별 흐름을 확인합니다.",
    group: "education",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/academy/sample",
    title: "수업 자료 미리보기",
    description: "단서 카드, 사건 자료, 규칙서와 교사용 자료의 실물을 확인합니다.",
    group: "education",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/episode",
    title: "수업용 에피소드",
    description: "수업에 사용하는 첫 사건의 배경과 인물을 살펴봅니다.",
    group: "education",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/academy/pilot",
    title: "파일럿 운영 안내",
    description: "진행 절차, 확인 기준과 무료 검토팩 요청 양식을 안내합니다.",
    group: "education",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/materials",
    title: "수강생 자료실",
    description: "지난 교육에서 사용한 공개 자료를 과정별로 모았습니다.",
    group: "resources",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/materials/ulleung-high-living-lab",
    title: "울릉고 리빙랩 특강 발표자료",
    description: "발표자료 15쪽을 웹에서 바로 확인합니다.",
    group: "resources",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/contact",
    title: "문의하기",
    description: "작품과 교육 운영에 관한 질문을 남길 수 있습니다.",
    group: "resources",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/privacy",
    title: "개인정보 처리 안내",
    description: "검토팩 요청 과정에서 수집하는 정보와 처리 방식을 확인합니다.",
    group: "resources",
    priority: 0.3,
    changeFrequency: "yearly",
  },
  {
    path: "/sitemap",
    title: "전체 페이지",
    description: "사이트의 모든 페이지를 목적별로 안내합니다.",
    group: "resources",
    priority: 0.4,
    changeFrequency: "monthly",
  },
];

export function getRoute(path: string): PublicRoute {
  const route = publicRoutes.find((r) => r.path === path);
  if (!route) throw new Error(`Unknown public route: ${path}`);
  return route;
}
