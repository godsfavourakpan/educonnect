import { LiveClassSchedule } from "@/components/live-classes/LiveClassSchedule";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Classes | Student Tutor App",
  description: "View and join upcoming live classes and webinars",
};

export default function LiveClassesPage() {
  return <LiveClassSchedule />;
}
