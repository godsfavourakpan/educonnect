import type { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | EduConnect",
  description: "Manage users, courses, and system settings",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
