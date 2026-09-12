import { youthArtsFestival } from "./festival";
import { ulleungPresentation } from "./presentations";

export type ActivityArticleData = {
  title: string;
  category: string;
  date: string;
  intro: string;
  sections: {
    title: string;
    paragraphs: string[];
    photo?: { src: string; alt: string; caption: string };
  }[];
  privacyNote?: boolean;
  relatedTitle: string;
  links: { label: string; href: string; download?: boolean }[];
};

export const activityArticles: Record<string, ActivityArticleData> = {
  "ulsan-youth-arts-2026": {
    title: youthArtsFestival.title,
    category: "전시",
    date: youthArtsFestival.date,
    intro:
      "9월 12일, 성남동 젊음의거리에서 열린 2026 울산 중구 청년예술제에 참여했습니다. 청년디딤터 부스에 단서공방의 머더미스터리 작품을 전시했습니다.",
    sections: [
      {
        title: "작품 상자와 캐릭터 자료를 한자리에",
        paragraphs: [
          "부스에는 뱀이 죽은 축제, 레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 준비했습니다. 작품 상자를 세워 표지를 보여주고, 테이블 앞쪽에는 캐릭터별 자료를 펼쳐 놓았습니다.",
        ],
        photo: {
          ...youthArtsFestival.image,
          caption: "청년디딤터 부스에 전시한 작품 상자와 캐릭터 자료. 사진: 단서공방",
        },
      },
      {
        title: "실물 전시와 함께 소개한 공식 사이트",
        paragraphs: [
          "테이블에는 실물 작품과 함께 노트북을 놓고 단서공방의 공식 사이트를 열어 두었습니다. 현장에서 전시한 작품의 개별 소개는 아래 링크에서 확인할 수 있습니다.",
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
        title: "울릉도에서 해보고 싶은 일부터",
        paragraphs: [
          "수업에서는 울릉도에서 좋아하는 것과 바꾸고 싶은 것, 해보고 싶은 일을 이야기했습니다. 발표자료에는 장소와 사람, 상황과 규칙을 나누어 지역 소재를 정리하는 활동을 담았습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-high-2026-09-05-class.jpg",
          alt: "울릉고 교실에서 AI 활용 지역 콘텐츠 제작 수업을 준비하는 모습",
          caption: "9월 5일 울릉고등학교의 AI 활용 지역 콘텐츠 제작 수업",
        },
      },
      {
        title: "게임 체험에서 한 줄 기획안으로",
        paragraphs: [
          "학생들은 모둠별로 머더미스터리 게임을 체험했습니다. 역할을 맡고 단서를 읽으며 서로 내용을 설명하는 활동입니다.",
          "이어지는 AI 실습은 자신의 아이디어를 먼저 적고 질문을 덧붙이는 순서로 구성했습니다. 마지막에는 제목, 배경, 역할, 미션, 단서를 한 줄 기획안으로 정리하도록 했습니다.",
          "발표자료를 다운로드 없이 웹에서 바로 볼 수 있습니다. 이 자료는 울릉군 생태관광 AI 교육과 별개의 수업 자료입니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-high-2026-09-05-workshop.jpg",
          alt: "울릉고 학생들이 모둠별로 머더미스터리 활동을 진행하는 모습",
          caption: "모둠별로 역할과 단서를 확인하며 게임을 체험하는 학생들",
        },
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
        title: "관광 소재를 소개 문구로 정리하기",
        paragraphs: [
          "실습은 소개할 관광 소재를 고르는 것부터 시작했습니다. AI로 홍보 문구와 이미지를 다듬고, 이를 웹페이지에 담는 순서로 진행했습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-class.jpg",
          alt: "울릉군 생태관광 교육 참여자들이 전산실에서 AI 실습을 진행하는 모습",
          caption: "관광 홍보 문구와 웹페이지를 만드는 전산실 실습",
        },
      },
      {
        title: "웹페이지 제작까지 실습한 하루",
        paragraphs: [
          "교육에서는 문구 작성에 그치지 않고, 관광 정보를 웹페이지로 만드는 과정까지 다뤘습니다. 강의 내용과 실습 자료는 수강생 자료실에 함께 정리해 두었습니다.",
        ],
        photo: {
          src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-group.jpg",
          alt: "울릉군 글로벌 생태관광 전문인재 양성 교육을 마친 참여자들의 단체 사진",
          caption: "7월 4일 울릉군 글로벌 생태관광 전문인재 양성 교육 단체 사진",
        },
      },
    ],
    privacyNote: true,
    relatedTitle: "7월 4일 수업 자료",
    links: [{ label: "수강자료 확인하기 →", href: "/materials/ulleung-ecotourism-ai" }],
  },
};
