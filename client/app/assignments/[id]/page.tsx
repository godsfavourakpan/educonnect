import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";

// Mock data for a single assignment
const getAssignment = (id: string) => {
  const assignments = [
    {
      id: "1",
      title: "Introduction to Algebra",
      course: "Mathematics 101",
      courseId: "math101",
      description:
        "Complete the algebra problems in Chapter 3 of the textbook. Show all your work and explain your reasoning for each step.",
      dueDate: "2025-03-25T23:59:59",
      status: "pending",
      priority: "high",
      type: "quiz",
      instructions:
        "This assignment tests your understanding of basic algebraic concepts. You should complete all problems in Chapter 3, sections 3.1 through 3.5. Show all your work and explain your reasoning for each step. You may use a calculator for arithmetic but not for solving the equations.",
      resources: [
        { name: "Algebra Textbook Chapter 3", type: "pdf", url: "#" },
        {
          name: "Lecture Notes on Algebraic Expressions",
          type: "pdf",
          url: "#",
        },
        { name: "Practice Problems", type: "pdf", url: "#" },
      ],
      submissionType: "file",
      maxScore: 100,
      weight: "15% of final grade",
      instructor: "Dr. Sarah Johnson",
      createdAt: "2025-03-10T10:00:00",
      updatedAt: "2025-03-10T10:00:00",
    },
    {
      id: "2",
      title: "Essay on Modern Literature",
      course: "English Literature",
      courseId: "eng201",
      description:
        "Write a 1500-word essay analyzing the themes of identity and belonging in the assigned readings.",
      dueDate: "2025-03-20T23:59:59",
      status: "completed",
      priority: "medium",
      type: "essay",
      instructions:
        "Write a 1500-word essay analyzing the themes of identity and belonging in the assigned readings. Your essay should include a clear thesis statement, supporting evidence from the texts, and proper citations in MLA format. You should reference at least three of the assigned readings and include a works cited page.",
      resources: [
        { name: "Essay Writing Guidelines", type: "pdf", url: "#" },
        { name: "MLA Citation Guide", type: "pdf", url: "#" },
        { name: "Sample Essays", type: "pdf", url: "#" },
      ],
      submissionType: "text",
      maxScore: 100,
      weight: "20% of final grade",
      instructor: "Prof. Michael Chen",
      createdAt: "2025-03-05T14:30:00",
      updatedAt: "2025-03-05T14:30:00",
    },
  ];

  return assignments.find((a) => a.id === id);
};

export const generateMetadata = ({
  params,
}: {
  params: { id: string };
}): Metadata => {
  const assignment = getAssignment(params.id);

  console.log(assignment);

  if (!assignment) {
    return {
      title: "Assignment Not Found",
    };
  }

  return {
    title: `${assignment.title} | Assignments`,
    description: assignment.description,
  };
};

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const assignment = getAssignment(params.id);

  if (!assignment) {
    notFound();
  }

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          >
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            <Calendar className="mr-1 h-3 w-3" /> Upcoming
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" /> Unknown
          </Badge>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-green-500">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/assignments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Link>
        </Button>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground">
              <Link
                href={`/courses/${assignment.courseId}`}
                className="hover:underline"
              >
                {assignment.course}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(assignment.status)}
            {getPriorityBadge(assignment.priority)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                  <CardDescription>
                    Due on {formatDueDate(assignment.dueDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <p className="mt-1 text-muted-foreground">
                      {assignment.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Instructions</h3>
                    <p className="mt-1 text-muted-foreground">
                      {assignment.instructions}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium">Type</h4>
                      <p className="text-muted-foreground">
                        {assignment.type.charAt(0).toUpperCase() +
                          assignment.type.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Submission Format</h4>
                      <p className="text-muted-foreground">
                        {assignment.submissionType.charAt(0).toUpperCase() +
                          assignment.submissionType.slice(1)}{" "}
                        Upload
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Maximum Score</h4>
                      <p className="text-muted-foreground">
                        {assignment.maxScore} points
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Weight</h4>
                      <p className="text-muted-foreground">
                        {assignment.weight}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Instructor</h4>
                      <p className="text-muted-foreground">
                        {assignment.instructor}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Created</h4>
                      <p className="text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="submission" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Assignment</CardTitle>
                  <CardDescription>
                    {assignment.status === "completed"
                      ? "You have already submitted this assignment"
                      : `Submission deadline: ${formatDueDate(
                          assignment.dueDate
                        )}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignment.status === "completed" ? (
                    <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-medium text-green-800 dark:text-green-200">
                          Assignment Submitted
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                        You submitted this assignment on{" "}
                        {new Date().toLocaleDateString()}. Your submission is
                        being reviewed.
                      </p>
                      <Button variant="outline" className="mt-4" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Submission
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium">Upload Files</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Drag and drop your files here or click to browse
                        </p>
                        <div className="mt-4 flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Drop your files here or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF, DOCX, PPTX, XLSX (Max 10MB)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Comments (Optional)</h3>
                        <textarea
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          rows={4}
                          placeholder="Add any comments about your submission..."
                        />
                      </div>
                      <Button className="w-full sm:w-auto">
                        Submit Assignment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resources" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Materials provided for this assignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignment.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span>{resource.name}</span>
                          <Badge variant="outline">
                            {resource.type.toUpperCase()}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={resource.url}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Assignment Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Due Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDueDate(assignment.dueDate)}
                    </p>
                  </div>
                </div>
                {assignment.status === "completed" && (
                  <div className="flex items-start space-x-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Submitted</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/courses/${assignment.courseId}`}>
                  View Course
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
