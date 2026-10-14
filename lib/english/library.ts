import { englishEpisodes } from "./catalog.ts";
import type { EnglishEpisodeSummary } from "@/components/english/hub";

/** Only catalogue copy crosses the public library's client boundary. */
export function englishLibrary(): EnglishEpisodeSummary[] {
  return englishEpisodes.map((episode) => ({
    id: episode.id,
    title: episode.title,
    englishTitle: episode.englishTitle,
    genre: episode.genre,
    genreLabel: episode.genreLabel,
    synopsis: episode.synopsis,
    minutes: episode.minutes,
    image: episode.image,
    imageAlt: episode.imageAlt,
    takeaway: episode.takeaway,
    taskCount: episode.tasks.length,
    skills: [...new Set(episode.tasks.map((task) => task.skill))],
  }));
}
