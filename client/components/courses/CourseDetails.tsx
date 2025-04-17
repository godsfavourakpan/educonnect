"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Clock,
  Download,
  FileText,
  Globe,
  Play,
  Star,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCourseById, downloadResource } from "@/api/course";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "@/api/course";
import { enrollCourse } from "@/api/course";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getEnrolledCourses, EnrolledCourse, getCourseProgress } from "@/api/student";

interface CourseDetailsProps {
  courseId: string;
}

// Resource type definition
interface CourseResource {
  id: string;
  title: string;
  type: string;
  size?: string;
  url?: string;
}

export function CourseDetails({ courseId }: CourseDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(0);
  const { user, updateUserData } = useAuth();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery<Course, Error>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      try {
        const response = await getCourseById(courseId);

        if (response instanceof Error) throw response;
        return response.course;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to fetch course");
      }
    },
  });

  // Fetch enrolled courses to check enrollment status
  const { data: enrolledCourses = [] } = useQuery<EnrolledCourse[]>({
    queryKey: ["enrolledCourses"],
    queryFn: getEnrolledCourses,
    enabled: !!user?._id,
  });
  
  // Fetch user-specific progress for this course
  const { data: courseProgressData } = useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      try {
        return await getCourseProgress(courseId);
      } catch (error) {
        console.error("Error fetching course progress:", error);
        return null;
      }
    },
    enabled: !!user?._id && isEnrolled,
    refetchOnWindowFocus: false,
  });

  // use effect to check if user is enrolled
  useEffect(() => {
    if (user && enrolledCourses.length > 0) {
      // Find the enrolled course that matches the current courseId
      const enrolledCourse = enrolledCourses.find(
        (course) => course._id === courseId
      );

      const isUserEnrolled = !!enrolledCourse;
      setIsEnrolled(isUserEnrolled);
    }
  }, [user, courseId, enrolledCourses]);
  
  // Update progress from the course progress data
  useEffect(() => {
    if (courseProgressData) {
      console.log("Course progress data:", courseProgressData);
      setCourseProgress(courseProgressData.progressPercentage || 0);
      setCompletedLessonsCount(courseProgressData.completedLessonsCount || 0);
    }
  }, [courseProgressData]);

  if (isLoading) {
    return <div className="text-center py-8">Loading course details...</div>;
  }

  if (error || !course) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading course details
      </div>
    );
  }

  // Calculate total lessons
  const totalLessons =
    course.modules?.reduce(
      (total: number, module: any) => total + (module.lessons?.length || 0),
      0
    ) || 0;

  const handleEnroll = async () => {
    try {
      const response = await enrollCourse(courseId);
      console.log("Enrollment response:", response);

      // Update user info with the new enrolled course
      if (user && response.user) {
        // Use the returned updated user data or update manually
        if (response.user) {
          updateUserData(response.user);
        } else {
          const updatedEnrolledCourses = [
            ...(user.enrolledCourses || []),
            { _id: courseId },
          ];
          const updatedUser = {
            ...user,
            enrolledCourses: updatedEnrolledCourses,
          };
          updateUserData(updatedUser);
        }

        // Force re-render by setting isEnrolled to true
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error("Failed to enroll in course:", err);
      throw err instanceof Error
        ? err
        : new Error("Failed to enroll in course");
    }
  };

  const handleContinueLearning = () => {
    router.push(`/courses/${courseId}/learn`);
  };

  const handleDownloadResource = async (resourceId: string) => {
    if (!isEnrolled) return;

    try {
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

        toast.success("Your resource download has started");
      } else {
        throw new Error("No download URL available");
      }
    } catch (error) {
      console.error("Failed to download resource:", error);
      toast.error("There was a problem downloading this resource");
    }
  };

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4" />
                <span>{course.rating} Rating</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span>{course.students?.length || 0} Students</span>
              </div>
              <div className="flex items-center">
                <Globe className="mr-1 h-4 w-4" />
                <span>{course.level}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-xl">
            <Image
              src={course.image || "/placeholder.svg"}
              alt={course.title}
              width={800}
              height={400}
              className="h-auto w-full object-cover"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="prose max-w-none">
                  {course.longDescription || course.description}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-medium">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements?.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-medium">
                    What you&apos;ll learn
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {course.objectives?.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Course Content</h3>
                    <p className="text-sm text-muted-foreground">
                      {totalLessons} lessons • {course.duration} total
                    </p>
                  </div>
                  {isEnrolled && (
                    <div className="text-sm text-muted-foreground">
                      {completedLessonsCount} of {totalLessons} completed
                    </div>
                  )}
                </div>

                <Accordion type="multiple" className="w-full">
                  {course.lessons?.map((lesson) => (
                    <AccordionItem key={lesson.id} value={lesson.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-4 text-left">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{lesson.duration}</span>
                            {lesson.completed && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6">
                          <p className="text-sm text-muted-foreground">
                            {typeof lesson.content === "string"
                              ? lesson.content
                              : lesson.content.description}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="instructor">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={course.instructor?.avatar}
                      alt={course.instructor?.name}
                    />
                    <AvatarFallback>
                      {course.instructor?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {course.instructor?.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {course.instructor?.title}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download course materials and resources
                </p>

                <ul className="space-y-2">
                  {course.resources?.map((resource: CourseResource) => (
                    <li key={resource.id}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!isEnrolled}
                        onClick={() => handleDownloadResource(resource.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {resource.title}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {resource.size}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>

                {!isEnrolled && (
                  <p className="text-sm text-muted-foreground">
                    Enroll in this course to access the resources
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {user?.role === "student" && (
          <div className="space-y-6">
            <div className="sticky top-20">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">Enroll now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Your progress</span>
                          <span className="font-medium">{courseProgress}%</span>
                        </div>
                        <Progress value={courseProgress} className="h-2" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {completedLessonsCount} of {totalLessons} lessons
                          completed
                        </p>
                        {courseProgressData?.lastAccessed && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Last accessed: {new Date(courseProgressData.lastAccessed).toLocaleString()}
                          </p>
                        )}
                        {courseProgressData && courseProgressData.timeSpent && courseProgressData.timeSpent > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Time spent: {Math.round(courseProgressData.timeSpent)} minutes
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleContinueLearning}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                  )}

                  <div className="space-y-2 text-sm">
                    <p className="text-center text-muted-foreground">
                      This course includes:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Play className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{totalLessons} lessons</span>
                      </li>
                      <li className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{course.duration} of content</span>
                      </li>
                      <li className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {course.resources?.length || 0} downloadable resources
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
