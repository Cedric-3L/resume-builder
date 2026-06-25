"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

type NavbarVariant = "default" | "auth" | "account";

const DEFAULT_NAV_ITEMS = [
  { href: "/templates", label: "模板库" },
  { href: "/editor", label: "在线编辑" },
  { href: "/dashboard?section=tutorial", label: "求职指南" },
  { href: "/dashboard?section=membership", label: "会员与定价" },
];

const ACCOUNT_NAV_ITEMS = [
  { href: "/templates", label: "模板库" },
  { href: "/editor", label: "在线编辑" },
  { href: "/dashboard?section=tutorial", label: "求职指南" },
];

export function Navbar({ variant = "default" }: { variant?: NavbarVariant }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout, refreshSession } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/");
  };

  const navItems = variant === "auth"
    ? DEFAULT_NAV_ITEMS.slice(0, 2)
    : variant === "account"
      ? ACCOUNT_NAV_ITEMS
      : DEFAULT_NAV_ITEMS;

  const isActive = (href: string) => {
    const [path] = href.split("?");
    if (path === "/dashboard") return false;
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f8f4ed]/96">
      <div className={cn(
        "mx-auto px-5 sm:px-8 lg:px-12",
        variant === "auth" ? "w-full max-w-none" : "max-w-[1440px]"
      )}>
        <div className="flex h-[66px] items-center justify-between gap-4 border-b border-[#bbb5ab]">
          <div className="flex items-center gap-14">
            <Link href="/" className="flex items-center gap-3 text-[#151514]">
              <span className="font-editorial text-[46px] leading-none">G</span>
              <div className="flex flex-col justify-center">
                <div className="font-editorial text-[17px] font-semibold leading-tight tracking-[.12em]">极刻简历</div>
                <div className="text-[10px] uppercase leading-tight tracking-[0.32em]">GeekCV</div>
              </div>
            </Link>

            <div className="hidden items-center gap-9 md:flex">
              {navItems.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href === "/editor" && !isLoggedIn ? "/login?redirect=/editor" : item.href}
                  className={cn(
                    "relative py-5 text-[14px] text-[#292724] transition-colors hover:text-[#075be8]",
                    isActive(item.href) && "text-[#075be8] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#f05a1a]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            {variant === "auth" ? (
              <Link href="/" className="text-sm text-[#292724] transition-colors hover:text-[#075be8]">
                返回首页
              </Link>
            ) : isLoggedIn && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-transparent py-2 text-[#292724] transition-colors hover:text-[#075be8]"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#eee8de] text-[#77716a]">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="max-w-[110px] truncate text-sm">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 border border-[#c9c3b9] bg-[#fbf8f2] p-2 shadow-[0_18px_50px_rgba(42,36,28,.12)]">
                    <div className="border-b border-[#ded8cf] px-3 py-2">
                      <div className="text-xs text-[#77716a]">当前账号</div>
                      <div className="mt-1 truncate text-sm font-semibold">{user.name}</div>
                    </div>
                    <Link href="/editor" className="mt-2 flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#f1ece4]" onClick={() => setIsMenuOpen(false)}>
                      <FileText className="h-4 w-4" />在线编辑
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#f1ece4]" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />个人中心
                    </Link>
                    <button onClick={() => void handleLogout()} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#292724] transition-colors hover:text-[#075be8]">登录</Link>
                <Link href="/editor" className="bg-[#1d1d1b] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#075be8]">
                  开始写简历
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsMobileNavOpen((prev) => !prev)} className="inline-flex border border-[#bdb7ad] p-2 text-[#302e2b] md:hidden">
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-b border-[#bdb7ad] bg-[#f8f4ed] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn("px-4 py-3 text-sm", isActive(item.href) ? "text-[#075be8]" : "text-[#4d4944]")}
                onClick={() => setIsMobileNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-3 text-sm text-[#4d4944]" onClick={() => setIsMobileNavOpen(false)}>个人中心</Link>
                <button onClick={() => void handleLogout()} className="px-4 py-3 text-left text-sm text-red-600">退出登录</button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-3 text-sm text-[#4d4944]" onClick={() => setIsMobileNavOpen(false)}>登录</Link>
                <Link href="/login?redirect=/editor" className="bg-[#075be8] px-4 py-3 text-sm text-white" onClick={() => setIsMobileNavOpen(false)}>开始制作</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
