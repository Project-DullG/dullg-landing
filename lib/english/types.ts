export type EnglishLevel = "starter" | "standard" | "challenge";
export type EnglishSkill = "reading" | "listening" | "writing" | "speaking";
export type EnglishGenre = "escape" | "mystery" | "fairytale" | "everyday" | "adventure";

export const englishLevels = [
  { id: "starter" as const, label: "입문", description: "짧은 문장과 한국어 도움" },
  { id: "standard" as const, label: "기본", description: "영어로 이해하고 짧게 표현" },
  { id: "challenge" as const, label: "도전", description: "긴 단서와 보기 없는 표현" },
];
export const englishSkills = {
  reading: { label: "읽기", en: "READ" },
  listening: { label: "듣기", en: "LISTEN" },
  writing: { label: "쓰기", en: "WRITE" },
  speaking: { label: "말하기", en: "SPEAK" },
} as const;

export type TaskVersion = {
  passage: string;
  translation: string;
  prompt: string;
  options?: { id: string; text: string }[];
  correctOption?: string;
  model: string;
  accepted?: string[];
  keywords?: string[][];
  starter?: string;
  tokens?: string[];
};
export type EnglishTask = {
  id: string;
  chapterId?: string;
  skill: EnglishSkill;
  title: string;
  speaker?: string;
  context: string;
  document?: string;
  feedback: string;
  consequence: string;
  expressionIds: string[];
  versions: Record<EnglishLevel, TaskVersion>;
};
export type EnglishChapter = {
  id: string;
  title: string;
  location: string;
  objective: string;
  story: string;
  storyEn: string;
  image: string;
  imageAlt: string;
  dialogue: { speaker: string; en: string; ko: string }[];
};
export type EnglishExpression = {
  id: string;
  en: string;
  ko: string;
  recall: string;
  accepted: string[];
};
export type EnglishEpisode = {
  id: string;
  format?: "story" | "practice";
  title: string;
  englishTitle: string;
  genre: EnglishGenre;
  genreLabel: string;
  synopsis: string;
  intro: string;
  ending: string;
  takeaway: string;
  minutes: number;
  image: string;
  imageAlt: string;
  accent: string;
  chapters?: EnglishChapter[];
  cast?: { name: string; role: string; motivation: string }[];
  debrief?: { question: string; model: string; modelKo: string };
  tasks: EnglishTask[];
  expressions: EnglishExpression[];
};

export type EnglishAttempt = {
  episodeId: string;
  taskId: string;
  level: EnglishLevel;
  answer?: string;
  selfConfirmed?: boolean;
};
export type EnglishProgress = {
  version: 1;
  xp: number;
  preferredLevel: EnglishLevel;
  episodes: Record<
    string,
    {
      completedTasks: string[];
      completedAt?: string;
      completionRewarded?: boolean;
      format?: "story" | "practice";
      level: EnglishLevel;
      updatedAt: string;
    }
  >;
  skills: Record<EnglishSkill, number>;
  learnedExpressionIds: string[];
  reviews: Record<string, { dueAt: string; successes: number; lastReviewedAt?: string }>;
  activeDates: string[];
  practiceDates: Record<string, string>;
  dailyActivity: Record<string, { tasks: number; reviews: number }>;
  updatedAt?: string;
};
