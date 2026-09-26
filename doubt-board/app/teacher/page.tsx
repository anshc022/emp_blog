import type { Metadata } from "next";

import { TeacherDashboard } from "@/components/teacher-dashboard";

export const metadata: Metadata = { title: "Your sessions" };

export default function TeacherPage() {
  return <TeacherDashboard />;
}
