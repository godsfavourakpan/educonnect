/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileUp,
  MessageSquare,
  Plus,
  PlusCircle,
  Video,
  Calendar,
  Users,
  Clock,
  Play,
  Pencil,
  Trash2,
} from "lucide-react";
import { getCoursesForInstructor } from "@/api/course";
import type { Course } from "@/api/course";
import { useQuery } from "@tanstack/react-query";
import liveClassApi, { ILiveClass as ApiLiveClass } from "@/api/live-class.api";

interface CourseResponse {
  courses: Course[];
}

// Local interface for live classes in the dashboard
interface ILiveClass {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  scheduledFor: Date;
  duration: number;
  status: string;
  attendees: number;
  maxAttendees: number;
  meetingLink: string;
}

// Function to transform API live class to local format
const transformApiLiveClass = (apiClass: ApiLiveClass): ILiveClass => {
  return {
    id: apiClass._id,
    title: apiClass.title,
    description: apiClass.description,
    courseId: apiClass.courseId || apiClass.subject,
    courseName: apiClass.subject,
    scheduledFor: new Date(apiClass.scheduledFor || apiClass.startTime),
    duration: 60, // Default duration if not provided
    status: apiClass.isLive ? "live" : "scheduled",
    attendees: apiClass.participants?.length || 0,
    maxAttendees: apiClass.maxParticipants || 50,
    meetingLink: apiClass.meetingUrl,
  };
};

export function TutorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSchedulingClass, setIsSchedulingClass] = useState(false);
  const [liveClasses, setLiveClasses] = useState<ILiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newLiveClass, setNewLiveClass] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledFor: new Date(),
    duration: 60,
    maxAttendees: 50,
  });
  const [showCreateLiveClassModal, setShowCreateLiveClassModal] =
    useState(false);

  // Handle scheduling a new live class
  const handleScheduleLiveClass = () => {
    // Open the scheduling dialog
    setIsSchedulingClass(true);
  };

  // Handle creating a new live class
  const handleCreateLiveClass = async (data: {
    title: string;
    description: string;
    subject: string;
    scheduledFor: Date;
  }) => {
    try {
      setIsLoading(true);
      
      // Create the live class data object
      // We'll use temporary placeholder values for meetingUrl and meetingId
      // The backend will replace these with actual values when the class is started
      const liveClassData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        scheduledFor: data.scheduledFor.toISOString(),
        startTime: data.scheduledFor.toISOString(),
        meetingUrl: `http://localhost:3000/live-classes/${Date.now()}`,
        meetingId: `meeting-${Date.now()}`,
      };

      // Call API to create the live class
      const response = await liveClassApi.createLiveClass(liveClassData);
      console.log("Live class created:", response);
      
      // Get the created live class data
      const liveClass = 'liveClass' in response ? response.liveClass : response;

      // Show success message
      toast({
        title: "Live class scheduled",
        description: "Your live class has been scheduled successfully!",
        variant: "default",
      });

      // Close the dialog and refresh the list
      setIsSchedulingClass(false);
      setNewLiveClass({
        title: "",
        description: "",
        courseId: "",
        scheduledFor: new Date(),
        duration: 60,
        maxAttendees: 50,
      });
      
      // Refresh the list to show the new class
      fetchLiveClasses();
    } catch (error) {
      console.error("Error creating live class:", error);
      toast({
        title: "Failed to schedule live class",
        description:
          "There was an error scheduling your live class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting a live class
  const handleStartLiveClass = async (liveClassId: string) => {
    try {
      setIsLoading(true);
      // Call API to start the live class
      const response = await liveClassApi.startLiveClass(liveClassId);
      console.log("Live class started:", response);

      // Extract meeting URL from response based on the response structure
      let meetingUrl = '';
      let meetingId = '';
      
      if ('meetingUrl' in response) {
        meetingUrl = response.meetingUrl;
        meetingId = response.meetingId || '';
      } else if ('liveClass' in response && response.liveClass.meetingUrl) {
        meetingUrl = response.liveClass.meetingUrl;
        meetingId = response.liveClass.meetingId || '';
      }
      
      // If no meeting URL is found, use a fallback URL
      if (!meetingUrl) {
        meetingUrl = `http://localhost:3000/live-classes/${liveClassId}`;
      }

      // Show success message
      toast({
        title: "Live class started",
        description:
          "You've successfully started the live class. Redirecting to the session...",
        variant: "default",
      });

      // Navigate to the live class session after a short delay
      setTimeout(() => {
        // For localhost URLs, use router.push to navigate within the app
        if (meetingUrl.includes('localhost:3000')) {
          const path = meetingUrl.split('localhost:3000')[1];
          router.push(path);
        } else if (meetingUrl.startsWith('http')) {
          // For external URLs, open in a new tab
          window.open(meetingUrl, '_blank');
        } else {
          // Fallback to the live class page
          router.push(`/live-classes/${liveClassId}`);
        }
      }, 1500);

      // Refresh the list to update the status
      fetchLiveClasses();
    } catch (error) {
      console.error("Error starting live class:", error);
      toast({
        title: "Failed to start live class",
        description:
          "There was an error starting the live class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live classes
  const fetchLiveClasses = async () => {
    try {
      setIsLoading(true);
      const response = await liveClassApi.getLiveClasses();
      
      // Handle different response structures
      let apiClasses: ApiLiveClass[] = [];
      
      if (Array.isArray(response)) {
        apiClasses = response;
      } else if (response && typeof response === 'object') {
        // Type guard for response with data property
        if ('data' in response && Array.isArray(response.data)) {
          apiClasses = response.data;
        } 
        // Type guard for response with liveClasses property
        else if ('liveClasses' in response && Array.isArray(response.liveClasses)) {
          apiClasses = response.liveClasses;
        }
      }
      
      // Transform API classes to local format
      const transformedClasses = apiClasses.map(transformApiLiveClass);
      setLiveClasses(transformedClasses);
    } catch (error) {
      console.error("Error fetching live classes:", error);
      toast({
        title: "Failed to load live classes",
        description: "There was an error loading your live classes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle cancelling a live class
  const handleCancelLiveClass = async (id: string) => {
    try {
      setIsLoading(true);
      // Call API to cancel the live class
      const response = await liveClassApi.endLiveClass(id);
      console.log("Live class cancelled:", response);

      // Show success message
      toast({
        title: "Live class cancelled",
        description: "The live class has been cancelled successfully.",
        variant: "default",
      });

      // Refresh the list
      fetchLiveClasses();
    } catch (error) {
      console.error("Error cancelling live class:", error);
      toast({
        title: "Failed to cancel live class",
        description:
          "There was an error cancelling the live class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    data,
    isLoading: isCoursesLoading,
    error,
  } = useQuery<CourseResponse>({
    queryKey: ["courses", user?._id],
    queryFn: () => getCoursesForInstructor(user?._id || ""),
    enabled: !!user?._id && user?.role === "tutor", // Only fetch if we have a tutor user
    retry: false, // Don't retry on error
  });

  console.log(user);

  // Calculate dashboard stats
  const totalStudents = data?.courses?.reduce(
    (sum, course) => sum + (course.students?.length || 0),
    0
  );
  const activeCourses = data?.courses?.length;

  // If still loading auth, show loading state
  if (isLoading) {
    return <div className="container p-8">Loading...</div>;
  }

  // If not a tutor, show unauthorized message
  if (!user || user.role !== "tutor") {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
        <p className="mt-2">
          You must be logged in as a tutor to access this dashboard.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
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
            Here&apos;s what&apos;s happening with your teaching today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/courses/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
          {/* <Button variant="outline" asChild>
            <Link href="/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </Button> */}
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Live Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveClasses?.length}</div>
                <p className="text-xs text-muted-foreground">
                  {liveClasses?.filter((c) => c.status === "scheduled").length}{" "}
                  upcoming
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCourses}</div>
                <p className="text-xs text-muted-foreground">
                  Currently teaching
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">5 need grading</p>
              </CardContent>
            </Card>{" "}
          </div>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>
                Manage and update your current courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCoursesLoading ? (
                <div className="text-center py-4">Loading courses...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">
                  {error instanceof Error
                    ? error.message
                    : "Error loading courses"}
                </div>
              ) : data?.courses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No courses yet.</p>
                  <Button asChild className="mt-2">
                    <Link href="/courses/create">Create your first course</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.courses.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between space-x-4"
                    >
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium leading-none">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{course.category}</Badge>
                          <Badge variant="outline">{course.level}</Badge>
                          <span className="text-muted-foreground">
                            {course.students?.length || 0} students
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" asChild>
                        <Link href={`/courses/${course._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments to Grade */}
          <Card>
            <CardHeader>
              <CardTitle>Assignments to Grade</CardTitle>
              <CardDescription>
                Recent submissions that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add logic to fetch and display assignments */}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/assignments">View All Assignments</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>
                  Create and manage your courses
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/courses/create">
                  <Plus className="mr-1 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant="outline">
                          {course.students?.length || 0} students
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/courses/${course._id}/lessons`}>
                          <BookOpen className="mr-1 h-4 w-4" />
                          Lessons
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/courses/${course._id}/assessments`}>
                          <FileUp className="mr-1 h-4 w-4" />
                          Assessments
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/courses/edit?courseId=${course._id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/courses/create">
                  <Plus className="mr-1 h-4 w-4" />
                  Create New Course
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Create, manage, and grade assessments
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/assessments/create">
                  <Plus className="mr-1 h-4 w-4" />
                  Create Assessment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-medium">Pending Submissions</h3>
                  <div className="space-y-3">
                    {/* Add logic to fetch and display pending submissions */}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Create New Assessment</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">Quiz</CardTitle>
                        <CardDescription>
                          Create a quick assessment with multiple choice
                          questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Perfect for checking student understanding with
                          multiple choice, true/false, and multiple select
                          questions.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" asChild>
                          <Link href="/assessments/create?type=quiz">
                            Create Quiz
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">Exam</CardTitle>
                        <CardDescription>
                          Create a comprehensive exam with various question
                          types
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Ideal for midterms and finals with a mix of question
                          types and timed sections.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" asChild>
                          <Link href="/assessments/create?type=exam">
                            Create Exam
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Classes Tab */}
        <TabsContent value="live-classes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Classes</CardTitle>
                <CardDescription>
                  Schedule and manage your live teaching sessions
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateLiveClassModal(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Schedule Class
              </Button>
            </CardHeader>
            <CardContent>
              {liveClasses.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-1 divide-y">
                      {liveClasses.map((liveClass) => (
                        <div key={liveClass.id} className="p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {liveClass.title}
                                </h3>
                                <Badge
                                  variant={
                                    liveClass.status === "live"
                                      ? "default"
                                      : liveClass.status === "scheduled"
                                      ? "outline"
                                      : liveClass.status === "completed"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {liveClass.status === "live"
                                    ? "Live Now"
                                    : liveClass.status === "scheduled"
                                    ? "Upcoming"
                                    : liveClass.status === "completed"
                                    ? "Completed"
                                    : "Cancelled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {liveClass.description}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>
                                    {liveClass.scheduledFor.toLocaleDateString(
                                      undefined,
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>
                                    {liveClass.scheduledFor.toLocaleTimeString(
                                      undefined,
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                    {" - "}
                                    {new Date(
                                      liveClass.scheduledFor.getTime() +
                                        liveClass.duration * 60000
                                    ).toLocaleTimeString(undefined, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{liveClass.courseName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>
                                    {liveClass.attendees}/
                                    {liveClass.maxAttendees} attendees
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {liveClass.status === "scheduled" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleStartLiveClass(liveClass.id)
                                  }
                                >
                                  <Play className="mr-1 h-3.5 w-3.5" />
                                  Start Class
                                </Button>
                              )}
                              {liveClass.status === "live" && (
                                <Button size="sm">
                                  <Video className="mr-1 h-3.5 w-3.5" />
                                  Join Class
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditLiveClass(liveClass.id)
                                }
                              >
                                <Pencil className="mr-1 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleCancelLiveClass(liveClass.id)
                                }
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                {liveClass.status === "scheduled"
                                  ? "Cancel"
                                  : "Delete"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No live classes scheduled
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Schedule your first live class to engage with your students
                    in real-time.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateLiveClassModal(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Schedule Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Live Class Modal */}
          {showCreateLiveClassModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Schedule a Live Class</CardTitle>
                  <CardDescription>
                    Fill in the details to schedule a new live class session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        className="w-full rounded-md border border-input px-3 py-2"
                        placeholder="Introduction to React Hooks"
                        value={newLiveClass.title}
                        onChange={(e) =>
                          setNewLiveClass({
                            ...newLiveClass,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="w-full rounded-md border border-input px-3 py-2"
                        rows={3}
                        placeholder="Brief description of what will be covered in this session"
                        value={newLiveClass.description}
                        onChange={(e) =>
                          setNewLiveClass({
                            ...newLiveClass,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="course" className="text-sm font-medium">
                        Course
                      </label>
                      <select
                        id="course"
                        className="w-full rounded-md border border-input px-3 py-2"
                        value={newLiveClass.courseId}
                        onChange={(e) =>
                          setNewLiveClass({
                            ...newLiveClass,
                            courseId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a course</option>
                        {data?.courses?.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">
                          Date
                        </label>
                        <input
                          id="date"
                          type="date"
                          className="w-full rounded-md border border-input px-3 py-2"
                          value={
                            newLiveClass.scheduledFor
                              .toISOString()
                              .split("T")[0]
                          }
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            const currentDate = new Date(
                              newLiveClass.scheduledFor
                            );
                            date.setHours(currentDate.getHours());
                            date.setMinutes(currentDate.getMinutes());
                            setNewLiveClass({
                              ...newLiveClass,
                              scheduledFor: date,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="time" className="text-sm font-medium">
                          Time
                        </label>
                        <input
                          id="time"
                          type="time"
                          className="w-full rounded-md border border-input px-3 py-2"
                          value={`${String(
                            newLiveClass.scheduledFor.getHours()
                          ).padStart(2, "0")}:${String(
                            newLiveClass.scheduledFor.getMinutes()
                          ).padStart(2, "0")}`}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const date = new Date(newLiveClass.scheduledFor);
                            date.setHours(hours);
                            date.setMinutes(minutes);
                            setNewLiveClass({
                              ...newLiveClass,
                              scheduledFor: date,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="duration"
                          className="text-sm font-medium"
                        >
                          Duration (minutes)
                        </label>
                        <input
                          id="duration"
                          type="number"
                          min="15"
                          step="15"
                          className="w-full rounded-md border border-input px-3 py-2"
                          value={newLiveClass.duration}
                          onChange={(e) =>
                            setNewLiveClass({
                              ...newLiveClass,
                              duration: parseInt(e.target.value) || 60,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="maxAttendees"
                          className="text-sm font-medium"
                        >
                          Max Attendees
                        </label>
                        <input
                          id="maxAttendees"
                          type="number"
                          min="1"
                          className="w-full rounded-md border border-input px-3 py-2"
                          value={newLiveClass.maxAttendees}
                          onChange={(e) =>
                            setNewLiveClass({
                              ...newLiveClass,
                              maxAttendees: parseInt(e.target.value) || 50,
                            })
                          }
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsSchedulingClass(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Create form data from the newLiveClass state
                      const formData = {
                        title: newLiveClass.title,
                        description: newLiveClass.description,
                        subject: newLiveClass.courseId, // Using courseId as subject
                        scheduledFor: newLiveClass.scheduledFor,
                      };
                      handleCreateLiveClass(formData);
                    }}
                  >
                    Schedule Class
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
