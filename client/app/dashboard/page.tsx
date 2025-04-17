import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export const metadata: Metadata = {
  title: "Student Dashboard | Student Tutor App",
  description: "View your learning progress and upcoming assignments",
};

export default function DashboardPage() {
  return <StudentDashboard />;
}
