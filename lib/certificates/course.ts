export type CertificateRecord = {
  name: string;
  issuedAt: string;
  reference: string;
};

export const certificateCourse = {
  id: "ulleung-dokdo-ai-participation",
  title: "AI와 게이미피케이션을 활용한 울릉도·독도 지역 콘텐츠 프로그램 제작 교육",
  titleLines: ["AI와 게이미피케이션을 활용한", "울릉도·독도 지역 콘텐츠 프로그램 제작 교육"],
  documentTitle: "교육 참여 수료증",
  body: "위 학생은 AI와 게이미피케이션을 활용하여 울릉도·독도의 지역 콘텐츠를 기획하고 제작하는 교육 활동에 참여하였기에 이 수료증을 수여합니다.",
  issuer: "트위즈덤",
  partner: "한동대학교",
  professor: "김병철",
  representative: "이성로",
  school: "울릉고등학교",
  principal: "김상현",
  disclaimer: "본 증서는 교육 참여 확인용이며 대학 학위·공인 자격증이 아닙니다.",
} as const;
