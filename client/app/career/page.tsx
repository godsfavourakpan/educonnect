import type { Metadata } from "next";
import { CareerDashboard } from "@/components/career/CareerDashboard";

export const metadata: Metadata = {
  title: "Career Development | Student Tutor App",
  description:
    "Explore career opportunities, build your resume, and find scholarships",
};

export default function CareerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Career Development</h1>
        <p className="text-muted-foreground">
          Explore career opportunities, build your resume, and find scholarships
        </p>
      </div>
      <CareerDashboard />
    </div>
  );
}
