import type { Metadata } from "next";

import { StudentSession } from "@/components/student-session";

export const metadata: Metadata = { title: "Live session" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentSession sessionId={id} />;
}
