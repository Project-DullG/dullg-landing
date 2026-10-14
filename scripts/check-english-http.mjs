import assert from "node:assert/strict";

const origin = (process.argv[2] || "http://localhost:3015").replace(/\/$/, "");
const episodes = [
  "closed-bookshop",
  "locker-seven",
  "moonlight-post",
  "raincheck-cafe",
  "midnight-radio",
  "glasshouse-garden",
];
const checks = [
  ["/", "english-title"],
  ["/english", "library-title"],
  ["/english/library", "오늘은 어떤 영어를 해볼까요?"],
  ["/english/library?view=all", "library-results-title"],
  ["/english/library?kind=sentence&view=all", "library-results-title"],
  [
    "/english/library?kind=story&focus=closed-bookshop&level=starter",
    "문장 난이도를 미리 살펴볼까요?",
  ],
  ["/english/library?kind=conversation&skill=speaking&pace=quick", "library-results-title"],
  ["/english/library?q=Could%20you", "library-results-title"],
  ["/en/english", "A little English, a new scene."],
  ["/en/english/library", "What English would you like to try today?"],
  ["/en/english/library?focus=moonlight-post&level=challenge", "content-preview-title"],
  ...episodes
    .filter((id) => id !== "moonlight-post")
    .map((id) => ["/en/english/library?focus=" + id + "&level=starter", "content-preview-title"]),
  ["/english/about", "Ellis"],
  ["/english/community", "COMMUNITY"],
  ["/english/review", "MY FIELD NOTES"],
  ["/english/courses", "A PATH THROUGH YOUR LIBRARY"],
  ["/english/journal", "MY ENGLISH JOURNAL"],
  ["/en/english/courses", "One step at a time"],
  ["/en/english/courses?course=clues-and-english&level=challenge", "Follow the clues in English"],
  ["/en/english/journal", "Your expression notebook"],
  ["/en/english/review", "Recall the expressions you learned without looking at the examples."],
  ["/studio", "project-dullg-brand-film-v1.mp4"],
  ["/speaking", "TOEIC"],
  ["/academy", "academy-details-title"],
  ["/login?next=%2Fenglish%2Fpractice%2Fconversation-airport", "영어 학습 로그인"],
  ["/english/courses?course=everyday-english&level=starter", "일상에서 바로 쓰기"],
  ["/english/practice/sentence-requests?level=starter&course=first-steps", "코스 목차"],
  ["/english/play/closed-bookshop?level=challenge&course=first-steps", "코스 목차"],
  ...episodes.map((id) => [`/english/play/${id}?level=starter`, "CHAPTER"]),
  ...["conversation-airport", "sentence-requests", "sentence-relationships", "reading-repair"].map(
    (id) => [`/english/practice/${id}?level=starter`, "PRACTICE"],
  ),
];
for (const [path, marker] of checks) {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(marker), `${path}: missing ${marker}`);
  if (path.startsWith("/english/play")) {
    assert.ok(html.includes("기록") || html.includes("진도"));
    assert.match(response.headers.get("cache-control") || "", /no-store/);
  }
  if (path === "/english/journal" || path === "/en/english/journal") {
    assert.ok(html.includes("noindex"));
    assert.match(response.headers.get("cache-control") || "", /no-store/);
  }
  if (path.includes("/english/library")) {
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    assert.ok(html.includes("english-content-search"));
    assert.ok(html.includes("/english/courses"));
    const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const cards = (rendered.match(/aria-describedby="library-goal-/g) || []).length;
    if (path === "/english/library")
      assert.equal(cards, 3, "default discovery should show only three start candidates");
    if (path === "/english/library?view=all")
      assert.equal(cards, 25, "all existing content must remain discoverable");
    if (path === "/english/library?kind=sentence&view=all")
      assert.equal(cards, 7, "category query must take effect on server render");
  }
  if (path.startsWith("/en/")) {
    const visible = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replaceAll("한국어", "");
    assert.doesNotMatch(visible, /[가-힣]/, path);
  }
  if (path.includes("course=first-steps")) {
    assert.ok(html.includes("%26course%3Dfirst-steps"), path + ": login lost course context");
    assert.ok(
      html.includes("%3Flevel%3D" + (path.includes("level=challenge") ? "challenge" : "starter")),
      path + ": login lost difficulty",
    );
  }
  if (path.includes("sentence-relationships")) {
    assert.ok(html.includes("문장 구조 살펴보기"));
    assert.ok(html.includes("원하는 사람"));
    assert.ok(html.includes("그 일을 할 사람"));
  }
}
assert.equal((await fetch(`${origin}/english/play/not-an-episode`)).status, 404);
assert.equal((await fetch(`${origin}/english/practice/not-a-pack`)).status, 404);
const illustrations = [
  "bookshop",
  "locker",
  "moonpost",
  "bookshop-walkway",
  "locker-platform",
  "moonpost-lighthouse",
  "cafe",
  "cafe-gathering",
  "radio",
  "radio-tower",
  "garden",
  "garden-courtyard",
  "practice-conversation-v2",
  "practice-sentence-v2",
  "practice-reading-v2",
  "bookshop-returns-v2",
  "locker-desk-v2",
  "moonpost-landing-v2",
  "cafe-counter-v2",
  "radio-noticeboard-v2",
  "garden-seedlings-v2",
];
for (const name of illustrations) {
  const response = await fetch(`${origin}/assets/english/${name}.webp`);
  assert.equal(response.status, 200, name);
  assert.match(response.headers.get("content-type") || "", /image\/webp/);
  assert.ok((await response.arrayBuffer()).byteLength > 100_000);
}
const privateGet = await fetch(`${origin}/api/english/progress`);
assert.equal(privateGet.status, 401);
assert.match(privateGet.headers.get("cache-control") || "", /no-store/);
const sameOriginWrite = await fetch(`${origin}/api/english/progress`, {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ action: "level", level: "starter", accountKey: "forged" }),
});
assert.equal(sameOriginWrite.status, 401);
for (const resource of ["progress", "community"]) {
  const foreignWrite = await fetch(`${origin}/api/english/${resource}`, {
    method: "POST",
    headers: { Origin: "https://unrelated.invalid", "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(foreignWrite.status, 403, resource);
}
const community = await fetch(`${origin}/api/english/community`);
assert.equal(community.status, 200);
const publicData = await community.json();
assert.ok(Array.isArray(publicData.posts));
function assertPublic(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(
      !["authorUid", "email", "reporterUid", "reports"].includes(key),
      `private community field: ${key}`,
    );
    assertPublic(child);
  }
}
assertPublic(publicData.posts);
console.log(
  `English HTTP checks passed: ${checks.length} pages, ${illustrations.length} illustrations, guest authorization, Origin checks, public community privacy.`,
);
