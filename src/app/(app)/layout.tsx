import { MobileNav, Sidebar, Ticker, type NavItem } from "@/components/app-nav";
import { WelcomeSound } from "@/components/sound";
import { countInbox, getStats } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const counts = countInbox(user.id);
  const stats = getStats();

  const items: NavItem[] = [
    { href: "/inbox", label: "inbox", emoji: "📥", badge: counts.recent ?? 0, color: "var(--lime)" },
    { href: "/give", label: "spill", emoji: "☕", color: "var(--pink)" },
    { href: "/sent", label: "receipts", emoji: "🧾", color: "var(--blue)" },
  ];
  const adminItems: NavItem[] =
    user.role === "admin"
      ? [
          { href: "/admin", label: "all the tea", emoji: "👁️", color: "var(--yellow)" },
          { href: "/admin/employees", label: "the squad", emoji: "👯", color: "var(--lilac)" },
        ]
      : [];

  const who = { name: user.name, email: user.email, role: user.role };
  const ticker = [
    `☕ ${stats.this_week} notes spilled this week`,
    `⭐ ${stats.stars} stars handed out`,
    "🤫 100% anonymous to your coworkers",
    "💅 honest ≠ mean",
    "🧢 no cap, just feedback",
    `👯 ${stats.employees} humans in the chat`,
    "🧃 remember to hydrate",
  ];

  return (
    <div className="flex min-h-dvh">
      <WelcomeSound />
      <Sidebar items={items} adminItems={adminItems} user={who} />
      <div className="min-w-0 flex-1">
        <MobileNav
          items={adminItems.length ? [items[0], items[2], items[1], ...adminItems] : items}
          user={who}
        />
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-8 lg:pt-6">
          <Ticker items={ticker} />
        </div>
        <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-36 sm:px-8 lg:pt-10 lg:pb-16">{children}</main>
      </div>
    </div>
  );
}
