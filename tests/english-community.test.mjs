import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import {
  assertCommunityOwner, communityOriginAllowed, nextCommunityRate,
  publicCommunityPost, validateCommunityInput,
} from "../lib/english/community.ts";
import { accountKey, assertEnglishAccount, readEnglishJson } from "../lib/english/security.ts";

const now = new Date("2026-10-14T08:00:00Z");
const draft = { action: "create", title: "오늘의 표현", body: "I found the key. 오늘 배운 문장을 적어봅니다.", nickname: "페이지 독자", category: "journal" };

test("community authors choose a bounded public nickname, with no Google name fallback", () => {
  assert.deepEqual(validateCommunityInput({ ...draft, uid: "other", learnerLevel: 999, xp: 10000 }), draft);
  for (const changes of [{ nickname: undefined }, { nickname: "person@example.com" }, { nickname: "a".repeat(21) }, { title: "a".repeat(81) }, { body: "a".repeat(1201) }, { category: "admin" }, { body: "\u0000" }]) {
    assert.throws(() => validateCommunityInput({ ...draft, ...changes }));
  }
  assert.throws(() => validateCommunityInput({ action: "reply", postId: "../other", nickname: "한글", body: "답글" }));
  assert.throws(() => validateCommunityInput({ action: "report", postId: "one", body: " " }));
});

test("public posts whitelist fields, hide UIDs and emails, and omit deleted replies", () => {
  const raw = {
    title: draft.title, body: draft.body, nickname: draft.nickname, category: draft.category,
    authorUid: "private-author-id", email: "hidden@example.com", role: "owner", secret: "admin-only",
    learnerLevel: 2, learnerTitle: "단서 수집가", createdAt: now.toISOString(), likes: 3,
    replies: [
      { id: "reply1", authorUid: "private-reply-id", email: "another@example.com", nickname: "동료", body: "함께 연습해요", learnerLevel: 1, learnerTitle: "첫 페이지", createdAt: now.toISOString() },
      { id: "reply2", authorUid: "deleted-id", nickname: "삭제", body: "삭제된 내용", deletedAt: now.toISOString() },
    ],
  };
  const post = publicCommunityPost("post1", raw, accountKey);
  assert.equal(post.replyCount, 1);
  assert.equal(post.replies[0].id, "reply1");
  assert.equal(post.authorKey, accountKey(raw.authorUid));
  const output = JSON.stringify(post);
  for (const privateValue of ["private-author-id", "private-reply-id", "@example.com", "admin-only", "삭제된 내용"]) assert.equal(output.includes(privateValue), false);
  for (const key of ["authorUid", "email", "secret", "role"]) assert.equal(key in post, false);
  assert.equal(publicCommunityPost("deleted", { ...raw, deletedAt: now.toISOString() }, accountKey), null);
});

test("delete ownership is checked against the authenticated UID", () => {
  assert.doesNotThrow(() => assertCommunityOwner("owner-id", "owner-id"));
  assert.throws(() => assertCommunityOwner("owner-id", "different-id"), { status: 403 });
  assert.throws(() => assertCommunityOwner(undefined, "owner-id"), { status: 403 });
});

test("posting rate limits enforce recent activity and reset on Korean midnight", () => {
  const first = nextCommunityRate(undefined, "create", now);
  assert.equal(first.creates, 1);
  assert.throws(() => nextCommunityRate(first, "create", new Date(now.getTime() + 59_999)), { status: 429 });
  assert.equal(nextCommunityRate(first, "create", new Date(now.getTime() + 60_000)).creates, 2);
  assert.throws(() => nextCommunityRate({ ...first, creates: 5 }, "create", new Date(now.getTime() + 60_000)), { status: 429 });
  const midnight = nextCommunityRate({ ...first, creates: 5 }, "create", new Date("2026-10-14T15:00:00Z"));
  assert.equal(midnight.day, "2026-10-15");
  assert.equal(midnight.creates, 1);
  assert.throws(() => nextCommunityRate({ ...first, replies: 30 }, "reply", now), { status: 429 });
  assert.throws(() => nextCommunityRate({ ...first, reports: 10 }, "report", now), { status: 429 });
  assert.equal(nextCommunityRate(first, "like", now).creates, 1);
});

test("mutations require an exact same origin and the currently logged in account key", () => {
  assert.equal(communityOriginAllowed("https://site.example", "https://site.example/api/english/community"), true);
  for (const origin of [null, "null", "https://evil.example", "http://site.example", "https://site.example.evil.test"]) {
    assert.equal(communityOriginAllowed(origin, "https://site.example/api/english/community"), false);
  }
  assert.equal(accountKey("one"), accountKey("one"));
  assert.notEqual(accountKey("one"), accountKey("two"));
  assert.doesNotThrow(() => assertEnglishAccount("one", accountKey("one")));
  assert.throws(() => assertEnglishAccount("two", accountKey("one")), { status: 409 });
  assert.throws(() => assertEnglishAccount("one", undefined), { status: 409 });
});

test("mutation origins use the actual Host, preserve port and protocol, and never accept a forwarded host", () => {
  assert.equal(communityOriginAllowed("http://127.0.0.1:3015", "http://localhost:3015/api/english/progress", "127.0.0.1:3015"), true);
  assert.equal(communityOriginAllowed("https://dullg-landing-one.vercel.app", "https://localhost/api/english/progress", "dullg-landing-one.vercel.app"), true);
  for (const [origin, url, host] of [
    ["http://localhost:3015", "http://localhost:3015/api/english/progress", "127.0.0.1:3015"],
    ["http://127.0.0.1:3016", "http://localhost:3015/api/english/progress", "127.0.0.1:3015"],
    ["https://127.0.0.1:3015", "http://localhost:3015/api/english/progress", "127.0.0.1:3015"],
    ["https://evil.example", "https://dullg-landing-one.vercel.app/api/english/progress", "dullg-landing-one.vercel.app"],
    ["https://dullg-landing-one.vercel.app", "https://localhost/api/english/progress", "evil.example"],
    ["https://site.example", "https://site.example/api/english/progress", null],
    ["https://site.example", "https://site.example/api/english/progress", "site.example/evil"],
    ["https://site.example", "https://site.example/api/english/progress", "evil@site.example"],
    ["https://site.example", "https://site.example/api/english/progress", "site.example,evil.example"],
  ]) assert.equal(communityOriginAllowed(origin, url, host), false, `${origin} / ${host}`);
  const request = new Request("https://localhost/api/english/progress", { headers: { Host: "dullg-landing-one.vercel.app", Origin: "https://evil.example", "X-Forwarded-Host": "evil.example" } });
  assert.equal(communityOriginAllowed(request.headers.get("origin"), request.url, request.headers.get("host")), false);
});

test("community pagination fills the latest public window behind deleted posts and keeps category filtering within it", async () => {
  // Execute the actual pure collector exported from server.ts without loading Admin credentials.
  const text = await readFile(new URL("../lib/english/server.ts", import.meta.url), "utf8");
  const source = ts.createSourceFile("server.ts", text, ts.ScriptTarget.Latest, true);
  const collector = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "collectEnglishCommunityPosts");
  assert.ok(collector);
  const compiled = ts.transpileModule(collector.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const { collectEnglishCommunityPosts } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  const rows = (prefix, count, category) => Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, category }));
  let calls = 0;
  const pages = [{ posts: [], hasMore: true }, { posts: rows("recent", 20, "journal"), hasMore: true }, { posts: rows("older", 30, "question"), hasMore: true }];
  const posts = await collectEnglishCommunityPosts(async () => pages[calls++]);
  assert.equal(calls, 3);
  assert.equal(posts.length, 30);
  assert.equal(posts[0].id, "recent-0");
  assert.equal(posts.at(-1).id, "older-9");
  calls = 0;
  const filtered = await collectEnglishCommunityPosts(async () => pages[calls++], "question");
  assert.equal(filtered.length, 10);
  assert.equal(filtered.at(-1).id, "older-9");
  assert.equal(calls, 3);
  calls = 0;
  const bounded = await collectEnglishCommunityPosts(async () => { calls++; return { posts: [], hasMore: true }; });
  assert.equal(calls, 10);
  assert.deepEqual(bounded, []);
  calls = 0;
  const short = await collectEnglishCommunityPosts(async () => { calls++; return { posts: rows("last", 2, "review"), hasMore: false }; });
  assert.equal(calls, 1);
  assert.equal(short.length, 2);
});

test("JSON reader accepts bounded objects and rejects malformed bodies", async () => {
  const request = (body, type = "application/json") => new Request("https://site.example", { method: "POST", headers: { "Content-Type": type }, body });
  assert.deepEqual(await readEnglishJson(request(JSON.stringify(draft))), draft);
  for (const body of ["not-json", "[]", "null", "1"]) await assert.rejects(() => readEnglishJson(request(body)), { status: 400 });
  await assert.rejects(() => readEnglishJson(request("{}", "text/plain")), { status: 415 });
  await assert.rejects(() => readEnglishJson(request(JSON.stringify({ body: "a".repeat(12_001) }))), { status: 413 });
});

test("JSON reader also bounds streamed bytes without a content length", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(7000)); controller.enqueue(new Uint8Array(7000)); },
    cancel() { cancelled = true; },
  });
  const request = new Request("https://site.example", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" });
  await assert.rejects(() => readEnglishJson(request), { status: 413 });
  assert.equal(cancelled, true);
});

test("authored community UI and API messages have English translations while user text stays outside translation", async () => {
  const dictionary = JSON.parse(await readFile(new URL("../lib/i18n/en-community.json", import.meta.url), "utf8"));
  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  const keys = new Set(Object.keys(dictionary).map(normalize));
  for (const file of ["components/english/community.tsx", "app/english/community/page.tsx", "lib/english/progress.ts", "lib/english/security.ts", "lib/english/server.ts", "app/api/english/progress/route.ts", "app/api/english/community/route.ts"]) {
    const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) && /[가-힣]/.test(node.text)) {
        assert.ok(keys.has(normalize(node.text)), `Missing English translation in ${file}: ${normalize(node.text)}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  const client = await readFile(new URL("../components/english/community.tsx", import.meta.url), "utf8");
  for (const field of ["post.nickname", "post.title", "post.body", "item.nickname", "item.body"]) {
    assert.match(client, new RegExp(`data-english-user-content[^>]*>\\{${field.replaceAll(".", "\\.")}\\}`), `User field must remain untranslated: ${field}`);
  }
});
