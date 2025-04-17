import type { Metadata } from "next";
import { TutorDashboard } from "@/components/dashboard/TutorDashboard";

export const metadata: Metadata = {
  title: "Tutor Dashboard | Student Tutor App",
  description: "Manage your students, classes, and assignments",
};

export default function TutorDashboardPage() {
  return <TutorDashboard />;
}
