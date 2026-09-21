import { ActivityArticle } from "@/components/activity-article";
import { activityArticles } from "@/lib/activity-articles";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/activity/ulleung-high-session-3"));
}
export default function ThirdLecturePage() {
  return <ActivityArticle article={activityArticles["ulleung-high-session-3"]} />;
}
