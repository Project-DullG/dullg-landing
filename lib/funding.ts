export type FundingProject = {
  id: "projectdg0" | "projectdg1" | "projectdg2";
  title: string;
  startsOn: string; // YYYY-MM-DD
  endsOn: string; // YYYY-MM-DD (마지막 날, 포함)
  url: string;
  amount: string;
  backers: string;
  achievement: string;
  checkedAt?: string; // 진행 중 수치 확인일
};

export const fundingProjects: FundingProject[] = [
  { id: "projectdg0", title: "뱀이 죽은 축제", startsOn: "2025-09-09", endsOn: "2025-10-11", url: "https://tumblbug.com/projectdg0", amount: "9,001,000원", backers: "250명", achievement: "180%" },
  { id: "projectdg1", title: "머더미스터리 3종", startsOn: "2026-03-16", endsOn: "2026-04-20", url: "https://tumblbug.com/projectdg1", amount: "19,296,000원", backers: "193명", achievement: "1,929%" },
  { id: "projectdg2", title: "머더미스터리 2종", startsOn: "2026-08-14", endsOn: "2026-09-11", url: "https://tumblbug.com/projectdg2", amount: "10,940,000원", backers: "169명", achievement: "1,094%", checkedAt: "2026년 9월 2일" },
];

export type FundingStatus = "진행 중" | "종료";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** KST 기준 YYYY-MM-DD */
export function toKstDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function getFundingStatus(project: FundingProject, today: Date = new Date()): FundingStatus {
  return toKstDateString(today) <= project.endsOn ? "진행 중" : "종료";
}

const dots = (iso: string) => iso.replaceAll("-", ".");
/** "2026.03.16–04.20" (같은 해면 끝 날짜의 연도 생략) */
export function fundingSummaryPeriod(project: FundingProject): string {
  const start = dots(project.startsOn);
  const end = project.endsOn.startsWith(project.startsOn.slice(0, 4)) ? dots(project.endsOn.slice(5)) : dots(project.endsOn);
  return `${start}–${end}`;
}

export function formatFundingSummary(project: FundingProject): string {
  return `${fundingSummaryPeriod(project)} · ${project.amount} · ${project.backers} · ${project.achievement}`;
}

export function getFundingProject(id: FundingProject["id"]) {
  return fundingProjects.find((project) => project.id === id)!;
}
