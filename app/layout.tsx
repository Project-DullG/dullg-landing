import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { BRAND } from "@/lib/site-config";
import "./fonts.css";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { localizeMetadata } from "@/lib/i18n/server";
import { MotionRoot } from "@/components/motion-root";


const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "트위즈덤 | 게임과 이야기로 배우는 곳", template: `%s | ${BRAND.name}` },
  description:
    BRAND.description,
  keywords: [
    BRAND.name,
    BRAND.englishName,
    "영어 학습 게임",
    "영어 방탈출",
    "영어 읽기 듣기 쓰기 말하기",
    "머더미스터리",
    "추리 콘텐츠",
    "영어 미스터리 수업팩",
    "학원 관리",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: BRAND.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "트위즈덤 — 게임과 이야기로 배우는 곳",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/opengraph-image", alt: "트위즈덤 — 게임과 이야기로 배우는 곳" }],
  },
};

export async function generateMetadata() {
  return localizeMetadata(baseMetadata);
}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "en" ? "Skip to content" : "본문으로 바로가기"}
        </a>
        <NextIntlClientProvider locale={locale} messages={{}}>
          {children}
        </NextIntlClientProvider>
        <MotionRoot />
      </body>
    </html>
  );
}
