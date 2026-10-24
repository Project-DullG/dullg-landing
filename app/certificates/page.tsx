import { getLocale } from "next-intl/server";
import { PageFrame } from "@/components/site";
import { getCertificateAccess } from "@/lib/certificates/access-server";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { CertificateClient } from "./certificate-client";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const metadata = await localizeMetadata(pageMetadata("/certificates"));
  return { ...metadata, robots: { index: false, follow: false } };
}

export default async function CertificatesPage() {
  const [authorized, locale] = await Promise.all([getCertificateAccess(), getLocale()]);
  return (
    <PageFrame>
      <CertificateClient authorized={authorized} locale={locale === "en" ? "en" : "ko"} />
    </PageFrame>
  );
}
