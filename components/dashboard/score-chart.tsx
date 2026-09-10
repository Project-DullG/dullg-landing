import { useText } from "@/lib/i18n/use-text";
import styles from "./score-chart.module.css";
import { scoreSummary } from "@/lib/score-summary";
export function ScoreChart({
  scores,
}: {
  scores: {
    label: string;
    score: number | null;
  }[];
}) {
  const t = useText();
  const { average } = scoreSummary(scores.map((item) => item.score));
  return (
    <figure className={styles.chart}>
      <figcaption>
        <strong>{t("차시별 성적")}</strong>
        <span>{t(average === null ? "기록 없음" : `평균 ${average}점`)}</span>
      </figcaption>
      <p>{t("100점 만점 \u00B7 기록된 차시만 평균에 포함")}</p>
      <div className={styles.plot}>
        {t(
          scores.map((item) => (
            <div className={styles.column} key={item.label}>
              <span>{t(item.score === null ? "미입력" : `${item.score}점`)}</span>
              <div className={styles.track} aria-hidden="true">
                <div className={styles.bar} style={{ height: `${item.score ?? 0}%` }} />
              </div>
              <strong>{t(item.label)}</strong>
            </div>
          )),
        )}
      </div>
    </figure>
  );
}
