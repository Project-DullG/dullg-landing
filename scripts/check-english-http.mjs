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
  ["/english/about", "Ellis"],
  ["/english/community", "COMMUNITY"],
  ["/english/review", "MY FIELD NOTES"],
  ["/studio", "project-dullg-brand-film-v1.mp4"],
  ["/speaking", "TOEIC"],
  ["/academy", "academy-details-title"],
  ["/login?next=%2Fenglish%2Fpractice%2Fconversation-airport", "영어 학습 로그인"],
  ...episodes.map((id) => [`/english/play/${id}?level=starter`, "CHAPTER"]),
  ...["conversation-airport", "sentence-requests", "reading-repair"].map((id) => [
    `/english/practice/${id}?level=starter`,
    "PRACTICE",
  ]),
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
}
assert.equal((await fetch(`${origin}/english/play/not-an-episode`)).status, 404);
assert.equal((await fetch(`${origin}/english/practice/not-a-pack`)).status, 404);
for (const name of [
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
]) {
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
  `English HTTP checks passed: ${checks.length} pages, 12 illustrations, guest authorization, Origin checks, public community privacy.`,
);
