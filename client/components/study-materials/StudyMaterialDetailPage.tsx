"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getStudyMaterialById, incrementDownloads } from "@/api/study-material";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Book,
  Download,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface StudyMaterialDetailPageProps {
  id: string;
}

export function StudyMaterialDetailPage({ id }: StudyMaterialDetailPageProps) {
  const router = useRouter();

  const { data: material, isLoading } = useQuery({
    queryKey: ["study-material", id],
    queryFn: () => getStudyMaterialById(id),
  });

  const downloadMutation = useMutation({
    mutationFn: () => incrementDownloads(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading study material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">
            Study Material Not Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            The study material you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/study-materials")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    downloadMutation.mutate();
    window.open(material.fileUrl, "_blank");
  };

  const typeIcon =
    material.type === "study_guide" ? (
      <Book className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const typeLabel =
    material.type === "study_guide" ? "Study Guide" : "Past Question";

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push("/study-materials")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Study Materials
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Badge variant="outline" className="mb-4">
              {typeIcon}
              <span className="ml-1">{typeLabel}</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Download className="h-3 w-3" />
              {material.downloads}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{material.title}</CardTitle>
          <CardDescription className="mt-2">
            {material.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Course Information</h3>
                <div className="space-y-2 rounded-lg border bg-card p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course</span>
                    <Link
                      href={`/courses/${material.courseId._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {material.courseId.title}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium">{material.subject}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">File Information</h3>
                <div className="space-y-2 rounded-lg border bg-card p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Name</span>
                    <span className="font-medium">{material.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="font-medium">
                      {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Uploaded by {material.uploadedBy.name}</span>
                <span>•</span>
                <span>{formatDate(material.createdAt)}</span>
              </div>

              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Material
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
