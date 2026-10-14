export type NavigationItem = {
  href: string;
  label: string;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "홈" },
  { href: "/english", label: "영어 학습" },
  { href: "/english/community", label: "학습 커뮤니티" },
  { href: "/studio", label: "공방 둘러보기" },
  { href: "/academy", label: "수업·교육 협업" },
  { href: "/about", label: "공방 소개" },
];

export const studioNavigation: NavigationItem[] = [
  { href: "/about", label: "공방 소개" },
  { href: "/activity", label: "제작·활동 기록" },
  { href: "/contact", label: "문의하기" },
];
