import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import { activityRecords, formatActivityDate } from "@/lib/activities";
import styles from "./academy-appeal.module.css";
import { ClassroomPlay } from "./going-home-scenes";

const reasons = [
  {
    title: "정보가 네 사람에게 나뉘어 있습니다",
    body: "누구도 혼자서는 사건을 다 알 수 없습니다. 말수가 적은 학생에게도 자기 카드를 읽고 말할 차례가 돌아옵니다.",
  },
  {
    title: "영어는 시험지가 아니라 단서입니다",
    body: "해석하고 끝나는 문장이 없습니다. 카드 한 줄에 따라 의심이 커지기도 하고 풀리기도 해서, 학생은 문장을 끝까지 읽습니다.",
  },
  {
    title: "판단에는 근거가 따라옵니다",
    body: "‘그냥 그런 것 같아’로는 친구를 설득할 수 없습니다. 어느 카드의 어느 문장인지 짚어 말하고, 마지막에는 글로 적습니다.",
  },
];

/** Why a mystery game: three facts about how the lesson is built, not promised outcomes. */
export function AcademyReasons() {
  const t = useText();
  return (
    <section className={styles.reasons} aria-labelledby="academy-reasons-title">
      <div className={styles.shell}>
        <div className={styles.head}>
          <p className={styles.kicker}>{t("왜 추리 게임으로 가르치나요")}</p>
          <h2 id="academy-reasons-title">{t("모두가 말해야 풀리는 수업")}</h2>
        </div>
        <ol className={styles.reasonList} data-stagger>
          {reasons.map((reason, index) => (
            <li key={reason.title}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{t(reason.title)}</h3>
              <p>{t(reason.body)}</p>
            </li>
          ))}
        </ol>
        <ClassroomPlay />
      </div>
    </section>
  );
}

/** One of the four sheets a student fills in, lesson 1 to 4. Example content only. */
export function LessonSheet({ lesson, className = "" }: { lesson: 1 | 2 | 3 | 4; className?: string }) {
  const t = useText();
  const body = [
    <>
      <header>
        <span>{t("1차시 · 단서 기록지")}</span>
        <b>{t("읽기")}</b>
      </header>
      <dl className={styles.rows} lang="en">
        <div>
          <dt>Who</dt>
          <dd>Sejun</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>
            <span className={styles.mark}>this Saturday</span>
          </dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>board game café</dd>
        </div>
      </dl>
    </>,
    <>
      <header>
        <span>{t("2차시 · 팀 추론 보드")}</span>
        <b>{t("연결")}</b>
      </header>
      <div className={styles.board}>
        <span>{t("생일 모임 · 토요일")}</span>
        <i aria-hidden="true" />
        <span>{t("토요일 오후 보충반")}</span>
      </div>
      <p className={styles.note}>
        <span className={styles.mark}>{t("겹치는 날")}</span>
        {t(" · 쪽지는 지원이 영어책 사이에")}
      </p>
    </>,
    <>
      <header>
        <span>{t("3차시 · 주장과 근거")}</span>
        <b>{t("토론")}</b>
      </header>
      <dl className={styles.rows}>
        <div>
          <dt>{t("주장")}</dt>
          <dd>
            <i className={styles.blank} />
            {t("이(가) 열쇠를 가져갔다")}
          </dd>
        </div>
        <div>
          <dt>{t("근거")}</dt>
          <dd>{t("카드 2 · ‘this Saturday’")}</dd>
        </div>
        <div>
          <dt>{t("반론")}</dt>
          <dd>
            <span className={styles.mark}>{t("넷 다 재시험 대상")}</span>
          </dd>
        </div>
      </dl>
    </>,
    <>
      <header>
        <span>{t("4차시 · 개인 영작")}</span>
        <b>{t("쓰기")}</b>
      </header>
      <p className={styles.essay} lang="en">
        I think <i className={styles.blank} /> took the keys. First, card 2 says{" "}
        <span className={styles.mark}>“this Saturday”</span>. Second,{" "}
        <i className={styles.blank} />.
      </p>
    </>,
  ][lesson - 1];
  return (
    <div className={`${styles.sheet} ${lesson === 4 ? styles.final : ""} ${className}`}>{body}</div>
  );
}

/** What a student keeps: one sheet per lesson, the last one in English. */
export function StudentArtifacts() {
  const t = useText();
  return (
    <section className={styles.artifacts} aria-labelledby="academy-artifacts-title">
      <div className={styles.shell}>
        <div className={styles.head}>
          <p className={styles.kicker}>{t("학생에게 남는 것")}</p>
          <h2 id="academy-artifacts-title">
            {t("네 번의 수업이 끝나면")}
            <br />
            {t("학생 손에 기록 네 장이 남습니다")}
          </h2>
          <p className={styles.lead}>
            {t(
              "토론이 말로만 끝나지 않도록 차시마다 한 장씩 적습니다. 마지막 장에는 자기 판단과 근거를 영어 문장으로 씁니다.",
            )}
          </p>
        </div>

        <ol className={styles.sheets}>
          {([1, 2, 3, 4] as const).map((lesson) => (
            <li key={lesson}>
              <LessonSheet lesson={lesson} />
            </li>
          ))}
        </ol>
        <p className={styles.caption}>
          {t("예시로 채운 기록지입니다. 수업에서는 학생이 직접 적으며, 사건의 정답은 담지 않았습니다.")}
        </p>
      </div>
    </section>
  );
}

/** Classes the team has already run with games and AI, read from the activity log. */
export function ClassroomRecord() {
  const t = useText();
  const classes = activityRecords.filter((record) => record.type === "교육" && record.image);
  return (
    <section className={styles.record} aria-labelledby="academy-record-title">
      <div className={styles.shell}>
        <div className={styles.recordHead}>
          <div>
            <p className={styles.kicker}>{t("교실에서 먼저")}</p>
            <h2 id="academy-record-title">
              {t(`게임과 AI로 진행한 학교·지역 수업 ${classes.length}회`)}
            </h2>
          </div>
          <p className={styles.lead}>
            {t(
              "앞서 진행한 수업들을 바탕으로 영어 미스터리 수업팩 파일럿을 준비하고 있습니다.",
            )}
          </p>
        </div>
        <ul className={styles.classes} data-stagger>
          {classes.map((record) => (
            <li key={record.href}>
              <Link href={record.href}>
                <span className={styles.photo}>
                  <Image
                    src={record.image!.src}
                    alt={t(record.image!.alt)}
                    width={480}
                    height={320}
                    sizes="(max-width: 760px) 50vw, 25vw"
                  />
                </span>
                <time dateTime={record.date.split("/")[0]}>{t(formatActivityDate(record))}</time>
                <strong>
                  {t(record.title)}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
