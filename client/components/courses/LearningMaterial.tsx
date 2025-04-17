/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseById,
  markLessonComplete,
  downloadResource,
} from "@/api/course";
import { getCourseProgress, CourseProgressResponse } from "@/api/student";
import type { Course, MarkLessonCompleteParams } from "@/api/course";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  MessageSquare,
  Play,
  Settings,
  ThumbsUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function LearningMaterial({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [userProgress, setUserProgress] = useState({
    completedLessonsCount: 0,
    totalLessons: 0,
    progressPercentage: 0,
    completedLessons: [] as string[],
  });

  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await getCourseById(courseId);
      return response.course;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // console.log("Course data:", course);

  // Fetch user-specific progress for this course
  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useQuery<CourseProgressResponse["progress"]>({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      return await getCourseProgress(courseId);
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Update user progress state when data changes
  useEffect(() => {
    if (progress) {
      console.log("Progress data:", progress);
      setUserProgress({
        completedLessonsCount: progress.completedLessonsCount || 0,
        totalLessons: progress.totalLessons || 0,
        progressPercentage: progress.progressPercentage || 0,
        completedLessons:
          progress.completedLessons?.map((id: string) => id.toString()) || [],
      });
    }
  }, [progress]);

  const queryClient = useQueryClient();

  const { mutate: markLessonCompleteMutation } = useMutation({
    mutationFn: (params: MarkLessonCompleteParams) =>
      markLessonComplete(params),
    onSuccess: (data, variables) => {
      console.log("Lesson marked as complete successfully:", data);
      // Invalidate and refetch both course and progress data
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", variables.courseId],
      });
      
      // Show success message
      toast.success("Lesson marked as completed!");
      
      // Move to next lesson on success after a short delay
      setTimeout(() => {
        handleNextLesson();
      }, 500);
    },
    onError: (error) => {
      console.error("Error marking lesson as complete:", error);
      toast.error("Failed to mark lesson as completed. Please try again.");
    },
  });

  const isLoading = isLoadingCourse || isLoadingProgress;
  const error = courseError || progressError;

  if (isLoading) {
    return <div className="text-center py-8">Loading course materials...</div>;
  }

  if (error || !course) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading course materials
      </div>
    );
  }

  const currentModule = course?.modules?.[currentModuleIndex];
  const currentLesson = currentModule?.lessons?.[currentLessonIndex];

  // Use the user-specific progress data instead of calculating from course data
  const totalLessons =
    userProgress.totalLessons ||
    course?.modules?.reduce(
      (total: number, module: { lessons: string | any[] }) =>
        total + (module.lessons?.length || 0),
      0
    ) ||
    0;

  const completedLessons = userProgress.completedLessonsCount || 0;
  const progressPercentage = userProgress.progressPercentage || 0;

  const handleLessonSelect = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < currentModule?.lessons?.length - 1) {
      // Next lesson in current module
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < course?.modules?.length - 1) {
      // First lesson in next module
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      // Previous lesson in current module
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (
      currentModuleIndex > 0 &&
      course?.modules?.[currentModuleIndex - 1]?.lessons?.length
    ) {
      // Last lesson in previous module
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(
        course?.modules?.[currentModuleIndex - 1]?.lessons?.length - 1
      );
    }
  };

  const markAsCompleted = () => {
    if (!currentLesson || !course) {
      toast.error("Cannot mark lesson as completed. Course or lesson data is missing.");
      return;
    }
    
    // Check if this lesson is already marked as completed
    if (userProgress.completedLessons.includes(currentLesson.id)) {
      toast.info("This lesson is already marked as completed.");
      return;
    }

    // Mark the current lesson as completed using the mutation
    // This will call the server-side API to update the progress in the database
    markLessonCompleteMutation({
      courseId: course._id,
      lessonId: currentLesson.id,
    });
    
    // Note: We don't need to update local state here as the mutation success handler
    // will invalidate and refetch the course progress data, which will then update
    // the UI automatically through the useEffect hook that watches the progress data
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleDownloadResource = async (resourceId: string) => {
    try {
      console.log(
        `Downloading resource: ${resourceId} from course: ${courseId}`
      );
      const response = await downloadResource(courseId, resourceId);

      if (response && response.url) {
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = response.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = ""; // This will use the filename from the URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Resource download started");
      } else {
        console.error("No download URL available");
        toast.error("Download link not available");
      }
    } catch (error) {
      console.error("Failed to download resource:", error);
      toast.error("Failed to download resource");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/courses/${courseId}`}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to course</span>
            </Link>
          </Button>
          <h1 className="ml-2 text-lg font-medium">{course.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "Hide" : "Show"} Curriculum
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 overflow-y-auto border-r">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {completedLessons} of {totalLessons} lessons completed
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {progressPercentage}%
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <Accordion
                  type="multiple"
                  defaultValue={[currentModule?.id]}
                  className="w-full"
                >
                  {course.modules?.map(
                    (
                      module: {
                        _id: string;
                        id: Key | null | undefined;
                        title:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        lessons: any[];
                      },
                      moduleIndex: number
                    ) => (
                      <AccordionItem key={module.id} value={module._id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="text-left">
                            <h4 className="font-medium">{module.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {module.lessons.length} lessons
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 pt-1">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <li key={lesson.id}>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start ${
                                    moduleIndex === currentModuleIndex &&
                                    lessonIndex === currentLessonIndex
                                      ? "bg-muted"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleLessonSelect(moduleIndex, lessonIndex)
                                  }
                                >
                                  <div className="flex w-full items-center">
                                    {userProgress.completedLessons.includes(
                                      lesson.id
                                    ) ? (
                                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                      <div className="mr-2 h-4 w-4 rounded-full border border-muted" />
                                    )}
                                    {lesson.type.toLowerCase() === "video" ? (
                                      <Play className="mr-2 h-4 w-4" />
                                    ) : (
                                      <FileText className="mr-2 h-4 w-4" />
                                    )}
                                    <span className="text-left">
                                      {lesson.title}
                                    </span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
              <p className="text-muted-foreground">
                {currentModule?.title} • Lesson {currentLessonIndex + 1} of{" "}
                {currentModule?.lessons.length}
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                {currentLesson?.type.toLowerCase() === "video" &&
                currentLesson?.content ? (
                  <div className="space-y-6">
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          currentLesson.content.videoUrl
                            .split("v=")[1]
                            ?.split("&")[0]
                        }?autoplay=0&rel=0&modestbranding=1&origin=${encodeURIComponent(
                          window.location.origin
                        )}`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                        title={currentLesson.title}
                      ></iframe>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium">Description</h3>
                      <p>{currentLesson.content.description}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium">Transcript</h3>
                      <p className="whitespace-pre-line">
                        {currentLesson.content.transcript}
                      </p>
                    </div>
                  </div>
                ) : currentLesson?.type === "exercise" &&
                  currentLesson?.content ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-medium">
                        Practice Problems
                      </h3>
                      <p className="mb-6">
                        Complete these practice problems to test your
                        understanding of the material.
                      </p>

                      <div className="space-y-8">
                        {currentLesson.content.problems.map(
                          (
                            problem: {
                              _id: any;
                              id: Key | null | undefined;
                              question:
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | ReactPortal
                                | Promise<
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactPortal
                                    | ReactElement<
                                        unknown,
                                        string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | null
                                    | undefined
                                  >
                                | null
                                | undefined;
                              options: any[];
                            },
                            index: number
                          ) => (
                            <div
                              key={problem.id}
                              className="rounded-lg border p-4"
                            >
                              <h4 className="mb-3 font-medium">
                                Question {index + 1}: {problem.question}
                              </h4>
                              <div className="space-y-2">
                                {problem.options.map((option) => (
                                  <div
                                    key={option}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="radio"
                                      id={`${problem._id}-${option}`}
                                      name={problem._id}
                                      className="h-4 w-4 border-gray-300"
                                    />
                                    <label
                                      htmlFor={`${problem.id}-${option}`}
                                      className="ml-2 block text-sm"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mt-6">
                        <Button>Submit Answers</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">
                      No content available for this lesson.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Lesson Resources</h3>

                  <ul className="space-y-2">
                    {course.resources?.map(
                      (resource: {
                        id: Key | null | undefined;
                        title:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        type: string;
                        size:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                      }) => (
                        <li key={resource.id}>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() =>
                              resource.id &&
                              handleDownloadResource(resource.id.toString())
                            }
                          >
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>{resource.title}</span>
                              <Badge variant="outline" className="ml-2">
                                {resource.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2 text-sm text-muted-foreground">
                                {resource.size}
                              </span>
                              <Download className="h-4 w-4" />
                            </div>
                          </Button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Lesson
              </Button>

              {!userProgress.completedLessons.includes(currentLesson?.id) ? (
                <Button onClick={markAsCompleted}>Mark as Completed</Button>
              ) : (
                <Button variant="outline" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Completed
                </Button>
              )}

              <Button
                onClick={handleNextLesson}
                disabled={
                  currentModuleIndex === course?.modules?.length - 1 &&
                  currentLessonIndex ===
                    course?.modules?.[currentModuleIndex]?.lessons?.length - 1
                }
              >
                Next Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
