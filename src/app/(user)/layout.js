"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((m) => m.UserButton),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/app/keys", label: "API Keys", icon: "vpn_key" },
  { href: "/app/usage", label: "Usage", icon: "bar_chart" },
  { href: "/app/plan", label: "Plan", icon: "credit_card" },
  { href: "/app/docs", label: "Docs", icon: "description" },
];

export default function UserLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text-main">
      <header className="border-b border-border-subtle bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted hover:bg-hover hover:text-text-main"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      {children}
    </div>
  );
}
