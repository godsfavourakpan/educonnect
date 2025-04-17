"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudyMaterials } from "@/api/study-material";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StudyMaterialCard } from "./StudyMaterialCard";
import { Empty } from "@/components/Empty";
import { FileText, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadDialog } from "./UploadDialog";

export function StudyMaterialsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("study_guide");
  const [subject, setSubject] = useState<string>("physics");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["study-materials", { search, type, subject }],
    queryFn: () => getStudyMaterials({ search, type, subject }),
  });

  console.log("Study materials data:", data);

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Study Materials"
        description="Access study guides and past questions for your courses"
        action={
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Material Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="study_guide">Study Guides</SelectItem>
              <SelectItem value="past_question">Past Questions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub} value={sub.toLowerCase()}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials List */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[200px] animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : !data?.materials.length ? (
          <Empty
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No study materials found"
            description="Try adjusting your search or filters, or upload a new material."
            actionLabel="Upload Material"
            onAction={() => setIsUploadOpen(true)}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.materials.map((material) => (
              <StudyMaterialCard
                key={material._id}
                material={material}
                onClick={() => router.push(`/study-materials/${material._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}
