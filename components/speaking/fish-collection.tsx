"use client";
import { useState } from "react";
import { FishIcon, RulerIcon, SparkleIcon, StarIcon } from "@phosphor-icons/react";
import type { StudySnapshot } from "@/lib/speaking/catalog/view";
import type { FishRecord } from "@/lib/speaking/catalog/fishing/collection";
import styles from "./speaking.module.css";

export function FishArt({
  id,
  name,
  record,
  hidden = false,
}: {
  id: number;
  name: string;
  record?: FishRecord | null;
  hidden?: boolean;
}) {
  const pattern = record?.pattern || 0;
  return (
    <span
      role={hidden ? undefined : "img"}
      aria-label={hidden ? undefined : name}
      aria-hidden={hidden || undefined}
      className={styles.fishSprite}
      data-grade={record?.grade}
      style={{
        backgroundImage: `url(/speaking/assets/${id >= 12 ? "fish-expansion.png" : ["fish-atlas.png", "fish-spots.png", "fish-aurora.png"][pattern]})`,
        backgroundSize: id >= 12 ? `${(1774 / 260) * 100}% ${(887 / 260) * 100}%` : "400% 300%",
        ...(id >= 12 || pattern > 0 ? { height: "auto", aspectRatio: "1" } : {}),
        backgroundPosition:
          id >= 12
            ? `${([24, 329, 602, 893, 1169, 1456][id - 12] / (1774 - 260)) * 100}% ${([58, 310, 567][pattern] / (887 - 260)) * 100}%`
            : `${((id % 4) / 3) * 100}% ${(Math.floor(id / 4) / 2) * 100}%`,
      }}
    />
  );
}
export function FishingLevel({ data }: { data: StudySnapshot }) {
  const g = data.collection.growth;
  return (
    <div className={styles.fishingLevel}>
      <div>
        <strong>낚시 Lv.{g.level}</strong>
        <span>{g.next === null ? "최고 레벨" : `다음 레벨까지 ${g.remaining} XP`}</span>
      </div>
      <progress
        value={g.next === null ? 1 : g.xp - g.floor}
        max={g.next === null ? 1 : g.next - g.floor}
        aria-label="낚시 레벨 경험치"
      />
      <p>
        일반 포획의 오로라 확률 <b>{g.aurora}%</b>
      </p>
    </div>
  );
}
export function FishCollection({
  data,
  busy,
  onFeature,
  onPractice,
  onTheme,
  onFeed,
}: {
  data: StudySnapshot;
  busy: boolean;
  onFeature: (fish: number, catchId?: string) => void;
  onPractice: () => void;
  onTheme: (theme: string) => void;
  onFeed: (catchId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "caught" | "trophy">("all");
  const collection = data.collection;
  const aquarium = collection.aquarium;
  const display = data.fish.filter(
    (f) =>
      filter === "all" ||
      (filter === "caught"
        ? f.count
        : collection.records.some((c) => c.fish === f.id && c.grade === 3)),
  );
  const lastFedId = Object.entries(collection.feedingLog).sort(
    (a, b) => (b[1].run || 0) - (a[1].run || 0),
  )[0]?.[0];
  const candidates = [
    collection.featured,
    collection.records.find((c) => c.id === lastFedId),
    ...collection.records.slice().reverse(),
  ].filter((c): c is FishRecord => !!c);
  const showcased = candidates
    .filter((c, i) => candidates.findIndex((p) => p.id === c.id) === i)
    .slice(0, aquarium.slots);
  return (
    <section>
      <div className={styles.aquariumScene} data-theme={aquarium.selected.id}>
        <div className={styles.aquariumHeading}>
          <div>
            <span>
              {aquarium.selected.name} · {aquarium.slots}마리 전시 공간
            </span>
            <h2>
              {data.totalFish}마리 · {data.fish.filter((f) => f.count).length}종
            </h2>
          </div>
          <span className={styles.starCount}>
            <StarIcon weight="fill" size={19} />
            {data.stars}
          </span>
        </div>
        <div className={styles.aquariumFish}>
          {showcased.length ? (
            showcased.map((c, index) => (
              <button
                key={c.id}
                disabled={busy}
                aria-label={`${data.fish[c.fish].name}, ${c.length}cm · 말하며 먹이 주기`}
                onClick={() => onFeed(c.id)}
                data-motion={c.motion}
                className={styles.swimmingFish}
                style={{ animationDelay: `${index * -1.6}s` }}
              >
                <FishArt
                  id={c.fish}
                  name={`${data.fish[c.fish].name}, ${c.length}cm, ${c.patternName}`}
                  record={c}
                />
                {collection.feedingLog[c.id] && (
                  <span className={styles.fedMark} aria-label="함께 연습한 물고기">
                    ♥
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className={styles.emptyTank}>
              <FishIcon size={42} />
              <p>
                첫 공부 묶음을 마치면
                <br />
                여기에 물고기가 들어와요.
              </p>
            </div>
          )}
        </div>
        {data.totalFish > 0 && (
          <p className={styles.aquariumHint}>물고기를 눌러 문장을 연습하고 먹이를 주세요.</p>
        )}
      </div>
      <details className={styles.aquariumDecor}>
        <summary>
          수족관 꾸미기{" "}
          <span>
            {aquarium.next
              ? `Lv.${aquarium.next.level}에 ${aquarium.next.name} 열림`
              : "수조 배경 3종 모두 열림"}
          </span>
        </summary>
        <div className={styles.themeChoices}>
          {aquarium.themes.map((theme) => (
            <button
              key={theme.id}
              disabled={busy || !theme.unlocked}
              aria-pressed={aquarium.selected.id === theme.id}
              onClick={() => onTheme(theme.id)}
            >
              <span className={styles.themePreview} data-theme={theme.id} aria-hidden="true" />
              <strong>{theme.name}</strong>
              <small>
                {theme.unlocked
                  ? aquarium.selected.id === theme.id
                    ? "사용 중"
                    : "이 배경 사용"
                  : `Lv.${theme.level}에 열려요`}
              </small>
            </button>
          ))}
        </div>
        <p>
          Lv.1·4·7에 전시 공간이 3·5·7마리로 늘어납니다. 도감에서 대표 물고기를 고르면 나머지 자리는
          잡은 물고기로 채웁니다. 보유한 물고기는 모두 도감에 남습니다.
        </p>
      </details>
      <FishingLevel data={data} />
      <div className={styles.collectionStats}>
        <div>
          <RulerIcon size={19} />
          <strong>{collection.largest ? `${collection.largest.length}cm` : "—"}</strong>
          <span>가장 큰 물고기</span>
        </div>
        <div>
          <StarIcon size={19} />
          <strong>{collection.grades[3].count}마리</strong>
          <span>특대 크기</span>
        </div>
        <div>
          <SparkleIcon size={19} />
          <strong>{collection.patterns.filter((p) => p.count).length} / 3</strong>
          <span>발견한 무늬</span>
        </div>
      </div>
      <div className={styles.collectionNext}>
        <p>
          {data.nextUnlock
            ? `앞으로 ${data.nextUnlock.remaining}일을 마치면 ‘${data.fish[data.nextUnlock.fish].name}’가 등장해요.`
            : "코스의 12종을 모두 발견했어요."}
        </p>
        <span>
          {collection.growth.weeklyAvailable
            ? `코스 ${collection.growth.weeklyRemaining}일을 더 마치면 특대 오로라 물고기를 꼭 만나요.`
            : "코스를 마쳐도 반복 연습으로 크기와 무늬를 계속 모을 수 있어요."}
        </span>
        <button className={styles.textButton} disabled={busy} onClick={onPractice}>
          {collection.growth.repeatClaimed
            ? "반복 연습하러 가기"
            : "반복 3문항 연습하고 오늘의 물고기 +1"}
        </button>
      </div>
      <div className={styles.collectionFilters} role="group" aria-label="물고기 목록 필터">
        {(["all", "caught", "trophy"] as const).map((key, i) => (
          <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {["전체 도감", "잡은 물고기", "특대만"][i]}
          </button>
        ))}
      </div>
      {!display.length && (
        <p className={styles.emptyCollection}>
          아직 해당하는 물고기가 없어요. 다음 공부 묶음을 마치면 새 크기를 확인할 수 있어요.
        </p>
      )}
      <div className={styles.fishGrid}>
        {display.map((fish) => {
          const specimens = collection.records
            .filter((c) => c.fish === fish.id)
            .sort((a, b) => b.length - a.length);
          const best = specimens[0];
          return (
            <article
              key={fish.id}
              className={styles.fishCard}
              data-locked={!fish.count}
              data-trophy={best?.grade === 3}
            >
              <div className={styles.fishPortrait}>
                <FishArt
                  id={fish.id}
                  name={fish.count ? fish.name : "아직 발견하지 않은 물고기"}
                  record={best}
                />
              </div>
              <span className={styles.small}>NO. {String(fish.id + 1).padStart(2, "0")}</span>
              <h3>{fish.name}</h3>
              {best ? (
                <>
                  <strong className={styles.fishLength}>
                    {best.length}
                    <small>cm</small> <span data-grade={best.grade}>{best.gradeName}</span>
                  </strong>
                  <p>{fish.count}마리 수집 · 최고 크기</p>
                  <div className={styles.patternChips}>
                    {["기본", "반점", "오로라"].map((name, i) => (
                      <span key={name} data-found={specimens.some((c) => c.pattern === i)}>
                        {name}
                      </span>
                    ))}
                  </div>
                  <details className={styles.specimens}>
                    <summary>잡은 물고기 보기</summary>
                    {specimens.map((c) => (
                      <div className={styles.specimenRow} key={c.id}>
                        <FishArt id={fish.id} name={c.patternName} record={c} />
                        <span>
                          <b>
                            {c.length}cm · {c.gradeName}
                          </b>
                          <small>
                            {["느긋한 헤엄", "짧게 쏙쏙", "위아래 둥실"][c.motion]} ·{" "}
                            {c.patternName} ·{" "}
                            {c.source === "repeat" ? `${c.date} 반복 연습` : `${c.day + 1}일차`}
                            {c.star ? " · 별물고기" : ""}
                          </small>
                        </span>
                        <button
                          className={styles.textButton}
                          disabled={busy || collection.featured?.id === c.id}
                          onClick={() => onFeature(fish.id, c.id)}
                        >
                          {collection.featured?.id === c.id ? "전시 중" : "전시"}
                        </button>
                      </div>
                    ))}
                  </details>
                  <button
                    className={styles.secondary}
                    disabled={busy || collection.featured?.id === best.id}
                    onClick={() => onFeature(fish.id, best.id)}
                  >
                    {collection.featured?.id === best.id ? "최고 크기 전시 중" : "최고 크기 전시"}
                  </button>
                </>
              ) : (
                <p>
                  {fish.id >= 12
                    ? `Lv.${collection.practiceSpecies.find((s) => s.fish === fish.id)?.level}부터 반복 연습에서 만나요`
                    : "아직 만나지 않았어요"}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <details className={styles.plan}>
        <summary>크기·무늬 수집 안내</summary>
        <p>
          코스에서는 12종, 반복 연습에서는 레벨에 따라 해마·가오리·개복치·아귀·상자복·톱상어 6종도
          만납니다. 새 어종이 열리면 다음 반복 보상에서 아직 만나지 않은 종을 먼저 줍니다.
        </p>
        <p>
          말하며 먹이 주기는 반복 연습의 한 방식입니다. 3문항을 두 번씩 마쳤을 때만 먹이 주기가
          기록되며, 일반 반복 연습과 하루 보상 한도를 함께 씁니다.
        </p>
        <p>크기는 어종별로 아담·보통·대형·특대 네 등급으로 나뉩니다.</p>
        <p>
          무늬는 기본·반점·오로라 세 종류입니다. 한 번 잡은 물고기의 크기와 무늬는 다시 접속하거나
          전시를 바꿔도 달라지지 않습니다.
        </p>
        <p>
          코스 한 묶음을 마치면 물고기 한 마리와 20 XP를 얻습니다. 코스 7·14·21·28일차의 마지막은
          특대 오로라 물고기로 정해져 있습니다.
        </p>
        <p>
          반복 연습에서 서로 다른 3문항을 두 차례씩 연습하면 하루 한 번 물고기 한 마리와 20 XP를 더
          얻습니다. 한국 시각 자정에 다시 받을 수 있으며, 추가 보상을 받은 뒤에도 연습은 계속할 수
          있습니다.
        </p>
        <p>
          낚시 레벨은 완료한 공부의 누적 XP로 오릅니다. 일반 포획의 오로라 확률은 Lv.1에서 12%,
          레벨마다 2%p씩 올라 Lv.10에서 30%가 됩니다. 보장 물고기는 이 확률과 별도로 지급합니다.
        </p>
      </details>
    </section>
  );
}
