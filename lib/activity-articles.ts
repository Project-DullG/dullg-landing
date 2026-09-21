import { youthArtsFestival } from "./festival";
import { ulleungPresentation } from "./presentations";
import { ulleungOnlineLecture } from "./ulleung-online";
import { ulleungThirdLecture } from "./ulleung-third";

export type ActivityArticleData = {
  title: string;
  category: string;
  date: string;
  intro: string;
  sections: {
    title: string;
    paragraphs: string[];
    photo?: { src: string; alt: string; caption: string; width?: number; height?: number };
  }[];
  privacyNote?: boolean;
  relatedTitle: string;
  links: { label: string; href: string; download?: boolean }[];
};

export const activityArticles: Record<string, ActivityArticleData> = {
  "ulleung-high-session-3": {
    title: ulleungThirdLecture.title,
    category: "교육",
    date: ulleungThirdLecture.date,
    intro: "9월 19일 토요일, 울릉고등학교를 다시 방문했습니다. 이번 특강은 3차시로, 학생들과 교실에서 만나 창업을 주제로 수업을 진행했습니다.",
    sections: [
      {
        title: "아이디어를 사업으로 만들려면",
        paragraphs: ["이번 수업에서는 창업에 필요한 업무를 살펴봤습니다. 기획과 고객, 사업모델, 팀과 자원뿐 아니라 제작과 운영, 홍보와 판매, 검증과 개선까지 함께 다뤘습니다. 제품을 만드는 일과 사업을 운영하는 일을 구분해 살펴보는 시간입니다."],
        photo: { ...ulleungThirdLecture.image, width: 1600, height: 1200, caption: "9월 19일 울릉고 3차시 특강. 창업의 주요 업무를 설명하는 시간입니다." },
      },
      {
        title: "자료를 함께 살펴보는 시간",
        paragraphs: ["설명 시간 외에도 학생들이 테이블에 둘러앉아 카드와 인쇄 자료를 함께 살펴봤습니다. 이날 수업 사진과 발표자료를 함께 남깁니다. 수업에서 다룬 내용은 아래 자료실에서 다시 볼 수 있습니다."],
        photo: { src: "/assets/activities/ulleung-high-2026-09-19-workshop.webp", alt: "얼굴을 모자이크한 울릉고 학생들이 카드와 인쇄 자료를 살펴보는 모습", width: 1600, height: 1200, caption: "교실에서 카드와 인쇄 자료를 함께 살펴보는 학생들. 사진 속 얼굴은 모자이크했습니다." },
      },
    ],
    relatedTitle: "수업자료와 이전 기록",
    links: [
      { label: "9월 19일 3차시 수업자료", href: "/materials/ulleung-high-lesson-2" },
      { label: "9월 16일 온라인 강의 기록", href: "/activity/ulleung-online-startup-2026" },
      { label: "9월 5일 울릉고 특강 기록", href: "/activity/ulleung-high-living-lab" },
    ],
  },
  "ulleung-online-startup-2026": {
    title: ulleungOnlineLecture.title,
    category: "교육",
    date: ulleungOnlineLecture.date,
    intro: "9월 16일, 울릉도 학생들을 대상으로 모두의 창업 관련 온라인 강의를 진행했습니다. 이번에는 화상회의로 만났습니다.",
    sections: [{
      title: "화면을 공유하며 진행한 강의",
      paragraphs: ["강의에서는 모두의 창업 사이트를 함께 보았습니다. 화상회의의 화면 공유 기능으로 안내 페이지를 띄워 놓고 수업을 진행했습니다."],
      photo: {
        ...ulleungOnlineLecture.image,
        width: 1600,
        height: 684,
        caption: "9월 16일 Zoom 온라인 강의. 참가자 얼굴은 모자이크하고 이름·학번은 가렸습니다. 브라우저 도구 모음은 제외했습니다.",
      },
    }],
    relatedTitle: "관련 수업과 문의",
    links: [
      { label: "수업 다시보기와 실습 자료", href: "/materials/modoo-startup#review" },
      { label: "9월 5일 울릉고 특강 기록", href: "/activity/ulleung-high-living-lab" },
      { label: "교육 문의", href: "/contact" },
    ],
  },
  "ulsan-youth-arts-2026": {
    title: youthArtsFestival.title,
    category: "전시",
    date: youthArtsFestival.date,
    intro:
      "9월 12일, 성남동 젊음의거리에서 열린 2026 울산 중구 청년예술제에 참여했습니다. 청년디딤터 부스에 단서공방의 머더미스터리 작품을 전시했습니다.",
    sections: [
      {
        title: "작품 네 편을 챙겨 행사장으로",
        paragraphs: [
          "이번 행사에는 뱀이 죽은 축제, 레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 가져갔습니다. 게임 상자에 캐릭터 자료를 함께 챙기고, 청년디딤터 부스에 전시할 테이블을 준비했습니다.",
          "부스 앞에는 Project DullG 배너를 세웠습니다. 단서공방이 만드는 머더미스터리와 수업용 교육 키트를 소개하는 배너입니다. 안쪽에는 실물 작품을, 노트북에는 작품 소개 페이지를 열어 두었습니다.",
        ],
      },
      {
        title: "상자를 열고 캐릭터 자료도 꺼냈습니다",
        paragraphs: [
          "표지뿐 아니라 게임 안에 들어 있는 자료도 꺼내 놓았습니다. 뱀이 죽은 축제는 상자를 열어 캐릭터별 자료를 함께 전시했습니다. 자료마다 다른 색의 실루엣과 가면 이름이 붙어 있습니다.",
          "레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!도 실물 상자를 준비했습니다. 온라인에서 소개하던 작품을 인쇄물과 패키지로 함께 보여드렸습니다.",
        ],
        photo: {
          ...youthArtsFestival.image,
          caption: "청년디딤터 부스에 전시한 작품 상자와 캐릭터 자료. 사진: 단서공방",
        },
      },
      {
        title: "부스에서 보신 작품이 궁금하다면",
        paragraphs: [
          "행사장에서 보신 작품을 다시 찾아보실 수 있도록 아래에 네 작품의 링크를 모았습니다. 각 페이지에서 줄거리와 플레이 인원, 소요 시간을 확인하실 수 있습니다.",
        ],
      },
    ],
    relatedTitle: "전시 작품과 행사 안내",
    links: [
      { label: "뱀이 죽은 축제", href: "/works/snake-carnival" },
      { label: "레드가 죽은 연구소", href: "/works/red-lab" },
      { label: "미식의 대가", href: "/works/gourmet-master" },
      { label: "의사가 너무 많아!", href: "/works/too-many-doctors" },
      { label: "행사 일정·장소 안내 기사 ↗", href: youthArtsFestival.source },
    ],
  },
  "ulleung-high-living-lab": {
    title: "울릉고 리빙랩 특강",
    category: "교육",
    date: "2026-09-05",
    intro:
      "9월 5일 울릉고등학교에서 학생들과 게임을 체험하고, AI로 지역 콘텐츠를 기획하는 특강을 진행했습니다. 울릉도에서 해보고 싶은 일을 콘텐츠 아이디어로 정리하는 수업입니다.",
    sections: [
      {
        title: "게임을 만드는 과정을 소개했습니다",
        paragraphs: [
          "수업은 단서공방의 작품 소개로 시작했습니다. 게임 아이디어를 기획하고, 글과 인쇄물을 거쳐 실물 제품으로 만드는 과정을 학생들에게 소개했습니다.",
          "이어서 울릉도에서 좋아하는 것, 바꾸고 싶은 것, 해보고 싶은 일을 이야기했습니다. 발표자료에는 익숙한 장소와 경험에서 게임 소재를 찾을 수 있도록 장소, 사람, 상황, 규칙을 나눠 적는 활동을 준비했습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-high-2026-09-05-class.jpg",
          alt: "울릉고 교실에서 AI 활용 지역 콘텐츠 제작 수업을 준비하는 모습",
          caption: "9월 5일 울릉고등학교의 AI 활용 지역 콘텐츠 제작 수업",
        },
      },
      {
        title: "모둠별로 역할을 맡아 게임을 했습니다",
        paragraphs: [
          "학생들은 모둠을 나누고 각자 역할을 맡아 머더미스터리 게임을 했습니다. 받은 자료에서 단서를 읽고, 같은 모둠의 학생들과 내용을 주고받으며 사건을 풀어가는 활동이었습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-high-2026-09-05-workshop.jpg",
          alt: "울릉고 학생들이 모둠별로 머더미스터리 활동을 진행하는 모습",
          caption: "모둠별로 역할과 단서를 확인하며 게임을 체험하는 학생들",
        },
      },
      {
        title: "내 아이디어를 적은 뒤 AI에 질문하기",
        paragraphs: [
          "AI 실습은 자신의 아이디어를 먼저 적는 순서로 준비했습니다. 어떤 장소에서 무슨 일이 벌어지는지 정하고, AI에 질문하며 제목과 배경, 역할, 미션, 단서를 구체적으로 적어 보는 과제입니다.",
          "발표자료에는 울릉 크루즈를 배경으로 게임을 구상하는 예시를 넣었습니다. 떠올린 소재를 게임으로 바꿔 본 다음, 15분 안에 해볼 수 있는 활동으로 줄이는 방법을 안내했습니다.",
        ],
      },
      {
        title: "수업 자료를 다시 보려면",
        paragraphs: [
          "마지막 과제는 울릉도 소재 세 가지와 콘텐츠 제목, 한 줄 소개, 다음에 해볼 일을 정리하는 것이었습니다. 다른 사람에게 아이디어를 소개하고 의견을 받아볼 수 있도록 소개 문구와 미리보기를 준비하는 내용도 자료에 담았습니다.",
          "9월 5일 발표자료는 아래에서 다시 볼 수 있습니다. 웹으로 읽거나 PDF로 내려받으세요. 7월 4일 생태관광 AI 교육 자료와는 별도로 정리했습니다.",
        ],
      },
    ],
    privacyNote: true,
    relatedTitle: "9월 5일 수업 자료",
    links: [
      { label: "발표자료 웹에서 보기 →", href: ulleungPresentation.href },
      { label: "PDF 다운로드", href: ulleungPresentation.pdf, download: true },
    ],
  },
  "ulleung-ecotourism-ai": {
    title: "울릉군 생태관광 AI 교육",
    category: "교육",
    date: "2026-07-04",
    intro:
      "7월 4일 울릉고등학교 전산실에서 울릉군 글로벌 생태관광 전문인재 양성 교육을 진행했습니다. AI를 활용해 관광 홍보 문구와 웹페이지를 만드는 하루 과정이었습니다.",
    sections: [
      {
        title: "울릉도를 한 줄로 소개해 보기",
        paragraphs: [
          "AI를 처음 사용하는 분들도 따라 하실 수 있도록 AI의 기본 개념과 요청문 쓰는 법부터 설명했습니다. 첫 실습은 울릉도를 한 줄로 소개하는 문구 만들기였습니다.",
          "소개할 관광 소재를 고르고 AI에 문구를 요청한 뒤, 나온 내용을 확인했습니다. 이후에는 홍보 문구와 이미지를 다듬어 웹페이지에 담는 순서로 진행했습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-class.jpg",
          alt: "울릉군 생태관광 교육 참여자들이 전산실에서 AI 실습을 진행하는 모습",
          caption: "관광 홍보 문구와 웹페이지를 만드는 전산실 실습",
        },
      },
      {
        title: "SNS와 포스터에 맞게 문구 바꾸기",
        paragraphs: [
          "같은 성인봉을 소개하더라도 SNS 게시물과 관광 포스터에 쓸 문구는 길이가 다릅니다. 수업에서는 누구에게 보여줄지, 어디에 쓸지, 몇 가지 문구를 받을지 요청문에 적도록 안내했습니다.",
          "자료에는 한 줄 소개, SNS 게시물, 관광 포스터에 맞춘 요청문 예시와 번역 실습을 넣었습니다. 문구를 사용할 곳에 맞춰 AI에 요청하는 방법을 연습하도록 준비했습니다.",
        ],
      },
      {
        title: "문구와 이미지를 웹페이지에 담았습니다",
        paragraphs: [
          "앞에서 만든 문구와 이미지를 모아 관광 정보를 소개하는 웹페이지를 만드는 과정도 다뤘습니다. 어떤 내용을 넣을지 정리하고, 페이지로 만드는 실습까지 진행했습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-group.jpg",
          alt: "울릉군 글로벌 생태관광 전문인재 양성 교육을 마친 참여자들의 단체 사진",
          caption: "7월 4일 울릉군 글로벌 생태관광 전문인재 양성 교육 단체 사진",
        },
      },
      {
        title: "실습 자료를 다시 찾는 분들께",
        paragraphs: [
          "수업에서 사용한 강의와 실습 자료를 아래 링크에 모았습니다. 요청문 예시를 다시 사용하실 때는 소개할 장소와 문구를 쓸 곳을 바꿔 입력해 보세요.",
          "이 자료는 7월 4일 생태관광 AI 교육 자료입니다. 울릉고 학생들과 진행한 9월 5일 리빙랩 특강 자료는 수강생 자료실의 별도 항목에서 확인하실 수 있습니다.",
        ],
      },
    ],
    privacyNote: true,
    relatedTitle: "7월 4일 수업 자료",
    links: [{ label: "수강자료 확인하기 →", href: "/materials/ulleung-ecotourism-ai" }],
  },
};
