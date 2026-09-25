import { MobileNav, Sidebar, type NavItem } from "@/components/app-nav";
import { countInbox } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const counts = countInbox(user.id);

  const items: NavItem[] = [
    { href: "/inbox", label: "Inbox", icon: "inbox", badge: counts.recent ?? 0 },
    { href: "/give", label: "Write", icon: "give" },
    { href: "/sent", label: "Sent", icon: "sent" },
  ];
  const adminItems: NavItem[] =
    user.role === "admin"
      ? [
          { href: "/admin", label: "All feedback", icon: "admin" },
          { href: "/admin/employees", label: "People", icon: "people" },
        ]
      : [];

  const who = { name: user.name, email: user.email, role: user.role };

  return (
    <div className="flex min-h-dvh">
      <Sidebar items={items} adminItems={adminItems} user={who} />
      <div className="min-w-0 flex-1">
        <MobileNav items={[...items, ...adminItems.slice(0, 1)]} user={who} />
        <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-32 sm:px-8 lg:pt-14 lg:pb-16">{children}</main>
      </div>
    </div>
  );
}
