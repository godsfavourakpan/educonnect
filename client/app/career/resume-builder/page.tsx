import type { Metadata } from "next";
import { ResumeBuilder } from "@/components/career/ResumeBuilder";

export const metadata: Metadata = {
  title: "Resume Builder | Student Tutor App",
  description: "Create and customize your professional resume",
};

export default function ResumeBuilderPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Resume Builder</h1>
        <p className="text-muted-foreground">
          Create and customize your professional resume
        </p>
      </div>
      <ResumeBuilder />
    </div>
  );
}
