"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import { PersonAvatar } from "./avatar";
import { Logo } from "./brand";

export type NavItem = { href: string; label: string; emoji: string; badge?: number; color: string };

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
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-[16px] font-bold transition ${
          active
            ? "border-line text-on-bright shadow-[3px_3px_0_0_var(--line)]"
            : "border-transparent text-muted hover:border-line hover:text-text"
        }`}
        style={active ? { background: item.color } : undefined}
      >
        <span className="text-xl transition group-hover:scale-125 group-hover:-rotate-12">{item.emoji}</span>
        <span className="flex-1">{item.label}</span>
        {!!item.badge && (
          <span className="grid min-w-6 place-items-center rounded-full border-2 border-line bg-pink px-1.5 font-mono text-[11px] leading-5 text-on-bright">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r-[2.5px] border-line bg-surface px-5 py-6 lg:flex">
      <Link href="/" className="px-1">
        <Logo />
      </Link>

      <Link href="/give" className="btn mt-8 w-full bg-pink py-3.5 text-[17px]">
        spill the tea ☕
      </Link>

      <nav className="mt-7 space-y-1.5">{items.filter((i) => i.href !== "/give").map(renderItem)}</nav>

      {adminItems.length > 0 && (
        <>
          <div className="tag mt-8 mb-2 px-3 text-faint">god mode 👁️</div>
          <nav className="space-y-1.5">{adminItems.map(renderItem)}</nav>
        </>
      )}

      <div className="brut-sm mt-auto flex items-center gap-3 bg-sunken p-3">
        <Link href="/account" className="flex min-w-0 flex-1 items-center gap-3">
          <PersonAvatar name={user.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{user.name}</div>
            <div className="tag truncate text-faint">{user.role === "admin" ? "👑 super admin" : "✌️ employee"}</div>
          </div>
        </Link>
        <form action={logout}>
          <button className="btn-sm" title="log out" aria-label="Log out">👋</button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({ items, user }: { items: NavItem[]; user: { name: string } }) {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-[2.5px] border-line bg-surface px-4 py-3 lg:hidden">
        <Link href="/"><Logo size={32} /></Link>
        <Link href="/account" aria-label="Account"><PersonAvatar name={user.name} size={36} /></Link>
      </header>
      <nav className="brut fixed inset-x-3 bottom-3 z-30 flex items-center justify-around !rounded-2xl p-1.5 lg:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          if (item.href === "/give") {
            return (
              <Link key={item.href} href={item.href} aria-label="Spill the tea" className="-mt-7 grid size-16 place-items-center rounded-full border-[2.5px] border-line bg-pink text-3xl shadow-[3px_3px_0_0_var(--line)] active:translate-y-0.5">
                ☕
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-1 text-[11px] font-bold ${
                active ? "border-line text-on-bright" : "border-transparent text-muted"
              }`}
              style={active ? { background: item.color } : undefined}
            >
              <span className="text-xl">{item.emoji}</span>
              {item.label}
              {!!item.badge && (
                <span className="absolute -top-1 right-2 grid min-w-5 place-items-center rounded-full border-2 border-line bg-pink px-1 font-mono text-[10px] text-on-bright">
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
    <div className="overflow-hidden border-b-[2.5px] border-line bg-lime py-2 text-on-bright" aria-hidden>
      <div className="marquee flex w-max gap-10 pr-10 text-sm font-extrabold whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t} <span className="text-base">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
