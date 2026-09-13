import { FileText, MessageCircle, Check } from "lucide-react";
import { Button } from "./ui";
import { clueById } from "./content";
import { detailImages, shortNames } from "./presentation";
import { detailThumb } from "./scene-assets";
export function EvidenceCard({
  id,
  selected,
  onRead,
  onSelect,
}: {
  id: string;
  selected: boolean;
  onRead: () => void;
  onSelect: () => void;
}) {
  const clue = clueById[id];
  return (
    <div
      className={`evidence-card ${selected ? "is-selected" : ""}`}
      role="group"
      aria-label={clue.title}
    >
      <Button className="inventory-slot" onClick={onRead} aria-label={`${clue.title} 읽기`}>
        {detailImages[id] ? (
          <img src={detailThumb(id)} alt="" loading="lazy" decoding="async" />
        ) : ["closure", "echo", "response", "pin-confession", "elliot-account"].includes(id) ? (
          <MessageCircle />
        ) : (
          <FileText />
        )}
        <span>{shortNames[id] || clue.title}</span>
        <small>열어 읽기</small>
      </Button>
      <Button
        className="evidence-select"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${clue.title} ${selected ? "선택 해제" : "고르기"}`}
      >
        {selected && <Check />}
        {selected ? "선택 해제" : "고르기"}
      </Button>
    </div>
  );
}
