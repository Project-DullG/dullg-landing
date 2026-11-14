import Image from "next/image";
import { ArrowRight, ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import { CountUp } from "@/components/count-up";
import { useText } from "@/lib/i18n/use-text";
import { works } from "@/lib/works";
import { fundingProjects } from "@/lib/funding";
import { activityRecords, formatActivityDate, type ActivityRecord } from "@/lib/activities";
import { miniProjects } from "@/lib/mini-projects";
import { featuredGames } from "@/lib/featured-games";
import { didimterResidency, riseAward } from "@/lib/recognition";
import styles from "./team-story.module.css";

const toNumber = (text: string) => Number(text.replace(/[^\d]/g, ""));
const classes = activityRecords.filter((record) => record.type === "교육" && record.image);

/** Figures read straight from the site's own records. */
export function TeamProof() {
  const t = useText();
  const physical = works.filter((work) => work.platform === "실물 보드게임").length;
  const raised = fundingProjects.reduce((sum, project) => sum + toNumber(project.amount), 0);
  const figures = [
    {
      value: works.length,
      unit: "편",
      label: "직접 만든 머더미스터리",
      note: `실물 보드게임 ${physical}편 · 앱 수록 ${works.length - physical}편`,
    },
    {
      value: fundingProjects.length,
      unit: "회",
      label: "텀블벅 펀딩, 모두 목표 달성",
      note: `모인 금액 합계 ${raised.toLocaleString("ko-KR")}원`,
    },
    {
      value: classes.length,
      unit: "회",
      label: "게임·AI로 진행한 학교·지역 수업",
      note: "울릉고등학교 · 울릉군 · 온라인 강의",
    },
    {
      value: miniProjects.length + 1,
      unit: "개",
      label: "브라우저에서 하는 웹게임",
      note: `퍼즐·아케이드 ${miniProjects.length}종과 추리 게임 잔향 탐정`,
    },
  ];
  return (
    <section className={styles.proof} aria-labelledby="team-proof-title">
      <div className={styles.shell}>
        <div className={styles.proofHead}>
          <p className={styles.kicker}>{t("숫자로 보는 트위즈덤")}</p>
          <h2 id="team-proof-title">
            {t("직접 만들어 내놓고,")}
            <br />
            {t("교실에서 가르쳐 본 팀")}
          </h2>
        </div>
        <dl className={styles.figures} data-stagger>
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt>{t(figure.label)}</dt>
              <dd>
                <span className={styles.figure}>
                  <CountUp value={figure.value} />
                  <small>{t(figure.unit)}</small>
                </span>
                <span className={styles.note}>{t(figure.note)}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.badges}>
          <a href={riseAward.source} target="_blank" rel="noopener noreferrer">
            {t(riseAward.title)}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={didimterResidency.source} target="_blank" rel="noopener noreferrer">
            {t(didimterResidency.title)}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}

/** The three things the team makes, each with its own picture. */
export function TeamPillars() {
  const t = useText();
  const snake = works.find((work) => work.slug === "snake-carnival")!;
  const echo = featuredGames["last-screening"];
  const pillars = [
    {
      title: "머더미스터리 제작",
      body: "인물마다 다른 비밀을 쥐고, 대화로 범인을 찾는 실물 게임을 만듭니다. 기획부터 펀딩과 판매까지 팀이 직접 합니다.",
      href: "/works",
      link: "작품과 펀딩 기록",
      image: { src: snake.image, alt: snake.alt },
    },
    {
      title: "토론 수업",
      body: "추리 게임을 교실로 가져와, 학생이 단서를 근거로 말하고 쓰게 합니다. 학교와 지역에서 게임·AI 수업을 진행했습니다.",
      href: "/academy",
      link: "영어 미스터리 수업팩",
      image: {
        src: "/assets/going-home-scenes/classroom-play.webp",
        alt: "수업 중 단서 카드를 들고 근거를 말하는 학생과 손을 들어 반박하는 학생",
      },
    },
    {
      title: "웹게임과 영어 학습",
      body: "브라우저에서 바로 하는 추리·퍼즐 게임과, 이야기 속 단서를 풀며 배우는 영어 학습을 만듭니다.",
      href: "/mini-projects",
      link: "웹게임 둘러보기",
      image: echo.image,
    },
  ];
  return (
    <section className={styles.pillars} aria-labelledby="team-pillars-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("하는 일")}</p>
        <h2 id="team-pillars-title">{t("트위즈덤이 만드는 세 가지")}</h2>
        <ul className={styles.pillarList} data-stagger>
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <Link href={pillar.href}>
                <span className={styles.pillarImage}>
                  <Image
                    src={pillar.image.src}
                    alt={t(pillar.image.alt)}
                    width={720}
                    height={480}
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                </span>
                <h3>{t(pillar.title)}</h3>
                <p>{t(pillar.body)}</p>
                <span className={styles.pillarLink}>
                  {t(pillar.link)}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Every public record in date order, oldest first, grouped by year. */
export function TeamTimeline() {
  const t = useText();
  const latestFunding = fundingProjects[fundingProjects.length - 1];
  const records: ActivityRecord[] = [
    ...activityRecords,
    ...(activityRecords.some((record) => record.href === latestFunding.url)
      ? []
      : [
          {
            date: `${latestFunding.startsOn}/${latestFunding.endsOn}`,
            type: "펀딩" as const,
            title: latestFunding.title,
            body: "",
            href: latestFunding.url,
          },
        ]),
  ].sort((a, b) => a.date.split("/")[0].localeCompare(b.date.split("/")[0]));
  const years = [...new Set(records.map((record) => record.date.slice(0, 4)))];
  return (
    <section className={styles.timeline} aria-labelledby="team-timeline-title">
      <div className={styles.shell}>
        <div className={styles.timelineHead}>
          <p className={styles.kicker}>{t("걸어온 길")}</p>
          <h2 id="team-timeline-title">
            {t("보드게임 동아리에서 시작해")}
            <br />
            {t("펀딩과 교실까지")}
          </h2>
        </div>
        <div className={styles.years}>
          {years.map((year) => (
            <div className={styles.year} key={year}>
              <h3>{year}</h3>
              <ol data-stagger>
                {records
                  .filter((record) => record.date.startsWith(year))
                  .map((record) => {
                    const inner = (
                      <>
                        <time dateTime={record.date.split("/")[0]}>
                          {t(formatActivityDate(record))}
                        </time>
                        <span className={styles.type} data-type={record.type}>
                          {t(record.type)}
                        </span>
                        <strong>{t(record.title)}</strong>
                      </>
                    );
                    return (
                      <li key={record.href + record.date}>
                        {record.href.startsWith("/") ? (
                          <Link href={record.href}>{inner}</Link>
                        ) : (
                          <a href={record.href} target="_blank" rel="noopener noreferrer">
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const logos = [
  { name: "가로형 로고", file: "twisdom-horizontal", tone: "black" },
  { name: "가로형 로고 · 흰색", file: "twisdom-horizontal", tone: "white" },
  { name: "한글 로고", file: "twisdom-lockup-ko", tone: "black" },
  { name: "심볼", file: "twisdom-symbol", tone: "black" },
] as const;

const shortcuts = [
  {
    who: "학원·학교 담당자",
    links: [
      { label: "영어 미스터리 수업팩", href: "/academy" },
      { label: "수업 자료 미리보기", href: "/academy/sample" },
      { label: "4차시 수업 흐름", href: "/academy/curriculum" },
      { label: "무료 검토팩 요청", href: "/academy/pilot" },
    ],
  },
  {
    who: "행사·기관·언론 담당자",
    links: [
      { label: "제작·활동 기록과 사진", href: "/activity" },
      { label: "작품과 펀딩 기록", href: "/works" },
      { label: "수상 기록 (한동대학교 공식 뉴스)", href: riseAward.source },
      { label: "청년디딤터 입주기업 소개", href: didimterResidency.source },
    ],
  },
  {
    who: "함께 만들고 싶은 분",
    links: [
      { label: "작품·교육·협업 문의", href: "/contact" },
      { label: "웹게임", href: "/mini-projects" },
      { label: "수강생 자료실", href: "/materials" },
    ],
  },
];

/** Logo files and the pages each kind of visitor usually needs. */
export function PressKit() {
  const t = useText();
  return (
    <section className={styles.kit} id="press-kit" aria-labelledby="press-kit-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("소개 자료")}</p>
        <h2 id="press-kit-title">{t("트위즈덤을 소개할 때 필요한 자료")}</h2>
        <p className={styles.kitLead}>
          {t("로고 파일과, 담당자별로 자주 찾는 페이지를 모았습니다. SVG는 인쇄용, PNG는 문서·발표용입니다.")}
        </p>
        <ul className={styles.logos}>
          {logos.map((logo) => {
            const base = `/assets/brand/${logo.file}-${logo.tone}`;
            return (
              <li key={logo.name} className={logo.tone === "white" ? styles.dark : undefined}>
                <span className={styles.logoPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${base}.svg`} alt={t(`트위즈덤 ${logo.name}`)} />
                </span>
                <span className={styles.logoName}>{t(logo.name)}</span>
                <span className={styles.logoFiles}>
                  <a href={`${base}.svg`} download>
                    <DownloadSimple size={14} aria-hidden="true" />
                    SVG
                  </a>
                  <a href={`${base}.png`} download>
                    <DownloadSimple size={14} aria-hidden="true" />
                    PNG
                  </a>
                </span>
              </li>
            );
          })}
        </ul>
        <div className={styles.shortcuts}>
          {shortcuts.map((group) => (
            <div key={group.who}>
              <h3>{t(group.who)}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href}>
                        {t(link.label)}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    ) : (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {t(link.label)}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
