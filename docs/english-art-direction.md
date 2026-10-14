# 첫 번째 페이지 · 그림 제작 기록

2026-10-14, 내장 image_gen으로 생성했다. 생성 원본은 Codex generated_images에 보관하고, 작품에 사용하는 최종 파일은 public/assets/english에 WebP로 인코딩했다. 웹페이지의 텍스트·아이콘·문서는 HTML/CSS로 제작했다.

| 작품 | 최종 파일 | 화면에서의 역할 |
| --- | --- | --- |
| 닫힌 서점의 밤 | `public/assets/english/bookshop.webp` | 따뜻한 일상 애니메이션 분위기의 서점 도입 장면 |
| 7번 보관함의 편지 | `public/assets/english/locker.webp` | 기록과 편지를 조사하는 추리 장르의 분실물 안내소 |
| 달빛 우체국 | `public/assets/english/moonpost.webp` | 나무 우체국·여우 직원·토끼가 등장하는 그림책 분위기 |

그림은 장소를 소개하는 도입 장면이다. 진행에 필요한 실제 단서와 인물의 메시지는 읽을 수 있는 문서와 대화 화면에 제공한다. 문이 열린 그림을 닫힌 문의 조사 지도로 설명하거나, 그림에 없는 물건을 이미지 대체 텍스트에 적지 않는다.

## 사용한 프롬프트

### 서점

Use case: illustration-story. Asset type: final wide 16:9 background and cover for a premium original English-learning story game titled Closed Bookshop (do not put title in image). Scene: a small American coastal-town bookshop at rainy blue hour, seen from inside. Foreground wooden counter with open ledger and brass bell, book-filled shelves framing composition, glass side door at far right with a clearly visible old brass latch, warm lamps, rain on shopfront windows reflecting a quiet street. A friendly bookshop owner woman in her thirties wearing cardigan and a curious young adult visitor in a raincoat are small but readable characters in middle ground, not blocking the props. Art direction: polished contemporary American 2D animated film background, sophisticated hand-painted texture, clean appealing character drawing, cinematic deep navy and honey-gold lighting, rich environmental detail, warm and intriguing rather than frightening. Exactly one coherent scene, landscape composition spacious for UI overlaid later. No typography, no logos, no watermarks, no collage, no interface. World and physics coherent, high-quality final artwork.

### 분실물 안내소

Use case: illustration-story. Asset type: final wide 16:9 scene and cover for an original English-learning mystery about a misdelivered letter in a town station's lost-property lockers. A tasteful cinematic Japanese-style illustrated detective scene at dusk, teal rain outside tall station windows, warm amber light indoors, dark wooden lost property counter, row of seven vintage teal lockers and a single red envelope visibly tucked in the slightly open last locker, paper receipt on counter and brass desk lamp, a friendly female station clerk behind the desk in a dark uniform. Environmental illustration with precise believable perspective, detailed materials and strong atmospheric lighting, polished premium visual-novel quality, character is secondary to environment. Story tone gentle curious investigation, not murder. Leave a clean central readable region, landscape artwork, no words/numbers/text even on papers/lockers, no lettering no logos no watermark no UI and no collage. Full-resolution beautiful painted artwork.

### 달빛 우체국

Use case: illustration-story. Asset type: final wide 16:9 illustration for a premium original English-learning fairy tale, The Moonlight Post Office. A tiny cozy post office built into the roots of an enormous old tree beside a silver-blue lake, night sky with a large softly glowing crescent moon. A little fox postal worker in indigo waistcoat carefully receives a golden sealed letter from a small rabbit visitor with satchel at the doorway. A lantern-lit wooden bridge crosses the lake toward a small hill, fireflies make a faint path; mail cubbies and warm windows visible. Premium hand-painted children's picture-book art, watercolor and gouache on subtly textured paper, graceful delicate linework, wondrous quiet atmosphere, muted midnight indigo, sage and soft warm gold. Physically coherent architecture, approachable all-ages fantasy, beautiful detailed full scene, generous landscape framing. No words, no lettering, no numbers, no logo no watermark no UI, not 3D or photorealistic.

## 음성 제공 방식

새 이야기는 현재 기기의 영어 음성 합성으로 듣기를 제공한다. 사용자가 시작한 재생만 수행하며, 지원하지 않거나 실패하면 대본으로 진행할 수 있다. 제작한 원어민 음원이 있다고 표시하지 않는다. 기존 TOEIC 과정의 제작 음성은 기존 과정에서 유지한다. 말하기 녹음은 선택 사항이며 기기 내 임시 재생만 제공한다. 서버 업로드·음성 인식·발음 자동 점수는 제공하지 않는다.

## 공유 이미지의 글꼴

기존 저장소의 NanumGothic-Bold.ttf에서 공유 이미지에 필요한 글자를 추출했다. 수정한 서브셋은 예약 글꼴 이름을 사용하지 않도록 English Journal OG로 이름을 변경했고, 원본 저작권과 SIL Open Font License를 public/fonts/OFL-NanumGothic.txt에 보존했다. 최종 파일은 public/fonts/english-journal-og-bold.ttf다.
