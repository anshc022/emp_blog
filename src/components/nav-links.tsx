"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
              active ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
