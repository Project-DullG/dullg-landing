import { useLocale } from "next-intl";
export function SourceLanguageNote({ kind = "materials" }: { kind?: "materials" | "game" }) {
  if (useLocale() !== "en") return null;
  return (
    <p className="source-language-note" lang="en">
      {kind === "game"
        ? "This introduction is translated into English. The original game, artwork, and trailer are in Korean."
        : "The original slides, images, and downloadable files are in Korean."}
    </p>
  );
}
