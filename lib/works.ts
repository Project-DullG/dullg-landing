import { getFundingProject, getFundingStatus, formatFundingSummary, fundingSummaryPeriod, type FundingProject } from "./funding.ts";

type WorkStatus = "펀딩 중" | "출시" | "앱 공개";

export type Work = {
  slug: string;
  status: WorkStatus;
  fundingId?: FundingProject["id"];
  title: string;
  players: string;
  duration: string;
  platform: string;
  synopsis: string;
  image: string;
  alt: string;
  externalUrl: string;
  externalLabel: string;
  characteristics: string[];
  officialIntroduction?: {
    quote: string;
    paragraphs: string[];
    characters: { name: string; description: string }[];
    notes: string[];
  };
  record: {
    label: string;
    title: string;
    detail: string;
  };
};

const dg0 = getFundingProject("projectdg0");
const dg1 = getFundingProject("projectdg1");
const dg2 = getFundingProject("projectdg2");

export const works: Work[] = [
  {
    slug: "slime-soda",
    status: "펀딩 중",
    fundingId: "projectdg2",
    title: "슬라임은 소다맛이 난다",
    players: "4–5인",
    duration: "60분",
    platform: "실물 보드게임",
    synopsis: "몬스터들이 모여 사는 포포롱 마을. 작은 구조대의 아침을 준비하던 슬라임이 냉동고 안에서 얼어붙은 채 발견됩니다. 한동안 슬라임만 바라보던 대원들은 서로의 얼굴을 살피기 시작합니다.",
    image: "/assets/works/slime-soda-cover.webp",
    alt: "냉동고 안의 슬라임이 그려진 슬라임은 소다맛이 난다 패키지",
    externalUrl: "https://tumblbug.com/projectdg2",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["몬스터 구조대를 배경으로 한 사건", "4명 또는 5명이 함께 진행", "한 시간 안에 진행하는 구성"],
    record: { label: "진행 중인 펀딩", title: "머더미스터리 2종", detail: `${fundingSummaryPeriod(dg2)} · 텀블벅` },
  },
  {
    slug: "professor-rest",
    status: "펀딩 중",
    fundingId: "projectdg2",
    title: "교수님, 편히 쉬세요",
    players: "5인",
    duration: "90분",
    platform: "실물 보드게임",
    synopsis: "청람대학교 연구실 구성원들은 프로젝트가 끝난 뒤 호숫가 연수원으로 향합니다. 모두가 함께 쉬기로 한 다음 날 아침, 박정호 교수는 호숫가 계단 아래에서 죽은 채 발견됩니다.",
    image: "/assets/works/professor-rest-cover.webp",
    alt: "비어 있는 교수실 의자가 그려진 교수님 편히 쉬세요 패키지",
    externalUrl: "https://tumblbug.com/projectdg2",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["대학 연구실과 연수원을 오가는 사건", "다섯 인물의 관계를 중심으로 진행", "90분 분량의 실물 머더미스터리"],
    record: { label: "진행 중인 펀딩", title: "머더미스터리 2종", detail: `${fundingSummaryPeriod(dg2)} · 텀블벅` },
  },
  {
    slug: "snake-carnival",
    status: "출시",
    title: "뱀이 죽은 축제",
    players: "4인",
    duration: "120분",
    platform: "실물 보드게임",
    synopsis: "달빛조차 닿지 않는 지하 예배실. 굳게 잠긴 문이 열린 뒤 제단 위에서 교주가 숨진 채 발견됩니다. 가면을 쓴 네 사람은 각자의 비밀을 지키며 진짜 범인을 찾아야 합니다.",
    image: "/assets/works/snake-carnival-cover.webp",
    alt: "검은색 실물 패키지로 제작된 뱀이 죽은 축제",
    externalUrl: "https://tumblbug.com/projectdg0",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["폐쇄된 지하 예배실에서 시작되는 사건", "카드 소지와 조사 과정을 활용하는 진행", "네 명이 각자의 비밀을 가진 구성"],
    record: { label: "펀딩 성공", title: "4인용 머더 미스터리 뱀이 죽은 축제", detail: formatFundingSummary(dg0) },
  },
  {
    slug: "gray-girl-memory",
    status: "앱 공개",
    title: "잿빛 소녀가 죽은 추억(醜憶)",
    players: "4인",
    duration: "150분",
    platform: "UZU",
    synopsis: "다른 세계의 존재를 불러들여 재앙을 일으킨 잿빛 일족은 세상의 미움을 받게 됩니다. 오랜 시간이 흐른 뒤, 잿빛 머리 소녀가 직접 만든 네 인형의 눈에 붉은빛이 돕니다. 소녀는 하루 동안의 소망을 품고 쿠로에게 초대장을 맡깁니다.",
    image: "/assets/works/gray-girl-memory-cover.webp",
    alt: "잿빛 소녀가 죽은 추억 공식 작품 이미지",
    externalUrl: "https://www.uzu-app.com/ko/scenario/15536",
    externalLabel: "UZU 공식 작품 정보",
    characteristics: ["작품 속 규칙과 설정을 근거로 추리", "높은 추리 난이도와 복잡한 문장 구성", "작은 단서를 분석하고 조합하는 숙련자에게 권장"],
    officialIntroduction: {
      quote: "그래. 내일이 오기전. 하루만 욕심을 부릴래.",
      paragraphs: [
        "잿빛 일족이 힘을 얻으려 불러낸 존재들은 세상에 재앙을 남깁니다. 영웅들의 희생과 용서 뒤에도 재앙이 반복되자, 사람들은 잿빛 일족을 증오하게 됩니다.",
        "오늘날, 잿빛 머리 소녀 앞에는 사람만 한 네 인형이 있습니다. 붉은 머리 묘인, 초록 머리 엘프, 노란 머리 드워프, 푸른 머리 인간. 소녀가 말을 건네자 인형들의 눈이 붉게 빛납니다. 소녀는 서랍에서 초대장을 꺼내 쿠로에게 전달을 부탁합니다.",
      ],
      characters: [
        { name: "붉은 머리의 묘인", description: "대검을 지닌 남성. 사건 당일 장작을 맡습니다." },
        { name: "노란 머리의 드워프", description: "큰 방패를 지닌 남성. 사건 당일 테이블을 배치합니다." },
        { name: "파란 머리의 인간", description: "활을 지닌 여성. 사건 당일 요리를 맡습니다." },
        { name: "초록 머리의 엘프", description: "지팡이를 지닌 여성. 사건 당일 차를 준비합니다." },
      ],
      notes: [
        "일반 상식보다 작품 안의 규칙과 설정을 근거로 추리해야 합니다. 난이도가 높고 문장이 복잡해 숙련자에게 권장됩니다.",
        "소지품과 자료 조사 시스템이 연결되어 있어, 조사를 위해 소지품을 내려놓아야 하는 상황이 있습니다.",
        "등장인물 이미지는 생성형 AI(Nano Banana)를 활용해 제작되었습니다.",
      ],
    },
    record: { label: "앱 공개", title: "UZU 수록 시나리오", detail: "2025년 12월 31일 공개 · Project DullG 제작" },
  },
  {
    slug: "red-lab",
    status: "출시",
    title: "레드가 죽은 연구소",
    players: "4인",
    duration: "90분",
    platform: "실물 보드게임",
    synopsis: "괴인과의 전투를 마친 다음 날, 레인저들의 구심점인 레드가 잠긴 방에서 숨진 채 발견됩니다. 남은 네 레인저는 비밀 연구소를 조사하며 그날 밤의 일을 되짚습니다.",
    image: "/assets/works/red-lab-cover.webp",
    alt: "검은 패키지로 제작된 레드가 죽은 연구소",
    externalUrl: "https://tumblbug.com/projectdg1",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["전대물과 비밀 연구소를 결합한 배경", "네 명의 레인저가 사건을 재구성", "90분 분량의 실물 머더미스터리"],
    record: { label: "펀딩 성공", title: "깊은 서사와 맑은 추리, 머더미스터리 3종", detail: formatFundingSummary(dg1) },
  },
  {
    slug: "gourmet-master",
    status: "출시",
    title: "미식의 대가",
    players: "4인",
    duration: "90분",
    platform: "실물 보드게임",
    synopsis: "왕실 요리사 선발 대회의 비공개 심사가 끝난 순간 왕실 요리장이 쓰러집니다. 현장에 있던 네 요리사는 접시와 요리에 남은 단서로 범인을 찾아야 합니다.",
    image: "/assets/works/gourmet-cover.webp",
    alt: "검은 패키지로 제작된 미식의 대가",
    externalUrl: "https://tumblbug.com/projectdg1",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["왕실 요리 대회를 배경으로 한 사건", "요리와 접시에 남은 정보를 활용", "네 명이 함께 진행하는 90분 구성"],
    record: { label: "펀딩 성공", title: "깊은 서사와 맑은 추리, 머더미스터리 3종", detail: formatFundingSummary(dg1) },
  },
  {
    slug: "too-many-doctors",
    status: "출시",
    title: "의사가 너무 많아!",
    players: "6인",
    duration: "150분",
    platform: "실물 보드게임",
    synopsis: "전국에서 모인 여섯 명의 의사가 국왕의 치료를 마치지만 왕은 한 시간 뒤 숨을 거둡니다. 명예와 생존을 위해 의사들은 왕의 사인과 진짜 범인을 밝혀야 합니다.",
    image: "/assets/works/doctor-cover.webp",
    alt: "검은 패키지로 제작된 의사가 너무 많아",
    externalUrl: "https://tumblbug.com/projectdg1",
    externalLabel: "텀블벅 프로젝트",
    characteristics: ["국왕의 치료 직후 벌어진 사건", "여섯 의사의 관계와 진술을 중심으로 진행", "150분 분량의 실물 머더미스터리"],
    record: { label: "펀딩 성공", title: "깊은 서사와 맑은 추리, 머더미스터리 3종", detail: formatFundingSummary(dg1) },
  },
];

export function getWorkStatus(work: Work, today: Date = new Date()): WorkStatus {
  if (work.status === "펀딩 중" && work.fundingId) {
    return getFundingStatus(getFundingProject(work.fundingId), today) === "진행 중" ? "펀딩 중" : "출시";
  }
  return work.status;
}

export const publishedWorks = (today: Date = new Date()) => works.filter((work) => getWorkStatus(work, today) !== "펀딩 중");
export const currentWorks = (today: Date = new Date()) => works.filter((work) => getWorkStatus(work, today) === "펀딩 중");
export const homeFeaturedWorks = works.filter((work) => ["slime-soda", "professor-rest", "snake-carnival"].includes(work.slug));

export function getWork(slug: string) {
  return works.find((work) => work.slug === slug);
}
