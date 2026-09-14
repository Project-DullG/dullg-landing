import { useLocale } from "next-intl";
import { PageFrame } from "@/components/site";
import { DischargeFeature } from "@/components/discharge-feature";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/tide-room/feature.module.css";

export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/games/discharge-day", { ogImage: "/assets/discharge-day/art/ward.webp" }),
  );
}
export default function DischargePage() {
  const en = useLocale() === "en";
  return (
    <PageFrame>
      <div className="shell">
        <h1 style={{ fontSize: 28, paddingTop: 32 }}>{en ? "Discharge Day" : "퇴원일"}</h1>
        <DischargeFeature play />
      </div>
      <section className={styles.details}>
        <h2>{en ? "How to play" : "조사와 장치 조작"}</h2>
        <p>
          {en
            ? "On a phone, choose objects from the list below the scene. On a large screen, you can also select markers in the image. Read clues in the journal and use them to operate seven devices. There is no time limit."
            : "모바일에서는 장면 아래 목록에서 조사할 대상을 고릅니다. 큰 화면에서는 그림 속 표시도 누를 수 있습니다. 기록장에서 단서를 다시 읽고 일곱 장치의 조작 방법을 찾으세요. 시간제한은 없습니다."}
        </p>
        <h2>{en ? "Saving your progress" : "진행 저장"}</h2>
        <p>
          {en
            ? "Progress is saved in this browser when storage is available. Export a save file from Settings to keep a backup or continue on another device."
            : "저장이 허용된 브라우저에서는 진행 상황이 자동으로 보관됩니다. 설정에서 저장 파일을 내려받으면 다른 기기로 옮기거나 별도로 보관할 수 있습니다."}
        </p>
        <h2>{en ? "Content and sound" : "내용과 소리 안내"}</h2>
        <p>
          {en
            ? "Includes a medical facility, prolonged unconsciousness, loss after a disaster and a death in the family. Medical procedures and equipment are fictional. Sound begins after you start; sound and motion can be changed in Settings. The game text is in Korean."
            : "의료시설, 장기 의식 소실, 재난 이후의 상실과 가족의 사망을 다룹니다. 의료·설비 조작은 허구입니다. 시작한 뒤 소리가 켜지며, 설정에서 소리와 화면 움직임을 조절할 수 있습니다."}
        </p>
      </section>
    </PageFrame>
  );
}
