"use client";

import React, { Suspense } from "react";
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
import { Plus, Pencil, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

// Create a client component that uses search params
function LessonsContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { user } = useAuth();
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    duration: "",
    order: 0,
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

  const handleAddLesson = async () => {
    // TODO: Implement lesson creation
    setIsAddingLesson(false);
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
          You must be the course instructor to manage lessons.
        </p>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Manage course lessons</p>
        </div>
        <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogDescription>
                Create a new lesson for your course. Add content, duration, and
                set the order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={newLesson.title}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newLesson.content}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, content: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newLesson.duration}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, duration: e.target.value })
                    }
                    placeholder="e.g., 30 mins"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={newLesson.order}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        order: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingLesson(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddLesson}>Add Lesson</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {course.lessons?.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">
                No lessons yet. Add your first lesson to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          course.lessons?.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {index + 1}. {lesson.title}
                </CardTitle>
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
                <p className="text-sm text-muted-foreground">
                  Duration: {lesson.duration}
                </p>
                <p className="mt-2 text-sm">{lesson.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Create a loading fallback component
function LessonsLoading() {
  return <div>Loading lessons...</div>;
}

// Main page component with Suspense boundary
export default function LessonsPage() {
  return (
    <main>
      <Suspense fallback={<LessonsLoading />}>
        <LessonsContent />
      </Suspense>
    </main>
  );
}
