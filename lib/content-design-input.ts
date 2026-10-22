import { contentDesignWizard } from "./content-design-wizard.ts";

export const CONTENT_DESIGN_FORMATS = [
  "추천",
  "보드게임",
  "체험형 교구",
  "추리·방탈출",
  "이야기·영상·만화",
  "매거진·가이드·전시",
  "기타",
] as const;

export type ContentDesignFormat = (typeof CONTENT_DESIGN_FORMATS)[number];
export type ContentDesignMode = "guided" | "draft";

export type ContentDesignInput = {
  idea: string;
  format: ContentDesignFormat;
  audience: string;
  experience: string;
  material: string;
  duration: string;
  people: string;
  constraints: string;
  sources: string;
  mode: ContentDesignMode;
  detail1: string;
  detail2: string;
};

export const CONTENT_DESIGN_DETAIL_LABELS = {
  추천: ["관심 있는 방식", "피하고 싶은 방식"],
  보드게임: ["경쟁·협력 방식", "넣고 싶은 행동"],
  "체험형 교구": ["다룰 질문", "해보고 싶은 활동"],
  "추리·방탈출": ["풀고 싶은 질문", "단서·이야기 소재"],
  "이야기·영상·만화": ["전달할 내용", "장면·분위기"],
  "매거진·가이드·전시": ["다룰 꼭지·구역", "읽고 남길 경험"],
  기타: ["이용자가 하는 일", "원하는 구성"],
} as const satisfies Record<ContentDesignFormat, readonly [string, string]>;

const valueOrRecommendation = (value: string) => value.trim() || "추천";

export function buildContentDesignPrompt(input: ContentDesignInput): string {
  const format = CONTENT_DESIGN_FORMATS.find((item) => item === input.format.trim()) ?? "추천";
  const [detail1Label, detail2Label] = CONTENT_DESIGN_DETAIL_LABELS[format];
  const values: Array<readonly [string, string]> = [
    ["아이디어 한 줄", input.idea],
    ["만들고 싶은 형태", format],
    ["사용할 사람과 이용 상황", input.audience],
    ["주고 싶은 경험", input.experience],
    ["주제·지역·이야기 소재", input.material],
    ["이용 시간", input.duration],
    ["참여 인원", input.people],
    ["꼭 넣거나 피하고 싶은 것", input.constraints],
    ["참고자료·기존 메모", input.sources],
    [detail1Label, input.detail1],
    [detail2Label, input.detail2],
  ];
  const filledInput = [
    "[내가 채운 내용]",
    ...values.map(([label, value]) => `${label}: ${valueOrRecommendation(value)}`),
  ].join("\n");
  const optionalInputStart = contentDesignWizard.prompt.lastIndexOf("[선택 입력]");
  const instructions = (
    optionalInputStart === -1
      ? contentDesignWizard.prompt
      : contentDesignWizard.prompt.slice(0, optionalInputStart)
  ).trimEnd();
  const startInstruction =
    input.mode === "draft"
      ? "바로 작성. 위 입력과 추천값으로 기획안·설계서를 작성해줘. 추가 질문은 하지 말고, 확인되지 않은 사실은 만들지 말고 확인할 자료로 남겨줘."
      : "위 입력을 읽고 해당 단계부터 시작해줘. 현재 정보로 구체적인 제안과 추천안을 먼저 보여주고, 중요한 선택을 1~2개만 물어봐. 이미 정한 내용은 유지해줘.";

  return `${filledInput}\n\n${instructions}\n\n${startInstruction}`;
}
