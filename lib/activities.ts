import { getFundingProject } from "./funding";

export type ActivityRecord = {
  date: string;
  type: "펀딩" | "교육" | "제작";
  title: string;
  body: string;
  href: string;
};

const firstFunding = getFundingProject("projectdg0");
const secondFunding = getFundingProject("projectdg1");

export const activityRecords: ActivityRecord[] = [
  { date: firstFunding.period, type: "펀딩", title: firstFunding.title, body: "첫 실물 머더미스터리 프로젝트를 텀블벅에서 공개했습니다.", href: firstFunding.url },
  { date: secondFunding.period, type: "펀딩", title: secondFunding.title, body: "레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 한 프로젝트로 공개했습니다.", href: secondFunding.url },
  { date: "2026.09.05", type: "교육", title: "울릉고 리빙랩 특강", body: "울릉도 소재를 게임 기획 활동으로 바꾸는 특강과 공개 자료를 기록했습니다.", href: "/activity/ulleung-high-living-lab" },
  { date: "현재", type: "제작", title: "영어 미스터리 수업팩", body: "영어 단서를 읽고 근거를 쓰는 4차시 수업용 시제품과 파일럿을 준비하고 있습니다.", href: "/academy" },
];
