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

export const metadata: Metadata = {
  title: "전체 페이지 · DullG",
  description:
    "DullG의 제품, 수업 자료, 파일럿 운영, 프로젝트 정보를 한곳에서 살펴보세요.",
  alternates: { canonical: "/sitemap" },
};

const pageGroups = [
  {
    number: "01",
    title: "수업팩 이해하기",
    description:
      "어떤 수업인지, 4차시 동안 학생이 무엇을 읽고 말하고 쓰는지 먼저 확인하세요.",
    icon: BookOpenText,
    links: [
      { href: "/academy", title: "제품 소개", body: "수업팩의 대상, 구성과 사용 장면을 한눈에 봅니다." },
      { href: "/academy/curriculum", title: "4차시 커리큘럼", body: "사건 읽기부터 팀 보고서까지 차시별 흐름을 확인합니다." },
      { href: "/episode", title: "에피소드 01", body: "첫 사건의 배경, 인물과 수업 결과물 예시를 살펴봅니다." },
    ],
  },
  {
    number: "02",
    title: "자료와 운영 검토하기",
    description:
      "도입을 결정하기 전에 실제 시제품과 파일럿 조건을 차분히 검토할 수 있습니다.",
    icon: FolderOpen,
    links: [
      { href: "/academy/sample", title: "수업 자료 미리보기", body: "학생용 카드, 워크북과 교사용 진행안의 구성을 확인합니다." },
      { href: "/academy/pilot", title: "파일럿 운영 안내", body: "진행 절차, 확인 기준과 현재 준비 단계를 안내합니다." },
      { href: "/contact", title: "문의하기", body: "기관 상황이나 운영 조건에 관한 질문을 남길 수 있습니다." },
    ],
  },
  {
    number: "03",
    title: "프로젝트 확인하기",
    description:
      "DullG가 왜 이 제품을 만들고 있으며, 현재 어디까지 왔는지 투명하게 공개합니다.",
    icon: Buildings,
    links: [
      { href: "/about", title: "DullG 소개", body: "프로젝트의 출발점, 원칙과 앞으로의 방향을 소개합니다." },
      { href: "/activity", title: "활동 기록", body: "확인된 시제품과 준비 중인 현장 기록을 구분해 보여드립니다." },
      { href: "/privacy", title: "개인정보 처리 안내", body: "샘플 요청 과정에서 수집하는 정보와 처리 방식을 확인합니다." },
    ],
  },
];

const quickSteps = [
  { icon: FileText, text: "제품과 커리큘럼 확인" },
  { icon: Camera, text: "시제품 자료 살펴보기" },
  { icon: Flask, text: "파일럿 조건 검토" },
];

export default function SitemapPage() {
  return (
    <PageFrame>
      <section className="sitemap-hero shell">
        <div>
          <Kicker>SITE GUIDE</Kicker>
          <h1>
            필요한 내용을
            <br />
            <em>한 번에 찾아보세요.</em>
          </h1>
        </div>
        <div className="sitemap-hero-copy">
          <MapTrifold size={34} weight="duotone" aria-hidden="true" />
          <p>
            DullG는 현재 영어학원용 4차시 수업팩의 첫 파일럿을 준비하고
            있습니다. 제품을 이해하고 도입 가능성을 검토하는 데 필요한
            페이지를 순서대로 모았습니다.
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
          <Kicker>ALL PAGES</Kicker>
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
            <Kicker>NEXT STEP</Kicker>
            <h2>자료를 먼저 보고 판단하세요.</h2>
            <p>검토용 샘플을 확인한 뒤, 기관에 맞을 때만 파일럿을 논의하시면 됩니다.</p>
          </div>
          <Link className="button button-light" href="/#apply">
            무료 샘플 받아보기
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
