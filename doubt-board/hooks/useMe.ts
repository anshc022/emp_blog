"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { AuthUser } from "@/lib/jwt";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: AuthUser & { email: string } }>("/api/auth/me").then((r) => r.user),
    staleTime: 5 * 60_000,
  });
}
