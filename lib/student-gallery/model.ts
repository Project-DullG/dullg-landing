import { studentGames } from "../student-games.ts";

export type GameId = (typeof studentGames)[number]["slug"];
export const gameIds: readonly GameId[] = studentGames.map((game) => game.slug);
export const CHEER_COOLDOWN_MS = 5_000;
export const CHEER_DAILY_LIMIT = 30;
export const PUBLIC_CHEER_LIMIT = 6;

export class GalleryError extends Error {
  status: number;
  retryAfter?: number;
  constructor(message: string, status = 400, retryAfter?: number) {
    super(message);
    this.name = "GalleryError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export type GalleryInput =
  | { action: "vote"; gameId: GameId }
  | { action: "delete-cheer"; gameId: GameId }
  | { action: "cheer"; gameId: GameId; nickname: string; body: string };
export type VoteSummary = { counts: Record<GameId, number>; totalVotes: number };
export type PublicCheer = {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
};
export type GallerySnapshot = VoteSummary & {
  myVote: GameId | null;
  signedIn: boolean;
  accountKey: string | null;
  cheers: Record<GameId, PublicCheer[]>;
  mine: Record<GameId, PublicCheer | null>;
};
export type VoteRecord = {
  authorUid: string;
  gameId: GameId;
  createdAt: string;
  updatedAt: string;
};
export type CheerRecord = Omit<PublicCheer, "isMine"> & { authorUid: string };
export type CheerRate = { day: string; writes: number; lastMutationAt: string };

export function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && gameIds.includes(value as GameId);
}
function boundedText(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string") throw new GalleryError(`${label}을 입력해 주세요.`);
  const text = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  if (
    !text ||
    [...text].length > maximum ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)
  )
    throw new GalleryError(`${label}은 ${maximum}자 이내로 입력해 주세요.`);
  return text;
}
export function validateGalleryInput(raw: Record<string, unknown>): GalleryInput {
  if (!isGameId(raw.gameId)) throw new GalleryError("응원할 작품을 확인해 주세요.");
  if (raw.action === "vote" || raw.action === "delete-cheer")
    return { action: raw.action, gameId: raw.gameId };
  if (raw.action !== "cheer") throw new GalleryError("참여 방법을 확인해 주세요.");
  const nickname = boundedText(raw.nickname, "닉네임", 20);
  if (!/^[\p{L}\p{N}_ .-]+$/u.test(nickname))
    throw new GalleryError(
      "닉네임에는 글자, 숫자, 공백, 밑줄, 마침표와 하이픈을 사용할 수 있습니다.",
    );
  return {
    action: "cheer",
    gameId: raw.gameId,
    nickname,
    body: boundedText(raw.body, "응원 한마디", 140),
  };
}

export function emptySummary(): VoteSummary {
  return {
    counts: Object.fromEntries(gameIds.map((id) => [id, 0])) as Record<GameId, number>,
    totalVotes: 0,
  };
}
function corrupt(): never {
  throw new GalleryError(
    "저장된 참여 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    503,
  );
}
export function readSummary(value: Record<string, unknown> | undefined): VoteSummary {
  if (!value) return emptySummary();
  const counts = value.counts as Record<string, unknown> | undefined;
  if (
    !counts ||
    typeof counts !== "object" ||
    Array.isArray(counts) ||
    Object.keys(counts).length !== gameIds.length ||
    Object.keys(counts).some((id) => !isGameId(id))
  )
    corrupt();
  if (
    gameIds.some((id) => !Number.isSafeInteger(counts[id]) || (counts[id] as number) < 0) ||
    !Number.isSafeInteger(value.totalVotes) ||
    (value.totalVotes as number) < 0
  )
    corrupt();
  const sum = gameIds.reduce((total, id) => total + (counts[id] as number), 0);
  if (!Number.isSafeInteger(sum) || sum !== value.totalVotes) corrupt();
  return {
    counts: Object.fromEntries(gameIds.map((id) => [id, counts[id]])) as Record<GameId, number>,
    totalVotes: sum,
  };
}
function validStamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 32 && Number.isFinite(Date.parse(value));
}
export function assertOwner(value: unknown, uid: string): void {
  if (typeof value !== "string" || value !== uid)
    throw new GalleryError("본인이 작성한 응원만 수정하거나 삭제할 수 있습니다.", 403);
}
export function readVote(
  value: Record<string, unknown> | undefined,
  uid: string,
): VoteRecord | null {
  if (!value) return null;
  assertOwner(value.authorUid, uid);
  if (!isGameId(value.gameId) || !validStamp(value.createdAt) || !validStamp(value.updatedAt))
    corrupt();
  return {
    authorUid: uid,
    gameId: value.gameId,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}
export function changeVote(
  summary: VoteSummary,
  previous: GameId | null,
  next: GameId,
): VoteSummary {
  if (previous === next) return summary;
  if (previous && summary.counts[previous] < 1) corrupt();
  const result = {
    counts: { ...summary.counts },
    totalVotes: summary.totalVotes + (previous ? 0 : 1),
  };
  if (previous) result.counts[previous]--;
  result.counts[next]++;
  return readSummary(result);
}
export function readCheer(value: Record<string, unknown> | undefined): CheerRecord | null {
  if (!value) return null;
  if (
    typeof value.authorUid !== "string" ||
    !value.authorUid ||
    typeof value.id !== "string" ||
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value.id) ||
    !validStamp(value.createdAt) ||
    !validStamp(value.updatedAt)
  )
    corrupt();
  let input: GalleryInput;
  try {
    input = validateGalleryInput({
      action: "cheer",
      gameId: gameIds[0],
      nickname: value.nickname,
      body: value.body,
    });
  } catch {
    return corrupt();
  }
  if (input.action !== "cheer") corrupt();
  return {
    id: value.id,
    authorUid: value.authorUid,
    nickname: input.nickname,
    body: input.body,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}
export function publicCheer(value: CheerRecord, uid: string | null): PublicCheer {
  return {
    id: value.id,
    nickname: value.nickname,
    body: value.body,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    isMine: uid !== null && value.authorUid === uid,
  };
}

export function nextCheerRate(
  value: Record<string, unknown> | undefined,
  now: Date,
  deleting = false,
): CheerRate {
  const today = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (
    value &&
    (typeof value.day !== "string" ||
      !Number.isSafeInteger(value.writes) ||
      (value.writes as number) < 0 ||
      !validStamp(value.lastMutationAt))
  )
    corrupt();
  if (
    !deleting &&
    value &&
    now.getTime() - Date.parse(value.lastMutationAt as string) < CHEER_COOLDOWN_MS
  ) {
    const remaining = Math.max(
      1,
      Math.ceil(
        (CHEER_COOLDOWN_MS - (now.getTime() - Date.parse(value.lastMutationAt as string))) / 1000,
      ),
    );
    throw new GalleryError(
      `응원은 ${remaining}초 뒤에 다시 작성하거나 수정할 수 있습니다.`,
      429,
      remaining,
    );
  }
  const writes = value?.day === today ? (value.writes as number) : 0;
  if (!deleting && writes >= CHEER_DAILY_LIMIT)
    throw new GalleryError("이 작품의 응원은 하루 30회까지 작성하거나 수정할 수 있습니다.", 429);
  // Deleting an unwanted post remains possible even after the posting limit.
  return { day: today, writes: writes + (deleting ? 0 : 1), lastMutationAt: now.toISOString() };
}
