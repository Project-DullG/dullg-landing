import test from "node:test";
import assert from "node:assert/strict";
import { translateText, translateValue, localizedPath } from "../lib/i18n/translate.ts";

test("locale links preserve route details and leave files and external services unchanged", () => {
  for (const path of ["/works?sort=new#list", "/mini-projects/snake", "/dashboard/students?id=1"]) {
    assert.equal(localizedPath(path, "en"), `/en${path}`);
    assert.equal(localizedPath(`/en${path}`, "ko"), path);
    assert.equal(localizedPath(`/en${path}`, "en"), `/en${path}`);
  }
  assert.equal(localizedPath("/", "en"), "/en");
  assert.equal(localizedPath("/en", "ko"), "/");
  for (const path of [
    "#game",
    "https://example.com/",
    "mailto:cluedullg@gmail.com",
    "/assets/course.pdf",
    "/api/auth",
    "/logout",
    "/speaking",
    "//example.com/",
    "/sitemap.xml",
  ]) {
    assert.equal(localizedPath(path, "en"), path);
  }
});

test("dynamic game status and accessible cell names are fully translated", () => {
  const cases = [
    "6번 만에 여섯 쌍을 모두 찾았습니다.",
    "1번 카드, 스페이드, 짝을 찾음",
    "31번 이동해 퍼즐을 완성했습니다.",
    "다시 확인할 숫자가 2개 있습니다.",
    "1행 2열, 입력한 수 5",
    "1행 2열, 주어진 수 5, 확인 필요",
    "하트 A 선택 · 옮길 열이나 A 더미를 누르세요.",
    "♥ A 더미로 옮길 수 있습니다.",
    "3번째 열로 옮길 수 있습니다.",
    "뽑은 카드 하트 A",
    "1번째 빈 열, K 놓기",
    "1행 2열, 주변 지뢰 3개",
    "레벨 3",
    "남은 공 2개 · 다시 발사하세요",
    "12개 제거 · 2연쇄",
    "위로 이동",
    "아래로 이동",
    "왼쪽으로 이동",
  ];
  for (const value of cases) {
    assert.doesNotMatch(translateText(value, "en"), /[가-힣]/, value);
    assert.equal(translateText(value, "ko"), value);
  }
  assert.equal(
    translateText("하트 A 선택 · 옮길 열이나 A 더미를 누르세요.", "en"),
    "A of hearts selected · Choose a column or foundation.",
  );
});

test("translation does not alter application values or React-like elements", () => {
  const element = { type: "button", props: { value: "학생" } };
  assert.equal(translateValue(element, "en"), element);
  assert.equal(translateValue(0, "en"), 0);
  assert.equal(translateValue(false, "en"), false);
  assert.equal(translateValue(null, "en"), null);
  assert.deepEqual(translateValue(["문의하기", 42, element], "en"), ["Contact", 42, element]);
});
