import type { Metadata } from "next";
import { loginPath } from "@/lib/auth-navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/firebase/auth";
import { localizedRedirect } from "@/lib/i18n/server";
import { NotebookCapture } from "./notebook-capture";

export const metadata: Metadata = {
  title: "추리노트 사진 등록",
  robots: { index: false, follow: false },
};

export default async function NotebookPage() {
  const session = await verifySession();
  if (!session) return localizedRedirect(loginPath("/dashboard/notebook"));
  const notebook = await getAdminDb().collection("studentNotebooks").doc(session.uid).get();
  const data = notebook.data();
  const pages = data?.userId === session.uid ? (data.pages ?? {}) : {};
  const savedPages = Object.entries(pages).flatMap(([key, value]) => {
    const page = Number(key);
    const record = value as {
      version?: unknown;
      byteLength?: unknown;
      updatedAt?: { toMillis?: () => number };
    };
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > 8 ||
      !record ||
      typeof record.version !== "string"
    )
      return [];
    return [
      {
        page,
        version: record.version,
        byteLength: typeof record.byteLength === "number" ? record.byteLength : 0,
        updatedAt: record.updatedAt?.toMillis?.() ?? 0,
      },
    ];
  });
  return <NotebookCapture savedPages={savedPages} />;
}
