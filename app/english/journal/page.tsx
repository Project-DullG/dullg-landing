import { PageFrame } from "@/components/site";
import { EnglishJournal } from "@/components/english/journal";
import { verifySession } from "@/lib/firebase/auth";
import { readEnglishProgress } from "@/lib/english/server";
import type { EnglishProgress } from "@/lib/english/types";
import { pageMetadata } from "@/lib/metadata";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return localizeMetadata({
    ...pageMetadata("/english/journal"),
    robots: { index: false, follow: true },
  });
}
export default async function EnglishJournalPage() {
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
      <EnglishJournal
        initialProgress={progress}
        serverNow={new Date().toISOString()}
        loadError={loadError}
      />
    </PageFrame>
  );
}
