"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, LogOut, PenLine, Send, Users } from "lucide-react";
import { logout } from "@/lib/actions";
import { PersonAvatar } from "./avatar";
import { Logo } from "./brand";

const ICONS = { inbox: Inbox, give: PenLine, sent: Send, admin: LayoutDashboard, people: Users };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function Sidebar({
  items,
  adminItems,
  user,
}: {
  items: NavItem[];
  adminItems: NavItem[];
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const Icon = ICONS[item.icon];
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition ${
          active ? "bg-surface font-semibold text-ink shadow-card" : "text-muted hover:bg-sunken hover:text-ink"
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.4 : 2} className={active ? "text-accent" : ""} />
        <span className="flex-1">{item.label}</span>
        {!!item.badge && (
          <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-accent-ink">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
      <Link href="/" className="px-2">
        <Logo />
      </Link>

      <Link href="/give" className="btn-accent mt-8 w-full py-3">
        <PenLine size={16} strokeWidth={2.4} /> Write feedback
      </Link>

      <nav className="mt-6 space-y-1">{items.filter((i) => i.href !== "/give").map(renderItem)}</nav>

      {adminItems.length > 0 && (
        <>
          <div className="eyebrow mt-8 mb-2 px-3">Super admin</div>
          <nav className="space-y-1">{adminItems.map(renderItem)}</nav>
        </>
      )}

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
        <Link href="/account" className="flex min-w-0 flex-1 items-center gap-3">
          <PersonAvatar name={user.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-faint">{user.role === "admin" ? "Super admin" : user.email}</div>
          </div>
        </Link>
        <form action={logout}>
          <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({ items, user }: { items: NavItem[]; user: { name: string } }) {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/"><Logo /></Link>
        <Link href="/account" aria-label="Account"><PersonAvatar name={user.name} size={32} /></Link>
      </header>
      <nav className="fixed inset-x-3 bottom-3 z-20 flex justify-around rounded-2xl border border-line bg-surface/95 p-1.5 shadow-card backdrop-blur lg:hidden">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href);
          const primary = item.href === "/give";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium ${
                primary ? "text-accent" : active ? "text-ink" : "text-faint"
              }`}
            >
              <span className={primary ? "grid size-9 place-items-center rounded-full bg-accent text-accent-ink" : ""}>
                <Icon size={primary ? 18 : 20} strokeWidth={active || primary ? 2.4 : 2} />
              </span>
              {!primary && item.label}
              {!!item.badge && !primary && (
                <span className="absolute top-0.5 right-1/4 size-2 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
