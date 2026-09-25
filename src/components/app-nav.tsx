"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Inbox, PenLine, Send, Users, type LucideIcon } from "lucide-react";
import { PersonAvatar } from "./avatar";
import { Logo } from "./brand";
import { MuteToggle } from "./sound";

const ICONS: Record<string, LucideIcon> = { inbox: Inbox, sent: Send, admin: Eye, people: Users };

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function TopNav({ items, user }: { items: NavItem[]; user: { name: string } }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-6 px-5">
        <Link href="/" data-sound="tap" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden flex-1 items-center gap-5 sm:flex">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <MuteToggle className="hidden sm:inline-flex" />
          <Link href="/give" data-sound="open" className="btn">
            <PenLine size={15} strokeWidth={2} /> write
          </Link>
          <Link href="/account" data-sound="tap" aria-label="Account" className="ml-1">
            <PersonAvatar name={user.name} size={30} />
          </Link>
        </div>
      </div>
      {/* phone: nav on its own row */}
      <nav className="mx-auto flex max-w-2xl gap-5 overflow-x-auto px-5 pb-2.5 sm:hidden">
        {items.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <MuteToggle className="ml-auto shrink-0 !py-0.5" />
      </nav>
    </header>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      data-sound="tap"
      className={`relative flex shrink-0 items-center gap-1.5 text-sm transition ${
        active ? "font-medium text-text" : "text-muted hover:text-text"
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      {item.label}
      {!!item.badge && (
        <span className="grid min-w-[18px] place-items-center rounded-full bg-star px-1 text-[11px] font-semibold leading-[18px] text-[#0a0a0a]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
