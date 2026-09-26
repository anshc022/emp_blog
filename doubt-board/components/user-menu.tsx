"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CaretDownIcon, SignOutIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Avatar } from "@/components/art/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import type { AuthUser } from "@/lib/jwt";

export function UserMenu({ user, links = [] }: { user: AuthUser; links?: { href: string; label: string }[] }) {
  const router = useRouter();
  const qc = useQueryClient();

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
      qc.clear();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent flex h-10 cursor-pointer items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label="Account menu"
      >
        <Avatar name={user.name} seed={user.id} className="size-8 ring-0" />
        <span className="hidden max-w-32 truncate md:inline">{user.name.split(" ").slice(0, 2).join(" ")}</span>
        <CaretDownIcon weight="bold" className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar name={user.name} seed={user.id} className="size-9 ring-0" />
          <div className="min-w-0">
            <div className="truncate">{user.name}</div>
            <div className="text-muted-foreground text-xs font-normal capitalize">{user.role}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((l) => (
          <DropdownMenuItem key={l.href} asChild className="sm:hidden">
            <Link href={l.href}>{l.label}</Link>
          </DropdownMenuItem>
        ))}
        {links.length > 0 && <DropdownMenuSeparator className="sm:hidden" />}
        <DropdownMenuItem onSelect={logout}>
          <SignOutIcon weight="bold" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
