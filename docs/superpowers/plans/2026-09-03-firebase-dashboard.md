# Firebase Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google login, student registration, and grade management dashboard to the DullG site using Firebase Auth + Firestore.

**Architecture:** Firebase Client SDK handles Google login on the client. Firebase Admin SDK runs in Next.js Server Actions (Vercel Node.js runtime) for session cookies and Firestore writes. Next.js Middleware protects `/dashboard/*` routes. Dashboard uses a separate sidebar layout from the public site.

**Tech Stack:** Next.js 16 (App Router), Firebase Auth, Firestore, Firebase Admin SDK, Next.js Middleware, TypeScript

**Spec:** `docs/superpowers/specs/2026-09-03-firebase-dashboard-design.md`

**Security model:** Middleware checks cookie existence only (Edge runtime cannot run firebase-admin). Actual token verification happens via `verifySession()` in each dashboard page's server component. This is intentional — middleware provides UX convenience (fast redirect), server components provide real security.

**Task dependencies:** Tasks are sequential (1→2→3→...→17). Each builds on the previous.

---

## File Structure

```
lib/
  firebase/
    config.ts              # Firebase client app init (singleton)
    admin.ts               # Firebase Admin init (singleton, server-only)
    auth.ts                # createSessionCookie, verifySession, signOut helpers
  validators.ts            # Shared validation (student, grade fields)

app/
  actions/
    auth.ts                # Server Actions: loginAction, logoutAction, linkStudentAction
    academy.ts             # Server Actions: createAcademy, updateAcademy
    students.ts            # Server Actions: addStudent, updateStudent, deleteStudent
    classes.ts             # Server Actions: addClass, updateClass, deleteClass
    grades.ts              # Server Actions: addGrade, updateGrade, deleteGrade

  login/
    page.tsx               # Google login page ("use client")

  dashboard/
    layout.tsx             # Sidebar layout + auth check (server component)
    loading.tsx            # Skeleton loader
    page.tsx               # Owner main dashboard
    students/
      page.tsx             # Student list with search/filter
      [studentId]/
        page.tsx           # Student detail + grade history
    classes/
      page.tsx             # Class management
    grades/
      page.tsx             # Grade entry form
      report/
        page.tsx           # Grade report / statistics
    settings/
      page.tsx             # Academy settings
    my/
      page.tsx             # Student self-view (grades only)
    onboarding/
      page.tsx             # Owner first-time academy creation

components/
  dashboard/
    sidebar.tsx            # Dashboard sidebar navigation ("use client")
    student-form.tsx       # Add/edit student form ("use client")
    grade-form.tsx         # Grade entry form ("use client")

middleware.ts              # Route protection for /dashboard/*

firestore.rules            # Firestore security rules (deploy via Firebase Console)
scripts/
  set-owner-claim.mjs     # Script to set owner custom claims
.env.local.example         # Template for required environment variables
```

---

### Task 1: Install Firebase & Create Config Files

**Files:**
- Modify: `package.json`
- Create: `lib/firebase/config.ts`
- Create: `lib/firebase/admin.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Install Firebase dependencies**

```bash
npm install firebase firebase-admin
```

- [ ] **Step 2: Create `.env.local.example`**

```bash
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

- [ ] **Step 3: Create `lib/firebase/config.ts`**

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

- [ ] **Step 4: Create `lib/firebase/admin.ts`**

```typescript
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: Build passes (Firebase modules are tree-shaken, no runtime errors since env vars are not used yet).

- [ ] **Step 6: Commit**

```bash
git add lib/firebase/ .env.local.example package.json package-lock.json
git commit -m "feat: add Firebase client and admin SDK configuration"
```

---

### Task 2: Auth Helpers & Session Cookie Logic

**Files:**
- Create: `lib/firebase/auth.ts`
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Create `lib/firebase/auth.ts`**

Session cookie helpers used by Server Actions and Middleware.

```typescript
import { cookies } from "next/headers";
import { adminAuth } from "./admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_MS / 1000,
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
```

- [ ] **Step 2: Create `app/actions/auth.ts`**

Server Actions for login and logout.

```typescript
"use server";

import { redirect } from "next/navigation";
import { createSessionCookie, clearSession, verifySession } from "@/lib/firebase/auth";
import { adminAuth } from "@/lib/firebase/admin";

export async function loginAction(idToken: string) {
  await createSessionCookie(idToken);

  const decoded = await adminAuth.verifyIdToken(idToken);
  const role = decoded.role as string | undefined;

  if (role === "student") {
    redirect("/dashboard/my");
  } else if (role === "owner") {
    redirect("/dashboard");
  } else {
    // No role: could be a student needing to link, or unknown user
    redirect("/dashboard/link");
  }
}

export async function logoutAction() {
  const session = await verifySession();
  if (session) {
    await adminAuth.revokeRefreshTokens(session.uid);
  }
  await clearSession();
  redirect("/login");
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
git add lib/firebase/auth.ts app/actions/auth.ts
git commit -m "feat: add session cookie helpers and auth server actions"
```

---

### Task 3: Middleware for Route Protection

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create `middleware.ts`**

Next.js Middleware cannot use firebase-admin (Edge runtime limitation). Instead, check for session cookie existence; the actual verification happens in dashboard layout's server component.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Pass pathname to server components via header (for role-based redirects in layout)
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build passes. Middleware is registered for `/dashboard/*` and `/login`.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware for dashboard route protection"
```

---

### Task 4: Login Page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create `app/login/page.tsx`**

Client component with Google sign-in button. On success, sends ID token to `loginAction`.

```tsx
"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/lib/firebase/config";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await loginAction(idToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>학원 관리 로그인</h1>
        <p>Google 계정으로 로그인하세요.</p>

        <button
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
        >
          {loading ? "로그인 중..." : "Google로 로그인"}
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add login page CSS to `app/globals.css`**

Append to the end of `globals.css`:

```css
/* ============================================================
   LOGIN PAGE
   ============================================================ */
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  padding: 24px;
}
.login-card {
  max-width: 400px;
  width: 100%;
  text-align: center;
  padding: 48px 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--line);
}
.login-card h1 {
  font-family: var(--font-noto-sans);
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
}
.login-card p {
  font-size: 14px;
  color: rgba(21, 37, 30, 0.6);
  margin-bottom: 32px;
}
.login-google-button {
  width: 100%;
  padding: 14px 24px;
  background: var(--ink);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.login-google-button:hover { opacity: 0.88; }
.login-google-button:disabled { opacity: 0.5; cursor: not-allowed; }
.login-error {
  margin-top: 16px;
  font-size: 13px;
  color: #c0392b;
}
```

- [ ] **Step 3: Verify dev server renders login page**

```bash
npm run dev
```

Visit `http://localhost:3000/login` — should see the login card. (Google login won't work without `.env.local` values yet.)

- [ ] **Step 4: Commit**

```bash
git add app/login/ app/globals.css
git commit -m "feat: add Google login page"
```

---

### Task 5: Dashboard Layout & Sidebar

**Files:**
- Create: `components/dashboard/sidebar.tsx`
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/loading.tsx`

- [ ] **Step 1: Create `components/dashboard/sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, House, Users, Chalkboard, Exam, ChartBar, GearSix, SignOut } from "@phosphor-icons/react";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const ownerNav = [
  { href: "/dashboard", label: "대시보드", icon: House },
  { href: "/dashboard/students", label: "학원생", icon: Users },
  { href: "/dashboard/classes", label: "반 관리", icon: Chalkboard },
  { href: "/dashboard/grades", label: "성적 입력", icon: Exam },
  { href: "/dashboard/grades/report", label: "성적 리포트", icon: ChartBar },
  { href: "/dashboard/settings", label: "설정", icon: GearSix },
];

export function Sidebar({ role, academyName }: { role: string; academyName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = role === "owner" ? ownerNav : [];

  return (
    <>
      <button
        className="dash-menu-toggle"
        type="button"
        aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <List size={24} />}
      </button>

      <aside className={`dash-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="dash-sidebar-header">
          <span className="dash-academy-name">{academyName}</span>
        </div>

        <nav className="dash-sidebar-nav">
          {nav.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "active" : ""}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="dash-sidebar-footer">
          <button type="submit" className="dash-logout">
            <SignOut size={20} />
            로그아웃
          </button>
        </form>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/layout.tsx`**

Server component that verifies the session and fetches academy info.

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) redirect("/login");

  const role = (session.role as string) || "none";
  let academyName = "학원";

  // No role → student linking page
  if (role === "none") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (!pathname.startsWith("/dashboard/link")) {
      redirect("/dashboard/link");
    }
  }

  // Student can only access /dashboard/my and /dashboard/link
  if (role === "student") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (!pathname.startsWith("/dashboard/my") && !pathname.startsWith("/dashboard/link")) {
      redirect("/dashboard/my");
    }
  }

  // Owner: fetch academy name
  if (role === "owner" && session.academyId) {
    const academyDoc = await adminDb
      .collection("academies")
      .doc(session.academyId as string)
      .get();
    if (academyDoc.exists) {
      academyName = academyDoc.data()?.name || "학원";
    }
  }

  // Student layout: no sidebar
  if (role === "student" || role === "none") {
    return <main className="dash-main" style={{ padding: "32px 40px" }}>{children}</main>;
  }

  return (
    <div className="dash-layout">
      <Sidebar role={role} academyName={academyName} />
      <main className="dash-main">{children}</main>
    </div>
  );
}
```

> **Note:** `x-pathname` header is set by middleware (see Task 3). This allows the server layout to know the current path for role-based redirects.

- [ ] **Step 3: Create `app/dashboard/loading.tsx`**

```tsx
export default function DashboardLoading() {
  return (
    <div className="dash-loading">
      <div className="dash-skeleton" />
      <div className="dash-skeleton short" />
      <div className="dash-skeleton" />
    </div>
  );
}
```

- [ ] **Step 4: Add dashboard CSS to `app/globals.css`**

Append dashboard layout styles:

```css
/* ============================================================
   DASHBOARD LAYOUT
   ============================================================ */
.dash-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100dvh;
  background: var(--cream);
}
.dash-sidebar {
  background: var(--ink);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow-y: auto;
}
.dash-sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  margin-bottom: 8px;
}
.dash-academy-name {
  font-family: var(--font-noto-sans);
  font-size: 15px;
  font-weight: 700;
}
.dash-sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 8px;
}
.dash-sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: background 0.12s;
}
.dash-sidebar-nav a:hover { background: rgba(255,255,255,0.08); color: #fff; }
.dash-sidebar-nav a.active { background: rgba(255,255,255,0.14); color: #fff; font-weight: 600; }
.dash-sidebar-footer {
  padding: 8px;
  border-top: 1px solid rgba(255,255,255,0.12);
  margin-top: 8px;
}
.dash-logout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
}
.dash-logout:hover { background: rgba(255,255,255,0.08); color: #fff; }
.dash-main {
  padding: 32px 40px;
  overflow-y: auto;
}
.dash-menu-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 200;
  background: var(--ink);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
}
/* Loading skeleton */
.dash-loading { display: flex; flex-direction: column; gap: 16px; padding: 24px 0; }
.dash-skeleton {
  height: 20px;
  background: rgba(21,37,30,0.08);
  border-radius: 6px;
  animation: pulse 1.5s infinite;
}
.dash-skeleton.short { width: 60%; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (max-width: 768px) {
  .dash-layout { grid-template-columns: 1fr; }
  .dash-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: 260px; z-index: 150;
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  .dash-sidebar.is-open { transform: translateX(0); }
  .dash-menu-toggle { display: flex; }
  .dash-main { padding: 24px 16px; padding-top: 60px; }
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ app/dashboard/layout.tsx app/dashboard/loading.tsx app/globals.css
git commit -m "feat: add dashboard layout with sidebar navigation"
```

---

### Task 6: Shared Validators & TypeScript Types

**Files:**
- Create: `lib/validators.ts`

- [ ] **Step 1: Create `lib/validators.ts`**

Shared types and validation functions used by both Server Actions and client forms.

```typescript
// ── Types ──────────────────────────────────────────────────

export type StudentData = {
  name: string;
  grade: number;
  parentContact: string;
  classId: string;
};

export type DullgGradeData = {
  type: "dullg";
  studentId: string;
  session: number;
  score: number;
  participation: "상" | "중" | "하";
  note: string;
  date: Date;
};

export type ExamGradeData = {
  type: "exam";
  studentId: string;
  subject: string;
  examName: string;
  score: number;
  totalScore: number;
  date: Date;
};

export type GradeData = DullgGradeData | ExamGradeData;

// ── Validators ─────────────────────────────────────────────

export function validateStudent(data: StudentData): string | null {
  if (!data.name.trim()) return "이름을 입력해주세요.";
  if (!Number.isInteger(data.grade) || data.grade < 1 || data.grade > 12)
    return "학년은 1~12 사이 정수여야 합니다.";
  if (!data.parentContact.trim()) return "학부모 연락처를 입력해주세요.";
  return null;
}

export function validateGrade(data: GradeData): string | null {
  if (data.type === "dullg") {
    if (!Number.isInteger(data.session) || data.session < 1 || data.session > 4)
      return "차시는 1~4 사이 정수여야 합니다.";
    if (data.score < 0 || data.score > 100) return "점수는 0~100 사이여야 합니다.";
    if (!["상", "중", "하"].includes(data.participation))
      return "참여도는 상/중/하 중 하나여야 합니다.";
  } else {
    if (!data.subject.trim()) return "과목명을 입력해주세요.";
    if (!data.examName.trim()) return "시험명을 입력해주세요.";
    if (data.score < 0) return "점수는 0 이상이어야 합니다.";
    if (data.totalScore <= 0) return "만점은 0보다 커야 합니다.";
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/validators.ts
git commit -m "feat: add shared types and validators for student and grade data"
```

---

### Task 7: Academy & Student Server Actions

**Files:**
- Create: `app/actions/academy.ts`
- Create: `app/actions/students.ts`

- [ ] **Step 1: Create `app/actions/academy.ts`**

```typescript
"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function createAcademy(name: string) {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");

  const ref = await adminDb.collection("academies").add({
    name,
    ownerId: session.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Set academyId in custom claims
  await adminAuth.setCustomUserClaims(session.uid, {
    ...((await adminAuth.getUser(session.uid)).customClaims || {}),
    academyId: ref.id,
  });

  redirect("/dashboard");
}

export async function updateAcademy(academyId: string, name: string) {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");

  const doc = await adminDb.collection("academies").doc(academyId).get();
  if (!doc.exists || doc.data()?.ownerId !== session.uid) throw new Error("권한이 없습니다.");

  await adminDb.collection("academies").doc(academyId).update({
    name,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
```

- [ ] **Step 2: Create `app/actions/students.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateStudent, type StudentData } from "@/lib/validators";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  return academyId;
}

export async function addStudent(data: StudentData) {
  const error = validateStudent(data);
  if (error) throw new Error(error);

  const academyId = await getAcademyId();

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .add({
      ...data,
      userId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/students");
}

export async function updateStudent(studentId: string, data: StudentData) {
  const error = validateStudent(data);
  if (error) throw new Error(error);

  const academyId = await getAcademyId();

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${studentId}`);
}

export async function deleteStudent(studentId: string) {
  const academyId = await getAcademyId();
  const studentRef = adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId);

  // Delete related grades
  const grades = await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .where("studentId", "==", studentId)
    .get();

  const batch = adminDb.batch();
  grades.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(studentRef);
  await batch.commit();

  revalidatePath("/dashboard/students");
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/actions/academy.ts app/actions/students.ts
git commit -m "feat: add academy and student server actions"
```

---

### Task 8: Class & Grade Server Actions

**Files:**
- Create: `app/actions/classes.ts`
- Create: `app/actions/grades.ts`

- [ ] **Step 1: Create `app/actions/classes.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  return academyId;
}

export async function addClass(name: string) {
  if (!name.trim()) throw new Error("반 이름을 입력해주세요.");
  const academyId = await getAcademyId();

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .add({
      name,
      createdAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/classes");
}

export async function updateClass(classId: string, name: string) {
  if (!name.trim()) throw new Error("반 이름을 입력해주세요.");
  const academyId = await getAcademyId();

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .doc(classId)
    .update({ name });

  revalidatePath("/dashboard/classes");
}

export async function deleteClass(classId: string) {
  const academyId = await getAcademyId();

  // Check no students assigned
  const students = await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .where("classId", "==", classId)
    .limit(1)
    .get();

  if (!students.empty) throw new Error("학생이 배정된 반은 삭제할 수 없습니다.");

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .doc(classId)
    .delete();

  revalidatePath("/dashboard/classes");
}
```

- [ ] **Step 2: Create `app/actions/grades.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateGrade, type GradeData } from "@/lib/validators";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  return academyId;
}

export async function addGrade(data: GradeData) {
  const error = validateGrade(data);
  if (error) throw new Error(error);

  const academyId = await getAcademyId();

  // Get student's userId for security rules
  const studentDoc = await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(data.studentId)
    .get();

  if (!studentDoc.exists) throw new Error("학생을 찾을 수 없습니다.");
  const userId = studentDoc.data()?.userId || null;

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .add({
      ...data,
      userId,
      date: data.date,
      createdAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/students/${data.studentId}`);
}

export async function deleteGrade(gradeId: string) {
  const academyId = await getAcademyId();

  await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .doc(gradeId)
    .delete();

  revalidatePath("/dashboard/grades");
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/actions/classes.ts app/actions/grades.ts
git commit -m "feat: add class and grade server actions"
```

---

### Task 9: Dashboard Main Page & Owner Onboarding

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/onboarding/page.tsx`

- [ ] **Step 1: Create `app/dashboard/onboarding/page.tsx`**

First-time owner creates their academy.

```tsx
"use client";

import { useState } from "react";
import { createAcademy } from "@/app/actions/academy";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("학원명을 입력해주세요."); return; }
    setLoading(true);
    try {
      await createAcademy(name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "학원 생성에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="dash-onboarding">
      <h1>학원 등록</h1>
      <p>학원 관리를 시작하려면 학원명을 입력하세요.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="학원명"
          className="dash-input"
          disabled={loading}
        />
        <button type="submit" className="dash-button" disabled={loading}>
          {loading ? "생성 중..." : "학원 만들기"}
        </button>
        {error && <p className="dash-error">{error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/page.tsx`**

Owner main dashboard showing overview.

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

  if (session.role === "student") redirect("/dashboard/my");
  if (session.role !== "owner") redirect("/dashboard/onboarding");

  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  // Fetch counts
  const [studentsSnap, classesSnap, gradesSnap] = await Promise.all([
    adminDb.collection("academies").doc(academyId).collection("students").count().get(),
    adminDb.collection("academies").doc(academyId).collection("classes").count().get(),
    adminDb.collection("academies").doc(academyId).collection("grades").count().get(),
  ]);

  const stats = {
    students: studentsSnap.data().count,
    classes: classesSnap.data().count,
    grades: gradesSnap.data().count,
  };

  return (
    <div>
      <h1 className="dash-page-title">대시보드</h1>
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.students}</span>
          <span className="dash-stat-label">학원생</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.classes}</span>
          <span className="dash-stat-label">반</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.grades}</span>
          <span className="dash-stat-label">성적 기록</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add dashboard page CSS to `app/globals.css`**

```css
/* ============================================================
   DASHBOARD PAGES
   ============================================================ */
.dash-page-title {
  font-family: var(--font-noto-sans);
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 24px;
}
.dash-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.dash-stat-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dash-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
}
.dash-stat-label {
  font-size: 13px;
  color: rgba(21,37,30,0.5);
}
/* Shared form elements */
.dash-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  margin-bottom: 12px;
}
.dash-input:focus { outline: 2px solid var(--orange); outline-offset: 1px; }
.dash-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  margin-bottom: 12px;
}
.dash-button {
  padding: 10px 20px;
  background: var(--ink);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.dash-button:hover { opacity: 0.88; }
.dash-button:disabled { opacity: 0.5; cursor: not-allowed; }
.dash-button-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.dash-button-danger {
  padding: 10px 20px;
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.dash-error {
  font-size: 13px;
  color: #c0392b;
  margin-top: 8px;
}
.dash-onboarding {
  max-width: 400px;
  margin: 80px auto;
  text-align: center;
}
.dash-onboarding h1 { margin-bottom: 8px; }
.dash-onboarding p {
  font-size: 14px;
  color: rgba(21,37,30,0.6);
  margin-bottom: 24px;
}
.dash-onboarding form { text-align: left; }
/* Table */
.dash-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}
.dash-table th, .dash-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid var(--line);
}
.dash-table th {
  background: rgba(21,37,30,0.03);
  font-weight: 600;
  font-size: 13px;
  color: rgba(21,37,30,0.6);
}
.dash-table tr:last-child td { border-bottom: none; }
.dash-table-actions {
  display: flex;
  gap: 8px;
}
.dash-table-actions button {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}
/* Card section */
.dash-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 16px;
}
.dash-card h2 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
.dash-row { display: flex; gap: 12px; align-items: end; }
.dash-row > * { flex: 1; }
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/onboarding/ app/globals.css
git commit -m "feat: add dashboard main page and owner onboarding"
```

---

### Task 10: Students List & Detail Pages

**Files:**
- Create: `components/dashboard/student-form.tsx`
- Create: `app/dashboard/students/page.tsx`
- Create: `app/dashboard/students/[studentId]/page.tsx`

- [ ] **Step 1: Create `components/dashboard/student-form.tsx`**

Reusable form for adding/editing students.

```tsx
"use client";

import { useState } from "react";
import { addStudent, updateStudent } from "@/app/actions/students";
import type { StudentData } from "@/lib/validators";

type Props = {
  classes: { id: string; name: string }[];
  student?: { id: string } & StudentData;
  onDone?: () => void;
};

export function StudentForm({ classes, student, onDone }: Props) {
  const [name, setName] = useState(student?.name || "");
  const [grade, setGrade] = useState(student?.grade?.toString() || "");
  const [parentContact, setParentContact] = useState(student?.parentContact || "");
  const [classId, setClassId] = useState(student?.classId || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: StudentData = {
      name: name.trim(),
      grade: parseInt(grade, 10),
      parentContact: parentContact.trim(),
      classId,
    };

    try {
      if (student) {
        await updateStudent(student.id, data);
      } else {
        await addStudent(data);
      }
      onDone?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>{student ? "학원생 수정" : "학원생 등록"}</h2>
      <input className="dash-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="dash-input" placeholder="학년 (1~12)" type="number" min={1} max={12} value={grade} onChange={(e) => setGrade(e.target.value)} required />
      <input className="dash-input" placeholder="학부모 연락처" value={parentContact} onChange={(e) => setParentContact(e.target.value)} required />
      <select className="dash-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="">반 선택 (선택사항)</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : student ? "수정" : "등록"}
      </button>
      {error && <p className="dash-error">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/students/page.tsx`**

Server component listing students with add form.

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { StudentForm } from "@/components/dashboard/student-form";
import { deleteStudent } from "@/app/actions/students";

export default async function StudentsPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const [studentsSnap, classesSnap] = await Promise.all([
    adminDb.collection("academies").doc(academyId).collection("students").orderBy("createdAt", "desc").limit(100).get(),
    adminDb.collection("academies").doc(academyId).collection("classes").get(),
  ]);

  const classes = classesSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const students = studentsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div>
      <h1 className="dash-page-title">학원생 관리</h1>

      <StudentForm classes={classes} />

      <table className="dash-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>학년</th>
            <th>반</th>
            <th>연락처</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s: Record<string, unknown>) => (
            <tr key={s.id as string}>
              <td>
                <Link href={`/dashboard/students/${s.id}`} style={{ textDecoration: "underline" }}>
                  {s.name as string}
                </Link>
              </td>
              <td>{s.grade as number}학년</td>
              <td>{s.classId ? classMap[s.classId as string] || "-" : "-"}</td>
              <td>{s.parentContact as string}</td>
              <td>
                <form action={async () => { "use server"; await deleteStudent(s.id as string); }}>
                  <button type="submit" className="dash-button-danger" style={{ fontSize: 12, padding: "4px 10px" }}>삭제</button>
                </form>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>등록된 학원생이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/dashboard/students/[studentId]/page.tsx`**

Student detail with grade history.

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const studentDoc = await adminDb
    .collection("academies").doc(academyId)
    .collection("students").doc(studentId).get();

  if (!studentDoc.exists) redirect("/dashboard/students");
  const student = studentDoc.data()!;

  const gradesSnap = await adminDb
    .collection("academies").doc(academyId)
    .collection("grades")
    .where("studentId", "==", studentId)
    .orderBy("date", "desc")
    .limit(50)
    .get();

  const grades = gradesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return (
    <div>
      <h1 className="dash-page-title">{student.name}</h1>

      <div className="dash-card">
        <h2>기본 정보</h2>
        <p>학년: {student.grade}학년</p>
        <p>학부모 연락처: {student.parentContact}</p>
      </div>

      <div className="dash-card">
        <h2>성적 이력</h2>
        {grades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>성적 기록이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>유형</th>
                <th>내용</th>
                <th>점수</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.type === "dullg" ? "DullG" : "시험"}</td>
                  <td>
                    {g.type === "dullg"
                      ? `${g.session}차시 (참여도: ${g.participation})`
                      : `${g.subject} - ${g.examName}`}
                  </td>
                  <td>
                    {g.type === "dullg"
                      ? `${g.score}점`
                      : `${g.score}/${g.totalScore}`}
                  </td>
                  <td>{g.date?.toDate ? g.date.toDate().toLocaleDateString("ko-KR") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/student-form.tsx app/dashboard/students/
git commit -m "feat: add student list, detail, and registration pages"
```

---

### Task 11: Class Management Page

**Files:**
- Create: `app/dashboard/classes/page.tsx`

- [ ] **Step 1: Create `app/dashboard/classes/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { ClassManager } from "./class-manager";

export default async function ClassesPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const [classesSnap, studentsSnap] = await Promise.all([
    adminDb.collection("academies").doc(academyId).collection("classes").orderBy("createdAt").get(),
    adminDb.collection("academies").doc(academyId).collection("students").get(),
  ]);

  const classes = classesSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  // Count students per class
  const classCounts: Record<string, number> = {};
  studentsSnap.docs.forEach((doc) => {
    const cid = doc.data().classId;
    if (cid) classCounts[cid] = (classCounts[cid] || 0) + 1;
  });

  return (
    <div>
      <h1 className="dash-page-title">반 관리</h1>
      <ClassManager classes={classes} classCounts={classCounts} />
    </div>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/classes/class-manager.tsx`**

Client component for interactive class CRUD.

```tsx
"use client";

import { useState } from "react";
import { addClass, updateClass, deleteClass } from "@/app/actions/classes";

type ClassItem = { id: string; name: string };

export function ClassManager({
  classes,
  classCounts,
}: {
  classes: ClassItem[];
  classCounts: Record<string, number>;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addClass(newName.trim());
      setNewName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "반 추가에 실패했습니다.");
    }
  }

  async function handleUpdate(classId: string) {
    setError(null);
    try {
      await updateClass(classId, editName.trim());
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    }
  }

  async function handleDelete(classId: string) {
    setError(null);
    try {
      await deleteClass(classId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <>
      <form onSubmit={handleAdd} className="dash-card">
        <h2>새 반 추가</h2>
        <div className="dash-row">
          <input className="dash-input" placeholder="반 이름" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <button type="submit" className="dash-button">추가</button>
        </div>
      </form>

      {error && <p className="dash-error">{error}</p>}

      <table className="dash-table" style={{ marginTop: 16 }}>
        <thead>
          <tr><th>반 이름</th><th>학생 수</th><th></th></tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input className="dash-input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginBottom: 0 }} />
                ) : c.name}
              </td>
              <td>{classCounts[c.id] || 0}명</td>
              <td className="dash-table-actions">
                {editingId === c.id ? (
                  <>
                    <button type="button" onClick={() => handleUpdate(c.id)}>저장</button>
                    <button type="button" onClick={() => setEditingId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setEditingId(c.id); setEditName(c.name); }}>수정</button>
                    <button type="button" onClick={() => handleDelete(c.id)}>삭제</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr><td colSpan={3} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>등록된 반이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/classes/
git commit -m "feat: add class management page"
```

---

### Task 12: Grade Entry Page

**Files:**
- Create: `components/dashboard/grade-form.tsx`
- Create: `app/dashboard/grades/page.tsx`

- [ ] **Step 1: Create `components/dashboard/grade-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { addGrade } from "@/app/actions/grades";
import type { GradeData } from "@/lib/validators";

type Props = {
  students: { id: string; name: string }[];
};

export function GradeForm({ students }: Props) {
  const [type, setType] = useState<"dullg" | "exam">("dullg");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("1");
  const [score, setScore] = useState("");
  const [participation, setParticipation] = useState<"상" | "중" | "하">("중");
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [totalScore, setTotalScore] = useState("100");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const data: GradeData = type === "dullg"
      ? {
          type: "dullg",
          studentId,
          session: parseInt(session, 10),
          score: parseFloat(score),
          participation,
          note,
          date: new Date(date),
        }
      : {
          type: "exam",
          studentId,
          subject,
          examName,
          score: parseFloat(score),
          totalScore: parseFloat(totalScore),
          date: new Date(date),
        };

    try {
      await addGrade(data);
      setSuccess(true);
      setScore("");
      setNote("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "성적 입력에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>성적 입력</h2>

      <div className="dash-row" style={{ marginBottom: 16 }}>
        <button type="button" className={type === "dullg" ? "dash-button" : "dash-button-secondary"} onClick={() => setType("dullg")}>DullG 수업</button>
        <button type="button" className={type === "exam" ? "dash-button" : "dash-button-secondary"} onClick={() => setType("exam")}>일반 시험</button>
      </div>

      <select className="dash-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
        <option value="">학생 선택</option>
        {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {type === "dullg" ? (
        <>
          <select className="dash-select" value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="1">1차시</option>
            <option value="2">2차시</option>
            <option value="3">3차시</option>
            <option value="4">4차시</option>
          </select>
          <input className="dash-input" placeholder="점수 (0~100)" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} required />
          <select className="dash-select" value={participation} onChange={(e) => setParticipation(e.target.value as "상" | "중" | "하")}>
            <option value="상">참여도: 상</option>
            <option value="중">참여도: 중</option>
            <option value="하">참여도: 하</option>
          </select>
          <input className="dash-input" placeholder="메모 (선택)" value={note} onChange={(e) => setNote(e.target.value)} />
        </>
      ) : (
        <>
          <input className="dash-input" placeholder="과목명" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <input className="dash-input" placeholder="시험명 (예: 중간고사)" value={examName} onChange={(e) => setExamName(e.target.value)} required />
          <div className="dash-row">
            <input className="dash-input" placeholder="점수" type="number" min={0} value={score} onChange={(e) => setScore(e.target.value)} required />
            <input className="dash-input" placeholder="만점" type="number" min={1} value={totalScore} onChange={(e) => setTotalScore(e.target.value)} required />
          </div>
        </>
      )}

      <input className="dash-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : "성적 입력"}
      </button>

      {error && <p className="dash-error">{error}</p>}
      {success && <p style={{ color: "green", fontSize: 13, marginTop: 8 }}>성적이 저장되었습니다.</p>}
    </form>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/grades/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { GradeForm } from "@/components/dashboard/grade-form";

export default async function GradesPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const studentsSnap = await adminDb
    .collection("academies").doc(academyId)
    .collection("students").orderBy("name").get();

  const students = studentsSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  return (
    <div>
      <h1 className="dash-page-title">성적 입력</h1>
      <GradeForm students={students} />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/grade-form.tsx app/dashboard/grades/page.tsx
git commit -m "feat: add grade entry page with DullG and exam forms"
```

---

### Task 13: Grade Report Page

**Files:**
- Create: `app/dashboard/grades/report/page.tsx`

- [ ] **Step 1: Create `app/dashboard/grades/report/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";

export default async function GradeReportPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const [gradesSnap, studentsSnap, classesSnap] = await Promise.all([
    adminDb.collection("academies").doc(academyId).collection("grades").orderBy("date", "desc").limit(200).get(),
    adminDb.collection("academies").doc(academyId).collection("students").get(),
    adminDb.collection("academies").doc(academyId).collection("classes").get(),
  ]);

  const studentMap = Object.fromEntries(
    studentsSnap.docs.map((doc) => [doc.id, { name: doc.data().name, classId: doc.data().classId }])
  );
  const classMap = Object.fromEntries(
    classesSnap.docs.map((doc) => [doc.id, doc.data().name])
  );

  const grades = gradesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    studentName: studentMap[doc.data().studentId]?.name || "알 수 없음",
    className: classMap[studentMap[doc.data().studentId]?.classId] || "-",
  }));

  // Calculate averages by class for DullG grades
  const dullgGrades = grades.filter((g: Record<string, unknown>) => g.type === "dullg");
  const classAverages: Record<string, { total: number; count: number }> = {};
  dullgGrades.forEach((g: Record<string, unknown>) => {
    const cn = g.className as string;
    if (!classAverages[cn]) classAverages[cn] = { total: 0, count: 0 };
    classAverages[cn].total += g.score as number;
    classAverages[cn].count += 1;
  });

  return (
    <div>
      <h1 className="dash-page-title">성적 리포트</h1>

      {Object.keys(classAverages).length > 0 && (
        <div className="dash-card">
          <h2>DullG 반별 평균</h2>
          <table className="dash-table">
            <thead><tr><th>반</th><th>평균 점수</th><th>기록 수</th></tr></thead>
            <tbody>
              {Object.entries(classAverages).map(([cn, data]) => (
                <tr key={cn}>
                  <td>{cn}</td>
                  <td>{(data.total / data.count).toFixed(1)}점</td>
                  <td>{data.count}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="dash-card">
        <h2>최근 성적 기록</h2>
        <table className="dash-table">
          <thead>
            <tr><th>학생</th><th>반</th><th>유형</th><th>내용</th><th>점수</th></tr>
          </thead>
          <tbody>
            {grades.map((g: Record<string, unknown>) => (
              <tr key={g.id as string}>
                <td>{g.studentName as string}</td>
                <td>{g.className as string}</td>
                <td>{g.type === "dullg" ? "DullG" : "시험"}</td>
                <td>{g.type === "dullg" ? `${g.session}차시` : `${g.subject} - ${g.examName}`}</td>
                <td>{g.type === "dullg" ? `${g.score}점` : `${g.score}/${g.totalScore}`}</td>
              </tr>
            ))}
            {grades.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>성적 기록이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/grades/report/
git commit -m "feat: add grade report page with class averages"
```

---

### Task 14: Settings Page & Student Self-View

**Files:**
- Create: `app/dashboard/settings/page.tsx`
- Create: `app/dashboard/my/page.tsx`

- [ ] **Step 1: Create `app/dashboard/settings/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const doc = await adminDb.collection("academies").doc(academyId).get();
  const academy = doc.exists ? { id: doc.id, name: doc.data()?.name || "" } : null;
  if (!academy) redirect("/dashboard/onboarding");

  return (
    <div>
      <h1 className="dash-page-title">학원 설정</h1>
      <SettingsForm academyId={academy.id} currentName={academy.name} />
    </div>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/settings/settings-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { updateAcademy } from "@/app/actions/academy";

export function SettingsForm({ academyId, currentName }: { academyId: string; currentName: string }) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await updateAcademy(academyId, name.trim());
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>학원 정보</h2>
      <label style={{ fontSize: 13, color: "rgba(21,37,30,0.6)", marginBottom: 4, display: "block" }}>학원명</label>
      <input className="dash-input" value={name} onChange={(e) => setName(e.target.value)} required />
      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : "저장"}
      </button>
      {success && <p style={{ color: "green", fontSize: 13, marginTop: 8 }}>저장되었습니다.</p>}
      {error && <p className="dash-error">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 3: Create `app/dashboard/my/page.tsx`**

Student self-view page.

```tsx
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminDb } from "@/lib/firebase/admin";

export default async function MyGradesPage() {
  const session = await verifySession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/dashboard");

  const academyId = session.academyId as string;
  const studentId = session.studentId as string;
  if (!academyId || !studentId) redirect("/login");

  const [studentDoc, gradesSnap] = await Promise.all([
    adminDb.collection("academies").doc(academyId).collection("students").doc(studentId).get(),
    adminDb.collection("academies").doc(academyId).collection("grades")
      .where("studentId", "==", studentId)
      .orderBy("date", "desc")
      .limit(50)
      .get(),
  ]);

  const student = studentDoc.data();
  const grades = gradesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const dullgGrades = grades.filter((g: Record<string, unknown>) => g.type === "dullg");
  const examGrades = grades.filter((g: Record<string, unknown>) => g.type === "exam");

  return (
    <div>
      <h1 className="dash-page-title">{student?.name}님의 성적</h1>

      <div className="dash-card">
        <h2>DullG 수업 성적</h2>
        {dullgGrades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>DullG 성적 기록이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>차시</th><th>점수</th><th>참여도</th><th>메모</th></tr></thead>
            <tbody>
              {dullgGrades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.session as number}차시</td>
                  <td>{g.score as number}점</td>
                  <td>{g.participation as string}</td>
                  <td>{(g.note as string) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dash-card">
        <h2>일반 시험 성적</h2>
        {examGrades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>시험 성적 기록이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>과목</th><th>시험</th><th>점수</th></tr></thead>
            <tbody>
              {examGrades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.subject as string}</td>
                  <td>{g.examName as string}</td>
                  <td>{g.score as number}/{g.totalScore as number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/settings/ app/dashboard/my/
git commit -m "feat: add settings page and student grade self-view"
```

---

### Task 15: Student Account Linking

**Files:**
- Modify: `app/actions/auth.ts`
- Create: `app/dashboard/link/page.tsx`

- [ ] **Step 1: Add `linkStudentAction` to `app/actions/auth.ts`**

Append to existing file:

```typescript
export async function linkStudentAction(academyId: string, studentName: string) {
  const session = await verifySession();
  if (!session) throw new Error("로그인이 필요합니다.");

  // Find matching student in the academy
  const studentsSnap = await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .where("name", "==", studentName)
    .where("userId", "==", null)
    .limit(1)
    .get();

  if (studentsSnap.empty) {
    throw new Error("일치하는 학생 정보를 찾을 수 없습니다. 원장님에게 문의하세요.");
  }

  const studentDoc = studentsSnap.docs[0];

  // Link userId
  await studentDoc.ref.update({ userId: session.uid });

  // Set custom claims
  await adminAuth.setCustomUserClaims(session.uid, {
    role: "student",
    academyId,
    studentId: studentDoc.id,
  });

  redirect("/dashboard/my");
}
```

Import `adminDb` at the top of `app/actions/auth.ts` if not already present:
```typescript
import { adminAuth, adminDb } from "@/lib/firebase/admin";
```

- [ ] **Step 2: Create `app/dashboard/link/page.tsx`**

Page shown to users without a role who need to link their student account.

```tsx
"use client";

import { useState } from "react";
import { linkStudentAction } from "@/app/actions/auth";

export default function LinkStudentPage() {
  const [academyId, setAcademyId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await linkStudentAction(academyId.trim(), name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "연결에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="dash-onboarding">
      <h1>학원생 계정 연결</h1>
      <p>원장님이 알려준 학원 코드와 등록된 본인 이름을 입력하세요.</p>
      <form onSubmit={handleSubmit}>
        <input className="dash-input" placeholder="학원 코드" value={academyId} onChange={(e) => setAcademyId(e.target.value)} required />
        <input className="dash-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit" className="dash-button" disabled={loading}>
          {loading ? "연결 중..." : "계정 연결"}
        </button>
        {error && <p className="dash-error">{error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/actions/auth.ts app/dashboard/link/
git commit -m "feat: add student account linking flow"
```

---

### Task 16: Firestore Security Rules

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Create `firestore.rules`**

Copy from spec Section 5. This file is deployed via Firebase Console or `firebase deploy --only firestore:rules`.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

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

    match /academies/{academyId} {
      allow create: if isOwnerRole();
      allow read, update, delete: if isAcademyOwner(academyId);
      allow read: if isAcademyStudent(academyId);

      match /students/{studentId} {
        allow read, write: if isAcademyOwner(academyId);
        allow read: if isLinkedStudent(academyId, studentId);
      }

      match /classes/{classId} {
        allow read, write: if isAcademyOwner(academyId);
        allow read: if isAcademyStudent(academyId);
      }

      match /grades/{gradeId} {
        allow read, write: if isAcademyOwner(academyId);
        allow read: if isAuthenticated()
          && resource.data.userId == request.auth.uid;
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add firestore.rules
git commit -m "feat: add Firestore security rules"
```

---

### Task 17: Owner Claims Script & End-to-End Test

**Files:**
- Create: `scripts/set-owner-claim.mjs`

- [ ] **Step 1: Create `scripts/set-owner-claim.mjs`**

Helper script to set owner custom claims without Firebase Console.

```javascript
// Usage: node scripts/set-owner-claim.mjs <user-uid>
// Requires: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

// Parse .env.local
const envFile = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("=").map((s) => s.trim()))
);

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node scripts/set-owner-claim.mjs <user-uid>");
  process.exit(1);
}

await getAuth(app).setCustomUserClaims(uid, { role: "owner" });
console.log(`✓ Set role=owner for UID: ${uid}`);
console.log("  User must log out and log back in for claims to take effect.");
```

- [ ] **Step 2: Configure Firebase project**

Create a Firebase project at https://console.firebase.google.com:
1. Enable Google sign-in provider under Authentication
2. Create a Firestore database (production mode)
3. Copy config values to `.env.local` (use `.env.local.example` as template)

- [ ] **Step 3: Set owner custom claim**

```bash
node scripts/set-owner-claim.mjs YOUR_FIREBASE_UID
```

- [ ] **Step 4: Test full flow**

```bash
npm run dev
```

1. Visit `/login` → Google login
2. Owner: `/dashboard/onboarding` → create academy → `/dashboard`
3. Add class at `/dashboard/classes`
4. Add student at `/dashboard/students`
5. Enter grade at `/dashboard/grades`
6. View report at `/dashboard/grades/report`
7. View student detail at `/dashboard/students/[id]`
8. Update settings at `/dashboard/settings`
9. Logout → test student login flow at `/dashboard/link`

- [ ] **Step 5: Deploy Firestore rules**

In Firebase Console > Firestore > Rules, paste the contents of `firestore.rules` and publish. (Or install Firebase CLI: `npm install -g firebase-tools && firebase login && firebase deploy --only firestore:rules`)

- [ ] **Step 6: Commit**

```bash
git add scripts/set-owner-claim.mjs
git commit -m "chore: add owner claims script and finalize setup"
```
