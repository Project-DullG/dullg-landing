import type {
  EnglishAttempt,
  EnglishEpisode,
  EnglishExpression,
  EnglishLevel,
  EnglishProgress,
  TaskVersion,
} from "./types.ts";

export class EnglishInputError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const REVIEW_DAILY_LIMIT = 20;
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];
const GROWTH_THRESHOLDS = [0, 60, 140, 260, 420, 650];
const GROWTH_TITLES = [
  "첫 페이지",
  "단서 수집가",
  "이야기 독자",
  "대화 여행자",
  "문장 탐험가",
  "이야기 해결사",
];
const DAY_MS = 86_400_000;

export function englishDay(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

export function isEnglishLevel(value: unknown): value is EnglishLevel {
  return value === "starter" || value === "standard" || value === "challenge";
}

export function emptyEnglishProgress(): EnglishProgress {
  return {
    version: 1,
    xp: 0,
    preferredLevel: "standard",
    episodes: {},
    skills: { reading: 0, listening: 0, writing: 0, speaking: 0 },
    learnedExpressionIds: [],
    reviews: {},
    activeDates: [],
    dailyActivity: {},
    practiceDates: {},
  };
}

/** Completion follows the current authored task IDs, not a historic timestamp or count. */
export function getEnglishEpisodeStatus(progress: EnglishProgress, episode: EnglishEpisode) {
  const saved = progress.episodes[episode.id];
  const completed = new Set(saved?.completedTasks || []);
  const completedTaskIds = episode.tasks
    .filter((task) => completed.has(task.id))
    .map((task) => task.id);
  const firstMissingIndex = episode.tasks.findIndex((task) => !completed.has(task.id));
  return {
    completedTaskIds,
    completedCount: completedTaskIds.length,
    total: episode.tasks.length,
    finished: episode.tasks.length > 0 && firstMissingIndex < 0,
    firstMissingIndex: firstMissingIndex < 0 ? episode.tasks.length : firstMissingIndex,
    completionRewarded: saved?.completionRewarded === true || !!saved?.completedAt,
  };
}

/** Expanding an episode keeps earned records while reopening only its new tasks. */
export function reconcileEnglishProgress(
  progress: EnglishProgress,
  episodes: EnglishEpisode[],
): EnglishProgress {
  let records = progress.episodes;
  for (const episode of episodes) {
    const saved = records[episode.id];
    if (!saved) continue;
    const status = getEnglishEpisodeStatus(progress, episode);
    const outdatedCompletion = !!saved.completedAt && !status.finished;
    const historicalReward = !!saved.completedAt && saved.completionRewarded !== true;
    if (!outdatedCompletion && !historicalReward) continue;
    if (records === progress.episodes) records = { ...records };
    const next = { ...saved, completionRewarded: status.completionRewarded };
    if (outdatedCompletion) delete next.completedAt;
    records[episode.id] = next;
  }
  return records === progress.episodes ? progress : { ...progress, episodes: records };
}

export function normalizeEnglishAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Only checks the authored response patterns; this does not evaluate grammar or pronunciation. */
export function englishAnswerAccepted(
  answer: string,
  version: Pick<TaskVersion, "accepted" | "keywords">,
): boolean {
  const normalized = normalizeEnglishAnswer(answer);
  if (!normalized) return false;
  if (version.accepted?.some((candidate) => normalizeEnglishAnswer(candidate) === normalized))
    return true;
  if (!version.keywords?.length) return false;
  // A keyword checklist must not accept the opposite claim merely because it shares nouns.
  const negative =
    /\b(?:no|not|never|cannot|can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|shouldn't|wouldn't|couldn't)\b/;
  const hasGroups = (text: string) =>
    version.keywords!.every(
      (alternatives) =>
        alternatives.length > 0 &&
        alternatives.some((keyword) => {
          const term = normalizeEnglishAnswer(keyword);
          return term.length > 0 && ` ${text} `.includes(` ${term} `);
        }),
    );
  const authoredNegative = version.keywords
    .flat()
    .some((keyword) => negative.test(normalizeEnglishAnswer(keyword)));
  if (
    !authoredNegative &&
    answer
      .split(/[.!?;]/)
      .map(normalizeEnglishAnswer)
      .some((sentence) => negative.test(sentence) && hasGroups(sentence))
  )
    return false;
  return hasGroups(normalized);
}

function inputRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new EnglishInputError("요청 내용을 확인해 주세요.");
  return input as Record<string, unknown>;
}

export function validateEnglishAttempt(input: unknown): EnglishAttempt {
  const value = inputRecord(input);
  for (const key of ["episodeId", "taskId"] as const) {
    if (typeof value[key] !== "string" || !/^[a-z0-9-]{1,80}$/.test(value[key]))
      throw new EnglishInputError("학습 단계를 확인해 주세요.");
  }
  if (!isEnglishLevel(value.level)) throw new EnglishInputError("난이도를 확인해 주세요.");
  if (
    value.answer !== undefined &&
    (typeof value.answer !== "string" || value.answer.length > 1200)
  )
    throw new EnglishInputError("답변은 1,200자 이내로 입력해 주세요.");
  if (value.selfConfirmed !== undefined && typeof value.selfConfirmed !== "boolean")
    throw new EnglishInputError("말하기 확인 내용을 확인해 주세요.");
  return {
    episodeId: value.episodeId as string,
    taskId: value.taskId as string,
    level: value.level,
    ...(typeof value.answer === "string" ? { answer: value.answer.trim() } : {}),
    ...(typeof value.selfConfirmed === "boolean" ? { selfConfirmed: value.selfConfirmed } : {}),
  };
}

function recordActivity(
  progress: EnglishProgress,
  kind: "tasks" | "reviews",
  now: Date,
): EnglishProgress {
  const today = englishDay(now);
  const activity = progress.dailyActivity[today] || { tasks: 0, reviews: 0 };
  return {
    ...progress,
    activeDates: [...new Set([...progress.activeDates, today])].sort().slice(-365),
    dailyActivity: {
      ...progress.dailyActivity,
      [today]: { ...activity, [kind]: activity[kind] + 1 },
    },
    updatedAt: now.toISOString(),
  };
}

export function setEnglishLevel(
  progress: EnglishProgress,
  level: unknown,
  now: Date = new Date(),
): EnglishProgress {
  if (!isEnglishLevel(level)) throw new EnglishInputError("난이도를 확인해 주세요.");
  return { ...progress, preferredLevel: level, updatedAt: now.toISOString() };
}

export function advanceEnglishProgress(
  progress: EnglishProgress,
  rawAttempt: unknown,
  episode: EnglishEpisode | undefined,
  now: Date = new Date(),
) {
  const attempt = validateEnglishAttempt(rawAttempt);
  if (!episode || attempt.episodeId !== episode.id)
    throw new EnglishInputError("이야기를 찾을 수 없습니다.");
  progress = reconcileEnglishProgress(progress, [episode]);
  const taskIndex = episode.tasks.findIndex((task) => task.id === attempt.taskId);
  if (taskIndex < 0) throw new EnglishInputError("학습 단계를 찾을 수 없습니다.");
  const task = episode.tasks[taskIndex];
  const saved = progress.episodes[episode.id];
  const completedTasks = saved?.completedTasks || [];
  const duplicate = completedTasks.includes(task.id);
  if (
    !duplicate &&
    episode.tasks.slice(0, taskIndex).some((previous) => !completedTasks.includes(previous.id))
  )
    throw new EnglishInputError("앞의 장면을 마친 뒤 이어서 진행해 주세요.", 409);
  const version = task.versions[attempt.level];
  let correct: boolean;
  if (task.skill === "speaking") {
    correct = attempt.selfConfirmed === true;
  } else if (version.options?.length) {
    if (
      !version.correctOption ||
      !version.options.some((option) => option.id === version.correctOption)
    )
      throw new Error("콘텐츠의 정답 설정을 확인하세요.");
    correct = attempt.answer === version.correctOption;
  } else {
    correct = englishAnswerAccepted(attempt.answer || "", version);
  }
  if (!correct)
    return {
      progress,
      correct: false,
      duplicate: false,
      consequence: "",
      feedback:
        task.skill === "speaking"
          ? "예문을 듣고 직접 말한 뒤 확인해 주세요. 음성 점수는 계산하지 않습니다."
          : task.skill === "writing"
            ? "필요한 정보가 모두 전달되었는지 확인해 주세요. 예문과 비교하며 다시 써 볼 수 있습니다."
            : "단서의 내용을 다시 확인해 보세요. 듣기 자료는 다시 재생할 수 있습니다.",
    };
  if (duplicate) {
    const day = englishDay(now);
    const alreadyPracticed = progress.practiceDates?.[task.id] === day;
    const next = alreadyPracticed
      ? progress
      : recordActivity(
          {
            ...progress,
            practiceDates: { ...progress.practiceDates, [task.id]: day },
          },
          "tasks",
          now,
        );
    return {
      progress: next,
      correct: true,
      duplicate: true,
      feedback: task.feedback,
      consequence: task.consequence,
    };
  }

  const nextTasks = [...completedTasks, task.id];
  const completedEpisode = episode.tasks.every((candidate) => nextTasks.includes(candidate.id));
  const completionRewarded = saved?.completionRewarded === true || !!saved?.completedAt;
  const newlyLearned = task.expressionIds.filter(
    (id) => !progress.learnedExpressionIds.includes(id),
  );
  const reviews = { ...progress.reviews };
  for (const id of newlyLearned) {
    if (!episode.expressions.some((expression) => expression.id === id))
      throw new Error("콘텐츠의 표현 연결을 확인하세요.");
    reviews[id] = { dueAt: new Date(now.getTime() + DAY_MS).toISOString(), successes: 0 };
  }
  const next = recordActivity(
    {
      ...progress,
      xp: progress.xp + 20 + (completedEpisode && !completionRewarded ? 30 : 0),
      episodes: {
        ...progress.episodes,
        [episode.id]: {
          completedTasks: nextTasks,
          level: attempt.level,
          updatedAt: now.toISOString(),
          completionRewarded: completionRewarded || completedEpisode,
          format: episode.format || "story",
          ...(completedEpisode ? { completedAt: now.toISOString() } : {}),
        },
      },
      skills: { ...progress.skills, [task.skill]: progress.skills[task.skill] + 1 },
      learnedExpressionIds: [...progress.learnedExpressionIds, ...newlyLearned],
      reviews,
      practiceDates: { ...progress.practiceDates, [task.id]: englishDay(now) },
    },
    "tasks",
    now,
  );
  return {
    progress: next,
    correct: true,
    duplicate: false,
    feedback: task.feedback,
    consequence: task.consequence,
  };
}

export function advanceEnglishReview(
  progress: EnglishProgress,
  expression: EnglishExpression | undefined,
  answer: unknown,
  now: Date = new Date(),
) {
  if (
    !expression ||
    !progress.learnedExpressionIds.includes(expression.id) ||
    !progress.reviews[expression.id]
  )
    throw new EnglishInputError("배운 표현 중에서 복습할 수 있습니다.");
  if (typeof answer !== "string" || answer.length > 1200 || !answer.trim())
    throw new EnglishInputError("복습 답변을 1,200자 이내로 입력해 주세요.");
  const review = progress.reviews[expression.id];
  if (Date.parse(review.dueAt) > now.getTime())
    throw new EnglishInputError("복습 시간이 되면 다시 연습할 수 있습니다.", 409);
  if ((progress.dailyActivity[englishDay(now)]?.reviews || 0) >= REVIEW_DAILY_LIMIT)
    throw new EnglishInputError("오늘 복습 20개를 마쳤습니다. 내일 이어서 연습해 주세요.", 429);
  const correct = englishAnswerAccepted(answer, { accepted: expression.accepted });
  const successes = correct ? review.successes + 1 : 0;
  const interval = correct ? REVIEW_INTERVALS[Math.min(successes, REVIEW_INTERVALS.length - 1)] : 1;
  const next = recordActivity(
    {
      ...progress,
      xp: progress.xp + (correct ? 5 : 0),
      reviews: {
        ...progress.reviews,
        [expression.id]: {
          dueAt: new Date(now.getTime() + interval * DAY_MS).toISOString(),
          successes,
          lastReviewedAt: now.toISOString(),
        },
      },
    },
    "reviews",
    now,
  );
  return {
    progress: next,
    correct,
    duplicate: false,
    feedback: correct
      ? "보기 없이 표현을 떠올렸어요. 다음 간격에 다시 만나세요."
      : `예문: ${expression.en} · 내일 다시 떠올려 보세요.`,
    consequence: "",
  };
}

export function getEnglishGrowth(progress: EnglishProgress, now: Date = new Date()) {
  let index = 0;
  while (index + 1 < GROWTH_THRESHOLDS.length && progress.xp >= GROWTH_THRESHOLDS[index + 1])
    index++;
  const active = new Set(progress.activeDates);
  let cursor = new Date(`${englishDay(now)}T00:00:00Z`);
  if (!active.has(cursor.toISOString().slice(0, 10))) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while (active.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  const today = progress.dailyActivity[englishDay(now)] || { tasks: 0, reviews: 0 };
  const extraLevels =
    index === GROWTH_THRESHOLDS.length - 1
      ? Math.floor((progress.xp - GROWTH_THRESHOLDS[index]) / 300)
      : 0;
  return {
    xp: progress.xp,
    level: index + 1 + extraLevels,
    title: GROWTH_TITLES[index],
    nextLevelXp: GROWTH_THRESHOLDS[index + 1] ?? GROWTH_THRESHOLDS[index] + (extraLevels + 1) * 300,
    streak,
    todayActivities: today.tasks + today.reviews,
    completedEpisodes: Object.values(progress.episodes).filter(
      (episode) => !!episode.completedAt && episode.format !== "practice",
    ).length,
    completedPractices: Object.values(progress.episodes).filter(
      (episode) => !!episode.completedAt && episode.format === "practice",
    ).length,
  };
}
