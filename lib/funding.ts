export type FundingProject = {
  id: "projectdg0" | "projectdg1" | "projectdg2";
  title: string;
  period: string;
  url: string;
  status: "진행 중" | "종료";
  amount?: string;
  backers?: string;
  achievement?: string;
  checkedAt?: string;
};

export const fundingProjects: FundingProject[] = [
  {
    id: "projectdg0",
    title: "뱀이 죽은 축제",
    period: "2025.09.09—10.11",
    url: "https://tumblbug.com/projectdg0",
    status: "종료",
    amount: "9,001,000원",
    backers: "250명",
    achievement: "180%",
  },
  {
    id: "projectdg1",
    title: "머더미스터리 3종",
    period: "2026.03.16—04.20",
    url: "https://tumblbug.com/projectdg1",
    status: "종료",
    amount: "19,296,000원",
    backers: "193명",
    achievement: "1,929%",
  },
  {
    id: "projectdg2",
    title: "머더미스터리 2종",
    period: "2026.09.11까지",
    url: "https://tumblbug.com/projectdg2",
    status: "진행 중",
    amount: "10,940,000원",
    backers: "169명",
    achievement: "1,094%",
    checkedAt: "2026년 9월 2일",
  },
];

export function getFundingProject(id: FundingProject["id"]) {
  return fundingProjects.find((project) => project.id === id)!;
}
