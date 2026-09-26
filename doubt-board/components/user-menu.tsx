"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

export function initials(name: string) {
  return name
    .replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

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
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full pr-3 pl-1" aria-label="Account menu">
          <span className="bg-primary/15 text-primary grid size-7 place-items-center rounded-full text-xs font-semibold">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="truncate">{user.name}</div>
          <div className="text-muted-foreground text-xs font-normal capitalize">{user.role}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((l) => (
          <DropdownMenuItem key={l.href} asChild className="sm:hidden">
            <Link href={l.href}>{l.label}</Link>
          </DropdownMenuItem>
        ))}
        {links.length > 0 && <DropdownMenuSeparator className="sm:hidden" />}
        <DropdownMenuItem onSelect={logout}>
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
