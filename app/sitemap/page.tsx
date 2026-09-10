import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
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
import Link from "@/components/i18n/link";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { pageMetadata } from "@/lib/metadata";
import { getWorkStatus, works } from "@/lib/works";
import { publicRoutes, type RouteGroup } from "@/lib/routes";
import { miniProjects } from "@/lib/mini-projects";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/sitemap"));
}
export const revalidate = 3600;
const byGroup = (group: RouteGroup) =>
  publicRoutes
    .filter((r) => r.group === group && r.path !== "/" && r.path !== "/sitemap")
    .map((r) => ({ href: r.path, title: r.title, body: r.description }));
const quickSteps = [
  { icon: Camera, text: "작품 살펴보기" },
  { icon: Flask, text: "교육 수업팩 확인" },
  { icon: FileText, text: "자료와 문의 찾기" },
];
export default function SitemapPage() {
  const t = useText();
  const pageGroups = [
    {
      number: "01",
      title: "작품과 단서공방",
      description: "공개한 작품과 펀딩 기록, 단서공방의 제작 활동을 확인할 수 있습니다.",
      icon: Buildings,
      links: [
        ...byGroup("studio").filter((item) => item.href === "/works"),
        ...works.map((work) => ({
          href: `/works/${work.slug}`,
          title: work.title,
          body: `${getWorkStatus(work)} · ${work.players} · ${work.duration} · ${work.platform}`,
        })),
        ...byGroup("studio").filter((item) => item.href !== "/works"),
        ...miniProjects.map((project) => ({
          href: `/mini-projects/${project.slug}`,
          title: project.title,
          body: project.description,
        })),
      ],
    },
    {
      number: "02",
      title: "교육 수업팩",
      description:
        "영어 미스터리 수업팩의 구성과 수업 흐름, 파일럿 준비 내용을 확인할 수 있습니다.",
      icon: BookOpenText,
      links: byGroup("education"),
    },
    {
      number: "03",
      title: "자료와 문의",
      description: "지난 교육의 공개 자료를 찾거나 단서공방에 문의할 수 있습니다.",
      icon: FolderOpen,
      links: byGroup("resources"),
    },
  ];
  return (
    <PageFrame>
      <section className="sitemap-hero shell">
        {/* keeps a grid-item box; see SectionHead */}
        <SectionHead
          as="h1"
          className="sitemap-hero-head"
          kicker="전체 안내"
          title={t(
            <>
              {t("필요한 내용을")}
              <br />
              <em>{t("한 번에 찾아보세요.")}</em>
            </>,
          )}
        />
        <div className="sitemap-hero-copy">
          <MapTrifold size={34} weight="duotone" aria-hidden="true" />
          <p>
            {t(
              "단서공방의 작품과 제작 기록, 영어 미스터리 수업팩과 지난 교육 자료를 목적에 따라 정리했습니다.",
            )}
          </p>
        </div>
      </section>

      <section className="sitemap-quick shell" aria-label={t("추천 탐색 순서")}>
        <strong>{t("처음 방문하셨다면")}</strong>
        <ol>
          {t(
            quickSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.text}>
                  <span>{t(String(index + 1).padStart(2, "0"))}</span>
                  <Icon size={20} weight="duotone" aria-hidden="true" />
                  {t(step.text)}
                </li>
              );
            }),
          )}
        </ol>
      </section>

      <section className="sitemap-directory shell" aria-labelledby="directory-title">
        <SectionHead
          className="sitemap-directory-head"
          id="directory-title"
          kicker="페이지 목록"
          title={t("전체 페이지")}
          lead="각 페이지에서 확인할 수 있는 내용을 함께 적었습니다."
        />

        <div className="sitemap-groups">
          {t(
            pageGroups.map((group) => {
              const Icon = group.icon;
              return (
                <article className="sitemap-group" key={group.number}>
                  <header>
                    <span>{t(group.number)}</span>
                    <Icon size={25} weight="duotone" aria-hidden="true" />
                    <div>
                      <h3>{t(group.title)}</h3>
                      <p>{t(group.description)}</p>
                    </div>
                  </header>
                  <div className="sitemap-link-list">
                    {t(
                      group.links.map((link) => (
                        <Link href={link.href} key={link.href}>
                          <span>
                            <strong>{t(link.title)}</strong>
                            <small>{t(link.body)}</small>
                          </span>
                          <ArrowRight size={19} weight="bold" aria-hidden="true" />
                        </Link>
                      )),
                    )}
                  </div>
                </article>
              );
            }),
          )}
        </div>
      </section>

      <section className="sitemap-cta">
        <div className="shell">
          <div>
            <Kicker>{t("교육 문의")}</Kicker>
            <h2>{t("자료를 먼저 보고 판단하세요.")}</h2>
            <p>{t("검토용 샘플을 확인한 뒤, 기관에 맞을 때만 파일럿을 논의하시면 됩니다.")}</p>
          </div>
          <Link className="button button-light" href="/academy/pilot">
            {t("검토팩 요청")}
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
