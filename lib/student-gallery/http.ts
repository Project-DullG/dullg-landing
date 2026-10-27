import {
  GalleryError,
  validateGalleryInput,
  type GalleryInput,
  type GallerySnapshot,
} from "./model.ts";
import {
  assertGalleryAccount,
  galleryHeaders,
  galleryOriginAllowed,
  participantUid,
  readGalleryJson,
  type GallerySession,
} from "./security.ts";

type Dependencies = {
  session: () => Promise<GallerySession | null>;
  accountKey: (uid: string) => string;
  snapshot: (uid: string | null, accountKey: string | null) => Promise<GallerySnapshot>;
  mutate: (uid: string, input: GalleryInput) => Promise<string>;
};
function json(value: unknown, status = 200, retryAfter?: number): Response {
  // Preserve plaintext after JSON.parse while never emitting executable HTML in the JSON bytes.
  const body = JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return new Response(body, {
    status,
    headers: {
      ...galleryHeaders,
      "Content-Type": "application/json; charset=utf-8",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}
function failure(error: unknown): Response {
  return error instanceof GalleryError
    ? json({ error: error.message }, error.status, error.retryAfter)
    : json({ error: "참여 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
}
export function createGalleryHandlers(dependencies: Dependencies) {
  return {
    async GET() {
      try {
        const uid = participantUid(await dependencies.session());
        return json(await dependencies.snapshot(uid, uid ? dependencies.accountKey(uid) : null));
      } catch (error) {
        return failure(error);
      }
    },
    async POST(request: Request) {
      try {
        if (
          !galleryOriginAllowed(
            request.headers.get("origin"),
            request.url,
            request.headers.get("host"),
          )
        )
          throw new GalleryError("현재 사이트에서 다시 시도해 주세요.", 403);
        const uid = participantUid(await dependencies.session());
        if (!uid) throw new GalleryError("Google 계정으로 로그인한 뒤 참여할 수 있습니다.", 401);
        const raw = await readGalleryJson(request),
          key = dependencies.accountKey(uid);
        assertGalleryAccount(key, raw.accountKey);
        const notice = await dependencies.mutate(uid, validateGalleryInput(raw));
        return json({ ...(await dependencies.snapshot(uid, key)), notice });
      } catch (error) {
        return failure(error);
      }
    },
  };
}
