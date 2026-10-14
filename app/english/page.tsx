import { EnglishHub } from "@/components/english/hub";
import { PageFrame } from "@/components/site";
import { englishLibrary } from "@/lib/english/library";
import { pageMetadata } from "@/lib/metadata";
import { localizeMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/english", { ogImage: "/assets/english/bookshop.webp" }));
}
export default function EnglishPage() {
  return (
    <PageFrame>
      <EnglishHub episodes={englishLibrary()} />
    </PageFrame>
  );
}
