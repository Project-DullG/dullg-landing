import { getLocale } from "next-intl/server";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PageFrame } from "@/components/site";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/english/hub.module.css";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/english/about"));
}

export default async function EnglishLearningAboutPage() {
  const locale = await getLocale();
  return localizeEnglishTree(
    <PageFrame>
      <div className={styles.hub}>
        <article className={styles.about}>
          <p className={styles.eyebrow}>BEHIND THE ENGLISH JOURNAL</p>
          <h1>
            이야기에 목적을,
            <br />
            연습에 다음 기회를.
          </h1>
          <p>
            문을 열기 위해 안내를 읽고, 분실물의 주인을 찾기 위해 증언을 듣고, 편지를 전하기 위해
            답을 씁니다. 영어로 전달해야 할 정보와 그 답이 필요한 이유를 먼저 정하고 이야기를
            만듭니다.
          </p>
          <h2>문제 풀이가 이야기의 다음 장면으로</h2>
          <p>
            각 장면은 영어를 이해하거나 표현해서 달성할 수 있는 목표를 갖습니다. 읽기·듣기로 얻은
            정보를 쓰기·말하기에 사용하고, 그 결과가 다음 장면으로 이어지도록 구성했습니다. 과제
            중심 언어 교육의 의미 있는 결과라는 관점을 참고한 설계입니다.{" "}
            <a
              href="https://doi.org/10.1111/j.1473-4192.2009.00231.x"
              target="_blank"
              rel="noreferrer"
            >
              Ellis, 2009
            </a>
          </p>
          <h2>이해하고, 표현하고, 다시 써보기</h2>
          <p>
            Nation의 네 영역은 의미 중심 입력, 의미 중심 출력, 언어 형식 학습, 유창성 연습입니다.
            읽기·듣기·쓰기·말하기 네 기능을 단순히 나눈 이론과는 구별됩니다. 여기서는 문맥 속 이해와
            표현, 예문을 통한 확인, 익숙한 표현의 재사용을 함께 배치하는 지침으로 삼았습니다.{" "}
            <a
              href="https://openaccess.wgtn.ac.nz/articles/journal_contribution/The_four_strands/12552167"
              target="_blank"
              rel="noreferrer"
            >
              Nation, 2007
            </a>
          </p>
          <h2>배운 표현은 시간이 지난 뒤 다시</h2>
          <p>
            완료한 장면의 표현을 다음 날부터 복습합니다. 한국어 상황을 보고 영어를 직접 떠올린 뒤
            예문과 비교하며, 복습 결과에 따라 다음 간격을 조정합니다. 인출과 분산 학습 연구를
            참고했습니다. 현재의 복습 간격은 이 서비스의 운영 선택이며 연구가 정한 보편적인 최적
            간격은 아닙니다.{" "}
            <a
              href="https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Karpicke &amp; Roediger, 2008
            </a>
            ,{" "}
            <a
              href="https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Cepeda 외, 2008
            </a>
          </p>
          <h2>내 속도와 난이도로</h2>
          <p>
            입문·기본·도전은 같은 이야기의 문장 길이, 보기와 도움을 다르게 제공합니다. 언제든
            난이도를 바꿀 수 있고 쉬어도 완료 기록이 유지됩니다. 경험치와 연속 학습은 연습을
            돌아보는 표시로 사용합니다. 게임화 연구는 효과가 활동과 맥락에 따라 달라진다는 점을 함께
            보여줍니다.{" "}
            <a
              href="https://link.springer.com/article/10.1007/s10648-019-09498-w"
              target="_blank"
              rel="noreferrer"
            >
              Sailer &amp; Homner, 2020
            </a>
          </p>
          <div className={styles.aboutNote}>
            <p>
              현재 6편의 이야기와 회화·문장·리딩 18묶음은 무료로 체험할 수 있습니다. 기록을
              저장하려면 Google로 로그인해 주세요.
            </p>
            <p>
              말하기는 예문을 듣고 직접 연습한 뒤 본인이 완료를 확인합니다. 쓰기는 제작한 예문과
              필요한 정보를 기준으로 확인합니다. 음성·문법 전체에 대한 자동 평가나 공인 시험 점수
              환산은 제공하지 않습니다.
            </p>
            <p>
              위 연구는 설계의 참고 근거입니다. 이 사이트의 학습 효과를 별도 실험으로 검증한 결과는
              아직 없습니다.
            </p>
          </div>
          <Link className={styles.outlineButton} href="/english">
            이야기 고르기
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </PageFrame>,
    locale,
  );
}
