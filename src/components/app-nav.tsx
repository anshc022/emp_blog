"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import { play } from "@/lib/sound";
import { PersonAvatar } from "./avatar";
import { Logo } from "./brand";
import { MuteToggle } from "./sound";

export type NavItem = { href: string; label: string; emoji: string; badge?: number; color: string };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logout} onSubmit={() => play("bye")} className={className ? "flex-1" : undefined}>
      <button className={`btn-sm ${className}`} title="log out" aria-label="Log out">👋</button>
    </form>
  );
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
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        data-sound="tap"
        data-sound-hover="hover"
        className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[16px] font-bold transition-all duration-300 ${
          active ? "bg-surface-strong text-text shadow-[0_10px_24px_-12px_var(--glow)]" : "text-muted hover:bg-sunken hover:text-text"
        }`}
      >
        {active && (
          <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full" style={{ backgroundImage: "var(--grad)" }} />
        )}
        <span
          className="grid size-9 place-items-center rounded-xl text-lg transition group-hover:scale-110 group-hover:-rotate-6"
          style={{ background: active ? item.color : "transparent" }}
        >
          {item.emoji}
        </span>
        <span className="flex-1">{item.label}</span>
        {!!item.badge && (
          <span
            className="grid min-w-6 place-items-center rounded-full px-1.5 font-mono text-[11px] leading-5 text-white"
            style={{ backgroundImage: "var(--grad)" }}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-[288px] shrink-0 p-4 lg:block">
      <div className="brut flex h-full flex-col px-4 py-6">
        <Link href="/" className="px-2" data-sound="tap">
          <Logo />
        </Link>

        <Link href="/give" data-sound="open" className="btn-grad mt-8 w-full py-3.5 text-[17px]">
          spill the tea ☕
        </Link>

        <nav className="mt-6 space-y-1">{items.filter((i) => i.href !== "/give").map(renderItem)}</nav>

        {adminItems.length > 0 && (
          <>
            <div className="tag mt-7 mb-2 px-3 text-faint">god mode 👁️</div>
            <nav className="space-y-1">{adminItems.map(renderItem)}</nav>
          </>
        )}

        <div className="mt-auto rounded-2xl bg-sunken p-3">
          <Link href="/account" data-sound="tap" className="flex min-w-0 items-center gap-2.5">
            <PersonAvatar name={user.name} size={40} />
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{user.name}</div>
              <div className="truncate text-xs font-semibold text-faint">
                {user.role === "admin" ? "👑 super admin" : "✌️ employee"}
              </div>
            </div>
          </Link>
          <div className="mt-3 flex gap-2">
            <MuteToggle className="flex-1" />
            <LogoutButton className="w-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ items, user }: { items: NavItem[]; user: { name: string } }) {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-surface px-4 py-3 backdrop-blur-xl dark:border-white/10 lg:hidden">
        <Link href="/" data-sound="tap"><Logo size={32} /></Link>
        <div className="flex items-center gap-2">
          <MuteToggle />
          <Link href="/account" data-sound="tap" aria-label="Account"><PersonAvatar name={user.name} size={36} /></Link>
        </div>
      </header>
      <nav className="brut fixed inset-x-3 bottom-3 z-30 flex items-center justify-around !rounded-[26px] p-1.5 lg:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          if (item.href === "/give") {
            return (
              <Link
                key={item.href}
                href={item.href}
                data-sound="open"
                aria-label="Spill the tea"
                className="press -mt-8 grid size-16 place-items-center rounded-full border-4 border-white text-3xl shadow-[0_12px_30px_-8px_rgb(255_79_154/0.8)] dark:border-[#1c1330]"
                style={{ backgroundImage: "var(--grad)" }}
              >
                ☕
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              data-sound="tap"
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
                active ? "text-text" : "text-faint"
              }`}
            >
              <span
                className={`grid size-8 place-items-center rounded-xl text-lg transition ${active ? "scale-110" : ""}`}
                style={{ background: active ? item.color : "transparent" }}
              >
                {item.emoji}
              </span>
              {item.label}
              {!!item.badge && (
                <span
                  className="absolute top-0 right-3 grid min-w-5 place-items-center rounded-full px-1 font-mono text-[10px] text-white"
                  style={{ backgroundImage: "var(--grad)" }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div
      className="overflow-hidden rounded-full py-2.5 text-white shadow-[0_10px_30px_-12px_rgb(160_60_240/0.6)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
      style={{ backgroundImage: "var(--grad-cool)" }}
      aria-hidden
    >
      <div className="marquee flex w-max gap-10 pr-10 text-sm font-bold whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t} <span className="opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
