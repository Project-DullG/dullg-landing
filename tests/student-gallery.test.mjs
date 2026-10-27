import test from "node:test";
import assert from "node:assert/strict";
import { createGalleryRepository } from "../lib/student-gallery/repository.ts";
import { createGalleryHandlers } from "../lib/student-gallery/http.ts";
import {
  CHEER_COOLDOWN_MS,
  CHEER_DAILY_LIMIT,
  gameIds,
  validateGalleryInput,
} from "../lib/student-gallery/model.ts";
import {
  galleryAccountKey,
  MAX_GALLERY_BYTES,
  readGalleryJson,
  stableUidKey,
} from "../lib/student-gallery/security.ts";

const ROOT = "studentGameGallery/main";
const [SNAP, LOG, MARKET] = gameIds;
const SECRET = "gallery-test-key-only-not-a-real-secret-000000000";
const copy = (value) => (value === undefined ? undefined : structuredClone(value));

// Exercise the repository itself: transactions read versions, commit atomically,
// and rerun their callback when another transaction changes a read document/query.
function memoryFirestore() {
  const records = new Map(),
    versions = new Map(),
    collectionVersions = new Map();
  const metrics = { retries: 0, commits: 0, writes: 0 };
  const parent = (path) => path.slice(0, path.lastIndexOf("/"));
  function write(path, data) {
    if (data === undefined) records.delete(path);
    else records.set(path, copy(data));
    versions.set(path, (versions.get(path) || 0) + 1);
    collectionVersions.set(parent(path), (collectionVersions.get(parent(path)) || 0) + 1);
  }
  function doc(path) {
    return {
      kind: "doc",
      path,
      id: path.split("/").at(-1),
      collection: (name) => collection(`${path}/${name}`),
    };
  }
  function collection(path, ordering, limit = Infinity) {
    return {
      kind: "query",
      path,
      ordering,
      maximum: limit,
      doc: (id) => doc(`${path}/${id}`),
      orderBy: (field, direction = "asc") => collection(path, { field, direction }, limit),
      limit: (maximum) => collection(path, ordering, maximum),
    };
  }
  function snapshot(path) {
    const value = copy(records.get(path));
    return { id: path.split("/").at(-1), exists: value !== undefined, data: () => copy(value) };
  }
  function rows(ref) {
    const prefix = ref.path + "/";
    let selected = [...records.keys()].filter(
      (path) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"),
    );
    if (ref.ordering) {
      const { field, direction } = ref.ordering;
      selected = selected
        .filter((path) => records.get(path)[field] !== undefined)
        .sort((a, b) => {
          const left = records.get(a)[field],
            right = records.get(b)[field];
          return (
            (left < right ? -1 : left > right ? 1 : a.localeCompare(b)) *
            (direction === "desc" ? -1 : 1)
          );
        });
    }
    return selected.slice(0, ref.maximum).map(snapshot);
  }
  const db = {
    collection,
    async runTransaction(callback, options = {}) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const readVersions = new Map(),
          readCollections = new Map(),
          pending = [];
        let wrote = false;
        const tx = {
          async get(ref) {
            assert.equal(wrote, false, "Firestore reads must precede transaction writes");
            if (ref.kind === "doc") {
              readVersions.set(ref.path, versions.get(ref.path) || 0);
              return snapshot(ref.path);
            }
            readCollections.set(ref.path, collectionVersions.get(ref.path) || 0);
            const docs = rows(ref);
            return { docs, size: docs.length, empty: docs.length === 0 };
          },
          set(ref, value, settings) {
            wrote = true;
            pending.push({ ref, value: copy(value), settings });
          },
          delete(ref) {
            wrote = true;
            pending.push({ ref, deleting: true });
          },
        };
        const result = await callback(tx);
        if (
          [...readVersions].some(([path, version]) => (versions.get(path) || 0) !== version) ||
          [...readCollections].some(
            ([path, version]) => (collectionVersions.get(path) || 0) !== version,
          )
        ) {
          metrics.retries++;
          continue;
        }
        if (options.readOnly) assert.equal(pending.length, 0, "read-only snapshots must not write");
        for (const change of pending) {
          write(
            change.ref.path,
            change.deleting
              ? undefined
              : change.settings?.merge
                ? { ...copy(records.get(change.ref.path)), ...change.value }
                : change.value,
          );
          metrics.writes++;
        }
        metrics.commits++;
        return result;
      }
      throw new Error("Test transaction did not converge");
    },
    seed: write,
    peek: (path) => copy(records.get(path)),
    paths: () => [...records.keys()],
    metrics,
  };
  return db;
}

function fixture(start = "2026-10-27T06:00:00.000Z") {
  const db = memoryFirestore();
  let now = new Date(start),
    serial = 0;
  const repository = createGalleryRepository(
    db,
    () => new Date(now),
    () => `00000000-0000-4000-8000-${String(++serial).padStart(12, "0")}`,
  );
  return {
    db,
    repository,
    advance: (ms) => {
      now = new Date(now.getTime() + ms);
    },
    setTime: (value) => {
      now = new Date(value);
    },
    now: () => now.toISOString(),
  };
}
const key = (uid) => galleryAccountKey(uid, SECRET);
const votePath = (uid) => `${ROOT}/votes/${stableUidKey(uid)}`;
const cheerPath = (uid, gameId = SNAP) => `${ROOT}/games/${gameId}/cheers/${stableUidKey(uid)}`;
const ratePath = (uid, gameId = SNAP) => `${ROOT}/cheerLimits/${gameId}_${stableUidKey(uid)}`;
const cheer = (body = "카드 그림이 반가워요.", nickname = "섬 친구", gameId = SNAP) => ({
  action: "cheer",
  gameId,
  nickname,
  body,
});
const request = (
  body,
  {
    origin = "https://site.example",
    host = "site.example",
    type = "application/json",
    raw = false,
    headers = {},
  } = {},
) =>
  new Request("https://site.example/api/student-games/gallery", {
    method: "POST",
    headers: {
      ...(origin === null ? {} : { Origin: origin }),
      ...(host === null ? {} : { Host: host }),
      "Content-Type": type,
      ...headers,
    },
    body: raw ? body : JSON.stringify(body),
  });
function handlers(
  f,
  session = { uid: "alice", firebase: { sign_in_provider: "google.com" } },
  overrides = {},
) {
  return createGalleryHandlers({
    session: async () => session,
    accountKey: key,
    snapshot: f.repository.snapshot,
    mutate: f.repository.mutate,
    ...overrides,
  });
}
async function post(handler, uid, action, options) {
  return handler.POST(request({ ...action, accountKey: key(uid) }, options));
}

test("gallery validates canonical works, chosen nickname and Unicode text without accepting owner fields", () => {
  assert.deepEqual(
    validateGalleryInput({ ...cheer(), uid: "victim", authorUid: "victim", id: "forged" }),
    cheer(),
  );
  for (const value of [
    { action: "vote", gameId: "../other" },
    { action: "vote", gameId: "__proto__" },
    { action: "delete", gameId: SNAP },
    { ...cheer(), nickname: "mail@example.com" },
    { ...cheer(), nickname: "가".repeat(21) },
    { ...cheer(), body: "😀".repeat(141) },
    { ...cheer(), body: "\u0000" },
    { ...cheer(), body: "\u202e뒤집기" },
    { ...cheer(), body: " " },
  ])
    assert.throws(() => validateGalleryInput(value), { status: 400 });
  assert.equal(validateGalleryInput(cheer("😀".repeat(140))).body, "😀".repeat(140));
  assert.equal(validateGalleryInput(cheer("  응원합니다.  ", "  섬 친구  ")).body, "응원합니다.");
  assert.deepEqual(
    validateGalleryInput(cheer("  첫\n\t문장\u2028  다음 문장  ", "  섬\n\t친구 ")),
    cheer("첫 문장 다음 문장", "섬 친구"),
  );
});

test("private account keys rotate without changing the stable UID vote path", () => {
  const uid = "uid/with:separators?and 한글";
  const stable = stableUidKey(uid);
  assert.match(stable, /^[A-Za-z0-9_-]+$/);
  assert.equal(Buffer.from(stable, "base64url").toString(), uid);
  assert.notEqual(galleryAccountKey(uid, SECRET), galleryAccountKey(uid, SECRET + "-rotated"));
  assert.equal(stableUidKey(uid), stable);
  assert.throws(() => galleryAccountKey(uid, undefined), { status: 503 });
});

test("concurrent first choices for the same account retry into one vote and one total", async () => {
  const f = fixture();
  await Promise.all([
    f.repository.mutate("alice", { action: "vote", gameId: SNAP }),
    f.repository.mutate("alice", { action: "vote", gameId: LOG }),
  ]);
  const snapshot = await f.repository.snapshot("alice", key("alice"));
  assert.equal(snapshot.totalVotes, 1);
  assert.equal(
    Object.values(snapshot.counts).reduce((a, b) => a + b, 0),
    1,
  );
  assert.equal(snapshot.counts[snapshot.myVote], 1);
  assert.equal(f.db.paths().filter((path) => path.startsWith(`${ROOT}/votes/`)).length, 1);
  assert.ok(f.db.metrics.retries >= 1, "the real callback must have been retried after a conflict");
});

test("concurrent distinct accounts and vote changes preserve every account and the aggregate total", async () => {
  const f = fixture();
  await Promise.all(
    gameIds.map((gameId, index) =>
      f.repository.mutate(`user-${index}`, { action: "vote", gameId }),
    ),
  );
  assert.deepEqual(
    (await f.repository.snapshot(null, null)).counts,
    Object.fromEntries(gameIds.map((id) => [id, 1])),
  );
  const createdAt = f.db.peek(votePath("user-0")).createdAt;
  f.advance(1000);
  await f.repository.mutate("user-0", { action: "vote", gameId: MARKET });
  const snapshot = await f.repository.snapshot("user-0", key("user-0"));
  assert.equal(snapshot.totalVotes, 3);
  assert.deepEqual(snapshot.counts, { [SNAP]: 0, [LOG]: 1, [MARKET]: 2 });
  assert.equal(f.db.peek(votePath("user-0")).createdAt, createdAt);
  assert.equal(snapshot.myVote, MARKET);
});

test("repeating the current vote is idempotent and does not rewrite its timestamps or counters", async () => {
  const f = fixture();
  await f.repository.mutate("alice", { action: "vote", gameId: SNAP });
  const before = f.db.peek(votePath("alice")),
    writes = f.db.metrics.writes;
  f.advance(1000);
  await f.repository.mutate("alice", { action: "vote", gameId: SNAP });
  assert.equal(f.db.metrics.writes, writes);
  assert.deepEqual(f.db.peek(votePath("alice")), before);
  assert.equal((await f.repository.snapshot(null, null)).totalVotes, 1);
});

test("corrupt summaries fail closed rather than fabricating zero votes or clamping a missing old vote", async () => {
  const f = fixture();
  f.db.seed(ROOT, { counts: { [SNAP]: 1, [LOG]: 0, [MARKET]: 0 }, totalVotes: 9 });
  assert.equal((await handlers(f).GET()).status, 503);
  assert.equal((await post(handlers(f), "alice", { action: "vote", gameId: SNAP })).status, 503);
  f.db.seed(ROOT, undefined);
  f.db.seed(votePath("alice"), {
    authorUid: "alice",
    gameId: SNAP,
    createdAt: f.now(),
    updatedAt: f.now(),
  });
  assert.equal((await handlers(f).GET()).status, 503);
  assert.equal((await post(handlers(f), "alice", { action: "vote", gameId: LOG })).status, 503);
  assert.equal(f.db.peek(ROOT), undefined);
});

test("cheer edits retain public ID and creation time, while deletion preserves rate and recreation gets a new ID", async () => {
  const f = fixture();
  await f.repository.mutate("alice", cheer());
  const original = f.db.peek(cheerPath("alice"));
  f.advance(CHEER_COOLDOWN_MS);
  await f.repository.mutate("alice", cheer("함께 해보고 싶어요."));
  const edited = f.db.peek(cheerPath("alice"));
  assert.equal(edited.id, original.id);
  assert.equal(edited.createdAt, original.createdAt);
  assert.equal(edited.updatedAt, f.now());
  assert.equal(f.db.peek(ratePath("alice")).writes, 2);
  await f.repository.mutate("alice", { action: "delete-cheer", gameId: SNAP });
  assert.equal(f.db.peek(cheerPath("alice")), undefined);
  assert.equal(f.db.peek(ratePath("alice")).writes, 2);
  const deletedRate = f.db.peek(ratePath("alice"));
  await f.repository.mutate("alice", { action: "delete-cheer", gameId: SNAP });
  assert.deepEqual(f.db.peek(ratePath("alice")), deletedRate);
  await assert.rejects(() => f.repository.mutate("alice", cheer("다시 응원해요.")), {
    status: 429,
  });
  f.advance(CHEER_COOLDOWN_MS);
  await f.repository.mutate("alice", cheer("다시 응원해요."));
  assert.notEqual(f.db.peek(cheerPath("alice")).id, original.id);
  assert.equal(f.db.peek(cheerPath("alice")).createdAt, f.now());
  assert.equal(f.db.peek(ratePath("alice")).writes, 3);
});

test("simultaneous cheer edits cannot bypass the cooldown through transaction retry", async () => {
  const f = fixture();
  const results = await Promise.allSettled([
    f.repository.mutate("alice", cheer("첫 글")),
    f.repository.mutate("alice", cheer("두 번째 글")),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal(rejected.reason.status, 429);
  assert.equal(f.db.peek(ratePath("alice")).writes, 1);
  assert.equal(f.db.paths().filter((path) => path.includes("/cheers/")).length, 1);
});

test("daily posting limits survive deletion, and reset at Korean midnight without skipping the cooldown", async () => {
  const f = fixture("2026-10-27T14:59:59.000Z");
  await f.repository.mutate("alice", cheer());
  f.db.seed(ratePath("alice"), {
    day: "2026-10-27",
    writes: CHEER_DAILY_LIMIT,
    lastMutationAt: new Date(Date.parse(f.now()) - CHEER_COOLDOWN_MS).toISOString(),
  });
  await assert.rejects(() => f.repository.mutate("alice", cheer("일일 한도 초과")), {
    status: 429,
  });
  await f.repository.mutate("alice", { action: "delete-cheer", gameId: SNAP });
  assert.equal(f.db.peek(ratePath("alice")).writes, CHEER_DAILY_LIMIT);
  f.setTime("2026-10-27T15:00:00.000Z");
  await assert.rejects(() => f.repository.mutate("alice", cheer("자정 이후 글")), { status: 429 });
  f.setTime("2026-10-27T15:00:04.000Z");
  await f.repository.mutate("alice", cheer("자정 이후 글"));
  assert.equal(f.db.peek(ratePath("alice")).day, "2026-10-28");
  assert.equal(f.db.peek(ratePath("alice")).writes, 1);
});

test("the latest six public cheers do not hide an older own cheer, and opaque public IDs never disclose document keys", async () => {
  const f = fixture();
  await f.repository.mutate("older-owner-private-uid", cheer("처음 남긴 응원"));
  for (let index = 0; index < 7; index++) {
    f.advance(1000);
    await f.repository.mutate(`new-private-uid-${index}`, cheer(`최근 응원 ${index}`));
  }
  const snapshot = await f.repository.snapshot(
    "older-owner-private-uid",
    key("older-owner-private-uid"),
  );
  assert.equal(snapshot.cheers[SNAP].length, 6);
  assert.equal(
    snapshot.cheers[SNAP].some((item) => item.isMine),
    false,
  );
  assert.equal(snapshot.mine[SNAP].body, "처음 남긴 응원");
  assert.equal(snapshot.mine[SNAP].isMine, true);
  const publicSnapshot = await f.repository.snapshot(null, null),
    output = JSON.stringify(publicSnapshot);
  assert.equal(publicSnapshot.signedIn, false);
  assert.equal(publicSnapshot.accountKey, null);
  assert.ok(Object.values(publicSnapshot.mine).every((value) => value === null));
  for (const value of [
    "authorUid",
    "older-owner-private-uid",
    stableUidKey("older-owner-private-uid"),
    "new-private-uid",
  ])
    assert.equal(output.includes(value), false);
  await f.repository.mutate("new-private-uid-6", { action: "delete-cheer", gameId: SNAP });
  assert.equal(
    (await f.repository.snapshot(null, null)).cheers[SNAP].length,
    6,
    "deletion must reveal the next active post",
  );
});

test("forged body UID and IDs are ignored, while a foreign owner stored in an own path is refused", async () => {
  const f = fixture(),
    handler = handlers(f);
  await f.repository.mutate("victim", { action: "vote", gameId: SNAP });
  assert.equal(
    (
      await post(handler, "alice", {
        action: "vote",
        gameId: LOG,
        uid: "victim",
        authorUid: "victim",
      })
    ).status,
    200,
  );
  assert.equal((await f.repository.snapshot("victim", key("victim"))).myVote, SNAP);
  assert.equal((await f.repository.snapshot("alice", key("alice"))).myVote, LOG);
  await f.repository.mutate("victim", cheer("타인의 원래 글"));
  const victim = f.db.peek(cheerPath("victim"));
  const response = await post(handler, "alice", {
    ...cheer("내 글"),
    uid: "victim",
    authorUid: "victim",
    id: victim.id,
  });
  assert.equal(response.status, 200);
  assert.equal(f.db.peek(cheerPath("alice")).authorUid, "alice");
  assert.deepEqual(f.db.peek(cheerPath("victim")), victim);
  f.db.seed(cheerPath("alice"), victim);
  assert.equal((await post(handler, "alice", cheer("빼앗기 시도"))).status, 403);
  assert.equal(
    (await post(handler, "alice", { action: "delete-cheer", gameId: SNAP })).status,
    403,
  );
  f.db.seed(votePath("alice"), {
    authorUid: "victim",
    gameId: SNAP,
    createdAt: f.now(),
    updatedAt: f.now(),
  });
  assert.equal((await post(handler, "alice", { action: "vote", gameId: LOG })).status, 403);
});

test("anonymous users can read but missing/anonymous sessions cannot mutate, and stale account keys return 409", async () => {
  const f = fixture();
  const anonymous = handlers(f, null, {
    accountKey: () => {
      throw new Error("Anonymous GET must not need a signing key");
    },
  });
  assert.equal((await anonymous.GET()).status, 200);
  for (const session of [null, { uid: "guest", firebase: { sign_in_provider: "anonymous" } }]) {
    assert.equal(
      (await post(handlers(f, session), "alice", { action: "vote", gameId: SNAP })).status,
      401,
    );
  }
  const handler = handlers(f);
  for (const accountKey of [undefined, key("different-account"), "x", "0".repeat(64)]) {
    const response = await handler.POST(request({ action: "vote", gameId: SNAP, accountKey }));
    assert.equal(response.status, 409);
  }
  assert.equal(f.db.paths().length, 0);
});

test("an anonymous Firebase provider receives only the public snapshot even when its UID has prior data", async () => {
  const f = fixture();
  await f.repository.mutate("guest", { action: "vote", gameId: SNAP });
  await f.repository.mutate("guest", cheer("공개 응원"));
  const response = await handlers(f, {
    uid: "guest",
    firebase: { sign_in_provider: "anonymous" },
  }).GET();
  assert.equal(response.status, 200);
  const value = await response.json();
  assert.equal(value.signedIn, false);
  assert.equal(value.accountKey, null);
  assert.equal(value.myVote, null);
  assert.equal(value.totalVotes, 1);
  assert.deepEqual(Object.keys(value.cheers), gameIds);
  assert.deepEqual(Object.keys(value.mine), gameIds);
  assert.ok(Object.values(value.mine).every((item) => item === null));
  assert.ok(
    Object.values(value.cheers)
      .flat()
      .every((item) => item.isMine === false),
  );
});

test("write origin and real Host must match exactly before a mutation is attempted", async () => {
  const f = fixture(),
    handler = handlers(f);
  for (const options of [
    { origin: null },
    { origin: "null" },
    { origin: "https://evil.example" },
    { origin: "http://site.example" },
    { origin: "https://site.example.evil.test" },
    { host: null },
    { host: "evil.example" },
    { origin: "https://evil.example", headers: { "X-Forwarded-Host": "evil.example" } },
  ])
    assert.equal(
      (await post(handler, "alice", { action: "vote", gameId: SNAP }, options)).status,
      403,
    );
  assert.equal(f.db.paths().length, 0);
});

test("HTTP rejects invalid work IDs, malformed and oversized JSON, including chunked bodies", async () => {
  const f = fixture(),
    handler = handlers(f);
  assert.equal(
    (await post(handler, "alice", { action: "vote", gameId: "unknown-work" })).status,
    400,
  );
  for (const body of ["not-json", "[]", "null", "12"])
    assert.equal((await handler.POST(request(body, { raw: true }))).status, 400);
  assert.equal(
    (await post(handler, "alice", { action: "vote", gameId: SNAP }, { type: "text/plain" })).status,
    415,
  );
  assert.equal(
    (await handler.POST(request("x".repeat(MAX_GALLERY_BYTES + 1), { raw: true }))).status,
    413,
  );
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(5000));
      controller.enqueue(new Uint8Array(5000));
    },
    cancel() {
      cancelled = true;
    },
  });
  const streamed = new Request("https://site.example/api/student-games/gallery", {
    method: "POST",
    headers: {
      Origin: "https://site.example",
      Host: "site.example",
      "Content-Type": "application/json",
    },
    body: stream,
    duplex: "half",
  });
  assert.equal((await handler.POST(streamed)).status, 413);
  assert.equal(cancelled, true);
  const invalidUtf8 = new Request("https://site.example/api/student-games/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: new Uint8Array([0xc3, 0x28]),
  });
  await assert.rejects(() => readGalleryJson(invalidUtf8), { status: 400 });
  assert.equal(f.db.paths().length, 0);
});

test("successful responses expose the top-level contract and escape HTML while preserving user plaintext after parsing", async () => {
  const f = fixture(),
    handler = handlers(f);
  const first = await post(handler, "alice", { action: "vote", gameId: LOG });
  const firstBody = await first.json();
  assert.equal(first.status, 200);
  assert.deepEqual(Object.keys(firstBody.counts), gameIds);
  assert.equal(firstBody.myVote, LOG);
  assert.equal(firstBody.totalVotes, 1);
  assert.equal(firstBody.signedIn, true);
  assert.equal(firstBody.accountKey, key("alice"));
  assert.equal(typeof firstBody.notice, "string");
  assert.equal("snapshot" in firstBody, false);
  const body = '<script>alert("x")</script> & 함께\u2028응원\u2029해요';
  const response = await post(handler, "alice", cheer(body));
  const serialized = await response.text(),
    parsed = JSON.parse(serialized);
  assert.equal(response.status, 200);
  assert.equal(parsed.mine[SNAP].body, body.replace(/\s+/gu, " ").trim());
  assert.equal(parsed.cheers[SNAP][0].isMine, true);
  for (const executable of ["<", ">", "&", "\u2028", "\u2029"])
    assert.equal(serialized.includes(executable), false);
  for (const privateValue of ["authorUid", "alice", stableUidKey("alice"), SECRET])
    assert.equal(serialized.includes(privateValue), false);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0");
  assert.equal(response.headers.get("Vary"), "Cookie");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
});

test("cooldown responses provide Retry-After and storage failures remain 503 without fake zero counts or leaked errors", async () => {
  const f = fixture(),
    handler = handlers(f);
  assert.equal((await post(handler, "alice", cheer())).status, 200);
  const limited = await post(handler, "alice", cheer("급한 수정"));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "5");
  const unavailable = handlers(f, null, {
    snapshot: async () => {
      throw new Error("private-db-credential must not escape");
    },
  });
  const response = await unavailable.GET(),
    result = await response.json();
  assert.equal(response.status, 503);
  assert.equal("counts" in result, false);
  assert.equal(JSON.stringify(result).includes("private-db-credential"), false);
});
