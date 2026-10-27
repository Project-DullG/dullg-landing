import { randomUUID } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { stableUidKey } from "./security.ts";
import {
  assertOwner,
  changeVote,
  GalleryError,
  gameIds,
  nextCheerRate,
  publicCheer,
  readCheer,
  readSummary,
  readVote,
  PUBLIC_CHEER_LIMIT,
  type GalleryInput,
  type GallerySnapshot,
  type GameId,
  type PublicCheer,
} from "./model.ts";

export function createGalleryRepository(
  db: Firestore,
  clock: () => Date = () => new Date(),
  uuid: () => string = randomUUID,
) {
  const root = db.collection("studentGameGallery").doc("main");
  const voteRef = (uid: string) => root.collection("votes").doc(stableUidKey(uid));
  const cheers = (gameId: GameId) => root.collection("games").doc(gameId).collection("cheers");
  const cheerRef = (uid: string, gameId: GameId) => cheers(gameId).doc(stableUidKey(uid));
  const rateRef = (uid: string, gameId: GameId) =>
    root.collection("cheerLimits").doc(`${gameId}_${stableUidKey(uid)}`);

  async function snapshot(uid: string | null, accountKey: string | null): Promise<GallerySnapshot> {
    return db.runTransaction(
      async (tx) => {
        const [summaryDoc, voteDoc, publicDocs, ownDocs] = await Promise.all([
          tx.get(root),
          uid ? tx.get(voteRef(uid)) : Promise.resolve(null),
          Promise.all(
            gameIds.map((id) =>
              tx.get(cheers(id).orderBy("updatedAt", "desc").limit(PUBLIC_CHEER_LIMIT)),
            ),
          ),
          uid ? Promise.all(gameIds.map((id) => tx.get(cheerRef(uid, id)))) : Promise.resolve([]),
        ]);
        const summary = readSummary(summaryDoc.data());
        const vote = uid ? readVote(voteDoc?.data(), uid) : null;
        if (vote && (!summaryDoc.exists || summary.counts[vote.gameId] < 1))
          throw new GalleryError(
            "저장된 투표 집계를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
            503,
          );
        const lists = Object.fromEntries(
          gameIds.map((id, index) => [
            id,
            publicDocs[index].docs
              .map((doc) => readCheer(doc.data()))
              .filter((cheer) => cheer !== null)
              .map((cheer) => publicCheer(cheer, uid)),
          ]),
        ) as Record<GameId, PublicCheer[]>;
        const mine = Object.fromEntries(
          gameIds.map((id, index) => {
            const value = uid ? readCheer(ownDocs[index]?.data()) : null;
            if (value && uid) assertOwner(value.authorUid, uid);
            return [id, value ? publicCheer(value, uid) : null];
          }),
        ) as Record<GameId, PublicCheer | null>;
        return {
          ...summary,
          myVote: vote?.gameId ?? null,
          signedIn: uid !== null,
          accountKey,
          cheers: lists,
          mine,
        };
      },
      { readOnly: true },
    );
  }

  async function mutate(uid: string, input: GalleryInput): Promise<string> {
    if (input.action === "vote") {
      return db.runTransaction(async (tx) => {
        const ref = voteRef(uid);
        const [summaryDoc, previousDoc] = await Promise.all([tx.get(root), tx.get(ref)]);
        const summary = readSummary(summaryDoc.data()),
          previous = readVote(previousDoc.data(), uid);
        const next = changeVote(summary, previous?.gameId ?? null, input.gameId);
        if (previous?.gameId === input.gameId) {
          if (!summaryDoc.exists || summary.counts[input.gameId] < 1)
            throw new GalleryError(
              "저장된 투표 집계를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
              503,
            );
          return "이미 선택한 작품입니다. 계정당 현재 한 표만 반영됩니다.";
        }
        const stamp = clock().toISOString();
        tx.set(root, { version: 1, ...next, updatedAt: stamp }, { merge: true });
        tx.set(ref, {
          authorUid: uid,
          gameId: input.gameId,
          createdAt: previous?.createdAt ?? stamp,
          updatedAt: stamp,
        });
        return previous
          ? "현재 한 표를 이 작품으로 변경했습니다."
          : "이 작품에 한 표를 보냈습니다.";
      });
    }
    return db.runTransaction(async (tx) => {
      const ref = cheerRef(uid, input.gameId),
        limit = rateRef(uid, input.gameId);
      const [previousDoc, rateDoc] = await Promise.all([tx.get(ref), tx.get(limit)]);
      const previous = readCheer(previousDoc.data());
      if (previous) assertOwner(previous.authorUid, uid);
      if (input.action === "delete-cheer" && !previous) return "응원이 삭제된 상태입니다.";
      if (
        input.action === "cheer" &&
        previous?.nickname === input.nickname &&
        previous.body === input.body
      )
        return "응원이 저장된 상태입니다.";
      const now = clock(),
        stamp = now.toISOString();
      const rate = nextCheerRate(rateDoc.data(), now, input.action === "delete-cheer");
      if (input.action === "delete-cheer") {
        tx.delete(ref);
        tx.set(limit, rate);
        return "응원을 삭제했습니다.";
      }
      tx.set(ref, {
        id: previous?.id ?? uuid(),
        authorUid: uid,
        nickname: input.nickname,
        body: input.body,
        createdAt: previous?.createdAt ?? stamp,
        updatedAt: stamp,
      });
      tx.set(limit, rate);
      return previous ? "응원을 수정했습니다." : "응원을 남겼습니다.";
    });
  }
  return { snapshot, mutate };
}
