import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  FileText,
  FolderOpen,
  Printer,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "제품 소개 · DullG",
  description:
    "초6~중1 영어학원을 위한 4차시 미스터리 수업팩. 수업 방식, 실제 자료, 학생 결과물과 파일럿 운영 조건을 확인하세요.",
};

const pathways = [
  {
    number: "01",
    title: "4차시 수업 방식",
    body: "단서 읽기에서 팀 토론과 사건보고서까지 이어지는 수업 구조를 확인합니다.",
    href: "/academy/curriculum",
    cta: "커리큘럼 보기",
    icon: BookOpenText,
  },
  {
    number: "02",
    title: "실제 제공 자료",
    body: "학생용 카드와 워크북, 교사용 진행안, 학부모 전달용 결과물을 살펴봅니다.",
    href: "/academy/sample",
    cta: "수업 자료 보기",
    icon: FolderOpen,
  },
  {
    number: "03",
    title: "첫 번째 에피소드",
    body: "보충반에서 열쇠가 사라진 사건과 네 명의 학생이 가진 단서를 미리 경험합니다.",
    href: "/episode",
    cta: "에피소드 01 보기",
    icon: FileText,
  },
  {
    number: "04",
    title: "파일럿 운영 과정",
    body: "샘플 요청, 일정 조율, 수업 운영과 피드백까지의 과정을 확인합니다.",
    href: "/academy/pilot",
    cta: "운영 안내 보기",
    icon: Printer,
  },
];

export default function AcademyPage() {
  return (
    <PageFrame>
      <section className="academy-overview-hero shell">
        <div>
          <Kicker>DULLG PRODUCT OVERVIEW</Kicker>
          <h1>
            준비부터 결과물까지,
            <br />
            <em>한눈에 보는 4차시 수업팩</em>
          </h1>
          <p>
            학생용 단서 카드와 워크북, 교사용 진행안, 결과물 예시를 한
            수업팩에 담았습니다. 수업 방식과 실제 자료, 운영 과정을
            차례로 확인해보세요.
          </p>
          <div className="academy-overview-actions">
            <ArrowButton href="/#apply">무료 샘플 받아보기</ArrowButton>
            <a href="/academy/curriculum">
              4차시 구성 먼저 보기
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>

        <figure className="academy-overview-cover">
          <img
            src="/assets/dullg/rulebook-cover.png"
            alt="첫 번째 에피소드 보충반의 사라진 열쇠 규칙서 표지"
          />
          <figcaption>CASE FILE 01 · 보충반의 사라진 열쇠</figcaption>
        </figure>
      </section>

      <section
        className="academy-overview-facts shell"
        aria-label="수업팩 운영 조건"
      >
        <div>
          <b>4차시</b>
          <span>읽기·토론·쓰기 통합</span>
        </div>
        <div>
          <b>초6~중1</b>
          <span>권장 학년</span>
        </div>
        <div>
          <b>4~16명</b>
          <span>권장 인원</span>
        </div>
        <div>
          <b>30분 이내</b>
          <span>첫 수업 준비 목표</span>
        </div>
      </section>

      <section className="academy-overview-value shell">
        <div className="academy-overview-value-head">
          <Kicker>WHY DULLG</Kicker>
          <h2>
            활동이 재미있는 이유와
            <br />
            <em>학원에서 운영할 이유를 연결합니다.</em>
          </h2>
        </div>
        <div className="academy-overview-value-list">
          <article>
            <span>FOR STUDENTS</span>
            <h3>영어가 문제를 푸는 도구가 됩니다</h3>
            <p>
              각자 다른 단서를 가지고 있어 읽은 내용을 설명하고 질문해야 팀이
              다음 단계로 이동할 수 있습니다.
            </p>
          </article>
          <article>
            <span>FOR TEACHERS</span>
            <h3>수업 준비보다 학생에게 집중합니다</h3>
            <p>
              차시별 대본, 역할 배정, 힌트와 정답이 함께 제공되어 교사는
              진행과 관찰에 집중할 수 있습니다.
            </p>
          </article>
          <article>
            <span>FOR ACADEMIES</span>
            <h3>학부모에게 보여줄 결과물이 남습니다</h3>
            <p>
              팀 사건보고서와 개인 영어 작성지로 학생이 무엇을 읽고 말하고
              썼는지 구체적으로 설명할 수 있습니다.
            </p>
          </article>
        </div>
      </section>

      <section className="academy-overview-map">
        <div className="shell">
          <div className="academy-overview-map-head">
            <Kicker>EXPLORE THE PRODUCT</Kicker>
            <h2>
              검토에 필요한 정보를
              <br />
              <em>순서대로 확인하세요.</em>
            </h2>
            <p>
              전체 설명을 반복하지 않고, 각 상세 페이지가 하나의 판단 질문에
              답하도록 구성했습니다.
            </p>
          </div>

          <div className="academy-overview-pathways">
            {pathways.map((pathway) => {
              const Icon = pathway.icon;
              return (
                <a href={pathway.href} key={pathway.number}>
                  <span className="academy-overview-path-number">
                    {pathway.number}
                  </span>
                  <span className="academy-overview-path-icon" aria-hidden="true">
                    <Icon size={28} weight="duotone" />
                  </span>
                  <span>
                    <h3>{pathway.title}</h3>
                    <p>{pathway.body}</p>
                  </span>
                  <strong>
                    {pathway.cta}
                    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                  </strong>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="academy-overview-experience shell">
        <div className="academy-overview-experience-copy">
          <Kicker>FROM CLUE TO REPORT</Kicker>
          <h2>
            단서는 대화가 되고,
            <br />
            <em>대화는 보고서가 됩니다.</em>
          </h2>
          <p>
            학생들은 각자 가진 카드에서 사실을 찾고, 서로의 시간과 장소를
            비교해 가설을 만듭니다. 새로운 단서가 나오면 판단을 수정하고,
            마지막에는 근거를 영어 문장으로 정리합니다.
          </p>
          <a href="/episode">
            실제 사건 흐름 보기
            <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </a>
        </div>
        <div className="academy-overview-experience-images">
          <figure>
            <img
              src="/assets/dullg/students-investigation.png"
              alt="학생들이 단서와 평면도를 함께 살펴보는 수업 장면"
              loading="lazy"
            />
            <figcaption>단서 공유와 팀 추론</figcaption>
          </figure>
          <figure>
            <img
              src="/assets/dullg/mat-report.png"
              alt="수업 뒤 학부모에게 전달할 수 있는 학생 결과 리포트"
              loading="lazy"
            />
            <figcaption>수업 뒤에 남는 활동 결과</figcaption>
          </figure>
        </div>
      </section>

      <section className="academy-overview-pilot">
        <div className="shell academy-overview-pilot-grid">
          <div>
            <Kicker>CURRENT STATUS · PILOT</Kicker>
            <h2>
              먼저 자료를 확인하고,
              <br />
              <em>운영 여부는 그다음에 결정하세요.</em>
            </h2>
          </div>
          <div>
            <p>
              현재 파일럿 단계로, 수업 피드백에 따라 일부 자료가 조정될 수
              있습니다. 현재 검토용 샘플 자료는 무료로 제공하며, 파일럿
              참여 의무는 없습니다.
            </p>
            <ArrowButton light href="/#apply">
              무료 샘플 받아보기
            </ArrowButton>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
