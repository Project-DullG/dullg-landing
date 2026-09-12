import { ActivityArticle } from "@/components/activity-article";
import { activityArticles } from "@/lib/activity-articles";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";

const article = activityArticles["ulsan-youth-arts-2026"];

export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/activity/ulsan-youth-arts-2026", {
      ogImage: article.sections.find((section) => section.photo)?.photo?.src,
    }),
  );
}

export default function ActivityDetailPage() {
  return <ActivityArticle article={article} />;
}
