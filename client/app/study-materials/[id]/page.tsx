import { Metadata } from "next";
import { StudyMaterialDetailPage } from "@/components/study-materials/StudyMaterialDetailPage";

export const metadata: Metadata = {
  title: "Study Material | EduConnect",
  description: "View and download study materials",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <StudyMaterialDetailPage id={params.id} />;
}
