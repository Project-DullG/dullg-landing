import Image from "next/image";
import Link from "next/link";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import {
  curriculum,
  educationFacts,
  episodeFullTitle,
  episodeSubtitle,
  episodeTitle,
} from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/episode", {
  title: `에피소드 01 · ${episodeTitle}`,
  description: `${episodeFullTitle}. 학원 3층에서 두 개의 열쇠가 사라졌습니다. 네 학생이 단서를 모아 사건을 해결합니다.`,
});

const cast = [
  {
    num: "01",
    name: "윤지원",
    image: "/assets/dullg/yoonjiwon.png",
    clue: "오후 4시 12분, 원장실 앞 복도에서 서두르는 발소리를 들었습니다.",
  },
  {
    num: "02",
    name: "박세준",
    image: "/assets/dullg/parksejun.png",
    clue: "자습실 창가 자리에서 벽면 열쇠고리가 비어 있는 것을 보았습니다.",
  },
  {
    num: "03",
    name: "차하린",
    image: "/assets/dullg/chaharin.png",
    clue: "계단 아래에서 선생님과 낯선 가방이 함께 있는 것을 목격했습니다.",
  },
  {
    num: "04",
    name: "한도경",
    image: "/assets/dullg/handokyung.png",
    clue: "복도에서 쪽지 한 장을 발견했습니다. 그 위에 영어 문장이 쓰여 있었습니다.",
  },
];

export default function EpisodePage() {
  return (
    <PageFrame>
      {/* ── HERO — split with case file cover ── */}
      <section className="ep-hero-split shell">
        <div className="ep-hero-copy">
          <SectionHead
            as="h1"
            kicker="첫 번째 사건 · 에피소드 01"
            title={
              <>
                {episodeTitle}
                <br />
                <em>{episodeSubtitle}</em>
              </>
            }
            lead="재시험을 시작하려던 순간, 원장실 벽면에 있어야 할 두 개의 열쇠가 사라졌습니다. 네 명의 학생이 각자 다른 장소에서 단서를 발견합니다."
          />
          <div className="ep-hero-chips">
            {educationFacts.slice(0, 3).map(([value]) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
        <div className="ep-hero-visual">
          <Image
            src="/assets/dullg/rulebook-cover.png"
            alt={`${episodeTitle} 규칙서 표지`}
            width={944}
            height={1330}
            sizes="(max-width: 760px) 82vw, 38vw"
            priority
          />
          <span className="ep-case-stamp">OPEN CASE</span>
        </div>
      </section>

      {/* ── SETTING — large floor map ── */}
      <section className="ep-setting">
        <div className="shell ep-setting-inner">
          <div className="ep-setting-copy">
            <Kicker>사건이 시작된 장소</Kicker>
            <h2>
              오후 4시 30분,
              <br />
              <span>학원 3층에서 시작됩니다.</span>
            </h2>
            <p>
              방과후 보충 수업 첫날. 재시험을 치르기 위해 학생들이 모였는데, 원장실 서랍 열쇠와
              자습실 보관함 열쇠가 동시에 사라졌습니다.
            </p>
            <p>
              4명의 학생이 각자 목격한 것을 영어로 기록하고 정보를 모아 사건을 해결해야 합니다.
              단서는 각자 다르고, 혼자로는 충분하지 않습니다.
            </p>
          </div>
          <div className="ep-setting-map">
            <Image
              src="/assets/dullg/floor-map-3f.png"
              alt="3층 원장실과 자습실 평면도"
              width={850}
              height={746}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="ep-map-label">
              <span>3F / FLOOR MAP</span>
              <span>INCIDENT LOCATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAST — profile cards ── */}
      <section className="ep-cast shell">
        <SectionHead
          className="ep-cast-head"
          kicker="서로 다른 단서를 가진 네 학생"
          title={
            <>
              각자 다른 단서를
              <br />
              <em>가지고 있습니다.</em>
            </>
          }
        />
        <div className="ep-cast-grid">
          {cast.map((c) => (
            <div className="ep-cast-card" key={c.name}>
              <div className="ep-cast-img">
                <Image
                  src={c.image}
                  width={500}
                  height={500}
                  alt={`${c.name} 캐릭터`}
                  sizes="(max-width: 760px) 50vw, 25vw"
                />
              </div>
              <div className="ep-cast-info">
                <span className="ep-cast-index">{c.num} / 04</span>
                <strong>{c.name}</strong>
                <p>{c.clue}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LESSON FLOW ── */}
      <section className="ep-flow shell">
        <SectionHead
          className="ep-flow-head"
          kicker="네 번의 수업으로 푸는 사건"
          title={
            <>
              4차시 동안
              <br />
              <em>사건이 풀립니다.</em>
            </>
          }
        />
        <div className="ep-steps">
          {curriculum.map((item) => (
            <div className="ep-step" key={item.session}>
              <div className="ep-step-head">
                <b className="ep-step-num">{item.session}</b>
                <span className="ep-step-label">{item.label}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="ep-output">결과물 · {item.output}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ep-cta shell">
        <div className="ep-cta-copy">
          <SectionHead
            kicker="실제 제작 자료 확인"
            title={
              <>
                자료를 먼저
                <br />
                <span>직접 확인하세요.</span>
              </>
            }
            lead="단서 카드, 교사용 진행안과 결과물 예시 시제품을 묶어 보내드립니다. 현재 검토용 샘플은 무료입니다."
          />
        </div>
        <div className="ep-cta-actions">
          <ArrowButton>무료 검토팩 요청</ArrowButton>
          <Link className="text-link" href="/academy/sample">
            자료 미리 보기 →
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
