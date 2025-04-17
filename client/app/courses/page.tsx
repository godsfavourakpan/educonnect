import { CourseCatalog } from "@/components/courses/CourseCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Catalog | Student Tutor App",
  description: "Browse available courses and learning materials",
};

export default function CoursesPage() {
  return <CourseCatalog />;
}
