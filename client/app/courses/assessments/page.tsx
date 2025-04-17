"use client";

import React, { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@/api/course";
import { getCourseById } from "@/api/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash, Clock, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "exam" | "assignment";
  duration: string;
  totalPoints: number;
  dueDate?: string;
  questions?: {
    id: string;
    text: string;
    type: "multiple_choice" | "true_false" | "essay";
    options?: string[];
    correctAnswer?: string | boolean;
    points: number;
  }[];
}

// Create a client component that uses search params
function AssessmentContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { user } = useAuth();
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Assessment>({
    id: "",
    title: "",
    description: "",
    type: "quiz",
    duration: "",
    totalPoints: 100,
    questions: [],
  });

  const {
    data: course,
    isLoading,
    error,
  } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId || ""),
    enabled: !!courseId,
  });

  const handleAddAssessment = async () => {
    // TODO: Implement assessment creation
    setIsAddingAssessment(false);
  };

  if (!courseId) {
    return <div className="container p-8">Course ID is required</div>;
  }

  if (isLoading) {
    return <div className="container p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container p-8">
        Error:{" "}
        {error instanceof Error ? error.message : "Failed to load course"}
      </div>
    );
  }

  if (!course) {
    return <div className="container p-8">Course not found</div>;
  }

  // Verify instructor access
  if (course.instructor.id !== user?._id) {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
        <p className="mt-2">
          You must be the course instructor to manage assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Manage course assessments</p>
        </div>
        <Dialog open={isAddingAssessment} onOpenChange={setIsAddingAssessment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Assessment</DialogTitle>
              <DialogDescription>
                Create a new assessment for your course. Configure the type,
                duration, and points.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  value={newAssessment.title}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAssessment.type}
                    onValueChange={(value: Assessment["type"]) =>
                      setNewAssessment({ ...newAssessment, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newAssessment.duration}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        duration: e.target.value,
                      })
                    }
                    placeholder="e.g., 60 mins"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalPoints">Total Points</Label>
                  <Input
                    id="totalPoints"
                    type="number"
                    value={newAssessment.totalPoints}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        totalPoints: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssessment.dueDate}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingAssessment(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAssessment}>Create Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {course.assessments?.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">
                No assessments yet. Add your first assessment to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          course.assessments?.map((assessment: Assessment) => (
            <Card key={assessment.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{assessment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {assessment.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge>{assessment.type}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {assessment.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-1 h-4 w-4" />
                    {assessment.totalPoints} points
                  </div>
                </div>
                {assessment.dueDate && (
                  <p className="mt-4 text-sm">
                    Due: {new Date(assessment.dueDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Create a loading fallback component
function AssessmentLoading() {
  return <div>Loading assessments...</div>;
}

// Main page component with Suspense boundary
export default function AssessmentsPage() {
  return (
    <main>
      <Suspense fallback={<AssessmentLoading />}>
        <AssessmentContent />
      </Suspense>
    </main>
  );
}
