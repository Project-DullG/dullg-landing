import { useLocale } from "next-intl";
import { PageFrame } from "@/components/site";
import { GameFeature } from "@/components/game-feature";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/game-feature.module.css";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/games/last-screening", { ogImage: "/assets/last-screening/cover.webp" }));
}
export default function LastScreeningPage() {
  const en = useLocale() === "en";
  return <PageFrame>
    <div className="shell">
      <h1 style={{ fontSize: 28, paddingTop: 32 }}>{en ? "Echo Detective" : "잔향 탐정"}</h1>
      <GameFeature id="last-screening" play />
    </div>
    <section className={styles.details}>
      <h2>{en ? "Investigation and deduction" : "조사와 추리"}</h2>
      <p>{en ? "Talk to people, examine objects and read records. Present a judgment with supporting evidence, or return to the scene to investigate further. Completed deductions are kept when you return." : "인물과 대화하고 물건과 기록을 살펴보세요. 추리 화면에서 판단과 근거를 제시하거나, 현장으로 돌아가 추가로 조사할 수 있습니다. 이미 입증한 논점은 다시 풀지 않습니다."}</p>
      <h2>{en ? "Controls and progress" : "조작과 저장"}</h2>
      <p>{en ? "Tap once to reveal the current line and again to continue. Objects can also be selected by name. Progress is stored in this browser, with six manual save slots and file export and import. Adjust text size, sound and motion in Settings." : "대사 도중 한 번 누르면 문장 전체가 나오고, 다시 누르면 다음 대사로 넘어갑니다. 물건 이름을 눌러 조사할 수도 있습니다. 브라우저 자동 저장, 수동 슬롯 6개와 저장 파일 내보내기·가져오기를 지원합니다. 설정에서 글자 크기, 소리와 움직임을 조절하세요."}</p>
      <h2>{en ? "Content notice" : "내용 안내"}</h2>
      <p>{en ? "This update expands The Last Screening into Echo Detective. Earlier 0.10.0 progress is not automatically loaded; existing browser saves are not deleted." : "이번 업데이트부터 마지막 상영을 포함한 잔향 탐정 시리즈로 제공합니다. 이전 0.10.0의 진행 기록은 자동으로 불러오지 않으며, 브라우저에 남은 기존 저장 데이터는 삭제하지 않습니다."}</p>
      <p>{en ? "Contains depictions of crime and death. Game text is in Korean. Version 0.79.0. A desktop Chromium browser is recommended." : "범죄와 사망에 관한 묘사가 포함되어 있습니다. 한국어로 제공하며, 현재 버전은 0.79.0입니다. PC의 Chromium 계열 브라우저를 권장합니다."}</p>
    </section>
  </PageFrame>;
}
