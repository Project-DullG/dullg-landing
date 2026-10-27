import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/firebase/auth";
import { createGalleryHandlers } from "@/lib/student-gallery/http";
import { createGalleryRepository } from "@/lib/student-gallery/repository";
import { galleryAccountKey } from "@/lib/student-gallery/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createGalleryHandlers({
  session: verifySession,
  accountKey: (uid) => galleryAccountKey(uid, process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  snapshot: (uid, key) => createGalleryRepository(getAdminDb()).snapshot(uid, key),
  mutate: (uid, input) => createGalleryRepository(getAdminDb()).mutate(uid, input),
});
export const GET = handlers.GET;
export const POST = handlers.POST;
