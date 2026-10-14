// Optional local integration check. Never contacts a production project or uses real accounts.
// Run: node --experimental-strip-types tests/english-firestore.integration.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { pathToFileURL } from "node:url";
import { cert, initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { englishEpisodes } from "../lib/english/catalog.ts";
import { getEnglishGrowth } from "../lib/english/progress.ts";

const project = "demo-english-journey";
const repository = path.resolve(import.meta.dirname, "..");
const jar = process.env.ENGLISH_FIRESTORE_EMULATOR_JAR || "/Users/kimkanghoon/.cache/firebase/emulators/cloud-firestore-emulator-v1.20.2.jar";
const esbuild = process.env.ENGLISH_ESBUILD_BIN || "/Users/kimkanghoon/.npm/_npx/fd45a72a545557e9/node_modules/esbuild/bin/esbuild";
if (!existsSync(jar) || !existsSync(esbuild)) throw new Error("Provide an already installed emulator jar and esbuild binary. No packages will be installed.");
// Deliberately start a fresh local emulator even if a production-oriented shell has variables set.
const temporary = await mkdtemp(path.join(tmpdir(), "english-firestore-check-"));
const bundle = path.join(repository, "tests", `.english-server-${process.pid}.mjs`);
const freePort = await new Promise((resolve, reject) => {
  const server = net.createServer(); server.on("error", reject);
  server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); });
});
const endpoint = `127.0.0.1:${freePort}`;
process.env.FIRESTORE_EMULATOR_HOST = endpoint;
process.env.GCLOUD_PROJECT = project;
process.env.GOOGLE_CLOUD_PROJECT = project;
let emulatorLog = "";
const emulator = spawn("java", ["-jar", jar, "--host", "127.0.0.1", "--port", String(freePort), "--project_id", project, "--single_project_mode", "true", "--single_project_mode_error", "true", "--rules", path.join(repository, "firestore.rules")], { cwd: temporary, stdio: ["ignore", "pipe", "pipe"] });
for (const stream of [emulator.stdout, emulator.stderr]) stream.on("data", (chunk) => { emulatorLog = (emulatorLog + chunk).slice(-12000); });
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let app;
let db;
let checks = 0;
async function run(command, args) {
  const child = spawn(command, args, { cwd: repository, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => { output += chunk; });
  const result = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
  if (result !== 0) throw new Error(`Local build failed: ${output}`);
}
function check(label) { checks++; console.log(`PASS ${label}`); }

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (emulator.exitCode !== null) throw new Error(`Local emulator stopped: ${emulatorLog}`);
    try { const response = await fetch(`http://${endpoint}/`, { signal: AbortSignal.timeout(500) }); if (response.ok) { ready = true; break; } } catch { /* Wait for the local process only. */ }
    await pause(200);
  }
  if (!ready) throw new Error(`Local emulator did not start: ${emulatorLog}`);
  await writeFile(path.join(temporary, "server-only.js"), "export {};\n");
  await run(esbuild, ["lib/english/server.ts", "--bundle", "--platform=node", "--format=esm", "--packages=external", `--alias:server-only=${path.join(temporary, "server-only.js")}`, `--outfile=${bundle}`]);
  // Preinitialize a demo project so the site's Admin helper never opens credential configuration.
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  app = initializeApp({ projectId: project, credential: cert({ projectId: project, clientEmail: `local-emulator@${project}.iam.gserviceaccount.com`, privateKey }) });
  db = getFirestore(app);
  assert.equal(db.projectId, project);
  const backend = await import(pathToFileURL(bundle).href);
  const uidA = "emulator-learner-a", uidB = "emulator-learner-b", uidC = "emulator-learner-c";
  const keyA = backend.accountKey(uidA), keyB = backend.accountKey(uidB), keyC = backend.accountKey(uidC);
  const episode = englishEpisodes[0], first = episode.tasks[0];
  const attemptInput = (task, key = keyA) => ({ action: "attempt", accountKey: key, episodeId: episode.id, taskId: task.id, level: "standard", answer: task.versions.standard.correctOption || task.versions.standard.model, ...(task.skill === "speaking" ? { selfConfirmed: true } : {}) });
  assert.equal((await backend.readEnglishProgress(uidA)).xp, 0);
  assert.equal((await backend.readEnglishProgress(uidB)).xp, 0);
  await assert.rejects(() => backend.updateEnglishProgress(uidB, attemptInput(first, keyA)), { status: 409 });
  assert.equal((await db.collection("englishProgress").doc(uidB).get()).exists, false);
  check("initial records are empty and stale account keys cannot write another UID");

  await assert.rejects(() => backend.updateEnglishProgress(uidA, attemptInput(episode.tasks[2])), { status: 409 });
  const wrong = await backend.updateEnglishProgress(uidA, { ...attemptInput(first), answer: "unrecognized-choice" });
  assert.equal(wrong.correct, false);
  assert.equal((await db.collection("englishProgress").doc(uidA).get()).exists, false);
  check("out-of-order and incorrect tasks cannot create progress");

  const concurrent = await Promise.all(Array.from({ length: 4 }, () => backend.updateEnglishProgress(uidA, attemptInput(first))));
  assert.equal(concurrent.filter((result) => !result.duplicate).length, 1);
  const unique = await backend.readEnglishProgress(uidA);
  assert.equal(unique.xp, 20);
  assert.equal(unique.skills[first.skill], 1);
  assert.deepEqual(unique.episodes[episode.id].completedTasks, [first.id]);
  assert.equal(getEnglishGrowth(unique).todayActivities, 1);
  check("concurrent identical attempts award unique task XP once in real Firestore transactions");

  for (const task of episode.tasks.slice(1)) assert.equal((await backend.updateEnglishProgress(uidA, attemptInput(task))).correct, true);
  const completed = await backend.readEnglishProgress(uidA);
  assert.equal(completed.xp, episode.tasks.length * 20 + 30);
  assert.ok(completed.episodes[episode.id].completedAt);
  const replay = await backend.updateEnglishProgress(uidA, attemptInput(first));
  assert.equal(replay.duplicate, true);
  assert.equal(replay.progress.xp, completed.xp);
  await backend.updateEnglishProgress(uidB, attemptInput(first, keyB));
  await backend.updateEnglishProgress(uidB, { action: "level", level: "starter", accountKey: keyB });
  assert.equal((await backend.readEnglishProgress(uidB)).xp, 20);
  assert.equal((await backend.readEnglishProgress(uidB)).preferredLevel, "starter");
  assert.equal((await backend.readEnglishProgress(uidA)).preferredLevel, "standard");
  check("completion and replay remain idempotent, and account records and preferences are isolated");

  const createA = await backend.updateEnglishCommunity(uidA, { action: "create", accountKey: keyA, nickname: "이야기 독자", title: "한국어로 남긴 오늘의 기록", body: "I found the clue. 오늘 배운 표현입니다.", category: "journal", learnerLevel: 999, authorUid: uidB });
  const postId = createA.post.id;
  assert.equal(createA.post.authorKey, keyA);
  assert.equal(createA.post.learnerLevel, getEnglishGrowth(completed).level);
  assert.equal(createA.post.nickname, "이야기 독자");
  await backend.updateEnglishCommunity(uidB, { action: "create", accountKey: keyB, nickname: "다음 페이지", title: "함께 연습해요", body: "새 표현을 배웠어요.", category: "question" });
  const posts = await backend.listEnglishCommunity();
  assert.equal(posts.length, 2);
  for (const uid of [uidA, uidB]) assert.equal(JSON.stringify(posts).includes(uid), false);
  assert.equal((await backend.listEnglishCommunity("question")).length, 1);
  await assert.rejects(() => backend.updateEnglishCommunity(uidA, { action: "create", accountKey: keyA, nickname: "독자", title: "반복", body: "반복", category: "journal" }), { status: 429 });
  check("posts use chosen nicknames and actual learning levels, omit UID metadata, filter categories, and enforce creation limits");

  const likes = await Promise.all(Array.from({ length: 4 }, () => backend.updateEnglishCommunity(uidB, { action: "like", accountKey: keyB, postId })));
  assert.equal(likes.filter((result) => !result.duplicate).length, 1);
  await backend.updateEnglishCommunity(uidC, { action: "like", accountKey: keyC, postId });
  assert.equal((await backend.listEnglishCommunity()).find((post) => post.id === postId).likes, 2);
  assert.equal((await backend.readEnglishProgress(uidB)).xp, 20);
  check("concurrent likes count once per account and community activity earns no learning XP");

  const response = await backend.updateEnglishCommunity(uidB, { action: "reply", accountKey: keyB, postId, nickname: "동료 학습자", body: "같이 읽었어요. 고마워요." });
  const replyId = response.post.replies[0].id;
  assert.equal(response.post.replyCount, 1);
  assert.equal(response.post.replies[0].learnerLevel, getEnglishGrowth(await backend.readEnglishProgress(uidB)).level);
  await assert.rejects(() => backend.updateEnglishCommunity(uidA, { action: "delete", accountKey: keyA, postId, replyId }), { status: 403 });
  const removedReply = await backend.updateEnglishCommunity(uidB, { action: "delete", accountKey: keyB, postId, replyId });
  assert.equal(removedReply.post.replyCount, 0);
  await assert.rejects(() => backend.updateEnglishCommunity(uidB, { action: "delete", accountKey: keyB, postId }), { status: 403 });
  check("replies persist with real author metadata and deletion is restricted to each contribution's owner");

  const reported = await backend.updateEnglishCommunity(uidB, { action: "report", accountKey: keyB, postId, body: "운영자 확인을 요청합니다." });
  assert.equal(reported.reported, true);
  const repeatReport = await backend.updateEnglishCommunity(uidB, { action: "report", accountKey: keyB, postId, body: "운영자 확인을 요청합니다." });
  assert.equal(repeatReport.duplicate, true);
  assert.equal((await db.collection("englishCommunityReports").get()).size, 1);
  assert.equal(JSON.stringify(await backend.listEnglishCommunity()).includes("운영자 확인을 요청합니다"), false);
  await backend.updateEnglishCommunity(uidA, { action: "delete", accountKey: keyA, postId });
  assert.equal((await db.collection("englishCommunity").doc(postId).get()).data().body, "");
  assert.equal((await backend.listEnglishCommunity()).some((post) => post.id === postId), false);
  check("reports enter a private queue once, and soft-deleted posts disappear from public lists");

  // Exercise client rules through the emulator's REST endpoint, without Admin bypass.
  const anonymousRead = await fetch(`http://${endpoint}/v1/projects/${project}/databases/(default)/documents/englishProgress/${uidA}`);
  assert.equal(anonymousRead.status, 403);
  const anonymousWrite = await fetch(`http://${endpoint}/v1/projects/${project}/databases/(default)/documents/englishProgress/anonymous`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { version: { integerValue: "1" } } }) });
  assert.equal(anonymousWrite.status, 403);
  const anonymousReports = await fetch(`http://${endpoint}/v1/projects/${project}/databases/(default)/documents/englishCommunityReports`);
  assert.equal(anonymousReports.status, 403);
  const seconds = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  // The emulator accepts unsigned test Auth tokens. This token is local-only and never valid on Firebase production.
  const token = `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: uidA, user_id: uidA, aud: project, iss: `https://securetoken.google.com/${project}`, iat: seconds, exp: seconds + 3600, auth_time: seconds, firebase: { sign_in_provider: "custom", identities: {} } })}.`;
  const ownRead = await fetch(`http://${endpoint}/v1/projects/${project}/databases/(default)/documents/englishProgress/${uidA}`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(ownRead.status, 403);
  const ownWrite = await fetch(`http://${endpoint}/v1/projects/${project}/databases/(default)/documents/englishProgress/${uidA}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ fields: { version: { integerValue: "1" } } }) });
  assert.equal(ownWrite.status, 403);
  check("Firestore client rules deny anonymous and signed-in progress reads/writes and access to the private moderation queue");
  console.log(`Verified ${checks} local integration groups against ${project} at ${endpoint}. No production data was used.`);
} finally {
  if (db) await db.terminate();
  if (app) await deleteApp(app);
  emulator.kill("SIGTERM");
  await Promise.race([new Promise((resolve) => emulator.once("close", resolve)), pause(3000)]);
  if (emulator.exitCode === null) emulator.kill("SIGKILL");
  await rm(bundle, { force: true });
  await rm(temporary, { recursive: true, force: true });
}
