import { PageFrame } from "@/components/site";
import { EnglishLibraryBrowser } from "@/components/english/library-browser";
import { englishDiscoveryLibrary } from "@/lib/english/discovery-library";
import { libraryHref, parseLibrarySearch } from "@/lib/english/discovery";
import { verifySession } from "@/lib/firebase/auth";
import { readEnglishProgress } from "@/lib/english/server";
import type { EnglishProgress } from "@/lib/english/types";
import { pageMetadata } from "@/lib/metadata";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/english/library"));
}
export default async function EnglishContentLibrary({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearch = await searchParams;
  const initialSearch = parseLibrarySearch(rawSearch);
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
      <EnglishLibraryBrowser
        key={
          libraryHref(initialSearch.filters, {
            focus: initialSearch.focus,
            level: initialSearch.level,
          }) +
          "|" +
          (rawSearch.view === "all" ? "all" : "")
        }
        initialView={rawSearch.view === "all" ? "all" : undefined}
        items={englishDiscoveryLibrary()}
        initialSearch={initialSearch}
        initialProgress={progress}
        loadError={loadError}
        serverNow={new Date().toISOString()}
      />
    </PageFrame>
  );
}
