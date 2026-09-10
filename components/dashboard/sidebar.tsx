"use client";
import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import {
  List,
  X,
  House,
  Users,
  Chalkboard,
  Exam,
  ChartBar,
  GearSix,
  SignOut,
} from "@phosphor-icons/react";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { LanguageSwitch } from "@/components/i18n/language-switch";
const ownerNav = [
  { href: "/dashboard", label: "대시보드", icon: House },
  { href: "/dashboard/students", label: "학원생", icon: Users },
  { href: "/dashboard/classes", label: "반 관리", icon: Chalkboard },
  { href: "/dashboard/grades", label: "성적 입력", icon: Exam },
  { href: "/dashboard/grades/report", label: "성적 리포트", icon: ChartBar },
  { href: "/dashboard/settings", label: "설정", icon: GearSix },
];
export function Sidebar({ role, academyName }: { role: string; academyName: string }) {
  const t = useText();
  const pathname = usePathname().replace(/^\/en(?=\/|$)/, "") || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "owner" ? ownerNav : [];
  return (
    <>
      <button
        className="dash-menu-toggle"
        type="button"
        aria-label={t(mobileOpen ? "메뉴 닫기" : "메뉴 열기")}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {t(mobileOpen ? <X size={24} /> : <List size={24} />)}
      </button>

      <aside className={`dash-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="dash-sidebar-header">
          <LanguageSwitch />
          <span className="dash-academy-name">{t(academyName)}</span>
        </div>

        <nav className="dash-sidebar-nav">
          {t(
            nav.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.href === "/dashboard/grades"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "active" : ""}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={20} />
                  {t(item.label)}
                </Link>
              );
            }),
          )}
        </nav>

        <form action={logoutAction} className="dash-sidebar-footer">
          <button type="submit" className="dash-logout">
            <SignOut size={20} />
            {t("로그아웃")}
          </button>
        </form>
      </aside>
    </>
  );
}
