import { Header, Footer } from "@/components/site";
import { EnglishReview } from "@/components/english/review";
import { StudyNavigation } from "@/components/english/study-navigation";
import { verifySession } from "@/lib/firebase/auth";
import { accountKey, readEnglishProgress } from "@/lib/english/server";
import type { EnglishProgress } from "@/lib/english/types";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return localizeMetadata({
    title: "내 복습 수첩 · 영어 학습",
    alternates: { canonical: "/english/review" },
    robots: { index: false, follow: true },
  });
}
export default async function EnglishReviewPage() {
  const session = await verifySession();
  let progress: EnglishProgress | null = null,
    loadError = false;
  if (session) {
    try {
      progress = await readEnglishProgress(session.uid);
    } catch {
      loadError = true;
    }
  }
  return (
    <>
      <Header />
      <main id="main-content">
        <div style={{ background: "#f8f6f0", padding: "24px 24px 0" }}>
          <div style={{ maxWidth: 1120, marginInline: "auto" }}>
            <StudyNavigation />
          </div>
        </div>
        <EnglishReview
          initialProgress={progress}
          accountKey={session ? accountKey(session.uid) : null}
          serverNow={new Date().toISOString()}
          loadError={loadError}
        />
      </main>
      <Footer />
    </>
  );
}
