# Firebase 대시보드 설계: 학원생 등록 & 성적 관리

> **작성일:** 2026-09-03
> **상태:** Draft
> **범위:** Google 로그인, Firebase 연동, 학원생 등록, 성적 입력/관리 대시보드

---

## 1. 개요

DullG 사이트에 학원 관리 대시보드를 추가한다. 원장이 학원생을 등록하고, DullG 수업 성적 및 일반 시험 성적을 입력·관리할 수 있다. 학원생은 본인 성적을 조회할 수 있다.

### 핵심 결정사항

| 항목 | 결정 |
|------|------|
| 인증 | Firebase Auth (Google 로그인) |
| 데이터베이스 | Firestore |
| 서버 로직 | Firebase Admin SDK + Next.js Server Actions |
| 배포 | Vercel (기존 유지) |
| 사용자 역할 | 원장 (owner) + 학원생 (student) |
| 라우팅 | `/dashboard` 하위에 분리 |

### 기존 인프라와의 관계

프로젝트에 vinext + Cloudflare Workers 설정 파일이 남아있으나, 실제 배포는 Vercel을 사용 중이다. 기존 Drizzle ORM + Cloudflare D1 설정(db/ 디렉토리)은 현재 사용하지 않으며 스키마도 비어있다. 학원 관리 기능의 데이터는 Firebase Firestore에 저장한다. 기존 D1 설정은 그대로 유지하되 이번 작업에서는 사용하지 않는다.

---

## 2. 기술 아키텍처

### 2.1 Firebase 구성

**새로운 의존성:**
- `firebase` — 클라이언트 SDK (Auth)
- `firebase-admin` — 서버 SDK (Admin, Vercel Node.js 런타임에서 실행)

**환경변수 (클라이언트용):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**환경변수 (서버용):**
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

### 2.2 새로운 파일 구조

```
lib/
  firebase/
    config.ts              # Firebase 클라이언트 초기화
    admin.ts               # Firebase Admin SDK 초기화 (서버 전용)
    auth.ts                # 인증 유틸리티 (세션 관리, 토큰 검증)

app/
  login/
    page.tsx               # 로그인 페이지 (Google 로그인 버튼)

  dashboard/
    layout.tsx             # 사이드바 레이아웃 + 인증 체크
    loading.tsx            # 대시보드 로딩 스켈레톤
    page.tsx               # 메인 (학원 개요, 최근 활동)
    │
    students/
      page.tsx             # 학원생 목록 (검색, 필터, 반별)
      [studentId]/
        page.tsx           # 학생 상세 (정보 + 성적 이력)
    │
    classes/
      page.tsx             # 반 관리 (생성, 수정, 학생 배정)
    │
    grades/
      page.tsx             # 성적 입력 (학생 선택 → 성적 입력)
      report/
        page.tsx           # 성적 리포트 (반별, 기간별 통계)
    │
    settings/
      page.tsx             # 학원 설정 (이름, 정보 수정)
    │
    my/
      page.tsx             # 학원생 전용: 본인 성적 조회

  actions/
    auth.ts                # 인증 관련 Server Actions
    students.ts            # 학원생 CRUD Server Actions
    classes.ts             # 반 관리 Server Actions
    grades.ts              # 성적 CRUD Server Actions

middleware.ts              # 라우트 보호 (인증 검증)
```

### 2.3 인증 흐름

```
[사용자] → /dashboard 접근
    ↓
[middleware.ts] 쿠키에서 세션 토큰 확인
    ↓ (토큰 없음)
[리다이렉트] → /login
    ↓
[login/page.tsx] Google 로그인 버튼 클릭
    ↓
[Firebase Auth] Google OAuth → ID 토큰 발급
    ↓
[Server Action: auth.ts] ID 토큰 → Firebase Admin으로 검증
    → admin.auth().createSessionCookie(idToken, { expiresIn })
    → 세션 쿠키 설정 (httpOnly, secure, sameSite: "lax", maxAge: 5일)
    → Custom Claims 확인 (role: owner | student)
    ↓
[리다이렉트] → /dashboard (원장) 또는 /dashboard/my (학원생)
```

### 2.4 세션 관리

- **세션 쿠키 유효기간:** 5일 (`expiresIn: 60 * 60 * 24 * 5 * 1000`)
- **쿠키 속성:** `httpOnly: true`, `secure: true`, `sameSite: "lax"`, `path: "/"`
- **갱신:** 세션 만료 시 자동 로그아웃 → `/login` 리다이렉트
- **로그아웃:** 쿠키 삭제 + Firebase 클라이언트 signOut()

### 2.5 원장 권한 부여

초기 단계에서는 Firebase Console에서 수동으로 Custom Claims 설정:

```javascript
// Firebase Console > Functions Shell 또는 별도 스크립트
admin.auth().setCustomUserClaims(uid, { role: "owner", academyId: "xxx" })
```

향후 필요 시 초대 시스템으로 확장 가능.

### 2.6 원장 온보딩 흐름

1. Firebase Console에서 원장 계정에 `{ role: "owner" }` Custom Claim 설정
2. 원장이 `/login`에서 Google 로그인
3. 첫 로그인 시 소유 학원(academy) 문서가 없으면 → 학원 생성 폼 표시
4. 학원명 입력 → Firestore에 `academies/{academyId}` 문서 생성 (`ownerId: uid`)
5. Custom Claims에 `academyId` 추가 → 이후 로그인부터 자동 진입

---

## 3. 데이터 모델 (Firestore)

### 3.1 컬렉션 구조

```
academies/{academyId}
  ├── name: string              # 학원명
  ├── ownerId: string           # Firebase UID (원장)
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  │
  ├── students (subcollection)
  │     └── {studentId}
  │           ├── name: string          # 학생 이름
  │           ├── grade: number         # 학년 (1~12)
  │           ├── parentContact: string # 학부모 연락처
  │           ├── classId: string       # 소속 반 ID
  │           ├── userId: string | null # Google 계정 연결 시 Firebase UID
  │           ├── createdAt: Timestamp
  │           └── updatedAt: Timestamp
  │
  ├── classes (subcollection)
  │     └── {classId}
  │           ├── name: string          # 반 이름 (예: "초등 3-4학년 A반")
  │           └── createdAt: Timestamp
  │
  └── grades (subcollection)
        └── {gradeId}
              ├── studentId: string     # 대상 학생 ID
              ├── userId: string | null # 학생의 Firebase UID (Security Rules용)
              ├── type: "dullg" | "exam"
              │
              │  # type === "dullg"
              ├── session: number        # 차시 (1~4)
              ├── score: number          # 점수 (0~100)
              ├── participation: string  # 참여도 ("상" | "중" | "하")
              ├── note: string           # 메모
              │
              │  # type === "exam"
              ├── subject: string        # 과목명
              ├── examName: string       # 시험명 (예: "중간고사")
              ├── score: number          # 점수 (0 이상)
              ├── totalScore: number     # 만점 기준 (0 이상)
              │
              ├── date: Timestamp        # 평가일
              └── createdAt: Timestamp
```

### 3.2 설계 근거

- **academies를 최상위 컬렉션**: 한 원장이 여러 학원을 관리할 수 있는 확장성 확보
- **subcollection 패턴**: 학원 단위로 데이터 격리, Security Rules 적용 용이, 쿼리 범위 자동 제한
- **grades에 type 필드**: DullG 수업 성적과 일반 시험 성적을 하나의 컬렉션에서 구분. 타입별 필드는 해당 타입에만 존재
- **userId nullable**: 학원생이 Google 계정 연결 전에도 원장이 먼저 등록 가능
- **grades에 userId 필드 추가**: Security Rules에서 학원생이 본인 성적만 조회할 수 있도록 직접 비교. 성적 입력 시 해당 학생의 userId를 함께 저장

### 3.3 유효성 검증 규칙

| 필드 | 제약 |
|------|------|
| `students.grade` | 정수, 1~12 |
| `students.parentContact` | 문자열, 비어있지 않음 |
| `grades.session` (DullG) | 정수, 1~4 |
| `grades.score` | 숫자, 0 이상 |
| `grades.totalScore` (exam) | 숫자, 0 이상 |
| `grades.participation` (DullG) | "상" \| "중" \| "하" |
| `grades.type` | "dullg" \| "exam" |

Server Actions에서 입력값 검증 후 Firestore에 저장. 클라이언트에서도 동일한 검증을 즉시 피드백으로 제공.

---

## 4. 기능 명세

### 4.1 원장 기능

#### 학원생 관리
| 기능 | 설명 |
|------|------|
| 학원생 등록 | 이름, 학년, 학부모 연락처, 반 배정 입력 |
| 학원생 목록 | 전체 목록 조회, 반별 필터, 이름 검색. 페이지당 20명, 커서 기반 페이지네이션 |
| 학원생 수정 | 기본 정보 수정, 반 변경 |
| 학원생 삭제 | 확인 다이얼로그 후 삭제 (관련 성적 데이터도 함께 삭제) |
| 학원생 상세 | 학생 정보 + 성적 이력 타임라인 |

#### 반 관리
| 기능 | 설명 |
|------|------|
| 반 생성 | 반 이름 입력 |
| 반 목록 | 전체 반 + 소속 학생 수 표시 |
| 반 수정/삭제 | 이름 변경, 빈 반만 삭제 가능 |

#### 성적 관리
| 기능 | 설명 |
|------|------|
| DullG 성적 입력 | 학생 선택 → 차시(1~4), 점수, 참여도, 메모 |
| 일반 시험 입력 | 학생 선택 → 과목, 시험명, 점수/만점, 날짜 |
| 성적 리포트 | 반별 평균, 개인별 추이, 기간별 통계. 페이지당 50건, 커서 기반 페이지네이션 |

#### 학원 설정
| 기능 | 설명 |
|------|------|
| 학원 정보 수정 | 학원명 변경 |

### 4.2 학원생 기능

#### 계정 연결 흐름

1. 원장이 학원생을 등록 (이 시점에서 `userId`는 null)
2. 원장이 학원생에게 로그인 안내 (구두 또는 링크 공유)
3. 학원생이 `/login`에서 Google 로그인
4. 첫 로그인 시 학원생 연결 화면 표시: 학원 코드 + 본인 이름 입력
5. Server Action에서 해당 학원의 students 중 이름이 일치하고 userId가 null인 문서 검색
6. 매칭되면 `userId`에 Firebase UID 기록 + Custom Claims에 `{ role: "student", academyId, studentId }` 설정
7. 이후 로그인부터 자동으로 `/dashboard/my`로 진입

#### 본인 성적 조회 (`/dashboard/my`)
| 기능 | 설명 |
|------|------|
| DullG 성적 확인 | 차시별 점수, 참여도, 메모 |
| 일반 시험 성적 확인 | 과목별 점수, 추이 그래프 |

---

## 5. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 헬퍼 함수
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwnerRole() {
      return isAuthenticated() && request.auth.token.role == "owner";
    }

    function isAcademyOwner(academyId) {
      return isAuthenticated()
        && get(/databases/$(database)/documents/academies/$(academyId)).data.ownerId == request.auth.uid;
    }

    function isLinkedStudent(academyId, studentId) {
      return isAuthenticated()
        && get(/databases/$(database)/documents/academies/$(academyId)/students/$(studentId)).data.userId == request.auth.uid;
    }

    function isAcademyStudent(academyId) {
      return isAuthenticated()
        && request.auth.token.role == "student"
        && request.auth.token.academyId == academyId;
    }

    // 학원
    match /academies/{academyId} {
      allow create: if isOwnerRole();
      allow read, update, delete: if isAcademyOwner(academyId);
      // 학원생도 소속 학원 정보 읽기 가능
      allow read: if isAcademyStudent(academyId);

      // 학원생
      match /students/{studentId} {
        allow read, write: if isAcademyOwner(academyId);
        allow read: if isLinkedStudent(academyId, studentId);
      }

      // 반
      match /classes/{classId} {
        allow read, write: if isAcademyOwner(academyId);
        // 소속 학원의 학원생만 반 정보 읽기 가능
        allow read: if isAcademyStudent(academyId);
      }

      // 성적
      match /grades/{gradeId} {
        allow read, write: if isAcademyOwner(academyId);
        // 학원생은 본인 성적만 읽기 (grades 문서의 userId로 직접 비교)
        allow read: if isAuthenticated()
          && resource.data.userId == request.auth.uid;
      }
    }
  }
}
```

---

## 6. 에러 처리

| 상황 | 처리 |
|------|------|
| 인증 토큰 만료 | 세션 쿠키 만료 → `/login` 리다이렉트 |
| 권한 없음 (403) | "접근 권한이 없습니다" 안내 + 로그인 페이지 링크 |
| 폼 유효성 실패 | 클라이언트 즉시 피드백 + Server Action에서 이중 검증 |
| Firestore 쓰기 실패 | 토스트 알림 + 재시도 버튼 |
| 네트워크 오류 | 오프라인 안내 메시지 |
| 학원생 연결 실패 | "일치하는 학생 정보를 찾을 수 없습니다" 안내 + 원장에게 문의 유도 |

---

## 7. UI 방향

- **레이아웃**: 대시보드 전용 사이드바 레이아웃 (기존 랜딩 헤더/푸터와 별개)
- **디자인 토큰**: 기존 `globals.css` 토큰 재사용 (`--ink`, `--cream`, `--mint`, `--orange`)
- **컴포넌트**: 테이블, 폼, 카드, 모달 중심의 관리 UI
- **반응형**: 모바일에서는 사이드바 → 햄버거 메뉴
- **로딩 상태**: `loading.tsx`로 스켈레톤 UI 제공, 데이터 페칭 시 Suspense 경계 활용

---

## 8. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), Vercel 배포 |
| 인증 | Firebase Auth (Google Provider) + Admin SDK |
| 데이터베이스 | Firestore |
| 서버 로직 | Firebase Admin SDK + Next.js Server Actions |
| 라우트 보호 | Next.js Middleware (`admin.auth().verifySessionCookie()`) |
| 상태 관리 | React 서버 컴포넌트 + 최소한의 클라이언트 상태 |
| 페이지네이션 | Firestore 커서 기반 (`startAfter`, 페이지당 20~50건) |

---

## 9. 범위 외 (향후 확장)

- 학원생 초대 링크/코드 시스템 (현재는 이름 매칭 방식)
- 원장 간 학원 공유/위임
- 출결 관리
- 학부모 알림 (카카오톡/SMS)
- 성적표 PDF 출력
- 다중 학원 전환 UI
