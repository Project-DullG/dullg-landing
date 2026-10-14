import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/site";
import { EnglishPlayer } from "@/components/english/player";
import { englishEpisodes, getEnglishEpisode } from "@/lib/english/catalog";
import { verifySession } from "@/lib/firebase/auth";
import { readEnglishProgress, accountKey as englishAccountKey } from "@/lib/english/server";
import { isEnglishLevel } from "@/lib/english/progress";
import type { EnglishProgress } from "@/lib/english/types";
import { localizeMetadata } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ episode: string }> }) {
  const episode = getEnglishEpisode((await params).episode);
  return localizeMetadata({
    title: episode ? `${episode.title} · 영어 학습` : "영어 이야기",
    description: episode?.synopsis,
    alternates: { canonical: `/english/play/${episode?.id || ""}` },
  });
}
export default async function EnglishEpisodePage({
  params,
  searchParams,
}: {
  params: Promise<{ episode: string }>;
  searchParams: Promise<{ level?: string; replay?: string }>;
}) {
  const episode = getEnglishEpisode((await params).episode);
  if (!episode || episode.format === "practice") notFound();
  const next = englishEpisodes[englishEpisodes.findIndex((item) => item.id === episode.id) + 1];
  const requested = await searchParams;
  const requestedLevel = requested.level;
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
        <EnglishPlayer
          key={episode.id}
          episode={episode}
          initialProgress={progress}
          startingLevel={isEnglishLevel(requestedLevel) ? requestedLevel : undefined}
          accountKey={session ? englishAccountKey(session.uid) : null}
          loadError={loadError}
          replay={requested.replay === "1"}
          nextEpisode={next ? { id: next.id, title: next.title } : undefined}
        />
      </main>
      <Footer />
    </>
  );
}
