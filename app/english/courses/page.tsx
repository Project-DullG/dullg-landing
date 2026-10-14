import { PageFrame } from "@/components/site";
import { EnglishCourses } from "@/components/english/courses";
import { verifySession } from "@/lib/firebase/auth";
import { readEnglishProgress } from "@/lib/english/server";
import { isEnglishLevel } from "@/lib/english/progress";
import type { EnglishProgress } from "@/lib/english/types";
import { pageMetadata } from "@/lib/metadata";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/english/courses"));
}
export default async function EnglishCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; level?: string }>;
}) {
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
  return (
    <PageFrame>
      <EnglishCourses
        initialProgress={progress}
        serverNow={new Date().toISOString()}
        loadError={loadError}
        courseId={requested.course}
        level={isEnglishLevel(requested.level) ? requested.level : undefined}
      />
    </PageFrame>
  );
}
