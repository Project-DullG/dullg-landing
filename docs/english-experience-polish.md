# 영어 학습 경험 정리

2026-10-15, Asia/Seoul

## 화면의 역할

학습 홈은 오늘 이어 할 활동 하나를 먼저 보여준다. 가장 최근의 미완료 활동이 있으면 저장된 난이도와 코스 맥락을 유지한다. 미완료 활동 없이 코스 단원을 마쳤다면 그 코스의 다음 미완료 콘텐츠로 안내한다. 첫 이용자는 실제 이야기나 첫 코스의 짧은 부탁 연습을 시작한다. 전체 목록을 모두 마친 사람에게는 재연습임을 명확히 표시한다. AI가 능력을 진단하거나 개인화한 추천처럼 표현하지 않는다.

콘텐츠 찾기는 이야기 모험, 실전 회화, 문장과 표현, 읽기와 이해의 네 입구를 제공한다. 검색·분류·추가 조건을 사용하면 실제 결과 목록으로 전환하고 전체 25개 목록도 별도로 열 수 있다. 카드의 주요 동작은 안내 열기 하나다. 상세 안내에서 학습 목표와 난이도를 보고 시작한다. 예문·인물·줄거리·코스 연결은 필요한 사람이 펼쳐 본다.

학습 화면은 지금 할 일, 자료, 내 반응, 결과 순서로 정리한다. 이야기에서는 장면을 읽는 것과 사건을 해결한 것을 구별한다. 장 도입은 아직 하지 않은 행동의 결과를 먼저 알려주지 않으며, 성공 후 인물 반응과 다음 장면의 필요성을 보여준다. 난이도·인물·단서 노트와 같은 보조 기능은 학습 과제를 가리지 않게 둔다.

## 기록과 성장

오늘의 작은 목표는 장면 풀이와 표현 복습 세 활동이다. 기록에 있는 활동만 세고 이미 마친 활동의 중복 XP 규칙은 유지한다. 최근 7일은 실제 학습 날짜로 표시하며 기록이 없는 날을 활동한 것처럼 채우지 않는다. 연습 레벨·XP는 활동 기록이지 영어 실력 점수가 아니다. 표현 노트와 간격 복습은 홈에서 바로 연결된다. 콘텐츠·표현 수는 현재 공개 레지스트리와 필수 활동 ID에 대조한다.

월 2만~3만 원은 향후 패키지의 가격 목표다. 이번 개선은 콘텐츠 선택, 몰입, 완주, 다음 학습의 연결을 다듬는 작업이며 유료 구독 결제나 정기 신작 제공을 구현했다는 뜻은 아니다. 실제 이용자의 완주·재방문 피드백을 바탕으로 다음 원고와 제공 주기를 판단한다.

## 연습 콘텐츠의 새 그림

Built-in image_gen을 사용해 세 분류의 새 대표 그림을 생성했다. 원본 PNG는 Codex generated_images에 보존하고 웹용 WebP를 이 저장소에 저장했다. 각 그림은 1536×1024이며 기호·문자를 단서나 정답으로 사용하지 않는다. 실제 등장인물이나 모든 연습의 상황을 그대로 묘사하는 그림이 아니라 해당 분류의 분위기를 나타낸다.

- public/assets/english/practice-conversation-v2.webp: 베이커리에서 부탁을 말하고 듣는 두 사람.
- public/assets/english/practice-sentence-v2.webp: 빈 문장 타일과 노트로 생각을 정리하는 작업 공간.
- public/assets/english/practice-reading-v2.webp: 햇살이 드는 창가에서 책을 읽는 장면.

### 공통 최종 프롬프트

Use case: illustration-story. Asset type: category cover for a polished English learning web app. Wide 3:2 composition, original contemporary American 2D animated-film illustration, restrained hand-drawn ink lines, sophisticated cel shading, rounded expressive adult characters, soft paper grain, periwinkle and warm cream palette with coral accents, gentle daylight, rich visual storytelling but uncluttered, crop-safe main subjects in center, no lettering, no printed words, no symbols pretending to be letters, no logo, no watermark, no UI. Attractive to both teens and adults; not babyish, no existing studio characters.

### 분류별 최종 장면 프롬프트

Conversation: A friendly neighborhood bakery counter. A young adult customer in a pale blue jacket confidently explains a request to a smiling barista in a coral apron, who listens attentively. A pastry box, warm bread and a cup between them; human conversational gestures. Bright inviting atmosphere. Distinct from a rainy story cafe. The illustration communicates speaking and listening through the interaction.

Sentence: A sunlit creative desk in a tidy apartment. A thoughtful young adult arranging four blank colored paper tiles into a row with one hand, another hand holding a pencil above an open blank notebook. A tiny potted plant, blue mug and a few blank sticky notes. Composition emphasizes constructing an idea piece by piece, calm satisfying concentration. Absolutely no text or glyphs on any tile or page.

Reading: A cozy modern reading nook by a big sunny window. A young adult absorbed in an open illustrated book, with a second closed book and a small plant nearby. The open book has tasteful abstract landscape illustrations and no text. Beyond the window a quiet neighborhood and soft leafy trees. Inviting sense of discovering a world through reading, elegant contemporary animation style.


## 이야기 2장의 새 장면 그림

기존 대표 그림을 참조해 built-in image_gen으로 여섯 장면을 만들고 각 작품의 2장에 연결했다. 원본 인물·색감·공간을 이어가며 아직 해결하지 않은 행동은 준비와 확인으로 그렸다. 서점 장면은 손이 중복된 첫 결과를 사용하지 않고 두 손만 남도록 보정했다. 모든 최종 WebP는 public/assets/english/ 아래에 저장했다.

공통 프롬프트: Use case: illustration-story. Create a new second-chapter scene derived from this reference illustration. Preserve its art medium, cinematic wide composition, color palette, character identities/clothes where specified, architecture and time of day. This is a distinct later scene in the same story, not a thumbnail or an infographic. Original polished illustration for an English story game. No legible writing, no labels, no numbers, no watermark, no UI; all evidence is supplied as web text separately. Depict anticipation and cooperation, not a completed solution. No arbitrary new plot objects.

### bookshop-returns-v2.webp

Reference: bookshop.webp

Scene: Inside the same warm wooden coastal bookshop on a rainy evening. The dark-haired young visitor in the olive raincoat stands at the return counter, looking carefully between two closed books with blank paper return slips. Close enough to show a wall intercom beside the counter and the front door beyond. The visitor presses the intercom to ask the staff outside for help. Hana is outside clearing the entrance, so do not depict her standing inside. Neither slip nor book cover has readable text, and do not visually single out a correct book. Warm lamps contrast the blue wet street. The scene shows checking before taking the book.

### locker-desk-v2.webp

Reference: locker.webp

Scene: A closer scene at the same station lost-property verification desk. Preserve Mina, the young dark-haired staff member in the dark station uniform from the reference, now standing and patiently comparing two separate blank intake forms with a worried adult visitor in a simple coat. A sealed plain envelope stays closed on the desk, and blurred bags rest behind the desk. No readable receipts, no distinctive silver star or food clues, no visible contents of a private letter, no confident returned-bag handover yet. Teal lockers and rainy train-platform windows remain in the background. Friendly competence and an careful verification process.

### moonpost-landing-v2.webp

Reference: moonpost.webp

Scene: A watercolor fairy-tale scene on the moonlit wooden landing beside the tree post office, with the same magical lake, tiny warm lanterns and luminous foliage. A friendly anthropomorphic owl Captain Fern in a simple navy captain jacket stands next to a moored small wooden boat and patiently explains the journey. Foreground is a courier's paws holding a sealed envelope, as a first-person delivery viewpoint; do not portray the little rabbit sender boarding. The boat is still tied to the dock and stationary, before departure. No readable route map, destination text, shell path, decisive lamp colors, or bell numbers. Preserve the illustrated storybook softness of the reference, not photorealism.

### cafe-counter-v2.webp

Reference: cafe.webp

Scene: A later scene at the same rainy seaside cafe counter. Preserve Leo, the young curly-haired male barista in the warm apron from the reference. He listens carefully to a slightly older female cafe manager Maya in a navy cardigan holding a blank clipboard, while a drink-order slip and an empty tray lie between them. A few ordinary cups remain blurred behind the counter, no exact guest or cup count, no food served yet. Show checking the request before preparing an order. Warm lamps, wooden counter, books and rain on the seaside window maintain the atmosphere. No readable menu or written allergy claim, no labeled ingredients, no implied safety guarantee.

### radio-noticeboard-v2.webp

Reference: radio.webp

Scene: A later scene at the event noticeboard in the same cozy vintage coastal radio room at twilight. Preserve Iris, the short dark-haired woman in a burgundy sweater, and Ben, the curly-haired man in an olive shirt, from the reference. They stand side by side comparing a clean current event poster and an older folded paper while Ben holds a phone with a blank screen to listen to the organizer's reply. Several blank notes sit beneath the poster. No readable event dates, times, venue, numbers or text, and no visual answer highlighted. Keep the vintage audio equipment and blue dusk harbor through the windows, thoughtful cooperative mood.

### garden-seedlings-v2.webp

Reference: garden.webp

Scene: A later scene at a seedling table in the same sunlit glasshouse. Preserve Ada, the kind elderly gardener with a silver braid, cream shirt and olive apron. She gently points toward care cards next to three modest seedling pots while a visiting adult's hand hovers with a pencil over an open blank notebook. A blue watering can rests to the side, not pouring; the tool was already retrieved in the earlier chapter. No readable labels, no numerical measures, no A/B/C letters, no visible answer about which pot to water, no strongly dry or soaked soil contrast. Warm dappled sunlight, green vines, glass arches and coastal landscape preserve the calm practical storybook mood. Show checking and recording before acting.

서점 최종 보정 프롬프트: Precise edit to correct anatomy only in this bookshop illustration. The young visitor must have exactly TWO arms and TWO hands. Her RIGHT hand presses the wall intercom. Her LEFT hand rests naturally beside two closed books lying flat together on the counter. Remove both the floating held books and the extra hand currently holding the red book. The two books must be on the counter only, with two plain return slips and no readable writing. Keep the same visitor identity, olive raincoat, warm bookstore, evening rain, cinematic lighting, composition and illustration style. No other people. No extra limbs, no new text or labels.

