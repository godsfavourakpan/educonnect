"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Users, AlertCircle, Video, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  getEnrolledCourses,
  getRecommendedCourses,
  getLearningStats,
  EnrolledCourse,
} from "@/api/student";
import { Course } from "@/api/course";
import { GenerateProgressButton } from "./GenerateProgressButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LearningStats {
  overallCompletion: number;
  coursesEnrolled: number;
}

interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  scheduledFor: Date;
  duration: number; // minutes
  status: "scheduled" | "live" | "completed" | "cancelled";
  attendees: number;
  maxAttendees: number;
  meetingLink: string;
  instructorName: string;
}

export function StudentDashboard() {
  const { user } = useAuth();
  
  // Mock live classes data (in a real app, this would come from an API)
  const liveClasses: LiveClass[] = [
    {
      id: "1",
      title: "Introduction to React Hooks",
      description: "Learn the basics of React Hooks and how to use them in your projects.",
      courseId: "c1",
      courseName: "Advanced React Development",
      scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
      duration: 60, // minutes
      status: "scheduled", // scheduled, live, completed, cancelled
      attendees: 12,
      maxAttendees: 50,
      meetingLink: "",
      instructorName: "John Smith"
    },
    {
      id: "2",
      title: "Database Design Principles",
      description: "Understanding the fundamentals of database design and normalization.",
      courseId: "c2",
      courseName: "Database Management Systems",
      scheduledFor: new Date(Date.now() + 3600000), // In 1 hour
      duration: 90, // minutes
      status: "live",
      attendees: 28,
      maxAttendees: 30,
      meetingLink: "https://meet.educonnect.com/2",
      instructorName: "Jane Doe"
    },
  ];

  const { 
    data: enrolledCourses = [], 
    isLoading: isLoadingEnrolled,
    error: enrolledError
  } = useQuery<EnrolledCourse[]>({
    queryKey: ["enrolledCourses"],
    queryFn: getEnrolledCourses,
    enabled: !!user?._id,
  });

  const { 
    data: recommendedCourses = [], 
    isLoading: isLoadingRecommended,
    error: recommendedError
  } = useQuery<Course[]>({
    queryKey: ["recommendedCourses"],
    queryFn: getRecommendedCourses,
    enabled: !!user?._id,
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<LearningStats>({
    queryKey: ["learningStats"],
    queryFn: getLearningStats,
    enabled: !!user?._id,
  });

  // Check if any data is still loading
  const isLoading = isLoadingEnrolled || isLoadingRecommended || isLoadingStats;
  
  // Check if there are any errors
  const hasErrors = enrolledError || recommendedError || statsError;

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here&#39;s what&#39;s happening with your learning journey today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/courses">Continue Learning</Link>
          </Button>
        </div>
      </div>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>
                Your overall progress across all courses
              </CardDescription>
            </div>
            <GenerateProgressButton />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Overall Completion</p>
                <p className="text-2xl font-bold">
                  {stats?.overallCompletion || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Courses Enrolled</p>
                <p className="text-2xl font-bold">
                  {stats?.coursesEnrolled || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Completed Courses</p>
                <p className="text-2xl font-bold">
                  {enrolledCourses.filter(c => c.progress === 100).length}
                </p>
              </div>
            </div>
            <Progress value={stats?.overallCompletion || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <div>
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Your Enrolled Courses
        </h2>
        {enrolledCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              You haven&#39;t enrolled in any courses yet.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="relative h-[120px]">
                  <Image
                    src={
                      course.image || "/placeholder.svg?height=120&width=200"
                    }
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Progress: {course.progress}%
                    </p>
                    <Badge variant="outline">
                      {course.completedLessons} / {course.lessons?.length || 0}{" "}
                      Lessons
                    </Badge>
                  </div>
                  <Progress value={course.progress} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Play className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Next Lesson
                        </p>
                        <p className="text-sm font-medium">
                          {course.nextLesson?.title || "No upcoming lessons"}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" size="sm" asChild>
                      <Link href={`/courses/${course._id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Live Classes */}
      <div>
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Live Classes
        </h2>
        {liveClasses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No live classes available at the moment.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {liveClasses.map((liveClass) => (
              <Card key={liveClass.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                    <Badge
                      variant={liveClass.status === "live" ? "default" : 
                        liveClass.status === "scheduled" ? "outline" : 
                        liveClass.status === "completed" ? "secondary" : "destructive"}
                    >
                      {liveClass.status === "live" ? "Live Now" : 
                        liveClass.status === "scheduled" ? "Upcoming" : 
                        liveClass.status === "completed" ? "Completed" : "Cancelled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {liveClass.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(liveClass.scheduledFor).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(liveClass.scheduledFor).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(
                            new Date(liveClass.scheduledFor).getTime() + liveClass.duration * 60000
                          ).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <span>Course: {liveClass.courseName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {liveClass.attendees}/{liveClass.maxAttendees} attendees
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">Instructor: {liveClass.instructorName}</p>
                  </div>
                  {liveClass.status === "live" ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Video className="mr-2 h-4 w-4" />
                      Join Live Class
                    </Button>
                  ) : liveClass.status === "scheduled" ? (
                    <Button className="w-full" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Courses */}
      <div>
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Recommended For You
        </h2>
        {recommendedCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No recommended courses available at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="relative h-[120px]">
                  <Image
                    src={
                      course.image || "/placeholder.svg?height=120&width=200"
                    }
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {course.rating || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {course.numberOfStudents || 0} students
                      </span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link href={`/courses/${course._id}`}>View Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
