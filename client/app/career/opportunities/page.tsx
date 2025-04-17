import type { Metadata } from "next";
import { OpportunitiesList } from "@/components/career/OpportunitiesList";

export const metadata: Metadata = {
  title: "Career Opportunities | Student Tutor App",
  description: "Explore job opportunities, internships, and career paths",
};

export default function OpportunitiesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Career Opportunities</h1>
        <p className="text-muted-foreground">
          Explore job opportunities, internships, and career paths
        </p>
      </div>
      <OpportunitiesList />
    </div>
  );
}
