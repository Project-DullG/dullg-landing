export type NavigationItem = {
  href: string;
  label: string;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "홈" },
  { href: "/works", label: "작품" },
  { href: "/activity", label: "활동 기록" },
  { href: "/academy", label: "교육" },
  { href: "/materials", label: "수강생 자료실" },
  { href: "/about", label: "단서공방" },
];

export const studioNavigation: NavigationItem[] = [
  { href: "/about", label: "공방 소개" },
  { href: "/activity", label: "제작·활동 기록" },
  { href: "/contact", label: "문의하기" },
];
