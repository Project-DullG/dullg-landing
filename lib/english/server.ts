import "server-only";
import { randomUUID } from "node:crypto";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { allEnglishContent, getEnglishEpisode, getEnglishExpression } from "./catalog";
import { getEnglishCourse } from "./courses";
import type { EnglishProgress } from "./types";
import {
  advanceEnglishProgress,
  advanceEnglishReview,
  emptyEnglishProgress,
  EnglishInputError,
  getEnglishGrowth,
  reconcileEnglishProgress,
  setEnglishLevel,
  validateEnglishAttempt,
} from "./progress";
import {
  assertCommunityOwner,
  nextCommunityRate,
  publicCommunityPost,
  validateCommunityInput,
  type CommunityCategory,
  type CommunityPost,
  type CommunityRate,
} from "./community";
import { accountKey, assertEnglishAccount } from "./security";
export { accountKey, readEnglishJson } from "./security";

export const englishPrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
function progressRecord(uid: string) {
  return getAdminDb().collection("englishProgress").doc(uid);
}
function storedProgress(raw: Record<string, unknown> | undefined): EnglishProgress {
  if (!raw) return emptyEnglishProgress();
  const progress = raw.progress as EnglishProgress | undefined;
  if (
    raw.version !== 1 ||
    !progress ||
    progress.version !== 1 ||
    !progress.episodes ||
    !progress.skills ||
    !Array.isArray(progress.learnedExpressionIds) ||
    !Array.isArray(progress.activeDates) ||
    !progress.reviews
  )
    throw new Error("저장된 영어 학습 기록을 확인하지 못했습니다.");
  return reconcileEnglishProgress(
    {
      ...emptyEnglishProgress(),
      ...progress,
      xp: progress.xp || 0,
      dailyActivity: progress.dailyActivity || {},
    },
    allEnglishContent,
  );
}
export async function readEnglishProgress(uid: string): Promise<EnglishProgress> {
  const snapshot = await progressRecord(uid).get();
  return storedProgress(snapshot.data());
}
export async function updateEnglishProgress(uid: string, value: Record<string, unknown>) {
  assertEnglishAccount(uid, value.accountKey);
  if (!["attempt", "level", "review"].includes(value.action as string))
    throw new EnglishInputError("학습 요청을 확인해 주세요.");
  const attempt = value.action === "attempt" ? validateEnglishAttempt(value) : undefined;
  if (
    attempt?.courseId &&
    !getEnglishCourse(attempt.courseId)?.units.some((unit) => unit.contentId === attempt.episodeId)
  )
    throw new EnglishInputError("학습 코스를 확인해 주세요.");
  if (
    value.action === "review" &&
    (typeof value.expressionId !== "string" || !/^[a-z0-9-]{1,100}$/.test(value.expressionId))
  )
    throw new EnglishInputError("복습 표현을 확인해 주세요.");
  const db = getAdminDb(),
    ref = progressRecord(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const progress = storedProgress(doc.data());
    const now = new Date();
    const result =
      value.action === "attempt" && attempt
        ? advanceEnglishProgress(progress, attempt, getEnglishEpisode(attempt.episodeId), now)
        : value.action === "review"
          ? advanceEnglishReview(
              progress,
              getEnglishExpression(value.expressionId as string),
              value.answer,
              now,
            )
          : { progress: setEnglishLevel(progress, value.level, now) };
    if (result.progress !== progress)
      tx.set(ref, { version: 1, progress: result.progress, updatedAt: now.toISOString() });
    return result;
  });
}

export async function collectEnglishCommunityPosts(
  readPage: () => Promise<{ posts: CommunityPost[]; hasMore: boolean }>,
  category?: CommunityCategory,
) {
  const posts: CommunityPost[] = [];
  // Fill the latest 30 public posts while bounding each request to 300 documents.
  for (let page = 0; page < 10 && posts.length < 30; page++) {
    const result = await readPage();
    posts.push(...result.posts.slice(0, 30 - posts.length));
    if (!result.hasMore) break;
  }
  // Category filters still apply to the latest public window, not to all historical posts.
  return category ? posts.filter((post) => post.category === category) : posts;
}

export async function listEnglishCommunity(category?: CommunityCategory) {
  const query = getAdminDb().collection("englishCommunity").orderBy("createdAt", "desc").limit(30);
  let cursor: QueryDocumentSnapshot | undefined;
  return collectEnglishCommunityPosts(async () => {
    const snapshot = await (cursor ? query.startAfter(cursor) : query).get();
    cursor = snapshot.docs[snapshot.docs.length - 1];
    return {
      posts: snapshot.docs.flatMap((doc) => {
        const post = publicCommunityPost(doc.id, doc.data(), accountKey);
        return post ? [post] : [];
      }),
      hasMore: snapshot.size === 30,
    };
  }, category);
}

export async function updateEnglishCommunity(uid: string, raw: Record<string, unknown>) {
  assertEnglishAccount(uid, raw.accountKey);
  const input = validateCommunityInput(raw);
  const db = getAdminDb();
  const postRef = db.collection("englishCommunity").doc(input.postId || randomUUID());
  const rateRef = db.collection("englishCommunityLimits").doc(uid);
  const actorRef = postRef
    .collection(input.action === "report" ? "reports" : "likes")
    .doc(accountKey(uid));
  return db.runTransaction(async (tx) => {
    const now = new Date(),
      stamp = now.toISOString();
    // All transaction reads precede writes so retries cannot award extra activity or likes.
    const [postDoc, rateDoc, progressDoc, actorDoc] = await Promise.all([
      tx.get(postRef),
      tx.get(rateRef),
      tx.get(progressRecord(uid)),
      input.action === "like" || input.action === "report"
        ? tx.get(actorRef)
        : Promise.resolve(null),
    ]);
    const stored = postDoc.data();
    if (input.action !== "create" && (!postDoc.exists || stored?.deletedAt))
      throw new EnglishInputError("게시물을 찾을 수 없습니다.", 404);
    const rate = nextCommunityRate(rateDoc.data() as CommunityRate | undefined, input.action, now);
    const growth = getEnglishGrowth(storedProgress(progressDoc.data()), now);
    const author = {
      authorUid: uid,
      nickname: input.nickname,
      learnerLevel: growth.level,
      learnerTitle: growth.title,
      createdAt: stamp,
    };
    let next: Record<string, unknown>;
    if (input.action === "create") {
      next = {
        ...author,
        title: input.title,
        body: input.body,
        category: input.category,
        likes: 0,
        replies: [],
        updatedAt: stamp,
      };
      tx.set(postRef, next);
      tx.set(rateRef, rate);
    } else if (input.action === "reply") {
      const replies = Array.isArray(stored?.replies) ? stored.replies : [];
      if (replies.length >= 60)
        throw new EnglishInputError("이 글의 답글이 가득 찼습니다. 새 글로 이어 주세요.", 409);
      next = {
        ...stored,
        replies: [...replies, { ...author, id: randomUUID(), body: input.body }],
        updatedAt: stamp,
      };
      tx.set(postRef, next);
      tx.set(rateRef, rate);
    } else if (input.action === "like") {
      if (actorDoc?.exists)
        return { post: publicCommunityPost(postRef.id, stored!, accountKey), duplicate: true };
      next = { ...stored, likes: Math.max(0, Number(stored?.likes) || 0) + 1 };
      tx.set(actorRef, { createdAt: stamp });
      tx.update(postRef, { likes: next.likes });
    } else if (input.action === "delete") {
      if (input.replyId) {
        const replies = Array.isArray(stored?.replies) ? stored.replies : [];
        const reply = replies.find((item) => item.id === input.replyId);
        if (!reply || reply.deletedAt) throw new EnglishInputError("답글을 찾을 수 없습니다.", 404);
        assertCommunityOwner(reply.authorUid, uid);
        next = {
          ...stored,
          replies: replies.map((item) =>
            item.id === input.replyId ? { ...item, body: "", deletedAt: stamp } : item,
          ),
        };
        tx.set(postRef, next);
      } else {
        assertCommunityOwner(stored?.authorUid, uid);
        tx.update(postRef, { deletedAt: stamp, body: "", title: "" });
        return { deleted: true, postId: postRef.id };
      }
    } else {
      if (actorDoc?.exists) return { reported: true, duplicate: true };
      // Reports are never included in public lists; Admin SDK is the only writer/reader.
      tx.set(actorRef, { reporterUid: uid, reason: input.body, createdAt: stamp });
      tx.set(db.collection("englishCommunityReports").doc(`${postRef.id}_${accountKey(uid)}`), {
        postId: postRef.id,
        reporterUid: uid,
        reason: input.body,
        createdAt: stamp,
        status: "pending",
      });
      tx.set(rateRef, rate);
      return { reported: true, duplicate: false };
    }
    return { post: publicCommunityPost(postRef.id, next, accountKey), duplicate: false };
  });
}

export function englishFailure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof EnglishInputError
          ? error.message
          : "내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    {
      status: error instanceof EnglishInputError ? error.status : 503,
      headers: englishPrivateHeaders,
    },
  );
}
