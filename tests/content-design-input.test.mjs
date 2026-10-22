import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTENT_DESIGN_DETAIL_LABELS,
  CONTENT_DESIGN_FORMATS,
  buildContentDesignPrompt,
} from "../lib/content-design-input.ts";
import { contentDesignWizard } from "../lib/content-design-wizard.ts";

const emptyInput = {
  idea: "",
  format: "추천",
  audience: "",
  experience: "",
  material: "",
  duration: "",
  people: "",
  constraints: "",
  sources: "",
  mode: "guided",
  detail1: "",
  detail2: "",
};

const instructions = contentDesignWizard.prompt
  .slice(0, contentDesignWizard.prompt.lastIndexOf("[선택 입력]"))
  .trimEnd();

test("places the student's values first and includes the wizard instructions exactly once", () => {
  const result = buildContentDesignPrompt({ ...emptyInput, idea: "울릉 이야기 전시판" });
  assert.ok(result.startsWith("[내가 채운 내용]\n아이디어 한 줄: 울릉 이야기 전시판\n"));
  assert.ok(result.includes(`\n\n${instructions}\n\n`));
  assert.equal(result.split(instructions).length - 1, 1);
  assert.equal(result.split("콘텐츠 기획안과 설계서 만들기").length - 1, 1);
  assert.doesNotMatch(result, /\[선택 입력\]|아는 칸만 채워도 되고|빈칸과 아래의 예시/);
});

test("uses recommendations for empty or whitespace-only fields without adding example answers", () => {
  const result = buildContentDesignPrompt({ ...emptyInput, audience: " \n\t ", sources: "　" });
  const inputBlock = result.slice(0, result.indexOf("\n\n"));
  const lines = inputBlock.split("\n");
  assert.equal(lines.length, 12);
  for (const line of lines.slice(1)) assert.match(line, /: 추천$/);
  assert.doesNotMatch(inputBlock, /울릉|가족|15분|3명|예시/);
});

test("trims outer whitespace while preserving user punctuation and real line breaks", () => {
  const idea = '  "울릉" & <독도> 🧩 $100 \\ 파일  ';
  const sources =
    ' \n첫 줄: https://example.com/?a=1&b=2\n둘째 줄: "인용" · <태그> · `메모` · $() · \\n\n ';
  const result = buildContentDesignPrompt({
    ...emptyInput,
    idea,
    audience: "  여행객과   주민  ",
    sources,
  });
  assert.ok(result.includes(`아이디어 한 줄: ${idea.trim()}\n`));
  assert.ok(result.includes("사용할 사람과 이용 상황: 여행객과   주민\n"));
  assert.ok(result.includes(`참고자료·기존 메모: ${sources.trim()}\n`));
  assert.ok(result.includes("\n둘째 줄:"));
  assert.ok(result.includes(" · \\n\n관심 있는 방식:"));
  assert.doesNotMatch(result, /&amp;|&lt;|&quot;/);
});

test("uses only the selected genre's two detail labels in the input block", () => {
  for (const format of CONTENT_DESIGN_FORMATS) {
    const result = buildContentDesignPrompt({
      ...emptyInput,
      format,
      detail1: "첫 번째 답",
      detail2: "두 번째 답",
    });
    const inputBlock = result.slice(0, result.indexOf("\n\n"));
    const [firstLabel, secondLabel] = CONTENT_DESIGN_DETAIL_LABELS[format];
    assert.ok(inputBlock.includes(`만들고 싶은 형태: ${format}\n`));
    assert.ok(inputBlock.includes(`${firstLabel}: 첫 번째 답\n`));
    assert.ok(inputBlock.endsWith(`${secondLabel}: 두 번째 답`));
    for (const otherFormat of CONTENT_DESIGN_FORMATS.filter((item) => item !== format)) {
      for (const otherLabel of CONTENT_DESIGN_DETAIL_LABELS[otherFormat]) {
        assert.ok(!inputBlock.includes(`${otherLabel}:`), `${format}: unexpected ${otherLabel}`);
      }
    }
  }
});

test("switching genre or mode uses the current selection without retaining old labels", () => {
  const input = { ...emptyInput, format: "보드게임", detail1: "함께 해결", detail2: "카드 배치" };
  const guided = buildContentDesignPrompt(input);
  const draft = buildContentDesignPrompt({ ...input, format: "체험형 교구", mode: "draft" });
  const draftInputBlock = draft.slice(0, draft.indexOf("\n\n"));
  assert.ok(draftInputBlock.includes("다룰 질문: 함께 해결"));
  assert.ok(!draftInputBlock.includes("경쟁·협력 방식:"));
  assert.ok(guided.endsWith("이미 정한 내용은 유지해줘."));
  assert.ok(draft.endsWith("확인되지 않은 사실은 만들지 말고 확인할 자료로 남겨줘."));
  assert.match(draft.slice(draft.lastIndexOf("\n\n") + 2), /^바로 작성\./);
  assert.doesNotMatch(draft.slice(draft.lastIndexOf("\n\n") + 2), /물어봐|해당 단계부터 시작/);
});

test("keeps repeated builds independent and does not modify the supplied values", () => {
  const input = Object.freeze({ ...emptyInput, idea: "  내 콘텐츠  ", detail1: "  새 방식  " });
  const first = buildContentDesignPrompt(input);
  const second = buildContentDesignPrompt(input);
  assert.equal(first, second);
  assert.equal(input.idea, "  내 콘텐츠  ");
  assert.equal(input.detail1, "  새 방식  ");
  assert.equal(buildContentDesignPrompt(emptyInput).split("[내가 채운 내용]").length - 1, 1);
});
