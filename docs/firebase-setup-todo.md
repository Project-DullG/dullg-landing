# Firebase 대시보드 — 보완 작업 목록

> 현재 상태 (2026-09-03): 프로젝트 `cluedullg-web` 생성됨, 로그인 페이지는 실제 Google 로그인으로 교체됨.
> 남은 것: `.env.local` 값 채우기, Google 로그인/Firestore 활성화, 규칙·인덱스 배포, 원장 권한 부여.

---

## 1. Firebase 프로젝트 설정

- [x] [Firebase Console](https://console.firebase.google.com/project/cluedullg-web/overview?hl=ko)에서 프로젝트 생성 → `cluedullg-web`
- [ ] Authentication → 시작하기 → Sign-in method → Google 활성화 (콘솔에서만 가능)
- [x] Firestore Database 생성 — `(default)`, asia-northeast3 (2026-09-03)
- [x] 웹 앱 `DullG Web` 등록, `.env.local` 채움 (2026-09-03)

## 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 생성 후 값 입력:

```bash
cp .env.local.example .env.local
```

빠르게 채우는 방법 (Firebase CLI 로그인 필요, `firebase login`):

```bash
# 웹 앱 config → NEXT_PUBLIC_FIREBASE_* (웹 앱이 없으면 firebase apps:create web dullg-web 먼저)
firebase apps:sdkconfig web --json > /tmp/web.json
# 서비스 계정 키: Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성 → JSON 다운로드
node scripts/setup-env.mjs ~/Downloads/cluedullg-web-firebase-adminsdk-*.json --web /tmp/web.json
```

수동으로 채울 때:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase Console → 프로젝트 설정 → 일반 → 웹 앱
- `FIREBASE_ADMIN_*` — Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성

Vercel 환경변수에도 동일하게 추가:
```
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_ADMIN_PROJECT_ID
# ... (9개 모두)
```

## 3. 로그인 페이지 활성화

- [x] `app/login/page.tsx`가 `signInWithPopup` + `loginAction`으로 동작함 (2026-09-03)
- [ ] 배포 도메인을 Authentication → Settings → 승인된 도메인에 추가 (localhost는 기본 포함)

## 4. 원장 권한 설정

첫 로그인 후 Firebase UID 확인 → 원장 권한 부여:

```bash
node scripts/set-owner-claim.mjs <YOUR_FIREBASE_UID>
```

UID 확인 방법: Firebase Console → Authentication → Users → UID 열

## 5. Firestore 보안 규칙 배포

- [x] 규칙·인덱스 배포 완료 (2026-09-03)

`firebase.json` / `.firebaserc`가 `cluedullg-web`을 가리키므로 한 번에 배포:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

(콘솔에서 직접 붙여넣어도 됨: Firestore → Rules → 게시)

## 6. Firestore 인덱스 생성

`firestore.indexes.json`에 정의됨 — 위 명령으로 함께 배포:
- `grades`: `studentId` (ASC) + `date` (DESC) — `where(studentId) + orderBy(date desc)` 쿼리용

`students`의 `classId ==`, `name == && userId ==` 는 등호 전용이라 복합 인덱스 불필요.

## 7. 추가 보완 사항

- [ ] 메인 사이트 헤더에 "학원 관리" 링크 추가 (원장 전용)
- [ ] 학원생 대량 등록 (CSV 업로드)
- [ ] 성적 수정/삭제 기능 (현재 입력만 가능)
- [ ] 성적 리포트 차트 (Chart.js 또는 Recharts)
- [ ] 학원 코드 표시 (설정 페이지에서 학원생에게 공유)
- [ ] 비밀번호 없는 학원생 초대 링크
