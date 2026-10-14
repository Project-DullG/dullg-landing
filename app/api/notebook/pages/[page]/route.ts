import { randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { SITE_URL } from "@/lib/site";
import {
  NotebookError,
  deleteNotebookPage,
  notebookMutationOriginAllowed,
  parseNotebookPage,
  prepareNotebookJpeg,
  readNotebookPage,
  readNotebookUploadBody,
  saveNotebookPage,
  type NotebookDependencies,
  type NotebookTransaction,
} from "@/lib/notebook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ page: string }> };
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function dependencies(uid: string): NotebookDependencies {
  const db = getAdminDb();
  const notebookRef = (userId: string) => db.collection("studentNotebooks").doc(userId);
  const pageRef = (userId: string, page: number) =>
    notebookRef(userId).collection("pages").doc(String(page));
  const milliseconds = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : value);
  return {
    authenticatedUid: uid,
    now: Date.now,
    newVersion: randomUUID,
    prepareImage: prepareNotebookJpeg,
    async transaction(work) {
      return db.runTransaction(async (transaction) => {
        const adapter: NotebookTransaction = {
          async getNotebook(userId) {
            const snapshot = await transaction.get(notebookRef(userId));
            if (!snapshot.exists) return null;
            const data = snapshot.data() ?? {};
            const pages = Object.fromEntries(
              Object.entries(data.pages ?? {}).map(([page, metadata]) => {
                const entry = metadata as Record<string, unknown>;
                return [page, { ...entry, updatedAt: milliseconds(entry.updatedAt) }];
              }),
            );
            return { ...data, pages };
          },
          async getPage(userId, page) {
            const snapshot = await transaction.get(pageRef(userId, page));
            if (!snapshot.exists) return null;
            const data = snapshot.data() ?? {};
            return { ...data, updatedAt: milliseconds(data.updatedAt) };
          },
          savePage(userId, page, record) {
            transaction.set(pageRef(userId, page), {
              ...record,
              image: Buffer.from(record.image),
              updatedAt: Timestamp.fromMillis(record.updatedAt),
            });
          },
          savePageMetadata(userId, metadata) {
            transaction.set(
              notebookRef(userId),
              {
                userId,
                pages: {
                  [String(metadata.page)]: {
                    version: metadata.version,
                    byteLength: metadata.byteLength,
                    updatedAt: Timestamp.fromMillis(metadata.updatedAt),
                  },
                },
                updatedAt: Timestamp.fromMillis(metadata.updatedAt),
              },
              { merge: true },
            );
          },
          deletePage(userId, page) {
            transaction.delete(pageRef(userId, page));
          },
          deletePageMetadata(userId, page, updatedAt) {
            transaction.update(notebookRef(userId), {
              [`pages.${page}`]: FieldValue.delete(),
              updatedAt: Timestamp.fromMillis(updatedAt),
            });
          },
        };
        return work(adapter);
      });
    },
  };
}
async function authenticatedUid() {
  const session = await verifySession();
  if (!session) throw new NotebookError(401, "로그인 후 이용할 수 있습니다.");
  return session.uid;
}
function protectMutation(request: Request) {
  if (!notebookMutationOriginAllowed(request.headers.get("origin"), request.url, SITE_URL))
    throw new NotebookError(403, "현재 사이트에서 다시 시도해 주세요.");
}
function failure(error: unknown) {
  if (error instanceof NotebookError)
    return Response.json(
      { error: error.message },
      { status: error.status, headers: privateHeaders },
    );
  return Response.json(
    { error: "사진을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
    { status: 500, headers: privateHeaders },
  );
}

export async function PUT(request: Request, context: Context) {
  try {
    protectMutation(request);
    const uid = await authenticatedUid();
    const page = parseNotebookPage((await context.params).page);
    const bytes = await readNotebookUploadBody(request);
    const metadata = await saveNotebookPage(
      uid,
      page,
      bytes,
      request.headers.get("content-type"),
      dependencies(uid),
    );
    return Response.json(metadata, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}
export async function GET(request: Request, context: Context) {
  try {
    const uid = await authenticatedUid();
    const page = parseNotebookPage((await context.params).page);
    const image = await readNotebookPage(
      uid,
      page,
      dependencies(uid),
      new URL(request.url).searchParams.get("v"),
    );
    if (!image)
      return Response.json(
        { error: "저장된 사진을 찾을 수 없습니다." },
        { status: 404, headers: privateHeaders },
      );
    return new Response(Buffer.from(image.image), {
      headers: {
        ...privateHeaders,
        "Content-Type": "image/jpeg",
        "Content-Length": String(image.metadata.byteLength),
        "Content-Disposition": `inline; filename="notebook-page-${page}.jpg"`,
      },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    protectMutation(request);
    const uid = await authenticatedUid();
    const result = await deleteNotebookPage(uid, (await context.params).page, dependencies(uid));
    return Response.json(result, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}
