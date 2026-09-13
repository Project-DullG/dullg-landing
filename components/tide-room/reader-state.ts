import { people, type Person } from "./content";
import prose from "./prose.json";
import { openingBeats, paginateText } from "./vn-reading";
type Entry = { text: string; speaker: string; person?: Person };
export type ReaderState = {
  intro: number | null;
  introPage: number;
  entry: Entry | null;
  page: number;
  person: Person | null;
  readLog: Entry[];
};
export function parseReaderState(raw: string | null, events: string[]): ReaderState | null {
  if (!raw || raw.length > 500000) return null;
  try {
    const v = JSON.parse(raw);
    const textEntry = (x: unknown): x is Entry =>
      !!x &&
      typeof x === "object" &&
      "text" in x &&
      typeof x.text === "string" &&
      x.text.length <= 30000 &&
      "speaker" in x &&
      typeof x.speaker === "string" &&
      x.speaker.length < 200 &&
      (!("person" in x) || (typeof x.person === "string" && x.person in people));
    if (
      JSON.stringify(v.events) === JSON.stringify(events) &&
      (v.intro === null ||
        (Number.isInteger(v.intro) && v.intro >= 0 && v.intro < prose.openingScenes.length)) &&
      Number.isInteger(v.introPage) &&
      v.introPage >= 0 &&
      (v.intro === null || v.introPage < openingBeats(prose.openingScenes[v.intro]).length) &&
      (v.entry === null || textEntry(v.entry)) &&
      Number.isInteger(v.page) &&
      v.page >= 0 &&
      (v.entry === null || v.page < paginateText(v.entry.text).length) &&
      (v.person === null || (typeof v.person === "string" && v.person in people))
    ) {
      return {
        intro: v.intro,
        introPage: v.introPage,
        entry: v.entry,
        page: v.page,
        person: v.person,
        readLog: Array.isArray(v.readLog) ? v.readLog.filter(textEntry).slice(-300) : [],
      };
    }
  } catch {
    /* Corrupt presentation data never invalidates investigation progress. */
  }
  return null;
}
