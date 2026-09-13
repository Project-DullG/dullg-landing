import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { PageFrame } from "@/components/site";
import { TideFeature } from "@/components/tide-room/feature";
import styles from "@/components/tide-room/feature.module.css";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/games/tide-room"));
}
export default function Page() {
  const t = useText();
  return (
    <PageFrame>
      <div className="shell">
        <TideFeature play />
      </div>
      <section className={styles.details}>
        <h2>{t("돌아오지 않은 관측소 책임자")}</h2>
        <p>
          {t(
            "1894년 9월 14일. 클라라 베일은 아버지 엘리엇을 찾아 달라며 당신을 찾아왔다. 아버지는 하루 전까지 돌아오겠다고 편지를 보냈지만, 약속한 날이 지나도록 연락이 없다. 마지막 행적은 벨로우항 앞 작은 섬의 관측소에서 끊겼다.",
          )}
        </p>
        <h2>{t("조사하는 방법")}</h2>
        <ul>
          <li>
            {t(
              "현장의 물건을 눌러 문서와 흔적을 확인한다. 발견한 자료는 단서함에서 다시 읽을 수 있다.",
            )}
          </li>
          <li>
            {t("자료 두 개를 비교하거나 인물에게 보여 주며, 말과 기록이 다른 이유를 묻는다.")}
          </li>
          <li>
            {t(
              "도면과 시험 기록을 읽고 장치를 조작한다. 모르는 부분은 조사 기록과 단계별 힌트로 확인한다.",
            )}
          </li>
        </ul>
        <h2>{t("시작하기 전에")}</h2>
        <p>
          {t(
            "시간제한은 없다. 진행 상황은 이 브라우저에 자동으로 저장된다. 다른 기기로 옮길 때는 게임 설정에서 저장 파일을 내려받아 가져올 수 있다.",
          )}
        </p>
        <p>
          {t(
            "익사와 실종, 가족을 잃은 인물의 이야기가 나온다. 시작 버튼을 누르면 음악과 효과음이 켜진다. 소리, 글자 크기, 화면 효과는 설정에서 바꿀 수 있다.",
          )}
        </p>
      </section>
    </PageFrame>
  );
}
