import { NavLinks } from "@/components/nav-links";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  const links = [
    { href: "/inbox", label: "Inbox" },
    { href: "/give", label: "Give feedback" },
    { href: "/sent", label: "Sent" },
    ...(user.role === "admin"
      ? [
          { href: "/admin", label: "All feedback" },
          { href: "/admin/employees", label: "Employees" },
        ]
      : []),
  ];

  return (
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="font-semibold">Feedback Channel</span>
          <NavLinks links={links} />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <a href="/account" className="text-zinc-600 hover:text-zinc-900">
              {user.name}
              {user.role === "admin" && (
                <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">admin</span>
              )}
            </a>
            <form action={logout}>
              <button className="btn-ghost">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
