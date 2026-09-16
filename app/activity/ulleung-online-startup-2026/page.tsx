import { ActivityArticle } from "@/components/activity-article";
import { activityArticles } from "@/lib/activity-articles";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/activity/ulleung-online-startup-2026"));
}
export default function OnlineLecturePage() {
  return <ActivityArticle article={activityArticles["ulleung-online-startup-2026"]} />;
}
