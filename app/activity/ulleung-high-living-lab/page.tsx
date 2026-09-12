import { ActivityArticle } from "@/components/activity-article";
import { activityArticles } from "@/lib/activity-articles";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";

const article = activityArticles["ulleung-high-living-lab"];

export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/activity/ulleung-high-living-lab", {
      ogImage: article.sections[0].photo?.src,
    }),
  );
}

export default function ActivityDetailPage() {
  return <ActivityArticle article={article} />;
}
