import type { Metadata } from "next";

import { TeacherSession } from "@/components/teacher-session";

export const metadata: Metadata = { title: "Live board" };

export default async function TeacherSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherSession sessionId={id} />;
}
