import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { localizeMetadata } from "@/lib/i18n/server";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { PageFrame } from "@/components/site";
import { EnglishCommunity } from "@/components/english/community";

const metadata: Metadata = {
  title: "영어 학습 커뮤니티", description: "이야기로 배우는 영어, 오늘 배운 표현과 질문을 함께 나누는 단서공방 학습 커뮤니티.",
  alternates: { canonical: "/english/community" },
};

export async function generateMetadata() { return localizeMetadata(metadata); }

export default async function EnglishCommunityPage() {
  const locale = await getLocale();
  return localizeEnglishTree(<PageFrame><div style={{ background: "#f4f2ea", padding: "70px 24px 42px", textAlign: "center", color: "#253a32" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, letterSpacing: 3, color: "#75876c" }}>ENGLISH JOURNEY / COMMUNITY</span><h1 style={{ fontFamily: "var(--font-noto-serif), serif", fontSize: "clamp(32px, 5vw, 50px)", fontWeight: 400, letterSpacing: -2, margin: "22px 0 15px" }}>함께 여는 다음 페이지</h1><p style={{ fontSize: 13, color: "#747d6d", lineHeight: 1.9 }}>한 번의 질문, 한 줄의 기록이<br />우리의 다음 이야기를 만듭니다.</p></div><EnglishCommunity /></PageFrame>, locale);
}
