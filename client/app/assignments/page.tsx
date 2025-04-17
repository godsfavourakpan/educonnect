import type { Metadata } from "next";
import { AssignmentNavigation } from "@/components/assignments/AssignmentNavigation";

export const metadata: Metadata = {
  title: "Assignments | Student Tutor App",
  description: "View and manage your assignments",
};

export default function AssignmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View and manage all your assignments in one place
        </p>
      </div>
      <AssignmentNavigation />
    </div>
  );
}
