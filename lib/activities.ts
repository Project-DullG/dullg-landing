import { getFundingProject, toKstDateString } from "./funding.ts";

export type ActivityRecord = {
  /** ISO date or ISO range "YYYY-MM-DD/YYYY-MM-DD" */
  date: string;
  type: "펀딩" | "교육" | "제작";
  title: string;
  body: string;
  href: string;
  ongoing?: boolean;
};

const dg0 = getFundingProject("projectdg0");
const dg1 = getFundingProject("projectdg1");

export const activityRecords: ActivityRecord[] = [
  {
    date: "2026-09-05",
    type: "교육",
    title: "울릉고 리빙랩 특강",
    body: "울릉도 소재를 게임 기획 활동으로 바꾸는 특강과 공개 자료를 기록했습니다.",
    href: "/activity/ulleung-high-living-lab",
  },
  {
    date: "2026-07-04",
    type: "교육",
    title: "울릉군 생태관광 AI 교육",
    body: "관광 자원을 정리하고 AI를 활용해 홍보 문구와 웹페이지를 완성한 교육을 진행했습니다.",
    href: "/activity/ulleung-ecotourism-ai",
  },
  {
    date: "2026-07-01",
    type: "제작",
    title: "영어 미스터리 수업팩",
    body: "영어 단서를 읽고 근거를 쓰는 4차시 수업용 시제품과 파일럿을 준비하고 있습니다.",
    href: "/academy",
    ongoing: true,
  },
  {
    date: `${dg1.startsOn}/${dg1.endsOn}`,
    type: "펀딩",
    title: dg1.title,
    body: "레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 한 프로젝트로 공개했습니다.",
    href: dg1.url,
  },
  {
    date: `${dg0.startsOn}/${dg0.endsOn}`,
    type: "펀딩",
    title: dg0.title,
    body: "첫 실물 머더미스터리 프로젝트를 텀블벅에서 공개했습니다.",
    href: dg0.url,
  },
];

const startOf = (r: ActivityRecord) => r.date.split("/")[0];
export function isUpcoming(record: ActivityRecord, today: Date = new Date()): boolean {
  return startOf(record) > toKstDateString(today);
}
export function formatActivityDate(record: ActivityRecord): string {
  if (record.ongoing) return "진행 중";
  const [a, b] = record.date.split("/");
  const dots = (s: string) => s.replaceAll("-", ".");
  return b ? `${dots(a)}—${dots(b.slice(0, 4) === a.slice(0, 4) ? b.slice(5) : b)}` : dots(a);
}
