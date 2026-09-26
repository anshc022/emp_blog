import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getUser } from "@/lib/auth";

/** Floating pill header + page container for signed-in pages. */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const links =
    user.role === "teacher"
      ? [
          { href: "/teacher", label: "Sessions" },
          { href: "/teacher/new", label: "New session" },
          { href: "/teacher/analytics", label: "Analytics" },
        ]
      : [{ href: "/join", label: "Join a session" }];

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col">
      {/* soft colour wash at the top of every page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-[radial-gradient(60%_100%_at_20%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent),radial-gradient(40%_80%_at_90%_0%,color-mix(in_oklab,var(--bubblegum)_10%,transparent),transparent)]"
      />
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="bg-card/75 shadow-soft mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-full border pr-2 pl-4 backdrop-blur-xl sm:gap-5">
          <Brand href={user.role === "teacher" ? "/teacher" : "/join"} className="shrink-0" />
          <NavLinks links={links} />
          <div className="ml-auto flex items-center gap-0.5">
            <ThemeToggle />
            <UserMenu user={user} links={links} />
          </div>
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">{children}</main>
      <footer className="text-muted-foreground relative px-4 pb-6 text-center text-xs">
        made for the quiet kids in the back row ✦ <span className="font-serif-i text-sm">no question is a silly question</span>
      </footer>
    </div>
  );
}
