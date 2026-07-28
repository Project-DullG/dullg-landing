import {
  ArrowRight,
  Camera,
  CheckCircle,
  Package,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "활동 기록 · DullG",
  description:
    "DullG 수업팩의 제작 과정, 현재 진행 상황과 앞으로 공개할 실제 수업 현장 및 팀 소개를 확인하세요.",
};

const progress = [
  {
    label: "완료",
    title: "첫 수업용 시제품 제작",
    body: "사건 구조와 학생용 단서 카드, 워크북, 교사용 진행안 시제품을 제작했습니다.",
    icon: Package,
  },
  {
    label: "준비 중",
    title: "학원 파일럿 설계",
    body: "준비 시간, 영어 단서 사용, 학생 참여와 결과물을 확인할 운영 기준을 정리했습니다.",
    icon: CheckCircle,
  },
  {
    label: "준비 중",
    title: "현장 기록 공개",
    body: "공개 동의를 받은 사진과 교사 의견부터 순서대로 업데이트할 예정입니다.",
    icon: Camera,
  },
];

const fieldSlots = [
  {
    title: "수업 준비",
    note: "출력물과 교구를 준비하는 실제 모습",
  },
  {
    title: "학생 활동",
    note: "단서를 읽고 팀으로 추론하는 수업 장면",
  },
  {
    title: "수업 결과",
    note: "학생 기록지와 사건보고서 결과물",
  },
];

const teamSlots = [
  {
    role: "콘텐츠·제품 설계",
    detail: "에피소드와 4차시 수업 구조를 설계합니다.",
  },
  {
    role: "영어 교육 검토",
    detail: "학생 수준에 맞춰 어휘와 활동 난이도를 검토합니다.",
  },
  {
    role: "교실 운영 검토",
    detail: "교사가 실제로 진행하기 쉬운 순서와 안내를 확인합니다.",
  },
];

const evidenceRules = [
  {
    label: "확인된 자산",
    body: "제작 파일이나 공식 문서로 확인할 수 있는 내용",
  },
  {
    label: "현재 결정",
    body: "지금 실행 기준으로 정한 제품 범위와 우선순위",
  },
  {
    label: "검증 예정",
    body: "파일럿에서 확인해야 하며 아직 성과로 말하지 않는 내용",
  },
];

export default function ActivityPage() {
  return (
    <PageFrame>
      <section className="activity-hero shell">
        <div>
          <Kicker>DullG 활동 기록</Kicker>
          <h1>
            만드는 과정과
            <br />
            <em>확인된 사실을 기록합니다.</em>
          </h1>
        </div>
        <p>
          현재 수업용 시제품을 제작하고 파일럿을 준비하는 단계입니다. 확인된
          자산, 현재 결정과 앞으로 검증할 내용을 구분해 안내하겠습니다.
        </p>
      </section>

      <section className="activity-status shell" aria-labelledby="status-title">
        <div className="activity-section-head">
          <Kicker>현재 진행 상황</Kicker>
          <h2 id="status-title">지금까지 진행한 일</h2>
        </div>
        <div className="activity-status-grid">
          {progress.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <div>
                  <Icon size={25} weight="duotone" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="activity-evidence shell">
        <div className="activity-section-head activity-section-head-row">
          <div>
            <Kicker>공개 기준</Kicker>
            <h2>사실과 계획을 섞지 않습니다.</h2>
          </div>
          <p>
            목표, 기대 효과와 확장 아이디어를 이미 확인된 성과처럼 표현하지
            않습니다. 공개할 때는 아래 기준을 함께 표시합니다.
          </p>
        </div>
        <div className="activity-evidence-grid">
          {evidenceRules.map((rule) => (
            <article key={rule.label}>
              <strong>{rule.label}</strong>
              <p>{rule.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="activity-making">
        <div className="shell activity-making-grid">
          <div className="activity-making-copy">
            <Kicker>현재 공개 가능한 자료</Kicker>
            <h2>
              말보다 먼저,
              <br />
              <span>만든 자료를 보여드립니다.</span>
            </h2>
            <p>
              아래 이미지는 영어학원용 수업 제품으로 검토 중인 시제품입니다. 교실 장면
              이미지는 수업 구성을 설명하기 위한 연출 이미지이며, 실제
              파일럿 현장 사진과 구분해 표시합니다.
            </p>
            <a href="/academy/sample">
              실제 수업 자료 전체 보기
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <div className="activity-making-media">
            <figure>
              <img
                src="/assets/dullg/mat-game-cards.png"
                alt="DullG 학생용 게임 카드 구성"
              />
              <figcaption>제작 자료 · 학생용 게임 카드</figcaption>
            </figure>
            <figure>
              <img
                src="/assets/dullg/mat-teacher-guide.png"
                alt="DullG 교사용 수업 진행안"
              />
              <figcaption>제작 자료 · 교사용 진행안</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="activity-field shell" aria-labelledby="field-title">
        <div className="activity-section-head activity-section-head-row">
          <div>
            <Kicker>실제 활동사진</Kicker>
            <h2 id="field-title">현장 기록을 준비하고 있습니다.</h2>
          </div>
          <p>
            촬영일·수업 유형·공개 동의를 확인한 사진만 게시합니다. 자료가
            준비되면 아래 공간에 실제 사진과 간단한 설명이 표시됩니다.
          </p>
        </div>
        <div className="activity-field-grid">
          {fieldSlots.map((slot, index) => (
            <article key={slot.title}>
              <div className="activity-photo-slot" aria-hidden="true">
                <Camera size={30} weight="duotone" />
                <span>PHOTO {String(index + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <span>사진 준비 중</span>
                <h3>{slot.title}</h3>
                <p>{slot.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="activity-team">
        <div className="shell">
          <div className="activity-section-head activity-section-head-row">
            <div>
              <Kicker>만드는 사람들</Kicker>
              <h2>역할과 책임부터 공개합니다.</h2>
            </div>
            <p>
              이름과 사진은 당사자 공개 동의 후 추가합니다. 현재는 제품을
              만드는 데 필요한 역할과 책임을 먼저 안내합니다.
            </p>
          </div>
          <div className="activity-team-grid">
            {teamSlots.map((member) => (
              <article key={member.role}>
                <div className="activity-avatar-slot" aria-hidden="true">
                  <UsersThree size={28} weight="duotone" />
                </div>
                <span>PROFILE 준비 중</span>
                <h3>{member.role}</h3>
                <p>{member.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="activity-contact shell">
        <div>
          <Kicker>확인 가능한 연락처</Kicker>
          <h2>DullG에 직접 물어보세요.</h2>
          <p>
            제품, 파일럿과 공개된 기록에 관한 문의는 이메일로 받고 있습니다.
          </p>
        </div>
        <a href="mailto:hello@dullg.com">hello@dullg.com</a>
      </section>
    </PageFrame>
  );
}
