import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/site";
import { PracticePlayer } from "@/components/english/practice-player";
import { englishPracticePacks } from "@/lib/english/practice";
import { verifySession } from "@/lib/firebase/auth";
import { readEnglishProgress, accountKey as englishAccountKey } from "@/lib/english/server";
import { isEnglishLevel } from "@/lib/english/progress";
import { getEnglishCourse } from "@/lib/english/courses";
import type { EnglishProgress } from "@/lib/english/types";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ pack: string }> }) {
  const id = (await params).pack;
  const pack = englishPracticePacks.find((item) => item.id === id);
  return localizeMetadata({
    title: pack ? `${pack.title} · 영어 집중 연습` : "영어 집중 연습",
    description: pack?.synopsis,
    alternates: { canonical: `/english/practice/${pack?.id || ""}` },
  });
}
export default async function EnglishPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ pack: string }>;
  searchParams: Promise<{ level?: string; replay?: string; course?: string }>;
}) {
  const id = (await params).pack;
  const pack = englishPracticePacks.find((item) => item.id === id);
  if (!pack) notFound();
  const requested = await searchParams;
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
  const course = getEnglishCourse(requested.course || progress?.episodes[pack.id]?.courseId || "");
  return (
    <>
      <Header />
      <main id="main-content">
        <PracticePlayer
          key={pack.id}
          pack={pack}
          initialProgress={progress}
          accountKey={session ? englishAccountKey(session.uid) : null}
          loadError={loadError}
          startingLevel={isEnglishLevel(requested.level) ? requested.level : undefined}
          replay={requested.replay === "1"}
          courseId={
            course?.units.some((unit) => unit.contentId === pack.id) ? course.id : undefined
          }
        />
      </main>
      <Footer />
    </>
  );
}
