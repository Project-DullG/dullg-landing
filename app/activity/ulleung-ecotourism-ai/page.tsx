import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ActivityPhotoGallery } from "@/components/activity-photo-gallery";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/activity/ulleung-ecotourism-ai", {
  description: "2026년 7월 4일 울릉군 생태관광 AI 교육의 내용과 현장 기록을 소개합니다.",
});

export default function UlleungEcotourismAiPage() {
  return (
    <PageFrame>
      <article className="activity-case">
        <header className="activity-case-hero shell">
          <div>
            <Kicker>교육 활동 · 2026년 7월 4일</Kicker>
            <h1>
              울릉군 생태관광
              <br />
              <em>AI 교육</em>
            </h1>
          </div>
          <div>
            <p>
              울릉군의 관광 자원을 정리하고 생성형 AI로 홍보 문구와 웹페이지를 직접 만든 하루
              과정입니다.
            </p>
            <dl>
              <div>
                <dt>대상</dt>
                <dd>울릉군 글로벌 생태관광 전문인재 양성 교육 참여자</dd>
              </div>
              <div>
                <dt>일정</dt>
                <dd>2026년 7월 4일</dd>
              </div>
              <div>
                <dt>장소</dt>
                <dd>울릉고등학교 전산실</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="activity-case-material">
          <div className="shell">
            <div>
              <Kicker>수업 내용</Kicker>
              <h2>관광 소재로 웹페이지 만들기</h2>
              <p>
                관광 소재를 고르고, AI로 소개 문구와 이미지를 다듬은 뒤 공개 가능한 웹페이지로
                완성했습니다.
              </p>
            </div>
            <div>
              <Link href="/materials/ulleung-ecotourism-ai">
                <span>
                  <small>강의와 실습 자료</small>
                  <strong>수강자료 확인하기 →</strong>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <div className="shell">
          <ActivityPhotoGallery
            photos={[
              {
                src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-class.jpg",
                alt: "울릉군 생태관광 교육 참여자들이 전산실에서 AI 실습을 진행하는 모습",
                caption: "관광 홍보 문구와 웹페이지를 만드는 실습",
              },
              {
                src: "/assets/activities/ulleung-ecotourism-ai-2026-07-04-group.jpg",
                alt: "울릉군 글로벌 생태관광 전문인재 양성 교육을 마친 참여자들의 단체 사진",
                caption: "울릉군 글로벌 생태관광 전문인재 양성 교육",
              },
            ]}
          />
        </div>

        <nav className="activity-case-nav shell" aria-label="활동 기록 이동">
          <Link href="/activity">
            <ArrowLeft size={18} weight="bold" aria-hidden="true" /> 제작·활동 기록으로 돌아가기
          </Link>
          <Link href="/materials">수강생 자료실 보기</Link>
        </nav>
      </article>
    </PageFrame>
  );
}
