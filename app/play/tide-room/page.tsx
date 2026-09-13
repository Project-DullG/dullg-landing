import type { Metadata, Viewport } from "next";
import TideRoomGame from "@/components/tide-room/game";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c151d",
};
export const metadata: Metadata = {
  title: "유리 너머의 목소리 | 단서공방",
  description: "실종된 관측소 책임자를 찾는 1인 추리 게임.",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <div lang="ko">
      <TideRoomGame />
    </div>
  );
}
