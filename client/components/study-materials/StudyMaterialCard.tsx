"use client";

import { StudyMaterial } from "@/api/study-material";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Download, FileText } from "lucide-react";

interface StudyMaterialCardProps {
  material: StudyMaterial;
  onClick?: () => void;
}

export function StudyMaterialCard({
  material,
  onClick,
}: StudyMaterialCardProps) {
  const typeIcon =
    material.type === "study_guide" ? (
      <Book className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const typeLabel =
    material.type === "study_guide" ? "Study Guide" : "Past Question";

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="outline" className="mb-2">
            {typeIcon}
            <span className="ml-1">{typeLabel}</span>
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Download className="h-3 w-3" />
            {material.downloads}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{material.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {material.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Course</span>
            <span className="font-medium text-foreground">
              {material.courseId.title}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Subject</span>
            <span className="font-medium text-foreground">
              {material.subject}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Uploaded</span>
            <span className="font-medium text-foreground">
              {formatDate(material.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
