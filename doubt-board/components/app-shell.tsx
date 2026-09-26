import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getUser } from "@/lib/auth";

/** Header + page container for signed-in pages. */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const links =
    user.role === "teacher"
      ? [
          { href: "/teacher", label: "Sessions" },
          { href: "/teacher/analytics", label: "Analytics" },
        ]
      : [{ href: "/join", label: "Join a session" }];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Brand href={user.role === "teacher" ? "/teacher" : "/join"} className="shrink-0" />
          <NavLinks links={links} />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="text-muted-foreground border-t py-4 text-center text-xs">
        <Link href="/" className="hover:text-foreground">
          Live Doubt Board
        </Link>{" "}
        · no question is a silly question
      </footer>
    </div>
  );
}
