import { EnglishInputError, englishDay } from "./progress.ts";

export const communityCategories = ["question", "journal", "review"] as const;
export type CommunityCategory = typeof communityCategories[number];
export const communityCategoryLabels: Record<CommunityCategory, string> = {
  question: "질문", journal: "학습 일지", review: "작품 후기",
};
export type CommunityReply = {
  id: string; body: string; nickname: string; authorKey: string;
  learnerLevel: number; learnerTitle: string; createdAt: string;
};
export type CommunityPost = CommunityReply & {
  title: string; category: CommunityCategory; likes: number; replyCount: number;
  replies: CommunityReply[];
};
export type CommunityInput = {
  action: "create" | "reply" | "like" | "delete" | "report";
  nickname?: string; body?: string; title?: string; category?: CommunityCategory;
  postId?: string; replyId?: string;
};

function boundedText(value: unknown, label: string, max: number): string {
  if (typeof value !== "string") throw new EnglishInputError(`${label}${label === "신고 사유" ? "를" : "을"} 입력해 주세요.`);
  const text = value.normalize("NFKC").trim();
  if (!text || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))
    throw new EnglishInputError(`${label}${label === "신고 사유" ? "는" : "은"} ${max}자 이내로 입력해 주세요.`);
  return text;
}

export function validateCommunityInput(raw: unknown): CommunityInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new EnglishInputError("요청 내용을 확인해 주세요.");
  const value = raw as Record<string, unknown>;
  if (!["create", "reply", "like", "delete", "report"].includes(value.action as string))
    throw new EnglishInputError("커뮤니티 요청을 확인해 주세요.");
  const action = value.action as CommunityInput["action"];
  const input: CommunityInput = { action };
  if (action !== "create") {
    if (typeof value.postId !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(value.postId))
      throw new EnglishInputError("게시물을 확인해 주세요.");
    input.postId = value.postId;
  }
  if (value.replyId !== undefined) {
    if (action !== "delete" || typeof value.replyId !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(value.replyId))
      throw new EnglishInputError("답글을 확인해 주세요.");
    input.replyId = value.replyId;
  }
  if (action === "create" || action === "reply") {
    input.nickname = boundedText(value.nickname, "닉네임", 20);
    if (!/^[\p{L}\p{N}_ .-]+$/u.test(input.nickname))
      throw new EnglishInputError("닉네임은 글자·숫자·공백·밑줄·마침표·하이픈으로 입력해 주세요.");
    input.body = boundedText(value.body, "내용", 1200);
  }
  if (action === "create") {
    input.title = boundedText(value.title, "제목", 80);
    if (!communityCategories.includes(value.category as CommunityCategory))
      throw new EnglishInputError("글의 분류를 선택해 주세요.");
    input.category = value.category as CommunityCategory;
  }
  if (action === "report") input.body = boundedText(value.body, "신고 사유", 500);
  return input;
}

export function communityOriginAllowed(origin: string | null, requestUrl: string, requestHost?: string | null): boolean {
  try {
    const url = new URL(requestUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (requestHost === undefined) return origin !== null && origin === url.origin;
    // Next may normalize the request URL hostname to localhost. The incoming Host is authoritative;
    // forwarded-host headers are intentionally excluded from this same-origin comparison.
    if (!requestHost || requestHost.length > 255 || !/^(?:[a-z0-9.-]+|\[[a-f0-9:.]+\])(?::\d{1,5})?$/i.test(requestHost)) return false;
    const expectedOrigin = new URL(`${url.protocol}//${requestHost}`).origin;
    return origin !== null && origin === expectedOrigin;
  } catch { return false; }
}

export function assertCommunityOwner(authorUid: unknown, uid: string) {
  if (typeof authorUid !== "string" || authorUid !== uid)
    throw new EnglishInputError("본인이 작성한 글만 삭제할 수 있습니다.", 403);
}

export type CommunityRate = {
  day: string; creates: number; replies: number; reports: number;
  lastCreatedAt?: string; lastRepliedAt?: string;
};
export function nextCommunityRate(stored: CommunityRate | undefined, action: CommunityInput["action"], now: Date): CommunityRate {
  const day = englishDay(now);
  const rate: CommunityRate = stored?.day === day ? { ...stored } : { day, creates: 0, replies: 0, reports: 0 };
  if (action === "create") {
    if (rate.creates >= 5 || (rate.lastCreatedAt && now.getTime() - Date.parse(rate.lastCreatedAt) < 60_000))
      throw new EnglishInputError("게시물은 1분 간격으로 하루 5개까지 작성할 수 있습니다.", 429);
    rate.creates++;
    rate.lastCreatedAt = now.toISOString();
  }
  if (action === "reply") {
    if (rate.replies >= 30 || (rate.lastRepliedAt && now.getTime() - Date.parse(rate.lastRepliedAt) < 10_000))
      throw new EnglishInputError("답글은 10초 간격으로 하루 30개까지 작성할 수 있습니다.", 429);
    rate.replies++;
    rate.lastRepliedAt = now.toISOString();
  }
  if (action === "report") {
    if (rate.reports >= 10) throw new EnglishInputError("오늘 신고 가능한 수를 모두 사용했습니다.", 429);
    rate.reports++;
  }
  return rate;
}

type PublicAuthorKey = (uid: string) => string;
function publicText(value: unknown, maximum: number) { return typeof value === "string" ? value.slice(0, maximum) : ""; }
function publicCount(value: unknown) { return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0; }
export function publicCommunityReply(id: string, raw: Record<string, unknown>, authorKey: PublicAuthorKey): CommunityReply | null {
  if (raw.deletedAt || typeof raw.authorUid !== "string") return null;
  return {
    id, body: publicText(raw.body, 1200), nickname: publicText(raw.nickname, 20),
    authorKey: authorKey(raw.authorUid), learnerLevel: Math.max(1, publicCount(raw.learnerLevel)),
    learnerTitle: publicText(raw.learnerTitle, 30), createdAt: publicText(raw.createdAt, 32),
  };
}
export function publicCommunityPost(id: string, raw: Record<string, unknown>, authorKey: PublicAuthorKey): CommunityPost | null {
  const author = publicCommunityReply(id, raw, authorKey);
  if (!author || !communityCategories.includes(raw.category as CommunityCategory)) return null;
  const replies = Array.isArray(raw.replies) ? raw.replies.flatMap((value) => {
    if (!value || typeof value !== "object" || typeof value.id !== "string") return [];
    const reply = publicCommunityReply(value.id, value, authorKey);
    return reply ? [reply] : [];
  }).slice(-60) : [];
  return { ...author, title: publicText(raw.title, 80), category: raw.category as CommunityCategory,
    likes: publicCount(raw.likes), replyCount: replies.length, replies };
}
