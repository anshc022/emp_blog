import type { Metadata } from "next";

import { NewSessionForm } from "@/components/new-session-form";

export const metadata: Metadata = { title: "New session" };

export default function NewSessionPage() {
  return <NewSessionForm />;
}
