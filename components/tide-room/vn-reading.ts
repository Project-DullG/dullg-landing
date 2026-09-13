export type OpeningScene = {
  id: string;
  title: string;
  action: string;
  dialogue: { speaker: string; text: string }[];
  newInformation: string;
  continueLabel: string;
};
export type OpeningBeat = {
  id: string;
  speaker: string;
  text: string;
  kind: "narration" | "dialogue" | "note";
};

// Every page is an unchanged slice of the input, including surrounding whitespace.
export function paginateText(text: string, target = 180): string[] {
  if (!text) return [];
  const limit = Number.isFinite(target) && target > 0 ? Math.floor(target) : 180;
  const boundaries = new Map<number, boolean>();
  const paragraphs =
    /(?:\r\n|\n|\r(?!\n))[\t ]*(?:\r\n|\n|\r(?!\n))(?:[\t ]*(?:\r\n|\n|\r(?!\n)))*/g;
  const sentences = /[.!?。！？]+[”’"'」』〉》）)\]}】]*(?:\s+|$)/gu;
  for (const match of text.matchAll(paragraphs))
    boundaries.set(match.index + match[0].length, true);
  for (const match of text.matchAll(sentences)) {
    // An ellipsis can be a hesitation within a sentence, so keep it intact.
    if (match[0].startsWith("..")) continue;
    // Decimal points never match above; do not treat a numbered item or a
    // common Latin abbreviation as a complete sentence either.
    if (match[0].startsWith(".")) {
      const prefix = text.slice(0, match.index);
      if (/(?:^|\n)[\t ]*\d+$/.test(prefix)) continue;
      if (/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)$/i.test(prefix)) continue;
      if (/(?:\b[A-Za-z]\.)+[A-Za-z]$/.test(prefix)) continue;
    }
    const end = match.index + match[0].length;
    if (!boundaries.has(end)) boundaries.set(end, false);
  }
  if (!boundaries.has(text.length)) boundaries.set(text.length, false);
  const pages: string[] = [];
  let start = 0;
  let page = "";
  for (const [end, paragraphEnd] of [...boundaries].sort((a, b) => a[0] - b[0])) {
    const sentence = text.slice(start, end);
    start = end;
    if (page.trim() && sentence.trim() && page.length + sentence.length > limit) {
      pages.push(page);
      page = "";
    }
    page += sentence;
    if (paragraphEnd && page.trim()) {
      pages.push(page);
      page = "";
    }
  }
  if (page) {
    if (!page.trim() && pages.length) pages[pages.length - 1] += page;
    else pages.push(page);
  }
  return pages;
}

export function openingBeats(scene: OpeningScene): OpeningBeat[] {
  const beats: OpeningBeat[] = paginateText(scene.action)
    .filter((text) => text.trim())
    .map((text, index) => ({
      id: `${scene.id}:action:${index + 1}`,
      speaker: "",
      text,
      kind: "narration",
    }));
  scene.dialogue.forEach(({ speaker, text }, index) => {
    if (!text.trim()) return;
    beats.push({
      id: `${scene.id}:dialogue:${index + 1}`,
      speaker,
      text,
      kind: "dialogue",
    });
  });
  if (scene.newInformation.trim())
    beats.push({
      id: `${scene.id}:note`,
      speaker: "",
      text: scene.newInformation,
      kind: "note",
    });
  return beats;
}
