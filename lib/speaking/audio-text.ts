// Keep the displayed English unchanged; disambiguate only known lesson contexts.
export function speechText(text: string) {
  return text
    .replaceAll("/", " ")
    .replace(/\[.*?\]/g, "")
    .replace(/\bresume(?=\s+session\b)/gi, "résumé")
    .replace(/\b(your|a) resume\b/gi, "$1 résumé")
    .replace(/\bRoom 202\b/g, "Room two oh two")
    .replace(/\bRoom 201\b/g, "Room two oh one")
    .trim();
}
