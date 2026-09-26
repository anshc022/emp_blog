import type { Metadata } from "next";
import { Suspense } from "react";

import { JoinForm } from "@/components/join-form";

export const metadata: Metadata = { title: "Join a session" };

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
