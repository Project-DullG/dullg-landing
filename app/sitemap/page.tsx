import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenText,
  Buildings,
  Camera,
  FileText,
  Flask,
  FolderOpen,
  MapTrifold,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { works } from "@/lib/works";

export const metadata: Metadata = {
  title: "전체 페이지 · 단서공방",
  description:
    "단서공방의 작품, 영어 수업팩, 공개 자료와 문의 페이지를 안내합니다.",
  alternates: { canonical: "/sitemap" },
};

const pageGroups = [
  {
    number: "01",
    title: "작품과 단서공방",
    description:
      "공개한 작품과 펀딩 기록, 단서공방의 제작 활동을 확인할 수 있습니다.",
    icon: Buildings,
    links: [
      { href: "/works", title: "작품과 펀딩", body: "공개한 작품을 한 편씩 살펴보고 펀딩 기록을 확인합니다." },
      ...works.map((work) => ({ href: `/works/${work.slug}`, title: work.title, body: `${work.status} · ${work.players} · ${work.duration} · ${work.platform}` })),
      { href: "/activity", title: "제작·활동 기록", body: "확인된 제작 결과와 준비 중인 활동을 구분해 기록합니다." },
      { href: "/activity/ulleung-high-living-lab", title: "울릉고 리빙랩 특강", body: "2026년 9월 5일 교육 활동과 공개 자료를 확인합니다." },
      { href: "/about", title: "단서공방 소개", body: "어떤 콘텐츠를 만들고 있는지 소개합니다." },
    ],
  },
  {
    number: "02",
    title: "교육 수업팩",
    description:
      "영어 미스터리 수업팩의 구성과 수업 흐름, 파일럿 준비 내용을 확인할 수 있습니다.",
    icon: BookOpenText,
    links: [
      { href: "/academy", title: "교육 수업팩 소개", body: "대상, 구성과 사용 장면을 한눈에 봅니다." },
      { href: "/academy/curriculum", title: "4차시 수업 흐름", body: "사건 읽기부터 팀 보고서까지 차시별 흐름을 확인합니다." },
      { href: "/academy/sample", title: "수업 자료 미리보기", body: "학생용 카드, 워크북과 교사용 진행안의 구성을 확인합니다." },
      { href: "/episode", title: "수업용 에피소드", body: "수업에 사용하는 첫 사건의 배경과 인물을 살펴봅니다." },
      { href: "/academy/pilot", title: "파일럿 운영 안내", body: "진행 절차, 확인 기준과 현재 준비 단계를 안내합니다." },
    ],
  },
  {
    number: "03",
    title: "자료와 문의",
    description:
      "지난 교육의 공개 자료를 찾거나 단서공방에 문의할 수 있습니다.",
    icon: FolderOpen,
    links: [
      { href: "/materials", title: "수강생 자료실", body: "지난 교육에서 사용한 공개 자료를 과정별로 모았습니다." },
      { href: "/contact", title: "문의하기", body: "작품과 교육 운영에 관한 질문을 남길 수 있습니다." },
      { href: "/privacy", title: "개인정보 처리 안내", body: "샘플 요청 과정에서 수집하는 정보와 처리 방식을 확인합니다." },
    ],
  },
];

const quickSteps = [
  { icon: Camera, text: "작품 살펴보기" },
  { icon: Flask, text: "교육 수업팩 확인" },
  { icon: FileText, text: "자료와 문의 찾기" },
];

export default function SitemapPage() {
  return (
    <PageFrame>
      <section className="sitemap-hero shell">
        <div>
          <Kicker>전체 안내</Kicker>
          <h1>
            필요한 내용을
            <br />
            <em>한 번에 찾아보세요.</em>
          </h1>
        </div>
        <div className="sitemap-hero-copy">
          <MapTrifold size={34} weight="duotone" aria-hidden="true" />
          <p>
            단서공방의 작품과 제작 기록, 영어 미스터리 수업팩과 지난 교육
            자료를 목적에 따라 정리했습니다.
          </p>
        </div>
      </section>

      <section className="sitemap-quick shell" aria-label="추천 탐색 순서">
        <strong>처음 방문하셨다면</strong>
        <ol>
          {quickSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.text}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={20} weight="duotone" aria-hidden="true" />
                {step.text}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="sitemap-directory shell" aria-labelledby="directory-title">
        <div className="sitemap-directory-head">
          <Kicker>페이지 목록</Kicker>
          <h2 id="directory-title">전체 페이지</h2>
          <p>각 페이지에서 확인할 수 있는 내용을 함께 적었습니다.</p>
        </div>

        <div className="sitemap-groups">
          {pageGroups.map((group) => {
            const Icon = group.icon;
            return (
              <article className="sitemap-group" key={group.number}>
                <header>
                  <span>{group.number}</span>
                  <Icon size={25} weight="duotone" aria-hidden="true" />
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </header>
                <div className="sitemap-link-list">
                  {group.links.map((link) => (
                    <Link href={link.href} key={link.href}>
                      <span>
                        <strong>{link.title}</strong>
                        <small>{link.body}</small>
                      </span>
                      <ArrowRight size={19} weight="bold" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sitemap-cta">
        <div className="shell">
          <div>
            <Kicker>교육 문의</Kicker>
            <h2>자료를 먼저 보고 판단하세요.</h2>
            <p>검토용 샘플을 확인한 뒤, 기관에 맞을 때만 파일럿을 논의하시면 됩니다.</p>
          </div>
          <Link className="button button-light" href="/contact">
            문의하기
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
