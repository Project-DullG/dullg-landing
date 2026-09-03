# Firebase 대시보드 — 보완 작업 목록

> 현재 상태: UI 완성, 실제 동작은 "준비 중" 다이얼로그로 차단됨

---

## 1. Firebase 프로젝트 설정

- [ ] [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
- [ ] Authentication → Sign-in method → Google 활성화
- [ ] Firestore Database 생성 (production mode)
- [ ] 프로젝트 설정 → 일반 → 웹 앱 추가 → config 값 복사

## 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 생성 후 값 입력:

```bash
cp .env.local.example .env.local
```

필요한 값:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase Console → 프로젝트 설정 → 일반 → 웹 앱
- `FIREBASE_ADMIN_*` — Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성

Vercel 환경변수에도 동일하게 추가:
```
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_ADMIN_PROJECT_ID
# ... (9개 모두)
```

## 3. 로그인 페이지 활성화

`app/login/page.tsx`에서 다이얼로그 코드를 실제 Firebase Auth 로직으로 교체:

```tsx
// 현재: 다이얼로그 표시
onClick={() => setShowDialog(true)}

// 변경: 실제 Google 로그인
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import { loginAction } from "@/app/actions/auth";

async function handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getClientAuth(), provider);
  const idToken = await result.user.getIdToken();
  await loginAction(idToken);
}
```

## 4. 원장 권한 설정

첫 로그인 후 Firebase UID 확인 → 원장 권한 부여:

```bash
node scripts/set-owner-claim.mjs <YOUR_FIREBASE_UID>
```

UID 확인 방법: Firebase Console → Authentication → Users → UID 열

## 5. Firestore 보안 규칙 배포

`firestore.rules` 파일을 Firebase Console에 적용:
- 방법 A: Firebase Console → Firestore → Rules → 붙여넣기 → 게시
- 방법 B:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase deploy --only firestore:rules
  ```

## 6. Firestore 인덱스 생성

다음 복합 인덱스가 필요할 수 있음 (쿼리 시 자동 에러 링크 제공):
- `grades`: `studentId` (ASC) + `date` (DESC)
- `students`: `classId` (ASC) + `createdAt` (DESC)

## 7. 추가 보완 사항

- [ ] 메인 사이트 헤더에 "학원 관리" 링크 추가 (원장 전용)
- [ ] 학원생 대량 등록 (CSV 업로드)
- [ ] 성적 수정/삭제 기능 (현재 입력만 가능)
- [ ] 성적 리포트 차트 (Chart.js 또는 Recharts)
- [ ] 학원 코드 표시 (설정 페이지에서 학원생에게 공유)
- [ ] 비밀번호 없는 학원생 초대 링크
