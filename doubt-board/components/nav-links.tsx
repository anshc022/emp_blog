"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-0.5 sm:flex">
      {links.map((l) => {
        const active =
          l.href === pathname ||
          (l.href !== "/teacher" && pathname.startsWith(l.href)) ||
          (l.href === "/teacher" && (pathname === "/teacher" || pathname.startsWith("/teacher/session")));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="bg-accent absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
