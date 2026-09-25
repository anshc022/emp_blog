import { TopNav, type NavItem } from "@/components/app-nav";
import { WelcomeSound } from "@/components/sound";
import { countInbox } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const counts = countInbox(user.id);

  const items: NavItem[] = [
    { href: "/inbox", label: "inbox", icon: "inbox", badge: counts.recent ?? 0 },
    { href: "/sent", label: "sent", icon: "sent" },
    ...(user.role === "admin"
      ? [
          { href: "/admin", label: "all tea", icon: "admin" },
          { href: "/admin/employees", label: "people", icon: "people" },
        ]
      : []),
  ];

  return (
    <div className="min-h-dvh">
      <WelcomeSound />
      <TopNav items={items} user={{ name: user.name }} />
      <main className="mx-auto w-full max-w-2xl px-5 pt-10 pb-24">{children}</main>
    </div>
  );
}
